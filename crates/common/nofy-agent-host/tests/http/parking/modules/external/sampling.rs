use super::*;

#[tokio::test]
async fn context_sampling_crash_process() {
    let Ok(directory) = std::env::var("NOFY_CONTEXT_CALLBACK_STATE") else {
        return;
    };
    let url = std::env::var("NOFY_CONTEXT_CALLBACK_SERVICE").unwrap();
    let unmetered = std::env::var("NOFY_CONTEXT_CALLBACK_UNMETERED").unwrap() == "yes";
    let host = host(
        std::path::Path::new(&directory),
        Arc::new(AtomicUsize::new(0)),
    )
    .await;
    let doc = document(&url, "one", true, false, unmetered);
    let registry = host
        .control()
        .prepare(serde_json::from_value(doc.clone()).unwrap())
        .unwrap()
        .registry()
        .clone();
    let server = serve(host.router()).await;
    let publication = post(&server, "/api/v1/import", doc).await;
    post(&server,"/api/v1/runs",json!({"run_id":"root","thread_id":"thread","system":"model-evidence","release":publication["bundle"]["digest"],"program":"execute","input":{"text":"continue","attachments":[]}})).await;
    let supervisor = nofy_agent_runtime::supervisor::RunSupervisor::new(host.store().clone())
        .with_lease_ttl(Duration::from_secs(2))
        .unwrap();
    tokio::spawn(async move {
        supervisor
            .execute_submitted(&registry, "root")
            .await
            .unwrap()
    });
    await_count(&url, "summaries", 1).await;
    std::process::exit(71);
}
#[tokio::test]
async fn external_context_sampling_uses_original_scoped_receipts_after_hard_exit_for_both_budget_modes()
 {
    for unmetered in [false, true] {
        let service = Service::new(true);
        let serving = fixture(&service).await;
        let dir = tempfile::tempdir().unwrap();
        let directory = dir.path().to_owned();
        let url = serving.url.clone();
        let output = tokio::task::spawn_blocking(move || {
            std::process::Command::new(std::env::current_exe().unwrap())
                .args([
                    "--exact",
                    "parking::modules::external::sampling::context_sampling_crash_process",
                    "--nocapture",
                ])
                .env("NOFY_CONTEXT_CALLBACK_STATE", directory)
                .env("NOFY_CONTEXT_CALLBACK_SERVICE", url)
                .env(
                    "NOFY_CONTEXT_CALLBACK_UNMETERED",
                    if unmetered { "yes" } else { "no" },
                )
                .output()
                .unwrap()
        })
        .await
        .unwrap();
        assert_eq!(
            output.status.code(),
            Some(71),
            "{}{}",
            String::from_utf8_lossy(&output.stdout),
            String::from_utf8_lossy(&output.stderr)
        );
        let host = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
        let server = serve(host.router()).await;
        let stop = CancellationToken::new();
        let signal = stop.clone();
        let running = host.clone();
        let worker = tokio::spawn(async move { running.run_worker(signal, 2).await.unwrap() });
        let paused = outcome(&server, "root").await;
        assert_eq!(paused["execution"]["status"], "paused", "{paused}");
        assert_eq!(service.counts[5].load(Ordering::SeqCst), 1);
        assert_eq!(service.counts[2].load(Ordering::SeqCst), 1);
        let (status, page) = request(
            &server,
            reqwest::Method::GET,
            "/api/v1/runs/root/recovery/models?target_run_id=root",
            VIEW,
            Value::Null,
        )
        .await;
        assert_eq!(status, 200, "{page}");
        assert_eq!(page.as_array().unwrap().len(), 1, "{page}");
        assert!(
            page[0]["ticket"]["request"]["operation_scope"]
                .as_str()
                .is_some()
        );
        let response = ModelResponse {
            output: "__external_summary__".into(),
            input_tokens: 3,
            output_tokens: 2,
            ..Default::default()
        };
        let command = json!({"command_id":"context-proof","run_id":"root","command":{"kind":"reconcile_model","receipt":{"ticket":page[0]["ticket"],"result":{"kind":"completed","response":response}}}});
        assert_eq!(
            request(
                &server,
                reqwest::Method::POST,
                "/api/v1/actions",
                VIEW,
                command.clone()
            )
            .await
            .0,
            403
        );
        post(&server, "/api/v1/actions", command.clone()).await;
        let finished =
            action_result_within(&server, "context-proof", Duration::from_secs(45)).await;
        assert!(finished["error"].is_null(), "{finished}");
        assert_eq!(
            finished["outcome"]["Completed"]["output"],
            "external complete"
        );
        assert_eq!(post(&server, "/api/v1/actions", command).await, finished);
        assert_eq!(service.counts[5].load(Ordering::SeqCst), 1);
        assert_eq!(service.counts[0].load(Ordering::SeqCst), 2);
        assert_eq!(service.counts[2].load(Ordering::SeqCst), 1);
        let final_request = service.requests.lock().unwrap().last().unwrap().clone();
        assert!(
            final_request["messages"]
                .to_string()
                .contains("__external_summary__")
        );
        service.summary_release.cancel();
        stop.cancel();
        worker.await.unwrap();
    }
}

