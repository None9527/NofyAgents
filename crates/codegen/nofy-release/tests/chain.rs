use nofy_release::{
    HOST,
    artifact::{self, Identity, Manifest},
    workspace::{self, LEDGER, METADATA, Workspace},
};
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

struct Fixture {
    temp: tempfile::TempDir,
    ws: Workspace,
}

fn write(path: &Path, text: &str) {
    fs::create_dir_all(path.parent().unwrap()).unwrap();
    fs::write(path, text).unwrap();
}

impl Fixture {
    fn new() -> Self {
        let temp = tempfile::tempdir().unwrap();
        let root = temp.path().join("repo");
        fs::create_dir(&root).unwrap();
        let ws = Workspace { root };
        let f = Self { temp, ws };
        f.git(&["init", "-q"]);
        f.git(&["config", "user.email", "cli-version@example.invalid"]);
        f.git(&["config", "user.name", "Version Chain Test"]);
        f.git(&["config", "commit.gpgsign", "false"]);
        write(
            &f.ws
                .root
                .join("crates/codegen/xai-grok-pager-bin/Cargo.toml"),
            "[package]\nname = \"xai-grok-pager-bin\"\nversion = \"1.0.45\"\n",
        );
        f.git(&["add", "."]);
        f.git(&["commit", "-qm", "upstream baseline"]);
        let base = f.git(&["rev-parse", "HEAD"]);
        write(&f.ws.root.join(METADATA), &format!("1.0.45\n{base}\n1\n"));
        write(
            &f.ws.root.join("Cargo.toml"),
            "[workspace]\nresolver = \"2\"\nmembers = [\"crates/codegen/nofy-version\", \"crates/codegen/nofy-pager-bin\"]\n",
        );
        for (name, source) in [("nofy-version", "lib.rs"), ("nofy-pager-bin", "main.rs")] {
            write(
                &f.ws.root.join(format!("crates/codegen/{name}/Cargo.toml")),
                &format!(
                    "# user comment preserved\n[package]\nname = \"{name}\"\nversion = \"1.0.45+nofy.1\"\nedition = \"2024\"\n"
                ),
            );
            write(
                &f.ws
                    .root
                    .join(format!("crates/codegen/{name}/src/{source}")),
                "fn main() {}\n",
            );
        }
        let out = Command::new(env!("CARGO"))
            .current_dir(&f.ws.root)
            .args(["generate-lockfile", "--offline"])
            .output()
            .unwrap();
        assert!(
            out.status.success(),
            "{}",
            String::from_utf8_lossy(&out.stderr)
        );
        write(&f.ws.root.join(LEDGER), &serde_json::json!({"schemaVersion":1,"releases":[{
            "previousVersion":null,"version":"1.0.45+nofy.1","upstreamVersion":"1.0.45","upstreamCommit":base,"notes":"actual test baseline"
        }]}).to_string());
        write(&f.ws.root.join(".gitignore"), "/target/\n");
        f.git(&["add", "."]);
        f.git(&["commit", "-qm", "product metadata"]);
        f
    }
    fn git(&self, args: &[&str]) -> String {
        workspace::git(&self.ws.root, args).unwrap()
    }
    fn path(&self, name: &str) -> PathBuf {
        self.temp.path().join(name)
    }
    fn info(&self, state: &str) -> Identity {
        let meta = self.ws.check().unwrap();
        let head = self.git(&["rev-parse", "HEAD"]);
        Identity {
            schema_version: 1,
            current_version: meta.version.clone(),
            full_version: format!(
                "{} ({}{})",
                meta.version,
                &head[..12],
                if state == "dirty" { ", dirty" } else { "" }
            ),
            upstream_version: meta.upstream,
            upstream_commit: meta.commit,
            build_commit: head,
            worktree_state: state.into(),
            target: HOST.into(),
        }
    }
    #[cfg(unix)]
    fn binary(&self, name: &str, info: &Identity, fail_installed: bool) -> PathBuf {
        use std::os::unix::fs::PermissionsExt;
        let path = self.path(name);
        let json = serde_json::to_string(info).unwrap();
        let fail = if fail_installed {
            "case \"$0\" in */installed) exit 9;; esac\n"
        } else {
            ""
        };
        write(
            &path,
            &format!("#!/bin/sh\n{fail}printf '%s\\n' '{json}'\n"),
        );
        fs::set_permissions(&path, fs::Permissions::from_mode(0o755)).unwrap();
        path
    }
    #[cfg(unix)]
    fn package(&self, state: &str, snapshot: bool) -> PathBuf {
        let binary = self.binary("input", &self.info(state), false);
        artifact::package(
            &self.ws,
            Some(&binary),
            &self.path("dist"),
            "dev",
            snapshot,
            state == "dirty",
        )
        .unwrap()
    }
}

