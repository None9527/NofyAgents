#![cfg(feature = "pack")]
use nofy_agent_runtime::pack::*;
use nofy_agent_runtime::*;
use serde_json::{Value, json};
use std::sync::{
    Arc, Mutex,
    atomic::{AtomicUsize, Ordering},
};
#[derive(Default)]
struct Route(Mutex<Vec<ModelRequest>>);
#[async_trait::async_trait]
impl Model for Route {
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        self.0.lock().unwrap().push(request.clone());
        Ok(match request.messages.last() {
            Some(Message::Tool { content, .. }) => ModelResponse {
                output: content.to_string(),
                ..Default::default()
            },
            _ => ModelResponse {
                tool_calls: vec![ToolCall {
                    id: "delegate".into(),
                    name: "child".into(),
                    arguments: json!({"prompt":"check"}),
                }],
                ..Default::default()
            },
        })
    }
}
struct RealmModel;
#[async_trait::async_trait]
impl Model for RealmModel {
    async fn complete(&self, _: ModelRequest, ctx: &RunContext) -> Result<ModelResponse, Error> {
        let services = ctx.capabilities.get::<PackServices>().unwrap();
        Ok(ModelResponse {
            output: format!(
                "{}:{}",
                services.realm,
                *services.get::<String>("index").unwrap()
            ),
            ..Default::default()
        })
    }
}
struct Source(AtomicUsize);
#[async_trait::async_trait]
impl ToolSource for Source {
    async fn snapshot(&self, _: &RunContext) -> Result<ToolSnapshot, Error> {
        self.0.fetch_add(1, Ordering::SeqCst);
        Ok(ToolSnapshot {
            revision: "connected-1".into(),
            catalog: ToolCatalog::new(),
        })
    }
}
fn manifest(value: Value) -> nofy_packcore::PackManifest {
    nofy_packcore::parse_pack(&value).unwrap()
}
fn service(value: &str) -> ServiceBinding {
    ServiceBinding {
        revision: "v1".into(),
        value: Arc::new(value.to_owned()),
    }
}
fn bindings() -> PackBindings {
    PackBindings {
        default_model: "route".into(),
        ..Default::default()
    }
}

#[tokio::test]
async fn full_manifest_selects_model_skill_policy_mcp_child_and_isolated_services() {
    let route = Arc::new(Route::default());
    let source = Arc::new(Source(AtomicUsize::new(0)));
    let mut c = Components::default();
    c.models.insert("route".into(), route.clone());
    c.models.insert("realm".into(), Arc::new(RealmModel));
    c.policies.insert(
        "strict".into(),
        Arc::new(nofy_agent_runtime::policy::AllowTools),
    );
    c.tool_sources.insert("connection".into(), source.clone());
    let mut child_bindings = bindings();
    child_bindings.services.insert(
        ("child-pack".into(), "index".into()),
        service("child-private"),
    );
    let child=compile(&manifest(json!({"id":"child-pack","persona":"child","model_route":"realm","services":[{"name":"index"}]})),&c,&child_bindings).unwrap();
    let mut b = bindings();
    b.default_model = "missing-default".into();
    b.skills.insert(
        "research".into(),
        Arc::new(StaticPrompt("bound skill".into())),
    );
    b.mcp.insert(
        "warehouse".into(),
        McpBinding {
            transport: "stdio".into(),
            source: "connection".into(),
        },
    );
    b.subagents.insert(("child".into(), "local".into()), child);
    b.services
        .insert(("parent".into(), "index".into()), service("parent-private"));
    let pack = manifest(
        json!({"id":"parent","persona":"pack persona","skills":["research"],"model_route":"route","tool_policy":"strict",
        "mcp":[{"name":"warehouse","transport":"stdio"}],"subagents":[{"id":"child","provider":"local"}],"services":[{"name":"index"}]}),
    );
    let agent = compile(&pack, &c, &b).unwrap();
    let outcome = agent
        .invoke(RunInput::new("go"), RunContext::new("thread", "run"))
        .await
        .unwrap();
    assert!(
        matches!(outcome,RunOutcome::Completed{output,..} if output.contains("child-pack:child-private")&&!output.contains("parent-private"))
    );
    assert_eq!(source.0.load(Ordering::SeqCst), 1);
    let requests = route.0.lock().unwrap();
    assert!(
        matches!(&requests[0].messages[0],Message::System{content} if content=="pack persona\n\nbound skill")
    );
    assert_eq!(requests[0].tools[0].function.name, "child");
    assert_eq!(agent.spec().policies, vec!["strict"]);
}

#[test]
fn every_unbound_manifest_reference_fails_at_compile() {
    let mut c = Components::default();
    c.models.insert("route".into(), Arc::new(RealmModel));
    let b = bindings();
    for extra in [
        json!({"skills":["missing"]}),
        json!({"model_route":"missing"}),
        json!({"tool_policy":"missing"}),
        json!({"mcp":[{"name":"missing"}]}),
        json!({"subagents":[{"id":"missing","provider":"acp://missing"}]}),
        json!({"services":[{"name":"missing"}]}),
    ] {
        let mut value = json!({"id":"pack","persona":"p"});
        value
            .as_object_mut()
            .unwrap()
            .extend(extra.as_object().unwrap().clone());
        assert!(compile(&manifest(value), &c, &b).is_err());
    }
}
#[test]
fn transport_mismatch_and_root_realm_are_not_silently_ignored() {
    let mut c = Components::default();
    c.models.insert("route".into(), Arc::new(RealmModel));
    let mut b = bindings();
    b.mcp.insert(
        "server".into(),
        McpBinding {
            transport: "http".into(),
            source: "connection".into(),
        },
    );
    assert!(
        compile(
            &manifest(
                json!({"id":"pack","persona":"p","mcp":[{"name":"server","transport":"stdio"}]})
            ),
            &c,
            &b
        )
        .is_err()
    );
    let mut pack = manifest(json!({"id":"pack","persona":"p","services":[{"name":"index"}]}));
    pack.services[0].realm = nofy_packcore::Realm::Root;
    assert!(compile(&pack, &c, &b).is_err());
}
