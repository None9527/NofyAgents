//! The shipped main-agent source template, using trusted in-process SDK adapters.
//! These deterministic adapters are not a real-provider or OS-isolation test.
use nofy_agent_host::{
    KernelHost,
    auth::{Authorizer, Scope},
    native,
};
use nofy_agent_project::{FactoryKinds, Source, TemplateRegistry, build, edit, inspect};
use nofy_agent_runtime::{registry::*, supervisor::RunSupervisor, *};
use nofy_tool_runtime::{ToolCallContext, ToolDispatch, ToolStream, TypedToolOutput};
use serde_json::{Value, json};
use std::{
    collections::BTreeMap,
    sync::{
        Arc, Mutex,
        atomic::{AtomicUsize, Ordering},
    },
    time::Duration,
};

const TOKEN: &str = "main-agent-fixture-administrator-token-00000001";
#[derive(Default)]
struct Evidence {
    effects: AtomicUsize,
    models: AtomicUsize,
    requests: Mutex<Vec<ModelRequest>>,
}
struct Credentials;
#[async_trait::async_trait]
impl credentials::CredentialProvider for Credentials {
    fn identity(&self) -> &str {
        "main-agent-no-credentials"
    }
    async fn resolve(&self, _: &str) -> Result<Option<String>, Error> {
        Ok(None)
    }
}
struct FixtureFactory {
    evidence: Arc<Evidence>,
    model: bool,
}
fn descriptor(factory: &str, kind: ModuleKind) -> ModuleDescriptor {
    ModuleDescriptor {
        factory: factory.into(),
        revision: "1".into(),
        kind,
        config_schema: json!({"type":"object","additionalProperties":false}),
        input_schema: None,
        output_schema: None,
        required_capabilities: Default::default(),
        dependencies: Default::default(),
    }
}
impl ModuleFactory for FixtureFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        if self.model {
            descriptor("host.main_fixture_model", ModuleKind::Model)
        } else {
            descriptor("host.main_fixture_effect", ModuleKind::ToolPack)
        }
    }
    fn build(
        &self,
        _: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        if self.model {
            Ok(ModuleInstance::Model(Arc::new(FixtureModel(
                self.evidence.clone(),
            ))))
        } else {
            let mut tools = ToolCatalog::new();
            tools.insert(ToolEntry {
                definition: nofy_tool_types::ToolDefinition::function(
                    "count_effect",
                    Some("Count one test effect"),
                    json!({"type":"object","additionalProperties":false}),
                ),
                dispatch: Arc::new(Effect(self.evidence.clone())),
            })?;
            Ok(ModuleInstance::ToolPack(tools))
        }
    }
}
struct Effect(Arc<Evidence>);
#[async_trait::async_trait]
impl ToolDispatch for Effect {
    fn is_resumable(&self) -> bool {
        true
    }
    fn recovery_identity(&self) -> Option<String> {
        Some("main-fixture-effect/v1".into())
    }
    async fn call(
        &self,
        id: nofy_tool_protocol::ToolId,
        _: Value,
        _: ToolCallContext,
    ) -> ToolStream<TypedToolOutput> {
        let count = self.0.effects.fetch_add(1, Ordering::SeqCst) + 1;
        nofy_tool_runtime::terminal_only(Ok(TypedToolOutput::from_value(
            id,
            json!({"count":count}),
        )))
    }
}
struct FixtureModel(Arc<Evidence>);
fn call(id: &str, name: &str, arguments: Value) -> ModelResponse {
    ModelResponse {
        tool_calls: vec![ToolCall {
            id: id.into(),
            name: name.into(),
            arguments,
        }],
        ..Default::default()
    }
}
fn result<'a>(request: &'a ModelRequest, id: &str) -> Option<&'a Value> {
    request.messages.iter().rev().find_map(|m| match m {
        Message::Tool {
            call_id, content, ..
        } if call_id == id => Some(content),
        _ => None,
    })
}
#[async_trait::async_trait]
impl Model for FixtureModel {
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        self.0.models.fetch_add(1, Ordering::SeqCst);
        self.0.requests.lock().unwrap().push(request.clone());
        // State is derived solely from durable model history, never a process counter.
        let main = request
            .tools
            .iter()
            .any(|t| t.function.name == "agent_tasks");
        Ok(if main {
            if result(&request, "spawn").is_none() {
                call(
                    "spawn",
                    "agent_tasks",
                    json!({"action":"spawn","task_id":"worker","tool":"task","arguments":{"skill":"delegate","args":"Perform the counted effect, then broadcast its result."}}),
                )
            } else if result(&request, "joined").is_none() {
                call(
                    "joined",
                    "agent_tasks",
                    json!({"action":"wait","task_id":"worker","timeout_ms":5000}),
                )
            } else if result(&request, "messages").is_none() {
                call(
                    "messages",
                    "agent_messages",
                    json!({"action":"read","after":0}),
                )
            } else if result(&request, "human").is_none() {
                call(
                    "human",
                    "ask_user",
                    json!({"input":{"question":"Accept the child result?","options":["yes","no"]}}),
                )
            } else {
                ModelResponse {
                    output: "main completed after human answer".into(),
                    ..Default::default()
                }
            }
        } else if result(&request, "effect").is_none() {
            call("effect", "count_effect", json!({}))
        } else if result(&request, "report").is_none() {
            call(
                "report",
                "agent_messages",
                json!({"action":"send","message_id":"child-result","to":"*","body":{"result":result(&request,"effect")}}),
            )
        } else {
            ModelResponse {
                output: "child completed".into(),
                ..Default::default()
            }
        })
    }
}
fn registry(evidence: Arc<Evidence>) -> ModuleRegistry {
    let mut registry = native::registry(Arc::new(Credentials)).unwrap();
    registry
        .register_factory(Arc::new(FixtureFactory {
            evidence: evidence.clone(),
            model: true,
        }))
        .unwrap();
    registry
        .register_factory(Arc::new(FixtureFactory {
            evidence,
            model: false,
        }))
        .unwrap();
    registry
}
fn kinds(registry: &ModuleRegistry) -> FactoryKinds {
    registry
        .descriptors()
        .into_iter()
        .map(|d| {
            (
                d.factory,
                serde_json::to_value(d.kind)
                    .unwrap()
                    .as_str()
                    .unwrap()
                    .into(),
            )
        })
        .collect()
}
fn templates() -> TemplateRegistry {
    TemplateRegistry::open(
        &std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../../../presets"),
    )
    .unwrap()
}
fn source(registry: &ModuleRegistry, allowed: bool, budget: Option<u64>) -> Source {
    let kinds = kinds(registry);
    let mut source = templates().get("main-agent", Some("0.1.0"), None).unwrap();
    edit(&mut source, "agent.module.add", &json!({"agent":"main","id":"model","factory":"host.main_fixture_model","config":{},"slot":"model"}), &kinds).unwrap();
    edit(
        &mut source,
        "agent.module.add",
        &json!({"agent":"main","id":"effect","factory":"host.main_fixture_effect","config":{}}),
        &kinds,
    )
    .unwrap();
    edit(
        &mut source,
        "agent.module.bind",
        &json!({"agent":"main","module":"child-tools","dependencies":{"effect":"effect"}}),
        &kinds,
    )
    .unwrap();
    edit(
        &mut source,
        "agent.module.set",
        &json!({"agent":"main","module":"child-tools","set":{"/packs":["messages","effect"]}}),
        &kinds,
    )
    .unwrap();
    let mut allowed_tools = vec![
        "agent_tasks",
        "task",
        "agent_messages",
        "ask_user",
        "workflow_execute",
    ];
    if allowed {
        allowed_tools.push("count_effect");
    }
    let mut settings = json!({"allowed_tools":allowed_tools,"child_allowed_tools":["agent_messages","count_effect"]});
    if let Some(limit) = budget {
        settings["budget"] = json!({"max_model_calls":limit});
    }
    edit(
        &mut source,
        "agent.configure",
        &json!({"agent":"main","settings":settings}),
        &kinds,
    )
    .unwrap();
    assert_eq!(inspect(&source, &kinds).unwrap()["status"], "complete");
    source
}
fn system(source: &Source, registry: &ModuleRegistry) -> Value {
    let built = build(source, &kinds(registry)).unwrap();
    serde_json::from_str::<Value>(built["deployment_json"].as_str().unwrap()).unwrap()["system"]
        .clone()
}
#[test]
fn template_requires_explicit_model_and_supports_renaming_and_public_edits() {
    let registry = registry(Arc::new(Evidence::default()));
    let kinds = kinds(&registry);
    let mut source = templates()
        .get("main-agent", Some("0.1.0"), Some("coordinator"))
        .unwrap();
    let view = inspect(&source, &kinds).unwrap();
    assert_eq!(view["status"], "incomplete");
    assert!(
        view["missing_slots"]
            .as_array()
            .unwrap()
            .contains(&json!("coordinator.model"))
    );
    assert!(build(&source, &kinds).is_err());
    // Even while incomplete, explicit prerequisites can be added.
    edit(&mut source, "agent.module.add", &json!({"agent":"coordinator","id":"unused","factory":"prompt.static","config":{"text":"unused"}}), &kinds).unwrap();
    edit(&mut source, "agent.module.add", &json!({"agent":"coordinator","id":"model","factory":"host.main_fixture_model","config":{},"slot":"model"}), &kinds).unwrap();
    assert_eq!(inspect(&source, &kinds).unwrap()["status"], "complete");
    let document = system(&source, &registry);
    assert!(document["programs"].get("coordinator").is_some());
    assert!(document["programs"].get("main").is_none());
    assert!(
        document["modules"]
            .as_array()
            .unwrap()
            .iter()
            .any(|m| m["factory"] == "tool.skills")
    );
}
fn auth() -> Authorizer {
    Authorizer::new(vec![(
        TOKEN.into(),
        [
            Scope::Read,
            Scope::Edit,
            Scope::Publish,
            Scope::Resources,
            Scope::Execute,
        ]
        .into(),
    )])
    .unwrap()
}
struct Server {
    url: String,
    task: tokio::task::JoinHandle<()>,
}
impl Drop for Server {
    fn drop(&mut self) {
        self.task.abort();
    }
}
async fn serve(host: &KernelHost) -> Server {
    let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    let url = format!("http://{}", listener.local_addr().unwrap());
    let router = host.router();
    let task = tokio::spawn(async move { axum::serve(listener, router).await.unwrap() });
    Server { url, task }
}
async fn request(server: &Server, method: reqwest::Method, path: &str, body: Value) -> Value {
    let response = reqwest::Client::builder()
        .timeout(Duration::from_secs(10))
        .build()
        .unwrap()
        .request(method, format!("{}{path}", server.url))
        .bearer_auth(TOKEN)
        .json(&body)
        .send()
        .await
        .unwrap();
    let status = response.status();
    let value: Value = response.json().await.unwrap();
    assert!(status.is_success(), "{status}: {value}");
    value
}
async fn post(server: &Server, path: &str, body: Value) -> Value {
    request(server, reqwest::Method::POST, path, body).await
}
async fn get(server: &Server, path: &str) -> Value {
    request(server, reqwest::Method::GET, path, Value::Null).await
}
async fn submit(server: &Server, document: Value, id: &str) {
    let name = document["name"].clone();
    let release = post(server, "/api/v1/import", document).await["bundle"]["digest"].clone();
    post(server,"/api/v1/runs",json!({"run_id":id,"thread_id":id,"system":name,"release":release,"program":"main","input":{"text":"delegate then ask me","attachments":[]}})).await;
}
fn runtime() -> tokio::runtime::Runtime {
    tokio::runtime::Builder::new_multi_thread()
        .worker_threads(2)
        .thread_stack_size(nofy_agent_host::WORKER_STACK_BYTES)
        .enable_all()
        .build()
        .unwrap()
}
#[test]
fn main_agent_delegates_messages_and_reopens_human_without_repeating_effect() {
    runtime().block_on(async {
        let evidence = Arc::new(Evidence::default());
        let registry = registry(evidence.clone());
        let dir = tempfile::tempdir().unwrap();
        let host = KernelHost::open(dir.path(), registry.clone(), auth())
            .await
            .unwrap();
        let server = serve(&host).await;
        let document = system(&source(&registry, true, None), &registry);
        submit(&server, document.clone(), "main-human").await;
        let execution_registry = prepared_registry(&host, &document);
        let supervisor = RunSupervisor::new(host.store().clone());
        let first = tokio::time::timeout(
            Duration::from_secs(20),
            supervisor.execute_submitted(&execution_registry, "main-human"),
        )
        .await
        .unwrap()
        .unwrap();
        assert!(
            matches!(first, Some(RunOutcome::Paused { .. })),
            "{first:?}"
        );
        assert_eq!(evidence.effects.load(Ordering::SeqCst), 1);
        let requests = evidence.requests.lock().unwrap().clone();
        assert!(requests.iter().any(|r| {
            result(r, "messages").is_some_and(|v| v.to_string().contains("child-result"))
        }));
        // Managed discovery may restore accepted constraints, but must never
        // drop a policy or governance floor added by the current host.
        for governance in [false, true] {
            let mut stricter = registry.clone();
            let required = ModuleRef::new("new-host-floor", "1");
            if governance {
                stricter.require_governance(required);
            } else {
                stricter.require_policy(required);
            }
            let error = supervisor
                .human_recovery_targets(&stricter, "main-human")
                .await
                .unwrap_err();
            assert!(
                error.to_string().contains("missing a current host floor"),
                "{error}"
            );
        }
        let page = get(&server, "/api/v1/runs/main-human/recovery/humans").await;
        assert_eq!(page["targets"].as_array().unwrap().len(), 1, "{page}");
        let mut command = page["targets"][0]["command"].clone();
        assert_eq!(command["kind"], "human");
        assert_eq!(
            command["expected_request"]["question"],
            "Accept the child result?"
        );
        command["value"] = json!({"answer":"yes"});
        let action = json!({"run_id":"main-human","command_id":"answer-main","command":command});
        drop(supervisor);
        drop(execution_registry);
        drop(server);
        drop(host);
        // Reopen the durable host before admitting and executing the exact returned command.
        let reopened = KernelHost::open(dir.path(), registry.clone(), auth())
            .await
            .unwrap();
        let server = serve(&reopened).await;
        assert_eq!(
            get(&server, "/api/v1/runs/main-human/recovery/humans").await,
            page
        );
        let execution_registry = prepared_registry(&reopened, &document);
        post(&server, "/api/v1/actions", action.clone()).await;
        let supervisor = RunSupervisor::new(reopened.store().clone());
        let receipt = tokio::time::timeout(
            Duration::from_secs(20),
            supervisor.execute_managed_action(&execution_registry, "answer-main"),
        )
        .await
        .unwrap()
        .unwrap();
        let receipt = serde_json::to_value(receipt).unwrap();
        assert!(receipt["error"].is_null(), "{receipt}");
        let state = get(&server, "/api/v1/runs/main-human").await;
        assert_eq!(state["execution"]["status"], "completed", "{state}");
        assert_eq!(evidence.effects.load(Ordering::SeqCst), 1);
        let before = evidence.models.load(Ordering::SeqCst);
        let repeated = post(&server, "/api/v1/actions", action).await;
        assert_eq!(repeated, receipt);
        supervisor
            .execute_submitted(&execution_registry, "main-human")
            .await
            .unwrap();
        assert_eq!(evidence.effects.load(Ordering::SeqCst), 1);
        assert_eq!(evidence.models.load(Ordering::SeqCst), before);
    });
}
#[test]
fn main_agent_root_floor_blocks_child_effect_and_budget_is_shared() {
    runtime().block_on(async {
        for (id, allowed, budget) in [("floor", false, None), ("budget", true, Some(2))] {
            let evidence = Arc::new(Evidence::default());
            let registry = registry(evidence.clone());
            let dir = tempfile::tempdir().unwrap();
            let host = KernelHost::open(dir.path(), registry.clone(), auth())
                .await
                .unwrap();
            let server = serve(&host).await;
            let document = system(&source(&registry, allowed, budget), &registry);
            submit(&server, document.clone(), id).await;
            let execution_registry = prepared_registry(&host, &document);
            let supervisor = RunSupervisor::new(host.store().clone());
            let outcome = tokio::time::timeout(
                Duration::from_secs(20),
                supervisor.execute_submitted(&execution_registry, id),
            )
            .await
            .unwrap();
            let state = get(&server, &format!("/api/v1/runs/{id}")).await;
            if budget.is_some() {
                assert!(
                    evidence.models.load(Ordering::SeqCst) <= 2,
                    "shared limit exceeded"
                );
                assert!(
                    state.to_string().contains("budget")
                        || format!("{outcome:?}").contains("Budget"),
                    "{state}; {outcome:?}"
                );
            } else {
                assert_eq!(evidence.effects.load(Ordering::SeqCst), 0);
                let history = serde_json::to_string(&*evidence.requests.lock().unwrap()).unwrap();
                assert!(
                    history.contains("denied")
                        || history.contains("not allowed")
                        || history.contains("policy"),
                    "{state}; {outcome:?}; {history}"
                );
            }
        }
    });
}

