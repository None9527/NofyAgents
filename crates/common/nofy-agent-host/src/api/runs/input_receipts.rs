//! Read a durable receipt without submitting, claiming, waking, or resending mail.
use super::*;
use nofy_agent_runtime::mailbox::MailDelivery;

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub(super) struct Recipient {
    run_id: String,
    thread_id: String,
    agent: String,
}

pub(super) async fn inspect(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path((id, input_id)): Path<(String, String)>,
    Query(recipient): Query<Recipient>,
) -> Result<(HeaderMap, Json<MailDelivery>)> {
    host.auth.require(&headers, Scope::Read)?;
    if input_id.trim().is_empty() || input_id.len() > 256 {
        return Err(HostError::Invalid(
            "mailbox input ID must be 1..=256 bytes".into(),
        ));
    }
    let address = InputAddress {
        root_run_id: id,
        run_id: recipient.run_id,
        thread_id: recipient.thread_id,
        agent: recipient.agent,
    };
    for field in [
        &address.root_run_id,
        &address.run_id,
        &address.thread_id,
        &address.agent,
    ] {
        if field.trim().is_empty() || field.len() > 4096 {
            return Err(HostError::Invalid(
                "mailbox address fields must be 1..=4096 bytes".into(),
            ));
        }
    }
    managed(&host, &address.root_run_id).await?;
    let root = host
        .store
        .execution_record(&address.root_run_id)
        .await?
        .ok_or(HostError::NotFound)?;
    // Do not expose whether a mismatched address belongs to another run tree.
    // Historical receipts remain readable after a newer turn owns the thread.
    let matches = if address.run_id == address.root_run_id {
        root.thread_id == address.thread_id
            && root.snapshot.name() == address.agent
            && root.snapshot.is_agent()
    } else {
        host.store
            .children(&address.root_run_id)
            .await?
            .iter()
            .any(|child| {
                child.root_run_id == address.root_run_id
                    && child.run_id == address.run_id
                    && child.thread_id == address.thread_id
                    && child.agent_name == address.agent
                    && child.kind.as_deref().is_none_or(|kind| kind == "agent")
            })
    };
    if !matches {
        return Err(HostError::NotFound);
    }
    let receipt = host
        .store
        .input_status(&address, &input_id)
        .await?
        .ok_or(HostError::NotFound)?;
    // The runtime verifies the payload fingerprint. Also fence the returned
    // identity against the requested key, even if persisted rows are corrupt.
    if receipt.envelope.address != address || receipt.envelope.input_id != input_id {
        return Err(HostError::Unavailable(
            "input receipt identity mismatch".into(),
        ));
    }
    let mut headers = HeaderMap::new();
    headers.insert(
        axum::http::header::CACHE_CONTROL,
        axum::http::HeaderValue::from_static("no-store"),
    );
    Ok((headers, Json(receipt)))
}
