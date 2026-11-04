use crate::{encoded, failure, invalid};
use nofy_agent_runtime::{Error, ModelCapabilities};
use rhai::{Dynamic, Engine, OptimizationLevel};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::{
    sync::{
        Arc,
        atomic::{AtomicU64, Ordering},
    },
    time::{Duration, Instant},
};
use tokio_util::sync::CancellationToken;
#[derive(Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub(crate) struct Admission {
    pub max_requests: u64,
    pub max_output_tokens: Option<u64>,
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(default, deny_unknown_fields)]
pub struct Limits {
    pub max_requests: u64,
    pub max_frames: u64,
    pub max_input_bytes: usize,
    pub max_state_bytes: usize,
    pub max_frame_bytes: usize,
    pub max_response_bytes: usize,
    pub max_operations: u64,
    pub max_step_operations: u64,
    pub step_timeout_ms: u64,
}
impl Default for Limits {
    fn default() -> Self {
        Self {
            max_requests: 1,
            max_frames: 65536,
            max_input_bytes: 4 * 1024 * 1024,
            max_state_bytes: 4 * 1024 * 1024,
            max_frame_bytes: 1024 * 1024,
            max_response_bytes: 64 * 1024 * 1024,
            max_operations: 10000000,
            max_step_operations: 500000,
            step_timeout_ms: 2000,
        }
    }
}
impl Limits {
    fn validate(&self) -> Result<(), Error> {
        if !(1..=8).contains(&self.max_requests)
            || !(1..=1000000).contains(&self.max_frames)
            || [
                self.max_input_bytes,
                self.max_state_bytes,
                self.max_frame_bytes,
            ]
            .iter()
            .any(|v| !(256..=16 * 1024 * 1024).contains(v))
            || !(256..=256 * 1024 * 1024).contains(&self.max_response_bytes)
            || !(1..=100000000).contains(&self.max_operations)
            || !(1..=10000000).contains(&self.max_step_operations)
            || !(1..=10000).contains(&self.step_timeout_ms)
        {
            return Err(invalid("invalid model protocol execution limits"));
        }
        Ok(())
    }
}
#[derive(Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Protocol {
    pub source: String,
    pub capabilities: ModelCapabilities,
    #[serde(default)]
    pub limits: Limits,
}

