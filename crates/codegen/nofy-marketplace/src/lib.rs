//! Marketplace and pack ecosystem cores (PRD FR10.8/10.9 + FR8.4–8.6,
//! batch M).
//!
//! - [`discovery`] — the marketplace face: discovery / authoring /
//!   metadata, with checksum verification (FR10.8);
//! - [`exemplars`] — built-in `file-steward` + the `code-review` exemplar
//!   pack, both held to the THIRD-PARTY gate (FR10.9);
//! - [`pluginmanifest`] — plugin manifests + build-artifact isolation
//!   zones (FR8.4);
//! - [`docker`] — docker build-arg plugin subsets (FR8.5);
//! - [`channeladapter`] — the channel adapter contract: an extension
//!   SLOT, not 22 channels (FR8.6).

pub mod channeladapter;
pub mod discovery;
pub mod docker;
pub mod exemplars;
pub mod pluginmanifest;
