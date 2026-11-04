use super::*;

#[test]
fn accepted_ledger_reopen_does_not_initialize_again_under_a_peer_writer() {
    let temp = tempfile::tempdir().unwrap();
    let service = open(temp.path());
    let writer = JournalMode::Wal
        .open(&service.layout().meta_database())
        .unwrap();
    writer.execute_batch("BEGIN IMMEDIATE").unwrap();
    // Opening an accepted ledger is a read, not an implicit schema update.
    let result = service.durable_store();
    writer.execute_batch("ROLLBACK").unwrap();
    assert!(result.is_ok(), "{:?}", result.err());
}

#[test]
fn accepted_ledger_missing_table_is_not_silently_reinitialized() {
    let temp = tempfile::tempdir().unwrap();
    let service = open(temp.path());
    let db = JournalMode::Wal
        .open(&service.layout().meta_database())
        .unwrap();
    db.execute_batch("DROP TABLE nofy_service_undo_v1").unwrap();
    assert!(service.durable_store().is_err());
    let exists: bool = db
        .query_row(
            "SELECT EXISTS(SELECT 1 FROM sqlite_master WHERE name='nofy_service_undo_v1')",
            [],
            |row| row.get(0),
        )
        .unwrap();
    assert!(!exists);
}

fn config(root: &Path) -> NofyMemoryServiceConfig {
    NofyMemoryServiceConfig {
        root: root.join("memory"),
        workspace: root.join("workspace"),
        project_id: ProjectId::from_repository_fingerprint("durable-undo-crash").unwrap(),
        automatic_learning_enabled: false,
        ..NofyMemoryServiceConfig::default_for_tests()
    }
}
fn open(root: &Path) -> NofyMemoryService {
    NofyMemoryService::new(config(root))
        .unwrap()
        .with_durable_undo(Default::default())
        .unwrap()
}
fn note() -> RememberRequest {
    RememberRequest {
        area: MemoryArea::Personal,
        statement: "Release headings use blue.".into(),
        title: None,
        confirm_sensitive: false,
    }
}

#[cfg(feature = "agent-runtime")]
#[test]
fn original_sdk_identity_bytes_are_preserved_and_durable_limits_change_identity() {
    let temp = tempfile::tempdir().unwrap();
    let config = config(temp.path());
    let legacy = NofyMemoryService::new(config.clone()).unwrap();
    let expected = blake3::hash(
        format!(
            "{:?}:{:?}:{}",
            config.root,
            config.workspace,
            config.project_id.as_uuid()
        )
        .as_bytes(),
    )
    .to_hex()
    .to_string();
    assert_eq!(legacy.runtime_resource_identity(), expected);
    let durable = legacy.with_durable_undo(Default::default()).unwrap();
    assert_ne!(durable.runtime_resource_identity(), expected);
    let bounded = durable
        .with_durable_undo(DurableUndoOptions {
            max_pending: 1,
            ..Default::default()
        })
        .unwrap();
    assert_ne!(
        durable.runtime_resource_identity(),
        bounded.runtime_resource_identity()
    );
}

#[test]
fn a_claim_without_native_proof_never_authorizes_deleting_an_unowned_stage() {
    let runtime = tokio::runtime::Builder::new_current_thread()
        .build()
        .unwrap();
    let temp = tempfile::tempdir().unwrap();
    let service = open(temp.path());
    let first = runtime.block_on(service.remember(note())).unwrap();
    let store = service.durable_store().unwrap();
    let id = store
        .claim(&service.undo_owner(), &first.undo_token.operation_id)
        .unwrap();
    let scope = service.scope_layout(&MemoryArea::Personal);
    let stage = scope.root().join(".undo-delete");
    std::fs::create_dir(&stage).unwrap();
    let stage = stage.join(id.as_uuid().to_string());
    let original = std::fs::read(
        scope
            .topics_directory()
            .join(format!("remembered-{}.md", first.target.id)),
    )
    .unwrap();
    std::fs::write(&stage, &original).unwrap();
    assert!(
        runtime
            .block_on(service.forget(ForgetRequest {
                target: first.target.clone(),
                confirmed: true
            }))
            .is_err()
    );
    assert_eq!(std::fs::read(&stage).unwrap(), original);
    assert!(runtime.block_on(service.get(first.target.clone())).is_ok());
    std::fs::remove_file(&stage).unwrap();
    runtime
        .block_on(service.forget(ForgetRequest {
            target: first.target,
            confirmed: true,
        }))
        .unwrap();
    assert!(matches!(
        runtime.block_on(service.undo(first.undo_token)),
        Err(MemoryServiceError::NotFound)
    ));
}

