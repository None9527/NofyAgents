//! Agent bootstrap and lifecycle hooks.
//!
//! [`bootstrap`] runs the full init sequence (config resolution, process
//! singletons, model catalog) and returns a resolved config + `ModelsManager`.
//! [`update_telemetry_config`] re-initializes telemetry after auth changes.

use std::sync::Arc;

use indexmap::IndexMap;

use crate::agent::config::{self, Config as AgentConfig, ModelEntry};
use crate::agent::models::ModelsManager;
use crate::auth::AuthManager;
use crate::config::StorageMode;

/// Resolve config, init process singletons, build the model catalog.
///
/// The `ModelsManager` is `Clone + Send`, so callers that need a handle
/// for the config watcher can clone it before passing it to
/// `MvpAgent::with_models`.
pub fn bootstrap(
    cfg: &AgentConfig,
    auth_manager: &Arc<AuthManager>,
    prefetched: Option<IndexMap<String, ModelEntry>>,
) -> Result<(AgentConfig, ModelsManager), String> {
    // Remote kill-switch before the gate (settings-only prefetch — no managed-config
    // sync, so a live server cannot heal a tampered policy before fail-closed).
    nofy_telemetry::startup::enter(nofy_telemetry::startup::StartupPhase::Bootstrap);
    let mut cfg = cfg.clone();
    {
        let _timer = crate::instrumentation_timer!("startup.bootstrap.remote_settings");
        ensure_remote_settings_side_effects(&mut cfg);
    }
    crate::managed_config::managed_policy_gate()?;
    let cfg = {
        let _timer = crate::instrumentation_timer!("startup.bootstrap.resolve_config");
        let cfg = resolve_config(&cfg, auth_manager);
        cfg.validate_model_filters()?;
        cfg
    };
    {
        let _timer = crate::instrumentation_timer!("startup.bootstrap.init_process");
        init_process(&cfg, auth_manager);
    }
    nofy_telemetry::startup::enter(nofy_telemetry::startup::StartupPhase::ModelCatalog);
    let models_manager = {
        let _timer = crate::instrumentation_timer!("startup.bootstrap.models_manager");
        ModelsManager::from_config(&cfg, prefetched, auth_manager.clone())?
    };


    Ok((cfg, models_manager))
}

/// Print a `bootstrap`/`MvpAgent::new` config error and exit (process boundary).
///
/// Restores native stderr first: a managed-policy refusal on the ACP/server path reaches here
/// while fd 2 may still point at the `/dev/null` the TUI's `redirect_native_stderr()` set, which
/// would swallow the message. No-op when stderr was never redirected (headless).
pub(crate) fn exit_on_config_error<T>(e: String) -> T {
    nofy_tty_utils::restore_native_stderr();
    eprintln!("\nConfiguration error:\n\n    {e}\n");
    std::process::exit(1);
}

/// Apply process-global remote side effects (signature kill-switch and caches)
/// for whatever `remote_settings` the client pre-supplied, if any. Safe to
/// call more than once.
fn ensure_remote_settings_side_effects(cfg: &mut AgentConfig) {
    crate::agent::config::apply_remote_settings_side_effects(cfg.remote_settings.as_ref());
}

/// Config transform: apply managed settings, fetch remote settings,
/// resolve storage mode.
fn resolve_config(cfg: &AgentConfig, auth_manager: &AuthManager) -> AgentConfig {
    let mut cfg = cfg.clone();

    if let Ok(layers) = crate::config::ConfigLayers::load()
        && layers.has_managed()
    {
        let origins = crate::config::config_origins(&layers);
        let managed_keys: Vec<&str> = origins
            .iter()
            .filter(|(_, s)| matches!(s, config::ConfigSource::ManagedConfig))
            .map(|(k, _)| k.as_str())
            .collect();
        if !managed_keys.is_empty() {
            tracing::info!(keys = ?managed_keys, "managed_config.toml fields");
        }
    }

    let managed_enforced = crate::config::apply_managed_settings_features(&mut cfg);
    let requirements_enforced = crate::config::apply_requirements(&mut cfg);

    for e in managed_enforced.iter().chain(&requirements_enforced) {
        tracing::info!(field = %e.path, value = %e.value, source = %e.source, "policy override");
    }

    // Idempotent: bootstrap may already have fetched + applied side effects for the gate.
    // Full prefetch (with managed-config sync when stale) is allowed after the gate.
    ensure_remote_settings_side_effects(&mut cfg);
    crate::util::config::sync_campaign_fields(&mut cfg);

    // env var > remote settings > Local. Skip remote settings for Generic (nofy -p, subagents).
    let has_xai_auth = auth_manager.current().is_some_and(|a| a.is_xai_auth());
    if cfg.storage_mode == StorageMode::Local
        && cfg.mode != crate::agent::config::AgentMode::Generic
    {
        cfg.storage_mode =
            StorageMode::from_remote_gated(cfg.remote_settings.as_ref(), has_xai_auth);
    }
    // A CLI/env-set Writeback still requires nofy.com auth.
    if cfg.storage_mode == StorageMode::Writeback && !has_xai_auth {
        tracing::info!("Writeback is disabled: requires auth with nofy.com");
        cfg.storage_mode = StorageMode::Local;
    }

    if let Some(rs) = cfg.remote_settings.as_ref()
        && let Some(v) = rs.path_not_found_hints
    {
        cfg.path_not_found_hints = v;
    }

    cfg
}

