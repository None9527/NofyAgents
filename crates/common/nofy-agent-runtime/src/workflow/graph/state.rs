use super::*;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "status", rename_all = "snake_case")]
pub enum NodeProgress {
    Running {
        attempt: u32,
        input: Value,
    },
    Waiting {
        attempt: u32,
        input: Value,
        reason: Value,
    },
    Completed {
        attempt: u32,
        output: Value,
    },
    Failed {
        attempt: u32,
        error: String,
    },
    Skipped,
}
impl NodeProgress {
    pub(super) fn settled(&self) -> bool {
        matches!(
            self,
            Self::Completed { .. } | Self::Failed { .. } | Self::Skipped
        )
    }
    pub(super) fn value(&self) -> Option<Value> {
        match self {
            Self::Completed { output, .. } => Some(output.clone()),
            Self::Failed { error, .. } => Some(json!({"error":error})),
            Self::Skipped => Some(Value::Null),
            _ => None,
        }
    }
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct WorkflowProgress {
    pub version: u32,
    pub run_id: String,
    pub reference: crate::registry::ModuleRef,
    pub input: Value,
    pub nodes: BTreeMap<String, NodeProgress>,
    pub output: Option<Value>,
    #[serde(default)]
    pub facts: std::collections::VecDeque<GraphFact>,
    #[serde(default)]
    pub started: bool,
    #[serde(default)]
    pub human: BTreeMap<String, HumanReceipt>,
    #[serde(default)]
    pub halted: Option<GraphHalt>,
    #[serde(default)]
    pub control_epoch: u64,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub recovering: Option<String>,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "status", rename_all = "snake_case", deny_unknown_fields)]
pub enum GraphHalt {
    Failed { node: String, error: String },
    Paused { node: String, reason: Value },
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct GraphFact {
    pub name: String,
    pub operation: String,
    pub payload: Value,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct HumanReceipt {
    pub command_id: String,
    pub value: Value,
    pub request: Value,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct HumanResponse {
    pub command_id: String,
    pub thread_id: String,
    pub run_id: String,
    pub workflow_identity: String,
    pub reference: crate::registry::ModuleRef,
    pub node: String,
    pub expected_request: Value,
    pub value: Value,
}

pub(super) fn graph_key(thread: &str, run: &str, reference: &crate::registry::ModuleRef) -> String {
    serde_json::to_string(&("workflow-graph-v1", thread, run, reference)).expect("workflow key")
}
pub(super) fn validate_state(
    state: &WorkflowProgress,
    run: &str,
    reference: &crate::registry::ModuleRef,
) -> Result<(), Error> {
    if state.version != 1 || state.run_id != run || &state.reference != reference {
        return Err(Error::Checkpoint("workflow state identity changed".into()));
    }
    Ok(())
}
pub(super) async fn save_progress(
    store: &dyn Checkpointer,
    key: &str,
    identity: &str,
    revision: Option<u64>,
    state: &WorkflowProgress,
) -> Result<u64, Error> {
    let data = serde_json::to_value(state).map_err(|e| Error::Checkpoint(e.to_string()))?;
    bounded_value(&data, 8 * 1024 * 1024, "workflow checkpoint")?;
    let next = revision
        .unwrap_or(0)
        .checked_add(1)
        .ok_or_else(|| Error::Checkpoint("workflow revision overflow".into()))?;
    store
        .save(
            key,
            revision,
            Checkpoint {
                version: 1,
                revision: next,
                composition: identity.into(),
                state: RunState {
                    data,
                    ..Default::default()
                },
            },
        )
        .await?;
    Ok(next)
}
