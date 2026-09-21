//! Unified memory lifecycle for `SessionActor`: durable flush barriers,
//! consolidation, tool registration, and note rewriting.

use super::*;

/// Build first-turn injection backend params without mutating the shared
/// session params.
///
/// This clones the session-wide backend params so tool-search and
/// compaction-recovery backends keep their original `search_source` and search
/// thresholds. The returned effective min score preserves the historical
/// first-turn default of `0.0` unless the injection config explicitly
/// overrides it.
pub(super) fn build_initial_injection_backend_params(
    params: &crate::session::memory::MemoryBackendParams,
    initial_injection_config: &crate::config::MemoryInitialInjectionConfig,
) -> (crate::session::memory::MemoryBackendParams, f64) {
    let mut injection_params = params.clone();
    injection_params.search_source = "injection";
    let effective_min_score = initial_injection_config
        .min_score
        .map(|min_score| {
            injection_params.search_config.min_score = min_score;
            min_score as f64
        })
        .unwrap_or(0.0);
    (injection_params, effective_min_score)
}

impl SessionActor {
    /// Re-register `memory_search`, `memory_get`, and `memory_write` tools
    /// on the tool bridge.
    ///
    /// Used when re-enabling memory mid-session (`/memory on`). The tools are
    /// registered via the dynamic `register_mcp_tools` path which puts them in
    /// the `LocalRegistry` for dispatch. The memory backend itself is already
    /// in `Resources` (inserted by the caller before calling this method).
    pub(super) async fn register_memory_tools(
        &self,
        bridge: &nofy_tools::bridge::ToolBridge,
    ) -> Result<(), String> {
        use nofy_tools::implementations::memory::{
            MEMORY_GET_TOOL_NAME, MEMORY_SEARCH_TOOL_NAME, MEMORY_WRITE_TOOL_NAME,
        };

        bridge
            .register_mcp_tools(
                MEMORY_SEARCH_TOOL_NAME.to_owned(),
                nofy_tools::implementations::memory::search_tool::MemorySearchImpl,
                None,
            )
            .await
            .map_err(|e| format!("failed to register memory_search: {e}"))?;
        bridge
            .register_mcp_tools(
                MEMORY_GET_TOOL_NAME.to_owned(),
                nofy_tools::implementations::memory::get_tool::MemoryGetImpl,
                None,
            )
            .await
            .map_err(|e| format!("failed to register memory_get: {e}"))?;
        bridge
            .register_mcp_tools(
                MEMORY_WRITE_TOOL_NAME.to_owned(),
                nofy_tools::implementations::memory::write_tool::MemoryWriteImpl,
                None,
            )
            .await
            .map_err(|e| format!("failed to register memory_write: {e}"))?;
        Ok(())
    }

    pub(super) fn emit_memory_session_summary(
        &self,
        telem: &super::memory_state::MemoryTelemetry,
        total_chunks_at_end: usize,
        session_end_result: &str,
    ) {
        nofy_telemetry::session_ctx::log_event(
            nofy_telemetry::memory_telemetry::MemorySessionSummary {
                session_id: self.session_info.id.to_string(),
                session_duration_secs: self.session_start.elapsed().as_secs(),
                flush_count: telem.flush_count,
                flush_success_count: telem.flush_success_count,
                flush_error_count: telem.flush_error_count,
                tool_search_count: telem.tool_search_count,
                injection_count: telem.injection_count,
                recovery_search_count: telem.compaction_recovery_count,
                total_chunks_at_end,
                chunks_added_this_session: telem.chunks_added as usize,
                session_end_result: session_end_result.to_owned(),
                dream_count: telem.dream_count,
                dream_success_count: telem.dream_success_count,
                dream_error_count: telem.dream_error_count,
            },
        );
    }

