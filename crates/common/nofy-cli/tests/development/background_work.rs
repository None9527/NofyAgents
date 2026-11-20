use super::{omni::checked, *};
use nofy_agent_runtime::events::{EventEnvelope, RunEvent};
use std::collections::BTreeMap;

const SESSION: &str = "background-memory-session";
const ORIGIN: &str = "background-first-turn";
const GATE: &str = "Authorize the workflow to persist its audit note.";
const GLOBAL: &str = "GLOBAL-CEDAR-4931";
const CHILD: &str = "AGENT-BIRCH-1872";
const WORKFLOW: &str = "FLOW-ELM-8206";

async fn publish(sdk: &Engine, endpoint: &str, model: &str, window: u64) -> String {
    let template = checked(sdk, "project.template", json!({})).await;
    let source: Source = serde_json::from_value(template.data["source"].clone()).unwrap();
    let configured = checked(sdk, "agent.configure", json!({"agent":"main","target":{
        "kind":"source","source":source,"expected_digest":source.digest().unwrap()},
        "settings":{"connection":{"base_url":endpoint,"models":[model],"allow_insecure_http":true,"timeout_ms":120000},
            "model":model,"model_settings":{"stream":true,"max_output_tokens":1024},"context_window":window,
            "allowed_tools":["memory","sdk_work_targets","sdk_work_start","sdk_work_list","sdk_work_inspect",
                "sdk_work_wait","sdk_work_control","workflow_execute","workflow_agent"]}})).await;
    let built = checked(
        sdk,
        "agent.build",
        json!({"agent":"main","target":{"kind":"source","source":configured.data["source"]}}),
    )
    .await;
    let mut deployment: Value =
        serde_json::from_str(built.data["deployment_json"].as_str().unwrap()).unwrap();
    let r = |id: &str| json!({"id":id,"version":"1"});
    let root = &mut deployment["system"]["programs"]["main"]["definition"];
    root["tool_packs"]
        .as_array_mut()
        .unwrap()
        .push(r("session-memory-tools"));
    let mut child = root.clone();
    child["name"] = json!("background-specialist");
    child["tool_packs"] = json!([r("session-memory-tools")]);
    child["prompt"] = r("background-child-prompt");
    let mut flow_agent = child.clone();
    flow_agent["name"] = json!("workflow-memory-agent");
    flow_agent["prompt"] = r("background-node-prompt");
    let workflow_scope_identity = flow_agent["settings"]["scope_identity"].clone();
    let grants = json!({"read":["personal","project"],"write":["personal","project"],
        "child_read":["personal","project"],"child_write":["project"]});
    let modules = deployment["system"]["modules"].as_array_mut().unwrap();
    modules
        .iter_mut()
        .find(|m| m["factory"] == "tool.sdk_work")
        .unwrap()["config"] = json!({"background_targets":["memory-worker","memory-workflow"]});
    modules.extend([
        json!({"reference":r("session-memory-resource"),"factory":"resource.memory","config":{
            "backend":{"namespace":"orchestration-memory","project_id":"37a9b2ac-9dca-4aae-9235-aed6ac68d141",
                "search":{"min_score":0,"text_weight":1,"vector_weight":0}},
            "grants":grants}}),
        json!({"reference":r("session-memory-tools"),"factory":"tool.memory_connected","config":{
            "read":["personal","project"],"write":["personal","project"],
            "child_read":["personal","project"],"child_write":["project"],
            "operations":["list","remember"]},"dependencies":{"connection":r("session-memory-resource")}}),
        json!({"reference":r("background-child-prompt"),"factory":"prompt.static","config":{
            "text":format!("You maintain project memory. List personal memory and find the global deployment marker there. Record '{CHILD}' as the project audit marker using remember in project memory with confirm_sensitive false. After both tool results succeed, return both markers separated by |.")}}),
        json!({"reference":r("background-node-prompt"),"factory":"prompt.static","config":{
            "text":format!("You are the audited workflow Agent node. Check both personal and project memory using list. Find the global deployment marker and the background worker's project audit marker. Save '{WORKFLOW}' as the workflow audit marker in project memory using remember with confirm_sensitive false. Return all three markers separated by |, in order global, worker, workflow.")}}),
    ]);
    let mut graph = json!({"entry":r("memory-flow"),"host":{"name":"background-workflow-host","scope_identity":workflow_scope_identity},
        "agents":[{"reference":r("memory-auditor"),"definition":flow_agent}],
        "workflows":[{"reference":r("memory-flow"),"input_schema":{"type":"object"},"output_schema":{},"parallelism":1,
            "nodes":[
                {"id":"authorize","input":{"from":"literal","value":{"question":GATE}},
                    "action":{"kind":"human","response_schema":{"const":true}}},
                {"id":"recall","needs":["authorize"],"input":{"from":"literal","value":"Complete the authorized audit using actual memory tools."},
                    "action":{"kind":"agent","agent":r("memory-auditor")}}
            ],"output":{"from":"node","node":"recall","pointer":"/output"}}]});
    if model == "unused-model" {
        graph["agents"] = json!([]);
        graph["tool_runtimes"] = json!([{"reference":r("memory-node"),"definition":{
            "name":"memory-workflow-node","tool_packs":[r("session-memory-tools")]}}]);
        graph["workflows"][0]["nodes"][1] = json!({
            "id":"write-audit","needs":["authorize"],"input":{"from":"literal","value":{
                "operation":"remember","request":{"area":"project","statement":WORKFLOW,"confirm_sensitive":false}
            }},
            "action":{"kind":"tool","runtime":r("memory-node"),"tool":"memory"}
        });
        graph["workflows"][0]["output"] = json!({"from":"node","node":"authorize"});
        deployment["system"]["programs"]["native-memory"] = json!({
            "kind":"tool","definition":{"name":"native-memory","tool_packs":[r("session-memory-tools")]},
            "call":{"id":"memory-call","name":"memory","arguments":{"operation":"list","request":{}}}
        });
    }
    deployment["system"]["programs"]["memory-worker"] = json!({"kind":"agent","definition":child});
    deployment["system"]["programs"]["memory-workflow"] =
        json!({"kind":"workflow","document":graph,"input":{}});
    checked(
        sdk,
        "system.publish",
        json!({"document_json":deployment.to_string()}),
    )
    .await
    .refs["release"]
        .clone()
        .unwrap()
}

