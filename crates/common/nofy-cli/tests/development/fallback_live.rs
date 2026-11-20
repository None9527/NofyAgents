use super::{omni::checked, *};
use nofy_agent_runtime::{RunOutcome, events::RunEvent};

const IMAGE: &str = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+cL7sAAAAASUVORK5CYII=";

#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
#[ignore = "requires a real local text-only NInfer model"]
async fn omni_recovers_from_real_image_rejection_and_a_context_limit() {
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
    let traffic = Arc::new(std::sync::Mutex::new(Vec::<Value>::new()));
    let gateway=serve(axum::Router::new().route("/v1/chat/completions",axum::routing::post({let endpoint=endpoint.clone();let traffic=traffic.clone();move |axum::Json(body):axum::Json<Value>| {
        let endpoint=endpoint.clone();let traffic=traffic.clone();async move {
            use axum::response::IntoResponse;
            let messages=serde_json::to_string(&body["messages"]).unwrap();
            if messages.len()>12_000 {
                traffic.lock().unwrap().push(json!({"status":413,"message_bytes":messages.len(),"old":messages.contains("OLD-FIR-9142"),"recent":messages.contains("VIOLET-2187")}));
                return (axum::http::StatusCode::PAYLOAD_TOO_LARGE,axum::Json(json!({"error":{"type":"invalid_request_error","code":"gateway_context_limit","message":"Isolated context gateway exceeded 12,000 bytes of messages"}}))).into_response();
            }
            let response=reqwest::Client::new().post(format!("{}chat/completions",endpoint)).json(&body).send().await.unwrap();
            traffic.lock().unwrap().push(json!({"status":response.status().as_u16(),"message_bytes":messages.len(),"old":messages.contains("OLD-FIR-9142"),"recent":messages.contains("VIOLET-2187")}));
            let status=response.status();
            let content_type=response.headers().get("content-type").cloned();
            let mut output=axum::response::Response::new(axum::body::Body::from_stream(response.bytes_stream()));
            *output.status_mut()=status;
            if let Some(content_type)=content_type { output.headers_mut().insert("content-type",content_type); }
            output
        }
    }}))).await;
    let stop = tokio_util::sync::CancellationToken::new();
    let worker = tokio::spawn({
        let stop = stop.clone();
        let kernel = kernel.clone();
        async move { kernel.run_worker(stop, 2).await.unwrap() }
    });
    let mut cases = Vec::new();
    for image in [true, false] {
        let (id, factory, key, base_url, configuration) = if image {
            (
                "omni-image-fallback",
                "model.image_fallback",
                "_image_fallback",
                endpoint.clone(),
                json!({"statuses":[400],"codes":["vision_disabled"]}),
            )
        } else {
            (
                "omni-context-fallback",
                "model.context_fallback",
                "_context_fallback",
                format!("{}/v1/", gateway.url),
                json!({"keep_turns":1}),
            )
        };
        let configured=checked(&sdk,"agent.configure",json!({"agent":"main","target":{"kind":"source","source":source,"expected_digest":source.digest().unwrap()},
          "settings":{"connection":{"base_url":base_url,"models":[model],"allow_insecure_http":true,"timeout_ms":120000},"model":model,
            "model_settings":{"stream":true,"max_output_tokens":64},"allowed_tools":["unused_fallback_tool"]}})).await;
        let built = checked(
            &sdk,
            "agent.build",
            json!({"agent":"main","target":{"kind":"source","source":configured.data["source"]}}),
        )
        .await;
        let mut deployment: Value =
            serde_json::from_str(built.data["deployment_json"].as_str().unwrap()).unwrap();
        let reference = json!({"id":"live-model-fallback","version":"1"});
        let prior = deployment["system"]["programs"]["main"]["definition"]["model"].clone();
        deployment["system"]["modules"].as_array_mut().unwrap().push(json!({"reference":reference,"factory":factory,"config":configuration,"dependencies":{"model":prior}}));
        deployment["system"]["programs"]["main"]["definition"]["model"] = reference;
        let published = checked(
            &sdk,
            "system.publish",
            json!({"document_json":deployment.to_string()}),
        )
        .await;
        let release = published.refs["release"].as_deref().unwrap();
        let filler = " cedar".repeat(1050);
        let (text, attachments) = if image {
            (
                "Ignore the attachment and return exactly VIOLET-2187.".into(),
                json!([{"type":"image","url":IMAGE}]),
            )
        } else {
            (
                format!(
                    "The old marker is OLD-FIR-9142. Ignore the following filler and reply OK. {filler}"
                ),
                json!([]),
            )
        };
        let request = json!({"system":"omni","release":release,"program":"main","run_id":id,"thread_id":id,"input":{"text":text,"attachments":attachments}});
        let started=checked(&sdk,"session.start",json!({"session_id":id,"command_id":id,"expected_session_revision":null,"request_json":request.to_string()})).await;
        let mut record = completed(&kernel, id).await;
        let mut run = id;
        if !image {
            run = "omni-context-fallback-next";
            let text = format!(
                "The current marker is VIOLET-2187. Ignore the following filler and return exactly the current marker. {filler}"
            );
            let command = json!({"command_id":run,"source_run_id":id,"expected_source_revision":0,"turn":{"kind":"new","run_id":run,"input":{"text":text,"attachments":[]}}});
            checked(&sdk,"session.turn",json!({"session_id":id,"expected_session_revision":started.data["session_revision"],"request_json":command.to_string()})).await;
            record = completed(&kernel, run).await;
        }
        let Some(RunOutcome::Completed { output, state }) = record.outcome else {
            unreachable!()
        };
        assert_eq!(output.trim(), "VIOLET-2187");
        let messages = serde_json::to_string(&state.messages).unwrap();
        assert!(messages.contains(if image { IMAGE } else { "OLD-FIR-9142" }));
        let events = kernel.store().events(run, 0, 200).await.unwrap();
        let (cursor, metadata) = events
            .iter()
            .find_map(|entry| match &entry.event {
                RunEvent::ModelUsage { info, .. } => {
                    info.provider.get(key).map(|meta| (entry.cursor, meta))
                }
                _ => None,
            })
            .expect("live fallback model metadata");
        assert_eq!(metadata["calls"], 2);
        assert!(
            metadata[if image {
                "removed_images"
            } else {
                "removed_messages"
            }]
            .as_u64()
            .unwrap()
                > 0
        );
        cases.push(json!({"factory":factory,"run":run,"release":release,"output":output,"source_checkpoint_preserved":true,"model_usage_cursor":cursor,"metadata":metadata}));
    }
    let traffic = traffic.lock().unwrap().clone();
    assert_eq!(traffic.len(), 3, "{traffic:?}");
    assert_eq!(traffic[1]["status"], 413);
    assert_eq!(traffic[2]["status"], 200);
    assert_eq!(traffic[2]["recent"], true);
    assert_eq!(traffic[2]["old"], false);
    if let Ok(path) = std::env::var("NOFY_LIVE_REPORT") {
        let report = json!({"model":model,"factories":["model.image_fallback","model.context_fallback"],"cases":cases,"context_gateway":traffic});
        std::fs::write(path, serde_json::to_vec_pretty(&report).unwrap()).unwrap();
    }
    stop.cancel();
    worker.await.unwrap();
}

async fn completed(
    kernel: &KernelHost,
    id: &str,
) -> nofy_agent_runtime::supervisor::ExecutionRecord {
    tokio::time::timeout(Duration::from_secs(80), async {
        loop {
            if let Some(record) = kernel.store().execution_record(id).await.unwrap() {
                if matches!(record.outcome, Some(RunOutcome::Completed { .. })) {
                    return record;
                }
                assert_eq!(record.status, "running", "{id}: {:?}", record.error);
            }
            tokio::time::sleep(Duration::from_millis(80)).await;
        }
    })
    .await
    .expect("model fallback deadline")
}
