//! Shared reservation/settlement ledger. Adapters admit actual operations;
//! an individual Agent's step counter is not a substitute for this ledger.
use crate::Error;
use serde::{Deserialize, Serialize};
use serde_json::Value;

mod engine;
mod memory;
mod model;
pub use model::{operation_context, operation_scope, sample_model};
pub mod declarative;
mod profile;
mod recovery;
pub(crate) use recovery::ModelRecovery;
pub use recovery::{
    ModelReconciliation, ModelReconciliationResult, ModelReconciliationTarget,
    ModelReconciliationTicket, ModelRetryCommand, ModelRetryTicket,
};
mod runtime;
mod tool;
pub use profile::{GovernanceFactory, GovernanceProfile, InstalledBudget, ModelRetryPolicy};
pub(crate) use runtime::{BudgetControl, SupervisedBudgetBackend};
pub(crate) use runtime::{GroupAdmission, reserve, settle};
pub(crate) use runtime::{cancellation as cancellation_error, prepare as runtime_prepare};
pub(crate) use tool::reconcile_tool;
pub use tool::{dispatch_tool, tool_operation};
pub fn is_governed(context: &crate::RunContext) -> bool {
    context.capabilities.get::<BudgetControl>().is_some()
}
pub(crate) async fn await_resource<T>(
    context: &crate::RunContext,
    future: impl std::future::Future<Output = Result<T, Error>>,
) -> Result<T, Error> {
    tokio::select! { biased;
        _ = context.cancel.cancelled() => Err(cancellation_error(context)),
        result = future => result,
    }
}
#[cfg(feature = "sqlite")]
mod sqlite;
pub use memory::InMemoryBudgetStore;

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
#[serde(deny_unknown_fields)]
pub struct BudgetScope {
    pub root_run_id: String,
    pub identity: String,
}
impl BudgetScope {
    #[cfg(feature = "sqlite")]
    pub(crate) fn key(&self) -> String {
        serde_json::to_string(self).expect("string scope serialization")
    }
}
#[derive(Clone, Copy, Debug, Default, Serialize, Deserialize, PartialEq, Eq)]
#[serde(default, deny_unknown_fields)]
pub struct BudgetCost {
    pub steps: u64,
    pub model_calls: u64,
    pub tool_calls: u64,
    pub child_calls: u64,
    pub input_tokens: u64,
    pub output_tokens: u64,
}
#[derive(Clone, Debug, Default, Serialize, Deserialize, PartialEq, Eq)]
#[serde(default, deny_unknown_fields)]
pub struct BudgetLimits {
    pub max_steps: Option<u64>,
    pub max_model_calls: Option<u64>,
    pub max_tool_calls: Option<u64>,
    pub max_child_calls: Option<u64>,
    pub max_input_tokens: Option<u64>,
    pub max_output_tokens: Option<u64>,
    pub max_total_tokens: Option<u64>,
    pub max_concurrent_operations: Option<u32>,
    pub max_active_children: Option<u32>,
    pub max_depth: Option<u32>,
    /// Relative only at first enrollment. The stored absolute deadline survives
    /// subsequent workers and process restarts.
    pub max_duration_ms: Option<u64>,
}
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(deny_unknown_fields)]
pub struct BudgetSpec {
    pub scope: BudgetScope,
    pub limits: BudgetLimits,
}
#[derive(Clone, Copy, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum BudgetActivity {
    Operation,
    Child,
    None,
}
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(deny_unknown_fields)]
pub struct BudgetRequest {
    pub operation_id: String,
    /// Canonical request digest plus purpose/version, not a credential or raw
    /// user payload. Reusing an ID with another fingerprint is an error.
    pub fingerprint: String,
    pub reserve: BudgetCost,
    pub depth: u32,
    pub activity: BudgetActivity,
    /// Allowed only when this scope has no token limit. Usage is still recorded
    /// without pretending an estimate was a guaranteed reservation.
    #[serde(default)]
    pub unbounded_tokens: bool,
}
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(deny_unknown_fields)]
pub struct BudgetDenial {
    pub reason: String,
    pub dimension: String,
}
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
pub struct BudgetSummary {
    pub version: u32,
    pub spec: BudgetSpec,
    pub used: BudgetCost,
    pub reserved: BudgetCost,
    pub active_operations: u32,
    pub active_children: u32,
    pub operation_count: u64,
    pub created_at_ms: u64,
    pub deadline_ms: Option<u64>,
    pub last_seen_ms: u64,
    pub blocked: Option<BudgetDenial>,
}
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct BudgetReceipt {
    pub used: BudgetCost,
    pub value: Value,
}
/// Only stores issue reservation handles. They cannot be deserialized from a
/// model response or uploaded configuration.
#[derive(Clone, Debug)]
pub struct BudgetReservation {
    scope: BudgetScope,
    request: BudgetRequest,
}
impl BudgetReservation {
    pub fn scope(&self) -> &BudgetScope {
        &self.scope
    }
    pub fn request(&self) -> &BudgetRequest {
        &self.request
    }
}
#[derive(Clone, Debug)]
pub enum BudgetDecision {
    Granted(BudgetReservation),
    Replay(BudgetReceipt),
    /// An existing reservation without a receipt. Only an atomic claim proving
    /// that no dispatch started may authorize work; a claimed intent requires
    /// reconciliation. This value itself never authorizes IO.
    Uncertain(BudgetReservation),
    Denied(BudgetDenial),
}
#[derive(Clone, Debug)]
pub enum BudgetClaim {
    /// The only transition authorizing a fresh dispatch. A reservation alone
    /// does not authorize IO, including after recovery.
    Dispatch,
    Replay(BudgetReceipt),
    Uncertain,
    Denied(BudgetDenial),
}
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct BudgetEvent {
    pub cursor: u64,
    pub time_ms: u64,
    pub operation_id: String,
    pub kind: String,
    pub cost: BudgetCost,
    pub denial: Option<BudgetDenial>,
}
#[async_trait::async_trait]
pub trait BudgetStore: Send + Sync {
    fn is_durable(&self) -> bool {
        false
    }
    /// Host-only comparison for attaching the supervisor's lease fence.
    fn storage_identity(&self) -> Option<String> {
        None
    }
    /// Enroll at accepted-run time, before waiting for resources. Re-enrollment
    /// preserves the original deadline and never changes limits or usage.
    async fn enroll(&self, spec: &BudgetSpec) -> Result<BudgetSummary, Error>;
    async fn inspect(&self, scope: &BudgetScope) -> Result<Option<BudgetSummary>, Error>;
    async fn reserve(
        &self,
        spec: &BudgetSpec,
        request: &BudgetRequest,
    ) -> Result<BudgetDecision, Error>;
    async fn claim(&self, reservation: &BudgetReservation) -> Result<BudgetClaim, Error>;
    /// Records actual usage even when a model violates its declared bound. In
    /// that case the root is blocked; accounting is never silently discarded.
    async fn settle(
        &self,
        reservation: &BudgetReservation,
        receipt: BudgetReceipt,
    ) -> Result<BudgetSummary, Error>;
    async fn events(
        &self,
        scope: &BudgetScope,
        after: u64,
        limit: usize,
    ) -> Result<Vec<BudgetEvent>, Error>;
}
