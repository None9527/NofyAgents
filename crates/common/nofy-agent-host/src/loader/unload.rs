//! Explicit persistent-object unloading, separately journaled from cache GC.
use super::*;
use crate::KernelHost;
use nofy_agent_runtime::{control::ControlError, system::content_digest};
use references::{ObjectKey, ReferenceReport, ReferenceRequest};
use serde::{Deserialize, Serialize};
use std::{
    collections::{BTreeMap, BTreeSet},
    fs::File,
};
mod inventory;
mod journal;
#[cfg(all(test, target_os = "linux", target_arch = "x86_64"))]
mod tests;

#[derive(Clone)]
pub struct ObjectStore {
    root: PathBuf,
    loader_root: PathBuf,
    #[cfg(test)]
    test_exit: Option<&'static str>,
    #[cfg(test)]
    test_pause: Option<(
        Arc<tokio::sync::Notify>,
        Arc<std::sync::Mutex<Option<std::sync::mpsc::Receiver<()>>>>,
    )>,
}
pub(super) struct MaintenanceLease {
    _commit: admission::CommitLease,
    _use: File,
}
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(deny_unknown_fields)]
pub struct UnloadRequest {
    pub objects: Vec<ObjectKey>,
}
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(deny_unknown_fields)]
pub struct UnloadCommand {
    pub command_id: String,
    pub expected_revision: u64,
    pub fingerprint: String,
    pub objects: Vec<ObjectKey>,
}
#[derive(Clone, Copy, Debug, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
#[serde(rename_all = "snake_case")]
pub enum PartKind {
    ArtifactObject,
    ArtifactTree,
    ImageObject,
    ImageTree,
    RuntimeBinary,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ObjectPart {
    pub kind: PartKind,
    pub digest: String,
    pub files: u64,
    pub bytes: u64,
    pub fingerprint: String,
    pub device: u64,
    pub inode: u64,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RuntimeRemoval {
    pub id: String,
    pub revision: String,
    pub executable_digest: String,
    pub fingerprint: String,
}
#[derive(Serialize)]
pub struct UnloadPlan {
    pub revision: u64,
    pub objects: Vec<ObjectKey>,
    pub parts: Vec<ObjectPart>,
    pub bindings: Vec<RuntimeRemoval>,
    pub references: ReferenceReport,
    pub eligible: bool,
    pub fingerprint: String,
}
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum UnloadState {
    Pending,
    Complete,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UnloadReceipt {
    pub revision: u64,
    pub command: UnloadCommand,
    pub state: UnloadState,
    pub parts: Vec<ObjectPart>,
    pub bindings: Vec<RuntimeRemoval>,
    pub bindings_checked: bool,
    pub source_checked: BTreeSet<usize>,
    pub retained_new: BTreeSet<usize>,
    pub cut: UnloadCut,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UnloadCut {
    pub catalog_revision: Option<u64>,
    pub source_revision: u64,
    pub runtime_fingerprint: String,
    pub reference_fingerprint: String,
}
#[derive(Serialize)]
pub struct UnloadStatus {
    pub revision: u64,
    pub pending: Option<UnloadReceipt>,
    pub admission_blocked: bool,
}
fn invalid(message: &str) -> HostError {
    HostError::Invalid(message.into())
}
fn validate_objects(objects: &[ObjectKey]) -> Result<()> {
    if objects.is_empty() || objects.len() > 8 {
        return Err(invalid("unload requires 1..=8 objects"));
    }
    let mut unique = BTreeSet::new();
    for key in objects {
        key.validate()?;
        if !unique.insert(key) {
            return Err(invalid("duplicate unload object"));
        }
    }
    Ok(())
}
impl UnloadCommand {
    fn validate(&self) -> Result<()> {
        sources::name(&self.command_id)?;
        storage::digest(&self.fingerprint)?;
        validate_objects(&self.objects)
    }
}
impl ObjectStore {
    pub(super) fn open(loader_root: &Path) -> Result<Self> {
        let root = storage::directory(&loader_root.join("lifecycle/objects"))?;
        storage::directory(&root.join("trash"))?;
        storage::atomic(
            &root.join("protocol.json"),
            b"\"nofy.loader-unload/v1\"",
            0o600,
            false,
        )?;
        Ok(Self {
            root,
            loader_root: loader_root.into(),
            #[cfg(test)]
            test_exit: None,
            #[cfg(test)]
            test_pause: None,
        })
    }
    pub fn status(&self) -> Result<UnloadStatus> {
        let data = self.read()?;
        Ok(UnloadStatus {
            revision: data.revision,
            pending: data.pending().cloned(),
            admission_blocked: data.pending().is_some()
                || journal::barrier_pending(self.root.parent().expect("unload lifecycle"))?
                    .unwrap_or(false),
        })
    }
    pub fn receipt(&self, revision: u64) -> Result<UnloadReceipt> {
        self.read()?
            .receipts
            .remove(&revision)
            .ok_or(HostError::NotFound)
    }
    fn replay(&self, command: &UnloadCommand) -> Result<Option<UnloadReceipt>> {
        let data = self.read()?;
        let revision = command
            .expected_revision
            .checked_add(1)
            .ok_or_else(|| invalid("unload revision exhausted"))?;
        if let Some(receipt) = data.receipts.get(&revision) {
            if receipt.command != *command {
                return Err(HostError::Control(ControlError::CommandConflict));
            }
            return Ok(Some(receipt.clone()));
        }
        if data.revision != command.expected_revision {
            return Err(HostError::Control(ControlError::Conflict {
                expected: Some(command.expected_revision),
                actual: Some(data.revision),
            }));
        }
        if data.pending().is_some() {
            return Err(HostError::Control(ControlError::Busy));
        }
        Ok(None)
    }
}
pub(super) fn ensure_no_pending(lifecycle: &Path) -> Result<()> {
    let pending = match journal::barrier_pending(lifecycle)? {
        Some(pending) => pending,
        None => journal::read_at(lifecycle)?.pending().is_some(),
    };
    if pending {
        return Err(HostError::Unavailable(
            "persistent unloading requires recovery before admission or use".into(),
        ));
    }
    Ok(())
}
impl Loader {
    fn unload_lease(&self) -> Result<MaintenanceLease> {
        let usage = self.cache.maintenance_lease()?;
        let commit = self.commits.exclusive()?;
        if self.cache.has_pending()? {
            return Err(HostError::Unavailable(
                "cache collection requires recovery first".into(),
            ));
        }
        Ok(MaintenanceLease {
            _commit: commit,
            _use: usage,
        })
    }
    pub(super) fn recover_objects(&self) -> Result<()> {
        let state = self.unload.read()?;
        if state.pending().is_some() {
            let lease = self.unload_lease()?;
            let state = self.unload.read()?;
            if state.pending().is_some() {
                self.unload.resume(self, state, &lease)?;
            } else {
                self.unload.settle_barrier(&state)?;
            }
            drop(lease);
            self.runtimes.refresh()?;
        } else if journal::barrier_pending(self.unload.root.parent().expect("unload lifecycle"))?
            != Some(false)
        {
            // Seeding a derived barrier must not prevent an existing cache-GC
            // intent from reopening its host and reaching its recovery API.
            let _commit = self.commits.exclusive()?;
            let current = self.unload.read()?;
            if current.pending().is_some() {
                return Err(HostError::Control(ControlError::Busy));
            }
            self.unload.settle_barrier(&current)?;
        }
        Ok(())
    }
}
impl KernelHost {
    pub async fn plan_unload(&self, request: UnloadRequest) -> Result<UnloadPlan> {
        if self.stop.is_cancelled() {
            return Err(HostError::Unavailable("host is shutting down".into()));
        }
        validate_objects(&request.objects)?;
        let management = self
            .loader
            .management_work
            .clone()
            .try_acquire_owned()
            .map_err(|_| HostError::Control(ControlError::Busy))?;
        let reference = self
            .loader
            .reference_work
            .clone()
            .try_acquire_owned()
            .map_err(|_| HostError::Control(ControlError::Busy))?;
        let host = self.clone();
        tokio::spawn(async move {
            let (_management, _reference) = (management, reference);
            let loader = host.loader.clone();
            let lease = Arc::new(
                tokio::task::spawn_blocking(move || loader.unload_lease())
                    .await
                    .map_err(storage::unavailable)??,
            );
            host.unload_plan_inner(request.objects, &lease).await
        })
        .await
        .map_err(storage::unavailable)?
    }
    async fn unload_plan_inner(
        &self,
        objects: Vec<ObjectKey>,
        lease: &Arc<MaintenanceLease>,
    ) -> Result<UnloadPlan> {
        let store = self.loader.unload.clone();
        let state = tokio::task::spawn_blocking(move || store.read())
            .await
            .map_err(storage::unavailable)??;
        if state.pending().is_some() {
            return Err(HostError::Control(ControlError::Busy));
        }
        let references = self
            .inspect_references_inner(ReferenceRequest {
                objects: objects.clone(),
                sample_limit: 8,
            })
            .await?;
        let loader = self.loader.clone();
        let selected = objects.clone();
        let guard = lease.clone();
        let ((parts, bindings), revision) = tokio::task::spawn_blocking(move || {
            loader.unload.settle_barrier(&state)?;
            loader
                .unload
                .inventory(&loader, &selected, &guard)
                .map(|v| (v, state.revision))
        })
        .await
        .map_err(storage::unavailable)??;
        let eligible = references
            .references
            .iter()
            .all(|r| r.state == "not_observed");
        let fingerprint = content_digest(&(
            "nofy.loader-unload-plan/v1",
            revision,
            &objects,
            &parts,
            &bindings,
            &references,
        ))?;
        Ok(UnloadPlan {
            revision,
            objects,
            parts,
            bindings,
            references,
            eligible,
            fingerprint,
        })
    }
    pub async fn unload_objects(&self, command: UnloadCommand) -> Result<UnloadReceipt> {
        if self.stop.is_cancelled() {
            return Err(HostError::Unavailable("host is shutting down".into()));
        }
        command.validate()?;
        let management = self
            .loader
            .management_work
            .clone()
            .try_acquire_owned()
            .map_err(|_| HostError::Control(ControlError::Busy))?;
        let reference = self
            .loader
            .reference_work
            .clone()
            .try_acquire_owned()
            .map_err(|_| HostError::Control(ControlError::Busy))?;
        let host = self.clone();
        tokio::spawn(async move {
            let (_management, _reference) = (management, reference);
            let store = host.loader.unload.clone();
            let candidate = command.clone();
            let complete = tokio::task::spawn_blocking(move || -> Result<_> {
                if let Some(receipt) = store.replay(&candidate)? {
                    if receipt.state == UnloadState::Complete
                        && journal::barrier_pending(store.root.parent().expect("unload lifecycle"))?
                            == Some(false)
                    {
                        return Ok(Some(receipt));
                    }
                }
                Ok(None)
            })
            .await
            .map_err(storage::unavailable)??;
            if let Some(receipt) = complete {
                return Ok(receipt);
            }
            let loader = host.loader.clone();
            let lease = Arc::new(
                tokio::task::spawn_blocking(move || loader.unload_lease())
                    .await
                    .map_err(storage::unavailable)??,
            );
            let store = host.loader.unload.clone();
            let candidate = command.clone();
            let guard = lease.clone();
            let replay = tokio::task::spawn_blocking(move || {
                let _guard = guard;
                store.replay(&candidate)
            })
            .await
            .map_err(storage::unavailable)??;
            if let Some(receipt) = replay {
                if receipt.state == UnloadState::Complete {
                    let store = host.loader.unload.clone();
                    tokio::task::spawn_blocking(move || {
                        let _lease = lease;
                        store.settle_barrier(&store.read()?)
                    })
                    .await
                    .map_err(storage::unavailable)??;
                    return Ok(receipt);
                }
            } else {
                let plan = host
                    .unload_plan_inner(command.objects.clone(), &lease)
                    .await?;
                if !plan.eligible
                    || plan.fingerprint != command.fingerprint
                    || plan.revision != command.expected_revision
                {
                    return Err(HostError::Control(ControlError::CommandConflict));
                }
                let store = host.loader.unload.clone();
                let guard = lease.clone();
                tokio::task::spawn_blocking(move || {
                    let _guard = guard;
                    store.begin(command, plan)
                })
                .await
                .map_err(storage::unavailable)??;
            }
            let loader = host.loader.clone();
            tokio::task::spawn_blocking(move || {
                loader.unload.resume(&loader, loader.unload.read()?, &lease)
            })
            .await
            .map_err(storage::unavailable)?
        })
        .await
        .map_err(storage::unavailable)?
    }
}
