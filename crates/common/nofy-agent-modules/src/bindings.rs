//! Explicit context bindings, independent of any policy vocabulary.
use nofy_agent_runtime::{Error, context::ContextBinding, registry::*};
use serde::Deserialize;
use serde_json::{Value, json};
use std::{collections::BTreeMap, path::PathBuf, sync::Arc};

pub struct DeclaredCwdFactory;
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Config {
    cwd: PathBuf,
}
struct Binding(PathBuf);
impl ContextBinding for Binding {
    fn bind(&self, context: &mut nofy_agent_runtime::RunContext) -> Result<(), Error> {
        if context
            .capabilities
            .get::<nofy_tool_runtime::Cwd>()
            .is_some_and(|cwd| cwd.0 != self.0)
        {
            return Err(Error::Composition(
                "declared cwd cannot replace a different host-bound cwd".into(),
            ));
        }
        context
            .capabilities
            .insert(nofy_tool_runtime::Cwd(self.0.clone()));
        Ok(())
    }
}
impl ModuleFactory for DeclaredCwdFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: "binding.cwd".into(),
            revision: "1".into(),
            kind: ModuleKind::Binding,
            config_schema: json!({"type":"object","additionalProperties":false,"required":["cwd"],"properties":{"cwd":{"type":"string","minLength":1,"maxLength":4096}}}),
            input_schema: None,
            output_schema: None,
            dependencies: BTreeMap::new(),
            required_capabilities: Default::default(),
        }
    }
    fn build(
        &self,
        config: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        nofy_agent_runtime::settings::validate_json_value(
            &self.descriptor().config_schema,
            config,
        )?;
        let config: Config = serde_json::from_value(config.clone())
            .map_err(|_| Error::Composition("invalid declared cwd".into()))?;
        crate::scope_program::validate_cwd(&config.cwd)?;
        Ok(ModuleInstance::Binding(Arc::new(Binding(config.cwd))))
    }
}
