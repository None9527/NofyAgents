//! Expert-pack composition boundaries (PRD FR10, DS-P2/DS-P4 translated).
//!
//! A pack is a converged subagent unit: persona + skills + connectors +
//! delegation roster. Two invariants keep multi-pack daemons sane:
//!
//! - **DS-P4 plane ownership**: a pack carries ONLY model-facing composition.
//!   Host-plane concerns (sandbox policy, approval policy, persistence, the
//!   registries themselves) are declared in the host composition; a pack
//!   manifest that mentions them is a misconfiguration and fails loud at
//!   load, never silently at first use.
//! - **DS-P2 isolate realms**: every pack's published services live in that
//!   pack's own realm. Same service name across two packs is fine (distinct
//!   realms); a second registration inside ONE realm is a leak/collision and
//!   is rejected at composition, mirroring dsh's `provide()`-throws semantics
//!   and its `leakedServices` load-time detection.

use std::collections::{HashMap, HashSet};

use serde::{Deserialize, Serialize};

/// Keys that belong to the HOST plane. Presence in a pack manifest is a
/// misconfiguration (DS-P4): fail loud at load.
pub const HOST_PLANE_KEYS: &[&str] = &[
    "sandbox",
    "sandbox_policy",
    "approval",
    "approval_policy",
    "persistence",
    "session_store",
    "tool_registry",
];

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ServiceDecl {
    pub name: String,
    /// `isolated` (default, pack-private realm) or `root` (host plane).
    /// Packs may only declare isolated services.
    #[serde(default = "default_realm")]
    pub realm: Realm,
}

