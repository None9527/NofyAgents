#![cfg(feature = "agent-runtime")]
use futures::StreamExt;
use nofy_agent_runtime::{Error, RunContext, RunState, ToolCatalog, registry::*};
use nofy_memory::{
    runtime::declarative::*,
    service::{NofyMemoryService, NofyMemoryServiceConfig},
};
use nofy_tool_runtime::{ToolCallContext, ToolId, ToolStreamItem};
use serde_json::{Value, json};
use std::{
    collections::BTreeMap,
    sync::{
        Arc,
        atomic::{AtomicUsize, Ordering},
    },
    time::Duration,
};

struct Provider {
    root: std::path::PathBuf,
    opened: AtomicUsize,
    gate: Option<Arc<tokio::sync::Semaphore>>,
}
#[async_trait::async_trait]
impl MemoryProvider for Provider {
    fn identity(&self) -> &str {
        "real-test-storage/v1"
    }
    fn schema(&self) -> Value {
        json!({"type":"object","additionalProperties":false})
    }
    fn validate(&self, _: &Value) -> Result<String, Error> {
        Ok("same-logical-memory".into())
    }
    async fn open(&self, _: &Value, _: &RunContext) -> Result<Arc<NofyMemoryService>, Error> {
        self.opened.fetch_add(1, Ordering::SeqCst);
        if let Some(gate) = &self.gate {
            gate.acquire().await.unwrap().forget();
        }
        NofyMemoryService::new(NofyMemoryServiceConfig {
            root: self.root.join("memory"),
            workspace: self.root.join("workspace"),
            project_id: nofy_memory::model::ProjectId::from_repository_fingerprint(
                "declarative-test-project",
            )
            .unwrap(),
            ..NofyMemoryServiceConfig::default_for_tests()
        })
        .map(Arc::new)
        .map_err(|_| Error::Tool("real test storage cannot open".into()))
    }
}
fn source() -> Value {
    json!({"backend":{},"grants":{"read":["project"],"write":["project"],"child_read":["project"]}})
}
fn resource(factory: &MemoryResourceFactory) -> ModuleInstance {
    factory.build(&source(), &BTreeMap::new()).unwrap()
}
fn tools(resource: ModuleInstance) -> ToolCatalog {
    let ModuleInstance::ToolPack(tools) = ConnectedMemoryFactory::tools().build(
        &json!({"write":["project"],"operations":["remember","list","get","snapshot","forget","revise","undo"]}),
        &BTreeMap::from([("connection".into(),resource)]),
    ).unwrap() else { panic!("tool pack") };
    tools
}
async fn call(tools: &ToolCatalog, operation: Value, context: RunContext) -> Result<Value, String> {
    let mut ctx = ToolCallContext::default();
    ctx.insert(context);
    let mut stream = tools
        .get("memory")
        .unwrap()
        .dispatch
        .call(ToolId::new("memory").unwrap(), operation, ctx)
        .await;
    let Some(ToolStreamItem::Terminal(result)) = stream.next().await else {
        panic!("terminal output")
    };
    assert!(stream.next().await.is_none());
    result
        .map(|value| value.value)
        .map_err(|error| error.to_string())
}
fn list() -> Value {
    json!({"operation":"list","request":{"area":"project"}})
}

