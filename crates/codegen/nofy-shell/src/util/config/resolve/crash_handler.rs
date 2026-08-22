use toml::Value as TomlValue;

/// Env override for the full crash-handler install gate.
pub(crate) const ENV_CRASH_HANDLER: &str = "NOFY_CRASH_HANDLER";

/// Extract `[diagnostics] crash_handler` from one TOML layer.
fn crash_handler_from_toml(v: Option<&TomlValue>) -> Option<bool> {
    v?.get("diagnostics")?.get("crash_handler")?.as_bool()
}

/// Precedence core shared by the typed resolver and the disk reader so they
/// can't drift: requirement > env > config > managed > default `false`.
fn resolve_crash_handler_enabled_layers(
    requirement: Option<bool>,
    config: Option<bool>,
    managed: Option<bool>,
) -> crate::agent::config::Resolved<bool> {
    use crate::agent::config::BoolFlag;
    BoolFlag::env(ENV_CRASH_HANDLER)
        .requirement(requirement)
        .config(config)
        .managed(managed)
        .resolve()
}

/// Resolve whether the full crash handler should be installed.
/// Precedence: requirements > env (`NOFY_CRASH_HANDLER`) >
/// user `[diagnostics] crash_handler` > managed > default `false`.
pub fn resolve_crash_handler_enabled(
    requirements: Option<&TomlValue>,
    user: Option<&TomlValue>,
    managed: Option<&TomlValue>,
) -> crate::agent::config::Resolved<bool> {
    resolve_crash_handler_enabled_layers(
        crash_handler_from_toml(requirements),
        crash_handler_from_toml(user),
        crash_handler_from_toml(managed),
    )
}

/// Merge system-managed policy (`/etc/nofy`) under home `managed_config.toml`
/// so MDM/system layers still reach the managed BoolFlag tier.
fn load_managed_toml_layers() -> Option<TomlValue> {
    let system = crate::config::load_system_managed_config().ok();
    let managed = crate::config::load_managed_config().ok();
    match (system, managed) {
        (None, None) => None,
        (Some(s), None) => Some(s),
        (None, Some(m)) => Some(m),
        (Some(mut s), Some(m)) => {
            nofy_config::deep_merge_toml(&mut s, &m);
            Some(s)
        }
    }
}

/// Free-function form of [`resolve_crash_handler_enabled`] for the pager-bin
/// install path: env + requirements + user + system/home managed from disk.
/// Defaults `false`.
pub fn load_crash_handler_enabled_sync() -> bool {
    let requirements = crate::config::load_merged_requirements();
    let user = crate::config::load_from_disk().ok();
    let managed = load_managed_toml_layers();
    resolve_crash_handler_enabled_layers(
        crash_handler_from_toml(requirements.as_ref()),
        crash_handler_from_toml(user.as_ref()),
        crash_handler_from_toml(managed.as_ref()),
    )
    .value
}

#[cfg(test)]
mod crash_handler_gate_tests {
    use super::*;
    use crate::agent::config::ConfigSource;

    // `NOFY_CRASH_HANDLER` is process-global; serialize and force it unset at
    // the top of each test so a developer's shell value can't make these flaky.
    static ENV_LOCK: std::sync::Mutex<()> = std::sync::Mutex::new(());
    fn guard() -> std::sync::MutexGuard<'static, ()> {
        let g = ENV_LOCK.lock().unwrap_or_else(|p| p.into_inner());
        unsafe { std::env::remove_var(ENV_CRASH_HANDLER) };
        g
    }

    fn toml_diag(v: bool) -> TomlValue {
        toml::from_str(&format!("[diagnostics]\ncrash_handler = {v}\n")).unwrap()
    }

    #[test]
    fn defaults_off_when_nothing_set() {
        let _g = guard();
        let r = resolve_crash_handler_enabled(None, None, None);
        assert!(!r.value, "gate must default OFF");
        assert_eq!(r.source, ConfigSource::Default);
    }

    #[test]
    fn each_layer_can_turn_it_on() {
        let _g = guard();
        let on = toml_diag(true);
        let r = resolve_crash_handler_enabled(Some(&on), None, None);
        assert!(r.value);
        assert_eq!(r.source, ConfigSource::Requirement);
        let r = resolve_crash_handler_enabled(None, Some(&on), None);
        assert!(r.value);
        assert_eq!(r.source, ConfigSource::Config);
        let r = resolve_crash_handler_enabled(None, None, Some(&on));
        assert!(r.value);
        assert_eq!(r.source, ConfigSource::ManagedConfig);
    }

    #[test]
    fn each_layer_can_force_disable() {
        let _g = guard();
        let off = toml_diag(false);
        let r = resolve_crash_handler_enabled(Some(&off), None, None);
        assert!(!r.value);
        assert_eq!(r.source, ConfigSource::Requirement);
        let r = resolve_crash_handler_enabled(None, Some(&off), None);
        assert!(!r.value);
        assert_eq!(r.source, ConfigSource::Config);
        let r = resolve_crash_handler_enabled(None, None, Some(&off));
        assert!(!r.value);
        assert_eq!(r.source, ConfigSource::ManagedConfig);
    }

    #[test]
    fn precedence_config_beats_managed() {
        let _g = guard();
        let off = toml_diag(false);
        let on = toml_diag(true);
        let r = resolve_crash_handler_enabled(None, Some(&off), Some(&on));
        assert!(!r.value);
        assert_eq!(r.source, ConfigSource::Config);
    }

    #[test]
    fn env_overrides_config() {
        let _g = guard();
        unsafe { std::env::set_var(ENV_CRASH_HANDLER, "1") };
        let off = toml_diag(false);
        let r = resolve_crash_handler_enabled(None, Some(&off), None);
        assert!(r.value, "env must override config");
        assert_eq!(r.source, ConfigSource::Env);
        unsafe { std::env::remove_var(ENV_CRASH_HANDLER) };
    }

    #[test]
    fn env_can_force_disable_over_config() {
        let _g = guard();
        unsafe { std::env::set_var(ENV_CRASH_HANDLER, "0") };
        let on = toml_diag(true);
        let r = resolve_crash_handler_enabled(None, Some(&on), None);
        assert!(!r.value, "env=0 must override config");
        assert_eq!(r.source, ConfigSource::Env);
        unsafe { std::env::remove_var(ENV_CRASH_HANDLER) };
    }

    #[test]
    fn requirement_beats_env() {
        let _g = guard();
        unsafe { std::env::set_var(ENV_CRASH_HANDLER, "1") };
        let off = toml_diag(false);
        let r = resolve_crash_handler_enabled(Some(&off), None, None);
        assert!(!r.value, "requirement must beat env");
        assert_eq!(r.source, ConfigSource::Requirement);
        unsafe { std::env::remove_var(ENV_CRASH_HANDLER) };
    }
}
