//! Optional resident host. All business execution remains in the shared
//! Supervisor; HTTP connections only admit commands and replay durable facts.
mod api;
pub mod auth;
pub mod credentials;
pub mod native;
mod worker;
use auth::Authorizer;
use nofy_agent_runtime::{
    control::{ControlPlane, FileCatalogStore},
    durable::SqliteStore,
    registry::ModuleRegistry,
    supervisor::RunSupervisor,
};
use std::{path::Path, sync::Arc};
use tokio_util::sync::CancellationToken;

#[derive(Debug, thiserror::Error)]
pub enum HostError {
    #[error(transparent)]
    Runtime(#[from] nofy_agent_runtime::Error),
    #[error(transparent)]
    Control(#[from] nofy_agent_runtime::control::ControlError),
    #[error("invalid request: {0}")]
    Invalid(String),
    #[error("not found")]
    NotFound,
    #[error("authentication required")]
    Unauthorized,
    #[error("scope denied")]
    Forbidden,
    #[error("host is unavailable: {0}")]
    Unavailable(String),
}
pub type Result<T> = std::result::Result<T, HostError>;
#[derive(Clone)]
pub struct KernelHost {
    pub(crate) control: ControlPlane,
    pub(crate) store: SqliteStore,
    pub(crate) supervisor: Arc<RunSupervisor>,
    pub(crate) registry: ModuleRegistry,
    pub(crate) auth: Arc<Authorizer>,
    pub(crate) wake: Arc<tokio::sync::Notify>,
    pub(crate) stop: CancellationToken,
    pub(crate) credentials: Option<Arc<credentials::FileCredentials>>,
}
impl KernelHost {
    /// Explicit paths and installed factories are process bootstrap concerns.
    /// Agent definitions, prompts and model resources come from system files.
    pub async fn open(
        directory: &Path,
        mut registry: ModuleRegistry,
        auth: Authorizer,
    ) -> Result<Self> {
        if !directory.is_absolute() {
            return Err(HostError::Invalid(
                "host state directory must be absolute".into(),
            ));
        }
        let directory = directory.to_path_buf();
        let (catalog, store) = tokio::task::spawn_blocking(move || -> Result<_> {
            std::fs::create_dir_all(&directory)
                .map_err(|e| HostError::Unavailable(e.to_string()))?;
            Ok((
                FileCatalogStore::open(directory.join("catalog.json"))?,
                SqliteStore::open(&directory.join("runtime.sqlite"))?,
            ))
        })
        .await
        .map_err(|e| HostError::Unavailable(e.to_string()))??;
        registry.register_factory(Arc::new(native::ApprovalFactory(store.clone())))?;
        registry.register_factory(Arc::new(
            nofy_agent_runtime::governance::declarative::BudgetResourceFactory::new(
                Arc::new(store.clone()),
                "nofy.kernel.budget",
                nofy_agent_runtime::governance::BudgetLimits::default(),
                5,
            )?,
        ))?;
        registry.register_factory(Arc::new(
            nofy_agent_runtime::governance::declarative::ConnectedBudgetFactory,
        ))?;
        Ok(Self {
            control: ControlPlane::new(Arc::new(catalog), registry.clone()),
            supervisor: Arc::new(RunSupervisor::new(store.clone())),
            store,
            registry,
            auth: Arc::new(auth),
            wake: Arc::new(tokio::sync::Notify::new()),
            stop: CancellationToken::new(),
            credentials: None,
        })
    }
    pub fn control(&self) -> &ControlPlane {
        &self.control
    }
    /// Install the same authority used by the registry's resource factories.
    /// Custom embedded hosts may omit management of their credential backend.
    pub fn with_credentials(mut self, store: Arc<credentials::FileCredentials>) -> Self {
        self.credentials = Some(store);
        self
    }
    pub fn store(&self) -> &SqliteStore {
        &self.store
    }
    pub fn router(&self) -> axum::Router {
        api::router(self.clone())
    }
    pub fn shutdown(&self) {
        self.stop.cancel();
        self.wake.notify_waiters();
    }
    /// The worker owns spawned tasks and drains them on shutdown. Dropping a
    /// client/stream does not cancel them. Dropping this returned future does.
    pub async fn run_worker(&self, shutdown: CancellationToken, concurrency: usize) -> Result<()> {
        let result = worker::run(self.clone(), shutdown, concurrency).await;
        self.shutdown();
        result
    }
}
