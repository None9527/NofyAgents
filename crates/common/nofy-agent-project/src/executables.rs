//! Which source files are executable is content, not host metadata.
//!
//! `File::executable` is part of the source digest, so two machines that collect
//! the same directory must agree on it. A host file mode cannot promise that:
//! Unix has an executable bit, Windows has none, and the same checkout would
//! digest differently on each. So a source can **declare** its executable files
//! in `source-executables.json`, a JSON array of package-relative paths that is
//! an ordinary package file (it must be listed in `source-files.json`, and it is
//! hashed like any other file). Once a source has the declaration, collecting it
//! never looks at host file modes, on any platform.
//!
//! A source without the declaration keeps the rule it always had, so a package
//! already published still digests the same: on Unix a file is executable when
//! any execute bit of its mode is set, and where the host has no such bit
//! nothing is executable. That inferred answer is an observation about one host,
//! not a fact about the source; [`Source::executable_origin`] names which of the
//! two a collected source carries, so a caller can say so instead of guessing.

use crate::*;
use cap_std::fs::Dir;
use serde_json::json;
use std::collections::{BTreeMap, BTreeSet};

/// The package file that declares the executable files of a source.
pub const EXECUTABLE_DECLARATION: &str = "source-executables.json";

/// The one place that knows whether this host has an executable bit.
#[cfg(unix)]
mod host {
    use std::os::unix::fs::PermissionsExt;
    pub const RECORDS: bool = true;
    pub fn observed(metadata: &std::fs::Metadata) -> bool {
        metadata.permissions().mode() & 0o111 != 0
    }
    pub fn set(file: &std::fs::File, executable: bool) -> std::io::Result<()> {
        let mode = if executable { 0o755 } else { 0o644 };
        file.set_permissions(std::fs::Permissions::from_mode(mode))
    }
}
#[cfg(not(unix))]
mod host {
    pub const RECORDS: bool = false;
    pub fn observed(_: &std::fs::Metadata) -> bool {
        false
    }
    /// There is no executable bit to set. A flag that matters is kept by
    /// `source-executables.json`, and `write_directory` refuses a source that has
    /// the flag without it (`ensure_recordable`), so nothing is dropped silently.
    pub fn set(_: &std::fs::File, _: bool) -> std::io::Result<()> {
        Ok(())
    }
}

/// Whether this host keeps an executable bit on files, so that it can read one
/// from a directory and write one back. Unix does; Windows does not. This is the
/// probe: where it is `false`, an undeclared source is collected with nothing
/// executable and an undeclared executable file is refused on write rather than
/// written without its bit.
pub const fn host_records_executable_bit() -> bool {
    host::RECORDS
}

/// How the executable flags of a source collected from a directory were decided.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum ExecutableOrigin {
    /// `source-executables.json` decided; the host's file modes were not read.
    Declared,
    /// Nothing was declared, so this Unix host's file modes decided.
    HostMode,
    /// Nothing was declared and this host has no executable bit to read, so no
    /// file is executable.
    Unavailable,
}
impl ExecutableOrigin {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Declared => "declared",
            Self::HostMode => "host_mode",
            Self::Unavailable => "unavailable",
        }
    }
}

/// The host's own answer for one file already opened: the legacy inference, kept
/// for sources that declare nothing. It is an observation, never a declaration.
pub fn observed_executable(metadata: &std::fs::Metadata) -> bool {
    host::observed(metadata)
}

/// Write the file's mode from its flag where the host has one (`0755`/`0644`).
pub(crate) fn record_executable(file: &std::fs::File, executable: bool) -> Result<()> {
    Ok(host::set(file, executable)?)
}

fn flagged(files: &BTreeMap<String, File>) -> BTreeSet<String> {
    files
        .iter()
        .filter(|(_, file)| file.executable)
        .map(|(path, _)| path.clone())
        .collect()
}

fn declared(files: &BTreeMap<String, File>) -> Result<Option<BTreeSet<String>>> {
    let Some(file) = files.get(EXECUTABLE_DECLARATION) else {
        return Ok(None);
    };
    let listed: Vec<String> = serde_json::from_str(&file.utf8()?).map_err(|_| {
        Error::new(
            "local_input",
            format!("{EXECUTABLE_DECLARATION} must be a JSON array of file paths"),
        )
    })?;
    let mut paths = BTreeSet::new();
    for path in listed {
        safe_path(&path)?;
        if path == EXECUTABLE_DECLARATION {
            return Err(Error::new(
                "local_input",
                format!("{EXECUTABLE_DECLARATION} cannot declare itself executable"),
            ));
        }
        if !files.contains_key(&path) {
            return Err(Error::new(
                "local_input",
                format!("{EXECUTABLE_DECLARATION} names a file the source does not list: {path}"),
            ));
        }
        if !paths.insert(path.clone()) {
            return Err(Error::new(
                "local_input",
                format!("{EXECUTABLE_DECLARATION} names {path} twice"),
            ));
        }
    }
    Ok(Some(paths))
}

