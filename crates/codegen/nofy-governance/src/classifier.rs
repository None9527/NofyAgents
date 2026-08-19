//! Safety classifier: three-policy skeleton with structured output
//! (FR5.14, NG-F4).
//!
//! The classifier renders a STRUCTURED verdict over coarse signals. Its
//! output feeds approval prompts ONLY — no policy ever turns a
//! high-risk or uncertain call into silent auto-execution:
//!
//! - three policies differ on Medium/Low handling
//!   (Conservative / Balanced / Permissive);
//! - High risk is ALWAYS Ask, under every policy;
//! - uncertainty is ALWAYS Ask, under every policy (fail-closed).

/// Coarse signals the classifier reads.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Signals {
    /// The call destroys or overwrites data.
    pub destructive: bool,
    /// The call leaves the machine (network outbound).
    pub outbound: bool,
    /// The classifier cannot make up its mind.
    pub uncertain: bool,
    /// The call matches a known-safe pattern.
    pub known_safe: bool,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum RiskLevel {
    Low,
    Medium,
    High,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ClassAction {
    Allow,
    Ask,
    Deny,
}

/// Structured verdict: risk + reasons + action.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SafetyVerdict {
    pub risk: RiskLevel,
    pub action: ClassAction,
    /// Never empty: every verdict explains itself.
    pub reasons: Vec<String>,
}

/// The three classifier policies.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ClassifierPolicy {
    Conservative,
    Balanced,
    Permissive,
}

/// Classify one call under one policy.
pub fn classify(policy: ClassifierPolicy, signals: &Signals) -> SafetyVerdict {
    let mut reasons = Vec::new();

    // Uncertainty is fail-closed under EVERY policy.
    if signals.uncertain {
        reasons.push("uncertain signal: fail-closed".into());
        return SafetyVerdict { risk: RiskLevel::High, action: ClassAction::Ask, reasons };
    }

    let risk = if signals.destructive {
        reasons.push("destructive call".into());
        RiskLevel::High
    } else if signals.outbound {
        reasons.push("outbound call".into());
        RiskLevel::Medium
    } else if signals.known_safe {
        reasons.push("known-safe pattern".into());
        RiskLevel::Low
    } else {
        reasons.push("unclassified call".into());
        RiskLevel::Low
    };

    let action = match (policy, risk) {
        // High is ALWAYS Ask — approval prompts only.
        (_, RiskLevel::High) => ClassAction::Ask,
        (ClassifierPolicy::Conservative, RiskLevel::Medium) => ClassAction::Ask,
        (ClassifierPolicy::Balanced, RiskLevel::Medium) => ClassAction::Ask,
        (ClassifierPolicy::Permissive, RiskLevel::Medium) => ClassAction::Allow,
        (ClassifierPolicy::Conservative, RiskLevel::Low) => {
            if signals.known_safe {
                ClassAction::Allow
            } else {
                reasons.push("conservative: unclassified low asks".into());
                ClassAction::Ask
            }
        }
        (_, RiskLevel::Low) => ClassAction::Allow,
    };

    SafetyVerdict { risk, action, reasons }
}

#[cfg(test)]
mod tests {
    use super::*;

    const POLICIES: [ClassifierPolicy; 3] = [
        ClassifierPolicy::Conservative,
        ClassifierPolicy::Balanced,
        ClassifierPolicy::Permissive,
    ];

    #[test]
    fn high_risk_never_auto_allows_under_any_policy() {
        let destructive = Signals { destructive: true, outbound: false, uncertain: false, known_safe: false };
        for policy in POLICIES {
            let v = classify(policy, &destructive);
            assert_eq!(v.risk, RiskLevel::High);
            assert_eq!(v.action, ClassAction::Ask, "{policy:?} must prompt, never auto-allow high risk");
        }
    }

    #[test]
    fn uncertainty_is_fail_closed_under_every_policy() {
        let uncertain = Signals { destructive: false, outbound: false, uncertain: true, known_safe: true };
        for policy in POLICIES {
            let v = classify(policy, &uncertain);
            assert_eq!(v.action, ClassAction::Ask, "{policy:?}: uncertain must Ask even if known-safe");
        }
    }

    #[test]
    fn policies_differ_only_on_medium_and_low() {
        let outbound = Signals { destructive: false, outbound: true, uncertain: false, known_safe: false };
        assert_eq!(classify(ClassifierPolicy::Conservative, &outbound).action, ClassAction::Ask);
        assert_eq!(classify(ClassifierPolicy::Balanced, &outbound).action, ClassAction::Ask);
        assert_eq!(classify(ClassifierPolicy::Permissive, &outbound).action, ClassAction::Allow);
    }

    #[test]
    fn conservative_asks_unclassified_low() {
        let plain = Signals { destructive: false, outbound: false, uncertain: false, known_safe: false };
        assert_eq!(classify(ClassifierPolicy::Conservative, &plain).action, ClassAction::Ask);
        assert_eq!(classify(ClassifierPolicy::Balanced, &plain).action, ClassAction::Allow);
        let safe = Signals { known_safe: true, ..plain };
        assert_eq!(classify(ClassifierPolicy::Conservative, &safe).action, ClassAction::Allow);
    }

    #[test]
    fn every_verdict_is_structured_with_reasons() {
        for policy in POLICIES {
            for signals in [
                Signals { destructive: true, outbound: true, uncertain: false, known_safe: false },
                Signals { destructive: false, outbound: true, uncertain: false, known_safe: false },
                Signals { destructive: false, outbound: false, uncertain: false, known_safe: true },
            ] {
                let v = classify(policy, &signals);
                assert!(!v.reasons.is_empty(), "verdicts must explain themselves");
            }
        }
    }
}
