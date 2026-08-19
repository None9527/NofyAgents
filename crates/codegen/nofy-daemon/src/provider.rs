//! Provider-side client half of the control plane.
//!
//! The shell's resident runtime uses this to connect to the daemon, register
//! as provider, pull dispatched tasks and report outcomes. Task EXECUTION
//! (joining a pack's persona/skills into an agent) is injected by the caller
//! as a closure — this crate stays free of shell dependencies, so the seam is
//! testable in isolation and the shell integration is one closure away.

use std::io::{Read, Write};
use std::os::unix::net::UnixStream;
use std::time::Duration;

use nofy_channel::frame::{read_frame_from, write_frame, FrameError};
use nofy_channel::hello::{Hello, HelloAck, ProtocolVersion};
use nofy_control_schema::methods::{ControlMethod, ControlResponse};

pub const POLL_IDLE: Duration = Duration::from_millis(250);

pub struct ProviderClient<S: Read + Write> {
    stream: S,
}

impl ProviderClient<UnixStream> {
    pub fn connect(sock_path: &std::path::Path, provider_id: &str) -> Result<Self, FrameError> {
        let stream = UnixStream::connect(sock_path)?;
        Self::register(stream, provider_id)
    }
}

impl<S: Read + Write> ProviderClient<S> {
    /// Wrap an already-connected stream and register as provider.
    pub fn register(mut stream: S, provider_id: &str) -> Result<Self, FrameError> {
        let hello = Hello {
            version: ProtocolVersion::CURRENT,
            client_id: provider_id.to_string(),
            caps: vec!["tasks".into()],
        };
        write_frame(&mut stream, &serde_json::to_vec(&hello)?)?;
        write_frame(
            &mut stream,
            &serde_json::to_vec(&ControlMethod::ProviderRegister {
                provider_id: provider_id.to_string(),
            })?,
        )?;
        let ack = read_frame_from(&mut stream)?.ok_or_else(|| {
            FrameError::Io(std::io::Error::new(
                std::io::ErrorKind::UnexpectedEof,
                "daemon closed during handshake",
            ))
        })?;
        match serde_json::from_slice::<HelloAck>(&ack)? {
            HelloAck::Accepted { .. } => {}
            HelloAck::VersionMismatch { daemon, client } => {
                return Err(FrameError::Io(std::io::Error::new(
                    std::io::ErrorKind::Unsupported,
                    format!("version mismatch: daemon {daemon:?} client {client:?}"),
                )))
            }
        }
        let noted = read_frame_from(&mut stream)?.ok_or_else(|| {
            FrameError::Io(std::io::Error::new(
                std::io::ErrorKind::UnexpectedEof,
                "daemon closed after hello",
            ))
        })?;
        let noted: ControlResponse = serde_json::from_slice(&noted)?;
        match noted {
            ControlResponse::ProviderNoted => Ok(Self { stream }),
            other => Err(FrameError::Io(std::io::Error::new(
                std::io::ErrorKind::InvalidData,
                format!("unexpected handshake response: {other:?}"),
            ))),
        }
    }

    /// One poll: Some(dispatch) or None when no task is ready.
    pub fn poll_once(&mut self) -> Result<Option<ControlResponse>, FrameError> {
        write_frame(
            &mut self.stream,
            &serde_json::to_vec(&ControlMethod::TaskPoll)?,
        )?;
        let frame = read_frame_from(&mut self.stream)?.ok_or_else(|| {
            FrameError::Io(std::io::Error::new(
                std::io::ErrorKind::UnexpectedEof,
                "daemon closed during poll",
            ))
        })?;
        let resp: ControlResponse = serde_json::from_slice(&frame)?;
        Ok(match resp {
            ControlResponse::NoPending => None,
            other => Some(other),
        })
    }

    pub fn report(&mut self, task_id: &str, succeeded: bool) -> Result<(), FrameError> {
        write_frame(
            &mut self.stream,
            &serde_json::to_vec(&ControlMethod::TaskResult {
                task_id: task_id.to_string(),
                succeeded,
            })?,
        )?;
        // Drain the TaskNoted ack so the frame stream stays aligned.
        let _ = read_frame_from(&mut self.stream)?;
        Ok(())
    }

