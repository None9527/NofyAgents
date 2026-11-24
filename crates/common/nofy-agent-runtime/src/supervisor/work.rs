use super::*;
use serde_json::json;
mod changes;
mod commands;
mod ownership;
pub use changes::{SessionWorkPage, WorkChange, WorkChanges};
pub use commands::{WorkAction, WorkCommand, WorkControlReceipt};
pub use ownership::WorkAdmission;
/// Proof that an embedded tool is acting from the currently fenced root.
#[derive(Clone)]
pub struct WorkCaller(SupervisedIdentity);

impl WorkCaller {
    pub fn from_context(context: &RunContext) -> Option<Self> {
        let identity = context.capabilities.get::<SupervisedIdentity>()?;
        (identity.run_id == context.run_id).then(|| Self((*identity).clone()))
    }

    pub fn run_id(&self) -> &str {
        &self.0.run_id
    }

    fn check(&self, tx: &rusqlite::Transaction<'_>, now: u64) -> Result<(), Error> {
        check_lease(tx, &self.0.lease, now)
    }
}
pub(in crate::supervisor) use ownership::WorkOwnership;
use ownership::*;

#[derive(Serialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum WorkBlocker {
    Parked,
    Approval {
        run_id: String,
        call_id: String,
    },
    HumanInput {
        run_id: String,
    },
    Reconciliation {
        run_id: String,
        reason: &'static str,
    },
}

#[derive(Serialize)]
pub struct WorkNode {
    pub work_id: String,
    pub run_id: String,
    pub root_run_id: String,
    pub parent_work_id: Option<String>,
    pub kind: String,
    pub name: String,
    pub status: String,
    pub native_status: String,
    pub revision: String,
    pub node_id: Option<String>,
    pub workflow: Option<crate::registry::ModuleRef>,
    pub blocked_by: Option<WorkBlocker>,
    pub actions: Vec<&'static str>,
    pub cancellation_pending: bool,
}

#[derive(Serialize)]
pub struct WorkPage {
    pub protocol: &'static str,
    pub root: WorkNode,
    pub items: Vec<WorkNode>,
    pub next_cursor: Option<String>,
    pub watermark: String,
}

impl SqliteStore {
    /// Authorize a root Agent to observe its own run or a prior turn in its exact session.
    pub async fn work_scope_allows(&self, caller: &str, root: &str) -> Result<bool, Error> {
        crate::system::bounded_name(caller)?;
        crate::system::bounded_name(root)?;
        if caller == root {
            return Ok(true);
        }
        let (caller, root) = (caller.to_owned(), root.to_owned());
        self.read_transaction(move |tx| {
            tx.query_row(
                "WITH here AS (
                   SELECT session_id,sequence FROM agent_runtime_session_turns WHERE run_id=?1
                   UNION ALL SELECT session_id,NULL FROM agent_runtime_work_owners WHERE run_id=?1
                 ) SELECT EXISTS(SELECT 1 FROM here
                   JOIN agent_runtime_session_turns earlier ON earlier.session_id=here.session_id
                   WHERE earlier.run_id=?2 AND (here.sequence IS NULL OR earlier.sequence<here.sequence))
                 OR EXISTS(SELECT 1 FROM here JOIN agent_runtime_work_owners w ON w.session_id=here.session_id
                   WHERE w.run_id=?2)",
                params![caller, root],
                |row| row.get(0),
            )
            .map_err(db_error)
        })
        .await
    }

    pub async fn work_list(
        &self,
        root: &str,
        after: Option<String>,
        limit: usize,
    ) -> Result<Option<WorkPage>, Error> {
        crate::system::bounded_name(root)?;
        if !(1..=64).contains(&limit) {
            return Err(Error::Composition("work page limit must be 1..=64".into()));
        }
        let after = match after {
            Some(cursor) => {
                let (version, owner, child): (u8, String, String) =
                    serde_json::from_str(&cursor)
                        .map_err(|_| Error::Composition("invalid work cursor".into()))?;
                if version != 1 || owner != root || child.is_empty() || child.len() > 1024 {
                    return Err(Error::Composition("invalid work cursor scope".into()));
                }
                child_key(root, &child)
            }
            None => String::new(),
        };
        let root = root.to_owned();
        self.read_transaction(move |tx| {
            let Some(root_node) = root_node(tx, &root)? else {
                return Ok(None);
            };
            let mut statement = tx
                .prepare(
                    "SELECT payload FROM agent_runtime_children
                 WHERE root_id=?1 AND key>?2 ORDER BY key LIMIT ?3",
                )
                .map_err(db_error)?;
            let records = statement
                .query_map(params![root, after, limit + 1], |row| {
                    row.get::<_, String>(0)
                })
                .map_err(db_error)?
                .map(|row| {
                    serde_json::from_str::<ChildRunRecord>(&row.map_err(db_error)?)
                        .map_err(db_error)
                })
                .collect::<Result<Vec<_>, _>>()?;
            let next_cursor = (records.len() > limit)
                .then(|| json!([1, root, records[limit - 1].run_id]).to_string());
            let items = records
                .into_iter()
                .take(limit)
                .map(|record| child_node(tx, &root, record))
                .collect::<Result<_, _>>()?;
            Ok(Some(WorkPage {
                protocol: "nofy.work/v1",
                root: root_node,
                items,
                next_cursor,
                watermark: changes::cursor("root", &root, changes::high_watermark(tx)?),
            }))
        })
        .await
    }

    pub async fn work_inspect(&self, root: &str, work: &str) -> Result<Option<WorkNode>, Error> {
        crate::system::bounded_name(root)?;
        if work.is_empty() || work.len() > 1024 {
            return Err(Error::Composition("invalid work identity".into()));
        }
        let (root, work) = (root.to_owned(), work.to_owned());
        self.read_transaction(move |tx| inspect_node(tx, &root, &work))
            .await
    }
}