async fn start_session(sdk: &Engine, release: &str, session: &str, run: &str, goal: &str) -> Value {
    let request = json!({"run_id":run,"thread_id":session,"system":"omni","release":release,"program":"main",
        "input":{"text":goal,"attachments":[]}});
    checked(
        sdk,
        "session.start",
        json!({"session_id":session,"command_id":run,
        "expected_session_revision":null,"request_json":request.to_string()}),
    )
    .await
    .data
}

async fn wait_status(sdk: &Engine, id: &str, status: &str) -> Value {
    tokio::time::timeout(Duration::from_secs(185), async {
        loop {
            let node = checked(
                sdk,
                "work.inspect",
                json!({"work_id":id,"include_result":true}),
            )
            .await
            .data;
            if node["status"] == status {
                return node;
            }
            if matches!(node["status"].as_str(), Some("failed" | "cancelled")) {
                let details = sdk
                    .execute(
                        "run.inspect",
                        json!({"run_id":node["run_id"],"view":"full"}),
                    )
                    .await;
                let details: Value = details.data["native_json"]
                    .as_str()
                    .and_then(|body| serde_json::from_str(body).ok())
                    .unwrap_or(Value::Null);
                let child_errors = details["children"]
                    .as_array()
                    .into_iter()
                    .flatten()
                    .filter_map(|child| {
                        child["error"]
                            .as_str()
                            .map(|error| (&child["run_id"], error))
                    })
                    .collect::<Vec<_>>();
                panic!(
                    "work {node}; outcome: {}; child errors: {child_errors:?}",
                    details["execution"]["outcome"]
                );
            }
            tokio::time::sleep(Duration::from_millis(100)).await;
        }
    })
    .await
    .unwrap_or_else(|_| panic!("{id} never reached {status}"))
}

async fn evidence(sdk: &Engine, id: &str) -> Vec<Value> {
    let mut after = 0u64;
    let mut evidence = Vec::new();
    let mut calls = BTreeMap::new();
    loop {
        let page = checked(
            sdk,
            "run.events",
            json!({"run_id":id,"after":after.to_string(),"limit":250}),
        )
        .await;
        let body: Value = serde_json::from_str(page.data["native_json"].as_str().unwrap()).unwrap();
        let batch: Vec<EventEnvelope> = serde_json::from_value(body["events"].clone()).unwrap();
        if batch.is_empty() {
            break;
        }
        for entry in batch {
            after = entry.cursor;
            let run = entry.scope.run_id;
            match entry.event {
                RunEvent::ToolStarted { call } | RunEvent::ToolResumed { call } => {
                    calls.insert((run, call.id.clone()), call);
                }
                RunEvent::ToolCompleted {
                    call_id,
                    result,
                    is_error,
                } => {
                    if let Some(call) = calls.get(&(run.clone(), call_id.clone())) {
                        let row = json!({"cursor":after,"run_id":run,"call_id":call_id,"tool":call.name,
                            "args":call.arguments,"result":result["value"],"error":is_error});
                        eprintln!("{row}");
                        evidence.push(row);
                    }
                }
                RunEvent::ModelUsage {
                    input_tokens,
                    output_tokens,
                    ..
                } => {
                    evidence.push(json!({"cursor":after,"run_id":run,"input_tokens":input_tokens,"output_tokens":output_tokens}));
                }
                _ => {}
            }
        }
    }
    evidence
}

#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
async fn background_commands_share_exact_ids_and_replay_after_reopen() {
    let state = tempfile::tempdir().unwrap();
    let host_state = host(state.path()).await;
    let service = serve(host_state.router()).await;
    let sdk = engine(&service.url, ADMIN);
    let release = publish(&sdk, "http://127.0.0.1:1/v1/", "unused-model", 8192).await;
    start_session(
        &sdk,
        &release,
        SESSION,
        ORIGIN,
        "Queue a foreground session.",
    )
    .await;
    let snapshot = checked(&sdk, "work.list", json!({"session_id":SESSION}))
        .await
        .data;
    let start = json!({"session_id":SESSION,"command_id":"one-work","program":"memory-workflow","release":release,
        "parameters":{"changed":false}});
    let refused = engine(&service.url, READ)
        .execute("work.start", start.clone())
        .await;
    assert!(refused.is_error());
    let admitted = checked(&sdk, "work.start", start.clone()).await.data;
    assert_ne!(admitted["work_id"], admitted["run_id"]);
    assert_eq!(admitted["parent_work_id"], ORIGIN);
    assert_eq!(
        checked(&sdk, "work.start", start.clone()).await.data,
        admitted
    );
    assert!(sdk.execute("work.start",json!({"session_id":SESSION,"command_id":"one-work","program":"memory-workflow","release":release,
        "parameters":{"changed":true}})).await.is_error());
    let id = &admitted["work_id"];
    let before = checked(&sdk, "work.inspect", json!({"work_id":id}))
        .await
        .data;
    assert_eq!(before["status"], "queued");
    let stale = sdk.execute("work.control",json!({"work_id":id,"command_id":"cancel","action":"cancel","expected_revision":"0".repeat(64)})).await;
    assert!(stale.is_error());
    let control = json!({"work_id":id,"command_id":"cancel","action":"cancel","expected_revision":before["revision"]});
    let cancelled = checked(&sdk, "work.control", control.clone()).await.data;
    assert_eq!(cancelled["phase"], "settled");
    let transport = checked(&sdk, "work.inspect", json!({"work_id":id}))
        .await
        .data;
    let (code, cli_view) = cli_with_toolset(
        &service.url,
        &["work", "inspect", "--work-id", id.as_str().unwrap()],
        None,
    )
    .await;
    assert_eq!(code, 0, "{cli_view}");
    assert_eq!(cli_view["data"], transport);
    assert_eq!(transport["status"], "cancelled");
    drop(service);
    drop(host_state);
    let reopened = host(state.path()).await;
    let service = serve(reopened.router()).await;
    let sdk = engine(&service.url, ADMIN);
    let replay = checked(
        &sdk,
        "work.wait",
        json!({"session_id":SESSION,"after":snapshot["watermark"],"work_ids":[id]}),
    )
    .await
    .data;
    let changes = replay["changes"].as_array().unwrap();
    assert!(
        changes.iter().any(|e| e["native_status"] == "queued"),
        "{changes:?}"
    );
    assert!(
        changes.iter().any(|e| e["native_status"] == "cancelled"),
        "{changes:?}"
    );
    assert_eq!(checked(&sdk, "work.start", start).await.data, admitted);
    assert_eq!(checked(&sdk, "work.control", control).await.data, cancelled);
    let timeout = checked(
        &sdk,
        "work.wait",
        json!({"session_id":SESSION,"after":replay["watermark"],"work_ids":[id],"timeout_ms":50}),
    )
    .await
    .data;
    assert_eq!(timeout["changes"], json!([]));
    let mcp = super::toolsets::connect(&service.url, None).await;
    let mcp_events = mcp_call(
        &mcp,
        "nofy_work_wait",
        json!({"session_id":SESSION,
        "after":snapshot["watermark"],"work_ids":[id]}),
    )
    .await;
    assert_eq!(mcp_events["data"], replay);
    mcp.cancel().await.unwrap();
    let wrong_scope = sdk
        .execute(
            "work.wait",
            json!({"run_id":admitted["run_id"],"after":replay["watermark"]}),
        )
        .await;
    assert!(wrong_scope.is_error());
}

