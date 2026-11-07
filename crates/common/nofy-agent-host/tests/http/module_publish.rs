//! Publishing a module package checks it against this kernel's factories, so a
//! package that could never be used is refused while its author can still fix it.
use super::*;
use nofy_agent_project::repository::load_repository_directory;

fn module(id: &str, factory: &str, config: Value, dependencies: Value) -> Value {
    json!({"reference": {"$module": id}, "factory": factory, "config": config, "dependencies": dependencies})
}
fn package(name: &str, inputs: Value, modules: Vec<Value>, export: &str) -> Value {
    let manifest = json!({
        "format": "nofy.module-package/v1", "name": name, "version": "1.0.0",
        "parameters_schema": {"type": "object"}, "inputs": inputs,
        "modules": modules, "exports": {"main": export}
    });
    json!({"declaration": "module.json", "files": {
        "module.json": {"content": manifest.to_string(), "encoding": "utf8"},
        "source-files.json": {"content": "[\"module.json\",\"source-files.json\"]", "encoding": "utf8"}
    }})
}
/// A tool.skills configuration that is valid as written; it derives the ports
/// `model` and `tools` from the names its execution settings use.
fn skills_config() -> Value {
    json!({"skill_tool_name": "t", "skills": [], "execution": {"default_model": "model", "tool_packs": ["tools"], "max_steps": 4}})
}
fn rhai(source: &str) -> Value {
    json!({"contract": {"name": "probe", "description": "probe", "effect": "read_only",
        "input_schema": {"type": "object"}}, "source": source})
}
async fn publish(server: &Serving, source: Value) -> (u16, Value) {
    let (_, repository) = request(
        server,
        reqwest::Method::GET,
        "/api/v1/module-repositories/lib",
        ADMIN,
        Value::Null,
    )
    .await;
    request(
        server,
        reqwest::Method::POST,
        "/api/v1/module-repositories/lib/packages",
        ADMIN,
        json!({"expected_revision": repository["revision"], "source": source}),
    )
    .await
}
async fn kernel() -> (tempfile::TempDir, Serving) {
    let dir = tempfile::tempdir().unwrap();
    let host = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(host.router()).await;
    let (status, _) = request(
        &server,
        reqwest::Method::PUT,
        "/api/v1/module-repositories/lib",
        ADMIN,
        json!({"origin": {"kind": "managed"}, "expected_revision": null}),
    )
    .await;
    assert_eq!(status, 200);
    (dir, server)
}
fn issues(body: &Value) -> Vec<(String, String)> {
    body["error"]["details"]["issues"]
        .as_array()
        .unwrap_or_else(|| panic!("no issue list in {body}"))
        .iter()
        .map(|i| {
            (
                i["path"].as_str().unwrap().to_owned(),
                i["message"].as_str().unwrap().to_owned(),
            )
        })
        .collect()
}

#[tokio::test]
async fn every_shipped_package_fits_the_kernel_it_ships_with() {
    let (_dir, server) = kernel().await;
    let directory =
        std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../../../modules/agent-foundation");
    let (sources, _) = load_repository_directory(&directory).unwrap();
    assert!(sources.len() >= 7, "{}", sources.len());
    for source in sources {
        let (status, body) = publish(&server, serde_json::to_value(&source).unwrap()).await;
        assert_eq!(status, 200, "a shipped package was refused: {body}");
    }
}

#[tokio::test]
async fn a_package_whose_factory_is_not_installed_is_refused_with_the_path() {
    let (_dir, server) = kernel().await;
    let source = package(
        "ghost",
        json!({}),
        vec![module("ghost", "tool.does_not_exist", json!({}), json!({}))],
        "ghost",
    );
    let (status, body) = publish(&server, source).await;
    assert_eq!(status, 422, "{body}");
    assert_eq!(body["error"]["code"], "invalid");
    let found = issues(&body);
    assert_eq!(found[0].0, "/modules/0/factory");
    assert!(found[0].1.contains("tool.does_not_exist"), "{found:?}");
    // The refusal names the kernel and the first problem right in the message.
    assert!(
        body["error"]["message"]
            .as_str()
            .unwrap()
            .contains("ghost@1.0.0")
    );
}

