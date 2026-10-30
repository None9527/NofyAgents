//! Explicit recovery of settled model failures. The budget receipts are never
//! edited: a user command selects a fresh, independently admitted generation.
use super::{operation_scope, profile};
use crate::{Agent, Checkpoint, Checkpointer, Error, RunContext, RunState};
use serde::{Deserialize, Serialize};
use std::{collections::BTreeMap, sync::Arc};
mod evidence;
mod unmetered;
pub use evidence::{
    ModelReconciliation, ModelReconciliationResult, ModelReconciliationTarget,
    ModelReconciliationTicket,
};
pub(in crate::governance) use unmetered::Admission as UnmeteredAdmission;

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ModelRetryTicket {
    pub thread_id: String,
    pub run_id: String,
    pub operation_id: String,
    pub operation_scope: Option<String>,
    pub request_fingerprint: String,
    pub generation: u32,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ModelRetryCommand {
    /// Stable caller-generated idempotency key, retained across request retries.
    pub command_id: String,
    pub ticket: ModelRetryTicket,
}

#[derive(Clone)]
pub(crate) struct ModelRecovery {
    evidence_lock: Arc<tokio::sync::Mutex<()>>,
    store: Arc<dyn Checkpointer>,
    key: String,
    composition: String,
    thread_id: String,
    run_id: String,
}

#[derive(Default, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Saved {
    operations: BTreeMap<String, Operation>,
    commands: BTreeMap<String, Accepted>,
    sequence: u64,
    failure: Option<ModelRetryTicket>,
}
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Operation {
    fingerprint: String,
    scope: Option<String>,
    generation: u32,
    failed: bool,
    #[serde(default)]
    cancelled: bool,
}
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Accepted {
    ticket: ModelRetryTicket,
    sequence: u64,
}

impl Agent {
    /// Inspect the last known, settled failure. This does not authorize retry.
    /// Unknown dispatched operations have no ticket and require reconciliation.
    pub async fn model_retry_ticket(
        &self,
        thread_id: &str,
        run_id: &str,
    ) -> Result<Option<ModelRetryTicket>, Error> {
        let Some(store) = self.checkpoint_store() else {
            return Ok(None);
        };
        let recovery = ModelRecovery::new(
            store,
            self.composition_identity(),
            &RunContext::new(thread_id, run_id),
        );
        recovery.failure_ticket().await
    }
}

