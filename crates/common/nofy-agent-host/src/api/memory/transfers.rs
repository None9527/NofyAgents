use super::*;
use crate::loader::memory::transfer::{TransferPlan, TransferReceipt};

pub(super) fn router() -> Router<KernelHost> {
    Router::new()
        .route("/api/v1/memory/transfers/plan", post(plan))
        .route("/api/v1/memory/transfers/prepare", post(prepare))
        .route("/api/v1/memory/transfers/apply", post(apply))
        .route("/api/v1/memory/transfers/abort", post(abort))
        .route("/api/v1/memory/transfers/{command}", get(status))
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Selection {
    source: ResourceSelector,
    target: ResourceSelector,
    scope: String,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Prepare {
    source: ResourceSelector,
    target: ResourceSelector,
    scope: String,
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
    if value == "namespace" {
        Ok(())
    } else {
        Err(HostError::Invalid(
            "memory transfers require the explicit namespace scope".into(),
        ))
    }
}
async fn plan(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Json(selection): Json<Selection>,
) -> Result<Json<TransferPlan>> {
    host.auth.require(&headers, Scope::Read)?;
    host.auth.require(&headers, Scope::Resources)?;
    scope(&selection.scope)?;
    let source = backend(&host, selection.source).await?;
    let target = backend(&host, selection.target).await?;
    let names = [
        source["namespace"]
            .as_str()
            .ok_or(HostError::NotFound)?
            .into(),
        target["namespace"]
            .as_str()
            .ok_or(HostError::NotFound)?
            .into(),
    ];
    let provider = host.loader.memory_provider.clone();
    provider.ensure_quiescent(&host.store, &names).await?;
    let permit = host
        .loader
        .management_work
        .clone()
        .acquire_owned()
        .await
        .map_err(|_| HostError::Unavailable("memory management stopped".into()))?;
    Ok(Json(
        tokio::task::spawn_blocking(move || {
            let _permit = permit;
            provider.plan_transfer(&source, &target)
        })
        .await
        .map_err(|_| HostError::Unavailable("memory transfer planner failed".into()))??,
    ))
}
async fn prepare(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Json(command): Json<Prepare>,
) -> Result<Json<TransferReceipt>> {
    host.auth.require(&headers, Scope::Resources)?;
    scope(&command.scope)?;
    let source = backend(&host, command.source).await?;
    let target = backend(&host, command.target).await?;
    let provider = host.loader.memory_provider.clone();
    let id = command.command_id.clone();
    let read = provider.clone();
    let lookup = id.clone();
    let previous = tokio::task::spawn_blocking(move || read.transfer(&lookup))
        .await
        .map_err(|_| HostError::Unavailable("memory transfer read failed".into()))??;
    if previous
        .as_ref()
        .is_none_or(|v| !matches!(v.phase.as_str(), "completed" | "aborted"))
    {
        provider
            .ensure_quiescent(
                &host.store,
                &[
                    source["namespace"]
                        .as_str()
                        .ok_or(HostError::NotFound)?
                        .into(),
                    target["namespace"]
                        .as_str()
                        .ok_or(HostError::NotFound)?
                        .into(),
                ],
            )
            .await?;
    }
    let permit = host
        .loader
        .management_work
        .clone()
        .acquire_owned()
        .await
        .map_err(|_| HostError::Unavailable("memory management stopped".into()))?;
    let prepared = tokio::task::spawn_blocking(move || {
        let _permit = permit;
        provider.prepare_transfer(&id, &source, &target, &command.fingerprint)
    })
    .await
    .map_err(|_| HostError::Unavailable("memory transfer preparation failed".into()))??;
    // Keep physical leases through the final observed boundary. Dropping an
    // HTTP caller keeps the durable preparing fence, never reopens a source.
    drop(prepared);
    let provider = host.loader.memory_provider.clone();
    Ok(Json(
        tokio::task::spawn_blocking(move || {
            provider
                .transfer(&command.command_id)?
                .ok_or(HostError::NotFound)
        })
        .await
        .map_err(|_| HostError::Unavailable("memory transfer read failed".into()))??,
    ))
}
async fn apply(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Json(command): Json<Command>,
) -> Result<Json<TransferReceipt>> {
    host.auth.require(&headers, Scope::Resources)?;
    let provider = host.loader.memory_provider.clone();
    let read = provider.clone();
    let id = command.command_id.clone();
    let status =
        tokio::task::spawn_blocking(move || read.transfer(&id)?.ok_or(HostError::NotFound))
            .await
            .map_err(|_| HostError::Unavailable("memory transfer read failed".into()))??;
    let terminal = matches!(status.phase.as_str(), "completed" | "aborted");
    let names = [status.plan.source.clone(), status.plan.target.clone()];
    if !terminal {
        provider.ensure_quiescent(&host.store, &names).await?;
    }
    let permit = host
        .loader
        .management_work
        .clone()
        .acquire_owned()
        .await
        .map_err(|_| HostError::Unavailable("memory management stopped".into()))?;
    let resume = provider.clone();
    let prepared = tokio::task::spawn_blocking(move || {
        let _permit = permit;
        resume.resume_transfer(&command.command_id, &command.fingerprint)
    })
    .await
    .map_err(|_| HostError::Unavailable("memory transfer recovery failed".into()))??;
    if !terminal {
        provider.ensure_quiescent(&host.store, &names).await?;
    }
    Ok(Json(
        tokio::task::spawn_blocking(move || provider.publish_transfer(prepared))
            .await
            .map_err(|_| HostError::Unavailable("memory transfer commit failed".into()))??,
    ))
}
async fn abort(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Json(command): Json<Command>,
) -> Result<Json<TransferReceipt>> {
    host.auth.require(&headers, Scope::Resources)?;
    let permit = host
        .loader
        .management_work
        .clone()
        .acquire_owned()
        .await
        .map_err(|_| HostError::Unavailable("memory management stopped".into()))?;
    let provider = host.loader.memory_provider.clone();
    Ok(Json(
        tokio::task::spawn_blocking(move || {
            let _permit = permit;
            provider.abort_transfer(&command.command_id, &command.fingerprint)
        })
        .await
        .map_err(|_| HostError::Unavailable("memory transfer abort failed".into()))??,
    ))
}
async fn status(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(command): Path<String>,
) -> Result<Json<TransferReceipt>> {
    host.auth.require(&headers, Scope::Read)?;
    host.auth.require(&headers, Scope::Resources)?;
    let provider = host.loader.memory_provider.clone();
    Ok(Json(
        tokio::task::spawn_blocking(move || {
            provider.transfer(&command)?.ok_or(HostError::NotFound)
        })
        .await
        .map_err(|_| HostError::Unavailable("memory transfer read failed".into()))??,
    ))
}
