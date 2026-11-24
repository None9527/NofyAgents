use super::{
    omni::{checked, publish_release, run_session, tool_call},
    *,
};
use nofy_agent_host::evolution::{EvolutionReceipt, Phase, Preauthorization, Probe};
use nofy_agent_runtime::control::Activation;

const PROPOSAL: &str = "Omni candidate v2. Keep short responses and return the requested marker.";

pub(super) async fn await_phase(host: &KernelHost, expected: Phase) -> EvolutionReceipt {
    tokio::time::timeout(Duration::from_secs(40), async {
        loop {
            if let Some(receipt) = host.evolution_receipt().await.unwrap() {
                if receipt.phase == expected {
                    return receipt;
                }
                assert!(
                    !matches!(
                        receipt.phase,
                        Phase::Rejected | Phase::Superseded | Phase::Accepted | Phase::RolledBack
                    ),
                    "{receipt:?}"
                );
            }
            tokio::time::sleep(Duration::from_millis(40)).await;
        }
    })
    .await
    .unwrap_or_else(|_| panic!("Omni evolution did not reach {expected:?}"))
}

#[tokio::test(flavor = "multi_thread", worker_threads = 3)]
async fn omni_native_proposal_evaluates_activates_and_rolls_back_a_regression() {
    let allow_regression = Arc::new(tokio::sync::Notify::new());
    let regression = allow_regression.clone();
    let provider = serve(axum::Router::new().route(
        "/v1/chat/completions",
        axum::routing::post(move |axum::Json(body): axum::Json<Value>| {
            let regression = regression.clone();
            async move {
                let messages = body["messages"].as_array().unwrap();
                let candidate = messages
                    .iter()
                    .any(|message| message["role"] == "system" && message["content"] == PROPOSAL);
                let user = messages
                    .iter()
                    .find(|message| message["role"] == "user")
                    .unwrap();
                let text = user["content"].as_str().unwrap();
                let mut frames = None;
                let answer = match text {
                    "propose-evolution" if messages.last().unwrap()["role"] != "tool" => {
                        assert!(
                            body["tools"]
                                .as_array()
                                .unwrap()
                                .iter()
                                .any(|tool| tool["function"]["name"] == "sdk_propose_prompt")
                        );
                        frames = Some(tool_call(
                            "one-proposal",
                            "sdk_propose_prompt",
                            json!({"prompt":PROPOSAL}),
                        ));
                        ""
                    }
                    "propose-evolution" => "proposal submitted",
                    "quality-check" => {
                        assert!(body["tools"].as_array().is_none_or(Vec::is_empty));
                        "quality-ok"
                    }
                    "compatibility-check" if candidate => {
                        assert!(body["tools"].as_array().is_none_or(Vec::is_empty));
                        regression.notified().await;
                        "regression"
                    }
                    "compatibility-check" => "compatible",
                    "candidate-session" => {
                        assert!(candidate);
                        "candidate active"
                    }
                    "restored-session" => {
                        assert!(!candidate);
                        "baseline restored"
                    }
                    other => panic!("unexpected evaluator or session input {other:?}"),
                };
                let frames = frames.unwrap_or_else(|| {
                    nofy_test_support::sse::chat_completion_events_exact(answer, "test-model")
                });
                axum::response::Sse::new(futures::stream::iter(
                    frames.into_iter().map(Ok::<_, std::convert::Infallible>),
                ))
            }
        }),
    ))
    .await;
    let directory = tempfile::tempdir().unwrap();
    let kernel = host(directory.path()).await;
    let server = serve(kernel.router()).await;
    let sdk = engine(&server.url, ADMIN);
    let template = checked(&sdk, "project.template", json!({})).await;
    let source: Source = serde_json::from_value(template.data["source"].clone()).unwrap();
    let configured = checked(&sdk, "agent.configure", json!({"agent":"main","target":{"kind":"source","source":source,"expected_digest":source.digest().unwrap()},"settings":{
        "connection":{"base_url":format!("{}/v1/",provider.url),"models":["test-model"],"allow_insecure_http":true},"model":"test-model","model_settings":{"stream":true},"evolution_enabled":true
    }})).await;
    let release = publish_release(&sdk, &configured.data["source"]).await;
    let applied = checked(&sdk, "system.apply", json!({"command_id":"bootstrap-omni-for-evolution","system":"omni","release":release,"expected_generation":null})).await;
    let generation = applied.refs["generation"]
        .as_ref()
        .unwrap()
        .parse()
        .unwrap();
    let grant = Preauthorization {
        system: "omni".into(),
        baseline: Activation {
            release: release.clone(),
            generation,
        },
        evaluation: vec![Probe {
            input: "quality-check".into(),
            expected: "quality-ok".into(),
            baseline_expected: None,
            ..Default::default()
        }],
        observation: vec![Probe {
            input: "compatibility-check".into(),
            expected: "compatible".into(),
            baseline_expected: None,
            ..Default::default()
        }],
        cost_limits: None,
    };
    let kernel = kernel.with_evolution(grant.clone()).unwrap();
    let stop = tokio_util::sync::CancellationToken::new();
    let worker = tokio::spawn({
        let kernel = kernel.clone();
        let stop = stop.clone();
        async move { kernel.run_worker(stop, 3).await.unwrap() }
    });
    run_session(&sdk, &release, "propose-evolution").await;

    let observed = await_phase(&kernel, Phase::Observe).await;
    let activated = observed.activation.as_ref().unwrap();
    assert_eq!(activated.previous.as_ref(), Some(&grant.baseline));
    assert_eq!(activated.active.generation, generation + 1);
    assert_eq!(
        observed.evidence.iter().filter(|case| case.matched).count(),
        3
    );
    assert!(observed.evaluation_digest.is_some());
    let active = checked(&sdk, "system.active", json!({"system":"omni"})).await;
    assert_eq!(
        active.refs["release"].as_deref(),
        Some(activated.active.release.as_str())
    );
    let canary = run_session(&sdk, &activated.active.release, "candidate-session").await;
    assert_eq!(
        canary.pointer("/execution/outcome/Completed/output"),
        Some(&json!("candidate active"))
    );

    allow_regression.notify_one();
    let finished = await_phase(&kernel, Phase::RolledBack).await;
    assert_eq!(finished.evidence.last().unwrap().phase, Phase::Observe);
    assert!(!finished.evidence.last().unwrap().matched);
    let rollback = finished.rollback.as_ref().unwrap();
    assert_eq!(rollback.previous.as_ref(), Some(&activated.active));
    assert_eq!(rollback.active.release, release);
    assert_eq!(rollback.active.generation, generation + 2);
    let restored = run_session(&sdk, &rollback.active.release, "restored-session").await;
    assert_eq!(
        restored.pointer("/execution/outcome/Completed/output"),
        Some(&json!("baseline restored"))
    );
    assert_eq!(kernel.control().history("omni").await.unwrap().len(), 3);
    stop.cancel();
    worker.await.unwrap();
    let reopened = host(directory.path()).await.with_evolution(grant).unwrap();
    assert_eq!(
        reopened.evolution_receipt().await.unwrap().unwrap().phase,
        Phase::RolledBack
    );
    assert_eq!(
        reopened.control().load_active("omni").await.unwrap().0,
        rollback.active
    );
}
