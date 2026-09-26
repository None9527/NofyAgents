//! Fact-level projection for compaction (runtime evolution, Phase 2b).
//!
//! The default compaction path replaces the whole history with one LLM
//! summary — lossy in ways the model cannot audit. This module provides
//! the deterministic layer hosts compose in front of it:
//!
//! 1. **Extract** canonical facts from the turns about to be compacted
//!    (last user query, last assistant response, recent tool outcomes,
//!    tool failures);
//! 2. **Hard-include** the facts that must survive any compaction
//!    (RTAgent discipline: recent failures, current goal, latest
//!    verification — never left to summarizer chance);
//! 3. The host merges the rendered fact block with the LLM summary of the
//!    remaining history (see the shell's `FactProjectingSampler`).
//!
//! v1 deliberately does NOT do utility scoring, MMR, or lane quotas —
//! hard-include plus recency first; the eval loop decides whether more
//! machinery is worth its complexity.

use crate::item::CompactionItem;

/// Environment-variable gate for fact-level compaction. On by default;
/// set `NOFY_FACT_COMPACTION=0` (or `false`) to force the LLM-only path.
pub const FACT_COMPACTION_ENV: &str = "NOFY_FACT_COMPACTION";

/// Whether fact-level compaction is enabled for this process.
pub fn is_enabled() -> bool {
    std::env::var(FACT_COMPACTION_ENV)
        .map(|value| !(value == "0" || value.eq_ignore_ascii_case("false")))
        .unwrap_or(true)
}

/// A canonical fact retained across compaction.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Fact {
    /// Stable category, rendered as a section header.
    pub kind: FactKind,
    /// The retained text (already truncated to budget).
    pub text: String,
    /// Index of the source item in the compacted input (provenance).
    pub source_index: usize,
}

/// Fact categories, in hard-include priority order.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum FactKind {
    /// The most recent user query — the current goal.
    LastUserQuery,
    /// The most recent assistant response — where the agent left off.
    LastAssistantResponse,
    /// The most recent tool outcome — latest ground truth.
    LastToolOutcome,
    /// A tool outcome carrying failure markers — errors must survive
    /// compaction or the agent repeats them.
    ToolFailure,
}

impl FactKind {
    fn header(self) -> &'static str {
        match self {
            Self::LastUserQuery => "Last user query",
            Self::LastAssistantResponse => "Last assistant response",
            Self::LastToolOutcome => "Most recent tool outcome",
            Self::ToolFailure => "Tool failure (do not repeat)",
        }
    }
}

/// Per-fact character budget.
pub const FACT_CHAR_BUDGET: usize = 2_000;
/// Maximum number of tool-failure facts retained.
pub const MAX_FAILURE_FACTS: usize = 3;

/// Failure markers recognized in tool-outcome text (v1 heuristic —
/// deliberately conservative; a missed failure only degrades to the
/// LLM-summary baseline, never corrupts).
const FAILURE_MARKERS: &[&str] = &[
    "error:",
    "error[",
    "failed",
    "failure",
    "not found",
    "no matches found",
    "permission denied",
    "panicked",
    "traceback",
];

/// Extract the hard-include fact set from turns about to be compacted.
///
/// Pure and deterministic: same input ⇒ same facts.
pub fn extract_facts<T: CompactionItem>(turns: &[T]) -> Vec<Fact> {
    let mut facts: Vec<Fact> = Vec::new();

    // Last user query (newest first scan).
    if let Some((idx, text)) =
        turns
            .iter()
            .enumerate()
            .rev()
            .find_map(|(idx, item)| match item.role() {
                crate::item::CompactionRole::User => item.text().map(|text| (idx, text)),
                _ => None,
            })
    {
        facts.push(Fact {
            kind: FactKind::LastUserQuery,
            text: truncate_chars(&text, FACT_CHAR_BUDGET),
            source_index: idx,
        });
    }

    // Last assistant response.
    if let Some((idx, text)) =
        turns
            .iter()
            .enumerate()
            .rev()
            .find_map(|(idx, item)| match item.role() {
                crate::item::CompactionRole::Assistant => item.text().map(|text| (idx, text)),
                _ => None,
            })
    {
        facts.push(Fact {
            kind: FactKind::LastAssistantResponse,
            text: truncate_chars(&text, FACT_CHAR_BUDGET),
            source_index: idx,
        });
    }

    // Tool outcomes: newest is hard-included; failure-marked outcomes
    // anywhere are retained (bounded).
    let mut last_tool_seen = false;
    let mut failures = 0usize;
    for (idx, item) in turns.iter().enumerate().rev() {
        if !item.is_tool_result() {
            continue;
        }
        let Some(text) = item.text() else { continue };
        let lower = text.to_lowercase();
        let is_failure = FAILURE_MARKERS.iter().any(|marker| lower.contains(marker));
        if !last_tool_seen {
            facts.push(Fact {
                kind: FactKind::LastToolOutcome,
                text: truncate_chars(&text, FACT_CHAR_BUDGET),
                source_index: idx,
            });
            last_tool_seen = true;
            if is_failure {
                failures += 1;
            }
            continue;
        }
        if is_failure && failures < MAX_FAILURE_FACTS {
            facts.push(Fact {
                kind: FactKind::ToolFailure,
                text: truncate_chars(&text, FACT_CHAR_BUDGET),
                source_index: idx,
            });
            failures += 1;
        }
    }

    facts
}

