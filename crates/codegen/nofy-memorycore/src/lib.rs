//! Memory extension cores (PRD FR4.6–4.12) + model-ops supplements
//! (FR7.7–7.9), batch H.
//!
//! Pure policy cores for the memory plane; `nofy-memory` and the shell
//! consume them. Modules:
//!
//! - [`snapshot`] — frozen memory snapshot injection + promptware scan
//!   (FR4.6): mid-turn writes never change the prompt (AC-4);
//! - [`curator`] — curator hard invariants (FR4.7): self-created only,
//!   archive never delete, pinned exempt;
//! - [`forkrev`] — background review fork isolation + cache-aware replay
//!   (FR4.8);
//! - [`projstore`] — ProjectionValueStore, higher-seq-wins (FR4.10);
//! - [`auditstore`] — metadata-only audit + pseudonymization + retention
//!   (FR4.11);
//! - [`compact`] — seven-dimension compaction + density partition + depth
//!   guard (FR4.12);
//! - [`modelops`] — generation snapshots/leases (FR7.7),
//!   stale-while-revalidate routing (FR7.8), OAuth double-checked refresh
//!   (FR7.9).
//!
//! Batch O adds:
//!
//! - [`injection`] — tool-result injection tiers + spill (FR4.5);
//! - [`dreaming`] — three-phase distillation + rollback preimages
//!   (FR4.13);
//! - [`compleases`] — cross-process compaction leases (FR9.7);
//! - [`seal`] — trajectory head/tail guards + sealed-test registry
//!   (FR9.9).

pub mod auditstore;
pub mod compact;
pub mod compleases;
pub mod curator;
pub mod dreaming;
pub mod forkrev;
pub mod injection;
pub mod modelops;
pub mod projstore;
pub mod seal;
pub mod snapshot;
