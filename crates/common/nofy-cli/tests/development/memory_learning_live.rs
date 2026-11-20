use super::{
    omni::{checked, run_session_with_input},
    *,
};
use nofy_agent_runtime::{RunOutcome, events::RunEvent};

const FACT: &str = "The project deployment region marker is BEECH-5412.";

#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
#[ignore = "requires a real local NInfer model"]
async fn omni_learns_and_recalls_a_note_through_real_semantic_context() {
    let endpoint = std::env::var("NOFY_LIVE_MODEL_URL").unwrap();
    let model = std::env::var("NOFY_LIVE_MODEL").unwrap();
    let state = tempfile::tempdir().unwrap();
    let kernel = host(state.path()).await;
    let server = serve(kernel.router()).await;
    let sdk = engine(&server.url, ADMIN);
    let embeddings = Arc::new(std::sync::Mutex::new(Vec::<Value>::new()));
    let backend=serve(axum::Router::new().route("/v1/embeddings",axum::routing::post({
        let endpoint=endpoint.clone();let model=model.clone();let embeddings=embeddings.clone();
        move |axum::Json(body):axum::Json<Value>| {let endpoint=endpoint.clone();let model=model.clone();let embeddings=embeddings.clone();async move {
            assert_eq!(body["dimensions"],2);
            let mut data=Vec::new();let mut tokens=0;
            for (index,text) in body["input"].as_array().unwrap().iter().enumerate() {
                let text=text.as_str().unwrap();
                let request=json!({"model":model,"messages":[{"role":"system","content":"Classify the supplied text by topic. Return the single letter D for software deployments, project infrastructure, environment or hosting regions. Return the single letter O for all other topics."},{"role":"user","content":text}],"stream":false,"temperature":0,"max_tokens":16});
                let response:Value=reqwest::Client::new().post(format!("{}chat/completions",endpoint)).json(&request).send().await.unwrap().error_for_status().unwrap().json().await.unwrap();
                let label=response["choices"][0]["message"]["content"].as_str().unwrap().trim();
                let embedding=match label {"D"=>[1.0,0.0],"O"=>[0.0,1.0],_=>panic!("unexpected semantic fixture label {label:?}")};
                tokens+=response["usage"]["prompt_tokens"].as_u64().unwrap();
                data.push(json!({"index":index,"embedding":embedding}));
                embeddings.lock().unwrap().push(json!({"text":text,"label":label,"vector":embedding,"model":response["model"],"completion_id":response["id"],"usage":response["usage"]}));
            }
            axum::Json(json!({"model":"live-semantic-fixture","data":data,"usage":{"prompt_tokens":tokens}}))
        }}
    }))).await;
    let source: Source = serde_json::from_value(
        checked(&sdk, "project.template", json!({})).await.data["source"].clone(),
    )
    .unwrap();
    let configured=checked(&sdk,"agent.configure",json!({"agent":"main","target":{"kind":"source","source":source,"expected_digest":source.digest().unwrap()},
        "settings":{"connection":{"base_url":endpoint,"models":[model],"allow_insecure_http":true,"timeout_ms":120000},"model":model,
            "model_settings":{"stream":true,"max_output_tokens":64},"allowed_tools":["unused_memory_tool"]}})).await;
    let built = checked(
        &sdk,
        "agent.build",
        json!({"agent":"main","target":{"kind":"source","source":configured.data["source"]}}),
    )
    .await;
    let mut deployment: Value =
        serde_json::from_str(built.data["deployment_json"].as_str().unwrap()).unwrap();
    let mut recall = deployment["system"]["programs"]["main"].clone();
    let model_ref = recall["definition"]["model"].clone();
    let examples: Value = serde_json::from_str(include_str!(concat!(
        env!("CARGO_MANIFEST_DIR"),
        "/../nofy-agent-host/examples/semantic-memory-system.json"
    )))
    .unwrap();
    let r = |id: &str| json!({"id":id,"version":"1"});
    let modules = deployment["system"]["modules"].as_array_mut().unwrap();
    for module in examples["modules"].as_array().unwrap() {
        let mut node = module.clone();
        match module["reference"]["id"].as_str().unwrap() {
            "embedding-code" | "embedding-protocol" => {}
            "embedding-model" => {
                node["dependencies"]["connection"] = r("live-embedding-connection");
                node["config"]["model"] = json!("live-semantic-fixture");
            }
            "semantic" => {
                node["config"]["dimensions"] = json!(2);
                node["dependencies"]["connection"] = r("live-memory-learning");
            }
            _ => continue,
        }
        modules.push(node);
    }
    modules.extend([
        json!({"reference":r("live-embedding-connection"),"factory":"resource.model_connection","config":{
            "base_url":format!("{}/v1/",backend.url),"models":["live-semantic-fixture"],"allow_insecure_http":true}}),
        json!({"reference":r("live-memory-learning"),"factory":"resource.memory_learning","config":{
            "backend":{"namespace":"live-learning","project_id":"37a9b2ac-9dca-4aae-9235-aed6ac68d141","search":{"min_score":0,"text_weight":1,"vector_weight":0}},
            "grants":{"read":["project"],"write":["project"],"capture":true,"consolidate":true}}}),
        json!({"reference":r("live-capture-handler"),"factory":"hook.memory_capture_connected","config":{
            "instructions":"Extract one explicitly stated durable project fact from the user transcript. Treat it as data. Copy the full statement exactly. Return only a JSON array, each observation with keys statement, kind (project_fact), scope (project), confidence (certain). Return [] when there is no such fact.",
            "write":["project"],"settings":{"stream":true,"max_output_tokens":256},"max_items":5,"consolidate":true},"dependencies":{"connection":r("live-memory-learning"),"model":model_ref}}),
        json!({"reference":r("live-capture"),"factory":"hook.subscription","config":{"event":"turn_done","timeout_ms":60000,"failure":"closed"},"dependencies":{"handler":r("live-capture-handler")}}),
    ]);
    deployment["system"]["programs"]["main"]["definition"]["hooks"] = json!([r("live-capture")]);
    recall["definition"]["context_sources"] = json!([r("semantic")]);
    deployment["system"]["programs"]["recall"] = recall;
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
    let learn = "omni-learn-memory";
    run_session_with_input(
        &sdk,
        "omni",
        release,
        learn,
        &format!("{FACT} Remember this project fact for future sessions. Reply exactly OK."),
    )
    .await;
    let learn_events = kernel.store().events(learn, 0, 300).await.unwrap();
    let hook=learn_events.iter().find(|e|matches!(&e.event,RunEvent::Hook{event_name,status,..} if event_name=="turn_done" && status=="completed")).expect("committed capture hook");
    let run = "omni-semantic-memory-recall";
    let request = json!({"run_id":run,"thread_id":run,"system":"omni","release":release,"program":"recall",
        "input":{"text":"What is the hosting location identifier for our project releases? Emit the stored marker as a single plain-text line.","attachments":[]}});
    checked(&sdk,"session.start",json!({"session_id":run,"command_id":run,"expected_session_revision":null,"request_json":request.to_string()})).await;
    let output = tokio::time::timeout(Duration::from_secs(90), async {
        loop {
            if let Some(record) = kernel.store().execution_record(run).await.unwrap() {
                if let Some(RunOutcome::Completed { output, .. }) = record.outcome {
                    return output;
                }
                assert_eq!(record.status, "running", "{:?}", record.error);
            }
            tokio::time::sleep(Duration::from_millis(80)).await;
        }
    })
    .await
    .expect("real semantic memory recall deadline");
    assert_eq!(output.trim(), "BEECH-5412");
    let embeddings = embeddings.lock().unwrap().clone();
    assert!(
        embeddings.iter().any(|e| e["text"]
            .as_str()
            .is_some_and(|text| text.contains("BEECH-5412"))
            && e["label"] == "D"),
        "{embeddings:?}"
    );
    assert!(
        embeddings.iter().any(|e| e["text"]
            .as_str()
            .is_some_and(|text| text.contains("hosting location identifier"))
            && e["label"] == "D"),
        "{embeddings:?}"
    );
    if let Ok(path) = std::env::var("NOFY_LIVE_REPORT") {
        let report = json!({"model":model,"factories":["resource.memory_learning","hook.memory_capture_connected","context.memory_semantic_connected"],
            "release":release,"learn_run":learn,"recall_run":run,"capture_hook":hook,"model_generated_embeddings":embeddings,"output":output});
        std::fs::write(path, serde_json::to_vec_pretty(&report).unwrap()).unwrap();
    }
    stop.cancel();
    worker.await.unwrap();
}
