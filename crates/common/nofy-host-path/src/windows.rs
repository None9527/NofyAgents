//! The Win32 half: reading a handle's identity and opening without following.
use crate::identity::{FileIdentity, FileKind, timestamp_from_filetime};
use std::{
    ffi::c_void,
    fs::{File, OpenOptions},
    io, mem,
    os::windows::{fs::OpenOptionsExt, io::AsRawHandle},
    path::Path,
};
use windows_sys::Win32::Storage::FileSystem::{
    BY_HANDLE_FILE_INFORMATION, FILE_ATTRIBUTE_DIRECTORY, FILE_ATTRIBUTE_REPARSE_POINT,
    FILE_ATTRIBUTE_TAG_INFO, FILE_BASIC_INFO, FILE_FLAG_BACKUP_SEMANTICS,
    FILE_FLAG_OPEN_REPARSE_POINT, FILE_SHARE_DELETE, FILE_SHARE_READ, FILE_SHARE_WRITE,
    FileAttributeTagInfo, FileBasicInfo, GetFileInformationByHandle, GetFileInformationByHandleEx,
};

const IO_REPARSE_TAG_MOUNT_POINT: u32 = 0xA000_0003;
const IO_REPARSE_TAG_SYMLINK: u32 = 0xA000_000C;
const IO_REPARSE_TAG_CLOUD: u32 = 0x9000_001A;
const IO_REPARSE_TAG_CLOUD_MASK: u32 = 0x0000_F000;

fn is_cloud_reparse_tag(tag: u32) -> bool {
    (tag & !IO_REPARSE_TAG_CLOUD_MASK) == IO_REPARSE_TAG_CLOUD
}

fn is_link_reparse_tag(tag: u32) -> bool {
    matches!(tag, IO_REPARSE_TAG_SYMLINK | IO_REPARSE_TAG_MOUNT_POINT)
}

fn classify_reparse_point(attributes: u32, reparse_tag: u32) -> (FileKind, bool) {
    if is_link_reparse_tag(reparse_tag) || !is_cloud_reparse_tag(reparse_tag) {
        (FileKind::Symlink, false)
    } else if attributes & FILE_ATTRIBUTE_DIRECTORY != 0 {
        (FileKind::Directory, true)
    } else {
        (FileKind::File, true)
    }
}

fn reparse_tag_of_handle(handle: *mut c_void) -> io::Result<u32> {
    // SAFETY: `FILE_ATTRIBUTE_TAG_INFO` is plain data for which all-zero is a valid value.
    let mut tag_info: FILE_ATTRIBUTE_TAG_INFO = unsafe { mem::zeroed() };
    // SAFETY: `handle` stays valid for the call because the caller borrows the open `File`,
    // and `tag_info` is a writable structure whose exact byte size is passed.
    let queried = unsafe {
        GetFileInformationByHandleEx(
            handle,
            FileAttributeTagInfo,
            (&mut tag_info as *mut FILE_ATTRIBUTE_TAG_INFO).cast::<c_void>(),
            mem::size_of::<FILE_ATTRIBUTE_TAG_INFO>() as u32,
        )
    };
    if queried == 0 {
        return Err(io::Error::last_os_error());
    }
    Ok(tag_info.ReparseTag)
}

fn wide(high: u32, low: u32) -> u64 {
    (u64::from(high) << 32) | u64::from(low)
}

/// Inspect a live handle, distinguishing cloud-storage placeholders
/// (`IO_REPARSE_TAG_CLOUD*`, e.g. OneDrive Files On-Demand) from symbolic links,
/// directory junctions/mount points (`IO_REPARSE_TAG_SYMLINK`,
/// `IO_REPARSE_TAG_MOUNT_POINT`), and other non-cloud reparse points.
fn inspect_file(file: &File) -> io::Result<(FileIdentity, bool)> {
    let handle = file.as_raw_handle();
    // SAFETY: `BY_HANDLE_FILE_INFORMATION` is plain data for which all-zero is a valid value.
    let mut info: BY_HANDLE_FILE_INFORMATION = unsafe { mem::zeroed() };
    // SAFETY: `handle` stays valid for the call because `file` is borrowed, and
    // `info` is a writable structure of the type the function fills in.
    if unsafe { GetFileInformationByHandle(handle, &mut info) } == 0 {
        return Err(io::Error::last_os_error());
    }
    // SAFETY: `FILE_BASIC_INFO` is plain data for which all-zero is a valid value.
    let mut basic: FILE_BASIC_INFO = unsafe { mem::zeroed() };
    // SAFETY: as above; the buffer length is the size of the structure behind the pointer.
    let queried = unsafe {
        GetFileInformationByHandleEx(
            handle,
            FileBasicInfo,
            (&mut basic as *mut FILE_BASIC_INFO).cast::<c_void>(),
            mem::size_of::<FILE_BASIC_INFO>() as u32,
        )
    };
    if queried == 0 {
        return Err(io::Error::last_os_error());
    }
    let attributes = info.dwFileAttributes;
    let (kind, is_cloud_placeholder) = if attributes & FILE_ATTRIBUTE_REPARSE_POINT != 0 {
        let reparse_tag = reparse_tag_of_handle(handle)?;
        classify_reparse_point(attributes, reparse_tag)
    } else if attributes & FILE_ATTRIBUTE_DIRECTORY != 0 {
        (FileKind::Directory, false)
    } else {
        (FileKind::File, false)
    };
    Ok((
        FileIdentity {
            kind,
            len: wide(info.nFileSizeHigh, info.nFileSizeLow),
            volume: u64::from(info.dwVolumeSerialNumber),
            index: wide(info.nFileIndexHigh, info.nFileIndexLow),
            modified: timestamp_from_filetime(wide_ticks(
                info.ftLastWriteTime.dwHighDateTime,
                info.ftLastWriteTime.dwLowDateTime,
            )),
            changed: timestamp_from_filetime(basic.ChangeTime),
        },
        is_cloud_placeholder,
    ))
}

