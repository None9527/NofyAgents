//! Completion discipline over an explicit, durable, read-only task snapshot.
use super::*;
use crate::coding::todo::{TodoGateDecision, TodoGateInput, evaluate_todo_gate};

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(default, deny_unknown_fields)]
pub struct TodoObservation {
    pub pending: Vec<String>,
    /// In canonical insertion order; the first backing_tasks are backed.
    pub in_progress: Vec<String>,
    pub backing_tasks: usize,
    pub goal_active: bool,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(default, deny_unknown_fields)]
pub struct TodoConfig {
    pub max_fires: u32,
    pub plan_tool: String,
}
impl Default for TodoConfig {
    fn default() -> Self {
        Self {
            max_fires: 2,
            plan_tool: "todo".into(),
        }
    }
}
pub struct TodoStage(TodoConfig);
impl TodoStage {
    pub fn new(config: TodoConfig) -> Result<Self, Error> {
        if config.max_fires > 16 {
            return Err(Error::Composition(
                "todo continuation cap exceeds 16".into(),
            ));
        }
        nofy_tool_protocol::ToolId::new(&config.plan_tool)
            .map_err(|e| Error::Composition(e.to_string()))?;
        Ok(Self(config))
    }
}
impl AgentStage for TodoStage {
    fn supports(&self, boundary: Boundary) -> bool {
        boundary == Boundary::BeforeStop
    }
    fn evaluate(&self, input: &StageInput<'_>, _: &RunContext) -> Result<StageEffect, Error> {
        let observation: TodoObservation =
            serde_json::from_value(input.observation.cloned().ok_or_else(|| {
                Error::Composition("todo stage requires a task observation source".into())
            })?)
            .map_err(|e| Error::Composition(format!("todo observation: {e}")))?;
        let fires = if input.data.is_null() {
            0
        } else {
            input
                .data
                .get("fires")
                .and_then(Value::as_u64)
                .ok_or_else(|| Error::Checkpoint("invalid todo continuation state".into()))?
        };
        if fires >= u64::from(self.0.max_fires)
            || observation.goal_active
            || input.state.completion_info.refusal.is_some()
            || input.state.completion_info.structured_output.is_some()
        {
            return Ok(StageEffect::default());
        }
        let backed = observation.in_progress.len().min(observation.backing_tasks);
        let task = TodoGateInput {
            pending: observation.pending.iter().map(String::as_str).collect(),
            in_progress_backed: observation.in_progress[..backed]
                .iter()
                .map(String::as_str)
                .collect(),
            in_progress_unbacked: observation.in_progress[backed..]
                .iter()
                .map(String::as_str)
                .collect(),
            backing_task_count: observation.backing_tasks,
        };
        let TodoGateDecision::Nudge { reminder, .. } = evaluate_todo_gate(&task) else {
            return Ok(StageEffect::default());
        };
        let reminder = reminder
            .replace("${{ tools.by_kind.plan }}", &self.0.plan_tool)
            .replace("</system-reminder", "<\\/system-reminder")
            .replace("<system-reminder", "<\\system-reminder");
        Ok(StageEffect {
            data: Some(json!({"fires":fires+1})),
            action: StageAction::Feedback {
                content: format!("<system-reminder>\n{reminder}\n</system-reminder>"),
            },
        })
    }
}
pub struct TodoStageFactory;
impl ModuleFactory for TodoStageFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: "stage.todo".into(),
            revision: "1".into(),
            kind: ModuleKind::Stage,
            config_schema: json!({"type":"object","additionalProperties":false,"properties":{"max_fires":{"type":"integer","minimum":0,"maximum":16},"plan_tool":{"type":"string","minLength":1,"maxLength":128}}}),
            input_schema: Some(
                json!({"type":"object","properties":{"pending":{"type":"array","items":{"type":"string"}},"in_progress":{"type":"array","items":{"type":"string"}},"backing_tasks":{"type":"integer","minimum":0},"goal_active":{"type":"boolean"}}}),
            ),
            output_schema: None,
            dependencies: Default::default(),
            required_capabilities: Default::default(),
        }
    }
    fn build(
        &self,
        config: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        crate::settings::validate_json_value(&self.descriptor().config_schema, config)?;
        let config = serde_json::from_value(config.clone())
            .map_err(|e| Error::Composition(e.to_string()))?;
        Ok(ModuleInstance::Stage(Arc::new(TodoStage::new(config)?)))
    }
}
