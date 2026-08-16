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

use std::io::{Read, Write};
use std::os::unix::net::UnixListener;
use std::path::PathBuf;
use std::time::Duration;


use nofy_channel::frame::{read_frame_from, write_frame, FrameError};
use nofy_channel::hello::{negotiate, Hello, HelloAck};
use nofy_control_schema::errors::{ControlError, ControlErrorCode};
use nofy_control_schema::methods::{ControlMethod, ControlResponse};
use nofy_session_registry::Registry;

use crate::approval::ApprovalBroker;
use crate::exit_codes;
use crate::live::LiveBus;
use crate::orchestra::OrchRun;
use crate::search_proxy::SearchProxy;
use crate::forensics::ForensicsLedger;
use crate::health::{spawn_watchdog, EventLoopHealth, WatchdogConfig};
use crate::recovery::{decide, RecoveryDecision};
use crate::SingleInstanceLock;

pub const CONTROL_SOCKET_NAME: &str = "control.sock";

/// Cross-surface approval deadline; expiry is fail-closed deny.
pub const DEFAULT_APPROVAL_TIMEOUT: Duration = Duration::from_secs(300);

/// One validated run: orchestration state + the pack compositions the plan
/// was checked against (FR10 join integration).
pub struct DaemonRun {
    pub orch: crate::orchestra::OrchRun,
    pub packs: std::collections::BTreeMap<String, crate::pack::PackManifest>,
}

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

/// Validate a submitted plan+packs (FR10): orchestration DAG, pack plane
/// ownership (DS-P4), realm isolation (DS-P2), and pack coverage of every
/// task. Packs are optional at protocol level (the provider resolves them
/// locally); when present, they are checked fail-loud.
pub fn submit_run(
    manifest: &str,
    packs: &[serde_json::Value],
) -> Result<(DaemonRun, u32), String> {
    let m = crate::orchestra::ProjectManifest::from_toml(manifest)
        .map_err(|e| format!("orchestration: {e:?}"))?;
    let mut pack_map = std::collections::BTreeMap::new();
    if !packs.is_empty() {
        let mut parsed = Vec::new();
        for raw in packs {
            let pm = crate::pack::parse_pack(raw).map_err(|e| format!("pack: {e:?}"))?;
            parsed.push(pm);
        }
        crate::pack::compose_packs(&parsed).map_err(|e| format!("compose: {e:?}"))?;
        for pm in &parsed {
            pack_map.insert(pm.id.clone(), pm.clone());
        }
        for t in &m.task {
            if !pack_map.contains_key(&t.pack) {
                return Err(format!("task {} references undeclared pack {}", t.id, t.pack));
            }
        }
    }
    let total = m.task.len() as u32;
    Ok((
        DaemonRun {
            orch: crate::orchestra::OrchRun::new(m),
            packs: pack_map,
        },
        total,
    ))
}

