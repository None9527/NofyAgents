use nofy_tool_runtime::{ToolCallContext, ToolError};
use sha2::{Digest, Sha256};
use std::{
    collections::BTreeMap,
    path::{Path, PathBuf},
    sync::Arc,
};

#[async_trait::async_trait]
pub trait CredentialProvider: Send + Sync {
    async fn resolve(
        &self,
        reference: &str,
        context: &ToolCallContext,
    ) -> Result<String, ToolError>;
}

/// Each call resolves a live secret; serialized tool definitions contain refs.
pub struct NoCredentials;
#[async_trait::async_trait]
impl CredentialProvider for NoCredentials {
    async fn resolve(&self, _: &str, _: &ToolCallContext) -> Result<String, ToolError> {
        Err(crate::tool_error(
            "credential_unavailable",
            "credential provider is not installed",
        ))
    }
}

/// Host-installed launcher boundary. Configuration cannot choose or replace it.
/// Implementations must enforce confinement before returning successfully.
pub trait EnvironmentGuard: Send + Sync {
    fn revision(&self) -> &str;
    fn prepare(&self, command: &mut tokio::process::Command) -> Result<(), ToolError>;
}

#[cfg(feature = "nofy-sandbox")]
pub struct NofySandboxGuard;
#[cfg(feature = "nofy-sandbox")]
impl EnvironmentGuard for NofySandboxGuard {
    fn revision(&self) -> &str {
        "nofy-existing-confinement-v1"
    }
    fn prepare(&self, command: &mut tokio::process::Command) -> Result<(), ToolError> {
        if !nofy_sandbox::is_active() {
            return Err(crate::tool_error(
                "sandbox_unavailable",
                "Nofy sandbox must already be enforced by the host",
            ));
        }
        #[cfg(target_os = "linux")]
        if nofy_sandbox::should_restrict_child_network() {
            // SAFETY: the existing Nofy child filter only installs kernel BPF
            // rules and returns an io error; no locks or allocation after fork.
            unsafe {
                command.pre_exec(|| nofy_sandbox::child_net::install_child_network_filter());
            }
        }
        #[cfg(not(target_os = "linux"))]
        let _ = command;
        Ok(())
    }
}

#[derive(Clone)]
pub struct InstalledProgram {
    pub(crate) path: PathBuf,
    pub(crate) digest: Vec<u8>,
    pub(crate) script_flag: Option<String>,
}
impl InstalledProgram {
    /// Explicit host installation/probe performs IO, never Factory.build.
    pub fn load(path: &Path, script_flag: Option<String>) -> Result<Self, ToolError> {
        if !path.is_absolute() {
            return Err(crate::tool_error(
                "program_path",
                "program path must be absolute",
            ));
        }
        let path = std::fs::canonicalize(path).map_err(|_| {
            crate::tool_error("program_unavailable", "installed program does not exist")
        })?;
        let bytes = std::fs::read(&path).map_err(|_| {
            crate::tool_error("program_unavailable", "installed program cannot be read")
        })?;
        Ok(Self {
            path,
            digest: Sha256::digest(bytes).to_vec(),
            script_flag,
        })
    }
    pub(crate) async fn verify(&self) -> Result<(), ToolError> {
        let bytes = tokio::fs::read(&self.path).await.map_err(|_| {
            crate::tool_error("program_unavailable", "installed program cannot be read")
        })?;
        if Sha256::digest(bytes).as_slice() != self.digest {
            return Err(crate::tool_error(
                "program_changed",
                "installed executable changed; reinstall and publish a new module version",
            ));
        }
        Ok(())
    }
}

#[derive(Clone)]
pub struct ProcessEnvironment {
    pub(crate) root: PathBuf,
    pub(crate) programs: BTreeMap<String, InstalledProgram>,
    pub(crate) env: BTreeMap<String, String>,
    pub(crate) guard: Arc<dyn EnvironmentGuard>,
    pub(crate) identity: String,
}
impl ProcessEnvironment {
    /// Workspace, programs and environment are host-owned. HOME/PATH and all
    /// other ambient variables are cleared; no inherited current directory.
    pub fn install(
        root: &Path,
        programs: BTreeMap<String, InstalledProgram>,
        env: BTreeMap<String, String>,
        guard: Arc<dyn EnvironmentGuard>,
    ) -> Result<Self, ToolError> {
        if !root.is_absolute() {
            return Err(crate::tool_error("cwd", "workspace root must be absolute"));
        }
        let root = std::fs::canonicalize(root)
            .map_err(|_| crate::tool_error("cwd", "workspace root does not exist"))?;
        if !root.is_dir() || guard.revision().trim().is_empty() {
            return Err(crate::tool_error(
                "environment",
                "directory and guard revision are required",
            ));
        }
        let manifest: Vec<_> = programs
            .iter()
            .map(|(id, p)| (id, &p.path, &p.digest, &p.script_flag))
            .collect();
        let identity = serde_json::to_string(&(&root, manifest, &env, guard.revision()))
            .map_err(|_| crate::tool_error("environment", "invalid environment identity"))?;
        // Do not expose env values through descriptors or snapshots.
        let identity = format!("{:x}", Sha256::digest(identity));
        Ok(Self {
            root,
            programs,
            env,
            guard,
            identity,
        })
    }
    pub(crate) async fn cwd(&self, relative: &Path) -> Result<PathBuf, ToolError> {
        if relative.is_absolute()
            || relative
                .components()
                .any(|c| matches!(c, std::path::Component::ParentDir))
        {
            return Err(crate::tool_error(
                "cwd_denied",
                "cwd must stay inside the admitted workspace",
            ));
        }
        let path = tokio::fs::canonicalize(self.root.join(relative))
            .await
            .map_err(|_| crate::tool_error("cwd", "working directory does not exist"))?;
        if !path.starts_with(&self.root) || !path.is_dir() {
            return Err(crate::tool_error(
                "cwd_denied",
                "working directory escapes admitted workspace",
            ));
        }
        Ok(path)
    }
}
