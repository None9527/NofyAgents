#![cfg(feature = "rhai")]
use nofy_agent_executors::code::RhaiToolFactory;
use nofy_agent_runtime::{ToolEntry, registry::*};
use nofy_tool_runtime::{ToolCallContext, ToolError};
use serde_json::{Value, json};
fn config(source: &str) -> Value {
    json!({"contract":{"name":"method"},"source":source})
}
fn build(value: Value) -> Result<ToolEntry, nofy_agent_runtime::Error> {
    let ModuleInstance::ToolPack(catalog) = RhaiToolFactory.build(&value, &Default::default())?
    else {
        panic!("not tool pack")
    };
    Ok(catalog.get("method").unwrap().clone())
}
async fn call(
    entry: &ToolEntry,
    args: Value,
    context: ToolCallContext,
) -> Result<Value, ToolError> {
    entry
        .dispatch
        .call_terminal(
            nofy_tool_protocol::ToolId::new("method").unwrap(),
            args,
            context,
        )
        .await
        .map(|o| o.value)
}
#[tokio::test]
async fn real_vm_computes_json_nested_completion_and_original_bindings_and_schema() {
    let entry = build(config("#{result: args.value * 2}")).unwrap();
    assert_eq!(
        call(&entry, json!({"value":7}), Default::default())
            .await
            .unwrap(),
        json!({"result":14})
    );
    let mut source = config("fn done(value) {complete(#{result:value * 2});} done(args.value); 0");
    source["input"] = json!({"kind":"input","pointer":"/payload"});
    source["contract"]["output_pointer"] = json!("/result");
    source["contract"]["output_schema"] = json!({"type":"integer"});
    assert_eq!(
        call(
            &build(source).unwrap(),
            json!({"payload":{"value":9}}),
            Default::default()
        )
        .await
        .unwrap(),
        json!(18)
    );
    let mut source = config("true");
    source["contract"]["output_schema"] = json!({"type":"object"});
    assert!(
        call(&build(source).unwrap(), json!({}), Default::default())
            .await
            .is_err()
    );
}
#[tokio::test]
async fn source_and_limits_are_validated_without_ignored_options_or_host_capabilities() {
    for source in ["", "let = broken;", "eval(\"1+1\")"] {
        assert!(build(config(source)).is_err(), "{source}");
    }
    for (name, value) in [
        ("max_operations", json!(0)),
        ("max_operations", json!(10000001)),
        ("agent_budget", json!(1)),
    ] {
        let mut source = config("42");
        source[name] = value;
        assert!(build(source).is_err());
    }
    for source in [
        "agent(\"go\")",
        "read_file(\"/etc/passwd\")",
        "http_get(\"https://example.invalid/\")",
    ] {
        let entry = build(config(source)).unwrap();
        assert!(call(&entry, json!({}), Default::default()).await.is_err());
    }
    let dir = tempfile::tempdir().unwrap();
    let file = dir.path().join("private.rhai");
    std::fs::write(&file, "let hidden = \"private-file-content\";").unwrap();
    let source = format!(
        "import {:?} as private; private::hidden",
        file.to_str().unwrap()
    );
    match build(config(&source)) {
        Err(_) => {}
        Ok(entry) => {
            let error = call(&entry, json!({}), Default::default())
                .await
                .unwrap_err();
            assert!(!error.to_string().contains("private-file-content"));
        }
    }
}
#[tokio::test]
async fn loops_data_input_output_and_timeout_limits_are_enforced() {
    let mut source = config("try {loop {}} catch(e) {42}");
    source["max_operations"] = json!(1000);
    let error = call(&build(source).unwrap(), json!({}), Default::default())
        .await
        .unwrap_err();
    assert_eq!(
        error.details.as_ref().unwrap()["code"],
        "operation_limit",
        "{error:?}"
    );
    let mut source = config("loop {}");
    source["max_operations"] = json!(10000000);
    source["contract"]["timeout_ms"] = json!(1);
    let error = call(&build(source).unwrap(), json!({}), Default::default())
        .await
        .unwrap_err();
    assert_eq!(
        error.details.as_ref().unwrap()["code"],
        "timeout",
        "{error:?}"
    );
    let mut source = config("args");
    source["contract"]["max_input_bytes"] = json!(4);
    assert!(
        call(
            &build(source).unwrap(),
            json!({"large":"input"}),
            Default::default()
        )
        .await
        .is_err()
    );
    let mut source = config("#{value:12345}");
    source["contract"]["max_output_bytes"] = json!(4);
    assert!(
        call(&build(source).unwrap(), json!({}), Default::default())
            .await
            .is_err()
    );
    let mut source = config("let result=[];for n in 0..5000 {result.push(n);} result");
    source["max_operations"] = json!(1000000);
    assert!(
        call(&build(source).unwrap(), json!({}), Default::default())
            .await
            .is_err()
    );
}
#[test]
fn cancelled_and_dropped_calls_release_the_blocking_worker() {
    let runtime = tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .max_blocking_threads(1)
        .build()
        .unwrap();
    runtime.block_on(async {
        let mut source = config("loop {let value = \"x\" * 10000;}");
        source["max_operations"] = json!(10000000);
        source["contract"]["timeout_ms"] = json!(600000);
        let entry = build(source).unwrap();
        let token = tokio_util::sync::CancellationToken::new();
        let mut context = ToolCallContext::default();
        context.insert(nofy_tool_runtime::Cancellation(token.clone()));
        token.cancel();
        assert!(call(&entry, json!({}), context).await.is_err());
        let pending =
            tokio::spawn(async move { call(&entry, json!({}), Default::default()).await });
        tokio::time::sleep(std::time::Duration::from_millis(5)).await;
        pending.abort();
        let _ = pending.await;
        assert_eq!(
            tokio::time::timeout(
                std::time::Duration::from_secs(1),
                tokio::task::spawn_blocking(|| 42)
            )
            .await
            .unwrap()
            .unwrap(),
            42
        );
    });
}
