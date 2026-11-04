use super::ModuleKind;
use crate::{
    Checkpointer, Model, Policy, Prompt, ToolCatalog, ToolSource, agent::Middleware,
    context::ContextBinding, memory::ContextSource,
};
use std::{any::Any, sync::Arc};
/// Live native values are never serialized. The identity is frozen alongside
/// the declaring resource module and must exclude actual credential values.
#[derive(Clone)]
pub struct ResourceHandle {
    identity: String,
    value: Arc<dyn Any + Send + Sync>,
}
impl ResourceHandle {
    pub fn new<T: Any + Send + Sync>(
        identity: impl Into<String>,
        value: Arc<T>,
    ) -> Result<Self, crate::Error> {
        let identity = identity.into();
        if identity.trim().is_empty() || identity.len() > 16384 {
            return Err(crate::Error::Composition(
                "resource identity requires 1..=16384 bytes".into(),
            ));
        }
        Ok(Self { identity, value })
    }
    pub fn identity(&self) -> &str {
        &self.identity
    }
    pub fn get<T: Any + Send + Sync>(&self) -> Option<Arc<T>> {
        self.value.clone().downcast().ok()
    }
}
#[derive(Clone)]
pub enum ModuleInstance {
    Resource(Arc<ResourceHandle>),
    Model(Arc<dyn Model>),
    Prompt(Arc<dyn Prompt>),
    ToolPack(ToolCatalog),
    Policy(Arc<dyn Policy>),
    ToolSource(Arc<dyn ToolSource>),
    ContextSource(Arc<dyn ContextSource>),
    ContextPolicy(Arc<dyn crate::context_policy::ContextPolicy>),
    SessionPolicy(Arc<dyn crate::session_policy::SessionPolicy>),
    Governance(Arc<crate::governance::GovernanceProfile>),
    Stage(Arc<dyn crate::recipe::AgentStage>),
    StageSource(Arc<dyn crate::recipe::StageSource>),
    Recipe(Arc<crate::recipe::RuntimeRecipe>),
    Middleware(Arc<dyn Middleware>),
    Checkpointer(Arc<dyn Checkpointer>),
    Binding(Arc<dyn ContextBinding>),
    Hook(Arc<crate::hooks::HookRegistration>),
    HookHandler(Arc<dyn crate::hooks::HookHandler>),
    EventProducer(Arc<crate::event_program::EventProducer>),
}

impl ModuleInstance {
    pub fn kind(&self) -> ModuleKind {
        match self {
            Self::Resource(_) => ModuleKind::Resource,
            Self::Model(_) => ModuleKind::Model,
            Self::Prompt(_) => ModuleKind::Prompt,
            Self::ToolPack(_) => ModuleKind::ToolPack,
            Self::Policy(_) => ModuleKind::Policy,
            Self::ToolSource(_) => ModuleKind::ToolSource,
            Self::ContextSource(_) => ModuleKind::ContextSource,
            Self::ContextPolicy(_) => ModuleKind::ContextPolicy,
            Self::SessionPolicy(_) => ModuleKind::SessionPolicy,
            Self::Governance(_) => ModuleKind::Governance,
            Self::Stage(_) => ModuleKind::Stage,
            Self::StageSource(_) => ModuleKind::StageSource,
            Self::Recipe(_) => ModuleKind::Recipe,
            Self::Middleware(_) => ModuleKind::Middleware,
            Self::Checkpointer(_) => ModuleKind::Checkpointer,
            Self::Binding(_) => ModuleKind::Binding,
            Self::Hook(_) => ModuleKind::Hook,
            Self::HookHandler(_) => ModuleKind::HookHandler,
            Self::EventProducer(_) => ModuleKind::EventProducer,
        }
    }
}
