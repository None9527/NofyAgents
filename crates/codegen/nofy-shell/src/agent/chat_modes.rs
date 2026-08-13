//! nofy.com chat-product model catalog (removed).
//!
//! The chat-modes catalog came from nofy.com's `/rest/modes` and was removed
//! with the xAI cloud services. The manager remains as an inert stub so call
//! sites compile; [`process_chat_mode_enabled`] is always `false`.

use std::sync::Arc;

use agent_client_protocol as acp;

use crate::auth::AuthManager;

pub const NOFY_CHAT_MODE_ENV: &str = "NOFY_CHAT_MODE";

pub fn process_chat_mode_enabled() -> bool {
    false
}

#[derive(Clone)]
pub(crate) struct ChatModesManager {
    _auth: Arc<AuthManager>,
}

impl ChatModesManager {
    pub(crate) fn new(auth: Arc<AuthManager>) -> Self {
        Self { _auth: auth }
    }

    pub(crate) fn warm_in_background(&self) {}

    pub(crate) async fn model_state(&self) -> acp::SessionModelState {
        empty_state()
    }
}

fn empty_state() -> acp::SessionModelState {
    acp::SessionModelState::new(acp::ModelId::from(String::new()), Vec::new())
}
