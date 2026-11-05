use super::*;
fn observed(value: &Value) -> Option<&Value> {
    if value.get("workspace_write").is_some() {
        return Some(value);
    }
    if let Some(map) = value.as_object() {
        for value in map.values() {
            if let Some(found) = observed(value) {
                return Some(found);
            }
        }
    }
    if let Some(array) = value.as_array() {
        for value in array {
            if let Some(found) = observed(value) {
                return Some(found);
            }
        }
    }
    None
}
#[tokio::test(flavor = "multi_thread", worker_threads = 3)]
async fn filesystem_modes_restrict_real_grants_without_mutating_declared_directory_resources() {
    let state = tempfile::tempdir().unwrap();
    let workspace = tempfile::tempdir().unwrap();
    let other = tempfile::tempdir().unwrap();
    let kernel = host(state.path()).await;
    let (url, server) = serve(&kernel).await;
    let stop = CancellationToken::new();
    let signal = stop.clone();
    let worker_host = kernel.clone();
    let worker = tokio::spawn(async move { worker_host.run_worker(signal, 1).await.unwrap() });
    let code = "import sys,json,os\njson.load(sys.stdin)\nresult={}\nfor alias,key in [('WORKSPACE','workspace_write'),('OTHER','other_write')]:\n try:\n  with open(os.path.join(os.environ['NOFY_DIRECTORY_'+alias],'effect.txt'),'a') as target: target.write('effect\\n')\n  result[key]=True\n except OSError: result[key]=False\nprint(json.dumps(result))\n";
    for (mode, expected) in [
        (
            "read_only",
            json!({"workspace_write":false,"other_write":false}),
        ),
        (
            "workspace_write",
            json!({"workspace_write":true,"other_write":false}),
        ),
        (
            "full_access",
            json!({"workspace_write":true,"other_write":true}),
        ),
    ] {
        let mut document = source(code, false);
        document["modules"]
            .as_array_mut()
            .unwrap()
            .iter_mut()
            .find(|m| m["reference"]["id"] == "limits")
            .unwrap()["config"]["filesystem_mode"] = json!(mode);
        document["modules"].as_array_mut().unwrap().extend([
            json!({"reference":r("workspace"),"factory":"resource.directory","config":{"path":workspace.path(),"access":"read_write"}}),
            json!({"reference":r("other"),"factory":"resource.directory","config":{"path":other.path(),"access":"read_write"}}),
            json!({"reference":r("probe"),"factory":"tool.process_tree_artifact","config":{"contract":{"name":"probe"},"entrypoint":"entry.py","directories":{"WORKSPACE":"workspace","OTHER":"other"}},"dependencies":{"environment":r("environment"),"artifact":r("artifact"),"tree":r("limits"),"workspace":r("workspace"),"other":r("other")}})
        ]);
        document["programs"]["probe"] = json!({"kind":"tool","definition":{"name":"mode-check","tool_packs":[r("probe")]},"call":{"id":"probe","name":"probe","arguments":{}}});
        let imported = post(&url, "/import", document).await;
        post(&url,"/runs",json!({"run_id":mode,"thread_id":mode,"system":"process-sessions","release":imported["bundle"]["digest"],"program":"probe"})).await;
        let result = tokio::time::timeout(Duration::from_secs(15), async {
            loop {
                let (_, view) = request(
                    &url,
                    reqwest::Method::GET,
                    &format!("/runs/{mode}"),
                    Value::Null,
                )
                .await;
                if !view["execution"].is_null() && view["execution"]["status"] != "running" {
                    break view;
                }
                tokio::time::sleep(Duration::from_millis(20)).await;
            }
        })
        .await
        .unwrap();
        assert_eq!(result["execution"]["status"], "completed", "{result}");
        assert_eq!(observed(&result), Some(&expected), "{result}");
    }
    assert_eq!(
        std::fs::read_to_string(workspace.path().join("effect.txt"))
            .unwrap()
            .lines()
            .count(),
        2
    );
    assert_eq!(
        std::fs::read_to_string(other.path().join("effect.txt"))
            .unwrap()
            .lines()
            .count(),
        1
    );
    stop.cancel();
    worker.await.unwrap();
    server.abort();
}
