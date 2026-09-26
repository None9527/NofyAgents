//! Exemplar packs (FR10.9): built-in `file-steward` + the `code-review`
//! exemplar.
//!
//! Discipline: built-ins are NOT special-cased — they must pass the exact
//! same gate third-party packs face (`parse_pack` + `compose_packs`). A
//! built-in that would fail a third-party submission is a bug.

use nofy_packcore::{PackManifest, Realm, ServiceDecl, compose_packs, parse_pack};

/// The built-in file steward pack (mirrors the daemon's built-in, held to
/// the third-party gate here).
pub fn file_steward_pack() -> PackManifest {
    PackManifest {
        id: "file-steward".into(),
        persona: "You are the file steward: you understand, organize and \
                  maintain the user's opted-in file roots. You propose \
                  changes as reviewed batches; you never delete — you \
                  move to trash. Index hints are suggestions; the disk is \
                  truth."
            .into(),
        skills: vec![
            "find".into(),
            "organize".into(),
            "cleanup".into(),
            "dedupe".into(),
        ],
        mcp: vec![],
        tool_policy: "strict".into(),
        model_route: None,
        subagents: vec![],
        services: vec![ServiceDecl {
            name: "fs-index".into(),
            realm: Realm::Isolated,
        }],
    }
}

/// The code-review exemplar pack: the reference shape for future exemplar
/// packs.
pub fn code_review_pack() -> PackManifest {
    PackManifest {
        id: "code-review".into(),
        persona: "You review code changes: correctness first, then \
                  clarity. You cite file and line; you never approve \
                  what you have not read."
            .into(),
        skills: vec!["diff-read".into(), "risk-rank".into(), "summarize".into()],
        mcp: vec![],
        tool_policy: "strict".into(),
        model_route: None,
        subagents: vec![],
        services: vec![ServiceDecl {
            name: "review-index".into(),
            realm: Realm::Isolated,
        }],
    }
}

/// All exemplar packs.
pub fn exemplar_packs() -> Vec<PackManifest> {
    vec![file_steward_pack(), code_review_pack()]
}

/// Hold every exemplar to the third-party gate. Returns the parsed packs,
/// or the first gate failure.
pub fn exemplars_pass_third_party_gate() -> Result<Vec<PackManifest>, String> {
    let mut parsed = Vec::new();
    for pack in exemplar_packs() {
        let raw = serde_json::to_value(&pack).map_err(|e| e.to_string())?;
        let manifest =
            parse_pack(&raw).map_err(|e| format!("{pack_id}: {e:?}", pack_id = pack.id))?;
        parsed.push(manifest);
    }
    compose_packs(&parsed).map_err(|e| format!("compose: {e:?}"))?;
    Ok(parsed)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn exemplars_pass_the_same_gate_as_third_parties() {
        let parsed = exemplars_pass_third_party_gate().expect("exemplars must pass the gate");
        assert_eq!(parsed.len(), 2);
        let ids: Vec<&str> = parsed.iter().map(|p| p.id.as_str()).collect();
        assert!(ids.contains(&"file-steward"));
        assert!(ids.contains(&"code-review"));
    }

    #[test]
    fn exemplar_services_stay_isolated() {
        for pack in exemplar_packs() {
            assert!(
                pack.services.iter().all(|s| s.realm == Realm::Isolated),
                "{} must keep services isolated (DS-P2)",
                pack.id
            );
        }
    }

    #[test]
    fn exemplars_carry_no_host_plane_concerns() {
        // DS-P4: exemplars are model-facing composition only.
        for pack in exemplar_packs() {
            let raw = serde_json::to_value(&pack).unwrap();
            assert!(
                parse_pack(&raw).is_ok(),
                "{} must not leak host-plane keys",
                pack.id
            );
        }
    }

    #[test]
    fn exemplars_compose_together_without_collision() {
        let parsed = exemplars_pass_third_party_gate().unwrap();
        let map = compose_packs(&parsed).unwrap();
        assert_eq!(map.realms(), 2, "each exemplar gets its own realm");
    }
}
