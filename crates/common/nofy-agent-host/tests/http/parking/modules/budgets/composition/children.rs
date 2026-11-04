use super::*;

pub(super) fn source(url: &str, raised: bool) -> Value {
    let mut doc = base_source(url);
    let provider = &mut doc["modules"]
        .as_array_mut()
        .unwrap()
        .iter_mut()
        .find(|m| m["reference"] == r("provider"))
        .unwrap()["config"];
    provider["models"] = json!(["test-model", "worker-model"]);
    provider["endpoint_limits"]["worker-model"] =
        json!({"max_input_tokens":64,"max_output_tokens":32});
    doc["modules"]
        .as_array_mut()
        .unwrap()
        .iter_mut()
        .find(|m| m["reference"] == r("quota"))
        .unwrap()["config"]["limits"] =
        json!({"max_model_calls":if raised {4} else {2},"max_tool_calls":4,"max_child_calls":1});
    doc["modules"].as_array_mut().unwrap().extend([
        json!({"reference":r("worker-model"),"factory":"model.programmed","config":{"model":"worker-model"},"dependencies":{"connection":r("provider"),"protocol":r("protocol")}}),
        json!({"reference":r("nested"),"factory":"tool.skills","config":{
            "skills":[{"name":"review","description":"Nested review","path":"/definitions/review/SKILL.md","scope":"repo","body":"Review $ARGUMENTS","model":"fast","allowed_tools":["effect"]}],
            "execution":{"default_model":"child","models":{"fast":"child"},"tool_packs":["work"],"model_settings":{"max_output_tokens":32},"max_steps":8}
        },"dependencies":{"child":r("worker-model"),"work":r("effect")}}),
    ]);
    doc["programs"]["execute"]["definition"]["tool_packs"] = json!([r("nested")]);
    doc["programs"]["execute"]["definition"]["hooks"] = json!([]);
    doc
}

