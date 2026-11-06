//! The platform contract for making a file change survive a crash.
//!
//! A store that says "committed" must mean the change is on disk. What that takes
//! differs by platform, and this crate is the one place that says so:
//!
//! - **Unix:** write the file, `fsync` it, `rename` it into place, then `fsync` the
//!   directory, because the rename lives in the directory entry. Callers do the
//!   first two steps and call [`sync_directory`] last.
//! - **Windows:** a directory cannot be opened as a plain file ("Access is
//!   denied") and the standard library has no directory flush. The rename itself
//!   is written through instead: `MoveFileExW` with `MOVEFILE_WRITE_THROUGH`
//!   returns only after the move is on disk, and NTFS logs metadata in order, so
//!   whatever was created before it is durable with it. [`sync_directory`] is then
//!   a no-op. A failure of the move means nothing was replaced.
//!
//! Every function here keeps the ordering callers rely on: a failed replace has
//! changed nothing; only a failed [`sync_directory`] leaves the outcome unknown.
use std::{io, path::Path};
use tempfile::NamedTempFile;

/// Replace `to` with `from` in one step.
pub fn replace_file(from: &Path, to: &Path) -> io::Result<()> {
    #[cfg(not(windows))]
    {
        std::fs::rename(from, to)
    }
    #[cfg(windows)]
    {
        windows_move(from, to, true)
    }
}

/// Persist a finished temporary file at `to`, replacing any file there.
pub fn persist_file(temp: NamedTempFile, to: &Path) -> io::Result<()> {
    #[cfg(not(windows))]
    {
        temp.persist(to).map(|_| ()).map_err(|error| error.error)
    }
    #[cfg(windows)]
    {
        // The moved-from path is gone afterwards; dropping the guard is harmless.
        let from = temp.into_temp_path();
        windows_move(&from, to, true)
    }
}

/// Persist a finished temporary file at `to` only if nothing is there. An
/// existing file is left untouched and reported as `ErrorKind::AlreadyExists`.
pub fn persist_new_file(temp: NamedTempFile, to: &Path) -> io::Result<()> {
    #[cfg(not(windows))]
    {
        temp.persist_noclobber(to)
            .map(|_| ())
            .map_err(|error| error.error)
    }
    #[cfg(windows)]
    {
        let from = temp.into_temp_path();
        windows_move(&from, to, false)
    }
}

/// Make the entries of `path` durable after a rename, link or removal inside it.
/// On Windows the rename was already written through, so there is nothing left
/// to flush.
pub fn sync_directory(path: &Path) -> io::Result<()> {
    #[cfg(unix)]
    {
        std::fs::File::open(path)?.sync_all()
    }
    #[cfg(not(unix))]
    {
        let _ = path;
        Ok(())
    }
}

#[cfg(windows)]
fn windows_move(from: &Path, to: &Path, replace: bool) -> io::Result<()> {
    use std::os::windows::ffi::OsStrExt;
    use windows::{
        Win32::Storage::FileSystem::{
            MOVE_FILE_FLAGS, MOVEFILE_REPLACE_EXISTING, MOVEFILE_WRITE_THROUGH, MoveFileExW,
        },
        core::PCWSTR,
    };
    let wide = |path: &Path| -> Vec<u16> {
        path.as_os_str()
            .encode_wide()
            .chain(std::iter::once(0))
            .collect()
    };
    let (from, to) = (wide(from), wide(to));
    let mut flags: MOVE_FILE_FLAGS = MOVEFILE_WRITE_THROUGH;
    if replace {
        flags |= MOVEFILE_REPLACE_EXISTING;
    }
    // SAFETY: both buffers are NUL-terminated UTF-16 that outlive the call, and
    // MoveFileExW only reads them.
    unsafe { MoveFileExW(PCWSTR(from.as_ptr()), PCWSTR(to.as_ptr()), flags) }.map_err(|error| {
        // HRESULT_FROM_WIN32 keeps the system error in the low word; mapping it
        // back lets callers see `AlreadyExists` and `PermissionDenied`.
        let code = error.code().0 as u32;
        if code >> 16 == 0x8007 {
            io::Error::from_raw_os_error((code & 0xFFFF) as i32)
        } else {
            io::Error::other(error)
        }
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;

    fn temp_in(dir: &Path, contents: &[u8]) -> NamedTempFile {
        let mut temp = NamedTempFile::new_in(dir).unwrap();
        temp.write_all(contents).unwrap();
        temp.as_file().sync_all().unwrap();
        temp
    }

    #[test]
    fn replace_file_replaces_an_existing_file_and_removes_the_source() {
        let dir = tempfile::tempdir().unwrap();
        let (from, to) = (dir.path().join("new"), dir.path().join("current"));
        std::fs::write(&to, b"old").unwrap();
        std::fs::write(&from, b"new").unwrap();
        replace_file(&from, &to).unwrap();
        sync_directory(dir.path()).unwrap();
        assert_eq!(std::fs::read(&to).unwrap(), b"new");
        assert!(!from.exists());
    }

    #[test]
    fn replace_file_reports_a_missing_source_and_keeps_the_target() {
        let dir = tempfile::tempdir().unwrap();
        let to = dir.path().join("current");
        std::fs::write(&to, b"keep").unwrap();
        assert!(replace_file(&dir.path().join("absent"), &to).is_err());
        assert_eq!(std::fs::read(&to).unwrap(), b"keep");
    }

    #[test]
    fn persist_file_replaces_and_creates() {
        let dir = tempfile::tempdir().unwrap();
        let to = dir.path().join("value");
        persist_file(temp_in(dir.path(), b"one"), &to).unwrap();
        assert_eq!(std::fs::read(&to).unwrap(), b"one");
        persist_file(temp_in(dir.path(), b"two"), &to).unwrap();
        assert_eq!(std::fs::read(&to).unwrap(), b"two");
        sync_directory(dir.path()).unwrap();
        // Only the final file remains: no temporary is left behind.
        assert_eq!(std::fs::read_dir(dir.path()).unwrap().count(), 1);
    }

    #[test]
    fn persist_new_file_never_replaces() {
        let dir = tempfile::tempdir().unwrap();
        let to = dir.path().join("immutable");
        persist_new_file(temp_in(dir.path(), b"first"), &to).unwrap();
        let error = persist_new_file(temp_in(dir.path(), b"second"), &to).unwrap_err();
        assert_eq!(error.kind(), io::ErrorKind::AlreadyExists, "{error}");
        assert_eq!(std::fs::read(&to).unwrap(), b"first");
        // The rejected temporary is cleaned up, not left beside the file.
        assert_eq!(std::fs::read_dir(dir.path()).unwrap().count(), 1);
    }

    #[test]
    fn sync_directory_accepts_a_real_directory() {
        let dir = tempfile::tempdir().unwrap();
        sync_directory(dir.path()).unwrap();
    }
}