    /// One search long-poll: `Some((request_id, query))` when the daemon is
    /// holding a job for a blocked client, `None` when nothing is pending.
    pub fn search_poll_once(&mut self) -> Result<Option<(String, String)>, FrameError> {
        write_frame(
            &mut self.stream,
            &serde_json::to_vec(&ControlMethod::SearchPoll)?,
        )?;
        let frame = read_frame_from(&mut self.stream)?.ok_or_else(|| {
            FrameError::Io(std::io::Error::new(
                std::io::ErrorKind::UnexpectedEof,
                "daemon closed during search poll",
            ))
        })?;
        let resp: ControlResponse = serde_json::from_slice(&frame)?;
        Ok(match resp {
            ControlResponse::SearchDispatch { request_id, query } => Some((request_id, query)),
            ControlResponse::NoPending => None,
            other => {
                return Err(FrameError::Io(std::io::Error::new(
                    std::io::ErrorKind::InvalidData,
                    format!("unexpected search poll response: {other:?}"),
                )))
            }
        })
    }

    /// Answer a dispatched search job; drains the ack to keep frame alignment.
    pub fn answer_search(
        &mut self,
        request_id: &str,
        hits: u32,
        sessions: Vec<String>,
    ) -> Result<(), FrameError> {
        write_frame(
            &mut self.stream,
            &serde_json::to_vec(&ControlMethod::SearchResult {
                request_id: request_id.to_string(),
                hits,
                sessions,
            })?,
        )?;
        let _ = read_frame_from(&mut self.stream)?;
        Ok(())
    }

