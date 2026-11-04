#![cfg(feature = "sqlite")]
#[path = "sessions/handoff.rs"]
mod handoff;
#[path = "sessions/policy.rs"]
mod session_policy_tests;
use nofy_agent_runtime::{
    durable::{Clock, SqliteStore},
    governance::*,
    mailbox::*,
    registry::*,
    supervisor::{RunSupervisor, jobs::*},
    system::*,
    *,
};
use nofy_interjection_core::PendingInterjection;
use serde_json::{Value, json};
use std::{
    path::Path,
    sync::{
        Arc,
        atomic::{AtomicU64, AtomicUsize, Ordering},
    },
};

struct TestClock(AtomicU64);
impl Clock for TestClock {
    fn now_ms(&self) -> u64 {
        self.0.load(Ordering::SeqCst)
    }
}
struct CountingModel(Arc<AtomicUsize>);
#[async_trait::async_trait]
impl Model for CountingModel {
    async fn request_bound(
        &self,
        _: &ModelRequest,
        _: &RunContext,
    ) -> Result<model::ModelRequestBound, Error> {
        Ok(model::ModelRequestBound {
            max_calls: 1,
            max_input_tokens: Some(10),
            max_output_tokens: Some(5),
        })
    }
    async fn complete(&self, _: ModelRequest, _: &RunContext) -> Result<ModelResponse, Error> {
        self.0.fetch_add(1, Ordering::SeqCst);
        Ok(ModelResponse {
            output: "answer".into(),
            input_tokens: 3,
            output_tokens: 2,
            ..Default::default()
        })
    }
}
struct ResetBindings;
impl context::ContextBinding for ResetBindings {
    fn bind(&self, context: &mut RunContext) -> Result<(), Error> {
        context.capabilities = Default::default();
        Ok(())
    }
}
fn r(id: &str) -> Value {
    json!({"id":id,"version":"1"})
}
fn setup(
    path: &Path,
    max_calls: u64,
) -> (
    SqliteStore,
    ModuleRegistry,
    CompiledSystem,
    Arc<AtomicUsize>,
    Arc<TestClock>,
    BudgetScope,
) {
    let clock = Arc::new(TestClock(AtomicU64::new(1000)));
    let store = SqliteStore::open_with_clock(&path.join("runtime.sqlite"), clock.clone()).unwrap();
    let calls = Arc::new(AtomicUsize::new(0));
    let mut registry = ModuleRegistry::default();
    let resource = InstalledBudget::install_named(
        Arc::new(store.clone()),
        BudgetLimits::default(),
        "sessions-test",
        "1",
        1,
    )
    .unwrap();
    registry
        .register_factory(Arc::new(
            GovernanceFactory::new([("db".into(), Arc::new(resource))].into()).unwrap(),
        ))
        .unwrap();
    registry
        .register_factory(Arc::new(InstanceFactory::new(
            "model.count",
            "1",
            ModuleInstance::Model(Arc::new(CountingModel(calls.clone()))),
        )))
        .unwrap();
    registry
        .register_factory(Arc::new(InstanceFactory::new(
            "binding.reset",
            "1",
            ModuleInstance::Binding(Arc::new(ResetBindings)),
        )))
        .unwrap();
    registry
        .register_factory(Arc::new(StaticPromptFactory))
        .unwrap();
    let system = compile_system(serde_json::from_value(json!({"schema_version":1,"name":"session-system","modules":[
        {"reference":r("model"),"factory":"model.count","config":{}},
        {"reference":r("prompt"),"factory":"prompt.static","config":{"text":"preserve conversation"}},
        {"reference":r("reset"),"factory":"binding.reset","config":{}},
        {"reference":r("budget"),"factory":"governance.budget","config":{"resource":"db","limits":{"max_model_calls":max_calls,"max_duration_ms":60000}}}
    ],"required_governance":[r("budget")],"programs":{"chat":{"kind":"agent","definition":{"name":"chat","model":r("model"),"prompt":r("prompt"),"bindings":[r("reset")]}}}})).unwrap(), &registry).unwrap();
    let resolved = system
        .registry()
        .resolve(&[ModuleRef::new("budget", "1")])
        .unwrap();
    let ModuleInstance::Governance(profile) = &resolved.instances[&ModuleRef::new("budget", "1")]
    else {
        panic!("profile")
    };
    let scope = BudgetScope {
        root_run_id: "one".into(),
        identity: profile.identity().into(),
    };
    (store, registry, system, calls, clock, scope)
}
fn request(system: &CompiledSystem, run: &str) -> ManagedRunRequest {
    ManagedRunRequest {
        run_id: run.into(),
        thread_id: "thread".into(),
        system: "session-system".into(),
        release: system.bundle.digest.clone(),
        program: "chat".into(),
        input: Some(PendingInterjection {
            text: run.to_owned(),
            attachments: vec![],
        }),
        parameters: None,
    }
}
fn session() -> SessionRequest {
    SessionRequest {
        id: "conversation".into(),
        root_run_id: "one".into(),
    }
}
async fn checkpoint(store: &SqliteStore) -> Checkpoint {
    store.load(&key()).await.unwrap().unwrap()
}
fn key() -> String {
    "4:chatthread".into()
}

