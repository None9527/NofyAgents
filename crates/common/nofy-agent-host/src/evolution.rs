//! Local proposal, evaluation and activation lifecycle for the Omni prompt.
mod journal;
mod probe;
#[cfg(test)]
mod tests;
mod tool;
pub(crate) use tool::ProposalFactory;

use crate::{HostError, KernelHost, Result};
use nofy_agent_runtime::{
    control::{Activation, ApplyCommand, ApplyReceipt, ControlError},
    durable::SqliteStore,
    registry::ModuleRef,
    system::{ProgramDefinition, SystemBundle, SystemFile, content_digest},
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::{
    path::PathBuf,
    sync::{Arc, OnceLock},
};

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(deny_unknown_fields)]
pub struct Probe {
    pub input: String,
    pub expected: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub baseline_expected: Option<String>,
}

/// Local operator grant for a single prompt evolution at an exact activation.
#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(deny_unknown_fields)]
pub struct Preauthorization {
    pub system: String,
    pub baseline: Activation,
    pub evaluation: Vec<Probe>,
    pub observation: Vec<Probe>,
}

impl Preauthorization {
    fn validate(&self) -> Result<()> {
        if self.system.trim().is_empty()
            || self.system.len() > 128
            || self.baseline.generation == 0
            || self.baseline.release.len() != 64
            || !self
                .baseline
                .release
                .bytes()
                .all(|byte| byte.is_ascii_hexdigit())
            || self.evaluation.is_empty()
            || self.evaluation.len() > 8
            || self.observation.is_empty()
            || self.observation.len() > 8
            || self
                .evaluation
                .iter()
                .chain(&self.observation)
                .any(|probe| {
                    probe.input.trim().is_empty()
                        || probe.input.len() > 4096
                        || probe.expected.is_empty()
                        || probe.expected.len() > 4096
                        || probe
                            .baseline_expected
                            .as_ref()
                            .is_some_and(|expected| expected.is_empty() || expected.len() > 4096)
                })
        {
            return Err(HostError::Invalid(
                "Omni evolution needs an exact baseline and 1..=8 bounded probes per phase".into(),
            ));
        }
        Ok(())
    }
}

