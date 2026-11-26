//! Directories and files that belong to one user.
//!
//! The kernel keeps credentials, releases and run history in a state directory.
//! "Only its owner can use it" is a promise each platform keeps differently, and
//! this crate is the one place that says how:
//!
//! - **Unix:** a new directory is created `0700`; a credential file must be
//!   `0600` (no group or other access at all).
//! - **Windows:** a new directory is created with a protected, inheritable
//!   access list that grants the current user alone, so everything created inside
//!   inherits it. An existing path is *checked, never repaired*: changing an
//!   access list cannot take back a handle someone already holds. It passes only
//!   when no principal other than the user, `SYSTEM`, the Administrators group or
//!   `CREATOR OWNER` is allowed in (the last three can take over the user's data
//!   anyway), and the path is not a reparse point.
//!
//! A path that fails the check is an error naming it, not a warning.
use std::{io, path::Path};

#[cfg(windows)]
mod windows;

/// Holds a checked directory in place for as long as it lives. On Windows the
/// directory is open without delete sharing, so it cannot be renamed or replaced
/// by a junction after it was checked; elsewhere there is nothing to hold.
#[derive(Debug)]
pub struct PrivateDirGuard {
    #[cfg(windows)]
    _handle: std::os::windows::io::OwnedHandle,
}

/// Create `path` as a directory only its owner can use, or confirm an existing
/// one already is. Missing parents are created with default permissions; the
/// directory itself is the boundary.
///
/// An existing path is checked, never repaired: symbolic links, non-owner
/// directories, and directories accessible to group/others are refused on both
/// Unix and Windows.
pub fn ensure_private_dir(path: &Path) -> io::Result<PrivateDirGuard> {
    #[cfg(unix)]
    {
        use std::os::unix::fs::DirBuilderExt;
        if let Some(parent) = path.parent().filter(|p| !p.as_os_str().is_empty()) {
            std::fs::create_dir_all(parent)?;
        }
        match std::fs::DirBuilder::new().mode(0o700).create(path) {
            Ok(()) => {}
            Err(error) if error.kind() == io::ErrorKind::AlreadyExists => {
                let metadata = std::fs::symlink_metadata(path)?;
                if metadata.file_type().is_symlink() {
                    return Err(io::Error::new(
                        io::ErrorKind::PermissionDenied,
                        "state path is a symbolic link",
                    ));
                }
                if !metadata.is_dir() {
                    return Err(io::Error::new(
                        io::ErrorKind::AlreadyExists,
                        "state path exists and is not a directory",
                    ));
                }
                verify_private_dir_metadata(&metadata)?;
            }
            Err(error) => return Err(error),
        }
        Ok(PrivateDirGuard {})
    }
    #[cfg(windows)]
    {
        windows::ensure_private_dir(path).map(|_handle| PrivateDirGuard { _handle })
    }
}

#[cfg(unix)]
fn current_euid() -> u32 {
    // SAFETY: POSIX `geteuid` takes no arguments, cannot fail, and returns
    // the effective user ID of the calling process as `u32`.
    unsafe extern "C" {
        fn geteuid() -> u32;
    }
    // SAFETY: `geteuid` has no preconditions and cannot fail.
    unsafe { geteuid() }
}

#[cfg(unix)]
fn verify_private_file_metadata(metadata: &std::fs::Metadata) -> io::Result<()> {
    use std::os::unix::fs::{MetadataExt, PermissionsExt};
    if metadata.file_type().is_symlink() || !metadata.is_file() {
        return Err(io::Error::new(
            io::ErrorKind::PermissionDenied,
            "not a regular file",
        ));
    }
    if metadata.uid() != current_euid() {
        return Err(io::Error::new(
            io::ErrorKind::PermissionDenied,
            "file is not owned by the current user",
        ));
    }
    if metadata.permissions().mode() & 0o077 != 0 {
        return Err(io::Error::new(
            io::ErrorKind::PermissionDenied,
            "file is accessible to group or others",
        ));
    }
    Ok(())
}

#[cfg(unix)]
fn verify_private_dir_metadata(metadata: &std::fs::Metadata) -> io::Result<()> {
    use std::os::unix::fs::{MetadataExt, PermissionsExt};
    if metadata.file_type().is_symlink() || !metadata.is_dir() {
        return Err(io::Error::new(
            io::ErrorKind::PermissionDenied,
            "not a directory",
        ));
    }
    if metadata.uid() != current_euid() {
        return Err(io::Error::new(
            io::ErrorKind::PermissionDenied,
            "directory is not owned by the current user",
        ));
    }
    if metadata.permissions().mode() & 0o077 != 0 {
        return Err(io::Error::new(
            io::ErrorKind::PermissionDenied,
            "directory is accessible to group or others",
        ));
    }
    Ok(())
}

/// Fail unless an already-opened regular file handle is closed to everyone but
/// its owner. On Unix this checks the open descriptor directly via `fstat`,
/// avoiding a path TOCTOU window after `open_no_follow`.
pub fn verify_private_open_file(file: &std::fs::File, path: &Path) -> io::Result<()> {
    #[cfg(unix)]
    {
        let _ = path;
        let metadata = file.metadata()?;
        verify_private_file_metadata(&metadata)
    }
    #[cfg(windows)]
    {
        let _ = file;
        windows::verify_private(path, false).map(|_handle| ())
    }
}

