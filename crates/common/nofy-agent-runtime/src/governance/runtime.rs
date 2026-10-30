use super::*;
use crate::{RunContext, events::RunLineage};
use std::sync::{
    Arc,
    atomic::{AtomicBool, Ordering},
};

#[derive(Clone)]
pub(crate) struct BudgetEntry {
    pub store: Arc<dyn BudgetStore>,
    pub spec: BudgetSpec,
}
#[derive(Clone, Default)]
pub(crate) struct BudgetControl {
    pub entries: Vec<BudgetEntry>,
    pub retry: ModelRetryPolicy,
    pub expired: Arc<AtomicBool>,
    pub depth: u32,
}
#[derive(Clone)]
pub(crate) struct SupervisedBudgetBackend {
    pub root_run_id: String,
    pub store: Arc<dyn BudgetStore>,
}
pub(crate) struct RunBudgetGuard(Option<tokio::task::JoinHandle<()>>);
impl Drop for RunBudgetGuard {
    fn drop(&mut self) {
        if let Some(task) = self.0.take() {
            task.abort();
        }
    }
}

pub(crate) async fn prepare(
    profiles: &[Arc<GovernanceProfile>],
    context: &mut RunContext,
    durable_run: bool,
) -> Result<RunBudgetGuard, Error> {
    let inherited = context.capabilities.get::<BudgetControl>();
    if inherited.is_none() && profiles.is_empty() {
        return Ok(RunBudgetGuard(None));
    }
    let mut control = inherited
        .as_deref()
        .cloned()
        .unwrap_or_else(|| BudgetControl {
            retry: ModelRetryPolicy {
                max_attempts: 5,
                ..Default::default()
            },
            ..Default::default()
        });
    let root = context.capabilities.get::<RunLineage>().map_or_else(
        || context.run_id.clone(),
        |lineage| lineage.root_run_id.clone(),
    );
    for profile in profiles {
        let mut store = profile.resource.store.clone();
        if let Some(supervised) = context.capabilities.get::<SupervisedBudgetBackend>() {
            if supervised.root_run_id != root
                || store.storage_identity().is_none()
                || store.storage_identity() != supervised.store.storage_identity()
            {
                return Err(Error::Composition(
                    "supervised budgets must share the root checkpoint storage".into(),
                ));
            }
            store = supervised.store.clone();
        }
        if durable_run && !store.is_durable() {
            return Err(Error::Composition(
                "durable run requires a durable budget ledger".into(),
            ));
        }
        let spec = BudgetSpec {
            scope: BudgetScope {
                root_run_id: root.clone(),
                identity: profile.identity.clone(),
            },
            limits: profile.limits.clone(),
        };
        if !control.entries.iter().any(|entry| entry.spec == spec) {
            control.entries.push(BudgetEntry { store, spec });
        }
        control.retry.max_attempts = control.retry.max_attempts.min(profile.retry.max_attempts);
        control.retry.base_delay_ms = control.retry.base_delay_ms.max(profile.retry.base_delay_ms);
        control.retry.max_delay_ms = control.retry.max_delay_ms.min(profile.retry.max_delay_ms);
    }
    control
        .entries
        .sort_by(|left, right| left.spec.scope.cmp(&right.spec.scope));
    let mut remaining = None::<u64>;
    for entry in &control.entries {
        if durable_run && !entry.store.is_durable() {
            return Err(Error::Composition(
                "inherited budget ledger is not durable".into(),
            ));
        }
        let summary = tokio::select! { biased;
            _ = context.cancel.cancelled() => return Err(Error::Cancelled),
            result = entry.store.enroll(&entry.spec) => result?,
        };
        if summary.blocked.is_some() {
            return Err(Error::BudgetExceeded);
        }
        if let Some(deadline) = summary.deadline_ms {
            let available = deadline.saturating_sub(summary.last_seen_ms);
            if available == 0 {
                return Err(Error::BudgetExceeded);
            }
            remaining = Some(remaining.map_or(available, |current| current.min(available)));
        }
    }
    context.cancel = context.cancel.child_token();
    let timer = remaining.map(|remaining| {
        let cancel = context.cancel.clone();
        let expired = control.expired.clone();
        tokio::spawn(async move {
            tokio::time::sleep(std::time::Duration::from_millis(remaining)).await;
            expired.store(true, Ordering::SeqCst);
            cancel.cancel();
        })
    });
    context.capabilities.insert(control);
    Ok(RunBudgetGuard(timer))
}
pub(crate) fn cancellation(context: &RunContext) -> Error {
    if context
        .capabilities
        .get::<BudgetControl>()
        .is_some_and(|control| control.expired.load(Ordering::SeqCst))
    {
        Error::BudgetExceeded
    } else {
        Error::Cancelled
    }
}
#[derive(Clone)]
pub(crate) struct HeldBudget {
    pub entry: BudgetEntry,
    pub reservation: BudgetReservation,
}
pub(crate) enum GroupAdmission {
    Ready(Vec<HeldBudget>),
    Replay(BudgetReceipt),
}
pub(crate) async fn reserve(
    context: &RunContext,
    operation_id: &str,
    fingerprint: &str,
    cost: BudgetCost,
    activity: BudgetActivity,
    unbounded_tokens: bool,
    controlled_resume: bool,
) -> Result<GroupAdmission, Error> {
    let Some(control) = context.capabilities.get::<BudgetControl>() else {
        return Ok(GroupAdmission::Ready(vec![]));
    };
    if context.cancel.is_cancelled() {
        return Err(cancellation(context));
    }
    let mut held = Vec::new();
    let mut replay = None::<BudgetReceipt>;
    let mut denied = false;
    for entry in &control.entries {
        let request = BudgetRequest {
            operation_id: operation_id.into(),
            fingerprint: fingerprint.into(),
            reserve: cost,
            depth: control.depth,
            activity,
            unbounded_tokens,
        };
        match entry.store.reserve(&entry.spec, &request).await? {
            BudgetDecision::Granted(reservation) | BudgetDecision::Uncertain(reservation) => held
                .push(HeldBudget {
                    entry: entry.clone(),
                    reservation,
                }),
            BudgetDecision::Replay(receipt) => {
                if replay.as_ref().is_some_and(|previous| previous != &receipt) {
                    return Err(Error::Checkpoint(
                        "budget floors disagree on the operation receipt".into(),
                    ));
                }
                replay = Some(receipt);
            }
            BudgetDecision::Denied(_) => denied = true,
        }
    }
    if let Some(receipt) = replay {
        for held in &held {
            held.entry
                .store
                .settle(&held.reservation, receipt.clone())
                .await?;
        }
        return Ok(GroupAdmission::Replay(receipt));
    }
    if denied {
        return Err(Error::BudgetExceeded);
    }
    for item in &held {
        match item.entry.store.claim(&item.reservation).await? {
            BudgetClaim::Dispatch => {}
            BudgetClaim::Replay(receipt) => {
                for item in &held {
                    item.entry
                        .store
                        .settle(&item.reservation, receipt.clone())
                        .await?;
                }
                return Ok(GroupAdmission::Replay(receipt));
            }
            BudgetClaim::Uncertain if controlled_resume => {
                let summary = item.entry.store.enroll(&item.entry.spec).await?;
                if summary.blocked.is_some()
                    || summary
                        .deadline_ms
                        .is_some_and(|deadline| summary.last_seen_ms >= deadline)
                {
                    return Err(Error::BudgetExceeded);
                }
            }
            BudgetClaim::Uncertain => {
                return Err(Error::GovernancePaused(
                    serde_json::json!({"kind":"budget_uncertain","operation_id":operation_id,"scope":item.entry.spec.scope}),
                ));
            }
            BudgetClaim::Denied(_) => return Err(Error::BudgetExceeded),
        }
    }
    Ok(GroupAdmission::Ready(held))
}
pub(crate) async fn settle(held: &[HeldBudget], receipt: BudgetReceipt) -> Result<(), Error> {
    let mut blocked = false;
    for item in held {
        blocked |= item
            .entry
            .store
            .settle(&item.reservation, receipt.clone())
            .await?
            .blocked
            .is_some();
    }
    if blocked {
        return Err(Error::BudgetExceeded);
    }
    Ok(())
}
