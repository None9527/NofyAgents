//! `/model` (alias `/m`) — switch model + (optionally) reasoning effort.
//! Chained autocomplete: pick a reasoning-supported model → trailing space
//! re-opens the dropdown into a `low|medium|high|xhigh` sub-menu.

use agent_client_protocol as acp;
use nofy_shell::sampling::types::supports_reasoning_effort_meta;

use crate::acp::model_state::ModelState;
use crate::app::actions::Action;
use crate::slash::command::{AppCtx, ArgItem, CommandExecCtx, CommandResult, SlashCommand};
use crate::slash::commands::effort_levels::build_effort_arg_items;

/// Switch the active model (and optionally its reasoning effort).
pub struct ModelCommand;

impl SlashCommand for ModelCommand {
    fn name(&self) -> &str {
        "model"
    }

    fn aliases(&self) -> &[&str] {
        &["m"]
    }

    fn description(&self) -> &str {
        "Switch the active model"
    }

    fn session_scoped(&self) -> bool {
        true
    }

    fn offered_when_session_less(&self) -> bool {
        // The dashboard offers `/model` to pick the model for the next
        // spawned agent (intercepted in `dispatch_dashboard_dispatch_slash`).
        true
    }

    fn usage(&self) -> &str {
        "/model <name> [window] [effort]"
    }

    fn takes_args(&self) -> bool {
        true
    }

    fn args_required(&self) -> bool {
        true
    }

    fn arg_placeholder(&self) -> Option<&str> {
        Some("<model> [window] [effort]")
    }

    fn suggest_args(&self, ctx: &AppCtx, args_query: &str) -> Option<Vec<ArgItem>> {
        if ctx.models.is_empty() {
            return None;
        }

        if let Some((model_id, remainder)) = detect_window_phase(ctx.models, args_query) {
            let first = remainder.split_whitespace().next().unwrap_or("");
            if let Some(window) = super::context_window::parse_window(first)
                && ctx.models.context_windows_for(&model_id).contains(&window)
                && remainder.ends_with(char::is_whitespace)
                && !ctx
                    .models
                    .reasoning_effort_options_for(&model_id)
                    .is_empty()
            {
                return Some(build_window_effort_items(ctx.models, &model_id, window));
            }
            if remainder.trim().is_empty() || super::context_window::parse_window(first).is_some() {
                if let Some(window) = super::context_window::parse_window(first)
                    && remainder.split_whitespace().count() > 1
                    && ctx.models.context_windows_for(&model_id).contains(&window)
                {
                    return Some(build_window_effort_items(ctx.models, &model_id, window));
                }
                return Some(build_window_items(ctx.models, &model_id));
            }
        }
        // Legacy effort-only input stays accepted.
        if let Some(model_id) = detect_effort_phase(ctx.models, args_query) {
            return Some(build_effort_items(ctx.models, &model_id));
        }
        Some(build_model_items(ctx.models))
    }

    fn run(&self, ctx: &mut CommandExecCtx, args: &str) -> CommandResult {
        let trimmed = args.trim();
        if trimmed.is_empty() {
            return CommandResult::Error("Usage: /model <name> [effort]".into());
        }

        // Prefer an exact full-string catalog match first. Model display names
        // often contain spaces ("Nofy 4.5"); if we split on the last token
        // first, a shorter catalog entry ("Nofy") would steal the prefix and
        // treat "4.5" as an effort level.
        if let Some(id) = ctx.models.resolve_by_name_or_id(trimmed) {
            return CommandResult::Action(Action::SetDefaultModel(id));
        }

        if let Some((id, remainder)) = detect_window_phase(ctx.models, trimmed) {
            let mut parts = remainder.split_whitespace();
            if let Some(first) = parts.next()
                && let Some(window) = super::context_window::parse_window(first)
            {
                if !ctx.models.context_windows_for(&id).contains(&window) {
                    return CommandResult::Error(
                        "This model does not offer that context window.".into(),
                    );
                }
                if ctx.session_id.is_none() {
                    return CommandResult::Error(
                        "Start a session before choosing a context window.".into(),
                    );
                }
                let effort = match parts.next() {
                    Some(token) => match ctx.models.resolve_effort_for_model(&id, token) {
                        Ok(effort) => Some(effort),
                        Err(error) => return CommandResult::Error(error.message()),
                    },
                    None => None,
                };
                if parts.next().is_some() {
                    return CommandResult::Error("Usage: /model <name> [window] [effort]".into());
                }
                return CommandResult::Action(Action::SwitchModelContext {
                    model_id: id,
                    effort,
                    context_window: Some(window),
                });
            }
        }

        // Trailing effort token + reasoning model → session-scoped switch
        // (not persisted as default). Resolve via the shared gate so a rejected
        // level (e.g. `none` on grok-4.5) surfaces the effort error with the
        // model's offered ids — not "Unknown model: … none".
        if let Some((prefix, token)) = split_trailing_token(trimmed)
            && let Some(id) = resolve_model(ctx.models, prefix)
            && ctx
                .models
                .available
                .get(&id)
                .map(supports_reasoning_effort)
                .unwrap_or(false)
        {
            return match ctx.models.resolve_effort_for_model(&id, token) {
                Ok(effort) => CommandResult::Action(Action::SwitchModel {
                    model_id: id,
                    effort: Some(effort),
                }),
                Err(err) => CommandResult::Error(err.message()),
            };
        }

        CommandResult::Error(format!("Unknown model: {trimmed}"))
    }
}

