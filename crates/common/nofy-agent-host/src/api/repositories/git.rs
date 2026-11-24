use super::*;
use nofy_agent_project::repository::{RepositoryIndex, package_from_reader};
use nofy_agent_project::{File, Source};
use std::{collections::BTreeMap, path::Path, process::Stdio};
use tokio::io::AsyncReadExt;

fn invalid(message: &str) -> HostError {
    HostError::Invalid(message.into())
}
pub(super) fn admit_url(value: &str, library: &ModuleStore) -> Result<()> {
    let local = if Path::new(value).is_absolute() {
        Some(std::path::PathBuf::from(value))
    } else if let Ok(url) = url::Url::parse(value) {
        if url.password().is_some()
            || (!matches!(url.scheme(), "ssh" | "file") && !url.username().is_empty())
        {
            return Err(invalid(
                "Git sources use independently configured credentials, not URL secrets",
            ));
        }
        match url.scheme() {
            "https" | "http" | "ssh" if url.host_str().is_some() => {
                if url.username().starts_with('-')
                    || url.host_str().is_some_and(|h| h.starts_with('-'))
                {
                    return Err(invalid("invalid SSH Git source"));
                }
                None
            }
            "file" => Some(
                url.to_file_path()
                    .map_err(|_| invalid("invalid local Git URL"))?,
            ),
            _ => return Err(invalid("unsupported Git source protocol")),
        }
    } else {
        let Some((host, path)) = value.split_once(':') else {
            return Err(invalid(
                "Git source requires a standard URL or absolute path",
            ));
        };
        let Some((user, host)) = host.split_once('@') else {
            return Err(invalid("unsupported Git remote helper"));
        };
        if user.is_empty()
            || host.is_empty()
            || path.is_empty()
            || user.starts_with('-')
            || host.starts_with('-')
            || !user
                .bytes()
                .all(|b| b.is_ascii_alphanumeric() || b"._-".contains(&b))
            || !host
                .bytes()
                .all(|b| b.is_ascii_alphanumeric() || b".-".contains(&b))
        {
            return Err(invalid("invalid SSH Git source"));
        }
        None
    };
    if let Some(path) = local {
        let path = path
            .canonicalize()
            .map_err(|_| invalid("local Git source is unavailable"))?;
        let private = library
            .root()
            .parent()
            .ok_or_else(|| invalid("module store parent missing"))?
            .canonicalize()
            .map_err(|_| invalid("host state is unavailable"))?;
        if nofy_host_path::starts_with(&path, &private)
            || nofy_host_path::starts_with(&private, &path)
        {
            return Err(invalid("private host state cannot be a module source"));
        }
    }
    Ok(())
}
// These caps bound captured command output and materialized source bytes per
// acquisition. Git's fetch staging, network traffic, and concurrent syncs are
// separate resource boundaries.
const MAX_COMMAND_STDOUT: usize = 8 * 1024 * 1024;
const MAX_COMMAND_STDERR: usize = 256 * 1024;
const MAX_SOURCE_FILE: usize = 8 * 1024 * 1024;
const MAX_SOURCE_BYTES: usize = 64 * 1024 * 1024;
const MAX_SOURCE_FILES: usize = 4096;

fn size_limit(resource: &str, limit: usize) -> HostError {
    let mut error = nofy_agent_project::Error::new(
        "repository_size_limit",
        format!("Git module acquisition exceeded its {resource} limit ({limit})"),
    );
    // Preserve the existing HTTP error catalog's top-level "invalid" code.
    error.details = serde_json::json!({
        "reason": "repository_size_limit",
        "resource": resource,
        "limit": limit,
    });
    error.into()
}

async fn read_output(
    reader: impl tokio::io::AsyncRead + Unpin,
    resource: &str,
    limit: usize,
) -> Result<Vec<u8>> {
    let mut bytes = Vec::new();
    reader
        .take(limit as u64 + 1)
        .read_to_end(&mut bytes)
        .await
        .map_err(|_| HostError::Unavailable("Git acquisition I/O failed".into()))?;
    if bytes.len() > limit {
        return Err(size_limit(resource, limit));
    }
    Ok(bytes)
}

async fn run(args: &[String], deadline: tokio::time::Instant) -> Result<Vec<u8>> {
    run_bounded(
        args,
        deadline,
        "stdout bytes per command",
        MAX_COMMAND_STDOUT,
    )
    .await
}

