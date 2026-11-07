//! Opening a file whose last component must not be a link.
use std::{
    fs::{File, OpenOptions},
    io,
    path::Path,
};

/// Open `path` with `options`, refusing a link in the final component.
///
/// A path that was checked a moment ago can be swapped for a link to somewhere
/// else before it is opened. This closes that gap for the last component: the
/// open itself fails, or the handle it returned is checked, so there is no
/// window between a check and the use.
///
/// - **Unix:** `O_NOFOLLOW | O_CLOEXEC`. A final symbolic link fails the open.
/// - **Windows:** `FILE_FLAG_OPEN_REPARSE_POINT` opens a link itself instead of
///   its target, and the opened handle is then checked: a reparse point of any
///   kind (symbolic link, junction, mount point) is closed and refused.
///
/// Links in the directories above the final component are followed as usual. A
/// caller that must refuse those too resolves the directory first.
///
/// The caller's `options` choose the access (read, write, create...). They must
/// not set platform flags of their own (`custom_flags`): this call replaces them.
pub fn open_no_follow(options: &OpenOptions, path: &Path) -> io::Result<File> {
    imp::open(options, path, false)
}

/// [`open_no_follow`] for a path that may name a FIFO or a device: on Unix the
/// open adds `O_NONBLOCK`, so opening a FIFO that has no writer returns at once
/// instead of waiting for one. Windows has nothing to wait for and opens as
/// [`open_no_follow`] does.
///
/// The file stays in non-blocking mode. Check that it is a regular file before
/// reading, as callers of this function do.
pub fn open_no_follow_nonblocking(options: &OpenOptions, path: &Path) -> io::Result<File> {
    imp::open(options, path, true)
}

#[cfg(unix)]
mod imp {
    use std::{
        fs::{File, OpenOptions},
        io,
        os::unix::fs::OpenOptionsExt,
        path::Path,
    };

    pub(super) fn open(options: &OpenOptions, path: &Path, nonblocking: bool) -> io::Result<File> {
        let mut flags = libc::O_NOFOLLOW | libc::O_CLOEXEC;
        if nonblocking {
            flags |= libc::O_NONBLOCK;
        }
        let mut options = options.clone();
        options.custom_flags(flags);
        options.open(path)
    }
}

#[cfg(windows)]
mod imp {
    use std::{
        fs::{File, OpenOptions},
        io,
        path::Path,
    };

    pub(super) fn open(options: &OpenOptions, path: &Path, _nonblocking: bool) -> io::Result<File> {
        crate::windows::open_no_follow(options, path)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Read;

    fn read_options() -> OpenOptions {
        let mut options = OpenOptions::new();
        options.read(true);
        options
    }

    #[test]
    fn a_regular_file_opens_and_reads() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("f");
        std::fs::write(&path, b"content").unwrap();
        let mut text = String::new();
        open_no_follow(&read_options(), &path)
            .unwrap()
            .read_to_string(&mut text)
            .unwrap();
        assert_eq!(text, "content");
    }

    #[test]
    fn the_options_decide_the_access() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("f");
        let mut create = OpenOptions::new();
        create.write(true).create_new(true);
        open_no_follow(&create, &path).unwrap();
        assert!(path.is_file());
        // `create_new` refuses a second creation, so the options reached the open.
        assert_eq!(
            open_no_follow(&create, &path).unwrap_err().kind(),
            io::ErrorKind::AlreadyExists
        );
    }

    #[test]
    fn a_missing_file_is_not_found() {
        let dir = tempfile::tempdir().unwrap();
        let error = open_no_follow(&read_options(), &dir.path().join("nope")).unwrap_err();
        assert_eq!(error.kind(), io::ErrorKind::NotFound);
    }

    #[cfg(unix)]
    #[test]
    fn a_final_symlink_is_refused_but_one_above_is_followed() {
        let dir = tempfile::tempdir().unwrap();
        let real = dir.path().join("real");
        std::fs::create_dir(&real).unwrap();
        std::fs::write(real.join("f"), b"x").unwrap();
        let link = dir.path().join("link");
        std::os::unix::fs::symlink(real.join("f"), &link).unwrap();
        assert!(open_no_follow(&read_options(), &link).is_err());
        assert!(open_no_follow_nonblocking(&read_options(), &link).is_err());
        let dir_link = dir.path().join("dir_link");
        std::os::unix::fs::symlink(&real, &dir_link).unwrap();
        assert!(open_no_follow(&read_options(), &dir_link.join("f")).is_ok());
    }

    #[cfg(unix)]
    #[test]
    fn the_descriptor_does_not_survive_exec() {
        use std::os::fd::AsRawFd;
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("f");
        std::fs::write(&path, b"x").unwrap();
        let file = open_no_follow(&read_options(), &path).unwrap();
        // SAFETY: `fcntl` with `F_GETFD` only reads the flags of a descriptor
        // this test owns.
        let flags = unsafe { libc::fcntl(file.as_raw_fd(), libc::F_GETFD) };
        assert!(flags >= 0 && flags & libc::FD_CLOEXEC != 0);
    }

    #[cfg(unix)]
    #[test]
    fn a_fifo_with_no_writer_opens_only_without_blocking() {
        use std::os::fd::AsRawFd;
        let dir = tempfile::tempdir().unwrap();
        let fifo = dir.path().join("fifo");
        let c_path = std::ffi::CString::new(fifo.to_str().unwrap()).unwrap();
        // SAFETY: `c_path` is a valid NUL-terminated path that outlives the call.
        assert_eq!(unsafe { libc::mkfifo(c_path.as_ptr(), 0o600) }, 0);
        let file = open_no_follow_nonblocking(&read_options(), &fifo).unwrap();
        // SAFETY: `fcntl` with `F_GETFL` only reads the flags of a descriptor
        // this test owns.
        let flags = unsafe { libc::fcntl(file.as_raw_fd(), libc::F_GETFL) };
        assert!(flags >= 0 && flags & libc::O_NONBLOCK != 0);
        assert!(!file.metadata().unwrap().is_file());
    }

    #[cfg(windows)]
    fn symlink_or_skip(target: &Path, link: &Path) -> bool {
        match std::os::windows::fs::symlink_file(target, link) {
            Ok(()) => true,
            // ERROR_PRIVILEGE_NOT_HELD: a plain account may not create links.
            Err(error) if error.raw_os_error() == Some(1314) => {
                eprintln!("skipped: this account may not create symbolic links");
                false
            }
            Err(error) => panic!("symlink_file: {error}"),
        }
    }

    #[cfg(windows)]
    #[test]
    fn a_final_symlink_is_refused_on_windows() {
        let dir = tempfile::tempdir().unwrap();
        let target = dir.path().join("target");
        let link = dir.path().join("link");
        std::fs::write(&target, b"x").unwrap();
        if !symlink_or_skip(&target, &link) {
            return;
        }
        assert!(open_no_follow(&read_options(), &link).is_err());
        assert!(open_no_follow(&read_options(), &target).is_ok());
    }

    #[cfg(windows)]
    #[test]
    fn a_hard_link_is_an_ordinary_file_on_windows() {
        let dir = tempfile::tempdir().unwrap();
        let target = dir.path().join("target");
        let link = dir.path().join("link");
        std::fs::write(&target, b"x").unwrap();
        std::fs::hard_link(&target, &link).unwrap();
        assert!(open_no_follow(&read_options(), &link).is_ok());
    }
}
