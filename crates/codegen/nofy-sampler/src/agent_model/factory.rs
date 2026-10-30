//! Pure model configuration over explicitly installed provider connections.
use super::*;
use nofy_agent_runtime::registry::{ModuleDescriptor, ModuleFactory, ModuleInstance, ModuleKind};
use serde::Deserialize;
use sha2::{Digest, Sha256};
use std::{
    collections::{BTreeMap, BTreeSet},
    sync::Arc,
};

pub struct SamplerConnection {
    config: SamplerConfig,
    models: BTreeSet<String>,
    revision: String,
    limits: BTreeMap<String, ProviderRequestLimits>,
    auth_recovery: Option<Arc<SamplerAuthRecovery>>,
}
impl SamplerConnection {
    /// Host-only installation. Secrets stay in the native connection handle;
    /// client documents can only reference this connection and admitted models.
    pub fn new(
        config: SamplerConfig,
        models: BTreeSet<String>,
        revision: &str,
    ) -> Result<Self, Error> {
        if revision.trim().is_empty()
            || models.is_empty()
            || models.iter().any(|model| model.trim().is_empty())
        {
            return Err(Error::Composition(
                "model connection requires revision and admitted model names".into(),
            ));
        }
        Ok(Self {
            config,
            models,
            revision: revision.into(),
            limits: Default::default(),
            auth_recovery: None,
        })
    }
    pub fn with_auth_recovery(mut self, recovery: Arc<SamplerAuthRecovery>) -> Result<Self, Error> {
        recovery.validate_config(&self.config)?;
        self.auth_recovery = Some(recovery);
        Ok(self)
    }
    pub fn with_request_limits(
        mut self,
        limits: BTreeMap<String, ProviderRequestLimits>,
    ) -> Result<Self, Error> {
        if limits.iter().any(|(model, limit)| {
            !self.models.contains(model)
                || limit.max_input_tokens == 0
                || limit.max_output_tokens == 0
        }) {
            return Err(Error::Composition(
                "request bounds require admitted models and positive endpoint limits".into(),
            ));
        }
        self.limits = limits;
        Ok(self)
    }
}

pub struct SamplerModelFactory {
    connections: BTreeMap<String, SamplerConnection>,
    revision: String,
}
impl SamplerModelFactory {
    pub fn new(
        revision: &str,
        connections: BTreeMap<String, SamplerConnection>,
    ) -> Result<Self, Error> {
        if revision.trim().is_empty() {
            return Err(Error::Composition("model factory revision required".into()));
        }
        // Captures routing/backend and admitted names; excludes credentials.
        let manifest: Vec<_> = connections
            .iter()
            .map(|(id, c)| {
                let mut config = c.config.clone();
                config.api_key = None;
                config.model.clear();
                (
                    id,
                    &c.revision,
                    &c.models,
                    &c.limits,
                    c.auth_recovery.as_ref().map(|recovery| recovery.identity()),
                    config,
                )
            })
            .collect();
        let digest = Sha256::digest(
            serde_json::to_vec(&manifest).map_err(|e| Error::Composition(e.to_string()))?,
        );
        let revision = format!("{revision}:{digest:x}");
        Ok(Self {
            connections,
            revision,
        })
    }
}
impl ModuleFactory for SamplerModelFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: "model.sampler".into(),
            revision: self.revision.clone(),
            kind: ModuleKind::Model,
            config_schema: json!({"type":"object","additionalProperties":false,"required":["connection","model"],"properties":{
                "connection":{"type":"string","enum":self.connections.keys().collect::<Vec<_>>()},"model":{"type":"string","minLength":1}
            }}),
            input_schema: None,
            output_schema: None,
            dependencies: Default::default(),
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
            connection: String,
            model: String,
        }
        let config: Config = serde_json::from_value(config.clone())
            .map_err(|e| Error::Composition(format!("model.sampler: {e}")))?;
        let connection = self
            .connections
            .get(&config.connection)
            .ok_or_else(|| Error::Composition("model connection not admitted".into()))?;
        if !connection.models.contains(&config.model) {
            return Err(Error::Composition(
                "model name not admitted by provider connection".into(),
            ));
        }
        let mut native = connection.config.clone();
        native.model = config.model.clone();
        let mut model = SamplerModel::new(native);
        model.pinned = true;
        if let Some(recovery) = &connection.auth_recovery {
            model = model.with_auth_recovery(recovery.clone())?;
        }
        if let Some(limits) = connection.limits.get(&config.model) {
            model = model.with_request_limits(limits.clone())?;
        }
        Ok(ModuleInstance::Model(Arc::new(model)))
    }
}
