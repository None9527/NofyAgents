//! Tool-result injection tiers + spill (FR4.5, NG-F12).
//!
//! A tool result enters the context in exactly ONE of three tiers:
//!
//! - **Inline** — small enough to inject verbatim;
//! - **Summary** — too large to inline, small enough to summarize: a
//!   summary plus a reference to the full body;
//! - **Spill** — too large for either: the body spills out-of-band and
//!   ONLY a reference is injected.
//!
//! Construction-level guarantee: nothing is silently dropped — every
//! tier either keeps the content inline or behind a reference.

/// Injection thresholds (bytes). Must be ordered: inline <= summary.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct InjectionThresholds {
    pub inline_max: usize,
    pub summary_max: usize,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ThresholdError {
    /// Unordered thresholds make tier selection ambiguous.
    Unordered { inline_max: usize, summary_max: usize },
}

impl InjectionThresholds {
    pub fn new(inline_max: usize, summary_max: usize) -> Result<Self, ThresholdError> {
        if inline_max > summary_max {
            return Err(ThresholdError::Unordered { inline_max, summary_max });
        }
        Ok(Self { inline_max, summary_max })
    }
}

/// The three injection tiers.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Tier {
    Inline,
    Summary,
    Spill,
}

/// Select the tier for a result of `size` bytes. Deterministic.
pub fn select_tier(size: usize, thresholds: &InjectionThresholds) -> Tier {
    if size <= thresholds.inline_max {
        Tier::Inline
    } else if size <= thresholds.summary_max {
        Tier::Summary
    } else {
        Tier::Spill
    }
}

/// A spill reference: where the full body lives out-of-band.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SpillRef {
    pub ref_id: String,
    pub bytes: usize,
}

/// What actually enters the context.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Injected {
    pub tier: Tier,
    /// The text injected into the context (body, summary, or reference
    /// line — never empty).
    pub injected_text: String,
    /// Present for Summary and Spill: the full body stays reachable.
    pub spill: Option<SpillRef>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum InjectError {
    /// A summary tier demands an actual summary.
    EmptySummary,
    /// A spill tier demands a reference id.
    EmptyRef,
}

/// Build the injection for one tool result. `summary` and `spill_ref`
/// are only consulted by their own tier.
pub fn inject(
    tool_call_id: &str,
    body: &str,
    summary: &str,
    thresholds: &InjectionThresholds,
) -> Result<Injected, InjectError> {
    let size = body.len();
    match select_tier(size, thresholds) {
        Tier::Inline => Ok(Injected {
            tier: Tier::Inline,
            injected_text: body.to_string(),
            spill: None,
        }),
        Tier::Summary => {
            if summary.trim().is_empty() {
                return Err(InjectError::EmptySummary);
            }
            Ok(Injected {
                tier: Tier::Summary,
                injected_text: format!("{summary}\n[full result: {tool_call_id}]"),
                spill: Some(SpillRef { ref_id: tool_call_id.to_string(), bytes: size }),
            })
        }
        Tier::Spill => {
            if tool_call_id.trim().is_empty() {
                return Err(InjectError::EmptyRef);
            }
            Ok(Injected {
                tier: Tier::Spill,
                injected_text: format!("[result spilled: {tool_call_id}, {size} bytes]"),
                spill: Some(SpillRef { ref_id: tool_call_id.to_string(), bytes: size }),
            })
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn thresholds() -> InjectionThresholds {
        InjectionThresholds::new(100, 1000).unwrap()
    }

    #[test]
    fn unordered_thresholds_fail_loud() {
        assert!(matches!(
            InjectionThresholds::new(1000, 100),
            Err(ThresholdError::Unordered { .. })
        ));
    }

    #[test]
    fn tier_selection_is_deterministic_and_boundary_exact() {
        let t = thresholds();
        assert_eq!(select_tier(100, &t), Tier::Inline, "inline boundary inclusive");
        assert_eq!(select_tier(101, &t), Tier::Summary);
        assert_eq!(select_tier(1000, &t), Tier::Summary, "summary boundary inclusive");
        assert_eq!(select_tier(1001, &t), Tier::Spill);
        assert_eq!(select_tier(0, &t), Tier::Inline);
    }

    #[test]
    fn inline_keeps_body_verbatim_without_reference() {
        let injected = inject("call-1", "small body", "ignored", &thresholds()).unwrap();
        assert_eq!(injected.tier, Tier::Inline);
        assert_eq!(injected.injected_text, "small body");
        assert!(injected.spill.is_none());
    }

    #[test]
    fn summary_keeps_content_reachable() {
        let body = "x".repeat(500);
        let injected = inject("call-2", &body, "a summary", &thresholds()).unwrap();
        assert_eq!(injected.tier, Tier::Summary);
        assert!(injected.injected_text.contains("a summary"));
        assert!(injected.injected_text.contains("call-2"));
        let spill = injected.spill.expect("summary keeps a reference");
        assert_eq!(spill.bytes, 500);
    }

    #[test]
    fn spill_injects_only_a_reference() {
        let body = "y".repeat(5000);
        let injected = inject("call-3", &body, "ignored", &thresholds()).unwrap();
        assert_eq!(injected.tier, Tier::Spill);
        assert!(injected.injected_text.contains("call-3"));
        assert!(injected.injected_text.contains("5000 bytes"));
        assert!(!injected.injected_text.contains("yyyy"), "no body leaks into the context");
        assert_eq!(injected.spill.unwrap().bytes, 5000);
    }

    #[test]
    fn missing_summary_or_ref_fails_loud() {
        let body = "x".repeat(500);
        assert_eq!(
            inject("call-4", &body, "  ", &thresholds()),
            Err(InjectError::EmptySummary)
        );
        let big = "y".repeat(5000);
        assert_eq!(
            inject("  ", &big, "", &thresholds()),
            Err(InjectError::EmptyRef)
        );
    }
}
