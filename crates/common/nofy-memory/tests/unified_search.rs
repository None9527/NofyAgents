use std::path::Path;

use chrono::{TimeZone, Utc};
use nofy_memory::config::{MemoryIndexConfig, MemorySearchConfig};
use nofy_memory::index::{UnifiedMemoryIndex, UnifiedSearchContext};
use nofy_memory::model::{
    ContentHash, MemoryScope, Observation, ObservationId, ObservationKind, ObservationStatus,
    ProjectId, ProjectValidity, Provenance,
};
use nofy_memory::observation_store::ObservationStore;
use nofy_memory::search::unified_search;

fn hash(text: &str) -> ContentHash {
    ContentHash::parse(blake3::hash(text.as_bytes()).to_hex().to_string()).unwrap()
}

fn observation(
    scope: MemoryScope,
    kind: ObservationKind,
    statement: &str,
    supersedes: Vec<ObservationId>,
    validity: Option<ProjectValidity>,
) -> Observation {
    Observation {
        id: ObservationId::new(),
        scope,
        kind,
        statement: statement.to_owned(),
        keywords: vec!["editor".to_owned(), "rust".to_owned()],
        aliases: Vec::new(),
        supersedes,
        project_validity: validity,
        provenance: Provenance {
            session_id: "session-1".to_owned(),
            turn_id: "turn-1".to_owned(),
            model: "test".to_owned(),
            prompt_version: "test-v1".to_owned(),
            source_hash: hash(statement),
        },
        content_hash: hash(statement),
        created_at: Utc.timestamp_opt(1_700_000_000, 0).unwrap(),
    }
}

fn write_topic(path: &Path, id: uuid::Uuid, revision: u64, body: &str) {
    std::fs::create_dir_all(path.parent().unwrap()).unwrap();
    std::fs::write(
        path,
        format!(
            "<!-- nofy-memory: id={id}; revision={revision}; origin=user; pinned=true -->\n# Preferences\n\n{body}\n"
        ),
    )
    .unwrap();
}

fn search_config() -> MemorySearchConfig {
    MemorySearchConfig {
        max_results: 20,
        min_score: 0.0,
        ..MemorySearchConfig::default()
    }
}

fn context(git_ref: &str, anchor_commit: &str) -> UnifiedSearchContext {
    UnifiedSearchContext {
        git_ref: Some(git_ref.to_owned()),
        anchor_commit: Some(anchor_commit.to_owned()),
    }
}

#[tokio::test]
async fn searches_personal_and_current_project_with_branch_and_status_filters() {
    let temp = tempfile::tempdir().unwrap();
    let root = temp.path().join("memory");
    let project = ProjectId::new();
    let other_project = ProjectId::new();
    let store = ObservationStore::new(root.clone());

    let personal_topic = root.join("personal/topics/preferences.md");
    write_topic(
        &personal_topic,
        uuid::Uuid::new_v4(),
        3,
        "Use Helix for Rust editing.",
    );

    let project_fact = observation(
        MemoryScope::Project(project),
        ObservationKind::Project,
        "The Rust build uses cargo nextest.",
        Vec::new(),
        Some(ProjectValidity::ProjectWide),
    );
    store
        .persist(&project_fact, ObservationStatus::Active)
        .unwrap();

    let matching_branch = observation(
        MemoryScope::Project(project),
        ObservationKind::Explicit,
        "The Rust release branch uses a frozen lockfile.",
        Vec::new(),
        Some(ProjectValidity::BranchLocal {
            git_ref: "refs/heads/release".to_owned(),
            anchor_commit: "abc123".to_owned(),
        }),
    );
    store
        .persist(&matching_branch, ObservationStatus::Active)
        .unwrap();

    let foreign_branch = observation(
        MemoryScope::Project(project),
        ObservationKind::Explicit,
        "The Rust experiment branch enables nightly.",
        Vec::new(),
        Some(ProjectValidity::BranchLocal {
            git_ref: "refs/heads/experiment".to_owned(),
            anchor_commit: "def456".to_owned(),
        }),
    );
    store
        .persist(&foreign_branch, ObservationStatus::Active)
        .unwrap();

    let foreign_project = observation(
        MemoryScope::Project(other_project),
        ObservationKind::Project,
        "The Rust foreign project uses Bazel.",
        Vec::new(),
        Some(ProjectValidity::ProjectWide),
    );
    store
        .persist(&foreign_project, ObservationStatus::Active)
        .unwrap();

    let mut index =
        UnifiedMemoryIndex::open(&root, project, MemoryIndexConfig::default(), 4).unwrap();
    index.rebuild().unwrap();

    let results = unified_search(
        &index,
        None,
        "Rust editor build branch",
        &context("refs/heads/release", "abc123"),
        &search_config(),
    )
    .await
    .unwrap();
    let text = results
        .iter()
        .map(|result| result.snippet.as_str())
        .collect::<Vec<_>>()
        .join("\n");

    assert!(text.contains("Helix"));
    assert!(text.contains("cargo nextest"));
    assert!(text.contains("frozen lockfile"));
    assert!(!text.contains("nightly"));
    assert!(!text.contains("Bazel"));
}

