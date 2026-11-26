//! Explicit memory-domain engine: canonical topics, evidence, search and
//! durable operation proofs. Roots and connections are supplied by the loader;
//! this crate does not discover product settings, credentials or user homes.

pub mod access;
pub mod atomic_file;
pub mod capture;
pub mod chunker;
pub mod config;
pub mod consolidation;
pub mod embedding;
pub mod index;
pub mod layout;
pub mod manifest;
pub mod mmr;
pub mod model;
pub mod observation_store;
pub mod query_expansion;
pub mod retention;
#[cfg(feature = "agent-runtime")]
pub mod runtime;
pub mod schema;
pub mod scope_write_lock;
pub mod search;
pub mod service;
pub mod state;
pub mod threat_scan;
pub mod transport;

pub use index::{MemoryIndex, init_sqlite_vec};
