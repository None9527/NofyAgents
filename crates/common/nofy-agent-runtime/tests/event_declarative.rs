use nofy_agent_runtime::{event_program::declarative::*, hooks::*, registry::*, system::*, *};
use serde_json::{Value, json};
use std::sync::Arc;
fn r(id: &str) -> ModuleRef {
    ModuleRef::new(id, "1")
}
fn producer() -> Value {
    json!({"events":[{"name":"business.received","payload_schema":{"type":"object","required":["value"],"properties":{"value":{"type":"integer"}},"additionalProperties":false},"patch":true}]})
}
struct Record(std::path::PathBuf);
#[async_trait::async_trait]
impl HookHandler for Record {
    async fn handle(&self, event: &HookEvent, _: &RunContext) -> Result<HookDecision, Error> {
        use std::io::Write;
        let mut file = std::fs::OpenOptions::new()
            .create(true)
            .append(true)
            .open(&self.0)
            .unwrap();
        writeln!(file, "{}", serde_json::to_string(event).unwrap()).unwrap();
        file.sync_all().unwrap();
        Ok(HookDecision::Patch {
            payload: json!({"value":event.payload["value"].as_i64().unwrap()+1}),
        })
    }
}
fn registry() -> ModuleRegistry {
    let mut registry = ModuleRegistry::default();
    registry
        .register_factory(Arc::new(EventProducerFactory))
        .unwrap();
    registry
        .register_factory(Arc::new(OwnedHookFactory))
        .unwrap();
    registry
}
#[tokio::test]
async fn owned_event_file_binds_owner_and_replays_native_hook_once_without_sqlite_or_model() {
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("events.jsonl");
    let mut registry = registry();
    registry
        .register_factory(Arc::new(InstanceFactory::new(
            "handler.file",
            "1",
            ModuleInstance::HookHandler(Arc::new(Record(path.clone()))),
        )))
        .unwrap();
    let document = serde_json::from_value(json!({"schema_version":1,"name":"owned","modules":[
        {"reference":r("producer"),"factory":"event.producer","config":producer()},
        {"reference":r("handler"),"factory":"handler.file","config":{}},
        {"reference":r("subscription"),"factory":"hook.owned_subscription","config":{"event":"business.received"},"dependencies":{"producer":r("producer"),"handler":r("handler")}}
    ],"programs":{"received":{"kind":"event","definition":{"schema_version":1,"host":{"name":"owned-host","hooks":[r("subscription")]},"producer":r("producer"),"event":"business.received","operation":"receive-1","payload":{"value":7}}}}})).unwrap();
    let system = compile_system(document, &registry).unwrap();
    assert!(!path.exists());
    let bundle =
        serde_json::from_slice::<SystemBundle>(&serde_json::to_vec(&system.bundle).unwrap())
            .unwrap();
    let system = bundle.restore(&registry).unwrap();
    let store = Arc::new(InMemoryCheckpointer::default());
    let program = system
        .program_with_parameters("received", Some(json!({"value":19})))
        .unwrap()
        .with_checkpointer(store.clone());
    let context = RunContext::new("thread", "run");
    let outcome = program
        .invoke(RunInput::default(), context.clone())
        .await
        .unwrap();
    let RunOutcome::Completed { output, state } = outcome else {
        panic!("event did not complete")
    };
    assert!(state.messages.is_empty());
    assert_eq!(state.model_sequence, 0);
    assert_eq!(
        serde_json::from_str::<HookResult>(&output).unwrap().payload,
        json!({"value":20})
    );
    let restored = program
        .snapshot
        .restore(&registry)
        .unwrap()
        .with_checkpointer(store);
    restored.invoke(RunInput::resume(), context).await.unwrap();
    let records = std::fs::read_to_string(path).unwrap();
    assert_eq!(records.lines().count(), 1);
    let event: HookEvent = serde_json::from_str(records.lines().next().unwrap()).unwrap();
    assert_eq!(event.owner, r("producer"));
    assert_eq!(event.payload, json!({"value":19}));
}
#[test]
fn external_event_config_cannot_claim_core_authority_or_upload_owner_and_schema_references() {
    let mut configs = vec![
        json!({"events":[]}),
        json!({"events":[{"name":"before_model","payload_schema":true}]}),
    ];
    let mut owner = producer();
    owner["owner"] = json!(r("nofy.runtime"));
    configs.push(owner);
    let mut owner = producer();
    owner["events"][0]["owner"] = json!(r("nofy.runtime"));
    configs.push(owner);
    let mut duplicate = producer();
    let extra = duplicate["events"][0].clone();
    duplicate["events"].as_array_mut().unwrap().push(extra);
    configs.push(duplicate);
    configs.push(json!({"events":[{"name":"business.received","payload_schema":{"$ref":"https://example.invalid/schema"}}]}));
    for config in configs {
        let mut registry = registry();
        registry
            .define(ModuleDefinition {
                reference: r("producer"),
                factory: "event.producer".into(),
                config,
                dependencies: Default::default(),
            })
            .unwrap();
        assert!(registry.resolve(&[r("producer")]).is_err());
    }
    let mut registry = registry();
    registry
        .define(ModuleDefinition {
            reference: r("nofy.runtime"),
            factory: "event.producer".into(),
            config: producer(),
            dependencies: Default::default(),
        })
        .unwrap();
    assert!(registry.resolve(&[r("nofy.runtime")]).is_err());
    assert!(
        EventProducerFactory
            .build(&producer(), &Default::default())
            .is_err()
    );
}
