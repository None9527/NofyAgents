//! Roots: empty-by-default opt-in, two tiers, outside-root escalation
//! (FR12.1).
//!
//! 「未选根=零索引零外呼」(AC-12): an empty root table indexes nothing.
//! Each opted-in root gets one of two tiers:
//!
//! - `IndexOnly` — the steward may read/index, but can NEVER produce a
//!   write operation from this root;
//! - `Manage` — the steward may propose management batches (still subject
//!   to approval, leases, zones, and the trust ramp).
//!
//! Paths outside every root are escalated — the steward does not touch
//! them at all.

/// Root tier: what the steward may do inside the root.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RootTier {
    IndexOnly,
    Manage,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RootConfig {
    pub path: String,
    pub tier: RootTier,
}

/// Where a path falls relative to the root table.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum PathClass {
    Inside { root: String, tier: RootTier },
    Outside,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum StewardError {
    /// No root covers the path: escalate, do not touch.
    OutsideRoot { path: String },
    /// The covering root is index-only: writes are structurally impossible.
    IndexOnlyRoot { root: String },
}

#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct RootTable {
    roots: Vec<RootConfig>,
}

impl RootTable {
    /// Empty by default: opt-in only.
    pub fn new() -> Self {
        Self::default()
    }

    pub fn add_root(&mut self, path: &str, tier: RootTier) {
        self.roots.push(RootConfig {
            path: path.to_string(),
            tier,
        });
    }

    pub fn is_empty(&self) -> bool {
        self.roots.is_empty()
    }

    /// Longest-prefix classification (deepest root wins).
    pub fn classify(&self, path: &str) -> PathClass {
        let mut best: Option<&RootConfig> = None;
        for root in &self.roots {
            if path.starts_with(&root.path)
                && best.is_none_or(|b| root.path.len() > b.path.len())
            {
                best = Some(root);
            }
        }
        match best {
            Some(root) => PathClass::Inside {
                root: root.path.clone(),
                tier: root.tier,
            },
            None => PathClass::Outside,
        }
    }

    /// Gate for WRITE operations: index-only roots can never produce one,
    /// outside paths escalate.
    pub fn validate_write(&self, path: &str) -> Result<(), StewardError> {
        match self.classify(path) {
            PathClass::Inside { tier: RootTier::Manage, .. } => Ok(()),
            PathClass::Inside { root, tier: RootTier::IndexOnly } => {
                Err(StewardError::IndexOnlyRoot { root })
            }
            PathClass::Outside => Err(StewardError::OutsideRoot {
                path: path.to_string(),
            }),
        }
    }

    /// Reads/indexing are allowed inside any root, nowhere else.
    pub fn validate_read(&self, path: &str) -> Result<(), StewardError> {
        match self.classify(path) {
            PathClass::Inside { .. } => Ok(()),
            PathClass::Outside => Err(StewardError::OutsideRoot {
                path: path.to_string(),
            }),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn empty_table_indexes_nothing() {
        let table = RootTable::new();
        assert!(table.is_empty());
        assert_eq!(table.classify("/any/path"), PathClass::Outside);
        assert!(matches!(
            table.validate_read("/any/path"),
            Err(StewardError::OutsideRoot { .. })
        ));
    }

    #[test]
    fn index_only_root_cannot_produce_writes() {
        let mut table = RootTable::new();
        table.add_root("/docs", RootTier::IndexOnly);
        // Reads fine.
        assert!(table.validate_read("/docs/a.md").is_ok());
        // Writes structurally impossible.
        assert_eq!(
            table.validate_write("/docs/a.md"),
            Err(StewardError::IndexOnlyRoot { root: "/docs".into() })
        );
    }

    #[test]
    fn manage_root_allows_writes_inside_only() {
        let mut table = RootTable::new();
        table.add_root("/proj", RootTier::Manage);
        assert!(table.validate_write("/proj/file").is_ok());
        assert_eq!(
            table.validate_write("/elsewhere/file"),
            Err(StewardError::OutsideRoot { path: "/elsewhere/file".into() })
        );
    }

    #[test]
    fn deepest_root_wins() {
        let mut table = RootTable::new();
        table.add_root("/data", RootTier::Manage);
        table.add_root("/data/archive", RootTier::IndexOnly);
        assert_eq!(
            table.classify("/data/archive/old.log"),
            PathClass::Inside { root: "/data/archive".into(), tier: RootTier::IndexOnly }
        );
        assert_eq!(
            table.classify("/data/live/x"),
            PathClass::Inside { root: "/data".into(), tier: RootTier::Manage }
        );
    }

    #[test]
    fn outside_root_escalates() {
        let mut table = RootTable::new();
        table.add_root("/safe", RootTier::Manage);
        assert!(matches!(
            table.validate_write("/unsafe/x"),
            Err(StewardError::OutsideRoot { .. })
        ));
    }
}
