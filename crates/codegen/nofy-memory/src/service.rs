//! Unified memory service: the only public read/write capability boundary.

use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use std::sync::atomic::{AtomicU64, Ordering};

use chrono::Utc;
use nofy_config_types::{MemoryIndexConfig, MemorySearchConfig};
use nofy_tools::types::memory_service::*;
use uuid::Uuid;

use crate::access::MemoryAccess;
use crate::index::{UnifiedMemoryIndex, UnifiedSearchContext};
use crate::layout::{ScopeLayout, UnifiedMemoryLayout};
use crate::model::{
    ContentHash, MemoryScope, Observation, ObservationId, ObservationKind, ObservationStatus,
    OperationId, ProjectId, ProjectValidity, Provenance,
};
use crate::observation_store::ObservationStore;
use crate::state::UnifiedState;

#[derive(Debug, Clone)]
pub struct NofyMemoryServiceConfig {
    pub root: PathBuf,
    pub workspace: PathBuf,
    pub project_id: ProjectId,
    pub memory_enabled: bool,
    pub automatic_learning_enabled: bool,
    pub search: MemorySearchConfig,
    pub index: MemoryIndexConfig,
    pub embedding_dimensions: usize,
}

impl NofyMemoryServiceConfig {
    pub fn default_for_tests() -> Self {
        Self {
            root: PathBuf::new(),
            workspace: PathBuf::new(),
            project_id: ProjectId::new(),
            memory_enabled: true,
            automatic_learning_enabled: true,
            search: MemorySearchConfig {
                min_score: 0.0,
                ..MemorySearchConfig::default()
            },
            index: MemoryIndexConfig::default(),
            embedding_dimensions: 4,
        }
    }
}

enum UndoEntry {
    Created {
        area: MemoryArea,
        relative_path: PathBuf,
        current_hash: ContentHash,
    },
    Revised {
        area: MemoryArea,
        relative_path: PathBuf,
        current_hash: ContentHash,
        previous_content: String,
    },
}

pub struct NofyMemoryService {
    config: NofyMemoryServiceConfig,
    generation: AtomicU64,
    undo: Mutex<HashMap<String, UndoEntry>>,
}

impl NofyMemoryService {
    pub fn new(config: NofyMemoryServiceConfig) -> MemoryServiceResult<Self> {
        std::fs::create_dir_all(&config.root)
            .map_err(|error| MemoryServiceError::Internal(error.to_string()))?;
        std::fs::create_dir_all(&config.workspace)
            .map_err(|error| MemoryServiceError::Internal(error.to_string()))?;
        Ok(Self {
            config,
            generation: AtomicU64::new(0),
            undo: Mutex::new(HashMap::new()),
        })
    }

    fn require_enabled(&self) -> MemoryServiceResult<()> {
        if self.config.memory_enabled {
            Ok(())
        } else {
            Err(MemoryServiceError::Disabled)
        }
    }

    fn layout(&self) -> UnifiedMemoryLayout {
        UnifiedMemoryLayout::new(&self.config.root)
    }

    fn domain_scope(&self, area: &MemoryArea) -> MemoryScope {
        match area {
            MemoryArea::Personal => MemoryScope::Personal,
            MemoryArea::Project => MemoryScope::Project(self.config.project_id),
        }
    }

    fn scope_layout(&self, area: &MemoryArea) -> ScopeLayout {
        self.layout().scope(&self.domain_scope(area))
    }

    fn access(&self, area: &MemoryArea) -> MemoryServiceResult<MemoryAccess> {
        let layout = self.layout();
        MemoryAccess::open(layout.meta_database(), self.scope_layout(area)).map_err(internal_error)
    }

    fn refresh_index(&self) -> MemoryServiceResult<()> {
        let mut index = UnifiedMemoryIndex::open(
            &self.config.root,
            self.config.project_id,
            self.config.index.clone(),
            self.config.embedding_dimensions,
        )
        .map_err(internal_error)?;
        index.refresh().map_err(internal_error)?;
        Ok(())
    }

    fn next_generation(&self) -> u64 {
        self.generation.fetch_add(1, Ordering::AcqRel) + 1
    }