fn inspect_node(
    tx: &rusqlite::Transaction<'_>,
    root: &str,
    work: &str,
) -> Result<Option<WorkNode>, Error> {
    if root == work || root == resolve_run(tx, work)? {
        return root_node(tx, root);
    }
    let record: Option<String> = tx
        .query_row(
            "SELECT payload FROM agent_runtime_children WHERE key=?1 AND root_id=?2",
            params![child_key(root, work), root],
            |row| row.get(0),
        )
        .optional()
        .map_err(db_error)?;
    record
        .map(|payload| {
            let record: ChildRunRecord = serde_json::from_str(&payload).map_err(db_error)?;
            if record.run_id != work {
                return Err(Error::Checkpoint("work identity changed".into()));
            }
            child_node(tx, root, record)
        })
        .transpose()
}

fn root_node(tx: &rusqlite::Transaction<'_>, root: &str) -> Result<Option<WorkNode>, Error> {
    let Some((name, status, program, parked, work_id, origin)) = tx
        .query_row(
            "SELECT json_extract(m.payload,'$.program'),
         coalesce(json_extract(r.payload,'$.status'),j.status,'queued'),
         coalesce(json_extract(r.payload,'$.snapshot.program.kind'),w.kind,'run'),
         EXISTS(SELECT 1 FROM agent_runtime_parks p WHERE p.run_id=m.run_id AND p.status='parked'),
         coalesce(w.work_id,m.run_id),w.origin_run_id
         FROM agent_runtime_managed_runs m LEFT JOIN agent_runtime_runs r ON r.id=m.run_id
           LEFT JOIN agent_runtime_jobs j ON j.run_id=m.run_id
           LEFT JOIN agent_runtime_work_owners w ON w.run_id=m.run_id WHERE m.run_id=?1",
            [root],
            |row| {
                Ok((
                    row.get::<_, String>(0)?,
                    row.get::<_, String>(1)?,
                    row.get::<_, String>(2)?,
                    row.get::<_, bool>(3)?,
                    row.get::<_, String>(4)?,
                    row.get::<_, Option<String>>(5)?,
                ))
            },
        )
        .optional()
        .map_err(db_error)?
    else {
        return Ok(None);
    };
    let mut node = WorkNode {
        work_id,
        run_id: root.into(),
        root_run_id: root.into(),
        parent_work_id: origin.map(|run| logical_id(tx, &run)).transpose()?,
        kind: program,
        name,
        status: String::new(),
        native_status: status,
        revision: String::new(),
        node_id: None,
        workflow: None,
        blocked_by: parked.then_some(WorkBlocker::Parked),
        actions: Vec::new(),
        cancellation_pending: false,
    };
    finish_node(tx, &mut node)?;
    Ok(Some(node))
}