const GIT_SSH_BATCH_COMMAND: &str = "ssh -o BatchMode=yes";

fn preserved_env_keys(is_windows: bool) -> &'static [&'static str] {
    if is_windows {
        &[
            "PATH",
            "HOME",
            "SSH_AUTH_SOCK",
            "SYSTEMROOT",
            "USERPROFILE",
            "TEMP",
            "TMP",
        ]
    } else {
        &["PATH", "HOME", "SSH_AUTH_SOCK", "SYSTEMROOT"]
    }
}

fn build_git_command(args: &[String]) -> tokio::process::Command {
    let mut command = tokio::process::Command::new("git");
    command.env_clear();
    for key in preserved_env_keys(cfg!(windows)) {
        if let Some(value) = std::env::var_os(key) {
            command.env(key, value);
        }
    }
    command
        .env("GIT_TERMINAL_PROMPT", "0")
        .env("GIT_CONFIG_NOSYSTEM", "1")
        .env("GIT_CONFIG_GLOBAL", "/dev/null")
        .env("GIT_SSH_COMMAND", GIT_SSH_BATCH_COMMAND)
        .env(
            "GIT_ASKPASS",
            if cfg!(windows) { "echo" } else { "/bin/false" },
        )
        .env("LC_ALL", "C")
        .args([
            "-c",
            "core.hooksPath=/dev/null",
            "-c",
            "core.fsmonitor=false",
            "-c",
            "gc.auto=0",
        ])
        .args(args)
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .kill_on_drop(true);
    nofy_tty_utils::detach_command(&mut command);
    command
}

