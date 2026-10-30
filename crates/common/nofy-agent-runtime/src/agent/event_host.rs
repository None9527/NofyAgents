use super::*;
use crate::{event_program::BoundEvent, hooks::*};

impl Agent {
    pub(crate) fn bind_event_program(
        mut self,
        event: BoundEvent,
        identity: String,
    ) -> Result<Self, Error> {
        let mut catalog = EventCatalog::runtime();
        let registrations = self
            .hooks
            .as_ref()
            .map_or_else(Vec::new, |bus| bus.registrations().to_vec());
        match catalog.get(&event.declaration.name) {
            Some(existing) if existing != &event.declaration => {
                return Err(Error::Composition(
                    "event conflicts with runtime declaration".into(),
                ));
            }
            None => catalog.declare(event.declaration.clone())?,
            _ => {}
        }
        self = self.with_hooks(HookBus::new(catalog, registrations)?);
        self.composition =
            serde_json::to_string(&(&self.composition, "event-program-v1", identity))
                .map_err(|e| Error::Composition(e.to_string()))?;
        self.event_program = Some(event);
        Ok(self)
    }
    pub(super) fn prepare_event(
        &self,
        state: &mut RunState,
        context: &RunContext,
        resume: bool,
    ) -> Result<(), Error> {
        let event = self.event_program.as_ref().expect("event program");
        if resume {
            if state.execution_run_id.as_deref() != Some(&context.run_id) {
                return Err(Error::Checkpoint(
                    "event program run identity changed".into(),
                ));
            }
            return Ok(());
        }
        if !state.messages.is_empty() || state.has_pending_work() || state.complete {
            return Err(Error::Checkpoint(
                "event program already started; use explicit resume".into(),
            ));
        }
        state.execution_run_id = Some(context.run_id.clone());
        if let Some(initial) = context
            .capabilities
            .get::<crate::mailbox::InitialInputBinding>()
        {
            if !initial.matches(context) {
                return Err(Error::Checkpoint("event initial recipient changed".into()));
            }
            state.input_progress.initial = Some(initial.0.proof());
        }
        state.hook_progress.run_id = Some(context.run_id.clone());
        state.hook_progress.turn = 1;
        // A durable source fact remains pending until its HookResult is saved.
        state.hook_progress.facts.push_back(progress::HookFact {
            name: event.declaration.name.clone(),
            operation: event.operation.clone(),
            payload: event.payload.clone(),
        });
        Ok(())
    }
}
impl AgentHost<'_> {
    pub(super) async fn advance_event(&mut self) -> Result<Step<RunOutcome>, Error> {
        if self.state.complete {
            return Ok(Step::Complete(RunOutcome::Completed {
                output: self.state.output.clone(),
                state: self.state.clone(),
            }));
        }
        let event = self.agent.event_program.as_ref().expect("event program");
        let fact = self
            .state
            .hook_progress
            .facts
            .front()
            .filter(|fact| {
                fact.name == event.declaration.name
                    && fact.operation == event.operation
                    && fact.payload == event.payload
            })
            .ok_or_else(|| Error::Checkpoint("event source fact is missing or changed".into()))?;
        if self.state.hook_progress.facts.len() != 1 || !self.state.messages.is_empty() {
            return Err(Error::Checkpoint(
                "event source acquired unrelated work".into(),
            ));
        }
        #[cfg(feature = "workflow")]
        let mut context = self.context.clone();
        #[cfg(not(feature = "workflow"))]
        let context = self.context.clone();
        #[cfg(feature = "workflow")]
        context.capabilities.insert(HookReplaySource::owned(
            &event.declaration.owner,
            &fact.name,
            &fact.operation,
            &context,
        ));
        let result = self
            .agent
            .hooks
            .as_ref()
            .expect("event bus")
            .emit(
                &event.declaration.owner,
                &fact.name,
                &fact.operation,
                fact.payload.clone(),
                &context,
            )
            .await?;
        if let HookDecision::Pause { reason } = result.control {
            return Ok(self.hook_pause(reason));
        }
        self.state.output =
            serde_json::to_string(&result).map_err(|e| Error::Checkpoint(e.to_string()))?;
        self.state.hook_progress.facts.clear();
        self.state.hook_progress.stop_done = true;
        self.state.complete = true;
        self.commit().await?;
        Ok(Step::Continue)
    }
}