struct LeasedProvider {
    inner: Provider,
    leases: Arc<AtomicUsize>,
    admissions: AtomicUsize,
}
struct UseGuard(Arc<AtomicUsize>);
impl Drop for UseGuard {
    fn drop(&mut self) {
        self.0.fetch_sub(1, Ordering::SeqCst);
    }
}
#[async_trait::async_trait]
impl MemoryProvider for LeasedProvider {
    fn identity(&self) -> &str {
        self.inner.identity()
    }
    fn schema(&self) -> Value {
        self.inner.schema()
    }
    fn validate(&self, value: &Value) -> Result<String, Error> {
        self.inner.validate(value)
    }
    async fn acquire(
        &self,
        _: &Value,
        _: &RunContext,
    ) -> Result<Option<Box<dyn Send + Sync>>, Error> {
        self.leases.fetch_add(1, Ordering::SeqCst);
        self.admissions.fetch_add(1, Ordering::SeqCst);
        Ok(Some(Box::new(UseGuard(self.leases.clone()))))
    }
    async fn open(
        &self,
        value: &Value,
        context: &RunContext,
    ) -> Result<Arc<NofyMemoryService>, Error> {
        self.inner.open(value, context).await
    }
}
#[tokio::test]
async fn actual_worker_owns_use_guard_after_caller_abort_and_cached_calls_reacquire() {
    let dir = tempfile::tempdir().unwrap();
    let gate = Arc::new(tokio::sync::Semaphore::new(0));
    let leases = Arc::new(AtomicUsize::new(0));
    let provider = Arc::new(LeasedProvider {
        inner: Provider {
            root: dir.path().to_owned(),
            opened: AtomicUsize::new(0),
            gate: Some(gate.clone()),
        },
        leases: leases.clone(),
        admissions: AtomicUsize::new(0),
    });
    let factory = MemoryResourceFactory::new(provider.clone()).unwrap();
    let catalog = Arc::new(tools(resource(&factory)));
    let active = catalog.clone();
    let caller =
        tokio::spawn(async move { call(&active, list(), RunContext::new("t", "active")).await });
    tokio::time::timeout(Duration::from_secs(3), async {
        while provider.inner.opened.load(Ordering::SeqCst) == 0 {
            tokio::task::yield_now().await;
        }
    })
    .await
    .unwrap();
    caller.abort();
    assert!(caller.await.unwrap_err().is_cancelled());
    assert_eq!(leases.load(Ordering::SeqCst), 1);
    assert_eq!(factory.status().in_flight, 1);
    gate.add_permits(1);
    factory.drain().await.unwrap();
    assert_eq!(leases.load(Ordering::SeqCst), 0);
    call(&catalog, list(), RunContext::new("t", "cached"))
        .await
        .unwrap();
    assert_eq!(provider.inner.opened.load(Ordering::SeqCst), 1);
    assert_eq!(provider.admissions.load(Ordering::SeqCst), 2);
    assert_eq!(leases.load(Ordering::SeqCst), 0);
}

#[tokio::test]
async fn versioned_provider_factories_share_real_work_counters_and_shutdown() {
    let dir = tempfile::tempdir().unwrap();
    let provider = Arc::new(Provider {
        root: dir.path().to_owned(),
        opened: AtomicUsize::new(0),
        gate: None,
    });
    let factory = MemoryResourceFactory::new(provider.clone()).unwrap();
    let sibling = factory
        .with_provider("resource.memory_versioned", provider)
        .unwrap();
    assert_eq!(factory.descriptor().factory, "resource.memory");
    assert_eq!(sibling.descriptor().factory, "resource.memory_versioned");
    let catalog = tools(resource(&sibling));
    call(&catalog, list(), RunContext::new("t", "shared"))
        .await
        .unwrap();
    assert_eq!(factory.status().opened, 1);
    assert_eq!(factory.status().started, 1);
    assert_eq!(sibling.status().opened, 1);
    assert_eq!(sibling.status().slots, 4);
    factory.shutdown();
    assert!(sibling.status().stopping);
    assert!(
        call(&catalog, list(), RunContext::new("t", "stopped"))
            .await
            .is_err()
    );
    sibling.drain().await.unwrap();
}

