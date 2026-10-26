//! Crash-recoverable consolidation for the unified memory system.

use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};
use thiserror::Error;

use crate::access::{AccessError, MemoryAccess};
use crate::atomic_file;
use crate::index::UnifiedMemoryIndex;
use crate::layout::{ScopeLayout, UnifiedMemoryLayout};
use crate::manifest;
use crate::model::{
    ContentHash, MemoryScope, ObservationId, OperationId, OperationPhase, ProjectId,
};
use crate::state::{StateError, UnifiedState};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ConsolidationMode {
    RecordOnly,
    Shadow,
    Active,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "action", rename_all = "snake_case")]
pub enum ConsolidationAction {
    Create {
        path: PathBuf,
        content: String,
    },
    Update {
        path: PathBuf,
        expected_hash: ContentHash,
        content: String,
    },
    Rename {
        from: PathBuf,
        to: PathBuf,
        expected_hash: ContentHash,
    },
    Merge {
        sources: Vec<TopicRef>,
        target: PathBuf,
        content: String,
    },
    Split {
        source: TopicRef,
        outputs: Vec<TopicCreate>,
    },
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TopicRef {
    pub path: PathBuf,
    pub expected_hash: ContentHash,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TopicCreate {
    pub path: PathBuf,
    pub content: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ConsolidationPlan {
    pub operation_id: OperationId,
    pub scope: MemoryScope,
    pub evidence: Vec<ObservationId>,
    pub actions: Vec<ConsolidationAction>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
struct FrozenPlan {
    plan: ConsolidationPlan,
    plan_hash: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ConsolidationKillPoint {
    EvidenceClaimed,
    CanonicalCommitted,
    DerivativesRebuilt,
    EvidenceArchived,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ConsolidationReceipt {
    pub operation_id: OperationId,
    pub mode: ConsolidationMode,
    pub phase: OperationPhase,
    pub plan_hash: Option<String>,
}

#[derive(Debug, Error)]
pub enum ConsolidationError {
    #[error("record-only consolidation does not generate or persist a plan")]
    RecordOnly,
    #[error("consolidation plan is empty")]
    EmptyPlan,
    #[error("consolidation plan changed after it was frozen")]
    PlanChanged,
    #[error("consolidation evidence is missing: {0:?}")]
    MissingEvidence(ObservationId),
    #[error("automatic consolidation may only modify curator-owned, unpinned topics: {0}")]
    ProtectedTopic(String),
    #[error("consolidation operation is currently leased")]
    Leased,
    #[error("injected consolidation crash after {0:?}")]
    Injected(ConsolidationKillPoint),
    #[error(transparent)]
    State(#[from] StateError),
    #[error(transparent)]
    Access(#[from] AccessError),
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error(transparent)]
    Json(#[from] serde_json::Error),
    #[error("index rebuild failed: {0}")]
    Index(String),
}

#[derive(Debug, Clone)]
pub struct ConsolidationEngine {
    root: PathBuf,
    project_id: ProjectId,
    index_config: nofy_config_types::MemoryIndexConfig,
    embedding_dimensions: usize,
}

impl ConsolidationEngine {
    pub fn new(
        root: PathBuf,
        project_id: ProjectId,
        index_config: nofy_config_types::MemoryIndexConfig,
        embedding_dimensions: usize,
    ) -> Self {
        Self {
            root,
            project_id,
            index_config,
            embedding_dimensions,
        }
    }

    pub fn execute(
        &self,
        plan: &ConsolidationPlan,
        mode: ConsolidationMode,
        worker_id: &str,
        now: i64,
        kill_after: Option<ConsolidationKillPoint>,
    ) -> Result<ConsolidationReceipt, ConsolidationError> {
        if mode == ConsolidationMode::RecordOnly {
            return Err(ConsolidationError::RecordOnly);
        }
        if plan.actions.is_empty() || plan.evidence.is_empty() {
            return Err(ConsolidationError::EmptyPlan);
        }
        let layout = UnifiedMemoryLayout::new(&self.root);
        let scope = layout.scope(&plan.scope);
        std::fs::create_dir_all(scope.root())?;
        let _scope_write = crate::scope_write_lock::ScopeWriteGuard::acquire(scope.root())?;
        let hash = plan_hash(plan)?;
        self.freeze_plan(&scope, plan, &hash)?;
        let state = UnifiedState::open(layout.meta_database(), scope.state_database())?;
        state.register_operation(plan.operation_id, "consolidation", now)?;
        if mode == ConsolidationMode::Shadow {
            return Ok(ConsolidationReceipt {
                operation_id: plan.operation_id,
                mode,
                phase: OperationPhase::Planned,
                plan_hash: Some(hash),
            });
        }
        let mut phase = state
            .operation_phase(plan.operation_id)?
            .unwrap_or(OperationPhase::Planned);
        if phase == OperationPhase::Planned {
            validate_evidence(&scope, &plan.evidence)?;
            self.validate_actions(&scope, &plan.actions)?;
        }
        let claim = state
            .claim_operation(plan.operation_id, worker_id, now, 1)?
            .ok_or(ConsolidationError::Leased)?;

        if phase == OperationPhase::Planned {
            state.advance_operation(&claim, OperationPhase::EvidenceClaimed, now)?;
            phase = OperationPhase::EvidenceClaimed;
            inject(kill_after, ConsolidationKillPoint::EvidenceClaimed)?;
        }
        if phase == OperationPhase::EvidenceClaimed {
            self.apply_actions(&layout, &scope, &plan.actions)?;
            state.advance_operation(&claim, OperationPhase::CanonicalCommitted, now)?;
            phase = OperationPhase::CanonicalCommitted;
            inject(kill_after, ConsolidationKillPoint::CanonicalCommitted)?;
        }
        if phase == OperationPhase::CanonicalCommitted {
            manifest::rebuild(&scope)?;
            let mut index = UnifiedMemoryIndex::open(
                &self.root,
                self.project_id,
                self.index_config.clone(),
                self.embedding_dimensions,
            )
            .map_err(|error| ConsolidationError::Index(error.to_string()))?;
            index
                .refresh()
                .map_err(|error| ConsolidationError::Index(error.to_string()))?;
            state.advance_operation(&claim, OperationPhase::DerivativesRebuilt, now)?;
            phase = OperationPhase::DerivativesRebuilt;
            inject(kill_after, ConsolidationKillPoint::DerivativesRebuilt)?;
        }
        if phase == OperationPhase::DerivativesRebuilt {
            archive_evidence(&scope, &plan.evidence)?;
            state.advance_operation(&claim, OperationPhase::EvidenceArchived, now)?;
            phase = OperationPhase::EvidenceArchived;
            inject(kill_after, ConsolidationKillPoint::EvidenceArchived)?;
        }
        if phase == OperationPhase::EvidenceArchived {
            state.advance_operation(&claim, OperationPhase::Completed, now)?;
            phase = OperationPhase::Completed;
        }
        Ok(ConsolidationReceipt {
            operation_id: plan.operation_id,
            mode,
            phase,
            plan_hash: Some(hash),
        })
    }

    fn freeze_plan(
        &self,
        scope: &ScopeLayout,
        plan: &ConsolidationPlan,
        hash: &str,
    ) -> Result<(), ConsolidationError> {
        let directory = scope.root().join("operations");
        std::fs::create_dir_all(&directory)?;
        let path = directory.join(format!("{}.json", plan.operation_id.as_uuid()));
        let frozen = FrozenPlan {
            plan: plan.clone(),
            plan_hash: hash.to_owned(),
        };
        if path.exists() {
            let existing: FrozenPlan = serde_json::from_slice(&std::fs::read(path)?)?;
            if existing != frozen {
                return Err(ConsolidationError::PlanChanged);
            }
        } else {
            atomic_file::replace(&path, &serde_json::to_vec_pretty(&frozen)?)?;
        }
        Ok(())
    }

    fn validate_actions(
        &self,
        scope: &ScopeLayout,
        actions: &[ConsolidationAction],
    ) -> Result<(), ConsolidationError> {
        for action in actions {
            match action {
                ConsolidationAction::Create { content, .. } => validate_curator_content(content)?,
                ConsolidationAction::Update { path, .. }
                | ConsolidationAction::Rename { from: path, .. } => {
                    validate_curator_topic(scope, path)?
                }
                ConsolidationAction::Merge {
                    sources, content, ..
                } => {
                    validate_curator_content(content)?;
                    for source in sources {
                        validate_curator_topic(scope, &source.path)?;
                    }
                }
                ConsolidationAction::Split { source, outputs } => {
                    validate_curator_topic(scope, &source.path)?;
                    for output in outputs {
                        validate_curator_content(&output.content)?;
                    }
                }
            }
        }
        Ok(())
    }

    fn apply_actions(
        &self,
        layout: &UnifiedMemoryLayout,
        scope: &ScopeLayout,
        actions: &[ConsolidationAction],
    ) -> Result<(), ConsolidationError> {
        let access = MemoryAccess::open(layout.meta_database(), scope.clone())?;
        for action in actions {
            match action {
                ConsolidationAction::Create { path, content } => {
                    create_idempotent(&access, scope, path, content)?
                }
                ConsolidationAction::Update {
                    path,
                    expected_hash,
                    content,
                } => update_idempotent(&access, scope, path, expected_hash, content)?,
                ConsolidationAction::Rename {
                    from,
                    to,
                    expected_hash,
                } => rename_idempotent(&access, scope, from, to, expected_hash)?,
                ConsolidationAction::Merge {
                    sources,
                    target,
                    content,
                } => {
                    create_idempotent(&access, scope, target, content)?;
                    archive_topics(scope, sources)?;
                }
                ConsolidationAction::Split { source, outputs } => {
                    for output in outputs {
                        create_idempotent(&access, scope, &output.path, &output.content)?;
                    }
                    archive_topics(scope, std::slice::from_ref(source))?;
                }
            }
        }
        Ok(())
    }
}

fn validate_curator_content(content: &str) -> Result<(), ConsolidationError> {
    if content
        .lines()
        .next()
        .is_some_and(|line| line.contains("origin=curator") && line.contains("pinned=false"))
    {
        Ok(())
    } else {
        Err(ConsolidationError::ProtectedTopic(
            "new topic metadata".to_owned(),
        ))
    }
}

fn validate_curator_topic(scope: &ScopeLayout, path: &Path) -> Result<(), ConsolidationError> {
    let content = std::fs::read_to_string(scope.topics_directory().join(path))?;
    validate_curator_content(&content)
        .map_err(|_| ConsolidationError::ProtectedTopic(path.display().to_string()))
}

fn validate_evidence(
    scope: &ScopeLayout,
    evidence: &[ObservationId],
) -> Result<(), ConsolidationError> {
    for id in evidence {
        let path = scope
            .observations_directory()
            .join(format!("{}.md", id.as_uuid()));
        if !path.is_file() {
            return Err(ConsolidationError::MissingEvidence(*id));
        }
    }
    Ok(())
}

fn create_idempotent(
    access: &MemoryAccess,
    scope: &ScopeLayout,
    path: &Path,
    content: &str,
) -> Result<(), ConsolidationError> {
    let target = scope.topics_directory().join(path);
    if target.exists() {
        if std::fs::read_to_string(target)? == content {
            return Ok(());
        }
        return Err(ConsolidationError::PlanChanged);
    }
    access.create_topic(OperationId::new(), path, content)?;
    Ok(())
}

fn update_idempotent(
    access: &MemoryAccess,
    scope: &ScopeLayout,
    path: &Path,
    expected: &ContentHash,
    content: &str,
) -> Result<(), ConsolidationError> {
    let target = scope.topics_directory().join(path);
    if target.exists() && std::fs::read_to_string(&target)? == content {
        return Ok(());
    }
    access.update_topic(OperationId::new(), path, expected, content, None)?;
    Ok(())
}

fn rename_idempotent(
    access: &MemoryAccess,
    scope: &ScopeLayout,
    from: &Path,
    to: &Path,
    expected: &ContentHash,
) -> Result<(), ConsolidationError> {
    if !scope.topics_directory().join(from).exists() && scope.topics_directory().join(to).exists() {
        return Ok(());
    }
    access.rename_topic(OperationId::new(), from, to, expected, None)?;
    Ok(())
}

fn archive_topics(scope: &ScopeLayout, topics: &[TopicRef]) -> Result<(), ConsolidationError> {
    let archive = scope.archive_directory().join("topics");
    std::fs::create_dir_all(&archive)?;
    for topic in topics {
        let source = scope.topics_directory().join(&topic.path);
        if !source.exists() {
            continue;
        }
        let actual =
            ContentHash::parse(blake3::hash(&std::fs::read(&source)?).to_hex().to_string())
                .map_err(|_| ConsolidationError::PlanChanged)?;
        if actual != topic.expected_hash {
            return Err(ConsolidationError::PlanChanged);
        }
        let target = archive.join(&topic.path);
        if let Some(parent) = target.parent() {
            std::fs::create_dir_all(parent)?;
        }
        std::fs::rename(source, target)?;
    }
    Ok(())
}

fn archive_evidence(
    scope: &ScopeLayout,
    evidence: &[ObservationId],
) -> Result<(), ConsolidationError> {
    let archive = scope.archive_directory().join("observations");
    std::fs::create_dir_all(&archive)?;
    for id in evidence {
        let name = format!("{}.md", id.as_uuid());
        let source = scope.observations_directory().join(&name);
        let target = archive.join(name);
        if source.exists() {
            std::fs::rename(source, target)?;
        }
    }
    Ok(())
}

fn plan_hash(plan: &ConsolidationPlan) -> Result<String, serde_json::Error> {
    Ok(blake3::hash(&serde_json::to_vec(plan)?)
        .to_hex()
        .to_string())
}

fn inject(
    actual: Option<ConsolidationKillPoint>,
    point: ConsolidationKillPoint,
) -> Result<(), ConsolidationError> {
    if actual == Some(point) {
        Err(ConsolidationError::Injected(point))
    } else {
        Ok(())
    }
}
