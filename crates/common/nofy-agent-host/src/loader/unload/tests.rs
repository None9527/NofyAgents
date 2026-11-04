use super::*;
use nofy_agent_runtime::Error;
use nofy_agent_runtime::artifact::ArtifactBundle;
use nofy_agent_runtime::credentials::CredentialProvider;
use serde_json::json;

struct Credentials;
#[async_trait::async_trait]
impl CredentialProvider for Credentials {
    fn identity(&self) -> &str {
        "unload-tests"
    }
    async fn resolve(&self, _: &str) -> std::result::Result<Option<String>, Error> {
        Err(Error::Composition(
            "unload must not read credentials".into(),
        ))
    }
}
async fn ready(path: &Path) -> KernelHost {
    KernelHost::open(
        path,
        crate::native::registry(Arc::new(Credentials)).unwrap(),
        crate::auth::Authorizer::new(vec![(
            "unload-administrator-token-00000000000000001".into(),
            [crate::auth::Scope::Read, crate::auth::Scope::Resources].into(),
        )])
        .unwrap(),
    )
    .await
    .unwrap()
}
fn bundle() -> ArtifactBundle {
    ArtifactBundle {
        schema_version: 1,
        files: [("main.sh".into(), "exit 0\n".into())].into(),
    }
}
fn command(plan: &UnloadPlan, id: &str) -> UnloadCommand {
    UnloadCommand {
        command_id: id.into(),
        expected_revision: plan.revision,
        fingerprint: plan.fingerprint.clone(),
        objects: plan.objects.clone(),
    }
}
#[tokio::test]
async fn inherited_admission_only_proves_existing_keys_without_dependency_io() {
    use nofy_agent_runtime::admission::CommitAdmission;
    let dir = tempfile::tempdir().unwrap();
    let host = ready(dir.path()).await;
    let policy = super::super::admission::LoaderAdmission(host.loader.clone());
    let held = host.loader.commits.exclusive().unwrap();
    let artifact = |digest: char| -> ModuleDefinition {
        serde_json::from_value(json!({"reference":{"id":"asset","version":"1"},
            "factory":"resource.artifact","config":{"digest":digest.to_string().repeat(64)}}))
        .unwrap()
    };
    let original = artifact('a');
    let other = artifact('b');
    let parent: ModuleDefinition = serde_json::from_value(json!({
        "reference":{"id":"workflow","version":"1"},"factory":"resource.workflow",
        "config":{"document":{"schema_version":1,"modules":[original]}}
    }))
    .unwrap();
    assert!(policy.enter().is_err());
    assert!(
        policy
            .permits_inherited(&[&parent], "checkpoint", &[&original])
            .unwrap()
    );
    assert!(
        !policy
            .permits_inherited(&[&parent], "child", &[&other])
            .unwrap()
    );
    assert!(
        !policy
            .permits_inherited(&[&parent], "job", &[&original])
            .unwrap()
    );
    let mut unknown = parent.clone();
    unknown.config["document"]["schema_version"] = json!(2);
    assert!(
        !policy
            .permits_inherited(&[&unknown], "child", &[&original])
            .unwrap()
    );
    assert!(
        !dir.path()
            .join("loader/artifacts/objects")
            .join(format!("{}.json", "a".repeat(64)))
            .exists()
    );
    drop(held);
}
#[tokio::test]
async fn canonical_artifact_and_cache_unload_replay_preserves_exact_readmission() {
    let dir = tempfile::tempdir().unwrap();
    let host = ready(dir.path()).await;
    let artifact = bundle();
    let digest = host.loader.artifacts.put(artifact.clone()).unwrap().digest;
    let tree = host.loader.artifacts.materialize(&artifact).unwrap();
    let plan = host
        .plan_unload(UnloadRequest {
            objects: vec![ObjectKey::Artifact {
                digest: digest.clone(),
            }],
        })
        .await
        .unwrap();
    assert!(plan.eligible);
    assert_eq!(plan.parts.len(), 2);
    assert!(tree.exists());
    let command = command(&plan, "remove-artifact");
    let receipt = host.unload_objects(command.clone()).await.unwrap();
    assert_eq!(receipt.state, UnloadState::Complete);
    assert!(!tree.exists());
    assert!(host.loader.artifacts.get(&digest).is_err());
    host.loader.artifacts.put(artifact.clone()).unwrap();
    host.loader.artifacts.materialize(&artifact).unwrap();
    assert_eq!(
        host.unload_objects(command).await.unwrap().revision,
        receipt.revision
    );
    assert!(host.loader.artifacts.get(&digest).is_ok());
    assert!(tree.exists());
}

