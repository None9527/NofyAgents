use nofy_agent_runtime::{policy::OnToolsFactory, registry::*, *};
use serde_json::{Value, json};
use std::{
    collections::BTreeMap,
    sync::{Arc, Mutex},
};

struct Observe {
    result: Option<Admission>,
    calls: Arc<Mutex<Vec<(String, String, usize)>>>,
}
#[async_trait::async_trait]
impl Policy for Observe {
    async fn admit(
        &self,
        call: &ToolCall,
        state: &RunState,
        context: &RunContext,
    ) -> Result<Admission, Error> {
        self.calls.lock().unwrap().push((
            call.id.clone(),
            context.run_id.clone(),
            state.messages.len(),
        ));
        self.result
            .clone()
            .ok_or_else(|| Error::Checkpoint("policy unavailable".into()))
    }
}
type Calls = Arc<Mutex<Vec<(String, String, usize)>>>;

fn build(result: Option<Admission>) -> (Arc<dyn Policy>, Calls) {
    let calls = Arc::new(Mutex::new(Vec::new()));
    let inner = ModuleInstance::Policy(Arc::new(Observe {
        result,
        calls: calls.clone(),
    }));
    let ModuleInstance::Policy(policy) = OnToolsFactory
        .build(
            &json!({"tools":["mutate"]}),
            &[("policy".into(), inner)].into(),
        )
        .unwrap()
    else {
        panic!("policy");
    };
    (policy, calls)
}
fn call(name: &str) -> ToolCall {
    ToolCall {
        id: "same-call".into(),
        name: name.into(),
        arguments: json!({}),
    }
}

#[tokio::test]
async fn selection_preserves_admissions_errors_and_context_and_does_not_call_unmatched_policy() {
    for response in [
        Some(Admission::Allow),
        Some(Admission::Deny("no".into())),
        Some(Admission::Pause(json!({"request":"approval"}))),
        None,
    ] {
        let (policy, calls) = build(response.clone());
        let state = RunState::default();
        let context = RunContext::new("thread", "run");
        assert_eq!(
            policy
                .admit(&call("inspect"), &state, &context)
                .await
                .unwrap(),
            Admission::Allow
        );
        assert!(calls.lock().unwrap().is_empty());
        let actual = policy.admit(&call("mutate"), &state, &context).await;
        match response {
            Some(expected) => assert_eq!(actual.unwrap(), expected),
            None => assert!(
                actual
                    .unwrap_err()
                    .to_string()
                    .contains("policy unavailable")
            ),
        }
        assert_eq!(
            *calls.lock().unwrap(),
            vec![("same-call".into(), "run".into(), 0)]
        );
    }
}

#[test]
fn factory_has_one_typed_dependency_and_rejects_ambiguous_selection() {
    let mut registry = ModuleRegistry::default();
    registry.register_factory(Arc::new(OnToolsFactory)).unwrap();
    let valid = json!({"tools":["mutate"]});
    assert_eq!(
        registry
            .required_dependencies("policy.on_tools", &valid)
            .unwrap(),
        BTreeMap::from([("policy".into(), ModuleKind::Policy)])
    );
    for invalid in [
        json!({"tools":[]}),
        json!({"tools":["mutate","mutate"]}),
        json!({"tools":["bad name"]}),
        json!({"tools":["mutate"],"unknown":true}),
        json!({"tools":(0..129).map(|n|format!("tool{n}")).collect::<Vec<_>>()}),
        json!({"tools":[Value::Null]}),
    ] {
        let policy = ModuleInstance::Policy(Arc::new(policy::AllowTools));
        assert!(
            OnToolsFactory
                .build(&invalid, &[("policy".into(), policy)].into())
                .is_err(),
            "{invalid}"
        );
    }
    assert!(OnToolsFactory.build(&valid, &BTreeMap::new()).is_err());
    assert!(
        OnToolsFactory
            .build(
                &valid,
                &[(
                    "policy".into(),
                    ModuleInstance::ToolPack(ToolCatalog::new())
                )]
                .into()
            )
            .is_err()
    );
}
