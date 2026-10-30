//! Daemon provider-loop host (app-level integration).
//!
//! The shell registers as the daemon's execution provider when — and only
//! when — `NOFY_DAEMON_SOCK` is set (default off: unset env means the loop
//! never starts and no new outbound calls exist). Two jobs are served with
//! the shipped stacks:
//!
//! - `SearchPoll` — search delegation: the query runs on the shell's FTS
//!   index ([`crate::session::storage::search::execute_search`]) and the
//!   rows reduce to the wire answer (hit count + matched session ids).
//! - `TaskPoll` — a `TaskDispatch` maps through [`crate::agent::pack_join`]
//!   into a real agent assembly; the goal then rides one inference call
//!   whose system prompt is the assembled agent's rendered prompt.

use std::path::{Path, PathBuf};
use std::sync::Arc;

use nofy_daemon::provider::ProviderClient;

use crate::agent::config::Config as AgentConfig;
use crate::agent::pack_join::{self, PackJoin};

/// Gate: path of the daemon control socket (`{NOFY_HOME}/daemon/control.sock`).
pub const DAEMON_SOCK_ENV: &str = "NOFY_DAEMON_SOCK";

/// Provider identity registered on the daemon control plane.
pub const PROVIDER_ID: &str = "shell-provider";

/// The gate read: `Some(socket)` only when the env is set and non-empty.
/// Absent gate = zero behavior change (the loop is never spawned).
pub fn daemon_socket_from_env() -> Option<PathBuf> {
    std::env::var(DAEMON_SOCK_ENV)
        .ok()
        .filter(|v| !v.trim().is_empty())
        .map(PathBuf::from)
}

/// Spawn the gated provider loop. Returns `None` when the gate env is
/// absent — the default, preserving zero-outbound startup.
pub fn spawn_provider_host(agent_config: AgentConfig) -> Option<std::thread::JoinHandle<()>> {
    let sock = daemon_socket_from_env()?;
    Some(std::thread::spawn(move || {
        run_provider_loop(&sock, &agent_config);
    }))
}

/// Connect (with retry backoff) and serve the provider loop until the
/// process exits; a dropped daemon connection is retried, never fatal.
/// One runtime outlives every reconnect so tasks spawned onto it (search
/// index workers) survive a dropped connection.
fn run_provider_loop(sock: &Path, agent_config: &AgentConfig) {
    let rt = match tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
    {
        Ok(rt) => rt,
        Err(e) => {
            tracing::error!(error = %e, "provider runtime build failed; loop not started");
            return;
        }
    };
    let mut backoff = std::time::Duration::from_millis(250);
    loop {
        match ProviderClient::connect(sock, PROVIDER_ID) {
            Ok(client) => {
                tracing::info!(socket = %sock.display(), "provider registered on daemon");
                backoff = std::time::Duration::from_millis(250);
                if let Err(e) = serve_loop(client, &rt, agent_config) {
                    tracing::warn!(error = %e, "provider loop ended; reconnecting");
                }
            }
            Err(e) => {
                tracing::debug!(error = %e, socket = %sock.display(), "daemon not reachable yet");
            }
        }
        std::thread::sleep(backoff);
        backoff = (backoff * 2).min(std::time::Duration::from_secs(15));
    }
}

/// One connection's worth of polling: search jobs first (a client is
/// blocked on them), then task dispatches; idle when both are empty.
fn serve_loop(
    mut client: ProviderClient<std::os::unix::net::UnixStream>,
    rt: &tokio::runtime::Runtime,
    agent_config: &AgentConfig,
) -> Result<(), nofy_channel::frame::FrameError> {
    use nofy_control_schema::methods::ControlResponse;
    loop {
        if let Some((request_id, query)) = client.search_poll_once()? {
            let root = crate::util::nofy_home::nofy_home();
            let (hits, sessions) = rt.block_on(delegate_session_search(&root, &query));
            client.answer_search(&request_id, hits, sessions)?;
            continue;
        }
        match client.poll_once()? {
            Some(dispatch) => {
                let task_id = match &dispatch {
                    ControlResponse::TaskDispatch { task_id, .. } => task_id.clone(),
                    other => {
                        tracing::warn!(?other, "unexpected dispatch frame ignored");
                        continue;
                    }
                };
                let (ok, output) = rt.block_on(execute_dispatch(&dispatch, agent_config));
                client.report(&task_id, ok, output.as_deref())?;
            }
            None => std::thread::sleep(nofy_daemon::provider::POLL_IDLE),
        }
    }
}

