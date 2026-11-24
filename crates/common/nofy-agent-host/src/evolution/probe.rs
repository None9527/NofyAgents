use super::*;
use nofy_agent_runtime::{
    Message, RunOutcome, RunState,
    durable::{Clock, SystemClock},
    mailbox::{InputAddress, MailboxSender},
    registry::{ModuleDefinition, ModuleRegistry},
    supervisor::jobs::ManagedRunRequest,
    system::{CompiledSystem, SystemDocument, compile_system},
};
use nofy_interjection_core::PendingInterjection;
use std::collections::{BTreeMap, BTreeSet};

fn is_zero_usize(value: &usize) -> bool {
    *value == 0
}

#[derive(Deserialize, Serialize)]
pub(super) struct Scheduled {
    run_id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    thread_id: Option<String>,
    evaluation_release: String,
    deadline_ms: u64,
    #[serde(default, skip_serializing_if = "is_zero_usize")]
    turn_index: usize,
    #[serde(default, skip_serializing_if = "is_zero_usize")]
    accumulated_steps: usize,
}

pub(super) fn extract_metrics(state: &RunState, prior_steps: usize, turns: usize) -> ProbeMetrics {
    let tool_calls = state
        .messages
        .iter()
        .filter_map(|message| match message {
            Message::Assistant { tool_calls, .. } => Some(tool_calls.len() as u64),
            _ => None,
        })
        .fold(0u64, u64::saturating_add);
    let total_tokens = state.input_tokens.saturating_add(state.output_tokens);
    ProbeMetrics {
        input_tokens: state.input_tokens,
        output_tokens: state.output_tokens,
        total_tokens,
        tool_calls,
        steps: prior_steps.saturating_add(state.steps),
        turns,
    }
}

pub(super) fn evaluate_turn(
    case: &Probe,
    phase: Phase,
    turn_index: usize,
    output: &str,
    metrics: &ProbeMetrics,
    cost_limits: Option<CostLimits>,
) -> std::result::Result<(), String> {
    for assertion in case.assertions_for_turn(phase, turn_index) {
        assertion.check(output)?;
    }
    if phase != Phase::Baseline
        && let Some(limits) = cost_limits
    {
        limits.check(metrics)?;
    }
    Ok(())
}

fn outcome_state(outcome: &RunOutcome) -> &RunState {
    match outcome {
        RunOutcome::Completed { state, .. }
        | RunOutcome::Paused { state, .. }
        | RunOutcome::Cancelled { state }
        | RunOutcome::BudgetExceeded { state } => state,
    }
}

fn probe_run_id(proposal: &str, phase: Phase, index: usize, turn_index: usize) -> Result<String> {
    if turn_index == 0 {
        Ok(format!(
            "omni-probe-{}",
            content_digest(&(proposal, phase, index))?
        ))
    } else {
        Ok(format!(
            "omni-probe-{}",
            content_digest(&(proposal, phase, index, turn_index))?
        ))
    }
}

