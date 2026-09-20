//! Future read-only knowledge-source contract.
//!
//! This interface is intentionally not referenced by memory, shell, agent
//! builders, or pager code. A future composition root may provide one without
//! turning external documents into memory observations or topics.

use serde::{Deserialize, Serialize};

#[async_trait::async_trait]
pub trait KnowledgeBaseProvider: Send + Sync {
    async fn search(&self, request: KnowledgeQuery) -> KnowledgeBaseResult<Vec<KnowledgeHit>>;
    async fn get(&self, id: KnowledgeDocumentId) -> KnowledgeBaseResult<KnowledgeDocument>;
}

#[derive(Clone, Debug, Eq, Hash, PartialEq, Deserialize, Serialize)]
pub struct KnowledgeDocumentId(pub String);

#[derive(Clone, Debug, Eq, PartialEq, Deserialize, Serialize)]
pub struct KnowledgeContentHash(pub [u8; 32]);

#[derive(Clone, Debug, Eq, PartialEq, Deserialize, Serialize)]
pub struct KnowledgeQuery {
    pub query: String,
    pub limit: usize,
}

#[derive(Clone, Debug, PartialEq, Deserialize, Serialize)]
pub struct KnowledgeHit {
    pub id: KnowledgeDocumentId,
    pub title: String,
    pub snippet: String,
    pub source_uri: String,
    pub score: f32,
    pub content_hash: KnowledgeContentHash,
}

#[derive(Clone, Debug, Eq, PartialEq, Deserialize, Serialize)]
pub struct KnowledgeDocument {
    pub id: KnowledgeDocumentId,
    pub title: String,
    pub body: String,
    pub source_uri: String,
    pub content_hash: KnowledgeContentHash,
}

#[derive(Debug, thiserror::Error)]
pub enum KnowledgeBaseError {
    #[error("knowledge base is unavailable")]
    Unavailable,
    #[error("knowledge document was not found")]
    NotFound,
    #[error("invalid knowledge query: {0}")]
    InvalidRequest(String),
    #[error("knowledge provider failed: {0}")]
    Provider(String),
}

pub type KnowledgeBaseResult<T> = Result<T, KnowledgeBaseError>;
