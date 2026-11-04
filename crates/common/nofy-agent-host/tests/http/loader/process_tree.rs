use super::*;

#[tokio::test]
async fn tree_resource_preview_is_pure_but_publication_rechecks_delegation_without_poisoning_other_systems()
 {
    let directory = tempfile::tempdir().unwrap();
    let (kernel, server, _) = setup(directory.path()).await;
    let mut source: Value =
        serde_json::from_str(include_str!("../../../examples/native-system.json")).unwrap();
    source["modules"].as_array_mut().unwrap().push(json!({
        "reference":{"id":"bounded-tree","version":"1"},"factory":"resource.process_tree_limits",
        "config":{"cgroup_root":"/sys/fs/cgroup/absent-nofy-delegation/jobs"}
    }));
    let (status, preview) = request(
        &server,
        reqwest::Method::POST,
        "/api/v1/validate",
        VIEW,
        source.clone(),
    )
    .await;
    assert_eq!(status, 200, "{preview}");
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/import",
            PUBLISH,
            source.clone()
        )
        .await
        .0,
        403
    );
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/import",
            ADMIN,
            source
        )
        .await
        .0,
        503
    );
    assert!(kernel.control().inspect().await.unwrap().is_none());
    assert_eq!(kernel.loader().process_trees.pending().unwrap(), 0);
    let modules = request(
        &server,
        reqwest::Method::GET,
        "/api/v1/modules",
        VIEW,
        Value::Null,
    )
    .await;
    assert_eq!(modules.0, 200);
    assert!(
        modules.1["factories"]
            .as_array()
            .unwrap()
            .iter()
            .any(|m| m["factory"] == "resource.process_tree_limits")
    );
    let original: Value =
        serde_json::from_str(include_str!("../../../examples/native-system.json")).unwrap();
    post(&server, "/api/v1/import", original).await;
    assert!(kernel.control().inspect().await.unwrap().is_some());
}
