use async_trait::async_trait;
use nofy_agent_runtime::agent::Middleware;
use nofy_agent_runtime::*;
use nofy_tool_runtime::{Tool, ToolCallContext};
use nofy_tool_types::ToolDescription;
use serde_json::{Value, json};
use std::sync::{
    Arc, Mutex,
    atomic::{AtomicBool, AtomicUsize, Ordering},
};

#[cfg(feature = "workflow")]
#[path = "support/workflow_contract.rs"]
mod workflow_graph_contract;

struct Lookup(Arc<AtomicUsize>);
impl Tool for Lookup {
    type Args = Value;
    type Output = Value;
    fn id(&self) -> nofy_tool_protocol::ToolId {
        nofy_tool_protocol::ToolId::new("lookup").unwrap()
    }
    fn description(&self, _: &nofy_tool_runtime::ListToolsContext) -> ToolDescription {
        let mut description = ToolDescription::new("lookup", "Look up one customer");
        description.arguments_schema = Some(
            json!({"type":"object","properties":{"key":{"type":"string"}},"required":["key"]}),
        );
        description
    }
    async fn run(
        &self,
        context: ToolCallContext,
        args: Value,
    ) -> Result<Value, nofy_tool_runtime::ToolError> {
        self.0.fetch_add(1, Ordering::SeqCst);
        let tenant = context.get::<String>().expect("tenant capability");
        Ok(json!({"tenant":*tenant,"key":args["key"]}))
    }
}

#[derive(Default)]
struct Script(Mutex<Vec<ModelRequest>>);
#[async_trait]
impl Model for Script {
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        self.0.lock().unwrap().push(request.clone());
        if let Some(Message::Tool { content, .. }) = request.messages.last() {
            Ok(ModelResponse {
                output: content.to_string(),
                ..Default::default()
            })
        } else {
            Ok(ModelResponse {
                tool_calls: vec![ToolCall {
                    id: "call-1".into(),
                    name: "lookup".into(),
                    arguments: json!({"key":"alice"}),
                }],
                ..Default::default()
            })
        }
    }
}

fn components(model: Arc<dyn Model>, counter: Arc<AtomicUsize>) -> Components {
    let mut components = Components::default();
    components.models.insert("model".into(), model);
    components.prompts.insert(
        "prompt".into(),
        Arc::new(PromptTemplate::new("Business assistant. Tools: {{tools}}")),
    );
    let mut tools = ToolCatalog::new();
    tools.insert(ToolEntry::typed(Lookup(counter))).unwrap();
    components.tool_packs.insert("business".into(), tools);
    components
}
fn build(components: &Components) -> Agent {
    AgentBuilder::new("business")
        .model("model")
        .prompt("prompt")
        .tools("business")
        .compile(components)
        .unwrap()
}
fn context(tenant: &str) -> RunContext {
    let mut context = RunContext::new(tenant, "test-run");
    context.capabilities.insert(tenant.to_owned());
    context
}
fn completed(outcome: RunOutcome) -> (String, RunState) {
    match outcome {
        RunOutcome::Completed { output, state } => (output, state),
        other => panic!("unexpected {other:?}"),
    }
}

#[tokio::test]
async fn business_agent_uses_custom_typed_tool_without_cwd_or_home() {
    let model = Arc::new(Script::default());
    let counter = Arc::new(AtomicUsize::new(0));
    let agent = build(&components(model.clone(), counter.clone()));
    let (output, state) = completed(
        agent
            .invoke(RunInput::new("find alice"), context("tenant-a"))
            .await
            .unwrap(),
    );
    assert!(output.contains("tenant-a"));
    assert_eq!(counter.load(Ordering::SeqCst), 1);
    assert_eq!(state.steps, 2);
    let requests = model.0.lock().unwrap();
    assert_eq!(requests[0].tools.len(), 1);
    assert!(
        matches!(&requests[0].messages[0],Message::System{content} if content.contains("lookup"))
    );
    assert!(
        matches!(&requests[1].messages[2],Message::Assistant{tool_calls,..} if tool_calls[0].id=="call-1")
    );
    assert!(matches!(&requests[1].messages[3],Message::Tool{call_id,..} if call_id=="call-1"));
}

