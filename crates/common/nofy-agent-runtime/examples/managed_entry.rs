//! Explicit opt-in for applications that own their process entry.
//! Run: cargo run -p nofy-agent-runtime --example managed_entry
//! This does not change Agent::invoke or guarantee arbitrary nesting fits.
use nofy_agent_runtime::{
    AgentBuilder, Components, Error, Model, ModelRequest, ModelResponse, RunContext, RunInput,
    StaticPrompt,
};
use std::{
    process::{ExitCode, Termination},
    sync::Arc,
};

const ENTRY_STACK_BYTES: usize = 16 * 1024 * 1024;

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

fn application() -> Result<(), Box<dyn std::error::Error>> {
    // Runtime, application data and future construction all occur on this thread.
    // No existing borrowed future is moved from the calling thread.
    tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()?
        .block_on(async {
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
            Ok::<_, Error>(())
        })?;
    Ok(())
}

fn main() -> ExitCode {
    match std::thread::Builder::new()
        .name("sdk-managed-main".into())
        .stack_size(ENTRY_STACK_BYTES)
        .spawn(|| application().report())
    {
        Ok(thread) => match thread.join() {
            Ok(code) => code,
            Err(payload) => std::panic::resume_unwind(payload),
        },
        Err(error) => Err::<(), _>(error).report(),
    }
}
