use super::*;
use nofy_agent_runtime::{
    Checkpointer, ModelResponse,
    governance::{BudgetScope, BudgetStore},
    registry::{ModuleInstance, ModuleRef},
    system::content_digest,
};
#[path = "semantic/concurrent.rs"]
mod concurrent;
#[path = "semantic/live.rs"]
mod live;
#[path = "semantic/recovery.rs"]
mod recovery;

#[derive(Clone)]
struct Wire {
    embeddings: Arc<Mutex<Vec<Value>>>,
    chats: Arc<Mutex<Vec<Value>>>,
    embedding_entered: Arc<tokio::sync::Notify>,
    primary_entered: Arc<tokio::sync::Notify>,
    embedding_gate: CancellationToken,
    primary_gate: CancellationToken,
    hold_embedding: Arc<std::sync::atomic::AtomicBool>,
    tool_mode: bool,
    effects: Arc<AtomicUsize>,
    malformed: Arc<std::sync::atomic::AtomicBool>,
}
impl Wire {
    fn new(tool_mode: bool) -> Self {
        let primary_gate = CancellationToken::new();
        if !tool_mode {
            primary_gate.cancel();
        }
        Self {
            embeddings: Default::default(),
            chats: Default::default(),
            embedding_entered: Default::default(),
            primary_entered: Default::default(),
            embedding_gate: CancellationToken::new(),
            primary_gate,
            hold_embedding: Default::default(),
            tool_mode,
            effects: Default::default(),
            malformed: Default::default(),
        }
    }
}
fn vector(text: &str, model: &str) -> Vec<f32> {
    let matches = text.contains("Saturn") || text.contains("orbital");
    if model == "alternate-embedding" {
        if matches {
            vec![0.0, 1.0]
        } else {
            vec![-1.0, 0.0]
        }
    } else if matches {
        vec![1.0, 0.0]
    } else {
        vec![0.0, 1.0]
    }
}
fn embedding_response(body: &Value) -> Value {
    let texts = body["input"].as_array().unwrap();
    let model = body["model"].as_str().unwrap();
    let data = texts
        .iter()
        .enumerate()
        .rev()
        .map(
            |(index, text)| json!({"index":index,"embedding":vector(text.as_str().unwrap(),model)}),
        )
        .collect::<Vec<_>>();
    json!({"model":model,"data":data,"usage":{"prompt_tokens":texts.len()*3,"total_tokens":texts.len()*3}})
}
async fn fixture(wire: &Wire) -> Serving {
    let embedding = wire.clone();
    let primary = wire.clone();
    let effects = wire.effects.clone();
    serve(Router::new().route("/v1/embeddings",route_post(move|Json(body):Json<Value>|{
        let wire=embedding.clone();async move{
            wire.embeddings.lock().unwrap().push(body.clone());wire.embedding_entered.notify_one();
            if wire.hold_embedding.load(Ordering::SeqCst){wire.embedding_gate.cancelled().await;}
            let mut response=embedding_response(&body);
            if wire.malformed.load(Ordering::SeqCst){response["data"][0]["embedding"]=json!([0,0]);}
            Json(response)
        }
    })).route("/v1/chat/completions",route_post(move|Json(body):Json<Value>|{
        let wire=primary.clone();async move{
            wire.chats.lock().unwrap().push(body.clone());wire.primary_entered.notify_one();
            let done=body["messages"].as_array().unwrap().iter().any(|m|m["role"]=="tool");
            let frames=if wire.tool_mode && !done {
                wire.primary_gate.cancelled().await;
                nofy_test_support::sse::chat_completions_reasoning_then_tool_call_events("","effect-once","effect","{}","local-model").into_iter().map(|frame|axum::response::sse::Event::default().data(frame.data)).collect()
            }else{
                let retrieved=body["messages"].as_array().unwrap().iter().any(|m|m["role"]=="user"&&m["content"].as_str().is_some_and(|s|s.contains("Saturn")));
                nofy_test_support::sse::chat_completion_events_exact(if retrieved{"SATURN-RETRIEVED"}else{"NO-SEMANTIC-HIT"},"local-model")
            };
            Sse::new(futures::stream::iter(frames.into_iter().map(Ok::<_,Infallible>)))
        }
    })).route("/service/effect",route_post(move||{let effects=effects.clone();async move{effects.fetch_add(1,Ordering::SeqCst);Json(json!({"done":true}))}}))).await
}
fn r(id: &str) -> Value {
    json!({"id":id,"version":"1"})
}
fn config<'a>(source: &'a mut Value, id: &str) -> &'a mut Value {
    &mut source["modules"]
        .as_array_mut()
        .unwrap()
        .iter_mut()
        .find(|m| m["reference"]["id"] == id)
        .unwrap()["config"]
}
fn source(url: &str, unmetered: bool, tool_mode: bool) -> Value {
    let mut source: Value =
        serde_json::from_str(include_str!("../../examples/semantic-memory-system.json")).unwrap();
    let provider = config(&mut source, "provider");
    provider["base_url"] = json!(format!("{url}/v1/"));
    provider["models"] = json!(["local-model", "local-embedding", "alternate-embedding"]);
    provider["endpoint_limits"]["alternate-embedding"] =
        json!({"max_input_tokens":8192,"max_output_tokens":1});
    config(&mut source, "semantic")["dimensions"] = json!(2);
    if unmetered {
        source
            .as_object_mut()
            .unwrap()
            .remove("required_governance");
    }
    if tool_mode {
        source["modules"].as_array_mut().unwrap().extend([
            json!({"reference":r("effect-connection"),"factory":"resource.http","config":{"base_url":format!("{url}/service/"),"methods":["POST"]}}),
            json!({"reference":r("effect"),"factory":"tool.http_connected","config":{"contract":{"name":"effect"},"path":"effect","method":"POST"},"dependencies":{"connection":r("effect-connection")}})
        ]);
        source["programs"]["chat"]["definition"]["tool_packs"] = json!([r("effect")]);
    }
    source
}
fn submission(release: &str, id: &str, program: &str) -> Value {
    let mut value = json!({"system":"semantic-memory","release":release,"run_id":id,"thread_id":id,"program":program});
    if program == "chat" {
        value["input"] = json!({"text":"orbital transport","attachments":[]});
    }
    value
}
fn output(record: &Value) -> &str {
    assert_eq!(record["execution"]["status"], "completed", "{record}");
    record["execution"]["outcome"]["Completed"]["output"]
        .as_str()
        .unwrap()
}
fn start(host: &KernelHost) -> (CancellationToken, tokio::task::JoinHandle<()>) {
    let stop = CancellationToken::new();
    let signal = stop.clone();
    let host = host.clone();
    (
        stop,
        tokio::spawn(async move { host.run_worker(signal, 2).await.unwrap() }),
    )
}
async fn write(server: &Serving, release: &str, id: &str, area: &str, text: &str) -> Value {
    let mut request = submission(release, id, "remember");
    request["parameters"] = json!({"operation":"remember","request":{"area":area,"statement":text,"confirm_sensitive":false}});
    post(server, "/api/v1/runs", request).await;
    serde_json::from_str::<Value>(output(&outcome(server, id).await)).unwrap()["value"].clone()
}
fn canonical(root: &std::path::Path) -> std::collections::BTreeMap<String, Vec<u8>> {
    fn visit(path: &std::path::Path, result: &mut std::collections::BTreeMap<String, Vec<u8>>) {
        if !path.exists() {
            return;
        }
        for item in std::fs::read_dir(path).unwrap() {
            let path = item.unwrap().path();
            if path.is_dir() {
                visit(&path, result);
            } else if path.extension().is_some_and(|e| e == "md") {
                result.insert(path.to_string_lossy().into(), std::fs::read(path).unwrap());
            }
        }
    }
    let mut result = Default::default();
    visit(&root.join("memory"), &mut result);
    result
}
#[tokio::test]
async fn declared_semantic_memory_is_pure_then_retrieves_caches_forgets_and_rebuilds() {
    let wire = Wire::new(false);
    let remote = fixture(&wire).await;
    let dir = tempfile::tempdir().unwrap();
    let reads = Arc::new(AtomicUsize::new(0));
    let host = host(dir.path(), reads.clone()).await;
    let server = serve(host.router()).await;
    let doc = source(&remote.url, false, false);
    let artifact = &doc["modules"]
        .as_array()
        .unwrap()
        .iter()
        .find(|m| m["reference"]["id"] == "embedding-code")
        .unwrap()["config"];
    assert_eq!(
        artifact["bundle"]["files"]["embeddings.rhai"],
        include_str!("../../../../../modules/embedding/embeddings.rhai")
    );
    assert_eq!(
        artifact["bundle"]["files"]["parameters.schema.json"],
        include_str!("../../../../../modules/embedding/parameters.schema.json")
    );
    post(&server, "/api/v1/validate", doc.clone()).await;
    let release = post(&server, "/api/v1/import", doc.clone()).await["bundle"]["digest"]
        .as_str()
        .unwrap()
        .to_owned();
    assert_eq!(reads.load(Ordering::SeqCst), 0);
    assert!(!dir.path().join("memory").exists());
    assert!(wire.embeddings.lock().unwrap().is_empty());
    let mut bad = doc.clone();
    config(&mut bad, "semantic")["read"] = json!(["personal"]);
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/validate",
            ADMIN,
            bad
        )
        .await
        .0,
        422
    );
    let (stop, worker) = start(&host);
    let created = write(
        &server,
        &release,
        "fact",
        "project",
        "The Saturn launcher lifts satellites.",
    )
    .await;
    write(
        &server,
        &release,
        "other",
        "project",
        "Fresh sourdough needs flour.",
    )
    .await;
    let original = canonical(dir.path());
    for id in ["first", "cached"] {
        post(&server, "/api/v1/runs", submission(&release, id, "chat")).await;
        assert_eq!(output(&outcome(&server, id).await), "SATURN-RETRIEVED");
        assert_eq!(canonical(dir.path()), original);
    }
    let embedding = wire.embeddings.lock().unwrap().clone();
    assert_eq!(embedding.len(), 3);
    assert!(
        embedding[0]["input"]
            .as_array()
            .unwrap()
            .iter()
            .any(|v| v.as_str().unwrap().contains("Saturn"))
    );
    assert_eq!(embedding[1]["input"], json!(["orbital transport"]));
    assert_eq!(embedding[2]["input"], json!(["orbital transport"]));
    let page = request(
        &server,
        reqwest::Method::GET,
        "/api/v1/budgets",
        VIEW,
        Value::Null,
    )
    .await
    .1;
    for id in ["first", "cached"] {
        let ledger = page["ledgers"]
            .as_array()
            .unwrap()
            .iter()
            .find(|v| v["spec"]["scope"]["root_run_id"] == id)
            .unwrap();
        assert_eq!(
            ledger["used"]["model_calls"],
            if id == "first" { 3 } else { 2 }
        );
        assert_eq!(ledger["reserved"]["model_calls"], 0);
    }
    let mut forget = submission(&release, "forget", "remember");
    forget["parameters"] =
        json!({"operation":"forget","request":{"target":created["target"],"confirmed":true}});
    post(&server, "/api/v1/runs", forget).await;
    assert!(output(&outcome(&server, "forget").await).contains("forgotten"));
    post(
        &server,
        "/api/v1/runs",
        submission(&release, "after-forget", "chat"),
    )
    .await;
    assert_eq!(
        output(&outcome(&server, "after-forget").await),
        "NO-SEMANTIC-HIT"
    );
    stop.cancel();
    worker.await.unwrap();
}
#[tokio::test]
async fn malformed_vectors_fail_before_main_inference_and_no_receipt_authority_is_rejected() {
    let wire = Wire::new(false);
    wire.malformed.store(true, Ordering::SeqCst);
    let remote = fixture(&wire).await;
    let dir = tempfile::tempdir().unwrap();
    let host = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(host.router()).await;
    let prepared = host
        .control()
        .prepare(serde_json::from_value(source(&remote.url, false, false)).unwrap())
        .unwrap();
    let nofy_agent_runtime::program::ProgramSnapshot::Agent { snapshot } =
        &prepared.program("chat").unwrap().snapshot.program
    else {
        panic!("agent sample")
    };
    let inspector = snapshot
        .restore(prepared.registry())
        .unwrap()
        .agent
        .with_checkpointer(Arc::new(host.store().clone()));
    let release=post(&server,"/api/v1/import",source(&remote.url,false,false)).await["bundle"]["digest"].as_str().unwrap().to_owned();
    let (stop, worker) = start(&host);
    write(
        &server,
        &release,
        "fact",
        "project",
        "The Saturn launcher lifts satellites.",
    )
    .await;
    post(
        &server,
        "/api/v1/runs",
        submission(&release, "malformed", "chat"),
    )
    .await;
    let result = outcome(&server, "malformed").await;
    assert_ne!(result["execution"]["status"], "completed");
    assert_eq!(wire.embeddings.lock().unwrap().len(), 1);
    assert!(wire.chats.lock().unwrap().is_empty());
    let ticket = inspector
        .model_retry_ticket("malformed", "malformed")
        .await
        .unwrap()
        .unwrap();
    assert!(
        ticket
            .operation_scope
            .as_deref()
            .unwrap()
            .starts_with("context-source:")
    );
    wire.malformed.store(false, Ordering::SeqCst);
    let command = json!({"command_id":"retry-original-embedding","run_id":"malformed","command":{"kind":"control","control":{"kind":"retry_model","command":{"command_id":"retry-original-embedding","ticket":ticket}}}});
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/actions",
            VIEW,
            command.clone()
        )
        .await
        .0,
        403
    );
    post(&server, "/api/v1/actions", command.clone()).await;
    // The existing Worker backs off a failed owner for 30 s.
    // Observe that owner without changing the production retry policy.
    let recovered =
        action_result_within(&server, "retry-original-embedding", Duration::from_secs(60)).await;
    assert!(recovered["error"].is_null(), "{recovered}");
    assert_eq!(
        recovered["outcome"]["Completed"]["output"], "SATURN-RETRIEVED",
        "{recovered}"
    );
    assert_eq!(wire.embeddings.lock().unwrap().len(), 3);
    assert_eq!(wire.chats.lock().unwrap().len(), 1);
    post(&server, "/api/v1/actions", command).await;
    assert_eq!(
        action_result(&server, "retry-original-embedding").await,
        recovered
    );
    assert_eq!(wire.embeddings.lock().unwrap().len(), 3);
    let mut unsafe_source = source(&remote.url, true, false);
    unsafe_source["programs"]["chat"]["definition"]["bindings"] = json!([]);
    let unsafe_release = post(&server, "/api/v1/import", unsafe_source).await["bundle"]["digest"]
        .as_str()
        .unwrap()
        .to_owned();
    let count = wire.embeddings.lock().unwrap().len();
    post(
        &server,
        "/api/v1/runs",
        submission(&unsafe_release, "unlogged", "chat"),
    )
    .await;
    let result = outcome(&server, "unlogged").await;
    assert_ne!(result["execution"]["status"], "completed");
    assert_eq!(wire.embeddings.lock().unwrap().len(), count);
    assert_eq!(wire.chats.lock().unwrap().len(), 1);
    stop.cancel();
    worker.await.unwrap();
}
