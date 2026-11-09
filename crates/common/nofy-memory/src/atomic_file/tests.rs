use super::{AtomicWriteKillPoint, replace, replace_with_kill_point};
use std::cell::Cell;
use std::ffi::OsString;
use std::fs;
use std::io;
use std::path::{Component, Path, PathBuf};

const TEMP_NAME: &str = ".topic.md.tmp-76f5cf5c-1e60-4e82-b2a8-e1a3087bed64";
const OLD: &[u8] = b"canonical-before";
const NEW: &[u8] = b"canonical-after";
const SENTINEL: &[u8] = b"unowned-temp-sentinel";

thread_local! {
    static NEXT_TEMP_BASENAME: Cell<Option<&'static str>> = const { Cell::new(None) };
}

struct RestoreTempBasename(Option<&'static str>);

impl Drop for RestoreTempBasename {
    fn drop(&mut self) {
        NEXT_TEMP_BASENAME.with(|slot| slot.set(self.0));
    }
}

// Test-only, same-thread and one-shot: only the basename changes. The real
// public API still computes its parent, validates the target and generates UUID.
fn with_temp_basename<R>(name: &'static str, f: impl FnOnce() -> R) -> R {
    let path = Path::new(name);
    let mut components = path.components();
    assert!(!name.is_empty() && !name.contains(['/', '\\', ':']));
    assert!(matches!(components.next(), Some(Component::Normal(part)) if part == path.as_os_str()));
    assert!(components.next().is_none());
    let previous = NEXT_TEMP_BASENAME.with(|slot| slot.replace(Some(name)));
    let _restore = RestoreTempBasename(previous);
    f()
}

pub(super) fn override_temp_path(original: PathBuf) -> PathBuf {
    match NEXT_TEMP_BASENAME.with(Cell::take) {
        Some(name) => original.with_file_name(name),
        None => original,
    }
}

fn entries(parent: &Path) -> Vec<OsString> {
    let mut entries: Vec<_> = fs::read_dir(parent)
        .unwrap()
        .map(|entry| entry.unwrap().file_name())
        .collect();
    entries.sort();
    entries
}

fn assert_same_entry(before: &fs::Metadata, after: &fs::Metadata) {
    assert_eq!(before.file_type(), after.file_type());
    assert_eq!(before.len(), after.len());
    assert_eq!(before.permissions(), after.permissions());
    #[cfg(unix)]
    {
        use std::os::unix::fs::MetadataExt;
        assert_eq!((before.dev(), before.ino()), (after.dev(), after.ino()));
    }
}

fn existing_file_collision(read_only: bool) {
    let dir = tempfile::tempdir().unwrap();
    let canonical = dir.path().join("topic.md");
    let temp = dir.path().join(TEMP_NAME);
    fs::write(&canonical, OLD).unwrap();
    fs::write(&temp, SENTINEL).unwrap();
    if read_only {
        let mut permissions = fs::metadata(&temp).unwrap().permissions();
        permissions.set_readonly(true);
        fs::set_permissions(&temp, permissions).unwrap();
    }
    let canonical_location = fs::canonicalize(&canonical).unwrap();
    let canonical_before = fs::symlink_metadata(&canonical).unwrap();
    let temp_before = fs::symlink_metadata(&temp).unwrap();
    let entries_before = entries(dir.path());
    eprintln!(
        "BEFORE canonical_path={canonical:?} temp_path={temp:?} read_only={read_only} canonical={:?} temp={:?} entries={entries_before:?} canonical_entry={canonical_before:?} temp_entry={temp_before:?}",
        fs::read(&canonical),
        fs::read(&temp)
    );
    let error = with_temp_basename(TEMP_NAME, || replace(&canonical, NEW)).unwrap_err();
    eprintln!(
        "AFTER error={:?} canonical={:?} temp={:?} temp_entry={:?} entries={:?}",
        error.kind(),
        fs::read(&canonical),
        fs::read(&temp),
        fs::symlink_metadata(&temp),
        entries(dir.path())
    );
    assert_eq!(error.kind(), io::ErrorKind::AlreadyExists);
    assert_eq!(fs::read(&canonical).unwrap(), OLD);
    assert_eq!(fs::canonicalize(&canonical).unwrap(), canonical_location);
    assert_same_entry(
        &canonical_before,
        &fs::symlink_metadata(&canonical).unwrap(),
    );
    assert_eq!(entries(dir.path()), entries_before);
    assert_eq!(fs::read(&temp).unwrap(), SENTINEL);
    assert_same_entry(&temp_before, &fs::symlink_metadata(&temp).unwrap());
}

#[test]
fn existing_file_is_not_owned_when_create_new_fails() {
    existing_file_collision(false);
}

#[cfg(unix)]
#[test]
fn existing_read_only_file_is_not_owned_when_create_new_fails() {
    existing_file_collision(true);
}

#[cfg(unix)]
fn symlink_collision(dangling: bool) {
    use std::os::unix::fs::symlink;
    let dir = tempfile::tempdir().unwrap();
    let canonical = dir.path().join("topic.md");
    let target = dir.path().join("link-target");
    let temp = dir.path().join(TEMP_NAME);
    fs::write(&canonical, OLD).unwrap();
    if !dangling {
        fs::write(&target, SENTINEL).unwrap();
    }
    symlink(&target, &temp).unwrap();
    let before = fs::symlink_metadata(&temp).unwrap();
    let entries_before = entries(dir.path());
    let error = with_temp_basename(TEMP_NAME, || replace(&canonical, NEW)).unwrap_err();
    eprintln!(
        "SYMLINK dangling={dangling} error={:?} before={entries_before:?} after={:?} link={:?} target={:?}",
        error.kind(),
        entries(dir.path()),
        fs::read_link(&temp),
        fs::read(&target)
    );
    assert_eq!(error.kind(), io::ErrorKind::AlreadyExists);
    assert_eq!(fs::read(&canonical).unwrap(), OLD);
    if dangling {
        assert_eq!(
            fs::symlink_metadata(&target).unwrap_err().kind(),
            io::ErrorKind::NotFound
        );
    } else {
        assert_eq!(fs::read(&target).unwrap(), SENTINEL);
    }
    assert_eq!(entries(dir.path()), entries_before);
    assert_eq!(fs::read_link(&temp).unwrap(), target);
    assert_same_entry(&before, &fs::symlink_metadata(&temp).unwrap());
}

#[cfg(unix)]
#[test]
fn existing_symlink_is_not_owned_when_create_new_fails() {
    symlink_collision(false);
}

#[cfg(unix)]
#[test]
fn dangling_symlink_is_not_owned_when_create_new_fails() {
    symlink_collision(true);
}

#[test]
fn existing_directory_is_not_owned_when_create_new_fails() {
    let dir = tempfile::tempdir().unwrap();
    let canonical = dir.path().join("topic.md");
    let temp = dir.path().join(TEMP_NAME);
    fs::write(&canonical, OLD).unwrap();
    fs::create_dir(&temp).unwrap();
    fs::write(temp.join("sentinel"), SENTINEL).unwrap();
    let before = fs::symlink_metadata(&temp).unwrap();
    let entries_before = entries(dir.path());
    // Existing directories have platform-specific create_new errors. Compare
    // against the same filesystem operation instead of assuming a Unix errno.
    let reference_error = fs::OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(&temp)
        .unwrap_err();
    let error = with_temp_basename(TEMP_NAME, || replace(&canonical, NEW)).unwrap_err();
    assert_eq!(error.kind(), reference_error.kind());
    assert_eq!(error.raw_os_error(), reference_error.raw_os_error());
    assert_eq!(fs::read(&canonical).unwrap(), OLD);
    assert_eq!(fs::read(temp.join("sentinel")).unwrap(), SENTINEL);
    assert_eq!(entries(dir.path()), entries_before);
    assert_same_entry(&before, &fs::symlink_metadata(&temp).unwrap());
}

#[test]
fn both_kill_points_clean_only_the_newly_created_temp_file() {
    for point in [
        AtomicWriteKillPoint::TempFileSynced,
        AtomicWriteKillPoint::BeforeRename,
    ] {
        let dir = tempfile::tempdir().unwrap();
        let canonical = dir.path().join("topic.md");
        let temp = dir.path().join(TEMP_NAME);
        let unrelated = dir.path().join(".topic.md.tmp-unrelated");
        fs::write(&canonical, OLD).unwrap();
        fs::write(&unrelated, SENTINEL).unwrap();
        let before = fs::symlink_metadata(&canonical).unwrap();
        let error = with_temp_basename(TEMP_NAME, || {
            replace_with_kill_point(&canonical, NEW, Some(point))
        })
        .unwrap_err();
        assert_eq!(error.kind(), io::ErrorKind::Interrupted);
        assert_eq!(
            fs::symlink_metadata(&temp).unwrap_err().kind(),
            io::ErrorKind::NotFound
        );
        assert_eq!(fs::read(&canonical).unwrap(), OLD);
        assert_eq!(fs::read(&unrelated).unwrap(), SENTINEL);
        assert_same_entry(&before, &fs::symlink_metadata(&canonical).unwrap());
        assert_eq!(entries(dir.path()).len(), 2);
    }
}

#[test]
fn rename_failure_cleans_the_newly_created_temp_file() {
    let dir = tempfile::tempdir().unwrap();
    let canonical = dir.path().join("topic.md");
    let temp = dir.path().join(TEMP_NAME);
    fs::create_dir(&canonical).unwrap();
    fs::write(canonical.join("sentinel"), SENTINEL).unwrap();
    let error = with_temp_basename(TEMP_NAME, || replace(&canonical, NEW)).unwrap_err();
    eprintln!("RENAME error={error:?}");
    assert_eq!(
        fs::symlink_metadata(&temp).unwrap_err().kind(),
        io::ErrorKind::NotFound
    );
    assert_eq!(fs::read(canonical.join("sentinel")).unwrap(), SENTINEL);
    assert_eq!(entries(dir.path()), vec![OsString::from("topic.md")]);
}

#[test]
fn successful_public_replace_preserves_unrelated_temp_files() {
    for preexisting in [false, true] {
        let dir = tempfile::tempdir().unwrap();
        let canonical = dir.path().join("topic.md");
        let unrelated = dir.path().join(TEMP_NAME);
        if preexisting {
            fs::write(&canonical, OLD).unwrap();
        }
        fs::write(&unrelated, SENTINEL).unwrap();
        replace(&canonical, NEW).unwrap();
        assert_eq!(fs::read(&canonical).unwrap(), NEW);
        assert_eq!(fs::read(&unrelated).unwrap(), SENTINEL);
        assert_eq!(entries(dir.path()).len(), 2);
    }
}

#[cfg(unix)]
#[test]
fn successful_public_replace_preserves_existing_permissions() {
    use std::os::unix::fs::PermissionsExt;
    let dir = tempfile::tempdir().unwrap();
    let canonical = dir.path().join("topic.md");
    fs::write(&canonical, OLD).unwrap();
    fs::set_permissions(&canonical, fs::Permissions::from_mode(0o640)).unwrap();
    replace(&canonical, NEW).unwrap();
    assert_eq!(fs::read(&canonical).unwrap(), NEW);
    assert_eq!(
        fs::metadata(&canonical).unwrap().permissions().mode() & 0o777,
        0o640
    );
    assert_eq!(entries(dir.path()), vec![OsString::from("topic.md")]);
}

#[test]
fn basename_override_is_one_shot_and_restores_nested_scopes() {
    let dir = tempfile::tempdir().unwrap();
    let original = dir.path().join("generated");
    with_temp_basename("outer", || {
        with_temp_basename("inner", || {
            assert_eq!(
                override_temp_path(original.clone()),
                dir.path().join("inner")
            );
            assert_eq!(override_temp_path(original.clone()), original);
        });
        assert_eq!(
            override_temp_path(original.clone()),
            dir.path().join("outer")
        );
        assert_eq!(override_temp_path(original.clone()), original);
    });
    assert_eq!(override_temp_path(original.clone()), original);
    with_temp_basename("unused", || {});
    assert_eq!(override_temp_path(original.clone()), original);
}

#[test]
fn basename_override_restores_after_panic() {
    let dir = tempfile::tempdir().unwrap();
    let original = dir.path().join("generated");
    with_temp_basename("outer", || {
        let result = std::panic::catch_unwind(|| {
            with_temp_basename("inner", || panic!("controlled scope panic"));
        });
        assert!(result.is_err());
        assert_eq!(
            override_temp_path(original.clone()),
            dir.path().join("outer")
        );
    });
    assert_eq!(override_temp_path(original.clone()), original);
}

#[test]
fn basename_override_rejects_paths_without_leaking_state() {
    let dir = tempfile::tempdir().unwrap();
    let original = dir.path().join("generated");
    for name in [
        "", ".", "..", "a/", "a/.", "../a", "/a", r"a\b", "C:a", r"C:\a",
    ] {
        assert!(
            std::panic::catch_unwind(|| with_temp_basename(name, || ())).is_err(),
            "{name:?}"
        );
        assert_eq!(override_temp_path(original.clone()), original);
    }
}

#[test]
fn basename_override_is_thread_local_for_public_calls() {
    use std::sync::{Arc, Barrier};
    let barrier = Arc::new(Barrier::new(2));
    let handles: Vec<_> = [".topic.md.tmp-thread-a", ".topic.md.tmp-thread-b"]
        .into_iter()
        .map(|name| {
            let barrier = barrier.clone();
            std::thread::spawn(move || {
                let dir = tempfile::tempdir().unwrap();
                let canonical = dir.path().join("topic.md");
                let other_name = if name.ends_with('a') {
                    ".topic.md.tmp-thread-b"
                } else {
                    ".topic.md.tmp-thread-a"
                };
                let unrelated = dir.path().join(other_name);
                fs::write(&canonical, OLD).unwrap();
                fs::write(&unrelated, SENTINEL).unwrap();
                let error = with_temp_basename(name, || {
                    barrier.wait();
                    replace_with_kill_point(
                        &canonical,
                        NEW,
                        Some(AtomicWriteKillPoint::BeforeRename),
                    )
                })
                .unwrap_err();
                assert_eq!(error.kind(), io::ErrorKind::Interrupted);
                assert!(!dir.path().join(name).exists());
                assert_eq!(fs::read(&canonical).unwrap(), OLD);
                assert_eq!(fs::read(&unrelated).unwrap(), SENTINEL);
            })
        })
        .collect();
    for handle in handles {
        handle.join().unwrap();
    }
}
