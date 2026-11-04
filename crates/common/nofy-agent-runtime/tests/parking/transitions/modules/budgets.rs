use super::*;
#[path = "budgets/children.rs"]
mod children;
#[path = "budgets/composition.rs"]
mod composition;
#[path = "budgets/resumption.rs"]
mod resumption;

fn configure(registry: &ModuleRegistry, source: &CompiledSystem, limits: Value) -> CompiledSystem {
    let mut doc = serde_json::to_value(&source.bundle.document).unwrap();
    doc["modules"]
        .as_array_mut()
        .unwrap()
        .iter_mut()
        .find(|module| module["reference"] == r("budget"))
        .unwrap()["config"]["limits"] = limits;
    compile_system(serde_json::from_value(doc).unwrap(), registry).unwrap()
}
fn budget_command(id: &str, system: &CompiledSystem, revision: u64) -> ManagedAction {
    let mut command = update(id, system, revision, false, false);
    if let ManagedCommand::UpdateModules { update, .. } = &mut command.command {
        update.budget_limits = true;
    }
    command
}
fn profile(system: &CompiledSystem) -> Arc<GovernanceProfile> {
    let reference = ModuleRef::new("budget", "1");
    let resolved = system.registry().resolve(&[reference.clone()]).unwrap();
    let ModuleInstance::Governance(profile) = &resolved.instances[&reference] else {
        panic!("budget")
    };
    profile.clone()
}
fn scope(system: &CompiledSystem) -> BudgetScope {
    BudgetScope {
        root_run_id: "run".into(),
        identity: profile(system).identity().into(),
    }
}
async fn summary(store: &SqliteStore, scope: &BudgetScope) -> BudgetSummary {
    store.inspect(scope).await.unwrap().unwrap()
}
async fn hold(store: &SqliteStore, spec: &BudgetSpec, id: &str) -> BudgetReservation {
    let decision = store
        .reserve(
            spec,
            &BudgetRequest {
                operation_id: id.into(),
                fingerprint: format!("test:{id}"),
                reserve: BudgetCost {
                    tool_calls: 1,
                    ..Default::default()
                },
                depth: 0,
                activity: BudgetActivity::Operation,
                unbounded_tokens: false,
            },
        )
        .await
        .unwrap();
    let BudgetDecision::Granted(reservation) = decision else {
        panic!("{decision:?}")
    };
    reservation
}
async fn settle_held(store: &SqliteStore, reservation: &BudgetReservation) {
    store
        .settle(
            reservation,
            BudgetReceipt {
                used: BudgetCost {
                    tool_calls: 1,
                    ..Default::default()
                },
                value: json!({"once":true}),
            },
        )
        .await
        .unwrap();
}