fn child_node(
    tx: &rusqlite::Transaction<'_>,
    root: &str,
    record: ChildRunRecord,
) -> Result<WorkNode, Error> {
    if record.root_run_id != root {
        return Err(Error::Checkpoint("work lineage changed".into()));
    }
    let mut node = WorkNode {
        work_id: record.run_id.clone(),
        run_id: record.run_id,
        root_run_id: root.into(),
        parent_work_id: Some(logical_id(tx, &record.parent_run_id)?),
        kind: record.kind.unwrap_or_else(|| "agent".into()),
        name: record.agent_name,
        status: String::new(),
        native_status: record.status,
        revision: String::new(),
        node_id: record.node_id,
        workflow: record.workflow_ref,
        blocked_by: None,
        actions: Vec::new(),
        cancellation_pending: false,
    };
    finish_node(tx, &mut node)?;
    Ok(node)
}

fn finish_node(tx: &rusqlite::Transaction<'_>, node: &mut WorkNode) -> Result<(), Error> {
    if matches!(
        node.native_status.as_str(),
        "running" | "paused" | "waiting"
    ) {
        if node.blocked_by.is_none() {
            let approval: Option<String> = tx
                .query_row(
                    "SELECT json_extract(call_json,'$.id') FROM agent_runtime_approvals
                 WHERE run_id=?1 AND decision IS NULL ORDER BY key LIMIT 1",
                    [&node.run_id],
                    |row| row.get(0),
                )
                .optional()
                .map_err(db_error)?;
            if let Some(call_id) = approval
                && storage::approval_is_open(tx, &node.run_id)?
            {
                node.blocked_by = Some(WorkBlocker::Approval {
                    run_id: node.run_id.clone(),
                    call_id,
                });
            }
        }
        if node.blocked_by.is_none()
            && node.kind == "workflow_human"
            && node.native_status == "waiting"
        {
            node.blocked_by = Some(WorkBlocker::HumanInput {
                run_id: node.run_id.clone(),
            });
        }
    }
    let is_root = node.run_id == node.root_run_id;
    if is_root && node.native_status == "paused" && node.blocked_by.is_none() {
        node.blocked_by = reconciliation_blocker(tx, &node.run_id)?;
    }
    node.status = if node.blocked_by.is_some() {
        "waiting"
    } else {
        match node.native_status.as_str() {
            "initializing" => "queued",
            "paused" => "waiting",
            "refused" | "truncated" | "budget_exceeded" | "abandoned" | "closed" => "failed",
            status => status,
        }
    }
    .into();
    let active = matches!(node.status.as_str(), "queued" | "running" | "waiting");
    node.cancellation_pending = active
        && tx
            .query_row(
                "SELECT EXISTS(SELECT 1 FROM agent_runtime_cancel WHERE acknowledged=0
         AND json_extract(address,'$.run_id')=?1 AND json_extract(address,'$.root_run_id')=?2)",
                params![node.run_id, node.root_run_id],
                |row| row.get(0),
            )
            .map_err(db_error)?;
    if (is_root || node.kind == "agent") && active && !node.cancellation_pending {
        node.actions.push("cancel");
    }
    if is_root
        && node.native_status == "paused"
        && node.blocked_by.is_none()
        && !node.cancellation_pending
    {
        node.actions.push("resume");
    }
    if matches!(node.blocked_by, Some(WorkBlocker::HumanInput { .. })) {
        node.actions.push("human");
    }
    let change: Option<i64> = tx
        .query_row(
            "SELECT max(cursor) FROM agent_runtime_work_changes WHERE root_id=?1 AND run_id=?2",
            params![node.root_run_id, node.run_id],
            |row| row.get(0),
        )
        .map_err(db_error)?;
    node.revision = crate::system::content_digest(&(&node, change))?;
    Ok(())
}

