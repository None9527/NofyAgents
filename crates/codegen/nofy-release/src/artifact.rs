use anyhow::{Context, Result, bail, ensure};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::cmp::Ordering;
use std::fs::{self, File, OpenOptions};
use std::io::Read;
use std::path::{Component, Path, PathBuf};
use std::process::{Command, Stdio};
use std::time::Duration;
use tokio::io::AsyncReadExt;

use crate::{
    HOST, build_support, version,
    workspace::{FileLock, Workspace, unique_path},
};

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct Identity {
    pub schema_version: u32,
    pub current_version: String,
    pub full_version: String,
    pub upstream_version: String,
    pub upstream_commit: String,
    pub build_commit: String,
    pub worktree_state: String,
    pub target: String,
}

impl Identity {
    pub fn validate(&self) -> Result<()> {
        ensure!(
            self.schema_version == 1,
            "unsupported binary identity schema"
        );
        let parsed = semver::Version::parse(&self.current_version)?;
        version::revision(&parsed).map_err(anyhow::Error::msg)?;
        let upstream = semver::Version::parse(&self.upstream_version)?;
        ensure!(
            upstream.pre.is_empty() && upstream.build.is_empty(),
            "invalid upstream version"
        );
        ensure!(is_sha(&self.upstream_commit), "invalid upstream commit");
        ensure!(
            is_sha(&self.build_commit) || self.build_commit == "unknown",
            "invalid build commit"
        );
        ensure!(
            matches!(self.worktree_state.as_str(), "clean" | "dirty" | "unknown"),
            "invalid worktree state"
        );
        ensure!(
            self.build_commit != "unknown" || self.worktree_state == "unknown",
            "unknown commit cannot be clean/dirty"
        );
        ensure!(
            !self.target.is_empty()
                && self
                    .target
                    .bytes()
                    .all(|b| b.is_ascii_alphanumeric() || b == b'-' || b == b'_'),
            "invalid target"
        );
        let short = if self.build_commit == "unknown" {
            "unknown"
        } else {
            &self.build_commit[..12]
        };
        let suffix = match self.worktree_state.as_str() {
            "clean" => "",
            "dirty" => ", dirty",
            _ => ", state unknown",
        };
        ensure!(
            self.full_version == format!("{} ({short}{suffix})", self.current_version),
            "display/build identity mismatch"
        );
        Ok(())
    }
}

