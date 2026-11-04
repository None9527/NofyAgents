use super::{Program, invalid};
use nofy_agent_runtime::{Error, RunContext};
use rhai::packages::{
    ArithmeticPackage, BasicArrayPackage, BasicFnPackage, BasicIteratorPackage, BasicMapPackage,
    BasicStringPackage, LogicPackage, MoreStringPackage, Package,
};
use rhai::{Dynamic, Engine, OptimizationLevel};
use serde_json::Value;
use std::{
    path::{Component, Path, PathBuf},
    time::{Duration, Instant},
};

fn engine(program: &Program, context: &RunContext) -> Engine {
    // Standard/LanguageCore packages include blocking sleep; the time package
    // exposes an ambient clock. Install only the explicit pure capability set.
    let mut engine = Engine::new_raw();
    ArithmeticPackage::new().register_into_engine(&mut engine);
    LogicPackage::new().register_into_engine(&mut engine);
    BasicStringPackage::new().register_into_engine(&mut engine);
    MoreStringPackage::new().register_into_engine(&mut engine);
    BasicIteratorPackage::new().register_into_engine(&mut engine);
    BasicArrayPackage::new().register_into_engine(&mut engine);
    BasicMapPackage::new().register_into_engine(&mut engine);
    BasicFnPackage::new().register_into_engine(&mut engine);
    engine
        .set_optimization_level(OptimizationLevel::None)
        .set_max_operations(program.limits.max_operations)
        .set_max_call_levels(32)
        .set_max_expr_depths(64, 32)
        .set_max_string_size(
            program
                .limits
                .max_input_bytes
                .max(program.limits.max_output_bytes),
        )
        .set_max_array_size(16384)
        .set_max_map_size(4096)
        .set_max_variables(256)
        .set_max_functions(128);
    engine.set_module_resolver(rhai::module_resolvers::DummyModuleResolver::new());
    engine.disable_symbol("eval");
    engine.on_print(|_| {});
    engine.on_debug(|_, _, _| {});
    let cancel = context.cancel.clone();
    let deadline = Instant::now() + Duration::from_millis(program.limits.timeout_ms);
    engine.on_progress(move |_| {
        (cancel.is_cancelled() || Instant::now() >= deadline)
            .then(|| Dynamic::from("scope_program_stopped"))
    });
    engine.register_fn(
        "json_parse",
        |text: &str| -> Result<Dynamic, Box<rhai::EvalAltResult>> {
            let value: Value = serde_json::from_str(text).map_err(|_| "invalid JSON")?;
            super::json::dynamic(&value)
        },
    );
    let json_limit = program.limits.max_input_bytes;
    engine.register_fn(
        "json_string",
        move |value: Dynamic| -> Result<String, Box<rhai::EvalAltResult>> {
            serde_json::to_string(&super::json::value(&value, json_limit)?)
                .map_err(|_| "invalid JSON value".into())
        },
    );
    engine.register_fn(
        "glob_matches",
        |pattern: &str, text: &str| -> Result<bool, Box<rhai::EvalAltResult>> {
            if pattern.len() > 1024 || text.len() > 16384 {
                return Err("glob input limit".into());
            }
            let matcher = globset::GlobBuilder::new(pattern)
                .literal_separator(true)
                .build()
                .map_err(|_| "invalid glob")?
                .compile_matcher();
            Ok(matcher.is_match(text))
        },
    );
    engine.register_fn("relative_path", |base: &str, value: &str| -> Dynamic {
        relative_path(base, value).map_or(Dynamic::UNIT, Dynamic::from)
    });
    engine
}
fn normalize(path: &Path) -> Option<PathBuf> {
    let mut result = PathBuf::new();
    for part in path.components() {
        match part {
            Component::RootDir => result.push(part.as_os_str()),
            Component::Normal(value) => result.push(value),
            Component::CurDir => {}
            Component::ParentDir => {
                if !result.pop() {
                    return None;
                }
            }
            Component::Prefix(_) => return None,
        }
    }
    Some(result)
}
/// Lexical only. Actual filesystem confinement must also reject symlink escapes.
fn relative_path(base: &str, value: &str) -> Option<String> {
    if base.len() > 4096
        || value.len() > 16384
        || [base, value]
            .iter()
            .any(|s| s.contains('\\') || s.chars().any(char::is_control))
    {
        return None;
    }
    let base = normalize(Path::new(base))?;
    if !base.is_absolute() {
        return None;
    }
    let path = normalize(&base.join(value))?;
    let relative = path.strip_prefix(base).ok()?;
    Some(relative.to_str()?.to_owned())
}
pub(super) fn validate(program: &Program) -> Result<(), Error> {
    let engine = engine(program, &RunContext::default());
    let ast = engine
        .compile(&program.source)
        .map_err(|_| invalid("invalid scope source"))?;
    if !ast
        .iter_functions()
        .any(|function| function.name == "scope" && function.params.len() == 1)
    {
        return Err(invalid("scope program requires scope(input)"));
    }
    Ok(())
}
pub(super) fn evaluate(
    program: &Program,
    input: Value,
    context: &RunContext,
) -> Result<Value, Error> {
    if context.cancel.is_cancelled() {
        return Err(Error::Cancelled);
    }
    let engine = engine(program, context);
    let ast = engine
        .compile(&program.source)
        .map_err(|_| invalid("invalid scope source"))?;
    let input = super::json::dynamic(&input)
        .map_err(|_| invalid("scope input is not representable JSON"))?;
    let result = engine.call_fn::<Dynamic>(&mut rhai::Scope::new(), &ast, "scope", (input,));
    if context.cancel.is_cancelled() {
        return Err(Error::Cancelled);
    }
    let result = result.map_err(|_| invalid("scope program failed or exceeded its limits"))?;
    super::json::value(&result, program.limits.max_output_bytes)
        .map_err(|_| invalid("scope result is not bounded JSON"))
}
