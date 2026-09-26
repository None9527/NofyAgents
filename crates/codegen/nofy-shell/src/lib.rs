#![allow(
    unused_imports,
    unused_variables,
    unused_mut,
    unreachable_code,
    dead_code
)]
#![warn(unreachable_pub)]
#[cfg(all(test, feature = "dhat-heap"))]
#[global_allocator]
static DHAT_ALLOC: dhat::Alloc = dhat::Alloc;
pub(crate) use nofy_telemetry::unified_log;
pub use nofy_tracing_macros::{teprintln, timed, tprintln};
pub mod active_sessions;
pub mod agent;
pub mod auth;
pub mod builtin;
pub mod bundle;
pub mod claude_import;
pub mod claude_import_state;
pub mod cli_models;
pub mod config;
pub use nofy_shell_base::cpu_profile;
pub use nofy_shell_base::env;
pub mod extensions;
pub use nofy_http as http;
pub use nofy_workspace::foreign_sessions;
pub mod inspect;
pub mod instrumentation;
pub mod managed_config;
pub mod mcp_doctor;
pub use nofy_models as models;
pub mod plugin;
pub mod remote;
pub mod sampling;
pub mod session;
pub use nofy_shell_terminal as terminal;
#[cfg(test)]
pub(crate) mod test_support;
pub mod tools;
pub mod util;
