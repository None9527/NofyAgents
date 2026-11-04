use super::*;
use crate::registry::*;
use serde_json::json;
use sha2::{Digest, Sha256};
use std::{collections::BTreeMap, sync::Arc};

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(default, deny_unknown_fields)]
pub struct ModelRetryPolicy {
    pub max_attempts: u32,
    pub base_delay_ms: u64,
    pub max_delay_ms: u64,
}
impl Default for ModelRetryPolicy {
    fn default() -> Self {
        Self {
            max_attempts: 1,
            base_delay_ms: 100,
            max_delay_ms: 30_000,
        }
    }
}
pub struct InstalledBudget {
    pub(super) store: Arc<dyn BudgetStore>,
    pub(super) ceilings: BudgetLimits,
    pub(super) identity: String,
    pub(super) max_attempts: u32,
}
impl InstalledBudget {
    /// Trusted host authority names a portable ledger resource. Its physical
    /// store remains intact and is still checked against the root supervisor.
    /// Unlike `install`, this explicit contract does not hash a local DB path.
    pub fn install_named(
        store: Arc<dyn BudgetStore>,
        ceilings: BudgetLimits,
        authority: &str,
        revision: &str,
        max_attempts: u32,
    ) -> Result<Self, Error> {
        if authority.trim().is_empty()
            || authority.len() > 4096
            || revision.trim().is_empty()
            || !(1..=5).contains(&max_attempts)
        {
            return Err(Error::Composition(
                "named budget requires bounded authority, revision and max_attempts 1..=5".into(),
            ));
        }
        let identity = digest(
            &serde_json::to_value((
                "named-budget-v1",
                authority,
                revision,
                &ceilings,
                max_attempts,
                store.is_durable(),
            ))
            .map_err(|e| Error::Composition(e.to_string()))?,
        )?;
        Ok(Self {
            store,
            ceilings,
            identity,
            max_attempts,
        })
    }
    pub fn install(
        store: Arc<dyn BudgetStore>,
        ceilings: BudgetLimits,
        revision: &str,
        max_attempts: u32,
    ) -> Result<Self, Error> {
        if revision.trim().is_empty() || !(1..=5).contains(&max_attempts) {
            return Err(Error::Composition(
                "budget resource requires revision and max_attempts 1..=5".into(),
            ));
        }
        let identity = digest(
            &serde_json::to_value((
                revision,
                &ceilings,
                max_attempts,
                store.is_durable(),
                store.storage_identity(),
            ))
            .map_err(|e| Error::Composition(e.to_string()))?,
        )?;
        Ok(Self {
            store,
            ceilings,
            identity,
            max_attempts,
        })
    }
}
#[derive(Clone)]
pub struct GovernanceProfile {
    pub(super) resource: Arc<InstalledBudget>,
    pub(super) limits: BudgetLimits,
    pub(super) retry: ModelRetryPolicy,
    pub(super) identity: String,
    pub(super) ledger_identity: String,
    pub(super) profile_aliases: std::collections::BTreeSet<String>,
}
impl GovernanceProfile {
    pub fn new(
        resource: Arc<InstalledBudget>,
        limits: BudgetLimits,
        retry: ModelRetryPolicy,
    ) -> Result<Self, Error> {
        if retry.max_attempts == 0
            || retry.max_attempts > resource.max_attempts
            || retry.max_delay_ms > 60_000
            || retry.base_delay_ms > retry.max_delay_ms
        {
            return Err(Error::Composition(
                "model retry policy exceeds the installed ceiling".into(),
            ));
        }
        let requested =
            serde_json::to_value(limits).map_err(|e| Error::Composition(e.to_string()))?;
        let mut effective = serde_json::to_value(&resource.ceilings)
            .map_err(|e| Error::Composition(e.to_string()))?;
        for (key, value) in requested.as_object().expect("limits serialize as object") {
            if value.is_null() {
                continue;
            }
            if effective[key]
                .as_u64()
                .zip(value.as_u64())
                .is_some_and(|(ceiling, value)| value > ceiling)
            {
                return Err(Error::Composition(format!(
                    "budget limit {key} exceeds host ceiling"
                )));
            }
            effective[key] = value.clone();
        }
        let limits: BudgetLimits =
            serde_json::from_value(effective).map_err(|e| Error::Composition(e.to_string()))?;
        let identity = digest(
            &serde_json::to_value((&resource.identity, &limits, &retry))
                .map_err(|e| Error::Composition(e.to_string()))?,
        )?;
        Ok(Self {
            resource,
            limits,
            retry,
            ledger_identity: identity.clone(),
            profile_aliases: [identity.clone()].into(),
            identity,
        })
    }
    pub fn limits(&self) -> &BudgetLimits {
        &self.limits
    }
    pub fn identity(&self) -> &str {
        &self.identity
    }
    #[cfg(feature = "sqlite")]
    pub(crate) fn resource_identity(&self) -> &str {
        &self.resource.identity
    }
    #[cfg(feature = "sqlite")]
    pub(crate) fn storage_identity(&self) -> Option<String> {
        self.resource.store.storage_identity()
    }
    #[cfg(feature = "sqlite")]
    pub(crate) fn with_ledger_binding(&self, binding: &BudgetLedgerBinding) -> Result<Self, Error> {
        if binding.profile_identity != self.identity
            || binding.resource_identity != self.resource.identity
            || !binding.profile_aliases.contains(&binding.profile_identity)
            || !binding.profile_aliases.contains(&binding.ledger_identity)
        {
            return Err(Error::Composition("live budget binding changed".into()));
        }
        let mut profile = self.clone();
        profile.ledger_identity = binding.ledger_identity.clone();
        profile.profile_aliases = binding.profile_aliases.clone();
        Ok(profile)
    }
    pub fn is_durable(&self) -> bool {
        self.resource.store.is_durable()
    }
}
pub(super) fn digest(value: &Value) -> Result<String, Error> {
    Ok(format!(
        "{:x}",
        Sha256::digest(serde_json::to_vec(value).map_err(|e| Error::Composition(e.to_string()))?)
    ))
}
pub struct GovernanceFactory {
    resources: BTreeMap<String, Arc<InstalledBudget>>,
    revision: String,
}
impl GovernanceFactory {
    pub fn new(resources: BTreeMap<String, Arc<InstalledBudget>>) -> Result<Self, Error> {
        let manifest = resources
            .iter()
            .map(|(id, resource)| (id, &resource.identity))
            .collect::<Vec<_>>();
        Ok(Self {
            revision: format!(
                "1:{}",
                digest(
                    &serde_json::to_value(manifest)
                        .map_err(|e| Error::Composition(e.to_string()))?
                )?
            ),
            resources,
        })
    }
}
impl ModuleFactory for GovernanceFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        let mut fields = serde_json::Map::new();
        for name in [
            "max_steps",
            "max_model_calls",
            "max_tool_calls",
            "max_child_calls",
            "max_input_tokens",
            "max_output_tokens",
            "max_total_tokens",
            "max_duration_ms",
        ] {
            fields.insert(
                name.into(),
                json!({"type":["integer","null"],"minimum":0,"maximum":u64::MAX}),
            );
        }
        for name in [
            "max_concurrent_operations",
            "max_active_children",
            "max_depth",
        ] {
            fields.insert(
                name.into(),
                json!({"type":["integer","null"],"minimum":0,"maximum":u32::MAX}),
            );
        }
        ModuleDescriptor {
            factory: "governance.budget".into(),
            revision: self.revision.clone(),
            kind: ModuleKind::Governance,
            config_schema: json!({"type":"object","additionalProperties":false,"required":["resource"],"properties":{
                "resource":{"enum":self.resources.keys().collect::<Vec<_>>()},"limits":{"type":"object","additionalProperties":false,"properties":fields},
                "retry":{"type":"object","additionalProperties":false,"properties":{"max_attempts":{"type":"integer","minimum":1,"maximum":5},"base_delay_ms":{"type":"integer","minimum":0,"maximum":60000},"max_delay_ms":{"type":"integer","minimum":0,"maximum":60000}}}
            }}),
            input_schema: None,
            output_schema: None,
            dependencies: BTreeMap::new(),
            required_capabilities: Default::default(),
        }
    }
    fn build(
        &self,
        config: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        #[derive(Deserialize)]
        #[serde(deny_unknown_fields)]
        struct Config {
            resource: String,
            #[serde(default)]
            limits: BudgetLimits,
            #[serde(default)]
            retry: ModelRetryPolicy,
        }
        crate::settings::validate_json_value(&self.descriptor().config_schema, config)?;
        let config: Config = serde_json::from_value(config.clone())
            .map_err(|e| Error::Composition(e.to_string()))?;
        let resource = self
            .resources
            .get(&config.resource)
            .ok_or_else(|| Error::Composition("budget resource is not installed".into()))?;
        Ok(ModuleInstance::Governance(Arc::new(
            GovernanceProfile::new(resource.clone(), config.limits, config.retry)?,
        )))
    }
}
