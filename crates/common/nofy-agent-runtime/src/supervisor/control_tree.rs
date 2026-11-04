use super::*;
impl TreeObserver {
    pub(super) async fn observe_control(
        &self,
        parent: &RunContext,
        record: crate::composition::ControlNodeRecord,
    ) -> Result<(), Error> {
        if record.context.run_id == parent.run_id {
            return Err(Error::Checkpoint(
                "control node cannot be its own parent".into(),
            ));
        }
        let value = ChildRunRecord {
            root_run_id: self.identity.run_id.clone(),
            parent_run_id: parent.run_id.clone(),
            run_id: record.context.run_id,
            thread_id: record.context.thread_id,
            agent_name: record.label,
            composition: record.composition,
            status: record.status,
            error: record.error,
            kind: Some(record.kind),
            checkpoint_key: Some(record.checkpoint_key),
            workflow_ref: Some(record.reference),
            node_id: Some(record.node_id),
        };
        let lease = self.identity.lease.clone();
        let clock = self.store.clock.clone();
        self.store.transaction_owned(lease.clone(), move|tx|{
            check_lease(tx,&lease,clock.now_ms())?;let key=child_key(&value.root_run_id,&value.run_id);
            let old:Option<String>=tx.query_row("SELECT payload FROM agent_runtime_children WHERE key=?1",[&key],|row|row.get(0)).optional().map_err(db_error)?;
            if let Some(old)=old {let old:ChildRunRecord=serde_json::from_str(&old).map_err(db_error)?;if old.parent_run_id!=value.parent_run_id || old.thread_id!=value.thread_id || old.agent_name!=value.agent_name || old.composition!=value.composition || old.kind!=value.kind || old.checkpoint_key!=value.checkpoint_key || old.workflow_ref!=value.workflow_ref || old.node_id!=value.node_id{return Err(Error::Checkpoint("workflow control node identity changed".into()));}}
            tx.execute("INSERT INTO agent_runtime_children(key,root_id,payload) VALUES(?1,?2,?3) ON CONFLICT(key) DO UPDATE SET payload=excluded.payload",params![key,value.root_run_id,serde_json::to_string(&value).map_err(db_error)?]).map_err(db_error)?;Ok(())
        }).await
    }
}
