//! Versioned pure decision stages around the fixed execution boundaries.
//! Stages cannot reorder model/tool validation or perform external effects;
//! such effects remain explicit Tool and Hook modules.
use crate::{Error, RunContext, RunState, ToolCall, registry::*};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use std::{
    collections::{BTreeMap, BTreeSet},
    sync::Arc,
};
pub mod goal;
pub mod policies;
pub mod tasks;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Boundary {
    BeforeModel,
    AfterModel,
    BeforeTool,
    AfterTool,
    BeforeStop,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct StageToolResult {
    pub content: Value,
    pub is_error: bool,
}
pub struct StageInput<'a> {
    pub boundary: Boundary,
    pub state: &'a RunState,
    pub call: Option<&'a ToolCall>,
    pub result: Option<&'a StageToolResult>,
    pub data: &'a Value,
    /// Read-only source snapshot saved before the decision is evaluated.
    pub observation: Option<&'a Value>,
}
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case", deny_unknown_fields)]
pub enum StageAction {
    #[default]
    Next,
    Feedback {
        content: String,
    },
    Pause {
        reason: Value,
    },
    Limit {
        reason: String,
    },
    RejectTool {
        reason: String,
    },
    ContinueText {
        feedback: Option<String>,
        max_bytes: u32,
    },
    CompleteText {
        max_bytes: u32,
    },
}
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(default, deny_unknown_fields)]
pub struct StageEffect {
    pub data: Option<Value>,
    pub action: StageAction,
}
impl StageEffect {
    pub(crate) fn validate(&self, boundary: Boundary) -> Result<(), Error> {
        if serde_json::to_vec(self)
            .map_err(|e| Error::Composition(e.to_string()))?
            .len()
            > 65536
        {
            return Err(Error::Composition("stage effect exceeds 64 KiB".into()));
        }
        if matches!(self.action, StageAction::RejectTool { .. }) && boundary != Boundary::BeforeTool
        {
            return Err(Error::Composition(
                "reject_tool is only valid before a tool".into(),
            ));
        }
        if let StageAction::ContinueText { max_bytes, .. } | StageAction::CompleteText { max_bytes } =
            &self.action
            && (boundary != Boundary::BeforeStop || !(1..=1_048_576).contains(max_bytes))
        {
            return Err(Error::Composition(
                "text continuation is limited to before_stop and a 1 MiB buffer".into(),
            ));
        }
        if matches!(self.action, StageAction::Pause { .. }) && self.data.is_some() {
            return Err(Error::Composition(
                "a paused stage cannot also mutate its data".into(),
            ));
        }
        Ok(())
    }
}
/// Installed native stages must be bounded, deterministic and side-effect-free.
/// Mutable policy state is returned as data and committed by the runtime.
pub trait AgentStage: Send + Sync {
    fn supports(&self, _boundary: Boundary) -> bool {
        true
    }
    fn evaluate(&self, input: &StageInput<'_>, context: &RunContext) -> Result<StageEffect, Error>;
}
/// Host-installed read-only observation. It must not dispatch models/tools or
/// perform writes; effects remain admitted Tool/Hook operations. The runtime
/// bounds, cancels and checkpoints each snapshot before evaluating a pure stage.
#[async_trait::async_trait]
pub trait StageSource: Send + Sync {
    fn identity(&self) -> &str;
    fn timeout_ms(&self) -> u64 {
        5000
    }
    async fn snapshot(&self, state: &RunState, context: &RunContext) -> Result<Value, Error>;
}
pub struct StageBinding {
    pub name: String,
    pub at: Boundary,
    pub stage: Arc<dyn AgentStage>,
}
pub struct RuntimeRecipe {
    pub(crate) identity: String,
    pub(crate) stages: Vec<StageBinding>,
    pub(crate) sources: BTreeMap<String, Arc<dyn StageSource>>,
}
impl RuntimeRecipe {
    pub fn new(identity: impl Into<String>, stages: Vec<StageBinding>) -> Result<Self, Error> {
        let identity = identity.into();
        let mut names = BTreeSet::new();
        if identity.trim().is_empty()
            || stages.len() > 128
            || stages.iter().any(|stage| {
                stage.name.trim().is_empty()
                    || stage.name.len() > 128
                    || !names.insert(&stage.name)
                    || !stage.stage.supports(stage.at)
            })
        {
            return Err(Error::Composition(
                "recipe requires a versioned identity and at most 128 uniquely named stages".into(),
            ));
        }
        Ok(Self {
            identity,
            stages,
            sources: BTreeMap::new(),
        })
    }
    pub fn with_source(mut self, stage: &str, source: Arc<dyn StageSource>) -> Result<Self, Error> {
        if !self.stages.iter().any(|binding| binding.name == stage)
            || self.sources.contains_key(stage)
            || source.identity().trim().is_empty()
            || source.identity().len() > 4096
            || !(1..=600_000).contains(&source.timeout_ms())
        {
            return Err(Error::Composition(
                "invalid or duplicate stage observation binding".into(),
            ));
        }
        self.identity = serde_json::to_string(&(&self.identity, stage, source.identity()))
            .map_err(|e| Error::Composition(e.to_string()))?;
        self.sources.insert(stage.into(), source);
        Ok(self)
    }
    pub fn identity(&self) -> &str {
        &self.identity
    }
    pub fn stage_names(&self) -> impl Iterator<Item = (&str, Boundary)> {
        self.stages
            .iter()
            .map(|stage| (stage.name.as_str(), stage.at))
    }
    pub(crate) fn has(&self, boundary: Boundary) -> bool {
        self.stages.iter().any(|stage| stage.at == boundary)
    }
}
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(default, deny_unknown_fields)]
pub struct RecipeProgress {
    pub(crate) completed: BTreeSet<String>,
    pub(crate) pending: Option<PreparedBoundary>,
    pub(crate) data: BTreeMap<String, Value>,
    pub(crate) feedback: Vec<String>,
    pub(crate) halted: Option<String>,
    pub(crate) text_buffers: BTreeMap<String, String>,
}
impl RecipeProgress {
    pub(crate) fn validate_size(&self) -> Result<(), Error> {
        if serde_json::to_vec(self)
            .map_err(|e| Error::Checkpoint(e.to_string()))?
            .len()
            > 4 * 1024 * 1024
        {
            return Err(Error::Composition("recipe progress exceeds 4 MiB".into()));
        }
        Ok(())
    }
    pub fn is_empty(&self) -> bool {
        self.completed.is_empty()
            && self.pending.is_none()
            && self.data.is_empty()
            && self.feedback.is_empty()
            && self.halted.is_none()
            && self.text_buffers.is_empty()
    }
    pub fn stage_data(&self, name: &str) -> Option<&Value> {
        self.data.get(name)
    }
    pub fn limit_reason(&self) -> Option<&str> {
        self.halted.as_deref()
    }
    pub fn text_buffer(&self, name: &str) -> Option<&str> {
        self.text_buffers.get(name).map(String::as_str)
    }
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub(crate) struct PreparedBoundary {
    pub key: String,
    pub boundary: Boundary,
    pub call: Option<ToolCall>,
    pub result_index: Option<usize>,
    pub index: usize,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub observation: Option<PreparedObservation>,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub(crate) struct PreparedObservation {
    pub source: String,
    pub index: usize,
    pub value: Value,
}
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Placement {
    name: String,
    at: Boundary,
    stage: String,
    #[serde(default)]
    source: Option<String>,
}
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Config {
    stages: Vec<Placement>,
}
pub struct RecipeFactory;
impl ModuleFactory for RecipeFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: "runtime.recipe".into(),
            revision: "2".into(),
            kind: ModuleKind::Recipe,
            config_schema: json!({"type":"object","additionalProperties":false,"required":["stages"],"properties":{"stages":{"type":"array","maxItems":128,"items":{"type":"object","additionalProperties":false,"required":["name","at","stage"],"properties":{"name":{"type":"string","minLength":1,"maxLength":128},"at":{"enum":["before_model","after_model","before_tool","after_tool","before_stop"]},"stage":{"type":"string","minLength":1,"maxLength":128},"source":{"type":["string","null"],"minLength":1,"maxLength":128}}}}}}),
            input_schema: None,
            output_schema: None,
            dependencies: Default::default(),
            required_capabilities: Default::default(),
        }
    }
    fn config_dependencies(&self, config: &Value) -> Result<BTreeMap<String, ModuleKind>, Error> {
        let config: Config = serde_json::from_value(config.clone())
            .map_err(|e| Error::Composition(e.to_string()))?;
        let mut result = BTreeMap::new();
        for stage in config.stages {
            for (name, kind) in std::iter::once((stage.stage, ModuleKind::Stage))
                .chain(stage.source.map(|name| (name, ModuleKind::StageSource)))
            {
                if result
                    .insert(name, kind)
                    .is_some_and(|previous| previous != kind)
                {
                    return Err(Error::Composition(
                        "conflicting recipe dependency kind".into(),
                    ));
                }
            }
        }
        Ok(result)
    }
    fn build(
        &self,
        config: &Value,
        dependencies: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        crate::settings::validate_json_value(&self.descriptor().config_schema, config)?;
        let identity = serde_json::to_string(&("recipe:2", config))
            .map_err(|e| Error::Composition(e.to_string()))?;
        let config: Config = serde_json::from_value(config.clone())
            .map_err(|e| Error::Composition(e.to_string()))?;
        let expected = self.config_dependencies(
            &serde_json::to_value(&config).map_err(|e| Error::Composition(e.to_string()))?,
        )?;
        if expected.len() != dependencies.len() {
            return Err(Error::Composition(
                "recipe stage dependencies do not match".into(),
            ));
        }
        let stages = config
            .stages
            .iter()
            .map(|placement| {
                let Some(ModuleInstance::Stage(stage)) = dependencies.get(&placement.stage) else {
                    return Err(Error::Composition(format!(
                        "recipe stage {} is missing or has the wrong kind",
                        placement.stage
                    )));
                };
                Ok(StageBinding {
                    name: placement.name.clone(),
                    at: placement.at,
                    stage: stage.clone(),
                })
            })
            .collect::<Result<Vec<_>, Error>>()?;
        let mut recipe = RuntimeRecipe::new(identity, stages)?;
        for placement in config.stages {
            if let Some(alias) = placement.source {
                let Some(ModuleInstance::StageSource(source)) = dependencies.get(&alias) else {
                    return Err(Error::Composition(format!("missing stage source: {alias}")));
                };
                recipe = recipe.with_source(&placement.name, source.clone())?;
            }
        }
        Ok(ModuleInstance::Recipe(Arc::new(recipe)))
    }
}
struct LiteralStage(StageEffect);
impl AgentStage for LiteralStage {
    fn supports(&self, boundary: Boundary) -> bool {
        self.0.validate(boundary).is_ok()
    }
    fn evaluate(&self, _: &StageInput<'_>, _: &RunContext) -> Result<StageEffect, Error> {
        Ok(self.0.clone())
    }
}
pub struct LiteralStageFactory;
impl ModuleFactory for LiteralStageFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: "stage.literal".into(),
            revision: "2".into(),
            kind: ModuleKind::Stage,
            config_schema: json!({"type":"object","additionalProperties":false,"properties":{"data":{},"action":{"oneOf":[
                {"type":"object","required":["kind"],"additionalProperties":false,"properties":{"kind":{"const":"next"}}},
                {"type":"object","required":["kind","content"],"additionalProperties":false,"properties":{"kind":{"const":"feedback"},"content":{"type":"string","maxLength":65536}}},
                {"type":"object","required":["kind","reason"],"additionalProperties":false,"properties":{"kind":{"const":"pause"},"reason":{}}},
                {"type":"object","required":["kind","reason"],"additionalProperties":false,"properties":{"kind":{"enum":["limit","reject_tool"]},"reason":{"type":"string","maxLength":65536}}},
                {"type":"object","required":["kind","max_bytes"],"additionalProperties":false,"properties":{"kind":{"const":"continue_text"},"feedback":{"type":["string","null"],"maxLength":65536},"max_bytes":{"type":"integer","minimum":1,"maximum":1048576}}},
                {"type":"object","required":["kind","max_bytes"],"additionalProperties":false,"properties":{"kind":{"const":"complete_text"},"max_bytes":{"type":"integer","minimum":1,"maximum":1048576}}}
            ]}}}),
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
        crate::settings::validate_json_value(&self.descriptor().config_schema, config)?;
        let effect: StageEffect = serde_json::from_value(config.clone())
            .map_err(|e| Error::Composition(e.to_string()))?;
        if serde_json::to_vec(&effect)
            .map_err(|e| Error::Composition(e.to_string()))?
            .len()
            > 65536
        {
            return Err(Error::Composition("literal stage exceeds 64 KiB".into()));
        }
        Ok(ModuleInstance::Stage(Arc::new(LiteralStage(effect))))
    }
}
