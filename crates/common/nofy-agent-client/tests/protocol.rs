use nofy_agent_client::*;
use serde_json::{Value, json};
use std::{
    sync::{
        Arc,
        atomic::{AtomicUsize, Ordering},
    },
    time::Duration,
};
struct Serving {
    url: String,
    task: tokio::task::JoinHandle<()>,
}
impl Drop for Serving {
    fn drop(&mut self) {
        self.task.abort();
    }
}
async fn serve(router: axum::Router) -> Serving {
    let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    let url = format!("http://{}", listener.local_addr().unwrap());
    let task = tokio::spawn(async move {
        axum::serve(listener, router).await.unwrap();
    });
    Serving { url, task }
}
#[tokio::test]
async fn native_u64_versions_remain_exact_without_rewriting_business_json() {
    let server=serve(axum::Router::new().route("/api/v1/apply",axum::routing::post(|axum::Json(body):axum::Json<Value>|async move{
        assert_eq!(body["expected_generation"].as_u64(),Some(u64::MAX));axum::Json(json!({"command":{"command_id":"same-id"},"active":{"generation":u64::MAX,"release":"published"}}))
    })).route("/api/v1/runs",axum::routing::post(|body:String|async move{assert!(body.contains("18446744073709551615"));axum::Json(json!({"sequence":u64::MAX,"request":{"run_id":"original","thread_id":"thread","parameters":{"generation":u64::MAX}}}))}))).await;
    let engine = Engine::new(KernelClient::new(&server.url, None, Duration::from_secs(2)).unwrap());
    let apply=engine.execute("system.apply",json!({"system":"coder","release":"published","command_id":"same-id","expected_generation":u64::MAX.to_string()})).await;
    assert!(!apply.is_error(), "{apply:?}");
    assert_eq!(apply.refs["generation"], Some(u64::MAX.to_string()));
    let run=engine.execute("run.start",json!({"request_json":"{\"run_id\":\"original\",\"parameters\":{\"generation\":18446744073709551615}}"})).await;
    assert!(!run.is_error());
    let native: Value = serde_json::from_str(run.data["native_json"].as_str().unwrap()).unwrap();
    assert_eq!(
        native["request"]["parameters"]["generation"].as_u64(),
        Some(u64::MAX)
    );
    assert_eq!(run.refs["sequence"], Some(u64::MAX.to_string()));
}
#[tokio::test]
async fn interrupted_writes_keep_original_business_ids_and_never_retry() {
    let calls = Arc::new(AtomicUsize::new(0));
    let counter = calls.clone();
    let server = serve(axum::Router::new().route(
        "/api/v1/apply",
        axum::routing::post(move || {
            let calls = counter.clone();
            async move {
                calls.fetch_add(1, Ordering::SeqCst);
                tokio::time::sleep(Duration::from_secs(1)).await;
                axum::Json(json!({}))
            }
        }),
    ))
    .await;
    let engine =
        Engine::new(KernelClient::new(&server.url, None, Duration::from_millis(40)).unwrap());
    let output=engine.execute("system.apply",json!({"system":"coder","release":"published","command_id":"original-command","expected_generation":null})).await;
    assert_eq!(output.status, "unconfirmed");
    assert_eq!(output.refs["command_id"], Some("original-command".into()));
    assert_eq!(calls.load(Ordering::SeqCst), 1);
}
#[tokio::test]
async fn redirects_do_not_forward_identity_and_native_schemas_are_closed() {
    let calls = Arc::new(AtomicUsize::new(0));
    let count = calls.clone();
    let target = serve(axum::Router::new().route(
        "/capture",
        axum::routing::get(move || {
            let count = count.clone();
            async move {
                count.fetch_add(1, Ordering::SeqCst);
                "captured"
            }
        }),
    ))
    .await;
    let location = format!("{}/capture", target.url);
    let server = serve(axum::Router::new().route(
        "/api/v1/access",
        axum::routing::get(move || {
            let location = location.clone();
            async move { axum::response::Redirect::temporary(&location) }
        }),
    ))
    .await;
    let client = KernelClient::new(
        &server.url,
        Some("private-test-token-value".into()),
        Duration::from_secs(2),
    )
    .unwrap();
    assert!(client.authorize().await.is_err());
    assert_eq!(calls.load(Ordering::SeqCst), 0);
    assert!(validate("system.apply",&json!({"system":"x","release":"y","command_id":"z","expected_generation":9007199254740993u64})).is_err());
    assert!(validate("resource.list", &json!({"kind":"http://arbitrary.invalid"})).is_err());
    assert!(
        KernelClient::new(
            "http://user:secret@localhost:7331",
            None,
            Duration::from_secs(1)
        )
        .is_err()
    );
}