/// Render the fact block (empty string when there are no facts).
pub fn render_fact_block(facts: &[Fact]) -> String {
    if facts.is_empty() {
        return String::new();
    }
    let mut out = String::from("# Key facts retained by compaction\n");
    for fact in facts {
        out.push_str("\n## ");
        out.push_str(fact.kind.header());
        out.push('\n');
        out.push_str(&fact.text);
        out.push('\n');
    }
    out
}

/// Truncate to a character budget, marking the cut.
fn truncate_chars(text: &str, budget: usize) -> String {
    if text.chars().count() <= budget {
        return text.to_string();
    }
    let mut truncated: String = text.chars().take(budget).collect();
    truncated.push_str("\n[truncated]");
    truncated
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::item::CompactionRole;

    /// Minimal test item implementing `CompactionItem`.
    #[derive(Clone)]
    struct TestItem {
        role: CompactionRole,
        text: Option<String>,
        tool_result: bool,
    }

    impl CompactionItem for TestItem {
        fn role(&self) -> CompactionRole {
            self.role
        }
        fn text(&self) -> Option<String> {
            self.text.clone()
        }
        fn is_tool_result(&self) -> bool {
            self.tool_result
        }
        fn has_tool_requests(&self) -> bool {
            false
        }
        fn is_compaction_summary(&self) -> bool {
            false
        }
        fn attachment_refs(&self) -> Vec<crate::item::CompactionFileRef> {
            Vec::new()
        }
    }

    fn user(text: &str) -> TestItem {
        TestItem {
            role: CompactionRole::User,
            text: Some(text.into()),
            tool_result: false,
        }
    }
    fn assistant(text: &str) -> TestItem {
        TestItem {
            role: CompactionRole::Assistant,
            text: Some(text.into()),
            tool_result: false,
        }
    }
    fn tool(text: &str) -> TestItem {
        TestItem {
            role: CompactionRole::Tool,
            text: Some(text.into()),
            tool_result: true,
        }
    }

    #[test]
    fn extracts_hard_include_set() {
        let turns = vec![
            user("first query"),
            assistant("first answer"),
            tool("Error: anchor not found in file"),
            tool("ok, wrote 3 lines"),
            user("second query"),
            assistant("second answer"),
        ];
        let facts = extract_facts(&turns);

        let kinds: Vec<FactKind> = facts.iter().map(|f| f.kind).collect();
        assert!(kinds.contains(&FactKind::LastUserQuery));
        assert!(kinds.contains(&FactKind::LastAssistantResponse));
        assert!(kinds.contains(&FactKind::LastToolOutcome));
        assert!(kinds.contains(&FactKind::ToolFailure));

        // Newest user query wins, not the first.
        let query = facts
            .iter()
            .find(|f| f.kind == FactKind::LastUserQuery)
            .unwrap();
        assert_eq!(query.text, "second query");
        // The failure fact carries provenance.
        let failure = facts
            .iter()
            .find(|f| f.kind == FactKind::ToolFailure)
            .unwrap();
        assert_eq!(failure.source_index, 2);
    }

    #[test]
    fn extraction_is_deterministic() {
        let turns = vec![
            user("q"),
            tool("Traceback (most recent call last): boom"),
            assistant("a"),
        ];
        assert_eq!(extract_facts(&turns), extract_facts(&turns));
    }

    #[test]
    fn failure_facts_are_bounded() {
        let mut turns = vec![user("q")];
        for i in 0..10 {
            turns.push(tool(&format!("error: failure {i}")));
        }
        let facts = extract_facts(&turns);
        let failure_count = facts
            .iter()
            .filter(|f| f.kind == FactKind::ToolFailure)
            .count();
        // Newest tool outcome counts once; failures bounded beyond it.
        assert!(failure_count <= MAX_FAILURE_FACTS);
    }

    #[test]
    fn long_facts_are_truncated_with_marker() {
        let long = "x".repeat(FACT_CHAR_BUDGET + 100);
        let turns = vec![user(&long)];
        let facts = extract_facts(&turns);
        let fact = &facts[0];
        assert!(fact.text.ends_with("\n[truncated]"));
        // Budget chars of content plus the truncation marker.
        assert_eq!(
            fact.text.chars().count(),
            FACT_CHAR_BUDGET + "\n[truncated]".chars().count()
        );
    }

    #[test]
    fn render_block_is_stable_and_empty_safe() {
        assert_eq!(render_fact_block(&[]), "");
        let facts = vec![Fact {
            kind: FactKind::LastUserQuery,
            text: "the query".into(),
            source_index: 0,
        }];
        let block = render_fact_block(&facts);
        assert!(block.starts_with("# Key facts retained by compaction"));
        assert!(block.contains("## Last user query"));
        assert!(block.contains("the query"));
    }
}
