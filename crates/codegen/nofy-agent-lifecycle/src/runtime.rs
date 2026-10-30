//! Adapters preserve the existing Send/Local contributor contracts. A Send
//! emitter automatically works with LocalSet via the existing blanket impls.
use crate::send::*;
use nofy_agent_runtime::{
    Error, RunContext,
    hooks::{HookBus, HookDecision, HookEvent, HookHandler, HookResult, runtime_owner},
};
use std::sync::Arc;

pub struct LifecycleHandler {
    registry: Arc<ExtensionRegistry>,
    input_policy: InputPolicy,
}
impl LifecycleHandler {
    pub fn new(registry: Arc<ExtensionRegistry>, input_policy: InputPolicy) -> Self {
        Self {
            registry,
            input_policy,
        }
    }
}
#[async_trait::async_trait]
impl HookHandler for LifecycleHandler {
    async fn handle(&self, event: &HookEvent, _: &RunContext) -> Result<HookDecision, Error> {
        match event.name.as_str() {
            "turn_start" => {
                for contributor in self.registry.turn_lifecycle_contributors() {
                    contributor
                        .on_turn_start_with_policy(
                            &TurnStartInput::new(!self.input_policy.authority.is_human_intent()),
                            self.input_policy,
                        )
                        .await;
                }
            }
            "turn_done" => {
                for contributor in self.registry.turn_lifecycle_contributors() {
                    contributor.on_turn_done(&TurnDoneInput).await;
                }
            }
            "turn_cancelled" => {
                for contributor in self.registry.turn_lifecycle_contributors() {
                    contributor
                        .on_turn_abort(&TurnAbortInput::new(TurnAbortReason::Interrupted))
                        .await;
                }
            }
            "turn_error" => {
                let message = event
                    .payload
                    .get("error")
                    .and_then(serde_json::Value::as_str)
                    .unwrap_or("agent failed");
                for contributor in self.registry.turn_lifecycle_contributors() {
                    contributor.on_turn_error(&TurnErrorInput { message }).await;
                }
            }
            "session_idle" => {
                for contributor in self.registry.session_lifecycle_contributors() {
                    contributor.on_session_idle(&SessionIdleInput).await;
                }
            }
            "before_model" => {
                let mut payload = event.payload.clone();
                let mut request: nofy_agent_runtime::ModelRequest =
                    serde_json::from_value(payload.get("request").cloned().ok_or_else(|| {
                        Error::Composition("lifecycle hook requires model request".into())
                    })?)
                    .map_err(|e| Error::Composition(e.to_string()))?;
                let input = TurnInputContext {
                    turn_id: event.scope.run_id.clone(),
                    synthetic: !self.input_policy.authority.is_human_intent(),
                };
                for contributor in self.registry.turn_input_contributors() {
                    for fragment in contributor.contribute_turn_input(&input).await {
                        request.messages.push(nofy_agent_runtime::Message::User {
                            content: fragment.text,
                        });
                    }
                }
                payload["request"] =
                    serde_json::to_value(request).map_err(|e| Error::Composition(e.to_string()))?;
                return Ok(HookDecision::Patch { payload });
            }
            name => {
                return Err(Error::Composition(format!(
                    "lifecycle registry has no adapter for event {name}"
                )));
            }
        }
        Ok(HookDecision::Continue)
    }
}

pub type LifecycleReport = Arc<dyn Fn(Result<HookResult, Error>) + Send + Sync>;
/// Fact-only bridge for an existing lifecycle host. The host supplies its
/// authoritative current run context; failures and uncertain receipts are
/// reported explicitly because the old contributor trait has no control return.
pub struct LifecycleEmitter {
    bus: HookBus,
    context: Arc<dyn Fn() -> RunContext + Send + Sync>,
    report: LifecycleReport,
}
impl LifecycleEmitter {
    pub fn new(
        bus: HookBus,
        context: Arc<dyn Fn() -> RunContext + Send + Sync>,
        report: LifecycleReport,
    ) -> Self {
        Self {
            bus,
            context,
            report,
        }
    }
    async fn emit(&self, event: &str, payload: serde_json::Value) {
        let context = (self.context)();
        (self.report)(
            self.bus
                .emit(&runtime_owner(), event, event, payload, &context)
                .await,
        );
    }
}
#[async_trait::async_trait]
impl TurnLifecycleContributor for LifecycleEmitter {
    async fn on_turn_start_with_policy(&self, input: &TurnStartInput, _: InputPolicy) {
        self.emit(
            "turn_start",
            serde_json::json!({"synthetic":input.synthetic}),
        )
        .await;
    }
    async fn on_turn_start(&self, input: &TurnStartInput) {
        self.emit(
            "turn_start",
            serde_json::json!({"synthetic":input.synthetic}),
        )
        .await;
    }
    async fn on_turn_done(&self, _: &TurnDoneInput) {
        self.emit("turn_done", serde_json::json!({})).await;
    }
    async fn on_turn_abort(&self, _: &TurnAbortInput) {
        self.emit("turn_cancelled", serde_json::json!({})).await;
    }
    async fn on_turn_error(&self, input: &TurnErrorInput<'_>) {
        self.emit("turn_error", serde_json::json!({"error":input.message}))
            .await;
    }
}
#[async_trait::async_trait]
impl SessionLifecycleContributor for LifecycleEmitter {
    async fn on_session_idle(&self, _: &SessionIdleInput) {
        self.emit("session_idle", serde_json::json!({})).await;
    }
}
