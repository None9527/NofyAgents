//! Session decisions use the same isolated pure executor as context methods.
use super::{Executor, Request, rhai};
use nofy_agent_runtime::{Error, registry::*, session_policy::*};
use serde::Deserialize;
use serde_json::{Value, json};
use std::{collections::BTreeMap, sync::Arc};
use tokio_util::sync::CancellationToken;

fn operations() -> u64 {
    200_000
}
fn timeout() -> u64 {
    1000
}
fn bytes() -> usize {
    4 * 1024 * 1024
}
#[derive(Clone, Deserialize)]
#[serde(deny_unknown_fields)]
struct Config {
    source: String,
    #[serde(default)]
    parameters: Value,
    #[serde(default = "operations")]
    max_operations: u64,
    #[serde(default = "timeout")]
    timeout_ms: u64,
    #[serde(default = "bytes")]
    max_input_bytes: usize,
    #[serde(default = "bytes")]
    max_output_bytes: usize,
}
pub struct SessionPolicyFactory {
    executor: Arc<dyn Executor>,
}
impl SessionPolicyFactory {
    pub fn new(executor: Arc<dyn Executor>) -> Self {
        Self { executor }
    }
}
impl ModuleFactory for SessionPolicyFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: "session_policy.programmed".into(),
            revision: "pure-json-v1".into(),
            kind: ModuleKind::SessionPolicy,
            config_schema: json!({"type":"object","additionalProperties":false,"required":["source"],"properties":{
                "source":{"type":"string","minLength":1,"maxLength":1048576},"parameters":{},
                "max_operations":{"type":"integer","minimum":1,"maximum":10000000},
                "timeout_ms":{"type":"integer","minimum":1,"maximum":600000},
                "max_input_bytes":{"type":"integer","minimum":1,"maximum":16777216},
                "max_output_bytes":{"type":"integer","minimum":1,"maximum":16777216}
            }}),
            input_schema: Some(input_schema()),
            output_schema: Some(proposal_schema()),
            dependencies: Default::default(),
            required_capabilities: Default::default(),
        }
    }
    fn build(
        &self,
        value: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        nofy_agent_runtime::settings::validate_json_value(&self.descriptor().config_schema, value)?;
        let config: Config =
            serde_json::from_value(value.clone()).map_err(|e| invalid(e.to_string()))?;
        rhai::validate(&config.source, config.max_operations).map_err(invalid)?;
        let policy = Programmed {
            config,
            executor: self.executor.clone(),
        };
        policy
            .request(Value::Null)
            .validate()
            .map_err(|e| invalid(e.to_string()))?;
        Ok(ModuleInstance::SessionPolicy(Arc::new(policy)))
    }
}
struct Programmed {
    config: Config,
    executor: Arc<dyn Executor>,
}
impl Programmed {
    fn request(&self, input: Value) -> Request {
        Request {
            source: self.config.source.clone(),
            input,
            max_operations: self.config.max_operations,
            timeout_ms: self.config.timeout_ms,
            max_input_bytes: self.config.max_input_bytes,
            max_output_bytes: self.config.max_output_bytes,
        }
    }
}
#[async_trait::async_trait]
impl SessionPolicy for Programmed {
    async fn evaluate(
        &self,
        mut input: Input,
        cancel: CancellationToken,
    ) -> Result<Proposal, Error> {
        input.parameters_json =
            serde_json::to_string(&self.config.parameters).map_err(|e| invalid(e.to_string()))?;
        let value = serde_json::to_value(&input).map_err(|e| invalid(e.to_string()))?;
        let result = self
            .executor
            .evaluate(self.request(value), cancel)
            .await
            .map_err(|e| invalid(e.to_string()))?;
        let proposal: Proposal =
            serde_json::from_value(result).map_err(|e| invalid(e.to_string()))?;
        proposal.validate(&input)?;
        Ok(proposal)
    }
}
