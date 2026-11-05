//! Advisory Human waits derived from the original root snapshot and checkpoint.
//! A view grants no authority; the existing fenced Human command validates it.
use super::*;
use crate::workflow::spec::NodeKind;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct HumanRecoveryTarget {
    pub root_run_id: String,
    pub target_run_id: String,
    pub node_id: String,
    pub response_schema: serde_json::Value,
    /// Replace only value, then place this command inside a ManagedAction.
    pub command: ManagedCommand,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct HumanRecoveryPage {
    pub schema_version: u32,
    pub targets: Vec<HumanRecoveryTarget>,
}

fn root_modules(snapshot: &RunSnapshot) -> Vec<ResolvedModule> {
    match snapshot {
        RunSnapshot::Agent(s) => s.modules.clone(),
        RunSnapshot::Program(s) => match &s.program {
            ProgramSnapshot::Agent { snapshot: s } => s.modules.clone(),
            ProgramSnapshot::Tool { snapshot: s, .. } => s.modules.clone(),
            ProgramSnapshot::Workflow { snapshot: s, .. } => s.modules.clone(),
            ProgramSnapshot::Event { snapshot: s } => {
                let mut modules = s.host.modules.clone();
                modules.extend(s.modules.clone());
                modules
            }
        },
    }
}
fn locations(
    snapshot: RunSnapshot,
    host: ModuleRegistry,
) -> Result<Vec<(Vec<ModuleRef>, CompiledWorkflow)>, Error> {
    let mut queue = std::collections::VecDeque::new();
    let mut result = Vec::new();
    let mut seen = std::collections::BTreeSet::new();
    if matches!(&snapshot, RunSnapshot::Program(s) if matches!(s.program, ProgramSnapshot::Workflow { .. }))
    {
        queue.push_back(Vec::new());
    }
    for module in root_modules(&snapshot) {
        if module.definition.factory == "resource.workflow" {
            queue.push_back(vec![module.definition.reference]);
        }
    }
    while let Some(path) = queue.pop_front() {
        if path.len() > 16 || result.len() >= 256 {
            return Err(Error::Composition(
                "Human recovery workflow discovery exceeds its depth or graph limit".into(),
            ));
        }
        let workflow = select(&snapshot, &host, &path)?;
        if !seen.insert(workflow.identity().to_owned()) {
            continue;
        }
        for module in &workflow.snapshot.modules {
            if module.definition.factory == "resource.workflow" {
                let mut child = path.clone();
                child.push(module.definition.reference.clone());
                queue.push_back(child);
            }
        }
        result.push((path, workflow));
    }
    Ok(result)
}
impl RunSupervisor {
    pub async fn human_recovery_targets(
        &self,
        registry: &ModuleRegistry,
        root: &str,
    ) -> Result<HumanRecoveryPage, Error> {
        crate::system::bounded_name(root)?;
        let mut page = HumanRecoveryPage {
            schema_version: 1,
            targets: Vec::new(),
        };
        let Some(record) = self.store.execution_record(root).await? else {
            return Ok(page);
        };
        if record.status != "paused" {
            return Ok(page);
        }
        let children = self
            .store
            .children(root)
            .await?
            .into_iter()
            .filter(|c| c.kind.as_deref() == Some("workflow_human") && c.status == "waiting")
            .collect::<Vec<_>>();
        if children.is_empty() {
            return Ok(page);
        }
        let registry = registry.clone();
        let graphs = tokio::task::spawn_blocking(move || locations(record.snapshot, registry))
            .await
            .map_err(|e| {
                Error::Checkpoint(format!("Human recovery discovery task failed: {e}"))
            })??;
        for child in children {
            if child.root_run_id != root {
                return Err(Error::Checkpoint("Human recovery root changed".into()));
            }
            let (path, workflow) = graphs
                .iter()
                .find(|(_, w)| w.identity() == child.composition)
                .ok_or_else(|| {
                    Error::Checkpoint("waiting Human graph is outside the frozen root".into())
                })?;
            let key = child
                .checkpoint_key
                .as_deref()
                .ok_or_else(|| Error::Checkpoint("Human checkpoint missing".into()))?;
            let (namespace, thread, run, reference): (String, String, String, ModuleRef) =
                serde_json::from_str(key).map_err(db_error)?;
            if namespace != "workflow-graph-v1"
                || run != child.parent_run_id
                || child.workflow_ref.as_ref() != Some(&reference)
            {
                return Err(Error::Checkpoint(
                    "Human recovery graph address changed".into(),
                ));
            }
            let state = workflow
                .inspect(&self.store, &thread, &run, &reference)
                .await?
                .ok_or_else(|| Error::Checkpoint("Human recovery state missing".into()))?;
            let node_id = child
                .node_id
                .as_deref()
                .ok_or_else(|| Error::Checkpoint("Human node missing".into()))?;
            let Some(NodeProgress::Waiting { input, .. }) = state.nodes.get(node_id) else {
                continue;
            };
            let node = workflow
                .environment
                .plans
                .get(&reference)
                .and_then(|p| p.spec().nodes.iter().find(|n| n.id == node_id))
                .ok_or_else(|| {
                    Error::Checkpoint("Human recovery node missing from its frozen schema".into())
                })?;
            let NodeKind::Human { response_schema } = &node.action else {
                return Err(Error::Checkpoint(
                    "Human recovery target has another node kind".into(),
                ));
            };
            page.targets.push(HumanRecoveryTarget {
                root_run_id: root.into(),
                target_run_id: child.run_id.clone(),
                node_id: node_id.into(),
                response_schema: response_schema.clone(),
                command: ManagedCommand::Human {
                    target_run_id: child.run_id,
                    workflow_path: path.clone(),
                    expected_request: input.clone(),
                    value: serde_json::Value::Null,
                },
            });
            if page.targets.len() > 256
                || serde_json::to_vec(&page).map_err(db_error)?.len() > 8 * 1024 * 1024
            {
                return Err(Error::Checkpoint(
                    "Human recovery response exceeds its explicit response limit".into(),
                ));
            }
        }
        Ok(page)
    }
}
