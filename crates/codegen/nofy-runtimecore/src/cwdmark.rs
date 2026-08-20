//! In-band cwd marks + output-throttle spill (FR6.3, HM-F14).
//!
//! When the working directory changes, the model learns it IN-BAND: a
//! marker line inside the conversation stream (not a side channel it
//! cannot see). Marks are sequenced so stale marks are detectable.
//! Output that exceeds the throttle budget spills to a reference
//! instead of flooding the stream.

/// One cwd mark.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CwdMark {
    /// Monotonic sequence: later marks outrank earlier ones.
    pub seq: u64,
    pub path: String,
}

/// Render the in-band marker line.
pub fn render_mark(mark: &CwdMark) -> String {
    format!("[cwd#{seq}] {path}", seq = mark.seq, path = mark.path)
}

/// The mark stream keeps only the newest mark per rendering; a mark is
/// STALE if a higher seq exists.
pub fn is_stale(mark: &CwdMark, latest_seq: u64) -> bool {
    mark.seq < latest_seq
}

/// Output-throttle verdict for one chunk.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Throttle {
    /// Fits the budget: emit inline.
    Inline,
    /// Over budget: spill and emit a reference line.
    Spill { reference: String },
}

/// Apply the throttle: chunks at or under `budget_bytes` stay inline;
/// larger ones spill with a deterministic reference.
pub fn throttle(chunk_id: &str, size: usize, budget_bytes: usize) -> Throttle {
    if size <= budget_bytes {
        Throttle::Inline
    } else {
        Throttle::Spill {
            reference: format!("[spilled {chunk_id}: {size} bytes]"),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn marks_render_in_band_with_sequence() {
        let mark = CwdMark { seq: 3, path: "/proj/src".into() };
        assert_eq!(render_mark(&mark), "[cwd#3] /proj/src");
    }

    #[test]
    fn older_marks_are_stale() {
        let old = CwdMark { seq: 2, path: "/a".into() };
        assert!(is_stale(&old, 3));
        assert!(!is_stale(&old, 2), "the latest mark is not stale");
    }

    #[test]
    fn throttle_keeps_small_chunks_inline() {
        assert_eq!(throttle("out-1", 100, 100), Throttle::Inline, "budget boundary inclusive");
        assert_eq!(throttle("out-1", 0, 100), Throttle::Inline);
    }

    #[test]
    fn throttle_spills_over_budget_with_reference() {
        assert!(
            matches!(
                throttle("out-2", 101, 100),
                Throttle::Spill { reference }
                    if reference.contains("out-2") && reference.contains("101 bytes")
            ),
            "over-budget output must spill"
        );
    }
}