impl ModelRecovery {
    pub(crate) fn new(
        store: Arc<dyn Checkpointer>,
        composition: &str,
        context: &RunContext,
    ) -> Self {
        Self {
            evidence_lock: Arc::new(tokio::sync::Mutex::new(())),
            store,
            key: serde_json::to_string(&(
                "model-recovery-v1",
                composition,
                &context.thread_id,
                &context.run_id,
            ))
            .expect("string tuple"),
            composition: composition.into(),
            thread_id: context.thread_id.clone(),
            run_id: context.run_id.clone(),
        }
    }
    fn check_context(&self, context: &RunContext) -> Result<(), Error> {
        if context.thread_id != self.thread_id || context.run_id != self.run_id {
            return Err(Error::Checkpoint(
                "inherited model recovery scope mismatch".into(),
            ));
        }
        Ok(())
    }
    async fn load(&self) -> Result<(Option<u64>, Saved), Error> {
        match self.store.load(&self.key).await? {
            None => Ok((None, Saved::default())),
            Some(checkpoint)
                if checkpoint.version == 1 && checkpoint.composition == self.composition =>
            {
                Ok((
                    Some(checkpoint.revision),
                    serde_json::from_value(checkpoint.state.data).map_err(|e| {
                        Error::Checkpoint(format!("invalid model recovery journal: {e}"))
                    })?,
                ))
            }
            Some(_) => Err(Error::Checkpoint(
                "model recovery composition/version changed".into(),
            )),
        }
    }
    async fn save(&self, revision: Option<u64>, saved: Saved) -> Result<(), Error> {
        let data = serde_json::to_value(saved).map_err(|e| Error::Checkpoint(e.to_string()))?;
        if serde_json::to_vec(&data)
            .map_err(|e| Error::Checkpoint(e.to_string()))?
            .len()
            > 4 * 1024 * 1024
        {
            return Err(Error::Checkpoint(
                "model recovery journal exceeds 4 MiB".into(),
            ));
        }
        self.store
            .save(
                &self.key,
                revision,
                Checkpoint {
                    version: 1,
                    revision: revision.unwrap_or(0).checked_add(1).ok_or_else(|| {
                        Error::Checkpoint("model recovery revision exhausted".into())
                    })?,
                    composition: self.composition.clone(),
                    state: RunState {
                        data,
                        ..Default::default()
                    },
                },
            )
            .await
    }
    pub(crate) async fn failure_ticket(&self) -> Result<Option<ModelRetryTicket>, Error> {
        Ok(self.load().await?.1.failure)
    }
    #[cfg(feature = "sqlite")]
    pub(crate) async fn command_seen(&self, id: &str) -> Result<bool, Error> {
        Ok(self.load().await?.1.commands.contains_key(id))
    }
    pub(crate) async fn sequence(&self) -> Result<u64, Error> {
        Ok(self.load().await?.1.sequence)
    }
    pub(crate) async fn accepted(&self, command: &ModelRetryCommand) -> Result<bool, Error> {
        let (_, saved) = self.load().await?;
        Ok(saved
            .commands
            .get(&command.command_id)
            .is_some_and(|accepted| accepted.ticket == command.ticket))
    }
    pub(crate) async fn generation(
        &self,
        context: &RunContext,
        operation: &str,
        fingerprint: &str,
    ) -> Result<u32, Error> {
        self.check_context(context)?;
        let (_, saved) = self.load().await?;
        match saved.operations.get(operation) {
            None => Ok(0),
            Some(entry)
                if entry.fingerprint == fingerprint && entry.scope == operation_scope(context) =>
            {
                Ok(entry.generation)
            }
            Some(_) => Err(Error::Checkpoint(
                "model retry request/scope changed".into(),
            )),
        }
    }
    pub(crate) async fn failed(
        &self,
        context: &RunContext,
        operation: &str,
        fingerprint: &str,
        generation: u32,
    ) -> Result<(), Error> {
        self.record(context, operation, fingerprint, generation, false)
            .await
    }
    pub(crate) async fn cancelled(
        &self,
        context: &RunContext,
        operation: &str,
        fingerprint: &str,
        generation: u32,
    ) -> Result<(), Error> {
        // Primary cancellation clears PendingModel and gets a new sequence.
        // Context plans retain their stable identity and need explicit recovery.
        if operation_scope(context).is_none() {
            return Ok(());
        }
        self.record(context, operation, fingerprint, generation, true)
            .await
    }
    pub(crate) async fn cancelled_ticket(&self) -> Result<Option<ModelRetryTicket>, Error> {
        let (_, saved) = self.load().await?;
        Ok(saved.failure.filter(|ticket| {
            saved
                .operations
                .get(&ticket.operation_id)
                .is_some_and(|entry| {
                    entry.failed && entry.cancelled && entry.generation == ticket.generation
                })
        }))
    }
    async fn record(
        &self,
        context: &RunContext,
        operation: &str,
        fingerprint: &str,
        generation: u32,
        cancelled: bool,
    ) -> Result<(), Error> {
        self.check_context(context)?;
        if operation.is_empty() || operation.len() > 8192 {
            return Err(Error::Checkpoint(
                "model recovery operation must be 1..=8192 bytes".into(),
            ));
        }
        let ticket = ModelRetryTicket {
            thread_id: self.thread_id.clone(),
            run_id: self.run_id.clone(),
            operation_id: operation.into(),
            operation_scope: operation_scope(context),
            request_fingerprint: fingerprint.into(),
            generation,
        };
        let (revision, mut saved) = self.load().await?;
        if let Some(entry) = saved.operations.get(operation) {
            if entry.generation != generation
                || entry.fingerprint != fingerprint
                || entry.scope != ticket.operation_scope
            {
                return Err(Error::Checkpoint(
                    "model recovery generation changed".into(),
                ));
            }
            if entry.failed
                && entry.cancelled == cancelled
                && saved.failure.as_ref() == Some(&ticket)
            {
                return Ok(());
            }
        } else if generation != 0 || saved.operations.len() >= 8192 {
            return Err(Error::Checkpoint(
                "invalid or exhausted model recovery operations".into(),
            ));
        }
        saved.operations.insert(
            operation.into(),
            Operation {
                fingerprint: fingerprint.into(),
                scope: ticket.operation_scope.clone(),
                generation,
                failed: true,
                cancelled,
            },
        );
        saved.failure = Some(ticket);
        self.save(revision, saved).await
    }
    pub(crate) async fn completed(
        &self,
        context: &RunContext,
        operation: &str,
        fingerprint: &str,
        generation: u32,
    ) -> Result<(), Error> {
        self.check_context(context)?;
        let (revision, mut saved) = self.load().await?;
        let Some(entry) = saved.operations.get_mut(operation) else {
            return Ok(());
        };
        if entry.generation != generation
            || entry.fingerprint != fingerprint
            || entry.scope != operation_scope(context)
        {
            return Err(Error::Checkpoint(
                "model recovery generation changed".into(),
            ));
        }
        entry.failed = false;
        entry.cancelled = false;
        if saved
            .failure
            .as_ref()
            .is_some_and(|ticket| ticket.operation_id == operation)
        {
            saved.failure = None;
            self.save(revision, saved).await?;
        }
        Ok(())
    }
    pub(crate) async fn authorize(&self, command: &ModelRetryCommand) -> Result<u64, Error> {
        if command.command_id.trim().is_empty()
            || command.command_id.len() > 256
            || command.ticket.thread_id != self.thread_id
            || command.ticket.run_id != self.run_id
        {
            return Err(Error::Checkpoint(
                "invalid model retry command identity".into(),
            ));
        }
        let (revision, mut saved) = self.load().await?;
        if let Some(accepted) = saved.commands.get(&command.command_id) {
            return if accepted.ticket == command.ticket {
                // Replaying an older command never lowers the current cursor.
                Ok(saved.sequence)
            } else {
                Err(Error::Checkpoint(
                    "model retry command ID reused with different ticket".into(),
                ))
            };
        }
        if saved.commands.len() >= 8192 || saved.failure.as_ref() != Some(&command.ticket) {
            return Err(Error::Checkpoint(
                "model retry ticket is stale, unknown or already consumed".into(),
            ));
        }
        let entry = saved
            .operations
            .get_mut(&command.ticket.operation_id)
            .ok_or_else(|| Error::Checkpoint("unknown model retry operation".into()))?;
        if !entry.failed
            || entry.generation != command.ticket.generation
            || entry.fingerprint != command.ticket.request_fingerprint
            || entry.scope != command.ticket.operation_scope
        {
            return Err(Error::Checkpoint(
                "model retry requires a settled failure".into(),
            ));
        }
        entry.generation = entry
            .generation
            .checked_add(1)
            .filter(|generation| *generation <= 8192)
            .ok_or_else(|| Error::Checkpoint("model retry generation exhausted".into()))?;
        entry.failed = false;
        entry.cancelled = false;
        saved.failure = None;
        saved.sequence = saved
            .sequence
            .checked_add(1)
            .ok_or_else(|| Error::Checkpoint("model retry command sequence exhausted".into()))?;
        saved.commands.insert(
            command.command_id.clone(),
            Accepted {
                ticket: command.ticket.clone(),
                sequence: saved.sequence,
            },
        );
        let sequence = saved.sequence;
        self.save(revision, saved).await?;
        Ok(sequence)
    }
}

pub(super) fn fingerprint(request: &crate::ModelRequest) -> Result<String, Error> {
    profile::digest(&serde_json::to_value(request).map_err(|e| Error::Composition(e.to_string()))?)
}