/// Look up a model by case-insensitive display name OR model id match.
fn resolve_model(models: &ModelState, name: &str) -> Option<acp::ModelId> {
    models.resolve_by_name_or_id(name)
}

fn supports_reasoning_effort(info: &acp::ModelInfo) -> bool {
    supports_reasoning_effort_meta(info.meta.as_ref())
}

/// Split `args` into `(prefix, last_token)` on the final whitespace run.
/// Returns `None` when there is no interior whitespace to split on. The token is
/// resolved to an effort against the picked model's options by the caller.
fn split_trailing_token(args: &str) -> Option<(&str, &str)> {
    let (prefix, last) = args.rsplit_once(char::is_whitespace)?;
    let prefix = prefix.trim_end();
    if prefix.is_empty() || last.is_empty() {
        return None;
    }
    Some((prefix, last))
}

/// Returns the matched model id when `args_query` is `"<reasoning-model> ..."`.
/// Longest-name-first to disambiguate names that share a prefix.
fn detect_effort_phase(models: &ModelState, args_query: &str) -> Option<acp::ModelId> {
    let mut candidates: Vec<(&acp::ModelId, &str)> = models
        .available
        .iter()
        .filter(|(_, info)| supports_reasoning_effort(info))
        .map(|(id, info)| (id, info.name.as_str()))
        .collect();
    candidates.sort_by_key(|(_, name)| std::cmp::Reverse(name.len()));

    for (id, name) in candidates {
        if args_query.len() > name.len()
            && args_query.is_char_boundary(name.len())
            && args_query[..name.len()].eq_ignore_ascii_case(name)
            && args_query[name.len()..].starts_with(char::is_whitespace)
        {
            return Some(id.clone());
        }
    }
    None
}

/// Opening row for the model effort phase. A typed effort fragment deliberately
/// returns `None` so fuzzy-match ranking keeps control of the selection.
pub(in crate::slash) fn preselected_effort_arg(
    models: &ModelState,
    args_query: &str,
) -> Option<String> {
    if let Some((id, remainder)) = detect_window_phase(models, args_query) {
        let name = models.display_name_for(&id);
        if remainder.trim().is_empty() {
            let choices = models.context_windows_for(&id);
            let selected = models
                .get_context_window()
                .filter(|_| models.current.as_ref() == Some(&id))
                .filter(|window| choices.contains(window))
                .or_else(|| choices.first().copied())?;
            return Some(format!(
                "{name} {selected}{}",
                if models.reasoning_effort_options_for(&id).is_empty() {
                    ""
                } else {
                    " "
                }
            ));
        }
        if let Some(window) = super::context_window::parse_window(remainder.trim()) {
            let option = models.preselected_effort_option_for(&id)?;
            return Some(format!("{name} {window} {}", option.id));
        }
    }
    let model_id = detect_effort_phase(models, args_query)?;
    let model_name = models.display_name_for(&model_id);
    if !args_query.trim_end().eq_ignore_ascii_case(&model_name) {
        return None;
    }
    let option = models.preselected_effort_option_for(&model_id)?;
    Some(format!("{model_name} {}", option.id))
}

