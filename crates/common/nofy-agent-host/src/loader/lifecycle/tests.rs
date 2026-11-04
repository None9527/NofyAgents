use super::*;
use nofy_agent_runtime::artifact::ArtifactBundle;
fn ready<T>(mut operation: impl FnMut() -> Result<T>) -> T {
    let deadline = std::time::Instant::now() + std::time::Duration::from_secs(5);
    loop {
        match operation() {
            Ok(value) => return value,
            // Other tests fork real children. A CLOEXEC descriptor can remain
            // inherited until that child reaches exec; Busy is a valid result.
            Err(HostError::Unavailable(message))
                if message.starts_with("loader cache is in use")
                    && std::time::Instant::now() < deadline =>
            {
                std::thread::sleep(std::time::Duration::from_millis(2))
            }
            Err(error) => panic!("{error}"),
        }
    }
}
fn bundle() -> ArtifactBundle {
    ArtifactBundle {
        schema_version: 1,
        files: [("main.sh".into(), "printf '{}'".into())].into(),
    }
}
fn populated() -> (tempfile::TempDir, Loader) {
    let dir = tempfile::tempdir().unwrap();
    let loader = Loader::open(dir.path()).unwrap();
    loader.artifacts.put(bundle()).unwrap();
    loader.artifacts.materialize(&bundle()).unwrap();
    (dir, loader)
}
fn command(view: &CacheView, id: &str) -> CacheCommand {
    CacheCommand {
        command_id: id.into(),
        expected_revision: view.revision,
        fingerprint: view.plan.fingerprint.clone(),
        after: view.plan.after.clone(),
        limit: view.plan.limit,
    }
}
#[test]
fn independent_open_descriptions_and_hosts_protect_cache_use() {
    let (dir, loader) = populated();
    let other = Loader::open(dir.path()).unwrap();
    let first = ready(|| loader.cache.shared());
    let second = ready(|| other.cache.shared());
    assert!(other.cache.inspect("", 8).is_err());
    drop(first);
    assert!(loader.cache.inspect("", 8).is_err());
    drop(second);
    assert_eq!(ready(|| loader.cache.inspect("", 8)).plan.entries.len(), 1);
    let exclusive = ready(|| loader.cache.exclusive());
    assert!(other.cache.shared().is_err());
    drop(exclusive);
    drop(ready(|| other.cache.shared()));
}
#[test]
fn preview_cas_eviction_symlinks_replay_and_new_same_name_cache_are_safe() {
    let (dir, loader) = populated();
    let tree = loader.artifacts.materialize(&bundle()).unwrap();
    let outside = dir.path().join("outside");
    std::fs::write(&outside, b"keep").unwrap();
    std::os::unix::fs::symlink(&outside, tree.join("external-link")).unwrap();
    let view = ready(|| loader.cache.inspect("", 1));
    assert!(tree.exists());
    let mut request = command(&view, "collect");
    request.fingerprint = "0".repeat(64);
    assert!(loader.cache.collect(request).is_err());
    assert!(tree.exists());
    std::fs::write(tree.join("changed"), b"changed").unwrap();
    assert!(loader.cache.collect(command(&view, "collect")).is_err());
    assert!(tree.exists());
    let view = ready(|| loader.cache.inspect("", 1));
    let request = command(&view, "collect");
    let receipt = ready(|| loader.cache.collect(request.clone()));
    assert!(matches!(receipt.state, CacheState::Complete));
    assert!(!tree.exists());
    assert_eq!(std::fs::read(&outside).unwrap(), b"keep");
    assert_eq!(
        loader
            .artifacts
            .get(&bundle().digest().unwrap())
            .unwrap()
            .files,
        bundle().files
    );
    loader.artifacts.materialize(&bundle()).unwrap();
    let replay = ready(|| loader.cache.collect(request.clone()));
    assert_eq!(
        serde_json::to_value(receipt).unwrap(),
        serde_json::to_value(replay).unwrap()
    );
    assert!(tree.exists());
    assert!(loader.cache.collect(command(&view, "different")).is_err());
    assert!(tree.exists());
}
#[test]
fn receipt_retention_rejects_expired_operations_and_corruption_before_deleting() {
    let dir = tempfile::tempdir().unwrap();
    let loader = Loader::open(dir.path()).unwrap();
    let old = command(&ready(|| loader.cache.inspect("", 8)), "empty");
    for _ in 0..65 {
        let view = ready(|| loader.cache.inspect("", 8));
        ready(|| loader.cache.collect(command(&view, "empty")));
    }
    assert!(loader.cache.receipt(1).is_err());
    assert!(loader.cache.collect(old).is_err());
    assert_eq!(loader.cache.read().unwrap().receipts.len(), 64);
    loader.artifacts.materialize(&bundle()).unwrap();
    let path = loader.cache.root.join("gc.json");
    let mut envelope: serde_json::Value =
        serde_json::from_slice(&std::fs::read(&path).unwrap()).unwrap();
    envelope["data"]["revision"] = serde_json::json!(99);
    std::fs::write(path, serde_json::to_vec(&envelope).unwrap()).unwrap();
    assert!(loader.cache.inspect("", 8).is_err());
    assert!(
        dir.path()
            .join("loader/artifacts/trees")
            .join(bundle().digest().unwrap())
            .exists()
    );
}
#[test]
fn cache_exit_fixture() {
    let Ok(root) = std::env::var("NOFY_CACHE_EXIT_ROOT") else {
        return;
    };
    let mut loader = Loader::open(Path::new(&root)).unwrap();
    loader.cache.test_exit = Some(
        match std::env::var("NOFY_CACHE_EXIT_MODE").unwrap().as_str() {
            "move" => "move",
            "purge" => "purge",
            _ => panic!("exit mode"),
        },
    );
    let request: CacheCommand =
        serde_json::from_slice(&std::fs::read(Path::new(&root).join("command.json")).unwrap())
            .unwrap();
    ready(|| loader.cache.collect(request.clone()));
    panic!("expected real exit in cache commit window");
}
#[test]
fn real_exit_after_move_or_purge_resumes_without_deleting_recreated_cache() {
    for (mode, code) in [("move", 97), ("purge", 98)] {
        let (dir, loader) = populated();
        let view = ready(|| loader.cache.inspect("", 8));
        let request = command(&view, "interrupted");
        std::fs::write(
            dir.path().join("command.json"),
            serde_json::to_vec(&request).unwrap(),
        )
        .unwrap();
        let output = std::process::Command::new(std::env::current_exe().unwrap())
            .args([
                "--exact",
                "loader::lifecycle::tests::cache_exit_fixture",
                "--nocapture",
            ])
            .env("NOFY_CACHE_EXIT_ROOT", dir.path())
            .env("NOFY_CACHE_EXIT_MODE", mode)
            .output()
            .unwrap();
        assert_eq!(
            output.status.code(),
            Some(code),
            "{}",
            String::from_utf8_lossy(&output.stderr)
        );
        let reopened = Loader::open(dir.path()).unwrap();
        assert!(matches!(
            reopened.cache.receipt(1).unwrap().state,
            CacheState::Pending
        ));
        let recreated = reopened.artifacts.materialize(&bundle()).unwrap();
        let receipt = ready(|| reopened.cache.collect(request.clone()));
        assert!(matches!(receipt.state, CacheState::Complete));
        assert_eq!(
            receipt.retained_new,
            vec![format!("artifact:{}", bundle().digest().unwrap())]
        );
        assert!(recreated.join("main.sh").exists());
        ready(|| reopened.cache.collect(request.clone()));
        assert!(recreated.join("main.sh").exists());
        assert_eq!(
            std::fs::read_dir(reopened.cache.root.join("trash"))
                .unwrap()
                .count(),
            0
        );
    }
}
#[test]
fn cache_root_replacement_and_invalid_input_never_walk_outside() {
    let (dir, loader) = populated();
    assert!(loader.cache.inspect("../outside", 8).is_err());
    assert!(loader.cache.inspect("", 17).is_err());
    let root = &loader.cache.caches[&CacheKind::Image];
    std::fs::remove_dir(root).unwrap();
    let outside = dir.path().join("outside-tree");
    std::fs::create_dir(&outside).unwrap();
    std::fs::write(outside.join("protected"), b"keep").unwrap();
    std::os::unix::fs::symlink(&outside, root).unwrap();
    assert!(loader.cache.inspect("", 8).is_err());
    assert_eq!(std::fs::read(outside.join("protected")).unwrap(), b"keep");
}

