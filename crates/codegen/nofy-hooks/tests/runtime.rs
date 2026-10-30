#![cfg(feature = "agent-runtime")]
use nofy_agent_runtime::{RunContext, hooks::*};
use nofy_hooks::{discovery::load_hooks, runtime::LegacyDispatcher, trust::DisabledHooks};
use serde_json::json;
use std::sync::Arc;

#[tokio::test]
async fn public_agent_hook_calls_the_original_command_matcher_and_disable_policy() {
    let root = tempfile::tempdir().unwrap();
    std::fs::write(root.path().join("deny.json"),r#"{"hooks":{"PreToolUse":[{"matcher":"Read","hooks":[{"type":"command","command":"printf '{\"decision\":\"deny\",\"reason\":\"legacy read denied\"}'"}]}]}}"#).unwrap();
    let (registry, errors) = load_hooks(Some(root.path()), None);
    assert!(errors.is_empty(), "{errors:?}");
    let name = registry.all_hooks()[0].name.clone();
    for disabled in [false, true] {
        let handler = Arc::new(
            LegacyDispatcher::new(
                registry.clone(),
                Arc::new(DisabledHooks::new(
                    if disabled { vec![name.clone()] } else { vec![] },
                    false,
                )),
                root.path().to_path_buf(),
            )
            .unwrap(),
        );
        let subscription = Arc::new(
            HookRegistration::new(
                "legacy-v1".into(),
                EventCatalog::runtime().get("before_tool").unwrap().clone(),
                HookRule {
                    event: "before_tool".into(),
                    priority: 0,
                    timeout_ms: 2000,
                    failure: FailurePolicy::Closed,
                    matches: None,
                },
                handler,
            )
            .unwrap(),
        );
        let bus = HookBus::new(EventCatalog::runtime(), vec![subscription]).unwrap();
        let result=tokio::spawn(async move{bus.emit(&runtime_owner(),"before_tool","call",json!({"call":{"id":"call-1","name":"use_tool","arguments":{"tool_name":"read_file","tool_input":{"file_path":"secret.txt"}}}}),&RunContext::new("thread","run")).await}).await.unwrap().unwrap();
        assert_eq!(
            matches!(result.control, HookDecision::Deny { .. }),
            !disabled
        );
    }
}

struct Reply;
#[async_trait::async_trait]
impl nofy_agent_runtime::Model for Reply {
    async fn complete(
        &self,
        _: nofy_agent_runtime::ModelRequest,
        _: &RunContext,
    ) -> Result<nofy_agent_runtime::ModelResponse, nofy_agent_runtime::Error> {
        Ok(nofy_agent_runtime::ModelResponse {
            output: "done".into(),
            ..Default::default()
        })
    }
}
#[tokio::test]
async fn legacy_batch_charges_each_actual_runner_and_cannot_fail_open_over_budget() {
    use nofy_agent_runtime::{governance::*, *};
    for limit in [1, 2] {
        let root = tempfile::tempdir().unwrap();
        let first = root.path().join("first");
        let second = root.path().join("second");
        let source = json!({"hooks":{"SessionStart":[{"hooks":[
            {"type":"command","command":format!("printf first > {:?}", first.to_string_lossy())},
            {"type":"command","command":format!("printf second > {:?}", second.to_string_lossy())}
        ]}]}});
        std::fs::write(root.path().join("start.json"), source.to_string()).unwrap();
        let (registry, errors) = load_hooks(Some(root.path()), None);
        assert!(errors.is_empty(), "{errors:?}");
        let handler = Arc::new(
            LegacyDispatcher::new(
                registry,
                Arc::new(DisabledHooks::new(vec![], false)),
                root.path().to_path_buf(),
            )
            .unwrap(),
        );
        let rule = Arc::new(
            HookRegistration::new(
                "legacy-budget-1".into(),
                EventCatalog::runtime()
                    .get("session_start")
                    .unwrap()
                    .clone(),
                HookRule {
                    event: "session_start".into(),
                    priority: 0,
                    timeout_ms: 2000,
                    failure: FailurePolicy::Open,
                    matches: None,
                },
                handler,
            )
            .unwrap(),
        );
        let bus = HookBus::new(EventCatalog::runtime(), vec![rule]).unwrap();
        let ledger = Arc::new(InMemoryBudgetStore::default());
        let profile = Arc::new(
            GovernanceProfile::new(
                Arc::new(
                    InstalledBudget::install(
                        ledger.clone(),
                        BudgetLimits {
                            max_tool_calls: Some(limit),
                            ..Default::default()
                        },
                        "host-1",
                        1,
                    )
                    .unwrap(),
                ),
                BudgetLimits::default(),
                ModelRetryPolicy::default(),
            )
            .unwrap(),
        );
        let mut components = Components::default();
        components.models.insert("m".into(), Arc::new(Reply));
        components
            .prompts
            .insert("p".into(), Arc::new(StaticPrompt("test".into())));
        let agent = AgentBuilder::new("legacy-budget")
            .model("m")
            .prompt("p")
            .compile(&components)
            .unwrap()
            .with_hooks(bus)
            .with_governance(profile.clone());
        let outcome = agent
            .invoke(RunInput::new("go"), RunContext::new("thread", "run"))
            .await
            .unwrap();
        assert!(if limit == 1 {
            matches!(outcome, RunOutcome::BudgetExceeded { .. })
        } else {
            matches!(outcome, RunOutcome::Completed { .. })
        });
        assert!(first.exists());
        assert_eq!(second.exists(), limit == 2);
        let summary = ledger
            .inspect(&BudgetScope {
                root_run_id: "run".into(),
                identity: profile.identity().into(),
            })
            .await
            .unwrap()
            .unwrap();
        assert_eq!(summary.used.tool_calls, limit);
    }
}
