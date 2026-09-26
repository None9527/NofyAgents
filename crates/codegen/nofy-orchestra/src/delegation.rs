//! Delegation line = expert summons (FR10.5, DS-P5).
//!
//! A pack's delegation roster is a set of ONE-LINE providers: each
//! `SubagentRef` names an external expert (an ACP provider) that can be
//! summoned with a goal. Resolving a delegation line produces the task
//! spec the provider host will dispatch — nothing more: the summoner's
//! composition travels as context, the expert's own pack defines the rest.

use nofy_packcore::{PackManifest, SubagentRef};

#[derive(Debug, PartialEq, Eq)]
pub enum DelegationError {
    /// Delegation line has an empty provider — unsummonable.
    EmptyProvider { expert: String },
    /// Goal must be non-empty: a summons without a goal is a no-op trap.
    EmptyGoal { expert: String },
    /// A pack cannot summon itself (delegation must cross the boundary).
    SelfSummons { pack: String },
}

/// The resolved summons: what the provider host dispatches.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DelegationSpec {
    pub expert_id: String,
    /// One-line provider identifier (external ACP expert).
    pub provider: String,
    pub goal: String,
    /// Summoner context: persona of the delegating pack (so the expert
    /// knows who called), never the summoner's policies (DS-P4).
    pub summoner_persona: String,
    pub summoner_pack: String,
}

/// Resolve one delegation line against a goal.
pub fn resolve_delegation(
    line: &SubagentRef,
    goal: &str,
    summoner: &PackManifest,
) -> Result<DelegationSpec, DelegationError> {
    if line.provider.trim().is_empty() {
        return Err(DelegationError::EmptyProvider {
            expert: line.id.clone(),
        });
    }
    if goal.trim().is_empty() {
        return Err(DelegationError::EmptyGoal {
            expert: line.id.clone(),
        });
    }
    if line.id == summoner.id || line.provider == summoner.id {
        return Err(DelegationError::SelfSummons {
            pack: summoner.id.clone(),
        });
    }
    Ok(DelegationSpec {
        expert_id: line.id.clone(),
        provider: line.provider.clone(),
        goal: goal.trim().to_string(),
        summoner_persona: summoner.persona.clone(),
        summoner_pack: summoner.id.clone(),
    })
}

/// Resolve the whole roster; one bad line fails the summons fail-loud.
pub fn resolve_roster(
    roster: &[SubagentRef],
    goal: &str,
    summoner: &PackManifest,
) -> Result<Vec<DelegationSpec>, DelegationError> {
    roster
        .iter()
        .map(|line| resolve_delegation(line, goal, summoner))
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn summoner() -> PackManifest {
        PackManifest {
            id: "coordinator".into(),
            persona: "You coordinate experts.".into(),
            skills: vec![],
            mcp: vec![],
            tool_policy: "strict".into(),
            model_route: None,
            subagents: vec![],
            services: vec![],
        }
    }

    fn line(id: &str, provider: &str) -> SubagentRef {
        SubagentRef {
            id: id.into(),
            provider: provider.into(),
        }
    }

    #[test]
    fn delegation_line_resolves_to_summons() {
        let spec = resolve_delegation(
            &line("sec-expert", "acp://sec"),
            "audit the diff",
            &summoner(),
        )
        .unwrap();
        assert_eq!(spec.expert_id, "sec-expert");
        assert_eq!(spec.provider, "acp://sec");
        assert_eq!(spec.goal, "audit the diff");
        assert_eq!(spec.summoner_pack, "coordinator");
        assert!(spec.summoner_persona.contains("coordinate"));
    }

    #[test]
    fn empty_provider_or_goal_fail_loud() {
        assert_eq!(
            resolve_delegation(&line("x", "  "), "g", &summoner()),
            Err(DelegationError::EmptyProvider { expert: "x".into() })
        );
        assert_eq!(
            resolve_delegation(&line("x", "acp://x"), "   ", &summoner()),
            Err(DelegationError::EmptyGoal { expert: "x".into() })
        );
    }

    #[test]
    fn self_summons_is_rejected() {
        assert_eq!(
            resolve_delegation(&line("mirror", "coordinator"), "g", &summoner()),
            Err(DelegationError::SelfSummons {
                pack: "coordinator".into()
            })
        );
        assert_eq!(
            resolve_delegation(&line("coordinator", "acp://other"), "g", &summoner()),
            Err(DelegationError::SelfSummons {
                pack: "coordinator".into()
            })
        );
    }

    #[test]
    fn roster_resolution_is_all_or_nothing() {
        let roster = vec![line("a", "acp://a"), line("bad", ""), line("c", "acp://c")];
        assert!(matches!(
            resolve_roster(&roster, "g", &summoner()),
            Err(DelegationError::EmptyProvider { .. })
        ));
        let ok_roster = vec![line("a", "acp://a"), line("c", "acp://c")];
        assert_eq!(
            resolve_roster(&ok_roster, "g", &summoner()).unwrap().len(),
            2
        );
    }
}