#[tokio::test]
async fn concurrent_tenants_do_not_share_run_state_or_capabilities() {
    let agent = build(&components(
        Arc::new(Script::default()),
        Arc::new(AtomicUsize::new(0)),
    ));
    let (a, b) = tokio::join!(
        agent.invoke(RunInput::new("a"), context("a")),
        agent.invoke(RunInput::new("b"), context("b"))
    );
    let (a, _) = completed(a.unwrap());
    let (b, _) = completed(b.unwrap());
    assert!(a.contains("\"a\"") && !a.contains("\"b\""));
    assert!(b.contains("\"b\"") && !b.contains("\"a\""));
}

struct Approval(Arc<AtomicBool>);
#[async_trait]
impl Policy for Approval {
    async fn admit(&self, _: &ToolCall, _: &RunState, _: &RunContext) -> Result<Admission, Error> {
        Ok(if self.0.load(Ordering::SeqCst) {
            Admission::Allow
        } else {
            Admission::Pause(json!({"approve":"lookup"}))
        })
    }
}

#[tokio::test]
async fn approval_resumes_from_serializable_checkpoint_without_resampling() {
    let model = Arc::new(Script::default());
    let count = Arc::new(AtomicUsize::new(0));
    let approved = Arc::new(AtomicBool::new(false));
    let mut c = components(model.clone(), count.clone());
    c.policies
        .insert("approval".into(), Arc::new(Approval(approved.clone())));
    let store = Arc::new(InMemoryCheckpointer::default());
    let agent = AgentBuilder::new("business")
        .model("model")
        .prompt("prompt")
        .tools("business")
        .policy("approval")
        .compile(&c)
        .unwrap()
        .with_checkpointer(store);
    assert!(matches!(
        agent
            .invoke(RunInput::new("query"), context("tenant"))
            .await
            .unwrap(),
        RunOutcome::Paused { .. }
    ));
    assert_eq!(count.load(Ordering::SeqCst), 0);
    approved.store(true, Ordering::SeqCst);
    completed(
        agent
            .clone()
            .invoke(RunInput::resume(), context("tenant"))
            .await
            .unwrap(),
    );
    assert_eq!(count.load(Ordering::SeqCst), 1);
    assert_eq!(model.0.lock().unwrap().len(), 2);
}

struct FailingStore {
    rows: InMemoryCheckpointer,
    writes: AtomicUsize,
}
#[async_trait]
impl Checkpointer for FailingStore {
    async fn load(&self, key: &str) -> Result<Option<Checkpoint>, Error> {
        self.rows.load(key).await
    }
    async fn save(&self, key: &str, revision: Option<u64>, row: Checkpoint) -> Result<(), Error> {
        // Initial, request budget, response, and intent are durable. Fail the
        // result write after the external operation has already succeeded.
        if self.writes.fetch_add(1, Ordering::SeqCst) == 4 {
            return Err(Error::Checkpoint("disk full".into()));
        }
        self.rows.save(key, revision, row).await
    }
}

#[tokio::test]
async fn result_commit_failure_never_replays_uncertain_side_effect() {
    let count = Arc::new(AtomicUsize::new(0));
    let agent = build(&components(Arc::new(Script::default()), count.clone())).with_checkpointer(
        Arc::new(FailingStore {
            rows: Default::default(),
            writes: AtomicUsize::new(0),
        }),
    );
    assert!(matches!(
        agent
            .invoke(RunInput::new("query"), context("tenant"))
            .await,
        Err(Error::Checkpoint(_))
    ));
    assert_eq!(count.load(Ordering::SeqCst), 1);
    assert!(
        matches!(agent.invoke(RunInput::resume(),context("tenant")).await.unwrap(),RunOutcome::Paused{reason,..} if reason["kind"]=="uncertain_tool")
    );
    assert_eq!(count.load(Ordering::SeqCst), 1);
    let input = RunInput {
        resume: true,
        reconciled: Some(("call-1".into(), json!({"verified":true}), false)),
        ..Default::default()
    };
    completed(agent.invoke(input, context("tenant")).await.unwrap());
    assert_eq!(count.load(Ordering::SeqCst), 1);
}

#[tokio::test]
async fn cancelled_run_never_dispatches_tools() {
    let count = Arc::new(AtomicUsize::new(0));
    let c = context("tenant");
    c.cancel.cancel();
    let agent = build(&components(Arc::new(Script::default()), count.clone()));
    assert!(matches!(
        agent.invoke(RunInput::new("query"), c).await.unwrap(),
        RunOutcome::Cancelled { .. }
    ));
    assert_eq!(count.load(Ordering::SeqCst), 0);
}

