use super::{omni::checked, *};
use nofy_agent_runtime::{RunOutcome, events::RunEvent};

#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
#[ignore = "requires a real local model"]
async fn omni_returns_a_model_backed_owned_event_hook_receipt() {
    let endpoint = std::env::var("NOFY_LIVE_MODEL_URL").unwrap();
    let model = std::env::var("NOFY_LIVE_MODEL").unwrap();
    let state = tempfile::tempdir().unwrap();
    let kernel = host(state.path()).await;
    let service = serve(kernel.router()).await;
    let sdk = engine(&service.url, ADMIN);
    let source: Source = serde_json::from_value(
        checked(&sdk, "project.template", json!({})).await.data["source"].clone(),
    )
    .unwrap();
    let configured=checked(&sdk,"agent.configure",json!({"agent":"main","target":{"kind":"source","source":source,"expected_digest":source.digest().unwrap()},
        "settings":{"connection":{"base_url":endpoint,"models":[model],"allow_insecure_http":true,"timeout_ms":120000},"model":model,
          "model_settings":{"stream":true,"max_output_tokens":64},"allowed_tools":["hook_workflow","workflow_execute","workflow_agent"]}})).await;
    let built = checked(
        &sdk,
        "agent.build",
        json!({"agent":"main","target":{"kind":"source","source":configured.data["source"]}}),
    )
    .await;
    let mut deployment: Value =
        serde_json::from_str(built.data["deployment_json"].as_str().unwrap()).unwrap();
    let model_ref = deployment["system"]["programs"]["main"]["definition"]["model"].clone();
    let prompt = deployment["system"]["programs"]["main"]["definition"]["prompt"].clone();
    let r = |id: &str| json!({"id":format!("event-live-{id}"),"version":"1"});
    let event = "fixture.received";
    let payload = json!({"type":"object","additionalProperties":false,"required":["request","receipt"],"properties":{"request":{"type":"string"},"receipt":{"type":"string"}}});
    let graph = json!({"entry":r("graph"),"host":{"name":"event-workflow-live"},"agents":[{"reference":r("agent"),"definition":{
        "name":"event-omni","model":model_ref,"prompt":prompt,"settings":{"max_steps":2,"model":{"stream":true,"max_output_tokens":64}}}}],
        "workflows":[{"reference":r("graph"),"input_schema":{"type":"object"},"output_schema":{"type":"object"},"parallelism":1,
          "nodes":[{"id":"review","input":{"from":"input","pointer":"/payload/request"},"action":{"kind":"agent","agent":r("agent")}}],
          "output":{"from":"object","fields":{"decision":{"from":"literal","value":"patch"},"payload":{"from":"object","fields":{
            "request":{"from":"input","pointer":"/payload/request"},"receipt":{"from":"node","node":"review","pointer":"/output"}}}}}}]});
    deployment["system"]["modules"].as_array_mut().unwrap().extend([
        json!({"reference":r("producer"),"factory":"event.producer","config":{"events":[{"name":event,"payload_schema":payload,"patch":true}]}}),
        json!({"reference":r("workflow"),"factory":"resource.workflow","config":{"bindings":{"model":"model","prompt":"prompt"},"document":graph},
            "dependencies":{"model":model_ref,"prompt":prompt}}),
        json!({"reference":r("handler"),"factory":"hook.workflow_connected","config":{},"dependencies":{"workflow":r("workflow")}}),
        json!({"reference":r("subscription"),"factory":"hook.owned_subscription","config":{"event":event,"timeout_ms":60000},
            "dependencies":{"producer":r("producer"),"handler":r("handler")}}),
    ]);
    let goal = "Return exactly EVENT-3879 and nothing else.";
    deployment["system"]["programs"]["received"] = json!({"kind":"event","definition":{"schema_version":1,"host":{"name":"event-live","hooks":[r("subscription")]},
        "producer":r("producer"),"event":event,"operation":"received-review","payload":{"request":goal,"receipt":"pending"}}});
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
        async move { kernel.run_worker(stop, 4).await.unwrap() }
    });
    let run = "omni-owned-event-live";
    let request = json!({"run_id":run,"thread_id":run,"system":"omni","release":release,"program":"received"});
    checked(
        &sdk,
        "run.start",
        json!({"request_json":request.to_string()}),
    )
    .await;
    let output = tokio::time::timeout(Duration::from_secs(80), async {
        loop {
            if let Some(record) = kernel.store().execution_record(run).await.unwrap() {
                if let Some(RunOutcome::Completed { output, .. }) = record.outcome {
                    break output;
                }
                assert_eq!(record.status, "running", "{:?}", record.error);
            }
            tokio::time::sleep(Duration::from_millis(80)).await;
        }
    })
    .await
    .expect("owned event real model deadline");
    let output: Value = serde_json::from_str(&output).unwrap();
    let tree = checked(&sdk, "work.list", json!({"run_id":run,"limit":1})).await;
    assert_eq!(tree.data["root"]["work_id"], run);
    let mut items = tree.data["items"].as_array().unwrap().clone();
    let mut after = tree.next_cursor;
    while let Some(cursor) = after {
        let page = checked(
            &sdk,
            "work.list",
            json!({"run_id":run,"limit":1,"after":cursor}),
        )
        .await;
        items.extend(page.data["items"].as_array().unwrap().iter().cloned());
        after = page.next_cursor;
    }
    let node = items
        .iter()
        .find(|item| item["node_id"] == "review" && item["kind"] == "workflow_agent")
        .expect("projected workflow node");
    let projection = checked(
        &sdk,
        "work.inspect",
        json!({"run_id":run,"work_id":node["work_id"]}),
    )
    .await;
    assert_eq!(&projection.data, node);
    let foreign = sdk
        .execute(
            "work.inspect",
            json!({"run_id":"foreign-root","work_id":node["work_id"]}),
        )
        .await;
    assert_eq!(foreign.error.unwrap()["code"], "not_found");
    assert_eq!(
        output["payload"]["receipt"].as_str().unwrap().trim(),
        "EVENT-3879"
    );
    let events = kernel.store().events(run, 0, 400).await.unwrap();
    let hook=events.iter().find(|e|matches!(&e.event,RunEvent::Hook{event_name,status,..} if event_name==event && status=="completed")).expect("owned hook dispatch receipt");
    let node = events
        .iter()
        .find(|e| matches!(&e.event,RunEvent::Workflow{node_id:Some(id),..} if id=="review"))
        .expect("workflow review node");
    let sampling=events.iter().find(|e|matches!(&e.event,RunEvent::ModelUsage{input_tokens,output_tokens,..} if *input_tokens>0 && *output_tokens>0)).expect("real workflow agent sampling");
    if let Ok(path) = std::env::var("NOFY_LIVE_REPORT") {
        let report = json!({"model":model,"factories":["event.producer","hook.owned_subscription","hook.workflow_connected"],"run":run,"release":release,
            "output":output,"hook":hook,"workflow_node":node,"model_usage":sampling});
        std::fs::write(path, serde_json::to_vec_pretty(&report).unwrap()).unwrap();
    }
    stop.cancel();
    worker.await.unwrap();
    drop(service);
    drop(kernel);
    let reopened = host(state.path()).await;
    let node = reopened
        .store()
        .work_inspect(run, projection.data["work_id"].as_str().unwrap())
        .await
        .unwrap()
        .unwrap();
    assert_eq!(serde_json::to_value(node).unwrap(), projection.data);
}
