//! Opt-in fallback after a provider explicitly rejects images or context size.
use super::ModelRequestBound;
use crate::{
    Error, InputPart, Message, Model, ModelCapabilities, ModelChunk, ModelRequest, ModelResponse,
    ModelStream, RunContext, registry::*,
};
use futures::StreamExt;
use serde::Deserialize;
use serde_json::{Value, json};
use std::{collections::BTreeMap, sync::Arc};
pub struct ImageFallbackFactory;
pub struct ContextFallbackFactory;
#[derive(Clone, Deserialize)]
#[serde(default, deny_unknown_fields)]
struct Config {
    statuses: Vec<u16>,
    codes: Vec<String>,
    replacement: String,
}
impl Default for Config {
    fn default() -> Self {
        Self {
            statuses: vec![400, 415, 422],
            codes: vec![],
            replacement: "[Image omitted after the model rejected image input.]".into(),
        }
    }
}
impl ModuleFactory for ImageFallbackFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: "model.image_fallback".into(),
            revision: "1".into(),
            kind: ModuleKind::Model,
            config_schema: json!({"type":"object","additionalProperties":false,"properties":{"statuses":{"type":"array","maxItems":32,"items":{"type":"integer","minimum":400,"maximum":499}},"codes":{"type":"array","maxItems":32,"items":{"type":"string","minLength":1}},"replacement":{"type":"string","minLength":1,"maxLength":4096}}}),
            input_schema: None,
            output_schema: None,
            required_capabilities: Default::default(),
            dependencies: BTreeMap::from([("model".into(), ModuleKind::Model)]),
        }
    }
    fn build(
        &self,
        value: &Value,
        deps: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        crate::settings::validate_json_value(&self.descriptor().config_schema, value)?;
        let config =
            serde_json::from_value(value.clone()).map_err(|e| Error::Composition(e.to_string()))?;
        let Some(ModuleInstance::Model(model)) = deps.get("model") else {
            return Err(Error::Composition("image fallback needs a model".into()));
        };
        Ok(ModuleInstance::Model(Arc::new(ImageFallback {
            model: model.clone(),
            config,
            mode: Mode::Images,
        })))
    }
}
#[derive(Clone)]
struct ImageFallback {
    model: Arc<dyn Model>,
    config: Config,
    mode: Mode,
}
#[derive(Clone)]
enum Mode {
    Images,
    Context { keep_turns: usize },
}
impl ModuleFactory for ContextFallbackFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        let mut descriptor = ImageFallbackFactory.descriptor();
        descriptor.factory = "model.context_fallback".into();
        descriptor.config_schema = json!({"type":"object","additionalProperties":false,"properties":{"keep_turns":{"type":"integer","minimum":1,"maximum":64},"codes":{"type":"array","maxItems":32,"items":{"type":"string","minLength":1}}}});
        descriptor
    }
    fn build(
        &self,
        value: &Value,
        deps: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        crate::settings::validate_json_value(&self.descriptor().config_schema, value)?;
        let Some(ModuleInstance::Model(model)) = deps.get("model") else {
            return Err(Error::Composition("context fallback needs a model".into()));
        };
        let codes = if let Some(codes) = value.get("codes") {
            serde_json::from_value(codes.clone()).map_err(|e| Error::Composition(e.to_string()))?
        } else {
            vec![
                "context_length_exceeded".into(),
                "max_context_length".into(),
                "context_window_exceeded".into(),
            ]
        };
        Ok(ModuleInstance::Model(Arc::new(ImageFallback {model:model.clone(),config:Config {statuses:vec![413],codes,replacement:"[Earlier context omitted after a confirmed provider context overflow. Complete original history remains in the run checkpoint.]".into()},mode:Mode::Context {keep_turns:value["keep_turns"].as_u64().unwrap_or(2) as usize}})))
    }
}
fn stripped(mut request: ModelRequest, replacement: &str) -> Option<(ModelRequest, u64)> {
    if request
        .settings
        .get("hosted_tools")
        .is_some_and(|v| !v.is_null() && v.as_array().is_none_or(|v| !v.is_empty()))
    {
        return None;
    }
    let mut count = 0;
    for message in &mut request.messages {
        if let Message::UserParts { content } = message {
            for part in content {
                if matches!(part, InputPart::Image { .. }) {
                    *part = InputPart::Text {
                        text: replacement.into(),
                    };
                    count += 1;
                }
            }
        }
    }
    (count > 0).then_some((request, count))
}
impl ImageFallback {
    fn label(&self) -> &'static str {
        match self.mode {
            Mode::Images => "image_fallback",
            Mode::Context { .. } => "context_fallback",
        }
    }
    fn key(&self) -> &'static str {
        match self.mode {
            Mode::Images => "_image_fallback",
            Mode::Context { .. } => "_context_fallback",
        }
    }
    fn view(&self, mut request: ModelRequest) -> Option<(ModelRequest, u64)> {
        if request
            .settings
            .get("hosted_tools")
            .is_some_and(|v| !v.is_null() && v.as_array().is_none_or(|v| !v.is_empty()))
        {
            return None;
        }
        match self.mode {
            Mode::Images => stripped(request, &self.config.replacement),
            Mode::Context { keep_turns } => {
                let turns = request
                    .messages
                    .iter()
                    .enumerate()
                    .filter_map(|(i, m)| {
                        matches!(m, Message::User { .. } | Message::UserParts { .. }).then_some(i)
                    })
                    .collect::<Vec<_>>();
                let start = *turns.get(turns.len().saturating_sub(keep_turns))?;
                let removed = request.messages[..start]
                    .iter()
                    .filter(|m| !matches!(m, Message::System { .. }))
                    .count();
                if removed == 0 {
                    return None;
                }
                let mut messages = request.messages[..start]
                    .iter()
                    .filter(|m| matches!(m, Message::System { .. }))
                    .cloned()
                    .collect::<Vec<_>>();
                messages.push(Message::System {
                    content: self.config.replacement.clone(),
                });
                messages.extend_from_slice(&request.messages[start..]);
                request.messages = messages;
                Some((request, removed as u64))
            }
        }
    }
    fn accepts(&self, error: &Error) -> bool {
        matches!(error,Error::ModelFailure(f) if f.status.is_some_and(|s|self.config.statuses.contains(&s)) || f.code.as_ref().is_some_and(|c|self.config.codes.contains(c)))
    }
}
struct StreamState {
    wrapper: ImageFallback,
    context: RunContext,
    request: ModelRequest,
    active: Option<ModelStream>,
    observed: bool,
    fallback: Option<Value>,
    removed: u64,
    bound: ModelRequestBound,
    done: bool,
}
#[async_trait::async_trait]
impl Model for ImageFallback {
    fn capabilities(&self) -> ModelCapabilities {
        self.model.capabilities()
    }
    fn validate_settings(&self, settings: &Value) -> Result<(), Error> {
        self.model.validate_settings(settings)
    }
    fn bind_scope(&self, context: &mut RunContext) -> Result<(), Error> {
        self.model.bind_scope(context)
    }
    async fn validate_live_history(&self, messages: &[Message]) -> Result<(), Error> {
        self.model.validate_live_history(messages).await
    }
    fn calls_used(&self, response: &ModelResponse) -> Option<u64> {
        response.info.provider[self.key()]["calls"].as_u64()
    }
    async fn request_bound(
        &self,
        request: &ModelRequest,
        context: &RunContext,
    ) -> Result<ModelRequestBound, Error> {
        let bound = self.model.request_bound(request, context).await?;
        let multiplier = if self.view(request.clone()).is_some() {
            2
        } else {
            1
        };
        let multiply = |v: u64| {
            v.checked_mul(multiplier)
                .ok_or_else(|| Error::Composition("image fallback request bound overflow".into()))
        };
        Ok(ModelRequestBound {
            max_calls: multiply(bound.max_calls)?,
            max_input_tokens: bound.max_input_tokens.map(multiply).transpose()?,
            max_output_tokens: bound.max_output_tokens.map(multiply).transpose()?,
        })
    }
    async fn complete(
        &self,
        request: ModelRequest,
        context: &RunContext,
    ) -> Result<ModelResponse, Error> {
        let mut stream = self.stream(request, context).await?;
        while let Some(item) = stream.next().await {
            if let ModelChunk::Completed(response) = item? {
                return Ok(response);
            }
        }
        Err(Error::Model(
            "image fallback stream ended without completion".into(),
        ))
    }
    async fn stream(
        &self,
        request: ModelRequest,
        context: &RunContext,
    ) -> Result<ModelStream, Error> {
        let bound = self.model.request_bound(&request, context).await?;
        let state = StreamState {
            wrapper: self.clone(),
            context: context.clone(),
            request,
            active: None,
            observed: false,
            fallback: None,
            removed: 0,
            bound,
            done: false,
        };
        Ok(Box::pin(futures::stream::unfold(
            state,
            |mut state| async move {
                if state.done {
                    return None;
                }
                let next = if let Some(stream) = &mut state.active {
                    stream.next().await
                } else {
                    match state
                        .wrapper
                        .model
                        .stream(state.request.clone(), &state.context)
                        .await
                    {
                        Ok(stream) => {
                            state.active = Some(stream);
                            state.active.as_mut().expect("opened stream").next().await
                        }
                        Err(error) => Some(Err(error)),
                    }
                };
                match next {
                    Some(Err(error))
                        if !state.observed
                            && state.fallback.is_none()
                            && state.wrapper.accepts(&error) =>
                    {
                        if let Some((request, removed)) = state.wrapper.view(state.request.clone())
                        {
                            let failure = match error {
                                Error::ModelFailure(f) => {
                                    json!({"status":f.status,"code":f.code,"category":f.category})
                                }
                                _ => unreachable!(),
                            };
                            state.request = request;
                            state.active = None;
                            state.removed = removed;
                            state.fallback = Some(failure.clone());
                            Some((
                                Ok(ModelChunk::Delta(crate::ModelDelta::Status {
                                    name: state.wrapper.label().into(),
                                    data: json!({"removed_items":removed,"failure":failure}),
                                })),
                                state,
                            ))
                        } else {
                            state.done = true;
                            Some((Err(error), state))
                        }
                    }
                    Some(Ok(ModelChunk::Completed(mut response))) => {
                        let calls = state
                            .wrapper
                            .model
                            .calls_used(&response)
                            .unwrap_or(state.bound.max_calls)
                            .saturating_add(if state.fallback.is_some() {
                                state.bound.max_calls
                            } else {
                                0
                            });
                        if state.fallback.is_some() {
                            response.input_tokens = response
                                .input_tokens
                                .saturating_add(state.bound.max_input_tokens.unwrap_or(0));
                            response.output_tokens = response
                                .output_tokens
                                .saturating_add(state.bound.max_output_tokens.unwrap_or(0));
                        }
                        if !response.info.provider.is_object() {
                            response.info.provider = json!({"underlying":response.info.provider});
                        }
                        let key = state.wrapper.key();
                        response.info.provider[key] = json!({"calls":calls,"removed_images":if matches!(state.wrapper.mode,Mode::Images){state.removed}else{0},"removed_messages":if matches!(state.wrapper.mode,Mode::Context {..}){state.removed}else{0},"first_rejection":state.fallback,"failed_attempt_accounting":"reserved_upper_bound"});
                        state.done = true;
                        Some((Ok(ModelChunk::Completed(response)), state))
                    }
                    Some(Ok(chunk)) => {
                        state.observed = true;
                        Some((Ok(chunk), state))
                    }
                    Some(Err(error)) => {
                        state.done = true;
                        Some((Err(error), state))
                    }
                    None => None,
                }
            },
        )))
    }
}
