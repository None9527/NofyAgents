//! Telling files apart, and telling whether one changed.
use std::{fs::File, io, path::Path};

/// What a path points at, without following it.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub enum FileKind {
    File,
    Directory,
    /// A symbolic link. On Windows every reparse point counts, junctions and
    /// mount points included: none of them is the file it stands for.
    Symlink,
    /// A device, pipe, socket or anything else that is not file data.
    Other,
}

/// A point in time, seconds and nanoseconds since the Unix epoch.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, PartialOrd, Ord)]
pub struct Timestamp {
    pub secs: i64,
    pub nanos: u32,
}

/// Who a file is and what state it was in when it was read.
///
/// Two readings are equal only if every part is equal, so the pair
/// (reading before, reading after) answers "was this file replaced or rewritten
/// in between". Equality is meaningful for one platform at a time; the numbers
/// mean different things on each and are never to be stored or compared across
/// machines.
///
/// - **Unix:** device, inode, modification time, status-change time (`ctime`,
///   which a writer cannot set backwards) and size.
/// - **Windows:** volume serial number, file index, last-write time, change time
///   and size, from `GetFileInformationByHandle` and its `FileBasicInfo` sibling.
///
/// The Windows file index is 64 bits. File systems with wider identifiers (ReFS)
/// can in principle give two files one index; the times and size are part of the
/// comparison for that reason.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub struct FileIdentity {
    pub(crate) kind: FileKind,
    pub(crate) len: u64,
    pub(crate) volume: u64,
    pub(crate) index: u64,
    pub(crate) modified: Timestamp,
    pub(crate) changed: Timestamp,
}

impl FileIdentity {
    /// The identity of an open file, read from its handle: it describes the file
    /// the handle holds, whatever the path now points at.
    pub fn of_file(file: &File) -> io::Result<Self> {
        imp::of_file(file)
    }

    /// The identity of what `path` names, without following a final link: a
    /// symbolic link (a reparse point on Windows) is described, not its target.
    /// `ErrorKind::NotFound` means nothing is there.
    pub fn of_path(path: &Path) -> io::Result<Self> {
        imp::of_path(path)
    }

    pub fn kind(&self) -> FileKind {
        self.kind
    }

    /// Size in bytes. Meaningful for files and links; a directory's size is
    /// whatever the platform reports.
    pub fn len(&self) -> u64 {
        self.len
    }

    pub fn is_empty(&self) -> bool {
        self.len == 0
    }

    /// The volume the file lives on: `st_dev` on Unix, the volume serial number
    /// on Windows. Two paths on one file system share it; a rename between two
    /// volumes is not atomic.
    pub fn volume(&self) -> u64 {
        self.volume
    }

    /// The file's number on its volume: the inode on Unix, the file index on
    /// Windows. Unique within [`Self::volume`] while the file exists.
    pub fn index(&self) -> u64 {
        self.index
    }

    /// When the content was last written.
    pub fn modified(&self) -> Timestamp {
        self.modified
    }

    /// When the file's content or metadata last changed (`ctime`, or the
    /// Windows change time).
    pub fn changed(&self) -> Timestamp {
        self.changed
    }

    /// Whether both readings are of one file: same volume and same index. Says
    /// nothing about whether it changed.
    pub fn same_file(&self, other: &Self) -> bool {
        self.volume == other.volume && self.index == other.index
    }
}

#[cfg(unix)]
mod imp {
    use super::{FileIdentity, FileKind, Timestamp};
    use std::{
        fs::{File, Metadata},
        io,
        os::unix::fs::MetadataExt,
        path::Path,
    };

    fn kind(meta: &Metadata) -> FileKind {
        let kind = meta.file_type();
        if kind.is_file() {
            FileKind::File
        } else if kind.is_dir() {
            FileKind::Directory
        } else if kind.is_symlink() {
            FileKind::Symlink
        } else {
            FileKind::Other
        }
    }

    fn nanos(value: i64) -> u32 {
        u32::try_from(value).unwrap_or(0)
    }

    fn from_metadata(meta: &Metadata) -> FileIdentity {
        FileIdentity {
            kind: kind(meta),
            len: meta.len(),
            volume: meta.dev(),
            index: meta.ino(),
            modified: Timestamp {
                secs: meta.mtime(),
                nanos: nanos(meta.mtime_nsec()),
            },
            changed: Timestamp {
                secs: meta.ctime(),
                nanos: nanos(meta.ctime_nsec()),
            },
        }
    }

    pub(super) fn of_file(file: &File) -> io::Result<FileIdentity> {
        file.metadata().map(|meta| from_metadata(&meta))
    }

    pub(super) fn of_path(path: &Path) -> io::Result<FileIdentity> {
        std::fs::symlink_metadata(path).map(|meta| from_metadata(&meta))
    }
}

#[cfg(windows)]
mod imp {
    use super::FileIdentity;
    use std::{fs::File, io, path::Path};

    pub(super) fn of_file(file: &File) -> io::Result<FileIdentity> {
        crate::windows::identity_of_file(file)
    }

    pub(super) fn of_path(path: &Path) -> io::Result<FileIdentity> {
        crate::windows::identity_of_path(path)
    }
}

