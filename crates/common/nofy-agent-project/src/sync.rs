//! Flushing a directory so a rename or removal inside it survives a crash.
use std::{io, path::Path};

/// Make the entries of `path` durable after a rename or a removal.
///
/// Unix opens the directory and fsyncs it. Windows cannot: a directory opened
/// as a plain file is refused with "Access is denied", and the standard library
/// has no directory flush. There NTFS journals metadata, so a rename stays
/// atomic; what is not forced is that it reaches the disk before this returns,
/// so a crash in that instant can lose the last update but not corrupt the store.
pub(crate) fn sync_directory(path: &Path) -> io::Result<()> {
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
