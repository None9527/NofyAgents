//! Read-only Goal view over the same tracker used by the original session.
//! Planner/worker/verifier orchestration remains a separate execution recipe.
use nofy_agent_runtime::{
    Error, RunContext, RunState,
    recipe::{StageSource, goal::GoalObservation},
    registry::*,
};
use nofy_goal::{GoalStatus, GoalTracker};
use parking_lot::Mutex;
use serde_json::{Value, json};
use sha2::{Digest, Sha256};
use std::{collections::BTreeMap, sync::Arc};

pub struct NofyGoalSource {
    tracker: Arc<Mutex<GoalTracker>>,
    owner_thread: String,
    identity: String,
}
impl NofyGoalSource {
    pub fn new(
        tracker: Arc<Mutex<GoalTracker>>,
        owner_thread: String,
        revision: &str,
    ) -> Result<Self, Error> {
        if owner_thread.trim().is_empty() || revision.trim().is_empty() {
            return Err(Error::Composition(
                "Goal source requires owner thread and resource revision".into(),
            ));
        }
        let identity = format!(
            "nofy-goal:{:x}",
            Sha256::digest(
                serde_json::to_vec(&(&owner_thread, revision))
                    .map_err(|e| Error::Composition(e.to_string()))?
            )
        );
        Ok(Self {
            tracker,
            owner_thread,
            identity,
        })
    }
}
#[async_trait::async_trait]
impl StageSource for NofyGoalSource {
    fn identity(&self) -> &str {
        &self.identity
    }
    async fn snapshot(&self, _: &RunState, context: &RunContext) -> Result<Value, Error> {
        if context.thread_id != self.owner_thread {
            return Err(Error::Composition(
                "Goal source belongs to another thread".into(),
            ));
        }
        loop {
            // A synchronous tracker transition may hold this lock while rescuing
            // artifacts; do not block the executor or the cancellation deadline.
            let observation = {
                self.tracker
                    .try_lock()
                    .map(|tracker| match tracker.snapshot() {
                        None => GoalObservation::Inactive,
                        Some(goal) => match goal.status {
                            GoalStatus::Complete => GoalObservation::Complete {
                                goal_id: goal.goal_id.clone(),
                            },
                            GoalStatus::BudgetLimited => GoalObservation::BudgetLimited {
                                goal_id: goal.goal_id.clone(),
                            },
                            GoalStatus::Active => GoalObservation::Active {
                                goal_id: goal.goal_id.clone(),
                                objective: goal.objective.clone(),
                                gaps: goal.last_classifier_gaps.clone(),
                            },
                            status => GoalObservation::Paused {
                                goal_id: goal.goal_id.clone(),
                                reason: goal
                                    .pause_message
                                    .clone()
                                    .unwrap_or_else(|| format!("{status:?}")),
                            },
                        },
                    })
            };
            if let Some(observation) = observation {
                return serde_json::to_value(observation)
                    .map_err(|e| Error::Composition(e.to_string()));
            }
            tokio::select! {biased;_=context.cancel.cancelled()=>return Err(Error::Cancelled),_=tokio::time::sleep(std::time::Duration::from_millis(1))=>{}}
        }
    }
}
pub struct GoalSourceFactory {
    sources: BTreeMap<String, Arc<NofyGoalSource>>,
    revision: String,
}
impl GoalSourceFactory {
    pub fn new(sources: BTreeMap<String, Arc<NofyGoalSource>>) -> Self {
        let identities = sources
            .iter()
            .map(|(name, source)| (name, source.identity()))
            .collect::<BTreeMap<_, _>>();
        let revision = format!(
            "1:{:x}",
            Sha256::digest(serde_json::to_vec(&identities).expect("source identities"))
        );
        Self { sources, revision }
    }
}
impl ModuleFactory for GoalSourceFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: "source.nofy_goal".into(),
            revision: self.revision.clone(),
            kind: ModuleKind::StageSource,
            config_schema: json!({"type":"object","additionalProperties":false,"required":["source"],"properties":{"source":{"type":"string","enum":self.sources.keys().collect::<Vec<_>>()}}}),
            input_schema: None,
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
        #[derive(serde::Deserialize)]
        #[serde(deny_unknown_fields)]
        struct Config {
            source: String,
        }
        let config: Config = serde_json::from_value(config.clone())
            .map_err(|e| Error::Composition(e.to_string()))?;
        let source = self
            .sources
            .get(&config.source)
            .ok_or_else(|| Error::Composition("Goal source is not installed".into()))?;
        Ok(ModuleInstance::StageSource(source.clone()))
    }
}
