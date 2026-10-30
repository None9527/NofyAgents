//! Typed, durable input boundaries. Sending an input is separate from claiming
//! it at a safe point; a held next turn protects everything behind it in FIFO.
use crate::{Error, InputPart, RunContext, ToolCall, compile::CompilationSnapshot};
use nofy_interjection_core::PendingInterjection;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::{collections::BTreeMap, sync::Arc};

#[cfg(feature = "sqlite")]
mod sqlite;

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct InputAddress {
    pub root_run_id: String,
    pub run_id: String,
    pub thread_id: String,
    pub agent: String,
}
impl InputAddress {
    pub fn for_run(agent: impl Into<String>, context: &RunContext) -> Self {
        Self {
            root_run_id: context
                .capabilities
                .get::<crate::events::RunLineage>()
                .map_or_else(
                    || context.run_id.clone(),
                    |lineage| lineage.root_run_id.clone(),
                ),
            run_id: context.run_id.clone(),
            thread_id: context.thread_id.clone(),
            agent: agent.into(),
        }
    }
    pub(crate) fn key(&self) -> Result<String, Error> {
        for field in [
            &self.root_run_id,
            &self.run_id,
            &self.thread_id,
            &self.agent,
        ] {
            if field.trim().is_empty() || field.len() > 4096 {
                return Err(Error::Composition(
                    "mailbox address fields must be 1..=4096 bytes".into(),
                ));
            }
        }
        serde_json::to_string(self).map_err(|e| Error::Composition(e.to_string()))
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case", deny_unknown_fields)]
pub enum MailInput {
    Interject {
        message: PendingInterjection<InputPart>,
    },
    NextTurn {
        run_id: String,
        snapshot: CompilationSnapshot,
        message: PendingInterjection<InputPart>,
    },
    Tool {
        call: ToolCall,
    },
}
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum InputKind {
    Interject,
    NextTurn,
    Tool,
}
impl MailInput {
    pub fn kind(&self) -> InputKind {
        match self {
            Self::Interject { .. } => InputKind::Interject,
            Self::NextTurn { .. } => InputKind::NextTurn,
            Self::Tool { .. } => InputKind::Tool,
        }
    }
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct MailEnvelope {
    pub address: InputAddress,
    pub input_id: String,
    pub input: MailInput,
}
impl MailEnvelope {
    pub fn validate(&self) -> Result<(), Error> {
        self.address.key()?;
        if self.input_id.trim().is_empty() || self.input_id.len() > 256 {
            return Err(Error::Composition(
                "mailbox input ID must be 1..=256 bytes".into(),
            ));
        }
        match &self.input {
            MailInput::Interject { message } => validate_message(message)?,
            MailInput::NextTurn {
                run_id,
                snapshot,
                message,
            } => {
                validate_message(message)?;
                if self.address.root_run_id != self.address.run_id
                    || run_id.trim().is_empty()
                    || run_id.len() > 4096
                    || *run_id == self.address.run_id
                    || snapshot.version != 1
                    || snapshot.agent.name != self.address.agent
                {
                    return Err(Error::Composition(
                        "invalid next-turn run/snapshot identity".into(),
                    ));
                }
            }
            MailInput::Tool { call } => {
                if !call.id.is_empty() {
                    return Err(Error::Composition(
                        "host tool call IDs are issued by the runtime".into(),
                    ));
                }
                nofy_tool_protocol::ToolId::new(&call.name)
                    .map_err(|e| Error::Composition(e.to_string()))?;
            }
        }
        if serde_json::to_vec(self)
            .map_err(|e| Error::Composition(e.to_string()))?
            .len()
            > 1024 * 1024
        {
            return Err(Error::Composition("mailbox envelope exceeds 1 MiB".into()));
        }
        Ok(())
    }
    pub fn fingerprint(&self) -> Result<String, Error> {
        self.validate()?;
        let value = serde_json::to_vec(self).map_err(|e| Error::Composition(e.to_string()))?;
        Ok(format!("{:x}", Sha256::digest(value)))
    }
}
pub(crate) fn validate_message(message: &PendingInterjection<InputPart>) -> Result<(), Error> {
    if message.text.len() > 65536
        || message.attachments.len() > 8
        || (message.text.is_empty() && message.attachments.is_empty())
    {
        return Err(Error::Composition(
            "input requires text up to 64 KiB and at most eight images".into(),
        ));
    }
    for part in &message.attachments {
        match part {
            InputPart::Image { url }
                if url.starts_with("https://")
                    || url.starts_with("http://")
                    || url.starts_with("data:image/") => {}
            _ => {
                return Err(Error::Composition(
                    "input attachments must be HTTP(S)/data images".into(),
                ));
            }
        }
    }
    Ok(())
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum InputStatus {
    Pending,
    Claimed,
    Delivered,
    Rejected,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct MailDelivery {
    pub sequence: u64,
    pub digest: String,
    pub envelope: MailEnvelope,
    pub status: InputStatus,
    pub reason: Option<String>,
}
impl MailDelivery {
    pub fn validate(&self) -> Result<(), Error> {
        if self.sequence == 0 || self.envelope.fingerprint()? != self.digest {
            return Err(Error::Checkpoint(
                "mailbox delivery identity/payload changed".into(),
            ));
        }
        Ok(())
    }
}

/// Producers are authenticated/scoped by the host. SQLite additionally checks
/// recipients against the recorded root/child tree and the active thread owner.
#[async_trait::async_trait]
pub trait MailboxSender: Send + Sync {
    async fn submit(&self, envelope: MailEnvelope) -> Result<MailDelivery, Error>;
    async fn input_status(
        &self,
        address: &InputAddress,
        input_id: &str,
    ) -> Result<Option<MailDelivery>, Error>;
    async fn cancel(&self, address: &InputAddress, command_id: &str) -> Result<u64, Error>;
}
/// A consumer must fence claim/ack against the root run's lease. An ordinary
/// SqliteStore is a producer only; GuardedCheckpointer supplies the consumer.
#[async_trait::async_trait]
pub trait InputInbox: Send + Sync {
    fn identity(&self) -> String;
    fn is_durable(&self) -> bool {
        false
    }
    async fn claim(
        &self,
        address: &InputAddress,
        kind: InputKind,
    ) -> Result<Option<MailDelivery>, Error>;
    async fn acknowledge(
        &self,
        delivery: &MailDelivery,
        rejection: Option<String>,
    ) -> Result<(), Error>;
    async fn pending_cancel(&self, address: &InputAddress) -> Result<Option<u64>, Error>;
    async fn acknowledge_cancel(&self, address: &InputAddress, through: u64) -> Result<(), Error>;
}
#[derive(Clone)]
pub struct MailboxBinding(pub Arc<dyn InputInbox>);
impl crate::context::ContextBinding for MailboxBinding {
    fn bind(&self, context: &mut RunContext) -> Result<(), Error> {
        if self.0.identity().trim().is_empty() {
            return Err(Error::Composition(
                "mailbox backend needs stable identity".into(),
            ));
        }
        context.capabilities.insert(self.clone());
        Ok(())
    }
}
#[derive(Clone)]
pub(crate) struct RequiredMailbox(pub Arc<dyn InputInbox>);

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct InputProgress {
    #[serde(default)]
    pub initial: Option<InitialInputProof>,
    pub backend: Option<String>,
    pub pending: Option<MailDelivery>,
    pub unacknowledged: Option<InputAcknowledgment>,
    #[serde(default)]
    pub command: Option<UserToolCommand>,
    pub delivered: BTreeMap<u64, String>,
    /// Replace model-visible framing with the actual user message for capture.
    pub capture: BTreeMap<usize, crate::Message>,
}
impl InputProgress {
    pub fn is_empty(&self) -> bool {
        self.backend.is_none()
            && self.initial.is_none()
            && self.pending.is_none()
            && self.unacknowledged.is_none()
            && self.command.is_none()
            && self.delivered.is_empty()
            && self.capture.is_empty()
    }
}
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct InputAcknowledgment {
    pub delivery: MailDelivery,
    pub rejection: Option<String>,
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct InitialInputProof {
    pub run_id: String,
    pub thread_id: String,
    pub digest: String,
}
#[async_trait::async_trait]
pub(crate) trait InitialInputReceipt: Send + Sync {
    fn proof(&self) -> InitialInputProof;
    async fn acknowledge(&self) -> Result<(), Error>;
}
#[derive(Clone)]
pub(crate) struct InitialInputBinding(pub Arc<dyn InitialInputReceipt>);
impl InitialInputBinding {
    pub fn matches(&self, context: &RunContext) -> bool {
        let proof = self.0.proof();
        proof.run_id == context.run_id && proof.thread_id == context.thread_id
    }
}
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct UserToolCommand {
    pub delivery: MailDelivery,
    pub call: ToolCall,
}
impl UserToolCommand {
    pub(crate) fn from_delivery(delivery: MailDelivery) -> Result<Self, Error> {
        delivery.validate()?;
        let MailInput::Tool { call } = &delivery.envelope.input else {
            return Err(Error::Checkpoint(
                "user tool command has a different input kind".into(),
            ));
        };
        let call = ToolCall {
            id: format!("host-input:{}:{}", delivery.sequence, delivery.digest),
            name: call.name.clone(),
            arguments: call.arguments.clone(),
        };
        Ok(Self { delivery, call })
    }
    pub(crate) fn validate(&self) -> Result<(), Error> {
        let expected = Self::from_delivery(self.delivery.clone())?;
        if self.call != expected.call {
            return Err(Error::Checkpoint(
                "user tool command provenance changed".into(),
            ));
        }
        Ok(())
    }
}

/// Live proof issued by the runtime from a checkpointed host input. No JSON
/// constructor exists. It is scoped to one exact call, never a child run.
#[derive(Clone)]
pub struct UserToolInvocation {
    address: InputAddress,
    call: ToolCall,
}
impl UserToolInvocation {
    pub(crate) fn issue(command: &UserToolCommand) -> Result<Self, Error> {
        command.validate()?;
        Ok(Self {
            address: command.delivery.envelope.address.clone(),
            call: command.call.clone(),
        })
    }
    pub fn admits(
        &self,
        context: &nofy_tool_runtime::ToolCallContext,
        tool: &nofy_tool_protocol::ToolId,
        arguments: &serde_json::Value,
    ) -> bool {
        context.call_id.as_str() == self.call.id
            && tool.as_str() == self.call.name
            && *arguments == self.call.arguments
            && context.get::<RunContext>().is_some_and(|run| {
                run.thread_id == self.address.thread_id
                    && run.run_id == self.address.run_id
                    && InputAddress::for_run(&self.address.agent, &run).root_run_id
                        == self.address.root_run_id
            })
    }
}
pub(crate) fn command_operation(
    state: &crate::RunState,
    context: &RunContext,
    call: &ToolCall,
) -> Result<Option<String>, Error> {
    let Some(command) = &state.input_progress.command else {
        return Ok(None);
    };
    command.validate()?;
    if command.call.id != call.id {
        return Ok(None);
    }
    if command.delivery.envelope.address
        != InputAddress::for_run(&command.delivery.envelope.address.agent, context)
    {
        return Err(Error::Checkpoint(
            "user command run identity changed".into(),
        ));
    }
    serde_json::to_string(&(
        "user-tool",
        &context.thread_id,
        &context.run_id,
        command.delivery.sequence,
        &command.delivery.digest,
    ))
    .map(Some)
    .map_err(|e| Error::Checkpoint(e.to_string()))
}
pub(crate) fn finish_user_command(
    state: &mut crate::RunState,
    call_id: &str,
    is_error: bool,
) -> Result<(), Error> {
    let Some(command) = &state.input_progress.command else {
        return Ok(());
    };
    command.validate()?;
    if command.call.id != call_id {
        return Ok(());
    }
    let index = state
        .messages
        .len()
        .checked_sub(1)
        .ok_or_else(|| Error::Checkpoint("user command has no result".into()))?;
    if !matches!(&state.messages[index], crate::Message::Tool {call_id: result,..} if result == call_id)
    {
        return Err(Error::Checkpoint(
            "user command result is not paired".into(),
        ));
    }
    let command = state
        .input_progress
        .command
        .take()
        .expect("validated command");
    state.hook_progress.synthetic_inputs.push(index);
    state
        .input_progress
        .delivered
        .insert(command.delivery.sequence, command.delivery.digest.clone());
    state.input_progress.unacknowledged = Some(InputAcknowledgment {
        delivery: command.delivery,
        rejection: is_error.then(|| "user tool command returned an error".into()),
    });
    Ok(())
}
pub(crate) struct CancelWatch {
    task: tokio::task::JoinHandle<()>,
    failure: Arc<std::sync::Mutex<Option<String>>>,
}
impl CancelWatch {
    pub(crate) fn failure(&self) -> Option<String> {
        self.failure
            .lock()
            .map(|failure| failure.clone())
            .unwrap_or_else(|_| Some("mailbox control monitor poisoned".into()))
    }
}
impl Drop for CancelWatch {
    fn drop(&mut self) {
        self.task.abort();
    }
}
pub(crate) async fn watch_cancel(
    binding: &MailboxBinding,
    address: InputAddress,
    context: &RunContext,
    resume: bool,
    acknowledge: Option<u64>,
) -> Result<CancelWatch, Error> {
    if binding.0.identity().trim().is_empty() {
        return Err(Error::Composition(
            "mailbox backend needs stable identity".into(),
        ));
    }
    if acknowledge.is_some() && !resume {
        return Err(Error::Composition(
            "cancel acknowledgment requires explicit resume".into(),
        ));
    }
    if let Some(cursor) = acknowledge {
        binding.0.acknowledge_cancel(&address, cursor).await?;
    }
    if binding.0.pending_cancel(&address).await?.is_some() {
        context.cancel.cancel();
    }
    let inbox = binding.0.clone();
    let cancel = context.cancel.clone();
    let failure = Arc::new(std::sync::Mutex::new(None));
    let failed = failure.clone();
    let task = tokio::spawn(async move {
        loop {
            tokio::select! { biased;
                _ = cancel.cancelled() => break,
                _ = tokio::time::sleep(std::time::Duration::from_millis(100)) => {},
            }
            match inbox.pending_cancel(&address).await {
                Ok(None) => {}
                // A lost lease/read failure cannot leave side effects running.
                Ok(Some(_)) => {
                    cancel.cancel();
                    break;
                }
                Err(error) => {
                    if let Ok(mut failed) = failed.lock() {
                        *failed = Some(error.to_string());
                    }
                    cancel.cancel();
                    break;
                }
            }
        }
    });
    Ok(CancelWatch { task, failure })
}
