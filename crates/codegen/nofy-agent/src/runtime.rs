//! Adapter from the original Nofy tool preset to the composable runtime.
//! This is deliberately downstream of both contracts and concrete tools.
use futures::StreamExt;
use nofy_agent_runtime::{Error, ToolCatalog, ToolEntry};
use nofy_tool_runtime::{ToolCallContext, ToolDispatch, ToolStream, TypedToolOutput};
use nofy_tools::bridge::ToolBridge;
use std::sync::Arc;

#[cfg(feature = "goal")]
pub mod goal;
pub mod prompt;
pub mod skills;
pub mod sources;
pub mod tasks;
#[cfg(feature = "context")]
pub use nofy_compaction::runtime as compaction;

#[cfg(feature = "executors")]
pub use nofy_agent_executors as executors;

struct PresetDispatch {
    bridge: Arc<ToolBridge>,
    durable: bool,
}

#[async_trait::async_trait]
impl ToolDispatch for PresetDispatch {
    async fn call(
        &self,
        id: nofy_tool_protocol::ToolId,
        args: serde_json::Value,
        context: ToolCallContext,
    ) -> ToolStream<TypedToolOutput> {
        let stream = self
            .bridge
            .toolset()
            .call_streaming_with_context(id.as_str(), args, context);
        let bridge = self.bridge.clone();
        let durable = self.durable;
        Box::pin(stream.then(move |item| {
            let bridge=bridge.clone(); let id=id.clone();
            async move { match item {
                nofy_tool_runtime::ToolStreamItem::Progress(progress)=>nofy_tool_runtime::ToolStreamItem::Progress(progress),
                nofy_tool_runtime::ToolStreamItem::Terminal(result)=>{
                    let result=match result {
                        Ok(output) if durable=>match bridge.toolset().save_and_flush_persistence_checked().await {
                            Ok(_)=>Ok(output),
                            Err(error)=>Err(nofy_tool_runtime::ToolError::custom("resource_persistence",format!("tool executed but its resource snapshot was not confirmed durable: {error}"))),
                        },
                        result=>result,
                    };
                    nofy_tool_runtime::ToolStreamItem::Terminal(result.map(|result|result.into_typed_tool_output(id)))
                }
            }}
        }))
    }
}

pub async fn tool_catalog(agent: &crate::Agent) -> Result<ToolCatalog, Error> {
    build_tool_catalog(agent, false).await
}
/// Resource-bearing native tools acknowledge their original state file before
/// returning a terminal result. Select this for checkpointed durable execution.
/// This is a local persistence barrier, not an external-service transaction.
pub async fn tool_catalog_durable(agent: &crate::Agent) -> Result<ToolCatalog, Error> {
    build_tool_catalog(agent, true).await
}
async fn build_tool_catalog(agent: &crate::Agent, durable: bool) -> Result<ToolCatalog, Error> {
    let mut catalog = ToolCatalog::new();
    let dispatch = Arc::new(PresetDispatch {
        bridge: agent.tool_bridge().clone(),
        durable,
    });
    for definition in agent.tool_definitions().await {
        catalog.insert(ToolEntry {
            definition,
            dispatch: dispatch.clone(),
        })?;
    }
    Ok(catalog)
}