#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
async fn owned_workflow_resumes_from_human_blocker_after_host_reopen() {
    let state = tempfile::tempdir().unwrap();
    let initial = host(state.path()).await;
    let service = serve(initial.router()).await;
    let sdk = engine(&service.url, ADMIN);
    let release = publish(&sdk, "http://127.0.0.1:1/v1/", "unused-model", 8192).await;
    start_session(
        &sdk,
        &release,
        SESSION,
        ORIGIN,
        "Register a session without sampling.",
    )
    .await;
    let origin = checked(&sdk, "work.inspect", json!({"work_id":ORIGIN}))
        .await
        .data;
    checked(
        &sdk,
        "work.control",
        json!({"work_id":ORIGIN,"command_id":"stop-foreground","action":"cancel",
        "expected_revision":origin["revision"]}),
    )
    .await;
    let started = checked(
        &sdk,
        "work.start",
        json!({"session_id":SESSION,"command_id":"gate",
        "program":"memory-workflow","release":release}),
    )
    .await
    .data;
    let work = started["work_id"].as_str().unwrap();
    let stop = tokio_util::sync::CancellationToken::new();
    let worker = tokio::spawn({
        let kernel = initial.clone();
        let stop = stop.clone();
        async move { kernel.run_worker(stop, 2).await.unwrap() }
    });
    let seed = json!({"run_id":"native-global-remember","thread_id":"native-global-remember","system":"omni",
        "release":release,"program":"native-memory","parameters":{
            "operation":"remember","request":{"area":"personal","statement":GLOBAL,"confirm_sensitive":false}}});
    checked(&sdk, "run.start", json!({"request_json":seed.to_string()})).await;
    let stored = wait_status(&sdk, "native-global-remember", "completed").await;
    let remembered = evidence(&sdk, "native-global-remember").await;
    assert!(
        remembered.iter().any(|row| row["tool"] == "memory"
            && row["error"] == false
            && row["result"].to_string().contains(GLOBAL)),
        "{remembered:?}"
    );
    let before = wait_status(&sdk, work, "waiting").await;
    assert_eq!(before["parent_work_id"], ORIGIN);
    let tree = checked(&sdk, "work.list", json!({"run_id":work}))
        .await
        .data;
    let gate = tree["items"]
        .as_array()
        .unwrap()
        .iter()
        .find(|n| n["kind"] == "workflow_human")
        .unwrap()
        .clone();
    assert_eq!(gate["actions"], json!(["human"]));
    stop.cancel();
    worker.await.unwrap();
    drop(service);
    drop(initial);

    let reopened = host(state.path()).await;
    let service = serve(reopened.router()).await;
    let sdk = engine(&service.url, ADMIN);
    assert_eq!(
        checked(&sdk, "work.inspect", json!({"work_id":gate["work_id"]}))
            .await
            .data,
        gate
    );
    let decision = json!({"work_id":gate["work_id"],"command_id":"operator-accepts-memory-audit",
        "expected_revision":gate["revision"],"action":"human",
        "response_json":json!({"expected_request":{"question":GATE},"value":true}).to_string()});
    let receipt = checked(&sdk, "work.control", decision.clone()).await.data;
    assert_eq!(receipt["phase"], "accepted");
    let stop = tokio_util::sync::CancellationToken::new();
    let worker = tokio::spawn({
        let kernel = reopened.clone();
        let stop = stop.clone();
        async move { kernel.run_worker(stop, 2).await.unwrap() }
    });
    let after = wait_status(&sdk, work, "completed").await;
    assert_eq!(after["work_id"], work);
    assert_eq!(after["result"]["value"], true);
    let workflow_memory = evidence(&sdk, started["run_id"].as_str().unwrap()).await;
    assert!(
        workflow_memory.iter().any(|row| row["tool"] == "memory"
            && row["error"] == false
            && row["result"].to_string().contains(WORKFLOW)),
        "{workflow_memory:?}"
    );
    assert_eq!(checked(&sdk, "work.control", decision).await.data, receipt);
    let replay = checked(
        &sdk,
        "work.wait",
        json!({"run_id":work,"after":tree["watermark"]}),
    )
    .await
    .data;
    assert!(
        replay["changes"]
            .as_array()
            .unwrap()
            .iter()
            .any(|change| change["work_id"] == work && change["native_status"] == "completed"),
        "{replay}"
    );
    let recall = json!({"run_id":"native-global-recall","thread_id":"native-global-recall","system":"omni",
        "release":release,"program":"native-memory"});
    checked(
        &sdk,
        "run.start",
        json!({"request_json":recall.to_string()}),
    )
    .await;
    let recall = wait_status(&sdk, "native-global-recall", "completed").await;
    let recalled = evidence(&sdk, "native-global-recall").await;
    assert!(
        recalled.iter().any(|row| row["tool"] == "memory"
            && row["error"] == false
            && row["result"].to_string().contains(GLOBAL)
            && row["result"].to_string().contains(WORKFLOW)),
        "{recalled:?}"
    );
    eprintln!(
        "{}",
        json!({"admission":started,"before_reopen":before,"gate":gate,
        "control":receipt,"completed":after,"changes":replay,"global_remember":stored,
        "memory_readback":recall,"workflow_memory":workflow_memory})
    );
    stop.cancel();
    worker.await.unwrap();
}

#[cfg(unix)]
struct BackgroundHostProcess {
    child: tokio::process::Child,
    url: String,
    pid: u32,
    logs: tokio::task::JoinHandle<()>,
}

