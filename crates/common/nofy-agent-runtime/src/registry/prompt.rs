use super::*;
/// Built-in data-only prompt factory, installable without any product host.
pub struct PromptFactory;

/// Literal system text; unlike a template this never interprets braces.
pub struct StaticPromptFactory;

impl ModuleFactory for StaticPromptFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: "prompt.static".into(),
            revision: "1".into(),
            kind: ModuleKind::Prompt,
            config_schema: serde_json::json!({"type":"object","required":["text"],"additionalProperties":false,"properties":{"text":{"type":"string"}}}),
            input_schema: None,
            output_schema: Some(serde_json::json!({"type":"string"})),
            required_capabilities: BTreeSet::new(),
            dependencies: BTreeMap::new(),
        }
    }
    fn build(
        &self,
        config: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        let text = config["text"]
            .as_str()
            .ok_or_else(|| Error::Composition("prompt text must be a string".into()))?;
        Ok(ModuleInstance::Prompt(Arc::new(crate::StaticPrompt(
            text.into(),
        ))))
    }
}

impl ModuleFactory for PromptFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: "prompt.template".into(),
            revision: "1".into(),
            kind: ModuleKind::Prompt,
            config_schema: serde_json::json!({
                "type":"object", "required":["template"], "additionalProperties":false,
                "properties":{
                    "template":{"type":"string"},
                    "values":{"type":"object","additionalProperties":{"type":"string"}}
                }
            }),
            input_schema: None,
            output_schema: Some(serde_json::json!({"type":"string"})),
            required_capabilities: BTreeSet::new(),
            dependencies: BTreeMap::new(),
        }
    }
    fn build(
        &self,
        config: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        let mut prompt = crate::PromptTemplate::new(
            config["template"]
                .as_str()
                .ok_or_else(|| Error::Composition("template must be a string".into()))?,
        );
        if let Some(values) = config.get("values").and_then(Value::as_object) {
            for (name, value) in values {
                prompt = prompt.value(
                    name,
                    value.as_str().ok_or_else(|| {
                        Error::Composition(format!("prompt value {name} must be a string"))
                    })?,
                );
            }
        }
        Ok(ModuleInstance::Prompt(Arc::new(prompt)))
    }
}