fn reconciliation_blocker(
    tx: &rusqlite::Transaction<'_>,
    root: &str,
) -> Result<Option<WorkBlocker>, Error> {
    let pause: Option<String> = tx
        .query_row(
            "SELECT payload -> '$.outcome.Paused.reason' FROM agent_runtime_runs WHERE id=?1",
            [root],
            |row| row.get(0),
        )
        .optional()
        .map_err(db_error)?
        .flatten();
    let Some(pause) = pause else {
        return Ok(None);
    };
    let pause: serde_json::Value = serde_json::from_str(&pause).map_err(db_error)?;
    let Some((reason, candidate)) = reconciliation_reason(&pause, root) else {
        return Ok(None);
    };
    let is_child = candidate != root
        && tx
            .query_row(
                "SELECT EXISTS(SELECT 1 FROM agent_runtime_children WHERE root_id=?1 AND key=?2)",
                params![root, child_key(root, candidate)],
                |row| row.get::<_, bool>(0),
            )
            .map_err(db_error)?;
    Ok(Some(WorkBlocker::Reconciliation {
        reason,
        run_id: if is_child { candidate } else { root }.into(),
    }))
}

fn reconciliation_reason<'a>(
    mut pause: &'a serde_json::Value,
    mut run: &'a str,
) -> Option<(&'static str, &'a str)> {
    loop {
        match pause.get("kind").and_then(serde_json::Value::as_str)? {
            "budget_uncertain" => return Some(("budget_uncertain", run)),
            "uncertain_tool" => return Some(("uncertain_tool", run)),
            "uncertain_hook" => return Some(("uncertain_hook", run)),
            "child_paused" | "hook_workflow_paused" => {
                run = pause
                    .get("run_id")
                    .and_then(serde_json::Value::as_str)
                    .unwrap_or(run);
                pause = pause.get("reason")?;
            }
            _ => return None,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn terminal_work_does_not_report_a_pending_cancellation() {
        let state = tempfile::tempdir().unwrap();
        let store = SqliteStore::open(&state.path().join("runtime.sqlite")).unwrap();
        store
            .transaction(|tx| {
                let address = crate::mailbox::InputAddress {
                    root_run_id: "workflow".into(),
                    run_id: "workflow".into(),
                    thread_id: "thread".into(),
                    agent: "workflow".into(),
                };
                tx.execute(
                    "INSERT INTO agent_runtime_cancel(address,command_id) VALUES(?1,'cancel')",
                    [address.key()?],
                )
                .map_err(db_error)?;
                let mut work = WorkNode {
                    work_id: "work".into(),
                    run_id: address.run_id,
                    root_run_id: address.root_run_id,
                    parent_work_id: None,
                    kind: "workflow".into(),
                    name: "workflow".into(),
                    status: String::new(),
                    native_status: "running".into(),
                    revision: String::new(),
                    node_id: None,
                    workflow: None,
                    blocked_by: None,
                    actions: Vec::new(),
                    cancellation_pending: false,
                };
                finish_node(tx, &mut work)?;
                assert!(work.cancellation_pending);

                work.native_status = "cancelled".into();
                finish_node(tx, &mut work)?;
                assert_eq!(work.status, "cancelled");
                assert!(!work.cancellation_pending);
                assert!(work.actions.is_empty());
                Ok(())
            })
            .await
            .unwrap();
    }

    #[test]
    fn nested_reconciliation_reports_the_owning_run() {
        let pause = json!({"kind":"hook_workflow_paused","run_id":"workflow",
            "reason":{"kind":"child_paused","run_id":"child",
                "reason":{"kind":"budget_uncertain","operation_id":"original-call"}}});
        assert_eq!(
            reconciliation_reason(&pause, "root"),
            Some(("budget_uncertain", "child"))
        );
        assert_eq!(
            reconciliation_reason(&json!({"kind":"approval"}), "root"),
            None
        );
    }

    #[tokio::test]
    async fn reconciliation_blocked_paused_root_hides_and_rejects_resume() {
        let state = tempfile::tempdir().unwrap();
        let store = SqliteStore::open(&state.path().join("runtime.sqlite")).unwrap();

        let release = crate::system::content_digest(&"rel").unwrap();
        let managed_row = |run_id: &str| {
            let req = jobs::ManagedRunRequest {
                approval_mode: None,
                run_id: run_id.into(),
                thread_id: run_id.into(),
                system: "sys".into(),
                release: release.clone(),
                program: "agent-program".into(),
                input: None,
                parameters: None,
            };
            (
                crate::system::content_digest(&req).unwrap(),
                serde_json::to_string(&req).unwrap(),
            )
        };

        for reason in ["budget_uncertain", "uncertain_tool", "uncertain_hook"] {
            let run_id = format!("root-{reason}");
            let (managed_digest, managed) = managed_row(&run_id);
            let run_payload = json!({
                "status": "paused",
                "snapshot": { "program": { "kind": "agent" } },
                "outcome": {
                    "Paused": {
                        "reason": { "kind": reason, "operation_id": "op-1" }
                    }
                }
            })
            .to_string();
            let run_id_tx = run_id.clone();
            store
                .transaction(move |tx| {
                    tx.execute(
                        "INSERT INTO agent_runtime_managed_runs(run_id, digest, payload) VALUES(?1, ?2, ?3)",
                        params![run_id_tx, managed_digest, managed],
                    )
                    .map_err(db_error)?;
                    tx.execute(
                        "INSERT INTO agent_runtime_jobs(run_id, thread_key, digest, payload, status) VALUES(?1, ?1, ?2, '{}', 'paused')",
                        params![run_id_tx, managed_digest],
                    )
                    .map_err(db_error)?;
                    tx.execute(
                        "INSERT INTO agent_runtime_runs(id, thread_key, payload) VALUES(?1, ?1, ?2)",
                        params![run_id_tx, run_payload],
                    )
                    .map_err(db_error)?;
                    Ok(())
                })
                .await
                .unwrap();

            let node = store
                .work_inspect(&run_id, &run_id)
                .await
                .unwrap()
                .expect("managed paused root must be inspectable");
            assert_eq!(node.status, "waiting");
            assert!(
                matches!(
                    node.blocked_by,
                    Some(WorkBlocker::Reconciliation {
                        run_id: ref blocker_run,
                        reason: actual_reason,
                    }) if blocker_run == &run_id && actual_reason == reason
                ),
                "expected reconciliation blocker for {reason}"
            );
            assert!(
                !node.actions.contains(&"resume"),
                "reconciliation-blocked root must not advertise resume for {reason}"
            );
            assert!(node.actions.contains(&"cancel"));

            let control = store
                .control_work(
                    "scope",
                    &run_id,
                    WorkCommand {
                        work_id: run_id.clone(),
                        command_id: format!("resume-{reason}"),
                        expected_revision: node.revision.clone(),
                        action: WorkAction::Resume,
                    },
                    None,
                )
                .await;
            assert!(
                matches!(control, Err(Error::Composition(ref msg)) if msg.contains("control unavailable")),
                "control_work(Resume) must fail for reconciliation-blocked root ({reason}): {control:?}"
            );
        }

        // Non-reconciliation paused roots continue to expose and accept resume.
        let resumable_id = "root-resumable".to_string();
        let (managed_digest, managed) = managed_row(&resumable_id);
        let run_payload = json!({
            "status": "paused",
            "snapshot": { "program": { "kind": "agent" } },
            "outcome": {
                "Paused": {
                    "reason": { "kind": "manual" }
                }
            }
        })
        .to_string();
        let resumable_tx = resumable_id.clone();
        store
            .transaction(move |tx| {
                tx.execute(
                    "INSERT INTO agent_runtime_managed_runs(run_id, digest, payload) VALUES(?1, ?2, ?3)",
                    params![resumable_tx, managed_digest, managed],
                )
                .map_err(db_error)?;
                tx.execute(
                    "INSERT INTO agent_runtime_jobs(run_id, thread_key, digest, payload, status) VALUES(?1, ?1, ?2, '{}', 'paused')",
                    params![resumable_tx, managed_digest],
                )
                .map_err(db_error)?;
                tx.execute(
                    "INSERT INTO agent_runtime_runs(id, thread_key, payload) VALUES(?1, ?1, ?2)",
                    params![resumable_tx, run_payload],
                )
                .map_err(db_error)?;
                Ok(())
            })
            .await
            .unwrap();

        let node = store
            .work_inspect(&resumable_id, &resumable_id)
            .await
            .unwrap()
            .unwrap();
        assert!(node.blocked_by.is_none());
        assert!(node.actions.contains(&"resume"));
        store
            .control_work(
                "scope",
                &resumable_id,
                WorkCommand {
                    work_id: resumable_id.clone(),
                    command_id: "resume-ok".into(),
                    expected_revision: node.revision,
                    action: WorkAction::Resume,
                },
                None,
            )
            .await
            .unwrap();
    }
}