#[derive(Clone, Copy, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum Phase {
    Proposed,
    Baseline,
    Candidate,
    Activate,
    Observe,
    Rollback,
    Rejected,
    Accepted,
    RolledBack,
    Superseded,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Evidence {
    pub phase: Phase,
    pub release: String,
    pub run_id: String,
    pub outcome: String,
    pub output_digest: Option<String>,
    pub matched: bool,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct EvolutionReceipt {
    pub proposal: String,
    pub author_run: String,
    pub policy_digest: String,
    pub baseline: Activation,
    pub candidate_release: Option<String>,
    pub phase: Phase,
    pub evidence: Vec<Evidence>,
    pub evaluation_digest: Option<String>,
    pub activation: Option<ApplyReceipt>,
    pub rollback: Option<ApplyReceipt>,
    pub failure: Option<String>,
}

#[derive(Deserialize, Serialize)]
struct Job {
    receipt: EvolutionReceipt,
    prompt: String,
    probe: Option<probe::Scheduled>,
}

struct Grant {
    config: Preauthorization,
    key: String,
    digest: String,
}

#[derive(Clone)]
pub(crate) struct Evolution {
    store: SqliteStore,
    journal: journal::Journal,
    grant: Arc<OnceLock<Grant>>,
}

impl KernelHost {
    /// Install a trusted operator grant before starting the Host worker.
    pub fn with_evolution(self, config: Preauthorization) -> Result<Self> {
        config.validate()?;
        let digest = content_digest(&config)?;
        let identity = content_digest(&(&config.system, &config.baseline))?;
        self.evolution.journal.initialize()?;
        self.evolution
            .grant
            .set(Grant {
                config,
                key: format!("host:omni-prompt-evolution:v1:{identity}"),
                digest,
            })
            .map_err(|_| HostError::Invalid("Omni evolution grant is already configured".into()))?;
        Ok(self)
    }

    pub async fn evolution_receipt(&self) -> Result<Option<EvolutionReceipt>> {
        let Some(grant) = self.evolution.grant.get() else {
            return Ok(None);
        };
        Ok(self
            .evolution
            .load(grant)
            .await?
            .map(|(_, job)| job.receipt))
    }
}

impl Evolution {
    pub(crate) fn new(store: SqliteStore, path: PathBuf) -> Self {
        Self {
            store,
            journal: journal::Journal::new(path),
            grant: Arc::new(OnceLock::new()),
        }
    }

    async fn load(&self, grant: &Grant) -> Result<Option<(u64, Job)>> {
        let Some((revision, digest, body)) = self.journal.load(&grant.key).await? else {
            return Ok(None);
        };
        if digest != grant.digest {
            return Err(HostError::Invalid(
                "restore the original Omni evolution grant for this baseline".into(),
            ));
        }
        let job = serde_json::from_str(&body)
            .map_err(|error| HostError::Unavailable(error.to_string()))?;
        Ok(Some((revision, job)))
    }

    async fn save(&self, grant: &Grant, revision: Option<u64>, job: &Job) -> Result<()> {
        let body = serde_json::to_string(job)
            .map_err(|error| HostError::Unavailable(error.to_string()))?;
        self.journal
            .save(&grant.key, &grant.digest, revision, body)
            .await
    }

    async fn propose(&self, run_id: &str, prompt: String) -> Result<EvolutionReceipt> {
        let grant = self.grant.get().ok_or(HostError::Forbidden)?;
        if prompt.trim().is_empty() || prompt.len() > 16 * 1024 {
            return Err(HostError::Invalid(
                "Omni prompt must contain 1..=16384 bytes".into(),
            ));
        }
        let author = self
            .store
            .managed_run(run_id)
            .await?
            .ok_or(HostError::Forbidden)?;
        if author.request.system != grant.config.system
            || author.request.release != grant.config.baseline.release
            || author.request.program != "main"
        {
            return Err(HostError::Forbidden);
        }
        let proposal = content_digest(&(&grant.digest, &prompt))?;
        if let Some((_, job)) = self.load(grant).await? {
            return existing(job, &proposal);
        }
        let job = Job {
            receipt: EvolutionReceipt {
                proposal: proposal.clone(),
                author_run: run_id.into(),
                policy_digest: grant.digest.clone(),
                baseline: grant.config.baseline.clone(),
                candidate_release: None,
                phase: Phase::Proposed,
                evidence: Vec::new(),
                evaluation_digest: None,
                activation: None,
                rollback: None,
                failure: None,
            },
            prompt,
            probe: None,
        };
        match self.save(grant, None, &job).await {
            Ok(()) => Ok(job.receipt),
            Err(error) => match self.load(grant).await? {
                Some((_, saved)) => existing(saved, &proposal),
                None => Err(error),
            },
        }
    }

    pub(crate) async fn advance(&self, host: &KernelHost) -> Result<()> {
        let Some(grant) = self.grant.get() else {
            return Ok(());
        };
        let Some((revision, mut job)) = self.load(grant).await? else {
            return Ok(());
        };
        match job.receipt.phase {
            Phase::Proposed => {
                let base = host.control.export(&job.receipt.baseline.release).await?;
                match stage_candidate(host, &base, &job.prompt).await {
                    Ok(release) => job.receipt.candidate_release = Some(release),
                    Err(HostError::Invalid(message)) => {
                        job.receipt.phase = Phase::Rejected;
                        job.receipt.failure = Some(message);
                        return self.save(grant, Some(revision), &job).await;
                    }
                    Err(error) => return Err(error),
                }
                job.receipt.phase = Phase::Baseline;
            }
            Phase::Baseline | Phase::Candidate | Phase::Observe => {
                if !probe::advance(host, grant, &mut job).await? {
                    return Ok(());
                }
            }
            Phase::Activate | Phase::Rollback => self.apply(host, grant, &mut job.receipt).await?,
            _ => return Ok(()),
        }
        self.save(grant, Some(revision), &job).await
    }

    async fn apply(
        &self,
        host: &KernelHost,
        grant: &Grant,
        receipt: &mut EvolutionReceipt,
    ) -> Result<()> {
        let rollback = receipt.phase == Phase::Rollback;
        let (release, generation, action) = if rollback {
            let activation = receipt.activation.as_ref().ok_or_else(|| {
                HostError::Unavailable("Omni activation receipt is missing".into())
            })?;
            (
                &receipt.baseline.release,
                activation.active.generation,
                "rollback",
            )
        } else {
            (
                receipt.candidate_release.as_ref().ok_or_else(|| {
                    HostError::Unavailable("Omni candidate release is missing".into())
                })?,
                receipt.baseline.generation,
                "apply",
            )
        };
        let evidence = content_digest(&receipt.evidence)?;
        let command = ApplyCommand {
            command_id: format!(
                "omni-{action}-{}",
                content_digest(&(&receipt.proposal, &evidence))?
            ),
            system: grant.config.system.clone(),
            release: release.clone(),
            expected_generation: Some(generation),
        };
        match host.control.apply(command).await {
            Ok(result) if rollback => {
                receipt.rollback = Some(result);
                receipt.phase = Phase::RolledBack;
            }
            Ok(result) => {
                receipt.activation = Some(result);
                receipt.phase = Phase::Observe;
            }
            Err(ControlError::Conflict { .. }) => {
                receipt.phase = Phase::Superseded;
                receipt.failure = Some("the expected active generation changed".into());
            }
            Err(error) => return Err(error.into()),
        }
        Ok(())
    }
}

async fn stage_candidate(
    host: &KernelHost,
    baseline: &SystemBundle,
    prompt: &str,
) -> Result<String> {
    let file = candidate(baseline, prompt)?;
    let registry = host.registry.clone();
    let compiled = tokio::task::spawn_blocking(move || file.prepare(&registry))
        .await
        .map_err(|error| HostError::Unavailable(error.to_string()))?
        .map_err(|error| HostError::Invalid(error.to_string()))?;
    let candidate = compiled.bundle;
    if candidate.lock.modules.len() != baseline.lock.modules.len() + 1 {
        return Err(HostError::Invalid(
            "Omni candidate must add exactly one prompt version".into(),
        ));
    }
    for original in &baseline.lock.modules {
        let preserved = candidate
            .lock
            .modules
            .iter()
            .find(|module| module.definition.reference == original.definition.reference);
        if content_digest(&preserved)? != content_digest(&Some(original))? {
            return Err(HostError::Invalid(
                "Omni candidate changed an existing module or resource identity".into(),
            ));
        }
    }
    Ok(host.control.import(candidate).await?.bundle.digest)
}

fn existing(job: Job, proposal: &str) -> Result<EvolutionReceipt> {
    if job.receipt.proposal == proposal {
        Ok(job.receipt)
    } else {
        Err(HostError::Invalid(
            "the grant already has a different Omni proposal".into(),
        ))
    }
}

fn candidate(base: &SystemBundle, prompt: &str) -> Result<SystemFile> {
    let mut document = base.document.clone();
    let Some(ProgramDefinition::Agent { definition }) = document.programs.get_mut("main") else {
        return Err(HostError::Invalid("Omni main must be an Agent".into()));
    };
    let original = document
        .modules
        .iter()
        .find(|module| module.reference == definition.prompt && module.factory == "prompt.static")
        .ok_or_else(|| HostError::Invalid("Omni evolution requires a static main prompt".into()))?;
    if original.config["text"].as_str() == Some(prompt) {
        return Err(HostError::Invalid(
            "Omni proposal does not change the prompt".into(),
        ));
    }
    let mut updated = original.clone();
    updated.config = json!({"text":prompt});
    updated.reference = ModuleRef {
        id: original.reference.id.clone(),
        version: content_digest(&(&original.reference, &updated.config))?,
    };
    definition.prompt = updated.reference.clone();
    document.modules.push(updated);
    Ok(SystemFile::Source(document))
}
