//! Orchestration execution half (PRD FR11/FR10, batch F).
//!
//! Since integration batch Q0b this crate ALSO owns the orchestration
//! *plan* half (manifest schema, DAG validation, batch scheduling —
//! [`orchestra`], moved verbatim from `nofy-daemon`; the daemon keeps a
//! re-export shim). Pack boundary invariants live in `nofy-packcore`
//! (Q0a). This crate is the execution half: everything between "the
//! manifest validated" and "the tasks settled", kept as pure
//! event-sourced logic with thin file layers:
//!
//! - [`orchestra`] — plan half: manifest parse/validate, DAG scheduling,
//!   `OrchRun` run state (FR11, moved from the daemon at Q0b);
//! - [`project`] — `.nofy/project.toml` discovery + pack resolution (FR11.1);
//! - [`goal`] — goal acceptance as a fold over logged state, never the
//!   model's self-report (FR11.2 + FR4.9, DS-#6/#7);
//! - [`replay`] — orchestration event journal + deterministic replay,
//!   cross-checked against the daemon's real `OrchRun` (FR11.3);
//! - [`barrier`] — barrier fan-in + at-least-once delivery ledger
//!   (FR11.4 + FR5.8);
//! - [`mount`] — standing mount + scope join (FR10.3, DS-P1);
//! - [`persona`] — persona template variables with default masking
//!   (FR10.4, DS-P3);
//! - [`delegation`] — delegation line = expert summons (FR10.5, DS-P5);
//! - [`compile`] — one pack manifest, two compile targets (FR10.6);
//! - [`caps`] — subagent capabilities, monotone delegation depth, fork
//!   takes only the completed-turn prefix (FR6.4–6.7).

pub mod barrier;
pub mod batchapproval;
pub mod caps;
pub mod compile;
pub mod dag;
pub mod delegation;
pub mod goal;
pub mod ledger_gov;
pub mod mount;
pub mod orchestra;
pub mod periodic;
pub mod persona;
pub mod project;
pub mod replay;
pub mod taskjournal;
