//! Turn-execution concern for `SessionActor` (`handle_prompt`, turn-end,
//! sampling loop).
use super::*;
#[path = "coding_preset.rs"]
mod coding_preset;
use crate::util::dual_clock::DualClock;
use nofy_tools::implementations::nofy_build::LoopFireMode;
use nofy_tools::types::tool::ToolKind;
/// Synthetic tool the model calls to return its schema-constrained final answer
/// on backends that can't constrain output natively (Messages API). Intercepted
/// in the loop, never executed as a real tool.
const STRUCTURED_OUTPUT_TOOL: &str = "StructuredOutput";
/// Max times the model may re-call `StructuredOutput` with non-conforming args
/// before the turn ends with the last validation error.
const STRUCTURED_OUTPUT_MAX_RETRIES: u32 = 3;
/// What a `StructuredOutput` tool call means for the turn (see
/// `handle_structured_output_tool_call`).
enum StructuredOutputStep {
    /// Accepted, or retries exhausted: the carried result is the final output.
    Complete(Result<serde_json::Value, String>),
    /// Non-conforming args; a corrective tool_result was pushed — re-sample.
    Retry,
    /// No sole StructuredOutput call (absent, or co-emitted with real tools that
    /// should run this round).
    Proceed,
}
/// Parse `raw` as JSON and validate it against a `validator` compiled once per
/// turn. Returns the value on success, or a human-readable error (surfaced to
/// the model on retry and to the client as `structuredOutputError`). A `validator`
/// of `Err` means the user's schema itself was invalid.
fn validate_structured_output(
    validator: &Result<jsonschema::Validator, String>,
    raw: &str,
) -> Result<serde_json::Value, String> {
    let validator = validator.as_ref().map_err(Clone::clone)?;
    let value: serde_json::Value = serde_json::from_str(raw.trim())
        .map_err(|e| format!("model output was not valid JSON: {e}"))?;
    match validator.validate(&value) {
        Ok(()) => Ok(value),
        Err(e) => Err(format!("output does not match the required schema: {e}")),
    }
}
/// Result of the turn-end usage drain (and cancel's no-drain snapshot).
///
/// **Ledger marks** only when [`Self::fail_closed`]. Sticky and background
/// live are **report-level only** (tokens still land on the session ledger).
pub(super) struct UsageDrainOutcome {
    /// Query failure, FG still live after timeout/cancel. Marks both
    /// the prompt and session bills incomplete. (True apply-miss stains
    /// ledgers at fold time via `mark_apply_miss_incomplete`, not here.)
    pub(super) fail_closed: bool,
    /// A background child is still running: only this prompt's report is
    /// incomplete; its spend reaches the session ledger at completion.
    pub(super) background_live: bool,
    /// Pin-scoped sticky (session-only attribution or apply-miss report).
    /// Report incomplete only — does not stain ledgers by itself.
    pub(super) sticky_report: bool,
}
impl UsageDrainOutcome {
    /// Wire / attach incomplete: fail-closed ∪ background ∪ sticky.
    pub(super) fn report_incomplete(&self) -> bool {
        self.fail_closed || self.background_live || self.sticky_report
    }
    /// Map an outstanding reply without a multi-second drain (cancel path).
    /// Same policy as freeze's terminal outcome: FG live → fail-closed;
    /// sticky and background → report only.
    pub(super) fn from_outstanding_reply(
        reply: Option<
            &nofy_tools::implementations::nofy_build::task::types::SubagentOutstandingReply,
        >,
    ) -> Self {
        match reply {
            None => Self {
                fail_closed: true,
                background_live: false,
                sticky_report: false,
            },
            Some(r) => Self {
                fail_closed: !r.live_ids.is_empty(),
                background_live: r.background_live,
                sticky_report: r.subagent_usage_not_applied,
            },
        }
    }
}
/// Accumulates a turn's per-call token usage and tool-call presence across the
/// agentic loop's model calls, recording running totals on the turn span. Kept
/// out of the loop body so telemetry bookkeeping doesn't obscure control flow.
#[derive(Default)]
struct TurnSpanTotals {
    input_tokens: i64,
    output_tokens: i64,
    cache_read_tokens: i64,
    has_tool_call: bool,
}
impl TurnSpanTotals {
    /// Fold one model response into the totals (tokens sum — each call is billed
    /// its full prompt; has_tool_call OR-s — the final call has none) and update
    /// the span. `stop_reason` is last-wins (the terminal reason), not summed.
    fn record(&mut self, span: &tracing::Span, response: &ConversationResponse) {
        if let Some(u) = response.usage.as_ref() {
            self.input_tokens += i64::from(u.prompt_tokens);
            self.output_tokens += i64::from(u.completion_tokens);
            self.cache_read_tokens += i64::from(u.cached_prompt_tokens);
            span.record("input_tokens", self.input_tokens);
            span.record("output_tokens", self.output_tokens);
            span.record("cache_read_tokens", self.cache_read_tokens);
        }
        if let Some(sr) = response.stop_reason {
            span.record("stop_reason", sr.as_str());
        }
        self.has_tool_call |= !response.tool_calls().is_empty();
        span.record("response.has_tool_call", self.has_tool_call);
    }
}
/// How the turn's per-block user-message echo is published to clients /
/// `updates.jsonl`.
///
/// Every turn consumes a `prompt_index`, and rewind / fork truncation
/// (`replay_to_prompt`, `truncate_for_prompt_by`) recover turn
/// boundaries by counting persisted `UserMessageChunk` runs — so every mode
/// persists the echo. Turns whose content must not render as a user prompt
/// (notification drain) are hidden by the *pager* via the
/// `hideFromScrollback` chunk meta, not by omitting the persisted line.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum UserEchoMode {
    /// Live + persist (real user / cron / skill turns).
    Broadcast,
    /// Persist without live broadcast. Interject-fallback: panes already
    /// rendered the text, so a live echo would duplicate it. Notification
    /// drain: model-only content (the UI surfaces it via side channels:
    /// monitor gutter, task pane) that no pane should render live.
    PersistOnly,
}
fn user_echo_mode(prompt_id: &str) -> UserEchoMode {
    if super::interjection::is_interject_fallback(prompt_id) {
        return UserEchoMode::PersistOnly;
    }
    match super::super::PromptOrigin::from_prompt_id(prompt_id) {
        super::super::PromptOrigin::NotificationDrain => UserEchoMode::PersistOnly,
        _ => UserEchoMode::Broadcast,
    }
}
impl SessionActor {
    /// Exactly once per turn: the cancel path and the turn's own post-loop both announce.
    pub(super) async fn notify_turn_abort(
        &self,
        epoch: TurnEpoch,
        reason: nofy_agent_lifecycle::TurnAbortReason,
    ) {
        if !self.turn_abort.try_mark_announced(epoch) {
            return;
        }
        let input = nofy_agent_lifecycle::TurnAbortInput::new(reason);
        for contributor in self.extension_registry.turn_lifecycle_contributors() {
            contributor.on_turn_abort(&input).await;
        }
    }

