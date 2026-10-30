//! Model adapter for the composable agent runtime. Provider-native items are
//! retained losslessly in the opaque rail, including reasoning and hosted tools.
use crate::{SamplerConfig, SamplingClient};
use futures_util::StreamExt;
use nofy_agent_runtime::{
    CompletionInfo, Error, Message, Model, ModelCapabilities, ModelChunk, ModelDelta, ModelRequest,
    ModelResponse, ModelStream, RunContext, ToolCall,
};
use nofy_sampling_types::{
    ApiBackend, ConversationItem, ConversationRequest, ConversationResponse,
};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};

pub mod auth;
pub mod declarative;
pub use auth::{AuthRecoveryPolicy, SamplerAuthRecovery};

pub struct SamplerModel {
    config: SamplerConfig,
    limits: Option<ProviderRequestLimits>,
    pinned: bool,
    auth_recovery: Option<std::sync::Arc<SamplerAuthRecovery>>,
}

/// Host-installed guarantees of the provider endpoint, per HTTP request.
/// Input limits must be enforced by that endpoint, including repair requests;
/// informational context-window metadata is not such a guarantee.
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ProviderRequestLimits {
    pub max_input_tokens: u64,
    pub max_output_tokens: u32,
}

impl SamplerModel {
    pub fn new(config: SamplerConfig) -> Self {
        Self {
            config,
            limits: None,
            pinned: false,
            auth_recovery: None,
        }
    }
    pub fn with_request_limits(mut self, limits: ProviderRequestLimits) -> Result<Self, Error> {
        if limits.max_input_tokens == 0 || limits.max_output_tokens == 0 {
            return Err(Error::Composition(
                "provider request limits must be positive".into(),
            ));
        }
        self.limits = Some(limits);
        self.pinned = true;
        Ok(self)
    }
    pub fn with_auth_recovery(
        mut self,
        recovery: std::sync::Arc<SamplerAuthRecovery>,
    ) -> Result<Self, Error> {
        recovery.validate_config(&self.config)?;
        self.pinned = true;
        self.auth_recovery = Some(recovery);
        Ok(self)
    }
    fn effective_config(&self, context: &RunContext) -> Result<SamplerConfig, Error> {
        let config = context
            .capabilities
            .get::<SamplerConfig>()
            .map(|config| (*config).clone())
            .unwrap_or_else(|| self.config.clone());
        if self.pinned {
            let mut installed = self.config.clone();
            let mut supplied = config.clone();
            installed.api_key = None;
            supplied.api_key = None;
            if serde_json::to_value(installed).ok() != serde_json::to_value(supplied).ok() {
                return Err(Error::Composition(
                    "runtime provider override differs from the installed model connection".into(),
                ));
            }
        }
        Ok(config)
    }
    fn output_bound(
        &self,
        parameters: &parameters::Parameters,
        config: &SamplerConfig,
    ) -> Result<Option<u32>, Error> {
        let requested = parameters
            .max_output_tokens
            .or(config.max_completion_tokens);
        if let Some(limits) = &self.limits {
            if requested.is_some_and(|value| value > limits.max_output_tokens) {
                return Err(Error::Composition(
                    "model output limit exceeds installed provider ceiling".into(),
                ));
            }
            Ok(Some(requested.unwrap_or(limits.max_output_tokens)))
        } else {
            Ok(requested)
        }
    }
}

mod mapping;
use mapping::*;

pub mod factory;
mod parameters;
#[cfg(test)]
mod stream_tests;
mod structured;

