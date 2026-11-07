//! Windows half of `nofy-private-fs`.
//!
//! Adapted from openai/codex, `codex-rs/uds/src/windows_security.rs` and
//! `windows_socket_validation.rs` (commit ba057e43758cb19beead2af9df19d10756cc4100),
//! Copyright 2025 OpenAI, licensed under the Apache License 2.0. Changes made here:
//! the code now serves any directory or file instead of a socket rendezvous
//! directory; the check accepts the access lists Windows gives a user's own
//! folders (the user, `SYSTEM`, Administrators, `CREATOR OWNER`) instead of
//! exactly one entry; a path that is a file is checked too, without pinning it;
//! errors name the path and the reason. See THIRD_PARTY.md and the repository's
//! THIRD-PARTY-NOTICES.
use std::{
    io,
    os::windows::{
        ffi::OsStrExt,
        io::{FromRawHandle, OwnedHandle, RawHandle},
    },
    path::{Path, PathBuf},
    ptr,
};
use windows_sys::Win32::{
    Foundation::{INVALID_HANDLE_VALUE, LocalFree},
    Security::{
        ACCESS_ALLOWED_ACE, ACE_HEADER, ACL,
        Authorization::{
            ConvertSidToStringSidW, ConvertStringSecurityDescriptorToSecurityDescriptorW,
            GetSecurityInfo, SDDL_REVISION_1, SE_FILE_OBJECT,
        },
        CreateWellKnownSid, DACL_SECURITY_INFORMATION, EqualSid, GetAce, GetTokenInformation,
        OWNER_SECURITY_INFORMATION, PSID, SECURITY_ATTRIBUTES, SECURITY_MAX_SID_SIZE, TOKEN_QUERY,
        TOKEN_USER, TokenUser, WinBuiltinAdministratorsSid, WinCreatorOwnerSid, WinLocalSystemSid,
    },
    Storage::FileSystem::{
        BY_HANDLE_FILE_INFORMATION, CreateDirectoryW, CreateFileW, FILE_ATTRIBUTE_DIRECTORY,
        FILE_ATTRIBUTE_REPARSE_POINT, FILE_FLAG_BACKUP_SEMANTICS, FILE_FLAG_OPEN_REPARSE_POINT,
        FILE_LIST_DIRECTORY, FILE_READ_ATTRIBUTES, FILE_SHARE_DELETE, FILE_SHARE_READ,
        FILE_SHARE_WRITE, GetFileInformationByHandle, OPEN_EXISTING, READ_CONTROL,
    },
    System::{
        SystemServices::{ACCESS_ALLOWED_ACE_TYPE, ACCESS_DENIED_ACE_TYPE},
        Threading::{GetCurrentProcess, OpenProcessToken},
    },
};

fn denied(path: &Path, reason: &str) -> io::Error {
    io::Error::new(
        io::ErrorKind::PermissionDenied,
        format!(
            "{} is not private to the current user: {reason}",
            path.display()
        ),
    )
}

fn wide(path: &Path) -> Vec<u16> {
    path.as_os_str().encode_wide().chain(Some(0)).collect()
}

/// The path with its ancestors resolved, so a junction above it is followed, and
/// its final component left alone, so a junction *at* it can be refused.
fn resolved(path: &Path) -> io::Result<PathBuf> {
    let absolute = std::path::absolute(path)?;
    match (absolute.parent(), absolute.file_name()) {
        (Some(parent), Some(name)) => Ok(std::fs::canonicalize(parent)?.join(name)),
        _ => Err(io::Error::new(
            io::ErrorKind::InvalidInput,
            "a private directory must not be a filesystem root",
        )),
    }
}

/// Pointer-aligned storage for the current user's `TOKEN_USER`, which holds
/// pointers into itself.
fn current_user() -> io::Result<Vec<usize>> {
    let mut token = ptr::null_mut();
    // SAFETY: the out-pointer is valid for the call; the pseudo-handle needs no close.
    if unsafe { OpenProcessToken(GetCurrentProcess(), TOKEN_QUERY, &mut token) } == 0 {
        return Err(io::Error::last_os_error());
    }
    // SAFETY: OpenProcessToken succeeded, so `token` is a handle this code owns.
    let token = unsafe { OwnedHandle::from_raw_handle(token as RawHandle) };
    let raw = std::os::windows::io::AsRawHandle::as_raw_handle(&token);
    let mut length = 0;
    // SAFETY: a null buffer of length 0 only asks for the size.
    unsafe { GetTokenInformation(raw as _, TokenUser, ptr::null_mut(), 0, &mut length) };
    let mut user = vec![0usize; (length as usize).div_ceil(std::mem::size_of::<usize>())];
    // SAFETY: `user` is at least `length` bytes and pointer-aligned.
    if unsafe {
        GetTokenInformation(
            raw as _,
            TokenUser,
            user.as_mut_ptr().cast(),
            length,
            &mut length,
        )
    } == 0
    {
        return Err(io::Error::last_os_error());
    }
    Ok(user)
}

