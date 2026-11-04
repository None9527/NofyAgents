use chrono::Utc;
use nofy_memory::consolidation::{
    ConsolidationAction, ConsolidationEngine, ConsolidationError, ConsolidationKillPoint,
    ConsolidationMode, ConsolidationPlan, TopicRef,
};
use nofy_memory::layout::UnifiedMemoryLayout;
use nofy_memory::model::{
    ContentHash, MemoryScope, Observation, ObservationId, ObservationKind, ObservationStatus,
    OperationId, OperationPhase, ProjectId, Provenance,
};
use nofy_memory::observation_store::ObservationStore;

fn hash(text: &str) -> ContentHash {
    ContentHash::parse(blake3::hash(text.as_bytes()).to_hex().to_string()).unwrap()
}

fn observation(root: &std::path::Path) -> ObservationId {
    let statement = "Prefer deterministic recovery.";
    let observation = Observation {
        id: ObservationId::new(),
        scope: MemoryScope::Personal,
        kind: ObservationKind::User,
        statement: statement.to_owned(),
        keywords: vec![],
        aliases: vec![],
        supersedes: vec![],
        project_validity: None,
        provenance: Provenance {
            session_id: "session".to_owned(),
            turn_id: "turn".to_owned(),
            model: "test".to_owned(),
            prompt_version: "v1".to_owned(),
            source_hash: hash(statement),
        },
        content_hash: hash(statement),
        created_at: Utc::now(),
    };
    ObservationStore::new(root.to_path_buf())
        .persist(&observation, ObservationStatus::Active)
        .unwrap();
    observation.id
}

fn content(body: &str) -> String {
    format!(
        "<!-- nofy-memory: id={}; revision=1; origin=curator; pinned=false -->\n# Curated\n\n{body}\n",
        uuid::Uuid::new_v4()
    )
}

fn setup() -> (tempfile::TempDir, ConsolidationEngine, ConsolidationPlan) {
    let temp = tempfile::tempdir().unwrap();
    let root = temp.path().join("memory");
    let evidence = observation(&root);
    let project_id = ProjectId::new();
    let engine = ConsolidationEngine::new(
        root,
        project_id,
        nofy_memory::config::MemoryIndexConfig::default(),
        4,
    );
    let plan = ConsolidationPlan {
        operation_id: OperationId::new(),
        scope: MemoryScope::Personal,
        evidence: vec![evidence],
        actions: vec![ConsolidationAction::Create {
            path: "curated.md".into(),
            content: content("Stable result."),
        }],
    };
    (temp, engine, plan)
}

#[test]
fn different_consolidation_operations_and_user_write_share_one_scope_gate() {
    use nofy_memory::access::MemoryAccess;
    use nofy_memory::scope_write_lock::ScopeWriteGuard;
    use std::sync::mpsc;
    use std::time::Duration;

    let (temp, _engine, first) = setup();
    let root = temp.path().join("memory");
    let layout = UnifiedMemoryLayout::new(&root);
    let scope = layout.personal_scope();
    let guard = ScopeWriteGuard::acquire(scope.root()).unwrap();
    let second = ConsolidationPlan {
        operation_id: OperationId::new(),
        scope: MemoryScope::Personal,
        evidence: vec![observation(&root)],
        actions: vec![ConsolidationAction::Create {
            path: "second.md".into(),
            content: content("Second operation."),
        }],
    };
    let (started_tx, started_rx) = mpsc::channel();
    let (done_tx, done_rx) = mpsc::channel();
    let mut workers = Vec::new();
    for plan in [first, second] {
        let root = root.clone();
        let started = started_tx.clone();
        let done = done_tx.clone();
        workers.push(std::thread::spawn(move || {
            let engine = ConsolidationEngine::new(
                root,
                ProjectId::new(),
                nofy_memory::config::MemoryIndexConfig::default(),
                4,
            );
            started.send(()).unwrap();
            engine
                .execute(&plan, ConsolidationMode::Active, "worker", 100, None)
                .unwrap();
            done.send(()).unwrap();
        }));
    }
    let user_root = root.clone();
    workers.push(std::thread::spawn(move || {
        let layout = UnifiedMemoryLayout::new(user_root);
        let access = MemoryAccess::open(layout.meta_database(), layout.personal_scope()).unwrap();
        started_tx.send(()).unwrap();
        access
            .create_topic(
                OperationId::new(),
                std::path::Path::new("user.md"),
                "User writing during dream.",
            )
            .unwrap();
        done_tx.send(()).unwrap();
    }));
    for _ in 0..3 {
        started_rx.recv_timeout(Duration::from_secs(5)).unwrap();
    }
    assert!(done_rx.recv_timeout(Duration::from_millis(30)).is_err());
    drop(guard);
    for _ in 0..3 {
        done_rx.recv_timeout(Duration::from_secs(10)).unwrap();
    }
    for worker in workers {
        worker.join().unwrap();
    }
    let manifest: serde_json::Value =
        serde_json::from_slice(&std::fs::read(scope.manifest_file()).unwrap()).unwrap();
    assert_eq!(manifest["topics"].as_object().unwrap().len(), 3);
    assert_eq!(
        std::fs::read_dir(scope.observations_directory())
            .unwrap()
            .count(),
        0
    );
}

