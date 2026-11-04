use super::{engine::*, *};
use crate::durable::{GuardedCheckpointer, Lease, SqliteStore, check_lease, db_error};
use rusqlite::{OptionalExtension, Transaction, params};

fn summary(tx: &Transaction<'_>, key: &str) -> Result<Option<BudgetSummary>, Error> {
    let payload: Option<String> = tx
        .query_row(
            "SELECT payload FROM agent_runtime_budget_roots WHERE key=?1",
            [key],
            |row| row.get(0),
        )
        .optional()
        .map_err(db_error)?;
    payload
        .map(|payload| serde_json::from_str(&payload).map_err(db_error))
        .transpose()
}
fn operation(tx: &Transaction<'_>, root: &str, id: &str) -> Result<Option<Operation>, Error> {
    let payload: Option<String> = tx.query_row("SELECT payload FROM agent_runtime_budget_operations WHERE root_key=?1 AND operation_key=?2", params![root,id], |row| row.get(0)).optional().map_err(db_error)?;
    payload
        .map(|payload| serde_json::from_str(&payload).map_err(db_error))
        .transpose()
}

pub(crate) enum PrimitiveState {
    Undispatched,
    Uncertain,
    Recorded(BudgetReceipt),
}

/// Observes existing native reservations only; never enrolls or claims work.
pub(crate) fn inspect_primitive(
    tx: &Transaction<'_>,
    scopes: &[BudgetScope],
    id: &str,
    fingerprint: &str,
) -> Result<PrimitiveState, Error> {
    let mut receipt: Option<BudgetReceipt> = None;
    let mut claimed = false;
    let mut missing = false;
    for scope in scopes {
        let key = scope.key();
        let root = summary(tx, &key)?.ok_or_else(|| invalid("Hook original budget missing"))?;
        if root.version != 1 || root.spec.scope != *scope {
            return Err(invalid("Hook budget identity changed"));
        }
        let Some(op) = operation(tx, &key, id)? else {
            missing = true;
            continue;
        };
        if op.request.operation_id != id
            || op.request.fingerprint != fingerprint
            || op.request.reserve
                != (BudgetCost {
                    tool_calls: 1,
                    ..Default::default()
                })
            || op.request.activity != BudgetActivity::Operation
            || op.request.unbounded_tokens
        {
            return Err(invalid("Hook primitive budget request changed"));
        }
        claimed |= op.dispatched;
        if let Some(recorded) = op.receipt {
            if recorded.used
                != (BudgetCost {
                    tool_calls: 1,
                    ..Default::default()
                })
                || receipt.as_ref().is_some_and(|old| old != &recorded)
            {
                return Err(invalid("Hook primitive budget receipts disagree"));
            }
            receipt = Some(recorded);
        }
    }
    if let Some(receipt) = receipt {
        if missing {
            return Err(invalid("Hook receipt lost a reservation floor"));
        }
        Ok(PrimitiveState::Recorded(receipt))
    } else if !missing && claimed {
        Ok(PrimitiveState::Uncertain)
    } else {
        Ok(PrimitiveState::Undispatched)
    }
}

