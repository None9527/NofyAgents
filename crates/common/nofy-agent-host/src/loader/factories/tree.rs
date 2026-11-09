//! One declaration-driven transport, not a programming Agent main loop.
use super::*;
#[cfg(target_os = "linux")]
pub(in crate::loader) mod launch;
#[cfg(target_os = "linux")]
mod native;
#[cfg(not(target_os = "linux"))]
use super::unavailable as native;

pub(in crate::loader) struct TreeArtifactFactory;
impl ModuleFactory for TreeArtifactFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        let mut descriptor = ProcessArtifactFactory.descriptor();
        descriptor.factory = "tool.process_tree_artifact".into();
        descriptor.revision = "confined-process-tree-v2".into();
        descriptor
            .dependencies
            .insert("tree".into(), ModuleKind::Resource);
        descriptor.config_schema["properties"]
            .as_object_mut()
            .expect("schema properties")
            .remove("scratch_files");
        for bound in ["max_input_bytes", "max_output_bytes"] {
            descriptor.config_schema["properties"]["contract"]["properties"][bound]["maximum"] =
                json!(8388608);
        }
        descriptor
    }
    fn config_dependencies(
        &self,
        value: &Value,
    ) -> std::result::Result<BTreeMap<String, ModuleKind>, Error> {
        nofy_agent_runtime::settings::validate_json_value(&self.descriptor().config_schema, value)?;
        let config: ToolConfig = serde_json::from_value(value.clone()).map_err(error)?;
        let slots = config.directory_dependencies()?;
        if slots.contains_key("tree") {
            return Err(error("tree is a reserved resource slot"));
        }
        Ok(slots)
    }
    fn build(
        &self,
        value: &Value,
        deps: &BTreeMap<String, ModuleInstance>,
    ) -> std::result::Result<ModuleInstance, Error> {
        self.config_dependencies(value)?;
        let config: ToolConfig = serde_json::from_value(value.clone()).map_err(error)?;
        config.contract.validate()?;
        config.input.validate()?;
        nofy_agent_runtime::artifact::entry_path(&config.entrypoint)?;
        native::tree(config, deps)
    }
}
