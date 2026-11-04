//! Provider-neutral model transport. Protocols are externally loaded pure JSON
//! programs; credentials, network authority and physical request accounting are
//! owned by the framework, never by a protocol script.
mod connection;
pub mod declarative;
mod driver;
mod errors;
pub mod execution;
mod json;
mod program;
mod sse;
pub mod worker;
use nofy_agent_runtime::{Error, model::ModelFailure};

fn invalid(message: impl Into<String>) -> Error {
    Error::Composition(message.into())
}
fn failure(code: &str) -> Error {
    ModelFailure {
        category: "model_protocol".into(),
        message: format!("model protocol operation failed: {code}"),
        status: None,
        retryable: false,
        retry_after_ms: None,
        code: Some(code.into()),
        details: serde_json::Value::Null,
    }
    .into()
}

/// Serialize through a bounded writer, including before conversion into Rhai.
/// The cap is not a claim about all allocator or compiled-AST memory.
fn encoded(value: &impl serde::Serialize, limit: usize) -> Result<Vec<u8>, Error> {
    struct Bounded {
        bytes: Vec<u8>,
        limit: usize,
    }
    impl std::io::Write for Bounded {
        fn write(&mut self, bytes: &[u8]) -> std::io::Result<usize> {
            if bytes.len() > self.limit.saturating_sub(self.bytes.len()) {
                return Err(std::io::Error::other("model JSON byte limit"));
            }
            self.bytes
                .try_reserve(bytes.len())
                .map_err(std::io::Error::other)?;
            self.bytes.extend_from_slice(bytes);
            Ok(bytes.len())
        }
        fn flush(&mut self) -> std::io::Result<()> {
            Ok(())
        }
    }
    let mut writer = Bounded {
        bytes: Vec::new(),
        limit,
    };
    serde_json::to_writer(&mut writer, value).map_err(|_| failure("json_byte_limit"))?;
    Ok(writer.bytes)
}
