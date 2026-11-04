//! Declarative connections over the original engine. Factories perform no IO;
//! the host owns backend opening and the lifetime of actual work.
use super::*;
use nofy_agent_runtime::{ToolCatalog, ToolEntry, memory::ContextSource, registry::*};
use nofy_tool_runtime::{ToolCallContext, ToolDispatch, ToolStream, TypedToolOutput};
use serde_json::{Value, json};
use std::{
    collections::BTreeSet,
    future::Future,
    sync::atomic::{AtomicU64, Ordering},
};
use tokio_util::sync::CancellationToken;

pub const PROTOCOL: &str = "nofy.memory-resource/v1";
const SLOTS: usize = 4;
mod capture;
mod semantic;
pub use capture::ConnectedCaptureFactory;
pub use semantic::ConnectedSemanticFactory;

#[async_trait::async_trait]
pub trait MemoryProvider: Send + Sync {
    /// Stable semantics/authority, not a local path or the whole connection list.
    fn identity(&self) -> &str;
    fn schema(&self) -> Value;
    /// Pure validation and a portable connection identity.
    fn validate(&self, backend: &Value) -> Result<String, Error>;
    /// An owned admission guard for each actual operation, including cached
    /// installations. The detached worker retains it through canonical IO.
    /// Existing SDK providers keep their original behavior by default.
    async fn acquire(
        &self,
        _backend: &Value,
        _context: &RunContext,
    ) -> Result<Option<Box<dyn Send + Sync>>, Error> {
        Ok(None)
    }
    /// Explicit storage relocation epoch. The caller holds its admission lease
    /// while observing this value and opening/using the corresponding service.
    /// Providers without relocatable storage retain their original cache.
    async fn storage_generation(
        &self,
        _backend: &Value,
        _context: &RunContext,
    ) -> Result<Option<String>, Error> {
        Ok(None)
    }
    async fn open(
        &self,
        backend: &Value,
        context: &RunContext,
    ) -> Result<Arc<NofyMemoryService>, Error>;
}

