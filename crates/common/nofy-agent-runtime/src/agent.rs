use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use std::{collections::BTreeMap, sync::Arc};
mod context_host;
mod dispatch_host;
mod event_host;
mod execution;
mod governance_host;
mod hook_host;
mod input_host;
mod invocation;
mod loop_host;
mod model_host;
mod recipe_host;
mod tool_host;
use tokio::sync::mpsc;

use crate::driver::{RunHost, Step, drive};
use crate::{
    Admission, Checkpoint, Checkpointer, Error, Message, Model, ModelRequest, Policy, Prompt,
    RunContext, RunState, Settings, ToolCall, ToolCatalog,
};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentSpec {
    pub name: String,
    pub model: String,
    pub prompt: String,
    #[serde(default)]
    pub tools: Vec<String>,
    #[serde(default)]
    pub policies: Vec<String>,
    #[serde(default)]
    pub tool_sources: Vec<String>,
    #[serde(default)]
    pub context_sources: Vec<String>,
    #[serde(default)]
    pub settings: Settings,
}

#[derive(Clone, Default)]
pub struct Components {
    pub models: BTreeMap<String, Arc<dyn Model>>,
    pub prompts: BTreeMap<String, Arc<dyn Prompt>>,
    pub tool_packs: BTreeMap<String, ToolCatalog>,
    pub policies: BTreeMap<String, Arc<dyn Policy>>,
    pub tool_sources: BTreeMap<String, Arc<dyn crate::tools::ToolSource>>,
    pub context_sources: BTreeMap<String, Arc<dyn crate::memory::ContextSource>>,
}

pub struct AgentBuilder {
    spec: AgentSpec,
}

impl AgentBuilder {
    pub fn new(name: impl Into<String>) -> Self {
        Self {
            spec: AgentSpec {
                name: name.into(),
                model: String::new(),
                prompt: String::new(),
                tools: vec![],
                policies: vec![],
                tool_sources: vec![],
                context_sources: vec![],
                settings: Settings::default(),
            },
        }
    }
    pub fn model(mut self, id: impl Into<String>) -> Self {
        self.spec.model = id.into();
        self
    }
    pub fn prompt(mut self, id: impl Into<String>) -> Self {
        self.spec.prompt = id.into();
        self
    }
    pub fn tools(mut self, id: impl Into<String>) -> Self {
        self.spec.tools.push(id.into());
        self
    }
    pub fn policy(mut self, id: impl Into<String>) -> Self {
        self.spec.policies.push(id.into());
        self
    }
    pub fn tool_source(mut self, id: impl Into<String>) -> Self {
        self.spec.tool_sources.push(id.into());
        self
    }
    pub fn context_source(mut self, id: impl Into<String>) -> Self {
        self.spec.context_sources.push(id.into());
        self
    }
    pub fn settings(mut self, settings: Settings) -> Self {
        self.spec.settings = settings;
        self
    }
    pub fn from_spec(spec: AgentSpec) -> Self {
        Self { spec }
    }
    pub fn compile(self, components: &Components) -> Result<Agent, Error> {
        let spec = self.spec;
        if spec.name.is_empty() || spec.settings.max_steps == 0 {
            return Err(Error::Composition(
                "name and positive max_steps required".into(),
            ));
        }
        let model = components
            .models
            .get(&spec.model)
            .cloned()
            .ok_or_else(|| Error::Composition(format!("missing model: {}", spec.model)))?;
        let prompt = components
            .prompts
            .get(&spec.prompt)
            .cloned()
            .ok_or_else(|| Error::Composition(format!("missing prompt: {}", spec.prompt)))?;
        validate_model_settings(model.as_ref(), &spec.settings.model)?;
        let mut tools = ToolCatalog::new();
        for id in &spec.tools {
            tools.extend(
                components
                    .tool_packs
                    .get(id)
                    .cloned()
                    .ok_or_else(|| Error::Composition(format!("missing tool pack: {id}")))?,
            )?;
        }
        let policies = spec
            .policies
            .iter()
            .map(|id| {
                components
                    .policies
                    .get(id)
                    .cloned()
                    .ok_or_else(|| Error::Composition(format!("missing policy: {id}")))
            })
            .collect::<Result<Vec<_>, _>>()?;
        let composition =
            serde_json::to_string(&(2u32, &spec, tools.definitions(), tools.recovery_modes()))
                .map_err(|e| Error::Composition(e.to_string()))?;
        let composition = crate::identity::composition(spec.settings.scope_identity, composition);
        let context_sources = spec
            .context_sources
            .iter()
            .map(|id| {
                components
                    .context_sources
                    .get(id)
                    .cloned()
                    .ok_or_else(|| Error::Composition(format!("missing context source: {id}")))
            })
            .collect::<Result<Vec<_>, _>>()?;
        let tool_sources = spec
            .tool_sources
            .iter()
            .map(|id| {
                components
                    .tool_sources
                    .get(id)
                    .cloned()
                    .map(|source| (id.clone(), source))
                    .ok_or_else(|| Error::Composition(format!("missing tool source: {id}")))
            })
            .collect::<Result<Vec<_>, _>>()?;
        Ok(Agent {
            spec,
            model: Some(model),
            direct_tool: None,
            event_program: None,
            prompt,
            tools,
            policies,
            hooks: None,
            required_policies: Default::default(),
            composition,
            checkpoint: None,
            middleware: vec![],
            context_sources,
            context_policies: Vec::new(),
            tool_sources,
            bindings: Vec::new(),
            governance: Vec::new(),
            recipe: None,
        })
    }
}

