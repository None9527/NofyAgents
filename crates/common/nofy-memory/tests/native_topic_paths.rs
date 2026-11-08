use std::path::{Path, PathBuf};

use nofy_memory::{
    access::{AccessError, MemoryAccess},
    layout::UnifiedMemoryLayout,
    model::{ContentHash, OperationId},
    service::{DurableUndoOptions, NofyMemoryService, NofyMemoryServiceConfig},
};
use nofy_memory_types::*;

fn hash(text: &str) -> ContentHash {
    ContentHash::parse(blake3::hash(text.as_bytes()).to_hex().to_string()).unwrap()
}

fn native_relative(topics: &Path, directory: &Path) -> PathBuf {
    std::fs::read_dir(directory)
        .unwrap()
        .next()
        .unwrap()
        .unwrap()
        .path()
        .strip_prefix(topics)
        .unwrap()
        .to_path_buf()
}

#[tokio::test]
async fn nested_native_topic_revises_reopens_undo_and_forgets() {
    let temp = tempfile::tempdir().unwrap();
    let config = NofyMemoryServiceConfig {
        root: temp.path().join("memory"),
        workspace: temp.path().join("workspace"),
        automatic_learning_enabled: false,
        ..NofyMemoryServiceConfig::default_for_tests()
    };
    let open = || {
        NofyMemoryService::new(config.clone())
            .unwrap()
            .with_durable_undo(DurableUndoOptions::default())
            .unwrap()
    };
    let service = open();
    let first = service
        .remember(RememberRequest {
            area: MemoryArea::Personal,
            statement: "Release headings use blue.".into(),
            title: None,
            confirm_sensitive: false,
        })
        .await
        .unwrap();
    let scope = UnifiedMemoryLayout::new(&config.root).personal_scope();
    let topics = scope.topics_directory();
    let original = topics.join(format!("remembered-{}.md", first.target.id));
    let before = std::fs::read(&original).unwrap();
    let nested = topics.join("preferences");
    std::fs::create_dir(&nested).unwrap();
    std::fs::rename(&original, nested.join("editor.md")).unwrap();
    // The path comes from the host filesystem, not a Windows-looking string.
    let relative = native_relative(&topics, &nested);
    assert_eq!(
        service.get(first.target.clone()).await.unwrap().body.trim(),
        "Release headings use blue."
    );
    let revised = service
        .revise(ReviseTopicRequest {
            target: first.target.clone(),
            replacement: "Release headings use green.".into(),
        })
        .await
        .unwrap();
    let db = rusqlite::Connection::open(config.root.join("meta.sqlite")).unwrap();
    let payload: String = db
        .query_row(
            "SELECT payload FROM nofy_service_undo_v1 WHERE token=?1",
            [&revised.undo_token.operation_id],
            |row| row.get(0),
        )
        .unwrap();
    let data: serde_json::Value = serde_json::from_str(&payload).unwrap();
    assert_eq!(
        PathBuf::from(data["entry"]["relative_path"].as_str().unwrap()),
        relative
    );
    drop(db);
    drop(service);
    let service = open();
    let receipt = service.undo(revised.undo_token.clone()).await.unwrap();
    assert!(receipt.restored);
    assert_eq!(std::fs::read(topics.join(&relative)).unwrap(), before);
    drop(service);
    let service = open();
    assert_eq!(service.undo(revised.undo_token).await.unwrap(), receipt);
    // A pending nested revision also reaches Store::load through revocation.
    let pending = service
        .revise(ReviseTopicRequest {
            target: first.target,
            replacement: "Release headings use orange.".into(),
        })
        .await
        .unwrap();
    service
        .forget(ForgetRequest {
            target: pending.target,
            confirmed: true,
        })
        .await
        .unwrap();
    assert!(!topics.join(relative).exists());
    drop(service);
    let service = open();
    assert!(matches!(
        service.undo(pending.undo_token).await,
        Err(MemoryServiceError::NotFound)
    ));
    let db = rusqlite::Connection::open(config.root.join("meta.sqlite")).unwrap();
    let pending_payloads: u64 = db
        .query_row(
            "SELECT count(*) FROM nofy_service_undo_v1 WHERE payload IS NOT NULL",
            [],
            |row| row.get(0),
        )
        .unwrap();
    assert_eq!(pending_payloads, 0);
}

