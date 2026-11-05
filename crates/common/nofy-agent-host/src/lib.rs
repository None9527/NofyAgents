//! Optional resident host. All business execution remains in the shared
//! Supervisor; HTTP connections only admit commands and replay durable facts.
mod api;
pub mod auth;
pub mod credentials;
pub mod loader;
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
    Source(#[from] nofy_agent_project::Error),
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
/// Host execution includes deeply composed debug-build futures. A resident
/// runtime must not depend on Cargo injecting RUST_MIN_STACK. Embedded hosts
/// should set this explicit stack floor on their Tokio worker threads too.
pub const WORKER_STACK_BYTES: usize = 16 * 1024 * 1024;
#[derive(Clone)]
pub struct KernelHost {
    pub(crate) control: ControlPlane,
    pub(crate) store: SqliteStore,
    pub(crate) supervisor: Arc<RunSupervisor>,
    // Bootstrap metadata is immutable; request/worker clones share its schemas.
    pub(crate) registry: Arc<ModuleRegistry>,
    pub(crate) auth: Arc<Authorizer>,
    pub(crate) wake: Arc<tokio::sync::Notify>,
    pub(crate) stop: CancellationToken,
    pub(crate) credentials: Option<Arc<credentials::FileCredentials>>,
    pub(crate) loader: loader::Loader,
    pub(crate) runtime_history: Arc<loader::runtime_history::Control>,
    pub(crate) projects: nofy_agent_project::ProjectStore,
    pub(crate) module_library: nofy_agent_project::repository::ModuleStore,
    pub(crate) templates: Option<nofy_agent_project::TemplateRegistry>,
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
        let project_directory = directory.join("projects");
        let module_directory = directory.join("module-repositories");
        let (catalog, store, loader, runtime_history) =
            tokio::task::spawn_blocking(move || -> Result<_> {
                std::fs::create_dir_all(&directory)
                    .map_err(|e| HostError::Unavailable(e.to_string()))?;
                let loader = loader::Loader::open(&directory)?;
                let admission = Arc::new(loader::admission::LoaderAdmission(loader.clone()));
                let runtime_history = Arc::new(loader::runtime_history::Control::open(
                    &loader.private_root,
                    &directory.join("runtime.sqlite"),
                )?);
                let catalog = FileCatalogStore::open_with_admission(
                    directory.join("catalog.json"),
                    admission.clone(),
                )?;
                let store = SqliteStore::open_placed(
                    &directory.join("runtime.sqlite"),
                    runtime_history.clone(),
                    Some(admission),
                )?;
                runtime_history.initialize()?;
                Ok((catalog, store, loader, runtime_history))
            })
            .await
            .map_err(|e| HostError::Unavailable(e.to_string()))??;
        registry.register_factory(Arc::new(native::ApprovalFactory(store.clone())))?;
        registry.register_factory(Arc::new(loader::runtime_history::BackendFactory))?;
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
        loader.register(&mut registry)?;
        Ok(Self {
            projects: nofy_agent_project::ProjectStore::open(&project_directory)?,
            module_library: nofy_agent_project::repository::ModuleStore::open(&module_directory)?,
            templates: None,
            control: ControlPlane::new(Arc::new(catalog), registry.clone()),
            supervisor: Arc::new(
                RunSupervisor::new(store.clone()).with_session_registry(registry.clone()),
            ),
            store,
            registry: Arc::new(registry),
            auth: Arc::new(auth),
            wake: Arc::new(tokio::sync::Notify::new()),
            stop: CancellationToken::new(),
            credentials: None,
            loader,
            runtime_history,
        })
    }
    pub fn control(&self) -> &ControlPlane {
        &self.control
    }
    /// External versioned template registry. Source templates are data; no
    /// project-provided build script is executed during discovery or rendering.
    pub fn with_templates(mut self, directory: &Path) -> Result<Self> {
        let registry = nofy_agent_project::TemplateRegistry::open(directory)?;
        registry.list()?;
        self.templates = Some(registry);
        Ok(self)
    }
    /// Explicit operator registration; package discovery never guesses paths
    /// or acquires external dependencies.
    pub fn with_module_directory(self, repository: &str, directory: &Path) -> Result<Self> {
        use nofy_agent_project::repository::{RepositoryOrigin, load_repository_directory};
        let directory = directory
            .canonicalize()
            .map_err(|e| HostError::Unavailable(e.to_string()))?;
        let origin = RepositoryOrigin::Directory {
            host_path: directory.clone(),
        };
        let previous = match self.module_library.get(repository) {
            Ok(v) => Some(v),
            Err(e) if e.code == "not_found" => None,
            Err(e) => return Err(e.into()),
        };
        if previous.as_ref().is_some_and(|v| v.origin != origin) {
            return Err(HostError::Invalid(
                "module directory repository already has another origin".into(),
            ));
        }
        let view = self.module_library.put(
            repository,
            previous.as_ref().map(|v| v.revision.as_str()),
            origin,
        )?;
        let (sources, revision) = load_repository_directory(&directory)?;
        self.module_library
            .synchronize(repository, &view.revision, sources, revision)?;
        Ok(self)
    }
    pub fn with_loader_helper(self, path: &Path) -> Result<Self> {
        self.loader.set_helper(path)?;
        Ok(self)
    }
    pub fn loader(&self) -> &loader::Loader {
        &self.loader
    }
    /// Install the same authority used by the registry's resource factories.
    /// Custom embedded hosts may omit management of their credential backend.
    pub fn with_credentials(mut self, store: Arc<credentials::FileCredentials>) -> Self {
        self.loader.set_source_credentials(store.clone());
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
        self.loader.stop_acquisitions();
        self.wake.notify_waiters();
    }
    /// The worker owns spawned tasks and drains them on shutdown. Dropping a
    /// client/stream does not cancel them. Dropping this returned future does.
    pub async fn run_worker(&self, shutdown: CancellationToken, concurrency: usize) -> Result<()> {
        let result = worker::run(self.clone(), shutdown, concurrency).await;
        self.shutdown();
        #[cfg(target_os = "linux")]
        let trees = self.loader.process_trees.drain();
        #[cfg(target_os = "linux")]
        let sessions = self.loader.process_sessions.drain();
        #[cfg(not(target_os = "linux"))]
        let sessions = std::future::ready(Ok::<(), HostError>(()));
        #[cfg(not(target_os = "linux"))]
        let trees = std::future::ready(Ok::<(), HostError>(()));
        // Complete every independent drain even when one owner is unknown;
        // an early `?` must not skip waiting for the other resource classes.
        let (trees, sessions, prompts, scopes, models, code, memory) = tokio::join!(
            trees,
            sessions,
            self.loader.drain_prompt_workers(),
            self.loader.drain_scope_workers(),
            self.loader.drain_model_workers(),
            self.loader.drain_code_workers(),
            self.loader.memory.drain(),
        );
        trees?;
        sessions?;
        prompts?;
        scopes?;
        models?;
        code?;
        memory?;
        result
    }
}
