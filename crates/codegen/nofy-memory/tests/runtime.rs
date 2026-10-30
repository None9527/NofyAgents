#![cfg(feature = "agent-runtime")]
use nofy_agent_runtime::{hooks::*, memory::ContextSource, registry::*, *};
use nofy_memory::{
    runtime::*,
    service::{NofyMemoryService, NofyMemoryServiceConfig},
};
use nofy_tools::types::memory_service::*;
use serde_json::json;
use std::{
    collections::BTreeMap,
    sync::{
        Arc, Mutex,
        atomic::{AtomicBool, Ordering},
    },
};

fn service() -> (
    tempfile::TempDir,
    NofyMemoryServiceConfig,
    Arc<NofyMemoryService>,
) {
    let dir = tempfile::tempdir().unwrap();
    let config = NofyMemoryServiceConfig {
        root: dir.path().join("memory"),
        workspace: dir.path().join("workspace"),
        ..NofyMemoryServiceConfig::default_for_tests()
    };
    let service = Arc::new(NofyMemoryService::new(config.clone()).unwrap());
    (dir, config, service)
}
fn module(service: Arc<NofyMemoryService>, mut config: MemoryModuleConfig) -> MemoryModule {
    config.resource = "canonical".into();
    MemoryModule::bind(
        Arc::new(
            InstalledMemory::install(
                service,
                "v1",
                MemoryGrants {
                    read: vec![MemoryArea::Personal, MemoryArea::Project],
                    write: vec![MemoryArea::Personal, MemoryArea::Project],
                    child_read: vec![MemoryArea::Project],
                    capture: true,
                    consolidate: true,
                    ..Default::default()
                },
                Default::default(),
            )
            .unwrap(),
        ),
        config,
    )
    .unwrap()
}
fn full_config() -> MemoryModuleConfig {
    MemoryModuleConfig {
        read: vec![MemoryArea::Personal, MemoryArea::Project],
        write: vec![MemoryArea::Personal, MemoryArea::Project],
        capture: true,
        consolidate: true,
        operations: [
            "search",
            "list",
            "get",
            "explain",
            "remember",
            "revise",
            "forget",
            "undo",
            "snapshot",
            "capture",
            "consolidate",
        ]
        .map(str::to_owned)
        .to_vec(),
        ..Default::default()
    }
}
fn remember(area: MemoryArea, statement: &str) -> RememberRequest {
    RememberRequest {
        area,
        statement: statement.into(),
        title: None,
        confirm_sensitive: false,
    }
}
#[tokio::test]
async fn full_operations_use_canonical_store_and_forget_survives_reopen() {
    let (_dir, config, service) = service();
    let module = module(service, full_config());
    let ctx = RunContext::new("thread", "run");
    let created: RememberReceipt = serde_json::from_value(
        module
            .execute(
                MemoryOperation::Remember(remember(
                    MemoryArea::Project,
                    "deployment uses blue release channel",
                )),
                &ctx,
            )
            .await
            .unwrap(),
    )
    .unwrap();
    for operation in [
        MemoryOperation::Get(created.target.clone()),
        MemoryOperation::Explain(created.target.clone()),
        MemoryOperation::Search(SearchRequest {
            query: "deployment".into(),
            max_results: 10,
            min_score: 0.0,
        }),
        MemoryOperation::List(ListMemoryRequest { area: None }),
        MemoryOperation::Snapshot(SnapshotRequest {
            query: None,
            max_items: 10,
        }),
    ] {
        assert!(
            module
                .execute(operation, &ctx)
                .await
                .unwrap()
                .to_string()
                .contains("deployment")
        );
    }
    let revised: TopicRevision = serde_json::from_value(
        module
            .execute(
                MemoryOperation::Revise(ReviseTopicRequest {
                    target: created.target.clone(),
                    replacement: "deployment uses green release channel".into(),
                }),
                &ctx,
            )
            .await
            .unwrap(),
    )
    .unwrap();
    module
        .execute(MemoryOperation::Undo(revised.undo_token), &ctx)
        .await
        .unwrap();
    let current: MemoryList = serde_json::from_value(
        module
            .execute(
                MemoryOperation::List(ListMemoryRequest {
                    area: Some(MemoryArea::Project),
                }),
                &ctx,
            )
            .await
            .unwrap(),
    )
    .unwrap();
    assert!(current.items[0].summary.contains("blue"));
    let target = current.items[0].target.clone();
    assert!(
        module
            .execute(
                MemoryOperation::Forget(ForgetRequest {
                    target: target.clone(),
                    confirmed: false
                }),
                &ctx
            )
            .await
            .is_err()
    );
    module
        .execute(
            MemoryOperation::Forget(ForgetRequest {
                target,
                confirmed: true,
            }),
            &ctx,
        )
        .await
        .unwrap();
    module
        .execute(
            MemoryOperation::Consolidate(ConsolidateRequest {
                area: MemoryArea::Project,
                mode: ConsolidationMode::Active,
            }),
            &ctx,
        )
        .await
        .unwrap();
    let reopened = NofyMemoryService::new(config).unwrap();
    assert!(
        reopened
            .list(ListMemoryRequest { area: None })
            .await
            .unwrap()
            .items
            .is_empty()
    );
    assert!(
        !reopened
            .snapshot(SnapshotRequest {
                query: None,
                max_items: 10
            })
            .await
            .unwrap()
            .content
            .contains("deployment")
    );
    assert!(
        module
            .execute(
                MemoryOperation::Capture(CaptureRequest {
                    durable_turn_id: "forged".into()
                }),
                &ctx
            )
            .await
            .is_err()
    );
}

