use super::*;
use nofy_agent_modules::scope_program::Program;
use nofy_agent_runtime::artifact::ArtifactBundle;

pub(super) fn text() -> &'static str {
    include_str!(concat!(
        env!("CARGO_MANIFEST_DIR"),
        "/../../../presets/coding/modules/scopes/scope.rhai"
    ))
}
fn schema() -> &'static str {
    include_str!(concat!(
        env!("CARGO_MANIFEST_DIR"),
        "/../../../presets/coding/modules/scopes/parameters.schema.json"
    ))
}
fn parameters() -> Value {
    json!({"grants":{
        "workspace-read":{"tools":["inspect","lookup"],"path":{"argument":"file_path","glob":"src/**"}},
        "version-control":{"tools":["terminal"],"argv_prefix":{"argument":"argv","prefix":["git"]}},
        "issues":{"tools":["github__issue"]},"custom":{"tools":["custom"]},
        "inspect-only":{"tools":["inspect"]}
    }})
}
pub(super) fn resolved(source: &str) -> Program {
    let bundle = ArtifactBundle {
        schema_version: 1,
        files: std::collections::BTreeMap::from([
            ("scope.rhai".into(), source.into()),
            ("parameters.json".into(), schema().into()),
        ]),
    };
    serde_json::from_value(
        json!({"source":source,"artifact_digest":bundle.digest().unwrap(),
        "cwd":"/declared/workspace","parameters":parameters(),"limits":{}}),
    )
    .unwrap()
}
pub(super) fn busy() -> Program {
    let mut value = serde_json::to_value(resolved("fn scope(input) { loop {} }")).unwrap();
    value["limits"]["max_operations"] = json!(10_000_000);
    value["limits"]["timeout_ms"] = json!(5000);
    serde_json::from_value(value).unwrap()
}
pub(super) fn attach(system: &mut Value, source: &str) {
    let skills = system["modules"]
        .as_array_mut()
        .unwrap()
        .iter_mut()
        .find(|m| m["reference"]["id"] == "skills")
        .unwrap();
    skills["factory"] = json!("tool.skills_scoped");
    skills["config"]["scope"] = json!("scope");
    skills["dependencies"]["scope"] = json!({"id":"scope","version":"1"});
    let modules = system["modules"].as_array_mut().unwrap();
    modules.push(json!({"reference":{"id":"scope-code","version":"1"},"factory":"resource.artifact",
        "config":{"bundle":{"schema_version":1,"files":{"scope.rhai":source,"parameters.json":schema()}}}}));
    modules.push(json!({"reference":{"id":"scope","version":"1"},"factory":"resource.scope_program",
        "dependencies":{"artifact":{"id":"scope-code","version":"1"}},
        "config":{"source":{"kind":"artifact","entries":["scope.rhai"],"parameters_schema":"parameters.json"},
            "cwd":"/declared/workspace","parameters":parameters()}}));
}
