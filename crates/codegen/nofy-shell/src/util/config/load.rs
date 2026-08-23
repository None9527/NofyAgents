use super::mcp::*;
use toml::Value as TomlValue;
/// Resolve a bool from an optional env var > config.toml `[section] key` > false.
///
/// Uses [`crate::agent::config::env_bool`] for consistent env var parsing
/// (`1/true/yes/on/enabled` and their negations).
fn toml_bool_sync(env_var: Option<&str>, section: &str, key: &str) -> bool {
    if let Some(var) = env_var
        && let Some(val) = crate::agent::config::env_bool(var)
    {
        return val;
    }
    let root: TomlValue = match crate::config::load_effective_config() {
        Ok(r) => r,
        Err(_) => return false,
    };
    if let TomlValue::Table(table) = root
        && let Some(TomlValue::Table(s)) = table.get(section)
    {
        s.get(key).and_then(|v| v.as_bool()).unwrap_or(false)
    } else {
        false
    }
}
pub async fn load_config() -> Config {
    let root: TomlValue = match crate::config::load_effective_config() {
        Ok(v) => v,
        Err(_) => return Config::default(),
    };
    load_config_from_toml(&root)
}
/// Parse `Config` from a pre-loaded TOML value. Used by both async and sync paths.
pub fn load_config_from_toml(root: &TomlValue) -> Config {
    let table = match root.as_table() {
        Some(t) => t,
        None => return Config::default(),
    };
    fn section<T: serde::de::DeserializeOwned + Default>(
        table: &toml::map::Map<String, TomlValue>,
        key: &str,
    ) -> T {
        table
            .get(key)
            .and_then(|v| v.clone().try_into().ok())
            .unwrap_or_default()
    }
    if let Some(TomlValue::Table(toolset)) = table.get("toolset")
        && toolset.get("use_concise").is_some()
    {
        tracing::warn!(
            "`[toolset] use_concise` is deprecated and no longer has any effect. \
             Set `use_concise = true` on individual model entries in config.toml instead."
        );
    }
    let management_api_key = table
        .get("endpoints")
        .and_then(|v| v.get("management_api_key"))
        .and_then(|v| v.as_str())
        .map(str::to_owned);
    let permission = table
        .get("permission")
        .and_then(|v| v.clone().try_into::<PermissionConfig>().ok());
    Config {
        cli: section(table, "cli"),
        models: section(table, "models"),
        ui: section(table, "ui"),
        harness: {
            #[allow(unused_mut)]
            let mut harness: crate::agent::config::HarnessConfig = section(table, "harness");
            harness
        },
        skills: section(table, "skills"),
        compat: section(table, "compat"),
        management_api_key,
        permission,
        diagnostics: section(table, "diagnostics"),
        session: section(table, "session"),
        ask_user_question: table
            .get("toolset")
            .and_then(|t| t.get("ask_user_question"))
            .and_then(|v| v.clone().try_into().ok())
            .unwrap_or_default(),
    }
}
#[cfg(test)]
mod tests {
    use super::*;
    use toml::Value as TomlValue;
    #[test]
    fn test_models_default_parsing() {
        let toml_str = r#"
[models]
default = "nofy-code-fast-1"
"#;
        let root: TomlValue = toml::from_str(toml_str).unwrap();
        if let TomlValue::Table(table) = root
            && let Some(TomlValue::Table(models)) = table.get("models")
        {
            let default = models
                .get("default")
                .and_then(|v| v.as_str())
                .map(|s| s.to_string());
            assert_eq!(default.as_deref(), Some("nofy-code-fast-1"));
        } else {
            panic!("Expected models table");
        }
    }
}
