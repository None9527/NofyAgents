//! A logical control-tree target selects a frozen graph. Client data never
//! grants access to an arbitrary checkpoint or a different root's decision.
use super::*;
use crate::{
    program::ProgramSnapshot,
    registry::{ModuleInstance, ModuleKind, ModuleRef, ModuleRegistry, ResolvedModule},
    workflow::{
        compile::CompiledWorkflow,
        graph::{HumanResponse, NodeProgress},
    },
};
#[cfg(test)]
mod tests;

pub(super) async fn prepare(
    snapshot: &RunSnapshot,
    command: &ManagedCommand,
    registry: &ModuleRegistry,
) -> Option<Result<CompiledWorkflow, Error>> {
    let ManagedCommand::Human { workflow_path, .. } = command else {
        return None;
    };
    let snapshot = snapshot.clone();
    let registry = registry.clone();
    let path = workflow_path.clone();
    Some(
        match tokio::task::spawn_blocking(move || select(&snapshot, &registry, &path)).await {
            Ok(result) => result,
            Err(error) => Err(Error::Checkpoint(format!(
                "human binding task failed: {error}"
            ))),
        },
    )
}
fn scope(
    host: &ModuleRegistry,
    modules: &[ResolvedModule],
    policies: &[ModuleRef],
    governance: &[ModuleRef],
) -> Result<(ModuleRegistry, Vec<ResolvedModule>), Error> {
    Ok((
        crate::compile::restore_modules(host, modules, policies, governance)?,
        modules.to_vec(),
    ))
}
fn select(
    snapshot: &RunSnapshot,
    host: &ModuleRegistry,
    path: &[ModuleRef],
) -> Result<CompiledWorkflow, Error> {
    if path.len() > 16 {
        return Err(Error::Composition(
            "human workflow path exceeds 16 modules".into(),
        ));
    }
    if path.is_empty() {
        return match snapshot {
            RunSnapshot::Program(crate::program::ExecutionSnapshot {
                program: ProgramSnapshot::Workflow { snapshot, .. },
                ..
            }) => snapshot.restore(host),
            _ => Err(Error::Composition(
                "human response requires a workflow resource path".into(),
            )),
        };
    }
    let (mut registry, mut modules) = match snapshot {
        RunSnapshot::Agent(s) => scope(
            host,
            &s.modules,
            &s.required_policies,
            &s.required_governance,
        )?,
        RunSnapshot::Program(s) => match &s.program {
            ProgramSnapshot::Agent { snapshot: s } => scope(
                host,
                &s.modules,
                &s.required_policies,
                &s.required_governance,
            )?,
            ProgramSnapshot::Tool { snapshot: s, .. } => scope(
                host,
                &s.modules,
                &s.required_policies,
                &s.required_governance,
            )?,
            ProgramSnapshot::Workflow { snapshot: s, .. } => scope(
                host,
                &s.modules,
                &s.required_policies,
                &s.required_governance,
            )?,
            ProgramSnapshot::Event { snapshot: s } => {
                let mut modules = s.host.modules.clone();
                modules.extend(s.modules.clone());
                scope(
                    host,
                    &modules,
                    &s.host.required_policies,
                    &s.host.required_governance,
                )?
            }
        },
    };
    for (index, reference) in path.iter().enumerate() {
        if !modules.iter().any(|m| &m.definition.reference == reference) {
            return Err(Error::Composition(
                "human workflow module is outside the frozen root".into(),
            ));
        }
        let resolved = registry.resolve_typed(&[(reference.clone(), ModuleKind::Resource)])?;
        let ModuleInstance::Resource(resource) = &resolved.instances[reference] else {
            unreachable!("typed resource")
        };
        let workflow = resource
            .get::<CompiledWorkflow>()
            .map(|workflow| (*workflow).clone())
            .ok_or_else(|| {
                Error::Composition("human path module is not a workflow resource".into())
            })?;
        if index + 1 == path.len() {
            return Ok(workflow);
        }
        (registry, modules) = scope(
            host,
            &workflow.snapshot.modules,
            &workflow.snapshot.required_policies,
            &workflow.snapshot.required_governance,
        )?;
    }
    unreachable!("nonempty bounded workflow path")
}

pub(super) async fn respond(
    supervisor: &RunSupervisor,
    compiled: &ExecutionPlan,
    job: &ExecutionJobRecord,
    lease: &Lease,
    action: &ManagedAction,
    workflow: CompiledWorkflow,
) -> Result<(), Error> {
    let ManagedCommand::Human {
        target_run_id,
        expected_request,
        value,
        ..
    } = &action.command
    else {
        unreachable!("human command")
    };
    let store = supervisor.store.guarded(lease);
    let root = store
        .load(&job.submission.thread_key())
        .await?
        .ok_or_else(|| Error::Checkpoint("human response root checkpoint missing".into()))?;
    if root.version != 1
        || root.composition != compiled.agent.composition_identity()
        || root.state.execution_run_id.as_deref() != Some(&action.run_id)
    {
        return Err(Error::Checkpoint(
            "human response root has advanced or changed".into(),
        ));
    }
    let child = supervisor
        .store
        .children(&action.run_id)
        .await?
        .into_iter()
        .find(|child| &child.run_id == target_run_id)
        .ok_or_else(|| Error::Checkpoint("human target is not a recorded descendant".into()))?;
    if child.root_run_id != action.run_id
        || child.kind.as_deref() != Some("workflow_human")
        || child.composition != workflow.identity()
        || child.thread_id != child.run_id
    {
        return Err(Error::Checkpoint(
            "human target ownership or workflow changed".into(),
        ));
    }
    let key = child
        .checkpoint_key
        .as_deref()
        .ok_or_else(|| Error::Checkpoint("human graph checkpoint missing".into()))?;
    let (namespace, thread, run, reference): (String, String, String, ModuleRef) =
        serde_json::from_str(key).map_err(db_error)?;
    let node = child
        .node_id
        .as_deref()
        .ok_or_else(|| Error::Checkpoint("human node missing".into()))?;
    if namespace != "workflow-graph-v1"
        || run != child.parent_run_id
        || Some(&reference) != child.workflow_ref.as_ref()
    {
        return Err(Error::Checkpoint("human graph address changed".into()));
    }
    let progress = workflow
        .inspect(&store, &thread, &run, &reference)
        .await?
        .ok_or_else(|| Error::Checkpoint("human workflow has not started".into()))?;
    let attempt = match progress.nodes.get(node) {
        Some(NodeProgress::Waiting { attempt, .. } | NodeProgress::Completed { attempt, .. }) => {
            *attempt
        }
        _ => {
            return Err(Error::Checkpoint(
                "human node is not waiting or previously answered".into(),
            ));
        }
    };
    let target = format!(
        "workflow-node:{:x}",
        Sha256::digest(serde_json::to_vec(&(&thread, &run, node, attempt)).map_err(db_error)?)
    );
    if target != child.run_id {
        return Err(Error::Checkpoint("human node attempt changed".into()));
    }
    workflow
        .respond(
            &store,
            HumanResponse {
                command_id: action.command_id.clone(),
                thread_id: thread,
                run_id: run,
                workflow_identity: workflow.identity().into(),
                reference,
                node: node.into(),
                expected_request: expected_request.clone(),
                value: value.clone(),
            },
        )
        .await
}
