use super::*;
use crate::capture::{CaptureQueue, DurableTurn, EnqueueOutcome};
use nofy_agent_runtime::{
    Message,
    hooks::{HookDecision, HookEvent, HookHandler},
    memory::DurableTurnReceipt,
};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct CaptureEnqueueReceipt {
    pub queued: bool,
    pub duplicate: bool,
    pub job_id: Option<String>,
    pub reason: Option<String>,
}
impl MemoryModule {
    pub async fn capture(
        &self,
        context: &RunContext,
        turn_id: Option<&str>,
    ) -> Result<CaptureEnqueueReceipt, Error> {
        if !self.config.capture {
            return Err(Error::Tool("memory capture is not admitted".into()));
        }
        let receipt = context
            .capabilities
            .get::<DurableTurnReceipt>()
            .filter(|receipt| {
                receipt.thread_id() == context.thread_id && receipt.run_id() == context.run_id
            })
            .ok_or_else(|| {
                Error::Tool("memory capture requires a committed durable turn receipt".into())
            })?;
        if turn_id.is_some_and(|id| id != receipt.turn_id()) {
            return Err(Error::Tool(
                "memory capture receipt does not match requested turn".into(),
            ));
        }
        if !receipt.top_level() {
            return Ok(CaptureEnqueueReceipt {
                queued: false,
                duplicate: false,
                job_id: None,
                reason: Some("child_turn".into()),
            });
        }
        let mut transcript = String::new();
        let mut last_assistant = None;
        for message in receipt.messages() {
            match message {
                Message::User { content } => {
                    transcript.push_str(&format!("User: {content}\n"));
                }
                Message::UserParts { content } => {
                    for part in content {
                        if let nofy_agent_runtime::InputPart::Text { text } = part {
                            transcript.push_str(&format!("User: {text}\n"));
                        }
                    }
                }
                Message::Assistant { content, .. } => {
                    transcript.push_str(&format!("Assistant: {content}\n"));
                    last_assistant = Some(content.as_str());
                }
                // Opaque provider payloads, system prompts and tool results do
                // not become learning instructions. Final visible output is below.
                _ => {}
            }
        }
        if last_assistant != Some(receipt.output()) && !receipt.output().is_empty() {
            transcript.push_str(&format!("Assistant: {}\n", receipt.output()));
        }
        if transcript.len() > 1024 * 1024 {
            return Err(Error::Tool("capture transcript exceeds 1 MiB".into()));
        }
        let root = self
            .resource
            .service
            .runtime_capture_root()
            .ok_or_else(|| Error::Tool("automatic memory learning is disabled".into()))?;
        let turn = DurableTurn {
            session_id: receipt.thread_id().into(),
            turn_id: receipt.turn_id().into(),
            transcript_hash: blake3::hash(transcript.as_bytes()).to_hex().to_string(),
            transcript,
            project_id: Some(self.resource.service.runtime_project_id()),
            top_level: true,
            persisted: true,
            succeeded: true,
        };
        let excluded = self.resource.excluded_categories.clone();
        let outcome = tokio::task::spawn_blocking(move || {
            CaptureQueue::open(root, excluded)?.enqueue(&turn, chrono::Utc::now().timestamp())
        })
        .await
        .map_err(|_| Error::Tool("capture worker failed".into()))?
        .map_err(|_| Error::Tool("capture queue write failed".into()))?;
        Ok(match outcome {
            EnqueueOutcome::Queued { job_id } => CaptureEnqueueReceipt {
                queued: true,
                duplicate: false,
                job_id: Some(job_id),
                reason: None,
            },
            EnqueueOutcome::Duplicate { job_id } => CaptureEnqueueReceipt {
                queued: true,
                duplicate: true,
                job_id: Some(job_id),
                reason: None,
            },
            EnqueueOutcome::Ineligible => CaptureEnqueueReceipt {
                queued: false,
                duplicate: false,
                job_id: None,
                reason: Some("ineligible".into()),
            },
            EnqueueOutcome::ExcludedSensitive => CaptureEnqueueReceipt {
                queued: false,
                duplicate: false,
                job_id: None,
                reason: Some("excluded_sensitive".into()),
            },
        })
    }
}
#[async_trait::async_trait]
impl HookHandler for MemoryModule {
    async fn handle(&self, event: &HookEvent, context: &RunContext) -> Result<HookDecision, Error> {
        if event.name != "turn_done" {
            return Err(composition("memory capture subscribes only to turn_done"));
        }
        // Refused/truncated completions intentionally have no receipt.
        if context.capabilities.get::<DurableTurnReceipt>().is_none() {
            if event.payload.get("info").is_some_and(|info| {
                !info.get("refusal").is_none_or(serde_json::Value::is_null)
                    || matches!(
                        info.get("stop_reason").and_then(serde_json::Value::as_str),
                        Some("length" | "max_tokens" | "max_output_tokens")
                    )
            }) {
                return Ok(HookDecision::Continue);
            }
        }
        self.capture(context, None).await?;
        Ok(HookDecision::Continue)
    }
}