/// Search delegation seam: run one query on the shell FTS stack and reduce
/// the rows to the wire answer. Failures degrade to an empty fail-closed
/// answer (a blocked client gets "no hits", never a hang). While the index
/// reports an in-flight bootstrap, an empty answer is a false negative, so
/// the query is retried (bounded) until the index settles — the same
/// re-query contract the ACP extension surfaces via `bootstrapping`.
pub(crate) async fn delegate_session_search(root: &Path, query: &str) -> (u32, Vec<String>) {
    let req = crate::session::storage::search::SessionSearchRequest {
        query: query.to_string(),
        cwd: None,
        limit: 100,
        offset: 0,
        include_content: false,
    };
    let deadline = tokio::time::Instant::now() + std::time::Duration::from_secs(6);
    loop {
        match crate::session::storage::search::execute_search(root, &req).await {
            Ok(resp) => {
                if resp.results.is_empty()
                    && resp.bootstrapping
                    && tokio::time::Instant::now() < deadline
                {
                    tokio::time::sleep(std::time::Duration::from_millis(250)).await;
                    continue;
                }
                return search_answer_from_response(&resp);
            }
            Err(error) => {
                tracing::warn!(%error, "provider search delegation failed");
                return (0, Vec::new());
            }
        }
    }
}

/// Reduce one search response to the wire answer: hit count + matched
/// session identities. Pure, so the delegation seam is unit-testable
/// without the process-global bootstrap worker.
pub(crate) fn search_answer_from_response(
    resp: &crate::session::storage::search::SessionSearchResponse,
) -> (u32, Vec<String>) {
    let sessions: Vec<String> = resp.results.iter().map(|r| r.session_id.clone()).collect();
    let hits = resp.total_estimate.unwrap_or(sessions.len()) as u32;
    (hits, sessions)
}

/// Dispatch execution seam: pack join → agent assembly → one inference
/// call carrying the assembled system prompt. Returns the task outcome
/// plus the model's response text (W-5: schedule deliveries persist it).
async fn execute_dispatch(
    dispatch: &nofy_control_schema::methods::ControlResponse,
    agent_config: &AgentConfig,
) -> (bool, Option<String>) {
    use nofy_control_schema::methods::ControlResponse;
    let (join, goal, cwd) = match dispatch {
        ControlResponse::TaskDispatch { goal, cwd, .. } => {
            let Some(join) = pack_join::join_from_dispatch(dispatch) else {
                return (false, None);
            };
            (join, goal.clone(), cwd.clone())
        }
        _ => return (false, None),
    };
    match run_provider_task(&join, &goal, cwd.as_deref(), agent_config).await {
        Ok(output) => {
            tracing::info!(task_id = %join.task_id, pack = %join.pack_id, "provider task completed");
            (true, Some(output))
        }
        Err(error) => {
            tracing::warn!(task_id = %join.task_id, %error, "provider task failed");
            (false, None)
        }
    }
}

