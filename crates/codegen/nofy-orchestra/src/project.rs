//! `.nofy/project.toml` discovery + pack resolution (FR11.1).
//!
//! Convention: a project root carries `.nofy/project.toml` (the
//! orchestration manifest — packs list + task DAG) and `.nofy/packs/<id>.toml`
//! for every pack the manifest references. Loading is fail-loud: a missing
//! pack file, a malformed manifest, or a pack that violates the boundary
//! invariants (DS-P4 host-plane leak, DS-P2 root-realm service) is an
//! error at LOAD time, never at first use.

use std::fs;
use std::path::{Path, PathBuf};

use crate::orchestra::{ManifestError, ProjectManifest};
use nofy_packcore::{PackError, PackManifest, parse_pack};

/// The conventional manifest path under a project root.
pub fn project_manifest_path(root: &Path) -> PathBuf {
    root.join(".nofy").join("project.toml")
}

/// The conventional pack directory under a project root.
pub fn packs_dir(root: &Path) -> PathBuf {
    root.join(".nofy").join("packs")
}

#[derive(Debug, PartialEq, Eq)]
pub enum ProjectError {
    /// `.nofy/project.toml` missing.
    MissingManifest,
    Io(String),
    Manifest(ManifestError),
    /// A pack listed in the manifest has no `.nofy/packs/<id>.toml`.
    MissingPack { id: String },
    /// A pack file failed the boundary validator.
    Pack { id: String, error: PackError },
    /// Pack file's own id does not match its filename/listing.
    IdMismatch { listed: String, declared: String },
}

/// A loaded project: validated manifest + resolved pack manifests.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Project {
    pub manifest: ProjectManifest,
    pub packs: Vec<PackManifest>,
}

impl Project {
    /// Look up one resolved pack by id.
    pub fn pack(&self, id: &str) -> Option<&PackManifest> {
        self.packs.iter().find(|p| p.id == id)
    }
}

/// Load and validate a project from its root directory.
pub fn load_project(root: &Path) -> Result<Project, ProjectError> {
    let manifest_path = project_manifest_path(root);
    let text = fs::read_to_string(&manifest_path).map_err(|err| {
        if err.kind() == std::io::ErrorKind::NotFound {
            ProjectError::MissingManifest
        } else {
            ProjectError::Io(err.to_string())
        }
    })?;
    let manifest = ProjectManifest::from_toml(&text).map_err(ProjectError::Manifest)?;

    let mut packs = Vec::new();
    for id in &manifest.packs {
        let pack_path = packs_dir(root).join(format!("{id}.toml"));
        let pack_text = fs::read_to_string(&pack_path).map_err(|err| {
            if err.kind() == std::io::ErrorKind::NotFound {
                ProjectError::MissingPack { id: id.clone() }
            } else {
                ProjectError::Io(err.to_string())
            }
        })?;
        let value: toml::Value = toml::from_str(&pack_text)
            .map_err(|_| ProjectError::Pack {
                id: id.clone(),
                error: PackError::HostPlaneLeak {
                    key: "<malformed pack toml>".into(),
                },
            })?;
        let json = serde_json::to_value(&value).expect("toml→json conversion");
        let pack = parse_pack(&json).map_err(|error| ProjectError::Pack {
            id: id.clone(),
            error,
        })?;
        if pack.id != *id {
            return Err(ProjectError::IdMismatch {
                listed: id.clone(),
                declared: pack.id,
            });
        }
        packs.push(pack);
    }
    Ok(Project { manifest, packs })
}

#[cfg(test)]
mod tests {
    use super::*;

    const PROJECT_TOML: &str = r#"
packs = ["reviewer", "writer"]
on_fail = "escalate"
parallel = 1

[[task]]
id = "review"
pack = "reviewer"
goal = "review the branch"

[[task]]
id = "write"
pack = "writer"
goal = "write the report"
needs = ["review"]
"#;

    fn reviewer_toml() -> String {
        r#"
id = "reviewer"
persona = "You review code."
skills = ["diff-read"]
tool_policy = "strict"
"#
        .into()
    }

    fn writer_toml() -> String {
        r#"
id = "writer"
persona = "You write reports."
"#
        .into()
    }

    fn fixture(root: &Path) {
        fs::create_dir_all(packs_dir(root)).unwrap();
        fs::write(project_manifest_path(root), PROJECT_TOML).unwrap();
        fs::write(packs_dir(root).join("reviewer.toml"), reviewer_toml()).unwrap();
        fs::write(packs_dir(root).join("writer.toml"), writer_toml()).unwrap();
    }

    #[test]
    fn loads_manifest_and_resolves_packs() {
        let dir = tempfile::tempdir().unwrap();
        fixture(dir.path());
        let project = load_project(dir.path()).unwrap();
        assert_eq!(project.manifest.task.len(), 2);
        assert_eq!(project.packs.len(), 2);
        assert_eq!(project.pack("reviewer").unwrap().skills, vec!["diff-read"]);
        assert_eq!(project.pack("writer").unwrap().persona, "You write reports.");
        assert!(project.pack("ghost").is_none());
    }

    #[test]
    fn missing_manifest_is_fail_loud() {
        let dir = tempfile::tempdir().unwrap();
        assert_eq!(load_project(dir.path()), Err(ProjectError::MissingManifest));
    }

    #[test]
    fn missing_pack_file_is_fail_loud() {
        let dir = tempfile::tempdir().unwrap();
        fixture(dir.path());
        fs::remove_file(packs_dir(dir.path()).join("writer.toml")).unwrap();
        assert_eq!(
            load_project(dir.path()),
            Err(ProjectError::MissingPack { id: "writer".into() })
        );
    }

    #[test]
    fn host_plane_leak_in_pack_fails_at_load() {
        let dir = tempfile::tempdir().unwrap();
        fixture(dir.path());
        // DS-P4: a pack declaring sandbox policy is rejected at LOAD.
        fs::write(
            packs_dir(dir.path()).join("writer.toml"),
            "id = \"writer\"\npersona = \"p\"\nsandbox_policy = \"strict\"\n",
        )
        .unwrap();
        match load_project(dir.path()) {
            Err(ProjectError::Pack { id, error: PackError::HostPlaneLeak { key } }) => {
                assert_eq!(id, "writer");
                assert_eq!(key, "sandbox_policy");
            }
            other => panic!("expected host-plane leak, got {other:?}"),
        }
    }

    #[test]
    fn pack_id_mismatch_is_fail_loud() {
        let dir = tempfile::tempdir().unwrap();
        fixture(dir.path());
        fs::write(
            packs_dir(dir.path()).join("writer.toml"),
            "id = \"impostor\"\npersona = \"p\"\n",
        )
        .unwrap();
        assert_eq!(
            load_project(dir.path()),
            Err(ProjectError::IdMismatch {
                listed: "writer".into(),
                declared: "impostor".into()
            })
        );
    }

    #[test]
    fn invalid_dag_is_fail_loud() {
        let dir = tempfile::tempdir().unwrap();
        fixture(dir.path());
        fs::write(
            project_manifest_path(dir.path()),
            PROJECT_TOML.replace("needs = [\"review\"]", "needs = [\"ghost\"]"),
        )
        .unwrap();
        assert!(matches!(
            load_project(dir.path()),
            Err(ProjectError::Manifest(ManifestError::DanglingNeed { .. }))
        ));
    }
}