#[tokio::test]
async fn amendments_are_atomic_and_preserve_claims_receipts_deadlines_and_original_scope() {
    let dir = tempfile::tempdir().unwrap();
    let (store, mut registry, base, gates, clock) = setup(dir.path(), true, true);
    let base = configure(
        &registry,
        &base,
        json!({"max_model_calls":3,"max_tool_calls":10,"max_duration_ms":10000}),
    );
    let ledger = scope(&base);
    let supervisor = Arc::new(RunSupervisor::new(store.clone()));
    park(&supervisor, &store, &registry, &base, &gates).await;
    let original = store.execution_job("run").await.unwrap().unwrap();
    let first = summary(&store, &ledger).await;
    assert_eq!(first.created_at_ms, 1000);
    assert_eq!(first.deadline_ms, Some(11000));
    let held = hold(&store, &first.spec, "held").await;
    let claimed = hold(&store, &first.spec, "claimed").await;
    assert!(matches!(
        store.claim(&claimed).await.unwrap(),
        BudgetClaim::Dispatch
    ));
    let done = hold(&store, &first.spec, "done").await;
    assert!(matches!(
        store.claim(&done).await.unwrap(),
        BudgetClaim::Dispatch
    ));
    settle_held(&store, &done).await;
    let before = summary(&store, &ledger).await;
    let checkpoint_before = checkpoint(&store, &base).await;
    clock.0.store(2000, Ordering::SeqCst);
    let raised = configure(
        &registry,
        &base,
        json!({"max_model_calls":6,"max_tool_calls":20,"max_duration_ms":10000}),
    );
    let command = budget_command("raise", &raised, 0);
    supervisor
        .submit_transition(command.clone(), &raised)
        .await
        .unwrap();
    let sql = rusqlite::Connection::open(dir.path().join("runtime.sqlite")).unwrap();
    sql.execute_batch("CREATE TRIGGER lose_budget_ack BEFORE UPDATE OF result ON agent_runtime_managed_actions WHEN NEW.command_id='raise' BEGIN SELECT RAISE(ABORT,'budget ack lost'); END;").unwrap();
    assert!(
        supervisor
            .execute_managed_action(&registry, "raise")
            .await
            .is_err()
    );
    assert_eq!(
        content_digest(&summary(&store, &ledger).await).unwrap(),
        content_digest(&before).unwrap()
    );
    assert!(store.live_execution("run").await.unwrap().is_none());
    assert_eq!(
        content_digest(&checkpoint(&store, &base).await).unwrap(),
        content_digest(&checkpoint_before).unwrap()
    );
    sql.execute_batch("DROP TRIGGER lose_budget_ack").unwrap();

    let reopened =
        SqliteStore::open_with_clock(&dir.path().join("runtime.sqlite"), clock.clone()).unwrap();
    let recovery = RunSupervisor::new(reopened.clone());
    execute(&recovery, &registry, "raise").await;
    let live = reopened.live_execution("run").await.unwrap().unwrap();
    assert_eq!(live.protocol, "nofy.live/v4");
    let binding = &live.modules.as_ref().unwrap().budgets[0];
    assert_eq!(binding.ledger_identity, ledger.identity);
    assert_eq!(binding.profile_identity, profile(&raised).identity());
    assert_eq!(binding.profile_aliases.len(), 2);
    assert_eq!(
        content_digest(&live.after.state).unwrap(),
        content_digest(&checkpoint_before.state).unwrap()
    );
    let after = summary(&reopened, &ledger).await;
    assert_eq!(after.used, before.used);
    assert_eq!(after.reserved, before.reserved);
    assert_eq!(after.active_operations, before.active_operations);
    assert_eq!(after.operation_count, before.operation_count);
    assert_eq!(after.created_at_ms, before.created_at_ms);
    assert_eq!(after.deadline_ms, before.deadline_ms);
    assert_eq!(after.last_seen_ms, 2000);
    assert!(
        recovery
            .submit_transition(command, &raised)
            .await
            .unwrap()
            .finished
    );
    execute(&recovery, &registry, "raise").await;
    assert_eq!(
        content_digest(&summary(&reopened, &ledger).await).unwrap(),
        content_digest(&after).unwrap()
    );

    let (model, requests) = target(&mut registry, &raised);
    recovery
        .submit_transition(change("model", &model, 1), &model)
        .await
        .unwrap();
    execute(&recovery, &registry, "model").await;
    assert_eq!(
        reopened
            .live_execution("run")
            .await
            .unwrap()
            .unwrap()
            .modules,
        live.modules
    );
    let smaller = configure(
        &registry,
        &model,
        json!({"max_model_calls":6,"max_tool_calls":0,"max_duration_ms":10000}),
    );
    recovery
        .submit_transition(budget_command("shrink", &smaller, 2), &smaller)
        .await
        .unwrap();
    execute(&recovery, &registry, "shrink").await;
    assert!(matches!(
        reopened.claim(&held).await.unwrap(),
        BudgetClaim::Denied(_)
    ));
    assert!(matches!(
        reopened.claim(&claimed).await.unwrap(),
        BudgetClaim::Uncertain
    ));
    assert!(matches!(
        reopened.claim(&done).await.unwrap(),
        BudgetClaim::Replay(_)
    ));
    settle_held(&reopened, &claimed).await;
    assert_eq!(
        summary(&reopened, &ledger).await.blocked.unwrap().reason,
        "limit_exceeded"
    );
    clock.0.store(3000, Ordering::SeqCst);
    let extended = configure(
        &registry,
        &model,
        json!({"max_model_calls":6,"max_tool_calls":20,"max_duration_ms":20000}),
    );
    recovery
        .submit_transition(budget_command("extend", &extended, 3), &extended)
        .await
        .unwrap();
    execute(&recovery, &registry, "extend").await;
    let current = summary(&reopened, &ledger).await;
    assert_eq!(current.created_at_ms, 1000);
    assert_eq!(current.deadline_ms, Some(21000));
    assert!(current.blocked.is_none());
    assert!(matches!(
        reopened.claim(&held).await.unwrap(),
        BudgetClaim::Dispatch
    ));
    settle_held(&reopened, &held).await;
    assert_eq!(
        summary(&reopened, &ledger).await.reserved,
        BudgetCost::default()
    );
    let events = BudgetStore::events(&reopened, &ledger, 0, 256)
        .await
        .unwrap();
    assert_eq!(
        events
            .iter()
            .filter(|event| event.kind == "limits_amended")
            .count(),
        3
    );
    assert!(events.iter().any(|event| {
        event
            .denial
            .as_ref()
            .is_some_and(|denial| denial.reason == "limit_exceeded")
    }));
    release(&recovery, &reopened).await;
    assert!(matches!(
        recovery.execute_submitted(&registry, "run").await.unwrap(),
        Some(RunOutcome::Completed { .. })
    ));
    let final_budget = summary(&reopened, &ledger).await;
    assert_eq!(final_budget.used.model_calls, 2);
    assert_eq!(final_budget.used.tool_calls, 4);
    assert_eq!(requests.lock().unwrap().len(), 1);
    assert_eq!(
        std::fs::read_to_string(dir.path().join("effects")).unwrap(),
        "effect\n"
    );
    assert_eq!(
        content_digest(
            &reopened
                .execution_job("run")
                .await
                .unwrap()
                .unwrap()
                .submission
        )
        .unwrap(),
        content_digest(&original.submission).unwrap()
    );
    let roots: u64 = sql
        .query_row(
            "SELECT count(*) FROM agent_runtime_budget_roots",
            [],
            |row| row.get(0),
        )
        .unwrap();
    assert_eq!(roots, 1);
}

