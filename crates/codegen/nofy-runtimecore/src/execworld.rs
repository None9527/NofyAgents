//! Execution worlds: local / docker / ssh (FR6.10, HM env family).
//!
//! An execution world is WHERE tool effects land. Discipline:
//!
//! - **default-off**: a fresh registry contains ONLY the local world —
//!   docker/ssh worlds exist only after explicit registration;
//! - **fail-closed routing**: execution routed at an unknown world is
//!   refused;
//! - **capability narrowing**: a non-local world may only NARROW the
//!   local capability set, never widen it.

/// The kind of execution world.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum WorldKind {
    Local,
    Docker,
    Ssh,
}

/// World specification.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum WorldSpec {
    Local,
    Docker { image: String },
    Ssh { host: String },
}

/// One registered execution world.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ExecWorld {
    pub id: String,
    pub spec: WorldSpec,
}

/// Capabilities an execution world may exercise.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Capabilities {
    pub fs_write: bool,
    pub network_out: bool,
    pub spawn_processes: bool,
}

impl Capabilities {
    /// The local baseline.
    pub fn local_baseline() -> Self {
        Self { fs_write: true, network_out: true, spawn_processes: true }
    }

    /// Narrowing check: `self` must not exceed `baseline` on any axis.
    pub fn narrows(&self, baseline: &Capabilities) -> bool {
        (!self.fs_write || baseline.fs_write)
            && (!self.network_out || baseline.network_out)
            && (!self.spawn_processes || baseline.spawn_processes)
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum WorldError {
    EmptyId,
    EmptyImage,
    EmptyHost,
    DuplicateWorld(String),
    /// Non-local world tries to widen past the local baseline.
    CapabilityWidening { world: String },
    /// Routing at an unknown world.
    UnknownWorld(String),
}

/// The world registry. Construction inserts ONLY the local world;
/// `local_caps` is the baseline every other world must narrow.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct WorldRegistry {
    worlds: Vec<ExecWorld>,
    local_caps: Capabilities,
}

impl Default for WorldRegistry {
    fn default() -> Self {
        Self::new(Capabilities::local_baseline())
    }
}

impl WorldRegistry {
    /// Build a registry whose local world carries `local_caps` (a host
    /// may start narrowed; every added world narrows further).
    pub fn new(local_caps: Capabilities) -> Self {
        Self {
            worlds: vec![ExecWorld { id: "local".into(), spec: WorldSpec::Local }],
            local_caps,
        }
    }

    fn register(&mut self, world: ExecWorld) -> Result<(), WorldError> {
        if world.id.trim().is_empty() {
            return Err(WorldError::EmptyId);
        }
        if self.worlds.iter().any(|w| w.id == world.id) {
            return Err(WorldError::DuplicateWorld(world.id));
        }
        self.worlds.push(world);
        Ok(())
    }

    /// Register a docker world (explicit opt-in). Its capabilities must
    /// narrow the local baseline.
    pub fn register_docker(&mut self, id: &str, image: &str, caps: Capabilities) -> Result<(), WorldError> {
        if image.trim().is_empty() {
            return Err(WorldError::EmptyImage);
        }
        if !caps.narrows(&self.local_caps) {
            return Err(WorldError::CapabilityWidening { world: id.to_string() });
        }
        self.register(ExecWorld { id: id.into(), spec: WorldSpec::Docker { image: image.into() } })
    }

    /// Register an ssh world (explicit opt-in). Its capabilities must
    /// narrow the local baseline.
    pub fn register_ssh(&mut self, id: &str, host: &str, caps: Capabilities) -> Result<(), WorldError> {
        if host.trim().is_empty() {
            return Err(WorldError::EmptyHost);
        }
        if !caps.narrows(&self.local_caps) {
            return Err(WorldError::CapabilityWidening { world: id.to_string() });
        }
        self.register(ExecWorld { id: id.into(), spec: WorldSpec::Ssh { host: host.into() } })
    }

