use super::*;
use nofy_agent_runtime::registry::*;
use serde_json::{Value, json};

pub struct MemoryFactory {
    resources: MemoryResources,
    revision: String,
    kind: ModuleKind,
}
impl MemoryFactory {
    pub fn tools(resources: MemoryResources) -> Self {
        Self::new(resources, ModuleKind::ToolPack)
    }
    pub fn context(resources: MemoryResources) -> Self {
        Self::new(resources, ModuleKind::ContextSource)
    }
    pub fn capture(resources: MemoryResources) -> Self {
        Self::new(resources, ModuleKind::HookHandler)
    }
    fn new(resources: MemoryResources, kind: ModuleKind) -> Self {
        let manifest = resources
            .iter()
            .map(|(id, resource)| (id, &resource.identity))
            .collect::<Vec<_>>();
        let revision = format!(
            "1:{}",
            blake3::hash(&serde_json::to_vec(&manifest).expect("resource identity serialization"))
        );
        Self {
            resources,
            revision,
            kind,
        }
    }
}
impl ModuleFactory for MemoryFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        let all_properties = json!({
            "resource":{"enum":self.resources.keys().collect::<Vec<_>>()},
            "read":{"$ref":"#/$defs/areas"},"write":{"$ref":"#/$defs/areas"},"child_read":{"$ref":"#/$defs/areas"},"child_write":{"$ref":"#/$defs/areas"},
            "capture":{"type":"boolean"},"consolidate":{"type":"boolean"},"tool_name":{"type":"string","minLength":1},
            "operations":{"type":"array","minItems":1,"uniqueItems":true,"items":{"enum":operations::OPERATIONS}},"max_items":{"type":"integer","minimum":1,"maximum":100}
        });
        let properties = all_properties
            .as_object()
            .unwrap()
            .iter()
            .filter(|(key, _)| self.accepts(key))
            .map(|(key, value)| (key.clone(), value.clone()))
            .collect::<serde_json::Map<_, _>>();
        ModuleDescriptor {
            factory: match self.kind {
                ModuleKind::ToolPack => "tool.memory",
                ModuleKind::ContextSource => "context.memory",
                _ => "hook.memory_capture",
            }
            .into(),
            revision: self.revision.clone(),
            kind: self.kind,
            config_schema: json!({"type":"object","additionalProperties":false,"required":["resource"],"properties":properties,
                "$defs":{"areas":{"type":"array","uniqueItems":true,"items":{"enum":["personal","project"]}}}}),
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
        if config
            .as_object()
            .is_none_or(|fields| fields.keys().any(|key| !self.accepts(key)))
        {
            return Err(composition(
                "memory factory received options for another module kind",
            ));
        }
        let mut config: MemoryModuleConfig =
            serde_json::from_value(config.clone()).map_err(|e| composition(e.to_string()))?;
        if self.kind == ModuleKind::HookHandler {
            config.read.clear();
            config.operations = vec!["capture".into()];
        }
        let resource = self
            .resources
            .get(&config.resource)
            .ok_or_else(|| composition("memory resource is not installed"))?;
        let module = MemoryModule::bind(resource.clone(), config)?;
        match self.kind {
            ModuleKind::ToolPack => Ok(ModuleInstance::ToolPack(module.tools()?)),
            ModuleKind::ContextSource => Ok(ModuleInstance::ContextSource(Arc::new(module))),
            ModuleKind::HookHandler if module.config.capture => {
                Ok(ModuleInstance::HookHandler(Arc::new(module)))
            }
            _ => Err(composition(
                "capture handler requires admitted capture=true",
            )),
        }
    }
}
impl MemoryFactory {
    fn accepts(&self, key: &str) -> bool {
        match self.kind {
            ModuleKind::ContextSource => {
                matches!(key, "resource" | "read" | "child_read" | "max_items")
            }
            ModuleKind::HookHandler => matches!(key, "resource" | "capture"),
            _ => true,
        }
    }
}
