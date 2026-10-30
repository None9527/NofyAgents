use super::*;
use nofy_agent_runtime::workflow::{compile::*, graph::*};
pub(super) fn graph(setup: &Setup, human: bool, agent: bool) -> CompiledWorkflow {
    let mut nodes = vec![
        json!({"id":"effect","input":{"from":"literal","value":{}},"action":{"kind":"tool","runtime":r("tools"),"tool":"effect"}}),
    ];
    if human {
        nodes.push(json!({"id":"human","needs":["effect"],"input":{"from":"literal","value":{"question":"continue"}},"action":{"kind":"human","response_schema":{"type":"boolean"}}}));
    }
    if agent {
        nodes.push(json!({"id":"agent","needs":[if human {"human"}else{"effect"}],"input":{"from":"literal","value":"task"},"action":{"kind":"agent","agent":r("worker")}}));
    }
    let mut doc = json!({"entry":r("main"),"host":{"name":"workflow-root","scope_identity":"hashed_v1","governance":[r("budget")],"bindings":[r("clear")]},"tool_runtimes":[{"reference":r("tools"),"definition":{"name":"tools","tool_packs":[r("effects")]}}],"workflows":[{"reference":r("main"),"input_schema":true,"output_schema":true,"nodes":nodes,"output":{"from":"node","node":if agent {"agent"}else if human {"human"}else{"effect"}}}]});
    if agent {
        doc["agents"] = json!([{"reference":r("worker"),"definition":{"name":"worker","model":r("model"),"prompt":r("prompt"),"bindings":[r("clear")]}}]);
    }
    compile_workflow(serde_json::from_value(doc).unwrap(), &setup.registry).unwrap()
}
#[tokio::test]
async fn workflow_root_preserves_human_wait_tree_and_fact_stream_after_reopen() {
    let temp = tempfile::tempdir().unwrap();
    let path = temp.path().join("runtime.db");
    let store = SqliteStore::open(&path).unwrap();
    let setup = setup(&store, false, false, false, false);
    let graph = graph(&setup, true, true);
    let program = CompiledProgram::for_workflow(&graph, json!({})).unwrap();
    let supervisor = RunSupervisor::new(store.clone());
    assert!(matches!(
        supervisor
            .execute_program(&program, RunInput::default(), context())
            .await
            .unwrap(),
        RunOutcome::Paused { .. }
    ));
    assert_eq!(setup.effects.load(Ordering::SeqCst), 1);
    assert_eq!(setup.models.load(Ordering::SeqCst), 0);
    let lease = store
        .acquire(
            program.checkpoint_key("thread"),
            "human-decision",
            Duration::from_secs(30),
        )
        .await
        .unwrap();
    graph
        .respond(
            &store.guarded(&lease),
            HumanResponse {
                command_id: "continue".into(),
                thread_id: "thread".into(),
                run_id: "root".into(),
                workflow_identity: graph.identity().into(),
                reference: r("main"),
                node: "human".into(),
                expected_request: json!({"question":"continue"}),
                value: json!(true),
            },
        )
        .await
        .unwrap();
    store.release(&lease).await.unwrap();
    let restored = program.snapshot.restore(&setup.registry).unwrap();
    let reopened = SqliteStore::open(&path).unwrap();
    assert!(matches!(
        RunSupervisor::new(reopened)
            .execute_program(&restored, RunInput::resume(), context())
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(setup.effects.load(Ordering::SeqCst), 1);
    assert_eq!(setup.models.load(Ordering::SeqCst), 1);
    assert_eq!(totals(&store, &setup).await.active_children, 0);
    let tree = store.children("root").await.unwrap();
    assert!(
        tree.iter()
            .any(|c| c.kind.as_deref() == Some("workflow_human"))
    );
    assert!(tree.iter().any(|c| c.agent_name == "worker"));
    assert!(!store.events("root", 0, 1000).await.unwrap().is_empty());
}
#[tokio::test]
async fn root_workflow_child_model_retry_uses_original_graph_and_budget() {
    let temp = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
    let setup = setup(&store, false, false, true, false);
    let graph = graph(&setup, false, true);
    let program = CompiledProgram::for_workflow(&graph, json!({})).unwrap();
    let supervisor = RunSupervisor::new(store.clone());
    assert!(
        supervisor
            .execute_program(&program, RunInput::default(), context())
            .await
            .is_err()
    );
    let worker = store
        .children("root")
        .await
        .unwrap()
        .into_iter()
        .find(|c| c.agent_name == "worker")
        .unwrap();
    let command = ModelRetryCommand {
        command_id: "retry-worker".into(),
        ticket: supervisor
            .child_model_retry_ticket("root", &worker.run_id)
            .await
            .unwrap()
            .unwrap(),
    };
    assert!(matches!(
        supervisor
            .control_program(&program, RunControlCommand::RetryModel(command), context())
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(setup.models.load(Ordering::SeqCst), 2);
    assert_eq!(setup.effects.load(Ordering::SeqCst), 1);
    assert_eq!(totals(&store, &setup).await.active_children, 0);
}

#[test]
fn program_process_worker() {
    let Ok(directory) = std::env::var("NOFY_PROGRAM_RESTART_DIR") else {
        return;
    };
    let phase = std::env::var("NOFY_PROGRAM_RESTART_PHASE").unwrap();
    let directory = std::path::PathBuf::from(directory);
    tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
        .unwrap()
        .block_on(async {
            let store = SqliteStore::open(&directory.join("runtime.db")).unwrap();
            let setup = setup(&store, false, false, false, false);
            let graph = graph(&setup, true, false);
            let program = if phase == "start" {
                let program = CompiledProgram::for_workflow(&graph, json!({})).unwrap();
                std::fs::write(
                    directory.join("snapshot.json"),
                    serde_json::to_vec(&program.snapshot).unwrap(),
                )
                .unwrap();
                program
            } else {
                let snapshot: ExecutionSnapshot = serde_json::from_slice(
                    &std::fs::read(directory.join("snapshot.json")).unwrap(),
                )
                .unwrap();
                snapshot.restore(&setup.registry).unwrap()
            };
            let supervisor = RunSupervisor::new(store.clone());
            if phase == "start" {
                assert!(matches!(
                    supervisor
                        .execute_program(&program, RunInput::default(), context())
                        .await
                        .unwrap(),
                    RunOutcome::Paused { .. }
                ));
                assert_eq!(setup.effects.load(Ordering::SeqCst), 1);
                std::process::exit(97);
            }
            if phase == "resume" {
                let lease = store
                    .acquire(
                        program.checkpoint_key("thread"),
                        "decision",
                        Duration::from_secs(30),
                    )
                    .await
                    .unwrap();
                graph
                    .respond(
                        &store.guarded(&lease),
                        HumanResponse {
                            command_id: "continue".into(),
                            thread_id: "thread".into(),
                            run_id: "root".into(),
                            workflow_identity: graph.identity().into(),
                            reference: r("main"),
                            node: "human".into(),
                            expected_request: json!({"question":"continue"}),
                            value: json!(true),
                        },
                    )
                    .await
                    .unwrap();
                store.release(&lease).await.unwrap();
            }
            assert!(matches!(
                supervisor
                    .execute_program(&program, RunInput::resume(), context())
                    .await
                    .unwrap(),
                RunOutcome::Completed { .. }
            ));
            assert_eq!(setup.effects.load(Ordering::SeqCst), 0);
            assert_eq!(setup.models.load(Ordering::SeqCst), 0);
            assert_eq!(
                store
                    .execution_record("root")
                    .await
                    .unwrap()
                    .unwrap()
                    .status,
                "completed"
            );
            assert_eq!(totals(&store, &setup).await.active_children, 0);
        });
}

#[test]
fn frozen_workflow_root_survives_real_process_exit_and_only_finishes_remaining_work() {
    let temp = tempfile::tempdir().unwrap();
    for phase in ["start", "resume", "cached"] {
        let result = std::process::Command::new(std::env::current_exe().unwrap())
            .args(["--exact", "graphs::program_process_worker", "--nocapture"])
            .env("NOFY_PROGRAM_RESTART_DIR", temp.path())
            .env("NOFY_PROGRAM_RESTART_PHASE", phase)
            .output()
            .unwrap();
        assert_eq!(
            result.status.code(),
            Some(if phase == "start" { 97 } else { 0 }),
            "{phase}: {} {}",
            String::from_utf8_lossy(&result.stdout),
            String::from_utf8_lossy(&result.stderr)
        );
    }
    assert_eq!(
        std::fs::read_to_string(temp.path().join("runtime.effects")).unwrap(),
        "effect\n"
    );
}
