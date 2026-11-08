#![cfg(all(feature = "sqlite", unix))]
//! Exercises the public SDK with a process-local journal override. This covers
//! physical paths only; native-path logical identity remains a separate concern.
use nofy_agent_runtime::{
    Checkpoint, Checkpointer, Error, RunState,
    admission::{CommitAdmission, CommitPermit},
    durable::{
        SqliteStore,
        placement::{PlacementPermit, SqlitePlacement},
    },
    registry::ModuleDefinition,
};
use nofy_sqlite_journal::JournalMode;
use std::{
    collections::BTreeMap,
    ffi::OsString,
    os::unix::ffi::{OsStrExt, OsStringExt},
    path::{Path, PathBuf},
    sync::{
        Arc,
        atomic::{AtomicUsize, Ordering},
    },
};

fn subprocess(mode: &str, test: &str, body: fn()) {
    if std::env::var("NOFY_SQLITE_PATH_TEST_CHILD").as_deref() == Ok(mode) {
        assert_eq!(std::env::var("NOFY_SQLITE_JOURNAL_MODE").unwrap(), mode);
        body();
        println!("SDK_PATH_CHILD_COMPLETE:{mode}");
        return;
    }
    let output = std::process::Command::new(std::env::current_exe().unwrap())
        .args(["--exact", test, "--nocapture"])
        .env("NOFY_SQLITE_JOURNAL_MODE", mode)
        .env("NOFY_SQLITE_PATH_TEST_CHILD", mode)
        .output()
        .unwrap();
    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);
    println!("{stdout}");
    assert!(
        output.status.success(),
        "child status {:?}\n{stdout}\n{stderr}",
        output.status
    );
    assert!(stdout.contains(&format!("SDK_PATH_CHILD_COMPLETE:{mode}")));
}
fn native(dir: &Path, byte: u8) -> PathBuf {
    dir.join(OsString::from_vec(vec![
        b's', b't', b'a', b't', b'e', b'-', byte, b'.', b'd', b'b',
    ]))
}
fn snapshot(dir: &Path) -> BTreeMap<OsString, Vec<u8>> {
    std::fs::read_dir(dir)
        .unwrap()
        .map(|entry| {
            let entry = entry.unwrap();
            (entry.file_name(), std::fs::read(entry.path()).unwrap())
        })
        .collect()
}
#[derive(Default)]
struct Counts {
    entered: AtomicUsize,
    dropped: AtomicUsize,
}
struct Policy {
    counts: Arc<Counts>,
    deny: bool,
}
struct Permit(Arc<Counts>);
impl Drop for Permit {
    fn drop(&mut self) {
        self.0.dropped.fetch_add(1, Ordering::SeqCst);
    }
}
impl CommitPermit for Permit {
    fn validate(&self, _: &str, _: &[&ModuleDefinition]) -> Result<(), Error> {
        Ok(())
    }
}
impl CommitAdmission for Policy {
    fn identity(&self) -> &str {
        "path-test"
    }
    fn enter(&self) -> Result<Box<dyn CommitPermit>, Error> {
        self.counts.entered.fetch_add(1, Ordering::SeqCst);
        if self.deny {
            return Err(Error::Checkpoint("admission rejected first".into()));
        }
        Ok(Box::new(Permit(self.counts.clone())))
    }
}
struct Placement(Arc<AtomicUsize>);
impl SqlitePlacement for Placement {
    fn authority(&self) -> &str {
        "path-test"
    }
    fn logical_identity(&self) -> &str {
        "path-test"
    }
    fn acquire(&self) -> Result<PlacementPermit, Error> {
        self.0.fetch_add(1, Ordering::SeqCst);
        Err(Error::Checkpoint("placement must not be acquired".into()))
    }
}
fn invalid(result: Result<SqliteStore, Error>) {
    let error = result.err().expect("lossy path must fail closed");
    assert!(
        matches!(error, Error::Checkpoint(ref message) if message.contains("Invalid path:")),
        "unexpected error: {error}"
    );
}
fn save_and_reopen(path: &Path, composition: &str) {
    let rt = tokio::runtime::Builder::new_current_thread()
        .build()
        .unwrap();
    let store = SqliteStore::open(path).unwrap();
    rt.block_on(store.save(
        "path",
        None,
        Checkpoint {
            version: 1,
            revision: 1,
            composition: composition.into(),
            state: RunState::default(),
        },
    ))
    .unwrap();
    drop(store);
    let reopened = SqliteStore::open(path).unwrap();
    assert_eq!(
        rt.block_on(reopened.load("path"))
            .unwrap()
            .unwrap()
            .revision,
        1
    );
}