#[derive(Clone)]
pub struct Agent {
    spec: AgentSpec,
    model: Option<Arc<dyn Model>>,
    direct_tool: Option<ToolCall>,
    event_program: Option<crate::event_program::BoundEvent>,
    prompt: Arc<dyn Prompt>,
    tools: ToolCatalog,
    policies: Vec<Arc<dyn Policy>>,
    hooks: Option<crate::hooks::HookBus>,
    required_policies: crate::policy::PolicyFloor,
    composition: String,
    tool_sources: Vec<(String, Arc<dyn crate::tools::ToolSource>)>,
    checkpoint: Option<Arc<dyn Checkpointer>>,
    bindings: Vec<Arc<dyn crate::context::ContextBinding>>,
    middleware: Vec<Arc<dyn Middleware>>,
    context_sources: Vec<Arc<dyn crate::memory::ContextSource>>,
    context_policies: Vec<(String, Arc<dyn crate::context_policy::ContextPolicy>)>,
    governance: Vec<Arc<crate::governance::GovernanceProfile>>,
    recipe: Option<Arc<crate::recipe::RuntimeRecipe>>,
}

#[derive(Debug, Clone, Default)]
pub struct RunInput {
    pub prompt: Option<String>,
    pub content: Option<Vec<crate::InputPart>>,
    pub resume: bool,
    /// Explicit result reconciliation for an uncertain external operation.
    pub reconciled: Option<(String, Value, bool)>,
    /// Retries only a durably settled model failure, retaining the run and budget.
    pub retry_model: Option<crate::governance::ModelRetryCommand>,
    /// Acknowledge only a cancellation cursor the caller actually observed.
    pub resume_cancel_through: Option<u64>,
}

