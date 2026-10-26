//! A bounded model-local notice, supplied by configuration or catalog metadata.
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ModelNoticeSeverity {
    Warning,
    Critical,
    #[default]
    #[serde(other)]
    Info,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ModelNotice {
    #[serde(default)]
    pub severity: ModelNoticeSeverity,
    pub text: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub label: Option<String>,
}

impl ModelNotice {
    pub fn normalized(self) -> Option<Self> {
        let text = bounded_text(self.text.trim(), 160);
        if text.is_empty() {
            return None;
        }
        let label = self
            .label
            .as_deref()
            .map(str::trim)
            .filter(|label| !label.is_empty())
            .map(|label| bounded_text(label, 24));
        Some(Self {
            text,
            label,
            ..self
        })
    }
    pub fn from_value(value: &serde_json::Value) -> Option<Self> {
        Self::deserialize(value).ok()?.normalized()
    }
}

pub fn parse_model_notice_meta(
    meta: Option<&serde_json::Map<String, serde_json::Value>>,
) -> Option<ModelNotice> {
    ModelNotice::from_value(meta?.get("notice")?)
}

fn bounded_text(text: &str, limit: usize) -> String {
    if text.chars().nth(limit).is_none() {
        return text.into();
    }
    format!(
        "{}…",
        text.chars().take(limit - 1).collect::<String>().trim_end()
    )
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn notice_limits_are_unicode_safe_and_unknown_severity_is_informational() {
        let notice = ModelNotice::from_value(&serde_json::json!({"severity":"future", "text":"汉".repeat(200), "label":"标".repeat(40)})).unwrap();
        assert_eq!(notice.severity, ModelNoticeSeverity::Info);
        assert_eq!(notice.text.chars().count(), 160);
        assert_eq!(notice.label.unwrap().chars().count(), 24);
        assert!(ModelNotice::from_value(&serde_json::json!({"text":"  "})).is_none());
    }
}