#[test]
fn revision_preview_apply_preserve_unrelated_edits_and_locked_graph() {
    let f = Fixture::new();
    let manifest = f.ws.root.join("crates/codegen/nofy-pager-bin/Cargo.toml");
    let mut text = fs::read_to_string(&manifest).unwrap();
    text.push_str("\n[package.metadata.user]\nkeep = \"uncommitted\"\n");
    fs::write(&manifest, &text).unwrap();
    let before = f.git(&["diff"]);
    let changes = f.ws.plan_bump(None, "fixed actual behavior").unwrap();
    assert_eq!(changes.len(), 5);
    assert_eq!(f.git(&["diff"]), before);
    workspace::apply_changes(&changes).unwrap();
    assert_eq!(f.ws.check().unwrap().version, "1.0.45+nofy.2");
    let after = fs::read_to_string(manifest).unwrap();
    assert!(after.contains("# user comment preserved"));
    assert!(after.contains("keep = \"uncommitted\""));
    let out = Command::new(env!("CARGO"))
        .current_dir(&f.ws.root)
        .args([
            "metadata",
            "--locked",
            "--offline",
            "--no-deps",
            "--format-version",
            "1",
        ])
        .output()
        .unwrap();
    assert!(
        out.status.success(),
        "{}",
        String::from_utf8_lossy(&out.stderr)
    );
    assert!(
        workspace::apply_changes(&changes).is_err(),
        "stale previews cannot overwrite source"
    );
}

#[test]
fn inconsistent_sources_and_empty_notes_are_rejected() {
    let f = Fixture::new();
    assert!(f.ws.plan_bump(None, " ").is_err());
    write(&f.ws.root.join(METADATA), "malformed\n");
    assert!(f.ws.check().is_err());
    assert!(f.ws.plan_bump(None, "notes").is_err());
}

#[test]
fn baseline_requires_forward_history_and_matching_upstream_version() {
    let f = Fixture::new();
    let old = f.ws.check().unwrap();
    assert!(
        f.ws.plan_bump(Some((&old.upstream, &old.commit)), "same")
            .is_err()
    );
    write(
        &f.ws
            .root
            .join("crates/codegen/xai-grok-pager-bin/Cargo.toml"),
        "[package]\nname = \"xai-grok-pager-bin\"\nversion = \"1.0.46\"\n",
    );
    f.git(&["add", "."]);
    f.git(&["commit", "-qm", "upstream advance"]);
    let new = f.git(&["rev-parse", "HEAD"]);
    assert!(
        f.ws.plan_bump(Some(("1.0.47", &new)), "bad version")
            .is_err()
    );
    let plan =
        f.ws.plan_bump(Some(("1.0.46", &new)), "audited upstream changes")
            .unwrap();
    workspace::apply_changes(&plan).unwrap();
    assert_eq!(f.ws.check().unwrap().version, "1.0.46+nofy.1");
    assert!(
        f.ws.plan_bump(Some(("1.0.45", &old.commit)), "rollback")
            .is_err()
    );
}

