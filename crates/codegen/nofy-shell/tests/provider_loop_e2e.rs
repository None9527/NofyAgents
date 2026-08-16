//! App-level integration: the shell hosts the daemon provider loop
//! (NOFY_DAEMON_SOCK-gated) — driven end to end on built binaries.
//!
//! Scenario:
//! 1. Seed a REAL session (CJK content) into a shared NOFY_HOME by running
//!    an actual `nofy agent stdio` session against the mock server.
//! 2. Start `nofy daemon` over that NOFY_HOME (control socket under
//!    `$NOFY_HOME/daemon/control.sock`).
//! 3. Start a second `nofy agent stdio` with `NOFY_DAEMON_SOCK` set — it
//!    registers as the daemon's provider.
//! 4. Drive the control socket from the test:
//!    (a) SessionSearch with a CJK substring returns REAL hits from the
//!        shell-side index — asserted content: the seeded session identity
//!        comes back, and a negative control query returns zero.
//!    (b) TaskSubmit with a pack persona/skills → the provider joins the
//!        pack and assembles its agent with them: the mock server captures
//!        the dispatched task's inference request whose system prompt
//!        carries the pack persona and whose messages carry the goal; the
//!        run then settles (poll → no_pending).
//!
//! `#[ignore]`d by default — requires the pre-built binary (auto-builds):
//! ```bash
//! cargo test -p nofy-shell --test provider_loop_e2e -- --ignored
//! ```

use std::os::unix::net::UnixStream;
use std::path::{Path, PathBuf};
use std::time::Duration;

use nofy_channel::frame::{read_frame_from, write_frame};
use nofy_channel::hello::{Hello, ProtocolVersion};
use nofy_control_schema::methods::ControlMethod;
use nofy_test_support::process::{TestProcess, TestProcessConfig, TestOutput, TestStdin};
use nofy_test_support::*;

const PERSONA_MARKER: &str = "PROVIDER_PERSONA_MARKER_文件管家人格";
const GOAL_MARKER: &str = "PROVIDER_GOAL_MARKER_整理目标";
const SKILL_MARKER: &str = "PROVIDER_SKILL_MARKER_盘点技能正文";
const SKILL_NAME: &str = "pack-skill";
const CJK_SEED_PROMPT: &str = "跨项目中文检索命中测试：文件管家整理计划甲";
const CJK_QUERY: &str = "中文检索命中";

/// One framed control-plane connection driven from the test process.
struct ControlClient {
    reader: std::io::BufReader<UnixStream>,
    writer: UnixStream,
}

impl ControlClient {
    fn connect(sock: &Path) -> Self {
        let stream = UnixStream::connect(sock)
            .unwrap_or_else(|e| panic!("connect {}: {e}", sock.display()));
        stream
            .set_read_timeout(Some(Duration::from_secs(60)))
            .unwrap();
        let mut writer = stream.try_clone().unwrap();
        let hello = Hello {
            version: ProtocolVersion::CURRENT,
            client_id: "e2e-surface".into(),
            caps: vec![],
        };
        write_frame(&mut writer, &serde_json::to_vec(&hello).unwrap()).unwrap();
        let mut reader = std::io::BufReader::new(stream);
        let ack = read_frame_from(&mut reader).unwrap().expect("hello ack");
        let ack: serde_json::Value = serde_json::from_slice(&ack).unwrap();
        assert_eq!(ack["kind"], "Accepted", "handshake must be accepted");
        Self { reader, writer }
    }

    fn call(&mut self, method: &ControlMethod) -> serde_json::Value {
        write_frame(&mut self.writer, &serde_json::to_vec(method).unwrap()).unwrap();
        let frame = read_frame_from(&mut self.reader)
            .unwrap()
            .expect("response frame");
        serde_json::from_slice(&frame).unwrap()
    }
}

/// Poll until the daemon's control socket exists (daemon boot is async).
fn wait_for_socket(sock: &Path) {
    for _ in 0..150 {
        if sock.exists() {
            return;
        }
        std::thread::sleep(Duration::from_millis(200));
    }
    panic!("control socket never appeared at {}", sock.display());
}

