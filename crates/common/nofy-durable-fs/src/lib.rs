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

/// Whether a failed non-blocking file lock only means "somebody else holds it
/// right now", so a caller can wait and try again.
///
/// Unix reports that as `ErrorKind::WouldBlock`. Windows reports
/// `ERROR_LOCK_VIOLATION` (33), which `fs2` passes through and the standard
/// library does not classify as `WouldBlock`; a caller that only tested the kind
/// would treat ordinary contention as a failure.
pub fn lock_contended(error: &io::Error) -> bool {
    error.kind() == io::ErrorKind::WouldBlock || (cfg!(windows) && error.raw_os_error() == Some(33))
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

/// Windows system errors that mean "somebody has it open right now": access denied
/// and the sharing and lock violations. Antivirus and indexers hold a freshly
/// written file for a moment without delete sharing, and the move succeeds when
/// they let go.
#[cfg_attr(not(windows), allow(dead_code))]
fn busy_for_a_moment(system_error: i32) -> bool {
    matches!(system_error, 5 | 32 | 33)
}

/// The path in extended-length form, so a long state directory (over 260
/// characters) does not defeat the move. An already prefixed path is left alone.
#[cfg_attr(not(windows), allow(dead_code))]
fn extended_length(absolute: &str) -> String {
    if absolute.starts_with(r"\\?\") || absolute.starts_with(r"\\.\") {
        absolute.to_owned()
    } else if let Some(share) = absolute.strip_prefix(r"\\") {
        format!(r"\\?\UNC\{share}")
    } else {
        format!(r"\\?\{absolute}")
    }
}

#[cfg(windows)]
fn windows_move(from: &Path, to: &Path, replace: bool) -> io::Result<()> {
    use std::{os::windows::ffi::OsStrExt, time::Duration};
    use windows::{
        Win32::Storage::FileSystem::{
            MOVE_FILE_FLAGS, MOVEFILE_REPLACE_EXISTING, MOVEFILE_WRITE_THROUGH, MoveFileExW,
        },
        core::PCWSTR,
    };
    let wide = |path: &Path| -> io::Result<Vec<u16>> {
        let absolute = std::path::absolute(path)?;
        let text = absolute.to_str().ok_or_else(|| {
            io::Error::new(io::ErrorKind::InvalidInput, "path is not valid Unicode")
        })?;
        if text.contains('\0') {
            return Err(io::Error::new(
                io::ErrorKind::InvalidInput,
                "path contains a NUL",
            ));
        }
        Ok(std::ffi::OsStr::new(&extended_length(text))
            .encode_wide()
            .chain(std::iter::once(0))
            .collect())
    };
    let (from, to) = (wide(from)?, wide(to)?);
    let mut flags: MOVE_FILE_FLAGS = MOVEFILE_WRITE_THROUGH;
    if replace {
        flags |= MOVEFILE_REPLACE_EXISTING;
    }
    // A bounded wait, because callers hold this on a blocking thread.
    const ATTEMPTS: u32 = 40;
    for attempt in 1..=ATTEMPTS {
        // SAFETY: both buffers are NUL-terminated UTF-16 that outlive the call, and
        // MoveFileExW only reads them.
        let moved = unsafe { MoveFileExW(PCWSTR(from.as_ptr()), PCWSTR(to.as_ptr()), flags) };
        let error = match moved {
            Ok(()) => return Ok(()),
            Err(error) => {
                // HRESULT_FROM_WIN32 keeps the system error in the low word; mapping
                // it back lets callers see `AlreadyExists` and `PermissionDenied`.
                let code = error.code().0 as u32;
                if code >> 16 == 0x8007 {
                    io::Error::from_raw_os_error((code & 0xFFFF) as i32)
                } else {
                    io::Error::other(error)
                }
            }
        };
        let busy = error.raw_os_error().is_some_and(busy_for_a_moment);
        if !busy || attempt == ATTEMPTS {
            return Err(error);
        }
        std::thread::sleep(Duration::from_millis(50));
    }
    unreachable!("the loop returns on its last attempt")
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

    /// Runs only on Windows, where the 260-character limit exists.
    #[cfg(windows)]
    #[test]
    fn replace_file_works_in_a_path_longer_than_max_path() {
        let dir = tempfile::tempdir().unwrap();
        let mut deep = dir.path().to_path_buf();
        while deep.as_os_str().len() < 320 {
            deep.push("a_directory_name_of_some_length");
        }
        std::fs::create_dir_all(&deep).unwrap();
        let (from, to) = (deep.join("new"), deep.join("current"));
        std::fs::write(&to, b"old").unwrap();
        std::fs::write(&from, b"new").unwrap();
        replace_file(&from, &to).unwrap();
        assert_eq!(std::fs::read(&to).unwrap(), b"new");
    }

    #[test]
    fn long_and_network_paths_are_given_in_extended_length_form() {
        assert_eq!(extended_length(r"C:\state\a.json"), r"\\?\C:\state\a.json");
        assert_eq!(
            extended_length(r"\\server\share\a.json"),
            r"\\?\UNC\server\share\a.json"
        );
        // Already extended, or a device path: left alone.
        assert_eq!(extended_length(r"\\?\C:\a"), r"\\?\C:\a");
        assert_eq!(extended_length(r"\\.\pipe\x"), r"\\.\pipe\x");
    }

    #[test]
    fn only_a_moment_of_contention_is_retried() {
        // access denied, sharing violation, lock violation
        for code in [5, 32, 33] {
            assert!(busy_for_a_moment(code), "{code}");
        }
        // file exists, already exists, file not found, path not found
        for code in [80, 183, 2, 3] {
            assert!(!busy_for_a_moment(code), "{code}");
        }
    }

    #[test]
    fn a_lock_held_elsewhere_is_contention_and_other_failures_are_not() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("lock");
        let holder = std::fs::OpenOptions::new()
            .create(true)
            .truncate(true)
            .write(true)
            .open(&path)
            .unwrap();
        fs2::FileExt::lock_exclusive(&holder).unwrap();
        let other = std::fs::OpenOptions::new().write(true).open(&path).unwrap();
        // The real error fs2 gives on this platform, not one built by hand.
        let contended = fs2::FileExt::try_lock_exclusive(&other).unwrap_err();
        assert!(lock_contended(&contended), "{contended:?}");
        assert!(!lock_contended(&io::Error::from(io::ErrorKind::NotFound)));
        assert!(!lock_contended(&io::Error::from(
            io::ErrorKind::PermissionDenied
        )));
    }

    #[test]
    fn sync_directory_accepts_a_real_directory() {
        let dir = tempfile::tempdir().unwrap();
        sync_directory(dir.path()).unwrap();
    }
}
