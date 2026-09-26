//! Host-request routing + worker discipline (FR6.8/6.9, MAP/DS,
//! DS-#13).
//!
//! Two halves:
//!
//! - **Routing (FR6.8)**: a workflow HOST request never executes inside
//!   the current session — it routes OUT. Construction-level: the
//!   router has no in-session lane for host-originated requests;
//! - **Workers (FR6.9)**: worker threads start with a SCRUBBED env
//!   (allowlist only), die through TERM → grace → KILL, and every start
//!   is paired with an exit in the pair ledger (unpaired starts are
//!   visible).

use std::collections::BTreeMap;

/// Where a request came from.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RequestOrigin {
    /// The user's current session.
    InSession,
    /// A workflow host (external orchestrator).
    WorkflowHost,
}

/// Where a request must run.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RouteLane {
    CurrentSession,
    /// Outside the current session, in a dedicated worker.
    OutOfSessionWorker,
}

/// Route one request. Host requests NEVER stay in the session.
pub fn route(origin: RequestOrigin) -> RouteLane {
    match origin {
        RequestOrigin::InSession => RouteLane::CurrentSession,
        RequestOrigin::WorkflowHost => RouteLane::OutOfSessionWorker,
    }
}

/// A worker's env scrubber: only allowlisted keys pass.
pub fn scrub_env(full: &BTreeMap<String, String>, allowlist: &[&str]) -> BTreeMap<String, String> {
    full.iter()
        .filter(|(key, _)| allowlist.iter().any(|allowed| *allowed == key.as_str()))
        .map(|(k, v)| (k.clone(), v.clone()))
        .collect()
}

/// Worker kill ladder.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum KillStage {
    /// Graceful termination requested.
    TermSent,
    /// Grace expired: force kill.
    ForceKilled,
}

/// Decide the kill stage for a worker that has not exited.
pub fn kill_stage(elapsed_ms: u64, grace_ms: u64) -> KillStage {
    if elapsed_ms < grace_ms {
        KillStage::TermSent
    } else {
        KillStage::ForceKilled
    }
}

/// The pair ledger: every worker start must pair with an exit.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct PairLedger {
    /// worker id -> exited?
    pairs: BTreeMap<String, bool>,
}

impl PairLedger {
    pub fn record_start(&mut self, worker_id: &str) {
        self.pairs.insert(worker_id.to_string(), false);
    }

    pub fn record_exit(&mut self, worker_id: &str) -> bool {
        match self.pairs.get_mut(worker_id) {
            Some(slot) if !*slot => {
                *slot = true;
                true
            }
            _ => false,
        }
    }

    /// Workers that started but never exited (deterministic order).
    pub fn unpaired(&self) -> Vec<String> {
        self.pairs
            .iter()
            .filter(|(_, exited)| !**exited)
            .map(|(id, _)| id.clone())
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn host_requests_always_route_out_of_the_session() {
        assert_eq!(
            route(RequestOrigin::WorkflowHost),
            RouteLane::OutOfSessionWorker
        );
        assert_eq!(route(RequestOrigin::InSession), RouteLane::CurrentSession);
    }

    #[test]
    fn env_scrub_is_allowlist_only() {
        let mut full = BTreeMap::new();
        full.insert("PATH".into(), "/bin".into());
        full.insert("SECRET_TOKEN".into(), "hunter2".into());
        full.insert("HOME".into(), "/home/u".into());
        let scrubbed = scrub_env(&full, &["PATH", "HOME"]);
        assert_eq!(scrubbed.len(), 2);
        assert!(
            !scrubbed.contains_key("SECRET_TOKEN"),
            "non-allowlisted vars never reach workers"
        );
    }

    #[test]
    fn kill_ladder_respects_grace() {
        assert_eq!(kill_stage(500, 1000), KillStage::TermSent);
        assert_eq!(
            kill_stage(1000, 1000),
            KillStage::ForceKilled,
            "grace expiry is inclusive"
        );
        assert_eq!(kill_stage(5000, 1000), KillStage::ForceKilled);
    }

    #[test]
    fn pair_ledger_exposes_unpaired_starts() {
        let mut ledger = PairLedger::default();
        ledger.record_start("w1");
        ledger.record_start("w2");
        assert!(ledger.record_exit("w1"));
        assert_eq!(ledger.unpaired(), vec!["w2".to_string()]);
        assert!(!ledger.record_exit("w1"), "double exit is refused");
        assert!(!ledger.record_exit("ghost"), "unknown workers cannot exit");
    }
}
