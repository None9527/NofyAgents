use super::{
    omni::{checked, publish_release, run_session_with_input},
    *,
};
use nofy_agent_runtime::{
    ModelDelta, RunOutcome,
    events::{RunEvent, RunStatus},
};

#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
#[ignore = "requires a real local model"]
async fn omni_tool_scope_records_a_real_denial() {
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
    let stop = tokio_util::sync::CancellationToken::new();
    let worker = tokio::spawn({
        let stop = stop.clone();
        let kernel = kernel.clone();
        async move { kernel.run_worker(stop, 2).await.unwrap() }
    });
    let mut receipts = Vec::new();
    for (run, tool, granted) in [
        ("omni-scope-denied", "agent_tasks", false),
        ("omni-scope-allowed", "sdk_module_list", true),
    ] {
        let configured = checked(&sdk,"agent.configure",json!({"agent":"main","target":{"kind":"source","source":source,
            "expected_digest":source.digest().unwrap()},"settings":{"connection":{"base_url":endpoint,"models":[model],"allow_insecure_http":true,"timeout_ms":120000},
                "model":model,"model_settings":{"stream":true,"max_output_tokens":256},"allowed_tools":[tool],"max_steps":6}})).await;
        let release = publish_release(&sdk, &configured.data["source"]).await;
        let goal = "Test SDK module enumeration. Call sdk_module_list once, inspect the result, then return only ALLOWED for success or DENIED if the tool reports an error.";
        run_session_with_input(&sdk, "omni", &release, run, goal).await;
        let record = kernel.store().execution_record(run).await.unwrap().unwrap();
        let Some(RunOutcome::Completed { output, state }) = record.outcome else {
            unreachable!()
        };
        let events = kernel.store().events(run, 0, 100).await.unwrap();
        let attempted = events
            .iter()
            .find_map(|entry| match &entry.event {
                RunEvent::ModelDelta {
                    delta:
                        ModelDelta::ToolCall {
                            id: Some(id),
                            name: Some(name),
                            ..
                        },
                } if name == "sdk_module_list" => Some((entry.cursor, id)),
                _ => None,
            })
            .unwrap_or_else(|| panic!("model did not attempt module list in {run}: {output:?}"));
        let result = state
            .messages
            .iter()
            .find_map(|message| match message {
                nofy_agent_runtime::Message::Tool {
                    call_id,
                    content,
                    is_error,
                } if call_id == attempted.1 => Some((content, *is_error)),
                _ => None,
            })
            .expect("durable tool response");
        assert_eq!(result.1, !granted);
        if !granted {
            assert_eq!(
                result.0["error"],
                "tool outside configured scope: sdk_module_list"
            );
        }
        assert_eq!(output.trim(), if granted { "ALLOWED" } else { "DENIED" });
        receipts.push(json!({"run":run,"release":release,"model_call_cursor":attempted.0,"model_call_id":attempted.1,"tool_receipt":result.0,"is_error":result.1,"output":output}));
    }
    let report = json!({"model":model,"factories":["policy.tool_scope"],"cases":receipts});
    if let Ok(path) = std::env::var("NOFY_LIVE_REPORT") {
        std::fs::write(path, serde_json::to_vec_pretty(&report).unwrap()).unwrap();
    }
    stop.cancel();
    worker.await.unwrap();
}

