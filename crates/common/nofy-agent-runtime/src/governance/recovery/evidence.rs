//! Operator evidence for a dispatched model attempt. This is separate from
//! retry authorization: no generation, request, budget or native result changes.
use super::*;
use crate::{ModelResponse, governance::BudgetCost, model::ModelFailure};

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ModelReconciliationTicket {
    pub request: ModelRetryTicket,
    pub attempt: u32,
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ModelReconciliationTarget {
    pub ticket: ModelReconciliationTicket,
    pub reserved: BudgetCost,
    pub unbounded_tokens: bool,
    pub evidence_accepted: bool,
    /// No budget was reserved; usage belongs to the normal model response.
    #[serde(default, skip_serializing_if = "std::ops::Not::not")]
    pub unmetered: bool,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ModelReconciliation {
    pub ticket: ModelReconciliationTicket,
    pub result: ModelReconciliationResult,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case", deny_unknown_fields)]
pub enum ModelReconciliationResult {
    Completed { response: ModelResponse },
    Failed { failure: ModelFailure },
}
impl ModelReconciliationTicket {
    fn validate(&self) -> Result<(), Error> {
        let request = &self.request;
        if request.thread_id.is_empty()
            || request.thread_id.len() > 4096
            || request.run_id.is_empty()
            || request.run_id.len() > 4096
            || request.operation_id.is_empty()
            || request.operation_id.len() > 8192
            || request
                .operation_scope
                .as_ref()
                .is_some_and(|s| s.is_empty() || s.len() > 8192)
            || request.request_fingerprint.len() != 64
            || !request
                .request_fingerprint
                .bytes()
                .all(|b| b.is_ascii_hexdigit())
            || self.attempt >= 5
        {
            return Err(invalid("invalid model evidence ticket"));
        }
        Ok(())
    }
}
impl ModelReconciliation {
    #[cfg(any(feature = "sqlite", test))]
    pub(crate) fn validate(&self) -> Result<(), Error> {
        self.ticket.validate()?;
        if serde_json::to_vec(self).map_err(invalid)?.len() > 1024 * 1024 {
            return Err(invalid("invalid model evidence identity, usage or size"));
        }
        match &self.result {
            ModelReconciliationResult::Completed { response } => {
                if response
                    .input_tokens
                    .checked_add(response.output_tokens)
                    .is_none()
                {
                    return Err(invalid("model evidence usage overflow"));
                }
                let mut ids = std::collections::BTreeSet::new();
                for call in &response.tool_calls {
                    crate::tool_program::validate_call(call)?;
                    if !ids.insert(&call.id) {
                        return Err(invalid("duplicate tool call in model evidence"));
                    }
                }
            }
            ModelReconciliationResult::Failed { failure }
                if failure.category.trim().is_empty()
                    || failure.category.len() > 256
                    || failure.message.len() > 65536 =>
            {
                return Err(invalid("invalid model failure evidence"));
            }
            ModelReconciliationResult::Failed { .. } => {}
        }
        Ok(())
    }
}
fn invalid(error: impl std::fmt::Display) -> Error {
    Error::Checkpoint(error.to_string())
}
fn key(ticket: &ModelReconciliationTicket) -> Result<String, Error> {
    serde_json::to_string(ticket).map_err(invalid)
}
#[derive(Default, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Saved {
    pending: BTreeMap<String, ModelReconciliationTarget>,
    receipts: BTreeMap<String, ModelReconciliation>,
    #[serde(default, skip_serializing_if = "BTreeMap::is_empty")]
    commands: BTreeMap<String, String>,
}
impl ModelRecovery {
    fn evidence_key(&self) -> String {
        serde_json::to_string(&("model-evidence-v1", &self.key)).expect("string tuple")
    }
    async fn load_evidence(&self) -> Result<(Option<u64>, Saved), Error> {
        match self.store.load(&self.evidence_key()).await? {
            None => Ok((None, Saved::default())),
            Some(cp) if cp.version == 1 && cp.composition == self.composition => Ok((
                Some(cp.revision),
                serde_json::from_value(cp.state.data).map_err(invalid)?,
            )),
            Some(_) => Err(invalid(
                "model evidence journal composition/version changed",
            )),
        }
    }
    async fn save_evidence(&self, revision: Option<u64>, saved: Saved) -> Result<(), Error> {
        let data = serde_json::to_value(saved).map_err(invalid)?;
        if serde_json::to_vec(&data).map_err(invalid)?.len() > 4 * 1024 * 1024 {
            return Err(invalid("model evidence journal exceeds 4 MiB"));
        }
        self.store
            .save(
                &self.evidence_key(),
                revision,
                Checkpoint {
                    version: 1,
                    revision: revision
                        .unwrap_or(0)
                        .checked_add(1)
                        .ok_or_else(|| invalid("model evidence revision exhausted"))?,
                    composition: self.composition.clone(),
                    state: RunState {
                        data,
                        ..Default::default()
                    },
                },
            )
            .await
    }
    pub(crate) fn evidence_ticket(
        &self,
        context: &RunContext,
        operation: &str,
        fingerprint: &str,
        generation: u32,
        attempt: u32,
    ) -> Result<ModelReconciliationTicket, Error> {
        self.check_context(context)?;
        let ticket = ModelReconciliationTicket {
            request: ModelRetryTicket {
                thread_id: self.thread_id.clone(),
                run_id: self.run_id.clone(),
                operation_id: operation.into(),
                operation_scope: operation_scope(context),
                request_fingerprint: fingerprint.into(),
                generation,
            },
            attempt,
        };
        ticket.validate()?;
        Ok(ticket)
    }
    pub(crate) async fn note_model_attempt(
        &self,
        target: ModelReconciliationTarget,
    ) -> Result<(), Error> {
        let _guard = self.evidence_lock.lock().await;
        let (revision, mut saved) = self.load_evidence().await?;
        let key = key(&target.ticket)?;
        if let Some(old) = saved.pending.get(&key) {
            let mut expected = target;
            expected.evidence_accepted = old.evidence_accepted;
            return if old == &expected {
                Ok(())
            } else {
                Err(invalid("model attempt reservation changed"))
            };
        }
        if saved.pending.len() >= 256 {
            return Err(invalid("pending model evidence capacity exceeded"));
        }
        saved.pending.insert(key, target);
        self.save_evidence(revision, saved).await
    }
    pub(crate) async fn model_evidence(
        &self,
        ticket: &ModelReconciliationTicket,
    ) -> Result<Option<ModelReconciliationResult>, Error> {
        let (_, saved) = self.load_evidence().await?;
        Ok(saved.receipts.get(&key(ticket)?).map(|r| r.result.clone()))
    }
    pub(crate) async fn finish_model_attempt(
        &self,
        ticket: &ModelReconciliationTicket,
    ) -> Result<(), Error> {
        let _guard = self.evidence_lock.lock().await;
        let (revision, mut saved) = self.load_evidence().await?;
        if saved.pending.remove(&key(ticket)?).is_none() {
            return Ok(());
        }
        self.save_evidence(revision, saved).await
    }
    #[cfg(any(feature = "sqlite", test))]
    pub(crate) async fn model_targets(&self) -> Result<Vec<ModelReconciliationTarget>, Error> {
        Ok(self
            .load_evidence()
            .await?
            .1
            .pending
            .into_values()
            .collect())
    }
    #[cfg(test)]
    pub(crate) async fn accept_model_evidence(
        &self,
        receipt: ModelReconciliation,
        allow_new: bool,
    ) -> Result<(), Error> {
        self.accept_model_command(receipt, allow_new, None).await
    }
    #[cfg(feature = "sqlite")]
    pub(crate) async fn model_command_accepted(
        &self,
        id: &str,
        receipt: &ModelReconciliation,
    ) -> Result<bool, Error> {
        let (_, saved) = self.load_evidence().await?;
        let key = key(&receipt.ticket)?;
        if saved.commands.get(id) != Some(&key) {
            return Ok(false);
        }
        let old = saved
            .receipts
            .get(&key)
            .ok_or_else(|| invalid("model command receipt missing"))?;
        Ok(serde_json::to_value(old).map_err(invalid)?
            == serde_json::to_value(receipt).map_err(invalid)?)
    }
    #[cfg(any(feature = "sqlite", test))]
    pub(crate) async fn accept_model_command(
        &self,
        receipt: ModelReconciliation,
        allow_new: bool,
        command_id: Option<&str>,
    ) -> Result<(), Error> {
        receipt.validate()?;
        if command_id.is_some_and(|id| id.trim().is_empty() || id.len() > 256) {
            return Err(invalid("invalid model management command ID"));
        }
        if receipt.ticket.request.run_id != self.run_id
            || receipt.ticket.request.thread_id != self.thread_id
        {
            return Err(invalid("model evidence targets a different run"));
        }
        let _guard = self.evidence_lock.lock().await;
        let (revision, mut saved) = self.load_evidence().await?;
        let key = key(&receipt.ticket)?;
        if let Some(id) = command_id {
            if saved.commands.get(id).is_some_and(|old| old != &key) {
                return Err(invalid("model evidence command ID reused"));
            }
        }
        if let Some(old) = saved.receipts.get(&key) {
            if serde_json::to_value(old).map_err(invalid)?
                != serde_json::to_value(&receipt).map_err(invalid)?
            {
                return Err(invalid("model evidence receipt cannot be changed"));
            }
            if command_id.is_none_or(|id| saved.commands.contains_key(id)) {
                return Ok(());
            }
        } else {
            if !allow_new || saved.receipts.len() >= 8192 {
                return Err(invalid(
                    "model evidence run is closed or receipt capacity exceeded",
                ));
            }
            let target = saved.pending.get_mut(&key).ok_or_else(|| {
                invalid("model evidence does not match a persisted dispatched attempt")
            })?;
            if target.ticket != receipt.ticket {
                return Err(invalid("model evidence attempt changed"));
            }
            target.evidence_accepted = true;
            saved.receipts.insert(key.clone(), receipt);
        }
        if let Some(id) = command_id {
            if saved.commands.len() >= 8192 {
                return Err(invalid("model evidence command capacity exceeded"));
            }
            saved.commands.insert(id.to_owned(), key);
        }
        self.save_evidence(revision, saved).await
    }
}