#[test]
fn same_upstream_version_new_commit_advances_local_revision() {
    let f = Fixture::new();
    write(&f.ws.root.join("upstream-fix"), "actual change");
    f.git(&["add", "."]);
    f.git(&["commit", "-qm", "same version new upstream commit"]);
    let head = f.git(&["rev-parse", "HEAD"]);
    let plan =
        f.ws.plan_bump(Some(("1.0.45", &head)), "audited same-version fix")
            .unwrap();
    workspace::apply_changes(&plan).unwrap();
    assert_eq!(f.ws.check().unwrap().version, "1.0.45+nofy.2");
}

#[test]
fn release_ledger_cannot_claim_unrelated_or_duplicate_versions() {
    let f = Fixture::new();
    let mut json: serde_json::Value =
        serde_json::from_str(&fs::read_to_string(f.ws.root.join(LEDGER)).unwrap()).unwrap();
    let record = json["releases"][0].clone();
    json["releases"].as_array_mut().unwrap().push(record);
    write(&f.ws.root.join(LEDGER), &json.to_string());
    assert!(f.ws.check().is_err());
}

#[cfg(unix)]
#[test]
fn clean_package_verify_and_install_form_a_real_chain() {
    let f = Fixture::new();
    let manifest = f.package("clean", false);
    let (record, binary) = artifact::verify(&manifest).unwrap();
    assert!(!record.snapshot);
    assert!(record.file.contains("1.0.45+nofy.1"));
    assert!(record.file.contains(HOST));
    let dest = f.path("installed");
    assert!(
        artifact::install(&manifest, &dest, false)
            .unwrap()
            .is_none()
    );
    assert_eq!(
        artifact::hash(&dest).unwrap(),
        artifact::hash(&binary).unwrap()
    );
    assert_eq!(artifact::inspect(&dest).unwrap(), record.identity);
    assert!(artifact::install(&manifest, &dest, false).is_err());
    let backup = artifact::install(&manifest, &dest, true).unwrap().unwrap();
    assert_eq!(
        artifact::hash(&backup).unwrap(),
        artifact::hash(&dest).unwrap()
    );
}

#[cfg(unix)]
#[test]
fn dirty_sources_require_explicit_snapshot_and_snapshot_identity() {
    let f = Fixture::new();
    write(&f.ws.root.join("untracked"), "dirty");
    let binary = f.binary("input", &f.info("dirty"), false);
    assert!(artifact::package(&f.ws, Some(&binary), &f.path("bad"), "dev", false, false).is_err());
    assert!(artifact::package(&f.ws, Some(&binary), &f.path("bad"), "dev", true, false).is_err());
    let manifest =
        artifact::package(&f.ws, Some(&binary), &f.path("dist"), "dev", true, true).unwrap();
    let (record, _) = artifact::verify(&manifest).unwrap();
    assert!(record.snapshot && record.file.contains("snapshot-") && record.file.contains("dirty"));
    let mut forged = record;
    forged.snapshot = false;
    write(&manifest, &serde_json::to_string(&forged).unwrap());
    assert!(artifact::verify(&manifest).is_err());
}

#[cfg(unix)]
#[test]
fn packages_refuse_stale_identity_bad_flags_and_output_overwrite() {
    let f = Fixture::new();
    let mut wrong = f.info("clean");
    wrong.current_version = "1.0.45+nofy.9".into();
    wrong.full_version = format!("{} ({})", wrong.current_version, &wrong.build_commit[..12]);
    let binary = f.binary("wrong", &wrong, false);
    assert!(artifact::package(&f.ws, Some(&binary), &f.path("bad"), "dev", false, false).is_err());
    let binary = f.binary("correct", &f.info("clean"), false);
    assert!(artifact::package(&f.ws, Some(&binary), &f.path("bad"), "dev", false, true).is_err());
    f.package("clean", false);
    assert!(artifact::package(&f.ws, Some(&binary), &f.path("dist"), "dev", false, false).is_err());
}

