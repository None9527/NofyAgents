//! Per-turn prompt latency measurement.
//!
//! Implementation lives in `nofy-telemetry::prompt_timing`. This shim
//! keeps `crate::session::prompt_timing::PromptTiming` resolving at the
//! original path so callers don't need to change imports.

pub(crate) use nofy_telemetry::prompt_timing::PromptTiming;