pub(super) async fn advance(host: &KernelHost, grant: &Grant, job: &mut Job) -> Result<bool> {
    let receipt = &mut job.receipt;
    let phase = receipt.phase;
    let index = receipt
        .evidence
        .iter()
        .filter(|item| item.phase == phase)
        .count();
    let candidate = receipt
        .candidate_release
        .as_ref()
        .ok_or_else(|| HostError::Unavailable("Omni probe has no candidate release".into()))?;
    let (release, expected_active, case) = match phase {
        Phase::Baseline => (
            &receipt.baseline.release,
            &receipt.baseline,
            grant
                .config
                .evaluation
                .iter()
                .chain(&grant.config.observation)
                .nth(index),
        ),
        Phase::Candidate => (
            candidate,
            &receipt.baseline,
            grant.config.evaluation.get(index),
        ),
        Phase::Observe => (
            candidate,
            &receipt
                .activation
                .as_ref()
                .ok_or_else(|| {
                    HostError::Unavailable("Omni observation has no activation receipt".into())
                })?
                .active,
            grant.config.observation.get(index),
        ),
        _ => return Err(HostError::Unavailable("invalid Omni probe phase".into())),
    };
    let active = host
        .control
        .inspect()
        .await?
        .and_then(|catalog| catalog.data.active.get(&grant.config.system).cloned());
    if active.as_ref() != Some(expected_active) {
        receipt.phase = Phase::Superseded;
        receipt.failure = Some("the expected active generation changed".into());
        return Ok(true);
    }
    let Some(case) = case else {
        receipt.phase = match phase {
            Phase::Baseline => Phase::Candidate,
            Phase::Candidate => {
                receipt.evaluation_digest = Some(content_digest(&receipt.evidence)?);
                Phase::Activate
            }
            _ => Phase::Accepted,
        };
        return Ok(true);
    };
    let turns = case.effective_turns();
    let effective_limits = CostLimits::merge(grant.config.cost_limits, case.cost_limits);
    let Some(scheduled) = job.probe.as_ref() else {
        let original = host.control.export(release).await?;
        let registry = host.registry.clone();
        let compiled = tokio::task::spawn_blocking(move || {
            compile_probe(&original, &registry, effective_limits)
        })
        .await
        .map_err(|error| HostError::Unavailable(error.to_string()))?;
        let compiled = match compiled {
            Ok(compiled) => compiled,
            Err(HostError::Invalid(message)) if phase != Phase::Observe => {
                receipt.phase = Phase::Rejected;
                receipt.failure = Some(message);
                return Ok(true);
            }
            Err(error) => return Err(error),
        };
        let thread_id = probe_run_id(&receipt.proposal, phase, index, 0)?;
        let run_id = thread_id.clone();
        let request = ManagedRunRequest {
            approval_mode: None,
            run_id: run_id.clone(),
            thread_id: thread_id.clone(),
            system: compiled.bundle.document.name.clone(),
            release: compiled.bundle.digest.clone(),
            program: "main".into(),
            input: Some(PendingInterjection {
                text: turns[0].to_owned(),
                attachments: vec![],
            }),
            parameters: None,
        };
        host.supervisor.submit_managed(request, &compiled).await?;
        job.probe = Some(Scheduled {
            run_id,
            thread_id: Some(thread_id),
            evaluation_release: compiled.bundle.digest,
            deadline_ms: SystemClock.now_ms().saturating_add(60_000),
            turn_index: 0,
            accumulated_steps: 0,
        });
        return Ok(true);
    };
    let run_id = scheduled.run_id.clone();
    let thread_id = scheduled
        .thread_id
        .clone()
        .unwrap_or_else(|| run_id.clone());
    let turn_index = scheduled.turn_index;
    let accumulated_steps = scheduled.accumulated_steps;
    let evaluation_release = scheduled.evaluation_release.clone();
    let deadline_ms = scheduled.deadline_ms;

    let managed = host
        .store
        .managed_run(&run_id)
        .await?
        .ok_or_else(|| HostError::Unavailable("Omni probe request is missing".into()))?;
    if managed.request.release != evaluation_release {
        return Err(HostError::Unavailable("Omni probe release changed".into()));
    }
    let record = host.store.execution_record(&run_id).await?;
    let (outcome_label, output, metrics, failure_detail) =
        match record.as_ref().and_then(|record| record.outcome.as_ref()) {
            Some(RunOutcome::Completed { output, state }) => {
                let metrics = extract_metrics(state, accumulated_steps, turn_index + 1);
                let check = evaluate_turn(
                    case,
                    phase,
                    turn_index,
                    output.as_str(),
                    &metrics,
                    effective_limits,
                );
                (
                    "completed",
                    Some(output.as_str()),
                    Some(metrics),
                    check.err(),
                )
            }
            Some(other) => (
                "did_not_complete",
                None,
                Some(extract_metrics(
                    outcome_state(other),
                    accumulated_steps,
                    turn_index + 1,
                )),
                Some("probe run did not complete".into()),
            ),
            None if record
                .as_ref()
                .is_some_and(|record| record.status == "failed") =>
            {
                ("failed", None, None, Some("probe run failed".into()))
            }
            None if SystemClock.now_ms() >= deadline_ms => {
                if let Some(record) = record {
                    let address = InputAddress {
                        root_run_id: run_id.clone(),
                        run_id: run_id.clone(),
                        thread_id: record.thread_id,
                        agent: record.snapshot.name().into(),
                    };
                    host.store
                        .cancel(&address, &format!("{run_id}-timeout"))
                        .await?;
                } else {
                    host.supervisor.cancel_submitted(&run_id).await?;
                }
                ("timeout", None, None, Some("probe run timed out".into()))
            }
            None => return Ok(false),
        };

    if failure_detail.is_none() && turn_index + 1 < turns.len() {
        let next_turn = turn_index + 1;
        let original = host.control.export(release).await?;
        let registry = host.registry.clone();
        let compiled = tokio::task::spawn_blocking(move || {
            compile_probe(&original, &registry, effective_limits)
        })
        .await
        .map_err(|error| HostError::Unavailable(error.to_string()))??;
        if compiled.bundle.digest != evaluation_release {
            return Err(HostError::Unavailable("Omni probe release changed".into()));
        }
        let next_run_id = probe_run_id(&receipt.proposal, phase, index, next_turn)?;
        let request = ManagedRunRequest {
            approval_mode: None,
            run_id: next_run_id.clone(),
            thread_id: thread_id.clone(),
            system: compiled.bundle.document.name.clone(),
            release: compiled.bundle.digest.clone(),
            program: "main".into(),
            input: Some(PendingInterjection {
                text: turns[next_turn].to_owned(),
                attachments: vec![],
            }),
            parameters: None,
        };
        host.supervisor.submit_managed(request, &compiled).await?;
        job.probe = Some(Scheduled {
            run_id: next_run_id,
            thread_id: Some(thread_id),
            evaluation_release: compiled.bundle.digest,
            deadline_ms: SystemClock.now_ms().saturating_add(60_000),
            turn_index: next_turn,
            accumulated_steps: metrics.map_or(accumulated_steps, |m| m.steps),
        });
        return Ok(true);
    }

    let matched = failure_detail.is_none();
    receipt.evidence.push(Evidence {
        phase,
        release: release.clone(),
        run_id,
        outcome: outcome_label.into(),
        output_digest: output.map(|text| content_digest(&text)).transpose()?,
        matched,
        metrics,
        detail: failure_detail.clone(),
    });
    job.probe = None;
    if !matched {
        let reason = failure_detail.unwrap_or_else(|| "did not produce the expected result".into());
        receipt.failure = Some(format!(
            "{phase:?} probe {index} turn {turn_index} failed: {reason}"
        ));
        receipt.phase = if phase == Phase::Observe {
            Phase::Rollback
        } else {
            Phase::Rejected
        };
    }
    Ok(true)
}

