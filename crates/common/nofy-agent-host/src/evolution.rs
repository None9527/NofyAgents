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
use serde_json::{Value, json};
use std::{
    collections::BTreeMap,
    path::PathBuf,
    sync::{Arc, OnceLock},
};

const MAX_ASSERTION_ITEMS: usize = 16;
const MAX_ASSERTION_TEXT_BYTES: usize = 1024;
const MAX_JSON_FIELDS: usize = 32;
const MAX_JSON_KEY_BYTES: usize = 256;
const MAX_PROBE_TEXT_BYTES: usize = 4096;
const MAX_PROBE_TURNS: usize = 8;

/// Structured output assertion for an evolution probe turn.
#[derive(Clone, Debug, Default, Deserialize, Serialize, PartialEq, Eq)]
#[serde(deny_unknown_fields)]
pub struct ProbeAssertion {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub exact: Option<String>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub contains: Vec<String>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub not_contains: Vec<String>,
    #[serde(default, skip_serializing_if = "BTreeMap::is_empty")]
    pub json_fields: BTreeMap<String, Value>,
}

impl ProbeAssertion {
    pub fn is_empty(&self) -> bool {
        self.exact.is_none()
            && self.contains.is_empty()
            && self.not_contains.is_empty()
            && self.json_fields.is_empty()
    }

    pub fn validate(&self) -> Result<()> {
        if self.is_empty() {
            return Err(HostError::Invalid(
                "Omni probe assertion must declare at least one check".into(),
            ));
        }
        if self
            .exact
            .as_ref()
            .is_some_and(|text| text.is_empty() || text.len() > MAX_PROBE_TEXT_BYTES)
        {
            return Err(HostError::Invalid(
                "Omni probe exact assertion must contain 1..=4096 bytes".into(),
            ));
        }
        if self.contains.len() > MAX_ASSERTION_ITEMS
            || self
                .contains
                .iter()
                .any(|item| item.is_empty() || item.len() > MAX_ASSERTION_TEXT_BYTES)
        {
            return Err(HostError::Invalid(
                "Omni probe contains assertion allows up to 16 non-empty substrings (<=1024 bytes)"
                    .into(),
            ));
        }
        if self.not_contains.len() > MAX_ASSERTION_ITEMS
            || self
                .not_contains
                .iter()
                .any(|item| item.is_empty() || item.len() > MAX_ASSERTION_TEXT_BYTES)
        {
            return Err(HostError::Invalid(
                "Omni probe not_contains assertion allows up to 16 non-empty substrings (<=1024 bytes)"
                    .into(),
            ));
        }
        if self.json_fields.len() > MAX_JSON_FIELDS {
            return Err(HostError::Invalid(
                "Omni probe json_fields assertion allows up to 32 entries".into(),
            ));
        }
        for (key, value) in &self.json_fields {
            let encoded_len = serde_json::to_vec(value)
                .map_err(|error| HostError::Invalid(error.to_string()))?
                .len();
            if key.is_empty()
                || key.len() > MAX_JSON_KEY_BYTES
                || encoded_len > MAX_PROBE_TEXT_BYTES
            {
                return Err(HostError::Invalid(
                    "Omni probe json_fields keys/values must be non-empty and bounded".into(),
                ));
            }
        }
        Ok(())
    }

    pub fn check(&self, output: &str) -> std::result::Result<(), String> {
        if let Some(expected) = &self.exact
            && output != expected
        {
            return Err("exact output mismatch".into());
        }
        for needle in &self.contains {
            if !output.contains(needle.as_str()) {
                return Err(format!("output missing required substring {needle:?}"));
            }
        }
        for forbidden in &self.not_contains {
            if output.contains(forbidden.as_str()) {
                return Err(format!(
                    "output contained forbidden substring {forbidden:?}"
                ));
            }
        }
        if !self.json_fields.is_empty() {
            let parsed: Value = serde_json::from_str(output.trim())
                .map_err(|error| format!("output is not valid JSON: {error}"))?;
            for (field, expected) in &self.json_fields {
                let actual = if field.strip_prefix('/').is_some() {
                    parsed.pointer(field)
                } else {
                    parsed.as_object().and_then(|object| object.get(field))
                };
                if actual != Some(expected) {
                    return Err(format!("JSON field {field:?} did not match expected value"));
                }
            }
        }
        Ok(())
    }
}

/// Budget red lines enforced on candidate and observation probe runs.
#[derive(Clone, Copy, Debug, Default, Deserialize, Serialize, PartialEq, Eq)]
#[serde(deny_unknown_fields)]
pub struct CostLimits {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub max_total_tokens: Option<u64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub max_output_tokens: Option<u64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub max_tool_calls: Option<u64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub max_steps: Option<usize>,
}

