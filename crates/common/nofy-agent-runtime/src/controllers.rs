//! Root-owned authority for explicitly resuming a settled descendant model
//! failure. Old group receipts remain immutable; new groups have fresh epochs.
use crate::{Checkpoint, Checkpointer, Error, RunContext, RunState, governance::ModelRetryCommand};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::{collections::BTreeMap, sync::Arc};
#[cfg(feature = "sqlite")]
mod cancel;
#[cfg(feature = "workflow")]
mod hooks;
#[cfg(feature = "workflow")]
pub(crate) use hooks::parent_fingerprint;
#[cfg(all(feature = "workflow", feature = "sqlite"))]
pub(crate) use hooks::parent_pending;

#[cfg(feature = "workflow")]
#[derive(Clone)]
pub(crate) struct ExecutionCheckpoint {
    pub key: String,
    pub composition: String,
    pub run_id: Option<String>,
}
#[derive(Clone, Serialize, Deserialize)]
pub(crate) struct HookRoute {
    pub run_id: String,
    pub parent_run_id: String,
    pub parent_thread_id: String,
    pub checkpoint_key: String,
    pub checkpoint_run_id: Option<String>,
    pub parent_composition: String,
    pub parent_fingerprint: String,
    pub composition: String,
    pub workflow_identity: String,
    pub controller_identity: String,
    pub bus_identity: String,
    pub hook_identity: String,
    pub source: crate::hooks::HookEvent,
    pub event: crate::hooks::HookEvent,
}
#[derive(Clone, Serialize, Deserialize)]
struct HookRetry {
    route: HookRoute,
    epoch: u64,
}

