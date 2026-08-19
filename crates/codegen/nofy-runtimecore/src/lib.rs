//! Runtime lifecycle cores (PRD FR1.12–1.16, FR6.2/6.3/6.8/6.9,
//! batch O3).
//!
//! Pure policy cores for the runtime plane; the daemon and shell consume
//! them. Modules:
//!
//! - [`persistence`] — the three persistence principles +
//!   `persistence_uncertain` tool semantics (FR1.12/1.13);
//! - [`unitgen`] — launchd/systemd unit generation for the install
//!   subcommand (FR1.14);
//! - [`coldstart`] — cold-start fast path: help/version never load the
//!   runtime (FR1.15);
//! - [`envsnapshot`] — login-shell env snapshot: atomic publish +
//!   injection-safe dump (FR6.2);
//! - [`cwdmark`] — in-band cwd marks + output-throttle spill (FR6.3);
//! - [`workerroute`] — host-request routing out of the session +
//!   scrubbed-env workers with grace kill and pair ledger (FR6.8/6.9);
//! - [`bootcheck`] — BOOT self-check session (FR1.16).
//!
//! Batch P adds:
//!
//! - [`execworld`] — execution worlds: local/docker/ssh, default-off,
//!   capability narrowing (FR6.10).

pub mod bootcheck;
pub mod coldstart;
pub mod cwdmark;
pub mod envsnapshot;
pub mod execworld;
pub mod persistence;
pub mod unitgen;
pub mod workerroute;
