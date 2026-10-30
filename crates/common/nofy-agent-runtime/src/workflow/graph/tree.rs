use super::*;
impl Frame {
    pub(super) async fn observe_node(&self, id: &str, status: Option<&str>) -> Result<(), Error> {
        let Some(observer) = self.context.capabilities.get::<ChildObserverBinding>() else {
            return Ok(());
        };
        let plan = &self.environment.plans[&self.state.reference];
        let node = plan
            .spec()
            .nodes
            .iter()
            .find(|n| n.id == id)
            .ok_or_else(|| Error::Checkpoint("control state references unknown node".into()))?;
        let progress = &self.state.nodes[id];
        let attempt = match progress {
            NodeProgress::Running { attempt, .. }
            | NodeProgress::Waiting { attempt, .. }
            | NodeProgress::Completed { attempt, .. }
            | NodeProgress::Failed { attempt, .. } => *attempt,
            NodeProgress::Skipped => 0,
        };
        let mut context = node::node_context(&self.context, id, attempt)?;
        // Keep every existing admitted Tool/Agent invocation identity intact.
        // Their logical control markers use a separate namespace.
        if matches!(node.action, NodeKind::Tool { .. } | NodeKind::Agent { .. }) {
            context.thread_id =
                context
                    .thread_id
                    .replacen("workflow-node:", "workflow-control:", 1);
            context.run_id = context.thread_id.clone();
        }
        let kind = match node.action {
            NodeKind::Tool { .. } => "workflow_tool",
            NodeKind::Agent { .. } => "workflow_agent",
            NodeKind::Prompt { .. } => "workflow_prompt",
            NodeKind::Transform => "workflow_transform",
            NodeKind::Condition { .. } => "workflow_condition",
            NodeKind::Join { .. } => "workflow_join",
            NodeKind::Human { .. } => "workflow_human",
            NodeKind::Subworkflow { .. } => "workflow_subworkflow",
            NodeKind::Loop { .. } => "workflow_loop",
        };
        let state = match progress {
            NodeProgress::Running { .. } => "running",
            NodeProgress::Waiting { .. } => "waiting",
            NodeProgress::Completed { .. } => "completed",
            NodeProgress::Failed { .. } => "failed",
            NodeProgress::Skipped => "skipped",
        };
        let error = match progress {
            NodeProgress::Failed { error, .. } => Some(error.clone()),
            _ => None,
        };
        observer
            .0
            .control(
                &self.context,
                crate::composition::ControlNodeRecord {
                    context,
                    label: format!("workflow.node:{id}"),
                    kind: kind.into(),
                    reference: self.state.reference.clone(),
                    node_id: id.into(),
                    checkpoint_key: self.key.clone(),
                    composition: self.environment.identity.clone(),
                    status: status.unwrap_or(state).into(),
                    error,
                },
            )
            .await
    }
}
pub(super) async fn observe_iteration(
    parent: &RunContext,
    child: &RunContext,
    environment: &Environment,
    reference: &crate::registry::ModuleRef,
    node_id: &str,
    iteration: u32,
    status: &str,
) -> Result<(), Error> {
    if let Some(observer) = parent.capabilities.get::<ChildObserverBinding>() {
        observer
            .0
            .control(
                parent,
                crate::composition::ControlNodeRecord {
                    context: child.clone(),
                    label: format!("workflow.iteration:{node_id}:{iteration}"),
                    kind: "workflow_iteration".into(),
                    reference: reference.clone(),
                    node_id: format!("{node_id}:{iteration}"),
                    checkpoint_key: graph_key(&child.thread_id, &child.run_id, reference),
                    composition: environment.identity.clone(),
                    status: status.into(),
                    error: None,
                },
            )
            .await?;
    }
    Ok(())
}
