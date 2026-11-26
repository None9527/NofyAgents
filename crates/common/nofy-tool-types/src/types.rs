use std::fmt;

use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[non_exhaustive]
pub struct ToolDescription {
    /// Tool name (e.g. "read_file") that is called by the model.
    pub name: String,

    /// Optional namespace grouping (e.g. "github", "slack").
    /// None for tools without a declared namespace.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub namespace: Option<String>,

    /// Display name (e.g. "Web Search") can be shown to the model.
    /// If absent, derive the title from 'name'.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,

    /// Description of the tool.
    pub description: String,

    /// Raw JSON Schema describing the tool's arguments.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub arguments_schema: Option<Value>,

    /// High-level tool kind (stable snake_case, e.g. "read"), set by the tool
    /// server so consumers can group tools by kind. `None` if undeclared.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub kind: Option<String>,
}

impl ToolDescription {
    pub fn new(name: impl Into<String>, description: impl Into<String>) -> Self {
        Self {
            name: name.into(),
            namespace: None,
            title: None,
            description: description.into(),
            arguments_schema: None,
            kind: None,
        }
    }

    /// Returns the raw JSON Schema for the tool's arguments if one was attached.
    pub fn arguments_schema(&self) -> Option<&Value> {
        self.arguments_schema.as_ref()
    }
}

impl fmt::Display for ToolDescription {
    /// Note: this is used for display and debugging purposes only.
    /// This is not a canonical identifier format.
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match &self.namespace {
            Some(ns) => write!(f, "{ns}.{}", self.name)?,
            None => write!(f, "{}", self.name)?,
        }
        if !self.description.is_empty() {
            write!(f, " — {}", self.description)?;
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn tool_description_new_and_display() {
        let mut tool = ToolDescription::new("search", "Search things");
        assert_eq!(tool.name, "search");
        assert_eq!(tool.description, "Search things");
        assert!(tool.namespace.is_none());
        assert!(tool.title.is_none());
        assert!(tool.arguments_schema().is_none());
        assert!(tool.kind.is_none());
        assert_eq!(tool.to_string(), "search — Search things");

        tool.namespace = Some("github".into());
        assert_eq!(tool.to_string(), "github.search — Search things");
    }

    #[test]
    fn tool_description_serde_roundtrip() {
        let raw = serde_json::json!({
            "type": "object",
            "properties": { "query": { "type": "string" } },
            "required": ["query"]
        });
        let mut tool = ToolDescription::new("search", "Search repositories");
        tool.namespace = Some("github".into());
        tool.title = Some("GitHub Search".into());
        tool.arguments_schema = Some(raw.clone());
        tool.kind = Some("read".into());

        let json = serde_json::to_string(&tool).unwrap();
        let back: ToolDescription = serde_json::from_str(&json).unwrap();
        assert_eq!(back, tool);
        assert_eq!(back.arguments_schema(), Some(&raw));
    }

    #[test]
    fn tool_description_deserializes_minimal() {
        let json = r#"{"name": "ping", "description": "Ping"}"#;
        let tool: ToolDescription = serde_json::from_str(json).unwrap();
        assert_eq!(tool.name, "ping");
        assert_eq!(tool.description, "Ping");
        assert!(tool.namespace.is_none());
        assert!(tool.title.is_none());
        assert!(tool.arguments_schema.is_none());
        assert!(tool.kind.is_none());
    }
}
