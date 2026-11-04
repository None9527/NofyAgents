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
    /// Retain the caller's absolute invocation path while verifying its bytes.
    /// Toolchains may derive installation prefixes from this spelling (e.g. a
    /// virtual environment symlink). The host must separately grant the path.
    pub fn load_preserving_path(
        path: &Path,
        script_flag: Option<String>,
    ) -> Result<Self, ToolError> {
        let mut program = Self::load(path, script_flag)?;
        program.path = path.to_owned();
        Ok(program)
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

#[cfg(all(test, unix))]
mod installed_program_tests {
    use super::*;
    #[tokio::test]
    async fn invocation_alias_is_retained_without_losing_content_verification() {
        let directory = tempfile::tempdir().unwrap();
        let target = directory.path().join("runtime");
        let alias = directory.path().join("invocation");
        std::fs::copy("/usr/bin/true", &target).unwrap();
        std::os::unix::fs::symlink(&target, &alias).unwrap();
        let original = InstalledProgram::load(&alias, None).unwrap();
        let retained = InstalledProgram::load_preserving_path(&alias, None).unwrap();
        assert_eq!(original.path, target);
        assert_eq!(retained.path, alias);
        assert_eq!(original.digest, retained.digest);
        retained.verify().await.unwrap();
        use std::io::Write;
        std::fs::OpenOptions::new()
            .append(true)
            .open(&target)
            .unwrap()
            .write_all(b"changed")
            .unwrap();
        assert!(retained.verify().await.is_err());
        InstalledProgram::load_preserving_path(&alias, None)
            .unwrap()
            .verify()
            .await
            .unwrap();
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
    /// Pure binding of already verified host resources. The caller owns the
    /// absolute root and logical contract; paths never enter portable identity.
    pub fn bind(
        root: PathBuf,
        programs: BTreeMap<String, InstalledProgram>,
        env: BTreeMap<String, String>,
        guard: Arc<dyn EnvironmentGuard>,
        logical_identity: &str,
    ) -> Result<Self, ToolError> {
        if !root.is_absolute()
            || logical_identity.is_empty()
            || logical_identity.len() > 8192
            || guard.revision().trim().is_empty()
            || programs.is_empty()
        {
            return Err(crate::tool_error(
                "environment",
                "invalid trusted process binding",
            ));
        }
        let identity =
            serde_json::to_vec(&("logical-process-v1", logical_identity, guard.revision()))
                .map_err(|_| crate::tool_error("environment", "invalid process identity"))?;
        Ok(Self {
            root,
            programs,
            env,
            guard,
            identity: format!("{:x}", Sha256::digest(identity)),
        })
    }
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
