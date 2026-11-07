use super::*;

#[tokio::test]
async fn unknown_root_effect_and_accepted_recovery_move_without_redispatch_with_or_without_budget()
{
    for metered in [false, true] {
        let calls = Arc::new(AtomicUsize::new(0));
        let effects = calls.clone();
        let observed = calls.clone();
        let finish = CancellationToken::new();
        let pending = finish.clone();
        let service = serve(
            Router::new()
                .route(
                    "/service/effect",
                    route_post(move || {
                        let effects = effects.clone();
                        let pending = pending.clone();
                        async move {
                            effects.fetch_add(1, Ordering::SeqCst);
                            pending.cancelled().await;
                            Json(json!({"accepted":true}))
                        }
                    }),
                )
                .route(
                    "/count",
                    axum::routing::get(move || {
                        let observed = observed.clone();
                        async move { Json(observed.load(Ordering::SeqCst)) }
                    }),
                ),
        )
        .await;
        let dir = nofy_test_support::canonical_tempdir().unwrap();
        let state = dir.path().join("host");
        exited(
            "root_reconciliation::uncertain_root_process",
            vec![
                ("NOFY_ROOT_EVIDENCE_STATE", state.to_str().unwrap().into()),
                ("NOFY_ROOT_EVIDENCE_SERVICE", service.url.clone()),
                (
                    "NOFY_ROOT_EVIDENCE_BUDGET",
                    if metered { "yes" } else { "no" }.into(),
                ),
            ],
            97,
        )
        .await;
        assert_eq!(calls.load(Ordering::SeqCst), 1);
        let host = host(&state, Arc::new(AtomicUsize::new(0))).await;
        let server = serve(host.router()).await;
        expired_leases(&host).await;
        pause_original(&host, "root-evidence").await;
        let scope = scoped(&host, "root-evidence", "root").await;
        assert_eq!(scope.is_some(), metered);
        let before = budget(&host, &scope).await;
        let pending = read(&server, "/api/v1/runs/root/recovery/root").await;
        assert_eq!(pending["call"]["name"], "effect");
        if let Some(value) = &before {
            assert_eq!(value["used"]["tool_calls"], 0);
            assert_eq!(value["reserved"]["tool_calls"], 1);
        }
        let command = json!({"command_id":"original-root-proof","run_id":"root","command":{"kind":"reconcile_root_tool","receipt":{"model_sequence":pending["model_sequence"],"call":pending["call"],"result":{"accepted":true},"is_error":false}}});
        let accepted = post(&server, "/api/v1/actions", command.clone()).await;
        assert_eq!(accepted["finished"], false);
        let storage = storage(&server, &dir.path().join("external")).await;
        relocate(&host, &server, &storage, false, "root-forward").await;
        assert_eq!(budget(&host, &scope).await, before);
        assert_eq!(
            read(&server, "/api/v1/runs/root/recovery/root").await,
            pending
        );
        assert_eq!(
            read(&server, "/api/v1/actions/original-root-proof").await,
            accepted
        );
        assert_eq!(calls.load(Ordering::SeqCst), 1);
        let (stop, worker) = start(&host);
        let receipt = action_result(&server, "original-root-proof").await;
        assert!(receipt["error"].is_null(), "{receipt}");
        assert_eq!(
            outcome(&server, "root").await["execution"]["status"],
            "completed"
        );
        assert!(
            read(&server, "/api/v1/runs/root/recovery/root")
                .await
                .is_null()
        );
        if let Some(scope) = &scope {
            let after = host.store().inspect(scope).await.unwrap().unwrap();
            assert_eq!(after.used.tool_calls, 1);
            assert_eq!(after.reserved.tool_calls, 0);
            assert_eq!(after.active_operations, 0);
        }
        relocate(&host, &server, &storage, true, "root-reverse").await;
        assert_eq!(post(&server, "/api/v1/actions", command).await, receipt);
        assert_eq!(calls.load(Ordering::SeqCst), 1);
        finish.cancel();
        stop_worker(&host, stop, worker).await;
    }
}

