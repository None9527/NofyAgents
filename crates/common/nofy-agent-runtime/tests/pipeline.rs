use nofy_agent_runtime::{
    Error,
    pipeline::{Flow, Pipeline, Stage},
};
use std::cell::RefCell;
use std::rc::Rc;

#[derive(Default)]
struct State {
    log: Vec<&'static str>,
    rounds: usize,
}

#[tokio::test]
async fn restart_and_finish_do_not_execute_downstream_stages() {
    let mut pipeline: Pipeline<State, Vec<&str>, Error> = Pipeline::new(vec![
        Stage::new("prepare", |s: &mut State| {
            Box::pin(async move {
                s.log.push("prepare");
                Ok(Flow::Next)
            })
        }),
        Stage::new("model", |s: &mut State| {
            Box::pin(async move {
                s.log.push("model");
                s.rounds += 1;
                Ok(if s.rounds == 1 {
                    Flow::Restart
                } else {
                    Flow::Next
                })
            })
        }),
        Stage::new("finish", |s: &mut State| {
            Box::pin(async move {
                s.log.push("finish");
                Ok(Flow::Finish(s.log.clone()))
            })
        }),
        Stage::new("never", |_| {
            Box::pin(async { panic!("stage after Finish ran") })
        }),
    ])
    .unwrap();
    assert_eq!(
        pipeline.run(&mut State::default()).await.unwrap(),
        vec!["prepare", "model", "prepare", "model", "finish"]
    );
}

#[tokio::test]
async fn stages_can_be_replaced_and_use_local_actor_state() {
    let local = Rc::new(RefCell::new(0));
    let local_copy = local.clone();
    let mut pipeline: Pipeline<(), usize, Error> =
        Pipeline::new(vec![Stage::new("answer", |_| {
            Box::pin(async { Ok(Flow::Finish(1)) })
        })])
        .unwrap();
    pipeline
        .replace(Stage::new("answer", move |_| {
            let local = local_copy.clone();
            Box::pin(async move {
                *local.borrow_mut() += 1;
                Ok(Flow::Finish(42))
            })
        }))
        .unwrap();
    assert_eq!(pipeline.stage_names().collect::<Vec<_>>(), vec!["answer"]);
    assert_eq!(pipeline.run(&mut ()).await.unwrap(), 42);
    assert_eq!(*local.borrow(), 1);
    assert!(
        pipeline
            .replace(Stage::new("missing", |_| Box::pin(async {
                Ok(Flow::Finish(0))
            })))
            .is_err()
    );
}

#[tokio::test]
async fn errors_stop_the_cycle_and_state_survives() {
    let mut pipeline: Pipeline<State, (), Error> = Pipeline::new(vec![
        Stage::new("fail", |s: &mut State| {
            Box::pin(async move {
                s.rounds += 1;
                Err(Error::Model("failed".into()))
            })
        }),
        Stage::new("never", |_| {
            Box::pin(async { panic!("executed after error") })
        }),
    ])
    .unwrap();
    let mut state = State::default();
    assert!(pipeline.run(&mut state).await.is_err());
    assert_eq!(state.rounds, 1);
}

#[test]
fn ambiguous_or_empty_recipes_are_rejected() {
    type S = Stage<(), (), Error>;
    let stage = || S::new("same", |_| Box::pin(async { Ok(Flow::Finish(())) }));
    assert!(Pipeline::<(), (), Error>::new(vec![]).is_err());
    assert!(Pipeline::new(vec![stage(), stage()]).is_err());
}
