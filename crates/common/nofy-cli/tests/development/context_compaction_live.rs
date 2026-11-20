use super::{
    omni::{checked, publish_release},
    *,
};
use nofy_agent_runtime::{Message, RunOutcome, events::RunEvent, supervisor::ExecutionRecord};

const FACT: &str = "ORBITAL-4729-QUARTZ";
const RECENT: &str = "PINE-3197";
const ROOT: &str = "omni-compaction-root";

async fn completed(host: &KernelHost, id: &str) -> ExecutionRecord {
    tokio::time::timeout(Duration::from_secs(480), async {
        loop {
            if let Some(record) = host.store().execution_record(id).await.unwrap() {
                if matches!(record.outcome, Some(RunOutcome::Completed { .. })) {
                    return record;
                }
                assert_eq!(record.status, "running", "{id}: {:?}", record.error);
            }
            tokio::time::sleep(Duration::from_millis(100)).await;
        }
    })
    .await
    .expect("model-backed session turn deadline")
}

async fn turn(
    sdk: &Engine,
    source: &str,
    id: &str,
    input: &str,
    attachments: &[Value],
    revision: &Value,
) -> Value {
    let command = json!({"command_id":id,"source_run_id":source,"expected_source_revision":0,
        "turn":{"kind":"new","run_id":id,"input":{"text":input,"attachments":attachments}}});
    let receipt = checked(
        sdk,
        "session.turn",
        json!({"session_id":ROOT,"expected_session_revision":revision,
        "request_json":command.to_string()}),
    )
    .await;
    receipt.data["session_revision"].clone()
}

