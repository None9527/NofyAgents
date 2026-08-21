//! Daemon assembly (B-phase host wiring): the per-host control plane.
//!
//! Boot order is the authority chain:
//!
//! 1. single-instance lock (a second daemon exits `ALREADY_RUNNING`, never
//!    restart-loops);
//! 2. forensics `record_startup` + recovery decision — `Escalate` refuses
//!    auto-resume (stuck-loop signature, see `recovery`);
//! 3. health + out-of-loop watchdog (wedge exits `WEDGE_DETECTED`);
//! 4. UDS control listener speaking `nofy-channel` frames and
//!    `nofy-control-schema` methods;
//! 5. `sd_notify::ready` once the listener is live.
//!
//! The daemon owns NO session semantics: `SessionList` is served from
//! `nofy-session-registry` (disk walk), attach/streaming will be wired to the
//! shell's resident runtimes in a later piece (returns `NOT_READY` now).

use std::os::unix::net::UnixListener;
use std::path::PathBuf;
use std::time::Duration;

use nofy_session_registry::Registry;

use crate::approval::ApprovalBroker;
use crate::exit_codes;
use crate::live::LiveBus;
use crate::search_proxy::SearchProxy;
use crate::forensics::ForensicsLedger;
use crate::health::{spawn_watchdog, EventLoopHealth, WatchdogConfig};
use crate::recovery::{decide, RecoveryDecision};
use crate::SingleInstanceLock;

pub const CONTROL_SOCKET_NAME: &str = "control.sock";

/// Cross-surface approval deadline; expiry is fail-closed deny.
pub const DEFAULT_APPROVAL_TIMEOUT: Duration = Duration::from_secs(300);

// Run lifecycle (batch T): DaemonRun/DaemonStores/submit_run/resume_run
// live in `runlife.rs`; re-exported so every existing path keeps working.
pub use crate::runlife::{resume_run, submit_run, DaemonRun, DaemonStores};

pub struct DaemonConfig {
    pub state_dir: PathBuf,
}

/// Boot gates; returns the exit code when the daemon must NOT run.
pub fn preflight(cfg: &DaemonConfig) -> Result<(SingleInstanceLock, ForensicsLedger), i32> {
    let lock = SingleInstanceLock::acquire(&cfg.state_dir).map_err(|_| {
        tracing::warn!("another live daemon holds the lock");
        exit_codes::ALREADY_RUNNING
    })?;
    let daemon_dir = cfg.state_dir.join("daemon");
    let ledger = ForensicsLedger::open(&daemon_dir).map_err(|_| exit_codes::ERROR)?;
    let _unclean = ledger.record_startup().map_err(|_| exit_codes::ERROR)?;
    // Execution half of forensics: rotate the children registry and sweep
    // orphans vouched for by the dead predecessor.
    let children = crate::proc::ChildrenRegistry::at(&daemon_dir);
    let _ = children.rotate();
    for entry in children.sweep_prev() {
        tracing::warn!(pid = entry.pid, label = %entry.label, "orphan swept at boot");
    }
    match decide(&daemon_dir) {
        RecoveryDecision::Escalate => {
            tracing::error!(
                "stuck-loop signature: >=3 consecutive non-clean deaths; refusing auto-resume"
            );
            return Err(exit_codes::CONFIG);
        }
        other => tracing::info!(?other, "recovery decision"),
    }
    Ok((lock, ledger))
}


// Wire protocol (batch T): serve_connection/stream_session live in
// `wire.rs`; re-exported so every existing path keeps working.
pub use crate::wire::serve_connection;
use crate::wire::{peer_pid, secs_now};

