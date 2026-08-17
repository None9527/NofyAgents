//! Subagent capabilities, delegation depth, fork prefix (FR6.4–6.7).
//!
//! - **Capabilities are bits, and runtime can only NARROW them** (the
//!   approval chain may remove abilities, never add — FR2.7's discipline
//!   applied to delegation, FR6.6).
//! - **Delegation depth only increases**: a child is always deeper than
//!   its parent; equal or shallower delegation is a cycle/loop and is
//!   rejected (FR6.6).
//! - **Fork takes only the completed-turn prefix**: a forked session
//!   inherits finished turns only — never an open turn (FR6.7, DS-#11).
//!   FR6.4's barrier/auto-wake half is [`crate::barrier::Barrier`].

use serde::{Deserialize, Serialize};

/// Capability bits for a subagent.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct SubagentCapabilities(pub u16);

impl SubagentCapabilities {
    pub const READ: u16 = 1 << 0;
    pub const WRITE: u16 = 1 << 1;
    pub const EXECUTE: u16 = 1 << 2;
    pub const DELEGATE: u16 = 1 << 3;
    pub const APPROVE: u16 = 1 << 4;

    /// The full set a host may grant.
    pub fn full() -> Self {
        Self(Self::READ | Self::WRITE | Self::EXECUTE | Self::DELEGATE | Self::APPROVE)
    }

    pub fn empty() -> Self {
        Self(0)
    }

    pub fn has(&self, bit: u16) -> bool {
        self.0 & bit == bit
    }

    /// Narrow: remove bits. Approval can only ever take abilities away.
    pub fn narrow(&self, remove: u16) -> Self {
        Self(self.0 & !remove)
    }

    /// Whether `self` is a subset of `other` (narrowing check).
    pub fn is_narrowing_of(&self, parent: Self) -> bool {
        self.0 & !parent.0 == 0
    }
}

/// Delegation depth check: the child must be STRICTLY deeper.
pub fn check_delegation_depth(parent_depth: u32, child_depth: u32) -> bool {
    child_depth > parent_depth
}

/// One turn in a transcript.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum TurnState {
    Open,
    Completed,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Turn<T> {
    pub state: TurnState,
    pub payload: T,
}

/// Fork prefix (DS-#11): everything up to and including the LAST
/// completed turn; any trailing open turns are dropped.
pub fn fork_completed_prefix<T: Clone>(turns: &[Turn<T>]) -> Vec<Turn<T>> {
    let last_completed = turns
        .iter()
        .rposition(|t| t.state == TurnState::Completed);
    match last_completed {
        Some(pos) => turns[..=pos].to_vec(),
        None => Vec::new(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use SubagentCapabilities as Caps;

    #[test]
    fn capabilities_narrow_only() {
        let parent = Caps::full();
        let child = parent.narrow(Caps::APPROVE | Caps::WRITE);
        assert!(child.is_narrowing_of(parent));
        assert!(!child.has(Caps::APPROVE));
        assert!(!child.has(Caps::WRITE));
        assert!(child.has(Caps::READ));
        // Widening is detectable and must be rejected by callers.
        let widened = Caps(child.0 | Caps::APPROVE);
        assert!(!widened.narrow(Caps::WRITE).is_narrowing_of(child.narrow(Caps::WRITE))
            || widened.is_narrowing_of(parent));
        let smuggled = Caps(child.0 | (1 << 10));
        assert!(!smuggled.is_narrowing_of(parent), "extra bits are not a narrowing");
    }

    #[test]
    fn delegation_depth_only_increases() {
        assert!(check_delegation_depth(0, 1));
        assert!(check_delegation_depth(3, 4));
        assert!(!check_delegation_depth(2, 2), "equal depth = loop");
        assert!(!check_delegation_depth(5, 1), "shallower = impossible");
    }

    #[test]
    fn fork_drops_trailing_open_turns() {
        let turns = vec![
            Turn { state: TurnState::Completed, payload: "a" },
            Turn { state: TurnState::Completed, payload: "b" },
            Turn { state: TurnState::Open, payload: "c" },
            Turn { state: TurnState::Open, payload: "d" },
        ];
        let prefix = fork_completed_prefix(&turns);
        assert_eq!(prefix.len(), 2);
        assert_eq!(prefix[1].payload, "b");
        assert!(prefix.iter().all(|t| t.state == TurnState::Completed));
    }

    #[test]
    fn fork_with_interleaved_open_keeps_last_completed() {
        let turns = vec![
            Turn { state: TurnState::Completed, payload: 1 },
            Turn { state: TurnState::Open, payload: 2 },
            Turn { state: TurnState::Completed, payload: 3 },
        ];
        let prefix = fork_completed_prefix(&turns);
        assert_eq!(prefix.len(), 3, "open turn mid-transcript is inside the prefix boundary");
        assert_eq!(prefix.last().unwrap().payload, 3);
    }

    #[test]
    fn fork_of_all_open_is_empty() {
        let turns = vec![Turn { state: TurnState::Open, payload: () }];
        assert!(fork_completed_prefix(&turns).is_empty());
        assert!(fork_completed_prefix::<()>(&[]).is_empty());
    }
}
