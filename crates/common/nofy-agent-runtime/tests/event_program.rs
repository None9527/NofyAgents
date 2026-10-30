use nofy_agent_runtime::{event_program::*, hooks::*, program::*, registry::*, *};
use serde_json::{Value, json};
use std::{
    collections::BTreeMap,
    path::{Path, PathBuf},
    sync::Arc,
};
fn r(id: &str) -> ModuleRef {
    ModuleRef::new(id, "1")
}
fn install(registry: &mut ModuleRegistry, id: &str, instance: ModuleInstance) -> ModuleRef {
    registry
        .register_factory(Arc::new(InstanceFactory::new(id, "1", instance)))
        .unwrap();
    registry
        .define(ModuleDefinition {
            reference: r(id),
            factory: id.into(),
            config: json!({}),
            dependencies: BTreeMap::new(),
        })
        .unwrap();
    r(id)
}
fn lines(path: &Path) -> usize {
    std::fs::read_to_string(path)
        .unwrap_or_default()
        .lines()
        .count()
}
fn append(path: &Path, value: &Value) -> Result<(), Error> {
    use std::io::Write;
    let line = format!("{value}\n");
    std::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(path)
        .and_then(|mut f| f.write_all(line.as_bytes()))
        .map_err(|e| Error::Checkpoint(e.to_string()))
}
struct Recorder {
    path: PathBuf,
    wait: Option<Arc<tokio::sync::Notify>>,
    decision: HookDecision,
}
#[async_trait::async_trait]
impl HookHandler for Recorder {
    async fn handle(&self, event: &HookEvent, _: &RunContext) -> Result<HookDecision, Error> {
        append(&self.path, &serde_json::to_value(event).unwrap())?;
        if let Some(wait) = &self.wait {
            wait.notify_one();
            std::future::pending::<()>().await;
        }
        Ok(self.decision.clone())
    }
}
fn declaration() -> EventDeclaration {
    EventDeclaration {
        name: "business.received".into(),
        owner: r("business.producer"),
        payload_schema: json!({"type":"object","required":["value"],"additionalProperties":false,"properties":{"value":{"type":"integer"}}}),
        deny: true,
        pause: true,
        patch: true,
        stop: false,
    }
}
fn setup(
    path: &Path,
    session: bool,
    wait: Option<Arc<tokio::sync::Notify>>,
) -> (ModuleRegistry, CompiledEventProgram) {
    let mut registry = ModuleRegistry::default();
    let producer = if session {
        EventProducer::session()
    } else {
        EventProducer::new(r("business.producer"), vec![declaration()]).unwrap()
    };
    let event = if session {
        "session_idle"
    } else {
        "business.received"
    };
    registry
        .register_factory(Arc::new(HookFactory::new(producer.catalog())))
        .unwrap();
    install(
        &mut registry,
        "producer",
        ModuleInstance::EventProducer(Arc::new(producer)),
    );
    install(
        &mut registry,
        "recorder",
        ModuleInstance::HookHandler(Arc::new(Recorder {
            path: path.to_owned(),
            wait,
            decision: HookDecision::Continue,
        })),
    );
    registry
        .define(ModuleDefinition {
            reference: r("subscription"),
            factory: "hook.subscription".into(),
            config: json!({"event":event,"timeout_ms":10000}),
            dependencies: BTreeMap::from([("handler".into(), r("recorder"))]),
        })
        .unwrap();
    let definition=serde_json::from_value(json!({"schema_version":1,"host":{"name":"event-root","scope_identity":"hashed_v1","hooks":[r("subscription")]},"producer":r("producer"),"event":event,"operation":"received-1","payload":if session{json!({})}else{json!({"value":7})}})).unwrap();
    let program = compile_event(definition, &registry).unwrap();
    (registry, program)
}
fn context() -> RunContext {
    RunContext::new("thread", "root")
}
fn complete(outcome: RunOutcome) -> RunState {
    match outcome {
        RunOutcome::Completed { state, .. } => state,
        other => panic!("{other:?}"),
    }
}
#[tokio::test]
async fn owned_event_is_pure_frozen_model_free_and_replays_without_sqlite() {
    let temp = tempfile::tempdir().unwrap();
    let path = temp.path().join("events.log");
    let (registry, event) = setup(&path, false, None);
    assert!(!path.exists());
    let program = CompiledProgram::for_event(&event).unwrap();
    let bytes = serde_json::to_vec(&program.snapshot).unwrap();
    let snapshot: ExecutionSnapshot = serde_json::from_slice(&bytes).unwrap();
    let restored = snapshot
        .restore(&registry)
        .unwrap()
        .with_checkpointer(Arc::new(InMemoryCheckpointer::default()));
    assert_eq!(
        restored.composition_identity(),
        program.composition_identity()
    );
    let state = complete(
        restored
            .invoke(RunInput::default(), context())
            .await
            .unwrap(),
    );
    assert!(state.messages.is_empty() && state.pending_tools.is_empty());
    assert_eq!(state.steps, 0);
    assert_eq!(state.model_sequence, 0);
    let result: HookResult = serde_json::from_str(&state.output).unwrap();
    assert_eq!(result.payload, json!({"value":7}));
    assert_eq!(result.control, HookDecision::Continue);
    complete(
        restored
            .invoke(RunInput::resume(), context())
            .await
            .unwrap(),
    );
    assert_eq!(lines(&path), 1);
    assert!(
        restored
            .invoke(RunInput::new("new payload"), context())
            .await
            .is_err()
    );
    assert!(
        restored
            .invoke(RunInput::resume(), RunContext::new("thread", "other"))
            .await
            .is_err()
    );
}
#[test]
fn documents_cannot_claim_another_producer_or_publish_unowned_runtime_events() {
    let temp = tempfile::tempdir().unwrap();
    let path = temp.path().join("events.log");
    let (registry, event) = setup(&path, false, None);
    let mut d = event.snapshot.definition.clone();
    d.event = "before_tool".into();
    assert!(compile_event(d, &registry).is_err());
    let mut d = event.snapshot.definition.clone();
    d.payload = json!({"value":"bad"});
    assert!(compile_event(d, &registry).is_err());
    let mut d = event.snapshot.definition.clone();
    d.operation = " ".into();
    assert!(compile_event(d, &registry).is_err());
    let mut d = event.snapshot.definition.clone();
    d.producer = r("recorder");
    assert!(compile_event(d, &registry).is_err());
    let mut snap = event.snapshot.clone();
    snap.declaration.owner = r("forged");
    assert!(snap.restore(&registry).is_err());
    let mut snap = event.snapshot.clone();
    snap.host.definition.hooks.clear();
    assert!(snap.restore(&registry).is_err());
    let mut decl = declaration();
    decl.owner = r("another");
    assert!(EventProducer::new(r("business.producer"), vec![decl]).is_err());
    assert!(EventProducer::new(runtime_owner(), vec![declaration()]).is_err());
    let (registry, event) = setup(&path, true, None);
    let mut d = event.snapshot.definition;
    d.event = "before_model".into();
    assert!(compile_event(d, &registry).is_err());
    assert!(!path.exists());
}
#[cfg(all(feature = "sqlite", feature = "workflow"))]
#[path = "event_program/controls.rs"]
mod controls;
#[cfg(feature = "sqlite")]
#[path = "event_program/durable.rs"]
mod durable;
#[tokio::test]
async fn event_root_returns_typed_decisions_and_preserves_failed_decision_receipts() {
    for (decision, valid) in [
        (
            HookDecision::Patch {
                payload: json!({"value":8}),
            },
            true,
        ),
        (
            HookDecision::Deny {
                reason: "blocked".into(),
            },
            true,
        ),
        (
            HookDecision::Patch {
                payload: json!({"value":"invalid"}),
            },
            false,
        ),
        (HookDecision::Stop { reason: None }, false),
    ] {
        let temp = tempfile::tempdir().unwrap();
        let path = temp.path().join("gate.log");
        let (mut registry, event) = setup(&temp.path().join("prior.log"), false, None);
        let entry = HookRegistration::new(
            "gate".into(),
            declaration(),
            HookRule {
                event: declaration().name,
                priority: 1,
                timeout_ms: 1000,
                failure: FailurePolicy::Closed,
                matches: None,
            },
            Arc::new(Recorder {
                path: path.clone(),
                wait: None,
                decision: decision.clone(),
            }),
        )
        .unwrap();
        install(&mut registry, "gate", ModuleInstance::Hook(Arc::new(entry)));
        let mut d = event.snapshot.definition;
        d.host.hooks.push(r("gate"));
        let event = compile_event(d, &registry)
            .unwrap()
            .with_checkpointer(Arc::new(InMemoryCheckpointer::default()));
        let outcome = event.invoke(RunInput::default(), context()).await;
        assert_eq!(outcome.is_ok(), valid, "{decision:?}");
        if valid {
            let state = complete(outcome.unwrap());
            let result: HookResult = serde_json::from_str(&state.output).unwrap();
            assert_eq!(
                result.control,
                if matches!(decision, HookDecision::Patch { .. }) {
                    HookDecision::Continue
                } else {
                    decision
                }
            );
        }
        assert_eq!(
            event.invoke(RunInput::resume(), context()).await.is_ok(),
            valid
        );
        assert_eq!(lines(&path), 1);
    }
}