fn install(host: &KernelHost, id: &str) -> runtimes::RuntimeManifest {
    let path = std::fs::canonicalize("/usr/bin/true").unwrap();
    let digest = storage::hash(&std::fs::read(&path).unwrap());
    host.loader
        .runtimes
        .install(runtimes::RuntimeInstall {
            id: id.into(),
            path,
            executable_digest: digest,
            prefix_args: Vec::new(),
            read_roots: Vec::new(),
        })
        .unwrap()
}
#[tokio::test]
async fn real_images_and_runtime_bindings_reclaim_only_unshared_private_bytes() {
    let dir = tempfile::tempdir().unwrap();
    let host = ready(dir.path()).await;
    let image = images::RuntimeImage::capture(serde_json::from_value(json!({"id":"unload-loader","executable":"bin/loader","files":{"bin/loader":"/usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2"}})).unwrap()).unwrap();
    let digest = host.loader.images.put(image.clone()).unwrap().digest;
    let tree = host.loader.images.materialize(&image.manifest, 0).unwrap();
    let plan = host
        .plan_unload(UnloadRequest {
            objects: vec![ObjectKey::Image {
                digest: digest.clone(),
            }],
        })
        .await
        .unwrap();
    assert_eq!(plan.parts.len(), 2);
    host.unload_objects(command(&plan, "remove-image"))
        .await
        .unwrap();
    assert!(!tree.exists());
    assert!(host.loader.images.get(&digest).is_err());
    let first = install(&host, "first");
    let second = install(&host, "second");
    assert_eq!(first.executable_digest, second.executable_digest);
    let bin = dir
        .path()
        .join("loader/runtimes/bin")
        .join(&first.executable_digest);
    let first_plan = host
        .plan_unload(UnloadRequest {
            objects: vec![ObjectKey::Runtime {
                id: first.id,
                revision: first.revision,
            }],
        })
        .await
        .unwrap();
    assert!(first_plan.parts.is_empty());
    assert_eq!(first_plan.bindings.len(), 1);
    host.unload_objects(command(&first_plan, "remove-first"))
        .await
        .unwrap();
    assert!(bin.exists());
    assert!(
        host.loader
            .runtimes
            .find(&second.id, &second.revision)
            .is_ok()
    );
    assert_eq!(host.loader.runtimes.list().unwrap().len(), 1);
    let second_plan = host
        .plan_unload(UnloadRequest {
            objects: vec![ObjectKey::Runtime {
                id: second.id,
                revision: second.revision,
            }],
        })
        .await
        .unwrap();
    assert_eq!(second_plan.parts.len(), 1);
    host.unload_objects(command(&second_plan, "remove-last"))
        .await
        .unwrap();
    assert!(!bin.exists());
    assert!(host.loader.runtimes.list().unwrap().is_empty());
    assert!(std::fs::canonicalize("/usr/bin/true").unwrap().is_file());
}

#[tokio::test]
async fn reference_drift_and_physical_drift_reject_without_deletion_or_revision_change() {
    let dir = tempfile::tempdir().unwrap();
    let host = ready(dir.path()).await;
    let artifact = bundle();
    let digest = host.loader.artifacts.put(artifact.clone()).unwrap().digest;
    let request = UnloadRequest {
        objects: vec![ObjectKey::Artifact {
            digest: digest.clone(),
        }],
    };
    let plan = host.plan_unload(request.clone()).await.unwrap();
    host.control().save_draft("pins", None, serde_json::from_value(json!({"schema_version":1,"name":"pins","modules":[{"reference":{"id":"code","version":"1"},"factory":"resource.artifact","config":{"bundle":artifact}}],"programs":{}})).unwrap()).await.unwrap();
    assert!(
        host.unload_objects(command(&plan, "stale-reference"))
            .await
            .is_err()
    );
    let pinned = host.plan_unload(request.clone()).await.unwrap();
    assert!(!pinned.eligible);
    assert_eq!(pinned.references.references[0].counts["draft"], 1);
    assert!(
        host.unload_objects(command(&pinned, "pinned"))
            .await
            .is_err()
    );
    host.control().delete_draft("pins", 1).await.unwrap();
    let changed = host.plan_unload(request).await.unwrap();
    let path = dir
        .path()
        .join("loader/artifacts/objects")
        .join(format!("{digest}.json"));
    std::fs::write(path, serde_json::to_vec(&artifact).unwrap()).unwrap();
    assert!(
        host.unload_objects(command(&changed, "stale-file"))
            .await
            .is_err()
    );
    assert!(host.loader.artifacts.get(&digest).is_ok());
    assert_eq!(host.loader.unload.status().unwrap().revision, 0);
}

