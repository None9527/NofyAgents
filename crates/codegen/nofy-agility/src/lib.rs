//! Agility-surface cores (PRD FR14 + FR13.2 + FR5.4 + FR8.1–8.3, batch J).
//!
//! Everything that keeps the system agile WITHOUT crossing the compile
//! boundary into the Rust core — plus the Web surface's trust fence.
//! Modules:
//!
//! - [`scriptsandbox`] — script sandbox: limits + fail-closed, NEVER
//!   in-proc (FR14.6);
//! - [`scriptrunner`] — script packs: bundled scripts + declared deps,
//!   structured results (FR14.1);
//! - [`protocol`] — extension points are protocol-only; in-proc plugins
//!   are a verification failure (FR14.2);
//! - [`sdk`] — schema-first codegen (Python/TS) + conformance suite
//!   (FR2.9 + FR14.3);
//! - [`hotreload`] — generation-swapped reload without daemon restart;
//!   core updates via supervisor exit codes (FR14.4);
//! - [`supplychain`] — minimum release age + trust verdict fail-closed,
//!   registry generation invalidation, hooks bridge detach/drain
//!   (FR8.1–8.3);
//! - [`trustfence`] — the /api browser trust fence, four layers
//!   (FR5.4, DS-#22);
//! - [`websurface`] — Web surface gated by the fence, one session truth
//!   (FR13.2);
//! - [`staging`] — staging area + rule of three before core promotion
//!   (FR14.5).

pub mod hotreload;
pub mod protocol;
pub mod scriptrunner;
pub mod scriptsandbox;
pub mod sdk;
pub mod staging;
pub mod supplychain;
pub mod trustfence;
pub mod websurface;
