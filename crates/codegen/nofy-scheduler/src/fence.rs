//! Jobs↔session fence (FR3.7 / DS-#5).
//!
//! Scheduled deliveries must not land in a session that is actively
//! working — the fence HOLDS them instead. A controller gate releases
//! held deliveries explicitly (per session, FIFO). Every successful
//! delivery is recorded on TWO channels: the direct channel (what the
//! consumer saw) and the ledger (the audit/recovery copy), so a lost
//! direct delivery is always reconstructable from the ledger.

/// One scheduled delivery.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Delivery {
    pub job_id: u64,
    pub session: String,
}

/// What happened to a submitted delivery.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SubmitOutcome {
    Delivered,
    Held,
}

#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct SessionFence {
    /// Sessions currently working.
    active: std::collections::BTreeSet<String>,
    /// Held deliveries, FIFO.
    held: Vec<Delivery>,
    /// Channel 1: what was handed to consumers, in order.
    direct: Vec<Delivery>,
    /// Channel 2: audit/recovery copy — a superset record of channel 1.
    ledger: Vec<Delivery>,
}

impl SessionFence {
    pub fn session_active(&mut self, session: impl Into<String>) {
        self.active.insert(session.into());
    }

    /// Session stopped working. Does NOT auto-release: the controller
    /// gate decides when held deliveries may flow (DS-#5).
    pub fn session_idle(&mut self, session: &str) {
        self.active.remove(session);
    }

    pub fn is_active(&self, session: &str) -> bool {
        self.active.contains(session)
    }

    /// Submit a delivery: fenced sessions hold it, others get it on both
    /// channels.
    pub fn submit(&mut self, delivery: Delivery) -> SubmitOutcome {
        if self.active.contains(&delivery.session) {
            self.held.push(delivery);
            SubmitOutcome::Held
        } else {
            self.record(delivery);
            SubmitOutcome::Delivered
        }
    }

    /// Controller gate: release held deliveries for one session, FIFO.
    /// Released deliveries go out on both channels.
    pub fn release(&mut self, session: &str) -> Vec<Delivery> {
        let (drained, kept): (Vec<_>, Vec<_>) = std::mem::take(&mut self.held)
            .into_iter()
            .partition(|d| d.session == session);
        self.held = kept;
        for delivery in &drained {
            self.record(delivery.clone());
        }
        drained
    }

    fn record(&mut self, delivery: Delivery) {
        self.direct.push(delivery.clone());
        self.ledger.push(delivery);
    }

    pub fn held_count(&self) -> usize {
        self.held.len()
    }

    pub fn direct(&self) -> &[Delivery] {
        &self.direct
    }

    pub fn ledger(&self) -> &[Delivery] {
        &self.ledger
    }

    /// Dual-channel invariant: the ledger must contain every direct
    /// delivery in the same order (recovery is possible).
    pub fn reconcile(&self) -> bool {
        self.ledger.len() >= self.direct.len()
            && self
                .direct
                .iter()
                .zip(self.ledger.iter())
                .all(|(a, b)| a == b)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn delivery(job: u64, session: &str) -> Delivery {
        Delivery {
            job_id: job,
            session: session.into(),
        }
    }

    #[test]
    fn is_active_tracks_the_session_set() {
        let mut fence = SessionFence::default();
        assert!(!fence.is_active("s"), "fresh fence holds nothing active");
        fence.session_active("s");
        assert!(fence.is_active("s"));
        fence.session_idle("s");
        assert!(!fence.is_active("s"), "idle clears the active mark");
    }

    #[test]
    fn active_session_holds_idle_session_delivers() {
        let mut fence = SessionFence::default();
        fence.session_active("busy");

        assert_eq!(fence.submit(delivery(1, "busy")), SubmitOutcome::Held);
        assert_eq!(fence.submit(delivery(2, "free")), SubmitOutcome::Delivered);
        assert_eq!(fence.held_count(), 1);
        assert_eq!(fence.direct(), &[delivery(2, "free")]);
    }

    #[test]
    fn idle_alone_does_not_release_controller_gate_does() {
        let mut fence = SessionFence::default();
        fence.session_active("s");
        fence.submit(delivery(1, "s"));
        fence.session_idle("s");
        assert_eq!(fence.held_count(), 1, "idle is not a release");

        let drained = fence.release("s");
        assert_eq!(drained, vec![delivery(1, "s")]);
        assert_eq!(fence.held_count(), 0);
    }

    #[test]
    fn release_is_fifo_and_session_scoped() {
        let mut fence = SessionFence::default();
        fence.session_active("a");
        fence.session_active("b");
        fence.submit(delivery(1, "a"));
        fence.submit(delivery(2, "b"));
        fence.submit(delivery(3, "a"));

        let drained = fence.release("a");
        assert_eq!(
            drained,
            vec![delivery(1, "a"), delivery(3, "a")],
            "FIFO, only session a"
        );
        assert_eq!(fence.held_count(), 1, "session b still held");
    }

    #[test]
    fn dual_channel_records_every_delivery() {
        let mut fence = SessionFence::default();
        fence.session_active("s");
        fence.submit(delivery(1, "s")); // held
        fence.submit(delivery(2, "t")); // direct
        fence.release("s"); // drains 1

        assert_eq!(fence.direct().len(), 2);
        assert!(fence.reconcile(), "ledger must mirror direct");
        assert_eq!(
            fence.ledger(),
            &[delivery(2, "t"), delivery(1, "s")],
            "ledger order = delivery order"
        );
    }
}
