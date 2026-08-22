pub mod activity;
pub mod daemon_backends;
pub mod pack_join;
pub mod provider_host;
pub mod app;
pub mod auth_method;
pub mod bootcheck;
pub mod chat_modes;
pub mod config;
pub(crate) mod config_model_override_parse;
mod ext_parsers;
pub mod feedback_client;
pub mod folder_trust;
pub(crate) mod handlers;
pub mod init;
pub mod model_providers;
pub mod models;
pub mod mvp_agent;
pub(crate) mod proxy;
pub(crate) mod restore_code;
pub mod roster;
pub mod server;
pub mod session_config;
pub(crate) mod session_metrics;
pub mod session_registry_client;
pub(crate) mod subagent;
pub(crate) mod update_chunk_merge;

pub use mvp_agent::MvpAgent;
pub use server::{ServerConfig, run_agent_server};

#[cfg(test)]
mod storage_client_tests;
