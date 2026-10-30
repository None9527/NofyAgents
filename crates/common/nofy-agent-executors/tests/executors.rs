use axum::{
    Json, Router,
    extract::State,
    http::{HeaderMap, StatusCode},
    response::{IntoResponse, Response},
    routing::post,
};
use nofy_agent_executors::{
    http::{HttpConnection, HttpToolFactory, Method},
    process::ProcessToolFactory,
    resources::*,
};
use nofy_agent_runtime::{registry::*, *};
use nofy_tool_runtime::{ToolCallContext, ToolError};
use serde_json::{Value, json};
use std::{
    collections::{BTreeMap, BTreeSet},
    path::Path,
    sync::{
        Arc,
        atomic::{AtomicUsize, Ordering},
    },
    time::Duration,
};

struct Secret(AtomicUsize);
#[async_trait::async_trait]
impl CredentialProvider for Secret {
    async fn resolve(&self, reference: &str, _: &ToolCallContext) -> Result<String, ToolError> {
        self.0.fetch_add(1, Ordering::SeqCst);
        if reference == "revoked" {
            Err(ToolError::custom(
                "credential_unavailable",
                "credential revoked",
            ))
        } else {
            Ok("test-secret-not-in-config".into())
        }
    }
}
#[derive(Clone)]
struct HttpState {
    calls: Arc<AtomicUsize>,
}
async fn handler(
    State(state): State<HttpState>,
    headers: HeaderMap,
    Json(body): Json<Value>,
) -> Response {
    state.calls.fetch_add(1, Ordering::SeqCst);
    if matches!(body["name"].as_str(), Some("before_tool" | "before_model")) {
        return Json(json!({"decision":"deny","reason":"HTTP hook denied"})).into_response();
    }
    if body["action"] == "slow" {
        tokio::time::sleep(Duration::from_secs(5)).await;
    }
    if body["action"] == "redirect" {
        return (
            StatusCode::TEMPORARY_REDIRECT,
            [("location", "http://127.0.0.1:1/escape")],
        )
            .into_response();
    }
    if body["action"] == "status" {
        return StatusCode::SERVICE_UNAVAILABLE.into_response();
    }
    if body["action"] == "large" {
        return Json(json!({"data":"X".repeat(1000)})).into_response();
    }
    Json(json!({"data":body,"authorized":headers.get("authorization").is_some()})).into_response()
}
struct Server {
    url: String,
    calls: Arc<AtomicUsize>,
    task: tokio::task::JoinHandle<()>,
}
impl Drop for Server {
    fn drop(&mut self) {
        self.task.abort();
    }
}
async fn server() -> Server {
    let calls = Arc::new(AtomicUsize::new(0));
    let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    let url = format!("http://{}/api/", listener.local_addr().unwrap());
    let app = Router::new()
        .route("/api/tool", post(handler))
        .with_state(HttpState {
            calls: calls.clone(),
        });
    let task = tokio::spawn(async move {
        axum::serve(listener, app).await.unwrap();
    });
    Server { url, calls, task }
}
fn http_factory(server: &Server, secret: Arc<Secret>) -> HttpToolFactory {
    let connection = HttpConnection::install(
        &server.url,
        "connection-v1",
        BTreeSet::from([Method::Post]),
        BTreeSet::from(["token".into(), "revoked".into()]),
        secret,
    )
    .unwrap();
    HttpToolFactory::new(
        "v1",
        BTreeMap::from([("service".into(), Arc::new(connection))]),
    )
    .unwrap()
}
fn http_config() -> Value {
    json!({"contract":{"name":"lookup","input_schema":{"type":"object","required":["action"],"properties":{"action":{"type":"string"}}},"output_schema":{"type":"object"}},"connection":"service","path":"tool","method":"POST","credential_ref":"token"})
}
fn build(factory: &dyn ModuleFactory, config: Value) -> ToolEntry {
    // Exercise the same descriptor validation as a JSON configuration client.
    // Factory lifetime cannot be borrowed into registry; direct build is pure
    // and schema validation here uses its exact public descriptor.
    nofy_agent_runtime::settings::validate_json_schema(&factory.descriptor().config_schema)
        .unwrap();
    nofy_agent_runtime::settings::validate_json_value(&factory.descriptor().config_schema, &config)
        .unwrap();
    let ModuleInstance::ToolPack(catalog) = factory.build(&config, &BTreeMap::new()).unwrap()
    else {
        panic!("tool pack required")
    };
    catalog.get(&catalog.names()[0]).unwrap().clone()
}
async fn call(
    entry: &ToolEntry,
    args: Value,
    context: ToolCallContext,
) -> Result<Value, ToolError> {
    entry
        .dispatch
        .call_terminal(
            nofy_tool_protocol::ToolId::new(&entry.definition.function.name).unwrap(),
            args,
            context,
        )
        .await
        .map(|output| output.value)
}

