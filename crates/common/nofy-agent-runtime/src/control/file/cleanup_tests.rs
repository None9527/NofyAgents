// Controlled fixtures only: no pathname replacement after creation.

use std::{
    cell::Cell,
    path::{Path, PathBuf},
};
thread_local! {
    static OVERRIDE: Cell<bool> = const { Cell::new(false) };
    static INSPECT_CLEANUP: Cell<bool> = const { Cell::new(false) };
}
const TEMP_NAME: &str = ".nofy-catalog-controlled.tmp";

pub(super) fn temporary_path(original: PathBuf) -> PathBuf {
    if !OVERRIDE.replace(false) {
        return original;
    }
    // A fixed basename cannot redirect the operation outside its original parent.
    let temporary = original.with_file_name(TEMP_NAME);
    assert_eq!(temporary.parent(), original.parent());
    temporary
}

pub(super) fn before_cleanup(temporary: &Path) {
    if !INSPECT_CLEANUP.replace(false) {
        return;
    }
    assert!(
        temporary.is_file(),
        "the successful create must precede cleanup"
    );
    #[cfg(target_os = "linux")]
    for entry in std::fs::read_dir("/proc/self/fd").unwrap() {
        if let Ok(path) = std::fs::read_link(entry.unwrap().path()) {
            assert_ne!(path, temporary, "File must close before pathname cleanup");
        }
    }
}

fn with_temporary(inspect_cleanup: bool, f: impl FnOnce()) {
    struct Reset;
    impl Drop for Reset {
        fn drop(&mut self) {
            OVERRIDE.set(false);
            INSPECT_CLEANUP.set(false);
        }
    }
    assert!(!OVERRIDE.get());
    assert!(!INSPECT_CLEANUP.get());
    let _reset = Reset;
    OVERRIDE.set(true);
    INSPECT_CLEANUP.set(inspect_cleanup);
    f();
    assert!(!OVERRIDE.get(), "temporary override must be consumed");
    assert!(!INSPECT_CLEANUP.get(), "cleanup observer must run");
}

#[test]
fn temporary_override_is_one_shot_and_restored_after_unwind() {
    let dir = tempfile::tempdir().unwrap();
    let original = dir.path().join("original.tmp");
    with_temporary(false, || {
        assert_eq!(temporary_path(original.clone()), dir.path().join(TEMP_NAME));
        assert_eq!(temporary_path(original.clone()), original);
    });
    assert!(std::panic::catch_unwind(|| with_temporary(false, || panic!("fixture"))).is_err());
    assert_eq!(temporary_path(original.clone()), original);
}

#[test]
fn temporary_override_is_thread_local() {
    let dir = tempfile::tempdir().unwrap();
    let original = dir.path().join("original.tmp");
    with_temporary(false, || {
        let other = original.clone();
        std::thread::spawn(move || assert_eq!(temporary_path(other.clone()), other))
            .join()
            .unwrap();
        assert_eq!(temporary_path(original.clone()), dir.path().join(TEMP_NAME));
    });
}

#[cfg(unix)]
fn assert_private(path: &Path) {
    use std::os::unix::fs::PermissionsExt;
    assert_eq!(
        std::fs::metadata(path).unwrap().permissions().mode() & 0o777,
        0o600
    );
}

use super::*;
fn view() -> CatalogView {
    CatalogView {
        revision: 1,
        data: CatalogData::default(),
    }
}
#[test]
fn create_new_failure_preserves_existing_temporary() {
    let dir = tempfile::tempdir().unwrap();
    let store = FileCatalogStore::open(dir.path().join("catalog.json")).unwrap();
    let temporary = dir.path().join(TEMP_NAME);
    std::fs::write(&temporary, b"preexisting fixture").unwrap();
    with_temporary(false, || {
        assert!(matches!(
            store.write(&view()),
            Err(ControlError::Storage(_))
        ));
    });
    assert_eq!(std::fs::read(temporary).unwrap(), b"preexisting fixture");
    assert!(!store.path().exists());
}
#[test]
fn created_temporary_is_closed_then_removed_after_replace_failure() {
    let dir = tempfile::tempdir().unwrap();
    let destination = dir.path().join("catalog.json");
    std::fs::create_dir(&destination).unwrap();
    let store = FileCatalogStore::open(&destination).unwrap();
    with_temporary(true, || {
        assert!(matches!(
            store.write(&view()),
            Err(ControlError::Storage(_))
        ));
    });
    assert!(!dir.path().join(TEMP_NAME).exists());
    assert!(destination.is_dir());
}
#[test]
fn successful_write_preserves_content_and_cleans_temporary() {
    let dir = tempfile::tempdir().unwrap();
    let store = FileCatalogStore::open(dir.path().join("catalog.json")).unwrap();
    with_temporary(false, || store.write(&view()).unwrap());
    assert!(!dir.path().join(TEMP_NAME).exists());
    assert_eq!(store.read().unwrap().unwrap().revision, 1);
    #[cfg(unix)]
    assert_private(store.path());
}
