//! HOME delivery (FR3.5, HM-F10 half): run results land as files under
//! the user's Nofy home, one file per run, so a user (or another tool)
//! can inspect outcomes without any daemon protocol. Filenames are built
//! from sanitized ids, so delivery cannot escape the directory.

use std::fs;
use std::io;
use std::path::{Path, PathBuf};

use crate::runfiles::safe_stem;

/// The delivery root under a Nofy home.
pub fn delivery_dir(home: &Path) -> PathBuf {
    home.join(".nofy").join("scheduler").join("deliveries")
}

/// Deliver one run result. Returns the written path. Atomic-shaped:
/// temp file + rename, so readers never observe a half-written result.
pub fn deliver(home: &Path, id: &str, run_id: u64, payload: &str) -> io::Result<PathBuf> {
    let dir = delivery_dir(home);
    fs::create_dir_all(&dir)?;
    let final_path = dir.join(format!("{}-{run_id}.json", safe_stem(id)));
    let tmp = final_path.with_extension("tmp");
    fs::write(&tmp, payload)?;
    fs::rename(&tmp, &final_path)?;
    Ok(final_path)
}

/// List delivered results for one schedule, run ids ascending.
pub fn list(home: &Path, id: &str) -> io::Result<Vec<u64>> {
    let dir = delivery_dir(home);
    let prefix = format!("{}-", safe_stem(id));
    let mut runs = Vec::new();
    match fs::read_dir(&dir) {
        Ok(entries) => {
            for entry in entries {
                let name = entry?.file_name().to_string_lossy().into_owned();
                if let Some(rest) = name.strip_prefix(&prefix) {
                    if let Some(run_str) = rest.strip_suffix(".json") {
                        if let Ok(run_id) = run_str.parse::<u64>() {
                            runs.push(run_id);
                        }
                    }
                }
            }
        }
        Err(err) if err.kind() == io::ErrorKind::NotFound => return Ok(Vec::new()),
        Err(err) => return Err(err),
    }
    runs.sort_unstable();
    Ok(runs)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn delivery_lands_under_home_and_lists_ascending() {
        let home = tempfile::tempdir().unwrap();
        let path = deliver(home.path(), "nightly", 3, "{\"ok\":true}").unwrap();
        assert!(path.starts_with(delivery_dir(home.path())));
        assert_eq!(fs::read_to_string(&path).unwrap(), "{\"ok\":true}");

        deliver(home.path(), "nightly", 1, "{}").unwrap();
        deliver(home.path(), "other", 9, "{}").unwrap();
        assert_eq!(list(home.path(), "nightly").unwrap(), vec![1, 3]);
        assert_eq!(list(home.path(), "other").unwrap(), vec![9]);
        assert_eq!(list(home.path(), "unknown").unwrap(), Vec::<u64>::new());
    }

    #[test]
    fn delivery_ids_are_sanitized() {
        let home = tempfile::tempdir().unwrap();
        let path = deliver(home.path(), "../evil", 1, "{}").unwrap();
        assert!(path.starts_with(delivery_dir(home.path())), "must not escape");
        assert_eq!(path.file_name().unwrap().to_string_lossy(), "___evil-1.json");
    }

    #[test]
    fn list_skips_unparseable_names_and_surfaces_errors() {
        // A matching prefix with a non-numeric run part is skipped, not
        // fatal; a non-.json name under the prefix is skipped too.
        let home = tempfile::tempdir().unwrap();
        deliver(home.path(), "nightly", 2, "{}").unwrap();
        let dir = delivery_dir(home.path());
        fs::write(dir.join("nightly-notanumber.json"), "{}").unwrap();
        fs::write(dir.join("nightly-5.tmp"), "{}").unwrap();
        assert_eq!(list(home.path(), "nightly").unwrap(), vec![2]);

        // A missing delivery dir is an empty result (NotFound is not an error).
        let fresh = tempfile::tempdir().unwrap();
        assert_eq!(list(fresh.path(), "nightly").unwrap(), Vec::<u64>::new());

        // Read errors other than NotFound propagate.
        use std::os::unix::fs::PermissionsExt;
        let locked = tempfile::tempdir().unwrap();
        deliver(locked.path(), "nightly", 1, "{}").unwrap();
        let dir = delivery_dir(locked.path());
        fs::set_permissions(&dir, PermissionsExt::from_mode(0o000)).unwrap();
        assert!(list(locked.path(), "nightly").is_err());
        fs::set_permissions(&dir, PermissionsExt::from_mode(0o755)).unwrap();
    }
}
