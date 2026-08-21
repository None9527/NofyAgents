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

    /// Report a task outcome. `output` carries the settled text (W-5:
    /// schedule deliveries persist it); `None` keeps the older shape.
    pub fn report(
        &mut self,
        task_id: &str,
        succeeded: bool,
        output: Option<&str>,
    ) -> Result<(), FrameError> {
        write_frame(
            &mut self.stream,
            &serde_json::to_vec(&ControlMethod::TaskResult {
                task_id: task_id.to_string(),
                succeeded,
                output: output.map(String::from),
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
                        self.report(task_id, ok, None)?;
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
        let (dr, _) = crate::daemon::submit_run(manifest, &[], None).unwrap();
        let run = std::sync::Arc::new(std::sync::Mutex::new(Some(dr)));

        let (client_end, server_end) = UnixStream::pair().unwrap();
        let handle = daemon_side(server_end, run.clone());

        // Drive the protocol manually (run_loop is the production wrapper;
        // an infinite loop needs an external EOF to terminate in tests).
        let mut provider = ProviderClient::register(client_end, "shell-1").unwrap();
        let dispatch = provider.poll_once().unwrap().expect("t1 dispatched");
        let ControlResponse::TaskDispatch { task_id, .. } = &dispatch else { panic!("unexpected dispatch: {dispatch:?}") };
        let task_id = task_id.clone();
        assert_eq!(task_id, "t1");
        provider.report(&task_id, true, None).unwrap();
        assert!(
            provider.poll_once().unwrap().is_none(),
            "run complete: NoPending"
        );
        drop(provider); // client EOF ends the daemon-side connection
        handle.join().unwrap();
        assert!(run.lock().unwrap().as_ref().unwrap().orch.is_done());
    }

    /// In-memory scripted stream for the client half: reads return the
    /// prepared frames in order (then EOF); writes are counted and can be
    /// made to fail after N successful writes.
    struct ScriptedStream {
        input: std::io::Cursor<Vec<u8>>,
        writes: usize,
        fail_write_after: Option<usize>,
    }

    impl ScriptedStream {
        fn new(frames: &[Vec<u8>]) -> Self {
            let mut bytes = Vec::new();
            for frame in frames {
                write_frame(&mut bytes, frame).unwrap();
            }
            Self {
                input: std::io::Cursor::new(bytes),
                writes: 0,
                fail_write_after: None,
            }
        }

        fn failing_after(writes: usize) -> Self {
            Self {
                input: std::io::Cursor::new(Vec::new()),
                writes: 0,
                fail_write_after: Some(writes),
            }
        }
    }

    impl std::io::Read for ScriptedStream {
        fn read(&mut self, buf: &mut [u8]) -> std::io::Result<usize> {
            self.input.read(buf)
        }
    }

    impl std::io::Write for ScriptedStream {
        fn write(&mut self, buf: &[u8]) -> std::io::Result<usize> {
            if let Some(cap) = self.fail_write_after {
                if self.writes >= cap {
                    return Err(std::io::Error::new(
                        std::io::ErrorKind::BrokenPipe,
                        "scripted write failure",
                    ));
                }
            }
            self.writes += 1;
            Ok(buf.len())
        }

        fn flush(&mut self) -> std::io::Result<()> {
            Ok(())
        }
    }

    fn accepted_ack() -> Vec<u8> {
        serde_json::to_vec(&HelloAck::Accepted {
            version: ProtocolVersion::CURRENT,
            resume_supported: true,
        })
        .unwrap()
    }

    fn noted_frame() -> Vec<u8> {
        serde_json::to_vec(&ControlResponse::ProviderNoted).unwrap()
    }

    #[test]
    fn register_eof_during_handshake_is_named() {
        // The server closes before acking: the handshake read hits EOF.
        let err = format!(
            "{:?}",
            ProviderClient::register(ScriptedStream::new(&[]), "shell-x")
                .err()
                .unwrap()
        );
        assert!(err.contains("daemon closed during handshake"), "stage named: {err}");
    }

    #[test]
    fn register_version_mismatch_refuses() {
        let ack = serde_json::to_vec(&HelloAck::VersionMismatch {
            daemon: ProtocolVersion::CURRENT,
            client: ProtocolVersion { major: 9, minor: 0 },
        })
        .unwrap();
        let err = format!(
            "{:?}",
            ProviderClient::register(ScriptedStream::new(&[ack]), "shell-x")
                .err()
                .unwrap()
        );
        assert!(err.contains("version mismatch"), "mismatch named: {err}");
    }

    #[test]
    fn register_eof_after_hello_is_named() {
        // Accepted hello, then the server dies before the register ack.
        let err = format!(
            "{:?}",
            ProviderClient::register(ScriptedStream::new(&[accepted_ack()]), "shell-x")
                .err()
                .unwrap()
        );
        assert!(err.contains("daemon closed after hello"), "stage named: {err}");
    }

    #[test]
    fn register_unexpected_handshake_response_refuses() {
        let pong = serde_json::to_vec(&ControlResponse::Pong).unwrap();
        let err = format!(
            "{:?}",
            ProviderClient::register(ScriptedStream::new(&[accepted_ack(), pong]), "shell-x")
                .err()
                .unwrap()
        );
        assert!(
            err.contains("unexpected handshake response"),
            "unexpected ack named: {err}"
        );
    }

    #[test]
    fn register_second_write_failure_surfaces() {
        // Hello goes out; the ProviderRegister frame hits a broken pipe.
        let stream = ScriptedStream::failing_after(2); // hello = 2 write calls
        let Err(err) = ProviderClient::register(stream, "shell-x") else { panic!("the scripted broken pipe must refuse the handshake") };
        assert!(matches!(err, FrameError::Io(e) if e.kind() == std::io::ErrorKind::BrokenPipe));
    }

    /// A registered client over a scripted stream (handshake already done).
    fn registered_client(frames: &[Vec<u8>]) -> ProviderClient<ScriptedStream> {
        let mut all = vec![accepted_ack(), noted_frame()];
        all.extend(frames.iter().cloned());
        ProviderClient::register(ScriptedStream::new(&all), "shell-x").unwrap()
    }

    #[test]
    fn register_first_write_failure_surfaces() {
        // The very first write (the Hello frame) hits a broken pipe.
        let stream = ScriptedStream::failing_after(0);
        let Err(err) = ProviderClient::register(stream, "shell-x") else { panic!("the scripted broken pipe must refuse the handshake") };
        assert!(matches!(err, FrameError::Io(e) if e.kind() == std::io::ErrorKind::BrokenPipe));
    }

    /// Scripted input holding only a torn frame header (2 bytes, then EOF).
    fn torn_input() -> ScriptedStream {
        ScriptedStream {
            input: std::io::Cursor::new(vec![0u8, 1]),
            writes: 0,
            fail_write_after: None,
        }
    }

    #[test]
    fn register_torn_ack_is_read_error() {
        let Err(err) = ProviderClient::register(torn_input(), "shell-x") else { panic!("a torn ack must refuse the handshake") };
        assert!(matches!(err, FrameError::Io(e) if e.kind() == std::io::ErrorKind::UnexpectedEof));
    }

    #[test]
    fn register_malformed_noted_is_parse_error() {
        // Accepted hello, then a noted frame that is not a ControlResponse.
        let input = vec![accepted_ack(), b"{ not a response".to_vec()];
        let Err(err) = ProviderClient::register(ScriptedStream::new(&input), "shell-x") else { panic!("a malformed noted frame must refuse the handshake") };
        assert!(
            matches!(&err, FrameError::Io(e) if e.kind() == std::io::ErrorKind::InvalidData),
            "parse failure surfaces as InvalidData: {err:?}"
        );
    }

    #[test]
    fn poll_once_torn_frame_is_read_error() {
        let mut client = registered_client(&[]);
        client.stream.input = std::io::Cursor::new(vec![0u8, 1]); // torn header
        let err = client.poll_once().unwrap_err();
        assert!(matches!(err, FrameError::Io(e) if e.kind() == std::io::ErrorKind::UnexpectedEof));
    }

    #[test]
    fn poll_once_malformed_response_is_parse_error() {
        let mut client = registered_client(&[b"{ not a response".to_vec()]);
        let err = client.poll_once().unwrap_err();
        assert!(matches!(err, FrameError::Io(e) if e.kind() == std::io::ErrorKind::InvalidData));
    }

    #[test]
    fn report_read_failure_surfaces() {
        // The TaskResult write succeeds; draining the ack hits a torn frame.
        let mut client = ProviderClient {
            stream: torn_input(),
        };
        let err = client.report("t1", true, None).unwrap_err();
        assert!(matches!(err, FrameError::Io(e) if e.kind() == std::io::ErrorKind::UnexpectedEof));
    }

    #[test]
    fn search_poll_once_torn_frame_is_read_error() {
        let mut client = registered_client(&[]);
        client.stream.input = std::io::Cursor::new(vec![0u8, 1]);
        let err = client.search_poll_once().unwrap_err();
        assert!(matches!(err, FrameError::Io(e) if e.kind() == std::io::ErrorKind::UnexpectedEof));
    }

    #[test]
    fn search_poll_once_malformed_response_is_parse_error() {
        let mut client = registered_client(&[b"{ not a response".to_vec()]);
        let err = client.search_poll_once().unwrap_err();
        assert!(matches!(err, FrameError::Io(e) if e.kind() == std::io::ErrorKind::InvalidData));
    }

    #[test]
    fn answer_search_read_failure_surfaces() {
        let mut client = ProviderClient {
            stream: torn_input(),
        };
        let err = client.answer_search("srch-1", 1, vec![]).unwrap_err();
        assert!(matches!(err, FrameError::Io(e) if e.kind() == std::io::ErrorKind::UnexpectedEof));
    }

    #[test]
    fn poll_once_eof_is_named() {
        let mut client = registered_client(&[]);
        let err = format!("{:?}", client.poll_once().unwrap_err());
        assert!(err.contains("daemon closed during poll"), "stage named: {err}");
    }

    #[test]
    fn poll_once_write_failure_surfaces() {
        let mut client = ProviderClient {
            stream: ScriptedStream::failing_after(0),
        };
        assert!(client.poll_once().is_err());
    }

    #[test]
    fn report_write_failure_surfaces() {
        let mut client = ProviderClient {
            stream: ScriptedStream::failing_after(0),
        };
        assert!(client.report("t1", true, None).is_err());
    }

    #[test]
    fn search_poll_once_eof_is_named() {
        let mut client = registered_client(&[]);
        let err = format!("{:?}", client.search_poll_once().unwrap_err());
        assert!(err.contains("daemon closed during search poll"), "stage named: {err}");
    }

    #[test]
    fn search_poll_once_write_failure_surfaces() {
        let mut client = ProviderClient {
            stream: ScriptedStream::failing_after(0),
        };
        assert!(client.search_poll_once().is_err());
    }

    #[test]
    fn search_poll_unexpected_response_refuses() {
        let pong = serde_json::to_vec(&ControlResponse::Pong).unwrap();
        let mut client = registered_client(&[pong]);
        let err = format!("{:?}", client.search_poll_once().unwrap_err());
        assert!(
            err.contains("unexpected search poll response"),
            "unexpected response named: {err}"
        );
    }

    #[test]
    fn answer_search_write_failure_surfaces() {
        let mut client = ProviderClient {
            stream: ScriptedStream::failing_after(0),
        };
        assert!(client.answer_search("srch-1", 1, vec![]).is_err());
    }

    #[test]
    fn connect_to_missing_socket_is_io_error() {
        let dir = tempfile::tempdir().unwrap();
        let err = ProviderClient::connect(&dir.path().join("absent.sock"), "shell-x")
            .err()
            .expect("no listener = connect failure");
        assert!(matches!(err, FrameError::Io(_)), "connect failure is io: {err:?}");
    }

    #[test]
    fn register_malformed_ack_is_parse_error() {
        let Err(err) = ProviderClient::register(
            ScriptedStream::new(&[b"{ not an ack".to_vec()]),
            "shell-x",
        ) else { panic!("a malformed ack must refuse the handshake") };
        assert!(
            matches!(&err, FrameError::Io(e) if e.kind() == std::io::ErrorKind::InvalidData),
            "parse failure surfaces as InvalidData: {err:?}"
        );
    }

    #[test]
    fn run_loop_report_failure_exits_loud() {
        // The dispatch arrives, but the TaskResult write hits a broken
        // pipe: run_loop exits with the report error.
        let dispatch = serde_json::to_vec(&ControlResponse::TaskDispatch {
            task_id: "t1".into(),
            pack: "p".into(),
            goal: "g".into(),
            persona: None,
            skills: vec![],
            cwd: None,
        })
        .unwrap();
        let mut client = registered_client(&[dispatch]);
        // register = 4 writes, the dispatch poll = 2 writes; the report's
        // first write is number 6.
        client.stream.fail_write_after = Some(6);
        let err = client.run_loop(|_resp| true).unwrap_err();
        assert!(
            matches!(&err, FrameError::Io(e) if e.kind() == std::io::ErrorKind::BrokenPipe),
            "the report failure exits the loop loud: {err:?}"
        );
    }

    #[test]
    fn run_loop_non_task_dispatch_is_not_reported() {
        // A dispatch that is not a TaskDispatch still reaches on_task, but
        // there is no task id to report.
        let other = serde_json::to_vec(&ControlResponse::SearchDispatch {
            request_id: "srch-1".into(),
            query: "q".into(),
        })
        .unwrap();
        let idle = serde_json::to_vec(&ControlResponse::NoPending).unwrap();
        let mut client = registered_client(&[other, idle]);
        let seen = std::sync::Arc::new(std::sync::Mutex::new(0usize));
        let seen2 = seen.clone();
        let err = client
            .run_loop(move |_resp| {
                *seen2.lock().unwrap() += 1;
                true
            })
            .unwrap_err();
        let is_eof = matches!(&err, FrameError::Io(e) if e.kind() == std::io::ErrorKind::UnexpectedEof);
        assert!(is_eof, "the loop exits loud when the daemon connection dies: {err:?}");
        assert_eq!(*seen.lock().unwrap(), 1, "the non-task dispatch reached on_task");
    }

    #[test]
    fn run_loop_executes_reports_and_exits_when_the_daemon_dies() {
        // Scripted daemon: one dispatch, its ack, one idle poll, then EOF.
        let dispatch = serde_json::to_vec(&ControlResponse::TaskDispatch {
            task_id: "t1".into(),
            pack: "p".into(),
            goal: "g".into(),
            persona: None,
            skills: vec![],
            cwd: None,
        })
        .unwrap();
        let noted = serde_json::to_vec(&ControlResponse::TaskNoted).unwrap();
        let idle = serde_json::to_vec(&ControlResponse::NoPending).unwrap();
        let mut client = registered_client(&[dispatch, noted, idle]);
        let seen = std::sync::Arc::new(std::sync::Mutex::new(Vec::new()));
        let seen2 = seen.clone();
        let err = client
            .run_loop(move |resp| {
                seen2.lock().unwrap().push(resp.clone());
                true
            })
            .unwrap_err();
        let is_eof = matches!(&err, FrameError::Io(e) if e.kind() == std::io::ErrorKind::UnexpectedEof);
        assert!(is_eof, "the loop exits loud when the daemon connection dies: {err:?}");
        let seen = seen.lock().unwrap();
        assert_eq!(seen.len(), 1, "exactly one task was executed");
        assert!(matches!(
            &seen[0],
            ControlResponse::TaskDispatch { task_id, .. } if task_id == "t1"
        ));
    }
}
