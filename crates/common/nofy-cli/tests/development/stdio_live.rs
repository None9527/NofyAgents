use super::{
    omni::{checked, run_session_with_input},
    *,
};
use nofy_agent_runtime::{RunOutcome, events::RunEvent};

const SERVER: &str = r#"import sys,json,resource
for line in sys.stdin:
 m=json.loads(line)
 if 'id' not in m: continue
 method=m['method']
 if method=='initialize': result={'protocolVersion':'2025-11-25','capabilities':{'tools':{}},'serverInfo':{'name':'local-receipt','version':'1'}}
 elif method=='tools/list': result={'tools':[{'name':'receipt','description':'Return the sealed receipt and enforced CPU limit for an integer.','inputSchema':{'type':'object','required':['value'],'properties':{'value':{'type':'integer'}}}}]}
 elif method=='tools/call' and m['params']['name']=='receipt':
  result={'content':[{'type':'text','text':f"CROCUS-62|{m['params']['arguments']['value']}|{resource.getrlimit(resource.RLIMIT_CPU)[0]}"}]}
 else: result={}
 print(json.dumps({'jsonrpc':'2.0','id':m['id'],'result':result}),flush=True)
"#;
const CONSOLE: &str = "import os,sys\nprint('LOTUS-142|'+('PTY' if all(os.isatty(fd) for fd in (0,1,2)) else 'PIPE'),flush=True)\nsys.stdin.readline()\n";

#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
#[ignore = "requires a real local model and Linux namespaces"]
async fn omni_observes_a_real_stdio_mcp_process_receipt() {
    live_process_session(false).await;
}

#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
#[ignore = "requires a real local model and Linux PTY confinement"]
async fn omni_starts_polls_and_closes_a_real_terminal() {
    live_process_session(true).await;
}