/// Fail unless `path`, a directory, is closed to everyone but its owner.
pub fn verify_private_dir(path: &Path) -> io::Result<PrivateDirGuard> {
    #[cfg(unix)]
    {
        let metadata = std::fs::symlink_metadata(path)?;
        verify_private_dir_metadata(&metadata)?;
        Ok(PrivateDirGuard {})
    }
    #[cfg(windows)]
    {
        windows::verify_private(path, true).map(|_handle| PrivateDirGuard { _handle })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn a_new_directory_is_created_private_and_is_checked_the_same_way() {
        let parent = tempfile::tempdir().unwrap();
        let path = parent.path().join("state");
        {
            // The guard holds the directory on Windows, so it ends with the scope.
            let _guard = ensure_private_dir(&path).unwrap();
            assert!(path.is_dir());
        }
        // What was just created passes the check it is held to later.
        verify_private_dir(&path).unwrap();
    }

    #[test]
    fn a_missing_parent_is_created_and_an_existing_private_directory_is_accepted_again() {
        let parent = tempfile::tempdir().unwrap();
        let path = parent.path().join("a").join("b").join("state");
        ensure_private_dir(&path).unwrap();
        ensure_private_dir(&path).unwrap();
    }

    #[test]
    fn a_file_where_the_directory_should_be_is_refused() {
        let parent = tempfile::tempdir().unwrap();
        let path = parent.path().join("state");
        std::fs::write(&path, b"x").unwrap();
        assert!(ensure_private_dir(&path).is_err());
    }

    #[test]
    fn a_file_created_inside_a_private_directory_is_private() {
        let parent = tempfile::tempdir().unwrap();
        let path = parent.path().join("state");
        let _guard = ensure_private_dir(&path).unwrap();
        let file = path.join("credentials.json");
        std::fs::write(&file, b"{}").unwrap();
        let open = std::fs::File::open(&file).unwrap();
        // Unix makes a new file 0644 by default, so only Windows inherits privacy.
        #[cfg(windows)]
        verify_private_open_file(&open, &file).unwrap();
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            assert!(verify_private_open_file(&open, &file).is_err());
            std::fs::set_permissions(&file, std::fs::Permissions::from_mode(0o600)).unwrap();
            verify_private_open_file(&open, &file).unwrap();
        }
    }

    #[cfg(unix)]
    #[test]
    fn a_directory_open_to_others_is_refused() {
        use std::os::unix::fs::PermissionsExt;
        let parent = tempfile::tempdir().unwrap();
        let path = parent.path().join("shared");
        std::fs::create_dir(&path).unwrap();
        std::fs::set_permissions(&path, std::fs::Permissions::from_mode(0o755)).unwrap();
        assert_eq!(
            verify_private_dir(&path).unwrap_err().kind(),
            io::ErrorKind::PermissionDenied
        );
        // Existing overly permissive directories are refused, never silently repaired.
        assert_eq!(
            ensure_private_dir(&path).unwrap_err().kind(),
            io::ErrorKind::PermissionDenied
        );
        assert_eq!(
            std::fs::metadata(&path).unwrap().permissions().mode() & 0o777,
            0o755
        );
    }

    #[cfg(unix)]
    #[test]
    fn a_symlink_is_refused_by_ensure_and_verify() {
        let parent = tempfile::tempdir().unwrap();
        let real_dir = parent.path().join("real");
        ensure_private_dir(&real_dir).unwrap();
        let dir_link = parent.path().join("dir-link");
        std::os::unix::fs::symlink(&real_dir, &dir_link).unwrap();
        assert_eq!(
            ensure_private_dir(&dir_link).unwrap_err().kind(),
            io::ErrorKind::PermissionDenied
        );
        assert_eq!(
            verify_private_dir(&dir_link).unwrap_err().kind(),
            io::ErrorKind::PermissionDenied
        );
    }

    #[cfg(unix)]
    #[test]
    fn verify_private_open_file_checks_the_open_descriptor() {
        use std::os::unix::fs::PermissionsExt;
        let parent = tempfile::tempdir().unwrap();
        let file_path = parent.path().join("secret");
        std::fs::write(&file_path, b"x").unwrap();
        std::fs::set_permissions(&file_path, std::fs::Permissions::from_mode(0o644)).unwrap();
        let open = std::fs::File::open(&file_path).unwrap();
        assert_eq!(
            verify_private_open_file(&open, &file_path)
                .unwrap_err()
                .kind(),
            io::ErrorKind::PermissionDenied
        );
        std::fs::set_permissions(&file_path, std::fs::Permissions::from_mode(0o600)).unwrap();
        verify_private_open_file(&open, &file_path).unwrap();
        // Opening a private directory as a file descriptor must be refused.
        let dir_path = parent.path().join("private-dir");
        ensure_private_dir(&dir_path).unwrap();
        let open_dir = std::fs::File::open(&dir_path).unwrap();
        assert_eq!(
            verify_private_open_file(&open_dir, &dir_path)
                .unwrap_err()
                .kind(),
            io::ErrorKind::PermissionDenied
        );
    }

    #[cfg(unix)]
    #[test]
    fn foreign_owner_directory_is_refused() {
        use std::os::unix::fs::MetadataExt;
        let root = Path::new("/");
        if let Ok(meta) = std::fs::symlink_metadata(root)
            && meta.uid() != current_euid()
        {
            assert_eq!(
                verify_private_dir(root).unwrap_err().kind(),
                io::ErrorKind::PermissionDenied
            );
            assert_eq!(
                ensure_private_dir(root).unwrap_err().kind(),
                io::ErrorKind::PermissionDenied
            );
        }
    }

    #[cfg(unix)]
    #[test]
    fn a_new_directory_is_owner_only_on_unix() {
        use std::os::unix::fs::PermissionsExt;
        let parent = tempfile::tempdir().unwrap();
        let path = parent.path().join("state");
        ensure_private_dir(&path).unwrap();
        assert_eq!(
            std::fs::metadata(&path).unwrap().permissions().mode() & 0o777,
            0o700
        );
    }
}