#[tokio::test]
async fn continuous_roots_keep_original_ledger_deadline_inputs_and_immutable_submissions() {
    let dir = tempfile::tempdir().unwrap();
    let (store, registry, system, calls, clock, scope) = setup(dir.path(), 2);
    let supervisor = RunSupervisor::new(store.clone());
    for id in ["one", "two", "three"] {
        supervisor
            .submit_managed(request(&system, id), &system)
            .await
            .unwrap();
    }
    let before = store.execution_job("two").await.unwrap().unwrap();
    let enrolled = supervisor.create_session(session()).await.unwrap();
    assert_eq!(enrolled.session.budget_root_run_id, "one");
    assert!(enrolled.active_run_id.is_none());
    assert!(matches!(
        supervisor
            .execute_submitted(&registry, "one")
            .await
            .unwrap(),
        Some(RunOutcome::Completed { .. })
    ));
    let first = store.inspect(&scope).await.unwrap().unwrap();
    assert_eq!(first.used.model_calls, 1);
    clock.0.store(2000, Ordering::SeqCst);
    assert!(matches!(
        supervisor
            .execute_submitted(&registry, "two")
            .await
            .unwrap(),
        Some(RunOutcome::Completed { .. })
    ));
    let second = store.inspect(&scope).await.unwrap().unwrap();
    assert_eq!(second.used.model_calls, 2);
    assert_eq!(second.used.input_tokens, 6);
    assert_eq!(second.used.output_tokens, 4);
    assert_eq!(second.created_at_ms, first.created_at_ms);
    assert_eq!(second.deadline_ms, first.deadline_ms);
    let mut new_scope = scope.clone();
    new_scope.root_run_id = "two".into();
    assert!(store.inspect(&new_scope).await.unwrap().is_none());
    let after = store.execution_job("two").await.unwrap().unwrap();
    assert_eq!(before.digest, after.digest);
    assert_eq!(
        serde_json::to_value(before.submission).unwrap(),
        serde_json::to_value(after.submission).unwrap()
    );
    let cp = checkpoint(&store).await;
    let messages = serde_json::to_string(&cp.state.messages).unwrap();
    assert!(messages.contains("one") && messages.contains("two"));
    assert_eq!(cp.state.execution_run_id.as_deref(), Some("two"));
    assert_eq!(
        cp.state.input_progress.initial.as_ref().unwrap().run_id,
        "two"
    );
    assert!(matches!(
        supervisor
            .execute_submitted(&registry, "three")
            .await
            .unwrap(),
        Some(RunOutcome::BudgetExceeded { .. })
    ));
    assert_eq!(calls.load(Ordering::SeqCst), 2);
    assert_eq!(
        store
            .inspect(&scope)
            .await
            .unwrap()
            .unwrap()
            .used
            .model_calls,
        2
    );
    let turns = store.session_turns("conversation", 0, 10).await.unwrap();
    assert_eq!(
        turns.iter().map(|t| t.run_id.as_str()).collect::<Vec<_>>(),
        ["one", "two", "three"]
    );
    assert_eq!(
        store
            .session_turns("conversation", turns[0].sequence, 1)
            .await
            .unwrap()[0]
            .run_id,
        "two"
    );
    assert_eq!(
        store
            .session("conversation")
            .await
            .unwrap()
            .unwrap()
            .active_run_id
            .as_deref(),
        Some("three")
    );
    let cp = serde_json::to_value(checkpoint(&store).await).unwrap();
    assert!(matches!(
        supervisor
            .execute_submitted(&registry, "one")
            .await
            .unwrap(),
        Some(RunOutcome::Completed { .. })
    ));
    assert_eq!(cp, serde_json::to_value(checkpoint(&store).await).unwrap());
}

