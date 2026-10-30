use super::*;

impl Frame {
    pub(super) async fn apply_recovery(&mut self) -> Result<(), Error> {
        let Some(controller) = self
            .context
            .capabilities
            .get::<crate::controllers::ControllerBinding>()
        else {
            return Ok(());
        };
        let Some(retry) = controller.graph_retry(&self.key).await? else {
            return Ok(());
        };
        if retry.epoch <= self.state.control_epoch {
            return Ok(());
        }
        let route = retry.route;
        let halted_matches = match &self.state.halted {
            Some(GraphHalt::Failed { node, .. } | GraphHalt::Paused { node, .. }) => {
                node == &route.node
            }
            None => matches!(
                self.state.nodes.get(&route.node),
                Some(NodeProgress::Waiting { .. })
            ),
        };
        if self.state.output.is_some()
            || !self.state.facts.is_empty()
            || self.state.control_epoch != route.epoch
            || !halted_matches
            || route.reference != self.state.reference
            || route.composition != self.environment.identity
            || route.parent_run_id != self.context.run_id
            || route.parent_thread_id != self.context.thread_id
            || serde_json::to_value(self.state.nodes.get(&route.node))
                .map_err(|e| Error::Checkpoint(e.to_string()))?
                != route.failed
        {
            return Err(Error::Checkpoint(
                "workflow retry no longer matches its frozen failure".into(),
            ));
        }
        let plan = &self.environment.plans[&self.state.reference];
        let node = plan
            .spec()
            .nodes
            .iter()
            .find(|n| n.id == route.node)
            .ok_or_else(|| Error::Checkpoint("workflow retry node missing".into()))?;
        let values = self
            .state
            .nodes
            .iter()
            .filter_map(|(id, p)| p.value().map(|v| (id.clone(), v)))
            .collect();
        let input = match self.state.nodes.get(&route.node) {
            Some(NodeProgress::Waiting { input, .. }) => input.clone(),
            _ => node.input.evaluate(&self.state.input, &values)?,
        };
        crate::settings::validate_json_value(&node.input_schema, &input)?;
        self.state.nodes.insert(
            route.node.clone(),
            NodeProgress::Running {
                attempt: route.attempt,
                input: input.clone(),
            },
        );
        self.state.halted = None;
        self.state.control_epoch = retry.epoch;
        self.state.recovering = Some(route.node.clone());
        self.fact(
            "node_start",
            format!("node:{}:{}:start", route.node, route.attempt),
            json!({"node":route.node,"attempt":route.attempt,"input":input,"recovery":true}),
        );
        self.commit().await
    }

    // A parallel peer may have failed in the same batch. Resolve each known
    // failure explicitly before admitting dependants of an exhausted node.
    pub(super) async fn restore_failed_halt(&mut self) -> Result<(), Error> {
        if self.state.halted.is_some() || self.state.recovering.is_some() {
            return Ok(());
        }
        let plan = &self.environment.plans[&self.state.reference];
        for node in &plan.spec().nodes {
            let Some(NodeProgress::Failed { error, .. }) = self.state.nodes.get(&node.id) else {
                continue;
            };
            self.state.halted = match node.on_error.exhausted {
                FailureAction::Continue => continue,
                FailureAction::Fail => Some(GraphHalt::Failed {
                    node: node.id.clone(),
                    error: error.clone(),
                }),
                FailureAction::Pause => Some(GraphHalt::Paused {
                    node: node.id.clone(),
                    reason: json!({"kind":"workflow_node_failed","node":node.id,"error":error}),
                }),
            };
            self.commit().await?;
            break;
        }
        Ok(())
    }
}