#[cfg(unix)]
impl BackgroundHostProcess {
    #[allow(clippy::disallowed_methods)] // The fixture waits on the child or kills it on drop.
    async fn start(state: &Path, access: &Path, token: &str, probe: Option<&Path>) -> Self {
        use std::process::Stdio;
        use tokio::io::{AsyncBufReadExt, BufReader};

        let default_binary = std::env::current_exe()
            .unwrap()
            .parent()
            .unwrap()
            .parent()
            .unwrap()
            .join("nofy-agent-host");
        let executable = if probe.is_some() {
            PathBuf::from(
                std::env::var_os("NOFY_LIVE_PROBE_HOST").expect("set NOFY_LIVE_PROBE_HOST"),
            )
        } else {
            default_binary
        };
        let mut command = tokio::process::Command::new(&executable);
        command
            .current_dir(state)
            .args(["--listen", "127.0.0.1:0", "--concurrency", "3"])
            .arg("--state-dir")
            .arg(state)
            .arg("--access-file")
            .arg(access)
            .arg("--preset-dir")
            .arg(presets())
            .env_clear()
            .env("HOME", state)
            .env("PATH", "/usr/bin:/bin")
            .env("NOFY_BACKGROUND_HOST_ACCESS", token)
            .env("NOFY_BACKGROUND_HOST_READ", format!("{token}-read"))
            .env("NOFY_BACKGROUND_HOST_EXECUTE", format!("{token}-execute"))
            .stdin(Stdio::null())
            .stdout(Stdio::null())
            .stderr(Stdio::piped())
            .kill_on_drop(true);
        if let Some(path) = probe {
            command.env("NOFY_LIVE_MEMORY_CRASH_PROBE", path);
        }
        let mut child = command.spawn().unwrap_or_else(|error| {
            panic!(
                "start {}; build it with cargo build -p nofy-agent-host: {error}",
                executable.display()
            )
        });
        let pid = child.id().unwrap();
        let mut lines = BufReader::new(child.stderr.take().unwrap()).lines();
        let url = tokio::time::timeout(Duration::from_secs(45), async {
            while let Some(line) = lines.next_line().await.unwrap() {
                eprintln!("host {pid}: {line}");
                if let Some(url) = line.strip_prefix("Nofy kernel listening on ") {
                    return url.to_owned();
                }
            }
            panic!("host {pid} exited before listening");
        })
        .await
        .unwrap_or_else(|_| panic!("host {pid} did not become ready"));
        let logs = tokio::spawn(async move {
            while let Ok(Some(line)) = lines.next_line().await {
                eprintln!("host {pid}: {line}");
            }
        });
        eprintln!(
            "{}",
            json!({"event":"host_ready","pid":pid,"url":url,"state":state})
        );
        Self {
            child,
            url,
            pid,
            logs,
        }
    }

    async fn stop(mut self) -> Value {
        assert!(
            self.child.try_wait().unwrap().is_none(),
            "host exited before shutdown"
        );
        // The Host CLI handles SIGINT as graceful shutdown. Signal the owned child only.
        assert_eq!(
            unsafe { libc::kill(self.pid as libc::pid_t, libc::SIGINT) },
            0
        );
        let status = tokio::time::timeout(Duration::from_secs(30), self.child.wait())
            .await
            .expect("host graceful shutdown timed out")
            .unwrap();
        assert!(status.success(), "host {} exited with {status}", self.pid);
        self.logs.await.unwrap();
        let receipt =
            json!({"event":"host_exited","pid":self.pid,"url":self.url,"exit_code":status.code()});
        eprintln!("{receipt}");
        receipt
    }

    async fn crash(mut self) -> Value {
        use std::os::unix::process::ExitStatusExt;

        assert!(
            self.child.try_wait().unwrap().is_none(),
            "host exited before crash"
        );
        self.child.start_kill().unwrap();
        let status = tokio::time::timeout(Duration::from_secs(10), self.child.wait())
            .await
            .expect("host SIGKILL timed out")
            .unwrap();
        assert_eq!(
            status.signal(),
            Some(libc::SIGKILL),
            "host {}: {status}",
            self.pid
        );
        self.logs.await.unwrap();
        let receipt =
            json!({"event":"host_killed","pid":self.pid,"url":self.url,"signal":status.signal()});
        eprintln!("{receipt}");
        receipt
    }
}

#[cfg(unix)]
async fn memory_call_events(
    store: &nofy_agent_runtime::durable::SqliteStore,
    workflow_run: &str,
    probe: &Value,
) -> Value {
    let mut after = 0;
    let mut starts = 0;
    let mut resumes = 0;
    let mut completions = 0;
    let mut memory_writes = 0;
    loop {
        let events = store.events(workflow_run, after, 250).await.unwrap();
        if events.is_empty() {
            break;
        }
        for event in events {
            after = event.cursor;
            if event.scope.run_id != probe["run_id"].as_str().unwrap() {
                continue;
            }
            match event.event {
                RunEvent::ToolStarted { call } => {
                    starts += usize::from(probe["call_id"] == call.id.as_str());
                    memory_writes += usize::from(
                        call.name == "memory" && call.arguments["operation"] == "remember",
                    );
                }
                RunEvent::ToolResumed { call } if probe["call_id"] == call.id.as_str() => {
                    resumes += 1
                }
                RunEvent::ToolCompleted { call_id, .. } if probe["call_id"] == call_id.as_str() => {
                    completions += 1
                }
                _ => {}
            }
        }
    }
    json!({"started":starts,"resumed":resumes,"completed":completions,"memory_write_starts":memory_writes})
}

#[cfg(unix)]
fn runtime_snapshot(
    database: &Path,
) -> (
    tempfile::TempDir,
    nofy_agent_runtime::durable::SqliteStore,
    u64,
) {
    use nofy_agent_runtime::durable::SqliteStore;

    // Read a private copy so opening SQLite cannot checkpoint the recovery input.
    let snapshot = tempfile::tempdir().unwrap();
    let copy = snapshot.path().join("runtime.sqlite");
    std::fs::copy(database, &copy).unwrap();
    let wal = database.with_file_name("runtime.sqlite-wal");
    let wal_bytes = if wal.exists() {
        std::fs::copy(wal, snapshot.path().join("runtime.sqlite-wal")).unwrap()
    } else {
        0
    };
    let store = SqliteStore::open(&copy).unwrap();
    (snapshot, store, wal_bytes)
}

