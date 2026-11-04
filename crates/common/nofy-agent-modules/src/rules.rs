//! Ordered instruction files captured by the system declaration, never found
//! by reading a server-side path or scanning an ambient home directory.
use nofy_agent_runtime::{
    Error, Message, RunContext, RunState, memory::ContextSource, registry::*,
};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use std::{collections::BTreeMap, sync::Arc};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RuleFile {
    pub file_name: String,
    pub file_path: String,
    pub content: String,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct FrozenRules {
    pub files: Vec<RuleFile>,
}
impl FrozenRules {
    pub fn validate(&self) -> Result<(), Error> {
        let bytes = self.files.iter().try_fold(0usize, |sum, file| {
            sum.checked_add(file.content.len() + file.file_name.len() + file.file_path.len())
        });
        if self.files.len() > 256 || bytes.is_none_or(|n| n > 1024 * 1024) {
            return Err(Error::Composition("rules exceed 256 files or 1 MiB".into()));
        }
        Ok(())
    }
}
#[async_trait::async_trait]
impl ContextSource for FrozenRules {
    async fn contribute(&self, _: &RunState, _: &RunContext) -> Result<Vec<Message>, Error> {
        self.validate()?;
        if self.files.is_empty() {
            return Ok(vec![]);
        }
        let pattern = regex::Regex::new(r"(?i)<(\s*/?\s*system[-_]reminder)")
            .expect("static reminder grammar");
        let mut text = String::from(
            "<system-reminder>\nDeclared project instructions in order; later entries take precedence.\n",
        );
        for file in &self.files {
            text.push_str(&format!(
                "\n## From: {}\n{}\n",
                pattern.replace_all(&file.file_path, "&lt;$1"),
                pattern.replace_all(&file.content, "&lt;$1")
            ));
        }
        text.push_str("</system-reminder>");
        Ok(vec![Message::User { content: text }])
    }
}
pub struct RulesFactory;
impl ModuleFactory for RulesFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: "context.rules".into(),
            revision: "2:declared-rules".into(),
            kind: ModuleKind::ContextSource,
            config_schema: json!({"type":"object","additionalProperties":false,"required":["files"],"properties":{"files":{"type":"array","maxItems":256,"items":{"type":"object","additionalProperties":false,"required":["file_name","file_path","content"],"properties":{"file_name":{"type":"string","maxLength":4096},"file_path":{"type":"string","maxLength":4096},"content":{"type":"string","maxLength":1048576}}}}}}),
            input_schema: None,
            output_schema: None,
            dependencies: BTreeMap::new(),
            required_capabilities: Default::default(),
        }
    }
    fn build(
        &self,
        value: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        nofy_agent_runtime::settings::validate_json_value(&self.descriptor().config_schema, value)?;
        let rules: FrozenRules =
            serde_json::from_value(value.clone()).map_err(|e| Error::Composition(e.to_string()))?;
        rules.validate()?;
        Ok(ModuleInstance::ContextSource(Arc::new(rules)))
    }
}
