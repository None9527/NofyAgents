//! Hot reload without daemon restart (FR14.4, DS standing mount + HM-F4).
//!
//! Reloadable artifacts (packs/skills/hooks/scripts) swap by GENERATION:
//! the new set is validated first, then swapped in atomically — an invalid
//! new set keeps the old one (fail-safe, never a half-swapped daemon).
//! CORE updates are different: they ride the supervisor exit-code contract
//! (the exit code IS the restart policy), never an in-place swap.

/// Versions of the reloadable artifact families.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ArtifactVersions {
    pub packs: u64,
    pub skills: u64,
    pub hooks: u64,
    pub scripts: u64,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ReloadableState {
    pub generation: u64,
    pub versions: ArtifactVersions,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ReloadOutcome {
    /// Swapped atomically; generation advanced.
    Swapped { new_generation: u64 },
    /// New set invalid: the old state stands.
    Rejected { reason: String },
}

/// Validate + swap. Validation rule: every version must advance or stay
/// (never regress — a regressing version is a stale/corrupt manifest).
pub fn reload(current: &ReloadableState, new_versions: ArtifactVersions) -> ReloadOutcome {
    let pairs = [
        ("packs", current.versions.packs, new_versions.packs),
        ("skills", current.versions.skills, new_versions.skills),
        ("hooks", current.versions.hooks, new_versions.hooks),
        ("scripts", current.versions.scripts, new_versions.scripts),
    ];
    for (name, old, new) in pairs {
        if new < old {
            return ReloadOutcome::Rejected {
                reason: format!("{name} version regressed: {old} → {new}"),
            };
        }
    }
    ReloadOutcome::Swapped {
        new_generation: current.generation + 1,
    }
}

/// Apply a successful reload.
pub fn apply_reload(state: &mut ReloadableState, new_versions: ArtifactVersions) {
    state.generation += 1;
    state.versions = new_versions;
}

/// Core update path: the daemon exits with a contract code; the supervisor
/// restarts it into the new core. (Codes mirror `nofy_daemon::exit_codes`.)
pub const EXIT_RESTART_INTO_UPDATE: u32 = 7;

/// Decide the exit code for a core update.
pub fn core_update_exit_code(update_pending: bool) -> Option<u32> {
    update_pending.then_some(EXIT_RESTART_INTO_UPDATE)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn state() -> ReloadableState {
        ReloadableState {
            generation: 5,
            versions: ArtifactVersions {
                packs: 2,
                skills: 3,
                hooks: 1,
                scripts: 4,
            },
        }
    }

    #[test]
    fn valid_reload_swaps_without_restart() {
        let current = state();
        let new = ArtifactVersions {
            packs: 3,
            skills: 3,
            hooks: 1,
            scripts: 5,
        };
        assert_eq!(
            reload(&current, new.clone()),
            ReloadOutcome::Swapped { new_generation: 6 }
        );
        let mut applied = current;
        apply_reload(&mut applied, new);
        assert_eq!(applied.generation, 6);
        assert_eq!(applied.versions.packs, 3);
    }

    #[test]
    fn regressing_version_rejected_old_stands() {
        let current = state();
        let stale = ArtifactVersions {
            packs: 1,
            skills: 3,
            hooks: 1,
            scripts: 4,
        };
        assert!(matches!(
            reload(&current, stale),
            ReloadOutcome::Rejected { reason } if reason.contains("packs")
        ));
    }

    #[test]
    fn unchanged_versions_still_swap_generation() {
        // A re-mount of identical versions is a legitimate reload (e.g.
        // hot-reloading file contents at the same version).
        let current = state();
        assert_eq!(
            reload(&current, current.versions.clone()),
            ReloadOutcome::Swapped { new_generation: 6 }
        );
    }

    #[test]
    fn core_update_rides_exit_code_not_swap() {
        assert_eq!(core_update_exit_code(true), Some(EXIT_RESTART_INTO_UPDATE));
        assert_eq!(core_update_exit_code(false), None);
    }
}
