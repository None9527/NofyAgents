//! Permission-preset intent events + write-through (FR5.11, DS-#20).
//!
//! Preset changes are journaled as INTENT events BEFORE they take effect
//! (write-through): the effective preset set is always the fold of the
//! journal, so "what was active when" is auditable and a crash between
//! intent and apply is visible (intent without apply = an interrupted
//! change, never a silent one).

use std::collections::BTreeSet;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum PresetEvent {
    /// Intent: a preset change was requested (journaled first).
    Intent { preset: String, enable: bool },
    /// Write-through: the change took effect.
    Applied { preset: String, enable: bool },
}

/// Fold a preset journal into the effective set.
///
/// Semantics: only `Applied` events change the set; an `Intent` without a
/// matching `Applied` is an interrupted change — visible in the journal,
/// invisible in the effect. An `Applied` without a preceding `Intent` is
/// a protocol violation and is ignored (fail-closed: no unjournaled
/// intent, no effect).
pub fn fold_presets(events: &[PresetEvent]) -> BTreeSet<String> {
    let mut active: BTreeSet<String> = BTreeSet::new();
    let mut pending_intent: Option<(String, bool)> = None;
    for event in events {
        match event {
            PresetEvent::Intent { preset, enable } => {
                pending_intent = Some((preset.clone(), *enable));
            }
            PresetEvent::Applied { preset, enable } => {
                let authorized = pending_intent
                    .as_ref()
                    .is_some_and(|(p, e)| p == preset && *e == *enable);
                if !authorized {
                    continue; // Applied without matching intent: ignored
                }
                pending_intent = None;
                if *enable {
                    active.insert(preset.clone());
                } else {
                    active.remove(preset);
                }
            }
        }
    }
    active
}

/// Whether the journal carries an interrupted (intent-without-apply)
/// change — the crash-repair signal.
pub fn has_interrupted_change(events: &[PresetEvent]) -> bool {
    let mut pending = false;
    for event in events {
        match event {
            PresetEvent::Intent { .. } => pending = true,
            PresetEvent::Applied { .. } => pending = false,
        }
    }
    pending
}

#[cfg(test)]
mod tests {
    use super::*;

    fn intent(preset: &str, enable: bool) -> PresetEvent {
        PresetEvent::Intent {
            preset: preset.into(),
            enable,
        }
    }

    fn applied(preset: &str, enable: bool) -> PresetEvent {
        PresetEvent::Applied {
            preset: preset.into(),
            enable,
        }
    }

    #[test]
    fn intent_then_apply_changes_the_set() {
        let events = vec![
            intent("auto-approve-reads", true),
            applied("auto-approve-reads", true),
        ];
        let active = fold_presets(&events);
        assert!(active.contains("auto-approve-reads"));
        assert!(!has_interrupted_change(&events));
    }

    #[test]
    fn applied_without_intent_is_ignored() {
        let active = fold_presets(&[applied("smuggled", true)]);
        assert!(active.is_empty(), "no unjournaled intent, no effect");
    }

    #[test]
    fn mismatched_apply_is_ignored() {
        let active = fold_presets(&[intent("a", true), applied("b", true)]);
        assert!(active.is_empty());
        let active = fold_presets(&[intent("a", true), applied("a", false)]);
        assert!(active.is_empty(), "enable flag must match the intent");
    }

    #[test]
    fn interrupted_change_is_detectable() {
        let events = vec![intent("risky", true)];
        assert!(has_interrupted_change(&events));
        assert!(
            fold_presets(&events).is_empty(),
            "intent alone changes nothing"
        );
    }

    #[test]
    fn disable_roundtrip_and_determinism() {
        let events = vec![
            intent("x", true),
            applied("x", true),
            intent("x", false),
            applied("x", false),
        ];
        assert!(fold_presets(&events).is_empty());
        assert_eq!(fold_presets(&events), fold_presets(&events));
    }
}
