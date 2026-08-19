//! Multi-surface ecosystem cores (PRD FR13.3/13.4 + FR2.10 + FR13.1,
//! batch L).
//!
//! P1 proved the non-TUI approval proposition with a proof unit
//! (`nofy-governance::gateway`); batch L builds the surface ecosystem
//! around it:
//!
//! - [`webhook`] — the full webhook surface: signed deliveries, envelope
//!   unwrap, approval-answer routing, dedupe ledger (FR13.3);
//! - [`im`] — the IM channel contract + one implementation shape:
//!   approval cards out, decisions in (FR13.4);
//! - [`lineage`] — session lineage table: chained generations + origin
//!   marks (FR2.10);
//! - [`migration`] — surfaces become control-plane CLIENTS: one session
//!   truth, surfaces hold references (FR13.1).
//!
//! Batch O adds:
//!
//! - [`interruption`] — turn-interruption recoverable transcripts
//!   (FR2.8).

pub mod im;
pub mod interruption;
pub mod lineage;
pub mod migration;
pub mod webhook;
