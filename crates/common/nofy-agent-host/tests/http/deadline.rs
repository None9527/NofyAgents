use super::*;

#[tokio::test]
#[should_panic(expected = "management action did not settle")]
async fn declared_action_deadline_never_accepts_unfinished_work() {
    let server = serve(
        Router::new()
            .route(
                "/api/v1/actions/pending",
                axum::routing::get(|| async {
                    Json(json!({"finished":false,"action":{"run_id":"pending"}}))
                }),
            )
            .route(
                "/api/v1/runs/pending",
                axum::routing::get(|| async {
                    Json(json!({"run":{"status":"running"},"execution":{"status":"running"}}))
                }),
            ),
    )
    .await;
    action_result_within(&server, "pending", Duration::from_millis(20)).await;
}