    /// Session-end memory save, empty-session-gated dream, and memory summary
    /// telemetry. Shared by Shutdown and channel-closed so the dream gate cannot
    /// drift between exit arms.
    ///
    /// `log_suffix` is appended to the `MEMORY_SESSION_END:` log line so each
    /// arm keeps a distinct reason string in logs.
    pub(super) async fn run_session_end_memory_pipeline(&self, log_suffix: &str) {
        let mut session_end_result = "disabled";
        let mut total_chunks_at_end = 0usize;
        // No dream here. Consolidation runs at the *next* launch and on the
        // dream-check timer (see `spawn_dream_check` in `run_loop`): a dream is a
        // model call with a 30-minute budget, and awaiting it inline made session
        // close wait for it. Deferring loses nothing — this session's summary is
        // written below, so the next launch's gate check finds it on disk.
        if !self.startup_hints.is_subagent {
            if let Some(storage) = self.memory.storage() {
                let conversation = self.chat_state_handle.get_conversation().await;
                let result = crate::session::memory::hooks::on_session_end(
                    &storage,
                    &conversation,
                    &self.session_info.id.0,
                    self.memory.save_on_end,
                );
                match &result {
                    crate::session::memory::hooks::SessionEndResult::Written(path_str) => {
                        session_end_result = "written";
                        self.reindex_and_embed(std::path::Path::new(path_str), "session")
                            .await;
                        self.send_xai_notification(NofySessionUpdate::MemorySessionSaved {
                            path: path_str.clone(),
                        })
                        .await;
                    }
                    crate::session::memory::hooks::SessionEndResult::Skipped => {
                        session_end_result = "skipped";
                    }
                    crate::session::memory::hooks::SessionEndResult::Failed(_) => {
                        session_end_result = "failed";
                    }
                }
                total_chunks_at_end = storage.total_chunk_count();
                let telem = self.memory.telemetry_snapshot();
                let msg = format!("MEMORY_SESSION_END: {log_suffix}");
                tracing::info!(
                    target: nofy_telemetry::memory_log::TARGET,
                    result = ?result,
                    tool_searches = telem.tool_search_count,
                    injection_searches = telem.injection_count,
                    recovery_searches = telem.compaction_recovery_count,
                    "{msg}"
                );
            }
        } else {
            tracing::debug!(
                target: nofy_telemetry::memory_log::TARGET,
                "MEMORY_SUBAGENT_SKIP: skipping on_session_end for subagent session"
            );
        }
        let telem = self.memory.telemetry_snapshot();
        self.emit_memory_session_summary(&telem, total_chunks_at_end, session_end_result);
    }

    /// Reindex a single file and embed any new chunks.
    ///
    /// Used after flush writes and session-end writes to keep the index
    /// and embeddings up to date immediately.
    pub(super) async fn reindex_and_embed(&self, path: &std::path::Path, source: &str) {
        self.memory.reindex_and_embed(path, source).await;
    }

    async fn unified_memory_service(
        &self,
    ) -> Option<std::sync::Arc<dyn nofy_tools::types::memory_service::MemoryService>> {
        let bridge = self.agent.borrow().tool_bridge().clone();
        bridge
            .read_resource::<std::sync::Arc<dyn nofy_tools::types::memory_service::MemoryService>>()
            .await
    }

    async fn consolidate_area(
        &self,
        area: nofy_tools::types::memory_service::MemoryArea,
        mode: nofy_tools::types::memory_service::ConsolidationMode,
    ) -> Result<nofy_tools::types::memory_service::OperationReceipt, String> {
        let service = self
            .unified_memory_service()
            .await
            .ok_or_else(|| "unified memory service is unavailable".to_owned())?;
        service
            .consolidate(nofy_tools::types::memory_service::ConsolidateRequest { area, mode })
            .await
            .map_err(|error| error.to_string())
    }

