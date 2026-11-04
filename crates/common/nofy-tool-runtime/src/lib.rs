//! Shared tool execution and dispatch contracts.
//!
//! Single home for the `Tool` trait, `ToolDispatch`, `ToolError`,
//! `ToolSearchIndex`, `ToolCallContext`, `ToolStream`,
//! and the helper constructors that build well-formed streams. Adapters
//! for individual tool sources re-export from here so every tool author
//! sees the same surface.

#![forbid(unsafe_code)]

pub mod context;
pub mod dispatch;
pub mod error;
pub mod render;
pub mod search;
pub mod streaming;
pub mod tool;

pub use context::{
    BehaviorVersion, Cancellation, Cwd, ListToolsContext, SessionContext, ToolCallContext,
    TraceContext, TypedExtensions,
};
pub use dispatch::{ResumeInvocation, ToolDispatch};
pub use error::{ToolError, ToolErrorKind};
pub use render::{ToolOutput, extract_content_blocks};
pub use search::{SearchSnapshot, ServerSummary, ToolIndex, ToolSearchIndex, ToolSearchResult};
pub use streaming::{PartialResultPayload, stream_chunk};
pub use tool::{
    ArcTool, ArcToolFamily, ContentBlock, Tool, ToolDyn, ToolFamily, ToolProgress, ToolStream,
    ToolStreamItem, ToolVariant, TypedToolOutput, terminal_only, with_progress,
};

pub use nofy_tool_protocol::{StreamingSpec, ToolCallId, ToolCapabilities, ToolId, ToolScope};
