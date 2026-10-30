#![cfg(feature = "sqlite")]
use nofy_agent_runtime::compile::{AgentDocument, CompiledAgent, compile_document};
use nofy_agent_runtime::durable::{Clock, SqliteStore};
use nofy_agent_runtime::registry::*;
use nofy_agent_runtime::supervisor::{ChildReconciliation, DurableApprovalPolicy, RunSupervisor};
use nofy_agent_runtime::*;
use nofy_tool_runtime::{Tool, ToolCallContext};
use nofy_tool_types::ToolDescription;
use serde_json::{Value, json};
use std::{
    path::{Path, PathBuf},
    sync::{
        Arc,
        atomic::{AtomicU64, Ordering},
    },
    time::Duration,
};

struct ManualClock(AtomicU64);
impl Clock for ManualClock {
    fn now_ms(&self) -> u64 {
        self.0.load(Ordering::SeqCst)
    }
}
fn checkpoint(revision: u64) -> Checkpoint {
    Checkpoint {
        version: 1,
        revision,
        composition: "test".into(),
        state: RunState::default(),
    }
}

#[tokio::test]
async fn sqlite_cas_is_atomic_across_connections_and_survives_reopen() {
    let root = tempfile::tempdir().unwrap();
    let path = root.path().join("runtime.db");
    let a = SqliteStore::open(&path).unwrap();
    let b = SqliteStore::open(&path).unwrap();
    let (x, y) = tokio::join!(
        a.save("thread", None, checkpoint(1)),
        b.save("thread", None, checkpoint(1))
    );
    assert_ne!(x.is_ok(), y.is_ok());
    assert!(b.save("thread", Some(1), checkpoint(3)).await.is_err());
    b.save("thread", Some(1), checkpoint(2)).await.unwrap();
    drop(a);
    drop(b);
    assert_eq!(
        SqliteStore::open(&path)
            .unwrap()
            .load("thread")
            .await
            .unwrap()
            .unwrap()
            .revision,
        2
    );
}

#[tokio::test]
async fn expired_and_replaced_workers_cannot_write_or_release_the_new_lease() {
    let root = tempfile::tempdir().unwrap();
    let path = root.path().join("runtime.db");
    let clock = Arc::new(ManualClock(AtomicU64::new(1000)));
    let a = SqliteStore::open_with_clock(&path, clock.clone()).unwrap();
    let b = SqliteStore::open_with_clock(&path, clock.clone()).unwrap();
    let first = a
        .acquire("run", "worker-a", Duration::from_millis(100))
        .await
        .unwrap();
    let old = a.guarded(&first);
    assert!(
        b.acquire("run", "worker-b", Duration::from_millis(100))
            .await
            .is_err()
    );
    old.save("thread", None, checkpoint(1)).await.unwrap();
    clock.0.store(1200, Ordering::SeqCst);
    assert!(old.save("thread", Some(1), checkpoint(2)).await.is_err());
    let next = b
        .acquire("run", "worker-b", Duration::from_millis(100))
        .await
        .unwrap();
    assert!(next.fence() > first.fence());
    assert!(old.load("thread").await.is_err());
    assert!(a.renew(&first, Duration::from_millis(100)).await.is_err());
    assert!(a.release(&first).await.is_err());
    b.guarded(&next)
        .save("thread", Some(1), checkpoint(2))
        .await
        .unwrap();
    assert_eq!(b.load("thread").await.unwrap().unwrap().revision, 2);
}

fn append(path: &Path, text: &str) {
    use std::io::Write;
    writeln!(
        std::fs::OpenOptions::new()
            .create(true)
            .append(true)
            .open(path)
            .unwrap(),
        "{text}"
    )
    .unwrap();
}
struct Effect(PathBuf);
impl Tool for Effect {
    type Args = Value;
    type Output = Value;
    fn id(&self) -> nofy_tool_protocol::ToolId {
        nofy_tool_protocol::ToolId::new("effect").unwrap()
    }
    fn description(&self, _: &nofy_tool_runtime::ListToolsContext) -> ToolDescription {
        let mut d = ToolDescription::new("effect", "Persist one external effect");
        d.arguments_schema = Some(json!({"type":"object","additionalProperties":false}));
        d
    }
    async fn run(
        &self,
        _: ToolCallContext,
        _: Value,
    ) -> Result<Value, nofy_tool_runtime::ToolError> {
        if std::env::var("NOFY_CLOSURE_WORKER_MODE").as_deref() == Ok("crash") {
            std::process::exit(93);
        }
        append(&self.0, "effect");
        Ok(json!({"ok":true}))
    }
}
struct TestModel {
    tool: &'static str,
    log: PathBuf,
}
#[async_trait::async_trait]
impl Model for TestModel {
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        append(&self.log, self.tool);
        Ok(
            if let Some(Message::Tool { content, .. }) = request.messages.last() {
                ModelResponse {
                    output: content.to_string(),
                    ..Default::default()
                }
            } else {
                ModelResponse {
                    tool_calls: vec![ToolCall {
                        id: "call-1".into(),
                        name: self.tool.into(),
                        arguments: if self.tool == "child" {
                            json!({"prompt":"work"})
                        } else {
                            json!({})
                        },
                    }],
                    ..Default::default()
                }
            },
        )
    }
}