/// Settles a reported fact under the caller's original root transaction. The
/// only claim promotion is atomic with its final receipt and grants no IO.
pub(crate) fn settle_primitive(
    tx: &Transaction<'_>,
    scopes: &[BudgetScope],
    id: &str,
    fingerprint: &str,
    receipt: &BudgetReceipt,
    operator: bool,
    now: u64,
) -> Result<(), Error> {
    match inspect_primitive(tx, scopes, id, fingerprint)? {
        PrimitiveState::Recorded(old) if old != *receipt => {
            return Err(invalid("recorded Hook result cannot be replaced"));
        }
        PrimitiveState::Recorded(_) => {}
        PrimitiveState::Uncertain if operator => {}
        _ if scopes.is_empty() => return Ok(()),
        _ => return Err(invalid("Hook effect has no original dispatch claim")),
    }
    for scope in scopes {
        let key = scope.key();
        let mut op = operation(tx, &key, id)?.ok_or_else(|| invalid("Hook reservation missing"))?;
        if !op.dispatched {
            if !operator {
                return Err(invalid("Hook receipt lacks an original claim"));
            }
            op.dispatched = true;
        }
        let reservation = BudgetReservation {
            scope: scope.clone(),
            request: op.request.clone(),
        };
        let root = summary(tx, &key)?.ok_or_else(|| invalid("Hook budget missing"))?;
        let mut transition = engine::settle(root, op, &reservation, receipt.clone(), now)?;
        if operator && let Some(event) = transition.event.as_mut() {
            event.kind = "reconciled".into();
        }
        write(tx, &key, id, &transition)?;
    }
    Ok(())
}
async fn enroll(
    store: &SqliteStore,
    lease: Option<Lease>,
    spec: &BudgetSpec,
) -> Result<BudgetSummary, Error> {
    let spec = spec.clone();
    let clock = store.clock.clone();
    store.transaction(move |tx| {
        let now = clock.now_ms(); if let Some(lease) = lease { check_lease(tx, &lease, now)?; }
        let key = spec.scope.key();
        let summary = engine::enroll(&spec, summary(tx, &key)?, now)?;
        tx.execute("INSERT INTO agent_runtime_budget_roots(key,payload) VALUES(?1,?2) ON CONFLICT(key) DO UPDATE SET payload=excluded.payload",
            params![key,serde_json::to_string(&summary).map_err(db_error)?]).map_err(db_error)?;
        Ok(summary)
    }).await
}
fn write(tx: &Transaction<'_>, root: &str, id: &str, transition: &Transition) -> Result<(), Error> {
    let payload = serde_json::to_string(&transition.summary).map_err(db_error)?;
    tx.execute("INSERT INTO agent_runtime_budget_roots(key,payload) VALUES(?1,?2) ON CONFLICT(key) DO UPDATE SET payload=excluded.payload", params![root,payload]).map_err(db_error)?;
    if let Some(operation) = &transition.operation {
        let payload = serde_json::to_string(operation).map_err(db_error)?;
        tx.execute("INSERT INTO agent_runtime_budget_operations(root_key,operation_key,payload) VALUES(?1,?2,?3) ON CONFLICT(root_key,operation_key) DO UPDATE SET payload=excluded.payload",params![root,id,payload]).map_err(db_error)?;
    }
    if let Some(event) = &transition.event {
        tx.execute(
            "INSERT INTO agent_runtime_budget_events(root_key,payload) VALUES(?1,?2)",
            params![root, serde_json::to_string(event).map_err(db_error)?],
        )
        .map_err(db_error)?;
    }
    Ok(())
}
pub(crate) fn amend_in_transaction(
    tx: &Transaction<'_>,
    before: &BudgetSpec,
    limits: &BudgetLimits,
    command_id: &str,
    now: u64,
) -> Result<(), Error> {
    let key = before.scope.key();
    let saved = summary(tx, &key)?.ok_or_else(|| invalid("live budget ledger is missing"))?;
    let transition = engine::amend(saved, before, limits, command_id, now)?;
    write(tx, &key, command_id, &transition)
}
async fn inspect(
    store: &SqliteStore,
    lease: Option<Lease>,
    scope: &BudgetScope,
) -> Result<Option<BudgetSummary>, Error> {
    let key = scope.key();
    let clock = store.clock.clone();
    store
        .transaction(move |tx| {
            if let Some(lease) = lease {
                check_lease(tx, &lease, clock.now_ms())?;
            }
            summary(tx, &key)
        })
        .await
}
async fn reserve(
    store: &SqliteStore,
    lease: Option<Lease>,
    spec: &BudgetSpec,
    request: &BudgetRequest,
) -> Result<BudgetDecision, Error> {
    let spec = spec.clone();
    let request = request.clone();
    let clock = store.clock.clone();
    store
        .transaction(move |tx| {
            let now = clock.now_ms();
            if let Some(lease) = lease {
                check_lease(tx, &lease, now)?;
            }
            let key = spec.scope.key();
            let transition = engine::reserve(
                &spec,
                summary(tx, &key)?,
                operation(tx, &key, &request.operation_id)?,
                &request,
                now,
            )?;
            write(tx, &key, &request.operation_id, &transition)?;
            transition
                .decision
                .ok_or_else(|| invalid("missing budget admission"))
        })
        .await
}
async fn settle(
    store: &SqliteStore,
    lease: Option<Lease>,
    reservation: &BudgetReservation,
    receipt: BudgetReceipt,
) -> Result<BudgetSummary, Error> {
    let reservation = reservation.clone();
    let clock = store.clock.clone();
    store
        .transaction(move |tx| {
            let now = clock.now_ms();
            if let Some(lease) = lease {
                check_lease(tx, &lease, now)?;
            }
            let key = reservation.scope.key();
            let transition = engine::settle(
                summary(tx, &key)?.ok_or_else(|| invalid("budget root is missing"))?,
                operation(tx, &key, &reservation.request.operation_id)?
                    .ok_or_else(|| invalid("budget operation is missing"))?,
                &reservation,
                receipt,
                now,
            )?;
            write(tx, &key, &reservation.request.operation_id, &transition)?;
            Ok(transition.summary)
        })
        .await
}
async fn claim(
    store: &SqliteStore,
    lease: Option<Lease>,
    reservation: &BudgetReservation,
) -> Result<BudgetClaim, Error> {
    let reservation = reservation.clone();
    let clock = store.clock.clone();
    store
        .transaction(move |tx| {
            let now = clock.now_ms();
            if let Some(lease) = lease {
                check_lease(tx, &lease, now)?;
            }
            let key = reservation.scope.key();
            let (transition, claim) = engine::claim(
                summary(tx, &key)?.ok_or_else(|| invalid("budget root is missing"))?,
                operation(tx, &key, &reservation.request.operation_id)?
                    .ok_or_else(|| invalid("budget operation is missing"))?,
                &reservation,
                now,
            )?;
            write(tx, &key, &reservation.request.operation_id, &transition)?;
            Ok(claim)
        })
        .await
}
async fn events(
    store: &SqliteStore,
    lease: Option<Lease>,
    scope: &BudgetScope,
    after: u64,
    limit: usize,
) -> Result<Vec<BudgetEvent>, Error> {
    page_limit(limit)?;
    let key = scope.key();
    let clock = store.clock.clone();
    let after = i64::try_from(after).map_err(db_error)?;
    store.transaction(move |tx| {
        if let Some(lease) = lease { check_lease(tx, &lease, clock.now_ms())?; }
        let mut query = tx.prepare("SELECT id,payload FROM agent_runtime_budget_events WHERE root_key=?1 AND id>?2 ORDER BY id LIMIT ?3").map_err(db_error)?;
        query.query_map(params![key,after,limit], |row| Ok((row.get::<_,i64>(0)?, row.get::<_,String>(1)?))).map_err(db_error)?
            .map(|row| { let (id,payload) = row.map_err(db_error)?; let mut event: BudgetEvent = serde_json::from_str(&payload).map_err(db_error)?;
                event.cursor = u64::try_from(id).map_err(db_error)?; Ok(event) }).collect()
    }).await
}

