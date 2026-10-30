use nofy_agent_host::{HostError, credentials::FileCredentials};
use nofy_agent_runtime::control::ControlError;
use nofy_sampler::agent_model::declarative::CredentialProvider;
use std::sync::{
    Arc,
    atomic::{AtomicUsize, Ordering},
};
struct Initial(Arc<AtomicUsize>);
#[async_trait::async_trait]
impl CredentialProvider for Initial {
    fn identity(&self) -> &str {
        "credentials-v1:project"
    }
    async fn resolve(&self, _: &str) -> Result<Option<String>, nofy_agent_runtime::Error> {
        self.0.fetch_add(1, Ordering::SeqCst);
        Ok(Some("private-bootstrap-value".into()))
    }
}
#[tokio::test]
async fn versioned_tombstones_override_bootstrap_and_metadata_never_contains_values() {
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("credentials.json");
    let reads = Arc::new(AtomicUsize::new(0));
    let store =
        FileCredentials::open(&path, "project", Some(Arc::new(Initial(reads.clone())))).unwrap();
    assert!(!path.exists());
    assert_eq!(store.inspect().await.unwrap().revision, 0);
    assert!(!path.exists());
    assert_eq!(
        store.resolve("TOKEN").await.unwrap().as_deref(),
        Some("private-bootstrap-value")
    );
    assert_eq!(reads.load(Ordering::SeqCst), 1);
    let revoked = store.set("TOKEN", None, None).await.unwrap();
    assert!(!revoked.available);
    assert_eq!(revoked.revision, 1);
    assert!(store.resolve("TOKEN").await.unwrap().is_none());
    assert_eq!(reads.load(Ordering::SeqCst), 1);
    assert!(matches!(
        store.set("TOKEN", None, Some("stale-secret".into())).await,
        Err(HostError::Control(ControlError::Conflict { .. }))
    ));
    store
        .set("TOKEN", Some(1), Some("private-replacement-value".into()))
        .await
        .unwrap();
    let metadata = serde_json::to_string(&store.inspect().await.unwrap()).unwrap();
    assert!(!metadata.contains("private-"));
    assert!(!metadata.contains("value"));
    let reopened = FileCredentials::open(&path, "project", None).unwrap();
    assert_eq!(
        reopened.resolve("TOKEN").await.unwrap().as_deref(),
        Some("private-replacement-value")
    );
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        assert_eq!(
            std::fs::metadata(path).unwrap().permissions().mode() & 0o777,
            0o600
        );
    }
}
#[tokio::test]
async fn malformed_insecure_or_wrong_authority_files_fail_closed_without_secret_diagnostics() {
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("credentials.json");
    let reads = Arc::new(AtomicUsize::new(0));
    let store =
        FileCredentials::open(&path, "project", Some(Arc::new(Initial(reads.clone())))).unwrap();
    store
        .set("TOKEN", None, Some("private-value".into()))
        .await
        .unwrap();
    let valid = std::fs::read(&path).unwrap();
    std::fs::write(&path, b"{\"schema_version\":\"sensitive-invalid-value\"}").unwrap();
    assert!(
        !store
            .inspect()
            .await
            .unwrap_err()
            .to_string()
            .contains("sensitive-invalid-value")
    );
    assert!(
        !store
            .resolve("TOKEN")
            .await
            .unwrap_err()
            .to_string()
            .contains("sensitive-invalid-value")
    );
    assert_eq!(reads.load(Ordering::SeqCst), 0);
    std::fs::write(&path, valid).unwrap();
    assert!(
        FileCredentials::open(&path, "other-project", None)
            .unwrap()
            .resolve("TOKEN")
            .await
            .is_err()
    );
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        std::fs::set_permissions(&path, std::fs::Permissions::from_mode(0o644)).unwrap();
        assert!(store.resolve("TOKEN").await.is_err());
    }
    for name in ["../TOKEN", "TOKEN/other", "", "TOKEN space"] {
        assert!(store.set(name, None, Some("value".into())).await.is_err());
    }
    assert!(
        store
            .set("OVERSIZE", None, Some("x".repeat(16385)))
            .await
            .is_err()
    );
}
#[tokio::test]
async fn independent_store_instances_cannot_lose_concurrent_rotations() {
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("credentials.json");
    let a = FileCredentials::open(&path, "project", None).unwrap();
    let b = FileCredentials::open(&path, "project", None).unwrap();
    a.set("TOKEN", None, Some("initial-value".into()))
        .await
        .unwrap();
    let (one, two) = tokio::join!(
        a.set("TOKEN", Some(1), Some("one-value".into())),
        b.set("TOKEN", Some(1), Some("two-value".into()))
    );
    assert_eq!(usize::from(one.is_ok()) + usize::from(two.is_ok()), 1);
    assert_eq!(a.inspect().await.unwrap().revision, 2);
}
#[tokio::test]
async fn credential_cas_child() {
    let Ok(path) = std::env::var("NOFY_CREDENTIAL_CAS_CHILD") else {
        return;
    };
    let store = FileCredentials::open(path, "project", None).unwrap();
    let value = std::env::var("NOFY_CREDENTIAL_CAS_ACTOR").unwrap();
    let result = store.set("TOKEN", Some(1), Some(value)).await;
    match result {
        Ok(_) => std::process::exit(98),
        Err(HostError::Control(ControlError::Conflict { .. })) => std::process::exit(99),
        Err(error) => panic!("{error}"),
    }
}
#[tokio::test]
async fn real_process_cas_accepts_exactly_one_rotation() {
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("credentials.json");
    let store = FileCredentials::open(&path, "project", None).unwrap();
    store
        .set("TOKEN", None, Some("initial-value".into()))
        .await
        .unwrap();
    let spawn = |actor: &str| {
        tokio::process::Command::new(std::env::current_exe().unwrap())
            .args(["--exact", "credential_cas_child", "--nocapture"])
            .env("NOFY_CREDENTIAL_CAS_CHILD", &path)
            .env("NOFY_CREDENTIAL_CAS_ACTOR", actor)
            .kill_on_drop(true)
            .stdout(std::process::Stdio::null())
            .stderr(std::process::Stdio::piped())
            .spawn()
            .unwrap()
    };
    let a = spawn("process-one");
    let b = spawn("process-two");
    let (a, b) = tokio::time::timeout(std::time::Duration::from_secs(10), async {
        tokio::join!(a.wait_with_output(), b.wait_with_output())
    })
    .await
    .unwrap();
    let mut codes = [
        a.unwrap().status.code().unwrap(),
        b.unwrap().status.code().unwrap(),
    ];
    codes.sort();
    assert_eq!(codes, [98, 99]);
    assert_eq!(store.inspect().await.unwrap().revision, 2);
}
