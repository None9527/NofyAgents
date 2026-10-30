//! Frozen skill bodies with the original conditional listing, substitutions
//! and invocation framing. Live filesystem imports belong to the host.
use nofy_agent_runtime::{memory::ContextSource, registry::*, *};
use nofy_tool_runtime::{ToolCallContext, ToolDispatch, ToolStream, TypedToolOutput};
use nofy_tools::{
    implementations::skills::{skill::*, types::SkillInfo},
    types::skill_discovery_tracker::SkillManager,
};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use sha2::{Digest, Sha256};
use std::{
    collections::{BTreeMap, BTreeSet},
    path::{Path, PathBuf},
    sync::Arc,
};

mod execution;
mod scope;
pub use execution::SkillExecutionSpec;
pub use scope::{ExactSkillScopeCompiler, SkillScopeCompiler, SkillToolScope};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(default, deny_unknown_fields)]
pub struct FrozenSkills {
    pub skills: Vec<SkillInfo>,
    pub cwd: Option<String>,
    pub skill_tool_name: String,
    pub read_tool_name: String,
    pub context_window_tokens: Option<u64>,
    pub listing_budget_percent: Option<f64>,
    pub execution: Option<SkillExecutionSpec>,
}
impl Default for FrozenSkills {
    fn default() -> Self {
        Self {
            skills: vec![],
            cwd: None,
            skill_tool_name: "skill".into(),
            read_tool_name: "read_file".into(),
            context_window_tokens: None,
            listing_budget_percent: None,
            execution: None,
        }
    }
}
/// A host may contribute file touches from provider-specific conversation
/// items. Generic tool transcripts are recognized directly as well.
#[derive(Clone, Default)]
pub struct SkillPathContext(pub Vec<PathBuf>);

