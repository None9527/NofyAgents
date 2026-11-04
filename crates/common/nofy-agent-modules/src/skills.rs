//! Explicit frozen skills, conditional activation and bounded invocation.
//! Filesystem imports and asset management belong to the host.
use nofy_agent_runtime::{memory::ContextSource, registry::*, *};
use nofy_tool_runtime::{ToolCallContext, ToolDispatch, ToolStream, TypedToolOutput};
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
mod definition;
mod render;
mod substitution;
#[cfg(test)]
mod tests;
pub use definition::{SkillInfo, SkillInput, SkillOutput, SkillPackage};
use render::*;
pub use scope::{ExactSkillScopeCompiler, SkillScopeCompiler, SkillToolScope};
pub use substitution::{SubstitutionError, SubstitutionLimits};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(default, deny_unknown_fields)]
pub struct FrozenSkills {
    pub skills: Vec<SkillInfo>,
    pub cwd: Option<String>,
    pub skill_tool_name: String,
    pub max_listing_bytes: usize,
    pub execution: Option<SkillExecutionSpec>,
}
impl Default for FrozenSkills {
    fn default() -> Self {
        Self {
            skills: vec![],
            cwd: None,
            skill_tool_name: "skill".into(),
            max_listing_bytes: 65536,
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
            || !(256..=262144).contains(&self.max_listing_bytes)
            || self
                .skills
                .iter()
                .map(|skill| skill.paths.as_ref().map_or(0, Vec::len))
                .sum::<usize>()
                > 1024
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
        let mut total = 0usize;
        for skill in &self.skills {
            total = total
                .checked_add(skill.validate()?)
                .ok_or_else(|| Error::Composition("skill bundle byte overflow".into()))?;
            if total > 8 * 1024 * 1024 {
                return Err(Error::Composition("skill bundle exceeds 8 MiB".into()));
            }
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
                skill.package.as_ref().map(|package| {
                    (
                        skill.dedup_key(),
                        ModuleRef::new(
                            format!("package:{}", package.name),
                            package.version.clone(),
                        ),
                    )
                })
            })
            .collect()
    }
    fn active_skills(&self, touched: &[PathBuf]) -> Result<Vec<&SkillInfo>, Error> {
        let patterns = self
            .skills
            .iter()
            .map(|skill| skill.paths.as_ref().map_or(0, Vec::len))
            .sum::<usize>();
        if patterns
            .checked_mul(touched.len())
            .is_none_or(|work| work > 2_000_000)
        {
            return Err(Error::Tool(
                "skill activation exceeds matching budget".into(),
            ));
        }
        Ok(self
            .skills
            .iter()
            .filter(|skill| definition::active(skill, touched, self.cwd.as_deref()))
            .collect())
    }
    fn listing(&self, touched: &[PathBuf]) -> Result<Option<String>, Error> {
        let skills = self
            .active_skills(touched)?
            .into_iter()
            .filter(|skill| !skill.disable_model_invocation)
            .collect::<Vec<_>>();
        if skills.is_empty() {
            return Ok(None);
        }
        let mut text = String::from("<available_skills>\n");
        let mut emitted = 0;
        for skill in &skills {
            let usage = skill.when_to_use.as_deref().map(escape).unwrap_or_default();
            let item = format!(
                "<skill name=\"{}\">{}\n{}\n</skill>\n",
                escape(&skill.dedup_key()),
                escape(&skill.description),
                usage
            );
            if text.len().saturating_add(item.len() + 96) > self.max_listing_bytes {
                break;
            }
            text.push_str(&item);
            emitted += 1;
        }
        if emitted < skills.len() {
            text.push_str(&format!(
                "<omitted count=\"{}\" reason=\"listing_byte_limit\"/>\n",
                skills.len() - emitted
            ));
        }
        text.push_str("</available_skills>");
        Ok(Some(text))
    }
    fn touched(&self, state: &RunState, context: &RunContext) -> Vec<PathBuf> {
        let mut touched = context
            .capabilities
            .get::<SkillPathContext>()
            .as_deref()
            .cloned()
            .unwrap_or_default()
            .0;
        let succeeded = state
            .messages
            .iter()
            .filter_map(|message| match message {
                Message::Tool {
                    call_id,
                    is_error: false,
                    content,
                } => {
                    let payload = content.get("value").unwrap_or(content);
                    if let Some(paths) = payload.get("touched_paths").and_then(Value::as_array) {
                        touched.extend(paths.iter().filter_map(Value::as_str).map(PathBuf::from));
                    }
                    Some(call_id.as_str())
                }
                _ => None,
            })
            .collect::<BTreeSet<_>>();
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
                skill.dedup_key() == name || skill.package.is_none() && skill.name == name
            })
            .filter(|skill| {
                skill.enabled
                    && if user_initiated {
                        skill.user_invocable
                    } else {
                        !skill.disable_model_invocation
                    }
            })
            .ok_or_else(|| Error::Tool("skill is unavailable for this invocation source".into()))
    }
    fn render_selected(
        &self,
        skill: &SkillInfo,
        args: Option<&str>,
        context: &RunContext,
    ) -> Result<SkillOutput, Error> {
        self.render_with_limits(skill, args, context, None)
    }
    fn render_with_limits(
        &self,
        skill: &SkillInfo,
        args: Option<&str>,
        context: &RunContext,
        limits: Option<SubstitutionLimits>,
    ) -> Result<SkillOutput, Error> {
        if args.is_some_and(|args| args.len() > 64 * 1024) {
            return Err(Error::Tool("skill arguments exceed 64 KiB".into()));
        }
        let mut body = skill
            .body
            .clone()
            .ok_or_else(|| Error::Composition("skill body was not frozen".into()))?;
        let skill_dir = Path::new(&skill.path).parent().and_then(Path::to_str);
        let substitutions = SubstitutionContext {
            skill_dir,
            session_id: Some(&context.thread_id),
            package_root: skill
                .package
                .as_ref()
                .and_then(|package| package.root.as_deref()),
            package_data: skill
                .package
                .as_ref()
                .and_then(|package| package.data.as_deref()),
        };
        let limits = limits.unwrap_or_default();
        apply_substitutions_bounded(&mut body, args, &substitutions, limits)
            .map_err(|e| Error::Tool(e.to_string()))?;
        let message = build_skill_message_bounded(skill, &body, limits.max_output_bytes)
            .map_err(|e| Error::Tool(e.to_string()))?;
        Ok(SkillOutput {
            success: true,
            tool_result: format!("Loaded skill {}", skill.dedup_key()),
            skill_name: skill.dedup_key(),
            skill_message: Some(message),
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
        self.tools_with_limits(None)
    }
    fn tools_with_limits(&self, limits: Option<SubstitutionLimits>) -> Result<ToolCatalog, Error> {
        self.validate()?;
        if self.execution.is_some() || self.skills.iter().any(has_overrides) {
            return Err(Error::Composition("skill execution overrides require SkillsFactory and explicit execution dependencies".into()));
        }
        let mut catalog = ToolCatalog::new();
        let dispatch: Arc<dyn ToolDispatch> = if let Some(limits) = limits {
            Arc::new(BoundedSkills {
                frozen: self.clone(),
                limits,
            })
        } else {
            Arc::new(self.clone())
        };
        catalog.insert(ToolEntry {definition:self.tool_definition("Load an admitted, versioned skill by name with optional arguments. User-only skills require a runtime-issued user-command receipt; disabled skills are unavailable."),dispatch})?;
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
        Ok(self
            .listing(&touched)?
            .map(|content| vec![Message::User { content }])
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
        self.call_with_limits(id, args, ctx, None).await
    }
}
struct BoundedSkills {
    frozen: FrozenSkills,
    limits: SubstitutionLimits,
}
#[async_trait::async_trait]
impl ToolDispatch for BoundedSkills {
    async fn call(
        &self,
        id: nofy_tool_protocol::ToolId,
        args: Value,
        ctx: ToolCallContext,
    ) -> ToolStream<TypedToolOutput> {
        self.frozen
            .call_with_limits(id, args, ctx, Some(self.limits))
            .await
    }
}
impl FrozenSkills {
    async fn call_with_limits(
        &self,
        id: nofy_tool_protocol::ToolId,
        args: Value,
        ctx: ToolCallContext,
        limits: Option<SubstitutionLimits>,
    ) -> ToolStream<TypedToolOutput> {
        let result = (|| {
            if id.as_str() != self.skill_tool_name {
                return Err(Error::Tool("skill tool identity mismatch".into()));
            }
            let user_initiated = ctx
                .get::<nofy_agent_runtime::mailbox::UserToolInvocation>()
                .is_some_and(|proof| proof.admits(&ctx, &id, &args));
            let input: SkillInput =
                serde_json::from_value(args).map_err(|e| Error::Tool(e.to_string()))?;
            let context = ctx
                .get::<RunContext>()
                .ok_or_else(|| Error::Tool("skill tool requires run context".into()))?;
            let state = ctx.get::<nofy_agent_runtime::context::ToolInvocationState>();
            let empty = RunState::default();
            let state = state.as_deref().map_or(&empty, |view| view.state());
            let available = self.active_skills(&self.touched(state, &context))?;
            if !available
                .iter()
                .any(|skill| skill.dedup_key() == input.skill)
            {
                return Err(Error::Tool(
                    "conditional skill is not active for this run".into(),
                ));
            }
            let skill = self.available(&input.skill, user_initiated)?;
            // No execution bindings enter this plain-tool path.
            if self.execution.is_some() || has_overrides(skill) {
                return Err(Error::Composition(
                    "skill execution overrides require compiled execution bindings".into(),
                ));
            }
            let output = self.render_with_limits(skill, input.args.as_deref(), &context, limits)?;
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
    substitution_limits: Option<SubstitutionLimits>,
}
impl SkillsFactory {
    /// Opt into a stable, versioned substitution resource profile. The SDK's
    /// default factories and existing FrozenSkills serialization stay unchanged.
    pub fn with_substitution_limits(mut self, limits: SubstitutionLimits) -> Self {
        self.substitution_limits = Some(limits);
        self
    }
    pub fn with_scope_compiler(mut self, compiler: Arc<dyn SkillScopeCompiler>) -> Self {
        self.scope_compiler = compiler;
        self
    }
    pub fn context() -> Self {
        Self {
            kind: ModuleKind::ContextSource,
            scope_compiler: Arc::new(ExactSkillScopeCompiler),
            substitution_limits: Some(SubstitutionLimits::default()),
        }
    }
    pub fn tools() -> Self {
        Self {
            kind: ModuleKind::ToolPack,
            scope_compiler: Arc::new(ExactSkillScopeCompiler),
            substitution_limits: Some(SubstitutionLimits::default()),
        }
    }
}
impl ModuleFactory for SkillsFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        let mut descriptor = ModuleDescriptor {
            factory: if self.kind == ModuleKind::ToolPack {
                "tool.skills"
            } else {
                "context.skills"
            }
            .into(),
            revision: format!(
                "1:declared-skills:{}:{:x}",
                if self.kind == ModuleKind::ToolPack {
                    3
                } else {
                    2
                },
                Sha256::digest(self.scope_compiler.identity().as_bytes())
            ),
            kind: self.kind,
            config_schema: json!({"type":"object","additionalProperties":false,"required":["skills"],"properties":{
                "skills":{"type":"array","maxItems":1024,"items":skill_schema()},"cwd":{"type":["string","null"]},"skill_tool_name":{"type":"string"},
                "max_listing_bytes":{"type":"integer","minimum":256,"maximum":262144},
                "execution":if self.kind==ModuleKind::ToolPack {execution::schema()} else {json!({"type":"null"})}
            }}),
            input_schema: None,
            output_schema: None,
            dependencies: BTreeMap::new(),
            required_capabilities: Default::default(),
        };
        if self.kind == ModuleKind::ToolPack
            && let Some(limits) = self.substitution_limits
        {
            descriptor.revision.push_str(&format!(
                ":substitution-v1:{}:{}:{}",
                limits.max_input_bytes, limits.max_output_bytes, limits.max_work_bytes
            ));
        }
        descriptor
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
                    self.substitution_limits,
                )?))
            } else {
                Ok(ModuleInstance::ToolPack(
                    frozen.tools_with_limits(self.substitution_limits)?,
                ))
            }
        } else {
            Ok(ModuleInstance::ContextSource(Arc::new(frozen)))
        }
    }
}

