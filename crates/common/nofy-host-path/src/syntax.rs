//! What a path looks like on each platform, written once.
//!
//! The rules are functions of the text and a [`Syntax`], not of the machine they
//! run on, so the Windows rules are exercised by every platform's tests. Only the
//! convenience wrappers at the bottom ask which syntax the host uses.
use std::{fmt, path::Path};

/// The path grammar of one platform.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Syntax {
    /// `/` separates components and an absolute path starts with `/`.
    Posix,
    /// A drive (`C:\`), a UNC share (`\\server\share\`) or a verbatim prefix
    /// (`\\?\C:\`) starts an absolute path; `\` separates components.
    Windows,
}

/// Why a path was refused by [`Syntax::check_normalized_absolute`].
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum PathError {
    /// The path is not valid UTF-8, so it cannot be judged as text.
    NotUtf8,
    /// The path does not start at a root (Unix) or a drive, share or verbatim
    /// prefix followed by a root (Windows).
    NotAbsolute,
    /// The path is longer than the caller allows.
    TooLong,
    /// The path uses the other platform's separator: `\` on Unix, `/` on
    /// Windows. A normalized path spells each location one way.
    ForeignSeparator,
    /// A control character appears in the path.
    ControlCharacter,
    /// An empty component, `.` or `..`, or nothing after the root.
    NotNormalized,
    /// A component holds a character Windows does not allow in names.
    ForbiddenCharacter,
    /// A component ends with a dot or a space, which Windows drops silently.
    TrailingDotOrSpace,
    /// A component is a Windows device name such as `con` or `com1`.
    ReservedName,
    /// A Windows prefix that does not name a file system location: a device
    /// namespace (`\\.\`) or a verbatim volume (`\\?\Volume{...}\`).
    UnsupportedPrefix,
}

impl fmt::Display for PathError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(match self {
            Self::NotUtf8 => "path is not valid UTF-8",
            Self::NotAbsolute => "path is not absolute",
            Self::TooLong => "path is too long",
            Self::ForeignSeparator => "path uses another platform's separator",
            Self::ControlCharacter => "path contains a control character",
            Self::NotNormalized => "path has an empty, `.` or `..` component",
            Self::ForbiddenCharacter => "path has a component with a character Windows forbids",
            Self::TrailingDotOrSpace => "path has a component ending in a dot or a space",
            Self::ReservedName => "path has a component that is a Windows device name",
            Self::UnsupportedPrefix => "path does not name a file system location",
        })
    }
}

impl std::error::Error for PathError {}

impl Syntax {
    /// The syntax of the platform this code runs on.
    pub const HOST: Self = if cfg!(windows) {
        Self::Windows
    } else {
        Self::Posix
    };

    /// Whether `path` starts at a root. This only reads the prefix: it does not
    /// say the rest is well formed (see [`Self::check_normalized_absolute`]).
    ///
    /// On Windows a drive needs its root (`C:\` is absolute, `C:` and `C:dir`
    /// are relative to the drive's current directory, `\dir` to the current
    /// drive), while a share or a verbatim path is absolute by itself.
    pub fn is_absolute(self, path: &str) -> bool {
        match self {
            Self::Posix => path.starts_with('/'),
            Self::Windows => {
                let parsed = windows::parse(path);
                match parsed.kind {
                    windows::Prefix::None => false,
                    windows::Prefix::Drive => parsed.rest.starts_with(windows::is_separator),
                    _ => true,
                }
            }
        }
    }

    /// Accept `path` only if it is absolute, spelled one way, and free of
    /// components that mean something other than a name.
    ///
    /// - **Posix:** starts with `/`; no `\`, no control character; every
    ///   component after the root is a non-empty name other than `.` and `..`.
    ///   The root alone is refused: there is nothing to name.
    /// - **Windows:** a drive, a UNC share, or a verbatim drive or share, then
    ///   `\` and one or more names. Only `\` separates components. A name may
    ///   not hold `< > : " | ? *`, a control character or a separator, may not
    ///   end in a dot or a space, and may not be a device name (`con`, `nul`,
    ///   `com1`...) even though a verbatim path could reach a file called that.
    ///   A `:` also keeps alternate data streams out.
    ///
    /// `max_len` bounds the length in bytes.
    pub fn check_normalized_absolute(self, path: &str, max_len: usize) -> Result<(), PathError> {
        match self {
            Self::Posix => posix_check(path, max_len),
            Self::Windows => windows::check(path, max_len),
        }
    }

