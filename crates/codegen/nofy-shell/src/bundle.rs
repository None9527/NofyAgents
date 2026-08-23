use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::io::ErrorKind;
use std::path::{Path, PathBuf};

const BUNDLED_DIR_NAME: &str = "bundled";
const MANIFEST_FILE_NAME: &str = "manifest.json";

#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
pub(crate) struct BundleManifest {
    pub version: String,
    pub checksums: HashMap<String, String>,
}

pub(crate) fn bundled_root() -> PathBuf {
    nofy_config::nofy_home().join(BUNDLED_DIR_NAME)
}

pub(crate) fn read_cached_manifest(root: &Path) -> Result<Option<BundleManifest>> {
    let manifest_path = manifest_path(root);
    let bytes = match std::fs::read(&manifest_path) {
        Ok(bytes) => bytes,
        Err(error) if error.kind() == ErrorKind::NotFound => return Ok(None),
        Err(error) => {
            return Err(error)
                .with_context(|| format!("failed to read {}", manifest_path.display()));
        }
    };

    serde_json::from_slice(&bytes)
        .with_context(|| format!("failed to parse {}", manifest_path.display()))
        .map(Some)
}

fn manifest_path(root: &Path) -> PathBuf {
    root.join(MANIFEST_FILE_NAME)
}
