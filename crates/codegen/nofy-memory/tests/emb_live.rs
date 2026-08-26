//! Live smoke for the embedding provider path (needs NOFY_EMB_TEST_KEY).
//! Run: NOFY_EMB_TEST_KEY=sk-... cargo test -p nofy-memory --features test-support --test emb_live -- --ignored
#![cfg(feature = "test-support")]

use nofy_memory::embedding::EmbeddingProvider;

#[tokio::test]
#[ignore = "requires live DashScope key"]
async fn embedding_provider_live() {
    let key = std::env::var("NOFY_EMB_TEST_KEY").expect("set NOFY_EMB_TEST_KEY");
    let params = nofy_memory::MemoryBackendParams {
        session_id: "emb-live-test".into(),
        embed_config: Some(nofy_config_types::MemoryEmbeddingConfig {
            provider: "api".into(),
            model: Some("text-embedding-v4".into()),
            dimensions: 1024,
        }),
        embed_base_url: "https://dashscope.aliyuncs.com/compatible-mode/v1".into(),
        embed_api_key: Some(key),
        search_config: Default::default(),
        watcher: None,
        stale_claim_secs: 60,
        search_source: "test",
        embedding_credentials: nofy_memory::EndpointScopedCredentials::none(),
    };
    let provider = params.make_embedding_provider().await;
    assert!(provider.is_some(), "provider must build");
    let provider = provider.unwrap();
    let text = "用户偏好简洁中文回复";
    let texts: Vec<&str> = vec![text];
    let out = provider
        .embed_batch(&texts)
        .await
        .expect("embed must succeed");
    assert_eq!(out.len(), 1);
    println!("dims: {}", out[0].len());
    assert!(!out[0].is_empty());
}

#[tokio::test]
#[ignore = "requires live DashScope key + EMB_SANDBOX_DB"]
async fn hybrid_search_on_sandbox_index() {
    let key = std::env::var("NOFY_EMB_TEST_KEY").expect("set NOFY_EMB_TEST_KEY");
    let db_dir = std::env::var("EMB_SANDBOX_DB").expect("set EMB_SANDBOX_DB to workspace memory dir");
    let dir = std::path::PathBuf::from(&db_dir);
    // Storage pointing at the sandbox layout (global = parent, workspace = dir).
    let storage = nofy_memory::MemoryStorage::with_paths(
        dir.parent().unwrap().to_path_buf(),
        dir.clone(),
    );
    nofy_memory::init_sqlite_vec();
    let index = nofy_memory::MemoryIndex::open_or_create(
        &dir.join("index.sqlite"),
        storage,
        Default::default(),
        1024,
    )
    .expect("open sandbox index");
    println!("vec_available: {}", index.vec_available());

    let params = nofy_memory::MemoryBackendParams {
        session_id: "emb-live-search".into(),
        embed_config: Some(nofy_config_types::MemoryEmbeddingConfig {
            provider: "api".into(),
            model: Some("text-embedding-v4".into()),
            dimensions: 1024,
        }),
        embed_base_url: "https://dashscope.aliyuncs.com/compatible-mode/v1".into(),
        embed_api_key: Some(key),
        search_config: Default::default(),
        watcher: None,
        stale_claim_secs: 60,
        search_source: "test",
        embedding_credentials: nofy_memory::EndpointScopedCredentials::none(),
    };
    let provider = params.make_embedding_provider().await.expect("provider");

    // Direct KNN probe: embed the query, hit chunks_vec raw.
    let q = "用户偏好 语言 中文 简洁 格式 输出风格";
    let q_emb = provider.embed_batch(&vec![q]).await.expect("embed query");
    println!("query dims: {}", q_emb[0].len());
    let knn = index.vector_search(&q_emb[0], 10).expect("vector_search");
    println!("raw KNN results: {}", knn.len());
    for (id, dist) in &knn {
        println!("  dist={:.4} id={}", dist, id);
    }

    let results = nofy_memory::search::hybrid_search(
        &index,
        Some(&provider as &dyn nofy_memory::embedding::EmbeddingProvider),
        "用户偏好 语言 中文 简洁 格式 输出风格",
        &Default::default(),
    )
    .await
    .expect("search");
    println!("results: {}", results.len());
    for r in &results {
        println!("  score={:.3} source={} path={} snippet={:?}", r.score, r.source, r.path, &r.snippet[..r.snippet.len().min(60)]);
    }
}
