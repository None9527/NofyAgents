//! Single-host durable execution and approval. The supervisor owns leases and
//! binds them to checkpoint transactions; it does not implement another loop.
use crate::compile::{CompilationSnapshot, CompiledAgent};
use crate::program::{CompiledProgram, ExecutionPlan, RunSnapshot};
mod child_retry;
mod control;
mod execution;
mod storage;
pub use control::{ChildCancelResumeCommand, RunControlCommand};
#[cfg(feature = "workflow")]
mod control_tree;
mod durable_events;
pub mod jobs;
mod reconciliation;
use crate::durable::{Lease, SqliteStore, check_lease, db_error};
use crate::{
    Admission, Checkpointer, Error, Policy, RunContext, RunInput, RunOutcome, RunState, ToolCall,
};
pub use reconciliation::{
    ChildRecoveryPage, ChildRecoveryTarget, RootRecoveryTarget, RootToolReconciliation,
};
use rusqlite::{OptionalExtension, params};
use serde::{Deserialize, Serialize};
use std::{sync::Arc, time::Duration};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RunRecord<S = CompilationSnapshot> {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub submission: Option<String>,
    pub run_id: String,
    pub thread_id: String,
    pub snapshot: S,
    pub composition: String,
    pub status: String,
    pub outcome: Option<RunOutcome>,
    pub error: Option<String>,
}
pub type ExecutionRecord = RunRecord<RunSnapshot>;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChildRunRecord {
    pub root_run_id: String,
    pub parent_run_id: String,
    pub run_id: String,
    pub thread_id: String,
    pub agent_name: String,
    pub composition: String,
    pub status: String,
    pub error: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub kind: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub checkpoint_key: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub workflow_ref: Option<crate::registry::ModuleRef>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub node_id: Option<String>,
}

fn child_key(root: &str, child: &str) -> String {
    serde_json::to_string(&(root, child)).expect("child key contains strings")
}
fn outcome_status(outcome: &RunOutcome) -> &'static str {
    match outcome {
        RunOutcome::Completed { state, .. } if state.completion_info.refusal.is_some() => "refused",
        RunOutcome::Completed { state, .. }
            if state.completion_info.stop_reason.as_deref() == Some("length") =>
        {
            "truncated"
        }
        RunOutcome::Completed { .. } => "completed",
        RunOutcome::Paused { .. } => "paused",
        RunOutcome::Cancelled { .. } => "cancelled",
        RunOutcome::BudgetExceeded { .. } => "budget_exceeded",
    }
}

struct TreeObserver {
    store: SqliteStore,
    identity: SupervisedIdentity,
}
#[async_trait::async_trait]
impl crate::composition::ChildObserver for TreeObserver {
    #[cfg(feature = "workflow")]
    async fn control(
        &self,
        parent: &RunContext,
        record: crate::composition::ControlNodeRecord,
    ) -> Result<(), Error> {
        self.observe_control(parent, record).await
    }
    async fn reconciliation(
        &self,
        child: &RunContext,
        agent: &crate::Agent,
    ) -> Result<Option<crate::reconciliation::ReconciliationInput>, Error> {
        self.reconciliation_input(child, agent).await
    }

