#![cfg(feature = "agent-runtime")]
use nofy_agent_runtime::{compile::*, context_policy::ContextPolicy, registry::*, *};
use nofy_compaction::runtime::*;
use serde_json::json;
use std::{
    collections::BTreeMap,
    sync::{Arc, Mutex},
};

struct Summary(Arc<Mutex<Vec<ModelRequest>>>);

#[tokio::test]
async fn native_compactor_failure_survives_reopen_and_recovers_only_on_explicit_model_command() {
    use nofy_agent_runtime::governance::*;
    use std::sync::atomic::{AtomicUsize, Ordering};
    struct Conversation;
    #[async_trait::async_trait]
    impl Model for Conversation {
        async fn complete(
            &self,
            request: ModelRequest,
            _: &RunContext,
        ) -> Result<ModelResponse, Error> {
            let second = request
                .messages
                .iter()
                .any(|message| matches!(message, Message::User { content } if content == "second"));
            Ok(ModelResponse {
                output: if second {
                    "final".into()
                } else {
                    "old answer ".repeat(2000)
                },
                ..Default::default()
            })
        }
    }
    struct RecoveringSummary(Arc<AtomicUsize>);
    #[async_trait::async_trait]
    impl Model for RecoveringSummary {
        async fn complete(&self, _: ModelRequest, _: &RunContext) -> Result<ModelResponse, Error> {
            if self.0.fetch_add(1, Ordering::SeqCst) == 0 {
                return Err(model::ModelFailure {
                    category: "auth".into(),
                    message: "known failure".into(),
                    status: Some(401),
                    retryable: false,
                    retry_after_ms: None,
                    code: None,
                    details: serde_json::Value::Null,
                }
                .into());
            }
            Ok(ModelResponse {
                output: "summary fact ".repeat(70),
                input_tokens: 11,
                output_tokens: 7,
                ..Default::default()
            })
        }
    }
    for mode in [CompactionMode::FullReplace, CompactionMode::TailKeep] {
        let calls = Arc::new(AtomicUsize::new(0));
        let policy = CompactionPolicy::new(
            ContextConfig {
                mode,
                context_window: 1000,
                keep_tokens: 32,
                min_compactable: 1,
                ..Default::default()
            },
            Arc::new(RecoveringSummary(calls.clone())),
            Arc::new(BytesTokenCounter),
        )
        .unwrap();
        let ledger = Arc::new(InMemoryBudgetStore::default());
        let profile = Arc::new(
            GovernanceProfile::new(
                Arc::new(
                    InstalledBudget::install(
                        ledger.clone(),
                        BudgetLimits {
                            max_model_calls: Some(3),
                            ..Default::default()
                        },
                        "compact-retry@1",
                        1,
                    )
                    .unwrap(),
                ),
                BudgetLimits::default(),
                ModelRetryPolicy::default(),
            )
            .unwrap(),
        );
        let checkpoint = Arc::new(InMemoryCheckpointer::default());
        let mut components = Components::default();
        components
            .models
            .insert("model".into(), Arc::new(Conversation));
        components
            .prompts
            .insert("prompt".into(), Arc::new(StaticPrompt("system".into())));
        let bare = AgentBuilder::new("compactor-recovery")
            .model("model")
            .prompt("prompt")
            .compile(&components)
            .unwrap()
            .with_context_policy("compaction@1", Arc::new(policy))
            .unwrap()
            .with_governance(profile.clone());
        let agent = bare.clone().with_checkpointer(checkpoint.clone());
        agent
            .invoke(
                RunInput::new("old conversation ".repeat(2000)),
                RunContext::new("thread", "first"),
            )
            .await
            .unwrap();
        assert!(matches!(
            agent
                .invoke(RunInput::new("second"), RunContext::new("thread", "second"))
                .await,
            Err(Error::Model(_))
        ));
        let command = ModelRetryCommand {
            command_id: "retry-compaction".into(),
            ticket: agent
                .model_retry_ticket("thread", "second")
                .await
                .unwrap()
                .unwrap(),
        };
        assert!(command.ticket.operation_scope.is_some());
        drop(agent);
        let agent = bare.with_checkpointer(checkpoint);
        assert!(matches!(
            agent
                .invoke(RunInput::resume(), RunContext::new("thread", "second"))
                .await,
            Err(Error::Model(_))
        ));
        assert_eq!(calls.load(Ordering::SeqCst), 1);
        let RunOutcome::Completed { output, state } = agent
            .invoke(
                RunInput::retry_model(command),
                RunContext::new("thread", "second"),
            )
            .await
            .unwrap()
        else {
            panic!("not completed")
        };
        assert_eq!(output, "final");
        assert_eq!(calls.load(Ordering::SeqCst), 2);
        assert!(
            state
                .messages
                .iter()
                .any(|message| matches!(message, Message::User { content } if content == "second"))
        );
        assert!(state.context_progress.pending.is_none());
        let summary = ledger
            .inspect(&BudgetScope {
                root_run_id: "second".into(),
                identity: profile.identity().into(),
            })
            .await
            .unwrap()
            .unwrap();
        assert_eq!(summary.used.model_calls, 3);
    }
}
#[async_trait::async_trait]
impl Model for Summary {
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        self.0.lock().unwrap().push(request);
        Ok(ModelResponse {
            output: "summary fact ".repeat(70),
            input_tokens: 11,
            output_tokens: 7,
            ..Default::default()
        })
    }
}
fn state() -> RunState {
    let call = |id: &str| ToolCall {
        id: id.into(),
        name: "lookup".into(),
        arguments: json!({}),
    };
    let mut state = RunState {
        messages: vec![
            Message::System {
                content: "stable system".into(),
            },
            Message::User {
                content: "old conversation ".repeat(2000),
            },
            Message::Assistant {
                content: String::new(),
                tool_calls: vec![call("old")],
            },
            Message::Tool {
                call_id: "old".into(),
                content: json!({"result":"old result".repeat(2000)}),
                is_error: false,
            },
            Message::Assistant {
                content: "old answer ".repeat(1000),
                tool_calls: vec![],
            },
            Message::User {
                content: "current input".into(),
            },
            Message::Assistant {
                content: String::new(),
                tool_calls: vec![call("current")],
            },
            Message::Tool {
                call_id: "current".into(),
                content: json!({"result":"keep exact"}),
                is_error: false,
            },
        ],
        ..Default::default()
    };
    state.hook_progress.input_start_index = Some(5);
    state
}
#[tokio::test]
async fn both_modes_reuse_existing_algorithms_and_preserve_current_pairs_and_prefix() {
    for mode in [CompactionMode::FullReplace, CompactionMode::TailKeep] {
        let requests = Arc::new(Mutex::new(Vec::new()));
        let policy = CompactionPolicy::new(
            ContextConfig {
                mode,
                context_window: 1000,
                keep_tokens: 32,
                min_compactable: 1,
                ..Default::default()
            },
            Arc::new(Summary(requests.clone())),
            Arc::new(BytesTokenCounter),
        )
        .unwrap();
        let state = state();
        let ctx = RunContext::new("thread", "run");
        let plan = policy.plan(&state, &ctx).await.unwrap().unwrap();
        let update = policy.apply(&state, &plan, &ctx).await.unwrap();
        assert_eq!(update.messages[0], state.messages[0]);
        let tail_len = state.messages.len() - update.retained_from;
        assert_eq!(
            &update.messages[update.retained_at..update.retained_at + tail_len],
            &state.messages[update.retained_from..]
        );
        assert!(update.retained_from <= 5);
        assert_eq!((update.input_tokens, update.output_tokens), (11, 7));
        assert!(requests.lock().unwrap()[0].tools.is_empty());
        assert!(
            requests.lock().unwrap()[0].messages.iter().any(
                |message| matches!(message, Message::Tool { call_id, .. } if call_id == "old")
            )
        );
        assert!(!requests.lock().unwrap()[0].messages.iter().any(
            |message| matches!(message, Message::Tool { call_id, .. } if call_id == "current")
        ));
        let mut changed = state;
        changed.messages.push(Message::User {
            content: "changed".into(),
        });
        assert!(policy.apply(&changed, &plan, &ctx).await.is_err());
    }
}
#[tokio::test]
async fn opaque_history_is_preserved_or_explicitly_rejected_by_selected_policy() {
    let mut state = state();
    state.messages[2] = Message::Opaque {
        provider: "native".into(),
        value: json!({"request":"opaque prefix must reach summarizer exactly"}),
    };
    let requests = Arc::new(Mutex::new(Vec::new()));
    let full = CompactionPolicy::new(
        ContextConfig {
            context_window: 100,
            min_compactable: 1,
            ..Default::default()
        },
        Arc::new(Summary(requests.clone())),
        Arc::new(BytesTokenCounter),
    )
    .unwrap();
    let ctx = RunContext::new("thread", "run");
    let plan = full.plan(&state, &ctx).await.unwrap().unwrap();
    full.apply(&state, &plan, &ctx).await.unwrap();
    assert_eq!(requests.lock().unwrap()[0].messages[2], state.messages[2]);
    let tail = CompactionPolicy::new(
        ContextConfig {
            mode: CompactionMode::TailKeep,
            context_window: 100,
            min_compactable: 1,
            ..Default::default()
        },
        Arc::new(Summary(Arc::default())),
        Arc::new(BytesTokenCounter),
    )
    .unwrap();
    assert!(
        tail.plan(&state, &ctx)
            .await
            .unwrap_err()
            .to_string()
            .contains("typed message view")
    );
}
#[test]
fn configuration_compiles_context_policy_as_a_versioned_module_dependency() {
    let mut registry = ModuleRegistry::default();
    registry
        .register_factory(Arc::new(InstanceFactory::new(
            "native.model",
            "1",
            ModuleInstance::Model(Arc::new(Summary(Arc::default()))),
        )))
        .unwrap();
    registry
        .register_factory(Arc::new(InstanceFactory::new(
            "native.prompt",
            "1",
            ModuleInstance::Prompt(Arc::new(StaticPrompt("system".into()))),
        )))
        .unwrap();
    registry
        .register_factory(Arc::new(CompactionFactory::bytes_estimate()))
        .unwrap();
    for (id, factory, config, dependencies) in [
        ("model", "native.model", json!({}), BTreeMap::new()),
        ("prompt", "native.prompt", json!({}), BTreeMap::new()),
        (
            "compact",
            "context.compaction",
            json!({"context_window":4096}),
            BTreeMap::from([("model".into(), ModuleRef::new("model", "1"))]),
        ),
    ] {
        registry
            .define(ModuleDefinition {
                reference: ModuleRef::new(id, "1"),
                factory: factory.into(),
                config,
                dependencies,
            })
            .unwrap();
    }
    let definition: AgentDefinition = serde_json::from_value(json!({"name":"compact-agent","model":{"id":"model","version":"1"},"prompt":{"id":"prompt","version":"1"},"context_policies":[{"id":"compact","version":"1"}]})).unwrap();
    let compiled = compile_agent(definition, &registry).unwrap();
    assert_eq!(compiled.snapshot.modules.len(), 3);
    assert!(compiled.snapshot.restore(&registry).is_ok());
}

