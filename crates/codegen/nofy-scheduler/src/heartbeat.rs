//! Heartbeat self-check projection + scratch notepad (FR3.9 / OC-F10).
//!
//! The scheduler emits beats; the projection folds them into a health
//! view — last seq/time, and MISSED beats detected when the gap between
//! consecutive beats exceeds the expected interval by a safety factor.
//! The scratch notepad is a tiny key-value store carried in the same
//! event log: maintenance notes that survive restarts without any
//! separate state file.

use std::collections::BTreeMap;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum HeartbeatEvent {
    /// One heartbeat: strictly increasing seq, wall time `at`.
    Beat { seq: u64, at: u64 },
    /// Scratch note set (last write wins).
    NoteSet { key: String, value: String },
    /// Scratch note removed.
    NoteClear { key: String },
}

/// Derived health + notes view.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct HeartbeatProjection {
    pub beats: u64,
    pub last_seq: Option<u64>,
    pub last_at: Option<u64>,
    /// Beats whose gap over the previous beat exceeded
    /// `interval * factor`.
    pub missed: u64,
    /// The largest observed gap (observability).
    pub largest_gap: u64,
    /// Out-of-order or duplicate seqs ignored (defensive).
    pub ignored: u64,
    /// Scratch notepad.
    pub notes: BTreeMap<String, String>,
}

impl Default for HeartbeatProjection {
    fn default() -> Self {
        Self {
            beats: 0,
            last_seq: None,
            last_at: None,
            missed: 0,
            largest_gap: 0,
            ignored: 0,
            notes: BTreeMap::new(),
        }
    }
}

/// Apply one event. `interval`/`factor` define the miss threshold:
/// gap > interval * factor ⇒ missed beat.
pub fn apply_heartbeat(
    projection: &mut HeartbeatProjection,
    event: &HeartbeatEvent,
    interval: u64,
    factor: u64,
) {
    match event {
        HeartbeatEvent::Beat { seq, at } => {
            // Defensive: only strictly-increasing seqs count.
            if projection.last_seq.is_some_and(|last| *seq <= last) {
                projection.ignored += 1;
                return;
            }
            if let Some(last_at) = projection.last_at {
                let gap = at.saturating_sub(last_at);
                projection.largest_gap = projection.largest_gap.max(gap);
                if gap > interval.saturating_mul(factor) {
                    projection.missed += 1;
                }
            }
            projection.beats += 1;
            projection.last_seq = Some(*seq);
            projection.last_at = Some(*at);
        }
        HeartbeatEvent::NoteSet { key, value } => {
            projection.notes.insert(key.clone(), value.clone());
        }
        HeartbeatEvent::NoteClear { key } => {
            projection.notes.remove(key);
        }
    }
}

/// Fold a heartbeat log. Pure: same log, same projection.
pub fn fold_heartbeat(
    events: &[HeartbeatEvent],
    interval: u64,
    factor: u64,
) -> HeartbeatProjection {
    let mut projection = HeartbeatProjection::default();
    for event in events {
        apply_heartbeat(&mut projection, event, interval, factor);
    }
    projection
}

#[cfg(test)]
mod tests {
    use super::*;
    use HeartbeatEvent::*;

    #[test]
    fn steady_beats_report_no_misses() {
        let events: Vec<_> = (0..5).map(|i| Beat { seq: i, at: i * 60 }).collect();
        let projection = fold_heartbeat(&events, 60, 2);
        assert_eq!(projection.beats, 5);
        assert_eq!(projection.missed, 0);
        assert_eq!(projection.last_seq, Some(4));
        assert_eq!(projection.largest_gap, 60);
    }

    #[test]
    fn gap_beyond_threshold_counts_as_missed() {
        // interval 60, factor 2 ⇒ gap > 120 is a miss.
        let events = vec![
            Beat { seq: 0, at: 0 },
            Beat { seq: 1, at: 60 },
            Beat { seq: 2, at: 500 }, // gap 440
            Beat { seq: 3, at: 560 },
        ];
        let projection = fold_heartbeat(&events, 60, 2);
        assert_eq!(projection.missed, 1);
        assert_eq!(projection.largest_gap, 440);
    }

    #[test]
    fn out_of_order_and_duplicate_beats_are_ignored() {
        let events = vec![
            Beat { seq: 1, at: 10 },
            Beat { seq: 1, at: 20 }, // duplicate
            Beat { seq: 0, at: 30 }, // out of order
            Beat { seq: 2, at: 40 },
        ];
        let projection = fold_heartbeat(&events, 60, 2);
        assert_eq!(projection.beats, 2);
        assert_eq!(projection.ignored, 2);
        assert_eq!(projection.last_seq, Some(2));
    }

    #[test]
    fn scratch_notepad_last_write_wins_and_clears() {
        let events = vec![
            NoteSet {
                key: "last-cleanup".into(),
                value: "2026-08-17".into(),
            },
            NoteSet {
                key: "last-cleanup".into(),
                value: "2026-08-18".into(),
            },
            NoteSet {
                key: "todo".into(),
                value: "rotate logs".into(),
            },
            NoteClear { key: "todo".into() },
        ];
        let projection = fold_heartbeat(&events, 60, 2);
        assert_eq!(projection.notes.len(), 1);
        assert_eq!(
            projection.notes.get("last-cleanup").map(String::as_str),
            Some("2026-08-18")
        );
    }

    #[test]
    fn replay_is_deterministic_at_every_prefix() {
        let events = vec![
            Beat { seq: 0, at: 0 },
            NoteSet {
                key: "k".into(),
                value: "v".into(),
            },
            Beat { seq: 1, at: 300 },
            Beat { seq: 1, at: 310 },
            NoteClear { key: "k".into() },
            Beat { seq: 2, at: 600 },
        ];
        let whole = fold_heartbeat(&events, 60, 2);
        for k in 0..=events.len() {
            let mut projection = fold_heartbeat(&events[..k], 60, 2);
            for event in &events[k..] {
                apply_heartbeat(&mut projection, event, 60, 2);
            }
            assert_eq!(projection, whole, "split at {k} must equal whole fold");
        }
    }
}
