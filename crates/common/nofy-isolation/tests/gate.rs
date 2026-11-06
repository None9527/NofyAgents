//! The properties every platform backend relies on: a confinement the backend
//! cannot enforce is refused, weaker enforcement is never accepted silently, and
//! there is no way to obtain a confined command without passing the gate.
use nofy_isolation::*;
use std::{
    collections::BTreeSet,
    path::PathBuf,
    sync::{
        Arc,
        atomic::{AtomicUsize, Ordering},
    },
};

fn command() -> Command {
    Command {
        program: PathBuf::from("/bin/tool"),
        args: vec!["--flag".into()],
        env: Default::default(),
        cwd: None,
    }
}

fn strict() -> Confinement {
    Confinement {
        filesystem: Some(Filesystem {
            read_only: vec!["/usr".into()],
            read_write: vec!["/work".into()],
            executable: vec!["/usr/bin".into()],
            private_mounts: false,
        }),
        network: Network::Denied,
        processes: Processes::Single,
        limits: Limits {
            cpu_seconds: Some(30),
            ..Limits::default()
        },
        die_with_parent: true,
        accept_partial: BTreeSet::new(),
    }
}

fn everything(level: Level) -> Capabilities {
    Capability::ALL
        .into_iter()
        .fold(Capabilities::new(), |c, cap| c.with(cap, level))
}

/// A backend that records whether it was ever asked to build a command.
struct Recording {
    name: &'static str,
    platform: &'static str,
    capabilities: Capabilities,
    built: Arc<AtomicUsize>,
}

impl Backend for Recording {
    fn name(&self) -> &'static str {
        self.name
    }
    fn platform(&self) -> &'static str {
        self.platform
    }
    fn probe(&self) -> Probe {
        Probe::new(self.name, self.platform, self.capabilities.clone())
    }
    fn confine(&self, command: Command, _: &Confinement) -> Result<ConfinedCommand, Error> {
        self.built.fetch_add(1, Ordering::SeqCst);
        Ok(ConfinedCommand {
            backend: self.name.into(),
            program: "/helper".into(),
            args: std::iter::once(command.program.into_os_string())
                .chain(command.args)
                .collect(),
            env: command.env,
            cwd: command.cwd,
        })
    }
}

fn recording(capabilities: Capabilities) -> (Recording, Arc<AtomicUsize>) {
    let built = Arc::new(AtomicUsize::new(0));
    (
        Recording {
            name: "test",
            platform: "any",
            capabilities,
            built: built.clone(),
        },
        built,
    )
}

#[test]
fn a_confinement_lists_exactly_what_it_needs() {
    let needed: Vec<_> = strict()
        .requirements()
        .iter()
        .map(|r| r.capability)
        .collect();
    assert_eq!(
        needed,
        [
            Capability::Filesystem,
            Capability::ExecuteAllowlist,
            Capability::NetworkDeny,
            Capability::ProcessSpawnDeny,
            Capability::DieWithParent,
            Capability::CpuLimit,
        ]
    );
    assert!(Confinement::default().requirements().is_empty());
    let loopback = Confinement {
        network: Network::LoopbackOnly,
        processes: Processes::Tree,
        ..Confinement::default()
    };
    let needed: Vec<_> = loopback
        .requirements()
        .iter()
        .map(|r| r.capability)
        .collect();
    assert_eq!(
        needed,
        [Capability::NetworkLoopbackOnly, Capability::TreeKill]
    );
}

#[test]
fn a_backend_that_enforces_everything_is_admitted() {
    let probe = Probe::new("full", "any", everything(Level::Enforced));
    assert_eq!(admit(&probe, &strict()), Ok(()));
}

#[test]
fn a_missing_capability_is_refused_with_the_code_and_the_reason() {
    let capabilities =
        everything(Level::Enforced).with(Capability::NetworkDeny, Level::Unavailable);
    let probe = Probe::new("weak", "macos", capabilities)
        .note(Capability::NetworkDeny, "Seatbelt profile not loaded");
    let refusal = admit(&probe, &strict()).unwrap_err();
    assert_eq!(refusal.shortfalls.len(), 1);
    let shortfall = &refusal.shortfalls[0];
    assert_eq!(shortfall.capability, Capability::NetworkDeny);
    assert_eq!(shortfall.required, Level::Enforced);
    assert_eq!(shortfall.available, Level::Unavailable);
    let text = refusal.to_string();
    for part in [
        ERROR_CODE,
        "`weak`",
        "network_deny",
        "needs enforced",
        "has unavailable",
        "Seatbelt profile not loaded",
    ] {
        assert!(text.contains(part), "{part} missing from: {text}");
    }
}

#[test]
fn every_shortfall_is_reported_not_just_the_first() {
    let probe = Probe::new("none", "any", Capabilities::new());
    let refusal = admit(&probe, &strict()).unwrap_err();
    assert_eq!(refusal.shortfalls.len(), strict().requirements().len());
}