#[tokio::test]
async fn http_configuration_is_pure_then_executes_mapping_schema_and_live_credentials() {
    let server = server().await;
    let secret = Arc::new(Secret(AtomicUsize::new(0)));
    let factory = http_factory(&server, secret.clone());
    let mut config = http_config();
    config["input"] = json!({"kind":"object","fields":{"action":{"kind":"input","pointer":"/action"},"fixed":{"kind":"literal","value":7}}});
    config["contract"]["output_pointer"] = json!("/data");
    let entry = build(&factory, config.clone());
    assert_eq!(server.calls.load(Ordering::SeqCst), 0);
    assert_eq!(secret.0.load(Ordering::SeqCst), 0);
    assert!(
        !serde_json::to_string(&factory.descriptor())
            .unwrap()
            .contains("test-secret")
    );
    assert!(!config.to_string().contains("test-secret"));
    let result = call(&entry, json!({"action":"ok"}), Default::default())
        .await
        .unwrap();
    assert_eq!(result, json!({"action":"ok","fixed":7}));
    assert_eq!(secret.0.load(Ordering::SeqCst), 1);
    assert!(call(&entry, json!({}), Default::default()).await.is_err());
    assert_eq!(server.calls.load(Ordering::SeqCst), 1);
    let mut revoked = http_config();
    revoked["credential_ref"] = json!("revoked");
    assert!(
        call(
            &build(&factory, revoked),
            json!({"action":"ok"}),
            Default::default()
        )
        .await
        .unwrap_err()
        .to_string()
        .contains("revoked")
    );
    assert_eq!(server.calls.load(Ordering::SeqCst), 1);
}

#[tokio::test]
async fn http_admission_escape_unknown_options_and_output_failures_are_explicit() {
    let server = server().await;
    let factory = http_factory(&server, Arc::new(Secret(AtomicUsize::new(0))));
    for (field, value) in [
        ("path", json!("../outside")),
        ("path", json!("https://elsewhere.invalid/")),
        ("path", json!("%2e%2e/outside")),
        ("method", json!("GET")),
        ("credential_ref", json!("unadmitted")),
        ("connection", json!("other")),
        ("unexpected", json!(true)),
    ] {
        let mut config = http_config();
        config[field] = value;
        assert!(
            factory.build(&config, &BTreeMap::new()).is_err(),
            "{config}"
        );
    }
    let entry = build(&factory, http_config());
    for action in ["redirect", "status"] {
        let error = call(&entry, json!({"action":action}), Default::default())
            .await
            .unwrap_err()
            .to_string();
        assert!(error.contains("status"));
        assert!(!error.contains("test-secret"));
    }
    let mut config = http_config();
    config["contract"]["max_output_bytes"] = json!(100);
    assert!(
        call(
            &build(&factory, config),
            json!({"action":"large"}),
            Default::default()
        )
        .await
        .unwrap_err()
        .to_string()
        .contains("byte limit")
    );
    let mut config = http_config();
    config["contract"]["output_schema"] = json!({"type":"integer"});
    assert!(
        call(
            &build(&factory, config),
            json!({"action":"ok"}),
            Default::default()
        )
        .await
        .is_err()
    );
}