pub fn run(cfg: DaemonConfig) -> i32 {
    let (lock, ledger) = match preflight(&cfg) {
        Ok(v) => v,
        Err(code) => return code,
    };
    let daemon_dir = cfg.state_dir.join("daemon");
    let sock_path = daemon_dir.join(CONTROL_SOCKET_NAME);
    let _ = std::fs::create_dir_all(&daemon_dir);
    let _ = std::fs::remove_file(&sock_path); // stale socket from a dead daemon
    let listener = match UnixListener::bind(&sock_path) {
        Ok(l) => l,
        Err(e) => {
            tracing::error!(?e, "cannot bind control socket");
            return exit_codes::ERROR;
        }
    };
    listener.set_nonblocking(true).ok();

    let health = EventLoopHealth::new();
    let wedge = std::sync::Arc::new(std::sync::atomic::AtomicBool::new(false));
    let wedge2 = wedge.clone();
    let _watchdog = spawn_watchdog(
        health.clone(),
        WatchdogConfig::default(),
        move |_lag| {
            wedge2.store(true, std::sync::atomic::Ordering::SeqCst);
            true
        },
    );

    crate::sd_notify::ready();
    let registry = Registry::at(&cfg.state_dir);
    let broker = std::sync::Arc::new(ApprovalBroker::new());
    let bus = LiveBus::new();
    let search = std::sync::Arc::new(SearchProxy::new());
    let run = std::sync::Arc::new(std::sync::Mutex::new(None::<DaemonRun>));
    // Q1 wiring: pre-auth connection budget + flood guard (FR5.13). The
    // control socket is not exhaustible by unauthenticated peers.
    let preauth = std::sync::Arc::new(std::sync::Mutex::new(
        nofy_governance::preauth::PreAuthGuard::new(8, 32, 60),
    ));
    // R2/S wiring: durable stores + boot-time run resumption (AC-11).
    // The plan reloads from the run store, progress replays from the
    // journal; a leftover run re-arms its unfinished tasks.
    // U wiring: the scheduler service recovers from its durable log; a
    // non-empty log proves prior enablement (R3 semantics). A corrupt log
    // degrades to a fresh default-off service, loud — scheduling never
    // silently resurrects.
    let mut scheduler = match crate::scheduler::SchedulerService::recover(
        nofy_scheduler::LogStore::open(daemon_dir.join("schedule.jsonl")),
    ) {
        Ok(svc) => svc,
        Err(e) => {
            tracing::error!(?e, "schedule log recovery failed; starting default-off");
            crate::scheduler::SchedulerService::new()
        }
    };
    // W-5 boot: in-flight runs from the previous life are lies — repair
    // them failed so backoff/self-disable accounting stays honest.
    scheduler.repair_inflight();
    let stores = DaemonStores {
        journal: nofy_orchestra::taskjournal::TaskLogStore::open(
            daemon_dir.join("task_journal.jsonl"),
        ),
        runs: crate::runstore::RunStore::open(daemon_dir.join("run_store.json")),
        scheduler: std::sync::Arc::new(std::sync::Mutex::new(scheduler)),
        sched_runs: std::sync::Arc::new(std::sync::Mutex::new(std::collections::VecDeque::new())),
    };
    match resume_run(&stores) {
        Ok(Some(dr)) => {
            let to_redispatch = dr.re_dispatch();
            tracing::warn!(tasks = ?to_redispatch, "crash reconciliation: run resumed from disk");
            *run.lock().unwrap() = Some(dr);
        }
        Ok(None) => {}
        Err(e) => {
            tracing::error!(error = %e, "run resumption failed; starting fresh");
        }
    }
    // W-5 trigger bridge: the clock that fires dues and arms next ones.
    // Default-off semantics live in the service; the clock is a no-op
    // until scheduling is enabled.
    let _sched_clock = crate::schedclock::spawn(stores.clone());

    loop {
        if wedge.load(std::sync::atomic::Ordering::SeqCst) {
            tracing::error!("event loop wedged; exiting for supervised restart");
            let _ = ledger.mark_clean_shutdown(); // forensics: we were alive-aware
            drop(lock);
            return exit_codes::WEDGE_DETECTED;
        }
        health.beat();
        crate::sd_notify::watchdog_ping();
        match listener.accept() {
            Ok((stream, _peer)) => {
                // Q1 wiring: budget/flood verdict BEFORE any thread is
                // spawned; refused peers get the socket dropped.
                let peer = peer_pid(&stream)
                    .map(|pid| format!("pid:{pid}"))
                    .unwrap_or_else(|| "unknown".into());
                let verdict = preauth
                    .lock()
                    .unwrap()
                    .accept_connect(&peer, secs_now());
                if verdict != nofy_governance::preauth::PreAuthOutcome::Accepted {
                    tracing::warn!(peer = %peer, ?verdict, "control connection refused by pre-auth guard");
                    drop(stream);
                    continue;
                }
                let Ok(mut reader) = stream.try_clone() else {
                    continue;
                };
                let mut writer = stream;
                // One thread per connection: approval requests block their
                // connection until a surface answers elsewhere.
                let registry_root = cfg.state_dir.clone();
                let broker = broker.clone();
                let bus = bus.clone();
                let search = search.clone();
                let run = run.clone();
                let preauth_thread = preauth.clone();
                let stores_thread = stores.clone();
                std::thread::spawn(move || {
                    let registry = Registry::at(registry_root);
                    if let Err(e) = serve_connection(
                        &mut reader,
                        &mut writer,
                        &registry,
                        &broker,
                        &bus,
                        &search,
                        &run,
                        Some(&stores_thread),
                    ) {
                        tracing::warn!(?e, "control connection ended with frame error");
                    }
                    // Release the peer's budget slot on disconnect.
                    preauth_thread.lock().unwrap().close_connect(&peer);
                });
            }
            Err(e)
                if e.kind() == std::io::ErrorKind::WouldBlock
                    || e.kind() == std::io::ErrorKind::TimedOut =>
            {
                std::thread::sleep(Duration::from_millis(200)); // heartbeat tick
                continue;
            }
            Err(e) => {
                tracing::error!(?e, "control listener died");
                let _ = ledger.mark_clean_shutdown();
                return exit_codes::ERROR;
            }
        }
    }
}


