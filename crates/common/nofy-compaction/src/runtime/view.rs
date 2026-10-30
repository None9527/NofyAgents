use super::*;

/// Hosts may install a provider tokenizer. The default uses the same bytes/4
/// heuristic as the existing coding host and charges images separately.
pub trait ContextTokenCounter: Send + Sync {
    fn count(&self, message: &Message) -> u32;
}
pub struct BytesTokenCounter;
impl ContextTokenCounter for BytesTokenCounter {
    fn count(&self, message: &Message) -> u32 {
        let tokens = match message {
            Message::System { content } | Message::User { content } => {
                nofy_token_estimation::estimate_tokens(content)
            }
            Message::UserParts { content } => content
                .iter()
                .map(|part| match part {
                    nofy_agent_runtime::InputPart::Text { text } => {
                        nofy_token_estimation::estimate_tokens(text)
                    }
                    nofy_agent_runtime::InputPart::Image { .. } => {
                        nofy_token_estimation::IMAGE_TOKEN_ESTIMATE
                    }
                })
                .fold(0u64, u64::saturating_add),
            _ => serde_json::to_string(message)
                .map_or(0, |text| nofy_token_estimation::estimate_tokens(&text)),
        };
        tokens.saturating_add(4).min(u64::from(u32::MAX)) as u32
    }
}
pub(super) struct ItemView<'a> {
    message: &'a Message,
}
impl<'a> ItemView<'a> {
    pub fn new(message: &'a Message) -> Result<Self, Error> {
        if matches!(message, Message::Opaque { .. }) {
            return Err(invalid(
                "tail_keep requires a typed message view; use full_replace for opaque provider history",
            ));
        }
        Ok(Self { message })
    }
}
impl CompactionItem for ItemView<'_> {
    fn role(&self) -> CompactionRole {
        match self.message {
            Message::System { .. } => CompactionRole::System,
            Message::User { .. } | Message::UserParts { .. } => CompactionRole::User,
            Message::Assistant { .. } => CompactionRole::Assistant,
            Message::Tool { .. } => CompactionRole::Tool,
            Message::Opaque { .. } => unreachable!("validated typed view"),
        }
    }
    fn text(&self) -> Option<String> {
        None
    }
    fn has_tool_requests(&self) -> bool {
        matches!(self.message, Message::Assistant { tool_calls, .. } if !tool_calls.is_empty())
    }
    fn is_compaction_summary(&self) -> bool {
        false
    }
    fn attachment_refs(&self) -> Vec<CompactionFileRef> {
        vec![]
    }
}
