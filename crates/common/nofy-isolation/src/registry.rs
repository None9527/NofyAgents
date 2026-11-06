use crate::backend::Backend;
use std::sync::Arc;

/// The operating system this binary runs on: `linux`, `macos` or `windows`.
pub fn current_platform() -> &'static str {
    std::env::consts::OS
}

#[derive(Debug, PartialEq, Eq, thiserror::Error)]
pub enum SelectError {
    #[error("no isolation backend is registered under the name `{0}`")]
    Unknown(String),
    #[error("isolation backend `{name}` is for {backend}, not {current}")]
    WrongPlatform {
        name: String,
        backend: &'static str,
        current: &'static str,
    },
    #[error("no isolation backend is registered for {0}")]
    NoneFor(&'static str),
    #[error("an isolation backend named `{0}` is already registered")]
    Duplicate(String),
}

/// The backends a program knows about. Which to use is an explicit choice, or the
/// first one registered for the current platform; there is no silent fallback.
#[derive(Default)]
pub struct Registry {
    backends: Vec<Arc<dyn Backend>>,
}

impl Registry {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn register(&mut self, backend: Arc<dyn Backend>) -> Result<&mut Self, SelectError> {
        if self.backends.iter().any(|b| b.name() == backend.name()) {
            return Err(SelectError::Duplicate(backend.name().to_owned()));
        }
        self.backends.push(backend);
        Ok(self)
    }

    pub fn names(&self) -> Vec<&'static str> {
        self.backends.iter().map(|b| b.name()).collect()
    }

    /// With a name: that backend, which must be for this platform (or `any`).
    /// Without: the first registered backend for this platform.
    pub fn select(&self, name: Option<&str>) -> Result<Arc<dyn Backend>, SelectError> {
        let current = current_platform();
        match name {
            Some(wanted) => {
                let backend = self
                    .backends
                    .iter()
                    .find(|b| b.name() == wanted)
                    .ok_or_else(|| SelectError::Unknown(wanted.to_owned()))?;
                if backend.platform() != current && backend.platform() != "any" {
                    return Err(SelectError::WrongPlatform {
                        name: wanted.to_owned(),
                        backend: backend.platform(),
                        current,
                    });
                }
                Ok(backend.clone())
            }
            None => self
                .backends
                .iter()
                .find(|b| b.platform() == current)
                .cloned()
                .ok_or(SelectError::NoneFor(current)),
        }
    }
}