fn compile_probe(
    bundle: &SystemBundle,
    registry: &ModuleRegistry,
    cost_limits: Option<CostLimits>,
) -> Result<CompiledSystem> {
    let Some(ProgramDefinition::Agent { definition }) = bundle.document.programs.get("main") else {
        return Err(HostError::Invalid("Omni probe needs the main Agent".into()));
    };
    // Copy only the trusted model and prompt dependency closure. The probe
    // has no tools, context sources, bindings, hooks, or external task data.
    let definitions: BTreeMap<_, _> = bundle
        .document
        .modules
        .iter()
        .map(|module| (&module.reference, module))
        .collect();
    let mut pending = vec![&definition.model, &definition.prompt];
    let mut seen = BTreeSet::new();
    let mut modules: Vec<ModuleDefinition> = Vec::new();
    while let Some(reference) = pending.pop() {
        if !seen.insert(reference) {
            continue;
        }
        let module = definitions
            .get(reference)
            .copied()
            .ok_or_else(|| HostError::Invalid("Omni probe module reference is missing".into()))?;
        if !matches!(
            module.factory.as_str(),
            "model.programmed"
                | "resource.model_connection"
                | "resource.model_protocol"
                | "resource.artifact"
                | "prompt.static"
        ) {
            return Err(HostError::Invalid(
                "Omni probes support the standard programmed model and static prompt only".into(),
            ));
        }
        pending.extend(module.dependencies.values());
        modules.push(module.clone());
    }
    let max_output_tokens = cost_limits
        .and_then(|limits| limits.max_output_tokens)
        .map_or(256, |limit| limit.clamp(256, 4096));
    let definition = serde_json::from_value(json!({
        "name": "omni-evaluation",
        "model": definition.model,
        "prompt": definition.prompt,
        "settings": {
            "max_steps": 1,
            "model": {
                "stream": true,
                "max_output_tokens": max_output_tokens
            }
        }
    }))
    .map_err(|error| HostError::Invalid(error.to_string()))?;
    Ok(compile_system(
        SystemDocument {
            schema_version: 1,
            name: "omni-evaluation".into(),
            modules,
            required_policies: vec![],
            required_governance: vec![],
            programs: BTreeMap::from([("main".into(), ProgramDefinition::Agent { definition })]),
        },
        registry,
    )?)
}