#[test]
fn committed_delete_preserves_a_later_same_byte_recreation_and_its_new_file_identity() {
    let runtime = tokio::runtime::Builder::new_current_thread()
        .build()
        .unwrap();
    let temp = tempfile::tempdir().unwrap();
    let service = open(temp.path());
    let first = runtime.block_on(service.remember(note())).unwrap();
    let scope = service.scope_layout(&MemoryArea::Personal);
    let relative = PathBuf::from(format!("remembered-{}.md", first.target.id));
    let path = scope.topics_directory().join(&relative);
    let original = std::fs::read_to_string(&path).unwrap();
    drop(service);
    let status = std::process::Command::new(std::env::current_exe().unwrap())
        .args([
            "--exact",
            "service::durable::tests::crash_child",
            "--nocapture",
        ])
        .env("NOFY_MEMORY_UNDO_TEST_ROOT", temp.path())
        .env(
            "NOFY_MEMORY_UNDO_TEST_TOKEN",
            serde_json::to_string(&first.undo_token).unwrap(),
        )
        .env("NOFY_MEMORY_UNDO_TEST_EXIT", "canonical")
        .status()
        .unwrap();
    assert_eq!(status.code(), Some(73));
    let service = open(temp.path());
    let recreated = OperationId::new();
    service
        .access(&MemoryArea::Personal)
        .unwrap()
        .create_topic(recreated, &relative, &original)
        .unwrap();
    service.next_generation().unwrap();
    runtime.block_on(service.undo(first.undo_token)).unwrap();
    assert_eq!(std::fs::read_to_string(&path).unwrap(), original);
    let db = Connection::open(scope.state_database()).unwrap();
    let owner: String = db
        .query_row(
            "SELECT id FROM files WHERE path=?1",
            [path.to_string_lossy()],
            |row| row.get(0),
        )
        .unwrap();
    assert_eq!(owner, recreated.as_uuid().to_string());
}

#[test]
fn crash_child() {
    let Some(root) = std::env::var_os("NOFY_MEMORY_UNDO_TEST_ROOT") else {
        return;
    };
    let token: UndoToken =
        serde_json::from_str(&std::env::var("NOFY_MEMORY_UNDO_TEST_TOKEN").unwrap()).unwrap();
    let service = open(Path::new(&root));
    if let Ok(target) = std::env::var("NOFY_MEMORY_UNDO_TEST_FORGET") {
        let target: MemoryTarget = serde_json::from_str(&target).unwrap();
        tokio::runtime::Builder::new_current_thread()
            .build()
            .unwrap()
            .block_on(service.forget(ForgetRequest {
                target,
                confirmed: true,
            }))
            .unwrap();
        panic!("expected the forget hard exit boundary");
    }
    tokio::runtime::Builder::new_current_thread()
        .build()
        .unwrap()
        .block_on(service.undo(token))
        .unwrap();
    panic!("expected the configured hard exit boundary");
}

