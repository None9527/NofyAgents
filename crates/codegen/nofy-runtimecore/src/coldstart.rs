//! Cold-start fast path (FR1.15, OC-F5): help/version answer WITHOUT
//! loading the runtime.
//!
//! The classifier splits the first argument into a fast path (no
//! runtime components touched at all) and a full boot. The fast-path
//! plan is provably empty: construction guarantees help/version never
//! pay for daemon, persistence, or env work.

/// Runtime components a boot may load.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RuntimeComponent {
    Daemon,
    Persistence,
    EnvSnapshot,
    SessionState,
}

/// The boot plan for one invocation.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum BootPlan {
    /// Answer directly; load nothing.
    FastPath { response: String },
    /// Load the listed components, in order.
    FullBoot { components: Vec<RuntimeComponent> },
}

/// Classify the invocation by its first argument (None = no args).
pub fn classify(first_arg: Option<&str>) -> BootPlan {
    match first_arg {
        Some("--help") | Some("-h") | Some("help") => BootPlan::FastPath {
            response: "usage: nofy [command]".into(),
        },
        Some("--version") | Some("-V") | Some("version") => BootPlan::FastPath {
            response: env!("CARGO_PKG_VERSION").into(),
        },
        _ => BootPlan::FullBoot {
            components: vec![
                RuntimeComponent::Daemon,
                RuntimeComponent::Persistence,
                RuntimeComponent::EnvSnapshot,
                RuntimeComponent::SessionState,
            ],
        },
    }
}

/// The fast-path guarantee: a FastPlan loads zero components.
pub fn components_loaded(plan: &BootPlan) -> Vec<RuntimeComponent> {
    match plan {
        BootPlan::FastPath { .. } => Vec::new(),
        BootPlan::FullBoot { components } => components.clone(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn help_and_version_take_the_fast_path() {
        for arg in ["--help", "-h", "help", "--version", "-V", "version"] {
            let plan = classify(Some(arg));
            assert!(
                matches!(plan, BootPlan::FastPath { .. }),
                "{arg} must not boot the runtime"
            );
            assert!(
                components_loaded(&plan).is_empty(),
                "{arg} loads zero components"
            );
        }
    }

    #[test]
    fn anything_else_full_boots() {
        for arg in [None, Some("chat"), Some("daemon"), Some("--unknown")] {
            let plan = classify(arg);
            assert!(matches!(plan, BootPlan::FullBoot { .. }));
            assert!(!components_loaded(&plan).is_empty());
        }
    }

    #[test]
    fn full_boot_order_is_deterministic() {
        let plan = classify(Some("chat"));
        assert_eq!(
            components_loaded(&plan),
            vec![
                RuntimeComponent::Daemon,
                RuntimeComponent::Persistence,
                RuntimeComponent::EnvSnapshot,
                RuntimeComponent::SessionState,
            ]
        );
    }

    #[test]
    fn fast_path_responses_are_nonempty() {
        for arg in ["--help", "--version"] {
            assert!(
                matches!(classify(Some(arg)), BootPlan::FastPath { response } if !response.is_empty()),
                "{arg} must answer from the fast path"
            );
        }
    }
}
