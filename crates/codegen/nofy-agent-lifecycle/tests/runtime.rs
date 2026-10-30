#![cfg(feature = "agent-runtime")]
use nofy_agent_lifecycle::{runtime::*, *};
use nofy_agent_runtime::{hooks::*, *};
use serde_json::json;
use std::sync::{
    Arc,
    atomic::{AtomicUsize, Ordering},
};
struct Counter(Arc<AtomicUsize>);
#[async_trait::async_trait]
impl TurnLifecycleContributor for Counter {
    async fn on_turn_done(&self, _: &TurnDoneInput) {
        self.0.fetch_add(1, Ordering::SeqCst);
    }
}
fn policy() -> InputPolicy {
    InputPolicy {
        authority: InputAuthority::HumanIntent,
        turn_boundary: TurnBoundary::Conversational,
        analytics: AnalyticsClass::HumanPrompt,
        compaction: CompactionClass::HumanAnchor,
        queue: QueuePolicy::VisibleProtected,
        shutdown: ShutdownPolicy::Drain,
    }
}

#[tokio::test]
async fn existing_send_and_local_hosts_use_the_same_bus_without_duplicate_dispatch() {
    let count = Arc::new(AtomicUsize::new(0));
    let mut registry = ExtensionRegistryBuilder::new();
    registry.turn_lifecycle_contributor(Arc::new(Counter(count.clone())));
    let handler = Arc::new(LifecycleHandler::new(Arc::new(registry.build()), policy()));
    let subscription = Arc::new(
        HookRegistration::new(
            "lifecycle-v1".into(),
            EventCatalog::runtime().get("turn_done").unwrap().clone(),
            HookRule {
                event: "turn_done".into(),
                priority: 0,
                timeout_ms: 1000,
                failure: FailurePolicy::Closed,
                matches: None,
            },
            handler,
        )
        .unwrap(),
    );
    let bus = HookBus::new(EventCatalog::runtime(), vec![subscription]).unwrap();
    let reports = Arc::new(AtomicUsize::new(0));
    let copied = reports.clone();
    let emitter = LifecycleEmitter::new(
        bus,
        Arc::new(|| RunContext::new("thread", "run")),
        Arc::new(move |result| {
            assert!(matches!(result.unwrap().control, HookDecision::Continue));
            copied.fetch_add(1, Ordering::SeqCst);
        }),
    );
    TurnLifecycleContributor::on_turn_done(&emitter, &TurnDoneInput).await;
    tokio::task::LocalSet::new()
        .run_until(async {
            LocalTurnLifecycleContributor::on_turn_done(&emitter, &TurnDoneInput).await;
        })
        .await;
    assert_eq!(count.load(Ordering::SeqCst), 2);
    assert_eq!(reports.load(Ordering::SeqCst), 2);
}
struct Input;
#[async_trait::async_trait]
impl TurnInputContributor for Input {
    async fn contribute_turn_input(&self, input: &TurnInputContext) -> Vec<TurnInputFragment> {
        assert!(!input.synthetic);
        vec![TurnInputFragment {
            text: "source fragment".into(),
        }]
    }
}
#[tokio::test]
async fn input_contributors_modify_the_actual_model_request_with_explicit_authority() {
    let mut registry = ExtensionRegistryBuilder::new();
    registry.turn_input_contributor(Arc::new(Input));
    let handler = LifecycleHandler::new(Arc::new(registry.build()), policy());
    let context = RunContext::new("thread", "run");
    let event = HookEvent {
        version: 1,
        id: "input-event".into(),
        name: "before_model".into(),
        owner: runtime_owner(),
        scope: events::EventScope::new("agent", &context),
        payload: json!({"request":{"messages":[],"tools":[],"settings":{}}}),
    };
    let HookDecision::Patch { payload } = handler.handle(&event, &context).await.unwrap() else {
        panic!("patch")
    };
    assert_eq!(
        payload["request"]["messages"][0]["content"],
        "source fragment"
    );
}