fn host(root: &Path, store: &SqliteStore, model_revision: &str) -> ModuleRegistry {
    host_with_effect(root, store, model_revision, None)
}
fn host_with_effect(
    root: &Path,
    store: &SqliteStore,
    model_revision: &str,
    effect: Option<ToolEntry>,
) -> ModuleRegistry {
    let mut c = Components::default();
    c.models.insert(
        "child".into(),
        Arc::new(TestModel {
            tool: "effect",
            log: root.join("models.txt"),
        }),
    );
    c.prompts
        .insert("prompt".into(), Arc::new(StaticPrompt("child".into())));
    c.policies.insert(
        "approval".into(),
        Arc::new(DurableApprovalPolicy::new(store.clone())),
    );
    let mut effects = ToolCatalog::new();
    effects
        .insert(effect.unwrap_or_else(|| ToolEntry::typed(Effect(root.join("effects.txt")))))
        .unwrap();
    c.tool_packs.insert("effects".into(), effects);
    let child = AgentBuilder::new("child")
        .model("child")
        .prompt("prompt")
        .tools("effects")
        .policy("approval")
        .compile(&c)
        .unwrap();
    let mut tools = ToolCatalog::new();
    tools
        .insert(child.as_tool("child", "Delegate child"))
        .unwrap();
    let mut registry = ModuleRegistry::default();
    registry
        .register_factory(Arc::new(StaticPromptFactory))
        .unwrap();
    registry
        .register_factory(Arc::new(InstanceFactory::new(
            "host.model",
            model_revision,
            ModuleInstance::Model(Arc::new(TestModel {
                tool: "child",
                log: root.join("models.txt"),
            })),
        )))
        .unwrap();
    registry
        .register_factory(Arc::new(InstanceFactory::new(
            "host.tools",
            "1",
            ModuleInstance::ToolPack(tools),
        )))
        .unwrap();
    registry
}
fn compile(host: &ModuleRegistry) -> CompiledAgent {
    let document:AgentDocument=serde_json::from_value(json!({"modules":[
        {"reference":{"id":"model","version":"1"},"factory":"host.model","config":{}},
        {"reference":{"id":"prompt","version":"1"},"factory":"prompt.static","config":{"text":"root"}},
        {"reference":{"id":"tools","version":"1"},"factory":"host.tools","config":{}}
    ],"agent":{"name":"parent","model":{"id":"model","version":"1"},"prompt":{"id":"prompt","version":"1"},"tool_packs":[{"id":"tools","version":"1"}]}})).unwrap();
    compile_document(document, host).unwrap()
}
fn context() -> RunContext {
    RunContext::new("thread", "run")
}

/// Also invoked as an independent OS process by the tests below.
#[test]
fn process_worker() {
    let Ok(directory) = std::env::var("NOFY_CLOSURE_WORKER_ROOT") else {
        return;
    };
    let root = Path::new(&directory);
    let mode = std::env::var("NOFY_CLOSURE_WORKER_MODE").unwrap();
    tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
        .unwrap()
        .block_on(async {
            let store = SqliteStore::open(&root.join("runtime.db")).unwrap();
            let registry = host(root, &store, "1");
            let compiled = if mode == "pause" {
                compile(&registry)
            } else {
                store
                    .record("run")
                    .await
                    .unwrap()
                    .unwrap()
                    .snapshot
                    .restore(&registry)
                    .unwrap()
            };
            let input = if mode == "pause" {
                RunInput::new("query")
            } else {
                RunInput::resume()
            };
            let supervisor = RunSupervisor::new(store)
                .with_lease_ttl(Duration::from_secs(2))
                .unwrap();
            let result = supervisor
                .execute(&compiled, input, context())
                .await
                .unwrap();
            match mode.as_str() {
                "pause" | "uncertain" => assert!(matches!(result, RunOutcome::Paused { .. })),
                "resume" => assert!(matches!(result, RunOutcome::Completed { .. })),
                "crash" => panic!("the effect handler must exit before returning"),
                _ => panic!("unknown worker mode"),
            }
        });
}
fn worker(root: &Path, mode: &str) -> std::process::Output {
    std::process::Command::new(std::env::current_exe().unwrap())
        .args(["--exact", "process_worker", "--nocapture"])
        .env("NOFY_CLOSURE_WORKER_ROOT", root)
        .env("NOFY_CLOSURE_WORKER_MODE", mode)
        .output()
        .unwrap()
}
fn assert_worker(root: &Path, mode: &str) {
    let result = worker(root, mode);
    assert!(
        result.status.success(),
        "{}\n{}",
        String::from_utf8_lossy(&result.stdout),
        String::from_utf8_lossy(&result.stderr)
    );
}

