use nofy_tool_runtime::TypedExtensions;
use tokio_util::sync::CancellationToken;

/// Live capabilities are explicitly bound per run and are never checkpointed.
#[derive(Clone, Default)]
pub struct RunContext {
    pub thread_id: String,
    pub run_id: String,
    pub cancel: CancellationToken,
    pub capabilities: TypedExtensions,
}

impl RunContext {
    pub fn new(thread_id: impl Into<String>, run_id: impl Into<String>) -> Self {
        Self {
            thread_id: thread_id.into(),
            run_id: run_id.into(),
            ..Self::default()
        }
    }
}

/// Read-only transcript at the admitted tool boundary. Runtime adapters can
/// reconstruct conditional context without keeping an uncheckpointed session map.
#[derive(Clone)]
pub struct ToolInvocationState(pub(crate) std::sync::Arc<crate::RunState>);
impl ToolInvocationState {
    pub fn state(&self) -> &crate::RunState {
        &self.0
    }
}

/// Explicit, compiled capability bindings. No discovery or IO is performed by
/// the runtime; applications supply immutable handles scoped to this agent.
/// Bindings cannot replace run/thread identity, cancellation, or services
/// already installed by the supervising host.
pub trait ContextBinding: Send + Sync {
    fn bind(&self, context: &mut RunContext) -> Result<(), crate::Error>;
}

/// Bindings configure capabilities, not the run owner or its control channel.
/// Supervisor observation stays authoritative even if a module starts from a
/// fresh extension map; absent services may still be supplied by the host.
pub(crate) struct RunServices {
    thread_id: String,
    run_id: String,
    cancel: CancellationToken,
    events: Option<std::sync::Arc<crate::events::EventSinkBinding>>,
    observer: Option<std::sync::Arc<crate::composition::ChildObserverBinding>>,
    controllers: Option<std::sync::Arc<crate::controllers::ControllerBinding>>,
    identity: Option<std::sync::Arc<crate::identity::IdentityBinding>>,
    program: Option<std::sync::Arc<crate::program::ProgramRoot>>,
    #[cfg(feature = "sqlite")]
    supervisor: Option<std::sync::Arc<crate::supervisor::SupervisedIdentity>>,
    #[cfg(feature = "sqlite")]
    parking: Option<std::sync::Arc<crate::supervisor::jobs::ParkBinding>>,
    #[cfg(feature = "sqlite")]
    hook_effects: Option<std::sync::Arc<crate::hooks::primitive::NativeControl>>,
}
impl RunServices {
    pub fn capture(context: &RunContext) -> Self {
        Self {
            thread_id: context.thread_id.clone(),
            run_id: context.run_id.clone(),
            cancel: context.cancel.clone(),
            events: context.capabilities.get(),
            observer: context.capabilities.get(),
            controllers: context.capabilities.get(),
            identity: context.capabilities.get(),
            program: context.capabilities.get(),
            #[cfg(feature = "sqlite")]
            supervisor: context.capabilities.get(),
            #[cfg(feature = "sqlite")]
            parking: context.capabilities.get(),
            #[cfg(feature = "sqlite")]
            hook_effects: context.capabilities.get(),
        }
    }
    pub fn restore(self, context: &mut RunContext) -> Result<(), crate::Error> {
        let changed = context.thread_id != self.thread_id || context.run_id != self.run_id;
        context.thread_id = self.thread_id;
        context.run_id = self.run_id;
        context.cancel = self.cancel;
        if let Some(events) = self.events {
            context.capabilities.insert_arc(events);
        }
        if let Some(observer) = self.observer {
            context.capabilities.insert_arc(observer);
        }
        if let Some(controllers) = self.controllers {
            context.capabilities.insert_arc(controllers);
        }
        if let Some(identity) = self.identity {
            context.capabilities.insert_arc(identity);
        }
        if let Some(program) = self.program {
            context.capabilities.insert_arc(program);
        }
        #[cfg(feature = "sqlite")]
        if let Some(supervisor) = self.supervisor {
            context.capabilities.insert_arc(supervisor);
        }
        #[cfg(feature = "sqlite")]
        if let Some(parking) = self.parking {
            context.capabilities.insert_arc(parking);
        }
        #[cfg(feature = "sqlite")]
        if let Some(effects) = self.hook_effects {
            context.capabilities.insert_arc(effects);
        }
        if changed {
            return Err(crate::Error::Composition(
                "a capability binding cannot change run/thread identity".into(),
            ));
        }
        Ok(())
    }
}
