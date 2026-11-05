use super::*;
#[cfg(target_os = "linux")]
use crate::loader::factories::sessions::ProcessSession;
use nofy_agent_runtime::registry::ModuleRef;
pub(super) fn router() -> Router<KernelHost> {
    Router::new().route("/api/v1/terminal", post(execute))
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Request {
    release: String,
    module_ref: ModuleRef,
    owner: String,
    action: Value,
}
async fn execute(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Json(request): Json<Request>,
) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Execute)?;
    host.auth.require(&headers, Scope::Resources)?;
    #[cfg(target_os = "linux")]
    {
        nofy_agent_runtime::settings::validate_json_value(
            &crate::loader::factories::sessions::terminal_schema(),
            &request.action,
        )?;
        let bundle = host.control.export(&request.release).await?;
        let registry = host.registry.clone();
        let module = request.module_ref;
        let resource = tokio::task::spawn_blocking(move || -> Result<Arc<ProcessSession>> {
            let compiled = bundle.restore(&registry)?;
            let resolved = compiled.registry().resolve(std::slice::from_ref(&module))?;
            let Some(nofy_agent_runtime::registry::ModuleInstance::Resource(handle)) =
                resolved.instances.get(&module)
            else {
                return Err(HostError::Invalid(
                    "terminal module must be a published process_session resource".into(),
                ));
            };
            handle
                .get::<ProcessSession>()
                .ok_or_else(|| HostError::Invalid("terminal resource has a different type".into()))
        })
        .await
        .map_err(|e| HostError::Unavailable(e.to_string()))??;
        Ok(Json(
            resource
                .operation(&format!("operator:{}", request.owner), &request.action)
                .await?,
        ))
    }
    #[cfg(not(target_os = "linux"))]
    {
        let _ = (host, request);
        Err(HostError::Unavailable(
            "terminal requires the Linux namespace backend".into(),
        ))
    }
}
