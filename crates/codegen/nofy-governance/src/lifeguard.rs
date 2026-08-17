//! Lifecycle guard: refuse self-destructive commands (FR5.6, HM-F21).
//!
//! The scheduler/agent must never run a command that destroys its own
//! ability to exist or recover. This classifier recognizes the canonical
//! self-destruction shapes and refuses them BEFORE the permission chain —
//! the same 「拒自毁」 discipline as the fs-trigger policy
//! (`nofy_scheduler::fstrigger`), applied to command lines.
//!
//! Conservative by design: only well-known lethal shapes are refused;
//! everything else flows to the normal approval chain (which has its own
//! risk policies). A guard that refuses too much becomes a bypass
//! incentive.

/// Verdict for one command line.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum GuardVerdict {
    Safe,
    Refused { reason: String },
}

/// Context the guard needs about the agent itself.
#[derive(Debug, Clone)]
pub struct SelfContext {
    /// The agent's own binary path (if known).
    pub own_binary: Option<String>,
    /// Ancestor PIDs (parent chain) — killing them kills us.
    pub ancestor_pids: Vec<u32>,
}

/// Classify a command line. Deterministic.
pub fn classify(cmd: &str, ctx: &SelfContext) -> GuardVerdict {
    let normalized: String = cmd.split_whitespace().collect::<Vec<_>>().join(" ");

    // Wipe-the-world shapes.
    for lethal in [
        "rm -rf /",
        "rm -rf /*",
        "rm -fr /",
        "rm -rf ~",
        "rm -rf $HOME",
        "mkfs",
        "dd if=/dev/zero of=/dev/sda",
        "dd if=/dev/zero of=/dev/nvme0n1",
        ":(){ :|:& };:", // fork bomb
    ] {
        if normalized.contains(lethal) {
            return GuardVerdict::Refused {
                reason: format!("self-destructive pattern: {lethal}"),
            };
        }
    }

    // Killing our own ancestor chain kills us.
    for pid in &ctx.ancestor_pids {
        for kill_form in [format!("kill -9 {pid}"), format!("kill {pid}")] {
            if normalized.contains(&kill_form) {
                return GuardVerdict::Refused {
                    reason: format!("kills ancestor process {pid}"),
                };
            }
        }
    }

    // Deleting our own binary.
    if let Some(binary) = &ctx.own_binary {
        if normalized.contains("rm") && normalized.contains(binary.as_str()) {
            return GuardVerdict::Refused {
                reason: "deletes the agent's own binary".into(),
            };
        }
    }

    GuardVerdict::Safe
}

#[cfg(test)]
mod tests {
    use super::*;

    fn ctx() -> SelfContext {
        SelfContext {
            own_binary: Some("/usr/local/bin/nofy".into()),
            ancestor_pids: vec![100, 4242],
        }
    }

    #[test]
    fn wipe_the_world_is_refused() {
        for cmd in [
            "rm -rf /",
            "sudo rm -rf /*",
            "rm -fr / --no-preserve-root",
            "mkfs.ext4 /dev/sda1",
            ":(){ :|:& };:",
        ] {
            assert!(
                matches!(classify(cmd, &ctx()), GuardVerdict::Refused { .. }),
                "must refuse: {cmd}"
            );
        }
    }

    #[test]
    fn ancestor_kill_is_refused() {
        assert!(matches!(
            classify("kill -9 4242", &ctx()),
            GuardVerdict::Refused { .. }
        ));
        // Unrelated pid is safe (the approval chain decides).
        assert_eq!(classify("kill -9 9999", &ctx()), GuardVerdict::Safe);
    }

    #[test]
    fn own_binary_deletion_is_refused() {
        assert!(matches!(
            classify("rm /usr/local/bin/nofy", &ctx()),
            GuardVerdict::Refused { .. }
        ));
    }

    #[test]
    fn ordinary_commands_flow_through() {
        for cmd in ["ls -la", "cargo test", "rm -rf target/debug", "git clean -fdx"] {
            assert_eq!(classify(cmd, &ctx()), GuardVerdict::Safe, "must pass: {cmd}");
        }
    }

    #[test]
    fn whitespace_variations_normalize() {
        assert!(matches!(
            classify("rm   -rf    /", &ctx()),
            GuardVerdict::Refused { .. }
        ));
    }
}