fn sid_of(user: &[usize]) -> PSID {
    // SAFETY: `user` holds a TOKEN_USER written by GetTokenInformation.
    unsafe { (*(user.as_ptr().cast::<TOKEN_USER>())).User.Sid }
}

fn well_known(kind: i32) -> io::Result<Vec<u8>> {
    let mut sid = vec![0u8; SECURITY_MAX_SID_SIZE as usize];
    let mut size = sid.len() as u32;
    // SAFETY: `sid` is SECURITY_MAX_SID_SIZE bytes, the largest a SID can be.
    if unsafe { CreateWellKnownSid(kind, ptr::null_mut(), sid.as_mut_ptr().cast(), &mut size) } == 0
    {
        return Err(io::Error::last_os_error());
    }
    Ok(sid)
}

fn sid_text(sid: PSID) -> io::Result<String> {
    let mut text = ptr::null_mut();
    // SAFETY: `sid` is a valid SID and the out-pointer is valid for the call.
    if unsafe { ConvertSidToStringSidW(sid, &mut text) } == 0 {
        return Err(io::Error::last_os_error());
    }
    let mut length = 0;
    // SAFETY: ConvertSidToStringSidW returned a NUL-terminated UTF-16 string.
    while unsafe { *text.add(length) } != 0 {
        length += 1;
    }
    // SAFETY: `text` is `length` valid UTF-16 units, freed once, right after the copy.
    let result = String::from_utf16_lossy(unsafe { std::slice::from_raw_parts(text, length) });
    unsafe { LocalFree(text as _) };
    Ok(result)
}

/// Create `path` with an inheritable access list for the current user alone, or
/// check an existing one. Returns the directory held open without delete sharing.
pub(crate) fn ensure_private_dir(path: &Path) -> io::Result<OwnedHandle> {
    let user = current_user()?;
    let sid = sid_text(sid_of(&user))?;
    // Owner: the user. DACL: protected (inherits nothing), one allow entry, full
    // control for the user, inherited by files and directories created inside.
    let sddl: Vec<u16> = format!("O:{sid}D:P(A;OICI;FA;;;{sid})")
        .encode_utf16()
        .chain(Some(0))
        .collect();
    let mut descriptor = ptr::null_mut();
    // SAFETY: `sddl` is NUL-terminated and the out-pointer is valid for the call.
    if unsafe {
        ConvertStringSecurityDescriptorToSecurityDescriptorW(
            sddl.as_ptr(),
            SDDL_REVISION_1,
            &mut descriptor,
            ptr::null_mut(),
        )
    } == 0
    {
        return Err(io::Error::last_os_error());
    }
    let created = (|| {
        // The parents must exist before they can be resolved, so they come first.
        let absolute = std::path::absolute(path)?;
        if let Some(parent) = absolute.parent() {
            std::fs::create_dir_all(parent)?;
        }
        let target = resolved(&absolute)?;
        let attributes = SECURITY_ATTRIBUTES {
            nLength: std::mem::size_of::<SECURITY_ATTRIBUTES>() as u32,
            lpSecurityDescriptor: descriptor,
            bInheritHandle: 0,
        };
        let name = wide(&target);
        // SAFETY: `name` is NUL-terminated and `attributes` outlives the call.
        if unsafe { CreateDirectoryW(name.as_ptr(), &attributes) } != 0 {
            return Ok(());
        }
        let error = io::Error::last_os_error();
        // An existing directory is not repaired: it is checked below.
        if error.kind() == io::ErrorKind::AlreadyExists {
            Ok(())
        } else {
            Err(error)
        }
    })();
    // SAFETY: the descriptor was allocated by the conversion call above.
    unsafe { LocalFree(descriptor as _) };
    created?;
    verify_private(path, true)
}

