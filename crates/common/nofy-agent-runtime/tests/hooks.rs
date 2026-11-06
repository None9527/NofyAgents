use nofy_agent_runtime::{hooks::*, registry::*, *};
use serde_json::json;
use std::sync::{
    Arc, Mutex, OnceLock,
    atomic::{AtomicUsize, Ordering},
};
use tokio::sync::Notify;

struct Handler {
    count: Arc<AtomicUsize>,
    decision: HookDecision,
    capture: Arc<Mutex<Option<HookEvent>>>,
}
#[async_trait::async_trait]
impl HookHandler for Handler {
    async fn handle(&self, event: &HookEvent, _: &RunContext) -> Result<HookDecision, Error> {
        self.count.fetch_add(1, Ordering::SeqCst);
        *self.capture.lock().unwrap() = Some(event.clone());
        Ok(self.decision.clone())
    }
}
type HandlerParts = (
    Arc<dyn HookHandler>,
    Arc<AtomicUsize>,
    Arc<Mutex<Option<HookEvent>>>,
);
fn handler(decision: HookDecision) -> HandlerParts {
    let count = Arc::new(AtomicUsize::new(0));
    let capture = Arc::new(Mutex::new(None));
    (
        Arc::new(Handler {
            count: count.clone(),
            decision,
            capture: capture.clone(),
        }),
        count,
        capture,
    )
}
fn rule(event: &str) -> HookRule {
    HookRule {
        event: event.into(),
        priority: 0,
        timeout_ms: 1000,
        failure: FailurePolicy::Closed,
        matches: None,
    }
}
fn registration(id: &str, event: &str, handler: Arc<dyn HookHandler>) -> Arc<HookRegistration> {
    Arc::new(
        HookRegistration::new(
            id.into(),
            EventCatalog::runtime().get(event).unwrap().clone(),
            rule(event),
            handler,
        )
        .unwrap(),
    )
}
fn context() -> RunContext {
    RunContext::new("thread", "run")
}

#[tokio::test]
async fn custom_events_require_the_correct_producer_and_actual_emit() {
    let (handler, count, _) = handler(HookDecision::Continue);
    let mut catalog = EventCatalog::runtime();
    let owner = ModuleRef::new("invoice-plugin", "7");
    let declaration = EventDeclaration {
        name: "invoice.ready".into(),
        owner: owner.clone(),
        payload_schema: json!({"type":"object","required":["id"]}),
        deny: false,
        pause: false,
        patch: false,
        stop: false,
    };
    catalog.declare(declaration.clone()).unwrap();
    let registration = Arc::new(
        HookRegistration::new(
            "invoice-hook-v1".into(),
            declaration,
            rule("invoice.ready"),
            handler,
        )
        .unwrap(),
    );
    let bus = HookBus::new(catalog, vec![registration]).unwrap();
    assert_eq!(count.load(Ordering::SeqCst), 0);
    assert!(
        bus.emit(
            &runtime_owner(),
            "invoice.ready",
            "invoice-1",
            json!({"id":1}),
            &context()
        )
        .await
        .is_err()
    );
    assert!(
        bus.emit(&owner, "invoice.ready", "invoice-1", json!({}), &context())
            .await
            .is_err()
    );
    assert_eq!(count.load(Ordering::SeqCst), 0);
    bus.emit(
        &owner,
        "invoice.ready",
        "invoice-1",
        json!({"id":1}),
        &context(),
    )
    .await
    .unwrap();
    assert_eq!(count.load(Ordering::SeqCst), 1);
}

#[tokio::test]
async fn ordered_patch_is_visible_to_later_matchers_and_deny_short_circuits() {
    let (patch, _, _) = handler(HookDecision::Patch {
        payload: json!({"tool":"write"}),
    });
    let (deny, count, _) = handler(HookDecision::Deny {
        reason: "blocked".into(),
    });
    let (tail, tail_count, _) = handler(HookDecision::Continue);
    let mut deny_rule = rule("before_tool");
    deny_rule.priority = 1;
    deny_rule.matches = Some(MatchValue {
        pointer: "/tool".into(),
        equals: json!("write"),
    });
    let deny = Arc::new(
        HookRegistration::new(
            "deny".into(),
            EventCatalog::runtime().get("before_tool").unwrap().clone(),
            deny_rule,
            deny,
        )
        .unwrap(),
    );
    let mut tail_rule = rule("before_tool");
    tail_rule.priority = 2;
    let tail = Arc::new(
        HookRegistration::new(
            "tail".into(),
            EventCatalog::runtime().get("before_tool").unwrap().clone(),
            tail_rule,
            tail,
        )
        .unwrap(),
    );
    let bus = HookBus::new(
        EventCatalog::runtime(),
        vec![tail, deny, registration("patch", "before_tool", patch)],
    )
    .unwrap();
    let result = bus
        .emit(
            &runtime_owner(),
            "before_tool",
            "call",
            json!({"tool":"read"}),
            &context(),
        )
        .await
        .unwrap();
    assert!(matches!(result.control, HookDecision::Deny { .. }));
    assert_eq!(result.payload["tool"], "write");
    assert_eq!(count.load(Ordering::SeqCst), 1);
    assert_eq!(tail_count.load(Ordering::SeqCst), 0);
}