#[tokio::test]
async fn legacy_string_capture_does_not_report_a_queue_write_without_a_barrier() {
    let (_dir, _, service) = service();
    assert!(matches!(
        service
            .capture(CaptureRequest {
                durable_turn_id: "unproven".into()
            })
            .await,
        Err(MemoryServiceError::Unavailable(_))
    ));
}

struct LongModel;
#[async_trait::async_trait]
impl Model for LongModel {
    async fn complete(&self, _: ModelRequest, _: &RunContext) -> Result<ModelResponse, Error> {
        Ok(ModelResponse {
            output: "visible answer ".repeat(1000),
            ..Default::default()
        })
    }
}
struct SummaryModel(Arc<Mutex<Vec<ModelRequest>>>);
#[async_trait::async_trait]
impl Model for SummaryModel {
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        self.0.lock().unwrap().push(request);
        Ok(ModelResponse {
            output: "summary historical context ".repeat(40),
            ..Default::default()
        })
    }
}
struct ReceiptSpy(Arc<Mutex<Vec<Vec<Message>>>>);
#[async_trait::async_trait]
impl HookHandler for ReceiptSpy {
    async fn handle(&self, _: &HookEvent, ctx: &RunContext) -> Result<HookDecision, Error> {
        let receipt = ctx
            .capabilities
            .get::<nofy_agent_runtime::memory::DurableTurnReceipt>()
            .unwrap();
        self.0.lock().unwrap().push(receipt.messages().to_vec());
        Ok(HookDecision::Continue)
    }
}
#[tokio::test]
async fn real_compaction_refreshes_forgotten_memory_and_capture_excludes_summary() {
    use nofy_compaction::runtime::{BytesTokenCounter, CompactionPolicy, ContextConfig};
    let (dir, _, service) = service();
    let fact = service
        .remember(remember(
            MemoryArea::Project,
            "release extinct durable fact",
        ))
        .await
        .unwrap();
    let memory = Arc::new(module(service.clone(), MemoryModuleConfig::default()));
    let summaries = Arc::new(Mutex::new(Vec::new()));
    let receipts = Arc::new(Mutex::new(Vec::new()));
    let mut components = Components::default();
    components
        .models
        .insert("model".into(), Arc::new(LongModel));
    components.prompts.insert(
        "prompt".into(),
        Arc::new(StaticPrompt("stable system".into())),
    );
    components.context_sources.insert("memory".into(), memory);
    let policy = CompactionPolicy::new(
        ContextConfig {
            context_window: 1000,
            min_compactable: 1,
            ..Default::default()
        },
        Arc::new(SummaryModel(summaries.clone())),
        Arc::new(BytesTokenCounter),
    )
    .unwrap();
    let agent = AgentBuilder::new("memory-compact")
        .model("model")
        .prompt("prompt")
        .context_source("memory")
        .compile(&components)
        .unwrap()
        .with_context_policy("compact@1", Arc::new(policy))
        .unwrap()
        .with_checkpointer(Arc::new(
            durable::SqliteStore::open(&dir.path().join("runs.sqlite")).unwrap(),
        ))
        .with_hooks(
            HookBus::new(
                EventCatalog::runtime(),
                vec![subscription(
                    "turn_done",
                    Arc::new(ReceiptSpy(receipts.clone())),
                )],
            )
            .unwrap(),
        );
    agent
        .invoke(
            RunInput::new("release first"),
            RunContext::new("thread", "first-run"),
        )
        .await
        .unwrap();
    service
        .forget(ForgetRequest {
            target: fact.target,
            confirmed: true,
        })
        .await
        .unwrap();
    let RunOutcome::Completed { state, .. } = agent
        .invoke(
            RunInput::new("release second"),
            RunContext::new("thread", "second-run"),
        )
        .await
        .unwrap()
    else {
        panic!("completed")
    };
    assert_eq!(summaries.lock().unwrap().len(), 1);
    assert!(
        !serde_json::to_string(&summaries.lock().unwrap()[0])
            .unwrap()
            .contains("extinct")
    );
    assert!(state.messages.iter().any(|message| {
        serde_json::to_string(message)
            .unwrap()
            .contains("summary historical")
    }));
    let receipts = receipts.lock().unwrap();
    assert_eq!(receipts.len(), 2);
    let captured = serde_json::to_string(&receipts[1]).unwrap();
    assert!(captured.contains("release second"));
    assert!(
        !captured.contains("release first")
            && !captured.contains("summary historical")
            && !captured.contains("extinct")
    );
}