/// Assemble the dispatched agent (pack persona/skills, DS-P3 shadowing)
/// and ride one real inference call with the rendered system prompt.
/// `cwd` binds the run's working directory when the dispatch carries one
/// (W-5 schedule payload); a missing/invalid binding fails loud. Returns
/// the model's response text.
async fn run_provider_task(
    join: &PackJoin,
    goal: &str,
    cwd: Option<&str>,
    agent_config: &AgentConfig,
) -> anyhow::Result<String> {
    let cwd = match cwd {
        Some(dir) => {
            let path = PathBuf::from(dir);
            anyhow::ensure!(path.is_dir(), "dispatch cwd '{dir}' is not a directory");
            path
        }
        None => std::env::current_dir()?,
    };
    let builder = nofy_agent::AgentBuilder::new(
        cwd,
        Arc::new(nofy_tools::computer::local::LocalTerminalBackend::new()),
        nofy_tools::notification::ToolNotificationHandle::noop(),
    );
    let builder = pack_join::apply_to_builder(builder, join);
    let agent = builder.build().await?;

    let sampler_config = crate::agent::config::provider_task_sampling_config(agent_config);
    let client = nofy_sampler::SamplingClient::new(sampler_config)?;
    let mut components = nofy_agent_runtime::Components::default();
    components.models.insert(
        "provider".into(),
        Arc::new(nofy_sampler::agent_model::SamplerModel::new(
            crate::agent::config::provider_task_sampling_config(agent_config),
        )),
    );
    components.prompts.insert(
        "preset".into(),
        Arc::new(nofy_agent_runtime::StaticPrompt(
            agent.system_prompt().to_owned(),
        )),
    );
    components.tool_packs.insert(
        "preset".into(),
        nofy_agent::runtime::tool_catalog(&agent).await?,
    );
    let runtime_agent = nofy_agent_runtime::AgentBuilder::new("provider")
        .model("provider")
        .prompt("preset")
        .tools("preset")
        .settings(nofy_agent_runtime::Settings {
            max_steps: MAX_TOOL_TURNS,
            ..Default::default()
        })
        .compile(&components)?;
    let identity = format!("provider-{}", join.task_id);
    let outcome = runtime_agent
        .invoke(
            nofy_agent_runtime::RunInput::new(goal),
            nofy_agent_runtime::RunContext::new(identity.clone(), identity),
        )
        .await?;
    let nofy_agent_runtime::RunOutcome::Completed {
        output: final_text,
        state,
    } = outcome
    else {
        anyhow::bail!("provider task did not complete: {outcome:?}");
    };
    // Keep the acceptance judge's original name(args) -> prompt-text trail.
    let mut calls = std::collections::HashMap::new();
    let mut tool_activity = Vec::new();
    for message in &state.messages {
        match message {
            nofy_agent_runtime::Message::Opaque { provider, value }
                if provider == "nofy-sampler" =>
            {
                if let Ok(nofy_sampling_types::ConversationItem::Assistant(assistant)) =
                    serde_json::from_value(value.clone())
                {
                    for call in assistant.tool_calls {
                        calls.insert(call.id.to_string(), (call.name, call.arguments.to_string()));
                    }
                }
            }
            nofy_agent_runtime::Message::Tool {
                call_id, content, ..
            } => {
                if let Some((name, args)) = calls.get(call_id) {
                    let text = content
                        .get("value")
                        .and_then(|v| v.get("prompt_text"))
                        .and_then(serde_json::Value::as_str)
                        .map(str::to_owned)
                        .or_else(|| {
                            content
                                .get("error")
                                .and_then(serde_json::Value::as_str)
                                .map(|error| format!("tool error: {error}"))
                        })
                        .unwrap_or_else(|| content.to_string());
                    tool_activity.push(format!(
                        "{}({}) -> {}",
                        name,
                        truncate_for_log(args),
                        truncate_for_log(&text)
                    ));
                }
            }
            _ => {}
        }
    }
    // W-3: acceptance is goal verification, not non-empty output. A judge
    // pass reads the goal against what actually happened (tool trail +
    // final answer) and settles the task accordingly.
    let verdict = judge_goal_achieved(&client, goal, &final_text, &tool_activity).await?;
    anyhow::ensure!(
        verdict.achieved,
        "goal not achieved: {}",
        truncate_for_log(&verdict.reason)
    );
    Ok(final_text)
}

/// Tool-loop turn budget for one delegated run.
const MAX_TOOL_TURNS: usize = 24;

/// Log-safe one-line summary of a tool argument/result payload.
fn truncate_for_log(text: &str) -> String {
    let flat: String = text
        .chars()
        .take(160)
        .collect::<String>()
        .replace('\n', " ");
    if text.chars().count() > 160 {
        format!("{flat}…")
    } else {
        flat
    }
}