// Runtime resources are bound by the host loader. The bootstrap registry alone
// intentionally does not contain the durable budget/checkpointer factories.
fn prepared_registry(host: &KernelHost, document: &Value) -> ModuleRegistry {
    host.control()
        .prepare(serde_json::from_value(document.clone()).unwrap())
        .unwrap()
        .registry()
        .clone()
}

// The v0.2.0 repository path deliberately uses public source/package APIs.
fn composable_source(registry: &ModuleRegistry, effect: bool) -> Source {
    use nofy_agent_project::repository::*;
    let kinds = kinds(registry);
    let root = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../../..");
    let (packages, revision) = load_repository_directory(&root.join("modules")).unwrap();
    assert_eq!(packages.len(), 12);
    let temporary = tempfile::tempdir().unwrap();
    let store = ModuleStore::open(temporary.path()).unwrap();
    let repo = store
        .put(
            "nofy",
            None,
            RepositoryOrigin::Directory {
                host_path: root.join("modules").canonicalize().unwrap(),
            },
        )
        .unwrap();
    store
        .synchronize("nofy", &repo.revision, packages, revision)
        .unwrap();
    let mut source = templates().get("main-agent", Some("0.2.0"), None).unwrap();
    assert_eq!(imports(&source).unwrap().len(), 7);
    verify_package_sources(&source).unwrap();
    assert!(
        build(&source, &kinds).is_err(),
        "provider must be configured explicitly"
    );
    edit(&mut source,"agent.module.add",&json!({"agent":"main","id":"model","factory":"host.main_fixture_model","config":{},"slot":"model","replace_slot":true}),&kinds).unwrap();
    for (alias, package) in [
        ("delegate", "main-agent-delegate"),
        ("assembly", "dynamic-assembly"),
    ] {
        let parameters = imports(&source).unwrap()[alias].parameters.clone();
        use_package(&mut source, &store.package("nofy", package, "0.1.0").unwrap(), &json!({"agent":"main","alias":alias,"parameters":parameters,"bindings":{"model":"model","tools":"child-tools"},"replace_import":true}), &kinds).unwrap();
    }
    unuse_package(&mut source, "provider").unwrap();
    if effect {
        edit(
            &mut source,
            "agent.module.add",
            &json!({"agent":"main","id":"effect","factory":"host.main_fixture_effect","config":{}}),
            &kinds,
        )
        .unwrap();
        edit(
            &mut source,
            "agent.module.bind",
            &json!({"agent":"main","module":"child-tools","dependencies":{"effect":"effect"}}),
            &kinds,
        )
        .unwrap();
        edit(
            &mut source,
            "agent.module.set",
            &json!({"agent":"main","module":"child-tools","set":{"/packs":["messages","effect"]}}),
            &kinds,
        )
        .unwrap();
        edit(&mut source,"agent.configure",&json!({"agent":"main","settings":{"allowed_tools":["agent_tasks","task","agent_messages","ask_user","workflow_execute","workflow_agent","assemble","count_effect"],"child_allowed_tools":["agent_messages","count_effect"]}}),&kinds).unwrap();
    }
    let source = store.hydrate(&source).unwrap();
    assert_eq!(inspect(&source, &kinds).unwrap()["status"], "complete");
    source
}

