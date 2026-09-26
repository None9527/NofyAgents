//! ACP extension handlers for the bundled subagent cache (status + entry read).
//!
//! These endpoints operate on the on-disk bundled cache only.
use super::{ExtResult, parse_params, to_ext_response};
use crate::agent::MvpAgent;
use crate::bundle::{self, BundleManifest};
use agent_client_protocol as acp;
use anyhow::Context;
use nofy_tools::implementations::skills::discovery::extract_first_paragraph;
use serde::{Deserialize, Serialize};
use std::path::Path;
#[derive(Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
struct BundleStatusRequest {}
#[derive(Debug, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct BundleStatusResult {
    pub has_cache: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub version: Option<String>,
    pub personas: Vec<String>,
    pub roles: Vec<String>,
    pub agents: Vec<String>,
    pub skills: Vec<String>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub persona_details: Vec<PersonaDetail>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub role_details: Vec<RoleDetail>,
}
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct PersonaDetail {
    pub name: String,
    pub description: Option<String>,
    pub has_inputs: bool,
    pub has_outputs: bool,
}
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct RoleDetail {
    pub name: String,
    pub description: String,
}
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct EntryGetRequest {
    kind: String,
    name: String,
}
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EntryGetResult {
    pub kind: String,
    pub name: String,
    pub content: String,
}
pub async fn handle(agent: &MvpAgent, args: &acp::ExtRequest) -> ExtResult {
    let _ = agent;
    match args.method.as_ref() {
        "nofy/bundle/status" => {
            let _req: BundleStatusRequest = parse_params(args)?;
            to_ext_response(status_bundle())
        }
        "nofy/bundle/entry/get" => {
            let req: EntryGetRequest = parse_params(args)?;
            to_ext_response(get_entry(&req.kind, &req.name))
        }
        _ => Err(acp::Error::method_not_found()),
    }
}
fn get_entry(kind: &str, name: &str) -> anyhow::Result<EntryGetResult> {
    get_entry_at(&bundle::bundled_root(), kind, name)
}
fn validate_entry_name(name: &str) -> anyhow::Result<()> {
    if name.is_empty()
        || name.contains('/')
        || name.contains('\\')
        || name.contains("..")
        || name == "."
    {
        anyhow::bail!("invalid entry name: {name}");
    }
    Ok(())
}
fn get_entry_at(root: &Path, kind: &str, name: &str) -> anyhow::Result<EntryGetResult> {
    validate_entry_name(name)?;
    let (dir_name, ext) = match kind {
        "persona" => ("personas", "toml"),
        "role" => ("roles", "toml"),
        "agent" => ("agents", "md"),
        _ => anyhow::bail!("unknown entry kind: {kind}"),
    };
    let path = root.join(dir_name).join(format!("{name}.{ext}"));
    let content = std::fs::read_to_string(&path)
        .with_context(|| format!("{kind} '{name}' not found in bundle cache"))?;
    Ok(EntryGetResult {
        kind: kind.to_owned(),
        name: name.to_owned(),
        content,
    })
}
fn status_bundle() -> anyhow::Result<BundleStatusResult> {
    status_bundle_at(&bundle::bundled_root())
}
fn status_bundle_at(root: &Path) -> anyhow::Result<BundleStatusResult> {
    let Some(manifest) = bundle::read_cached_manifest(root)? else {
        return Ok(BundleStatusResult {
            has_cache: false,
            version: None,
            personas: Vec::new(),
            roles: Vec::new(),
            agents: Vec::new(),
            skills: Vec::new(),
            persona_details: Vec::new(),
            role_details: Vec::new(),
        });
    };
    let personas = list_cached_entries(root, &manifest, "personas", "toml");
    let roles = list_cached_entries(root, &manifest, "roles", "toml");
    let agents = list_cached_entries(root, &manifest, "agents", "md");
    let skills = list_cached_skill_entries(root, &manifest);
    let persona_details = personas
        .iter()
        .filter_map(|name| persona_detail_from_toml(name, root))
        .collect();
    let role_details = roles
        .iter()
        .filter_map(|name| role_detail_from_toml(name, root))
        .collect();
    Ok(BundleStatusResult {
        has_cache: true,
        version: Some(manifest.version.clone()),
        personas,
        roles,
        agents,
        skills,
        persona_details,
        role_details,
    })
}
fn persona_detail_from_toml(name: &str, root: &Path) -> Option<PersonaDetail> {
    let path = root.join("personas").join(format!("{name}.toml"));
    let content = std::fs::read_to_string(&path).ok()?;
    let table: toml::Value = toml::from_str(&content).ok()?;
    let desc = table
        .get("description")
        .and_then(|v| v.as_str())
        .filter(|s| !s.trim().is_empty())
        .map(str::to_owned)
        .or_else(|| {
            table
                .get("instructions")
                .and_then(|v| v.as_str())
                .and_then(extract_first_paragraph)
        });
    let has_inputs = table
        .get("inputs")
        .and_then(|v| v.as_array())
        .is_some_and(|a| !a.is_empty());
    let has_outputs = table
        .get("outputs")
        .and_then(|v| v.as_array())
        .is_some_and(|a| !a.is_empty());
    Some(PersonaDetail {
        name: name.to_owned(),
        description: desc,
        has_inputs,
        has_outputs,
    })
}
fn role_detail_from_toml(name: &str, root: &Path) -> Option<RoleDetail> {
    let path = root.join("roles").join(format!("{name}.toml"));
    let content = std::fs::read_to_string(&path).ok()?;
    let table: toml::Value = toml::from_str(&content).ok()?;
    let desc = table
        .get("description")
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .to_owned();
    Some(RoleDetail {
        name: name.to_owned(),
        description: desc,
    })
}
fn list_cached_entries(
    root: &Path,
    manifest: &BundleManifest,
    dir_name: &str,
    extension: &str,
) -> Vec<String> {
    let dir = root.join(dir_name);
    let Ok(entries) = std::fs::read_dir(&dir) else {
        return Vec::new();
    };
    let mut names: Vec<String> = entries
        .flatten()
        .filter_map(|entry| {
            let path = entry.path();
            if !path.is_file() {
                return None;
            }
            let file_name = path.file_name()?.to_str()?;
            let relative_path = format!("{dir_name}/{file_name}");
            if !manifest.checksums.contains_key(&relative_path) {
                return None;
            }
            match path.extension().and_then(|ext| ext.to_str()) {
                Some(ext) if ext == extension => path
                    .file_stem()
                    .and_then(|stem| stem.to_str())
                    .map(ToOwned::to_owned),
                _ => None,
            }
        })
        .collect();
    names.sort();
    names
}
fn list_cached_skill_entries(root: &Path, manifest: &BundleManifest) -> Vec<String> {
    let prefix = "skills/";
    let mut names: Vec<String> = manifest
        .checksums
        .keys()
        .filter_map(|k| {
            let name = k.strip_prefix(prefix)?.strip_suffix("/SKILL.md")?;
            root.join(k).is_file().then(|| name.to_owned())
        })
        .collect();
    names.sort();
    names
}
#[cfg(test)]
mod tests {
    use super::*;
    use serial_test::serial;
    use tempfile::TempDir;

