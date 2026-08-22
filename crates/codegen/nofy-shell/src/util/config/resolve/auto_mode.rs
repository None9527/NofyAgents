use toml::Value as TomlValue;

/// Env override for the **auto** permission-mode feature gate.
pub(crate) const ENV_AUTO_PERMISSION_MODE: &str = "NOFY_AUTO_PERMISSION_MODE";

const AUTO_MODE_CLASSIFY_TIMEOUT_MIN_MS: u64 = 1_000;
const AUTO_MODE_CLASSIFY_TIMEOUT_DEFAULT_MS: u64 = 30_000;
const AUTO_MODE_CLASSIFY_TIMEOUT_MAX_MS: u64 = 120_000;

/// Crate-wide serialization lock for tests that mutate
/// `NOFY_AUTO_PERMISSION_MODE`. Every test reading the gate (here and in
/// `permissions.rs`, compiled into the same test binary) locks this so a
/// concurrent setter can't make them flaky.
#[cfg(test)]
pub(crate) static AUTO_PERMISSION_MODE_ENV_LOCK: std::sync::Mutex<()> = std::sync::Mutex::new(());

/// Extract the `[auto_mode] enabled` gate from one TOML layer (the local opt-in
/// that replaced `[features] auto_permission_mode`).
fn auto_permission_mode_from_toml(v: Option<&TomlValue>) -> Option<bool> {
    v?.get("auto_mode")?.get("enabled")?.as_bool()
}

/// Pure precedence core for the auto-permission-mode gate.
/// Precedence: requirement > env (`NOFY_AUTO_PERMISSION_MODE`)
/// > config > managed > default (`true`).
fn resolve_auto_permission_mode_layers(
    requirement: Option<bool>,
    config: Option<bool>,
    managed: Option<bool>,
) -> crate::agent::config::Resolved<bool> {
    use crate::agent::config::BoolFlag;
    BoolFlag::env(ENV_AUTO_PERMISSION_MODE)
        .requirement(requirement)
        .config(config)
        .managed(managed)
        .default(true)
        .resolve()
}

/// Free-function gate reader for call sites without a `Config` handle (the
/// launch decision in `effective_auto_for_launch`, the agent's
/// `session_auto_mode` guard, and the pager mode cycle / settings). Reads
/// env + requirements + the effective `config.toml` from disk. Defaults
/// `true` so Auto is available unless pinned off.
pub fn auto_permission_mode_enabled_from_disk() -> bool {
    let requirements = crate::config::load_merged_requirements();
    let effective = crate::config::load_effective_config().ok();
    resolve_auto_permission_mode_layers(
        auto_permission_mode_from_toml(requirements.as_ref()),
        auto_permission_mode_from_toml(effective.as_ref()),
        None,
    )
    .value
}

/// Deserialize the `[auto_mode]` table from one effective-config TOML layer into
/// the typed [`AutoModeConfig`]. A malformed table is dropped to `None` (warned,
/// not silently swallowed, so a bad local `[auto_mode]` is visible in logs).
fn auto_mode_config_from_toml(
    v: Option<&TomlValue>,
) -> Option<crate::agent::config::AutoModeConfig> {
    let table = v?.get("auto_mode")?.clone();
    table
        .try_into()
        .map_err(|e| tracing::warn!(error = %e, "[auto_mode]: dropped malformed local table"))
        .ok()
}

/// Resolve the full Auto-mode config for the rare classifier-wiring read.
/// Loads the effective `config.toml` ONCE; unset fields stay `None` (the wire
/// fn applies the built-in defaults). No env layer (mirrors goal's model
/// resolvers); the gate's own env layer is handled by the disk gate reader.
pub(crate) fn resolve_auto_mode_config_from_disk() -> crate::agent::config::AutoModeConfig {
    let effective = crate::config::load_effective_config().ok();
    auto_mode_config_from_toml(effective.as_ref()).unwrap_or_default()
}

pub(crate) fn auto_mode_classify_timeout(
    cfg: &crate::agent::config::AutoModeConfig,
) -> std::time::Duration {
    let configured = cfg
        .classify_timeout_ms
        .unwrap_or(AUTO_MODE_CLASSIFY_TIMEOUT_DEFAULT_MS);
    let bounded = configured.clamp(
        AUTO_MODE_CLASSIFY_TIMEOUT_MIN_MS,
        AUTO_MODE_CLASSIFY_TIMEOUT_MAX_MS,
    );
    if bounded != configured {
        tracing::warn!(
            configured_ms = configured,
            bounded_ms = bounded,
            min_ms = AUTO_MODE_CLASSIFY_TIMEOUT_MIN_MS,
            max_ms = AUTO_MODE_CLASSIFY_TIMEOUT_MAX_MS,
            "[auto_mode] classify_timeout_ms outside supported range; clamped"
        );
    }
    std::time::Duration::from_millis(bounded)
}