impl CostLimits {
    pub fn is_empty(&self) -> bool {
        self.max_total_tokens.is_none()
            && self.max_output_tokens.is_none()
            && self.max_tool_calls.is_none()
            && self.max_steps.is_none()
    }

    pub fn validate(&self) -> Result<()> {
        if self.is_empty()
            || self.max_total_tokens == Some(0)
            || self.max_output_tokens == Some(0)
            || self.max_steps == Some(0)
        {
            return Err(HostError::Invalid(
                "Omni evolution cost_limits must set at least one valid budget ceiling".into(),
            ));
        }
        Ok(())
    }

    pub fn merge(global: Option<Self>, probe: Option<Self>) -> Option<Self> {
        match (global, probe) {
            (None, None) => None,
            (Some(limits), None) | (None, Some(limits)) => Some(limits),
            (Some(a), Some(b)) => Some(Self {
                max_total_tokens: min_opt_u64(a.max_total_tokens, b.max_total_tokens),
                max_output_tokens: min_opt_u64(a.max_output_tokens, b.max_output_tokens),
                max_tool_calls: min_opt_u64(a.max_tool_calls, b.max_tool_calls),
                max_steps: match (a.max_steps, b.max_steps) {
                    (Some(x), Some(y)) => Some(x.min(y)),
                    (x, y) => x.or(y),
                },
            }),
        }
    }

    pub fn check(&self, metrics: &ProbeMetrics) -> std::result::Result<(), String> {
        if let Some(limit) = self.max_total_tokens
            && metrics.total_tokens > limit
        {
            return Err(format!(
                "total_tokens {} exceeded max_total_tokens {limit}",
                metrics.total_tokens
            ));
        }
        if let Some(limit) = self.max_output_tokens
            && metrics.output_tokens > limit
        {
            return Err(format!(
                "output_tokens {} exceeded max_output_tokens {limit}",
                metrics.output_tokens
            ));
        }
        if let Some(limit) = self.max_tool_calls
            && metrics.tool_calls > limit
        {
            return Err(format!(
                "tool_calls {} exceeded max_tool_calls {limit}",
                metrics.tool_calls
            ));
        }
        if let Some(limit) = self.max_steps
            && metrics.steps > limit
        {
            return Err(format!(
                "steps {} exceeded max_steps {limit}",
                metrics.steps
            ));
        }
        Ok(())
    }
}

fn min_opt_u64(a: Option<u64>, b: Option<u64>) -> Option<u64> {
    match (a, b) {
        (Some(x), Some(y)) => Some(x.min(y)),
        (x, y) => x.or(y),
    }
}

/// Measured cost metrics collected from a probe execution.
#[derive(Clone, Copy, Debug, Default, Deserialize, Serialize, PartialEq, Eq)]
pub struct ProbeMetrics {
    pub input_tokens: u64,
    pub output_tokens: u64,
    pub total_tokens: u64,
    pub tool_calls: u64,
    pub steps: usize,
    pub turns: usize,
}

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[serde(deny_unknown_fields)]
pub struct Probe {
    #[serde(default, skip_serializing_if = "String::is_empty")]
    pub input: String,
    #[serde(default, skip_serializing_if = "String::is_empty")]
    pub expected: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub baseline_expected: Option<String>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub turns: Vec<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub assertion: Option<ProbeAssertion>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub baseline_assertion: Option<ProbeAssertion>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub turn_assertions: Vec<Option<ProbeAssertion>>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub baseline_turn_assertions: Vec<Option<ProbeAssertion>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub cost_limits: Option<CostLimits>,
}

impl Probe {
    pub(crate) fn effective_turns(&self) -> Vec<&str> {
        if !self.turns.is_empty() {
            self.turns.iter().map(String::as_str).collect()
        } else {
            vec![self.input.as_str()]
        }
    }

