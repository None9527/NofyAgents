//! One-way, restartable import from the legacy Markdown memory tree.

use std::collections::{BTreeMap, BTreeSet, HashSet};
use std::path::{Path, PathBuf};

use chrono::{TimeZone, Utc};
use serde::{Deserialize, Serialize};
use thiserror::Error;
use uuid::Uuid;

use crate::access::MemoryAccess;
use crate::atomic_file;
use crate::layout::UnifiedMemoryLayout;
use crate::migration_backup::{
    BackupError, BackupReceipt, MigrationKeyStore, create_encrypted_backup,
};
use crate::model::{
    ContentHash, MemoryScope, Observation, ObservationId, ObservationKind, ProjectId,
    ProjectValidity, Provenance,
};
use crate::retention::{load_migration_backup_receipt, persist_migration_backup_receipt};
use crate::state::UnifiedState;

const MARKER: &str = ".unified-memory-v1";
const REPORT: &str = "migration-report.json";
const INDEX: &str = "migration-index.json";

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum BackupDecision {
    RequireEncryptedBackup,
    ContinueWithoutBackup,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum MigrationKillPoint {
    BeforeSwitch,
    AfterLegacyRename,
    AfterActivate,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum MigrationPhase {
    Scanning,
    Importing,
    Validating,
    Switching,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct MigrationProgress {
    pub phase: MigrationPhase,
    pub scanned_objects: usize,
    pub imported_objects: usize,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum MigrationStatus {
    Activated,
    AlreadyActive,
}

#[derive(Debug, Clone)]
pub struct MigrationRequest {
    pub legacy_memory_dir: PathBuf,
    pub project_registry: BTreeMap<String, ProjectId>,
    pub current_project: Option<ProjectId>,
    pub backup_decision: BackupDecision,
    pub kill_point: Option<MigrationKillPoint>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ImportedObject {
    pub relative_path: String,
    pub source_path: String,
    pub source_hash: String,
    pub content_hash: String,
    pub idempotency_key: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct MigrationReport {
    pub schema_version: u32,
    pub imported_objects: usize,
    pub imported_idempotency_keys: Vec<String>,
    pub objects: Vec<ImportedObject>,
    pub deferred_knowledge_sources: Vec<String>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct MigrationOutcome {
    pub status: MigrationStatus,
    pub report: MigrationReport,
    pub backup: Option<BackupReceipt>,
}

#[derive(Debug, Error)]
pub enum MigrationError {
    #[error("memory migration I/O failed: {0}")]
    Io(#[from] std::io::Error),
    #[error("memory migration serialization failed: {0}")]
    Json(#[from] serde_json::Error),
    #[error("memory migration backup failed: {0}")]
    Backup(#[from] BackupError),
    #[error("memory migration access failed: {0}")]
    Access(#[from] crate::access::AccessError),
    #[error("memory migration state failed: {0}")]
    State(#[from] crate::state::StateError),
    #[error("memory migration model failed: {0}")]
    Model(#[from] crate::model::ModelError),
    #[error("legacy memory root does not exist: {0}")]
    MissingLegacyRoot(String),
    #[error("migration validation failed: {0}")]
    Validation(String),
    #[error("injected migration interruption at {0:?}")]
    Injected(MigrationKillPoint),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct MigrationState {
    staging: PathBuf,
    pending_legacy: PathBuf,
    backup: Option<BackupReceipt>,
}

#[derive(Debug, Serialize)]
struct MigrationIndex<'a> {
    schema_version: u32,
    objects: &'a [ImportedObject],
}

pub fn migrate(
    request: &MigrationRequest,
    key_store: &dyn MigrationKeyStore,
    mut progress: impl FnMut(MigrationProgress),
) -> Result<MigrationOutcome, MigrationError> {
    let state_path = migration_state_path(&request.legacy_memory_dir)?;
    if request.legacy_memory_dir.join(MARKER).is_file() {
        if state_path.is_file() {
            let mut state: MigrationState = serde_json::from_slice(&std::fs::read(&state_path)?)?;
            validate_state(request, &state)?;
            return finish_switch(request, &state_path, &mut state);
        }
        return active_outcome(&request.legacy_memory_dir, MigrationStatus::AlreadyActive);
    }

    let mut state = load_or_create_state(request, &state_path)?;
    if !request.legacy_memory_dir.exists() && state.pending_legacy.exists() {
        return finish_switch(request, &state_path, &mut state);
    }
    if request.legacy_memory_dir.is_dir()
        && state.pending_legacy.is_dir()
        && !state.staging.exists()
        && request.legacy_memory_dir.join(REPORT).is_file()
    {
        return finish_switch(request, &state_path, &mut state);
    }
    if !request.legacy_memory_dir.is_dir() {
        return Err(MigrationError::MissingLegacyRoot(
            request.legacy_memory_dir.display().to_string(),
        ));
    }

    progress(MigrationProgress {
        phase: MigrationPhase::Scanning,
        scanned_objects: 0,
        imported_objects: 0,
    });
    let scan = scan_legacy(request)?;
    let scanned_objects = scan.object_count();
    progress(MigrationProgress {
        phase: MigrationPhase::Importing,
        scanned_objects,
        imported_objects: 0,
    });
    reset_staging(&state.staging)?;
    let report = import_legacy(request, &scan, &state.staging)?;
    progress(MigrationProgress {
        phase: MigrationPhase::Validating,
        scanned_objects,
        imported_objects: report.imported_objects,
    });
    validate_staging(&state.staging, &report)?;
    progress(MigrationProgress {
        phase: MigrationPhase::Switching,
        scanned_objects,
        imported_objects: report.imported_objects,
    });

    if request.backup_decision == BackupDecision::RequireEncryptedBackup && state.backup.is_none() {
        let backup_path = backup_path(&request.legacy_memory_dir);
        state.backup = Some(create_encrypted_backup(
            &request.legacy_memory_dir,
            &backup_path,
            key_store,
        )?);
        save_state(&state_path, &state)?;
    }
    inject(request.kill_point, MigrationKillPoint::BeforeSwitch)?;
    std::fs::rename(&request.legacy_memory_dir, &state.pending_legacy)?;
    sync_parent(&request.legacy_memory_dir)?;
    inject(request.kill_point, MigrationKillPoint::AfterLegacyRename)?;
    finish_switch(request, &state_path, &mut state)
}

#[derive(Debug)]
struct LegacyScan {
    user: Option<(PathBuf, String)>,
    global: Option<(PathBuf, String)>,
    workspaces: Vec<WorkspaceScan>,
    deferred_roots: Vec<String>,
}

#[derive(Debug)]
struct WorkspaceScan {
    key: String,
    project_id: ProjectId,
    memory: Option<(PathBuf, String)>,
    sessions: Vec<(PathBuf, String)>,
}

impl LegacyScan {
    fn object_count(&self) -> usize {
        usize::from(self.user.is_some())
            + usize::from(self.global.is_some())
            + self
                .workspaces
                .iter()
                .map(|workspace| usize::from(workspace.memory.is_some()) + workspace.sessions.len())
                .sum::<usize>()
    }
}

fn scan_legacy(request: &MigrationRequest) -> Result<LegacyScan, MigrationError> {
    let root = &request.legacy_memory_dir;
    let user = read_optional(root.join("USER.md"))?;
    let global = read_optional(root.join("MEMORY.md"))?;
    let deferred_roots = read_roots(&root.join("roots.json"))?;
    let mut workspaces = Vec::new();
    for (key, project_id) in &request.project_registry {
        if Path::new(key).components().count() != 1
            || key == "."
            || key == ".."
            || Path::new(key).is_absolute()
        {
            return Err(MigrationError::Validation(format!(
                "invalid legacy workspace key {key}"
            )));
        }
        let workspace = root.join(key);
        let mut sessions = Vec::new();
        let sessions_dir = workspace.join("sessions");
        if sessions_dir.is_dir() {
            let mut paths = directory_files(&sessions_dir)?;
            paths.sort();
            for path in paths {
                sessions.push((path.clone(), std::fs::read_to_string(path)?));
            }
        }
        workspaces.push(WorkspaceScan {
            key: key.clone(),
            project_id: *project_id,
            memory: read_optional(workspace.join("MEMORY.md"))?,
            sessions,
        });
    }
    Ok(LegacyScan {
        user,
        global,
        workspaces,
        deferred_roots,
    })
}

fn import_legacy(
    request: &MigrationRequest,
    scan: &LegacyScan,
    staging: &Path,
) -> Result<MigrationReport, MigrationError> {
    let layout = UnifiedMemoryLayout::new(staging);
    std::fs::create_dir_all(staging)?;
    let mut objects = Vec::new();
    if let Some((source, content)) = &scan.user {
        write_topic(
            staging,
            &layout.personal_scope(),
            "about-me.md",
            "User-owned, pinned legacy profile",
            "user",
            true,
            content,
            source,
            &mut objects,
        )?;
    }
    if let Some((source, content)) = &scan.global {
        let classified = classify_global(content);
        write_topic(
            staging,
            &layout.personal_scope(),
            "preferences.md",
            "User preferences imported from legacy global memory",
            "curator",
            false,
            &classified.preferences,
            source,
            &mut objects,
        )?;
        write_topic(
            staging,
            &layout.personal_scope(),
            "migration-review.md",
            "Legacy notes requiring user review",
            "curator",
            false,
            &classified.review,
            source,
            &mut objects,
        )?;
        if let Some(project_id) = request.current_project {
            write_topic(
                staging,
                &layout.project_scope(project_id),
                "legacy-global-project.md",
                "Project conventions imported from legacy global memory",
                "curator",
                false,
                &classified.project,
                source,
                &mut objects,
            )?;
        }
    }
    for workspace in &scan.workspaces {
        let scope = layout.project_scope(workspace.project_id);
        if let Some((source, content)) = &workspace.memory {
            write_topic(
                staging,
                &scope,
                "legacy-memory.md",
                &format!(
                    "Curator-owned import from legacy workspace {}",
                    workspace.key
                ),
                "curator",
                false,
                content,
                source,
                &mut objects,
            )?;
        }
        for (source, content) in &workspace.sessions {
            write_observation(
                staging,
                &layout,
                workspace.project_id,
                source,
                content,
                &mut objects,
            )?;
        }
    }
    rebuild_manifests(&layout, request, scan)?;
    objects.sort_by(|left, right| left.relative_path.cmp(&right.relative_path));
    let keys: Vec<_> = objects
        .iter()
        .map(|object| object.idempotency_key.clone())
        .collect();
    let report = MigrationReport {
        schema_version: 1,
        imported_objects: objects.len(),
        imported_idempotency_keys: keys,
        objects,
        deferred_knowledge_sources: scan.deferred_roots.clone(),
    };
    atomic_file::replace(&staging.join(REPORT), &serde_json::to_vec_pretty(&report)?)?;
    atomic_file::replace(
        &staging.join(INDEX),
        &serde_json::to_vec_pretty(&MigrationIndex {
            schema_version: 1,
            objects: &report.objects,
        })?,
    )?;
    Ok(report)
}

struct ClassifiedGlobal {
    preferences: String,
    project: String,
    review: String,
}

fn classify_global(content: &str) -> ClassifiedGlobal {
    let mut preferences = Vec::new();
    let mut project = Vec::new();
    let mut review = Vec::new();
    for section in markdown_sections(content) {
        let lower = section.to_ascii_lowercase();
        if lower.contains("preference") || lower.contains("沟通") || lower.contains("用户") {
            preferences.push(section);
        } else if lower.contains("project")
            || lower.contains("repo")
            || lower.contains("build")
            || lower.contains("项目")
        {
            project.push(section);
        } else {
            review.push(section);
        }
    }
    ClassifiedGlobal {
        preferences: joined_or_placeholder(preferences),
        project: joined_or_placeholder(project),
        review: joined_or_placeholder(review),
    }
}

fn markdown_sections(content: &str) -> Vec<String> {
    let mut sections = Vec::new();
    let mut current = Vec::new();
    for line in content.lines() {
        if line.starts_with("## ") && !current.is_empty() {
            sections.push(current.join("\n"));
            current.clear();
        }
        if !line.starts_with("# ") || line.starts_with("## ") {
            current.push(line);
        }
    }
    if !current.is_empty() {
        sections.push(current.join("\n"));
    }
    sections
}

fn joined_or_placeholder(sections: Vec<String>) -> String {
    if sections.is_empty() {
        "_No legacy entries were classified into this topic._".to_owned()
    } else {
        sections.join("\n\n")
    }
}

fn write_topic(
    staging: &Path,
    scope: &crate::layout::ScopeLayout,
    file_name: &str,
    description: &str,
    origin: &str,
    pinned: bool,
    body: &str,
    source: &Path,
    objects: &mut Vec<ImportedObject>,
) -> Result<(), MigrationError> {
    let relative = scope
        .topics_directory()
        .join(file_name)
        .strip_prefix(staging)
        .map_err(|error| MigrationError::Validation(error.to_string()))?
        .to_path_buf();
    let source_relative = source.to_string_lossy().into_owned();
    let source_hash = hash(&std::fs::read(source)?);
    let key = format!(
        "legacy:{}:{}:{}",
        source_relative,
        path_text(&relative),
        source_hash
    );
    let content = format!(
        "<!-- nofy-memory: origin={}; pinned={}; imported_from=legacy; source={}; source_hash={}; idempotency_key={} -->\n# {}\n\n{}\n\n{}\n",
        origin,
        pinned,
        source_relative,
        source_hash,
        key,
        title_from_file(file_name),
        description,
        body.trim()
    );
    atomic_file::replace(&staging.join(&relative), content.as_bytes())?;
    let content_hash = hash(content.as_bytes());
    objects.push(ImportedObject {
        relative_path: path_text(&relative),
        source_path: source_relative,
        source_hash,
        content_hash,
        idempotency_key: key,
    });
    Ok(())
}

fn write_observation(
    staging: &Path,
    layout: &UnifiedMemoryLayout,
    project_id: ProjectId,
    source: &Path,
    statement: &str,
    objects: &mut Vec<ImportedObject>,
) -> Result<(), MigrationError> {
    let source_text = source.to_string_lossy().into_owned();
    let source_hash = hash(statement.as_bytes());
    let key = format!("legacy-session:{}:{}", source_text, source_hash);
    let uuid = Uuid::new_v5(&Uuid::NAMESPACE_URL, key.as_bytes());
    let id = ObservationId::try_from(uuid)?;
    let scope = layout.project_scope(project_id);
    let relative_in_scope = format!("observations/{uuid}.md");
    let relative = scope
        .root()
        .join(&relative_in_scope)
        .strip_prefix(staging)
        .map_err(|error| MigrationError::Validation(error.to_string()))?
        .to_path_buf();
    let content_hash = ContentHash::parse(hash(statement.as_bytes()))?;
    let observation = Observation {
        id,
        scope: MemoryScope::Project(project_id),
        kind: ObservationKind::Project,
        statement: statement.trim().to_owned(),
        keywords: vec!["legacy-session".to_owned()],
        aliases: Vec::new(),
        supersedes: Vec::new(),
        project_validity: Some(ProjectValidity::ProjectWide),
        provenance: Provenance {
            session_id: source
                .file_stem()
                .and_then(|value| value.to_str())
                .unwrap_or("legacy-session")
                .to_owned(),
            turn_id: "legacy-import".to_owned(),
            model: "legacy".to_owned(),
            prompt_version: "migration-v1".to_owned(),
            source_hash: content_hash.clone(),
        },
        content_hash,
        created_at: Utc.timestamp_opt(0, 0).single().expect("Unix epoch exists"),
    };
    let serialized = format!(
        "<!-- nofy-memory: immutable=true; source={}; idempotency_key={} -->\n```json\n{}\n```\n",
        source_text,
        key,
        serde_json::to_string_pretty(&observation)?
    );
    atomic_file::replace(&staging.join(&relative), serialized.as_bytes())?;
    let state = UnifiedState::open(layout.meta_database(), scope.state_database())?;
    state.record_observation_file(&observation, &relative_in_scope)?;
    objects.push(ImportedObject {
        relative_path: path_text(&relative),
        source_path: source_text,
        source_hash,
        content_hash: hash(serialized.as_bytes()),
        idempotency_key: key,
    });
    Ok(())
}

fn rebuild_manifests(
    layout: &UnifiedMemoryLayout,
    request: &MigrationRequest,
    scan: &LegacyScan,
) -> Result<(), MigrationError> {
    MemoryAccess::open(layout.meta_database(), layout.personal_scope())?.rebuild_manifest()?;
    let mut projects = HashSet::new();
    projects.extend(request.current_project);
    projects.extend(scan.workspaces.iter().map(|workspace| workspace.project_id));
    for project in projects {
        MemoryAccess::open(layout.meta_database(), layout.project_scope(project))?
            .rebuild_manifest()?;
    }
    Ok(())
}

fn validate_staging(staging: &Path, report: &MigrationReport) -> Result<(), MigrationError> {
    if report.imported_objects != report.objects.len()
        || report.imported_objects != report.imported_idempotency_keys.len()
    {
        return Err(MigrationError::Validation(
            "imported object and idempotency counts differ".to_owned(),
        ));
    }
    let mut unique = BTreeSet::new();
    for object in &report.objects {
        if !unique.insert(&object.idempotency_key) {
            return Err(MigrationError::Validation(format!(
                "duplicate idempotency key {}",
                object.idempotency_key
            )));
        }
        if !staging.join(&object.relative_path).is_file() {
            return Err(MigrationError::Validation(format!(
                "missing imported object {}",
                object.relative_path
            )));
        }
        let content = std::fs::read(staging.join(&object.relative_path))?;
        if hash(&content) != object.content_hash {
            return Err(MigrationError::Validation(format!(
                "content hash mismatch for {}",
                object.relative_path
            )));
        }
    }
    let persisted: MigrationReport = serde_json::from_slice(&std::fs::read(staging.join(REPORT))?)?;
    if persisted != *report {
        return Err(MigrationError::Validation(
            "persisted migration report does not match import".to_owned(),
        ));
    }
    if let Some(probe) = report.objects.first()
        && !report.objects.iter().any(|candidate| {
            candidate.idempotency_key == probe.idempotency_key
                && std::fs::read(staging.join(&candidate.relative_path)).is_ok_and(|bytes| {
                    String::from_utf8_lossy(&bytes).contains(&probe.idempotency_key)
                })
        })
    {
        return Err(MigrationError::Validation(
            "migration index smoke query could not resolve an imported object".to_owned(),
        ));
    }
    Ok(())
}

fn finish_switch(
    request: &MigrationRequest,
    state_path: &Path,
    state: &mut MigrationState,
) -> Result<MigrationOutcome, MigrationError> {
    if !request.legacy_memory_dir.exists() {
        std::fs::rename(&state.staging, &request.legacy_memory_dir)?;
        sync_parent(&request.legacy_memory_dir)?;
    }
    atomic_file::replace(
        &request.legacy_memory_dir.join(MARKER),
        b"schema_version=1\n",
    )?;
    inject(request.kill_point, MigrationKillPoint::AfterActivate)?;
    let report = read_report(&request.legacy_memory_dir)?;
    if let Some(backup) = &state.backup {
        persist_migration_backup_receipt(&request.legacy_memory_dir, backup)
            .map_err(|error| MigrationError::Validation(error.to_string()))?;
    }
    if state.pending_legacy.exists() {
        std::fs::remove_dir_all(&state.pending_legacy)?;
        sync_parent(&request.legacy_memory_dir)?;
    }
    match std::fs::remove_file(state_path) {
        Ok(()) => sync_parent(state_path)?,
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => {}
        Err(error) => return Err(error.into()),
    }
    Ok(MigrationOutcome {
        status: MigrationStatus::Activated,
        report,
        backup: state.backup.clone(),
    })
}

fn active_outcome(
    root: &Path,
    status: MigrationStatus,
) -> Result<MigrationOutcome, MigrationError> {
    Ok(MigrationOutcome {
        status,
        report: read_report(root)?,
        backup: load_migration_backup_receipt(root)
            .map_err(|error| MigrationError::Validation(error.to_string()))?,
    })
}

fn load_or_create_state(
    request: &MigrationRequest,
    state_path: &Path,
) -> Result<MigrationState, MigrationError> {
    if state_path.is_file() {
        let state = serde_json::from_slice(&std::fs::read(state_path)?)?;
        validate_state(request, &state)?;
        return Ok(state);
    }
    let parent = request
        .legacy_memory_dir
        .parent()
        .ok_or_else(|| MigrationError::Validation("legacy memory root has no parent".to_owned()))?;
    let id = Uuid::new_v4();
    let state = MigrationState {
        staging: parent.join(format!("memory.next.{id}")),
        pending_legacy: parent.join(format!("memory.legacy.pending.{id}")),
        backup: None,
    };
    save_state(state_path, &state)?;
    Ok(state)
}

fn validate_state(
    request: &MigrationRequest,
    state: &MigrationState,
) -> Result<(), MigrationError> {
    let parent = request
        .legacy_memory_dir
        .parent()
        .ok_or_else(|| MigrationError::Validation("legacy memory root has no parent".to_owned()))?;
    let valid_sibling = |path: &Path, prefix: &str| {
        path.parent() == Some(parent)
            && path
                .file_name()
                .and_then(|name| name.to_str())
                .is_some_and(|name| name.starts_with(prefix))
    };
    if !valid_sibling(&state.staging, "memory.next.")
        || !valid_sibling(&state.pending_legacy, "memory.legacy.pending.")
        || state.staging == state.pending_legacy
        || state.staging == request.legacy_memory_dir
        || state.pending_legacy == request.legacy_memory_dir
    {
        return Err(MigrationError::Validation(
            "migration state references an unsafe path".to_owned(),
        ));
    }
    Ok(())
}

fn save_state(path: &Path, state: &MigrationState) -> Result<(), MigrationError> {
    atomic_file::replace(path, &serde_json::to_vec_pretty(state)?)?;
    Ok(())
}

fn reset_staging(staging: &Path) -> Result<(), MigrationError> {
    if staging.exists() {
        std::fs::remove_dir_all(staging)?;
    }
    std::fs::create_dir_all(staging)?;
    Ok(())
}

fn read_report(root: &Path) -> Result<MigrationReport, MigrationError> {
    Ok(serde_json::from_slice(&std::fs::read(root.join(REPORT))?)?)
}

fn read_optional(path: PathBuf) -> Result<Option<(PathBuf, String)>, MigrationError> {
    if path.is_file() {
        let content = std::fs::read_to_string(&path)?;
        Ok(Some((path, content)))
    } else {
        Ok(None)
    }
}

fn read_roots(path: &Path) -> Result<Vec<String>, MigrationError> {
    if !path.is_file() {
        return Ok(Vec::new());
    }
    #[derive(Deserialize)]
    struct LegacyRoots {
        roots: Vec<String>,
    }
    Ok(serde_json::from_slice::<LegacyRoots>(&std::fs::read(path)?)?.roots)
}

fn directory_files(root: &Path) -> Result<Vec<PathBuf>, MigrationError> {
    let mut files = Vec::new();
    for entry in std::fs::read_dir(root)? {
        let path = entry?.path();
        if path.is_file() {
            files.push(path);
        }
    }
    Ok(files)
}

fn migration_state_path(root: &Path) -> Result<PathBuf, MigrationError> {
    let parent = root
        .parent()
        .ok_or_else(|| MigrationError::Validation("legacy root has no parent".to_owned()))?;
    let name = root
        .file_name()
        .and_then(|value| value.to_str())
        .ok_or_else(|| MigrationError::Validation("legacy root has no name".to_owned()))?;
    Ok(parent.join(format!(".{name}-migration-state.json")))
}

fn backup_path(root: &Path) -> PathBuf {
    root.parent()
        .expect("validated legacy root parent")
        .join(format!(
            "memory.legacy.{}.tar.age",
            Utc::now().format("%Y%m%dT%H%M%SZ")
        ))
}

fn hash(bytes: &[u8]) -> String {
    blake3::hash(bytes).to_hex().to_string()
}

fn title_from_file(file_name: &str) -> String {
    file_name
        .trim_end_matches(".md")
        .split('-')
        .map(|part| {
            let mut chars = part.chars();
            chars
                .next()
                .map(|first| first.to_uppercase().collect::<String>() + chars.as_str())
                .unwrap_or_default()
        })
        .collect::<Vec<_>>()
        .join(" ")
}

fn path_text(path: &Path) -> String {
    path.to_string_lossy().replace('\\', "/")
}

fn inject(
    configured: Option<MigrationKillPoint>,
    current: MigrationKillPoint,
) -> Result<(), MigrationError> {
    if configured == Some(current) {
        Err(MigrationError::Injected(current))
    } else {
        Ok(())
    }
}

fn sync_parent(path: &Path) -> Result<(), MigrationError> {
    if let Some(parent) = path.parent() {
        nofy_durable_fs::sync_directory(parent)?;
    }
    Ok(())
}
