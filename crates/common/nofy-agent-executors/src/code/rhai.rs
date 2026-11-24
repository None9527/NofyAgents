use nofy_tool_runtime::ToolError;
use rhai::packages::{
    ArithmeticPackage, BasicArrayPackage, BasicFnPackage, BasicIteratorPackage, BasicMapPackage,
    BasicMathPackage, BasicStringPackage, LogicPackage, MoreStringPackage, Package,
};
use rhai::{Dynamic, Engine, EvalAltResult, OptimizationLevel, Position};
use serde_json::{Map, Number, Value};
use sha2::{Digest, Sha256};
use std::{
    cell::RefCell,
    collections::VecDeque,
    rc::Rc,
    time::{Duration, Instant},
};
use tokio_util::sync::CancellationToken;

const AST_CACHE_CAPACITY: usize = 128;
const MAX_JSON_DEPTH: usize = 128;
const MAX_JSON_NODES: usize = 65_536;
const MIN_STRING_LIMIT: usize = 1024 * 1024;
const MAX_STRING_LIMIT: usize = 4 * 1024 * 1024;

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

type AstCacheEntry = (([u8; 32], u64), Rc<rhai::AST>);

thread_local! {
    static PURE_CORE_PACKAGE: PureCorePackage = PureCorePackage::new();
    static AST_CACHE: RefCell<VecDeque<AstCacheEntry>> =
        const { RefCell::new(VecDeque::new()) };
}

#[derive(Clone)]
enum Terminal {
    Complete(Value),
    OutputLimit,
    Cancelled,
    Timeout,
}

enum JsonError {
    ByteLimit,
    Invalid,
}

struct Budget {
    nodes: usize,
    max_nodes: usize,
    bytes: usize,
    max_bytes: usize,
}

impl Budget {
    fn new(max_bytes: usize) -> Self {
        Self {
            nodes: 0,
            max_nodes: MAX_JSON_NODES,
            bytes: 0,
            max_bytes,
        }
    }

    fn node(&mut self) -> Result<(), JsonError> {
        self.nodes = self
            .nodes
            .checked_add(1)
            .filter(|n| *n <= self.max_nodes)
            .ok_or(JsonError::ByteLimit)?;
        Ok(())
    }

    fn charge(&mut self, bytes: usize) -> Result<(), JsonError> {
        self.bytes = self
            .bytes
            .checked_add(bytes)
            .filter(|n| *n <= self.max_bytes)
            .ok_or(JsonError::ByteLimit)?;
        Ok(())
    }
}

fn json_string_bytes(text: &str) -> usize {
    let mut len = 2usize;
    for byte in text.bytes() {
        len = len.saturating_add(match byte {
            b'"' | b'\\' | 0x08 | 0x0c | b'\n' | b'\r' | b'\t' => 2,
            0x00..=0x1f => 6,
            _ => 1,
        });
    }
    len
}

fn signed_digits(value: i64) -> usize {
    let negative = usize::from(value < 0);
    unsigned_digits(value.unsigned_abs()) + negative
}

fn unsigned_digits(mut value: u64) -> usize {
    let mut digits = 1usize;
    while value >= 10 {
        value /= 10;
        digits += 1;
    }
    digits
}