    /// Whether `path` lies at or below `base`, component by component.
    ///
    /// On Windows names compare case-insensitively (see [`eq_fold`]), both
    /// separators count, and a verbatim prefix equals its plain spelling
    /// (`\\?\C:\a` is `C:\a`, which is what `canonicalize` hands back); on Unix
    /// this is exactly [`Path::starts_with`].
    pub fn starts_with(self, path: &str, base: &str) -> bool {
        match self {
            Self::Posix => Path::new(path).starts_with(base),
            Self::Windows => windows::starts_with(path, base),
        }
    }
}

fn posix_check(path: &str, max_len: usize) -> Result<(), PathError> {
    if !path.starts_with('/') {
        return Err(PathError::NotAbsolute);
    }
    if path.len() > max_len {
        return Err(PathError::TooLong);
    }
    if path.contains('\\') {
        return Err(PathError::ForeignSeparator);
    }
    if path.chars().any(char::is_control) {
        return Err(PathError::ControlCharacter);
    }
    if path[1..]
        .split('/')
        .any(|part| matches!(part, "" | "." | ".."))
    {
        return Err(PathError::NotNormalized);
    }
    Ok(())
}

mod windows {
    use super::{PathError, eq_fold, is_reserved_device_name};

    #[derive(Clone, Copy, Debug, PartialEq, Eq)]
    pub(super) enum Prefix {
        /// No prefix: a relative path, or one rooted on the current drive.
        None,
        /// `C:`
        Drive,
        /// `\\server\share`
        Unc,
        /// `\\?\C:`
        VerbatimDrive,
        /// `\\?\UNC\server\share`
        VerbatimUnc,
        /// `\\?\Volume{...}` and other verbatim names.
        VerbatimOther,
        /// `\\.\COM1`
        Device,
    }

