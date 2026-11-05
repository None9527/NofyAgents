//! Admission/history tests reuse the existing session budget fixture.
//! Actual model and effect acceptance is performed through the Host/MCP path.
use super::*;
fn fork_command(system: &CompiledSystem, id: &str, through: Option<usize>) -> SessionFork {
    let mut root = request(system, id);
    root.thread_id = format!("thread-{id}");
    SessionFork {
        start: SessionStart {
            session_id: format!("session-{id}"),
            command_id: format!("branch-{id}"),
            expected_session_revision: (),
            request_json: serde_json::to_string(&root).unwrap(),
            labels: Default::default(),
        },
        source: ForkSource {
            source_session_id: "conversation".into(),
            expected_source_session_revision: "0".into(),
            source_run_id: "one".into(),
            expected_source_revision: 0,
            through_message: through,
        },
    }
}
#[tokio::test]
async fn fork_and_rewind_preserve_source_history_original_budget_and_restart_lineage() {
    let directory = tempfile::tempdir().unwrap();
    let (store, registry, system, _, _, scope) = configured(directory.path(), "queue", 3);
    let supervisor = RunSupervisor::new(store.clone()).with_session_registry(registry.clone());
    supervisor
        .start_session(start(&system, "initial"), &system)
        .await
        .unwrap();
    supervisor
        .execute_submitted(&registry, "one")
        .await
        .unwrap();
    let original = checkpoint(&store).await;
    let old_budget = store.inspect(&scope).await.unwrap().unwrap();
    let command = fork_command(&system, "fork", None);
    let receipt = supervisor
        .fork_session(command.clone(), &system)
        .await
        .unwrap();
    assert_eq!(receipt.phase, "applied");
    let seeded = store.load("4:chatthread-fork").await.unwrap().unwrap();
    assert_eq!(seeded.state.messages, original.state.messages);
    assert!(!seeded.state.has_pending_work());
    assert!(seeded.state.input_progress.initial.is_none());
    assert_eq!(checkpoint(&store).await.revision, original.revision);
    assert_eq!(
        store
            .inspect(&scope)
            .await
            .unwrap()
            .unwrap()
            .used
            .model_calls,
        old_budget.used.model_calls
    );
    supervisor
        .execute_submitted(&registry, "fork")
        .await
        .unwrap();
    let mut branch_scope = scope.clone();
    branch_scope.root_run_id = "fork".into();
    assert_eq!(
        store
            .inspect(&branch_scope)
            .await
            .unwrap()
            .unwrap()
            .used
            .model_calls,
        1
    );
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
    assert_eq!(
        serde_json::to_value(
            supervisor
                .fork_session(command.clone(), &system)
                .await
                .unwrap()
        )
        .unwrap(),
        serde_json::to_value(&receipt).unwrap()
    );
    let mut conflict = command;
    conflict.source.through_message = Some(1);
    assert!(supervisor.fork_session(conflict, &system).await.is_err());
    supervisor
        .submit_managed(request(&system, "two"), &system)
        .await
        .unwrap();
    supervisor
        .execute_submitted(&registry, "two")
        .await
        .unwrap();
    assert!(checkpoint(&store).await.state.messages.len() > original.state.messages.len());
    let rewind = fork_command(&system, "rewind", Some(1));
    let result = supervisor.fork_session(rewind, &system).await.unwrap();
    assert_eq!(result.operation, "session.rewind");
    let seed = store.load("4:chatthread-rewind").await.unwrap().unwrap();
    assert_eq!(seed.state.messages, original.state.messages[..1]);
    let tree = store.session_tree("session-fork").await.unwrap();
    assert_eq!(tree["root_session_id"], "conversation");
    assert_eq!(tree["branches"].as_array().unwrap().len(), 2);
    let mut stale = fork_command(&system, "stale", None);
    stale.source.expected_source_session_revision = "999".into();
    assert!(supervisor.fork_session(stale, &system).await.is_err());
    assert!(store.managed_run("stale").await.unwrap().is_none());
    store
        .inspect_retained_modules(Default::default(), (), |_, _, _| Ok(()))
        .await
        .unwrap();
    let reopened = SqliteStore::open(&directory.path().join("runtime.sqlite")).unwrap();
    assert_eq!(reopened.session_tree("session-fork").await.unwrap(), tree);
    assert_eq!(
        reopened
            .inspect(&scope)
            .await
            .unwrap()
            .unwrap()
            .used
            .model_calls,
        2
    );
}