/// Attach streaming: disk delta replay first (disk is truth), then live
/// fan-out. Subscribe BEFORE reading disk and dedup by seq so events pushed
/// during the read cannot fall into the gap.
fn stream_session<R: Read, W: Write>(
    _reader: &mut R,
    writer: &mut W,
    registry: &Registry,
    bus: &LiveBus,
    session_id: &str,
    cursor: Option<String>,
) -> Result<(), FrameError> {
    let (sub_id, rx) = bus.subscribe(session_id);
    let cursor_seq: Option<u64> = cursor.as_deref().and_then(|c| c.parse().ok());

    let mut last_sent: u64 = 0;
    if let Some(dir) = registry.session_dir(session_id) {
        let journal = dir.join("runtime_events.jsonl");
        if let Ok(text) = std::fs::read_to_string(&journal) {
            for line in text.lines() {
                let Ok(ev) = serde_json::from_str::<nofy_control_schema::Event>(line) else {
                    continue; // torn tail tolerated; disk replay is best-effort
                };
                let wanted = match cursor_seq {
                    Some(c) => ev.seq > c,
                    None => true,
                };
                if wanted {
                    let frame = serde_json::to_vec(&ControlResponse::SessionEvent {
                        event: ev.clone(),
                    })?;
                    write_frame(writer, &frame)?;
                    last_sent = last_sent.max(ev.seq);
                }
            }
        }
    }

    // Live mode: fan-out, dedup against the replay tail, exit on hangup.
    loop {
        match rx.recv_timeout(Duration::from_millis(500)) {
            Ok(ev) => {
                if ev.seq > last_sent {
                    let frame = serde_json::to_vec(&ControlResponse::SessionEvent {
                        event: ev,
                    })?;
                    if write_frame(writer, &frame).is_err() {
                        bus.unsubscribe(session_id, sub_id);
                        return Ok(());
                    }
                    last_sent += 1;
                }
            }
            Err(std::sync::mpsc::RecvTimeoutError::Timeout) => {
                // Liveness probe: an idle client hangup is only visible when
                // a write fails, so heartbeat a Pong each tick (clients ignore
                // pongs on attached streams).
                if write_frame(writer, &serde_json::to_vec(&ControlResponse::Pong)?).is_err() {
                    bus.unsubscribe(session_id, sub_id);
                    return Ok(());
                }
            }
            Err(std::sync::mpsc::RecvTimeoutError::Disconnected) => {
                bus.unsubscribe(session_id, sub_id);
                return Ok(());
            }
        }
    }
}

