//! Durable automatic-capture queue and host-side policy enforcement.

use std::collections::BTreeSet;
use std::path::PathBuf;
use std::sync::{Arc, mpsc};
use std::thread::{self, JoinHandle};
use std::time::Duration;

use crate::config::MemorySensitiveCategory;
use chrono::Utc;
use serde::{Deserialize, Serialize};
use thiserror::Error;
use uuid::Uuid;

use crate::layout::UnifiedMemoryLayout;
use crate::model::{
    ContentHash, MemoryScope, Observation, ObservationId, ObservationKind, ObservationStatus,
    ProjectId, ProjectValidity, Provenance,
};
use crate::observation_store::{ObservationStore, ObservationStoreError};
use crate::state::{CaptureJobClaim, StateError, UnifiedState};
use crate::threat_scan;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct DurableTurn {
    pub session_id: String,
    pub turn_id: String,
    pub transcript_hash: String,
    pub transcript: String,
    pub project_id: Option<ProjectId>,
    pub top_level: bool,
    pub persisted: bool,
    pub succeeded: bool,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum EnqueueOutcome {
    Queued { job_id: String },
    Duplicate { job_id: String },
    Ineligible,
    ExcludedSensitive,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum DraftKind {
    Preference,
    PersonalFact,
    ProjectFact,
    Correction,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum DraftScope {
    Personal,
    Project,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum DraftConfidence {
    Certain,
    Uncertain,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ObservationDraft {
    pub statement: String,
    pub kind: DraftKind,
    pub scope: DraftScope,
    #[serde(default)]
    pub keywords: Vec<String>,
    #[serde(default)]
    pub aliases: Vec<String>,
    #[serde(default)]
    pub supersedes: Vec<ObservationId>,
    pub confidence: DraftConfidence,
}

impl ObservationDraft {
    pub fn parse_strict(json: &str) -> Result<Vec<Self>, CaptureError> {
        let drafts: Vec<Self> = serde_json::from_str(json)?;
        for draft in &drafts {
            if draft.statement.trim().is_empty() {
                return Err(CaptureError::InvalidDraft("empty statement".to_owned()));
            }
            if draft.kind == DraftKind::Correction && draft.supersedes.is_empty() {
                return Err(CaptureError::InvalidDraft(
                    "correction must identify superseded observations".to_owned(),
                ));
            }
            if draft.kind != DraftKind::Correction && !draft.supersedes.is_empty() {
                return Err(CaptureError::InvalidDraft(
                    "only corrections may supersede observations".to_owned(),
                ));
            }
        }
        Ok(drafts)
    }
}

pub trait CaptureExtractor: Send + Sync {
    fn extract(&self, transcript: &str) -> Result<String, String>;
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CaptureRunOutcome {
    pub job_id: String,
    pub persisted: usize,
    pub quarantined: usize,
    pub excluded: usize,
}

#[derive(Debug, Error)]
pub enum CaptureError {
    #[error("capture state failed: {0}")]
    State(#[from] StateError),
    #[error("capture observation store failed: {0}")]
    Store(#[from] ObservationStoreError),
    #[error("capture payload serialization failed: {0}")]
    Json(#[from] serde_json::Error),
    #[error("invalid observation draft: {0}")]
    InvalidDraft(String),
    #[error("capture extractor failed: {0}")]
    Extractor(String),
    #[error("capture job payload is missing")]
    MissingPayload,
    #[error("capture model validation failed: {0}")]
    Model(#[from] crate::model::ModelError),
    #[error("project-scoped draft has no current project")]
    MissingProject,
    #[error("capture worker is no longer accepting jobs")]
    WorkerStopped,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CaptureShutdown {
    Join,
    Cancel,
}

enum WorkerCommand {
    Enqueue {
        turn: DurableTurn,
        now: i64,
        response: mpsc::Sender<Result<EnqueueOutcome, CaptureError>>,
    },
    Shutdown(CaptureShutdown),
}

pub struct CaptureWorker {
    sender: mpsc::Sender<WorkerCommand>,
    join: Option<JoinHandle<()>>,
}

impl CaptureWorker {
    pub fn spawn(
        root: PathBuf,
        excluded_categories: BTreeSet<MemorySensitiveCategory>,
        extractor: Arc<dyn CaptureExtractor>,
        lease_secs: i64,
        max_retries: u32,
    ) -> Self {
        let (sender, receiver) = mpsc::channel();
        let worker_root = root.clone();
        let join = thread::spawn(move || {
            let Ok(queue) = CaptureQueue::open(worker_root.clone(), excluded_categories) else {
                return;
            };
            let worker_id = format!("capture-worker-{}", Uuid::new_v4());
            let mut shutdown = None;
            loop {
                match receiver.recv_timeout(Duration::from_millis(25)) {
                    Ok(WorkerCommand::Enqueue {
                        turn,
                        now,
                        response,
                    }) => {
                        let _ = response.send(queue.enqueue(&turn, now));
                    }
                    Ok(WorkerCommand::Shutdown(mode)) => shutdown = Some(mode),
                    Err(mpsc::RecvTimeoutError::Disconnected) => {
                        shutdown = Some(CaptureShutdown::Cancel)
                    }
                    Err(mpsc::RecvTimeoutError::Timeout) => {}
                }
                if shutdown == Some(CaptureShutdown::Cancel) {
                    break;
                }
                let now = Utc::now().timestamp();
                match queue.claim(&worker_id, now, lease_secs.max(1)) {
                    Ok(Some(claim)) => {
                        let _ = queue.process_claim(
                            &claim,
                            worker_root.clone(),
                            extractor.as_ref(),
                            max_retries,
                            now,
                        );
                    }
                    Ok(None) if shutdown == Some(CaptureShutdown::Join) => break,
                    Ok(None) => {}
                    Err(_) if shutdown.is_some() => break,
                    Err(_) => {}
                }
            }
        });
        Self {
            sender,
            join: Some(join),
        }
    }

    /// Returns only after the queue insert has committed, so callers can use
    /// this as the durable half of the transcript barrier.
    pub fn enqueue(&self, turn: DurableTurn, now: i64) -> Result<EnqueueOutcome, CaptureError> {
        let (response, result) = mpsc::channel();
        self.sender
            .send(WorkerCommand::Enqueue {
                turn,
                now,
                response,
            })
            .map_err(|_| CaptureError::WorkerStopped)?;
        result.recv().map_err(|_| CaptureError::WorkerStopped)?
    }

    pub fn shutdown(mut self, mode: CaptureShutdown) -> Result<(), CaptureError> {
        self.sender
            .send(WorkerCommand::Shutdown(mode))
            .map_err(|_| CaptureError::WorkerStopped)?;
        if let Some(join) = self.join.take() {
            join.join().map_err(|_| CaptureError::WorkerStopped)?;
        }
        Ok(())
    }
}

impl Drop for CaptureWorker {
    fn drop(&mut self) {
        if self.join.is_some() {
            let _ = self
                .sender
                .send(WorkerCommand::Shutdown(CaptureShutdown::Cancel));
            if let Some(join) = self.join.take() {
                let _ = join.join();
            }
        }
    }
}

pub struct CaptureQueue {
    state: UnifiedState,
    excluded_categories: BTreeSet<MemorySensitiveCategory>,
}

impl CaptureQueue {
    pub fn open(
        root: PathBuf,
        excluded_categories: BTreeSet<MemorySensitiveCategory>,
    ) -> Result<Self, CaptureError> {
        let layout = UnifiedMemoryLayout::new(root);
        let state = UnifiedState::open(
            layout.meta_database(),
            layout.personal_scope().state_database(),
        )?;
        Ok(Self {
            state,
            excluded_categories,
        })
    }

    pub fn enqueue(&self, turn: &DurableTurn, now: i64) -> Result<EnqueueOutcome, CaptureError> {
        self.enqueue_job(&capture_job_id(turn), turn, now)
    }

    /// A declarative binding is part of the task identity. Two projects that
    /// share a physical namespace cannot silently reuse each other's payload.
    pub fn enqueue_scoped(
        &self,
        binding: &str,
        turn: &DurableTurn,
        now: i64,
    ) -> Result<EnqueueOutcome, CaptureError> {
        if binding.is_empty() || binding.len() > 4096 {
            return Err(CaptureError::InvalidDraft("invalid capture binding".into()));
        }
        let id = blake3::hash(&serde_json::to_vec(&(
            "managed-capture/v1",
            binding,
            capture_job_id(turn),
        ))?)
        .to_hex()
        .to_string();
        self.enqueue_job(&id, turn, now)
    }

    fn enqueue_job(
        &self,
        job_id: &str,
        turn: &DurableTurn,
        now: i64,
    ) -> Result<EnqueueOutcome, CaptureError> {
        if !turn.top_level || !turn.persisted || !turn.succeeded {
            return Ok(EnqueueOutcome::Ineligible);
        }
        if classify_sensitive(&turn.transcript, &self.excluded_categories).is_some() {
            return Ok(EnqueueOutcome::ExcludedSensitive);
        }
        let payload = serde_json::to_string(turn)?;
        let existed = self.state.capture_job_state(job_id)?.is_some();
        self.state.enqueue_capture_job(job_id, &payload, now)?;
        if self.state.capture_payload(job_id)?.as_deref() != Some(payload.as_str()) {
            return Err(CaptureError::InvalidDraft(
                "capture task payload changed".into(),
            ));
        }
        Ok(if existed {
            EnqueueOutcome::Duplicate {
                job_id: job_id.into(),
            }
        } else {
            EnqueueOutcome::Queued {
                job_id: job_id.into(),
            }
        })
    }

    /// Apply a previously sampled, validated result to this exact task. The
    /// original timestamp keeps immutable observation bytes stable on replay.
    /// A live lease is never stolen; an expired generation is fenced as usual.
    pub fn process_output(
        &self,
        job_id: &str,
        root: PathBuf,
        worker_id: &str,
        output: String,
        now: i64,
    ) -> Result<Option<CaptureRunOutcome>, CaptureError> {
        if self.state(job_id)?.as_deref() == Some("succeeded") {
            return Ok(None);
        }
        let claim = self
            .state
            .claim_capture_job_by_id(job_id, worker_id, now, 30)?
            .ok_or(StateError::StaleCaptureLease)?;
        let recorded_at = self
            .state
            .capture_created_at(job_id)?
            .ok_or(CaptureError::MissingPayload)?;
        struct Output(String);
        impl CaptureExtractor for Output {
            fn extract(&self, _: &str) -> Result<String, String> {
                Ok(self.0.clone())
            }
        }
        self.process_claim_at(&claim, root, &Output(output), 1, (now, recorded_at))
            .map(Some)
    }

    pub fn claim(
        &self,
        worker_id: &str,
        now: i64,
        lease_secs: i64,
    ) -> Result<Option<CaptureJobClaim>, CaptureError> {
        Ok(self.state.claim_capture_job(worker_id, now, lease_secs)?)
    }

    pub fn reconcile(&self, now: i64) -> Result<usize, CaptureError> {
        Ok(self.state.reconcile_capture_jobs(now)?)
    }

    pub fn state(&self, job_id: &str) -> Result<Option<String>, CaptureError> {
        Ok(self.state.capture_job_state(job_id)?)
    }

    pub fn process_claim(
        &self,
        claim: &CaptureJobClaim,
        root: PathBuf,
        extractor: &dyn CaptureExtractor,
        max_retries: u32,
        now: i64,
    ) -> Result<CaptureRunOutcome, CaptureError> {
        self.process_claim_at(claim, root, extractor, max_retries, (now, now))
    }

    fn process_claim_at(
        &self,
        claim: &CaptureJobClaim,
        root: PathBuf,
        extractor: &dyn CaptureExtractor,
        max_retries: u32,
        times: (i64, i64),
    ) -> Result<CaptureRunOutcome, CaptureError> {
        let (now, recorded_at) = times;
        let payload = self
            .state
            .capture_payload(&claim.job_id)?
            .ok_or(CaptureError::MissingPayload)?;
        let turn: DurableTurn = serde_json::from_str(&payload)?;

        if classify_sensitive(&turn.transcript, &self.excluded_categories).is_some() {
            self.state
                .succeed_capture_job(claim, "excluded_sensitive", now)?;
            return Ok(CaptureRunOutcome {
                job_id: claim.job_id.clone(),
                persisted: 0,
                quarantined: 0,
                excluded: 1,
            });
        }

        let raw = match extractor.extract(&turn.transcript) {
            Ok(raw) => raw,
            Err(error) => {
                let terminal = claim.generation >= u64::from(max_retries.max(1));
                self.state.retry_capture_job(
                    claim,
                    if terminal {
                        "terminal_extractor_failure"
                    } else {
                        "retryable_extractor_failure"
                    },
                    terminal,
                    now,
                )?;
                return Err(CaptureError::Extractor(error));
            }
        };
        let drafts = match ObservationDraft::parse_strict(&raw) {
            Ok(drafts) => drafts,
            Err(error) => {
                let terminal = claim.generation >= u64::from(max_retries.max(1));
                self.state.retry_capture_job(
                    claim,
                    if terminal {
                        "terminal_invalid_output"
                    } else {
                        "retryable_invalid_output"
                    },
                    terminal,
                    now,
                )?;
                return Err(error);
            }
        };

        let store = ObservationStore::new(root);
        let mut outcome = CaptureRunOutcome {
            job_id: claim.job_id.clone(),
            persisted: 0,
            quarantined: 0,
            excluded: 0,
        };
        for (index, draft) in drafts.into_iter().enumerate() {
            let scope = resolve_scope(&draft, turn.project_id)?;
            if classify_sensitive(&draft.statement, &self.excluded_categories).is_some() {
                outcome.excluded += 1;
                continue;
            }
            if is_transient(&draft.statement) {
                outcome.excluded += 1;
                continue;
            }
            let id = deterministic_observation_id(&claim.job_id, index)?;
            if threat_scan::is_threat(&draft.statement) || contains_credential(&draft.statement) {
                store.quarantine(
                    &scope,
                    Some(&id.as_uuid().to_string()),
                    "capture_content_policy",
                    &draft.statement,
                    now,
                )?;
                outcome.quarantined += 1;
                continue;
            }
            let uncertain = draft.confidence == DraftConfidence::Uncertain;
            let observation = build_observation(id, scope, draft, &turn, recorded_at)?;
            let status = if observation.kind != ObservationKind::UserCorrection && uncertain {
                ObservationStatus::Disputed
            } else {
                ObservationStatus::Active
            };
            store.persist(&observation, status)?;
            outcome.persisted += 1;
        }
        self.state.succeed_capture_job(
            claim,
            &format!(
                "accepted:persisted={},quarantined={},excluded={}",
                outcome.persisted, outcome.quarantined, outcome.excluded
            ),
            now,
        )?;
        Ok(outcome)
    }
}

pub(crate) fn resolve_scope(
    draft: &ObservationDraft,
    project_id: Option<ProjectId>,
) -> Result<MemoryScope, CaptureError> {
    match draft.kind {
        DraftKind::Preference | DraftKind::PersonalFact => Ok(MemoryScope::Personal),
        DraftKind::ProjectFact => project_id
            .map(MemoryScope::Project)
            .ok_or(CaptureError::MissingProject),
        DraftKind::Correction => match draft.scope {
            DraftScope::Personal => Ok(MemoryScope::Personal),
            DraftScope::Project => project_id
                .map(MemoryScope::Project)
                .ok_or(CaptureError::MissingProject),
        },
    }
}

fn build_observation(
    id: ObservationId,
    scope: MemoryScope,
    draft: ObservationDraft,
    turn: &DurableTurn,
    now: i64,
) -> Result<Observation, CaptureError> {
    let statement = draft.statement.trim().to_owned();
    let content_hash = ContentHash::parse(blake3::hash(statement.as_bytes()).to_hex().to_string())?;
    let kind = match draft.kind {
        DraftKind::Preference | DraftKind::PersonalFact => ObservationKind::User,
        DraftKind::ProjectFact => ObservationKind::Project,
        DraftKind::Correction => ObservationKind::UserCorrection,
    };
    let project_validity = match scope {
        MemoryScope::Personal => None,
        MemoryScope::Project(_) => Some(ProjectValidity::ProjectWide),
    };
    Ok(Observation {
        id,
        scope,
        kind,
        statement,
        keywords: draft.keywords,
        aliases: draft.aliases,
        supersedes: draft.supersedes,
        project_validity,
        provenance: Provenance {
            session_id: turn.session_id.clone(),
            turn_id: turn.turn_id.clone(),
            model: "capture-extractor".to_owned(),
            prompt_version: "unified-capture-v1".to_owned(),
            source_hash: ContentHash::parse(turn.transcript_hash.clone())?,
        },
        content_hash,
        created_at: chrono::DateTime::from_timestamp(now, 0).unwrap_or_else(Utc::now),
    })
}

fn capture_job_id(turn: &DurableTurn) -> String {
    blake3::hash(
        format!(
            "{}\0{}\0{}",
            turn.session_id, turn.turn_id, turn.transcript_hash
        )
        .as_bytes(),
    )
    .to_hex()
    .to_string()
}

fn deterministic_observation_id(job_id: &str, index: usize) -> Result<ObservationId, CaptureError> {
    ObservationId::try_from(Uuid::new_v5(
        &Uuid::NAMESPACE_URL,
        format!("capture:{job_id}:{index}").as_bytes(),
    ))
    .map_err(|error| CaptureError::InvalidDraft(error.to_string()))
}

fn classify_sensitive(
    text: &str,
    excluded: &BTreeSet<MemorySensitiveCategory>,
) -> Option<MemorySensitiveCategory> {
    let lower = text.to_lowercase();
    let rules = [
        (
            MemorySensitiveCategory::Credentials,
            ["password", "api key", "token=", "secret="].as_slice(),
        ),
        (
            MemorySensitiveCategory::Financial,
            ["credit card", "bank account", "银行卡"].as_slice(),
        ),
        (
            MemorySensitiveCategory::Health,
            ["diagnosis", "medication", "病历", "诊断"].as_slice(),
        ),
        (
            MemorySensitiveCategory::Identity,
            ["passport", "social security", "身份证"].as_slice(),
        ),
        (
            MemorySensitiveCategory::Location,
            ["home address", "家庭住址", "住址"].as_slice(),
        ),
    ];
    rules.into_iter().find_map(|(category, needles)| {
        (excluded.contains(&category) && needles.iter().any(|needle| lower.contains(needle)))
            .then_some(category)
    })
}

fn contains_credential(text: &str) -> bool {
    classify_sensitive(
        text,
        &BTreeSet::from([MemorySensitiveCategory::Credentials]),
    )
    .is_some()
}

fn is_transient(text: &str) -> bool {
    let lower = text.to_lowercase();
    [
        "right now",
        "this turn",
        "temporary task",
        "仅本次",
        "临时任务",
    ]
    .iter()
    .any(|needle| lower.contains(needle))
}
