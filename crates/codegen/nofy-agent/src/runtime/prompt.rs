//! Ordered, versionable prompts with explicit variables and inspectable sources.
use nofy_agent_runtime::{Error, Prompt, RunContext, registry::*};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use std::{
    collections::{BTreeMap, BTreeSet},
    sync::Arc,
};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PromptOrigin {
    pub kind: String,
    pub reference: String,
    pub version: String,
    #[serde(default)]
    pub location: Option<String>,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "kind", content = "text", rename_all = "snake_case")]
pub enum FragmentContent {
    Literal(String),
    Template(String),
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PromptFragment {
    pub id: String,
    pub content: FragmentContent,
    pub source: PromptOrigin,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PromptDocument {
    pub fragments: Vec<PromptFragment>,
    pub variable_schema: Value,
    #[serde(default = "empty_object")]
    pub values: Value,
    #[serde(default = "separator")]
    pub separator: String,
}
fn empty_object() -> Value {
    json!({})
}
fn separator() -> String {
    "\n\n".into()
}

/// Explicit host-bound values. Templates have no filesystem, environment or
/// credential discovery. Reserved tool views are supplied by the runtime.
pub use nofy_agent_runtime::prompt::PromptVariables;
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct RenderedFragment {
    pub id: String,
    pub source: PromptOrigin,
    pub text: String,
    pub start_byte: usize,
    pub end_byte: usize,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct PromptPreview {
    pub text: String,
    pub fragments: Vec<RenderedFragment>,
    pub tools: Vec<String>,
}
pub struct DocumentPrompt {
    document: PromptDocument,
}
impl DocumentPrompt {
    pub fn new(document: PromptDocument) -> Result<Self, Error> {
        nofy_agent_runtime::settings::validate_json_schema(&document.variable_schema)?;
        if !document.values.is_object()
            || document.fragments.is_empty()
            || document.fragments.len() > 128
            || document.separator.len() > 1024
            || document.variable_schema.get("type").and_then(Value::as_str) != Some("object")
        {
            return Err(invalid(
                "prompt requires fragments, object variables and bounded separator",
            ));
        }
        if document
            .values
            .as_object()
            .unwrap()
            .keys()
            .any(|key| reserved(key))
        {
            return Err(invalid("tools and tool_names are reserved prompt values"));
        }
        let mut ids = BTreeSet::new();
        let mut total = 0usize;
        for fragment in &document.fragments {
            if fragment.id.trim().is_empty()
                || !ids.insert(&fragment.id)
                || fragment.source.kind.trim().is_empty()
                || fragment.source.reference.trim().is_empty()
                || fragment.source.version.trim().is_empty()
            {
                return Err(invalid(
                    "prompt fragments need unique IDs and versioned sources",
                ));
            }
            let text = match &fragment.content {
                FragmentContent::Literal(text) => text,
                FragmentContent::Template(text) => text,
            };
            total = total.saturating_add(text.len());
            if total > 1024 * 1024 {
                return Err(invalid("prompt source exceeds 1 MiB"));
            }
            if matches!(fragment.content, FragmentContent::Template(_)) {
                environment()
                    .template_from_str(text)
                    .map_err(|e| invalid(e.to_string()))?;
            }
        }
        Ok(Self { document })
    }
    pub fn preview(
        &self,
        variables: &PromptVariables,
        tools: &[String],
    ) -> Result<PromptPreview, Error> {
        if variables.0.keys().any(|key| reserved(key)) {
            return Err(invalid("runtime cannot override the tool view"));
        }
        let mut values = self
            .document
            .values
            .as_object()
            .expect("validated object")
            .clone();
        values.extend(variables.0.clone());
        let values = Value::Object(values);
        if serde_json::to_vec(&values)
            .map_err(|e| invalid(e.to_string()))?
            .len()
            > 65536
        {
            return Err(invalid("prompt variable values exceed 64 KiB"));
        }
        nofy_agent_runtime::settings::validate_json_value(&self.document.variable_schema, &values)?;
        let mut values = values.as_object().unwrap().clone();
        values.insert("tools".into(), json!(tools));
        values.insert("tool_names".into(), json!(tools.join(", ")));
        let env = environment();
        let mut text = String::new();
        let mut fragments = Vec::new();
        for fragment in &self.document.fragments {
            let rendered = match &fragment.content {
                FragmentContent::Literal(text) => text.clone(),
                FragmentContent::Template(template) => env
                    .render_str(template, &values)
                    .map_err(|e| invalid(e.to_string()))?,
            };
            if !fragments.is_empty() {
                text.push_str(&self.document.separator);
            }
            let start_byte = text.len();
            text.push_str(&rendered);
            if text.len() > 1024 * 1024 {
                return Err(invalid("rendered prompt exceeds 1 MiB"));
            }
            fragments.push(RenderedFragment {
                id: fragment.id.clone(),
                source: fragment.source.clone(),
                text: rendered,
                start_byte,
                end_byte: text.len(),
            });
        }
        Ok(PromptPreview {
            text,
            fragments,
            tools: tools.to_vec(),
        })
    }
}
fn reserved(key: &str) -> bool {
    matches!(key, "tools" | "tool_names")
}
fn environment() -> minijinja::Environment<'static> {
    let mut env = minijinja::Environment::new();
    env.set_undefined_behavior(minijinja::UndefinedBehavior::Strict);
    env.set_fuel(Some(100_000));
    env
}
fn invalid(message: impl Into<String>) -> Error {
    Error::Composition(message.into())
}
#[async_trait::async_trait]
impl Prompt for DocumentPrompt {
    async fn render(&self, context: &RunContext, tools: &[String]) -> Result<String, Error> {
        let variables = context
            .capabilities
            .get::<PromptVariables>()
            .as_deref()
            .cloned()
            .unwrap_or_default();
        Ok(self.preview(&variables, tools)?.text)
    }
}
pub struct DocumentPromptFactory;
impl ModuleFactory for DocumentPromptFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: "prompt.document".into(),
            revision: "1".into(),
            kind: ModuleKind::Prompt,
            config_schema: json!({"type":"object","additionalProperties":false,"required":["fragments","variable_schema"],"properties":{
                "fragments":{"type":"array","minItems":1,"maxItems":128,"items":{"type":"object","additionalProperties":false,"required":["id","content","source"],"properties":{
                    "id":{"type":"string","minLength":1},"content":{"type":"object","additionalProperties":false,"required":["kind","text"],"properties":{"kind":{"enum":["literal","template"]},"text":{"type":"string","maxLength":1048576}}},
                    "source":{"type":"object","additionalProperties":false,"required":["kind","reference","version"],"properties":{"kind":{"type":"string"},"reference":{"type":"string"},"version":{"type":"string"},"location":{"type":["string","null"]}}}
                }}},"variable_schema":{"type":"object"},"values":{"type":"object"},"separator":{"type":"string","maxLength":1024}
            }}),
            input_schema: None,
            output_schema: None,
            dependencies: BTreeMap::new(),
            required_capabilities: Default::default(),
        }
    }
    fn build(
        &self,
        config: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        let document =
            serde_json::from_value(config.clone()).map_err(|e| invalid(e.to_string()))?;
        Ok(ModuleInstance::Prompt(Arc::new(DocumentPrompt::new(
            document,
        )?)))
    }
}