#[tokio::test]
async fn existing_first_root_adoption_and_ack_loss_do_not_reset_spent_budget() {
    let dir = tempfile::tempdir().unwrap();
    let (store, registry, system, calls, _, scope) = setup(dir.path(), 1);
    let supervisor = RunSupervisor::new(store.clone());
    for id in ["one", "two"] {
        supervisor
            .submit_managed(request(&system, id), &system)
            .await
            .unwrap();
    }
    supervisor
        .execute_submitted(&registry, "one")
        .await
        .unwrap();
    let before = store.inspect(&scope).await.unwrap().unwrap();
    let original = supervisor.create_session(session()).await.unwrap();
    // An exact retry is a read, even while a different worker holds the lease.
    let lease = store
        .acquire(key(), "other", std::time::Duration::from_secs(30))
        .await
        .unwrap();
    assert_eq!(
        serde_json::to_value(&original).unwrap(),
        serde_json::to_value(supervisor.create_session(session()).await.unwrap()).unwrap()
    );
    store.release(&lease).await.unwrap();
    assert!(matches!(
        supervisor
            .execute_submitted(&registry, "two")
            .await
            .unwrap(),
        Some(RunOutcome::BudgetExceeded { .. })
    ));
    assert_eq!(calls.load(Ordering::SeqCst), 1);
    let after = store.inspect(&scope).await.unwrap().unwrap();
    assert_eq!(before.used, after.used);
    assert_eq!(before.deadline_ms, after.deadline_ms);
}

#[tokio::test]
async fn no_opt_in_retains_legacy_independent_root_budgets_and_retroactive_merge_is_rejected() {
    let dir = tempfile::tempdir().unwrap();
    let (store, registry, system, calls, _, scope) = setup(dir.path(), 1);
    let supervisor = RunSupervisor::new(store.clone());
    for id in ["one", "two"] {
        supervisor
            .submit_managed(request(&system, id), &system)
            .await
            .unwrap();
        assert!(matches!(
            supervisor.execute_submitted(&registry, id).await.unwrap(),
            Some(RunOutcome::Completed { .. })
        ));
    }
    assert_eq!(calls.load(Ordering::SeqCst), 2);
    assert_eq!(
        store
            .inspect(&scope)
            .await
            .unwrap()
            .unwrap()
            .used
            .model_calls,
        1
    );
    let mut scope = scope;
    scope.root_run_id = "two".into();
    assert_eq!(
        store
            .inspect(&scope)
            .await
            .unwrap()
            .unwrap()
            .used
            .model_calls,
        1
    );
    assert!(supervisor.create_session(session()).await.is_err());
    assert!(
        supervisor
            .create_session(SessionRequest {
                id: "late".into(),
                root_run_id: "two".into()
            })
            .await
            .is_err()
    );
    assert!(store.sessions("", 10).await.unwrap().is_empty());
}

