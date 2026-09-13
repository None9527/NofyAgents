//! Filesystem path tables for sandbox profiles.
//!
//! Collects device files, temp directories, and essential writable paths.

use std::path::{Path, PathBuf};

// ── Nofy state directory ────────────────────────────────────────────────────

/// Nofy state directory — always writable (`$NOFY_HOME` or `~/.nofy`).
pub(crate) fn nofy_home() -> PathBuf {
    nofy_config::nofy_home()
}

// ── Device files & directories ──────────────────────────────────────────────

/// Device files that need write access for normal tool operation.
///
/// Without write access to these, common programs (git, curl, ssh, compilers)
/// break because they can't open `/dev/null` as an output sink, allocate PTYs,
/// or seed RNGs.
///
/// These are individual files (use `allow_file`, not `allow_path`).
/// Directory nodes under `/dev` belong in [`DEVICE_DIRS`].
#[cfg(all(feature = "enforce", unix))]
pub(crate) const DEVICE_FILES: &[&str] = &[
    "/dev/null",    // output sink — used by virtually every CLI tool
    "/dev/zero",    // zero source — used by memory allocators
    "/dev/random",  // entropy — used by crypto/TLS
    "/dev/urandom", // entropy — used by crypto/TLS
    "/dev/tty",     // controlling terminal — used by git, ssh, gpg
    "/dev/ptmx",    // PTY allocation — used by terminal spawning
];

/// Device directories that need write access (use `allow_path`, not `allow_file`).
#[cfg(all(feature = "enforce", unix))]
pub(crate) const DEVICE_DIRS: &[&str] = &[
    "/dev/pts", // PTY slaves (Linux)
    "/dev/fd",  // fd table (symlink to /proc/self/fd on Linux; a directory)
];

// ── Temporary directories ───────────────────────────────────────────────────

/// Temporary directories that need write access.
///
/// On Linux, `/tmp` is the standard temp directory.
/// On macOS, programs use both `/tmp` (symlink to `/private/tmp`) and
/// `/private/var/folders/` (the real `TMPDIR` / `NSTemporaryDirectory()`).
/// git, compilers, and other tools write temp files to `$TMPDIR` which
/// resolves to `/private/var/folders/xx/.../T/` on macOS.
pub(crate) fn temp_writable_paths() -> Vec<PathBuf> {
    let mut paths = vec![PathBuf::from("/tmp"), PathBuf::from("/var/tmp")];

    // macOS: /tmp → /private/tmp, but the real TMPDIR is under /private/var/folders.
    // Also include /private/tmp since Seatbelt may resolve the symlink.
    if cfg!(target_os = "macos") {
        for p in ["/private/tmp", "/private/var/tmp", "/private/var/folders"] {
            let pb = PathBuf::from(p);
            if pb.exists() && pb.is_dir() {
                paths.push(pb);
            }
        }
    }

    // Respect $TMPDIR if it points somewhere else (e.g. custom Linux setups).
    if let Ok(tmpdir) = std::env::var("TMPDIR") {
        let pb = PathBuf::from(&tmpdir);
        if pb.exists() && pb.is_dir() && !paths.contains(&pb) {
            paths.push(pb);
        }
    }

    paths
}

// ── Essential writable paths ────────────────────────────────────────────────

/// Writable directory paths for profiles that allow workspace writes (workspace, devbox).
/// Device files are handled separately via `allow_file` in `to_capability_set_with_config`.
pub(crate) fn essential_writable_paths(workspace: &Path) -> Vec<PathBuf> {
    let mut paths = vec![workspace.to_path_buf(), nofy_home()];
    paths.extend(temp_writable_paths());
    paths
}

/// Writable directory paths for the strict profile (workspace, sessions, temp).
///
/// Strict may *read* all of `nofy_home()` — AuthManager, config, hooks and
/// skills all live there — but must not *write* the parent. Landlock cannot
/// carve a child out of a write grant, so `nofy_home()` itself stays off
/// `read_write` and only `sessions/` is granted; that is where the session and
/// events JSONL live, which is all a strict run needs to persist.
///
/// Everything else under `nofy_home()` (logs, memory, tasks, worktrees, MCP
/// cache, slash MRU, …) therefore fails to write under strict. That is the
/// point of the profile: those are best-effort surfaces, and a sandbox that
/// could rewrite `config.toml`, credentials or hooks could escalate its own
/// permissions on the next run.
pub(crate) fn essential_writable_paths_strict(workspace: &Path) -> Vec<PathBuf> {
    let mut paths = vec![workspace.to_path_buf(), nofy_home().join("sessions")];
    paths.extend(temp_writable_paths());
    paths
}

/// Writable directory paths for the read-only profile (minimal: just ~/.nofy + temp).
/// Device files are handled separately via `allow_file` in `to_capability_set_with_config`.
pub(crate) fn essential_writable_paths_minimal() -> Vec<PathBuf> {
    let mut paths = vec![nofy_home()];
    paths.extend(temp_writable_paths());
    paths
}
