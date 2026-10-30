use nofy_agent_runtime::{compile::*, hooks::*, registry::*, *};
use nofy_tool_runtime::{ToolCallContext, ToolDispatch, ToolStream, TypedToolOutput};
use serde_json::{Value, json};
use std::{
    collections::BTreeMap,
    sync::{
        Arc, Mutex,
        atomic::{AtomicUsize, Ordering},
    },
};

struct TestModel;
#[async_trait::async_trait]
impl Model for TestModel {
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        if matches!(request.messages.last(), Some(Message::User { .. })) {
            Ok(ModelResponse {
                tool_calls: vec![ToolCall {
                    id: "call-1".into(),
                    name: "effect".into(),
                    arguments: json!({"n":1}),
                }],
                ..Default::default()
            })
        } else {
            Ok(ModelResponse {
                output: "done".into(),
                ..Default::default()
            })
        }
    }
}
struct Effect(Arc<Mutex<Vec<Value>>>);
#[async_trait::async_trait]
impl ToolDispatch for Effect {
    async fn call(
        &self,
        id: nofy_tool_protocol::ToolId,
        input: Value,
        _: ToolCallContext,
    ) -> ToolStream<TypedToolOutput> {
        self.0.lock().unwrap().push(input.clone());
        nofy_tool_runtime::terminal_only(Ok(TypedToolOutput::from_value(id, input)))
    }
}
fn tools(effects: Arc<Mutex<Vec<Value>>>) -> ToolCatalog {
    let mut tools = ToolCatalog::new();
    tools.insert(ToolEntry{definition:nofy_tool_types::ToolDefinition::function("effect",Some("Effect"),json!({"type":"object","required":["n"],"properties":{"n":{"type":"integer"}},"additionalProperties":false})),dispatch:Arc::new(Effect(effects))}).unwrap();
    tools
}
fn agent(effects: Arc<Mutex<Vec<Value>>>, store: Arc<dyn Checkpointer>) -> Agent {
    let mut components = Components::default();
    components
        .models
        .insert("model".into(), Arc::new(TestModel));
    components
        .prompts
        .insert("prompt".into(), Arc::new(StaticPrompt("system".into())));
    components.tool_packs.insert("tools".into(), tools(effects));
    AgentBuilder::new("hook-agent")
        .model("model")
        .prompt("prompt")
        .tools("tools")
        .compile(&components)
        .unwrap()
        .with_checkpointer(store)
}
struct Handler {
    apply: fn(&HookEvent) -> HookDecision,
    calls: Arc<AtomicUsize>,
    events: Arc<Mutex<Vec<HookEvent>>>,
}
#[async_trait::async_trait]
impl HookHandler for Handler {
    async fn handle(&self, event: &HookEvent, _: &RunContext) -> Result<HookDecision, Error> {
        self.calls.fetch_add(1, Ordering::SeqCst);
        self.events.lock().unwrap().push(event.clone());
        Ok((self.apply)(event))
    }
}
fn handler(
    apply: fn(&HookEvent) -> HookDecision,
) -> (
    Arc<dyn HookHandler>,
    Arc<AtomicUsize>,
    Arc<Mutex<Vec<HookEvent>>>,
) {
    let calls = Arc::new(AtomicUsize::new(0));
    let events = Arc::new(Mutex::new(Vec::new()));
    (
        Arc::new(Handler {
            apply,
            calls: calls.clone(),
            events: events.clone(),
        }),
        calls,
        events,
    )
}
fn subscription(event: &str, handler: Arc<dyn HookHandler>) -> Arc<HookRegistration> {
    Arc::new(
        HookRegistration::new(
            format!("{event}-v1"),
            EventCatalog::runtime().get(event).unwrap().clone(),
            HookRule {
                event: event.into(),
                priority: 0,
                timeout_ms: 5000,
                failure: FailurePolicy::Closed,
                matches: None,
            },
            handler,
        )
        .unwrap(),
    )
}
fn context() -> RunContext {
    RunContext::new("thread", "run")
}
struct DenyTwo;
#[async_trait::async_trait]
impl Policy for DenyTwo {
    async fn admit(
        &self,
        call: &ToolCall,
        _: &RunState,
        _: &RunContext,
    ) -> Result<Admission, Error> {
        Ok(if call.arguments["n"] == 2 {
            Admission::Deny("two is denied".into())
        } else {
            Admission::Allow
        })
    }
}

