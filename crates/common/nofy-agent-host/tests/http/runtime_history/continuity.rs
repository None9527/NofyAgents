//! Business continuations retain their original proofs across physical stores.
use super::*;
use nofy_agent_runtime::{
    governance::{BudgetScope, BudgetStore},
    registry::{ModuleInstance, ModuleRef},
    system::SystemDocument,
};
use std::path::Path;
#[path = "continuity/conversations.rs"]
mod conversations;
#[path = "continuity/effects.rs"]
mod effects;
#[path = "continuity/models.rs"]
mod models;

async fn storage(server: &Serving, external: &Path) -> String {
    post(server, "/api/v1/import", source(external)).await["bundle"]["digest"]
        .as_str()
        .unwrap()
        .to_owned()
}
async fn read(server: &Serving, path: &str) -> Value {
    let (status, value) = request(server, reqwest::Method::GET, path, ADMIN, Value::Null).await;
    assert_eq!(status, 200, "{path}: {value}");
    value
}
async fn relocate(
    host: &KernelHost,
    server: &Serving,
    release: &str,
    reverse: bool,
    id: &str,
) -> Value {
    let origin = host.store().path().unwrap();
    let identity = host.store().logical_identity().to_owned();
    let inspected = plan(server, release, reverse).await;
    assert!(
        !host.loader().model_status().stopping,
        "planning must leave the model executor usable"
    );
    let ready = prepare(server, release, reverse, id, &inspected).await;
    assert!(
        !host.loader().model_status().stopping,
        "preparing must leave the model executor usable"
    );
    assert_eq!(ready["phase"], "prepared");
    assert_eq!(current(server).await["writable"], false);
    let moved = post(
        server,
        "/api/v1/runtime/storage/apply",
        command(id, &inspected),
    )
    .await;
    assert_eq!(moved["phase"], "completed");
    assert!(
        !host.loader().model_status().stopping,
        "migration must leave the model executor usable"
    );
    assert_ne!(host.store().path().unwrap(), origin);
    assert_eq!(host.store().logical_identity(), identity);
    assert_eq!(
        json!(inspect_snapshot(&origin).unwrap()),
        inspected["inventory"]
    );
    moved
}
async fn scoped(host: &KernelHost, system: &str, root: &str) -> Option<BudgetScope> {
    let catalog = host.control().inspect().await.unwrap().unwrap();
    let document = &catalog
        .data
        .publications
        .values()
        .find(|p| p.bundle.document.name == system)
        .unwrap()
        .bundle
        .document;
    if !document
        .modules
        .iter()
        .any(|m| m.reference == ModuleRef::new("quota", "1"))
    {
        return None;
    }
    let prepared = host.control().prepare(document.clone()).unwrap();
    let reference = ModuleRef::new("quota", "1");
    let resolved = prepared
        .registry()
        .resolve(std::slice::from_ref(&reference))
        .unwrap();
    let ModuleInstance::Governance(profile) = &resolved.instances[&reference] else {
        panic!("governance profile")
    };
    Some(BudgetScope {
        root_run_id: root.into(),
        identity: profile.identity().into(),
    })
}
async fn budget(host: &KernelHost, scope: &Option<BudgetScope>) -> Option<Value> {
    match scope {
        Some(scope) => {
            Some(serde_json::to_value(host.store().inspect(scope).await.unwrap().unwrap()).unwrap())
        }
        None => None,
    }
}
async fn expired_leases(host: &KernelHost) {
    tokio::time::timeout(Duration::from_secs(10), async {
        loop {
            let path = host.store().path().unwrap();
            let now = host.store().now_ms();
            let live = tokio::task::spawn_blocking(move || {
                let db = rusqlite::Connection::open_with_flags(
                    path,
                    rusqlite::OpenFlags::SQLITE_OPEN_READ_ONLY,
                )
                .unwrap();
                db.query_row(
                    "SELECT EXISTS(SELECT 1 FROM agent_runtime_leases WHERE expires_ms>?1)",
                    [now],
                    |r| r.get::<_, bool>(0),
                )
                .unwrap()
            })
            .await
            .unwrap();
            if !live {
                return;
            }
            tokio::time::sleep(Duration::from_millis(25)).await;
        }
    })
    .await
    .expect("original execution leases did not expire");
}
async fn pause_original(host: &KernelHost, system: &str) {
    let catalog = host.control().inspect().await.unwrap().unwrap();
    let document = catalog
        .data
        .publications
        .values()
        .find(|p| p.bundle.document.name == system)
        .unwrap()
        .bundle
        .document
        .clone();
    let prepared = host.control().prepare(document).unwrap();
    nofy_agent_runtime::supervisor::RunSupervisor::new(host.store().clone())
        .execute_submitted(prepared.registry(), "root")
        .await
        .unwrap();
    assert_eq!(
        host.store()
            .execution_record("root")
            .await
            .unwrap()
            .unwrap()
            .status,
        "paused"
    );
}
async fn exited(helper: &str, environment: Vec<(&str, String)>, expected: i32) {
    let helper = helper.to_owned();
    let environment: Vec<(String, String)> = environment
        .into_iter()
        .map(|(k, v)| (k.into(), v))
        .collect();
    let result = tokio::task::spawn_blocking(move || {
        std::process::Command::new(std::env::current_exe().unwrap())
            .args(["--exact", &helper, "--nocapture"])
            .envs(environment)
            .output()
            .unwrap()
    })
    .await
    .unwrap();
    assert_eq!(
        result.status.code(),
        Some(expected),
        "{}{}",
        String::from_utf8_lossy(&result.stdout),
        String::from_utf8_lossy(&result.stderr)
    );
}
async fn stop_worker(
    host: &KernelHost,
    stop: CancellationToken,
    worker: tokio::task::JoinHandle<()>,
) {
    stop.cancel();
    worker.await.unwrap();
    let status = host.loader().model_status();
    assert!(
        status.stopping,
        "real host shutdown must cancel its model child token"
    );
    assert!(
        status.worker_pids.is_empty(),
        "real host shutdown must reap evaluators"
    );
}
