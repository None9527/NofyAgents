use super::*;
use nofy_agent_runtime::{
    durable::transport::{inspect_snapshot, release_retirement},
    governance::BudgetStore,
    mailbox::InputInbox,
};
fn setup(root: &Path) -> (Control, SqliteStore) {
    let host = storage::directory(root).unwrap();
    let loader = storage::directory(&host.join("loader/lifecycle")).unwrap();
    storage::atomic(&loader.join("lease.lock"), b"", 0o600, false).unwrap();
    let control = Control::open(&host, &host.join("runtime.sqlite")).unwrap();
    let store = SqliteStore::open_placed(
        &host.join("runtime.sqlite"),
        Arc::new(control.clone()),
        None,
    )
    .unwrap();
    control.initialize().unwrap();
    (control, store)
}
fn backend(path: &Path) -> BackendDefinition {
    BackendDefinition {
        id: "external".into(),
        directory: Some(path.into()),
    }
}
pub(super) fn point(name: &str) {
    if std::env::var("NOFY_RUNTIME_TRANSFER_EXIT").ok().as_deref() == Some(name) {
        std::process::exit(74);
    }
}
#[test]
fn transfer_process_helper() {
    let Ok(root) = std::env::var("NOFY_RUNTIME_TRANSFER_ROOT") else {
        return;
    };
    let (control, store) = setup(Path::new(&root).join("host").as_path());
    let target = backend(&Path::new(&root).join("external"));
    let fingerprint = std::env::var("NOFY_RUNTIME_TRANSFER_FINGERPRINT").unwrap();
    control
        .prepare("move", &target, &fingerprint, &store)
        .unwrap();
    control.apply("move", &fingerprint, &store).unwrap();
    panic!("exit point not observed");
}
#[tokio::test]
async fn cached_stores_follow_real_generations_and_reverse_copies_latest_history() {
    let dir = nofy_test_support::canonical_tempdir().unwrap();
    let root = dir.path().join("host");
    let (control, store) = setup(&root);
    let (_, other) = setup(&root);
    let origin = store.path().unwrap();
    let identity = store.logical_identity().to_owned();
    let budget = BudgetStore::storage_identity(&store);
    let lease = store
        .acquire("identity", "owner", std::time::Duration::from_secs(1))
        .await
        .unwrap();
    let inbox = store.guarded(&lease);
    let mailbox = InputInbox::identity(&inbox);
    store.release(&lease).await.unwrap();
    let initial = inspect_snapshot(&origin).unwrap();
    let target = backend(&dir.path().join("external"));
    let plan = control.plan(&target, store.now_ms()).unwrap();
    let prepared = control
        .prepare("move", &target, &plan.fingerprint, &store)
        .unwrap();
    assert_eq!(prepared.phase, "prepared");
    assert!(!control.view().unwrap().writable);
    assert!(control.execution().unwrap().is_none());
    assert!(
        store
            .acquire("blocked", "worker", std::time::Duration::from_secs(1))
            .await
            .is_err()
    );
    let reopened = setup(&root).1;
    let moved = control.apply("move", &plan.fingerprint, &store).unwrap();
    assert_eq!(moved.phase, "completed");
    let external = store.path().unwrap();
    assert_ne!(external, origin);
    assert_eq!(other.path().unwrap(), external);
    assert_eq!(reopened.path().unwrap(), external);
    assert_eq!(inspect_snapshot(&external).unwrap(), initial);
    assert_eq!(store.logical_identity(), identity);
    assert_eq!(BudgetStore::storage_identity(&store), budget);
    assert_eq!(InputInbox::identity(&inbox), mailbox);
    let lease = other
        .acquire("latest", "worker", std::time::Duration::from_secs(1))
        .await
        .unwrap();
    other.release(&lease).await.unwrap();
    let latest = inspect_snapshot(&external).unwrap();
    assert_ne!(latest, initial);
    let default = BackendDefinition {
        id: "default".into(),
        directory: None,
    };
    let reverse = control.plan(&default, store.now_ms()).unwrap();
    control
        .prepare("reverse", &default, &reverse.fingerprint, &store)
        .unwrap();
    control
        .apply("reverse", &reverse.fingerprint, &store)
        .unwrap();
    assert_ne!(store.path().unwrap(), origin);
    assert_ne!(store.path().unwrap(), external);
    assert_eq!(inspect_snapshot(&store.path().unwrap()).unwrap(), latest);
    assert_eq!(
        encoded(&control.apply("move", &plan.fingerprint, &store).unwrap()).unwrap(),
        encoded(&moved).unwrap()
    );
    assert_eq!(control.view().unwrap().backend, default);
    let raw = rusqlite::Connection::open(origin).unwrap();
    assert!(
        raw.execute(
            "INSERT INTO agent_runtime_leases VALUES('late','old',1,1)",
            []
        )
        .is_err()
    );
}
#[test]
fn recover_each_durable_cut_by_original_command_after_real_process_exit() {
    for point in ["intent", "fenced", "prepared", "retired", "published"] {
        let dir = nofy_test_support::canonical_tempdir().unwrap();
        let (control, store) = setup(&dir.path().join("host"));
        let target = backend(&dir.path().join("external"));
        let plan = control.plan(&target, store.now_ms()).unwrap();
        drop(store);
        drop(control);
        let status = std::process::Command::new(std::env::current_exe().unwrap())
            .arg("--exact")
            .arg("loader::runtime_history::tests::transfer_process_helper")
            .arg("--nocapture")
            .env("NOFY_RUNTIME_TRANSFER_ROOT", dir.path())
            .env("NOFY_RUNTIME_TRANSFER_FINGERPRINT", &plan.fingerprint)
            .env("NOFY_RUNTIME_TRANSFER_EXIT", point)
            .status()
            .unwrap();
        assert_eq!(status.code(), Some(74), "{point}");
        let (control, store) = setup(&dir.path().join("host"));
        let current = control.status("move").unwrap().unwrap();
        assert_eq!(current.fingerprint, plan.fingerprint);
        assert!(matches!(
            current.phase.as_str(),
            "preparing" | "prepared" | "completed"
        ));
        let moved = control.apply("move", &plan.fingerprint, &store).unwrap();
        assert_eq!(moved.phase, "completed", "{point}");
        assert_eq!(control.view().unwrap().backend, target);
        assert_eq!(
            inspect_snapshot(&store.path().unwrap()).unwrap(),
            plan.inventory
        );
    }
}
#[test]
fn abort_releases_exact_retirement_and_preserves_partial_copies() {
    let dir = nofy_test_support::canonical_tempdir().unwrap();
    let (control, store) = setup(&dir.path().join("host"));
    let target = backend(&dir.path().join("external"));
    let original = store.path().unwrap();
    let plan = control.plan(&target, store.now_ms()).unwrap();
    control
        .prepare("move", &target, &plan.fingerprint, &store)
        .unwrap();
    nofy_agent_runtime::durable::transport::retire_snapshot(
        &original,
        &plan.inventory,
        &control.authority.authority,
        "move",
        store.now_ms(),
    )
    .unwrap();
    assert!(release_retirement(&original, &control.authority.authority, "wrong").is_err());
    let receipt = control.abort("move", &plan.fingerprint).unwrap();
    assert_eq!(receipt.phase, "aborted");
    assert!(control.view().unwrap().writable);
    assert_eq!(store.path().unwrap(), original);
    assert_eq!(
        control
            .apply("move", &plan.fingerprint, &store)
            .unwrap()
            .phase,
        "aborted"
    );
    assert!(control.bucket(&target).unwrap().exists());
    assert!(
        control
            .prepare("move", &target, &"0".repeat(64), &store)
            .is_err()
    );
}
#[test]
fn missing_authority_pointer_or_active_database_never_reopens_old_history() {
    for file in ["active.json", "authority.json", "protected-roots.json"] {
        let dir = nofy_test_support::canonical_tempdir().unwrap();
        let (control, store) = setup(&dir.path().join("host"));
        let target = backend(&dir.path().join("external"));
        let plan = control.plan(&target, store.now_ms()).unwrap();
        control
            .prepare("move", &target, &plan.fingerprint, &store)
            .unwrap();
        control.apply("move", &plan.fingerprint, &store).unwrap();
        std::fs::remove_file(control.root.join(file)).unwrap();
        assert!(
            Control::open(&control.host_root, &control.authority.origin).is_err(),
            "{file}"
        );
    }
    let dir = nofy_test_support::canonical_tempdir().unwrap();
    let (control, store) = setup(&dir.path().join("host"));
    std::fs::remove_file(store.path().unwrap()).unwrap();
    assert!(store.path().is_err());
    let origin = control.authority.origin.clone();
    assert!(SqliteStore::open_placed(&origin, Arc::new(control), None).is_err());
}
#[cfg(target_os = "linux")]
#[test]
fn cached_directory_and_local_grants_recheck_external_private_buckets() {
    use super::super::directories::{Access, Grant};
    use super::super::local::Mount;
    let dir = nofy_test_support::canonical_tempdir().unwrap();
    let (control, store) = setup(&dir.path().join("host"));
    let external = dir.path().join("external");
    std::fs::create_dir(&external).unwrap();
    let grant = Grant {
        path: external.clone(),
        access: Access::ReadOnly,
    };
    let mount = Mount {
        path: external.clone(),
        execute: false,
    };
    grant.open(&control.host_root).unwrap();
    mount.open(&control.host_root).unwrap();
    let target = backend(&external);
    let plan = control.plan(&target, store.now_ms()).unwrap();
    control
        .prepare("move", &target, &plan.fingerprint, &store)
        .unwrap();
    assert!(grant.open(&control.host_root).is_err());
    assert!(mount.open(&control.host_root).is_err());
    control.abort("move", &plan.fingerprint).unwrap();
    assert!(grant.open(&control.host_root).is_err());
}
#[test]
fn declaration_factory_is_pure_and_execution_resource_boundaries_exclude_concurrent_owners() {
    let dir = nofy_test_support::canonical_tempdir().unwrap();
    let root = dir.path().join("absent");
    let factory = BackendFactory;
    factory
        .build(
            &json!({"backend":{"id":"external","directory":root}}),
            &Default::default(),
        )
        .unwrap();
    assert!(!root.exists());
    assert!(
        factory
            .build(
                &json!({"backend":{"id":"default","directory":"/anything"}}),
                &Default::default()
            )
            .is_err()
    );
    let (control, _) = setup(&dir.path().join("host"));
    let execution = control.execution().unwrap().unwrap();
    assert!(control.exclusive_execution().is_err());
    drop(execution);
    let held = control.exclusive_execution().unwrap();
    assert!(control.execution().unwrap().is_none());
    drop(held);
    let resources = control.exclusive_resources().unwrap();
    assert!(
        super::super::lifecycle::shared_file(
            &control.host_root.join("loader/lifecycle/lease.lock")
        )
        .is_err()
    );
    drop(resources);
}
#[test]
fn incomplete_unpublished_drafts_do_not_grant_authority_or_block_history_transfer() {
    use nofy_agent_runtime::{
        control::{CatalogData, CatalogView, Draft},
        system::SystemDocument,
    };
    let dir = nofy_test_support::canonical_tempdir().unwrap();
    let (control, store) = setup(&dir.path().join("host"));
    let mut document: SystemDocument = serde_json::from_str(include_str!(
        "../../../examples/runtime-history-system.json"
    ))
    .unwrap();
    document
        .modules
        .push(nofy_agent_runtime::registry::ModuleDefinition {
            reference: nofy_agent_runtime::registry::ModuleRef::new("unfinished-directory", "1"),
            factory: "resource.directory".into(),
            config: json!({}),
            dependencies: Default::default(),
        });
    let catalog = CatalogView {
        revision: 1,
        data: CatalogData {
            drafts: [(
                "unfinished".into(),
                Draft {
                    revision: 1,
                    document,
                },
            )]
            .into(),
            ..Default::default()
        },
    };
    let runtimes = super::super::runtimes::RuntimeStore::open(
        &control.host_root.join("loader/runtimes"),
        &control.host_root,
    )
    .unwrap();
    let target = backend(&dir.path().join("external"));
    control
        .preflight_grants(&target, Some(catalog), &runtimes)
        .unwrap();
    let plan = control.plan(&target, store.now_ms()).unwrap();
    control
        .prepare("draft-safe-move", &target, &plan.fingerprint, &store)
        .unwrap();
    let receipt = control
        .apply("draft-safe-move", &plan.fingerprint, &store)
        .unwrap();
    assert_eq!(receipt.phase, "completed");
    assert_eq!(control.view().unwrap().backend, target);
}
