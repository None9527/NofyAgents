use crate::{Error, RunContext, RunState, ToolCall};
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
mod selection;
pub use selection::OnToolsFactory;

/// Private runtime capability: descendants may add policies, never replace the
/// inherited floor. Identity includes the host implementation's version.
#[derive(Clone, Default)]
pub(crate) struct PolicyFloor(pub Vec<(String, Arc<dyn Policy>)>);

impl PolicyFloor {
    pub fn extend(&mut self, other: &Self) {
        for (identity, policy) in &other.0 {
            if !self.0.iter().any(|(present, _)| present == identity) {
                self.0.push((identity.clone(), policy.clone()));
            }
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum Admission {
    Allow,
    Deny(String),
    Pause(serde_json::Value),
}

/// Evaluated immediately before every actual tool dispatch, including resume.
#[async_trait]
pub trait Policy: Send + Sync {
    async fn admit(
        &self,
        call: &ToolCall,
        state: &RunState,
        context: &RunContext,
    ) -> Result<Admission, Error>;
}

/// Apply the inherited host floor at an adapter-owned execution boundary.
/// The capability itself stays private so bindings cannot replace its policies.
pub async fn admit_required(
    call: &ToolCall,
    state: &RunState,
    context: &RunContext,
) -> Result<Admission, Error> {
    if let Some(floor) = context.capabilities.get::<PolicyFloor>() {
        for (_, policy) in &floor.0 {
            match crate::governance::await_resource(context, policy.admit(call, state, context))
                .await?
            {
                Admission::Allow => {}
                other => return Ok(other),
            }
        }
    }
    Ok(Admission::Allow)
}

pub struct AllowTools;

/// A narrowing policy. It never grants permissions supplied by other policies.
pub struct ToolAllowList(pub std::collections::BTreeSet<String>);
#[async_trait]
impl Policy for ToolAllowList {
    async fn admit(
        &self,
        call: &ToolCall,
        _: &RunState,
        _: &RunContext,
    ) -> Result<Admission, Error> {
        Ok(if self.0.contains(&call.name) {
            Admission::Allow
        } else {
            Admission::Deny(format!("tool outside configured scope: {}", call.name))
        })
    }
}

pub struct ToolAllowListFactory;
impl crate::registry::ModuleFactory for ToolAllowListFactory {
    fn descriptor(&self) -> crate::registry::ModuleDescriptor {
        crate::registry::ModuleDescriptor {
            factory: "policy.tool_scope".into(),
            revision: "1".into(),
            kind: crate::registry::ModuleKind::Policy,
            config_schema: serde_json::json!({"type":"object","additionalProperties":false,"required":["allowed"],"properties":{"allowed":{"type":"array","uniqueItems":true,"items":{"type":"string","minLength":1}}}}),
            input_schema: None,
            output_schema: None,
            required_capabilities: Default::default(),
            dependencies: Default::default(),
        }
    }
    fn build(
        &self,
        config: &serde_json::Value,
        _: &std::collections::BTreeMap<String, crate::registry::ModuleInstance>,
    ) -> Result<crate::registry::ModuleInstance, Error> {
        #[derive(Deserialize)]
        #[serde(deny_unknown_fields)]
        struct Config {
            allowed: Vec<String>,
        }
        let config: Config = serde_json::from_value(config.clone())
            .map_err(|e| Error::Composition(format!("policy.tool_scope: {e}")))?;
        let mut allowed = std::collections::BTreeSet::new();
        for name in config.allowed {
            nofy_tool_protocol::ToolId::new(&name)
                .map_err(|e| Error::Composition(e.to_string()))?;
            if !allowed.insert(name) {
                return Err(Error::Composition(
                    "duplicate tool in configured scope".into(),
                ));
            }
        }
        Ok(crate::registry::ModuleInstance::Policy(Arc::new(
            ToolAllowList(allowed),
        )))
    }
}

#[async_trait]
impl Policy for AllowTools {
    async fn admit(
        &self,
        _call: &ToolCall,
        _state: &RunState,
        _context: &RunContext,
    ) -> Result<Admission, Error> {
        Ok(Admission::Allow)
    }
}
