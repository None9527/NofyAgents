//! User-provisioned dependencies: path authority, never an installation lock.
use super::*;
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

pub(super) const FACTORY: &str = "resource.process_local";

#[derive(Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub(super) struct Mount {
    pub path: PathBuf,
    #[serde(default)]
    pub execute: bool,
}

fn absolute(path: &Path) -> Result<()> {
    if path.to_str().is_none_or(|s| {
        !s.starts_with('/')
            || s.len() > 4096
            || s.contains('\\')
            || s.chars().any(char::is_control)
            || s[1..].split('/').any(|p| matches!(p, "" | "." | ".."))
    }) {
        return Err(HostError::Invalid(
            "local environment requires normalized absolute paths".into(),
        ));
    }
    Ok(())
}

fn public(path: &Path, private_root: &Path) -> Result<()> {
    absolute(path)?;
    if path.starts_with(private_root)
        || private_root.starts_with(path)
        || path == Path::new("/tmp")
        || ["/nofy", "/proc", "/sys", "/dev", "/run"]
            .iter()
            .any(|p| path.starts_with(p))
    {
        return Err(HostError::Invalid(
            "local dependency exposes a reserved or private root".into(),
        ));
    }
    Ok(())
}

impl Mount {
    pub fn validate(&self, private_root: &Path) -> Result<()> {
        public(&self.path, private_root)
    }
    pub fn resolved(&self, private_root: &Path) -> Result<PathBuf> {
        self.validate(private_root)?;
        let path = std::fs::canonicalize(&self.path)
            .map_err(|_| HostError::Invalid("declared local dependency is unavailable".into()))?;
        public(&path, private_root)?;
        runtime_history::check_protected(private_root, &path)?;
        Ok(path)
    }
    #[cfg(target_os = "linux")]
    pub fn open(&self, private_root: &Path) -> Result<std::fs::File> {
        use std::os::{fd::AsRawFd, unix::fs::OpenOptionsExt};
        let path = self.resolved(private_root)?;
        let file = std::fs::OpenOptions::new()
            .read(true)
            .custom_flags(libc::O_PATH | libc::O_NOFOLLOW | libc::O_CLOEXEC)
            .open(&path)
            .map_err(storage::unavailable)?;
        let actual = std::fs::read_link(format!("/proc/self/fd/{}", file.as_raw_fd()))
            .map_err(storage::unavailable)?;
        let meta = file.metadata().map_err(storage::unavailable)?;
        if actual != path || !(meta.is_dir() || meta.is_file()) {
            return Err(HostError::Invalid(
                "local dependency changed or is not a regular file/directory".into(),
            ));
        }
        Ok(file)
    }
}

pub(super) fn validate_paths(paths: &[Mount], private_root: &Path) -> Result<()> {
    if paths.is_empty() || paths.len() > 32 {
        return Err(HostError::Invalid(
            "local environment requires 1..32 explicit dependency paths".into(),
        ));
    }
    for (index, mount) in paths.iter().enumerate() {
        mount.validate(private_root)?;
        if paths[..index]
            .iter()
            .any(|p| mount.path.starts_with(&p.path) || p.path.starts_with(&mount.path))
        {
            return Err(HostError::Invalid(
                "local dependency paths must not overlap".into(),
            ));
        }
    }
    Ok(())
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub(super) struct Config {
    pub executable: PathBuf,
    #[serde(default)]
    pub prefix_args: Vec<String>,
    #[serde(default)]
    pub env: BTreeMap<String, String>,
    pub paths: Vec<Mount>,
}
impl Config {
    pub fn validate(&self, private_root: &Path) -> Result<()> {
        public(&self.executable, private_root)?;
        if self.paths.is_empty()
            || self.paths.len() > 32
            || self.prefix_args.len() > 32
            || self
                .prefix_args
                .iter()
                .any(|a| a.len() > 4096 || a.contains('\0'))
            || self.env.len() > 32
            || self
                .env
                .iter()
                .map(|(k, v)| k.len() + v.len())
                .sum::<usize>()
                > 32768
            || self.env.iter().any(|(k, v)| {
                k.is_empty()
                    || k.starts_with(directories::ENV_PREFIX)
                    || !k.bytes().enumerate().all(|(i, b)| {
                        b.is_ascii_alphabetic() || b == b'_' || i > 0 && b.is_ascii_digit()
                    })
                    || v.contains('\0')
            })
        {
            return Err(HostError::Invalid(
                "invalid local environment arguments, paths or variables".into(),
            ));
        }
        validate_paths(&self.paths, private_root)?;
        if !self
            .paths
            .iter()
            .any(|m| m.execute && self.executable.starts_with(&m.path))
        {
            return Err(HostError::Invalid(
                "local executable requires an explicit executable path grant".into(),
            ));
        }
        Ok(())
    }
    pub fn preflight(&self, private_root: &Path) -> Result<()> {
        self.validate(private_root)?;
        let mut executable = Vec::new();
        for mount in &self.paths {
            #[cfg(target_os = "linux")]
            let _file = mount.open(private_root)?;
            let path = mount.resolved(private_root)?;
            if mount.execute {
                executable.push(path);
            }
        }
        let program = std::fs::canonicalize(&self.executable)
            .map_err(|_| HostError::Invalid("declared local executable is unavailable".into()))?;
        public(&program, private_root)?;
        runtime_history::check_protected(private_root, &program)?;
        if !program.is_file() || !executable.iter().any(|p| program.starts_with(p)) {
            return Err(HostError::Invalid(
                "local executable resolves outside its execution grants".into(),
            ));
        }
        Ok(())
    }
}

pub(super) fn config(value: &serde_json::Value, private_root: &Path) -> Result<Config> {
    let config: Config = serde_json::from_value(value.clone())
        .map_err(|_| HostError::Invalid("invalid local environment configuration".into()))?;
    config.validate(private_root)?;
    Ok(config)
}

pub(super) fn schema() -> serde_json::Value {
    serde_json::json!({"type":"object","additionalProperties":false,"required":["executable","paths"],"properties":{
        "executable":{"type":"string","minLength":1,"maxLength":4096},
        "prefix_args":{"type":"array","maxItems":32,"items":{"type":"string","maxLength":4096}},
        "env":{"type":"object","maxProperties":32,"additionalProperties":{"type":"string"}},
        "paths":{"type":"array","minItems":1,"maxItems":32,"items":{"type":"object","additionalProperties":false,"required":["path"],"properties":{
            "path":{"type":"string","minLength":1,"maxLength":4096},"execute":{"type":"boolean"}}}}
    }})
}

pub(super) fn preflight(document: &SystemDocument, private_root: &Path) -> Result<()> {
    for module in module_walk::collect(document)? {
        if module.factory == FACTORY {
            config(&module.config, private_root)?.preflight(private_root)?;
        }
    }
    Ok(())
}

#[cfg(all(test, target_os = "linux"))]
mod tests;