#[tokio::test]
async fn shrinking_below_spent_stops_new_dispatch_and_rollback_keeps_usage() {
    for rollback in [false, true] {
        let dir = tempfile::tempdir().unwrap();
        let (store, registry, base, gates, _) = setup(dir.path(), true, false);
        let ledger = scope(&base);
        let supervisor = Arc::new(RunSupervisor::new(store.clone()));
        park(&supervisor, &store, &registry, &base, &gates).await;
        let before = summary(&store, &ledger).await;
        let reduced = configure(
            &registry,
            &base,
            json!({"max_model_calls":0,"max_tool_calls":0}),
        );
        supervisor
            .submit_transition(budget_command("reduce", &reduced, 0), &reduced)
            .await
            .unwrap();
        execute(&supervisor, &registry, "reduce").await;
        assert_eq!(summary(&store, &ledger).await.used, before.used);
        if rollback {
            supervisor
                .submit_transition(budget_command("rollback", &base, 1), &base)
                .await
                .unwrap();
            execute(&supervisor, &registry, "rollback").await;
            assert_eq!(summary(&store, &ledger).await.used, before.used);
        }
        release(&supervisor, &store).await;
        let outcome = supervisor
            .execute_submitted(&registry, "run")
            .await
            .unwrap()
            .unwrap();
        assert!(
            if rollback {
                matches!(outcome, RunOutcome::Completed { .. })
            } else {
                matches!(outcome, RunOutcome::BudgetExceeded { .. })
            },
            "{outcome:?}"
        );
        assert_eq!(
            gates.calls.load(Ordering::SeqCst),
            if rollback { 2 } else { 1 }
        );
        assert_eq!(
            std::fs::read_to_string(dir.path().join("effects")).unwrap(),
            "effect\n"
        );
    }
}

