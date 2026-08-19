//! File steward execution-surface cores (PRD FR12, batch I).
//!
//! The steward's LOGIC half (trash-only construction, root confinement,
//! batch = single approval unit) lives in `nofy-daemon::steward`; this
//! crate is the EXECUTION surface: the policies that make stewardship
//! safe on real files. Modules:
//!
//! - [`roots`] — roots empty-by-default opt-in, two tiers, outside-root
//!   escalation (FR12.1);
//! - [`fsindex`] — fs-index v1: metadata + text search, idle-gated
//!   rebuild, watch budget with degrade (FR12.2);
//! - [`fspolicy`] — `fs/*` policy events + structured FS_SANDBOX_DENIED
//!   (FR12.3);
//! - [`activity`] — file-activity graph, steward as first-class actor
//!   (FR12.4);
//! - [`privacy`] — local/retention/forget/redaction (FR12.5);
//! - [`revalidate`] — index is hint, disk is truth (FR12.9);
//! - [`lease`] — file lease table: leased = steward read-only (FR12.11);
//! - [`zoning`] — project/steward sovereignty, overlap takes stricter
//!   (FR12.12);
//! - [`tombstone`] — change manifest + forwarding tombstones + batch undo
//!   (FR12.14);
//! - [`trust`] — cleanup forbidden zones + dry-run trial + trust ramp
//!   (FR12.15).
//!
//! Batch N (file-steward launch) adds:
//!
//! - [`mgmt`] — management tool surface: trash-over-delete + two-phase
//!   intent + rollback snapshots (FR12.6);
//! - [`extract`] — content extraction pipeline, embeddings default-off
//!   (FR12.7);
//! - [`suggestions`] — cleanup suggestion DAG → FR11 orchestration →
//!   batch approval (FR12.8);
//! - [`handoff`] — leased-root handoff via steering, steward degrades to
//!   advisor on project ground (FR12.13).
//!
//! Batch P adds:
//!
//! - [`osbridge`] — OS integration bridges (Spotlight/Everything) as
//!   search providers: the evaluation gate (FR12.10).

pub mod activity;
pub mod extract;
pub mod fsindex;
pub mod fspolicy;
pub mod handoff;
pub mod lease;
pub mod mgmt;
pub mod osbridge;
pub mod privacy;
pub mod revalidate;
pub mod roots;
pub mod suggestions;
pub mod tombstone;
pub mod trust;
pub mod zoning;
