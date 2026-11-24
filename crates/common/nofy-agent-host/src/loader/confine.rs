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
    Limits, MANDATORY_PROTECTED, Network, Probe, Processes, Registry,
};
use std::{
    collections::{BTreeMap, BTreeSet},
    ffi::OsString,
};

/// The address-space ceiling the helper sets on every worker (`RLIMIT_AS`).
pub(super) const MEMORY_BYTES: u64 = 512 * 1024 * 1024;

/// What a worker profile asks for, in the platform-neutral vocabulary.
///
/// The scratch directory and the read-only paths are readable; only the named
/// scratch files and read-write directory grants are writable. Nothing may use
/// the network or start another process, and the worker dies with the host.
///
/// Linux single-process Landlock ABI3 cannot express negative exceptions inside
/// a granted root (`Capability::ProtectedPaths` is `Unavailable`), so this base
/// mapping leaves `files.protected` empty for the single-process Landlock path.
/// Backends and workspace modes that enforce protected subpaths (process-tree,
/// macOS Seatbelt, Windows T1) use [`protected_confinement`], which calls
/// [`Filesystem::protect_mandatory`].
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

/// [`confinement`] with [`Filesystem::protect_mandatory`] explicitly applied so
/// every writable root protects `.git/hooks`, `.git/config`, shell startup
/// files, and editor config (matching process-tree and cross-platform host-view
/// backend protection policy).
#[cfg_attr(target_os = "linux", allow(dead_code))]
pub(super) fn protected_confinement(profile: &isolation::Profile) -> Confinement {
    let mut policy = confinement(profile);
    if let Some(files) = policy.filesystem.as_mut() {
        files.protect_mandatory();
    }
    policy
}

/// What the single-process Linux helper delivers, given the Landlock ABI this
/// kernel offers. Landlock decides the filesystem; seccomp, `RLIMIT_*` and
/// `PDEATHSIG` need nothing beyond a kernel that accepts them, so they stand or
/// fall with the same check.
#[cfg_attr(not(target_os = "linux"), allow(dead_code))]
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

/// Platform-native isolation backends registered for this host.
///
/// Linux single-process workers carry a per-launch helper/profile pair and
/// construct [`LinuxLandlock`] directly; macOS and Windows register their
/// host-view backends here so discovery and launch go through [`Registry`].
#[cfg_attr(target_os = "linux", allow(dead_code))]
pub(crate) fn platform_registry() -> Registry {
    #[cfg_attr(target_os = "linux", allow(unused_mut))]
    let mut registry = Registry::new();
    #[cfg(target_os = "macos")]
    {
        let _ = registry.register(Arc::new(seatbelt::MacosSeatbeltBackend::new()));
    }
    #[cfg(target_os = "windows")]
    {
        let _ = registry.register(Arc::new(windows_t1::WindowsT1Backend::new()));
    }
    #[cfg(not(any(target_os = "linux", target_os = "macos", target_os = "windows")))]
    {
        let _ = registry.register(Arc::new(nofy_isolation::Unsupported::new(
            nofy_isolation::current_platform(),
        )));
    }
    registry
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
        platform_registry()
            .select(None)
            .map(|backend| backend.probe())
            .unwrap_or_else(|_| {
                nofy_isolation::Unsupported::new(nofy_isolation::current_platform()).probe()
            })
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
    let command = Command {
        program: program.into(),
        args,
        env,
        cwd,
    };
    #[cfg(target_os = "linux")]
    {
        let policy = confinement(profile);
        let backend = LinuxLandlock::new(helper, profile);
        nofy_isolation::launch_plan(&backend, command, &policy)
    }
    #[cfg(not(target_os = "linux"))]
    {
        let _ = helper;
        let policy = protected_confinement(profile);
        let registry = platform_registry();
        match registry.select(None) {
            Ok(backend) => nofy_isolation::launch_plan(backend.as_ref(), command, &policy),
            Err(_) => {
                let backend = nofy_isolation::Unsupported::new(nofy_isolation::current_platform());
                nofy_isolation::launch_plan(&backend, command, &policy)
            }
        }
    }
}

/// A worker command for the async supervisor. The caller owns the child.
pub(super) fn tokio_command(confined: ConfinedCommand) -> tokio::process::Command {
    tokio::process::Command::from(std_command(confined))
}