#[tokio::test]
async fn plan_rejects_resource_storage_and_unselected_changes_before_admission() {
    let dir = tempfile::tempdir().unwrap();
    let (store, mut registry, base, gates, _) = setup(dir.path(), false, false);
    let other = SqliteStore::open(&dir.path().join("other.sqlite")).unwrap();
    let installed = |backend: SqliteStore, authority: &str| {
        Arc::new(
            InstalledBudget::install_named(
                Arc::new(backend),
                BudgetLimits {
                    max_model_calls: Some(8),
                    ..Default::default()
                },
                authority,
                "1",
                3,
            )
            .unwrap(),
        )
    };
    registry
        .register_factory(Arc::new(
            GovernanceFactory::new(
                [
                    ("db".into(), installed(store.clone(), "logical")),
                    ("other".into(), installed(other, "logical")),
                    ("foreign".into(), installed(store.clone(), "different")),
                ]
                .into(),
            )
            .unwrap(),
        ))
        .unwrap();
    let mut doc = serde_json::to_value(&base.bundle.document).unwrap();
    doc["modules"].as_array_mut().unwrap().push(json!({"reference":r("budget"),"factory":"governance.budget","config":{"resource":"db","limits":{"max_model_calls":3,"max_tool_calls":2}}}));
    doc["required_governance"] = json!([r("budget")]);
    let base = compile_system(serde_json::from_value(doc).unwrap(), &registry).unwrap();
    let supervisor = Arc::new(RunSupervisor::new(store.clone()));
    park(&supervisor, &store, &registry, &base, &gates).await;
    let checkpoint_hash = content_digest(&checkpoint(&store, &base).await).unwrap();
    let budget_hash = content_digest(&summary(&store, &scope(&base)).await).unwrap();
    for resource in ["other", "foreign"] {
        let mut doc = serde_json::to_value(&base.bundle.document).unwrap();
        doc["modules"]
            .as_array_mut()
            .unwrap()
            .iter_mut()
            .find(|module| module["reference"] == r("budget"))
            .unwrap()["config"]["resource"] = json!(resource);
        let target = compile_system(serde_json::from_value(doc).unwrap(), &registry).unwrap();
        let error = supervisor
            .submit_transition(budget_command(resource, &target, 0), &target)
            .await
            .unwrap_err();
        assert!(
            error
                .to_string()
                .contains("installed resource and root checkpoint storage"),
            "{error}"
        );
        assert!(store.managed_action(resource).await.unwrap().is_none());
    }
    let target = configure(
        &registry,
        &base,
        json!({"max_model_calls":6,"max_tool_calls":4}),
    );
    assert!(
        supervisor
            .submit_transition(change("unselected", &target, 0), &target)
            .await
            .is_err()
    );
    assert!(store.managed_action("unselected").await.unwrap().is_none());
    assert_eq!(
        content_digest(&checkpoint(&store, &base).await).unwrap(),
        checkpoint_hash
    );
    assert_eq!(
        content_digest(&summary(&store, &scope(&base)).await).unwrap(),
        budget_hash
    );
}

