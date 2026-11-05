use nofy_agent_runtime::{policy::*, registry::*, *};
use serde_json::{Value, json};
use std::sync::Arc;
fn call(command: Value) -> ToolCall {
    ToolCall {
        id: "call".into(),
        name: "execute".into(),
        arguments: json!({"command":command}),
    }
}
#[test]
fn command_analysis_preserves_quoted_words_segments_and_unknown_interpretation() {
    let analyze = |value| command::analyze_command(&value).unwrap();
    let normal = analyze(json!("git status --short && printf '%s' 'literal $value'"));
    assert!(!normal.dynamic);
    assert_eq!(
        normal.commands,
        json!([
            ["git", "status", "--short"],
            ["printf", "%s", "literal $value"]
        ])
        .as_array()
        .unwrap()
        .iter()
        .map(|v| v
            .as_array()
            .unwrap()
            .iter()
            .map(|s| s.as_str().unwrap().to_string())
            .collect::<Vec<_>>())
        .collect::<Vec<_>>()
    );
    let shell = analyze(json!([
        "/bin/bash",
        "--noprofile",
        "--norc",
        "-lc",
        "git status | cat"
    ]));
    assert!(!shell.dynamic);
    assert_eq!(shell.commands.len(), 2);
    for text in [
        "git status > result",
        "git $(whoami)",
        "PATH=/tmp git status",
        "env MODE=x git status",
        "git 'unclosed",
    ] {
        assert!(analyze(json!(text)).dynamic, "{text}");
    }
    assert!(analyze(json!(["/bin/bash", "-c", "git status", "extra"])).dynamic);
    assert!(!analyze(json!(["printf", "$HOME", "literal;argument"])).dynamic);
}
#[tokio::test]
async fn deny_wins_prefix_grants_cover_every_segment_and_dynamic_commands_fail_closed() {
    let factory = ToolRulesFactory;
    let value = json!({"default":"deny","unknown_command":"deny","rules":[
        {"id":"read-status","action":"allow","tools":["execute"],"command":{"pointer":"/command","prefixes":[["git","status"],["printf"]]}},
        {"id":"deny-delete","category":"filesystem.write","action":"deny","tools":["execute"],"command":{"pointer":"/command","prefixes":[["rm"]]}}
    ]});
    assert!(factory.config_dependencies(&value).unwrap().is_empty());
    let ModuleInstance::Policy(policy) = factory.build(&value, &Default::default()).unwrap() else {
        panic!("policy")
    };
    for value in [
        json!("git status --short"),
        json!("git status && printf 'done'"),
        json!(["git", "status"]),
    ] {
        assert_eq!(
            policy
                .admit(&call(value), &RunState::default(), &RunContext::default())
                .await
                .unwrap(),
            Admission::Allow
        );
    }
    for value in [
        json!("git status; rm -rf work"),
        json!("git status > file"),
        json!("rm $TARGET"),
        json!("git status && curl example.com"),
        json!(["env", "X=y", "git", "status"]),
    ] {
        assert!(
            matches!(
                policy
                    .admit(
                        &call(value.clone()),
                        &RunState::default(),
                        &RunContext::default()
                    )
                    .await
                    .unwrap(),
                Admission::Deny(_)
            ),
            "{value}"
        );
    }
    let deps = std::collections::BTreeMap::from([(
        "approval".into(),
        ModuleInstance::Policy(Arc::new(AllowTools)),
    )]);
    let scoped = json!({"default":"ask","rules":[{"id":"blocked","action":"deny","tools":["execute"],"arguments_schema":{"type":"object","properties":{"command":{"const":"blocked"}},"required":["command"]}}]});
    let ModuleInstance::Policy(policy) = factory.build(&scoped, &deps).unwrap() else {
        panic!("policy")
    };
    assert_eq!(
        policy
            .admit(
                &call(json!("permitted by explicit approval delegate")),
                &Default::default(),
                &Default::default()
            )
            .await
            .unwrap(),
        Admission::Allow
    );
    assert!(matches!(
        policy
            .admit(
                &call(json!("blocked")),
                &Default::default(),
                &Default::default()
            )
            .await
            .unwrap(),
        Admission::Deny(_)
    ));
}
