//! Bounded advisory recovery views. Project metadata inside SQLite rather than
//! materializing every child's full configuration and transcript in memory.
use super::*;
#[cfg(test)]
mod tests;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ChildRecoveryTarget {
    pub root_run_id: String,
    pub run_id: String,
    pub thread_id: String,
    pub kind: String,
    pub checkpoint_revision: u64,
    pub model_sequence: u64,
    pub call: ToolCall,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ChildRecoveryPage {
    pub schema_version: u32,
    pub targets: Vec<ChildRecoveryTarget>,
    pub next: Option<String>,
}
impl SqliteStore {
    /// A view can change before an operator responds. Acceptance still verifies
    /// the full call, epoch and original child/root proof under the root lease.
    pub async fn child_recovery_targets(
        &self,
        root: &str,
        after: Option<&str>,
        limit: usize,
    ) -> Result<ChildRecoveryPage, Error> {
        if root.trim().is_empty()
            || root.len() > 4096
            || after.is_some_and(|s| s.len() > 4096)
            || !(1..=256).contains(&limit)
        {
            return Err(Error::Composition(
                "invalid child recovery page identity or limit".into(),
            ));
        }
        let root = root.to_owned();
        let after = after
            .map(|id| crate::supervisor::child_key(&root, id))
            .unwrap_or_default();
        self.transaction(move |tx| {
            let mut statement = tx.prepare("SELECT
                json_extract(c.payload,'$.root_run_id'),json_extract(c.payload,'$.run_id'),json_extract(c.payload,'$.thread_id'),
                COALESCE(json_extract(c.payload,'$.kind'),'agent'),p.revision,json_extract(p.payload,'$.version'),
                json_extract(p.payload,'$.composition')=json_extract(c.payload,'$.composition'),
                json_extract(p.payload,'$.state.execution_run_id'),COALESCE(json_extract(p.payload,'$.state.model_sequence'),0),
                json_extract(p.payload,'$.state.in_flight'),json_extract(p.payload,'$.state.pending_tools[0]')
                FROM agent_runtime_children c LEFT JOIN agent_runtime_checkpoints p ON p.key=COALESCE(
                    json_extract(c.payload,'$.checkpoint_key'),printf('%d:%s%s',
                        length(CAST(json_extract(c.payload,'$.agent_name') AS BLOB)),json_extract(c.payload,'$.agent_name'),json_extract(c.payload,'$.thread_id')))
                WHERE c.root_id=?1 AND c.key>?2 AND COALESCE(json_extract(c.payload,'$.kind'),'agent') IN ('agent','tool_program')
                ORDER BY c.key LIMIT ?3").map_err(db_error)?;
            let mut rows = statement.query(params![root,after,limit+1]).map_err(db_error)?;
            let mut targets = Vec::new();
            let mut last = None;
            // Reserve the envelope, separators and an escaped 4096-byte cursor.
            let mut bytes = 32 * 1024;
            let mut consumed = 0;
            while let Some(row) = rows.next().map_err(db_error)? {
                if consumed == limit { return Ok(ChildRecoveryPage {schema_version:1,targets,next:last}); }
                let root_id: String = row.get(0).map_err(db_error)?;
                let run: String = row.get(1).map_err(db_error)?;
                if root_id != root { return Err(Error::Checkpoint("child recovery root metadata changed".into())); }
                let revision: Option<u64> = row.get(4).map_err(db_error)?;
                if let Some(revision) = revision {
                    let version: Option<u32> = row.get(5).map_err(db_error)?;
                    let matches: Option<bool> = row.get(6).map_err(db_error)?;
                    let owner: Option<String> = row.get(7).map_err(db_error)?;
                    if version != Some(1) || matches != Some(true) || owner.as_ref().is_some_and(|id| id != &run) {
                        return Err(Error::Checkpoint("child recovery checkpoint identity changed".into()));
                    }
                    let call: Option<String> = row.get(9).map_err(db_error)?;
                    if let Some(call) = call {
                        let call: ToolCall = serde_json::from_str(&call).map_err(db_error)?;
                        let front: Option<String> = row.get(10).map_err(db_error)?;
                        let front: Option<ToolCall> = front.map(|s|serde_json::from_str(&s).map_err(db_error)).transpose()?;
                        if front.as_ref() != Some(&call) { return Err(Error::Checkpoint("child recovery intent is not its pending operation".into())); }
                        let target = ChildRecoveryTarget {
                            root_run_id:root.clone(),run_id:run.clone(),thread_id:row.get(2).map_err(db_error)?,kind:row.get(3).map_err(db_error)?,
                            checkpoint_revision:revision,model_sequence:row.get(8).map_err(db_error)?,call,
                        };
                        let size = serde_json::to_vec(&target).map_err(db_error)?.len();
                        if size > 8 * 1024 * 1024 - 32 * 1024 {return Err(Error::Checkpoint("child recovery target exceeds response limit".into()));}
                        if bytes + size > 8 * 1024 * 1024 {return Ok(ChildRecoveryPage {schema_version:1,targets,next:last});}
                        bytes += size;
                        targets.push(target);
                    }
                }
                consumed += 1;
                last = Some(run);
            }
            Ok(ChildRecoveryPage {schema_version:1,targets,next:None})
        }).await
    }
}
