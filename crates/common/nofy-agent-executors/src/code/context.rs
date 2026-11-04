//! Portable pure plans and transforms; optional sampling keeps native receipts.
use super::{Executor, Request, rhai};
use nofy_agent_runtime::{context_policy::*, registry::*, *};
use serde::Deserialize;
use serde_json::{Value, json};
use std::{collections::BTreeMap, sync::Arc};

fn operations() -> u64 {
    200_000
}
fn timeout() -> u64 {
    1_000
}
fn bytes() -> usize {
    4 * 1024 * 1024
}
#[derive(Clone, Deserialize, serde::Serialize)]
#[serde(deny_unknown_fields)]
struct Config {
    source: String,
    #[serde(default)]
    parameters: Value,
    #[serde(default)]
    model: bool,
    #[serde(default = "operations")]
    max_operations: u64,
    #[serde(default = "timeout")]
    timeout_ms: u64,
    #[serde(default = "bytes")]
    max_input_bytes: usize,
    #[serde(default = "bytes")]
    max_output_bytes: usize,
}
pub struct ContextPolicyFactory {
    executor: Arc<dyn Executor>,
}
impl ContextPolicyFactory {
    pub fn new(executor: Arc<dyn Executor>) -> Self {
        Self { executor }
    }
}
impl ModuleFactory for ContextPolicyFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: "context.programmed".into(),
            revision: "pure-json-v1".into(),
            kind: ModuleKind::ContextPolicy,
            config_schema: json!({"type":"object","required":["source"],"additionalProperties":false,"properties":{
                "source":{"type":"string","minLength":1,"maxLength":1048576},"parameters":{},"model":{"type":"boolean"},
                "max_operations":{"type":"integer","minimum":1,"maximum":10000000},
                "timeout_ms":{"type":"integer","minimum":1,"maximum":600000},
                "max_input_bytes":{"type":"integer","minimum":1,"maximum":16777216},
                "max_output_bytes":{"type":"integer","minimum":1,"maximum":16777216}
            }}),
            input_schema: None,
            output_schema: None,
            dependencies: Default::default(),
            required_capabilities: Default::default(),
        }
    }
    fn config_dependencies(&self, value: &Value) -> Result<BTreeMap<String, ModuleKind>, Error> {
        let config: Config =
            serde_json::from_value(value.clone()).map_err(|e| Error::Composition(e.to_string()))?;
        Ok(if config.model {
            BTreeMap::from([("model".into(), ModuleKind::Model)])
        } else {
            BTreeMap::new()
        })
    }
    fn build(
        &self,
        value: &Value,
        dependencies: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        settings::validate_json_value(&self.descriptor().config_schema, value)?;
        let config: Config =
            serde_json::from_value(value.clone()).map_err(|e| Error::Composition(e.to_string()))?;
        config
            .request(Value::Null)
            .validate()
            .map_err(|e| Error::Composition(e.to_string()))?;
        rhai::validate(&config.source, config.max_operations).map_err(Error::Composition)?;
        let model = if config.model {
            let Some(ModuleInstance::Model(model)) = dependencies.get("model") else {
                return Err(Error::Composition(
                    "context sampling requires its declared Model".into(),
                ));
            };
            Some(model.clone())
        } else {
            None
        };
        let identity = system::content_digest(&config)?;
        Ok(ModuleInstance::ContextPolicy(Arc::new(ProgrammedContext {
            config,
            model,
            identity,
            executor: self.executor.clone(),
        })))
    }
}
impl Config {
    fn request(&self, input: Value) -> Request {
        Request {
            source: self.source.clone(),
            input,
            max_operations: self.max_operations,
            timeout_ms: self.timeout_ms,
            max_input_bytes: self.max_input_bytes,
            max_output_bytes: self.max_output_bytes,
        }
    }
}
struct ProgrammedContext {
    config: Config,
    executor: Arc<dyn Executor>,
    model: Option<Arc<dyn Model>>,
    identity: String,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Update {
    messages: Vec<Message>,
    retained_from: usize,
    retained_at: usize,
    #[serde(default)]
    metadata: Value,
}
#[derive(Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case", deny_unknown_fields)]
enum Preparation {
    Update {
        update: Update,
    },
    Sample {
        request: ModelRequest,
        #[serde(default)]
        data: Value,
    },
}
impl ProgrammedContext {
    async fn evaluate(&self, mut input: Value, context: &RunContext) -> Result<Value, Error> {
        input["parameters"] = self.config.parameters.clone();
        let cancel = context.cancel.child_token();
        let _on_drop = cancel.clone().drop_guard();
        governance::await_resource(context, async {
            self.executor
                .evaluate(self.config.request(input), cancel)
                .await
                .map_err(|error| {
                    if context.cancel.is_cancelled() {
                        Error::Cancelled
                    } else {
                        Error::Composition(format!("context program failed: {error}"))
                    }
                })
        })
        .await
    }
}
#[async_trait::async_trait]
impl ContextPolicy for ProgrammedContext {
    async fn plan(&self, state: &RunState, context: &RunContext) -> Result<Option<Value>, Error> {
        let plan = self.evaluate(json!({"phase":"plan","state":state,"retained_turn_start":state.hook_progress.input_start_index.unwrap_or(1)}), context).await?;
        Ok((!plan.is_null()).then_some(plan))
    }
    async fn apply(
        &self,
        state: &RunState,
        plan: &Value,
        context: &RunContext,
    ) -> Result<ContextUpdate, Error> {
        let prepared = self.evaluate(json!({"phase":"prepare","state":state,"plan":plan,"retained_turn_start":state.hook_progress.input_start_index.unwrap_or(1)}), context).await?;
        let prepared: Preparation = serde_json::from_value(prepared)
            .map_err(|e| Error::Composition(format!("invalid context preparation: {e}")))?;
        let (update, input_tokens, output_tokens) = match prepared {
            Preparation::Update { update } => (update, 0, 0),
            Preparation::Sample { request, data } => {
                let model = self.model.as_ref().ok_or_else(|| {
                    Error::Composition("context program has no declared sampling model".into())
                })?;
                let scope = governance::operation_scope(context).ok_or_else(|| {
                    Error::Checkpoint("context sampling requires its prepared operation".into())
                })?;
                if !governance::is_governed(context) && !model_journal::enabled(context) {
                    return Err(Error::Checkpoint(
                        "context sampling requires persistent model receipts".into(),
                    ));
                }
                if !request.tools.is_empty() {
                    return Err(Error::Composition(
                        "context sampling cannot advertise tool calls".into(),
                    ));
                }
                model.validate_settings(&request.settings)?;
                let operation = format!(
                    "context-model:{}",
                    system::content_digest(&(&self.identity, scope))?
                );
                let response = governance::sample_model(
                    model.as_ref(),
                    request,
                    context,
                    &operation,
                    false,
                    |_| async { Ok(()) },
                )
                .await?;
                if !response.tool_calls.is_empty() {
                    return Err(Error::Composition(
                        "context sampling returned tool calls".into(),
                    ));
                }
                let output = self.evaluate(json!({"phase":"finish","state":state,"plan":plan,"data":data,"response":response,"retained_turn_start":state.hook_progress.input_start_index.unwrap_or(1)}), context).await?;
                let update = serde_json::from_value(output)
                    .map_err(|e| Error::Composition(format!("invalid context update: {e}")))?;
                (update, response.input_tokens, response.output_tokens)
            }
        };
        if update.retained_from > state.hook_progress.input_start_index.unwrap_or(1) {
            return Err(Error::Composition(
                "context update discards the retained current turn".into(),
            ));
        }
        Ok(ContextUpdate {
            messages: update.messages,
            retained_from: update.retained_from,
            retained_at: update.retained_at,
            input_tokens,
            output_tokens,
            metadata: update.metadata,
        })
    }
}