    pub(crate) fn assertions_for_turn(
        &self,
        phase: Phase,
        turn_index: usize,
    ) -> Vec<ProbeAssertion> {
        let turn_count = self.effective_turns().len();
        let is_last = turn_index + 1 == turn_count;
        let mut checks = Vec::new();
        if phase == Phase::Baseline {
            let per_turn = if !self.baseline_turn_assertions.is_empty() {
                self.baseline_turn_assertions
                    .get(turn_index)
                    .and_then(Option::as_ref)
            } else if self.baseline_expected.is_none() && self.baseline_assertion.is_none() {
                self.turn_assertions
                    .get(turn_index)
                    .and_then(Option::as_ref)
            } else {
                None
            };
            if let Some(check) = per_turn {
                checks.push(check.clone());
            }
            if is_last {
                if let Some(check) = &self.baseline_assertion {
                    checks.push(check.clone());
                } else if let Some(expected) = &self.baseline_expected {
                    checks.push(ProbeAssertion {
                        exact: Some(expected.clone()),
                        ..Default::default()
                    });
                } else if let Some(check) = &self.assertion {
                    checks.push(check.clone());
                } else if !self.expected.is_empty() {
                    checks.push(ProbeAssertion {
                        exact: Some(self.expected.clone()),
                        ..Default::default()
                    });
                }
            }
        } else {
            if let Some(check) = self
                .turn_assertions
                .get(turn_index)
                .and_then(Option::as_ref)
            {
                checks.push(check.clone());
            }
            if is_last {
                if let Some(check) = &self.assertion {
                    checks.push(check.clone());
                } else if !self.expected.is_empty() {
                    checks.push(ProbeAssertion {
                        exact: Some(self.expected.clone()),
                        ..Default::default()
                    });
                }
            }
        }
        checks
    }

    fn validate(&self) -> Result<()> {
        let turn_count = if !self.turns.is_empty() {
            if !self.input.is_empty()
                || self.turns.len() > MAX_PROBE_TURNS
                || self
                    .turns
                    .iter()
                    .any(|turn| turn.trim().is_empty() || turn.len() > MAX_PROBE_TEXT_BYTES)
            {
                return Err(HostError::Invalid(
                    "Omni probe turns must contain 1..=8 bounded turns without a duplicate input"
                        .into(),
                ));
            }
            self.turns.len()
        } else {
            if self.input.trim().is_empty() || self.input.len() > MAX_PROBE_TEXT_BYTES {
                return Err(HostError::Invalid(
                    "Omni probe input must contain 1..=4096 non-whitespace bytes".into(),
                ));
            }
            1
        };

        if !self.expected.is_empty() && self.assertion.is_some() {
            return Err(HostError::Invalid(
                "Omni probe cannot specify both expected and assertion".into(),
            ));
        }
        if self.baseline_expected.is_some() && self.baseline_assertion.is_some() {
            return Err(HostError::Invalid(
                "Omni probe cannot specify both baseline_expected and baseline_assertion".into(),
            ));
        }
        if self.expected.len() > MAX_PROBE_TEXT_BYTES
            || self.baseline_expected.as_ref().is_some_and(|expected| {
                expected.is_empty() || expected.len() > MAX_PROBE_TEXT_BYTES
            })
        {
            return Err(HostError::Invalid(
                "Omni probe expected text must contain 1..=4096 bytes".into(),
            ));
        }
        if let Some(assertion) = &self.assertion {
            assertion.validate()?;
        }
        if let Some(assertion) = &self.baseline_assertion {
            assertion.validate()?;
        }
        if self.turn_assertions.len() > turn_count
            || self.baseline_turn_assertions.len() > turn_count
        {
            return Err(HostError::Invalid(
                "Omni probe turn_assertions cannot exceed turn count".into(),
            ));
        }
        for assertion in self
            .turn_assertions
            .iter()
            .chain(&self.baseline_turn_assertions)
            .flatten()
        {
            assertion.validate()?;
        }
        let has_final_target = !self.expected.is_empty()
            || self.assertion.is_some()
            || self
                .turn_assertions
                .get(turn_count - 1)
                .and_then(Option::as_ref)
                .is_some();
        if !has_final_target {
            return Err(HostError::Invalid(
                "Omni probe must specify an expected output or structured assertion for its final turn"
                    .into(),
            ));
        }
        if let Some(limits) = &self.cost_limits {
            limits.validate()?;
        }
        Ok(())
    }
}

/// Local operator grant for a single prompt evolution at an exact activation.
#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(deny_unknown_fields)]
pub struct Preauthorization {
    pub system: String,
    pub baseline: Activation,
    pub evaluation: Vec<Probe>,
    pub observation: Vec<Probe>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub cost_limits: Option<CostLimits>,
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
        {
            return Err(HostError::Invalid(
                "Omni evolution needs an exact baseline and 1..=8 bounded probes per phase".into(),
            ));
        }
        if let Some(limits) = &self.cost_limits {
            limits.validate()?;
        }
        for probe in self.evaluation.iter().chain(&self.observation) {
            probe.validate()?;
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
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub metrics: Option<ProbeMetrics>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub detail: Option<String>,
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
