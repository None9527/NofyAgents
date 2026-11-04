//! Versioned event subscriptions with typed gates and a side-effect journal.
//! Event declarations are installed by producers; subscriptions do not emit
//! events themselves. Producers own their durable emission boundaries.
mod emission;
mod factory;
mod journal;
pub mod primitive;
pub mod progress;
pub use factory::HookFactory;
pub use journal::{HookJournal, HookJournalBinding};

use crate::{Error, RunContext, registry::ModuleRef};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use std::{collections::BTreeMap, sync::Arc, time::Duration};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(deny_unknown_fields)]
pub struct EventDeclaration {
    pub name: String,
    pub owner: ModuleRef,
    pub payload_schema: Value,
    #[serde(default)]
    pub deny: bool,
    #[serde(default)]
    pub pause: bool,
    #[serde(default)]
    pub patch: bool,
    #[serde(default)]
    pub stop: bool,
}
impl EventDeclaration {
    fn check(&self, decision: &HookDecision) -> Result<(), Error> {
        let allowed = match decision {
            HookDecision::Continue => true,
            HookDecision::Deny { .. } => self.deny,
            HookDecision::Pause { .. } => self.pause,
            HookDecision::Patch { .. } => self.patch,
            HookDecision::Stop { .. } => self.stop,
        };
        if !allowed {
            return Err(Error::Composition(format!(
                "hook decision is not allowed for event {}",
                self.name
            )));
        }
        if let HookDecision::Patch { payload } = decision {
            crate::settings::validate_json_value(&self.payload_schema, payload)?;
        }
        Ok(())
    }
}

#[derive(Clone, Default)]
pub struct EventCatalog {
    events: BTreeMap<String, EventDeclaration>,
}
impl EventCatalog {
    pub fn declare(&mut self, event: EventDeclaration) -> Result<(), Error> {
        if event.name.trim().is_empty()
            || event.owner.id.trim().is_empty()
            || event.owner.version.trim().is_empty()
        {
            return Err(Error::Composition(
                "event name and producer version required".into(),
            ));
        }
        crate::settings::validate_json_schema(&event.payload_schema)?;
        if self.events.contains_key(&event.name) {
            return Err(Error::Composition(format!(
                "duplicate event declaration: {}",
                event.name
            )));
        }
        self.events.insert(event.name.clone(), event);
        Ok(())
    }
    pub fn declarations(&self) -> Vec<EventDeclaration> {
        self.events.values().cloned().collect()
    }
    pub fn get(&self, name: &str) -> Option<&EventDeclaration> {
        self.events.get(name)
    }
    pub fn runtime() -> Self {
        let mut catalog = Self::default();
        for name in [
            "session_start",
            "session_end",
            "session_idle",
            "turn_start",
            "turn_done",
            "turn_error",
            "turn_cancelled",
            "user_input",
            "before_model",
            "after_model",
            "before_tool",
            "after_tool",
            "tool_failure",
            "permission_denied",
            "permission_requested",
            "subagent_start",
            "subagent_stop",
            "subagent_finished",
            "before_compact",
            "after_compact",
            "workflow_start",
            "workflow_end",
            "node_start",
            "node_end",
            "node_failure",
            "before_stop",
        ] {
            let gate = matches!(
                name,
                "user_input"
                    | "before_model"
                    | "before_tool"
                    | "before_compact"
                    | "before_stop"
                    | "subagent_stop"
            );
            catalog
                .declare(EventDeclaration {
                    name: name.into(),
                    owner: runtime_owner(),
                    payload_schema: json!({"type":"object"}),
                    deny: gate,
                    pause: gate,
                    patch: matches!(name, "user_input" | "before_model" | "before_tool"),
                    stop: matches!(name, "before_stop" | "subagent_stop"),
                })
                .expect("builtin declaration");
        }
        catalog
    }
}
pub fn runtime_owner() -> ModuleRef {
    ModuleRef::new("nofy.runtime", "1")
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "decision", rename_all = "snake_case", deny_unknown_fields)]
pub enum HookDecision {
    Continue,
    Deny { reason: String },
    Pause { reason: Value },
    Patch { payload: Value },
    Stop { reason: Option<String> },
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HookEvent {
    pub version: u32,
    pub id: String,
    pub name: String,
    pub owner: ModuleRef,
    pub scope: crate::events::EventScope,
    pub payload: Value,
}
#[async_trait::async_trait]
pub trait HookHandler: Send + Sync {
    /// Only native controllers that checkpoint every effect may opt in. A
    /// frozen identity is part of the bus manifest; JSON cannot supply it.
    fn recovery_identity(&self) -> Option<String> {
        None
    }