#[tokio::test]
async fn parent_child_approval_and_snapshots_survive_independent_process_restarts() {
    let root = tempfile::tempdir().unwrap();
    assert_worker(root.path(), "pause");
    let store = SqliteStore::open(&root.path().join("runtime.db")).unwrap();
    assert_eq!(store.record("run").await.unwrap().unwrap().status, "paused");
    assert_eq!(store.children("run").await.unwrap()[0].status, "paused");
    let pending = store.pending_approvals("run").await.unwrap();
    assert_eq!(pending.len(), 1);
    let mut wrong = pending[0].clone();
    wrong.call.arguments = json!({"changed":true});
    assert!(store.decide(&wrong, true).await.is_err());
    store.decide(&pending[0], true).await.unwrap();
    store.decide(&pending[0], true).await.unwrap();
    assert!(store.decide(&pending[0], false).await.is_err());
    let snapshot = store.record("run").await.unwrap().unwrap().snapshot;
    assert!(
        snapshot
            .restore(&host(root.path(), &store, "changed-implementation"))
            .is_err()
    );
    assert_worker(root.path(), "resume");
    assert_worker(root.path(), "resume");
    assert_eq!(
        std::fs::read_to_string(root.path().join("effects.txt"))
            .unwrap()
            .lines()
            .count(),
        1
    );
    assert_eq!(
        std::fs::read_to_string(root.path().join("models.txt"))
            .unwrap()
            .lines()
            .count(),
        4
    );
    assert_eq!(store.children("run").await.unwrap()[0].status, "completed");
    // Starting a later turn fences off resuming the older run ID.
    let compiled = compile(&host(root.path(), &store, "1"));
    let next = RunContext::new("thread", "next-run");
    RunSupervisor::new(store.clone())
        .execute(&compiled, RunInput::new("next"), next)
        .await
        .unwrap();
    assert!(
        RunSupervisor::new(store)
            .execute(&compiled, RunInput::resume(), context())
            .await
            .is_err()
    );
}

#[tokio::test]
async fn crash_with_durable_intent_pauses_until_explicit_child_reconciliation() {
    let root = tempfile::tempdir().unwrap();
    assert_worker(root.path(), "pause");
    let store = SqliteStore::open(&root.path().join("runtime.db")).unwrap();
    let approval = store.pending_approvals("run").await.unwrap().pop().unwrap();
    store.decide(&approval, true).await.unwrap();
    assert_eq!(worker(root.path(), "crash").status.code(), Some(93));
    tokio::time::sleep(Duration::from_millis(2100)).await;
    assert_worker(root.path(), "uncertain");
    assert!(!root.path().join("effects.txt").exists());
    let compiled = store
        .record("run")
        .await
        .unwrap()
        .unwrap()
        .snapshot
        .restore(&host(root.path(), &store, "1"))
        .unwrap();
    let child = store.children("run").await.unwrap().pop().unwrap();
    let receipt = ChildReconciliation {
        child_run_id: child.run_id,
        model_sequence: None,
        call: approval.call,
        result: json!({"error":"operator confirmed crash before external write"}),
        is_error: true,
    };
    let mut foreign = receipt.clone();
    foreign.child_run_id = "another-run".into();
    let supervisor = RunSupervisor::new(store.clone());
    assert!(
        supervisor
            .reconcile_child(&compiled, &context(), foreign)
            .await
            .is_err()
    );
    supervisor
        .reconcile_child(&compiled, &context(), receipt)
        .await
        .unwrap();
    assert_worker(root.path(), "resume");
    assert!(!root.path().join("effects.txt").exists());
}

