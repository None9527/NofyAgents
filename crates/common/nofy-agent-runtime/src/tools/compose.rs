//! Pure aggregation for module ports accepting a single ToolPack.
use crate::{Error, ToolCatalog, registry::*};
use serde_json::{Value, json};
use std::collections::BTreeMap;
pub struct ComposeFactory;
impl ModuleFactory for ComposeFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: "tool.compose".into(),
            revision: "1".into(),
            kind: ModuleKind::ToolPack,
            config_schema: json!({"type":"object","additionalProperties":false,"required":["packs"],"properties":{"packs":{"type":"array","minItems":1,"maxItems":128,"uniqueItems":true,"items":{"type":"string","minLength":1,"maxLength":128}}}}),
            input_schema: None,
            output_schema: None,
            required_capabilities: Default::default(),
            dependencies: Default::default(),
        }
    }
    fn config_dependencies(&self, value: &Value) -> Result<BTreeMap<String, ModuleKind>, Error> {
        crate::settings::validate_json_value(&self.descriptor().config_schema, value)?;
        Ok(value["packs"]
            .as_array()
            .expect("validated packs")
            .iter()
            .map(|v| {
                (
                    v.as_str().expect("validated name").into(),
                    ModuleKind::ToolPack,
                )
            })
            .collect())
    }
    fn build(
        &self,
        value: &Value,
        deps: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        self.config_dependencies(value)?;
        let mut tools = ToolCatalog::new();
        for slot in value["packs"].as_array().expect("validated packs") {
            let slot = slot.as_str().expect("validated slot");
            let Some(ModuleInstance::ToolPack(pack)) = deps.get(slot) else {
                return Err(Error::Composition(format!(
                    "tool.compose missing ToolPack {slot}"
                )));
            };
            tools.extend(pack.clone())?;
        }
        Ok(ModuleInstance::ToolPack(tools))
    }
}
