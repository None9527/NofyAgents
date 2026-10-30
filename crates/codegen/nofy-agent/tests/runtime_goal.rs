#![cfg(feature = "goal")]
use nofy_agent::runtime::goal::*;
use nofy_agent_runtime::{
    recipe::{goal::*, *},
    registry::*,
    *,
};
use nofy_goal::{GoalPauseReason, GoalStatus, GoalTracker};
use parking_lot::Mutex;
use serde_json::{Value, json};
use std::{
    collections::BTreeMap,
    sync::{
        Arc,
        atomic::{AtomicUsize, Ordering},
    },
};

struct Finish(Arc<AtomicUsize>);
#[async_trait::async_trait]
impl Model for Finish {
    async fn complete(&self, _: ModelRequest, _: &RunContext) -> Result<ModelResponse, Error> {
        self.0.fetch_add(1, Ordering::SeqCst);
        Ok(ModelResponse {
            output: "claimed done".into(),
            ..Default::default()
        })
    }
}
fn context() -> RunContext {
    RunContext::new("thread", "run")
}
fn tracker(root: &std::path::Path) -> Arc<Mutex<GoalTracker>> {
    let mut tracker = GoalTracker::new(root.to_owned());
    tracker.create_goal(
        "goal-1".into(),
        "Finish the actual goal".into(),
        Some(10000),
        0,
        "2026-10-29T00:00:00Z".into(),
        None,
    );
    Arc::new(Mutex::new(tracker))
}
fn configured(source: Arc<NofyGoalSource>, calls: Arc<AtomicUsize>) -> Agent {
    let mut registry = ModuleRegistry::default();
    registry
        .register_factory(Arc::new(GoalSourceFactory::new(BTreeMap::from([(
            "session-goal".into(),
            source,
        )]))))
        .unwrap();
    registry
        .register_factory(Arc::new(GoalStageFactory))
        .unwrap();
    registry.register_factory(Arc::new(RecipeFactory)).unwrap();
    registry
        .register_factory(Arc::new(InstanceFactory::new(
            "model",
            "1",
            ModuleInstance::Model(Arc::new(Finish(calls))),
        )))
        .unwrap();
    registry
        .register_factory(Arc::new(InstanceFactory::new(
            "prompt",
            "1",
            ModuleInstance::Prompt(Arc::new(StaticPrompt("Goal work".into()))),
        )))
        .unwrap();
    let document = json!({"modules":[
        {"reference":{"id":"m","version":"1"},"factory":"model","config":{}},
        {"reference":{"id":"p","version":"1"},"factory":"prompt","config":{}},
        {"reference":{"id":"goal-source","version":"1"},"factory":"source.nofy_goal","config":{"source":"session-goal"}},
        {"reference":{"id":"goal","version":"1"},"factory":"stage.goal","config":{"max_continuations":2}},
        {"reference":{"id":"recipe","version":"1"},"factory":"runtime.recipe","config":{"stages":[{"name":"goal","at":"before_stop","stage":"decision","source":"state"}]},"dependencies":{"decision":{"id":"goal","version":"1"},"state":{"id":"goal-source","version":"1"}}}
    ],"agent":{"name":"goal-worker","model":{"id":"m","version":"1"},"prompt":{"id":"p","version":"1"},"recipe":{"id":"recipe","version":"1"}}});
    let compiled =
        compile::compile_document(serde_json::from_value(document).unwrap(), &registry).unwrap();
    compiled
        .snapshot
        .restore(&registry)
        .unwrap()
        .agent
        .with_checkpointer(Arc::new(InMemoryCheckpointer::default()))
}
#[tokio::test]
async fn active_canonical_goal_cannot_be_completed_by_a_final_answer_and_verified_state_resumes_without_resampling()
 {
    let root = tempfile::tempdir().unwrap();
    let tracker = tracker(root.path());
    let source = Arc::new(NofyGoalSource::new(tracker.clone(), "thread".into(), "goal-1").unwrap());
    let calls = Arc::new(AtomicUsize::new(0));
    let agent = configured(source, calls.clone());
    let RunOutcome::Paused { reason, state } = agent
        .invoke(RunInput::new("do it"), context())
        .await
        .unwrap()
    else {
        panic!("unverified goal must pause")
    };
    assert_eq!(reason["kind"], "goal_not_complete");
    assert_eq!(
        state.recipe_progress.stage_data("goal").unwrap()["continuations"],
        2
    );
    assert_eq!(calls.load(Ordering::SeqCst), 3);
    assert_eq!(tracker.lock().status(), Some(GoalStatus::Active));
    // The trusted canonical completion producer is the verifier/controller;
    // this test exercises its completed fact, not a model's self-assertion.
    assert!(tracker.lock().complete());
    assert!(matches!(
        agent.invoke(RunInput::resume(), context()).await.unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(calls.load(Ordering::SeqCst), 3);
}
#[tokio::test]
async fn canonical_paused_budget_and_unknown_restored_states_stay_on_the_control_rail() {
    for status in [
        GoalStatus::UserPaused,
        GoalStatus::BackOffPaused,
        GoalStatus::NoProgressPaused,
        GoalStatus::InfraPaused,
        GoalStatus::Blocked,
        GoalStatus::BudgetLimited,
    ] {
        let root = tempfile::tempdir().unwrap();
        let tracker = tracker(root.path());
        {
            let mut tracker = tracker.lock();
            match status {
                GoalStatus::UserPaused => {
                    tracker.pause(GoalPauseReason::User);
                }
                GoalStatus::BackOffPaused => {
                    tracker.pause(GoalPauseReason::BackOff);
                }
                GoalStatus::NoProgressPaused => {
                    tracker.pause(GoalPauseReason::NoProgress);
                }
                GoalStatus::InfraPaused => {
                    tracker.pause(GoalPauseReason::Infra);
                }
                GoalStatus::Blocked => {
                    tracker.pause(GoalPauseReason::Verification);
                }
                GoalStatus::BudgetLimited => {
                    tracker.budget_limit();
                }
                _ => unreachable!(),
            }
        }
        let source = Arc::new(NofyGoalSource::new(tracker, "thread".into(), "goal-1").unwrap());
        let outcome = configured(source, Default::default())
            .invoke(RunInput::new("go"), context())
            .await
            .unwrap();
        assert!(if status == GoalStatus::BudgetLimited {
            matches!(outcome, RunOutcome::BudgetExceeded { .. })
        } else {
            matches!(outcome, RunOutcome::Paused { .. })
        });
    }
    let root = tempfile::tempdir().unwrap();
    let original = tracker(root.path());
    let mut value = serde_json::to_value(original.lock().snapshot().unwrap()).unwrap();
    value["status"] = json!("future_active_value");
    let restored = GoalTracker::from_snapshot(
        root.path().to_owned(),
        serde_json::from_value(value).unwrap(),
    );
    assert_eq!(restored.status(), Some(GoalStatus::UserPaused));
    let source = Arc::new(
        NofyGoalSource::new(Arc::new(Mutex::new(restored)), "thread".into(), "goal-1").unwrap(),
    );
    assert!(matches!(
        configured(source, Default::default())
            .invoke(RunInput::new("go"), context())
            .await
            .unwrap(),
        RunOutcome::Paused { .. }
    ));
}
#[tokio::test]
async fn goal_source_is_owner_scoped_and_lock_contention_remains_cancellable() {
    let root = tempfile::tempdir().unwrap();
    let tracker = tracker(root.path());
    let source = NofyGoalSource::new(tracker.clone(), "thread".into(), "goal-1").unwrap();
    assert!(
        source
            .snapshot(&Default::default(), &RunContext::new("other", "run"))
            .await
            .is_err()
    );
    let context = context();
    let cancel = context.cancel.clone();
    let state = RunState::default();
    let held = tracker.lock();
    let (result, ()) = tokio::join!(source.snapshot(&state, &context), async {
        tokio::time::sleep(std::time::Duration::from_millis(5)).await;
        cancel.cancel();
    });
    assert!(matches!(result, Err(Error::Cancelled)));
    drop(held);
    let factory = GoalSourceFactory::new(BTreeMap::from([("goal".into(), Arc::new(source))]));
    assert!(
        factory
            .build(&json!({"source":"missing"}), &BTreeMap::new())
            .is_err()
    );
    let _: Value = factory.descriptor().config_schema;
}

#[tokio::test]
async fn replacing_the_canonical_goal_gives_it_its_own_continuation_count() {
    let root = tempfile::tempdir().unwrap();
    let tracker = tracker(root.path());
    let source =
        Arc::new(NofyGoalSource::new(tracker.clone(), "thread".into(), "goals-1").unwrap());
    let calls = Arc::new(AtomicUsize::new(0));
    let agent = configured(source, calls.clone());
    assert!(matches!(
        agent
            .invoke(RunInput::new("first goal"), context())
            .await
            .unwrap(),
        RunOutcome::Paused { .. }
    ));
    tracker.lock().create_goal(
        "goal-2".into(),
        "A newly authorized goal".into(),
        None,
        0,
        "2026-10-29T00:01:00Z".into(),
        None,
    );
    let RunOutcome::Paused { state, .. } =
        agent.invoke(RunInput::resume(), context()).await.unwrap()
    else {
        panic!("unverified replacement must pause")
    };
    let data = state.recipe_progress.stage_data("goal").unwrap();
    assert_eq!(data["goal_id"], "goal-2");
    assert_eq!(data["continuations"], 2);
    assert_eq!(calls.load(Ordering::SeqCst), 5);
    tracker.lock().complete();
    assert!(matches!(
        agent.invoke(RunInput::resume(), context()).await.unwrap(),
        RunOutcome::Completed { .. }
    ));
}
