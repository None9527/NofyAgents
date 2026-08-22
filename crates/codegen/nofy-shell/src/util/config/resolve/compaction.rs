/// Default auto-compact threshold (% of context window) when no source sets it.
pub const DEFAULT_AUTO_COMPACT_THRESHOLD_PERCENT: u8 = 85;

#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum CompactionToolChoice {
    #[default]
    Auto,
    None,
}

impl std::str::FromStr for CompactionToolChoice {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.trim().to_ascii_lowercase().as_str() {
            "auto" => Ok(Self::Auto),
            "none" => Ok(Self::None),
            _ => Err(()),
        }
    }
}

pub(crate) const ENV_COMPACTION_TOOL_CHOICE: &str = "NOFY_COMPACTION_TOOL_CHOICE";

pub(crate) fn resolve_compaction_tool_choice_from(
    env: Option<&str>,
    config: Option<&str>,
) -> CompactionToolChoice {
    env.and_then(|s| s.parse().ok())
        .or_else(|| config.and_then(|s| s.parse().ok()))
        .unwrap_or_default()
}

/// Env-var override for `auto_compact_threshold_percent`. Parsed as `u8`;
/// out-of-range or unparseable values are ignored.
pub(crate) const ENV_AUTO_COMPACT_THRESHOLD_PERCENT: &str = "NOFY_AUTO_COMPACT_THRESHOLD_PERCENT";

/// Resolve auto-compact threshold percent (0-100) for the given model.
///
/// Two scopes (per-model and global) across the user TOML tier and the model
/// catalog. User-tier always wins; within a tier, per-model wins over global.
/// Env var sits on top as a per-process override.
///
/// Precedence (highest first):
///   1. env `NOFY_AUTO_COMPACT_THRESHOLD_PERCENT`
///   2. user TOML `[model.<id>].auto_compact_threshold_percent`
///      (read from `cfg.config_models`; the effective merge of user +
///      managed `[model.<id>]` sections)
///   3. user TOML `[session].auto_compact_threshold_percent`
///      (read from `cfg.session.auto_compact_threshold_percent: Option<u8>`)
///   4. model catalog per-model `ModelInfo.auto_compact_threshold_percent`
///   5. default `DEFAULT_AUTO_COMPACT_THRESHOLD_PERCENT` (85)
///
/// Values outside `0..=100` from the env var are ignored with a debug log and
/// the resolver falls through to the next tier. TOML fields are typed
/// `u8` and so naturally constrained.
pub(crate) fn resolve_auto_compact_threshold_percent(
    cfg: &crate::agent::config::Config,
    model_id: &str,
    model: Option<&crate::agent::config::ModelInfo>,
) -> u8 {
    resolve_auto_compact_threshold_percent_from_tiers(
        cfg.config_models
            .get(model_id)
            .and_then(|m| m.auto_compact_threshold_percent),
        cfg.session.auto_compact_threshold_percent,
        model.and_then(|m| m.auto_compact_threshold_percent),
    )
}

/// Lower-level form of [`resolve_auto_compact_threshold_percent`] that takes
/// the four tiers as plain `Option<u8>` values rather than reaching into a
/// `Config`. Useful from sites that don't hold a `Config` reference (e.g.,
/// subagent spawn paths where the parent's config tiers are plumbed in
/// explicitly and the per-model lookup uses the SUBAGENT's resolved model id,
/// not the parent's).
///
/// Precedence: env > `user_per_model` > `user_global` > `catalog_per_model`
/// > `DEFAULT_AUTO_COMPACT_THRESHOLD_PERCENT`.
pub(crate) fn resolve_auto_compact_threshold_percent_from_tiers(
    user_per_model: Option<u8>,
    user_global: Option<u8>,
    catalog_per_model: Option<u8>,
) -> u8 {
    fn clamp_env(raw: i64) -> Option<u8> {
        if (0..=100).contains(&raw) {
            Some(raw as u8)
        } else {
            tracing::debug!(
                source = "env",
                value = raw,
                "auto_compact_threshold_percent out of range 0..=100; ignoring"
            );
            None
        }
    }
    let from_env = || -> Option<u8> {
        std::env::var(ENV_AUTO_COMPACT_THRESHOLD_PERCENT)
            .ok()
            .and_then(|s| s.parse::<i64>().ok())
            .and_then(clamp_env)
    };

    from_env()
        .or(user_per_model)
        .or(user_global)
        .or(catalog_per_model)
        .unwrap_or(DEFAULT_AUTO_COMPACT_THRESHOLD_PERCENT)
}