#[tokio::test]
async fn accepted_budget_plan_rejects_ledger_specification_drift_without_partial_install() {
    let dir = tempfile::tempdir().unwrap();
    let (store, registry, base, gates, _) = setup(dir.path(), true, false);
    let supervisor = Arc::new(RunSupervisor::new(store.clone()));
    park(&supervisor, &store, &registry, &base, &gates).await;
    let target = configure(
        &registry,
        &base,
        json!({"max_model_calls":6,"max_tool_calls":4}),
    );
    supervisor
        .submit_transition(budget_command("drift", &target, 0), &target)
        .await
        .unwrap();
    let before = content_digest(&checkpoint(&store, &base).await).unwrap();
    let sql = rusqlite::Connection::open(dir.path().join("runtime.sqlite")).unwrap();
    sql.execute("UPDATE agent_runtime_budget_roots SET payload=json_set(payload,'$.spec.limits.max_model_calls',2)", []).unwrap();
    let ledger = content_digest(&summary(&store, &scope(&base)).await).unwrap();
    let result = supervisor
        .execute_managed_action(&registry, "drift")
        .await
        .unwrap();
    assert!(result.finished);
    assert!(
        result
            .error
            .unwrap()
            .contains("budget specification changed")
    );
    assert!(store.live_execution("run").await.unwrap().is_none());
    assert_eq!(
        content_digest(&checkpoint(&store, &base).await).unwrap(),
        before
    );
    assert_eq!(
        content_digest(&summary(&store, &scope(&base)).await).unwrap(),
        ledger
    );
}

#[test]
fn pre_budget_selection_and_state_encoding_remain_exact() {
    let command = json!({"tool_catalog":false,"hook_subscriptions":false,"policy_set":true});
    let update: ModuleUpdate = serde_json::from_value(command.clone()).unwrap();
    assert!(!update.budget_limits);
    assert_eq!(serde_json::to_value(update).unwrap(), command);
    let state = json!({"tool_catalog":true,"policy_set":true});
    let restored: LiveModuleState = serde_json::from_value(state.clone()).unwrap();
    assert!(restored.budgets.is_empty());
    assert_eq!(serde_json::to_value(restored).unwrap(), state);
}

#[tokio::test]
async fn increasing_limits_does_not_clear_a_violated_usage_bound() {
    let dir = tempfile::tempdir().unwrap();
    let (store, registry, base, gates, _) = setup(dir.path(), true, false);
    let supervisor = Arc::new(RunSupervisor::new(store.clone()));
    park(&supervisor, &store, &registry, &base, &gates).await;
    let ledger = scope(&base);
    let reservation = hold(&store, &summary(&store, &ledger).await.spec, "overrun").await;
    assert!(matches!(
        store.claim(&reservation).await.unwrap(),
        BudgetClaim::Dispatch
    ));
    store
        .settle(
            &reservation,
            BudgetReceipt {
                used: BudgetCost {
                    tool_calls: 2,
                    ..Default::default()
                },
                value: json!({"actual":2}),
            },
        )
        .await
        .unwrap();
    let before = summary(&store, &ledger).await;
    assert_eq!(
        before.blocked.as_ref().unwrap().reason,
        "actual_usage_exceeded_reservation"
    );
    let target = configure(
        &registry,
        &base,
        json!({"max_model_calls":8,"max_tool_calls":20}),
    );
    supervisor
        .submit_transition(budget_command("increase", &target, 0), &target)
        .await
        .unwrap();
    execute(&supervisor, &registry, "increase").await;
    let after = summary(&store, &ledger).await;
    assert_eq!(
        content_digest(&after.blocked).unwrap(),
        content_digest(&before.blocked).unwrap()
    );
    assert_eq!(after.used, before.used);
    release(&supervisor, &store).await;
    assert!(matches!(
        supervisor
            .execute_submitted(&registry, "run")
            .await
            .unwrap(),
        Some(RunOutcome::BudgetExceeded { .. })
    ));
    assert_eq!(gates.calls.load(Ordering::SeqCst), 1);
}

