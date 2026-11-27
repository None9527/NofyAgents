//! Durable management admission uses the existing job transaction and root
//! lease. A network request never owns the lifetime of a model/tool execution.
use super::*;
mod abandonment;
pub(in crate::supervisor) mod actions;
pub use abandonment::Abandonment;
pub(in crate::supervisor) use abandonment::ensure_thread_open;
#[cfg(feature = "workflow")]
mod human;
#[cfg(feature = "workflow")]
pub use human::{HumanRecoveryPage, HumanRecoveryTarget};
pub(super) mod parking;
mod query;
pub(in crate::supervisor) use query::RUNNABLE_JOB;
pub(super) mod sessions;
pub(in crate::supervisor) mod transition;
use crate::system::{CompiledSystem, bounded_name, content_digest};

/// A system may add constraints beyond the host floor. Only accepted managed
/// jobs use this context; generic SDK snapshot restore retains exact matching.
pub(super) fn restore_scope(
    snapshot: &RunSnapshot,
    host: &crate::registry::ModuleRegistry,
) -> Result<crate::registry::ModuleRegistry, Error> {
    use crate::program::ProgramSnapshot;
    let (policies, governance) = match snapshot {
        RunSnapshot::Agent(s) => (&s.required_policies, &s.required_governance),
        RunSnapshot::Program(s) => match &s.program {
            ProgramSnapshot::Agent { snapshot: s } => {
                (&s.required_policies, &s.required_governance)
            }
            ProgramSnapshot::Tool { snapshot: s, .. } => {
                (&s.required_policies, &s.required_governance)
            }
            ProgramSnapshot::Event { snapshot: s } => {
                (&s.host.required_policies, &s.host.required_governance)
            }
            #[cfg(feature = "workflow")]
            ProgramSnapshot::Workflow { snapshot: s, .. } => {
                (&s.required_policies, &s.required_governance)
            }
        },
    };
    if !host
        .required_policies()
        .iter()
        .all(|r| policies.contains(r))
        || !host
            .required_governance()
            .iter()
            .all(|r| governance.contains(r))
    {
        return Err(Error::Composition(
            "managed snapshot is missing a current host floor".into(),
        ));
    }
    let mut scope = host.clone();
    for reference in policies {
        scope.require_policy(reference.clone());
    }
    for reference in governance {
        scope.require_governance(reference.clone());
    }
    Ok(scope)
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ManagedRunRequest {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub approval_mode: Option<ApprovalMode>,
    pub run_id: String,
    pub thread_id: String,
    pub system: String,
    pub release: String,
    pub program: String,
    #[serde(default)]
    pub input: Option<PendingInterjection<crate::InputPart>>,
    /// Data for Tool/workflow/Event roots; absence retains the release default.
    #[serde(
        default,
        deserialize_with = "crate::system::invocation::present_value",
        skip_serializing_if = "Option::is_none"
    )]
    pub parameters: Option<serde_json::Value>,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ManagedRun {
    pub sequence: u64,
    pub request: ManagedRunRequest,
    pub status: JobStatus,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case", deny_unknown_fields)]
pub enum ManagedCommand {
    /// Stop at a durable root Agent boundary after admitted work settles.
    Park,
    /// Release this exact request without implicitly resuming execution.
    Unpark {
        park_command_id: String,
    },
    /// Atomically install a compatible published configuration while parked.
    Transition {
        park_command_id: String,
        expected_revision: u64,
        release: String,
        program: String,
    },
    /// Explicit capability replacement at a certified safe root boundary.
    UpdateModules {
        park_command_id: String,
        expected_revision: u64,
        release: String,
        program: String,
        update: transition::ModuleUpdate,
    },
    /// Seal this thread without inventing a result for unresolved effects.
    Abandon {
        reason: String,
        acknowledge_unresolved: bool,
    },
    ReconcileModel {
        receipt: Box<crate::governance::ModelReconciliation>,
    },
    ReconcileHook {
        receipt: crate::hooks::primitive::HookReconciliation,
    },
    ReconcileRootTool {
        receipt: crate::supervisor::RootToolReconciliation,
    },
    ReconcileChild {
        receipt: crate::supervisor::ChildReconciliation,
    },
    Resume,
    ResumeAfterCancel {
        through: u64,
    },
    Control {
        control: super::super::RunControlCommand,
    },
    #[cfg(feature = "workflow")]
    Human {
        target_run_id: String,
        #[serde(default)]
        workflow_path: Vec<crate::registry::ModuleRef>,
        expected_request: serde_json::Value,
        value: serde_json::Value,
    },
}
struct PreparedAction {
    #[cfg(feature = "workflow")]
    human: Option<Result<crate::workflow::compile::CompiledWorkflow, Error>>,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ManagedAction {
    pub command_id: String,
    pub run_id: String,
    pub command: ManagedCommand,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ManagedActionRecord {
    pub sequence: u64,
    pub action: ManagedAction,
    pub finished: bool,
    pub outcome: Option<RunOutcome>,
    pub error: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub abandonment: Option<Abandonment>,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
struct ActionResult {
    outcome: Option<RunOutcome>,
    error: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    abandonment: Option<Abandonment>,
}
impl ActionResult {
    pub(super) fn from_execution(result: Result<RunOutcome, String>) -> Self {
        match result {
            Ok(outcome) => Self {
                outcome: Some(outcome),
                error: None,
                abandonment: None,
            },
            Err(error) => Self {
                outcome: None,
                error: Some(error.chars().take(8192).collect()),
                abandonment: None,
            },
        }
    }
}
fn request_digest(request: &ManagedRunRequest) -> Result<String, Error> {
    for value in [
        &request.run_id,
        &request.thread_id,
        &request.system,
        &request.program,
    ] {
        bounded_name(value)?;
    }
    if request.release.len() != 64 || !request.release.bytes().all(|b| b.is_ascii_hexdigit()) {
        return Err(Error::Composition(
            "managed run requires an exact release digest".into(),
        ));
    }
    if let Some(input) = &request.input {
        crate::mailbox::validate_message(input)?;
    }
    if let Some(parameters) = &request.parameters {
        crate::system::invocation::validate_parameters(parameters)?;
    }
    content_digest(request)
}
const MANAGED_RUN_CAPACITY: u64 = 10_000;
const MANAGED_RUN_PRUNE_BATCH: usize = 256;
const MANAGED_RUN_PRUNE_SCAN_PAGE: i64 = 512;

const PRUNABLE_MANAGED_RUNS_SQL: &str = "SELECT j.sequence, m.run_id, j.status,
    (
        SELECT p.payload
        FROM agent_runtime_threads t
        JOIN agent_runtime_checkpoints p ON p.key = t.key
        WHERE t.key = j.thread_key AND t.active_run = m.run_id
    )
FROM agent_runtime_managed_runs m
JOIN agent_runtime_jobs j ON j.run_id = m.run_id
WHERE j.sequence > ?1
  AND (?2 IS NULL OR m.run_id != ?2)
  AND j.status IN ('closed', 'cancelled', 'abandoned', 'failed')
  AND NOT EXISTS (
      SELECT 1 FROM agent_runtime_runs r
      WHERE r.id = m.run_id
        AND json_valid(r.payload)
        AND json_extract(r.payload, '$.status') IN ('running', 'paused')
  )
  AND NOT EXISTS (
      SELECT 1 FROM agent_runtime_managed_actions a
      WHERE a.run_id = m.run_id AND a.result IS NULL
  )
  AND NOT EXISTS (
      SELECT 1 FROM agent_runtime_parks p
      WHERE p.run_id = m.run_id AND p.status IN ('requested', 'parked')
  )
  AND NOT EXISTS (
      SELECT 1 FROM agent_runtime_approvals ap
      WHERE ap.decision IS NULL
        AND (
            ap.run_id = m.run_id
            OR EXISTS (
                SELECT 1 FROM agent_runtime_children c
                WHERE c.root_id = m.run_id
                  AND json_valid(c.payload)
                  AND json_extract(c.payload, '$.run_id') = ap.run_id
            )
        )
  )
  AND NOT EXISTS (
      SELECT 1 FROM agent_runtime_cancel k
      WHERE k.acknowledged = 0
        AND json_valid(k.address)
        AND json_extract(k.address, '$.root_run_id') = m.run_id
  )
  AND NOT EXISTS (
      SELECT 1 FROM agent_runtime_children c
      WHERE c.root_id = m.run_id
        AND json_valid(c.payload)
        AND json_extract(c.payload, '$.status') IN ('running', 'paused')
  )
  AND NOT EXISTS (
      SELECT 1 FROM agent_runtime_leases l
      WHERE l.key = j.thread_key AND l.expires_ms > ?3
  )
  AND NOT EXISTS (
      SELECT 1 FROM agent_runtime_work_owners w
      JOIN agent_runtime_jobs wj ON wj.run_id = w.run_id
      WHERE (w.run_id = m.run_id OR w.origin_run_id = m.run_id)
        AND wj.status NOT IN ('closed', 'cancelled', 'abandoned', 'failed')
  )
ORDER BY j.sequence ASC
LIMIT ?4";

pub(in crate::supervisor::jobs::managed) fn ensure_managed_run_capacity(
    tx: &rusqlite::Transaction<'_>,
    now: u64,
    protected_run: Option<&str>,
) -> Result<(), Error> {
    let count: u64 = tx
        .query_row("SELECT COUNT(*) FROM agent_runtime_managed_runs", [], |r| {
            r.get(0)
        })
        .map_err(db_error)?;
    if count < MANAGED_RUN_CAPACITY {
        return Ok(());
    }
    let needed = usize::try_from(count.saturating_sub(MANAGED_RUN_CAPACITY).saturating_add(1))
        .unwrap_or(usize::MAX);
    let target = needed.max(MANAGED_RUN_PRUNE_BATCH);
    let now_i64 = i64::try_from(now).map_err(db_error)?;
    let mut prunable = Vec::with_capacity(target.min(MANAGED_RUN_PRUNE_BATCH));
    let mut last_sequence = 0i64;
    let mut stmt = tx
        .prepare_cached(PRUNABLE_MANAGED_RUNS_SQL)
        .map_err(db_error)?;
    while prunable.len() < target {
        let batch = stmt
            .query_map(
                params![
                    last_sequence,
                    protected_run,
                    now_i64,
                    MANAGED_RUN_PRUNE_SCAN_PAGE
                ],
                |row| {
                    Ok((
                        row.get::<_, i64>(0)?,
                        row.get::<_, String>(1)?,
                        row.get::<_, String>(2)?,
                        row.get::<_, Option<String>>(3)?,
                    ))
                },
            )
            .map_err(db_error)?
            .collect::<Result<Vec<_>, _>>()
            .map_err(db_error)?;
        let exhausted = (batch.len() as i64) < MANAGED_RUN_PRUNE_SCAN_PAGE;
        for (sequence, run_id, status, active_checkpoint) in batch {
            last_sequence = sequence;
            if status == "failed"
                && let Some(payload) = active_checkpoint
            {
                let settled = serde_json::from_str::<crate::Checkpoint>(&payload)
                    .is_ok_and(|cp| !cp.state.has_pending_work());
                if !settled {
                    continue;
                }
            }
            prunable.push(run_id);
            if prunable.len() >= target {
                break;
            }
        }
        if exhausted {
            break;
        }
    }
    drop(stmt);
    let mut delete_run = tx
        .prepare_cached("DELETE FROM agent_runtime_managed_runs WHERE run_id=?1")
        .map_err(db_error)?;
    let mut delete_owner = tx
        .prepare_cached("DELETE FROM agent_runtime_work_owners WHERE run_id=?1")
        .map_err(db_error)?;
    let mut pruned = 0u64;
    for run_id in &prunable {
        pruned = pruned.saturating_add(delete_run.execute([run_id]).map_err(db_error)? as u64);
        delete_owner.execute([run_id]).map_err(db_error)?;
    }
    if count.saturating_sub(pruned) >= MANAGED_RUN_CAPACITY {
        return Err(Error::Checkpoint("managed run capacity exceeded".into()));
    }
    Ok(())
}

pub(in crate::supervisor) fn read_request(
    tx: &rusqlite::Transaction<'_>,
    run: &str,
) -> Result<Option<ManagedRunRequest>, Error> {
    let row: Option<(String, String)> = tx
        .query_row(
            "SELECT digest,payload FROM agent_runtime_managed_runs WHERE run_id=?1",
            [run],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .optional()
        .map_err(db_error)?;
    row.map(|(hash, payload)| {
        let request: ManagedRunRequest = serde_json::from_str(&payload).map_err(db_error)?;
        if request.run_id != run || request_digest(&request)? != hash {
            return Err(Error::Checkpoint(
                "managed run request identity changed".into(),
            ));
        }
        Ok(request)
    })
    .transpose()
}
impl RunSupervisor {
    /// Both the exact public request and existing frozen Program job commit
    /// together. Existing IDs never select a newly activated release.
    pub async fn submit_managed(
        &self,
        request: ManagedRunRequest,
        system: &CompiledSystem,
    ) -> Result<ManagedRun, Error> {
        self.submit_owned_work(request, system, None).await
    }

    pub(in crate::supervisor) async fn submit_owned_work(
        &self,
        request: ManagedRunRequest,
        system: &CompiledSystem,
        ownership: Option<crate::supervisor::work::WorkOwnership>,
    ) -> Result<ManagedRun, Error> {
        let hash = request_digest(&request)?;
        if request.system != system.bundle.document.name || request.release != system.bundle.digest
        {
            return Err(Error::Composition(
                "managed run release/system mismatch".into(),
            ));
        }
        let source = system.clone();
        let name = request.program.clone();
        let parameters = request.parameters.clone();
        let program =
            tokio::task::spawn_blocking(move || source.program_with_parameters(&name, parameters))
                .await
                .map_err(|e| Error::Checkpoint(format!("run parameter binding failed: {e}")))??;
        let submission = ProgramSubmission::for_program(
            &program,
            &request.thread_id,
            &request.run_id,
            request.input.clone(),
        )?;
        let clock = self.store.clock.clone();
        self.store.transaction(move |tx| {
            let now = clock.now_ms();
            if let Some(ownership) = &ownership {
                ownership.admit(tx, &request, &hash, now)?;
            }
            if let Some(previous) = read_request(tx, &request.run_id)? {
                if request_digest(&previous)? != hash {
                    return Err(Error::Checkpoint("managed run ID reused with different request".into()));
                }
            } else {
                ensure_managed_run_capacity(
                    tx,
                    now,
                    ownership.as_ref().map(|item| item.origin.as_str()),
                )?;
                // A pre-existing unmanaged job is never adopted by an API call.
                if load(tx, &request.run_id)?.is_some() {
                    return Err(Error::Checkpoint("run ID belongs to an unmanaged job".into()));
                }
            }
            let job = insert(tx, Saved {submission:submission.stored(),source:None}, now)?;
            tx.execute("INSERT INTO agent_runtime_managed_runs(run_id,digest,payload) VALUES(?1,?2,?3) ON CONFLICT(run_id) DO NOTHING",
                params![request.run_id,hash,serde_json::to_string(&request).map_err(db_error)?]).map_err(db_error)?;
            Ok(ManagedRun {sequence:job.sequence,request,status:job.status})
        }).await
    }
}