#[tokio::test]
async fn enrollment_is_fenced_unique_bounded_and_reopen_preserves_absolute_deadline() {
    let dir = tempfile::tempdir().unwrap();
    let (store, registry, system, calls, clock, scope) = setup(dir.path(), 10);
    let supervisor = RunSupervisor::new(store.clone());
    for id in ["one", "two"] {
        supervisor
            .submit_managed(request(&system, id), &system)
            .await
            .unwrap();
    }
    let lease = store
        .acquire(key(), "other", std::time::Duration::from_secs(30))
        .await
        .unwrap();
    assert!(supervisor.create_session(session()).await.is_err());
    assert!(store.session("conversation").await.unwrap().is_none());
    store.release(&lease).await.unwrap();
    let original = supervisor.create_session(session()).await.unwrap().session;
    assert!(
        supervisor
            .create_session(SessionRequest {
                id: "alias".into(),
                root_run_id: "one".into()
            })
            .await
            .is_err()
    );
    assert!(
        supervisor
            .create_session(SessionRequest {
                id: "conversation".into(),
                root_run_id: "two".into()
            })
            .await
            .is_err()
    );
    assert!(store.session_turns("conversation", 0, 0).await.is_err());
    assert!(
        store
            .session_turns("conversation", u64::MAX, 1)
            .await
            .is_err()
    );
    assert!(store.sessions("", 257).await.is_err());
    assert!(store.sessions("conversation", 10).await.unwrap().is_empty());
    supervisor
        .execute_submitted(&registry, "one")
        .await
        .unwrap();
    let before = store.inspect(&scope).await.unwrap().unwrap();
    let reopened = SqliteStore::open_with_clock(&store.path().unwrap(), clock.clone()).unwrap();
    assert_eq!(
        serde_json::to_value(&original).unwrap(),
        serde_json::to_value(
            reopened
                .session("conversation")
                .await
                .unwrap()
                .unwrap()
                .session
        )
        .unwrap()
    );
    clock
        .0
        .store(before.deadline_ms.unwrap() + 1, Ordering::SeqCst);
    let recovered = RunSupervisor::new(reopened.clone());
    assert!(matches!(
        recovered.execute_submitted(&registry, "two").await.unwrap(),
        Some(RunOutcome::BudgetExceeded { .. })
    ));
    assert_eq!(calls.load(Ordering::SeqCst), 1);
    let after = reopened.inspect(&scope).await.unwrap().unwrap();
    assert_eq!(before.used, after.used);
    assert_eq!(before.created_at_ms, after.created_at_ms);
    assert_eq!(before.deadline_ms, after.deadline_ms);
    assert_eq!(
        reopened
            .execution_job("two")
            .await
            .unwrap()
            .unwrap()
            .submission
            .input
            .unwrap()
            .text,
        "two"
    );
}

#[tokio::test]
async fn queued_cancellation_preserves_input_and_does_not_consume_session_budget() {
    let dir = tempfile::tempdir().unwrap();
    let (store, registry, system, calls, _, scope) = setup(dir.path(), 2);
    let supervisor = RunSupervisor::new(store.clone());
    for id in ["one", "two", "three"] {
        supervisor
            .submit_managed(request(&system, id), &system)
            .await
            .unwrap();
    }
    supervisor.create_session(session()).await.unwrap();
    supervisor
        .execute_submitted(&registry, "one")
        .await
        .unwrap();
    let original = store.execution_job("two").await.unwrap().unwrap();
    supervisor.cancel_submitted("two").await.unwrap();
    assert!(
        supervisor
            .execute_submitted(&registry, "two")
            .await
            .unwrap()
            .is_none()
    );
    assert!(matches!(
        supervisor
            .execute_submitted(&registry, "three")
            .await
            .unwrap(),
        Some(RunOutcome::Completed { .. })
    ));
    let cancelled = store.execution_job("two").await.unwrap().unwrap();
    assert!(matches!(cancelled.status, JobStatus::Cancelled));
    assert_eq!(cancelled.digest, original.digest);
    assert_eq!(cancelled.submission.input.unwrap().text, "two");
    assert_eq!(calls.load(Ordering::SeqCst), 2);
    assert_eq!(
        store
            .inspect(&scope)
            .await
            .unwrap()
            .unwrap()
            .used
            .model_calls,
        2
    );
    assert_eq!(
        store
            .session_turns("conversation", 0, 10)
            .await
            .unwrap()
            .len(),
        2
    );
}