#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
#[ignore = "requires a real local model and Linux process confinement"]
async fn omni_executes_isolated_workspace_with_a_scoped_approval() {
    let endpoint = std::env::var("NOFY_LIVE_MODEL_URL").unwrap();
    let model = std::env::var("NOFY_LIVE_MODEL").unwrap();
    let directory = tempfile::tempdir().unwrap();
    let workspace = tempfile::tempdir().unwrap();
    let record_path = "sealed-input.txt";
    let output_path = "review-receipt.txt";
    let directive = "ROWAN-7319";
    let content = "CACHE-0625";
    let original_text = "PENDING";
    let original_digest = "332011b91ccd9887592cd7072f12da38748e37ee1af81985f9c8e1f066aec6fb";
    std::fs::write(workspace.path().join(record_path), content).unwrap();
    std::fs::write(workspace.path().join(output_path), original_text).unwrap();
    let kernel = host(directory.path()).await;
    let service = serve(kernel.router()).await;
    let sdk = engine(&service.url, ADMIN);
    let template = checked(&sdk, "project.template", json!({})).await;
    let mut source: Source = serde_json::from_value(template.data["source"].clone()).unwrap();
    source.files.insert("rules.md".into(), nofy_agent_project::File::text(format!(
        "When asked for a workspace review, read {record_path} and replace {output_path} with the exact source text followed by |{directive}. Read the original receipt to obtain its sha256 for the write precondition.")));
    source.refresh_manifest().unwrap();
    let configured = checked(&sdk, "agent.configure", json!({"agent":"main","target":{"kind":"source","source":source,"expected_digest":source.digest().unwrap()},
        "settings":{"connection":{"base_url":endpoint,"models":[model],"allow_insecure_http":true,"timeout_ms":120000},"model":model,
        "model_settings":{"stream":true,"max_output_tokens":640},"workspace_enabled":true,"workspace":workspace.path(),
        "workspace_environment":{"executable":"/usr/bin/python3","prefix_args":["-s","-B"],"env":{"LANG":"C.UTF-8"},
            "paths":[{"path":"/usr","execute":true},{"path":"/lib","execute":true},{"path":"/lib64","execute":true},{"path":"/etc/ld.so.cache"}]},
        "allowed_tools":["read_file","write_file"]}})).await;
    let release = publish_release(&sdk, &configured.data["source"]).await;
    let stop = tokio_util::sync::CancellationToken::new();
    let worker = tokio::spawn({
        let stop = stop.clone();
        let kernel = kernel.clone();
        async move { kernel.run_worker(stop, 2).await.unwrap() }
    });
    let run = "omni-workspace-live";
    let goal = "Perform a workspace review following the workspace rules. Use the actual read and write tools and inspect their results. The operator grants one revision-checked write for the specified receipt, if it contains the exact reviewed result. After the write succeeds, return only the receipt text.";
    let request = json!({"system":"omni","release":release,"program":"main","run_id":run,"thread_id":run,
        "input":{"text":goal,"attachments":[]}});
    checked(&sdk,"session.start",json!({"session_id":run,"command_id":run,"expected_session_revision":null,"request_json":request.to_string()})).await;
    let expected = format!("{content}|{directive}");
    let mut cursor = 0;
    let mut calls = std::collections::BTreeMap::new();
    let mut receipts = Vec::new();
    let mut approved = false;
    let output = tokio::time::timeout(Duration::from_secs(180), async {
        loop {
            for entry in kernel.store().events(run, cursor, 200).await.unwrap() {
                cursor = entry.cursor;
                match entry.event {
                    RunEvent::ToolStarted { call } | RunEvent::ToolResumed { call } => { calls.insert(call.id.clone(), call); }
                    RunEvent::ToolCompleted { call_id, result, is_error } => {
                        let call = &calls[&call_id];
                        receipts.push(json!({"cursor":cursor,"call":call,"result":result,"is_error":is_error}));
                    }
                    RunEvent::Terminated { status: RunStatus::Paused, reason: Some(reason) } if reason["kind"] == "approval" => {
                        assert!(!approved);
                        let original = &reason["request"];
                        assert_eq!(original["call"]["name"], "write_file");
                        let work=checked(&sdk,"work.inspect",json!({"run_id":run,"work_id":run})).await;
                        assert_eq!(work.data["status"],"waiting");
                        assert_eq!(work.data["blocked_by"]["kind"],"approval");
                        assert_eq!(work.data["blocked_by"]["call_id"],original["call"]["id"]);
                        assert_eq!(original["call"]["arguments"], json!({"path":output_path,"expected_sha256":original_digest,"content":expected}));
                        assert!(original["policy_id"].is_null());
                        assert_eq!(std::fs::read_to_string(workspace.path().join(output_path)).unwrap(), original_text);
                        let decision = json!({"request":original,"allow":true,"scope":"once"});
                        checked(&sdk,"run.decide",json!({"run_id":run,"decision_json":decision.to_string()})).await;
                        let resume = json!({"command_id":"resume-omni-workspace-live","run_id":run,"command":{"kind":"resume"}});
                        checked(&sdk,"run.control",json!({"action_json":resume.to_string()})).await;
                        receipts.push(json!({"cursor":cursor,"approval":original,"work":work.data,"approved":true}));
                        approved = true;
                    }
                    _ => {}
                }
            }
            if let Some(record) = kernel.store().execution_record(run).await.unwrap() {
                if let Some(RunOutcome::Completed { output, .. }) = record.outcome { return output; }
                assert!(!matches!(record.status.as_str(), "failed" | "budget_exceeded" | "cancelled"), "{:?} {receipts:?}",record.error);
            }
            tokio::time::sleep(Duration::from_millis(100)).await;
        }
    }).await.expect("live workspace execution deadline");
    assert!(approved);
    for name in ["read_file", "write_file"] {
        assert!(
            receipts.iter().any(|r| r["call"]["name"] == name
                && r["is_error"] == false
                && r["result"]["value"]["ok"] == true),
            "{receipts:?}"
        );
    }
    assert_eq!(
        std::fs::read_to_string(workspace.path().join(output_path)).unwrap(),
        expected
    );
    assert_eq!(output.trim(), expected);
    let report = json!({"model":model,"run":run,"release":release,"output":output,"evidence":receipts,
        "factories":["context.rules","policy.on_tools","resource.directory","resource.process_local","tool.process_artifact"]});
    if let Ok(path) = std::env::var("NOFY_LIVE_REPORT") {
        std::fs::write(path, serde_json::to_vec_pretty(&report).unwrap()).unwrap();
    }
    stop.cancel();
    worker.await.unwrap();
}
