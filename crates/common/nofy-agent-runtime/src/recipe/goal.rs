//! A pure completion gate over a host's canonical Goal lifecycle projection.
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "status", rename_all = "snake_case", deny_unknown_fields)]
pub enum GoalObservation {
    Inactive,
    Complete {
        goal_id: String,
    },
    Active {
        goal_id: String,
        objective: String,
        #[serde(default)]
        gaps: Option<String>,
    },
    Paused {
        goal_id: String,
        reason: String,
    },
    BudgetLimited {
        goal_id: String,
    },
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(default, deny_unknown_fields)]
pub struct GoalConfig {
    pub max_continuations: u32,
    pub completion_tool: String,
}
impl Default for GoalConfig {
    fn default() -> Self {
        Self {
            max_continuations: 3,
            completion_tool: "update_goal".into(),
        }
    }
}
pub struct GoalStage(GoalConfig);
impl GoalStage {
    pub fn new(config: GoalConfig) -> Result<Self, Error> {
        if config.max_continuations > 16 {
            return Err(Error::Composition(
                "goal continuation limit exceeds 16".into(),
            ));
        }
        nofy_tool_protocol::ToolId::new(&config.completion_tool)
            .map_err(|e| Error::Composition(e.to_string()))?;
        Ok(Self(config))
    }
}
impl AgentStage for GoalStage {
    fn supports(&self, boundary: Boundary) -> bool {
        boundary == Boundary::BeforeStop
    }
    fn evaluate(&self, input: &StageInput<'_>, _: &RunContext) -> Result<StageEffect, Error> {
        let observation: GoalObservation =
            serde_json::from_value(input.observation.cloned().ok_or_else(|| {
                Error::Composition("goal stage requires its canonical state source".into())
            })?)
            .map_err(|e| Error::Composition(format!("goal observation: {e}")))?;
        let action = match observation {
            GoalObservation::Inactive | GoalObservation::Complete { .. } => StageAction::Next,
            GoalObservation::Paused { goal_id, reason } => StageAction::Pause {
                reason: json!({"kind":"goal_paused","goal_id":goal_id,"reason":reason}),
            },
            GoalObservation::BudgetLimited { goal_id } => StageAction::Limit {
                reason: format!("Goal {goal_id} reached its budget limit"),
            },
            GoalObservation::Active {
                goal_id,
                objective,
                gaps,
            } => {
                let fires = if input.data.is_null() {
                    0
                } else {
                    let previous = input
                        .data
                        .get("goal_id")
                        .and_then(Value::as_str)
                        .ok_or_else(|| {
                            Error::Checkpoint("invalid goal continuation identity".into())
                        })?;
                    let fires = input
                        .data
                        .get("continuations")
                        .and_then(Value::as_u64)
                        .ok_or_else(|| {
                            Error::Checkpoint("invalid goal continuation state".into())
                        })?;
                    if previous == goal_id { fires } else { 0 }
                };
                if input.state.completion_info.refusal.is_some()
                    || fires >= u64::from(self.0.max_continuations)
                {
                    StageAction::Pause {
                        reason: json!({"kind":"goal_not_complete","goal_id":goal_id,"continuations":fires,"refused":input.state.completion_info.refusal.is_some()}),
                    }
                } else {
                    let gaps = gaps
                        .map(|gaps| format!("\nRemaining verification gaps:\n{gaps}"))
                        .unwrap_or_default();
                    return Ok(StageEffect {
                        data: Some(json!({"goal_id":goal_id,"continuations":fires+1})),
                        action: StageAction::Feedback {
                            content: format!(
                                "Continue working toward the active goal: {objective}.{gaps}\nUse {} to request verified completion; a final answer alone does not complete the goal.",
                                self.0.completion_tool
                            ),
                        },
                    });
                }
            }
        };
        Ok(StageEffect {
            action,
            ..Default::default()
        })
    }
}
pub struct GoalStageFactory;
impl ModuleFactory for GoalStageFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: "stage.goal".into(),
            revision: "1".into(),
            kind: ModuleKind::Stage,
            config_schema: json!({"type":"object","additionalProperties":false,"properties":{"max_continuations":{"type":"integer","minimum":0,"maximum":16},"completion_tool":{"type":"string","minLength":1,"maxLength":128}}}),
            input_schema: None,
            output_schema: None,
            required_capabilities: Default::default(),
            dependencies: Default::default(),
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
        Ok(ModuleInstance::Stage(Arc::new(GoalStage::new(config)?)))
    }
}