#[tokio::test]
async fn corrupt_session_cannot_change_owner_or_dispatch_another_model() {
    let dir = tempfile::tempdir().unwrap();
    let (store, registry, system, calls, _, _) = setup(dir.path(), 3);
    let supervisor = RunSupervisor::new(store.clone());
    for id in ["one", "two"] {
        supervisor
            .submit_managed(request(&system, id), &system)
            .await
            .unwrap();
    }
    supervisor.create_session(session()).await.unwrap();
    supervisor
        .execute_submitted(&registry, "one")
        .await
        .unwrap();
    let cp = serde_json::to_value(checkpoint(&store).await).unwrap();
    let db = rusqlite::Connection::open(store.path().unwrap()).unwrap();
    db.execute("UPDATE agent_runtime_sessions SET digest='corrupt'", [])
        .unwrap();
    assert!(
        supervisor
            .execute_submitted(&registry, "two")
            .await
            .is_err()
    );
    assert!(store.execution_record("two").await.unwrap().is_none());
    assert_eq!(calls.load(Ordering::SeqCst), 1);
    assert_eq!(cp, serde_json::to_value(checkpoint(&store).await).unwrap());
    let count: u64 = db
        .query_row(
            "SELECT COUNT(*) FROM agent_runtime_session_turns",
            [],
            |r| r.get(0),
        )
        .unwrap();
    assert_eq!(count, 1);
    let owner: String = db
        .query_row("SELECT active_run FROM agent_runtime_threads", [], |r| {
            r.get(0)
        })
        .unwrap();
    assert_eq!(owner, "one");
}

#[tokio::test]
async fn transaction_failures_leave_no_half_session_or_half_turn_and_retry_keeps_input_once() {
    let dir = tempfile::tempdir().unwrap();
    let (store, registry, system, calls, _, scope) = setup(dir.path(), 2);
    let supervisor = RunSupervisor::new(store.clone());
    for id in ["one", "two"] {
        supervisor
            .submit_managed(request(&system, id), &system)
            .await
            .unwrap();
    }
    let db = rusqlite::Connection::open(store.path().unwrap()).unwrap();
    db.execute_batch("CREATE TRIGGER fail_member BEFORE INSERT ON agent_runtime_session_turns BEGIN SELECT RAISE(ABORT,'injected member failure'); END;").unwrap();
    assert!(supervisor.create_session(session()).await.is_err());
    assert!(store.session("conversation").await.unwrap().is_none());
    db.execute_batch("DROP TRIGGER fail_member").unwrap();
    supervisor.create_session(session()).await.unwrap();
    supervisor
        .execute_submitted(&registry, "one")
        .await
        .unwrap();
    let cp = serde_json::to_value(checkpoint(&store).await).unwrap();
    db.execute_batch("CREATE TRIGGER fail_run BEFORE INSERT ON agent_runtime_runs WHEN NEW.id='two' BEGIN SELECT RAISE(ABORT,'injected run failure'); END;").unwrap();
    assert!(
        supervisor
            .execute_submitted(&registry, "two")
            .await
            .is_err()
    );
    assert_eq!(
        store
            .session_turns("conversation", 0, 10)
            .await
            .unwrap()
            .len(),
        1
    );
    assert_eq!(
        store
            .session("conversation")
            .await
            .unwrap()
            .unwrap()
            .active_run_id
            .as_deref(),
        Some("one")
    );
    assert!(store.execution_record("two").await.unwrap().is_none());
    assert_eq!(cp, serde_json::to_value(checkpoint(&store).await).unwrap());
    assert_eq!(calls.load(Ordering::SeqCst), 1);
    db.execute_batch("DROP TRIGGER fail_run").unwrap();
    assert!(matches!(
        supervisor
            .execute_submitted(&registry, "two")
            .await
            .unwrap(),
        Some(RunOutcome::Completed { .. })
    ));
    assert_eq!(calls.load(Ordering::SeqCst), 2);
    assert_eq!(
        store
            .session_turns("conversation", 0, 10)
            .await
            .unwrap()
            .len(),
        2
    );
    assert_eq!(
        store
            .inspect(&scope)
            .await
            .unwrap()
            .unwrap()
            .used
            .model_calls,
        2
    );
    let cp = checkpoint(&store).await;
    assert_eq!(
        cp.state
            .messages
            .iter()
            .filter(|m| matches!(m, Message::User { .. }))
            .count(),
        2
    );
}