/// Apply the built-in Auto-mode classifier defaults to a resolved config (these
/// take effect once auto mode is enabled): an unset `prompt_type` defaults to
/// `full` (v9-traffic eval: transcript context cuts the residual block rate
/// ~1/3 and lets explicit user authorization satisfy the prompt's
/// confirmation clause); an unset `reasoning_effort` defaults to `low` ONLY
/// when the effective model supports reasoning effort (else stays `None` —
/// provider default). Explicit config values always win. Returns the
/// `(prompt_type, reasoning_effort)` the classifier wiring should use.
pub(crate) fn auto_mode_classifier_defaults(
    cfg: &crate::agent::config::AutoModeConfig,
    effective_supports_reasoning_effort: bool,
) -> (
    nofy_workspace::permission::ClassifierPromptType,
    Option<nofy_sampling_types::ReasoningEffort>,
) {
    let prompt_type = cfg
        .prompt_type
        .unwrap_or(nofy_workspace::permission::ClassifierPromptType::Full);
    let reasoning_effort = cfg.reasoning_effort.or_else(|| {
        effective_supports_reasoning_effort.then_some(nofy_sampling_types::ReasoningEffort::Low)
    });
    (prompt_type, reasoning_effort)
}

#[cfg(test)]
mod auto_permission_mode_gate_tests {
    use super::*;
    use crate::agent::config::ConfigSource;

