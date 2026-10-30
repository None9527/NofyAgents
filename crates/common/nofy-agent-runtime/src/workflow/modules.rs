//! Published, frozen workflows can be configured as Tools or resumable Hook
//! handlers. Construction is pure; execution uses the existing workflow host.
use super::compile::CompiledWorkflow;
use crate::{hooks::*, registry::*, *};
use serde::Deserialize;
use serde_json::{Value, json};
use sha2::{Digest, Sha256};
use std::{collections::BTreeMap, sync::Arc};

#[derive(Clone)]
pub struct WorkflowLibrary {
    workflows: BTreeMap<String, CompiledWorkflow>,
    revision: String,
}
impl WorkflowLibrary {
    pub fn new(workflows: BTreeMap<String, CompiledWorkflow>) -> Result<Self, Error> {
        if workflows.is_empty()
            || workflows.len() > 128
            || workflows.keys().any(|k| k.is_empty() || k.len() > 4096)
        {
            return Err(Error::Composition(
                "workflow library requires 1..=128 bounded references".into(),
            ));
        }
        let versions = workflows
            .iter()
            .map(|(k, v)| (k, v.identity()))
            .collect::<BTreeMap<_, _>>();
        let revision = format!(
            "{:x}",
            Sha256::digest(
                serde_json::to_vec(&versions).map_err(|e| Error::Composition(e.to_string()))?
            )
        );
        Ok(Self {
            workflows,
            revision,
        })
    }
    fn get(&self, id: &str) -> Result<CompiledWorkflow, Error> {
        self.workflows.get(id).cloned().ok_or_else(|| {
            Error::Composition("workflow is not in the installed frozen library".into())
        })
    }
}
pub struct WorkflowToolFactory(pub WorkflowLibrary);
pub struct WorkflowHookFactory(pub WorkflowLibrary);
impl ModuleFactory for WorkflowToolFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        descriptor(
            "tool.workflow",
            &self.0,
            ModuleKind::ToolPack,
            json!({"type":"object","additionalProperties":false,"required":["workflow","name"],"properties":{"workflow":{"type":"string","enum":self.0.workflows.keys().collect::<Vec<_>>()},"name":{"type":"string","minLength":1},"description":{"type":"string"}}}),
        )
    }
    fn build(
        &self,
        config: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        #[derive(Deserialize)]
        #[serde(deny_unknown_fields)]
        struct Config {
            workflow: String,
            name: String,
            #[serde(default)]
            description: String,
        }
        let config: Config = serde_json::from_value(config.clone())
            .map_err(|e| Error::Composition(e.to_string()))?;
        let mut catalog = ToolCatalog::new();
        catalog.insert(
            self.0
                .get(&config.workflow)?
                .as_tool(config.name, config.description),
        )?;
        Ok(ModuleInstance::ToolPack(catalog))
    }
}
impl ModuleFactory for WorkflowHookFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        descriptor(
            "hook.workflow",
            &self.0,
            ModuleKind::HookHandler,
            json!({"type":"object","additionalProperties":false,"required":["workflow"],"properties":{"workflow":{"type":"string","enum":self.0.workflows.keys().collect::<Vec<_>>()}}}),
        )
    }
    fn build(
        &self,
        config: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        #[derive(Deserialize)]
        #[serde(deny_unknown_fields)]
        struct Config {
            workflow: String,
        }
        let config: Config = serde_json::from_value(config.clone())
            .map_err(|e| Error::Composition(e.to_string()))?;
        Ok(ModuleInstance::HookHandler(Arc::new(WorkflowHandler(
            self.0.get(&config.workflow)?,
        ))))
    }
}
fn descriptor(
    name: &str,
    library: &WorkflowLibrary,
    kind: ModuleKind,
    schema: Value,
) -> ModuleDescriptor {
    ModuleDescriptor {
        factory: name.into(),
        revision: format!("1:{}", library.revision),
        kind,
        config_schema: schema,
        input_schema: None,
        output_schema: None,
        required_capabilities: Default::default(),
        dependencies: Default::default(),
    }
}
struct WorkflowHandler(CompiledWorkflow);
#[async_trait::async_trait]
impl HookHandler for WorkflowHandler {
    fn recovery_identity(&self) -> Option<String> {
        Some(format!("workflow-hook-v1:{}", self.0.identity()))
    }
    async fn handle(&self, event: &HookEvent, context: &RunContext) -> Result<HookDecision, Error> {
        let invocation = context
            .capabilities
            .get::<HookInvocation>()
            .ok_or_else(|| {
                Error::Composition("workflow hook requires its exact HookInvocation".into())
            })?;
        let journal = context
            .capabilities
            .get::<HookJournalBinding>()
            .ok_or_else(|| {
                Error::Composition("workflow hook requires a shared HookJournal".into())
            })?;
        let store = journal.0.checkpoint_store();
        let identity =
            serde_json::to_vec(&(&event.id, &invocation.hook_identity, self.0.identity()))
                .map_err(|e| Error::Composition(e.to_string()))?;
        let mut child = context.clone();
        child.thread_id = format!("workflow-hook:{:x}", Sha256::digest(identity));
        child.run_id = child.thread_id.clone();
        let lineage = context.capabilities.get::<crate::events::RunLineage>();
        child.capabilities.insert(crate::events::RunLineage {
            root_run_id: lineage
                .as_ref()
                .map_or_else(|| context.run_id.clone(), |l| l.root_run_id.clone()),
            parent_run_id: Some(context.run_id.clone()),
            node_id: Some(invocation.hook_identity.clone()),
        });
        let input = serde_json::to_value(event).map_err(|e| Error::Composition(e.to_string()))?;
        super::spec::bounded_value(&input, 1024 * 1024, "workflow hook event")?;
        let runtime = crate::tool_program::ToolRuntime::single(
            self.0.as_tool("hook_workflow", "Execute the Hook workflow"),
        )?
        .with_checkpointer(store.clone());
        let program = runtime.program(ToolCall {
            id: "hook-root".into(),
            name: "hook_workflow".into(),
            arguments: json!({"input":input}),
        })?;
        if let Some(controller) = context
            .capabilities
            .get::<crate::controllers::ControllerBinding>()
            && let Some(source) = context.capabilities.get::<crate::hooks::HookSourceEvent>()
            && source.replayable
        {
            let parent = context
                .capabilities
                .get::<crate::controllers::ExecutionCheckpoint>()
                .ok_or_else(|| {
                    Error::Checkpoint(
                        "workflow Hook recovery requires its execution checkpoint".into(),
                    )
                })?;
            let cp = store.load(&parent.key).await?.ok_or_else(|| {
                Error::Checkpoint("workflow Hook parent checkpoint missing".into())
            })?;
            let bus = context
                .capabilities
                .get::<crate::hooks::HookBusBinding>()
                .ok_or_else(|| Error::Checkpoint("workflow Hook source bus missing".into()))?;
            if cp.version != 1
                || cp.composition != parent.composition
                || cp.state.execution_run_id != parent.run_id
            {
                return Err(Error::Checkpoint(
                    "workflow Hook parent checkpoint identity changed".into(),
                ));
            }
            journal
                .0
                .bind_controller(
                    bus.0.identity(),
                    event,
                    &invocation.hook_identity,
                    controller.location(),
                )
                .await?;
            controller
                .record_hook_route(crate::controllers::HookRoute {
                    run_id: child.run_id.clone(),
                    parent_run_id: context.run_id.clone(),
                    parent_thread_id: context.thread_id.clone(),
                    checkpoint_key: parent.key.clone(),
                    checkpoint_run_id: parent.run_id.clone(),
                    parent_composition: parent.composition.clone(),
                    parent_fingerprint: crate::controllers::parent_fingerprint(
                        &cp.state,
                        &source.event,
                    )?,
                    composition: program.composition_identity().into(),
                    workflow_identity: self.0.identity().into(),
                    controller_identity: self.recovery_identity().expect("workflow controller"),
                    bus_identity: bus.0.identity().into(),
                    hook_identity: invocation.hook_identity.clone(),
                    source: source.event.clone(),
                    event: event.clone(),
                })
                .await?;
        }
        // The admitted host's first checkpoint precedes graph initialization.
        let resume = store
            .load(&program.checkpoint_key(&child.thread_id))
            .await?
            .is_some();
        let observer = context
            .capabilities
            .get::<crate::composition::ChildObserverBinding>();
        if let Some(observer) = &observer {
            observer.0.started(context, &child, &program).await?;
        }
        let outcome = program
            .invoke(
                if resume {
                    RunInput::resume()
                } else {
                    RunInput::default()
                },
                child.clone(),
            )
            .await;
        if let Some(observer) = &observer {
            observer.0.finished(&child, &outcome).await?;
        }
        match outcome? {
            RunOutcome::Completed { state, .. } => {
                let output = state
                    .messages
                    .iter()
                    .rev()
                    .find_map(|m| match m {
                        Message::Tool {
                            content,
                            is_error: false,
                            ..
                        } => content.get("value").cloned(),
                        _ => None,
                    })
                    .ok_or_else(|| {
                        Error::Checkpoint("workflow hook has no committed result".into())
                    })?;
                serde_json::from_value(output).map_err(|e| {
                    Error::Composition(format!("workflow did not return a HookDecision: {e}"))
                })
            }
            RunOutcome::Paused { reason, .. } => Err(Error::GovernancePaused(
                json!({"kind":"hook_workflow_paused","event_id":event.id,"hook":invocation.hook_identity,"reason":reason}),
            )),
            RunOutcome::Cancelled { .. } => Err(Error::Cancelled),
            RunOutcome::BudgetExceeded { .. } => Err(Error::BudgetExceeded),
        }
    }
}
