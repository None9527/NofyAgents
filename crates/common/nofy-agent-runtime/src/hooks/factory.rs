use super::*;
use crate::registry::{ModuleDescriptor, ModuleFactory, ModuleInstance, ModuleKind};

/// One subscription per module. Multiple modules form an ordered bus; handler
/// implementations are native, executor or workflow modules in the graph.
pub struct HookFactory {
    catalog: EventCatalog,
}
impl HookFactory {
    pub fn new(catalog: EventCatalog) -> Self {
        Self { catalog }
    }
}
impl ModuleFactory for HookFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: "hook.subscription".into(),
            revision: serde_json::to_string(&(1u32, self.catalog.declarations()))
                .expect("event declarations serialize"),
            kind: ModuleKind::Hook,
            config_schema: json!({"type":"object","additionalProperties":false,"required":["event"],"properties":{
                "event":{"type":"string","enum":self.catalog.events.keys().collect::<Vec<_>>()},"priority":{"type":"integer"},
                "timeout_ms":{"type":"integer","minimum":1,"maximum":600000},"failure":{"enum":["open","closed"]},
                "matches":{"type":["object","null"],"additionalProperties":false,"required":["pointer","equals"],"properties":{"pointer":{"type":"string"},"equals":{}}}
            }}),
            input_schema: None,
            output_schema: None,
            dependencies: BTreeMap::from([("handler".into(), ModuleKind::HookHandler)]),
            required_capabilities: Default::default(),
        }
    }
    fn build(
        &self,
        config: &Value,
        dependencies: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        let rule: HookRule = serde_json::from_value(config.clone())
            .map_err(|e| Error::Composition(format!("hook.subscription: {e}")))?;
        let declaration = self.catalog.get(&rule.event).cloned().ok_or_else(|| {
            Error::Composition("hook event has no installed producer declaration".into())
        })?;
        let Some(ModuleInstance::HookHandler(handler)) = dependencies.get("handler") else {
            return Err(Error::Composition(
                "hook requires a handler dependency".into(),
            ));
        };
        // The compiler adds the complete module reference and resolved factory
        // identity. Direct users must give registrations unique identities.
        let identity = serde_json::to_string(&(self.descriptor().revision, config))
            .map_err(|e| Error::Composition(e.to_string()))?;
        Ok(ModuleInstance::Hook(Arc::new(HookRegistration::new(
            identity,
            declaration,
            rule,
            handler.clone(),
        )?)))
    }
}
