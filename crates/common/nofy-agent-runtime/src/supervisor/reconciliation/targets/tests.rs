use super::*;
use crate::{Checkpoint, RunState};
use serde_json::json;
async fn seed(store: &SqliteStore, id: &str, kind: Option<&str>, checkpoint: bool, pending: bool) {
    let call = ToolCall {
        id: "effect".into(),
        name: "effect".into(),
        arguments: json!({"value":1}),
    };
    let child = ChildRunRecord {
        root_run_id: "root".into(),
        parent_run_id: "root".into(),
        run_id: id.into(),
        thread_id: id.into(),
        agent_name: "中文 worker".into(),
        composition: "composition".into(),
        status: "paused".into(),
        error: None,
        kind: kind.map(str::to_owned),
        checkpoint_key: None,
        workflow_ref: None,
        node_id: None,
    };
    let cp = Checkpoint {
        version: 1,
        revision: 1,
        composition: child.composition.clone(),
        state: RunState {
            execution_run_id: Some(id.into()),
            in_flight: pending.then_some(call.clone()),
            pending_tools: if pending {
                vec![call].into()
            } else {
                Default::default()
            },
            ..Default::default()
        },
    };
    store
        .transaction(move |tx| {
            tx.execute(
                "INSERT INTO agent_runtime_children(key,root_id,payload) VALUES(?1,'root',?2)",
                params![
                    crate::supervisor::child_key("root", &child.run_id),
                    serde_json::to_string(&child).map_err(db_error)?
                ],
            )
            .map_err(db_error)?;
            if checkpoint {
                tx.execute(
                    "INSERT INTO agent_runtime_checkpoints(key,revision,payload) VALUES(?1,1,?2)",
                    params![
                        crate::state::checkpoint_key(&child.agent_name, &child.thread_id),
                        serde_json::to_string(&cp).map_err(db_error)?
                    ],
                )
                .map_err(db_error)?;
            }
            Ok(())
        })
        .await
        .unwrap();
}
#[tokio::test]
async fn projected_pages_skip_graph_markers_keep_legacy_unicode_keys_and_do_not_skip_later_pending_calls()
 {
    let dir = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&dir.path().join("runtime.sqlite")).unwrap();
    seed(&store, "a", Some("tool_program"), false, false).await;
    seed(&store, "b", None, true, true).await;
    seed(&store, "c", Some("agent"), true, false).await;
    seed(&store, "d", Some("tool_program"), true, true).await;
    seed(&store, "control", Some("workflow_tool"), true, true).await;
    let a = store.child_recovery_targets("root", None, 1).await.unwrap();
    assert!(a.targets.is_empty());
    assert_eq!(a.next.as_deref(), Some("a"));
    let b = store
        .child_recovery_targets("root", a.next.as_deref(), 1)
        .await
        .unwrap();
    assert_eq!(b.targets.len(), 1);
    assert_eq!(b.targets[0].run_id, "b");
    assert_eq!(b.targets[0].kind, "agent");
    assert_eq!(b.targets[0].model_sequence, 0);
    let c = store
        .child_recovery_targets("root", b.next.as_deref(), 1)
        .await
        .unwrap();
    assert!(c.targets.is_empty());
    let d = store
        .child_recovery_targets("root", c.next.as_deref(), 1)
        .await
        .unwrap();
    assert_eq!(d.targets[0].run_id, "d");
    assert!(d.next.is_none());
    assert!(store.child_recovery_targets("root", None, 0).await.is_err());
    assert!(
        store
            .child_recovery_targets("root", None, 257)
            .await
            .is_err()
    );
}
#[tokio::test]
async fn projected_view_rejects_changed_checkpoint_composition_instead_of_offering_forged_evidence()
{
    let dir = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&dir.path().join("runtime.sqlite")).unwrap();
    seed(&store, "child", Some("tool_program"), true, true).await;
    store.transaction(|tx| {
        tx.execute("UPDATE agent_runtime_checkpoints SET payload=json_set(payload,'$.composition','changed')",[]).map_err(db_error)?;
        Ok(())
    }).await.unwrap();
    assert!(
        store
            .child_recovery_targets("root", None, 10)
            .await
            .is_err()
    );
}