#[tokio::test]
async fn a_configuration_the_factory_refuses_is_refused_for_every_problem_at_once() {
    let (_dir, server) = kernel().await;
    let source = package(
        "typo",
        json!({}),
        vec![module(
            "typo",
            "tool.rhai",
            json!({"contract": 5, "sauce": 1}),
            json!({}),
        )],
        "typo",
    );
    let (status, body) = publish(&server, source).await;
    assert_eq!(status, 422, "{body}");
    let found = issues(&body);
    assert!(found.len() >= 2, "{found:?}");
    assert!(
        found
            .iter()
            .all(|(path, _)| path.starts_with("/modules/0/config")),
        "{found:?}"
    );
}

#[tokio::test]
async fn a_parameter_or_input_in_place_of_a_value_is_not_a_mistake() {
    let (_dir, server) = kernel().await;
    let source = package(
        "templated",
        json!({}),
        vec![module(
            "templated",
            "tool.rhai",
            json!({"contract": {"$parameter": "/contract"}, "source": {"$parameter": "/source"}}),
            json!({}),
        )],
        "templated",
    );
    let (status, body) = publish(&server, source).await;
    assert_eq!(status, 200, "{body}");
}

#[tokio::test]
async fn an_unbound_port_and_a_port_that_does_not_exist_are_both_found() {
    let (_dir, server) = kernel().await;
    // tool.skills takes a model and tools; give it neither, and a port it lacks.
    let unbound = package(
        "unbound",
        json!({}),
        vec![module(
            "task",
            "tool.skills",
            skills_config(),
            json!({"nonsense": {"$module": "task"}}),
        )],
        "task",
    );
    let (status, body) = publish(&server, unbound).await;
    assert_eq!(status, 422, "{body}");
    let found = issues(&body);
    assert!(
        found
            .iter()
            .any(|(p, m)| p == "/modules/0/dependencies/model" && m.contains("not bound")),
        "{found:?}"
    );
    assert!(
        found
            .iter()
            .any(|(p, m)| p == "/modules/0/dependencies/nonsense"
                && m.contains("not a dependency port")),
        "{found:?}"
    );
}

#[tokio::test]
async fn a_port_wired_to_the_wrong_kind_is_found_before_anyone_selects_the_package() {
    let (_dir, server) = kernel().await;
    let source = package(
        "wrongkind",
        json!({"model": "tool_pack", "tools": "tool_pack"}),
        vec![module(
            "task",
            "tool.skills",
            skills_config(),
            json!({"model": {"$input": "model"}, "tools": {"$input": "tools"}}),
        )],
        "task",
    );
    let (status, body) = publish(&server, source).await;
    assert_eq!(status, 422, "{body}");
    assert!(
        issues(&body).iter().any(
            |(p, m)| p == "/modules/0/dependencies/model" && m.contains("wired to a tool_pack")
        ),
        "{body}"
    );
}

#[tokio::test]
async fn a_refused_package_leaves_the_repository_untouched() {
    let (_dir, server) = kernel().await;
    let bad = package(
        "ghost",
        json!({}),
        vec![module("ghost", "tool.does_not_exist", json!({}), json!({}))],
        "ghost",
    );
    assert_eq!(publish(&server, bad).await.0, 422);
    let (_, repository) = request(
        &server,
        reqwest::Method::GET,
        "/api/v1/module-repositories/lib",
        ADMIN,
        Value::Null,
    )
    .await;
    assert_eq!(repository["package_count"], 0);
    assert_eq!(repository["revision"], "0");
}

#[tokio::test]
async fn a_script_that_does_not_compile_is_refused_where_it_is_written() {
    let (_dir, server) = kernel().await;
    let broken = package(
        "broken",
        json!({}),
        vec![module(
            "broken",
            "tool.rhai",
            rhai("#{result: args.value * }"),
            json!({}),
        )],
        "broken",
    );
    let (status, body) = publish(&server, broken).await;
    assert_eq!(status, 422, "{body}");
    assert!(
        issues(&body)
            .iter()
            .any(|(path, message)| path.starts_with("/modules/0")
                && message.contains("does not build")),
        "{body}"
    );
    // The same module with a script that compiles is accepted.
    let working = package(
        "working",
        json!({}),
        vec![module(
            "working",
            "tool.rhai",
            rhai("#{result: args.value * 2}"),
            json!({}),
        )],
        "working",
    );
    assert_eq!(publish(&server, working).await.0, 200);
}
