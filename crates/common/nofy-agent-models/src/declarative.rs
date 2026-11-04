//! One protocol resource, one explicit connection resource, one model binding.
mod schema;
mod source;
use crate::{
    connection::Connection,
    driver::ProgrammedModel,
    execution::{Binding, Executor, Trusted},
    invalid,
};
pub use crate::{
    connection::{Config as ConnectionConfig, EndpointLimits, HeaderCredential, Tls},
    program::{Limits as ProtocolLimits, Protocol},
};
use nofy_agent_runtime::{
    Error, credentials::CredentialProvider, registry::*, system::content_digest,
};
use serde_json::{Value, json};
use std::{collections::BTreeMap, sync::Arc};
use tokio::sync::Semaphore;

fn descriptor(
    factory: &str,
    kind: ModuleKind,
    schema: Value,
    dependencies: BTreeMap<String, ModuleKind>,
) -> ModuleDescriptor {
    ModuleDescriptor {
        factory: factory.into(),
        revision: "artifact-json-protocol-v2".into(),
        kind,
        config_schema: schema,
        input_schema: None,
        output_schema: None,
        required_capabilities: Default::default(),
        dependencies,
    }
}
pub struct ProtocolFactory {
    executor: Arc<dyn Executor>,
}
impl ProtocolFactory {
    pub fn new(executor: Arc<dyn Executor>) -> Self {
        Self { executor }
    }
    /// Explicit SDK opt-in; resident hosts must provide an isolated executor.
    pub fn trusted() -> Self {
        Self::new(Arc::new(Trusted))
    }
}
impl ModuleFactory for ProtocolFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        descriptor(
            "resource.model_protocol",
            ModuleKind::Resource,
            schema::protocol(),
            BTreeMap::new(),
        )
    }
    fn config_dependencies(&self, config: &Value) -> Result<BTreeMap<String, ModuleKind>, Error> {
        let declaration: source::Declaration = serde_json::from_value(config.clone())
            .map_err(|_| invalid("invalid model protocol declaration"))?;
        Ok(declaration.dependencies())
    }
    fn build(
        &self,
        config: &Value,
        dependencies: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        nofy_agent_runtime::settings::validate_json_value(
            &self.descriptor().config_schema,
            config,
        )?;
        let declaration: source::Declaration = serde_json::from_value(config.clone())
            .map_err(|_| invalid("invalid model protocol declaration"))?;
        let program = declaration.resolve(dependencies)?;
        program.validate()?;
        Ok(ModuleInstance::Resource(Arc::new(ResourceHandle::new(
            format!("model-protocol-v1:{}", content_digest(&program)?),
            Arc::new(Binding {
                program: Arc::new(program),
                executor: self.executor.clone(),
            }),
        )?)))
    }
}
pub struct ConnectionFactory {
    credentials: Arc<dyn CredentialProvider>,
}
impl ConnectionFactory {
    pub fn new(credentials: Arc<dyn CredentialProvider>) -> Result<Self, Error> {
        if credentials.identity().trim().is_empty() || credentials.identity().len() > 4096 {
            return Err(invalid("invalid model credential authority"));
        }
        Ok(Self { credentials })
    }
}
impl ModuleFactory for ConnectionFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        descriptor(
            "resource.model_connection",
            ModuleKind::Resource,
            schema::connection(),
            BTreeMap::new(),
        )
    }
    fn build(
        &self,
        config: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        nofy_agent_runtime::settings::validate_json_value(
            &self.descriptor().config_schema,
            config,
        )?;
        let config: ConnectionConfig = serde_json::from_value(config.clone())
            .map_err(|_| invalid("invalid model connection declaration"))?;
        let connection = Connection::new(config, self.credentials.clone())?;
        let identity = content_digest(&(&connection.config, self.credentials.identity()))?;
        Ok(ModuleInstance::Resource(Arc::new(ResourceHandle::new(
            format!("model-connection-v1:{identity}"),
            Arc::new(connection),
        )?)))
    }
}
pub struct ProgrammedModelFactory {
    workers: Arc<Semaphore>,
}
impl Default for ProgrammedModelFactory {
    fn default() -> Self {
        Self {
            workers: Arc::new(Semaphore::new(32)),
        }
    }
}
impl ModuleFactory for ProgrammedModelFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        descriptor(
            "model.programmed",
            ModuleKind::Model,
            json!({"type":"object","additionalProperties":false,"required":["model"],
            "properties":{"model":{"type":"string","minLength":1,"maxLength":256}}}),
            BTreeMap::from([
                ("protocol".into(), ModuleKind::Resource),
                ("connection".into(), ModuleKind::Resource),
            ]),
        )
    }
    fn build(
        &self,
        config: &Value,
        dependencies: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        nofy_agent_runtime::settings::validate_json_value(
            &self.descriptor().config_schema,
            config,
        )?;
        let resource = |name: &str| match dependencies.get(name) {
            Some(ModuleInstance::Resource(resource)) => Ok(resource),
            _ => Err(invalid(format!(
                "model.programmed requires {name} resource"
            ))),
        };
        let program = resource("protocol")?
            .get::<Binding>()
            .ok_or_else(|| invalid("model protocol resource has another type"))?;
        let connection = resource("connection")?
            .get::<Connection>()
            .ok_or_else(|| invalid("model connection resource has another type"))?;
        let model = config["model"]
            .as_str()
            .ok_or_else(|| invalid("model name is missing"))?
            .to_owned();
        if !connection.config.models.contains(&model) {
            return Err(invalid("model is not admitted by its connection"));
        }
        Ok(ModuleInstance::Model(Arc::new(ProgrammedModel {
            program,
            connection,
            model,
            workers: self.workers.clone(),
        })))
    }
}