/// Client default per-compaction wall-clock budget (seconds). Fleet p99 of
/// successful compactions is ~181s (≈225s at 400K+ input), so 300s clears the
/// legit tail with margin while cutting a runaway from the ~600s deadline.
pub const DEFAULT_COMPACTION_WALL_CLOCK_BUDGET_SECS: u64 = 300;

/// Below this, a configured budget is almost certainly a misconfig (fleet
/// success p99 ~181s); logged at `warn`, not clamped.
const COMPACTION_WALL_CLOCK_BUDGET_WARN_SECS: u64 = 120;

/// Env override for the compaction wall-clock budget (seconds). Parsed as
/// `u64`; unparseable values fall through.
const ENV_COMPACTION_WALL_CLOCK_BUDGET_SECS: &str = "NOFY_COMPACTION_WALL_CLOCK_SECS";

/// Resolve the per-compaction wall-clock budget (seconds). Precedence: env
/// `NOFY_COMPACTION_WALL_CLOCK_SECS` >
/// [`DEFAULT_COMPACTION_WALL_CLOCK_BUDGET_SECS`].
///
/// `0` **disables** it. Low values are warned, not clamped — any "safe" clamp
/// (e.g. 30s) would itself cut legit compactions, trading one silent failure for
/// another; ops own the value.
pub(crate) fn resolve_compaction_wall_clock_budget_secs() -> u64 {
    let resolved = std::env::var(ENV_COMPACTION_WALL_CLOCK_BUDGET_SECS)
        .ok()
        .and_then(|s| s.trim().parse::<u64>().ok())
        .unwrap_or(DEFAULT_COMPACTION_WALL_CLOCK_BUDGET_SECS);
    if resolved > 0 && resolved < COMPACTION_WALL_CLOCK_BUDGET_WARN_SECS {
        tracing::warn!(
            budget_secs = resolved,
            "compaction wall-clock budget {resolved}s is below {COMPACTION_WALL_CLOCK_BUDGET_WARN_SECS}s \
             and may cut legitimate compactions (fleet success p99 ~181s); set 0 to disable"
        );
    }
    resolved
}

#[cfg(test)]
mod compaction_wall_clock_budget_tests {
    use super::resolve_compaction_wall_clock_budget_secs as resolve;

    // Assumes NOFY_COMPACTION_WALL_CLOCK_SECS is unset in the test env.
    #[test]
    fn default_when_unset() {
        assert_eq!(resolve(), 300); // client default
    }
}

#[cfg(test)]
mod compaction_tool_choice_tests {
    use super::{CompactionToolChoice, resolve_compaction_tool_choice_from as resolve};

    #[test]
    fn default_is_auto() {
        assert_eq!(resolve(None, None), CompactionToolChoice::Auto);
    }

    #[test]
    fn precedence_env_over_config() {
        assert_eq!(
            resolve(Some("none"), Some("auto")),
            CompactionToolChoice::None
        );
        assert_eq!(
            resolve(None, Some("none")),
            CompactionToolChoice::None
        );
    }

    #[test]
    fn garbage_falls_through() {
        assert_eq!(
            resolve(Some("garbage"), None),
            CompactionToolChoice::Auto
        );
        assert_eq!(
            resolve(Some("garbage"), Some("also-bad")),
            CompactionToolChoice::Auto
        );
    }

    #[test]
    fn from_str_case_insensitive() {
        assert_eq!("AUTO".parse(), Ok(CompactionToolChoice::Auto));
        assert_eq!(" None ".parse(), Ok(CompactionToolChoice::None));
        assert!("required".parse::<CompactionToolChoice>().is_err());
    }
}
