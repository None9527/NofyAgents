use super::*;
use nofy_agent_runtime::{
    durable::*,
    governance::*,
    supervisor::{jobs::*, *},
};
use std::time::Duration;
fn governed(
    store: &SqliteStore,
    registry: &mut ModuleRegistry,
    event: CompiledEventProgram,
) -> CompiledEventProgram {
    let profile = GovernanceProfile::new(
        Arc::new(
            InstalledBudget::install(
                Arc::new(store.clone()),
                BudgetLimits {
                    max_model_calls: Some(0),
                    max_steps: Some(0),
                    max_tool_calls: Some(0),
                    ..Default::default()
                },
                "event-budget",
                1,
            )
            .unwrap(),
        ),
        BudgetLimits::default(),
        ModelRetryPolicy::default(),
    )
    .unwrap();
    install(
        registry,
        "budget",
        ModuleInstance::Governance(Arc::new(profile)),
    );
    let mut d = event.snapshot.definition;
    d.host.governance = vec![r("budget")];
    compile_event(d, registry).unwrap()
}
pub(super) fn submit(event: &CompiledEventProgram, run: &str) -> ProgramSubmission {
    ProgramSubmission::for_program(
        &CompiledProgram::for_event(event).unwrap(),
        "thread",
        run,
        None,
    )
    .unwrap()
}
fn fail(sql: &rusqlite::Connection, event: &CompiledEventProgram, window: &str) {
    let key = event.checkpoint_key("thread").replace('\'', "''");
    let statement=match window {
        "first"=>format!("CREATE TRIGGER fail BEFORE INSERT ON agent_runtime_checkpoints WHEN NEW.key='{key}' BEGIN SELECT RAISE(ABORT,'first checkpoint lost'); END;"),
        "ack"=>"CREATE TRIGGER fail BEFORE UPDATE OF status ON agent_runtime_jobs WHEN NEW.status='running' BEGIN SELECT RAISE(ABORT,'initial acknowledgment lost'); END;".into(),
        "final"=>format!("CREATE TRIGGER fail BEFORE UPDATE ON agent_runtime_checkpoints WHEN NEW.key='{key}' AND json_extract(NEW.payload,'$.state.complete')=1 BEGIN SELECT RAISE(ABORT,'final checkpoint lost'); END;"),
        _=>panic!("unknown fault")
    };
    sql.execute_batch(&statement).unwrap();
}
#[tokio::test]
async fn persistent_event_queue_is_fifo_and_uses_no_model_tool_or_user_input() {
    let temp = tempfile::tempdir().unwrap();
    let path = temp.path().join("events.log");
    let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
    let (mut registry, event) = setup(&path, true, None);
    let event = governed(&store, &mut registry, event);
    let supervisor = RunSupervisor::new(store.clone());
    let first = supervisor
        .submit_program(submit(&event, "root"))
        .await
        .unwrap();
    supervisor
        .submit_program(submit(&event, "second"))
        .await
        .unwrap();
    assert_eq!(
        supervisor
            .submit_program(submit(&event, "root"))
            .await
            .unwrap()
            .digest,
        first.digest
    );
    assert!(
        supervisor
            .execute_submitted(&registry, "second")
            .await
            .unwrap()
            .is_none()
    );
    let a = complete(
        supervisor
            .run_next(&registry, "event-root", "thread")
            .await
            .unwrap()
            .unwrap(),
    );
    assert!(a.messages.is_empty());
    assert_eq!(a.input_progress.initial.unwrap().digest, first.digest);
    complete(
        supervisor
            .run_next(&registry, "event-root", "thread")
            .await
            .unwrap()
            .unwrap(),
    );
    complete(
        supervisor
            .execute_submitted(&ModuleRegistry::default(), "root")
            .await
            .unwrap()
            .unwrap(),
    );
    assert_eq!(lines(&path), 2);
    assert!(matches!(
        store.program_job("root").await.unwrap().unwrap().status,
        JobStatus::Closed
    ));
}
#[tokio::test]
async fn first_ack_and_final_checkpoint_faults_recover_the_exact_event_once() {
    for session in [false, true] {
        for window in ["first", "ack", "final"] {
            let temp = tempfile::tempdir().unwrap();
            let path = temp.path().join("events.log");
            let db = temp.path().join("runtime.db");
            let store = SqliteStore::open(&db).unwrap();
            let (registry, event) = setup(&path, session, None);
            let supervisor = RunSupervisor::new(store.clone());
            supervisor
                .submit_program(submit(&event, "root"))
                .await
                .unwrap();
            let sql = rusqlite::Connection::open(&db).unwrap();
            fail(&sql, &event, window);
            assert!(matches!(
                supervisor.execute_submitted(&registry, "root").await,
                Err(Error::Checkpoint(_))
            ));
            assert_eq!(lines(&path), usize::from(window == "final"));
            sql.execute_batch("DROP TRIGGER fail").unwrap();
            drop(sql);
            drop(supervisor);
            let reopened = RunSupervisor::new(SqliteStore::open(&db).unwrap());
            let state = complete(
                reopened
                    .execute_submitted(&registry, "root")
                    .await
                    .unwrap()
                    .unwrap(),
            );
            assert!(state.messages.is_empty());
            assert!(state.hook_progress.facts.is_empty());
            complete(
                reopened
                    .execute_submitted(&ModuleRegistry::default(), "root")
                    .await
                    .unwrap()
                    .unwrap(),
            );
            assert_eq!(lines(&path), 1, "{session}/{window}");
        }
    }
}
#[tokio::test]
async fn unknown_native_handler_effect_is_not_replayed_and_requires_exact_reconciliation() {
    let temp = tempfile::tempdir().unwrap();
    let path = temp.path().join("events.log");
    let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
    let notify = Arc::new(tokio::sync::Notify::new());
    let (registry, event) = setup(&path, false, Some(notify.clone()));
    let program = CompiledProgram::for_event(&event).unwrap();
    let supervisor = RunSupervisor::new(store.clone());
    let cancel = tokio_util::sync::CancellationToken::new();
    let mut ctx = context();
    ctx.cancel = cancel.clone();
    let task = {
        let supervisor = RunSupervisor::new(store.clone());
        let program = program.clone();
        tokio::spawn(async move {
            supervisor
                .execute_program(&program, RunInput::default(), ctx)
                .await
        })
    };
    notify.notified().await;
    cancel.cancel();
    assert!(matches!(
        task.await.unwrap().unwrap(),
        RunOutcome::Cancelled { .. }
    ));
    for _ in 0..2 {
        assert!(matches!(
            supervisor
                .execute_program(&program, RunInput::resume(), context())
                .await
                .unwrap(),
            RunOutcome::Paused { .. }
        ));
    }
    assert_eq!(lines(&path), 1);
    let source: HookEvent =
        serde_json::from_str(std::fs::read_to_string(&path).unwrap().trim()).unwrap();
    let lease = store
        .acquire(
            event.checkpoint_key("thread"),
            "operator",
            Duration::from_secs(1),
        )
        .await
        .unwrap();
    let journal = HookJournal::new(Arc::new(store.guarded(&lease)));
    let mut wrong = source.clone();
    wrong.payload = json!({"value":8});
    let registration = &event.hook_bus().registrations()[0];
    assert!(
        journal
            .reconcile(
                event.hook_bus(),
                registration,
                &wrong,
                HookDecision::Continue
            )
            .await
            .is_err()
    );
    journal
        .reconcile(
            event.hook_bus(),
            registration,
            &source,
            HookDecision::Continue,
        )
        .await
        .unwrap();
    store.release(&lease).await.unwrap();
    complete(
        supervisor
            .execute_program(&program, RunInput::resume(), context())
            .await
            .unwrap(),
    );
    assert_eq!(lines(&path), 1);
    assert_eq!(
        registry.resolve(&[r("producer")]).unwrap().instances.len(),
        1
    );
}
#[tokio::test]
async fn event_process_worker() {
    let Ok(directory) = std::env::var("NOFY_EVENT_PROCESS_DIR") else {
        return;
    };
    let dir = PathBuf::from(directory);
    let phase = std::env::var("NOFY_EVENT_PROCESS_PHASE").unwrap();
    let store = SqliteStore::open(&dir.join("runtime.db")).unwrap();
    let (registry, event) = setup(&dir.join("events.log"), false, None);
    let supervisor = RunSupervisor::new(store);
    if phase == "submit" {
        supervisor
            .submit_program(submit(&event, "root"))
            .await
            .unwrap();
        std::process::exit(97);
    }
    if matches!(phase.as_str(), "first" | "ack" | "final") {
        let sql = rusqlite::Connection::open(dir.join("runtime.db")).unwrap();
        fail(&sql, &event, &phase);
        assert!(
            supervisor
                .execute_submitted(&registry, "root")
                .await
                .is_err()
        );
        sql.execute_batch("DROP TRIGGER fail").unwrap();
        std::process::exit(97);
    }
    let selected = if phase == "cached" {
        ModuleRegistry::default()
    } else {
        registry
    };
    complete(
        supervisor
            .execute_submitted(&selected, "root")
            .await
            .unwrap()
            .unwrap(),
    );
    assert_eq!(lines(&dir.join("events.log")), 1);
}
#[test]
fn real_process_exit_and_restart_preserve_event_source_and_successful_subscription() {
    let temp = tempfile::tempdir().unwrap();
    for phase in ["submit", "first", "ack", "final", "run", "cached"] {
        let result = std::process::Command::new(std::env::current_exe().unwrap())
            .args(["--exact", "durable::event_process_worker", "--nocapture"])
            .env("NOFY_EVENT_PROCESS_DIR", temp.path())
            .env("NOFY_EVENT_PROCESS_PHASE", phase)
            .output()
            .unwrap();
        assert_eq!(
            result.status.code(),
            Some(if matches!(phase, "run" | "cached") {
                0
            } else {
                97
            }),
            "{phase}: {}{}",
            String::from_utf8_lossy(&result.stdout),
            String::from_utf8_lossy(&result.stderr)
        );
    }
    assert_eq!(lines(&temp.path().join("events.log")), 1);
}
