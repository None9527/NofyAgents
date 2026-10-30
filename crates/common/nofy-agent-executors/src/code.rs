//! Optional pure JSON source methods. Workflow/Agent orchestration remains a
//! separate capability; this profile installs no external host functions.
mod rhai;
use crate::config::{self, JsonBinding, ToolContract};
use nofy_agent_runtime::{Error, registry::*};
use nofy_tool_runtime::{ToolCallContext, ToolDispatch, ToolStream, TypedToolOutput};
use serde::Deserialize;
use serde_json::{Value, json};
use std::{collections::BTreeMap, sync::Arc, time::Duration};
use tokio_util::sync::CancellationToken;
fn max_ops() -> u64 {
    100000
}
#[derive(Clone, Deserialize)]
#[serde(deny_unknown_fields)]
struct Config {
    contract: ToolContract,
    source: String,
    #[serde(default)]
    input: JsonBinding,
    #[serde(default = "max_ops")]
    max_operations: u64,
}
pub struct RhaiToolFactory;
impl ModuleFactory for RhaiToolFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        config::descriptor(
            "tool.rhai",
            "pure-json-v1",
            json!({"type":"object","additionalProperties":false,"required":["contract","source"],"properties":{
            "contract":config::contract_schema(),"source":{"type":"string","minLength":1,"maxLength":1048576},"input":{"$ref":"#/$defs/binding"},
            "max_operations":{"type":"integer","minimum":1,"maximum":10000000}
        },"$defs":{"binding":config::binding_schema()}}),
        )
    }
    fn build(
        &self,
        value: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        nofy_agent_runtime::settings::validate_json_value(&self.descriptor().config_schema, value)?;
        let config: Config = serde_json::from_value(value.clone())
            .map_err(|e| crate::composition(format!("tool.rhai: {e}")))?;
        config.contract.validate()?;
        config.input.validate()?;
        if config.source.trim().is_empty()
            || config.source.len() > 1048576
            || !(1..=10000000).contains(&config.max_operations)
        {
            return Err(crate::composition("invalid Rhai source or operation limit"));
        }
        rhai::validate(&config.source, config.max_operations).map_err(crate::composition)?;
        let contract = config.contract.clone();
        Ok(ModuleInstance::ToolPack(crate::catalog(
            &contract,
            Arc::new(Dispatch(config)),
        )?))
    }
}
struct Dispatch(Config);
struct CancelOnDrop(CancellationToken);
impl Drop for CancelOnDrop {
    fn drop(&mut self) {
        self.0.cancel();
    }
}
#[async_trait::async_trait]
impl ToolDispatch for Dispatch {
    async fn call(
        &self,
        id: nofy_tool_protocol::ToolId,
        args: Value,
        context: ToolCallContext,
    ) -> ToolStream<TypedToolOutput> {
        let operation = async {
            crate::validate_input(&self.0.contract, &args)?;
            let input = self.0.input.render(&args)?;
            if serde_json::to_vec(&input)
                .map_err(|_| crate::tool_error("input_mapping", "script input is not JSON"))?
                .len()
                > self.0.contract.max_input_bytes
            {
                return Err(crate::tool_error(
                    "input_limit",
                    "script input exceeds byte limit",
                ));
            }
            let cancel = context
                .get::<nofy_tool_runtime::Cancellation>()
                .map(|c| c.0.child_token())
                .unwrap_or_default();
            let _guard = CancelOnDrop(cancel.clone());
            let source = self.0.source.clone();
            let ops = self.0.max_operations;
            let engine_cancel = cancel.clone();
            let mut task =
                tokio::task::spawn_blocking(move || rhai::run(&source, input, ops, engine_cancel));
            let result = tokio::select! {biased;
                _=cancel.cancelled()=>Err(crate::tool_error("cancelled","script method cancelled")),
                result=tokio::time::timeout(Duration::from_millis(self.0.contract.timeout_ms),&mut task)=>match result {
                    Ok(result)=>result.map_err(|_|crate::tool_error("script_task","script task failed"))?,
                    Err(_)=>Err(crate::tool_error("timeout","script method timed out")),
                },
            }?;
            if serde_json::to_vec(&result)
                .map_err(|_| crate::tool_error("invalid_output", "script result is not JSON"))?
                .len()
                > self.0.contract.max_output_bytes
            {
                return Err(crate::tool_error(
                    "output_limit",
                    "script result exceeds byte limit",
                ));
            }
            crate::output(&self.0.contract, result)
                .map(|value| TypedToolOutput::from_value(id, value))
        };
        nofy_tool_runtime::terminal_only(operation.await)
    }
}