/// Collection step: when the files carry a declaration, it replaces whatever the
/// host reported for every file. Without one the host's observation stands.
pub(crate) fn apply_declaration(files: &mut BTreeMap<String, File>) -> Result<()> {
    if let Some(paths) = declared(files)? {
        for (path, file) in files.iter_mut() {
            file.executable = paths.contains(path);
        }
    }
    Ok(())
}

/// A source that carries the declaration must agree with it: the flags are what
/// the digest hashes and the declaration is what a directory is read back by, so
/// a disagreement would make the same source digest differently after a round
/// trip through a directory.
pub(crate) fn check_declaration(files: &BTreeMap<String, File>) -> Result<()> {
    let Some(paths) = declared(files)? else {
        return Ok(());
    };
    let flags = flagged(files);
    if flags != paths {
        let differing: Vec<_> = flags.symmetric_difference(&paths).cloned().collect();
        return Err(Error::new(
            "local_input",
            format!(
                "{EXECUTABLE_DECLARATION} disagrees with the executable flags of: {}",
                differing.join(", ")
            ),
        ));
    }
    Ok(())
}

/// A directory the declaration sits in but the manifest does not list would be
/// ignored by the allowlist, and the host's modes would then decide silently.
pub(crate) fn reject_unlisted_declaration(dir: &Dir) -> Result<()> {
    match dir.symlink_metadata(EXECUTABLE_DECLARATION) {
        Ok(_) => Err(Error::new(
            "local_input",
            format!("{EXECUTABLE_DECLARATION} exists but the source manifest does not list it"),
        )),
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(()),
        Err(e) => Err(e.into()),
    }
}

/// Writing a directory on a host with no executable bit would silently drop the
/// flag. Only a declaration in the directory can carry it there, so without one
/// the write is refused instead.
pub(crate) fn ensure_recordable(source: &Source) -> Result<()> {
    if host_records_executable_bit() || source.files.contains_key(EXECUTABLE_DECLARATION) {
        return Ok(());
    }
    let flags: Vec<_> = flagged(&source.files).into_iter().collect();
    if flags.is_empty() {
        return Ok(());
    }
    Err(Error::new(
        "local_input",
        format!(
            "this host has no executable bit, so a directory written here would lose it for: {}; declare them in {EXECUTABLE_DECLARATION} (and list that file in source-files.json) so the directory keeps them",
            flags.join(", ")
        ),
    ))
}

impl Source {
    /// The paths of the files marked executable, in order.
    pub fn executable_files(&self) -> Vec<String> {
        flagged(&self.files).into_iter().collect()
    }

    /// How a source that was just collected from a directory on this host got its
    /// executable flags. Only meaningful for a source fresh from collection: a
    /// source that arrived as data has flags that no host decided.
    pub fn executable_origin(&self) -> ExecutableOrigin {
        if self.files.contains_key(EXECUTABLE_DECLARATION) {
            ExecutableOrigin::Declared
        } else if host_records_executable_bit() {
            ExecutableOrigin::HostMode
        } else {
            ExecutableOrigin::Unavailable
        }
    }

    /// Make exactly `paths` the executable files: set the flags, and write the
    /// declaration (and list it in the manifest) so a directory or another
    /// platform reads the same answer back. Replaces any earlier declaration and
    /// never consults a host file mode.
    pub fn declare_executables<S: AsRef<str>>(&mut self, paths: &[S]) -> Result<()> {
        let mut chosen = BTreeSet::new();
        for path in paths {
            let path = path.as_ref();
            safe_path(path)?;
            if path == EXECUTABLE_DECLARATION {
                return Err(Error::new(
                    "local_input",
                    format!("{EXECUTABLE_DECLARATION} cannot declare itself executable"),
                ));
            }
            if !self.files.contains_key(path) {
                return Err(Error::new(
                    "local_input",
                    format!("cannot declare a file the source does not hold executable: {path}"),
                ));
            }
            chosen.insert(path.to_owned());
        }
        for (path, file) in self.files.iter_mut() {
            file.executable = chosen.contains(path);
        }
        self.put_json(EXECUTABLE_DECLARATION, &json!(chosen))?;
        self.refresh_manifest()?;
        if self.files.contains_key("module-files.json") {
            let names: Vec<_> = self.files.keys().cloned().collect();
            self.put_json("module-files.json", &json!(names))?;
        }
        Ok(())
    }

    /// Keep an existing declaration equal to the flags after the files changed.
    /// A source with no declaration is left exactly as it is.
    pub(crate) fn sync_executable_declaration(&mut self) -> Result<()> {
        if !self.files.contains_key(EXECUTABLE_DECLARATION) {
            return Ok(());
        }
        let mut flags = flagged(&self.files);
        flags.remove(EXECUTABLE_DECLARATION);
        self.put_json(EXECUTABLE_DECLARATION, &json!(flags))
    }
}
