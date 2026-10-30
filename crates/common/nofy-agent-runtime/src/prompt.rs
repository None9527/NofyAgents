use crate::{Error, RunContext};
use async_trait::async_trait;
use std::collections::BTreeMap;

#[async_trait]
pub trait Prompt: Send + Sync {
    async fn render(&self, context: &RunContext, tool_names: &[String]) -> Result<String, Error>;
}

/// Explicit variables for host-owned Prompt implementations.
#[derive(Clone, Default)]
pub struct PromptVariables(pub BTreeMap<String, serde_json::Value>);

/// Already rendered host prompts must never be interpreted a second time.
pub struct StaticPrompt(pub String);

#[async_trait]
impl Prompt for StaticPrompt {
    async fn render(&self, _context: &RunContext, _tool_names: &[String]) -> Result<String, Error> {
        Ok(self.0.clone())
    }
}

/// A small template with explicit application values; no coding instructions
/// or discovery defaults. More capable renderers implement `Prompt` directly.
pub struct PromptTemplate {
    template: String,
    values: BTreeMap<String, String>,
}

impl PromptTemplate {
    pub fn new(template: impl Into<String>) -> Self {
        Self {
            template: template.into(),
            values: BTreeMap::new(),
        }
    }
    pub fn value(mut self, key: impl Into<String>, value: impl Into<String>) -> Self {
        self.values.insert(key.into(), value.into());
        self
    }
}

#[async_trait]
impl Prompt for PromptTemplate {
    async fn render(&self, _context: &RunContext, tool_names: &[String]) -> Result<String, Error> {
        let mut text = self.template.clone();
        for (key, value) in &self.values {
            text = text.replace(&format!("{{{{{key}}}}}"), value);
        }
        Ok(text.replace("{{tools}}", &tool_names.join(", ")))
    }
}