/// One row per logical model. Reasoning models get a trailing space in
/// `insert_text` so the prompt widget chains into the effort sub-menu.
fn build_model_items(models: &ModelState) -> Vec<ArgItem> {
    let current_id = models.current.as_ref();
    let mut items: Vec<ArgItem> = Vec::with_capacity(models.available.len());
    for (id, info) in &models.available {
        let is_current = current_id == Some(id);
        let supports = supports_reasoning_effort(info);

        let display = if is_current {
            format!("{} (current)", info.name)
        } else {
            info.name.clone()
        };

        // Trailing space on reasoning models: signals "more input
        // expected" to the prompt widget so Enter advances to effort
        // phase instead of submitting.
        let insert_text = if supports || models.context_windows_for(id).len() > 1 {
            format!("{} ", info.name)
        } else {
            info.name.clone()
        };

        items.push(ArgItem {
            display,
            match_text: info.name.clone(),
            insert_text,
            description: models
                .notice_for(id)
                .map(|notice| {
                    format!(
                        "{} {notice}",
                        info.description.as_deref().unwrap_or_default()
                    )
                })
                .unwrap_or_else(|| info.description.clone().unwrap_or_default()),
        });
    }
    items
}

fn detect_window_phase<'a>(models: &ModelState, query: &'a str) -> Option<(acp::ModelId, &'a str)> {
    let mut candidates: Vec<_> = models
        .available
        .iter()
        .filter(|(id, _)| models.context_windows_for(id).len() > 1)
        .flat_map(|(id, info)| [(id, info.name.as_str()), (id, id.0.as_ref())])
        .collect();
    candidates.sort_by_key(|(_, name)| std::cmp::Reverse(name.len()));
    for (id, name) in candidates {
        if query.len() > name.len()
            && query.is_char_boundary(name.len())
            && query[..name.len()].eq_ignore_ascii_case(name)
            && query[name.len()..].starts_with(char::is_whitespace)
        {
            return Some((id.clone(), &query[name.len()..]));
        }
    }
    None
}

fn build_window_items(models: &ModelState, id: &acp::ModelId) -> Vec<ArgItem> {
    let name = models.display_name_for(id);
    let effort = !models.reasoning_effort_options_for(id).is_empty();
    models
        .context_windows_for(id)
        .into_iter()
        .map(|window| ArgItem {
            display: format!(
                "{window} tokens{}",
                if models.current.as_ref() == Some(id)
                    && models.get_context_window() == Some(window)
                {
                    " (current)"
                } else {
                    ""
                }
            ),
            match_text: format!("{name} {window}"),
            insert_text: format!("{name} {window}{}", if effort { " " } else { "" }),
            description: "Context window; next choose effort".into(),
        })
        .collect()
}

fn build_window_effort_items(models: &ModelState, id: &acp::ModelId, window: u64) -> Vec<ArgItem> {
    let name = models.display_name_for(id);
    let options = models.reasoning_effort_options_for(id);
    build_effort_arg_items(
        &options,
        models.reasoning_effort,
        models.current.as_ref() == Some(id),
        |option| format!("{name} {window} {}", option.id),
    )
}

/// One row per effort level for the `/model` chained effort phase.
/// `insert_text` is `"ModelName high"` so selecting a row completes both tokens.
fn build_effort_items(models: &ModelState, model_id: &acp::ModelId) -> Vec<ArgItem> {
    let info = match models.available.get(model_id) {
        Some(info) => info,
        None => return Vec::new(),
    };
    let model_name = info.name.clone();
    let is_current_model = models.current.as_ref() == Some(model_id);
    let options = models.reasoning_effort_options_for(model_id);
    build_effort_arg_items(
        &options,
        models.reasoning_effort,
        is_current_model,
        |option| format!("{model_name} {}", option.id),
    )
}

#[cfg(test)]
mod tests {
    use super::*;
    use nofy_shell::sampling::types::ReasoningEffort;
    use std::sync::Arc;

    fn multiwindow_models() -> ModelState {
        let mut models = ModelState::default();
        let id = acp::ModelId::new("reasoning-x");
        let info = acp::ModelInfo::new(id.clone(), "Reasoning X").meta(serde_json::json!({
            "totalContextTokens":128000, "contextWindows":[128000,256000],
            "supportsReasoningEffort":true,"reasoningEfforts":[{"value":"low","label":"Low","default":true},{"value":"high","label":"High"}]
        }).as_object().cloned());
        models.available.insert(id.clone(), info);
        models.current = Some(id);
        models
    }