/// Spawn `nofy daemon` pinned to `home` as its NOFY_HOME.
fn spawn_daemon(home: &Path) -> TestProcess {
    let mut sandbox = TestSandbox::new();
    sandbox.set_env("NOFY_HOME", home.to_str().expect("home utf8"));
    // Registration is an info-level event; the default filter is `error`.
    sandbox.set_env("RUST_LOG", "nofy_daemon=info");
    let mut cmd = tokio::process::Command::new(nofy_binary());
    cmd.arg("daemon").current_dir(home);
    TestProcess::spawn(
        cmd,
        &sandbox,
        TestProcessConfig::new()
            .label("nofy daemon")
            .stdin(TestStdin::Null)
            .stdout(TestOutput::Capture),
    )
    .expect("spawn nofy daemon")
}

#[tokio::test(flavor = "current_thread")]
#[ignore = "requires pre-built binary"]
async fn provider_loop_search_and_dispatch_e2e() {
    let local = tokio::task::LocalSet::new();
    local
        .run_until(async {
            let server = MockInferenceServer::start_with_models(vec![
                MockModelEntry::new("test-model").with_api_backend("chat-completions"),
            ])
            .await
            .expect("start mock server");

            // ── Phase 1: seed a real session (CJK content) into NOFY_HOME ──
            server.set_response("seeded");
            let cwd = tempfile::tempdir().expect("cwd");
            let home_guard = tempfile::tempdir().expect("shared NOFY_HOME");
            let home = home_guard.path().to_path_buf();
            let mut seeder =
                NofyStdioClient::spawn_with_home(&server, cwd.path(), &home).await;
            seeder.initialize_with_timeout().await;
            let session = seeder.create_session_with_timeout(cwd.path()).await;
            let seeded_session_id = session.0.to_string();
            seeder
                .prompt(&session, CJK_SEED_PROMPT)
                .await
                .expect("seed prompt completes");
            seeder.close().await.expect("seeder exits");
            drop(seeder);

            // ── Phase 2: daemon over the seeded NOFY_HOME ──
            let daemon = spawn_daemon(&home);
            let sock: PathBuf = home.join("daemon").join("control.sock");
            wait_for_socket(&sock);

            // A real skill on disk for the pack to whitelist: the assembled
            // agent must preload + inject it (skills join is observable).
            let skill_dir = cwd.path().join(".nofy").join("skills").join(SKILL_NAME);
            std::fs::create_dir_all(&skill_dir).unwrap();
            std::fs::write(
                skill_dir.join("SKILL.md"),
                format!(
                    "---\nname: {SKILL_NAME}\ndescription: provider e2e skill\n---\n{SKILL_MARKER}\n"
                ),
            )
            .unwrap();

            // ── Phase 3: shell provider with NOFY_DAEMON_SOCK set ──
            server.set_response("provider task complete");
            let mut provider_sandbox = TestSandbox::new();
            provider_sandbox.set_env("NOFY_HOME", home.to_str().expect("home utf8"));
            provider_sandbox
                .set_env("NOFY_DAEMON_SOCK", sock.to_str().expect("sock utf8"));
            provider_sandbox.set_env(
                "RUST_LOG",
                "nofy_shell::agent::provider_host=debug,nofy_daemon=debug",
            );
            let mut provider = NofyStdioClient::spawn_with_sandbox_env_and_args(
                &server,
                cwd.path(),
                provider_sandbox,
                &[],
                &[],
            )
            .await;
            provider.initialize_with_timeout().await;

            // Wait for the provider's registration to land on the daemon
            // (a SessionSearch issued before that would sit out the full
            // fail-closed timeout with no provider to answer it).
            let mut registered = false;
            for _ in 0..300 {
                if daemon.stderr_tail().text.contains("provider registered") {
                    registered = true;
                    break;
                }
                tokio::time::sleep(Duration::from_millis(200)).await;
            }
            assert!(
                registered,
                "provider never registered on the daemon\ndaemon stderr:\n{}\nprovider stderr:\n{}",
                daemon.stderr_tail().text,
                provider.stderr()
            );

            // ── Phase 4: drive the control socket ──
            let mut surface = ControlClient::connect(&sock);

            // (a) daemon-routed search returns REAL hits from the shell index.
            // The provider registers asynchronously; retry until it answers
            // (a search with no provider is a fail-closed SEARCH_TIMEOUT).
            let mut search_resp = serde_json::Value::Null;
            for _ in 0..100 {
                search_resp = surface.call(&ControlMethod::SessionSearch {
                    query: CJK_QUERY.into(),
                });
                if search_resp.get("code").is_none() {
                    break;
                }
                tokio::time::sleep(Duration::from_millis(300)).await;
            }
            assert_eq!(
                search_resp["kind"], "search",
                "search must be answered by the provider, got: {search_resp}"
            );
            let hits = search_resp["hits"].as_u64().expect("hit count");
            let sessions: Vec<String> = search_resp["sessions"]
                .as_array()
                .expect("matched session identities")
                .iter()
                .map(|v| v.as_str().unwrap().to_string())
                .collect();
            assert!(hits >= 1, "CJK substring must hit the seeded session");
            assert!(
                sessions.iter().any(|s| s == &seeded_session_id),
                "the hit must be the seeded session {seeded_session_id}, got {sessions:?}"
            );

            // Negative control: content that was never seeded returns zero.
            let neg = surface.call(&ControlMethod::SessionSearch {
                query: "不存在查询词zzzxyz".into(),
            });
            assert_eq!(neg["kind"], "search", "negative control answered: {neg}");
            assert_eq!(
                neg["hits"].as_u64(),
                Some(0),
                "a query with no seeded content must return zero hits"
            );

            // (b) dispatch carries the pack; the shell joins it into the
            // assembled agent (persona lands in the system prompt, goal in
            // the messages).
            let manifest = format!(
                "packs = [\"steward\"]\n\n[[task]]\nid = \"t1\"\npack = \"steward\"\ngoal = \"{GOAL_MARKER}\"\n"
            );
            let pack = serde_json::json!({
                "id": "steward",
                "persona": PERSONA_MARKER,
                "skills": [SKILL_NAME],
            });
            let accepted = surface.call(&ControlMethod::TaskSubmit {
                manifest,
                packs: vec![pack],
            });
            assert_eq!(accepted["kind"], "project_accepted", "{accepted}");
            assert_eq!(accepted["total"], 1);

            // Wait for the provider's assembled agent to hit the mock server.
            let mut found = None;
            for _ in 0..300 {
                if let Some(body) = server.request_bodies().into_iter().find(|body| {
                    let text = body.to_string();
                    text.contains(PERSONA_MARKER) && text.contains(GOAL_MARKER)
                }) {
                    found = Some(body);
                    break;
                }
                tokio::time::sleep(Duration::from_millis(300)).await;
            }
            let body = found.unwrap_or_else(|| {
                panic!(
                    "dispatched task never produced an inference request carrying the pack \
                     persona + goal; requests seen: {:?}",
                    server.request_bodies()
                )
            });
            let body_text = body.to_string();
            assert!(
                body_text.contains(PERSONA_MARKER),
                "pack persona must reach the model boundary via the assembled system prompt"
            );
            assert!(
                body_text.contains(GOAL_MARKER),
                "the dispatched goal must ride the task request"
            );
            assert!(
                body_text.contains(SKILL_MARKER),
                "the pack's whitelisted skill must be preloaded and injected into the agent"
            );

            // The provider reported the outcome; the run is settled: a poll
            // from this connection sees no pending work.
            let mut settled = serde_json::Value::Null;
            for _ in 0..100 {
                settled = surface.call(&ControlMethod::TaskPoll);
                if settled["kind"] == "no_pending" {
                    break;
                }
                tokio::time::sleep(Duration::from_millis(300)).await;
            }
            assert_eq!(
                settled["kind"], "no_pending",
                "run must be settled after the provider reported: {settled}"
            );

            eprintln!(
                "EVAL provider_loop=pass hits={hits} session={seeded_session_id}"
            );
            let _ = provider.close().await;
        })
        .await;
}