/// Serve one framed control connection to completion (client hangup = Ok).
///
/// Approval requests BLOCK this connection's thread until a surface answers
/// on its own connection (or [`DEFAULT_APPROVAL_TIMEOUT`]); `run` therefore
/// spawns one thread per connection.
pub fn serve_connection<R: Read, W: Write>(
    reader: &mut R,
    writer: &mut W,
    registry: &Registry,
    broker: &ApprovalBroker,
    bus: &LiveBus,
    search: &SearchProxy,
    run: &std::sync::Arc<std::sync::Mutex<Option<DaemonRun>>>,
) -> Result<(), FrameError> {
    // First frame must be Hello; anything else is a protocol violation.
    let Some(hello_bytes) = read_frame_from(reader)? else {
        return Ok(());
    };
    let hello: Hello = serde_json::from_slice(&hello_bytes).map_err(|e| {
        FrameError::Io(std::io::Error::new(
            std::io::ErrorKind::InvalidData,
            format!("first frame is not a Hello: {e}"),
        ))
    })?;
    let ack = negotiate(&hello);
    let ack_bytes = serde_json::to_vec(&ack)?;
    write_frame(writer, &ack_bytes)?;
    let HelloAck::Accepted { .. } = ack else {
        return Ok(()); // mismatched peer disconnects
    };

    loop {
        let Some(payload) = read_frame_from(reader)? else {
            return Ok(()); // clean hangup
        };
        let response: serde_json::Value = match serde_json::from_slice::<ControlMethod>(&payload) {
            Ok(ControlMethod::Ping) => serde_json::to_value(ControlResponse::Pong)?,
            Ok(ControlMethod::SessionList { limit, .. }) => {
                let mut recs = registry.list();
                if let Some(l) = limit {
                    recs.truncate(l as usize);
                }
                serde_json::to_value(ControlResponse::SessionList {
                    count: recs.len() as u32,
                })?
            }
            Ok(ControlMethod::SessionAttach {
                session_id,
                cursor,
            }) => {
                return stream_session(reader, writer, registry, bus, &session_id, cursor);
            }
            Ok(ControlMethod::SessionSearch { query }) => {
                match search.request(&query, DEFAULT_APPROVAL_TIMEOUT) {
                    Some((hits, sessions)) => {
                        serde_json::to_value(ControlResponse::Search { hits, sessions })?
                    }
                    None => serde_json::to_value(ControlError::new(
                        ControlErrorCode::SearchTimeout,
                        "no provider answered the search",
                    ))?,
                }
            }
            Ok(ControlMethod::TaskSubmit { manifest, packs }) => {
                match submit_run(&manifest, &packs) {
                    Ok((dr, total)) => {
                        *run.lock().unwrap() = Some(dr);
                        serde_json::to_value(ControlResponse::ProjectAccepted { total })?
                    }
                    Err(msg) => serde_json::to_value(ControlError::new(
                        ControlErrorCode::Internal,
                        format!("manifest rejected: {msg}"),
                    ))?,
                }
            }
            Ok(ControlMethod::TaskPoll) => {
                let mut guard = run.lock().unwrap();
                match guard.as_mut().and_then(|r| r.orch.dispatch_next()) {
                    Some(t) => {
                        let (persona, skills) = guard
                            .as_ref()
                            .and_then(|r| r.packs.get(&t.pack))
                            .map(|p| (Some(p.persona.clone()), p.skills.clone()))
                            .unwrap_or((None, Vec::new()));
                        serde_json::to_value(ControlResponse::TaskDispatch {
                            task_id: t.id,
                            pack: t.pack,
                            goal: t.goal,
                            persona,
                            skills,
                        })?
                    }
                    None => serde_json::to_value(ControlResponse::NoPending)?,
                }
            }
            Ok(ControlMethod::TaskResult {
                task_id,
                succeeded,
            }) => {
                use crate::orchestra::SettleOutcome;
                let outcome = {
                    let mut guard = run.lock().unwrap();
                    guard
                        .as_mut()
                        .map(|r| r.orch.settle(&task_id, succeeded))
                        .unwrap_or(SettleOutcome::Done)
                };
                if let SettleOutcome::Escalate(id) = outcome {
                    // Cross-surface decision: allow = skip dependents and
                    // continue; deny = abort the run.
                    let summary = format!("task {id} failed; allow skip-and-continue?");
                    if broker.register(&id, &summary) {
                        let decision = broker.wait(&id, DEFAULT_APPROVAL_TIMEOUT);
                        broker.settle(&id);
                        let allow = decision
                            == Some(nofy_control_schema::methods::ApprovalDecision::AllowOnce);
                        if let Some(r) = run.lock().unwrap().as_mut() {
                            r.orch.resolve_escalation(&id, allow);
                        }
                    }
                }
                serde_json::to_value(ControlResponse::TaskNoted)?
            }
            Ok(ControlMethod::SearchPoll) => match search.poll() {
                Some((request_id, q)) => {
                    serde_json::to_value(ControlResponse::SearchDispatch {
                        request_id,
                        query: q,
                    })?
                }
                None => serde_json::to_value(ControlResponse::NoPending)?,
            },
            Ok(ControlMethod::SearchResult {
                request_id,
                hits,
                sessions,
            }) => {
                if search.result(&request_id, (hits, sessions)) {
                    serde_json::to_value(ControlResponse::ApprovalNoted)?
                } else {
                    serde_json::to_value(ControlError::new(
                        ControlErrorCode::Internal,
                        format!("unknown or late search result {request_id}"),
                    ))?
                }
            }
            Ok(ControlMethod::ProviderRegister { provider_id }) => {
                tracing::info!(provider_id, "provider registered");
                serde_json::to_value(ControlResponse::ProviderNoted)?
            }
            Ok(ControlMethod::SessionEventPush { event }) => {
                bus.publish(event);
                serde_json::to_value(ControlResponse::Pong)?
            }
            Ok(ControlMethod::ApprovalRequest {
                intent_id,
                summary,
            }) => {
                if !broker.register(&intent_id, &summary) {
                    serde_json::to_value(ControlError::new(
                        ControlErrorCode::Internal,
                        format!("duplicate approval intent {intent_id}"),
                    ))?
                } else {
                    match broker.wait(&intent_id, DEFAULT_APPROVAL_TIMEOUT) {
                        Some(decision) => {
                            broker.settle(&intent_id);
                            serde_json::to_value(ControlResponse::ApprovalResolved {
                                decision,
                            })?
                        }
                        None => serde_json::to_value(ControlError::new(
                            ControlErrorCode::ApprovalTimeout,
                            format!("no surface answered for {intent_id}"),
                        ))?,
                    }
                }
            }
            Ok(ControlMethod::ApprovalRespond {
                intent_id,
                decision,
            }) => {
                if broker.respond(&intent_id, decision) {
                    serde_json::to_value(ControlResponse::ApprovalNoted)?
                } else {
                    serde_json::to_value(ControlError::new(
                        ControlErrorCode::Internal,
                        format!("unknown or settled approval intent {intent_id}"),
                    ))?
                }
            }
            Err(e) => serde_json::to_value(ControlError::new(
                ControlErrorCode::Internal,
                format!("bad method frame: {e}"),
            ))?,
        };
        write_frame(writer, &serde_json::to_vec(&response)?)?;
    }
}