#[test]
fn forget_tombstone_survives_cross_database_gap_and_blocks_relearning_or_undo() {
    let runtime = tokio::runtime::Builder::new_current_thread()
        .build()
        .unwrap();
    let temp = tempfile::tempdir().unwrap();
    let service = open(temp.path());
    let first = runtime.block_on(service.remember(note())).unwrap();
    let revised = runtime
        .block_on(service.revise(ReviseTopicRequest {
            target: first.target,
            replacement: "Release headings use green.".into(),
        }))
        .unwrap();
    drop(service);
    let status = std::process::Command::new(std::env::current_exe().unwrap())
        .args([
            "--exact",
            "service::durable::tests::crash_child",
            "--nocapture",
        ])
        .env("NOFY_MEMORY_UNDO_TEST_ROOT", temp.path())
        .env(
            "NOFY_MEMORY_UNDO_TEST_TOKEN",
            serde_json::to_string(&revised.undo_token).unwrap(),
        )
        .env(
            "NOFY_MEMORY_UNDO_TEST_FORGET",
            serde_json::to_string(&revised.target).unwrap(),
        )
        .env("NOFY_MEMORY_UNDO_TEST_EXIT", "forget_intent")
        .status()
        .unwrap();
    assert_eq!(status.code(), Some(73));
    let service = open(temp.path());
    assert!(runtime.block_on(service.remember(note())).is_err());
    assert!(
        runtime
            .block_on(service.consolidate(ConsolidateRequest {
                area: MemoryArea::Personal,
                mode: ConsolidationMode::Active
            }))
            .is_err()
    );
    assert!(matches!(
        runtime.block_on(service.undo(revised.undo_token)),
        Err(MemoryServiceError::NotFound)
    ));
    assert!(matches!(
        runtime.block_on(service.undo(first.undo_token)),
        Err(MemoryServiceError::NotFound)
    ));
    runtime
        .block_on(service.forget(ForgetRequest {
            target: revised.target,
            confirmed: true,
        }))
        .unwrap();
    assert!(
        runtime
            .block_on(service.list(ListMemoryRequest { area: None }))
            .unwrap()
            .items
            .is_empty()
    );
    runtime.block_on(service.remember(note())).unwrap();
}

#[test]
fn hard_exit_at_each_claim_file_proof_native_and_receipt_boundary_recovers_once() {
    let runtime = tokio::runtime::Builder::new_current_thread()
        .build()
        .unwrap();
    for revised in [false, true] {
        for point in [
            "claimed",
            "delete_staged",
            "replace_written",
            "canonical",
            "native_complete",
            "receipt",
        ] {
            if revised && point == "delete_staged" {
                continue;
            }
            if !revised && point == "replace_written" {
                continue;
            }
            let temp = tempfile::tempdir().unwrap();
            let service = open(temp.path());
            let first = runtime.block_on(service.remember(note())).unwrap();
            let token = if revised {
                runtime
                    .block_on(service.revise(ReviseTopicRequest {
                        target: first.target.clone(),
                        replacement: "Release headings use green.".into(),
                    }))
                    .unwrap()
                    .undo_token
            } else {
                first.undo_token
            };
            drop(service);
            let status = std::process::Command::new(std::env::current_exe().unwrap())
                .args([
                    "--exact",
                    "service::durable::tests::crash_child",
                    "--nocapture",
                ])
                .env("NOFY_MEMORY_UNDO_TEST_ROOT", temp.path())
                .env(
                    "NOFY_MEMORY_UNDO_TEST_TOKEN",
                    serde_json::to_string(&token).unwrap(),
                )
                .env("NOFY_MEMORY_UNDO_TEST_EXIT", point)
                .status()
                .unwrap();
            assert_eq!(status.code(), Some(73), "{point}, revised={revised}");
            let service = open(temp.path());
            if matches!(
                point,
                "claimed" | "delete_staged" | "replace_written" | "canonical"
            ) {
                assert!(
                    runtime.block_on(service.remember(note())).is_err(),
                    "pending native undo must fence new writes"
                );
            }
            let receipt = runtime.block_on(service.undo(token.clone())).unwrap();
            assert_eq!(runtime.block_on(service.undo(token)).unwrap(), receipt);
            if revised {
                assert_eq!(
                    runtime
                        .block_on(service.get(first.target))
                        .unwrap()
                        .body
                        .trim(),
                    "Release headings use blue."
                );
            } else {
                assert!(
                    runtime
                        .block_on(service.list(ListMemoryRequest { area: None }))
                        .unwrap()
                        .items
                        .is_empty()
                );
                assert!(
                    std::fs::read_dir(config(temp.path()).root.join("personal/.undo-delete"))
                        .unwrap()
                        .next()
                        .is_none()
                );
            }
            let db =
                Connection::open(config(temp.path()).root.join("personal/state.sqlite")).unwrap();
            assert_eq!(
                db.query_row("SELECT count(*) FROM topic_changes", [], |row| row
                    .get::<_, u64>(0))
                    .unwrap(),
                if revised { 3 } else { 2 }
            );
        }
    }
}