    /// Background consolidation uses the same service and SQLite lease as the
    /// explicit command. Concurrent sessions therefore race on a fenced
    /// operation claim instead of a process/PID lock.
    pub(super) async fn maybe_run_dream(&self) {
        use nofy_tools::types::memory_service::{ConsolidationMode, MemoryArea};

        if self.startup_hints.is_subagent || !self.memory.dream_config.enabled {
            return;
        }
        for area in [MemoryArea::Personal, MemoryArea::Project] {
            match self
                .consolidate_area(area.clone(), ConsolidationMode::Active)
                .await
            {
                Ok(receipt) => {
                    if receipt.accepted && receipt.processed > 0 {
                        self.memory.record_dream_result(true);
                    } else {
                        self.memory.record_dream_neutral();
                    }
                    tracing::info!(
                        target: nofy_telemetry::memory_log::TARGET,
                        operation_id = %receipt.operation_id,
                        area = ?receipt.area,
                        mode = ?receipt.mode,
                        processed = receipt.processed,
                        accepted = receipt.accepted,
                        "MEMORY_DREAM: unified consolidation finished"
                    );
                }
                Err(error) => {
                    self.memory.record_dream_result(false);
                    tracing::warn!(
                        target: nofy_telemetry::memory_log::TARGET,
                        %error,
                        "MEMORY_DREAM: unified consolidation failed"
                    );
                }
            }
        }
    }

    /// `/dream` runs the unified consolidation service and reports the exact
    /// operation identity, scope, mode, and number of observations handled.
    pub(super) async fn run_dream_slash_command(&self) {
        use nofy_tools::types::memory_service::{ConsolidationMode, MemoryArea};

        let mut lines = Vec::new();
        for area in [MemoryArea::Personal, MemoryArea::Project] {
            match self
                .consolidate_area(area.clone(), ConsolidationMode::Active)
                .await
            {
                Ok(receipt) => lines.push(format!(
                    "operation={} scope={} mode={:?} processed={} accepted={}",
                    receipt.operation_id,
                    receipt.area.user_label(),
                    receipt.mode,
                    receipt.processed,
                    receipt.accepted,
                )),
                Err(error) => lines.push(format!(
                    "scope={} consolidation failed: {error}",
                    area.user_label()
                )),
            }
        }
        self.send_host_turn_slash_command_output(&lines.join("\n"))
            .await;
    }

    /// `/flush` is now only a durability barrier: the selected top-level turn
    /// must already have a persisted transcript and a committed capture-queue
    /// receipt. It never asks a second model to summarize and never writes a
    /// parallel session Markdown log.
    pub(super) async fn run_memory_flush(
        &self,
        trigger: &str,
        expected_turn_id: Option<&str>,
    ) -> bool {
        if self.startup_hints.is_subagent || !self.memory.try_acquire_flush_lock() {
            return false;
        }
        self.send_xai_notification(NofySessionUpdate::MemoryFlushStarted)
            .await;
        let barrier = self.memory.last_capture_barrier.borrow().clone();
        let matched = barrier.as_ref().is_some_and(|barrier| {
            expected_turn_id.is_none_or(|expected| barrier.turn_id == expected)
        });
        let result = match barrier {
            Some(barrier) if matched => format!(
                "durable turn={} sequence={} capture={:?}",
                barrier.turn_id, barrier.durable_sequence, barrier.outcome
            ),
            Some(barrier) => format!(
                "barrier mismatch: expected={} latest={}",
                expected_turn_id.unwrap_or_default(),
                barrier.turn_id
            ),
            None => "no completed top-level turn has a capture barrier".to_owned(),
        };
        tracing::info!(
            target: nofy_telemetry::memory_log::TARGET,
            trigger,
            matched,
            %result,
            "MEMORY_FLUSH: durable barrier check"
        );
        self.memory
            .record_flush_result(if matched { "barrier" } else { "error" });
        self.memory.release_flush_lock();
        self.send_xai_notification(NofySessionUpdate::MemoryFlushCompleted { result, path: None })
            .await;
        matched
    }

    pub(super) async fn refresh_frozen_memory_snapshot(&self) {
        use nofy_tools::types::memory_service::SnapshotRequest;

        let Some(service) = self.unified_memory_service().await else {
            return;
        };
        match service
            .snapshot(SnapshotRequest {
                query: None,
                max_items: 32,
            })
            .await
        {
            Ok(snapshot) => tracing::info!(
                target: nofy_telemetry::memory_log::TARGET,
                generation = snapshot.generation,
                content_hash = %snapshot.content_hash,
                "MEMORY_SNAPSHOT: rebuilt after compaction"
            ),
            Err(error) => tracing::warn!(
                target: nofy_telemetry::memory_log::TARGET,
                %error,
                "MEMORY_SNAPSHOT: rebuild failed after compaction"
            ),
        }
    }