#[tokio::test]
async fn child_reconciliation_settles_the_primitive_budget_before_the_child_continues() {
    use nofy_agent_runtime::governance::*;
    use std::sync::atomic::AtomicUsize;
    struct PendingEffect {
        started: Arc<tokio::sync::Notify>,
        calls: Arc<AtomicUsize>,
    }
    impl Tool for PendingEffect {
        type Args = Value;
        type Output = Value;
        fn id(&self) -> nofy_tool_protocol::ToolId {
            nofy_tool_protocol::ToolId::new("effect").unwrap()
        }
        fn description(&self, _: &nofy_tool_runtime::ListToolsContext) -> ToolDescription {
            let mut d = ToolDescription::new("effect", "unknown effect");
            d.arguments_schema = Some(json!({"type":"object","additionalProperties":false}));
            d
        }
        async fn run(
            &self,
            _: ToolCallContext,
            _: Value,
        ) -> Result<Value, nofy_tool_runtime::ToolError> {
            self.calls.fetch_add(1, Ordering::SeqCst);
            self.started.notify_one();
            std::future::pending().await
        }
    }
    let root = tempfile::tempdir().unwrap();
    let clock = Arc::new(ManualClock(AtomicU64::new(1000)));
    let store =
        SqliteStore::open_with_clock(&root.path().join("runtime.db"), clock.clone()).unwrap();
    let started = Arc::new(tokio::sync::Notify::new());
    let calls = Arc::new(AtomicUsize::new(0));
    let registry = host_with_effect(
        root.path(),
        &store,
        "1",
        Some(ToolEntry::typed(PendingEffect {
            started: started.clone(),
            calls: calls.clone(),
        })),
    );
    let mut compiled = compile(&registry);
    let profile = Arc::new(
        GovernanceProfile::new(
            Arc::new(
                InstalledBudget::install(
                    Arc::new(store.clone()),
                    BudgetLimits {
                        max_concurrent_operations: Some(1),
                        max_model_calls: Some(8),
                        ..Default::default()
                    },
                    "child-reconcile@1",
                    1,
                )
                .unwrap(),
            ),
            BudgetLimits::default(),
            ModelRetryPolicy::default(),
        )
        .unwrap(),
    );
    let scope = BudgetScope {
        root_run_id: "run".into(),
        identity: profile.identity().into(),
    };
    compiled.agent = compiled.agent.with_governance(profile);
    let compiled = Arc::new(compiled);
    let supervisor = RunSupervisor::new(store.clone())
        .with_lease_ttl(Duration::from_millis(100))
        .unwrap();
    assert!(matches!(
        supervisor
            .execute(&compiled, RunInput::new("query"), context())
            .await
            .unwrap(),
        RunOutcome::Paused { .. }
    ));
    let approval = store.pending_approvals("run").await.unwrap().pop().unwrap();
    store.decide(&approval, true).await.unwrap();
    let worker = {
        let store = store.clone();
        let compiled = compiled.clone();
        tokio::spawn(async move {
            RunSupervisor::new(store)
                .with_lease_ttl(Duration::from_millis(100))
                .unwrap()
                .execute(&compiled, RunInput::resume(), context())
                .await
        })
    };
    tokio::time::timeout(Duration::from_secs(3), started.notified())
        .await
        .unwrap();
    worker.abort();
    let _ = worker.await;
    clock.0.store(3000, Ordering::SeqCst);
    assert_eq!(
        store
            .inspect(&scope)
            .await
            .unwrap()
            .unwrap()
            .active_operations,
        1
    );
    let child = store.children("run").await.unwrap().pop().unwrap();
    let checkpoint_key = format!(
        "{}:{}{}",
        child.agent_name.len(),
        child.agent_name,
        child.thread_id
    );
    let before = store.load(&checkpoint_key).await.unwrap().unwrap();
    let receipt = ChildReconciliation {
        child_run_id: child.run_id,
        model_sequence: Some(before.state.model_sequence),
        call: approval.call,
        result: json!({"verified":true}),
        is_error: false,
    };
    supervisor
        .reconcile_child(&compiled, &context(), receipt.clone())
        .await
        .unwrap();
    supervisor
        .reconcile_child(&compiled, &context(), receipt.clone())
        .await
        .unwrap();
    let after = store.load(&checkpoint_key).await.unwrap().unwrap();
    assert_eq!(
        serde_json::to_value(before).unwrap(),
        serde_json::to_value(after).unwrap()
    );
    assert_eq!(
        store
            .inspect(&scope)
            .await
            .unwrap()
            .unwrap()
            .active_operations,
        1
    );
    let mut conflict = receipt.clone();
    conflict.result = json!({"different":true});
    assert!(
        supervisor
            .reconcile_child(&compiled, &context(), conflict)
            .await
            .is_err()
    );
    let mut foreign_epoch = receipt.clone();
    foreign_epoch.model_sequence = Some(99);
    assert!(
        supervisor
            .reconcile_child(&compiled, &context(), foreign_epoch)
            .await
            .is_err()
    );
    let result = supervisor
        .execute(&compiled, RunInput::resume(), context())
        .await
        .unwrap();
    assert!(matches!(result, RunOutcome::Completed { .. }), "{result:?}");
    let summary = store.inspect(&scope).await.unwrap().unwrap();
    assert_eq!(summary.active_operations, 0);
    assert_eq!(summary.active_children, 0);
    assert_eq!(summary.used.tool_calls, 2);
    assert_eq!(calls.load(Ordering::SeqCst), 1);
    supervisor
        .reconcile_child(&compiled, &context(), receipt)
        .await
        .unwrap();
}
