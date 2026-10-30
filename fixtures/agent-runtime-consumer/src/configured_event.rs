//! The consumer publishes session notifications through the public SDK only.
use nofy_agent_runtime::{event_program::*, hooks::HookDecision, program::*, registry::*, *};
use serde_json::json;
use std::sync::Arc;
pub async fn verify(registry: &mut ModuleRegistry) -> Result<(), Error> {
    registry.register_factory(Arc::new(InstanceFactory::new(
        "host.session-producer",
        "1",
        ModuleInstance::EventProducer(Arc::new(EventProducer::session())),
    )))?;
    for definition in [
        json!({"reference":{"id":"session-producer","version":"1"},"factory":"host.session-producer","config":{}}),
        json!({"reference":{"id":"session-handler","version":"1"},"factory":"hook.workflow","config":{"workflow":"hook@1"}}),
        json!({"reference":{"id":"session-subscription","version":"1"},"factory":"hook.subscription","config":{"event":"session_end"},"dependencies":{"handler":{"id":"session-handler","version":"1"}}}),
    ] {
        registry.define(serde_json::from_value(definition).unwrap())?;
    }
    let event=compile_event(serde_json::from_value(json!({"schema_version":1,"host":{"name":"session-events","hooks":[{"id":"session-subscription","version":"1"}]},"producer":{"id":"session-producer","version":"1"},"event":"session_end","operation":"coordinator-close","payload":{"reason":"closed by host"}})).unwrap(),registry)?;
    let program = CompiledProgram::for_event(&event)?
        .snapshot
        .restore(registry)?
        .with_checkpointer(Arc::new(InMemoryCheckpointer::default()));
    for input in [RunInput::default(), RunInput::resume()] {
        let outcome = program
            .invoke(
                input,
                RunContext::new("external-session", "external-session-end"),
            )
            .await?;
        let RunOutcome::Completed { state, .. } = outcome else {
            return Err(Error::Checkpoint("session event did not complete".into()));
        };
        assert!(state.messages.is_empty());
        assert_eq!(state.steps, 0);
        let result: nofy_agent_runtime::hooks::HookResult =
            serde_json::from_str(&state.output).unwrap();
        assert_eq!(result.control, HookDecision::Continue);
    }
    Ok(())
}
