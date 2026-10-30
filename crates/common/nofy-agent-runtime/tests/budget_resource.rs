use nofy_agent_runtime::{
    governance::{declarative::*, *},
    registry::*,
};
use serde_json::json;
use std::sync::Arc;
fn r(id: &str) -> ModuleRef {
    ModuleRef::new(id, "1")
}
fn registry(store: Arc<dyn BudgetStore>, authority: &str) -> ModuleRegistry {
    let mut registry = ModuleRegistry::default();
    registry
        .register_factory(Arc::new(
            BudgetResourceFactory::new(
                store,
                authority,
                BudgetLimits {
                    max_tool_calls: Some(2),
                    ..Default::default()
                },
                2,
            )
            .unwrap(),
        ))
        .unwrap();
    registry
        .register_factory(Arc::new(ConnectedBudgetFactory))
        .unwrap();
    registry
        .define(ModuleDefinition {
            reference: r("ledger"),
            factory: "resource.budget".into(),
            config: json!({}),
            dependencies: Default::default(),
        })
        .unwrap();
    registry
        .define(ModuleDefinition {
            reference: r("quota"),
            factory: "governance.budget_connected".into(),
            config: json!({"limits":{"max_tool_calls":1}}),
            dependencies: [("budget".into(), r("ledger"))].into(),
        })
        .unwrap();
    registry
}
fn profile(registry: &ModuleRegistry) -> Arc<GovernanceProfile> {
    let resolved = registry.resolve(&[r("quota")]).unwrap();
    let ModuleInstance::Governance(profile) = &resolved.instances[&r("quota")] else {
        panic!("governance")
    };
    profile.clone()
}
#[tokio::test]
async fn logical_resources_are_pure_and_stable_but_cannot_expand_host_grants_or_use_another_resource_type()
 {
    let a = Arc::new(InMemoryBudgetStore::default());
    let b = Arc::new(InMemoryBudgetStore::default());
    let first = registry(a.clone(), "logical-authority");
    let second = registry(b, "logical-authority");
    assert_eq!(profile(&first).identity(), profile(&second).identity());
    assert_ne!(
        profile(&first).identity(),
        profile(&registry(
            Arc::new(InMemoryBudgetStore::default()),
            "other-authority"
        ))
        .identity()
    );
    assert!(
        a.inspect(&BudgetScope {
            root_run_id: "root".into(),
            identity: profile(&first).identity().into()
        })
        .await
        .unwrap()
        .is_none()
    );
    for (id, config) in [
        ("too-much", json!({"limits":{"max_tool_calls":3}})),
        ("too-many-attempts", json!({"retry":{"max_attempts":3}})),
        ("unknown", json!({"unknown":true})),
    ] {
        let mut registry = first.clone();
        registry
            .define(ModuleDefinition {
                reference: r(id),
                factory: "governance.budget_connected".into(),
                config,
                dependencies: [("budget".into(), r("ledger"))].into(),
            })
            .unwrap();
        assert!(registry.resolve(&[r(id)]).is_err());
    }
    let mut wrong = first.clone();
    wrong
        .register_factory(Arc::new(InstanceFactory::new(
            "other-resource",
            "1",
            ModuleInstance::Resource(Arc::new(
                ResourceHandle::new("other", Arc::new(())).unwrap(),
            )),
        )))
        .unwrap();
    wrong
        .define(ModuleDefinition {
            reference: r("other"),
            factory: "other-resource".into(),
            config: json!({}),
            dependencies: Default::default(),
        })
        .unwrap();
    wrong
        .define(ModuleDefinition {
            reference: r("wrong"),
            factory: "governance.budget_connected".into(),
            config: json!({}),
            dependencies: [("budget".into(), r("other"))].into(),
        })
        .unwrap();
    assert!(wrong.resolve(&[r("wrong")]).is_err());
    assert!(BudgetResourceFactory::new(a, "", BudgetLimits::default(), 2).is_err());
}
#[cfg(feature = "sqlite")]
mod sqlite {
    use super::*;
    use nofy_agent_runtime::{
        durable::SqliteStore, program::CompiledProgram, supervisor::RunSupervisor, tool_program::*,
        *,
    };
    use serde_json::Value;
    struct Effect(std::path::PathBuf);
    impl nofy_tool_runtime::Tool for Effect {
        type Args = Value;
        type Output = Value;
        fn id(&self) -> nofy_tool_protocol::ToolId {
            nofy_tool_protocol::ToolId::new("effect").unwrap()
        }
        fn description(
            &self,
            _: &nofy_tool_runtime::ListToolsContext,
        ) -> nofy_tool_types::ToolDescription {
            nofy_tool_types::ToolDescription::new("effect", "Write a real effect")
        }
        async fn run(
            &self,
            _: nofy_tool_runtime::ToolCallContext,
            _: Value,
        ) -> Result<Value, nofy_tool_runtime::ToolError> {
            std::fs::write(&self.0, b"effect").unwrap();
            Ok(json!({"written":true}))
        }
    }
    #[tokio::test]
    async fn named_identity_portability_does_not_authorize_a_foreign_physical_ledger() {
        let dir = tempfile::tempdir().unwrap();
        let effect = dir.path().join("effect");
        let a = SqliteStore::open(&dir.path().join("a.sqlite")).unwrap();
        let b = SqliteStore::open(&dir.path().join("b.sqlite")).unwrap();
        let mut first = registry(Arc::new(a.clone()), "same-authority");
        let second = registry(Arc::new(b.clone()), "same-authority");
        assert_eq!(profile(&first).identity(), profile(&second).identity());
        let legacy = |store: SqliteStore| {
            GovernanceProfile::new(
                Arc::new(
                    InstalledBudget::install(Arc::new(store), BudgetLimits::default(), "1", 2)
                        .unwrap(),
                ),
                BudgetLimits::default(),
                ModelRetryPolicy::default(),
            )
            .unwrap()
        };
        assert_ne!(legacy(a).identity(), legacy(b.clone()).identity());
        let mut tools = ToolCatalog::new();
        tools
            .insert(ToolEntry::typed(Effect(effect.clone())))
            .unwrap();
        first
            .register_factory(Arc::new(InstanceFactory::new(
                "tool.effect",
                "1",
                ModuleInstance::ToolPack(tools),
            )))
            .unwrap();
        first
            .define(ModuleDefinition {
                reference: r("tools"),
                factory: "tool.effect".into(),
                config: json!({}),
                dependencies: Default::default(),
            })
            .unwrap();
        let definition = serde_json::from_value(
            json!({"name":"foreign-test","tool_packs":[r("tools")],"governance":[r("quota")]}),
        )
        .unwrap();
        let program = CompiledProgram::for_tool(
            &compile_tools(definition, &first).unwrap(),
            ToolCall {
                id: "effect".into(),
                name: "effect".into(),
                arguments: json!({}),
            },
        )
        .unwrap();
        let error = RunSupervisor::new(b)
            .execute_program(
                &program,
                RunInput::default(),
                RunContext::new("thread", "root"),
            )
            .await
            .unwrap_err();
        assert!(
            error
                .to_string()
                .contains("share the root checkpoint storage"),
            "{error}"
        );
        assert!(!effect.exists());
    }
}
