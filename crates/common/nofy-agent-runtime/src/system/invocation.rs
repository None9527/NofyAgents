//! Per-invocation data is frozen into the existing executable snapshot. It
//! cannot replace code, module wires, policies or the published entry point.
use super::*;
use crate::program::ProgramSnapshot;
use serde_json::Value;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ProgramInterface {
    pub name: String,
    pub kind: String,
    pub accepts_message: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub parameters_schema: Option<Value>,
    #[serde(
        default,
        deserialize_with = "present_value",
        skip_serializing_if = "Option::is_none"
    )]
    pub default_parameters: Option<Value>,
}
pub(crate) fn present_value<'de, D: serde::Deserializer<'de>>(
    deserializer: D,
) -> Result<Option<Value>, D::Error> {
    Value::deserialize(deserializer).map(Some)
}

pub(crate) fn validate_parameters(value: &Value) -> Result<(), Error> {
    if serde_json::to_vec(value).map_or(true, |v| v.len() > 1024 * 1024) {
        return Err(Error::Composition("run parameters exceed 1 MiB".into()));
    }
    Ok(())
}

impl CompiledSystem {
    /// Omission preserves the published default; `Some(Value::Null)` is an
    /// explicit null input. The returned program is independent of that default.
    pub fn program_with_parameters(
        &self,
        name: &str,
        parameters: Option<Value>,
    ) -> Result<CompiledProgram, Error> {
        let original = self.program(name)?;
        let Some(parameters) = parameters else {
            return Ok(original.clone());
        };
        validate_parameters(&parameters)?;
        match &original.snapshot.program {
            ProgramSnapshot::Agent { .. } => Err(Error::Composition(
                "Agent programs accept messages through input, not parameters".into(),
            )),
            ProgramSnapshot::Tool { snapshot, call } => {
                let compiled = snapshot.restore(&self.registry)?;
                if let Some(schema) = compiled.runtime.tool_schema(&call.name)? {
                    crate::settings::validate_json_value(&schema, &parameters)?;
                }
                let call = ToolCall {
                    arguments: parameters,
                    ..call.clone()
                };
                CompiledProgram::for_tool(&compiled, call)
            }
            ProgramSnapshot::Event { snapshot } => {
                // Rebind only the payload after verifying the frozen producer
                // and host. Event ownership/operation remain in the release.
                let compiled = snapshot.restore(&self.registry)?;
                let mut definition = compiled.snapshot.definition;
                definition.payload = parameters;
                let event = crate::event_program::compile_event(definition, &self.registry)?;
                CompiledProgram::for_event(&event)
            }
            #[cfg(feature = "workflow")]
            ProgramSnapshot::Workflow { snapshot, .. } => {
                let compiled = snapshot.restore(&self.registry)?;
                crate::settings::validate_json_value(&compiled.entry().input_schema, &parameters)?;
                CompiledProgram::for_workflow(&compiled, parameters)
            }
        }
    }

    /// Schema and default data for a console/client. Dynamic ToolSource schemas
    /// remain unknown here and are checked by the original runtime at execution.
    pub fn program_interface(&self, name: &str) -> Result<ProgramInterface, Error> {
        let original = self.program(name)?;
        let (kind, schema, defaults) = match &original.snapshot.program {
            ProgramSnapshot::Agent { .. } => ("agent", None, None),
            ProgramSnapshot::Tool { snapshot, call } => {
                let compiled = snapshot.restore(&self.registry)?;
                (
                    "tool",
                    compiled.runtime.tool_schema(&call.name)?,
                    Some(call.arguments.clone()),
                )
            }
            ProgramSnapshot::Event { snapshot } => (
                "event",
                Some(snapshot.declaration.payload_schema.clone()),
                Some(snapshot.definition.payload.clone()),
            ),
            #[cfg(feature = "workflow")]
            ProgramSnapshot::Workflow { snapshot, input } => {
                let compiled = snapshot.restore(&self.registry)?;
                (
                    "workflow",
                    Some(compiled.entry().input_schema.clone()),
                    Some(input.clone()),
                )
            }
        };
        Ok(ProgramInterface {
            name: name.into(),
            kind: kind.into(),
            accepts_message: kind == "agent",
            parameters_schema: schema,
            default_parameters: defaults,
        })
    }
}