    /// Provider main loop: poll with idle backoff; execute via `on_task`
    /// (the shell plugs pack-join + agent assembly here); report outcomes.
    /// Returns when the daemon connection dies.
    pub fn run_loop<F>(&mut self, mut on_task: F) -> Result<(), FrameError>
    where
        F: FnMut(&nofy_control_schema::methods::ControlResponse) -> bool,
    {
        loop {
            match self.poll_once()? {
                Some(dispatch) => {
                    let ok = on_task(&dispatch);
                    if let ControlResponse::TaskDispatch { task_id, .. } = &dispatch {
                        self.report(task_id, ok)?;
                    }
                }
                None => std::thread::sleep(POLL_IDLE),
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::daemon::serve_connection;
    use crate::daemon::DaemonRun;
    use crate::{approval::ApprovalBroker, live::LiveBus, search_proxy::SearchProxy};

    fn daemon_side(
        server: UnixStream,
        run: std::sync::Arc<std::sync::Mutex<Option<DaemonRun>>>,
    ) -> std::thread::JoinHandle<()> {
        std::thread::spawn(move || {
            let mut reader = server.try_clone().unwrap();
            let mut writer = server;
            let _ = serve_connection(
                &mut reader,
                &mut writer,
                &nofy_session_registry::Registry::at(
                    tempfile::tempdir().unwrap().path(),
                ),
                &ApprovalBroker::new(),
                &LiveBus::new(),
                &SearchProxy::new(),
                &run,
                None,
            );
        })
    }

    #[test]
    fn connect_over_real_uds_handshakes() {
        let dir = tempfile::tempdir().unwrap();
        let sock = dir.path().join("control.sock");
        let listener = std::os::unix::net::UnixListener::bind(&sock).unwrap();
        let run = std::sync::Arc::new(std::sync::Mutex::new(None::<DaemonRun>));
        let server = std::thread::spawn(move || {
            let (stream, _) = listener.accept().unwrap();
            let mut reader = stream.try_clone().unwrap();
            let mut writer = stream;
            let _ = serve_connection(
                &mut reader,
                &mut writer,
                &nofy_session_registry::Registry::at(dir.path()),
                &ApprovalBroker::new(),
                &LiveBus::new(),
                &SearchProxy::new(),
                &run,
                None,
            );
        });
        let mut client = ProviderClient::connect(&sock, "shell-9").unwrap();
        // Handshake done; a poll on an empty daemon yields NoPending.
        assert!(client.poll_once().unwrap().is_none());
        drop(client);
        server.join().unwrap();
    }

    #[test]
    fn provider_search_poll_and_answer_roundtrip() {
        // Shared proxy: a blocked client connection issues a SessionSearch,
        // the provider connection polls the job and answers it.
        let search = std::sync::Arc::new(SearchProxy::new());

        let mut client_in = Vec::new();
        write_frame(
            &mut client_in,
            &serde_json::to_vec(&Hello {
                version: nofy_channel::hello::ProtocolVersion::CURRENT,
                client_id: "surface".into(),
                caps: vec![],
            })
            .unwrap(),
        )
        .unwrap();
        write_frame(
            &mut client_in,
            &serde_json::to_vec(&ControlMethod::SessionSearch {
                query: "中文子串".into(),
            })
            .unwrap(),
        )
        .unwrap();
        let search2 = search.clone();
        let client_thread = std::thread::spawn(move || {
            let mut r = std::io::Cursor::new(client_in);
            let mut out = Vec::new();
            serve_connection(
                &mut r,
                &mut out,
                &nofy_session_registry::Registry::at(tempfile::tempdir().unwrap().path()),
                &ApprovalBroker::new(),
                &LiveBus::new(),
                &search2,
                &std::sync::Arc::new(std::sync::Mutex::new(None::<DaemonRun>)),
                None,
            )
            .unwrap();
            out
        });

        // Wait until the client's job is queued, then drive the provider half.
        while search.pending_count() == 0 {
            std::thread::sleep(std::time::Duration::from_millis(10));
        }
        let (client_end, server_end) = UnixStream::pair().unwrap();
        let handle = std::thread::spawn(move || {
            let mut reader = server_end.try_clone().unwrap();
            let mut writer = server_end;
            serve_connection(
                &mut reader,
                &mut writer,
                &nofy_session_registry::Registry::at(tempfile::tempdir().unwrap().path()),
                &ApprovalBroker::new(),
                &LiveBus::new(),
                &search,
                &std::sync::Arc::new(std::sync::Mutex::new(None::<DaemonRun>)),
                None,
            )
        });
        let mut provider = ProviderClient::register(client_end, "shell-s").unwrap();
        let (request_id, query) = provider
            .search_poll_once()
            .unwrap()
            .expect("search job dispatched");
        assert_eq!(query, "中文子串");
        provider
            .answer_search(&request_id, 3, vec!["sess-a".into()])
            .unwrap();
        // No more jobs pending on this connection.
        assert!(provider.search_poll_once().unwrap().is_none());
        drop(provider);
        handle.join().unwrap();

        // The blocked client received the answered hits + session identities.
        let out = client_thread.join().unwrap();
        let mut rr = std::io::Cursor::new(out);
        let _ack = read_frame_from(&mut rr).unwrap().unwrap();
        let resp: serde_json::Value =
            serde_json::from_slice(&read_frame_from(&mut rr).unwrap().unwrap()).unwrap();
        assert_eq!(resp["kind"], "search");
        assert_eq!(resp["hits"], 3);
        assert_eq!(resp["sessions"][0], "sess-a");
    }

    #[test]
    fn provider_pulls_executes_reports() {
        // Pre-load a one-task run on the daemon side.
        let manifest = "packs = [\"p\"]\n\n[[task]]\nid = \"t1\"\npack = \"p\"\ngoal = \"g\"\n";
        let (dr, _) = crate::daemon::submit_run(manifest, &[]).unwrap();
        let run = std::sync::Arc::new(std::sync::Mutex::new(Some(dr)));

        let (client_end, server_end) = UnixStream::pair().unwrap();
        let handle = daemon_side(server_end, run.clone());

        // Drive the protocol manually (run_loop is the production wrapper;
        // an infinite loop needs an external EOF to terminate in tests).
        let mut provider = ProviderClient::register(client_end, "shell-1").unwrap();
        let dispatch = provider.poll_once().unwrap().expect("t1 dispatched");
        let task_id = match &dispatch {
            ControlResponse::TaskDispatch { task_id, .. } => task_id.clone(),
            other => panic!("unexpected dispatch: {other:?}"),
        };
        assert_eq!(task_id, "t1");
        provider.report(&task_id, true).unwrap();
        assert!(
            provider.poll_once().unwrap().is_none(),
            "run complete: NoPending"
        );
        drop(provider); // client EOF ends the daemon-side connection
        handle.join().unwrap();
        assert!(run.lock().unwrap().as_ref().unwrap().orch.is_done());
    }
}
