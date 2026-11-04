use std::collections::{BTreeMap, HashMap};
use std::path::{Path, PathBuf};
use std::sync::Mutex;

use nofy_memory::migration::{
    BackupDecision, MigrationKillPoint, MigrationPhase, MigrationRequest, MigrationStatus, migrate,
};
use nofy_memory::migration_backup::{MigrationKeyStore, forget_legacy_backup};
use nofy_memory::model::ProjectId;

const USER: &str = include_str!("fixtures/legacy-memory/USER.md");
const GLOBAL: &str = include_str!("fixtures/legacy-memory/MEMORY.md");
const ROOTS: &str = include_str!("fixtures/legacy-memory/roots.json");

#[derive(Default)]
struct FakeKeyStore {
    values: Mutex<HashMap<String, String>>,
    events: Mutex<Vec<String>>,
    available: bool,
    fail_delete: bool,
}

impl FakeKeyStore {
    fn available() -> Self {
        Self {
            available: true,
            ..Self::default()
        }
    }
}

impl MigrationKeyStore for FakeKeyStore {
    fn store(&self, key_id: &str, secret: &str) -> Result<(), String> {
        if !self.available {
            return Err("credential store unavailable".to_owned());
        }
        self.events.lock().unwrap().push(format!("store:{key_id}"));
        self.values
            .lock()
            .unwrap()
            .insert(key_id.to_owned(), secret.to_owned());
        Ok(())
    }

    fn delete(&self, key_id: &str) -> Result<(), String> {
        self.events.lock().unwrap().push(format!("delete:{key_id}"));
        if self.fail_delete {
            return Err("delete failed".to_owned());
        }
        self.values.lock().unwrap().remove(key_id);
        Ok(())
    }
}

fn legacy_fixture(parent: &Path) -> (PathBuf, ProjectId) {
    let legacy = parent.join("memory");
    std::fs::create_dir_all(legacy.join("workspace-a/sessions")).unwrap();
    std::fs::write(legacy.join("USER.md"), USER).unwrap();
    std::fs::write(legacy.join("MEMORY.md"), GLOBAL).unwrap();
    std::fs::write(legacy.join("roots.json"), ROOTS).unwrap();
    std::fs::write(
        legacy.join("workspace-a/MEMORY.md"),
        "# Workspace Memory\n\n## Build\n\nUse cargo nextest in CI.\n",
    )
    .unwrap();
    std::fs::write(
        legacy.join("workspace-a/sessions/2026-09-19-session.md"),
        "## Session\n\nResolved the SQLite locking issue.\n",
    )
    .unwrap();
    (legacy, ProjectId::new())
}

fn request(legacy: PathBuf, project: ProjectId) -> MigrationRequest {
    MigrationRequest {
        legacy_memory_dir: legacy,
        project_registry: BTreeMap::from([("workspace-a".to_owned(), project)]),
        current_project: Some(project),
        backup_decision: BackupDecision::ContinueWithoutBackup,
        kill_point: None,
    }
}

fn tree_digest(root: &Path) -> String {
    fn walk(root: &Path, current: &Path, bytes: &mut Vec<u8>) {
        let mut entries: Vec<_> = std::fs::read_dir(current)
            .unwrap()
            .map(Result::unwrap)
            .collect();
        entries.sort_by_key(|entry| entry.file_name());
        for entry in entries {
            let path = entry.path();
            let relative = path.strip_prefix(root).unwrap().to_string_lossy();
            bytes.extend_from_slice(relative.as_bytes());
            if path.is_dir() {
                walk(root, &path, bytes);
            } else {
                bytes.extend_from_slice(&std::fs::read(path).unwrap());
            }
        }
    }
    let mut bytes = Vec::new();
    walk(root, root, &mut bytes);
    blake3::hash(&bytes).to_hex().to_string()
}

#[test]
fn staging_import_is_idempotent_and_never_mutates_source_before_switch() {
    let temp = tempfile::tempdir().unwrap();
    let (legacy, project) = legacy_fixture(temp.path());
    let before = tree_digest(&legacy);
    let store = FakeKeyStore::available();
    let mut phases = Vec::new();
    let mut req = request(legacy.clone(), project);
    req.kill_point = Some(MigrationKillPoint::BeforeSwitch);

    assert!(migrate(&req, &store, |progress| phases.push(progress.phase)).is_err());
    assert_eq!(tree_digest(&legacy), before);
    assert_eq!(
        phases,
        vec![
            MigrationPhase::Scanning,
            MigrationPhase::Importing,
            MigrationPhase::Validating,
            MigrationPhase::Switching,
        ]
    );

    req.kill_point = None;
    let outcome = migrate(&req, &store, |_| {}).unwrap();
    assert_eq!(outcome.status, MigrationStatus::Activated);
    assert_eq!(
        outcome.report.imported_idempotency_keys.len(),
        outcome.report.imported_objects
    );
}

