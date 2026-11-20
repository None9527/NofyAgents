use super::{
    omni::{checked, run_session_with_input},
    *,
};
use nofy_agent_runtime::{RunOutcome, events::RunEvent};

#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
#[ignore = "requires a real local model and Linux scope workers"]
async fn omni_executes_a_scoped_skill_and_observes_a_cwd_conflict() {
    let endpoint = std::env::var("NOFY_LIVE_MODEL_URL").unwrap();
    let model = std::env::var("NOFY_LIVE_MODEL").unwrap();
    let state = tempfile::tempdir().unwrap();
    let workspace = tempfile::tempdir().unwrap();
    let other = tempfile::tempdir().unwrap();
    let kernel = host(state.path()).await;
    let service = serve(kernel.router()).await;
    let sdk = engine(&service.url, ADMIN);
    let source: Source = serde_json::from_value(
        checked(&sdk, "project.template", json!({})).await.data["source"].clone(),
    )
    .unwrap();
    let configured=checked(&sdk,"agent.configure",json!({"agent":"main","target":{"kind":"source","source":source,"expected_digest":source.digest().unwrap()},
        "settings":{"connection":{"base_url":endpoint,"models":[model],"allow_insecure_http":true,"timeout_ms":120000},
            "model":model,"model_settings":{"stream":true,"max_output_tokens":320},"max_steps":8,"allowed_tools":["skill","lookup_note"]}})).await;
    let built = checked(
        &sdk,
        "agent.build",
        json!({"agent":"main","target":{"kind":"source","source":configured.data["source"]}}),
    )
    .await;
    let mut deployment: Value =
        serde_json::from_str(built.data["deployment_json"].as_str().unwrap()).unwrap();
    let r = |id: &str| json!({"id":format!("scoped-live-{id}"),"version":"1"});
    let model_ref = deployment["system"]["programs"]["main"]["definition"]["model"].clone();
    let rules = include_str!(concat!(
        env!("CARGO_MANIFEST_DIR"),
        "/../../../presets/coding/modules/scopes/scope.rhai"
    ));
    let parameters = include_str!(concat!(
        env!("CARGO_MANIFEST_DIR"),
        "/../../../presets/coding/modules/scopes/parameters.schema.json"
    ));
    deployment["system"]["modules"].as_array_mut().unwrap().extend([
        json!({"reference":r("tool"),"factory":"tool.rhai","config":{"contract":{"name":"lookup_note","description":"Read the sealed fixture note by path.","effect":"read_only",
            "input_schema":{"type":"object","additionalProperties":false,"required":["path"],"properties":{"path":{"type":"string"}}}},
            "source":"if args.path == \"src/source.txt\" { #{receipt: \"CLOVE-4321\"} } else { #{receipt: \"UNAVAILABLE\"} }"}}),
        json!({"reference":r("artifact"),"factory":"resource.artifact","config":{"bundle":{"schema_version":1,"files":{"scope.rhai":rules,"parameters.json":parameters}}}}),
        json!({"reference":r("scope"),"factory":"resource.scope_program","config":{"source":{"kind":"artifact","entries":["scope.rhai"],"parameters_schema":"parameters.json"},
            "cwd":workspace.path(),"parameters":{"grants":{"fixture-read":{"tools":["lookup_note"],"path":{"argument":"path","glob":"src/**"}}}}},
            "dependencies":{"artifact":r("artifact")}}),
        json!({"reference":r("skills"),"factory":"tool.skills_scoped","config":{"scope":"scope","skills":[{"name":"sealed_review","description":"Read the sealed fixture with scoped authority.",
            "path":"skills/sealed_review/SKILL.md","body":"Call lookup_note on path src/source.txt. Return only the receipt field from the tool.","allowed_tools":["fixture-read"]}],
            "execution":{"default_model":"child","tool_packs":["work"],"model_settings":{"stream":true,"max_output_tokens":256},"max_steps":5}},
            "dependencies":{"scope":r("scope"),"child":model_ref,"work":r("tool")}}),
    ]);
    deployment["system"]["programs"]["main"]["definition"]["tool_packs"]
        .as_array_mut()
        .unwrap()
        .push(r("skills"));
    let stop = tokio_util::sync::CancellationToken::new();
    let worker = tokio::spawn({
        let kernel = kernel.clone();
        let stop = stop.clone();
        async move { kernel.run_worker(stop, 4).await.unwrap() }
    });
    let goal = "Call the skill tool with exact skill name sealed_review. Return only the sealed receipt obtained from that child, or BLOCKED if the skill reports an error. Use the skill once.";
    let mut evidence = Vec::new();
    for (id, cwd, should_run) in [
        ("omni-scoped-live", workspace.path(), true),
        ("omni-scoped-cwd-conflict", other.path(), false),
    ] {
        let binding = r(id);
        deployment["system"]["modules"]
            .as_array_mut()
            .unwrap()
            .push(json!({"reference":binding,"factory":"binding.cwd","config":{"cwd":cwd}}));
        let bindings = deployment["system"]["programs"]["main"]["definition"]["bindings"]
            .as_array_mut()
            .unwrap();
        if evidence.is_empty() {
            bindings.push(binding);
        } else {
            *bindings.last_mut().unwrap() = binding;
        }
        let published = checked(
            &sdk,
            "system.publish",
            json!({"document_json":deployment.to_string()}),
        )
        .await;
        let release = published.refs["release"].as_deref().unwrap();
        let result = if should_run {
            run_session_with_input(&sdk, "omni", release, id, goal).await;
            let Some(RunOutcome::Completed { output, .. }) = kernel
                .store()
                .execution_record(id)
                .await
                .unwrap()
                .unwrap()
                .outcome
            else {
                unreachable!()
            };
            assert_eq!(output.trim(), "CLOVE-4321");
            json!({"status":"completed","output":output})
        } else {
            let request = json!({"system":"omni","release":release,"program":"main","run_id":id,"thread_id":id,"input":{"text":goal,"attachments":[]}});
            checked(&sdk,"session.start",json!({"session_id":id,"command_id":id,"expected_session_revision":null,"request_json":request.to_string()})).await;
            let record = tokio::time::timeout(Duration::from_secs(45), async {
                loop {
                    if let Some(record) = kernel.store().execution_record(id).await.unwrap() {
                        if record.status == "failed" {
                            break record;
                        }
                        assert_eq!(record.status, "running");
                    }
                    tokio::time::sleep(Duration::from_millis(80)).await;
                }
            })
            .await
            .expect("scoped CWD conflict deadline");
            let error = record.error.unwrap();
            assert!(
                error.contains("scope cwd conflicts with its declared matching base"),
                "{error}"
            );
            json!({"status":"failed","error":error})
        };
        let events = kernel.store().events(id, 0, 300).await.unwrap();
        let tools: std::collections::BTreeMap<_, _> = events
            .iter()
            .filter_map(|entry| match &entry.event {
                RunEvent::ToolStarted { call } => Some((&call.id, (&entry.scope, call))),
                _ => None,
            })
            .collect();
        let receipts:Vec<_>=events.iter().filter_map(|entry|match &entry.event{
            RunEvent::ToolCompleted{call_id,result,is_error}=>tools.get(call_id).map(|(scope,call)|json!({"cursor":entry.cursor,"scope":scope,"call":call,"error":is_error,"result":result})),_=>None,
        }).collect();
        if should_run {
            assert!(
                receipts
                    .iter()
                    .any(|receipt| receipt["scope"]["run_id"] != id
                        && receipt["call"]["name"] == "lookup_note"
                        && receipt["error"] == false
                        && receipt["result"].to_string().contains("CLOVE-4321")),
                "{receipts:?}"
            );
            assert!(kernel.loader().scope_status().started >= 2);
        } else {
            assert!(tools.values().any(|(_, call)| call.name == "skill"));
            assert!(
                !receipts
                    .iter()
                    .any(|receipt| receipt["call"]["name"] == "lookup_note")
            );
        }
        evidence.push(json!({"id":id,"release":release,"result":result,"executed":receipts}));
    }
    if let Ok(path) = std::env::var("NOFY_LIVE_REPORT") {
        let report = json!({"model":model,"factories":["binding.cwd","resource.scope_program","tool.skills_scoped"],"cases":evidence,"scope_workers_started":kernel.loader().scope_status().started});
        std::fs::write(path, serde_json::to_vec_pretty(&report).unwrap()).unwrap();
    }
    stop.cancel();
    worker.await.unwrap();
}
