//! MCP tools on the ordinary ToolSource/ToolDispatch execution path.
//! Factories are pure; sessions and live credentials exist only during IO.
mod http;
mod session;
mod source;
mod sse;
mod transport;

pub use http::HttpResourceFactory;
pub use source::ToolSourceFactory;
pub use transport::{Connection, StdioChannel, StdioProvider};

use nofy_agent_runtime::{Error, registry::*};
use nofy_tool_runtime::ToolError;
use serde_json::{Value, json};
use std::collections::BTreeMap;

const PROTOCOL: &str = "2025-11-25";
const REVISION: &str = "mcp-tools/2025-11-25-v1";

fn protocol(message: &str) -> ToolError {
    crate::tool_error("mcp_protocol", message)
}
fn descriptor(
    factory: &str,
    kind: ModuleKind,
    config_schema: Value,
    dependencies: BTreeMap<String, ModuleKind>,
) -> ModuleDescriptor {
    ModuleDescriptor {
        factory: factory.into(),
        revision: REVISION.into(),
        kind,
        config_schema,
        input_schema: None,
        output_schema: None,
        required_capabilities: Default::default(),
        dependencies,
    }
}
fn digest(value: &impl serde::Serialize) -> Result<String, ToolError> {
    nofy_agent_runtime::system::content_digest(value)
        .map_err(|_| protocol("MCP identity cannot be encoded"))
}
