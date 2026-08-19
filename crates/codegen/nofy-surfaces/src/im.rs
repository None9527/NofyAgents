//! IM channel contract + one implementation shape (FR13.4, HM-F12 shape).
//!
//! The contract: approval cards GO OUT as structured renders of a batch
//! Ask; decisions COME IN as parsed replies. One implementation shape
//! (Feishu-style) proves the contract; other IMs implement the same
//! contract — the core is channel-agnostic.

use nofy_orchestra::batchapproval::{BatchAsk, ItemDecision};

/// Supported IM kinds (one contract, many channels).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ImKind {
    Feishu,
    Telegram,
}

/// An approval card rendered for an IM channel.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ApprovalCard {
    pub channel: ImKind,
    pub batch_id: String,
    /// One line per item, numbered for reply reference.
    pub lines: Vec<String>,
    pub hint: String,
}

/// Render a batch Ask as an IM approval card.
pub fn format_approval_card(channel: ImKind, ask: &BatchAsk) -> ApprovalCard {
    let lines = ask
        .lines
        .iter()
        .enumerate()
        .map(|(i, line)| format!("{}. {}", i + 1, line))
        .collect();
    ApprovalCard {
        channel,
        batch_id: ask.batch_id.clone(),
        lines,
        hint: format!(
            "reply: approve <n> / deny <n> / approve all ({} high-risk)",
            ask.high_risk_count
        ),
    }
}

/// A normalized inbound IM message.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ImMessage {
    pub channel: ImKind,
    pub chat_id: String,
    pub text: String,
}

/// Normalize a raw IM message: strip bot mentions and surrounding
/// whitespace (channels decorate messages differently).
pub fn normalize_message(channel: ImKind, chat_id: &str, raw: &str) -> ImMessage {
    let mut text = raw.trim().to_string();
    for mention in ["@nofy-bot", "@nofy"] {
        text = text.replace(mention, "");
    }
    ImMessage {
        channel,
        chat_id: chat_id.to_string(),
        text: text.trim().to_string(),
    }
}

/// A parsed decision from an IM reply.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ImDecision {
    /// Decide one item by its card number (1-based).
    Item { index: usize, decision: ItemDecision },
    /// Decide every item.
    All { decision: ItemDecision },
    /// Not a decision the surface understands.
    NotADecision,
}

/// Parse an IM reply into a decision.
pub fn parse_reply(message: &ImMessage) -> ImDecision {
    let text = message.text.to_ascii_lowercase();
    let mut parts = text.split_whitespace();
    let verb = parts.next().unwrap_or_default();
    let decision = match verb {
        "approve" => ItemDecision::Approved,
        "deny" => ItemDecision::Denied,
        _ => return ImDecision::NotADecision,
    };
    match parts.next() {
        Some("all") => ImDecision::All { decision },
        Some(n) => match n.parse::<usize>() {
            Ok(index) if index >= 1 => ImDecision::Item { index, decision },
            _ => ImDecision::NotADecision,
        },
        None => ImDecision::NotADecision,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn ask() -> BatchAsk {
        BatchAsk {
            batch_id: "cleanup-1".into(),
            lines: vec!["[mv-1] move logs".into(), "[del-1] trash dupes".into()],
            high_risk_count: 1,
        }
    }

    #[test]
    fn card_renders_numbered_lines_and_hint() {
        let card = format_approval_card(ImKind::Feishu, &ask());
        assert_eq!(card.channel, ImKind::Feishu);
        assert_eq!(card.lines, vec!["1. [mv-1] move logs", "2. [del-1] trash dupes"]);
        assert!(card.hint.contains("1 high-risk"));
        // Same Ask, different channel: identical content, different carrier.
        let tg = format_approval_card(ImKind::Telegram, &ask());
        assert_eq!(tg.lines, card.lines);
    }

    #[test]
    fn replies_parse_to_decisions() {
        let msg = normalize_message(ImKind::Feishu, "chat-1", "@nofy-bot approve 2");
        assert_eq!(parse_reply(&msg), ImDecision::Item { index: 2, decision: ItemDecision::Approved });
        let deny = normalize_message(ImKind::Telegram, "chat-2", "deny 1");
        assert_eq!(parse_reply(&deny), ImDecision::Item { index: 1, decision: ItemDecision::Denied });
        let all = normalize_message(ImKind::Feishu, "chat-1", "approve all");
        assert_eq!(parse_reply(&all), ImDecision::All { decision: ItemDecision::Approved });
    }

    #[test]
    fn normalization_strips_mentions() {
        let msg = normalize_message(ImKind::Feishu, "c", "  @nofy deny 3  ");
        assert_eq!(msg.text, "deny 3");
    }

    #[test]
    fn non_decisions_are_flagged() {
        for text in ["hello", "approve", "approve zero", "approve 0", "maybe 2"] {
            let msg = normalize_message(ImKind::Feishu, "c", text);
            assert_eq!(parse_reply(&msg), ImDecision::NotADecision, "must not parse: {text}");
        }
    }

    #[test]
    fn contract_is_channel_agnostic() {
        // The same reply grammar works on every channel kind.
        for kind in [ImKind::Feishu, ImKind::Telegram] {
            let msg = normalize_message(kind, "c", "approve 1");
            assert_eq!(parse_reply(&msg), ImDecision::Item { index: 1, decision: ItemDecision::Approved });
        }
    }
}
