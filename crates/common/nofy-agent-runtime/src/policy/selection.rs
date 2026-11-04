//! A neutral conjunction combinator; selection never replaces another policy.
use super::*;
use crate::registry::*;
use serde_json::{Value, json};
use std::collections::{BTreeMap, BTreeSet};

pub struct OnToolsFactory;
struct Selection {
    names: BTreeSet<String>,
    policy: Arc<dyn Policy>,
}
#[async_trait]
impl Policy for Selection {
    async fn admit(
        &self,
        call: &ToolCall,
        state: &RunState,
        context: &RunContext,
    ) -> Result<Admission, Error> {
        if self.names.contains(&call.name) {
            self.policy.admit(call, state, context).await
        } else {
            Ok(Admission::Allow)
        }
    }
}
impl ModuleFactory for OnToolsFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: "policy.on_tools".into(),
            revision: "1".into(),
            kind: ModuleKind::Policy,
            config_schema: json!({"type":"object","additionalProperties":false,"required":["tools"],"properties":{"tools":{"type":"array","minItems":1,"maxItems":128,"uniqueItems":true,"items":{"type":"string","minLength":1,"maxLength":128}}}}),
            input_schema: None,
            output_schema: None,
            dependencies: [("policy".into(), ModuleKind::Policy)].into(),
            required_capabilities: Default::default(),
        }
    }
    fn build(
        &self,
        config: &Value,
        dependencies: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        crate::settings::validate_json_value(&self.descriptor().config_schema, config)?;
        #[derive(Deserialize)]
        #[serde(deny_unknown_fields)]
        struct Config {
            tools: Vec<String>,
        }
        let config: Config = serde_json::from_value(config.clone())
            .map_err(|e| Error::Composition(e.to_string()))?;
        let Some(ModuleInstance::Policy(policy)) = dependencies.get("policy") else {
            return Err(Error::Composition(
                "policy.on_tools requires its declared policy".into(),
            ));
        };
        let mut names = BTreeSet::new();
        for name in config.tools {
            nofy_tool_protocol::ToolId::new(&name)
                .map_err(|e| Error::Composition(e.to_string()))?;
            if !names.insert(name) {
                return Err(Error::Composition("duplicate policy tool selection".into()));
            }
        }
        Ok(ModuleInstance::Policy(Arc::new(Selection {
            names,
            policy: policy.clone(),
        })))
    }
}