async fn run_bounded(
    args: &[String],
    deadline: tokio::time::Instant,
    stdout_resource: &str,
    stdout_limit: usize,
) -> Result<Vec<u8>> {
    if tokio::time::Instant::now() >= deadline {
        return Err(HostError::Unavailable(
            "Git module acquisition timed out".into(),
        ));
    }
    let mut command = build_git_command(args);
    let mut owned = nofy_tty_utils::OwnedChild::spawn(&mut command).map_err(|e| {
        use nofy_tty_utils::OwnedChildError as E;
        HostError::Unavailable(
            match e {
                E::Spawn(_) => "Git is not available for module synchronization",
                E::Group(_) => "Git process ownership is unavailable",
                E::Attach(_) => "cannot own Git acquisition process",
            }
            .into(),
        )
    })?;
    let stdout = owned
        .child
        .stdout
        .take()
        .ok_or_else(|| invalid("Git stdout unavailable"))?;
    let stderr = owned
        .child
        .stderr
        .take()
        .ok_or_else(|| invalid("Git stderr unavailable"))?;
    let operation = async {
        let (status, output, _diagnostic) = tokio::try_join!(
            async {
                owned
                    .child
                    .wait()
                    .await
                    .map_err(|_| HostError::Unavailable("Git acquisition I/O failed".into()))
            },
            read_output(stdout, stdout_resource, stdout_limit),
            read_output(stderr, "stderr bytes per command", MAX_COMMAND_STDERR),
        )?;
        if !status.success() {
            let stage = match args {
                [option, _, verb, ..] if option == "--git-dir" => verb.as_str(),
                [verb, ..] => verb.as_str(),
                [] => "command",
            };
            return Err(HostError::Unavailable(format!(
                "Git module acquisition failed during {stage} (exit {:?}); inspect the configured source and reference",
                status.code()
            )));
        }
        Ok(output)
    };
    tokio::time::timeout_at(deadline, operation)
        .await
        .map_err(|_| HostError::Unavailable("Git module acquisition timed out".into()))?
}
fn git_path(path: &Path) -> Result<String> {
    let path = path
        .to_str()
        .ok_or_else(|| invalid("Git paths must be UTF-8"))?;
    if cfg!(windows)
        && let Some(verbatim) = path.strip_prefix(r"\\?\")
    {
        // Git for Windows can interpret the verbatim drive prefix as an SSH host.
        // Only convert canonical paths with an equivalent ordinary Windows form.
        let syntax = nofy_host_path::Syntax::Windows;
        syntax
            .check_normalized_absolute(path, path.len())
            .map_err(|_| invalid("unsupported canonical Windows Git path"))?;
        let path = if verbatim
            .get(..4)
            .is_some_and(|prefix| prefix.eq_ignore_ascii_case(r"UNC\"))
        {
            format!(r"\\{}", &verbatim[4..])
        } else {
            verbatim.to_owned()
        };
        syntax
            .check_normalized_absolute(&path, path.len())
            .map_err(|_| invalid("unsupported canonical Windows Git path"))?;
        return Ok(path);
    }
    Ok(path.to_owned())
}

struct Tree {
    directory: String,
    entries: BTreeMap<String, (String, bool)>,
    deadline: tokio::time::Instant,
    source_bytes: usize,
    source_files: usize,
}
impl Tree {
    async fn read(&mut self, path: &str) -> Result<File> {
        nofy_agent_project::safe_path(path)?;
        let (object, executable) = self.entries.get(path).ok_or_else(|| {
            nofy_agent_project::Error::new(
                "not_found",
                format!("Git source file is missing: {path}"),
            )
        })?;
        if object.is_empty() {
            return Err(invalid(
                "module sources must be regular Git blobs, not symlinks or submodules",
            ));
        }
        if self.source_files >= MAX_SOURCE_FILES {
            return Err(size_limit("source file reads", MAX_SOURCE_FILES));
        }
        let remaining = MAX_SOURCE_BYTES - self.source_bytes;
        let (resource, limit) = if remaining < MAX_SOURCE_FILE {
            ("remaining source bytes per acquisition", remaining)
        } else {
            ("bytes per source file", MAX_SOURCE_FILE)
        };
        let bytes = run_bounded(
            &[
                "--git-dir".into(),
                self.directory.clone(),
                "cat-file".into(),
                "blob".into(),
                object.clone(),
            ],
            self.deadline,
            resource,
            limit,
        )
        .await?;
        self.source_files += 1;
        self.source_bytes += bytes.len();
        Ok(File::bytes(&bytes, *executable))
    }
}
pub(super) async fn collect(
    origin: &RepositoryOrigin,
    parent: &Path,
) -> Result<(Vec<Source>, String)> {
    let RepositoryOrigin::Git {
        url,
        reference,
        subdirectory,
        timeout_ms,
    } = origin
    else {
        return Err(invalid("Git module source expected"));
    };
    let directory = tempfile::tempdir_in(parent)
        .map_err(|_| HostError::Unavailable("Git acquisition staging is unavailable".into()))?;
    let path = git_path(&directory.path().join("repository.git"))?;
    let source = if Path::new(url).is_absolute() {
        git_path(Path::new(url))?
    } else {
        url.clone()
    };
    let deadline = tokio::time::Instant::now() + std::time::Duration::from_millis(*timeout_ms);
    run(
        &[
            "init".into(),
            "--quiet".into(),
            "--bare".into(),
            path.clone(),
        ],
        deadline,
    )
    .await?;
    let prefix = vec!["--git-dir".to_owned(), path.clone()];
    let mut fetch = prefix.clone();
    fetch.extend([
        "fetch".into(),
        "--quiet".into(),
        "--no-tags".into(),
        "--depth=1".into(),
        "--".into(),
        source,
        reference.clone(),
    ]);
    run(&fetch, deadline).await?;
    let mut rev = prefix.clone();
    rev.extend([
        "rev-parse".into(),
        "--verify".into(),
        "FETCH_HEAD^{commit}".into(),
    ]);
    let commit = String::from_utf8(run(&rev, deadline).await?)
        .map_err(|_| invalid("invalid Git revision"))?
        .trim()
        .to_owned();
    if !matches!(commit.len(), 40 | 64) || !commit.bytes().all(|b| b.is_ascii_hexdigit()) {
        return Err(invalid("invalid Git revision"));
    }
    let mut tree = prefix;
    tree.extend([
        "ls-tree".into(),
        "--full-tree".into(),
        "-r".into(),
        "-z".into(),
        commit.clone(),
    ]);
    let output = run(&tree, deadline).await?;
    let mut entries = BTreeMap::new();
    for row in output.split(|b| *b == 0).filter(|r| !r.is_empty()) {
        let row =
            std::str::from_utf8(row).map_err(|_| invalid("Git module paths must be UTF-8"))?;
        let (metadata, name) = row
            .split_once('\t')
            .ok_or_else(|| invalid("invalid Git tree record"))?;
        let parts: Vec<_> = metadata.split_whitespace().collect();
        if parts.len() != 3 {
            return Err(invalid("invalid Git tree record"));
        }
        let object = if parts[1] == "blob" && matches!(parts[0], "100644" | "100755") {
            parts[2].to_owned()
        } else {
            String::new()
        };
        entries.insert(name.to_owned(), (object, parts[0] == "100755"));
    }
    let mut tree = Tree {
        directory: path,
        entries,
        deadline,
        source_bytes: 0,
        source_files: 0,
    };
    let root = if subdirectory.is_empty() {
        String::new()
    } else {
        format!("{subdirectory}/")
    };
    let index = RepositoryIndex::parse(
        &tree
            .read(&format!("{root}module-repository.json"))
            .await?
            .decode()?,
    )?;
    let mut sources = vec![];
    for package in index.packages {
        let package = if package.is_empty() {
            root.clone()
        } else {
            format!("{root}{package}/")
        };
        let manifest = if tree
            .entries
            .contains_key(&format!("{package}module-files.json"))
        {
            "module-files.json"
        } else {
            "source-files.json"
        };
        let listed = tree.read(&format!("{package}{manifest}")).await?;
        let names: Vec<String> = serde_json::from_str(&listed.utf8()?)
            .map_err(|_| invalid("invalid Git module source manifest"))?;
        let mut files = BTreeMap::new();
        files.insert(manifest.to_owned(), listed);
        for name in names {
            nofy_agent_project::safe_path(&name)?;
            let file = tree.read(&format!("{package}{name}")).await?;
            if files.insert(name.clone(), file).is_some() && name != manifest {
                return Err(invalid("duplicate module source manifest entry"));
            }
        }
        sources.push(package_from_reader(|name| {
            files.get(name).cloned().ok_or_else(|| {
                nofy_agent_project::Error::new("not_found", "declared Git module file is missing")
            })
        })?);
    }
    Ok((sources, commit))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn capture_budget_accepts_exact_limit_and_rejects_extra_bytes() {
        let bytes = read_output(&b"test"[..], "test bytes", 4).await.unwrap();
        assert_eq!(bytes, b"test");
        let error = read_output(&b"test"[..], "test bytes", 3)
            .await
            .unwrap_err();
        let HostError::Source(error) = error else {
            panic!("expected a structured module source error");
        };
        assert_eq!(error.code, "repository_size_limit");
        assert_eq!(error.details["resource"], "test bytes");
        assert_eq!(error.details["limit"], 3);
    }

    #[test]
    fn ssh_urls_reject_leading_dash_option_injection_in_user_or_host() {
        let dir = tempfile::tempdir().unwrap();
        let store = ModuleStore::open(&dir.path().join("module-library")).unwrap();
        assert!(admit_url("git@example.com:org/repo.git", &store).is_ok());
        assert!(admit_url("ssh://git@example.com/org/repo.git", &store).is_ok());
        for malicious in [
            "-oProxyCommand=id@example.com:org/repo.git",
            "git@-oProxyCommand=id:org/repo.git",
            "-u@-h:org/repo.git",
            "ssh://-oProxyCommand=id@example.com/org/repo.git",
            "ssh://git@-example.com/org/repo.git",
        ] {
            assert!(
                admit_url(malicious, &store).is_err(),
                "expected rejection for {malicious}"
            );
        }
    }

    #[test]
    fn git_command_preserves_windows_essentials_and_sets_batch_ssh() {
        let win_keys = preserved_env_keys(true);
        for required in ["USERPROFILE", "TEMP", "TMP", "SYSTEMROOT", "PATH"] {
            assert!(
                win_keys.contains(&required),
                "missing Windows preserved key {required}"
            );
        }
        let command = build_git_command(&["status".into()]);
        let envs: BTreeMap<String, Option<String>> = command
            .as_std()
            .get_envs()
            .map(|(k, v)| {
                (
                    k.to_string_lossy().into_owned(),
                    v.map(|val| val.to_string_lossy().into_owned()),
                )
            })
            .collect();
        assert_eq!(
            envs.get("GIT_SSH_COMMAND").and_then(|v| v.as_deref()),
            Some(GIT_SSH_BATCH_COMMAND)
        );
        assert_eq!(
            envs.get("GIT_TERMINAL_PROMPT").and_then(|v| v.as_deref()),
            Some("0")
        );
        assert_eq!(
            envs.get("GIT_CONFIG_NOSYSTEM").and_then(|v| v.as_deref()),
            Some("1")
        );
    }
}