struct Rewriter;
#[async_trait]
impl Middleware for Rewriter {
    async fn before_tool(&self, call: &mut ToolCall, _: &RunContext) -> Result<(), Error> {
        call.arguments = json!({"key":42});
        Ok(())
    }
}

#[tokio::test]
async fn rewritten_arguments_are_validated_before_dispatch() {
    let count = Arc::new(AtomicUsize::new(0));
    let agent = build(&components(Arc::new(Script::default()), count.clone()))
        .with_middleware(Arc::new(Rewriter));
    let (output, _) = completed(
        agent
            .invoke(RunInput::new("query"), context("tenant"))
            .await
            .unwrap(),
    );
    assert!(output.contains("invalid tool arguments"));
    assert_eq!(count.load(Ordering::SeqCst), 0);
}

#[tokio::test]
async fn duplicate_tools_fail_composition_before_execution() {
    let mut c = components(Arc::new(Script::default()), Arc::new(AtomicUsize::new(0)));
    c.tool_packs
        .insert("duplicate".into(), c.tool_packs["business"].clone());
    assert!(
        AgentBuilder::new("bad")
            .model("model")
            .prompt("prompt")
            .tools("business")
            .tools("duplicate")
            .compile(&c)
            .is_err()
    );
}

#[tokio::test]
async fn agent_can_be_used_as_another_agents_tool() {
    struct Parent;
    #[async_trait]
    impl Model for Parent {
        async fn complete(
            &self,
            request: ModelRequest,
            _: &RunContext,
        ) -> Result<ModelResponse, Error> {
            Ok(
                if matches!(request.messages.last(), Some(Message::Tool { .. })) {
                    ModelResponse {
                        output: "reviewed".into(),
                        ..Default::default()
                    }
                } else {
                    ModelResponse {
                        tool_calls: vec![ToolCall {
                            id: "child-1".into(),
                            name: "research".into(),
                            arguments: json!({"prompt":"query"}),
                        }],
                        ..Default::default()
                    }
                },
            )
        }
    }
    let count = Arc::new(AtomicUsize::new(0));
    let child = build(&components(Arc::new(Script::default()), count.clone()));
    let mut c = components(Arc::new(Parent), Arc::new(AtomicUsize::new(0)));
    let mut tools = ToolCatalog::new();
    tools
        .insert(child.as_tool("research", "Research a customer"))
        .unwrap();
    c.tool_packs.insert("child".into(), tools);
    let parent = AgentBuilder::new("parent")
        .model("model")
        .prompt("prompt")
        .tools("child")
        .compile(&c)
        .unwrap();
    assert_eq!(
        completed(
            parent
                .invoke(RunInput::new("go"), context("tenant"))
                .await
                .unwrap()
        )
        .0,
        "reviewed"
    );
    assert_eq!(count.load(Ordering::SeqCst), 1);
}

#[tokio::test]
async fn checkpoints_reject_concurrent_overwrites_and_changed_specs() {
    let store = InMemoryCheckpointer::default();
    let row = Checkpoint {
        version: 1,
        revision: 1,
        composition: "a".into(),
        state: Default::default(),
    };
    store.save("key", None, row.clone()).await.unwrap();
    assert!(store.save("key", None, row).await.is_err());
    let store = Arc::new(InMemoryCheckpointer::default());
    let c = components(Arc::new(Script::default()), Arc::new(AtomicUsize::new(0)));
    let original = build(&c).with_checkpointer(store.clone());
    completed(
        original
            .invoke(RunInput::new("query"), context("tenant"))
            .await
            .unwrap(),
    );
    let changed = AgentBuilder::new("business")
        .model("model")
        .prompt("prompt")
        .tools("business")
        .settings(Settings {
            max_steps: 5,
            ..Default::default()
        })
        .compile(&c)
        .unwrap()
        .with_checkpointer(store);
    assert!(matches!(
        changed.invoke(RunInput::resume(), context("tenant")).await,
        Err(Error::Checkpoint(_))
    ));
}

#[tokio::test]
async fn running_model_can_be_cancelled_and_run_future_is_send() {
    struct Pending;
    #[async_trait]
    impl Model for Pending {
        async fn complete(&self, _: ModelRequest, _: &RunContext) -> Result<ModelResponse, Error> {
            std::future::pending().await
        }
    }
    let agent = build(&components(
        Arc::new(Pending),
        Arc::new(AtomicUsize::new(0)),
    ));
    let context = context("pending");
    let cancel = context.cancel.clone();
    let task = tokio::spawn(async move { agent.invoke(RunInput::new("wait"), context).await });
    tokio::task::yield_now().await;
    cancel.cancel();
    assert!(matches!(
        task.await.unwrap().unwrap(),
        RunOutcome::Cancelled { .. }
    ));
}

