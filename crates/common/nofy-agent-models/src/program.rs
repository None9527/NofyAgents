use crate::{count_encoded, encoded, failure, invalid};
use nofy_agent_runtime::{Error, ModelCapabilities, model::ModelFailure, system::content_digest};
use rhai::packages::{
    ArithmeticPackage, BasicArrayPackage, BasicFnPackage, BasicIteratorPackage, BasicMapPackage,
    BasicMathPackage, BasicStringPackage, LogicPackage, MoreStringPackage, Package,
};
use rhai::{Dynamic, Engine, OptimizationLevel};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::{
    cell::RefCell,
    collections::VecDeque,
    rc::Rc,
    sync::{
        Arc,
        atomic::{AtomicU64, Ordering},
    },
    time::{Duration, Instant},
};
use tokio_util::sync::CancellationToken;

const AST_CACHE_CAPACITY: usize = 128;

rhai::def_package! {
    PureCorePackage(lib) :
        ArithmeticPackage,
        BasicMathPackage,
        LogicPackage,
        BasicStringPackage,
        MoreStringPackage,
        BasicIteratorPackage,
        BasicArrayPackage,
        BasicMapPackage,
        BasicFnPackage
    {}
}

thread_local! {
    static PURE_CORE_PACKAGE: PureCorePackage = PureCorePackage::new();
    static AST_CACHE: RefCell<VecDeque<(String, Rc<rhai::AST>)>> = const { RefCell::new(VecDeque::new()) };
}

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
    // Raw engine + pure core whitelist: excludes blocking sleep (LanguageCorePackage)
    // and ambient wall clock timestamp() (BasicTimePackage).
    let mut engine = Engine::new_raw();
    PURE_CORE_PACKAGE.with(|package| {
        package.register_into_engine(&mut engine);
    });
    engine
        .set_optimization_level(OptimizationLevel::None)
        .set_max_operations(limits.max_step_operations)
        .set_max_call_levels(32)
        .set_max_expr_depths(64, 32)
        .set_max_string_size(limits.max_state_bytes)
        .set_max_array_size(16384)
        .set_max_map_size(4096)
        .set_max_variables(256)
        .set_max_functions(128)
        .set_max_modules(0);
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
    let max_json_bytes = limits.max_state_bytes.max(limits.max_frame_bytes);
    engine.register_fn(
        "json_parse",
        move |text: &str| -> Result<Dynamic, Box<rhai::EvalAltResult>> {
            if text.len() > max_json_bytes {
                return Err("JSON byte limit".into());
            }
            let value: Value = serde_json::from_str(text).map_err(|_| "invalid JSON")?;
            crate::json::dynamic(&value, max_json_bytes)
        },
    );
    engine.register_fn(
        "json_stringify",
        move |value: Dynamic| -> Result<String, Box<rhai::EvalAltResult>> {
            let value = crate::json::value(&value, max_json_bytes)?;
            let bytes = encoded(&value, max_json_bytes).map_err(|_| "JSON byte limit")?;
            String::from_utf8(bytes).map_err(|_| "invalid JSON".into())
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
            let schema = crate::json::value(&schema, 65536)?;
            let value = crate::json::value(&value, 16 * 1024 * 1024)?;
            count_encoded(&schema, 65536).map_err(|_| "JSON Schema byte limit")?;
            count_encoded(&value, 16 * 1024 * 1024).map_err(|_| "JSON value byte limit")?;
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
        let ast = self.compile()?;
        let engine = engine(&self.limits, Arc::default(), CancellationToken::new());
        evaluate(&engine, &ast, input, self.limits.max_input_bytes)
    }
    pub fn validate(&self) -> Result<(), Error> {
        self.compile().map(|_| ())
    }
    fn compile(&self) -> Result<Rc<rhai::AST>, Error> {
        self.limits.validate()?;
        if self.source.trim().is_empty() || self.source.len() > 65536 {
            return Err(invalid("protocol source requires 1..=65536 bytes"));
        }
        if let Some(schema) = &self.capabilities.settings_schema {
            nofy_agent_runtime::settings::validate_json_schema(schema)?;
        }
        let key = content_digest(&self.source)?;
        if let Some(cached) = AST_CACHE.with(|cache| {
            let mut cache = cache.borrow_mut();
            let index = cache
                .iter()
                .position(|(cached_key, _)| cached_key == &key)?;
            let entry = cache.remove(index)?;
            let ast = entry.1.clone();
            cache.push_back(entry);
            Some(ast)
        }) {
            return Ok(cached);
        }
        // No constant folding executes user expressions during pure build.
        let compiled = Rc::new(
            engine(&self.limits, Arc::default(), CancellationToken::new())
                .compile(&self.source)
                .map_err(|error| invalid(format!("invalid model protocol Rhai source: {error}")))?,
        );
        AST_CACHE.with(|cache| {
            let mut cache = cache.borrow_mut();
            if cache.len() >= AST_CACHE_CAPACITY {
                cache.pop_front();
            }
            cache.push_back((key, compiled.clone()));
        });
        Ok(compiled)
    }
}
fn typed_failure(value: Value) -> Result<Error, Error> {
    count_encoded(&value, 65536)?;
    let failure: ModelFailure =
        serde_json::from_value(value).map_err(|_| failure("failure_contract"))?;
    if failure.category.is_empty()
        || failure.category == nofy_agent_runtime::model::MODEL_EVALUATOR_FAILURE_CATEGORY
        || failure.category.len() > 128
        || failure.message.len() > 4096
        || failure.code.as_ref().is_some_and(|c| c.len() > 256)
    {
        return Err(crate::failure("failure_contract"));
    }
    Ok(failure.into())
}

