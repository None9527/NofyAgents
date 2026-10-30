#![cfg(feature = "sqlite")]
use nofy_agent_runtime::{
    compile::*, context::ContextBinding, durable::*, governance::*, mailbox::*, program::*,
    registry::*, supervisor::*, tool_program::*, *,
};
use nofy_tool_runtime::{Tool, ToolCallContext};
use nofy_tool_types::ToolDescription;
use serde_json::{Value, json};
use std::{
    sync::{
        Arc,
        atomic::{AtomicBool, AtomicUsize, Ordering},
    },
    time::Duration,
};
use tokio::sync::Notify;
fn r(id: &str) -> ModuleRef {
    ModuleRef::new(id, "1")
}
fn install(registry: &mut ModuleRegistry, id: &str, value: ModuleInstance) -> ModuleRef {
    registry
        .register_factory(Arc::new(InstanceFactory::new(id, "1", value)))
        .unwrap();
    registry
        .define(ModuleDefinition {
            reference: r(id),
            factory: id.into(),
            config: json!({}),
            dependencies: Default::default(),
        })
        .unwrap();
    r(id)
}
struct Clear;
impl ContextBinding for Clear {
    fn bind(&self, context: &mut RunContext) -> Result<(), Error> {
        context.capabilities = Default::default();
        Ok(())
    }
}
struct Effect {
    count: Arc<AtomicUsize>,
    started: Arc<Notify>,
    wait: bool,
    path: std::path::PathBuf,
}
impl Tool for Effect {
    type Args = Value;
    type Output = Value;
    fn id(&self) -> nofy_tool_protocol::ToolId {
        nofy_tool_protocol::ToolId::new("effect").unwrap()
    }
    fn description(&self, _: &nofy_tool_runtime::ListToolsContext) -> ToolDescription {
        ToolDescription::new("effect", "Commit once")
    }
    async fn run(
        &self,
        _: ToolCallContext,
        args: Value,
    ) -> Result<Value, nofy_tool_runtime::ToolError> {
        self.count.fetch_add(1, Ordering::SeqCst);
        use std::io::Write;
        std::fs::OpenOptions::new()
            .create(true)
            .append(true)
            .open(&self.path)
            .and_then(|mut file| file.write_all(b"effect\n"))
            .map_err(|e| nofy_tool_runtime::ToolError::custom("effect_log", e.to_string()))?;
        self.started.notify_one();
        if self.wait {
            std::future::pending::<()>().await;
        }
        Ok(args)
    }
}
struct Echo {
    fail: AtomicBool,
    calls: Arc<AtomicUsize>,
}
#[async_trait::async_trait]
impl Model for Echo {
    async fn complete(&self, _: ModelRequest, _: &RunContext) -> Result<ModelResponse, Error> {
        self.calls.fetch_add(1, Ordering::SeqCst);
        if self.fail.swap(false, Ordering::SeqCst) {
            return Err(model::ModelFailure {
                category: "provider".into(),
                message: "known failure".into(),
                status: Some(503),
                retryable: false,
                retry_after_ms: None,
                code: None,
                details: Value::Null,
            }
            .into());
        }
        Ok(ModelResponse {
            output: "done".into(),
            ..Default::default()
        })
    }
}
struct Setup {
    registry: ModuleRegistry,
    effects: Arc<AtomicUsize>,
    started: Arc<Notify>,
    models: Arc<AtomicUsize>,
    profile: Arc<GovernanceProfile>,
}
fn setup(store: &SqliteStore, approval: bool, wait: bool, fail: bool, no_models: bool) -> Setup {
    let mut registry = ModuleRegistry::default();
    let effects = Arc::new(AtomicUsize::new(0));
    let started = Arc::new(Notify::new());
    let models = Arc::new(AtomicUsize::new(0));
    let mut tools = ToolCatalog::new();
    tools
        .insert(ToolEntry::typed(Effect {
            count: effects.clone(),
            started: started.clone(),
            wait,
            path: store.path().with_extension("effects"),
        }))
        .unwrap();
    install(&mut registry, "effects", ModuleInstance::ToolPack(tools));
    install(
        &mut registry,
        "clear",
        ModuleInstance::Binding(Arc::new(Clear)),
    );
    install(
        &mut registry,
        "model",
        ModuleInstance::Model(Arc::new(Echo {
            fail: AtomicBool::new(fail),
            calls: models.clone(),
        })),
    );
    install(
        &mut registry,
        "prompt",
        ModuleInstance::Prompt(Arc::new(StaticPrompt("system".into()))),
    );
    if approval {
        install(
            &mut registry,
            "approval",
            ModuleInstance::Policy(Arc::new(DurableApprovalPolicy::new(store.clone()))),
        );
        registry.require_policy(r("approval"));
    }
    let limits = BudgetLimits {
        max_model_calls: Some(if no_models { 0 } else { 8 }),
        max_steps: Some(if no_models { 0 } else { 32 }),
        max_tool_calls: Some(16),
        max_child_calls: Some(8),
        ..Default::default()
    };
    let profile = Arc::new(
        GovernanceProfile::new(
            Arc::new(
                InstalledBudget::install(Arc::new(store.clone()), limits, "root-budget", 1)
                    .unwrap(),
            ),
            BudgetLimits::default(),
            ModelRetryPolicy::default(),
        )
        .unwrap(),
    );
    install(
        &mut registry,
        "budget",
        ModuleInstance::Governance(profile.clone()),
    );
    Setup {
        registry,
        effects,
        started,
        models,
        profile,
    }
}
fn tool(setup: &Setup) -> CompiledToolRuntime {
    compile_tools(serde_json::from_value(json!({"name":"tool-root","scope_identity":"hashed_v1","tool_packs":[r("effects")],"governance":[r("budget")],"bindings":[r("clear")]})).unwrap(),&setup.registry).unwrap()
}
fn call() -> ToolCall {
    ToolCall {
        id: "effect-call".into(),
        name: "effect".into(),
        arguments: json!({"value":7}),
    }
}
fn context() -> RunContext {
    RunContext::new("thread", "root")
}
async fn totals(store: &SqliteStore, setup: &Setup) -> BudgetSummary {
    store
        .inspect(&BudgetScope {
            root_run_id: "root".into(),
            identity: setup.profile.identity().into(),
        })
        .await
        .unwrap()
        .unwrap()
}

#[cfg(feature = "workflow")]
#[path = "program/graphs.rs"]
mod graphs;

#[path = "program/queue.rs"]
mod queue;

#[path = "program/roots.rs"]
mod roots;