impl FrozenSkills {
    pub fn validate(&self) -> Result<(), Error> {
        if self.skills.len() > 1024
            || self
                .skills
                .iter()
                .map(|skill| skill.body.as_ref().map_or(0, String::len))
                .sum::<usize>()
                > 4 * 1024 * 1024
            || self
                .cwd
                .as_ref()
                .is_some_and(|path| !Path::new(path).is_absolute())
            || self.context_window_tokens.is_some_and(|tokens| tokens == 0)
            || self
                .listing_budget_percent
                .is_some_and(|percent| !(0.0..=1.0).contains(&percent))
        {
            return Err(Error::Composition(
                "invalid or oversized frozen skill bundle".into(),
            ));
        }
        nofy_tool_protocol::ToolId::new(&self.skill_tool_name)
            .map_err(|e| Error::Composition(e.to_string()))?;
        if let Some(execution) = &self.execution {
            execution.dependencies()?;
        }
        let mut names = BTreeSet::new();
        for skill in &self.skills {
            if skill.body.is_none() || !names.insert(skill.dedup_key()) {
                return Err(Error::Composition(
                    "skills require captured bodies and unique qualified identities".into(),
                ));
            }
        }
        Ok(())
    }
    pub fn package_modules(&self) -> BTreeMap<String, ModuleRef> {
        self.skills
            .iter()
            .filter_map(|skill| {
                skill.plugin_name.as_ref().map(|name| {
                    let version = skill.plugin_version.clone().unwrap_or_else(|| {
                        format!(
                            "content:{:x}",
                            Sha256::digest(skill.body.as_deref().unwrap_or_default().as_bytes())
                        )
                    });
                    (
                        skill.dedup_key(),
                        ModuleRef::new(format!("plugin:{name}"), version),
                    )
                })
            })
            .collect()
    }
    fn manager(&self, touched: &[PathBuf]) -> SkillManager {
        let mut manager = SkillManager::new();
        manager.set_skill_tool_name(self.skill_tool_name.clone());
        manager.set_read_tool_name(self.read_tool_name.clone());
        manager.seed(
            self.cwd.as_ref().map(PathBuf::from),
            None,
            self.skills.clone(),
            None,
            self.context_window_tokens,
            self.listing_budget_percent,
        );
        let refs = touched.iter().map(PathBuf::as_path).collect::<Vec<_>>();
        manager.activate_conditional_skills_for_paths(&refs);
        manager
    }
    fn touched(&self, state: &RunState, context: &RunContext) -> Vec<PathBuf> {
        let mut touched = context
            .capabilities
            .get::<SkillPathContext>()
            .as_deref()
            .cloned()
            .unwrap_or_default()
            .0;
        let succeeded = state.messages.iter().filter_map(|message| match message {
            Message::Tool { call_id, is_error: false, content } => {
                let payload = content.get("value").unwrap_or(content);
                if let Some(output) = payload.get("output").and_then(|output| serde_json::from_value::<nofy_tools::types::output::ToolOutput>(output.clone()).ok()) {
                    touched.extend(nofy_tools::reminders::skill_discovery::SkillDiscoveryReminder::extract_activation_paths(&output));
                }
                Some(call_id.as_str())
            }
            _ => None,
        }).collect::<BTreeSet<_>>();
        for message in &state.messages {
            if let Message::Assistant { tool_calls, .. } = message {
                for call in tool_calls
                    .iter()
                    .filter(|call| succeeded.contains(call.id.as_str()))
                {
                    for key in ["path", "file_path", "filePath", "target_file"] {
                        if let Some(path) = call.arguments.get(key).and_then(Value::as_str) {
                            let path = PathBuf::from(path);
                            touched.push(if path.is_absolute() {
                                path
                            } else {
                                self.cwd
                                    .as_ref()
                                    .map_or(path.clone(), |cwd| Path::new(cwd).join(&path))
                            });
                        }
                    }
                }
            }
        }
        touched
    }
    pub fn invoke(
        &self,
        name: &str,
        args: Option<&str>,
        user_initiated: bool,
        context: &RunContext,
    ) -> Result<SkillOutput, Error> {
        let skill = self.available(name, user_initiated)?;
        if self.execution.is_some() || has_overrides(skill) {
            return Err(Error::Composition(
                "skill execution overrides require compiled execution bindings".into(),
            ));
        }
        self.render_selected(skill, args, context)
    }
    fn available(&self, name: &str, user_initiated: bool) -> Result<&SkillInfo, Error> {
        self.skills
            .iter()
            .find(|skill| {
                skill.dedup_key() == name || skill.plugin_name.is_none() && skill.name == name
            })
            .filter(|skill| {
                skill.enabled
                    && skill.user_invocable
                    && (user_initiated || !skill.disable_model_invocation)
            })
            .ok_or_else(|| Error::Tool("skill is unavailable for this invocation source".into()))
    }
    fn render_selected(
        &self,
        skill: &SkillInfo,
        args: Option<&str>,
        context: &RunContext,
    ) -> Result<SkillOutput, Error> {
        let mut body = skill
            .body
            .clone()
            .ok_or_else(|| Error::Composition("skill body was not frozen".into()))?;
        cap_skill_body(&mut body);
        let skill_dir = Path::new(&skill.path).parent().and_then(Path::to_str);
        apply_substitutions(
            &mut body,
            args,
            &SubstitutionContext {
                skill_dir,
                session_id: Some(&context.thread_id),
                plugin_root: skill.plugin_root.as_deref(),
                plugin_data: skill.plugin_data.as_deref(),
            },
        );
        Ok(SkillOutput {
            success: true,
            tool_result: format!("Loaded skill {}", skill.dedup_key()),
            skill_name: skill.dedup_key(),
            skill_message: Some(build_skill_message(skill, &body)),
            error: None,
        })
    }
    fn tool_definition(&self, description: &str) -> nofy_tool_types::ToolDefinition {
        nofy_tool_types::ToolDefinition::function(
            &self.skill_tool_name,
            Some(description),
            json!({"type":"object","additionalProperties":false,"required":["skill"],"properties":{"skill":{"type":"string","maxLength":65536},"args":{"type":["string","null"],"maxLength":65536}}}),
        )
    }
    pub fn tools(&self) -> Result<ToolCatalog, Error> {
        self.validate()?;
        if self.execution.is_some() || self.skills.iter().any(has_overrides) {
            return Err(Error::Composition("skill execution overrides require SkillsFactory and explicit execution dependencies".into()));
        }
        let mut catalog = ToolCatalog::new();
        catalog.insert(ToolEntry {definition:self.tool_definition("Load an admitted, versioned skill by name with optional arguments. User-only skills require a runtime-issued user-command receipt; disabled skills are unavailable."),dispatch:Arc::new(self.clone())})?;
        Ok(catalog)
    }
}
#[async_trait::async_trait]
impl ContextSource for FrozenSkills {
    async fn revision(&self, context: &RunContext) -> Result<Option<String>, Error> {
        context
            .capabilities
            .get::<SkillPathContext>()
            .map(|paths| {
                serde_json::to_string(&paths.0).map_err(|e| Error::Composition(e.to_string()))
            })
            .transpose()
    }
    async fn contribute(
        &self,
        state: &RunState,
        context: &RunContext,
    ) -> Result<Vec<Message>, Error> {
        let touched = self.touched(state, context);
        let manager = self.manager(&touched);
        Ok(manager
            .listing_snapshot()
            .map(|listing| {
                vec![Message::User {
                    content: listing.text,
                }]
            })
            .unwrap_or_default())
    }
}
#[async_trait::async_trait]
impl ToolDispatch for FrozenSkills {
    async fn call(
        &self,
        id: nofy_tool_protocol::ToolId,
        args: Value,
        ctx: ToolCallContext,
    ) -> ToolStream<TypedToolOutput> {
        #[derive(Deserialize)]
        #[serde(deny_unknown_fields)]
        struct Input {
            skill: String,
            args: Option<String>,
        }
        let result = (|| {
            if id.as_str() != self.skill_tool_name {
                return Err(Error::Tool("skill tool identity mismatch".into()));
            }
            let user_initiated = ctx
                .get::<nofy_agent_runtime::mailbox::UserToolInvocation>()
                .is_some_and(|proof| proof.admits(&ctx, &id, &args));
            let input: Input =
                serde_json::from_value(args).map_err(|e| Error::Tool(e.to_string()))?;
            let context = ctx
                .get::<RunContext>()
                .ok_or_else(|| Error::Tool("skill tool requires run context".into()))?;
            let state = ctx.get::<nofy_agent_runtime::context::ToolInvocationState>();
            let empty = RunState::default();
            let state = state.as_deref().map_or(&empty, |view| view.state());
            let available = self.manager(&self.touched(state, &context)).slash_skills();
            if !available
                .iter()
                .any(|skill| skill.dedup_key() == input.skill)
            {
                return Err(Error::Tool(
                    "conditional skill is not active for this run".into(),
                ));
            }
            let output = self.invoke(
                &input.skill,
                input.args.as_deref(),
                user_initiated,
                &context,
            )?;
            serde_json::to_value(output).map_err(|e| Error::Tool(e.to_string()))
        })();
        nofy_tool_runtime::terminal_only(
            result
                .map(|value| TypedToolOutput::from_value(id, value))
                .map_err(|e| {
                    nofy_tool_runtime::ToolError::custom("skill_invocation", e.to_string())
                }),
        )
    }
}
fn has_overrides(skill: &SkillInfo) -> bool {
    skill
        .allowed_tools
        .as_ref()
        .is_some_and(|tools| !tools.is_empty())
        || skill.model.is_some()
        || skill.effort.is_some()
}
pub struct SkillsFactory {
    kind: ModuleKind,
    scope_compiler: Arc<dyn SkillScopeCompiler>,
}
impl SkillsFactory {
    pub fn with_scope_compiler(mut self, compiler: Arc<dyn SkillScopeCompiler>) -> Self {
        self.scope_compiler = compiler;
        self
    }
    pub fn context() -> Self {
        Self {
            kind: ModuleKind::ContextSource,
            scope_compiler: Arc::new(ExactSkillScopeCompiler),
        }
    }
    pub fn tools() -> Self {
        Self {
            kind: ModuleKind::ToolPack,
            scope_compiler: Arc::new(ExactSkillScopeCompiler),
        }
    }
}
impl ModuleFactory for SkillsFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: if self.kind == ModuleKind::ToolPack {
                "tool.skills"
            } else {
                "context.skills"
            }
            .into(),
            revision: format!(
                "{}:{:x}",
                if self.kind == ModuleKind::ToolPack {
                    3
                } else {
                    2
                },
                Sha256::digest(self.scope_compiler.identity().as_bytes())
            ),
            kind: self.kind,
            config_schema: json!({"type":"object","additionalProperties":false,"required":["skills"],"properties":{
                "skills":{"type":"array","maxItems":1024,"items":skill_schema()},"cwd":{"type":["string","null"]},"skill_tool_name":{"type":"string"},"read_tool_name":{"type":"string"},
                "context_window_tokens":{"type":["integer","null"],"minimum":1},"listing_budget_percent":{"type":["number","null"],"minimum":0,"maximum":1},
                "execution":if self.kind==ModuleKind::ToolPack {execution::schema()} else {json!({"type":"null"})}
            }}),
            input_schema: None,
            output_schema: None,
            dependencies: BTreeMap::new(),
            required_capabilities: Default::default(),
        }
    }
    fn config_dependencies(&self, config: &Value) -> Result<BTreeMap<String, ModuleKind>, Error> {
        let frozen: FrozenSkills = serde_json::from_value(config.clone())
            .map_err(|e| Error::Composition(e.to_string()))?;
        if self.kind == ModuleKind::ToolPack {
            frozen
                .execution
                .as_ref()
                .map(SkillExecutionSpec::dependencies)
                .transpose()
                .map(Option::unwrap_or_default)
        } else {
            Ok(BTreeMap::new())
        }
    }
    fn build(
        &self,
        config: &Value,
        dependencies: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        nofy_agent_runtime::settings::validate_json_value(
            &self.descriptor().config_schema,
            config,
        )?;
        let frozen: FrozenSkills = serde_json::from_value(config.clone())
            .map_err(|e| Error::Composition(e.to_string()))?;
        frozen.validate()?;
        if self.kind == ModuleKind::ToolPack {
            if frozen.execution.is_some() {
                Ok(ModuleInstance::ToolPack(execution::ScopedSkills::compile(
                    frozen,
                    dependencies,
                    self.scope_compiler.clone(),
                )?))
            } else {
                Ok(ModuleInstance::ToolPack(frozen.tools()?))
            }
        } else {
            Ok(ModuleInstance::ContextSource(Arc::new(frozen)))
        }
    }
}

