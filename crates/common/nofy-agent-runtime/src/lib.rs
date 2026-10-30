//! Composable agent execution without application, filesystem or provider defaults.
//!
//! Hosts keep ownership of policy and side effects; the driver is shared by
//! standalone agents and the compatibility host for the original Nofy preset.

pub mod agent;
pub mod coding;
pub mod compile;
pub mod composition;
pub mod context;
pub mod context_policy;
pub mod control;
mod controllers;
pub mod driver;
#[cfg(feature = "sqlite")]
pub mod durable;
pub mod event_program;
pub mod events;
pub mod governance;
pub mod hooks;
mod identity;
pub mod mailbox;
pub mod memory;
pub mod model;
pub mod model_journal;
#[cfg(feature = "pack")]
pub mod pack;
pub mod pipeline;
pub mod policy;
pub mod program;
pub mod prompt;
pub mod recipe;
mod reconciliation;
pub mod registry;
pub mod settings;
pub mod system;
pub use identity::IdentityScheme;
pub mod state;
#[cfg(feature = "sqlite")]
pub mod supervisor;
pub mod tool_program;
pub mod tools;
#[cfg(feature = "workflow")]
pub mod workflow;

pub use agent::{Agent, AgentBuilder, AgentSpec, Components, RunInput, RunOutcome};
pub use context::RunContext;
pub use model::{
    CompletionInfo, InputPart, Message, Model, ModelCapabilities, ModelChunk, ModelDelta,
    ModelRequest, ModelResponse, ModelStream, ToolCall,
};
pub use policy::{Admission, Policy};
pub use prompt::{Prompt, PromptTemplate, StaticPrompt};
pub use settings::{Settings, SettingsResolver, SettingsSource, StaticSettings};
pub use state::{Checkpoint, Checkpointer, InMemoryCheckpointer, RunState};
pub use tools::{ToolCatalog, ToolEntry, ToolSnapshot, ToolSource};

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("invalid agent composition: {0}")]
    Composition(String),
    #[error("model failed: {0}")]
    Model(String),
    #[error("model failed: {0}")]
    ModelFailure(#[from] model::ModelFailure),
    #[error("tool failed: {0}")]
    Tool(String),
    #[error("checkpoint failed: {0}")]
    Checkpoint(String),
    #[error("agent run cancelled")]
    Cancelled,
    #[error("agent run exceeded its execution budget")]
    BudgetExceeded,
    #[error("governed operation requires reconciliation: {0}")]
    GovernancePaused(serde_json::Value),
}