#[tokio::test]
async fn child_scope_is_checked_per_call_and_before_search_limit() {
    let (_dir, _, service) = service();
    let personal = service
        .remember(remember(
            MemoryArea::Personal,
            "release private profile preference",
        ))
        .await
        .unwrap();
    service
        .remember(remember(MemoryArea::Project, "release project convention"))
        .await
        .unwrap();
    let mut config = full_config();
    config.child_read = vec![MemoryArea::Project];
    config.max_items = 1;
    let module = module(service.clone(), config);
    let mut ctx = RunContext::new("child", "child-run");
    ctx.capabilities.insert(events::RunLineage {
        root_run_id: "root".into(),
        parent_run_id: Some("parent".into()),
        node_id: None,
    });
    let result = module
        .execute(
            MemoryOperation::Search(SearchRequest {
                query: "release".into(),
                max_results: 1,
                min_score: 0.0,
            }),
            &ctx,
        )
        .await
        .unwrap();
    assert_eq!(result["hits"].as_array().unwrap().len(), 1);
    assert_eq!(result["hits"][0]["area"], "project");
    assert!(!result.to_string().contains("private"));
    for operation in [
        MemoryOperation::Get(personal.target.clone()),
        MemoryOperation::Explain(personal.target.clone()),
        MemoryOperation::Forget(ForgetRequest {
            target: personal.target,
            confirmed: true,
        }),
        MemoryOperation::Undo(personal.undo_token),
        MemoryOperation::Remember(remember(MemoryArea::Project, "unapproved write")),
    ] {
        assert!(module.execute(operation, &ctx).await.is_err());
    }
    let no_child = self::module(service, MemoryModuleConfig::default());
    assert!(
        no_child
            .contribute(&RunState::default(), &ctx)
            .await
            .unwrap()
            .is_empty()
    );
    let snapshot = module
        .execute(
            MemoryOperation::Snapshot(SnapshotRequest {
                query: None,
                max_items: 1,
            }),
            &ctx,
        )
        .await
        .unwrap();
    assert!(!snapshot.to_string().contains("private"));
}