    const RESEARCHER_TOML: &str = concat!(
        "instructions = \"You are a thorough researcher.\\nDig deep.\"
",
        "[[inputs]]
name = \"topic\"
",
        "[[outputs]]
name = \"report\"
",
    );
    const REVIEWER_TOML: &str = "description = \"Meticulous code reviewer\"
";
    const DEFAULT_AGENT_MD: &str = "# agent
";

    /// Seed a bundled cache the way a sync once did: files + manifest.
    fn seed_cache(root: &Path) {
        seed_cache_with_skills(root, &[]);
    }

    fn seed_cache_with_skills(root: &Path, skills: &[(&str, &str)]) {
        let files: Vec<(&str, &str)> = vec![
            ("personas/researcher.toml", RESEARCHER_TOML),
            ("roles/reviewer.toml", REVIEWER_TOML),
            ("agents/default.md", DEFAULT_AGENT_MD),
        ];
        let mut checksums = serde_json::Map::new();
        for (relative_path, content) in files.iter().chain(skills.iter()) {
            let absolute = root.join(relative_path);
            if let Some(parent) = absolute.parent() {
                std::fs::create_dir_all(parent).unwrap();
            }
            std::fs::write(&absolute, content).unwrap();
            checksums.insert(
                (*relative_path).to_string(),
                serde_json::Value::String("test-checksum".to_string()),
            );
        }
        std::fs::create_dir_all(root).unwrap();
        let manifest = serde_json::json!({
            "version": "bundle-v1",
            "checksums": checksums,
        });
        std::fs::write(root.join("manifest.json"), manifest.to_string()).unwrap();
    }

