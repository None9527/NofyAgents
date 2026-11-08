//! Windows declaration checks run on every OS without probing that filesystem.
use super::*;

fn windows(path: &str, private: &str) -> Result<()> {
    validate_path(Path::new(path), Path::new(private), Syntax::Windows)
}

#[test]
fn windows_accepts_drive_unc_and_verbatim_children_without_filesystem_access() {
    for path in [
        r"C:\projects\app",
        r"c:\Program Files\app",
        r"\\?\C:\projects\app",
        r"\\server\share\project",
        r"\\?\UNC\server\share\project",
        r"D:\Nofy\private",
        r"C:\Nofy\private-other",
        r"C:\Nofy\private2\child",
        r"\\other-server\share\private",
        r"\\server\other-share\private",
        r"\\server\share\private-other",
    ] {
        assert!(windows(path, r"C:\Nofy\private").is_ok(), "{path:?}");
        assert!(windows(path, r"\\server\share\private").is_ok(), "{path:?}");
    }
}

#[test]
fn windows_private_overlap_rejects_case_and_verbatim_aliases_in_both_directions() {
    for private in [r"C:\Nofy\Private", r"\\?\C:\Nofy\Private"] {
        for path in [
            r"C:\Nofy\Private",
            r"c:\nofy\PRIVATE",
            r"C:\NOFY\Private\catalog",
            r"c:\NOFY",
            r"\\?\c:\NOFY\private",
            r"\\?\C:\nofy\PRIVATE\catalog",
            r"\\?\C:\NOFY",
        ] {
            assert!(windows(path, private).is_err(), "{path:?} vs {private:?}");
        }
    }
    for private in [
        r"\\Server\Share\Nofy\Private",
        r"\\?\UNC\Server\Share\Nofy\Private",
    ] {
        for path in [
            r"\\server\SHARE\nofy\PRIVATE",
            r"\\SERVER\share\Nofy\private\catalog",
            r"\\server\Share\NOFY",
            r"\\?\UNC\SERVER\share\nofy\private",
            r"\\?\UNC\server\SHARE\Nofy\Private\catalog",
            r"\\?\UNC\server\Share\NOFY",
        ] {
            assert!(windows(path, private).is_err(), "{path:?} vs {private:?}");
        }
    }
}

#[test]
fn windows_refuses_roots_relative_device_stream_and_non_normalized_paths() {
    let long = format!(r"C:\{}", "a".repeat(4096));
    for path in [
        "",
        "relative",
        r"C:",
        r"C:relative",
        r"\current-drive",
        "/posix",
        r"C:\",
        r"\\?\C:\",
        r"\\server\share",
        r"\\server\share\",
        r"\\?\UNC\server\share",
        r"\\?\UNC\server\share\",
        r"\\.\C:\project",
        r"\\.\COM1",
        r"\\?\Volume{1234}\project",
        r"C:\project:stream",
        r"\\?\C:\project:stream",
        r"C:\nul",
        r"C:\NUL.txt",
        r"C:\COM1",
        r"C:\project.",
        r"C:\project ",
        r"C:\a\\b",
        r"C:\a\.\b",
        r"C:\a\..\b",
        r"C:\project\",
        r"C:/project",
        r"C:\a/b",
        r"C:\a?b",
        "C:\\a\nb",
        long.as_str(),
    ] {
        assert!(windows(path, r"D:\private").is_err(), "{path:?}");
    }
}

#[cfg(unix)]
#[test]
fn posix_directory_syntax_preserves_legacy_names_and_component_normalization() {
    let private = Path::new("/nofy-private");
    for path in [
        "/project",
        "/project/child",
        "/project\\name",
        "/project:name",
        "/project//child",
        "/project/./child",
        "/project/",
        "//project",
        "/NOfy-private",
        "/nofy-private-other",
        "/project.",
        "/project ",
        "/con",
        "/project?name",
        "/proc-other",
    ] {
        assert!(
            validate_path(Path::new(path), private, Syntax::Posix).is_ok(),
            "{path:?}"
        );
    }
    for path in [
        "/",
        "//",
        "/./",
        "relative",
        "/project/../other",
        "/nofy-private",
        "/nofy-private/catalog",
        "/proc",
        "/proc/self/fd/3",
        "/sys/kernel",
        "/dev/pts",
        "/run/user",
        "/project\nname",
    ] {
        assert!(
            validate_path(Path::new(path), private, Syntax::Posix).is_err(),
            "{path:?}"
        );
    }
    assert!(
        validate_path(
            Path::new("/parent"),
            Path::new("/parent/private"),
            Syntax::Posix
        )
        .is_err()
    );
}

#[cfg(unix)]
#[test]
fn directory_declarations_reject_non_utf8_paths() {
    use std::{ffi::OsStr, os::unix::ffi::OsStrExt};
    let path = Path::new(OsStr::from_bytes(b"/project/\xff"));
    assert!(validate_path(path, Path::new("/private"), Syntax::Posix).is_err());
    assert!(validate_path(path, Path::new(r"C:\private"), Syntax::Windows).is_err());
}