impl RunInput {
    pub fn multimodal(content: Vec<crate::InputPart>) -> Self {
        Self {
            content: Some(content),
            ..Self::default()
        }
    }
    pub fn new(prompt: impl Into<String>) -> Self {
        Self {
            prompt: Some(prompt.into()),
            ..Self::default()
        }
    }
    pub fn resume() -> Self {
        Self {
            resume: true,
            ..Self::default()
        }
    }
    pub fn retry_model(command: crate::governance::ModelRetryCommand) -> Self {
        Self {
            resume: true,
            retry_model: Some(command),
            ..Self::default()
        }
    }
    pub fn resume_after_cancel(cursor: u64) -> Self {
        Self {
            resume: true,
            resume_cancel_through: Some(cursor),
            ..Self::default()
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RunOutcome {
    Completed { output: String, state: RunState },
    Paused { reason: Value, state: RunState },
    Cancelled { state: RunState },
    BudgetExceeded { state: RunState },
}

pub use crate::events::RunEvent;

fn validate_model_settings(model: &dyn Model, settings: &Value) -> Result<(), Error> {
    model.validate_settings(settings)
}

async fn publish_event(
    agent: &Agent,
    context: &RunContext,
    live: Option<&mpsc::Sender<RunEvent>>,
    event: RunEvent,
) -> Result<(), Error> {
    crate::events::publish_event(&agent.spec.name, &agent.middleware, context, live, event).await
}

/// Hooks receive a request/view, never the raw dispatcher. Every rewritten
/// call is checked by the policy immediately before actual execution.
#[async_trait]
pub trait Middleware: Send + Sync {
    async fn before_model(
        &self,
        _request: &mut ModelRequest,
        _context: &RunContext,
    ) -> Result<(), Error> {
        Ok(())
    }
    async fn before_tool(&self, _call: &mut ToolCall, _context: &RunContext) -> Result<(), Error> {
        Ok(())
    }
    async fn observe(&self, _event: &RunEvent, _context: &RunContext) {}
}

impl Agent {
    pub fn with_hooks(mut self, hooks: crate::hooks::HookBus) -> Self {
        self.composition = serde_json::to_string(&(&self.composition, "hooks", hooks.identity()))
            .expect("hook identity serializes");
        self.hooks = Some(hooks);
        self
    }
    /// Install a versioned host policy that also constrains descendant agents.
    pub fn with_required_policy(
        mut self,
        identity: impl Into<String>,
        policy: Arc<dyn Policy>,
    ) -> Result<Self, Error> {
        let identity = identity.into();
        if identity.trim().is_empty() {
            return Err(Error::Composition(
                "host policy identity must be nonempty".into(),
            ));
        }
        self.composition =
            serde_json::to_string(&(&self.composition, "required_policy", &identity))
                .map_err(|e| Error::Composition(e.to_string()))?;
        self.required_policies
            .extend(&crate::policy::PolicyFloor(vec![(identity, policy)]));
        Ok(self)
    }

    pub(crate) fn composition_identity(&self) -> &str {
        &self.composition
    }
    pub(crate) fn checkpoint_store(&self) -> Option<Arc<dyn Checkpointer>> {
        self.checkpoint.clone()
    }
    pub(crate) fn checkpoint_key(&self, thread_id: &str) -> String {
        crate::state::checkpoint_key(&self.spec.name, thread_id)
    }
    pub fn spec(&self) -> &AgentSpec {
        &self.spec
    }
    pub fn hook_bus(&self) -> Option<&crate::hooks::HookBus> {
        self.hooks.as_ref()
    }
    pub fn model_capabilities(&self) -> crate::ModelCapabilities {
        self.model
            .as_ref()
            .map_or_else(Default::default, |model| model.capabilities())
    }
    pub fn with_binding(
        mut self,
        revision: impl Into<String>,
        binding: Arc<dyn crate::context::ContextBinding>,
    ) -> Self {
        self.composition = serde_json::to_string(&(self.composition, revision.into()))
            .expect("binding composition contains only strings");
        self.bindings.push(binding);
        self
    }
    pub fn with_checkpointer(mut self, store: Arc<dyn Checkpointer>) -> Self {
        self.checkpoint = Some(store);
        self
    }
    pub fn with_middleware(mut self, middleware: Arc<dyn Middleware>) -> Self {
        self.middleware.push(middleware);
        self
    }

    pub async fn invoke(&self, input: RunInput, context: RunContext) -> Result<RunOutcome, Error> {
        self.run(input, context, None).await
    }

    /// Drive this future concurrently with the receiver to consume events.
    /// Live events apply backpressure. An installed EventSink is awaited first;
    /// cancellation may skip a blocked live send, so replay uses the durable sink.
    pub async fn stream(
        &self,
        input: RunInput,
        context: RunContext,
        events: mpsc::Sender<RunEvent>,
    ) -> Result<RunOutcome, Error> {
        self.run(input, context, Some(events)).await
    }
}

struct AgentHost<'a> {
    agent: &'a Agent,
    tools: ToolCatalog,
    context: RunContext,
    state: RunState,
    key: String,
    revision: Option<u64>,
    events: Option<mpsc::Sender<RunEvent>>,
}