    #[test]
    #[serial]
    fn status_reports_no_cache_when_manifest_missing() {
        let tmp = TempDir::new().unwrap();
        let root = tmp.path().join("bundled");
        let status = status_bundle_at(&root).unwrap();
        assert_eq!(
            status,
            BundleStatusResult {
                has_cache: false,
                version: None,
                personas: vec![],
                roles: vec![],
                agents: vec![],
                skills: vec![],
                persona_details: vec![],
                role_details: vec![],
            }
        );
    }

    #[test]
    #[serial]
    fn status_reports_cached_entries_from_manifest_and_disk() {
        let tmp = TempDir::new().unwrap();
        let root = tmp.path().join("bundled");
        seed_cache(&root);
        std::fs::write(
            root.join("personas/local-only.toml"),
            "instructions = \"ignore\"",
        )
        .unwrap();
        let status = status_bundle_at(&root).unwrap();
        assert!(status.has_cache);
        assert_eq!(status.version.as_deref(), Some("bundle-v1"));
        assert_eq!(status.personas, vec!["researcher"]);
        assert_eq!(status.roles, vec!["reviewer"]);
        assert_eq!(status.agents, vec!["default"]);
        assert_eq!(status.skills, Vec::<String>::new());
    }

    #[test]
    #[serial]
    fn status_only_reports_bundled_cache_not_higher_priority_sources() {
        let tmp = TempDir::new().unwrap();
        let root = tmp.path().join("bundled");
        seed_cache(&root);
        let project_root = tmp.path().join("workspace");
        std::fs::create_dir_all(project_root.join(".nofy/personas")).unwrap();
        std::fs::create_dir_all(project_root.join(".nofy/roles")).unwrap();
        std::fs::write(
            project_root.join(".nofy/personas/researcher.toml"),
            "instructions = \"project persona\"
",
        )
        .unwrap();
        std::fs::write(
            project_root.join(".nofy/roles/reviewer.toml"),
            "description = \"project role\"
",
        )
        .unwrap();
        let base = crate::config::SubagentsConfig::resolve_base_with_sources(
            false,
            &toml::Value::Table(Default::default()),
            None,
            &root,
        );
        let (roles, personas) = crate::config::SubagentsConfig::effective_definition_maps(
            &base.roles,
            &base.personas,
            &project_root,
            true,
        );
        assert_eq!(
            personas
                .get("researcher")
                .and_then(|persona| persona.instructions.as_deref()),
            Some("project persona")
        );
        assert_eq!(
            roles.get("reviewer").map(|role| role.description.as_str()),
            Some("project role")
        );
        let status = status_bundle_at(&root).unwrap();
        assert_eq!(status.personas, vec!["researcher"]);
        assert_eq!(status.roles, vec!["reviewer"]);
        assert_eq!(status.agents, vec!["default"]);
        assert_eq!(status.skills, Vec::<String>::new());
    }

    #[test]
    #[serial]
    fn get_entry_reads_persona_file() {
        let tmp = TempDir::new().unwrap();
        let root = tmp.path().join("bundled");
        seed_cache(&root);
        let result = get_entry_at(&root, "persona", "researcher").unwrap();
        assert_eq!(result.kind, "persona");
        assert_eq!(result.name, "researcher");
        assert!(result.content.contains("instructions"));
    }

    #[test]
    #[serial]
    fn get_entry_unknown_kind_returns_error() {
        let tmp = TempDir::new().unwrap();
        let root = tmp.path().join("bundled");
        let err = get_entry_at(&root, "widget", "foo").unwrap_err();
        assert!(err.to_string().contains("unknown entry kind: widget"));
    }

    #[test]
    #[serial]
    fn get_entry_missing_file_returns_error() {
        let tmp = TempDir::new().unwrap();
        let root = tmp.path().join("bundled");
        seed_cache(&root);
        let err = get_entry_at(&root, "persona", "nonexistent").unwrap_err();
        assert!(err.to_string().contains("not found in bundle cache"));
    }

    #[test]
    fn get_entry_rejects_path_traversal() {
        let tmp = TempDir::new().unwrap();
        let root = tmp.path().join("bundled");
        for bad_name in ["../../../etc/passwd", "foo/bar", "a\\b", "..", "."] {
            let err = get_entry_at(&root, "persona", bad_name).unwrap_err();
            assert!(
                err.to_string().contains("invalid entry name"),
                "expected rejection for {bad_name:?}, got: {err}"
            );
        }
    }

