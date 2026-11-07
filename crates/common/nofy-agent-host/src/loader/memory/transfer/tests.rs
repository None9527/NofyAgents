use super::*;
use nofy_memory_types::{ForgetRequest, MemoryArea, MemoryService, RememberRequest};
fn backends() -> (Value, Value) {
    let a = json!({"namespace":"source-notes","project_id":"37a9b2ac-9dca-4aae-9235-aed6ac68d141","embedding_dimensions":4});
    let mut b = a.clone();
    b["namespace"] = json!("target-notes");
    b["embedding_dimensions"] = json!(7);
    (a, b)
}
fn provider(root: &Path) -> Provider {
    let loader = directory(&root.join("loader")).unwrap();
    Provider::new(
        root.join("memory"),
        Arc::new(control::MemoryControl::open(&loader).unwrap()),
    )
}
async fn remember(service: &NofyMemoryService, text: &str) -> nofy_memory_types::RememberReceipt {
    service
        .remember(RememberRequest {
            area: MemoryArea::Project,
            statement: text.into(),
            title: None,
            confirm_sensitive: false,
        })
        .await
        .unwrap()
}
pub(super) fn point(name: &str) {
    if std::env::var("NOFY_MEMORY_TRANSFER_TEST_EXIT")
        .ok()
        .as_deref()
        == Some(name)
    {
        std::process::exit(74);
    }
}
#[test]
fn transfer_process_helper() {
    let Ok(root) = std::env::var("NOFY_MEMORY_TRANSFER_TEST_ROOT") else {
        return;
    };
    let point = std::env::var("NOFY_MEMORY_TRANSFER_TEST_EXIT").unwrap();
    let fingerprint = std::env::var("NOFY_MEMORY_TRANSFER_TEST_FINGERPRINT").unwrap();
    let provider = provider(Path::new(&root));
    let (a, b) = backends();
    let prepared = provider
        .prepare_transfer("move", &a, &b, &fingerprint)
        .unwrap();
    if point == "published" {
        provider.publish_transfer(prepared).unwrap();
    }
    panic!("exit point was not observed");
}
#[tokio::test]
async fn real_generations_preserve_undo_and_latest_data_across_reverse_move_and_historical_replay()
{
    let dir = nofy_test_support::canonical_tempdir().unwrap();
    let provider = provider(dir.path());
    let (a, b) = backends();
    let context = RunContext::new("t", "r");
    let source = provider.open(&a, &context).await.unwrap();
    let first = remember(&source, "Use Rust for the migration boundary.").await;
    let original_root = provider.root.join(storage::hash(b"source-notes"));
    let original = inspect_snapshot(&original_root).unwrap();
    let plan = provider.plan_transfer(&a, &b).unwrap();
    let prepared = provider
        .prepare_transfer("move", &a, &b, &plan.fingerprint)
        .unwrap();
    drop(prepared);
    assert_eq!(
        provider.transfer("move").unwrap().unwrap().phase,
        "prepared"
    );
    assert!(
        !provider
            .namespace_view("source-notes")
            .unwrap()
            .unwrap()
            .active
    );
    assert!(
        !provider
            .namespace_view("target-notes")
            .unwrap()
            .unwrap()
            .active
    );
    assert!(provider.open(&a, &context).await.is_err());
    assert!(provider.open(&b, &context).await.is_err());
    let receipt = provider
        .publish_transfer(provider.resume_transfer("move", &plan.fingerprint).unwrap())
        .unwrap();
    assert_eq!(receipt.phase, "completed");
    assert!(!receipt.source.active);
    assert!(receipt.target.active);
    assert!(provider.open(&a, &context).await.is_err());
    let target = provider.open(&b, &context).await.unwrap();
    assert!(
        target
            .get(first.target.clone())
            .await
            .unwrap()
            .body
            .contains("Rust")
    );
    let later = remember(&target, "A later preference survives reverse migration.").await;
    let reverse = provider.plan_transfer(&b, &a).unwrap();
    let receipt_back = provider
        .publish_transfer(
            provider
                .prepare_transfer("reverse", &b, &a, &reverse.fingerprint)
                .unwrap(),
        )
        .unwrap();
    assert!(receipt_back.target.active);
    assert!(provider.open(&b, &context).await.is_err());
    let current = provider.open(&a, &context).await.unwrap();
    assert!(
        current
            .get(later.target)
            .await
            .unwrap()
            .body
            .contains("later preference")
    );
    current.undo(first.undo_token).await.unwrap();
    assert!(current.get(first.target).await.is_err());
    let before = provider.namespace_view("source-notes").unwrap().unwrap();
    let replay = provider
        .publish_transfer(
            provider
                .prepare_transfer("move", &a, &b, &plan.fingerprint)
                .unwrap(),
        )
        .unwrap();
    assert_eq!(encode(&replay).unwrap(), encode(&receipt).unwrap());
    assert_eq!(
        encode(&provider.namespace_view("source-notes").unwrap().unwrap()).unwrap(),
        encode(&before).unwrap()
    );
    assert_eq!(inspect_snapshot(&original_root).unwrap(), original);
}
#[tokio::test]
async fn prepared_abort_reopens_original_and_invalidates_old_plan_without_overwriting_data() {
    let dir = nofy_test_support::canonical_tempdir().unwrap();
    let provider = provider(dir.path());
    let (a, b) = backends();
    let source = provider.open(&a, &RunContext::new("t", "r")).await.unwrap();
    remember(&source, "Original data survives abort.").await;
    let plan = provider.plan_transfer(&a, &b).unwrap();
    drop(
        provider
            .prepare_transfer("prepare", &a, &b, &plan.fingerprint)
            .unwrap(),
    );
    let aborted = provider
        .abort_transfer("prepare", &plan.fingerprint)
        .unwrap();
    assert_eq!(aborted.phase, "aborted");
    assert!(aborted.source.active);
    assert_eq!(
        encode(
            &provider
                .abort_transfer("prepare", &plan.fingerprint)
                .unwrap()
        )
        .unwrap(),
        encode(&aborted).unwrap()
    );
    assert!(
        provider
            .publish_transfer(
                provider
                    .resume_transfer("prepare", &plan.fingerprint)
                    .unwrap()
            )
            .unwrap()
            .phase
            == "aborted"
    );
    assert_ne!(
        provider.plan_transfer(&a, &b).unwrap().fingerprint,
        plan.fingerprint
    );
    assert!(
        provider
            .prepare_transfer("stale", &a, &b, &plan.fingerprint)
            .is_err()
    );
    assert!(provider.open(&a, &RunContext::new("t", "r")).await.is_ok());
}
#[tokio::test]
async fn holders_used_targets_stale_data_and_modified_prepared_files_fail_before_publication() {
    let dir = nofy_test_support::canonical_tempdir().unwrap();
    let provider = provider(dir.path());
    let (a, b) = backends();
    let context = RunContext::new("t", "r");
    let source = provider.open(&a, &context).await.unwrap();
    remember(&source, "The source is owned.").await;
    let held = provider.acquire(&a, &context).await.unwrap();
    assert!(provider.plan_transfer(&a, &b).is_err());
    drop(held);
    let old = provider.plan_transfer(&a, &b).unwrap();
    remember(&source, "A later edit changes the source.").await;
    assert!(
        provider
            .prepare_transfer("stale", &a, &b, &old.fingerprint)
            .is_err()
    );
    assert!(provider.transfer("stale").unwrap().is_none());
    let plan = provider.plan_transfer(&a, &b).unwrap();
    drop(
        provider
            .prepare_transfer("ready", &a, &b, &plan.fingerprint)
            .unwrap(),
    );
    let status = provider.transfer("ready").unwrap().unwrap();
    let generation = status.target.generation;
    let schema = provider
        .root
        .join(".transfers")
        .join(generation)
        .join("store/schema.json");
    std::fs::write(schema, b"{}").unwrap();
    assert!(
        provider
            .resume_transfer("ready", &plan.fingerprint)
            .is_err()
    );
    assert!(
        !provider
            .namespace_view("source-notes")
            .unwrap()
            .unwrap()
            .active
    );
    provider.abort_transfer("ready", &plan.fingerprint).unwrap();
    let target = provider.open(&b, &context).await.unwrap();
    remember(&target, "Unrelated target data must remain.").await;
    assert!(provider.plan_transfer(&a, &b).is_err());
}
#[tokio::test]
async fn actual_process_exit_after_intent_preparation_and_publication_recovers_one_original_command()
 {
    for exit in ["intent", "prepared", "published"] {
        let dir = nofy_test_support::canonical_tempdir().unwrap();
        let provider = provider(dir.path());
        let (a, b) = backends();
        let source = provider.open(&a, &RunContext::new("t", "r")).await.unwrap();
        let kept = remember(&source, "Keep the original state after owner loss.").await;
        let gone = remember(&source, "The retired note is forgotten.").await;
        source
            .forget(ForgetRequest {
                target: gone.target.clone(),
                confirmed: true,
            })
            .await
            .unwrap();
        let plan = provider.plan_transfer(&a, &b).unwrap();
        let result = std::process::Command::new(std::env::current_exe().unwrap())
            .args([
                "--exact",
                "loader::memory::transfer::tests::transfer_process_helper",
                "--nocapture",
            ])
            .env("NOFY_MEMORY_TRANSFER_TEST_ROOT", dir.path())
            .env("NOFY_MEMORY_TRANSFER_TEST_EXIT", exit)
            .env("NOFY_MEMORY_TRANSFER_TEST_FINGERPRINT", &plan.fingerprint)
            .output()
            .unwrap();
        assert_eq!(
            result.status.code(),
            Some(74),
            "{}",
            String::from_utf8_lossy(&result.stderr)
        );
        let restored = self::provider(dir.path());
        if exit != "published" {
            assert!(
                !restored
                    .namespace_view("source-notes")
                    .unwrap()
                    .unwrap()
                    .active
            );
        }
        let receipt = restored
            .publish_transfer(
                restored
                    .prepare_transfer("move", &a, &b, &plan.fingerprint)
                    .unwrap(),
            )
            .unwrap();
        assert_eq!(receipt.phase, "completed");
        let target = restored.open(&b, &RunContext::new("t", "r")).await.unwrap();
        assert!(target.get(kept.target).await.is_ok());
        assert!(target.get(gone.target).await.is_err());
        assert!(target.undo(gone.undo_token).await.is_err());
        assert_eq!(
            receipt.target.generation,
            restored
                .namespace_view("target-notes")
                .unwrap()
                .unwrap()
                .generation
        );
    }
}

#[tokio::test]
async fn lost_namespace_rows_or_broken_seals_never_reopen_the_retired_origin() {
    let dir = nofy_test_support::canonical_tempdir().unwrap();
    let provider = provider(dir.path());
    let (a, b) = backends();
    let context = RunContext::new("t", "r");
    let source = provider.open(&a, &context).await.unwrap();
    remember(&source, "Metadata loss must fail closed.").await;
    let plan = provider.plan_transfer(&a, &b).unwrap();
    provider
        .publish_transfer(
            provider
                .prepare_transfer("move", &a, &b, &plan.fingerprint)
                .unwrap(),
        )
        .unwrap();
    let db = provider.catalog(true).unwrap().unwrap();
    db.execute("DELETE FROM namespaces WHERE namespace='source-notes'", [])
        .unwrap();
    assert!(provider.open(&a, &context).await.is_err());
    assert!(provider.namespace_view("source-notes").is_err());
    assert!(provider.open(&b, &context).await.is_ok());
}
