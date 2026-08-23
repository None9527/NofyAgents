//! `nofy/btw` extension handler.
//!
//! `btw` dispatches a side question to the active session via
//! `SessionCommand::SideQuestion` and returns the answer.

use agent_client_protocol as acp;
use tokio::sync::oneshot;

use super::{ExtResult, parse_params};
use crate::agent::MvpAgent;
use crate::session::{SessionCommand, SideQuestionError};

#[tracing::instrument(skip_all, fields(method = %args.method))]
pub async fn handle(agent: &MvpAgent, args: &acp::ExtRequest) -> ExtResult {
    match args.method.as_ref() {
        "nofy/btw" => {
            tracing::info!("handling /btw side question");
            handle_btw(agent, args).await
        }
        _ => Err(acp::Error::method_not_found()),
    }
}

/// Handle `nofy/btw` -- a side question that doesn't interrupt the current turn.
async fn handle_btw(agent: &MvpAgent, args: &acp::ExtRequest) -> ExtResult {
    #[derive(serde::Deserialize)]
    #[serde(rename_all = "camelCase")]
    struct BtwRequest {
        session_id: String,
        question: String,
    }

    let req: BtwRequest = parse_params(args)?;
    let sid: acp::SessionId = req.session_id.clone().into();
    let session_handle = agent.resident_handle(&sid);
    let Some(session) = session_handle else {
        return Err(
            acp::Error::invalid_params().data(format!("session not found: {}", req.session_id))
        );
    };
    let (tx, rx) = oneshot::channel();
    let _ = session.cmd_tx.send(SessionCommand::SideQuestion {
        question: req.question,
        respond_to: tx,
    });
    let result = rx
        .await
        .map_err(|_| acp::Error::internal_error().data("session failed to respond"))?;
    match result {
        Ok(answer) => super::to_ext_response(Ok(serde_json::json!({
            "answer": answer,
        }))),
        // Model errors take the canonical mapping: overload gets its short
        // display copy there, rate limits keep the typed code + upgrade
        // copy, auth failures surface as auth_required.
        Err(SideQuestionError::Sampling(e)) => {
            Err(crate::sampling::error::map_sampling_err_to_acp(e))
        }
        // Non-model failures are already readable sentences. Set `message`
        // and leave `data` unset — `Display` appends JSON-encoded `data`,
        // and `internal_error().data(e)` rendered as `Internal error: "…"`,
        // which made capacity failures look like client bugs in the TUI.
        Err(e) => Err(acp::Error::new(
            acp::ErrorCode::InternalError.into(),
            e.to_string(),
        )),
    }
}
