use anyhow::{Context, Result, bail, ensure};
use serde::{Deserialize, Serialize};
use std::cmp::Ordering;
use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::sync::atomic::{AtomicU64, Ordering as AtomicOrdering};
use toml_edit::{DocumentMut, value};

use crate::{build_support, version};

pub const METADATA: &str = "crates/codegen/nofy-version/upstream-version.txt";
pub const LEDGER: &str = "docs/releases/cli.json";
const PACKAGES: [&str; 2] = ["nofy-version", "nofy-pager-bin"];

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct Record {
    pub previous_version: Option<String>,
    pub version: String,
    pub upstream_version: String,
    pub upstream_commit: String,
    pub notes: String,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct Ledger {
    schema_version: u32,
    releases: Vec<Record>,
}

pub struct Workspace {
    pub root: PathBuf,
}

pub struct Change {
    pub path: PathBuf,
    pub before: Vec<u8>,
    pub after: Vec<u8>,
}

impl Workspace {
    pub fn discover(start: &Path) -> Result<Self> {
        let start = dunce::canonicalize(start)?;
        let root = start
            .ancestors()
            .find(|p| p.join(METADATA).is_file())
            .context("not a Nofy source checkout; pass --root PATH")?;
        Ok(Self {
            root: root.to_owned(),
        })
    }

    fn read(&self, path: &str) -> Result<String> {
        fs::read_to_string(self.root.join(path)).with_context(|| format!("read {path}"))
    }

    pub fn metadata(&self) -> Result<build_support::Metadata> {
        build_support::parse_metadata(&self.read(METADATA)?, None).map_err(anyhow::Error::msg)
    }

    fn ledger(&self) -> Result<Ledger> {
        let ledger: Ledger = serde_json::from_str(&self.read(LEDGER)?)?;
        ensure!(
            ledger.schema_version == 1,
            "unsupported release ledger schema"
        );
        ensure!(!ledger.releases.is_empty(), "release ledger is empty");
        for (i, record) in ledger.releases.iter().enumerate() {
            ensure!(!record.notes.trim().is_empty(), "release notes are empty");
            let text = format!(
                "{}\n{}\n{}\n",
                record.upstream_version,
                record.upstream_commit,
                version::revision(&semver::Version::parse(&record.version)?)
                    .map_err(anyhow::Error::msg)?
            );
            let meta = build_support::parse_metadata(&text, None).map_err(anyhow::Error::msg)?;
            ensure!(
                meta.version == record.version,
                "ledger version/baseline mismatch"
            );
            if let Some(previous) = i.checked_sub(1).map(|n| &ledger.releases[n]) {
                ensure!(
                    record.previous_version.as_deref() == Some(&previous.version),
                    "broken release history chain"
                );
                ensure!(
                    version::compare_versions(&previous.version, &record.version)
                        .map_err(anyhow::Error::msg)?
                        == Ordering::Less,
                    "duplicate or decreasing release version"
                );
            }
        }
        Ok(ledger)
    }

    pub fn check(&self) -> Result<build_support::Metadata> {
        let meta = self.metadata()?;
        for package in PACKAGES {
            let doc = self
                .read(&format!("crates/codegen/{package}/Cargo.toml"))?
                .parse::<DocumentMut>()?;
            ensure!(
                doc["package"]["name"].as_str() == Some(package),
                "unexpected package name"
            );
            ensure!(
                doc["package"]["version"].as_str() == Some(&meta.version),
                "{package} version drift"
            );
        }
        let lock = self.read("Cargo.lock")?.parse::<DocumentMut>()?;
        let entries = lock["package"]
            .as_array_of_tables()
            .context("lock packages missing")?;
        for package in PACKAGES {
            let matches: Vec<_> = entries
                .iter()
                .filter(|p| p["name"].as_str() == Some(package))
                .collect();
            ensure!(
                matches.len() == 1 && matches[0]["version"].as_str() == Some(&meta.version),
                "{package} lock version drift"
            );
        }
        let ledger = self.ledger()?;
        let last = ledger.releases.last().unwrap();
        ensure!(
            last.version == meta.version
                && last.upstream_version == meta.upstream
                && last.upstream_commit == meta.commit,
            "release record does not match current metadata"
        );
        Ok(meta)
    }

    pub fn plan_bump(&self, baseline: Option<(&str, &str)>, notes: &str) -> Result<Vec<Change>> {
        let old = self.check()?;
        ensure!(
            !notes.trim().is_empty(),
            "provide nonempty --notes describing the actual changes"
        );
        let current = semver::Version::parse(&old.version)?;
        let old_revision = version::revision(&current).map_err(anyhow::Error::msg)?;
        let (upstream, commit, revision) = if let Some((upstream, commit)) = baseline {
            let new = build_support::parse_metadata(&format!("{upstream}\n{commit}\n1\n"), None)
                .map_err(anyhow::Error::msg)?;
            let order =
                semver::Version::parse(&old.upstream)?.cmp(&semver::Version::parse(&new.upstream)?);
            ensure!(
                order != Ordering::Greater,
                "upstream baseline cannot decrease"
            );
            ensure!(
                new.upstream != old.upstream || new.commit != old.commit,
                "baseline is unchanged"
            );
            self.validate_upstream(&new.upstream, &new.commit, &old.commit)?;
            let revision = if order == Ordering::Less {
                1
            } else {
                old_revision.checked_add(1).context("revision overflow")?
            };
            (new.upstream, new.commit, revision)
        } else {
            (
                old.upstream.clone(),
                old.commit.clone(),
                old_revision.checked_add(1).context("revision overflow")?,
            )
        };
        let metadata = format!("{upstream}\n{commit}\n{revision}\n");
        let new = build_support::parse_metadata(&metadata, None).map_err(anyhow::Error::msg)?;
        ensure!(
            version::compare_versions(&old.version, &new.version).map_err(anyhow::Error::msg)?
                == Ordering::Less,
            "release must advance"
        );
        let mut changes = Vec::new();
        let mut add = |path: &str, after: String| -> Result<()> {
            let path = self.root.join(path);
            ensure!(
                !fs::symlink_metadata(&path)?.file_type().is_symlink(),
                "refusing symlink version file"
            );
            changes.push(Change {
                before: fs::read(&path)?,
                path,
                after: after.into_bytes(),
            });
            Ok(())
        };
        add(METADATA, metadata)?;
        for package in PACKAGES {
            let path = format!("crates/codegen/{package}/Cargo.toml");
            let mut doc = self.read(&path)?.parse::<DocumentMut>()?;
            doc["package"]["version"] = value(&new.version);
            add(&path, doc.to_string())?;
        }
        let mut lock = self.read("Cargo.lock")?.parse::<DocumentMut>()?;
        for package in lock["package"].as_array_of_tables_mut().unwrap().iter_mut() {
            if PACKAGES
                .iter()
                .any(|name| package["name"].as_str() == Some(*name))
            {
                package["version"] = value(&new.version);
            }
        }
        add("Cargo.lock", lock.to_string())?;
        let mut ledger = self.ledger()?;
        ledger.releases.push(Record {
            previous_version: Some(old.version),
            version: new.version,
            upstream_version: upstream,
            upstream_commit: commit,
            notes: notes.trim().into(),
        });
        add(
            LEDGER,
            format!("{}\n", serde_json::to_string_pretty(&ledger)?),
        )?;
        Ok(changes)
    }

    fn validate_upstream(&self, version: &str, commit: &str, old: &str) -> Result<()> {
        git(
            &self.root,
            &["cat-file", "-e", &format!("{commit}^{{commit}}")],
        )?;
        git(&self.root, &["merge-base", "--is-ancestor", old, commit]).context(
            "upstream history cannot move backwards or diverge without a new audit policy",
        )?;
        let text = git(
            &self.root,
            &[
                "show",
                &format!("{commit}:crates/codegen/xai-grok-pager-bin/Cargo.toml"),
            ],
        )?;
        let doc = text.parse::<DocumentMut>()?;
        ensure!(
            doc["package"]["version"].as_str() == Some(version),
            "upstream commit/package version mismatch"
        );
        Ok(())
    }
}

pub fn git(root: &Path, args: &[&str]) -> Result<String> {
    let out = Command::new("git")
        .arg("-C")
        .arg(root)
        .args(args)
        .output()?;
    ensure!(
        out.status.success(),
        "git {args:?}: {}",
        String::from_utf8_lossy(&out.stderr)
    );
    Ok(String::from_utf8(out.stdout)?.trim().into())
}

pub fn unique_path(parent: &Path, prefix: &str) -> PathBuf {
    static NEXT: AtomicU64 = AtomicU64::new(0);
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    parent.join(format!(
        ".{prefix}-{}-{now}-{}",
        std::process::id(),
        NEXT.fetch_add(1, AtomicOrdering::Relaxed)
    ))
}

pub fn atomic_write(path: &Path, bytes: &[u8]) -> Result<()> {
    let parent = path.parent().context("file has no parent")?;
    let tmp = unique_path(parent, "nofy-write");
    let result = (|| -> Result<()> {
        let mut file = OpenOptions::new().write(true).create_new(true).open(&tmp)?;
        if let Ok(meta) = fs::metadata(path) {
            file.set_permissions(meta.permissions())?;
        }
        file.write_all(bytes)?;
        file.sync_all()?;
        drop(file);
        fs::rename(&tmp, path)?;
        Ok(())
    })();
    if result.is_err() && tmp.exists() {
        let _ = fs::remove_file(&tmp);
    }
    result
}

pub fn apply_changes(changes: &[Change]) -> Result<()> {
    let first = changes.first().context("no version changes")?;
    let _lock = FileLock::acquire(
        &first
            .path
            .parent()
            .context("version file parent missing")?
            .join(".nofy-version.lock"),
    )?;
    apply_with(changes, atomic_write)
}

pub struct FileLock(PathBuf);

impl FileLock {
    pub fn acquire(path: &Path) -> Result<Self> {
        let mut file = OpenOptions::new()
            .create_new(true)
            .write(true)
            .open(path)
            .with_context(|| {
                format!(
                    "release operation locked at {}; inspect any stale lock before removing it",
                    path.display()
                )
            })?;
        let lock = Self(path.to_owned());
        writeln!(file, "pid={}", std::process::id())?;
        Ok(lock)
    }
}

impl Drop for FileLock {
    fn drop(&mut self) {
        let _ = fs::remove_file(&self.0);
    }
}

fn apply_with(changes: &[Change], mut write: impl FnMut(&Path, &[u8]) -> Result<()>) -> Result<()> {
    for change in changes {
        ensure!(
            fs::read(&change.path)? == change.before,
            "source changed since preview: {}",
            change.path.display()
        );
    }
    for (written, change) in changes.iter().enumerate() {
        if let Err(error) = write(&change.path, &change.after) {
            let mut recovery = Vec::new();
            for prior in changes[..written].iter().rev() {
                if let Err(rollback) = atomic_write(&prior.path, &prior.before) {
                    recovery.push(rollback.to_string());
                }
            }
            bail!("version write failed: {error}; rollback failures: {recovery:?}");
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn failed_transaction_restores_original_files() {
        let dir = tempfile::tempdir().unwrap();
        let paths = [dir.path().join("one"), dir.path().join("two")];
        for path in &paths {
            fs::write(path, "old").unwrap();
        }
        let changes: Vec<_> = paths
            .iter()
            .map(|p| Change {
                path: p.clone(),
                before: b"old".to_vec(),
                after: b"new".to_vec(),
            })
            .collect();
        let mut calls = 0;
        assert!(
            apply_with(&changes, |path, bytes| {
                calls += 1;
                if calls == 2 {
                    bail!("injected failure");
                }
                atomic_write(path, bytes)
            })
            .is_err()
        );
        for path in paths {
            assert_eq!(fs::read(path).unwrap(), b"old");
        }
    }
}