async fn live_case(endpoint: &str, model: &str, manual: bool, full_window: bool) -> Value {
    let directory = tempfile::tempdir().unwrap();
    let kernel = host(directory.path()).await;
    let server = serve(kernel.router()).await;
    let sdk = engine(&server.url, ADMIN);
    let template = checked(&sdk, "project.template", json!({})).await;
    let source: Source = serde_json::from_value(template.data["source"].clone()).unwrap();
    let context_window = if manual || full_window { 262144 } else { 1024 };
    let inspect_after_compaction = manual || full_window;
    let tools = if inspect_after_compaction {
        ["sdk_work_inspect"]
    } else {
        ["unused_compaction_fixture_tool"]
    };
    let configured = checked(&sdk,"agent.configure",json!({"agent":"main","target":{"kind":"source","source":source,
        "expected_digest":source.digest().unwrap()},"settings":{"connection":{"base_url":endpoint,"models":[model],
        "allow_insecure_http":true,"timeout_ms":420000},"model":model,"model_settings":{"stream":true,"max_output_tokens":128},
        "allowed_tools":tools,
        "context_window":context_window,"compaction_threshold_percent":75,"compaction_keep_turns":1}})).await;
    let release = if manual {
        let build = checked(
            &sdk,
            "agent.build",
            json!({"agent":"main","target":{"kind":"source","source":configured.data["source"]}}),
        )
        .await;
        let mut deployment: Value =
            serde_json::from_str(build.data["deployment_json"].as_str().unwrap()).unwrap();
        assert!(
            !deployment["system"]["required_governance"]
                .as_array()
                .unwrap()
                .is_empty()
        );
        deployment["system"]["required_governance"] = json!([]);
        let published = checked(
            &sdk,
            "system.publish",
            json!({"document_json":deployment.to_string()}),
        )
        .await;
        published.refs["release"].clone().unwrap()
    } else {
        publish_release(&sdk, &configured.data["source"]).await
    };
    let stop = tokio_util::sync::CancellationToken::new();
    let worker = tokio::spawn({
        let kernel = kernel.clone();
        let stop = stop.clone();
        async move { kernel.run_worker(stop, 2).await.unwrap() }
    });

    let filler = if full_window {
        String::new()
    } else {
        " The neutral queue has no special properties and its entries are all already archived."
            .repeat(150)
    };
    let input = format!(
        "The project identifier is exactly {FACT}. Remember it for this session. Ignore the following filler. Reply OK.\n{filler}"
    );
    let attachments = |repeats| -> Vec<Value> {
        if full_window {
            vec![json!({"type":"text","text":" cedar".repeat(repeats)}); 8]
        } else {
            Vec::new()
        }
    };
    let request = json!({"run_id":ROOT,"thread_id":ROOT,"system":"omni","release":release,"program":"main",
        "input":{"text":input,"attachments":attachments(10_800)}});
    let started = checked(
        &sdk,
        "session.start",
        json!({"session_id":ROOT,"command_id":ROOT,"expected_session_revision":null,
        "request_json":request.to_string()}),
    )
    .await;
    completed(&kernel, ROOT).await;
    let recent_text = format!(
        "The latest review code is {RECENT}. Preserve it along with the earlier project identifier. Reply OK."
    );
    let revision = turn(
        &sdk,
        ROOT,
        "compaction-recent",
        &recent_text,
        &attachments(6150),
        &started.data["session_revision"],
    )
    .await;
    let before = completed(&kernel, "compaction-recent").await;
    let goal = if inspect_after_compaction {
        format!(
            "Use sdk_work_inspect with run_id and work_id both equal to {ROOT} to verify the original session turn completed. Then return the earlier project identifier and the latest review code joined by |, without any other text."
        )
    } else {
        "Return the earlier project identifier and the latest review code joined by |, without any other text.".into()
    };
    let final_text = if manual {
        format!("/compact {goal}")
    } else {
        goal
    };
    turn(
        &sdk,
        "compaction-recent",
        "compaction-final",
        &final_text,
        &[],
        &revision,
    )
    .await;
    let result = completed(&kernel, "compaction-final").await;
    let Some(RunOutcome::Completed { output, state }) = result.outcome else {
        unreachable!()
    };
    let Some(RunOutcome::Completed {
        state: before_state,
        ..
    }) = before.outcome
    else {
        unreachable!()
    };
    let summary = state
        .messages
        .iter()
        .find_map(|message| match message {
            Message::Assistant { content: text, .. } if text.starts_with("[Compacted history]") => {
                Some(text)
            }
            _ => None,
        })
        .unwrap_or_else(|| panic!("no persisted compaction: {output}"));
    assert!(summary.contains(FACT), "{summary}");
    assert!(
        state
            .messages
            .iter()
            .any(|message| matches!(message,Message::User{content} if content==&final_text))
    );
    let before_bytes = serde_json::to_vec(&before_state.messages).unwrap().len();
    let after_bytes = serde_json::to_vec(&state.messages).unwrap().len();
    assert!(
        after_bytes < before_bytes / 2,
        "{before_bytes} -> {after_bytes}"
    );
    let mut cursor = 0;
    let mut receipts = Vec::new();
    let mut inspection_call = None;
    let mut inspection = None;
    loop {
        let events = kernel
            .store()
            .events("compaction-final", cursor, 1000)
            .await
            .unwrap();
        for envelope in &events {
            cursor = envelope.cursor;
            if let RunEvent::ModelUsage {
                input_tokens,
                output_tokens,
                info,
            } = &envelope.event
                && info.provider["purpose"] == "context_compaction"
            {
                assert!(*input_tokens > 0 && *output_tokens > 0);
                receipts.push(json!({"cursor":cursor,"input_tokens":input_tokens,"output_tokens":output_tokens}));
            }
            match &envelope.event {
                RunEvent::ToolStarted { call } if call.name == "sdk_work_inspect" => {
                    if call.arguments["run_id"] == ROOT && call.arguments["work_id"] == ROOT {
                        inspection_call = Some(call.id.clone());
                    }
                }
                RunEvent::ToolCompleted {
                    call_id,
                    result,
                    is_error: false,
                } if inspection_call.as_ref() == Some(call_id)
                    && result["value"]["work_id"] == ROOT
                    && result["value"]["status"] == "completed" =>
                {
                    inspection = Some(json!({"cursor":cursor,"work":result["value"]}));
                }
                _ => {}
            }
        }
        if events.len() < 1000 {
            break;
        }
    }
    assert_eq!(receipts.len(), 1);
    if inspect_after_compaction {
        let work = inspection
            .as_ref()
            .expect("same-session inspection after compaction");
        assert!(work["cursor"].as_u64().unwrap() > receipts[0]["cursor"].as_u64().unwrap());
        assert!(
            !kernel
                .store()
                .work_scope_allows(ROOT, "compaction-final")
                .await
                .unwrap()
        );
    }
    let budgets = kernel.store().budget_page("", 32).await.unwrap().ledgers;
    if manual {
        assert!(budgets.is_empty(), "journal-only case used a budget ledger");
    } else {
        assert!(
            budgets.iter().any(|entry| {
                entry.spec.scope.root_run_id == ROOT
                    && entry.used.model_calls >= 4
                    && entry.used.input_tokens > receipts[0]["input_tokens"].as_u64().unwrap()
                    && entry.active_operations == 0
            }),
            "no settled session model budget: {budgets:?}"
        );
    }
    if full_window {
        assert!(before_bytes > 262_144 * 4 * 75 / 100);
        assert!(receipts[0]["input_tokens"].as_u64().unwrap() > 80_000);
    }
    assert_eq!(output.trim(), format!("{FACT}|{RECENT}"));
    stop.cancel();
    worker.await.unwrap();
    json!({"mode":if manual {"manual"} else {"automatic"},"context_window":context_window,"journal_only":manual,"release":release,
        "run":"compaction-final","before_bytes":before_bytes,"after_bytes":after_bytes,"summary":summary,
        "output":output,"sampling_receipts":receipts,"work_inspection":inspection,"budget_ledgers":budgets})
}

#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
#[ignore = "requires a real local model"]
async fn omni_preserves_facts_across_live_manual_and_automatic_compaction() {
    let endpoint = std::env::var("NOFY_LIVE_MODEL_URL").unwrap();
    let model = std::env::var("NOFY_LIVE_MODEL").unwrap();
    let cases = [
        live_case(&endpoint, &model, true, false).await,
        live_case(&endpoint, &model, false, false).await,
    ];
    let report = json!({"model":model,"factories":["context.programmed","binding.model_journal","governance.budget_connected","resource.budget"],"cases":cases});
    if let Ok(path) = std::env::var("NOFY_LIVE_COMPACTION_REPORT") {
        std::fs::write(path, serde_json::to_vec_pretty(&report).unwrap()).unwrap();
    }
    eprintln!("{report}");
}

#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
#[ignore = "requires a real local model with a 262144-token context"]
async fn omni_compacts_automatically_at_live_full_context_window() {
    let endpoint = std::env::var("NOFY_LIVE_MODEL_URL").unwrap();
    let model = std::env::var("NOFY_LIVE_MODEL").unwrap();
    let case = live_case(&endpoint, &model, false, true).await;
    let report = json!({"model":model,"factories":["context.programmed"],"cases":[case]});
    if let Ok(path) = std::env::var("NOFY_LIVE_COMPACTION_REPORT") {
        std::fs::write(path, serde_json::to_vec_pretty(&report).unwrap()).unwrap();
    }
    eprintln!("{report}");
}
