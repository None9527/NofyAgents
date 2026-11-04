use super::*;
use crate::loader::runtime_history::{BackendDefinition, HistoryLease, Plan, Receipt};
use nofy_agent_runtime::registry::ModuleRef;
pub(super) fn router() -> Router<KernelHost> {
    Router::new()
        .route("/api/v1/runtime/storage", get(inspect))
        .route("/api/v1/runtime/storage/plan", post(plan))
        .route("/api/v1/runtime/storage/prepare", post(prepare))
        .route("/api/v1/runtime/storage/apply", post(apply))
        .route("/api/v1/runtime/storage/abort", post(abort))
        .route("/api/v1/runtime/storage/transfers/{id}", get(status))
        .layer(DefaultBodyLimit::max(16384))
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Selector {
    system: String,
    release: String,
    module: ModuleRef,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Selection {
    scope: String,
    target: Selector,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Preparation {
    scope: String,
    target: Selector,
    command_id: String,
    fingerprint: String,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Command {
    command_id: String,
    fingerprint: String,
}
fn scope(value: &str) -> Result<()> {
    if value == "instance-runtime" {
        Ok(())
    } else {
        Err(HostError::Invalid(
            "runtime history transfer requires explicit instance-runtime scope".into(),
        ))
    }
}
async fn target(host: &KernelHost, selector: Selector) -> Result<BackendDefinition> {
    let bundle = host.control.export(&selector.release).await?;
    if bundle.document.name != selector.system {
        return Err(HostError::NotFound);
    }
    let module = bundle
        .document
        .modules
        .into_iter()
        .find(|m| m.reference == selector.module)
        .ok_or(HostError::NotFound)?;
    if module.factory != crate::loader::runtime_history::FACTORY {
        return Err(HostError::Invalid(
            "selected module is not a runtime store declaration".into(),
        ));
    }
    BackendDefinition::parse(module.config.get("backend").ok_or(HostError::NotFound)?)
}
async fn inspect(
    State(host): State<KernelHost>,
    headers: HeaderMap,
) -> Result<Json<crate::loader::runtime_history::StorageView>> {
    host.auth.require(&headers, Scope::Read)?;
    host.auth.require(&headers, Scope::Resources)?;
    let controller = host.runtime_history.clone();
    Ok(Json(
        tokio::task::spawn_blocking(move || controller.view())
            .await
            .map_err(|_| HostError::Unavailable("runtime history inspection failed".into()))??,
    ))
}
async fn quiesce(host: &KernelHost) -> Result<(HistoryLease, HistoryLease)> {
    let controller = host.runtime_history.clone();
    let lease = tokio::task::spawn_blocking(move || controller.exclusive_execution())
        .await
        .map_err(|_| {
            HostError::Unavailable("runtime history execution boundary failed".into())
        })??;
    #[cfg(target_os = "linux")]
    let trees = host.loader.process_trees.drain();
    #[cfg(not(target_os = "linux"))]
    let trees = std::future::ready(Ok::<(), HostError>(()));
    let (trees, prompts, scopes, models, code, memory) = tokio::join!(
        trees,
        host.loader.drain_prompt_workers(),
        host.loader.drain_scope_workers(),
        host.loader.drain_model_workers(),
        host.loader.drain_code_workers(),
        host.loader.memory.drain()
    );
    trees?;
    prompts?;
    scopes?;
    models?;
    code?;
    memory?;
    let controller = host.runtime_history.clone();
    let resources = tokio::task::spawn_blocking(move || controller.exclusive_resources())
        .await
        .map_err(|_| HostError::Unavailable("runtime history resource boundary failed".into()))??;
    Ok((lease, resources))
}
async fn preflight(host: &KernelHost, target: BackendDefinition) -> Result<()> {
    let catalog = host.control.inspect().await?;
    let controller = host.runtime_history.clone();
    let runtimes = host.loader.runtimes.clone();
    tokio::task::spawn_blocking(move || controller.preflight_grants(&target, catalog, &runtimes))
        .await
        .map_err(|_| HostError::Unavailable("runtime destination grant inspection failed".into()))?
}
async fn previous(host: &KernelHost, id: String) -> Result<Option<Receipt>> {
    let controller = host.runtime_history.clone();
    tokio::task::spawn_blocking(move || controller.status(&id))
        .await
        .map_err(|_| HostError::Unavailable("runtime transfer receipt unavailable".into()))?
}
async fn plan(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Json(selection): Json<Selection>,
) -> Result<Json<Plan>> {
    host.auth.require(&headers, Scope::Read)?;
    host.auth.require(&headers, Scope::Resources)?;
    scope(&selection.scope)?;
    let target = target(&host, selection.target).await?;
    let permit = host
        .loader
        .management_work
        .clone()
        .acquire_owned()
        .await
        .map_err(|_| HostError::Unavailable("runtime history management stopped".into()))?;
    let lease = quiesce(&host).await?;
    preflight(&host, target.clone()).await?;
    let controller = host.runtime_history.clone();
    let now = host.store.now_ms();
    Ok(Json(
        tokio::task::spawn_blocking(move || {
            let _lease = lease;
            let _permit = permit;
            controller.plan(&target, now)
        })
        .await
        .map_err(|_| HostError::Unavailable("runtime history planning failed".into()))??,
    ))
}
async fn prepare(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Json(command): Json<Preparation>,
) -> Result<Json<Receipt>> {
    host.auth.require(&headers, Scope::Resources)?;
    scope(&command.scope)?;
    let target = target(&host, command.target).await?;
    if let Some(old) = previous(&host, command.command_id.clone()).await?
        && matches!(old.phase.as_str(), "completed" | "aborted")
    {
        if old.fingerprint != command.fingerprint || old.plan.target != target {
            return Err(HostError::Control(
                nofy_agent_runtime::control::ControlError::CommandConflict,
            ));
        }
        return Ok(Json(old));
    }
    let permit = host
        .loader
        .management_work
        .clone()
        .acquire_owned()
        .await
        .map_err(|_| HostError::Unavailable("runtime history management stopped".into()))?;
    let lease = quiesce(&host).await?;
    preflight(&host, target.clone()).await?;
    let controller = host.runtime_history.clone();
    let store = host.store.clone();
    let receipt = tokio::task::spawn_blocking(move || {
        let _lease = lease;
        let _permit = permit;
        controller.prepare(&command.command_id, &target, &command.fingerprint, &store)
    })
    .await
    .map_err(|_| HostError::Unavailable("runtime history preparation failed".into()))??;
    host.wake.notify_one();
    Ok(Json(receipt))
}
async fn apply(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Json(command): Json<Command>,
) -> Result<Json<Receipt>> {
    host.auth.require(&headers, Scope::Resources)?;
    let old = previous(&host, command.command_id.clone())
        .await?
        .ok_or(HostError::NotFound)?;
    if old.fingerprint != command.fingerprint {
        return Err(HostError::Control(
            nofy_agent_runtime::control::ControlError::CommandConflict,
        ));
    }
    if matches!(old.phase.as_str(), "completed" | "aborted") {
        return Ok(Json(old));
    }
    let permit = host
        .loader
        .management_work
        .clone()
        .acquire_owned()
        .await
        .map_err(|_| HostError::Unavailable("runtime history management stopped".into()))?;
    let lease = quiesce(&host).await?;
    let controller = host.runtime_history.clone();
    let store = host.store.clone();
    let receipt = tokio::task::spawn_blocking(move || {
        let _lease = lease;
        let _permit = permit;
        controller.apply(&command.command_id, &command.fingerprint, &store)
    })
    .await
    .map_err(|_| HostError::Unavailable("runtime history commit failed".into()))??;
    host.wake.notify_one();
    Ok(Json(receipt))
}
async fn abort(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Json(command): Json<Command>,
) -> Result<Json<Receipt>> {
    host.auth.require(&headers, Scope::Resources)?;
    let old = previous(&host, command.command_id.clone())
        .await?
        .ok_or(HostError::NotFound)?;
    if old.fingerprint != command.fingerprint {
        return Err(HostError::Control(
            nofy_agent_runtime::control::ControlError::CommandConflict,
        ));
    }
    if old.phase == "aborted" {
        return Ok(Json(old));
    }
    if old.phase == "completed" {
        return Err(HostError::Invalid(
            "published runtime history requires a reverse transfer".into(),
        ));
    }
    let permit = host
        .loader
        .management_work
        .clone()
        .acquire_owned()
        .await
        .map_err(|_| HostError::Unavailable("runtime history management stopped".into()))?;
    let lease = quiesce(&host).await?;
    let controller = host.runtime_history.clone();
    let receipt = tokio::task::spawn_blocking(move || {
        let _lease = lease;
        let _permit = permit;
        controller.abort(&command.command_id, &command.fingerprint)
    })
    .await
    .map_err(|_| HostError::Unavailable("runtime history abort failed".into()))??;
    host.wake.notify_one();
    Ok(Json(receipt))
}
async fn status(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<Receipt>> {
    host.auth.require(&headers, Scope::Read)?;
    host.auth.require(&headers, Scope::Resources)?;
    Ok(Json(previous(&host, id).await?.ok_or(HostError::NotFound)?))
}
