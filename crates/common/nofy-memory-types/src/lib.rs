//! Single public capability boundary for memory reads and mutations.

use serde::{Deserialize, Serialize};

pub const MEMORY_LOG_TARGET: &str = "nofy_memory";

#[derive(Debug, thiserror::Error)]
pub enum MemoryServiceError {
    #[error("memory is disabled")]
    Disabled,
    #[error("memory target was not found")]
    NotFound,
    #[error("memory changed since it was read")]
    Conflict,
    #[error("memory content requires confirmation: {0}")]
    ConfirmationRequired(String),
    #[error("memory content cannot be stored: {0}")]
    Rejected(String),
    #[error("memory request is invalid: {0}")]
    InvalidRequest(String),
    #[error("memory operation is not available yet: {0}")]
    Unavailable(String),
    #[error("memory service failed: {0}")]
    Internal(String),
}

pub type MemoryServiceResult<T> = Result<T, MemoryServiceError>;

#[derive(Clone, Debug, Eq, PartialEq, Deserialize, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum MemoryArea {
    Personal,
    Project,
}

impl MemoryArea {
    pub fn user_label(&self) -> &'static str {
        match self {
            Self::Personal => "关于我",
            Self::Project => "当前项目",
        }
    }
}

#[derive(Clone, Debug, Eq, PartialEq, Deserialize, Serialize)]
pub struct MemoryTarget {
    pub id: String,
    pub expected_hash: Option<String>,
}

#[derive(Clone, Debug, PartialEq, Deserialize, Serialize)]
pub struct SearchRequest {
    pub query: String,
    pub max_results: usize,
    pub min_score: f64,
}

#[derive(Clone, Debug, PartialEq, Deserialize, Serialize)]
pub struct MemoryHit {
    pub target: MemoryTarget,
    pub area: MemoryArea,
    pub summary: String,
    pub score: f64,
    pub created_at: i64,
}

#[derive(Clone, Debug, PartialEq, Deserialize, Serialize)]
pub struct SearchPage {
    pub hits: Vec<MemoryHit>,
}

#[derive(Clone, Debug, Eq, PartialEq, Deserialize, Serialize)]
pub struct ListMemoryRequest {
    pub area: Option<MemoryArea>,
}

#[derive(Clone, Debug, Eq, PartialEq, Deserialize, Serialize)]
pub struct MemoryListItem {
    pub target: MemoryTarget,
    pub area: MemoryArea,
    pub summary: String,
    pub updated_at: i64,
}

#[derive(Clone, Debug, Eq, PartialEq, Deserialize, Serialize)]
pub struct MemoryList {
    pub items: Vec<MemoryListItem>,
}

#[derive(Clone, Debug, Eq, PartialEq, Deserialize, Serialize)]
pub struct MemoryDocument {
    pub target: MemoryTarget,
    pub area: MemoryArea,
    pub title: String,
    pub body: String,
    pub revision: u64,
}

#[derive(Clone, Debug, Eq, PartialEq, Deserialize, Serialize)]
pub struct MemoryExplanation {
    pub target: MemoryTarget,
    pub area: MemoryArea,
    pub fact: String,
    pub source: String,
    pub remembered_at: i64,
    pub can_revise: bool,
    pub can_forget: bool,
}

#[derive(Clone, Debug, Eq, PartialEq, Deserialize, Serialize)]
pub struct RememberRequest {
    pub area: MemoryArea,
    pub statement: String,
    pub title: Option<String>,
    pub confirm_sensitive: bool,
}

#[derive(Clone, Debug, Eq, PartialEq, Deserialize, Serialize)]
pub struct RememberReceipt {
    pub target: MemoryTarget,
    pub area_label: String,
    pub summary: String,
    pub undo_token: UndoToken,
    pub snapshot_generation: u64,
}

#[derive(Clone, Debug, Eq, PartialEq, Deserialize, Serialize)]
pub struct ReviseTopicRequest {
    pub target: MemoryTarget,
    pub replacement: String,
}

