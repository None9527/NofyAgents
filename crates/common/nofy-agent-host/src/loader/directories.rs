//! Directory authority is explicit, immutable and independent of tool semantics.
use super::*;
use nofy_agent_runtime::{Error, registry::*, system::content_digest};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
#[cfg(all(test, unix))]
mod tests;

pub(super) const ENV_PREFIX: &str = "NOFY_DIRECTORY_";
// The variant names are the wire vocabulary (`read_only`, `read_write`,
// `read_write_execute`), so they are not renamed to satisfy the prefix lint.
#[allow(clippy::enum_variant_names)]
#[derive(Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub(super) enum Access {
    ReadOnly,
    ReadWrite,
    ReadWriteExecute,
}
#[derive(Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub(super) struct Grant {
    pub path: PathBuf,
    pub access: Access,
}
fn same_host_path(a: &Path, b: &Path) -> bool {
    nofy_host_path::starts_with(a, b) && nofy_host_path::starts_with(b, a)
}

impl Grant {
    fn validate(&self, private_root: &Path) -> Result<()> {
        use std::path::Component;
        if !self.path.is_absolute()
            || self.path.parent().is_none()
            || self
                .path
                .to_str()
                .is_none_or(|s| s.len() > 4096 || s.chars().any(char::is_control))
            || self.path.components().any(|part| match part {
                Component::RootDir | Component::Normal(_) => false,
                Component::Prefix(_) => self.path.to_str().is_none_or(|path| {
                    nofy_host_path::Syntax::Windows
                        .check_normalized_absolute(path, 4096)
                        .is_err()
                }),
                _ => true,
            })
            || nofy_host_path::starts_with(&self.path, private_root)
            || nofy_host_path::starts_with(private_root, &self.path)
            || ["/proc", "/sys", "/dev", "/run"]
                .iter()
                .any(|root| nofy_host_path::starts_with(&self.path, Path::new(root)))
        {
            return Err(HostError::Invalid(
                "directory grant has an unsafe root".into(),
            ));
        }
        Ok(())
    }
    fn preflight(&self, private_root: &Path) -> Result<()> {
        self.validate(private_root)?;
        runtime_history::check_protected(private_root, &self.path)?;
        let canonical = std::fs::canonicalize(&self.path)
            .map_err(|_| HostError::Invalid("declared directory is unavailable".into()))?;
        if !same_host_path(&canonical, &self.path) || !canonical.is_dir() {
            return Err(HostError::Invalid(
                "directory must be an existing canonical directory".into(),
            ));
        }
        Ok(())
    }
    /// Validate the opened object, then give that same descriptor to Landlock.
    #[cfg(target_os = "linux")]
    pub(super) fn open(&self, private_root: &Path) -> Result<landlock::PathFd> {
        use std::os::fd::{AsFd, AsRawFd};
        self.validate(private_root)?;
        runtime_history::check_protected(private_root, &self.path)?;
        let descriptor = landlock::PathFd::new(&self.path).map_err(storage::unavailable)?;
        let actual =
            std::fs::read_link(format!("/proc/self/fd/{}", descriptor.as_fd().as_raw_fd()))
                .map_err(storage::unavailable)?;
        let file = std::fs::File::from(
            descriptor
                .as_fd()
                .try_clone_to_owned()
                .map_err(storage::unavailable)?,
        );
        if actual != self.path || !file.metadata().map_err(storage::unavailable)?.is_dir() {
            return Err(HostError::Invalid(
                "directory grant changed or is not canonical".into(),
            ));
        }
        runtime_history::check_protected(private_root, &actual)?;
        Ok(descriptor)
    }
}
pub(super) struct Directory {
    grant: Grant,
    private_root: PathBuf,
}
impl Directory {
    /// Immutable declaration only: no filesystem probe or new authority.
    pub fn declaration(&self) -> &Grant {
        &self.grant
    }
    pub fn requires_tree(&self) -> bool {
        matches!(self.grant.access, Access::ReadWriteExecute)
    }
    pub fn prepare(&self) -> Result<Grant> {
        self.grant.preflight(&self.private_root)?;
        Ok(self.grant.clone())
    }
}
pub(super) struct Factory {
    private_root: PathBuf,
}
impl Factory {
    pub fn new(private_root: PathBuf) -> Self {
        Self { private_root }
    }
}
fn config(value: &Value, private_root: &Path) -> Result<Grant> {
    let grant: Grant = serde_json::from_value(value.clone())
        .map_err(|_| HostError::Invalid("invalid directory resource".into()))?;
    grant.validate(private_root)?;
    Ok(grant)
}
impl ModuleFactory for Factory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: "resource.directory".into(),
            revision: "1".into(),
            kind: ModuleKind::Resource,
            config_schema: json!({"type":"object","additionalProperties":false,"required":["path","access"],"properties":{"path":{"type":"string","minLength":1,"maxLength":4096},"access":{"enum":["read_only","read_write","read_write_execute"]}}}),
            input_schema: None,
            output_schema: None,
            dependencies: Default::default(),
            required_capabilities: Default::default(),
        }
    }
    fn build(
        &self,
        value: &Value,
        _: &std::collections::BTreeMap<String, ModuleInstance>,
    ) -> std::result::Result<ModuleInstance, Error> {
        nofy_agent_runtime::settings::validate_json_value(&self.descriptor().config_schema, value)?;
        let grant =
            config(value, &self.private_root).map_err(|e| Error::Composition(e.to_string()))?;
        let identity = format!("directory-v1:{}", content_digest(&grant)?);
        Ok(ModuleInstance::Resource(Arc::new(ResourceHandle::new(
            identity,
            Arc::new(Directory {
                grant,
                private_root: self.private_root.clone(),
            }),
        )?)))
    }
}
/// Called only at persistent resource admission, never a read-only preview.
pub(super) fn preflight(document: &SystemDocument, private_root: &Path) -> Result<()> {
    for module in module_walk::collect(document)? {
        if module.factory == "resource.directory" {
            preflight_config(&module.config, private_root)?;
        }
    }
    Ok(())
}
pub(super) fn preflight_config(value: &Value, private_root: &Path) -> Result<()> {
    config(value, private_root)?.preflight(private_root)
}

#[cfg(test)]
mod path_prefix_tests {
    fn paths_overlap_with(syntax: nofy_host_path::Syntax, a: &str, b: &str) -> bool {
        syntax.starts_with(a, b) || syntax.starts_with(b, a)
    }

    fn same_path_with(syntax: nofy_host_path::Syntax, a: &str, b: &str) -> bool {
        syntax.starts_with(a, b) && syntax.starts_with(b, a)
    }

    #[test]
    fn windows_verbatim_and_plain_paths_agree_on_prefix_and_canonical_identity() {
        let win = nofy_host_path::Syntax::Windows;
        assert!(paths_overlap_with(
            win,
            r"C:\nofy\state\sub",
            r"\\?\c:\NOFY\state"
        ));
        assert!(paths_overlap_with(win, r"\\?\C:\nofy\state", r"C:\nofy"));
        assert!(!paths_overlap_with(
            win,
            r"C:\nofy\state-other",
            r"\\?\C:\nofy\state"
        ));
        assert!(same_path_with(win, r"\\?\C:\work\proj", r"C:\work\proj"));
        assert!(same_path_with(win, r"\\?\C:\work\proj", r"c:\WORK\PROJ"));
        assert!(!same_path_with(
            win,
            r"\\?\C:\work\proj\sub",
            r"C:\work\proj"
        ));
    }
}
