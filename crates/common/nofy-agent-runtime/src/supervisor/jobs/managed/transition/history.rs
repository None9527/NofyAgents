//! Async validation owns no SQLite transaction. The private proof is checked
//! against the exact boundary again inside the eventual commit transaction.
use super::*;

pub(super) struct Boundary {
    source: RunSnapshot,
    checkpoint: crate::Checkpoint,
    identity: String,
    modules: Option<LiveModuleState>,
}

pub(super) enum Preparation {
    Replay(ManagedActionRecord),
    Validate(Boundary),
}

pub(super) fn replay(
    tx: &Transaction<'_>,
    action: &ManagedAction,
) -> Result<Option<ManagedActionRecord>, Error> {
    let old = actions::read(tx, &action.command_id)?;
    if let Some(old) = &old
        && actions::action_digest(&old.action)? != actions::action_digest(action)?
    {
        return Err(Error::Checkpoint("management command ID reused".into()));
    }
    Ok(old)
}

pub(super) fn prepare(tx: &Transaction<'_>, p: &Proposal) -> Result<Preparation, Error> {
    match replay(tx, &p.action)? {
        Some(old) => Ok(Preparation::Replay(old)),
        None => Ok(Preparation::Validate(Boundary::read(tx, p)?)),
    }
}

impl Boundary {
    pub(super) fn read(tx: &Transaction<'_>, p: &Proposal) -> Result<Self, Error> {
        let selected = selection(&p.action.command)
            .ok_or_else(|| Error::Composition("expected live update".into()))?;
        let (_, hash, saved, status) = load(tx, &p.action.run_id)?
            .ok_or_else(|| Error::Checkpoint("live job missing".into()))?;
        if hash != p.submission_digest {
            return Err(Error::Checkpoint("live submission changed".into()));
        }
        let current = effective(tx, &p.action.run_id)?;
        if current.as_ref().map_or(0, |v| v.revision) != selected.expected_revision {
            return Err(Error::Checkpoint("live expected revision changed".into()));
        }
        let park = parking::read(tx, selected.park_command_id)?
            .ok_or_else(|| Error::Checkpoint("live park missing".into()))?;
        if park.run_id != p.action.run_id || park.status != parking::ParkStatus::Parked {
            return Err(Error::Checkpoint(
                "live transition requires this run's confirmed park".into(),
            ));
        }
        let (revision, payload): (u64, String) = tx
            .query_row(
                "SELECT revision,payload FROM agent_runtime_checkpoints WHERE key=?1",
                [crate::state::checkpoint_key(
                    p.snapshot.name(),
                    &park.thread_id,
                )],
                |r| Ok((r.get(0)?, r.get(1)?)),
            )
            .map_err(db_error)?;
        let checkpoint = serde_json::from_str(&payload).map_err(db_error)?;
        let effective = current.as_ref().map(|v| {
            (
                v.revision,
                &v.command_id,
                &v.composition_digest,
                &v.release,
                &v.program,
                &v.modules,
            )
        });
        let source = current
            .as_ref()
            .map_or(&saved.submission.snapshot, |v| &v.snapshot);
        if park
            .receipt
            .as_ref()
            .is_some_and(|receipt| receipt.budget_suspended)
        {
            compatibility::validate_suspended_budget(source, &p.snapshot, selected.update)?;
        }
        // The separately validated plan is attached after asynchronous profile
        // resolution; the proof below binds that exact plan before admission.
        let proposal = (
            &p.action,
            &p.submission_digest,
            &p.snapshot,
            &p.composition_digest,
        );
        let identity = content_digest(&(
            proposal, source, effective, &park, status, revision, payload,
        ))?;
        Ok(Self {
            source: source.clone(),
            checkpoint,
            identity,
            modules: current.as_ref().and_then(|value| value.modules.clone()),
        })
    }

    pub(super) async fn validate(
        self,
        p: &Proposal,
        target: &crate::Agent,
        registry: &crate::registry::ModuleRegistry,
        storage_identity: &str,
    ) -> Result<Proof, Error> {
        let update = selection(&p.action.command)
            .ok_or_else(|| Error::Composition("expected live update".into()))?
            .update;
        let history = compatibility::history(
            &self.source,
            &p.snapshot,
            &self.checkpoint.state,
            target,
            update,
        )
        .await?;
        let budget_plan = if update.is_some_and(|update| update.budget_limits) {
            let source = self.source.clone();
            let snapshot = p.snapshot.clone();
            let profiles = target.governance_profiles().to_vec();
            let modules = self.modules.clone();
            let host = registry.clone();
            let storage_identity = storage_identity.to_owned();
            Some(
                tokio::task::spawn_blocking(move || {
                    budgets::prepare(
                        &source,
                        &snapshot,
                        &profiles,
                        modules.as_ref(),
                        &host,
                        &storage_identity,
                    )
                })
                .await
                .map_err(|error| {
                    Error::Checkpoint(format!("budget plan task failed: {error}"))
                })??,
            )
        } else {
            None
        };
        if p.budget_plan.is_some() && p.budget_plan != budget_plan {
            return Err(Error::Checkpoint(
                "accepted live budget plan changed".into(),
            ));
        }
        Ok(Proof {
            boundary: self.identity,
            history,
            budget_plan,
        })
    }
}

pub(super) struct Proof {
    boundary: String,
    history: compatibility::HistoryProof,
    pub(super) budget_plan: Option<budgets::Plan>,
}

impl Proof {
    pub(super) fn verify(&self, tx: &Transaction<'_>, p: &Proposal) -> Result<(), Error> {
        if self.budget_plan != p.budget_plan {
            return Err(Error::Checkpoint(
                "validated live budget plan changed".into(),
            ));
        }
        let actual = Boundary::read(tx, p)?;
        if self.boundary != actual.identity {
            return Err(Error::Checkpoint("validated live boundary changed".into()));
        }
        self.history.verify(
            &actual.source,
            &p.snapshot,
            &actual.checkpoint.state,
            selection(&p.action.command).and_then(|s| s.update),
        )
    }
}
