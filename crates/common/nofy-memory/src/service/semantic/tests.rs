use super::*;
use serde_json::json;
fn service(root: &Path) -> NofyMemoryService {
    let mut config = NofyMemoryServiceConfig::default_for_tests();
    config.root = root.join("memory");
    config.workspace = root.join("workspace");
    config.search.vector_weight = 1.0;
    config.search.temporal_decay.enabled = false;
    config.search.mmr.enabled = false;
    NofyMemoryService::new(config).unwrap()
}
async fn remember(service: &NofyMemoryService, area: MemoryArea, text: &str) -> RememberReceipt {
    service
        .remember(
            serde_json::from_value(json!({"area":area,"statement":text,"confirm_sensitive":false}))
                .unwrap(),
        )
        .await
        .unwrap()
}
fn vectors(plan: &SemanticPlan) -> Vec<Vec<f32>> {
    plan.chunks
        .iter()
        .map(|chunk| {
            if chunk.row.text.contains("Saturn") {
                vec![1.0, 0.0]
            } else {
                vec![0.0, 1.0]
            }
        })
        .collect()
}
#[tokio::test]
async fn semantic_search_matches_without_keywords_and_isolates_model_spaces() {
    let root = tempfile::tempdir().unwrap();
    let service = service(root.path());
    remember(
        &service,
        MemoryArea::Project,
        "The Saturn launcher lifts satellites.",
    )
    .await;
    remember(
        &service,
        MemoryArea::Project,
        "Fresh sourdough needs flour.",
    )
    .await;
    let query = "orbital transport";
    assert!(
        service
            .search(SearchRequest {
                query: query.into(),
                max_results: 10,
                min_score: 0.8
            })
            .await
            .unwrap()
            .hits
            .is_empty()
    );
    let first = service
        .prepare_semantic(&"a".repeat(64), 2, query.into(), &[MemoryArea::Project])
        .unwrap();
    assert!(first.chunks.len() >= 2);
    assert!(first.chunks.iter().all(|c| !c.row.cached));
    service
        .store_semantic(&first, &first.chunks, &vectors(&first))
        .unwrap();
    let hits = service
        .search_semantic(&first, &[1.0, 0.0], 10, 0.8)
        .unwrap()
        .hits;
    assert!(!hits.is_empty());
    assert!(hits.iter().all(|h| h.summary.contains("Saturn")));
    let cached = service
        .prepare_semantic(&first.space, 2, query.into(), &first.areas)
        .unwrap();
    assert!(cached.chunks.iter().all(|c| c.row.cached));
    let other = service
        .prepare_semantic(&"b".repeat(64), 3, query.into(), &first.areas)
        .unwrap();
    assert!(other.chunks.iter().all(|c| !c.row.cached));
    let rotated = other
        .chunks
        .iter()
        .map(|c| {
            if c.row.text.contains("Saturn") {
                vec![0.0, 1.0, 0.0]
            } else {
                vec![-1.0, 0.0, 0.0]
            }
        })
        .collect::<Vec<_>>();
    service
        .store_semantic(&other, &other.chunks, &rotated)
        .unwrap();
    assert!(
        service
            .search_semantic(&other, &[0.0, 1.0, 0.0], 10, 0.8)
            .unwrap()
            .hits
            .iter()
            .all(|h| h.summary.contains("Saturn"))
    );
    assert!(
        service
            .search_semantic(&first, &[1.0, 0.0], 10, 0.8)
            .unwrap()
            .hits
            .iter()
            .all(|h| h.summary.contains("Saturn"))
    );
}
#[tokio::test]
async fn model_inputs_exclude_unadmitted_areas_before_vector_preparation() {
    let root = tempfile::tempdir().unwrap();
    let service = service(root.path());
    remember(
        &service,
        MemoryArea::Personal,
        "I prefer quiet reading rooms.",
    )
    .await;
    remember(
        &service,
        MemoryArea::Project,
        "The Saturn launcher lifts satellites.",
    )
    .await;
    let plan = service
        .prepare_semantic(
            &"a".repeat(64),
            2,
            "orbital transport".into(),
            &[MemoryArea::Project],
        )
        .unwrap();
    assert!(!plan.chunks.is_empty());
    assert!(
        plan.chunks
            .iter()
            .all(|c| c.area == MemoryArea::Project && !c.row.text.contains("quiet"))
    );
    let empty = service
        .prepare_semantic(&"a".repeat(64), 2, "query".into(), &[])
        .unwrap();
    assert!(empty.chunks.is_empty());
}
#[tokio::test]
async fn forgetting_retires_every_cached_space_and_stale_work_cannot_restore_vectors() {
    let root = tempfile::tempdir().unwrap();
    let service = service(root.path());
    let receipt = remember(
        &service,
        MemoryArea::Project,
        "The Saturn launcher lifts satellites.",
    )
    .await;
    let plan = service
        .prepare_semantic(
            &"a".repeat(64),
            2,
            "orbital transport".into(),
            &[MemoryArea::Project],
        )
        .unwrap();
    service
        .store_semantic(&plan, &plan.chunks, &vectors(&plan))
        .unwrap();
    let other = service
        .prepare_semantic(&"b".repeat(64), 2, plan.query.clone(), &plan.areas)
        .unwrap();
    service
        .store_semantic(&other, &other.chunks, &vectors(&other))
        .unwrap();
    service
        .forget(ForgetRequest {
            target: receipt.target,
            confirmed: true,
        })
        .await
        .unwrap();
    assert_eq!(
        service
            .store_semantic(&plan, &plan.chunks, &vectors(&plan))
            .unwrap(),
        0
    );
    for space in [&plan.space, &other.space] {
        let fresh = service
            .prepare_semantic(space, 2, plan.query.clone(), &plan.areas)
            .unwrap();
        assert!(fresh.chunks.is_empty());
        assert!(
            service
                .search_semantic(&fresh, &[1.0, 0.0], 10, 0.8)
                .unwrap()
                .hits
                .is_empty()
        );
    }
    UnifiedMemoryIndex::delete_derived_indexes(&service.config.root, service.config.project_id)
        .unwrap();
    assert!(
        service
            .prepare_semantic(&plan.space, 2, plan.query.clone(), &plan.areas)
            .unwrap()
            .chunks
            .is_empty()
    );
}
#[tokio::test]
async fn all_vector_values_are_validated_before_any_cache_write() {
    let root = tempfile::tempdir().unwrap();
    let service = service(root.path());
    remember(
        &service,
        MemoryArea::Project,
        "The Saturn launcher lifts satellites.",
    )
    .await;
    let plan = service
        .prepare_semantic(
            &"a".repeat(64),
            2,
            "orbital transport".into(),
            &[MemoryArea::Project],
        )
        .unwrap();
    for invalid in [
        vec![0.0, 0.0],
        vec![f32::NAN, 1.0],
        vec![1.0],
        vec![f32::INFINITY, 0.0],
    ] {
        let mut input = vectors(&plan);
        *input.last_mut().unwrap() = invalid;
        assert!(service.store_semantic(&plan, &plan.chunks, &input).is_err());
        assert!(
            service
                .prepare_semantic(&plan.space, 2, plan.query.clone(), &plan.areas)
                .unwrap()
                .chunks
                .iter()
                .all(|c| !c.row.cached)
        );
    }
    assert!(service.store_semantic(&plan, &plan.chunks, &[]).is_err());
    assert!(
        service
            .search_semantic(&plan, &[0.0, 0.0], 10, 0.0)
            .is_err()
    );
}
