//! Loader IO precedes pure compilation. Frozen bundles embed source packages;
//! runtime paths and confinement bootstrap are private host bindings.
pub mod admission;
pub mod artifacts;
pub mod code;
pub mod deployment;
mod directories;
mod evaluation;
pub(crate) mod factories;
mod helper;
pub mod images;
pub mod isolation;
mod launch;
pub mod lifecycle;
mod local;
pub mod memory;
pub mod models;
mod module_walk;
#[cfg(target_os = "linux")]
pub mod process_sessions;
pub mod process_tree;
pub mod prompts;
pub mod references;
pub(crate) mod runtime_history;
pub mod runtimes;
pub mod scopes;
pub mod sources;
mod storage;
#[cfg(all(test, target_os = "linux"))]
mod test_support;
pub mod unload;
use crate::{HostError, Result};
use nofy_agent_runtime::{
    registry::ModuleDefinition,
    system::{ProgramDefinition, SystemDocument, SystemFile},
};
use std::{
    path::{Path, PathBuf},
    sync::Arc,
};

#[derive(Clone)]
pub struct Loader {
    pub artifacts: artifacts::ArtifactStore,
    pub runtimes: runtimes::RuntimeStore,
    pub images: images::ImageStore,
    pub sources: sources::SourceStore,
    pub cache: lifecycle::CacheLifecycle,
    pub commits: admission::CommitFence,
    pub unload: unload::ObjectStore,
    #[cfg(target_os = "linux")]
    pub process_trees: process_tree::Manager,
    #[cfg(target_os = "linux")]
    pub process_sessions: process_sessions::Manager,
    pub(crate) private_root: PathBuf,
    pub(crate) memory: nofy_memory::runtime::declarative::MemoryResourceFactory,
    pub(crate) memory_provider: Arc<memory::Provider>,
    pub memory_control: Arc<memory::control::MemoryControl>,
    scratch: PathBuf,
    prompt_root: PathBuf,
    helper: helper::Helper,
    pub(crate) management_work: Arc<tokio::sync::Semaphore>,
    preparation_work: Arc<tokio::sync::Semaphore>,
    reference_work: Arc<tokio::sync::Semaphore>,
    prompt_work: Arc<tokio::sync::Semaphore>,
    prompt_started: Arc<std::sync::atomic::AtomicU64>,
    scope_work: Arc<tokio::sync::Semaphore>,
    scope_started: Arc<std::sync::atomic::AtomicU64>,
    code_work: Arc<tokio::sync::Semaphore>,
    code_started: Arc<std::sync::atomic::AtomicU64>,
    models: Arc<models::Pool>,
    source_credentials: tokio::sync::watch::Sender<
        Option<Arc<dyn nofy_agent_runtime::credentials::CredentialProvider>>,
    >,
    acquisition_stop: tokio_util::sync::CancellationToken,
}
impl Loader {
    pub fn open(state_dir: &Path) -> Result<Self> {
        let private_root = std::fs::canonicalize(state_dir).map_err(storage::unavailable)?;
        let root = storage::directory(&private_root.join("loader"))?;
        let cache = lifecycle::CacheLifecycle::open(&root)?;
        let commits = admission::CommitFence::open(&root)?;
        let memory_control = Arc::new(memory::control::MemoryControl::open(&root)?);
        let memory_provider = Arc::new(memory::Provider::new(
            private_root.join("memory"),
            memory_control.clone(),
        ));
        let memory =
            nofy_memory::runtime::declarative::MemoryResourceFactory::new(memory_provider.clone())?;
        let acquisition_stop = tokio_util::sync::CancellationToken::new();
        let loader = Self {
            artifacts: artifacts::ArtifactStore::open(&root.join("artifacts"))?,
            runtimes: runtimes::RuntimeStore::open(&root.join("runtimes"), &private_root)?,
            images: images::ImageStore::open(&root.join("images"))?,
            sources: sources::SourceStore::open(&root.join("sources"))?,
            cache,
            commits,
            unload: unload::ObjectStore::open(&root)?,
            #[cfg(target_os = "linux")]
            process_trees: process_tree::Manager::open(&root.join("process-jobs"))?,
            #[cfg(target_os = "linux")]
            process_sessions: process_sessions::Manager::open(&root.join("process-sessions"))?,
            scratch: storage::directory(&root.join("scratch"))?,
            prompt_root: storage::directory(&root.join("render"))?,
            memory,
            memory_provider,
            memory_control,
            private_root,
            helper: Default::default(),
            management_work: Arc::new(tokio::sync::Semaphore::new(2)),
            preparation_work: Arc::new(tokio::sync::Semaphore::new(2)),
            reference_work: Arc::new(tokio::sync::Semaphore::new(2)),
            prompt_work: Arc::new(tokio::sync::Semaphore::new(2)),
            prompt_started: Arc::new(std::sync::atomic::AtomicU64::new(0)),
            scope_work: Arc::new(tokio::sync::Semaphore::new(2)),
            scope_started: Arc::new(std::sync::atomic::AtomicU64::new(0)),
            code_work: Arc::new(tokio::sync::Semaphore::new(2)),
            code_started: Arc::new(std::sync::atomic::AtomicU64::new(0)),
            models: Arc::new(models::Pool::new(acquisition_stop.child_token())),
            source_credentials: tokio::sync::watch::channel(None).0,
            acquisition_stop,
        };
        loader.recover_objects()?;
        Ok(loader)
    }
    pub fn set_source_credentials(
        &self,
        provider: Arc<dyn nofy_agent_runtime::credentials::CredentialProvider>,
    ) {
        self.source_credentials.send_replace(Some(provider));
    }
    pub(crate) fn stop_acquisitions(&self) {
        self.acquisition_stop.cancel();
        self.memory.shutdown();
        #[cfg(target_os = "linux")]
        self.process_trees.shutdown();
        #[cfg(target_os = "linux")]
        self.process_sessions.shutdown();
    }
    pub fn set_helper(&self, path: &Path) -> Result<()> {
        self.helper.install(path)
    }
    fn helper(&self) -> Result<PathBuf> {
        self.helper.path()
    }
    pub(super) fn helper_ready(&self) -> bool {
        self.helper.bound()
    }
    pub fn refresh(&self) -> Result<()> {
        self.runtimes.refresh()
    }
    pub fn resolve(&self, mut file: SystemFile) -> Result<SystemFile> {
        let document = match &file {
            SystemFile::Source(d) => d,
            SystemFile::Locked(b) => &b.document,
        };
        let needs_process = module_walk::collect(document)?
            .iter()
            .any(|m| m.factory == "resource.process");
        if needs_process {
            self.refresh()?;
        }
        match &mut file {
            SystemFile::Source(document) => self.resolve_document(document)?,
            SystemFile::Locked(bundle) => {
                bundle.validate()?;
            }
        }
        Ok(file)
    }
    fn resolve_document(&self, document: &mut SystemDocument) -> Result<()> {
        module_walk::visit(document, &mut |module| {
            self.resolve_modules(std::slice::from_mut(module))
        })
    }
    fn resolve_modules(&self, modules: &mut [ModuleDefinition]) -> Result<()> {
        for module in modules {
            if module.factory == "resource.artifact" && module.config.get("digest").is_some() {
                #[derive(serde::Deserialize)]
                #[serde(deny_unknown_fields)]
                struct Reference {
                    digest: String,
                }
                let reference: Reference = serde_json::from_value(module.config.clone())
                    .map_err(|e| HostError::Invalid(e.to_string()))?;
                module.config =
                    serde_json::json!({"bundle":self.artifacts.get(&reference.digest)?});
            }
        }
        Ok(())
    }
    pub(super) fn register(
        &self,
        registry: &mut nofy_agent_runtime::registry::ModuleRegistry,
    ) -> Result<()> {
        registry.register_factory(Arc::new(nofy_agent_executors::code::RhaiToolFactory::new(
            Arc::new(self.clone()),
        )))?;
        registry.register_factory(Arc::new(
            nofy_agent_executors::code::ContextPolicyFactory::new(Arc::new(self.clone())),
        ))?;
        registry.register_factory(Arc::new(
            nofy_agent_executors::code::SessionPolicyFactory::new(Arc::new(self.clone())),
        ))?;
        registry.register_factory(Arc::new(
            nofy_agent_models::declarative::ProtocolFactory::new(Arc::new(self.clone())),
        ))?;
        registry.register_factory(Arc::new(prompts::PromptFactory(self.clone())))?;
        registry.register_factory(Arc::new(self.memory.clone()))?;
        registry.register_factory(Arc::new(self.memory.with_capture_provider(
            "resource.memory_learning",
            Arc::new(self.memory_provider.with_learning()),
        )?))?;
        registry.register_factory(Arc::new(
            nofy_memory::runtime::declarative::ConnectedCaptureFactory,
        ))?;
        registry.register_factory(Arc::new(
            nofy_memory::runtime::declarative::ConnectedMemoryFactory::tools(),
        ))?;
        registry.register_factory(Arc::new(
            nofy_memory::runtime::declarative::ConnectedMemoryFactory::context(),
        ))?;
        registry.register_factory(Arc::new(
            nofy_memory::runtime::declarative::ConnectedSemanticFactory,
        ))?;
        registry.register_factory(Arc::new(
            nofy_agent_modules::scope_program::DeclaredSkillsFactory::new()
                .with_substitution_limits(crate::native::skill_substitution_limits()),
        ))?;
        registry.register_factory(Arc::new(nofy_agent_modules::scope_program::Factory::new(
            Arc::new(self.clone()),
        )?))?;
        registry.register_factory(Arc::new(nofy_agent_runtime::artifact::ArtifactFactory))?;
        registry.register_factory(Arc::new(directories::Factory::new(
            self.private_root.clone(),
        )))?;
        registry.register_factory(Arc::new(process_tree::Factory))?;
        registry.register_factory(Arc::new(factories::EnvironmentFactory(self.clone())))?;
        registry.register_factory(Arc::new(factories::LockedEnvironmentFactory(self.clone())))?;
        registry.register_factory(Arc::new(factories::LocalEnvironmentFactory(self.clone())))?;
        registry.register_factory(Arc::new(factories::ProcessArtifactFactory))?;
        #[cfg(target_os = "linux")]
        registry.register_factory(Arc::new(factories::TreeArtifactFactory))?;
        #[cfg(target_os = "linux")]
        {
            registry.register_factory(Arc::new(process_sessions::LimitsFactory))?;
            registry.register_factory(Arc::new(factories::SessionFactory))?;
            registry.register_factory(Arc::new(factories::TerminalFactory))?;
            registry.register_factory(Arc::new(factories::StdioFactory))?;
        }
        Ok(())
    }
    pub async fn resolve_file(&self, file: SystemFile) -> Result<SystemFile> {
        self.prepare_deployment(deployment::DeploymentFile::Legacy(file), false)
            .await
    }
    pub async fn refresh_async(&self) -> Result<()> {
        let loader = self.clone();
        tokio::task::spawn_blocking(move || loader.refresh())
            .await
            .map_err(storage::unavailable)?
    }
    pub fn probe(&self) -> Result<serde_json::Value> {
        let _lease = self.cache.shared()?;
        let helper = self.helper()?;
        let scratch = tempfile::tempdir_in(&self.scratch).map_err(storage::unavailable)?;
        let profile = isolation::Profile {
            scratch: scratch.path().into(),
            scratch_files: vec![],
            read_only: vec![],
            local_paths: vec![],
            directories: vec![],
            private_root: self.private_root.clone(),
            parent_pid: std::process::id(),
            cpu_seconds: 2,
            environment: Default::default(),
            cache_lease: Some(self.cache.lease_path()),
        };
        let output = std::process::Command::new(helper)
            .arg(isolation::WORKER_ARG)
            .arg(serde_json::to_string(&profile).map_err(storage::unavailable)?)
            .arg("--probe")
            .env_clear()
            .output()
            .map_err(storage::unavailable)?;
        if !output.status.success() {
            return Err(HostError::Unavailable(
                "required process isolation is unavailable; no business code was started".into(),
            ));
        }
        serde_json::from_slice(&output.stdout).map_err(storage::unavailable)
    }
}
