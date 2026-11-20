use super::*;

#[tokio::test]
async fn idle_preflight_observes_failure_committed_while_waiting_for_task_journal() {
    let context = RunContext::new("parent-thread", "root");
    let (scope, owner) = Scope::open(&context, None, "fixture").await.unwrap();
    let mut journal = scope.shared.journal.lock().await;
    let idle = scope.has_running();
    tokio::pin!(idle);
    assert!(futures::poll!(&mut idle).is_pending());
    // A child settles under the journal lock, but its terminal save fails.
    // An idle check must not use the earlier clean failure view with this
    // later speculative outcome and then start another parent model turn.
    journal.value.tasks.insert(
        "worker".into(),
        Task {
            tool: "child".into(),
            arguments: json!({}),
            call_id: "spawn".into(),
            state: RunState::default(),
            identity: "fixture".into(),
            outcome: Some(TaskOutcome::Completed(json!({"result":1}))),
        },
    );
    *owner.failure.lock().unwrap() = Some("terminal save failed".into());
    drop(journal);
    assert!(
        matches!(idle.await, Err(Error::Checkpoint(reason)) if reason == "terminal save failed")
    );
}
