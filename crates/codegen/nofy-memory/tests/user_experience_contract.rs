use std::sync::Arc;

use chrono::Utc;
use nofy_memory::model::{
    ContentHash, MemoryScope, Observation, ObservationId, ObservationKind, ObservationStatus,
    ProjectId, Provenance,
};
use nofy_memory::observation_store::ObservationStore;
use nofy_memory::service::{NofyMemoryService, NofyMemoryServiceConfig};
use nofy_tools::types::memory_service::{
    ConsolidateRequest, ConsolidationMode, ForgetRequest, MemoryArea, MemoryService,
    MemoryServiceError, MemoryTarget, RememberRequest, ReviseTopicRequest, SearchRequest,
};

fn service(enabled: bool, automatic_learning: bool) -> (tempfile::TempDir, Arc<dyn MemoryService>) {
    let temp = tempfile::tempdir().unwrap();
    let implementation = NofyMemoryService::new(NofyMemoryServiceConfig {
        root: temp.path().join("memory"),
        workspace: temp.path().join("workspace"),
        project_id: ProjectId::new(),
        memory_enabled: enabled,
        automatic_learning_enabled: automatic_learning,
        ..NofyMemoryServiceConfig::default_for_tests()
    })
    .unwrap();
    (temp, Arc::new(implementation))
}

fn remember(statement: &str) -> RememberRequest {
    RememberRequest {
        area: MemoryArea::Personal,
        statement: statement.to_owned(),
        title: None,
        confirm_sensitive: false,
    }
}

async fn search(memory: &dyn MemoryService, query: &str) -> Vec<String> {
    memory
        .search(SearchRequest {
            query: query.to_owned(),
            max_results: 10,
            min_score: 0.0,
        })
        .await
        .unwrap()
        .hits
        .into_iter()
        .map(|hit| hit.summary)
        .collect()
}

#[tokio::test]
async fn explicit_remember_is_visible_immediately_with_human_receipt() {
    let (_temp, memory) = service(true, true);
    let receipt = memory
        .remember(remember("I prefer Rust for backend services."))
        .await
        .unwrap();

    assert_eq!(receipt.area_label, "关于我");
    assert!(receipt.summary.contains("Rust"));
    assert!(receipt.snapshot_generation > 0);
    assert!(
        search(memory.as_ref(), "Rust backend")
            .await
            .iter()
            .any(|summary| summary.contains("Rust"))
    );
}

#[tokio::test]
async fn correction_replaces_recall_and_explanation_without_exposing_paths() {
    let (_temp, memory) = service(true, true);
    let remembered = memory
        .remember(remember("My editor is Vim."))
        .await
        .unwrap();
    let revised = memory
        .revise(ReviseTopicRequest {
            target: remembered.target,
            replacement: "My editor is Helix.".to_owned(),
        })
        .await
        .unwrap();

    let results = search(memory.as_ref(), "editor Vim Helix").await;
    assert!(results.iter().any(|summary| summary.contains("Helix")));
    assert!(
        results.iter().all(|summary| !summary.contains("Vim")),
        "old fact leaked into recall: {results:?}"
    );

    let explanation = memory
        .explain(MemoryTarget {
            id: revised.target.id,
            expected_hash: revised.target.expected_hash,
        })
        .await
        .unwrap();
    assert!(explanation.fact.contains("Helix"));
    assert!(!explanation.source.contains('/'));
    assert!(explanation.can_revise && explanation.can_forget);
}

#[tokio::test]
async fn disabling_automatic_learning_keeps_explicit_memory_available() {
    let (_temp, memory) = service(true, false);
    memory
        .remember(remember("Use cargo nextest for Rust tests."))
        .await
        .unwrap();
    assert!(!search(memory.as_ref(), "cargo nextest").await.is_empty());
}

#[tokio::test]
async fn disabled_memory_fails_explicitly_instead_of_silently_writing() {
    let (_temp, memory) = service(false, false);
    assert!(matches!(
        memory.remember(remember("Do not persist this.")).await,
        Err(MemoryServiceError::Disabled)
    ));
}