/// A worker command for a short blocking run.
pub(super) fn std_command(
    #[cfg_attr(not(target_os = "linux"), allow(unused_mut))] mut confined: ConfinedCommand,
) -> std::process::Command {
    let mut command = std::process::Command::new(confined.program);
    #[cfg(target_os = "linux")]
    if confined.args.first().and_then(|s| s.to_str()) == Some(isolation::WORKER_ARG)
        && confined.args.len() >= 3
    {
        let mut wire = confined.args[1].as_encoded_bytes().to_vec();
        match isolation::attach_profile_fd(&mut command, &wire) {
            Ok(token) => {
                confined.args[1] = token;
            }
            Err(error) => {
                let code = error.raw_os_error().unwrap_or(libc::EIO);
                confined.args[1] = OsString::from("fd:invalid");
                use std::os::unix::process::CommandExt;
                // SAFETY: Returns a constant OS error between fork and exec without
                // allocating, ensuring fail-closed refusal if profile FD setup fails.
                unsafe {
                    command.pre_exec(move || Err(std::io::Error::from_raw_os_error(code)));
                }
            }
        }
        wire.fill(0);
    }
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

/// macOS Seatbelt backend: pure SBPL compiler (tested on every OS) plus the
/// `/usr/bin/sandbox-exec` applier and honest capability probe.
///
/// Kept inside `loader/confine.rs` (part of the platform layer) so platform
/// literals such as `/usr/bin/sandbox-exec` stay confined to the platform layer.
#[cfg_attr(not(target_os = "macos"), allow(dead_code))]
pub(crate) mod seatbelt {
    use super::*;

    pub const BACKEND_NAME: &str = "macos-seatbelt";
    pub const SANDBOX_EXEC_PATH: &str = "/usr/bin/sandbox-exec";
    /// XNU `fcntl` command `F_MAKECOMPRESSED` (can mutate via read-only fd).
    pub const F_MAKECOMPRESSED: u32 = 80;
    /// XNU `fcntl` command `F_TRANSFEREXTENTS` (can mutate via read-only fd).
    pub const F_TRANSFEREXTENTS: u32 = 110;

    /// Pure compiled Seatbelt profile and its `-D KEY=VALUE` parameter bindings.
    #[derive(Clone, Debug, PartialEq, Eq)]
    pub struct SeatbeltPlan {
        pub profile: String,
        pub params: BTreeMap<String, String>,
        #[cfg_attr(not(test), allow(dead_code))]
        pub loopback_proxy_port: Option<u16>,
    }

    impl SeatbeltPlan {
        /// Render the `-p <profile> -D K=V ...` argument prefix for `sandbox-exec`.
        pub fn sandbox_exec_args(&self, command: &Command) -> Vec<OsString> {
            let mut args = Vec::with_capacity(3 + self.params.len() * 2 + 1 + command.args.len());
            args.push(OsString::from("-p"));
            args.push(OsString::from(&self.profile));
            for (key, value) in &self.params {
                args.push(OsString::from("-D"));
                args.push(OsString::from(format!("{key}={value}")));
            }
            args.push(OsString::from("--"));
            args.push(command.program.clone().into_os_string());
            args.extend(command.args.iter().cloned());
            args
        }
    }

    fn validate_posix_path(
        path: &Path,
        role: &str,
    ) -> std::result::Result<String, nofy_isolation::Error> {
        let text = path.to_str().ok_or_else(|| {
            nofy_isolation::Error::Failed(format!("seatbelt {role} path is not valid UTF-8"))
        })?;
        nofy_host_path::Syntax::Posix
            .check_normalized_absolute(text, 4096)
            .map_err(|err| {
                nofy_isolation::Error::Failed(format!(
                    "seatbelt {role} path `{text}` is invalid: {err}"
                ))
            })?;
        Ok(text.to_owned())
    }

    /// Reject a root that is itself a symbolic link, then canonicalize any
    /// ancestor symlinks (such as macOS `/tmp` -> `/private/tmp`) so Seatbelt
    /// rules match the resolved path the kernel evaluates.
    pub fn validate_root_not_symlink(
        path: &Path,
    ) -> std::result::Result<PathBuf, nofy_isolation::Error> {
        let meta = std::fs::symlink_metadata(path).map_err(|err| {
            nofy_isolation::Error::Failed(format!(
                "seatbelt root `{}` is unavailable: {err}",
                path.display()
            ))
        })?;
        if meta.file_type().is_symlink() {
            return Err(nofy_isolation::Error::Failed(format!(
                "seatbelt root `{}` must not be a symbolic link",
                path.display()
            )));
        }
        std::fs::canonicalize(path).map_err(|err| {
            nofy_isolation::Error::Failed(format!(
                "seatbelt root `{}` cannot be canonicalized: {err}",
                path.display()
            ))
        })
    }

    struct ParamTable {
        by_path: BTreeMap<String, String>,
        params: BTreeMap<String, String>,
        next_id: usize,
    }

    impl ParamTable {
        fn new() -> Self {
            Self {
                by_path: BTreeMap::new(),
                params: BTreeMap::new(),
                next_id: 0,
            }
        }

        fn intern(&mut self, path: String) -> String {
            if let Some(existing) = self.by_path.get(&path) {
                return existing.clone();
            }
            let key = format!("ROOT_{}", self.next_id);
            self.next_id += 1;
            self.params.insert(key.clone(), path.clone());
            self.by_path.insert(path, key.clone());
            key
        }
    }

    fn join_posix_subpath(root: &str, relative: &str) -> String {
        format!("{root}/{relative}")
    }

    fn collect_protected_ancestors(root: &str, protected: &str, out: &mut BTreeSet<String>) {
        out.insert(root.to_owned());
        let Some(tail) = protected.strip_prefix(root) else {
            return;
        };
        let Some(relative) = tail.strip_prefix('/') else {
            return;
        };
        let parts: Vec<&str> = relative.split('/').collect();
        if parts.len() <= 1 {
            return;
        }
        let mut prefix = root.to_owned();
        for component in &parts[..parts.len() - 1] {
            prefix.push('/');
            prefix.push_str(component);
            out.insert(prefix.clone());
        }
    }

    /// Pure SBPL compiler: turns a platform-neutral [`Confinement`] into a
    /// parameterized `(deny default)` Seatbelt profile and `-D ROOT_N=...` table.
    #[cfg(test)]
    pub fn compile_seatbelt_profile(
        policy: &Confinement,
    ) -> std::result::Result<SeatbeltPlan, nofy_isolation::Error> {
        compile_seatbelt_profile_with_proxy(policy, None)
    }

    /// Pure SBPL compiler with an optional loopback proxy port for
    /// [`Network::LoopbackOnly`].
    pub fn compile_seatbelt_profile_with_proxy(
        policy: &Confinement,
        loopback_proxy_port: Option<u16>,
    ) -> std::result::Result<SeatbeltPlan, nofy_isolation::Error> {
        if loopback_proxy_port == Some(0) {
            return Err(nofy_isolation::Error::Failed(
                "seatbelt loopback proxy port must be non-zero".into(),
            ));
        }

        let mut table = ParamTable::new();
        let mut lines = vec![
            "(version 1)".to_owned(),
            "(deny default)".to_owned(),
            ";; Minimal baseline required for macOS process startup and libc/dyld".to_owned(),
            "(allow process-info* (target same-sandbox))".to_owned(),
            "(allow signal (target same-sandbox))".to_owned(),
            "(allow sysctl-read)".to_owned(),
            "(allow file-read-metadata (literal \"/\"))".to_owned(),
            "(allow file-read* file-write-data (literal \"/dev/null\"))".to_owned(),
            "(allow file-read* (literal \"/dev/urandom\") (literal \"/dev/random\"))".to_owned(),
            "(allow file-read* (literal \"/dev/dtracehelper\"))".to_owned(),
            "(allow mach-lookup (global-name \"com.apple.system.logger\") (global-name \"com.apple.system.notification_center\"))".to_owned(),
        ];

        match &policy.filesystem {
            None => {
                lines.push("(allow file-read* file-write* process-exec)".to_owned());
            }
            Some(files) => {
                if files.private_mounts {
                    return Err(nofy_isolation::Error::Failed(
                        "macOS Seatbelt does not support private_mounts".into(),
                    ));
                }

                let mut read_only = BTreeSet::new();
                for path in &files.read_only {
                    read_only.insert(validate_posix_path(path, "read_only")?);
                }
                let mut read_write = BTreeSet::new();
                for path in &files.read_write {
                    read_write.insert(validate_posix_path(path, "read_write")?);
                }
                let mut executable = BTreeSet::new();
                for path in &files.executable {
                    executable.insert(validate_posix_path(path, "executable")?);
                }

                // Merge explicit protected paths with MANDATORY_PROTECTED under every writable root.
                let mut protected = BTreeSet::new();
                for path in &files.protected {
                    protected.insert(validate_posix_path(path, "protected")?);
                }
                for root in &read_write {
                    for rel in MANDATORY_PROTECTED {
                        let candidate = join_posix_subpath(root, rel);
                        protected.insert(candidate);
                    }
                }

                // Collect ancestor directories of protected paths so renaming a writable
                // ancestor cannot move a protected descendant out of its deny rule.
                let mut protected_ancestors = BTreeSet::new();
                for root in &read_write {
                    for item in &protected {
                        collect_protected_ancestors(root, item, &mut protected_ancestors);
                    }
                }

                lines.push(";; Parameterized read-only roots".to_owned());
                for path in &read_only {
                    let key = table.intern(path.clone());
                    lines.push(format!("(allow file-read* (subpath (param \"{key}\")))"));
                    if executable.is_empty() {
                        lines.push(format!("(allow process-exec (subpath (param \"{key}\")))"));
                    }
                }

                lines.push(";; Parameterized read-write roots".to_owned());
                for path in &read_write {
                    let key = table.intern(path.clone());
                    lines.push(format!(
                        "(allow file-read* file-write* (subpath (param \"{key}\")))"
                    ));
                    if executable.is_empty() {
                        lines.push(format!("(allow process-exec (subpath (param \"{key}\")))"));
                    }
                }

                if !executable.is_empty() {
                    lines.push(";; Parameterized executable allowlist".to_owned());
                    for path in &executable {
                        let key = table.intern(path.clone());
                        lines.push(format!(
                            "(allow file-read* process-exec (subpath (param \"{key}\")))"
                        ));
                    }
                }

                // Deny rules come AFTER allow rules (last matching rule wins in SBPL).
                if !protected.is_empty() {
                    lines.push(";; Mandatory and declared protected subpaths".to_owned());
                    for path in &protected {
                        let key = table.intern(path.clone());
                        lines.push(format!("(deny file-write* (subpath (param \"{key}\")))"));
                        lines.push(format!(
                            "(deny file-write-unlink (subpath (param \"{key}\")))"
                        ));
                    }
                }

                if !protected_ancestors.is_empty() {
                    lines.push(
                        ";; Pin ancestor directories against rename/unlink escape".to_owned(),
                    );
                    for ancestor in &protected_ancestors {
                        let key = table.intern(ancestor.clone());
                        lines.push(format!(
                            "(deny file-write-unlink (require-all (vnode-type DIRECTORY) (literal (param \"{key}\"))))"
                        ));
                    }
                }
            }
        }

        // Prevent mutating files via read-only file descriptors (`F_MAKECOMPRESSED`,
        // `F_TRANSFEREXTENTS`).
        lines.push(format!(
            "(deny system-fcntl (fcntl-command {F_MAKECOMPRESSED} {F_TRANSFEREXTENTS}))"
        ));

        match policy.processes {
            Processes::Single => lines.push("(deny process-fork)".to_owned()),
            Processes::Tree | Processes::Unrestricted => {
                lines.push("(allow process-fork)".to_owned())
            }
        }

        match policy.network {
            Network::Denied => {
                lines.push("(deny network*)".to_owned());
            }
            Network::LoopbackOnly => {
                lines.push("(deny network*)".to_owned());
                if let Some(port) = loopback_proxy_port {
                    lines.push(format!(
                        "(allow network-outbound (remote ip \"localhost:{port}\"))"
                    ));
                } else {
                    lines.push("(allow network-outbound (remote ip \"localhost:*\"))".to_owned());
                    lines.push("(allow network-inbound (local ip \"localhost:*\"))".to_owned());
                    lines.push("(allow network-bind (local ip \"localhost:*\"))".to_owned());
                }
            }
            Network::Unrestricted => {
                lines.push("(allow network*)".to_owned());
            }
        }

        Ok(SeatbeltPlan {
            profile: lines.join("\n"),
            params: table.params,
            loopback_proxy_port,
        })
    }

    /// Build the honest [`Probe`] for macOS Seatbelt given whether the live
    /// `/usr/bin/sandbox-exec` probe succeeded.
    pub fn macos_seatbelt_probe(status: std::result::Result<(), &str>) -> Probe {
        let mut probe = Probe::new(BACKEND_NAME, "macos", Capabilities::new());
        match status {
            Ok(()) => {
                for enforced in [
                    Capability::Filesystem,
                    Capability::ProtectedPaths,
                    Capability::ExecuteAllowlist,
                    Capability::NetworkDeny,
                    Capability::NetworkLoopbackOnly,
                    Capability::ProcessSpawnDeny,
                ] {
                    probe.capabilities = probe.capabilities.with(enforced, Level::Enforced);
                }
                probe.capabilities = probe
                    .capabilities
                    .with(Capability::DieWithParent, Level::Partial)
                    .with(Capability::TreeKill, Level::Partial);
                probe
                    .note(
                        Capability::PrivateMounts,
                        "macOS Seatbelt operates on the host filesystem view and has no private mount namespace",
                    )
                    .note(
                        Capability::DieWithParent,
                        "macOS has no PR_SET_PDEATHSIG; parent death relies on supervisor watchdog or pipe EOF",
                    )
                    .note(
                        Capability::TreeKill,
                        "macOS process-group killpg cannot reach descendants that detach via setsid",
                    )
                    .note(
                        Capability::CpuLimit,
                        "sandbox-exec does not enforce CPU time limits without an rlimit wrapper",
                    )
                    .note(
                        Capability::MemoryLimit,
                        "sandbox-exec does not enforce memory limits",
                    )
                    .note(
                        Capability::ProcessCountLimit,
                        "sandbox-exec does not enforce process count limits",
                    )
            }
            Err(reason) => {
                for cap in [
                    Capability::Filesystem,
                    Capability::ProtectedPaths,
                    Capability::ExecuteAllowlist,
                    Capability::NetworkDeny,
                    Capability::NetworkLoopbackOnly,
                    Capability::ProcessSpawnDeny,
                ] {
                    probe = probe.note(cap, reason);
                }
                probe
                    .note(
                        Capability::PrivateMounts,
                        "macOS Seatbelt has no private mount namespace",
                    )
                    .note(Capability::DieWithParent, reason)
                    .note(Capability::TreeKill, reason)
                    .note(
                        Capability::CpuLimit,
                        "sandbox-exec does not enforce CPU time limits",
                    )
                    .note(
                        Capability::MemoryLimit,
                        "sandbox-exec does not enforce memory limits",
                    )
                    .note(
                        Capability::ProcessCountLimit,
                        "sandbox-exec does not enforce process count limits",
                    )
            }
        }
    }

    #[cfg(target_os = "macos")]
    fn probe_live_sandbox_exec() -> std::result::Result<(), String> {
        let meta = std::fs::symlink_metadata(SANDBOX_EXEC_PATH)
            .map_err(|err| format!("{SANDBOX_EXEC_PATH} is unavailable: {err}"))?;
        if !meta.is_file() {
            return Err(format!("{SANDBOX_EXEC_PATH} is not a regular executable"));
        }
        let output = std::process::Command::new(SANDBOX_EXEC_PATH)
            .args(["-p", "(version 1)(allow default)", "--", "/usr/bin/true"])
            .output()
            .map_err(|err| format!("failed to execute {SANDBOX_EXEC_PATH}: {err}"))?;
        if !output.status.success() {
            return Err(format!(
                "{SANDBOX_EXEC_PATH} probe failed with status {:?}",
                output.status.code()
            ));
        }
        Ok(())
    }

    /// macOS Seatbelt [`Backend`] backed by `/usr/bin/sandbox-exec`.
    pub struct MacosSeatbeltBackend {
        probe_status: std::result::Result<(), String>,
        loopback_proxy_port: Option<u16>,
    }

    impl MacosSeatbeltBackend {
        pub fn new() -> Self {
            #[cfg(target_os = "macos")]
            let probe_status = probe_live_sandbox_exec();
            #[cfg(not(target_os = "macos"))]
            let probe_status =
                Err("macOS Seatbelt (/usr/bin/sandbox-exec) is only available on macOS".into());
            Self {
                probe_status,
                loopback_proxy_port: None,
            }
        }

        #[cfg(test)]
        pub fn with_probe_status(probe_status: std::result::Result<(), String>) -> Self {
            Self {
                probe_status,
                loopback_proxy_port: None,
            }
        }

        #[cfg(test)]
        pub fn with_loopback_proxy_port(mut self, port: u16) -> Self {
            self.loopback_proxy_port = Some(port);
            self
        }
    }

    impl Default for MacosSeatbeltBackend {
        fn default() -> Self {
            Self::new()
        }
    }

    impl Backend for MacosSeatbeltBackend {
        fn name(&self) -> &'static str {
            BACKEND_NAME
        }

        fn platform(&self) -> &'static str {
            "macos"
        }

        fn probe(&self) -> Probe {
            macos_seatbelt_probe(
                self.probe_status
                    .as_ref()
                    .map(|_| ())
                    .map_err(String::as_str),
            )
        }

        fn confine(
            &self,
            command: Command,
            policy: &Confinement,
        ) -> std::result::Result<ConfinedCommand, nofy_isolation::Error> {
            nofy_isolation::admit(&self.probe(), policy)?;
            if command.program.as_os_str().is_empty() {
                return Err(nofy_isolation::Error::Failed(
                    "seatbelt target command program is empty".into(),
                ));
            }
            #[cfg(target_os = "macos")]
            let effective_policy = {
                let mut cloned = policy.clone();
                if let Some(files) = cloned.filesystem.as_mut() {
                    for list in [
                        &mut files.read_only,
                        &mut files.read_write,
                        &mut files.executable,
                    ] {
                        for root in list.iter_mut() {
                            if root.exists() {
                                *root = validate_root_not_symlink(root)?;
                            }
                        }
                    }
                }
                cloned
            };
            #[cfg(not(target_os = "macos"))]
            let effective_policy = policy.clone();

            let plan =
                compile_seatbelt_profile_with_proxy(&effective_policy, self.loopback_proxy_port)?;
            let args = plan.sandbox_exec_args(&command);
            Ok(ConfinedCommand {
                backend: BACKEND_NAME.into(),
                program: PathBuf::from(SANDBOX_EXEC_PATH),
                args,
                env: command.env,
                cwd: command.cwd,
            })
        }
    }
}