#[tokio::test]
async fn tool_patch_is_revalidated_before_policy_and_real_effect() {
    let effects = Arc::new(Mutex::new(Vec::new()));
    let (patch, patch_count, _) = handler(|event| {
        let mut payload = event.payload.clone();
        payload["call"]["arguments"]["n"] = json!(2);
        HookDecision::Patch { payload }
    });
    let (denied, denied_count, _) = handler(|_| HookDecision::Continue);
    let bus = HookBus::new(
        EventCatalog::runtime(),
        vec![
            subscription("before_tool", patch),
            subscription("permission_denied", denied),
        ],
    )
    .unwrap();
    let agent = agent(effects.clone(), Arc::new(InMemoryCheckpointer::default()))
        .with_hooks(bus)
        .with_required_policy("deny-two-v1", Arc::new(DenyTwo))
        .unwrap();
    assert!(matches!(
        agent.invoke(RunInput::new("go"), context()).await.unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert!(effects.lock().unwrap().is_empty());
    assert_eq!(patch_count.load(Ordering::SeqCst), 1);
    assert_eq!(denied_count.load(Ordering::SeqCst), 1);
}

#[tokio::test]
async fn invalid_patch_arguments_never_reach_dispatch_and_input_denial_never_calls_model() {
    let effects = Arc::new(Mutex::new(Vec::new()));
    let (patch, _, _) = handler(|event| {
        let mut payload = event.payload.clone();
        payload["call"]["arguments"]["n"] = json!("invalid");
        HookDecision::Patch { payload }
    });
    let bus = HookBus::new(
        EventCatalog::runtime(),
        vec![subscription("before_tool", patch)],
    )
    .unwrap();
    let agent = agent(effects.clone(), Arc::new(InMemoryCheckpointer::default())).with_hooks(bus);
    agent.invoke(RunInput::new("go"), context()).await.unwrap();
    assert!(effects.lock().unwrap().is_empty());
    let (deny, _, _) = handler(|_| HookDecision::Deny {
        reason: "input blocked".into(),
    });
    let bus = HookBus::new(
        EventCatalog::runtime(),
        vec![subscription("user_input", deny)],
    )
    .unwrap();
    let agent = super_agent(effects.clone()).with_hooks(bus);
    let RunOutcome::Completed { state, .. } =
        agent.invoke(RunInput::new("go"), context()).await.unwrap()
    else {
        panic!("refused")
    };
    assert_eq!(state.steps, 0);
    assert_eq!(
        state.completion_info.refusal.as_deref(),
        Some("input blocked")
    );
}
fn super_agent(effects: Arc<Mutex<Vec<Value>>>) -> Agent {
    agent(effects, Arc::new(InMemoryCheckpointer::default()))
}

struct MiddlewareCount(Arc<AtomicUsize>);
#[async_trait::async_trait]
impl nofy_agent_runtime::agent::Middleware for MiddlewareCount {
    async fn before_tool(&self, _: &mut ToolCall, _: &RunContext) -> Result<(), Error> {
        self.0.fetch_add(1, Ordering::SeqCst);
        Ok(())
    }
}
#[tokio::test]
async fn configured_hook_pause_resumes_without_repeating_handler_or_legacy_middleware() {
    let effects = Arc::new(Mutex::new(Vec::new()));
    let store = Arc::new(InMemoryCheckpointer::default());
    let (handler, count, events) = handler(|_| HookDecision::Pause {
        reason: json!({"review":true}),
    });
    let mut registry = ModuleRegistry::default();
    registry
        .register_factory(Arc::new(HookFactory::new(EventCatalog::runtime())))
        .unwrap();
    for (id, instance) in [
        ("model", ModuleInstance::Model(Arc::new(TestModel))),
        (
            "prompt",
            ModuleInstance::Prompt(Arc::new(StaticPrompt("system".into()))),
        ),
        ("tools", ModuleInstance::ToolPack(tools(effects.clone()))),
        ("store", ModuleInstance::Checkpointer(store.clone())),
        ("handler", ModuleInstance::HookHandler(handler)),
    ] {
        registry
            .register_factory(Arc::new(InstanceFactory::new(id, "impl-v1", instance)))
            .unwrap();
        registry
            .define(ModuleDefinition {
                reference: ModuleRef::new(id, "1"),
                factory: id.into(),
                config: json!({}),
                dependencies: BTreeMap::new(),
            })
            .unwrap();
    }
    let document:AgentDocument=serde_json::from_value(json!({"modules":[{"reference":{"id":"hook","version":"1"},"factory":"hook.subscription","config":{"event":"before_tool"},"dependencies":{"handler":{"id":"handler","version":"1"}}}],"agent":{"name":"configured-hook","model":{"id":"model","version":"1"},"prompt":{"id":"prompt","version":"1"},"tool_packs":[{"id":"tools","version":"1"}],"checkpointer":{"id":"store","version":"1"},"hooks":[{"id":"hook","version":"1"}]}})).unwrap();
    let compiled = compile_document(document, &registry).unwrap();
    let middleware = Arc::new(AtomicUsize::new(0));
    let agent = compiled
        .agent
        .clone()
        .with_middleware(Arc::new(MiddlewareCount(middleware.clone())));
    let result = agent.invoke(RunInput::new("go"), context()).await.unwrap();
    assert!(matches!(result, RunOutcome::Paused { .. }));
    assert!(
        agent
            .invoke(RunInput::new("overwrite"), context())
            .await
            .is_err()
    );
    let event = events.lock().unwrap()[0].clone();
    let bus = agent.hook_bus().unwrap();
    HookJournal::new(store.clone())
        .reconcile(bus, &bus.registrations()[0], &event, HookDecision::Continue)
        .await
        .unwrap();
    assert!(matches!(
        agent.invoke(RunInput::resume(), context()).await.unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(count.load(Ordering::SeqCst), 1);
    assert_eq!(middleware.load(Ordering::SeqCst), 1);
    assert_eq!(effects.lock().unwrap().len(), 1);
    assert!(compiled.snapshot.restore(&registry).is_ok());
}

struct Waiting {
    started: Arc<tokio::sync::Notify>,
    events: Arc<Mutex<Vec<HookEvent>>>,
    count: Arc<AtomicUsize>,
}
#[async_trait::async_trait]
impl HookHandler for Waiting {
    async fn handle(&self, event: &HookEvent, _: &RunContext) -> Result<HookDecision, Error> {
        self.count.fetch_add(1, Ordering::SeqCst);
        self.events.lock().unwrap().push(event.clone());
        self.started.notify_one();
        std::future::pending().await
    }
}
#[tokio::test]
async fn post_tool_outbox_and_unknown_hook_receipt_survive_dropped_run_without_repeating_tool() {
    let effects = Arc::new(Mutex::new(Vec::new()));
    let store = Arc::new(InMemoryCheckpointer::default());
    let started = Arc::new(tokio::sync::Notify::new());
    let events = Arc::new(Mutex::new(Vec::new()));
    let count = Arc::new(AtomicUsize::new(0));
    let handler = Arc::new(Waiting {
        started: started.clone(),
        events: events.clone(),
        count: count.clone(),
    });
    let bus = HookBus::new(
        EventCatalog::runtime(),
        vec![subscription("after_tool", handler)],
    )
    .unwrap();
    let agent = agent(effects.clone(), store.clone()).with_hooks(bus);
    let copied = agent.clone();
    let task = tokio::spawn(async move { copied.invoke(RunInput::new("go"), context()).await });
    started.notified().await;
    task.abort();
    let _ = task.await;
    let outcome = agent.invoke(RunInput::resume(), context()).await.unwrap();
    assert!(matches!(outcome,RunOutcome::Paused{reason,..} if reason["kind"]=="uncertain_hook"));
    assert_eq!(effects.lock().unwrap().len(), 1);
    let event = events.lock().unwrap()[0].clone();
    let bus = agent.hook_bus().unwrap();
    HookJournal::new(store)
        .reconcile(bus, &bus.registrations()[0], &event, HookDecision::Continue)
        .await
        .unwrap();
    assert!(matches!(
        agent.invoke(RunInput::resume(), context()).await.unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(effects.lock().unwrap().len(), 1);
    assert_eq!(count.load(Ordering::SeqCst), 1);
}

#[tokio::test]
async fn cancellation_inside_a_hook_is_a_cancelled_run_with_no_effect() {
    let effects = Arc::new(Mutex::new(Vec::new()));
    let started = Arc::new(tokio::sync::Notify::new());
    let handler = Arc::new(Waiting {
        started: started.clone(),
        events: Arc::new(Mutex::new(Vec::new())),
        count: Arc::new(AtomicUsize::new(0)),
    });
    let (cancelled, cancelled_count, _) = handler_fn_for_cancel();
    let bus = HookBus::new(
        EventCatalog::runtime(),
        vec![
            subscription("before_tool", handler),
            subscription("turn_cancelled", cancelled),
        ],
    )
    .unwrap();
    let agent = super_agent(effects.clone()).with_hooks(bus);
    let context = context();
    let token = context.cancel.clone();
    let task = tokio::spawn(async move { agent.invoke(RunInput::new("go"), context).await });
    started.notified().await;
    token.cancel();
    assert!(matches!(
        task.await.unwrap().unwrap(),
        RunOutcome::Cancelled { .. }
    ));
    assert!(effects.lock().unwrap().is_empty());
    assert_eq!(cancelled_count.load(Ordering::SeqCst), 1);
}
fn handler_fn_for_cancel() -> (
    Arc<dyn HookHandler>,
    Arc<AtomicUsize>,
    Arc<Mutex<Vec<HookEvent>>>,
) {
    handler(|_| HookDecision::Continue)
}

struct FailedModel;
#[async_trait::async_trait]
impl Model for FailedModel {
    async fn complete(&self, _: ModelRequest, _: &RunContext) -> Result<ModelResponse, Error> {
        Err(Error::Model("simulated model failure".into()))
    }
}
#[tokio::test]
async fn model_error_fires_lifecycle_error_without_replacing_the_original_failure() {
    let mut components = Components::default();
    components
        .models
        .insert("model".into(), Arc::new(FailedModel));
    components
        .prompts
        .insert("prompt".into(), Arc::new(StaticPrompt("system".into())));
    let (handler, count, events) = handler(|_| HookDecision::Continue);
    let bus = HookBus::new(
        EventCatalog::runtime(),
        vec![subscription("turn_error", handler)],
    )
    .unwrap();
    let agent = AgentBuilder::new("failed")
        .model("model")
        .prompt("prompt")
        .compile(&components)
        .unwrap()
        .with_checkpointer(Arc::new(InMemoryCheckpointer::default()))
        .with_hooks(bus);
    assert!(
        agent
            .invoke(RunInput::new("go"), context())
            .await
            .unwrap_err()
            .to_string()
            .contains("simulated model failure")
    );
    assert_eq!(count.load(Ordering::SeqCst), 1);
    assert!(
        events.lock().unwrap()[0].payload["error"]
            .as_str()
            .unwrap()
            .contains("simulated model failure")
    );
}

#[tokio::test]
async fn session_signals_and_parent_child_facts_have_real_producers() {
    let effects = Arc::new(Mutex::new(Vec::new()));
    let store = Arc::new(InMemoryCheckpointer::default());
    let (started, start_count, _) = handler(|_| HookDecision::Continue);
    let (finished, finish_count, _) = handler(|_| HookDecision::Continue);
    let (ended, end_count, _) = handler(|_| HookDecision::Continue);
    let bus = HookBus::new(
        EventCatalog::runtime(),
        vec![
            subscription("subagent_start", started),
            subscription("subagent_finished", finished),
            subscription("session_end", ended),
        ],
    )
    .unwrap();
    let child = agent(effects.clone(), store.clone());
    let parent = nofy_agent_runtime::composition::sequence_agent("parent", &[child])
        .unwrap()
        .with_checkpointer(store)
        .with_hooks(bus);
    assert!(matches!(
        parent.invoke(RunInput::new("go"), context()).await.unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(start_count.load(Ordering::SeqCst), 1);
    assert_eq!(finish_count.load(Ordering::SeqCst), 1);
    for _ in 0..2 {
        parent
            .notify_session(
                SessionSignal::End {
                    reason: "closed".into(),
                },
                context(),
            )
            .await
            .unwrap();
    }
    assert_eq!(end_count.load(Ordering::SeqCst), 1);
    assert_eq!(effects.lock().unwrap().len(), 1);
}

#[tokio::test]
async fn subagent_stop_hook_pauses_parent_and_resumes_completed_child_without_repeating_effect() {
    let effects = Arc::new(Mutex::new(Vec::new()));
    let store = Arc::new(InMemoryCheckpointer::default());
    let (stop, count, events) = handler(|_| HookDecision::Pause {
        reason: json!({"review_child":true}),
    });
    let bus = HookBus::new(
        EventCatalog::runtime(),
        vec![subscription("subagent_stop", stop)],
    )
    .unwrap();
    let child = agent(effects.clone(), store.clone()).with_hooks(bus);
    let parent = nofy_agent_runtime::composition::sequence_agent("parent", &[child.clone()])
        .unwrap()
        .with_checkpointer(store.clone());
    assert!(matches!(
        parent.invoke(RunInput::new("go"), context()).await.unwrap(),
        RunOutcome::Paused { .. }
    ));
    assert_eq!(effects.lock().unwrap().len(), 1);
    let event = events.lock().unwrap()[0].clone();
    let bus = child.hook_bus().unwrap();
    HookJournal::new(store)
        .reconcile(bus, &bus.registrations()[0], &event, HookDecision::Continue)
        .await
        .unwrap();
    assert!(matches!(
        parent.invoke(RunInput::resume(), context()).await.unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(count.load(Ordering::SeqCst), 1);
    assert_eq!(effects.lock().unwrap().len(), 1);
}

#[tokio::test]
async fn stop_override_wins_over_prior_continuation_and_preserves_reason() {
    let effects = Arc::new(Mutex::new(Vec::new()));
    let (deny, _, _) = handler(|_| HookDecision::Deny {
        reason: "keep working".into(),
    });
    let (stop, _, _) = handler(|_| HookDecision::Stop {
        reason: Some("stop now".into()),
    });
    let first = subscription("before_stop", deny);
    let second = HookRegistration::new(
        "force-stop-v1".into(),
        EventCatalog::runtime().get("before_stop").unwrap().clone(),
        HookRule {
            event: "before_stop".into(),
            priority: 1,
            timeout_ms: 1000,
            failure: FailurePolicy::Closed,
            matches: None,
        },
        stop,
    )
    .unwrap();
    let bus = HookBus::new(EventCatalog::runtime(), vec![first, Arc::new(second)]).unwrap();
    let agent = super_agent(effects.clone()).with_hooks(bus);
    let RunOutcome::Completed { state, .. } =
        agent.invoke(RunInput::new("go"), context()).await.unwrap()
    else {
        panic!("completed")
    };
    assert_eq!(
        state.completion_info.hook_stop_reason.as_deref(),
        Some("stop now")
    );
    assert_eq!(effects.lock().unwrap().len(), 1);
}
