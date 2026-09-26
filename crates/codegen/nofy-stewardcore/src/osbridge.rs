//! OS integration bridges as search providers (FR12.10): Spotlight /
//! Everything evaluation gate.
//!
//! An OS bridge (macOS Spotlight, Windows Everything) may join as a
//! search PROVIDER only if it keeps the steward's invariants. This
//! module is the evaluation gate: candidates are judged against four
//! non-negotiable properties, and any miss means Reject — the bridge
//! stays out.
//!
//! The four properties:
//!
//! 1. **read-only** — the bridge answers queries; it never mutates the
//!    filesystem;
//! 2. **hints only** — bridge hits are index hints, revalidated against
//!    the disk before any operation (FR12.9 carries through);
//! 3. **default-off** — adoption never enables a bridge by itself; an
//!    explicit opt-in still has to follow;
//! 4. **local-only** — the bridge is OS-local IPC; no new outbound.

/// Known OS bridge candidates.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum OsBridge {
    /// macOS Spotlight.
    Spotlight,
    /// Windows Everything.
    Everything,
}

/// Observed properties of one bridge candidate.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct BridgeProperties {
    pub read_only: bool,
    pub results_are_hints: bool,
    pub requires_opt_in: bool,
    pub local_ipc_only: bool,
}

/// The evaluation verdict.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum BridgeVerdict {
    /// May join as a provider — still default-off until opted in.
    Adopt { bridge: OsBridge },
    Reject {
        bridge: OsBridge,
        reasons: Vec<String>,
    },
}

/// Evaluate one candidate. Every property is non-negotiable.
pub fn evaluate_candidate(bridge: OsBridge, props: &BridgeProperties) -> BridgeVerdict {
    let mut reasons = Vec::new();
    if !props.read_only {
        reasons.push("bridge can mutate the filesystem".to_string());
    }
    if !props.results_are_hints {
        reasons.push("bridge hits would skip disk revalidation (FR12.9)".to_string());
    }
    if !props.requires_opt_in {
        reasons.push("bridge would enable itself (default-off violated)".to_string());
    }
    if !props.local_ipc_only {
        reasons.push("bridge introduces new outbound".to_string());
    }
    if reasons.is_empty() {
        BridgeVerdict::Adopt { bridge }
    } else {
        BridgeVerdict::Reject { bridge, reasons }
    }
}

/// Adoption state: an adopted bridge is STILL off until opted in.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum BridgeState {
    Off,
    OptedIn,
}

/// The provider record produced by a successful evaluation.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct BridgeProvider {
    pub bridge: OsBridge,
    pub state: BridgeState,
}

/// Adopt a candidate: only an Adopt verdict produces a provider, and
/// the provider starts OFF.
pub fn adopt(bridge: OsBridge, props: &BridgeProperties) -> Result<BridgeProvider, BridgeVerdict> {
    match evaluate_candidate(bridge, props) {
        BridgeVerdict::Adopt { bridge } => Ok(BridgeProvider {
            bridge,
            state: BridgeState::Off,
        }),
        reject => Err(reject),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn compliant() -> BridgeProperties {
        BridgeProperties {
            read_only: true,
            results_are_hints: true,
            requires_opt_in: true,
            local_ipc_only: true,
        }
    }

    #[test]
    fn compliant_bridges_adopt_but_stay_off() {
        for bridge in [OsBridge::Spotlight, OsBridge::Everything] {
            let provider = adopt(bridge, &compliant()).unwrap();
            assert_eq!(provider.bridge, bridge);
            assert_eq!(
                provider.state,
                BridgeState::Off,
                "adoption never self-enables"
            );
        }
    }

    #[test]
    fn write_capable_bridges_are_rejected() {
        let props = BridgeProperties {
            read_only: false,
            ..compliant()
        };
        assert_eq!(
            evaluate_candidate(OsBridge::Spotlight, &props),
            BridgeVerdict::Reject {
                bridge: OsBridge::Spotlight,
                reasons: vec!["bridge can mutate the filesystem".to_string()],
            }
        );
        assert!(adopt(OsBridge::Spotlight, &props).is_err());
    }

    #[test]
    fn hint_skipping_bridges_are_rejected() {
        let props = BridgeProperties {
            results_are_hints: false,
            ..compliant()
        };
        assert_eq!(
            evaluate_candidate(OsBridge::Everything, &props),
            BridgeVerdict::Reject {
                bridge: OsBridge::Everything,
                reasons: vec!["bridge hits would skip disk revalidation (FR12.9)".to_string()],
            }
        );
    }

    #[test]
    fn self_enabling_or_outbound_bridges_are_rejected() {
        let self_enabling = BridgeProperties {
            requires_opt_in: false,
            ..compliant()
        };
        assert!(matches!(
            evaluate_candidate(OsBridge::Spotlight, &self_enabling),
            BridgeVerdict::Reject { .. }
        ));
        let outbound = BridgeProperties {
            local_ipc_only: false,
            ..compliant()
        };
        assert!(matches!(
            evaluate_candidate(OsBridge::Everything, &outbound),
            BridgeVerdict::Reject { .. }
        ));
    }

    #[test]
    fn every_violation_is_reported_together() {
        let props = BridgeProperties {
            read_only: false,
            results_are_hints: false,
            requires_opt_in: false,
            local_ipc_only: false,
        };
        assert_eq!(
            evaluate_candidate(OsBridge::Spotlight, &props),
            BridgeVerdict::Reject {
                bridge: OsBridge::Spotlight,
                reasons: vec![
                    "bridge can mutate the filesystem".to_string(),
                    "bridge hits would skip disk revalidation (FR12.9)".to_string(),
                    "bridge would enable itself (default-off violated)".to_string(),
                    "bridge introduces new outbound".to_string(),
                ],
            }
        );
    }
}