#[tokio::test]
async fn sensitive_memory_requires_confirmation_and_secrets_are_always_rejected() {
    let (_temp, memory) = service(true, true);
    assert!(matches!(
        memory.remember(remember("我住在西湖边。")).await,
        Err(MemoryServiceError::ConfirmationRequired(_))
    ));

    let mut confirmed = remember("我住在西湖边。");
    confirmed.confirm_sensitive = true;
    assert!(memory.remember(confirmed).await.is_ok());

    let mut secret = remember("My API key is secret-value.");
    secret.confirm_sensitive = true;
    assert!(matches!(
        memory.remember(secret).await,
        Err(MemoryServiceError::Rejected(_))
    ));
}

#[tokio::test]
async fn forget_requires_confirmation_and_disappears_immediately() {
    let (_temp, memory) = service(true, true);
    let receipt = memory
        .remember(remember("I drink jasmine tea every morning."))
        .await
        .unwrap();
    let target = receipt.target;

    assert!(matches!(
        memory
            .forget(ForgetRequest {
                target: target.clone(),
                confirmed: false,
            })
            .await,
        Err(MemoryServiceError::ConfirmationRequired(_))
    ));
    memory
        .forget(ForgetRequest {
            target: target.clone(),
            confirmed: true,
        })
        .await
        .unwrap();

    assert!(matches!(
        memory.get(target).await,
        Err(MemoryServiceError::NotFound)
    ));
    assert!(search(memory.as_ref(), "jasmine tea").await.is_empty());
}

#[tokio::test]
async fn recent_remember_can_be_undone_once() {
    let (_temp, memory) = service(true, true);
    let receipt = memory
        .remember(remember("Prefer compact explanations."))
        .await
        .unwrap();
    let target = receipt.target;
    let undo = receipt.undo_token;

    assert!(memory.undo(undo.clone()).await.unwrap().restored);
    assert!(matches!(
        memory.get(target).await,
        Err(MemoryServiceError::NotFound)
    ));
    assert!(matches!(
        memory.undo(undo).await,
        Err(MemoryServiceError::NotFound)
    ));
}

#[tokio::test]
async fn memory_dream_consolidates_captured_evidence_through_the_public_service() {
    let (temp, memory) = service(true, true);
    let statement = "Use deterministic recovery for background jobs.";
    let content_hash =
        ContentHash::parse(blake3::hash(statement.as_bytes()).to_hex().to_string()).unwrap();
    let observation = Observation {
        id: ObservationId::new(),
        scope: MemoryScope::Personal,
        kind: ObservationKind::User,
        statement: statement.to_owned(),
        keywords: vec!["recovery".to_owned()],
        aliases: Vec::new(),
        supersedes: Vec::new(),
        project_validity: None,
        provenance: Provenance {
            session_id: "session".to_owned(),
            turn_id: "turn".to_owned(),
            model: "test".to_owned(),
            prompt_version: "v1".to_owned(),
            source_hash: content_hash.clone(),
        },
        content_hash,
        created_at: Utc::now(),
    };
    ObservationStore::new(temp.path().join("memory"))
        .persist(&observation, ObservationStatus::Active)
        .unwrap();

    let receipt = memory
        .consolidate(ConsolidateRequest {
            area: MemoryArea::Personal,
            mode: ConsolidationMode::Active,
        })
        .await
        .unwrap();

    assert!(receipt.accepted);
    assert_eq!(receipt.area, MemoryArea::Personal);
    assert_eq!(receipt.mode, ConsolidationMode::Active);
    assert_eq!(receipt.processed, 1);
    assert!(
        search(memory.as_ref(), "deterministic recovery")
            .await
            .iter()
            .any(|summary| summary.contains("deterministic recovery"))
    );
}

#[tokio::test]
async fn memory_dream_on_an_empty_store_is_a_successful_noop() {
    let (_temp, memory) = service(true, true);
    let receipt = memory
        .consolidate(ConsolidateRequest {
            area: MemoryArea::Project,
            mode: ConsolidationMode::Active,
        })
        .await
        .unwrap();
    assert!(!receipt.accepted);
    assert_eq!(receipt.processed, 0);
}
