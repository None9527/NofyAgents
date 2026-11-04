use super::*;

struct DependentTransformFactory(Arc<Mutex<Vec<String>>>);
impl ModuleFactory for DependentTransformFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        descriptor(
            "context.dependent",
            ModuleKind::ContextPolicy,
            std::collections::BTreeMap::from([("source".into(), ModuleKind::ContextSource)]),
        )
    }
    fn build(
        &self,
        _: &Value,
        _: &std::collections::BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        Ok(ModuleInstance::ContextPolicy(Arc::new(Transform(
            "fixed".into(),
            self.0.clone(),
        ))))
    }
}
fn dependent(registry: &ModuleRegistry, system: &CompiledSystem, revision: &str) -> CompiledSystem {
    let system = source_system(registry, system, Some(revision), "empty");
    let mut doc = serde_json::to_value(&system.bundle.document).unwrap();
    let policy = doc["modules"]
        .as_array_mut()
        .unwrap()
        .iter_mut()
        .find(|m| m["reference"] == r("transform"))
        .unwrap();
    policy["factory"] = json!("context.dependent");
    policy["config"] = json!({"revision":"fixed"});
    policy["dependencies"] = json!({"source":r("retrieval")});
    compile_system(serde_json::from_value(doc).unwrap(), registry).unwrap()
}
#[tokio::test]
async fn effective_context_policy_identity_includes_dependency_content_and_survives_unrelated_prompt_changes()
 {
    let mut identities = vec![];
    for (revision, later_prompt) in [
        ("original", false),
        ("changed-a", false),
        ("changed-b", false),
        ("changed-a", true),
    ] {
        let dir = tempfile::tempdir().unwrap();
        let (store, mut registry, base, gates, _) = setup(dir.path(), false, false);
        let sources = install(&mut registry);
        registry
            .register_factory(Arc::new(DependentTransformFactory(
                sources.policies.clone(),
            )))
            .unwrap();
        let base = dependent(&registry, &base, "original");
        let target = dependent(&registry, &base, revision);
        let before = base
            .registry()
            .resolve(&[ModuleRef::new("transform", "1")])
            .unwrap();
        let after = target
            .registry()
            .resolve(&[ModuleRef::new("transform", "1")])
            .unwrap();
        let original = serde_json::to_string(
            before
                .snapshot
                .iter()
                .find(|m| m.definition.reference.id == "transform")
                .unwrap(),
        )
        .unwrap();
        // Own definition, alias and factory revision stay identical; only a transitive module changes.
        assert_eq!(
            original,
            serde_json::to_string(
                after
                    .snapshot
                    .iter()
                    .find(|m| m.definition.reference.id == "transform")
                    .unwrap()
            )
            .unwrap()
        );
        let supervisor = Arc::new(RunSupervisor::new(store.clone()));
        park(&supervisor, &store, &registry, &base, &gates).await;
        supervisor
            .submit_transition(source_update("sources", &target, 0), &target)
            .await
            .unwrap();
        execute(&supervisor, &registry, "sources").await;
        if later_prompt {
            let mut doc = serde_json::to_value(&target.bundle.document).unwrap();
            doc["modules"]
                .as_array_mut()
                .unwrap()
                .iter_mut()
                .find(|m| m["reference"] == r("prompt"))
                .unwrap()["config"]["text"] = json!("unrelated prompt");
            let prompt = compile_system(serde_json::from_value(doc).unwrap(), &registry).unwrap();
            supervisor
                .submit_transition(change("prompt-only", &prompt, 1), &prompt)
                .await
                .unwrap();
            execute(&supervisor, &registry, "prompt-only").await;
        }
        release(&supervisor, &store).await;
        let Some(RunOutcome::Completed { state, .. }) = supervisor
            .execute_submitted(&registry, "run")
            .await
            .unwrap()
        else {
            panic!("completed")
        };
        assert_eq!(*sources.policies.lock().unwrap(), ["fixed"]);
        assert_eq!(state.context_progress.completed.len(), 1);
        let identity = state.context_progress.completed.into_iter().next().unwrap();
        if revision == "original" {
            assert_eq!(identity, original);
        } else {
            assert!(identity.starts_with("live-context-policy/v1:"));
        }
        identities.push(identity);
    }
    assert_ne!(identities[0], identities[1]);
    assert_ne!(identities[1], identities[2]);
    assert_eq!(identities[1], identities[3]);
}
