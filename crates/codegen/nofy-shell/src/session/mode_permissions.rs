//! Mode-permissions matrix (FR5.9, NG-F5 translated).
//!
//! Execution modes are capability-bit combinations instead of string
//! branches: the NGO reference registers `{ForcePlan, AutoApprove,
//! SelfReview, PhaseDetect}` per mode and its security chain consumes the
//! bits directly (AutoApprove skips human review; ForcePlan denies
//! mutations). This module is the shell-side translation: one declarative
//! matrix over [`PermissionMode`] plus a pure lookup the tool-dispatch
//! permission check consults fail-closed.

use nofy_agent::config::PermissionMode;
use nofy_workspace::permission::AccessKind;

/// Capability bits a mode grants (NG-F5 `ModePermissions`).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct ModeCaps(u8);

impl ModeCaps {
    /// Write-class actions are denied unless the mode's own carve-out
    /// applies (plan file); the permission chain never sees them.
    pub const FORCE_PLAN: Self = Self(0b0000_0001);
    /// The chain skips human review (yolo fast path / classifier).
    pub const AUTO_APPROVE: Self = Self(0b0000_0010);
    /// A reviewer pass runs over the decision (auto-mode classifier).
    pub const SELF_REVIEW: Self = Self(0b0000_0100);
    /// The mode is a phase of a larger workflow (plan → build).
    pub const PHASE_DETECT: Self = Self(0b0000_1000);

    pub const fn empty() -> Self {
        Self(0)
    }

    pub const fn contains(self, other: Self) -> bool {
        self.0 & other.0 == other.0
    }

    pub const fn union(self, other: Self) -> Self {
        Self(self.0 | other.0)
    }
}

/// The declarative matrix: every shell mode maps to its capability bits.
/// This is the single source the dispatch seam consults — the exhaustive
/// match is the review hook when a mode is added.
pub fn caps_for_mode(mode: &PermissionMode) -> ModeCaps {
    match mode {
        PermissionMode::Plan => ModeCaps::FORCE_PLAN.union(ModeCaps::PHASE_DETECT),
        PermissionMode::BypassPermissions => ModeCaps::AUTO_APPROVE,
        PermissionMode::Auto => ModeCaps::AUTO_APPROVE.union(ModeCaps::SELF_REVIEW),
        PermissionMode::AcceptEdits => ModeCaps::AUTO_APPROVE,
        PermissionMode::Default | PermissionMode::DontAsk => ModeCaps::empty(),
    }
}

/// Coarse action classes the matrix decides over.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ActionClass {
    Read,
    Write,
    Execute,
}

/// Reduce a concrete access request to its matrix class. MCP tools are
/// treated as Execute (arbitrary side effects are not knowable here).
pub fn access_class(access: &AccessKind) -> ActionClass {
    match access {
        AccessKind::Read(_) | AccessKind::Grep { .. } | AccessKind::WebFetch(_) => {
            ActionClass::Read
        }
        AccessKind::Edit(_) => ActionClass::Write,
        AccessKind::Bash(_) | AccessKind::MCPTool { .. } => ActionClass::Execute,
    }
}

/// The matrix decision for one action under one mode. `Some(reason)` is a
/// fail-closed denial; `None` means "not denied by the mode" and the
/// action flows on to the normal permission chain unaffected.
pub fn mode_denial(mode: &PermissionMode, access: &AccessKind) -> Option<String> {
    let caps = caps_for_mode(mode);
    let class = access_class(access);
    if caps.contains(ModeCaps::FORCE_PLAN) && class == ActionClass::Write {
        return Some(format!(
            "denied by mode_permissions: mode `{mode:?}` forces plan (write actions blocked)"
        ));
    }
    None
}

#[cfg(test)]
mod tests {
    use super::*;

    fn edit(path: &str) -> AccessKind {
        AccessKind::Edit(path.to_string())
    }

    fn bash(cmd: &str) -> AccessKind {
        AccessKind::Bash(cmd.to_string())
    }

    fn read(path: &str) -> AccessKind {
        AccessKind::Read(Some(path.to_string()))
    }

    #[test]
    fn matrix_translates_ngf5_capability_bits() {
        assert_eq!(
            caps_for_mode(&PermissionMode::Plan),
            ModeCaps::FORCE_PLAN.union(ModeCaps::PHASE_DETECT)
        );
        assert_eq!(
            caps_for_mode(&PermissionMode::BypassPermissions),
            ModeCaps::AUTO_APPROVE
        );
        assert_eq!(
            caps_for_mode(&PermissionMode::Auto),
            ModeCaps::AUTO_APPROVE.union(ModeCaps::SELF_REVIEW)
        );
        assert_eq!(caps_for_mode(&PermissionMode::Default), ModeCaps::empty());
        assert_eq!(caps_for_mode(&PermissionMode::DontAsk), ModeCaps::empty());
        assert!(caps_for_mode(&PermissionMode::Plan).contains(ModeCaps::FORCE_PLAN));
        assert!(!caps_for_mode(&PermissionMode::Default).contains(ModeCaps::FORCE_PLAN));
    }

    #[test]
    fn denied_in_mode_is_blocked() {
        // Plan forces read-only: a write action is denied with an
        // observable reason naming the mode.
        let reason = mode_denial(&PermissionMode::Plan, &edit("src/main.rs"))
            .expect("plan mode must deny writes");
        assert!(reason.contains("Plan"), "reason names the mode: {reason}");
        assert!(reason.contains("mode_permissions"));
    }

    #[test]
    fn not_denied_is_unaffected() {
        // Reads are never denied by any mode.
        for mode in [
            PermissionMode::Default,
            PermissionMode::Plan,
            PermissionMode::Auto,
            PermissionMode::BypassPermissions,
            PermissionMode::AcceptEdits,
            PermissionMode::DontAsk,
        ] {
            assert!(
                mode_denial(&mode, &read("src/main.rs")).is_none(),
                "reads flow to the chain in every mode"
            );
        }
        // Non-plan modes do not deny writes or execution: the normal
        // permission chain decides (ask / auto / yolo).
        for access in [edit("src/main.rs"), bash("cargo test")] {
            for mode in [
                PermissionMode::Default,
                PermissionMode::Auto,
                PermissionMode::BypassPermissions,
                PermissionMode::AcceptEdits,
            ] {
                assert!(
                    mode_denial(&mode, &access).is_none(),
                    "{mode:?} must not matrix-deny {access:?}"
                );
            }
        }
        // Execution is not plan-denied: plan mode's bash policy stays on
        // the normal chain (documented plan-gate semantics).
        assert!(mode_denial(&PermissionMode::Plan, &bash("ls")).is_none());
    }

    #[test]
    fn access_classes_reduce_to_three() {
        assert_eq!(access_class(&read("f")), ActionClass::Read);
        assert_eq!(
            access_class(&AccessKind::Grep {
                path: Some("src".into()),
                glob: None,
            }),
            ActionClass::Read
        );
        assert_eq!(access_class(&edit("f")), ActionClass::Write);
        assert_eq!(access_class(&bash("true")), ActionClass::Execute);
        assert_eq!(
            access_class(&AccessKind::MCPTool {
                name: "fs".into(),
                input: serde_json::Value::Null,
            }),
            ActionClass::Execute
        );
    }
}