    async fn started(
        &self,
        parent: &RunContext,
        child: &RunContext,
        agent: &crate::Agent,
    ) -> Result<(), Error> {
        let record = ChildRunRecord {
            root_run_id: self.identity.run_id.clone(),
            parent_run_id: parent.run_id.clone(),
            run_id: child.run_id.clone(),
            thread_id: child.thread_id.clone(),
            agent_name: agent.spec().name.clone(),
            composition: agent.composition_identity().to_string(),
            status: "running".into(),
            error: None,
            kind: Some(agent.execution_kind().into()),
            checkpoint_key: Some(agent.checkpoint_key(&child.thread_id)),
            workflow_ref: None,
            node_id: child
                .capabilities
                .get::<crate::events::RunLineage>()
                .and_then(|lineage| lineage.node_id.clone()),
        };
        let lease = self.identity.lease.clone();
        let clock = self.store.clock.clone();
        self.store.transaction(move |tx| {
            check_lease(tx,&lease,clock.now_ms())?;
            let key=child_key(&record.root_run_id,&record.run_id);
            let old:Option<String>=tx.query_row("SELECT payload FROM agent_runtime_children WHERE key=?1",[&key],|row|row.get(0)).optional().map_err(db_error)?;
            if let Some(old)=old {
                let previous:ChildRunRecord=serde_json::from_str(&old).map_err(db_error)?;
                if previous.composition!=record.composition || previous.thread_id!=record.thread_id || previous.agent_name!=record.agent_name || previous.parent_run_id!=record.parent_run_id
                    || (previous.kind.is_some() && previous.kind!=record.kind)
                    || (previous.checkpoint_key.is_some() && previous.checkpoint_key!=record.checkpoint_key)
                    || (previous.node_id.is_some() && previous.node_id!=record.node_id) {
                    return Err(Error::Checkpoint("child identity/composition changed".into()));
                }
            }
            let payload=serde_json::to_string(&record).map_err(db_error)?;
            tx.execute("INSERT INTO agent_runtime_children(key,root_id,payload) VALUES(?1,?2,?3) ON CONFLICT(key) DO UPDATE SET payload=excluded.payload",params![key,record.root_run_id,payload]).map_err(db_error)?;Ok(())
        }).await
    }
    async fn finished(
        &self,
        child: &RunContext,
        result: &Result<RunOutcome, Error>,
    ) -> Result<(), Error> {
        let key = child_key(&self.identity.run_id, &child.run_id);
        let lease = self.identity.lease.clone();
        let clock = self.store.clock.clone();
        let (status, error) = match result {
            Ok(outcome) => (outcome_status(outcome).to_string(), None),
            Err(error) => ("failed".into(), Some(error.to_string())),
        };
        self.store
            .transaction(move |tx| {
                check_lease(tx, &lease, clock.now_ms())?;
                let payload: String = tx
                    .query_row(
                        "SELECT payload FROM agent_runtime_children WHERE key=?1",
                        [&key],
                        |row| row.get(0),
                    )
                    .map_err(db_error)?;
                let mut record: ChildRunRecord =
                    serde_json::from_str(&payload).map_err(db_error)?;
                record.status = status;
                record.error = error;
                tx.execute(
                    "UPDATE agent_runtime_children SET payload=?1 WHERE key=?2",
                    params![serde_json::to_string(&record).map_err(db_error)?, key],
                )
                .map_err(db_error)?;
                Ok(())
            })
            .await
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApprovalRequest {
    pub run_id: String,
    pub thread_id: String,
    pub step: usize,
    pub call: ToolCall,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChildReconciliation {
    pub child_run_id: String,
    /// Exact child model operation. Legacy callers may omit it only when unambiguous.
    #[serde(default)]
    pub model_sequence: Option<u64>,
    pub call: ToolCall,
    pub result: serde_json::Value,
    pub is_error: bool,
}
impl ApprovalRequest {
    fn key(&self) -> Result<String, Error> {
        serde_json::to_string(&(&self.run_id, &self.thread_id, self.step, &self.call.id))
            .map_err(db_error)
    }
}
#[derive(Clone)]
pub(crate) struct SupervisedIdentity {
    run_id: String,
    lease: Lease,
}

struct DurableEventSink {
    store: SqliteStore,
    identity: SupervisedIdentity,
}
#[async_trait::async_trait]
impl crate::events::EventSink for DurableEventSink {
    async fn record_once(
        &self,
        scope: crate::events::EventScope,
        event: crate::agent::RunEvent,
        key: &str,
    ) -> Result<(), Error> {
        self.record_unique(scope, event, key).await
    }

    async fn record(
        &self,
        mut scope: crate::events::EventScope,
        event: crate::agent::RunEvent,
    ) -> Result<(), Error> {
        let identity = self.identity.clone();
        let clock = self.store.clock.clone();
        self.store
            .transaction(move |tx| {
                check_lease(tx, &identity.lease, clock.now_ms())?;
                scope.root_run_id = identity.run_id.clone();
                let mut envelope = crate::events::EventEnvelope {
                    version: 1,
                    cursor: 0,
                    timestamp_ms: clock.now_ms(),
                    scope,
                    event,
                };
                tx.execute(
                    "INSERT INTO agent_runtime_events(root_id,payload) VALUES(?1,'')",
                    [&identity.run_id],
                )
                .map_err(db_error)?;
                envelope.cursor = u64::try_from(tx.last_insert_rowid()).map_err(db_error)?;
                let payload = serde_json::to_string(&envelope).map_err(db_error)?;
                tx.execute(
                    "UPDATE agent_runtime_events SET payload=?1 WHERE id=?2",
                    params![payload, envelope.cursor],
                )
                .map_err(db_error)?;
                Ok(())
            })
            .await
    }
}

pub struct DurableApprovalPolicy {
    store: SqliteStore,
}
impl DurableApprovalPolicy {
    pub fn new(store: SqliteStore) -> Self {
        Self { store }
    }
}
#[async_trait::async_trait]
impl Policy for DurableApprovalPolicy {
    async fn admit(
        &self,
        call: &ToolCall,
        state: &RunState,
        context: &RunContext,
    ) -> Result<Admission, Error> {
        let root = context
            .capabilities
            .get::<SupervisedIdentity>()
            .ok_or_else(|| {
                Error::Composition("durable approval requires a supervised run".into())
            })?;
        let request = ApprovalRequest {
            run_id: root.run_id.clone(),
            thread_id: context.thread_id.clone(),
            step: state.steps,
            call: call.clone(),
        };
        Ok(
            match self
                .store
                .approval(request.clone(), root.lease.clone())
                .await?
            {
                Some(true) => Admission::Allow,
                Some(false) => Admission::Deny("denied by recorded approval decision".into()),
                None => Admission::Pause(serde_json::json!({"kind":"approval","request":request})),
            },
        )
    }
}

pub struct RunSupervisor {
    store: SqliteStore,
    ttl: Duration,
}
