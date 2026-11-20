use super::*;
use nofy_agent_runtime::{
    RunOutcome,
    durable::{Clock, SystemClock},
    mailbox::{InputAddress, MailboxSender},
    registry::{ModuleDefinition, ModuleRegistry},
    supervisor::jobs::ManagedRunRequest,
    system::{CompiledSystem, SystemDocument, compile_system},
};
use nofy_interjection_core::PendingInterjection;
use std::collections::{BTreeMap, BTreeSet};

#[derive(Deserialize, Serialize)]
pub(super) struct Scheduled {
    run_id: String,
    evaluation_release: String,
    deadline_ms: u64,
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
    let Some(scheduled) = job.probe.as_ref() else {
        let original = host.control.export(release).await?;
        let registry = host.registry.clone();
        let compiled = tokio::task::spawn_blocking(move || compile_probe(&original, &registry))
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
        let run_id = format!(
            "omni-probe-{}",
            content_digest(&(&receipt.proposal, phase, index))?
        );
        let request = ManagedRunRequest {
            approval_mode: None,
            run_id: run_id.clone(),
            thread_id: run_id.clone(),
            system: compiled.bundle.document.name.clone(),
            release: compiled.bundle.digest.clone(),
            program: "main".into(),
            input: Some(PendingInterjection {
                text: case.input.clone(),
                attachments: vec![],
            }),
            parameters: None,
        };
        host.supervisor.submit_managed(request, &compiled).await?;
        job.probe = Some(Scheduled {
            run_id,
            evaluation_release: compiled.bundle.digest,
            deadline_ms: SystemClock.now_ms().saturating_add(60_000),
        });
        return Ok(true);
    };
    let run_id = &scheduled.run_id;
    let managed = host
        .store
        .managed_run(run_id)
        .await?
        .ok_or_else(|| HostError::Unavailable("Omni probe request is missing".into()))?;
    if managed.request.release != scheduled.evaluation_release {
        return Err(HostError::Unavailable("Omni probe release changed".into()));
    }
    let record = host.store.execution_record(run_id).await?;
    let result = match record.as_ref().and_then(|record| record.outcome.as_ref()) {
        Some(RunOutcome::Completed { output, .. }) => ("completed", Some(output.as_str())),
        Some(_) => ("did_not_complete", None),
        None if record
            .as_ref()
            .is_some_and(|record| record.status == "failed") =>
        {
            ("failed", None)
        }
        None if SystemClock.now_ms() >= scheduled.deadline_ms => {
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
                host.supervisor.cancel_submitted(run_id).await?;
            }
            ("timeout", None)
        }
        None => return Ok(false),
    };
    let expected = if phase == Phase::Baseline {
        case.baseline_expected.as_deref().unwrap_or(&case.expected)
    } else {
        &case.expected
    };
    let matched = result.1 == Some(expected);
    receipt.evidence.push(Evidence {
        phase,
        release: release.clone(),
        run_id: run_id.clone(),
        outcome: result.0.into(),
        output_digest: result.1.map(|output| content_digest(&output)).transpose()?,
        matched,
    });
    job.probe = None;
    if !matched {
        receipt.failure = Some(format!(
            "{phase:?} probe {index} did not produce the expected result"
        ));
        receipt.phase = if phase == Phase::Observe {
            Phase::Rollback
        } else {
            Phase::Rejected
        };
    }
    Ok(true)
}

fn compile_probe(bundle: &SystemBundle, registry: &ModuleRegistry) -> Result<CompiledSystem> {
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
    let definition = serde_json::from_value(json!({
        "name":"omni-evaluation","model":definition.model,"prompt":definition.prompt,
        "settings":{"max_steps":1,"model":{"stream":true,"max_output_tokens":256}}
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
