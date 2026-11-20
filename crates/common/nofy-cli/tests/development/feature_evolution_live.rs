use super::*;
use nofy_agent_host::feature_authoring::{
    FeatureAuthorization, FeatureCase, FeatureExtensions, FeatureHttpAuthorization,
};
use nofy_agent_runtime::events::RunEvent;

const FEATURE: &str = "live-ticket-router";
const GOAL_INPUT: &str = "Read the exact routing contract status for account access.";
const CONTROL_INPUT: &str = "Return exactly the number 4 and no punctuation.";
const FEATURE_INPUT: &str = "Triage category access with 10 elapsed minutes. Load your Skill, obtain queue and priority from MCP, and calculate twice the elapsed minutes with your local tool. Output queue|priority|points and nothing else.";
const EXPECTED: &str = "identity|high|20";
const AUTHORS: &str = "live-omni-author";
const LEGACY_INPUT: &str =
    "Report the routing contract status for account access in diagnostic mode.";
const NOTE: &str = "Case Mango belongs to the identity support queue.";

async fn http_fixture() -> (Serving, Arc<std::sync::Mutex<Vec<Value>>>) {
    use axum::{
        Json,
        extract::State,
        http::StatusCode,
        routing::{get, post},
    };
    type Receipts = Arc<std::sync::Mutex<Vec<Value>>>;
    let receipts = Receipts::default();
    let router = axum::Router::new()
        .route("/direct", post(|State(receipts): State<Receipts>, Json(input): Json<Value>| async move {
            let accepted = input == json!({"category":"access"});
            receipts.lock().unwrap().push(json!({"path":"direct","accepted":accepted,"input":input}));
            if accepted { Ok(Json(json!({"marker":"POMELO-91"}))) } else { Err(StatusCode::BAD_REQUEST) }
        }))
        .route("/catalog", get(|State(receipts): State<Receipts>| async move {
            receipts.lock().unwrap().push(json!({"path":"catalog","accepted":true,"revision":"markers-v1"}));
            Json(json!({"revision":"markers-v1","tools":[{"type":"function","function":{
                "name":"http_observe","description":"Read the second HTTP marker for a ticket category.",
                "parameters":{"type":"object","additionalProperties":false,"required":["category"],"properties":{"category":{"type":"string"}}}}}]}))
        }))
        .route("/invoke", post(|State(receipts): State<Receipts>, Json(input): Json<Value>| async move {
            let accepted = input == json!({"revision":"markers-v1","tool":"http_observe","arguments":{"category":"access"}});
            receipts.lock().unwrap().push(json!({"path":"invoke","accepted":accepted,"input":input}));
            if accepted { Ok(Json(json!({"revision":"markers-v1","value":{"marker":"IRIS-44"}}))) } else { Err(StatusCode::BAD_REQUEST) }
        }))
        .with_state(receipts.clone());
    (serve(router).await, receipts)
}

#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
#[ignore = "requires a real, tool-capable OpenAI-compatible model endpoint"]
async fn omni_authors_verifies_publishes_and_evolves_on_a_real_model() {
    live_acceptance(false, false).await;
}

#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
#[ignore = "requires a real, tool-capable OpenAI-compatible model endpoint"]
async fn omni_authors_workflow_memory_policy_and_triggers_live_rollback() {
    live_acceptance(true, false).await;
}

#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
#[ignore = "requires a real, tool-capable OpenAI-compatible model endpoint"]
async fn omni_authors_and_publishes_live_http_tools() {
    live_acceptance(false, true).await;
}