/// Run the daemon until the listener dies or a wedge is detected.
/// Returns the supervisor exit code.
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
                std::thread::spawn(move || {
                    let registry = Registry::at(registry_root);
                    if let Err(e) =
                        serve_connection(&mut reader, &mut writer, &registry, &broker, &bus, &search, &run)
                    {
                        tracing::warn!(?e, "control connection ended with frame error");
                    }
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
    use nofy_channel::hello::ProtocolVersion;

    fn hello_frame() -> Vec<u8> {
        serde_json::to_vec(&Hello {
            version: ProtocolVersion::CURRENT,
            client_id: "test".into(),
            caps: vec![],
        })
        .unwrap()
    }

    fn method_frame(m: &ControlMethod) -> Vec<u8> {
        serde_json::to_vec(m).unwrap()
    }

    #[test]
    fn handshake_then_ping_then_session_list() {
        let tmp = tempfile::tempdir().unwrap();
        // Seed one session so the registry has something to count.
        std::fs::create_dir_all(tmp.path().join("sessions/cw1/s1")).unwrap();
        std::fs::write(
            tmp.path().join("sessions/cw1/s1/chat_history.jsonl"),
            "{}",
        )
        .unwrap();
        let registry = Registry::at(tmp.path());

        let mut wire_in = Vec::new();
        write_frame(&mut wire_in, &hello_frame()).unwrap();
        write_frame(
            &mut wire_in,
            &method_frame(&ControlMethod::SessionList {
                cwd: None,
                limit: None,
            }),
        )
        .unwrap();
        write_frame(&mut wire_in, &method_frame(&ControlMethod::Ping)).unwrap();

        let mut reader = std::io::Cursor::new(wire_in);
        let mut writer = Vec::new();
        serve_connection(&mut reader, &mut writer, &registry, &ApprovalBroker::new(), &LiveBus::new(), &SearchProxy::new(), &std::sync::Arc::new(std::sync::Mutex::new(None::<DaemonRun>))).unwrap();

        // Parse the response frames back out.
        let mut rr = std::io::Cursor::new(writer);
        let ack: HelloAck =
            serde_json::from_slice(&read_frame_from(&mut rr).unwrap().unwrap()).unwrap();
        assert!(matches!(ack, HelloAck::Accepted { .. }));
        let list: serde_json::Value =
            serde_json::from_slice(&read_frame_from(&mut rr).unwrap().unwrap()).unwrap();
        assert_eq!(list["count"], 1);
        let pong: serde_json::Value =
            serde_json::from_slice(&read_frame_from(&mut rr).unwrap().unwrap()).unwrap();
        assert_eq!(pong["kind"], "pong");
    }

    #[test]
    fn version_mismatch_gets_structured_ack() {
        let tmp = tempfile::tempdir().unwrap();
        let registry = Registry::at(tmp.path());
        let hello = Hello {
            version: ProtocolVersion { major: 9, minor: 0 },
            client_id: "old".into(),
            caps: vec![],
        };
        let mut wire_in = Vec::new();
        write_frame(&mut wire_in, &serde_json::to_vec(&hello).unwrap()).unwrap();
        let mut reader = std::io::Cursor::new(wire_in);
        let mut writer = Vec::new();
        serve_connection(&mut reader, &mut writer, &registry, &ApprovalBroker::new(), &LiveBus::new(), &SearchProxy::new(), &std::sync::Arc::new(std::sync::Mutex::new(None::<DaemonRun>))).unwrap();
        let mut rr = std::io::Cursor::new(writer);
        let ack: HelloAck =
            serde_json::from_slice(&read_frame_from(&mut rr).unwrap().unwrap()).unwrap();
        assert!(matches!(ack, HelloAck::VersionMismatch { .. }));
    }

    #[test]
    fn approval_roundtrip_across_two_connections() {
        let tmp = tempfile::tempdir().unwrap();
        // ONE broker shared by both connections (the daemon owns it in run()).
        let shared = std::sync::Arc::new(ApprovalBroker::new());

        // Provider connection: asks and blocks until answered.
        let mut provider_in = Vec::new();
        write_frame(&mut provider_in, &hello_frame()).unwrap();
        write_frame(
            &mut provider_in,
            &method_frame(&ControlMethod::ApprovalRequest {
                intent_id: "rm1".into(),
                summary: "rm -rf cache".into(),
            }),
        )
        .unwrap();
        let (tmp_path, shared2) = (tmp.path().to_path_buf(), shared.clone());
        let provider_thread = std::thread::spawn(move || {
            let registry = Registry::at(&tmp_path);
            let mut r = std::io::Cursor::new(provider_in);
            let mut out = Vec::new();
            serve_connection(&mut r, &mut out, &registry, &shared2, &LiveBus::new(), &SearchProxy::new(), &std::sync::Arc::new(std::sync::Mutex::new(None::<DaemonRun>))).unwrap();
            out
        });

        // Surface connection answers once the provider has registered+blocked.
        std::thread::sleep(Duration::from_millis(100));
        let mut surface_in = Vec::new();
        write_frame(&mut surface_in, &hello_frame()).unwrap();
        write_frame(
            &mut surface_in,
            &method_frame(&ControlMethod::ApprovalRespond {
                intent_id: "rm1".into(),
                decision: nofy_control_schema::methods::ApprovalDecision::Deny,
            }),
        )
        .unwrap();
        {
            let registry = Registry::at(tmp.path());
            let mut r = std::io::Cursor::new(surface_in);
            let mut surface_out = Vec::new();
            serve_connection(&mut r, &mut surface_out, &registry, &shared, &LiveBus::new(), &SearchProxy::new(), &std::sync::Arc::new(std::sync::Mutex::new(None::<DaemonRun>))).unwrap();
        }

        let out = provider_thread.join().unwrap();
        let mut rr = std::io::Cursor::new(out);
        let _ack = read_frame_from(&mut rr).unwrap().unwrap();
        let resolved: serde_json::Value =
            serde_json::from_slice(&read_frame_from(&mut rr).unwrap().unwrap()).unwrap();
        assert_eq!(resolved["kind"], "approval_resolved");
        assert_eq!(resolved["decision"], "deny");
    }

    #[test]
    fn submit_validates_packs_and_dispatch_carries_persona() {
        let run = std::sync::Arc::new(std::sync::Mutex::new(None::<DaemonRun>));
        let manifest = "packs = [\"sec\"]\n\n[[task]]\nid = \"t1\"\npack = \"sec\"\ngoal = \"audit\"\n";

        // Host-plane leak in a pack manifest is rejected at submit.
        let leaky = serde_json::json!({
            "id": "sec",
            "persona": "security expert",
            "sandbox_policy": {"mode": "strict"},
        });
        let mut in1 = Vec::new();
        write_frame(&mut in1, &hello_frame()).unwrap();
        write_frame(
            &mut in1,
            &method_frame(&ControlMethod::TaskSubmit {
                manifest: manifest.into(),
                packs: vec![leaky],
            }),
        )
        .unwrap();
        let mut out1 = Vec::new();
        {
            let mut r = std::io::Cursor::new(in1);
            serve_connection(
                &mut r,
                &mut out1,
                &Registry::at(tempfile::tempdir().unwrap().path()),
                &ApprovalBroker::new(),
                &LiveBus::new(),
                &SearchProxy::new(),
                &run,
            )
            .unwrap();
        }
        let mut o1 = std::io::Cursor::new(out1);
        let _ = read_frame_from(&mut o1).unwrap().unwrap();
        let rej: serde_json::Value =
            serde_json::from_slice(&read_frame_from(&mut o1).unwrap().unwrap()).unwrap();
        assert_eq!(rej["code"], "INTERNAL", "host-plane leak must fail loud");

        // Clean pack accepted; dispatch carries persona+skills.
        let clean = serde_json::json!({
            "id": "sec",
            "persona": "security expert",
            "skills": ["cve-scan"],
            "services": [{"name": "scanner"}],
        });
        let mut in2 = Vec::new();
        write_frame(&mut in2, &hello_frame()).unwrap();
        write_frame(
            &mut in2,
            &method_frame(&ControlMethod::TaskSubmit {
                manifest: manifest.into(),
                packs: vec![clean],
            }),
        )
        .unwrap();
        write_frame(&mut in2, &method_frame(&ControlMethod::TaskPoll)).unwrap();
        let mut out2 = Vec::new();
        {
            let mut r = std::io::Cursor::new(in2);
            serve_connection(
                &mut r,
                &mut out2,
                &Registry::at(tempfile::tempdir().unwrap().path()),
                &ApprovalBroker::new(),
                &LiveBus::new(),
                &SearchProxy::new(),
                &run,
            )
            .unwrap();
        }
        let mut o2 = std::io::Cursor::new(out2);
        let _ = read_frame_from(&mut o2).unwrap().unwrap();
        let acc: serde_json::Value =
            serde_json::from_slice(&read_frame_from(&mut o2).unwrap().unwrap()).unwrap();
        assert_eq!(acc["kind"], "project_accepted");
        let disp: serde_json::Value =
            serde_json::from_slice(&read_frame_from(&mut o2).unwrap().unwrap()).unwrap();
        assert_eq!(disp["persona"], "security expert");
        assert_eq!(disp["skills"][0], "cve-scan");
    }

    #[test]
    fn orchestration_dispatch_settle_over_wire() {
        let run = std::sync::Arc::new(std::sync::Mutex::new(None::<DaemonRun>));
        let manifest = r#"
packs = ["p"]
on_fail = "skip"

[[task]]
id = "t1"
pack = "p"
goal = "first"

[[task]]
id = "t2"
pack = "p"
goal = "second"
needs = ["t1"]
"#;

        // Client submits the manifest.
        let mut sub_in = Vec::new();
        write_frame(&mut sub_in, &hello_frame()).unwrap();
        write_frame(
            &mut sub_in,
            &method_frame(&ControlMethod::TaskSubmit {
                manifest: manifest.into(),
                packs: vec![],
            }),
        )
        .unwrap();
        let mut out = Vec::new();
        {
            let mut r = std::io::Cursor::new(sub_in);
            serve_connection(
                &mut r,
                &mut out,
                &Registry::at(tempfile::tempdir().unwrap().path()),
                &ApprovalBroker::new(),
                &LiveBus::new(),
                &SearchProxy::new(),
                &run,
            )
            .unwrap();
        }
        let mut or = std::io::Cursor::new(out);
        let _ = read_frame_from(&mut or).unwrap().unwrap();
        let accepted: serde_json::Value =
            serde_json::from_slice(&read_frame_from(&mut or).unwrap().unwrap()).unwrap();
        assert_eq!(accepted["kind"], "project_accepted");
        assert_eq!(accepted["total"], 2);

        // Provider polls and settles t1, then t2, then sees NoPending.
        let mut poll_in = Vec::new();
        write_frame(&mut poll_in, &hello_frame()).unwrap();
        for m in [
            ControlMethod::TaskPoll,
            ControlMethod::TaskResult {
                task_id: "t1".into(),
                succeeded: true,
            },
            ControlMethod::TaskPoll,
            ControlMethod::TaskResult {
                task_id: "t2".into(),
                succeeded: true,
            },
            ControlMethod::TaskPoll,
        ] {
            write_frame(&mut poll_in, &method_frame(&m)).unwrap();
        }
        let mut pout = Vec::new();
        {
            let mut r = std::io::Cursor::new(poll_in);
            serve_connection(
                &mut r,
                &mut pout,
                &Registry::at(tempfile::tempdir().unwrap().path()),
                &ApprovalBroker::new(),
                &LiveBus::new(),
                &SearchProxy::new(),
                &run,
            )
            .unwrap();
        }
        let mut pr = std::io::Cursor::new(pout);
        let _ = read_frame_from(&mut pr).unwrap().unwrap(); // hello ack
        let d1: serde_json::Value =
            serde_json::from_slice(&read_frame_from(&mut pr).unwrap().unwrap()).unwrap();
        assert_eq!(d1["kind"], "task_dispatch");
        assert_eq!(d1["task_id"], "t1");
        let _n1 = read_frame_from(&mut pr).unwrap().unwrap(); // task noted
        let d2: serde_json::Value =
            serde_json::from_slice(&read_frame_from(&mut pr).unwrap().unwrap()).unwrap();
        assert_eq!(d2["task_id"], "t2", "t2 only after t1 settled");
        let _n2 = read_frame_from(&mut pr).unwrap().unwrap();
        let end: serde_json::Value =
            serde_json::from_slice(&read_frame_from(&mut pr).unwrap().unwrap()).unwrap();
        assert_eq!(end["kind"], "no_pending", "run complete");
        assert!(run.lock().unwrap().as_ref().unwrap().orch.is_done());
    }

    #[test]
    fn search_proxies_through_provider_poll() {
        let tmp = tempfile::tempdir().unwrap();
        let shared_search = std::sync::Arc::new(SearchProxy::new());

        // Client connection blocks on SessionSearch.
        let mut client_in = Vec::new();
        write_frame(&mut client_in, &hello_frame()).unwrap();
        write_frame(
            &mut client_in,
            &method_frame(&ControlMethod::SessionSearch {
                query: "文件管家".into(),
            }),
        )
        .unwrap();
        let search2 = shared_search.clone();
        let client_thread = std::thread::spawn(move || {
            let mut r = std::io::Cursor::new(client_in);
            let mut out = Vec::new();
            serve_connection(
                &mut r,
                &mut out,
                &Registry::at(tempfile::tempdir().unwrap().path()),
                &ApprovalBroker::new(),
                &LiveBus::new(),
                &search2,
                &std::sync::Arc::new(std::sync::Mutex::new(None::<DaemonRun>)),
            )
            .unwrap();
            out
        });

        std::thread::sleep(Duration::from_millis(100));
        // Provider connection polls and answers.
        let mut prov_in = Vec::new();
        write_frame(&mut prov_in, &hello_frame()).unwrap();
        write_frame(&mut prov_in, &method_frame(&ControlMethod::SearchPoll)).unwrap();
        let mut prov_out = Vec::new();
        {
            let mut r = std::io::Cursor::new(prov_in);
            serve_connection(
                &mut r,
                &mut prov_out,
                &Registry::at(tmp.path()),
                &ApprovalBroker::new(),
                &LiveBus::new(),
                &shared_search,
                &std::sync::Arc::new(std::sync::Mutex::new(None::<DaemonRun>)),
            )
            .unwrap();
        }
        // Extract dispatched job from provider frames.
        let mut pr = std::io::Cursor::new(prov_out);
        let _ack = read_frame_from(&mut pr).unwrap().unwrap();
        let dispatch: serde_json::Value =
            serde_json::from_slice(&read_frame_from(&mut pr).unwrap().unwrap()).unwrap();
        assert_eq!(dispatch["kind"], "search_dispatch");
        let request_id = dispatch["request_id"].as_str().unwrap().to_string();
        assert_eq!(dispatch["query"], "文件管家");

        let mut answer_in = Vec::new();
        write_frame(&mut answer_in, &hello_frame()).unwrap();
        write_frame(
            &mut answer_in,
            &method_frame(&ControlMethod::SearchResult {
                request_id,
                hits: 7,
                sessions: vec!["s1".into(), "s2".into()],
            }),
        )
        .unwrap();
        {
            let mut r = std::io::Cursor::new(answer_in);
            let mut out = Vec::new();
            serve_connection(
                &mut r,
                &mut out,
                &Registry::at(tmp.path()),
                &ApprovalBroker::new(),
                &LiveBus::new(),
                &shared_search,
                &std::sync::Arc::new(std::sync::Mutex::new(None::<DaemonRun>)),
            )
            .unwrap();
        }

        let out = client_thread.join().unwrap();
        let mut cr = std::io::Cursor::new(out);
        let _ack = read_frame_from(&mut cr).unwrap().unwrap();
        let search_resp: serde_json::Value =
            serde_json::from_slice(&read_frame_from(&mut cr).unwrap().unwrap()).unwrap();
        assert_eq!(search_resp["kind"], "search");
        assert_eq!(search_resp["hits"], 7);
        assert_eq!(search_resp["sessions"][0], "s1", "matched session identities ride the answer");
        assert_eq!(search_resp["sessions"][1], "s2");
    }

    #[test]
    fn attach_replays_disk_delta_then_streams_live() {
        use std::os::unix::net::UnixStream;

        let tmp = tempfile::tempdir().unwrap();
        // Seed a journal: seq 0,1,2 on disk.
        let dir = tmp.path().join("sessions/cw1/s1");
        std::fs::create_dir_all(&dir).unwrap();
        let lines: Vec<String> = (0..3)
            .map(|i| {
                serde_json::json!({
                    "seq": i,
                    "kind": "turn.started",
                    "session_id": "s1",
                    "at_ms": 1,
                    "payload": null
                })
                .to_string()
            })
            .collect();
        std::fs::write(dir.join("runtime_events.jsonl"), lines.join("\n")).unwrap();
        let registry = Registry::at(tmp.path());
        let bus = LiveBus::new();
    let search = std::sync::Arc::new(SearchProxy::new());
    let run = std::sync::Arc::new(std::sync::Mutex::new(None::<DaemonRun>));

        let (client, mut server) = UnixStream::pair().unwrap();
        let bus2 = bus.clone();
        let streamer = std::thread::spawn(move || {
            let mut w = &server;
            let mut r = &server;
            // cursor=0 → replay seq 1,2 from disk, then live.
            stream_session(&mut r, &mut w, &registry, &bus2, "s1", Some("0".into()))
        });

        client
            .set_read_timeout(Some(Duration::from_secs(5)))
            .unwrap();
        let mut reader = std::io::BufReader::new(&client);
        let f1 = read_frame_from(&mut reader).unwrap().unwrap();
        let f2 = read_frame_from(&mut reader).unwrap().unwrap();
        let v1: serde_json::Value = serde_json::from_slice(&f1).unwrap();
        let v2: serde_json::Value = serde_json::from_slice(&f2).unwrap();
        assert_eq!(v1["event"]["seq"], 1);
        assert_eq!(v2["event"]["seq"], 2);

        // Live push arrives on the attached stream.
        bus.publish(nofy_control_schema::Event {
            seq: 3,
            kind: nofy_control_schema::EventKind::TurnCompleted,
            session_id: "s1".into(),
            at_ms: 2,
            payload: serde_json::Value::Null,
        });
        let f3 = read_frame_from(&mut reader).unwrap().unwrap();
        let v3: serde_json::Value = serde_json::from_slice(&f3).unwrap();
        assert_eq!(v3["event"]["seq"], 3);

        // Hangup ends the streamer cleanly.
        drop(reader);
        drop(client);
        streamer.join().unwrap().unwrap();
    }

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
}
