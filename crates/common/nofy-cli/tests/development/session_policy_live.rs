use super::{omni::checked, *};
use nofy_agent_runtime::{RunOutcome, events::RunEvent};

#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
#[ignore = "requires a real local model"]
async fn omni_runs_sessions_admitted_by_both_session_policies() {
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
            "model_settings":{"stream":true,"max_output_tokens":64},"allowed_tools":["unused_session_fixture_tool"]}})).await;
    let built = checked(
        &sdk,
        "agent.build",
        json!({"agent":"main","target":{"kind":"source","source":configured.data["source"]}}),
    )
    .await;
    let base: Value =
        serde_json::from_str(built.data["deployment_json"].as_str().unwrap()).unwrap();
    let stop = tokio_util::sync::CancellationToken::new();
    let worker = tokio::spawn({
        let stop = stop.clone();
        let kernel = kernel.clone();
        async move { kernel.run_worker(stop, 2).await.unwrap() }
    });
    let mut receipts = Vec::new();
    for (factory, id, name, config) in [
        (
            "session_policy.rules",
            "omni-rules-session",
            "Review omni-rules-session",
            json!({"naming":{"prefix":"Review"},"admission":{"when_busy":"queue"},
            "routing":{"mode":"labels","keys":["project"]},"history":{"archive_after_idle_seconds":null}}),
        ),
        (
            "session_policy.programmed",
            "omni-programmed-session",
            "Programmed amber review",
            json!({"source":"#{decision: \"allow\", reason: \"live fixture admission\", session_id: args.request.session_id, display_name: if args.phase == \"create\" { \"Programmed amber review\" } else { () }, archive: false}"}),
        ),
    ] {
        let mut deployment = base.clone();
        let reference = json!({"id":"live-session-policy","version":"1"});
        deployment["system"]["modules"]
            .as_array_mut()
            .unwrap()
            .push(json!({"reference":reference,"factory":factory,"config":config}));
        let main = &mut deployment["system"]["programs"]["main"]["definition"];
        main["schema_version"] = json!(2);
        main["session_policy"] = reference;
        let published = checked(
            &sdk,
            "system.publish",
            json!({"document_json":deployment.to_string()}),
        )
        .await;
        let release = published.refs["release"].as_deref().unwrap();
        let request = json!({"system":"omni","release":release,"program":"main","run_id":id,"thread_id":id,
            "input":{"text":"Return exactly AMBER-7403 and nothing else.","attachments":[]}});
        let admission = checked(
            &sdk,
            "session.start",
            json!({"session_id":id,"command_id":id,"expected_session_revision":null,
            "request_json":request.to_string(),"labels":{"project":"live-session"}}),
        )
        .await;
        assert_eq!(
            admission.data["session"]["display_name"], name,
            "{}",
            admission.data
        );
        assert!(
            admission.data["session"]["policy_revision"]
                .as_str()
                .is_some()
        );
        let output = tokio::time::timeout(Duration::from_secs(60), async {
            loop {
                if let Some(record) = kernel.store().execution_record(id).await.unwrap() {
                    if let Some(RunOutcome::Completed { output, .. }) = record.outcome {
                        break output;
                    }
                    assert_eq!(record.status, "running", "{:?}", record.error);
                }
                tokio::time::sleep(Duration::from_millis(80)).await;
            }
        })
        .await
        .expect("model-backed session deadline");
        assert_eq!(output.trim(), "AMBER-7403");
        let usage=kernel.store().events(id,0,100).await.unwrap().into_iter().find(|entry|matches!(&entry.event,RunEvent::ModelUsage{input_tokens,output_tokens,..} if *input_tokens>0&&*output_tokens>0)).unwrap();
        receipts.push(json!({"factory":factory,"run":id,"release":release,"admission":admission.data,"model_usage":usage,"output":output}));
    }
    if let Ok(path) = std::env::var("NOFY_LIVE_REPORT") {
        let report = json!({"model":model,"factories":["session_policy.rules","session_policy.programmed"],"cases":receipts});
        std::fs::write(path, serde_json::to_vec_pretty(&report).unwrap()).unwrap();
    }
    stop.cancel();
    worker.await.unwrap();
}
