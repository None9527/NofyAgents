use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

/// One thing a backend can enforce on a confined command.
#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Capability {
    /// Files outside the granted paths cannot be read or written.
    Filesystem,
    /// Execution, not just reading, is refused outside the granted executable paths.
    ExecuteAllowlist,
    /// The command sees private read-only views of its dependencies, not the host tree.
    PrivateMounts,
    /// No network access at all.
    NetworkDeny,
    /// Only the loopback interface is reachable.
    NetworkLoopbackOnly,
    /// The command cannot start other processes.
    ProcessSpawnDeny,
    /// The command is killed when its parent dies.
    DieWithParent,
    /// Every process the command started is killed when it is closed.
    TreeKill,
    CpuLimit,
    MemoryLimit,
    ProcessCountLimit,
}

impl Capability {
    pub const ALL: [Capability; 11] = [
        Capability::Filesystem,
        Capability::ExecuteAllowlist,
        Capability::PrivateMounts,
        Capability::NetworkDeny,
        Capability::NetworkLoopbackOnly,
        Capability::ProcessSpawnDeny,
        Capability::DieWithParent,
        Capability::TreeKill,
        Capability::CpuLimit,
        Capability::MemoryLimit,
        Capability::ProcessCountLimit,
    ];

    /// The stable wire name, the same as the serialized form.
    pub fn name(self) -> &'static str {
        match self {
            Capability::Filesystem => "filesystem",
            Capability::ExecuteAllowlist => "execute_allowlist",
            Capability::PrivateMounts => "private_mounts",
            Capability::NetworkDeny => "network_deny",
            Capability::NetworkLoopbackOnly => "network_loopback_only",
            Capability::ProcessSpawnDeny => "process_spawn_deny",
            Capability::DieWithParent => "die_with_parent",
            Capability::TreeKill => "tree_kill",
            Capability::CpuLimit => "cpu_limit",
            Capability::MemoryLimit => "memory_limit",
            Capability::ProcessCountLimit => "process_count_limit",
        }
    }
}

/// How much of a capability a backend really delivers on this machine.
/// The order matters: `Unavailable < Partial < Enforced`.
#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Level {
    /// Not provided. The command would run without this protection.
    Unavailable,
    /// Provided with a known gap, described in the probe's note.
    Partial,
    /// Provided and enforced by the operating system.
    Enforced,
}

impl Level {
    pub fn name(self) -> &'static str {
        match self {
            Level::Unavailable => "unavailable",
            Level::Partial => "partial",
            Level::Enforced => "enforced",
        }
    }
}

/// What a backend delivers, per capability. A capability not listed is `Unavailable`.
#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(transparent)]
pub struct Capabilities(BTreeMap<Capability, Level>);

impl Capabilities {
    pub fn new() -> Self {
        Self::default()
    }
    pub fn with(mut self, capability: Capability, level: Level) -> Self {
        self.0.insert(capability, level);
        self
    }
    pub fn level(&self, capability: Capability) -> Level {
        self.0
            .get(&capability)
            .copied()
            .unwrap_or(Level::Unavailable)
    }
    pub fn iter(&self) -> impl Iterator<Item = (Capability, Level)> + '_ {
        Capability::ALL.into_iter().map(|c| (c, self.level(c)))
    }
}

/// A backend's account of itself, measured on the machine it runs on. This is
/// the only thing the gate trusts: it never decides from the operating system's name.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct Probe {
    pub backend: String,
    pub platform: String,
    pub capabilities: Capabilities,
    /// Why a capability is `Partial` or `Unavailable`, for the operator.
    #[serde(default, skip_serializing_if = "BTreeMap::is_empty")]
    pub notes: BTreeMap<Capability, String>,
}

impl Probe {
    pub fn new(backend: &str, platform: &str, capabilities: Capabilities) -> Self {
        Self {
            backend: backend.to_owned(),
            platform: platform.to_owned(),
            capabilities,
            notes: BTreeMap::new(),
        }
    }
    pub fn note(mut self, capability: Capability, text: &str) -> Self {
        self.notes.insert(capability, text.to_owned());
        self
    }
}
