//! Explicit imports freeze the existing loaders' precedence and provenance.
//! Factories render only captured content and never rediscover the host HOME.
use crate::prompt::{
    agents_md::*,
    skills::{CompatConfig, SkillsConfig},
};
use nofy_agent_runtime::{
    Error, Message, RunContext, RunState, memory::ContextSource, registry::*,
};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use sha2::{Digest, Sha256};
use std::{collections::BTreeMap, path::PathBuf, sync::Arc};

#[derive(Clone, Default)]
pub struct ImportRoots {
    pub cwd: Option<PathBuf>,
    pub workspace_user_dir: Option<PathBuf>,
    pub nofy_home: Option<PathBuf>,
    pub home: Option<PathBuf>,
}
impl ImportRoots {
    fn validate(&self) -> Result<(), Error> {
        for path in [
            &self.cwd,
            &self.workspace_user_dir,
            &self.nofy_home,
            &self.home,
        ]
        .into_iter()
        .flatten()
        {
            if !path.is_absolute() {
                return Err(Error::Composition(
                    "import roots must be explicit absolute paths".into(),
                ));
            }
        }
        Ok(())
    }
    pub async fn rules(&self, compat: CompatConfig) -> Result<FrozenRules, Error> {
        self.validate()?;
        let cwd = self
            .cwd
            .as_ref()
            .map(|cwd| {
                cwd.to_str()
                    .ok_or_else(|| Error::Composition("non-UTF8 project root".into()))
            })
            .transpose()?;
        let files = read_agents_config_in_roots(
            cwd,
            self.workspace_user_dir.as_deref(),
            compat,
            self.nofy_home.clone(),
            self.home.clone(),
        )
        .await;
        let frozen = FrozenRules { files };
        frozen.validate()?;
        Ok(frozen)
    }
    pub async fn skills(
        &self,
        config: &SkillsConfig,
        plugins: Option<&crate::plugins::PluginRegistry>,
        compat: CompatConfig,
    ) -> Result<super::skills::FrozenSkills, Error> {
        self.validate()?;
        let cwd = self.cwd.as_ref().map(|path| {
            dunce::canonicalize(path)
                .unwrap_or_else(|_| path.clone())
                .to_string_lossy()
                .to_string()
        });
        let mut skills = crate::prompt::skills::list_skills_from_roots(
            cwd.as_deref(),
            config,
            plugins,
            compat,
            self.workspace_user_dir.as_deref(),
            self.nofy_home.as_deref(),
            self.home.as_deref(),
        )
        .await;
        for skill in &mut skills {
            let body = nofy_tools::implementations::skills::skill::load_skill_content(skill)
                .await
                .map_err(|e| Error::Composition(format!("skill import failed: {e}")))?;
            skill.body = Some(body);
        }
        let result = super::skills::FrozenSkills {
            skills,
            cwd,
            ..Default::default()
        };
        result.validate()?;
        Ok(result)
    }
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct FrozenRules {
    pub files: Vec<AgentConfigFile>,
}
impl FrozenRules {
    fn validate(&self) -> Result<(), Error> {
        if self.files.len() > 256
            || self
                .files
                .iter()
                .map(|file| file.content.len())
                .sum::<usize>()
                > 1024 * 1024
        {
            return Err(Error::Composition(
                "rules import exceeds 256 files or 1 MiB".into(),
            ));
        }
        Ok(())
    }
    /// Source identities accompany preview/import output, while the complete
    /// frozen files are retained in the module's compilation snapshot.
    pub fn provenance(&self) -> Vec<super::prompt::PromptOrigin> {
        self.files
            .iter()
            .map(|file| super::prompt::PromptOrigin {
                kind: "instruction_file".into(),
                reference: file.file_name.clone(),
                version: format!("{:x}", Sha256::digest(file.content.as_bytes())),
                location: Some(file.file_path.clone()),
            })
            .collect()
    }
}
#[async_trait::async_trait]
impl ContextSource for FrozenRules {
    async fn contribute(&self, _: &RunState, _: &RunContext) -> Result<Vec<Message>, Error> {
        Ok(format_agents_md_section(&self.files)
            .map(|content| vec![Message::User { content }])
            .unwrap_or_default())
    }
}
pub struct RulesFactory;
impl ModuleFactory for RulesFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: "context.rules".into(),
            revision: "1".into(),
            kind: ModuleKind::ContextSource,
            config_schema: json!({"type":"object","additionalProperties":false,"required":["files"],"properties":{"files":{"type":"array","maxItems":256,"items":{
                "type":"object","additionalProperties":false,"required":["file_name","file_path","content"],"properties":{"file_name":{"type":"string"},"file_path":{"type":"string"},"content":{"type":"string","maxLength":1048576}}
            }}}}),
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
        let rules: FrozenRules = serde_json::from_value(config.clone())
            .map_err(|e| Error::Composition(e.to_string()))?;
        rules.validate()?;
        Ok(ModuleInstance::ContextSource(Arc::new(rules)))
    }
}
