//! The one door a kernel-owned worker passes through before it starts.
//!
//! The scope, prompt, code and model workers and the tool launcher used to build
//! the helper's command line by hand and to gate on `cfg!(target_os = "linux")`.
//! A platform without the Linux helper then failed with the same generic message
//! as any other fault, and nothing could say what was missing. The command now
//! goes through [`nofy_isolation::launch_plan`]: what the worker needs is stated
//! as a [`Confinement`], the backend reports what it enforces on this machine,
//! and a launch the platform cannot honour is refused with the reason.
//!
//! `Command::program` is what the helper is asked to run: a worker mode such as
//! `--evaluate-model`, or a tool's program path. The wrapped command's own
//! program is the helper.
use super::*;
use nofy_isolation::{
    Backend, Capabilities, Capability, Command, ConfinedCommand, Confinement, Filesystem, Level,
    Limits, Network, Probe, Processes,
};
use std::{collections::BTreeMap, ffi::OsString};

/// The address-space ceiling the helper sets on every worker (`RLIMIT_AS`).
pub(super) const MEMORY_BYTES: u64 = 512 * 1024 * 1024;

/// What a worker profile asks for, in the platform-neutral vocabulary.
///
/// The scratch directory and the read-only paths are readable; only the named
/// scratch files and read-write directory grants are writable. Nothing may use
/// the network or start another process, and the worker dies with the host.
pub(super) fn confinement(profile: &isolation::Profile) -> Confinement {
    use super::directories::Access;
    let mut files = Filesystem::default();
    files.read_only.push(profile.scratch.clone());
    files.read_only.extend(profile.read_only.iter().cloned());
    files
        .read_write
        .extend(profile.scratch_files.iter().cloned());
    for mount in &profile.local_paths {
        files.read_only.push(mount.path.clone());
        if mount.execute {
            files.executable.push(mount.path.clone());
        }
    }
    for grant in &profile.directories {
        match grant.access {
            Access::ReadOnly => files.read_only.push(grant.path.clone()),
            Access::ReadWrite => files.read_write.push(grant.path.clone()),
            Access::ReadWriteExecute => {
                files.read_write.push(grant.path.clone());
                files.executable.push(grant.path.clone());
            }
        }
    }
    Confinement {
        filesystem: Some(files),
        network: Network::Denied,
        processes: Processes::Single,
        limits: Limits {
            cpu_seconds: Some(profile.cpu_seconds),
            memory_bytes: Some(MEMORY_BYTES),
            max_processes: None,
        },
        die_with_parent: true,
        accept_partial: Default::default(),
    }
}

/// What the single-process Linux helper delivers, given the Landlock ABI this
/// kernel offers. Landlock decides the filesystem; seccomp, `RLIMIT_*` and
/// `PDEATHSIG` need nothing beyond a kernel that accepts them, so they stand or
/// fall with the same check.
pub(super) fn linux_landlock_probe(abi: Option<u64>) -> Probe {
    const NAME: &str = "linux-landlock";
    let mut probe = Probe::new(NAME, "linux", Capabilities::new());
    match abi {
        Some(version) if version >= 3 => {
            let enforced = [
                Capability::Filesystem,
                Capability::ExecuteAllowlist,
                Capability::NetworkDeny,
                Capability::ProcessSpawnDeny,
                Capability::DieWithParent,
                Capability::CpuLimit,
                Capability::MemoryLimit,
            ];
            probe.capabilities = enforced
                .into_iter()
                .fold(Capabilities::new(), |c, cap| c.with(cap, Level::Enforced));
            probe
                .note(
                    Capability::ProtectedPaths,
                    "Landlock cannot express an exception inside a granted root",
                )
                .note(
                    Capability::PrivateMounts,
                    "single-process confinement has no mount namespace",
                )
                .note(
                    Capability::NetworkLoopbackOnly,
                    "the network is denied outright, not narrowed",
                )
                .note(
                    Capability::TreeKill,
                    "one process, no descendants to collect",
                )
                .note(
                    Capability::ProcessCountLimit,
                    "starting a process is refused instead of counted",
                )
        }
        Some(version) => probe.note(
            Capability::Filesystem,
            &format!("Landlock ABI 3 is required, this kernel offers {version}"),
        ),
        None => probe.note(
            Capability::Filesystem,
            "Landlock is missing or switched off on this kernel",
        ),
    }
}