    /// Run the image-normalization pipeline (re-encode caps, min-side and
    /// integrity checks) and surface its outcomes: compression / re-encode
    /// fallback / dropped notices are appended to `text_out` (TEXT only —
    /// image data never enters a string) and mirrored as
    /// `ImageCompressed`/`ImageDropped` notifications. Returns the surviving
    /// images. Single owner of the notice/notify wiring, shared by the
    /// prompt path and the interjection drain.
    pub(crate) async fn normalize_images_with_notices(
        &self,
        text_out: &mut String,
        images: Vec<acp::ImageContent>,
        is_cursor: bool,
    ) -> Vec<acp::ImageContent> {
        let mut norm_result =
            crate::session::image_normalize::normalize_images(images, is_cursor).await;
        let user_images = std::mem::take(&mut norm_result.images);
        use crate::extensions::notification::ImageCompressedEntry;
        if !norm_result.compressed.is_empty() {
            text_out.push_str(&crate::session::image_normalize::render_compression_notice(
                &norm_result.compressed,
                is_cursor,
            ));
            let message = norm_result
                .compressed
                .iter()
                .map(|c| c.display())
                .collect::<Vec<_>>()
                .join("; ");
            let images = norm_result
                .compressed
                .iter()
                .map(ImageCompressedEntry::from)
                .collect();
            self.send_xai_notification(NofySessionUpdate::ImageCompressed { images, message })
                .await;
        }
        if !norm_result.re_encode_fallbacks.is_empty() {
            text_out.push_str(
                &crate::session::image_normalize::render_re_encode_fallback_notice(
                    &norm_result.re_encode_fallbacks,
                    is_cursor,
                ),
            );
            self.send_xai_notification(NofySessionUpdate::ImageCompressed {
                images: vec![],
                message: norm_result.re_encode_fallbacks.join(" "),
            })
            .await;
        }
        if let Some((notice, notes)) = crate::session::image_normalize::dropped_to_envelope(
            std::mem::take(&mut norm_result.dropped),
            is_cursor,
        ) {
            text_out.push_str(&notice);
            self.send_xai_notification(NofySessionUpdate::ImageDropped { notes })
                .await;
        }
        user_images
    }
    pub(super) fn persist_host_turn_user_echo(&self, text: &str, prompt_id: &str) {
        let text = text.trim();
        if text.is_empty() {
            return;
        }
        let mut chunk_meta = serde_json::Map::new();
        chunk_meta.insert(
            crate::session::storage::HOST_TURN_META_KEY.into(),
            serde_json::json!(true),
        );
        if super::super::PromptOrigin::from_prompt_id(prompt_id).hide_user_echo_from_scrollback() {
            chunk_meta.insert("hideFromScrollback".into(), serde_json::json!(true));
        }
        let update = acp::SessionUpdate::UserMessageChunk(
            acp::ContentChunk::new(acp::ContentBlock::Text(acp::TextContent::new(
                text.to_string(),
            )))
            .meta(Some(chunk_meta)),
        );
        let notification_meta = self.build_notification_meta();
        let notification = acp::SessionNotification::new(self.session_info.id.clone(), update)
            .meta(notification_meta.as_object().cloned());
        let _ = self
            .notifications
            .persistence_tx
            .send(PersistenceMsg::Update(
                crate::session::storage::SessionUpdate::Acp(Box::new(notification)),
            ));
    }
    #[tracing::instrument(
        name = "session.handle_prompt",
        skip_all,
        fields(
            session_id = %self.session_info.id.0,
            prompt_id = %prompt_id,
            prompt_length = tracing::field::Empty,
            command_name = tracing::field::Empty,
            command_source = tracing::field::Empty,
        )
    )]
    pub(super) async fn handle_prompt(
        self: &Arc<Self>,
        prompt_id: &str,
        prompt_blocks: Vec<acp::ContentBlock>,
        prompt_mode: PromptMode,
        prompt_client_identifier: Option<String>,
        prompt_screen_mode: Option<String>,
        verbatim: bool,
        json_schema: Option<serde_json::Value>,
        persist_ack: Option<oneshot::Sender<()>>,
        parsed_prompt_tx: Option<oneshot::Sender<ParsedPromptInfo>>,
    ) -> PromptTurnResult {
        let _active = nofy_telemetry::activity::TURNS_ACTIVE.enter();
        let handle_prompt_start = std::time::Instant::now();
        let prompt_length: usize = prompt_blocks
            .iter()
            .map(|b| match b {
                acp::ContentBlock::Text(t) => t.text.len(),
                _ => 0,
            })
            .sum();
        tracing::Span::current().record("prompt_length", prompt_length as i64);
        *self.active_skill.lock() = None;
        nofy_telemetry::unified_log::info(
            "shell.handle_prompt.start",
            Some(self.session_info.id.0.as_ref()),
            Some(serde_json::json!({
                "prompt_id": prompt_id,
                "block_count": prompt_blocks.len(),
            })),
        );
        let origin = super::super::PromptOrigin::from_prompt_id(prompt_id);
        if let Some(completion_id) = origin.completion_id() {
            self.mark_completions_reported(&[completion_id]).await;
            if let Some(reservations) = &self.tool_context.task_completion_reservations {
                reservations.release(completion_id);
            }
        }
        if !origin.is_synthetic() {
            self.invalidate_side_calls_for_new_prompt();
        }
        self.ensure_session_disk_writable().await?;
        self.signals_handle().increment_turn();
        let prompt_mode = self.resolve_turn_prompt_mode(&origin, prompt_mode);
        *self.turn_start_prompt_mode.lock() = prompt_mode;
        *self.turn_prompt_mode.lock() = prompt_mode;
        let _turn_active_guard =
            TurnActiveGuard::activate(self.tool_context.is_turn_active.as_ref());
        let _session_turn_active_guard = TurnActiveGuard::activate(Some(&self.session_turn_active));
        let turn_start_input = nofy_agent_lifecycle::TurnStartInput::new(
            super::super::PromptOrigin::from_prompt_id(prompt_id).is_synthetic(),
        );
        for contributor in self.extension_registry.turn_lifecycle_contributors() {
            contributor.on_turn_start(&turn_start_input).await;
        }
        if let Ok(mut pending) = self.rewind_pending_prompt.lock()
            && let Some(prev_text) = pending.take()
        {
            let new_text = prompt_blocks.iter().fold(String::new(), |mut acc, b| {
                if let acp::ContentBlock::Text(t) = b {
                    acc.push_str(&t.text);
                }
                acc
            });
            if new_text.trim() == prev_text.trim() {
                self.signals_handle().record_regeneration();
            } else {
                self.signals_handle().record_edit_and_retry();
            }
        }
        if let Some(bash_command) = Self::extract_bash_command(&prompt_blocks) {
            return self
                .handle_direct_bash_command(prompt_id, bash_command, &prompt_blocks)
                .await;
        }
        let slash_skills = self.slash_skills_for_resolve().await;
        let skill_rewrite = if crate::session::is_cursor_user_template(
            &self.agent.borrow().definition().user_message_template,
        ) {
            slash_commands::SkillSlashRewrite::Passthrough
        } else {
            slash_commands::SkillSlashRewrite::RewriteToRun
        };
        let availability = self.command_availability().await;
        let mut pending_skill_information: Option<String> = None;
        let (workflow_registry, named_workflows) = self.named_workflow_snapshot();
        let original_prompt_text = prompt_blocks.iter().fold(String::new(), |mut acc, b| {
            if let acp::ContentBlock::Text(t) = b {
                acc.push_str(&t.text);
            }
            acc
        });
        let loop_fire_mode = if self.rebuild_spec.scheduler_background_loops {
            LoopFireMode::Detached
        } else {
            LoopFireMode::InSession
        };
        let prompt_blocks = match slash_commands::resolve(
            prompt_blocks,
            &slash_skills,
            availability,
            skill_rewrite,
            &named_workflows,
            loop_fire_mode,
        ) {
            Ok(blocks) => blocks,
            Err(SlashCommandOutcome::Builtin(action)) => {
                let text_block =
                    |text: String| acp::ContentBlock::Text(acp::TextContent::new(text));
                let slash_used = nofy_telemetry::events::SlashCommandUsed {
                    command: action.command_name().to_string(),
                    args_provided: action.args_provided(),
                };
                {
                    let span = tracing::Span::current();
                    span.record("command_name", action.command_name());
                    span.record("command_source", "builtin");
                }
                match action {
                    BuiltinAction::GoalSet {
                        objective,
                        token_budget,
                    } => {
                        nofy_telemetry::session_ctx::log_event(slash_used);
                        let reminder = self.setup_goal(&objective, token_budget).await;
                        vec![text_block(reminder)]
                    }
                    BuiltinAction::GoalResume => {
                        nofy_telemetry::session_ctx::log_event(slash_used);
                        match self.resume_goal().await {
                            GoalResumeOutcome::Inference { reminder, user_msg } => {
                                self.send_slash_command_output(&user_msg).await;
                                vec![text_block(reminder)]
                            }
                            GoalResumeOutcome::Message(msg) => {
                                self.persist_host_turn_user_echo(&original_prompt_text, prompt_id);
                                self.mark_front_message_committed().await;
                                self.send_host_turn_slash_command_output(&msg).await;
                                return ok_end_turn(0, None);
                            }
                        }
                    }
                    BuiltinAction::WorkflowLaunch { name, input } => {
                        self.persist_host_turn_user_echo(&original_prompt_text, prompt_id);
                        self.mark_front_message_committed().await;
                        let msg = self
                            .launch_named_workflow(&workflow_registry, &name, &input)
                            .await;
                        self.send_host_turn_slash_command_output(&msg).await;
                        return ok_end_turn(0, None);
                    }
                    _ => {
                        self.persist_host_turn_user_echo(&original_prompt_text, prompt_id);
                        return self.execute_builtin_slash_command(action).await;
                    }
                }
            }
            Err(SlashCommandOutcome::InvokeSkill {
                blocks: original_blocks,
                skills: parsed_skills,
            }) => {
                if let Some(first) = parsed_skills.first() {
                    *self.active_skill.lock() = Some(first.name.clone());
                    let span = tracing::Span::current();
                    span.record("command_name", first.name.as_str());
                    span.record(
                        "command_source",
                        if first.plugin_name.is_some() {
                            "plugin"
                        } else {
                            "skill"
                        },
                    );
                }
                for sk in &parsed_skills {
                    nofy_telemetry::session_ctx::log_event(
                        nofy_telemetry::events::SlashCommandUsed {
                            command: sk.name.clone(),
                            args_provided: !sk.args.is_empty(),
                        },
                    );
                    nofy_telemetry::session_ctx::log_event(
                        nofy_telemetry::events::SkillDispatched {
                            skill_name: sk.name.clone(),
                            plugin_source: sk.plugin_name.clone(),
                            trigger: nofy_telemetry::events::SkillTrigger::SlashCommand,
                        },
                    );
                    let skill_source = if sk.plugin_name.is_some() {
                        "plugin"
                    } else {
                        crate::session::telemetry::skill_source_label(
                            &sk.skill_path,
                            self.session_info.cwd.as_str(),
                        )
                    };
                    tracing::info_span!(
                        "skill.activated",
                        skill_name = %sk.name,
                        invocation_trigger = "slash_command",
                        skill_source = skill_source,
                    )
                    .in_scope(|| {});
                    if let Some(ref pname) = sk.plugin_name {
                        nofy_telemetry::session_ctx::log_event(
                            nofy_telemetry::events::PluginUsed {
                                plugin_id: pname.clone(),
                                plugin_name: pname.clone(),
                                skill_name: Some(sk.name.clone()),
                                hook_event: None,
                                success: true,
                            },
                        );
                        tracing::info_span!(
                            "plugin.used",
                            plugin_name = %pname,
                            skill_name = %sk.name,
                        )
                        .in_scope(|| {});
                    }
                }
                pending_skill_information = slash_commands::build_skill_information_for_refs(
                    &parsed_skills,
                    &slash_skills,
                    &self.session_id_string(),
                )
                .await;
                original_blocks
            }
        };
        self.events.begin_turn();
        let model_id = self.current_model_id().await;
        let turn_number = self.chat_state_handle.get_prompt_index().await as u64;
        self.current_turn_number.set(turn_number);
        let yolo_mode = self.permissions.is_yolo_mode();
        let msg_count = self.chat_state_handle.get_conversation_len().await;
        let redirect_kind = if matches!(
            super::super::PromptOrigin::from_prompt_id(prompt_id),
            super::super::PromptOrigin::User
        ) {
            self.events.take_prior_redirect_kind()
        } else {
            None
        };
        self.emit_event(crate::session::events::Event::TurnStarted {
            session_id: self.session_id_string(),
            turn_number,
            model_id: model_id.clone(),
            yolo_mode,
            conversation_message_count: msg_count,
            session_relationship: crate::session::events::SessionRelationship::Primary,
            schema_version: crate::session::events::EVENT_SCHEMA_VERSION.into(),
            redirect_kind,
        });
        self.send_before_turn_event(nofy_tool_protocol::turn_hook::BeforeTurnPayload {
            turn_number: self.chat_state_handle.get_prompt_index().await as u64,
            model_id: model_id.clone(),
            yolo_mode: self.permissions.is_yolo_mode(),
            conversation_message_count: msg_count,
            session_relationship: nofy_tool_protocol::turn_hook::DEFAULT_SESSION_RELATIONSHIP
                .to_string(),
            schema_version: crate::session::events::EVENT_SCHEMA_VERSION.to_string(),
        })
        .await;
        let turn_idx = self.chat_state_handle.get_prompt_index().await as u64;
        nofy_telemetry::session_ctx::log_session_event(crate::agent::session_metrics::Turn {
            session_id: self.session_info.id.0.to_string(),
            turn_number: turn_idx,
        });
        let current_prompt_index = self.chat_state_handle.get_prompt_index().await;
        nofy_telemetry::session_ctx::begin_prompt_id();
        let origin = super::super::PromptOrigin::from_prompt_id(prompt_id);
        let mut chunk_meta = serde_json::Map::new();
        chunk_meta.insert("modelId".into(), serde_json::json!(model_id));
        chunk_meta.insert(
            "promptIndex".into(),
            serde_json::json!(current_prompt_index),
        );
        if origin.hide_user_echo_from_scrollback() {
            chunk_meta.insert("hideFromScrollback".into(), serde_json::json!(true));
        }
        let user_chunk_meta = Some(chunk_meta);
        self.chat_state_handle.increment_prompt_index();
        // Runtime journal: turn boundary (noop if NOFY_RUNTIME_JOURNAL=0).
        self.runtime_journal.emit(
            nofy_session_journal::EventKind::TurnStarted,
            serde_json::json!({ "prompt_index": current_prompt_index }),
        );
        let text = prompt_blocks.iter().fold(String::new(), |mut acc, b| {
            if let acp::ContentBlock::Text(t) = b {
                acc.push_str(&t.text);
            }
            acc
        });
        let trimmed = text.trim().to_string();
        if !trimmed.is_empty() {
            self.chat_state_handle.cache_prompt_text(trimmed);
        }
        *self.tool_context.prompt_index.lock().await = current_prompt_index;
        self.file_state_tracker
            .begin_prompt(current_prompt_index)
            .await;
        let echo_mode = user_echo_mode(prompt_id);
        for block in prompt_blocks.iter() {
            let update = acp::SessionUpdate::UserMessageChunk(
                acp::ContentChunk::new(block.clone()).meta(user_chunk_meta.clone()),
            );
            let notification_meta = self.build_notification_meta();
            let notification = acp::SessionNotification::new(self.session_info.id.clone(), update)
                .meta(notification_meta.as_object().cloned());
            if echo_mode == UserEchoMode::PersistOnly {
                let _ = self
                    .notifications
                    .persistence_tx
                    .send(PersistenceMsg::Update(
                        crate::session::storage::SessionUpdate::Acp(Box::new(notification)),
                    ));
            } else {
                self.emit_notification_direct(notification).await;
            }
        }
        let crate::session::prompt_parser::ParsedPrompt {
            mut context,
            query,
            skill_information: skill_info,
            images: mut raw_images,
            is_cursor,
        } = match parse_prompt_with_skills(
            &prompt_blocks,
            self.tool_context.cwd.to_path_buf(),
            &self.session_info,
            verbatim,
            self.is_cursor_harness(),
            pending_skill_information.take().unwrap_or_default(),
        )
        .await
        {
            Ok(v) => v,
            Err(err) => {
                tracing::warn!("Invalid prompt: {}", err.message);
                return Err(err);
            }
        };
        let recovered = crate::session::placeholder_images::recover_orphan_placeholders(
            &query,
            &mut raw_images,
            std::path::Path::new(&self.session_info.cwd),
        );
        if recovered > 0 {
            tracing::info!(
                session_id = %self.session_info.id,
                recovered,
                "server-side placeholder fallback: loaded orphan image(s) from disk",
            );
        }
        let query = crate::session::placeholder_images::strip_paths_from_image_placeholders(query);
        let user_images = self
            .normalize_images_with_notices(&mut context, raw_images, is_cursor)
            .await;
        let (query, extra_images) = if !self.is_cursor_harness() {
            let extraction = nofy_tools::util::base64_images::extract_base64_images(query);
            if extraction.images.is_empty() {
                (extraction.text, Vec::new())
            } else {
                let cleaned_text = extraction.text;
                let count = extraction.images.len();
                tracing::info!(
                    session_id = %self.session_info.id,
                    count,
                    "base64 images extracted from user query",
                );
                let acp_imgs: Vec<agent_client_protocol::ImageContent> = extraction
                    .images
                    .into_iter()
                    .map(|img| agent_client_protocol::ImageContent::new(img.data, img.mime_type))
                    .collect();
                let nr = crate::session::image_normalize::normalize_images(acp_imgs, false).await;
                if !nr.re_encode_fallbacks.is_empty() {
                    tracing::warn!(
                        session_id = %self.session_info.id,
                        notes = %nr.re_encode_fallbacks.join(" "),
                        "Extracted user query image kept original after re-encode failure",
                    );
                }
                (cleaned_text, nr.images)
            }
        } else {
            (query, Vec::new())
        };
        let assembled = crate::session::prompt_parser::ParsedPrompt::assemble_parts_with_skills(
            &context,
            &query,
            &skill_info,
            is_cursor,
        );
        let pre_truncation_text = assembled.clone();
        let (user_message, truncated_local_path) = if verbatim {
            (assembled, None)
        } else {
            self.maybe_truncate_large_prompt_with_skills(
                context,
                query,
                skill_info,
                is_cursor,
                current_prompt_index,
            )
            .await
        };
        let was_truncated = truncated_local_path.is_some();
        if let Some(tx) = parsed_prompt_tx {
            let _ = tx.send(ParsedPromptInfo {
                text: user_message.clone(),
                full_text: if was_truncated {
                    Some(pre_truncation_text)
                } else {
                    None
                },
                local_path: truncated_local_path,
            });
        }
        let _ = self
            .notifications
            .persistence_tx
            .send(PersistenceMsg::ContentChunk(PersistenceContentChunk::new(
                prompt_blocks.to_vec(),
            )));
        let model_id = self
            .chat_state_handle
            .get_sampling_config()
            .await
            .map(|c| c.model)
            .unwrap_or_default();
        if self.telemetry_enabled || nofy_telemetry::external::is_active() {
            let effective_client_identifier =
                prompt_client_identifier.or_else(|| self.client_identifier.clone());
            let ev = nofy_telemetry::events::PromptSubmitted {
                prompt_length: user_message.len(),
                model_id,
                client_identifier: effective_client_identifier,
                screen_mode: prompt_screen_mode,
                prompt_text: None,
            };
            nofy_telemetry::session_ctx::log_event_dual(self.telemetry_enabled, ev);
        }
        self.maybe_inject_mcp_reminder().await;
        self.maybe_inject_mcp_connecting_reminder().await;
        self.maybe_inject_date_rollover_reminder().await;
        self.inject_plan_mode_reminders().await;
        self.inject_resumed_tasks_reminder();
        if matches!(&origin, super::super::PromptOrigin::User) {
            if let Some(gate) = &self.tool_context.task_wake_suppressed {
                gate.set(false);
            }
            nofy_telemetry::unified_log::info(
                "shell.task_wake.gate_cleared",
                Some(self.session_info.id.0.as_ref()),
                Some(serde_json::json!({ "reason": "handle_prompt_user_start" })),
            );
            self.consume_deferred_completions_for_user_turn().await;
        }
        self.drain_between_turn_completions().await;
        self.inject_workflow_status_reminder().await;
        let user_message = if user_images.is_empty() {
            user_message
        } else if self.is_cursor_harness() {
            self.transcribe_user_images(user_message, &user_images)
                .await?
        } else {
            let session_dir =
                crate::session::persistence::session_dir(&crate::session::info::Info {
                    id: self.session_info.id.clone(),
                    cwd: self.session_info.cwd.clone(),
                });
            crate::session::image_describe::persist_and_prepend_image_files(
                &session_dir,
                &user_images,
                &user_message,
            )
            .map_err(|e| {
                acp::Error::internal_error()
                    .data(format!("failed to save user images to assets dir: {e}"))
            })?
        };
        let attached_image_refs = if self.is_cursor_harness() {
            Vec::new()
        } else {
            crate::session::placeholder_images::attached_image_references(&user_images)
        };
        self.tool_bridge_handle()
            .update_resource(nofy_tools::types::resources::AttachedImages(
                attached_image_refs,
            ))
            .await;
        let prompt_text_for_hook = user_message.clone();
        {
            let origin = super::super::PromptOrigin::from_prompt_id(prompt_id);
            if matches!(origin, super::super::PromptOrigin::User) {
                self.maybe_inject_interrupt_reminder().await;
            }
            let mut user_chat = match &origin {
                super::super::PromptOrigin::TaskCompleted { .. } => {
                    ConversationItem::task_completed(user_message)
                }
                super::super::PromptOrigin::SubagentCompleted { .. } => {
                    ConversationItem::subagent_completed(user_message)
                }
                super::super::PromptOrigin::WorkflowCompleted { .. } => {
                    ConversationItem::notification_drain(user_message)
                }
                super::super::PromptOrigin::NotificationDrain => {
                    ConversationItem::notification_drain(user_message)
                }
                super::super::PromptOrigin::GoalSummary => {
                    ConversationItem::goal_summary(user_message)
                }
                super::super::PromptOrigin::GoalClassifierNudge => {
                    ConversationItem::goal_classifier_nudge(user_message)
                }
                super::super::PromptOrigin::SchedulerFired => {
                    ConversationItem::scheduler_fired(user_message)
                }
                super::super::PromptOrigin::PlanResume => ConversationItem::user(user_message),
                super::super::PromptOrigin::User => {
                    let mut item = ConversationItem::user(user_message);
                    if let Some(interrupt) = self
                        .events
                        .take_prior_interrupt_category()
                        .and_then(crate::session::events::prior_turn_interrupt_from_cancellation)
                    {
                        item.set_prior_turn_interrupt(interrupt);
                    }
                    item
                }
            };
            user_chat.set_prompt_index(current_prompt_index);
            if !self.is_cursor_harness() {
                for image in &user_images {
                    user_chat.add_image(pick_user_image_url(image));
                }
                for image in &extra_images {
                    user_chat.add_image(format!("data:{};base64,{}", image.mime_type, image.data));
                }
            }
            if let Some(ack) = persist_ack {
                if self
                    .chat_state_handle
                    .push_user_message_and_ack(user_chat)
                    .await
                    .is_some()
                {
                    self.mark_front_message_committed().await;
                    let (flush_tx, flush_rx) = oneshot::channel();
                    if self
                        .notifications
                        .persistence_tx
                        .send(PersistenceMsg::FlushAndAck {
                            respond_to: flush_tx,
                        })
                        .is_ok()
                        && matches!(flush_rx.await, Ok(Ok(())))
                    {
                        let _ = ack.send(());
                    } else {
                        tracing::error!(
                            session_id = %self.session_info.id.0,
                            prompt_id = %prompt_id,
                            "persist_ack flush barrier failed"
                        );
                    }
                } else {
                    tracing::error!(
                        session_id = %self.session_info.id.0,
                        prompt_id = %prompt_id,
                        "persist_ack skipped: chat-state actor unavailable"
                    );
                }
            } else {
                self.chat_state_handle.push_user_message(user_chat);
                self.mark_front_message_committed().await;
            }
        }
        self.dispatch_hook(
            nofy_hooks::event::HookEventName::UserPromptSubmit,
            nofy_hooks::event::HookPayload::UserPromptSubmit {
                prompt: Some(prompt_text_for_hook),
            },
            Some(prompt_id),
            None,
        )
        .await;
        let turn_scope_guard =
            TurnSubagentScopeGuard::new(self.current_prompt_id.clone(), prompt_id.to_string());
        self.open_subagent_spawn_admission();
        let turn_model_id = self.current_model_id().await;
        let doom_event_model = turn_model_id.clone();
        let turn_timer = std::time::Instant::now();
        let mut result = {
            let mut stop_continuations_this_turn: u32 = 0;
            loop {
                if self.goal_harness_enabled() {
                    let goal_loop_active = self.goal_tracker.lock().status()
                        == Some(crate::session::goal_tracker::GoalStatus::Active);
                    self.set_goal_loop_active_resource(goal_loop_active).await;
                }
                let round = self
                    .process_conversation_turn_with_recovery(prompt_id, json_schema.clone())
                    .await;
                if !matches!(round, Ok(TurnOutcome::Completed { .. })) {
                    break round;
                }
                if matches!(
                    round,
                    Ok(TurnOutcome::Completed {
                        refusal: Some(_),
                        ..
                    })
                ) {
                    self.auto_pause_goal_if_active_with_message(
                        crate::session::goal_tracker::GoalPauseReason::Infra,
                        "The model provider refused this goal round. Use /goal resume to retry."
                            .to_string(),
                    )
                    .await;
                    break round;
                }
                let goal_active = laziness_injection_active(
                    self.goal_harness_enabled(),
                    self.goal_tracker.lock().status(),
                );
                if goal_active {
                    if self.has_runnable_queued_user_row().await {
                        nofy_telemetry::unified_log::info(
                            "shell.goal.yielded_to_queued_input",
                            Some(self.session_info.id.0.as_ref()),
                            Some(serde_json::json!({ "prompt_id": prompt_id })),
                        );
                        tracing::info!(
                            "goal turn: yielding to queued user prompts; continuation re-arms \
                             at turn end"
                        );
                        break round;
                    }
                    if crate::session::PromptOrigin::from_prompt_id(prompt_id).is_synthetic()
                        || !self.has_pending_goal_continuation().await
                    {
                        let decision = if self.goal_runs_on_workflow_engine() {
                            self.run_goal_round_end().await
                        } else {
                            self.run_goal_round_end_legacy().await
                        };
                        if let GoalRoundDecision::Continue(directive) = decision {
                            self.inject_goal_continuation_message(directive).await;
                            continue;
                        }
                    } else {
                        tracing::info!(
                            "goal turn: user prompt runs standalone; a queued continuation \
                             resumes the goal"
                        );
                    }
                }
                match self
                    .run_stop_gate(prompt_id, stop_continuations_this_turn)
                    .await
                {
                    StopGateDecision::AllowStop => break round,
                    StopGateDecision::KeepWorking { feedback } => {
                        stop_continuations_this_turn += 1;
                        self.chat_state_handle
                            .push_user_message(ConversationItem::stop_hook_feedback(feedback));
                    }
                }
            }
        };
        if matches!(
            result,
            Ok(TurnOutcome::Cancelled { .. }) | Ok(TurnOutcome::MaxTurnsReached { .. })
        ) {
            self.cancel_running_turn_subagents(prompt_id);
        }
        let mut flush_error = self.flush_to_disk().await.err();
        self.file_state_tracker
            .end_prompt(&self.tool_context.fs, current_prompt_index)
            .await;
        if let Some(mut rewind_point) = self
            .file_state_tracker
            .get_rewind_point(current_prompt_index)
            .await
        {
            rewind_point.normalize_to_relative(self.tool_context.cwd.as_ref());
            let _ = self
                .notifications
                .persistence_tx
                .send(PersistenceMsg::RewindPoint(rewind_point));
            if flush_error.is_none() {
                flush_error = self.flush_to_disk().await.err();
            }
        }
        if matches!(
            &result,
            Ok(TurnOutcome::Completed { .. }) | Ok(TurnOutcome::StationarityEnded { .. })
        ) && let Err(error) = self.disk_full_acp_error(flush_error.as_ref())
        {
            result = Err(error);
        }
        let turn_duration_ms = turn_timer.elapsed().as_millis() as u64;
        let handle_prompt_elapsed_ms = handle_prompt_start.elapsed().as_millis() as u64;
        nofy_telemetry::unified_log::info(
            "shell.handle_prompt.done",
            Some(self.session_info.id.0.as_ref()),
            Some(serde_json::json!({
                "prompt_id": prompt_id,
                "total_elapsed_ms": handle_prompt_elapsed_ms,
                "turn_elapsed_ms": turn_duration_ms,
                "pre_turn_ms": handle_prompt_elapsed_ms.saturating_sub(turn_duration_ms),
                "ok": result.is_ok(),
            })),
        );
        let turn_tool_count = self.events.tool_count_this_turn();
        match &result {
            Ok(TurnOutcome::Completed { refusal, .. }) => {
                self.emit_turn_ended(
                    crate::session::events::TurnOutcomeLabel::Completed,
                    None,
                    None,
                );
                if let Some(explanation) = refusal {
                    self.report_turn_end(
                        prompt_id,
                        TurnEnd::Failed {
                            error: nofy_hooks::event::StopFailureKind::InvalidRequest,
                            error_details: None,
                            last_assistant_message: (!explanation.is_empty())
                                .then(|| explanation.clone()),
                        },
                    );
                }
                self.send_after_turn_event(nofy_tool_protocol::turn_hook::AfterTurnPayload {
                    turn_number: current_prompt_index as u64,
                    outcome: nofy_tool_protocol::turn_hook::TurnHookOutcome::Completed,
                    duration_ms: turn_duration_ms,
                    tool_call_count: turn_tool_count,
                    model_id: turn_model_id.clone(),
                    written_repo_paths: Vec::new(),
                    cancellation_category: None,
                    cancellation_context: None,
                })
                .await;
                nofy_telemetry::session_ctx::log_event(nofy_telemetry::events::TurnCompleted {
                    outcome: nofy_telemetry::events::Outcome::Completed,
                    duration_ms: turn_duration_ms,
                    tool_call_count: turn_tool_count,
                    model_id: turn_model_id,
                    cancellation_category: None,
                    error_category: None,
                });
            }
            Ok(TurnOutcome::StationarityEnded { .. }) => {
                self.emit_turn_ended(
                    crate::session::events::TurnOutcomeLabel::Completed,
                    None,
                    None,
                );
                self.send_after_turn_event(nofy_tool_protocol::turn_hook::AfterTurnPayload {
                    turn_number: current_prompt_index as u64,
                    outcome: nofy_tool_protocol::turn_hook::TurnHookOutcome::Completed,
                    duration_ms: turn_duration_ms,
                    tool_call_count: turn_tool_count,
                    model_id: turn_model_id.clone(),
                    written_repo_paths: Vec::new(),
                    cancellation_category: Some("action_stationarity".to_string()),
                    cancellation_context: None,
                })
                .await;
                nofy_telemetry::session_ctx::log_event(nofy_telemetry::events::TurnCompleted {
                    outcome: nofy_telemetry::events::Outcome::Completed,
                    duration_ms: turn_duration_ms,
                    tool_call_count: turn_tool_count,
                    model_id: turn_model_id,
                    cancellation_category: Some("action_stationarity".to_string()),
                    error_category: None,
                });
            }
            Ok(TurnOutcome::Cancelled { category, context }) => {
                self.emit_turn_ended(
                    crate::session::events::TurnOutcomeLabel::Cancelled,
                    *category,
                    context.clone(),
                );
                if let Some(cause) = category {
                    self.events.set_prior_interrupt_category(*cause);
                }
                self.send_after_turn_event(nofy_tool_protocol::turn_hook::AfterTurnPayload {
                    turn_number: current_prompt_index as u64,
                    outcome: nofy_tool_protocol::turn_hook::TurnHookOutcome::Cancelled,
                    duration_ms: turn_duration_ms,
                    tool_call_count: turn_tool_count,
                    model_id: turn_model_id.clone(),
                    written_repo_paths: Vec::new(),
                    cancellation_category: cancellation_category_to_wire_string(*category),
                    cancellation_context: context.clone(),
                })
                .await;
                nofy_telemetry::session_ctx::log_event(nofy_telemetry::events::TurnCompleted {
                    outcome: nofy_telemetry::events::Outcome::Cancelled,
                    duration_ms: turn_duration_ms,
                    tool_call_count: turn_tool_count,
                    model_id: turn_model_id,
                    cancellation_category: category.map(|c| format!("{c:?}")),
                    error_category: None,
                });
            }
            Ok(TurnOutcome::MaxTurnsReached { limit }) => {
                tracing::info!(limit, "turn ended: max_turns reached");
                // The governor was already consulted at the boundary inside
                // the turn loop (RTAgent B1); its decision is journaled there.
                self.emit_turn_ended(
                    crate::session::events::TurnOutcomeLabel::Cancelled,
                    None,
                    Some(serde_json::json!({
                        "reason": "max_turns_reached",
                        "limit": limit,
                    })),
                );
                self.send_after_turn_event(nofy_tool_protocol::turn_hook::AfterTurnPayload {
                    turn_number: current_prompt_index as u64,
                    outcome: nofy_tool_protocol::turn_hook::TurnHookOutcome::Cancelled,
                    duration_ms: turn_duration_ms,
                    tool_call_count: turn_tool_count,
                    model_id: turn_model_id.clone(),
                    written_repo_paths: Vec::new(),
                    cancellation_category: None,
                    cancellation_context: Some(serde_json::json!({
                        "reason": "max_turns_reached",
                        "limit": limit,
                    })),
                })
                .await;
                nofy_telemetry::session_ctx::log_event(nofy_telemetry::events::TurnCompleted {
                    outcome: nofy_telemetry::events::Outcome::Cancelled,
                    duration_ms: turn_duration_ms,
                    tool_call_count: turn_tool_count,
                    model_id: turn_model_id,
                    cancellation_category: Some("max_turns_reached".to_string()),
                    error_category: None,
                });
            }
            Err(err) => {
                self.emit_turn_ended(crate::session::events::TurnOutcomeLabel::Error, None, None);
                self.send_after_turn_event(nofy_tool_protocol::turn_hook::AfterTurnPayload {
                    turn_number: current_prompt_index as u64,
                    outcome: nofy_tool_protocol::turn_hook::TurnHookOutcome::Error,
                    duration_ms: turn_duration_ms,
                    tool_call_count: turn_tool_count,
                    model_id: turn_model_id.clone(),
                    written_repo_paths: Vec::new(),
                    cancellation_category: None,
                    cancellation_context: None,
                })
                .await;
                let error_category = Self::classify_turn_error(err);
                nofy_telemetry::session_ctx::log_session_event(nofy_telemetry::events::ApiError {
                    error_category: error_category.clone(),
                    model_id: turn_model_id.clone(),
                    status_code: None,
                    duration_ms: Some(turn_duration_ms),
                });
                nofy_telemetry::session_ctx::log_event(nofy_telemetry::events::TurnCompleted {
                    outcome: nofy_telemetry::events::Outcome::Error,
                    duration_ms: turn_duration_ms,
                    tool_call_count: turn_tool_count,
                    model_id: turn_model_id,
                    cancellation_category: None,
                    error_category: Some(error_category),
                });
                self.report_turn_end(
                    prompt_id,
                    TurnEnd::Failed {
                        error: Self::stop_failure_error_type(err),
                        error_details: Self::turn_error_detail(err),
                        last_assistant_message: Some(Self::format_turn_error_message(err)),
                    },
                );
            }
        }
        nofy_telemetry::session_ctx::log_session_event(
            crate::agent::session_metrics::TurnCompletedLifecycle {
                session_id: self.session_info.id.0.to_string(),
                turn_number: current_prompt_index as u64,
            },
        );
        let doom_tally = std::mem::take(&mut *self.doom_loop_turn_tally.lock());
        if doom_tally.fired() {
            nofy_telemetry::session_ctx::log_session_event(
                crate::agent::session_metrics::DoomLoopRecovery {
                    session_id: self.session_info.id.0.to_string(),
                    turn_number: current_prompt_index as u64,
                    attempts: doom_tally.attempts,
                    accepted_after_budget: doom_tally.accepted_after_budget,
                    top_trigger: doom_tally.top_trigger,
                    model: doom_event_model,
                },
            );
        }
        match &result {
            Ok(TurnOutcome::Completed { .. }) | Ok(TurnOutcome::StationarityEnded { .. }) => {
                for contributor in self.extension_registry.turn_lifecycle_contributors() {
                    contributor
                        .on_turn_done(&nofy_agent_lifecycle::TurnDoneInput)
                        .await;
                }
            }
            Ok(TurnOutcome::Cancelled { .. }) | Ok(TurnOutcome::MaxTurnsReached { .. }) => {
                self.notify_turn_abort(
                    self.turn_report.epoch(),
                    nofy_agent_lifecycle::TurnAbortReason::Interrupted,
                )
                .await;
            }
            Err(err) => {
                let message = err.to_string();
                let input = nofy_agent_lifecycle::TurnErrorInput { message: &message };
                for contributor in self.extension_registry.turn_lifecycle_contributors() {
                    contributor.on_turn_error(&input).await;
                }
            }
        }
        let usage = self.freeze_prompt_usage(prompt_id).await;
        drop(turn_scope_guard);
        match result {
            Ok(outcome) => {
                self.chat_state_handle.flush();
                let total_tokens = self.chat_state_handle.get_total_tokens().await;
                let (stop_reason, mut snapshot, completion_kind, structured_output) = match outcome
                {
                    TurnOutcome::Completed {
                        snapshot,
                        structured_output,
                        refusal,
                        ..
                    } => (
                        if refusal.is_some() {
                            acp::StopReason::Refusal
                        } else {
                            acp::StopReason::EndTurn
                        },
                        *snapshot,
                        PromptCompletionKind::Completed,
                        structured_output,
                    ),
                    TurnOutcome::StationarityEnded { snapshot, .. } => (
                        acp::StopReason::EndTurn,
                        *snapshot,
                        PromptCompletionKind::StationarityEnded,
                        None,
                    ),
                    TurnOutcome::Cancelled { category, context } => {
                        let cancellation_ctx = context.and_then(|v| serde_json::from_value(v).ok());
                        (
                            acp::StopReason::Cancelled,
                            None,
                            PromptCompletionKind::Cancelled {
                                category,
                                context: cancellation_ctx,
                            },
                            None,
                        )
                    }
                    TurnOutcome::MaxTurnsReached { limit } => (
                        acp::StopReason::Cancelled,
                        None,
                        PromptCompletionKind::MaxTurnsReached { limit },
                        None,
                    ),
                };
                if let Some(snapshot) = snapshot.as_mut() {
                    self.apply_prompt_modes_to_snapshot(snapshot);
                }
                Ok(crate::session::commands::PromptTurnOk {
                    stop_reason,
                    total_tokens,
                    turn_snapshot: snapshot,
                    completion_kind,
                    structured_output,
                    usage,
                })
            }
            Err(e) => Err(crate::sampling::error::attach_prompt_usage(e, usage)),
        }
    }
    /// Wait for turn-blocking subagents (up to 120s on the turn task),
    /// snapshot, clear sticky. Background children never gate the drain: the
    /// prompt report is marked incomplete immediately and their spend reaches
    /// the session ledger when they finish.
    /// Cancel intentionally skips this multi-second drain (actor-loop safety).
    pub(super) async fn freeze_prompt_usage(
        &self,
        prompt_id: &str,
    ) -> Option<crate::extensions::notification::PromptUsage> {
        const DRAIN: std::time::Duration = std::time::Duration::from_secs(120);
        self.freeze_prompt_usage_bounded(prompt_id, DRAIN).await
    }
    /// [`freeze_prompt_usage`] with an explicit drain bound, for tests.
    pub(super) async fn freeze_prompt_usage_bounded(
        &self,
        prompt_id: &str,
        max_wait: std::time::Duration,
    ) -> Option<crate::extensions::notification::PromptUsage> {
        let drain = self
            .drain_subagent_usage_for_prompt_bounded(prompt_id, max_wait)
            .await;
        self.finalize_usage_from_outcome(prompt_id, drain).await
    }
    /// Waits for turn-blocking folds only.
    /// `fail_closed` on timeout or query failure; sticky and `background_live`
    /// are report-level only (no ledger mark). Must run on the turn task (not
    /// the session actor loop) so folds can land.
    pub(super) async fn drain_subagent_usage_for_prompt_bounded(
        &self,
        prompt_id: &str,
        max_wait: std::time::Duration,
    ) -> UsageDrainOutcome {
        const POLL: std::time::Duration = std::time::Duration::from_millis(50);
        let deadline = std::time::Instant::now() + max_wait;
        loop {
            let reply = self.outstanding_reply_for_prompt(prompt_id).await;
            match reply.as_ref() {
                None => {
                    tracing::warn!(
                        prompt_id,
                        "outstanding subagent query failed; treating usage as incomplete"
                    );
                    return UsageDrainOutcome {
                        fail_closed: true,
                        background_live: false,
                        sticky_report: false,
                    };
                }
                Some(r) if r.live_ids.is_empty() => {
                    return UsageDrainOutcome {
                        fail_closed: false,
                        background_live: r.background_live,
                        sticky_report: r.subagent_usage_not_applied,
                    };
                }
                Some(r) => {
                    if std::time::Instant::now() >= deadline {
                        tracing::warn!(
                            prompt_id,
                            count = r.live_ids.len(),
                            max_wait_ms = max_wait.as_millis() as u64,
                            "subagent usage drain timed out; usage may under-count"
                        );
                        return UsageDrainOutcome {
                            fail_closed: true,
                            background_live: r.background_live,
                            sticky_report: r.subagent_usage_not_applied,
                        };
                    }
                }
            }
            tokio::time::sleep(POLL).await;
        }
    }
    pub(super) async fn snapshot_prompt_usage(
        &self,
    ) -> Option<crate::extensions::notification::PromptUsage> {
        self.snapshot_prompt_usage_marked(false).await
    }
    pub(super) async fn snapshot_prompt_usage_marked(
        &self,
        incomplete: bool,
    ) -> Option<crate::extensions::notification::PromptUsage> {
        let actor_background_spend = self
            .unattributed_background_usage
            .swap(false, std::sync::atomic::Ordering::Relaxed);
        let shared_background_spend = self
            .tool_context
            .unattributed_background_usage
            .swap(false, std::sync::atomic::Ordering::Relaxed);
        let incomplete = incomplete || actor_background_spend || shared_background_spend;
        match self.chat_state_handle.try_get_prompt_usage().await {
            Ok(ledger) => {
                let incomplete = incomplete || ledger.as_ref().is_some_and(|l| l.incomplete);
                crate::extensions::notification::PromptUsage::project_from_ledger(
                    ledger.as_ref(),
                    incomplete,
                )
            }
            Err(()) => {
                crate::extensions::notification::PromptUsage::project_from_ledger(None, true)
            }
        }
    }
    /// When freeze did not attach: incomplete if billed or may under-count; else omit.
    pub(super) async fn error_path_usage_fallback(
        &self,
        prompt_id: &str,
    ) -> Option<crate::extensions::notification::PromptUsage> {
        let may_undercount = Self::usage_incomplete_from_reply(
            self.outstanding_reply_for_prompt(prompt_id).await.as_ref(),
        );
        match self.chat_state_handle.try_get_prompt_usage().await {
            Ok(ledger) => crate::extensions::notification::PromptUsage::for_error_path(
                ledger.as_ref(),
                may_undercount,
            ),
            Err(()) => crate::extensions::notification::PromptUsage::for_error_path(None, true),
        }
    }
    /// Sticky incomplete for `prompt_id`, or the live pin when `None`.
    /// Returns true only if the coordinator acked the mark.
    pub(super) async fn mark_subagent_usage_not_applied(&self, prompt_id: Option<&str>) -> bool {
        let resolved = prompt_id
            .map(str::to_owned)
            .or_else(|| self.current_prompt_id.lock().ok().and_then(|g| g.clone()));
        let Some(pid) = resolved else {
            self.unattributed_background_usage
                .store(true, std::sync::atomic::Ordering::Relaxed);
            self.tool_context
                .unattributed_background_usage
                .store(true, std::sync::atomic::Ordering::Relaxed);
            return false;
        };
        let Some(tx) = &self.tool_context.subagent_event_tx else {
            return false;
        };
        use nofy_tools::implementations::nofy_build::task::types::{
            SubagentEvent, SubagentMarkUsageNotAppliedRequest,
        };
        let (respond_to, ack) = tokio::sync::oneshot::channel();
        if tx
            .send(SubagentEvent::MarkUsageNotApplied(
                SubagentMarkUsageNotAppliedRequest {
                    parent_session_id: self.session_id_string(),
                    prompt_id: pid,
                    respond_to,
                },
            ))
            .is_err()
        {
            return false;
        }
        ack.await.is_ok()
    }
    /// Drain this session's buffered mid-turn monitor events
    /// (`drain_owned` — leader mode shares the buffer) into ONE hidden
    /// synthetic user message, tagged `SyntheticReason::SystemReminder` so
    /// compaction/fork/pruning skip it. Deliberately a bare
    /// `push_user_message`, NOT `inject_synthetic_user_message`: the latter
    /// persists a `UserMessageChunk` to `updates.jsonl`, which resume
    /// replays — the raw XML would render as a user prompt. Clients see
    /// monitor events only via the structured `nofy/monitor_event` channel.
    pub(crate) async fn inject_pending_monitor_events(&self) {
        let Some(buffer) = &self.tool_context.monitor_event_buffer else {
            return;
        };
        let mine = nofy_tools::implementations::nofy_build::monitor::types::drain_owned(
            buffer,
            Some(self.session_info.id.0.as_ref()),
        );
        if mine.is_empty() {
            return;
        }
        let Some(body) = nofy_tools::reminders::task_completion::format_monitor_events(
            &mine,
            Some(&self.tool_context.task_output_tool_name),
        ) else {
            return;
        };
        let wrapped = nofy_tools::reminders::wrap_reminder(&body);
        self.chat_state_handle
            .push_user_message(ConversationItem::system_reminder(wrapped));
        tracing::info!(
            session_id = %self.session_info.id.0,
            count = mine.len(),
            "injected mid-turn monitor events as hidden synthetic user message"
        );
    }
    /// Per-turn hook called from the event-loop completion handler
    /// after every turn finishes. Two terminal branches when the
    /// goal is `Active` (`goal_active_now == true`):
    ///
    /// 1. **Success.** Reset `goal_continuation_streak` to 0, then call
    ///    `maybe_queue_goal_continuation` unless `suppress_goal_continuation`
    ///    (stationarity silent EndTurn). That helper verifies any pending
    ///    completion via its turn-end drain, queues the continuation reminder
    ///    if the goal is still `Active`, and runs the stop-detector to select
    ///    the nudge flavor (generic vs. bail-specific) and emit
    ///    `Event::GoalPrematureStopDetected`.
    /// 2. **Non-success.** Increment `goal_continuation_streak`. At
    ///    [`GOAL_CONTINUATION_BACKOFF_THRESHOLD`] consecutive hits,
    ///    reset the streak and auto-pause with
    ///    `GoalPauseReason::BackOff`. No continuation is queued on this path: an
    ///    infra-error / cancelled turn rarely carries a deliberate
    ///    turn-final message, and stop-detection lives on the success
    ///    path inside `maybe_queue_goal_continuation`.
    ///
    /// When the goal is not `Active` (`goal_active_now == false` —
    /// the doom-loop / infra-error branches in the event loop ran
    /// before this method and already transitioned the goal out of
    /// Active), both branches are skipped: neither streak moves and the
    /// existing pause cause is preserved.
    pub(crate) async fn handle_turn_end(
        &self,
        turn_succeeded: bool,
        suppress_goal_continuation: bool,
    ) {
        let goal_active_now = laziness_injection_active(
            self.goal_harness_enabled(),
            self.goal_tracker.lock().status(),
        );
        if turn_succeeded && goal_active_now {
            self.goal_continuation_streak
                .store(0, std::sync::atomic::Ordering::Relaxed);
            if !suppress_goal_continuation {
                self.maybe_queue_goal_continuation().await;
            }
            return;
        }
        if !turn_succeeded && goal_active_now {
            let current_tokens = self.chat_state_handle.get_total_tokens().await as i64;
            if self.enforce_goal_token_budget(current_tokens).await {
                return;
            }
            let streak = self
                .goal_continuation_streak
                .fetch_add(1, std::sync::atomic::Ordering::Relaxed)
                + 1;
            if streak >= GOAL_CONTINUATION_BACKOFF_THRESHOLD {
                self.goal_continuation_streak
                    .store(0, std::sync::atomic::Ordering::Relaxed);
                self.auto_pause_goal_if_active(
                    crate::session::goal_tracker::GoalPauseReason::BackOff,
                )
                .await;
                self.send_slash_command_output(&format!(
                    "Goal auto-paused after {GOAL_CONTINUATION_BACKOFF_THRESHOLD} consecutive \
                     non-completing turns. The model is not making progress. \
                     Use /goal resume to retry or /goal clear to abandon."
                ))
                .await;
            }
        }
    }
    /// Wraps `process_conversation_turn` with auto-recovery for agents that opt in.
    ///
    /// Agents with a `completion_requirement` in their definition require the model
    /// to call a specific tool before finishing. If a prompt turn ends without that
    /// tool having been called, this method injects the recovery prompt and re-runs
    /// the turn with exponential backoff.
    ///
    /// Agents without `completion_requirement` bypass this entirely.
    #[tracing::instrument(
        name = "session.process_conversation_turn_with_recovery",
        skip_all,
        err,
        fields(req_id = %req_id, session_id = %self.session_info.id.0)
    )]
    pub(super) async fn process_conversation_turn_with_recovery(
        self: &Arc<Self>,
        req_id: &str,
        json_schema: Option<serde_json::Value>,
    ) -> Result<TurnOutcome, acp::Error> {
        let _ = self.compaction.auto_compact_suppressed.compare_exchange(
            crate::session::compaction_config::SUPPRESS_TURN,
            crate::session::compaction_config::SUPPRESS_NONE,
            std::sync::atomic::Ordering::Relaxed,
            std::sync::atomic::Ordering::Relaxed,
        );
        let agent_ref = self.agent.borrow();
        let completion_req = match agent_ref.completion_requirement() {
            Some(req) => req,
            None => {
                return self.process_conversation_turn(req_id, json_schema).await;
            }
        };
        let recovery = match &completion_req.recovery {
            Some(r) => r.clone(),
            None => {
                return self.process_conversation_turn(req_id, json_schema).await;
            }
        };
        let required_tool = completion_req.tool.clone();
        let recovery_prompt = completion_req.reminder.clone();
        let mut result = self
            .process_conversation_turn(req_id, json_schema.clone())
            .await;
        if matches!(
            result,
            Ok(TurnOutcome::MaxTurnsReached { .. }) | Ok(TurnOutcome::StationarityEnded { .. })
        ) {
            return result;
        }
        if let Ok(TurnOutcome::Completed {
            ref tools_called, ..
        }) = result
            && tools_called.iter().any(|name| name == &required_tool)
        {
            tracing::info!(
                "Completion requirement satisfied (tool '{}' called) for session {}",
                required_tool,
                self.session_info.id.0,
            );
            return result;
        }
        let mut attempt = 0u32;
        loop {
            attempt += 1;
            let error_desc = match &result {
                Ok(_) => "Agent finished without completing required task".into(),
                Err(e) => format!("{e:?}"),
            };
            if attempt > recovery.max_retries {
                tracing::error!(
                    "Auto-recovery exhausted after {attempt} attempts for session {}: {error_desc}",
                    self.session_info.id.0,
                );
                self.send_xai_notification(NofySessionUpdate::AutoRecoveryExhausted {
                    attempts: attempt,
                    error: error_desc,
                })
                .await;
                return result;
            }
            let delay_ms = std::cmp::min(
                recovery.base_delay_ms * 2u64.pow(attempt.saturating_sub(1)),
                recovery.max_delay_ms,
            );
            let delay = std::time::Duration::from_millis(delay_ms);
            tracing::warn!(
                "Auto-recovery attempt {}/{} for session {}: {error_desc}. Retrying in {}ms",
                attempt,
                recovery.max_retries,
                self.session_info.id.0,
                delay.as_millis(),
            );
            self.send_xai_notification(NofySessionUpdate::AutoRecoveryStarted {
                attempt,
                max_retries: recovery.max_retries,
                error: error_desc,
                delay_ms: delay.as_millis() as u64,
            })
            .await;
            sleep(delay).await;
            let recovery_message = ConversationItem::auto_recovery(recovery_prompt.clone());
            self.chat_state_handle.push_user_message(recovery_message);
            result = self.process_conversation_turn(req_id, None).await;
            if matches!(
                result,
                Ok(TurnOutcome::MaxTurnsReached { .. }) | Ok(TurnOutcome::StationarityEnded { .. })
            ) {
                return result;
            }
            if let Ok(TurnOutcome::Completed {
                ref tools_called, ..
            }) = result
                && tools_called.iter().any(|name| name == &required_tool)
            {
                tracing::info!(
                    "Completion requirement satisfied after {} recovery attempt(s) \
                     (tool '{}' called) for session {}",
                    attempt,
                    required_tool,
                    self.session_info.id.0,
                );
                return result;
            }
        }
    }
    /// Compute the first-turn memory reminder, if one should be injected.
    ///
    /// A block persisted by an earlier session segment (a prior `--resume`
    /// process, or a turn before a compaction) is reused verbatim — see
    /// [`conversation_has_memory_context`] for why re-searching is harmful.
    ///
    /// [`conversation_has_memory_context`]: crate::session::helpers::memory_context::conversation_has_memory_context
    pub(crate) async fn first_turn_memory_reminder(&self) -> Option<String> {
        if self
            .memory
            .context_injected
            .load(std::sync::atomic::Ordering::Relaxed)
        {
            return None;
        }
        self.memory.replace_active_references(Vec::new());
        self.memory
            .context_injected
            .store(true, std::sync::atomic::Ordering::Relaxed);
        if !self.memory.initial_injection_config.enabled {
            tracing::info!(
                target: nofy_telemetry::memory_log::TARGET,
                "MEMORY_INJECT: first-turn injection disabled by config"
            );
            return None;
        }
        let Some(service) = self.unified_memory_service().await else {
            return None;
        };
        let conversation = self.chat_state_handle.get_conversation().await;
        if crate::session::helpers::memory_context::conversation_has_memory_context(&conversation) {
            tracing::info!(
                target: nofy_telemetry::memory_log::TARGET,
                "MEMORY_INJECT: existing memory-context block present in system message -- skipping re-injection to preserve prompt cache"
            );
            return None;
        }
        let raw_query =
            crate::session::helpers::session_compact::extract_last_real_user_query(&conversation)
                .unwrap_or_default();
        let was_greeting = raw_query.is_empty()
            || crate::session::helpers::memory_context::is_greeting(&raw_query);
        if was_greeting {
            tracing::info!(
                target: nofy_telemetry::memory_log::TARGET,
                "MEMORY_INJECT: greeting has no retrieval intent -- skipping injection"
            );
            return None;
        }
        let query = Some(raw_query);
        let inject_start = std::time::Instant::now();
        let snapshot = service
            .snapshot(nofy_tools::types::memory_service::SnapshotRequest {
                query,
                max_items: 6,
            })
            .await
            .ok()?;
        let result_count = snapshot
            .content
            .lines()
            .filter(|line| line.starts_with("- ["))
            .count();
        let total_snippet_chars = snapshot.content.chars().count();
        nofy_telemetry::session_ctx::log_event(nofy_telemetry::memory_telemetry::MemoryInjection {
            session_id: self.session_info.id.to_string(),
            was_greeting_fallback: was_greeting,
            result_count,
            total_snippet_chars,
            top_score: 0.0,
            configured_min_score: 0.0,
            injection_duration_ms: inject_start.elapsed().as_millis() as u64,
        });
        let formatted =
            crate::session::helpers::memory_context::format_unified_memory_snapshot(&snapshot);
        if formatted.is_some() && self.tool_context.task_output_token_budget.is_none() {
            self.memory
                .replace_active_references(snapshot.references.clone());
        }
        formatted
    }

    /// Inspect `tool_calls` for a `StructuredOutput` call and decide the turn's
    /// next step, pushing the call's `tool_result` (correction / retry error /
    /// terminal) as a side effect. Validates the args against `validator` and
    /// bumps `retries` on a non-conforming retry.
    async fn handle_structured_output_tool_call(
        &self,
        tool_calls: &mut Vec<nofy_sampling_types::conversation::ToolCall>,
        validator: &Result<jsonschema::Validator, String>,
        retries: &mut u32,
    ) -> StructuredOutputStep {
        let Some(pos) = tool_calls
            .iter()
            .position(|tc| tc.name == STRUCTURED_OUTPUT_TOOL)
        else {
            return StructuredOutputStep::Proceed;
        };
        if tool_calls.len() > 1 {
            for tc in tool_calls
                .iter()
                .filter(|tc| tc.name == STRUCTURED_OUTPUT_TOOL)
            {
                self.chat_state_handle
                    .push_tool_result(ConversationItem::tool_result(
                        tc.id.as_ref().to_owned(),
                        "Call StructuredOutput alone, exactly once, after all other tools finish.",
                    ));
            }
            tool_calls.retain(|tc| tc.name != STRUCTURED_OUTPUT_TOOL);
            return StructuredOutputStep::Proceed;
        }
        let call_id = tool_calls[pos].id.as_ref().to_owned();
        let validated = validate_structured_output(validator, &tool_calls[pos].arguments);
        if let Err(err) = &validated
            && *retries < STRUCTURED_OUTPUT_MAX_RETRIES
        {
            *retries += 1;
            self.chat_state_handle
                .push_tool_result(ConversationItem::tool_result(
                    call_id,
                    format!("{err}\nFix the arguments and call StructuredOutput again."),
                ));
            return StructuredOutputStep::Retry;
        }
        self.chat_state_handle
            .push_tool_result(ConversationItem::tool_result(
                call_id,
                match &validated {
                    Ok(_) => "Structured output accepted.".to_string(),
                    Err(err) => err.clone(),
                },
            ));
        StructuredOutputStep::Complete(validated)
    }
    /// Single shell tool call whose parsed command is `true` (via ToolBridge).
    async fn is_run_true_step(
        &self,
        tool_calls: &[nofy_sampling_types::conversation::ToolCall],
    ) -> bool {
        let [tc] = tool_calls else {
            return false;
        };
        let Ok(args) = serde_json::from_str::<serde_json::Value>(tc.arguments.as_ref()) else {
            return false;
        };
        let Ok(input) = self.tool_bridge_handle().try_parse(&tc.name, args).await else {
            return false;
        };
        match input {
            ToolInput::Bash(b) => command_is_true(&b.command),
            _ => false,
        }
    }
    /// Shared turn-completion bookkeeping (plan cleanup, signals snapshot +
    /// persistence). Runs identically for the native and StructuredOutput-tool
    /// completion paths. Returns the turn-end snapshot for
    /// `TurnOutcome::Completed`.
    async fn finalize_turn_bookkeeping(
        &self,
        turn_span_totals: &TurnSpanTotals,
    ) -> Option<TurnDeltaSnapshot> {
        self.emit_turn_end_plan_cleanup().await;
        self.signals_handle().record_turn_complete();
        let mut snapshot = self.signals_handle().take_turn_end_snapshot().await;
        if let Some(snap) = snapshot.as_mut() {
            self.apply_prompt_modes_to_snapshot(snap);
            snap.turn_input_tokens = turn_span_totals.input_tokens.max(0) as u64;
            snap.turn_output_tokens = turn_span_totals.output_tokens.max(0) as u64;
            snap.turn_cached_input_tokens = turn_span_totals.cache_read_tokens.max(0) as u64;
            for pr in &snap.delta.prs_created_this_turn {
                nofy_telemetry::session_ctx::log_event(nofy_telemetry::events::PrCreated {
                    source: pr.source,
                    had_commit_in_session: pr.had_commit_in_session,
                });
            }
        }
        if let Some(snap) = snapshot.as_ref() {
            let _ = self
                .notifications
                .persistence_tx
                .send(PersistenceMsg::Signals(snap.current.clone()));
        }
        snapshot
    }
    #[tracing::instrument(
        name = "session.process_conversation_turn",
        skip_all,
        err,
        fields(
            session_id = %self.session_info.id.0,
            model_id,
            turn_tool_count,
            turn_model_calls,
            input_tokens = tracing::field::Empty,
            output_tokens = tracing::field::Empty,
            cache_read_tokens = tracing::field::Empty,
            stop_reason = tracing::field::Empty,
            response.has_tool_call = tracing::field::Empty,
            request_id = tracing::field::Empty,
            ttft_ms = tracing::field::Empty,
            mcp_server.name = tracing::field::Empty,
            mcp_tool.name = tracing::field::Empty,
            agent.name = tracing::field::Empty,
            skill.name = tracing::field::Empty,
            query_source = tracing::field::Empty,
            effort = tracing::field::Empty,
            attempt = tracing::field::Empty,
            parent_agent_id = tracing::field::Empty,
        )
    )]
    async fn process_conversation_turn(
        self: &Arc<Self>,
        req_id: &str,
        json_schema: Option<serde_json::Value>,
    ) -> Result<TurnOutcome, acp::Error> {
        coding_preset::run(self.clone(), req_id, json_schema).await
    }
}
/// Tool kinds whose identical repeats are almost never productive, so they get tighter
/// thresholds than everything else. A production turn repeated one `ToolKind::Plan` call
/// (`todo_write`) with byte-identical arguments 12 times — 224 in the turn — and replaying
/// it showed the model answers the user as soon as it is interrupted. `ToolKind::Read`
/// behaves the same way: re-reading the same path with the same range returns the same
/// bytes.
///
/// Matched by kind, not by wire name, because names are client-renameable and vary by
/// toolset (`read_file`, `hashline_read`, `Read`; `todo_write`, `todowrite`) while the
/// registered kind does not. Unregistered names (MCP tools) resolve to `None` and fall
/// through to the looser tier, as does any kind added later — an identical repeat there
/// can be legitimate, such as polling a job or re-running a command after an external
/// change.
fn is_problematically_repeating_kind(kind: Option<ToolKind>) -> bool {
    matches!(kind, Some(ToolKind::Read | ToolKind::Plan))
}
/// Whether a whole sampling step belongs in the tight tier: every call in it must be a
/// problematically repeating kind.
///
/// Order-insensitive, like [`step_signature`] — a reordered step is the same step, so it
/// must not flip tiers. Requiring *every* call, rather than any, keeps a mixed step in the
/// looser tier: one call that can legitimately repeat (polling a job) makes repeating the
/// whole step legitimate.
fn step_is_problematically_repeating(kinds: &[Option<ToolKind>]) -> bool {
    !kinds.is_empty()
        && kinds
            .iter()
            .all(|kind| is_problematically_repeating_kind(*kind))
}
pub(super) use nofy_agent_runtime::coding::stationarity::{
    MAX_CONSECUTIVE_IDENTICAL_PROBLEMATIC_TOOL_CALLS, MAX_CONSECUTIVE_IDENTICAL_TOOL_CALLS,
    MAX_CONSECUTIVE_TRUE_NOOPS, NUDGE_AFTER_IDENTICAL_PROBLEMATIC_TOOL_CALLS,
    NUDGE_AFTER_IDENTICAL_TOOL_CALLS,
};
const ACTION_STATIONARITY_NUDGE_TEMPLATE: &str = "You have called the same tool \
     (`${{ tool_name }}`) with the exact same arguments ${{ run_len }} times in a row — \
     you appear to be stuck in a polling loop. Stop repeating this call. If you are \
     waiting on a long-running job or command, use a background task${%- if tools.by_kind.monitor %} \
     or the `${{ tools.by_kind.monitor }}` tool${%- endif %}, or run a single `sleep` and \
     then check once — do not poll in a tight loop. If you cannot make progress, stop and \
     tell the user what you are waiting for. This turn will be halted automatically if the \
     identical call keeps repeating.";
