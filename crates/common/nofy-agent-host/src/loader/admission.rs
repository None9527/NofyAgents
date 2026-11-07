//! Cross-process commit exclusion plus current dependency validation.
use super::*;
use nofy_agent_runtime::{
    Error,
    admission::{CommitAdmission, CommitPermit},
};
use std::fs::File;
#[cfg(all(test, unix))]
mod tests;

#[derive(Clone)]
pub struct CommitFence {
    path: PathBuf,
}
/// Process-local publication/checkpoint fence, not an executor handoff lease.
pub struct CommitLease(File, u32);
impl Drop for CommitLease {
    fn drop(&mut self) {
        storage::unlock_local(&self.0, self.1);
    }
}
impl CommitFence {
    pub(super) fn open(root: &Path) -> Result<Self> {
        let lifecycle = storage::directory(&root.join("lifecycle"))?;
        let path = lifecycle.join("commit.lock");
        storage::atomic(&path, b"", 0o600, false)?;
        let protocol = lifecycle.join("commit-protocol.json");
        if protocol.exists() && storage::read(&protocol, 128)? == b"\"nofy.loader-commit/v1\"" {
            let _use = lifecycle::maintenance_file(&lifecycle.join("lease.lock"))?;
            let _commit = acquire(&path, true)?;
            storage::atomic(&protocol, b"\"nofy.loader-commit/v2\"", 0o600, true)?;
        } else {
            storage::atomic(&protocol, b"\"nofy.loader-commit/v2\"", 0o600, false)?;
        }
        Ok(Self { path })
    }
    pub fn shared(&self) -> Result<CommitLease> {
        let file = acquire(&self.path, false)?;
        super::unload::ensure_no_pending(self.path.parent().expect("commit fence parent"))?;
        Ok(file)
    }
    /// Only excludes commits; future unloading also needs the cache-use lease,
    /// a fresh reference cut and a durable recovery journal.
    pub fn exclusive(&self) -> Result<CommitLease> {
        acquire(&self.path, true)
    }
}
pub(super) fn resource_lease(root: &Path) -> Result<Option<CommitLease>> {
    let Some(loader) = root.parent() else {
        return Ok(None);
    };
    let path = loader.join("lifecycle/commit.lock");
    if std::fs::symlink_metadata(&path).is_err_and(|e| e.kind() == std::io::ErrorKind::NotFound) {
        return Ok(None);
    }
    let file = acquire(&path, false)?;
    super::unload::ensure_no_pending(path.parent().expect("commit fence parent"))?;
    Ok(Some(file))
}
fn acquire(path: &Path, exclusive: bool) -> Result<CommitLease> {
    let mut options = std::fs::OpenOptions::new();
    options.read(true).write(exclusive);
    let file = nofy_host_path::open_no_follow(&options, path).map_err(storage::unavailable)?;
    if !file.metadata().map_err(storage::unavailable)?.is_file() {
        return Err(HostError::Unavailable("invalid commit fence".into()));
    }
    let result = if exclusive {
        fs2::FileExt::try_lock_exclusive(&file)
    } else {
        fs2::FileExt::try_lock_shared(&file)
    };
    result.map_err(|_| {
        HostError::Unavailable("loader commits are in use or undergoing maintenance".into())
    })?;
    Ok(CommitLease(file, std::process::id()))
}
#[derive(Clone)]
pub(crate) struct LoaderAdmission(pub Loader);
struct Permit {
    _lease: CommitLease,
    loader: Loader,
}
fn unavailable(_: impl std::fmt::Display) -> Error {
    Error::Checkpoint(
        "retained dependencies could not be verified; retry or re-admit their exact bytes".into(),
    )
}
impl CommitAdmission for LoaderAdmission {
    fn identity(&self) -> &str {
        "nofy.loader-reference/v1"
    }
    fn enter(&self) -> std::result::Result<Box<dyn CommitPermit>, Error> {
        Ok(Box::new(Permit {
            _lease: self.0.commits.shared().map_err(|_| {
                Error::Checkpoint(
                    "commit fence busy or unavailable; retry after maintenance".into(),
                )
            })?,
            loader: self.0.clone(),
        }))
    }
    fn permits_inherited(
        &self,
        parent: &[&ModuleDefinition],
        kind: &str,
        modules: &[&ModuleDefinition],
    ) -> std::result::Result<bool, Error> {
        if !matches!(kind, "checkpoint" | "child") {
            return Ok(false);
        }
        fn keys(
            defs: &[&ModuleDefinition],
        ) -> Result<(
            std::collections::BTreeSet<references::ObjectKey>,
            std::collections::BTreeSet<String>,
        )> {
            let mut keys = std::collections::BTreeSet::new();
            let mut directories = std::collections::BTreeSet::new();
            for module in module_walk::collect_definitions(defs)? {
                if module.factory == "resource.workflow"
                    && module
                        .config
                        .get("document")
                        .and_then(|d| d.get("schema_version"))
                        .is_some_and(|v| v != 1)
                {
                    return Err(HostError::Invalid(
                        "unsupported retained workflow document".into(),
                    ));
                }
                if let Some(key) = references::key(&module)? {
                    keys.insert(key);
                }
                if module.factory == "resource.directory" || module.factory == super::local::FACTORY
                {
                    directories.insert(nofy_agent_runtime::system::content_digest(&module.config)?);
                }
                if module.factory == super::process_tree::FACTORY {
                    directories.insert(format!(
                        "process-tree:{}",
                        nofy_agent_runtime::system::content_digest(&module.config)?
                    ));
                }
            }
            Ok((keys, directories))
        }
        match (keys(parent), keys(modules)) {
            (Ok((parent, parent_dirs)), Ok((children, child_dirs))) => {
                Ok(children.is_subset(&parent) && child_dirs.is_subset(&parent_dirs))
            }
            _ => Ok(false),
        }
    }
}
impl CommitPermit for Permit {
    fn validate(
        &self,
        kind: &str,
        definitions: &[&ModuleDefinition],
    ) -> std::result::Result<(), Error> {
        let result = (|| -> Result<()> {
            let modules = module_walk::collect_definitions(definitions)?;
            let mut seen = std::collections::BTreeSet::new();
            for module in modules {
                // Availability gates new authority, not receipts/checkpoints
                // for work whose effect may already have succeeded.
                if matches!(kind, "publication" | "job") && module.factory == super::local::FACTORY
                {
                    super::local::config(&module.config, &self.loader.private_root)?
                        .preflight(&self.loader.private_root)?;
                }
                if matches!(kind, "publication" | "job") && module.factory == "resource.directory" {
                    super::directories::preflight_config(
                        &module.config,
                        &self.loader.private_root,
                    )?;
                }
                if matches!(kind, "publication" | "job")
                    && module.factory == super::process_tree::FACTORY
                {
                    super::process_tree::config(&module.config)?.preflight()?;
                }
                if module.factory == "resource.workflow"
                    && module
                        .config
                        .get("document")
                        .and_then(|d| d.get("schema_version"))
                        .is_some_and(|version| version != 1)
                {
                    return Err(HostError::Invalid(
                        "unsupported retained workflow document".into(),
                    ));
                }
                let Some(key) = references::key(&module)? else {
                    continue;
                };
                if !seen.insert(key.clone()) {
                    continue;
                }
                match key {
                    references::ObjectKey::Artifact { digest } => {
                        if let Some(bundle) = module.config.get("bundle") {
                            let bundle = serde_json::from_value(bundle.clone())
                                .map_err(storage::unavailable)?;
                            self.loader.artifacts.put(bundle)?;
                        } else {
                            self.loader.artifacts.get(&digest)?;
                        }
                    }
                    references::ObjectKey::Image { digest } => {
                        self.loader.images.verify(&digest)?;
                    }
                    references::ObjectKey::Runtime { id, revision } => {
                        self.loader.runtimes.verify(&id, &revision)?;
                    }
                }
            }
            Ok(())
        })();
        // An incomplete draft is not executable. Publication and runtime
        // admission must succeed independently even if that draft was allowed.
        if kind == "draft" {
            Ok(())
        } else {
            result.map_err(unavailable)
        }
    }
}
