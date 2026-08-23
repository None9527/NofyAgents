//! Model catalog fetching for custom endpoints.

pub mod client;

pub use client::{BackendError, FetchModelsResult};
pub(crate) use client::{DEFAULT_CONTEXT_WINDOW, fetch_models_blocking, models_list_url};