#[test]
fn composable_repository_is_pinned_exportable_and_provider_source_is_complete() {
    use nofy_agent_project::repository::*;
    let registry = registry(Arc::new(Evidence::default()));
    let kinds = kinds(&registry);
    let source = composable_source(&registry, false);
    let before = build(&source, &kinds).unwrap()["deployment_json"].clone();
    let dir = tempfile::tempdir().unwrap();
    nofy_agent_project::write_directory(&dir.path().join("export"), &source, None).unwrap();
    let restored = nofy_agent_project::load_directory(&dir.path().join("export")).unwrap();
    assert_eq!(build(&restored, &kinds).unwrap()["deployment_json"], before);
    assert_eq!(
        nofy_agent_project::pack(&source).unwrap(),
        nofy_agent_project::pack(&restored).unwrap()
    );
    let mut tampered = restored.clone();
    let pin = imports(&tampered).unwrap()["assembly"].digest.clone();
    tampered.files.insert(
        package_file(&pin).unwrap(),
        nofy_agent_project::File::text("{}"),
    );
    assert!(build(&tampered, &kinds).is_err());
    let mut provider = templates()
        .get("main-agent", Some("0.2.0"), Some("assistant"))
        .unwrap();
    edit(&mut provider,"agent.configure",&json!({"agent":"assistant","settings":{"model":"fixture","connection":{"base_url":"https://example.invalid/v1/","models":["fixture"],"header_credentials":{"authorization":{"reference":"MODEL_KEY","prefix":"Bearer "}}}}}),&kinds).unwrap();
    let document = system(&provider, &registry);
    assert!(document["programs"].get("assistant").is_some());
    let encoded = serde_json::to_string(&document).unwrap();
    assert!(encoded.contains("chat_completions.rhai"));
    assert!(!encoded.contains("$file"));
    assert!(!encoded.contains("$parameter"));
    assert!(encoded.contains("assemble"));
    // Prepare uses the actual host factory set, but never invokes the model.
    runtime().block_on(async {
        let temporary = tempfile::tempdir().unwrap();
        let host = KernelHost::open(temporary.path(), registry.clone(), auth())
            .await
            .unwrap();
        host.control()
            .prepare(serde_json::from_value(document).unwrap())
            .unwrap();
    });
}