    /// Route execution at a world. Unknown worlds are refused.
    pub fn route(&self, world_id: &str) -> Result<&ExecWorld, WorldError> {
        self.worlds
            .iter()
            .find(|w| w.id == world_id)
            .ok_or_else(|| WorldError::UnknownWorld(world_id.to_string()))
    }

    /// Registered world ids (deterministic order).
    pub fn world_ids(&self) -> Vec<String> {
        self.worlds.iter().map(|w| w.id.clone()).collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn narrow_caps() -> Capabilities {
        Capabilities { fs_write: true, network_out: false, spawn_processes: true }
    }

    #[test]
    fn default_registry_is_local_only() {
        let registry = WorldRegistry::default();
        assert_eq!(registry.world_ids(), vec!["local".to_string()]);
        assert_eq!(registry.route("local").unwrap().spec, WorldSpec::Local);
    }

    #[test]
    fn docker_and_ssh_worlds_require_explicit_registration() {
        let mut registry = WorldRegistry::default();
        registry.register_docker("build-box", "rust:1.85", narrow_caps()).unwrap();
        registry.register_ssh("remote-host", "ci.internal", narrow_caps()).unwrap();
        assert_eq!(registry.world_ids(), vec!["local", "build-box", "remote-host"]);
        assert_eq!(
            registry.route("build-box").unwrap().spec,
            WorldSpec::Docker { image: "rust:1.85".into() }
        );
        assert_eq!(
            registry.route("remote-host").unwrap().spec,
            WorldSpec::Ssh { host: "ci.internal".into() }
        );
    }

    #[test]
    fn routing_unknown_worlds_fails_closed() {
        let registry = WorldRegistry::default();
        assert_eq!(registry.route("ghost"), Err(WorldError::UnknownWorld("ghost".into())));
    }

    #[test]
    fn malformed_worlds_refused() {
        let mut registry = WorldRegistry::default();
        assert_eq!(
            registry.register_docker("x", "  ", narrow_caps()),
            Err(WorldError::EmptyImage)
        );
        assert_eq!(
            registry.register_ssh("x", "", narrow_caps()),
            Err(WorldError::EmptyHost)
        );
        assert_eq!(
            registry.register_docker("  ", "img", narrow_caps()),
            Err(WorldError::EmptyId)
        );
        registry.register_docker("dup", "img", narrow_caps()).unwrap();
        assert_eq!(
            registry.register_ssh("dup", "host", narrow_caps()),
            Err(WorldError::DuplicateWorld("dup".into()))
        );
    }

    #[test]
    fn non_local_worlds_can_only_narrow_capabilities() {
        // A host whose local world has no outbound network.
        let narrowed_baseline = Capabilities { fs_write: true, network_out: false, spawn_processes: true };
        let mut registry = WorldRegistry::new(narrowed_baseline);
        // Narrowing further is fine.
        let less = Capabilities { fs_write: false, network_out: false, spawn_processes: true };
        registry.register_docker("quiet", "img", less).unwrap();
        // Widening past the local baseline is refused.
        let more = Capabilities { fs_write: true, network_out: true, spawn_processes: true };
        assert_eq!(
            registry.register_ssh("loud", "host", more),
            Err(WorldError::CapabilityWidening { world: "loud".into() })
        );
        assert_eq!(
            registry.register_docker("loud2", "img", more),
            Err(WorldError::CapabilityWidening { world: "loud2".into() })
        );
    }

    #[test]
    fn narrows_is_axis_wise() {
        let baseline = Capabilities { fs_write: false, network_out: true, spawn_processes: false };
        assert!(Capabilities { fs_write: false, network_out: true, spawn_processes: false }.narrows(&baseline));
        assert!(!Capabilities { fs_write: true, network_out: true, spawn_processes: false }.narrows(&baseline));
        assert!(!Capabilities { fs_write: false, network_out: true, spawn_processes: true }.narrows(&baseline));
    }
}
