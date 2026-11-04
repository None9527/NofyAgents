use super::*;

fn command_body(id: &str, kind: &str, value: Value) -> Result<SessionCommand> {
    let mut fields = value
        .as_object()
        .cloned()
        .ok_or_else(|| HostError::Invalid("session command must be an object".into()))?;
    let take = |fields: &mut serde_json::Map<String, Value>, name: &str| -> Result<String> {
        fields
            .remove(name)
            .and_then(|v| v.as_str().map(str::to_owned))
            .ok_or_else(|| HostError::Invalid(format!("{name} must be a string")))
    };
    let session_id = take(&mut fields, "session_id")?;
    same_id(id, &session_id)?;
    let command_id = take(&mut fields, "command_id")?;
    let expected_session_revision = take(&mut fields, "expected_session_revision")?;
    exact(&expected_session_revision)?;
    if fields.contains_key("kind") || fields.get("labels").is_some_and(|v| !v.is_object()) {
        return Err(HostError::Invalid(
            "unexpected session command field/type".into(),
        ));
    }
    fields.insert("kind".into(), json!(kind));
    let change = serde_json::from_value(Value::Object(fields))
        .map_err(|e| HostError::Invalid(e.to_string()))?;
    Ok(SessionCommand {
        session_id,
        command_id,
        expected_session_revision,
        change,
    })
}
async fn change(
    host: KernelHost,
    headers: HeaderMap,
    id: String,
    kind: &str,
    value: Value,
) -> Result<Json<SessionReceipt>> {
    host.auth.require(&headers, Scope::Execute)?;
    let request = command_body(&id, kind, value)?;
    if matches!(request.change, SessionChange::Reconfigure { .. }) {
        host.auth.require(&headers, Scope::Read)?;
    }
    if let Some(old) = host.supervisor.replay_session_command(&request).await? {
        return Ok(Json(old));
    }
    state(&host, &id).await?;
    let frozen = selected(&host, &request.change).await?;
    let result = host.supervisor.session_command(request, frozen).await?;
    host.wake.notify_one();
    Ok(Json(result))
}
pub(super) async fn metadata(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Json(value): Json<Value>,
) -> Result<Json<SessionReceipt>> {
    change(host, headers, id, "metadata", value).await
}
pub(super) async fn close(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Json(value): Json<Value>,
) -> Result<Json<SessionReceipt>> {
    change(host, headers, id, "close", value).await
}
pub(super) async fn reopen(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Json(value): Json<Value>,
) -> Result<Json<SessionReceipt>> {
    change(host, headers, id, "reopen", value).await
}
pub(super) async fn archive(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Json(value): Json<Value>,
) -> Result<Json<SessionReceipt>> {
    change(host, headers, id, "archive", value).await
}
pub(super) async fn unarchive(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Json(value): Json<Value>,
) -> Result<Json<SessionReceipt>> {
    change(host, headers, id, "unarchive", value).await
}
pub(super) async fn reconfigure(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Json(value): Json<Value>,
) -> Result<Json<SessionReceipt>> {
    change(host, headers, id, "reconfigure", value).await
}
pub(super) async fn plan(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Json(request): Json<SessionPlan>,
) -> Result<Json<SessionPlanView>> {
    host.auth.require(&headers, Scope::Read)?;
    same_id(&id, &request.session_id)?;
    state(&host, &id).await?;
    let frozen = selected(&host, &request.change).await?;
    Ok(Json(host.supervisor.plan_session(request, frozen).await?))
}
pub(super) async fn command(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path((id, command)): Path<(String, String)>,
) -> Result<Json<SessionReceipt>> {
    host.auth.require(&headers, Scope::Read)?;
    Ok(Json(
        host.store
            .session_command_receipt(&id, &command)
            .await?
            .ok_or(HostError::NotFound)?,
    ))
}