/// Check that `path` is a directory (or a file) nobody but the user can use, and
/// return a handle on it. A directory is held open without delete sharing so it
/// cannot be swapped for a junction after the check; a file is not held at all.
pub(crate) fn verify_private(path: &Path, directory: bool) -> io::Result<OwnedHandle> {
    let target = resolved(path)?;
    let name = wide(&target);
    let access =
        READ_CONTROL | FILE_READ_ATTRIBUTES | if directory { FILE_LIST_DIRECTORY } else { 0 };
    // A directory is pinned by leaving out delete sharing. A file is replaced by
    // rename all the time (the credential store does it), so it shares delete.
    let sharing =
        FILE_SHARE_READ | FILE_SHARE_WRITE | if directory { 0 } else { FILE_SHARE_DELETE };
    // SAFETY: `name` is NUL-terminated; the other arguments are plain flags.
    let handle = unsafe {
        CreateFileW(
            name.as_ptr(),
            access,
            sharing,
            ptr::null(),
            OPEN_EXISTING,
            FILE_FLAG_BACKUP_SEMANTICS | FILE_FLAG_OPEN_REPARSE_POINT,
            ptr::null_mut(),
        )
    };
    if handle == INVALID_HANDLE_VALUE {
        return Err(io::Error::last_os_error());
    }
    // SAFETY: CreateFileW succeeded, so `handle` is a handle this code owns.
    let guard = unsafe { OwnedHandle::from_raw_handle(handle as RawHandle) };
    // SAFETY: an all-zero BY_HANDLE_FILE_INFORMATION is a valid value to overwrite.
    let mut info: BY_HANDLE_FILE_INFORMATION = unsafe { std::mem::zeroed() };
    // SAFETY: `handle` is open and `info` is valid for the call.
    if unsafe { GetFileInformationByHandle(handle, &mut info) } == 0 {
        return Err(io::Error::last_os_error());
    }
    if info.dwFileAttributes & FILE_ATTRIBUTE_REPARSE_POINT != 0 {
        return Err(denied(path, "it is a junction or symbolic link"));
    }
    if (info.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY != 0) != directory {
        return Err(denied(
            path,
            if directory {
                "it is not a directory"
            } else {
                "it is a directory"
            },
        ));
    }

    let user = current_user()?;
    let (system, administrators, creator) = (
        well_known(WinLocalSystemSid)?,
        well_known(WinBuiltinAdministratorsSid)?,
        well_known(WinCreatorOwnerSid)?,
    );
    let mut owner = ptr::null_mut();
    let mut dacl: *mut ACL = ptr::null_mut();
    let mut descriptor = ptr::null_mut();
    // SAFETY: `handle` is open; the out-pointers are valid for the call.
    let status = unsafe {
        GetSecurityInfo(
            handle,
            SE_FILE_OBJECT,
            OWNER_SECURITY_INFORMATION | DACL_SECURITY_INFORMATION,
            &mut owner,
            ptr::null_mut(),
            &mut dacl,
            ptr::null_mut(),
            &mut descriptor,
        )
    };
    if status != 0 {
        return Err(io::Error::from_raw_os_error(status as i32));
    }
    let verdict = judge(
        owner,
        dacl,
        sid_of(&user),
        [
            system.as_ptr() as PSID,
            administrators.as_ptr() as PSID,
            creator.as_ptr() as PSID,
        ],
        administrators.as_ptr() as PSID,
    );
    // SAFETY: the descriptor was allocated by GetSecurityInfo.
    unsafe { LocalFree(descriptor as _) };
    verdict.map_err(|reason| denied(path, reason))?;
    Ok(guard)
}

