//! Physical path safety. These tests do not certify SDK logical identity.
use nofy_sqlite_journal::JournalMode;
use std::path::Path;
#[cfg(unix)]
use std::{collections::BTreeMap, ffi::OsString, path::PathBuf};

#[cfg(unix)]
fn snapshot(dir: &Path) -> BTreeMap<OsString, Vec<u8>> {
    std::fs::read_dir(dir)
        .unwrap()
        .map(|entry| {
            let entry = entry.unwrap();
            (entry.file_name(), std::fs::read(entry.path()).unwrap())
        })
        .collect()
}
fn write_marker(mode: JournalMode, path: &Path, value: i64) {
    let db = mode.open(path).unwrap();
    db.execute_batch("CREATE TABLE marker(value INTEGER NOT NULL)")
        .unwrap();
    db.execute("INSERT INTO marker VALUES (?1)", [value])
        .unwrap();
}
fn read_marker(mode: JournalMode, path: &Path) -> i64 {
    mode.open_readonly(path)
        .unwrap()
        .query_row("SELECT value FROM marker", [], |r| r.get(0))
        .unwrap()
}

#[test]
fn unicode_layout_and_reopen_match_legacy_mapping() {
    let root = tempfile::tempdir().unwrap();
    for (index, name) in [
        "state.db",
        "中文-😀.db",
        "state",
        ".hidden",
        "state.backup.db",
    ]
    .into_iter()
    .enumerate()
    {
        let path = root.path().join(name);
        let resolved = JournalMode::Truncate.effective_db_path(&path);
        assert_eq!(JournalMode::Truncate.effective_db_path(&resolved), resolved);
        println!("LAYOUT {name:?} -> {:?}", resolved.file_name().unwrap());
        write_marker(JournalMode::Truncate, &path, index as i64);
        assert_eq!(read_marker(JournalMode::Truncate, &path), index as i64);
        assert_eq!(read_marker(JournalMode::Truncate, &resolved), index as i64);
        let db = JournalMode::Truncate.open(&resolved).unwrap();
        db.execute("UPDATE marker SET value = value + 10", [])
            .unwrap();
        drop(db);
        assert_eq!(read_marker(JournalMode::Truncate, &path), index as i64 + 10);
        assert_eq!(JournalMode::Wal.effective_db_path(&path), path);
    }
}

#[cfg(unix)]
fn raw_path(dir: &Path, byte: u8) -> PathBuf {
    use std::os::unix::ffi::OsStringExt;
    dir.join(OsString::from_vec(vec![
        b's', b't', b'a', b't', b'e', b'-', byte, b'.', b'd', b'b',
    ]))
}
#[cfg(unix)]
fn assert_invalid<T>(result: rusqlite::Result<T>, path: &Path) {
    assert!(
        matches!(result, Err(rusqlite::Error::InvalidPath(ref rejected)) if rejected == path),
        "a lossy basename must return InvalidPath before opening {path:?}"
    );
}

#[cfg(unix)]
#[test]
fn truncate_rejects_distinct_native_basenames_without_creating_files() {
    let root = tempfile::tempdir().unwrap();
    let first = raw_path(root.path(), 0xff);
    let second = raw_path(root.path(), 0xfe);
    assert_ne!(first, second);
    let legacy = JournalMode::Truncate.effective_db_path(&first);
    assert_ne!(legacy, first, "this test requires a hostname");
    assert_eq!(legacy, JournalMode::Truncate.effective_db_path(&second));
    for path in [&first, &second] {
        assert_invalid(JournalMode::Truncate.open(path), path);
        assert_invalid(JournalMode::Truncate.open_readonly(path), path);
        assert_invalid(
            JournalMode::Truncate.open_readonly_until(path, std::time::Instant::now()),
            path,
        );
    }
    assert!(snapshot(root.path()).is_empty());
}

#[cfg(unix)]
#[test]
fn truncate_rejection_leaves_legacy_database_and_sidecars_byte_identical() {
    let root = tempfile::tempdir().unwrap();
    let first = raw_path(root.path(), 0xff);
    let second = raw_path(root.path(), 0xfe);
    let legacy = JournalMode::Truncate.effective_db_path(&first);
    assert_ne!(legacy, first, "this test requires a hostname");
    write_marker(JournalMode::Truncate, &legacy, 73);
    assert_eq!(read_marker(JournalMode::Truncate, &legacy), 73);
    // Keep old data and all plausible sidecar names. No probe may touch them.
    for suffix in ["-wal", "-shm", "-journal", ".admission", ".placement"] {
        let mut sidecar = legacy.as_os_str().to_owned();
        sidecar.push(suffix);
        std::fs::write(PathBuf::from(sidecar), format!("legacy sidecar {suffix}")).unwrap();
    }
    let before = snapshot(root.path());
    for path in [&first, &second] {
        assert_invalid(JournalMode::Truncate.open(path), path);
        assert_invalid(JournalMode::Truncate.open_readonly(path), path);
        assert_invalid(
            JournalMode::Truncate.open_readonly_until(path, std::time::Instant::now()),
            path,
        );
        assert_eq!(snapshot(root.path()), before);
    }
}

#[cfg(unix)]
#[test]
fn wal_keeps_distinct_native_paths_and_data() {
    let root = tempfile::tempdir().unwrap();
    let first = raw_path(root.path(), 0xff);
    let second = raw_path(root.path(), 0xfe);
    for (path, value) in [(&first, 11), (&second, 22)] {
        assert_eq!(JournalMode::Wal.effective_db_path(path), *path);
        write_marker(JournalMode::Wal, path, value);
        assert!(path.exists());
    }
    assert_eq!(read_marker(JournalMode::Wal, &first), 11);
    assert_eq!(read_marker(JournalMode::Wal, &second), 22);
}

#[cfg(unix)]
#[test]
fn truncate_preserves_native_parent_and_already_resolved_basename() {
    use std::os::unix::ffi::{OsStrExt, OsStringExt};
    let root = tempfile::tempdir().unwrap();
    let parent = root
        .path()
        .join(OsString::from_vec(b"parent-\xff".to_vec()));
    std::fs::create_dir(&parent).unwrap();
    let ordinary = parent.join("state.db");
    let resolved = JournalMode::Truncate.effective_db_path(&ordinary);
    assert_eq!(resolved.parent(), Some(parent.as_path()));
    write_marker(JournalMode::Truncate, &ordinary, 31);
    assert_eq!(read_marker(JournalMode::Truncate, &ordinary), 31);

    let mut bytes = vec![0xff];
    bytes.extend_from_slice(resolved.file_name().unwrap().as_bytes());
    let native_resolved = parent.join(OsString::from_vec(bytes));
    assert_eq!(
        JournalMode::Truncate.effective_db_path(&native_resolved),
        native_resolved
    );
    write_marker(JournalMode::Truncate, &native_resolved, 42);
    assert_eq!(read_marker(JournalMode::Truncate, &native_resolved), 42);
}