#[test]
fn raw_invalid_topic_spellings_remain_rejected_without_mutation() {
    let temp = tempfile::tempdir().unwrap();
    let layout = UnifiedMemoryLayout::new(temp.path());
    let scope = layout.personal_scope();
    let access = MemoryAccess::open(layout.meta_database(), scope.clone()).unwrap();
    let nested = scope.topics_directory().join("preferences");
    std::fs::create_dir(&nested).unwrap();
    std::fs::write(nested.join("editor.md"), "before").unwrap();
    access.rebuild_manifest().unwrap();
    let manifest = std::fs::read(scope.manifest_file()).unwrap();
    for raw in [
        "",
        "../editor.md",
        "/preferences/editor.md",
        "preferences//editor.md",
        "preferences/./editor.md",
        "preferences/../editor.md",
        "preferences/editor.md/",
        "preferences/editor.txt",
    ] {
        assert!(
            matches!(
                access.update_topic(
                    OperationId::new(),
                    Path::new(raw),
                    &hash("before"),
                    "after",
                    None
                ),
                Err(AccessError::InvalidPath(_))
            ),
            "accepted or misclassified {raw:?}"
        );
        assert_eq!(std::fs::read(nested.join("editor.md")).unwrap(), b"before");
        assert_eq!(std::fs::read(scope.manifest_file()).unwrap(), manifest);
    }
}

#[cfg(unix)]
#[test]
fn literal_backslash_filename_is_not_reinterpreted_as_a_nested_topic() {
    let temp = tempfile::tempdir().unwrap();
    let layout = UnifiedMemoryLayout::new(temp.path());
    let scope = layout.personal_scope();
    let access = MemoryAccess::open(layout.meta_database(), scope.clone()).unwrap();
    let topics = scope.topics_directory();
    let literal = topics.join(r"preferences\editor.md");
    std::fs::write(&literal, "literal").unwrap();
    std::fs::create_dir(topics.join("preferences")).unwrap();
    std::fs::write(topics.join("preferences/editor.md"), "nested").unwrap();
    assert!(matches!(
        access.update_topic(
            OperationId::new(),
            Path::new(r"preferences\editor.md"),
            &hash("literal"),
            "after",
            None,
        ),
        Err(AccessError::InvalidPath(_))
    ));
    assert_eq!(std::fs::read(literal).unwrap(), b"literal");
    assert_eq!(
        std::fs::read(topics.join("preferences/editor.md")).unwrap(),
        b"nested"
    );
}

#[cfg(unix)]
#[test]
fn non_unicode_native_target_keeps_write_rejection_without_lossy_aliasing() {
    use std::ffi::OsString;
    use std::os::unix::ffi::OsStringExt;

    let temp = tempfile::tempdir().unwrap();
    let layout = UnifiedMemoryLayout::new(temp.path());
    let scope = layout.personal_scope();
    let access = MemoryAccess::open(layout.meta_database(), scope.clone()).unwrap();
    let relative = PathBuf::from(OsString::from_vec(b"editor-\xff.md".to_vec()));
    let actual = scope.topics_directory().join(&relative);
    let lossy = scope
        .topics_directory()
        .join(relative.to_string_lossy().as_ref());
    std::fs::write(&actual, "actual").unwrap();
    std::fs::write(&lossy, "different file").unwrap();
    // Existing lexical validation is lossy, but atomic replacement rejects
    // a non-Unicode basename. Neither native file may be redirected or changed.
    let result = access.update_topic(
        OperationId::new(),
        &relative,
        &hash("actual"),
        "after",
        None,
    );
    assert!(matches!(result, Err(AccessError::State(_))), "{result:?}");
    assert_eq!(std::fs::read(actual).unwrap(), b"actual");
    assert_eq!(std::fs::read(lossy).unwrap(), b"different file");
}

#[cfg(unix)]
#[test]
fn native_nested_update_keeps_permission_denial_and_preserves_bytes() {
    use std::os::unix::fs::PermissionsExt;

    let temp = tempfile::tempdir().unwrap();
    let layout = UnifiedMemoryLayout::new(temp.path());
    let scope = layout.personal_scope();
    let access = MemoryAccess::open(layout.meta_database(), scope.clone()).unwrap();
    let nested = scope.topics_directory().join("preferences");
    std::fs::create_dir(&nested).unwrap();
    let actual = nested.join("editor.md");
    std::fs::write(&actual, "before").unwrap();
    let relative = native_relative(&scope.topics_directory(), &nested);
    access.rebuild_manifest().unwrap();
    let manifest = std::fs::read(scope.manifest_file()).unwrap();
    let permissions = std::fs::metadata(&nested).unwrap().permissions();
    std::fs::set_permissions(&nested, std::fs::Permissions::from_mode(0o000)).unwrap();
    match std::fs::read(&actual) {
        Err(error) if error.kind() == std::io::ErrorKind::PermissionDenied => {}
        Ok(_) => {
            std::fs::set_permissions(&nested, permissions).unwrap();
            eprintln!(
                "skipping permission-denial assertion: this process can read a mode-000 fixture"
            );
            return;
        }
        Err(error) => {
            std::fs::set_permissions(&nested, permissions).unwrap();
            panic!("unexpected permission fixture error: {error}");
        }
    }
    let result = access.update_topic(
        OperationId::new(),
        &relative,
        &hash("before"),
        "after",
        None,
    );
    // Restore only the temporary fixture before assertions or cleanup.
    std::fs::set_permissions(&nested, permissions).unwrap();
    assert!(
        matches!(result, Err(AccessError::Io(ref error)) if error.kind() == std::io::ErrorKind::PermissionDenied),
        "{result:?}"
    );
    assert_eq!(std::fs::read(actual).unwrap(), b"before");
    assert_eq!(std::fs::read(scope.manifest_file()).unwrap(), manifest);
}

