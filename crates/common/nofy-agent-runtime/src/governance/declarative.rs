//! Logical resource identity and physical storage authority are separate. The
//! original supervised runtime still replaces this store with its root fence.
use super::*;
use crate::registry::*;
use serde_json::json;
use std::{collections::BTreeMap, sync::Arc};

pub struct BudgetResourceFactory {
    store: Arc<dyn BudgetStore>,
    authority: String,
    ceilings: BudgetLimits,
    max_attempts: u32,
    revision: String,
}
impl BudgetResourceFactory {
    pub fn new(
        store: Arc<dyn BudgetStore>,
        authority: &str,
        ceilings: BudgetLimits,
        max_attempts: u32,
    ) -> Result<Self, Error> {
        let base = InstalledBudget::install_named(
            store.clone(),
            ceilings.clone(),
            authority,
            "budget-resource-v1",
            max_attempts,
        )?;
        Ok(Self {
            store,
            authority: authority.into(),
            ceilings,
            max_attempts,
            revision: format!("1:{}", base.identity),
        })
    }
}
impl ModuleFactory for BudgetResourceFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: "resource.budget".into(),
            revision: self.revision.clone(),
            kind: ModuleKind::Resource,
            config_schema: json!({"type":"object","additionalProperties":false}),
            input_schema: None,
            output_schema: None,
            dependencies: Default::default(),
            required_capabilities: Default::default(),
        }
    }
    fn build(
        &self,
        _: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        Err(Error::Composition(
            "resource.budget requires module build context".into(),
        ))
    }
    fn build_with_context(
        &self,
        _: &Value,
        _: &BTreeMap<String, ModuleInstance>,
        context: &ModuleBuildContext<'_>,
    ) -> Result<ModuleInstance, Error> {
        let name =
            crate::system::content_digest(&(&self.authority, &context.definition().reference))?;
        let resource = Arc::new(InstalledBudget::install_named(
            self.store.clone(),
            self.ceilings.clone(),
            &name,
            "budget-resource-v1",
            self.max_attempts,
        )?);
        Ok(ModuleInstance::Resource(Arc::new(ResourceHandle::new(
            format!("budget-resource-v1:{}", resource.identity),
            resource,
        )?)))
    }
}
pub struct ConnectedBudgetFactory;
impl ModuleFactory for ConnectedBudgetFactory {
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
            factory: "governance.budget_connected".into(),
            revision: "1".into(),
            kind: ModuleKind::Governance,
            config_schema: json!({"type":"object","additionalProperties":false,"properties":{
                "limits":{"type":"object","additionalProperties":false,"properties":fields},
                "retry":{"type":"object","additionalProperties":false,"properties":{"max_attempts":{"type":"integer","minimum":1,"maximum":5},"base_delay_ms":{"type":"integer","minimum":0,"maximum":60000},"max_delay_ms":{"type":"integer","minimum":0,"maximum":60000}}}
            }}),
            input_schema: None,
            output_schema: None,
            required_capabilities: Default::default(),
            dependencies: BTreeMap::from([("budget".into(), ModuleKind::Resource)]),
        }
    }
    fn build(
        &self,
        config: &Value,
        dependencies: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        #[derive(Deserialize)]
        #[serde(deny_unknown_fields)]
        struct Config {
            #[serde(default)]
            limits: BudgetLimits,
            #[serde(default)]
            retry: ModelRetryPolicy,
        }
        let config: Config = serde_json::from_value(config.clone())
            .map_err(|e| Error::Composition(format!("governance.budget_connected: {e}")))?;
        let Some(ModuleInstance::Resource(resource)) = dependencies.get("budget") else {
            return Err(Error::Composition(
                "connected budget requires a budget resource".into(),
            ));
        };
        let installed = resource.get::<InstalledBudget>().ok_or_else(|| {
            Error::Composition("connected budget dependency is not an installed budget".into())
        })?;
        Ok(ModuleInstance::Governance(Arc::new(
            GovernanceProfile::new(installed, config.limits, config.retry)?,
        )))
    }
}
