#![allow(
    unused_imports,
    unused_variables,
    unused_mut,
    unreachable_code,
    dead_code
)]
#[cfg(all(feature = "jemalloc", unix))]
#[global_allocator]
static GLOBAL: tikv_jemallocator::Jemalloc = tikv_jemallocator::Jemalloc;
use anyhow::Result;
use std::env;
use std::net::SocketAddr;
use std::num::NonZeroUsize;
use tokio_util::sync::CancellationToken;
use nofy_pager::app::{
    AgentCmd, Command, HeadlessArgs, LeaderMgmtArgs, LeaderMgmtCommand, LeaderMode,
    LeaderTargetArgs, PagerArgs, join_early_prefetch, resolve_leader_mode,
    warn_leader_disabled_by_sandbox,
};
use nofy_pager::app::{WorkspaceMgmtArgs, WorkspaceMgmtCommand, WorkspaceStartArgs};
use nofy_pager::client_identity::PAGER_CLIENT_VERSION;
use nofy_shell::agent::app::{run_headless, run_leader, run_stdio_agent};
use nofy_shell::agent::config::Config as AgentConfig;
/// Apply headless args to an existing config, only overriding values that are
/// explicitly set. This allows environment defaults to be preserved when
/// specific args are not provided.
fn apply_headless_args_to_config(args: &HeadlessArgs, config: &mut AgentConfig) {
    if let Some(v) = &args.nofy_ws_origin {
        config.nofy_com_config.nofy_ws_origin = v.clone();
    }
}
/// Apply global endpoint CLI args to an existing config.
fn apply_agent_endpoint_args(
    agent_args: &nofy_pager::app::AgentArgs,
    config: &mut AgentConfig,
) {
    if let Some(v) = &agent_args.cli_chat_proxy_base_url {
        config.endpoints.cli_chat_proxy_base_url = Some(v.clone());
    }
    if let Some(v) = &agent_args.xai_api_base_url {
        config.endpoints.xai_api_base_url = v.clone();
    }
}
/// Resolve --agent-profile path: canonicalize and verify the file exists.
fn resolve_agent_profile_path(path: &std::path::Path) -> std::path::PathBuf {
    match dunce::canonicalize(path) {
        Ok(abs) if abs.is_file() => abs,
        Ok(abs) => {
            eprintln!(
                "error: --agent-profile path is not a file: {}",
                abs.display()
            );
            std::process::exit(1);
        }
        Err(e) => {
            eprintln!("error: --agent-profile path '{}': {}", path.display(), e);
            std::process::exit(1);
        }
    }
}
/// Print startup information for the serve command.
fn print_serve_startup_info(bind_addr: SocketAddr, secret: &str) {
    eprintln!();
    eprintln!("   Nofy agent server starting...");
    eprintln!();
    eprintln!("   Address:  {}:{}", bind_addr.ip(), bind_addr.port());
    eprintln!("   Secret:   {}", secret);
    eprintln!();
    eprintln!(
        "   WebSocket URL: ws://{}/ws?server-key={}",
        bind_addr, secret
    );
    eprintln!();
}
/// Entrypoint tag for `nofy -p`; keys the quiet stderr default in `init_tracing_simple`.
const HEADLESS_ENTRYPOINT: &str = "headless";
/// Initialize simple tracing for non-TUI agent modes.
fn init_tracing_simple(app_entrypoint: &'static str) {
    use tracing_subscriber::{EnvFilter, Layer as _, fmt, layer::SubscriberExt as _};
    use nofy_telemetry::debug_log::RMCP_SSE_NOISE_TARGET;
    let default_filter = if app_entrypoint == HEADLESS_ENTRYPOINT {
        "off"
    } else {
        "error"
    };
    let env_filter = match EnvFilter::try_from_default_env() {
        Ok(filter) => filter.add_directive(
            format!("{RMCP_SSE_NOISE_TARGET}=error")
                .parse()
                .expect("static rmcp directive must parse"),
        ),
        Err(_) => EnvFilter::new(default_filter),
    };
    let fmt_layer = fmt::layer()
        .with_target(false)
        .with_ansi(true)
        .with_writer(std::io::stderr);
    let registry = tracing_subscriber::registry()
        .with(fmt_layer.with_filter(env_filter))
        .with(nofy_telemetry::sampling_log::layer())
        .with(nofy_telemetry::instrumentation::layer())
        .with(nofy_telemetry::hooks_log::layer())
        .with(nofy_telemetry::otel_layer::build_otel_layer(
            nofy_telemetry::otel_layer::OtelClientInfo {
                client_name: "nofy-pager",
                client_version: nofy_version::VERSION,
                service_version: env!("VERSION_WITH_COMMIT"),
                app_entrypoint,
            },
            nofy_shell::auth::credential_provider::build_default_otel_layer_config(),
        ));
    nofy_telemetry::debug_log::install_firehose(registry, app_entrypoint);
    nofy_telemetry::external::init(
        nofy_shell::agent::config::resolve_external_otel_config(
            nofy_telemetry::external::config::ExternalClientInfo {
                service_version: env!("VERSION_WITH_COMMIT").to_owned(),
                client_version: nofy_version::VERSION.to_owned(),
                app_entrypoint: app_entrypoint.to_owned(),
            },
        ),
    );
}
/// Leader management (`nofy leader list|info|kill`) was removed with the
/// leader infrastructure in the sanitized build.
async fn run_leader_mgmt(args: LeaderMgmtArgs) -> Result<()> {
    let _ = args;
    anyhow::bail!(
        "leader mode was removed in the sanitized build; \
         there is no shared leader process to manage"
    )
}
/// `nofy workspace` exposure ran through the shared leader's control channel;
/// both were removed in the sanitized build.
async fn run_workspace_mgmt(args: WorkspaceMgmtArgs) -> Result<()> {
    let _ = args;
    anyhow::bail!(
        "`nofy workspace` was removed in the sanitized build \
         (it depended on the shared leader process)"
    )
}
/// Flush observability, then exit. Used by the agent/headless signal handler.
///
/// Does NOT write terminal escape codes — agent mode never enables TUI modes.
/// The TUI has its own signal handler (`app::signal_handler`) that does the
/// full crossterm teardown.
fn shutdown_and_flush_telemetry(exit_code: i32) -> ! {
    nofy_telemetry::otel_layer::shutdown_otel();
    nofy_telemetry::debug_log::flush();
    std::process::exit(exit_code);
}
const PLUGIN_DIR_LEADER_WARNING: &str = "nofy: --plugin-dir is ignored in leader mode; run with --no-leader to \
     load per-process plugins";
