use super::*;
use nofy_sampling_types::{
    ConversationToolChoice, LengthPolicy, ReasoningEffort, ReasoningSummary,
};

#[derive(Debug, Clone, Copy, Default, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum LengthHandling {
    Fail,
    #[default]
    CompleteToolCalls,
    CompletePartial,
}
impl From<LengthHandling> for LengthPolicy {
    fn from(value: LengthHandling) -> Self {
        match value {
            LengthHandling::Fail => Self::Fail,
            LengthHandling::CompleteToolCalls => Self::CompleteToolCalls,
            LengthHandling::CompletePartial => Self::CompletePartial,
        }
    }
}

#[derive(Debug, Clone, Default, Deserialize)]
#[serde(default, deny_unknown_fields)]
pub struct Parameters {
    pub max_output_tokens: Option<u32>,
    pub temperature: Option<f32>,
    pub top_p: Option<f32>,
    pub reasoning_effort: Option<ReasoningEffort>,
    pub reasoning_summary: Option<ReasoningSummary>,
    pub tool_choice: Option<ConversationToolChoice>,
    pub json_schema: Option<Value>,
    pub prompt_cache_key: Option<String>,
    pub length_policy: Option<LengthHandling>,
    pub structured_output_retries: Option<usize>,
}

pub fn schema(backend: ApiBackend) -> Value {
    json!({
        "type":["object","null"],"additionalProperties":false,
        "properties":{
            "max_output_tokens":{"type":["integer","null"],"minimum":1,"maximum":u32::MAX},
            "temperature":{"type":["number","null"],"minimum":0,"maximum":if backend==ApiBackend::Messages {1.0}else{2.0}},
            "top_p":{"type":["number","null"],"minimum":0,"maximum":1},
            "reasoning_effort":{"enum":[null,"none","minimal","low","medium","high","xhigh","max"]},
            "reasoning_summary":if backend==ApiBackend::Responses {json!({"enum":[null,"none","auto","concise","detailed"]})}else{json!({"type":"null"})},
            "prompt_cache_key":if backend==ApiBackend::Responses {json!({"type":["string","null"],"minLength":1})}else{json!({"type":"null"})},
            "tool_choice":{"anyOf":[{"enum":[null,"auto","none","required"]},{"type":"object","required":["function"],"additionalProperties":false,"properties":{"function":{"type":"string","minLength":1}}}]},
            "json_schema":{"anyOf":[{"type":"object"},{"const":true},{"type":"null"}]},
            "length_policy":{"enum":[null,"fail","complete_tool_calls","complete_partial"]},
            "structured_output_retries":{"type":["integer","null"],"minimum":0,"maximum":5}
        }
    })
}

impl Parameters {
    pub fn parse(value: Value, backend: ApiBackend) -> Result<Self, Error> {
        nofy_agent_runtime::settings::validate_json_value(&schema(backend), &value)?;
        let result: Self = if value.is_null() {
            Self::default()
        } else {
            serde_json::from_value(value)
                .map_err(|e| Error::Model(format!("model parameters: {e}")))?
        };
        if result.structured_output_retries.is_some() && result.json_schema.is_none() {
            return Err(Error::Model(
                "structured_output_retries requires json_schema".into(),
            ));
        }
        if let Some(schema) = &result.json_schema {
            nofy_agent_runtime::settings::validate_json_schema(schema)?;
        }
        Ok(result)
    }

    pub fn request(
        &self,
        request: ModelRequest,
        context: &RunContext,
        backend: ApiBackend,
    ) -> Result<ConversationRequest, Error> {
        let mut tools: Vec<nofy_sampling_types::ToolSpec> =
            request.tools.into_iter().map(Into::into).collect();
        let mut items = request
            .messages
            .into_iter()
            .map(item)
            .collect::<Result<Vec<_>, _>>()?;
        if let Some(schema) = &self.json_schema
            && !backend.supports_native_schema()
        {
            if tools
                .iter()
                .any(|tool| tool.name == super::structured::TOOL)
            {
                return Err(Error::Model(
                    "structured output tool name collides with a registered tool".into(),
                ));
            }
            tools.push(nofy_sampling_types::ToolSpec {name:super::structured::TOOL.into(),description:Some("Submit the final structured answer in value, matching its schema. Never combine this with another tool call.".into()),parameters:super::structured::tool_schema(schema)});
            items.push(ConversationItem::system_reminder("A structured answer is required. At the end call StructuredOutput with {\"value\": your_answer}; its value must match the declared schema. Do not combine finalization with other tools."));
        }
        if let Some(ConversationToolChoice::Function(name)) = &self.tool_choice {
            if !tools.iter().any(|tool| &tool.name == name) {
                return Err(Error::Model(format!(
                    "tool_choice refers to an unavailable tool: {name}"
                )));
            }
        }
        if matches!(self.tool_choice, Some(ConversationToolChoice::Required)) && tools.is_empty() {
            return Err(Error::Model(
                "required tool_choice has no available tools".into(),
            ));
        }
        Ok(ConversationRequest {
            items,
            tools,
            tool_choice: self.tool_choice.clone(),
            temperature: self.temperature,
            max_output_tokens: self.max_output_tokens,
            top_p: self.top_p,
            reasoning_effort: self.reasoning_effort,
            reasoning_summary: self.reasoning_summary,
            json_schema: if backend.supports_native_schema() {
                self.json_schema.clone()
            } else {
                None
            },
            prompt_cache_key: self.prompt_cache_key.clone(),
            length_policy: self.length_policy.unwrap_or_default().into(),
            x_nofy_conv_id: Some(context.thread_id.clone()),
            x_nofy_req_id: Some(context.run_id.clone()),
            ..Default::default()
        })
    }
}