#[tokio::test]
async fn opaque_native_budget_and_source_cursors_are_returned_and_forwarded_unchanged() {
    let opaque = r#"["scope",9007199254740993]"#;
    let server = serve(
        axum::Router::new()
            .route(
                "/api/v1/budgets",
                axum::routing::get(
                    move |axum::extract::Query(query): axum::extract::Query<
                        std::collections::BTreeMap<String, String>,
                    >| async move {
                        if let Some(after) = query.get("after") {
                            assert_eq!(after, opaque);
                        }
                        axum::Json(
                            json!({"protocol":"nofy.budget-page/v1","ledgers":[],"next":opaque}),
                        )
                    },
                ),
            )
            .route(
                "/api/v1/runtime-sources",
                axum::routing::get(|| async {
                    axum::Json(
                        json!({"revision":9007199254740993u64,"entries":[],"next":"source-z"}),
                    )
                }),
            )
            .route(
                "/api/v1/artifacts",
                axum::routing::get(|| async {
                    axum::Json(json!([{"digest":"original-digest","files":1}]))
                }),
            ),
    )
    .await;
    let engine = Engine::new(KernelClient::new(&server.url, None, Duration::from_secs(2)).unwrap());
    let first = engine.execute("budget.list", json!({})).await;
    assert_eq!(first.next_cursor.as_deref(), Some(opaque));
    let next = engine
        .execute("budget.list", json!({"after":first.next_cursor}))
        .await;
    assert!(!next.is_error());
    let sources = engine
        .execute("resource.list", json!({"kind":"runtime_sources"}))
        .await;
    assert_eq!(sources.next_cursor.as_deref(), Some("source-z"));
    let artifacts = engine
        .execute("resource.list", json!({"kind":"artifacts"}))
        .await;
    assert_eq!(artifacts.next_cursor.as_deref(), Some("original-digest"));
}

#[tokio::test]
async fn original_run_without_a_live_update_exposes_native_revision_zero() {
    let server = serve(axum::Router::new().route(
        "/api/v1/runs/original",
        axum::routing::get(|| async {
            axum::Json(
                json!({"run":{"request":{"run_id":"original","thread_id":"thread"}},"live":null}),
            )
        }),
    ))
    .await;
    let engine = Engine::new(KernelClient::new(&server.url, None, Duration::from_secs(2)).unwrap());
    let result = engine
        .execute("run.inspect", json!({"run_id":"original"}))
        .await;
    assert!(!result.is_error());
    assert_eq!(result.refs["live_revision"], Some("0".into()));
    let native: Value = serde_json::from_str(result.data["native_json"].as_str().unwrap()).unwrap();
    assert!(native["live"].is_null());
}

#[tokio::test]
async fn extractor_rejections_expose_missing_native_fields_without_echoing_values() {
    #[derive(serde::Deserialize)]
    struct RequiredCommand {
        command: Value,
    }
    let server = serve(axum::Router::new()
        .route("/api/v1/actions", axum::routing::post(|axum::Json(body): axum::Json<RequiredCommand>| async move { axum::Json(body.command) }))
        .route("/api/v1/access", axum::routing::get(|| async {
            (axum::http::StatusCode::UNPROCESSABLE_ENTITY, "Failed to deserialize the JSON body into the target type: unknown variant `private-business-value`")
        }))).await;
    let client = KernelClient::new(&server.url, None, Duration::from_secs(2)).unwrap();
    let engine = Engine::new(client.clone());
    let result = engine
        .execute(
            "run.control",
            json!({"action_json":"{\"unknown\":\"private-business-value\"}"}),
        )
        .await;
    assert!(result.is_error());
    let error = result.error.as_ref().unwrap();
    assert_eq!(error["code"], "invalid");
    assert_eq!(error["details"]["missing_field"], "command");
    assert!(
        !serde_json::to_string(&result)
            .unwrap()
            .contains("private-business-value")
    );
    let error = client.authorize().await.unwrap_err();
    assert_eq!(error.message, "kernel rejected request");
    assert!(!error.message.contains("private-business-value"));
}

