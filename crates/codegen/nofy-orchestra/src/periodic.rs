//! Periodic orchestration = scheduler × pack (FR11.7, OC-F9).
//!
//! A cron schedule can be BOUND to an orchestration manifest: when the
//! schedule fires, a run starts. The one iron rule: NO PILING UP — if the
//! previous run is still active, the fire is skipped (and audited), never
//! queued. A slow run must never accumulate a backlog of runs.

/// A binding between a schedule and a manifest.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PeriodicBinding {
    pub schedule_id: String,
    pub manifest_ref: String,
}

/// What a fire produced.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum PeriodicOutcome {
    /// A new run started.
    Started { run_id: String },
    /// Previous run still active: skipped, never queued (no pile-up).
    SkippedPreviousActive { schedule_id: String },
    /// The binding's manifest is gone: refuse to start.
    NoManifest { schedule_id: String },
}

/// The periodic bridge state.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct PeriodicBridge {
    bindings: Vec<PeriodicBinding>,
    /// schedule_id -> active run id (at most one per schedule).
    active_runs: std::collections::BTreeMap<String, String>,
    /// Audit: skips because the previous run was still active.
    pub skipped_pileups: u64,
    next_run: u64,
}

impl PeriodicBridge {
    pub fn bind(&mut self, schedule_id: &str, manifest_ref: &str) {
        self.bindings.push(PeriodicBinding {
            schedule_id: schedule_id.to_string(),
            manifest_ref: manifest_ref.to_string(),
        });
    }

    /// A schedule fired. Returns the outcome; starts a run only when the
    /// schedule is idle and its manifest exists.
    pub fn on_fire(
        &mut self,
        schedule_id: &str,
        manifest_exists: bool,
    ) -> Option<PeriodicOutcome> {
        let binding = self
            .bindings
            .iter()
            .find(|b| b.schedule_id == schedule_id)?;
        if self.active_runs.contains_key(schedule_id) {
            self.skipped_pileups += 1;
            return Some(PeriodicOutcome::SkippedPreviousActive {
                schedule_id: schedule_id.to_string(),
            });
        }
        if !manifest_exists {
            return Some(PeriodicOutcome::NoManifest {
                schedule_id: schedule_id.to_string(),
            });
        }
        let run_id = format!("{}-{}", binding.manifest_ref, self.next_run);
        self.next_run += 1;
        self.active_runs
            .insert(schedule_id.to_string(), run_id.clone());
        Some(PeriodicOutcome::Started { run_id })
    }

    /// A run settled: the schedule becomes fireable again.
    pub fn run_settled(&mut self, schedule_id: &str) {
        self.active_runs.remove(schedule_id);
    }

    pub fn active_run(&self, schedule_id: &str) -> Option<&str> {
        self.active_runs.get(schedule_id).map(String::as_str)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn bridge() -> PeriodicBridge {
        let mut bridge = PeriodicBridge::default();
        bridge.bind("nightly", "proj/nightly.toml");
        bridge
    }

    #[test]
    fn fire_starts_a_run() {
        let mut bridge = bridge();
        match bridge.on_fire("nightly", true) {
            Some(PeriodicOutcome::Started { run_id }) => {
                assert!(run_id.starts_with("proj/nightly.toml-"));
            }
            other => panic!("expected Started, got {other:?}"),
        }
        assert!(bridge.active_run("nightly").is_some());
    }

    #[test]
    fn no_pile_up_while_previous_active() {
        let mut bridge = bridge();
        bridge.on_fire("nightly", true);
        // Second fire while the first run is active: skipped, never queued.
        assert_eq!(
            bridge.on_fire("nightly", true),
            Some(PeriodicOutcome::SkippedPreviousActive { schedule_id: "nightly".into() })
        );
        assert_eq!(bridge.skipped_pileups, 1);
        // Settle, then the next fire starts again.
        bridge.run_settled("nightly");
        assert!(matches!(
            bridge.on_fire("nightly", true),
            Some(PeriodicOutcome::Started { .. })
        ));
    }

    #[test]
    fn missing_manifest_refuses() {
        let mut bridge = bridge();
        assert_eq!(
            bridge.on_fire("nightly", false),
            Some(PeriodicOutcome::NoManifest { schedule_id: "nightly".into() })
        );
        assert!(bridge.active_run("nightly").is_none());
    }

    #[test]
    fn unknown_schedule_is_ignored() {
        let mut bridge = bridge();
        assert_eq!(bridge.on_fire("ghost", true), None);
    }

    #[test]
    fn schedules_are_independent() {
        let mut bridge = bridge();
        bridge.bind("hourly", "proj/hourly.toml");
        bridge.on_fire("nightly", true);
        // nightly active does not block hourly.
        assert!(matches!(
            bridge.on_fire("hourly", true),
            Some(PeriodicOutcome::Started { .. })
        ));
    }
}
