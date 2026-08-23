//! `/usage` — session token/cost.
//!
//! Sanitized build: the former `manage` branch opened the vendor's consumer
//! billing page; billing belongs to the removed xAI account system, so only
//! the local session-usage view remains.

use crate::app::actions::Action;
use crate::slash::command::{CommandExecCtx, CommandResult, SlashCommand};

pub struct UsageCommand;

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

    fn run(&self, _ctx: &mut CommandExecCtx, args: &str) -> CommandResult {
        let arg = args.trim();
        match arg {
            "" | "show" => CommandResult::Action(Action::ShowUsage),
            _ => CommandResult::Error(format!("Unknown argument: {arg}. Use /usage")),
        }
    }
}
