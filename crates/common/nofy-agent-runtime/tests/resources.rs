use nofy_agent_runtime::registry::*;
use serde_json::json;
use std::sync::Arc;
#[test]
fn resources_are_typed_and_freeze_identity_without_serializing_live_values() {
    let mut registry = ModuleRegistry::default();
    let handle = Arc::new(
        ResourceHandle::new("connection-v1", Arc::new("live-private-value".to_string())).unwrap(),
    );
    assert_eq!(&*handle.get::<String>().unwrap(), "live-private-value");
    assert!(handle.get::<u64>().is_none());
    registry
        .register_factory(Arc::new(InstanceFactory::new(
            "resource.native",
            "1",
            ModuleInstance::Resource(handle),
        )))
        .unwrap();
    let reference = ModuleRef::new("connection", "1");
    registry
        .define(ModuleDefinition {
            reference: reference.clone(),
            factory: "resource.native".into(),
            config: json!({}),
            dependencies: Default::default(),
        })
        .unwrap();
    assert!(
        registry
            .resolve_typed(&[(reference.clone(), ModuleKind::Model)])
            .is_err()
    );
    let resolved = registry
        .resolve_typed(&[(reference, ModuleKind::Resource)])
        .unwrap();
    assert_eq!(
        resolved.snapshot[0].resource_identity.as_deref(),
        Some("connection-v1")
    );
    assert!(
        !serde_json::to_string(&resolved.snapshot)
            .unwrap()
            .contains("live-private-value")
    );
}
#[test]
fn older_module_snapshot_roundtrips_without_a_new_resource_field() {
    let mut registry = ModuleRegistry::default();
    registry
        .register_factory(Arc::new(StaticPromptFactory))
        .unwrap();
    let reference = ModuleRef::new("prompt", "1");
    registry
        .define(ModuleDefinition {
            reference: reference.clone(),
            factory: "prompt.static".into(),
            config: json!({"text":"old"}),
            dependencies: Default::default(),
        })
        .unwrap();
    let snapshot = registry.resolve(&[reference]).unwrap().snapshot.remove(0);
    let value = serde_json::to_value(&snapshot).unwrap();
    assert!(value.get("resource_identity").is_none());
    let restored: ResolvedModule = serde_json::from_value(value.clone()).unwrap();
    assert!(restored.resource_identity.is_none());
    assert_eq!(serde_json::to_value(restored).unwrap(), value);
}
