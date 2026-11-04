use super::*;
use crate::loader::memory::control::{MemoryCommand, MemoryReceipt};
use nofy_agent_runtime::registry::{ModuleDefinition, ModuleRef};
mod transfers;

pub(super) fn router() -> Router<KernelHost> {
    Router::new()
        .merge(transfers::router())
        .route("/api/v1/memory/status", get(status))
        .route("/api/v1/memory/resources/inspect", post(inspect))
        .route("/api/v1/memory/resources/apply", post(apply))
        .layer(DefaultBodyLimit::max(16384))
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct ResourceSelector {
    system: String,
    release: String,
    module: ModuleRef,
    #[serde(default)]
    program: Option<String>,
    #[serde(default)]
    parents: Vec<ModuleRef>,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct ResourceCommand {
    resource: ResourceSelector,
    command: MemoryCommand,
}
async fn backend(host: &KernelHost, selector: ResourceSelector) -> Result<Value> {
    if selector.parents.len() > 16 {
        return Err(HostError::Invalid(
            "memory selector exceeds nesting limit".into(),
        ));
    }
    let bundle = host.control.export(&selector.release).await?;
    if bundle.document.name != selector.system {
        return Err(HostError::NotFound);
    }
    let mut modules = match selector.program {
        None => bundle.document.modules,
        Some(program) => match bundle.document.programs.get(&program) {
            Some(ProgramDefinition::Workflow { document, .. }) => document.modules.clone(),
            _ => return Err(HostError::NotFound),
        },
    };
    for parent in selector.parents {
        let definition = modules
            .iter()
            .find(|module| module.reference == parent)
            .ok_or(HostError::NotFound)?;
        if definition.factory != "resource.workflow" {
            return Err(HostError::Invalid(
                "memory selector parent must be a workflow resource".into(),
            ));
        }
        modules = serde_json::from_value::<Vec<ModuleDefinition>>(
            definition
                .config
                .get("document")
                .and_then(|document| document.get("modules"))
                .cloned()
                .ok_or(HostError::NotFound)?,
        )
        .map_err(|_| HostError::Invalid("invalid declared workflow module scope".into()))?;
    }
    let definition = modules
        .into_iter()
        .find(|module| module.reference == selector.module)
        .ok_or(HostError::NotFound)?;
    if !matches!(
        definition.factory.as_str(),
        "resource.memory" | "resource.memory_learning"
    ) {
        return Err(HostError::Invalid(
            "selected module is not a memory resource".into(),
        ));
    }
    definition
        .config
        .get("backend")
        .cloned()
        .ok_or(HostError::NotFound)
}
async fn inspect(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Json(selector): Json<ResourceSelector>,
) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Read)?;
    host.auth.require(&headers, Scope::Resources)?;
    let backend = backend(&host, selector).await?;
    let provider = host.loader.memory_provider.clone();
    let control = host.loader.memory_control.clone();
    Ok(Json(
        tokio::task::spawn_blocking(move || {
            let key = provider.resource_key(&backend)?;
            let local = control.state(&key)?;
            let mut result = serde_json::to_value(&local)
                .map_err(|_| HostError::Unavailable("memory state cannot encode".into()))?;
            let namespace = backend
                .get("namespace")
                .and_then(Value::as_str)
                .ok_or(HostError::NotFound)?;
            if let Some(state) = provider.namespace_view(namespace)? {
                result["effective_open"] = json!(local.open && state.active);
                result["namespace"] = serde_json::to_value(state)
                    .map_err(|_| HostError::Unavailable("memory namespace cannot encode".into()))?;
            }
            Ok::<_, HostError>(result)
        })
        .await
        .map_err(|_| HostError::Unavailable("memory inspection worker failed".into()))??,
    ))
}
async fn apply(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Json(request): Json<ResourceCommand>,
) -> Result<Json<MemoryReceipt>> {
    host.auth.require(&headers, Scope::Resources)?;
    let backend = backend(&host, request.resource).await?;
    let permit = host
        .loader
        .management_work
        .clone()
        .acquire_owned()
        .await
        .map_err(|_| HostError::Unavailable("memory management is shutting down".into()))?;
    let provider = host.loader.memory_provider.clone();
    Ok(Json(
        tokio::task::spawn_blocking(move || {
            let _permit = permit;
            provider.change(&backend, request.command)
        })
        .await
        .map_err(|_| HostError::Unavailable("memory management worker failed".into()))??,
    ))
}
async fn status(
    State(host): State<KernelHost>,
    headers: HeaderMap,
) -> Result<Json<nofy_memory::runtime::declarative::MemoryStatus>> {
    host.auth.require(&headers, Scope::Read)?;
    Ok(Json(host.loader.memory.status()))
}
