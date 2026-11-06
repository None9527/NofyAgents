use crate::capability::{Capabilities, Probe};
use crate::gate::{Refusal, admit};
use crate::policy::Confinement;
use std::{collections::BTreeMap, ffi::OsString, path::PathBuf};

/// A command as the caller means it, before any confinement is applied.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Command {
    pub program: PathBuf,
    pub args: Vec<OsString>,
    pub env: BTreeMap<OsString, OsString>,
    pub cwd: Option<PathBuf>,
}

/// The command that actually runs: the original wrapped by whatever the backend
/// needs (a helper executable, a profile argument, a restricted launcher).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ConfinedCommand {
    /// The backend that produced it, for diagnostics and receipts.
    pub backend: String,
    pub program: PathBuf,
    pub args: Vec<OsString>,
    pub env: BTreeMap<OsString, OsString>,
    pub cwd: Option<PathBuf>,
}

#[derive(Debug, thiserror::Error)]
pub enum Error {
    /// The backend cannot enforce what was asked.
    #[error("{0}")]
    Refused(#[from] Refusal),
    /// The backend could enforce it but failed to prepare the command.
    #[error("isolation backend failed: {0}")]
    Failed(String),
}

/// One platform's way of confining a command.
pub trait Backend: Send + Sync {
    /// A stable name, used for selection and in receipts, such as `linux-landlock`.
    fn name(&self) -> &'static str;
    /// The operating system it is for: `linux`, `macos`, `windows`, or `any`.
    fn platform(&self) -> &'static str;
    /// What it really enforces on this machine. Measure it; do not assume it.
    fn probe(&self) -> Probe;
    /// Build the confined command. Callers go through [`launch_plan`], which has
    /// already checked the confinement against [`Backend::probe`].
    fn confine(&self, command: Command, policy: &Confinement) -> Result<ConfinedCommand, Error>;
}

/// The one way to ask a backend for a command: refuse first if the backend
/// cannot enforce what the confinement needs, otherwise let it build the command.
pub fn launch_plan(
    backend: &dyn Backend,
    command: Command,
    policy: &Confinement,
) -> Result<ConfinedCommand, Error> {
    admit(&backend.probe(), policy)?;
    backend.confine(command, policy)
}

/// The backend for a platform that has none. It enforces nothing, so it admits
/// only a command that asks for nothing; every real confinement is refused.
pub struct Unsupported {
    platform: &'static str,
}

impl Unsupported {
    pub fn new(platform: &'static str) -> Self {
        Self { platform }
    }
}

impl Backend for Unsupported {
    fn name(&self) -> &'static str {
        "unsupported"
    }
    fn platform(&self) -> &'static str {
        self.platform
    }
    fn probe(&self) -> Probe {
        Probe::new("unsupported", self.platform, Capabilities::new())
    }
    fn confine(&self, command: Command, policy: &Confinement) -> Result<ConfinedCommand, Error> {
        // Checked again here, so calling `confine` directly cannot slip past the gate.
        admit(&self.probe(), policy)?;
        Ok(ConfinedCommand {
            backend: "unsupported".into(),
            program: command.program,
            args: command.args,
            env: command.env,
            cwd: command.cwd,
        })
    }
}