#[tokio::test]
async fn native_skill_child_keeps_its_checkpoint_and_successful_tool_across_budget_update_and_reopen()
 {
    let counts = Arc::new([
        AtomicUsize::new(0),
        AtomicUsize::new(0),
        AtomicUsize::new(0),
    ]);
    let requests = counts.clone();
    let effects = counts.clone();
    let service=serve(Router::new()
        .route("/v1/chat/completions",route_post(move |Json(body):Json<Value>| {let c=requests.clone();async move{
            let child=body["model"]=="worker-model";c[usize::from(child)].fetch_add(1,Ordering::SeqCst);
            let done=body["messages"].as_array().unwrap().iter().any(|m|m["role"]=="tool");
            let model=if child {"worker-model"} else {"test-model"};
            let frames=if done {nofy_test_support::sse::chat_completion_events_exact(if child {"child complete"} else {"parent complete"},model)}
            else {nofy_test_support::sse::chat_completions_reasoning_then_tool_call_events("",if child {"child-call"} else {"parent-call"},if child {"effect"} else {"skill"},if child {"{}"} else {"{\"skill\":\"review\",\"args\":\"continue\"}"},model).into_iter().map(|frame|axum::response::sse::Event::default().data(frame.data)).collect()};
            Sse::new(futures::stream::iter(frames.into_iter().map(Ok::<_,Infallible>)))
        }}))
        .route("/done",route_post(move || {let c=effects.clone();async move{c[2].fetch_add(1,Ordering::SeqCst);Json(json!({"once":true}))}}))
    ).await;
    let dir = tempfile::tempdir().unwrap();
    let host = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(host.router()).await;
    let doc = source(&service.url, false);
    let compiled = host
        .control()
        .prepare(serde_json::from_value(doc.clone()).unwrap())
        .unwrap();
    let reference = ModuleRef::new("quota", "1");
    let resolved = compiled.registry().resolve(&[reference.clone()]).unwrap();
    let ModuleInstance::Governance(profile) = &resolved.instances[&reference] else {
        panic!("quota")
    };
    let scope = BudgetScope {
        root_run_id: "root".into(),
        identity: profile.identity().into(),
    };
    let publication = post(&server, "/api/v1/import", doc).await;
    post(&server,"/api/v1/runs",json!({"run_id":"root","thread_id":"thread","system":"model-evidence","release":publication["bundle"]["digest"],"program":"execute","input":{"text":"review","attachments":[]}})).await;
    let stop = CancellationToken::new();
    let stopped = stop.clone();
    let worker_host = host.clone();
    let worker = tokio::spawn(async move { worker_host.run_worker(stopped, 2).await.unwrap() });
    assert_eq!(
        outcome(&server, "root").await["execution"]["status"],
        "budget_exceeded"
    );
    assert_eq!(
        counts
            .iter()
            .map(|c| c.load(Ordering::SeqCst))
            .collect::<Vec<_>>(),
        [1, 1, 1]
    );
    let child = host.store().children("root").await.unwrap();
    assert_eq!(child.len(), 1);
    let child = child[0].clone();
    assert_eq!(child.status, "budget_exceeded");
    let key = child.checkpoint_key.clone().unwrap();
    let child_before = host.store().load(&key).await.unwrap().unwrap();
    assert!(child_before.state.pending_model.is_some());
    post(
        &server,
        "/api/v1/actions",
        json!({"command_id":"park","run_id":"root","command":{"kind":"park"}}),
    )
    .await;
    assert!(action_result(&server, "park").await["error"].is_null());
    let publication = post(&server, "/api/v1/import", source(&service.url, true)).await;
    // Stop the first Host before admitting the update through a reopened Host.
    stop.cancel();
    worker.await.unwrap();
    drop(server);
    drop(host);
    let host = crate::host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(host.router()).await;
    let command = json!({"command_id":"raise","run_id":"root","command":{"kind":"update_modules","park_command_id":"park","expected_revision":0,"release":publication["bundle"]["digest"],"program":"execute","update":{"budget_limits":true}}});
    post(&server, "/api/v1/actions", command).await;
    assert_eq!(
        content_digest(&host.store().load(&key).await.unwrap().unwrap()).unwrap(),
        content_digest(&child_before).unwrap()
    );
    let stop = CancellationToken::new();
    let stopped = stop.clone();
    let worker_host = host.clone();
    let worker = tokio::spawn(async move { worker_host.run_worker(stopped, 2).await.unwrap() });
    let updated = action_result(&server, "raise").await;
    assert!(updated["error"].is_null(), "{updated}");
    post(&server,"/api/v1/actions",json!({"command_id":"unpark","run_id":"root","command":{"kind":"unpark","park_command_id":"park"}})).await;
    assert!(action_result(&server, "unpark").await["error"].is_null());
    post(
        &server,
        "/api/v1/actions",
        json!({"command_id":"resume","run_id":"root","command":{"kind":"resume"}}),
    )
    .await;
    let finished = action_result(&server, "resume").await;
    assert!(finished["error"].is_null(), "{finished}");
    assert_eq!(
        finished["outcome"]["Completed"]["output"], "parent complete",
        "{finished}"
    );
    assert_eq!(
        counts
            .iter()
            .map(|c| c.load(Ordering::SeqCst))
            .collect::<Vec<_>>(),
        [2, 2, 1]
    );
    let final_children = host.store().children("root").await.unwrap();
    assert_eq!(final_children.len(), 1);
    assert_eq!(final_children[0].run_id, child.run_id);
    assert_eq!(final_children[0].status, "completed");
    let budget = host.store().inspect(&scope).await.unwrap().unwrap();
    assert_eq!(budget.used.model_calls, 4);
    assert_eq!(budget.used.child_calls, 1);
    assert_eq!(budget.used.tool_calls, 2);
    assert_eq!(
        budget.reserved,
        nofy_agent_runtime::governance::BudgetCost::default()
    );
    assert_eq!(
        post(&server, "/api/v1/actions", finished["action"].clone()).await,
        finished
    );
    stop.cancel();
    worker.await.unwrap();
}