#[cfg(unix)]
async fn audit_crash_snapshot(
    database: &Path,
    action_id: &str,
    workflow_run: &str,
    probe: Option<&Value>,
) -> Value {
    let (_snapshot, store, wal_bytes) = runtime_snapshot(database);
    let action = store
        .managed_action(action_id)
        .await
        .unwrap()
        .expect("approval survived SIGKILL");
    assert_eq!(action.action.run_id, workflow_run);
    assert!(
        !action.finished,
        "approval had settled before the crash: {action:?}"
    );
    let workflow = store.execution_record(workflow_run).await.unwrap().unwrap();
    assert_ne!(
        workflow.status, "completed",
        "workflow completed before the crash"
    );
    let mut receipt = json!({"event":"crash_snapshot","action":action,"workflow_status":workflow.status,"wal_bytes":wal_bytes});
    if let Some(probe) = probe {
        let events = memory_call_events(&store, workflow_run, probe).await;
        assert_eq!(
            events,
            json!({"started":1,"resumed":0,"completed":0,"memory_write_starts":1}),
            "crashed outside the intended tool boundary"
        );
        receipt["memory_probe"] = probe.clone();
        receipt["tool_events"] = events;
    }
    eprintln!("{receipt}");
    receipt
}

#[cfg(unix)]
#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
#[ignore = "requires the local NInfer Qwen 27B service and a built Host binary"]
async fn omni_owns_background_work_and_memory_across_turns_and_host_restart() {
    run_background_restart(false, false).await;
}

#[cfg(unix)]
#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
#[ignore = "requires the local NInfer Qwen 27B service and a built Host binary"]
async fn omni_recovers_durable_approval_after_host_sigkill() {
    run_background_restart(true, false).await;
}

#[cfg(unix)]
#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
#[ignore = "requires Qwen 27B, a built Host, and the isolated memory crash probe binary"]
async fn omni_audits_memory_committed_before_tool_receipt_after_sigkill() {
    run_background_restart(true, true).await;
}

