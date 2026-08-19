//! Realm isolation evaluation (P3 milestone: 执行世界谱系).
//!
//! Packs compose into REALMS (one per pack, DS-P2: collisions are only
//! possible WITHIN a realm). This audit evaluates the isolation posture
//! of a pack set by driving the REAL composition (`compose_packs` +
//! `RealmMap`) — not a model of it:
//!
//! - one realm per pack (realm count == pack count);
//! - every declared service lands in its own pack's realm;
//! - every service declares the Isolated realm kind;
//! - cross-realm name duplicates are legal (isolated namespaces) but
//!   surfaced in the report — the evaluation makes them visible.

use std::collections::BTreeMap;

use nofy_daemon::pack::{PackError, PackManifest, Realm, compose_packs};

/// The isolation evaluation report.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RealmAudit {
    pub packs: usize,
    pub realms: usize,
    /// Service names present in more than one realm (legal, surfaced).
    pub cross_realm_duplicates: Vec<String>,
    /// (pack, service) pairs whose declared realm kind is not Isolated.
    pub non_isolated: Vec<(String, String)>,
    pub verdict: IsolationVerdict,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum IsolationVerdict {
    Isolated,
    Findings,
}

/// Evaluate the isolation posture of a pack set.
pub fn audit_realms(packs: &[PackManifest]) -> Result<RealmAudit, PackError> {
    let map = compose_packs(packs)?;

    // Cross-realm duplicates: same service name under several packs.
    let mut name_counts: BTreeMap<&str, usize> = BTreeMap::new();
    for pack in packs {
        for svc in &pack.services {
            *name_counts.entry(svc.name.as_str()).or_insert(0) += 1;
        }
    }
    let cross_realm_duplicates: Vec<String> = name_counts
        .into_iter()
        .filter(|(_, count)| *count > 1)
        .map(|(name, _)| name.to_string())
        .collect();

    let non_isolated: Vec<(String, String)> = packs
        .iter()
        .flat_map(|pack| {
            pack.services.iter().filter(|svc| svc.realm != Realm::Isolated).map(
                move |svc| (pack.id.clone(), svc.name.clone()),
            )
        })
        .collect();

    let one_realm_per_pack = map.realms() == packs.len();
    let verdict = if one_realm_per_pack && non_isolated.is_empty() {
        IsolationVerdict::Isolated
    } else {
        IsolationVerdict::Findings
    };

    Ok(RealmAudit {
        packs: packs.len(),
        realms: map.realms(),
        cross_realm_duplicates,
        non_isolated,
        verdict,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use nofy_daemon::pack::ServiceDecl;

    fn pack(id: &str, services: &[&str]) -> PackManifest {
        PackManifest {
            id: id.into(),
            persona: "test persona".into(),
            skills: vec![],
            mcp: vec![],
            tool_policy: "strict".into(),
            model_route: None,
            subagents: vec![],
            services: services
                .iter()
                .map(|name| ServiceDecl { name: (*name).into(), realm: Realm::Isolated })
                .collect(),
        }
    }

    #[test]
    fn disjoint_packs_audit_isolated() {
        let packs = vec![pack("a", &["svc-1"]), pack("b", &["svc-2"])];
        let audit = audit_realms(&packs).unwrap();
        assert_eq!(audit.packs, 2);
        assert_eq!(audit.realms, 2, "one realm per pack");
        assert!(audit.cross_realm_duplicates.is_empty());
        assert!(audit.non_isolated.is_empty());
        assert_eq!(audit.verdict, IsolationVerdict::Isolated);
    }

    #[test]
    fn cross_realm_name_duplicates_are_legal_but_visible() {
        // Two realms may each publish a service named "index" — DS-P2
        // says collisions only exist WITHIN a realm. The audit surfaces
        // the duplication without failing.
        let packs = vec![pack("a", &["index"]), pack("b", &["index"])];
        let audit = audit_realms(&packs).unwrap();
        assert_eq!(audit.verdict, IsolationVerdict::Isolated);
        assert_eq!(audit.cross_realm_duplicates, vec!["index".to_string()]);
    }

    #[test]
    fn within_realm_collision_fails_loud() {
        let packs = vec![pack("a", &["svc", "svc"])];
        assert!(matches!(audit_realms(&packs), Err(PackError::RealmCollision { .. })));
    }

    #[test]
    fn non_isolated_service_declarations_are_findings() {
        let mut bad = pack("a", &["svc"]);
        bad.services[0].realm = Realm::Root;
        let audit = audit_realms(&[bad]).unwrap();
        assert_eq!(audit.non_isolated, vec![("a".to_string(), "svc".to_string())]);
        assert_eq!(audit.verdict, IsolationVerdict::Findings);
    }

    #[test]
    fn exemplar_packs_pass_the_isolation_audit() {
        let audit = audit_realms(&crate::exemplars::exemplar_packs()).unwrap();
        assert_eq!(audit.verdict, IsolationVerdict::Isolated);
        assert_eq!(audit.realms, 2);
    }
}