#[tokio::test]
async fn optional_memory_context_and_sequence_use_the_same_agent_api() {
    use nofy_agent_runtime::memory::{InMemoryStore, MemoryContext, MemoryStore};
    struct Echo;
    #[async_trait]
    impl Model for Echo {
        async fn complete(
            &self,
            request: ModelRequest,
            _: &RunContext,
        ) -> Result<ModelResponse, Error> {
            let output = request
                .messages
                .iter()
                .filter_map(|m| match m {
                    Message::User { content } => Some(content.clone()),
                    _ => None,
                })
                .collect::<Vec<_>>()
                .join("\n");
            Ok(ModelResponse {
                output,
                ..Default::default()
            })
        }
    }
    let store = Arc::new(InMemoryStore::default());
    store
        .append("tenant-a", "alice is active".into())
        .await
        .unwrap();
    store
        .append("tenant-b", "alice is private".into())
        .await
        .unwrap();
    let mut c = components(Arc::new(Echo), Arc::new(AtomicUsize::new(0)));
    c.context_sources.insert(
        "memory".into(),
        Arc::new(MemoryContext {
            store,
            namespace: "tenant-a".into(),
            limit: 3,
        }),
    );
    let agent = AgentBuilder::new("research")
        .model("model")
        .prompt("prompt")
        .context_source("memory")
        .compile(&c)
        .unwrap();
    let result = nofy_agent_runtime::composition::sequence(
        &[agent.clone(), agent],
        "alice".into(),
        context("tenant-a"),
    )
    .await
    .unwrap();
    assert!(result.contains("alice is active"));
    assert!(!result.contains("private"));
}

#[cfg(feature = "workflow")]
#[tokio::test]
async fn declarative_workflow_dispatches_compiled_agents() {
    let agent = build(&components(
        Arc::new(Script::default()),
        Arc::new(AtomicUsize::new(0)),
    ));
    let graph = workflow_graph_contract::compiled(agent, &["find alice"], true)
        .with_checkpointer(Arc::new(InMemoryCheckpointer::default()));
    let outcome = graph
        .invoke(json!({}), RunInput::default(), context("workflow"))
        .await
        .unwrap();
    assert!(matches!(outcome, RunOutcome::Completed { .. }));
    let RunOutcome::Completed { state, .. } = outcome else {
        unreachable!()
    };
    assert!(state.messages.iter().any(|message| matches!(message,
        Message::Tool { content, is_error: false, .. } if content.to_string().contains("workflow"))));
}

#[tokio::test]
async fn model_requests_stop_at_the_configured_budget() {
    let model = Arc::new(Script::default());
    let mut c = components(model.clone(), Arc::new(AtomicUsize::new(0)));
    c.policies.insert("deny".into(), Arc::new(Deny));
    struct Deny;
    #[async_trait]
    impl Policy for Deny {
        async fn admit(
            &self,
            _: &ToolCall,
            _: &RunState,
            _: &RunContext,
        ) -> Result<Admission, Error> {
            Ok(Admission::Deny("blocked".into()))
        }
    }
    let agent = AgentBuilder::new("limited")
        .model("model")
        .prompt("prompt")
        .tools("business")
        .policy("deny")
        .settings(Settings {
            max_steps: 1,
            ..Default::default()
        })
        .compile(&c)
        .unwrap();
    assert!(matches!(
        agent
            .invoke(RunInput::new("query"), context("limited"))
            .await
            .unwrap(),
        RunOutcome::BudgetExceeded { .. }
    ));
    assert_eq!(model.0.lock().unwrap().len(), 1);
}

#[test]
fn schemas_cannot_fetch_external_resources_during_composition() {
    let mut entry = ToolEntry::typed(Lookup(Arc::new(AtomicUsize::new(0))));
    entry.definition.function.parameters = json!({"$ref":"https://example.invalid/schema.json"});
    assert!(matches!(
        ToolCatalog::new().insert(entry),
        Err(Error::Composition(_))
    ));
}