#[cfg(target_arch = "x86_64")]
#[test]
fn real_image_quarantine_remains_in_quota_until_interrupted_collection_resumes() {
    let dir = tempfile::tempdir().unwrap();
    let loader = Loader::open(dir.path()).unwrap();
    let image=images::RuntimeImage::capture(serde_json::from_value(serde_json::json!({"id":"quota","executable":"bin/loader","files":{"bin/loader":"/usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2"}})).unwrap()).unwrap();
    loader.images.put(image.clone()).unwrap();
    loader.images.materialize(&image.manifest, 0).unwrap();
    let view = ready(|| loader.cache.inspect("", 8));
    let request = command(&view, "image-quota");
    std::fs::write(
        dir.path().join("command.json"),
        serde_json::to_vec(&request).unwrap(),
    )
    .unwrap();
    let output = std::process::Command::new(std::env::current_exe().unwrap())
        .args([
            "--exact",
            "loader::lifecycle::tests::cache_exit_fixture",
            "--nocapture",
        ])
        .env("NOFY_CACHE_EXIT_ROOT", dir.path())
        .env("NOFY_CACHE_EXIT_MODE", "move")
        .output()
        .unwrap();
    assert_eq!(output.status.code(), Some(97));
    let reopened = Loader::open(dir.path()).unwrap();
    let bytes = image
        .manifest
        .files
        .values()
        .map(|file| file.size)
        .sum::<u64>();
    {
        let _use = ready(|| reopened.cache.shared());
        assert_eq!(
            reopened.cache.quarantined_bytes(CacheKind::Image).unwrap(),
            bytes
        );
        launch::RuntimeSource::Locked(Arc::new(image.manifest.clone()))
            .prepare(&reopened)
            .unwrap();
        assert_eq!(
            reopened.cache.quarantined_bytes(CacheKind::Image).unwrap(),
            bytes
        );
    }
    let receipt = ready(|| reopened.cache.collect(request.clone()));
    assert!(matches!(receipt.state, CacheState::Complete));
    assert_eq!(
        reopened.cache.quarantined_bytes(CacheKind::Image).unwrap(),
        0
    );
    assert!(
        dir.path()
            .join("loader/images/trees")
            .join(image.manifest.digest().unwrap())
            .exists()
    );
}
