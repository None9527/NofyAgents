//! Pure reusable policies plugged into actual recipe boundaries. The original
//! coding host keeps calling the same canonical helpers.
use super::*;
use crate::coding::{length::*, stationarity::*};
use sha2::{Digest, Sha256};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(default, deny_unknown_fields)]
pub struct RepeatConfig {
    pub problematic_tools: BTreeSet<String>,
    pub true_noop_tools: BTreeSet<String>,
    pub command_argument: String,
}
impl Default for RepeatConfig {
    fn default() -> Self {
        Self {
            problematic_tools: Default::default(),
            true_noop_tools: Default::default(),
            command_argument: "command".into(),
        }
    }
}
pub struct RepeatStage {
    config: RepeatConfig,
}
impl RepeatStage {
    pub fn new(config: RepeatConfig) -> Result<Self, Error> {
        if config.command_argument.is_empty()
            || config.command_argument.len() > 128
            || config.problematic_tools.len() > 1024
            || config.true_noop_tools.len() > 1024
        {
            return Err(Error::Composition(
                "repeat policy configuration exceeds limits".into(),
            ));
        }
        let names = config
            .problematic_tools
            .iter()
            .chain(&config.true_noop_tools);
        if names.clone().map(String::len).sum::<usize>() > 65536 {
            return Err(Error::Composition(
                "repeat tool classifications exceed 64 KiB".into(),
            ));
        }
        for name in names {
            nofy_tool_protocol::ToolId::new(name).map_err(|e| Error::Composition(e.to_string()))?;
        }
        Ok(Self { config })
    }
}
fn canonical(value: &Value) -> Value {
    match value {
        Value::Object(fields) => Value::Object(
            fields
                .iter()
                .map(|(key, value)| (key.clone(), canonical(value)))
                .collect::<BTreeMap<_, _>>()
                .into_iter()
                .collect(),
        ),
        Value::Array(values) => Value::Array(values.iter().map(canonical).collect()),
        value => value.clone(),
    }
}
impl AgentStage for RepeatStage {
    fn supports(&self, boundary: Boundary) -> bool {
        boundary == Boundary::AfterTool
    }
    fn evaluate(&self, input: &StageInput<'_>, _: &RunContext) -> Result<StageEffect, Error> {
        let call = input.call.ok_or_else(|| {
            Error::Composition("repeat policy needs an actual tool result".into())
        })?;
        let result = input.result.ok_or_else(|| {
            Error::Composition("repeat policy needs an actual tool result".into())
        })?;
        let (name, args) = if call.name == "use_tool" {
            match (
                call.arguments.get("tool_name").and_then(Value::as_str),
                call.arguments.get("tool_input"),
            ) {
                (Some(name), Some(args)) => (name, args),
                _ => (call.name.as_str(), &call.arguments),
            }
        } else {
            (call.name.as_str(), &call.arguments)
        };
        let signature = format!(
            "{:x}",
            Sha256::digest(
                serde_json::to_vec(&(name, canonical(args)))
                    .map_err(|e| Error::Composition(e.to_string()))?
            )
        );
        let mut run: IdenticalToolCallRun = if input.data.is_null() {
            Default::default()
        } else {
            serde_json::from_value(input.data.clone())
                .map_err(|e| Error::Checkpoint(e.to_string()))?
        };
        let noop = !result.is_error
            && self.config.true_noop_tools.contains(name)
            && args
                .get(&self.config.command_argument)
                .and_then(Value::as_str)
                .is_some_and(|command| command.trim() == "true");
        run.observe(
            &signature,
            name,
            result.is_error || self.config.problematic_tools.contains(name),
            noop,
        );
        let action = if run.run_len >= run.hard_stop_threshold() {
            StageAction::Limit {
                reason: format!(
                    "repeated identical tool call: {name} ({} executions)",
                    run.run_len
                ),
            }
        } else if run.take_nudge() {
            StageAction::Feedback {
                content: format!(
                    "Tool {name} has repeated the same action {} times. Use the result to change your approach instead of repeating it.",
                    run.run_len
                ),
            }
        } else {
            StageAction::Next
        };
        Ok(StageEffect {
            data: Some(serde_json::to_value(run).map_err(|e| Error::Checkpoint(e.to_string()))?),
            action,
        })
    }
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(default, deny_unknown_fields)]
pub struct LengthConfig {
    pub max_continues: u32,
    pub max_accumulated_bytes: u32,
}
impl Default for LengthConfig {
    fn default() -> Self {
        Self {
            max_continues: 2,
            max_accumulated_bytes: 1_048_576,
        }
    }
}
pub struct LengthStage {
    config: LengthConfig,
}
impl LengthStage {
    pub fn new(config: LengthConfig) -> Result<Self, Error> {
        if config.max_continues > 16 || !(1..=1_048_576).contains(&config.max_accumulated_bytes) {
            return Err(Error::Composition(
                "invalid length continuation limits".into(),
            ));
        }
        Ok(Self { config })
    }
}
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct LengthState {
    salvage: LengthSalvage,
    active: bool,
}
impl AgentStage for LengthStage {
    fn supports(&self, boundary: Boundary) -> bool {
        boundary == Boundary::BeforeStop
    }
    fn evaluate(&self, input: &StageInput<'_>, _: &RunContext) -> Result<StageEffect, Error> {
        if input.state.completion_info.refusal.is_some()
            || input.state.completion_info.structured_output.is_some()
        {
            return Ok(StageEffect::default());
        }
        let mut state: LengthState = if input.data.is_null() {
            LengthState {
                salvage: LengthSalvage::new(Some(self.config.max_continues)),
                active: false,
            }
        } else {
            serde_json::from_value(input.data.clone())
                .map_err(|e| Error::Checkpoint(e.to_string()))?
        };
        let length = matches!(
            input.state.completion_info.stop_reason.as_deref(),
            Some("length" | "max_tokens" | "max_output_tokens")
        );
        let action = if length {
            match state.salvage.on_length_stop() {
                SalvageStep::Continue { inject_reminder } => {
                    state.active = true;
                    StageAction::ContinueText {
                        feedback: inject_reminder.then(|| LENGTH_CONTINUE_REMINDER_BODY.into()),
                        max_bytes: self.config.max_accumulated_bytes,
                    }
                }
                SalvageStep::Exhaust | SalvageStep::None if state.active => {
                    state.active = false;
                    StageAction::CompleteText {
                        max_bytes: self.config.max_accumulated_bytes,
                    }
                }
                _ => StageAction::Next,
            }
        } else if state.active {
            state.active = false;
            state.salvage = LengthSalvage::new(Some(self.config.max_continues));
            StageAction::CompleteText {
                max_bytes: self.config.max_accumulated_bytes,
            }
        } else {
            StageAction::Next
        };
        Ok(StageEffect {
            data: Some(serde_json::to_value(state).map_err(|e| Error::Checkpoint(e.to_string()))?),
            action,
        })
    }
}
pub struct RepeatStageFactory;
pub struct LengthStageFactory;
fn descriptor(factory: &str, schema: Value) -> ModuleDescriptor {
    ModuleDescriptor {
        factory: factory.into(),
        revision: "1".into(),
        kind: ModuleKind::Stage,
        config_schema: schema,
        input_schema: None,
        output_schema: None,
        dependencies: Default::default(),
        required_capabilities: Default::default(),
    }
}
impl ModuleFactory for RepeatStageFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        descriptor(
            "stage.repeat",
            json!({"type":"object","additionalProperties":false,"properties":{
        "problematic_tools":{"type":"array","maxItems":1024,"uniqueItems":true,"items":{"type":"string","minLength":1}},
        "true_noop_tools":{"type":"array","maxItems":1024,"uniqueItems":true,"items":{"type":"string","minLength":1}},
        "command_argument":{"type":"string","minLength":1,"maxLength":128}}}),
        )
    }
    fn build(
        &self,
        config: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        crate::settings::validate_json_value(&self.descriptor().config_schema, config)?;
        Ok(ModuleInstance::Stage(Arc::new(RepeatStage::new(
            serde_json::from_value(config.clone())
                .map_err(|e| Error::Composition(e.to_string()))?,
        )?)))
    }
}
impl ModuleFactory for LengthStageFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        descriptor(
            "stage.length",
            json!({"type":"object","additionalProperties":false,"properties":{
        "max_continues":{"type":"integer","minimum":0,"maximum":16},"max_accumulated_bytes":{"type":"integer","minimum":1,"maximum":1048576}}}),
        )
    }
    fn build(
        &self,
        config: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        crate::settings::validate_json_value(&self.descriptor().config_schema, config)?;
        Ok(ModuleInstance::Stage(Arc::new(LengthStage::new(
            serde_json::from_value(config.clone())
                .map_err(|e| Error::Composition(e.to_string()))?,
        )?)))
    }
}
