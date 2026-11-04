use nofy_tool_runtime::ToolError;
use rhai::{Dynamic, Engine, EvalAltResult, OptimizationLevel, Position};
use serde_json::Value;
use tokio_util::sync::CancellationToken;
#[derive(Clone)]
enum Terminal {
    Complete(Value),
    Cancelled,
}
fn engine(operations: u64, cancel: CancellationToken) -> Engine {
    let mut engine = Engine::new();
    engine
        .set_optimization_level(OptimizationLevel::None)
        .set_max_operations(operations)
        .set_max_call_levels(16)
        .set_max_expr_depths(128, 64)
        .set_max_string_size(1024 * 1024)
        .set_max_array_size(4096)
        .set_max_map_size(4096)
        .set_max_variables(128)
        .set_max_functions(128);
    engine.set_module_resolver(rhai::module_resolvers::DummyModuleResolver::new());
    engine.disable_symbol("eval");
    // The standard package exposes an ambient clock. Pure methods use frozen
    // input time; overriding the zero-argument constructor also closes Fn calls.
    engine.register_fn("timestamp", || -> Result<Dynamic, Box<EvalAltResult>> {
        Err(Box::new(EvalAltResult::ErrorRuntime(
            "wall clock unavailable in pure JSON methods".into(),
            Position::NONE,
        )))
    });
    engine.on_print(|_| {});
    engine.on_debug(|_, _, _| {});
    engine.on_progress(move |_| {
        cancel
            .is_cancelled()
            .then(|| Dynamic::from(Terminal::Cancelled))
    });
    engine.register_fn(
        "complete",
        |value: Dynamic| -> Result<(), Box<EvalAltResult>> {
            let value = rhai::serde::from_dynamic::<Value>(&value)?;
            Err(Box::new(EvalAltResult::ErrorTerminated(
                Dynamic::from(Terminal::Complete(value)),
                Position::NONE,
            )))
        },
    );
    engine
}
pub(super) fn validate(source: &str, operations: u64) -> Result<(), String> {
    engine(operations, CancellationToken::new())
        .compile(source)
        .map(|_| ())
        .map_err(|e| format!("invalid Rhai method source: {e}"))
}
pub(super) fn run(
    source: &str,
    input: Value,
    operations: u64,
    cancel: CancellationToken,
) -> Result<Value, ToolError> {
    if cancel.is_cancelled() {
        return Err(crate::tool_error("cancelled", "script method cancelled"));
    }
    let engine = engine(operations, cancel);
    let mut scope = rhai::Scope::new();
    let input = rhai::serde::to_dynamic(input).map_err(|_| {
        crate::tool_error("invalid_arguments", "script arguments cannot be converted")
    })?;
    scope.push_dynamic("args", input);
    match engine.eval_with_scope::<Dynamic>(&mut scope, source) {
        Ok(value) => rhai::serde::from_dynamic(&value)
            .map_err(|_| crate::tool_error("invalid_output", "script method must return JSON")),
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
                    Terminal::Cancelled => {
                        Err(crate::tool_error("cancelled", "script method cancelled"))
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
