//! Budget ratchet (OC-F28 translated): control-plane crates may only shrink.
//!
//! The caps are the LOC at the moment the ratchet landed; raising a cap
//! requires a deliberate edit here, which is the review hook. Shrinking is
//! always free. This is the mechanical half of "daemon stays a thin
//! orchestrator" — growth pressure shows up as a red test, not a slow slide.

use std::fs;
use std::path::Path;

fn loc(dir: &Path) -> usize {
    let mut total = 0;
    for entry in fs::read_dir(dir).unwrap() {
        let path = entry.unwrap().path();
        if path.extension().and_then(|e| e.to_str()) == Some("rs") {
            total += fs::read_to_string(&path).unwrap().lines().count();
        }
    }
    total
}

/// Parse `[workspace] members` from the root manifest.
fn workspace_members(root: &Path) -> Vec<String> {
    let manifest = fs::read_to_string(root.join("Cargo.toml")).unwrap();
    let value: toml::Value = toml::from_str(&manifest).unwrap();
    value["workspace"]["members"]
        .as_array()
        .expect("workspace members list")
        .iter()
        .map(|v| v.as_str().unwrap().to_string())
        .collect()
}

/// Recursive LOC over src/, tests/, benches/ and examples/ of one crate.
fn loc_tree(crate_dir: &Path) -> usize {
    let mut total = 0;
    for sub in ["src", "tests", "benches", "examples"] {
        let mut stack = vec![crate_dir.join(sub)];
        while let Some(dir) = stack.pop() {
            let Ok(entries) = fs::read_dir(&dir) else { continue };
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_dir() {
                    stack.push(path);
                } else if path.extension().and_then(|e| e.to_str()) == Some("rs") {
                    total += fs::read_to_string(&path).map(|t| t.lines().count()).unwrap_or(0);
                }
            }
        }
    }
    total
}

/// Workspace-wide line budget (FR9.6 / OC-F28, E12): the whole repo may
/// only shrink. The cap is the LOC when the budget landed; raising it is
/// a deliberate reviewed edit here. Growth pressure anywhere in the
/// workspace shows up as a red test, not a slow slide.
#[test]
fn workspace_loc_budget_only_shrinks() {
    let root = Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("..")
        .join("..")
        .join("..");
    // Cap raises are deliberate reviewed changes:
    // - 1_532_282→1_534_023: new crate nofy-orchestra (batch F execution
    //   half) joined the workspace.
    // - 1_534_026→1_535_478: new crate nofy-governance (batch G cores) +
    //   nofy-orchestra ledger_gov (G4).
    // - 1_535_478→1_536_711: new crate nofy-memorycore (batch H cores).
    // - 1_536_711→1_538_240: new crate nofy-stewardcore (batch I
    //   execution-surface cores).
    // - 1_538_240→1_539_601: new crate nofy-agility (batch J agility
    //   cores).
    // - 1_539_601→1_540_652: batch K task engineering (nofy-orchestra
    //   taskjournal/dag/periodic/batchapproval + nofy-scheduler eventbus).
    // - 1_540_652→1_541_376: new crate nofy-surfaces (batch L surface
    //   cores: webhook/im/lineage/migration).
    // - 1_541_376→1_542_086: new crate nofy-marketplace (batch M
    //   marketplace cores: discovery/exemplars/pluginmanifest/docker/
    //   channeladapter).
    let cap = 1_542_089; // budget at E12 landing (88 members, src+tests+benches+examples)
    let mut total = 0;
    for member in workspace_members(&root) {
        total += loc_tree(&root.join(&member));
    }
    assert!(
        total <= cap,
        "workspace grew past its line budget: {total} > {cap}. \
         Shrink it, or raise the cap deliberately in tests/ratchet.rs."
    );
}

/// Whole-word identifier occurrence — the usage heuristic for the audit.
fn contains_ident(text: &str, ident: &str) -> bool {
    let bytes = text.as_bytes();
    let mut start = 0;
    while let Some(offset) = text[start..].find(ident) {
        let abs = start + offset;
        let before_ok = abs == 0
            || !bytes[abs - 1].is_ascii_alphanumeric() && bytes[abs - 1] != b'_';
        let end = abs + ident.len();
        let after_ok = end >= bytes.len()
            || !bytes[end].is_ascii_alphanumeric() && bytes[end] != b'_';
        if before_ok && after_ok {
            return true;
        }
        start = abs + 1;
    }
    false
}

