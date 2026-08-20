//! Script packs (FR14.1): bundled scripts + declared dependencies,
//! structured results.
//!
//! A script pack is the five-minute-onboarding unit: script + declared
//! runtime/deps, NO Rust changes (「Python script pack 五分钟上线零 Rust
//! 改动」, P1 milestone). Dependency install is lazy and only from
//! TRUSTED channels (the supply-chain gate, FR8.1, decides admission).

use crate::scriptsandbox::{SandboxProfile, SpawnSpec, plan_execution};

/// Declared runtime for a script pack.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Runtime {
    Python {
        version: String,
        /// requirements entries, installed lazily from trusted channels.
        requirements: Vec<String>,
    },
    Ts {
        /// npm packages, installed lazily from trusted channels.
        packages: Vec<String>,
    },
}

impl Runtime {
    pub fn kind(&self) -> &'static str {
        match self {
            Runtime::Python { .. } => "python",
            Runtime::Ts { .. } => "ts",
        }
    }

    pub fn declared_deps(&self) -> &[String] {
        match self {
            Runtime::Python { requirements, .. } => requirements,
            Runtime::Ts { packages } => packages,
        }
    }
}

/// One script pack.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ScriptPack {
    pub id: String,
    pub runtime: Runtime,
    /// Entry script path, relative to the pack directory.
    pub entry: String,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum PackError {
    EmptyId,
    EmptyEntry,
    /// Entry escapes the pack directory.
    EntryEscape,
    Sandbox(crate::scriptsandbox::SandboxError),
}

/// Validate a pack definition.
pub fn validate_pack(pack: &ScriptPack) -> Result<(), PackError> {
    if pack.id.trim().is_empty() {
        return Err(PackError::EmptyId);
    }
    if pack.entry.trim().is_empty() {
        return Err(PackError::EmptyEntry);
    }
    if pack.entry.split('/').any(|seg| seg == "..") {
        return Err(PackError::EntryEscape);
    }
    Ok(())
}

/// A run plan: dependency install intent + the sandboxed spawn.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RunPlan {
    /// Deps to install lazily (empty when none declared).
    pub install_deps: Vec<String>,
    pub spawn: SpawnSpec,
}

/// Plan one run of a script pack.
pub fn plan_run(
    pack: &ScriptPack,
    pack_dir: &str,
    profile: Option<&SandboxProfile>,
) -> Result<RunPlan, PackError> {
    validate_pack(pack)?;
    let spawn = plan_execution(
        pack.runtime.kind(),
        &format!("{pack_dir}/{}", pack.entry),
        profile,
    )
    .map_err(PackError::Sandbox)?;
    Ok(RunPlan {
        install_deps: pack.runtime.declared_deps().to_vec(),
        spawn,
    })
}

/// Structured result of a run.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RunResult {
    pub exit_code: i32,
    pub stdout: String,
    pub stderr: String,
    /// Output exceeded the limit and was truncated (spill discipline).
    pub truncated: bool,
}

impl RunResult {
    pub fn succeeded(&self) -> bool {
        self.exit_code == 0
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::scriptsandbox::ScriptLimits;

    fn profile() -> SandboxProfile {
        SandboxProfile {
            name: "script-default".into(),
            limits: ScriptLimits {
                max_secs: 30,
                max_mem_mb: 256,
                max_output_bytes: 1000,
            },
            allow_network: false,
        }
    }

    fn pack() -> ScriptPack {
        ScriptPack {
            id: "hello-py".into(),
            runtime: Runtime::Python {
                version: "3.11".into(),
                requirements: vec!["requests".into()],
            },
            entry: "run.py".into(),
        }
    }

    #[test]
    fn python_pack_plans_with_lazy_deps() {
        let plan = plan_run(&pack(), "/packs/hello-py", Some(&profile())).unwrap();
        assert_eq!(plan.install_deps, vec!["requests".to_string()]);
        assert_eq!(plan.spawn.script_path, "/packs/hello-py/run.py");
        assert_eq!(plan.spawn.interpreter, "python3");
    }

    #[test]
    fn ts_pack_plans_with_npm_deps() {
        let pack = ScriptPack {
            id: "hello-ts".into(),
            runtime: Runtime::Ts { packages: vec!["left-pad".into()] },
            entry: "run.ts".into(),
        };
        let plan = plan_run(&pack, "/packs/hello-ts", Some(&profile())).unwrap();
        assert_eq!(plan.install_deps, vec!["left-pad".to_string()]);
        assert_eq!(plan.spawn.script_path, "/packs/hello-ts/run.ts");
        assert_eq!(plan.spawn.interpreter, "node");
    }

    #[test]
    fn entry_escape_rejected() {
        let mut evil = pack();
        evil.entry = "../escape.py".into();
        assert_eq!(plan_run(&evil, "/p", Some(&profile())), Err(PackError::EntryEscape));
    }

    #[test]
    fn empty_id_or_entry_rejected() {
        let mut no_id = pack();
        no_id.id = "  ".into();
        assert_eq!(validate_pack(&no_id), Err(PackError::EmptyId));
        let mut no_entry = pack();
        no_entry.entry = "".into();
        assert_eq!(validate_pack(&no_entry), Err(PackError::EmptyEntry));
    }

    #[test]
    fn no_profile_fails_closed_through_the_pack_layer() {
        assert!(matches!(
            plan_run(&pack(), "/p", None),
            Err(PackError::Sandbox(_))
        ));
    }

    #[test]
    fn structured_result_semantics() {
        let ok = RunResult { exit_code: 0, stdout: "42".into(), stderr: "".into(), truncated: false };
        assert!(ok.succeeded());
        let failed = RunResult { exit_code: 1, stdout: "".into(), stderr: "boom".into(), truncated: false };
        assert!(!failed.succeeded());
    }
}