/// W-3 acceptance judge: one extra inference over the finished run
/// decides whether the GOAL was actually achieved. The judge sees the
/// tool trail (what was done) plus the final answer — evidence, not
/// claims. Fail-closed: an unreadable verdict settles the task as failed.
async fn judge_goal_achieved(
    client: &nofy_sampler::SamplingClient,
    goal: &str,
    final_text: &str,
    tool_activity: &[String],
) -> anyhow::Result<Verdict> {
    let trail = if tool_activity.is_empty() {
        "(none — the run performed no tool calls)".to_string()
    } else {
        tool_activity
            .iter()
            .rev()
            .take(40)
            .cloned()
            .collect::<Vec<_>>()
            .into_iter()
            .rev()
            .collect::<Vec<_>>()
            .join("\n")
    };
    let prompt = format!(
        "You are an acceptance judge. A delegated task had this goal:\n\n\
         <goal>\n{goal}\n</goal>\n\n\
         The run performed {} tool call(s). The trail (name(args) -> result \
         summary, oldest first):\n\n\
         <tool_trail>\n{trail}\n</tool_trail>\n\n\
         Final answer from the run:\n\n\
         <final_answer>\n{final_text}\n</final_answer>\n\n\
         Decide ONLY from this evidence whether the goal was genuinely \
         achieved. A claim of success with no supporting work, or a goal \
         that could not be satisfied (missing inputs, impossible request), \
         is NOT achieved. Reply with exactly one line: `VERDICT: ACHIEVED` \
         or `VERDICT: NOT_ACHIEVED`, then one short reason line.",
        tool_activity.len()
    );
    let request = nofy_sampling_types::ConversationRequest {
        items: vec![nofy_sampling_types::ConversationItem::user(prompt)],
        model: None,
        ..Default::default()
    };
    let response = client.conversation_collect(request).await?;
    let text: Vec<String> = response
        .items
        .iter()
        .map(|item| item.text_content())
        .filter(|t| !t.is_empty())
        .collect();
    let answer = text.join("\n");
    Ok(parse_verdict(&answer))
}

/// One acceptance verdict.
#[derive(Debug, Clone, PartialEq, Eq)]
struct Verdict {
    achieved: bool,
    reason: String,
}

/// Parse the judge's reply; anything unreadable is fail-closed NOT_ACHIEVED.
fn parse_verdict(answer: &str) -> Verdict {
    let verdict_line = answer
        .lines()
        .find(|line| line.trim().to_uppercase().starts_with("VERDICT:"));
    match verdict_line {
        Some(line)
            if line.to_uppercase().contains("ACHIEVED")
                && !line.to_uppercase().contains("NOT_ACHIEVED") =>
        {
            Verdict {
                achieved: true,
                reason: reason_after(answer, line),
            }
        }
        Some(line) => Verdict {
            achieved: false,
            reason: reason_after(answer, line),
        },
        None => Verdict {
            achieved: false,
            reason: format!("unreadable judge reply: {}", truncate_for_log(answer)),
        },
    }
}

