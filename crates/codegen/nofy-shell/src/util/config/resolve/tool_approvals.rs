use toml::Value as TomlValue;

/// Env override for the **remember tool approvals** permission-panel gate.
pub(crate) const ENV_REMEMBER_TOOL_APPROVALS: &str = "NOFY_REMEMBER_TOOL_APPROVALS";

/// Default for the `remember_tool_approvals` gate when no layer sets it.
/// Shared with the pager settings modal so the displayed default cannot
/// drift from the resolver.
pub const DEFAULT_REMEMBER_TOOL_APPROVALS: bool = true;

/// Extract the user knob `[ui] remember_tool_approvals` from one TOML layer.
fn remember_tool_approvals_from_toml(v: Option<&TomlValue>) -> Option<bool> {
    v?.get("ui")?.get("remember_tool_approvals")?.as_bool()
}

/// Precedence core shared by the typed resolver and the disk reader so they
/// can't drift: requirement > env > config > managed > default
/// [`DEFAULT_REMEMBER_TOOL_APPROVALS`] (`true`).
fn resolve_remember_tool_approvals_layers(
    requirement: Option<bool>,
    config: Option<bool>,
    managed: Option<bool>,
) -> crate::agent::config::Resolved<bool> {
    use crate::agent::config::BoolFlag;
    BoolFlag::env(ENV_REMEMBER_TOOL_APPROVALS)
        .requirement(requirement)
        .config(config)
        .managed(managed)
        .default(DEFAULT_REMEMBER_TOOL_APPROVALS)
        .resolve()
}

/// Resolve whether the granular per-tool "Always allow …" prompt options are
/// shown. Precedence: requirements > env (`NOFY_REMEMBER_TOOL_APPROVALS`) >
/// `[ui].remember_tool_approvals` > managed > default `true`
/// ([`DEFAULT_REMEMBER_TOOL_APPROVALS`]).
pub fn resolve_remember_tool_approvals(
    requirements: Option<&TomlValue>,
    user: Option<&TomlValue>,
    managed: Option<&TomlValue>,
) -> crate::agent::config::Resolved<bool> {
    resolve_remember_tool_approvals_layers(
        remember_tool_approvals_from_toml(requirements),
        remember_tool_approvals_from_toml(user),
        remember_tool_approvals_from_toml(managed),
    )
}

/// Free-function form of [`resolve_remember_tool_approvals`] for the
/// permission-manager spawn: env + requirements + effective `config.toml`.
/// Defaults `true` ([`DEFAULT_REMEMBER_TOOL_APPROVALS`]).
pub(crate) fn remember_tool_approvals_from_disk() -> bool {
    let requirements = crate::config::load_merged_requirements();
    let effective = crate::config::load_effective_config().ok();
    resolve_remember_tool_approvals_layers(
        remember_tool_approvals_from_toml(requirements.as_ref()),
        remember_tool_approvals_from_toml(effective.as_ref()),
        None,
    )
    .value
}

#[cfg(test)]
mod remember_tool_approvals_gate_tests {
    use super::*;
    use crate::agent::config::ConfigSource;

    // `NOFY_REMEMBER_TOOL_APPROVALS` is process-global; serialize and force it
    // unset at the top of each test so a developer's shell value can't make
    // these flaky.
    static ENV_LOCK: std::sync::Mutex<()> = std::sync::Mutex::new(());
    fn guard() -> std::sync::MutexGuard<'static, ()> {
        let g = ENV_LOCK.lock().unwrap_or_else(|p| p.into_inner());
        unsafe { std::env::remove_var(ENV_REMEMBER_TOOL_APPROVALS) };
        g
    }

    fn toml_ui(v: bool) -> TomlValue {
        toml::from_str(&format!("[ui]\nremember_tool_approvals = {v}\n")).unwrap()
    }

    #[test]
    fn defaults_on_when_nothing_set() {
        let _g = guard();
        let r = resolve_remember_tool_approvals(None, None, None);
        assert!(r.value, "gate must default ON");
        assert_eq!(r.source, ConfigSource::Default);
    }

    #[test]
    fn each_layer_can_turn_it_off() {
        let _g = guard();
        let off = toml_ui(false);
        // requirement
        let r = resolve_remember_tool_approvals(Some(&off), None, None);
        assert!(!r.value);
        assert_eq!(r.source, ConfigSource::Requirement);
        // config (user)
        let r = resolve_remember_tool_approvals(None, Some(&off), None);
        assert!(!r.value);
        assert_eq!(r.source, ConfigSource::Config);
        // managed
        let r = resolve_remember_tool_approvals(None, None, Some(&off));
        assert!(!r.value);
        assert_eq!(r.source, ConfigSource::ManagedConfig);
    }

    #[test]
    fn explicit_layer_reports_its_source() {
        let _g = guard();
        let on = toml_ui(true);
        // An explicit `true` matches the default but must still resolve with
        // the layer's provenance, not `Default`.
        let r = resolve_remember_tool_approvals(None, Some(&on), None);
        assert!(r.value);
        assert_eq!(r.source, ConfigSource::Config);
    }

    #[test]
    fn precedence_config_beats_managed() {
        let _g = guard();
        let off = toml_ui(false);
        let on = toml_ui(true);
        let r = resolve_remember_tool_approvals(None, Some(&off), Some(&on));
        assert!(!r.value);
        assert_eq!(r.source, ConfigSource::Config);
        let r = resolve_remember_tool_approvals(None, None, Some(&off));
        assert!(!r.value);
        assert_eq!(r.source, ConfigSource::ManagedConfig);
    }

    #[test]
    fn env_overrides_config() {
        let _g = guard();
        unsafe { std::env::set_var(ENV_REMEMBER_TOOL_APPROVALS, "1") };
        let off = toml_ui(false);
        let r = resolve_remember_tool_approvals(None, Some(&off), None);
        assert!(r.value, "env must override config");
        assert_eq!(r.source, ConfigSource::Env);
        unsafe { std::env::remove_var(ENV_REMEMBER_TOOL_APPROVALS) };
    }

    #[test]
    fn requirement_beats_env() {
        let _g = guard();
        unsafe { std::env::set_var(ENV_REMEMBER_TOOL_APPROVALS, "1") };
        let off = toml_ui(false);
        let r = resolve_remember_tool_approvals(Some(&off), None, None);
        assert!(!r.value, "requirement (managed/MDM floor) must beat env");
        assert_eq!(r.source, ConfigSource::Requirement);
        unsafe { std::env::remove_var(ENV_REMEMBER_TOOL_APPROVALS) };
    }
}
