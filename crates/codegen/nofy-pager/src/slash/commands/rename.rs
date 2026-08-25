//! `/rename` (alias `/title`) -- rename the current session.

use crate::app::actions::Action;
use crate::slash::command::{CommandExecCtx, CommandResult, SlashCommand};

/// Rename the current session's title/summary.
pub struct RenameCommand;

impl SlashCommand for RenameCommand {
    fn name(&self) -> &str {
        "rename"
    }

    fn aliases(&self) -> &[&str] {
        &["title"]
    }

    fn description(&self) -> &str {
        "Rename the current session, or /rename --auto to restore auto titling"
    }

    fn session_scoped(&self) -> bool {
        true
    }

    fn usage(&self) -> &str {
        "/rename <title> | --auto"
    }

    fn takes_args(&self) -> bool {
        true
    }

    fn args_required(&self) -> bool {
        true
    }

    fn arg_placeholder(&self) -> Option<&str> {
        Some("<title>")
    }

    fn run(&self, ctx: &mut CommandExecCtx, args: &str) -> CommandResult {
        if ctx.session_id.is_none() {
            return CommandResult::Error("No active session".to_string());
        }

        // `/rename --auto` unpins the manual title and reopens auto titling.
        if is_auto_verb(args) {
            return CommandResult::Action(Action::RenameSession {
                title: String::new(),
                reset_to_auto: true,
            });
        }
        if auto_verb_has_trailing_text(args) {
            return CommandResult::Error("--auto takes no title".to_string());
        }

        let title = args.trim().to_string();
        if title.is_empty() {
            return CommandResult::Error("Usage: /rename <new title> | --auto".to_string());
        }

        CommandResult::Action(Action::RenameSession {
            title,
            reset_to_auto: false,
        })
    }
}

fn is_auto_verb(args: &str) -> bool {
    args.trim() == "--auto"
}

fn auto_verb_has_trailing_text(args: &str) -> bool {
    args.trim()
        .strip_prefix("--auto")
        .is_some_and(|rest| rest.starts_with(char::is_whitespace))
}
