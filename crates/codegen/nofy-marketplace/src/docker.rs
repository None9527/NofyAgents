//! Docker build-arg plugin subsets (FR8.5, OC-F26).
//!
//! A plugin may ship as a Docker build-arg SUBSET: only a declared set of
//! build args may be injected at build time. Undeclared args are refused
//! (fail-closed) — the build surface cannot be widened by a plugin.

use std::collections::BTreeSet;

/// The declared subset for one plugin.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DockerPluginSubset {
    pub plugin_id: String,
    /// The only build args this plugin may set.
    pub allowed_build_args: BTreeSet<String>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum BuildArgError {
    /// An arg outside the declared subset.
    Undeclared(String),
    /// Empty arg name.
    EmptyName,
}

/// Resolve a build-arg request against the subset. All-or-nothing: one
/// undeclared arg refuses the whole request.
pub fn resolve_build_args(
    subset: &DockerPluginSubset,
    requested: &[(String, String)],
) -> Result<Vec<(String, String)>, BuildArgError> {
    let mut resolved = Vec::new();
    for (name, value) in requested {
        if name.trim().is_empty() {
            return Err(BuildArgError::EmptyName);
        }
        if !subset.allowed_build_args.contains(name) {
            return Err(BuildArgError::Undeclared(name.clone()));
        }
        resolved.push((name.clone(), value.clone()));
    }
    Ok(resolved)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn subset() -> DockerPluginSubset {
        DockerPluginSubset {
            plugin_id: "linter".into(),
            allowed_build_args: ["LINTER_VERSION".into(), "RULES_URL".into()]
                .into_iter()
                .collect(),
        }
    }

    #[test]
    fn declared_args_resolve() {
        let resolved =
            resolve_build_args(&subset(), &[("LINTER_VERSION".into(), "2.1".into())]).unwrap();
        assert_eq!(resolved, vec![("LINTER_VERSION".into(), "2.1".into())]);
    }

    #[test]
    fn undeclared_arg_refuses_the_whole_request() {
        let result = resolve_build_args(
            &subset(),
            &[
                ("LINTER_VERSION".into(), "2.1".into()),
                ("PRIVILEGED".into(), "true".into()),
            ],
        );
        assert_eq!(result, Err(BuildArgError::Undeclared("PRIVILEGED".into())));
    }

    #[test]
    fn empty_name_refused() {
        assert_eq!(
            resolve_build_args(&subset(), &[("  ".into(), "x".into())]),
            Err(BuildArgError::EmptyName)
        );
    }

    #[test]
    fn empty_request_resolves_empty() {
        assert_eq!(resolve_build_args(&subset(), &[]).unwrap(), vec![]);
    }
}
