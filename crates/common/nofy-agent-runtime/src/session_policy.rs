//! Pure, versioned session decisions. Identity, dispatch and persistence remain
//! owned by the supervisor; implementations can only return validated advice.
mod rules;
use crate::{Error, registry::*};
pub use rules::{RulesConfig, RulesFactory};
use serde::{Deserialize, Serialize};
use std::{collections::BTreeMap, sync::Arc};
use tokio_util::sync::CancellationToken;

pub type Labels = BTreeMap<String, String>;
pub fn input_schema() -> serde_json::Value {
    serde_json::from_str(include_str!("session_policy/input.schema.json"))
        .expect("built-in policy input Schema")
}
pub fn proposal_schema() -> serde_json::Value {
    serde_json::from_str(include_str!("session_policy/proposal.schema.json"))
        .expect("built-in policy result Schema")
}
pub fn diagnostic(error: impl std::fmt::Display) -> String {
    error.to_string().chars().take(4000).collect()
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Summary {
    pub session_id: String,
    pub session_revision: String,
    pub policy_revision: String,
    pub display_name: Option<String>,
    pub labels: Labels,
    pub lifecycle: String,
    pub archived: bool,
    pub busy: bool,
    pub has_queued_input: bool,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Phase {
    Create,
    AdmitTurn,
    Route,
    Retention,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Request {
    pub session_id: Option<String>,
    pub request_digest: String,
    pub labels: Labels,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Input {
    pub protocol: String,
    pub phase: Phase,
    pub now_ms: String,
    pub idle_since_ms: Option<String>,
    pub session: Option<Summary>,
    pub request: Request,
    pub candidates: Vec<Summary>,
    pub parameters_json: String,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Decision {
    Allow,
    Deny,
    Ambiguous,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Proposal {
    pub decision: Decision,
    pub reason: String,
    pub session_id: Option<String>,
    pub display_name: Option<String>,
    pub archive: bool,
}
impl Proposal {
    pub fn allow(input: &Input) -> Self {
        Self {
            decision: Decision::Allow,
            reason: "explicit session admission".into(),
            session_id: input.request.session_id.clone(),
            display_name: None,
            archive: false,
        }
    }
    pub fn validate(&self, input: &Input) -> Result<(), Error> {
        if input.protocol != "nofy.session-policy/v1"
            || self.reason.trim().is_empty()
            || self.reason.len() > 16384
            || self
                .display_name
                .as_ref()
                .is_some_and(|s| s.len() > 4096 || s.chars().any(char::is_control))
            || (self.archive && input.phase != Phase::Retention)
            || (self.decision == Decision::Ambiguous && input.phase != Phase::Route)
            || (self.display_name.is_some() && input.phase != Phase::Create)
        {
            return Err(invalid("invalid session policy proposal"));
        }
        if input.phase == Phase::Route {
            if self
                .session_id
                .as_ref()
                .is_some_and(|id| !input.candidates.iter().any(|s| &s.session_id == id))
            {
                return Err(invalid("policy selected an unknown session"));
            }
        } else if self.session_id != input.request.session_id {
            return Err(invalid("policy changed the requested session identity"));
        }
        Ok(())
    }
}
pub fn invalid(message: impl Into<String>) -> Error {
    Error::Composition(format!("policy_invalid: {}", message.into()))
}

#[async_trait::async_trait]
pub trait SessionPolicy: Send + Sync {
    async fn evaluate(&self, input: Input, cancel: CancellationToken) -> Result<Proposal, Error>;
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Identity {
    pub release: String,
    pub module: ModuleRef,
    pub closure_digest: String,
    pub factory_revision: String,
}

/// Frozen executable closure, independent from mutable registry definitions.
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Frozen {
    pub identity: Identity,
    pub modules: Vec<ResolvedModule>,
}
impl Frozen {
    pub fn from_snapshot(
        snapshot: &crate::compile::CompilationSnapshot,
        release: &str,
    ) -> Result<Option<Self>, Error> {
        let Some(reference) = &snapshot.agent.session_policy else {
            return Ok(None);
        };
        Self::select(&snapshot.modules, reference, release).map(Some)
    }
    pub fn select(
        modules: &[ResolvedModule],
        reference: &ModuleRef,
        release: &str,
    ) -> Result<Self, Error> {
        let mut pending = vec![reference.clone()];
        let mut closure = BTreeMap::new();
        while let Some(r) = pending.pop() {
            if closure.contains_key(&r) {
                continue;
            }
            let m = modules
                .iter()
                .find(|m| m.definition.reference == r)
                .ok_or_else(|| invalid("session policy dependency missing"))?;
            pending.extend(m.definition.dependencies.values().cloned());
            closure.insert(r, m.clone());
        }
        let root = closure
            .get(reference)
            .ok_or_else(|| invalid("policy root missing"))?;
        if root.factory.kind != ModuleKind::SessionPolicy {
            return Err(invalid("module is not a SessionPolicy"));
        }
        let factory_revision = root.factory.revision.clone();
        let modules: Vec<_> = closure.into_values().collect();
        Ok(Self {
            identity: Identity {
                release: release.into(),
                module: reference.clone(),
                closure_digest: crate::system::content_digest(&modules)?,
                factory_revision,
            },
            modules,
        })
    }
    pub fn restore(&self, host: &ModuleRegistry) -> Result<Arc<dyn SessionPolicy>, Error> {
        if crate::system::content_digest(&self.modules)? != self.identity.closure_digest {
            return Err(invalid("frozen policy closure changed"));
        }
        let mut registry = host.without_definitions();
        let descriptors = host.descriptors();
        for m in &self.modules {
            let actual = descriptors
                .iter()
                .find(|d| d.factory == m.factory.factory)
                .ok_or_else(|| invalid("session policy factory unavailable"))?;
            if serde_json::to_value(actual).ok() != serde_json::to_value(&m.factory).ok() {
                return Err(invalid("session policy factory identity changed"));
            }
            registry.define(m.definition.clone())?;
        }
        let root = self
            .modules
            .iter()
            .find(|m| m.definition.reference == self.identity.module)
            .ok_or_else(|| invalid("policy root missing"))?;
        if root.factory.revision != self.identity.factory_revision {
            return Err(invalid("policy revision changed"));
        }
        let resolved =
            registry.resolve_typed(&[(self.identity.module.clone(), ModuleKind::SessionPolicy)])?;
        match resolved.instances.get(&self.identity.module) {
            Some(ModuleInstance::SessionPolicy(policy)) => Ok(policy.clone()),
            _ => Err(invalid("policy module kind changed")),
        }
    }
}

pub fn agent_snapshot(
    snapshot: &crate::program::RunSnapshot,
) -> Option<&crate::compile::CompilationSnapshot> {
    use crate::program::{ProgramSnapshot, RunSnapshot};
    match snapshot {
        RunSnapshot::Agent(s) => Some(s),
        RunSnapshot::Program(s) => match &s.program {
            ProgramSnapshot::Agent { snapshot } => Some(snapshot),
            _ => None,
        },
    }
}
