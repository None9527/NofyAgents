use super::{
    omni::{checked, publish_release},
    *,
};
use nofy_agent_runtime::{
    RunOutcome,
    events::{RunEvent, RunStatus},
};

#[test]
#[ignore = "run the test binary inside an isolated systemd user scope with Delegate=yes"]
fn omni_runs_one_physically_confined_command() {
    tokio::runtime::Builder::new_multi_thread()
        .worker_threads(4)
        .thread_stack_size(nofy_agent_host::WORKER_STACK_BYTES)
        .enable_all()
        .build()
        .unwrap()
        .block_on(confined_command());
}

async fn confined_command() {
    assert_eq!(
        std::env::var("NOFY_LIVE_DELEGATED_SCOPE").as_deref(),
        Ok("1")
    );
    let own = std::fs::read_to_string("/proc/self/cgroup").unwrap();
    let unit = Path::new("/sys/fs/cgroup").join(
        own.lines()
            .find_map(|line| line.strip_prefix("0::"))
            .unwrap()
            .trim_start_matches('/'),
    );
    assert!(
        unit.file_name()
            .and_then(|name| name.to_str())
            .is_some_and(|name| name.starts_with("nofy-live-tree-") && name.ends_with(".scope"))
    );
    std::fs::create_dir(unit.join("kernel")).unwrap();
    std::fs::write(unit.join("kernel/cgroup.procs"), "0").unwrap();
    std::fs::write(unit.join("cgroup.subtree_control"), "+cpu +memory +pids").unwrap();
    let jobs = unit.join("jobs");
    std::fs::create_dir(&jobs).unwrap();
    std::fs::write(jobs.join("cgroup.subtree_control"), "+cpu +memory +pids").unwrap();

    let endpoint = std::env::var("NOFY_LIVE_MODEL_URL").unwrap();
    let model = std::env::var("NOFY_LIVE_MODEL").unwrap();
    let state = tempfile::tempdir().unwrap();
    let workspace = tempfile::tempdir().unwrap();
    let kernel = host(state.path()).await;
    let service = serve(kernel.router()).await;
    let sdk = engine(&service.url, ADMIN);
    let source: Source = serde_json::from_value(
        checked(&sdk, "project.template", json!({})).await.data["source"].clone(),
    )
    .unwrap();
    let configured = checked(&sdk,"agent.configure",json!({"agent":"main","target":{"kind":"source","source":source,"expected_digest":source.digest().unwrap()},
        "settings":{"connection":{"base_url":endpoint,"models":[model],"allow_insecure_http":true,"timeout_ms":120000},"model":model,
            "model_settings":{"stream":true,"max_output_tokens":384},"allowed_tools":["run_command"],"max_steps":8,"command_enabled":true,"workspace":workspace.path(),
            "command_environment":{"executable":"/usr/bin/python3","prefix_args":["-s","-B"],"env":{"LANG":"C.UTF-8"},
                "paths":[{"path":"/usr","execute":true},{"path":"/lib","execute":true},{"path":"/lib64","execute":true},{"path":"/etc/ld.so.cache"}]},
            "process_tree":{"cgroup_root":jobs,"limits":{"max_processes":12,"max_memory_bytes":134217728,"cpu_percent":100}}}})).await;
    let release = publish_release(&sdk, &configured.data["source"]).await;
    let stop = tokio_util::sync::CancellationToken::new();
    let worker = tokio::spawn({
        let stop = stop.clone();
        let kernel = kernel.clone();
        async move { kernel.run_worker(stop, 2).await.unwrap() }
    });
    let run = "omni-confined-command";
    let argv = [
        "/usr/bin/python3",
        "-I",
        "-c",
        "import time; time.sleep(1.1); print('MAPLE-3938')",
    ];
    let input = format!(
        "Verify one sandboxed command invocation. Call run_command using exactly this argv {} and omit all optional arguments. The operator has granted this one command. Wait for the tool result and return only its stdout with whitespace trimmed.",
        json!(argv)
    );
    let request = json!({"system":"omni","release":release,"program":"main","run_id":run,"thread_id":run,"input":{"text":input,"attachments":[]}});
    checked(&sdk,"session.start",json!({"session_id":run,"command_id":run,"expected_session_revision":null,"request_json":request.to_string()})).await;
    let mut cursor = 0;
    let mut approval = None;
    let mut limits = None;
    let mut execution = None;
    let output=tokio::time::timeout(Duration::from_secs(150),async{
        loop {
            for entry in kernel.store().events(run,cursor,200).await.unwrap(){
                cursor=entry.cursor;
                match entry.event {
                    RunEvent::Terminated {status:RunStatus::Paused,reason:Some(reason)} if reason["kind"]=="approval" => {
                        assert!(approval.is_none());
                        let original=&reason["request"];
                        assert_eq!(original["call"]["name"],"run_command");
                        assert_eq!(original["call"]["arguments"],json!({"argv":argv}));
                        let decision=json!({"request":original,"allow":true,"scope":"once"});
                        checked(&sdk,"run.decide",json!({"run_id":run,"decision_json":decision.to_string()})).await;
                        let resume=json!({"command_id":"resume-confined-command","run_id":run,"command":{"kind":"resume"}});
                        checked(&sdk,"run.control",json!({"action_json":resume.to_string()})).await;
                        approval=Some(json!({"cursor":cursor,"request":original}));
                    }
                    RunEvent::ToolCompleted{call_id,result,is_error} if approval.as_ref().is_some_and(|a| a["request"]["call"]["id"]==call_id) => {
                        assert!(!is_error,"{result}");
                        assert_eq!(result["value"]["ok"],true,"{result}");
                        assert_eq!(result["value"]["result"]["exit_code"],0);
                        assert_eq!(result["value"]["result"]["stdout"],"MAPLE-3938\n");
                        execution=Some(json!({"cursor":cursor,"result":result["value"]}));
                    }
                    _=>{}
                }
            }
            if limits.is_none(){
                for item in std::fs::read_dir(&jobs).unwrap().filter_map(Result::ok){
                    let leaf=item.path();
                    if let (Ok(pids),Ok(memory),Ok(processes))=(std::fs::read_to_string(leaf.join("cgroup.procs")),std::fs::read_to_string(leaf.join("memory.max")),std::fs::read_to_string(leaf.join("pids.max")))
                        && !pids.trim().is_empty() && memory.trim()=="134217728" && processes.trim()=="12" {
                        limits=Some(json!({"memory_max":memory.trim(),"pids_max":processes.trim(),"live_processes":pids.lines().count()}));
                    }
                }
            }
            if let Some(record)=kernel.store().execution_record(run).await.unwrap(){
                if let Some(RunOutcome::Completed {output,..})=record.outcome {break output;}
                assert!(!matches!(record.status.as_str(),"failed"|"budget_exceeded"|"cancelled"),"{:?}",record.error);
            }
            tokio::time::sleep(Duration::from_millis(40)).await;
        }
    }).await.expect("live process tree deadline");
    assert_eq!(output.trim(), "MAPLE-3938");
    assert!(approval.is_some() && limits.is_some() && execution.is_some());
    assert!(
        std::fs::read_dir(&jobs)
            .unwrap()
            .filter_map(Result::ok)
            .all(|entry| !entry.path().is_dir())
    );
    if let Ok(path) = std::env::var("NOFY_LIVE_REPORT") {
        let report = json!({"model":model,"factories":["resource.process_tree_limits","tool.process_tree_artifact"],"release":release,"run":run,
            "output":output,"approval":approval,"physical_limits":limits,"tool_execution":execution});
        std::fs::write(path, serde_json::to_vec_pretty(&report).unwrap()).unwrap();
    }
    stop.cancel();
    worker.await.unwrap();
}
