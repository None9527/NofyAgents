//! Synchronous control-plane client (batch Z): framed request/response
//! over the daemon's UDS. Thin transport glue — all vocabulary lives in
//! `nofy-control-schema`, all policy in the daemon's `serve_connection`.

use std::os::unix::net::UnixStream;
use std::path::Path;

use nofy_channel::frame::{read_frame_from, write_frame};
use nofy_channel::hello::{Hello, HelloAck, ProtocolVersion};
use nofy_control_schema::methods::ControlMethod;

/// Control socket location relative to the daemon state dir.
pub const CONTROL_SOCKET_RELATIVE: &str = "daemon/control.sock";

/// One connected, handshaken control connection.
#[derive(Debug)]
pub struct ControlClient {
    stream: UnixStream,
}

impl ControlClient {
    /// Connect to the daemon control socket under `state_dir` and complete
    /// the Hello handshake, fail-loud.
    pub fn connect(state_dir: &Path) -> Result<Self, String> {
        let stream = UnixStream::connect(state_dir.join(CONTROL_SOCKET_RELATIVE))
            .map_err(|e| format!("connect: {e}"))?;
        Self::from_stream(stream)
    }

    /// Handshake over an already-connected stream (test seam).
    pub fn from_stream(mut stream: UnixStream) -> Result<Self, String> {
        let hello = Hello {
            version: ProtocolVersion::CURRENT,
            client_id: "nofy-control-client".into(),
            caps: vec![],
        };
        let bytes = serde_json::to_vec(&hello).map_err(|e| e.to_string())?;
        write_frame(&mut stream, &bytes).map_err(|e| format!("hello write: {e}"))?;
        let Some(ack_bytes) =
            read_frame_from(&mut stream).map_err(|e| format!("hello read: {e}"))?
        else {
            return Err("daemon closed the connection during handshake".into());
        };
        let ack: HelloAck =
            serde_json::from_slice(&ack_bytes).map_err(|e| format!("hello ack: {e}"))?;
        match ack {
            HelloAck::Accepted { .. } => Ok(Self { stream }),
            other => Err(format!("handshake refused: {other:?}")),
        }
    }

    /// One request/response exchange. Returns the raw response value — a
    /// `ControlResponse` (has `kind`) or a `ControlError` (has `code`);
    /// the caller branches.
    pub fn call(&mut self, method: &ControlMethod) -> Result<serde_json::Value, String> {
        let frame = serde_json::to_vec(method).map_err(|e| e.to_string())?;
        write_frame(&mut self.stream, &frame).map_err(|e| format!("write: {e}"))?;
        let Some(bytes) = read_frame_from(&mut self.stream).map_err(|e| format!("read: {e}"))?
        else {
            return Err("daemon closed the connection".into());
        };
        serde_json::from_slice(&bytes).map_err(|e| format!("response: {e}"))
    }
}

