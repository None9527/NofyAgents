use super::*;

async fn exhausted(
    supervisor: &RunSupervisor,
    registry: &ModuleRegistry,
    system: &CompiledSystem,
    gates: &Gates,
    finish_tool: bool,
) -> RunState {
    gates.model_release.notify_one();
    if finish_tool {
        gates.tool_release.notify_one();
    }
    supervisor
        .submit_managed(request(system, "run"), system)
        .await
        .unwrap();
    let outcome = supervisor
        .execute_submitted(registry, "run")
        .await
        .unwrap()
        .unwrap();
    let RunOutcome::BudgetExceeded { state } = outcome else {
        panic!("expected exhausted budget: {outcome:?}")
    };
    state
}

async fn park_exhausted(
    supervisor: &RunSupervisor,
    store: &SqliteStore,
    registry: &ModuleRegistry,
) {
    store
        .enqueue_managed_action(action("park", ManagedCommand::Park))
        .await
        .unwrap();
    let result = execute(supervisor, registry, "park").await;
    assert!(
        result.finished,
        "budget suspension must certify a retained pending checkpoint"
    );
    assert!(
        store
            .parking("run")
            .await
            .unwrap()
            .unwrap()
            .receipt
            .unwrap()
            .budget_suspended
    );
}

#[tokio::test]
async fn pending_model_and_tool_resume_after_atomic_amendment_without_new_input_or_effect_replay() {
    for tool_blocked in [false, true] {
        let dir = tempfile::tempdir().unwrap();
        let (store, registry, base, gates, clock) = setup(dir.path(), true, false);
        let base = configure(
            &registry,
            &base,
            json!({"max_model_calls":1,"max_tool_calls":if tool_blocked {0} else {1}}),
        );
        let ledger = scope(&base);
        let supervisor = RunSupervisor::new(store.clone());
        let state = exhausted(&supervisor, &registry, &base, &gates, true).await;
        assert_eq!(state.pending_model.is_some(), !tool_blocked);
        assert_eq!(state.in_flight.is_some(), tool_blocked);
        assert_eq!(gates.calls.load(Ordering::SeqCst), 1);
        let job = store.execution_job("run").await.unwrap().unwrap();
        let budget = summary(&store, &ledger).await;
        assert_eq!(budget.used.model_calls, 1);
        assert_eq!(budget.used.tool_calls, u64::from(!tool_blocked));
        park_exhausted(&supervisor, &store, &registry).await;
        let target = configure(
            &registry,
            &base,
            json!({"max_model_calls":3,"max_tool_calls":2}),
        );
        let command = budget_command("raise", &target, 0);
        supervisor
            .submit_transition(command.clone(), &target)
            .await
            .unwrap();
        let sql = rusqlite::Connection::open(dir.path().join("runtime.sqlite")).unwrap();
        sql.execute_batch("CREATE TRIGGER lose_resume_ack BEFORE UPDATE OF result ON agent_runtime_managed_actions WHEN NEW.command_id='raise' BEGIN SELECT RAISE(ABORT,'lost amendment ack'); END;").unwrap();
        assert!(
            supervisor
                .execute_managed_action(&registry, "raise")
                .await
                .is_err()
        );
        assert!(store.live_execution("run").await.unwrap().is_none());
        assert_eq!(
            content_digest(&summary(&store, &ledger).await).unwrap(),
            content_digest(&budget).unwrap()
        );
        assert_eq!(
            content_digest(&checkpoint(&store, &base).await.state).unwrap(),
            content_digest(&state).unwrap()
        );
        sql.execute_batch("DROP TRIGGER lose_resume_ack").unwrap();
        let reopened =
            SqliteStore::open_with_clock(&dir.path().join("runtime.sqlite"), clock).unwrap();
        let recovery = RunSupervisor::new(reopened.clone());
        execute(&recovery, &registry, "raise").await;
        let live = reopened.live_execution("run").await.unwrap().unwrap();
        assert_eq!(
            content_digest(&live.after.state).unwrap(),
            content_digest(&state).unwrap()
        );
        assert_eq!(
            live.modules.unwrap().budgets[0].ledger_identity,
            ledger.identity
        );
        assert_eq!(
            reopened.execution_job("run").await.unwrap().unwrap().digest,
            job.digest
        );
        assert!(
            recovery
                .submit_transition(command, &target)
                .await
                .unwrap()
                .finished
        );
        release(&recovery, &reopened).await;
        reopened
            .enqueue_managed_action(action("resume", ManagedCommand::Resume))
            .await
            .unwrap();
        let result = execute(&recovery, &registry, "resume").await;
        let Some(RunOutcome::Completed {
            state: finished, ..
        }) = result.outcome
        else {
            panic!("{result:?}")
        };
        assert_eq!(finished.execution_run_id.as_deref(), Some("run"));
        assert_eq!(
            finished.input_progress.initial,
            state.input_progress.initial
        );
        assert_eq!(gates.calls.load(Ordering::SeqCst), 2);
        assert_eq!(
            std::fs::read_to_string(dir.path().join("effects")).unwrap(),
            "effect\n"
        );
        let final_budget = summary(&reopened, &ledger).await;
        assert_eq!(final_budget.used.model_calls, 2);
        assert_eq!(final_budget.used.tool_calls, 1);
        assert_eq!(final_budget.reserved, BudgetCost::default());
        assert_eq!(final_budget.created_at_ms, budget.created_at_ms);
        assert!(execute(&recovery, &registry, "resume").await.finished);
        assert_eq!(gates.calls.load(Ordering::SeqCst), 2);
    }
}

