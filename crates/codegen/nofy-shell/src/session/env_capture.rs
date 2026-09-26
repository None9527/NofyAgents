//! Session env capture (FR6.2, batch W): the merged session env is
//! STAGED and PUBLISHED through the core snapshot (readers never observe
//! a half-built map), then persisted atomically (tmp+sync+rename).
//!
//! The core dump is injection-safe by refusal: a value carrying a newline
//! or control byte forges extra `KEY=VALUE` lines, so dumping REFUSES it.
//! Capture then degrades loud (no persisted snapshot), never silences the
//! refusal, and never blocks the session — the live env travels in memory,
//! not through the dump.

use nofy_runtimecore::envsnapshot::{EnvSnapshot, StagedSnapshot, dump};
use std::collections::HashMap;
use std::path::Path;

/// The snapshot file under the nofy home (bootcheck's subject, FR1.16).
pub const SNAPSHOT_FILE_NAME: &str = "env_snapshot";

/// Stage+publish the merged session env through the core snapshot: the
/// whole map lands at once.
pub fn capture(env: &HashMap<String, String>) -> EnvSnapshot {
    let mut staged = StagedSnapshot::default();
    for (key, value) in env {
        staged.set(key, value);
    }
    staged.publish()
}

/// Persist a snapshot atomically (tmp + sync + rename). A dump refusal
/// (injection vector) surfaces as `InvalidData`, never a silent escape.
pub fn persist(snapshot: &EnvSnapshot, path: &Path) -> std::io::Result<()> {
    let text = dump(snapshot).map_err(|e| {
        std::io::Error::new(
            std::io::ErrorKind::InvalidData,
            format!("env dump refused: {e:?}"),
        )
    })?;
    let tmp = path.with_extension("tmp");
    std::fs::write(&tmp, text.as_bytes())?;
    if let Ok(file) = std::fs::File::open(&tmp) {
        let _ = file.sync_all();
    }
    std::fs::rename(&tmp, path)?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use nofy_runtimecore::envsnapshot::parse_dump;

    #[test]
    fn capture_publishes_the_whole_map_at_once() {
        let mut env = HashMap::new();
        env.insert("PATH".into(), "/bin".into());
        env.insert("NOFY_TEST".into(), "1".into());
        let snap = capture(&env);
        assert_eq!(snap.vars.len(), 2);
        assert_eq!(snap.vars["PATH"], "/bin");
    }

    #[test]
    fn persist_is_atomic_and_roundtrips() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join(SNAPSHOT_FILE_NAME);
        let mut env = HashMap::new();
        env.insert("A".into(), "1".into());
        env.insert("B_2".into(), "two words".into());
        persist(&capture(&env), &path).unwrap();
        assert!(
            !dir.path().join("env_snapshot.tmp").exists(),
            "no tmp residue after rename"
        );
        let parsed = parse_dump(&std::fs::read_to_string(&path).unwrap()).unwrap();
        assert_eq!(
            parsed,
            capture(&env),
            "disk copy reparses to the same snapshot"
        );
    }

    #[test]
    fn unsafe_values_refuse_persistence_loudly() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join(SNAPSHOT_FILE_NAME);
        let mut env = HashMap::new();
        env.insert("EVIL".into(), "line1\nFAKE_KEY=injected".into());
        let err = persist(&capture(&env), &path).unwrap_err();
        assert_eq!(err.kind(), std::io::ErrorKind::InvalidData);
        assert!(!path.exists(), "a refused dump never reaches disk");
    }
}