#[tokio::test]
async fn http_timeout_and_cancellation_are_bounded_without_retry() {
    let server = server().await;
    let factory = http_factory(&server, Arc::new(Secret(AtomicUsize::new(0))));
    let mut config = http_config();
    config["contract"]["timeout_ms"] = json!(40);
    assert!(
        call(
            &build(&factory, config),
            json!({"action":"slow"}),
            Default::default()
        )
        .await
        .unwrap_err()
        .to_string()
        .contains("timed out")
    );
    let entry = build(&factory, http_config());
    let token = tokio_util::sync::CancellationToken::new();
    let mut ctx = ToolCallContext::default();
    ctx.insert(nofy_tool_runtime::Cancellation(token.clone()));
    let run = tokio::spawn(async move { call(&entry, json!({"action":"slow"}), ctx).await });
    tokio::time::sleep(Duration::from_millis(30)).await;
    token.cancel();
    assert!(
        tokio::time::timeout(Duration::from_secs(1), run)
            .await
            .unwrap()
            .unwrap()
            .unwrap_err()
            .to_string()
            .contains("cancelled")
    );
    assert!(server.calls.load(Ordering::SeqCst) <= 2);
}

struct TestGuard(Arc<AtomicUsize>);
impl EnvironmentGuard for TestGuard {
    fn revision(&self) -> &str {
        "test-host-authorized-v1"
    }
    fn prepare(&self, _: &mut tokio::process::Command) -> Result<(), ToolError> {
        self.0.fetch_add(1, Ordering::SeqCst);
        Ok(())
    }
}
fn process_factory(root: &Path, guard: Arc<AtomicUsize>) -> ProcessToolFactory {
    let python = InstalledProgram::load(Path::new("/usr/bin/python3"), Some("-c".into())).unwrap();
    let cat = InstalledProgram::load(Path::new("/bin/cat"), None).unwrap();
    let environment = ProcessEnvironment::install(
        root,
        BTreeMap::from([("python".into(), python), ("cat".into(), cat)]),
        BTreeMap::from([("VISIBLE".into(), "host-value".into())]),
        Arc::new(TestGuard(guard)),
    )
    .unwrap();
    ProcessToolFactory::new("v1", environment).unwrap()
}
fn process_config(script: &str) -> Value {
    json!({"contract":{"name":"script"},"program":"python","script":script})
}

#[tokio::test]
async fn process_and_script_are_configured_with_literal_stdin_and_explicit_environment() {
    let root = tempfile::tempdir().unwrap();
    let guard = Arc::new(AtomicUsize::new(0));
    let factory = process_factory(root.path(), guard.clone());
    let config = process_config(
        "import json,sys,os;print(json.dumps({'input':json.load(sys.stdin),'cwd':os.getcwd(),'home':os.environ.get('HOME'),'visible':os.environ.get('VISIBLE')}))",
    );
    let entry = build(&factory, config);
    assert_eq!(guard.load(Ordering::SeqCst), 0);
    let args = json!({"value":"$(touch SHOULD_NOT_EXIST); <xml>"});
    let result = call(&entry, args.clone(), Default::default())
        .await
        .unwrap();
    assert_eq!(result["input"], args);
    assert!(result["home"].is_null());
    assert_eq!(result["visible"], "host-value");
    assert_eq!(
        result["cwd"],
        std::fs::canonicalize(root.path())
            .unwrap()
            .to_string_lossy()
            .as_ref()
    );
    assert!(!root.path().join("SHOULD_NOT_EXIST").exists());
    assert_eq!(guard.load(Ordering::SeqCst), 1);
    let cat = build(&factory, json!({"contract":{"name":"cat"},"program":"cat"}));
    assert_eq!(
        call(&cat, args.clone(), Default::default()).await.unwrap(),
        args
    );
}

