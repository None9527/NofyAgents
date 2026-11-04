use super::*;
use nofy_agent_runtime::{
    Checkpointer,
    durable::SqliteStore,
    supervisor::jobs::{JobStatus, ManagedCommand, ParkStatus},
};
use nofy_agent_runtime::{
    program::{ProgramSnapshot, RunSnapshot},
    registry::{ModuleDefinition, ResolvedModule},
};
use std::collections::BTreeSet;

pub(crate) struct ExecutionMemoryLease {
    _leases: Vec<control::MemoryLease>,
}
fn definitions(modules: &[ResolvedModule]) -> Result<BTreeSet<String>> {
    fn collect(
        module: &ModuleDefinition,
        depth: usize,
        result: &mut BTreeSet<String>,
    ) -> Result<()> {
        if depth > 16 {
            return Err(invalid(
                "memory dependency nesting exceeds the supported bound",
            ));
        }
        if matches!(
            module.factory.as_str(),
            "resource.memory" | "resource.memory_learning"
        ) {
            let namespace = module
                .config
                .get("backend")
                .and_then(|b| b.get("namespace"))
                .and_then(Value::as_str)
                .ok_or_else(unavailable)?;
            if !valid_namespace(namespace) {
                return Err(unavailable());
            }
            result.insert(namespace.into());
        } else if module.factory == "resource.workflow" {
            let document = module.config.get("document").ok_or_else(unavailable)?;
            let children: Vec<ModuleDefinition> = serde_json::from_value(
                document
                    .get("modules")
                    .cloned()
                    .unwrap_or_else(|| json!([])),
            )
            .map_err(|_| unavailable())?;
            for child in children {
                collect(&child, depth + 1, result)?;
            }
        }
        Ok(())
    }
    let mut result = BTreeSet::new();
    for module in modules {
        collect(&module.definition, 0, &mut result)?;
    }
    Ok(result)
}
fn program_namespaces(program: &ProgramSnapshot) -> Result<BTreeSet<String>> {
    let modules: &[ResolvedModule] = match program {
        ProgramSnapshot::Agent { snapshot } => &snapshot.modules,
        ProgramSnapshot::Tool { snapshot, .. } => &snapshot.modules,
        ProgramSnapshot::Workflow { snapshot, .. } => &snapshot.modules,
        ProgramSnapshot::Event { snapshot } => {
            let mut result = definitions(&snapshot.host.modules)?;
            result.extend(definitions(&snapshot.modules)?);
            return Ok(result);
        }
    };
    definitions(modules)
}
fn namespaces(snapshot: &RunSnapshot) -> Result<BTreeSet<String>> {
    match snapshot {
        RunSnapshot::Agent(snapshot) => definitions(&snapshot.modules),
        RunSnapshot::Program(snapshot) => program_namespaces(&snapshot.program),
    }
}
fn administrative(command: &ManagedCommand) -> bool {
    matches!(
        command,
        ManagedCommand::Park
            | ManagedCommand::Unpark { .. }
            | ManagedCommand::Transition { .. }
            | ManagedCommand::UpdateModules { .. }
            | ManagedCommand::Abandon { .. }
    )
}
impl Provider {
    async fn admit_namespaces(&self, names: BTreeSet<String>) -> Result<ExecutionMemoryLease> {
        if names.is_empty() {
            return Ok(ExecutionMemoryLease { _leases: vec![] });
        }
        if names.iter().any(|name| !valid_namespace(name)) {
            return Err(unavailable());
        }
        let provider = self.clone();
        tokio::task::spawn_blocking(move || {
            let mut leases = vec![];
            for name in names {
                let lease = provider.control.namespace_lease(&name, false)?;
                provider.resolved(&name)?;
                leases.push(lease);
            }
            Ok(ExecutionMemoryLease { _leases: leases })
        })
        .await
        .map_err(|_| unavailable())?
    }
    pub(crate) async fn admit_program(
        &self,
        program: &nofy_agent_runtime::program::CompiledProgram,
    ) -> Result<ExecutionMemoryLease> {
        self.admit_namespaces(program_namespaces(&program.snapshot.program)?)
            .await
    }
    pub(crate) async fn admit_execution(
        &self,
        store: &SqliteStore,
        run: &str,
        action: Option<&str>,
    ) -> Result<ExecutionMemoryLease> {
        if let Some(id) = action
            && let Some(record) = store.managed_action(id).await?
            && administrative(&record.action.command)
        {
            return Ok(ExecutionMemoryLease { _leases: vec![] });
        }
        let Some(job) = store.execution_job(run).await? else {
            return Ok(ExecutionMemoryLease { _leases: vec![] });
        };
        // Durable historical readbacks never acquire or probe retired stores.
        if matches!(
            job.status,
            JobStatus::Closed | JobStatus::Cancelled | JobStatus::Abandoned
        ) {
            return Ok(ExecutionMemoryLease { _leases: vec![] });
        }
        let live = store.live_execution(run).await?;
        let snapshot = live
            .as_ref()
            .map_or(&job.submission.snapshot, |live| &live.snapshot);
        let names = namespaces(snapshot)?;
        self.admit_namespaces(names).await
    }
    /// Inspect the current managed roots, not cached UI state or only the
    /// resource that happens to be selected by the migration request.
    pub(crate) async fn ensure_quiescent(
        &self,
        store: &SqliteStore,
        names: &[String],
    ) -> Result<()> {
        let mut cursor = 0;
        loop {
            let runs = store.managed_runs(cursor, 256).await?;
            if runs.is_empty() {
                return Ok(());
            }
            for run in runs {
                cursor = run.sequence;
                let Some(job) = store.execution_job(&run.request.run_id).await? else {
                    continue;
                };
                let live = store.live_execution(&run.request.run_id).await?;
                let snapshot = live
                    .as_ref()
                    .map_or(&job.submission.snapshot, |live| &live.snapshot);
                let used = namespaces(snapshot)?;
                if !names.iter().any(|name| used.contains(name)) {
                    continue;
                }
                let terminal = matches!(
                    job.status,
                    JobStatus::Closed | JobStatus::Cancelled | JobStatus::Abandoned
                );
                let key = format!(
                    "{}:{}{}",
                    snapshot.name().len(),
                    snapshot.name(),
                    job.submission.thread_id
                );
                let checkpoint = store.load(&key).await?;
                if let Some(checkpoint) = checkpoint {
                    let current = checkpoint.state.execution_run_id.as_deref();
                    if current.is_none_or(|id| id == run.request.run_id)
                        && checkpoint.state.has_pending_work()
                    {
                        return Err(invalid(
                            "memory namespace still has pending run effects; settle them before migration",
                        ));
                    }
                }
                if terminal {
                    continue;
                }
                let parked = store
                    .parking(&run.request.run_id)
                    .await?
                    .is_some_and(|park| park.status == ParkStatus::Parked);
                if !parked {
                    return Err(invalid(
                        "park every unfinished run using the memory namespace before migration",
                    ));
                }
            }
        }
    }
}
