use nofy_agent_project::*;
use serde_json::json;
#[test]
fn configure_updates_actual_settings_atomically_and_preserves_literal_values() {
    let mut source = Source::empty("coder", "system").unwrap();
    source
        .put_json("project.json", &json!({"settings":"public/settings.json"}))
        .unwrap();
    source
        .put_json(
            "public/settings.json",
            &json!({"connection":{"endpoint":"original","limit":1}}),
        )
        .unwrap();
    source.settings_json =
        Some(json!({"connection":{"endpoint":"override","limit":2}}).to_string());
    source.refresh_manifest().unwrap();
    let literal = json!({"$file":"this-is-business-data"});
    edit(&mut source,"agent.configure",&json!({"agent":"coder","settings":{"connection":{"limit":3},"literal":literal},"set":{"/connection/endpoint":"updated","/flag":null}}),&FactoryKinds::new()).unwrap();
    assert!(source.settings_json.is_none());
    let settings = source.json("public/settings.json").unwrap();
    assert_eq!(
        settings,
        json!({"connection":{"endpoint":"updated","limit":3},"literal":literal,"flag":null})
    );
    let before = source.digest().unwrap();
    assert!(
        edit(
            &mut source,
            "agent.configure",
            &json!({"agent":"coder","set":{"":"invalid-root"}}),
            &FactoryKinds::new()
        )
        .is_err()
    );
    assert_eq!(source.digest().unwrap(), before);
    complete(&source).unwrap();
}