async fn hook_service() -> (Serving, Arc<[AtomicUsize; 3]>, CancellationToken) {
    let counts = Arc::new([
        AtomicUsize::new(0),
        AtomicUsize::new(0),
        AtomicUsize::new(0),
    ]);
    let model = counts.clone();
    let effects = counts.clone();
    let work = counts.clone();
    let observed = counts.clone();
    let finish = CancellationToken::new();
    let pending = finish.clone();
    let service=serve(Router::new()
        .route("/v1/chat/completions",route_post(move||{let model=model.clone();async move{model[0].fetch_add(1,Ordering::SeqCst);Sse::new(futures::stream::iter(nofy_test_support::sse::chat_completion_events_exact("complete","test-model").into_iter().map(Ok::<_,Infallible>)))}}))
        .route("/effect",route_post(move||{let effects=effects.clone();let pending=pending.clone();async move{effects[1].fetch_add(1,Ordering::SeqCst);pending.cancelled().await;Json(json!({"decision":"continue"}))}}))
        .route("/done",route_post(move||{let work=work.clone();async move{work[2].fetch_add(1,Ordering::SeqCst);Json(json!({"work":true}))}}))
        .route("/count",axum::routing::get(move||{let observed=observed.clone();async move{Json(json!({"models":observed[0].load(Ordering::SeqCst),"effects":observed[1].load(Ordering::SeqCst),"work":observed[2].load(Ordering::SeqCst)}))}}))).await;
    (service, counts, finish)
}
fn counts(values: &[AtomicUsize; 3]) -> Vec<usize> {
    values.iter().map(|n| n.load(Ordering::SeqCst)).collect()
}
#[tokio::test]
async fn original_hook_ticket_and_pending_budget_settle_after_migration_and_reverse_without_new_effect()
 {
    for unmetered in [false, true] {
        let (service, observed, finish) = hook_service().await;
        let dir = nofy_test_support::canonical_tempdir().unwrap();
        let state = dir.path().join("host");
        exited(
            "hook_recovery::effect_exit_process",
            vec![
                ("NOFY_HOOK_RECOVERY_STATE", state.to_str().unwrap().into()),
                ("NOFY_HOOK_RECOVERY_SERVICE", service.url.clone()),
                (
                    "NOFY_HOOK_RECOVERY_UNMETERED",
                    if unmetered { "yes" } else { "no" }.into(),
                ),
            ],
            76,
        )
        .await;
        assert_eq!(counts(&observed), [1, 1, 0]);
        let original_ticket: Value =
            serde_json::from_slice(&std::fs::read(state.join("ticket.json")).unwrap()).unwrap();
        let host = host(&state, Arc::new(AtomicUsize::new(0))).await;
        let server = serve(host.router()).await;
        expired_leases(&host).await;
        let target = read(&server, "/api/v1/runs/root/recovery/hooks").await;
        assert_eq!(target["targets"][0]["ticket"], original_ticket);
        let scope = scoped(&host, "model-evidence", "root").await;
        assert_eq!(scope.is_none(), unmetered);
        let before = budget(&host, &scope).await;
        let record = host
            .store()
            .execution_record("root")
            .await
            .unwrap()
            .unwrap();
        let command = json!({"command_id":"original-hook-proof","run_id":"root","command":{"kind":"reconcile_hook","receipt":{"ticket":original_ticket,"resolution":{"kind":"decision","decision":{"decision":"continue"}}}}});
        let accepted = post(&server, "/api/v1/actions", command.clone()).await;
        assert_eq!(accepted["finished"], false);
        let storage = storage(&server, &dir.path().join("external")).await;
        relocate(&host, &server, &storage, false, "hook-forward").await;
        assert_eq!(
            read(&server, "/api/v1/runs/root/recovery/hooks").await,
            target
        );
        assert_eq!(budget(&host, &scope).await, before);
        assert_eq!(
            read(&server, "/api/v1/actions/original-hook-proof").await,
            accepted
        );
        let (stop, worker) = start(&host);
        let receipt = action_result(&server, "original-hook-proof").await;
        assert!(receipt["error"].is_null(), "{receipt}");
        assert!(receipt["outcome"]["Completed"].is_object(), "{receipt}");
        assert_eq!(counts(&observed), [1, 1, 0]);
        assert!(
            read(&server, "/api/v1/runs/root/recovery/hooks").await["targets"]
                .as_array()
                .unwrap()
                .is_empty()
        );
        let completed = host
            .store()
            .execution_record("root")
            .await
            .unwrap()
            .unwrap();
        assert_eq!(completed.composition, record.composition);
        assert_eq!(completed.thread_id, record.thread_id);
        if let Some(scope) = &scope {
            let ledger = host.store().inspect(scope).await.unwrap().unwrap();
            assert_eq!(ledger.used.model_calls, 1);
            assert_eq!(ledger.used.tool_calls, 1);
            assert_eq!(ledger.reserved.tool_calls, 0);
        }
        relocate(&host, &server, &storage, true, "hook-reverse").await;
        assert_eq!(post(&server, "/api/v1/actions", command).await, receipt);
        assert_eq!(counts(&observed), [1, 1, 0]);
        finish.cancel();
        stop_worker(&host, stop, worker).await;
    }
}