async fn live_process_session(terminal: bool) {
    let endpoint = std::env::var("NOFY_LIVE_MODEL_URL").unwrap();
    let model = std::env::var("NOFY_LIVE_MODEL").unwrap();
    let state = tempfile::tempdir().unwrap();
    let kernel = host(state.path()).await;
    let server = serve(kernel.router()).await;
    let sdk = engine(&server.url, ADMIN);
    let source: Source = serde_json::from_value(
        checked(&sdk, "project.template", json!({})).await.data["source"].clone(),
    )
    .unwrap();
    let tool = if terminal {
        "terminal"
    } else {
        "stdio_receipt"
    };
    let configured=checked(&sdk,"agent.configure",json!({"agent":"main","target":{"kind":"source","source":source,"expected_digest":source.digest().unwrap()},
        "settings":{"connection":{"base_url":endpoint,"models":[model],"allow_insecure_http":true,"timeout_ms":120000},"model":model,
            "model_settings":{"stream":true,"max_output_tokens":256},"max_steps":8,"allowed_tools":[tool]}})).await;
    let built = checked(
        &sdk,
        "agent.build",
        json!({"agent":"main","target":{"kind":"source","source":configured.data["source"]}}),
    )
    .await;
    let mut deployment: Value =
        serde_json::from_str(built.data["deployment_json"].as_str().unwrap()).unwrap();
    let r = |id: &str| json!({"id":format!("stdio-live-{id}"),"version":"1"});
    let modules = deployment["system"]["modules"].as_array_mut().unwrap();
    modules.extend([
        json!({"reference":r("environment"),"factory":"resource.process_local","config":{"executable":"/usr/bin/python3","prefix_args":["-s","-B","-u"],"env":{"LANG":"C.UTF-8"},"paths":[{"path":"/usr","execute":true},{"path":"/lib","execute":true},{"path":"/lib64","execute":true}]}}),
        json!({"reference":r("artifact"),"factory":"resource.artifact","config":{"bundle":{"schema_version":1,"files":{"entry.py":if terminal {CONSOLE} else {SERVER}}}}}),
        json!({"reference":r("limits"),"factory":"resource.process_namespace_limits","config":{"cpu_seconds":10}}),
        json!({"reference":r("session"),"factory":"resource.process_session","config":{"entrypoint":"entry.py","terminal":terminal,"timeout_ms":if terminal {180000} else {30000}},
            "dependencies":{"environment":r("environment"),"artifact":r("artifact"),"limits":r("limits")}}),
    ]);
    if terminal {
        modules.push(json!({"reference":r("terminal"),"factory":"tool.terminal","config":{},"dependencies":{"session":r("session")}}));
    } else {
        modules.extend([
            json!({"reference":r("connection"),"factory":"resource.mcp_stdio","config":{},"dependencies":{"session":r("session")}}),
            json!({"reference":r("source"),"factory":"tool_source.mcp","config":{"namespace":"stdio","allowed_tools":["receipt"]},"dependencies":{"connection":r("connection")}}),
        ]);
    }
    let main = &mut deployment["system"]["programs"]["main"]["definition"];
    if terminal {
        main["tool_packs"]
            .as_array_mut()
            .unwrap()
            .push(r("terminal"));
    } else {
        main["tool_sources"] = json!([r("source")]);
    }
    let published = checked(
        &sdk,
        "system.publish",
        json!({"document_json":deployment.to_string()}),
    )
    .await;
    let release = published.refs["release"].as_deref().unwrap();
    let stop = tokio_util::sync::CancellationToken::new();
    let worker = tokio::spawn({
        let kernel = kernel.clone();
        let stop = stop.clone();
        async move { kernel.run_worker(stop, 2).await.unwrap() }
    });
    let (run, goal, expected) = if terminal {
        (
            "omni-pty-live",
            "Verify the granted isolated terminal. Start its configured process, poll stdout until it returns a receipt, then close the same terminal session. Return exactly the receipt read from stdout, trimming line endings.",
            "LOTUS-142|PTY",
        )
    } else {
        (
            "omni-stdio-live",
            "Test the granted isolated MCP receipt tool. Call stdio_receipt with integer value 37. Return only the exact receipt from the tool.",
            "CROCUS-62|37|10",
        )
    };
    run_session_with_input(&sdk, "omni", release, run, goal).await;
    let Some(RunOutcome::Completed { output, .. }) = kernel
        .store()
        .execution_record(run)
        .await
        .unwrap()
        .unwrap()
        .outcome
    else {
        unreachable!()
    };
    assert_eq!(output.trim(), expected);
    let events = kernel.store().events(run, 0, 200).await.unwrap();
    if terminal {
        let calls: std::collections::BTreeMap<_, _> = events
            .iter()
            .filter_map(|entry| match &entry.event {
                RunEvent::ToolStarted { call } if call.name == "terminal" => {
                    Some((&call.id, &call.arguments))
                }
                _ => None,
            })
            .collect();
        let receipts: Vec<_> = events
            .iter()
            .filter_map(|entry| match &entry.event {
                RunEvent::ToolCompleted {
                    call_id,
                    result,
                    is_error: false,
                } => calls.get(call_id).map(
                    |args| json!({"cursor":entry.cursor,"arguments":args,"value":result["value"]}),
                ),
                _ => None,
            })
            .collect();
        let opened = receipts
            .iter()
            .find(|r| r["arguments"]["op"] == "start")
            .expect("real terminal start");
        let id = opened["value"]["session_id"]
            .as_str()
            .expect("physical terminal session id");
        assert!(receipts.iter().any(|r| {
            r["arguments"]["op"] == "poll"
                && r["arguments"]["session_id"] == id
                && r["value"]["stdout"]["text"]
                    .as_str()
                    .is_some_and(|text| text.contains(expected))
        }));
        assert!(
            receipts.iter().any(|r| r["arguments"]["op"] == "close"
                && r["arguments"]["session_id"] == id
                && r["value"]["state"] == "closed"),
            "{receipts:?}"
        );
        if let Ok(path) = std::env::var("NOFY_LIVE_REPORT") {
            let report = json!({"model":model,"run":run,"release":release,"output":output,"factories":["tool.terminal"],"receipts":receipts});
            std::fs::write(path, serde_json::to_vec_pretty(&report).unwrap()).unwrap();
        }
        stop.cancel();
        worker.await.unwrap();
        return;
    }
    let (start, call) = events
        .iter()
        .find_map(|entry| match &entry.event {
            RunEvent::ToolStarted { call }
                if call.name == "stdio_receipt" && call.arguments["value"] == 37 =>
            {
                Some((entry.cursor, call))
            }
            _ => None,
        })
        .expect("real MCP call");
    let (finish, result) = events
        .iter()
        .find_map(|entry| match &entry.event {
            RunEvent::ToolCompleted {
                call_id,
                result,
                is_error: false,
            } if call_id == &call.id && result.to_string().contains(expected) => {
                Some((entry.cursor, result))
            }
            _ => None,
        })
        .expect("MCP subprocess returned its enforced limit and receipt");
    if let Ok(path) = std::env::var("NOFY_LIVE_REPORT") {
        let report = json!({"model":model,"run":run,"release":release,"factories":["resource.mcp_stdio","resource.process_namespace_limits","resource.process_session"],
            "started_cursor":start,"call":call,"completed_cursor":finish,"result":result,"output":output});
        std::fs::write(path, serde_json::to_vec_pretty(&report).unwrap()).unwrap();
    }
    stop.cancel();
    worker.await.unwrap();
}