/// Windows Tier-1 backend (unprivileged `WRITE_RESTRICTED` token + Low integrity
/// + capability SID ACE + Job Object `KILL_ON_JOB_CLOSE`): pure planner (tested
/// on every OS) plus an intentionally honest probe that NEVER over-claims read
/// isolation or network restriction.
#[cfg_attr(not(target_os = "windows"), allow(dead_code))]
pub(crate) mod windows_t1 {
    use super::*;
    use serde::{Deserialize, Serialize};

    pub const BACKEND_NAME: &str = "windows-t1";
    pub const RUNNER_ARG: &str = "__nofy_windows_t1_v1";

    #[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
    #[serde(rename_all = "snake_case")]
    pub enum IntegrityLevel {
        Low,
    }

    #[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
    pub struct RestrictedTokenPlan {
        pub write_restricted: bool,
        pub integrity: IntegrityLevel,
        pub capability_sid_required: bool,
    }

    #[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
    pub struct JobObjectPlan {
        pub kill_on_job_close: bool,
        pub create_suspended_then_resume: bool,
    }

    /// Pure compiled plan for Windows T1 confinement.
    ///
    /// T1 enforces write/delete boundaries (via `WRITE_RESTRICTED` token + Low
    /// integrity + capability SID ACEs) and process-tree lifecycle (via Job
    /// Object). It does NOT enforce read isolation or network denial (those
    /// require T2 elevated installation with a dedicated sandbox user and WFP).
    #[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
    pub struct WindowsT1Plan {
        pub token: RestrictedTokenPlan,
        pub job: JobObjectPlan,
        pub write_grants: Vec<String>,
        pub protected_denies: Vec<String>,
        pub read_isolation_enforced: bool,
        pub network_isolation_enforced: bool,
    }

