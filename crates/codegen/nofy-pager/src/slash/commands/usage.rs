//! `/usage` — session token/cost.
//!
//! Sanitized build: the former `manage` branch opened the vendor's consumer
//! billing page; billing belongs to the removed xAI account system, so only
//! the local session-usage view remains. External-auth deployments
//! (`auth_provider_command`) still hide the command entirely via
//! [`AppCtx::usage_command_visible`].

use crate::app::actions::Action;
use crate::slash::command::{AppCtx, CommandExecCtx, CommandResult, SlashCommand};
use agent_client_protocol as acp;

pub struct UsageCommand;

/// Detect external-auth installs once at pager startup.
pub(crate) fn detect_external_auth_provider(auth_methods: &[acp::AuthMethod]) -> bool {
    auth_methods.iter().any(auth_method_is_external_provider)
        || auth_provider_env_set()
        || auth_provider_config_set()
}

fn auth_method_is_external_provider(method: &acp::AuthMethod) -> bool {
    method
        .meta()
        .as_ref()
        .and_then(|v| v.get("external_provider"))
        .and_then(|v| v.as_bool())
        .unwrap_or(false)
}

fn auth_provider_env_set() -> bool {
    std::env::var("NOFY_AUTH_PROVIDER_COMMAND")
        .ok()
        .is_some_and(|s| !s.trim().is_empty())
}

fn auth_provider_config_set() -> bool {
    let Ok(raw) = nofy_shell::config::load_effective_config() else {
        return false;
    };
    let Ok(cfg) = nofy_shell::agent::config::Config::new_from_toml_cfg(&raw) else {
        return false;
    };
    cfg.nofy_com_config
        .auth_provider_command
        .as_deref()
        .is_some_and(|s| !s.trim().is_empty())
}

impl SlashCommand for UsageCommand {
    fn name(&self) -> &str {
        "usage"
    }

    fn aliases(&self) -> &[&str] {
        &["cost"]
    }

    fn description(&self) -> &str {
        "View usage"
    }

    fn usage(&self) -> &str {
        "/usage"
    }

    fn takes_args(&self) -> bool {
        false
    }

    fn visible(&self, ctx: &AppCtx) -> bool {
        ctx.usage_command_visible
    }

    fn run(&self, ctx: &mut CommandExecCtx, args: &str) -> CommandResult {
        if !ctx.usage_command_visible {
            return CommandResult::Error("/usage is not available.".into());
        }
        let arg = args.trim();
        match arg {
            "" | "show" => CommandResult::Action(Action::ShowUsage),
            _ => CommandResult::Error(format!("Unknown argument: {arg}. Use /usage")),
        }
    }
}