    pub(super) struct Parsed<'a> {
        pub kind: Prefix,
        /// The prefix text, e.g. `C:` or `\\server\share`.
        pub prefix: &'a str,
        /// Everything after the prefix; starts with a separator when rooted.
        pub rest: &'a str,
    }

    pub(super) fn is_separator(c: char) -> bool {
        c == '\\' || c == '/'
    }

    fn drive_letter(s: &str) -> bool {
        let b = s.as_bytes();
        b.len() >= 2 && b[0].is_ascii_alphabetic() && b[1] == b':'
    }

    /// Bytes of `server<sep>share` at the start of `s`, if both are non-empty.
    fn share_len(s: &str, separator: fn(char) -> bool) -> Option<usize> {
        let server = s.find(separator)?;
        if server == 0 {
            return None;
        }
        let tail = &s[server + 1..];
        let share = tail.find(separator).unwrap_or(tail.len());
        (share > 0).then_some(server + 1 + share)
    }

    pub(super) fn parse(s: &str) -> Parsed<'_> {
        let split = |kind, len: usize| Parsed {
            kind,
            prefix: &s[..len],
            rest: &s[len..],
        };
        let backslash = |c: char| c == '\\';
        if let Some(tail) = s.strip_prefix(r"\\?\") {
            // A verbatim path is handed to the file system as written, so `/`
            // is not a separator here.
            if tail.len() >= 4
                && tail.is_char_boundary(4)
                && tail[..4].eq_ignore_ascii_case("UNC\\")
                && let Some(n) = share_len(&tail[4..], backslash)
            {
                return split(Prefix::VerbatimUnc, 4 + 4 + n);
            }
            if drive_letter(tail) {
                return split(Prefix::VerbatimDrive, 4 + 2);
            }
            let first = tail.find('\\').unwrap_or(tail.len());
            return split(Prefix::VerbatimOther, 4 + first);
        }
        if let Some(tail) = s.strip_prefix(r"\\.\") {
            let first = tail.find('\\').unwrap_or(tail.len());
            return split(Prefix::Device, 4 + first);
        }
        let b = s.as_bytes();
        if b.len() >= 2 && is_separator(char::from(b[0])) && is_separator(char::from(b[1])) {
            return match share_len(&s[2..], is_separator) {
                Some(n) => split(Prefix::Unc, 2 + n),
                None => split(Prefix::None, 0),
            };
        }
        if drive_letter(s) {
            return split(Prefix::Drive, 2);
        }
        split(Prefix::None, 0)
    }

    const FORBIDDEN: &[char] = &['<', '>', ':', '"', '|', '?', '*', '/', '\\'];

    fn name_check(name: &str) -> Result<(), PathError> {
        if name.chars().any(char::is_control) {
            return Err(PathError::ControlCharacter);
        }
        if name.contains(FORBIDDEN) {
            return Err(PathError::ForbiddenCharacter);
        }
        Ok(())
    }

    fn component_check(name: &str) -> Result<(), PathError> {
        if matches!(name, "" | "." | "..") {
            return Err(PathError::NotNormalized);
        }
        name_check(name)?;
        if name.ends_with(['.', ' ']) {
            return Err(PathError::TrailingDotOrSpace);
        }
        if is_reserved_device_name(name) {
            return Err(PathError::ReservedName);
        }
        Ok(())
    }

    pub(super) fn check(path: &str, max_len: usize) -> Result<(), PathError> {
        let parsed = parse(path);
        match parsed.kind {
            Prefix::Drive | Prefix::Unc | Prefix::VerbatimDrive | Prefix::VerbatimUnc => {}
            Prefix::VerbatimOther | Prefix::Device => return Err(PathError::UnsupportedPrefix),
            Prefix::None => return Err(PathError::NotAbsolute),
        }
        if path.len() > max_len {
            return Err(PathError::TooLong);
        }
        if path.chars().any(char::is_control) {
            return Err(PathError::ControlCharacter);
        }
        if path.contains('/') {
            return Err(PathError::ForeignSeparator);
        }
        if parsed.kind == Prefix::Unc {
            // The share's server and name are held to the character rules only:
            // host names legitimately end in a dot or contain spaces.
            for part in parsed.prefix[2..].split('\\') {
                name_check(part)?;
            }
        }
        let names = parsed
            .rest
            .strip_prefix('\\')
            .ok_or(PathError::NotAbsolute)?;
        for name in names.split('\\') {
            component_check(name)?;
        }
        Ok(())
    }

    /// The prefix (with a verbatim spelling reduced to its plain one, because
    /// `\\?\C:\a` and `C:\a` are one location), whether the rest is rooted, and
    /// the names.
    fn components(s: &str) -> (Prefix, String, bool, Vec<&str>) {
        let parsed = parse(s);
        let rooted = parsed.rest.starts_with(is_separator);
        let verbatim = matches!(
            parsed.kind,
            Prefix::VerbatimDrive | Prefix::VerbatimUnc | Prefix::VerbatimOther
        );
        let names = parsed
            .rest
            .split(|c| if verbatim { c == '\\' } else { is_separator(c) })
            .filter(|name| !name.is_empty() && (verbatim || *name != "."))
            .collect();
        let (kind, prefix) = match parsed.kind {
            Prefix::VerbatimDrive => (Prefix::Drive, parsed.prefix[4..].to_owned()),
            Prefix::VerbatimUnc => (Prefix::Unc, format!(r"\\{}", &parsed.prefix[8..])),
            kind => (kind, parsed.prefix.to_owned()),
        };
        // A share, a device or a verbatim volume is its own root; only a drive
        // (`C:` against `C:\`) and no prefix at all can be rooted or not.
        let rooted = rooted || !matches!(kind, Prefix::None | Prefix::Drive);
        (kind, prefix, rooted, names)
    }

    pub(super) fn starts_with(path: &str, base: &str) -> bool {
        let (path_kind, path_prefix, path_rooted, path_names) = components(path);
        let (base_kind, base_prefix, base_rooted, base_names) = components(base);
        path_kind == base_kind
            && eq_fold(&path_prefix, &base_prefix)
            && path_rooted == base_rooted
            && base_names.len() <= path_names.len()
            && base_names
                .iter()
                .zip(&path_names)
                .all(|(a, b)| eq_fold(a, b))
    }
}