struct AssemblyModel(Arc<Evidence>);
struct AssemblyModelFactory(Arc<Evidence>);
impl ModuleFactory for AssemblyModelFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        descriptor("host.main_fixture_model", ModuleKind::Model)
    }
    fn build(
        &self,
        _: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        Ok(ModuleInstance::Model(Arc::new(AssemblyModel(
            self.0.clone(),
        ))))
    }
}
#[async_trait::async_trait]
impl Model for AssemblyModel {
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        self.0.models.fetch_add(1, Ordering::SeqCst);
        self.0.requests.lock().unwrap().push(request.clone());
        let Some(assembly) = request.tools.iter().find(|t| t.function.name == "assemble") else {
            return Ok(if result(&request, "effect").is_none() {
                call("effect", "count_effect", json!({}))
            } else {
                ModelResponse {
                    output: "dynamic child completed".into(),
                    ..Default::default()
                }
            });
        };
        let description = assembly.function.description.as_ref().unwrap();
        let available = description
            .split("Available dependencies: ")
            .nth(1)
            .unwrap()
            .split(". Local modules")
            .next()
            .unwrap();
        let choices: Vec<Value> = serde_json::from_str(available).unwrap();
        let reference =
            |kind: &str| choices.iter().find(|v| v["kind"] == kind).unwrap()["reference"].clone();
        let prompt = json!({"id":"dynamic-prompt","version":"1"});
        let agent = json!({"name":"constructed-worker","model":reference("model"),"prompt":prompt,"tool_packs":[reference("tool_pack")],"settings":{"max_steps":4}});
        let modules = json!([{"reference":prompt,"factory":"prompt.static","config":{"text":"Execute the bounded counted effect once and finish."}}]);
        Ok(if result(&request, "spawn-dynamic").is_none() {
            call(
                "spawn-dynamic",
                "agent_tasks",
                json!({"action":"spawn","task_id":"constructed","tool":"assemble","arguments":{"kind":"agent","document":{"modules":modules,"agent":agent},"prompt":"count once"}}),
            )
        } else if result(&request, "join-dynamic").is_none() {
            call(
                "join-dynamic",
                "agent_tasks",
                json!({"action":"wait","task_id":"constructed","timeout_ms":5000}),
            )
        } else if result(&request, "graph").is_none() {
            call(
                "graph",
                "assemble",
                json!({"kind":"workflow","document":{"modules":modules,"agents":[{"reference":{"id":"worker","version":"1"},"definition":agent}],"host":{"name":"constructed-graph"},"entry":{"id":"pipeline","version":"1"},"workflows":[{"reference":{"id":"pipeline","version":"1"},"input_schema":true,"output_schema":true,"nodes":[{"id":"prepare","input":{"from":"literal","value":"count again"},"action":{"kind":"transform"}},{"id":"execute","needs":["prepare"],"input":{"from":"node","node":"prepare"},"action":{"kind":"agent","agent":{"id":"worker","version":"1"}}}],"output":{"from":"node","node":"execute"}}]},"input":{}}),
            )
        } else {
            ModelResponse {
                output: "main completed dynamically constructed agent and graph".into(),
                ..Default::default()
            }
        })
    }
}
#[test]
fn composable_main_executes_model_authored_child_and_workflow_with_existing_host() {
    runtime().block_on(async {
        let evidence = Arc::new(Evidence::default());
        let mut registry = native::registry(Arc::new(Credentials)).unwrap();
        registry
            .register_factory(Arc::new(AssemblyModelFactory(evidence.clone())))
            .unwrap();
        registry
            .register_factory(Arc::new(FixtureFactory {
                evidence: evidence.clone(),
                model: false,
            }))
            .unwrap();
        let source = composable_source(&registry, true);
        let document = system(&source, &registry);
        let dir = tempfile::tempdir().unwrap();
        let host = KernelHost::open(dir.path(), registry.clone(), auth())
            .await
            .unwrap();
        let server = serve(&host).await;
        submit(&server, document.clone(), "constructed-main").await;
        let registry = prepared_registry(&host, &document);
        let supervisor = RunSupervisor::new(host.store().clone());
        let outcome = tokio::time::timeout(
            Duration::from_secs(30),
            supervisor.execute_submitted(&registry, "constructed-main"),
        )
        .await
        .unwrap()
        .unwrap();
        assert!(
            matches!(outcome, Some(RunOutcome::Completed { .. })),
            "{outcome:?}"
        );
        let state = get(&server, "/api/v1/runs/constructed-main").await;
        assert_eq!(state["execution"]["status"], "completed", "{state}");
        let requests = evidence.requests.lock().unwrap();
        for id in ["join-dynamic", "graph"] {
            let (value, is_error) = requests
                .iter()
                .flat_map(|r| &r.messages)
                .find_map(|message| match message {
                    Message::Tool {
                        call_id,
                        content,
                        is_error,
                        ..
                    } if call_id == id => Some((content, *is_error)),
                    _ => None,
                })
                .unwrap();
            assert!(!is_error, "{id}: {value}");
            assert!(
                value.to_string().contains("dynamic child completed"),
                "{id}: {value}"
            );
        }
        assert_eq!(
            evidence.effects.load(Ordering::SeqCst),
            2,
            "Both structurally-created children must execute, not just receive prompts"
        );
        drop(requests);
        let before = evidence.models.load(Ordering::SeqCst);
        supervisor
            .execute_submitted(&registry, "constructed-main")
            .await
            .unwrap();
        assert_eq!(evidence.effects.load(Ordering::SeqCst), 2);
        assert_eq!(evidence.models.load(Ordering::SeqCst), before);
    });
}