/// True when a raw response frame is a structured `ControlError`.
pub fn is_error(response: &serde_json::Value) -> bool {
    response.get("code").is_some()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::approval::ApprovalBroker;
    use crate::daemon::serve_connection;
    use crate::live::LiveBus;
    use crate::runlife::{DaemonRun, DaemonStores};
    use crate::search_proxy::SearchProxy;
    use nofy_session_registry::Registry;

    /// Serve one connection on the other half of a socket pair with a
    /// scheduler-bearing store.
    fn spawn_server(stores: DaemonStores) -> UnixStream {
        let (client_side, server_side) = UnixStream::pair().unwrap();
        std::thread::spawn(move || {
            let mut reader = server_side.try_clone().unwrap();
            let mut writer = server_side;
            let run = std::sync::Arc::new(std::sync::Mutex::new(None::<DaemonRun>));
            serve_connection(
                &mut reader,
                &mut writer,
                &Registry::at(tempfile::tempdir().unwrap().path()),
                &ApprovalBroker::new(),
                &LiveBus::new(),
                &SearchProxy::new(),
                &run,
                Some(&stores),
            )
            .unwrap();
        });
        client_side
    }

    fn stores(dir: &Path) -> DaemonStores {
        DaemonStores {
            journal: nofy_orchestra::taskjournal::TaskLogStore::open(
                dir.join("task_journal.jsonl"),
            ),
            runs: crate::runstore::RunStore::open(dir.join("run_store.json")),
            scheduler: std::sync::Arc::new(std::sync::Mutex::new(
                crate::scheduler::SchedulerService::new(),
            )),
            sched_runs: std::sync::Arc::new(std::sync::Mutex::new(
                std::collections::VecDeque::new(),
            )),
        }
    }

    #[test]
    fn client_handshake_and_schedule_roundtrip_over_real_socket() {
        // Z wiring: the client speaks the same frames serve_connection
        // serves — enable, add, list travel a real socket pair.
        let dir = tempfile::tempdir().unwrap();
        let mut client = ControlClient::from_stream(spawn_server(stores(dir.path()))).unwrap();

        let refused = client
            .call(&ControlMethod::ScheduleAdd {
                id: "j1".into(),
                cron_spec: "* * * * *".into(),
                goal: None,
                cwd: None,
                once: false,
            })
            .unwrap();
        assert!(is_error(&refused), "default-off refusal reaches the client");

        let ack = client.call(&ControlMethod::ScheduleEnable).unwrap();
        assert_eq!(ack["kind"], "schedule_noted");

        let ack = client
            .call(&ControlMethod::ScheduleAdd {
                id: "j1".into(),
                cron_spec: "0 3 * * *".into(),
                goal: None,
                cwd: None,
                once: false,
            })
            .unwrap();
        assert_eq!(ack["kind"], "schedule_noted");

        let listed = client.call(&ControlMethod::ScheduleList).unwrap();
        assert_eq!(listed["kind"], "schedule_listed");
        assert_eq!(listed["entries"][0]["id"], "j1");
        assert_eq!(listed["entries"][0]["spec"], "0 3 * * *");
    }

    #[test]
    fn connect_uses_the_state_dir_socket_convention() {
        // No daemon listening: connect fails loud with the path it tried.
        let dir = tempfile::tempdir().unwrap();
        let err = ControlClient::connect(dir.path()).unwrap_err();
        assert!(err.contains("connect"), "failure names the stage: {err}");
    }

    #[test]
    fn connect_completes_handshake_against_a_live_socket() {
        // A listener at the state-dir convention: connect runs the full
        // handshake and lands a working call channel.
        let dir = tempfile::tempdir().unwrap();
        std::fs::create_dir_all(dir.path().join("daemon")).unwrap();
        let listener =
            std::os::unix::net::UnixListener::bind(dir.path().join(CONTROL_SOCKET_RELATIVE))
                .unwrap();
        let server = std::thread::spawn(move || {
            let (stream, _) = listener.accept().unwrap();
            let mut reader = stream.try_clone().unwrap();
            let mut writer = stream;
            let run = std::sync::Arc::new(std::sync::Mutex::new(None::<DaemonRun>));
            serve_connection(
                &mut reader,
                &mut writer,
                &Registry::at(tempfile::tempdir().unwrap().path()),
                &ApprovalBroker::new(),
                &LiveBus::new(),
                &SearchProxy::new(),
                &run,
                None,
            )
        });
        let mut client = ControlClient::connect(dir.path()).unwrap();
        let pong = client.call(&ControlMethod::Ping).unwrap();
        assert_eq!(pong["kind"], "pong");
        drop(client);
        server.join().unwrap().unwrap();
    }

    #[test]
    fn server_close_during_handshake_is_named() {
        // The server reads our Hello, then dies before acking.
        let (client_side, server_side) = UnixStream::pair().unwrap();
        let server = std::thread::spawn(move || {
            let mut s = server_side;
            let _ = read_frame_from(&mut s).unwrap(); // consume the Hello
            drop(s); // close without an ack
        });
        let err = ControlClient::from_stream(client_side).unwrap_err();
        assert!(
            err.contains("closed the connection during handshake"),
            "failure names the stage: {err}"
        );
        server.join().unwrap();
    }

    #[test]
    fn refused_handshake_is_reported() {
        // The server answers with a VersionMismatch ack.
        let (client_side, server_side) = UnixStream::pair().unwrap();
        let server = std::thread::spawn(move || {
            let mut s = server_side;
            let _ = read_frame_from(&mut s).unwrap(); // consume the Hello
            let ack = HelloAck::VersionMismatch {
                daemon: ProtocolVersion::CURRENT,
                client: ProtocolVersion { major: 9, minor: 0 },
            };
            write_frame(&mut s, &serde_json::to_vec(&ack).unwrap()).unwrap();
            std::thread::sleep(std::time::Duration::from_millis(100));
        });
        let err = ControlClient::from_stream(client_side).unwrap_err();
        assert!(err.contains("handshake refused"), "refusal surfaces: {err}");
        server.join().unwrap();
    }

    #[test]
    fn server_close_during_call_is_named() {
        // Handshake completes; the server dies after reading the request,
        // never answering.
        let (client_side, server_side) = UnixStream::pair().unwrap();
        let server = std::thread::spawn(move || {
            let mut s = server_side;
            let _ = read_frame_from(&mut s).unwrap(); // Hello
            let ack = HelloAck::Accepted {
                version: ProtocolVersion::CURRENT,
                resume_supported: true,
            };
            write_frame(&mut s, &serde_json::to_vec(&ack).unwrap()).unwrap();
            let _ = read_frame_from(&mut s).unwrap(); // the call frame
            drop(s); // close without a response
        });
        let mut client = ControlClient::from_stream(client_side).unwrap();
        let err = client.call(&ControlMethod::Ping).unwrap_err();
        assert!(
            err.contains("daemon closed the connection"),
            "failure names the stage: {err}"
        );
        server.join().unwrap();
    }

    #[test]
    fn oversized_handshake_frame_is_a_read_failure() {
        // The server answers with a frame length beyond the cap: the read
        // fails loud (never allocates), surfacing as a hello-read error.
        let (client_side, server_side) = UnixStream::pair().unwrap();
        let server = std::thread::spawn(move || {
            let mut s = server_side;
            let _ = read_frame_from(&mut s).unwrap(); // consume the Hello
            let oversized = (nofy_channel::frame::MAX_FRAME_BYTES + 1).to_be_bytes();
            use std::io::Write;
            s.write_all(&oversized).unwrap();
            std::thread::sleep(std::time::Duration::from_millis(100));
        });
        let err = ControlClient::from_stream(client_side).unwrap_err();
        assert!(err.contains("hello read"), "failure names the stage: {err}");
        server.join().unwrap();
    }

    #[test]
    fn malformed_ack_frame_is_named() {
        // The server answers with bytes that are not a HelloAck.
        let (client_side, server_side) = UnixStream::pair().unwrap();
        let server = std::thread::spawn(move || {
            let mut s = server_side;
            let _ = read_frame_from(&mut s).unwrap(); // consume the Hello
            write_frame(&mut s, b"{\"kind\":\"nonsense\"}").unwrap();
            std::thread::sleep(std::time::Duration::from_millis(100));
        });
        let err = ControlClient::from_stream(client_side).unwrap_err();
        assert!(err.contains("hello ack"), "failure names the stage: {err}");
        server.join().unwrap();
    }

    #[test]
    fn oversized_response_frame_is_a_read_failure() {
        // Handshake completes; the answer to the call is an oversized frame.
        let (client_side, server_side) = UnixStream::pair().unwrap();
        let server = std::thread::spawn(move || {
            let mut s = server_side;
            let _ = read_frame_from(&mut s).unwrap(); // Hello
            let ack = HelloAck::Accepted {
                version: ProtocolVersion::CURRENT,
                resume_supported: true,
            };
            write_frame(&mut s, &serde_json::to_vec(&ack).unwrap()).unwrap();
            let _ = read_frame_from(&mut s).unwrap(); // the call frame
            let oversized = (nofy_channel::frame::MAX_FRAME_BYTES + 1).to_be_bytes();
            use std::io::Write;
            s.write_all(&oversized).unwrap();
            std::thread::sleep(std::time::Duration::from_millis(100));
        });
        let mut client = ControlClient::from_stream(client_side).unwrap();
        let err = client.call(&ControlMethod::Ping).unwrap_err();
        assert!(err.contains("read"), "failure names the stage: {err}");
        server.join().unwrap();
    }

    #[test]
    fn malformed_response_frame_is_named() {
        // Handshake completes; the answer to the call is not valid JSON.
        let (client_side, server_side) = UnixStream::pair().unwrap();
        let server = std::thread::spawn(move || {
            let mut s = server_side;
            let _ = read_frame_from(&mut s).unwrap(); // Hello
            let ack = HelloAck::Accepted {
                version: ProtocolVersion::CURRENT,
                resume_supported: true,
            };
            write_frame(&mut s, &serde_json::to_vec(&ack).unwrap()).unwrap();
            let _ = read_frame_from(&mut s).unwrap(); // the call frame
            write_frame(&mut s, b"{ not json").unwrap();
            std::thread::sleep(std::time::Duration::from_millis(100));
        });
        let mut client = ControlClient::from_stream(client_side).unwrap();
        let err = client.call(&ControlMethod::Ping).unwrap_err();
        assert!(err.contains("response"), "failure names the stage: {err}");
        server.join().unwrap();
    }

    #[test]
    fn write_failure_during_handshake_is_named() {
        // The server closes before reading anything: the Hello write hits a
        // broken pipe.
        let (client_side, server_side) = UnixStream::pair().unwrap();
        let (ready_tx, ready_rx) = std::sync::mpsc::channel();
        let server = std::thread::spawn(move || {
            drop(server_side); // close without reading
            let _ = ready_tx.send(());
        });
        ready_rx.recv().unwrap();
        std::thread::sleep(std::time::Duration::from_millis(50));
        let err = ControlClient::from_stream(client_side).unwrap_err();
        assert!(
            err.contains("hello write"),
            "failure names the stage: {err}"
        );
        server.join().unwrap();
    }

    #[test]
    fn write_failure_during_call_is_named() {
        // Handshake completes; the server closes before the call frame is
        // written.
        let (client_side, server_side) = UnixStream::pair().unwrap();
        let (ready_tx, ready_rx) = std::sync::mpsc::channel();
        let server = std::thread::spawn(move || {
            let mut s = server_side;
            let _ = read_frame_from(&mut s).unwrap(); // Hello
            let ack = HelloAck::Accepted {
                version: ProtocolVersion::CURRENT,
                resume_supported: true,
            };
            write_frame(&mut s, &serde_json::to_vec(&ack).unwrap()).unwrap();
            drop(s); // close right after the ack
            let _ = ready_tx.send(());
        });
        let mut client = ControlClient::from_stream(client_side).unwrap();
        ready_rx.recv().unwrap();
        std::thread::sleep(std::time::Duration::from_millis(50));
        let err = client.call(&ControlMethod::Ping).unwrap_err();
        assert!(err.contains("write"), "failure names the stage: {err}");
        server.join().unwrap();
    }
}
