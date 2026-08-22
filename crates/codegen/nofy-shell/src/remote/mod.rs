//! Remote storage client for the backend.

pub mod client;
pub mod pull;
#[cfg(test)]
mod pull_smoke_test;
pub mod sync;

pub use client::{
    BackendClient, BackendError, FetchModelsResult, FetchedBundle, fetch_bundle,
    fetch_login_device_flow, fetch_subagent_bundle, share_url,
};
pub(crate) use client::{DEFAULT_CONTEXT_WINDOW, fetch_models_blocking, models_list_url};
pub use pull::{PullResult, pull_session_to_local};
pub use sync::RemoteSync;