    #[test]
    fn get_entry_rejects_empty_name() {
        let tmp = TempDir::new().unwrap();
        let root = tmp.path().join("bundled");
        let err = get_entry_at(&root, "persona", "").unwrap_err();
        assert!(err.to_string().contains("invalid entry name"));
    }

    #[test]
    #[serial]
    fn status_includes_persona_and_role_details() {
        let tmp = TempDir::new().unwrap();
        let root = tmp.path().join("bundled");
        seed_cache(&root);
        let status = status_bundle_at(&root).unwrap();
        assert_eq!(status.persona_details.len(), 1);
        let pd = &status.persona_details[0];
        assert_eq!(pd.name, "researcher");
        assert_eq!(
            pd.description.as_deref(),
            Some("You are a thorough researcher. Dig deep.")
        );
        assert!(pd.has_inputs);
        assert!(pd.has_outputs);
        assert_eq!(status.role_details.len(), 1);
        let rd = &status.role_details[0];
        assert_eq!(rd.name, "reviewer");
        assert_eq!(rd.description, "Meticulous code reviewer");
    }

    #[test]
    #[serial]
    fn status_without_toml_files_returns_empty_details() {
        let tmp = TempDir::new().unwrap();
        let root = tmp.path().join("bundled");
        seed_cache(&root);
        std::fs::remove_file(root.join("personas/researcher.toml")).unwrap();
        let status = status_bundle_at(&root).unwrap();
        assert!(status.personas.is_empty());
        assert!(status.persona_details.is_empty());
    }

    #[test]
    fn malformed_toml_skipped_gracefully() {
        let tmp = TempDir::new().unwrap();
        let root = tmp.path().join("cache");
        std::fs::create_dir_all(root.join("personas")).unwrap();
        std::fs::write(root.join("personas/bad.toml"), "{{{{not toml").unwrap();
        assert!(persona_detail_from_toml("bad", &root).is_none());
    }

    #[test]
    fn persona_detail_without_inputs_outputs() {
        let tmp = TempDir::new().unwrap();
        let root = tmp.path();
        std::fs::create_dir_all(root.join("personas")).unwrap();
        std::fs::write(
            root.join("personas/simple.toml"),
            "instructions = \"Just a simple persona\"",
        )
        .unwrap();
        let detail = persona_detail_from_toml("simple", root).unwrap();
        assert_eq!(detail.name, "simple");
        assert_eq!(detail.description.as_deref(), Some("Just a simple persona"));
        assert!(!detail.has_inputs);
        assert!(!detail.has_outputs);
    }

    #[test]
    fn role_detail_missing_description_defaults_empty() {
        let tmp = TempDir::new().unwrap();
        let root = tmp.path();
        std::fs::create_dir_all(root.join("roles")).unwrap();
        std::fs::write(root.join("roles/bare.toml"), "instructions = \"hi\"").unwrap();
        let detail = role_detail_from_toml("bare", root).unwrap();
        assert_eq!(detail.name, "bare");
        assert_eq!(detail.description, "");
    }

    #[test]
    #[serial]
    fn status_lists_skill_names_from_manifest() {
        let tmp = TempDir::new().unwrap();
        let root = tmp.path().join("bundled");
        seed_cache_with_skills(
            &root,
            &[
                (
                    "skills/commit/SKILL.md",
                    "# Commit skill
",
                ),
                (
                    "skills/review/SKILL.md",
                    "# Review skill
",
                ),
            ],
        );
        let status = status_bundle_at(&root).unwrap();
        assert!(status.has_cache);
        assert_eq!(status.skills, vec!["commit", "review"]);
        assert_eq!(status.personas, vec!["researcher"]);
    }

    #[test]
    #[serial]
    fn status_skills_only_lists_files_present_on_disk() {
        let tmp = TempDir::new().unwrap();
        let root = tmp.path().join("bundled");
        seed_cache_with_skills(
            &root,
            &[
                (
                    "skills/commit/SKILL.md",
                    "# Commit skill
",
                ),
                (
                    "skills/review/SKILL.md",
                    "# Review skill
",
                ),
            ],
        );
        std::fs::remove_file(root.join("skills/commit/SKILL.md")).unwrap();
        let status = status_bundle_at(&root).unwrap();
        assert_eq!(status.skills, vec!["review"]);
    }
}
