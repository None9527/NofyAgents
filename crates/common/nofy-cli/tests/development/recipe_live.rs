use super::{
    omni::{checked, run_session_with_input},
    *,
};
use nofy_agent_runtime::{RunOutcome, events::RunEvent};

#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
#[ignore = "requires a real local model"]
async fn omni_exercises_recipe_stages_at_real_runtime_boundaries() {
    let endpoint = std::env::var("NOFY_LIVE_MODEL_URL").unwrap();
    let model = std::env::var("NOFY_LIVE_MODEL").unwrap();
    let directory = tempfile::tempdir().unwrap();
    let kernel = host(directory.path()).await;
    let server = serve(kernel.router()).await;
    let sdk = engine(&server.url, ADMIN);
    let source: Source = serde_json::from_value(
        checked(&sdk, "project.template", json!({})).await.data["source"].clone(),
    )
    .unwrap();
    let configured=checked(&sdk,"agent.configure",json!({"agent":"main","target":{"kind":"source","source":source,"expected_digest":source.digest().unwrap()},
        "settings":{"connection":{"base_url":endpoint,"models":[model],"allow_insecure_http":true,"timeout_ms":120000},"model":model,
          "model_settings":{"stream":true,"max_output_tokens":64,"length_policy":"complete_partial"},"max_steps":12,"allowed_tools":["sdk_schema"]}})).await;
    let built = checked(
        &sdk,
        "agent.build",
        json!({"agent":"main","target":{"kind":"source","source":configured.data["source"]}}),
    )
    .await;
    let mut deployment: Value =
        serde_json::from_str(built.data["deployment_json"].as_str().unwrap()).unwrap();
    let r = |id: &str| json!({"id":format!("recipe-live-{id}"),"version":"1"});
    deployment["system"]["modules"].as_array_mut().unwrap().extend([
        json!({"reference":r("literal"),"factory":"stage.literal","config":{"data":{"observed":"BEFORE_MODEL"},"action":{"kind":"next"}}}),
        json!({"reference":r("repeat"),"factory":"stage.repeat","config":{}}),
        json!({"reference":r("length"),"factory":"stage.length","config":{"max_continues":2}}),
        json!({"reference":r("entry"),"factory":"runtime.recipe","config":{"stages":[
            {"name":"literal","at":"before_model","stage":"literal"},
            {"name":"repeat","at":"after_tool","stage":"repeat"},
            {"name":"length","at":"before_stop","stage":"length"}]},
            "dependencies":{"literal":r("literal"),"repeat":r("repeat"),"length":r("length")}}),
    ]);
    deployment["system"]["programs"]["main"]["definition"]["recipe"] = r("entry");
    let published = checked(
        &sdk,
        "system.publish",
        json!({"document_json":deployment.to_string()}),
    )
    .await;
    let release = published.refs["release"].as_deref().unwrap();
    let stop = tokio_util::sync::CancellationToken::new();
    let worker = tokio::spawn({
        let stop = stop.clone();
        let kernel = kernel.clone();
        async move { kernel.run_worker(stop, 2).await.unwrap() }
    });
    let run = "omni-recipe-live";
    let goal = "Use sdk_schema exactly once with operation module.template. After that tool returns, write a detailed 450-word technical guide that begins with BIRCH GUIDE. Use concrete sentences and keep writing the guide when the runtime asks you to continue.";
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
    let state = serde_json::to_value(state).unwrap();
    let progress = &state["recipe_progress"];
    assert_eq!(progress["data"]["literal"]["observed"], "BEFORE_MODEL");
    assert_eq!(progress["data"]["repeat"]["run_len"], 1);
    assert!(progress["data"]["length"].is_object());
    let events = kernel.store().events(run, 0, 500).await.unwrap();
    let lengths:Vec<_>=events.iter().filter_map(|entry|match &entry.event {
        RunEvent::ModelUsage{input_tokens,output_tokens,info} if info.stop_reason.as_deref()==Some("length") => Some(json!({"cursor":entry.cursor,"input_tokens":input_tokens,"output_tokens":output_tokens})),_=>None,
    }).collect();
    assert!(
        lengths.len() >= 2,
        "no continued sampling after provider length stop: {output:?}"
    );
    assert!(
        output.starts_with("BIRCH GUIDE") && output.len() > 400,
        "{output:?}"
    );
    let call = events
        .iter()
        .find_map(|entry| match &entry.event {
            RunEvent::ToolStarted { call } if call.name == "sdk_schema" => Some(call),
            _ => None,
        })
        .expect("live SDK schema call");
    assert!(events.iter().any(|entry|matches!(&entry.event,RunEvent::ToolCompleted{call_id,is_error:false,..} if call_id==&call.id)));
    if let Ok(path) = std::env::var("NOFY_LIVE_REPORT") {
        let report = json!({"model":model,"run":run,"release":release,"factories":["runtime.recipe","stage.literal","stage.repeat","stage.length"],
            "recipe_progress":progress,"real_length_stops":lengths,"tool_call":call,"output":output});
        std::fs::write(path, serde_json::to_vec_pretty(&report).unwrap()).unwrap();
    }
    stop.cancel();
    worker.await.unwrap();
}
