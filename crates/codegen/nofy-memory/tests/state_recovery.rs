use std::path::Path;

use chrono::Utc;
use nofy_memory::atomic_file::{AtomicWriteKillPoint, replace_with_kill_point};
use nofy_memory::layout::UnifiedMemoryLayout;
use nofy_memory::model::{
    ContentHash, MemoryScope, Observation, ObservationId, ObservationKind, ObservationStatus,
    OperationId, OperationPhase, Provenance,
};
use nofy_memory::state::{CaptureJobClaim, StateKillPoint, UnifiedState};
use rusqlite::Connection;

fn content_hash(content: &str) -> ContentHash {
    ContentHash::parse(blake3::hash(content.as_bytes()).to_hex().to_string()).unwrap()
}

fn observation(statement: &str) -> Observation {
    Observation {
        id: ObservationId::new(),
        scope: MemoryScope::Personal,
        kind: ObservationKind::Explicit,
        statement: statement.to_owned(),
        keywords: vec!["preference".to_owned()],
        aliases: Vec::new(),
        supersedes: Vec::new(),
        project_validity: None,
        provenance: Provenance {
            session_id: "session-1".to_owned(),
            turn_id: "turn-1".to_owned(),
            model: "test-model".to_owned(),
            prompt_version: "v1".to_owned(),
            source_hash: content_hash(statement),
        },
        content_hash: content_hash(statement),
        created_at: Utc::now(),
    }
}

fn table_names(path: &Path) -> Vec<String> {
    let connection = Connection::open(path).unwrap();
    let mut statement = connection
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
        .unwrap();
    statement
        .query_map([], |row| row.get(0))
        .unwrap()
        .map(Result::unwrap)
        .collect()
}

#[test]
fn layout_and_state_databases_have_only_unified_memory_primitives() {
    let temp = tempfile::tempdir().unwrap();
    let layout = UnifiedMemoryLayout::new(temp.path());
    let scope = layout.personal_scope();
    let state = UnifiedState::open(layout.meta_database(), scope.state_database()).unwrap();
    for settings in [
        state.meta_settings().unwrap(),
        state.scope_settings().unwrap(),
    ] {
        assert_eq!(settings.journal_mode.to_ascii_lowercase(), "wal");
        assert!(settings.foreign_keys);
        assert!(settings.busy_timeout_ms > 0);
        assert_eq!(settings.schema_version, 1);
    }
    drop(state);

    let meta_tables = table_names(&layout.meta_database());
    for required in ["capture_jobs", "capture_outcomes", "metadata"] {
        assert!(meta_tables.iter().any(|table| table == required));
    }
    let scope_tables = table_names(&scope.state_database());
    for required in [
        "files",
        "observation_states",
        "operations",
        "operation_claims",
        "topic_changes",
        "tombstones",
        "quarantine",
        "metadata",
    ] {
        assert!(scope_tables.iter().any(|table| table == required));
    }
    assert!(!scope_tables.iter().any(|table| table == "external_roots"));
    assert!(
        !scope_tables
            .iter()
            .any(|table| table == "knowledge_documents")
    );
    assert!(!temp.path().join("external-roots").exists());
    assert!(!temp.path().join("knowledge-documents").exists());
}

#[test]
fn observation_body_is_immutable_while_status_is_a_projection() {
    let temp = tempfile::tempdir().unwrap();
    let layout = UnifiedMemoryLayout::new(temp.path());
    let scope = layout.personal_scope();
    let state = UnifiedState::open(layout.meta_database(), scope.state_database()).unwrap();
    let original = observation("Prefer concise answers");
    state
        .record_observation_file(&original, "observations/one.md")
        .unwrap();

    let mut mutated = original.clone();
    mutated.statement = "Prefer very long answers".to_owned();
    mutated.content_hash = content_hash(&mutated.statement);
    assert!(
        state
            .record_observation_file(&mutated, "observations/one.md")
            .is_err(),
        "an observation ID cannot be rebound to changed content"
    );

    state
        .set_observation_status(original.id, ObservationStatus::Disputed, None)
        .unwrap();
    let view = state.observation_view(original.clone()).unwrap();
    assert_eq!(view.observation.statement, "Prefer concise answers");
    assert_eq!(view.status, ObservationStatus::Disputed);
    assert!(!view.is_recallable());
}

