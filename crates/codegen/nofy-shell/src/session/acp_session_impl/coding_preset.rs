//! Nofy coding preset: named stage assembly over the shared runtime driver.
//! The host owns capabilities; each optional coding concern is a separate stage.
use super::*;
use nofy_agent_runtime::{coding::CodingHost, pipeline::Flow};
#[path = "coding_preset/completion.rs"]
mod completion;
#[path = "coding_preset/context.rs"]
mod context;
#[path = "coding_preset/convergence.rs"]
mod convergence;
#[path = "coding_preset/dispatch.rs"]
mod dispatch;
#[path = "coding_preset/maintenance.rs"]
mod maintenance;
#[path = "coding_preset/model.rs"]
mod model;
#[path = "coding_preset/stationarity.rs"]
mod stationarity;

type StageResult = Result<Flow<TurnOutcome>, acp::Error>;

struct CodingTurn {
    session: Arc<SessionActor>,
    req_id: String,
    json_schema: Option<serde_json::Value>,
    conv_turn_start: std::time::Instant,
    conv_turn_clock: DualClock,
    tool_definitions: Vec<ToolDefinition>,
    convergence_extended_limit: std::cell::Cell<Option<usize>>,
    structured_output_validator: Option<Result<jsonschema::Validator, String>>,
    schema_ok: bool,
    structured_output_native: bool,
    structured_output_tool: bool,
    prompt_timing: Option<crate::session::prompt_timing::PromptTiming>,
    metrics_drop_guard: TurnMetrics,
    turn_tools_called: Vec<String>,
    tool_turn_count: usize,
    no_new_info_streak: u64,
    last_ledger_len: usize,
    length_salvage: super::length_salvage::LengthSalvage,
    loop_index: u32,
    identical_tool_calls: IdenticalToolCallRun,
    todo_gate_fires: u32,
    auth_retry_schedule: AuthRetrySchedule,
    rate_limit_waits: super::rate_limit_waits::RateLimitWaitBudget,
    turn_span_totals: TurnSpanTotals,
    structured_output_retries: u32,
    memory_reminder: Option<String>,
    tool_calls: Vec<nofy_sampling_types::ToolCall>,
    turn_refused: bool,
    refusal_explanation: Option<String>,
    final_answer_text: Option<String>,
}

impl CodingHost for CodingTurn {
    type Output = TurnOutcome;
    type Error = acp::Error;
    fn stationarity(&mut self) -> impl std::future::Future<Output = StageResult> {
        stationarity::execute(self)
    }
    fn context(&mut self) -> impl std::future::Future<Output = StageResult> {
        context::execute(self)
    }
    fn maintenance(&mut self) -> impl std::future::Future<Output = StageResult> {
        maintenance::execute(self)
    }
    fn model(&mut self) -> impl std::future::Future<Output = StageResult> {
        model::execute(self)
    }
    fn completion(&mut self) -> impl std::future::Future<Output = StageResult> {
        completion::execute(self)
    }
    fn dispatch(&mut self) -> impl std::future::Future<Output = StageResult> {
        dispatch::execute(self)
    }
    fn convergence(&mut self) -> impl std::future::Future<Output = StageResult> {
        convergence::execute(self)
    }
}

