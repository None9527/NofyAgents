//! Local developer release tooling; no remote publishing or self-update.
pub mod artifact;
pub mod workspace;

#[allow(dead_code)]
#[path = "../../nofy-version/build_support.rs"]
pub mod build_support;
#[path = "../../nofy-version/src/release.rs"]
pub mod version;

pub const HOST: &str = env!("NOFY_RELEASE_HOST");