#[async_trait::async_trait]
impl Model for SamplerModel {
    fn bind_scope(&self, context: &mut RunContext) -> Result<(), Error> {
        let inherited = context.capabilities.remove::<SamplerConfig>();
        if let Some(inherited) = inherited {
            let mut installed = self.config.clone();
            let mut supplied = (*inherited).clone();
            installed.api_key = None;
            supplied.api_key = None;
            installed.model.clear();
            supplied.model.clear();
            if serde_json::to_value(installed).ok() == serde_json::to_value(supplied).ok() {
                let mut config = (*inherited).clone();
                config.model = self.config.model.clone();
                context.capabilities.insert(config);
            }
        }
        Ok(())
    }
    fn calls_used(&self, response: &ModelResponse) -> Option<u64> {
        if let Some(calls) = response
            .info
            .provider
            .get("model_http_attempts")
            .and_then(Value::as_u64)
        {
            return Some(calls);
        }
        response
            .info
            .provider
            .get("structured_output_repairs")
            .and_then(Value::as_u64)
            .and_then(|repairs| repairs.checked_add(1))
    }
    fn request_bound(
        &self,
        request: &ModelRequest,
        context: &RunContext,
    ) -> Result<nofy_agent_runtime::model::ModelRequestBound, Error> {
        let config = self.effective_config(context)?;
        let parameters =
            parameters::Parameters::parse(request.settings.clone(), config.api_backend.clone())?;
        let max_calls = if parameters.json_schema.is_some() {
            parameters.structured_output_retries.unwrap_or(2) as u64 + 1
        } else {
            1
        };
        let max_calls = max_calls
            + u64::from(
                self.auth_recovery
                    .as_ref()
                    .is_some_and(|recovery| recovery.active()),
            );
        let output = self.output_bound(&parameters, &config)?;
        let multiply = |value: u64| {
            value
                .checked_mul(max_calls)
                .ok_or_else(|| Error::Composition("provider request budget overflow".into()))
        };
        Ok(nofy_agent_runtime::model::ModelRequestBound {
            max_calls,
            max_input_tokens: self
                .limits
                .as_ref()
                .map(|limits| multiply(limits.max_input_tokens))
                .transpose()?,
            max_output_tokens: output.map(|value| multiply(u64::from(value))).transpose()?,
        })
    }
    fn validate_settings(&self, settings: &Value) -> Result<(), Error> {
        parameters::Parameters::parse(settings.clone(), self.config.api_backend.clone()).map(|_| ())
    }
    fn capabilities(&self) -> ModelCapabilities {
        ModelCapabilities {
            streaming: true,
            image_input: true,
            structured_output: true,
            settings_schema: Some(parameters::schema(self.config.api_backend.clone())),
        }
    }
    async fn complete(
        &self,
        request: ModelRequest,
        context: &RunContext,
    ) -> Result<ModelResponse, Error> {
        let mut stream = self.stream(request, context).await?;
        while let Some(chunk) = stream.next().await {
            if let ModelChunk::Completed(response) = chunk? {
                return Ok(response);
            }
        }
        Err(Error::Model(
            "sampler stream ended without completion".into(),
        ))
    }
    async fn stream(
        &self,
        request: ModelRequest,
        context: &RunContext,
    ) -> Result<ModelStream, Error> {
        let mut config = self.effective_config(context)?;
        if let Some(recovery) = &self.auth_recovery {
            recovery.prepare(&mut config)?;
        }
        let parameters =
            parameters::Parameters::parse(request.settings.clone(), config.api_backend.clone())?;
        let max_output_tokens = self.output_bound(&parameters, &config)?;
        let mut request = parameters.request(request, context, config.api_backend.clone())?;
        request.max_output_tokens = max_output_tokens;
        let initial_config = config.clone();
        let mut client =
            tokio::task::spawn_blocking(move || SamplingClient::new_pinned(initial_config))
                .await
                .map_err(|error| Error::Model(error.to_string()))?
                .map_err(sampling_failure)?;
        let output_schema = parameters.json_schema.clone();
        let retries = parameters.structured_output_retries.unwrap_or(2);
        let length_policy = request.length_policy;
        let auth_recovery = self.auth_recovery.clone();
        let failed_usage_bound = self
            .limits
            .as_ref()
            .zip(max_output_tokens)
            .map(|(limits, output)| (limits.max_input_tokens, u64::from(output)));
        let cancel = context.cancel.clone();
        let stream = async_stream::try_stream! {
            let mut http_attempts=0u64;let mut auth_attempted=false;let mut auth_failed_requests=0u64;
            let mut trail=Vec::new();let mut input_tokens=0u64;let mut output_tokens=0u64;
            'attempt: for attempt in 0..=retries {
                let mut events=loop {
                    http_attempts=http_attempts.saturating_add(1);
                    match provider_stream(&client,request.clone()).await {
                        Ok(events)=>break events,
                        Err(Error::ModelFailure(failure)) if failure.status==Some(401) && !auth_attempted && auth_recovery.as_ref().is_some_and(|recovery|recovery.active())=>{
                            auth_attempted=true;
                            auth_failed_requests=auth_failed_requests.saturating_add(1);
                            let next=auth_recovery.as_ref().expect("active recovery").refreshed_config(&config,&cancel).await?;
                            let Some(next)=next else {Err(Error::ModelFailure(failure))?;unreachable!()};
                            config=next;
                            let fresh=config.clone();
                            client=tokio::task::spawn_blocking(move||SamplingClient::new_pinned(fresh)).await.map_err(|e|Error::Model(e.to_string()))?.map_err(sampling_failure)?;
                            yield status("auth_recovered",json!({"retry":1}));
                        }
                        Err(error)=>{Err(error)?;unreachable!()},
                    }
                };
                let mut terminal=None;let mut model_metadata=Value::Null;
                use crate::events::{SamplingEvent,SamplingChannel};
                while let Some(event)=events.next().await {
                    match event {
                        SamplingEvent::ChannelToken {channel,text,..}=>yield ModelChunk::Delta(match channel {
                            SamplingChannel::Text=>ModelDelta::Text {text},SamplingChannel::Reasoning=>ModelDelta::Reasoning {text},
                        }),
                        SamplingEvent::ToolCallDelta {tool_index,id,name,arguments_delta,..}=>yield ModelChunk::Delta(ModelDelta::ToolCall {index:tool_index,id,name,arguments:arguments_delta}),
                        SamplingEvent::Completed {response,metrics,..}=>{terminal=Some((*response,metrics));break;}
                        SamplingEvent::Failed {error,..}=>Err(provider_failure(error))?,
                        SamplingEvent::StreamStarted {..}=>yield status("stream_started",json!({"attempt":attempt})),
                        SamplingEvent::FirstToken {..}=>yield status("first_token",json!({"attempt":attempt})),
                        SamplingEvent::ResponseStarted {message_id,model,input_tokens,cache_read_input_tokens,cache_creation_input_tokens,..}=>yield status("response_started",json!({"message_id":message_id,"model":model,"input_tokens":input_tokens,"cache_read_input_tokens":cache_read_input_tokens,"cache_creation_input_tokens":cache_creation_input_tokens})),
                        SamplingEvent::ReasoningCompleted {signature,..}=>yield status("reasoning_completed",json!({"signature":signature})),
                        SamplingEvent::ImagesStripped {stripped_urls,reason,..}=>yield status("images_stripped",json!({"urls":stripped_urls,"reason":format!("{reason:?}")})),
                        SamplingEvent::Retrying {attempt,max_retries,reason,..}=>yield status("retrying",json!({"attempt":attempt,"max_retries":max_retries,"reason":reason})),
                        SamplingEvent::ModelMetadata {metadata,..}=>{
                            model_metadata=serde_json::to_value(metadata).map_err(|e|Error::Model(e.to_string()))?;
                            yield status("model_metadata",model_metadata.clone());
                        }
                        SamplingEvent::BackendToolCallStarted {call_id,name,..}=>yield status("backend_tool_started",json!({"call_id":call_id,"name":name})),
                        SamplingEvent::BackendToolCallCompleted {call_id,name,result,..}=>yield status("backend_tool_completed",json!({"call_id":call_id,"name":name,"result":result})),
                    }
                }
                let (response,metrics)=terminal.ok_or_else(||Error::Model("provider stream ended without a terminal event".into()))?;
                input_tokens=input_tokens.saturating_add(response.usage.as_ref().map_or(0,|usage|u64::from(usage.prompt_tokens)));
                output_tokens=output_tokens.saturating_add(response.usage.as_ref().map_or(0,|usage|u64::from(usage.completion_tokens)));
                yield status("model_attempt_usage",json!({"attempt":attempt,"usage":response.usage,"cost_usd_ticks":response.cost_usd_ticks}));
                let response=crate::client::apply_length_policy(length_policy,response).map_err(sampling_failure)?;
                let final_value=if let Some(schema)=&output_schema && response.stop_reason!=Some(nofy_sampling_types::StopReason::ContentFilter) {
                    match structured::finalize(schema,&response) {
                        Ok(value)=>value,
                        Err(error) if attempt<retries=>{
                            let feedback=structured::repair_items(&response,&error);
                            request.items.extend(feedback.clone());trail.extend(feedback);
                            yield status("structured_output_retry",json!({"attempt":attempt+1,"maximum":retries,"error":error}));
                            continue 'attempt;
                        }
                        Err(error)=>Err(Error::Model(format!("structured output repair budget exhausted: {error}")))?,
                    }
                } else {None};
                let mut response=converted(response)?;
                if let Some((value,call_id))=final_value {
                    response.output=value.to_string();response.info.structured_output=Some(value.clone());
                    if let Some(call_id)=call_id {
                        response.tool_calls.clear();
                        response.messages.push(Message::Tool {call_id,content:json!({"structured_output":value}),is_error:false});
                    }
                }
                let mut messages=opaque(trail)?;messages.append(&mut response.messages);response.messages=messages;
                response.input_tokens=input_tokens;response.output_tokens=output_tokens;
                if auth_failed_requests>0 {
                    response.info.provider["auth_failed_requests"]=json!(auth_failed_requests);
                    if let Some((input,output))=failed_usage_bound {
                        let input=input.saturating_mul(auth_failed_requests);let output=output.saturating_mul(auth_failed_requests);
                        response.input_tokens=response.input_tokens.saturating_add(input);response.output_tokens=response.output_tokens.saturating_add(output);
                        response.info.provider["auth_failed_usage"]=json!({"accounting":"reserved_upper_bound","input_tokens":input,"output_tokens":output});
                    } else {response.info.provider["auth_failed_usage"]=json!({"accounting":"unknown","requests":auth_failed_requests});}
                }
                response.info.provider["metrics"]=serde_json::to_value(metrics).map_err(|e|Error::Model(e.to_string()))?;
                response.info.provider["structured_output_repairs"]=json!(attempt);
                response.info.provider["model_http_attempts"]=json!(http_attempts);
                response.info.provider["model_metadata"]=model_metadata;
                yield ModelChunk::Completed(response);return;
            }
        };
        Ok(stream.boxed())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn opaque_items_round_trip_without_changing_provider_fields() {
        let original = ConversationItem::assistant_with_model("answer", "custom-model");
        let value = serde_json::to_value(&original).unwrap();
        let restored = item(Message::Opaque {
            provider: "nofy-sampler".into(),
            value: value.clone(),
        })
        .unwrap();
        assert_eq!(serde_json::to_value(restored).unwrap(), value);
    }
    #[test]
    fn tool_content_preserves_inline_images_and_original_preset_prompt_text() {
        let result=item(Message::Tool {call_id:"image-call".into(),is_error:false,content:serde_json::json!({
            "value":{"prompt_text":"original prompt"},"model_output":[{"type":"text","text":"fallback"},
            {"type":"image","mime_type":"image/png","data":"AA=="}]})}).unwrap();
        let ConversationItem::ToolResult(result) = result else {
            panic!("not a tool result")
        };
        assert_eq!(result.content.as_ref(), "original prompt");
        assert_eq!(result.tool_call_id, "image-call");
        assert!(
            matches!(&result.images[0],nofy_sampling_types::conversation::ContentPart::Image {url} if url.as_ref()=="data:image/png;base64,AA==")
        );
    }
}

#[cfg(test)]
mod declarative_tests;
