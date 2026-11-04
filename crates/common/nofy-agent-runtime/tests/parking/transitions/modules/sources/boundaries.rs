use super::*;

#[test]
fn unselected_source_fields_leave_existing_command_and_version_bytes_unchanged() {
    let command = json!({"tool_catalog":false,"hook_subscriptions":true,"policy_set":true,"budget_limits":true});
    let parsed: ModuleUpdate = serde_json::from_value(command.clone()).unwrap();
    assert!(!parsed.context_sources && !parsed.context_policies && !parsed.tool_sources);
    assert_eq!(serde_json::to_value(parsed).unwrap(), command);
    let state = json!({"tool_catalog":false,"hook_epoch":null,"policy_set":true});
    let parsed: LiveModuleState = serde_json::from_value(state.clone()).unwrap();
    assert!(!parsed.context_sources && !parsed.context_policies && !parsed.tool_sources);
    assert_eq!(
        serde_json::to_value(parsed).unwrap(),
        json!({"tool_catalog":false,"policy_set":true})
    );
}

struct PreserveBinding;
impl context::ContextBinding for PreserveBinding {
    fn bind(&self, _: &mut RunContext) -> Result<(), Error> {
        Ok(())
    }
}
struct ProtectedFactory(ModuleKind);
impl ModuleFactory for ProtectedFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        descriptor(
            "binding.protected-source",
            ModuleKind::Binding,
            std::collections::BTreeMap::from([("preserved".into(), self.0)]),
        )
    }
    fn build(
        &self,
        _: &Value,
        _: &std::collections::BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        Ok(ModuleInstance::Binding(Arc::new(PreserveBinding)))
    }
}
#[tokio::test]
async fn selected_sources_cannot_rewrite_dependencies_shared_with_preserved_bindings() {
    for (kind, id) in [
        (ModuleKind::ContextSource, "retrieval"),
        (ModuleKind::ContextPolicy, "transform"),
        (ModuleKind::ToolSource, "catalog-source"),
    ] {
        let dir = tempfile::tempdir().unwrap();
        let (store, mut registry, base, gates, _) = setup(dir.path(), false, false);
        install(&mut registry);
        registry
            .register_factory(Arc::new(ProtectedFactory(kind)))
            .unwrap();
        let base = source_system(&registry, &base, Some("original"), "empty");
        let mut doc = serde_json::to_value(&base.bundle.document).unwrap();
        doc["modules"].as_array_mut().unwrap().push(json!({"reference":r("preserved"),"factory":"binding.protected-source","config":{"revision":"fixed"},"dependencies":{"preserved":r(id)}}));
        doc["programs"]["chat"]["definition"]["bindings"]
            .as_array_mut()
            .unwrap()
            .push(r("preserved"));
        let base = compile_system(serde_json::from_value(doc).unwrap(), &registry).unwrap();
        let target = source_system(&registry, &base, Some("replacement"), "empty");
        let supervisor = Arc::new(RunSupervisor::new(store.clone()));
        park(&supervisor, &store, &registry, &base, &gates).await;
        let before = content_digest(&checkpoint(&store, &base).await).unwrap();
        let error = supervisor
            .submit_transition(source_update("shared", &target, 0), &target)
            .await
            .unwrap_err();
        assert!(
            error
                .to_string()
                .contains(&format!("preserved dependency: {id}")),
            "{error}"
        );
        assert!(store.managed_action("shared").await.unwrap().is_none());
        assert_eq!(
            content_digest(&checkpoint(&store, &base).await).unwrap(),
            before
        );
    }
}