async fn live_acceptance(extended: bool, http: bool) {
    let endpoint = std::env::var("NOFY_LIVE_MODEL_URL").expect("NOFY_LIVE_MODEL_URL");
    let model = std::env::var("NOFY_LIVE_MODEL").expect("NOFY_LIVE_MODEL");
    let directory = tempfile::tempdir().unwrap();
    let kernel = host(directory.path()).await;
    let server = serve(kernel.router()).await;
    let sdk = engine(&server.url, ADMIN);
    let inventory: Value = reqwest::Client::new()
        .get(format!("{}/api/v1/modules", server.url))
        .bearer_auth(ADMIN)
        .send()
        .await
        .unwrap()
        .error_for_status()
        .unwrap()
        .json()
        .await
        .unwrap();

    let calls = Arc::new(AtomicUsize::new(0));
    let backend = RoutingServer {
        tool: ToolDesign {
            name: "lookup_queue".into(),
            description: "Read the support queue and priority for a ticket category.".into(),
            input_schema:
                json!({"type":"object","required":["category"],"additionalProperties":false,
                "properties":{"category":{"type":"string"}}})
                .as_object()
                .unwrap()
                .clone(),
            output_schema: json!({"type":"object","required":["queue","priority"],
                "properties":{"queue":{"type":"string"},"priority":{"type":"string"}}})
            .as_object()
            .unwrap()
            .clone(),
            routes: BTreeMap::from([(
                "access".into(),
                json!({"queue":"identity","priority":"high"}),
            )]),
            fallback: json!({"queue":"general","priority":"normal"}),
        },
        calls: calls.clone(),
    };
    let protocol = StreamableHttpService::new(
        move || Ok(backend.clone()),
        Arc::new(LocalSessionManager::default()),
        StreamableHttpServerConfig::default().with_legacy_session_mode(false),
    );
    let mcp = serve(axum::Router::new().nest_service("/mcp", protocol)).await;
    let mut http_receipts = Arc::new(std::sync::Mutex::new(Vec::<Value>::new()));
    let http_fixture = if http {
        let (fixture, receipts) = http_fixture().await;
        http_receipts = receipts;
        Some(fixture)
    } else {
        None
    };
    let template = checked(&sdk, "project.template", json!({})).await;
    let source: Source = serde_json::from_value(template.data["source"].clone()).unwrap();
    let create = if http {
        "sdk_feature_create_http"
    } else {
        "sdk_feature_create"
    };
    let configured = checked(&sdk, "agent.configure", json!({"agent":"main","target":{"kind":"source","source":source,"expected_digest":source.digest().unwrap()},
        "settings":{"connection":{"base_url":endpoint,"models":[model],"allow_insecure_http":true,"timeout_ms":120000},
            "model":model,"model_settings":{"stream":true,"max_output_tokens":1800},"evolution_enabled":true,
            "allowed_tools":["sdk_feature_catalog",create,"sdk_feature_verify","sdk_feature_publish","sdk_propose_prompt"]}})).await;
    let source: Source = serde_json::from_value(configured.data["source"].clone()).unwrap();
    let configured = checked(&sdk, "agent.module.add", json!({"agent":"main","target":{"kind":"source","source":source,"expected_digest":source.digest().unwrap()},
        "id":"sdk-feature","factory":"tool.sdk_feature","slot":"tool_packs","config":{}})).await;
    let mut source: Source = serde_json::from_value(configured.data["source"].clone()).unwrap();
    let mut prompt = source.files["prompt.md"].utf8().unwrap();
    prompt.push_str(&format!("\n\nTrusted baseline behavior. For routing contract status queries about account access, return exactly NOT_CONFIGURED. If the user input is exactly \"{CONTROL_INPUT}\", return exactly 4.\n"));
    source
        .files
        .insert("prompt.md".into(), nofy_agent_project::File::text(prompt));
    source.refresh_manifest().unwrap();
    let release = publish_release(&sdk, &json!(source)).await;
    let activation = checked(&sdk, "system.apply", json!({"system":"omni","release":release,"expected_generation":null,"command_id":"live-omni-bootstrap"})).await;
    let generation = activation.refs["generation"]
        .as_deref()
        .unwrap()
        .parse()
        .unwrap();
    let baseline = Activation {
        release: release.clone(),
        generation,
    };
    let mut observation = vec![Probe {
        input: CONTROL_INPUT.into(),
        expected: "4".into(),
        baseline_expected: None,
    }];
    if extended {
        observation.push(Probe {
            input: LEGACY_INPUT.into(),
            expected: "NOT_CONFIGURED".into(),
            baseline_expected: None,
        });
    }
    let feature_input = if http {
        format!(
            "{FEATURE_INPUT} Before returning, also call your direct HTTP lookup and the discovered tool http_observe with category access. Append their marker values in that order separated by |."
        )
    } else if extended {
        format!(
            "Triage category access with 10 elapsed minutes. Load the declared Skill using its exact registered name. Get queue and priority from MCP. Compare results from your calculator and feature_workflow. Use the memory tool to remember this exact project note: {NOTE} Then list project memory and confirm the matching note was retrieved. Return only queue|priority|points|MEMORIZED after all tools succeed."
        )
    } else {
        FEATURE_INPUT.into()
    };
    let kernel = kernel
        .with_feature_authoring(FeatureAuthorization {
            author_system: "omni".into(),
            baseline: baseline.clone(),
            system: FEATURE.into(),
            mcp_endpoint: format!("{}/mcp", mcp.url),
            mcp_tool: "lookup_queue".into(),
            cases: vec![FeatureCase {
                input: feature_input.clone(),
                expected: if http {
                    format!("{EXPECTED}|POMELO-91|IRIS-44")
                } else if extended {
                    format!("{EXPECTED}|MEMORIZED")
                } else {
                    EXPECTED.into()
                },
            }],
            extensions: extended.then(|| FeatureExtensions {
                memory_namespace: "live-feature-acceptance".into(),
                memory_project_id: "37a9b2ac-9dca-4aae-9235-aed6ac68d141".into(),
                approved_note: NOTE.into(),
            }),
            http: http_fixture
                .as_ref()
                .map(|fixture| FeatureHttpAuthorization {
                    base_url: format!("{}/", fixture.url),
                    direct_path: "direct".into(),
                    catalog_path: "catalog".into(),
                    invoke_path: "invoke".into(),
                    discovered_tool: "http_observe".into(),
                }),
        })
        .unwrap()
        .with_evolution(Preauthorization {
            system: "omni".into(),
            baseline: baseline.clone(),
            evaluation: vec![Probe {
                input: GOAL_INPUT.into(),
                baseline_expected: Some("NOT_CONFIGURED".into()),
                expected: "IDENTITY".into(),
            }],
            observation,
        })
        .unwrap();
    let stop = tokio_util::sync::CancellationToken::new();
    let worker = tokio::spawn({
        let stop = stop.clone();
        let kernel = kernel.clone();
        async move { kernel.run_worker(stop, 4).await.unwrap() }
    });
    let mut task = "Build and deploy a new support-ticket specialist with your internal SDK tools. Write the specialist prompt, author a named Skill and its instructions, implement a pure local calculator tool that doubles elapsed minutes, implement the before_model Hook, and wire the permitted read-only MCP tool lookup_queue. The specialist must call its Skill by its exact registered name, your calculator and facts_lookup_queue, and return queue|priority|points as compact plain text. Use the create tool to submit your own design. Use the returned revision to verify. Correct failed designs yourself and verify the new revision. Publish through the SDK only when it passes.".to_owned();
    if http {
        task.push_str(" Inspect the HTTP grant using sdk_feature_catalog and use sdk_feature_create_http. Its required http object carries your own tool_name, description and input_schema, plus the three exact path strings from the grant. The specialist must obtain two additional live markers from that fixture. Author a named direct lookup with a required string category argument, and connect the granted HTTP catalog so it discovers http_observe. Both lookups take category access for the acceptance case. Append the two actual marker values as |direct_marker|catalog_marker. Finish with one short sentence when publication is confirmed.");
    } else {
        task.push_str(&format!(" Once publishing succeeds, use sdk_propose_prompt with your complete revised Omni prompt. The exact status question \"{GOAL_INPUT}\" is read-only and asks for the snapshot you just verified. The Host tests it in a tool-free process. Require the next Omni to answer with the actual uppercase queue alone from the verified result, without doing any tool lookup even when tools are available. Keep ordinary question behavior. Use tools yourself until both publication and evolution submission are confirmed, then finish with one short sentence."));
    }
    if extended {
        task.push_str(&format!(" In this run first inspect sdk_feature_catalog. Your create request must design the extensions: a workflow graph built from your admitted calculator, and a Policy that requests approval for remembering project notes. Make sure the specialist calls its Skill using the exact skill_name you declared. Your specialist must run the Workflow and the direct calculator, then use memory to remember and list the exact project note '{NOTE}'. The operator has authorized that exact approval only. On successful recollection, append |MEMORIZED to the result. For the Omni evolution target, apply the new snapshot answer to all account-access routing-contract status queries, including alternate wording. Legacy compatibility is independently checked by the Host. Preserve unrelated behavior."));
    }
    let request = json!({"run_id":AUTHORS,"thread_id":AUTHORS,"system":"omni","release":release,"program":"main","input":{"text":task,"attachments":[]}});
    checked(&sdk, "session.start", json!({"session_id":AUTHORS,"command_id":AUTHORS,"expected_session_revision":null,"request_json":request.to_string()})).await;
    let pinned_session = if extended {
        let kernel = kernel.clone();
        let sdk = engine(&server.url, ADMIN);
        Some(tokio::spawn(async move {
            tokio::time::timeout(Duration::from_secs(600), async {
                let id = "live-omni-candidate-pin";
                loop {
                    let active = kernel.control().load_active("omni").await.unwrap().0;
                    if active.generation == generation + 1 {
                        let request = json!({"run_id":id,"thread_id":id,"system":"omni","release":active.release,
                            "program":"main","input":{"text":GOAL_INPUT,"attachments":[]}});
                        let admitted = checked(&sdk, "session.start", json!({"session_id":id,"command_id":id,
                            "expected_session_revision":null,"request_json":request.to_string()})).await;
                        let current = kernel.control().load_active("omni").await.unwrap().0;
                        assert_eq!(current, active);
                        return (active, admitted.data);
                    }
                    assert_eq!(active.generation, generation, "missed candidate activation");
                    tokio::time::sleep(Duration::from_millis(100)).await;
                }
            }).await.expect("candidate activation")
        }))
    } else {
        None
    };
    let events = tokio::time::timeout(Duration::from_secs(600), async {
        let mut cursor = 0;
        let mut evidence = Vec::new();
        loop {
            for envelope in kernel.store().events(AUTHORS, cursor, 1000).await.unwrap() {
                cursor = envelope.cursor;
                match envelope.event {
                    RunEvent::ToolStarted { call } => {
                        eprintln!("Omni tool {}", call.name);
                        evidence.push(("started", json!(call.name)));
                    }
                    RunEvent::ToolCompleted {
                        call_id,
                        result,
                        is_error,
                    } => {
                        eprintln!("Omni tool result {call_id} error={is_error} {result}");
                        evidence.push((
                            "completed",
                            json!({"call_id":call_id,"result":result,"is_error":is_error}),
                        ));
                    }
                    _ => {}
                }
            }
            if let Some(record) = kernel.store().execution_record(AUTHORS).await.unwrap()
                && (record.outcome.is_some() || record.status == "failed")
            {
                assert!(
                    matches!(
                        record.outcome,
                        Some(nofy_agent_runtime::RunOutcome::Completed { .. })
                    ),
                    "author run {}: {:?}",
                    record.status,
                    record.error
                );
                return evidence;
            }
            tokio::time::sleep(Duration::from_millis(400)).await;
        }
    })
    .await
    .expect("real model authoring deadline");
    for name in [create, "sdk_feature_verify", "sdk_feature_publish"] {
        assert!(
            events
                .iter()
                .any(|(kind, event)| *kind == "started" && *event == name),
            "missing model tool {name}"
        );
    }

    let (feature, _) = kernel.control().load_active(FEATURE).await.unwrap();
    let candidate = kernel.control().export(&feature.release).await.unwrap();
    for factory in [
        if http {
            "prompt.document"
        } else {
            "prompt.static"
        },
        "model.programmed",
        "tool.skills",
        "tool.rhai",
        "hook.executor",
        "hook.subscription",
        "resource.mcp_http",
        "tool_source.mcp",
    ] {
        assert!(
            candidate
                .document
                .modules
                .iter()
                .any(|module| module.factory == factory),
            "missing factory {factory}"
        );
    }
    assert!(
        calls.load(Ordering::SeqCst) > 0,
        "specialist did not call MCP"
    );
    if http {
        let factories = [
            "prompt.document",
            "resource.http",
            "tool.http_connected",
            "tool_source.http",
        ];
        for name in factories {
            assert!(
                candidate
                    .document
                    .modules
                    .iter()
                    .any(|module| module.factory == name)
            );
        }
        let receipts = http_receipts.lock().unwrap().clone();
        let verification_renders = kernel.loader().prompt_status().started;
        assert!(
            verification_renders > 0,
            "verify did not render a document prompt"
        );
        for path in ["direct", "catalog", "invoke"] {
            assert!(
                receipts
                    .iter()
                    .any(|receipt| receipt["path"] == path && receipt["accepted"] == true)
            );
        }
        let output = session(
            &sdk,
            FEATURE,
            &feature.release,
            "live-http-reuse",
            &feature_input,
        )
        .await;
        assert_eq!(output.trim(), format!("{EXPECTED}|POMELO-91|IRIS-44"));
        let reuse_renders = kernel.loader().prompt_status().started - verification_renders;
        assert!(
            reuse_renders > 0,
            "fresh session did not render a document prompt"
        );
        let reused = http_receipts.lock().unwrap().clone();
        for path in ["direct", "catalog", "invoke"] {
            assert!(
                reused[receipts.len()..]
                    .iter()
                    .any(|receipt| receipt["path"] == path && receipt["accepted"] == true)
            );
        }
        if let Ok(path) = std::env::var("NOFY_LIVE_REPORT") {
            std::fs::write(path, serde_json::to_vec_pretty(&json!({"model":model,"factories":factories,"author_run":AUTHORS,
                "specialist":feature,"author_events":events,"verification_http":receipts,"reuse_http":&reused[receipts.len()..],
                "document_prompt_renders":{"verification":verification_renders,"reuse":reuse_renders},"reuse_output":output})).unwrap()).unwrap();
        }
        stop.cancel();
        worker.await.unwrap();
        return;
    }
    assert!(
        events
            .iter()
            .any(|(kind, event)| *kind == "started" && *event == "sdk_propose_prompt")
    );
    let evolution = tokio::time::timeout(Duration::from_secs(150), async {
        loop {
            if let Some(receipt) = kernel.evolution_receipt().await.unwrap() {
                match receipt.phase {
                    Phase::Accepted if !extended => return receipt,
                    Phase::RolledBack if extended => return receipt,
                    Phase::Rejected | Phase::RolledBack | Phase::Superseded | Phase::Accepted => {
                        panic!("{receipt:?}")
                    }
                    _ => {}
                }
            }
            tokio::time::sleep(Duration::from_millis(400)).await;
        }
    })
    .await
    .expect("real model evolution deadline");
    assert_eq!(evolution.author_run, AUTHORS);
    assert_eq!(
        evolution.activation.as_ref().unwrap().active.generation,
        generation + 1
    );
    let active = kernel.control().load_active("omni").await.unwrap().0;
    if extended {
        let rolled_back = evolution.rollback.as_ref().unwrap();
        assert_eq!(rolled_back.active.release, baseline.release);
        assert_eq!(rolled_back.active.generation, generation + 2);
        assert_eq!(
            rolled_back.previous.as_ref(),
            Some(&evolution.activation.as_ref().unwrap().active)
        );
        assert_eq!(active, rolled_back.active);
        let regression = evolution.evidence.last().unwrap();
        assert_eq!(regression.phase, Phase::Observe);
        assert!(!regression.matched);
        let record = kernel
            .store()
            .execution_record(&regression.run_id)
            .await
            .unwrap()
            .unwrap();
        let Some(nofy_agent_runtime::RunOutcome::Completed { output, .. }) = record.outcome else {
            panic!("regression must come from a real completed model response");
        };
        assert_eq!(output, "IDENTITY");
    } else {
        assert_eq!(active, evolution.activation.as_ref().unwrap().active);
    }
    let final_output = session(&sdk, "omni", &active.release, "live-omni-after", GOAL_INPUT).await;
    let continuity = if let Some(pinned_session) = pinned_session {
        let (admitted_release, admitted) = pinned_session.await.unwrap();
        assert_eq!(
            admitted_release,
            evolution.activation.as_ref().unwrap().active
        );
        let id = "live-omni-candidate-pin";
        let next = "live-omni-candidate-continued";
        let (original_output, continued_output) = tokio::time::timeout(Duration::from_secs(100), async {
            let mut outputs = Vec::new();
            for run_id in [id, next] {
                if run_id == next {
                    let prior = kernel.store().session_state(id).await.unwrap().unwrap();
                    let command = json!({"command_id":next,"source_run_id":id,"expected_source_revision":0,
                        "turn":{"kind":"new","run_id":next,"input":{"text":GOAL_INPUT,"attachments":[]}}});
                    checked(&sdk, "session.turn", json!({"session_id":id,"expected_session_revision":prior.session_revision,
                        "request_json":command.to_string()})).await;
                }
                let run = kernel.store().managed_run(run_id).await.unwrap().unwrap();
                assert_eq!(run.request.release, admitted_release.release);
                let output = loop {
                    if let Some(record) = kernel.store().execution_record(run_id).await.unwrap() {
                        if let Some(nofy_agent_runtime::RunOutcome::Completed { output, .. }) = record.outcome {
                            break output;
                        }
                        assert_eq!(record.status, "running", "{:?}", record.error);
                    }
                    tokio::time::sleep(Duration::from_millis(100)).await;
                };
                assert_eq!(output.trim(), "IDENTITY");
                outputs.push(output);
            }
            (outputs.remove(0), outputs.remove(0))
        }).await.expect("pinned session continuation");
        let continued = kernel.store().session(id).await.unwrap().unwrap();
        assert_eq!(continued.session.release, admitted_release.release);
        let specialist_run = "live-specialist-after-publication";
        let specialist_input = format!(
            "Read-only follow-up. Triage category access with 10 minutes. Load your exact Skill, use facts_lookup_queue and feature_workflow, then list project memory to verify {NOTE} Leave memory unchanged. Return only {EXPECTED}|MEMORIZED if all data match."
        );
        let specialist_output = session(
            &sdk,
            FEATURE,
            &feature.release,
            specialist_run,
            &specialist_input,
        )
        .await;
        assert_eq!(specialist_output.trim(), format!("{EXPECTED}|MEMORIZED"));
        let specialist_events = kernel
            .store()
            .events(specialist_run, 0, 1000)
            .await
            .unwrap();
        for name in ["facts_lookup_queue", "feature_workflow", "memory"] {
            assert!(specialist_events.iter().any(
                |item| matches!(&item.event, RunEvent::ToolStarted { call } if call.name == name)
            ));
        }
        Some(
            json!({"admitted":admitted,"active_when_admitted":admitted_release,"continued":continued,
            "original_output":original_output,"continued_output":continued_output,"continued_run":next,
            "specialist_run":specialist_run,"specialist_output":specialist_output,"specialist_events":specialist_events}),
        )
    } else {
        None
    };
    let expected_output = if extended {
        "NOT_CONFIGURED"
    } else {
        "IDENTITY"
    };
    if let Ok(path) = std::env::var("NOFY_LIVE_REPORT") {
        let exercised: BTreeSet<_> = candidate
            .document
            .modules
            .iter()
            .map(|module| module.factory.as_str())
            .chain(["tool.sdk_feature", "tool.sdk_evolution"])
            .collect();
        let factory_coverage = inventory["factories"]
            .as_array()
            .unwrap()
            .iter()
            .map(|factory| {
                let name = factory["factory"].as_str().unwrap();
                (
                    name,
                    if exercised.contains(name) {
                        "exercised_in_live_release"
                    } else {
                        "not_exercised"
                    },
                )
            })
            .collect::<BTreeMap<_, _>>();
        std::fs::write(path,serde_json::to_vec_pretty(&json!({
            "model":model,"author_run":AUTHORS,"specialist":feature,
            "specialist_components":candidate.document.modules.iter().filter(|module| module.reference.id.starts_with("feature-")).collect::<Vec<_>>(),
            "tool_evidence":events,"mcp_calls":calls.load(Ordering::SeqCst),"evolution":evolution,
            "final_session":{"output":final_output,"expected":expected_output,"matched":final_output.trim()==expected_output},
            "factory_coverage":factory_coverage,"continuity":continuity
        })).unwrap()).unwrap();
    }
    stop.cancel();
    worker.await.unwrap();
    assert_eq!(final_output.trim(), expected_output);
}

