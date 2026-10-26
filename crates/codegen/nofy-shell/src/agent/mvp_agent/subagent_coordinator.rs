//! Shell runner adapter and spawn-context construction for [`MvpAgent`].
//! The shared coordinator actor lives in `nofy-tools`; this module plugs
//! its `!Send` local-session runner into `spawn_local`.
use super::*;
use nofy_tools::implementations::nofy_build::task::coordinator;
struct ShellChildRunner {
    agent_ref: LocalRef<MvpAgent>,
}
#[cfg(test)]
mod extension_snapshot_tests {
    use super::*;
    #[tokio::test]
    async fn child_snapshot_uses_reloaded_parent_not_another_project() {
        let value = serde_json::json!({"hooks":{"SessionStart":[{"hooks":[{"type":"command","command":"echo parent"}]}]}});
        let (specs, _) = nofy_agent::plugins::hooks_adapter::parse_plugin_hooks_from_value(
            &value, "parent", "/parent", "/data",
        );
        let initial = nofy_agent::plugins::hooks_adapter::replace_plugin_hooks(None, specs);
        let parent_plugins = std::sync::Arc::new(
            nofy_agent::plugins::PluginRegistry::from_discovered(vec![], &[], &[]),
        );
        let other_project = std::sync::Arc::new(
            nofy_agent::plugins::PluginRegistry::from_discovered(vec![], &[], &[]),
        );
        let (tx, mut rx) = tokio::sync::mpsc::unbounded_channel();
        let expected = parent_plugins.clone();
        let serve = async move {
            let mut hooks = initial;
            for _ in 0..2 {
                if let Some(crate::session::SessionCommand::GetExtensionSnapshot { respond_to }) =
                    rx.recv().await
                {
                    let _ = respond_to.send((hooks.clone(), Some(parent_plugins.clone())));
                    // Reload disabled the plugin before the next child is spawned.
                    hooks = nofy_agent::plugins::hooks_adapter::replace_plugin_hooks(hooks, vec![]);
                }
            }
        };
        let observe = async {
            let (first_hooks, first_plugins) = current_extension_snapshot(&tx).await;
            assert_eq!(first_hooks.unwrap().len(), 1);
            assert!(std::sync::Arc::ptr_eq(
                first_plugins.as_ref().unwrap(),
                &expected
            ));
            assert!(!std::sync::Arc::ptr_eq(
                first_plugins.as_ref().unwrap(),
                &other_project
            ));
            let (next_hooks, next_plugins) = current_extension_snapshot(&tx).await;
            assert!(next_hooks.is_none());
            assert!(std::sync::Arc::ptr_eq(
                next_plugins.as_ref().unwrap(),
                &expected
            ));
        };
        tokio::join!(serve, observe);
    }
}
async fn current_extension_snapshot(
    cmd_tx: &tokio::sync::mpsc::UnboundedSender<crate::session::SessionCommand>,
) -> (
    Option<std::sync::Arc<nofy_hooks::discovery::HookRegistry>>,
    Option<std::sync::Arc<nofy_agent::plugins::PluginRegistry>>,
) {
    let (tx, rx) = tokio::sync::oneshot::channel();
    if cmd_tx
        .send(crate::session::SessionCommand::GetExtensionSnapshot { respond_to: tx })
        .is_err()
    {
        return (None, None);
    }
    rx.await.unwrap_or_default()
}
impl coordinator::ChildRunner for ShellChildRunner {
    type Control = crate::agent::subagent::ShellChildRuntime;
    type CompletionData = crate::agent::subagent::ShellCompletionData;
    type RunFuture = coordinator::LocalBoxFuture<coordinator::ChildRunOutput<Self::CompletionData>>;
    type ValidateFuture = coordinator::LocalBoxFuture<
        nofy_tools::implementations::nofy_build::task::types::SubagentValidateTypeOutcome,
    >;
    type DescribeFuture = coordinator::LocalBoxFuture<
        nofy_tools::implementations::nofy_build::task::types::SubagentDescribeOutcome,
    >;
    fn run(&self, run: coordinator::ChildRunRequest<Self::Control>) -> Self::RunFuture {
        let agent_ref = self.agent_ref.clone();
        Box::pin(async move {
            let this = agent_ref.get();
            let parent_sid = run.request.parent_session_id.clone();
            let Some(mut ctx) = this.try_build_subagent_spawn_context(&parent_sid) else {
                tracing::warn!(
                    parent_session_id = %parent_sid,
                    subagent_id = %run.request.id,
                    "Spawn for unknown or evicted parent session"
                );
                return coordinator::ChildRunOutput {
                    result: nofy_tools::implementations::nofy_build::task::types::SubagentResult {
                        success: false,
                        error: Some(
                            "Parent session not found (evicted or torn down); cannot spawn subagent."
                                .to_owned(),
                        ),
                        subagent_id: run.request.id.clone(),
                        child_session_id: run.request.id,
                        ..Default::default()
                    },
                    completion_data: Default::default(),
                    snapshot_ref: None,
                };
            };
            let parent_handle = {
                let parent_sid = acp::SessionId::new(parent_sid);
                this.resident_handle(&parent_sid)
            };
            if let Some(handle) = parent_handle {
                let (hooks, plugins) = current_extension_snapshot(&handle.cmd_tx).await;
                ctx.hook_registry = hooks;
                ctx.plugin_registry = plugins;
                ctx.parent_mcp_pool = handle.snapshot_mcp_pool().await;
                ctx.client_hooks = handle.snapshot_client_hooks().await;
                let mut definitions = handle.snapshot_tool_definitions().await;
                crate::agent::subagent::strip_ask_user_question_tool(&mut definitions);
                crate::agent::subagent::strip_workflow_tool(&mut definitions);
                ctx.parent_tool_definitions = (!definitions.is_empty()).then_some(definitions);
            }
            crate::agent::subagent::run_shell_child(run, ctx, &this.gateway).await
        })
    }
    fn validate_type(
        &self,
        subagent_type: String,
        parent_session_id: String,
    ) -> Self::ValidateFuture {
        let agent_ref = self.agent_ref.clone();
        Box::pin(async move {
            let this = agent_ref.get();
            let mut ctx = this.build_subagent_validation_context(&parent_session_id);
            if let Some(handle) = this.resident_handle(&acp::SessionId::new(parent_session_id)) {
                ctx.plugin_registry = current_extension_snapshot(&handle.cmd_tx).await.1;
            } else {
                ctx.plugin_registry = None;
            }
            crate::agent::subagent::validate_subagent_type(&subagent_type, &ctx)
        })
    }
    fn describe_type(
        &self,
        subagent_type: String,
        harness_agent_type: Option<String>,
        parent_session_id: String,
    ) -> Self::DescribeFuture {
        let agent_ref = self.agent_ref.clone();
        Box::pin(async move {
            let this = agent_ref.get();
            match this.try_build_subagent_spawn_context(&parent_session_id) {
                Some(mut ctx) => {
                    if let Some(handle) =
                        this.resident_handle(&acp::SessionId::new(parent_session_id))
                    {
                        let (hooks, plugins) = current_extension_snapshot(&handle.cmd_tx).await;
                        ctx.hook_registry = hooks;
                        ctx.plugin_registry = plugins;
                    }
                    crate::agent::subagent::describe_subagent_type(
                        &subagent_type,
                        harness_agent_type.as_deref(),
                        &ctx,
                    )
                }
                None => {
                    tracing::warn!(
                        parent_session_id,
                        subagent_type,
                        "DescribeType for unknown/evicted parent session, replying Unavailable",
                    );
                    nofy_tools::implementations::nofy_build::task::types::SubagentDescribeOutcome::Unavailable
                }
            }
        })
    }
    fn on_completed(&self, completion: coordinator::ChildCompletion<Self::CompletionData>) {
        let gateway = self.agent_ref.get().gateway.clone();
        crate::agent::subagent::present_child_completion(completion, &gateway);
    }
    fn running_count_changed(&self, running: usize) {
        self.agent_ref
            .get()
            .activity
            .subagent_gauge()
            .store(running, std::sync::atomic::Ordering::Relaxed);
    }
    fn persisted_output_ref(&self, completion_data: &Self::CompletionData) -> Option<String> {
        completion_data
            .persisted_output_dir()
            .map(|path| path.to_string_lossy().into_owned())
    }
    fn load_persisted_output(&self, reference: &str) -> Option<std::sync::Arc<str>> {
        crate::agent::subagent::read_subagent_output(std::path::Path::new(reference))
            .map(std::sync::Arc::from)
    }
}
/// Injected as the coordinator's limit sink: it cannot link the telemetry
/// crate (dependency cycle through the sampling types).
fn log_limit_notice(notice: coordinator::SubagentLimitNotice) {
    use coordinator::{LimitedSpawnOrigin, SubagentLimitDecision};
    use nofy_telemetry::events::{SubagentLimitDisposition, SubagentLimitHit, SubagentOwnerKind};
    let (disposition, limit) = match notice.decision {
        SubagentLimitDecision::QueuedAtConcurrentLimit { limit } => {
            (SubagentLimitDisposition::Queued, limit as u64)
        }
        SubagentLimitDecision::RejectedAtConcurrentLimit { limit } => {
            (SubagentLimitDisposition::Failed, limit as u64)
        }
    };
    nofy_telemetry::session_ctx::log_event(SubagentLimitHit::session_concurrent(
        notice.parent_session_id,
        disposition,
        limit,
        u32::try_from(notice.running).unwrap_or(u32::MAX),
        u32::try_from(notice.queue_depth).unwrap_or(u32::MAX),
        match notice.origin {
            LimitedSpawnOrigin::SchedulerLoop => SubagentOwnerKind::SchedulerLoop,
            LimitedSpawnOrigin::Task => SubagentOwnerKind::Task,
        },
    ));
}
impl MvpAgent {
    /// Start the shared subagent coordinator actor.
    ///
    /// Takes `subagent_event_rx` once and `spawn_local`s one
    /// [`SubagentCoordinator`](nofy_tools::implementations::nofy_build::task::coordinator::SubagentCoordinator)
    /// that drains `ChannelBackend` events (`Spawn` / await / cancel / inspect)
    /// through [`ShellChildRunner`]. The actor owns pending/active/completed
    /// state, waiters, deadlines, and completion disposition; the runner only
    /// builds shell child sessions via `run_shell_child`.
    ///
    /// Uses `LocalRef` so the `!Send` runner can touch `self` from the
    /// `LocalSet`. Idempotent: subsequent calls are no-ops.
    pub(super) fn start_subagent_coordinator(&self) {
        let Some(rx) = self.subagent_event_rx.borrow_mut().take() else {
            return;
        };
        let agent_ref = LocalRef::new(self);
        let runner = ShellChildRunner {
            agent_ref: agent_ref.clone(),
        };
        let limit_sink: coordinator::SubagentLimitSink = std::sync::Arc::new(log_limit_notice);
        let config = coordinator::CoordinatorConfig {
            foreground_budget:
                nofy_tools::implementations::nofy_build::task::backend::env_duration_or(
                    "NOFY_SUBAGENT_AWAIT_BUDGET_MS",
                    std::time::Duration::from_secs(600),
                ),
            limits: nofy_tools::implementations::nofy_build::task::admission::SubagentLimits {
                max_concurrent: self.cfg.borrow().subagents_max_concurrent,
                behavior: self.cfg.borrow().subagents_limit_behavior,
            },
            limit_sink: Some(limit_sink),
            buffer_completions: true,
            buffered_completion_output_cap: None,
        };
        tokio::task::spawn_local(coordinator::SubagentCoordinator::new(rx, runner, config).run());
    }
    /// Lightweight context for the `SubagentEvent::ValidateType` drain arm;
    /// tolerates evicted parent sessions (returns built-in defaults + warns).
    pub(super) fn build_subagent_validation_context(
        &self,
        parent_session_id: &str,
    ) -> crate::agent::subagent::SubagentValidationContext {
        let parent_sid = acp::SessionId::new(parent_session_id);
        let (parent_cwd, allowed_subagent_types) = {
            let ps = self.resident_handle(&parent_sid);
            warn_on_missing_parent_session_for_validate_type(parent_session_id, ps.is_some());
            (
                ps.as_ref()
                    .map(|h| std::path::PathBuf::from(&h.info.cwd))
                    .unwrap_or_default(),
                ps.as_ref().and_then(|h| h.allowed_subagent_types.clone()),
            )
        };
        let (cli_agent_names, subagent_toggle) = {
            let cfg = self.cfg.borrow();
            (
                cfg.cli_agents.iter().map(|d| d.name.clone()).collect(),
                cfg.subagent_toggle.clone(),
            )
        };
        crate::agent::subagent::SubagentValidationContext {
            parent_cwd,
            plugin_registry: self.plugin_registry_handle.snapshot(),
            subagent_toggle,
            allowed_subagent_types,
            cli_agent_names,
        }
    }
    /// Test-only infallible wrapper around
    /// [`Self::try_build_subagent_spawn_context`]. Production spawn paths use
    /// the fallible variant and fail the request when the parent session is
    /// absent (evicted, or a child-session spawn whose re-parent lookup
    /// missed).
    #[cfg(test)]
    pub(super) fn build_subagent_spawn_context(
        &self,
        parent_session_id: &str,
    ) -> crate::agent::subagent::SubagentSpawnContext {
        self.try_build_subagent_spawn_context(parent_session_id)
            .expect("parent session must exist when spawning subagents")
    }
    /// Build a `SubagentSpawnContext` from the current agent state and the
    /// parent session's shared resources. Returns `None` when the parent
    /// `SessionHandle` is absent (evicted / torn down) so callers can fail
    /// the request instead of panicking.
    ///
    /// This is the ONLY subagent-related method on MvpAgent besides the
    /// coordinator startup.
    pub(super) fn try_build_subagent_spawn_context(
        &self,
        parent_session_id: &str,
    ) -> Option<crate::agent::subagent::SubagentSpawnContext> {
        let parent_sid = acp::SessionId::new(parent_session_id);
        let parent_handle = self.resident_handle(&parent_sid);
        let (
            parent_model_id,
            parent_chat_state,
            parent_cmd_tx,
            parent_cwd,
            yolo_mode,
            parent_depth,
            subagent_model_inheritance,
            hunk_tracker_handle,
            hunk_tracking_enabled,
            fs,
            terminal,
            session_env,
            parent_attribution_callback,
            parent_agent_name,
            parent_managed_mcp_proxy_base_url,
        ) = {
            let ps = parent_handle.as_ref();
            (
                ps.as_ref()
                    .map(|h| h.model_id.clone())
                    .unwrap_or_else(|| self.models_manager.current_model_id()),
                ps.as_ref().map(|h| h.chat_state_handle.clone()),
                ps.as_ref().map(|h| h.cmd_tx.clone()),
                ps.as_ref()
                    .map(|h| std::path::PathBuf::from(&h.info.cwd))
                    .unwrap_or_default(),
                ps.as_ref()
                    .map(|h| h.yolo_mode)
                    .unwrap_or(self.default_yolo_mode),
                ps.as_ref()
                    .map(|h| h.tool_context.subagent_depth)
                    .unwrap_or(0),
                ps.as_ref()
                    .map(|h| h.tool_context.subagent_model_inheritance)
                    .unwrap_or(false),
                ps.as_ref()
                    .map(|h| h.tool_context.hunk_tracker_handle.clone())
                    .unwrap_or_else(nofy_hunk_tracker::HunkTrackerHandle::noop),
                ps.as_ref()
                    .map(|h| h.tool_context.hunk_tracking_enabled)
                    .unwrap_or(false),
                ps.as_ref()
                    .map(|h| h.tool_context.fs.inner().clone())
                    .unwrap_or_else(|| {
                        let cwd = ps
                            .as_ref()
                            .map(|h| std::path::PathBuf::from(&h.info.cwd))
                            .unwrap_or_default();
                        std::sync::Arc::new(nofy_workspace::file_system::LocalFs::new(cwd))
                    }),
                ps.as_ref()
                    .map(|h| h.tool_context.terminal.clone())
                    .unwrap_or_else(|| {
                        std::sync::Arc::new(crate::terminal::TerminalRunner::new(
                            std::sync::Arc::new(self.gateway.clone()),
                            parent_sid.clone(),
                        ))
                    }),
                ps.as_ref()
                    .map(|h| h.tool_context.session_env.clone())
                    .unwrap_or_else(|| std::sync::Arc::new(std::collections::HashMap::new())),
                ps.as_ref().and_then(|h| h.attribution_callback.clone()),
                ps.as_ref().map(|h| h.agent_name.clone()),
                ps.as_ref().map(|h| h.managed_mcp_proxy_base_url.clone()),
            )
        };
        let (
            parent_workspace_ops,
            parent_terminal_backend,
            parent_notification_handle,
            parent_scheduler_handle,
        ) = parent_handle.as_ref().map(|ps| {
            (
                ps.workspace_ops.clone(),
                ps.terminal_backend.clone(),
                ps.tools_notification_handle.clone(),
                ps.scheduler_handle.clone(),
            )
        })?;
        let available_models = self.models_manager.models();
        let (parent_lsp, parent_process_scope) = {
            let parent = parent_handle.as_ref();
            (
                parent.as_ref().and_then(|h| h.tool_context.lsp.clone()),
                parent
                    .as_ref()
                    .and_then(|h| h.tool_context.process_scope.clone()),
            )
        };
        let am = self.auth_manager.clone();
        let inference_idle_timeout_secs = {
            let per_model = config::find_model_by_id(&available_models, parent_model_id.0.as_ref())
                .and_then(|e| e.info.inference_idle_timeout_secs);
            per_model.unwrap_or(600).max(10)
        };
        let parent_hook_registry = parent_handle.as_ref().and_then(|h| h.hook_registry.clone());
        let parent_max_turns = parent_handle.as_ref().and_then(|h| h.max_turns);
        let parent_model_agent_type =
            config::find_model_by_id(&available_models, parent_model_id.0.as_ref())
                .map(|e| e.info.agent_type.clone());
        let ask_user_question_enabled = parent_handle
            .as_ref()
            .map(|h| h.ask_user_question_enabled)
            .unwrap_or_else(|| self.cfg.borrow().resolve_ask_user_question().value);
        let project_trusted = crate::agent::folder_trust::project_scope_allowed(&parent_cwd);
        let (base_roles, base_personas, subagent_model_overrides, subagent_toggle) = {
            let cfg = self.cfg.borrow();
            (
                cfg.subagent_roles.clone(),
                cfg.subagent_personas.clone(),
                cfg.subagent_model_overrides.clone(),
                cfg.subagent_toggle.clone(),
            )
        };
        let (subagent_roles, subagent_personas) =
            crate::config::SubagentsConfig::effective_definition_maps(
                &base_roles,
                &base_personas,
                &parent_cwd,
                project_trusted,
            );
        let mut ctx = crate::agent::subagent::SubagentSpawnContext {
            lsp: parent_lsp,
            process_scope: parent_process_scope,
            client_hooks: Default::default(),
            sampling_config: self.sampling_config.borrow().clone(),
            managed_mcp_proxy_base_url: parent_managed_mcp_proxy_base_url
                .unwrap_or_else(|| self.cli_chat_proxy_base_url()),
            alpha_test_key: self.alpha_test_key(),
            auth_method_id: self
                .auth_method_id
                .load()
                .as_deref()
                .cloned()
                .unwrap_or_else(|| acp::AuthMethodId::new("default")),
            model_id: parent_model_id,
            auth: self.current_or_buffered_auth(),
            parent_cwd: parent_cwd.clone(),
            parent_session_id: parent_session_id.to_string(),
            yolo_mode,
            subagent_event_tx: self.subagent_event_tx.clone(),
            parent_depth,
            subagent_model_inheritance,
            subagents_max_depth: self.cfg.borrow().subagents_max_depth,
            workflow_max_concurrent_agents: self.cfg.borrow().workflow_max_concurrent_agents,
            inference_idle_timeout_secs,
            parent_compaction: crate::session::CompactionPins::default(),
            auto_compact_threshold_tiers:
                crate::agent::subagent::AutoCompactThresholdTiers::capture(&self.cfg.borrow()),
            hunk_tracker_handle,
            hunk_tracking_enabled,
            fs,
            terminal,
            session_env,
            memory_config: self.memory_config.clone(),
            web_fetch_config: self.prepare_web_fetch_config(),
            app_builder_deployer_config: self.prepare_app_builder_deployer_config(),
            write_file_enabled: self.cfg.borrow().resolve_write_file().value,
            goal_enabled: self.cfg.borrow().resolve_goal().value,
            background_workflows_enabled: self.cfg.borrow().resolve_workflows().value,
            ask_user_question_enabled,
            parent_cmd_tx: parent_cmd_tx.clone(),
            parent_session_info: parent_handle.as_ref().map(|h| crate::session::info::Info {
                id: parent_sid.clone(),
                cwd: h.info.cwd.clone(),
            }),
            parent_chat_state,
            parent_max_turns,
            available_models,
            subagent_model_overrides,
            subagent_toggle,
            subagent_roles,
            subagent_personas,
            todo_gate: self.cfg.borrow().todo_gate,
            laziness_debug_log: self.cfg.borrow().laziness_debug_log.clone(),
            respect_gitignore: self.cfg.borrow().respect_gitignore,
            path_not_found_hints: self.cfg.borrow().path_not_found_hints,
            plugin_registry: self.plugin_registry_handle.snapshot(),
            models_manager: self.models_manager.clone(),
            file_tool_overrides: {
                let cfg = self.cfg.borrow();
                let effective = cfg.toolset.resolve_file_toolset();
                if effective != crate::tools::FileToolset::Standard {
                    effective.tool_configs(&cfg.toolset.hashline).ok()
                } else {
                    None
                }
            },
            agent_config: Some(self.cfg.borrow().clone()),
            hook_registry: parent_hook_registry,
            permission_handle: parent_handle.as_ref().map(|h| h.permission_handle.clone()),
            worktree_type: self.worktree_type,
            api_key_provider: Some(Arc::new(crate::auth::manager::SharedAuthKeyProvider(
                am.clone(),
            ))),
            image_description_model: self.resolve_image_description_model(),
            workspace_ops: parent_workspace_ops.clone(),
            auth_manager: am.clone(),
            attribution_callback: parent_attribution_callback,
            parent_agent_name,
            parent_model_agent_type,
            allowed_subagent_types: parent_handle
                .as_ref()
                .and_then(|h| h.allowed_subagent_types.clone()),
            parent_mcp_configs: parent_handle
                .as_ref()
                .map(|h| crate::session::agent_mcp::mcp_servers_for_fork(&h.mcp_servers))
                .unwrap_or_default(),
            managed_mcp_state: self.managed_mcp_cache.clone(),
            parent_mcp_pool: None,
            parent_tool_definitions: None,
            parent_skills: None,
            parent_skills_config: self.cfg.borrow().skills.clone(),
            parent_compat: self.cfg.borrow().compat_resolved,
            task_completion_reservations: parent_handle
                .as_ref()
                .and_then(|h| h.tool_context.task_completion_reservations.clone()),
            task_output_tool_name: parent_handle
                .as_ref()
                .map(|h| h.tool_context.task_output_tool_name.clone())
                .unwrap_or_else(|| {
                    nofy_tools::reminders::task_completion::DEFAULT_TASK_OUTPUT_TOOL.to_string()
                }),
            auto_wake_enabled: self.cfg.borrow().auto_wake_enabled,
            goal_loop_active: parent_handle
                .as_ref()
                .map(|h| h.tool_context.goal_loop_active_gate.clone())
                .unwrap_or_else(|| std::sync::Arc::new(std::sync::atomic::AtomicBool::new(false))),
            parent_terminal_backend: parent_terminal_backend.clone(),
            parent_notification_handle: parent_notification_handle.clone(),
            parent_scheduler_handle: parent_scheduler_handle.clone(),
            subagent_sampling_semaphore: self.subagent_sampling_semaphore.clone(),
        };
        ctx.parent_compaction =
            crate::agent::subagent::SubagentSpawnContext::snapshot_parent_compaction_pins(
                ctx.resolve_compaction_mode(),
                ctx.agent_config
                    .as_ref()
                    .map(|c| c.resolve_two_pass_compaction().value)
                    .unwrap_or(false),
                ctx.parent_agent_name.as_deref(),
                ctx.parent_model_agent_type.as_deref(),
                &ctx.parent_cwd,
            );
        Some(ctx)
    }
}