/// What the kernel's own workers can be confined to on this machine, measured:
/// every capability with the level the backend really delivers, and the reason
/// for each one it does not. This is what discovery reports instead of a guess
/// from the operating system's name.
pub(crate) fn worker_probe() -> Probe {
    #[cfg(target_os = "linux")]
    {
        linux_landlock_probe(isolation::landlock_abi())
    }
    #[cfg(not(target_os = "linux"))]
    {
        nofy_isolation::Unsupported::new(nofy_isolation::current_platform()).probe()
    }
}

/// [`worker_probe`] in the shape discovery returns: a level for each of the
/// capabilities (an unlisted one is `unavailable`), and the notes.
pub(crate) fn worker_isolation_report() -> serde_json::Value {
    let probe = worker_probe();
    let levels: serde_json::Map<String, serde_json::Value> = probe
        .capabilities
        .iter()
        .map(|(capability, level)| (capability.name().to_owned(), level.name().into()))
        .collect();
    let notes: serde_json::Map<String, serde_json::Value> = probe
        .notes
        .iter()
        .map(|(capability, note)| (capability.name().to_owned(), note.clone().into()))
        .collect();
    serde_json::json!({
        "backend": probe.backend,
        "platform": probe.platform,
        "capabilities": levels,
        "notes": notes,
    })
}

/// The Linux backend for a single helper process that applies Landlock, seccomp
/// and resource limits to itself before it runs the program.
#[cfg(target_os = "linux")]
pub(super) struct LinuxLandlock {
    helper: PathBuf,
    profile: isolation::Profile,
    abi: Option<u64>,
}
#[cfg(target_os = "linux")]
impl LinuxLandlock {
    pub(super) fn new(helper: PathBuf, profile: &isolation::Profile) -> Self {
        Self {
            helper,
            profile: profile.clone(),
            abi: isolation::landlock_abi(),
        }
    }
}
#[cfg(target_os = "linux")]
impl Backend for LinuxLandlock {
    fn name(&self) -> &'static str {
        "linux-landlock"
    }
    fn platform(&self) -> &'static str {
        "linux"
    }
    fn probe(&self) -> Probe {
        linux_landlock_probe(self.abi)
    }
    fn confine(
        &self,
        command: Command,
        _: &Confinement,
    ) -> std::result::Result<ConfinedCommand, nofy_isolation::Error> {
        let wire = serde_json::to_string(&self.profile)
            .map_err(|error| nofy_isolation::Error::Failed(error.to_string()))?;
        let mut args = vec![
            OsString::from(isolation::WORKER_ARG),
            OsString::from(wire),
            command.program.into_os_string(),
        ];
        args.extend(command.args);
        Ok(ConfinedCommand {
            backend: "linux-landlock".into(),
            program: self.helper.clone(),
            args,
            env: command.env,
            cwd: command.cwd,
        })
    }
}

/// The confined command for a worker or a tool, or the reason this platform
/// cannot confine it. The profile is what the helper applies to itself; the
/// confinement derived from it is what the gate checks.
pub(super) fn worker_command(
    helper: PathBuf,
    profile: &isolation::Profile,
    program: impl Into<PathBuf>,
    args: Vec<OsString>,
    env: BTreeMap<OsString, OsString>,
    cwd: Option<PathBuf>,
) -> std::result::Result<ConfinedCommand, nofy_isolation::Error> {
    let policy = confinement(profile);
    let command = Command {
        program: program.into(),
        args,
        env,
        cwd,
    };
    #[cfg(target_os = "linux")]
    let backend = LinuxLandlock::new(helper, profile);
    #[cfg(not(target_os = "linux"))]
    let backend = {
        let _ = helper;
        nofy_isolation::Unsupported::new(nofy_isolation::current_platform())
    };
    nofy_isolation::launch_plan(&backend, command, &policy)
}