fn engine(limits: &Limits, spent: Arc<AtomicU64>, cancel: CancellationToken) -> Engine {
    let mut engine = Engine::new();
    engine
        .set_optimization_level(OptimizationLevel::None)
        .set_max_operations(limits.max_step_operations)
        .set_max_call_levels(32)
        .set_max_expr_depths(64, 32)
        .set_max_string_size(limits.max_state_bytes)
        .set_max_array_size(16384)
        .set_max_map_size(4096)
        .set_max_variables(256)
        .set_max_functions(128);
    engine.set_module_resolver(rhai::module_resolvers::DummyModuleResolver::new());
    engine.disable_symbol("eval");
    engine.on_print(|_| {});
    engine.on_debug(|_, _, _| {});
    let previous = AtomicU64::new(0);
    let cap = limits.max_operations;
    let deadline = Instant::now() + Duration::from_millis(limits.step_timeout_ms);
    engine.on_progress(move |operations| {
        let last = previous.swap(operations, Ordering::Relaxed);
        let delta = operations.saturating_sub(last);
        let total = spent
            .fetch_add(delta, Ordering::Relaxed)
            .saturating_add(delta);
        (cancel.is_cancelled() || total > cap || Instant::now() >= deadline)
            .then(|| Dynamic::from("model_program_limit"))
    });
    engine.register_fn(
        "json_parse",
        |text: &str| -> Result<Dynamic, Box<rhai::EvalAltResult>> {
            let value: Value = serde_json::from_str(text).map_err(|_| "invalid JSON")?;
            let dynamic = crate::json::dynamic(&value)?;
            let restored = crate::json::value(&dynamic)?;
            if restored != value {
                return Err("JSON number cannot be represented losslessly".into());
            }
            Ok(dynamic)
        },
    );
    engine.register_fn(
        "json_stringify",
        |value: Dynamic| -> Result<String, Box<rhai::EvalAltResult>> {
            let value = crate::json::value(&value)?;
            serde_json::to_string(&value).map_err(|_| "invalid JSON".into())
        },
    );
    engine.register_fn(
        "fail",
        |value: Dynamic| -> Result<Dynamic, Box<rhai::EvalAltResult>> {
            Err(Box::new(rhai::EvalAltResult::ErrorRuntime(
                value,
                rhai::Position::NONE,
            )))
        },
    );
    engine.register_fn(
        "json_schema_valid",
        |schema: Dynamic, value: Dynamic| -> Result<bool, Box<rhai::EvalAltResult>> {
            let schema = crate::json::value(&schema)?;
            let value = crate::json::value(&value)?;
            encoded(&schema, 65536).map_err(|_| "JSON Schema byte limit")?;
            encoded(&value, 16 * 1024 * 1024).map_err(|_| "JSON value byte limit")?;
            nofy_agent_runtime::settings::validate_json_schema(&schema)
                .map_err(|_| "invalid local JSON Schema")?;
            Ok(nofy_agent_runtime::settings::validate_json_value(&schema, &value).is_ok())
        },
    );
    engine
}
impl Protocol {
    #[cfg(test)]
    fn pure(&self, input: Value) -> Result<Value, Error> {
        let engine = engine(&self.limits, Arc::default(), CancellationToken::new());
        let ast = engine
            .compile(&self.source)
            .map_err(|_| failure("compile"))?;
        evaluate(&engine, &ast, input, self.limits.max_input_bytes)
    }
    pub fn validate(&self) -> Result<(), Error> {
        self.compile().map(|_| ())
    }
    fn compile(&self) -> Result<rhai::AST, Error> {
        self.limits.validate()?;
        if self.source.trim().is_empty() || self.source.len() > 65536 {
            return Err(invalid("protocol source requires 1..=65536 bytes"));
        }
        if let Some(schema) = &self.capabilities.settings_schema {
            nofy_agent_runtime::settings::validate_json_schema(schema)?;
        }
        // No constant folding executes user expressions during pure build.
        engine(&self.limits, Arc::default(), CancellationToken::new())
            .compile(&self.source)
            .map_err(|error| invalid(format!("invalid model protocol Rhai source: {error}")))
    }
}
fn typed_failure(value: Value) -> Result<Error, Error> {
    encoded(&value, 65536)?;
    let failure: nofy_agent_runtime::model::ModelFailure =
        serde_json::from_value(value).map_err(|_| failure("failure_contract"))?;
    if failure.category.is_empty()
        || failure.category.len() > 128
        || failure.message.len() > 4096
        || failure.code.as_ref().is_some_and(|c| c.len() > 256)
    {
        return Err(crate::failure("failure_contract"));
    }
    Ok(failure.into())
}
fn evaluate(engine: &Engine, ast: &rhai::AST, input: Value, cap: usize) -> Result<Value, Error> {
    encoded(&input, cap)?;
    let phase = input
        .get("phase")
        .and_then(Value::as_str)
        .unwrap_or("unknown")
        .chars()
        .take(32)
        .collect::<String>();
    let mut scope = rhai::Scope::new();
    let dynamic = crate::json::dynamic(&input).map_err(|_| failure("input"))?;
    let restored = crate::json::value(&dynamic).map_err(|_| failure("input"))?;
    if restored != input {
        return Err(failure("input_precision"));
    }
    scope.push_dynamic("args", dynamic);
    let output = engine
        .eval_ast_with_scope::<Dynamic>(&mut scope, ast)
        .map_err(|error| {
            let mut root = &*error;
            while let rhai::EvalAltResult::ErrorInFunctionCall(_, _, inner, _)
            | rhai::EvalAltResult::ErrorInModule(_, inner, _) = root
            {
                root = inner;
            }
            if let rhai::EvalAltResult::ErrorRuntime(value, _) = root
                && let Ok(value) = crate::json::value(value)
                && value.is_object()
            {
                return typed_failure(value).unwrap_or_else(|error| error);
            }
            let mut error = match failure("program") {
                Error::ModelFailure(error) => error,
                _ => unreachable!(),
            };
            error.details =
                serde_json::json!({"phase":phase,"position":root.position().to_string()});
            error.into()
        })?;
    let value = crate::json::value(&output).map_err(|_| failure("output"))?;
    encoded(&value, cap)?;
    if let Some(object) = value.as_object()
        && object.len() == 1
        && let Some(failure) = object.get("failure")
    {
        return Err(typed_failure(failure.clone())?);
    }
    Ok(value)
}
pub(crate) struct Compiled {
    program: Arc<Protocol>,
    ast: rhai::AST,
}
impl Compiled {
    pub(crate) fn new(program: Arc<Protocol>) -> Result<Self, Error> {
        Ok(Self {
            ast: program.compile()?,
            program,
        })
    }
    pub(crate) fn evaluate(
        &self,
        input: Value,
        spent: u64,
        cap: usize,
        cancel: CancellationToken,
    ) -> Result<crate::execution::Evaluation, Error> {
        if cancel.is_cancelled() {
            return Err(Error::Cancelled);
        }
        if spent > self.program.limits.max_operations || cap == 0 || cap > 32 * 1024 * 1024 {
            return Err(failure("evaluation_limits"));
        }
        let spent = Arc::new(AtomicU64::new(spent));
        let engine = engine(&self.program.limits, spent.clone(), cancel);
        let value = evaluate(&engine, &self.ast, input, cap)?;
        Ok(crate::execution::Evaluation {
            value,
            spent: spent.load(Ordering::Relaxed),
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::execution::{Session, Trusted};
    #[test]
    fn full_unsigned_json_values_survive_input_parse_stringify_and_native_output() {
        let value = serde_json::json!({"id":u64::MAX,"signed":i64::MIN,"nested":[9007199254740993u64,1.25,true,null]});
        let protocol=Protocol {source:"#{value: args.value, parsed: json_parse(args.text), encoded: json_stringify(args.value)}".into(),
            capabilities:Default::default(),limits:Default::default()};
        let result = protocol
            .pure(serde_json::json!({"value":value,"text":value.to_string()}))
            .unwrap();
        assert_eq!(result["value"], value);
        assert_eq!(result["parsed"], value);
        assert_eq!(
            serde_json::from_str::<Value>(result["encoded"].as_str().unwrap()).unwrap(),
            value
        );
    }
    #[tokio::test]
    async fn operation_accounting_spans_steps_and_cancellation_waits_for_worker_exit() {
        let protocol = Arc::new(Protocol {
            source: "#{value: args.value}".into(),
            capabilities: Default::default(),
            limits: Limits {
                max_operations: 200,
                ..Default::default()
            },
        });
        let cancel = CancellationToken::new();
        let session = Session::start(protocol, Arc::new(Trusted), cancel.clone());
        let mut success = 0;
        let mut stopped = false;
        for _ in 0..100 {
            match session.step(serde_json::json!({"value":1})).await {
                Ok(value) => {
                    assert_eq!(value, serde_json::json!({"value":1}));
                    success += 1;
                }
                Err(_) => {
                    stopped = true;
                    break;
                }
            }
        }
        assert!(success > 0 && success < 100);
        assert!(stopped);
        tokio::time::timeout(Duration::from_secs(1), session.close())
            .await
            .unwrap();
        assert!(cancel.is_cancelled());
    }
    #[test]
    fn compilation_does_not_evaluate_constant_expressions_and_history_is_explicit() {
        let protocol = Protocol {
            source: "let x = 1 / 0; false".into(),
            capabilities: Default::default(),
            limits: Default::default(),
        };
        protocol.validate().unwrap();
        assert!(
            protocol
                .pure(serde_json::json!({"phase":"history","messages":[]}))
                .is_err()
        );
        let rejected = Protocol {
            source: "false".into(),
            ..protocol
        };
        assert_eq!(
            rejected
                .pure(serde_json::json!({"phase":"history","messages":[]}))
                .unwrap(),
            Value::Bool(false)
        );
        let invalid = Protocol {
            source: "[".into(),
            ..rejected
        };
        assert!(invalid.validate().is_err());
    }
}
