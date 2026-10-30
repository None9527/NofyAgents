//! Compatibility path for the shared canonical Goal state.
//! The original session keeps owning the same tracker and orchestration.
pub use nofy_goal::*;

#[cfg(test)]
mod tests {
    use super::*;
    fn make_tracker() -> GoalTracker {
        GoalTracker::new(std::path::PathBuf::from("/tmp/test-goal-session"))
    }
    fn activate_tracker(t: &mut GoalTracker) {
        t.create_goal(
            "goal-1".into(),
            "Build a widget".into(),
            Some(100_000),
            0,
            "2026-01-01T00:00:00Z".into(),
            None,
        );
    }
    #[test]
    fn lifecycle_transitions_record_history_events() {
        // Created/paused/resumed/completed each append a history entry that
        // reaches `GoalUpdated.last_event`.
        use crate::session::goal_orchestrator::build_goal_updated;

        let mut t = make_tracker();
        activate_tracker(&mut t);
        assert!(
            matches!(
                t.snapshot().unwrap().history.last().map(|e| &e.event),
                Some(GoalEvent::GoalCreated)
            ),
            "create_goal must record GoalCreated"
        );

        assert!(t.pause(GoalPauseReason::User));
        {
            let last = t.snapshot().unwrap().history.last().unwrap();
            assert!(matches!(last.event, GoalEvent::GoalPaused));
            assert_eq!(
                last.detail.as_deref(),
                Some("user"),
                "pause records its cause as the history detail"
            );
        }

        assert!(t.resume());
        assert!(matches!(
            t.snapshot().unwrap().history.last().map(|e| &e.event),
            Some(GoalEvent::GoalResumed)
        ));

        assert!(t.complete());
        let o = t.snapshot().unwrap();
        assert!(matches!(
            o.history.last().map(|e| &e.event),
            Some(GoalEvent::GoalCompleted)
        ));
        // The latest event must surface on the wire as `last_event`.
        match build_goal_updated(o, 0, 0) {
            crate::extensions::notification::SessionUpdate::GoalUpdated { last_event, .. } => {
                assert_eq!(last_event.as_deref(), Some("goal_completed"));
            }
            other => panic!("expected GoalUpdated, got {other:?}"),
        }
    }

    #[test]
    fn premature_stop_event_maps_to_wire_string() {
        // PrematureStopDetected serializes to its wire label and carries the
        // pattern via `last_event_detail`.
        use crate::session::goal_orchestrator::build_goal_updated;

        let mut t = make_tracker();
        activate_tracker(&mut t);
        t.append_history(GoalHistoryEntry {
            timestamp: "t".into(),
            event: GoalEvent::PrematureStopDetected,
            detail: Some("giving_up".into()),
            round: None,
            tokens_used: None,
            unmet: Vec::new(),
        });
        match build_goal_updated(t.snapshot().unwrap(), 0, 0) {
            crate::extensions::notification::SessionUpdate::GoalUpdated {
                last_event,
                last_event_detail,
                ..
            } => {
                assert_eq!(last_event.as_deref(), Some("premature_stop_detected"));
                assert_eq!(last_event_detail.as_deref(), Some("giving_up"));
            }
            other => panic!("expected GoalUpdated, got {other:?}"),
        }
    }
}
