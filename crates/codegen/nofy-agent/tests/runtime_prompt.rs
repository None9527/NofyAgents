use nofy_agent::runtime::prompt::*;
use nofy_agent_runtime::{Prompt, RunContext, registry::*};
use serde_json::json;
use std::{collections::BTreeMap, sync::Arc};

fn fragment(id: &str, content: FragmentContent) -> PromptFragment {
    PromptFragment {
        id: id.into(),
        content,
        source: PromptOrigin {
            kind: "test".into(),
            reference: id.into(),
            version: "v1".into(),
            location: None,
        },
    }
}
fn document() -> PromptDocument {
    PromptDocument {
        fragments: vec![
            fragment(
                "identity",
                FragmentContent::Template("You help {{ team }}. Tools: {{ tool_names }}".into()),
            ),
            fragment(
                "literal",
                FragmentContent::Literal("Keep {{ imported_literal }} exactly.".into()),
            ),
        ],
        variable_schema: json!({"type":"object","additionalProperties":false,"required":["team"],"properties":{"team":{"type":"string"}}}),
        values: json!({"team":"support"}),
        separator: "\n\n".into(),
    }
}
#[tokio::test]
async fn preview_and_runtime_share_schema_order_and_exact_tool_view_without_cwd() {
    let prompt = DocumentPrompt::new(document()).unwrap();
    let tools = vec!["lookup".into()];
    let preview = prompt.preview(&PromptVariables::default(), &tools).unwrap();
    assert_eq!(
        preview.text,
        "You help support. Tools: lookup\n\nKeep {{ imported_literal }} exactly."
    );
    assert_eq!(preview.fragments[1].source.reference, "literal");
    assert_eq!(
        &preview.text[preview.fragments[1].start_byte..preview.fragments[1].end_byte],
        preview.fragments[1].text
    );
    assert_eq!(
        prompt
            .render(&RunContext::new("thread", "run"), &tools)
            .await
            .unwrap(),
        preview.text
    );
    let mut ctx = RunContext::new("thread", "run");
    ctx.capabilities.insert(PromptVariables(BTreeMap::from([(
        "team".into(),
        json!("audit"),
    )])));
    assert!(prompt.render(&ctx, &tools).await.unwrap().contains("audit"));
    assert!(
        prompt
            .preview(
                &PromptVariables(BTreeMap::from([("tools".into(), json!(["secret_tool"]))])),
                &tools
            )
            .is_err()
    );
    assert!(
        prompt
            .preview(
                &PromptVariables(BTreeMap::from([("team".into(), json!(3))])),
                &tools
            )
            .is_err()
    );
    assert!(
        prompt
            .preview(
                &PromptVariables(BTreeMap::from([("extra".into(), json!("x"))])),
                &tools
            )
            .is_err()
    );
}
#[test]
fn published_prompt_versions_are_frozen_and_factory_validation_is_pure() {
    let mut registry = ModuleRegistry::default();
    registry
        .register_factory(Arc::new(DocumentPromptFactory))
        .unwrap();
    let original = document();
    registry
        .define(ModuleDefinition {
            reference: ModuleRef::new("support", "1"),
            factory: "prompt.document".into(),
            config: serde_json::to_value(&original).unwrap(),
            dependencies: BTreeMap::new(),
        })
        .unwrap();
    let mut revised = original.clone();
    revised.values = json!({"team":"sales"});
    registry
        .define(ModuleDefinition {
            reference: ModuleRef::new("support", "2"),
            factory: "prompt.document".into(),
            config: serde_json::to_value(revised).unwrap(),
            dependencies: BTreeMap::new(),
        })
        .unwrap();
    let resolved = registry
        .resolve(&[
            ModuleRef::new("support", "1"),
            ModuleRef::new("support", "2"),
        ])
        .unwrap();
    assert_eq!(resolved.snapshot.len(), 2);
    assert_eq!(
        resolved.snapshot[0].definition.config["values"]["team"],
        "support"
    );
    let mut invalid = original;
    invalid.fragments[0].content = FragmentContent::Template("{{ unknown }}".into());
    assert!(
        DocumentPrompt::new(invalid)
            .unwrap()
            .preview(&PromptVariables::default(), &[])
            .is_err()
    );
    let mut invalid = document();
    invalid.variable_schema = json!({"$ref":"file:///tmp/schema"});
    assert!(DocumentPrompt::new(invalid).is_err());
    let mut invalid = document();
    invalid.fragments[1].id = "identity".into();
    assert!(DocumentPrompt::new(invalid).is_err());
    assert!(
        DocumentPromptFactory
            .build(
                &json!({"fragments":[],"variable_schema":{},"unknown":true}),
                &BTreeMap::new()
            )
            .is_err()
    );
}
#[test]
fn template_execution_is_bounded_and_imports_have_no_loader() {
    let mut config = document();
    config.fragments = vec![fragment(
        "bounded",
        FragmentContent::Template("{% for i in range(1000000) %}{{ i }}{% endfor %}".into()),
    )];
    assert!(
        DocumentPrompt::new(config)
            .unwrap()
            .preview(&PromptVariables::default(), &[])
            .is_err()
    );
    let mut config = document();
    config.fragments = vec![fragment(
        "no-files",
        FragmentContent::Template("{% include '/etc/passwd' %}".into()),
    )];
    assert!(
        DocumentPrompt::new(config)
            .unwrap()
            .preview(&PromptVariables::default(), &[])
            .is_err()
    );
}