/// Run the `agent` subcommand, dispatching to the appropriate mode.
async fn run_agent_command(
    agent_args: Box<nofy_pager::app::AgentArgs>,
    permission_mode_flag: Option<String>,
    trust: bool,
) -> Result<()> {
    let _signal_flush = tokio::spawn(async {
        #[cfg(unix)]
        {
            use tokio::signal::unix::{SignalKind, signal};
            use nofy_pager::app::signal_handler::next_signal_code;
            let mut term = signal(SignalKind::terminate()).ok();
            let mut hup = signal(SignalKind::hangup()).ok();
            let code = next_signal_code(&mut term, &mut hup).await;
            shutdown_and_flush_telemetry(code);
        }
        #[cfg(not(unix))]
        {
            if tokio::signal::ctrl_c().await.is_ok() {
                shutdown_and_flush_telemetry(130);
            }
        }
    });
    init_tracing_simple("agent");
    let _otel_guard = nofy_telemetry::otel_layer::otel_guard();
    nofy_telemetry::instrumentation::install_panic_hook();
    if trust {
        match std::env::current_dir() {
            Ok(cwd) => nofy_shell::agent::folder_trust::grant_folder_trust(&cwd),
            Err(e) => {
                tracing::warn!(error = %e, "--trust: failed to resolve cwd; folder not trusted")
            }
        }
    }
    let early_prefetch = nofy_shell::agent::models::start_early_prefetch(None);
    nofy_shell::agent::mvp_agent::warm_async_http_client();
    tokio::task::spawn_blocking(|| {});
    let is_stdio = matches!(agent_args.mode, Some(AgentCmd::Stdio));
    let is_leader = matches!(agent_args.mode, Some(AgentCmd::Leader(_)));
    if !is_stdio && !is_leader {
        eprintln!(
            "Nofy Build (pager) - v{}",
            nofy_version::display_version_with_commit(env!("VERSION_WITH_COMMIT"))
        );
    }
    join_early_prefetch(early_prefetch);
    let raw_config = nofy_shell::config::load_effective_config()
        .map_err(|e| anyhow::anyhow!("Failed to load config: {}", e))?;
    let mut agent_config = AgentConfig::new_from_toml_cfg(&raw_config)
        .map_err(|e| anyhow::anyhow!("Failed to create agent config: {}", e))?;
    agent_config.default_model_override = agent_args.model.clone();
    agent_config.reasoning_effort_override = agent_args
        .reasoning_effort
        .as_deref()
        .and_then(nofy_shell::sampling::types::parse_canonical_effort_token);
    let launch_yolo = nofy_shell::util::config::effective_yolo_for_launch(
        agent_args.yolo,
        permission_mode_flag.as_deref(),
    );
    if let Some(warning) = launch_yolo.blocked_warning {
        eprintln!("nofy: {warning}");
    }
    agent_config.default_yolo_mode = launch_yolo.yolo;
    agent_config.default_auto_mode = nofy_shell::util::config::effective_auto_for_launch(
        agent_args.yolo,
        permission_mode_flag.as_deref(),
    );
    agent_config.agent_profile_path = agent_args
        .agent_profile
        .as_deref()
        .map(resolve_agent_profile_path);
    agent_config.client_version = Some(PAGER_CLIENT_VERSION.to_string());
    if is_leader && !agent_args.plugin_dirs.is_empty() {
        eprintln!("{PLUGIN_DIR_LEADER_WARNING}");
    } else {
        agent_config.plugins.cli_plugin_dirs = agent_args.canonical_plugin_dirs();
    }
    apply_agent_endpoint_args(&agent_args, &mut agent_config);
    agent_config.resolve_runtime_fields(&nofy_shell::agent::config::RuntimeResolutionContext {
        raw_config: &raw_config,
        is_headless: !is_leader,
        cli_subagents: None,
        cli_session_summary_model: None,
        cli_experimental_memory: false,
        cli_no_memory: false,
        todo_gate: false,
        laziness_debug_log: None,
        storage_mode: None,
    });
    let agent_memory_config = agent_config.memory_config.clone();
    let leader_eligible = matches!(
        &agent_args.mode,
        None | Some(AgentCmd::Stdio) | Some(AgentCmd::Headless(_))
    );
    let requested_confinement = nofy_sandbox::requested_confinement_profile();
    let LeaderMode {
        use_leader: resolved_use_leader,
        policy_disable_reason,
        disabled_by_confinement,
    } = resolve_leader_mode(
        agent_args.leader,
        agent_args.no_leader,
        &raw_config,
        leader_eligible,
        requested_confinement,
    );
    // Leader mode was removed in the sanitized build; the embedded agent is
    // always used, even for `--leader` / `[cli] use_leader = true`.
    if resolved_use_leader {
        tracing::info!("leader mode is unavailable in this build; using the embedded agent");
    }
    let use_leader = false;
    tracing::info!(
        use_leader,
        ?policy_disable_reason,
        sandbox_profile = ?requested_confinement,
        leader_disabled_by_sandbox = disabled_by_confinement.is_some(),
        "leader mode resolved"
    );
    if let Some(profile) = disabled_by_confinement {
        warn_leader_disabled_by_sandbox(profile);
    }
    match agent_args.mode {
        Some(AgentCmd::Stdio) => run_stdio_agent(&agent_config, None, agent_memory_config).await,
        Some(AgentCmd::Headless(a)) => {
            let mut agent_config = agent_config.clone();
            apply_headless_args_to_config(&a, &mut agent_config);
            run_headless(&agent_config, false, agent_memory_config).await
        }
        Some(AgentCmd::Serve(a)) => {
            let mut agent_config = agent_config.clone();
            apply_headless_args_to_config(&a.headless, &mut agent_config);
            let secret = a.get_secret();
            let server_config = nofy_shell::agent::ServerConfig {
                bind_addr: a.bind,
                secret: secret.clone(),
            };
            print_serve_startup_info(a.bind, &secret);
            nofy_shell::agent::run_agent_server(server_config, agent_config).await
        }
        Some(AgentCmd::Leader(a)) => {
            let mut agent_config = agent_config.clone();
            apply_headless_args_to_config(&a.headless, &mut agent_config);
            // Leader mode was removed in the sanitized build; `run_leader`
            // bails with an explanatory error.
            run_leader(
                &agent_config,
                a.no_exit_on_disconnect,
                a.relay_on_demand,
                agent_memory_config,
            )
            .await
        }
        None => {
            let mut agent_config = agent_config.clone();
            apply_headless_args_to_config(&agent_args.headless, &mut agent_config);
            run_headless(&agent_config, false, agent_memory_config).await
        }
    }
}
/// Raise the per-process fd soft limit toward the hard limit.
///
/// Default soft limits (256 macOS, commonly 1024 Linux) are easily exceeded:
/// each session thread's runtime costs ~3 fds, and a wide parallel subagent
/// wave adds spawn-burst transients — a 1024 limit fails with EMFILE under a
/// ~100-session wave. Targets 65536 on Linux (hard limits typically >= 1M)
/// and 8192 on macOS (`kern.maxfilesperproc` is often ~10k). No known
/// in-tree `select(2)` users (Rust std/tokio use epoll/kqueue); residual
/// third-party `FD_SETSIZE` risk is accepted — the prior 8192 cap already
/// exceeded FD_SETSIZE.
///
/// Best-effort: never blocks startup (containers/cgroups may pin limits).
#[cfg(unix)]
fn raise_fd_limit() {
    #[cfg(target_os = "macos")]
    const TARGET: libc::rlim_t = 8192;
    #[cfg(not(target_os = "macos"))]
    const TARGET: libc::rlim_t = 65536;
    unsafe {
        let mut rlim = libc::rlimit {
            rlim_cur: 0,
            rlim_max: 0,
        };
        if libc::getrlimit(libc::RLIMIT_NOFILE, &mut rlim) != 0 {
            return;
        }
        let new_cur = rlim.rlim_max.min(TARGET);
        if new_cur <= rlim.rlim_cur {
            return;
        }
        let old = rlim.rlim_cur;
        rlim.rlim_cur = new_cur;
        if libc::setrlimit(libc::RLIMIT_NOFILE, &rlim) == 0 {
            tracing::trace!(old, new = new_cur, "raised RLIMIT_NOFILE");
        }
    }
}
#[cfg(not(unix))]
fn raise_fd_limit() {}
/// Single audit point for the `Command::Dashboard` soft-subcommand.
/// Sets `NOFY_OPEN_DASHBOARD_AT_STARTUP=1` if the user asked for
/// `nofy dashboard`, and clears `args.command` so the regular
/// subcommand match doesn't try to handle it.
///
/// The dashboard is independent of leader mode — it renders local
/// sessions and, when a leader happens to be present, additionally shows
/// the leader roster — so `nofy dashboard` does NOT force leader mode and
/// is compatible with `--no-leader`.
///
/// The only gate is the feature flag: a disabled dashboard
/// (`[dashboard].enabled = false` / `NOFY_AGENT_DASHBOARD=0`) is a CLI
/// error here, before the TUI starts, because the welcome view silently
/// drops the equivalent runtime toast.
fn flag_dashboard_at_startup_if_requested(args: &mut PagerArgs) -> Result<()> {
    if !matches!(args.command, Some(Command::Dashboard)) {
        return Ok(());
    }
    if !nofy_pager::views::dashboard::dashboard_enabled() {
        anyhow::bail!(
            "the Agent Dashboard is disabled. Enable it by removing \
             `[dashboard] enabled = false` from ~/.nofy/config.toml and \
             unsetting NOFY_AGENT_DASHBOARD=0."
        );
    }
    args.command = None;
    unsafe { std::env::set_var("NOFY_OPEN_DASHBOARD_AT_STARTUP", "1") };
    Ok(())
}
const RUNTIME_SHUTDOWN_GRACE: std::time::Duration = std::time::Duration::from_secs(2);
const NOFY_WORKER_THREADS_ENV: &str = "NOFY_WORKER_THREADS";
/// tokio defaults to one worker per logical CPU. On a host with hundreds of
/// CPUs that can exhaust a cgroup thread budget at startup and abort under
/// `panic = "abort"`. A terminal UI is I/O-bound, so cap at 8.
const DEFAULT_MAX_WORKER_THREADS: NonZeroUsize = NonZeroUsize::new(8).unwrap();
/// How `NOFY_WORKER_THREADS` resolved.
#[derive(Debug, PartialEq, Eq)]
enum WorkerCount {
    Accepted(NonZeroUsize),
    Clamped {
        requested: i128,
        used: NonZeroUsize,
        cores: NonZeroUsize,
    },
    Ignored {
        value: String,
        used: NonZeroUsize,
    },
}
impl WorkerCount {
    fn used(&self) -> NonZeroUsize {
        match self {
            Self::Accepted(used) | Self::Clamped { used, .. } | Self::Ignored { used, .. } => *used,
        }
    }
    fn notice(&self) -> Option<String> {
        match self {
            Self::Accepted(_) => None,
            Self::Clamped {
                requested,
                used,
                cores,
            } => Some(format!(
                "nofy: clamped {NOFY_WORKER_THREADS_ENV}={requested} to {used} (valid range is 1..={cores})"
            )),
            Self::Ignored { value, .. } => Some(format!(
                "nofy: ignoring {NOFY_WORKER_THREADS_ENV}={value:?} (not a valid integer)"
            )),
        }
    }
}
fn cli_worker_threads() -> NonZeroUsize {
    let cores = std::thread::available_parallelism().unwrap_or(NonZeroUsize::MIN);
    let resolved = match std::env::var(NOFY_WORKER_THREADS_ENV) {
        Ok(value) => worker_threads_from(Some(&value), cores),
        Err(std::env::VarError::NotPresent) => worker_threads_from(None, cores),
        Err(std::env::VarError::NotUnicode(value)) => WorkerCount::Ignored {
            value: value.to_string_lossy().into_owned(),
            used: default_worker_threads(cores),
        },
    };
    if let Some(notice) = resolved.notice() {
        eprintln!("{notice}");
    }
    resolved.used()
}
fn worker_threads_from(env_override: Option<&str>, cores: NonZeroUsize) -> WorkerCount {
    match env_override {
        Some(value) => resolve_worker_override(value, cores),
        None => WorkerCount::Accepted(default_worker_threads(cores)),
    }
}
fn default_worker_threads(cores: NonZeroUsize) -> NonZeroUsize {
    cores.min(DEFAULT_MAX_WORKER_THREADS)
}
fn resolve_worker_override(value: &str, cores: NonZeroUsize) -> WorkerCount {
    let Ok(requested) = value.trim().parse::<i128>() else {
        return WorkerCount::Ignored {
            value: value.to_owned(),
            used: default_worker_threads(cores),
        };
    };
    let clamped = requested.clamp(1, cores.get() as i128) as usize;
    let used = NonZeroUsize::new(clamped).expect("clamp floor of 1 guarantees non-zero");
    if requested == used.get() as i128 {
        WorkerCount::Accepted(used)
    } else {
        WorkerCount::Clamped {
            requested,
            used,
            cores,
        }
    }
}
/// A plain runtime drop blocks forever on an uncancellable in-flight blocking
/// task; `shutdown_timeout` abandons it after `grace` so exit can't hang.
fn run_and_shutdown<F: std::future::Future>(
    runtime: tokio::runtime::Runtime,
    fut: F,
    grace: std::time::Duration,
) -> F::Output {
    let output = runtime.block_on(fut);
    runtime.shutdown_timeout(grace);
    output
}
/// Return freed-but-retained jemalloc pages to the OS.
///
/// `arena.<MALLCTL_ARENAS_ALL>.purge` madvises away all dirty/muzzy pages in
/// every arena. The pager invokes this (via the `memory_release` seam) right
/// after known memory cliffs — e.g. dropping a session load's replay
/// transient — so a long-session resume doesn't leave hundreds of MB of dead
/// pages counted against the process for its lifetime (macOS keeps
/// `MADV_FREE`d pages in RSS until systemwide pressure).
#[cfg(all(feature = "jemalloc", unix))]
fn purge_jemalloc_retained_pages() {
    static NAME: &[u8] = b"arena.4096.purge\0";
    let ret = unsafe {
        tikv_jemalloc_sys::mallctl(
            NAME.as_ptr().cast(),
            std::ptr::null_mut(),
            std::ptr::null_mut(),
            std::ptr::null_mut(),
            0,
        )
    };
    if ret != 0 {
        static WARN_ONCE: std::sync::Once = std::sync::Once::new();
        WARN_ONCE.call_once(|| {
            tracing::warn!(
                errno = ret,
                "jemalloc arena purge mallctl failed; retained-page release is inert"
            );
        });
    }
}
/// Allocator gauges for the memory trace (`memory_trace` seam): advance the
/// jemalloc epoch so the `stats.*` reads are current, then read each gauge.
/// Returns `None` if any mallctl fails (trace records the absence). Rides
/// the `tikv-jemalloc-ctl` raw helpers (introduced by the heap-profile
/// hooks below) instead of hand-rolled mallctl.
#[cfg(all(feature = "jemalloc", unix))]
fn jemalloc_allocator_stats() -> Option<nofy_pager::memory_trace::AllocatorStats> {
    /// SAFETY: callers pass fixed NUL-terminated `stats.*` size_t ctl names.
    unsafe fn gauge(name: &[u8]) -> Option<u64> {
        unsafe {
            tikv_jemalloc_ctl::raw::read::<usize>(name)
                .ok()
                .map(|v| v as u64)
        }
    }
    unsafe {
        tikv_jemalloc_ctl::raw::write(b"epoch\0", 1u64).ok()?;
        Some(nofy_pager::memory_trace::AllocatorStats {
            allocated: gauge(b"stats.allocated\0")?,
            active: gauge(b"stats.active\0")?,
            resident: gauge(b"stats.resident\0")?,
            mapped: gauge(b"stats.mapped\0")?,
            retained: gauge(b"stats.retained\0")?,
            metadata: gauge(b"stats.metadata\0")?,
        })
    }
}
/// Full jemalloc statistics dump for threshold snapshots
/// (`malloc_stats_print` default human-readable format, arena detail
/// included) — the artifact the GCS memory-trace upload ships for offline
/// analysis. Raw `tikv_jemalloc_sys` because jemalloc-ctl has no
/// callback-form stats_print.
#[cfg(all(feature = "jemalloc", unix))]
fn jemalloc_stats_dump() -> String {
    unsafe extern "C" fn append(opaque: *mut std::ffi::c_void, msg: *const std::ffi::c_char) {
        unsafe {
            let out = &mut *opaque.cast::<String>();
            out.push_str(&std::ffi::CStr::from_ptr(msg).to_string_lossy());
        }
    }
    let mut out = String::new();
    unsafe {
        tikv_jemalloc_sys::malloc_stats_print(
            Some(append),
            (&raw mut out).cast(),
            std::ptr::null(),
        );
    }
    out
}
fn version_text() -> String {
    format!(
        "nofy {}\n",
        nofy_version::display_version_with_commit(env!("VERSION_WITH_COMMIT"))
    )
}
fn write_version(writer: &mut impl std::io::Write) -> std::io::Result<()> {
    writer.write_all(version_text().as_bytes())
}
fn dispatch_version_if_requested(args: &PagerArgs) -> bool {
    if !args.version {
        return false;
    }
    if let Err(error) = write_version(&mut std::io::stdout().lock()) {
        eprintln!("Error: {error}");
        std::process::exit(1);
    }
    true
}
fn dispatch_doctor_if_requested(args: &PagerArgs) -> bool {
    let Some(Command::Doctor(doctor_args)) = &args.command else {
        return false;
    };
    if let Err(error) = nofy_pager::doctor_cmd::run(doctor_args.clone()) {
        eprintln!("Error: {error:#}");
        std::process::exit(1);
    }
    true
}
fn main() {
    nofy_telemetry::startup::mark_process_start();
    if let Some(code) = nofy_pager::app::mermaid_worker::maybe_run_render_subprocess() {
        std::process::exit(code);
    }
    let args = PagerArgs::parse_cli();
    if dispatch_version_if_requested(&args) || dispatch_doctor_if_requested(&args) {
        return;
    }
    nofy_pager_minimal::install();
    #[cfg(all(feature = "jemalloc", unix))]
    nofy_pager::memory_release::install_release_hook(purge_jemalloc_retained_pages);
    #[cfg(all(feature = "jemalloc", unix))]
    {
        nofy_pager::memory_trace::install_allocator_stats_provider(jemalloc_allocator_stats);
        nofy_pager::memory_trace::install_allocator_dump_provider(jemalloc_stats_dump);
    }
    nofy_pager::memory_trace::start(
        nofy_shell::util::nofy_home::nofy_home().join("memtrace"),
    );
    raise_fd_limit();
    if let Err(e) = nofy_config::validate_requirements() {
        eprintln!("Couldn't start Nofy: {e}");
        eprintln!();
        eprintln!(
            "Update Nofy to a version the policy allows, or ask your administrator \
             to fix the managed requirements."
        );
        std::process::exit(2);
    }
    nofy_pager::docs::extract_user_guide_docs(&nofy_shell::util::nofy_home::nofy_home());
    nofy_crash_handler::install_terminal_restore_only();
    if nofy_shell::util::config::load_crash_handler_enabled_sync() {
        let crash_dir = nofy_shell::util::nofy_home::nofy_home().join("crash");
        if let Some(report) = nofy_crash_handler::check_previous_crash(&crash_dir) {
            eprintln!("Nofy crashed during your last session.");
            eprintln!("  Signal:  {}", report.signal_name);
            eprintln!("  Version: {}", report.app_version);
            eprintln!("  Report:  {}", report.report_path.display());
            eprintln!();
        }
        if !nofy_crash_handler::install(nofy_crash_handler::CrashHandlerConfig {
            app_version: env!("VERSION_WITH_COMMIT").to_string(),
            crash_dir: crash_dir.clone(),
        }) {
            eprintln!(
                "warning: crash handler enabled but failed to install (check permissions on {})",
                crash_dir.display()
            );
        }
    }
    let crashed = nofy_shell::active_sessions::collect_crashed().unwrap_or_default();
    if !crashed.is_empty() {
        tracing::info!(
            count = crashed.len(),
            "Found crashed sessions from a previous run"
        );
    }
    let workers = cli_worker_threads();
    let runtime = tokio::runtime::Builder::new_multi_thread()
        .worker_threads(workers.get())
        .enable_all()
        .build()
        .unwrap_or_else(|e| {
            eprintln!("nofy: failed to start tokio runtime with {workers} workers: {e}");
            shutdown_and_flush_telemetry(1);
        });
    let result = run_and_shutdown(runtime, async_main(args), RUNTIME_SHUTDOWN_GRACE);
    nofy_telemetry::debug_log::flush();
    if let Err(e) = result {
        nofy_tty_utils::restore_native_stderr();
        eprintln!("Error: {e:#}");
        std::process::exit(1);
    }
}
async fn async_main(args: PagerArgs) -> Result<()> {
    let _ = rustls::crypto::ring::default_provider().install_default();
    let mut args = args.apply_cwd()?;
    if let Some(ref mode) = args.compaction_mode {
        unsafe { std::env::set_var("NOFY_COMPACTION_MODE", mode) };
    }
    if let Some(ref detail) = args.compaction_detail {
        unsafe { std::env::set_var("NOFY_COMPACTION_DETAIL", detail) };
    }
    if args.chat() {
        unsafe {
            std::env::set_var(nofy_shell::agent::chat_modes::NOFY_CHAT_MODE_ENV, "1");
        }
    }
    // `--leader-socket` only fed the removed leader IPC path; accepted and ignored.
    if let Some(ref path) = args.debug_file {
        unsafe {
            std::env::set_var("NOFY_DEBUG_LOG", path);
            std::env::remove_var("NOFY_LOG_FILE");
        }
    }
    if args.debug || args.debug_file.is_some() {
        let set_if_unset = |k: &str, v: &str| {
            if std::env::var_os(k).is_none() {
                unsafe { std::env::set_var(k, v) };
            }
        };
        set_if_unset("NOFY_DEBUG_LOG", "1");
        set_if_unset("NOFY_HOOKS_LOG", "1");
    }
    if let Some(Command::Completions { shell }) = &args.command {
        nofy_pager::completions_cmd::run(*shell);
        return Ok(());
    }
    if let Some(Command::Wrap(ref wrap_args)) = args.command {
        return nofy_pager::wrap_cmd::run(wrap_args);
    }
    args.pin_local_resume_target()?;
    let saved_profile = args.saved_resume_profile();
    let sandbox_profile_arg = match args.startup_sandbox_profile(saved_profile.as_deref()) {
        nofy_pager::app::cli::SandboxStartup::Apply(profile) => profile,
        nofy_pager::app::cli::SandboxStartup::Conflict { requested, saved } => {
            eprintln!(
                "error: cannot resume this session under sandbox profile '{requested}' — \
                 it was created with '{saved}'. Omit --sandbox to resume with '{saved}', \
                 or start a new session to use '{requested}'."
            );
            std::process::exit(1);
        }
    };
    nofy_shell::config::apply_sandbox(
        None,
        sandbox_profile_arg.as_deref(),
        args.cwd.as_deref(),
    );
    flag_dashboard_at_startup_if_requested(&mut args)?;
    let is_interactive = args.command.is_none()
        && args.single.is_none()
        && args.prompt_json.is_none()
        && args.prompt_file.is_none();
    nofy_shell::http::set_client_name(if is_interactive {
        nofy_workspace::permission::ClientType::NofyPager
    } else {
        nofy_workspace::permission::ClientType::Generic
    });
    if let Some(command) = args.command.take() {
        match command {
            Command::Daemon => {
                // Per-host control plane: state lives under NOFY_HOME so the
                // registry walks the same session tree the shells index.
                init_tracing_simple("daemon");
                let cfg = nofy_daemon::daemon::DaemonConfig {
                    state_dir: nofy_shell::util::nofy_home::nofy_home(),
                };
                let code = nofy_daemon::daemon::run(cfg);
                std::process::exit(code);
            }
            Command::Schedule(schedule_args) => {
                // Z wiring: schedule management speaks the control socket to
                // the daemon under the same NOFY_HOME the daemon serves.
                let state_dir = nofy_shell::util::nofy_home::nofy_home();
                nofy_pager::schedule_cmd::run(&schedule_args, &state_dir)?;
                return Ok(());
            }
            Command::Task(task_args) => {
                // W-7 wiring: delegation verbs speak the control socket to
                // the daemon under the same NOFY_HOME the daemon serves.
                let state_dir = nofy_shell::util::nofy_home::nofy_home();
                nofy_pager::task_cmd::run(&task_args, &state_dir)?;
                return Ok(());
            }
            Command::Approval(approval_args) => {
                // W-4 wiring: the batch-approval entry speaks the control
                // socket to the daemon under the same NOFY_HOME.
                let state_dir = nofy_shell::util::nofy_home::nofy_home();
                nofy_pager::approval_cmd::run(&approval_args, &state_dir)?;
                return Ok(());
            }
            Command::Trash(trash_args) => {
                // W-9 wiring: the trash lives on disk under NOFY_HOME —
                // no daemon round-trip needed.
                let state_dir = nofy_shell::util::nofy_home::nofy_home();
                nofy_pager::trash_cmd::run(&trash_args, &state_dir)?;
                return Ok(());
            }
            Command::Forensics(forensics_args) => {
                // U8-09 wiring: the ledger lives on disk under NOFY_HOME —
                // no daemon round-trip needed.
                let state_dir = nofy_shell::util::nofy_home::nofy_home();
                nofy_pager::forensics_cmd::run(&forensics_args, &state_dir)?;
                return Ok(());
            }
            Command::Lease(lease_args) => {
                // U9-06 wiring: the lease table lives on disk under
                // NOFY_HOME — no daemon round-trip needed.
                let state_dir = nofy_shell::util::nofy_home::nofy_home();
                nofy_pager::lease_cmd::run(&lease_args, &state_dir)?;
                return Ok(());
            }
            Command::Version { json } => {
                if json {
                    let payload = serde_json::json!({
                        "currentVersion": env!("VERSION_WITH_COMMIT"),
                    });
                    println!("{}", serde_json::to_string(&payload)?);
                } else {
                    write_version(&mut std::io::stdout().lock())?;
                }
                return Ok(());
            }
            Command::Agent(agent_args) => {
                if args.leader || args.no_leader {
                    let flag = if args.leader {
                        "--leader"
                    } else {
                        "--no-leader"
                    };
                    anyhow::bail!(
                        "top-level {flag} applies to the pager TUI, not the agent subcommand. \
                         Use `nofy-pager agent {flag}` instead."
                    );
                }
                return run_agent_command(
                    agent_args,
                    args.permission_mode_flag.clone(),
                    args.trust,
                )
                .await;
            }
            Command::Doctor(_) => {
                unreachable!("doctor was consumed before runtime startup")
            }
            Command::Inspect { json } => {
                let cwd = std::env::current_dir().unwrap_or_default();
                nofy_shell::inspect::inspect(&cwd, json).await?;
                return Ok(());
            }
            Command::Mcp(mcp_args) => {
                init_tracing_simple("cli");
                return nofy_pager::mcp_cmd::run(mcp_args).await;
            }
            Command::Plugin(plugin_args) => {
                init_tracing_simple("cli");
                let _otel_guard = nofy_telemetry::otel_layer::otel_guard();
                return nofy_pager::plugin_cmd::run(plugin_args).await;
            }
            Command::Models => {
                init_tracing_simple("cli");
                let _otel_guard = nofy_telemetry::otel_layer::otel_guard();
                let config = nofy_shell::config::load_effective_config_disk_only()
                    .map_err(|e| anyhow::anyhow!("Failed to load config: {e}"))?;
                let agent_config = AgentConfig::new_from_toml_cfg(&config)
                    .map_err(|e| anyhow::anyhow!("Failed to create agent config: {e}"))?;
                return nofy_pager::models::list_available_models(&agent_config).await;
            }
            Command::Leader(leader_args) => {
                init_tracing_simple("cli");
                let _otel_guard = nofy_telemetry::otel_layer::otel_guard();
                return run_leader_mgmt(leader_args).await;
            }
            Command::Worktree(worktree_args) => {
                init_tracing_simple("cli");
                let _otel_guard = nofy_telemetry::otel_layer::otel_guard();
                let config = nofy_shell::config::load_effective_config_disk_only()
                    .map_err(|e| anyhow::anyhow!("Failed to load config: {e}"))?;
                let agent_config = AgentConfig::new_from_toml_cfg(&config)
                    .map_err(|e| anyhow::anyhow!("Failed to create agent config: {e}"))?;
                return nofy_pager::worktree_cmd::run(worktree_args, &agent_config).await;
            }
            Command::DiskUsage(disk_usage_args) => {
                init_tracing_simple("cli");
                let _otel_guard = nofy_telemetry::otel_layer::otel_guard();
                return nofy_pager::disk_usage_cmd::run(disk_usage_args);
            }
            Command::Workspace(workspace_args) => {
                init_tracing_simple("cli");
                let _otel_guard = nofy_telemetry::otel_layer::otel_guard();
                return run_workspace_mgmt(workspace_args).await;
            }
            Command::Sessions(sessions_args) => {
                init_tracing_simple("cli");
                let _otel_guard = nofy_telemetry::otel_layer::otel_guard();
                return nofy_pager::sessions_cmd::run(sessions_args).await;
            }
            Command::Export(export_args) => {
                init_tracing_simple("cli");
                return nofy_pager::export_cmd::run(export_args);
            }
            Command::Trace(trace_args) => {
                init_tracing_simple("cli");
                let _otel_guard = nofy_telemetry::otel_layer::otel_guard();
                let config = nofy_shell::config::load_effective_config_disk_only()
                    .map_err(|e| anyhow::anyhow!("Failed to load config: {e}"))?;
                let agent_config = AgentConfig::new_from_toml_cfg(&config)
                    .map_err(|e| anyhow::anyhow!("Failed to create agent config: {e}"))?;
                return nofy_pager::trace_cmd::run(trace_args, &agent_config).await;
            }
            Command::Memory(memory_args) => {
                return nofy_pager::memory_cmd::run(memory_args);
            }
            Command::Wrap(ref wrap_args) => {
                return nofy_pager::wrap_cmd::run(wrap_args);
            }
            Command::Completions { shell } => {
                nofy_pager::completions_cmd::run(shell);
                return Ok(());
            }
            Command::Dashboard => {
                args.command = Some(Command::Dashboard);
                flag_dashboard_at_startup_if_requested(&mut args)?;
            }
        }
    }
    let headless_prompt = nofy_pager::headless::HeadlessPrompt::from_args(
        args.single.as_deref(),
        args.prompt_json.as_deref(),
        args.prompt_file.as_deref(),
    )?;
    if let Some(prompt) = headless_prompt {
        init_tracing_simple(HEADLESS_ENTRYPOINT);
        let _otel_guard = nofy_telemetry::otel_layer::otel_guard();
        let launch_yolo = nofy_shell::util::config::effective_yolo_for_launch(
            args.yolo,
            args.permission_mode_flag.as_deref(),
        );
        if let Some(warning) = launch_yolo.blocked_warning {
            eprintln!("nofy: {warning}");
        }
        let json_schema = args
            .json_schema
            .as_deref()
            .map(nofy_pager::headless::parse_json_schema)
            .transpose()?;
        if json_schema.is_some()
            && args.output_format == nofy_pager::headless::OutputFormat::Plain
        {
            args.output_format = nofy_pager::headless::OutputFormat::Json;
        }
        return nofy_pager::headless::run_single_turn(
            prompt,
            args.verbatim,
            nofy_pager::headless::HeadlessOptions {
                session_id: args.session_id.clone(),
                resume: args.resume_session.or(args.load_session),
                resume_title_pinned: args.resume_target_pinned,
                cwd: args.cwd,
                yolo: launch_yolo.yolo,
                trust: args.trust,
                output_format: args.output_format,
                include_partial_messages: args.include_partial_messages,
                json_schema,
                model: args.model,
                rules: args.rules,
                system_prompt_override: args.system_prompt_override.clone(),
                continue_last_session: args.continue_last_session,
                fork_session: args.fork_session,
                worktree: args.worktree,
                restore_code: args.restore_code,
                agent: args.agent.clone(),
                agents_json: args.agents_json.clone(),
                cli_tools: args.cli_tools.clone(),
                cli_disallowed_tools: args.cli_disallowed_tools.clone(),
                experimental_memory: args.experimental_memory,
                no_memory: args.no_memory,
                allow_rules: args.allow_rules.clone(),
                deny_rules: args.deny_rules.clone(),
                max_turns: args.max_turns,
                permission_mode_flag: args.permission_mode_flag.clone(),
                reasoning_effort: args.reasoning_effort.clone(),
                wait_for_background: !args.no_wait_for_background,
                background_wait_timeout: std::time::Duration::from_secs(
                    args.background_wait_timeout_secs,
                ),
            },
        )
        .await;
    }
    let _otel_guard = nofy_telemetry::otel_layer::otel_guard();
    let result = nofy_pager::app::run(args).await;
    nofy_sandbox::flush();
    result
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn default_caps_the_core_count() {
        let nz = |n| NonZeroUsize::new(n).unwrap();
        assert_eq!(default_worker_threads(nz(360)), DEFAULT_MAX_WORKER_THREADS);
        assert_eq!(default_worker_threads(nz(4)), nz(4));
    }
    #[test]
    fn worker_threads_from_selects_default_or_override() {
        let nz = |n| NonZeroUsize::new(n).unwrap();
        let cores = nz(360);
        assert_eq!(
            worker_threads_from(None, cores),
            WorkerCount::Accepted(default_worker_threads(cores))
        );
        assert_eq!(
            worker_threads_from(Some("16"), cores),
            WorkerCount::Accepted(nz(16))
        );
    }
    #[test]
    fn override_in_range_is_used_without_a_notice() {
        let nz = |n| NonZeroUsize::new(n).unwrap();
        let cores = nz(360);
        assert_eq!(
            resolve_worker_override("16", cores),
            WorkerCount::Accepted(nz(16))
        );
        assert_eq!(resolve_worker_override("16", cores).notice(), None);
        assert_eq!(resolve_worker_override(" 8 ", cores).used().get(), 8);
        assert_eq!(
            resolve_worker_override("360", cores),
            WorkerCount::Accepted(cores)
        );
    }
    #[test]
    fn override_out_of_range_is_clamped_with_a_notice() {
        let nz = |n| NonZeroUsize::new(n).unwrap();
        let cores = nz(360);
        assert_eq!(
            resolve_worker_override("100000", cores),
            WorkerCount::Clamped {
                requested: 100000,
                used: cores,
                cores
            }
        );
        assert_eq!(
            resolve_worker_override("0", cores),
            WorkerCount::Clamped {
                requested: 0,
                used: nz(1),
                cores
            }
        );
        assert_eq!(
            resolve_worker_override("-1", cores),
            WorkerCount::Clamped {
                requested: -1,
                used: nz(1),
                cores
            }
        );
        assert_eq!(
            resolve_worker_override("100000", cores).notice().unwrap(),
            "nofy: clamped NOFY_WORKER_THREADS=100000 to 360 (valid range is 1..=360)"
        );
    }
    #[test]
    fn override_unparseable_is_ignored_with_a_notice() {
        let cores = NonZeroUsize::new(360).unwrap();
        for value in ["abc", "", "99999999999999999999999999999999999999999"] {
            let ignored = resolve_worker_override(value, cores);
            assert!(matches!(ignored, WorkerCount::Ignored { .. }), "{value}");
            assert_eq!(ignored.used(), default_worker_threads(cores), "{value}");
        }
        assert_eq!(
            resolve_worker_override("abc", cores).notice().unwrap(),
            "nofy: ignoring NOFY_WORKER_THREADS=\"abc\" (not a valid integer)"
        );
    }
    #[test]
    fn version_output_writer_contract() {
        let mut output = Vec::new();
        write_version(&mut output).unwrap();
        let output = String::from_utf8(output).unwrap();
        assert!(output.starts_with("nofy "));
        assert!(output.contains(env!("VERSION_WITH_COMMIT")));
        assert!(output.ends_with(")\n"), "{output:?}");
    }
    #[test]
    fn version_flags_and_doctor_are_distinct_early_intents() {
        let version = PagerArgs::try_parse_from(["nofy", "--version"]).unwrap();
        assert!(version.version);
        assert!(version.command.is_none());
        let short = PagerArgs::try_parse_from(["nofy", "-v"]).unwrap();
        assert!(short.version);
        assert!(short.command.is_none());
        let subcommand = PagerArgs::try_parse_from(["nofy", "version"]).unwrap();
        assert!(!subcommand.version);
        assert!(matches!(
            subcommand.command,
            Some(Command::Version { json: false })
        ));
    }
    use clap::Parser as _;
    /// `nofy dashboard` flags the startup hook without forcing leader mode —
    /// the dashboard is independent of leader mode, so the launch keeps
    /// whatever leader setting the user (or config) chose.
    #[serial_test::serial(NOFY_AGENT_DASHBOARD)]
    #[test]
    fn dashboard_subcommand_flags_startup_without_forcing_leader() {
        let mut args = PagerArgs::try_parse_from(["nofy", "dashboard"]).unwrap();
        assert!(!args.leader, "fixture: no explicit --leader");
        flag_dashboard_at_startup_if_requested(&mut args).unwrap();
        assert!(!args.leader, "dashboard must NOT force leader mode");
        assert!(
            args.command.is_none(),
            "soft subcommand must be consumed so the interactive path runs",
        );
        assert_eq!(
            std::env::var("NOFY_OPEN_DASHBOARD_AT_STARTUP").as_deref(),
            Ok("1"),
            "startup hook flag must be set",
        );
        unsafe { std::env::remove_var("NOFY_OPEN_DASHBOARD_AT_STARTUP") };
    }
    /// `nofy dashboard --no-leader` is allowed — the dashboard does not
    /// require a leader, so the combination launches into the dashboard in
    /// non-leader mode.
    #[serial_test::serial(NOFY_AGENT_DASHBOARD)]
    #[test]
    fn dashboard_subcommand_allows_no_leader() {
        let mut args = PagerArgs::try_parse_from(["nofy", "--no-leader", "dashboard"]).unwrap();
        flag_dashboard_at_startup_if_requested(&mut args)
            .expect("--no-leader + dashboard must be allowed");
        assert!(args.no_leader, "--no-leader must be preserved");
        assert!(!args.leader, "dashboard must not force leader mode");
        assert!(
            args.command.is_none(),
            "soft subcommand must be consumed so the interactive path runs",
        );
        assert_eq!(
            std::env::var("NOFY_OPEN_DASHBOARD_AT_STARTUP").as_deref(),
            Ok("1"),
            "startup hook flag must be set",
        );
        unsafe { std::env::remove_var("NOFY_OPEN_DASHBOARD_AT_STARTUP") };
    }
    /// `NOFY_AGENT_DASHBOARD=0` disables the feature — the subcommand
    /// must error visibly before the TUI starts.
    #[serial_test::serial(NOFY_AGENT_DASHBOARD)]
    #[test]
    fn dashboard_subcommand_errors_when_disabled() {
        unsafe { std::env::set_var("NOFY_AGENT_DASHBOARD", "0") };
        let mut args = PagerArgs::try_parse_from(["nofy", "dashboard"]).unwrap();
        let result = flag_dashboard_at_startup_if_requested(&mut args);
        unsafe { std::env::remove_var("NOFY_AGENT_DASHBOARD") };
        let err = result.expect_err("disabled dashboard must error");
        assert!(err.to_string().contains("disabled"), "got: {err}");
        assert!(
            std::env::var("NOFY_OPEN_DASHBOARD_AT_STARTUP").is_err(),
            "failure path must not flag the startup hook",
        );
    }
    fn multi_thread_runtime() -> tokio::runtime::Runtime {
        tokio::runtime::Builder::new_multi_thread()
            .enable_all()
            .build()
            .expect("build runtime")
    }
    #[test]
    fn run_and_shutdown_bounds_teardown_despite_stuck_blocking_task() {
        use std::time::{Duration, Instant};
        let grace = Duration::from_millis(200);
        let ceiling = grace * 8;
        let stuck_sleep = Duration::from_secs(10);
        let runtime = multi_thread_runtime();
        let (started_tx, started_rx) = std::sync::mpsc::channel::<()>();
        runtime.spawn_blocking(move || {
            let _ = started_tx.send(());
            std::thread::sleep(stuck_sleep);
        });
        started_rx.recv().expect("blocking task must start");
        let start = Instant::now();
        let out = run_and_shutdown(runtime, async { 7_u32 }, grace);
        let elapsed = start.elapsed();
        assert_eq!(out, 7, "must return the future's output");
        assert!(
            elapsed >= grace,
            "returned in {elapsed:?}, before the {grace:?} grace — timeout not exercised",
        );
        assert!(
            elapsed < ceiling,
            "teardown took {elapsed:?}; stuck task must be abandoned under {ceiling:?}",
        );
    }
    #[test]
    fn run_and_shutdown_is_fast_without_blocking_work() {
        use std::time::{Duration, Instant};
        let runtime = multi_thread_runtime();
        let grace = Duration::from_secs(5);
        let start = Instant::now();
        let out = run_and_shutdown(runtime, async { 42_u32 }, grace);
        let elapsed = start.elapsed();
        assert_eq!(out, 42, "must pass the future's output through");
        assert!(
            elapsed < grace,
            "clean teardown took {elapsed:?}; grace must be a ceiling, not a floor",
        );
    }
    #[test]
    fn run_and_shutdown_passes_err_output_through() {
        use std::time::Duration;
        let runtime = multi_thread_runtime();
        let out = run_and_shutdown(
            runtime,
            async { Err::<(), String>("boom".to_string()) },
            Duration::from_secs(5),
        );
        assert_eq!(
            out,
            Err("boom".to_string()),
            "Err output must pass through unchanged",
        );
    }
}
