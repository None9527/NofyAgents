use nofy_agent_runtime::{agent::RunEvent, context::ContextBinding, events::*, *};
#[cfg(feature = "sqlite")]
use serde_json::json;
use std::sync::{
    Arc, Mutex,
    atomic::{AtomicUsize, Ordering},
};
struct Echo(Arc<AtomicUsize>);
#[async_trait::async_trait]
impl Model for Echo {
    async fn complete(&self, _: ModelRequest, _: &RunContext) -> Result<ModelResponse, Error> {
        self.0.fetch_add(1, Ordering::SeqCst);
        Ok(ModelResponse {
            output: "done".into(),
            ..Default::default()
        })
    }
}
struct Clear;
impl ContextBinding for Clear {
    fn bind(&self, context: &mut RunContext) -> Result<(), Error> {
        context.capabilities = Default::default();
        Ok(())
    }
}
struct ChangeOwner;
impl ContextBinding for ChangeOwner {
    fn bind(&self, context: &mut RunContext) -> Result<(), Error> {
        context.run_id = "another-owner".into();
        Ok(())
    }
}
struct ReplaceCancel;
impl ContextBinding for ReplaceCancel {
    fn bind(&self, context: &mut RunContext) -> Result<(), Error> {
        context.cancel = Default::default();
        Ok(())
    }
}
#[derive(Default)]
struct Sink(Mutex<Vec<(String, RunEvent)>>);
#[async_trait::async_trait]
impl EventSink for Sink {
    async fn record(&self, scope: EventScope, event: RunEvent) -> Result<(), Error> {
        self.0.lock().unwrap().push((scope.run_id, event));
        Ok(())
    }
}
fn build(calls: Arc<AtomicUsize>) -> Agent {
    let mut c = Components::default();
    c.models.insert("model".into(), Arc::new(Echo(calls)));
    c.prompts
        .insert("prompt".into(), Arc::new(StaticPrompt("system".into())));
    AgentBuilder::new("agent")
        .model("model")
        .prompt("prompt")
        .compile(&c)
        .unwrap()
}
#[tokio::test]
async fn binding_cannot_erase_authoritative_events_or_replace_cancel_or_owner() {
    for (binding, mode) in [
        (Arc::new(Clear) as Arc<dyn ContextBinding>, "clear"),
        (Arc::new(ReplaceCancel), "cancel"),
        (Arc::new(ChangeOwner), "owner"),
    ] {
        let calls = Arc::new(AtomicUsize::new(0));
        let sink = Arc::new(Sink::default());
        let mut context = RunContext::new("thread", "root");
        context.capabilities.insert(EventSinkBinding(sink.clone()));
        if mode == "cancel" {
            context.cancel.cancel();
        }
        let result = build(calls.clone())
            .with_binding(mode, binding)
            .invoke(RunInput::new("task"), context)
            .await;
        match mode {
            "clear" => {
                assert!(matches!(result.unwrap(), RunOutcome::Completed { .. }));
                assert_eq!(calls.load(Ordering::SeqCst), 1);
            }
            "cancel" => {
                assert!(matches!(result.unwrap(), RunOutcome::Cancelled { .. }));
                assert_eq!(calls.load(Ordering::SeqCst), 0);
            }
            _ => {
                assert!(matches!(result, Err(Error::Composition(_))));
                assert_eq!(calls.load(Ordering::SeqCst), 0);
            }
        }
        let events = sink.0.lock().unwrap();
        assert!(!events.is_empty());
        assert!(events.iter().all(|(run, _)| run == "root"));
    }
}
#[cfg(feature = "sqlite")]
struct Parent;
#[async_trait::async_trait]
#[cfg(feature = "sqlite")]
impl Model for Parent {
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        Ok(
            if request
                .messages
                .iter()
                .any(|m| matches!(m, Message::Tool { .. }))
            {
                ModelResponse {
                    output: "done".into(),
                    ..Default::default()
                }
            } else {
                ModelResponse {
                    tool_calls: vec![ToolCall {
                        id: "child-call".into(),
                        name: "child".into(),
                        arguments: json!({"prompt":"task"}),
                    }],
                    ..Default::default()
                }
            },
        )
    }
}
#[tokio::test]
#[cfg(feature = "sqlite")]
async fn supervisor_tree_and_child_mailbox_survive_cleared_binding_extensions() {
    use nofy_agent_runtime::{
        compile::*, durable::SqliteStore, registry::*, supervisor::RunSupervisor,
    };
    let temp = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
    let calls = Arc::new(AtomicUsize::new(0));
    let child = build(calls.clone());
    let mut tools = ToolCatalog::new();
    tools.insert(child.as_tool("child", "Child Agent")).unwrap();
    let mut registry = ModuleRegistry::default();
    for (name, instance) in [
        ("model", ModuleInstance::Model(Arc::new(Parent))),
        (
            "prompt",
            ModuleInstance::Prompt(Arc::new(StaticPrompt("system".into()))),
        ),
        ("tools", ModuleInstance::ToolPack(tools)),
        ("binding", ModuleInstance::Binding(Arc::new(Clear))),
    ] {
        registry
            .register_factory(Arc::new(InstanceFactory::new(name, "1", instance)))
            .unwrap();
        registry
            .define(ModuleDefinition {
                reference: ModuleRef::new(name, "1"),
                factory: name.into(),
                config: json!({}),
                dependencies: Default::default(),
            })
            .unwrap();
    }
    let compiled=compile_agent(serde_json::from_value(json!({"name":"parent","model":{"id":"model","version":"1"},"prompt":{"id":"prompt","version":"1"},"tool_packs":[{"id":"tools","version":"1"}],"bindings":[{"id":"binding","version":"1"}]})).unwrap(),&registry).unwrap();
    assert!(matches!(
        RunSupervisor::new(store.clone())
            .execute(
                &compiled,
                RunInput::new("task"),
                RunContext::new("thread", "root")
            )
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(calls.load(Ordering::SeqCst), 1);
    let children = store.children("root").await.unwrap();
    assert_eq!(children.len(), 1);
    assert_eq!(children[0].status, "completed");
    assert!(!store.events("root", 0, 100).await.unwrap().is_empty());
}

struct FailAfterClear;
impl ContextBinding for FailAfterClear {
    fn bind(&self, context: &mut RunContext) -> Result<(), Error> {
        context.capabilities = Default::default();
        context.run_id = "wrong".into();
        Err(Error::Composition("binding failed".into()))
    }
}
#[tokio::test]
async fn failing_binding_still_reports_failure_to_original_owner_and_authoritative_sink() {
    let calls = Arc::new(AtomicUsize::new(0));
    let sink = Arc::new(Sink::default());
    let mut context = RunContext::new("thread", "root");
    context.capabilities.insert(EventSinkBinding(sink.clone()));
    assert!(
        build(calls.clone())
            .with_binding("fail-1", Arc::new(FailAfterClear))
            .invoke(RunInput::new("task"), context)
            .await
            .is_err()
    );
    assert_eq!(calls.load(Ordering::SeqCst), 0);
    let events = sink.0.lock().unwrap();
    assert!(events.iter().any(|(run, event)| run == "root"
        && matches!(
            event,
            RunEvent::Terminated {
                status: RunStatus::Failed,
                ..
            }
        )));
    assert!(events.iter().all(|(run, _)| run == "root"));
}
