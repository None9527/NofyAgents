//! Canonical domain model for the unified memory system.
//!
//! These types describe durable memory facts independently from the legacy
//! Markdown storage and the derived search index.  File layout, SQLite rows,
//! and tool payloads must translate through this model instead of defining
//! competing notions of scope, identity, or ownership.

use std::collections::HashSet;
use std::path::{Component, Path};

use chrono::{DateTime, Utc};
use git2::{Repository, Sort};
use serde::{Deserialize, Serialize};
use thiserror::Error;
use uuid::Uuid;

#[derive(Debug, Error, Clone, PartialEq, Eq)]
pub enum ModelError {
    #[error("{kind} must not be a nil UUID")]
    NilId { kind: &'static str },
    #[error("repository fingerprint must not be empty")]
    EmptyRepositoryFingerprint,
    #[error("could not resolve project identity: {0}")]
    ProjectIdentityResolution(String),
    #[error("content hash must be exactly 64 lowercase hexadecimal characters")]
    InvalidContentHash,
    #[error("topic path must be a normalized relative Markdown path")]
    InvalidTopicPath,
    #[error("{field} must not be empty")]
    EmptyField { field: &'static str },
    #[error("personal memory must not carry project validity")]
    PersonalWithProjectValidity,
    #[error("project memory requires explicit project validity")]
    ProjectWithoutValidity,
    #[error("branch-local validity requires both git_ref and anchor_commit")]
    InvalidBranchValidity,
    #[error("a user correction must supersede at least one observation")]
    CorrectionWithoutSupersededObservation,
    #[error("only user corrections may supersede observations")]
    SupersedesOnNonCorrection,
    #[error("superseded observation IDs must be unique")]
    DuplicateSupersededObservation,
    #[error("topic revision must be greater than zero")]
    ZeroTopicRevision,
    #[error("topic must cite at least one observation")]
    TopicWithoutEvidence,
    #[error("topic evidence IDs must be unique")]
    DuplicateTopicEvidence,
    #[error("tombstone retention deadline cannot precede creation")]
    InvalidRetentionDeadline,
}

macro_rules! uuid_id {
    ($name:ident, $kind:literal) => {
        #[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
        #[serde(try_from = "Uuid", into = "Uuid")]
        pub struct $name(Uuid);

        impl $name {
            pub fn new() -> Self {
                Self(Uuid::new_v4())
            }

            pub fn as_uuid(&self) -> Uuid {
                self.0
            }

            pub fn validate(&self) -> Result<(), ModelError> {
                if self.0.is_nil() {
                    return Err(ModelError::NilId { kind: $kind });
                }
                Ok(())
            }
        }

        impl Default for $name {
            fn default() -> Self {
                Self::new()
            }
        }

        impl TryFrom<Uuid> for $name {
            type Error = ModelError;

            fn try_from(value: Uuid) -> Result<Self, Self::Error> {
                let id = Self(value);
                id.validate()?;
                Ok(id)
            }
        }

        impl From<$name> for Uuid {
            fn from(value: $name) -> Self {
                value.0
            }
        }
    };
}

uuid_id!(ObservationId, "observation ID");
uuid_id!(TopicId, "topic ID");
uuid_id!(TombstoneId, "tombstone ID");
uuid_id!(OperationId, "operation ID");

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(try_from = "Uuid", into = "Uuid")]
pub struct ProjectId(Uuid);

impl ProjectId {
    pub fn new() -> Self {
        Self(Uuid::new_v4())
    }

    pub fn from_repository_fingerprint(fingerprint: &str) -> Result<Self, ModelError> {
        if fingerprint.trim().is_empty() {
            return Err(ModelError::EmptyRepositoryFingerprint);
        }
        Ok(Self(Uuid::new_v5(
            &Uuid::NAMESPACE_URL,
            fingerprint.trim().as_bytes(),
        )))
    }

