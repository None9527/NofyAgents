#[test]
fn compiled_version_tracks_audited_upstream() {
    let source =
        build_support::parse_metadata(include_str!("../upstream-version.txt"), None).unwrap();
    let expected = std::env::var("NOFY_VERSION").unwrap_or_else(|_| source.version.clone());
    assert_eq!(nofy_version::VERSION, expected);
    assert!(semver::Version::parse(nofy_version::VERSION).is_ok());
    assert_eq!(
        nofy_version::upstream_display(),
        format!("upstream {} ({})", source.upstream, &source.commit[..12])
    );
}
#[allow(dead_code)]
#[path = "../build_support.rs"]
mod build_support;

use std::path::{Path, PathBuf};
use std::process::Command;
use std::sync::atomic::{AtomicUsize, Ordering};

const META: &str = "1.0.45\n2bdd1d6a6369de0e8c68132ea4539e9abd9e14a8\n1\n";

#[test]
fn metadata_rejects_invalid_fields_and_override() {
    for text in [
        "",
        "1.0.45\nbad\n1",
        "1.0.45+build\n2bdd1d6a6369de0e8c68132ea4539e9abd9e14a8\n1",
        "1.0.45\n2bdd1d6a6369de0e8c68132ea4539e9abd9e14a8\n-1",
        "1.0.45\n2bdd1d6a6369de0e8c68132ea4539e9abd9e14a8\n1\nextra",
    ] {
        assert!(build_support::parse_metadata(text, None).is_err(), "{text}");
    }
    assert!(build_support::parse_metadata(META, Some("invalid version")).is_err());
    let meta = build_support::parse_metadata(META, Some("1.0.45+nofy.2")).unwrap();
    assert_eq!(meta.version, "1.0.45+nofy.2");
    assert_eq!(meta.upstream, "1.0.45");
    assert_eq!(
        meta.commit,
        build_support::parse_metadata(META, None).unwrap().commit
    );
}

struct Fixture(PathBuf);

impl Fixture {
    fn new() -> Self {
        static SEQUENCE: AtomicUsize = AtomicUsize::new(0);
        let path = std::env::temp_dir().join(format!(
            "nofy-version-{}-{}",
            std::process::id(),
            SEQUENCE.fetch_add(1, Ordering::Relaxed)
        ));
        std::fs::create_dir(&path).unwrap();
        Self(path)
    }

    fn git(&self, args: &[&str]) -> String {
        git(&self.0, args)
    }

    fn init(&self) {
        self.git(&["init", "-q"]);
        self.git(&["config", "user.email", "version-test@example.invalid"]);
        self.git(&["config", "user.name", "Version Test"]);
        self.git(&["config", "commit.gpgsign", "false"]);
        std::fs::write(self.0.join("source"), "first").unwrap();
        self.git(&["add", "source"]);
        self.git(&["commit", "-qm", "initial"]);
    }
}

impl Drop for Fixture {
    fn drop(&mut self) {
        // This directory was uniquely created by this test, not a user checkout.
        std::fs::remove_dir_all(&self.0).unwrap();
    }
}

fn git(root: &Path, args: &[&str]) -> String {
    let output = Command::new("git")
        .arg("-C")
        .arg(root)
        .args(args)
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "{args:?}: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    String::from_utf8(output.stdout).unwrap().trim().to_owned()
}

#[test]
fn identity_tracks_clean_dirty_untracked_and_new_commit() {
    let repo = Fixture::new();
    repo.init();
    let first = repo.git(&["rev-parse", "HEAD"]);
    assert_eq!(
        build_support::build_identity(&repo.0, "1.0.45+nofy.1"),
        format!("1.0.45+nofy.1 ({})", &first[..12])
    );
    std::fs::write(repo.0.join("source"), "second").unwrap();
    assert!(build_support::build_identity(&repo.0, "v").ends_with(", dirty)"));
    repo.git(&["add", "source"]);
    repo.git(&["commit", "-qm", "second"]);
    let second = repo.git(&["rev-parse", "HEAD"]);
    assert_ne!(first, second);
    assert_eq!(
        build_support::build_identity(&repo.0, "v"),
        format!("v ({})", &second[..12])
    );
    std::fs::write(repo.0.join("new-file"), "untracked").unwrap();
    assert!(build_support::build_identity(&repo.0, "v").ends_with(", dirty)"));
}

