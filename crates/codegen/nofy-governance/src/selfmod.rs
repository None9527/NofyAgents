//! Self-modification: per-package human approval (FR5.15, DS-#19).
//!
//! When the agent modifies ITSELF (its own packs, skills, hooks), every
//! PACKAGE needs its own human approval. Construction-level guarantees:
//!
//! - approvals name packages explicitly — a wildcard "approve all"
//!   blanket is refused;
//! - approving package A never authorizes package B;
//! - requests whose package has no approval are DENIED (fail-closed),
//!   never defaulted to allowed.

use std::collections::BTreeMap;

/// One self-modification request.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SelfModRequest {
    pub id: String,
    pub package: String,
    pub summary: String,
}

/// One human approval decision.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PackageApproval {
    pub package: String,
    pub approved: bool,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SelfModError {
    /// Blanket approvals are refused: per-package only.
    BlanketApproval,
    /// Empty package names are refused.
    EmptyPackage,
}

/// Group requests per package (deterministic order inside each group).
pub fn group_by_package(requests: &[SelfModRequest]) -> BTreeMap<String, Vec<&SelfModRequest>> {
    let mut groups: BTreeMap<String, Vec<&SelfModRequest>> = BTreeMap::new();
    for request in requests {
        groups
            .entry(request.package.clone())
            .or_default()
            .push(request);
    }
    groups
}

/// Validate the approval set itself.
pub fn validate_approvals(approvals: &[PackageApproval]) -> Result<(), SelfModError> {
    for approval in approvals {
        let name = approval.package.trim();
        if name.is_empty() {
            return Err(SelfModError::EmptyPackage);
        }
        if name == "*" || name.eq_ignore_ascii_case("all") {
            return Err(SelfModError::BlanketApproval);
        }
    }
    Ok(())
}

/// Authorization outcome for one request.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum AuthOutcome {
    Authorized,
    /// The package was explicitly denied.
    Denied,
    /// The package was never decided: fail-closed.
    Undecided,
}

/// Authorize requests against the approval set. Every request is judged
/// by its OWN package's approval — nothing else.
pub fn authorize(
    requests: &[SelfModRequest],
    approvals: &[PackageApproval],
) -> Result<Vec<(String, AuthOutcome)>, SelfModError> {
    validate_approvals(approvals)?;
    let mut outcomes = Vec::new();
    for request in requests {
        let outcome = match approvals.iter().find(|a| a.package == request.package) {
            Some(approval) if approval.approved => AuthOutcome::Authorized,
            Some(_) => AuthOutcome::Denied,
            None => AuthOutcome::Undecided,
        };
        outcomes.push((request.id.clone(), outcome));
    }
    Ok(outcomes)
}

/// Only authorized requests may proceed.
pub fn authorized_ids(outcomes: &[(String, AuthOutcome)]) -> Vec<String> {
    outcomes
        .iter()
        .filter(|(_, outcome)| *outcome == AuthOutcome::Authorized)
        .map(|(id, _)| id.clone())
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn requests() -> Vec<SelfModRequest> {
        vec![
            SelfModRequest {
                id: "r1".into(),
                package: "skill-writer".into(),
                summary: "edit SKILL.md".into(),
            },
            SelfModRequest {
                id: "r2".into(),
                package: "hook-installer".into(),
                summary: "add PostToolUse hook".into(),
            },
            SelfModRequest {
                id: "r3".into(),
                package: "skill-writer".into(),
                summary: "edit runner".into(),
            },
        ]
    }

    #[test]
    fn grouping_is_per_package() {
        let requests = requests();
        let groups = group_by_package(&requests);
        assert_eq!(groups.len(), 2);
        assert_eq!(groups["skill-writer"].len(), 2);
        assert_eq!(groups["hook-installer"].len(), 1);
    }

    #[test]
    fn blanket_approvals_are_refused() {
        for blanket in ["*", "all", "ALL"] {
            let approvals = vec![PackageApproval {
                package: blanket.into(),
                approved: true,
            }];
            assert_eq!(
                validate_approvals(&approvals),
                Err(SelfModError::BlanketApproval)
            );
        }
        assert_eq!(
            validate_approvals(&[PackageApproval {
                package: "  ".into(),
                approved: true
            }]),
            Err(SelfModError::EmptyPackage)
        );
    }

    #[test]
    fn approval_of_one_package_never_authorizes_another() {
        let approvals = vec![PackageApproval {
            package: "skill-writer".into(),
            approved: true,
        }];
        let outcomes = authorize(&requests(), &approvals).unwrap();
        let by_id: BTreeMap<_, _> = outcomes.into_iter().collect();
        assert_eq!(by_id["r1"], AuthOutcome::Authorized);
        assert_eq!(by_id["r3"], AuthOutcome::Authorized);
        assert_eq!(
            by_id["r2"],
            AuthOutcome::Undecided,
            "hook-installer was never decided"
        );
        assert_eq!(
            authorized_ids(&[
                ("r1".into(), AuthOutcome::Authorized),
                ("r2".into(), AuthOutcome::Undecided)
            ]),
            vec!["r1".to_string()]
        );
    }

    #[test]
    fn explicit_denial_beats_silence() {
        let approvals = vec![
            PackageApproval {
                package: "skill-writer".into(),
                approved: false,
            },
            PackageApproval {
                package: "hook-installer".into(),
                approved: true,
            },
        ];
        let outcomes = authorize(&requests(), &approvals).unwrap();
        let by_id: BTreeMap<_, _> = outcomes.into_iter().collect();
        assert_eq!(by_id["r1"], AuthOutcome::Denied);
        assert_eq!(by_id["r2"], AuthOutcome::Authorized);
    }

    #[test]
    fn undecided_never_defaults_to_allowed() {
        let outcomes = authorize(&requests(), &[]).unwrap();
        assert!(outcomes.iter().all(|(_, o)| *o == AuthOutcome::Undecided));
        assert!(
            authorized_ids(&outcomes).is_empty(),
            "no approval → nothing proceeds"
        );
    }
}