#[cfg(unix)]
#[test]
fn manifest_tampering_and_path_escape_are_rejected() {
    let f = Fixture::new();
    let manifest = f.package("clean", false);
    let original = fs::read(&manifest).unwrap();
    for change in ["target", "version", "path", "schema", "hash", "size"] {
        let mut m: Manifest = serde_json::from_slice(&original).unwrap();
        match change {
            "target" => m.identity.target = "wrong-native-target".into(),
            "version" => m.identity.current_version = "1.0.45+nofy.8".into(),
            "path" => m.file = "../escape".into(),
            "schema" => m.schema_version = 42,
            "hash" => m.sha256 = "0".repeat(64),
            "size" => m.size += 1,
            _ => unreachable!(),
        }
        fs::write(&manifest, serde_json::to_vec(&m).unwrap()).unwrap();
        assert!(artifact::verify(&manifest).is_err(), "{change}");
    }
    fs::write(&manifest, original).unwrap();
    let (_, binary) = artifact::verify(&manifest).unwrap();
    write(&binary, "corrupted");
    assert!(artifact::verify(&manifest).is_err());
}

#[cfg(unix)]
#[test]
fn installing_an_older_numeric_revision_is_rejected_without_touching_destination() {
    let f = Fixture::new();
    let manifest = f.package("clean", false);
    let mut newer = f.info("clean");
    newer.current_version = "1.0.45+nofy.10".into();
    newer.full_version = format!("{} ({})", newer.current_version, &newer.build_commit[..12]);
    let dest = f.binary("installed", &newer, false);
    let before = artifact::hash(&dest).unwrap();
    assert!(artifact::install(&manifest, &dest, true).is_err());
    assert_eq!(artifact::hash(&dest).unwrap(), before);
}

#[cfg(unix)]
#[test]
fn failed_post_install_validation_restores_previous_binary() {
    let f = Fixture::new();
    let info = f.info("clean");
    let candidate = f.binary("candidate", &info, true);
    let manifest = artifact::package(
        &f.ws,
        Some(&candidate),
        &f.path("dist"),
        "dev",
        false,
        false,
    )
    .unwrap();
    let mut old = info;
    old.current_version = "1.0.44+nofy.1".into();
    old.full_version = format!("{} ({})", old.current_version, &old.build_commit[..12]);
    let dest = f.binary("installed", &old, false);
    let original = artifact::hash(&dest).unwrap();
    let error = artifact::install(&manifest, &dest, false).unwrap_err();
    assert!(
        error.to_string().contains("previous state restored"),
        "{error:#}"
    );
    assert_eq!(artifact::hash(&dest).unwrap(), original);
    assert_eq!(artifact::inspect(&dest).unwrap(), old);
}

#[cfg(unix)]
#[test]
fn symlink_artifacts_are_not_executed() {
    let f = Fixture::new();
    let manifest = f.package("clean", false);
    let (_, binary) = artifact::verify(&manifest).unwrap();
    let actual = f.path("moved");
    fs::rename(&binary, &actual).unwrap();
    std::os::unix::fs::symlink(actual, binary).unwrap();
    assert!(artifact::verify(&manifest).is_err());
}

#[test]
fn cli_preview_compare_apply_and_drift_checks_use_the_real_entrypoint() {
    let f = Fixture::new();
    let tool = env!("CARGO_BIN_EXE_nofy-release");
    let compare = Command::new(tool)
        .args(["compare", "1.0.45+nofy.2", "1.0.45+nofy.10"])
        .output()
        .unwrap();
    assert!(compare.status.success());
    assert_eq!(String::from_utf8(compare.stdout).unwrap().trim(), "newer");
    let args = [
        "bump",
        "revision",
        "--root",
        f.ws.root.to_str().unwrap(),
        "--notes",
        "actual CLI test",
    ];
    let preview = Command::new(tool).args(args).output().unwrap();
    assert!(
        preview.status.success(),
        "{}",
        String::from_utf8_lossy(&preview.stderr)
    );
    assert_eq!(f.ws.check().unwrap().version, "1.0.45+nofy.1");
    assert!(
        Command::new(tool)
            .args(args)
            .arg("--apply")
            .status()
            .unwrap()
            .success()
    );
    assert_eq!(f.ws.check().unwrap().version, "1.0.45+nofy.2");
    write(&f.ws.root.join(METADATA), "broken\n");
    let check = Command::new(tool)
        .args(["check", "--root", f.ws.root.to_str().unwrap()])
        .output()
        .unwrap();
    assert!(!check.status.success());
    assert!(String::from_utf8_lossy(&check.stderr).contains("three lines"));
}