#[test]
fn identity_handles_packed_refs_detached_head_and_worktree() {
    let repo = Fixture::new();
    repo.init();
    repo.git(&["pack-refs", "--all"]);
    let expected = build_support::build_identity(&repo.0, "v");
    repo.git(&["checkout", "--detach", "-q"]);
    assert_eq!(build_support::build_identity(&repo.0, "v"), expected);
    let linked = repo.0.join("linked");
    repo.git(&[
        "worktree",
        "add",
        "--detach",
        "-q",
        linked.to_str().unwrap(),
    ]);
    assert_eq!(build_support::build_identity(&linked, "v"), expected);
}

#[test]
fn source_archive_never_claims_clean_git_identity() {
    let archive = Fixture::new();
    assert_eq!(
        build_support::build_identity(&archive.0, "v"),
        "v (unknown, state unknown)"
    );
}

#[test]
fn cargo_incremental_build_refreshes_identity_and_validates_override() {
    let repo = Fixture::new();
    repo.init();
    let package = repo.0.join("crates/codegen/app");
    let metadata = repo.0.join("crates/codegen/nofy-version");
    std::fs::create_dir_all(package.join("src")).unwrap();
    std::fs::create_dir_all(&metadata).unwrap();
    std::fs::write(metadata.join("upstream-version.txt"), META).unwrap();
    std::fs::write(
        metadata.join("build_support.rs"),
        include_str!("../build_support.rs"),
    )
    .unwrap();
    std::fs::write(repo.0.join(".gitignore"), "/target/\n").unwrap();
    std::fs::write(package.join("Cargo.toml"), "[package]\nname = \"version-probe\"\nversion = \"0.0.0\"\nedition = \"2024\"\n[build-dependencies]\nsemver = \"1\"\n").unwrap();
    std::fs::write(package.join("build.rs"), "#[path = \"../nofy-version/build_support.rs\"] mod build_support;\nfn main() { build_support::emit(true); }\n").unwrap();
    std::fs::write(package.join("src/main.rs"), "fn main() { println!(\"{}|{}\", env!(\"VERSION_WITH_COMMIT\"), env!(\"NOFY_UPSTREAM_VERSION\")); }\n").unwrap();
    let cargo = |args: &[&str], release: Option<&str>| {
        let mut cmd = Command::new(env!("CARGO"));
        cmd.current_dir(&package)
            .args(args)
            .env_remove("NOFY_VERSION")
            .env("CARGO_TARGET_DIR", repo.0.join("target"))
            .env("CARGO_INCREMENTAL", "0")
            .env("CARGO_PROFILE_DEV_DEBUG", "0");
        if let Some(version) = release {
            cmd.env("NOFY_VERSION", version);
        }
        cmd.output().unwrap()
    };
    assert!(
        cargo(&["generate-lockfile", "--offline"], None)
            .status
            .success()
    );
    repo.git(&["add", "."]);
    repo.git(&["commit", "-qm", "probe"]);
    let run = |release: Option<&str>| {
        let out = cargo(&["run", "--offline", "--quiet"], release);
        assert!(
            out.status.success(),
            "{}",
            String::from_utf8_lossy(&out.stderr)
        );
        String::from_utf8(out.stdout).unwrap()
    };
    let first = repo.git(&["rev-parse", "HEAD"]);
    assert_eq!(
        run(None),
        format!("1.0.45+nofy.1 ({})|1.0.45\n", &first[..12])
    );
    std::fs::write(repo.0.join("source"), "edit").unwrap();
    assert!(run(None).contains(", dirty)"));
    repo.git(&["add", "source"]);
    repo.git(&["commit", "-qm", "edit"]);
    let second = repo.git(&["rev-parse", "HEAD"]);
    assert_eq!(
        run(None),
        format!("1.0.45+nofy.1 ({})|1.0.45\n", &second[..12])
    );
    std::fs::write(repo.0.join("new-untracked"), "new").unwrap();
    assert!(run(None).contains(", dirty)"));
    assert!(run(Some("1.0.45+nofy.9")).starts_with("1.0.45+nofy.9 ("));
    assert!(run(Some("1.0.45+nofy.9")).ends_with("|1.0.45\n"));
    let invalid = cargo(&["build", "--offline", "--quiet"], Some("not-semver"));
    assert!(!invalid.status.success());
    assert!(String::from_utf8_lossy(&invalid.stderr).contains("invalid NOFY_VERSION"));
    assert!(run(None).starts_with("1.0.45+nofy.1 ("));
}