#[tokio::test]
async fn a_kernel_that_classifies_its_own_rejection_keeps_the_field_and_the_unconfirmed_outcome() {
    let reject = |status, body: Value| async move { (status, axum::Json(body)) };
    let server = serve(
        axum::Router::new()
            .route(
                "/api/v1/actions",
                axum::routing::post(move || {
                    reject(
                        axum::http::StatusCode::UNPROCESSABLE_ENTITY,
                        json!({"error":{"code":"invalid","message":"request body is missing required field `command`","details":{"reason":"missing_field","field":"command"}}}),
                    )
                }),
            )
            .route(
                "/api/v1/apply",
                axum::routing::post(move || {
                    reject(
                        axum::http::StatusCode::SERVICE_UNAVAILABLE,
                        json!({"error":{"code":"result_unconfirmed","message":"configuration commit may have succeeded; reload before retrying: sync failed"}}),
                    )
                }),
            ),
    )
    .await;
    let engine = Engine::new(KernelClient::new(&server.url, None, Duration::from_secs(2)).unwrap());

    let rejected = engine
        .execute("run.control", json!({"action_json":"{}"}))
        .await;
    let error = rejected.error.as_ref().unwrap();
    assert_eq!(error["code"], "invalid");
    assert_eq!(error["details"]["reason"], "missing_field");
    assert_eq!(error["details"]["missing_field"], "command");
    assert_eq!(rejected.status, "error");

    let applied = engine
        .execute(
            "system.apply",
            json!({"system":"coder","release":"published","command_id":"same-id","expected_generation":"0"}),
        )
        .await;
    assert_eq!(applied.status, "unconfirmed", "{applied:?}");
    assert_eq!(
        applied.error.as_ref().unwrap()["code"],
        "result_unconfirmed"
    );
}

#[tokio::test]
async fn free_text_in_a_kernel_reason_is_not_carried_over() {
    let server = serve(axum::Router::new().route(
        "/api/v1/access",
        axum::routing::get(|| async {
            (
                axum::http::StatusCode::UNPROCESSABLE_ENTITY,
                axum::Json(json!({"error":{"code":"invalid","message":"rejected","details":{"reason":"private business value","field":"also private"}}})),
            )
        }),
    ))
    .await;
    let client = KernelClient::new(&server.url, None, Duration::from_secs(2)).unwrap();
    let error = client.authorize().await.unwrap_err();
    assert!(error.details.get("reason").is_none(), "{:?}", error.details);
    assert!(!error.details.to_string().contains("private"));
}

#[test]
fn every_catalogued_error_code_parses() {
    let catalogued = serde_json::from_str::<Value>(CATALOG_JSON).unwrap()["error_codes"]
        .as_array()
        .unwrap()
        .len();
    assert!(catalogued > 0);
    assert_eq!(ERROR_CODES.len(), catalogued);
}

#[tokio::test]
async fn a_catalogued_code_without_its_own_guidance_explains_itself_from_the_contract() {
    let server = serve(axum::Router::new().route(
        "/api/v1/actions",
        axum::routing::post(|| async {
            (
                axum::http::StatusCode::CONFLICT,
                axum::Json(json!({"error":{"code":"session_busy","message":"session busy: pending effects"}})),
            )
        }),
    ))
    .await;
    let engine = Engine::new(KernelClient::new(&server.url, None, Duration::from_secs(2)).unwrap());
    let result = engine
        .execute("run.control", json!({"action_json":"{}"}))
        .await;
    let meaning = ERROR_CODES
        .iter()
        .find(|entry| entry.code == "session_busy")
        .unwrap()
        .meaning
        .clone();
    let error = result.error.as_ref().unwrap();
    assert_eq!(error["code"], "session_busy");
    assert_eq!(error["details"]["recovery"]["message"], json!(meaning));
}

