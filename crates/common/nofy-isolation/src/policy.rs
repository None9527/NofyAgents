use crate::capability::{Capability, Level};
use serde::{Deserialize, Serialize};
use std::{collections::BTreeSet, path::PathBuf};

/// Which files the command may touch. Anything not listed is out of reach.
#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct Filesystem {
    pub read_only: Vec<PathBuf>,
    pub read_write: Vec<PathBuf>,
    /// Paths the command may execute from. Empty means execution is not
    /// restricted separately from reading.
    pub executable: Vec<PathBuf>,
    /// The command sees private read-only views of its dependencies, not the host tree.
    pub private_mounts: bool,
}

#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Network {
    #[default]
    Unrestricted,
    LoopbackOnly,
    Denied,
}

#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Processes {
    #[default]
    Unrestricted,
    /// The command may not start other processes.
    Single,
    /// The command may start processes, and all of them are killed when it closes.
    Tree,
}

#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct Limits {
    pub cpu_seconds: Option<u64>,
    pub memory_bytes: Option<u64>,
    pub max_processes: Option<u32>,
}

/// What a command must be held to. This says nothing about how: choosing and
/// applying the platform mechanism is the backend's job.
#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct Confinement {
    /// `None` leaves the filesystem unrestricted.
    pub filesystem: Option<Filesystem>,
    pub network: Network,
    pub processes: Processes,
    pub limits: Limits,
    pub die_with_parent: bool,
    /// Capabilities for which the declarer knowingly accepts `Partial`
    /// enforcement. Every other requirement must be `Enforced`.
    pub accept_partial: BTreeSet<Capability>,
}

/// One capability the confinement needs, and the least level that will do.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Requirement {
    pub capability: Capability,
    pub minimum: Level,
}

impl Confinement {
    /// Everything the confinement needs from a backend. An empty list means the
    /// command asks for no protection at all.
    pub fn requirements(&self) -> Vec<Requirement> {
        let mut needed = Vec::new();
        if let Some(files) = &self.filesystem {
            needed.push(Capability::Filesystem);
            if !files.executable.is_empty() {
                needed.push(Capability::ExecuteAllowlist);
            }
            if files.private_mounts {
                needed.push(Capability::PrivateMounts);
            }
        }
        match self.network {
            Network::Unrestricted => {}
            Network::LoopbackOnly => needed.push(Capability::NetworkLoopbackOnly),
            Network::Denied => needed.push(Capability::NetworkDeny),
        }
        match self.processes {
            Processes::Unrestricted => {}
            Processes::Single => needed.push(Capability::ProcessSpawnDeny),
            Processes::Tree => needed.push(Capability::TreeKill),
        }
        if self.die_with_parent {
            needed.push(Capability::DieWithParent);
        }
        if self.limits.cpu_seconds.is_some() {
            needed.push(Capability::CpuLimit);
        }
        if self.limits.memory_bytes.is_some() {
            needed.push(Capability::MemoryLimit);
        }
        if self.limits.max_processes.is_some() {
            needed.push(Capability::ProcessCountLimit);
        }
        needed
            .into_iter()
            .map(|capability| Requirement {
                capability,
                minimum: if self.accept_partial.contains(&capability) {
                    Level::Partial
                } else {
                    Level::Enforced
                },
            })
            .collect()
    }
}
