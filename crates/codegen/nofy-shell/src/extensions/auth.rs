//! `nofy/auth/*` and legacy `nofy/{get,set}ApiKey` extension handlers.
//!
//! These methods let the client read/write the API key via the agent.
//! The agent is the single source of truth for `auth.json`.

use agent_client_protocol as acp;
use serde::Serialize;

use super::{ExtResult, parse_params, to_raw_response};
use crate::agent::MvpAgent;
use crate::session::ExtMethodResult;

#[tracing::instrument(skip_all, fields(method = %args.method))]
pub async fn handle(agent: &MvpAgent, args: &acp::ExtRequest) -> ExtResult {
    match args.method.as_ref() {
        "nofy/auth/getBearerToken" => handle_get_bearer_token(agent).await,
        "nofy/getApiKey" => handle_get_api_key(),
        "nofy/setApiKey" => handle_set_api_key(args),
        "nofy/auth/info" => handle_info(agent),
        _ => Err(acp::Error::method_not_found()),
    }
}

async fn handle_get_bearer_token(agent: &MvpAgent) -> ExtResult {
    // Fail closed for session tokens: desktop resume treats non-null as success.
    // Never return a hard-expired AT. Still surface wire-valid session ATs and
    // static/BYOK keys (process model key / env / disk api_key) so non-session
    // sessions keep working when AuthManager has no OIDC entry.
    let token = match agent.auth_manager.get_valid_token().await {
        Ok(token) => Some(token),
        Err(_) => agent
            .auth_manager
            .current_wire_valid()
            .map(|a| a.key)
            .or_else(|| agent.auth_manager.static_api_key_for_export()),
    };
    ExtMethodResult::success(serde_json::json!({ "token": token }))
        .to_ext_response()
        .map_err(|e| acp::Error::internal_error().data(e.to_string()))
}

fn handle_get_api_key() -> ExtResult {
    let key = crate::agent::auth_method::read_xai_api_key_env().ok();
    ExtMethodResult::success(serde_json::json!({ "key": key }))
        .to_ext_response()
        .map_err(|e| acp::Error::internal_error().data(e.to_string()))
}

fn handle_set_api_key(args: &acp::ExtRequest) -> ExtResult {
    let params: serde_json::Value = parse_params(args)?;
    let key = params.get("key").and_then(|v| v.as_str());
    let nofy_home = crate::util::nofy_home::nofy_home();
    if let Some(k) = key {
        if k.is_empty() {
            crate::auth::clear_api_key(&nofy_home)
                .map_err(|e| acp::Error::internal_error().data(e.to_string()))?;
            // SAFETY: ext_method is single-threaded per agent
            unsafe { std::env::remove_var("NOFY_API_KEY") };
        } else {
            crate::auth::store_api_key(&nofy_home, k)
                .map_err(|e| acp::Error::internal_error().data(e.to_string()))?;
            // SAFETY: ext_method is single-threaded per agent
            unsafe { std::env::set_var("NOFY_API_KEY", k) };
        }
    } else {
        crate::auth::clear_api_key(&nofy_home)
            .map_err(|e| acp::Error::internal_error().data(e.to_string()))?;
        // SAFETY: ext_method is single-threaded per agent
        unsafe { std::env::remove_var("NOFY_API_KEY") };
    }
    ExtMethodResult::success(serde_json::json!({ "ok": true }))
        .to_ext_response()
        .map_err(|e| acp::Error::internal_error().data(e.to_string()))
}

/// Returns current auth method ID, user profile fields, and team/principal
/// metadata.
fn handle_info(agent: &MvpAgent) -> ExtResult {
    #[derive(Serialize)]
    #[serde(rename_all = "camelCase")]
    struct AuthInfoResponse {
        method_id: Option<String>,
        email: Option<String>,
        first_name: Option<String>,
        last_name: Option<String>,
        /// `nofy-asset://` URL resolved by the Electron protocol handler,
        /// or a full `http(s)://` URL passed through unchanged.
        profile_image_url: Option<String>,
        team_id: Option<String>,
        team_name: Option<String>,
        organization_id: Option<String>,
        organization_name: Option<String>,
        organization_role: Option<String>,
        principal_type: Option<String>,
        principal_id: Option<String>,
    }

    let method_id = agent
        .auth_method_id
        .load()
        .as_ref()
        .map(|m| m.0.to_string());
    let auth = agent.auth_manager.current_or_expired();
    let raw_asset_id = auth.as_ref().and_then(|a| a.profile_image_asset_id.clone());

    // Return a nofy-asset:// URL that the Electron renderer resolves at
    // display time via a custom protocol handler. The handler proxies
    // through cli-chat-proxy's /asset endpoint; Electron's HTTP cache
    // handles reuse. No disk-cache or network call needed here.
    let profile_image_url = match raw_asset_id.as_deref().filter(|k| !k.is_empty()) {
        Some(key) if key.starts_with("http://") || key.starts_with("https://") => {
            Some(key.to_owned())
        }
        Some(key) => Some(format!("nofy-asset:///{key}")),
        None => None,
    };
    to_raw_response(&AuthInfoResponse {
        method_id,
        email: auth.as_ref().and_then(|a| a.email.clone()),
        first_name: auth.as_ref().and_then(|a| a.first_name.clone()),
        last_name: auth.as_ref().and_then(|a| a.last_name.clone()),
        profile_image_url,
        team_id: auth.as_ref().and_then(|a| a.team_id.clone()),
        team_name: auth.as_ref().and_then(|a| a.team_name.clone()),
        organization_id: auth.as_ref().and_then(|a| a.organization_id.clone()),
        organization_name: auth.as_ref().and_then(|a| a.organization_name.clone()),
        organization_role: auth.as_ref().and_then(|a| a.organization_role.clone()),
        principal_type: auth.as_ref().and_then(|a| a.principal_type.clone()),
        principal_id: auth.as_ref().and_then(|a| a.principal_id.clone()),
    })
}