    /// Rewrite a raw memory note into well-structured markdown via a one-shot
    /// LLM call using the `nofy-build` model.
    ///
    /// Follows the same streaming pattern as [`handle_ai_suggest`]: prepares
    /// a sampling client, builds a system+user prompt, streams the response,
    /// and returns the collected text.
    pub(super) async fn handle_rewrite_memory_note(
        &self,
        raw_text: &str,
        context_summary: &str,
    ) -> Result<String, String> {
        // Upper-bound check to prevent unbounded LLM input.
        const MAX_INPUT_BYTES: usize = 32 * 1024; // 32 KB
        let combined_len = raw_text.len() + context_summary.len();
        if combined_len > MAX_INPUT_BYTES {
            return Err(format!(
                "memory note input too large ({combined_len} bytes, max {MAX_INPUT_BYTES})"
            ));
        }

        let sampling_client = self
            .prepare_chat_completion(false)
            .await
            .map_err(|e| format!("failed to prepare client: {e}"))?;

        let system = "You are a memory note formatter. Rewrite the user's note into \
            well-structured markdown suitable for a persistent MEMORY.md file. The note should be:\n\
            - Concise but complete\n\
            - Start with a descriptive ## heading\n\
            - Include enough context to be useful months later\n\
            - Reference specific files, decisions, or patterns when relevant\n\
            - Use bullet points for multiple items\n\
            - Do NOT include timestamps or session IDs\n\
            - Do NOT add information that is not present in the original note\n\n\
            Return ONLY the formatted markdown, no explanations.";

        let user_msg = format!(
            "Session context:\n{context_summary}\n\nRewrite this note as a memory entry:\n\n{raw_text}"
        );

        let items = vec![
            ConversationItem::system(system.to_owned()),
            ConversationItem::user(user_msg),
        ];

        let request = ConversationRequest {
            items,
            tools: vec![],
            model: Some("nofy-build".to_owned()),
            temperature: Some(0.3),
            max_output_tokens: Some(1024),
            ..Default::default()
        };

        let request_id = nofy_sampler::RequestId::random();
        let idle_timeout = std::time::Duration::from_secs(15);

        let result = match sampling_client.api_backend() {
            crate::sampling::ApiBackend::ChatCompletions => {
                let (raw, meta) = sampling_client
                    .conversation_stream(request)
                    .await
                    .map_err(|e| format!("rewrite stream failed: {e}"))?;
                let events =
                    nofy_sampler::stream_chat_completions(raw, meta, request_id, idle_timeout);
                nofy_sampler::collect_response(events).await
            }
            crate::sampling::ApiBackend::Responses => {
                let (raw, meta, doom_loop) = sampling_client
                    .conversation_stream_responses(request)
                    .await
                    .map_err(|e| format!("rewrite stream failed: {e}"))?;
                let events =
                    nofy_sampler::stream_responses(raw, meta, request_id, idle_timeout, doom_loop);
                nofy_sampler::collect_response(events).await
            }
            crate::sampling::ApiBackend::Messages => {
                let (raw, meta) = sampling_client
                    .conversation_stream_messages(request)
                    .await
                    .map_err(|e| format!("rewrite stream failed: {e}"))?;
                let events = nofy_sampler::stream_messages(raw, meta, request_id, idle_timeout);
                nofy_sampler::collect_response(events).await
            }
        };

        match result {
            Ok((response, _metrics)) => {
                let text = response.assistant_text();
                if text.is_empty() {
                    Err("LLM returned empty response".to_string())
                } else {
                    Ok(text)
                }
            }
            Err(e) => {
                tracing::debug!(error = %e.message, "memory note rewrite inference failed");
                Err(format!("rewrite inference failed: {}", e.message))
            }
        }
    }
}
