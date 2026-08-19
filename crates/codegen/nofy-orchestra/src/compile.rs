//! One pack manifest, two compile targets (FR10.6).
//!
//! A pack compiles to TWO distinct compositions from the SAME manifest:
//!
//! - **Session-level** (join): the pack becomes the session's own
//!   composition — persona, skills, tool policy, model route.
//! - **Subagent-level** (summon): the pack becomes a summoned expert —
//!   persona, skills, and its delegation roster.
//!
//! Host-plane ownership (DS-P4) is enforced BY CONSTRUCTION: neither
//! composition type has fields for sandbox/approval/persistence, so a
//! compiled pack can never carry them, even if a malformed manifest
//! somehow slipped past `parse_pack`.

use nofy_packcore::{PackManifest, SubagentRef};

/// Session-level compile target (会话级).
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SessionComposition {
    pub pack_id: String,
    pub persona: String,
    pub skills: Vec<String>,
    pub tool_policy: String,
    pub model_route: Option<String>,
}

/// Subagent-level compile target (subagent 级).
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SubagentComposition {
    pub pack_id: String,
    pub persona: String,
    pub skills: Vec<String>,
    /// The delegation roster travels with a summoned expert.
    pub delegation_roster: Vec<SubagentRef>,
}

/// Compile a pack for session join.
pub fn compile_session(pack: &PackManifest) -> SessionComposition {
    SessionComposition {
        pack_id: pack.id.clone(),
        persona: pack.persona.clone(),
        skills: pack.skills.clone(),
        tool_policy: pack.tool_policy.clone(),
        model_route: pack.model_route.clone(),
    }
}

/// Compile a pack for subagent summons.
pub fn compile_subagent(pack: &PackManifest) -> SubagentComposition {
    SubagentComposition {
        pack_id: pack.id.clone(),
        persona: pack.persona.clone(),
        skills: pack.skills.clone(),
        delegation_roster: pack.subagents.clone(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use nofy_packcore::McpRef;

    fn pack() -> PackManifest {
        PackManifest {
            id: "reviewer".into(),
            persona: "You review.".into(),
            skills: vec!["diff".into(), "risk".into()],
            mcp: vec![McpRef {
                name: "git".into(),
                transport: "stdio".into(),
            }],
            tool_policy: "strict".into(),
            model_route: Some("fast".into()),
            subagents: vec![SubagentRef {
                id: "sec".into(),
                provider: "acp://sec".into(),
            }],
            services: vec![],
        }
    }

    #[test]
    fn both_targets_come_from_one_manifest() {
        let manifest = pack();
        let session = compile_session(&manifest);
        let subagent = compile_subagent(&manifest);

        // Shared core is identical — single source of truth.
        assert_eq!(session.pack_id, subagent.pack_id);
        assert_eq!(session.persona, subagent.persona);
        assert_eq!(session.skills, subagent.skills);

        // Target-specific projections differ.
        assert_eq!(session.tool_policy, "strict");
        assert_eq!(session.model_route, Some("fast".into()));
        assert_eq!(subagent.delegation_roster.len(), 1);
    }

    #[test]
    fn compile_is_deterministic() {
        let manifest = pack();
        assert_eq!(compile_session(&manifest), compile_session(&manifest));
        assert_eq!(compile_subagent(&manifest), compile_subagent(&manifest));
    }

    #[test]
    fn minimal_pack_compiles_both_targets() {
        let manifest = PackManifest {
            id: "bare".into(),
            persona: "p".into(),
            skills: vec![],
            mcp: vec![],
            tool_policy: String::new(),
            model_route: None,
            subagents: vec![],
            services: vec![],
        };
        let session = compile_session(&manifest);
        let subagent = compile_subagent(&manifest);
        assert!(session.skills.is_empty());
        assert!(subagent.delegation_roster.is_empty());
        assert_eq!(session.model_route, None);
    }
}
