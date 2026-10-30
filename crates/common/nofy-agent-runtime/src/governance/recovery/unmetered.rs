//! A real invocation journal for explicitly selected model persistence without
//! quotas. It does not enroll or settle any BudgetStore.
use super::*;
use crate::governance::{ModelReconciliationTarget, model::CachedModel};

pub(in crate::governance) enum Admission {
    Dispatch,
    Replay(CachedModel),
    Uncertain,
}
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Invocation {
    target: ModelReconciliationTarget,
    result: Option<CachedModel>,
}
#[derive(Default, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Saved {
    operations: BTreeMap<String, Invocation>,
}
fn error(e: impl std::fmt::Display) -> Error {
    Error::Checkpoint(e.to_string())
}
fn key(target: &ModelReconciliationTarget) -> Result<String, Error> {
    serde_json::to_string(&target.ticket).map_err(error)
}
impl ModelRecovery {
    fn unmetered_key(&self) -> String {
        serde_json::to_string(&("model-unmetered-v1", &self.key)).expect("string tuple")
    }
    async fn load_unmetered(&self) -> Result<(Option<u64>, Saved), Error> {
        match self.store.load(&self.unmetered_key()).await? {
            None => Ok((None, Saved::default())),
            Some(cp) if cp.version == 1 && cp.composition == self.composition => Ok((
                Some(cp.revision),
                serde_json::from_value(cp.state.data).map_err(error)?,
            )),
            Some(_) => Err(error("unmetered model journal composition/version changed")),
        }
    }
    async fn save_unmetered(&self, revision: Option<u64>, saved: Saved) -> Result<(), Error> {
        let data = serde_json::to_value(saved).map_err(error)?;
        if serde_json::to_vec(&data).map_err(error)?.len() > 16 * 1024 * 1024 {
            return Err(error("unmetered model journal exceeds 16 MiB"));
        }
        self.store
            .save(
                &self.unmetered_key(),
                revision,
                Checkpoint {
                    version: 1,
                    revision: revision
                        .unwrap_or(0)
                        .checked_add(1)
                        .ok_or_else(|| error("unmetered model revision exhausted"))?,
                    composition: self.composition.clone(),
                    state: RunState {
                        data,
                        ..Default::default()
                    },
                },
            )
            .await
    }
    pub(in crate::governance) async fn start_unmetered(
        &self,
        target: ModelReconciliationTarget,
    ) -> Result<Admission, Error> {
        let _guard = self.evidence_lock.lock().await;
        let (revision, mut saved) = self.load_unmetered().await?;
        let key = key(&target)?;
        if let Some(old) = saved.operations.get(&key) {
            if old.target != target {
                return Err(error("unmetered model attempt changed"));
            }
            return Ok(match &old.result {
                Some(result) => Admission::Replay(result.clone()),
                None => Admission::Uncertain,
            });
        }
        if saved.operations.len() >= 8192 {
            return Err(error("unmetered model operation capacity exceeded"));
        }
        saved.operations.insert(
            key,
            Invocation {
                target,
                result: None,
            },
        );
        self.save_unmetered(revision, saved).await?;
        Ok(Admission::Dispatch)
    }
    pub(in crate::governance) async fn settle_unmetered(
        &self,
        target: &ModelReconciliationTarget,
        result: CachedModel,
    ) -> Result<CachedModel, Error> {
        let _guard = self.evidence_lock.lock().await;
        let (revision, mut saved) = self.load_unmetered().await?;
        let entry = saved
            .operations
            .get_mut(&key(target)?)
            .ok_or_else(|| error("unmetered model intent missing"))?;
        if entry.target != *target {
            return Err(error("unmetered model attempt changed"));
        }
        if let Some(result) = &entry.result {
            return Ok(result.clone());
        }
        entry.result = Some(result.clone());
        self.save_unmetered(revision, saved).await?;
        Ok(result)
    }
}