    fn validate_windows_path(
        path: &Path,
        role: &str,
    ) -> std::result::Result<String, nofy_isolation::Error> {
        let text = path.to_str().ok_or_else(|| {
            nofy_isolation::Error::Failed(format!("windows-t1 {role} path is not valid UTF-8"))
        })?;
        nofy_host_path::Syntax::Windows
            .check_normalized_absolute(text, 4096)
            .map_err(|err| {
                nofy_isolation::Error::Failed(format!(
                    "windows-t1 {role} path `{text}` is invalid: {err}"
                ))
            })?;
        Ok(text.to_owned())
    }

    fn join_windows_subpath(root: &str, relative_posix: &str) -> String {
        let relative = relative_posix.replace('/', "\\");
        format!("{root}\\{relative}")
    }

    /// Pure compiler: validates that `policy` fits Windows T1's honest
    /// capabilities and produces a deterministic [`WindowsT1Plan`].
    pub fn compile_windows_t1_plan(
        policy: &Confinement,
    ) -> std::result::Result<WindowsT1Plan, nofy_isolation::Error> {
        if policy.network != Network::Unrestricted {
            return Err(nofy_isolation::Error::Failed(
                "windows-t1 cannot enforce network isolation (requires T2 elevated WFP filter)"
                    .into(),
            ));
        }
        if policy.processes == Processes::Single {
            return Err(nofy_isolation::Error::Failed(
                "windows-t1 does not enforce ProcessSpawnDeny".into(),
            ));
        }
        if policy.limits.cpu_seconds.is_some()
            || policy.limits.memory_bytes.is_some()
            || policy.limits.max_processes.is_some()
        {
            return Err(nofy_isolation::Error::Failed(
                "windows-t1 does not claim verified resource limits".into(),
            ));
        }

        let mut write_grants = BTreeSet::new();
        let mut protected_denies = BTreeSet::new();

        if let Some(files) = &policy.filesystem {
            if files.private_mounts {
                return Err(nofy_isolation::Error::Failed(
                    "windows-t1 does not support private_mounts".into(),
                ));
            }
            if !files.executable.is_empty() {
                return Err(nofy_isolation::Error::Failed(
                    "windows-t1 does not support ExecuteAllowlist".into(),
                ));
            }
            for path in &files.read_only {
                let _ = validate_windows_path(path, "read_only")?;
            }
            for path in &files.read_write {
                let validated = validate_windows_path(path, "read_write")?;
                write_grants.insert(validated);
            }
            for path in &files.protected {
                let validated = validate_windows_path(path, "protected")?;
                protected_denies.insert(validated);
            }
            for root in &write_grants {
                for rel in MANDATORY_PROTECTED {
                    let candidate = join_windows_subpath(root, rel);
                    nofy_host_path::Syntax::Windows
                        .check_normalized_absolute(&candidate, 4096)
                        .map_err(|err| {
                            nofy_isolation::Error::Failed(format!(
                                "windows-t1 protected path `{candidate}` is invalid: {err}"
                            ))
                        })?;
                    protected_denies.insert(candidate);
                }
            }
        }

        Ok(WindowsT1Plan {
            token: RestrictedTokenPlan {
                write_restricted: policy.filesystem.is_some(),
                integrity: IntegrityLevel::Low,
                capability_sid_required: !write_grants.is_empty(),
            },
            job: JobObjectPlan {
                kill_on_job_close: true,
                create_suspended_then_resume: true,
            },
            write_grants: write_grants.into_iter().collect(),
            protected_denies: protected_denies.into_iter().collect(),
            read_isolation_enforced: false,
            network_isolation_enforced: false,
        })
    }

