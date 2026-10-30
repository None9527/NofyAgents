use nofy_agent_runtime::{context_policy::*, hooks::*, *};
use serde_json::{Value, json};
use std::sync::{
    Arc, Mutex,
    atomic::{AtomicUsize, Ordering},
};

struct ModelStub;
#[async_trait::async_trait]
impl Model for ModelStub {
    async fn complete(&self, _: ModelRequest, _: &RunContext) -> Result<ModelResponse, Error> {
        Ok(ModelResponse {
            output: "answer".into(),
            ..Default::default()
        })
    }
}
struct Shorten {
    applied: Arc<AtomicUsize>,
    corrupt: bool,
}
#[async_trait::async_trait]
impl ContextPolicy for Shorten {
    async fn plan(&self, state: &RunState, _: &RunContext) -> Result<Option<Value>, Error> {
        Ok(state
            .hook_progress
            .input_start_index
            .filter(|start| *start > 1)
            .map(|start| json!({"start":start})))
    }
    async fn apply(
        &self,
        state: &RunState,
        plan: &Value,
        _: &RunContext,
    ) -> Result<ContextUpdate, Error> {
        self.applied.fetch_add(1, Ordering::SeqCst);
        let start = plan["start"].as_u64().unwrap() as usize;
        let mut messages = vec![
            state.messages[0].clone(),
            Message::User {
                content: "summary".into(),
            },
        ];
        messages.extend_from_slice(&state.messages[start..]);
        if self.corrupt {
            messages[0] = Message::System {
                content: "changed".into(),
            };
        }
        Ok(ContextUpdate {
            messages,
            retained_from: start,
            retained_at: 2,
            input_tokens: 3,
            output_tokens: 2,
            metadata: json!({}),
        })
    }
}
fn agent(applied: Arc<AtomicUsize>, corrupt: bool, store: Arc<dyn Checkpointer>) -> Arc<Agent> {
    let mut components = Components::default();
    components
        .models
        .insert("model".into(), Arc::new(ModelStub));
    components
        .prompts
        .insert("prompt".into(), Arc::new(StaticPrompt("original".into())));
    Arc::new(
        AgentBuilder::new("context-agent")
            .model("model")
            .prompt("prompt")
            .compile(&components)
            .unwrap()
            .with_context_policy("shorten@1", Arc::new(Shorten { applied, corrupt }))
            .unwrap()
            .with_checkpointer(store),
    )
}
struct Gate {
    events: Arc<Mutex<Vec<HookEvent>>>,
    pause: bool,
    block: Option<Arc<tokio::sync::Notify>>,
}
#[async_trait::async_trait]
impl HookHandler for Gate {
    async fn handle(&self, event: &HookEvent, _: &RunContext) -> Result<HookDecision, Error> {
        self.events.lock().unwrap().push(event.clone());
        if let Some(notify) = &self.block {
            notify.notify_one();
            std::future::pending::<()>().await;
        }
        Ok(if self.pause {
            HookDecision::Pause {
                reason: json!({"compact":true}),
            }
        } else {
            HookDecision::Continue
        })
    }
}
fn subscription(name: &str, handler: Arc<dyn HookHandler>) -> Arc<HookRegistration> {
    Arc::new(
        HookRegistration::new(
            format!("{name}@1"),
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
#[tokio::test]
async fn compaction_gate_pauses_before_work_then_reconciles_without_changing_turn() {
    let store = Arc::new(InMemoryCheckpointer::default());
    let applied = Arc::new(AtomicUsize::new(0));
    let events = Arc::new(Mutex::new(Vec::new()));
    let rule = subscription(
        "before_compact",
        Arc::new(Gate {
            events: events.clone(),
            pause: true,
            block: None,
        }),
    );
    let bus = HookBus::new(EventCatalog::runtime(), vec![rule.clone()]).unwrap();
    let agent =
        Arc::unwrap_or_clone(agent(applied.clone(), false, store.clone())).with_hooks(bus.clone());
    agent
        .invoke(
            RunInput::new("first"),
            RunContext::new("thread", "first-run"),
        )
        .await
        .unwrap();
    assert!(matches!(
        agent
            .invoke(
                RunInput::new("second"),
                RunContext::new("thread", "second-run")
            )
            .await
            .unwrap(),
        RunOutcome::Paused { .. }
    ));
    assert_eq!(applied.load(Ordering::SeqCst), 0);
    assert!(
        agent
            .invoke(RunInput::resume(), RunContext::new("thread", "wrong-run"))
            .await
            .is_err()
    );
    let event = events.lock().unwrap()[0].clone();
    HookJournal::new(store)
        .reconcile(&bus, &rule, &event, HookDecision::Continue)
        .await
        .unwrap();
    let RunOutcome::Completed { state, .. } = agent
        .invoke(RunInput::resume(), RunContext::new("thread", "second-run"))
        .await
        .unwrap()
    else {
        panic!("completed")
    };
    assert_eq!(applied.load(Ordering::SeqCst), 1);
    assert_eq!(state.input_tokens, 3);
    assert_eq!(state.output_tokens, 2);
    assert_eq!(
        state.messages[0],
        Message::System {
            content: "original".into()
        }
    );
    assert_eq!(
        state.messages[2],
        Message::User {
            content: "second".into()
        }
    );
}
#[tokio::test]
async fn committed_context_is_not_recomputed_after_unknown_fact_handler() {
    let store = Arc::new(InMemoryCheckpointer::default());
    let applied = Arc::new(AtomicUsize::new(0));
    let events = Arc::new(Mutex::new(Vec::new()));
    let notify = Arc::new(tokio::sync::Notify::new());
    let rule = subscription(
        "after_compact",
        Arc::new(Gate {
            events: events.clone(),
            pause: false,
            block: Some(notify.clone()),
        }),
    );
    let bus = HookBus::new(EventCatalog::runtime(), vec![rule.clone()]).unwrap();
    let agent = Arc::new(
        Arc::unwrap_or_clone(agent(applied.clone(), false, store.clone())).with_hooks(bus.clone()),
    );
    agent
        .invoke(
            RunInput::new("first"),
            RunContext::new("thread", "first-run"),
        )
        .await
        .unwrap();
    let task = {
        let agent = agent.clone();
        tokio::spawn(async move {
            agent
                .invoke(
                    RunInput::new("second"),
                    RunContext::new("thread", "second-run"),
                )
                .await
        })
    };
    tokio::time::timeout(std::time::Duration::from_secs(2), notify.notified())
        .await
        .unwrap();
    task.abort();
    let _ = task.await;
    assert!(matches!(
        agent
            .invoke(RunInput::resume(), RunContext::new("thread", "second-run"))
            .await
            .unwrap(),
        RunOutcome::Paused { .. }
    ));
    let event = events.lock().unwrap()[0].clone();
    HookJournal::new(store)
        .reconcile(&bus, &rule, &event, HookDecision::Continue)
        .await
        .unwrap();
    assert!(matches!(
        agent
            .invoke(RunInput::resume(), RunContext::new("thread", "second-run"))
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(applied.load(Ordering::SeqCst), 1);
    assert_eq!(events.lock().unwrap().len(), 1);
}
#[tokio::test]
async fn context_policy_cannot_replace_system_or_current_turn() {
    let applied = Arc::new(AtomicUsize::new(0));
    let agent = agent(applied, true, Arc::new(InMemoryCheckpointer::default()));
    agent
        .invoke(
            RunInput::new("first"),
            RunContext::new("thread", "first-run"),
        )
        .await
        .unwrap();
    let error = agent
        .invoke(
            RunInput::new("second"),
            RunContext::new("thread", "second-run"),
        )
        .await
        .unwrap_err();
    assert!(error.to_string().contains("system prefix or current turn"));
}