    #[test]
    fn multiwindow_model_chains_window_before_effort() {
        let models = multiwindow_models();
        let (id, remainder) = detect_window_phase(&models, "Reasoning X ").unwrap();
        assert_eq!(remainder, " ");
        let windows = build_window_items(&models, &id);
        assert_eq!(windows[1].insert_text, "Reasoning X 256000 ");
        let effort = build_window_effort_items(&models, &id, 256000);
        assert_eq!(effort[1].insert_text, "Reasoning X 256000 high");
        assert_eq!(
            preselected_effort_arg(&models, "Reasoning X ").as_deref(),
            Some("Reasoning X 128000 ")
        );
    }

    #[test]
    fn model_window_and_effort_parse_together_and_reject_unoffered_window() {
        let models = multiwindow_models();
        let sid = acp::SessionId::new("s1");
        let mut ctx = dummy_exec_ctx(&models);
        ctx.session_id = Some(&sid);
        assert!(matches!(
            ModelCommand.run(&mut ctx, "Reasoning X 256k high"),
            CommandResult::Action(Action::SwitchModelContext {
                context_window: Some(256000),
                effort: Some(ReasoningEffort::High),
                ..
            })
        ));
        assert!(matches!(
            ModelCommand.run(&mut ctx, "Reasoning X 512k high"),
            CommandResult::Error(_)
        ));
        assert!(matches!(
            ModelCommand.run(&mut ctx, "Reasoning X high"),
            CommandResult::Action(Action::SwitchModel {
                effort: Some(ReasoningEffort::High),
                ..
            })
        ));
    }

    fn model_with_reasoning(id: &str, name: &str) -> (acp::ModelId, acp::ModelInfo) {
        let id = acp::ModelId::new(Arc::from(id));
        let mut meta = serde_json::Map::new();
        meta.insert(
            "supportsReasoningEffort".into(),
            serde_json::Value::Bool(true),
        );
        let info = acp::ModelInfo::new(id.clone(), name.to_string())
            .meta(serde_json::Value::Object(meta).as_object().cloned());
        (id, info)
    }

    fn plain_model(id: &str, name: &str) -> (acp::ModelId, acp::ModelInfo) {
        let id = acp::ModelId::new(Arc::from(id));
        let info = acp::ModelInfo::new(id.clone(), name.to_string());
        (id, info)
    }

    static EMPTY_BUNDLE: crate::app::bundle::BundleState = crate::app::bundle::BundleState {
        has_cache: false,
        version: String::new(),
        personas: Vec::new(),
        roles: Vec::new(),
        agents: Vec::new(),
        skills: Vec::new(),
        persona_details: Vec::new(),
        role_details: Vec::new(),
    };

