//! Real namespace processes, terminal IO, durable inputs and stdio MCP.
#![cfg(target_os = "linux")]
use nofy_agent_host::{
    KernelHost,
    auth::{Authorizer, Scope},
    credentials::FileCredentials,
    native,
};
use serde_json::{Value, json};
use std::{path::Path, sync::Arc, time::Duration};
use tokio_util::sync::CancellationToken;
const TOKEN: &str = "process-session-test-administrator-000000000001";
const HELPER: &str = env!("CARGO_BIN_EXE_nofy-agent-host");
#[path = "process_sessions/network.rs"]
mod network;
#[path = "process_sessions/permissions.rs"]
mod permissions;
fn r(id: &str) -> Value {
    json!({"id":id,"version":"1"})
}
async fn host(path: &Path) -> KernelHost {
    let credentials =
        Arc::new(FileCredentials::open(path.join("credentials.json"), "sessions", None).unwrap());
    KernelHost::open(
        path,
        native::registry(credentials).unwrap(),
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
        .unwrap(),
    )
    .await
    .unwrap()
    .with_loader_helper(Path::new(HELPER))
    .unwrap()
}
fn source(code: &str, terminal: bool) -> Value {
    json!({"schema_version":1,"name":"process-sessions","modules":[
        {"reference":r("environment"),"factory":"resource.process_local","config":{"executable":"/usr/bin/python3","prefix_args":["-s","-B","-u"],"env":{"PATH":"/usr/bin:/bin","LANG":"C.UTF-8"},"paths":[{"path":"/usr","execute":true},{"path":"/lib","execute":true},{"path":"/lib64","execute":true}]}},
        {"reference":r("artifact"),"factory":"resource.artifact","config":{"bundle":{"schema_version":1,"files":{"entry.py":code}}}},
        {"reference":r("limits"),"factory":"resource.process_namespace_limits","config":{"cpu_seconds":10}},
        {"reference":r("session"),"factory":"resource.process_session","config":{"entrypoint":"entry.py","terminal":terminal,"timeout_ms":30000},"dependencies":{"environment":r("environment"),"artifact":r("artifact"),"limits":r("limits")}},
        {"reference":r("terminal"),"factory":"tool.terminal","config":{},"dependencies":{"session":r("session")}}
    ],"programs":{"terminal":{"kind":"tool","definition":{"name":"terminal","tool_packs":[r("terminal")]},"call":{"id":"start","name":"terminal","arguments":{"op":"start","start_id":"model-start"}}}}})
}
async fn serve(host: &KernelHost) -> (String, tokio::task::JoinHandle<()>) {
    let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    let url = format!("http://{}", listener.local_addr().unwrap());
    let router = host.router();
    (
        url,
        tokio::spawn(async move { axum::serve(listener, router).await.unwrap() }),
    )
}
async fn request(url: &str, method: reqwest::Method, path: &str, body: Value) -> (u16, Value) {
    let response = reqwest::Client::new()
        .request(method, format!("{url}/api/v1{path}"))
        .bearer_auth(TOKEN)
        .json(&body)
        .send()
        .await
        .unwrap();
    let status = response.status().as_u16();
    let bytes = response.bytes().await.unwrap();
    (
        status,
        if bytes.is_empty() {
            Value::Null
        } else {
            serde_json::from_slice(&bytes).unwrap()
        },
    )
}
async fn post(url: &str, path: &str, body: Value) -> Value {
    let (status, value) = request(url, reqwest::Method::POST, path, body).await;
    assert!((200..300).contains(&status), "{status}: {value}");
    value
}
async fn terminal(url: &str, release: &Value, action: Value) -> Value {
    post(url,"/terminal",json!({"release":release,"module_ref":r("session"),"owner":"operator-test","action":action})).await
}
async fn until(url: &str, release: &Value, id: &Value, needle: &str) -> Value {
    let mut last = Value::Null;
    tokio::time::timeout(Duration::from_secs(15), async {
        loop {
            let view = terminal(
                url,
                release,
                json!({"op":"poll","session_id":id,"wait_ms":100}),
            )
            .await;
            last = view.clone();
            if view["stdout"]["text"]
                .as_str()
                .unwrap_or("")
                .contains(needle)
            {
                return view;
            }
            assert_ne!(view["eof"], true, "missing {needle}: {view}");
        }
    })
    .await
    .unwrap_or_else(|_| panic!("missing {needle}; last terminal view: {last}"))
}
#[tokio::test(flavor = "multi_thread", worker_threads = 3)]
async fn pty_receipts_resize_tree_close_and_restart_use_real_processes() {
    let state = tempfile::tempdir().unwrap();
    let kernel = host(state.path()).await;
    let (url, server) = serve(&kernel).await;
    let code = "import os,sys,json,fcntl,termios,struct,time\nprint(json.dumps({'tty':all(os.isatty(fd) for fd in [0,1,2])}))\nfor line in sys.stdin:\n if line.strip()=='size':\n  print('size='+str(struct.unpack('HHHH',fcntl.ioctl(0,termios.TIOCGWINSZ,b'\\0'*8))[:2]))\n else: print('received='+line.strip())\n";
    let published = post(&url, "/import", source(code, true)).await;
    let release = published["bundle"]["digest"].clone();
    let start = terminal(&url, &release, json!({"op":"start","start_id":"once"})).await;
    let id = start["session_id"].clone();
    let again = terminal(&url, &release, json!({"op":"start","start_id":"once"})).await;
    assert_eq!(again["session_id"], id);
    let ready = until(&url, &release, &id, "\"tty\": true").await;
    assert_eq!(ready["terminal"], true);
    let input = json!({"op":"write","session_id":id,"command_id":"one-input","text":"one\n"});
    let first = terminal(&url, &release, input.clone()).await;
    let repeated = terminal(&url, &release, input).await;
    assert_eq!(first["receipt"], repeated["receipt"]);
    assert_eq!(first["receipt"]["state"], "committed");
    let conflicting = json!({"release":release,"module_ref":r("session"),"owner":"operator-test","action":{"op":"write","session_id":id,"command_id":"one-input","text":"different\n"}});
    assert_eq!(
        request(&url, reqwest::Method::POST, "/terminal", conflicting)
            .await
            .0,
        409
    );
    let printed = until(&url, &release, &id, "received=one").await;
    assert_eq!(
        printed["stdout"]["text"]
            .as_str()
            .unwrap()
            .matches("received=one")
            .count(),
        1
    );
    terminal(
        &url,
        &release,
        json!({"op":"resize","session_id":id,"rows":31,"columns":101}),
    )
    .await;
    terminal(
        &url,
        &release,
        json!({"op":"write","session_id":id,"command_id":"size-input","text":"size\n"}),
    )
    .await;
    until(&url, &release, &id, "size=(31, 101)").await;
    let closed = terminal(&url, &release, json!({"op":"close","session_id":id})).await;
    assert_eq!(closed["eof"], true);
    assert_eq!(closed["state"], "closed");
    kernel.shutdown();
    kernel.loader().process_sessions.drain().await.unwrap();
    server.abort();
    drop(kernel);
    let reopened = host(state.path()).await;
    let (url, server) = serve(&reopened).await;
    let recovered = terminal(&url, &release, json!({"op":"poll","session_id":id})).await;
    assert_eq!(recovered["inputs"]["one-input"]["state"], "committed");
    assert_eq!(recovered["state"], "closed");
    reopened.shutdown();
    reopened.loader().process_sessions.drain().await.unwrap();
    server.abort();
}
#[tokio::test(flavor = "multi_thread", worker_threads = 3)]
async fn namespace_command_and_stdio_catalog_run_on_original_tool_runtime() {
    let state = tempfile::tempdir().unwrap();
    let kernel = host(state.path()).await;
    let (url, server) = serve(&kernel).await;
    let code = r#"import sys,json
for line in sys.stdin:
 m=json.loads(line)
 if 'id' not in m: continue
 method=m['method']
 if method=='initialize': result={'protocolVersion':'2025-11-25','capabilities':{'tools':{}},'serverInfo':{'name':'actual-python-server','version':'1'}}
 elif method=='tools/list': result={'tools':[{'name':'echo','description':'Return supplied JSON','inputSchema':{'type':'object','required':['value'],'properties':{'value':{'type':'integer'}}}}]}
 elif method=='tools/call': result={'content':[{'type':'text','text':'actual-result='+str(m['params']['arguments']['value'])}]}
 else: result={}
 print(json.dumps({'jsonrpc':'2.0','id':m['id'],'result':result}),flush=True)
"#;
    let mut document = source(code, false);
    document["modules"].as_array_mut().unwrap().extend([
        json!({"reference":r("connection"),"factory":"resource.mcp_stdio","config":{},"dependencies":{"session":r("session")}}),
        json!({"reference":r("tools"),"factory":"tool_source.mcp","config":{"namespace":"local","allowed_tools":["echo"]},"dependencies":{"connection":r("connection")}}),
        json!({"reference":r("command-source"),"factory":"resource.artifact","config":{"bundle":{"schema_version":1,"files":{"entry.py":"import sys,json,os\nargs=json.load(sys.stdin)\npid=os.fork()\nif pid==0: os._exit(0)\nos.waitpid(pid,0)\nprint(json.dumps({'value':args['value'],'fork':True}))\n"}}}}),
        json!({"reference":r("command"),"factory":"tool.process_tree_artifact","config":{"contract":{"name":"command"},"entrypoint":"entry.py"},"dependencies":{"environment":r("environment"),"artifact":r("command-source"),"tree":r("limits")}})
    ]);
    document["programs"]["mcp"] = json!({"kind":"tool","definition":{"name":"stdio-mcp","tool_sources":[r("tools")]},"call":{"id":"original-call","name":"local_echo","arguments":{"value":37}}});
    document["programs"]["command"] = json!({"kind":"tool","definition":{"name":"namespace-command","tool_packs":[r("command")]},"call":{"id":"original-command","name":"command","arguments":{"value":41}}});
    let imported = post(&url, "/import", document).await;
    let release = &imported["bundle"]["digest"];
    let stop = CancellationToken::new();
    let worker_kernel = kernel.clone();
    let worker_stop = stop.clone();
    let worker =
        tokio::spawn(async move { worker_kernel.run_worker(worker_stop, 2).await.unwrap() });
    for (program, needle) in [("mcp", "actual-result=37"), ("command", "41")] {
        post(&url,"/runs",json!({"run_id":program,"thread_id":program,"system":"process-sessions","release":release,"program":program})).await;
        let result = tokio::time::timeout(Duration::from_secs(20), async {
            loop {
                let (status, value) = request(
                    &url,
                    reqwest::Method::GET,
                    &format!("/runs/{program}"),
                    Value::Null,
                )
                .await;
                assert_eq!(status, 200);
                if !value["execution"].is_null() && value["execution"]["status"] != "running" {
                    break value;
                }
                tokio::time::sleep(Duration::from_millis(20)).await;
            }
        })
        .await
        .unwrap();
        assert_eq!(result["execution"]["status"], "completed", "{result}");
        assert!(result.to_string().contains(needle), "{result}");
    }
    stop.cancel();
    worker.await.unwrap();
    server.abort();
}
