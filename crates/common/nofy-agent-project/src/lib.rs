//! Source manipulation is pure data work. Runtime actions belong to the kernel.
mod codec;
mod edit;
mod executables;
mod files;
mod render;
pub mod repository;
mod store;
pub use codec::*;
pub use edit::{FactoryKinds, agent_names, edit, import_modules};
pub use executables::{
    EXECUTABLE_DECLARATION, ExecutableOrigin, host_records_executable_bit, observed_executable,
};
pub use files::{archive_info, complete, load_directory, pack, pack_to, write_directory};
use nofy_durable_fs::sync_directory;
pub use render::{build, inspect};
pub use store::{ProjectStore, ProjectView, TemplateRegistry};