#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn preflight_second_instance_is_already_running() {
        let tmp = tempfile::tempdir().unwrap();
        let cfg = DaemonConfig {
            state_dir: tmp.path().to_path_buf(),
        };
        let (_lock, _ledger) = preflight(&cfg).expect("first boot ok");
        assert_eq!(
            preflight(&cfg).err(),
            Some(exit_codes::ALREADY_RUNNING),
            "second daemon must refuse, never restart-loop"
        );
    }

    #[test]
    fn preflight_escalates_on_stuck_loop_signature() {
        // Three consecutive non-clean deaths in the ledger: preflight must
        // refuse auto-resume with CONFIG, never restart-loop a wedged daemon.
        let tmp = tempfile::tempdir().unwrap();
        let daemon_dir = tmp.path().join("daemon");
        std::fs::create_dir_all(&daemon_dir).unwrap();
        let mut ledger_text = String::new();
        for _ in 0..3 {
            ledger_text.push_str("{\"kind\":\"startup\",\"pid\":111}\n");
            ledger_text.push_str(
                "{\"kind\":\"unclean_death_detected\",\"dead_pid\":111,\"dead_kind\":\"startup\"}\n",
            );
        }
        std::fs::write(daemon_dir.join("forensics.jsonl"), ledger_text).unwrap();
        let cfg = DaemonConfig {
            state_dir: tmp.path().to_path_buf(),
        };
        assert_eq!(
            preflight(&cfg).err(),
            Some(exit_codes::CONFIG),
            "stuck-loop signature must refuse auto-resume"
        );
    }

    #[test]
    fn preflight_sweeps_orphans_vouched_by_dead_predecessor() {
        // A live process vouched for in the previous run's children registry
        // is swept at boot (TERM), and the boot proceeds.
        let tmp = tempfile::tempdir().unwrap();
        let daemon_dir = tmp.path().join("daemon");
        std::fs::create_dir_all(&daemon_dir).unwrap();
        let mut orphan = std::process::Command::new("sleep").arg("30").spawn().unwrap();
        let pid = orphan.id();
        let entry = serde_json::json!({
            "pid": pid,
            "starttime": crate::proc::proc_starttime(pid).unwrap(),
            "label": "provider",
        });
        std::fs::write(
            daemon_dir.join(crate::proc::CHILDREN_FILE),
            format!("{entry}\n"),
        )
        .unwrap();
        let cfg = DaemonConfig {
            state_dir: tmp.path().to_path_buf(),
        };
        let (_lock, _ledger) = preflight(&cfg).expect("boot with orphan sweep ok");
        let status = orphan.wait().unwrap();
        assert!(!status.success(), "the vouched orphan was swept at boot");
    }
}
