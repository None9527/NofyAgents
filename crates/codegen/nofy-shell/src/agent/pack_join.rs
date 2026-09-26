//! Shell-side pack join (FR10 integration): map a validated dispatch frame
//! onto the agent builder. Pure mapping is separated from the thin apply so
//! the semantics are testable without constructing an agent.
//!
//! The provider loop (connecting to `NOFY_DAEMON_SOCK` and feeding dispatches
//! here) is the follow-up wiring; this module is the closure body it will
//! pass to `nofy_daemon::provider::ProviderClient::run_loop`.

use nofy_control_schema::methods::ControlResponse;

/// The join arguments extracted from a dispatch frame.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PackJoin {
    pub task_id: String,
    pub pack_id: String,
    pub persona_instructions: Option<String>,
    pub skill_names: Vec<String>,
}

/// Extract join args from a `TaskDispatch` response; None for anything else.
pub fn join_from_dispatch(resp: &ControlResponse) -> Option<PackJoin> {
    match resp {
        ControlResponse::TaskDispatch {
            task_id,
            pack,
            persona,
            skills,
            ..
        } => Some(PackJoin {
            task_id: task_id.clone(),
            pack_id: pack.clone(),
            persona_instructions: persona.clone(),
            skill_names: skills.clone(),
        }),
        _ => None,
    }
}

/// Apply join args to the builder: a dispatched task is an expert summons
/// (DS-P5), so it assembles with the subagent audience — the only template
/// that renders a `<persona>` block — the pack persona becomes persona
/// instructions (the deployment default is shadowed, DS-P3), and pack
/// skills become the skill whitelist for this agent only.
pub fn apply_to_builder(
    builder: nofy_agent::AgentBuilder,
    join: &PackJoin,
) -> nofy_agent::AgentBuilder {
    let builder = builder
        .with_prompt_audience(nofy_agent::prompt::context::PromptAudience::Subagent)
        .with_persona_instructions(join.persona_instructions.clone());
    if join.skill_names.is_empty() {
        builder
    } else {
        builder.with_skills(join.skill_names.clone())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn dispatch() -> ControlResponse {
        ControlResponse::TaskDispatch {
            task_id: "t1".into(),
            pack: "file-steward".into(),
            goal: "organize".into(),
            persona: Some("You are the file steward.".into()),
            skills: vec!["find".into(), "cleanup".into()],
            cwd: None,
        }
    }

    #[test]
    fn extracts_join_args_from_dispatch_only() {
        let j = join_from_dispatch(&dispatch()).unwrap();
        assert_eq!(j.task_id, "t1");
        assert_eq!(j.pack_id, "file-steward");
        assert_eq!(
            j.persona_instructions.as_deref(),
            Some("You are the file steward.")
        );
        assert_eq!(
            j.skill_names,
            vec!["find".to_string(), "cleanup".to_string()]
        );
        assert!(join_from_dispatch(&ControlResponse::Pong).is_none());
        assert!(join_from_dispatch(&ControlResponse::NoPending).is_none());
    }

    // `apply_to_builder` stays thin (two builder setters); constructing an
    // AgentBuilder needs live backends, so it is exercised by the provider
    // loop wiring, not unit tests.
}
