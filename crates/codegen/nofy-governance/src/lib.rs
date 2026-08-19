//! Approval governance primitives (PRD FR5.5–5.13 + FR2.6/2.7, batch G).
//!
//! Pure policy cores for the governance plane; the shell's permission
//! chain and the daemon's approval broker consume them. Modules:
//!
//! - [`yolo`] — YOLO freeze + session identity task localization (FR5.5);
//! - [`lifeguard`] — self-destructive command refusal (FR5.6);
//! - [`turnlease`] — cross-surface turn leases (FR5.7);
//! - [`envelope`] — injection-resistant fixed envelopes (FR5.10);
//! - [`presets`] — permission-preset intent events + write-through (FR5.11);
//! - [`cas`] — compare-and-swap config writes (FR5.12);
//! - [`preauth`] — connection budget + flood guard (FR5.13);
//! - [`identity`] — public-key device identity + challenge signing (FR2.6/2.7);
//! - [`gateway`] — the non-TUI approval proof unit (P1 milestone G11).
//!
//! Batch O adds:
//!
//! - [`classifier`] — safety classifier three-policy skeleton, approval
//!   prompts only (FR5.14);
//! - [`selfmod`] — self-modification per-package human approval (FR5.15);
//! - [`guards`] — repetition reminder + scoped timeouts (FR9.8).

pub mod cas;
pub mod classifier;
pub mod envelope;
pub mod gateway;
pub mod guards;
pub mod identity;
pub mod lifeguard;
pub mod preauth;
pub mod presets;
pub mod selfmod;
pub mod turnlease;
pub mod yolo;
