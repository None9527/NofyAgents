//! Project orchestration plan half (FR11): the types and logic live in
//! `nofy-orchestra::orchestra` since integration batch Q0b (the core is
//! the single source of truth). This module is a re-export: every
//! existing `crate::orchestra::*` / `nofy_daemon::orchestra::*` call
//! site keeps working.

pub use nofy_orchestra::orchestra::*;