#[tokio::test]
async fn process_rejects_uninstalled_interpreters_paths_bad_outputs_and_limits() {
    let root = tempfile::tempdir().unwrap();
    let factory = process_factory(root.path(), Arc::new(AtomicUsize::new(0)));
    for config in [
        json!({"contract":{"name":"x"},"program":"missing"}),
        json!({"contract":{"name":"x"},"program":"cat","script":"code"}),
        json!({"contract":{"name":"x"},"program":"python","cwd":"../escape"}),
        json!({"contract":{"name":"x"},"program":"python","cwd":"/"}),
    ] {
        assert!(factory.build(&config, &BTreeMap::new()).is_err());
    }
    for (script, expected) in [
        ("print('not-json')", "not JSON"),
        ("import sys;sys.exit(9)", "unsuccessfully"),
    ] {
        assert!(
            call(
                &build(&factory, process_config(script)),
                json!({}),
                Default::default()
            )
            .await
            .unwrap_err()
            .to_string()
            .contains(expected)
        );
    }
    let mut config = process_config("print('X'*10000)");
    config["contract"]["max_output_bytes"] = json!(100);
    assert!(
        call(&build(&factory, config), json!({}), Default::default())
            .await
            .unwrap_err()
            .to_string()
            .contains("byte limit")
    );
    let mut config = process_config("print('1')");
    config["contract"]["output_schema"] = json!({"type":"object"});
    assert!(
        call(&build(&factory, config), json!({}), Default::default())
            .await
            .is_err()
    );
    #[cfg(unix)]
    {
        std::os::unix::fs::symlink("/", root.path().join("escape")).unwrap();
        let mut config = process_config("print('{}')");
        config["cwd"] = json!("escape");
        assert!(
            call(&build(&factory, config), json!({}), Default::default())
                .await
                .unwrap_err()
                .to_string()
                .contains("escapes")
        );
    }
}

#[tokio::test]
async fn replaced_installed_executable_is_rejected_before_launch() {
    let root = tempfile::tempdir().unwrap();
    let path = root.path().join("installed-cat");
    std::fs::copy("/bin/cat", &path).unwrap();
    let program = InstalledProgram::load(&path, None).unwrap();
    let guard = Arc::new(AtomicUsize::new(0));
    let environment = ProcessEnvironment::install(
        root.path(),
        BTreeMap::from([("cat".into(), program)]),
        BTreeMap::new(),
        Arc::new(TestGuard(guard.clone())),
    )
    .unwrap();
    let factory = ProcessToolFactory::new("v1", environment).unwrap();
    let entry = build(&factory, json!({"contract":{"name":"cat"},"program":"cat"}));
    std::fs::write(path, b"changed executable").unwrap();
    assert!(
        call(&entry, json!({}), Default::default())
            .await
            .unwrap_err()
            .to_string()
            .contains("executable changed")
    );
    assert_eq!(guard.load(Ordering::SeqCst), 0);
}

#[tokio::test]
async fn process_timeout_cancel_and_dropped_future_kill_descendants() {
    // A grandchild would create a marker after its parent returns/cancels. The
    // ownership guard must kill the entire group even if the caller drops it.
    let root = tempfile::tempdir().unwrap();
    let factory = process_factory(root.path(), Arc::new(AtomicUsize::new(0)));
    for mode in ["timeout", "cancel", "drop"] {
        let marker = format!("{mode}-leaked");
        let child = format!(
            "import time,pathlib;time.sleep(3);pathlib.Path({marker:?}).write_text('leaked')"
        );
        let script = format!(
            "import subprocess,sys,time,pathlib;subprocess.Popen([sys.executable,'-c',{child:?}]);pathlib.Path('started-{mode}').write_text('1');time.sleep(10)"
        );
        let mut config = process_config(&script);
        if mode == "timeout" {
            config["contract"]["timeout_ms"] = json!(1500);
        }
        let entry = build(&factory, config);
        let token = tokio_util::sync::CancellationToken::new();
        let mut ctx = ToolCallContext::default();
        ctx.insert(nofy_tool_runtime::Cancellation(token.clone()));
        let task = tokio::spawn(async move { call(&entry, json!({}), ctx).await });
        tokio::time::timeout(Duration::from_secs(3), async {
            while !root.path().join(format!("started-{mode}")).exists() {
                tokio::time::sleep(Duration::from_millis(5)).await;
            }
        })
        .await
        .unwrap();
        match mode {
            "cancel" => token.cancel(),
            "drop" => task.abort(),
            _ => {}
        }
        let result = tokio::time::timeout(Duration::from_secs(2), task)
            .await
            .unwrap();
        if mode != "drop" {
            assert!(result.unwrap().is_err());
        }
        tokio::time::sleep(Duration::from_millis(3200)).await;
        assert!(!root.path().join(marker).exists(), "{mode} leaked a child");
    }
}