    /// Resolve a stable project ID for a Git checkout, linked worktree, or
    /// ordinary non-Git directory.
    ///
    /// Git repositories prefer a normalized origin plus their root commits,
    /// so clones and worktrees agree. Repositories without an origin use the
    /// shared Git common directory. Non-Git projects use their canonical path.
    pub fn resolve(path: &Path) -> Result<Self, ModelError> {
        let fingerprint = match Repository::discover(path) {
            Ok(repository) => repository_fingerprint(&repository)?,
            Err(error) if error.code() == git2::ErrorCode::NotFound => {
                let canonical = dunce::canonicalize(path).map_err(|io_error| {
                    ModelError::ProjectIdentityResolution(format!("{}: {io_error}", path.display()))
                })?;
                format!("path:{}", canonical.to_string_lossy())
            }
            Err(error) => {
                return Err(ModelError::ProjectIdentityResolution(error.to_string()));
            }
        };
        Self::from_repository_fingerprint(&fingerprint)
    }

    pub fn as_uuid(&self) -> Uuid {
        self.0
    }

    pub fn validate(&self) -> Result<(), ModelError> {
        if self.0.is_nil() {
            return Err(ModelError::NilId { kind: "project ID" });
        }
        Ok(())
    }
}

impl Default for ProjectId {
    fn default() -> Self {
        Self::new()
    }
}

impl TryFrom<Uuid> for ProjectId {
    type Error = ModelError;

