use nofy_agent_runtime::agent::RunEvent;
use nofy_agent_runtime::events::{EventScope, EventSink, EventSinkBinding, RunStatus};
use nofy_agent_runtime::*;
use nofy_tool_runtime::{Tool, ToolCallContext, ToolProgress, ToolStreamItem};
use nofy_tool_types::ToolDescription;
use serde_json::{Value, json};
use std::sync::{
    Arc, Mutex,
    atomic::{AtomicBool, AtomicUsize, Ordering},
};
use tokio::sync::Notify;

struct Streaming {
    gate: Arc<Notify>,
    waiting: Arc<Notify>,
}
#[async_trait::async_trait]
impl Model for Streaming {
    fn capabilities(&self) -> ModelCapabilities {
        ModelCapabilities {
            streaming: true,
            ..Default::default()
        }
    }
    async fn complete(&self, _: ModelRequest, _: &RunContext) -> Result<ModelResponse, Error> {
        panic!("the runtime must drive stream")
    }
    async fn stream(&self, _: ModelRequest, _: &RunContext) -> Result<ModelStream, Error> {
        let gate = self.gate.clone();
        let waiting = self.waiting.clone();
        Ok(Box::pin(futures::stream::unfold(
            (0, gate, waiting),
            |(state, gate, waiting)| async move {
                let chunk = match state {
                    0 => ModelChunk::Delta(ModelDelta::Text { text: "a".into() }),
                    1 => {
                        waiting.notify_one();
                        gate.notified().await;
                        ModelChunk::Delta(ModelDelta::Text { text: "b".into() })
                    }
                    2 => ModelChunk::Completed(ModelResponse {
                        output: "ab".into(),
                        input_tokens: 1,
                        output_tokens: 2,
                        info: CompletionInfo {
                            stop_reason: Some("stop".into()),
                            ..Default::default()
                        },
                        ..Default::default()
                    }),
                    _ => return None,
                };
                Some((Ok(chunk), (state + 1, gate, waiting)))
            },
        )))
    }
}
fn components(model: Arc<dyn Model>) -> Components {
    let mut c = Components::default();
    c.models.insert("model".into(), model);
    c.prompts
        .insert("prompt".into(), Arc::new(StaticPrompt("test".into())));
    c
}
fn agent(model: Arc<dyn Model>) -> Agent {
    AgentBuilder::new("streaming")
        .model("model")
        .prompt("prompt")
        .compile(&components(model))
        .unwrap()
}

#[tokio::test]
async fn deltas_arrive_before_completion_and_a_small_live_buffer_does_not_drop_events() {
    let gate = Arc::new(Notify::new());
    let waiting = Arc::new(Notify::new());
    let agent = agent(Arc::new(Streaming {
        gate: gate.clone(),
        waiting,
    }));
    let (tx, mut rx) = tokio::sync::mpsc::channel(1);
    let task = tokio::spawn(async move {
        agent
            .stream(RunInput::new("test"), RunContext::new("thread", "run"), tx)
            .await
    });
    let mut deltas = Vec::new();
    let mut terminal = 0;
    while let Some(event) = rx.recv().await {
        match event {
            RunEvent::ModelDelta {
                delta: ModelDelta::Text { text },
            } => {
                if text == "a" {
                    assert!(!task.is_finished());
                    gate.notify_one();
                }
                deltas.push(text);
            }
            RunEvent::Terminated {
                status: RunStatus::Completed,
                ..
            } => terminal += 1,
            _ => {}
        }
    }
    let RunOutcome::Completed { output, state } = task.await.unwrap().unwrap() else {
        panic!("not completed")
    };
    assert_eq!(output, "ab");
    assert_eq!(deltas, ["a", "b"]);
    assert_eq!(terminal, 1);
    assert_eq!(state.completion_info.stop_reason.as_deref(), Some("stop"));
}

#[tokio::test]
async fn cancellation_interrupts_a_model_waiting_for_its_next_chunk() {
    let gate = Arc::new(Notify::new());
    let waiting = Arc::new(Notify::new());
    let agent = agent(Arc::new(Streaming {
        gate,
        waiting: waiting.clone(),
    }));
    let context = RunContext::new("thread", "run");
    let cancel = context.cancel.clone();
    let task = tokio::spawn(async move { agent.invoke(RunInput::new("test"), context).await });
    waiting.notified().await;
    cancel.cancel();
    assert!(matches!(
        tokio::time::timeout(std::time::Duration::from_secs(5), task)
            .await
            .unwrap()
            .unwrap()
            .unwrap(),
        RunOutcome::Cancelled { .. }
    ));
}

