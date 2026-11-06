//! HTTP and process handlers use the same admitted executors as ordinary tools.
//! They receive a complete HookEvent as JSON and return a typed HookDecision.
use nofy_agent_runtime::{
    hooks::{HookDecision, HookEvent, HookHandler},
    registry::*,
    *,
};
use nofy_tool_runtime::ToolDispatch;
use serde_json::{Value, json};
use std::{collections::BTreeMap, sync::Arc};

pub struct ExecutorHookFactory;
impl ModuleFactory for ExecutorHookFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: "hook.executor".into(),
            revision: "1".into(),
            kind: ModuleKind::HookHandler,
            config_schema: json!({"type":"object","additionalProperties":false,"required":["tool"],"properties":{"tool":{"type":"string","minLength":1}}}),
            input_schema: None,
            output_schema: None,
            dependencies: BTreeMap::from([("executor".into(), ModuleKind::ToolPack)]),
            required_capabilities: Default::default(),
        }
    }
    fn build(
        &self,
        config: &Value,
        dependencies: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        #[derive(serde::Deserialize)]
        #[serde(deny_unknown_fields)]
        struct Config {
            tool: String,
        }
        let config: Config = serde_json::from_value(config.clone())
            .map_err(|e| Error::Composition(e.to_string()))?;
        let Some(ModuleInstance::ToolPack(catalog)) = dependencies.get("executor") else {
            return Err(Error::Composition(
                "hook executor requires a tool pack dependency".into(),
            ));
        };
        let entry = catalog.get(&config.tool).ok_or_else(|| {
            Error::Composition("hook executor tool is not in the bound pack".into())
        })?;
        if entry.dispatch.is_resumable() {
            return Err(Error::Composition(
                "recoverable workflow handlers require the workflow control adapter".into(),
            ));
        }
        Ok(ModuleInstance::HookHandler(Arc::new(ExecutorHandler {
            tool: config.tool,
            dispatch: entry.dispatch.clone(),
            definition: entry.definition.clone(),
        })))
    }
}
struct ExecutorHandler {
    tool: String,
    dispatch: Arc<dyn ToolDispatch>,
    definition: nofy_tool_types::ToolDefinition,
}
#[async_trait::async_trait]
impl HookHandler for ExecutorHandler {
    fn resume_identity(&self, context: &RunContext) -> Option<String> {
        governance::receipt_identity(context)
            .or_else(|| hooks::primitive::recovery_identity(context))
    }
    async fn handle(&self, event: &HookEvent, context: &RunContext) -> Result<HookDecision, Error> {
        // Keep call IDs bounded even though an event's durable identity is a
        // canonical tuple. The complete event identity remains in the payload.
        let ctx = ToolCallContextForHook::build(event, context)?;
        let call = ToolCall {
            id: ctx.call_id.as_str().into(),
            name: self.tool.clone(),
            arguments: serde_json::to_value(event)
                .map_err(|e| Error::Composition(e.to_string()))?,
        };
        settings::validate_json_value(&self.definition.function.parameters, &call.arguments)?;
        if let Some(result) =
            hooks::primitive::replay(context, &call, "hook.executor:1", self.dispatch.as_ref())
                .await?
        {
            let output = result.map_err(|error| Error::Tool(error.to_string()))?;
            return serde_json::from_value(output.value)
                .map_err(|error| Error::Composition(format!("invalid hook decision: {error}")));
        }
        match policy::admit_required(&call, &RunState::default(), context).await? {
            Admission::Allow => {}
            Admission::Deny(reason) => return Ok(HookDecision::Deny { reason }),
            Admission::Pause(reason) => return Ok(HookDecision::Pause { reason }),
        }
        hooks::primitive::start(context, &call, "hook.executor:1", self.dispatch.as_ref()).await?;
        let output = governance::dispatch_tool(
            self.dispatch.as_ref(),
            &call,
            ctx,
            &call.id,
            "hook.executor:1",
            false,
            |_| async { Ok(()) },
        )
        .await?;
        hooks::primitive::complete(
            context,
            &call,
            "hook.executor:1",
            self.dispatch.as_ref(),
            &output,
        )
        .await?;
        let output = output.map_err(|e| Error::Tool(e.to_string()))?;
        serde_json::from_value(output.value)
            .map_err(|e| Error::Composition(format!("invalid hook decision: {e}")))
    }
}
struct ToolCallContextForHook;
impl ToolCallContextForHook {
    fn build(
        event: &HookEvent,
        context: &RunContext,
    ) -> Result<nofy_tool_runtime::ToolCallContext, Error> {
        use sha2::{Digest, Sha256};
        let invocation = context
            .capabilities
            .get::<nofy_agent_runtime::hooks::HookInvocation>();
        let identity = serde_json::to_vec(&(
            &event.id,
            invocation
                .as_ref()
                .map(|invocation| &invocation.hook_identity),
        ))
        .map_err(|e| Error::Composition(e.to_string()))?;
        nofy_agent_runtime::tools::call_context(
            &format!("hook_{:x}", Sha256::digest(identity)),
            context,
        )
    }
}
