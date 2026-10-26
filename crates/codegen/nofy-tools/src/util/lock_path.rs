//! Stable keys for client-owned, per-file tool locks.
use std::path::{Component, Path, PathBuf};

/// Only files with at least one writer need a lock. Readers of those files
/// share it; unrelated files and read-only batches stay concurrent.
pub fn file_locks_for_batch(
    calls: &[(Option<String>, bool)],
) -> Vec<Option<std::sync::Arc<tokio::sync::Mutex<()>>>> {
    use std::collections::{HashMap, HashSet};
    use std::sync::Arc;
    let writes: HashSet<&str> = calls
        .iter()
        .filter(|(_, read_only)| !read_only)
        .filter_map(|(path, _)| path.as_deref())
        .collect();
    let mut locks = HashMap::new();
    calls
        .iter()
        .map(|(path, _)| {
            let path = path.as_deref()?;
            if !writes.contains(path) {
                return None;
            }
            Some(Arc::clone(
                locks
                    .entry(path)
                    .or_insert_with(|| Arc::new(tokio::sync::Mutex::new(()))),
            ))
        })
        .collect()
}

/// Resolve existing ancestors before removing `..`: a symlink's parent is the
/// parent of its target, not the parent of the spelling used by the caller.
/// Missing suffixes are retained so creates and reads of a new file agree.
pub fn lock_path_for_path(input: &Path, cwd: &Path) -> String {
    let absolute = if input.is_absolute() {
        input.to_path_buf()
    } else {
        cwd.join(input)
    };
    let mut ancestor = absolute.as_path();
    let mut suffix = Vec::new();
    let resolved = loop {
        if let Ok(mut canonical) = dunce::canonicalize(ancestor) {
            canonical.extend(suffix.iter().rev());
            break canonical;
        }
        // file_name() drops `..`, so use components to preserve the suffix.
        let Some(component) = ancestor.components().next_back() else {
            break absolute.clone();
        };
        if matches!(component, Component::RootDir | Component::Prefix(_)) {
            break absolute.clone();
        }
        suffix.push(component.as_os_str().to_owned());
        let Some(parent) = ancestor.parent() else {
            break absolute.clone();
        };
        ancestor = parent;
    };
    let mut normalized = PathBuf::new();
    for component in resolved.components() {
        match component {
            Component::CurDir => {}
            Component::ParentDir => {
                normalized.pop();
            }
            component => normalized.push(component.as_os_str()),
        }
    }
    normalized.to_string_lossy().into_owned()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn alias_writers_and_reader_share_lock_but_other_files_do_not_block() {
        let dir = tempfile::tempdir().unwrap();
        let key = |path| Some(lock_path_for_path(Path::new(path), dir.path()));
        let locks = file_locks_for_batch(&[
            (key("./one.txt"), false),
            (
                Some(lock_path_for_path(&dir.path().join("one.txt"), dir.path())),
                false,
            ),
            (key("one.txt"), true),
            (key("two.txt"), false),
            (key("only-read.txt"), true),
            (None, false),
        ]);
        let held = locks[0].as_ref().unwrap().lock().await;
        assert!(locks[1].as_ref().unwrap().try_lock().is_err());
        assert!(locks[2].as_ref().unwrap().try_lock().is_err());
        assert!(locks[3].as_ref().unwrap().try_lock().is_ok());
        assert!(locks[4].is_none() && locks[5].is_none());
        drop(held);
        assert!(locks[1].as_ref().unwrap().try_lock().is_ok());
    }

    #[test]
    fn existing_and_missing_file_aliases_share_keys() {
        let dir = tempfile::tempdir().unwrap();
        std::fs::create_dir(dir.path().join("src")).unwrap();
        for file in ["new.txt", "existing.txt"] {
            if file == "existing.txt" {
                std::fs::write(dir.path().join("src").join(file), "test").unwrap();
            }
            let expected = lock_path_for_path(&dir.path().join("src").join(file), dir.path());
            for alias in [
                format!("src/{file}"),
                format!("./src/{file}"),
                format!("src/../src/{file}"),
            ] {
                assert_eq!(lock_path_for_path(Path::new(&alias), dir.path()), expected);
            }
            assert_ne!(
                lock_path_for_path(Path::new("other.txt"), dir.path()),
                expected
            );
        }
    }

    #[cfg(unix)]
    #[test]
    fn symlink_ancestors_and_parent_components_follow_filesystem_semantics() {
        let dir = tempfile::tempdir().unwrap();
        std::fs::create_dir_all(dir.path().join("real/nested")).unwrap();
        std::os::unix::fs::symlink(dir.path().join("real/nested"), dir.path().join("alias"))
            .unwrap();
        for (alias, actual) in [
            ("alias/new.txt", "real/nested/new.txt"),
            ("alias/../new.txt", "real/new.txt"),
        ] {
            assert_eq!(
                lock_path_for_path(Path::new(alias), dir.path()),
                lock_path_for_path(Path::new(actual), dir.path())
            );
        }
    }
}
