use super::{
    omni::{checked, run_session_with_input},
    *,
};
use nofy_agent_runtime::{
    Error, Message, RunContext, RunOutcome, RunState,
    events::RunEvent,
    recipe::StageSource,
    registry::{InstanceFactory, ModuleInstance},
};

struct RunTaskObservation;

#[async_trait::async_trait]
impl StageSource for RunTaskObservation {
    fn identity(&self) -> &str {
        "live-todo-task-observation/v1"
    }

    async fn snapshot(&self, state: &RunState, _: &RunContext) -> Result<Value, Error> {
        Ok(state
            .messages
            .iter()
            .rev()
            .find_map(|message| match message {
                Message::Tool {
                    content,
                    is_error: false,
                    ..
                } if content["tool_id"] == "live_todo" => content.get("value").cloned(),
                _ => None,
            })
            .unwrap_or_else(|| json!({})))
    }
}

#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
#[ignore = "requires a real local model"]
async fn omni_finishes_a_real_todo_after_the_runtime_nudge() {
    let endpoint = std::env::var("NOFY_LIVE_MODEL_URL").unwrap();
    let model = std::env::var("NOFY_LIVE_MODEL").unwrap();
    let directory = tempfile::tempdir().unwrap();
    let credentials = Arc::new(
        EnvironmentCredentials::new("development-test", "NOFY_DEVELOPMENT_TEST_SECRET_").unwrap(),
    );
    let mut registry = native::registry(credentials).unwrap();
    registry
        .register_factory(Arc::new(InstanceFactory::new(
            "stage_source.live_todo",
            "1",
            ModuleInstance::StageSource(Arc::new(RunTaskObservation)),
        )))
        .unwrap();
    let auth = Authorizer::new(vec![(
        ADMIN.into(),
        [
            Scope::Read,
            Scope::Edit,
            Scope::Publish,
            Scope::Execute,
            Scope::Resources,
        ]
        .into(),
    )])
    .unwrap();
    let binary = std::env::current_exe()
        .unwrap()
        .parent()
        .unwrap()
        .parent()
        .unwrap()
        .join(format!("nofy-agent-host{}", std::env::consts::EXE_SUFFIX));
    let kernel = KernelHost::open(&directory.path().join("state"), registry, auth)
        .await
        .unwrap()
        .with_templates(&presets())
        .unwrap()
        .with_loader_helper(&binary)
        .unwrap();
    let service = serve(kernel.router()).await;
    let sdk = engine(&service.url, ADMIN);
    let source: Source = serde_json::from_value(
        checked(&sdk, "project.template", json!({})).await.data["source"].clone(),
    )
    .unwrap();
    let configured=checked(&sdk,"agent.configure",json!({"agent":"main","target":{"kind":"source","source":source,"expected_digest":source.digest().unwrap()},
        "settings":{"connection":{"base_url":endpoint,"models":[model],"allow_insecure_http":true,"timeout_ms":120000},"model":model,
            "model_settings":{"stream":true,"max_output_tokens":256},"max_steps":8,"allowed_tools":["live_todo"]}})).await;
    let built = checked(
        &sdk,
        "agent.build",
        json!({"agent":"main","target":{"kind":"source","source":configured.data["source"]}}),
    )
    .await;
    let mut deployment: Value =
        serde_json::from_str(built.data["deployment_json"].as_str().unwrap()).unwrap();
    let r = |id: &str| json!({"id":format!("live-todo-{id}"),"version":"1"});
    deployment["system"]["modules"].as_array_mut().unwrap().extend([
        json!({"reference":r("tool"),"factory":"tool.rhai","config":{"contract":{"name":"live_todo","description":"Record the requested state of a fixture task.",
            "effect":"read_only","input_schema":{"type":"object","additionalProperties":false,"required":["task","operation"],
                "properties":{"task":{"type":"string"},"operation":{"enum":["add","complete"]}}}},
            "source":"#{pending: if args.operation == \"add\" {[args.task]} else {[]}, in_progress: [], backing_tasks: 0, goal_active: false}"}}),
        json!({"reference":r("source"),"factory":"stage_source.live_todo","config":{}}),
        json!({"reference":r("stage"),"factory":"stage.todo","config":{"max_fires":2,"plan_tool":"live_todo"}}),
        json!({"reference":r("recipe"),"factory":"runtime.recipe","config":{"stages":[{"name":"todo","at":"before_stop","stage":"todo","source":"task-state"}]},
            "dependencies":{"todo":r("stage"),"task-state":r("source")}}),
    ]);
    let main = &mut deployment["system"]["programs"]["main"]["definition"];
    main["tool_packs"].as_array_mut().unwrap().push(r("tool"));
    main["recipe"] = r("recipe");
    let published = checked(
        &sdk,
        "system.publish",
        json!({"document_json":deployment.to_string()}),
    )
    .await;
    let release = published.refs["release"].as_deref().unwrap();
    let stop = tokio_util::sync::CancellationToken::new();
    let worker = tokio::spawn({
        let kernel = kernel.clone();
        let stop = stop.clone();
        async move { kernel.run_worker(stop, 2).await.unwrap() }
    });
    let run = "omni-todo-stage-live";
    let goal = "Test a tracked task. Use live_todo to add a pending task named verify-fir and then submit the provisional reply PROVISIONAL. After the runtime sends a pending-task reminder, complete that same task with live_todo, then output exactly VERIFIED.";
    run_session_with_input(&sdk, "omni", release, run, goal).await;
    let Some(RunOutcome::Completed { output, state }) = kernel
        .store()
        .execution_record(run)
        .await
        .unwrap()
        .unwrap()
        .outcome
    else {
        unreachable!()
    };
    assert_eq!(output.trim(), "VERIFIED");
    let state = serde_json::to_value(state).unwrap();
    assert_eq!(state["recipe_progress"]["data"]["todo"]["fires"], 1);
    let events = kernel.store().events(run, 0, 300).await.unwrap();
    let calls: Vec<_> = events
        .iter()
        .filter_map(|entry| match &entry.event {
            RunEvent::ToolStarted { call } if call.name == "live_todo" => {
                Some((entry.cursor, call))
            }
            _ => None,
        })
        .collect();
    assert_eq!(calls.len(), 2);
    for ((_, call), operation) in calls.iter().zip(["add", "complete"]) {
        assert_eq!(
            call.arguments,
            json!({"operation":operation,"task":"verify-fir"})
        );
        assert!(events.iter().any(|entry|matches!(&entry.event,RunEvent::ToolCompleted{call_id,is_error:false,..} if call_id==&call.id)));
    }
    let model_outputs: Vec<_> = events
        .iter()
        .filter_map(|entry| match &entry.event {
            RunEvent::ModelCompleted { output } if !output.is_empty() => {
                Some((entry.cursor, output))
            }
            _ => None,
        })
        .collect();
    assert!(
        model_outputs
            .iter()
            .any(|(cursor, answer)| *cursor > calls[0].0
                && *cursor < calls[1].0
                && answer.contains("PROVISIONAL")),
        "{model_outputs:?}"
    );
    if let Ok(path) = std::env::var("NOFY_LIVE_REPORT") {
        let report = json!({"model":model,"factories":["stage.todo"],"run":run,"release":release,"source":"isolated receipt-backed StageSource",
            "stage_progress":state["recipe_progress"],"calls":calls,"model_outputs":model_outputs,"output":output});
        std::fs::write(path, serde_json::to_vec_pretty(&report).unwrap()).unwrap();
    }
    stop.cancel();
    worker.await.unwrap();
}