fn skill_schema() -> Value {
    let mut properties = serde_json::Map::new();
    for key in ["name", "description", "path"] {
        properties.insert(key.into(), json!({"type":"string","maxLength":65536}));
    }
    for key in [
        "display_name",
        "when_to_use",
        "short_description",
        "author",
        "argument_hint",
        "license",
        "compatibility",
        "plugin_name",
        "plugin_version",
        "plugin_root",
        "plugin_data",
        "model",
        "effort",
    ] {
        properties.insert(
            key.into(),
            json!({"type":["string","null"],"maxLength":65536}),
        );
    }
    for key in [
        "has_user_specified_description",
        "user_invocable",
        "disable_model_invocation",
        "enabled",
    ] {
        properties.insert(key.into(), json!({"type":"boolean"}));
    }
    for key in ["paths", "allowed_tools"] {
        properties.insert(key.into(), json!({"type":["array","null"],"maxItems":1024,"items":{"type":"string","maxLength":16384}}));
    }
    properties.insert("body".into(), json!({"type":"string","maxLength":4194304}));
    properties.insert(
        "scope".into(),
        json!({"enum":["local","repo","user","server","bundled","plugin"]}),
    );
    properties.insert(
        "metadata".into(),
        json!({"type":["object","null"],"additionalProperties":{"type":"string"}}),
    );
    properties.insert("config_source".into(), json!({}));
    json!({"type":"object","additionalProperties":false,"required":["name","description","path","scope","body"],"properties":properties})
}