#[test]
fn factories_are_pure_strict_and_cannot_expand_installed_grants() {
    let (_dir, _, service) = service();
    let resource = Arc::new(
        InstalledMemory::install(
            service,
            "r1",
            MemoryGrants::project_read_only(),
            Default::default(),
        )
        .unwrap(),
    );
    let resources = BTreeMap::from([("project".into(), resource)]);
    let mut registry = ModuleRegistry::default();
    for factory in [
        MemoryFactory::tools(resources.clone()),
        MemoryFactory::context(resources.clone()),
        MemoryFactory::capture(resources),
    ] {
        registry.register_factory(Arc::new(factory)).unwrap();
    }
    assert_eq!(registry.descriptors().len(), 3);
    let factory = MemoryFactory::tools(BTreeMap::new());
    assert!(
        factory
            .build(&json!({"resource":"uploaded_path"}), &BTreeMap::new())
            .is_err()
    );
    let mut config = MemoryModuleConfig::default();
    config.read.push(MemoryArea::Personal);
    let (_dir2, _, service2) = self::service();
    let resource = Arc::new(
        InstalledMemory::install(
            service2,
            "r1",
            MemoryGrants::project_read_only(),
            Default::default(),
        )
        .unwrap(),
    );
    assert!(MemoryModule::bind(resource, config).is_err());
}