#[derive(Clone)]
pub struct MemoryResourceFactory {
    factory: String,
    provider: Arc<dyn MemoryProvider>,
    work: Arc<Work>,
    capture: bool,
}
struct Work {
    slots: Arc<tokio::sync::Semaphore>,
    stop: CancellationToken,
    started: AtomicU64,
    opened: AtomicU64,
}
#[derive(Serialize)]
pub struct MemoryStatus {
    pub protocol: &'static str,
    pub slots: usize,
    pub in_flight: usize,
    pub started: u64,
    pub opened: u64,
    pub stopping: bool,
}
impl MemoryResourceFactory {
    pub fn new(provider: Arc<dyn MemoryProvider>) -> Result<Self, Error> {
        if provider.identity().trim().is_empty() || provider.identity().len() > 4096 {
            return Err(composition("invalid memory provider identity"));
        }
        Ok(Self {
            factory: "resource.memory".into(),
            capture: false,
            provider,
            work: Arc::new(Work {
                slots: Arc::new(tokio::sync::Semaphore::new(SLOTS)),
                stop: CancellationToken::new(),
                started: AtomicU64::new(0),
                opened: AtomicU64::new(0),
            }),
        })
    }
    /// A separately versioned descriptor can share the same real-work quota
    /// and shutdown boundary without changing previously published factories.
    pub fn with_provider(
        &self,
        factory: &str,
        provider: Arc<dyn MemoryProvider>,
    ) -> Result<Self, Error> {
        if factory.trim().is_empty()
            || factory.len() > 256
            || provider.identity().trim().is_empty()
            || provider.identity().len() > 4096
        {
            return Err(composition("invalid derived memory factory"));
        }
        Ok(Self {
            factory: factory.into(),
            capture: self.capture,
            provider,
            work: self.work.clone(),
        })
    }
    /// Explicit learning resources share admission and shutdown with ordinary
    /// memory operations, while retaining a separately versioned descriptor.
    pub fn with_capture_provider(
        &self,
        factory: &str,
        provider: Arc<dyn MemoryProvider>,
    ) -> Result<Self, Error> {
        let mut factory = self.with_provider(factory, provider)?;
        factory.capture = true;
        Ok(factory)
    }
    pub fn shutdown(&self) {
        self.work.stop.cancel();
    }
    pub async fn drain(&self) -> Result<(), Error> {
        let _idle = self
            .work
            .slots
            .clone()
            .acquire_many_owned(SLOTS as u32)
            .await
            .map_err(|_| composition("memory work admission closed"))?;
        Ok(())
    }
    pub fn status(&self) -> MemoryStatus {
        MemoryStatus {
            protocol: PROTOCOL,
            slots: SLOTS,
            in_flight: SLOTS - self.work.slots.available_permits(),
            started: self.work.started.load(Ordering::Relaxed),
            opened: self.work.opened.load(Ordering::Relaxed),
            stopping: self.work.stop.is_cancelled(),
        }
    }
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct ResourceConfig {
    backend: Value,
    grants: MemoryGrants,
    #[serde(default = "excluded")]
    excluded_categories: BTreeSet<crate::config::MemorySensitiveCategory>,
}
fn excluded() -> BTreeSet<crate::config::MemorySensitiveCategory> {
    use crate::config::MemorySensitiveCategory::*;
    BTreeSet::from([Credentials, Financial, Health, Identity, Location])
}
struct Connection {
    provider: Arc<dyn MemoryProvider>,
    work: Arc<Work>,
    config: ResourceConfig,
    identity: String,
    installed: tokio::sync::Mutex<Option<(Option<String>, Arc<InstalledMemory>)>>,
}
impl Connection {
    async fn module(
        &self,
        config: MemoryModuleConfig,
        context: &RunContext,
    ) -> Result<MemoryModule, Error> {
        let generation = self
            .provider
            .storage_generation(&self.config.backend, context)
            .await?;
        let mut cached = self.installed.lock().await;
        if cached
            .as_ref()
            .is_none_or(|(current, _)| current != &generation)
        {
            let service = self.provider.open(&self.config.backend, context).await?;
            let resource = InstalledMemory::install_logical(
                service,
                &self.identity,
                PROTOCOL,
                self.config.grants.clone(),
                self.config.excluded_categories.clone(),
            )?;
            self.work.opened.fetch_add(1, Ordering::Relaxed);
            *cached = Some((generation, Arc::new(resource)));
        }
        let installed = cached.as_ref().expect("installed resource").1.clone();
        drop(cached);
        MemoryModule::bind(installed, config)
    }
    async fn run<T, F, Fut>(
        self: &Arc<Self>,
        config: MemoryModuleConfig,
        context: &RunContext,
        operation: F,
    ) -> Result<T, Error>
    where
        T: Send + 'static,
        F: FnOnce(MemoryModule) -> Fut + Send + 'static,
        Fut: Future<Output = Result<T, Error>> + Send + 'static,
    {
        let permit = tokio::select! {biased;
            _=self.work.stop.cancelled()=>return Err(composition("memory work is shutting down")),
            _=context.cancel.cancelled()=>return Err(Error::Cancelled),
            permit=self.work.slots.clone().acquire_owned()=>permit.map_err(|_|composition("memory work admission closed"))?,
        };
        let connection = self.clone();
        let context = context.clone();
        // A dropped caller does not release admission while canonical IO runs.
        tokio::spawn(async move {
            let _permit = permit;
            if connection.work.stop.is_cancelled() {
                return Err(composition("memory work is shutting down"));
            }
            if context.cancel.is_cancelled() {
                return Err(Error::Cancelled);
            }
            connection.work.started.fetch_add(1, Ordering::Relaxed);
            let _admission = connection
                .provider
                .acquire(&connection.config.backend, &context)
                .await?;
            let module = connection.module(config, &context).await?;
            operation(module).await
        })
        .await
        .map_err(|_| composition("memory work failed"))?
    }
}
impl ModuleFactory for MemoryResourceFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: self.factory.clone(),
            revision: format!("1:{}", self.provider.identity()),
            kind: ModuleKind::Resource,
            config_schema: json!({"type":"object","additionalProperties":false,"required":["backend","grants"],"properties":{
                "backend":self.provider.schema(),
                "grants":{"type":"object","additionalProperties":false,"properties":{
                    "read":{"$ref":"#/$defs/areas"},"write":{"$ref":"#/$defs/areas"},"child_read":{"$ref":"#/$defs/areas"},"child_write":{"$ref":"#/$defs/areas"},
                    "capture":if self.capture {json!({"type":"boolean"})} else {json!({"const":false})},"consolidate":{"type":"boolean"}}},
                "excluded_categories":{"type":"array","maxItems":5,"uniqueItems":true,"items":{"enum":["credentials","financial","health","identity","location"]}}
            },"$defs":{"areas":{"type":"array","maxItems":2,"uniqueItems":true,"items":{"enum":["personal","project"]}}}}),
            input_schema: None,
            output_schema: None,
            dependencies: BTreeMap::new(),
            required_capabilities: Default::default(),
        }
    }
    fn build(
        &self,
        value: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        nofy_agent_runtime::settings::validate_json_value(&self.descriptor().config_schema, value)?;
        if serde_json::to_vec(value)
            .map_err(|_| composition("invalid memory resource"))?
            .len()
            > 65536
        {
            return Err(composition("memory resource exceeds 64 KiB"));
        }
        let config: ResourceConfig = serde_json::from_value(value.clone())
            .map_err(|_| composition("invalid memory resource"))?;
        let backend_identity = self.provider.validate(&config.backend)?;
        if backend_identity.trim().is_empty()
            || backend_identity.len() > 4096
            || config.grants.capture && !self.capture
        {
            return Err(composition(
                "invalid memory connection or unmanaged capture",
            ));
        }
        validate_module(
            &config.grants,
            &MemoryModuleConfig {
                read: config.grants.read.clone(),
                write: config.grants.write.clone(),
                child_read: config.grants.child_read.clone(),
                child_write: config.grants.child_write.clone(),
                ..Default::default()
            },
        )?;
        let identity = blake3::hash(
            &serde_json::to_vec(&(
                PROTOCOL,
                self.provider.identity(),
                backend_identity,
                &config.grants,
                &config.excluded_categories,
            ))
            .map_err(|_| composition("memory identity encoding failed"))?,
        )
        .to_hex()
        .to_string();
        Ok(ModuleInstance::Resource(Arc::new(ResourceHandle::new(
            identity.clone(),
            Arc::new(Connection {
                provider: self.provider.clone(),
                work: self.work.clone(),
                config,
                identity,
                installed: Default::default(),
            }),
        )?)))
    }
}

