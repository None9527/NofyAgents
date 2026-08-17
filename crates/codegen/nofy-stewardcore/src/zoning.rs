//! Three-zone sovereignty (FR12.12): project sovereign / steward
//! sovereign / overlap takes stricter.
//!
//! Files live in one of three zones relative to the two ownership maps:
//!
//! - **ProjectSovereign**: inside project roots only — the project's rules
//!   govern; the steward is a guest;
//! - **StewardSovereign**: inside steward roots only — the steward manages
//!   under its own policy;
//! - **Overlap**: inside BOTH — the STRICTER of the two policies governs
//!   (「重叠取更严」, AC-12).

use crate::roots::{PathClass, RootTable};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Zone {
    ProjectSovereign,
    StewardSovereign,
    Overlap,
    /// In neither map: no governance claims the path.
    Unclaimed,
}

/// Effective policy strictness (higher = stricter).
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum Strictness {
    Permissive,
    Managed,
    LockedDown,
}

/// Classify a path against the two ownership maps.
pub fn zone_for(path: &str, project_roots: &RootTable, steward_roots: &RootTable) -> Zone {
    let in_project = matches!(project_roots.classify(path), PathClass::Inside { .. });
    let in_steward = matches!(steward_roots.classify(path), PathClass::Inside { .. });
    match (in_project, in_steward) {
        (true, true) => Zone::Overlap,
        (true, false) => Zone::ProjectSovereign,
        (false, true) => Zone::StewardSovereign,
        (false, false) => Zone::Unclaimed,
    }
}

/// Effective strictness: overlap takes the stricter of the two.
pub fn effective_strictness(zone: Zone, project: Strictness, steward: Strictness) -> Strictness {
    match zone {
        Zone::ProjectSovereign => project,
        Zone::StewardSovereign => steward,
        Zone::Overlap => project.max(steward),
        Zone::Unclaimed => Strictness::LockedDown, // unclaimed = no one's land = strictest
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::roots::RootTier;

    fn project() -> RootTable {
        let mut roots = RootTable::new();
        roots.add_root("/proj", RootTier::Manage);
        roots
    }

    fn steward() -> RootTable {
        let mut roots = RootTable::new();
        roots.add_root("/proj/archive", RootTier::Manage);
        roots.add_root("/media", RootTier::IndexOnly);
        roots
    }

    #[test]
    fn zones_partition_correctly() {
        let (p, s) = (project(), steward());
        assert_eq!(zone_for("/proj/src/main.rs", &p, &s), Zone::ProjectSovereign);
        assert_eq!(zone_for("/proj/archive/old.log", &p, &s), Zone::Overlap);
        assert_eq!(zone_for("/media/photo.jpg", &p, &s), Zone::StewardSovereign);
        assert_eq!(zone_for("/etc/passwd", &p, &s), Zone::Unclaimed);
    }

    #[test]
    fn overlap_takes_stricter() {
        let strict = effective_strictness(
            Zone::Overlap,
            Strictness::Permissive,
            Strictness::LockedDown,
        );
        assert_eq!(strict, Strictness::LockedDown);
        let strict2 = effective_strictness(
            Zone::Overlap,
            Strictness::Managed,
            Strictness::Permissive,
        );
        assert_eq!(strict2, Strictness::Managed);
    }

    #[test]
    fn sovereign_zones_use_own_policy() {
        assert_eq!(
            effective_strictness(Zone::ProjectSovereign, Strictness::Permissive, Strictness::LockedDown),
            Strictness::Permissive
        );
        assert_eq!(
            effective_strictness(Zone::StewardSovereign, Strictness::LockedDown, Strictness::Managed),
            Strictness::Managed
        );
    }

    #[test]
    fn unclaimed_is_strictest() {
        assert_eq!(
            effective_strictness(Zone::Unclaimed, Strictness::Permissive, Strictness::Permissive),
            Strictness::LockedDown
        );
    }
}