    fn try_from(value: Uuid) -> Result<Self, Self::Error> {
        let id = Self(value);
        id.validate()?;
        Ok(id)
    }
}

impl From<ProjectId> for Uuid {
    fn from(value: ProjectId) -> Self {
        value.0
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(try_from = "String", into = "String")]
pub struct ContentHash(String);

impl ContentHash {
    pub fn parse(value: impl Into<String>) -> Result<Self, ModelError> {
        let value = value.into();
        if value.len() != 64
            || !value
                .bytes()
                .all(|byte| byte.is_ascii_digit() || (b'a'..=b'f').contains(&byte))
        {
            return Err(ModelError::InvalidContentHash);
        }
        Ok(Self(value))
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl TryFrom<String> for ContentHash {
    type Error = ModelError;

    fn try_from(value: String) -> Result<Self, Self::Error> {
        Self::parse(value)
    }
}

impl From<ContentHash> for String {
    fn from(value: ContentHash) -> Self {
        value.0
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(try_from = "String", into = "String")]
pub struct TopicPath(String);

impl TopicPath {
    pub fn parse(value: impl Into<String>) -> Result<Self, ModelError> {
        let value = value.into();
        let path = Path::new(&value);
        let raw_segments_are_normal = value
            .split('/')
            .all(|segment| !segment.is_empty() && segment != "." && segment != "..");
        let normalized = !value.is_empty()
            && !value.contains('\\')
            && !path.is_absolute()
            && raw_segments_are_normal
            && path.extension().is_some_and(|extension| extension == "md")
            && path
                .components()
                .all(|component| matches!(component, Component::Normal(_)));
        if !normalized {
            return Err(ModelError::InvalidTopicPath);
        }
        Ok(Self(value))
    }

    /// Adapt a host-native path at filesystem boundaries, not logical path
    /// text or serde input. Keep raw dot/empty segments for parse to reject.
    /// Preserve the existing lossy validation; callers still use the original
    /// native path for filesystem access and durable payloads.
    pub(crate) fn from_native_path(path: &Path) -> Result<Self, ModelError> {
        let value = path.to_string_lossy().into_owned();
        #[cfg(windows)]
        let value = value.replace('\\', "/");
        Self::parse(value)
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl TryFrom<String> for TopicPath {
    type Error = ModelError;

    fn try_from(value: String) -> Result<Self, Self::Error> {
        Self::parse(value)
    }
}

impl From<TopicPath> for String {
    fn from(value: TopicPath) -> Self {
        value.0
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(tag = "kind", content = "value", rename_all = "snake_case")]
pub enum MemoryScope {
    Personal,
    Project(ProjectId),
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum ProjectValidity {
    ProjectWide,
    BranchLocal {
        git_ref: String,
        anchor_commit: String,
    },
}

impl ProjectValidity {
    pub fn validate(&self) -> Result<(), ModelError> {
        match self {
            Self::ProjectWide => Ok(()),
            Self::BranchLocal {
                git_ref,
                anchor_commit,
            } if !git_ref.trim().is_empty() && !anchor_commit.trim().is_empty() => Ok(()),
            Self::BranchLocal { .. } => Err(ModelError::InvalidBranchValidity),
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ObservationKind {
    User,
    UserCorrection,
    Feedback,
    Project,
    Reference,
    Explicit,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ObservationStatus {
    Active,
    Superseded,
    Disputed,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TopicOrigin {
    User,
    Curator,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum CaptureRollout {
    Off,
    RecordOnly,
    Shadow,
    Active,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Provenance {
    pub session_id: String,
    pub turn_id: String,
    pub model: String,
    pub prompt_version: String,
    pub source_hash: ContentHash,
}

impl Provenance {
    pub fn validate(&self) -> Result<(), ModelError> {
        ensure_non_empty("session_id", &self.session_id)?;
        ensure_non_empty("turn_id", &self.turn_id)?;
        ensure_non_empty("model", &self.model)?;
        ensure_non_empty("prompt_version", &self.prompt_version)
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Observation {
    pub id: ObservationId,
    pub scope: MemoryScope,
    pub kind: ObservationKind,
    pub statement: String,
    pub keywords: Vec<String>,
    pub aliases: Vec<String>,
    pub supersedes: Vec<ObservationId>,
    pub project_validity: Option<ProjectValidity>,
    pub provenance: Provenance,
    pub content_hash: ContentHash,
    pub created_at: DateTime<Utc>,
}

impl Observation {
    pub fn validate(&self) -> Result<(), ModelError> {
        self.id.validate()?;
        ensure_non_empty("statement", &self.statement)?;
        self.provenance.validate()?;
        validate_scope(&self.scope, self.project_validity.as_ref())?;
        validate_unique_ids(&self.supersedes, ModelError::DuplicateSupersededObservation)?;
        match (self.kind, self.supersedes.is_empty()) {
            (ObservationKind::UserCorrection, true) => {
                Err(ModelError::CorrectionWithoutSupersededObservation)
            }
            (ObservationKind::UserCorrection, false) | (_, true) => Ok(()),
            (_, false) => Err(ModelError::SupersedesOnNonCorrection),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ObservationView {
    pub observation: Observation,
    pub status: ObservationStatus,
    pub resolved_by: Option<ObservationId>,
}

impl ObservationView {
    pub fn is_recallable(&self) -> bool {
        self.status == ObservationStatus::Active
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Topic {
    pub id: TopicId,
    pub scope: MemoryScope,
    pub path: TopicPath,
    pub title: String,
    pub description: String,
    pub body: String,
    pub origin: TopicOrigin,
    pub pinned: bool,
    pub project_validity: Option<ProjectValidity>,
    pub revision: u64,
    pub content_hash: ContentHash,
    pub evidence: Vec<ObservationId>,
}

impl Topic {
    pub fn validate(&self) -> Result<(), ModelError> {
        self.id.validate()?;
        ensure_non_empty("title", &self.title)?;
        ensure_non_empty("body", &self.body)?;
        validate_scope(&self.scope, self.project_validity.as_ref())?;
        if self.revision == 0 {
            return Err(ModelError::ZeroTopicRevision);
        }
        if self.evidence.is_empty() {
            return Err(ModelError::TopicWithoutEvidence);
        }
        validate_unique_ids(&self.evidence, ModelError::DuplicateTopicEvidence)
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(tag = "kind", content = "id", rename_all = "snake_case")]
pub enum MemoryRecordId {
    Observation(ObservationId),
    Topic(TopicId),
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TombstoneReason {
    UserRequest,
    Privacy,
    Incorrect,
    Obsolete,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Tombstone {
    pub id: TombstoneId,
    pub target: MemoryRecordId,
    pub previous_hash: ContentHash,
    pub reason: TombstoneReason,
    pub created_at: DateTime<Utc>,
    pub retention_deadline: DateTime<Utc>,
}

impl Tombstone {
    pub fn validate(&self) -> Result<(), ModelError> {
        self.id.validate()?;
        if self.retention_deadline < self.created_at {
            return Err(ModelError::InvalidRetentionDeadline);
        }
        Ok(())
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum OperationPhase {
    Planned,
    EvidenceClaimed,
    CanonicalCommitted,
    DerivativesRebuilt,
    EvidenceArchived,
    Completed,
    Failed,
}

fn validate_scope(
    scope: &MemoryScope,
    project_validity: Option<&ProjectValidity>,
) -> Result<(), ModelError> {
    match (scope, project_validity) {
        (MemoryScope::Personal, None) => Ok(()),
        (MemoryScope::Personal, Some(_)) => Err(ModelError::PersonalWithProjectValidity),
        (MemoryScope::Project(project_id), Some(validity)) => {
            project_id.validate()?;
            validity.validate()
        }
        (MemoryScope::Project(_), None) => Err(ModelError::ProjectWithoutValidity),
    }
}

fn validate_unique_ids<T>(ids: &[T], duplicate_error: ModelError) -> Result<(), ModelError>
where
    T: Eq + std::hash::Hash,
{
    let mut unique = HashSet::with_capacity(ids.len());
    if ids.iter().all(|id| unique.insert(id)) {
        Ok(())
    } else {
        Err(duplicate_error)
    }
}

fn ensure_non_empty(field: &'static str, value: &str) -> Result<(), ModelError> {
    if value.trim().is_empty() {
        return Err(ModelError::EmptyField { field });
    }
    Ok(())
}

fn repository_fingerprint(repository: &Repository) -> Result<String, ModelError> {
    if let Some(remote) = repository
        .find_remote("origin")
        .ok()
        .and_then(|remote| remote.url().and_then(normalize_remote_url))
    {
        let roots = repository_root_commits(repository)?;
        if !roots.is_empty() {
            return Ok(format!("git:{remote}@{}", roots.join(",")));
        }
    }

    let common_dir = dunce::canonicalize(repository.commondir()).map_err(|error| {
        ModelError::ProjectIdentityResolution(format!(
            "{}: {error}",
            repository.commondir().display()
        ))
    })?;
    Ok(format!("git-common:{}", common_dir.to_string_lossy()))
}

fn repository_root_commits(repository: &Repository) -> Result<Vec<String>, ModelError> {
    let mut walk = match repository.revwalk() {
        Ok(walk) => walk,
        Err(error) => return Err(ModelError::ProjectIdentityResolution(error.to_string())),
    };
    if walk.push_head().is_err() {
        return Ok(Vec::new());
    }
    walk.set_sorting(Sort::TOPOLOGICAL)
        .map_err(|error| ModelError::ProjectIdentityResolution(error.to_string()))?;

    let mut roots = Vec::new();
    for oid in walk {
        let oid = oid.map_err(|error| ModelError::ProjectIdentityResolution(error.to_string()))?;
        let commit = repository
            .find_commit(oid)
            .map_err(|error| ModelError::ProjectIdentityResolution(error.to_string()))?;
        if commit.parent_count() == 0 {
            roots.push(oid.to_string());
        }
    }
    roots.sort_unstable();
    roots.dedup();
    Ok(roots)
}

fn normalize_remote_url(url: &str) -> Option<String> {
    let without_suffix = url.trim().trim_end_matches('/').trim_end_matches(".git");
    if without_suffix.is_empty() {
        return None;
    }
    Some(without_suffix.to_string())
}

#[cfg(test)]
mod native_topic_path_tests;
