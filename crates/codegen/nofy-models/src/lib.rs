//! Vendor-neutral model initialization. No model is bundled or advertised.
//!
//! At runtime each model is resolved via:
//!   CLI flag > ENV var > user configuration > configured model catalog.
//! The default ID is an internal unconfigured marker, not an inference model.

use std::sync::LazyLock;

/// The raw JSON, embedded at compile time. Re-exported through the
/// `nofy_shell::models` facade and consumed by `agent::config`, so it must
/// be `pub` (was `pub(crate)` when this lived inside the shell crate).
pub const DEFAULT_MODELS_JSON: &str = include_str!("../default_models.json");

#[derive(serde::Deserialize)]
struct DefaultModels {
    default: String,
    /// Falls back to `default` if not specified in JSON.
    image_description: Option<String>,
    /// Falls back to `default` if not specified in JSON.
    session_summary: Option<String>,
    models: Vec<DefaultModelEntry>,
}

#[derive(serde::Deserialize)]
struct DefaultModelEntry {
    model: String,
}

static DEFAULTS: LazyLock<DefaultModels> = LazyLock::new(|| {
    let defaults: DefaultModels = serde_json::from_str(DEFAULT_MODELS_JSON)
        .expect("default_models.json: invalid JSON or missing 'default' field");

    // Baked-in JSON — a mismatch here is a developer error, not a runtime condition.
    let model_ids: Vec<&str> = defaults.models.iter().map(|m| m.model.as_str()).collect();
    assert!(
        (model_ids.is_empty() && defaults.default == "__unconfigured__")
            || model_ids.contains(&defaults.default.as_str()),
        "default_models.json: 'default' is '{}' but 'models' array only has {model_ids:?}",
        defaults.default,
    );

    defaults
});

/// Initialization marker until a configured primary model is resolved.
pub fn default_model() -> &'static str {
    &DEFAULTS.default
}

/// Initialization marker for image description; the host inherits its current model.
pub fn default_image_description_model() -> &'static str {
    DEFAULTS
        .image_description
        .as_deref()
        .unwrap_or(&DEFAULTS.default)
}

/// Initialization marker for title generation; the host inherits its current model.
pub fn default_session_summary_model() -> &'static str {
    DEFAULTS
        .session_summary
        .as_deref()
        .unwrap_or(&DEFAULTS.default)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn no_vendor_model_is_bundled() {
        let catalog: serde_json::Value = serde_json::from_str(DEFAULT_MODELS_JSON).unwrap();
        assert!(catalog["models"].as_array().unwrap().is_empty());
        assert!(!DEFAULT_MODELS_JSON.to_ascii_lowercase().contains("grok"));
        assert_eq!(default_model(), "__unconfigured__");
        assert_eq!(default_image_description_model(), default_model());
        assert_eq!(default_session_summary_model(), default_model());
    }
}
