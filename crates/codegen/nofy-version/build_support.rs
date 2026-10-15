//! Shared build-time metadata. Git identity is embedded only by composition builds.
use std::path::Path;
use std::process::Command;

pub struct Metadata {
    pub version: String,
    pub upstream: String,
    pub commit: String,
}

pub fn parse_metadata(text: &str, override_version: Option<&str>) -> Result<Metadata, String> {
    let fields: Vec<_> = text.lines().map(str::trim).collect();
    if fields.len() != 3 {
        return Err(
            "expected upstream version, full commit and Nofy revision on three lines".into(),
        );
    }
    let upstream = semver::Version::parse(fields[0]).map_err(|e| e.to_string())?;
    if !upstream.pre.is_empty() || !upstream.build.is_empty() {
        return Err("upstream baseline must be a plain release version".into());
    }
    if fields[1].len() != 40 || !fields[1].bytes().all(|b| b.is_ascii_hexdigit()) {
        return Err("upstream commit must contain 40 hexadecimal characters".into());
    }
    let revision = fields[2].parse::<u64>().map_err(|e| e.to_string())?;
    let version = override_version
        .map(str::to_owned)
        .unwrap_or_else(|| format!("{upstream}+nofy.{revision}"));
    semver::Version::parse(&version).map_err(|e| format!("invalid NOFY_VERSION: {e}"))?;
    Ok(Metadata {
        version,
        upstream: upstream.to_string(),
        commit: fields[1].to_ascii_lowercase(),
    })
}

fn git_stdout(root: &Path, args: &[&str]) -> Option<String> {
    Command::new("git")
        .arg("-C")
        .arg(root)
        .args(args)
        .output()
        .ok()
        .filter(|o| o.status.success())
        .and_then(|o| String::from_utf8(o.stdout).ok())
        .map(|s| s.trim().to_owned())
}

pub fn build_identity(root: &Path, version: &str) -> String {
    let commit = git_stdout(root, &["rev-parse", "HEAD"])
        .filter(|s| s.len() == 40 && s.bytes().all(|b| b.is_ascii_hexdigit()))
        .map(|s| s[..12].to_owned())
        .unwrap_or_else(|| "unknown".into());
    let state = match git_stdout(root, &["status", "--porcelain", "--untracked-files=normal"]) {
        Some(status) if status.is_empty() && commit != "unknown" => "",
        Some(status) if !status.is_empty() && commit != "unknown" => ", dirty",
        _ => ", state unknown",
    };
    format!("{version} ({commit}{state})")
}

pub fn emit(with_git: bool) {
    let metadata_path =
        Path::new(env!("CARGO_MANIFEST_DIR")).join("../nofy-version/upstream-version.txt");
    println!("cargo:rerun-if-changed={}", metadata_path.display());
    println!("cargo:rerun-if-changed=../nofy-version/build_support.rs");
    println!("cargo:rerun-if-env-changed=NOFY_VERSION");
    let text = std::fs::read_to_string(&metadata_path).expect("read upstream version metadata");
    let override_version = std::env::var("NOFY_VERSION").ok();
    let meta = parse_metadata(&text, override_version.as_deref())
        .unwrap_or_else(|e| panic!("invalid upstream version metadata: {e}"));
    if matches!(env!("CARGO_PKG_NAME"), "nofy-version" | "nofy-pager-bin") {
        let baseline = parse_metadata(&text, None).expect("validated metadata");
        assert_eq!(
            env!("CARGO_PKG_VERSION"),
            baseline.version,
            "product package version must match upstream-version.txt"
        );
    }
    println!("cargo:rustc-env=NOFY_VERSION={}", meta.version);
    println!("cargo:rustc-env=NOFY_UPSTREAM_VERSION={}", meta.upstream);
    println!("cargo:rustc-env=NOFY_UPSTREAM_COMMIT={}", meta.commit);
    if with_git {
        let root = metadata_path.parent().unwrap().join("../../..");
        for key in ["HEAD", "logs/HEAD", "index", "packed-refs"] {
            if let Some(path) = git_stdout(
                &root,
                &["rev-parse", "--path-format=absolute", "--git-path", key],
            ) {
                println!("cargo:rerun-if-changed={path}");
            }
        }
        if let Some(head_ref) = git_stdout(&root, &["symbolic-ref", "-q", "HEAD"])
            && let Some(path) = git_stdout(
                &root,
                &[
                    "rev-parse",
                    "--path-format=absolute",
                    "--git-path",
                    &head_ref,
                ],
            )
        {
            println!("cargo:rerun-if-changed={path}");
        }
        // Cargo cannot observe newly created untracked files without recursively
        // watching the repository (including target). Probe on every composition
        // build instead; the shared version library never watches Git or source.
        let probe =
            Path::new(&std::env::var("OUT_DIR").expect("OUT_DIR")).join("version-state-probe");
        println!("cargo:rerun-if-changed={}", probe.display());
        println!(
            "cargo:rustc-env=VERSION_WITH_COMMIT={}",
            build_identity(&root, &meta.version)
        );
    }
}