#[tokio::test]
async fn creating_from_a_missing_preset_names_the_preset_not_the_new_agent() {
    let server = serve(axum::Router::new().fallback(|| async {
        (
            axum::http::StatusCode::NOT_FOUND,
            axum::Json(json!({"error":{"code":"not_found","message":"not found"}})),
        )
    }))
    .await;
    let engine = Engine::new(KernelClient::new(&server.url, None, Duration::from_secs(2)).unwrap());
    let result = engine
        .execute(
            "agent.create",
            json!({"agent": "fresh", "preset": "coding"}),
        )
        .await;
    let message = result.error.as_ref().unwrap()["message"]
        .as_str()
        .unwrap()
        .to_owned();
    assert!(message.contains("preset `coding`"), "{message}");
    assert!(!message.contains("agent=fresh"), "{message}");
}

#[tokio::test]
async fn naming_only_the_repository_gives_the_same_call_for_every_front_end() {
    let seen = Arc::new(std::sync::Mutex::new(Vec::<(String, Value)>::new()));
    let log = seen.clone();
    let server = serve(
        axum::Router::new()
            .route(
                "/api/v1/module-repositories/lib",
                axum::routing::put({
                    let log = log.clone();
                    move |axum::Json(body): axum::Json<Value>| async move {
                        log.lock().unwrap().push(("add".into(), body));
                        axum::Json(json!({"repository": "lib", "revision": "0", "origin": {"kind": "managed"}, "package_count": 0}))
                    }
                })
                .get(|| async { axum::Json(json!({"revision": "7"})) }),
            )
            .route(
                "/api/v1/module-repositories/lib/packages",
                axum::routing::post({
                    let log = log.clone();
                    move |axum::Json(body): axum::Json<Value>| async move {
                        log.lock().unwrap().push(("publish".into(), body));
                        axum::Json(json!({"repository": {"revision": "8"}, "package": {"digest": "d"}}))
                    }
                }),
            ),
    )
    .await;
    let engine = Engine::new(KernelClient::new(&server.url, None, Duration::from_secs(2)).unwrap());
    let added = engine
        .execute("repository.add", json!({"repository": "lib"}))
        .await;
    assert!(!added.is_error(), "{added:?}");
    let template = engine.execute("module.template", json!({})).await;
    let published = engine
        .execute(
            "module.publish",
            json!({"repository": "lib", "source": template.data["source"]}),
        )
        .await;
    assert!(!published.is_error(), "{published:?}");
    let seen = seen.lock().unwrap();
    assert_eq!(seen[0].1["origin"], json!({"kind": "managed"}));
    assert_eq!(seen[0].1["expected_revision"], Value::Null);
    // Omitted, the publish goes against the revision the repository has now.
    assert_eq!(seen[1].1["expected_revision"], "7");
}

#[test]
fn the_contract_declares_the_defaults_the_engine_applies() {
    let schema = schema("RepositoryAdd").unwrap();
    assert_eq!(
        schema["properties"]["origin"]["default"],
        json!({"kind": "managed"})
    );
    assert_eq!(schema["required"], json!(["repository"]));
    assert_eq!(
        schema_required("ModulePublish"),
        json!(["repository", "source"])
    );
}
fn schema_required(name: &str) -> Value {
    schema(name).unwrap()["required"].clone()
}

#[tokio::test]
async fn the_module_template_is_a_valid_package_and_says_what_it_is() {
    let engine =
        Engine::new(KernelClient::new("http://127.0.0.1:1", None, Duration::from_secs(1)).unwrap());
    for (input, name, factory) in [
        (json!({}), "my-module", "tool.rhai"),
        (
            json!({"name": "greeter", "version": "2.1.0", "kind": "prompt"}),
            "greeter",
            "prompt.static",
        ),
    ] {
        let out = engine.execute("module.template", input).await;
        assert!(!out.is_error(), "{out:?}");
        assert_eq!(out.data["package"]["name"], name);
        let files = out.data["source"]["files"].as_object().unwrap();
        assert!(files.contains_key("module.json") && files.contains_key("source-files.json"));
        let module = out.data["source"]["files"]["module.json"]["content"]
            .as_str()
            .unwrap();
        assert!(module.contains(factory), "{module}");
    }
    let bad = engine
        .execute("module.template", json!({"kind": "resource"}))
        .await;
    assert!(bad.is_error());
}