#[tokio::test]
async fn isolated_context_sampling_consumes_the_actual_model_boundary_and_preserves_current_input()
{
    let service = Service::new(false);
    service.start_release.cancel();
    let serving = fixture(&service).await;
    let dir = tempfile::tempdir().unwrap();
    let host = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(host.router()).await;
    let doc = document(&serving.url, "one", true, false, false);
    let compiled = host
        .control()
        .prepare(serde_json::from_value(doc.clone()).unwrap())
        .unwrap();
    let resolved = compiled
        .registry()
        .resolve(&[ModuleRef::new("quota", "1")])
        .unwrap();
    let ModuleInstance::Governance(profile) = &resolved.instances[&ModuleRef::new("quota", "1")]
    else {
        panic!("quota")
    };
    let scope = BudgetScope {
        root_run_id: "root".into(),
        identity: profile.identity().into(),
    };
    let publication = post(&server, "/api/v1/import", doc).await;
    let stop = CancellationToken::new();
    let signal = stop.clone();
    let running = host.clone();
    let worker = tokio::spawn(async move { running.run_worker(signal, 2).await.unwrap() });
    post(&server,"/api/v1/runs",json!({"run_id":"root","thread_id":"thread","system":"model-evidence","release":publication["bundle"]["digest"],"program":"execute","input":{"text":"continue","attachments":[]}})).await;
    let result = outcome(&server, "root").await;
    assert_eq!(result["execution"]["status"], "completed", "{result}");
    assert_eq!(service.counts[5].load(Ordering::SeqCst), 1);
    assert_eq!(service.counts[0].load(Ordering::SeqCst), 2);
    assert_eq!(service.counts[2].load(Ordering::SeqCst), 1);
    let quota = host.store().inspect(&scope).await.unwrap().unwrap();
    assert_eq!(quota.used.model_calls, 3);
    assert_eq!(
        quota.reserved,
        nofy_agent_runtime::governance::BudgetCost::default()
    );
    let checkpoint = host
        .store()
        .load("14:evidence-agentthread")
        .await
        .unwrap()
        .unwrap();
    assert!(checkpoint.state.messages.iter().any(|message| matches!(message,nofy_agent_runtime::Message::User {content} if content=="continue")));
    assert!(checkpoint.state.messages.iter().any(|message| matches!(message,nofy_agent_runtime::Message::Assistant {content,..} if content=="__external_summary__")));
    stop.cancel();
    worker.await.unwrap();
}

#[tokio::test]
async fn malformed_context_updates_do_not_replace_the_system_or_current_turn() {
    for current_turn in [false, true] {
        let service = Service::new(false);
        service.start_release.cancel();
        let serving = fixture(&service).await;
        let dir = tempfile::tempdir().unwrap();
        let host = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
        let server = serve(host.router()).await;
        let mut doc = document(&serving.url, "one", false, false, false);
        let source = if current_turn {
            r#"if args.phase=="plan" {if args.state.steps==1 {#{}} else {()}} else {#{kind:"update",update:#{messages:args.state.messages,retained_from:args.retained_turn_start+1,retained_at:1}}}"#
        } else {
            r#"if args.phase=="plan" {if args.state.steps==1 {#{}} else {()}} else {let messages=args.state.messages;messages[0].content="forged system";#{kind:"update",update:#{messages:messages,retained_from:0,retained_at:0}}}"#
        };
        doc["modules"]
            .as_array_mut()
            .unwrap()
            .iter_mut()
            .find(|m| m["reference"] == r("external-context"))
            .unwrap()["config"]["source"] = json!(source);
        let publication = post(&server, "/api/v1/import", doc).await;
        let stop = CancellationToken::new();
        let signal = stop.clone();
        let running = host.clone();
        let worker = tokio::spawn(async move { running.run_worker(signal, 2).await.unwrap() });
        post(&server,"/api/v1/runs",json!({"run_id":"root","thread_id":"thread","system":"model-evidence","release":publication["bundle"]["digest"],"program":"execute","input":{"text":"continue","attachments":[]}})).await;
        let result = outcome(&server, "root").await;
        assert_eq!(result["execution"]["status"], "failed", "{result}");
        let checkpoint = host
            .store()
            .load("14:evidence-agentthread")
            .await
            .unwrap()
            .unwrap();
        assert!(!checkpoint.state.messages.iter().any(|message|matches!(message,nofy_agent_runtime::Message::System {content} if content=="forged system")));
        assert!(checkpoint.state.messages.iter().any(|message|matches!(message,nofy_agent_runtime::Message::User {content} if content=="continue")));
        assert!(checkpoint.state.context_progress.pending.is_some());
        assert_eq!(service.counts[0].load(Ordering::SeqCst), 1);
        assert_eq!(service.counts[2].load(Ordering::SeqCst), 1);
        stop.cancel();
        worker.await.unwrap();
    }
}
