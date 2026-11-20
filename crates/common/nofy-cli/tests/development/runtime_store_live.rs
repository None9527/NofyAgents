use super::{omni::checked, *};
use nofy_agent_runtime::{RunOutcome, events::RunEvent};

#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
#[ignore = "requires a real local model"]
async fn omni_recalls_an_early_fact_after_runtime_store_migration() {
    let endpoint = std::env::var("NOFY_LIVE_MODEL_URL").unwrap();
    let model = std::env::var("NOFY_LIVE_MODEL").unwrap();
    let directory = tempfile::tempdir().unwrap();
    let kernel = host(&directory.path().join("host")).await;
    let target = directory.path().join("external");
    let service = serve(kernel.router()).await;
    let sdk = engine(&service.url, ADMIN);
    let source: Source = serde_json::from_value(
        checked(&sdk, "project.template", json!({})).await.data["source"].clone(),
    )
    .unwrap();
    let configured=checked(&sdk,"agent.configure",json!({"agent":"main","target":{"kind":"source","source":source,"expected_digest":source.digest().unwrap()},
        "settings":{"connection":{"base_url":endpoint,"models":[model],"allow_insecure_http":true,"timeout_ms":120000},"model":model,
          "model_settings":{"stream":true,"max_output_tokens":64},"allowed_tools":["unused_migration_tool"]}})).await;
    let built = checked(
        &sdk,
        "agent.build",
        json!({"agent":"main","target":{"kind":"source","source":configured.data["source"]}}),
    )
    .await;
    let mut deployment: Value =
        serde_json::from_str(built.data["deployment_json"].as_str().unwrap()).unwrap();
    let reference = json!({"id":"live-external-history","version":"1"});
    deployment["system"]["modules"]
        .as_array_mut()
        .unwrap()
        .push(
            json!({"reference":reference,"factory":"resource.runtime_store",
        "config":{"backend":{"id":"external-live","directory":target}}}),
        );
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
    let id = "omni-runtime-store-root";
    let request = json!({"system":"omni","release":release,"program":"main","run_id":id,"thread_id":id,
        "input":{"text":"The project inventory marker is WALNUT-3071. Remember it for this session. Reply exactly OK.","attachments":[]}});
    let started=checked(&sdk,"session.start",json!({"session_id":id,"command_id":id,"expected_session_revision":null,"request_json":request.to_string()})).await;
    assert_eq!(completed(&kernel, id).await.trim(), "OK");
    let origin = kernel.store().path().unwrap();
    let identity = kernel.store().logical_identity().to_owned();
    let selection = json!({"scope":"instance-runtime","target":{"system":"omni","release":release,"module":reference}});
    let client = reqwest::Client::new();
    let post = |path: &'static str, payload: Value| {
        let request = client
            .post(format!("{}/api/v1/runtime/storage/{path}", service.url))
            .bearer_auth(ADMIN)
            .json(&payload);
        async move {
            tokio::time::timeout(Duration::from_secs(15), async {
                loop {
                    let response = request.try_clone().unwrap().send().await.unwrap();
                    let status = response.status();
                    let receipt: Value = response.json().await.unwrap();
                    if status.is_success() {
                        break receipt;
                    }
                    assert_eq!(
                        receipt["error"]["code"], "busy",
                        "{path} {status}: {receipt}"
                    );
                    tokio::time::sleep(Duration::from_millis(40)).await;
                }
            })
            .await
            .expect("quiescent runtime-store transfer")
        }
    };
    let plan = post("plan", selection.clone()).await;
    let mut prepare = selection;
    prepare["command_id"] = json!("live-history-migrate");
    prepare["fingerprint"] = plan["fingerprint"].clone();
    let preparation = post("prepare", prepare).await;
    assert_eq!(preparation["phase"], "prepared");
    let transfer = post(
        "apply",
        json!({"command_id":"live-history-migrate","fingerprint":plan["fingerprint"]}),
    )
    .await;
    assert_eq!(transfer["phase"], "completed");
    let migrated = kernel.store().path().unwrap();
    assert_ne!(migrated, origin);
    assert!(migrated.starts_with(&target) && migrated.is_file());
    assert_eq!(kernel.store().logical_identity(), identity);
    let next = "omni-runtime-store-next";
    let command = json!({"command_id":next,"source_run_id":id,"expected_source_revision":0,"turn":{"kind":"new","run_id":next,
        "input":{"text":"Return only the project inventory marker from the earlier turn.","attachments":[]}}});
    checked(&sdk,"session.turn",json!({"session_id":id,"expected_session_revision":started.data["session_revision"],"request_json":command.to_string()})).await;
    let answer = completed(&kernel, next).await;
    assert_eq!(answer.trim(), "WALNUT-3071");
    let model_receipt=kernel.store().events(next,0,100).await.unwrap().into_iter().find(|entry|matches!(&entry.event,RunEvent::ModelUsage{input_tokens,output_tokens,..} if *input_tokens>0&&*output_tokens>0)).unwrap();
    if let Ok(path) = std::env::var("NOFY_LIVE_REPORT") {
        let report = json!({"model":model,"factories":["resource.runtime_store"],"release":release,"before_run":id,"after_run":next,"path_changed":true,
          "logical_identity_retained":true,"transfer":transfer,"after_model_receipt":model_receipt,"answer":answer});
        std::fs::write(path, serde_json::to_vec_pretty(&report).unwrap()).unwrap();
    }
    stop.cancel();
    worker.await.unwrap();
}

async fn completed(kernel: &KernelHost, id: &str) -> String {
    tokio::time::timeout(Duration::from_secs(80), async {
        loop {
            if let Some(record) = kernel.store().execution_record(id).await.unwrap() {
                if let Some(RunOutcome::Completed { output, .. }) = record.outcome {
                    return output;
                }
                assert_eq!(record.status, "running", "{:?}", record.error);
            }
            tokio::time::sleep(Duration::from_millis(80)).await;
        }
    })
    .await
    .expect("live model after runtime-store transfer")
}
