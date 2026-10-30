use super::scope::*;
use super::*;
use futures::StreamExt;
use nofy_agent_runtime::{
    context::ContextBinding,
    hooks::{EventCatalog, HookBus, HookRegistration},
};

fn default_steps() -> usize {
    32
}
fn stable_digest(value: impl Serialize) -> Result<String, Error> {
    fn canonical(value: Value) -> Value {
        match value {
            Value::Object(fields) => Value::Object(
                fields
                    .into_iter()
                    .map(|(key, value)| (key, canonical(value)))
                    .collect::<BTreeMap<_, _>>()
                    .into_iter()
                    .collect(),
            ),
            Value::Array(values) => Value::Array(values.into_iter().map(canonical).collect()),
            value => value,
        }
    }
    let value =
        canonical(serde_json::to_value(value).map_err(|e| Error::Composition(e.to_string()))?);
    Ok(format!(
        "{:x}",
        Sha256::digest(serde_json::to_vec(&value).map_err(|e| Error::Composition(e.to_string()))?)
    ))
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SkillExecutionSpec {
    pub default_model: String,
    #[serde(default)]
    pub models: BTreeMap<String, String>,
    #[serde(default)]
    pub tool_packs: Vec<String>,
    #[serde(default)]
    pub tool_sources: Vec<String>,
    #[serde(default)]
    pub context_sources: Vec<String>,
    #[serde(default)]
    pub context_policies: Vec<String>,
    #[serde(default)]
    pub policies: Vec<String>,
    #[serde(default)]
    pub hooks: Vec<String>,
    #[serde(default)]
    pub prompt: Option<String>,
    #[serde(default)]
    pub recipe: Option<String>,
    #[serde(default)]
    pub model_settings: serde_json::Map<String, Value>,
    #[serde(default = "default_steps")]
    pub max_steps: usize,
}
impl SkillExecutionSpec {
    pub(super) fn dependencies(&self) -> Result<BTreeMap<String, ModuleKind>, Error> {
        if self.max_steps == 0 || self.max_steps > 4096 || self.models.len() > 1024 {
            return Err(Error::Composition(
                "invalid scoped skill step/model limits".into(),
            ));
        }
        let mut result = BTreeMap::new();
        let mut add = |name: &str, kind: ModuleKind| -> Result<(), Error> {
            if name.trim().is_empty() || name.len() > 128 {
                return Err(Error::Composition(
                    "skill execution dependency names must be 1..128 bytes".into(),
                ));
            }
            if result
                .insert(name.into(), kind)
                .is_some_and(|previous| previous != kind)
            {
                return Err(Error::Composition(format!(
                    "conflicting skill dependency kind: {name}"
                )));
            }
            Ok(())
        };
        add(&self.default_model, ModuleKind::Model)?;
        for name in self.models.values() {
            add(name, ModuleKind::Model)?;
        }
        for (names, kind) in [
            (&self.tool_packs, ModuleKind::ToolPack),
            (&self.tool_sources, ModuleKind::ToolSource),
            (&self.context_sources, ModuleKind::ContextSource),
            (&self.context_policies, ModuleKind::ContextPolicy),
            (&self.policies, ModuleKind::Policy),
            (&self.hooks, ModuleKind::Hook),
        ] {
            if names.len() > 128 || names.iter().collect::<BTreeSet<_>>().len() != names.len() {
                return Err(Error::Composition(
                    "duplicate or oversized skill dependency list".into(),
                ));
            }
            for name in names {
                add(name, kind)?;
            }
        }
        if let Some(name) = &self.prompt {
            add(name, ModuleKind::Prompt)?;
        }
        if let Some(name) = &self.recipe {
            add(name, ModuleKind::Recipe)?;
        }
        Ok(result)
    }
    fn model_alias(&self, skill: &SkillInfo) -> Result<&str, Error> {
        match skill.model.as_deref() {
            None | Some("inherit") => Ok(&self.default_model),
            Some(model) => self.models.get(model).map(String::as_str).ok_or_else(|| {
                Error::Composition(format!(
                    "skill {} model alias is not bound: {model}",
                    skill.dedup_key()
                ))
            }),
        }
    }
    fn settings(&self, skill: &SkillInfo) -> Value {
        let mut settings = self.model_settings.clone();
        if let Some(effort) = &skill.effort {
            settings.insert("reasoning_effort".into(), json!(effort));
        }
        Value::Object(settings)
    }
}
pub(super) fn schema() -> Value {
    let aliases = json!({"type":"array","maxItems":128,"uniqueItems":true,"items":{"type":"string","minLength":1,"maxLength":128}});
    let mut fields = serde_json::Map::new();
    fields.insert(
        "default_model".into(),
        json!({"type":"string","minLength":1,"maxLength":128}),
    );
    fields.insert("models".into(),json!({"type":"object","maxProperties":1024,"additionalProperties":{"type":"string","minLength":1,"maxLength":128}}));
    for name in [
        "tool_packs",
        "tool_sources",
        "context_sources",
        "context_policies",
        "policies",
        "hooks",
    ] {
        fields.insert(name.into(), aliases.clone());
    }
    for name in ["prompt", "recipe"] {
        fields.insert(
            name.into(),
            json!({"type":["string","null"],"minLength":1,"maxLength":128}),
        );
    }
    fields.insert("model_settings".into(), json!({"type":"object"}));
    fields.insert(
        "max_steps".into(),
        json!({"type":"integer","minimum":1,"maximum":4096}),
    );
    json!({"anyOf":[{"type":"null"},{"type":"object","required":["default_model"],"additionalProperties":false,"properties":fields}]})
}
struct BindModel(Arc<dyn Model>);
impl ContextBinding for BindModel {
    fn bind(&self, context: &mut RunContext) -> Result<(), Error> {
        self.0.bind_scope(context)
    }
}
struct SkillPrompt {
    base: Option<Arc<dyn Prompt>>,
    body: String,
}
#[async_trait::async_trait]
impl Prompt for SkillPrompt {
    async fn render(&self, context: &RunContext, tools: &[String]) -> Result<String, Error> {
        let base = if let Some(base) = &self.base {
            base.render(context, tools).await?
        } else {
            "Execute the admitted skill and return its result.".into()
        };
        let text = format!("{base}\n\n{}", self.body);
        if text.len() > 1024 * 1024 {
            return Err(Error::Composition(
                "scoped skill prompt exceeds 1 MiB".into(),
            ));
        }
        Ok(text)
    }
}
struct ScopePolicy(Arc<dyn SkillToolScope>);
#[async_trait::async_trait]
impl Policy for ScopePolicy {
    async fn admit(
        &self,
        call: &ToolCall,
        state: &RunState,
        context: &RunContext,
    ) -> Result<Admission, Error> {
        self.0.admit(call, state, context).await
    }
}
struct ScopedTools {
    static_tools: ToolCatalog,
    sources: Vec<(String, Arc<dyn ToolSource>)>,
    scope: Option<Arc<dyn SkillToolScope>>,
}
#[async_trait::async_trait]
impl ToolSource for ScopedTools {
    async fn snapshot(&self, context: &RunContext) -> Result<ToolSnapshot, Error> {
        let mut catalog = self.static_tools.clone();
        let mut versions = Vec::new();
        for (name, source) in &self.sources {
            let snapshot = source.snapshot(context).await?;
            if snapshot.revision.is_empty() {
                return Err(Error::Composition(format!(
                    "skill tool source {name} has no revision"
                )));
            }
            versions.push((
                name,
                snapshot.revision,
                snapshot.catalog.definitions(),
                snapshot.catalog.recovery_modes(),
            ));
            catalog.extend(snapshot.catalog)?;
        }
        let revision = format!(
            "{:x}",
            Sha256::digest(
                serde_json::to_vec(&(
                    catalog.definitions(),
                    catalog.recovery_modes(),
                    versions,
                    self.scope.as_ref().map(|scope| scope.identity())
                ))
                .map_err(|e| Error::Composition(e.to_string()))?
            )
        );
        if let Some(scope) = &self.scope {
            scope.validate_catalog(&catalog)?;
            let mut filtered = ToolCatalog::new();
            for name in catalog.names() {
                if scope.permits_name(&name) {
                    filtered.insert(catalog.get(&name).expect("catalog name").clone())?;
                }
            }
            catalog = filtered;
        }
        Ok(ToolSnapshot { revision, catalog })
    }
}
pub(super) struct ScopedSkills {
    frozen: FrozenSkills,
    spec: SkillExecutionSpec,
    modules: BTreeMap<String, ModuleInstance>,
    scopes: BTreeMap<String, Arc<dyn SkillToolScope>>,
    identity: String,
}
impl ScopedSkills {
    pub(super) fn compile(
        frozen: FrozenSkills,
        modules: &BTreeMap<String, ModuleInstance>,
        compiler: Arc<dyn SkillScopeCompiler>,
    ) -> Result<ToolCatalog, Error> {
        frozen.validate()?;
        let spec = frozen.execution.clone().ok_or_else(|| {
            Error::Composition("scoped skill execution configuration required".into())
        })?;
        let expected = spec.dependencies()?;
        if expected.len() != modules.len()
            || expected.iter().any(|(name, kind)| {
                modules
                    .get(name)
                    .is_none_or(|module| module.kind() != *kind)
            })
        {
            return Err(Error::Composition(
                "scoped skill dependencies do not match their declared kinds".into(),
            ));
        }
        let mut scopes = BTreeMap::new();
        for skill in &frozen.skills {
            let alias = spec.model_alias(skill)?;
            let Some(ModuleInstance::Model(model)) = modules.get(alias) else {
                return Err(Error::Composition(
                    "scoped skill model is not installed".into(),
                ));
            };
            model.validate_settings(&spec.settings(skill))?;
            if let Some(rules) = skill
                .allowed_tools
                .as_ref()
                .filter(|rules| !rules.is_empty())
            {
                scopes.insert(skill.dedup_key(), compiler.compile(rules)?);
            }
        }
        let identity = format!(
            "skill-scope:{}",
            stable_digest((&frozen, compiler.identity()))?
        );
        let definition=frozen.tool_definition("Execute an admitted skill in its own scoped Agent. Model, effort, tools, permissions and recovery follow its published execution bindings.");
        let dispatch = Arc::new(Self {
            frozen,
            spec,
            modules: modules.clone(),
            scopes,
            identity,
        });
        let mut catalog = ToolCatalog::new();
        catalog.insert(ToolEntry {
            definition,
            dispatch,
        })?;
        Ok(catalog)
    }
    fn child(&self, skill: &SkillInfo, body: String) -> Result<Agent, Error> {
        let alias = self.spec.model_alias(skill)?;
        let Some(ModuleInstance::Model(model)) = self.modules.get(alias) else {
            return Err(Error::Composition("scoped model disappeared".into()));
        };
        let base = if let Some(alias) = &self.spec.prompt {
            match &self.modules[alias] {
                ModuleInstance::Prompt(prompt) => Some(prompt.clone()),
                _ => unreachable!("validated prompt kind"),
            }
        } else {
            None
        };
        let prompt_hash = format!("{:x}", Sha256::digest(body.as_bytes()));
        let mut c = Components::default();
        c.models.insert("selected".into(), model.clone());
        c.prompts
            .insert("skill".into(), Arc::new(SkillPrompt { base, body }));
        let mut tools = ToolCatalog::new();
        for alias in &self.spec.tool_packs {
            let ModuleInstance::ToolPack(pack) = &self.modules[alias] else {
                unreachable!("validated pack kind")
            };
            tools.extend(pack.clone())?;
        }
        let sources = self
            .spec
            .tool_sources
            .iter()
            .map(|alias| {
                let ModuleInstance::ToolSource(source) = &self.modules[alias] else {
                    unreachable!("validated source kind")
                };
                (alias.clone(), source.clone())
            })
            .collect();
        let scope = self.scopes.get(&skill.dedup_key()).cloned();
        c.tool_sources.insert(
            "scoped-tools".into(),
            Arc::new(ScopedTools {
                static_tools: tools,
                sources,
                scope: scope.clone(),
            }),
        );
        let mut builder = AgentBuilder::new(format!("skill:{}", skill.dedup_key()))
            .model("selected")
            .prompt("skill")
            .tool_source("scoped-tools")
            .settings(Settings {
                max_steps: self.spec.max_steps,
                model: self.spec.settings(skill),
                ..Default::default()
            });
        for alias in &self.spec.context_sources {
            let ModuleInstance::ContextSource(source) = &self.modules[alias] else {
                unreachable!("validated context kind")
            };
            c.context_sources.insert(alias.clone(), source.clone());
            builder = builder.context_source(alias);
        }
        for alias in &self.spec.policies {
            let ModuleInstance::Policy(policy) = &self.modules[alias] else {
                unreachable!("validated policy kind")
            };
            c.policies.insert(alias.clone(), policy.clone());
            builder = builder.policy(alias);
        }
        let mut child = builder.compile(&c)?.with_binding(
            format!("{}:{prompt_hash}", self.identity),
            Arc::new(BindModel(model.clone())),
        );
        if let Some(scope) = scope {
            child = child.with_required_policy(
                format!("skill-scope:{}", scope.identity()),
                Arc::new(ScopePolicy(scope)),
            )?;
        }
        for alias in &self.spec.context_policies {
            let ModuleInstance::ContextPolicy(policy) = &self.modules[alias] else {
                unreachable!("validated context policy kind")
            };
            child =
                child.with_context_policy(format!("{}:{alias}", self.identity), policy.clone())?;
        }
        if let Some(alias) = &self.spec.recipe {
            let ModuleInstance::Recipe(recipe) = &self.modules[alias] else {
                unreachable!("validated recipe kind")
            };
            child = child.with_recipe(recipe.clone())?;
        }
        if !self.spec.hooks.is_empty() {
            let hooks = self
                .spec
                .hooks
                .iter()
                .map(|alias| {
                    let ModuleInstance::Hook(hook) = &self.modules[alias] else {
                        unreachable!("validated hook kind")
                    };
                    hook.clone()
                })
                .collect::<Vec<Arc<HookRegistration>>>();
            let mut catalog = EventCatalog::runtime();
            for hook in &hooks {
                if catalog.get(&hook.declaration().name).is_none() {
                    catalog.declare(hook.declaration().clone())?;
                }
            }
            child = child.with_hooks(HookBus::new(catalog, hooks)?);
        }
        Ok(child)
    }
}
#[async_trait::async_trait]
impl ToolDispatch for ScopedSkills {
    fn is_resumable(&self) -> bool {
        true
    }
    fn recovery_identity(&self) -> Option<String> {
        Some(self.identity.clone())
    }
    async fn call(
        &self,
        id: nofy_tool_protocol::ToolId,
        args: Value,
        ctx: ToolCallContext,
    ) -> ToolStream<TypedToolOutput> {
        let prepare = (|| {
            if id.as_str() != self.frozen.skill_tool_name {
                return Err(Error::Tool("skill tool identity mismatch".into()));
            }
            #[derive(Deserialize)]
            #[serde(deny_unknown_fields)]
            struct Input {
                skill: String,
                args: Option<String>,
            }
            let user_initiated = ctx
                .get::<nofy_agent_runtime::mailbox::UserToolInvocation>()
                .is_some_and(|proof| proof.admits(&ctx, &id, &args));
            let input: Input =
                serde_json::from_value(args).map_err(|e| Error::Tool(e.to_string()))?;
            let context = ctx
                .get::<RunContext>()
                .ok_or_else(|| Error::Tool("skill execution requires RunContext".into()))?;
            let state = ctx.get::<nofy_agent_runtime::context::ToolInvocationState>();
            let empty = RunState::default();
            let state = state.as_deref().map_or(&empty, |view| view.state());
            if !self
                .frozen
                .manager(&self.frozen.touched(state, &context))
                .slash_skills()
                .iter()
                .any(|skill| skill.dedup_key() == input.skill)
            {
                return Err(Error::Tool(
                    "conditional skill is not active for this run".into(),
                ));
            }
            let skill = self.frozen.available(&input.skill, user_initiated)?;
            let loaded = self
                .frozen
                .render_selected(skill, input.args.as_deref(), &context)?;
            let child = self.child(skill, loaded.skill_message.unwrap_or_default())?;
            Ok((
                child,
                skill.dedup_key(),
                input.args.unwrap_or_else(|| {
                    "Execute the skill for the requested task and return its result.".into()
                }),
            ))
        })();
        let (child, skill, prompt) = match prepare {
            Ok(value) => value,
            Err(error) => {
                return nofy_tool_runtime::terminal_only(Ok(TypedToolOutput::from_value(
                    id,
                    json!({"success":false,"error":error.to_string()}),
                )));
            }
        };
        let entry = child.as_tool(id.as_str(), "scoped skill");
        let stream = entry.dispatch.call(id, json!({"prompt":prompt}), ctx).await;
        Box::pin(stream.map(move |item| match item {
            nofy_tool_runtime::ToolStreamItem::Terminal(Ok(output)) => {
                let info=output.value.get("info");
                let refused=info.and_then(|info|info.get("refusal")).is_some_and(|refusal|!refusal.is_null());
                let truncated=info.and_then(|info|info.get("stop_reason")).and_then(Value::as_str).is_some_and(|reason|matches!(reason,"length"|"max_tokens"|"max_output_tokens"));
                let value = json!({"success":!refused && !truncated,"skill_name":skill,"execution":output.value});
                nofy_tool_runtime::ToolStreamItem::Terminal(Ok(TypedToolOutput::from_value(output.tool_id, value)))
            }
            item => item,
        }))
    }
}
