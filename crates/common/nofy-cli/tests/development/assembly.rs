use super::*;
#[tokio::test(flavor = "multi_thread", worker_threads = 3)]
async fn guides_supply_public_preset_configuration_and_managed_edits_without_framework_sources() {
    let dir = tempfile::tempdir().unwrap();
    let kernel = host(&dir.path().join("kernel")).await;
    let server = serve(kernel.router()).await;
    let e = engine(&server.url, ADMIN);
    let described = e.execute("describe", json!({})).await;
    assert!(!described.is_error(), "{described:?}");
    assert_eq!(described.data["contract_revision"], "0.6");
    assert_eq!(
        described.data["kernel_capabilities"]["input"]["interject"],
        true
    );
    let guide_schema = nofy_agent_client::schema("AssemblyGuide").unwrap();
    let check = jsonschema::validator_for(&guide_schema).unwrap();
    for factory in described.data["factories"].as_array().unwrap() {
        let result = e
            .execute("schema", json!({"factory":factory["factory"]}))
            .await;
        assert!(!result.is_error(), "{result:?}");
        assert!(
            check.is_valid(&result.data["guide"]),
            "{}",
            factory["factory"]
        );
        assert_eq!(result.data["guide"]["subject"]["name"], factory["factory"]);
    }
    let preset = e
        .execute("schema", json!({"preset":"coding","version":"0.1.0"}))
        .await;
    assert!(!preset.is_error(), "{preset:?}");
    assert!(check.is_valid(&preset.data["guide"]));
    assert!(
        preset.data["settings_schema"]["required"]
            .as_array()
            .unwrap()
            .contains(&json!("model"))
    );
    assert_eq!(
        preset.data["guide"]["steps"][1]["tool"],
        "nofy_agent_configure"
    );
    let created = cli_ok(
        &server.url,
        &["agent", "create", "configured", "--preset", "coding"],
    )
    .await;
    let client = repositories::mcp(&server.url, dir.path()).await;
    let updated=mcp_call(&client,"nofy_agent_configure",json!({"agent":"configured","include_source":true,"target":{"kind":"project","project_id":"configured","expected_revision":created["refs"]["source_revision"]},"settings":{"terminal_enabled":false,"workspace":dir.path().join("workspace"),"model":"chosen-model"},"set":{"/model_settings/max_output_tokens":512}})).await;
    let current = updated["refs"]["source_revision"].clone();
    assert_ne!(current, created["refs"]["source_revision"]);
    let source: Source = serde_json::from_value(updated["data"]["source"].clone()).unwrap();
    assert_eq!(
        source.json("settings.json").unwrap()["model_settings"]["max_output_tokens"],
        512
    );
    let stale=e.execute("agent.configure",json!({"agent":"configured","target":{"kind":"project","project_id":"configured","expected_revision":created["refs"]["source_revision"]},"settings":{"model":"stale"}})).await;
    assert_eq!(stale.error.unwrap()["code"], "conflict");
    client.cancel().await.unwrap();
}
