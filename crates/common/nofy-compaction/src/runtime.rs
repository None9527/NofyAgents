//! Optional composable-runtime adapter over the existing selection, sampling
//! and full-replace assembly algorithms. Product trigger wiring is unchanged.
use crate::{item::CompactionItemFactory, *};
use nofy_agent_runtime::{
    Error, Message, Model, ModelRequest, RunContext, RunState, context_policy::*, registry::*,
};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use std::{
    collections::BTreeMap,
    sync::{
        Arc, Mutex,
        atomic::{AtomicU64, Ordering},
    },
    time::Duration,
};

mod view;
pub use view::{BytesTokenCounter, ContextTokenCounter};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum CompactionMode {
    FullReplace,
    TailKeep,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(default, deny_unknown_fields)]
pub struct ContextConfig {
    pub mode: CompactionMode,
    pub context_window: u64,
    pub threshold_percent: u8,
    pub keep_tokens: u32,
    pub min_compactable: u32,
    pub max_attempts: u32,
    pub retry_delay_secs: u64,
    pub sampling_timeout_secs: u64,
    pub model_settings: Value,
}
impl Default for ContextConfig {
    fn default() -> Self {
        Self {
            mode: CompactionMode::FullReplace,
            context_window: 200_000,
            threshold_percent: DEFAULT_AUTO_COMPACT_THRESHOLD_PERCENT,
            keep_tokens: 16_000,
            min_compactable: 256,
            max_attempts: 1,
            retry_delay_secs: 0,
            sampling_timeout_secs: 120,
            model_settings: json!({}),
        }
    }
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Plan {
    keep_from: usize,
    history_hash: String,
    before_tokens: u64,
}

pub struct CompactionPolicy {
    config: ContextConfig,
    model: Arc<dyn Model>,
    counter: Arc<dyn ContextTokenCounter>,
}
impl CompactionPolicy {
    pub fn new(
        config: ContextConfig,
        model: Arc<dyn Model>,
        counter: Arc<dyn ContextTokenCounter>,
    ) -> Result<Self, Error> {
        if config.context_window == 0
            || config.threshold_percent == 0
            || config.threshold_percent > 100
            || !(1..=5).contains(&config.max_attempts)
            || config.retry_delay_secs > 30
            || !(1..=600).contains(&config.sampling_timeout_secs)
            || config.min_compactable == 0
        {
            return Err(invalid(
                "invalid compaction thresholds, retry or timeout limits",
            ));
        }
        model.validate_settings(&config.model_settings)?;
        Ok(Self {
            config,
            model,
            counter,
        })
    }
}
#[async_trait::async_trait]
impl ContextPolicy for CompactionPolicy {
    async fn plan(&self, state: &RunState, _: &RunContext) -> Result<Option<Value>, Error> {
        if !state.pending_tools.is_empty() || state.in_flight.is_some() {
            return Ok(None);
        }
        let before_tokens = state
            .messages
            .iter()
            .map(|item| u64::from(self.counter.count(item)))
            .fold(0u64, u64::saturating_add);
        if !nofy_token_estimation::exceeds_threshold(
            before_tokens,
            self.config.context_window,
            self.config.threshold_percent,
        ) {
            return Ok(None);
        }
        let Some(human_start) = state.hook_progress.input_start_index else {
            return Err(invalid("compaction needs the current input boundary"));
        };
        if human_start <= 1
            || human_start >= state.messages.len()
            || !matches!(state.messages.first(), Some(Message::System { .. }))
        {
            return Ok(None);
        }
        let keep_from = match self.config.mode {
            CompactionMode::FullReplace => human_start,
            CompactionMode::TailKeep => {
                let items = state.messages[1..]
                    .iter()
                    .map(view::ItemView::new)
                    .collect::<Result<Vec<_>, _>>()?;
                let counts = state.messages[1..]
                    .iter()
                    .map(|item| self.counter.count(item))
                    .collect::<Vec<_>>();
                if counts.iter().copied().fold(0u32, u32::saturating_add) <= self.config.keep_tokens
                {
                    return Ok(None);
                }
                // An indivisible current tool group may exceed the target.
                // Keep the whole current turn and compact only older history.
                select_turns_to_compact(
                    &counts,
                    &items,
                    self.config.keep_tokens,
                    self.config.min_compactable,
                )
                .map_or(human_start, |plan| (plan.split_idx + 1).min(human_start))
            }
        };
        let compactable = state.messages[1..keep_from]
            .iter()
            .map(|item| u64::from(self.counter.count(item)))
            .sum::<u64>();
        if compactable < u64::from(self.config.min_compactable) {
            return Ok(None);
        }
        serde_json::to_value(Plan {
            keep_from,
            history_hash: history_hash(&state.messages)?,
            before_tokens,
        })
        .map(Some)
        .map_err(|e| invalid(e.to_string()))
    }
    async fn apply(
        &self,
        state: &RunState,
        plan: &Value,
        context: &RunContext,
    ) -> Result<ContextUpdate, Error> {
        let plan: Plan =
            serde_json::from_value(plan.clone()).map_err(|e| invalid(e.to_string()))?;
        if plan.history_hash != history_hash(&state.messages)?
            || plan.keep_from <= 1
            || plan.keep_from >= state.messages.len()
        {
            return Err(invalid("compaction proposal no longer matches history"));
        }
        let sampler = RuntimeSampler {
            model: self.model.clone(),
            context: context.clone(),
            settings: self.config.model_settings.clone(),
            usage: Mutex::new((0, 0)),
            sequence: AtomicU64::new(0),
            control: Mutex::new(None),
        };
        let output = apply_full_replace_compaction(
            &sampler,
            &state.messages[..plan.keep_from],
            None,
            FullReplaceContext {
                system_message: state.messages[0].clone(),
                user_message_prefix: String::new(),
                agents_md_reminder: None,
                last_user_query: None,
                recent_messages: state.messages[plan.keep_from..].to_vec(),
                system_reminder: None,
                transcript_hint: None,
            },
            &FullReplaceConfig {
                max_attempts: self.config.max_attempts,
                retry_delay_secs: self.config.retry_delay_secs,
                sampling_timeout_secs: self.config.sampling_timeout_secs,
            },
            &(),
        )
        .await;
        if let Some(error) = sampler
            .control
            .lock()
            .map_err(|_| invalid("compaction control lock poisoned"))?
            .take()
        {
            return Err(error);
        }
        let output = output.map_err(|e| Error::Model(e.to_string()))?;
        let after_tokens = output
            .history
            .iter()
            .map(|item| u64::from(self.counter.count(item)))
            .sum::<u64>();
        if after_tokens >= plan.before_tokens {
            return Err(invalid(
                "compaction did not reduce context; history remains unchanged",
            ));
        }
        let (input_tokens, output_tokens) = *sampler
            .usage
            .lock()
            .map_err(|_| invalid("compaction usage lock poisoned"))?;
        Ok(ContextUpdate {
            messages: output.history,
            retained_from: plan.keep_from,
            retained_at: 2,
            input_tokens,
            output_tokens,
            metadata: json!({"mode":self.config.mode,"before_tokens":plan.before_tokens,"after_tokens":after_tokens,"attempts":output.attempts}),
        })
    }
}
struct RuntimeSampler {
    model: Arc<dyn Model>,
    context: RunContext,
    settings: Value,
    usage: Mutex<(u64, u64)>,
    sequence: AtomicU64,
    control: Mutex<Option<Error>>,
}
#[async_trait::async_trait]
impl CompactionSampler for RuntimeSampler {
    type Item = Message;
    async fn sample_compaction(
        &self,
        turns: &[Message],
        prompt: &CompactionPrompt,
        timeout: Duration,
    ) -> Result<LlmCompactionOutput, CompactionSampleError> {
        let mut messages = turns.to_vec();
        if !prompt.system.is_empty() {
            messages.insert(
                0,
                Message::System {
                    content: prompt.system.clone(),
                },
            );
        }
        messages.push(Message::User {
            content: prompt.user.clone(),
        });
        let request = ModelRequest {
            messages,
            tools: vec![],
            settings: self.settings.clone(),
        };
        let sequence = self.sequence.fetch_add(1, Ordering::SeqCst);
        let operation = serde_json::to_string(&(
            nofy_agent_runtime::governance::operation_scope(&self.context).unwrap_or_else(|| {
                format!(
                    "compaction:{}:{}",
                    self.context.thread_id, self.context.run_id
                )
            }),
            sequence,
        ))
        .map_err(|e| CompactionSampleError::Build(e.to_string()))?;
        let mut context = self.context.clone();
        context.cancel = context.cancel.child_token();
        let sample = nofy_agent_runtime::governance::sample_model(
            self.model.as_ref(),
            request,
            &context,
            &operation,
            false,
            |_| async { Ok(()) },
        );
        tokio::pin!(sample);
        let response = match tokio::time::timeout(timeout, &mut sample).await {
            Ok(result) => result,
            Err(_) => {
                context.cancel.cancel();
                let _ = tokio::time::timeout(Duration::from_millis(500), &mut sample).await;
                if !nofy_agent_runtime::governance::is_governed(&self.context) {
                    return Err(CompactionSampleError::Timeout {
                        timeout_secs: timeout.as_secs(),
                        collected_bytes: 0,
                    });
                }
                return Err(CompactionSampleError::Build(
                    "compaction sampling timed out; request will not be replayed automatically"
                        .into(),
                ));
            }
        };
        let response = response.map_err(|error| {
            let message = error.to_string();
            if matches!(&error, Error::ModelFailure(failure) if failure.retryable)
                && !nofy_agent_runtime::governance::is_governed(&self.context)
            {
                return CompactionSampleError::Other(anyhow::anyhow!(message));
            }
            if matches!(
                error,
                Error::BudgetExceeded
                    | Error::Cancelled
                    | Error::GovernancePaused(_)
                    | Error::Checkpoint(_)
            ) {
                if let Ok(mut control) = self.control.lock() {
                    *control = Some(error);
                }
            }
            // Transport retry belongs to the shared model boundary. The
            // native compactor still owns empty/degenerate-summary retries.
            CompactionSampleError::Build(message)
        })?;
        {
            let mut usage = self.usage.lock().map_err(|_| {
                CompactionSampleError::Build("compaction usage lock poisoned".into())
            })?;
            usage.0 = usage.0.saturating_add(response.input_tokens);
            usage.1 = usage.1.saturating_add(response.output_tokens);
        }
        if !response.tool_calls.is_empty()
            || response.info.refusal.is_some()
            || matches!(
                response.info.stop_reason.as_deref(),
                Some("length" | "max_tokens" | "max_output_tokens")
            )
        {
            return Err(CompactionSampleError::Build(
                "compaction requires a complete textual summary without tool requests".into(),
            ));
        }
        Ok(LlmCompactionOutput {
            response: response.output,
            thinking: String::new(),
        })
    }
}
impl CompactionItemFactory for Message {
    fn new_user(text: String) -> Self {
        Message::User { content: text }
    }
    fn new_user_meta(text: String) -> Self {
        Message::User { content: text }
    }
    fn new_project_instructions(text: String) -> Self {
        Message::User { content: text }
    }
    fn new_system_reminder(text: String) -> Self {
        Message::User { content: text }
    }
}
fn history_hash(messages: &[Message]) -> Result<String, Error> {
    Ok(
        blake3::hash(&serde_json::to_vec(messages).map_err(|e| invalid(e.to_string()))?)
            .to_hex()
            .to_string(),
    )
}
fn invalid(message: impl Into<String>) -> Error {
    Error::Composition(message.into())
}

pub struct CompactionFactory {
    counter: Arc<dyn ContextTokenCounter>,
    revision: String,
}
impl CompactionFactory {
    pub fn new(counter: Arc<dyn ContextTokenCounter>, revision: &str) -> Result<Self, Error> {
        if revision.trim().is_empty() {
            return Err(invalid("token counter revision is required"));
        }
        Ok(Self {
            counter,
            revision: format!("1:{revision}"),
        })
    }
    pub fn bytes_estimate() -> Self {
        Self::new(Arc::new(BytesTokenCounter), "nofy.bytes_4@1").expect("static revision")
    }
}
impl ModuleFactory for CompactionFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: "context.compaction".into(),
            revision: self.revision.clone(),
            kind: ModuleKind::ContextPolicy,
            config_schema: json!({"type":"object","additionalProperties":false,"required":["context_window"],"properties":{
                "mode":{"enum":["full_replace","tail_keep"]},"context_window":{"type":"integer","minimum":1},"threshold_percent":{"type":"integer","minimum":1,"maximum":100},
                "keep_tokens":{"type":"integer","minimum":0},"min_compactable":{"type":"integer","minimum":1},"max_attempts":{"type":"integer","minimum":1,"maximum":5},
                "retry_delay_secs":{"type":"integer","minimum":0,"maximum":30},"sampling_timeout_secs":{"type":"integer","minimum":1,"maximum":600},"model_settings":{"type":"object"}
            }}),
            input_schema: None,
            output_schema: None,
            dependencies: BTreeMap::from([("model".into(), ModuleKind::Model)]),
            required_capabilities: Default::default(),
        }
    }
    fn build(
        &self,
        config: &Value,
        dependencies: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        let config = serde_json::from_value(config.clone()).map_err(|e| invalid(e.to_string()))?;
        let Some(ModuleInstance::Model(model)) = dependencies.get("model") else {
            return Err(invalid("compaction requires a model dependency"));
        };
        Ok(ModuleInstance::ContextPolicy(Arc::new(
            CompactionPolicy::new(config, model.clone(), self.counter.clone())?,
        )))
    }
}
