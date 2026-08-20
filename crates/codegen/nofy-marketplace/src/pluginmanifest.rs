//! Plugin manifests + build-artifact isolation zones (FR8.4, OC-F25).
//!
//! A plugin DECLARES itself (id, version, capabilities, artifacts) and
//! its build artifacts land in an ISOLATION ZONE — a bounded set of paths
//! that can never reach outside itself. Admission is fail-loud: an
//! undeclared or escaping artifact is refused at the gate.

use std::collections::BTreeSet;

/// One plugin manifest.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PluginManifest {
    pub id: String,
    pub version: String,
    pub capabilities: Vec<String>,
    /// Declared artifact paths (relative to the zone root).
    pub artifacts: Vec<String>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ManifestError {
    EmptyField(String),
    /// Artifact path escapes the isolation zone.
    ArtifactEscape(String),
}

/// Validate a manifest.
pub fn validate_manifest(manifest: &PluginManifest) -> Result<(), ManifestError> {
    for (name, value) in [("id", &manifest.id), ("version", &manifest.version)] {
        if value.trim().is_empty() {
            return Err(ManifestError::EmptyField(name.to_string()));
        }
    }
    if manifest.capabilities.is_empty() {
        return Err(ManifestError::EmptyField("capabilities".into()));
    }
    for artifact in &manifest.artifacts {
        if artifact.split('/').any(|seg| seg == "..") || artifact.starts_with('/') {
            return Err(ManifestError::ArtifactEscape(artifact.clone()));
        }
    }
    Ok(())
}

/// The isolation zone: the set of admitted artifact paths.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct IsolationZone {
    admitted: BTreeSet<String>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum AdmitError {
    /// The artifact is not declared in the manifest.
    Undeclared(String),
    /// The artifact escapes the zone.
    Escape(String),
}

impl IsolationZone {
    /// Admit one artifact: it must be declared AND stay inside the zone.
    pub fn admit(&mut self, manifest: &PluginManifest, path: &str) -> Result<(), AdmitError> {
        if path.split('/').any(|seg| seg == "..") || path.starts_with('/') {
            return Err(AdmitError::Escape(path.to_string()));
        }
        if !manifest.artifacts.iter().any(|a| a == path) {
            return Err(AdmitError::Undeclared(path.to_string()));
        }
        self.admitted.insert(path.to_string());
        Ok(())
    }

    pub fn contains(&self, path: &str) -> bool {
        self.admitted.contains(path)
    }

    pub fn len(&self) -> usize {
        self.admitted.len()
    }

    pub fn is_empty(&self) -> bool {
        self.admitted.is_empty()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn manifest() -> PluginManifest {
        PluginManifest {
            id: "linter".into(),
            version: "1.0.0".into(),
            capabilities: vec!["lint".into()],
            artifacts: vec!["bin/linter".into(), "rules/default.json".into()],
        }
    }

    #[test]
    fn manifest_validation_fails_loud() {
        let mut bad = manifest();
        bad.capabilities = vec![];
        assert_eq!(validate_manifest(&bad), Err(ManifestError::EmptyField("capabilities".into())));
        let mut escaping = manifest();
        escaping.artifacts.push("../outside".into());
        assert_eq!(
            validate_manifest(&escaping),
            Err(ManifestError::ArtifactEscape("../outside".into()))
        );
        assert!(validate_manifest(&manifest()).is_ok());
    }

    #[test]
    fn empty_id_or_version_refused() {
        let mut no_id = manifest();
        no_id.id = "  ".into();
        assert_eq!(validate_manifest(&no_id), Err(ManifestError::EmptyField("id".into())));
        let mut no_version = manifest();
        no_version.version = "".into();
        assert_eq!(validate_manifest(&no_version), Err(ManifestError::EmptyField("version".into())));
    }

    #[test]
    fn declared_artifacts_admit() {
        let mut zone = IsolationZone::default();
        zone.admit(&manifest(), "bin/linter").unwrap();
        zone.admit(&manifest(), "rules/default.json").unwrap();
        assert_eq!(zone.len(), 2);
        assert!(zone.contains("bin/linter"));
    }

    #[test]
    fn undeclared_artifacts_refused() {
        let mut zone = IsolationZone::default();
        assert_eq!(zone.admit(&manifest(), "bin/extra"), Err(AdmitError::Undeclared("bin/extra".into())));
        assert!(zone.is_empty());
    }

    #[test]
    fn escaping_artifacts_refused_even_if_declared() {
        let mut manifest = manifest();
        manifest.artifacts.push("../../etc/passwd".into());
        let mut zone = IsolationZone::default();
        assert_eq!(
            zone.admit(&manifest, "../../etc/passwd"),
            Err(AdmitError::Escape("../../etc/passwd".into()))
        );
        assert!(zone.is_empty(), "the zone must stay bounded");
    }
}