#[tokio::test]
async fn active_correction_suppresses_old_fact_and_outweighs_automatic_capture() {
    let temp = tempfile::tempdir().unwrap();
    let root = temp.path().join("memory");
    let project = ProjectId::new();
    let store = ObservationStore::new(root.clone());

    let old = observation(
        MemoryScope::Personal,
        ObservationKind::Explicit,
        "My Rust editor is Vim.",
        Vec::new(),
        None,
    );
    store.persist(&old, ObservationStatus::Active).unwrap();
    let automatic = observation(
        MemoryScope::Personal,
        ObservationKind::User,
        "I sometimes use a Rust editor with modal keys.",
        Vec::new(),
        None,
    );
    store
        .persist(&automatic, ObservationStatus::Active)
        .unwrap();
    let correction = observation(
        MemoryScope::Personal,
        ObservationKind::UserCorrection,
        "My Rust editor is Helix, not Vim.",
        vec![old.id],
        None,
    );
    store
        .persist(&correction, ObservationStatus::Active)
        .unwrap();

    let mut index =
        UnifiedMemoryIndex::open(&root, project, MemoryIndexConfig::default(), 4).unwrap();
    index.rebuild().unwrap();
    let results = unified_search(
        &index,
        None,
        "Rust editor",
        &UnifiedSearchContext::default(),
        &search_config(),
    )
    .await
    .unwrap();

    assert_eq!(results.first().unwrap().snippet, correction.statement);
    assert!(results.iter().all(|result| result.snippet != old.statement));
}

#[tokio::test]
async fn stale_hash_is_skipped_then_repaired_from_canonical_files() {
    let temp = tempfile::tempdir().unwrap();
    let root = temp.path().join("memory");
    let project = ProjectId::new();
    let topic = root.join("personal/topics/preferences.md");
    let topic_id = uuid::Uuid::new_v4();
    write_topic(&topic, topic_id, 1, "Use Rust stable.");

    let mut index =
        UnifiedMemoryIndex::open(&root, project, MemoryIndexConfig::default(), 4).unwrap();
    index.rebuild().unwrap();
    write_topic(&topic, topic_id, 2, "Use Rust nightly.");

    let stale = unified_search(
        &index,
        None,
        "Rust stable nightly",
        &UnifiedSearchContext::default(),
        &search_config(),
    )
    .await
    .unwrap();
    assert!(stale.is_empty(), "dirty canonical objects must fail closed");
    assert!(index.repair_required());

    index.repair().unwrap();
    let repaired = unified_search(
        &index,
        None,
        "Rust nightly",
        &UnifiedSearchContext::default(),
        &search_config(),
    )
    .await
    .unwrap();
    assert!(
        repaired
            .iter()
            .any(|result| result.snippet.contains("nightly"))
    );
}

#[tokio::test]
async fn deleting_indexes_and_rebuilding_preserves_result_identity_and_ignores_knowledge_files() {
    let temp = tempfile::tempdir().unwrap();
    let root = temp.path().join("memory");
    let project = ProjectId::new();
    write_topic(
        &root.join("personal/topics/preferences.md"),
        uuid::Uuid::new_v4(),
        1,
        "Rust formatting uses rustfmt.",
    );
    std::fs::create_dir_all(root.join("knowledge")).unwrap();
    std::fs::write(
        root.join("knowledge/external.md"),
        "Rust secret external knowledge document",
    )
    .unwrap();

    let mut index =
        UnifiedMemoryIndex::open(&root, project, MemoryIndexConfig::default(), 4).unwrap();
    index.rebuild().unwrap();
    let before = unified_search(
        &index,
        None,
        "Rust formatting secret",
        &UnifiedSearchContext::default(),
        &search_config(),
    )
    .await
    .unwrap();
    let before_ids: Vec<_> = before
        .iter()
        .map(|result| result.chunk_id.clone())
        .collect();
    assert!(
        before
            .iter()
            .all(|result| !result.snippet.contains("external"))
    );

    drop(index);
    UnifiedMemoryIndex::delete_derived_indexes(&root, project).unwrap();
    let mut rebuilt =
        UnifiedMemoryIndex::open(&root, project, MemoryIndexConfig::default(), 4).unwrap();
    rebuilt.rebuild().unwrap();
    let after = unified_search(
        &rebuilt,
        None,
        "Rust formatting secret",
        &UnifiedSearchContext::default(),
        &search_config(),
    )
    .await
    .unwrap();
    let after_ids: Vec<_> = after.iter().map(|result| result.chunk_id.clone()).collect();
    assert_eq!(after_ids, before_ids);
}