struct LongAnswer(Arc<std::sync::atomic::AtomicUsize>);
#[async_trait::async_trait]
impl Model for LongAnswer {
    async fn complete(&self, _: ModelRequest, _: &RunContext) -> Result<ModelResponse, Error> {
        self.0.fetch_add(1, std::sync::atomic::Ordering::SeqCst);
        Ok(ModelResponse {
            output: "old answer ".repeat(1000),
            ..Default::default()
        })
    }
}
struct RetrySummary {
    calls: Arc<std::sync::atomic::AtomicUsize>,
    fail_once: bool,
}
#[async_trait::async_trait]
impl Model for RetrySummary {
    async fn complete(&self, _: ModelRequest, _: &RunContext) -> Result<ModelResponse, Error> {
        if self.calls.fetch_add(1, std::sync::atomic::Ordering::SeqCst) == 0 && self.fail_once {
            return Err(model::ModelFailure {
                category: "transport".into(),
                message: "retry once".into(),
                status: Some(503),
                retryable: true,
                retry_after_ms: None,
                code: None,
                details: serde_json::Value::Null,
            }
            .into());
        }
        Ok(ModelResponse {
            output: "summary fact ".repeat(70),
            input_tokens: 11,
            output_tokens: 7,
            ..Default::default()
        })
    }
}
#[tokio::test]
async fn compaction_shares_the_root_model_budget_and_transport_retry_owner() {
    use nofy_agent_runtime::governance::*;
    use std::sync::atomic::{AtomicUsize, Ordering};
    for retry in [false, true] {
        let ledger = Arc::new(InMemoryBudgetStore::default());
        let primary_calls = Arc::new(AtomicUsize::new(0));
        let summary_calls = Arc::new(AtomicUsize::new(0));
        let attempts = if retry { 2 } else { 1 };
        let profile = Arc::new(
            GovernanceProfile::new(
                Arc::new(
                    InstalledBudget::install(
                        ledger.clone(),
                        BudgetLimits {
                            max_model_calls: Some(attempts),
                            ..Default::default()
                        },
                        "host-1",
                        2,
                    )
                    .unwrap(),
                ),
                BudgetLimits::default(),
                ModelRetryPolicy {
                    max_attempts: 2,
                    base_delay_ms: 0,
                    max_delay_ms: 0,
                },
            )
            .unwrap(),
        );
        let mut components = Components::default();
        components
            .models
            .insert("main".into(), Arc::new(LongAnswer(primary_calls.clone())));
        components.prompts.insert(
            "prompt".into(),
            Arc::new(StaticPrompt("stable system".into())),
        );
        let policy = CompactionPolicy::new(
            ContextConfig {
                context_window: 1000,
                min_compactable: 1,
                max_attempts: 5,
                ..Default::default()
            },
            Arc::new(RetrySummary {
                calls: summary_calls.clone(),
                fail_once: retry,
            }),
            Arc::new(BytesTokenCounter),
        )
        .unwrap();
        let agent = AgentBuilder::new("compact-budget")
            .model("main")
            .prompt("prompt")
            .compile(&components)
            .unwrap()
            .with_checkpointer(Arc::new(InMemoryCheckpointer::default()))
            .with_context_policy("compact-1", Arc::new(policy))
            .unwrap()
            .with_governance(profile.clone());
        assert!(matches!(
            agent
                .invoke(
                    RunInput::new("old input ".repeat(2000)),
                    RunContext::new("thread", "old-run")
                )
                .await
                .unwrap(),
            RunOutcome::Completed { .. }
        ));
        assert!(
            matches!(agent.invoke(RunInput::new("current input"), RunContext::new("thread", "new-run")).await.unwrap(), RunOutcome::BudgetExceeded {state} if state.context_progress.pending.is_none() && state.input_tokens==11)
        );
        assert_eq!(primary_calls.load(Ordering::SeqCst), 1);
        assert_eq!(summary_calls.load(Ordering::SeqCst), attempts as usize);
        let scope = BudgetScope {
            root_run_id: "new-run".into(),
            identity: profile.identity().into(),
        };
        let summary = ledger.inspect(&scope).await.unwrap().unwrap();
        assert_eq!(summary.used.model_calls, attempts);
        assert_eq!(summary.used.input_tokens, 11);
        assert_eq!(summary.active_operations, 0);
    }
}
