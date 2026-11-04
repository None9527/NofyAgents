//! Explicit memory-domain engine: canonical topics, evidence, search and
//! durable operation proofs. Roots and connections are supplied by the loader;
//! this crate does not discover product settings, credentials or user homes.

pub mod access;
pub mod atomic_file;
pub mod capture;
pub mod chunker;
pub mod config;
pub mod consolidation;
pub mod embedding;
pub mod index;
pub mod layout;
pub mod manifest;
pub mod migration;
pub mod migration_backup;
pub mod mmr;
pub mod model;
pub mod observation_store;
pub mod query_expansion;
pub mod retention;
#[cfg(feature = "agent-runtime")]
pub mod runtime;
pub mod schema;
pub mod scope_write_lock;
pub mod search;
pub mod service;
pub mod state;
pub mod storage;
pub mod text_utils;
pub mod threat_scan;
pub mod transport;
pub mod watcher;

pub use index::{MemoryIndex, init_sqlite_vec};
pub use storage::{MemoryScope, MemoryStorage};

/// Embed all chunks that don't have embeddings yet.
///
/// Queries the index for unembedded chunks, batches them through the
/// embedding provider, and upserts the results. Logs progress.
///
/// This is the async glue between the sync `MemoryIndex` and the async
/// `EmbeddingProvider`. Call after reindex, flush writes, or session-end writes.
pub async fn embed_missing_chunks(
    index: &MemoryIndex,
    provider: &dyn embedding::EmbeddingProvider,
) -> usize {
    let chunks = match index.chunks_without_embeddings() {
        Ok(c) if c.is_empty() => return 0,
        Ok(c) => c,
        Err(e) => {
            tracing::warn!(
                target: nofy_memory_types::MEMORY_LOG_TARGET,
                error = %e,
                "failed to query chunks without embeddings"
            );
            return 0;
        }
    };

    let total = chunks.len();
    let mut embedded = 0;

    // Batch in groups of 32 (provider's typical max batch size)
    for batch in chunks.chunks(32) {
        let texts: Vec<&str> = batch.iter().map(|(_, text)| text.as_str()).collect();
        match provider.embed_batch(&texts).await {
            Ok(embeddings) => {
                for ((chunk_id, _), embedding) in batch.iter().zip(embeddings.iter()) {
                    if let Err(e) = index.upsert_embedding(chunk_id, embedding) {
                        tracing::warn!(
                            target: nofy_memory_types::MEMORY_LOG_TARGET,
                            chunk_id,
                            error = %e,
                            "failed to upsert embedding"
                        );
                    } else {
                        embedded += 1;
                    }
                }
            }
            Err(e) => {
                tracing::warn!(
                    target: nofy_memory_types::MEMORY_LOG_TARGET,
                    error = %e,
                    batch_size = texts.len(),
                    "embedding batch failed, skipping"
                );
            }
        }
    }

    if embedded > 0 {
        tracing::info!(
            target: nofy_memory_types::MEMORY_LOG_TARGET,
            embedded,
            total,
            "embedded missing chunks"
        );
    }
    embedded
}