/// Both queries are made on one handle, so they describe one file.
pub(crate) fn identity_of_file(file: &File) -> io::Result<FileIdentity> {
    Ok(inspect_file(file)?.0)
}

fn wide_ticks(high: u32, low: u32) -> i64 {
    i64::try_from(wide(high, low)).unwrap_or(i64::MAX)
}

/// Open the object itself, link or not: no access rights are asked for (so a
/// file nobody may read can still be described), every sharing mode is allowed
/// (so a file in use can be described), a directory may be opened, and a reparse
/// point is opened rather than followed.
pub(crate) fn identity_of_path(path: &Path) -> io::Result<FileIdentity> {
    let file = OpenOptions::new()
        .access_mode(0)
        .share_mode(FILE_SHARE_READ | FILE_SHARE_WRITE | FILE_SHARE_DELETE)
        .custom_flags(FILE_FLAG_BACKUP_SEMANTICS | FILE_FLAG_OPEN_REPARSE_POINT)
        .open(path)?;
    identity_of_file(&file)
}

pub(crate) fn open_no_follow(options: &OpenOptions, path: &Path) -> io::Result<File> {
    let mut no_follow = options.clone();
    no_follow.custom_flags(FILE_FLAG_OPEN_REPARSE_POINT);
    let file = no_follow.open(path)?;
    // The handle is checked, not the path, so a swap after the open changes nothing.
    let (identity, is_cloud_placeholder) = inspect_file(&file)?;
    if identity.kind() == FileKind::Symlink {
        return Err(io::Error::new(
            io::ErrorKind::InvalidInput,
            "refusing to open a symbolic link or other reparse point",
        ));
    }
    if is_cloud_placeholder {
        // Re-open without FILE_FLAG_OPEN_REPARSE_POINT so the Cloud Files filter
        // driver can hydrate the placeholder normally, then confirm the handle
        // still refers to the exact same non-link file identity.
        drop(file);
        let hydrated = options.open(path)?;
        let (reopened, _) = inspect_file(&hydrated)?;
        if !reopened.same_file(&identity) || reopened.kind() == FileKind::Symlink {
            return Err(io::Error::new(
                io::ErrorKind::InvalidInput,
                "cloud placeholder changed during open",
            ));
        }
        return Ok(hydrated);
    }
    Ok(file)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reparse_classification_distinguishes_cloud_placeholders_from_links() {
        assert_eq!(
            classify_reparse_point(FILE_ATTRIBUTE_REPARSE_POINT, IO_REPARSE_TAG_SYMLINK),
            (FileKind::Symlink, false)
        );
        assert_eq!(
            classify_reparse_point(
                FILE_ATTRIBUTE_REPARSE_POINT | FILE_ATTRIBUTE_DIRECTORY,
                IO_REPARSE_TAG_MOUNT_POINT
            ),
            (FileKind::Symlink, false)
        );
        // Unknown non-cloud reparse tags fail closed as Symlink.
        assert_eq!(
            classify_reparse_point(FILE_ATTRIBUTE_REPARSE_POINT, 0x8000_001B),
            (FileKind::Symlink, false)
        );
        // OneDrive / Cloud Files placeholders (IO_REPARSE_TAG_CLOUD..CLOUD_F) are allowed.
        for nibble in 0u32..=0xF {
            let tag = IO_REPARSE_TAG_CLOUD | (nibble << 12);
            assert!(is_cloud_reparse_tag(tag), "{tag:#x}");
            assert_eq!(
                classify_reparse_point(FILE_ATTRIBUTE_REPARSE_POINT, tag),
                (FileKind::File, true)
            );
            assert_eq!(
                classify_reparse_point(
                    FILE_ATTRIBUTE_REPARSE_POINT | FILE_ATTRIBUTE_DIRECTORY,
                    tag
                ),
                (FileKind::Directory, true)
            );
        }
    }
}
