use super::*;

impl CompiledWorkflow {
    pub async fn inspect(
        &self,
        store: &dyn Checkpointer,
        thread_id: &str,
        run_id: &str,
        reference: &crate::registry::ModuleRef,
    ) -> Result<Option<WorkflowProgress>, Error> {
        let key = graph_key(thread_id, run_id, reference);
        let Some(cp) = store.load(&key).await? else {
            return Ok(None);
        };
        if cp.version != 1 || cp.composition != self.identity() {
            return Err(Error::Checkpoint(
                "workflow state composition changed".into(),
            ));
        }
        let state: WorkflowProgress =
            serde_json::from_value(cp.state.data).map_err(|e| Error::Checkpoint(e.to_string()))?;
        validate_state(&state, run_id, reference)?;
        Ok(Some(state))
    }
    /// The caller must provide the same lease-fenced store as the active run.
    pub async fn respond(
        &self,
        store: &dyn Checkpointer,
        response: HumanResponse,
    ) -> Result<(), Error> {
        if response.command_id.trim().is_empty()
            || response.command_id.len() > 4096
            || response.workflow_identity != self.identity()
        {
            return Err(Error::Checkpoint("invalid human response identity".into()));
        }
        bounded_value(&response.value, 1024 * 1024, "human response")?;
        let spec = self
            .environment
            .plans
            .get(&response.reference)
            .ok_or_else(|| invalid("unknown workflow version"))?
            .spec();
        let node = spec
            .nodes
            .iter()
            .find(|n| n.id == response.node)
            .ok_or_else(|| invalid("unknown human node"))?;
        let NodeKind::Human { response_schema } = &node.action else {
            return Err(invalid("response targets a non-human node"));
        };
        crate::settings::validate_json_value(response_schema, &response.value)?;
        let key = graph_key(&response.thread_id, &response.run_id, &response.reference);
        let cp = store
            .load(&key)
            .await?
            .ok_or_else(|| Error::Checkpoint("workflow has not started".into()))?;
        if cp.version != 1 || cp.composition != self.identity() {
            return Err(Error::Checkpoint(
                "workflow state composition changed".into(),
            ));
        }
        let mut state: WorkflowProgress =
            serde_json::from_value(cp.state.data).map_err(|e| Error::Checkpoint(e.to_string()))?;
        validate_state(&state, &response.run_id, &response.reference)?;
        let receipt = HumanReceipt {
            command_id: response.command_id,
            value: response.value,
            request: response.expected_request,
        };
        if let Some(old) = state.human.get(&response.node) {
            if serde_json::to_value(old).ok() == serde_json::to_value(&receipt).ok() {
                return Ok(());
            }
            return Err(Error::Checkpoint("human decision cannot be changed".into()));
        }
        if state
            .human
            .values()
            .any(|old| old.command_id == receipt.command_id)
        {
            return Err(Error::Checkpoint("human command ID already used".into()));
        }
        match state.nodes.get(&response.node) {
            Some(NodeProgress::Waiting { input, .. }) if input == &receipt.request => {}
            _ => {
                return Err(Error::Checkpoint(
                    "human request is not waiting or changed".into(),
                ));
            }
        }
        state.human.insert(response.node, receipt);
        save_progress(store, &key, self.identity(), Some(cp.revision), &state).await?;
        Ok(())
    }
}
