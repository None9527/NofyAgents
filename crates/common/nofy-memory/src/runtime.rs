//! Configurable adapters over the canonical self-developed memory engine.
//! Resources are installed explicitly; factories only bind immutable handles.
use crate::service::NofyMemoryService;
use nofy_agent_runtime::{Error, RunContext, events::RunLineage};
use nofy_memory_types::*;
use serde::{Deserialize, Serialize};
use std::{collections::BTreeMap, sync::Arc};

mod capture;
pub mod declarative;
mod factory;
mod operations;
pub use capture::CaptureEnqueueReceipt;
pub use factory::MemoryFactory;
pub use operations::MemoryOperation;

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
#[serde(default, deny_unknown_fields)]
pub struct MemoryGrants {
    pub read: Vec<MemoryArea>,
    pub write: Vec<MemoryArea>,
    pub child_read: Vec<MemoryArea>,
    pub child_write: Vec<MemoryArea>,
    pub capture: bool,
    pub consolidate: bool,
}
impl MemoryGrants {
    pub fn project_read_only() -> Self {
        Self {
            read: vec![MemoryArea::Project],
            ..Self::default()
        }
    }
}

pub struct InstalledMemory {
    service: Arc<NofyMemoryService>,
    grants: MemoryGrants,
    identity: String,
    excluded_categories: std::collections::BTreeSet<crate::config::MemorySensitiveCategory>,
}
impl InstalledMemory {
    /// The service owns the canonical files, generation ledger and indexes.
    /// The revision must change when host connection semantics change.
    pub fn install(
        service: Arc<NofyMemoryService>,
        revision: &str,
        grants: MemoryGrants,
        excluded_categories: std::collections::BTreeSet<crate::config::MemorySensitiveCategory>,
    ) -> Result<Self, Error> {
        let connection = service.runtime_resource_identity();
        Self::install_with_identity(service, &connection, revision, grants, excluded_categories)
    }
    /// A managed backend supplies a portable connection identity, separately
    /// from its private storage path. The original install identity is unchanged.
    pub fn install_logical(
        service: Arc<NofyMemoryService>,
        connection: &str,
        revision: &str,
        grants: MemoryGrants,
        excluded_categories: std::collections::BTreeSet<crate::config::MemorySensitiveCategory>,
    ) -> Result<Self, Error> {
        if connection.trim().is_empty() || connection.len() > 4096 {
            return Err(composition("invalid logical memory connection identity"));
        }
        Self::install_with_identity(service, connection, revision, grants, excluded_categories)
    }
    fn install_with_identity(
        service: Arc<NofyMemoryService>,
        connection: &str,
        revision: &str,
        grants: MemoryGrants,
        excluded_categories: std::collections::BTreeSet<crate::config::MemorySensitiveCategory>,
    ) -> Result<Self, Error> {
        if revision.trim().is_empty() {
            return Err(composition("memory resource revision required"));
        }
        let identity = blake3::hash(
            &serde_json::to_vec(&(revision, connection, &grants, &excluded_categories))
                .map_err(|e| composition(e.to_string()))?,
        )
        .to_hex()
        .to_string();
        Ok(Self {
            service,
            grants,
            identity,
            excluded_categories,
        })
    }
    /// Starts the existing capture worker, with host-owned shutdown/lifetime.
    /// Compilation and ordinary inference never create background workers.
    pub fn start_capture_worker(
        &self,
        extractor: Arc<dyn crate::capture::CaptureExtractor>,
        lease_seconds: i64,
        max_retries: u32,
    ) -> Result<crate::capture::CaptureWorker, Error> {
        if !self.grants.capture {
            return Err(composition("memory capture is not admitted"));
        }
        let root = self
            .service
            .runtime_capture_root()
            .ok_or_else(|| composition("automatic memory learning is disabled"))?;
        if lease_seconds <= 0 {
            return Err(composition("capture lease must be positive"));
        }
        Ok(crate::capture::CaptureWorker::spawn(
            root,
            self.excluded_categories.clone(),
            extractor,
            lease_seconds,
            max_retries,
        ))
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(default, deny_unknown_fields)]
pub struct MemoryModuleConfig {
    pub resource: String,
    pub read: Vec<MemoryArea>,
    pub write: Vec<MemoryArea>,
    pub child_read: Vec<MemoryArea>,
    pub child_write: Vec<MemoryArea>,
    pub capture: bool,
    pub consolidate: bool,
    pub tool_name: String,
    pub operations: Vec<String>,
    pub max_items: usize,
}
impl Default for MemoryModuleConfig {
    fn default() -> Self {
        Self {
            resource: String::new(),
            read: vec![MemoryArea::Project],
            write: vec![],
            child_read: vec![],
            child_write: vec![],
            capture: false,
            consolidate: false,
            tool_name: "memory".into(),
            operations: ["search", "list", "get", "explain", "snapshot"]
                .map(str::to_owned)
                .to_vec(),
            max_items: 20,
        }
    }
}

#[derive(Clone)]
pub struct MemoryModule {
    resource: Arc<InstalledMemory>,
    config: MemoryModuleConfig,
}
impl MemoryModule {
    pub fn bind(resource: Arc<InstalledMemory>, config: MemoryModuleConfig) -> Result<Self, Error> {
        validate_module(&resource.grants, &config)?;
        Ok(Self { resource, config })
    }
    fn areas(&self, context: &RunContext, write: bool) -> &[MemoryArea] {
        areas(&self.config, context, write)
    }
}
fn validate_module(grants: &MemoryGrants, config: &MemoryModuleConfig) -> Result<(), Error> {
    for (requested, admitted) in [
        (&config.read, &grants.read),
        (&config.write, &grants.write),
        (&config.child_read, &grants.child_read),
        (&config.child_write, &grants.child_write),
        (&config.child_read, &config.read),
        (&config.child_write, &config.write),
    ] {
        if requested.iter().any(|area| !admitted.contains(area)) {
            return Err(composition("memory module exceeds installed area grants"));
        }
    }
    if config.max_items == 0
        || config.max_items > 100
        || config.capture && !grants.capture
        || config.consolidate && !grants.consolidate
        || config.operations.is_empty()
        || config
            .operations
            .iter()
            .any(|name| !operations::OPERATIONS.contains(&name.as_str()))
    {
        return Err(composition("invalid or unadmitted memory module options"));
    }
    if config.operations.iter().any(|name| {
        matches!(name.as_str(), "remember" | "revise" | "forget" | "undo")
            && config.write.is_empty()
            || name == "capture" && !config.capture
            || name == "consolidate" && (!config.consolidate || config.write.is_empty())
    }) {
        return Err(composition(
            "memory operations require matching write/capture/consolidate grants",
        ));
    }
    nofy_tool_protocol::ToolId::new(&config.tool_name).map_err(|e| composition(e.to_string()))?;
    Ok(())
}
fn areas<'a>(
    config: &'a MemoryModuleConfig,
    context: &RunContext,
    write: bool,
) -> &'a [MemoryArea] {
    let child = context
        .capabilities
        .get::<RunLineage>()
        .is_some_and(|lineage| lineage.parent_run_id.is_some());
    match (child, write) {
        (false, false) => &config.read,
        (false, true) => &config.write,
        (true, false) => &config.child_read,
        (true, true) => &config.child_write,
    }
}
#[async_trait::async_trait]
impl nofy_agent_runtime::memory::ContextSource for MemoryModule {
    async fn revision(&self, context: &RunContext) -> Result<Option<String>, Error> {
        if self.areas(context, false).is_empty() {
            return Ok(None);
        }
        let service = self.resource.service.clone();
        blocking(move || service.snapshot_generation())
            .await
            .map(|value| Some(value.to_string()))
    }
    async fn contribute(
        &self,
        state: &nofy_agent_runtime::RunState,
        context: &RunContext,
    ) -> Result<Vec<nofy_agent_runtime::Message>, Error> {
        use nofy_agent_runtime::Message;
        let areas = self.areas(context, false).to_vec();
        if areas.is_empty() {
            return Ok(vec![]);
        }
        // Retrieval is ephemeral. It is never appended to checkpoint messages.
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
                            nofy_agent_runtime::InputPart::Text { text } => Some(text.as_str()),
                            _ => None,
                        })
                        .collect::<Vec<_>>()
                        .join("\n"),
                ),
                _ => None,
            });
        let request = SnapshotRequest {
            query,
            max_items: self.config.max_items,
        };
        let service = self.resource.service.clone();
        let snapshot =
            blocking(move || futures::executor::block_on(service.snapshot_in(request, &areas)))
                .await?;
        Ok(if snapshot.references.is_empty() {
            vec![]
        } else {
            vec![Message::User {
                content: snapshot.content,
            }]
        })
    }
}

async fn blocking<T: Send + 'static>(
    operation: impl FnOnce() -> MemoryServiceResult<T> + Send + 'static,
) -> Result<T, Error> {
    tokio::task::spawn_blocking(operation)
        .await
        .map_err(|_| Error::Tool("memory worker failed".into()))?
        .map_err(|error| match error {
            MemoryServiceError::Internal(_) => {
                Error::Tool("canonical memory operation failed".into())
            }
            error => Error::Tool(error.to_string()),
        })
}
fn composition(message: impl Into<String>) -> Error {
    Error::Composition(message.into())
}

pub type MemoryResources = BTreeMap<String, Arc<InstalledMemory>>;
