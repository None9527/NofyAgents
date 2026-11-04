//! Native primitive Hook receipts share the original tool and budget boundary.
#[cfg(feature = "sqlite")]
use super::EventDeclaration;
use super::{HookBus, HookDecision, HookEvent, HookRegistration};
#[cfg(any(feature = "sqlite", feature = "workflow"))]
use crate::RunState;
use crate::{Error, RunContext, ToolCall};
use nofy_tool_runtime::{ToolDispatch, ToolError, TypedToolOutput};
use serde::{Deserialize, Serialize};
#[cfg(any(feature = "sqlite", feature = "workflow"))]
use sha2::{Digest, Sha256};

#[cfg(feature = "sqlite")]
mod storage;
#[cfg(feature = "sqlite")]
pub(crate) use storage::{NativeControl, Scope, accept, accepted, target, targets};

#[derive(Clone, Copy, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum HookRecoveryKind {
    Effect,
    Recorded,
    Gate,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(deny_unknown_fields)]
pub struct HookRecoveryTicket {
    pub id: String,
    pub effect_revision: u64,
    pub hook_revision: u64,
    pub intent_digest: String,
    pub kind: HookRecoveryKind,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
#[serde(tag = "kind", rename_all = "snake_case", deny_unknown_fields)]
pub enum HookResolution {
    Decision { decision: HookDecision },
    Error { message: String },
    Recorded,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
#[serde(deny_unknown_fields)]
pub struct HookReconciliation {
    pub ticket: HookRecoveryTicket,
    pub resolution: HookResolution,
}
impl HookReconciliation {
    #[cfg(feature = "sqlite")]
    pub(crate) fn validate(&self) -> Result<(), Error> {
        if !digest_id(&self.ticket.id)
            || !digest_id(&self.ticket.intent_digest)
            || self.ticket.effect_revision == 0
            || self.ticket.hook_revision == 0
            || matches!(&self.resolution, HookResolution::Error { message } if message.is_empty() || message.len() > 8192)
            || serde_json::to_vec(self).map_err(checkpoint)?.len() > 1024 * 1024
        {
            return Err(checkpoint("invalid Hook reconciliation ticket or result"));
        }
        Ok(())
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct HookRecoveryTarget {
    pub ticket: HookRecoveryTicket,
    pub event: HookEvent,
    pub tool: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct HookRecoveryPage {
    pub schema_version: u32,
    pub targets: Vec<HookRecoveryTarget>,
    pub next: Option<String>,
}

#[cfg(any(feature = "sqlite", feature = "workflow"))]
pub(crate) fn checkpoint(error: impl std::fmt::Display) -> Error {
    Error::Checkpoint(error.to_string())
}
#[cfg(feature = "sqlite")]
fn digest_id(value: &str) -> bool {
    value.len() == 64 && value.bytes().all(|c| c.is_ascii_hexdigit())
}

#[cfg(any(feature = "sqlite", feature = "workflow"))]
pub(crate) fn parent_fingerprint(state: &RunState, event: &HookEvent) -> Result<String, Error> {
    let (_, _, _, _, operation): (String, String, crate::registry::ModuleRef, String, String) =
        serde_json::from_str(&event.id).map_err(checkpoint)?;
    let mut state = state.clone();
    state.control_sequence = 0;
    state.hook_progress.facts.retain(|fact| {
        !matches!(fact.name.as_str(), "turn_error" | "turn_cancelled")
            || fact.operation == operation
    });
    Ok(format!(
        "{:x}",
        Sha256::digest(serde_json::to_vec(&state).map_err(checkpoint)?)
    ))
}

pub(crate) fn bind(
    bus: &HookBus,
    registration: &HookRegistration,
    event: &HookEvent,
    context: &mut RunContext,
) {
    #[cfg(feature = "sqlite")]
    if let Some(control) = context.capabilities.get::<NativeControl>() {
        let scope = Scope::new(control, bus, registration, event, context);
        context.capabilities.insert(scope);
    }
    #[cfg(not(feature = "sqlite"))]
    let _ = (bus, registration, event, context);
}

pub(crate) fn bind_record(context: &mut RunContext, key: &str) {
    #[cfg(feature = "sqlite")]
    if let Some(scope) = context.capabilities.get::<Scope>() {
        let mut scope = scope.as_ref().clone();
        scope.journal_key = Some(key.into());
        context.capabilities.insert(scope);
    }
    #[cfg(not(feature = "sqlite"))]
    let _ = (context, key);
}

/// Native authority is installed only by a fenced Supervisor, never by JSON.
pub fn recovery_identity(context: &RunContext) -> Option<String> {
    #[cfg(feature = "sqlite")]
    return context
        .capabilities
        .get::<Scope>()
        .map(|scope| scope.identity());
    #[cfg(not(feature = "sqlite"))]
    {
        let _ = context;
        None
    }
}

/// Replay a known result, or stop on a recorded unknown primitive intent.
pub async fn replay(
    context: &RunContext,
    call: &ToolCall,
    revision: &str,
    dispatch: &dyn ToolDispatch,
) -> Result<Option<Result<TypedToolOutput, ToolError>>, Error> {
    #[cfg(feature = "sqlite")]
    if let Some(scope) = context.capabilities.get::<Scope>() {
        return scope.replay(context, call, revision, dispatch).await;
    }
    let _ = (context, call, revision, dispatch);
    Ok(None)
}

/// Call only after the original schema and permission admission succeeds.
pub async fn start(
    context: &RunContext,
    call: &ToolCall,
    revision: &str,
    dispatch: &dyn ToolDispatch,
) -> Result<(), Error> {
    #[cfg(feature = "sqlite")]
    if let Some(scope) = context.capabilities.get::<Scope>() {
        return scope.start(context, call, revision, dispatch).await;
    }
    let _ = (context, call, revision, dispatch);
    Ok(())
}

pub async fn complete(
    context: &RunContext,
    call: &ToolCall,
    revision: &str,
    dispatch: &dyn ToolDispatch,
    result: &Result<TypedToolOutput, ToolError>,
) -> Result<(), Error> {
    #[cfg(feature = "sqlite")]
    if let Some(scope) = context.capabilities.get::<Scope>() {
        return scope
            .complete(context, call, revision, dispatch, result)
            .await;
    }
    let _ = (context, call, revision, dispatch, result);
    Ok(())
}

pub(crate) async fn reconciled(context: &RunContext) -> Result<Option<String>, Error> {
    #[cfg(feature = "sqlite")]
    if let Some(scope) = context.capabilities.get::<Scope>() {
        return scope.reconciled().await;
    }
    let _ = context;
    Ok(None)
}

#[cfg(feature = "sqlite")]
pub(crate) fn check_decision(
    declaration: &EventDeclaration,
    decision: &HookDecision,
) -> Result<(), Error> {
    declaration.check(decision)
}
