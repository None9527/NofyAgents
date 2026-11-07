//! Fixtures that must not assume the machine looks like a Linux one.

use std::path::{Path, PathBuf};

/// A temporary directory whose path is already in the canonical form the host
/// gives its own state directories (`std::fs::canonicalize`).
///
/// The operating system's temporary directory is often not canonical: on macOS it
/// is under `/var`, which is a link to `/private/var`, and on a Windows runner it
/// is a short `RUNNER~1` name. The kernel refuses a link in a state path on
/// purpose and records canonical paths in its ledgers, so a test that hands it
/// the raw temporary path fails on those machines for a reason that is the
/// fixture's, not the product's. Create the directory here, use [`path`](Self::path),
/// and the raw and canonical spellings cannot disagree.
pub struct CanonicalTempDir {
    path: PathBuf,
    // Dropping removes the directory; the canonical path names the same one.
    _directory: tempfile::TempDir,
}

impl CanonicalTempDir {
    pub fn path(&self) -> &Path {
        &self.path
    }
}

impl AsRef<Path> for CanonicalTempDir {
    fn as_ref(&self) -> &Path {
        &self.path
    }
}

/// Like `tempfile::tempdir()`, with [`CanonicalTempDir::path`] canonical.
pub fn canonical_tempdir() -> std::io::Result<CanonicalTempDir> {
    let directory = tempfile::tempdir()?;
    let path = std::fs::canonicalize(directory.path())?;
    Ok(CanonicalTempDir {
        path,
        _directory: directory,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn the_path_is_its_own_canonical_form_and_the_directory_is_removed_on_drop() {
        let dir = canonical_tempdir().unwrap();
        let path = dir.path().to_path_buf();
        assert_eq!(std::fs::canonicalize(&path).unwrap(), path);
        assert!(path.is_dir());
        drop(dir);
        assert!(!path.exists());
    }

    /// The `/var` -> `/private/var` shape, made on any Unix machine: a temporary
    /// directory reached through a link is canonicalized past the link.
    #[cfg(unix)]
    #[test]
    fn a_temporary_directory_reached_through_a_link_is_resolved() {
        let real = tempfile::tempdir().unwrap();
        let link = real.path().join("link");
        std::os::unix::fs::symlink(real.path(), &link).unwrap();
        let canonical = std::fs::canonicalize(&link).unwrap();
        assert_ne!(canonical, link);
        assert_eq!(canonical, std::fs::canonicalize(real.path()).unwrap());
    }
}