#[test]
fn partial_enforcement_is_refused_unless_the_declaration_accepts_it() {
    let capabilities = everything(Level::Enforced).with(Capability::CpuLimit, Level::Partial);
    let probe = Probe::new("partial", "any", capabilities.clone());
    let refusal = admit(&probe, &strict()).unwrap_err();
    assert_eq!(refusal.shortfalls[0].capability, Capability::CpuLimit);
    assert_eq!(refusal.shortfalls[0].available, Level::Partial);

    let mut accepted = strict();
    accepted.accept_partial.insert(Capability::CpuLimit);
    assert_eq!(admit(&probe, &accepted), Ok(()));

    // Accepting Partial for one capability does not excuse another.
    let capabilities = capabilities.with(Capability::NetworkDeny, Level::Partial);
    let probe = Probe::new("partial", "any", capabilities);
    let refusal = admit(&probe, &accepted).unwrap_err();
    assert_eq!(refusal.shortfalls[0].capability, Capability::NetworkDeny);
    // And accepting Partial never excuses Unavailable.
    let probe = Probe::new("none", "any", Capabilities::new());
    assert!(admit(&probe, &accepted).is_err());
}

#[test]
fn launch_plan_never_calls_the_backend_when_it_refuses() {
    let (backend, built) = recording(Capabilities::new());
    let error = launch_plan(&backend, command(), &strict()).unwrap_err();
    assert!(matches!(error, Error::Refused(_)));
    assert_eq!(built.load(Ordering::SeqCst), 0, "the gate was skipped");
}

#[test]
fn launch_plan_hands_an_admitted_command_to_the_backend() {
    let (backend, built) = recording(everything(Level::Enforced));
    let plan = launch_plan(&backend, command(), &strict()).unwrap();
    assert_eq!(built.load(Ordering::SeqCst), 1);
    assert_eq!(plan.backend, "test");
    assert_eq!(plan.program, PathBuf::from("/helper"));
    assert_eq!(plan.args[0], "/bin/tool");
}

#[test]
fn the_unsupported_backend_refuses_every_real_confinement_and_passes_an_empty_one() {
    let backend = Unsupported::new("windows");
    assert_eq!(backend.probe().backend, "unsupported");
    assert!(
        backend
            .probe()
            .capabilities
            .iter()
            .all(|(_, level)| level == Level::Unavailable)
    );
    assert!(matches!(
        launch_plan(&backend, command(), &strict()),
        Err(Error::Refused(_))
    ));
    // Calling confine directly cannot go around the gate either.
    assert!(matches!(
        backend.confine(command(), &strict()),
        Err(Error::Refused(_))
    ));
    let plan = launch_plan(&backend, command(), &Confinement::default()).unwrap();
    assert_eq!(plan.program, PathBuf::from("/bin/tool"));
}

#[test]
fn the_registry_picks_by_name_or_by_platform_and_never_falls_back() {
    let here = current_platform();
    let other = if here == "linux" { "windows" } else { "linux" };
    let make = |name, platform| {
        Arc::new(Recording {
            name,
            platform,
            capabilities: Capabilities::new(),
            built: Arc::new(AtomicUsize::new(0)),
        })
    };
    let mut registry = Registry::new();
    registry.register(make("elsewhere", other)).unwrap();
    registry.register(make("local", here)).unwrap();
    registry.register(make("portable", "any")).unwrap();
    assert!(matches!(
        registry.register(make("local", here)),
        Err(SelectError::Duplicate(_))
    ));
    assert_eq!(registry.names(), ["elsewhere", "local", "portable"]);

    assert_eq!(registry.select(None).unwrap().name(), "local");
    assert_eq!(
        registry.select(Some("portable")).unwrap().name(),
        "portable"
    );
    assert!(matches!(
        registry.select(Some("elsewhere")),
        Err(SelectError::WrongPlatform { .. })
    ));
    assert!(matches!(
        registry.select(Some("nope")),
        Err(SelectError::Unknown(_))
    ));

    let mut empty = Registry::new();
    empty.register(make("elsewhere", other)).unwrap();
    assert_eq!(empty.select(None).err(), Some(SelectError::NoneFor(here)));
}

#[test]
fn the_probe_has_a_stable_wire_form() {
    let probe = Probe::new(
        "b",
        "linux",
        Capabilities::new().with(Capability::Filesystem, Level::Enforced),
    )
    .note(Capability::CpuLimit, "no cgroup");
    let wire = serde_json::to_value(&probe).unwrap();
    assert_eq!(
        wire,
        serde_json::json!({
            "backend": "b",
            "platform": "linux",
            "capabilities": {"filesystem": "enforced"},
            "notes": {"cpu_limit": "no cgroup"}
        })
    );
    let back: Probe = serde_json::from_value(wire).unwrap();
    assert_eq!(back, probe);
    // Names used on the wire are the same ones `name()` reports.
    for capability in Capability::ALL {
        assert_eq!(serde_json::to_value(capability).unwrap(), capability.name());
    }
}