#[tokio::test]
async fn batch_results_keep_call_identity_and_unknown_tools_do_not_dispatch() {
    struct Batch;
    #[async_trait]
    impl Model for Batch {
        async fn complete(
            &self,
            request: ModelRequest,
            _: &RunContext,
        ) -> Result<ModelResponse, Error> {
            let results: Vec<_> = request
                .messages
                .iter()
                .filter_map(|m| match m {
                    Message::Tool {
                        call_id, is_error, ..
                    } => Some((call_id.clone(), *is_error)),
                    _ => None,
                })
                .collect();
            if !results.is_empty() {
                assert_eq!(
                    results,
                    vec![
                        ("first".into(), false),
                        ("missing".into(), true),
                        ("last".into(), false)
                    ]
                );
                return Ok(ModelResponse {
                    output: "batch done".into(),
                    ..Default::default()
                });
            }
            Ok(ModelResponse {
                tool_calls: vec![
                    ToolCall {
                        id: "first".into(),
                        name: "lookup".into(),
                        arguments: json!({"key":"a"}),
                    },
                    ToolCall {
                        id: "missing".into(),
                        name: "unregistered".into(),
                        arguments: json!({}),
                    },
                    ToolCall {
                        id: "last".into(),
                        name: "lookup".into(),
                        arguments: json!({"key":"b"}),
                    },
                ],
                ..Default::default()
            })
        }
    }
    let count = Arc::new(AtomicUsize::new(0));
    let agent = build(&components(Arc::new(Batch), count.clone()));
    let (tx, mut rx) = tokio::sync::mpsc::channel(32);
    let (result, events) = tokio::join!(
        agent.stream(RunInput::new("query"), context("batch"), tx),
        async {
            let mut events = Vec::new();
            while let Some(event) = rx.recv().await {
                events.push(event)
            }
            events
        }
    );
    assert_eq!(completed(result.unwrap()).0, "batch done");
    assert_eq!(count.load(Ordering::SeqCst), 2);
    assert!(matches!(
        events.last(),
        Some(nofy_agent_runtime::agent::RunEvent::Finished)
    ));
    assert_eq!(
        events
            .iter()
            .filter(|e| matches!(e, nofy_agent_runtime::agent::RunEvent::ToolStarted { .. }))
            .count(),
        2
    );
}

#[tokio::test]
async fn model_errors_are_returned_without_dispatching_tools() {
    struct Fails;
    #[async_trait]
    impl Model for Fails {
        async fn complete(&self, _: ModelRequest, _: &RunContext) -> Result<ModelResponse, Error> {
            Err(Error::Model("upstream unavailable".into()))
        }
    }
    let count = Arc::new(AtomicUsize::new(0));
    let agent = build(&components(Arc::new(Fails), count.clone()));
    assert!(matches!(
        agent.invoke(RunInput::new("query"), context("error")).await,
        Err(Error::Model(_))
    ));
    assert_eq!(count.load(Ordering::SeqCst), 0);
}

#[tokio::test]
async fn routing_and_parallel_composition_preserve_branch_identity() {
    struct Identity;
    #[async_trait]
    impl Model for Identity {
        async fn complete(
            &self,
            _: ModelRequest,
            context: &RunContext,
        ) -> Result<ModelResponse, Error> {
            tokio::task::yield_now().await;
            Ok(ModelResponse {
                output: context.thread_id.clone(),
                ..Default::default()
            })
        }
    }
    let c = components(Arc::new(Identity), Arc::new(AtomicUsize::new(0)));
    let agent = build(&c);
    let branches = nofy_agent_runtime::composition::parallel(
        &[agent.clone(), agent.clone()],
        RunInput::new("query"),
        context("root"),
    )
    .await;
    let outputs = branches
        .into_iter()
        .map(|result| completed(result.unwrap()).0)
        .collect::<Vec<_>>();
    assert_eq!(outputs, vec!["root:parallel:0", "root:parallel:1"]);
    let routes = [("business".into(), agent)].into();
    let output = nofy_agent_runtime::composition::route(
        &routes,
        "business",
        RunInput::new("query"),
        context("root"),
    )
    .await
    .unwrap();
    assert_eq!(completed(output).0, "root:route:8:business");
    assert!(
        nofy_agent_runtime::composition::route(
            &routes,
            "missing",
            RunInput::new("query"),
            context("root")
        )
        .await
        .is_err()
    );
}

