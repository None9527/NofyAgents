//! Compare-and-swap config writes (FR5.12, OC-F33).
//!
//! Two writers must never clobber each other silently: every write carries
//! the version it expects; a stale writer gets `Stale` with the current
//! version (the retry path), never a lost update. The on-disk format
//! stamps the version on the first line, and recovery tolerates a torn
//! tail (the version line is the truth anchor).

use std::fs;
use std::io;
use std::path::PathBuf;

#[derive(Debug, PartialEq, Eq)]
pub enum CasError {
    /// Expected version did not match: someone else wrote first.
    Stale {
        current_version: u64,
    },
    Io(String),
}

/// In-memory CAS cell.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CasCell {
    pub version: u64,
    pub value: String,
}

impl CasCell {
    pub fn new(value: impl Into<String>) -> Self {
        Self {
            version: 1,
            value: value.into(),
        }
    }

    /// Compare-and-swap: succeeds only when `expected` matches.
    pub fn write(&mut self, expected: u64, new_value: impl Into<String>) -> Result<u64, CasError> {
        if expected != self.version {
            return Err(CasError::Stale {
                current_version: self.version,
            });
        }
        self.version += 1;
        self.value = new_value.into();
        Ok(self.version)
    }
}

/// On-disk CAS store: `v{version}\n{value}`.
pub struct CasStore {
    path: PathBuf,
}

impl CasStore {
    pub fn open(path: impl Into<PathBuf>) -> Self {
        Self { path: path.into() }
    }

    pub fn read(&self) -> io::Result<Option<CasCell>> {
        match fs::read_to_string(&self.path) {
            Ok(text) => Ok(Self::parse(&text)),
            Err(err) if err.kind() == io::ErrorKind::NotFound => Ok(None),
            Err(err) => Err(err),
        }
    }

    /// Parse with torn-tail tolerance: a missing/corrupt version line
    /// means "no trustworthy state".
    fn parse(text: &str) -> Option<CasCell> {
        let mut lines = text.lines();
        let version_line = lines.next()?;
        let version = version_line.strip_prefix('v')?.parse::<u64>().ok()?;
        let value = lines.collect::<Vec<_>>().join("\n");
        Some(CasCell { version, value })
    }

    /// CAS write to disk: read-check-write with the same semantics as
    /// [`CasCell::write`]. (Atomic rename keeps the file whole.)
    pub fn write(&self, expected: u64, new_value: &str) -> Result<u64, CasError> {
        let current = self.read().map_err(|e| CasError::Io(e.to_string()))?;
        let current_version = current.as_ref().map(|c| c.version).unwrap_or(0);
        if expected != current_version {
            return Err(CasError::Stale { current_version });
        }
        let next = current_version + 1;
        let tmp = self.path.with_extension("tmp");
        fs::write(&tmp, format!("v{next}\n{new_value}"))
            .map_err(|e| CasError::Io(e.to_string()))?;
        fs::rename(&tmp, &self.path).map_err(|e| CasError::Io(e.to_string()))?;
        Ok(next)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn concurrent_writers_one_wins() {
        let mut cell = CasCell::new("original");
        // Two writers read version 1...
        let writer_a = cell.write(1, "A");
        // ...writer B is now stale.
        let writer_b = cell.write(1, "B");
        assert_eq!(writer_a, Ok(2));
        assert_eq!(writer_b, Err(CasError::Stale { current_version: 2 }));
        assert_eq!(cell.value, "A", "exactly one winner");
        // B retries on the fresh version and succeeds.
        assert_eq!(cell.write(2, "B"), Ok(3));
        assert_eq!(cell.value, "B");
    }

    #[test]
    fn disk_store_cas_roundtrip() {
        let dir = tempfile::tempdir().unwrap();
        let store = CasStore::open(dir.path().join("config"));
        // Empty store starts at version 0.
        assert_eq!(store.read().unwrap(), None);
        assert_eq!(store.write(0, "first"), Ok(1));
        assert_eq!(
            store.read().unwrap(),
            Some(CasCell {
                version: 1,
                value: "first".into()
            })
        );
        // Stale write refused.
        assert_eq!(store.write(1, "second"), Ok(2));
        assert_eq!(
            store.write(1, "conflict"),
            Err(CasError::Stale { current_version: 2 })
        );
        assert_eq!(store.read().unwrap().unwrap().value, "second");
    }

    #[test]
    fn torn_tail_is_untrustworthy_not_a_crash() {
        let dir = tempfile::tempdir().unwrap();
        let store = CasStore::open(dir.path().join("config"));
        store.write(0, "data").unwrap();
        // Corrupt the version anchor.
        fs::write(dir.path().join("config"), "vXXX\ndata").unwrap();
        assert_eq!(
            store.read().unwrap(),
            None,
            "corrupt anchor = no trustworthy state"
        );
        // Recovery: the next writer starts fresh from version 0.
        assert_eq!(store.write(0, "recovered"), Ok(1));
    }

    #[test]
    fn multiline_values_survive() {
        let dir = tempfile::tempdir().unwrap();
        let store = CasStore::open(dir.path().join("config"));
        store.write(0, "line1\nline2").unwrap();
        assert_eq!(store.read().unwrap().unwrap().value, "line1\nline2");
    }

    #[test]
    fn io_errors_surface_not_swallowed() {
        let dir = tempfile::tempdir().unwrap();
        // 路径指向目录:read_to_string 报非 NotFound 的 IO 错误,必须原样上浮。
        let store = CasStore::open(dir.path());
        assert!(store.read().is_err());
        // 同路径下 write:read 失败 → CasError::Io,不得静默。
        assert!(matches!(store.write(0, "x"), Err(CasError::Io(_))));
    }

    #[test]
    fn write_stage_io_errors_surface_not_swallowed() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("config");
        // tmp 路径是目录:fs::write(tmp) 失败 → CasError::Io。
        std::fs::create_dir(dir.path().join("config.tmp")).unwrap();
        let store = CasStore::open(&path);
        assert!(matches!(store.write(0, "x"), Err(CasError::Io(_))));
    }

    #[test]
    fn write_rename_io_error_surfaces() {
        use std::os::unix::fs::PermissionsExt;
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("config");
        let tmp = dir.path().join("config.tmp");
        // tmp 已存在且可写,但目录不可写:fs::write 成功,rename 报 EACCES。
        std::fs::write(&tmp, "stale").unwrap();
        std::fs::set_permissions(dir.path(), std::fs::Permissions::from_mode(0o555)).unwrap();
        let store = CasStore::open(&path);
        assert!(matches!(store.write(0, "x"), Err(CasError::Io(_))));
        // 恢复权限,让 tempdir 可以清理。
        std::fs::set_permissions(dir.path(), std::fs::Permissions::from_mode(0o755)).unwrap();
    }
}