#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
#[ignore = "requires a real, tool-capable OpenAI-compatible model endpoint"]
async fn omni_exercises_model_authored_assembly_and_durable_coordination() {
    let endpoint = std::env::var("NOFY_LIVE_MODEL_URL").expect("NOFY_LIVE_MODEL_URL");
    let model = std::env::var("NOFY_LIVE_MODEL").expect("NOFY_LIVE_MODEL");
    let directory = tempfile::tempdir().unwrap();
    let kernel = host(directory.path()).await;
    let server = serve(kernel.router()).await;
    let sdk = engine(&server.url, ADMIN);
    let template = checked(&sdk, "project.template", json!({})).await;
    let source: Source = serde_json::from_value(template.data["source"].clone()).unwrap();
    let configured = checked(&sdk, "agent.configure", json!({"agent":"main","target":{"kind":"source","source":source,"expected_digest":source.digest().unwrap()},
        "settings":{"connection":{"base_url":endpoint,"models":[model],"allow_insecure_http":true,"timeout_ms":120000},
            "model":model,"model_settings":{"stream":true,"max_output_tokens":1800},
            "context_window":262144,
            "allowed_tools":["sdk_schema","sdk_module_template","agent_messages","sdk_work_attached_targets","sdk_work_task","sdk_work_list","sdk_work_inspect","workflow_execute","workflow_agent"]}})).await;
    let release = publish_release(&sdk, &configured.data["source"]).await;
    checked(&sdk, "system.apply", json!({"system":"omni","release":release,"expected_generation":null,"command_id":"coordination-baseline"})).await;
    let stop = tokio_util::sync::CancellationToken::new();
    let worker = tokio::spawn({
        let kernel = kernel.clone();
        let stop = stop.clone();
        async move { kernel.run_worker(stop, 4).await.unwrap() }
    });
    let run = "live-omni-coordination";
    let task = "Use the internal SDK to coordinate two attached tasks. Use sdk_module_template to inspect a tool module template and sdk_work_attached_targets to discover the authorized drivers and their schemas. Design and spawn a small Workflow (assemble driver with kind workflow) with an Agent node that actually returns PLUM. Separately spawn a durable child (task delegate driver), asking that child to send LIME via agent_messages to the run tree using a stable message_id and to return LIME. Set a distinct task_id on both spawn calls and start both before waiting for either. Read both completed results using sdk_work_task and read agent_messages as the parent. Then call sdk_work_list with no arguments, find the completed Workflow Agent node (kind workflow_agent) and call sdk_work_inspect on its exact work_id. Only after those checks return PLUM|LIME. Use the tools to inspect errors and repair your own requests.";
    let request = json!({"system":"omni","release":release,"program":"main","run_id":run,"thread_id":run,
        "input":{"text":task,"attachments":[]}});
    checked(&sdk, "session.start", json!({"session_id":run,"command_id":run,"expected_session_revision":null,"request_json":request.to_string()})).await;
    let (output, calls, verified) = tokio::time::timeout(Duration::from_secs(240), async {
        let mut cursor = 0;
        let mut started = BTreeMap::new();
        let mut calls = BTreeSet::new();
        let mut verified = BTreeSet::new();
        loop {
            for envelope in kernel.store().events(run, cursor, 1000).await.unwrap() {
                cursor = envelope.cursor;
                match envelope.event {
                    RunEvent::ToolStarted { call } => {
                        eprintln!("{} {} {}", envelope.scope.run_id, call.name, call.arguments);
                        started.insert(call.id, call.name);
                    }
                    RunEvent::ToolCompleted {
                        call_id,
                        result,
                        is_error,
                    } => {
                        if let Some(name) = started.get(&call_id) {
                            eprintln!("{} {name} success={}", envelope.scope.run_id, !is_error);
                            if is_error {
                                eprintln!("{result}");
                            } else {
                                calls.insert(name.clone());
                                if envelope.scope.run_id == run {
                                    let value = result["value"].to_string();
                                    if matches!(
                                        name.as_str(),
                                        "sdk_work_task" | "sdk_work_list" | "sdk_work_inspect"
                                    ) {
                                        eprintln!("{name} result={value}");
                                    }
                                    match name.as_str() {
                                        "sdk_work_attached_targets"
                                            if value.contains("assemble")
                                                && value.contains("task") =>
                                        {
                                            verified.insert("authorized_targets");
                                        }
                                        "sdk_work_task"
                                            if value.contains("PLUM")
                                                && value.contains("completed") =>
                                        {
                                            verified.insert("completed_workflow");
                                        }
                                        "sdk_work_task"
                                            if value.contains("LIME")
                                                && value.contains("completed") =>
                                        {
                                            verified.insert("durable_child");
                                        }
                                        "agent_messages" if value.contains("LIME") => {
                                            verified.insert("received_message");
                                        }
                                        "sdk_work_list"
                                            if result["value"]["items"].as_array().is_some_and(
                                                |items| {
                                                    items.iter().any(|node| {
                                                        node["status"] == "completed"
                                                            && node["kind"] == "workflow_agent"
                                                    })
                                                },
                                            ) =>
                                        {
                                            verified.insert("work_tree");
                                        }
                                        "sdk_work_inspect"
                                            if result["value"]["status"] == "completed"
                                                && result["value"]["kind"] == "workflow_agent" =>
                                        {
                                            verified.insert("work_inspection");
                                        }
                                        _ => {}
                                    }
                                }
                            }
                        }
                    }
                    _ => {}
                }
            }
            if let Some(record) = kernel.store().execution_record(run).await.unwrap() {
                if let Some(nofy_agent_runtime::RunOutcome::Completed { output, .. }) =
                    record.outcome
                {
                    return (output, calls, verified);
                }
                assert_eq!(record.status, "running", "{:?}", record.error);
            }
            tokio::time::sleep(Duration::from_millis(300)).await;
        }
    })
    .await
    .expect("live coordination deadline");
    assert!(output.contains("PLUM|LIME"), "{output}");
    assert_eq!(
        verified,
        BTreeSet::from([
            "authorized_targets",
            "completed_workflow",
            "durable_child",
            "received_message",
            "work_tree",
            "work_inspection"
        ])
    );
    for name in [
        "sdk_module_template",
        "sdk_work_attached_targets",
        "sdk_work_task",
        "agent_messages",
    ] {
        assert!(
            calls.contains(name),
            "missing successful invocation of {name}"
        );
    }
    assert!(kernel.store().children(run).await.unwrap().len() >= 2);
    let deployment = kernel.control().export(&release).await.unwrap();
    let nofy_agent_runtime::system::ProgramDefinition::Agent { definition } =
        &deployment.document.programs["main"]
    else {
        panic!("coordination entry must be an Agent");
    };
    let composed = deployment
        .document
        .modules
        .iter()
        .find(|module| {
            module.factory == "tool.compose"
                && definition.tool_packs.contains(&module.reference)
                && module.dependencies.get("tasks").is_some_and(|tasks| {
                    deployment.document.modules.iter().any(|candidate| {
                        &candidate.reference == tasks && candidate.factory == "tool.agent_tasks"
                    })
                })
        })
        .expect("executed task tool must be exported by the mounted composition");
    if let Ok(path) = std::env::var("NOFY_LIVE_COORDINATION_REPORT") {
        std::fs::write(path,serde_json::to_vec_pretty(&json!({
            "model":model,"run":run,"release":release,"output":output,"successful_tools":calls,"verified":verified,"composed_entry":composed,
            "factories":["tool.sdk_work","tool.sdk_authoring","tool.dynamic_assembly","resource.agent_tasks","binding.agent_tasks",
                "tool.agent_messages","tool.compose"]
        })).unwrap()).unwrap();
    }
    stop.cancel();
    worker.await.unwrap();
}
