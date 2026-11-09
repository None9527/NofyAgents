//! Explicit opt-in for applications that own their process entry.
//! Run: cargo run -p nofy-agent-runtime --example managed_entry
//! This does not change Agent::invoke or guarantee arbitrary nesting fits.
use nofy_agent_runtime::{
    AgentBuilder, Components, Error, Model, ModelRequest, ModelResponse, RunContext, RunInput,
    StaticPrompt, managed,
};
use std::{process::ExitCode, sync::Arc};

struct Greeting;
#[async_trait::async_trait]
impl Model for Greeting {
    async fn complete(&self, _: ModelRequest, _: &RunContext) -> Result<ModelResponse, Error> {
        Ok(ModelResponse {
            output: "hello from an explicitly managed entry".into(),
            ..Default::default()
        })
    }
}

async fn application() -> Result<(), Box<dyn std::error::Error>> {
    // State and futures are constructed on the SDK-owned thread, not OS main.
    let mut components = Components::default();
    components
        .models
        .insert("greeting".into(), Arc::new(Greeting));
    components
        .prompts
        .insert("prompt".into(), Arc::new(StaticPrompt("Be concise".into())));
    let agent = AgentBuilder::new("example")
        .model("greeting")
        .prompt("prompt")
        .compile(&components)?;
    let outcome = agent
        .invoke(
            RunInput::new("hello"),
            RunContext::new("example-thread", "example-run"),
        )
        .await?;
    println!("{outcome:?}");
    Ok(())
}

fn main() -> ExitCode {
    managed::run(application)
}
