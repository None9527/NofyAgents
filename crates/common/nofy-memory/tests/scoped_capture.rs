use nofy_memory::{
    capture::{CaptureQueue, DurableTurn, EnqueueOutcome},
    layout::UnifiedMemoryLayout,
    model::{MemoryScope, ProjectId},
    state::UnifiedState,
};
use std::collections::BTreeSet;

fn turn(project: ProjectId) -> DurableTurn {
    let transcript = "User: Deployment uses the green release channel.\nAssistant: Understood.";
    DurableTurn {
        session_id: "same-session".into(),
        turn_id: "same-turn".into(),
        transcript: transcript.into(),
        transcript_hash: blake3::hash(transcript.as_bytes()).to_hex().to_string(),
        project_id: Some(project),
        top_level: true,
        persisted: true,
        succeeded: true,
    }
}
fn enqueue(queue: &CaptureQueue, binding: &str, turn: &DurableTurn) -> String {
    match queue.enqueue_scoped(binding, turn, 100).unwrap() {
        EnqueueOutcome::Queued { job_id } => job_id,
        other => panic!("{other:?}"),
    }
}
fn output() -> String {
    r#"[{"statement":"Deployment uses the green release channel.","kind":"project_fact","scope":"project","confidence":"certain"}]"#.into()
}
fn observations(root: &std::path::Path, project: ProjectId) -> Vec<Vec<u8>> {
    let path = UnifiedMemoryLayout::new(root.to_owned())
        .scope(&MemoryScope::Project(project))
        .observations_directory();
    let mut files = std::fs::read_dir(path)
        .unwrap()
        .map(|p| p.unwrap().path())
        .collect::<Vec<_>>();
    files.sort();
    files
        .into_iter()
        .map(|p| std::fs::read(p).unwrap())
        .collect()
}
#[test]
fn exact_tasks_separate_bindings_and_successful_replay_preserves_immutable_bytes() {
    let dir = tempfile::tempdir().unwrap();
    let queue = CaptureQueue::open(dir.path().to_owned(), BTreeSet::new()).unwrap();
    let one = ProjectId::new();
    let two = ProjectId::new();
    let a = enqueue(&queue, "binding-one", &turn(one));
    let b = enqueue(&queue, "binding-two", &turn(two));
    assert_ne!(a, b);
    assert!(
        queue
            .enqueue_scoped("binding-one", &turn(two), 101)
            .is_err()
    );
    assert_eq!(
        queue
            .process_output(&b, dir.path().to_owned(), "owner", output(), 101)
            .unwrap()
            .unwrap()
            .persisted,
        1
    );
    assert_eq!(queue.state(&a).unwrap().as_deref(), Some("queued"));
    assert_eq!(queue.state(&b).unwrap().as_deref(), Some("succeeded"));
    let before = observations(dir.path(), two);
    assert_eq!(before.len(), 1);
    assert!(
        queue
            .process_output(
                &b,
                dir.path().to_owned(),
                "new-owner",
                "invalid output must not be evaluated again".into(),
                200
            )
            .unwrap()
            .is_none()
    );
    assert_eq!(observations(dir.path(), two), before);
    assert!(String::from_utf8_lossy(&before[0]).contains("1970-01-01T00:01:40Z"));
}
#[test]
fn exact_task_claim_respects_live_leases_and_fences_an_expired_owner() {
    let dir = tempfile::tempdir().unwrap();
    let layout = UnifiedMemoryLayout::new(dir.path().to_owned());
    let queue = CaptureQueue::open(dir.path().to_owned(), BTreeSet::new()).unwrap();
    let project = ProjectId::new();
    let id = enqueue(&queue, "binding", &turn(project));
    let state = UnifiedState::open(
        layout.meta_database(),
        layout.personal_scope().state_database(),
    )
    .unwrap();
    let old = state
        .claim_capture_job_by_id(&id, "old", 101, 2)
        .unwrap()
        .unwrap();
    assert!(
        queue
            .process_output(&id, dir.path().to_owned(), "new", output(), 102)
            .is_err()
    );
    assert!(
        queue
            .process_output(&id, dir.path().to_owned(), "new", output(), 104)
            .unwrap()
            .is_some()
    );
    assert!(
        state
            .complete_capture_job(&old, "stale success", 105)
            .is_err()
    );
    let db = rusqlite::Connection::open(layout.meta_database()).unwrap();
    let updated_at: i64 = db
        .query_row(
            "SELECT updated_at FROM capture_jobs WHERE id=?1",
            [&id],
            |row| row.get(0),
        )
        .unwrap();
    let completed_at: i64 = db
        .query_row(
            "SELECT created_at FROM capture_outcomes WHERE job_id=?1",
            [&id],
            |row| row.get(0),
        )
        .unwrap();
    assert_eq!(updated_at, 104);
    assert_eq!(completed_at, 104);
    assert_eq!(observations(dir.path(), project).len(), 1);
}