fn default_realm() -> Realm {
    Realm::Isolated
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Realm {
    Isolated,
    Root,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct McpRef {
    pub name: String,
    #[serde(default)]
    pub transport: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SubagentRef {
    pub id: String,
    /// Another pack id or an external provider (ACP expert).
    pub provider: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PackManifest {
    pub id: String,
    pub persona: String,
    #[serde(default)]
    pub skills: Vec<String>,
    #[serde(default)]
    pub mcp: Vec<McpRef>,
    #[serde(default)]
    pub tool_policy: String,
    #[serde(default)]
    pub model_route: Option<String>,
    #[serde(default)]
    pub subagents: Vec<SubagentRef>,
    #[serde(default)]
    pub services: Vec<ServiceDecl>,
}

#[derive(Debug, PartialEq, Eq)]
pub enum PackError {
    /// Pack manifest declares a host-plane concern (DS-P4).
    HostPlaneLeak { key: String },
    /// A pack declares a service in the root realm (DS-P2).
    RootRealmService { pack: String, service: String },
    /// Duplicate service name inside one pack's realm.
    RealmCollision { pack: String, service: String },
}

/// Parse a pack manifest from raw JSON, enforcing DS-P4 plane ownership.
/// Unknown keys are tolerated (forward-compat) EXCEPT the host-plane set.
pub fn parse_pack(raw: &serde_json::Value) -> Result<PackManifest, PackError> {
    if let Some(obj) = raw.as_object() {
        for key in HOST_PLANE_KEYS {
            if obj.contains_key(*key) {
                return Err(PackError::HostPlaneLeak {
                    key: (*key).to_string(),
                });
            }
        }
    }
    let manifest: PackManifest =
        serde_json::from_value(raw.clone()).map_err(|_| PackError::HostPlaneLeak {
            key: "<malformed manifest>".into(),
        })?;
    for svc in &manifest.services {
        if svc.realm == Realm::Root {
            return Err(PackError::RootRealmService {
                pack: manifest.id.clone(),
                service: svc.name.clone(),
            });
        }
    }
    Ok(manifest)
}

/// Compose several packs into one daemon: each pack gets its own realm;
/// collisions are only possible within a realm (DS-P2).
pub fn compose_packs(packs: &[PackManifest]) -> Result<RealmMap, PackError> {
    let mut map = RealmMap::default();
    for pack in packs {
        let mut seen: HashSet<&str> = HashSet::new();
        for svc in &pack.services {
            if !seen.insert(&svc.name) {
                return Err(PackError::RealmCollision {
                    pack: pack.id.clone(),
                    service: svc.name.clone(),
                });
            }
            map.provide(&pack.id, &svc.name)?;
        }
    }
    Ok(map)
}

/// realm (pack id) → published service names.
#[derive(Debug, Default)]
pub struct RealmMap {
    realms: HashMap<String, HashSet<String>>,
}

impl RealmMap {
    fn provide(&mut self, realm: &str, service: &str) -> Result<(), PackError> {
        let entry = self.realms.entry(realm.to_string()).or_default();
        if !entry.insert(service.to_string()) {
            return Err(PackError::RealmCollision {
                pack: realm.to_string(),
                service: service.to_string(),
            });
        }
        Ok(())
    }

    pub fn realms(&self) -> usize {
        self.realms.len()
    }

    pub fn services_in(&self, realm: &str) -> usize {
        self.realms.get(realm).map(|s| s.len()).unwrap_or(0)
    }
}

/// Built-in packs shipped with the daemon. `file-steward` (PRD FR12): the
/// OS-level file understanding/management expert. It carries ONLY
/// model-facing composition — roots/policy live in the host plane and are
/// injected at join time by the provider (DS-P4).
pub fn builtin_packs() -> Vec<PackManifest> {
    vec![PackManifest {
        id: "file-steward".into(),
        persona: "You are the file steward: you understand, organize and \
                  maintain the user's opted-in file roots. You propose \
                  changes as reviewed batches; you never delete — you \
                  move to trash. Index hints are suggestions; the disk is \
                  truth and every operation re-validates against it."
            .into(),
        skills: vec![
            "find".into(),
            "organize".into(),
            "summarize".into(),
            "cleanup".into(),
            "dedupe".into(),
        ],
        mcp: Vec::new(),
        tool_policy: "strict".into(),
        model_route: None,
        subagents: Vec::new(),
        services: vec![ServiceDecl {
            name: "fs-index".into(),
            realm: Realm::Isolated,
        }],
    }]
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn pack(id: &str, services: &[&str]) -> serde_json::Value {
        json!({
            "id": id,
            "persona": format!("{id} expert"),
            "skills": ["find"],
            "services": services.iter().map(|s| json!({"name": s})).collect::<Vec<_>>(),
        })
    }

    #[test]
    fn builtin_file_steward_passes_its_own_invariants() {
        for pack in builtin_packs() {
            // Serialized built-in must round-trip through the same validator
            // third-party packs face (no special-casing).
            let raw = serde_json::to_value(&pack).unwrap();
            let parsed = parse_pack(&raw).expect("built-in pack must be legal");
            compose_packs(&[parsed.clone()]).expect("built-in composes");
            assert_eq!(parsed.tool_policy, "strict");
            assert!(
                parsed.services.iter().all(|s| s.realm == Realm::Isolated),
                "built-in services stay isolated"
            );
        }
    }

    #[test]
    fn host_plane_key_fails_loud_at_load() {
        let mut raw = pack("sec", &["scanner"]);
        raw["sandbox_policy"] = json!({"mode": "strict"});
        assert_eq!(
            parse_pack(&raw),
            Err(PackError::HostPlaneLeak {
                key: "sandbox_policy".into()
            })
        );
    }

    #[test]
    fn root_realm_service_rejected() {
        let raw = json!({
            "id": "evil",
            "persona": "p",
            "services": [{"name": "tool_registry", "realm": "root"}],
        });
        // realm=root is rejected even though the name itself is not in the
        // host-plane key list check order (both guards fire; root-realm here).
        assert!(matches!(
            parse_pack(&raw),
            Err(PackError::RootRealmService { .. }) | Err(PackError::HostPlaneLeak { .. })
        ));
    }

    #[test]
    fn malformed_manifest_fails_loud_not_silent() {
        // A payload that cannot deserialize is a load-time refusal with the
        // malformed marker — never a panic, never a silent default.
        assert_eq!(
            parse_pack(&json!("not a manifest")),
            Err(PackError::HostPlaneLeak {
                key: "<malformed manifest>".into()
            })
        );
        assert_eq!(
            parse_pack(&json!({"id": "x", "services": "wrong type"})),
            Err(PackError::HostPlaneLeak {
                key: "<malformed manifest>".into()
            })
        );
    }

    #[test]
    fn same_id_twice_collides_at_the_realm_map() {
        // Two packs claiming the same id publish into the SAME realm; the
        // realm map itself refuses the duplicate service (the per-pack
        // `seen` set cannot catch cross-pack duplicates).
        let a: PackManifest = parse_pack(&pack("same", &["svc"])).unwrap();
        let b: PackManifest = parse_pack(&pack("same", &["svc"])).unwrap();
        assert!(
            matches!(
                compose_packs(&[a, b]),
                Err(PackError::RealmCollision { pack, service })
                    if pack == "same" && service == "svc"
            ),
            "duplicate id + service must collide inside the realm map"
        );
    }

    #[test]
    fn same_name_across_packs_composes_isolated() {
        let a: PackManifest = parse_pack(&pack("a", &["indexer"])).unwrap();
        let b: PackManifest = parse_pack(&pack("b", &["indexer"])).unwrap();
        let map = compose_packs(&[a, b]).unwrap();
        assert_eq!(map.realms(), 2, "distinct packs = distinct realms");
        assert_eq!(map.services_in("a"), 1);
        assert_eq!(map.services_in("b"), 1);
    }

    #[test]
    fn duplicate_within_one_pack_collides() {
        let raw = json!({
            "id": "dup",
            "persona": "p",
            "services": [{"name": "indexer"}, {"name": "indexer"}],
        });
        let m = parse_pack(&raw).unwrap();
        assert!(
            matches!(
                compose_packs(&[m]),
                Err(PackError::RealmCollision { pack, service })
                    if pack == "dup" && service == "indexer"
            ),
            "duplicate service within one realm must collide"
        );
    }
}