fn command_is_true(cmd: &str) -> bool {
    cmd.trim().eq_ignore_ascii_case("true")
}
/// Recursively sort object keys so the same arguments compare equal however the model
/// happened to serialize them — `{"path":"x","limit":10}` and `{"limit":10,"path":"x"}`
/// are the same call. Array order is left alone: it is semantic (a todo list, a batch of
/// edits), so reordering one is a real change.
///
/// `serde_json` is built with `preserve_order` here, so a `Map` keeps insertion order and
/// re-inserting in sorted order is what makes this canonical.
fn canonicalize_json(value: serde_json::Value) -> serde_json::Value {
    match value {
        serde_json::Value::Object(map) => {
            let mut entries: Vec<_> = map.into_iter().collect();
            entries.sort_by(|(a, _), (b, _)| a.cmp(b));
            serde_json::Value::Object(
                entries
                    .into_iter()
                    .map(|(k, v)| (k, canonicalize_json(v)))
                    .collect(),
            )
        }
        serde_json::Value::Array(items) => {
            serde_json::Value::Array(items.into_iter().map(canonicalize_json).collect())
        }
        other => other,
    }
}
/// Signature of one sampling step: every tool call it emitted, each canonicalized, then
/// sorted so that re-emitting the same set of parallel calls in a different order does not
/// read as progress.
///
/// Arguments that do not parse as JSON fall back to their trimmed raw text, which is the
/// pre-canonicalization behaviour.
fn step_signature(tool_calls: &[nofy_sampling_types::conversation::ToolCall]) -> String {
    let mut parts: Vec<String> = tool_calls
        .iter()
        .map(|tc| {
            let args = serde_json::from_str::<serde_json::Value>(tc.arguments.as_ref())
                .map(|v| canonicalize_json(v).to_string())
                .unwrap_or_else(|_| tc.arguments.trim().to_string());
            format!("{}\u{1f}{}", tc.name, args)
        })
        .collect();
    parts.sort();
    parts.join("\u{1e}")
}
use nofy_agent_runtime::coding::stationarity::IdenticalToolCallRun;
#[cfg(test)]
mod identical_tool_call_run_tests {
    use super::{
        IdenticalToolCallRun, MAX_CONSECUTIVE_IDENTICAL_PROBLEMATIC_TOOL_CALLS,
        MAX_CONSECUTIVE_IDENTICAL_TOOL_CALLS, MAX_CONSECUTIVE_TRUE_NOOPS,
        NUDGE_AFTER_IDENTICAL_PROBLEMATIC_TOOL_CALLS, NUDGE_AFTER_IDENTICAL_TOOL_CALLS, ToolKind,
        command_is_true, step_is_problematically_repeating, step_signature,
    };
    #[test]
    fn identical_non_true_resets_and_caps_at_the_hard_limit() {
        let mut run = IdenticalToolCallRun::default();
        assert_eq!(run.observe("a", "a", false, false), 1);
        assert_eq!(run.observe("a", "a", false, false), 2);
        assert_eq!(run.observe("b", "b", false, false), 1);
        let mut last = 0;
        for _ in 0..MAX_CONSECUTIVE_IDENTICAL_TOOL_CALLS {
            last = run.observe("same", "same", false, false);
        }
        assert_eq!(last, MAX_CONSECUTIVE_IDENTICAL_TOOL_CALLS);
        assert_eq!(
            run.hard_stop_threshold(),
            MAX_CONSECUTIVE_IDENTICAL_TOOL_CALLS
        );
    }
    #[test]
    fn true_noops_chain_across_args_and_stop_at_4() {
        let mut run = IdenticalToolCallRun::default();
        for i in 1..=4 {
            assert_eq!(run.observe(&format!("sig{i}"), "bash", false, true), i);
        }
        assert!(run.is_true_noop_run);
        assert_eq!(run.hard_stop_threshold(), MAX_CONSECUTIVE_TRUE_NOOPS);
        assert_eq!(run.observe("squeue", "bash", false, false), 1);
        assert!(!run.is_true_noop_run);
    }
    /// Reordering argument keys, or reordering the calls within one step, is the same
    /// step — otherwise a loop could evade the counter by shuffling either one.
    #[test]
    fn step_signature_ignores_key_order_and_call_order() {
        let call = |name: &str, args: &str| nofy_sampling_types::conversation::ToolCall {
            id: "id".into(),
            name: name.to_string(),
            arguments: args.into(),
        };
        assert_eq!(
            step_signature(&[call("read_file", r#"{"path":"a","limit":10}"#)]),
            step_signature(&[call("read_file", r#"{"limit":10,"path":"a"}"#)]),
            "key order must not matter"
        );
        assert_eq!(
            step_signature(&[call("read_file", r#"{"a":{"x":1,"y":2}}"#)]),
            step_signature(&[call("read_file", r#"{"a":{"y":2,"x":1}}"#)]),
            "nested key order must not matter"
        );
        let a = call("read_file", r#"{"path":"a"}"#);
        let b = call("read_file", r#"{"path":"b"}"#);
        assert_eq!(
            step_signature(&[a.clone(), b.clone()]),
            step_signature(&[b, a]),
            "order of parallel calls must not matter"
        );
        assert_ne!(
            step_signature(&[call("read_file", r#"{"path":"a"}"#)]),
            step_signature(&[call("read_file", r#"{"path":"b"}"#)])
        );
        assert_ne!(
            step_signature(&[call("todo_write", r#"{"todos":[1,2]}"#)]),
            step_signature(&[call("todo_write", r#"{"todos":[2,1]}"#)])
        );
        assert_ne!(
            step_signature(&[call("x", "not json a")]),
            step_signature(&[call("x", "not json b")])
        );
    }
    #[test]
    fn command_is_true_trim_and_case() {
        assert!(command_is_true("true"));
        assert!(command_is_true(" TRUE "));
        assert!(!command_is_true("true && echo hi"));
        assert!(!command_is_true("lisa status"));
    }
    #[test]
    fn nudge_latch_fires_once_per_run_after_threshold() {
        let mut run = IdenticalToolCallRun::default();
        for i in 1..NUDGE_AFTER_IDENTICAL_TOOL_CALLS {
            assert_eq!(run.observe("poll", "get_task_output", false, false), i);
            assert!(
                !run.take_nudge(),
                "must not nudge before threshold; run_len={i}"
            );
        }
        assert_eq!(
            run.observe("poll", "get_task_output", false, false),
            NUDGE_AFTER_IDENTICAL_TOOL_CALLS
        );
        assert!(run.take_nudge());
        assert!(!run.take_nudge());
        assert_eq!(
            run.observe("poll", "get_task_output", false, false),
            NUDGE_AFTER_IDENTICAL_TOOL_CALLS + 1
        );
        assert!(!run.take_nudge());
        assert_eq!(run.observe("other", "bash", false, false), 1);
        assert!(!run.take_nudge());
        for _ in 1..NUDGE_AFTER_IDENTICAL_TOOL_CALLS {
            run.observe("other", "bash", false, false);
        }
        assert!(
            run.take_nudge(),
            "a different run must re-arm the nudge latch"
        );
    }
    /// `ToolKind::Read` / `ToolKind::Plan` (`read_file` / `todo_write`) nudge and stop
    /// earlier than everything else, including tools with no registered kind.
    #[test]
    fn problematically_repeating_tools_use_the_tighter_thresholds() {
        for tool in ["read_file", "todo_write"] {
            let mut run = IdenticalToolCallRun::default();
            for i in 1..NUDGE_AFTER_IDENTICAL_PROBLEMATIC_TOOL_CALLS {
                assert_eq!(run.observe("same", tool, true, false), i);
                assert!(!run.take_nudge(), "{tool} must not nudge at run_len={i}");
            }
            assert_eq!(
                run.observe("same", tool, true, false),
                NUDGE_AFTER_IDENTICAL_PROBLEMATIC_TOOL_CALLS
            );
            assert!(run.take_nudge(), "{tool} must nudge at its own threshold");
            assert!(run.is_problematically_repeating());
            assert_eq!(
                run.hard_stop_threshold(),
                MAX_CONSECUTIVE_IDENTICAL_PROBLEMATIC_TOOL_CALLS
            );
        }
        let mut run = IdenticalToolCallRun::default();
        for i in 1..NUDGE_AFTER_IDENTICAL_TOOL_CALLS {
            assert_eq!(run.observe("same", "run_terminal_command", false, false), i);
            assert!(
                !run.take_nudge(),
                "loose tier must not nudge at run_len={i}"
            );
        }
        assert_eq!(
            run.observe("same", "run_terminal_command", false, false),
            NUDGE_AFTER_IDENTICAL_TOOL_CALLS
        );
        assert!(run.take_nudge());
        assert!(!run.is_problematically_repeating());
        assert_eq!(
            run.hard_stop_threshold(),
            MAX_CONSECUTIVE_IDENTICAL_TOOL_CALLS
        );
    }
    /// A step is in the tight tier only when every call in it is `Read`/`Plan`, and the
    /// answer must not depend on the order the model emitted them in.
    #[test]
    fn step_tier_needs_every_call_and_ignores_order() {
        let read = Some(ToolKind::Read);
        let plan = Some(ToolKind::Plan);
        let exec = Some(ToolKind::Execute);
        assert!(step_is_problematically_repeating(&[read]));
        assert!(step_is_problematically_repeating(&[plan]));
        assert!(step_is_problematically_repeating(&[read, plan]));
        assert!(!step_is_problematically_repeating(&[exec]));
        assert!(!step_is_problematically_repeating(&[None]));
        assert!(!step_is_problematically_repeating(&[]));
        assert!(!step_is_problematically_repeating(&[read, exec]));
        assert!(!step_is_problematically_repeating(&[exec, read]));
    }
    /// A `true` keepalive run must end the turn silently at MAX_CONSECUTIVE_TRUE_NOOPS
    /// instead of being told to stop polling, even though it passes the nudge threshold.
    #[test]
    fn true_noop_runs_are_never_nudged() {
        let mut run = IdenticalToolCallRun::default();
        for i in 1..=MAX_CONSECUTIVE_TRUE_NOOPS {
            assert_eq!(run.observe(&format!("sig{i}"), "bash", false, true), i);
            assert!(
                !run.take_nudge(),
                "keepalive run must not nudge; run_len={i}"
            );
        }
        assert_eq!(run.hard_stop_threshold(), MAX_CONSECUTIVE_TRUE_NOOPS);
        let mut last = 0;
        for _ in 0..NUDGE_AFTER_IDENTICAL_TOOL_CALLS {
            last = run.observe("poll", "get_task_output", false, false);
        }
        assert_eq!(last, NUDGE_AFTER_IDENTICAL_TOOL_CALLS);
        assert!(run.take_nudge());
    }
}
#[cfg(test)]
mod user_echo_broadcast_tests {
    use super::{UserEchoMode, user_echo_mode};
    /// Notification-drain: persisted (rewind/fork count user-chunk runs as
    /// turn boundaries) but never broadcast live; the pager hides it via the
    /// `hideFromScrollback` chunk meta.
    #[test]
    fn notification_drain_turn_is_persist_only() {
        assert_eq!(
            user_echo_mode("notifications-019e0000-0000-7000-8000-0000000000aa"),
            UserEchoMode::PersistOnly
        );
    }
    /// Real user prompts, cron (`/loop`) fires, and other turns still broadcast
    /// live so multi-client / dashboard viewers stay in sync.
    #[test]
    fn user_and_cron_turns_broadcast_live() {
        assert_eq!(user_echo_mode("my-prompt"), UserEchoMode::Broadcast);
        assert_eq!(
            user_echo_mode("scheduler-fired-abc"),
            UserEchoMode::Broadcast
        );
        assert_eq!(
            user_echo_mode("task-completed-bg-1"),
            UserEchoMode::Broadcast
        );
        assert_eq!(
            user_echo_mode("subagent-completed-xyz"),
            UserEchoMode::Broadcast
        );
    }
    /// Interject-fallback turns are persist-only: every pane already rendered
    /// the text from the `nofy/session/interjection` broadcast, so a live
    /// echo would duplicate the block.
    #[test]
    fn interject_fallback_turn_is_persist_only() {
        assert_eq!(
            user_echo_mode("interject-fallback-019e24b7"),
            UserEchoMode::PersistOnly
        );
    }
}
#[cfg(test)]
mod structured_output_validation_tests {
    use super::validate_structured_output;
    fn validator() -> Result<jsonschema::Validator, String> {
        let schema = serde_json::json!({
            "type": "object",
            "properties": {"name": {"type": "string"}, "age": {"type": "integer"}},
            "required": ["name", "age"],
            "additionalProperties": false,
        });
        jsonschema::validator_for(&schema).map_err(|e| e.to_string())
    }
    #[test]
    fn accepts_conforming_json() {
        let v = validate_structured_output(&validator(), r#"{"name":"alice","age":30}"#).unwrap();
        assert_eq!(v["name"], "alice");
    }
    #[test]
    fn rejects_non_json() {
        let err = validate_structured_output(&validator(), "not json").unwrap_err();
        assert!(err.starts_with("model output was not valid JSON: "));
    }
    #[test]
    fn rejects_schema_violation() {
        let err = validate_structured_output(&validator(), r#"{"name":"alice"}"#).unwrap_err();
        assert!(err.starts_with("output does not match the required schema: "));
    }
    #[test]
    fn surfaces_invalid_schema_error() {
        let bad: Result<jsonschema::Validator, String> = Err("invalid output schema: boom".into());
        let err = validate_structured_output(&bad, r#"{"name":"alice","age":1}"#).unwrap_err();
        assert_eq!(err, "invalid output schema: boom");
    }
}
