//! Script sandbox (FR14.6): limits + fail-closed, NEVER in-proc.
//!
//! Scripts always execute across a PROCESS boundary: the only thing this
//! module can produce is a [`SpawnSpec`] — there is no in-proc execution
//! API to call (「永不 in-proc」, §6 red line, enforced by shape). Any
//! uncertainty fails CLOSED: no profile, unsupported runtime, or an
//! unbounded script refuses to plan.

/// Resource limits for one script run.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct ScriptLimits {
    pub max_secs: u64,
    pub max_mem_mb: u64,
    pub max_output_bytes: u64,
}

/// The sandbox profile (same profile family as tool sandboxes).
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SandboxProfile {
    pub name: String,
    pub limits: ScriptLimits,
    /// Network egress is off unless explicitly granted.
    pub allow_network: bool,
}

/// A planned execution — always an external process.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SpawnSpec {
    pub interpreter: String,
    pub script_path: String,
    pub limits: ScriptLimits,
    pub allow_network: bool,
    /// Env is scrubbed before crossing the boundary.
    pub env_scrubbed: bool,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SandboxError {
    NoProfile,
    UnsupportedRuntime(String),
    /// The script declares unbounded resources — refuse, don't guess.
    UnboundedResource(String),
}

/// Plan a script execution. Fail-closed on any uncertainty.
pub fn plan_execution(
    runtime: &str,
    script_path: &str,
    profile: Option<&SandboxProfile>,
) -> Result<SpawnSpec, SandboxError> {
    let Some(profile) = profile else {
        return Err(SandboxError::NoProfile);
    };
    let interpreter = match runtime {
        "python" => "python3",
        "ts" | "typescript" => "node",
        other => return Err(SandboxError::UnsupportedRuntime(other.to_string())),
    };
    if profile.limits.max_secs == 0 || profile.limits.max_mem_mb == 0 {
        return Err(SandboxError::UnboundedResource(
            "zero limit = unbounded".into(),
        ));
    }
    Ok(SpawnSpec {
        interpreter: interpreter.to_string(),
        script_path: script_path.to_string(),
        limits: profile.limits,
        allow_network: profile.allow_network,
        env_scrubbed: true,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn profile() -> SandboxProfile {
        SandboxProfile {
            name: "script-default".into(),
            limits: ScriptLimits {
                max_secs: 30,
                max_mem_mb: 256,
                max_output_bytes: 1_000_000,
            },
            allow_network: false,
        }
    }

    #[test]
    fn plans_always_cross_a_process_boundary() {
        let spec = plan_execution("python", "/packs/x/run.py", Some(&profile())).unwrap();
        assert_eq!(spec.interpreter, "python3");
        assert!(spec.env_scrubbed, "env must be scrubbed at the boundary");
        assert!(!spec.allow_network, "egress off by default");
        // The module exposes NO in-proc execution function — shape check:
        // SpawnSpec is the only output type.
    }

    #[test]
    fn no_profile_fails_closed() {
        assert_eq!(
            plan_execution("python", "/x.py", None),
            Err(SandboxError::NoProfile)
        );
    }

    #[test]
    fn unsupported_runtime_fails_closed() {
        assert_eq!(
            plan_execution("ruby", "/x.rb", Some(&profile())),
            Err(SandboxError::UnsupportedRuntime("ruby".into()))
        );
    }

    #[test]
    fn unbounded_limits_refused() {
        let mut unbounded = profile();
        unbounded.limits.max_secs = 0;
        assert!(matches!(
            plan_execution("python", "/x.py", Some(&unbounded)),
            Err(SandboxError::UnboundedResource(_))
        ));
    }

    #[test]
    fn ts_runtime_maps_to_node() {
        let spec = plan_execution("ts", "/x.ts", Some(&profile())).unwrap();
        assert_eq!(spec.interpreter, "node");
    }
}