    fn observation(&self, request: &RememberRequest) -> MemoryServiceResult<Observation> {
        let statement = request.statement.trim();
        if statement.is_empty() {
            return Err(MemoryServiceError::InvalidRequest(
                "记忆内容不能为空".to_owned(),
            ));
        }
        reject_secret(statement)?;
        if sensitive_category(statement).is_some() && !request.confirm_sensitive {
            return Err(MemoryServiceError::ConfirmationRequired(format!(
                "这条内容可能包含敏感个人信息；确认后才会保存到{}",
                request.area.user_label()
            )));
        }
        let content_hash = content_hash(statement);
        Ok(Observation {
            id: ObservationId::new(),
            scope: self.domain_scope(&request.area),
            kind: ObservationKind::Explicit,
            statement: statement.to_owned(),
            keywords: Vec::new(),
            aliases: Vec::new(),
            supersedes: Vec::new(),
            project_validity: match request.area {
                MemoryArea::Personal => None,
                MemoryArea::Project => Some(ProjectValidity::ProjectWide),
            },
            provenance: Provenance {
                session_id: "explicit-memory".to_owned(),
                turn_id: Uuid::new_v4().to_string(),
                model: "user".to_owned(),
                prompt_version: "explicit-v1".to_owned(),
                source_hash: content_hash.clone(),
            },
            content_hash,
            created_at: Utc::now(),
        })
    }

    fn locate_topic(&self, id: &str) -> MemoryServiceResult<LocatedTopic> {
        for area in [MemoryArea::Personal, MemoryArea::Project] {
            let scope = self.scope_layout(&area);
            let mut files = Vec::new();
            collect_markdown(&scope.topics_directory(), &mut files).map_err(internal_error)?;
            for path in files {
                let content = std::fs::read_to_string(&path).map_err(internal_error)?;
                let metadata = parse_topic(&content);
                if metadata.id.as_deref() == Some(id) {
                    let relative_path = path
                        .strip_prefix(scope.topics_directory())
                        .map_err(internal_error)?
                        .to_path_buf();
                    return Ok(LocatedTopic {
                        area,
                        relative_path,
                        content_hash: content_hash(&content),
                        content,
                        metadata,
                    });
                }
            }
        }
        Err(MemoryServiceError::NotFound)
    }

    fn remember_undo(&self, operation_id: OperationId, entry: UndoEntry) -> UndoToken {
        let id = operation_id.as_uuid().to_string();
        self.undo.lock().unwrap().insert(id.clone(), entry);
        UndoToken {
            operation_id: id,
            generation: 1,
        }
    }
}

#[async_trait::async_trait]
impl MemoryService for NofyMemoryService {
    async fn search(&self, request: SearchRequest) -> MemoryServiceResult<SearchPage> {
        self.require_enabled()?;
        let mut index = UnifiedMemoryIndex::open(
            &self.config.root,
            self.config.project_id,
            self.config.index.clone(),
            self.config.embedding_dimensions,
        )
        .map_err(internal_error)?;
        index.refresh().map_err(internal_error)?;
        let mut config = self.config.search.clone();
        config.max_results = request.max_results;
        config.min_score = request.min_score as f32;
        let results = crate::search::unified_search_with_embedding(
            &index,
            None,
            &request.query,
            &current_git_context(&self.config.workspace),
            &config,
        )
        .map_err(internal_error)?;
        let hits = results
            .into_iter()
            .filter_map(|result| {
                let id = result.chunk_id.split(':').nth(1)?.to_owned();
                let bytes = std::fs::read(&result.path).ok()?;
                Some(MemoryHit {
                    target: MemoryTarget {
                        id,
                        expected_hash: Some(hash_bytes(&bytes)),
                    },
                    area: if result.source.starts_with("personal_") {
                        MemoryArea::Personal
                    } else {
                        MemoryArea::Project
                    },
                    summary: result.snippet,
                    score: result.score,
                    created_at: result.created_at,
                })
            })
            .collect();
        Ok(SearchPage { hits })
    }

    async fn list(&self, request: ListMemoryRequest) -> MemoryServiceResult<MemoryList> {
        self.require_enabled()?;
        let areas = match request.area {
            Some(area) => vec![area],
            None => vec![MemoryArea::Personal, MemoryArea::Project],
        };
        let mut items = Vec::new();
        for area in areas {
            let scope = self.scope_layout(&area);
            let mut files = Vec::new();
            collect_markdown(&scope.topics_directory(), &mut files).map_err(internal_error)?;
            for path in files {
                let content = std::fs::read_to_string(path).map_err(internal_error)?;
                let metadata = parse_topic(&content);
                if let Some(id) = metadata.id {
                    items.push(MemoryListItem {
                        target: MemoryTarget {
                            id,
                            expected_hash: Some(content_hash(&content).as_str().to_owned()),
                        },
                        area: area.clone(),
                        summary: metadata.body,
                        updated_at: Utc::now().timestamp(),
                    });
                }
            }
        }
        Ok(MemoryList { items })
    }

