//! Out-of-ground handoff (FR12.13, OC-F17).
//!
//! When a steward management op targets a LEASED path, the steward does
//! NOT execute it: the op is handed off to the holding session via
//! steering, and execution rides THAT session's sandbox / approval /
//! hunk path. On project ground without a lease the steward degrades to
//! an advisor (suggestion only). Construction-level: there is no route
//! variant that executes inside another session's lease — the bypass
//! lane does not exist.

use crate::lease::LeaseTable;
use crate::zoning::Zone;

/// Routing verdict for one steward management op.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Route {
    /// Steward-sovereign ground, unleased: the steward executes under its
    /// own gates (intent validation, trash-only, batch approval).
    StewardExecutes,
    /// Leased by an active session: hand off via steering; the TARGET
    /// session's sandbox/approval/hunk path executes.
    Handoff { to_session: String },
    /// Project ground (or overlap) without a lease: the steward is only
    /// an advisor here — it suggests, the project session decides.
    SuggestOnly,
    /// Unclaimed ground: nobody owns it, the steward does not touch it.
    Refused,
}

/// Route one management op. Lease beats zone: a live lease always wins
/// the handoff regardless of which zone the path sits in.
pub fn route(path: &str, leases: &LeaseTable, zone: Zone, now: u64) -> Route {
    if let Some(holder) = leases.lease_holder(path, now) {
        return Route::Handoff { to_session: holder.to_string() };
    }
    match zone {
        Zone::StewardSovereign => Route::StewardExecutes,
        Zone::ProjectSovereign | Zone::Overlap => Route::SuggestOnly,
        Zone::Unclaimed => Route::Refused,
    }
}

/// The handoff envelope: everything the target session needs, and
/// nothing that would let the steward execute on its behalf.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct HandoffEnvelope {
    pub to_session: String,
    pub path: String,
    pub op_summary: String,
}

/// Build the envelope for a route. Only [`Route::Handoff`] produces one:
/// every other route keeps the steward OUT of the target's execution
/// path (suggest-only emits a suggestion; refused emits nothing).
pub fn envelope(route: &Route, path: &str, op_summary: &str) -> Option<HandoffEnvelope> {
    match route {
        Route::Handoff { to_session } => Some(HandoffEnvelope {
            to_session: to_session.clone(),
            path: path.to_string(),
            op_summary: op_summary.to_string(),
        }),
        _ => None,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn leased_table() -> LeaseTable {
        let mut t = LeaseTable::default();
        t.declare("sess-proj", &["/proj/src/main.rs".to_string()], 100, 300);
        t
    }

    #[test]
    fn leased_path_hands_off_to_the_holder() {
        let r = route("/proj/src/main.rs", &leased_table(), Zone::ProjectSovereign, 150);
        assert_eq!(r, Route::Handoff { to_session: "sess-proj".into() });
        let env = envelope(&r, "/proj/src/main.rs", "rename fn").expect("handoff carries an envelope");
        assert_eq!(env.to_session, "sess-proj");
        assert_eq!(env.op_summary, "rename fn");
    }

    #[test]
    fn lease_beats_zone_even_in_steward_ground() {
        let mut t = LeaseTable::default();
        t.declare("sess-x", &["/media/f".to_string()], 100, 300);
        let r = route("/media/f", &t, Zone::StewardSovereign, 150);
        assert_eq!(
            r,
            Route::Handoff { to_session: "sess-x".into() },
            "a live lease always wins the handoff"
        );
    }

    #[test]
    fn expired_lease_falls_back_to_zone() {
        let r = route("/proj/src/main.rs", &leased_table(), Zone::ProjectSovereign, 500);
        assert_eq!(r, Route::SuggestOnly, "lease expired → zone rules again");
    }

    #[test]
    fn project_ground_degrades_steward_to_advisor() {
        let empty = LeaseTable::default();
        assert_eq!(route("/proj/a", &empty, Zone::ProjectSovereign, 0), Route::SuggestOnly);
        assert_eq!(route("/proj/a", &empty, Zone::Overlap, 0), Route::SuggestOnly);
    }

    #[test]
    fn steward_ground_executes_unclaimed_refuses() {
        let empty = LeaseTable::default();
        assert_eq!(route("/media/a", &empty, Zone::StewardSovereign, 0), Route::StewardExecutes);
        assert_eq!(route("/nowhere", &empty, Zone::Unclaimed, 0), Route::Refused);
    }

    #[test]
    fn no_envelope_without_handoff() {
        let empty = LeaseTable::default();
        for zone in [Zone::StewardSovereign, Zone::ProjectSovereign, Zone::Unclaimed] {
            let r = route("/p", &empty, zone, 0);
            assert!(
                envelope(&r, "/p", "op").is_none(),
                "only a handoff carries an envelope ({zone:?})"
            );
        }
    }
}
