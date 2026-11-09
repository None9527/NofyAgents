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
    let _scope_write = crate::scope_write_lock::ScopeWriteGuard::acquire(scope.root())?;
    let mut paths = Vec::new();
    collect_markdown(&scope.topics_directory(), &mut paths)?;
    let mut topics = BTreeMap::new();
    for path in paths {
        let bytes = std::fs::read(&path)?;
        let relative = relative_text(path.strip_prefix(scope.root()).unwrap_or(&path));
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

/// Encode a native relative path already stripped of its scope root.
/// Join native components, not text separators: on Unix a backslash belongs
/// to the filename. Keep the existing lossy conversion of non-Unicode names.
pub(crate) fn relative_text(path: &Path) -> String {
    let mut text = String::new();
    for part in path {
        if !text.is_empty() {
            text.push('/');
        }
        text.push_str(&part.to_string_lossy());
    }
    text
}

#[cfg(test)]
mod tests {
    use super::relative_text;
    use std::path::Path;

    #[test]
    fn native_relative_components_have_portable_separators() {
        let path = Path::new("topics").join("preferences").join("editor.md");
        assert_eq!(relative_text(&path), "topics/preferences/editor.md");
        assert_eq!(relative_text(Path::new("")), "");
        assert_eq!(relative_text(Path::new("topic.md")), "topic.md");
        let unicode = Path::new("topics").join("\u{7f16}\u{8f91}\u{5668}.md");
        assert_eq!(
            relative_text(&unicode),
            "topics/\u{7f16}\u{8f91}\u{5668}.md"
        );
    }

    #[cfg(unix)]
    #[test]
    fn unix_backslashes_remain_filename_characters() {
        let path = Path::new("topics").join(r"a\b.md");
        assert_eq!(relative_text(&path), r"topics/a\b.md");
        assert_ne!(
            relative_text(&path),
            relative_text(Path::new("topics/a/b.md"))
        );
    }

    #[cfg(unix)]
    #[test]
    fn non_unicode_names_keep_the_existing_lossy_conversion() {
        use std::{ffi::OsStr, os::unix::ffi::OsStrExt};
        let path = Path::new("topics").join(OsStr::from_bytes(b"\xff.md"));
        assert_eq!(relative_text(&path), path.to_string_lossy());
    }
}