#[tokio::test]
async fn pending_budget_work_rejects_mixed_configuration_before_admission() {
    let dir = tempfile::tempdir().unwrap();
    let (store, mut registry, base, gates, _) = setup(dir.path(), true, false);
    let base = configure(
        &registry,
        &base,
        json!({"max_model_calls":1,"max_tool_calls":1}),
    );
    let supervisor = RunSupervisor::new(store.clone());
    exhausted(&supervisor, &registry, &base, &gates, true).await;
    park_exhausted(&supervisor, &store, &registry).await;
    let before = content_digest(&checkpoint(&store, &base).await).unwrap();
    let raised = configure(
        &registry,
        &base,
        json!({"max_model_calls":3,"max_tool_calls":2}),
    );
    for (i, extra) in [
        ModuleUpdate {
            policy_set: true,
            ..Default::default()
        },
        ModuleUpdate {
            tool_catalog: true,
            ..Default::default()
        },
        ModuleUpdate {
            hook_subscriptions: true,
            ..Default::default()
        },
    ]
    .into_iter()
    .enumerate()
    {
        let id = format!("mixed-{i}");
        let mut command = budget_command(&id, &raised, 0);
        if let ManagedCommand::UpdateModules { update, .. } = &mut command.command {
            *update = ModuleUpdate {
                budget_limits: true,
                ..extra
            };
        }
        assert!(
            supervisor
                .submit_transition(command, &raised)
                .await
                .unwrap_err()
                .to_string()
                .contains("exclusive budget")
        );
        assert!(store.managed_action(&id).await.unwrap().is_none());
    }
    let (changed, _) = target(&mut registry, &raised);
    assert!(
        supervisor
            .submit_transition(budget_command("changed-request", &changed, 0), &changed)
            .await
            .unwrap_err()
            .to_string()
            .contains("non-budget definition")
    );
    assert!(
        supervisor
            .submit_transition(change("plain", &changed, 0), &changed)
            .await
            .is_err()
    );
    assert_eq!(
        content_digest(&checkpoint(&store, &base).await).unwrap(),
        before
    );
    assert!(store.live_execution("run").await.unwrap().is_none());
}

#[tokio::test]
async fn extending_expired_budget_keeps_claimed_tool_unknown_and_never_repeats_its_effect() {
    let dir = tempfile::tempdir().unwrap();
    let (store, registry, base, gates, _) = setup(dir.path(), true, false);
    let base = configure(
        &registry,
        &base,
        json!({"max_model_calls":3,"max_tool_calls":2,"max_duration_ms":1000}),
    );
    let ledger = scope(&base);
    let supervisor = RunSupervisor::new(store.clone());
    let state = exhausted(&supervisor, &registry, &base, &gates, false).await;
    assert!(state.in_flight.is_some());
    assert_eq!(
        std::fs::read_to_string(dir.path().join("effects")).unwrap(),
        "effect\n"
    );
    let old = summary(&store, &ledger).await;
    assert_eq!(old.reserved.tool_calls, 1);
    park_exhausted(&supervisor, &store, &registry).await;
    let target = configure(
        &registry,
        &base,
        json!({"max_model_calls":3,"max_tool_calls":2,"max_duration_ms":20000}),
    );
    supervisor
        .submit_transition(budget_command("extend", &target, 0), &target)
        .await
        .unwrap();
    execute(&supervisor, &registry, "extend").await;
    release(&supervisor, &store).await;
    store
        .enqueue_managed_action(action("resume", ManagedCommand::Resume))
        .await
        .unwrap();
    let result = execute(&supervisor, &registry, "resume").await;
    let Some(RunOutcome::Paused {
        reason,
        state: after,
    }) = result.outcome
    else {
        panic!("{result:?}")
    };
    assert_eq!(reason["kind"], "budget_uncertain");
    assert_eq!(
        content_digest(&after.in_flight).unwrap(),
        content_digest(&state.in_flight).unwrap()
    );
    assert_eq!(gates.calls.load(Ordering::SeqCst), 1);
    assert_eq!(
        std::fs::read_to_string(dir.path().join("effects")).unwrap(),
        "effect\n"
    );
    let budget = summary(&store, &ledger).await;
    assert_eq!(budget.used, old.used);
    assert_eq!(budget.reserved, old.reserved);
    assert_eq!(budget.created_at_ms, old.created_at_ms);
}
