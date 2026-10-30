use super::*;
use nofy_agent_runtime::{Admission, RunState, ToolCall, governance, policy};
use std::{sync::Mutex, time::Duration};

enum Control {
    Decision(HookDecision),
    Error(Error),
}
pub(super) struct RuntimeExecution<'a> {
    event: &'a HookEvent,
    context: &'a RunContext,
    control: Mutex<Option<Control>>,
}
impl<'a> RuntimeExecution<'a> {
    pub(super) fn new(event: &'a HookEvent, context: &'a RunContext) -> Self {
        Self {
            event,
            context,
            control: Mutex::new(None),
        }
    }
    pub(super) fn finish(
        &self,
        result: Result<HookDecision, Error>,
    ) -> Result<HookDecision, Error> {
        match self
            .control
            .lock()
            .map_err(|_| Error::Composition("legacy hook control lock poisoned".into()))?
            .take()
        {
            Some(Control::Decision(decision)) => Ok(decision),
            Some(Control::Error(error)) => Err(error),
            None => result,
        }
    }
    async fn execute(
        &self,
        spec: &crate::config::HookSpec,
        envelope: &HookEventEnvelope,
        run: &crate::runner::RunContext<'_>,
        mode: crate::runner::GateKind,
    ) -> Result<crate::runner::HookRunOutput, Control> {
        let call = ToolCall {
            id: "legacy-hook".into(),
            name: "legacy_hook".into(),
            arguments: json!({"hook":spec,"event":self.event.name,"payload":self.event.payload}),
        };
        match policy::admit_required(&call, &RunState::default(), self.context)
            .await
            .map_err(Control::Error)?
        {
            Admission::Allow => {}
            Admission::Deny(reason) => {
                return Err(Control::Decision(HookDecision::Deny { reason }));
            }
            Admission::Pause(reason) => {
                return Err(Control::Decision(HookDecision::Pause { reason }));
            }
        }
        let invocation = self
            .context
            .capabilities
            .get::<nofy_agent_runtime::hooks::HookInvocation>();
        let operation = serde_json::to_string(&(
            "legacy-hook",
            &self.event.id,
            invocation
                .as_ref()
                .map(|invocation| &invocation.hook_identity),
            &spec.name,
        ))
        .map_err(|e| Control::Error(Error::Composition(e.to_string())))?;
        governance::tool_operation(
            self.context,
            &call,
            &operation,
            "legacy-hook-runner:1",
            async { Ok(crate::runner::run_hook(spec, envelope, run, mode).await) },
        )
        .await
        .map_err(Control::Error)
    }
}
#[async_trait::async_trait]
impl crate::runner::HookExecution for RuntimeExecution<'_> {
    async fn run(
        &self,
        spec: &crate::config::HookSpec,
        envelope: &HookEventEnvelope,
        run: &crate::runner::RunContext<'_>,
        mode: crate::runner::GateKind,
    ) -> crate::runner::HookRunOutput {
        let halted = self
            .control
            .lock()
            .map_or(true, |control| control.is_some());
        if !halted {
            match self.execute(spec, envelope, run, mode).await {
                Ok(result) => return result,
                Err(control) => {
                    if let Ok(mut slot) = self.control.lock() {
                        *slot = Some(control);
                    }
                }
            }
        }
        (
            crate::runner::HookRunnerResult::Failed(
                "runtime execution control stopped this hook batch".into(),
            ),
            Duration::ZERO,
            None,
        )
    }
}