#[cfg(unix)]
#[test]
fn native_nested_update_keeps_symlink_escape_rejection() {
    use std::os::unix::fs::symlink;

    let temp = tempfile::tempdir().unwrap();
    let layout = UnifiedMemoryLayout::new(temp.path().join("memory"));
    let scope = layout.personal_scope();
    let access = MemoryAccess::open(layout.meta_database(), scope.clone()).unwrap();
    let outside = temp.path().join("outside");
    std::fs::create_dir(&outside).unwrap();
    let actual = outside.join("editor.md");
    std::fs::write(&actual, "before").unwrap();
    let nested = scope.topics_directory().join("preferences");
    symlink(&outside, &nested).unwrap();
    let relative = native_relative(&scope.topics_directory(), &nested);
    assert!(matches!(
        access.update_topic(
            OperationId::new(),
            &relative,
            &hash("before"),
            "after",
            None
        ),
        Err(AccessError::SymlinkEscape(_))
    ));
    assert_eq!(std::fs::read(actual).unwrap(), b"before");
}

#[test]
fn native_nested_access_preserves_hash_checks_and_rollback() {
    use nofy_memory::access::AccessKillPoint;

    let temp = tempfile::tempdir().unwrap();
    let layout = UnifiedMemoryLayout::new(temp.path());
    let scope = layout.personal_scope();
    let access = MemoryAccess::open(layout.meta_database(), scope.clone()).unwrap();
    let topics = scope.topics_directory();
    let nested = topics.join("preferences");
    std::fs::create_dir(&nested).unwrap();
    access
        .create_topic(
            OperationId::new(),
            Path::new("preferences/editor.md"),
            "before",
        )
        .unwrap();
    let relative = native_relative(&topics, &nested);
    let manifest = std::fs::read(scope.manifest_file()).unwrap();
    assert!(matches!(
        access.update_topic(OperationId::new(), &relative, &hash("stale"), "after", None),
        Err(AccessError::StaleHash)
    ));
    for point in [
        AccessKillPoint::AfterCanonicalBeforeManifest,
        AccessKillPoint::AfterManifestBeforeLedger,
    ] {
        assert!(matches!(
            access.update_topic(
                OperationId::new(),
                &relative,
                &hash("before"),
                "after",
                Some(point)
            ),
            Err(AccessError::Injected(_))
        ));
        assert_eq!(std::fs::read(topics.join(&relative)).unwrap(), b"before");
        assert_eq!(std::fs::read(scope.manifest_file()).unwrap(), manifest);
    }
    access
        .update_topic(
            OperationId::new(),
            &relative,
            &hash("before"),
            "after",
            None,
        )
        .unwrap();
    let renamed = relative.parent().unwrap().join("renamed.md");
    access
        .rename_topic(
            OperationId::new(),
            &relative,
            &renamed,
            &hash("after"),
            None,
        )
        .unwrap();
    assert!(!topics.join(&relative).exists());
    assert_eq!(std::fs::read(topics.join(&renamed)).unwrap(), b"after");
    access
        .delete_topic(OperationId::new(), &renamed, &hash("after"), None)
        .unwrap();
    assert!(!topics.join(renamed).exists());
    assert!(matches!(
        access.create_topic(OperationId::new(), Path::new(".hidden.md"), "hidden"),
        Err(AccessError::ProtectedPath(_))
    ));
}

#[cfg(windows)]
#[test]
fn windows_raw_invalid_native_spellings_report_invalid_path() {
    let temp = tempfile::tempdir().unwrap();
    let layout = UnifiedMemoryLayout::new(temp.path());
    let scope = layout.personal_scope();
    let access = MemoryAccess::open(layout.meta_database(), scope).unwrap();
    for raw in [
        r"C:editor.md",
        r"C:\preferences\editor.md",
        r"\preferences\editor.md",
        r"\\server\share\editor.md",
        r"\\?\C:\preferences\editor.md",
        r"\\?\UNC\server\share\editor.md",
        r"\\.\C:\preferences\editor.md",
        r"preferences\\editor.md",
        r"preferences\.\editor.md",
        r"preferences\..\editor.md",
        r"preferences\/editor.md",
        r"preferences\editor.md\",
    ] {
        assert!(
            matches!(
                access.create_topic(OperationId::new(), Path::new(raw), "never"),
                Err(AccessError::InvalidPath(_))
            ),
            "accepted or misclassified {raw:?}"
        );
    }
}
