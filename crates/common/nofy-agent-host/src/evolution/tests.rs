use super::*;
use crate::{auth::Authorizer, native};
use nofy_agent_runtime::credentials::EnvironmentCredentials;

#[cfg(unix)]
#[tokio::test]
async fn journal_reopens_from_the_resolved_state_directory() {
    let dir = tempfile::tempdir().unwrap();
    let parent = dir.path().join("parent");
    let alias = dir.path().join("alias");
    std::fs::create_dir(&parent).unwrap();
    std::os::unix::fs::symlink(&parent, &alias).unwrap();
    let credentials =
        Arc::new(EnvironmentCredentials::new("evolution", "NOFY_EVOLUTION_TEST_").unwrap());
    let registry = native::registry(credentials).unwrap();

    let host = KernelHost::open(
        &alias.join("state"),
        registry.clone(),
        Authorizer::development(),
    )
    .await
    .unwrap();
    let journal = &host.evolution.journal;
    journal.initialize().unwrap();
    journal
        .save("proposal", "grant", None, "receipt".into())
        .await
        .unwrap();
    drop(host);

    let host = KernelHost::open(&parent.join("state"), registry, Authorizer::development())
        .await
        .unwrap();
    assert_eq!(
        host.evolution.journal.load("proposal").await.unwrap(),
        Some((1, "grant".into(), "receipt".into()))
    );
}

async fn publish(host: &KernelHost, version: &str) -> String {
    let reference = json!({"id":"sdk","version":version});
    let doc = serde_json::from_value(json!({
        "schema_version":1,"name":"omni",
        "modules":[{"reference":reference,"factory":"tool.sdk_authoring","config":{}}],
        "programs":{"main":{"kind":"tool","definition":{"name":"inspect","tool_packs":[reference]},"call":{"id":"inspect","name":"sdk_schema","arguments":{"operation":"describe"}}}}
    })).unwrap();
    host.control
        .install_file(SystemFile::Source(doc))
        .await
        .unwrap()
        .bundle
        .digest
}

#[tokio::test]
async fn replays_a_committed_activation_and_fences_rollback_after_a_newer_release() {
    let dir = tempfile::tempdir().unwrap();
    let credentials =
        Arc::new(EnvironmentCredentials::new("evolution", "NOFY_EVOLUTION_TEST_").unwrap());
    let host = KernelHost::open(
        &dir.path().join("state"),
        native::registry(credentials).unwrap(),
        Authorizer::development(),
    )
    .await
    .unwrap();
    let baseline = publish(&host, "baseline").await;
    let candidate = publish(&host, "candidate").await;
    let newer = publish(&host, "operator-update").await;
    let activation = host
        .control
        .apply(ApplyCommand {
            command_id: "original".into(),
            system: "omni".into(),
            release: baseline.clone(),
            expected_generation: None,
        })
        .await
        .unwrap();
    let case = Probe {
        input: "check".into(),
        expected: "ok".into(),
        baseline_expected: None,
        ..Default::default()
    };
    let host = host
        .with_evolution(Preauthorization {
            system: "omni".into(),
            baseline: activation.active.clone(),
            evaluation: vec![case.clone()],
            observation: vec![case],
            cost_limits: None,
        })
        .unwrap();
    let grant = host.evolution.grant.get().unwrap();
    let ready = EvolutionReceipt {
        proposal: "proposal".into(),
        author_run: "source-run".into(),
        policy_digest: grant.digest.clone(),
        baseline: activation.active,
        candidate_release: Some(candidate),
        phase: Phase::Activate,
        evidence: vec![],
        evaluation_digest: Some(content_digest(&Vec::<Evidence>::new()).unwrap()),
        activation: None,
        rollback: None,
        failure: None,
    };
    let mut applied = ready.clone();
    host.evolution
        .apply(&host, grant, &mut applied)
        .await
        .unwrap();
    // Re-entry sees the original ready state when the host loses the journal
    // write after ControlPlane has already committed the activation.
    let mut replay = ready;
    host.evolution
        .apply(&host, grant, &mut replay)
        .await
        .unwrap();
    assert_eq!(applied.activation, replay.activation);
    assert_eq!(host.control.history("omni").await.unwrap().len(), 2);

    let intervening = host
        .control
        .apply(ApplyCommand {
            command_id: "operator-update".into(),
            system: "omni".into(),
            release: newer,
            expected_generation: Some(replay.activation.as_ref().unwrap().active.generation),
        })
        .await
        .unwrap();
    replay.phase = Phase::Rollback;
    host.evolution
        .apply(&host, grant, &mut replay)
        .await
        .unwrap();
    assert_eq!(replay.phase, Phase::Superseded);
    assert!(replay.rollback.is_none());
    assert_eq!(
        host.control.load_active("omni").await.unwrap().0,
        intervening.active
    );
    assert_eq!(host.control.history("omni").await.unwrap().len(), 3);
}