    async fn get(&self, target: MemoryTarget) -> MemoryServiceResult<MemoryDocument> {
        self.require_enabled()?;
        let topic = self.locate_topic(&target.id)?;
        require_expected_hash(&target, &topic.content_hash)?;
        Ok(MemoryDocument {
            target: MemoryTarget {
                id: target.id,
                expected_hash: Some(topic.content_hash.as_str().to_owned()),
            },
            area: topic.area,
            title: topic.metadata.title,
            body: topic.metadata.body,
            revision: topic.metadata.revision,
        })
    }

    async fn explain(&self, target: MemoryTarget) -> MemoryServiceResult<MemoryExplanation> {
        let document = self.get(target).await?;
        Ok(MemoryExplanation {
            target: document.target,
            area: document.area.clone(),
            fact: document.body,
            source: format!("你明确要求记住到{}", document.area.user_label()),
            remembered_at: Utc::now().timestamp(),
            can_revise: true,
            can_forget: true,
        })
    }

    async fn remember(&self, request: RememberRequest) -> MemoryServiceResult<RememberReceipt> {
        self.require_enabled()?;
        let observation = self.observation(&request)?;
        ObservationStore::new(self.config.root.clone())
            .persist(&observation, ObservationStatus::Active)
            .map_err(internal_error)?;
        let topic_id = Uuid::new_v4();
        let title = request
            .title
            .as_deref()
            .map(str::trim)
            .filter(|title| !title.is_empty())
            .map(str::to_owned)
            .unwrap_or_else(|| summarize(&observation.statement));
        let relative_path = PathBuf::from(format!("remembered-{topic_id}.md"));
        let content = topic_content(topic_id, 1, observation.id, &title, &observation.statement);
        let operation_id = OperationId::new();
        self.access(&request.area)?
            .create_topic(operation_id, &relative_path, &content)
            .map_err(internal_error)?;
        self.refresh_index()?;
        let hash = content_hash(&content);
        let undo_token = self.remember_undo(
            operation_id,
            UndoEntry::Created {
                area: request.area.clone(),
                relative_path,
                current_hash: hash.clone(),
            },
        );
        Ok(RememberReceipt {
            target: MemoryTarget {
                id: topic_id.to_string(),
                expected_hash: Some(hash.as_str().to_owned()),
            },
            area_label: request.area.user_label().to_owned(),
            summary: observation.statement,
            undo_token,
            snapshot_generation: self.next_generation(),
        })
    }

    async fn revise(&self, request: ReviseTopicRequest) -> MemoryServiceResult<TopicRevision> {
        self.require_enabled()?;
        reject_secret(&request.replacement)?;
        let topic = self.locate_topic(&request.target.id)?;
        require_expected_hash(&request.target, &topic.content_hash)?;
        let old_evidence = topic.metadata.evidence.ok_or_else(|| {
            MemoryServiceError::InvalidRequest("记忆缺少可纠正的来源证据".to_owned())
        })?;
        let statement = request.replacement.trim();
        if statement.is_empty() {
            return Err(MemoryServiceError::InvalidRequest(
                "纠正内容不能为空".to_owned(),
            ));
        }
        let hash = content_hash(statement);
        let correction = Observation {
            id: ObservationId::new(),
            scope: self.domain_scope(&topic.area),
            kind: ObservationKind::UserCorrection,
            statement: statement.to_owned(),
            keywords: Vec::new(),
            aliases: Vec::new(),
            supersedes: vec![old_evidence],
            project_validity: match topic.area {
                MemoryArea::Personal => None,
                MemoryArea::Project => Some(ProjectValidity::ProjectWide),
            },
            provenance: Provenance {
                session_id: "explicit-memory".to_owned(),
                turn_id: Uuid::new_v4().to_string(),
                model: "user".to_owned(),
                prompt_version: "correction-v1".to_owned(),
                source_hash: hash.clone(),
            },
            content_hash: hash,
            created_at: Utc::now(),
        };
        ObservationStore::new(self.config.root.clone())
            .persist(&correction, ObservationStatus::Active)
            .map_err(internal_error)?;
        let scope = self.scope_layout(&topic.area);
        let state = UnifiedState::open(self.layout().meta_database(), scope.state_database())
            .map_err(internal_error)?;
        state
            .set_observation_status(
                old_evidence,
                ObservationStatus::Superseded,
                Some(correction.id),
            )
            .map_err(internal_error)?;
        let next_content = topic_content(
            Uuid::parse_str(&request.target.id)
                .map_err(|error| MemoryServiceError::InvalidRequest(error.to_string()))?,
            topic.metadata.revision + 1,
            correction.id,
            &summarize(statement),
            statement,
        );
        let operation_id = OperationId::new();
        self.access(&topic.area)?
            .update_topic(
                operation_id,
                &topic.relative_path,
                &topic.content_hash,
                &next_content,
                None,
            )
            .map_err(internal_error)?;
        self.refresh_index()?;
        let next_hash = content_hash(&next_content);
        let undo_token = self.remember_undo(
            operation_id,
            UndoEntry::Revised {
                area: topic.area,
                relative_path: topic.relative_path,
                current_hash: next_hash.clone(),
                previous_content: topic.content,
            },
        );
        Ok(TopicRevision {
            target: MemoryTarget {
                id: request.target.id,
                expected_hash: Some(next_hash.as_str().to_owned()),
            },
            revision: topic.metadata.revision + 1,
            summary: statement.to_owned(),
            undo_token,
            snapshot_generation: self.next_generation(),
        })
    }