    /// Reentry must preserve every effect's identity and durable dispatch
    /// evidence. Unknown primitive effects still require reconciliation.
    fn can_resume(&self, context: &RunContext) -> bool {
        self.resume_identity(context).is_some()
    }

    /// Recorded before dispatch and matched before reentering pending work.
    /// A new authority cannot retroactively certify an old unknown effect.
    fn resume_identity(&self, _context: &RunContext) -> Option<String> {
        self.recovery_identity()
    }

    async fn handle(&self, event: &HookEvent, context: &RunContext) -> Result<HookDecision, Error>;
}
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum FailurePolicy {
    Open,
    #[default]
    Closed,
}
fn default_timeout() -> u64 {
    5000
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct MatchValue {
    pub pointer: String,
    pub equals: Value,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct HookRule {
    pub event: String,
    #[serde(default)]
    pub priority: i32,
    #[serde(default = "default_timeout")]
    pub timeout_ms: u64,
    #[serde(default)]
    pub failure: FailurePolicy,
    #[serde(default)]
    pub matches: Option<MatchValue>,
}
pub struct HookRegistration {
    pub(crate) identity: String,
    pub(crate) declaration: EventDeclaration,
    pub(crate) rule: HookRule,
    pub(crate) handler: Arc<dyn HookHandler>,
}
impl HookRegistration {
    pub fn declaration(&self) -> &EventDeclaration {
        &self.declaration
    }
    pub fn identity(&self) -> &str {
        &self.identity
    }
    pub fn versioned(&self, identity: String) -> Result<Arc<Self>, Error> {
        Ok(Arc::new(Self::new(
            identity,
            self.declaration.clone(),
            self.rule.clone(),
            self.handler.clone(),
        )?))
    }
    pub fn new(
        identity: String,
        declaration: EventDeclaration,
        rule: HookRule,
        handler: Arc<dyn HookHandler>,
    ) -> Result<Self, Error> {
        if identity.trim().is_empty()
            || rule.event != declaration.name
            || !(1..=600_000).contains(&rule.timeout_ms)
        {
            return Err(Error::Composition(
                "hook identity/event/timeout is invalid".into(),
            ));
        }
        if let Some(matcher) = &rule.matches {
            if !matcher.pointer.is_empty() && !matcher.pointer.starts_with('/') {
                return Err(Error::Composition(
                    "hook matcher requires a JSON pointer".into(),
                ));
            }
            let mut chars = matcher.pointer.chars();
            while let Some(c) = chars.next() {
                if c == '~' && !matches!(chars.next(), Some('0' | '1')) {
                    return Err(Error::Composition(
                        "invalid hook matcher pointer escape".into(),
                    ));
                }
            }
        }
        crate::settings::validate_json_schema(&declaration.payload_schema)?;
        Ok(Self {
            identity,
            declaration,
            rule,
            handler,
        })
    }
}
#[derive(Clone, Default)]
struct HookChain(Vec<String>);

#[derive(Clone)]
pub struct HookBus {
    catalog: EventCatalog,
    registrations: Vec<Arc<HookRegistration>>,
    identity: String,
}
#[derive(Clone)]
pub struct HookBusBinding(pub HookBus);
#[derive(Clone)]
pub struct HookAgentName(pub String);
#[derive(Debug, Clone)]
pub enum SessionSignal {
    Idle,
    End { reason: String },
}
#[derive(Clone)]
pub struct HookInvocation {
    pub event_id: String,
    pub hook_identity: String,
}
#[cfg(feature = "workflow")]
#[derive(Clone)]
pub(crate) struct HookSourceEvent {
    pub event: HookEvent,
    pub replayable: bool,
}
#[cfg(feature = "workflow")]
#[derive(Clone)]
pub(crate) struct HookReplaySource {
    thread: String,
    run: String,
    owner: ModuleRef,
    name: String,
    operation: String,
}
#[cfg(feature = "workflow")]
impl HookReplaySource {
    pub fn new(name: &str, operation: &str, context: &RunContext) -> Self {
        Self::owned(&runtime_owner(), name, operation, context)
    }
    pub(crate) fn owned(
        owner: &ModuleRef,
        name: &str,
        operation: &str,
        context: &RunContext,
    ) -> Self {
        Self {
            owner: owner.clone(),
            thread: context.thread_id.clone(),
            run: context.run_id.clone(),
            name: name.into(),
            operation: operation.into(),
        }
    }
    fn matches(
        &self,
        owner: &ModuleRef,
        name: &str,
        operation: &str,
        context: &RunContext,
    ) -> bool {
        owner == &self.owner
            && self.thread == context.thread_id
            && self.run == context.run_id
            && self.name == name
            && self.operation == operation
    }
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HookResult {
    pub payload: Value,
    pub control: HookDecision,
}
impl HookBus {
    /// A live subscription generation owns only future events. Its receipts
    /// must never collide with a previous bus on a stable lifecycle event ID.
    #[cfg(feature = "sqlite")]
    pub(crate) fn in_execution_namespace(
        &self,
        namespace: &str,
        identities: &BTreeMap<String, String>,
    ) -> Result<Self, Error> {
        let registrations = self
            .registrations
            .iter()
            .map(|registration| {
                let stable = identities.get(registration.identity()).ok_or_else(|| {
                    Error::Composition("live Hook dependency identity missing".into())
                })?;
                registration.versioned(crate::system::content_digest(&(
                    "live-hook-v2",
                    namespace,
                    stable,
                ))?)
            })
            .collect::<Result<Vec<_>, _>>()?;
        Self::new(self.catalog.clone(), registrations)
    }
    pub fn new(
        mut catalog: EventCatalog,
        mut registrations: Vec<Arc<HookRegistration>>,
    ) -> Result<Self, Error> {
        let mut identities = std::collections::BTreeSet::new();
        for registration in &registrations {
            if !identities.insert(registration.identity.clone()) {
                return Err(Error::Composition("duplicate hook identity".into()));
            }
            match catalog.get(&registration.declaration.name) {
                Some(existing) if existing != &registration.declaration => {
                    return Err(Error::Composition(
                        "event declaration version conflicts".into(),
                    ));
                }
                None => catalog.declare(registration.declaration.clone())?,
                _ => {}
            }
        }
        registrations.sort_by_key(|registration| registration.rule.priority);
        let manifest: Vec<_> = registrations
            .iter()
            .map(|r| (&r.identity, &r.declaration, &r.rule))
            .collect();
        let mut identity = serde_json::to_string(&(1u32, catalog.declarations(), manifest))
            .map_err(|e| Error::Composition(e.to_string()))?;
        let controllers = registrations
            .iter()
            .filter_map(|r| {
                r.handler
                    .recovery_identity()
                    .map(|id| (r.identity.clone(), id))
            })
            .collect::<Vec<_>>();
        if controllers
            .iter()
            .any(|(_, id)| id.is_empty() || id.len() > 16384)
        {
            return Err(Error::Composition(
                "invalid hook controller identity".into(),
            ));
        }
        // Preserve existing bus identities and legacy journals verbatim when
        // no resumable controller has been installed.
        if !controllers.is_empty() {
            identity = serde_json::to_string(&(identity, "controllers-v1", controllers))
                .map_err(|e| Error::Composition(e.to_string()))?;
        }
        Ok(Self {
            catalog,
            registrations,
            identity,
        })
    }
    pub fn identity(&self) -> &str {
        &self.identity
    }
    pub fn declarations(&self) -> Vec<EventDeclaration> {
        self.catalog.declarations()
    }
    pub fn registrations(&self) -> &[Arc<HookRegistration>] {
        &self.registrations
    }
}