struct Progress(Arc<AtomicUsize>);
impl Tool for Progress {
    type Args = Value;
    type Output = Value;
    fn id(&self) -> nofy_tool_protocol::ToolId {
        nofy_tool_protocol::ToolId::new("progress").unwrap()
    }
    fn description(&self, _: &nofy_tool_runtime::ListToolsContext) -> ToolDescription {
        let mut d = ToolDescription::new("progress", "Report progress before the result");
        d.arguments_schema = Some(json!({"type":"object"}));
        d
    }
    async fn execute(&self, _: ToolCallContext, _: Value) -> nofy_tool_runtime::ToolStream<Value> {
        self.0.fetch_add(1, Ordering::SeqCst);
        Box::pin(futures::stream::iter([
            ToolStreamItem::Progress(ToolProgress::Text {
                text: "first".into(),
            }),
            ToolStreamItem::Progress(ToolProgress::Text {
                text: "second".into(),
            }),
            ToolStreamItem::Terminal(Ok(json!({"done":true}))),
        ]))
    }
}
struct Call;
#[async_trait::async_trait]
impl Model for Call {
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        Ok(
            if matches!(request.messages.last(), Some(Message::Tool { .. })) {
                ModelResponse {
                    output: "done".into(),
                    ..Default::default()
                }
            } else {
                ModelResponse {
                    tool_calls: vec![ToolCall {
                        id: "call".into(),
                        name: "progress".into(),
                        arguments: json!({}),
                    }],
                    ..Default::default()
                }
            },
        )
    }
}
fn progress_agent(count: Arc<AtomicUsize>) -> Agent {
    let mut c = components(Arc::new(Call));
    let mut tools = ToolCatalog::new();
    tools.insert(ToolEntry::typed(Progress(count))).unwrap();
    c.tool_packs.insert("tools".into(), tools);
    AgentBuilder::new("progress")
        .model("model")
        .prompt("prompt")
        .tools("tools")
        .compile(&c)
        .unwrap()
}