#[derive(Clone)]
pub(crate) struct ControllerBinding {
    store: Arc<dyn Checkpointer>,
    key: String,
    composition: String,
}
#[cfg(feature = "workflow")]
#[derive(Clone, Serialize, Deserialize)]
pub(crate) struct ControllerLocation {
    pub key: String,
    pub composition: String,
}
#[derive(Default, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Saved {
    sequence: u64,
    commands: BTreeMap<String, ModelRetryCommand>,
    epochs: BTreeMap<String, u64>,
    targets: BTreeMap<String, ModelRetryCommand>,
    #[serde(default)]
    failures: BTreeMap<String, FailureProof>,
    #[serde(default)]
    group_epochs: Option<BTreeMap<String, u64>>,
    #[serde(default)]
    graph_retries: BTreeMap<String, GraphRetry>,
    #[serde(default)]
    hook_routes: BTreeMap<String, HookRoute>,
    #[serde(default)]
    hook_retries: BTreeMap<String, HookRetry>,
    #[cfg(feature = "sqlite")]
    #[serde(default)]
    cancel_commands: BTreeMap<String, crate::supervisor::ChildCancelResumeCommand>,
    #[serde(default)]
    cancels: BTreeMap<String, CancelResume>,
}
#[derive(Clone, Serialize, Deserialize)]
pub(crate) struct CancelResume {
    pub address: crate::mailbox::InputAddress,
    pub through: u64,
}
#[derive(Clone, Serialize, Deserialize, PartialEq)]
pub(crate) struct GraphRoute {
    pub child_run_id: String,
    pub parent_run_id: String,
    pub parent_thread_id: String,
    pub key: String,
    pub composition: String,
    pub reference: crate::registry::ModuleRef,
    pub node: String,
    pub attempt: u32,
    pub failed: serde_json::Value,
    pub epoch: u64,
}
#[derive(Clone, Serialize, Deserialize)]
pub(crate) struct GraphRetry {
    pub route: GraphRoute,
    pub epoch: u64,
}
#[derive(Serialize, Deserialize, PartialEq, Eq)]
struct FailureProof {
    epoch: u64,
    composition: String,
}
impl ControllerBinding {
    #[cfg(feature = "workflow")]
    pub fn location(&self) -> ControllerLocation {
        ControllerLocation {
            key: self.key.clone(),
            composition: self.composition.clone(),
        }
    }
    #[cfg(feature = "workflow")]
    pub fn at(store: Arc<dyn Checkpointer>, location: ControllerLocation) -> Self {
        Self {
            store,
            key: location.key,
            composition: location.composition,
        }
    }
    #[cfg(feature = "sqlite")]
    pub fn new(store: Arc<dyn Checkpointer>, composition: &str, context: &RunContext) -> Self {
        Self {
            store,
            key: serde_json::to_string(&(
                "child-controls-v1",
                composition,
                &context.thread_id,
                &context.run_id,
            ))
            .expect("controller key"),
            composition: composition.into(),
        }
    }
    async fn load(&self) -> Result<(Option<u64>, Saved), Error> {
        match self.store.load(&self.key).await? {
            None => Ok((None, Saved::default())),
            Some(cp) if cp.version == 1 && cp.composition == self.composition => Ok((
                Some(cp.revision),
                serde_json::from_value(cp.state.data)
                    .map_err(|e| Error::Checkpoint(e.to_string()))?,
            )),
            Some(_) => Err(Error::Checkpoint(
                "controller journal composition changed".into(),
            )),
        }
    }
    #[cfg(feature = "sqlite")]
    pub async fn accepted(&self, command: &ModelRetryCommand) -> Result<bool, Error> {
        let (_, saved) = self.load().await?;
        if saved.cancel_commands.contains_key(&command.command_id) {
            return Err(Error::Checkpoint(
                "control command ID belongs to another command kind".into(),
            ));
        }
        match saved.commands.get(&command.command_id) {
            None => Ok(false),
            Some(old) if old == command => Ok(true),
            Some(_) => Err(Error::Checkpoint(
                "child retry command ID reused with another ticket".into(),
            )),
        }
    }
    #[cfg(feature = "sqlite")]
    pub async fn authorize(
        &self,
        command: &ModelRetryCommand,
        root: &str,
        path: &[String],
        routes: &[GraphRoute],
        hook_routes: &[HookRoute],
    ) -> Result<(), Error> {
        if command.command_id.trim().is_empty()
            || command.command_id.len() > 256
            || path.is_empty()
            || path.len() > 128
        {
            return Err(Error::Checkpoint("invalid child retry command/path".into()));
        }
        let (revision, mut saved) = self.load().await?;
        if saved.cancel_commands.contains_key(&command.command_id) {
            return Err(Error::Checkpoint(
                "control command ID belongs to another command kind".into(),
            ));
        }
        if let Some(old) = saved.commands.get(&command.command_id) {
            return if old == command {
                Ok(())
            } else {
                Err(Error::Checkpoint(
                    "child retry command cannot change".into(),
                ))
            };
        }
        if saved.commands.len() + saved.cancel_commands.len() >= 8192 {
            return Err(Error::Checkpoint(
                "child retry command capacity exceeded".into(),
            ));
        }
        advance(&mut saved, root, path, routes, hook_routes)?;
        saved
            .targets
            .insert(command.ticket.run_id.clone(), command.clone());
        saved.cancels.remove(&command.ticket.run_id);
        saved
            .commands
            .insert(command.command_id.clone(), command.clone());
        self.write(revision, saved).await
    }
    async fn write(&self, revision: Option<u64>, saved: Saved) -> Result<(), Error> {
        let data = serde_json::to_value(saved).map_err(|e| Error::Checkpoint(e.to_string()))?;
        if serde_json::to_vec(&data).map_or(true, |bytes| bytes.len() > 16 * 1024 * 1024) {
            return Err(Error::Checkpoint(
                "controller journal exceeds 16 MiB".into(),
            ));
        }
        self.store
            .save(
                &self.key,
                revision,
                Checkpoint {
                    version: 1,
                    revision: revision
                        .unwrap_or(0)
                        .checked_add(1)
                        .ok_or_else(|| Error::Checkpoint("controller revision exhausted".into()))?,
                    composition: self.composition.clone(),
                    state: RunState {
                        data,
                        ..Default::default()
                    },
                },
            )
            .await
    }
    pub async fn record_failure(
        &self,
        run_id: &str,
        epoch: u64,
        composition: &str,
    ) -> Result<(), Error> {
        let (revision, mut saved) = self.load().await?;
        let proof = FailureProof {
            epoch,
            composition: format!("{:x}", Sha256::digest(composition.as_bytes())),
        };
        if saved.failures.get(run_id) == Some(&proof) {
            return Ok(());
        }
        if saved.failures.len() >= 8192 && !saved.failures.contains_key(run_id) {
            return Err(Error::Checkpoint(
                "controller failure capacity exceeded".into(),
            ));
        }
        saved.failures.insert(run_id.into(), proof);
        self.write(revision, saved).await
    }
    #[cfg(feature = "sqlite")]
    pub async fn settled_failure(&self, run_id: &str, composition: &str) -> Result<bool, Error> {
        let (_, saved) = self.load().await?;
        let epoch = saved
            .group_epochs
            .as_ref()
            .unwrap_or(&saved.epochs)
            .get(run_id)
            .copied()
            .unwrap_or(0);
        Ok(saved.failures.get(run_id)
            == Some(&FailureProof {
                epoch,
                composition: format!("{:x}", Sha256::digest(composition.as_bytes())),
            }))
    }
    pub async fn group_epoch(&self, run_id: &str) -> Result<u64, Error> {
        let (_, saved) = self.load().await?;
        Ok(saved
            .group_epochs
            .as_ref()
            .unwrap_or(&saved.epochs)
            .get(run_id)
            .copied()
            .unwrap_or(0))
    }
    #[cfg(feature = "workflow")]
    pub async fn graph_retry(&self, key: &str) -> Result<Option<GraphRetry>, Error> {
        Ok(self.load().await?.1.graph_retries.get(key).cloned())
    }
    pub async fn epoch(&self, run_id: &str) -> Result<u64, Error> {
        Ok(self
            .load()
            .await?
            .1
            .epochs
            .get(run_id)
            .copied()
            .unwrap_or(0))
    }
    pub async fn input(&self, run_id: &str) -> Result<Option<ModelRetryCommand>, Error> {
        Ok(self.load().await?.1.targets.get(run_id).cloned())
    }
    pub async fn cancel(&self, run_id: &str) -> Result<Option<CancelResume>, Error> {
        Ok(self.load().await?.1.cancels.get(run_id).cloned())
    }
    #[cfg(feature = "sqlite")]
    pub async fn cancel_inputs(&self) -> Result<Vec<CancelResume>, Error> {
        Ok(self.load().await?.1.cancels.into_values().collect())
    }
}
pub(crate) async fn epoch(context: &RunContext) -> Result<u64, Error> {
    match context.capabilities.get::<ControllerBinding>() {
        Some(binding) => binding.epoch(&context.run_id).await,
        None => Ok(0),
    }
}

