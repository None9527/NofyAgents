use super::*;

#[tokio::test]
async fn real_binary_exit_reconciles_the_original_embedding_plan_with_and_without_budget() {
    for unmetered in [false, true] {
        let wire = Wire::new(false);
        let remote = fixture(&wire).await;
        let dir = tempfile::tempdir().unwrap();
        let file = dir.path().join("semantic.json");
        let doc = source(&remote.url, unmetered, false);
        tokio::fs::write(&file, serde_json::to_vec(&doc).unwrap())
            .await
            .unwrap();
        let (server, mut process) = super::super::process::binary(dir.path(), &file).await;
        let release = post(&server, "/api/v1/import", doc).await["bundle"]["digest"]
            .as_str()
            .unwrap()
            .to_owned();
        write(
            &server,
            &release,
            "fact",
            "project",
            "The Saturn launcher lifts satellites.",
        )
        .await;
        let original = canonical(dir.path());
        wire.hold_embedding.store(true, Ordering::SeqCst);
        post(
            &server,
            "/api/v1/runs",
            submission(&release, "root", "chat"),
        )
        .await;
        tokio::time::timeout(Duration::from_secs(30), wire.embedding_entered.notified())
            .await
            .unwrap();
        assert!(wire.chats.lock().unwrap().is_empty());
        let initial = wire.embeddings.lock().unwrap()[0].clone();
        process.kill().await.unwrap();
        assert!(!process.wait().await.unwrap().success());
        drop(server);
        wire.hold_embedding.store(false, Ordering::SeqCst);
        wire.embedding_gate.cancel();
        let (server, mut process) = super::super::process::binary(dir.path(), &file).await;
        let targets = request(
            &server,
            reqwest::Method::GET,
            "/api/v1/runs/root/recovery/models",
            ADMIN,
            Value::Null,
        )
        .await;
        assert_eq!(targets.0, 200, "{}", targets.1);
        let target = &targets.1[0];
        assert_eq!(targets.1.as_array().unwrap().len(), 1);
        assert_eq!(
            target["unmetered"],
            if unmetered { json!(true) } else { Value::Null }
        );
        assert!(
            target["ticket"]["request"]["operation_scope"]
                .as_str()
                .unwrap()
                .starts_with("context-source:")
        );
        let operation: Value = serde_json::from_str(
            target["ticket"]["request"]["operation_id"]
                .as_str()
                .unwrap(),
        )
        .unwrap();
        assert_eq!(
            operation,
            json!([
                "memory-embedding/v1",
                target["ticket"]["request"]["operation_scope"],
                "embedding:documents:0"
            ])
        );
        let vectors = initial["input"]
            .as_array()
            .unwrap()
            .iter()
            .map(|text| vector(text.as_str().unwrap(), initial["model"].as_str().unwrap()))
            .collect::<Vec<_>>();
        let mut response = ModelResponse {
            output: serde_json::to_string(&vectors).unwrap(),
            input_tokens: (vectors.len() * 3) as u64,
            output_tokens: 0,
            ..Default::default()
        };
        response.info.stop_reason = Some("embeddings".into());
        response.info.provider = json!({"model":"local-embedding","protocol":"embeddings/v1","_model_runtime":{"calls":1}});
        let command = json!({"command_id":"recover-embedding","run_id":"root","command":{"kind":"reconcile_model","receipt":{"ticket":target["ticket"],"result":{"kind":"completed","response":response}}}});
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
            401
        );
        post(&server, "/api/v1/actions", command).await;
        let result =
            action_result_within(&server, "recover-embedding", Duration::from_secs(60)).await;
        assert!(result["error"].is_null(), "{result}");
        assert_eq!(result["outcome"]["Completed"]["output"], "SATURN-RETRIEVED");
        assert_eq!(wire.embeddings.lock().unwrap().len(), 2);
        assert_eq!(wire.chats.lock().unwrap().len(), 1);
        assert_eq!(canonical(dir.path()), original);
        let records = request(
            &server,
            reqwest::Method::GET,
            "/api/v1/runs/root",
            ADMIN,
            Value::Null,
        )
        .await
        .1;
        assert!(
            records["execution"]["outcome"]["Completed"]["state"]["hook_progress"]
                .get("prepared_sources")
                .is_none()
        );
        process.kill().await.unwrap();
        process.wait().await.unwrap();
    }
}