fn json_to_dynamic(value: &Value, max_bytes: usize) -> Result<Dynamic, JsonError> {
    fn convert(value: &Value, depth: usize, budget: &mut Budget) -> Result<Dynamic, JsonError> {
        if depth > MAX_JSON_DEPTH {
            return Err(JsonError::Invalid);
        }
        budget.node()?;
        Ok(match value {
            Value::Null => {
                budget.charge(4)?;
                Dynamic::UNIT
            }
            Value::Bool(v) => {
                budget.charge(if *v { 4 } else { 5 })?;
                Dynamic::from_bool(*v)
            }
            Value::String(v) => {
                budget.charge(json_string_bytes(v))?;
                Dynamic::from(v.clone())
            }
            Value::Number(number) => {
                if let Some(value) = number.as_i64() {
                    budget.charge(signed_digits(value))?;
                    Dynamic::from_int(value)
                } else if let Some(value) = number.as_u64() {
                    budget.charge(unsigned_digits(value))?;
                    Dynamic::from(value)
                } else {
                    let float = number
                        .as_f64()
                        .filter(|v| v.is_finite())
                        .ok_or(JsonError::Invalid)?;
                    budget.charge(number.to_string().len())?;
                    Dynamic::from_float(float)
                }
            }
            Value::Array(values) => {
                budget.charge(2 + values.len().saturating_sub(1))?;
                let mut array = rhai::Array::with_capacity(values.len());
                for item in values {
                    array.push(convert(item, depth + 1, budget)?);
                }
                Dynamic::from_array(array)
            }
            Value::Object(values) => {
                budget.charge(2 + values.len().saturating_sub(1) + values.len())?;
                let mut map = rhai::Map::new();
                for (key, item) in values {
                    budget.charge(json_string_bytes(key))?;
                    map.insert(key.clone().into(), convert(item, depth + 1, budget)?);
                }
                Dynamic::from_map(map)
            }
        })
    }
    let mut budget = Budget::new(max_bytes);
    convert(value, 0, &mut budget)
}

fn dynamic_to_json(dynamic: &Dynamic, max_bytes: usize) -> Result<Value, JsonError> {
    fn convert(value: &Dynamic, depth: usize, budget: &mut Budget) -> Result<Value, JsonError> {
        if depth > MAX_JSON_DEPTH {
            return Err(JsonError::Invalid);
        }
        budget.node()?;
        if value.is_unit() {
            budget.charge(4)?;
            return Ok(Value::Null);
        }
        if let Ok(flag) = value.as_bool() {
            budget.charge(if flag { 4 } else { 5 })?;
            return Ok(Value::Bool(flag));
        }
        if let Ok(integer) = value.as_int() {
            budget.charge(signed_digits(integer))?;
            return Ok(Value::Number(Number::from(integer)));
        }
        if let Some(unsigned) = value.read_lock::<u64>() {
            let integer = *unsigned;
            budget.charge(unsigned_digits(integer))?;
            return Ok(Value::Number(Number::from(integer)));
        }
        if let Ok(float) = value.as_float() {
            let number = Number::from_f64(float).ok_or(JsonError::Invalid)?;
            budget.charge(number.to_string().len())?;
            return Ok(Value::Number(number));
        }
        if let Some(text) = value.read_lock::<rhai::ImmutableString>() {
            budget.charge(json_string_bytes(text.as_str()))?;
            return Ok(Value::String(text.as_str().to_owned()));
        }
        if let Ok(ch) = value.as_char() {
            let mut encoded = [0u8; 4];
            let text = ch.encode_utf8(&mut encoded);
            budget.charge(json_string_bytes(text))?;
            return Ok(Value::String(text.to_owned()));
        }
        if let Some(array) = value.read_lock::<rhai::Array>() {
            budget.charge(2 + array.len().saturating_sub(1))?;
            let mut result = Vec::with_capacity(array.len());
            for item in array.iter() {
                result.push(convert(item, depth + 1, budget)?);
            }
            return Ok(Value::Array(result));
        }
        if let Some(map) = value.read_lock::<rhai::Map>() {
            budget.charge(2 + map.len().saturating_sub(1) + map.len())?;
            let mut result = Map::with_capacity(map.len());
            for (key, item) in map.iter() {
                budget.charge(json_string_bytes(key.as_str()))?;
                result.insert(key.as_str().to_owned(), convert(item, depth + 1, budget)?);
            }
            return Ok(Value::Object(result));
        }
        if let Some(v) = value.read_lock::<u32>() {
            budget.charge(unsigned_digits(u64::from(*v)))?;
            return Ok(Value::Number(Number::from(*v)));
        }
        if let Some(v) = value.read_lock::<i32>() {
            budget.charge(signed_digits(i64::from(*v)))?;
            return Ok(Value::Number(Number::from(*v)));
        }
        if let Some(v) = value.read_lock::<f32>() {
            let number = Number::from_f64(f64::from(*v)).ok_or(JsonError::Invalid)?;
            budget.charge(number.to_string().len())?;
            return Ok(Value::Number(number));
        }
        Err(JsonError::Invalid)
    }
    let mut budget = Budget::new(max_bytes);
    convert(dynamic, 0, &mut budget)
}