fn skill_schema() -> Value {
    json!({"type":"object","additionalProperties":false,"required":["name","description","path","body"],"properties":{
        "name":{"type":"string","minLength":1,"maxLength":128},"description":{"type":"string","maxLength":65536},"path":{"type":"string","maxLength":4096},"body":{"type":"string","maxLength":1048576},
        "scope":{"type":"string","maxLength":128},"paths":{"type":["array","null"],"maxItems":1024,"items":{"type":"string","maxLength":16384}},
        "when_to_use":{"type":["string","null"],"maxLength":65536},"model":{"type":["string","null"],"maxLength":128},"effort":{"type":["string","null"],"maxLength":128},
        "metadata":{"type":"object","maxProperties":128,"propertyNames":{"maxLength":128},"additionalProperties":{"type":"string","maxLength":65536}},
        "allowed_tools":{"type":["array","null"],"maxItems":1024,"items":{"type":"string","maxLength":16384}},
        "user_invocable":{"type":"boolean"},"disable_model_invocation":{"type":"boolean"},"enabled":{"type":"boolean"},
        "package":{"type":["object","null"],"additionalProperties":false,"required":["name","version"],"properties":{"name":{"type":"string","minLength":1,"maxLength":128},"version":{"type":"string","minLength":1,"maxLength":256},"root":{"type":["string","null"],"maxLength":4096},"data":{"type":["string","null"],"maxLength":4096}}}
    }})
}