#[cfg(feature = "nofy-sandbox")]
#[tokio::test]
async fn original_sandbox_adapter_fails_closed_when_host_has_no_enforcement() {
    let root = tempfile::tempdir().unwrap();
    let program = InstalledProgram::load(Path::new("/bin/cat"), None).unwrap();
    let environment = ProcessEnvironment::install(
        root.path(),
        BTreeMap::from([("cat".into(), program)]),
        BTreeMap::new(),
        Arc::new(NofySandboxGuard),
    )
    .unwrap();
    let factory = ProcessToolFactory::new("sandbox-v1", environment).unwrap();
    let entry = build(&factory, json!({"contract":{"name":"cat"},"program":"cat"}));
    assert!(
        call(&entry, json!({}), Default::default())
            .await
            .unwrap_err()
            .to_string()
            .contains("sandbox must already be enforced")
    );
}

struct ToolModel;
#[async_trait::async_trait]
impl Model for ToolModel {
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        if request
            .messages
            .iter()
            .any(|m| matches!(m, Message::Tool { .. }))
        {
            return Ok(ModelResponse {
                output: "done".into(),
                ..Default::default()
            });
        }
        Ok(ModelResponse {
            tool_calls: vec![ToolCall {
                id: "http-1".into(),
                name: "lookup".into(),
                arguments: json!({"action":"ok"}),
            }],
            ..Default::default()
        })
    }
}
#[tokio::test]
async fn json_document_builds_an_agent_that_executes_http_without_kernel_changes() {
    let server = server().await;
    let factory = http_factory(&server, Arc::new(Secret(AtomicUsize::new(0))));
    let mut host = ModuleRegistry::default();
    host.register_factory(Arc::new(factory)).unwrap();
    host.register_factory(Arc::new(StaticPromptFactory))
        .unwrap();
    host.register_factory(Arc::new(InstanceFactory::new(
        "model.test",
        "v1",
        ModuleInstance::Model(Arc::new(ToolModel)),
    )))
    .unwrap();
    let document=serde_json::from_value(json!({"modules":[
        {"reference":{"id":"model","version":"1"},"factory":"model.test","config":{}},
        {"reference":{"id":"prompt","version":"1"},"factory":"prompt.static","config":{"text":"Use the configured tool"}},
        {"reference":{"id":"http","version":"1"},"factory":"tool.http","config":http_config()}
    ],"agent":{"name":"configured","model":{"id":"model","version":"1"},"prompt":{"id":"prompt","version":"1"},"tool_packs":[{"id":"http","version":"1"}]}})).unwrap();
    let compiled = nofy_agent_runtime::compile::compile_document(document, &host).unwrap();
    assert_eq!(server.calls.load(Ordering::SeqCst), 0);
    let result = compiled
        .agent
        .invoke(RunInput::new("go"), RunContext::new("thread", "run"))
        .await
        .unwrap();
    assert!(matches!(result, RunOutcome::Completed { .. }));
    assert_eq!(server.calls.load(Ordering::SeqCst), 1);
}

