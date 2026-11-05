use async_trait::async_trait;
pub mod image_fallback;
use futures::stream::BoxStream;
use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::{Error, RunContext};
use nofy_tool_types::ToolDefinition;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ToolCall {
    pub id: String,
    pub name: String,
    pub arguments: Value,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum InputPart {
    Text { text: String },
    Image { url: String },
}

/// Opaque items retain provider-native data without making the core depend on
/// a provider's SDK. Adapters must preserve their position and original bytes
/// when the provider requires a stable request prefix.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "role", rename_all = "snake_case")]
pub enum Message {
    System {
        content: String,
    },
    User {
        content: String,
    },
    UserParts {
        content: Vec<InputPart>,
    },
    Assistant {
        content: String,
        tool_calls: Vec<ToolCall>,
    },
    Tool {
        call_id: String,
        content: Value,
        is_error: bool,
    },
    Opaque {
        provider: String,
        value: Value,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ModelRequest {
    pub messages: Vec<Message>,
    pub tools: Vec<ToolDefinition>,
    pub settings: Value,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct ModelResponse {
    pub messages: Vec<Message>,
    pub output: String,
    pub tool_calls: Vec<ToolCall>,
    pub input_tokens: u64,
    pub output_tokens: u64,
    pub info: CompletionInfo,
}

/// An upper bound for a complete SDK invocation, including any internal repair
/// attempts. Token bounds must be guaranteed by the installed model endpoint;
/// a heuristic estimate is not a hard-budget admission proof.
#[derive(Debug, Clone)]
pub struct ModelRequestBound {
    pub max_calls: u64,
    pub max_input_tokens: Option<u64>,
    pub max_output_tokens: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PendingModel {
    pub operation_id: String,
    pub request: ModelRequest,
    pub context_revisions: Vec<Option<String>>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, PartialEq)]
pub struct CompletionInfo {
    pub stop_reason: Option<String>,
    pub refusal: Option<String>,
    pub structured_output: Option<Value>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub hook_stop_reason: Option<String>,
    #[serde(default)]
    pub provider: Value,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(default)]
pub struct ModelCapabilities {
    pub streaming: bool,
    pub image_input: bool,
    pub structured_output: bool,
    /// None means application-defined opaque parameters. A supplied schema
    /// must be local and is enforced both at compile and after middleware.
    pub settings_schema: Option<Value>,
}
impl ModelCapabilities {
    pub fn validate_settings(&self, settings: &Value) -> Result<(), Error> {
        if let Some(schema) = &self.settings_schema {
            crate::tools::validate_schema(schema)?;
            jsonschema::validate(schema, settings).map_err(|e| {
                Error::Composition(format!("model settings {}: {e}", e.instance_path))
            })?;
        }
        Ok(())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum ModelDelta {
    Text {
        text: String,
    },
    Reasoning {
        text: String,
    },
    ToolCall {
        index: u32,
        id: Option<String>,
        name: Option<String>,
        arguments: Option<String>,
    },
    Status {
        name: String,
        data: Value,
    },
}

#[derive(Debug, Clone)]
pub enum ModelChunk {
    Delta(ModelDelta),
    Completed(ModelResponse),
}
pub type ModelStream = BoxStream<'static, Result<ModelChunk, Error>>;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelFailure {
    pub category: String,
    pub message: String,
    pub status: Option<u16>,
    pub retryable: bool,
    pub retry_after_ms: Option<u64>,
    pub code: Option<String>,
    #[serde(default)]
    pub details: Value,
}
impl std::fmt::Display for ModelFailure {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        if let Some(status) = self.status {
            write!(f, "HTTP {status} ")?;
        }
        write!(f, "{}: {}", self.category, self.message)
    }
}
impl std::error::Error for ModelFailure {}

#[async_trait]
pub trait Model: Send + Sync {
    /// Validate retained history without provider IO or discarding native data.
    /// Async execution permits an isolated evaluator; callers must not hold a
    /// storage transaction while awaiting it. Opaque data is rejected by default.
    async fn validate_live_history(&self, messages: &[Message]) -> Result<(), Error> {
        if messages
            .iter()
            .any(|message| matches!(message, Message::Opaque { .. }))
        {
            return Err(Error::Composition(
                "live transition requires an explicit provider-native history validator".into(),
            ));
        }
        Ok(())
    }
    /// Pure binding for an explicit scoped model selection. Provider adapters
    /// may remove an inherited connection override; this never mutates the
    /// parent context and must not perform IO.
    fn bind_scope(&self, _context: &mut RunContext) -> Result<(), Error> {
        Ok(())
    }
    /// None charges the declared maximum call count. Adapters returning an
    /// exact value must include their internal repair attempts.
    fn calls_used(&self, _response: &ModelResponse) -> Option<u64> {
        None
    }
    /// Compute admission before reserving budget or dispatching provider IO.
    /// Implementations may await an isolated evaluator, not a provider request.
    async fn request_bound(
        &self,
        _request: &ModelRequest,
        _context: &RunContext,
    ) -> Result<ModelRequestBound, Error> {
        Ok(ModelRequestBound {
            max_calls: 1,
            max_input_tokens: None,
            max_output_tokens: None,
        })
    }
    fn capabilities(&self) -> ModelCapabilities {
        ModelCapabilities::default()
    }
    fn validate_settings(&self, settings: &Value) -> Result<(), Error> {
        self.capabilities().validate_settings(settings)
    }
    async fn complete(
        &self,
        request: ModelRequest,
        context: &RunContext,
    ) -> Result<ModelResponse, Error>;

    /// Existing complete-only implementations remain valid. Streaming adapters
    /// override this method and yield exactly one final Completed response.
    async fn stream(
        &self,
        request: ModelRequest,
        context: &RunContext,
    ) -> Result<ModelStream, Error> {
        let response = self.complete(request, context).await?;
        Ok(Box::pin(futures::stream::iter([Ok(
            ModelChunk::Completed(response),
        )])))
    }
}
