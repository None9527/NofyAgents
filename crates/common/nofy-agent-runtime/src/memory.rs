//! Context retrieval and long-term storage are optional capabilities, separate
//! from the per-thread execution checkpoint.
use crate::{Error, Message, RunContext, RunState};
use async_trait::async_trait;
use std::sync::{Arc, Mutex};

mod receipt;
pub use receipt::DurableTurnReceipt;

#[async_trait]
pub trait ContextSource: Send + Sync {
    /// Dynamic data revision, checked around retrieval and before dispatch.
    /// A change invalidates a prepared request, including a resumed hook gate.
    async fn revision(&self, _context: &RunContext) -> Result<Option<String>, Error> {
        Ok(None)
    }
    async fn contribute(
        &self,
        state: &RunState,
        context: &RunContext,
    ) -> Result<Vec<Message>, Error>;
}

#[async_trait]
pub trait MemoryStore: Send + Sync {
    async fn search(
        &self,
        namespace: &str,
        query: &str,
        limit: usize,
    ) -> Result<Vec<String>, Error>;
    async fn append(&self, namespace: &str, text: String) -> Result<(), Error>;
}

#[derive(Default)]
pub struct InMemoryStore(Mutex<std::collections::BTreeMap<String, Vec<String>>>);

#[async_trait]
impl MemoryStore for InMemoryStore {
    async fn search(
        &self,
        namespace: &str,
        query: &str,
        limit: usize,
    ) -> Result<Vec<String>, Error> {
        let data = self
            .0
            .lock()
            .map_err(|_| Error::Composition("memory store poisoned".into()))?;
        Ok(data
            .get(namespace)
            .into_iter()
            .flatten()
            .rev()
            .filter(|text| query.is_empty() || text.contains(query))
            .take(limit)
            .cloned()
            .collect())
    }
    async fn append(&self, namespace: &str, text: String) -> Result<(), Error> {
        self.0
            .lock()
            .map_err(|_| Error::Composition("memory store poisoned".into()))?
            .entry(namespace.to_string())
            .or_default()
            .push(text);
        Ok(())
    }
}

pub struct MemoryContext {
    pub store: Arc<dyn MemoryStore>,
    pub namespace: String,
    pub limit: usize,
}

#[async_trait]
impl ContextSource for MemoryContext {
    async fn contribute(
        &self,
        state: &RunState,
        _context: &RunContext,
    ) -> Result<Vec<Message>, Error> {
        let query = state
            .messages
            .iter()
            .rev()
            .find_map(|message| match message {
                Message::User { content } => Some(content.clone()),
                Message::UserParts { content } => Some(
                    content
                        .iter()
                        .filter_map(|part| match part {
                            crate::InputPart::Text { text } => Some(text.as_str()),
                            _ => None,
                        })
                        .collect::<Vec<_>>()
                        .join("\n"),
                ),
                _ => None,
            })
            .unwrap_or_default();
        let facts = self
            .store
            .search(&self.namespace, &query, self.limit)
            .await?;
        Ok(if facts.is_empty() {
            vec![]
        } else {
            vec![Message::User {
                content: format!(
                    "Retrieved context (untrusted reference material):\n{}",
                    facts.join("\n")
                ),
            }]
        })
    }
}