/// A Windows `FILETIME` count (100 ns ticks since 1601) as a Unix time.
#[cfg(any(windows, test))]
pub(crate) fn timestamp_from_filetime(ticks: i64) -> Timestamp {
    const TICKS_PER_SECOND: i64 = 10_000_000;
    const UNIX_EPOCH_TICKS: i64 = 116_444_736_000_000_000;
    let since_unix_epoch = ticks.saturating_sub(UNIX_EPOCH_TICKS);
    Timestamp {
        secs: since_unix_epoch.div_euclid(TICKS_PER_SECOND),
        // Below 10_000_000 ticks of 100 ns each: fits a u32 with room to spare.
        nanos: u32::try_from(since_unix_epoch.rem_euclid(TICKS_PER_SECOND) * 100).unwrap_or(0),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;

    fn write(path: &Path, bytes: &[u8]) {
        let mut file = File::create(path).unwrap();
        file.write_all(bytes).unwrap();
        file.sync_all().unwrap();
    }

    #[test]
    fn the_unix_epoch_is_zero_in_filetime_terms() {
        assert_eq!(
            timestamp_from_filetime(116_444_736_000_000_000),
            Timestamp { secs: 0, nanos: 0 }
        );
        assert_eq!(
            timestamp_from_filetime(116_444_736_000_000_000 + 15_000_000 + 7),
            Timestamp {
                secs: 1,
                nanos: 5_000_000 * 100 + 700
            }
        );
        // Before 1970 rounds toward the past, not toward zero.
        assert_eq!(
            timestamp_from_filetime(116_444_736_000_000_000 - 1),
            Timestamp {
                secs: -1,
                nanos: 999_999_900
            }
        );
    }

    #[test]
    fn a_file_reads_the_same_by_handle_and_by_path() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("f");
        write(&path, b"hello");
        let by_path = FileIdentity::of_path(&path).unwrap();
        let by_handle = FileIdentity::of_file(&File::open(&path).unwrap()).unwrap();
        assert_eq!(by_path.kind(), FileKind::File);
        assert_eq!(by_path.len(), 5);
        assert!(!by_path.is_empty());
        assert_eq!(by_path, by_handle);
    }

    #[test]
    fn a_directory_is_a_directory_and_a_missing_path_is_not_found() {
        let dir = tempfile::tempdir().unwrap();
        assert_eq!(
            FileIdentity::of_path(dir.path()).unwrap().kind(),
            FileKind::Directory
        );
        let missing = FileIdentity::of_path(&dir.path().join("nope")).unwrap_err();
        assert_eq!(missing.kind(), io::ErrorKind::NotFound);
    }

    #[test]
    fn two_files_differ_and_a_hard_link_is_the_same_file() {
        let dir = tempfile::tempdir().unwrap();
        let (a, b, link) = (
            dir.path().join("a"),
            dir.path().join("b"),
            dir.path().join("link"),
        );
        write(&a, b"same");
        write(&b, b"same");
        std::fs::hard_link(&a, &link).unwrap();
        let (a, b, link) = (
            FileIdentity::of_path(&a).unwrap(),
            FileIdentity::of_path(&b).unwrap(),
            FileIdentity::of_path(&link).unwrap(),
        );
        assert!(!a.same_file(&b));
        assert_ne!(a, b);
        assert!(a.same_file(&link));
        assert_eq!(a.volume(), b.volume());
        assert_ne!(a.index(), b.index());
    }

    #[test]
    fn replacing_a_file_with_equal_bytes_changes_its_identity() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("f");
        let other = dir.path().join("g");
        write(&path, b"bytes");
        let before = FileIdentity::of_path(&path).unwrap();
        // The replacement is created while the original exists, so the two
        // cannot share a number.
        write(&other, b"bytes");
        std::fs::rename(&other, &path).unwrap();
        let after = FileIdentity::of_path(&path).unwrap();
        assert!(!before.same_file(&after));
        assert_ne!(before, after);
    }

    #[test]
    fn rewriting_in_place_changes_the_times() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("f");
        write(&path, b"one");
        let file = std::fs::OpenOptions::new().write(true).open(&path).unwrap();
        let t = std::time::UNIX_EPOCH + std::time::Duration::from_secs(1_000_000_000);
        file.set_modified(t).unwrap();
        let first = FileIdentity::of_file(&file).unwrap();
        file.set_modified(t + std::time::Duration::from_secs(60))
            .unwrap();
        let second = FileIdentity::of_file(&file).unwrap();
        assert!(first.same_file(&second));
        assert_ne!(first.modified(), second.modified());
        assert_ne!(first, second);
    }

    #[cfg(unix)]
    #[test]
    fn a_symlink_is_described_not_followed() {
        let dir = tempfile::tempdir().unwrap();
        let target = dir.path().join("target");
        let link = dir.path().join("link");
        write(&target, b"data");
        std::os::unix::fs::symlink(&target, &link).unwrap();
        let described = FileIdentity::of_path(&link).unwrap();
        assert_eq!(described.kind(), FileKind::Symlink);
        assert!(!described.same_file(&FileIdentity::of_path(&target).unwrap()));
    }

    #[cfg(unix)]
    #[test]
    fn a_fifo_is_other() {
        let dir = tempfile::tempdir().unwrap();
        let fifo = dir.path().join("fifo");
        let c_path = std::ffi::CString::new(fifo.to_str().unwrap()).unwrap();
        // SAFETY: `c_path` is a valid NUL-terminated path that outlives the call.
        assert_eq!(unsafe { libc::mkfifo(c_path.as_ptr(), 0o600) }, 0);
        assert_eq!(
            FileIdentity::of_path(&fifo).unwrap().kind(),
            FileKind::Other
        );
    }
}