/// The reason text: the rest of the verdict line plus any following lines.
fn reason_after(answer: &str, verdict_line: &str) -> String {
    let mut parts: Vec<String> = Vec::new();
    if let Some(rest) = verdict_line.splitn(2, ':').nth(1) {
        let rest = rest.trim();
        // A bare "ACHIEVED"/"NOT_ACHIEVED" token carries no reason.
        if !rest.is_empty()
            && !rest.eq_ignore_ascii_case("ACHIEVED")
            && !rest.eq_ignore_ascii_case("NOT_ACHIEVED")
        {
            parts.push(rest.to_string());
        }
    }
    let mut after = answer
        .lines()
        .skip_while(|line| line.trim() != verdict_line.trim())
        .skip(1);
    if let Some(next) = after.next() {
        if !next.trim().is_empty() {
            parts.push(next.trim().to_string());
        }
    }
    if parts.is_empty() {
        "no reason given".to_string()
    } else {
        parts.join(" ")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test(flavor = "current_thread")]
    async fn composed_provider_executes_original_tool_and_keeps_goal_judge() {
        use nofy_test_support::{MockInferenceServer, ScriptedResponse, SseEvent};
        let server = MockInferenceServer::start().await.unwrap();
        let cwd = tempfile::tempdir().unwrap();
        let fixture = cwd.path().join("fixture.txt");
        std::fs::write(&fixture, "PROVIDER_ADAPTER_FIXTURE").unwrap();
        let delta = serde_json::json!({"id":"provider-test","object":"chat.completion.chunk","created":1,"model":"test-model",
            "choices":[{"index":0,"delta":{"role":"assistant","tool_calls":[{"index":0,"id":"provider-read-1","type":"function",
            "function":{"name":"read_file","arguments":serde_json::json!({"target_file":fixture}).to_string()}}]},"finish_reason":null}]});
        let finish = serde_json::json!({"id":"provider-test","object":"chat.completion.chunk","created":1,"model":"test-model",
            "choices":[{"index":0,"delta":{},"finish_reason":"tool_calls"}]});
        server.enqueue_response(
            "/v1/chat/completions",
            ScriptedResponse::sse(vec![
                SseEvent::data(delta.to_string()),
                SseEvent::data(finish.to_string()),
                SseEvent::data("[DONE]"),
            ]),
        );
        for text in [
            "fixture read",
            "VERDICT: ACHIEVED\nFixture evidence verified",
        ] {
            server.enqueue_response(
                "/v1/chat/completions",
                ScriptedResponse::sse(nofy_test_support::sse::chat_completion_script_exact(
                    text,
                    "test-model",
                )),
            );
        }
        let mut config = AgentConfig::default();
        config.models.default = Some("test-model".into());
        config.config_models.insert(
            "test-model".into(),
            crate::agent::config::ConfigModelOverride {
                model: Some("test-model".into()),
                base_url: Some(server.url()),
                api_key: Some("local-test".into()),
                api_backend: Some(crate::sampling::ApiBackend::ChatCompletions),
                ..Default::default()
            },
        );
        let join = PackJoin {
            task_id: "adapter-test".into(),
            pack_id: "test".into(),
            persona_instructions: Some("PROVIDER_ADAPTER_PERSONA".into()),
            skill_names: vec![],
        };
        let output = run_provider_task(&join, "read fixture", cwd.path().to_str(), &config)
            .await
            .unwrap();
        assert_eq!(output, "fixture read");
        let bodies = server.request_bodies();
        assert_eq!(bodies.len(), 3);
        assert!(bodies[0].to_string().contains("PROVIDER_ADAPTER_PERSONA"));
        assert!(bodies[1].to_string().contains("PROVIDER_ADAPTER_FIXTURE"));
        assert!(bodies[2].to_string().contains("read_file("));
        assert!(bodies[2].to_string().contains("PROVIDER_ADAPTER_FIXTURE"));
    }

    fn row(session_id: &str, title: &str) -> crate::session::storage::search_fts::SessionSearchRow {
        crate::session::storage::search_fts::SessionSearchRow {
            session_id: session_id.to_string(),
            cwd: "/ws".to_string(),
            title: title.to_string(),
            updated_at_unix: 1,
            score: 1.0,
            matched_fields: vec!["content".to_string()],
            snippet: None,
        }
    }

    /// The delegation reduction (no daemon, no global bootstrap worker):
    /// real `SessionSearchRow`s — including a CJK-titled session — reduce to
    /// the wire answer (hit count + matched session identities), and an
    /// empty response reduces to a fail-closed zero.
    #[test]
    fn search_answer_reduction_maps_rows_to_wire_answer() {
        use crate::session::storage::search::SessionSearchResponse;

        let resp = SessionSearchResponse {
            results: vec![
                row("seed-cjk-1", "跨项目中文检索命中测试"),
                row("seed-2", "second"),
            ],
            next_offset: None,
            total_estimate: Some(2),
            bootstrapping: false,
        };
        let (hits, sessions) = search_answer_from_response(&resp);
        assert_eq!(hits, 2);
        assert_eq!(
            sessions,
            vec!["seed-cjk-1".to_string(), "seed-2".to_string()]
        );

        // No total_estimate → falls back to the row count.
        let resp = SessionSearchResponse {
            results: vec![row("only", "t")],
            next_offset: None,
            total_estimate: None,
            bootstrapping: false,
        };
        assert_eq!(search_answer_from_response(&resp), (1, vec!["only".into()]));

        // Empty → fail-closed zero, no identities.
        let resp = SessionSearchResponse {
            results: vec![],
            next_offset: None,
            total_estimate: Some(0),
            bootstrapping: false,
        };
        assert_eq!(search_answer_from_response(&resp), (0, Vec::new()));
    }

    /// The delegation wiring drives the shipped `execute_search` stack on a
    /// fresh root and degrades to a fail-closed zero (never a hang, never a
    /// panic). Content-level CJK hits through the full bootstrap are proven
    /// by `provider_loop_e2e` on the built binary; content assertions here
    /// would race the process-global bootstrap worker (see `search.rs`).
    #[tokio::test(flavor = "multi_thread", worker_threads = 2)]
    async fn search_delegation_seam_empty_root_is_fail_closed_zero() {
        let root = tempfile::tempdir().unwrap();
        let outcome = tokio::time::timeout(
            std::time::Duration::from_secs(30),
            delegate_session_search(root.path(), "中文检索"),
        )
        .await
        .expect("delegation must not hang");
        assert_eq!(outcome, (0, Vec::new()), "an empty root yields zero hits");
    }

    #[test]
    fn verdict_parse_is_strict_and_fail_closed() {
        // W-3: the judge reply grammar is one VERDICT line; anything else
        // settles the task as failed.
        let ok = parse_verdict("VERDICT: ACHIEVED\nfile written and verified");
        assert!(ok.achieved);
        assert_eq!(ok.reason, "file written and verified");

        let not = parse_verdict("VERDICT: NOT_ACHIEVED\ntarget file does not exist");
        assert!(!not.achieved);
        assert_eq!(not.reason, "target file does not exist");

        // Bare verdict token: reason falls back to the placeholder.
        let bare = parse_verdict("VERDICT: ACHIEVED");
        assert!(bare.achieved);
        assert_eq!(bare.reason, "no reason given");

        // Unreadable replies fail closed.
        assert!(!parse_verdict("all done!").achieved);
        assert!(!parse_verdict("").achieved);
        // "ACHIEVED" inside a NOT_ACHIEVED line must not flip the verdict.
        assert!(!parse_verdict("VERDICT: NOT_ACHIEVED").achieved);
    }

    #[test]
    fn truncate_for_log_flattens_and_clips() {
        assert_eq!(truncate_for_log("a\nb"), "a b");
        let long = "x".repeat(400);
        let clipped = truncate_for_log(&long);
        assert!(clipped.chars().count() <= 161 && clipped.ends_with('…'));
    }

    #[test]
    #[serial_test::serial]
    fn gate_absent_means_no_provider_loop() {
        // The default environment (env unset) must never spawn the loop:
        // zero behavior change and zero new outbound calls.
        let _guard = nofy_test_support::env::EnvGuard::unset(DAEMON_SOCK_ENV);
        assert!(daemon_socket_from_env().is_none());
        assert!(
            spawn_provider_host(AgentConfig::default()).is_none(),
            "an unset gate must not spawn the provider loop"
        );
    }

    #[test]
    #[serial_test::serial]
    fn gate_set_resolves_socket_path() {
        let _guard =
            nofy_test_support::env::EnvGuard::set(DAEMON_SOCK_ENV, "/tmp/ctl/control.sock");
        assert_eq!(
            daemon_socket_from_env(),
            Some(PathBuf::from("/tmp/ctl/control.sock"))
        );
    }

    #[test]
    #[serial_test::serial]
    fn gate_blank_is_treated_as_absent() {
        let _guard = nofy_test_support::env::EnvGuard::set(DAEMON_SOCK_ENV, "   ");
        assert!(
            daemon_socket_from_env().is_none(),
            "a whitespace-only gate must stay off"
        );
    }
}