/// The rule, apart from the system calls that feed it. The owner must be the user
/// or the Administrators group (what an elevated process creates files as). There
/// must be an access list at all, because none means everyone. Every entry that
/// *allows* access must name the user, `SYSTEM`, Administrators or `CREATOR
/// OWNER`; entries that deny are ignored, and an entry of a kind this code does
/// not understand is not trusted.
fn judge(
    owner: PSID,
    dacl: *mut ACL,
    user: PSID,
    others: [PSID; 3],
    administrators: PSID,
) -> Result<(), &'static str> {
    // SAFETY: the pointers come from GetSecurityInfo and the buffers above, which
    // outlive this call; each ACE is read only within the list's AceCount.
    unsafe {
        if owner.is_null() || (EqualSid(owner, user) == 0 && EqualSid(owner, administrators) == 0) {
            return Err("its owner is another user");
        }
        if dacl.is_null() {
            return Err("it has no access list, which allows everyone");
        }
        for index in 0..(*dacl).AceCount {
            let mut ace = ptr::null_mut();
            if GetAce(dacl, u32::from(index), &mut ace) == 0 {
                return Err("its access list could not be read");
            }
            match u32::from((*ace.cast::<ACE_HEADER>()).AceType) {
                ACCESS_DENIED_ACE_TYPE => {}
                ACCESS_ALLOWED_ACE_TYPE => {
                    let sid = ptr::addr_of_mut!((*ace.cast::<ACCESS_ALLOWED_ACE>()).SidStart)
                        .cast::<core::ffi::c_void>();
                    let known = EqualSid(sid, user) != 0
                        || others.iter().any(|other| EqualSid(sid, *other) != 0);
                    if !known {
                        return Err("its access list lets in someone other than the user");
                    }
                }
                _ => return Err("its access list has an entry of a kind that is not understood"),
            }
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::super::*;
    use std::process::Command;

    fn powershell(script: &str, path: &Path) -> String {
        let output = Command::new("powershell.exe")
            .args(["-NoProfile", "-NonInteractive", "-Command", script])
            .env("NOFY_TEST_PATH", path)
            .output()
            .unwrap();
        assert!(
            output.status.success(),
            "{}",
            String::from_utf8_lossy(&output.stderr)
        );
        String::from_utf8_lossy(&output.stdout).into_owned()
    }

    fn sddl(path: &Path) -> String {
        powershell(
            "$ErrorActionPreference='Stop'; (Get-Acl -LiteralPath $env:NOFY_TEST_PATH).Sddl",
            path,
        )
    }

    #[test]
    fn a_directory_it_creates_passes_and_holds_what_is_created_inside() {
        let parent = tempfile::tempdir().unwrap();
        let path = parent.path().join("state");
        let guard = ensure_private_dir(&path).unwrap();
        let file = path.join("credentials.json");
        std::fs::write(&file, b"{}").unwrap();
        // Inherited from the directory, with nothing set on the file itself.
        verify_private_file(&file).unwrap();
        std::fs::create_dir(path.join("inner")).unwrap();
        verify_private_dir(&path.join("inner")).unwrap();
        // While it is held, the directory cannot be renamed away and replaced.
        assert!(std::fs::rename(&path, parent.path().join("moved")).is_err());
        drop(guard);
    }

    #[test]
    fn a_folder_with_the_access_list_windows_gives_the_users_own_folders_passes() {
        // %TEMP% sits in the user profile: user, SYSTEM and Administrators only.
        let parent = tempfile::tempdir().unwrap();
        verify_private_dir(parent.path()).unwrap();
    }

    #[test]
    fn an_access_list_that_lets_everyone_in_is_refused_and_left_unrepaired() {
        let parent = tempfile::tempdir().unwrap();
        let path = parent.path().join("state");
        ensure_private_dir(&path).unwrap();
        powershell(
            r#"
$ErrorActionPreference = 'Stop'
$acl = Get-Acl -LiteralPath $env:NOFY_TEST_PATH
$everyone = [System.Security.Principal.SecurityIdentifier]::new('S-1-1-0')
$rule = [System.Security.AccessControl.FileSystemAccessRule]::new($everyone, 'Read', 'ContainerInherit,ObjectInherit', 'None', 'Allow')
$acl.AddAccessRule($rule)
Set-Acl -LiteralPath $env:NOFY_TEST_PATH -AclObject $acl
"#,
            &path,
        );
        let before = sddl(&path);
        assert_eq!(
            verify_private_dir(&path).unwrap_err().kind(),
            io::ErrorKind::PermissionDenied
        );
        assert_eq!(
            ensure_private_dir(&path).unwrap_err().kind(),
            io::ErrorKind::PermissionDenied
        );
        assert_eq!(
            before,
            sddl(&path),
            "the check must not change the access list"
        );
    }

    #[test]
    fn a_junction_is_refused() {
        let parent = tempfile::tempdir().unwrap();
        let (target, junction) = (parent.path().join("target"), parent.path().join("junction"));
        std::fs::create_dir(&target).unwrap();
        let output = Command::new("powershell.exe")
            .args([
                "-NoProfile",
                "-NonInteractive",
                "-Command",
                "$ErrorActionPreference='Stop'; New-Item -ItemType Junction -Path $env:NOFY_LINK -Target $env:NOFY_TARGET | Out-Null",
            ])
            .env("NOFY_LINK", &junction)
            .env("NOFY_TARGET", &target)
            .output()
            .unwrap();
        assert!(
            output.status.success(),
            "{}",
            String::from_utf8_lossy(&output.stderr)
        );
        assert_eq!(
            verify_private_dir(&junction).unwrap_err().kind(),
            io::ErrorKind::PermissionDenied
        );
        assert_eq!(
            ensure_private_dir(&junction).unwrap_err().kind(),
            io::ErrorKind::PermissionDenied
        );
    }

    #[test]
    fn a_volume_root_is_refused() {
        // A volume that does not exist keeps this safe even if the guard breaks.
        let root = Path::new(r"\\?\Volume{00000000-0000-0000-0000-000000000000}\");
        assert_eq!(
            ensure_private_dir(root).unwrap_err().kind(),
            io::ErrorKind::InvalidInput
        );
    }

    #[test]
    fn a_file_where_a_directory_is_expected_and_the_reverse_are_refused() {
        let parent = tempfile::tempdir().unwrap();
        let file = parent.path().join("f");
        std::fs::write(&file, b"x").unwrap();
        assert!(verify_private_dir(&file).is_err());
        assert!(verify_private_file(parent.path()).is_err());
    }
}
