//! Control-plane transport primitives (PRD FR2, batch D first piece).
//!
//! The daemon's control plane is schema-first: this crate owns ONLY transport
//! mechanics — framing, version negotiation, the auth hook, reconnect backoff —
//! and stays free of session/tool semantics (PI-F1..F5 translated):
//!
//! - [`frame`]: `[u32 BE length][JSON payload]` frames; partial-read safe;
//!   size-capped; "validate then encode" is the caller's contract;
//! - [`hello`]: first-frame version negotiation; a peer speaking an
//!   incompatible major gets a structured reject, never a silent stream;
//! - [`auth`]: authentication lives at the transport layer — the frame bytes
//!   carry no credentials;
//! - [`backoff`]: capped exponential reconnect backoff with jitter.

pub mod auth;
pub mod backoff;
pub mod frame;
pub mod hello;