struct ChangingTools {
    generation: Arc<AtomicUsize>,
    reads: AtomicUsize,
    counters: [Arc<AtomicUsize>; 2],
}
#[async_trait]
impl ToolSource for ChangingTools {
    async fn snapshot(&self, _: &RunContext) -> Result<ToolSnapshot, Error> {
        self.reads.fetch_add(1, Ordering::SeqCst);
        let generation = self.generation.load(Ordering::SeqCst);
        let mut catalog = ToolCatalog::new();
        let mut entry = ToolEntry::typed(Lookup(self.counters[generation].clone()));
        if generation == 1 {
            entry.definition.function.name = "lookup_v2".into();
        }
        catalog.insert(entry)?;
        Ok(ToolSnapshot {
            revision: generation.to_string(),
            catalog,
        })
    }
}

#[tokio::test]
async fn dynamic_catalog_is_pinned_for_a_run_and_refreshes_on_the_next_turn() {
    struct Rotate {
        script: Script,
        generation: Arc<AtomicUsize>,
    }
    #[async_trait]
    impl Model for Rotate {
        async fn complete(
            &self,
            request: ModelRequest,
            context: &RunContext,
        ) -> Result<ModelResponse, Error> {
            self.generation.store(1, Ordering::SeqCst);
            let name = request.tools[0].function.name.clone();
            assert!(
                matches!(&request.messages[0],Message::System {content} if content.contains(&name)),
                "prompt must match the pinned catalog"
            );
            let mut response = self.script.complete(request, context).await?;
            for call in &mut response.tool_calls {
                call.name = name.clone();
            }
            Ok(response)
        }
    }
    let generation = Arc::new(AtomicUsize::new(0));
    let source = Arc::new(ChangingTools {
        generation: generation.clone(),
        reads: AtomicUsize::new(0),
        counters: [Arc::new(AtomicUsize::new(0)), Arc::new(AtomicUsize::new(0))],
    });
    let mut c = components(
        Arc::new(Rotate {
            script: Script::default(),
            generation,
        }),
        Arc::new(AtomicUsize::new(0)),
    );
    c.tool_sources.insert("mcp".into(), source.clone());
    let agent = AgentBuilder::new("dynamic")
        .model("model")
        .prompt("prompt")
        .tool_source("mcp")
        .compile(&c)
        .unwrap()
        .with_checkpointer(Arc::new(InMemoryCheckpointer::default()));
    completed(
        agent
            .invoke(RunInput::new("first"), context("tenant"))
            .await
            .unwrap(),
    );
    assert_eq!(source.counters[0].load(Ordering::SeqCst), 1);
    assert_eq!(source.counters[1].load(Ordering::SeqCst), 0);
    completed(
        agent
            .invoke(RunInput::new("second"), context("tenant"))
            .await
            .unwrap(),
    );
    assert_eq!(source.counters[1].load(Ordering::SeqCst), 1);
    assert_eq!(source.reads.load(Ordering::SeqCst), 2);
}

#[tokio::test]
async fn unfinished_runs_reject_changed_tool_revisions_before_dispatch() {
    let source = Arc::new(ChangingTools {
        generation: Arc::new(AtomicUsize::new(0)),
        reads: AtomicUsize::new(0),
        counters: [Arc::new(AtomicUsize::new(0)), Arc::new(AtomicUsize::new(0))],
    });
    let approved = Arc::new(AtomicBool::new(false));
    let mut c = components(Arc::new(Script::default()), Arc::new(AtomicUsize::new(0)));
    c.tool_sources.insert("mcp".into(), source.clone());
    c.policies
        .insert("approval".into(), Arc::new(Approval(approved.clone())));
    let agent = AgentBuilder::new("dynamic")
        .model("model")
        .prompt("prompt")
        .tool_source("mcp")
        .policy("approval")
        .compile(&c)
        .unwrap()
        .with_checkpointer(Arc::new(InMemoryCheckpointer::default()));
    assert!(matches!(
        agent
            .invoke(RunInput::new("first"), context("tenant"))
            .await
            .unwrap(),
        RunOutcome::Paused { .. }
    ));
    source.generation.store(1, Ordering::SeqCst);
    approved.store(true, Ordering::SeqCst);
    assert!(matches!(
        agent.invoke(RunInput::resume(), context("tenant")).await,
        Err(Error::Checkpoint(_))
    ));
    assert_eq!(
        source.counters[0].load(Ordering::SeqCst) + source.counters[1].load(Ordering::SeqCst),
        0
    );
}