#[tokio::test]
async fn original_next_turn_mailbox_keeps_source_proof_and_joins_the_same_session_budget() {
    let dir = tempfile::tempdir().unwrap();
    let (store, registry, system, calls, _, scope) = setup(dir.path(), 2);
    let supervisor = RunSupervisor::new(store.clone());
    supervisor
        .submit_managed(request(&system, "one"), &system)
        .await
        .unwrap();
    supervisor.create_session(session()).await.unwrap();
    supervisor
        .execute_submitted(&registry, "one")
        .await
        .unwrap();
    let program::ProgramSnapshot::Agent { snapshot } =
        system.program("chat").unwrap().snapshot.program.clone()
    else {
        panic!("Agent")
    };
    let envelope = MailEnvelope {
        address: InputAddress::for_run("chat", &RunContext::new("thread", "one")),
        input_id: "next".into(),
        input: MailInput::NextTurn {
            run_id: "two".into(),
            snapshot,
            message: PendingInterjection {
                text: "mail input".into(),
                attachments: vec![],
            },
        },
    };
    store.submit(envelope.clone()).await.unwrap();
    let before = store.execution_job("two").await.unwrap().unwrap();
    let source = store
        .input_status(&envelope.address, "next")
        .await
        .unwrap()
        .unwrap();
    assert_eq!(source.status, InputStatus::Pending);
    let mut stricter = registry.clone();
    stricter.require_governance(ModuleRef::new("new-host-floor", "1"));
    assert!(
        supervisor
            .execute_submitted(&stricter, "two")
            .await
            .is_err()
    );
    assert!(store.execution_record("two").await.unwrap().is_none());
    assert_eq!(calls.load(Ordering::SeqCst), 1);
    assert_eq!(
        store
            .session_turns("conversation", 0, 10)
            .await
            .unwrap()
            .len(),
        1
    );
    assert!(matches!(
        supervisor
            .execute_submitted(&registry, "two")
            .await
            .unwrap(),
        Some(RunOutcome::Completed { .. })
    ));
    assert_eq!(
        store
            .input_status(&envelope.address, "next")
            .await
            .unwrap()
            .unwrap()
            .status,
        InputStatus::Delivered
    );
    assert_eq!(
        store.execution_job("two").await.unwrap().unwrap().digest,
        before.digest
    );
    assert_eq!(
        checkpoint(&store)
            .await
            .state
            .input_progress
            .initial
            .as_ref()
            .unwrap()
            .digest,
        before.digest
    );
    assert_eq!(
        store.session_turns("conversation", 0, 10).await.unwrap()[1].submission_digest,
        before.digest
    );
    assert_eq!(
        store
            .inspect(&scope)
            .await
            .unwrap()
            .unwrap()
            .used
            .model_calls,
        2
    );
    assert_eq!(calls.load(Ordering::SeqCst), 2);
}
