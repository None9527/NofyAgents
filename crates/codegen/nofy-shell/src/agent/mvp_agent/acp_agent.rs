#![cfg_attr(rustfmt, rustfmt::skip)]
#![allow(unused_imports)]
//! [`acp::Agent`] trait implementation for [`MvpAgent`].
//! Co-located child of `mvp_agent` (`use super::*`).
use super::*;
use crate::auth::SilentRefresh;
use crate::extensions::session_admin::InternalMethod;
#[async_trait::async_trait(?Send)]
impl acp::Agent for MvpAgent {
    /// In the meta, we provide
    ///   - model_state: the model state, useful for the client to display available models and the default model.
    ///
    /// SINGLE-CALL INVARIANT: this method is the sole writer of
    /// `self.auth_method_id` during initialization. It is called exactly once
    /// per agent process by the ACP server before any session-creating
    /// requests, while `auth_method_id` is still `None` (initialized at
    /// `MvpAgent::new`). The auth-method block below relies on that
    /// invariant when it unconditionally writes the default id returned by
    /// `auth_method::build_auth_methods`. If you ever need to call
    /// `initialize()` more than once, restore an `is_none()` guard around
    /// the `auth_method_id` write at the call site so a re-init doesn't
    /// silently downgrade an api-key user to a session-token user.
    async fn initialize(
        &self,
        arguments: acp::InitializeRequest,
    ) -> Result<acp::InitializeResponse, acp::Error> {
        tracing::debug!(target: "sampling_log", "Received initialize request");
        nofy_telemetry::unified_log::info("agent initialized", None, None);
        if nofy_telemetry::startup::agent_owned().is_some() {
            nofy_telemetry::startup::clear();
        }
        self.start_subagent_coordinator();
        let auto_gc_policy = self.cfg.borrow().resolve_worktree_auto_gc();
        tokio::task::spawn_blocking(move || {
            crate::session::worktree_pool::cleanup_stale_pool_worktrees(None);
            let opts = nofy_fast_worktree::AutoGcOptions::from_resolved(auto_gc_policy);
            if let Err(e) = nofy_fast_worktree::WorktreeDb::open_default()
                .and_then(|db| nofy_fast_worktree::maybe_auto_gc(&db, &opts))
            {
                tracing::warn!(error = %e, "auto worktree gc failed");
            }
        });
        tokio::task::spawn_blocking(|| {
            crate::session::persistence::cleanup_stale_sessions(None);
        });
        {
            let root = crate::util::nofy_home::nofy_home();
            crate::session::storage::search::SEARCH_INDEX_MANAGER.bootstrap_once(root);
        }
        const PERMISSION_CLEANUP_TTL_DAYS: u64 = 30;
        static CLEANUP_PERMISSIONS_ONCE: std::sync::Once = std::sync::Once::new();
        CLEANUP_PERMISSIONS_ONCE
            .call_once(|| {
                tokio::task::spawn(
                    nofy_workspace::permission::cleanup_stale_permission_state(
                        std::time::Duration::from_secs(
                            PERMISSION_CLEANUP_TTL_DAYS * 24 * 60 * 60,
                        ),
                    ),
                );
            });
        nofy_workspace::trust::migrate_legacy_hook_trust();
        if let Some(auth) = self.auth_manager.current() {
            let user_id = auth.user_id.trim();
            let needs_user_info = user_id.is_empty()
                || user_id.eq_ignore_ascii_case("unknown");
            nofy_telemetry::unified_log::info(
                "auth init user_info check",
                None,
                Some(
                    serde_json::json!({
                    "user_id": user_id,
                    "needs_user_info": needs_user_info,
                    "key_prefix": nofy_auth::bearer_suffix(&auth.key),
                    "rt_prefix": auth.refresh_token.as_deref().map(nofy_auth::bearer_suffix),
                }),
                ),
            );
            if needs_user_info && let Err(e) = self.auth_manager.update(auth).await {
                tracing::warn!(
                    "Failed to refresh user info from proxy during new_session: {}",
                    e
                );
            }
        }
        let mut client_type = arguments
            .meta
            .as_ref()
            .and_then(|m| m.get("clientType"))
            .and_then(|v| serde_json::from_value::<ClientType>(v.clone()).ok())
            .unwrap_or_default();
        let client_identifier = arguments
            .meta
            .as_ref()
            .and_then(|m| m.get("clientIdentifier"))
            .and_then(|v| v.as_str())
            .map(|s| s.to_string());
        if let Some(ref id) = client_identifier {
            tracing::info!("Client identifier set to: {}", id);
        }
        if client_type == ClientType::Generic {
            match client_identifier.as_deref() {
                Some("nofy-web") => client_type = ClientType::NofyWeb,
                Some("nebula") => client_type = ClientType::Nebula,
                Some("nofy-code-extension") => client_type = ClientType::Extension,
                Some("nofy-desktop") => client_type = ClientType::Desktop,
                _ => {}
            }
        }
        *self.client_type.borrow_mut() = client_type;
        tracing::info!("Client type set to: {:?}", client_type);
        let code_nav_enabled = Self::parse_code_nav_capability(&arguments);
        self.code_nav_enabled.set(code_nav_enabled);
        tracing::info!(
            code_nav_enabled,
            client_type = ?client_type,
            event = "code_nav_capability_parsed",
            "code-nav capability initialized from initialize request; \
             index will start lazily on first nofy/code/* request if eligible"
        );
        let interactive_trust_client = Self::parse_interactive_trust_capability(
            &arguments,
        );
        self.interactive_trust_client.set(interactive_trust_client);
        let client_supports_mcp_apps = arguments
            .meta
            .as_ref()
            .and_then(|m| m.get("mcpApps"))
            .and_then(|v| v.as_bool())
            .unwrap_or(false);
        if client_supports_mcp_apps {
            tracing::info!("Client supports MCP Apps");
        }
        let buffering_settings = arguments
            .meta
            .as_ref()
            .and_then(|m| m.get("bufferingSettings"))
            .map(|value| serde_json::from_value::<
                update_chunk_merge::BufferingSettings,
            >(value.clone()))
            .transpose()
            .map_err(|err| {
                tracing::warn!(
                    error = ?err,
                    "Failed to parse buffering settings from init meta"
                );
                err
            })
            .unwrap_or(None);
        tracing::info!(?buffering_settings, "Buffering settings from init");
        *self.buffering_settings.borrow_mut() = buffering_settings;
        if self.initialize_request.set(arguments).is_err() {
            tracing::info!("Initialize called on reconnect (already initialized)");
        }
        let pre = self
            .auth_manager
            .current()
            .map(|a| (
                nofy_auth::bearer_suffix(&a.key).to_owned(),
                a
                    .refresh_token
                    .as_deref()
                    .map(|t| nofy_auth::bearer_suffix(t).to_owned()),
            ));
        self.auth_manager.force_reload_from_disk();
        let post = self
            .auth_manager
            .current()
            .map(|a| (
                nofy_auth::bearer_suffix(&a.key).to_owned(),
                a
                    .refresh_token
                    .as_deref()
                    .map(|t| nofy_auth::bearer_suffix(t).to_owned()),
            ));
        nofy_telemetry::unified_log::info(
            "auth init disk refresh",
            None,
            Some(
                serde_json::json!({
                "pre_key": pre.as_ref().map(|p| &p.0),
                "pre_rt": pre.as_ref().and_then(|p| p.1.as_deref()),
                "post_key": post.as_ref().map(|p| &p.0),
                "post_rt": post.as_ref().and_then(|p| p.1.as_deref()),
                "changed": pre.as_ref().map(|p| &p.0) != post.as_ref().map(|p| &p.0),
            }),
            ),
        );
        nofy_telemetry::unified_log::info(
            "auth: initialize() refreshed auth state from disk",
            None,
            Some(
                serde_json::json!({
                "has_current": self.auth_manager.current().is_some(),
                "is_expired": self.auth_manager.is_expired(),
                "auth_mode": self.auth_manager.current().map(|a| format!("{:?}", a.auth_mode)),
            }),
            ),
        );
        if auth_method::read_xai_api_key_env().is_err()
            && let Some(api_key) = crate::auth::read_api_key(
                &crate::util::nofy_home::nofy_home(),
            )
        {
            unsafe { std::env::set_var("NOFY_API_KEY", &api_key) };
            tracing::info!("auth: loaded API key from auth.json (nofy::api_key scope)");
            nofy_telemetry::unified_log::info(
                "auth: loaded API key from auth.json (nofy::api_key scope)",
                None,
                None,
            );
        }
        let xai_api_base_url = self.cfg.borrow().endpoints.xai_api_base_url.clone();
        let has_byok = self
            .models_manager
            .models()
            .values()
            .any(crate::agent::config::ModelEntry::has_own_credentials);
        let first_party_env_ok = if crate::auth::should_probe_first_party_env_key(
            has_byok,
            auth_method::has_xai_api_key_env(),
        ) {
            crate::auth::first_party_env_key_allows_advertise(
                    &xai_api_base_url,
                    crate::auth::DEFAULT_PROBE_TIMEOUT,
                )
                .await
        } else {
            true
        };
        self.auth_manager.set_first_party_env_api_key_ok(first_party_env_ok);
        let has_external_api_key = auth_method::should_advertise_xai_api_key_with_env_ok(
            self.models_manager.models().values(),
            first_party_env_ok,
        );
        let init_has_current = self.auth_manager.current().is_some();
        let init_is_expired = self.auth_manager.is_expired();
        nofy_telemetry::unified_log::info(
            "auth init token state",
            None,
            Some(
                serde_json::json!({
                "has_current": init_has_current,
                "is_expired": init_is_expired,
            }),
            ),
        );
        let mut has_cached_token = init_has_current;
        if !init_has_current && init_is_expired {
            has_cached_token = match self.auth_manager.silent_refresh().await {
                SilentRefresh::Renewed(_) => true,
                SilentRefresh::Failed(remedy) => remedy.is_self_healing(),
            };
        }
        let has_auth_provider = {
            let cfg = self.cfg.borrow();
            cfg.nofy_com_config.auth_provider_command.is_some()
        };
        tracing::info!(
            has_auth_provider,
            "auth: advertising auth methods",
        );
        let built = auth_method::build_auth_methods(auth_method::AuthMethodsBuildInputs {
            has_external_api_key,
            has_cached_token,
        });
        let auth_methods = built.methods;
        nofy_telemetry::unified_log::info(
            "auth: initialize() built auth_methods for ACP response",
            None,
            Some(
                serde_json::json!({
                "nofy_home": crate::util::nofy_home::nofy_home().display().to_string(),
                "HOME": std::env::var("HOME").unwrap_or_else(|_| "(unset)".into()),
                "has_external_api_key": has_external_api_key,
                "first_party_env_api_key_ok": first_party_env_ok,
                "has_cached_token": has_cached_token,
                "init_has_current": init_has_current,
                "init_is_expired": init_is_expired,
                "auth_mode": self.auth_manager.current().map(|a| format!("{:?}", a.auth_mode)),
                "methods": auth_methods.iter().map(|m| m.id().0.as_ref()).collect::<Vec<_>>(),
                "default_auth_method_id": built.default_auth_method_id.as_ref().map(|id| id.0.as_ref()),
            }),
            ),
        );
        debug_assert!(
            !has_external_api_key
                || matches!(
                    auth_methods
                        .first()
                        .map(|m| auth_method::AuthMethodKind::from_id(m.id())),
                    Some(auth_method::AuthMethodKind::XaiApiKey)
                ),
            "BYOK invariant violated: nofy.api_key MUST be auth_methods.first() \
             when has_external_api_key is true; got {:?}",
            auth_methods.first().map(|m| m.id()),
        );
        let default_auth_method_id_wire: Option<String> = built
            .default_auth_method_id
            .as_ref()
            .map(|id| id.0.to_string());
        if let Some(default_id) = built.default_auth_method_id {
            nofy_telemetry::unified_log::info(
                "auth method selection",
                None,
                Some(
                    serde_json::json!({
                    "default_auth_method_id": default_id.0.as_ref(),
                    "has_external_api_key": has_external_api_key,
                    "has_cached_token": has_cached_token,
                    "methods_first": auth_methods.first().map(|m| m.id().0.as_ref()),
                    "methods_count": auth_methods.len(),
                }),
                ),
            );
            self.set_auth_method(default_id);
        }
        self.sync_process_static_api_key(None);
        let current_working_directory = self.launch_cwd.clone();
        let hostname = gethostname::gethostname();
        let mcp_servers: Vec<crate::extensions::mcp::McpServerEntry> = Vec::new();
        let fetch_managed_mcps = self.cfg.borrow().managed_mcps_enabled
            && self.can_fetch_managed_mcps();
        if self.cfg.borrow().managed_mcps_enabled && !fetch_managed_mcps {
            tracing::info!("Managed MCP fetch: DISABLED");
        }
        self.spawn_initialize_launch_mcp_setup(fetch_managed_mcps);
        self.spawn_managed_gateway_tool_catalog_fetch();
        {
            let agent_ref = LocalRef::new(self);
            tokio::task::spawn_local(async move {
                tokio::time::sleep(std::time::Duration::from_secs(2)).await;
                agent_ref.get().emit_announcements(AnnouncementsPushMode::SeedNewClient);
            });
        }
        self.spawn_resource_report_loop();
        let init_model_state = if crate::agent::chat_modes::process_chat_mode_enabled() {
            self.chat_modes.model_state().await
        } else {
            self.model_state(None)
        };
        let session_capabilities = acp::SessionCapabilities::new()
            .close(acp::SessionCloseCapabilities::new());
        let session_capabilities = if crate::agent::chat_modes::process_chat_mode_enabled() {
            session_capabilities
        } else {
            session_capabilities
                    .list(acp::SessionListCapabilities::new())
                    .resume(acp::SessionResumeCapabilities::new())
        };
        Ok(
            acp::InitializeResponse::new(acp::ProtocolVersion::V1)
                .agent_capabilities(
                    acp::AgentCapabilities::new()
                        .load_session(true)
                        .meta(
                            serde_json::json!({
                    "nofy/fs_notify": true,
                    // Advertised so SDKs can warn when a registration depends on
                    // hook behavior this agent doesn't honor.
                    "nofy/hooks": {
                        "blockingEvents": crate::extensions::hooks::ADVERTISED_BLOCKING_EVENTS,
                        "decisions": crate::extensions::hooks::ADVERTISED_DECISIONS,
                        "stopSignals": crate::extensions::hooks::ADVERTISED_STOP_SIGNALS,
                    },
                })
                                .as_object()
                                .cloned(),
                        )
                        .prompt_capabilities(
                            acp::PromptCapabilities::new().embedded_context(true),
                        )
                        .mcp_capabilities(
                            acp::McpCapabilities::new().http(true).sse(true),
                        )
                        .session_capabilities(session_capabilities),
                )
                .auth_methods(auth_methods)
                .meta({
                    let metadata = parse_json_object_env("NOFY_AGENT_METADATA");
                    serde_json::json!({
                    "nofyShell": true,
                    // Re-deriving this precedence client-side has regressed OIDC
                    // refresh, so clients consume the agent's choice from here.
                    "defaultAuthMethodId": default_auth_method_id_wire,
                    // The agent can drive in-process SDK MCP servers over the ACP reverse
                    // channel (`nofy/mcp/sdk_call`); the SDK reads this to enable transport="acp".
                    (nofy_mcp::wire::MCP_SDK): true,
                    // `session/new` / `session/load` accept per-session plugin roots in
                    // `_meta.pluginDirs`; the SDKs gate `NofyOptions.plugins` on this.
                    (SESSION_PLUGIN_DIRS_CAPABILITY_KEY): true,
                    "currentWorkingDirectory": current_working_directory.to_string_lossy().to_string(),
                    "agentVersion": nofy_version::VERSION,
                    "agentId": agent_id(),
                    "agentInstanceId": agent_instance_id(),
                    "hostname": hostname.to_string_lossy().to_string(),
                    "modelState": init_model_state,
                    "mcpServers": mcp_servers,
                    "mcpApps": client_supports_mcp_apps,
                    "metadata": metadata,
                    "availableCommands": crate::session::slash_commands::builtin_commands(self.command_availability()),
                    "cancelRewind": self.cfg.borrow().resolve_cancel_rewind().value,
                    // Resolved session-recap state (remote settings / config / env;
                    // default ON). The client gates BOTH its automatic
                    // away-recap poll and the manual `/recap` on this so a
                    // disabled feature produces zero `nofy/recap` traffic.
                    "sessionRecap": self.cfg.borrow().is_session_recap_enabled(),
                })
                        .as_object()
                        .cloned()
                }),
        )
    }
    async fn authenticate(
        &self,
        arguments: acp::AuthenticateRequest,
    ) -> Result<AuthenticateResponse, acp::Error> {
        tracing::info!(method = %arguments.method_id.0, "auth: authenticate request");
        nofy_telemetry::unified_log::info(
            "auth started",
            None,
            Some(serde_json::json!({"method": arguments.method_id.0.as_ref()})),
        );
        match arguments.method_id.0.as_ref() {
            auth_method::NOFY_API_KEY_METHOD_ID => {
                let mut sampling_config = self.sampling_config.borrow_mut();
                if sampling_config.api_key.is_none() {
                    if let Ok(api_key) = auth_method::read_xai_api_key_env() {
                        sampling_config.api_key = Some(api_key.clone());
                        if let Err(e) = crate::auth::store_api_key(
                            &crate::util::nofy_home::nofy_home(),
                            &api_key,
                        ) {
                            tracing::warn!("failed to persist API key to auth.json: {e}");
                            nofy_telemetry::unified_log::warn(
                                "failed to persist API key to auth.json",
                                None,
                                Some(serde_json::json!({ "error": e.to_string() })),
                            );
                        }
                    } else if !self
                        .models_manager
                        .models()
                        .values()
                        .any(|m| m.has_own_credentials())
                    {
                        return Err(
                            acp::Error::auth_required()
                                .data(
                                    "Set NOFY_API_KEY or add api_key/env_key to config.toml.",
                                ),
                        );
                    }
                }
                self.set_auth_method(arguments.method_id.clone());
                self.sync_process_static_api_key(None);
                self.ensure_telemetry_client();
                if crate::agent::chat_modes::process_chat_mode_enabled() {
                    self.chat_modes.warm_in_background();
                }
                Ok(Default::default())
            }
            auth_method::CACHED_TOKEN_AUTH_METHOD_ID => {
                let current_auth = self.auth_manager.current();
                let has_current = current_auth.is_some();
                let is_expired = self.auth_manager.is_expired();
                nofy_telemetry::unified_log::info(
                    "auth cached_token check",
                    None,
                    Some(
                        serde_json::json!({
                        "has_current": has_current,
                        "is_expired": is_expired,
                    }),
                    ),
                );
                let resolved = match self.auth_manager.current() {
                    Some(auth) => Some(auth),
                    None if !self.auth_manager.is_expired() => None,
                    None => {
                        match self.auth_manager.silent_refresh().await {
                            SilentRefresh::Renewed(auth) => Some(*auth),
                            SilentRefresh::Failed(remedy) if remedy.is_self_healing() => {
                                self.auth_manager.current_or_expired()
                            }
                            SilentRefresh::Failed(_) => None,
                        }
                    }
                };
                let Some(auth) = resolved else {
                    let message = if self.auth_manager.is_expired() {
                        "Session expired, re-authentication required"
                    } else {
                        "No cached auth token found"
                    };
                    tracing::info!(%message, "cached_token missing/expired, falling through");
                    nofy_telemetry::unified_log::warn(
                        "auth cached_token fallthrough",
                        None,
                        Some(serde_json::json!({ "reason": message })),
                    );
                    return self
                        .authenticate_after_cached_token_unavailable(arguments)
                        .await;
                };
                {
                    let mut sampling_config = self.sampling_config.borrow_mut();
                    sampling_config.api_key = Some(auth.key);
                    tracing::debug!("auth: cached_token handler set api_key (SessionToken)");
                    nofy_telemetry::unified_log::debug(
                        "auth: cached_token handler set api_key (SessionToken)",
                        None,
                        None,
                    );
                }
                self.set_auth_method(arguments.method_id.clone());
                self.ensure_telemetry_client();
                if crate::agent::chat_modes::process_chat_mode_enabled() {
                    self.chat_modes.warm_in_background();
                }
                Ok(self.auth_response_with_meta())
            }
            _ => {
                Err(
                    acp::Error::invalid_params()
                        .data(
                            format!(
                "unsupported auth method: {}",
                arguments.method_id.0
            ),
                        ),
                )
            }
        }
    }
    async fn new_session(
        &self,
        arguments: acp::NewSessionRequest,
    ) -> Result<acp::NewSessionResponse, acp::Error> {
        self.new_session_inner(arguments).await
    }
    async fn load_session(
        &self,
        arguments: acp::LoadSessionRequest,
    ) -> Result<acp::LoadSessionResponse, acp::Error> {
        self.load_session_inner(arguments).await
    }
    async fn list_sessions(
        &self,
        args: acp::ListSessionsRequest,
    ) -> Result<acp::ListSessionsResponse, acp::Error> {
        crate::agent::handlers::session::handle_list_sessions(self, args).await
    }
    async fn resume_session(
        &self,
        args: acp::ResumeSessionRequest,
    ) -> Result<acp::ResumeSessionResponse, acp::Error> {
        self.resume_session_inner(args).await
    }
    async fn close_session(
        &self,
        args: acp::CloseSessionRequest,
    ) -> Result<acp::CloseSessionResponse, acp::Error> {
        self.close_session_inner(args).await
    }
    #[tracing::instrument(
        name = "agent.prompt",
        skip_all,
        fields(session_id = %arguments.session_id.0, turn_number = tracing::field::Empty)
    )]
    #[allow(unused_mut)]
    async fn prompt(
        &self,
        mut arguments: acp::PromptRequest,
    ) -> Result<acp::PromptResponse, acp::Error> {
        use crate::session::plan_mode::PromptMode;
        if let Some(meta) = arguments.meta.as_ref() {
            nofy_file_utils::trace_context::link_current_span_to_meta(
                &serde_json::Value::Object(meta.clone()),
            );
        }
        tracing::debug!(
            target: "sampling_log",
            session_id = %arguments.session_id.0,
            "Received prompt request"
        );
        nofy_telemetry::unified_log::info(
            "prompt received",
            Some(arguments.session_id.0.as_ref()),
            None,
        );
        let handle = self
            .session_handle_waiting_for_load(&arguments.session_id)
            .await
            .ok_or_else(|| acp::Error::invalid_params().data("unknown session id"))?;
        if self.models_manager.models().is_empty() || self.models_manager.allowlist_excludes_all() {
            let reason = if self.models_manager.models().is_empty() {
                "No models configured. Configure model_providers in ~/.nofy/config.json or a custom model catalog endpoint, then reload. Nofy does not bundle an inference model."
                    .to_owned()
            } else {
                self.models_manager.allowlist_excludes_all_message()
            };
            self.send_model_auto_switched(
                    &arguments.session_id,
                    &acp::ModelId::new(String::new()),
                    &acp::ModelId::new(String::new()),
                    &reason,
                )
                .await;
            return Ok(acp::PromptResponse::new(acp::StopReason::EndTurn));
        }
        let latched_model = self
            .session_registry
            .unavailable_model(&arguments.session_id);
        if let Some(unavailable_model) = latched_model {
            let models = self.models_manager.models();
            let available = self.models_manager.available();
            let restore_model_id = selectable_catalog_key_for_persisted(
                    &models,
                    &available,
                    &unavailable_model,
                )
                .unwrap_or(unavailable_model.clone());
            if available.contains_key(&restore_model_id) {
                tracing::info!(
                    session_id = %arguments.session_id.0,
                    model_id = %restore_model_id.0,
                    "prompt: previously-unavailable model is back in the catalog; restoring it and unblocking the session"
                );
                nofy_telemetry::unified_log::info(
                    "prompt: previously-unavailable model recovered, unblocking session",
                    Some(arguments.session_id.0.as_ref()),
                    Some(
                        serde_json::json!({
                        "model_id": restore_model_id.0.as_ref(),
                    }),
                    ),
                );
                self.session_registry.take_unavailable_model(&arguments.session_id);
                if let Err(e) = crate::agent::handlers::model_switch::apply(
                        self,
                        acp::SetSessionModelRequest::new(
                            arguments.session_id.clone(),
                            restore_model_id.clone(),
                        ),
                    )
                    .await
                {
                    tracing::warn!(
                        session_id = %arguments.session_id.0,
                        model_id = %restore_model_id.0,
                        error = ?e,
                        "prompt: failed to restore previously-unavailable model; continuing with the session's current model"
                    );
                }
            } else {
                tracing::warn!(
                    session_id = %arguments.session_id.0,
                    unavailable_model = %unavailable_model.0,
                    available_count = available.len(),
                    available_keys = ?available.keys().take(10).collect::<Vec<_>>(),
                    "prompt blocked: session model unavailable since load and still missing from the catalog"
                );
                nofy_telemetry::unified_log::warn(
                    "prompt blocked: model unavailable",
                    Some(arguments.session_id.0.as_ref()),
                    Some(
                        serde_json::json!({
                        "unavailable_model": unavailable_model.0.as_ref(),
                        "available_count": available.len(),
                    }),
                    ),
                );
                self.send_model_auto_switched(
                        &arguments.session_id,
                        &acp::ModelId::new(String::new()),
                        &acp::ModelId::new(String::new()),
                        "Your previous model is no longer available and could not \
                     be switched to a compatible model. Please start a new session.",
                    )
                    .await;
                return Ok(acp::PromptResponse::new(acp::StopReason::EndTurn));
            }
        }
        let dispatch_lock = self.dispatch_lock(&arguments.session_id);
        let dispatch_guard = dispatch_lock.lock().await;
        let meta_prompt_mode = arguments
            .meta
            .as_ref()
            .and_then(|m| m.get("mode"))
            .and_then(|v| v.as_str())
            .map(PromptMode::from_meta_str);
        let prompt_mode = if let Some(mode) = meta_prompt_mode {
            mode
        } else {
            let (mode_tx, mode_rx) = oneshot::channel();
            let _ = handle
                .cmd_tx
                .send(crate::session::SessionCommand::GetCurrentPromptMode {
                    responds_to: mode_tx,
                });
            mode_rx.await.unwrap_or_default()
        };
        let prompt_id = arguments
            .meta
            .as_ref()
            .and_then(|m| m.get("promptId"))
            .and_then(|v| v.as_str())
            .map(|s| s.to_string())
            .unwrap_or_else(|| uuid::Uuid::new_v4().to_string());
        let turn_number = self.allocate_turn_number(&arguments.session_id);
        tracing::Span::current().record("turn_number", turn_number);
        let (model_tx, model_rx) = oneshot::channel();
        let _ = handle
            .cmd_tx
            .send(crate::session::SessionCommand::GetCurrentModel {
                responds_to: model_tx,
            });
        let model = model_rx
            .await
            .unwrap_or_else(|_| self.sampling_config.borrow().model.clone());
        // The parsed-prompt channel only fed the removed trace-metadata upload;
        // the session actor tolerates `None`.
        let parsed_prompt_tx: Option<oneshot::Sender<ParsedPromptInfo>> = None;
        let verbatim = arguments
            .meta
            .as_ref()
            .and_then(|m| m.get("verbatim"))
            .and_then(|v| v.as_bool())
            .unwrap_or(false);
        let send_now = arguments
            .meta
            .as_ref()
            .and_then(|m| m.get("sendNow"))
            .and_then(|v| v.as_bool())
            .unwrap_or(false);
        let next_trace_turn = self
            .session_turn_number(&arguments.session_id)
            .unwrap_or_else(|| turn_number.saturating_add(1));
        let _ = handle
            .cmd_tx
            .send(crate::session::SessionCommand::SetNextTraceTurn {
                next_trace_turn,
                request_id: Some(prompt_id.clone()),
            });
        let (tx, rx) = oneshot::channel();
        let prompt_client_identifier = arguments
            .meta
            .as_ref()
            .and_then(|m| m.get("clientIdentifier"))
            .and_then(|v| v.as_str())
            .map(|s| s.to_string());
        let prompt_screen_mode = arguments
            .meta
            .as_ref()
            .and_then(|m| m.get("screenMode"))
            .and_then(|v| v.as_str())
            .map(|s| s.to_string());
        let json_schema = arguments
            .meta
            .as_ref()
            .and_then(|m| m.get("outputSchema"))
            .cloned();
        if json_schema.as_ref().is_some_and(|schema| !schema.is_object()) {
            return Err(
                acp::Error::invalid_params()
                    .data("outputSchema must be a JSON object describing a JSON Schema"),
            );
        }
        handle
            .cmd_tx
            .send(SessionCommand::Prompt {
                prompt_id: prompt_id.clone(),
                prompt_blocks: arguments.prompt.clone(),
                prompt_mode,
                client_identifier: prompt_client_identifier,
                screen_mode: prompt_screen_mode,
                verbatim,
                traceparent: nofy_file_utils::trace_context::current_traceparent(),
                json_schema,
                send_now,
                admission: None,
                respond_to: tx,
                persist_ack: None,
                parsed_prompt_tx,
            })
            .map_err(|e| {
                acp::Error::internal_error()
                    .data(format!("failed to dispatch prompt to session: {e}"))
            })?;
        drop(dispatch_guard);
        self.push_roster_activity_delta(
            &arguments.session_id,
            crate::agent::roster::RosterActivity::Working,
        );
        let stop_result = rx
            .await
            .map_err(|_| {
                acp::Error::internal_error().data("session failed to respond")
            })?;
        let last_turn_usage_for_meta = handle
            .chat_state_handle
            .get_last_turn_usage()
            .await;
        if matches!(
            stop_result,
            Ok(crate::session::commands::PromptTurnOk {
                completion_kind: crate::session::commands::PromptCompletionKind::RemovedFromQueue,
                ..
            })
        ) {
            return Ok(
                acp::PromptResponse::new(acp::StopReason::Cancelled)
                    .meta(
                        build_prompt_response_meta(PromptResponseMetaArgs {
                                session_id: &arguments.session_id.to_string(),
                                prompt_id: &prompt_id,
                                total_tokens: 0,
                                model_id: &model,
                                last_turn_usage: None,
                                prompt_usage: None,
                                cancellation_category: None,
                                cancel_trigger: None,
                                structured_output: None,
                            })
                            .as_object()
                            .cloned(),
                    ),
            );
        }
        let cancel_trigger: Option<String> = stop_result
            .as_ref()
            .ok()
            .and_then(|ok| match &ok.completion_kind {
                crate::session::commands::PromptCompletionKind::Cancelled {
                    context: Some(ctx),
                    ..
                } => ctx.trigger.clone(),
                _ => None,
            });
        let cancellation_category: Option<String> = stop_result
            .as_ref()
            .ok()
            .and_then(|ok| ok.completion_kind.cancellation_category_meta());
        {
            let mapped = stop_result
                .as_ref()
                .map(|ok| ok.stop_reason)
                .map_err(Clone::clone);
            let (stop_reason_value, agent_result_value) = crate::sampling::error::prompt_complete_fields(
                &mapped,
            );
            let turn_id = arguments
                .meta
                .as_ref()
                .and_then(|m| m.get("turnId"))
                .and_then(|v| v.as_u64());
            let mut payload = serde_json::json!({
                "sessionId": arguments.session_id.to_string(),
                "promptId": prompt_id.as_str(),
                "stopReason": stop_reason_value,
                "agentResult": agent_result_value,
            });
            if let Some(tid) = turn_id {
                payload["turnId"] = serde_json::json!(tid);
            }
            if let Some(ref t) = cancel_trigger {
                payload["cancelTrigger"] = serde_json::json!(t);
            }
            if let Some(ref c) = cancellation_category {
                payload["cancellationCategory"] = serde_json::json!(c);
            }
            let params = serde_json::value::to_raw_value(&payload)
                .expect("prompt_complete params serialization");
            self.gateway
                .forward_fire_and_forget(
                    acp::ExtNotification::new(
                        "nofy/session/prompt_complete",
                        params.into(),
                    ),
                );
        }
        {
            let end_activity = if handle
                .pending_interactions
                .lock()
                .map(|g| !g.is_empty())
                .unwrap_or(false)
            {
                crate::agent::roster::RosterActivity::NeedsInput
            } else {
                crate::agent::roster::RosterActivity::Idle
            };
            self.push_roster_activity_delta(&arguments.session_id, end_activity);
        }
        // Harness trace turns were only consumed by the removed trace-upload
        // pipeline; keep draining so the chat-state buffer cannot grow unbounded.
        {
            let (tx, rx) = oneshot::channel();
            if handle
                .cmd_tx
                .send(SessionCommand::TakeHarnessTraceTurns {
                    respond_to: tx,
                })
                .is_ok()
            {
                let _ = rx.await;
            }
        }
        match stop_result {
            Ok(turn_ok) => {
                let crate::session::commands::PromptTurnOk {
                    stop_reason,
                    total_tokens,
                    turn_snapshot,
                    // Category already derived from `stop_result` above, shared
                    // with the `prompt_complete` broadcast rail.
                    completion_kind: _,
                    structured_output,
                    usage: prompt_usage,
                } = turn_ok;
                // Permission events only fed the removed trace-upload pipeline;
                // keep draining so the per-session buffer cannot grow unbounded.
                let _ = self.collect_permission_events(&arguments.session_id);
                let last_turn_usage = last_turn_usage_for_meta;
                Ok(
                    acp::PromptResponse::new(stop_reason)
                        .meta(
                            build_prompt_response_meta(PromptResponseMetaArgs {
                                    session_id: &arguments.session_id.to_string(),
                                    prompt_id: &prompt_id,
                                    total_tokens,
                                    model_id: &model,
                                    last_turn_usage: last_turn_usage.as_ref(),
                                    prompt_usage,
                                    cancellation_category,
                                    cancel_trigger,
                                    structured_output,
                                })
                                .as_object()
                                .cloned(),
                        ),
                )
            }
            Err(err) => {
                let err = if crate::sampling::error::prompt_usage_from_error(&err)
                    .is_some()
                {
                    err
                } else {
                    let prompt_id = handle
                        .current_prompt_id
                        .lock()
                        .ok()
                        .and_then(|g| g.clone());
                    let (tx, rx) = tokio::sync::oneshot::channel();
                    let usage = if handle
                        .cmd_tx
                        .send(crate::session::commands::SessionCommand::ErrorPathUsageFallback {
                            prompt_id,
                            respond_to: tx,
                        })
                        .is_ok()
                    {
                        rx.await.ok().flatten()
                    } else {
                        None
                    };
                    crate::sampling::error::attach_prompt_usage(err, usage)
                };
                Err(err)
            }
        }
    }
    async fn cancel(&self, args: acp::CancelNotification) -> Result<(), acp::Error> {
        tracing::info!("Received cancel request {args:?}");
        let handle = self.session_handle_waiting_for_load(&args.session_id).await;
        let cancel_trigger = args
            .meta
            .as_ref()
            .and_then(|m| m.get("cancelTrigger"))
            .and_then(|v| v.as_str())
            .map(crate::session::CancelTrigger::from_client);
        nofy_telemetry::unified_log::info(
            "shell.cancel.received",
            Some(args.session_id.0.as_ref()),
            Some(
                serde_json::json!({
                "session_found": handle.is_some(),
                "trigger": cancel_trigger.as_ref().map(crate::session::CancelTrigger::as_str),
            }),
            ),
        );
        if let Some(handle) = handle {
            let cancel_subagents = args
                .meta
                .as_ref()
                .and_then(|m| m.get("cancelSubagents"))
                .and_then(|v| v.as_bool())
                .unwrap_or(true);
            let rewind_if_no_output = args
                .meta
                .as_ref()
                .and_then(|m| {
                    m.get("rewindIfNoOutput").or_else(|| m.get("rewindIfPristine"))
                })
                .and_then(|v| v.as_bool())
                .unwrap_or(false);
            let dispatch_lock = self.dispatch_lock(&args.session_id);
            let _dispatch_guard = dispatch_lock.lock().await;
            let _ = handle
                .cmd_tx
                .send(
                    SessionCommand::Cancel(crate::session::CancelOptions {
                        cancel_subagents,
                        rewind_if_no_output,
                        trigger: cancel_trigger,
                        user_initiated: true,
                        ..Default::default()
                    }),
                );
        }
        Ok(())
    }
    async fn set_session_mode(
        &self,
        args: acp::SetSessionModeRequest,
    ) -> Result<acp::SetSessionModeResponse, acp::Error> {
        tracing::info!("Received set session mode request {args:?}");
        let handle = self.session_handle_waiting_for_load(&args.session_id).await;
        let (tx, rx) = oneshot::channel();
        if let Some(handle) = handle {
            let _ = handle
                .cmd_tx
                .send(SessionCommand::SessionMode {
                    session_mode: args.mode_id,
                    responds_to: tx,
                });
        }
        let _ = rx
            .await
            .map_err(|_| {
                acp::Error::internal_error().data("response to set session failed")
            })?;
        Ok(acp::SetSessionModeResponse::new())
    }
    async fn set_session_model(
        &self,
        args: acp::SetSessionModelRequest,
    ) -> Result<acp::SetSessionModelResponse, acp::Error> {
        let model = self.resolve_model_id(&args.model_id)?;
        if !model.info.user_selectable {
            return Err(acp::Error::invalid_params()
                .data(self.models_manager.allowlist_denied_message()));
        }
        let session_id = args.session_id.clone();
        let res = crate::agent::handlers::model_switch::apply(self, args).await;
        if res.is_ok()
            && let Some(unavailable) = self
                .session_registry
                .take_unavailable_model(&session_id)
        {
            tracing::info!(
                session_id = %session_id.0,
                previously_unavailable_model = %unavailable.0,
                "set_session_model: user model switch cleared the model-unavailable block"
            );
        }
        res
    }
    #[tracing::instrument(
        name = "agent.ext_method",
        skip_all,
        fields(method = %args.method)
    )]
    async fn ext_method(
        &self,
        args: acp::ExtRequest,
    ) -> Result<acp::ExtResponse, acp::Error> {
        let request_meta = serde_json::from_str::<serde_json::Value>(args.params.get())
            .ok()
            .and_then(|v| v.get("_meta").cloned());
        if let Some(meta) = &request_meta {
            nofy_file_utils::trace_context::link_current_span_to_meta(meta);
        }
        tracing::info!("Received extension method call: method={}", args.method);
        #[allow(unused_mut)]
        let mut backend_no_bridge_err: Option<acp::Error> = None;
        let method = args.method.clone();
        let result = match method.as_ref() {
            "nofy/getApiKey" | "nofy/setApiKey" => {
                crate::extensions::auth::handle(self, &args).await
            }
            "nofy/session/info" | "nofy/session/close" | "nofy/session/list"
            | "nofy/sessions/list" => {
                crate::agent::handlers::session::handle(self, &args).await
            }
            "nofy/session/updates" => {
                crate::extensions::session_updates::handle(&args, &self.gateway).await
            }
            "nofy/session/state" => {
                crate::extensions::session_state::handle_state(&args).await
            }
            "nofy/session/import" => {
                crate::extensions::session_state::handle_import(&args).await
            }
            "nofy/session/load_history" => {
                crate::extensions::chat_conversation_history::handle(self, &args).await
            }
            "nofy/session/search" => {
                crate::extensions::session_search::handle(&args).await
            }
            "nofy/session/resolve_local_for_worktree_resume"
            | "nofy/session/rehydrate" => {
                let ops = self.resolve_workspace_ops()?;
                crate::extensions::worktree::handle(self, &ops, &args).await
            }
            #[cfg(feature = "local-workspace")]
            "nofy/session/add_local_workspace" => {
                crate::extensions::session_admin::handle(self, &args).await
            }
            "nofy/session/rename" | "nofy/session/delete"
            | "nofy/session/update_mcp_servers" | "nofy/session/fork"
            | "nofy/plugins/reload" | "nofy/commands/list" => {
                crate::extensions::session_admin::handle(self, &args).await
            }
            m if InternalMethod::from_name(m).is_some() => {
                crate::extensions::session_admin::handle(self, &args).await
            }
            "nofy/session/repair" => crate::extensions::repair::handle(self, &args).await,
            "nofy/session/usage" => crate::extensions::usage::handle(self, &args).await,
            "nofy/memory/flush" | "nofy/memory/rewrite" | "nofy/memory/remember" => {
                crate::extensions::memory::handle(self, &args).await
            }
            "nofy/skills/refresh-baseline" => {
                self.refresh_skill_baseline_for_all_sessions();
                crate::extensions::to_ext_response(
                    Ok(serde_json::json!({"ok": true})),
                )
            }
            "nofy/interject" => crate::extensions::interject::handle(self, &args).await,
            "nofy/btw" => crate::extensions::btw::handle(self, &args).await,
            "nofy/recap" => crate::extensions::recap::handle(self, &args).await,
            "nofy/rollout/survey" => {
                crate::extensions::rollout::handle(self, &args).await
            }
            "nofy/prompt_history" => {
                crate::extensions::prompt_history::handle(self, &args).await
            }
            "nofy/suggest" => crate::extensions::suggest::handle(self, &args).await,
            "nofy/suggestPrompt" => crate::extensions::suggest::handle(self, &args).await,
            s if s.starts_with("nofy/auth/") => {
                crate::extensions::auth::handle(self, &args).await
            }
            s if s.starts_with("nofy/session_summaries/") => {
                crate::agent::handlers::session::handle(self, &args).await
            }
            s if s.starts_with("nofy/git/worktree/") => {
                let ops = self.resolve_workspace_ops()?;
                crate::extensions::worktree::handle(self, &ops, &args).await
            }
            s if s.starts_with("nofy/git/") => {
                let ops = self.resolve_workspace_ops()?;
                crate::extensions::git::handle(self, &ops, &args).await
            }
            s if s.starts_with("nofy/compact_conversation") => {
                crate::extensions::memory::handle(self, &args).await
            }
            s if s.starts_with("nofy/plugins/") => {
                crate::extensions::plugins::handle(self, &args).await
            }
            s if s.starts_with("nofy/marketplace/") => {
                crate::extensions::marketplace::handle(self, &args).await
            }
            s if s.starts_with("nofy/hooks/") => {
                crate::extensions::hooks::handle(self, &args).await
            }
            s if s.starts_with("nofy/hunk-tracker/") => {
                let ops = self.resolve_workspace_ops()?;
                crate::extensions::hunk_tracker::handle(self, &ops, &args).await
            }
            s if s.starts_with("nofy/pr/") => {
                crate::extensions::pr::handle(self, &args).await
            }
            s if s.starts_with(crate::extensions::mcp::mcp_methods::PREFIX) => {
                crate::extensions::mcp::handle(self, &args).await
            }
            s if s.starts_with("nofy/task/") => {
                crate::extensions::task::handle(self, &args).await
            }
            s if s.starts_with("nofy/scheduler/") => {
                crate::extensions::task::handle_scheduler(self, &args).await
            }
            s if s.starts_with("nofy/subagent/") => {
                crate::extensions::task::handle_subagent(self, &args).await
            }
            s if s.starts_with("nofy/terminal/") => {
                crate::extensions::terminal::handle(self, &args).await
            }
            s if crate::extensions::fs::is_fs_method(s) => {
                crate::extensions::fs::handle(self, &args).await
            }
            s if s.starts_with("nofy/search/") => {
                crate::extensions::search::handle(self, &args).await
            }
            s if s.starts_with("nofy/bundle/") => {
                crate::extensions::bundle::handle(self, &args).await
            }
            s if s.starts_with("nofy/code/") => {
                let ops = self.resolve_workspace_ops()?;
                crate::extensions::code_nav::handle(self, &ops, &args).await
            }
            s if s.starts_with("nofy/skills/") || s == "nofy/workflows/list" => {
                let compat = self.cfg.borrow().compat_resolved;
                crate::extensions::skills::handle(
                        self,
                        &args,
                        self.plugin_registry_handle.snapshot().as_deref(),
                        compat,
                    )
                    .await
            }
            s if s.starts_with("nofy/debug/") => {
                crate::extensions::debug::handle(self, &args).await
            }
            s if s.starts_with("nofy/rewind") => {
                crate::extensions::rewind::handle(self, &args).await
            }
            other => {
                Err(
                    acp::Error::method_not_found()
                        .data(format!("unknown ACP extension method: {other}")),
                )
            }
        };
        if let Some(err) = backend_no_bridge_err
            && matches!(&result, Err(e) if e.code == acp::Error::method_not_found().code)
        {
            return Err(err);
        }
        result
    }
    async fn ext_notification(
        &self,
        args: acp::ExtNotification,
    ) -> Result<(), acp::Error> {
        tracing::info!("Received extension notification: method={}", args.method);
        if args.method.as_ref() == "nofy/yolo_mode_changed"
            && let Ok(params) = serde_json::from_str::<
                serde_json::Value,
            >(args.params.get())
        {
            let sender_id = params.get("clientIdentifier").and_then(|v| v.as_str());
            let permission_mode = params
                .get("permission_mode")
                .and_then(|v| v.as_str())
                .unwrap_or("");
            let yolo_signal = params.get("yolo_mode").and_then(|v| v.as_bool());
            if let Some(yolo_mode) = yolo_signal {
                let mut updated_sessions = 0;
                self.session_registry
                    .for_each_resident_mut(|_, handle| {
                        updated_sessions
                            += apply_yolo_mode_to_matching_sessions(
                                std::iter::once(handle),
                                sender_id,
                                yolo_mode,
                            );
                    });
                tracing::info!(
                    yolo_mode,
                    sender = ?sender_id,
                    target_sessions = updated_sessions,
                    total_sessions = self.resident_count(),
                    "Setting YOLO mode for matching sessions"
                );
            }
            let auto_mode_explicit = params.get("auto_mode").and_then(|v| v.as_bool());
            let want_auto = auto_mode_explicit == Some(true)
                || permission_mode == "auto";
            let clear_auto = auto_mode_explicit == Some(false)
                || (matches!(permission_mode, "always-approve" | "ask" | "default")
                    && !want_auto);
            let enable_auto = want_auto && yolo_signal != Some(true);
            if enable_auto || clear_auto {
                let enabled = enable_auto;
                let matches_sender = |h: &crate::session::SessionHandle| -> bool {
                    sender_id.is_none()
                        || h.origin_client.as_ref().map(|c| c.product.as_str())
                            == sender_id
                };
                let total_sessions = self.resident_count();
                let mut updated = 0;
                self.session_registry
                    .for_each_resident_mut(|_, h| {
                        if !matches_sender(h) {
                            return;
                        }
                        if h
                            .cmd_tx
                            .send(crate::session::SessionCommand::SetAutoMode {
                                enabled,
                            })
                            .is_ok()
                        {
                            if enabled {
                                h.yolo_mode = false;
                            }
                            updated += 1;
                        }
                    });
                tracing::info!(
                    auto_mode = enabled,
                    sender = ?sender_id,
                    target_sessions = updated,
                    total_sessions,
                    "Setting auto permission mode for matching sessions"
                );
            }
        }
        if args.method.as_ref() == "nofy/permissions/reset" {
            let mut updated = 0;
            self.session_registry
                .for_each_resident(|_, h| {
                    if h
                        .cmd_tx
                        .send(crate::session::SessionCommand::ResetPermissionState)
                        .is_ok()
                    {
                        updated += 1;
                    }
                });
            tracing::info!(
                target_sessions = updated,
                total_sessions = self.resident_count(),
                "Permission state reset for matching sessions"
            );
        }
        if args.method.as_ref() == InternalMethod::EvictSessions.name() {
            self.handle_evict_sessions(&args.params).await;
        }
        if args.method.as_ref() == "nofy/toggle_plan_mode"
            && let Ok(params) = serde_json::from_str::<
                serde_json::Value,
            >(args.params.get())
        {
            let session_id_str = params
                .get("sessionId")
                .and_then(|v| v.as_str())
                .unwrap_or("");
            let handle = self.resident_handle(&acp::SessionId::new(session_id_str));
            if let Some(handle) = handle {
                let is_engaged = handle.plan_mode.lock().state()
                    != crate::session::plan_mode::PlanModeState::Inactive;
                let next_mode_id = acp::SessionModeId::new(
                    if is_engaged { "default" } else { "plan" },
                );
                let (tx, rx) = oneshot::channel();
                let _ = handle
                    .cmd_tx
                    .send(SessionCommand::SessionMode {
                        session_mode: next_mode_id.clone(),
                        responds_to: tx,
                    });
                if rx.await.is_err() {
                    tracing::warn!(
                        session_id = %session_id_str,
                        mode_id = %next_mode_id.0,
                        "toggle_plan_mode: session mode update failed"
                    );
                }
            } else {
                tracing::warn!(
                    session_id = %session_id_str,
                    "toggle_plan_mode: session not found"
                );
            }
        }
        if args.method.as_ref().starts_with("nofy/queue/")
            && let Ok(params) = serde_json::from_str::<
                serde_json::Value,
            >(args.params.get())
        {
            let owner = params
                .get("owner")
                .or_else(|| params.get("clientIdentifier"))
                .and_then(|v| v.as_str())
                .map(|s| s.to_string());
            if let Some(cmd) = crate::agent::ext_parsers::parse_queue_edit_command(
                args.method.as_ref(),
                &params,
                owner,
            ) {
                let session_id_str = params
                    .get("sessionId")
                    .and_then(|v| v.as_str())
                    .unwrap_or("");
                if let Some(handle) = self
                    .resident_handle(&acp::SessionId::new(session_id_str))
                {
                    if handle.cmd_tx.send(cmd).is_err() {
                        tracing::warn!(
                            session_id = %session_id_str,
                            method = %args.method,
                            "queue edit: failed to forward SessionCommand (session actor gone)"
                        );
                    }
                } else {
                    tracing::warn!(
                        session_id = %session_id_str,
                        method = %args.method,
                        "queue edit: session not found"
                    );
                }
            }
        }
        if args.method.as_ref() == "nofy/terminal/pty/input"
            && let Ok(params) = serde_json::from_str::<
                serde_json::Value,
            >(args.params.get())
        {
            crate::extensions::terminal::handle_pty_input(&params).await;
        }
        if args.method.as_ref() == "_nofy/session/update" {
            if let Ok(notification) = serde_json::from_str::<
                SessionNotification,
            >(args.params.get()) {
                tracing::info!(
                    "Storing xAI session notification: session_id={}",
                    notification.session_id.0
                );
                if let Some(handle) = self.resident_handle(&notification.session_id) {
                    let _ = handle
                        .cmd_tx
                        .send(crate::session::SessionCommand::XaiSessionNotification {
                            notification,
                        });
                } else {
                    tracing::warn!(
                        "Received xAI session notification for unknown session: {}",
                        notification.session_id.0
                    );
                }
            } else {
                tracing::warn!("Failed to parse xAI session notification params");
            }
        }
        if args.method.as_ref() == "nofy/telemetry/non_git_decision" {
            #[derive(serde::Deserialize)]
            struct NonGitDecisionParams {
                decision: String,
                session_id: String,
                #[serde(default)]
                client_version: Option<String>,
            }
            if let Ok(params) = serde_json::from_str::<
                NonGitDecisionParams,
            >(args.params.get()) {
                tracing::info!(
                    decision = %params.decision,
                    session_id = %params.session_id,
                    client_version = ?params.client_version,
                    "non_git_decision",
                );
                nofy_telemetry::session_ctx::log_event(nofy_telemetry::events::NonGitDecisionEvent {
                    decision: params.decision,
                    session_id: params.session_id,
                    client_version: params.client_version,
                });
            } else {
                tracing::warn!("Failed to parse non_git_decision telemetry params");
            }
        }
        if args.method.as_ref() == "nofy/telemetry/multi_agent_followup" {
            #[derive(serde::Deserialize)]
            struct MultiAgentFollowupParams {
                preferred_agent_label: char,
                preferred_agent_session_id: Option<String>,
                preferred_agent_model_id: Option<String>,
                /// (label, session_id, model_id)
                other_agents: Vec<(char, Option<String>, Option<String>)>,
            }
            if let Ok(params) = serde_json::from_str::<
                MultiAgentFollowupParams,
            >(args.params.get()) {
                tracing::info!(
                    "Logging multi-agent followup telemetry: preferred_agent={}",
                    params.preferred_agent_label
                );
                let total_agents = 1 + params.other_agents.len();
                nofy_telemetry::session_ctx::log_event(nofy_telemetry::events::MultiAgentFollowup {
                    preferred_agent_label: params.preferred_agent_label.to_string(),
                    preferred_agent_session_id: params.preferred_agent_session_id,
                    preferred_agent_model_id: params.preferred_agent_model_id,
                    other_agents: params
                        .other_agents
                        .into_iter()
                        .map(|(l, s, m)| nofy_telemetry::events::AgentInfo {
                            label: l.to_string(),
                            session_id: s,
                            model_id: m,
                        })
                        .collect(),
                    total_agents,
                });
            } else {
                tracing::warn!("Failed to parse multi-agent followup telemetry params");
            }
        }
        if args.method.as_ref() == "nofy/telemetry/multi_agent_apply" {
            #[derive(serde::Deserialize)]
            struct MultiAgentApplyParams {
                applied_agent_label: char,
                applied_agent_session_id: Option<String>,
                applied_agent_model_id: Option<String>,
                /// (label, session_id, model_id)
                discarded_agents: Vec<(char, Option<String>, Option<String>)>,
            }
            if let Ok(params) = serde_json::from_str::<
                MultiAgentApplyParams,
            >(args.params.get()) {
                tracing::info!(
                    "Logging multi-agent apply telemetry: applied_agent={}",
                    params.applied_agent_label
                );
                let total_agents = 1 + params.discarded_agents.len();
                nofy_telemetry::session_ctx::log_event(nofy_telemetry::events::MultiAgentApply {
                    applied_agent_label: params.applied_agent_label.to_string(),
                    applied_agent_session_id: params.applied_agent_session_id,
                    applied_agent_model_id: params.applied_agent_model_id,
                    discarded_agents: params
                        .discarded_agents
                        .into_iter()
                        .map(|(l, s, m)| nofy_telemetry::events::AgentInfo {
                            label: l.to_string(),
                            session_id: s,
                            model_id: m,
                        })
                        .collect(),
                    total_agents,
                });
            } else {
                tracing::warn!("Failed to parse multi-agent apply telemetry params");
            }
        }
        if args.method.as_ref() == "nofy/telemetry/multi_agent_discard" {
            #[derive(serde::Deserialize)]
            struct MultiAgentDiscardParams {
                /// (label, session_id, model_id)
                discarded_agents: Vec<(char, Option<String>, Option<String>)>,
            }
            if let Ok(params) = serde_json::from_str::<
                MultiAgentDiscardParams,
            >(args.params.get()) {
                tracing::info!(
                    "Logging multi-agent discard telemetry: {} agents discarded",
                    params.discarded_agents.len()
                );
                let total = params.discarded_agents.len();
                nofy_telemetry::session_ctx::log_event(nofy_telemetry::events::MultiAgentDiscard {
                    discarded_agents: params
                        .discarded_agents
                        .into_iter()
                        .map(|(l, s, m)| nofy_telemetry::events::AgentInfo {
                            label: l.to_string(),
                            session_id: s,
                            model_id: m,
                        })
                        .collect(),
                    total_agents_discarded: total,
                });
            } else {
                tracing::warn!("Failed to parse multi-agent discard telemetry params");
            }
        }
        if args.method.as_ref() == nofy_telemetry::unified_log::LOG_METHOD
            && let Ok(params) = serde_json::from_str::<
                nofy_telemetry::unified_log::LogNotificationParams,
            >(args.params.get())
        {
            nofy_telemetry::unified_log::ingest_client_entries(
                params.src,
                &params.entries,
            );
        }
        Ok(())
    }
}