/// Whether Windows would refuse `name` as a file name because it is a device:
/// `con`, `prn`, `aux`, `nul`, `conin$`, `conout$`, `com1`-`com9` and `lpt1`-`lpt9`
/// (the superscript digits `¹ ² ³` too), in any case, with any extension
/// (`con.json`) and with trailing spaces before the extension.
///
/// The rule applies on every platform on purpose: a name that cannot exist on
/// Windows must not be minted anywhere, because state and packages move between
/// machines.
pub fn is_reserved_device_name(name: &str) -> bool {
    let stem = name
        .split('.')
        .next()
        .unwrap_or("")
        .trim_end_matches(' ')
        .to_ascii_lowercase();
    matches!(
        stem.as_str(),
        "con" | "prn" | "aux" | "nul" | "conin$" | "conout$"
    ) || ["com", "lpt"].iter().any(|prefix| {
        stem.strip_prefix(prefix).is_some_and(|n| {
            matches!(
                n,
                "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "¹" | "²" | "³"
            )
        })
    })
}

/// Whether Windows cannot hold a file called `name`: a device name (see
/// [`is_reserved_device_name`]) or a name ending in a dot or a space, which
/// Windows drops when it creates the file.
pub fn windows_cannot_hold(name: &str) -> bool {
    is_reserved_device_name(name) || name.ends_with(['.', ' '])
}

fn fold_char(c: char) -> impl Iterator<Item = char> {
    c.to_uppercase().flat_map(char::to_lowercase)
}

/// `name` with case folded the way a case-insensitive volume compares names.
/// It approximates NTFS and default APFS (full Unicode case mapping, no
/// normalization), so two names that fold alike may be two files on a
/// case-sensitive volume: use it to avoid collisions, not to prove identity.
pub fn fold(name: &str) -> String {
    name.chars().flat_map(fold_char).collect()
}

/// Whether `a` and `b` are the same name once case is folded.
pub fn eq_fold(a: &str, b: &str) -> bool {
    a.chars()
        .flat_map(fold_char)
        .eq(b.chars().flat_map(fold_char))
}

/// [`Syntax::check_normalized_absolute`] for the host's syntax and a [`Path`].
pub fn check_normalized_absolute(path: &Path, max_len: usize) -> Result<(), PathError> {
    let text = path.to_str().ok_or(PathError::NotUtf8)?;
    Syntax::HOST.check_normalized_absolute(text, max_len)
}