    /// Build the strictly honest [`Probe`] for Windows T1.
    ///
    /// - `DieWithParent` and `TreeKill` are `Enforced` only when a Job Object
    ///   can be created.
    /// - `Filesystem` and `ProtectedPaths` are at most `Partial` (write/delete
    ///   boundaries only; reads are NOT restricted!) and only when a restricted
    ///   token runner is available — never `Enforced`.
    /// - `ExecuteAllowlist`, `PrivateMounts`, `NetworkDeny`,
    ///   `NetworkLoopbackOnly`, `ProcessSpawnDeny`, `CpuLimit`, `MemoryLimit`,
    ///   and `ProcessCountLimit` are ALWAYS `Unavailable`.
    pub fn windows_t1_probe(
        job_object: std::result::Result<(), &str>,
        write_token_runner: std::result::Result<(), &str>,
    ) -> Probe {
        let mut probe = Probe::new(BACKEND_NAME, "windows", Capabilities::new());
        match job_object {
            Ok(()) => {
                probe.capabilities = probe
                    .capabilities
                    .with(Capability::DieWithParent, Level::Enforced)
                    .with(Capability::TreeKill, Level::Enforced);
            }
            Err(reason) => {
                probe = probe
                    .note(Capability::DieWithParent, reason)
                    .note(Capability::TreeKill, reason);
            }
        }

        match write_token_runner {
            Ok(()) => {
                probe.capabilities = probe
                    .capabilities
                    .with(Capability::Filesystem, Level::Partial)
                    .with(Capability::ProtectedPaths, Level::Partial);
                probe = probe
                    .note(
                        Capability::Filesystem,
                        "Windows T1 (WRITE_RESTRICTED token + Low integrity + capability SID ACE) restricts writes and deletes only; file reads are NOT isolated (requires T2 elevated sandbox)",
                    )
                    .note(
                        Capability::ProtectedPaths,
                        "Windows T1 denies writes to existing protected paths via NTFS ACEs; read access and uncreated subpaths are not blocked by T1 alone",
                    );
            }
            Err(reason) => {
                probe = probe
                    .note(Capability::Filesystem, reason)
                    .note(Capability::ProtectedPaths, reason);
            }
        }

        probe
            .note(
                Capability::ExecuteAllowlist,
                "Windows T1 WRITE_RESTRICTED tokens do not enforce an execution allowlist",
            )
            .note(
                Capability::PrivateMounts,
                "Windows has no private mount namespace",
            )
            .note(
                Capability::NetworkDeny,
                "Windows T1 has no WFP firewall filter; network denial requires T2 elevated installation",
            )
            .note(
                Capability::NetworkLoopbackOnly,
                "Windows T1 cannot restrict network to loopback; requires T2 elevated WFP filter",
            )
            .note(
                Capability::ProcessSpawnDeny,
                "Windows T1 does not claim ProcessSpawnDeny until ActiveProcessLimit=1 is verified on Windows CI",
            )
            .note(
                Capability::CpuLimit,
                "Windows T1 does not enforce CPU time limits",
            )
            .note(
                Capability::MemoryLimit,
                "Windows T1 does not enforce memory limits",
            )
            .note(
                Capability::ProcessCountLimit,
                "Windows T1 does not enforce process count limits",
            )
    }

    /// Windows Tier-1 [`Backend`].
    pub struct WindowsT1Backend {
        job_status: std::result::Result<(), String>,
        runner: std::result::Result<PathBuf, String>,
    }

    impl WindowsT1Backend {
        pub fn new() -> Self {
            #[cfg(target_os = "windows")]
            let job_status = nofy_tty_utils::ProcessGroup::new()
                .map(|_| ())
                .map_err(|err| format!("Windows Job Object probe failed: {err}"));
            #[cfg(not(target_os = "windows"))]
            let job_status = Err("Windows Job Objects are only available on Windows".into());

            // No unprivileged restricted-token helper executable is installed by default;
            // report Unavailable honestly so fail-closed admission refuses write-token requests
            // until a runner is configured.
            let runner = Err(
                "Windows T1 WRITE_RESTRICTED token runner is not installed on this host (file read isolation also requires T2 elevated sandbox)".into(),
            );
            Self { job_status, runner }
        }

        #[cfg(test)]
        pub fn with_probe_status(
            job_status: std::result::Result<(), String>,
            runner: std::result::Result<PathBuf, String>,
        ) -> Self {
            Self { job_status, runner }
        }
    }

    impl Default for WindowsT1Backend {
        fn default() -> Self {
            Self::new()
        }
    }

    impl Backend for WindowsT1Backend {
        fn name(&self) -> &'static str {
            BACKEND_NAME
        }

