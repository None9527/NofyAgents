//! Pure repeated-action policy; applications classify tools before observation.
pub const NUDGE_AFTER_IDENTICAL_PROBLEMATIC_TOOL_CALLS: u32 = 4;
pub const NUDGE_AFTER_IDENTICAL_TOOL_CALLS: u32 = 8;
pub const MAX_CONSECUTIVE_IDENTICAL_PROBLEMATIC_TOOL_CALLS: u32 = 8;
pub const MAX_CONSECUTIVE_IDENTICAL_TOOL_CALLS: u32 = 12;
pub const MAX_CONSECUTIVE_TRUE_NOOPS: u32 = 4;
const _: () = assert!(
    NUDGE_AFTER_IDENTICAL_PROBLEMATIC_TOOL_CALLS < MAX_CONSECUTIVE_IDENTICAL_PROBLEMATIC_TOOL_CALLS
);
const _: () = assert!(NUDGE_AFTER_IDENTICAL_TOOL_CALLS < MAX_CONSECUTIVE_IDENTICAL_TOOL_CALLS);

fn hash_step_signature(signature: &str) -> u64 {
    use std::hash::{Hash, Hasher};
    let mut hasher = std::collections::hash_map::DefaultHasher::new();
    signature.hash(&mut hasher);
    hasher.finish()
}
#[derive(Default, serde::Serialize, serde::Deserialize)]
#[serde(deny_unknown_fields)]
pub struct IdenticalToolCallRun {
    last_signature_hash: Option<u64>,
    pub tool_name: String,
    /// Whether the repeated step is in the tight threshold tier, decided by the registered
    /// kinds of every call in it (using the caller-provided repeat classification).
    problematically_repeating_step: bool,
    pub run_len: u32,
    pub is_true_noop_run: bool,
    nudged: bool,
}
impl IdenticalToolCallRun {
    pub fn observe(
        &mut self,
        signature: &str,
        tool_name: &str,
        problematically_repeating_step: bool,
        is_true_noop: bool,
    ) -> u32 {
        let hash = hash_step_signature(if is_true_noop {
            "\0true_noop"
        } else {
            signature
        });
        if self.last_signature_hash == Some(hash) {
            self.run_len += 1;
        } else {
            self.run_len = 1;
            self.last_signature_hash = Some(hash);
            self.is_true_noop_run = is_true_noop;
            self.nudged = false;
        }
        self.tool_name = tool_name.to_string();
        self.problematically_repeating_step = problematically_repeating_step;
        self.run_len
    }
    /// Whether this run gets the tighter nudge and hard-stop thresholds (using the caller-provided classification).
    pub fn is_problematically_repeating(&self) -> bool {
        !self.is_true_noop_run && self.problematically_repeating_step
    }
    pub fn nudge_threshold(&self) -> u32 {
        if self.is_problematically_repeating() {
            NUDGE_AFTER_IDENTICAL_PROBLEMATIC_TOOL_CALLS
        } else {
            NUDGE_AFTER_IDENTICAL_TOOL_CALLS
        }
    }
    /// Once per identical run at/after the nudge threshold. Call only after results are committed.
    ///
    /// `true` keepalive runs are exempt: they end the turn silently at
    /// [`MAX_CONSECUTIVE_TRUE_NOOPS`] rather than being told to stop polling.
    pub fn take_nudge(&mut self) -> bool {
        let fire = !self.is_true_noop_run && self.run_len >= self.nudge_threshold() && !self.nudged;
        self.nudged |= fire;
        fire
    }
    pub fn hard_stop_threshold(&self) -> u32 {
        if self.is_true_noop_run {
            MAX_CONSECUTIVE_TRUE_NOOPS
        } else if self.is_problematically_repeating() {
            MAX_CONSECUTIVE_IDENTICAL_PROBLEMATIC_TOOL_CALLS
        } else {
            MAX_CONSECUTIVE_IDENTICAL_TOOL_CALLS
        }
    }
}
