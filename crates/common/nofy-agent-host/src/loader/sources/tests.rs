use super::*;
#[tokio::test]
async fn failed_receipt_commit_retains_admission_after_caller_cancellation() {
    let (_, mut command, mut policy) = fixture();
    policy.credential_ref = Some("MISSING".into());
    command.policy_digest = policy.digest().unwrap();
    let dir = tempfile::tempdir().unwrap();
    let mut loader = Loader::open(dir.path()).unwrap();
    let entered = Arc::new(std::sync::Barrier::new(2));
    let release = Arc::new(std::sync::Barrier::new(2));
    loader.sources.test_fail_commit = Some((entered.clone(), release.clone()));
    loader.sources.set("repo", None, Some(policy)).unwrap();
    loader.set_source_credentials(Arc::new(
        crate::credentials::FileCredentials::open(
            dir.path().join("credentials.json"),
            "source-test",
            None,
        )
        .unwrap(),
    ));
    let cancel = tokio_util::sync::CancellationToken::new();
    let signal = cancel.clone();
    let source = loader.clone();
    let task = tokio::spawn(async move { source.acquire_image(command, signal).await });
    tokio::task::spawn_blocking(move || entered.wait())
        .await
        .unwrap();
    assert_eq!(loader.sources.work.available_permits(), 1);
    cancel.cancel();
    assert!(task.await.unwrap().is_err());
    assert_eq!(loader.sources.work.available_permits(), 1);
    tokio::task::spawn_blocking(move || release.wait())
        .await
        .unwrap();
    tokio::time::timeout(std::time::Duration::from_secs(5), async {
        while loader.sources.work.available_permits() != 2 {
            tokio::task::yield_now().await;
        }
    })
    .await
    .unwrap();
    assert!(matches!(
        loader.sources.acquisition("acquire").unwrap().status,
        AcquisitionState::Failed { .. }
    ));
}
#[test]
fn admission_exit_fixture() {
    let Ok(directory) = std::env::var("NOFY_SOURCE_ADMISSION_EXIT") else {
        return;
    };
    let root = Path::new(&directory);
    let mut store = SourceStore::open(&root.join("sources")).unwrap();
    store.test_exit_after_admission = Some(98);
    let images = images::ImageStore::open(&root.join("images")).unwrap();
    let pending = store.acquisition("acquire").unwrap();
    let image = serde_json::from_slice(&std::fs::read(root.join("payload.json")).unwrap()).unwrap();
    store.finish(&pending, image, &images).unwrap();
    panic!("expected real process exit after immutable image admission");
}
#[test]
fn real_exit_between_image_and_receipt_commits_keeps_intent_and_repairs_by_exact_retry() {
    let (image, command, policy) = fixture();
    let dir = tempfile::tempdir().unwrap();
    let store = SourceStore::open(&dir.path().join("sources")).unwrap();
    store.set("repo", None, Some(policy)).unwrap();
    let store::Begin::Attempt(_) = store.begin(command.clone()).unwrap() else {
        panic!("intent")
    };
    std::fs::write(
        dir.path().join("payload.json"),
        serde_json::to_vec(&image).unwrap(),
    )
    .unwrap();
    let output = std::process::Command::new(std::env::current_exe().unwrap())
        .args([
            "--exact",
            "loader::sources::tests::admission_exit_fixture",
            "--nocapture",
        ])
        .env("NOFY_SOURCE_ADMISSION_EXIT", dir.path())
        .output()
        .unwrap();
    assert_eq!(
        output.status.code(),
        Some(98),
        "{}",
        String::from_utf8_lossy(&output.stderr)
    );
    let images = images::ImageStore::open(&dir.path().join("images")).unwrap();
    assert_eq!(images.list("", 1).unwrap().len(), 1);
    let reopened = SourceStore::open(&dir.path().join("sources")).unwrap();
    assert!(matches!(
        reopened.acquisition("acquire").unwrap().status,
        AcquisitionState::Pending
    ));
    let store::Begin::Attempt(attempt) = reopened.begin(command.clone()).unwrap() else {
        panic!("retry")
    };
    let completed = reopened.finish(&attempt, image, &images).unwrap();
    assert!(matches!(completed.status, AcquisitionState::Complete));
    let store::Begin::Complete(replayed) = reopened.begin(command).unwrap() else {
        panic!("replay")
    };
    assert_eq!(replayed.revision, completed.revision);
}
use std::io::Read;
fn fixture() -> (images::RuntimeImage, AcquireImage, SourcePolicy) {
    let image=images::RuntimeImage::capture(serde_json::from_value(serde_json::json!({"id":"source","executable":"bin/loader","files":{"bin/loader":"/usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2"}})).unwrap()).unwrap();
    let payload = serde_json::to_vec(&image).unwrap();
    let mut seed = [0; 32];
    std::fs::File::open("/dev/urandom")
        .unwrap()
        .read_exact(&mut seed)
        .unwrap();
    let (attestation, key) = ImageAttestation::sign(&payload, "publisher".into(), &seed).unwrap();
    let policy = SourcePolicy {
        base_url: "https://example.org/repo/".into(),
        keys: [("publisher".into(), key)].into(),
        credential_ref: None,
        allow_loopback_http: false,
    };
    let command = AcquireImage {
        command_id: "acquire".into(),
        source: "repo".into(),
        policy_digest: policy.digest().unwrap(),
        path: "image.json".into(),
        attestation,
    };
    (image, command, policy)
}
#[test]
fn source_signature_origin_and_path_invariants_are_strict() {
    let (_, command, policy) = fixture();
    command.attestation.verify(&policy).unwrap();
    let mut wrong = command.clone();
    wrong.attestation.payload_digest = "0".repeat(64);
    assert!(wrong.attestation.verify(&policy).is_err());
    for path in [
        "../escape",
        "https://other/image",
        "a%2fimage",
        "a//b",
        "image?secret=1",
    ] {
        let mut wrong = command.clone();
        wrong.path = path.into();
        assert!(wrong.validate().is_err());
    }
    for origin in [
        "http://example.org/",
        "https://user:secret@example.org/",
        "https://example.org/repo?secret=x",
        "https://example.org/repo",
        "https://example.org/a%2Fb/",
    ] {
        let mut wrong = policy.clone();
        wrong.base_url = origin.into();
        assert!(wrong.validate().is_err());
    }
    let mut local = policy.clone();
    local.base_url = "http://127.0.0.1/repo/".into();
    assert!(local.validate().is_err());
    local.allow_loopback_http = true;
    local.validate().unwrap();
    local.base_url = "http://192.168.1.1/".into();
    assert!(local.validate().is_err());
}
#[test]
fn source_cas_attempt_fences_revocation_replay_and_reopen_are_durable() {
    let (image, command, policy) = fixture();
    let dir = tempfile::tempdir().unwrap();
    let store = SourceStore::open(dir.path()).unwrap();
    let cache = tempfile::tempdir().unwrap();
    let images = images::ImageStore::open(cache.path()).unwrap();
    let created = store.set("repo", None, Some(policy.clone())).unwrap();
    assert!(store.set("repo", None, Some(policy.clone())).is_err());
    store.preflight(&command).unwrap();
    assert!(store.acquisition("acquire").is_err());
    let store::Begin::Attempt(first) = store.begin(command.clone()).unwrap() else {
        panic!("attempt")
    };
    let revoked = store.set("repo", Some(created.revision), None).unwrap();
    assert!(store.finish(&first, image.clone(), &images).is_err());
    assert!(images.list("", 1).unwrap().is_empty());
    let restored = store
        .set("repo", Some(revoked.revision), Some(policy.clone()))
        .unwrap();
    assert!(store.finish(&first, image.clone(), &images).is_err());
    let store::Begin::Attempt(second) = store.begin(command.clone()).unwrap() else {
        panic!("attempt")
    };
    assert_eq!(second.policy_revision, restored.revision);
    assert_eq!(second.attempt, 2);
    assert!(store.finish(&first, image.clone(), &images).is_err());
    let complete = store.finish(&second, image, &images).unwrap();
    assert!(matches!(complete.status, AcquisitionState::Complete));
    store.set("repo", Some(restored.revision), None).unwrap();
    store.preflight(&command).unwrap();
    let reopened = SourceStore::open(dir.path()).unwrap();
    let store::Begin::Complete(replayed) = reopened.begin(command.clone()).unwrap() else {
        panic!("receipt")
    };
    assert_eq!(replayed.revision, complete.revision);
    let mut conflict = command;
    conflict.path = "other.json".into();
    assert!(reopened.begin(conflict).is_err());
    assert_eq!(reopened.acquisitions("", 1).unwrap().entries.len(), 1);
    assert!(reopened.acquisitions("", 0).is_err());
}
#[test]
fn bootstrap_does_not_undo_live_revocation_and_validates_batch_before_commit() {
    let (_, _, policy) = fixture();
    let dir = tempfile::tempdir().unwrap();
    let store = SourceStore::open(dir.path()).unwrap();
    store
        .bootstrap(vec![BootstrapSource {
            id: "repo".into(),
            expected_revision: None,
            policy: policy.clone(),
        }])
        .unwrap();
    let first = store.get("repo").unwrap();
    store
        .bootstrap(vec![BootstrapSource {
            id: "repo".into(),
            expected_revision: None,
            policy: policy.clone(),
        }])
        .unwrap();
    assert_eq!(store.get("repo").unwrap().revision, first.revision);
    store.set("repo", Some(first.revision), None).unwrap();
    assert!(
        store
            .bootstrap(vec![
                BootstrapSource {
                    id: "other".into(),
                    expected_revision: None,
                    policy: policy.clone()
                },
                BootstrapSource {
                    id: "repo".into(),
                    expected_revision: None,
                    policy
                }
            ])
            .is_err()
    );
    assert!(store.get("other").is_err());
    assert!(store.get("repo").unwrap().policy.is_none());
}
