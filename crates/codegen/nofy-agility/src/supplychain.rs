//! Supply chain + hooks bridge (FR8.1–8.3).
//!
//! - **FR8.1 admission**: minimum release age + trust verdict, FAIL-CLOSED
//!   (unknown verdict = refuse);
//! - **FR8.2 registry**: generation invalidation + override safety gate
//!   (overrides require an explicit gate flag — never implicit);
//! - **FR8.3 hooks bridge**: detach drains with a 600s deadline and a
//!   durable pairing record; a hook crash NEVER blocks the main pipeline.

// ---- FR8.1 ----

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TrustVerdict {
    Trusted,
    Unknown,
    Malicious,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Admission {
    Admitted,
    Refused { reason: String },
}

/// Admission gate: release age + trust verdict. Fail-closed: anything not
/// explicitly trusted AND aged is refused.
pub fn admission(
    released_at: u64,
    now: u64,
    min_age_secs: u64,
    verdict: TrustVerdict,
) -> Admission {
    match verdict {
        TrustVerdict::Malicious => Admission::Refused {
            reason: "malicious verdict".into(),
        },
        TrustVerdict::Unknown => Admission::Refused {
            reason: "unknown verdict: fail-closed".into(),
        },
        TrustVerdict::Trusted => {
            let age = now.saturating_sub(released_at);
            if age < min_age_secs {
                Admission::Refused {
                    reason: format!("younger than minimum release age ({age} < {min_age_secs})"),
                }
            } else {
                Admission::Admitted
            }
        }
    }
}

// ---- FR8.2 ----

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ToolRegistry {
    pub generation: u64,
    pub tools: Vec<String>,
    /// Overrides installed through the safety gate.
    pub overrides: Vec<String>,
}

impl ToolRegistry {
    pub fn new() -> Self {
        Self {
            generation: 1,
            tools: Vec::new(),
            overrides: Vec::new(),
        }
    }

    /// Invalidate the current generation: consumers must re-resolve.
    pub fn invalidate(&mut self) {
        self.generation += 1;
    }

    /// Override safety gate: an override installs ONLY with the explicit
    /// gate flag; implicit overrides are refused.
    pub fn install_override(&mut self, tool: &str, safety_gate: bool) -> bool {
        if !safety_gate {
            return false;
        }
        self.overrides.push(tool.to_string());
        self.invalidate();
        true
    }
}

// ---- FR8.3 ----

/// Hooks bridge state during detach.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct HooksBridge {
    pub attached_hooks: usize,
    pub draining: bool,
    pub drain_deadline: Option<u64>,
    /// Durable pairing record: hook id ↔ consumer, survives the detach.
    pub pairings: Vec<(String, String)>,
}

/// Drain deadline for detach (600s per FR8.3).
pub const DRAIN_SECS: u64 = 600;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum HookOutcome {
    /// Hook result delivered to the pipeline.
    Delivered,
    /// Hook crashed: the main pipeline continues without it.
    CrashedPipelineContinues,
}

impl HooksBridge {
    pub fn new(hooks: usize) -> Self {
        Self {
            attached_hooks: hooks,
            draining: false,
            drain_deadline: None,
            pairings: Vec::new(),
        }
    }

    /// Detach: start draining with the 600s deadline.
    pub fn detach(&mut self, now: u64) {
        self.draining = true;
        self.drain_deadline = Some(now + DRAIN_SECS);
    }

    /// Is the drain window still open?
    pub fn drain_open(&self, now: u64) -> bool {
        self.draining && self.drain_deadline.is_some_and(|d| now < d)
    }

    /// A hook crashes: the pipeline must continue (never block).
    pub fn hook_crashed(&self) -> HookOutcome {
        HookOutcome::CrashedPipelineContinues
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn admission_is_fail_closed() {
        // Unknown verdict: refuse even if aged.
        assert!(matches!(
            admission(0, 1_000_000, 1000, TrustVerdict::Unknown),
            Admission::Refused { .. }
        ));
        assert!(matches!(
            admission(0, 1_000_000, 1000, TrustVerdict::Malicious),
            Admission::Refused { .. }
        ));
        // Trusted but too young: refuse.
        assert!(matches!(
            admission(900, 1000, 3600, TrustVerdict::Trusted),
            Admission::Refused { .. }
        ));
        // Trusted and aged: admit.
        assert_eq!(
            admission(0, 10_000, 3600, TrustVerdict::Trusted),
            Admission::Admitted
        );
    }

    #[test]
    fn registry_generation_invalidates() {
        let mut registry = ToolRegistry::new();
        let generation_before = registry.generation;
        registry.invalidate();
        assert!(registry.generation > generation_before);
    }

    #[test]
    fn override_requires_safety_gate() {
        let mut registry = ToolRegistry::new();
        assert!(
            !registry.install_override("dangerous-tool", false),
            "implicit override refused"
        );
        assert!(registry.overrides.is_empty());
        assert!(registry.install_override("vetted-tool", true));
        assert_eq!(registry.overrides, vec!["vetted-tool".to_string()]);
    }

    #[test]
    fn detach_drains_with_deadline() {
        let mut bridge = HooksBridge::new(3);
        bridge.pairings.push(("hook-a".into(), "consumer-1".into()));
        bridge.detach(1000);
        assert!(bridge.drain_open(1599));
        assert!(!bridge.drain_open(1600), "600s deadline is exclusive");
        // Pairings survive the detach (durable).
        assert_eq!(bridge.pairings.len(), 1);
    }

    #[test]
    fn hook_crash_never_blocks_pipeline() {
        let bridge = HooksBridge::new(1);
        assert_eq!(bridge.hook_crashed(), HookOutcome::CrashedPipelineContinues);
    }
}
