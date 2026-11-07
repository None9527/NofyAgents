//! Deterministic wire fixtures for framework contract and recovery tests, the
//! run-time skip a test uses when this machine cannot provide what it needs, and
//! the platform-neutral fixtures that keep a test from assuming Unix paths.
//! Not a model, product host, process harness or credential provider.

#![forbid(unsafe_code)]

pub mod capability;
pub mod fixture;
pub mod sse;

pub use capability::{SKIP_MARK, probe_from_report, skip, skip_unless};
pub use fixture::{CanonicalTempDir, canonical_tempdir};