#[test]
fn composable_main_reopens_static_human_workflow_without_repeating_effect() {
    runtime().block_on(async {
        let evidence = Arc::new(Evidence::default());
        let registry = registry(evidence.clone());
        let document = system(&composable_source(&registry, true), &registry);
        let temporary = tempfile::tempdir().unwrap();
        let host = KernelHost::open(temporary.path(), registry.clone(), auth())
            .await
            .unwrap();
        let server = serve(&host).await;
        submit(&server, document.clone(), "composable-human").await;
        let execution_registry = prepared_registry(&host, &document);
        let supervisor = RunSupervisor::new(host.store().clone());
        let first = tokio::time::timeout(
            Duration::from_secs(30),
            supervisor.execute_submitted(&execution_registry, "composable-human"),
        )
        .await
        .unwrap()
        .unwrap();
        assert!(
            matches!(first, Some(RunOutcome::Paused { .. })),
            "{first:?}"
        );
        assert_eq!(evidence.effects.load(Ordering::SeqCst), 1);
        let recovery = get(&server, "/api/v1/runs/composable-human/recovery/humans").await;
        assert_eq!(recovery["targets"].as_array().unwrap().len(), 1);
        let mut command = recovery["targets"][0]["command"].clone();
        command["value"] = json!({"answer":"yes"});
        let action =
            json!({"run_id":"composable-human","command_id":"answer-composable","command":command});
        drop(supervisor);
        drop(execution_registry);
        drop(server);
        drop(host);
        let host = KernelHost::open(temporary.path(), registry, auth())
            .await
            .unwrap();
        let server = serve(&host).await;
        assert_eq!(
            get(&server, "/api/v1/runs/composable-human/recovery/humans").await,
            recovery
        );
        post(&server, "/api/v1/actions", action.clone()).await;
        let registry = prepared_registry(&host, &document);
        let supervisor = RunSupervisor::new(host.store().clone());
        let receipt = tokio::time::timeout(
            Duration::from_secs(30),
            supervisor.execute_managed_action(&registry, "answer-composable"),
        )
        .await
        .unwrap()
        .unwrap();
        let receipt = serde_json::to_value(receipt).unwrap();
        assert!(receipt["error"].is_null(), "{receipt}");
        assert_eq!(
            get(&server, "/api/v1/runs/composable-human").await["execution"]["status"],
            "completed"
        );
        assert_eq!(evidence.effects.load(Ordering::SeqCst), 1);
        assert_eq!(post(&server, "/api/v1/actions", action).await, receipt);
        assert_eq!(evidence.effects.load(Ordering::SeqCst), 1);
    });
}
