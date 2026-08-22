use crate::agent::config::ContextualHints;
use toml::Value as TomlValue;
use toml::map::Map as TomlMap;

/// Persisted worktree preference for `/new` and `/fork` (`[hints]` in config.toml).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum WorktreeHintMode {
    /// Always show the popup.
    Ask,
    /// Always create a worktree, skip the popup.
    Always,
    /// Never create a worktree, skip the popup.
    #[default]
    Never,
}

impl WorktreeHintMode {
    pub fn from_config_str(s: &str) -> Self {
        match s {
            "always" => Self::Always,
            "never" => Self::Never,
            "ask" => Self::Ask,
            other => {
                tracing::debug!(
                    value = other,
                    "unrecognised worktree_mode, defaulting to never"
                );
                Self::Never
            }
        }
    }

    /// Returns `(new_session_worktree_mode, fork_worktree_mode)`.
    ///
    /// - `/new`: `new_session_worktree_mode`, else legacy `worktree_mode`, else `Never`.
    /// - `/fork`: `fork_worktree_mode`, else legacy `worktree_mode`, else `Ask`.
    pub fn resolve_pair(hints: Option<&TomlValue>) -> (Self, Self) {
        let get_str = |key: &str| -> Option<Self> {
            hints
                .and_then(|h| h.get(key))
                .and_then(|v| v.as_str())
                .map(Self::from_config_str)
        };
        let legacy = get_str("worktree_mode");
        let new_session = get_str("new_session_worktree_mode")
            .or(legacy)
            .unwrap_or(Self::Never);
        let fork = get_str("fork_worktree_mode")
            .or(legacy)
            .unwrap_or(Self::Ask);
        (new_session, fork)
    }
}

/// Resolved `[hints]` worktree preferences for `/new` and `/fork`.
///
/// Read via effective config merge when available; falls back to partial layer
/// merge so a bad user `config.toml` does not drop managed/requirements hints.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ResolvedHints {
    pub new_session_worktree_mode: WorktreeHintMode,
    pub fork_worktree_mode: WorktreeHintMode,
}

impl Default for ResolvedHints {
    fn default() -> Self {
        Self {
            new_session_worktree_mode: WorktreeHintMode::Never,
            fork_worktree_mode: WorktreeHintMode::Ask,
        }
    }
}

impl ResolvedHints {
    fn from_hints_table(hints: Option<&TomlValue>) -> Self {
        let (new_session, fork) = WorktreeHintMode::resolve_pair(hints);
        Self {
            new_session_worktree_mode: new_session,
            fork_worktree_mode: fork,
        }
    }
}

/// Resolved per-tip contextual-hint gates (one bool per tip). Defaults all on.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct ResolvedContextualHints {
    pub undo: bool,
    pub plan_mode: bool,
    pub image_input: bool,
    pub send_now: bool,
    pub small_screen: bool,
    pub word_select: bool,
    pub ssh_wrap: bool,
}

impl Default for ResolvedContextualHints {
    fn default() -> Self {
        Self {
            undo: true,
            plan_mode: true,
            image_input: true,
            send_now: true,
            small_screen: true,
            word_select: true,
            ssh_wrap: true,
        }
    }
}

/// Resolve the per-tip contextual-hint gates. Per tip the precedence is:
/// env master `NOFY_CONTEXTUAL_HINTS` (all-on/off) > user config
/// `[ui.contextual_hints].X` > default ON. The env master is a global
/// kill/force switch.
pub fn resolve_contextual_hints(ui: &ContextualHints) -> ResolvedContextualHints {
    use crate::agent::config::BoolFlag;
    let resolve_tip = |user: Option<bool>| -> bool {
        BoolFlag::env("NOFY_CONTEXTUAL_HINTS")
            .config(user)
            .default(true)
            .resolve()
            .value
    };
    ResolvedContextualHints {
        undo: resolve_tip(ui.undo),
        plan_mode: resolve_tip(ui.plan_mode),
        image_input: resolve_tip(ui.image_input),
        send_now: resolve_tip(ui.send_now),
        small_screen: resolve_tip(ui.small_screen),
        word_select: resolve_tip(ui.word_select),
        ssh_wrap: resolve_tip(ui.ssh_wrap),
    }
}

/// Merge config layers in effective-config order (system managed → managed →
/// user → requirements). Used when [`load_effective_config`] fails but some
/// layers still loaded (same pattern as tips/announcements).
fn merge_hints_config_layers(
    requirements: Option<&TomlValue>,
    user: Option<&TomlValue>,
    managed: Option<&TomlValue>,
) -> TomlValue {
    let mut merged = crate::config::load_system_managed_config()
        .unwrap_or_else(|_| TomlValue::Table(TomlMap::new()));
    if let Some(m) = managed {
        nofy_config::deep_merge_toml(&mut merged, m);
    }
    if let Some(u) = user {
        nofy_config::deep_merge_toml(&mut merged, u);
    }
    if let Some(r) = requirements {
        nofy_config::deep_merge_toml(&mut merged, r);
    }
    merged
}