/// Dependency audit (FR9.6 knip half, E12): every manifest dependency
/// must be referenced by the crate's own code. Exemptions are deliberate
/// and reasoned — the list itself is the review surface.
#[test]
fn workspace_dependency_audit_no_unused_manifest_deps() {
    let root = Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("..")
        .join("..")
        .join("..");
    // (crate, dep) exemptions: compile-time/feature-only deps with no
    // in-source identifier to find. Each entry is reasoned — the list is
    // the review surface.
    const EXEMPT: &[(&str, &str)] = &[
        // build-time codegen, consumed via include! of generated files
        ("nofy-shell", "nofy-proto-build"),
        // `playground` feature references both via `dep:` (optional deps,
        // feature-gated code not compiled in the default configuration).
        ("nofy-markdown", "crossterm"),
        ("nofy-markdown", "nofy-ratatui-textarea"),
        // Vestigial optional deps behind no feature and no `dep:` ref, but
        // optional deps create implicit features: removal needs a deeper
        // audit than the E12 sweep. Tracked in the hygiene backlog.
        ("nofy-shell", "prost"),
        ("nofy-shell", "tonic"),
        ("nofy-shell", "tonic-prost"),
        // Package name `kamadak-exif` exposes lib name `exif` (6 in-source
        // uses); the ident heuristic cannot map package→lib names.
        ("nofy-tools", "kamadak-exif"),
        // Proto codegen crate: build.rs drives nofy-proto-build and the
        // generated code (OUT_DIR, include!) references prost/tonic.
        ("nofy-tools-api", "nofy-proto-build"),
        ("nofy-tools-api", "prost"),
        ("nofy-tools-api", "tonic"),
        ("nofy-tools-api", "tonic-prost"),
    ];
    let mut unused: Vec<String> = Vec::new();
    for member in workspace_members(&root) {
        let crate_dir = root.join(&member);
        let manifest_path = crate_dir.join("Cargo.toml");
        let Ok(manifest_text) = fs::read_to_string(&manifest_path) else { continue };
        let Ok(manifest) = toml::from_str::<toml::Value>(&manifest_text) else { continue };
        let Some(name) = manifest["package"]["name"].as_str() else { continue };
        for table in ["dependencies", "dev-dependencies", "build-dependencies"] {
            let Some(deps) = manifest.get(table).and_then(|v| v.as_table()) else { continue };
            for (dep, spec) in deps {
                // Renamed deps (`package = "..."`) are audited manually.
                if spec.get("package").is_some() {
                    continue;
                }
                if EXEMPT.contains(&(name, dep.as_str())) {
                    continue;
                }
                let ident = dep.replace('-', "_");
                let mut found = false;
                // build.rs itself is a usage source (build-dependencies).
                if let Ok(text) = fs::read_to_string(crate_dir.join("build.rs")) {
                    if contains_ident(&text, &ident) {
                        found = true;
                    }
                }
                let mut stack = vec![
                    crate_dir.join("src"),
                    crate_dir.join("tests"),
                    crate_dir.join("benches"),
                    crate_dir.join("examples"),
                ];
                while !found && let Some(dir) = stack.pop() {
                    let Ok(entries) = fs::read_dir(&dir) else { continue };
                    for entry in entries.flatten() {
                        let path = entry.path();
                        if path.is_dir() {
                            stack.push(path);
                        } else if path.extension().and_then(|e| e.to_str()) == Some("rs") {
                            if let Ok(text) = fs::read_to_string(&path) {
                                if contains_ident(&text, &ident) {
                                    found = true;
                                    break;
                                }
                            }
                        }
                    }
                }
                if !found {
                    unused.push(format!("{name}: {dep}"));
                }
            }
        }
    }
    assert!(
        unused.is_empty(),
        "manifest deps with no in-source usage (remove them, or add a \
         reasoned exemption):\n{}",
        unused.join("\n")
    );
}

#[test]
fn control_plane_loc_ratchet_only_shrinks() {
    let base = Path::new(env!("CARGO_MANIFEST_DIR")).join("..");
    // Cap raises are deliberate reviewed changes:
    // - daemon 3565→3707: provider search poll/answer seam (shell provider
    //   loop integration) + its wire-level test.
    // - schema 277→312: additive `sessions` field on SearchResult/Search +
    //   the additive-wire drift gate.
    let caps = [
        ("nofy-daemon", 3707),
        ("nofy-channel", 544),
        ("nofy-control-schema", 312),
        ("nofy-session-registry", 132),
    ];
    for (name, cap) in caps {
        let got = loc(&base.join(name).join("src"));
        assert!(
            got <= cap,
            "{name} grew past its ratchet: {got} > {cap}. \
             Shrink it, or raise the cap deliberately in tests/ratchet.rs."
        );
    }
}
