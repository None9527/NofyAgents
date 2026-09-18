pub mod base64_images;
pub mod binary;
pub mod command_display;
pub mod env;
pub mod fs;
pub mod git_detect;
pub mod nofy_home;
pub mod hash;
pub mod image_compress;
pub mod image_validate;
pub mod mcp_structured_content;
pub mod mcp_truncate;
pub mod path_suggestions;
pub(crate) mod query_tools;
pub mod remap;
pub mod serde_base64;
pub mod shell_env_policy;
pub mod spawn;
pub mod truncate;
pub mod unicode_confusables;

pub use command_display::strip_redundant_session_cd;
#[cfg(unix)]
pub use env::detach_from_tty;
pub use env::substitute_plugin_tokens;
pub use env::{NOFY_AGENT_ENV, NOFY_AGENT_ENV_VALUE, apply_nofy_agent_marker, pager_env};
pub use fs::{UnicodePathMatch, canonicalize_with_timeout, try_resolve_unicode_filename};
pub use nofy_home::{nofy_application, nofy_home};
pub use path_suggestions::format_not_found_error;
pub use remap::{remap_json_keys, remap_schema_properties, reverse_map};
pub use shell_env_policy::{
    EnvironmentVariablePattern, ShellEnvironmentPolicy, ShellEnvironmentPolicyInherit,
    apply_shell_environment_policy,
};
pub use spawn::{
    ProcessGroup, ProcessScope, detach_command, detach_search_command, global_process_scope,
    new_process_group, null_stdio,
};
pub use truncate::{
    DEFAULT_SOFT_WRAP_WIDTH, ceil_char_boundary, estimate_tokens, floor_char_boundary,
    format_bytes, soft_wrap_line, soft_wrap_lines, truncate_line, truncate_str,
    truncate_str_with_marker,
};
pub use nofy_tty_utils::detach_std_command;