#[tokio::test]
async fn fact_events_reject_patches_and_pause_without_journal_is_explicitly_unsupported() {
    let (patch, _, _) = handler(HookDecision::Patch { payload: json!({}) });
    let bus = HookBus::new(
        EventCatalog::runtime(),
        vec![registration("bad", "after_tool", patch)],
    )
    .unwrap();
    assert!(
        bus.emit(
            &runtime_owner(),
            "after_tool",
            "call",
            json!({}),
            &context()
        )
        .await
        .unwrap_err()
        .to_string()
        .contains("not allowed")
    );
    let (pause, _, _) = handler(HookDecision::Pause {
        reason: json!({"review":true}),
    });
    let bus = HookBus::new(
        EventCatalog::runtime(),
        vec![registration("pause", "before_tool", pause)],
    )
    .unwrap();
    assert!(
        bus.emit(
            &runtime_owner(),
            "before_tool",
            "call",
            json!({}),
            &context()
        )
        .await
        .unwrap_err()
        .to_string()
        .contains("explicit journal")
    );
}

struct Waiting {
    count: Arc<AtomicUsize>,
    started: Arc<Notify>,
}
#[async_trait::async_trait]
impl HookHandler for Waiting {
    async fn handle(&self, _: &HookEvent, _: &RunContext) -> Result<HookDecision, Error> {
        self.count.fetch_add(1, Ordering::SeqCst);
        self.started.notify_one();
        std::future::pending().await
    }
}
#[tokio::test]
async fn timeout_failure_policy_is_explicit_and_failed_handler_is_not_replayed() {
    for failure in ["closed", "open"] {
        let count = Arc::new(AtomicUsize::new(0));
        let handler = Arc::new(Waiting {
            count: count.clone(),
            started: Arc::new(Notify::new()),
        });
        let factory = HookFactory::new(EventCatalog::runtime());
        let ModuleInstance::Hook(subscription) = factory
            .build(
                &json!({"event":"before_tool","timeout_ms":5,"failure":failure}),
                &std::collections::BTreeMap::from([(
                    "handler".into(),
                    ModuleInstance::HookHandler(handler),
                )]),
            )
            .unwrap()
        else {
            panic!("hook")
        };
        let bus = HookBus::new(EventCatalog::runtime(), vec![subscription]).unwrap();
        let mut context = context();
        context
            .capabilities
            .insert(HookJournalBinding(HookJournal::new(Arc::new(
                InMemoryCheckpointer::default(),
            ))));
        for _ in 0..2 {
            let result = bus
                .emit(&runtime_owner(), "before_tool", "call", json!({}), &context)
                .await;
            assert_eq!(result.is_ok(), failure == "open");
        }
        assert_eq!(count.load(Ordering::SeqCst), 1);
    }
}

#[tokio::test]
async fn cancelled_in_flight_fact_hook_becomes_uncertain_without_replay() {
    let count = Arc::new(AtomicUsize::new(0));
    let started = Arc::new(Notify::new());
    let waiting = Arc::new(Waiting {
        count: count.clone(),
        started: started.clone(),
    });
    let bus = Arc::new(
        HookBus::new(
            EventCatalog::runtime(),
            vec![registration("effect", "after_tool", waiting)],
        )
        .unwrap(),
    );
    let mut context = context();
    context
        .capabilities
        .insert(HookJournalBinding(HookJournal::new(Arc::new(
            InMemoryCheckpointer::default(),
        ))));
    let copied = bus.clone();
    let copied_context = context.clone();
    let task = tokio::spawn(async move {
        copied
            .emit(
                &runtime_owner(),
                "after_tool",
                "call",
                json!({}),
                &copied_context,
            )
            .await
    });
    started.notified().await;
    task.abort();
    let _ = task.await;
    let result = bus
        .emit(&runtime_owner(), "after_tool", "call", json!({}), &context)
        .await
        .unwrap();
    assert!(
        matches!(result.control,HookDecision::Pause{reason} if reason["kind"]=="uncertain_hook")
    );
    assert_eq!(count.load(Ordering::SeqCst), 1);
}

