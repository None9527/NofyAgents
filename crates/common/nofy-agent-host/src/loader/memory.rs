//! Private managed storage for the canonical engine, separate from source locks.
use super::*;
use nofy_agent_runtime::{Error, RunContext};
use nofy_memory::config::{MemoryIndexConfig, MemorySearchConfig};
use nofy_memory::{
    model::ProjectId,
    runtime::declarative::MemoryProvider,
    service::{DurableUndoOptions, NofyMemoryService, NofyMemoryServiceConfig},
};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use std::{collections::BTreeMap, sync::Mutex};
pub mod control;
pub(crate) mod transfer;

type Client = tokio::sync::OnceCell<Arc<NofyMemoryService>>;
#[derive(Clone)]
pub(crate) struct Provider {
    root: PathBuf,
    clients: Arc<Mutex<BTreeMap<String, Arc<Client>>>>,
    control: Arc<control::MemoryControl>,
    learning: bool,
}
impl Provider {
    pub fn new(root: PathBuf, control: Arc<control::MemoryControl>) -> Self {
        Self {
            root,
            clients: Arc::new(Mutex::new(BTreeMap::new())),
            control,
            learning: false,
        }
    }
    pub(crate) fn with_learning(&self) -> Self {
        Self {
            root: self.root.clone(),
            clients: self.clients.clone(),
            control: self.control.clone(),
            learning: true,
        }
    }
    fn format(&self, backend: &Backend) -> Value {
        json!({"protocol":"nofy.memory-store/v1", "undo":"nofy.memory-undo/v1", "lifecycle":control::PROTOCOL,
            "embedding_dimensions":backend.embedding_dimensions,
            "index":{"max_chunk_chars":backend.index.max_chunk_chars,"chunk_overlap_chars":backend.index.chunk_overlap_chars}})
    }
    fn key(&self, backend: &Backend) -> String {
        format!(
            "{}:{}:{}",
            backend.namespace,
            backend.project_id.as_uuid(),
            self.format(backend)
        )
    }
    pub(crate) fn resource_key(&self, backend: &Value) -> std::result::Result<String, Error> {
        Ok(storage::hash(
            self.key(&Backend::parse(backend)?).as_bytes(),
        ))
    }
    pub(crate) fn change(
        &self,
        backend: &Value,
        command: control::MemoryCommand,
    ) -> Result<control::MemoryReceipt> {
        let config = Backend::parse(backend)?;
        let _namespace = self.control.namespace_lease(&config.namespace, false)?;
        if command.open {
            self.resolved(&config.namespace)?;
        }
        let key = self.key(&config);
        self.control
            .change(&storage::hash(key.as_bytes()), command, || {
                let mut clients = self
                    .clients
                    .lock()
                    .map_err(|_| HostError::Unavailable("memory cache lock poisoned".into()))?;
                clients.retain(|cached, _| !cached.starts_with(&format!("{key}:")));
                Ok(())
            })
    }
}
#[derive(Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Backend {
    namespace: String,
    project_id: ProjectId,
    #[serde(default)]
    search: MemorySearchConfig,
    #[serde(default)]
    index: MemoryIndexConfig,
    #[serde(default = "dimensions")]
    embedding_dimensions: usize,
    #[serde(default)]
    undo_limits: Option<DurableUndoOptions>,
}
fn dimensions() -> usize {
    1024
}
fn invalid() -> Error {
    Error::Composition("invalid declared memory backend".into())
}
fn directory(path: &Path) -> Result<PathBuf> {
    // Another connection may have created this same namespace since exists().
    storage::directory(path).or_else(|first| {
        if path.is_dir() {
            storage::directory(path)
        } else {
            Err(first)
        }
    })
}
impl Backend {
    fn parse(value: &Value) -> std::result::Result<Self, Error> {
        nofy_agent_runtime::settings::validate_json_value(&schema(), value)?;
        let backend: Self = serde_json::from_value(value.clone()).map_err(|_| invalid())?;
        backend.project_id.validate().map_err(|_| invalid())?;
        if backend.index.chunk_overlap_chars >= backend.index.max_chunk_chars {
            return Err(invalid());
        }
        backend
            .undo_limits
            .unwrap_or_default()
            .validate()
            .map_err(|_| invalid())?;
        Ok(backend)
    }
}
fn schema() -> Value {
    let unit = json!({"type":"number","minimum":0,"maximum":1});
    let mut schema = json!({"type":"object","additionalProperties":false,"required":["namespace","project_id"],"properties":{
        "namespace":{"type":"string","minLength":1,"maxLength":128,"pattern":"^[A-Za-z0-9_-]+$"},
        "project_id":{"type":"string","minLength":36,"maxLength":36},
        "embedding_dimensions":{"type":"integer","minimum":1,"maximum":4096},
        "index":{"type":"object","additionalProperties":false,"properties":{
            "max_chunk_chars":{"type":"integer","minimum":32,"maximum":65536},"chunk_overlap_chars":{"type":"integer","minimum":0,"maximum":65535}}},
        "search":{"type":"object","additionalProperties":false,"properties":{
            "max_results":{"type":"integer","minimum":1,"maximum":100},"min_score":unit,"vector_weight":unit,"text_weight":unit,
            "temporal_decay":{"type":"object","additionalProperties":false,"properties":{"enabled":{"type":"boolean"},"half_life_days":{"type":"number","exclusiveMinimum":0,"maximum":365000}}},
            "mmr":{"type":"object","additionalProperties":false,"properties":{"enabled":{"type":"boolean"},"lambda":unit}},
            "source_weights":{"type":"object","maxProperties":64,"propertyNames":{"minLength":1,"maxLength":128},"additionalProperties":{"type":"number","minimum":0,"maximum":100}}
        }}
    }});
    schema["properties"]["undo_limits"] = json!({"type":"object","additionalProperties":false,"properties":{
            "max_pending":{"type":"integer","minimum":1,"maximum":65536},
            "max_bytes":{"type":"integer","minimum":4096,"maximum":1073741824}}});
    schema
}
#[async_trait::async_trait]
impl MemoryProvider for Provider {
    fn identity(&self) -> &str {
        if self.learning {
            "nofy.kernel.memory-learning/v1"
        } else {
            "nofy.kernel.memory/v2"
        }
    }
    fn schema(&self) -> Value {
        schema()
    }
    fn validate(&self, backend: &Value) -> std::result::Result<String, Error> {
        Backend::parse(backend)?;
        Ok(format!(
            "declared:{}",
            nofy_agent_runtime::system::content_digest(backend)?
        ))
    }
    async fn acquire(
        &self,
        backend: &Value,
        context: &RunContext,
    ) -> std::result::Result<Option<Box<dyn Send + Sync>>, Error> {
        if context.cancel.is_cancelled() {
            return Err(Error::Cancelled);
        }
        let control = self.control.clone();
        let key = self.resource_key(backend)?;
        let provider = self.clone();
        let namespace = Backend::parse(backend)?.namespace;
        tokio::task::spawn_blocking(move || {
            let namespace_lease = control
                .namespace_lease(&namespace, false)
                .map_err(|e| Error::Tool(e.to_string()))?;
            provider
                .resolved(&namespace)
                .map_err(|e| Error::Tool(e.to_string()))?;
            let lease = control
                .acquire(&key)
                .map_err(|e| Error::Tool(e.to_string()))?;
            Ok(Some(
                Box::new((namespace_lease, lease)) as Box<dyn Send + Sync>
            ))
        })
        .await
        .map_err(|_| Error::Tool("memory admission worker failed".into()))?
    }
    async fn storage_generation(
        &self,
        backend: &Value,
        _: &RunContext,
    ) -> std::result::Result<Option<String>, Error> {
        let namespace = Backend::parse(backend)?.namespace;
        let provider = self.clone();
        tokio::task::spawn_blocking(move || provider.resolved(&namespace).map(|(_, epoch)| epoch))
            .await
            .map_err(|_| invalid())?
            .map_err(|e| Error::Tool(e.to_string()))
    }
    async fn open(
        &self,
        backend: &Value,
        context: &RunContext,
    ) -> std::result::Result<Arc<NofyMemoryService>, Error> {
        if context.cancel.is_cancelled() {
            return Err(Error::Cancelled);
        }
        let config = Backend::parse(backend)?;
        let provider = self.clone();
        let namespace = config.namespace.clone();
        let (namespace_lease, resolved) = tokio::task::spawn_blocking(move || {
            let lease = provider.control.namespace_lease(&namespace, false)?;
            Ok::<_, HostError>((lease, provider.resolved(&namespace)?))
        })
        .await
        .map_err(|_| invalid())?
        .map_err(|e| Error::Tool(e.to_string()))?;
        let _namespace = namespace_lease;
        let undo = config.undo_limits.unwrap_or_default();
        let format = self.format(&config);
        let base_key = self.key(&config);
        let key = format!(
            "{base_key}:{}:{}",
            resolved.1.as_deref().unwrap_or("origin"),
            self.learning
        );
        let cell = {
            let mut clients = self.clients.lock().map_err(|_| invalid())?;
            let epoch = format!("{base_key}:{}:", resolved.1.as_deref().unwrap_or("origin"));
            clients.retain(|cached, _| {
                !cached.starts_with(&format!("{base_key}:")) || cached.starts_with(&epoch)
            });
            if !clients.contains_key(&key) && clients.len() >= 128 {
                return Err(Error::Composition(
                    "managed memory is limited to 128 storage connections".into(),
                ));
            }
            clients.entry(key.clone()).or_default().clone()
        };
        let root = resolved.0;
        let search = config.search.clone();
        let learning = self.learning;
        let service = cell
            .get_or_try_init(|| async move {
                tokio::task::spawn_blocking(move || -> std::result::Result<_, Error> {
                    let prepare = || -> Result<(PathBuf, PathBuf)> {
                        let namespace = directory(&root)?;
                        let bytes = serde_json::to_vec(&format).map_err(storage::unavailable)?;
                        // Noclobber + exact comparison also serializes first open
                        // across processes. No format migration happens implicitly.
                        let schema_path = namespace.join("schema.json");
                        if schema_path.exists() {
                            let previous: Value =
                                serde_json::from_slice(&storage::read(&schema_path, 8192)?)
                                    .map_err(storage::unavailable)?;
                            if previous != format {
                                return Err(HostError::Unavailable(
                                    "memory format requires explicit migration".into(),
                                ));
                            }
                        } else {
                            storage::atomic(&schema_path, &bytes, 0o600, false)?;
                        }
                        let contexts = directory(&namespace.join("contexts"))?;
                        let workspace =
                            directory(&contexts.join(config.project_id.as_uuid().to_string()))?;
                        Ok((namespace, workspace))
                    };
                    let (root, workspace) = prepare().map_err(|_| {
                        Error::Composition(
                            "memory storage unavailable or format requires explicit migration"
                                .into(),
                        )
                    })?;
                    let service = NofyMemoryService::new(NofyMemoryServiceConfig {
                        root,
                        workspace,
                        project_id: config.project_id,
                        memory_enabled: true,
                        automatic_learning_enabled: learning,
                        search: config.search,
                        index: config.index,
                        embedding_dimensions: config.embedding_dimensions,
                        migration_key_store: Arc::new(
                            nofy_memory::migration_backup::KeyringMigrationKeyStore,
                        ),
                    })
                    .map_err(|_| Error::Tool("canonical memory storage cannot open".into()))?;
                    let service = service
                        .with_durable_undo(undo)
                        .map_err(|_| Error::Tool("durable memory undo cannot open".into()))?;
                    Ok(Arc::new(service))
                })
                .await
                .map_err(|_| Error::Tool("memory preparation worker failed".into()))?
            })
            .await
            .cloned();
        let service = match service {
            Ok(service) => service,
            Err(error) => {
                let mut clients = self.clients.lock().map_err(|_| invalid())?;
                // Retire only an uninitialized entry with no other initializer
                // or waiter. Successful/active services retain their undo state.
                if cell.get().is_none()
                    && Arc::strong_count(&cell) == 2
                    && clients
                        .get(&key)
                        .is_some_and(|entry| Arc::ptr_eq(entry, &cell))
                {
                    clients.remove(&key);
                }
                return Err(error);
            }
        };
        // Logical project mode never discovers a repository in the host's
        // state directory. Actual workspace/branch bindings are separate work.
        let service = service.with_query_options(search, Some(Default::default()));
        let service = service
            .with_durable_undo(undo)
            .map_err(|_| Error::Tool("durable memory undo options cannot apply".into()))?;
        Ok(Arc::new(service))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[tokio::test]
    async fn failed_formats_do_not_consume_connection_slots_or_evict_a_working_service() {
        let dir = tempfile::tempdir().unwrap();
        let loader = directory(&dir.path().join("loader")).unwrap();
        let control = Arc::new(control::MemoryControl::open(&loader).unwrap());
        let provider = Provider::new(dir.path().join("memory"), control);
        let backend =
            json!({"namespace":"notes","project_id":"37a9b2ac-9dca-4aae-9235-aed6ac68d141"});
        let context = RunContext::new("t", "r");
        provider.open(&backend, &context).await.unwrap();
        for dimensions in 1..=130 {
            let mut changed = backend.clone();
            changed["embedding_dimensions"] = json!(dimensions);
            let Err(error) = provider.open(&changed, &context).await else {
                panic!("incompatible format opened")
            };
            assert!(
                error
                    .to_string()
                    .contains("format requires explicit migration"),
                "{error}"
            );
        }
        assert_eq!(provider.clients.lock().unwrap().len(), 1);
        provider.open(&backend, &context).await.unwrap();
    }
}
