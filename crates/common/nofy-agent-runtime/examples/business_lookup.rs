//! Run with: cargo run -p nofy-agent-runtime --example business_lookup
//! No provider key, filesystem, terminal, Nofy home or product preset needed.
use async_trait::async_trait;
use nofy_agent_runtime::*;
use nofy_tool_runtime::{ListToolsContext, Tool, ToolCallContext};
use nofy_tool_types::ToolDescription;
use serde_json::{Value, json};
use std::sync::Arc;

struct Lookup;
impl Tool for Lookup {
    type Args = Value;
    type Output = Value;
    fn id(&self) -> nofy_tool_protocol::ToolId {
        nofy_tool_protocol::ToolId::new("lookup").unwrap()
    }
    fn description(&self, _: &ListToolsContext) -> ToolDescription {
        let mut description = ToolDescription::new("lookup", "Look up an application record");
        description.arguments_schema = Some(json!({"type":"object"}));
        description
    }
    async fn run(
        &self,
        context: ToolCallContext,
        _args: Value,
    ) -> Result<Value, nofy_tool_runtime::ToolError> {
        let customer = context
            .get::<String>()
            .expect("application customer context");
        Ok(json!({"customer":*customer,"status":"active"}))
    }
}

struct ScriptedModel;
#[async_trait]
impl Model for ScriptedModel {
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        Ok(match request.messages.last() {
            Some(Message::Tool { content, .. }) => ModelResponse {
                output: content.to_string(),
                ..Default::default()
            },
            _ => ModelResponse {
                tool_calls: vec![ToolCall {
                    id: "lookup-1".into(),
                    name: "lookup".into(),
                    arguments: json!({}),
                }],
                ..Default::default()
            },
        })
    }
}

#[tokio::main(flavor = "current_thread")]
async fn main() -> Result<(), Error> {
    let mut components = Components::default();
    components
        .models
        .insert("model".into(), Arc::new(ScriptedModel));
    components.prompts.insert(
        "business".into(),
        Arc::new(PromptTemplate::new(
            "Answer business queries using {{tools}}.",
        )),
    );
    let mut tools = ToolCatalog::new();
    tools.insert(ToolEntry::typed(Lookup))?;
    components.tool_packs.insert("records".into(), tools);
    let mut context = RunContext::new("customer-42", "run-1");
    context.capabilities.insert("customer-42".to_string());
    let settings = SettingsResolver::new(vec![Arc::new(StaticSettings(json!({"max_steps":4})))])
        .resolve(&context)
        .await?;
    let agent = AgentBuilder::new("customer-support")
        .model("model")
        .prompt("business")
        .tools("records")
        .settings(settings)
        .compile(&components)?;
    println!(
        "{:?}",
        agent
            .invoke(RunInput::new("What is my account status?"), context)
            .await?
    );
    Ok(())
}