    async fn forget(&self, request: ForgetRequest) -> MemoryServiceResult<ForgetReceipt> {
        self.require_enabled()?;
        if !request.confirmed {
            return Err(MemoryServiceError::ConfirmationRequired(
                "忘记操作不可撤销，请确认清除范围".to_owned(),
            ));
        }
        let topic = self.locate_topic(&request.target.id)?;
        require_expected_hash(&request.target, &topic.content_hash)?;
        let evidence = topic.metadata.evidence.ok_or_else(|| {
            MemoryServiceError::InvalidRequest("记忆缺少可清除的来源证据".to_owned())
        })?;
        self.access(&topic.area)?
            .delete_topic(
                OperationId::new(),
                &topic.relative_path,
                &topic.content_hash,
                None,
            )
            .map_err(internal_error)?;
        ObservationStore::new(self.config.root.clone())
            .forget(
                &self.domain_scope(&topic.area),
                evidence,
                &request.target.id,
                "user_forget",
            )
            .map_err(internal_error)?;
        self.refresh_index()?;
        Ok(ForgetReceipt {
            forgotten: true,
            summary: "已从活动记忆中清除；该操作不可撤销".to_owned(),
            snapshot_generation: self.next_generation(),
        })
    }

    async fn undo(&self, token: UndoToken) -> MemoryServiceResult<UndoReceipt> {
        self.require_enabled()?;
        if token.generation != 1 {
            return Err(MemoryServiceError::Conflict);
        }
        let entry = self
            .undo
            .lock()
            .unwrap()
            .remove(&token.operation_id)
            .ok_or(MemoryServiceError::NotFound)?;
        match entry {
            UndoEntry::Created {
                area,
                relative_path,
                current_hash,
            } => self
                .access(&area)?
                .delete_topic(OperationId::new(), &relative_path, &current_hash, None)
                .map_err(internal_error)?,
            UndoEntry::Revised {
                area,
                relative_path,
                current_hash,
                previous_content,
            } => self
                .access(&area)?
                .update_topic(
                    OperationId::new(),
                    &relative_path,
                    &current_hash,
                    &previous_content,
                    None,
                )
                .map_err(internal_error)?,
        }
        self.refresh_index()?;
        Ok(UndoReceipt {
            restored: true,
            snapshot_generation: self.next_generation(),
        })
    }

    async fn capture(&self, _request: CaptureRequest) -> MemoryServiceResult<CaptureReceipt> {
        self.require_enabled()?;
        Ok(CaptureReceipt {
            queued: self.config.automatic_learning_enabled,
        })
    }

    async fn consolidate(
        &self,
        _request: ConsolidateRequest,
    ) -> MemoryServiceResult<OperationReceipt> {
        Err(MemoryServiceError::Unavailable(
            "整理引擎将在统一服务的下一阶段接入".to_owned(),
        ))
    }

    async fn snapshot(&self, request: SnapshotRequest) -> MemoryServiceResult<MemorySnapshot> {
        self.require_enabled()?;
        let query = request.query.unwrap_or_else(|| "memory".to_owned());
        let page = self
            .search(SearchRequest {
                query,
                max_results: request.max_items,
                min_score: 0.0,
            })
            .await?;
        let content = page
            .hits
            .into_iter()
            .map(|hit| format!("- [{}] {}", hit.area.user_label(), hit.summary))
            .collect::<Vec<_>>()
            .join("\n");
        Ok(MemorySnapshot {
            generation: self.generation.load(Ordering::Acquire),
            content_hash: hash_bytes(content.as_bytes()),
            content,
        })
    }
}

struct LocatedTopic {
    area: MemoryArea,
    relative_path: PathBuf,
    content_hash: ContentHash,
    content: String,
    metadata: TopicMetadata,
}