#[cfg(feature = "sqlite")]
#[tokio::test]
async fn pause_survives_store_reopen_and_reconciliation_without_handler_reexecution() {
    let root = tempfile::tempdir().unwrap();
    let path = root.path().join("hooks.db");
    let (handler, count, capture) = handler(HookDecision::Pause {
        reason: json!({"review":true}),
    });
    let subscription = registration("pause-v1", "before_tool", handler);
    let bus = HookBus::new(EventCatalog::runtime(), vec![subscription.clone()]).unwrap();
    let mut context = context();
    context
        .capabilities
        .insert(HookJournalBinding(HookJournal::new(Arc::new(
            durable::SqliteStore::open(&path).unwrap(),
        ))));
    let first = bus
        .emit(
            &runtime_owner(),
            "before_tool",
            "call",
            json!({"args":1}),
            &context,
        )
        .await
        .unwrap();
    assert!(matches!(first.control, HookDecision::Pause { .. }));
    context.capabilities.remove::<HookJournalBinding>();
    let journal = HookJournal::new(Arc::new(durable::SqliteStore::open(&path).unwrap()));
    context
        .capabilities
        .insert(HookJournalBinding(journal.clone()));
    let result = bus
        .emit(
            &runtime_owner(),
            "before_tool",
            "call",
            json!({"args":1}),
            &context,
        )
        .await
        .unwrap();
    assert!(matches!(result.control, HookDecision::Pause { .. }));
    let event = capture.lock().unwrap().clone().unwrap();
    journal
        .reconcile(&bus, &subscription, &event, HookDecision::Continue)
        .await
        .unwrap();
    journal
        .reconcile(&bus, &subscription, &event, HookDecision::Continue)
        .await
        .unwrap();
    assert!(
        journal
            .reconcile(
                &bus,
                &subscription,
                &event,
                HookDecision::Deny {
                    reason: "flipped".into()
                }
            )
            .await
            .is_err()
    );
    let result = bus
        .emit(
            &runtime_owner(),
            "before_tool",
            "call",
            json!({"args":1}),
            &context,
        )
        .await
        .unwrap();
    assert!(matches!(result.control, HookDecision::Continue));
    assert!(
        bus.emit(
            &runtime_owner(),
            "before_tool",
            "call",
            json!({"args":2}),
            &context
        )
        .await
        .is_err()
    );
    assert_eq!(count.load(Ordering::SeqCst), 1);
}

struct Recursive(Arc<OnceLock<HookBus>>);
#[async_trait::async_trait]
impl HookHandler for Recursive {
    async fn handle(&self, event: &HookEvent, context: &RunContext) -> Result<HookDecision, Error> {
        self.0
            .get()
            .unwrap()
            .emit(
                &event.owner,
                &event.name,
                "call",
                event.payload.clone(),
                context,
            )
            .await
            .map(|result| result.control)
    }
}
#[tokio::test]
async fn recursion_is_bounded_and_handler_is_a_real_registry_dependency() {
    let slot = Arc::new(OnceLock::new());
    let handler = Arc::new(Recursive(slot.clone()));
    let bus = HookBus::new(
        EventCatalog::runtime(),
        vec![registration("recursive", "before_tool", handler)],
    )
    .unwrap();
    slot.set(bus.clone()).ok().unwrap();
    assert!(
        bus.emit(
            &runtime_owner(),
            "before_tool",
            "call",
            json!({}),
            &context()
        )
        .await
        .unwrap_err()
        .to_string()
        .contains("recursion")
    );
    let mut registry = ModuleRegistry::default();
    registry
        .register_factory(Arc::new(HookFactory::new(EventCatalog::runtime())))
        .unwrap();
    assert_eq!(
        registry.descriptors()[0].dependencies["handler"],
        ModuleKind::HookHandler
    );
    registry
        .define(ModuleDefinition {
            reference: ModuleRef::new("hook", "1"),
            factory: "hook.subscription".into(),
            config: json!({"event":"unknown"}),
            dependencies: Default::default(),
        })
        .unwrap();
    assert!(
        registry
            .resolve_typed(&[(ModuleRef::new("hook", "1"), ModuleKind::Hook)])
            .is_err()
    );
}
