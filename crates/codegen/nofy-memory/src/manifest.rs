//! Rebuildable inventory of canonical unified-memory topics.

use std::collections::BTreeMap;
use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};

use crate::atomic_file;
use crate::layout::ScopeLayout;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TopicManifest {
    pub schema_version: u32,
    pub topics: BTreeMap<String, String>,
}

pub fn rebuild(scope: &ScopeLayout) -> std::io::Result<TopicManifest> {
    let mut paths = Vec::new();
    collect_markdown(&scope.topics_directory(), &mut paths)?;
    let mut topics = BTreeMap::new();
    for path in paths {
        let bytes = std::fs::read(&path)?;
        let relative = path
            .strip_prefix(scope.root())
            .unwrap_or(&path)
            .to_string_lossy()
            .into_owned();
        topics.insert(relative, blake3::hash(&bytes).to_hex().to_string());
    }
    let manifest = TopicManifest {
        schema_version: 1,
        topics,
    };
    atomic_file::replace(
        &scope.manifest_file(),
        &serde_json::to_vec_pretty(&manifest).map_err(std::io::Error::other)?,
    )?;
    Ok(manifest)
}

fn collect_markdown(directory: &Path, paths: &mut Vec<PathBuf>) -> std::io::Result<()> {
    if !directory.is_dir() {
        return Ok(());
    }
    let mut entries = std::fs::read_dir(directory)?.collect::<Result<Vec<_>, _>>()?;
    entries.sort_by_key(std::fs::DirEntry::file_name);
    for entry in entries {
        let path = entry.path();
        if path.is_dir() {
            collect_markdown(&path, paths)?;
        } else if path.extension().is_some_and(|extension| extension == "md") {
            paths.push(path);
        }
    }
    Ok(())
}
