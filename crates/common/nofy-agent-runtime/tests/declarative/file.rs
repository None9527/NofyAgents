#![allow(clippy::disallowed_methods)] // test fixture processes are killed or waited on by the test that spawns them
use super::*;
fn open(path: &std::path::Path) -> ControlPlane {
    ControlPlane::new(
        Arc::new(FileCatalogStore::open(path).unwrap()),
        factories("1").0,
    )
}
async fn release(plane: &ControlPlane) -> Publication {
    let d = plane
        .save_draft("draft", None, document("first"))
        .await
        .unwrap();
    plane.publish("draft", d.revision).await.unwrap()
}
fn command(release: &str) -> ApplyCommand {
    ApplyCommand {
        command_id: "activate".into(),
        system: "portable".into(),
        release: release.into(),
        expected_generation: None,
    }
}
#[tokio::test]
async fn file_catalog_reopens_and_preserves_publications_activation_and_receipts() {
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("catalog.json");
    let plane = open(&path);
    let a = release(&plane).await;
    let receipt = plane.apply(command(&a.bundle.digest)).await.unwrap();
    drop(plane);
    let reopened = open(&path);
    assert_eq!(
        reopened.apply(receipt.command.clone()).await.unwrap(),
        receipt
    );
    assert_eq!(
        run(&reopened.active_program("portable", "chat").await.unwrap().1).await,
        "actual:first"
    );
    let json: Value = serde_json::from_slice(&std::fs::read(&path).unwrap()).unwrap();
    assert_eq!(json["version"], 1);
    assert!(
        json["view"]["data"]["publications"]
            .as_object()
            .unwrap()
            .contains_key(&a.bundle.digest)
    );
}
#[tokio::test]
async fn real_file_cas_and_corruption_detection_do_not_overwrite_previous_state() {
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("catalog.json");
    let a = FileCatalogStore::open(&path).unwrap();
    let b = FileCatalogStore::open(&path).unwrap();
    let first = a
        .compare_exchange(None, CatalogData::default())
        .await
        .unwrap();
    assert_eq!(first.revision, 1);
    assert!(matches!(
        b.compare_exchange(None, CatalogData::default()).await,
        Err(ControlError::Conflict { .. })
    ));
    let bytes = std::fs::read(&path).unwrap();
    let mut json: Value = serde_json::from_slice(&bytes).unwrap();
    json["view"]["revision"] = json!(9000);
    std::fs::write(&path, serde_json::to_vec(&json).unwrap()).unwrap();
    assert!(a.load().await.is_err());
    assert!(
        b.compare_exchange(Some(1), CatalogData::default())
            .await
            .is_err()
    );
    std::fs::write(&path, &bytes).unwrap();
    assert_eq!(a.load().await.unwrap().unwrap().revision, 1);
    std::fs::write(dir.path().join(".nofy-catalog-orphan.tmp"), b"uncommitted").unwrap();
    assert_eq!(b.load().await.unwrap().unwrap().revision, 1);
}
#[tokio::test]
async fn file_catalog_process_worker() {
    let Ok(directory) = std::env::var("NOFY_DECLARATIVE_DIR") else {
        return;
    };
    let dir = std::path::PathBuf::from(directory);
    let phase = std::env::var("NOFY_DECLARATIVE_PHASE").unwrap();
    let path = dir.join("catalog.json");
    if phase == "cas" {
        let store = FileCatalogStore::open(&path).unwrap();
        let result = store
            .compare_exchange(Some(1), CatalogData::default())
            .await;
        std::process::exit(if result.is_ok() {
            0
        } else if matches!(result, Err(ControlError::Conflict { .. })) {
            42
        } else {
            43
        });
    }
    let plane = open(&path);
    if phase == "publish" {
        release(&plane).await;
        std::process::exit(97);
    }
    let view = plane.inspect().await.unwrap().unwrap();
    let id = view.data.publications.keys().next().unwrap().clone();
    if phase == "apply" {
        plane.apply(command(&id)).await.unwrap();
        std::process::exit(97);
    }
    let before = plane.inspect().await.unwrap().unwrap().revision;
    assert_eq!(
        plane.apply(command(&id)).await.unwrap().active.generation,
        1
    );
    assert_eq!(plane.inspect().await.unwrap().unwrap().revision, before);
    if phase == "execute" {
        let (_, program) = plane.active_program("portable", "chat").await.unwrap();
        let mut context = RunContext::new("process", "process");
        context.capabilities.insert(dir.join("calls.log"));
        assert!(matches!(
            program
                .invoke(RunInput::new("input"), context)
                .await
                .unwrap(),
            RunOutcome::Completed { .. }
        ));
    }
}
#[test]
fn configuration_survives_real_process_exit_and_imports_without_rebuilding_binary() {
    let dir = tempfile::tempdir().unwrap();
    for phase in ["publish", "apply", "replay", "execute", "cached"] {
        let result = std::process::Command::new(std::env::current_exe().unwrap())
            .args([
                "--exact",
                "file::file_catalog_process_worker",
                "--nocapture",
            ])
            .env("NOFY_DECLARATIVE_DIR", dir.path())
            .env("NOFY_DECLARATIVE_PHASE", phase)
            .output()
            .unwrap();
        assert_eq!(
            result.status.code(),
            Some(if matches!(phase, "publish" | "apply") {
                97
            } else {
                0
            }),
            "{phase}: {}{}",
            String::from_utf8_lossy(&result.stdout),
            String::from_utf8_lossy(&result.stderr)
        );
    }
    assert_eq!(
        std::fs::read_to_string(dir.path().join("calls.log"))
            .unwrap()
            .lines()
            .count(),
        1
    );
}
#[tokio::test]
async fn independent_processes_cannot_both_commit_the_same_catalog_revision() {
    let dir = tempfile::tempdir().unwrap();
    let store = FileCatalogStore::open(dir.path().join("catalog.json")).unwrap();
    store
        .compare_exchange(None, CatalogData::default())
        .await
        .unwrap();
    let mut children = (0..2)
        .map(|_| {
            std::process::Command::new(std::env::current_exe().unwrap())
                .args([
                    "--exact",
                    "file::file_catalog_process_worker",
                    "--nocapture",
                ])
                .env("NOFY_DECLARATIVE_DIR", dir.path())
                .env("NOFY_DECLARATIVE_PHASE", "cas")
                .stdout(std::process::Stdio::null())
                .spawn()
                .unwrap()
        })
        .collect::<Vec<_>>();
    let mut results = children
        .iter_mut()
        .map(|p| p.wait().unwrap().code().unwrap())
        .collect::<Vec<_>>();
    results.sort();
    assert_eq!(results, vec![0, 42]);
    assert_eq!(store.load().await.unwrap().unwrap().revision, 2);
}