#[derive(Clone, Debug, Eq, PartialEq, Deserialize, Serialize)]
pub struct TopicRevision {
    pub target: MemoryTarget,
    pub revision: u64,
    pub summary: String,
    pub undo_token: UndoToken,
    pub snapshot_generation: u64,
}

#[derive(Clone, Debug, Eq, PartialEq, Deserialize, Serialize)]
pub struct ForgetRequest {
    pub target: MemoryTarget,
    pub confirmed: bool,
}

#[derive(Clone, Debug, Eq, PartialEq, Deserialize, Serialize)]
pub struct ForgetReceipt {
    pub forgotten: bool,
    pub summary: String,
    pub snapshot_generation: u64,
}

#[derive(Clone, Debug, Eq, PartialEq, Deserialize, Serialize)]
pub struct UndoToken {
    pub operation_id: String,
    pub generation: u64,
}

#[derive(Clone, Debug, Eq, PartialEq, Deserialize, Serialize)]
pub struct UndoReceipt {
    pub restored: bool,
    pub snapshot_generation: u64,
}

#[derive(Clone, Debug, Eq, PartialEq, Deserialize, Serialize)]
pub struct CaptureRequest {
    pub durable_turn_id: String,
}

#[derive(Clone, Debug, Eq, PartialEq, Deserialize, Serialize)]
pub struct CaptureReceipt {
    pub queued: bool,
}

#[derive(Clone, Debug, Eq, PartialEq, Deserialize, Serialize)]
pub struct ConsolidateRequest {
    pub area: MemoryArea,
    pub mode: ConsolidationMode,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq, Deserialize, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum ConsolidationMode {
    RecordOnly,
    Shadow,
    Active,
}

#[derive(Clone, Debug, Eq, PartialEq, Deserialize, Serialize)]
pub struct OperationReceipt {
    pub operation_id: String,
    pub accepted: bool,
    pub area: MemoryArea,
    pub mode: ConsolidationMode,
    pub processed: usize,
}

#[derive(Clone, Debug, Eq, PartialEq, Deserialize, Serialize)]
pub struct SnapshotRequest {
    pub query: Option<String>,
    pub max_items: usize,
}

/// User-safe provenance for one fact included in a frozen inference snapshot.
///
/// Storage coordinates deliberately do not cross this boundary. Mutation tools
/// keep their opaque target and hash values separately.
#[derive(Clone, Debug, Eq, PartialEq, Deserialize, Serialize)]
pub struct MemoryReference {
    pub area: MemoryArea,
    pub area_label: String,
    pub summary: String,
    pub source: String,
}

#[derive(Clone, Debug, Eq, PartialEq, Deserialize, Serialize)]
pub struct MemorySnapshot {
    pub generation: u64,
    pub content: String,
    pub content_hash: String,
    #[serde(default)]
    pub references: Vec<MemoryReference>,
}

#[async_trait::async_trait]
pub trait MemoryService: Send + Sync {
    async fn search(&self, request: SearchRequest) -> MemoryServiceResult<SearchPage>;
    async fn list(&self, request: ListMemoryRequest) -> MemoryServiceResult<MemoryList>;
    async fn get(&self, target: MemoryTarget) -> MemoryServiceResult<MemoryDocument>;
    async fn explain(&self, target: MemoryTarget) -> MemoryServiceResult<MemoryExplanation>;
    async fn remember(&self, request: RememberRequest) -> MemoryServiceResult<RememberReceipt>;
    async fn revise(&self, request: ReviseTopicRequest) -> MemoryServiceResult<TopicRevision>;
    async fn forget(&self, request: ForgetRequest) -> MemoryServiceResult<ForgetReceipt>;
    async fn undo(&self, token: UndoToken) -> MemoryServiceResult<UndoReceipt>;
    async fn capture(&self, request: CaptureRequest) -> MemoryServiceResult<CaptureReceipt>;
    async fn consolidate(
        &self,
        request: ConsolidateRequest,
    ) -> MemoryServiceResult<OperationReceipt>;
    async fn snapshot(&self, request: SnapshotRequest) -> MemoryServiceResult<MemorySnapshot>;
}