fn engine(
    operations: u64,
    timeout_ms: u64,
    max_string_bytes: usize,
    max_output_bytes: usize,
    cancel: CancellationToken,
) -> Engine {
    // Raw engine + pure core whitelist: excludes blocking sleep (LanguageCorePackage)
    // and ambient wall clock (BasicTimePackage).
    let mut engine = Engine::new_raw();
    PURE_CORE_PACKAGE.with(|package| {
        package.register_into_engine(&mut engine);
    });
    engine
        .set_optimization_level(OptimizationLevel::None)
        .set_max_operations(operations)
        .set_max_call_levels(16)
        .set_max_expr_depths(64, 32)
        .set_max_string_size(max_string_bytes)
        .set_max_array_size(4096)
        .set_max_map_size(4096)
        .set_max_variables(128)
        .set_max_functions(128)
        .set_max_modules(0);
    engine.set_module_resolver(rhai::module_resolvers::DummyModuleResolver::new());
    engine.disable_symbol("eval");
    // Explicit refusal keeps direct and Fn("timestamp") calls diagnostic without
    // exposing BasicTimePackage.
    engine.register_fn("timestamp", || -> Result<Dynamic, Box<EvalAltResult>> {
        Err(Box::new(EvalAltResult::ErrorRuntime(
            "wall clock unavailable in pure JSON methods".into(),
            Position::NONE,
        )))
    });
    engine.on_print(|_| {});
    engine.on_debug(|_, _, _| {});
    let deadline = Instant::now() + Duration::from_millis(timeout_ms);
    engine.on_progress(move |_| {
        if cancel.is_cancelled() {
            Some(Dynamic::from(Terminal::Cancelled))
        } else if Instant::now() >= deadline {
            Some(Dynamic::from(Terminal::Timeout))
        } else {
            None
        }
    });
    engine.register_fn(
        "complete",
        move |value: Dynamic| -> Result<(), Box<EvalAltResult>> {
            let terminal = match dynamic_to_json(&value, max_output_bytes) {
                Ok(value) => Terminal::Complete(value),
                Err(JsonError::ByteLimit) => Terminal::OutputLimit,
                Err(JsonError::Invalid) => return Err("script method must return JSON".into()),
            };
            Err(Box::new(EvalAltResult::ErrorTerminated(
                Dynamic::from(terminal),
                Position::NONE,
            )))
        },
    );
    engine
}

fn compile_cached(source: &str, operations: u64, engine: &Engine) -> Result<Rc<rhai::AST>, String> {
    let digest: [u8; 32] = Sha256::digest(source.as_bytes()).into();
    let key = (digest, operations);
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
    let ast = Rc::new(
        engine
            .compile(source)
            .map_err(|e| format!("invalid Rhai method source: {e}"))?,
    );
    AST_CACHE.with(|cache| {
        let mut cache = cache.borrow_mut();
        if cache.len() >= AST_CACHE_CAPACITY {
            cache.pop_front();
        }
        cache.push_back((key, ast.clone()));
    });
    Ok(ast)
}

pub(super) fn validate(source: &str, operations: u64) -> Result<(), String> {
    let engine = engine(
        operations,
        60_000,
        MIN_STRING_LIMIT,
        MIN_STRING_LIMIT,
        CancellationToken::new(),
    );
    compile_cached(source, operations, &engine).map(|_| ())
}

