//! Declarative control-plane domain service. Persistence and compilation are
//! separate boundaries; activating a release does not execute business tools.
#[cfg(feature = "control-file")]
mod file;
mod service;
use crate::system::*;
#[cfg(feature = "control-file")]
pub use file::FileCatalogStore;
use serde::{Deserialize, Serialize};
pub use service::ControlPlane;
use std::{collections::BTreeMap, sync::Arc};

#[derive(Debug, thiserror::Error)]
pub enum ControlError {
    #[error(transparent)]
    Runtime(#[from] crate::Error),
    #[error("configuration conflict: expected {expected:?}, actual {actual:?}")]
    Conflict {
        expected: Option<u64>,
        actual: Option<u64>,
    },
    #[error("configuration not found: {0}")]
    NotFound(String),
    #[error("control command ID was reused with different content")]
    CommandConflict,
    #[error("invalid control request: {0}")]
    Invalid(String),
    #[error("configuration compiler task failed: {0}")]
    CompileTask(String),
    #[error("configuration store is busy")]
    Busy,
    #[error("configuration store failed: {0}")]
    Storage(String),
    #[error("configuration commit may have succeeded; reload before retrying: {0}")]
    CommitUncertain(String),
}
pub type Result<T> = std::result::Result<T, ControlError>;
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Draft {
    pub revision: u64,
    pub document: SystemDocument,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Publication {
    pub created_revision: u64,
    pub bundle: SystemBundle,
}
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(deny_unknown_fields)]
pub struct Activation {
    pub generation: u64,
    pub release: String,
}
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(deny_unknown_fields)]
pub struct ApplyCommand {
    pub command_id: String,
    pub system: String,
    pub release: String,
    pub expected_generation: Option<u64>,
}
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(deny_unknown_fields)]
pub struct ApplyReceipt {
    pub command: ApplyCommand,
    pub previous: Option<Activation>,
    pub active: Activation,
    pub changed: SystemDiff,
    pub noop: bool,
}
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CatalogData {
    pub drafts: BTreeMap<String, Draft>,
    pub publications: BTreeMap<String, Publication>,
    pub active: BTreeMap<String, Activation>,
    pub commands: BTreeMap<String, ApplyReceipt>,
}
impl CatalogData {
    pub(crate) fn validate(&self) -> Result<()> {
        if self.drafts.len() > 1024
            || self.publications.len() > 4096
            || self.commands.len() > 8192
            || self.active.len() > 256
            || serde_json::to_vec(self).map_or(true, |v| v.len() > 64 * 1024 * 1024)
        {
            return Err(ControlError::Invalid("catalog capacity exceeded".into()));
        }
        for (name, draft) in &self.drafts {
            bounded_name(name)?;
            if draft.revision == 0 {
                return Err(ControlError::Invalid("zero draft revision".into()));
            }
        }
        for (id, publication) in &self.publications {
            publication.bundle.validate()?;
            if id != &publication.bundle.digest || publication.created_revision == 0 {
                return Err(ControlError::Invalid("publication identity changed".into()));
            }
        }
        for (name, active) in &self.active {
            bounded_name(name)?;
            let release = self
                .publications
                .get(&active.release)
                .ok_or_else(|| ControlError::Invalid("activation publication missing".into()))?;
            if active.generation == 0 || name != &release.bundle.document.name {
                return Err(ControlError::Invalid("activation identity changed".into()));
            }
        }
        for (id, receipt) in &self.commands {
            let release = self
                .publications
                .get(&receipt.active.release)
                .ok_or_else(|| ControlError::Invalid("command publication missing".into()))?;
            if id != &receipt.command.command_id
                || receipt.command.release != receipt.active.release
                || receipt.command.system != release.bundle.document.name
                || receipt.active.generation == 0
            {
                return Err(ControlError::Invalid(
                    "command receipt identity changed".into(),
                ));
            }
        }
        Ok(())
    }
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CatalogView {
    pub revision: u64,
    pub data: CatalogData,
}
#[async_trait::async_trait]
pub trait CatalogStore: Send + Sync {
    fn is_durable(&self) -> bool {
        false
    }
    async fn load(&self) -> Result<Option<CatalogView>>;
    async fn compare_exchange(
        &self,
        expected: Option<u64>,
        data: CatalogData,
    ) -> Result<CatalogView>;
}
#[derive(Clone, Default)]
pub struct InMemoryCatalogStore(Arc<tokio::sync::Mutex<Option<CatalogView>>>);
#[async_trait::async_trait]
impl CatalogStore for InMemoryCatalogStore {
    async fn load(&self) -> Result<Option<CatalogView>> {
        Ok(self.0.lock().await.clone())
    }
    async fn compare_exchange(
        &self,
        expected: Option<u64>,
        data: CatalogData,
    ) -> Result<CatalogView> {
        data.validate()?;
        let mut held = self.0.lock().await;
        let actual = held.as_ref().map(|v| v.revision);
        if actual != expected {
            return Err(ControlError::Conflict { expected, actual });
        }
        let revision = actual
            .unwrap_or(0)
            .checked_add(1)
            .ok_or_else(|| ControlError::Invalid("catalog revision exhausted".into()))?;
        let view = CatalogView { revision, data };
        *held = Some(view.clone());
        Ok(view)
    }
}
