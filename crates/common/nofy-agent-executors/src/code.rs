//! Optional pure JSON source methods. Workflow/Agent orchestration remains a
//! separate capability; this profile installs no external host functions.
mod context;
mod session;
pub use session::SessionPolicyFactory;
mod execution;
mod rhai;
use crate::config::{self, JsonBinding, ToolContract};
pub use context::ContextPolicyFactory;
pub use execution::{Executor, Request, Trusted};
use nofy_agent_runtime::{Error, registry::*};
use nofy_tool_runtime::{ToolCallContext, ToolDispatch, ToolStream, TypedToolOutput};
use serde::Deserialize;
use serde_json::{Value, json};
use std::{collections::BTreeMap, sync::Arc};
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
pub struct RhaiToolFactory {
    executor: Arc<dyn Executor>,
}
impl RhaiToolFactory {
    pub fn new(executor: Arc<dyn Executor>) -> Self {
        Self { executor }
    }
    /// No OS confinement: only an explicitly trusted SDK caller may select it.
    pub fn trusted() -> Self {
        Self::new(Arc::new(Trusted))
    }
}
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
            Arc::new(Dispatch {
                config,
                executor: self.executor.clone(),
            }),
        )?))
    }
}
struct Dispatch {
    config: Config,
    executor: Arc<dyn Executor>,
}
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
            let config = &self.config;
            crate::validate_input(&config.contract, &args)?;
            let input = config.input.render(&args)?;
            if serde_json::to_vec(&input)
                .map_err(|_| crate::tool_error("input_mapping", "script input is not JSON"))?
                .len()
                > config.contract.max_input_bytes
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
            let result = self
                .executor
                .evaluate(
                    Request {
                        source: config.source.clone(),
                        input,
                        max_operations: config.max_operations,
                        timeout_ms: config.contract.timeout_ms,
                        max_input_bytes: config.contract.max_input_bytes,
                        max_output_bytes: config.contract.max_output_bytes,
                    },
                    cancel,
                )
                .await?;
            if serde_json::to_vec(&result)
                .map_err(|_| crate::tool_error("invalid_output", "script result is not JSON"))?
                .len()
                > config.contract.max_output_bytes
            {
                return Err(crate::tool_error(
                    "output_limit",
                    "script result exceeds byte limit",
                ));
            }
            crate::output(&config.contract, result)
                .map(|value| TypedToolOutput::from_value(id, value))
        };
        nofy_tool_runtime::terminal_only(operation.await)
    }
}