pub struct ConnectedMemoryFactory {
    kind: ModuleKind,
}
impl ConnectedMemoryFactory {
    pub fn tools() -> Self {
        Self {
            kind: ModuleKind::ToolPack,
        }
    }
    pub fn context() -> Self {
        Self {
            kind: ModuleKind::ContextSource,
        }
    }
}
impl ModuleFactory for ConnectedMemoryFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        let factory = if self.kind == ModuleKind::ToolPack {
            MemoryFactory::tools(Default::default())
        } else {
            MemoryFactory::context(Default::default())
        };
        let mut descriptor = factory.descriptor();
        descriptor.factory = if self.kind == ModuleKind::ToolPack {
            "tool.memory_connected"
        } else {
            "context.memory_connected"
        }
        .into();
        descriptor.revision = "1".into();
        descriptor.config_schema["properties"]
            .as_object_mut()
            .expect("original memory schema")
            .remove("resource");
        descriptor.config_schema["required"] = json!([]);
        descriptor
            .dependencies
            .insert("connection".into(), ModuleKind::Resource);
        descriptor
    }
    fn build(
        &self,
        value: &Value,
        dependencies: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        nofy_agent_runtime::settings::validate_json_value(&self.descriptor().config_schema, value)?;
        let config: MemoryModuleConfig = serde_json::from_value(value.clone())
            .map_err(|_| composition("invalid connected memory module"))?;
        if config.capture {
            return Err(composition(
                "managed capture requires its durable-turn Hook",
            ));
        }
        let Some(ModuleInstance::Resource(resource)) = dependencies.get("connection") else {
            return Err(composition("memory connection resource required"));
        };
        let resource = resource
            .get::<Connection>()
            .ok_or_else(|| composition("memory resource has another type"))?;
        validate_module(&resource.config.grants, &config)?;
        let connected = Arc::new(Connected { resource, config });
        if self.kind == ModuleKind::ContextSource {
            return Ok(ModuleInstance::ContextSource(connected));
        }
        let mut catalog = ToolCatalog::new();
        catalog.insert(ToolEntry {
            definition: operations::definition(&connected.config),
            dispatch: connected,
        })?;
        Ok(ModuleInstance::ToolPack(catalog))
    }
}
struct Connected {
    resource: Arc<Connection>,
    config: MemoryModuleConfig,
}
#[async_trait::async_trait]
impl ToolDispatch for Connected {
    async fn call(
        &self,
        id: nofy_tool_protocol::ToolId,
        args: Value,
        context: ToolCallContext,
    ) -> ToolStream<TypedToolOutput> {
        let result = async {
            if id.as_str() != self.config.tool_name {
                return Err(composition("memory tool identity mismatch"));
            }
            let run = context
                .get::<RunContext>()
                .ok_or_else(|| composition("memory tool requires a run context"))?;
            self.resource
                .run(self.config.clone(), &run, move |module| async move {
                    Ok(module.call(id, args, context).await)
                })
                .await
        }
        .await;
        match result {
            Ok(stream) => stream,
            Err(error) => nofy_tool_runtime::terminal_only(Err(
                nofy_tool_runtime::ToolError::custom("memory_operation", error.to_string()),
            )),
        }
    }
}
#[async_trait::async_trait]
impl ContextSource for Connected {
    async fn revision(&self, context: &RunContext) -> Result<Option<String>, Error> {
        if areas(&self.config, context, false).is_empty() {
            return Ok(None);
        }
        let run = context.clone();
        self.resource
            .run(self.config.clone(), context, move |module| async move {
                module.revision(&run).await
            })
            .await
    }
    async fn contribute(
        &self,
        state: &nofy_agent_runtime::RunState,
        context: &RunContext,
    ) -> Result<Vec<nofy_agent_runtime::Message>, Error> {
        if areas(&self.config, context, false).is_empty() {
            return Ok(vec![]);
        }
        let run = context.clone();
        let state = state.clone();
        self.resource
            .run(self.config.clone(), context, move |module| async move {
                module.contribute(&state, &run).await
            })
            .await
    }
}
