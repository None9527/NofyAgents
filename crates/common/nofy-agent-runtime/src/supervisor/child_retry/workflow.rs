use super::*;
use crate::{
    controllers::GraphRoute,
    workflow::graph::{GraphHalt, NodeProgress, WorkflowProgress},
};
use sha2::{Digest, Sha256};

pub(super) async fn hook_route(
    child: &ChildRunRecord,
    parent_thread: &str,
    parent_run: &str,
    binding: &ControllerBinding,
    store: Arc<dyn Checkpointer>,
) -> Result<crate::controllers::HookRoute, Error> {
    let route = binding
        .hook_route(&child.run_id)
        .await?
        .ok_or_else(|| Error::Checkpoint("workflow Hook source route missing".into()))?;
    let expected = format!(
        "workflow-hook:{:x}",
        Sha256::digest(
            serde_json::to_vec(&(
                &route.event.id,
                &route.hook_identity,
                &route.workflow_identity
            ))
            .map_err(db_error)?
        )
    );
    let cp = store
        .load(&route.checkpoint_key)
        .await?
        .ok_or_else(|| Error::Checkpoint("workflow Hook source checkpoint missing".into()))?;
    if route.run_id != child.run_id
        || expected != child.run_id
        || child.thread_id != child.run_id
        || route.parent_run_id != parent_run
        || route.parent_thread_id != parent_thread
        || child.parent_run_id != parent_run
        || route.composition != child.composition
        || route.source.scope.run_id != parent_run
        || route.source.scope.thread_id != parent_thread
        || route.event.id != route.source.id
        || cp.version != 1
        || cp.composition != route.parent_composition
        || cp.state.execution_run_id != route.checkpoint_run_id
        || !crate::controllers::parent_pending(&cp.state, &route)
        || crate::controllers::parent_fingerprint(&cp.state, &route.source)?
            != route.parent_fingerprint
    {
        return Err(Error::Checkpoint(
            "workflow Hook source has advanced or changed".into(),
        ));
    }
    let base = serde_json::to_string(&("hook-v1", &route.event.id, &route.hook_identity))
        .map_err(db_error)?;
    let key = binding.hook_key(&base).await?;
    crate::hooks::HookJournal::new(store)
        .validate_controller_route(&route, &key)
        .await?;
    Ok(route)
}

pub(super) async fn graph_route(
    child: &ChildRunRecord,
    parent_thread: &str,
    parent_run: &str,
    children: &BTreeMap<String, ChildRunRecord>,
    store: &dyn Checkpointer,
    mode: RecoveryMode,
) -> Result<Option<GraphRoute>, Error> {
    let marker = if child.kind.as_deref() == Some("tool_program") {
        let suffix = child
            .run_id
            .strip_prefix("workflow-node:")
            .ok_or_else(|| Error::Checkpoint("unsupported Tool program recovery path".into()))?;
        children
            .get(&format!("workflow-control:{suffix}"))
            .ok_or_else(|| Error::Checkpoint("workflow node control record missing".into()))?
    } else {
        child
    };
    if marker.parent_run_id != parent_run || child.parent_run_id != parent_run {
        return Err(Error::Checkpoint("workflow node parent changed".into()));
    }
    let key = marker
        .checkpoint_key
        .as_ref()
        .ok_or_else(|| Error::Checkpoint("workflow graph checkpoint key missing".into()))?;
    let reference = marker
        .workflow_ref
        .as_ref()
        .ok_or_else(|| Error::Checkpoint("workflow graph version missing".into()))?;
    let node = marker
        .node_id
        .as_ref()
        .ok_or_else(|| Error::Checkpoint("workflow node ID missing".into()))?;
    let expected_key =
        serde_json::to_string(&("workflow-graph-v1", parent_thread, parent_run, reference))
            .map_err(db_error)?;
    let cp = store
        .load(key)
        .await?
        .ok_or_else(|| Error::Checkpoint("workflow graph checkpoint missing".into()))?;
    if key != &expected_key || cp.version != 1 || cp.composition != marker.composition {
        return Err(Error::Checkpoint(
            "workflow graph composition/key changed".into(),
        ));
    }
    let state: WorkflowProgress = serde_json::from_value(cp.state.data).map_err(db_error)?;
    let progress = state
        .nodes
        .get(node)
        .ok_or_else(|| Error::Checkpoint("workflow failed node missing".into()))?;
    let (attempt, halted_matches, reset) = match (progress, &state.halted) {
        (
            NodeProgress::Failed { attempt, .. },
            Some(GraphHalt::Failed { node: halted, .. } | GraphHalt::Paused { node: halted, .. }),
        ) => (attempt, halted == node, true),
        (NodeProgress::Waiting { attempt, .. }, None) => {
            (attempt, true, mode == RecoveryMode::Model)
        }
        (NodeProgress::Running { attempt, .. }, None) if mode != RecoveryMode::Model => {
            (attempt, true, false)
        }
        _ => {
            return Err(Error::Checkpoint(
                "workflow node is not at the failed descendant boundary".into(),
            ));
        }
    };
    let expected_child = format!(
        "workflow-node:{:x}",
        Sha256::digest(
            serde_json::to_vec(&(parent_thread, parent_run, node, attempt)).map_err(db_error)?
        )
    );
    if state.version != 1
        || state.run_id != parent_run
        || &state.reference != reference
        || state.output.is_some()
        || !state.facts.is_empty()
        || !halted_matches
        || child.run_id != expected_child
        || child.thread_id != expected_child
    {
        return Err(Error::Checkpoint(
            "workflow recovery path is stale or has unsettled facts".into(),
        ));
    }
    if !reset {
        return Ok(None);
    }
    Ok(Some(GraphRoute {
        child_run_id: child.run_id.clone(),
        parent_run_id: parent_run.into(),
        parent_thread_id: parent_thread.into(),
        key: key.clone(),
        composition: marker.composition.clone(),
        reference: reference.clone(),
        node: node.clone(),
        attempt: *attempt,
        failed: serde_json::to_value(progress).map_err(db_error)?,
        epoch: state.control_epoch,
    }))
}