#[test]
fn concurrent_version_writer_is_rejected_and_lock_is_released() {
    let f = Fixture::new();
    let plan = f.ws.plan_bump(None, "locking regression").unwrap();
    let lock_path =
        f.ws.root
            .join(METADATA)
            .parent()
            .unwrap()
            .join(".nofy-version.lock");
    let guard = workspace::FileLock::acquire(&lock_path).unwrap();
    assert!(workspace::apply_changes(&plan).is_err());
    assert_eq!(f.ws.check().unwrap().version, "1.0.45+nofy.1");
    drop(guard);
    workspace::apply_changes(&plan).unwrap();
    assert!(!lock_path.exists());
}

#[test]
fn revision_overflow_cannot_modify_source() {
    let f = Fixture::new();
    for path in [
        METADATA,
        LEDGER,
        "Cargo.lock",
        "crates/codegen/nofy-version/Cargo.toml",
        "crates/codegen/nofy-pager-bin/Cargo.toml",
    ] {
        let path = f.ws.root.join(path);
        let before = fs::read_to_string(&path).unwrap();
        let after = if path.ends_with("upstream-version.txt") {
            format!("1.0.45\n{}\n{}\n", f.ws.check().unwrap().commit, u64::MAX)
        } else {
            before.replace("+nofy.1", &format!("+nofy.{}", u64::MAX))
        };
        fs::write(path, after).unwrap();
    }
    let error = f.ws.plan_bump(None, "overflow").err().unwrap();
    assert!(error.to_string().contains("overflow"), "{error:#}");
}

#[cfg(unix)]
#[test]
fn legacy_cli_without_json_can_be_upgraded() {
    use std::os::unix::fs::PermissionsExt;
    let f = Fixture::new();
    let manifest = f.package("clean", false);
    let dest = f.path("installed");
    write(
        &dest,
        "#!/bin/sh\nif [ \"$1\" = \"--version\" ]; then printf 'nofy 0.2.121 (oldcommit)\\n'; else exit 2; fi\n",
    );
    fs::set_permissions(&dest, fs::Permissions::from_mode(0o755)).unwrap();
    let backup = artifact::install(&manifest, &dest, false).unwrap().unwrap();
    assert!(fs::read_to_string(backup).unwrap().contains("0.2.121"));
    assert_eq!(
        artifact::inspect(&dest).unwrap().current_version,
        "1.0.45+nofy.1"
    );
}

#[cfg(unix)]
#[test]
fn unknown_identity_cannot_be_a_formal_artifact() {
    let f = Fixture::new();
    let manifest = f.package("clean", false);
    let mut record: Manifest = serde_json::from_slice(&fs::read(&manifest).unwrap()).unwrap();
    record.identity.build_commit = "unknown".into();
    record.identity.worktree_state = "unknown".into();
    record.identity.full_version = "1.0.45+nofy.1 (unknown, state unknown)".into();
    fs::write(&manifest, serde_json::to_vec(&record).unwrap()).unwrap();
    assert!(
        artifact::verify(&manifest)
            .unwrap_err()
            .to_string()
            .contains("formal artifact")
    );
}

#[cfg(unix)]
#[test]
fn dangling_install_symlink_is_not_overwritten() {
    let f = Fixture::new();
    let manifest = f.package("clean", false);
    let dest = f.path("installed");
    std::os::unix::fs::symlink(f.path("missing"), &dest).unwrap();
    assert!(artifact::install(&manifest, &dest, false).is_err());
    assert!(fs::symlink_metadata(dest).unwrap().file_type().is_symlink());
}