pub(super) async fn run(
    session: Arc<SessionActor>,
    req_id: &str,
    json_schema: Option<serde_json::Value>,
) -> Result<TurnOutcome, acp::Error> {
    let conv_turn_start = std::time::Instant::now();
    let conv_turn_clock = DualClock::now();
    session.maybe_refresh_model_metadata_on_resume().await;
    session.maybe_compact_on_model_switch().await?;
    session
        .chat_state_handle
        .record_turn_start(chrono::Utc::now().timestamp_millis());
    {
        let span = tracing::Span::current();
        if let Some(agent) = session.active_agent_type.lock().clone() {
            span.record("agent.name", agent.as_str());
        }
        if let Some(skill) = session.active_skill.lock().clone() {
            span.record("skill.name", skill.as_str());
        }
        span.record(
            "query_source",
            if session.startup_hints.is_subagent {
                "subagent"
            } else {
                "main"
            },
        );
        if let Some(parent) = session.startup_hints.parent_session_id.as_deref() {
            span.record("parent_agent_id", parent);
        }
    }
    if let Some(cfg) = session.chat_state_handle.get_sampling_config().await {
        let span = tracing::Span::current();
        span.record("model_id", cfg.model.as_str());
        if let Some(effort) = cfg.reasoning_effort {
            span.record("effort", effort.as_str());
        }
    }
    let mut prompt_timing = Some(crate::session::prompt_timing::PromptTiming::start());
    let tool_prep_start = std::time::Instant::now();
    let (tool_definitions, mcp_wait_ms) = session.prepare_tool_definitions_timed().await;
    let total_prep_ms = tool_prep_start.elapsed().as_millis() as u64;
    if let Some(ref mut pt) = prompt_timing {
        pt.record_tool_prep(mcp_wait_ms, total_prep_ms);
    }
    nofy_telemetry::unified_log::info(
        "shell.turn.tool_prep_done",
        Some(session.session_info.id.0.as_ref()),
        Some(serde_json::json!({
            "tool_count": tool_definitions.len(),
            "mcp_wait_ms": mcp_wait_ms,
            "total_prep_ms": total_prep_ms,
            "elapsed_since_turn_start_ms": conv_turn_start.elapsed().as_millis() as u64,
        })),
    );
    session.record_turn_model().await;
    let metrics_drop_guard = TurnMetrics::new();
    let turn_tools_called: Vec<String> = Vec::new();
    let tool_turn_count: usize = 1;
    // RTAgent B1: budget extensions earned from the convergence governor
    // raise the effective max-turns limit for this prompt run.
    let convergence_extended_limit: std::cell::Cell<Option<usize>> = std::cell::Cell::new(None);
    // RTAgent B2: streak of tool iterations that produced no new
    // mutations, feeding the governor's no-progress early-finish.
    let no_new_info_streak: u64 = 0;
    let last_ledger_len: usize = 0;
    let length_salvage = super::length_salvage::LengthSalvage::new(
        super::length_salvage::resolve_length_salvage_budget(nofy_config::env_bool(
            "NOFY_LENGTH_SALVAGE",
        )),
    );
    let loop_index: u32 = 0;
    let identical_tool_calls = IdenticalToolCallRun::default();
    let todo_gate_fires: u32 = 0;
    let auth_retry_schedule = AuthRetrySchedule::new();
    let rate_limit_waits = session.rate_limit_wait_budget();
    let turn_span_totals = TurnSpanTotals::default();
    let structured_output_retries: u32 = 0;
    let structured_output_validator = json_schema.as_ref().map(|schema| {
        jsonschema::validator_for(schema).map_err(|e| format!("invalid output schema: {e}"))
    });
    let schema_ok = matches!(structured_output_validator, Some(Ok(_)));
    let native_backend = if json_schema.is_some() {
        match session.chat_state_handle.get_sampling_config().await {
            Some(c) => c.api_backend.supports_native_schema(),
            None => {
                tracing::warn!(
                    "structured output: no sampling config; using StructuredOutput tool"
                );
                false
            }
        }
    } else {
        false
    };
    let structured_output_native = schema_ok && native_backend;
    let structured_output_tool = schema_ok && !native_backend;
    if structured_output_tool {
        session.push_system_reminder(
            "A response schema is required. After any tool use, call the \
                 `StructuredOutput` tool exactly once with your final answer as its \
                 arguments; do not return the answer as text.",
        );
    }

    let mut state = CodingTurn {
        session,
        req_id: req_id.to_owned(),
        json_schema,
        conv_turn_start,
        conv_turn_clock,
        tool_definitions,
        convergence_extended_limit,
        structured_output_validator,
        schema_ok,
        structured_output_native,
        structured_output_tool,
        prompt_timing,
        metrics_drop_guard,
        turn_tools_called,
        tool_turn_count,
        no_new_info_streak,
        last_ledger_len,
        length_salvage,
        loop_index,
        identical_tool_calls,
        todo_gate_fires,
        auth_retry_schedule,
        rate_limit_waits,
        turn_span_totals,
        structured_output_retries,
        memory_reminder: None,
        tool_calls: Vec::new(),
        turn_refused: false,
        refusal_explanation: None,
        final_answer_text: None,
    };
    nofy_agent_runtime::coding::pipeline().run(&mut state).await
}
