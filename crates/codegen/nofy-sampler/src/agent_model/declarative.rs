//! Declarative connection resources. Factory code is stable as connections
//! are added; each selected connection and credential authority has its own ID.
mod model;
mod secrets;
use super::*;
use nofy_agent_runtime::registry::*;
pub use secrets::{CredentialProvider, EnvironmentCredentials};
use serde::Deserialize;
use std::{
    collections::{BTreeMap, BTreeSet},
    sync::Arc,
};

pub struct SamplerResourceFactory {
    credentials: Arc<dyn CredentialProvider>,
}
pub struct ConnectedModelFactory;
impl SamplerResourceFactory {
    pub fn new(credentials: Arc<dyn CredentialProvider>) -> Result<Self, Error> {
        if credentials.identity().trim().is_empty() || credentials.identity().len() > 4096 {
            return Err(Error::Composition(
                "credential authority identity is invalid".into(),
            ));
        }
        Ok(Self { credentials })
    }
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Config {
    connection: Value,
    models: BTreeSet<String>,
    #[serde(default)]
    credential_ref: Option<String>,
    #[serde(default)]
    header_refs: BTreeMap<String, String>,
    #[serde(default)]
    request_limits: BTreeMap<String, ProviderRequestLimits>,
}
struct Connection {
    config: SamplerConfig,
    models: BTreeSet<String>,
    credential_ref: Option<String>,
    header_refs: BTreeMap<String, String>,
    limits: BTreeMap<String, ProviderRequestLimits>,
    credentials: Arc<dyn CredentialProvider>,
}
fn connection_schema() -> Value {
    let value =
        serde_json::to_value(SamplerConfig::default()).expect("native sampler defaults serialize");
    let properties = value
        .as_object()
        .expect("native sampler object")
        .keys()
        .filter(|k| !matches!(k.as_str(), "api_key" | "model" | "env_http_headers"))
        .map(|k| (k.clone(), Value::Bool(true)))
        .chain(std::iter::once((
            "mtls_cert_dir".into(),
            json!({"type":["string","null"]}),
        )))
        .collect::<serde_json::Map<_, _>>();
    json!({"type":"object","additionalProperties":false,"required":["base_url","api_backend"],"properties":properties})
}
fn descriptor(
    factory: &str,
    kind: ModuleKind,
    schema: Value,
    dependencies: BTreeMap<String, ModuleKind>,
) -> ModuleDescriptor {
    ModuleDescriptor {
        factory: factory.into(),
        revision: "1".into(),
        kind,
        config_schema: schema,
        input_schema: None,
        output_schema: None,
        required_capabilities: Default::default(),
        dependencies,
    }
}
impl ModuleFactory for SamplerResourceFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        descriptor(
            "resource.sampler",
            ModuleKind::Resource,
            json!({"type":"object","additionalProperties":false,"required":["connection","models"],"properties":{
                "connection":connection_schema(),"models":{"type":"array","minItems":1,"maxItems":1024,"uniqueItems":true,"items":{"type":"string","minLength":1,"maxLength":256}},
                "credential_ref":{"type":["string","null"],"minLength":1,"maxLength":256},
                "header_refs":{"type":"object","maxProperties":128,"additionalProperties":{"type":"string","minLength":1,"maxLength":256}},
                "request_limits":{"type":"object","additionalProperties":{"type":"object","additionalProperties":false,"required":["max_input_tokens","max_output_tokens"],"properties":{"max_input_tokens":{"type":"integer","minimum":1},"max_output_tokens":{"type":"integer","minimum":1,"maximum":u32::MAX}}}}
            }}),
            Default::default(),
        )
    }
    fn build(
        &self,
        value: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        nofy_agent_runtime::settings::validate_json_value(&self.descriptor().config_schema, value)?;
        let parsed: Config = serde_json::from_value(value.clone())
            .map_err(|e| Error::Composition(format!("resource.sampler: {e}")))?;
        if parsed.models.iter().any(|model| model.trim().is_empty())
            || parsed
                .credential_ref
                .as_ref()
                .is_some_and(|r| r.trim().is_empty())
        {
            return Err(Error::Composition(
                "model names and credential references must not be blank".into(),
            ));
        }
        let mut native = serde_json::to_value(SamplerConfig::default())
            .map_err(|e| Error::Composition(e.to_string()))?;
        for (key, value) in parsed.connection.as_object().expect("schema object") {
            native[key] = value.clone();
        }
        let config: SamplerConfig = serde_json::from_value(native)
            .map_err(|e| Error::Composition(format!("resource.sampler connection: {e}")))?;
        let url = reqwest::Url::parse(&config.base_url)
            .map_err(|e| Error::Composition(format!("invalid provider URL: {e}")))?;
        if !matches!(url.scheme(), "http" | "https")
            || url.host_str().is_none()
            || !url.username().is_empty()
            || url.password().is_some()
            || url.fragment().is_some()
        {
            return Err(Error::Composition(
                "provider requires an HTTP(S) URL without inline credentials or fragment".into(),
            ));
        }
        let mut headers = BTreeSet::new();
        for (name, reference) in &parsed.header_refs {
            reqwest::header::HeaderName::from_bytes(name.as_bytes())
                .map_err(|_| Error::Composition("invalid credential header name".into()))?;
            if !headers.insert(name.to_ascii_lowercase())
                || config
                    .extra_headers
                    .keys()
                    .any(|key| key.eq_ignore_ascii_case(name))
            {
                return Err(Error::Composition(
                    "credential headers conflict with another header".into(),
                ));
            }
            if reference.trim().is_empty() {
                return Err(Error::Composition("credential reference is empty".into()));
            }
        }
        if config.extra_headers.keys().any(|name| {
            matches!(
                name.to_ascii_lowercase().as_str(),
                "authorization"
                    | "proxy-authorization"
                    | "x-api-key"
                    | "api-key"
                    | "x-auth-token"
                    | "x-nofy-token-auth"
            )
        }) {
            return Err(Error::Composition(
                "authentication headers require credential/header references".into(),
            ));
        }
        if parsed.request_limits.iter().any(|(model, limit)| {
            !parsed.models.contains(model)
                || limit.max_input_tokens == 0
                || limit.max_output_tokens == 0
        }) {
            return Err(Error::Composition(
                "request limits require an admitted model and positive bounds".into(),
            ));
        }
        let identity = serde_json::to_string(&(
            "sampler-resource-v1",
            nofy_agent_runtime::system::content_digest(value)?,
            self.credentials.identity(),
        ))
        .map_err(|e| Error::Composition(e.to_string()))?;
        Ok(ModuleInstance::Resource(Arc::new(ResourceHandle::new(
            identity,
            Arc::new(Connection {
                config,
                models: parsed.models,
                credential_ref: parsed.credential_ref,
                header_refs: parsed.header_refs,
                limits: parsed.request_limits,
                credentials: self.credentials.clone(),
            }),
        )?)))
    }
}
impl ModuleFactory for ConnectedModelFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        descriptor(
            "model.connected",
            ModuleKind::Model,
            json!({"type":"object","additionalProperties":false,"required":["model"],"properties":{"model":{"type":"string","minLength":1,"maxLength":256}}}),
            BTreeMap::from([("connection".into(), ModuleKind::Resource)]),
        )
    }
    fn build(
        &self,
        value: &Value,
        dependencies: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        nofy_agent_runtime::settings::validate_json_value(&self.descriptor().config_schema, value)?;
        let Some(ModuleInstance::Resource(resource)) = dependencies.get("connection") else {
            return Err(Error::Composition(
                "model.connected requires its connection resource".into(),
            ));
        };
        let connection = resource.get::<Connection>().ok_or_else(|| {
            Error::Composition("model connection resource has another type".into())
        })?;
        let model = value["model"].as_str().expect("validated model");
        if !connection.models.contains(model) {
            return Err(Error::Composition(
                "model is not admitted by its connection resource".into(),
            ));
        }
        Ok(ModuleInstance::Model(Arc::new(model::ConnectedModel::new(
            connection, model,
        )?)))
    }
}