    fn dummy_exec_ctx(models: &ModelState) -> CommandExecCtx<'_> {
        CommandExecCtx {
            models,
            session_id: None,
            bundle_state: &EMPTY_BUNDLE,
            screen_mode: crate::app::ScreenMode::Inline,
            pager_state: crate::settings::PagerLocalSnapshot {
                multiline_mode: false,
                yolo_mode: false,
                ..crate::settings::PagerLocalSnapshot::default()
            },
        }
    }

    #[test]
    fn split_trailing_token_splits_on_final_whitespace() {
        assert_eq!(
            split_trailing_token("Reasoning X high"),
            Some(("Reasoning X", "high"))
        );
        assert_eq!(
            split_trailing_token("reasoning-x  xhigh"),
            Some(("reasoning-x", "xhigh"))
        );
        // No interior whitespace → nothing to split off.
        assert!(split_trailing_token("reasoning-x-pro").is_none());
    }

    #[test]
    fn empty_query_returns_one_row_per_logical_model() {
        let mut state = ModelState::default();
        let (rid, rinfo) = model_with_reasoning("reasoning-x", "Reasoning X");
        let (pid, pinfo) = plain_model("grok-4.5", "Nofy 4.5");
        state.available.insert(rid, rinfo);
        state.available.insert(pid, pinfo);

        let cmd = ModelCommand;
        let ctx = AppCtx {
            models: &state,
            cwd: std::path::Path::new("."),
            has_session_announcements: false,
            workflows_available: true,
            screen_mode: crate::app::ScreenMode::Fullscreen,
        };
        let items = cmd.suggest_args(&ctx, "").unwrap();
        assert_eq!(items.len(), 2, "model phase: one row per logical model");

        // Reasoning model has trailing space in insert_text -- this is the
        // signal the prompt widget reads to keep the dropdown open after
        // Enter so the effort sub-menu can render.
        let reasoning = items
            .iter()
            .find(|i| i.match_text == "Reasoning X")
            .unwrap();
        assert_eq!(reasoning.insert_text, "Reasoning X ");

        // Plain model has no trailing space -- Enter commits immediately.
        let plain = items.iter().find(|i| i.match_text == "Nofy 4.5").unwrap();
        assert_eq!(plain.insert_text, "Nofy 4.5");
    }

    #[test]
    fn trailing_space_after_reasoning_model_enters_effort_phase() {
        let mut state = ModelState::default();
        let (id, info) = model_with_reasoning("reasoning-x", "Reasoning X");
        state.available.insert(id, info);

        let cmd = ModelCommand;
        let ctx = AppCtx {
            models: &state,
            cwd: std::path::Path::new("."),
            has_session_announcements: false,
            workflows_available: true,
            screen_mode: crate::app::ScreenMode::Fullscreen,
        };
        // Args query has a trailing space -> effort phase. Items come out
        // ordered xhigh -> low (strongest first) per EFFORT_LEVELS.
        let items = cmd.suggest_args(&ctx, "Reasoning X ").unwrap();
        assert_eq!(items.len(), 4);
        assert_eq!(items[0].insert_text, "Reasoning X xhigh");
        assert_eq!(items[1].insert_text, "Reasoning X high");
        assert_eq!(items[2].insert_text, "Reasoning X medium");
        assert_eq!(items[3].insert_text, "Reasoning X low");
        // Display is just the level so the user sees a clean column.
        assert_eq!(items[0].display, "xhigh");
        // match_text carries the sort-key prefix that forces the matcher's
        // alphabetical tiebreak to render rows in EFFORT_LEVELS order.
        assert!(items[0].match_text.starts_with("a "));
        assert!(items[3].match_text.starts_with("d "));
    }

    #[test]
    fn partial_effort_query_still_in_effort_phase() {
        let mut state = ModelState::default();
        let (id, info) = model_with_reasoning("reasoning-x", "Reasoning X");
        state.available.insert(id, info);

        let cmd = ModelCommand;
        let ctx = AppCtx {
            models: &state,
            cwd: std::path::Path::new("."),
            has_session_announcements: false,
            workflows_available: true,
            screen_mode: crate::app::ScreenMode::Fullscreen,
        };
        // Still in effort phase; matcher upstream narrows to high / xhigh.
        let items = cmd.suggest_args(&ctx, "Reasoning X h").unwrap();
        assert_eq!(items.len(), 4);
    }

    #[test]
    fn partial_model_query_stays_in_model_phase() {
        let mut state = ModelState::default();
        let (id, info) = model_with_reasoning("reasoning-x", "Reasoning X");
        state.available.insert(id, info);

        let cmd = ModelCommand;
        let ctx = AppCtx {
            models: &state,
            cwd: std::path::Path::new("."),
            has_session_announcements: false,
            workflows_available: true,
            screen_mode: crate::app::ScreenMode::Fullscreen,
        };
        // No trailing space, user is still typing the model name.
        let items = cmd.suggest_args(&ctx, "Reason").unwrap();
        assert_eq!(items.len(), 1);
        assert_eq!(items[0].insert_text, "Reasoning X ");
    }

    #[test]
    fn run_parses_model_plus_effort_when_supported() {
        let mut state = ModelState::default();
        let (id, info) = model_with_reasoning("reasoning-x", "Reasoning X");
        state.available.insert(id, info);
        let mut ctx = dummy_exec_ctx(&state);
        let result = ModelCommand.run(&mut ctx, "Reasoning X xhigh");
        match result {
            CommandResult::Action(Action::SwitchModel { model_id, effort }) => {
                assert_eq!(model_id.0.as_ref(), "reasoning-x");
                assert_eq!(effort, Some(ReasoningEffort::Xhigh));
            }
            other => panic!("expected SwitchModel with effort, got {other:?}"),
        }
    }

    #[test]
    fn run_rejects_unoffered_effort_with_effort_error_not_unknown_model() {
        // Regression: previously `resolve_effort_token_for` returned None and
        // the handler fell through to `Unknown model: Reasoning X none`.
        let mut state = ModelState::default();
        let (id, info) = model_with_reasoning("reasoning-x", "Reasoning X");
        state.available.insert(id, info);
        let mut ctx = dummy_exec_ctx(&state);
        let result = ModelCommand.run(&mut ctx, "Reasoning X none");
        match result {
            CommandResult::Error(msg) => {
                assert!(
                    msg.contains("unknown effort level 'none'"),
                    "expected effort error, got {msg}"
                );
                assert!(
                    msg.contains("use one of:"),
                    "expected offered levels in message, got {msg}"
                );
                assert!(
                    !msg.to_lowercase().contains("unknown model"),
                    "must not misreport as unknown model: {msg}"
                );
                let offered = msg.split_once("; ").map(|(_, r)| r).unwrap_or("");
                assert!(
                    !offered.contains("none"),
                    "must not list none as offered: {msg}"
                );
            }
            other => panic!("expected Error, got {other:?}"),
        }
    }

    #[test]
    fn run_prefers_full_multi_word_model_name_over_prefix_plus_effort() {
        // Catalog has both "Nofy" (reasoning) and "Nofy 4.5". `/model Nofy 4.5`
        // must select the full name, not treat "4.5" as an effort on "Nofy".
        let mut state = ModelState::default();
        let (short_id, short_info) = model_with_reasoning("nofy", "Nofy");
        let (long_id, long_info) = model_with_reasoning("grok-4.5", "Nofy 4.5");
        state.available.insert(short_id, short_info);
        state.available.insert(long_id.clone(), long_info);
        let mut ctx = dummy_exec_ctx(&state);
        let result = ModelCommand.run(&mut ctx, "Nofy 4.5");
        match result {
            CommandResult::Action(Action::SetDefaultModel(resolved_id)) => {
                assert_eq!(resolved_id, long_id);
            }
            other => panic!("expected SetDefaultModel(Nofy 4.5), got {other:?}"),
        }
    }

    #[test]
    fn run_rejects_effort_for_non_reasoning_model() {
        let mut state = ModelState::default();
        let (id, info) = plain_model("grok-4.5", "Nofy 4.5");
        state.available.insert(id, info);
        let mut ctx = dummy_exec_ctx(&state);
        let result = ModelCommand.run(&mut ctx, "Nofy 4.5 high");
        // Falls through to "is the whole string a model name?" — which
        // it isn't, so we get an Unknown error.
        assert!(matches!(result, CommandResult::Error(_)));
    }

    /// The bare `/model <name>` form dispatches
    /// `Action::SetDefaultModel(<ModelId>)` instead of the legacy
    /// `Action::SwitchModel { effort: None }`. The dispatcher routes
    /// the typed setter through both `Effect::SwitchModel`
    /// (session-level mutation) AND `Effect::PersistSetting`
    /// (next-session default).
    ///
    /// The payload is the typed `acp::ModelId` (resolved at the slash
    /// boundary), not a String.
    #[test]
    fn run_bare_model_name_dispatches_set_default_model() {
        let mut state = ModelState::default();
        let (id, info) = plain_model("grok-4.5", "Nofy 4.5");
        state.available.insert(id.clone(), info);
        let mut ctx = dummy_exec_ctx(&state);
        let result = ModelCommand.run(&mut ctx, "Nofy 4.5");
        match result {
            CommandResult::Action(Action::SetDefaultModel(resolved_id)) => {
                assert_eq!(resolved_id, id);
            }
            other => panic!("expected Action::SetDefaultModel(<id>), got {other:?}"),
        }
    }

    /// Case-insensitive matching against the catalog: `/model nofy 4.5`
    /// resolves to the same `ModelId` as `/model Nofy 4.5`.
    #[test]
    fn run_set_default_model_resolves_case_insensitively() {
        let mut state = ModelState::default();
        let (id, info) = plain_model("grok-4.5", "Nofy 4.5");
        state.available.insert(id.clone(), info);
        let mut ctx = dummy_exec_ctx(&state);
        let result = ModelCommand.run(&mut ctx, "nofy 4.5");
        match result {
            CommandResult::Action(Action::SetDefaultModel(resolved_id)) => {
                assert_eq!(resolved_id, id);
            }
            other => panic!("expected Action::SetDefaultModel(<id>), got {other:?}"),
        }
    }
}