/// Whether `path` lies at or below `base` under the host's rules: exactly
/// [`Path::starts_with`] on Unix, case-insensitive on Windows. A path that is
/// not UTF-8 is compared exactly.
pub fn starts_with(path: &Path, base: &Path) -> bool {
    match (Syntax::HOST, path.to_str(), base.to_str()) {
        (Syntax::Windows, Some(path), Some(base)) => Syntax::Windows.starts_with(path, base),
        _ => path.starts_with(base),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const LIMIT: usize = 4096;

    fn posix(path: &str) -> Result<(), PathError> {
        Syntax::Posix.check_normalized_absolute(path, LIMIT)
    }
    fn windows(path: &str) -> Result<(), PathError> {
        Syntax::Windows.check_normalized_absolute(path, LIMIT)
    }

    /// The check `loader/local.rs` wrote before this crate existed.
    fn previous_posix_rule(s: &str) -> bool {
        !(!s.starts_with('/')
            || s.len() > LIMIT
            || s.contains('\\')
            || s.chars().any(char::is_control)
            || s[1..].split('/').any(|p| matches!(p, "" | "." | "..")))
    }

    #[test]
    fn posix_rule_is_the_one_the_loader_had() {
        let long = format!("/{}", "a".repeat(LIMIT));
        for path in [
            "",
            "/",
            "//",
            "/a",
            "/a/b",
            "/a/",
            "/a//b",
            "/a/./b",
            "/a/../b",
            "/..",
            "a/b",
            "./a",
            "/a\\b",
            "/a\nb",
            "/a\u{7f}b",
            "/a\u{85}b",
            "/a b",
            "/.hidden",
            "/a/..b",
            "/ünï/ñ",
            long.as_str(),
            &long[..LIMIT],
        ] {
            assert_eq!(posix(path).is_ok(), previous_posix_rule(path), "{path:?}");
        }
    }

    #[test]
    fn posix_reasons_are_named() {
        assert_eq!(posix("a"), Err(PathError::NotAbsolute));
        assert_eq!(posix("/a/../b"), Err(PathError::NotNormalized));
        assert_eq!(posix("/"), Err(PathError::NotNormalized));
        assert_eq!(posix("/a\\b"), Err(PathError::ForeignSeparator));
        assert_eq!(posix("/a\u{1}"), Err(PathError::ControlCharacter));
        assert_eq!(
            Syntax::Posix.check_normalized_absolute("/abcd", 4),
            Err(PathError::TooLong)
        );
    }

    #[test]
    fn windows_absolute_forms() {
        for path in [
            r"C:\",
            r"c:/",
            r"C:\dir",
            r"\\server\share",
            r"\\server\share\dir",
            r"//server/share/dir",
            r"\\?\C:\dir",
            r"\\?\UNC\server\share\dir",
            r"\\?\Volume{01234567-89ab-cdef-0123-456789abcdef}\dir",
            r"\\.\COM1",
        ] {
            assert!(Syntax::Windows.is_absolute(path), "{path}");
        }
        for path in [
            "",
            "dir",
            r"dir\file",
            r"C:",
            r"C:dir",
            r"\dir",
            r"\\",
            r"\\server",
            r"\\server\",
            "/dir",
            r"1:\dir",
        ] {
            assert!(!Syntax::Windows.is_absolute(path), "{path}");
        }
    }

    #[test]
    fn posix_absolute_forms() {
        assert!(Syntax::Posix.is_absolute("/"));
        assert!(Syntax::Posix.is_absolute("/a"));
        assert!(!Syntax::Posix.is_absolute(""));
        assert!(!Syntax::Posix.is_absolute("a"));
        assert!(!Syntax::Posix.is_absolute(r"C:\a"));
    }

    #[test]
    fn windows_accepts_normalized_paths() {
        for path in [
            r"C:\dir",
            r"C:\dir\sub\file.txt",
            r"d:\Program Files\app",
            r"\\server\share\dir",
            r"\\?\C:\dir",
            r"\\?\UNC\server\share\dir",
            r"C:\a.b\c",
            r"C:\.hidden",
            r"C:\com0",
            r"C:\com10",
            r"C:\console",
        ] {
            assert_eq!(windows(path), Ok(()), "{path}");
        }
    }

    #[test]
    fn windows_refuses_what_is_not_normalized() {
        let cases = [
            (r"C:\", PathError::NotNormalized),
            (r"C:", PathError::NotAbsolute),
            (r"C:dir", PathError::NotAbsolute),
            (r"\dir", PathError::NotAbsolute),
            ("dir", PathError::NotAbsolute),
            (r"C:\dir\", PathError::NotNormalized),
            (r"C:\a\\b", PathError::NotNormalized),
            (r"C:\a\.\b", PathError::NotNormalized),
            (r"C:\a\..\b", PathError::NotNormalized),
            (r"C:/dir", PathError::ForeignSeparator),
            (r"C:\a/b", PathError::ForeignSeparator),
            (r"C:\a:stream", PathError::ForbiddenCharacter),
            (r"C:\a<b", PathError::ForbiddenCharacter),
            (r"C:\a?b", PathError::ForbiddenCharacter),
            (r"C:\a*b", PathError::ForbiddenCharacter),
            (r"C:\a|b", PathError::ForbiddenCharacter),
            ("C:\\a\"b", PathError::ForbiddenCharacter),
            ("C:\\a\tb", PathError::ControlCharacter),
            (r"C:\a.", PathError::TrailingDotOrSpace),
            (r"C:\a ", PathError::TrailingDotOrSpace),
            (r"C:\con", PathError::ReservedName),
            (r"C:\dir\NUL.txt", PathError::ReservedName),
            (r"C:\dir\Com1", PathError::ReservedName),
            (r"C:\dir\lpt9.log", PathError::ReservedName),
            (r"\\.\COM1", PathError::UnsupportedPrefix),
            (r"\\.\pipe\x", PathError::UnsupportedPrefix),
            (
                r"\\?\Volume{01234567-89ab-cdef-0123-456789abcdef}\dir",
                PathError::UnsupportedPrefix,
            ),
            (r"\\server", PathError::NotAbsolute),
            (r"\\server\share\a\..\b", PathError::NotNormalized),
        ];
        for (path, reason) in cases {
            assert_eq!(windows(path), Err(reason), "{path}");
        }
        assert_eq!(
            Syntax::Windows.check_normalized_absolute(r"C:\abcd", 5),
            Err(PathError::TooLong)
        );
    }

    #[test]
    fn device_names_are_refused_with_or_without_extension() {
        for name in [
            "con",
            "CON",
            "nul",
            "Prn",
            "aux",
            "com1",
            "COM9",
            "lpt3",
            "con.json",
            "nul.txt",
            "con.tar.gz",
            "con ",
            "CONIN$",
            "conout$",
            "com¹",
            "LPT³",
        ] {
            assert!(is_reserved_device_name(name), "{name}");
        }
        for name in [
            "demo", "my-agent", "a.b", "com", "com0", "com10", "lpt", "console", "conx", ".hidden",
            "_x", "x.con", "confile", "com1x", "",
        ] {
            assert!(!is_reserved_device_name(name), "{name}");
        }
    }

    #[test]
    fn windows_cannot_hold_adds_trailing_dots_and_spaces() {
        assert!(windows_cannot_hold("demo."));
        assert!(windows_cannot_hold("demo "));
        assert!(windows_cannot_hold("nul"));
        assert!(!windows_cannot_hold("demo"));
        assert!(!windows_cannot_hold(".hidden"));
    }

    #[test]
    fn case_folding_compares_names_not_bytes() {
        assert!(eq_fold("Readme.MD", "readme.md"));
        assert!(eq_fold("ÄÖÜ", "äöü"));
        assert!(!eq_fold("readme", "readme2"));
        assert_eq!(fold("MiXeD"), "mixed");
    }

    #[test]
    fn windows_prefix_matching_ignores_case_and_separator_kind() {
        let w = Syntax::Windows;
        assert!(w.starts_with(r"C:\Users\Me\work", r"c:\users\me"));
        assert!(w.starts_with(r"C:\Users\Me", r"C:\Users\Me"));
        assert!(w.starts_with(r"C:/Users/Me/work", r"C:\Users"));
        assert!(w.starts_with(r"\\Server\Share\a\b", r"\\server\SHARE\a"));
        assert!(w.starts_with(r"\\?\C:\Users\Me", r"c:\users"));
        assert!(w.starts_with(r"C:\Users\Me", r"\\?\c:\USERS"));
        assert!(w.starts_with(r"\\?\UNC\Server\Share\a", r"\\server\share"));
        assert!(!w.starts_with(r"\\?\D:\Users", r"C:\Users"));
        assert!(!w.starts_with(r"C:\Users\Me", r"C:\Users\Meow"));
        assert!(!w.starts_with(r"C:\Users", r"C:\Users\Me"));
        assert!(!w.starts_with(r"D:\Users\Me", r"C:\Users"));
        assert!(!w.starts_with(r"C:Users", r"C:\Users"));
    }

    #[test]
    fn posix_prefix_matching_is_the_standard_one() {
        let p = Syntax::Posix;
        assert!(p.starts_with("/a/b/c", "/a/b"));
        assert!(p.starts_with("/a/b", "/a/b"));
        assert!(!p.starts_with("/a/bc", "/a/b"));
        assert!(!p.starts_with("/a/B/c", "/a/b"));
    }

    #[test]
    fn host_wrappers_follow_the_host_syntax() {
        let sample = if cfg!(windows) { r"C:\a\b" } else { "/a/b" };
        assert_eq!(check_normalized_absolute(Path::new(sample), LIMIT), Ok(()));
        assert!(check_normalized_absolute(Path::new("rel/a"), LIMIT).is_err());
        assert!(starts_with(Path::new(sample), Path::new(sample)));
    }

    #[cfg(unix)]
    #[test]
    fn a_path_that_is_not_utf8_is_refused() {
        use std::{ffi::OsStr, os::unix::ffi::OsStrExt};
        let path = Path::new(OsStr::from_bytes(b"/a/\xff"));
        assert_eq!(
            check_normalized_absolute(path, LIMIT),
            Err(PathError::NotUtf8)
        );
    }
}