#[cfg(unix)]
async fn run_background_restart(crash_after_approval: bool, crash_after_memory: bool) {
    use std::os::unix::fs::MetadataExt;

    let endpoint = std::env::var("NOFY_LIVE_MODEL_URL").unwrap();
    let model = std::env::var("NOFY_LIVE_MODEL").unwrap();
    let window = std::env::var("NOFY_LIVE_CONTEXT")
        .ok()
        .map(|v| v.parse().unwrap())
        .unwrap_or(262144);
    let state = tempfile::tempdir().unwrap();
    let access = state.path().join("access.json");
    let token = uuid::Uuid::new_v4().to_string();
    let grants = json!([
        {"token_env":"NOFY_BACKGROUND_HOST_ACCESS","scopes":["read","edit","publish","resources","execute"]},
        {"token_env":"NOFY_BACKGROUND_HOST_READ","scopes":["read"]},
        {"token_env":"NOFY_BACKGROUND_HOST_EXECUTE","scopes":["execute"]}
    ]);
    std::fs::write(&access, serde_json::to_vec(&grants).unwrap()).unwrap();
    let probe_file = state.path().join("memory-commit.json");
    let initial = BackgroundHostProcess::start(
        state.path(),
        &access,
        &token,
        crash_after_memory.then_some(probe_file.as_path()),
    )
    .await;
    let sdk = engine(&initial.url, &token);
    let release = publish(&sdk, &endpoint, &model, window).await;
    let goal = format!(
        "Save '{GLOBAL}' as the global deployment marker using personal memory. You are authorized to start both offered background programs in this session. Discover the authorized programs and launch the memory worker and audit workflow. Give the worker the objective of reading the shared deployment marker and persisting its own project audit mark. The workflow needs a human authorization, so after both starts return SCHEDULED and finish this turn. Keep their ownership in this session for the next turn."
    );
    let started = start_session(&sdk, &release, SESSION, ORIGIN, &goal).await;
    let origin = wait_status(&sdk, ORIGIN, "completed").await;
    let first = evidence(&sdk, ORIGIN).await;
    let successful_starts = first
        .iter()
        .filter(|e| e["tool"] == "sdk_work_start" && e["error"] == false);
    assert_eq!(successful_starts.clone().count(), 2, "{origin}; {first:?}");
    let admissions = successful_starts
        .map(|e| (e["result"]["kind"].as_str().unwrap(), e["result"].clone()))
        .collect::<BTreeMap<_, _>>();
    assert_eq!(admissions.len(), 2, "{first:?}");
    let agent = &admissions["agent"];
    let flow = &admissions["workflow"];
    let agent_node = wait_status(&sdk, agent["work_id"].as_str().unwrap(), "completed").await;
    assert!(
        agent_node["result"]["output"]
            .as_str()
            .unwrap()
            .contains(CHILD),
        "{agent_node}"
    );
    let flow_node = wait_status(&sdk, flow["work_id"].as_str().unwrap(), "waiting").await;
    let tree = checked(&sdk, "work.list", json!({"run_id":flow["run_id"]}))
        .await
        .data;
    let gate = tree["items"]
        .as_array()
        .unwrap()
        .iter()
        .find(|n| n["kind"] == "workflow_human")
        .unwrap()
        .clone();
    assert_eq!(gate["blocked_by"]["kind"], "human_input");
    let bookmark = checked(&sdk, "work.list", json!({"session_id":SESSION}))
        .await
        .data;
    let db_path = state.path().join("runtime.sqlite");
    let db_before = std::fs::metadata(&db_path).unwrap();
    let first_pid = initial.pid;
    let consent = json!({"work_id":gate["work_id"],"command_id":"operator-accepts-memory-audit","expected_revision":gate["revision"],
        "action":"human","response_json":json!({"expected_request":{"question":GATE},"value":true}).to_string()});
    let operator = engine(&initial.url, &format!("{token}-execute"));
    let mut permission_receipts = json!({});
    if crash_after_memory {
        let anonymous =
            Engine::new(KernelClient::new(&initial.url, None, Duration::from_secs(10)).unwrap())
                .with_operation_view(Toolset::Full.sdk());
        let reader = engine(&initial.url, &format!("{token}-read"));
        let reader_view = checked(&reader, "work.inspect", json!({"work_id":gate["work_id"]}))
            .await
            .data;
        assert_eq!(reader_view, gate);
        for (case, client, code) in [
            ("anonymous", &anonymous, "unauthorized"),
            ("read_only", &reader, "forbidden"),
        ] {
            let result = client.execute("work.control", consent.clone()).await;
            assert_eq!(result.error.as_ref().unwrap()["code"], code, "{result:?}");
            permission_receipts[case] = json!(result);
        }
        let mut stale = consent.clone();
        stale["expected_revision"] = json!("0".repeat(64));
        let result = operator.execute("work.control", stale).await;
        assert_eq!(
            result.error.as_ref().unwrap()["code"],
            "runtime_conflict",
            "{result:?}"
        );
        permission_receipts["stale_revision"] = json!(result);
        assert_eq!(
            checked(&reader, "work.inspect", json!({"work_id":gate["work_id"]}))
                .await
                .data,
            gate
        );
        eprintln!(
            "{}",
            json!({"event":"approval_permissions","receipts":permission_receipts})
        );
    }
    let (first_exit, approval_before_crash, crash_snapshot) = if crash_after_approval {
        let approval = checked(&operator, "work.control", consent.clone())
            .await
            .data;
        assert_eq!(approval["phase"], "accepted");
        let action_id = approval["action_id"].as_str().unwrap();
        eprintln!(
            "{}",
            json!({"event":"approval_committed","pid":first_pid,"receipt":approval})
        );
        let probe: Option<Value> = if crash_after_memory {
            let data = tokio::time::timeout(Duration::from_secs(120), async {
                loop {
                    match tokio::fs::read(&probe_file).await {
                        Ok(data) => return data,
                        Err(error) if error.kind() == std::io::ErrorKind::NotFound => {
                            tokio::time::sleep(Duration::from_millis(25)).await;
                        }
                        Err(error) => panic!("read memory commit probe: {error}"),
                    }
                }
            })
            .await
            .expect("Workflow did not reach the memory commit probe");
            let probe: Value = serde_json::from_slice(&data).unwrap();
            assert_eq!(probe["pid"], first_pid);
            eprintln!("{}", json!({"event":"memory_committed","probe":probe}));
            Some(probe)
        } else {
            None
        };
        let exit = initial.crash().await;
        let snapshot = audit_crash_snapshot(
            &db_path,
            action_id,
            flow["run_id"].as_str().unwrap(),
            probe.as_ref(),
        )
        .await;
        (exit, Some(approval), Some(snapshot))
    } else {
        (initial.stop().await, None, None)
    };
    let restarted = BackgroundHostProcess::start(state.path(), &access, &token, None).await;
    assert_ne!(restarted.pid, first_pid);
    let db_after = std::fs::metadata(&db_path).unwrap();
    assert_eq!(
        (db_before.dev(), db_before.ino()),
        (db_after.dev(), db_after.ino())
    );
    let sdk = engine(&restarted.url, &token);
    let gate_after_restart = checked(
        &sdk,
        "work.inspect",
        json!({"work_id":gate["work_id"],"session_id":SESSION}),
    )
    .await
    .data;
    if crash_after_approval {
        assert_eq!(gate_after_restart["work_id"], gate["work_id"]);
        assert_eq!(gate_after_restart["root_run_id"], gate["root_run_id"]);
    } else {
        assert_eq!(gate_after_restart, gate);
    }
    let recovered = checked(&sdk, "work.list", json!({"session_id":SESSION}))
        .await
        .data;
    let recovered_items = recovered["items"].as_array().unwrap();
    for target in [agent, flow] {
        assert!(
            recovered_items
                .iter()
                .any(|item| item["work_id"] == target["work_id"])
        );
    }
    let recovered_session = checked(&sdk, "session.inspect", json!({"session_id":SESSION}))
        .await
        .data;
    assert_eq!(recovered_session["session_id"], SESSION);
    assert_eq!(recovered_session["root_run_id"], ORIGIN);
    eprintln!(
        "{}",
        json!({"event":"state_recovered","pid":restarted.pid,"session_id":SESSION,
        "work_ids":[agent["work_id"],flow["work_id"]],"gate":gate_after_restart["work_id"]})
    );
    let authorized = match approval_before_crash {
        Some(approval) => approval,
        None => checked(&sdk, "work.control", consent.clone()).await.data,
    };
    let next = "background-second-turn";
    let mut goal = format!(
        "Resume your earlier coordination after the Host restart using the saved session watermark {}. Wait for committed changes and verify the terminal results of both owned programs. If either program is still running or waiting, continue waiting from the newest watermark and inspect it again. The audit mark by itself is not proof that the workflow has completed. Only after you have read completed status for both programs, read personal and project memory and return the global, worker and workflow audit markers joined by |.",
        bookmark["watermark"].as_str().unwrap()
    );
    if crash_after_memory {
        goal = format!(
            "Continue coordinating the work you previously scheduled. Use sdk_work_wait from the saved watermark {} and use sdk_work_list and sdk_work_inspect to verify the original Agent and Workflow Work IDs. The original authorized Workflow may still be recovering. If it is running, keep waiting for changes from the latest watermark and inspect again. If it is waiting and the latest inspection allows resume, you are authorized to call sdk_work_control once with action resume, the original Workflow Work ID, and current revision. Wait for the result. Do not start either program again, submit a human response, or write memory. List personal and project memory with the memory tool. Verify that both original work items reached completed and report the three recorded markers. Report any actual remaining blocker if completion cannot be verified.",
            bookmark["watermark"].as_str().unwrap()
        );
    }
    let command = json!({"command_id":next,"source_run_id":ORIGIN,"expected_source_revision":0,
        "turn":{"kind":"new","run_id":next,"input":{"text":goal,"attachments":[]}}});
    let turn = checked(
        &sdk,
        "session.turn",
        json!({"session_id":SESSION,"expected_session_revision":started["session_revision"],
        "request_json":command.to_string()}),
    )
    .await
    .data;
    if crash_after_memory {
        let audited = wait_status(&sdk, next, "completed").await;
        let verification = evidence(&sdk, next).await;
        assert!(
            verification.iter().any(|e| e["error"] == false
                && e["tool"] == "sdk_work_wait"
                && e["args"]["after"] == bookmark["watermark"]),
            "{verification:?}"
        );
        for target in [agent, flow] {
            assert!(
                verification.iter().any(|e| e["error"] == false
                    && e["tool"] == "sdk_work_inspect"
                    && e["result"]["work_id"] == target["work_id"]
                    && e["result"]["status"] == "completed"),
                "{verification:?}"
            );
        }
        assert!(
            !verification.iter().any(|e| e["tool"] == "sdk_work_start"
                || (e["tool"] == "memory" && e["args"]["operation"] == "remember")),
            "{verification:?}"
        );
        let probe = &crash_snapshot.as_ref().unwrap()["memory_probe"];
        let original_receipt = &probe["tool_result"]["value"];
        let original_target = &original_receipt["target"];
        assert!(original_target["id"].is_string());
        let items = verification
            .iter()
            .filter(|e| {
                e["error"] == false && e["tool"] == "memory" && e["args"]["operation"] == "list"
            })
            .flat_map(|e| e["result"]["items"].as_array().into_iter().flatten())
            .collect::<Vec<_>>();
        for marker in [GLOBAL, CHILD, WORKFLOW] {
            assert!(
                items.iter().any(|item| item["summary"]
                    .as_str()
                    .is_some_and(|text| text.contains(marker))),
                "missing {marker}"
            );
        }
        let workflow_memory = items
            .iter()
            .filter(|item| {
                item["summary"]
                    .as_str()
                    .is_some_and(|text| text.contains(WORKFLOW))
            })
            .map(|item| item["target"]["id"].as_str().unwrap())
            .collect::<std::collections::BTreeSet<_>>();
        assert_eq!(
            workflow_memory,
            [original_target["id"].as_str().unwrap()].into()
        );
        assert!(
            items.iter().any(|item| item["target"] == *original_target),
            "{items:?}"
        );
        let resume = verification
            .iter()
            .filter(|e| e["tool"] == "sdk_work_control")
            .collect::<Vec<_>>();
        assert!(resume.len() <= 1, "{resume:?}");
        let mut resume_action = Value::Null;
        if let Some(entry) = resume.first() {
            assert_eq!(entry["args"]["action"], "resume");
            assert_eq!(entry["args"]["work_id"], flow["work_id"]);
            assert_eq!(entry["error"], false, "{entry}");
            let id = &entry["result"]["action_id"];
            resume_action = tokio::time::timeout(Duration::from_secs(45), async {
                loop {
                    let receipt = checked(&sdk, "action.inspect", json!({"command_id":id})).await;
                    let receipt: Value = serde_json::from_str(receipt.data["native_json"].as_str().unwrap()).unwrap();
                    if receipt["finished"] == true {
                        return json!({"sequence":receipt["sequence"],"action":receipt["action"],"finished":receipt["finished"],
                            "error":receipt["error"],"pause_reason":receipt["outcome"]["Paused"]["reason"]});
                    }
                    tokio::time::sleep(Duration::from_millis(500)).await;
                }
            }).await.expect("Omni's resume command did not settle");
        }
        let workflow_after = checked(
            &sdk,
            "work.inspect",
            json!({"work_id":flow["work_id"],"include_result":true}),
        )
        .await
        .data;
        assert_eq!(workflow_after["work_id"], flow["work_id"]);
        assert_eq!(workflow_after["status"], "completed", "{workflow_after}");
        let tree_after = checked(&sdk, "work.list", json!({"run_id":flow["run_id"]}))
            .await
            .data;
        let recovery = checked(
            &sdk,
            "run.recovery",
            json!({"run_id":flow["run_id"],"kind":"child"}),
        )
        .await;
        let recovery: Value =
            serde_json::from_str(recovery.data["native_json"].as_str().unwrap()).unwrap();
        let external_changes = checked(
            &sdk,
            "work.wait",
            json!({"session_id":SESSION,"after":bookmark["watermark"],"limit":64}),
        )
        .await
        .data;
        let after_events = evidence(&sdk, flow["run_id"].as_str().unwrap()).await;
        let writes = after_events
            .iter()
            .filter(|event| event["tool"] == "memory" && event["args"]["operation"] == "remember")
            .collect::<Vec<_>>();
        assert_eq!(writes.len(), 1, "{writes:?}");
        assert_eq!(writes[0]["run_id"], probe["run_id"]);
        assert_eq!(writes[0]["call_id"], probe["call_id"]);
        assert_eq!(writes[0]["result"], *original_receipt);
        assert_eq!(writes[0]["error"], false);
        let action = checked(
            &sdk,
            "action.inspect",
            json!({"command_id":authorized["action_id"]}),
        )
        .await;
        let action: Value =
            serde_json::from_str(action.data["native_json"].as_str().unwrap()).unwrap();
        assert_eq!(
            action["sequence"],
            crash_snapshot.as_ref().unwrap()["action"]["sequence"]
        );
        assert_eq!(action["action"]["command_id"], authorized["action_id"]);
        assert_eq!(action["finished"], true);
        assert!(action["error"].is_null(), "{action}");
        let changes = external_changes["changes"].as_array().unwrap();
        assert_eq!(external_changes["more"], false);
        for kind in ["command_accepted", "command_finished"] {
            assert_eq!(
                changes
                    .iter()
                    .filter(|change| change["kind"] == kind && change["work_id"] == gate["work_id"])
                    .count(),
                1,
                "{kind}: {changes:?}"
            );
        }
        assert_eq!(
            changes
                .iter()
                .filter(|change| change["kind"] == "run"
                    && change["native_status"] == "completed"
                    && change["work_id"] == flow["work_id"])
                .count(),
            1
        );
        let second_exit = restarted.stop().await;
        let (_snapshot, store, _) = runtime_snapshot(&db_path);
        let lifecycle = memory_call_events(&store, flow["run_id"].as_str().unwrap(), probe).await;
        assert_eq!(
            lifecycle,
            json!({"started":1,"resumed":1,"completed":1,"memory_write_starts":1})
        );
        let result = json!({"model":model,"context_window":window,"host_restart":{"first_exit":first_exit,"second_exit":second_exit,
            "same_database_inode":db_after.ino(),"crash_snapshot":crash_snapshot},"permission_receipts":permission_receipts,
            "initial_receipts":first,"bookmark":bookmark,"approval":authorized,"approval_after_restart":{
                "action":action["action"],"sequence":action["sequence"],"finished":action["finished"],"error":action["error"],"pause_reason":action["outcome"]["Paused"]["reason"]},
            "work_after_restart":recovered,"durable_changes":external_changes,"workflow_after":workflow_after,"workflow_tree_after":tree_after,
            "workflow_tool_receipts_after":after_events,"workflow_memory_readback":workflow_memory,"tool_events_after":lifecycle,"new_turn":turn,
            "omni_verification":verification,"omni_result":audited,"omni_resume_receipt":resume_action,"recovery_targets":recovery,
            "fully_recovered":workflow_after["status"] == "completed"});
        if let Ok(path) = std::env::var("NOFY_LIVE_REPORT") {
            std::fs::write(path, serde_json::to_vec_pretty(&result).unwrap()).unwrap();
        }
        eprintln!(
            "{}",
            json!({"event":"memory_crash_observed","workflow_status":workflow_after["status"],"fully_recovered":result["fully_recovered"]})
        );
        return;
    }
    let flow_finished = wait_status(&sdk, flow["work_id"].as_str().unwrap(), "completed").await;
    let final_turn = wait_status(&sdk, next, "completed").await;
    let action_id = &authorized["action_id"];
    let action = checked(&sdk, "action.inspect", json!({"command_id":action_id})).await;
    let settled: Value =
        serde_json::from_str(action.data["native_json"].as_str().unwrap()).unwrap();
    assert_eq!(settled["action"]["command_id"], *action_id);
    assert_eq!(settled["finished"], true);
    assert!(settled["error"].is_null(), "{settled}");
    if let Some(snapshot) = &crash_snapshot {
        assert_eq!(settled["sequence"], snapshot["action"]["sequence"]);
    }
    let replayed = checked(&sdk, "work.control", consent).await.data;
    assert_eq!(
        replayed, authorized,
        "approval replay changed the original receipt"
    );
    let expected = format!("{GLOBAL}|{CHILD}|{WORKFLOW}");
    assert!(
        final_turn["result"]["output"]
            .as_str()
            .unwrap()
            .contains(&expected),
        "{final_turn}"
    );
    let external_changes = checked(
        &sdk,
        "work.wait",
        json!({"session_id":SESSION,"after":bookmark["watermark"],"limit":64}),
    )
    .await
    .data;
    let changes = external_changes["changes"].as_array().unwrap();
    assert_eq!(external_changes["more"], false);
    for kind in ["command_accepted", "command_finished"] {
        assert_eq!(
            changes
                .iter()
                .filter(|change| change["kind"] == kind && change["work_id"] == gate["work_id"])
                .count(),
            1,
            "{kind}: {changes:?}"
        );
    }
    assert_eq!(
        changes
            .iter()
            .filter(|change| change["kind"] == "run"
                && change["native_status"] == "completed"
                && change["work_id"] == flow["work_id"])
            .count(),
        1
    );
    let session = checked(&sdk, "session.inspect", json!({"session_id":SESSION}))
        .await
        .data;
    let verification = evidence(&sdk, next).await;
    let worker_calls = evidence(&sdk, agent["run_id"].as_str().unwrap()).await;
    let workflow_calls = evidence(&sdk, flow["run_id"].as_str().unwrap()).await;
    let write_once = |entries: &[Value], area: &str, marker: &str| {
        assert_eq!(
            entries
                .iter()
                .filter(|entry| entry["tool"] == "memory"
                    && entry["error"] == false
                    && entry["args"]["operation"] == "remember"
                    && entry["args"]["request"]["area"] == area
                    && entry["result"]["summary"]
                        .as_str()
                        .is_some_and(|value| value.contains(marker)))
                .count(),
            1,
            "expected a single write of {marker}: {entries:?}"
        );
    };
    write_once(&first, "personal", GLOBAL);
    write_once(&worker_calls, "project", CHILD);
    write_once(&workflow_calls, "project", WORKFLOW);
    assert_eq!(
        workflow_calls
            .iter()
            .filter(|entry| entry["tool"] == "workflow_agent" && entry["error"] == false)
            .count(),
        1,
        "{workflow_calls:?}"
    );
    assert!(
        !verification
            .iter()
            .any(|entry| entry["tool"] == "sdk_work_start"),
        "{verification:?}"
    );
    let check = |entries: &[Value], tool: &str, item: &str| {
        entries.iter().any(|e| {
            e["tool"] == tool && e["error"] == false && e["result"].to_string().contains(item)
        })
    };
    assert!(check(&first, "memory", GLOBAL));
    assert!(check(&worker_calls, "memory", GLOBAL) && check(&worker_calls, "memory", CHILD));
    assert!(check(&workflow_calls, "memory", CHILD) && check(&workflow_calls, "memory", WORKFLOW));
    assert!(
        check(&verification, "sdk_work_wait", "completed")
            || check(&verification, "sdk_work_wait", "command_finished"),
        "{verification:?}"
    );
    for target in [agent, flow] {
        assert!(
            verification.iter().any(|entry| {
                entry["tool"] == "sdk_work_inspect"
                    && entry["error"] == false
                    && entry["result"]["work_id"] == target["work_id"]
                    && entry["result"]["status"] == "completed"
            }),
            "Omni did not inspect completed work {}: {verification:?}",
            target["work_id"]
        );
    }
    assert!(check(&verification, "memory", GLOBAL) && check(&verification, "memory", WORKFLOW));
    let global = "background-independent-session";
    start_session(&sdk,&release,global,global,
        "Use memory list for the personal area to read the global deployment marker. Return only the exact marker.").await;
    let isolated = wait_status(&sdk, global, "completed").await;
    assert_eq!(
        isolated["result"]["output"].as_str().unwrap().trim(),
        GLOBAL
    );
    let global_calls = evidence(&sdk, global).await;
    assert!(check(&global_calls, "memory", GLOBAL));
    let wrong_scope = sdk
        .execute(
            "work.inspect",
            json!({"session_id":global,"work_id":flow["work_id"]}),
        )
        .await;
    assert!(wrong_scope.is_error(), "{wrong_scope:?}");
    let sessions = checked(&sdk, "session.list", json!({})).await.data;
    let listed = sessions["sessions"].as_array().unwrap();
    for id in [SESSION, global] {
        assert!(listed.iter().any(|session| session["session_id"] == id));
    }
    let second_exit = restarted.stop().await;
    if let Ok(path) = std::env::var("NOFY_LIVE_REPORT") {
        std::fs::write(path,serde_json::to_vec_pretty(&json!({"model":model,"context_window":window,"release":release,
            "start":started,"initial_receipts":first,"agent":agent_node,"flow_before_restart":flow_node,
            "host_restart":{"first_exit":first_exit,"second_exit":second_exit,"database":{"path":db_path,"device":db_after.dev(),"inode":db_after.ino()},"crash_snapshot":crash_snapshot},
            "bookmark":bookmark,"work_after_restart":recovered,"session_after_restart":recovered_session,
            "human_gate_before_restart":gate,"human_gate_after_restart":gate_after_restart,"operator_control":authorized,
            "approval_settlement":{"sequence":settled["sequence"],"action":settled["action"],"finished":settled["finished"],"error":settled["error"]},
            "approval_replay":replayed,"new_turn":turn,
            "flow_after_restart":flow_finished,"closed_loop":final_turn,"durable_changes":external_changes,"session_list":sessions,
            "session_inspect":session,"omni_verification":verification,"child_memory":worker_calls,"workflow_memory":workflow_calls,
            "independent_session":isolated,"global_memory":global_calls,"unrelated_session_scope_rejection":wrong_scope})).unwrap()).unwrap();
    }
}