struct SharedBudgetBinding;
impl ModuleFactory for SharedBudgetBinding {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: "binding.budget_reference".into(),
            revision: "1".into(),
            kind: ModuleKind::Binding,
            config_schema: json!({"type":"object","additionalProperties":false}),
            input_schema: None,
            output_schema: None,
            required_capabilities: Default::default(),
            dependencies: [("budget".into(), ModuleKind::Governance)].into(),
        }
    }
    fn build(
        &self,
        _: &Value,
        _: &std::collections::BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        Ok(ModuleInstance::Binding(Arc::new(ProtectedBinding)))
    }
}

#[tokio::test]
async fn selected_budget_updates_cannot_rewrite_an_unselected_binding_dependency() {
    let dir = tempfile::tempdir().unwrap();
    let (store, mut registry, base, gates, _) = setup(dir.path(), true, false);
    registry
        .register_factory(Arc::new(SharedBudgetBinding))
        .unwrap();
    let mut doc = serde_json::to_value(&base.bundle.document).unwrap();
    doc["modules"].as_array_mut().unwrap().push(json!({"reference":r("shared-budget"),"factory":"binding.budget_reference","config":{},"dependencies":{"budget":r("budget")}}));
    doc["programs"]["chat"]["definition"]["bindings"]
        .as_array_mut()
        .unwrap()
        .push(r("shared-budget"));
    let base = compile_system(serde_json::from_value(doc).unwrap(), &registry).unwrap();
    let supervisor = Arc::new(RunSupervisor::new(store.clone()));
    park(&supervisor, &store, &registry, &base, &gates).await;
    let target = configure(
        &registry,
        &base,
        json!({"max_model_calls":6,"max_tool_calls":4}),
    );
    let before = content_digest(&summary(&store, &scope(&base)).await).unwrap();
    let error = supervisor
        .submit_transition(budget_command("shared", &target, 0), &target)
        .await
        .unwrap_err();
    assert!(
        error.to_string().contains("preserved dependency: budget"),
        "{error}"
    );
    assert!(store.managed_action("shared").await.unwrap().is_none());
    assert_eq!(
        content_digest(&summary(&store, &scope(&base)).await).unwrap(),
        before
    );
}

#[tokio::test]
async fn unclaimed_old_reservations_recheck_amended_depth_and_activity_limits() {
    for dimension in [
        "max_depth",
        "max_concurrent_operations",
        "max_active_children",
    ] {
        let dir = tempfile::tempdir().unwrap();
        let (store, registry, base, gates, _) = setup(dir.path(), true, false);
        let ledger = scope(&base);
        let supervisor = Arc::new(RunSupervisor::new(store.clone()));
        park(&supervisor, &store, &registry, &base, &gates).await;
        let budget = summary(&store, &ledger).await;
        let request = BudgetRequest {
            operation_id: "waiting".into(),
            fingerprint: "waiting".into(),
            reserve: BudgetCost {
                steps: 1,
                ..Default::default()
            },
            depth: 3,
            activity: if dimension == "max_active_children" {
                BudgetActivity::Child
            } else {
                BudgetActivity::Operation
            },
            unbounded_tokens: false,
        };
        let BudgetDecision::Granted(held) = store.reserve(&budget.spec, &request).await.unwrap()
        else {
            panic!("reservation")
        };
        let mut limits = json!({"max_model_calls":3,"max_tool_calls":2});
        limits[dimension] = json!(0);
        let target = configure(&registry, &base, limits);
        supervisor
            .submit_transition(budget_command("limits", &target, 0), &target)
            .await
            .unwrap();
        execute(&supervisor, &registry, "limits").await;
        assert!(
            matches!(store.claim(&held).await.unwrap(), BudgetClaim::Denied(_)),
            "{dimension}"
        );
        let after = summary(&store, &ledger).await;
        assert_eq!(after.used, budget.used);
        assert_eq!(after.reserved.steps, 1);
        assert_eq!(after.active_operations + after.active_children, 1);
    }
}