fn map_eval_error(error: &rhai::EvalAltResult, phase: &str) -> Error {
    let mut root = error;
    while let rhai::EvalAltResult::ErrorInFunctionCall(_, _, inner, _)
    | rhai::EvalAltResult::ErrorInModule(_, inner, _) = root
    {
        root = inner;
    }
    if let rhai::EvalAltResult::ErrorRuntime(value, _) = root
        && let Ok(value) = crate::json::value(value, 65536)
        && value.is_object()
    {
        return typed_failure(value).unwrap_or_else(|error| error);
    }
    ModelFailure {
        category: "model_protocol".into(),
        message: "model protocol operation failed: program".into(),
        status: None,
        retryable: false,
        retry_after_ms: None,
        code: Some("program".into()),
        details: serde_json::json!({"phase": phase, "position": root.position().to_string()}),
    }
    .into()
}

fn map_json_error(error: &rhai::EvalAltResult, fallback: &str) -> Error {
    let text = error.to_string();
    if text.contains("byte limit") {
        failure("json_byte_limit")
    } else if text.contains("losslessly") {
        failure("input_precision")
    } else {
        failure(fallback)
    }
}

fn evaluate(engine: &Engine, ast: &rhai::AST, input: Value, cap: usize) -> Result<Value, Error> {
    count_encoded(&input, cap)?;
    let phase = input
        .get("phase")
        .and_then(Value::as_str)
        .unwrap_or("unknown")
        .chars()
        .take(32)
        .collect::<String>();
    let mut scope = rhai::Scope::new();
    let dynamic =
        crate::json::dynamic(&input, cap).map_err(|error| map_json_error(&error, "input"))?;
    scope.push_dynamic("args", dynamic);
    let output = engine
        .eval_ast_with_scope::<Dynamic>(&mut scope, ast)
        .map_err(|error| map_eval_error(&error, &phase))?;
    let value =
        crate::json::value(&output, cap).map_err(|error| map_json_error(&error, "output"))?;
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
    ast: Rc<rhai::AST>,
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
    pub(crate) fn begin_stream(&self, state: Value, cap: usize) -> Result<Dynamic, Error> {
        if cap == 0 || cap > 32 * 1024 * 1024 {
            return Err(failure("evaluation_limits"));
        }
        let state_cap = self.program.limits.max_state_bytes.min(cap);
        count_encoded(&state, state_cap)?;
        crate::json::dynamic(&state, state_cap).map_err(|error| map_json_error(&error, "input"))
    }
    pub(crate) fn push_event(
        &self,
        state: Dynamic,
        frame: Value,
        spent: u64,
        cap: usize,
        cancel: CancellationToken,
    ) -> Result<(Dynamic, crate::execution::Evaluation), Error> {
        if cancel.is_cancelled() {
            return Err(Error::Cancelled);
        }
        if spent > self.program.limits.max_operations || cap == 0 || cap > 32 * 1024 * 1024 {
            return Err(failure("evaluation_limits"));
        }
        let frame_cap = self.program.limits.max_frame_bytes.min(cap);
        count_encoded(&frame, frame_cap)?;
        let frame_dynamic = crate::json::dynamic(&frame, frame_cap)
            .map_err(|error| map_json_error(&error, "input"))?;
        let mut args = rhai::Map::new();
        args.insert("phase".into(), Dynamic::from("event"));
        args.insert("state".into(), state);
        args.insert("frame".into(), frame_dynamic);
        let spent = Arc::new(AtomicU64::new(spent));
        let engine = engine(&self.program.limits, spent.clone(), cancel);
        let mut scope = rhai::Scope::new();
        scope.push_dynamic("args", Dynamic::from_map(args));
        let output = engine
            .eval_ast_with_scope::<Dynamic>(&mut scope, &self.ast)
            .map_err(|error| map_eval_error(&error, "event"))?;
        let mut map = output
            .try_cast::<rhai::Map>()
            .ok_or_else(|| failure("event_contract"))?;
        if map.len() == 1
            && let Some(failure_value) = map.remove("failure")
        {
            let value = crate::json::value(&failure_value, 65536)
                .map_err(|error| map_json_error(&error, "output"))?;
            return Err(typed_failure(value)?);
        }
        let Some(new_state) = map.remove("state") else {
            return Err(failure("event_contract"));
        };
        let Some(deltas_dyn) = map.remove("deltas") else {
            return Err(failure("event_contract"));
        };
        let Some(finished_dyn) = map.remove("finished") else {
            return Err(failure("event_contract"));
        };
        if !map.is_empty() {
            return Err(failure("event_contract"));
        }
        let finished = finished_dyn
            .as_bool()
            .map_err(|_| failure("event_contract"))?;
        let deltas = crate::json::value(&deltas_dyn, self.program.limits.max_frame_bytes)
            .map_err(|error| map_json_error(&error, "output"))?;
        if !deltas.is_array() {
            return Err(failure("event_contract"));
        }
        crate::json::check_dynamic_budget(&new_state, self.program.limits.max_state_bytes)
            .map_err(|error| map_json_error(&error, "output"))?;
        Ok((
            new_state,
            crate::execution::Evaluation {
                value: serde_json::json!({"deltas": deltas, "finished": finished}),
                spent: spent.load(Ordering::Relaxed),
            },
        ))
    }
    pub(crate) fn finish_stream(
        &self,
        state: Dynamic,
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
        let mut args = rhai::Map::new();
        args.insert("phase".into(), Dynamic::from("finish"));
        args.insert("state".into(), state);
        let spent = Arc::new(AtomicU64::new(spent));
        let engine = engine(&self.program.limits, spent.clone(), cancel);
        let mut scope = rhai::Scope::new();
        scope.push_dynamic("args", Dynamic::from_map(args));
        let output = engine
            .eval_ast_with_scope::<Dynamic>(&mut scope, &self.ast)
            .map_err(|error| map_eval_error(&error, "finish"))?;
        let value =
            crate::json::value(&output, cap).map_err(|error| map_json_error(&error, "output"))?;
        if let Some(object) = value.as_object()
            && object.len() == 1
            && let Some(failure) = object.get("failure")
        {
            return Err(typed_failure(failure.clone())?);
        }
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
        let protocol = Protocol {
            source: "#{value: args.value, parsed: json_parse(args.text), encoded: json_stringify(args.value)}"
                .into(),
            capabilities: Default::default(),
            limits: Default::default(),
        };
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

    #[test]
    fn raw_whitelist_forbids_timestamp_sleep_and_indirect_calls_and_caches_ast() {
        for expr in [
            "timestamp()",
            "Fn(\"timestamp\").call()",
            "sleep(0)",
            "sleep(0.0)",
            "Fn(\"sleep\").call(0)",
        ] {
            let protocol = Protocol {
                source: expr.into(),
                capabilities: Default::default(),
                limits: Default::default(),
            };
            assert!(
                protocol.pure(serde_json::json!({})).is_err(),
                "{expr} must fail"
            );
        }
        let cached = Protocol {
            source: "#{ok: args.n + 1}".into(),
            capabilities: Default::default(),
            limits: Default::default(),
        };
        let first = cached.compile().unwrap();
        let second = cached.compile().unwrap();
        assert!(Rc::ptr_eq(&first, &second));
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