/// A worker command for the async supervisor. The caller owns the child.
pub(super) fn tokio_command(confined: ConfinedCommand) -> tokio::process::Command {
    let mut command = tokio::process::Command::new(confined.program);
    command.args(confined.args).env_clear().envs(confined.env);
    if let Some(cwd) = confined.cwd {
        command.current_dir(cwd);
    }
    command
}

/// A worker command for a short blocking run.
pub(super) fn std_command(confined: ConfinedCommand) -> std::process::Command {
    let mut command = std::process::Command::new(confined.program);
    command.args(confined.args).env_clear().envs(confined.env);
    if let Some(cwd) = confined.cwd {
        command.current_dir(cwd);
    }
    command
}

/// The refusal as the error callers return, keeping their own wording first.
pub(super) fn unavailable(what: &str, error: nofy_isolation::Error) -> HostError {
    HostError::Unavailable(format!("{what}: {error}"))
}

#[cfg(test)]
mod tests {
    use super::*;
    use nofy_isolation::{Unsupported, admit, launch_plan};

    fn profile() -> isolation::Profile {
        isolation::Profile {
            scratch: "/private/loader/scratch/job".into(),
            scratch_files: vec!["/private/loader/scratch/job/out".into()],
            read_only: vec!["/usr/share/dict".into()],
            local_paths: vec![],
            directories: vec![],
            private_root: "/private".into(),
            parent_pid: 7,
            cpu_seconds: 5,
            environment: Default::default(),
            cache_lease: None,
        }
    }

    #[test]
    fn a_worker_is_confined_to_its_scratch_with_no_network_and_no_children() {
        let policy = confinement(&profile());
        let files = policy.filesystem.as_ref().expect("filesystem is confined");
        assert_eq!(
            files.read_only,
            vec![
                PathBuf::from("/private/loader/scratch/job"),
                PathBuf::from("/usr/share/dict")
            ]
        );
        assert_eq!(
            files.read_write,
            vec![PathBuf::from("/private/loader/scratch/job/out")]
        );
        assert!(files.executable.is_empty() && files.protected.is_empty());
        assert_eq!(policy.network, Network::Denied);
        assert_eq!(policy.processes, Processes::Single);
        assert_eq!(policy.limits.cpu_seconds, Some(5));
        assert_eq!(policy.limits.memory_bytes, Some(MEMORY_BYTES));
        assert!(policy.die_with_parent && policy.accept_partial.is_empty());
    }

    #[test]
    fn directory_grants_and_executable_mounts_keep_their_meaning() {
        use super::super::directories::{Access, Grant};
        let mut profile = profile();
        profile.directories = vec![
            Grant {
                path: "/data/in".into(),
                access: Access::ReadOnly,
            },
            Grant {
                path: "/data/out".into(),
                access: Access::ReadWrite,
            },
        ];
        profile.local_paths = vec![
            super::super::local::Mount {
                path: "/opt/env".into(),
                execute: true,
            },
            super::super::local::Mount {
                path: "/opt/data".into(),
                execute: false,
            },
        ];
        let files = confinement(&profile).filesystem.unwrap();
        assert!(files.read_only.contains(&PathBuf::from("/data/in")));
        assert!(files.read_write.contains(&PathBuf::from("/data/out")));
        assert!(files.read_only.contains(&PathBuf::from("/opt/env")));
        assert!(files.read_only.contains(&PathBuf::from("/opt/data")));
        assert_eq!(files.executable, vec![PathBuf::from("/opt/env")]);
    }

    #[test]
    fn a_kernel_with_landlock_abi_three_or_later_admits_a_worker() {
        for version in [3, 4, 7] {
            let probe = linux_landlock_probe(Some(version));
            admit(&probe, &confinement(&profile()))
                .unwrap_or_else(|refusal| panic!("ABI {version}: {refusal}"));
        }
    }

    #[test]
    fn without_landlock_abi_three_the_worker_is_refused_and_says_why() {
        for (abi, reason) in [
            (Some(2), "this kernel offers 2"),
            (None, "missing or switched off"),
        ] {
            let refusal = admit(&linux_landlock_probe(abi), &confinement(&profile()))
                .expect_err("must refuse");
            let text = refusal.to_string();
            assert!(text.contains("isolation_unavailable"), "{text}");
            assert!(text.contains("filesystem"), "{text}");
            assert!(text.contains(reason), "{text}");
        }
    }

