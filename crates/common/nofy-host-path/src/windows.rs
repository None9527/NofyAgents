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
    FILE_BASIC_INFO, FILE_FLAG_BACKUP_SEMANTICS, FILE_FLAG_OPEN_REPARSE_POINT, FILE_SHARE_DELETE,
    FILE_SHARE_READ, FILE_SHARE_WRITE, FileBasicInfo, GetFileInformationByHandle,
    GetFileInformationByHandleEx,
};

fn wide(high: u32, low: u32) -> u64 {
    (u64::from(high) << 32) | u64::from(low)
}

/// Both queries are made on one handle, so they describe one file.
pub(crate) fn identity_of_file(file: &File) -> io::Result<FileIdentity> {
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
    let kind = if attributes & FILE_ATTRIBUTE_REPARSE_POINT != 0 {
        FileKind::Symlink
    } else if attributes & FILE_ATTRIBUTE_DIRECTORY != 0 {
        FileKind::Directory
    } else {
        FileKind::File
    };
    Ok(FileIdentity {
        kind,
        len: wide(info.nFileSizeHigh, info.nFileSizeLow),
        volume: u64::from(info.dwVolumeSerialNumber),
        index: wide(info.nFileIndexHigh, info.nFileIndexLow),
        modified: timestamp_from_filetime(wide_ticks(
            info.ftLastWriteTime.dwHighDateTime,
            info.ftLastWriteTime.dwLowDateTime,
        )),
        changed: timestamp_from_filetime(basic.ChangeTime),
    })
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
    let mut options = options.clone();
    options.custom_flags(FILE_FLAG_OPEN_REPARSE_POINT);
    let file = options.open(path)?;
    // The handle is checked, not the path, so a swap after the open changes nothing.
    if identity_of_file(&file)?.kind() == FileKind::Symlink {
        return Err(io::Error::new(
            io::ErrorKind::InvalidInput,
            "refusing to open a symbolic link or other reparse point",
        ));
    }
    Ok(file)
}
