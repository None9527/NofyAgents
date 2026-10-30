use nofy_agent_runtime::{registry::*, *};
use serde_json::{Value, json};
use std::{
    collections::BTreeMap,
    sync::{
        Arc,
        atomic::{AtomicUsize, Ordering},
    },
};
fn r(name: &str) -> ModuleRef {
    ModuleRef::new(name, "1")
}
fn descriptor(
    name: &str,
    kind: ModuleKind,
    deps: BTreeMap<String, ModuleKind>,
) -> ModuleDescriptor {
    ModuleDescriptor {
        factory: name.into(),
        revision: "1".into(),
        kind,
        config_schema: json!({"type":"object","additionalProperties":false}),
        dependencies: deps,
        input_schema: None,
        output_schema: None,
        required_capabilities: Default::default(),
    }
}
struct Derived;
impl ModuleFactory for Derived {
    fn descriptor(&self) -> ModuleDescriptor {
        let mut d = descriptor(
            "derived",
            ModuleKind::Prompt,
            [("base".into(), ModuleKind::Prompt)].into(),
        );
        d.required_capabilities.insert("scope-cap".into());
        d
    }
    fn build(
        &self,
        _: &Value,
        deps: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        Ok(deps["base"].clone())
    }
}
struct Floor;
#[async_trait::async_trait]
impl Policy for Floor {
    async fn admit(&self, _: &ToolCall, _: &RunState, _: &RunContext) -> Result<Admission, Error> {
        Ok(Admission::Allow)
    }
}
struct Probe;
impl ModuleFactory for Probe {
    fn descriptor(&self) -> ModuleDescriptor {
        descriptor(
            "probe",
            ModuleKind::Resource,
            [("visible".into(), ModuleKind::Prompt)].into(),
        )
    }
    fn build(
        &self,
        _: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        Err(Error::Composition("context required".into()))
    }
    fn build_with_context(
        &self,
        _: &Value,
        _: &BTreeMap<String, ModuleInstance>,
        context: &ModuleBuildContext<'_>,
    ) -> Result<ModuleInstance, Error> {
        let scope = context.dependency_registry()?;
        assert!(scope.definition(&r("private")).is_none());
        assert!(scope.definition(&r("base")).is_some());
        assert!(scope.definition(&r("visible")).is_some());
        assert!(scope.definition(&r("floor")).is_some());
        assert!(scope.required_policies().contains(&r("floor")));
        let result = scope.resolve_typed(&[(r("visible"), ModuleKind::Prompt)])?;
        context.verify_dependencies(&result.snapshot)?;
        Ok(ModuleInstance::Resource(Arc::new(ResourceHandle::new(
            "probe-v1",
            Arc::new(context.definition().reference.clone()),
        )?)))
    }
}
fn definition(
    registry: &mut ModuleRegistry,
    name: &str,
    factory: &str,
    config: Value,
    deps: BTreeMap<String, ModuleRef>,
) {
    registry
        .define(ModuleDefinition {
            reference: r(name),
            factory: factory.into(),
            config,
            dependencies: deps,
        })
        .unwrap();
}
#[test]
fn context_has_only_declared_transitive_dependencies_capabilities_and_required_floors() {
    let mut registry = ModuleRegistry::default();
    registry
        .register_factory(Arc::new(StaticPromptFactory))
        .unwrap();
    registry.register_factory(Arc::new(Derived)).unwrap();
    registry.register_factory(Arc::new(Probe)).unwrap();
    registry
        .register_factory(Arc::new(InstanceFactory::new(
            "floor",
            "1",
            ModuleInstance::Policy(Arc::new(Floor)),
        )))
        .unwrap();
    registry.provide_capability("scope-cap").unwrap();
    definition(
        &mut registry,
        "private",
        "prompt.static",
        json!({"text":"unrelated"}),
        Default::default(),
    );
    definition(
        &mut registry,
        "base",
        "prompt.static",
        json!({"text":"allowed"}),
        Default::default(),
    );
    definition(
        &mut registry,
        "visible",
        "derived",
        json!({}),
        [("base".into(), r("base"))].into(),
    );
    definition(
        &mut registry,
        "floor",
        "floor",
        json!({}),
        Default::default(),
    );
    definition(
        &mut registry,
        "probe",
        "probe",
        json!({}),
        [("visible".into(), r("visible"))].into(),
    );
    registry.require_policy(r("floor"));
    let resolved = registry.resolve(&[r("private"), r("probe")]).unwrap();
    assert_eq!(resolved.snapshot.len(), 4);
    assert_eq!(
        resolved
            .snapshot
            .last()
            .unwrap()
            .resource_identity
            .as_deref(),
        Some("probe-v1")
    );
}
struct Changing(Arc<AtomicUsize>);
impl ModuleFactory for Changing {
    fn descriptor(&self) -> ModuleDescriptor {
        descriptor("changing", ModuleKind::Resource, Default::default())
    }
    fn build(
        &self,
        _: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        Ok(ModuleInstance::Resource(Arc::new(ResourceHandle::new(
            format!("resource-{}", self.0.fetch_add(1, Ordering::SeqCst)),
            Arc::new(1u64),
        )?)))
    }
}
struct Verify;
impl ModuleFactory for Verify {
    fn descriptor(&self) -> ModuleDescriptor {
        descriptor(
            "verify",
            ModuleKind::Resource,
            [("dep".into(), ModuleKind::Resource)].into(),
        )
    }
    fn build(
        &self,
        _: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        Err(Error::Composition("context required".into()))
    }
    fn build_with_context(
        &self,
        _: &Value,
        _: &BTreeMap<String, ModuleInstance>,
        context: &ModuleBuildContext<'_>,
    ) -> Result<ModuleInstance, Error> {
        let actual = context.dependency_registry()?.resolve(&[r("changing")])?;
        context.verify_dependencies(&actual.snapshot)?;
        Ok(actual.instances[&r("changing")].clone())
    }
}
#[test]
fn rebinding_the_same_reference_to_another_native_resource_is_rejected_before_execution() {
    let mut registry = ModuleRegistry::default();
    registry
        .register_factory(Arc::new(Changing(Arc::new(AtomicUsize::new(0)))))
        .unwrap();
    registry.register_factory(Arc::new(Verify)).unwrap();
    definition(
        &mut registry,
        "changing",
        "changing",
        json!({}),
        Default::default(),
    );
    definition(
        &mut registry,
        "verify",
        "verify",
        json!({}),
        [("dep".into(), r("changing"))].into(),
    );
    let error = registry.resolve(&[r("verify")]).err().unwrap();
    assert!(error.to_string().contains("composite dependency changed"));
}
