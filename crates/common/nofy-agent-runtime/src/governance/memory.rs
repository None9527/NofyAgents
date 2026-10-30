use super::{engine::*, *};
use std::{
    collections::BTreeMap,
    sync::{Arc, Mutex},
    time::{SystemTime, UNIX_EPOCH},
};

#[derive(Default)]
struct Data {
    roots: BTreeMap<BudgetScope, BudgetSummary>,
    operations: BTreeMap<(BudgetScope, String), Operation>,
    events: Vec<(BudgetScope, BudgetEvent)>,
}
pub struct InMemoryBudgetStore {
    data: Mutex<Data>,
    clock: Arc<dyn Fn() -> u64 + Send + Sync>,
}
impl Default for InMemoryBudgetStore {
    fn default() -> Self {
        Self::with_clock(Arc::new(|| {
            SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap_or_default()
                .as_millis()
                .min(u128::from(u64::MAX)) as u64
        }))
    }
}
impl InMemoryBudgetStore {
    pub fn with_clock(clock: Arc<dyn Fn() -> u64 + Send + Sync>) -> Self {
        Self {
            data: Mutex::default(),
            clock,
        }
    }
}
fn commit(
    data: &mut Data,
    scope: &BudgetScope,
    id: &str,
    transition: Transition,
) -> Result<(BudgetSummary, Option<BudgetDecision>), Error> {
    data.roots.insert(scope.clone(), transition.summary.clone());
    if let Some(operation) = transition.operation {
        data.operations
            .insert((scope.clone(), id.into()), operation);
    }
    if let Some(mut event) = transition.event {
        event.cursor = u64::try_from(data.events.len())
            .map_err(|_| invalid("budget event cursor overflow"))?
            .checked_add(1)
            .ok_or_else(|| invalid("budget cursor exhausted"))?;
        data.events.push((scope.clone(), event));
    }
    Ok((transition.summary, transition.decision))
}
#[async_trait::async_trait]
impl BudgetStore for InMemoryBudgetStore {
    async fn enroll(&self, spec: &BudgetSpec) -> Result<BudgetSummary, Error> {
        let mut data = self
            .data
            .lock()
            .map_err(|_| invalid("budget store poisoned"))?;
        let summary = engine::enroll(spec, data.roots.get(&spec.scope).cloned(), (self.clock)())?;
        data.roots.insert(spec.scope.clone(), summary.clone());
        Ok(summary)
    }
    async fn inspect(&self, scope: &BudgetScope) -> Result<Option<BudgetSummary>, Error> {
        Ok(self
            .data
            .lock()
            .map_err(|_| invalid("budget store poisoned"))?
            .roots
            .get(scope)
            .cloned())
    }
    async fn reserve(
        &self,
        spec: &BudgetSpec,
        request: &BudgetRequest,
    ) -> Result<BudgetDecision, Error> {
        let mut data = self
            .data
            .lock()
            .map_err(|_| invalid("budget store poisoned"))?;
        let transition = engine::reserve(
            spec,
            data.roots.get(&spec.scope).cloned(),
            data.operations
                .get(&(spec.scope.clone(), request.operation_id.clone()))
                .cloned(),
            request,
            (self.clock)(),
        )?;
        commit(&mut data, &spec.scope, &request.operation_id, transition)?
            .1
            .ok_or_else(|| invalid("missing budget admission"))
    }
    async fn settle(
        &self,
        reservation: &BudgetReservation,
        receipt: BudgetReceipt,
    ) -> Result<BudgetSummary, Error> {
        let mut data = self
            .data
            .lock()
            .map_err(|_| invalid("budget store poisoned"))?;
        let summary = data
            .roots
            .get(&reservation.scope)
            .cloned()
            .ok_or_else(|| invalid("budget root is missing"))?;
        let operation = data
            .operations
            .get(&(
                reservation.scope.clone(),
                reservation.request.operation_id.clone(),
            ))
            .cloned()
            .ok_or_else(|| invalid("budget operation is missing"))?;
        let transition = engine::settle(summary, operation, reservation, receipt, (self.clock)())?;
        Ok(commit(
            &mut data,
            &reservation.scope,
            &reservation.request.operation_id,
            transition,
        )?
        .0)
    }
    async fn claim(&self, reservation: &BudgetReservation) -> Result<BudgetClaim, Error> {
        let mut data = self
            .data
            .lock()
            .map_err(|_| invalid("budget store poisoned"))?;
        let summary = data
            .roots
            .get(&reservation.scope)
            .cloned()
            .ok_or_else(|| invalid("budget root is missing"))?;
        let operation = data
            .operations
            .get(&(
                reservation.scope.clone(),
                reservation.request.operation_id.clone(),
            ))
            .cloned()
            .ok_or_else(|| invalid("budget operation is missing"))?;
        let (transition, claim) = engine::claim(summary, operation, reservation, (self.clock)())?;
        commit(
            &mut data,
            &reservation.scope,
            &reservation.request.operation_id,
            transition,
        )?;
        Ok(claim)
    }
    async fn events(
        &self,
        scope: &BudgetScope,
        after: u64,
        limit: usize,
    ) -> Result<Vec<BudgetEvent>, Error> {
        page_limit(limit)?;
        Ok(self
            .data
            .lock()
            .map_err(|_| invalid("budget store poisoned"))?
            .events
            .iter()
            .filter(|(key, event)| key == scope && event.cursor > after)
            .take(limit)
            .map(|(_, event)| event.clone())
            .collect())
    }
}