pub(super) fn run(
    source: &str,
    input: Value,
    operations: u64,
    timeout_ms: u64,
    max_input_bytes: usize,
    max_output_bytes: usize,
    cancel: CancellationToken,
) -> Result<Value, ToolError> {
    if cancel.is_cancelled() {
        return Err(crate::tool_error("cancelled", "script method cancelled"));
    }
    let max_string_bytes = max_input_bytes
        .max(max_output_bytes)
        .clamp(MIN_STRING_LIMIT, MAX_STRING_LIMIT);
    let engine = engine(
        operations,
        timeout_ms,
        max_string_bytes,
        max_output_bytes,
        cancel,
    );
    let ast = compile_cached(source, operations, &engine)
        .map_err(|message| crate::tool_error("script_error", message))?;
    let mut scope = rhai::Scope::new();
    let input = json_to_dynamic(&input, max_input_bytes).map_err(|error| match error {
        JsonError::ByteLimit => crate::tool_error("input_limit", "script input exceeds byte limit"),
        JsonError::Invalid => {
            crate::tool_error("invalid_arguments", "script arguments cannot be converted")
        }
    })?;
    scope.push_dynamic("args", input);
    match engine.eval_ast_with_scope::<Dynamic>(&mut scope, &ast) {
        Ok(value) => dynamic_to_json(&value, max_output_bytes).map_err(|error| match error {
            JsonError::ByteLimit => {
                crate::tool_error("output_limit", "script result exceeds byte limit")
            }
            JsonError::Invalid => {
                crate::tool_error("invalid_output", "script method must return JSON")
            }
        }),
        Err(error) => {
            let mut root = &*error;
            while let EvalAltResult::ErrorInFunctionCall(_, _, inner, _)
            | EvalAltResult::ErrorInModule(_, inner, _) = root
            {
                root = inner;
            }
            if let EvalAltResult::ErrorTerminated(value, _) = root
                && let Some(terminal) = value.clone().try_cast::<Terminal>()
            {
                return match terminal {
                    Terminal::Complete(value) => Ok(value),
                    Terminal::OutputLimit => Err(crate::tool_error(
                        "output_limit",
                        "script result exceeds byte limit",
                    )),
                    Terminal::Cancelled => {
                        Err(crate::tool_error("cancelled", "script method cancelled"))
                    }
                    Terminal::Timeout => {
                        Err(crate::tool_error("timeout", "script method timed out"))
                    }
                };
            }
            let code = if matches!(root, EvalAltResult::ErrorTooManyOperations(_)) {
                "operation_limit"
            } else {
                "script_error"
            };
            Err(crate::tool_error(
                code,
                format!("Rhai method failed: {error}"),
            ))
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ast_cache_reuses_compiled_ast_and_respects_bound() {
        let eng = engine(
            10_000,
            5_000,
            MIN_STRING_LIMIT,
            MIN_STRING_LIMIT,
            CancellationToken::new(),
        );
        let first = compile_cached("#{v: args.n + 1}", 10_000, &eng).unwrap();
        let second = compile_cached("#{v: args.n + 1}", 10_000, &eng).unwrap();
        assert!(Rc::ptr_eq(&first, &second));

        for index in 0..(AST_CACHE_CAPACITY + 16) {
            let src = format!("let x = {index}; x");
            let _ = compile_cached(&src, 10_000, &eng).unwrap();
        }
        AST_CACHE.with(|cache| {
            assert!(cache.borrow().len() <= AST_CACHE_CAPACITY);
        });
    }

    #[test]
    fn sleep_is_absent_and_nested_container_bomb_is_blocked() {
        for expr in ["sleep(0)", "sleep(0.0)", "Fn(\"sleep\").call(0)"] {
            let err = run(
                expr,
                Value::Null,
                10_000,
                5_000,
                1024,
                1024,
                CancellationToken::new(),
            )
            .unwrap_err();
            assert_eq!(err.details.as_ref().unwrap()["code"], "script_error");
        }
        let bomb = "let a = [1, 2, 3, 4]; for i in 0..20 { a = [a, a]; } a";
        assert!(
            run(
                bomb,
                Value::Null,
                100_000,
                5_000,
                1024,
                1024 * 1024,
                CancellationToken::new(),
            )
            .is_err()
        );
    }
}