    #[test]
    fn the_linux_backend_does_not_claim_what_it_cannot_enforce() {
        let probe = linux_landlock_probe(Some(3));
        for missing in [
            Capability::ProtectedPaths,
            Capability::PrivateMounts,
            Capability::NetworkLoopbackOnly,
            Capability::TreeKill,
            Capability::ProcessCountLimit,
        ] {
            assert_eq!(probe.capabilities.level(missing), Level::Unavailable);
            assert!(probe.notes.contains_key(&missing), "{missing:?}");
        }
        // A workspace that must keep `.git/hooks` unwritable cannot run here.
        let mut policy = confinement(&profile());
        let files = policy.filesystem.as_mut().unwrap();
        files.read_write.push("/work".into());
        files.protect_mandatory();
        assert!(admit(&probe, &policy).is_err());
    }

    #[test]
    fn a_platform_without_a_backend_refuses_a_worker_by_name() {
        let command = Command {
            program: "--evaluate-model".into(),
            args: vec![],
            env: Default::default(),
            cwd: None,
        };
        let refusal = launch_plan(
            &Unsupported::new("macos"),
            command,
            &confinement(&profile()),
        )
        .expect_err("no backend");
        let text = refusal.to_string();
        assert!(text.contains("isolation_unavailable"), "{text}");
        assert!(text.contains("unsupported"), "{text}");
        assert!(text.contains("network_deny"), "{text}");
    }

    #[test]
    fn discovery_reports_a_level_for_every_capability_and_a_reason_for_each_gap() {
        let report = worker_isolation_report();
        let levels = report["capabilities"].as_object().expect("levels");
        assert_eq!(levels.len(), Capability::ALL.len());
        for capability in Capability::ALL {
            let level = levels[capability.name()].as_str().expect("a level name");
            assert!(
                ["unavailable", "partial", "enforced"].contains(&level),
                "{level}"
            );
            if level != "enforced" {
                assert!(
                    report["notes"].get(capability.name()).is_some()
                        || report["backend"] == "unsupported",
                    "{} is {level} without a reason",
                    capability.name()
                );
            }
        }
        assert_eq!(report["platform"], nofy_isolation::current_platform());
    }

    #[cfg(target_os = "linux")]
    #[test]
    fn the_linux_backend_builds_the_command_line_the_helper_expects() {
        let profile = profile();
        let backend = LinuxLandlock {
            helper: "/bin/nofy-helper".into(),
            profile: profile.clone(),
            abi: Some(3),
        };
        let confined = launch_plan(
            &backend,
            Command {
                program: "--evaluate-model".into(),
                args: vec![],
                env: Default::default(),
                cwd: None,
            },
            &confinement(&profile),
        )
        .expect("admitted");
        assert_eq!(confined.backend, "linux-landlock");
        assert_eq!(confined.program, PathBuf::from("/bin/nofy-helper"));
        // The shape every worker used before it went through the gate:
        // helper, entry marker, the profile as JSON, then what to run.
        assert_eq!(
            confined.args,
            vec![
                OsString::from(isolation::WORKER_ARG),
                OsString::from(serde_json::to_string(&profile).unwrap()),
                OsString::from("--evaluate-model"),
            ]
        );
        assert!(confined.env.is_empty() && confined.cwd.is_none());
    }

    #[cfg(target_os = "linux")]
    #[test]
    fn a_backend_that_cannot_confine_never_builds_a_command() {
        let backend = LinuxLandlock {
            helper: "/bin/nofy-helper".into(),
            profile: profile(),
            abi: None,
        };
        let refusal = launch_plan(
            &backend,
            Command {
                program: "--evaluate-model".into(),
                args: vec![],
                env: Default::default(),
                cwd: None,
            },
            &confinement(&profile()),
        );
        assert!(matches!(refusal, Err(nofy_isolation::Error::Refused(_))));
    }
}
