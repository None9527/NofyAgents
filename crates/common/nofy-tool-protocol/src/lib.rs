//! Product-neutral tool identities and capability metadata.
//!
//! Invocation, output, cancellation and error contracts live in
//! `nofy-tool-runtime`; this crate does not define a second transport.

#![forbid(unsafe_code)]

mod capabilities;
mod ids;

pub use capabilities::{StreamingSpec, ToolCapabilities, ToolScope};
pub use ids::{IdError, ToolCallId, ToolId};
