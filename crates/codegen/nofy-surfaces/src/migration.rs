//! Surface migration (FR13.1): surfaces become control-plane CLIENTS.
//!
//! Before migration, each surface ran its own agent in-process — N
//! surfaces, N truths. After migration, every surface holds a REFERENCE
//! to a control-plane session: one truth, many projections. The
//! migration state machine tracks each surface's transition and enforces
//! the consistency invariant: all migrated surfaces pointing at the same
//! session reference see the SAME state version.

/// Surface kinds (the four+ surfaces of the product).
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum SurfaceKind {
    Tui,
    Web,
    Headless,
    Webhook,
    Im,
}

/// A migrated surface: it holds a session reference, not session state.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SurfaceClient {
    pub surface_id: String,
    pub kind: SurfaceKind,
    /// The control-plane session this surface projects.
    pub session_ref: String,
    /// The state version this surface last observed.
    pub observed_version: u64,
}

/// Migration state per surface.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum MigrationState {
    /// Still running in-process (legacy).
    Legacy,
    /// Migrating (dual-running during cutover).
    Migrating,
    /// Fully migrated: control-plane client.
    Migrated,
}

/// The migration table.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct MigrationTable {
    states: std::collections::BTreeMap<String, MigrationState>,
}

impl MigrationTable {
    pub fn state_of(&self, surface_id: &str) -> MigrationState {
        self.states.get(surface_id).copied().unwrap_or(MigrationState::Legacy)
    }

    /// Advance a surface one step: Legacy → Migrating → Migrated.
    pub fn advance(&mut self, surface_id: &str) -> MigrationState {
        let next = match self.state_of(surface_id) {
            MigrationState::Legacy => MigrationState::Migrating,
            MigrationState::Migrating => MigrationState::Migrated,
            MigrationState::Migrated => MigrationState::Migrated,
        };
        self.states.insert(surface_id.to_string(), next);
        next
    }

    pub fn migrated_count(&self) -> usize {
        self.states
            .values()
            .filter(|s| **s == MigrationState::Migrated)
            .count()
    }
}

/// Consistency invariant: every migrated surface projecting the same
/// session must observe the same version (one truth).
pub fn truth_consistent(clients: &[SurfaceClient]) -> bool {
    let mut by_session: std::collections::BTreeMap<&str, u64> = std::collections::BTreeMap::new();
    for client in clients {
        match by_session.get(client.session_ref.as_str()) {
            Some(&version) if version != client.observed_version => return false,
            Some(_) => {}
            None => {
                by_session.insert(&client.session_ref, client.observed_version);
            }
        }
    }
    true
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn surfaces_migrate_in_two_steps() {
        let mut table = MigrationTable::default();
        assert_eq!(table.state_of("tui"), MigrationState::Legacy);
        assert_eq!(table.advance("tui"), MigrationState::Migrating);
        assert_eq!(table.advance("tui"), MigrationState::Migrated);
        assert_eq!(table.advance("tui"), MigrationState::Migrated, "idempotent at the end");
        assert_eq!(table.migrated_count(), 1);
    }

    #[test]
    fn migrated_surfaces_hold_references_not_state() {
        let client = SurfaceClient {
            surface_id: "web-1".into(),
            kind: SurfaceKind::Web,
            session_ref: "sess-42".into(),
            observed_version: 7,
        };
        // The client carries a reference + an observed version — no
        // session state fields exist on the type (shape invariant).
        assert_eq!(client.session_ref, "sess-42");
    }

    #[test]
    fn one_truth_across_surfaces() {
        let consistent = vec![
            SurfaceClient { surface_id: "tui".into(), kind: SurfaceKind::Tui, session_ref: "s1".into(), observed_version: 5 },
            SurfaceClient { surface_id: "web".into(), kind: SurfaceKind::Web, session_ref: "s1".into(), observed_version: 5 },
            SurfaceClient { surface_id: "im".into(), kind: SurfaceKind::Im, session_ref: "s2".into(), observed_version: 9 },
        ];
        assert!(truth_consistent(&consistent));
        let split = vec![
            SurfaceClient { surface_id: "tui".into(), kind: SurfaceKind::Tui, session_ref: "s1".into(), observed_version: 5 },
            SurfaceClient { surface_id: "web".into(), kind: SurfaceKind::Web, session_ref: "s1".into(), observed_version: 6 },
        ];
        assert!(!truth_consistent(&split), "two surfaces, one session, two versions = broken truth");
    }

    #[test]
    fn different_sessions_may_differ() {
        let clients = vec![
            SurfaceClient { surface_id: "a".into(), kind: SurfaceKind::Tui, session_ref: "s1".into(), observed_version: 1 },
            SurfaceClient { surface_id: "b".into(), kind: SurfaceKind::Web, session_ref: "s2".into(), observed_version: 2 },
        ];
        assert!(truth_consistent(&clients));
    }
}
