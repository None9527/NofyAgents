//! Projection audit (runtime evolution, Phase 2a).
//!
//! Every model request can answer "what did the model actually see, and
//! why": a [`ProjectionAudit`] is computed at request-build time from the
//! **final** item list (after pruning, image eviction, and memory
//! reminder injection) and emitted as a [`ChatStateEvent::ProjectionAudit`]
//! for the session layer to journal/telemetry.
//!
//! The audit is structural metadata — counts, fingerprints, categories —
//! never message content.

use nofy_sampling_types::{ConversationItem, ToolSpec};

use crate::actor::state::estimate_item_tokens;

/// Bytes/4 estimate of one tool spec (name + description + the
/// JSON-serialized parameters) — mirrors
/// `actor::state::estimate_tool_definition_tokens` for the request-side
/// `ToolSpec` shape.
fn estimate_tool_spec_tokens(spec: &ToolSpec) -> u64 {
    let name_len = spec.name.len();
    let desc_len = spec.description.as_deref().map_or(0, |d| d.len());
    let params_len = spec.parameters.to_string().len();
    ((name_len + desc_len + params_len) as u64) / nofy_token_estimation::BYTES_PER_TOKEN
}

/// What one model request contained, captured after all request-time
/// mutation passes.
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ProjectionAudit {
    /// Request correlation ids (as stamped on the wire request).
    pub conv_id: String,
    pub req_id: String,

    /// Total items handed to the sampler.
    pub item_count: usize,
    /// The main system prompt must always be present — its absence is a
    /// P0 invariant violation (RTAgent: projection must never supersede
    /// the system prompt).
    pub system_prompt_present: bool,
    /// Size fingerprint of the system prompt (chars, not content).
    pub system_prompt_chars: u64,

    /// Per-`SyntheticReason` counts of synthetic user items in the
    /// request — the injected-reminder census (system reminders,
    /// interjections, compaction meta, goal summaries, ...).
    pub synthetic_counts: Vec<(String, u64)>,

    /// Non-system items and their estimated token share.
    pub history_items: u64,
    pub estimated_history_tokens: u64,

    /// Tool definition surface.
    pub tool_definition_count: usize,
    pub estimated_tool_tokens: u64,

    /// Which request-time mutation passes ran for this request.
    pub memory_reminder_injected: bool,
    pub pruned: bool,
    pub images_evicted: bool,
}

impl ProjectionAudit {
    /// Compute the audit from the final request payload.
    pub fn compute(
        conv_id: &str,
        req_id: &str,
        items: &[ConversationItem],
        tool_definitions: &[ToolSpec],
        memory_reminder_injected: bool,
        pruned: bool,
        images_evicted: bool,
    ) -> Self {
        let mut system_prompt_present = false;
        let mut system_prompt_chars = 0u64;
        let mut history_items = 0u64;
        let mut estimated_history_tokens = 0u64;
        let mut synthetic: std::collections::BTreeMap<String, u64> =
            std::collections::BTreeMap::new();

        for (idx, item) in items.iter().enumerate() {
            if idx == 0
                && let ConversationItem::System(system) = item
            {
                // Item 0 is the system prompt by construction; audit its
                // presence and size fingerprint.
                system_prompt_present = !system.content.is_empty();
                system_prompt_chars = system.content.chars().count() as u64;
                continue;
            }
            if idx == 0 {
                continue;
            }
            history_items += 1;
            estimated_history_tokens =
                estimated_history_tokens.saturating_add(estimate_item_tokens(item));
            if let ConversationItem::User(user) = item
                && let Some(reason) = &user.synthetic_reason
            {
                *synthetic.entry(format!("{reason:?}")).or_insert(0) += 1;
            }
        }

        Self {
            conv_id: conv_id.to_string(),
            req_id: req_id.to_string(),
            item_count: items.len(),
            system_prompt_present,
            system_prompt_chars,
            synthetic_counts: synthetic.into_iter().collect(),
            history_items,
            estimated_history_tokens,
            tool_definition_count: tool_definitions.len(),
            estimated_tool_tokens: tool_definitions.iter().map(estimate_tool_spec_tokens).sum(),
            memory_reminder_injected,
            pruned,
            images_evicted,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn audit_captures_structure_without_content() {
        let items = vec![
            ConversationItem::system("the system prompt"),
            ConversationItem::user("first query"),
            ConversationItem::system_reminder("a reminder"),
            ConversationItem::assistant("an answer"),
        ];
        let audit = ProjectionAudit::compute("c1", "r1", &items, &[], false, true, false);

        assert_eq!(audit.item_count, 4);
        assert!(audit.system_prompt_present);
        assert_eq!(audit.system_prompt_chars, "the system prompt".len() as u64);
        assert_eq!(audit.history_items, 3);
        assert!(audit.estimated_history_tokens > 0);
        // Exactly one synthetic item, categorized.
        assert_eq!(audit.synthetic_counts.len(), 1);
        assert_eq!(audit.synthetic_counts[0].0, "SystemReminder");
        assert_eq!(audit.synthetic_counts[0].1, 1);
        assert!(audit.pruned);
        assert!(!audit.images_evicted);

        // Structural only: serializing must not leak message content.
        let serialized = serde_json::to_string(&audit).unwrap();
        assert!(!serialized.contains("first query"));
        assert!(!serialized.contains("a reminder"));
        assert!(!serialized.contains("an answer"));
        // The system prompt size is a fingerprint, not the text.
        assert!(!serialized.contains("the system prompt"));
    }

    #[test]
    fn missing_system_prompt_is_visible() {
        let items = vec![ConversationItem::user("query without system head")];
        let audit = ProjectionAudit::compute("c1", "r1", &items, &[], false, false, false);
        assert!(!audit.system_prompt_present);
        assert_eq!(audit.system_prompt_chars, 0);
    }

    #[test]
    fn empty_system_prompt_counts_as_absent() {
        let items = vec![
            ConversationItem::system(""),
            ConversationItem::user("q"),
        ];
        let audit = ProjectionAudit::compute("c1", "r1", &items, &[], false, false, false);
        assert!(!audit.system_prompt_present);
    }
}