    // `NOFY_AUTO_PERMISSION_MODE` is process-global; serialize every test that
    // reads it (all of them, via `BoolFlag::env`) and force it unset at the top
    // of each so a developer's shell value can't make these flaky.
    fn guard() -> std::sync::MutexGuard<'static, ()> {
        let g = super::AUTO_PERMISSION_MODE_ENV_LOCK
            .lock()
            .unwrap_or_else(|p| p.into_inner());
        unsafe { std::env::remove_var(ENV_AUTO_PERMISSION_MODE) };
        g
    }

    #[test]
    fn defaults_on_when_nothing_set() {
        let _g = guard();
        let r = resolve_auto_permission_mode_layers(None, None, None);
        assert!(r.value, "gate must default ON");
        assert_eq!(r.source, ConfigSource::Default);
    }

    #[test]
    fn each_layer_can_turn_it_on() {
        let _g = guard();
        // requirement
        let r = resolve_auto_permission_mode_layers(Some(true), None, None);
        assert!(r.value);
        assert_eq!(r.source, ConfigSource::Requirement);
        // config (user)
        let r = resolve_auto_permission_mode_layers(None, Some(true), None);
        assert!(r.value);
        assert_eq!(r.source, ConfigSource::Config);
        // managed
        let r = resolve_auto_permission_mode_layers(None, None, Some(true));
        assert!(r.value);
        assert_eq!(r.source, ConfigSource::ManagedConfig);
    }

    #[test]
    fn precedence_config_beats_managed() {
        let _g = guard();
        // config(false) wins over managed(true).
        let r = resolve_auto_permission_mode_layers(None, Some(false), Some(true));
        assert!(!r.value);
        assert_eq!(r.source, ConfigSource::Config);
    }

    #[test]
    fn env_overrides_config() {
        let _g = guard();
        unsafe { std::env::set_var(ENV_AUTO_PERMISSION_MODE, "1") };
        let r = resolve_auto_permission_mode_layers(None, Some(false), None);
        assert!(r.value, "env must override config");
        assert_eq!(r.source, ConfigSource::Env);
        unsafe { std::env::remove_var(ENV_AUTO_PERMISSION_MODE) };
    }

    #[test]
    fn requirement_beats_env() {
        let _g = guard();
        unsafe { std::env::set_var(ENV_AUTO_PERMISSION_MODE, "1") };
        let r = resolve_auto_permission_mode_layers(Some(false), None, None);
        assert!(!r.value, "requirement (managed/MDM floor) must beat env");
        assert_eq!(r.source, ConfigSource::Requirement);
        unsafe { std::env::remove_var(ENV_AUTO_PERMISSION_MODE) };
    }

    #[test]
    fn disk_reader_honors_env() {
        let _g = guard();
        // The disk reader wires the env layer (highest deterministic source).
        unsafe { std::env::set_var(ENV_AUTO_PERMISSION_MODE, "1") };
        assert!(
            auto_permission_mode_enabled_from_disk(),
            "from_disk must honor the env layer"
        );
        unsafe { std::env::remove_var(ENV_AUTO_PERMISSION_MODE) };
    }

    #[test]
    fn auto_mode_classify_timeout_applies_default_and_bounds() {
        use crate::agent::config::AutoModeConfig;
        use std::time::Duration;

        assert_eq!(
            auto_mode_classify_timeout(&AutoModeConfig::default()),
            Duration::from_millis(AUTO_MODE_CLASSIFY_TIMEOUT_DEFAULT_MS)
        );
        assert_eq!(
            auto_mode_classify_timeout(&AutoModeConfig {
                classify_timeout_ms: Some(45_000),
                ..AutoModeConfig::default()
            }),
            Duration::from_millis(45_000)
        );
        assert_eq!(
            auto_mode_classify_timeout(&AutoModeConfig {
                classify_timeout_ms: Some(0),
                ..AutoModeConfig::default()
            }),
            Duration::from_millis(AUTO_MODE_CLASSIFY_TIMEOUT_MIN_MS)
        );
        assert_eq!(
            auto_mode_classify_timeout(&AutoModeConfig {
                classify_timeout_ms: Some(u64::MAX),
                ..AutoModeConfig::default()
            }),
            Duration::from_millis(AUTO_MODE_CLASSIFY_TIMEOUT_MAX_MS)
        );
    }

    #[test]
    fn auto_mode_classifier_defaults_apply_when_unset() {
        use crate::agent::config::AutoModeConfig;
        use nofy_sampling_types::ReasoningEffort;
        use nofy_workspace::permission::ClassifierPromptType;
        // Unset + RE-supporting effective model ⇒ full (transcript) + low.
        let (pt, eff) = auto_mode_classifier_defaults(&AutoModeConfig::default(), true);
        assert_eq!(pt, ClassifierPromptType::Full);
        assert_eq!(eff, Some(ReasoningEffort::Low));
        // Unset + non-RE model ⇒ full + None (no effort override).
        let (pt, eff) = auto_mode_classifier_defaults(&AutoModeConfig::default(), false);
        assert_eq!(pt, ClassifierPromptType::Full);
        assert_eq!(eff, None);
        // Explicit values win over the defaults, even on a RE-supporting model.
        let cfg = AutoModeConfig {
            prompt_type: Some(ClassifierPromptType::JustCommand),
            reasoning_effort: Some(ReasoningEffort::High),
            ..AutoModeConfig::default()
        };
        let (pt, eff) = auto_mode_classifier_defaults(&cfg, true);
        assert_eq!(pt, ClassifierPromptType::JustCommand);
        assert_eq!(eff, Some(ReasoningEffort::High));
    }

    #[test]
    fn auto_mode_config_from_toml_round_trips_and_warns_on_malformed() {
        use nofy_workspace::permission::ClassifierPromptType;
        // A real [auto_mode] table round-trips (not silently dropped).
        let toml: TomlValue = toml::from_str(
            "[auto_mode]\nenabled = true\nprompt_type = \"just_command\"\nclassifier_model = \"m\"\nclassify_timeout_ms = 45000\n",
        )
        .unwrap();
        let cfg = auto_mode_config_from_toml(Some(&toml)).expect("table parses");
        assert_eq!(cfg.enabled, Some(true));
        assert_eq!(cfg.prompt_type, Some(ClassifierPromptType::JustCommand));
        assert_eq!(cfg.classifier_model.as_deref(), Some("m"));
        assert_eq!(cfg.classify_timeout_ms, Some(45_000));
        // Absent [auto_mode] ⇒ None.
        let bare: TomlValue = toml::from_str("[features]\ngoal = true\n").unwrap();
        assert!(auto_mode_config_from_toml(Some(&bare)).is_none());
        // Malformed enum ⇒ dropped to None (warned), never a panic.
        let bad: TomlValue = toml::from_str("[auto_mode]\nprompt_type = \"bogus\"\n").unwrap();
        assert!(auto_mode_config_from_toml(Some(&bad)).is_none());
    }
}