#[test]
fn truncate_rejects_before_storage_side_effects() {
    subprocess(
        "truncate",
        "truncate_rejects_before_storage_side_effects",
        truncate_checks,
    );
}
fn truncate_checks() {
    let root = tempfile::tempdir().unwrap();
    let missing = root.path().join("not-created");
    let counts = Arc::new(Counts::default());
    let allow = Arc::new(Policy {
        counts: counts.clone(),
        deny: false,
    });
    let first = native(&missing, 0xff);
    assert_ne!(
        JournalMode::Truncate.effective_db_path(&first),
        first,
        "requires hostname"
    );
    for byte in [0xff, 0xfe] {
        invalid(SqliteStore::open_with_admission(
            &native(&missing, byte),
            allow.clone(),
        ));
    }
    assert!(!missing.exists(), "reject before mkdir, DB or markers");
    assert_eq!(counts.entered.load(Ordering::SeqCst), 2);
    assert_eq!(counts.dropped.load(Ordering::SeqCst), 2);
    let acquired = Arc::new(AtomicUsize::new(0));
    invalid(SqliteStore::open_placed(
        &first,
        Arc::new(Placement(acquired.clone())),
        Some(allow.clone()),
    ));
    assert_eq!(acquired.load(Ordering::SeqCst), 0);
    assert_eq!(counts.entered.load(Ordering::SeqCst), 3);
    assert_eq!(counts.dropped.load(Ordering::SeqCst), 3);
    let deny = Arc::new(Policy {
        counts: counts.clone(),
        deny: true,
    });
    let error = SqliteStore::open_with_admission(&first, deny.clone())
        .err()
        .unwrap();
    assert!(error.to_string().contains("admission rejected first"));
    let relative = native(Path::new("relative"), 0xff);
    let error = SqliteStore::open_with_admission(&relative, deny)
        .err()
        .unwrap();
    assert!(error.to_string().contains("admission rejected first"));
    let error = SqliteStore::open_with_admission(&relative, allow.clone())
        .err()
        .unwrap();
    assert!(error.to_string().contains("explicit absolute SQLite path"));
    assert_eq!(counts.entered.load(Ordering::SeqCst), 6);
    assert_eq!(counts.dropped.load(Ordering::SeqCst), 4);
    assert!(std::fs::read_dir(root.path()).unwrap().next().is_none());
    println!("SDK_REJECTS_BEFORE_MKDIR_DB_MARKERS_PLACEMENT; ADMISSION_ORDER_AND_DROP_PASS");

    let existing = root.path().join("existing");
    std::fs::create_dir(&existing).unwrap();
    let raw = native(&existing, 0xff);
    let legacy = JournalMode::Truncate.effective_db_path(&raw);
    let db = SqliteStore::open_with_admission(&legacy, allow.clone()).unwrap();
    drop(db);
    for suffix in ["-wal", "-shm", "-journal", ".placement"] {
        let mut p = legacy.as_os_str().to_owned();
        p.push(suffix);
        std::fs::write(PathBuf::from(p), format!("preserved legacy {suffix}")).unwrap();
    }
    let before = snapshot(&existing);
    for byte in [0xff, 0xfe] {
        invalid(SqliteStore::open_with_admission(
            &native(&existing, byte),
            allow.clone(),
        ));
        assert_eq!(snapshot(&existing), before);
    }
    println!("SDK_LEGACY_DB_AND_SIDECARS_UNCHANGED");

    let parent = root
        .path()
        .join(OsString::from_vec(b"parent-\xff".to_vec()));
    std::fs::create_dir(&parent).unwrap();
    let path = parent.join("中文-😀.db");
    save_and_reopen(&path, "native-parent");
    let effective = JournalMode::Truncate.effective_db_path(&path);
    assert_eq!(effective.parent(), Some(parent.as_path()));
    let mut bytes = vec![0xfe];
    bytes.extend_from_slice(effective.file_name().unwrap().as_bytes());
    let presuffixed = parent.join(OsString::from_vec(bytes));
    assert_eq!(
        JournalMode::Truncate.effective_db_path(&presuffixed),
        presuffixed
    );
    save_and_reopen(&presuffixed, "native-presuffixed");
    assert!(presuffixed.exists());
    println!("SDK_NATIVE_PARENT_AND_PRESUFFIXED_NATIVE_BASENAME_REOPEN_PASS");
}

#[test]
fn wal_native_physical_paths_reopen_independently() {
    subprocess(
        "wal",
        "wal_native_physical_paths_reopen_independently",
        wal_checks,
    );
}
fn wal_checks() {
    let root = tempfile::tempdir().unwrap();
    for byte in [0xff, 0xfe] {
        let path = native(root.path(), byte);
        assert_eq!(JournalMode::for_db_path(&path), JournalMode::Wal);
        save_and_reopen(&path, &format!("physical-{byte}"));
        assert!(path.exists());
    }
    let rt = tokio::runtime::Builder::new_current_thread()
        .build()
        .unwrap();
    for byte in [0xff, 0xfe] {
        let store = SqliteStore::open(&native(root.path(), byte)).unwrap();
        let checkpoint = rt.block_on(store.load("path")).unwrap().unwrap();
        assert_eq!(checkpoint.composition, format!("physical-{byte}"));
    }
    println!("SDK_WAL_DISTINCT_PHYSICAL_PATHS_PASS; LOGICAL_IDENTITY_NOT_CERTIFIED");
}