/// Initialize process-level singletons (deployment sync, built-in metadata,
/// telemetry). `Once`-guarded: only the first call takes effect.
/// Telemetry user ID is updated separately via [`update_telemetry_config`].
fn init_process(cfg: &AgentConfig, auth_manager: &AuthManager) {
    use std::sync::Once;
    static INIT: Once = Once::new();
    INIT.call_once(|| {
        // Every agent mode (stdio/headless/leader and the in-process TUI
        // agent) passes through here, so diagnostic uploads always carry
        // the version stamp and the resource ceilings in effect.
        nofy_telemetry::unified_log::set_version(nofy_version::VERSION);
        let limits = crate::util::limits::ProcessLimits::read();
        limits.log();

        if !cfg!(test) {
            // Clear a logged-out team's files before the background sync runs.
            crate::managed_config::clear_orphan();
            crate::managed_config::spawn_sync(tokio_util::sync::CancellationToken::new());
        }

        let nofy_home = crate::util::nofy_home::nofy_home();
        crate::builtin::extract_builtin_files(&nofy_home);

        crate::extensions::marketplace::purge_default_skills_installs(&nofy_home);

        // At boot remote_settings may still be None (fetches are backgrounded),
        // so only an env opt-in fires here; the gate is re-evaluated once
        // settings arrive (see `MvpAgent::reapply_official_marketplace`).
        if cfg.resolve_official_marketplace_auto_register().value {
            crate::extensions::marketplace::ensure_official_marketplace_source(&nofy_home);
        }

        let telemetry_mode = cfg.resolve_telemetry_mode();
        let trace_upload = cfg.resolve_trace_upload();
        let feedback = cfg.resolve_feedback();
        let feedback_url = cfg.endpoints.resolve_feedback_base_url();
        let trace_upload_url = cfg.endpoints.resolve_trace_upload_url();
        tracing::info!(
            telemetry = %telemetry_mode,
            trace_upload = %trace_upload,
            feedback = %feedback,
            feedback_url = %feedback_url,
            feedback_url_custom = cfg.endpoints.feedback_base_url.is_some(),
            trace_upload_url = %trace_upload_url,
            trace_upload_url_custom = cfg.endpoints.trace_upload_url.is_some(),
            trace_upload_bucket = cfg.endpoints.trace_upload_bucket.as_deref().unwrap_or("none"),
            trace_upload_region = cfg.endpoints.trace_upload_region.as_deref().unwrap_or("none"),
            "data capture config resolved",
        );
        if telemetry_mode.value.is_disabled() && trace_upload.value {
            tracing::info!(
                "Telemetry disabled but trace uploads enabled: \
                 session artifacts will be uploaded, analytics events will not"
            );
        }
        update_telemetry_config(cfg, auth_manager);
        // Emitted here: the event needs the client update_telemetry_config installs.
        nofy_telemetry::session_ctx::log_event(limits.into_event());
    });
}

/// Apply current telemetry config + auth identity. Tears down the client
/// when telemetry is disabled, so it's safe to call repeatedly.
pub fn update_telemetry_config(config: &AgentConfig, auth_manager: &AuthManager) {
    let nofy_auth = auth_manager.current().filter(|a| a.is_xai_auth());
    let user_id = nofy_auth.as_ref().map(|a| a.user_id.clone());
    let team_id = nofy_auth.as_ref().and_then(|a| a.team_id.clone());
    let subscription_tier = super::mvp_agent::resolve_subscription_tier_for_telemetry(
        config
            .remote_settings
            .as_ref()
            .and_then(|rs| rs.subscription_tier_display.clone()),
    );
    nofy_telemetry::client::init(
        config.telemetry.clone(),
        config.resolve_telemetry_mode().value,
        user_id,
        team_id,
        config.endpoints.deployment_key.clone(),
        crate::http::origin_client_info_from_env(),
        nofy_version::VERSION.to_owned(),
        subscription_tier,
        crate::http::shared_client(),
    );
}
