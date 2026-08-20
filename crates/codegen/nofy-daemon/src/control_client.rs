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
        let Some(bytes) =
            read_frame_from(&mut self.stream).map_err(|e| format!("read: {e}"))?
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
            })
            .unwrap();
        assert!(is_error(&refused), "default-off refusal reaches the client");

        let ack = client.call(&ControlMethod::ScheduleEnable).unwrap();
        assert_eq!(ack["kind"], "schedule_noted");

        let ack = client
            .call(&ControlMethod::ScheduleAdd {
                id: "j1".into(),
                cron_spec: "0 3 * * *".into(),
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
}