#[cfg(feature = "sqlite")]
fn advance(
    saved: &mut Saved,
    root: &str,
    path: &[String],
    routes: &[GraphRoute],
    hook_routes: &[HookRoute],
) -> Result<(), Error> {
    saved.sequence = saved
        .sequence
        .checked_add(1)
        .ok_or_else(|| Error::Checkpoint("controller sequence exhausted".into()))?;
    // Old journals used one epoch for hooks and closed child groups. Keep
    // their identities while separating held groups from future generations.
    let mut groups = saved
        .group_epochs
        .take()
        .unwrap_or_else(|| saved.epochs.clone());
    for id in path {
        if saved
            .failures
            .get(id)
            .is_some_and(|proof| proof.epoch == groups.get(id).copied().unwrap_or(0))
        {
            groups.insert(id.clone(), saved.sequence);
        }
        saved.epochs.insert(id.clone(), saved.sequence);
    }
    saved.group_epochs = Some(groups);
    saved.epochs.insert(root.into(), saved.sequence);
    for route in routes {
        saved.graph_retries.insert(
            route.key.clone(),
            GraphRetry {
                route: route.clone(),
                epoch: saved.sequence,
            },
        );
    }
    for route in hook_routes {
        let key = serde_json::to_string(&("hook-v1", &route.event.id, &route.hook_identity))
            .expect("Hook key");
        saved.hook_retries.insert(
            key,
            HookRetry {
                route: route.clone(),
                epoch: saved.sequence,
            },
        );
    }
    Ok(())
}