#[test]
fn imports_two_scopes_defers_knowledge_sources_and_creates_encrypted_backup() {
    let temp = tempfile::tempdir().unwrap();
    let (legacy, project) = legacy_fixture(temp.path());
    let store = FakeKeyStore::available();
    let mut req = request(legacy.clone(), project);
    req.backup_decision = BackupDecision::RequireEncryptedBackup;

    let outcome = migrate(&req, &store, |_| {}).unwrap();
    assert_eq!(outcome.status, MigrationStatus::Activated);
    assert!(legacy.join(".unified-memory-v1").is_file());
    assert!(legacy.join("personal/topics/about-me.md").is_file());
    assert!(
        std::fs::read_to_string(legacy.join("personal/topics/about-me.md"))
            .unwrap()
            .contains("origin=user; pinned=true")
    );
    assert!(legacy.join("personal/topics/preferences.md").is_file());
    assert!(legacy.join("personal/topics/migration-review.md").is_file());
    assert!(
        legacy
            .join(format!(
                "projects/{}/topics/legacy-memory.md",
                project.as_uuid()
            ))
            .is_file()
    );
    assert!(
        std::fs::read_to_string(legacy.join(format!(
            "projects/{}/topics/legacy-memory.md",
            project.as_uuid()
        )))
        .unwrap()
        .contains("origin=curator; pinned=false")
    );
    assert!(
        legacy
            .join(format!("projects/{}/observations", project.as_uuid()))
            .read_dir()
            .unwrap()
            .next()
            .is_some()
    );
    assert!(!legacy.join("global").exists());
    assert_eq!(outcome.report.deferred_knowledge_sources.len(), 2);
    let backup = outcome.backup.expect("encrypted backup");
    assert!(backup.path.is_file());
    assert_eq!(
        backup.path.extension().and_then(|ext| ext.to_str()),
        Some("age")
    );
    assert!(store.values.lock().unwrap().contains_key(&backup.key_id));
    assert!(!temp.path().join(format!("{}.key", backup.key_id)).exists());
    let secret = store.values.lock().unwrap()[&backup.key_id].clone();
    let identity: age::x25519::Identity = secret.parse().unwrap();
    let plaintext = age::decrypt(&identity, &std::fs::read(&backup.path).unwrap()).unwrap();
    let archived_paths: Vec<_> = tar::Archive::new(std::io::Cursor::new(plaintext))
        .entries()
        .unwrap()
        .map(|entry| entry.unwrap().path().unwrap().into_owned())
        .collect();
    assert!(
        archived_paths
            .iter()
            .any(|path| path == Path::new("memory/USER.md"))
    );
}

#[test]
fn interrupted_first_rename_finishes_activation_on_restart() {
    let temp = tempfile::tempdir().unwrap();
    let (legacy, project) = legacy_fixture(temp.path());
    let store = FakeKeyStore::available();
    let mut req = request(legacy.clone(), project);
    req.kill_point = Some(MigrationKillPoint::AfterLegacyRename);
    assert!(migrate(&req, &store, |_| {}).is_err());
    assert!(!legacy.exists());

    req.kill_point = None;
    let outcome = migrate(&req, &store, |_| {}).unwrap();
    assert_eq!(outcome.status, MigrationStatus::Activated);
    assert!(legacy.join(".unified-memory-v1").is_file());
}

#[test]
fn activated_marker_prevents_fallback_and_restart_finishes_cleanup() {
    let temp = tempfile::tempdir().unwrap();
    let (legacy, project) = legacy_fixture(temp.path());
    let store = FakeKeyStore::available();
    let mut req = request(legacy.clone(), project);
    req.kill_point = Some(MigrationKillPoint::AfterActivate);
    assert!(migrate(&req, &store, |_| {}).is_err());
    assert!(legacy.join(".unified-memory-v1").is_file());
    assert!(
        !legacy.join("USER.md").exists(),
        "never fall back to legacy"
    );

    req.kill_point = None;
    let outcome = migrate(&req, &store, |_| {}).unwrap();
    assert_eq!(outcome.status, MigrationStatus::Activated);
    assert!(
        temp.path()
            .read_dir()
            .unwrap()
            .filter_map(Result::ok)
            .all(|entry| !entry
                .file_name()
                .to_string_lossy()
                .contains("legacy.pending"))
    );
}

#[test]
fn credential_store_failure_pauses_unless_user_explicitly_skips_backup() {
    let temp = tempfile::tempdir().unwrap();
    let (legacy, project) = legacy_fixture(temp.path());
    let unavailable = FakeKeyStore::default();
    let mut req = request(legacy.clone(), project);
    req.backup_decision = BackupDecision::RequireEncryptedBackup;
    assert!(migrate(&req, &unavailable, |_| {}).is_err());
    assert!(legacy.exists());

    req.backup_decision = BackupDecision::ContinueWithoutBackup;
    assert!(migrate(&req, &unavailable, |_| {}).is_ok());
}

#[test]
fn rejects_workspace_registry_paths_that_escape_the_legacy_root() {
    let temp = tempfile::tempdir().unwrap();
    let (legacy, project) = legacy_fixture(temp.path());
    let store = FakeKeyStore::available();
    let mut req = request(legacy.clone(), project);
    req.project_registry = BTreeMap::from([("../outside".to_owned(), project)]);

    assert!(migrate(&req, &store, |_| {}).is_err());
    assert!(legacy.join("USER.md").is_file());
}

#[test]
fn forgetting_backup_deletes_key_before_ciphertext_and_fails_closed() {
    let temp = tempfile::tempdir().unwrap();
    let backup = temp.path().join("memory.legacy.age");
    std::fs::write(&backup, "ciphertext").unwrap();
    let failing = FakeKeyStore {
        available: true,
        fail_delete: true,
        ..FakeKeyStore::default()
    };
    assert!(forget_legacy_backup(&backup, "backup-1", &failing).is_err());
    assert!(
        backup.exists(),
        "ciphertext remains when key deletion fails"
    );

    let store = FakeKeyStore::available();
    store
        .values
        .lock()
        .unwrap()
        .insert("backup-1".to_owned(), "secret".to_owned());
    forget_legacy_backup(&backup, "backup-1", &store).unwrap();
    assert!(!backup.exists());
    assert_eq!(
        store.events.lock().unwrap().first().map(String::as_str),
        Some("delete:backup-1")
    );
}