#[tokio::test]
async fn typed_tool_progress_keeps_order_before_the_terminal_result() {
    let count = Arc::new(AtomicUsize::new(0));
    let agent = progress_agent(count.clone());
    let (tx, mut rx) = tokio::sync::mpsc::channel(1);
    let task = tokio::spawn(async move {
        agent
            .stream(RunInput::new("test"), RunContext::new("thread", "run"), tx)
            .await
    });
    let mut order = Vec::new();
    while let Some(event) = rx.recv().await {
        match event {
            RunEvent::ToolProgress {
                call_id,
                progress: ToolProgress::Text { text },
            } => {
                assert_eq!(call_id, "call");
                order.push(text);
            }
            RunEvent::ToolCompleted { .. } => order.push("terminal".into()),
            _ => {}
        }
    }
    assert!(matches!(
        task.await.unwrap().unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(order, ["first", "second", "terminal"]);
    assert_eq!(count.load(Ordering::SeqCst), 1);
}

#[derive(Default)]
struct Collect(Mutex<Vec<RunEvent>>);
#[async_trait::async_trait]
impl EventSink for Collect {
    async fn record(&self, _: EventScope, event: RunEvent) -> Result<(), Error> {
        self.0.lock().unwrap().push(event);
        Ok(())
    }
}
struct Malformed(bool);
#[async_trait::async_trait]
impl Model for Malformed {
    async fn complete(&self, _: ModelRequest, _: &RunContext) -> Result<ModelResponse, Error> {
        unreachable!()
    }
    async fn stream(&self, _: ModelRequest, _: &RunContext) -> Result<ModelStream, Error> {
        let mut chunks = vec![Ok(ModelChunk::Delta(ModelDelta::Text {
            text: "partial".into(),
        }))];
        if self.0 {
            chunks.push(Ok(ModelChunk::Completed(ModelResponse {
                tool_calls: vec![ToolCall {
                    id: "call".into(),
                    name: "progress".into(),
                    arguments: json!({}),
                }],
                ..Default::default()
            })));
            chunks.push(Ok(ModelChunk::Completed(ModelResponse::default())));
        }
        Ok(Box::pin(futures::stream::iter(chunks)))
    }
}

#[tokio::test]
async fn missing_or_duplicate_completion_fails_before_dispatch_and_emits_one_failure() {
    for duplicate in [false, true] {
        let count = Arc::new(AtomicUsize::new(0));
        let mut c = components(Arc::new(Malformed(duplicate)));
        let mut tools = ToolCatalog::new();
        tools
            .insert(ToolEntry::typed(Progress(count.clone())))
            .unwrap();
        c.tool_packs.insert("tools".into(), tools);
        let agent = AgentBuilder::new("malformed")
            .model("model")
            .prompt("prompt")
            .tools("tools")
            .compile(&c)
            .unwrap();
        let events = Arc::new(Collect::default());
        let mut context = RunContext::new("thread", "run");
        context
            .capabilities
            .insert(EventSinkBinding(events.clone()));
        assert!(agent.invoke(RunInput::new("test"), context).await.is_err());
        assert_eq!(count.load(Ordering::SeqCst), 0);
        assert_eq!(
            events
                .0
                .lock()
                .unwrap()
                .iter()
                .filter(|event| matches!(
                    event,
                    RunEvent::Terminated {
                        status: RunStatus::Failed,
                        ..
                    }
                ))
                .count(),
            1
        );
    }
}

struct FailBeforeDispatch(AtomicBool);
#[async_trait::async_trait]
impl EventSink for FailBeforeDispatch {
    async fn record(&self, _: EventScope, event: RunEvent) -> Result<(), Error> {
        if matches!(event, RunEvent::ToolStarted { .. }) && self.0.load(Ordering::SeqCst) {
            return Err(Error::Checkpoint("event store unavailable".into()));
        }
        Ok(())
    }
}
#[tokio::test]
async fn failing_durable_event_write_does_not_start_a_tool() {
    let count = Arc::new(AtomicUsize::new(0));
    let agent =
        progress_agent(count.clone()).with_checkpointer(Arc::new(InMemoryCheckpointer::default()));
    let mut context = RunContext::new("thread", "run");
    context
        .capabilities
        .insert(EventSinkBinding(Arc::new(FailBeforeDispatch(
            AtomicBool::new(true),
        ))));
    assert!(agent.invoke(RunInput::new("test"), context).await.is_err());
    assert_eq!(count.load(Ordering::SeqCst), 0);
}

#[tokio::test]
async fn refusal_and_truncation_have_distinct_terminal_events() {
    struct Finish(CompletionInfo);
    #[async_trait::async_trait]
    impl Model for Finish {
        async fn complete(&self, _: ModelRequest, _: &RunContext) -> Result<ModelResponse, Error> {
            Ok(ModelResponse {
                info: self.0.clone(),
                ..Default::default()
            })
        }
    }
    for (info, status) in [
        (
            CompletionInfo {
                stop_reason: Some("content_filter".into()),
                refusal: Some("refused".into()),
                ..Default::default()
            },
            RunStatus::Refused,
        ),
        (
            CompletionInfo {
                stop_reason: Some("length".into()),
                ..Default::default()
            },
            RunStatus::Truncated,
        ),
    ] {
        let events = Arc::new(Collect::default());
        let mut context = RunContext::new("thread", "run");
        context
            .capabilities
            .insert(EventSinkBinding(events.clone()));
        let result = agent(Arc::new(Finish(info.clone())))
            .invoke(RunInput::new("test"), context)
            .await
            .unwrap();
        assert!(matches!(result,RunOutcome::Completed {state,..} if state.completion_info==info));
        assert_eq!(events.0.lock().unwrap().iter().filter(|event|matches!(event,RunEvent::Terminated {status:actual,..} if *actual==status)).count(),1);
    }
}

#[tokio::test]
async fn invalid_image_input_is_rejected_before_loading_dynamic_tools() {
    struct Source(Arc<AtomicUsize>);
    #[async_trait::async_trait]
    impl ToolSource for Source {
        async fn snapshot(&self, _: &RunContext) -> Result<ToolSnapshot, Error> {
            self.0.fetch_add(1, Ordering::SeqCst);
            unreachable!()
        }
    }
    let count = Arc::new(AtomicUsize::new(0));
    let mut c = components(Arc::new(Call));
    c.tool_sources
        .insert("source".into(), Arc::new(Source(count.clone())));
    let agent = AgentBuilder::new("input")
        .model("model")
        .prompt("prompt")
        .tool_source("source")
        .compile(&c)
        .unwrap();
    assert!(
        agent
            .invoke(
                RunInput::multimodal(vec![InputPart::Image {
                    url: "file:///private/image.png".into()
                }]),
                RunContext::new("thread", "run")
            )
            .await
            .is_err()
    );
    assert_eq!(count.load(Ordering::SeqCst), 0);
}

#[tokio::test]
async fn disconnected_live_receiver_does_not_stop_execution_or_lose_sink_events() {
    let gate = Arc::new(Notify::new());
    gate.notify_one();
    let model = Arc::new(Streaming {
        gate,
        waiting: Arc::new(Notify::new()),
    });
    let events = Arc::new(Collect::default());
    let mut context = RunContext::new("thread", "run");
    context
        .capabilities
        .insert(EventSinkBinding(events.clone()));
    let (tx, rx) = tokio::sync::mpsc::channel(1);
    drop(rx);
    assert!(matches!(
        agent(model)
            .stream(RunInput::new("test"), context, tx)
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    let events = events.0.lock().unwrap();
    assert_eq!(
        events
            .iter()
            .filter(|event| matches!(
                event,
                RunEvent::ModelDelta {
                    delta: ModelDelta::Text { .. }
                }
            ))
            .count(),
        2
    );
    assert!(events.iter().any(|event| matches!(
        event,
        RunEvent::Terminated {
            status: RunStatus::Completed,
            ..
        }
    )));
}

#[cfg(feature = "sqlite")]
#[tokio::test]
async fn durable_cursors_replay_live_deltas_and_terminal_after_reopening() {
    use nofy_agent_runtime::compile::{AgentDocument, compile_document};
    use nofy_agent_runtime::durable::SqliteStore;
    use nofy_agent_runtime::registry::*;
    use nofy_agent_runtime::supervisor::RunSupervisor;
    let directory = tempfile::tempdir().unwrap();
    let path = directory.path().join("events.db");
    let store = SqliteStore::open(&path).unwrap();
    let gate = Arc::new(Notify::new());
    let waiting = Arc::new(Notify::new());
    let mut host = ModuleRegistry::default();
    host.register_factory(Arc::new(InstanceFactory::new(
        "stream",
        "1",
        ModuleInstance::Model(Arc::new(Streaming {
            gate: gate.clone(),
            waiting: waiting.clone(),
        })),
    )))
    .unwrap();
    host.register_factory(Arc::new(StaticPromptFactory))
        .unwrap();
    let document:AgentDocument=serde_json::from_value(json!({"modules":[
        {"reference":{"id":"model","version":"1"},"factory":"stream","config":{}},
        {"reference":{"id":"prompt","version":"1"},"factory":"prompt.static","config":{"text":"test"}}
    ],"agent":{"name":"events","model":{"id":"model","version":"1"},"prompt":{"id":"prompt","version":"1"}}})).unwrap();
    let compiled = compile_document(document, &host).unwrap();
    let supervisor = RunSupervisor::new(store.clone());
    let task = tokio::spawn(async move {
        supervisor
            .execute(
                &compiled,
                RunInput::new("test"),
                RunContext::new("thread", "run"),
            )
            .await
    });
    waiting.notified().await;
    let prefix = store.events("run", 0, 1000).await.unwrap();
    assert!(prefix.iter().any(|event|matches!(&event.event,RunEvent::ModelDelta {delta:ModelDelta::Text {text}} if text=="a")));
    assert!(
        !prefix
            .iter()
            .any(|event| matches!(event.event, RunEvent::Terminated { .. }))
    );
    let cursor = prefix.last().unwrap().cursor;
    gate.notify_one();
    assert!(matches!(
        task.await.unwrap().unwrap(),
        RunOutcome::Completed { .. }
    ));
    let reopened = SqliteStore::open(&path).unwrap();
    let suffix = reopened.events("run", cursor, 1000).await.unwrap();
    assert!(suffix.iter().any(|event|matches!(&event.event,RunEvent::ModelDelta {delta:ModelDelta::Text {text}} if text=="b")));
    assert_eq!(
        suffix
            .iter()
            .filter(|event| matches!(
                event.event,
                RunEvent::Terminated {
                    status: RunStatus::Completed,
                    ..
                }
            ))
            .count(),
        1
    );
    let all = reopened.events("run", 0, 1000).await.unwrap();
    assert_eq!(all.len(), prefix.len() + suffix.len());
    assert!(all.windows(2).all(|pair| pair[0].cursor < pair[1].cursor));
    assert!(
        all.iter()
            .all(|event| event.scope.root_run_id == "run" && event.scope.agent == "events")
    );
    assert!(reopened.events("other", 0, 1000).await.unwrap().is_empty());
}