#[tokio::test]
async fn factories_are_pure_portable_and_real_operations_context_and_child_grants_are_preserved() {
    let dir = tempfile::tempdir().unwrap();
    let provider = Arc::new(Provider {
        root: dir.path().to_owned(),
        opened: AtomicUsize::new(0),
        gate: None,
    });
    let factory = MemoryResourceFactory::new(provider.clone()).unwrap();
    let resource = resource(&factory);
    let other_dir = tempfile::tempdir().unwrap();
    let other = MemoryResourceFactory::new(Arc::new(Provider {
        root: other_dir.path().to_owned(),
        opened: AtomicUsize::new(0),
        gate: None,
    }))
    .unwrap();
    let ModuleInstance::Resource(one) = &resource else {
        panic!("resource")
    };
    let ModuleInstance::Resource(two) = self::resource(&other) else {
        panic!("resource")
    };
    assert_eq!(one.identity(), two.identity());
    let dependencies = BTreeMap::from([("connection".into(), resource.clone())]);
    assert!(
        ConnectedMemoryFactory::tools()
            .build(&json!({"read":["personal"]}), &dependencies)
            .is_err()
    );
    assert!(
        ConnectedMemoryFactory::tools()
            .build(&json!({"resource":"manual-map"}), &dependencies)
            .is_err()
    );
    assert!(
        ConnectedMemoryFactory::tools()
            .build(&json!({"capture":true}), &dependencies)
            .is_err()
    );
    assert!(
        factory
            .build(
                &json!({"backend":{},"grants":{"capture":true}}),
                &BTreeMap::new()
            )
            .is_err()
    );
    let ModuleInstance::ContextSource(context) = ConnectedMemoryFactory::context()
        .build(&json!({}), &dependencies)
        .unwrap()
    else {
        panic!("context")
    };
    let tools = tools(resource);
    assert_eq!(provider.opened.load(Ordering::SeqCst), 0);
    assert!(!dir.path().join("memory").exists());
    let created = call(&tools,json!({"operation":"remember","request":{"area":"project","statement":"deployment uses a blue release channel","confirm_sensitive":false}}),RunContext::new("t","r")).await.unwrap();
    assert!(
        call(&tools, list(), RunContext::new("t", "r"))
            .await
            .unwrap()
            .to_string()
            .contains("blue release")
    );
    assert_eq!(provider.opened.load(Ordering::SeqCst), 1);
    let mut state = RunState::default();
    state.messages.push(nofy_agent_runtime::Message::User {
        content: "deployment".into(),
    });
    assert!(
        context
            .revision(&RunContext::new("t", "r"))
            .await
            .unwrap()
            .is_some()
    );
    assert!(
        context
            .contribute(&state, &RunContext::new("t", "r"))
            .await
            .unwrap()
            .iter()
            .any(|message| serde_json::to_string(message)
                .unwrap()
                .contains("blue release"))
    );
    let mut child = RunContext::new("t", "child");
    child
        .capabilities
        .insert(nofy_agent_runtime::events::RunLineage {
            root_run_id: "r".into(),
            parent_run_id: Some("r".into()),
            node_id: None,
        });
    assert!(
        call(
            &tools,
            json!({"operation":"forget","request":{"target":created["target"],"confirmed":true}}),
            child
        )
        .await
        .is_err()
    );
    factory.shutdown();
    factory.drain().await.unwrap();
    assert_eq!(factory.status().in_flight, 0);
    assert!(
        call(&tools, list(), RunContext::new("t", "new"))
            .await
            .is_err()
    );
    let reopened = MemoryResourceFactory::new(Arc::new(Provider {
        root: dir.path().to_owned(),
        opened: AtomicUsize::new(0),
        gate: None,
    }))
    .unwrap();
    assert!(
        call(
            &self::tools(self::resource(&reopened)),
            list(),
            RunContext::new("t", "reopen")
        )
        .await
        .unwrap()
        .to_string()
        .contains("blue release")
    );
}

#[tokio::test]
async fn actual_work_keeps_four_permits_after_callers_drop_and_shutdown_drains_without_new_opens() {
    let dir = tempfile::tempdir().unwrap();
    let gate = Arc::new(tokio::sync::Semaphore::new(0));
    let provider = Arc::new(Provider {
        root: dir.path().to_owned(),
        opened: AtomicUsize::new(0),
        gate: Some(gate.clone()),
    });
    let factory = MemoryResourceFactory::new(provider.clone()).unwrap();
    let catalog = tools(resource(&factory));
    let mut callers = Vec::new();
    for i in 0..4 {
        let tools = catalog.clone();
        callers.push(tokio::spawn(async move {
            call(&tools, list(), RunContext::new("t", format!("r{i}"))).await
        }));
    }
    tokio::time::timeout(Duration::from_secs(5), async {
        while factory.status().in_flight != 4 || provider.opened.load(Ordering::SeqCst) != 1 {
            tokio::task::yield_now().await;
        }
    })
    .await
    .unwrap();
    for caller in callers {
        caller.abort();
        let _ = caller.await;
    }
    assert_eq!(factory.status().in_flight, 4);
    let queued = RunContext::new("t", "queued");
    let cancel = queued.cancel.clone();
    let tools = catalog.clone();
    let mut pending = tokio::spawn(async move { call(&tools, list(), queued).await });
    assert!(
        tokio::time::timeout(Duration::from_millis(30), &mut pending)
            .await
            .is_err()
    );
    cancel.cancel();
    assert!(pending.await.unwrap().is_err());
    assert_eq!(factory.status().started, 4);
    assert_eq!(provider.opened.load(Ordering::SeqCst), 1);
    factory.shutdown();
    let draining = factory.clone();
    let mut drain = tokio::spawn(async move { draining.drain().await });
    assert!(
        tokio::time::timeout(Duration::from_millis(30), &mut drain)
            .await
            .is_err()
    );
    gate.add_permits(1);
    tokio::time::timeout(Duration::from_secs(10), &mut drain)
        .await
        .unwrap()
        .unwrap()
        .unwrap();
    assert_eq!(factory.status().in_flight, 0);
    assert_eq!(factory.status().opened, 1);
    assert!(
        call(&catalog, list(), RunContext::new("t", "closed"))
            .await
            .is_err()
    );
}