        fn platform(&self) -> &'static str {
            "windows"
        }

        fn probe(&self) -> Probe {
            windows_t1_probe(
                self.job_status.as_ref().map(|_| ()).map_err(String::as_str),
                self.runner.as_ref().map(|_| ()).map_err(String::as_str),
            )
        }

        fn confine(
            &self,
            command: Command,
            policy: &Confinement,
        ) -> std::result::Result<ConfinedCommand, nofy_isolation::Error> {
            nofy_isolation::admit(&self.probe(), policy)?;
            if command.program.as_os_str().is_empty() {
                return Err(nofy_isolation::Error::Failed(
                    "windows-t1 target command program is empty".into(),
                ));
            }
            let plan = compile_windows_t1_plan(policy)?;
            if policy.filesystem.is_some() {
                let runner = self.runner.as_ref().map_err(|reason| {
                    nofy_isolation::Error::Failed(format!(
                        "windows-t1 restricted-token runner unavailable: {reason}"
                    ))
                })?;
                let wire = serde_json::to_string(&plan)
                    .map_err(|err| nofy_isolation::Error::Failed(err.to_string()))?;
                let mut args = vec![
                    OsString::from(RUNNER_ARG),
                    OsString::from(wire),
                    OsString::from("--"),
                    command.program.into_os_string(),
                ];
                args.extend(command.args);
                Ok(ConfinedCommand {
                    backend: BACKEND_NAME.into(),
                    program: runner.clone(),
                    args,
                    env: command.env,
                    cwd: command.cwd,
                })
            } else {
                Ok(ConfinedCommand {
                    backend: BACKEND_NAME.into(),
                    program: command.program,
                    args: command.args,
                    env: command.env,
                    cwd: command.cwd,
                })
            }
        }
    }
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

    #[cfg(target_os = "linux")]
    #[test]
    fn std_command_passes_profile_via_fd_and_scrubs_argv() {
        let mut profile = profile();
        profile
            .environment
            .insert("API_SECRET_TOKEN".into(), "super-sensitive-value".into());
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
        let command = std_command(confined);
        let args: Vec<_> = command
            .get_args()
            .map(|a| a.to_string_lossy().into_owned())
            .collect();
        assert_eq!(args.len(), 3);
        assert_eq!(args[0], isolation::WORKER_ARG);
        assert!(args[1].starts_with("fd:"), "{args:?}");
        let fd: i32 = args[1].strip_prefix("fd:").unwrap().parse().unwrap();
        assert!(fd >= 3);
        assert_eq!(args[2], "--evaluate-model");
        let joined = args.join(" ");
        assert!(!joined.contains("API_SECRET_TOKEN"));
        assert!(!joined.contains("super-sensitive-value"));
        assert!(!joined.contains("parent_pid"));
        assert!(!joined.contains("/private/loader/scratch/job"));
    }

    #[test]
    fn protected_confinement_explicitly_populates_mandatory_protected_paths() {
        use super::super::directories::{Access, Grant};
        let mut p = profile();
        p.directories = vec![Grant {
            path: "/work/repo".into(),
            access: Access::ReadWrite,
        }];
        let policy = protected_confinement(&p);
        let files = policy.filesystem.as_ref().expect("filesystem");
        for rel in [".git/hooks", ".git/config", ".bashrc", ".zshrc", ".vscode"] {
            assert!(
                files
                    .protected
                    .contains(&PathBuf::from("/work/repo").join(rel)),
                "missing mandatory protected path {rel}"
            );
        }
        assert!(
            policy
                .requirements()
                .iter()
                .any(|r| r.capability == Capability::ProtectedPaths)
        );
    }

    #[test]
    fn seatbelt_golden_profile_parameterizes_roots_blocks_escapes_and_fcntl() {
        let files = Filesystem {
            read_only: vec!["/usr/share/dict".into()],
            read_write: vec!["/work/project".into()],
            executable: vec!["/opt/tools/bin".into()],
            private_mounts: false,
            protected: vec!["/work/project/secrets/key.pem".into()],
        };
        let policy = Confinement {
            filesystem: Some(files),
            network: Network::Denied,
            processes: Processes::Single,
            limits: Limits::default(),
            die_with_parent: true,
            accept_partial: BTreeSet::from([Capability::DieWithParent]),
        };

        let plan = seatbelt::compile_seatbelt_profile(&policy).expect("compile seatbelt");
        assert!(plan.profile.starts_with("(version 1)\n(deny default)\n"));
        assert!(
            plan.profile
                .contains("(deny system-fcntl (fcntl-command 80 110))")
        );
        assert!(plan.profile.contains("(deny process-fork)"));
        assert!(plan.profile.contains("(deny network*)"));
        assert!(!plan.profile.contains("(allow network"));

        // Every root and protected path must be passed via `-D ROOT_N=...`, never interpolated.
        for raw in [
            "/usr/share/dict",
            "/work/project",
            "/opt/tools/bin",
            "/work/project/.git/hooks",
            "/work/project/.git/config",
            "/work/project/secrets/key.pem",
        ] {
            assert!(
                !plan.profile.contains(raw),
                "raw path `{raw}` leaked into SBPL profile text"
            );
            assert!(
                plan.params.values().any(|v| v == raw),
                "path `{raw}` missing from -D parameter table"
            );
        }

        // Protected deny rules must appear AFTER allow rules (last-rule-wins in SBPL).
        let rw_key = plan
            .params
            .iter()
            .find_map(|(k, v)| (v == "/work/project").then_some(k.as_str()))
            .expect("rw root param");
        let hooks_key = plan
            .params
            .iter()
            .find_map(|(k, v)| (v == "/work/project/.git/hooks").then_some(k.as_str()))
            .expect("hooks param");
        let git_ancestor_key = plan
            .params
            .iter()
            .find_map(|(k, v)| (v == "/work/project/.git").then_some(k.as_str()))
            .expect(".git ancestor param");

        let allow_rw = format!("(allow file-read* file-write* (subpath (param \"{rw_key}\")))");
        let deny_hooks = format!("(deny file-write* (subpath (param \"{hooks_key}\")))");
        let deny_hooks_unlink =
            format!("(deny file-write-unlink (subpath (param \"{hooks_key}\")))");
        let pin_git_dir = format!(
            "(deny file-write-unlink (require-all (vnode-type DIRECTORY) (literal (param \"{git_ancestor_key}\"))))"
        );
        let pin_rw_root = format!(
            "(deny file-write-unlink (require-all (vnode-type DIRECTORY) (literal (param \"{rw_key}\"))))"
        );

        let allow_pos = plan.profile.find(&allow_rw).expect("allow rw rule");
        let deny_pos = plan.profile.find(&deny_hooks).expect("deny hooks rule");
        assert!(deny_pos > allow_pos, "deny rule must follow allow rule");
        assert!(plan.profile.contains(&deny_hooks_unlink));
        assert!(plan.profile.contains(&pin_git_dir));
        assert!(plan.profile.contains(&pin_rw_root));
    }

    #[test]
    fn seatbelt_prevents_sbpl_injection_rejects_bad_paths_and_symlink_roots() {
        let hostile_root = "/work/evil\") (allow default) (\"dir";
        let policy = Confinement {
            filesystem: Some(Filesystem {
                read_write: vec![hostile_root.into()],
                ..Filesystem::default()
            }),
            network: Network::Denied,
            ..Confinement::default()
        };
        let plan = seatbelt::compile_seatbelt_profile(&policy).expect("parameterized cleanly");
        assert!(!plan.profile.contains("(allow default)"));
        assert!(!plan.profile.contains(hostile_root));
        assert!(plan.params.values().any(|v| v == hostile_root));

        // Relative, traversal, backslash, bare root, control-char, and private_mounts fail closed.
        for bad in [
            "relative/path",
            "/work/../etc",
            "/work\\bad",
            "/",
            "/work/line\nbreak",
            "/work/nul\0byte",
        ] {
            let invalid = Confinement {
                filesystem: Some(Filesystem {
                    read_only: vec![bad.into()],
                    ..Filesystem::default()
                }),
                ..Confinement::default()
            };
            assert!(
                seatbelt::compile_seatbelt_profile(&invalid).is_err(),
                "expected rejection for `{bad:?}`"
            );
        }

        let private_mounts = Confinement {
            filesystem: Some(Filesystem {
                read_only: vec!["/work".into()],
                private_mounts: true,
                ..Filesystem::default()
            }),
            ..Confinement::default()
        };
        assert!(seatbelt::compile_seatbelt_profile(&private_mounts).is_err());

        // Real filesystem test: symlink roots are refused, real directories canonicalize.
        #[cfg(unix)]
        {
            let dir = tempfile::tempdir().unwrap();
            let real = dir.path().join("real");
            let link = dir.path().join("link");
            std::fs::create_dir(&real).unwrap();
            std::os::unix::fs::symlink(&real, &link).unwrap();
            assert!(seatbelt::validate_root_not_symlink(&link).is_err());
            assert_eq!(
                seatbelt::validate_root_not_symlink(&real).unwrap(),
                std::fs::canonicalize(&real).unwrap()
            );
        }
    }

    #[test]
    fn seatbelt_network_policies_and_fail_closed_admission_gate() {
        let loopback = Confinement {
            filesystem: Some(Filesystem {
                read_only: vec!["/work".into()],
                ..Filesystem::default()
            }),
            network: Network::LoopbackOnly,
            processes: Processes::Tree,
            limits: Limits::default(),
            die_with_parent: true,
            accept_partial: BTreeSet::from([Capability::DieWithParent, Capability::TreeKill]),
        };
        let proxy_plan = seatbelt::compile_seatbelt_profile_with_proxy(&loopback, Some(18080))
            .expect("proxy plan");
        assert!(
            proxy_plan
                .profile
                .contains("(allow network-outbound (remote ip \"localhost:18080\"))")
        );
        assert!(
            seatbelt::compile_seatbelt_profile_with_proxy(&loopback, Some(0)).is_err(),
            "port 0 must be refused"
        );

        let backend = seatbelt::MacosSeatbeltBackend::with_probe_status(Ok(()))
            .with_loopback_proxy_port(18080);
        let probe = backend.probe();
        assert_eq!(
            probe.capabilities.level(Capability::PrivateMounts),
            Level::Unavailable
        );
        assert_eq!(
            probe.capabilities.level(Capability::DieWithParent),
            Level::Partial
        );
        assert_eq!(
            probe.capabilities.level(Capability::TreeKill),
            Level::Partial
        );
        assert_eq!(
            probe.capabilities.level(Capability::Filesystem),
            Level::Enforced
        );
        assert_eq!(
            probe.capabilities.level(Capability::ProtectedPaths),
            Level::Enforced
        );
        assert_eq!(
            probe.capabilities.level(Capability::NetworkDeny),
            Level::Enforced
        );

        let command = Command {
            program: "/opt/tools/bin/runner".into(),
            args: vec!["--check".into()],
            env: BTreeMap::from([(OsString::from("K"), OsString::from("V"))]),
            cwd: Some("/work".into()),
        };

        // Admitted when partial capabilities are explicitly accepted.
        let confined = launch_plan(&backend, command.clone(), &loopback).expect("admitted");
        assert_eq!(confined.backend, seatbelt::BACKEND_NAME);
        assert_eq!(confined.program, PathBuf::from(seatbelt::SANDBOX_EXEC_PATH));
        assert_eq!(confined.args[0], OsString::from("-p"));
        assert!(confined.args.contains(&OsString::from("-D")));
        assert!(confined.args.contains(&OsString::from("--")));
        assert_eq!(confined.env, command.env);
        assert_eq!(confined.cwd, command.cwd);

        // Refused fail-closed when DieWithParent partial enforcement is NOT explicitly accepted.
        let mut strict = loopback.clone();
        strict.accept_partial.clear();
        let refusal = launch_plan(&backend, command.clone(), &strict).unwrap_err();
        let text = refusal.to_string();
        assert!(text.contains("isolation_unavailable"), "{text}");
        assert!(text.contains("die_with_parent"), "{text}");
        assert!(text.contains("tree_kill"), "{text}");

        // Refused fail-closed when sandbox-exec is unavailable.
        let broken = seatbelt::MacosSeatbeltBackend::with_probe_status(Err(
            "/usr/bin/sandbox-exec missing".into(),
        ));
        assert!(matches!(
            launch_plan(&broken, command, &loopback),
            Err(nofy_isolation::Error::Refused(_))
        ));
    }

    #[test]
    fn windows_t1_planner_validates_paths_and_expands_windows_protected_subpaths() {
        let mut files = Filesystem {
            read_only: vec![],
            read_write: vec![r"C:\work\repo".into()],
            executable: vec![],
            private_mounts: false,
            protected: vec![r"C:\work\repo\custom.env".into()],
        };
        files.protected.push(r"C:\work\repo\.git\hooks".into());
        let policy = Confinement {
            filesystem: Some(files),
            network: Network::Unrestricted,
            processes: Processes::Tree,
            limits: Limits::default(),
            die_with_parent: true,
            accept_partial: BTreeSet::from([Capability::Filesystem, Capability::ProtectedPaths]),
        };

        let plan = windows_t1::compile_windows_t1_plan(&policy).expect("compile windows t1 plan");
        assert!(plan.token.write_restricted);
        assert_eq!(plan.token.integrity, windows_t1::IntegrityLevel::Low);
        assert!(plan.token.capability_sid_required);
        assert!(plan.job.kill_on_job_close);
        assert!(plan.job.create_suspended_then_resume);
        assert!(!plan.read_isolation_enforced);
        assert!(!plan.network_isolation_enforced);
        assert_eq!(plan.write_grants, vec![r"C:\work\repo".to_owned()]);
        for expected in [
            r"C:\work\repo\.git\hooks",
            r"C:\work\repo\.git\config",
            r"C:\work\repo\.bashrc",
            r"C:\work\repo\.vscode",
            r"C:\work\repo\custom.env",
        ] {
            assert!(
                plan.protected_denies.iter().any(|p| p == expected),
                "missing Windows protected path {expected}: {:?}",
                plan.protected_denies
            );
        }

        // Reject invalid Windows paths (relative, traversal, forward slash, reserved device, ADS).
        for bad in [
            r"relative\dir",
            r"C:\work\..\secret",
            r"C:/work/repo",
            r"C:\work\CON",
            r"C:\work\file:ads",
            r"\\.\COM1",
        ] {
            let invalid = Confinement {
                filesystem: Some(Filesystem {
                    read_write: vec![bad.into()],
                    ..Filesystem::default()
                }),
                network: Network::Unrestricted,
                processes: Processes::Tree,
                ..Confinement::default()
            };
            assert!(
                windows_t1::compile_windows_t1_plan(&invalid).is_err(),
                "expected rejection for `{bad}`"
            );
        }

        // Network isolation and private_mounts fail closed in planner too.
        let mut net_denied = policy.clone();
        net_denied.network = Network::Denied;
        assert!(windows_t1::compile_windows_t1_plan(&net_denied).is_err());

        let mut private_mounts = policy;
        private_mounts.filesystem.as_mut().unwrap().private_mounts = true;
        assert!(windows_t1::compile_windows_t1_plan(&private_mounts).is_err());
    }

    #[test]
    fn windows_t1_probe_is_strictly_honest_and_refuses_read_or_network_isolation() {
        let backend = windows_t1::WindowsT1Backend::with_probe_status(
            Ok(()),
            Ok(PathBuf::from(r"C:\nofy\nofy-win-t1.exe")),
        );
        let probe = backend.probe();

        // Only Job Object lifecycle is Enforced; write-only FS/protected paths are Partial.
        assert_eq!(
            probe.capabilities.level(Capability::DieWithParent),
            Level::Enforced
        );
        assert_eq!(
            probe.capabilities.level(Capability::TreeKill),
            Level::Enforced
        );
        assert_eq!(
            probe.capabilities.level(Capability::Filesystem),
            Level::Partial
        );
        assert_eq!(
            probe.capabilities.level(Capability::ProtectedPaths),
            Level::Partial
        );

        // Read/Network/Mount/Exec/Spawn/Limits MUST NEVER be over-claimed.
        for unavailable in [
            Capability::ExecuteAllowlist,
            Capability::PrivateMounts,
            Capability::NetworkDeny,
            Capability::NetworkLoopbackOnly,
            Capability::ProcessSpawnDeny,
            Capability::CpuLimit,
            Capability::MemoryLimit,
            Capability::ProcessCountLimit,
        ] {
            assert_eq!(
                probe.capabilities.level(unavailable),
                Level::Unavailable,
                "{unavailable:?} must be Unavailable on Windows T1"
            );
            assert!(
                probe.notes.contains_key(&unavailable),
                "missing explanation note for {unavailable:?}"
            );
        }

        let cmd = Command {
            program: PathBuf::from(r"C:\Windows\System32\cmd.exe"),
            args: vec!["/c".into(), "echo".into(), "ok".into()],
            env: Default::default(),
            cwd: Some(PathBuf::from(r"C:\work\repo")),
        };

        // Any default policy requiring read isolation (Filesystem: Enforced) is REFUSED.
        let needs_read_isolation = Confinement {
            filesystem: Some(Filesystem {
                read_only: vec![r"C:\work\readonly".into()],
                read_write: vec![r"C:\work\repo".into()],
                ..Filesystem::default()
            }),
            network: Network::Unrestricted,
            processes: Processes::Tree,
            die_with_parent: true,
            ..Confinement::default()
        };
        let refusal = launch_plan(&backend, cmd.clone(), &needs_read_isolation).unwrap_err();
        assert!(refusal.to_string().contains("filesystem"));

        // Any policy requiring NetworkDeny or NetworkLoopbackOnly is REFUSED even with accept_partial!
        for net in [Network::Denied, Network::LoopbackOnly] {
            let needs_net = Confinement {
                filesystem: None,
                network: net,
                processes: Processes::Tree,
                die_with_parent: true,
                accept_partial: BTreeSet::from([
                    Capability::NetworkDeny,
                    Capability::NetworkLoopbackOnly,
                ]),
                ..Confinement::default()
            };
            assert!(matches!(
                launch_plan(&backend, cmd.clone(), &needs_net),
                Err(nofy_isolation::Error::Refused(_))
            ));
        }

        // Write-only + Job Object policy that explicitly accepts Partial FS/ProtectedPaths is admitted.
        let write_only = Confinement {
            filesystem: Some(Filesystem {
                read_write: vec![r"C:\work\repo".into()],
                protected: vec![r"C:\work\repo\.git\hooks".into()],
                ..Filesystem::default()
            }),
            network: Network::Unrestricted,
            processes: Processes::Tree,
            limits: Limits::default(),
            die_with_parent: true,
            accept_partial: BTreeSet::from([Capability::Filesystem, Capability::ProtectedPaths]),
        };
        let confined = launch_plan(&backend, cmd.clone(), &write_only).expect("admitted");
        assert_eq!(confined.backend, windows_t1::BACKEND_NAME);
        assert_eq!(confined.program, PathBuf::from(r"C:\nofy\nofy-win-t1.exe"));
        assert_eq!(confined.args[0], OsString::from(windows_t1::RUNNER_ARG));

        // Without a T1 runner binary, write-only filesystem policy is also refused fail-closed.
        let job_only_backend = windows_t1::WindowsT1Backend::with_probe_status(
            Ok(()),
            Err("no T1 runner installed".into()),
        );
        assert_eq!(
            job_only_backend
                .probe()
                .capabilities
                .level(Capability::Filesystem),
            Level::Unavailable
        );
        assert!(matches!(
            launch_plan(&job_only_backend, cmd, &write_only),
            Err(nofy_isolation::Error::Refused(_))
        ));
    }

    #[test]
    fn registry_registers_cross_platform_backends_and_checks_platform() {
        let mut reg = Registry::new();
        reg.register(Arc::new(seatbelt::MacosSeatbeltBackend::with_probe_status(
            Ok(()),
        )))
        .unwrap();
        reg.register(Arc::new(windows_t1::WindowsT1Backend::with_probe_status(
            Ok(()),
            Err("no runner".into()),
        )))
        .unwrap();
        assert_eq!(
            reg.names(),
            vec![seatbelt::BACKEND_NAME, windows_t1::BACKEND_NAME]
        );
        #[cfg(target_os = "linux")]
        {
            assert!(matches!(
                reg.select(Some(seatbelt::BACKEND_NAME)),
                Err(nofy_isolation::SelectError::WrongPlatform { .. })
            ));
            assert!(matches!(
                reg.select(Some(windows_t1::BACKEND_NAME)),
                Err(nofy_isolation::SelectError::WrongPlatform { .. })
            ));
        }
    }
}