#[tokio::test]
async fn legacy_opaque_state_does_not_become_a_deletion_permission() {
    use nofy_agent_runtime::{Checkpoint, Checkpointer, durable::SqliteStore};
    let dir = tempfile::tempdir().unwrap();
    SqliteStore::open(&dir.path().join("runtime.sqlite"))
        .unwrap()
        .save(
            "legacy",
            None,
            Checkpoint {
                version: 1,
                revision: 1,
                composition: "unknown-native-identity".into(),
                state: Default::default(),
            },
        )
        .await
        .unwrap();
    let host = ready(dir.path()).await;
    let digest = host.loader.artifacts.put(bundle()).unwrap().digest;
    let plan = host
        .plan_unload(UnloadRequest {
            objects: vec![ObjectKey::Artifact {
                digest: digest.clone(),
            }],
        })
        .await
        .unwrap();
    assert!(!plan.eligible);
    assert_eq!(plan.references.references[0].state, "unknown");
    assert!(
        host.unload_objects(command(&plan, "not-authorized"))
            .await
            .is_err()
    );
    assert!(host.loader.artifacts.get(&digest).is_ok());
    assert!(host.store().load("legacy").await.unwrap().is_some());
}

#[test]
fn unload_exit_fixture() {
    let Ok(root) = std::env::var("NOFY_UNLOAD_TEST_ROOT") else {
        return;
    };
    let mode = std::env::var("NOFY_UNLOAD_TEST_MODE").unwrap();
    let runtime = tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
        .unwrap();
    runtime.block_on(async {
        let mut host = ready(Path::new(&root)).await;
        host.loader.unload.test_exit = Some(match mode.as_str() {
            "move" => "move",
            "purge" => "purge",
            "bindings" => "bindings",
            _ => panic!("exit mode"),
        });
        let request: UnloadCommand = serde_json::from_slice(
            &std::fs::read(Path::new(&root).join("unload-command.json")).unwrap(),
        )
        .unwrap();
        host.unload_objects(request).await.unwrap();
        panic!("expected real exit in unload boundary");
    });
}
fn exit_child(root: &Path, mode: &str, command: &UnloadCommand, code: i32) {
    std::fs::write(
        root.join("unload-command.json"),
        serde_json::to_vec(command).unwrap(),
    )
    .unwrap();
    let output = std::process::Command::new(std::env::current_exe().unwrap())
        .args([
            "--exact",
            "loader::unload::tests::unload_exit_fixture",
            "--nocapture",
        ])
        .env("NOFY_UNLOAD_TEST_ROOT", root)
        .env("NOFY_UNLOAD_TEST_MODE", mode)
        .output()
        .unwrap();
    assert_eq!(
        output.status.code(),
        Some(code),
        "{}\n{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
}
#[tokio::test]
async fn real_exit_pending_blocks_admission_and_boot_recovery_preserves_recreated_sources() {
    for (mode, code) in [("move", 97), ("purge", 98)] {
        let dir = tempfile::tempdir().unwrap();
        let host = ready(dir.path()).await;
        let artifact = bundle();
        let digest = host.loader.artifacts.put(artifact.clone()).unwrap().digest;
        host.loader.artifacts.materialize(&artifact).unwrap();
        let plan = host
            .plan_unload(UnloadRequest {
                objects: vec![ObjectKey::Artifact {
                    digest: digest.clone(),
                }],
            })
            .await
            .unwrap();
        let command = command(&plan, "interrupted");
        exit_child(dir.path(), mode, &command, code);
        assert_eq!(
            host.loader.unload.status().unwrap().pending.unwrap().state,
            UnloadState::Pending
        );
        assert!(host.loader.unload.status().unwrap().admission_blocked);
        assert!(host.loader.artifacts.put(artifact.clone()).is_err());
        assert!(host.loader.commits.shared().is_err());
        assert!(host.loader.cache.shared().is_err());
        assert!(host.loader.cache.inspect("", 8).is_err());
        assert!(
            host.store()
                .execution_job("not-admitted")
                .await
                .unwrap()
                .is_none()
        );
        let source = dir
            .path()
            .join("loader/artifacts/objects")
            .join(format!("{digest}.json"));
        std::fs::write(&source, serde_json::to_vec(&artifact).unwrap()).unwrap();
        let reopened = ready(dir.path()).await;
        assert_eq!(
            reopened.loader.unload.receipt(1).unwrap().state,
            UnloadState::Complete
        );
        assert!(!reopened.loader.unload.status().unwrap().admission_blocked);
        assert!(reopened.loader.artifacts.get(&digest).is_ok());
        assert!(
            !dir.path()
                .join("loader/artifacts/trees")
                .join(&digest)
                .exists()
        );
        assert_eq!(reopened.unload_objects(command).await.unwrap().revision, 1);
        assert!(source.exists());
    }
}
#[tokio::test]
async fn runtime_metadata_exit_is_idempotently_recovered_before_worker_admission() {
    let dir = tempfile::tempdir().unwrap();
    let host = ready(dir.path()).await;
    let manifest = install(&host, "recover");
    let binary = dir
        .path()
        .join("loader/runtimes/bin")
        .join(&manifest.executable_digest);
    let plan = host
        .plan_unload(UnloadRequest {
            objects: vec![ObjectKey::Runtime {
                id: manifest.id,
                revision: manifest.revision,
            }],
        })
        .await
        .unwrap();
    let command = command(&plan, "remove-runtime");
    exit_child(dir.path(), "bindings", &command, 96);
    assert!(binary.exists());
    assert!(!host.loader.unload.receipt(1).unwrap().bindings_checked);
    let reopened = ready(dir.path()).await;
    assert!(!binary.exists());
    assert!(reopened.loader.runtimes.list().unwrap().is_empty());
    assert_eq!(
        reopened.loader.unload.receipt(1).unwrap().state,
        UnloadState::Complete
    );
}

#[tokio::test]
async fn expired_receipts_cannot_delete_readmitted_objects_and_v1_bootstrap_is_bounded() {
    let dir = tempfile::tempdir().unwrap();
    let host = ready(dir.path()).await;
    let mut first = None;
    for index in 0..65 {
        let mut artifact = bundle();
        artifact
            .files
            .insert("main.sh".into(), format!("printf '%s\\n' {index}\n"));
        let digest = host.loader.artifacts.put(artifact.clone()).unwrap().digest;
        let plan = host
            .plan_unload(UnloadRequest {
                objects: vec![ObjectKey::Artifact {
                    digest: digest.clone(),
                }],
            })
            .await
            .unwrap();
        let command = command(&plan, &format!("remove-{index}"));
        if index == 0 {
            first = Some((artifact, digest, command.clone()));
        }
        host.unload_objects(command).await.unwrap();
    }
    let (artifact, digest, old) = first.unwrap();
    host.loader.artifacts.put(artifact).unwrap();
    assert!(host.unload_objects(old).await.is_err());
    assert!(host.loader.unload.receipt(1).is_err());
    assert!(host.loader.artifacts.get(&digest).is_ok());
    drop(host);
    std::fs::write(
        dir.path().join("loader/lifecycle/commit-protocol.json"),
        b"\"nofy.loader-commit/v1\"",
    )
    .unwrap();
    let reopened = ready(dir.path()).await;
    assert_eq!(
        std::fs::read(dir.path().join("loader/lifecycle/commit-protocol.json")).unwrap(),
        b"\"nofy.loader-commit/v2\""
    );
    assert!(reopened.loader.artifacts.get(&digest).is_ok());
    assert_eq!(reopened.loader.unload.status().unwrap().revision, 65);
}

#[tokio::test(flavor = "multi_thread", worker_threads = 2)]
async fn cancelled_callers_keep_actual_maintenance_and_management_permits_until_completion() {
    let dir = tempfile::tempdir().unwrap();
    let mut host = ready(dir.path()).await;
    let digest = host.loader.artifacts.put(bundle()).unwrap().digest;
    let plan = host
        .plan_unload(UnloadRequest {
            objects: vec![ObjectKey::Artifact {
                digest: digest.clone(),
            }],
        })
        .await
        .unwrap();
    let entered = Arc::new(tokio::sync::Notify::new());
    let (release, wait) = std::sync::mpsc::channel();
    host.loader.unload.test_pause =
        Some((entered.clone(), Arc::new(std::sync::Mutex::new(Some(wait)))));
    let executing = host.clone();
    let command = command(&plan, "cancelled-client");
    let task = tokio::spawn(async move { executing.unload_objects(command).await });
    tokio::time::timeout(std::time::Duration::from_secs(5), entered.notified())
        .await
        .unwrap();
    task.abort();
    assert!(matches!(task.await,Err(e) if e.is_cancelled()));
    assert_eq!(host.loader.management_work.available_permits(), 1);
    assert_eq!(host.loader.reference_work.available_permits(), 1);
    assert!(host.loader.unload.status().unwrap().admission_blocked);
    assert!(host.loader.commits.shared().is_err());
    assert!(host.loader.cache.shared().is_err());
    release.send(()).unwrap();
    tokio::time::timeout(std::time::Duration::from_secs(5), async {
        while host.loader.management_work.available_permits() != 2 {
            tokio::task::yield_now().await;
        }
    })
    .await
    .unwrap();
    assert_eq!(host.loader.reference_work.available_permits(), 2);
    assert_eq!(
        host.loader.unload.receipt(1).unwrap().state,
        UnloadState::Complete
    );
    assert!(host.loader.artifacts.get(&digest).is_err());
}

#[tokio::test]
async fn v1_cache_pending_can_still_reopen_and_use_its_original_recovery_api() {
    let dir = tempfile::tempdir().unwrap();
    let host = ready(dir.path()).await;
    host.loader.artifacts.materialize(&bundle()).unwrap();
    let view = host.loader.cache.inspect("", 8).unwrap();
    let request = lifecycle::CacheCommand {
        command_id: "old-cache".into(),
        expected_revision: view.revision,
        fingerprint: view.plan.fingerprint,
        after: String::new(),
        limit: 8,
    };
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
    assert_eq!(
        output.status.code(),
        Some(97),
        "{}",
        String::from_utf8_lossy(&output.stderr)
    );
    drop(host);
    std::fs::remove_file(dir.path().join("loader/lifecycle/objects/barrier.json")).unwrap();
    std::fs::write(
        dir.path().join("loader/lifecycle/commit-protocol.json"),
        b"\"nofy.loader-commit/v1\"",
    )
    .unwrap();
    let reopened = ready(dir.path()).await;
    assert!(reopened.loader.cache.has_pending().unwrap());
    assert!(!reopened.loader.unload.status().unwrap().admission_blocked);
    assert!(matches!(
        reopened.loader.cache.collect(request).unwrap().state,
        lifecycle::CacheState::Complete
    ));
}

#[tokio::test]
async fn unload_rejects_replaced_roots_and_never_follows_cache_symlinks() {
    use std::os::unix::fs::symlink;
    let dir = tempfile::tempdir().unwrap();
    let host = ready(dir.path()).await;
    let artifact = bundle();
    let digest = host.loader.artifacts.put(artifact).unwrap().digest;
    let outside = tempfile::tempdir().unwrap();
    let sentinel = outside.path().join("sentinel");
    std::fs::write(&sentinel, b"must survive").unwrap();
    let tree = dir.path().join("loader/artifacts/trees").join(&digest);
    symlink(outside.path(), &tree).unwrap();
    let plan = host
        .plan_unload(UnloadRequest {
            objects: vec![ObjectKey::Artifact {
                digest: digest.clone(),
            }],
        })
        .await
        .unwrap();
    host.unload_objects(command(&plan, "unlink-cache-only"))
        .await
        .unwrap();
    assert!(!tree.exists());
    assert_eq!(std::fs::read(&sentinel).unwrap(), b"must survive");
    let digest = host.loader.artifacts.put(bundle()).unwrap().digest;
    let objects = dir.path().join("loader/artifacts/objects");
    let saved = dir.path().join("saved-objects");
    std::fs::rename(&objects, &saved).unwrap();
    symlink(outside.path(), &objects).unwrap();
    assert!(
        host.plan_unload(UnloadRequest {
            objects: vec![ObjectKey::Artifact {
                digest: digest.clone()
            }]
        })
        .await
        .is_err()
    );
    assert_eq!(std::fs::read(&sentinel).unwrap(), b"must survive");
    assert!(saved.join(format!("{digest}.json")).exists());
}
