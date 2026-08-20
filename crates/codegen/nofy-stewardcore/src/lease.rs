//! File lease table (FR12.11): active sessions declare their working set;
//! leased files are steward-READ-ONLY.
//!
//! A session's working set is what it is actively touching: hunks in
//! flight, the cwd tree, opened files. Leases carry TTL + heartbeat; an
//! expired lease is no lease. 「租约命中的管理操作加载期即拒」(AC-12):
//! a management operation that hits a live lease is rejected AT LOAD,
//! before any execution planning.

use std::collections::BTreeMap;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct FileLease {
    pub session: String,
    pub expires: u64,
    pub last_heartbeat: u64,
}

#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct LeaseTable {
    /// path -> lease.
    leases: BTreeMap<String, FileLease>,
}

impl LeaseTable {
    /// A session declares its working set (hunk-in-flight / cwd tree /
    /// opened files).
    pub fn declare(&mut self, session: &str, paths: &[String], now: u64, ttl_secs: u64) {
        for path in paths {
            self.leases.insert(
                path.clone(),
                FileLease {
                    session: session.to_string(),
                    expires: now + ttl_secs,
                    last_heartbeat: now,
                },
            );
        }
    }

    /// Heartbeat: extend all leases of a session.
    pub fn heartbeat(&mut self, session: &str, now: u64, ttl_secs: u64) {
        for lease in self.leases.values_mut() {
            if lease.session == session {
                lease.last_heartbeat = now;
                lease.expires = now + ttl_secs;
            }
        }
    }

    /// Live-lease check: expired leases count as none.
    pub fn lease_holder(&self, path: &str, now: u64) -> Option<&str> {
        self.leases
            .get(path)
            .filter(|lease| now < lease.expires)
            .map(|lease| lease.session.as_str())
    }

    pub fn is_leased(&self, path: &str, now: u64) -> bool {
        self.lease_holder(path, now).is_some()
    }

    /// Steward management gate: leased = read-only, management refused at
    /// load time.
    pub fn steward_may_manage(&self, path: &str, now: u64) -> bool {
        !self.is_leased(path, now)
    }

    /// Sweep expired leases (maintenance).
    pub fn sweep(&mut self, now: u64) -> usize {
        let before = self.leases.len();
        self.leases.retain(|_, lease| now < lease.expires);
        before - self.leases.len()
    }

    pub fn len(&self) -> usize {
        self.leases.len()
    }

    pub fn is_empty(&self) -> bool {
        self.leases.is_empty()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn paths(names: &[&str]) -> Vec<String> {
        names.iter().map(|s| s.to_string()).collect()
    }

    #[test]
    fn leased_file_is_steward_read_only() {
        let mut table = LeaseTable::default();
        table.declare("sess-1", &paths(&["/proj/main.rs"]), 100, 60);
        assert!(table.is_leased("/proj/main.rs", 120));
        assert!(
            !table.steward_may_manage("/proj/main.rs", 120),
            "management op on leased file must be refused (AC-12)"
        );
        // Unleased files stay manageable.
        assert!(table.steward_may_manage("/proj/other.rs", 120));
    }

    #[test]
    fn expired_lease_is_no_lease() {
        let mut table = LeaseTable::default();
        table.declare("sess-1", &paths(&["/f"]), 100, 60);
        assert!(table.is_leased("/f", 159));
        assert!(!table.is_leased("/f", 160), "expiry is exclusive");
        assert!(table.steward_may_manage("/f", 160));
    }

    #[test]
    fn heartbeat_extends() {
        let mut table = LeaseTable::default();
        table.declare("sess-1", &paths(&["/f"]), 100, 60);
        table.heartbeat("sess-1", 150, 60);
        assert!(table.is_leased("/f", 200), "heartbeat pushed expiry to 210");
        // Other sessions' leases are untouched.
        table.declare("sess-2", &paths(&["/g"]), 100, 60);
        table.heartbeat("sess-1", 150, 60);
        assert!(!table.is_leased("/g", 170));
    }

    #[test]
    fn sweep_removes_expired() {
        let mut table = LeaseTable::default();
        table.declare("s1", &paths(&["/a"]), 100, 10);
        table.declare("s2", &paths(&["/b"]), 100, 1000);
        assert!(!table.is_empty());
        assert_eq!(table.sweep(200), 1);
        assert_eq!(table.len(), 1);
        assert!(!table.is_empty());
        // 全部过期后:清空。
        assert_eq!(table.sweep(2000), 1);
        assert!(table.is_empty());
    }

    #[test]
    fn holder_identity_is_visible() {
        let mut table = LeaseTable::default();
        table.declare("sess-9", &paths(&["/f"]), 0, 100);
        assert_eq!(table.lease_holder("/f", 50), Some("sess-9"));
        assert_eq!(table.lease_holder("/other", 50), None);
    }
}