struct PendingGate(Arc<Mutex<Vec<HookEvent>>>);
#[async_trait::async_trait]
impl HookHandler for PendingGate {
    async fn handle(&self, event: &HookEvent, _: &RunContext) -> Result<HookDecision, Error> {
        self.0.lock().unwrap().push(event.clone());
        Ok(HookDecision::Pause {
            reason: json!({"kind":"pending-source-gate"}),
        })
    }
}
#[tokio::test]
async fn pending_model_gate_and_context_plan_finish_under_their_original_version_before_update() {
    for compact in [false, true] {
        let dir = tempfile::tempdir().unwrap();
        let (store, mut registry, base, gates, _) = setup(dir.path(), false, false);
        let sources = install(&mut registry);
        let events = Arc::new(Mutex::new(vec![]));
        registry
            .register_factory(Arc::new(InstanceFactory::new(
                "hook.source-gate",
                "1",
                ModuleInstance::HookHandler(Arc::new(PendingGate(events.clone()))),
            )))
            .unwrap();
        registry
            .register_factory(Arc::new(HookFactory::new(EventCatalog::runtime())))
            .unwrap();
        let base = source_system(&registry, &base, Some("original"), "empty");
        let mut doc = serde_json::to_value(&base.bundle.document).unwrap();
        doc["modules"].as_array_mut().unwrap().extend([
            json!({"reference":r("gate-handler"),"factory":"hook.source-gate","config":{}}),
            json!({"reference":r("gate"),"factory":"hook.subscription","config":{"event":if compact {"before_compact"} else {"before_model"}},"dependencies":{"handler":r("gate-handler")}})
        ]);
        doc["programs"]["chat"]["definition"]["hooks"] = json!([r("gate")]);
        let base = compile_system(serde_json::from_value(doc).unwrap(), &registry).unwrap();
        let target = source_system(&registry, &base, Some("replacement"), "empty");
        let supervisor = Arc::new(RunSupervisor::new(store.clone()));
        supervisor
            .submit_managed(request(&base, "run"), &base)
            .await
            .unwrap();
        let worker = {
            let supervisor = supervisor.clone();
            let registry = registry.clone();
            tokio::spawn(async move { supervisor.execute_submitted(&registry, "run").await })
        };
        if compact {
            wake(&gates.model_started).await;
            gates.model_release.notify_one();
            wake(&gates.tool_started).await;
            gates.tool_release.notify_one();
        }
        assert!(matches!(
            worker.await.unwrap().unwrap(),
            Some(RunOutcome::Paused { .. })
        ));
        let before = checkpoint(&store, &base).await;
        if compact {
            assert!(before.state.context_progress.pending.is_some());
        } else {
            assert!(before.state.hook_progress.prepared_model.is_some());
        }
        store
            .enqueue_managed_action(action("park", ManagedCommand::Park))
            .await
            .unwrap();
        let parking = supervisor
            .execute_managed_action(&registry, "park")
            .await
            .unwrap();
        assert!(!parking.finished);
        assert!(
            supervisor
                .submit_transition(source_update("premature", &target, 0), &target)
                .await
                .is_err()
        );
        assert!(store.managed_action("premature").await.unwrap().is_none());
        assert_eq!(
            content_digest(&checkpoint(&store, &base).await).unwrap(),
            content_digest(&before).unwrap()
        );
        let nofy_agent_runtime::program::ProgramSnapshot::Agent { snapshot } =
            &base.program("chat").unwrap().snapshot.program
        else {
            panic!("Agent snapshot")
        };
        let original_agent = snapshot.restore(&registry).unwrap();
        let bus = original_agent.agent.hook_bus().unwrap();
        let event = events.lock().unwrap().last().unwrap().clone();
        nofy_agent_runtime::hooks::HookJournal::new(Arc::new(store.clone()))
            .reconcile(bus, &bus.registrations()[0], &event, HookDecision::Continue)
            .await
            .unwrap();
        let resumed = {
            let supervisor = supervisor.clone();
            let registry = registry.clone();
            tokio::spawn(async move { supervisor.execute_submitted(&registry, "run").await })
        };
        if !compact {
            wake(&gates.model_started).await;
            gates.model_release.notify_one();
            wake(&gates.tool_started).await;
            gates.tool_release.notify_one();
        }
        assert!(
            matches!(resumed.await.unwrap().unwrap(), Some(RunOutcome::Paused {ref reason,..}) if reason["kind"] == "parked")
        );
        let parked = checkpoint(&store, &base).await;
        assert!(parked.state.context_progress.pending.is_none());
        assert!(parked.state.hook_progress.prepared_model.is_none());
        if compact {
            assert_eq!(*sources.policies.lock().unwrap(), ["original"]);
        }
        supervisor
            .submit_transition(source_update("sources", &target, 0), &target)
            .await
            .unwrap();
        execute(&supervisor, &registry, "sources").await;
        assert_eq!(
            store
                .live_execution("run")
                .await
                .unwrap()
                .unwrap()
                .before
                .revision,
            parked.revision
        );
        assert_eq!(
            std::fs::read_to_string(dir.path().join("effects")).unwrap(),
            "effect\n"
        );
    }
}
