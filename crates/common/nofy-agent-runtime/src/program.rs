//! Frozen executable roots. Each variant binds an actual existing runtime;
//! model-free programs never acquire a synthetic model or Agent definition.
use crate::{Agent, Error, ToolCall, compile::*, registry::ModuleRegistry, tool_program::*};
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case", deny_unknown_fields)]
pub enum ProgramSnapshot {
    Event {
        snapshot: crate::event_program::EventCompilationSnapshot,
    },
    Agent {
        snapshot: CompilationSnapshot,
    },
    Tool {
        snapshot: ToolCompilationSnapshot,
        call: ToolCall,
    },
    #[cfg(feature = "workflow")]
    Workflow {
        snapshot: crate::workflow::compile::WorkflowCompilationSnapshot,
        input: serde_json::Value,
    },
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ExecutionSnapshot {
    pub version: u32,
    pub program: ProgramSnapshot,
}
impl ExecutionSnapshot {
    pub fn restore(&self, registry: &ModuleRegistry) -> Result<CompiledProgram, Error> {
        if self.version != 2
            || serde_json::to_vec(self).map_or(true, |v| v.len() > 16 * 1024 * 1024)
        {
            return Err(Error::Composition(
                "execution snapshot requires version 2 and at most 16 MiB".into(),
            ));
        }
        match &self.program {
            ProgramSnapshot::Event { snapshot } => {
                CompiledProgram::for_event(&snapshot.restore(registry)?)
            }
            ProgramSnapshot::Agent { snapshot } => {
                CompiledProgram::for_agent(&snapshot.restore(registry)?)
            }
            ProgramSnapshot::Tool { snapshot, call } => {
                CompiledProgram::for_tool(&snapshot.restore(registry)?, call.clone())
            }
            #[cfg(feature = "workflow")]
            ProgramSnapshot::Workflow { snapshot, input } => {
                CompiledProgram::for_workflow(&snapshot.restore(registry)?, input.clone())
            }
        }
    }
    pub fn name(&self) -> &str {
        match &self.program {
            ProgramSnapshot::Event { snapshot } => &snapshot.definition.host.name,
            ProgramSnapshot::Agent { snapshot } => &snapshot.agent.name,
            ProgramSnapshot::Tool { snapshot, .. } => &snapshot.definition.name,
            #[cfg(feature = "workflow")]
            ProgramSnapshot::Workflow { snapshot, .. } => &snapshot.document.host.name,
        }
    }
    pub fn is_agent(&self) -> bool {
        matches!(self.program, ProgramSnapshot::Agent { .. })
    }
}
#[derive(Clone)]
pub struct CompiledProgram {
    pub snapshot: ExecutionSnapshot,
    pub(crate) agent: Agent,
}
impl CompiledProgram {
    fn new(agent: Agent, program: ProgramSnapshot) -> Result<Self, Error> {
        let snapshot = ExecutionSnapshot {
            version: 2,
            program,
        };
        if serde_json::to_vec(&snapshot).map_or(true, |v| v.len() > 16 * 1024 * 1024) {
            return Err(Error::Composition(
                "execution snapshot exceeds 16 MiB".into(),
            ));
        }
        Ok(Self { agent, snapshot })
    }
    pub fn for_event(compiled: &crate::event_program::CompiledEventProgram) -> Result<Self, Error> {
        Self::new(
            compiled.agent.clone(),
            ProgramSnapshot::Event {
                snapshot: compiled.snapshot.clone(),
            },
        )
    }
    pub fn for_agent(compiled: &CompiledAgent) -> Result<Self, Error> {
        Self::new(
            compiled.agent.clone(),
            ProgramSnapshot::Agent {
                snapshot: compiled.snapshot.clone(),
            },
        )
    }
    pub fn for_tool(compiled: &CompiledToolRuntime, call: ToolCall) -> Result<Self, Error> {
        crate::tool_program::validate_call(&call)?;
        Self::new(
            compiled.runtime.program(call.clone())?,
            ProgramSnapshot::Tool {
                snapshot: compiled.snapshot.clone(),
                call,
            },
        )
    }
    #[cfg(feature = "workflow")]
    pub fn for_workflow(
        compiled: &crate::workflow::compile::CompiledWorkflow,
        input: serde_json::Value,
    ) -> Result<Self, Error> {
        let call = ToolCall {
            id: "workflow-root".into(),
            name: "workflow_execute".into(),
            arguments: serde_json::json!({"input":input}),
        };
        crate::tool_program::validate_call(&call)?;
        Self::new(
            compiled.host.program(call)?,
            ProgramSnapshot::Workflow {
                snapshot: compiled.snapshot.clone(),
                input,
            },
        )
    }
    pub fn composition_identity(&self) -> &str {
        self.agent.composition_identity()
    }
    pub fn checkpoint_key(&self, thread_id: &str) -> String {
        self.agent.checkpoint_key(thread_id)
    }
    pub fn with_checkpointer(mut self, store: std::sync::Arc<dyn crate::Checkpointer>) -> Self {
        self.agent = self.agent.with_checkpointer(store);
        self
    }
    pub async fn invoke(
        &self,
        input: crate::RunInput,
        mut context: crate::RunContext,
    ) -> Result<crate::RunOutcome, Error> {
        if self.snapshot.is_agent() {
            if !input.resume && input.prompt.is_none() && input.content.is_none() {
                return Err(Error::Composition(
                    "Agent program requires initial input".into(),
                ));
            }
        } else if input.prompt.is_some() || input.content.is_some() {
            return Err(Error::Composition(
                "model-free program input is fixed by its snapshot".into(),
            ));
        }
        context.capabilities.insert(ProgramRoot {
            thread_id: context.thread_id.clone(),
            run_id: context.run_id.clone(),
        });
        self.agent.invoke(input, context).await
    }
}

/// The supervisor reads both wire formats, while RunRecord's default type and
/// original snapshot field remain source-compatible for legacy consumers.
#[derive(Clone, Debug, Serialize)]
#[serde(untagged)]
pub enum RunSnapshot {
    Program(ExecutionSnapshot),
    Agent(CompilationSnapshot),
}
impl<'de> Deserialize<'de> for RunSnapshot {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        let value = serde_json::Value::deserialize(deserializer)?;
        match value.get("version").and_then(serde_json::Value::as_u64) {
            Some(1) if value.get("program").is_none() => serde_json::from_value(value)
                .map(Self::Agent)
                .map_err(serde::de::Error::custom),
            Some(2) => serde_json::from_value(value)
                .map(Self::Program)
                .map_err(serde::de::Error::custom),
            _ => Err(serde::de::Error::custom(
                "unsupported or mixed root snapshot version",
            )),
        }
    }
}
impl RunSnapshot {
    pub fn name(&self) -> &str {
        match self {
            Self::Program(snapshot) => snapshot.name(),
            Self::Agent(snapshot) => &snapshot.agent.name,
        }
    }
    pub fn is_agent(&self) -> bool {
        match self {
            Self::Program(snapshot) => snapshot.is_agent(),
            Self::Agent(_) => true,
        }
    }
}
#[cfg(feature = "sqlite")]
pub(crate) struct ExecutionPlan {
    pub agent: Agent,
    pub snapshot: RunSnapshot,
}
#[cfg(feature = "sqlite")]
impl ExecutionPlan {
    pub fn legacy(compiled: &CompiledAgent) -> Self {
        Self {
            agent: compiled.agent.clone(),
            snapshot: RunSnapshot::Agent(compiled.snapshot.clone()),
        }
    }
    pub fn program(compiled: &CompiledProgram) -> Self {
        Self {
            agent: compiled.agent.clone(),
            snapshot: RunSnapshot::Program(compiled.snapshot.clone()),
        }
    }
}
#[derive(Clone)]
pub(crate) struct ProgramRoot {
    pub thread_id: String,
    pub run_id: String,
}
impl ProgramRoot {
    pub fn matches(&self, context: &crate::RunContext) -> bool {
        self.thread_id == context.thread_id && self.run_id == context.run_id
    }
}
