use super::*;
use nofy_agent_runtime::{
    Error, RunContext, ToolCatalog, ToolEntry,
    registry::{ModuleDescriptor, ModuleFactory, ModuleInstance, ModuleKind},
};
use nofy_tool_runtime::{
    ToolCallContext, ToolDispatch, ToolError, ToolStream, TypedToolOutput, terminal_only,
};
use nofy_tool_types::ToolDefinition;
use serde_json::Value;
use std::collections::BTreeMap;

pub(crate) struct ProposalFactory(pub Evolution);

impl ModuleFactory for ProposalFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: "tool.sdk_evolution".into(),
            revision: "1".into(),
            kind: ModuleKind::ToolPack,
            config_schema: json!({"type":"object","additionalProperties":false}),
            input_schema: None,
            output_schema: None,
            required_capabilities: Default::default(),
            dependencies: Default::default(),
        }
    }

    fn build(
        &self,
        _: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> std::result::Result<ModuleInstance, Error> {
        let mut catalog = ToolCatalog::new();
        catalog.insert(ToolEntry {
            definition: ToolDefinition::function("sdk_propose_prompt", Some("Submit a replacement Omni prompt for the Host's preauthorized evaluation. The receipt tracks evaluation, activation and rollback."),
                json!({"type":"object","additionalProperties":false,"required":["prompt"],"properties":{"prompt":{"type":"string","minLength":1,"maxLength":16384}}})),
            dispatch: Arc::new(ProposalTool(self.0.clone())),
        })?;
        Ok(ModuleInstance::ToolPack(catalog))
    }
}

struct ProposalTool(Evolution);

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Arguments {
    prompt: String,
}

#[async_trait::async_trait]
impl ToolDispatch for ProposalTool {
    fn is_resumable(&self) -> bool {
        true
    }

    fn recovery_identity(&self) -> Option<String> {
        Some("omni-prompt-proposal/v1".into())
    }

    async fn call(
        &self,
        id: nofy_tool_protocol::ToolId,
        args: Value,
        ctx: ToolCallContext,
    ) -> ToolStream<TypedToolOutput> {
        let result = async {
            if id.as_str() != "sdk_propose_prompt" {
                return Err(ToolError::invalid_arguments("invalid Omni evolution tool"));
            }
            let args: Arguments = serde_json::from_value(args)
                .map_err(|_| ToolError::invalid_arguments("expected a replacement prompt"))?;
            let context = ctx.get::<RunContext>().ok_or_else(|| {
                ToolError::invalid_arguments("Omni proposal requires an original managed run")
            })?;
            let receipt = self
                .0
                .propose(&context.run_id, args.prompt)
                .await
                .map_err(|error| ToolError::custom("omni_evolution", error.to_string()))?;
            serde_json::to_value(receipt)
                .map(|value| TypedToolOutput::from_value(id, value))
                .map_err(|_| {
                    ToolError::custom("omni_evolution", "could not encode proposal receipt")
                })
        }
        .await;
        terminal_only(result)
    }
}
