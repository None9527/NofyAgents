//! Session-local context-window selection, using catalog choices only.
use crate::app::actions::Action;
use crate::slash::command::{AppCtx, ArgItem, CommandExecCtx, CommandResult, SlashCommand};

pub struct ContextWindowCommand;

impl SlashCommand for ContextWindowCommand {
    fn name(&self) -> &str {
        "context-window"
    }
    fn description(&self) -> &str {
        "Choose the active model's context window"
    }
    fn session_scoped(&self) -> bool {
        true
    }
    fn takes_args(&self) -> bool {
        true
    }
    fn args_required(&self) -> bool {
        true
    }
    fn usage(&self) -> &str {
        "/context-window <tokens|default>"
    }
    fn arg_placeholder(&self) -> Option<&str> {
        Some("<tokens|default>")
    }
    fn suggest_args(&self, ctx: &AppCtx, _query: &str) -> Option<Vec<ArgItem>> {
        let id = ctx.models.current.as_ref()?;
        let mut items = vec![ArgItem {
            display: "Default".into(),
            match_text: "default".into(),
            insert_text: "default".into(),
            description: "Use the model's default window".into(),
        }];
        items.extend(
            ctx.models
                .context_windows_for(id)
                .into_iter()
                .map(|tokens| ArgItem {
                    display: format!(
                        "{tokens} tokens{}",
                        if ctx.models.get_context_window() == Some(tokens) {
                            " (current)"
                        } else {
                            ""
                        }
                    ),
                    match_text: tokens.to_string(),
                    insert_text: tokens.to_string(),
                    description: "Session context budget".into(),
                }),
        );
        Some(items)
    }
    fn run(&self, ctx: &mut CommandExecCtx, args: &str) -> CommandResult {
        let Some(id) = ctx.models.current.clone() else {
            return CommandResult::Error("No active model.".into());
        };
        let token = args.trim();
        let selection = if token.eq_ignore_ascii_case("default") {
            None
        } else {
            let Some(tokens) = parse_window(token)
                .filter(|tokens| ctx.models.context_windows_for(&id).contains(tokens))
            else {
                return CommandResult::Error(
                    "Choose an advertised context window, or default.".into(),
                );
            };
            Some(tokens)
        };
        CommandResult::Action(Action::SwitchModelContext {
            model_id: id,
            effort: ctx.models.reasoning_effort,
            context_window: selection,
        })
    }
}

pub(super) fn parse_window(token: &str) -> Option<u64> {
    let token = token.trim().to_ascii_lowercase();
    let (number, scale) = if let Some(number) = token.strip_suffix('k') {
        (number, 1_000)
    } else if let Some(number) = token.strip_suffix('m') {
        (number, 1_000_000)
    } else {
        (token.as_str(), 1)
    };
    number
        .replace('_', "")
        .parse::<u64>()
        .ok()?
        .checked_mul(scale)
        .filter(|tokens| *tokens > 0)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn context_window_tokens_are_positive_and_overflow_checked() {
        assert_eq!(parse_window("256k"), Some(256000));
        assert_eq!(parse_window("1M"), Some(1000000));
        assert_eq!(parse_window("128_000"), Some(128000));
        assert_eq!(parse_window("0"), None);
        assert_eq!(parse_window("-1"), None);
        assert_eq!(parse_window("18446744073709551615m"), None);
    }
}
