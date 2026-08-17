//! YOLO freeze + session identity task localization (FR5.5, HM-F20).
//!
//! Two guarantees against privilege drift:
//!
//! - **Mode freeze**: once a session is frozen (e.g. it entered the most
//!   dangerous mode, or a policy tripwire fired), it can never be
//!   HOT-UPGRADED to a more dangerous mode — downgrades stay allowed.
//!   「危险模式不可热升级」(AC-5).
//! - **Task localization**: a session identity is issued for ONE task.
//!   Presenting it for a different task is rejected — identity cannot be
//!   laundered across tasks to reuse a granted mode.

/// Permission modes ordered by danger (index = danger level).
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum RiskMode {
    Default,
    Plan,
    Auto,
    Yolo,
}

impl RiskMode {
    pub fn danger(&self) -> u8 {
        *self as u8
    }
}

/// The frozen-mode state machine for one session.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ModeFreeze {
    pub mode: RiskMode,
    pub frozen: bool,
    /// Audit trail of refused hot-upgrade attempts.
    pub refused_upgrades: u64,
}

impl ModeFreeze {
    pub fn new(mode: RiskMode) -> Self {
        // Entering the most dangerous mode freezes the session: from here
        // on, no hot-upgrade is possible at all.
        Self {
            frozen: mode == RiskMode::Yolo,
            mode,
            refused_upgrades: 0,
        }
    }

    /// Freeze explicitly (policy tripwire).
    pub fn freeze(&mut self) {
        self.frozen = true;
    }

    /// Attempt a mode transition. Hot-upgrades while frozen are refused;
    /// downgrades are always allowed (de-escalation is never blocked).
    pub fn transition(&mut self, to: RiskMode) -> bool {
        if self.frozen && to.danger() > self.mode.danger() {
            self.refused_upgrades += 1;
            return false;
        }
        self.mode = to;
        if to == RiskMode::Yolo {
            self.frozen = true;
        }
        true
    }
}

/// A session identity bound to one task.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct TaskIdentity {
    pub identity: String,
    pub task: String,
}

/// Validate an identity presentation against the task it claims.
pub fn validate_identity(identity: &TaskIdentity, claimed_task: &str) -> bool {
    identity.task == claimed_task
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn entering_yolo_freezes_the_session() {
        let mut freeze = ModeFreeze::new(RiskMode::Default);
        assert!(!freeze.frozen);
        assert!(freeze.transition(RiskMode::Yolo));
        assert!(freeze.frozen, "YOLO entry must freeze");
        // No hot-upgrade exists beyond Yolo, but a frozen Auto also refuses.
        let mut frozen_auto = ModeFreeze::new(RiskMode::Auto);
        frozen_auto.freeze();
        assert!(!frozen_auto.transition(RiskMode::Yolo));
        assert_eq!(frozen_auto.refused_upgrades, 1);
        assert_eq!(frozen_auto.mode, RiskMode::Auto, "refused upgrade changes nothing");
    }

    #[test]
    fn frozen_session_can_still_downgrade() {
        let mut freeze = ModeFreeze::new(RiskMode::Yolo);
        assert!(freeze.transition(RiskMode::Default), "de-escalation never blocked");
        assert_eq!(freeze.mode, RiskMode::Default);
    }

    #[test]
    fn unfrozen_session_can_escalate() {
        let mut freeze = ModeFreeze::new(RiskMode::Default);
        assert!(freeze.transition(RiskMode::Plan));
        assert!(freeze.transition(RiskMode::Auto));
        assert_eq!(freeze.mode, RiskMode::Auto);
    }

    #[test]
    fn identity_is_task_local() {
        let identity = TaskIdentity {
            identity: "sess-123".into(),
            task: "task-A".into(),
        };
        assert!(validate_identity(&identity, "task-A"));
        assert!(
            !validate_identity(&identity, "task-B"),
            "identity cannot be laundered across tasks"
        );
    }
}
