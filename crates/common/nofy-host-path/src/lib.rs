//! Paths and files as the host sees them.
//!
//! The kernel reasons about locations and files in many places: is this path
//! absolute and spelled one way, does this name exist on every platform, is this
//! still the file I checked, can I open it without being redirected. Each
//! platform answers differently, and this crate is the one place that says how:
//!
//! - **Path syntax** ([`Syntax`], [`check_normalized_absolute`], [`starts_with`]):
//!   `/` roots on Unix; drives, UNC shares and `\\?\` prefixes on Windows. The
//!   rules are functions of the text and a syntax, so the Windows rules are
//!   tested on every platform.
//! - **Names** ([`is_reserved_device_name`], [`windows_cannot_hold`], [`fold`],
//!   [`eq_fold`]): a name Windows cannot hold is refused everywhere, because state
//!   and packages move between machines.
//! - **File identity** ([`FileIdentity`]): device, inode and the two times on
//!   Unix; volume serial number, file index and the two times on Windows.
//! - **Opening without following** ([`open_no_follow`]): `O_NOFOLLOW | O_CLOEXEC`
//!   on Unix; `FILE_FLAG_OPEN_REPARSE_POINT` plus a check of the handle on
//!   Windows.
//!
//! Not here: package paths (always POSIX relative, whatever the host) and JSON
//! Pointers (which start with `/` as protocol syntax). Neither is a host path.
#[cfg(not(any(unix, windows)))]
compile_error!("nofy-host-path supports Unix and Windows");

mod identity;
mod open;
mod syntax;
#[cfg(windows)]
mod windows;

pub use identity::{FileIdentity, FileKind, Timestamp};
pub use open::{open_no_follow, open_no_follow_nonblocking};
pub use syntax::{
    PathError, Syntax, check_normalized_absolute, eq_fold, fold, is_reserved_device_name,
    starts_with, windows_cannot_hold,
};