#[tokio::test]
async fn configured_http_and_process_executors_are_real_typed_hook_handlers() {
    use nofy_agent_executors::hooks::ExecutorHookFactory;
    use nofy_agent_runtime::hooks::*;
    let server = server().await;
    let http = http_factory(&server, Arc::new(Secret(AtomicUsize::new(0))));
    let mut config = http_config();
    config["contract"]["input_schema"] = json!({"type":"object"});
    let http_entry = build(&http, config);
    let root = tempfile::tempdir().unwrap();
    let process = process_factory(root.path(), Arc::new(AtomicUsize::new(0)));
    let process_entry = build(
        &process,
        process_config(
            "import sys,json;event=json.load(sys.stdin);payload=event['payload'];payload['verified']=True;print(json.dumps({'decision':'patch','payload':payload}))",
        ),
    );
    for (entry, deny) in [(http_entry, true), (process_entry, false)] {
        let name = entry.definition.function.name.clone();
        let mut catalog = ToolCatalog::new();
        catalog.insert(entry).unwrap();
        let ModuleInstance::HookHandler(handler) = ExecutorHookFactory
            .build(
                &json!({"tool":name}),
                &BTreeMap::from([("executor".into(), ModuleInstance::ToolPack(catalog))]),
            )
            .unwrap()
        else {
            panic!("handler")
        };
        let subscription = Arc::new(
            HookRegistration::new(
                "executor-hook-v1".into(),
                EventCatalog::runtime().get("before_tool").unwrap().clone(),
                HookRule {
                    event: "before_tool".into(),
                    priority: 0,
                    timeout_ms: 3000,
                    failure: FailurePolicy::Closed,
                    matches: None,
                },
                handler,
            )
            .unwrap(),
        );
        let bus = HookBus::new(EventCatalog::runtime(), vec![subscription]).unwrap();
        let result = bus
            .emit(
                &runtime_owner(),
                "before_tool",
                "call",
                json!({"args":1}),
                &RunContext::new("thread", "run"),
            )
            .await
            .unwrap();
        if deny {
            assert!(matches!(result.control, HookDecision::Deny { .. }));
        } else {
            assert_eq!(result.payload["verified"], true);
        }
    }
}

#[tokio::test]
async fn executor_hooks_obey_host_policy_and_budget_even_when_failure_is_open() {
    use nofy_agent_executors::hooks::ExecutorHookFactory;
    use nofy_agent_runtime::{governance::*, hooks::*};
    for (limit, deny_policy, expected) in [(0, false, 0), (1, true, 0), (1, false, 1)] {
        let server = server().await;
        let factory = http_factory(&server, Arc::new(Secret(AtomicUsize::new(0))));
        let mut config = http_config();
        config["contract"]["input_schema"] = json!({"type":"object"});
        let entry = build(&factory, config);
        let name = entry.definition.function.name.clone();
        let mut catalog = ToolCatalog::new();
        catalog.insert(entry).unwrap();
        let ModuleInstance::HookHandler(handler) = ExecutorHookFactory
            .build(
                &json!({"tool":name}),
                &BTreeMap::from([("executor".into(), ModuleInstance::ToolPack(catalog))]),
            )
            .unwrap()
        else {
            panic!("handler")
        };
        let registration = Arc::new(
            HookRegistration::new(
                "http-hook-1".into(),
                EventCatalog::runtime().get("before_model").unwrap().clone(),
                HookRule {
                    event: "before_model".into(),
                    priority: 0,
                    timeout_ms: 3000,
                    failure: FailurePolicy::Open,
                    matches: None,
                },
                handler,
            )
            .unwrap(),
        );
        let bus = HookBus::new(EventCatalog::runtime(), vec![registration]).unwrap();
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
        components.models.insert("m".into(), Arc::new(ToolModel));
        components
            .prompts
            .insert("p".into(), Arc::new(StaticPrompt("test".into())));
        let mut agent = AgentBuilder::new("hook-budget")
            .model("m")
            .prompt("p")
            .compile(&components)
            .unwrap()
            .with_hooks(bus)
            .with_governance(profile.clone());
        if deny_policy {
            agent = agent
                .with_required_policy("deny-1", Arc::new(policy::ToolAllowList(BTreeSet::new())))
                .unwrap();
        }
        let outcome = agent
            .invoke(RunInput::new("go"), RunContext::new("thread", "run"))
            .await
            .unwrap();
        assert!(if limit == 0 {
            matches!(outcome, RunOutcome::BudgetExceeded { .. })
        } else {
            matches!(outcome, RunOutcome::Completed { .. })
        });
        assert_eq!(server.calls.load(Ordering::SeqCst), expected);
        let summary = ledger
            .inspect(&BudgetScope {
                root_run_id: "run".into(),
                identity: profile.identity().into(),
            })
            .await
            .unwrap()
            .unwrap();
        assert_eq!(summary.used.tool_calls, expected as u64);
    }
}
