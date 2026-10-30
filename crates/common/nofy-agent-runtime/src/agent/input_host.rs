use super::*;
use crate::{hooks::HookDecision, mailbox::*};
use nofy_interjection_core::{PendingInterjection, format_interjection};

fn message(input: &PendingInterjection<crate::InputPart>, framed: bool) -> Message {
    let text = if framed {
        format_interjection(input.text.clone())
    } else {
        input.text.clone()
    };
    if input.attachments.is_empty() {
        Message::User { content: text }
    } else {
        Message::UserParts {
            content: std::iter::once(crate::InputPart::Text { text })
                .chain(input.attachments.iter().cloned())
                .collect(),
        }
    }
}
fn validate_view(message: &Message, images: bool) -> Result<(), Error> {
    match message {
        Message::User { content } if content.len() <= 1024 * 1024 => Ok(()),
        Message::UserParts { content } if !content.is_empty() && content.len() <= 9 => {
            for part in content {
                match part {
                    crate::InputPart::Text { text } if text.len() <= 65536 => {}
                    crate::InputPart::Image { url }
                        if images
                            && (url.starts_with("http://")
                                || url.starts_with("https://")
                                || url.starts_with("data:image/")) => {}
                    _ => {
                        return Err(Error::Composition(
                            "unsupported mailbox message part".into(),
                        ));
                    }
                }
            }
            Ok(())
        }
        _ => Err(Error::Composition(
            "mailbox hook must retain a bounded user message".into(),
        )),
    }
}
impl AgentHost<'_> {
    pub(super) async fn drain_inputs(&mut self) -> Result<Option<Step<RunOutcome>>, Error> {
        // Model-free roots watch their own cancellation channel but cannot
        // turn ordinary Agent mail into extra executable calls.
        if self.agent.model.is_none() {
            return Ok(None);
        }
        let Some(binding) = self.context.capabilities.get::<MailboxBinding>() else {
            return Ok(None);
        };
        let identity = binding.0.identity();
        if self
            .state
            .input_progress
            .backend
            .as_ref()
            .is_some_and(|backend| *backend != identity)
        {
            return Err(Error::Checkpoint(
                "mailbox backend changed during recovery".into(),
            ));
        }
        let address = InputAddress::for_run(&self.agent.spec.name, &self.context);
        if let Some(ack) = self.state.input_progress.unacknowledged.clone() {
            if ack.delivery.envelope.address != address {
                return Err(Error::Checkpoint("mailbox ack recipient changed".into()));
            }
            binding
                .0
                .acknowledge(&ack.delivery, ack.rejection.clone())
                .await?;
            self.state.input_progress.unacknowledged = None;
            self.commit().await?;
            self.emit(RunEvent::Input {
                input_id: ack.delivery.envelope.input_id,
                sequence: ack.delivery.sequence,
                kind: ack.delivery.envelope.input.kind(),
                status: if ack.rejection.is_some() {
                    InputStatus::Rejected
                } else {
                    InputStatus::Delivered
                },
                reason: ack.rejection,
            })
            .await?;
            return Ok(Some(Step::Continue));
        }
        // Never append into a request that is already frozen, a context plan,
        // or an unpaired tool batch. The caller drained tool results first.
        if self.state.pending_model.is_some()
            || self.state.context_progress.pending.is_some()
            || self.state.hook_progress.prepared_model.is_some()
            || !self.state.pending_tools.is_empty()
            || self.state.in_flight.is_some()
        {
            return Ok(None);
        }
        if self.state.input_progress.delivered.len() >= 8192 {
            return Err(Error::GovernancePaused(
                json!({"kind":"input_receipt_capacity"}),
            ));
        }
        let delivery = if let Some(pending) = self.state.input_progress.pending.clone() {
            pending.validate()?;
            if pending.envelope.address != address {
                return Err(Error::Checkpoint(
                    "mailbox recipient changed during recovery".into(),
                ));
            }
            let claimed = binding
                .0
                .claim(&address, pending.envelope.input.kind())
                .await?
                .ok_or_else(|| {
                    Error::Checkpoint("checkpointed mailbox claim disappeared".into())
                })?;
            if claimed.sequence != pending.sequence || claimed.digest != pending.digest {
                return Err(Error::Checkpoint(
                    "checkpointed mailbox claim changed".into(),
                ));
            }
            pending
        } else {
            let delivery = match binding.0.claim(&address, InputKind::Interject).await? {
                Some(delivery) => delivery,
                None => match binding.0.claim(&address, InputKind::Tool).await? {
                    Some(delivery) => delivery,
                    None => return Ok(None),
                },
            };
            delivery.validate()?;
            self.state.input_progress.backend = Some(identity);
            self.state.input_progress.pending = Some(delivery.clone());
            self.commit().await?;
            delivery
        };
        if self
            .state
            .input_progress
            .delivered
            .contains_key(&delivery.sequence)
        {
            return Err(Error::Checkpoint(
                "mailbox returned a completed input as a new claim".into(),
            ));
        }
        if matches!(delivery.envelope.input, MailInput::Tool { .. }) {
            let command = UserToolCommand::from_delivery(delivery)?;
            let index = self.state.messages.len();
            self.state.messages.push(Message::Assistant {
                content: String::new(),
                tool_calls: vec![command.call.clone()],
            });
            self.state.hook_progress.synthetic_inputs.push(index);
            self.state.pending_tools.push_back(command.call.clone());
            self.state.input_progress.pending = None;
            self.state.input_progress.command = Some(command);
            self.state.complete = false;
            self.state.output.clear();
            self.state.completion_info = Default::default();
            self.state.hook_progress.stop_done = false;
            self.commit().await?;
            return Ok(Some(Step::Continue));
        }
        let MailInput::Interject { message: input } = &delivery.envelope.input else {
            return Err(Error::Checkpoint(
                "mailbox interjection claim has a different kind".into(),
            ));
        };
        let raw = message(input, false);
        let framed = message(input, true);
        let capture_size = serde_json::to_vec(&self.state.input_progress.capture)
            .map_err(|e| Error::Checkpoint(e.to_string()))?
            .len();
        let raw_size = serde_json::to_vec(&raw)
            .map_err(|e| Error::Checkpoint(e.to_string()))?
            .len();
        if capture_size.saturating_add(raw_size) > 2 * 1024 * 1024 {
            return self
                .settle_input(
                    delivery,
                    Some("turn user-input capture exceeds 2 MiB".into()),
                )
                .await;
        }
        if let Err(error) = validate_view(&framed, self.agent.model_capabilities().image_input) {
            return self.settle_input(delivery, Some(error.to_string())).await;
        }
        let operation = format!("mailbox:{}:{}", delivery.sequence, delivery.digest);
        let gate = self
            .hook("user_input", &operation, json!({"message":framed}))
            .await?;
        match gate.control {
            HookDecision::Pause { reason } => return Ok(Some(self.hook_pause(reason))),
            HookDecision::Deny { reason } => {
                return self.settle_input(delivery, Some(reason)).await;
            }
            _ => {}
        }
        let view: Message = match serde_json::from_value(
            gate.payload.get("message").cloned().unwrap_or(Value::Null),
        ) {
            Ok(view) => view,
            Err(error) => {
                return self
                    .settle_input(
                        delivery,
                        Some(format!("invalid input hook result: {error}")),
                    )
                    .await;
            }
        };
        if let Err(error) = validate_view(&view, self.agent.model_capabilities().image_input) {
            return self.settle_input(delivery, Some(error.to_string())).await;
        }
        let index = self.state.messages.len();
        self.state.messages.push(view);
        self.state.hook_progress.synthetic_inputs.push(index);
        self.state.input_progress.capture.insert(index, raw);
        self.state.complete = false;
        self.state.output.clear();
        self.state.completion_info = Default::default();
        self.state.hook_progress.stop_done = false;
        self.settle_input(delivery, None).await
    }
    async fn settle_input(
        &mut self,
        delivery: MailDelivery,
        rejection: Option<String>,
    ) -> Result<Option<Step<RunOutcome>>, Error> {
        let rejection = rejection.map(|reason| reason.chars().take(1024).collect::<String>());
        self.state
            .input_progress
            .delivered
            .insert(delivery.sequence, delivery.digest.clone());
        self.state.input_progress.pending = None;
        self.state.input_progress.unacknowledged = Some(InputAcknowledgment {
            delivery,
            rejection,
        });
        // The transcript, its raw provenance, and the delivery ID commit before
        // the queue is acknowledged. Recovery only acknowledges after this CAS.
        self.commit().await?;
        Ok(Some(Step::Continue))
    }
}