#[async_trait::async_trait]
impl BudgetStore for SqliteStore {
    fn storage_identity(&self) -> Option<String> {
        Some(self.logical_identity().to_owned())
    }
    fn is_durable(&self) -> bool {
        true
    }
    async fn enroll(&self, spec: &BudgetSpec) -> Result<BudgetSummary, Error> {
        enroll(self, None, spec).await
    }
    async fn claim(&self, reservation: &BudgetReservation) -> Result<BudgetClaim, Error> {
        claim(self, None, reservation).await
    }
    async fn inspect(&self, scope: &BudgetScope) -> Result<Option<BudgetSummary>, Error> {
        inspect(self, None, scope).await
    }
    async fn reserve(
        &self,
        spec: &BudgetSpec,
        request: &BudgetRequest,
    ) -> Result<BudgetDecision, Error> {
        reserve(self, None, spec, request).await
    }
    async fn settle(
        &self,
        reservation: &BudgetReservation,
        receipt: BudgetReceipt,
    ) -> Result<BudgetSummary, Error> {
        settle(self, None, reservation, receipt).await
    }
    async fn events(
        &self,
        scope: &BudgetScope,
        after: u64,
        limit: usize,
    ) -> Result<Vec<BudgetEvent>, Error> {
        events(self, None, scope, after, limit).await
    }
}
#[async_trait::async_trait]
impl BudgetStore for GuardedCheckpointer {
    fn storage_identity(&self) -> Option<String> {
        Some(self.store.logical_identity().to_owned())
    }
    fn is_durable(&self) -> bool {
        true
    }
    async fn enroll(&self, spec: &BudgetSpec) -> Result<BudgetSummary, Error> {
        enroll(&self.store, Some(self.lease.clone()), spec).await
    }
    async fn claim(&self, reservation: &BudgetReservation) -> Result<BudgetClaim, Error> {
        claim(&self.store, Some(self.lease.clone()), reservation).await
    }
    async fn inspect(&self, scope: &BudgetScope) -> Result<Option<BudgetSummary>, Error> {
        inspect(&self.store, Some(self.lease.clone()), scope).await
    }
    async fn reserve(
        &self,
        spec: &BudgetSpec,
        request: &BudgetRequest,
    ) -> Result<BudgetDecision, Error> {
        reserve(&self.store, Some(self.lease.clone()), spec, request).await
    }
    async fn settle(
        &self,
        reservation: &BudgetReservation,
        receipt: BudgetReceipt,
    ) -> Result<BudgetSummary, Error> {
        settle(&self.store, Some(self.lease.clone()), reservation, receipt).await
    }
    async fn events(
        &self,
        scope: &BudgetScope,
        after: u64,
        limit: usize,
    ) -> Result<Vec<BudgetEvent>, Error> {
        events(&self.store, Some(self.lease.clone()), scope, after, limit).await
    }
}