#[test]
fn legacy_preauthorization_json_round_trips_and_preserves_exact_serialization() {
    let release = "a".repeat(64);
    let legacy = json!({
        "system": "omni",
        "baseline": { "release": release, "generation": 1 },
        "evaluation": [
            { "input": "quality-check", "expected": "quality-ok", "baseline_expected": "old" }
        ],
        "observation": [
            { "input": "compat-check", "expected": "compatible" }
        ]
    });
    let parsed: Preauthorization = serde_json::from_value(legacy.clone()).unwrap();
    parsed.validate().unwrap();
    let encoded = serde_json::to_value(&parsed).unwrap();
    assert_eq!(
        encoded, legacy,
        "legacy JSON must serialize identically with zero new default keys"
    );
    assert_eq!(
        content_digest(&parsed).unwrap(),
        content_digest(&legacy).unwrap()
    );
}

#[test]
fn structured_assertions_validate_and_evaluate_contains_not_contains_and_json_fields() {
    let assertion = ProbeAssertion {
        exact: None,
        contains: vec!["\"status\"".into(), "ready".into()],
        not_contains: vec!["ERROR".into(), "TODO".into()],
        json_fields: BTreeMap::from([
            ("status".into(), json!("ready")),
            ("/meta/version".into(), json!(2)),
            ("/flags/safe".into(), json!(true)),
        ]),
    };
    assertion.validate().unwrap();

    let passing = r#"{"status":"ready","meta":{"version":2},"flags":{"safe":true}}"#;
    assert!(assertion.check(passing).is_ok());

    // Missing required substring
    let missing = r#"{"status":"pending","meta":{"version":2},"flags":{"safe":true}}"#;
    assert!(assertion.check(missing).is_err());

    // Forbidden substring triggers regression rejection
    let forbidden =
        r#"{"status":"ready","meta":{"version":2},"flags":{"safe":true},"note":"TODO fix"}"#;
    assert!(
        assertion
            .check(forbidden)
            .unwrap_err()
            .contains("forbidden substring")
    );

    // Nested JSON pointer mismatch
    let wrong_version = r#"{"status":"ready","meta":{"version":1},"flags":{"safe":true}}"#;
    assert!(
        assertion
            .check(wrong_version)
            .unwrap_err()
            .contains("/meta/version")
    );

    // Non-JSON rejected when json_fields declared (passes contains first)
    assert!(
        assertion
            .check(r#"not-json "status" ready"#)
            .unwrap_err()
            .contains("not valid JSON")
    );

    // Invalid empty assertion and ambiguous Probe rejected by validate()
    assert!(ProbeAssertion::default().validate().is_err());
    let ambiguous = Probe {
        input: "q".into(),
        expected: "ok".into(),
        assertion: Some(assertion.clone()),
        ..Default::default()
    };
    assert!(ambiguous.validate().is_err());
    let duplicate_input = Probe {
        input: "q".into(),
        turns: vec!["q1".into()],
        expected: "ok".into(),
        ..Default::default()
    };
    assert!(duplicate_input.validate().is_err());
}

#[test]
fn cost_limits_gate_tokens_tool_calls_and_steps_for_candidate_and_observe() {
    use nofy_agent_runtime::{Message, RunState, ToolCall};

    let state = RunState {
        messages: vec![
            Message::System {
                content: "sys".into(),
            },
            Message::User {
                content: "q".into(),
            },
            Message::Assistant {
                content: String::new(),
                tool_calls: vec![ToolCall {
                    id: "c1".into(),
                    name: "search".into(),
                    arguments: json!({}),
                }],
            },
            Message::Tool {
                call_id: "c1".into(),
                content: json!({"ok": true}),
                is_error: false,
            },
            Message::Assistant {
                content: "exact-answer".into(),
                tool_calls: vec![],
            },
        ],
        steps: 2,
        input_tokens: 90,
        output_tokens: 45,
        ..Default::default()
    };
    let metrics = probe::extract_metrics(&state, 1, 2);
    assert_eq!(
        metrics,
        ProbeMetrics {
            input_tokens: 90,
            output_tokens: 45,
            total_tokens: 135,
            tool_calls: 1,
            steps: 3,
            turns: 2,
        }
    );

    let case = Probe {
        input: "q".into(),
        expected: "exact-answer".into(),
        ..Default::default()
    };

    // Baseline does not fail on candidate cost ceilings, allowing bloated baselines to evolve.
    let strict_tools = Some(CostLimits {
        max_tool_calls: Some(0),
        ..Default::default()
    });
    assert!(
        probe::evaluate_turn(
            &case,
            Phase::Baseline,
            0,
            "exact-answer",
            &metrics,
            strict_tools
        )
        .is_ok()
    );

    // Candidate & Observe reject when ANY budget ceiling is breached even if the answer is exact.
    for (phase, limits, expected_err) in [
        (
            Phase::Candidate,
            CostLimits {
                max_total_tokens: Some(100),
                ..Default::default()
            },
            "max_total_tokens",
        ),
        (
            Phase::Candidate,
            CostLimits {
                max_output_tokens: Some(40),
                ..Default::default()
            },
            "max_output_tokens",
        ),
        (
            Phase::Candidate,
            CostLimits {
                max_tool_calls: Some(0),
                ..Default::default()
            },
            "max_tool_calls",
        ),
        (
            Phase::Observe,
            CostLimits {
                max_steps: Some(2),
                ..Default::default()
            },
            "max_steps",
        ),
    ] {
        limits.validate().unwrap();
        let err = probe::evaluate_turn(&case, phase, 0, "exact-answer", &metrics, Some(limits))
            .unwrap_err();
        assert!(err.contains(expected_err), "unexpected error: {err}");
    }

    // Merge selects the stricter bound from global + probe limits.
    let merged = CostLimits::merge(
        Some(CostLimits {
            max_total_tokens: Some(500),
            max_output_tokens: Some(200),
            max_tool_calls: Some(2),
            max_steps: Some(4),
        }),
        Some(CostLimits {
            max_total_tokens: Some(300),
            max_output_tokens: Some(250),
            max_tool_calls: Some(0),
            max_steps: None,
        }),
    )
    .unwrap();
    assert_eq!(
        merged,
        CostLimits {
            max_total_tokens: Some(300),
            max_output_tokens: Some(200),
            max_tool_calls: Some(0),
            max_steps: Some(4),
        }
    );
    assert!(CostLimits::default().validate().is_err());
    assert!(
        CostLimits {
            max_total_tokens: Some(0),
            ..Default::default()
        }
        .validate()
        .is_err()
    );
}

type MockResponder = Arc<
    dyn Fn(&nofy_agent_runtime::ModelRequest) -> nofy_agent_runtime::ModelResponse + Send + Sync,
>;

struct MockModel(MockResponder);

#[async_trait::async_trait]
impl nofy_agent_runtime::Model for MockModel {
    async fn complete(
        &self,
        request: nofy_agent_runtime::ModelRequest,
        _: &nofy_agent_runtime::RunContext,
    ) -> std::result::Result<nofy_agent_runtime::ModelResponse, nofy_agent_runtime::Error> {
        Ok((self.0)(&request))
    }
}

async fn setup_eval_host(
    dir: &std::path::Path,
    baseline_prompt: &str,
    responder: MockResponder,
) -> (KernelHost, Activation) {
    use nofy_agent_runtime::registry::{
        InstanceFactory, ModuleInstance, ModuleRegistry, StaticPromptFactory,
    };

    let mut registry = ModuleRegistry::default();
    registry
        .register_factory(Arc::new(StaticPromptFactory))
        .unwrap();
    registry
        .register_factory(Arc::new(InstanceFactory::new(
            "model.programmed",
            "1",
            ModuleInstance::Model(Arc::new(MockModel(responder))),
        )))
        .unwrap();
    let host = KernelHost::open(&dir.join("state"), registry, Authorizer::development())
        .await
        .unwrap();
    let doc = serde_json::from_value(json!({
        "schema_version": 1,
        "name": "omni",
        "modules": [
            {"reference": {"id": "model", "version": "1"}, "factory": "model.programmed", "config": {}},
            {"reference": {"id": "prompt", "version": "1"}, "factory": "prompt.static", "config": {"text": baseline_prompt}},
            {"reference": {"id": "evo", "version": "1"}, "factory": "tool.sdk_evolution", "config": {}}
        ],
        "programs": {
            "main": {
                "kind": "agent",
                "definition": {
                    "name": "omni",
                    "model": {"id": "model", "version": "1"},
                    "prompt": {"id": "prompt", "version": "1"},
                    "tool_packs": [{"id": "evo", "version": "1"}]
                }
            }
        }
    }))
    .unwrap();
    let release = host
        .control
        .install_file(SystemFile::Source(doc))
        .await
        .unwrap()
        .bundle
        .digest;
    let activation = host
        .control
        .apply(ApplyCommand {
            command_id: "bootstrap".into(),
            system: "omni".into(),
            release,
            expected_generation: None,
        })
        .await
        .unwrap();
    (host, activation.active)
}

async fn submit_proposal_and_run(
    host: &KernelHost,
    baseline: &Activation,
    candidate_prompt: &str,
) -> EvolutionReceipt {
    use nofy_agent_runtime::supervisor::jobs::ManagedRunRequest;
    use nofy_interjection_core::PendingInterjection;

    let bundle = host.control.export(&baseline.release).await.unwrap();
    let compiled =
        nofy_agent_runtime::system::compile_system(bundle.document, &host.registry).unwrap();
    let author_run = "author-run-1".to_owned();
    host.supervisor
        .submit_managed(
            ManagedRunRequest {
                approval_mode: None,
                run_id: author_run.clone(),
                thread_id: author_run.clone(),
                system: "omni".into(),
                release: baseline.release.clone(),
                program: "main".into(),
                input: Some(PendingInterjection {
                    text: "author-task".into(),
                    attachments: vec![],
                }),
                parameters: None,
            },
            &compiled,
        )
        .await
        .unwrap();
    host.evolution
        .propose(&author_run, candidate_prompt.into())
        .await
        .unwrap();

    let stop = tokio_util::sync::CancellationToken::new();
    let worker = tokio::spawn({
        let host = host.clone();
        let stop = stop.clone();
        async move { host.run_worker(stop, 2).await.unwrap() }
    });
    let receipt = tokio::time::timeout(std::time::Duration::from_secs(15), async {
        loop {
            if let Some(receipt) = host.evolution_receipt().await.unwrap()
                && matches!(
                    receipt.phase,
                    Phase::Accepted | Phase::Rejected | Phase::RolledBack | Phase::Superseded
                )
            {
                return receipt;
            }
            tokio::time::sleep(std::time::Duration::from_millis(20)).await;
        }
    })
    .await
    .expect("evolution worker should reach a terminal phase");
    stop.cancel();
    worker.await.unwrap();
    receipt
}

#[tokio::test]
async fn multi_turn_structured_assertions_accept_candidate_within_cost_budget() {
    use nofy_agent_runtime::{Message, ModelResponse};

    let dir = tempfile::tempdir().unwrap();
    let baseline_prompt = "omni baseline v1";
    let candidate_prompt = "omni candidate v2 structured";
    let responder: MockResponder = Arc::new(move |request| {
        let is_candidate = request
            .messages
            .iter()
            .any(|msg| matches!(msg, Message::System { content } if content == candidate_prompt));
        let user_turns: Vec<&str> = request
            .messages
            .iter()
            .filter_map(|msg| match msg {
                Message::User { content } => Some(content.as_str()),
                _ => None,
            })
            .collect();
        let last_user = user_turns.last().copied().unwrap_or_default();
        let output = match last_user {
            "author-task" => "authored".into(),
            "turn-1:plan" => {
                if is_candidate {
                    "ACK step 1 ready".into()
                } else {
                    "BASELINE step 1".into()
                }
            }
            "turn-2:finalize" => {
                // Verify real multi-turn history persisted across the shared probe thread.
                assert_eq!(user_turns, vec!["turn-1:plan", "turn-2:finalize"]);
                assert!(request.messages.iter().any(|msg| matches!(
                    msg,
                    Message::Assistant { content, .. } if content.contains("step 1")
                )));
                if is_candidate {
                    r#"{"status":"ready","meta":{"turn":2,"mode":"structured"}}"#.into()
                } else {
                    r#"{"status":"legacy","meta":{"turn":2}}"#.into()
                }
            }
            "observe-check" => "healthy ok".into(),
            other => panic!("unexpected mock prompt input: {other:?}"),
        };
        ModelResponse {
            output,
            input_tokens: 20,
            output_tokens: 15,
            ..Default::default()
        }
    });

    let (host, baseline) = setup_eval_host(dir.path(), baseline_prompt, responder).await;
    let grant = Preauthorization {
        system: "omni".into(),
        baseline: baseline.clone(),
        evaluation: vec![Probe {
            turns: vec!["turn-1:plan".into(), "turn-2:finalize".into()],
            turn_assertions: vec![
                Some(ProbeAssertion {
                    contains: vec!["ACK".into(), "step 1".into()],
                    not_contains: vec!["ERROR".into()],
                    ..Default::default()
                }),
                None,
            ],
            baseline_turn_assertions: vec![
                Some(ProbeAssertion {
                    contains: vec!["BASELINE".into()],
                    ..Default::default()
                }),
                None,
            ],
            assertion: Some(ProbeAssertion {
                contains: vec!["structured".into()],
                not_contains: vec!["TODO".into(), "ERROR".into()],
                json_fields: BTreeMap::from([
                    ("status".into(), json!("ready")),
                    ("/meta/turn".into(), json!(2)),
                ]),
                ..Default::default()
            }),
            baseline_assertion: Some(ProbeAssertion {
                json_fields: BTreeMap::from([("status".into(), json!("legacy"))]),
                ..Default::default()
            }),
            cost_limits: Some(CostLimits {
                max_total_tokens: Some(100),
                max_output_tokens: Some(40),
                max_tool_calls: Some(0),
                max_steps: Some(2),
            }),
            ..Default::default()
        }],
        observation: vec![Probe {
            input: "observe-check".into(),
            assertion: Some(ProbeAssertion {
                contains: vec!["healthy".into(), "ok".into()],
                not_contains: vec!["panic".into()],
                ..Default::default()
            }),
            ..Default::default()
        }],
        cost_limits: Some(CostLimits {
            max_total_tokens: Some(120),
            ..Default::default()
        }),
    };
    let host = host.with_evolution(grant).unwrap();
    let receipt = submit_proposal_and_run(&host, &baseline, candidate_prompt).await;

    assert_eq!(receipt.phase, Phase::Accepted, "{receipt:?}");
    assert!(receipt.activation.is_some());
    assert_eq!(receipt.evidence.len(), 4);
    assert!(receipt.evidence.iter().all(|item| item.matched));
    let candidate_ev = receipt
        .evidence
        .iter()
        .find(|item| item.phase == Phase::Candidate)
        .unwrap();
    let metrics = candidate_ev.metrics.unwrap();
    assert_eq!(metrics.turns, 2);
    assert_eq!(metrics.steps, 2);
    assert_eq!(metrics.input_tokens, 40);
    assert_eq!(metrics.output_tokens, 30);
    assert_eq!(metrics.total_tokens, 70);
    assert_eq!(metrics.tool_calls, 0);
}

#[tokio::test]
async fn cost_limit_red_line_rejects_bloated_candidate_despite_exact_answer() {
    use nofy_agent_runtime::{Message, ModelResponse};

    let dir = tempfile::tempdir().unwrap();
    let baseline_prompt = "omni baseline v1";
    let candidate_prompt = "omni candidate v2 bloated";
    let responder: MockResponder = Arc::new(move |request| {
        let is_candidate = request
            .messages
            .iter()
            .any(|msg| matches!(msg, Message::System { content } if content == candidate_prompt));
        let last_user = request
            .messages
            .iter()
            .rev()
            .find_map(|msg| match msg {
                Message::User { content } => Some(content.as_str()),
                _ => None,
            })
            .unwrap_or_default();
        let (output, input_tokens, output_tokens) = match last_user {
            "author-task" => ("authored", 10, 5),
            "cost-probe" if is_candidate => ("exact-ok", 80, 90),
            "cost-probe" => ("exact-ok", 200, 180),
            "obs-probe" => ("obs-ok", 10, 10),
            other => panic!("unexpected mock input: {other:?}"),
        };
        ModelResponse {
            output: output.into(),
            input_tokens,
            output_tokens,
            ..Default::default()
        }
    });

    let (host, baseline) = setup_eval_host(dir.path(), baseline_prompt, responder).await;
    let grant = Preauthorization {
        system: "omni".into(),
        baseline: baseline.clone(),
        evaluation: vec![Probe {
            input: "cost-probe".into(),
            expected: "exact-ok".into(),
            cost_limits: Some(CostLimits {
                max_output_tokens: Some(50),
                max_total_tokens: Some(150),
                ..Default::default()
            }),
            ..Default::default()
        }],
        observation: vec![Probe {
            input: "obs-probe".into(),
            expected: "obs-ok".into(),
            ..Default::default()
        }],
        cost_limits: None,
    };
    let host = host.with_evolution(grant).unwrap();
    let receipt = submit_proposal_and_run(&host, &baseline, candidate_prompt).await;

    assert_eq!(receipt.phase, Phase::Rejected, "{receipt:?}");
    assert!(receipt.activation.is_none());
    let failure = receipt.failure.as_deref().unwrap_or_default();
    assert!(
        failure.contains("max_total_tokens") || failure.contains("max_output_tokens"),
        "expected cost red-line failure reason, got: {failure}"
    );
    let last_ev = receipt.evidence.last().unwrap();
    assert_eq!(last_ev.phase, Phase::Candidate);
    assert!(!last_ev.matched);
    assert_eq!(last_ev.metrics.unwrap().output_tokens, 90);
    assert_eq!(last_ev.metrics.unwrap().total_tokens, 170);
    // Active release must remain pinned to baseline.
    assert_eq!(host.control.load_active("omni").await.unwrap().0, baseline);
}

#[tokio::test]
async fn multi_turn_step_red_line_rejects_candidate_exceeding_max_steps() {
    use nofy_agent_runtime::{Message, ModelResponse};

    let dir = tempfile::tempdir().unwrap();
    let baseline_prompt = "omni baseline v1";
    let candidate_prompt = "omni candidate v2 too many steps";
    let responder: MockResponder = Arc::new(move |request| {
        let last_user = request
            .messages
            .iter()
            .rev()
            .find_map(|msg| match msg {
                Message::User { content } => Some(content.as_str()),
                _ => None,
            })
            .unwrap_or_default();
        let output = match last_user {
            "author-task" => "authored",
            "t1" => "r1",
            "t2" => "r2",
            "obs" => "obs-ok",
            other => panic!("unexpected mock input: {other:?}"),
        };
        ModelResponse {
            output: output.into(),
            input_tokens: 10,
            output_tokens: 5,
            ..Default::default()
        }
    });

    let (host, baseline) = setup_eval_host(dir.path(), baseline_prompt, responder).await;
    let grant = Preauthorization {
        system: "omni".into(),
        baseline: baseline.clone(),
        evaluation: vec![Probe {
            turns: vec!["t1".into(), "t2".into()],
            expected: "r2".into(),
            cost_limits: Some(CostLimits {
                max_steps: Some(1),
                ..Default::default()
            }),
            ..Default::default()
        }],
        observation: vec![Probe {
            input: "obs".into(),
            expected: "obs-ok".into(),
            ..Default::default()
        }],
        cost_limits: None,
    };
    let host = host.with_evolution(grant).unwrap();
    let receipt = submit_proposal_and_run(&host, &baseline, candidate_prompt).await;

    assert_eq!(receipt.phase, Phase::Rejected, "{receipt:?}");
    assert!(receipt.activation.is_none());
    assert!(
        receipt
            .failure
            .as_deref()
            .unwrap_or_default()
            .contains("max_steps")
    );
    assert_eq!(host.control.load_active("omni").await.unwrap().0, baseline);
}

#[tokio::test]
async fn legacy_exact_probe_end_to_end_regression_accepts_candidate() {
    use nofy_agent_runtime::{Message, ModelResponse};

    let dir = tempfile::tempdir().unwrap();
    let baseline_prompt = "omni baseline v1";
    let candidate_prompt = "omni candidate v2 exact";
    let responder: MockResponder = Arc::new(move |request| {
        let is_candidate = request
            .messages
            .iter()
            .any(|msg| matches!(msg, Message::System { content } if content == candidate_prompt));
        let last_user = request
            .messages
            .iter()
            .rev()
            .find_map(|msg| match msg {
                Message::User { content } => Some(content.as_str()),
                _ => None,
            })
            .unwrap_or_default();
        let output = match last_user {
            "author-task" => "authored",
            "exact-eval" if is_candidate => "NEW_EXACT",
            "exact-eval" => "OLD_EXACT",
            "exact-obs" => "STABLE",
            other => panic!("unexpected mock input: {other:?}"),
        };
        ModelResponse {
            output: output.into(),
            input_tokens: 12,
            output_tokens: 8,
            ..Default::default()
        }
    });

    let (host, baseline) = setup_eval_host(dir.path(), baseline_prompt, responder).await;
    let grant = Preauthorization {
        system: "omni".into(),
        baseline: baseline.clone(),
        evaluation: vec![Probe {
            input: "exact-eval".into(),
            expected: "NEW_EXACT".into(),
            baseline_expected: Some("OLD_EXACT".into()),
            ..Default::default()
        }],
        observation: vec![Probe {
            input: "exact-obs".into(),
            expected: "STABLE".into(),
            baseline_expected: None,
            ..Default::default()
        }],
        cost_limits: None,
    };
    let host = host.with_evolution(grant).unwrap();
    let receipt = submit_proposal_and_run(&host, &baseline, candidate_prompt).await;

    assert_eq!(receipt.phase, Phase::Accepted, "{receipt:?}");
    let activated = receipt.activation.as_ref().unwrap();
    assert_eq!(activated.active.generation, baseline.generation + 1);
    assert_eq!(
        host.control.load_active("omni").await.unwrap().0,
        activated.active
    );
}
