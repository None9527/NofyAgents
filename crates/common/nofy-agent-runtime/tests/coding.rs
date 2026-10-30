use nofy_agent_runtime::{
    Error,
    coding::{
        CodingHost,
        length::{LengthSalvage, SalvageStep},
        stationarity::IdenticalToolCallRun,
    },
    pipeline::{Flow, Stage},
};
struct Host {
    samples: usize,
    tools: usize,
    recovery: LengthSalvage,
}
impl CodingHost for Host {
    type Output = usize;
    type Error = Error;
    async fn model(&mut self) -> Result<Flow<usize>, Error> {
        self.samples += 1;
        Ok(Flow::Next)
    }
    async fn completion(&mut self) -> Result<Flow<usize>, Error> {
        if self.samples == 1
            && matches!(self.recovery.on_length_stop(), SalvageStep::Continue { .. })
        {
            Ok(Flow::Restart)
        } else {
            Ok(Flow::Next)
        }
    }
    async fn dispatch(&mut self) -> Result<Flow<usize>, Error> {
        self.tools += 1;
        Ok(Flow::Next)
    }
}
#[tokio::test]
async fn coding_recipe_runs_without_a_session_actor_and_accepts_custom_policies() {
    let mut pipeline = nofy_agent_runtime::coding::pipeline::<Host>();
    pipeline
        .replace(Stage::new("convergence", |host: &mut Host| {
            Box::pin(async move { Ok(Flow::Finish(host.samples)) })
        }))
        .unwrap();
    let mut host = Host {
        samples: 0,
        tools: 0,
        recovery: LengthSalvage::new(Some(2)),
    };
    assert_eq!(pipeline.run(&mut host).await.unwrap(), 2);
    assert_eq!(host.tools, 1);
}
#[test]
fn original_repeat_and_length_policies_are_independently_reusable() {
    let mut guard = IdenticalToolCallRun::default();
    for _ in 0..4 {
        guard.observe("same", "lookup", true, false);
    }
    assert!(guard.take_nudge());
    assert!(!guard.take_nudge());
    assert_eq!(guard.hard_stop_threshold(), 8);
    guard.observe("different", "lookup", true, false);
    assert_eq!(guard.run_len, 1);
    let mut recovery = LengthSalvage::new(Some(1));
    assert!(matches!(
        recovery.on_length_stop(),
        SalvageStep::Continue {
            inject_reminder: true
        }
    ));
    assert!(matches!(recovery.on_length_stop(), SalvageStep::Exhaust));
    assert!(matches!(recovery.on_length_stop(), SalvageStep::None));
}

#[test]
fn completion_policy_uses_explicit_task_observations_without_session_state() {
    use nofy_agent_runtime::coding::todo::{TodoGateDecision, TodoGateInput, evaluate_todo_gate};
    let pending = TodoGateInput {
        pending: vec!["finish report"],
        in_progress_unbacked: vec![],
        in_progress_backed: vec![],
        backing_task_count: 0,
    };
    assert!(
        matches!(evaluate_todo_gate(&pending),TodoGateDecision::Nudge {reminder,reason} if reminder.contains("finish report")&&reason.as_str()=="in_flight")
    );
    let backed = TodoGateInput {
        pending: vec![],
        in_progress_unbacked: vec![],
        in_progress_backed: vec!["background report"],
        backing_task_count: 1,
    };
    assert!(matches!(
        evaluate_todo_gate(&backed),
        TodoGateDecision::Continue
    ));
}