/// Resolve `[hints]` from effective config or partial layer merge.
///
/// Prefer passing a pre-loaded `effective_config` when startup already called
/// [`crate::config::load_effective_config`]. When it is `None`, merges the
/// same layers tips/announcements use so managed/requirements still apply.
pub fn resolve_hints(
    effective_config: Option<&TomlValue>,
    requirements: Option<&TomlValue>,
    user: Option<&TomlValue>,
    managed: Option<&TomlValue>,
) -> ResolvedHints {
    let root = effective_config
        .cloned()
        .unwrap_or_else(|| merge_hints_config_layers(requirements, user, managed));
    ResolvedHints::from_hints_table(root.get("hints"))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn resolve_hints_requirements_overrides_user_when_effective_missing() {
        let user: TomlValue = toml::from_str("[hints]\nfork_worktree_mode = \"never\"\n").unwrap();
        let requirements: TomlValue =
            toml::from_str("[hints]\nfork_worktree_mode = \"always\"\n").unwrap();
        let resolved = resolve_hints(None, Some(&requirements), Some(&user), None);
        assert_eq!(resolved.fork_worktree_mode, WorktreeHintMode::Always);
        assert_eq!(resolved.new_session_worktree_mode, WorktreeHintMode::Never);
    }

    /// `/new` defaults to Never and `/fork` to Ask, so an absent key is not the same answer for both.
    #[test]
    fn resolve_hints_defaults_differ_per_command() {
        let resolved = resolve_hints(None, None, None, None);
        assert_eq!(resolved.new_session_worktree_mode, WorktreeHintMode::Never);
        assert_eq!(resolved.fork_worktree_mode, WorktreeHintMode::Ask);
    }

    #[test]
    fn resolve_hints_uses_effective_root_when_provided() {
        let effective: TomlValue =
            toml::from_str("[hints]\nnew_session_worktree_mode = \"always\"\n").unwrap();
        let resolved = resolve_hints(Some(&effective), None, None, None);
        assert_eq!(resolved.new_session_worktree_mode, WorktreeHintMode::Always);
    }

    const ENV_CONTEXTUAL_HINTS: &str = "NOFY_CONTEXTUAL_HINTS";

    // `NOFY_CONTEXTUAL_HINTS` is process-global; serialize the tests reading it
    // and force it unset so a developer's shell value can't make them flaky.
    static CONTEXTUAL_HINTS_ENV_LOCK: std::sync::Mutex<()> = std::sync::Mutex::new(());

    fn contextual_hints_guard() -> std::sync::MutexGuard<'static, ()> {
        let g = CONTEXTUAL_HINTS_ENV_LOCK
            .lock()
            .unwrap_or_else(|p| p.into_inner());
        unsafe { std::env::remove_var(ENV_CONTEXTUAL_HINTS) };
        g
    }

    #[test]
    fn contextual_hints_default_on_when_absent() {
        let _g = contextual_hints_guard();
        let resolved = resolve_contextual_hints(&ContextualHints::default());
        assert!(resolved.undo, "undo defaults ON");
        assert!(resolved.plan_mode, "plan_mode defaults ON");
        assert!(resolved.image_input, "image_input defaults ON");
        assert!(resolved.send_now, "send_now defaults ON");
        assert!(resolved.small_screen, "small_screen defaults ON");
        assert!(resolved.word_select, "word_select defaults ON");
        assert!(resolved.ssh_wrap, "ssh_wrap defaults ON");
    }

    #[test]
    fn contextual_hints_config_opts_out_per_tip() {
        let _g = contextual_hints_guard();
        // User disables only the undo tip; the others stay on.
        let ui = ContextualHints {
            undo: Some(false),
            ..ContextualHints::default()
        };
        let resolved = resolve_contextual_hints(&ui);
        assert!(!resolved.undo);
        assert!(resolved.plan_mode);
        assert!(resolved.image_input);
        assert!(resolved.send_now);
        assert!(resolved.small_screen);
        assert!(resolved.word_select);
        assert!(resolved.ssh_wrap);
    }

    #[test]
    fn contextual_hints_env_master_forces_all_on() {
        let _g = contextual_hints_guard();
        unsafe { std::env::set_var(ENV_CONTEXTUAL_HINTS, "1") };
        // User config disables every tip; the env master forces all on.
        let ui = ContextualHints {
            undo: Some(false),
            plan_mode: Some(false),
            image_input: Some(false),
            send_now: Some(false),
            small_screen: Some(false),
            word_select: Some(false),
            ssh_wrap: Some(false),
        };
        let resolved = resolve_contextual_hints(&ui);
        assert!(
            resolved.undo
                && resolved.plan_mode
                && resolved.image_input
                && resolved.send_now
                && resolved.small_screen
                && resolved.word_select
                && resolved.ssh_wrap
        );
        unsafe { std::env::remove_var(ENV_CONTEXTUAL_HINTS) };
    }

    #[test]
    fn contextual_hints_env_master_zero_forces_all_off() {
        let _g = contextual_hints_guard();
        unsafe { std::env::set_var(ENV_CONTEXTUAL_HINTS, "0") };
        // User config enables every tip; the env master forces all off (global kill).
        let ui = ContextualHints {
            undo: Some(true),
            plan_mode: Some(true),
            image_input: Some(true),
            send_now: Some(true),
            small_screen: Some(true),
            word_select: Some(true),
            ssh_wrap: Some(true),
        };
        let resolved = resolve_contextual_hints(&ui);
        assert!(
            !resolved.undo
                && !resolved.plan_mode
                && !resolved.image_input
                && !resolved.send_now
                && !resolved.small_screen
                && !resolved.word_select
                && !resolved.ssh_wrap
        );
        unsafe { std::env::remove_var(ENV_CONTEXTUAL_HINTS) };
    }
}