#[test]
fn every_phase_resumes_the_same_frozen_operation() {
    for point in [
        ConsolidationKillPoint::EvidenceClaimed,
        ConsolidationKillPoint::CanonicalCommitted,
        ConsolidationKillPoint::DerivativesRebuilt,
        ConsolidationKillPoint::EvidenceArchived,
    ] {
        let (temp, engine, plan) = setup();
        assert!(matches!(
            engine.execute(&plan, ConsolidationMode::Active, "worker-a", 100, Some(point)),
            Err(ConsolidationError::Injected(actual)) if actual == point
        ));
        let receipt = engine
            .execute(&plan, ConsolidationMode::Active, "worker-b", 102, None)
            .unwrap();
        assert_eq!(receipt.operation_id, plan.operation_id);
        assert_eq!(receipt.phase, OperationPhase::Completed);
        assert!(
            temp.path()
                .join("memory/personal/topics/curated.md")
                .is_file()
        );
        assert!(
            temp.path()
                .join(format!(
                    "memory/personal/archive/observations/{}.md",
                    plan.evidence[0].as_uuid()
                ))
                .is_file()
        );
    }
}

#[test]
fn frozen_plan_rejects_regeneration_with_different_actions() {
    let (_temp, engine, mut plan) = setup();
    engine
        .execute(&plan, ConsolidationMode::Shadow, "shadow", 100, None)
        .unwrap();
    plan.actions = vec![ConsolidationAction::Create {
        path: "different.md".into(),
        content: content("Different plan."),
    }];
    assert!(matches!(
        engine.execute(&plan, ConsolidationMode::Shadow, "shadow", 101, None),
        Err(ConsolidationError::PlanChanged)
    ));
}

#[test]
fn shadow_saves_plan_without_mutating_or_archiving_and_record_only_saves_nothing() {
    let (temp, engine, plan) = setup();
    let receipt = engine
        .execute(&plan, ConsolidationMode::Shadow, "shadow", 100, None)
        .unwrap();
    assert_eq!(receipt.phase, OperationPhase::Planned);
    assert!(
        !temp
            .path()
            .join("memory/personal/topics/curated.md")
            .exists()
    );
    assert!(
        temp.path()
            .join(format!(
                "memory/personal/observations/{}.md",
                plan.evidence[0].as_uuid()
            ))
            .is_file()
    );

    let fresh = setup();
    assert!(matches!(
        fresh
            .1
            .execute(&fresh.2, ConsolidationMode::RecordOnly, "record", 100, None),
        Err(ConsolidationError::RecordOnly)
    ));
    assert!(!fresh.0.path().join("memory/personal/operations").exists());
}

#[test]
fn user_owned_or_pinned_topics_are_read_only_evidence() {
    let (temp, engine, mut plan) = setup();
    let scope = UnifiedMemoryLayout::new(temp.path().join("memory")).personal_scope();
    std::fs::create_dir_all(scope.topics_directory()).unwrap();
    let user = format!(
        "<!-- nofy-memory: id={}; revision=1; origin=user; pinned=true -->\n# User\n\nKeep me.\n",
        uuid::Uuid::new_v4()
    );
    std::fs::write(scope.topics_directory().join("user.md"), &user).unwrap();
    plan.actions = vec![ConsolidationAction::Update {
        path: "user.md".into(),
        expected_hash: hash(&user),
        content: content("Overwrite attempt."),
    }];
    assert!(matches!(
        engine.execute(&plan, ConsolidationMode::Active, "worker", 100, None),
        Err(ConsolidationError::ProtectedTopic(_))
    ));
    assert_eq!(
        std::fs::read_to_string(scope.topics_directory().join("user.md")).unwrap(),
        user
    );
}

#[test]
fn automatic_action_schema_has_no_delete_variant() {
    let actions = vec![
        ConsolidationAction::Create {
            path: "a.md".into(),
            content: content("a"),
        },
        ConsolidationAction::Rename {
            from: "a.md".into(),
            to: "b.md".into(),
            expected_hash: hash("a"),
        },
    ];
    let json = serde_json::to_string(&actions).unwrap();
    assert!(!json.contains("delete"));
}

#[test]
fn rename_resumes_after_the_source_was_committed() {
    let (temp, engine, mut plan) = setup();
    let scope = UnifiedMemoryLayout::new(temp.path().join("memory")).personal_scope();
    std::fs::create_dir_all(scope.topics_directory()).unwrap();
    let original = content("Rename me.");
    std::fs::write(scope.topics_directory().join("old.md"), &original).unwrap();
    plan.actions = vec![ConsolidationAction::Rename {
        from: "old.md".into(),
        to: "new.md".into(),
        expected_hash: hash(&original),
    }];

    assert!(matches!(
        engine.execute(
            &plan,
            ConsolidationMode::Active,
            "worker-a",
            100,
            Some(ConsolidationKillPoint::CanonicalCommitted)
        ),
        Err(ConsolidationError::Injected(
            ConsolidationKillPoint::CanonicalCommitted
        ))
    ));
    let receipt = engine
        .execute(&plan, ConsolidationMode::Active, "worker-b", 102, None)
        .unwrap();
    assert_eq!(receipt.phase, OperationPhase::Completed);
    assert!(!scope.topics_directory().join("old.md").exists());
    assert!(scope.topics_directory().join("new.md").is_file());
}

#[test]
fn merge_rejects_a_source_that_changed_after_planning() {
    let (temp, engine, mut plan) = setup();
    let scope = UnifiedMemoryLayout::new(temp.path().join("memory")).personal_scope();
    std::fs::create_dir_all(scope.topics_directory()).unwrap();
    let original = content("Original source.");
    std::fs::write(scope.topics_directory().join("source.md"), &original).unwrap();
    plan.actions = vec![ConsolidationAction::Merge {
        sources: vec![TopicRef {
            path: "source.md".into(),
            expected_hash: hash("stale hash"),
        }],
        target: "merged.md".into(),
        content: content("Merged result."),
    }];

    assert!(matches!(
        engine.execute(&plan, ConsolidationMode::Active, "worker", 100, None),
        Err(ConsolidationError::PlanChanged)
    ));
    assert!(scope.topics_directory().join("source.md").is_file());
}