#[derive(Default)]
struct TopicMetadata {
    id: Option<String>,
    revision: u64,
    evidence: Option<ObservationId>,
    title: String,
    body: String,
}

fn topic_content(
    id: Uuid,
    revision: u64,
    evidence: ObservationId,
    title: &str,
    body: &str,
) -> String {
    format!(
        "<!-- nofy-memory: id={id}; revision={revision}; origin=user; pinned=true; evidence={} -->\n# {}\n\n{}\n",
        evidence.as_uuid(),
        title.trim(),
        body.trim()
    )
}

fn parse_topic(content: &str) -> TopicMetadata {
    let mut values = HashMap::new();
    if let Some(line) = content.lines().next()
        && let Some(metadata) = line
            .strip_prefix("<!-- nofy-memory:")
            .and_then(|value| value.strip_suffix(" -->"))
    {
        for pair in metadata.split(';') {
            if let Some((key, value)) = pair.trim().split_once('=') {
                values.insert(key.trim(), value.trim());
            }
        }
    }
    let mut lines = content.lines().skip(1);
    let title = lines
        .find(|line| !line.trim().is_empty())
        .unwrap_or_default()
        .trim_start_matches('#')
        .trim()
        .to_owned();
    let body = lines.collect::<Vec<_>>().join("\n").trim().to_owned();
    TopicMetadata {
        id: values.get("id").map(|value| (*value).to_owned()),
        revision: values
            .get("revision")
            .and_then(|value| value.parse().ok())
            .unwrap_or(1),
        evidence: values
            .get("evidence")
            .and_then(|value| Uuid::parse_str(value).ok())
            .and_then(|id| ObservationId::try_from(id).ok()),
        title,
        body,
    }
}

fn collect_markdown(directory: &Path, files: &mut Vec<PathBuf>) -> std::io::Result<()> {
    if !directory.is_dir() {
        return Ok(());
    }
    let mut entries = std::fs::read_dir(directory)?.collect::<Result<Vec<_>, _>>()?;
    entries.sort_by_key(std::fs::DirEntry::file_name);
    for entry in entries {
        let path = entry.path();
        if path.is_dir() {
            collect_markdown(&path, files)?;
        } else if path.extension().is_some_and(|extension| extension == "md") {
            files.push(path);
        }
    }
    Ok(())
}

fn require_expected_hash(target: &MemoryTarget, actual: &ContentHash) -> MemoryServiceResult<()> {
    match target.expected_hash.as_deref() {
        Some(expected) if expected == actual.as_str() => Ok(()),
        _ => Err(MemoryServiceError::Conflict),
    }
}

fn current_git_context(workspace: &Path) -> UnifiedSearchContext {
    let Ok(repository) = git2::Repository::discover(workspace) else {
        return UnifiedSearchContext::default();
    };
    let Ok(head) = repository.head() else {
        return UnifiedSearchContext::default();
    };
    UnifiedSearchContext {
        git_ref: head.name().map(str::to_owned),
        anchor_commit: head.target().map(|commit| commit.to_string()),
    }
}

fn reject_secret(text: &str) -> MemoryServiceResult<()> {
    let lowered = text.to_ascii_lowercase();
    if ["api_key", "api key", "password", "secret", "token="]
        .iter()
        .any(|marker| lowered.contains(marker))
    {
        return Err(MemoryServiceError::Rejected(
            "凭据和密钥永远不会写入记忆".to_owned(),
        ));
    }
    Ok(())
}

fn sensitive_category(text: &str) -> Option<&'static str> {
    let lowered = text.to_ascii_lowercase();
    [
        ("financial", ["bank", "salary", "credit card"].as_slice()),
        ("health", ["diagnosis", "medication", "病历"].as_slice()),
        ("identity", ["passport", "身份证", "ssn"].as_slice()),
        ("location", ["home address", "住址", "我住在"].as_slice()),
    ]
    .into_iter()
    .find_map(|(category, markers)| {
        markers
            .iter()
            .any(|marker| lowered.contains(marker))
            .then_some(category)
    })
}

fn summarize(statement: &str) -> String {
    statement.chars().take(60).collect()
}

fn content_hash(text: &str) -> ContentHash {
    ContentHash::parse(hash_bytes(text.as_bytes())).expect("blake3 is a valid content hash")
}

fn hash_bytes(bytes: &[u8]) -> String {
    blake3::hash(bytes).to_hex().to_string()
}

fn internal_error(error: impl std::fmt::Display) -> MemoryServiceError {
    MemoryServiceError::Internal(error.to_string())
}