fn is_sha(s: &str) -> bool {
    s.len() == 40 && s.bytes().all(|b| b.is_ascii_hexdigit())
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct Manifest {
    pub schema_version: u32,
    pub identity: Identity,
    pub snapshot: bool,
    pub file: String,
    pub sha256: String,
    pub size: u64,
}

fn query_output(binary: &Path, args: &[&str]) -> Result<Vec<u8>> {
    query_with_timeout(binary, args, Duration::from_secs(15))
}

fn query_with_timeout(binary: &Path, args: &[&str], timeout: Duration) -> Result<Vec<u8>> {
    tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()?
        .block_on(async {
            let scope = nofy_tty_utils::ProcessScope::new();
            let mut command = tokio::process::Command::new(binary);
            command
                .args(args)
                .stdin(Stdio::null())
                .stdout(Stdio::piped())
                .stderr(Stdio::null())
                .kill_on_drop(true);
            let (mut child, group) = scope
                .spawn(command)
                .with_context(|| format!("query {}", binary.display()))?;
            let mut stdout = child
                .stdout
                .take()
                .context("query stdout missing")?
                .take(65537);
            let result = tokio::time::timeout(timeout, async {
                let mut bytes = Vec::new();
                stdout.read_to_end(&mut bytes).await?;
                ensure!(bytes.len() <= 65536, "oversized version response");
                ensure!(
                    child.wait().await?.success(),
                    "binary version query failed: {}",
                    binary.display()
                );
                Ok::<_, anyhow::Error>(bytes)
            })
            .await;
            match result {
                Ok(Ok(bytes)) => {
                    drop(group);
                    Ok(bytes)
                }
                error => {
                    scope.kill_all();
                    let _ = child.wait().await;
                    match error {
                        Ok(Err(error)) => Err(error),
                        _ => bail!("binary version query timed out"),
                    }
                }
            }
        })
}

fn query(binary: &Path) -> Result<serde_json::Value> {
    serde_json::from_slice(&query_output(binary, &["version", "--json"])?)
        .context("invalid version JSON")
}

pub fn inspect(binary: &Path) -> Result<Identity> {
    let info: Identity = serde_json::from_value(query(binary)?)?;
    info.validate()?;
    Ok(info)
}

fn installed_version(binary: &Path) -> Result<String> {
    // Compatibility with the pre-schema CLI, whose currentVersion included SHA.
    let value = match query(binary) {
        Ok(json) => json["currentVersion"]
            .as_str()
            .context("installed version missing")?
            .to_owned(),
        Err(_) => {
            let output = String::from_utf8(query_output(binary, &["--version"])?)?;
            let first = output
                .lines()
                .next()
                .context("empty legacy version response")?;
            first
                .strip_prefix("nofy ")
                .context("unrecognized legacy version response")?
                .to_owned()
        }
    };
    let version = value
        .split_whitespace()
        .next()
        .context("empty installed version")?;
    semver::Version::parse(version)?;
    Ok(version.to_owned())
}

pub fn hash(path: &Path) -> Result<(String, u64)> {
    let mut file = File::open(path)?;
    let mut hasher = Sha256::new();
    let mut total = 0;
    let mut buffer = [0u8; 65536];
    loop {
        let n = file.read(&mut buffer)?;
        if n == 0 {
            break;
        }
        total += n as u64;
        hasher.update(&buffer[..n]);
    }
    Ok((format!("{:x}", hasher.finalize()), total))
}

pub fn verify(manifest_path: &Path) -> Result<(Manifest, PathBuf)> {
    let manifest_path = dunce::canonicalize(manifest_path)?;
    let manifest: Manifest = serde_json::from_slice(&fs::read(&manifest_path)?)?;
    ensure!(manifest.schema_version == 1, "unsupported manifest schema");
    manifest.identity.validate()?;
    ensure!(
        manifest.identity.target == HOST,
        "artifact target differs from native verifier target"
    );
    let mut components = Path::new(&manifest.file).components();
    ensure!(
        matches!(components.next(), Some(Component::Normal(_))) && components.next().is_none(),
        "unsafe artifact filename"
    );
    ensure!(
        !manifest.file.contains(['/', '\\'])
            && manifest.file != "release.json"
            && manifest.file != "SHA256SUMS",
        "unsafe artifact filename"
    );
    if !manifest.snapshot {
        ensure!(
            manifest.identity.worktree_state == "clean" && is_sha(&manifest.identity.build_commit),
            "formal artifact must be clean with known source identity"
        );
    }
    let binary = manifest_path.parent().unwrap().join(&manifest.file);
    let kind = fs::symlink_metadata(&binary)?.file_type();
    ensure!(
        kind.is_file() && !kind.is_symlink(),
        "artifact must be a regular file, not a symlink"
    );
    let (digest, size) = hash(&binary)?;
    ensure!(
        digest == manifest.sha256 && size == manifest.size,
        "artifact hash/size mismatch"
    );
    let actual = inspect(&binary)?;
    ensure!(
        actual == manifest.identity,
        "artifact manifest/binary identity mismatch"
    );
    let sums = fs::read_to_string(manifest_path.parent().unwrap().join("SHA256SUMS"))?;
    ensure!(
        sums == format!("{}  {}\n", manifest.sha256, manifest.file),
        "checksum file mismatch"
    );
    Ok((manifest, binary))
}

pub fn package(
    ws: &Workspace,
    binary: Option<&Path>,
    out: &Path,
    profile: &str,
    snapshot: bool,
    allow_dirty: bool,
) -> Result<PathBuf> {
    let out = if out.is_absolute() {
        out.to_owned()
    } else {
        std::env::current_dir()?.join(out)
    };
    let metadata = ws.check()?;
    ensure!(
        matches!(profile, "dev" | "release"),
        "profile must be dev or release"
    );
    ensure!(
        !allow_dirty || snapshot,
        "--allow-dirty requires --snapshot"
    );
    ensure!(!out.exists(), "output directory already exists");
    let (head, state) = build_support::git_identity(&ws.root);
    ensure!(
        is_sha(&head),
        "packaging requires known Git source identity"
    );
    ensure!(
        state == "clean" || (snapshot && allow_dirty && state == "dirty"),
        "dirty source requires --snapshot --allow-dirty"
    );
    let binary = if let Some(path) = binary {
        dunce::canonicalize(path)?
    } else {
        let mut cargo = Command::new("cargo");
        cargo
            .current_dir(&ws.root)
            .args(["build", "--locked", "-p", "nofy-pager-bin", "--bin", "nofy"])
            .env("CARGO_INCREMENTAL", "0")
            .env("CARGO_PROFILE_DEV_DEBUG", "0");
        if profile == "release" {
            cargo.arg("--release");
        }
        ensure!(cargo.status()?.success(), "CLI build failed");
        let target = std::env::var_os("CARGO_TARGET_DIR")
            .map(PathBuf::from)
            .unwrap_or_else(|| ws.root.join("target"));
        let target = if target.is_absolute() {
            target
        } else {
            ws.root.join(target)
        };
        dunce::canonicalize(
            target
                .join(if profile == "dev" { "debug" } else { "release" })
                .join(if cfg!(windows) { "nofy.exe" } else { "nofy" }),
        )?
    };
    let info = inspect(&binary)?;
    ensure!(
        info.current_version == metadata.version
            && info.upstream_version == metadata.upstream
            && info.upstream_commit == metadata.commit,
        "built version/upstream metadata does not match source"
    );
    ensure!(info.target == HOST, "binary target is not native");
    let after = build_support::git_identity(&ws.root);
    ensure!(
        after.0 == head && after.1 == state,
        "Git source identity changed during build"
    );
    ensure!(
        info.build_commit == head && info.worktree_state == state,
        "binary is stale or has wrong source state; rebuild it"
    );
    let suffix = if snapshot {
        format!("-snapshot-{}-{}", &head[..12], state)
    } else {
        String::new()
    };
    let file = format!(
        "nofy-{}-{}{suffix}{}",
        metadata.version,
        info.target,
        if cfg!(windows) { ".exe" } else { "" }
    );
    // Never delete a caller-supplied existing directory; leave failed new output inspectable.
    fs::create_dir_all(out.parent().context("output directory needs a parent")?)?;
    fs::create_dir(&out)?;
    let destination = out.join(&file);
    fs::copy(&binary, &destination)?;
    let (sha256, size) = hash(&destination)?;
    let manifest = Manifest {
        schema_version: 1,
        identity: info,
        snapshot,
        file,
        sha256,
        size,
    };
    fs::write(
        out.join("release.json"),
        format!("{}\n", serde_json::to_string_pretty(&manifest)?),
    )?;
    fs::write(
        out.join("SHA256SUMS"),
        format!("{}  {}\n", manifest.sha256, manifest.file),
    )?;
    verify(&out.join("release.json"))?;
    Ok(out.join("release.json"))
}

pub fn install(
    manifest_path: &Path,
    destination: &Path,
    reinstall: bool,
) -> Result<Option<PathBuf>> {
    let (manifest, source) = verify(manifest_path)?;
    let destination = if destination.is_absolute() {
        destination.to_owned()
    } else {
        std::env::current_dir()?.join(destination)
    };
    let parent = destination
        .parent()
        .context("installation requires a destination directory")?;
    fs::create_dir_all(parent)?;
    let destination = dunce::canonicalize(parent)?.join(
        destination
            .file_name()
            .context("destination filename missing")?,
    );
    let lock_name = format!(
        ".{}.install.lock",
        destination.file_name().unwrap().to_string_lossy()
    );
    let _lock = FileLock::acquire(&destination.parent().unwrap().join(lock_name))?;
    let exists = match fs::symlink_metadata(&destination) {
        Ok(meta) => {
            ensure!(
                meta.file_type().is_file() && !meta.file_type().is_symlink(),
                "destination must be a regular file"
            );
            true
        }
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => false,
        Err(error) => return Err(error.into()),
    };
    let old = if exists {
        let current = installed_version(&destination)?;
        match version::compare_versions(&current, &manifest.identity.current_version)
            .map_err(anyhow::Error::msg)?
        {
            Ordering::Greater => bail!("refusing version downgrade"),
            Ordering::Equal if !reinstall => bail!("same version requires --reinstall"),
            _ => {}
        }
        Some(hash(&destination)?)
    } else {
        None
    };
    let staged = unique_path(&dunce::canonicalize(parent)?, "nofy-install");
    let mut temporary = OpenOptions::new()
        .create_new(true)
        .write(true)
        .open(&staged)?;
    std::io::copy(&mut File::open(&source)?, &mut temporary)?;
    temporary.set_permissions(fs::metadata(&source)?.permissions())?;
    temporary.sync_all()?;
    drop(temporary);
    let prepared = (|| -> Result<()> {
        ensure!(
            hash(&staged)? == (manifest.sha256.clone(), manifest.size),
            "staged binary changed"
        );
        ensure!(
            inspect(&staged)? == manifest.identity,
            "staged binary identity mismatch"
        );
        ensure!(
            if let Some(ref previous) = old {
                hash(&destination)? == *previous
            } else {
                !destination.exists()
            },
            "installed file changed during verification"
        );
        Ok(())
    })();
    if let Err(error) = prepared {
        let _ = fs::remove_file(&staged);
        return Err(error);
    }
    let backup = if old.is_some() {
        let backup = unique_path(&dunce::canonicalize(parent)?, "nofy-previous");
        let mut file = OpenOptions::new()
            .create_new(true)
            .write(true)
            .open(&backup)?;
        std::io::copy(&mut File::open(&destination)?, &mut file)?;
        file.set_permissions(fs::metadata(&destination)?.permissions())?;
        file.sync_all()?;
        Some(backup)
    } else {
        None
    };
    if let Err(error) = fs::rename(&staged, &destination) {
        let _ = fs::remove_file(&staged);
        return Err(error.into());
    }
    let check = (|| -> Result<()> {
        ensure!(
            hash(&destination)? == (manifest.sha256.clone(), manifest.size),
            "installed hash mismatch"
        );
        ensure!(
            inspect(&destination)? == manifest.identity,
            "installed identity mismatch"
        );
        Ok(())
    })();
    if let Err(error) = check {
        if let Some(ref backup) = backup {
            let restore = unique_path(&dunce::canonicalize(parent)?, "nofy-restore");
            fs::copy(backup, &restore).context("stage installation rollback")?;
            fs::rename(&restore, &destination).context("restore failed installation")?;
            ensure!(Some(hash(&destination)?) == old, "rollback hash mismatch");
        } else {
            fs::remove_file(&destination).context("remove failed new installation")?;
        }
        bail!("installation verification failed; previous state restored: {error}");
    }
    Ok(backup)
}

#[cfg(all(test, unix))]
mod query_tests {
    use super::*;
    use std::os::unix::fs::PermissionsExt;

    fn script(dir: &Path, body: &str) -> PathBuf {
        let path = dir.join("query");
        fs::write(&path, format!("#!/bin/sh\n{body}\n")).unwrap();
        fs::set_permissions(&path, fs::Permissions::from_mode(0o755)).unwrap();
        path
    }

    #[test]
    fn stalled_query_is_killed_and_reaped_with_its_process_scope() {
        let dir = tempfile::tempdir().unwrap();
        let binary = script(dir.path(), "sleep 30 &\nwait");
        let start = std::time::Instant::now();
        let error = query_with_timeout(&binary, &[], Duration::from_millis(100)).unwrap_err();
        assert!(error.to_string().contains("timed out"));
        assert!(start.elapsed() < Duration::from_secs(3));
    }

    #[test]
    fn oversized_query_output_is_bounded_and_terminated() {
        let dir = tempfile::tempdir().unwrap();
        let binary = script(
            dir.path(),
            &format!("while :; do printf '%s' '{}'; done", "x".repeat(1024)),
        );
        let error = query_with_timeout(&binary, &[], Duration::from_secs(2)).unwrap_err();
        assert!(error.to_string().contains("oversized"), "{error:#}");
    }
}