struct RecordingModel(Arc<Mutex<Vec<ModelRequest>>>);
#[async_trait::async_trait]
impl Model for RecordingModel {
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        self.0.lock().unwrap().push(request);
        Ok(ModelResponse {
            output: "visible answer".into(),
            ..Default::default()
        })
    }
}
fn agent(
    source: Arc<MemoryModule>,
    store: Arc<dyn Checkpointer>,
    requests: Arc<Mutex<Vec<ModelRequest>>>,
) -> Agent {
    let mut components = Components::default();
    components
        .models
        .insert("model".into(), Arc::new(RecordingModel(requests)));
    components.prompts.insert(
        "prompt".into(),
        Arc::new(StaticPrompt("system secrets must not enter capture".into())),
    );
    components.context_sources.insert("memory".into(), source);
    AgentBuilder::new("memory-test")
        .model("model")
        .prompt("prompt")
        .context_source("memory")
        .compile(&components)
        .unwrap()
        .with_checkpointer(store)
}
fn subscription(name: &str, handler: Arc<dyn HookHandler>) -> Arc<HookRegistration> {
    Arc::new(
        HookRegistration::new(
            format!("{name}-v1"),
            EventCatalog::runtime().get(name).unwrap().clone(),
            HookRule {
                event: name.into(),
                priority: 0,
                timeout_ms: 5000,
                failure: FailurePolicy::Closed,
                matches: None,
            },
            handler,
        )
        .unwrap(),
    )
}
struct PauseOnce(AtomicBool);
#[async_trait::async_trait]
impl HookHandler for PauseOnce {
    async fn handle(&self, _: &HookEvent, _: &RunContext) -> Result<HookDecision, Error> {
        Ok(if self.0.swap(false, Ordering::SeqCst) {
            HookDecision::Pause {
                reason: json!({"wait":true}),
            }
        } else {
            HookDecision::Continue
        })
    }
}
#[tokio::test]
async fn forgetting_while_model_hook_paused_invalidates_prepared_retrieval() {
    let (dir, _, service) = service();
    let fact = service
        .remember(remember(
            MemoryArea::Project,
            "release extinct deployment hint",
        ))
        .await
        .unwrap();
    let module = Arc::new(module(service.clone(), MemoryModuleConfig::default()));
    let requests = Arc::new(Mutex::new(Vec::new()));
    let store = Arc::new(durable::SqliteStore::open(&dir.path().join("runs.sqlite")).unwrap());
    let agent = agent(module, store, requests.clone()).with_hooks(
        HookBus::new(
            EventCatalog::runtime(),
            vec![subscription(
                "before_model",
                Arc::new(PauseOnce(AtomicBool::new(true))),
            )],
        )
        .unwrap(),
    );
    let first = agent
        .invoke(RunInput::new("release"), RunContext::new("thread", "run"))
        .await
        .unwrap();
    let RunOutcome::Paused { state, .. } = first else {
        panic!("expected paused");
    };
    assert!(
        state
            .hook_progress
            .prepared_model
            .unwrap()
            .request
            .to_string()
            .contains("extinct")
    );
    service
        .forget(ForgetRequest {
            target: fact.target,
            confirmed: true,
        })
        .await
        .unwrap();
    assert!(matches!(
        agent
            .invoke(RunInput::resume(), RunContext::new("thread", "run"))
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(requests.lock().unwrap().len(), 1);
    assert!(
        !serde_json::to_string(&requests.lock().unwrap()[0])
            .unwrap()
            .contains("extinct")
    );
}

struct CaptureTwice {
    module: Arc<MemoryModule>,
    receipts: Arc<Mutex<Vec<CaptureEnqueueReceipt>>>,
}
#[async_trait::async_trait]
impl HookHandler for CaptureTwice {
    async fn handle(&self, _: &HookEvent, context: &RunContext) -> Result<HookDecision, Error> {
        for _ in 0..2 {
            let receipt = self.module.capture(context, None).await?;
            self.receipts.lock().unwrap().push(receipt);
        }
        Ok(HookDecision::Continue)
    }
}
#[tokio::test]
async fn capture_requires_durable_completion_and_reuses_actual_queue() {
    let (dir, config, service) = service();
    let module = Arc::new(module(service, full_config()));
    let receipts = Arc::new(Mutex::new(Vec::new()));
    let store = Arc::new(durable::SqliteStore::open(&dir.path().join("runs.sqlite")).unwrap());
    let agent = agent(module.clone(), store, Arc::default()).with_hooks(
        HookBus::new(
            EventCatalog::runtime(),
            vec![subscription(
                "turn_done",
                Arc::new(CaptureTwice {
                    module: module.clone(),
                    receipts: receipts.clone(),
                }),
            )],
        )
        .unwrap(),
    );
    agent
        .invoke(
            RunInput::new("Remember release convention"),
            RunContext::new("thread", "run"),
        )
        .await
        .unwrap();
    let receipts = receipts.lock().unwrap();
    assert_eq!(receipts.len(), 2);
    assert!(receipts[0].queued && !receipts[0].duplicate && receipts[1].duplicate);
    assert_eq!(receipts[0].job_id, receipts[1].job_id);
    let queue =
        nofy_memory::capture::CaptureQueue::open(config.root.clone(), Default::default()).unwrap();
    assert_eq!(
        queue
            .state(receipts[0].job_id.as_ref().unwrap())
            .unwrap()
            .as_deref(),
        Some("queued")
    );
    let claim = queue
        .claim("worker", chrono::Utc::now().timestamp(), 30)
        .unwrap()
        .unwrap();
    struct Extract;
    impl nofy_memory::capture::CaptureExtractor for Extract {
        fn extract(&self, transcript: &str) -> Result<String, String> {
            assert!(
                transcript.contains("Remember release convention")
                    && transcript.contains("visible answer")
            );
            assert!(!transcript.contains("system secrets"));
            Ok(r#"[{"statement":"release convention durable","kind":"project_fact","scope":"project","confidence":"certain"}]"#.into())
        }
    }
    let result = queue
        .process_claim(
            &claim,
            config.root,
            &Extract,
            1,
            chrono::Utc::now().timestamp(),
        )
        .unwrap();
    assert_eq!(result.persisted, 1);
}

#[tokio::test]
async fn volatile_checkpoints_cannot_claim_capture_was_durably_queued() {
    let (_dir, _, service) = service();
    let module = Arc::new(module(service, full_config()));
    let agent = agent(
        module.clone(),
        Arc::new(InMemoryCheckpointer::default()),
        Arc::default(),
    )
    .with_hooks(
        HookBus::new(
            EventCatalog::runtime(),
            vec![subscription("turn_done", module)],
        )
        .unwrap(),
    );
    let error = agent
        .invoke(RunInput::new("hello"), RunContext::new("thread", "run"))
        .await
        .unwrap_err();
    assert!(error.to_string().contains("durable turn receipt"));
}