#[test]
fn expired_capture_lease_uses_generation_fencing() {
    let temp = tempfile::tempdir().unwrap();
    let layout = UnifiedMemoryLayout::new(temp.path());
    let scope = layout.personal_scope();
    let state = UnifiedState::open(layout.meta_database(), scope.state_database()).unwrap();
    state.enqueue_capture_job("job-1", "{}", 100).unwrap();

    let first = state
        .claim_capture_job("worker-a", 100, 10)
        .unwrap()
        .unwrap();
    assert_eq!(first.generation, 1);
    let second = state
        .claim_capture_job("worker-b", 111, 10)
        .unwrap()
        .unwrap();
    assert_eq!(second.generation, 2);

    assert!(state.complete_capture_job(&first, "stale", 112).is_err());
    state
        .complete_capture_job(&second, "accepted", 112)
        .unwrap();
    assert_eq!(
        state.capture_outcome("job-1").unwrap().as_deref(),
        Some("accepted")
    );

    let copied = CaptureJobClaim {
        job_id: second.job_id.clone(),
        worker_id: second.worker_id.clone(),
        generation: second.generation,
    };
    assert!(
        state
            .complete_capture_job(&copied, "duplicate", 113)
            .is_err()
    );
}

#[test]
fn expired_operation_lease_fences_the_old_worker() {
    let temp = tempfile::tempdir().unwrap();
    let layout = UnifiedMemoryLayout::new(temp.path());
    let scope = layout.personal_scope();
    let state = UnifiedState::open(layout.meta_database(), scope.state_database()).unwrap();
    let operation_id = OperationId::new();
    state
        .register_operation(operation_id, "topic_update", 100)
        .unwrap();

    let first = state
        .claim_operation(operation_id, "worker-a", 100, 10)
        .unwrap()
        .unwrap();
    let second = state
        .claim_operation(operation_id, "worker-b", 111, 10)
        .unwrap()
        .unwrap();
    assert_eq!(first.generation, 1);
    assert_eq!(second.generation, 2);
    assert!(
        state
            .advance_operation(&first, OperationPhase::CanonicalCommitted, 112)
            .is_err()
    );
    state
        .advance_operation(&second, OperationPhase::CanonicalCommitted, 112)
        .unwrap();
}

#[test]
fn atomic_replace_failure_leaves_old_or_complete_new_file() {
    let temp = tempfile::tempdir().unwrap();
    let path = temp.path().join("topic.md");
    std::fs::write(&path, "old").unwrap();

    for point in [
        AtomicWriteKillPoint::TempFileSynced,
        AtomicWriteKillPoint::BeforeRename,
    ] {
        std::fs::write(&path, "old").unwrap();
        assert!(replace_with_kill_point(&path, b"complete-new", Some(point)).is_err());
        let visible = std::fs::read_to_string(&path).unwrap();
        assert!(visible == "old" || visible == "complete-new");
        assert!(!visible.is_empty());
    }
}

#[test]
fn canonical_replace_recovers_around_database_commit() {
    let temp = tempfile::tempdir().unwrap();
    let layout = UnifiedMemoryLayout::new(temp.path());
    let scope = layout.personal_scope();
    std::fs::create_dir_all(scope.topics_directory()).unwrap();
    let path = scope.topics_directory().join("preferences.md");

    for point in [
        StateKillPoint::DatabaseBeforeCommit,
        StateKillPoint::DatabaseAfterCommit,
    ] {
        std::fs::write(&path, "old").unwrap();
        let operation_id = OperationId::new();
        {
            let state = UnifiedState::open(layout.meta_database(), scope.state_database()).unwrap();
            assert!(
                state
                    .replace_canonical_file(operation_id, &path, b"complete-new", Some(point),)
                    .is_err()
            );
        }

        let state = UnifiedState::open(layout.meta_database(), scope.state_database()).unwrap();
        assert_eq!(std::fs::read_to_string(&path).unwrap(), "complete-new");
        assert_eq!(
            state.operation_phase(operation_id).unwrap(),
            Some(OperationPhase::CanonicalCommitted)
        );
    }
}
