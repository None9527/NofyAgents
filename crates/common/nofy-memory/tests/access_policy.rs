use std::path::Path;

use nofy_memory::access::{AccessKillPoint, MemoryAccess};
use nofy_memory::layout::UnifiedMemoryLayout;
use nofy_memory::model::{ContentHash, OperationId};

fn hash(content: &str) -> ContentHash {
    ContentHash::parse(blake3::hash(content.as_bytes()).to_hex().to_string()).unwrap()
}

fn setup() -> (
    tempfile::TempDir,
    nofy_memory::layout::ScopeLayout,
    MemoryAccess,
) {
    let temp = tempfile::tempdir().unwrap();
    let layout = UnifiedMemoryLayout::new(temp.path());
    let scope = layout.personal_scope();
    let access = MemoryAccess::open(layout.meta_database(), scope.clone()).unwrap();
    (temp, scope, access)
}

#[test]
fn rejects_traversal_absolute_and_protected_internal_paths() {
    let (_temp, _scope, access) = setup();
    for path in [
        Path::new("../escape.md"),
        Path::new("/tmp/escape.md"),
        Path::new("state.sqlite"),
        Path::new("manifest.json"),
        Path::new("observations/immutable.md"),
    ] {
        assert!(
            access.validate_write_path(path).is_err(),
            "accepted {path:?}"
        );
    }
}

#[cfg(unix)]
#[test]
fn rejects_symlink_escape_even_when_lexically_inside_scope() {
    use std::os::unix::fs::symlink;

    let (temp, scope, access) = setup();
    let outside = temp.path().join("outside");
    std::fs::create_dir_all(&outside).unwrap();
    symlink(&outside, scope.topics_directory().join("linked")).unwrap();
    assert!(
        access
            .validate_write_path(Path::new("topics/linked/escape.md"))
            .is_err()
    );
}

#[test]
fn topic_update_requires_the_hash_that_was_read() {
    let (_temp, scope, access) = setup();
    let path = scope.topics_directory().join("preferences.md");
    std::fs::write(&path, "old").unwrap();

    assert!(
        access
            .update_topic(
                OperationId::new(),
                Path::new("preferences.md"),
                &hash("stale"),
                "new",
                None,
            )
            .is_err()
    );
    assert_eq!(std::fs::read_to_string(&path).unwrap(), "old");

    access
        .update_topic(
            OperationId::new(),
            Path::new("preferences.md"),
            &hash("old"),
            "new",
            None,
        )
        .unwrap();
    assert_eq!(std::fs::read_to_string(&path).unwrap(), "new");
    let manifest = std::fs::read_to_string(scope.manifest_file()).unwrap();
    assert!(manifest.contains("topics/preferences.md"));
    assert!(manifest.contains(hash("new").as_str()));
}

#[test]
fn rename_failure_rolls_back_canonical_file_and_manifest() {
    let (_temp, scope, access) = setup();
    let old = scope.topics_directory().join("old.md");
    std::fs::write(&old, "content").unwrap();
    access.rebuild_manifest().unwrap();
    let manifest_before = std::fs::read(scope.manifest_file()).unwrap();

    for point in [
        AccessKillPoint::AfterCanonicalBeforeManifest,
        AccessKillPoint::AfterManifestBeforeLedger,
    ] {
        assert!(
            access
                .rename_topic(
                    OperationId::new(),
                    Path::new("old.md"),
                    Path::new("new.md"),
                    &hash("content"),
                    Some(point),
                )
                .is_err()
        );
        assert!(old.exists());
        assert!(!scope.topics_directory().join("new.md").exists());
        assert_eq!(
            std::fs::read(scope.manifest_file()).unwrap(),
            manifest_before
        );
    }
}

#[test]
fn rename_and_delete_keep_manifest_and_ledger_consistent() {
    let (_temp, scope, access) = setup();
    let old = scope.topics_directory().join("old.md");
    std::fs::write(&old, "content").unwrap();
    access.rebuild_manifest().unwrap();

    access
        .rename_topic(
            OperationId::new(),
            Path::new("old.md"),
            Path::new("new.md"),
            &hash("content"),
            None,
        )
        .unwrap();
    let renamed = scope.topics_directory().join("new.md");
    assert!(renamed.exists());
    let manifest = std::fs::read_to_string(scope.manifest_file()).unwrap();
    assert!(!manifest.contains("topics/old.md"));
    assert!(manifest.contains("topics/new.md"));

    access
        .delete_topic(
            OperationId::new(),
            Path::new("new.md"),
            &hash("content"),
            None,
        )
        .unwrap();
    assert!(!renamed.exists());
    let manifest = std::fs::read_to_string(scope.manifest_file()).unwrap();
    assert!(!manifest.contains("topics/new.md"));
}
