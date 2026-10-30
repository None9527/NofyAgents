use super::*;
use nofy_agent_runtime::{
    governance::{BudgetScope, BudgetStore},
    registry::{ModuleInstance, ModuleRef},
    system::content_digest,
};

#[tokio::test]
async fn abandoning_crashed_native_model_preserves_usage_and_seals_root_and_descendants() {
    for unmetered in [false, true] {
        for child in [false, true] {
            let count = Arc::new(AtomicUsize::new(0));
            let effects = Arc::new(AtomicUsize::new(0));
            let finish = CancellationToken::new();
            let started = count.clone();
            let read = count.clone();
            let done = effects.clone();
            let pending = finish.clone();
            let service = serve(
                Router::new()
                    .route(
                        "/v1/chat/completions",
                        route_post(move || {
                            let started = started.clone();
                            let pending = pending.clone();
                            async move {
                                started.fetch_add(1, Ordering::SeqCst);
                                pending.cancelled().await;
                                Json(json!({"error":{"message":"closed"}}))
                            }
                        }),
                    )
                    .route(
                        "/count",
                        axum::routing::get(move || {
                            let read = read.clone();
                            async move { Json(read.load(Ordering::SeqCst)) }
                        }),
                    )
                    .route(
                        "/done",
                        route_post(move || {
                            let done = done.clone();
                            async move {
                                done.fetch_add(1, Ordering::SeqCst);
                                Json(json!({"done":true}))
                            }
                        }),
                    ),
            )
            .await;
            let directory = tempfile::tempdir().unwrap();
            let state = directory.path().to_owned();
            let url = service.url.clone();
            let output = tokio::task::spawn_blocking(move || {
                std::process::Command::new(std::env::current_exe().unwrap())
                    .args([
                        "--exact",
                        "model_reconciliation::uncertain_model_process",
                        "--nocapture",
                    ])
                    .env("NOFY_MODEL_EVIDENCE_STATE", state)
                    .env("NOFY_MODEL_EVIDENCE_SERVICE", url)
                    .env(
                        "NOFY_MODEL_EVIDENCE_CHILD",
                        if child { "yes" } else { "no" },
                    )
                    .env(
                        "NOFY_MODEL_EVIDENCE_UNMETERED",
                        if unmetered { "yes" } else { "no" },
                    )
                    .output()
                    .unwrap()
            })
            .await
            .unwrap();
            assert_eq!(
                output.status.code(),
                Some(97),
                "{}",
                String::from_utf8_lossy(&output.stderr)
            );
            tokio::time::sleep(Duration::from_millis(2100)).await;
            let host = host(directory.path(), Arc::new(AtomicUsize::new(0))).await;
            let prepared = host
                .control()
                .prepare(
                    serde_json::from_value(super::model_reconciliation::source(
                        &service.url,
                        child,
                        unmetered,
                    ))
                    .unwrap(),
                )
                .unwrap();
            let scope = if unmetered {
                None
            } else {
                let resolved = prepared
                    .registry()
                    .resolve(&[ModuleRef::new("quota", "1")])
                    .unwrap();
                let ModuleInstance::Governance(profile) =
                    &resolved.instances[&ModuleRef::new("quota", "1")]
                else {
                    panic!("quota")
                };
                Some(BudgetScope {
                    root_run_id: "root".into(),
                    identity: profile.identity().into(),
                })
            };
            let server = serve(host.router()).await;
            // Enqueue before starting the worker: administrative priority must
            // beat normal automatic recovery of the crash-persisted job.
            let command = json!({"command_id":"abandon","run_id":"root","command":{"kind":"abandon","reason":"provider outcome unknown; retain evidence","acknowledge_unresolved":true}});
            assert_eq!(
                request(
                    &server,
                    reqwest::Method::POST,
                    "/api/v1/actions",
                    VIEW,
                    command.clone()
                )
                .await
                .0,
                403
            );
            let mut invalid = command.clone();
            invalid["command"]["acknowledge_unresolved"] = json!(false);
            assert_eq!(
                request(
                    &server,
                    reqwest::Method::POST,
                    "/api/v1/actions",
                    ADMIN,
                    invalid
                )
                .await
                .0,
                422
            );
            let before = if let Some(scope) = &scope {
                Some(content_digest(&host.store().inspect(scope).await.unwrap()).unwrap())
            } else {
                None
            };
            let original = host
                .store()
                .execution_record("root")
                .await
                .unwrap()
                .unwrap();
            post(&server, "/api/v1/actions", command.clone()).await;
            let stop = CancellationToken::new();
            let worker_stop = stop.clone();
            let worker_host = host.clone();
            let worker =
                tokio::spawn(async move { worker_host.run_worker(worker_stop, 1).await.unwrap() });
            let settled = action_result(&server, "abandon").await;
            assert!(
                settled["error"].is_null() && settled["outcome"].is_null(),
                "{settled}"
            );
            assert_eq!(settled["abandonment"]["run_id"], "root");
            assert!(settled["abandonment"]["checkpoint_revision"].is_u64());
            if child {
                assert!(settled["abandonment"]["child_count"].as_u64().unwrap() > 0);
            }
            let view = outcome(&server, "root").await;
            assert_eq!(view["run"]["status"], "abandoned");
            assert_eq!(view["execution"]["status"], "abandoned");
            assert_eq!(
                view["execution"]["outcome"],
                serde_json::to_value(original.outcome).unwrap()
            );
            assert_eq!(
                post(&server, "/api/v1/actions", command.clone()).await,
                settled
            );
            assert_eq!(
                request(
                    &server,
                    reqwest::Method::POST,
                    "/api/v1/actions",
                    ADMIN,
                    json!({"command_id":"resume","run_id":"root","command":{"kind":"resume"}})
                )
                .await
                .0,
                409
            );
            let mut next = serde_json::to_value(
                host.store()
                    .managed_run("root")
                    .await
                    .unwrap()
                    .unwrap()
                    .request,
            )
            .unwrap();
            next["run_id"] = json!("new-same-thread");
            assert_eq!(
                request(&server, reqwest::Method::POST, "/api/v1/runs", ADMIN, next)
                    .await
                    .0,
                409
            );
            assert_eq!(
                request(
                    &server,
                    reqwest::Method::POST,
                    "/api/v1/runs/root/cancel",
                    ADMIN,
                    json!({"command_id":"after-abandon"})
                )
                .await
                .0,
                409
            );
            if let Some(scope) = &scope {
                assert_eq!(
                    Some(content_digest(&host.store().inspect(scope).await.unwrap()).unwrap()),
                    before
                );
            }
            assert_eq!(count.load(Ordering::SeqCst), 1);
            assert_eq!(effects.load(Ordering::SeqCst), 0);
            stop.cancel();
            worker.await.unwrap();
            drop(server);
            drop(host);
            let reopened = host_after_reopen(directory.path()).await;
            assert_eq!(
                reopened
                    .store()
                    .abandonment("root")
                    .await
                    .unwrap()
                    .unwrap()
                    .command_id,
                "abandon"
            );
            assert_eq!(
                reopened
                    .store()
                    .managed_action("abandon")
                    .await
                    .unwrap()
                    .unwrap()
                    .abandonment
                    .unwrap()
                    .run_id,
                "root"
            );
            finish.cancel();
        }
    }
}
async fn host_after_reopen(path: &std::path::Path) -> KernelHost {
    host(path, Arc::new(AtomicUsize::new(0))).await
}
