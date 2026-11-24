use super::*;
use crate::{
    mailbox::{InputAddress, cancel_in_transaction},
    system::{bounded_name, content_digest},
};

#[derive(Clone, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case", deny_unknown_fields)]
pub enum WorkAction {
    Cancel,
    Resume,
    RetryModel {
        ticket: crate::supervisor::RunControlCommand,
    },
    #[cfg(feature = "workflow")]
    Human {
        #[serde(default)]
        workflow_path: Vec<crate::registry::ModuleRef>,
        expected_request: serde_json::Value,
        value: serde_json::Value,
    },
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct WorkCommand {
    pub work_id: String,
    pub command_id: String,
    pub expected_revision: String,
    pub action: WorkAction,
}

#[derive(Serialize)]
pub struct WorkControlReceipt {
    pub work_id: String,
    pub run_id: String,
    pub command_id: String,
    pub phase: &'static str,
    pub cancellation_cursor: Option<String>,
    pub action_id: Option<String>,
}

const WORK_COMMAND_CAPACITY: u64 = 1_024;
const WORK_COMMAND_PRUNE_BATCH: i64 = 128;

const PRUNE_COMPLETED_WORK_COMMANDS_SQL: &str = "DELETE FROM agent_runtime_work_commands
WHERE rowid IN (
    SELECT c.rowid
    FROM agent_runtime_work_commands c
    WHERE c.scope = ?1
      AND json_valid(c.receipt)
      AND (
          json_extract(c.receipt, '$.phase') = 'settled'
          OR json_extract(c.receipt, '$.action_id') IS NOT NULL
          OR json_extract(c.receipt, '$.cancellation_cursor') IS NOT NULL
      )
      AND (
          json_extract(c.receipt, '$.action_id') IS NULL
          OR NOT EXISTS (
              SELECT 1 FROM agent_runtime_managed_actions a
              WHERE a.command_id = json_extract(c.receipt, '$.action_id')
                AND a.result IS NULL
          )
      )
      AND (
          json_extract(c.receipt, '$.cancellation_cursor') IS NULL
          OR NOT EXISTS (
              SELECT 1 FROM agent_runtime_cancel k
              WHERE k.sequence = CAST(json_extract(c.receipt, '$.cancellation_cursor') AS INTEGER)
                AND k.acknowledged = 0
          )
      )
    ORDER BY c.rowid ASC
    LIMIT ?2
)";

impl SqliteStore {
    pub async fn control_work(
        &self,
        scope: &str,
        root: &str,
        command: WorkCommand,
        caller: Option<WorkCaller>,
    ) -> Result<serde_json::Value, Error> {
        bounded_name(scope)?;
        bounded_name(root)?;
        bounded_name(&command.command_id)?;
        let scope = scope.to_owned();
        let root = root.to_owned();
        let clock = self.clock.clone();
        self.transaction(move |tx| {
            let now = clock.now_ms();
            if let Some(caller) = &caller {
                caller.check(tx, now)?;
            }
            let digest = content_digest(&(&root, &command))?;
            let previous: Option<(String, String)> = tx.query_row(
                "SELECT digest,receipt FROM agent_runtime_work_commands WHERE scope=?1 AND command_id=?2",
                params![scope, command.command_id], |row| Ok((row.get(0)?,row.get(1)?)),
            ).optional().map_err(db_error)?;
            if let Some((hash, receipt)) = previous {
                if hash != digest {
                    return Err(Error::Checkpoint("work control ID reused with different input".into()));
                }
                return serde_json::from_str(&receipt).map_err(db_error);
            }
            let node = inspect_node(tx, &root, &command.work_id)?
                .ok_or_else(|| Error::Composition("work identity was not found in the selected root".into()))?;
            if node.revision != command.expected_revision {
                return Err(Error::Checkpoint(format!("stale work revision; current revision is {}", node.revision)));
            }
            let count: u64 = tx
                .query_row(
                    "SELECT COUNT(*) FROM agent_runtime_work_commands WHERE scope=?1",
                    [&scope],
                    |row| row.get(0),
                )
                .map_err(db_error)?;
            if count >= WORK_COMMAND_CAPACITY {
                let needed = i64::try_from(
                    count
                        .saturating_sub(WORK_COMMAND_CAPACITY)
                        .saturating_add(1),
                )
                .unwrap_or(i64::MAX);
                let limit = needed.max(WORK_COMMAND_PRUNE_BATCH);
                let pruned = tx
                    .execute(PRUNE_COMPLETED_WORK_COMMANDS_SQL, params![&scope, limit])
                    .map_err(db_error)?;
                if count.saturating_sub(pruned as u64) >= WORK_COMMAND_CAPACITY {
                    return Err(Error::Checkpoint("work command capacity exceeded".into()));
                }
            }
            let mut receipt = WorkControlReceipt {
                work_id: node.work_id.clone(), run_id: node.run_id.clone(),
                command_id: command.command_id.clone(), phase: "accepted",
                cancellation_cursor:None,action_id:None,
            };
            let native_id = format!("work-control:{}", content_digest(&(&scope,&command.command_id))?);
            match command.action {
                WorkAction::Cancel if node.actions.contains(&"cancel") => {
                    let address = if node.run_id == root {
                        let record: Option<String> = tx.query_row(
                            "SELECT payload FROM agent_runtime_runs WHERE id=?1", [&root], |row|row.get(0)
                        ).optional().map_err(db_error)?;
                        if let Some(record) = record {
                            let record: ExecutionRecord = serde_json::from_str(&record).map_err(db_error)?;
                            Some(InputAddress {
                                root_run_id: root.clone(),run_id:root.clone(),thread_id:record.thread_id,
                                agent:record.snapshot.name().into(),
                            })
                        } else {
                            jobs::cancel_queued(tx,&root,now)?;
                            receipt.phase = "settled";
                            None
                        }
                    } else {
                        let record: String = tx.query_row(
                            "SELECT payload FROM agent_runtime_children WHERE root_id=?1 AND key=?2",
                            params![root,child_key(&root,&node.run_id)], |row|row.get(0),
                        ).map_err(db_error)?;
                        let record: ChildRunRecord = serde_json::from_str(&record).map_err(db_error)?;
                        Some(InputAddress {
                            root_run_id:root.clone(),run_id:record.run_id,thread_id:record.thread_id,agent:record.agent_name,
                        })
                    };
                    if let Some(address) = address {
                        let seq = cancel_in_transaction(tx,&address,&native_id)?;
                        receipt.cancellation_cursor = Some(seq.to_string());
                        if node.run_id == root && node.native_status == "paused" && node.kind == "workflow" {
                            jobs::enqueue_work_action(tx, &jobs::ManagedAction {
                                command_id:native_id.clone(),run_id:root,command:jobs::ManagedCommand::Resume,
                            }, false)?;
                            receipt.action_id = Some(native_id);
                        }
                    }
                }
                WorkAction::Resume if node.actions.contains(&"resume") => {
                    jobs::enqueue_work_action(tx, &jobs::ManagedAction {
                        command_id:native_id.clone(),run_id:root,command:jobs::ManagedCommand::Resume,
                    },false)?;
                    receipt.action_id = Some(native_id);
                }
                WorkAction::RetryModel { ticket: RunControlCommand::RetryModel(ticket) }
                    if node.run_id == root && matches!(node.native_status.as_str(),"paused" | "failed" | "truncated") =>
                {
                    let id = ticket.command_id.clone();
                    jobs::enqueue_work_action(tx, &jobs::ManagedAction {
                        command_id:id.clone(),run_id:root,command:jobs::ManagedCommand::Control {
                            control:RunControlCommand::RetryModel(ticket),
                        },
                    },false)?;
                    receipt.action_id = Some(id);
                }
                #[cfg(feature = "workflow")]
                WorkAction::Human { workflow_path, expected_request, value } if node.actions.contains(&"human") => {
                    jobs::enqueue_work_action(tx, &jobs::ManagedAction {
                        command_id:native_id.clone(),run_id:root,command:jobs::ManagedCommand::Human {
                            target_run_id:node.run_id,workflow_path,expected_request,value,
                        },
                    }, false)?;
                    receipt.action_id = Some(native_id);
                }
                _ => return Err(Error::Composition(format!("control unavailable for work in state {}",node.status))),
            }
            let value = serde_json::to_value(&receipt).map_err(db_error)?;
            tx.execute(
                "INSERT INTO agent_runtime_work_commands(scope,command_id,digest,receipt) VALUES(?1,?2,?3,?4)",
                params![scope, command.command_id, digest, value.to_string()],
            ).map_err(db_error)?;
            Ok(value)
        }).await
    }
}
