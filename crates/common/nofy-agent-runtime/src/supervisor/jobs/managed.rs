//! Durable management admission uses the existing job transaction and root
//! lease. A network request never owns the lifetime of a model/tool execution.
use super::*;
mod abandonment;
mod actions;
pub use abandonment::Abandonment;
pub(in crate::supervisor) use abandonment::ensure_thread_open;
#[cfg(feature = "workflow")]
mod human;
mod query;
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
    /// Seal this thread without inventing a result for unresolved effects.
    Abandon {
        reason: String,
        acknowledge_unresolved: bool,
    },
    ReconcileModel {
        receipt: crate::governance::ModelReconciliation,
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
fn read_request(
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
        self.store.transaction(move |tx| {
            if let Some(previous) = read_request(tx, &request.run_id)? {
                if request_digest(&previous)? != hash {
                    return Err(Error::Checkpoint("managed run ID reused with different request".into()));
                }
            } else {
                let count: u64 = tx.query_row("SELECT COUNT(*) FROM agent_runtime_managed_runs",[],|r|r.get(0)).map_err(db_error)?;
                if count >= 10000 {return Err(Error::Checkpoint("managed run capacity exceeded".into()));}
                // A pre-existing unmanaged job is never adopted by an API call.
                if load(tx, &request.run_id)?.is_some() {
                    return Err(Error::Checkpoint("run ID belongs to an unmanaged job".into()));
                }
            }
            let job = insert(tx, Saved {submission:submission.stored(),source:None})?;
            tx.execute("INSERT INTO agent_runtime_managed_runs(run_id,digest,payload) VALUES(?1,?2,?3) ON CONFLICT(run_id) DO NOTHING",
                params![request.run_id,hash,serde_json::to_string(&request).map_err(db_error)?]).map_err(db_error)?;
            Ok(ManagedRun {sequence:job.sequence,request,status:job.status})
        }).await
    }
}
