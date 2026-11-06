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
            "https" | "http" | "ssh" if url.host_str().is_some() => None,
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
        if path.starts_with(&private) || private.starts_with(&path) {
            return Err(invalid("private host state cannot be a module source"));
        }
    }
    Ok(())
}
async fn run(args: &[String], deadline: tokio::time::Instant) -> Result<Vec<u8>> {
    if tokio::time::Instant::now() >= deadline {
        return Err(HostError::Unavailable(
            "Git module acquisition timed out".into(),
        ));
    }
    let mut command = tokio::process::Command::new("git");
    command.env_clear();
    for key in ["PATH", "HOME", "SSH_AUTH_SOCK", "SYSTEMROOT"] {
        if let Some(value) = std::env::var_os(key) {
            command.env(key, value);
        }
    }
    command
        .env("GIT_TERMINAL_PROMPT", "0")
        .env("GIT_CONFIG_NOSYSTEM", "1")
        .env(
            "GIT_CONFIG_GLOBAL",
            if cfg!(windows) { "NUL" } else { "/dev/null" },
        )
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
    let mut stdout = owned
        .child
        .stdout
        .take()
        .ok_or_else(|| invalid("Git stdout unavailable"))?;
    let mut stderr = owned
        .child
        .stderr
        .take()
        .ok_or_else(|| invalid("Git stderr unavailable"))?;
    let operation = async {
        let out = async {
            let mut bytes = vec![];
            stdout.read_to_end(&mut bytes).await?;
            Ok::<_, std::io::Error>(bytes)
        };
        let err = async {
            let mut bytes = vec![];
            stderr.read_to_end(&mut bytes).await?;
            Ok::<_, std::io::Error>(bytes)
        };
        let (status, output, _diagnostic) = tokio::try_join!(owned.child.wait(), out, err)
            .map_err(|_| HostError::Unavailable("Git acquisition I/O failed".into()))?;
        if !status.success() {
            return Err(HostError::Unavailable(format!(
                "Git module acquisition failed (exit {:?}); inspect the configured source and reference",
                status.code()
            )));
        }
        Ok(output)
    };
    tokio::time::timeout_at(deadline, operation)
        .await
        .map_err(|_| HostError::Unavailable("Git module acquisition timed out".into()))?
}
struct Tree {
    directory: std::path::PathBuf,
    entries: BTreeMap<String, (String, bool)>,
    deadline: tokio::time::Instant,
}
impl Tree {
    async fn read(&self, path: &str) -> Result<File> {
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
        let bytes = run(
            &[
                "--git-dir".into(),
                self.directory.to_string_lossy().into_owned(),
                "cat-file".into(),
                "blob".into(),
                object.clone(),
            ],
            self.deadline,
        )
        .await?;
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
    let path = directory.path().join("repository.git");
    let deadline = tokio::time::Instant::now() + std::time::Duration::from_millis(*timeout_ms);
    run(
        &[
            "init".into(),
            "--quiet".into(),
            "--bare".into(),
            path.to_string_lossy().into_owned(),
        ],
        deadline,
    )
    .await?;
    let prefix = vec!["--git-dir".to_owned(), path.to_string_lossy().into_owned()];
    let mut fetch = prefix.clone();
    fetch.extend([
        "fetch".into(),
        "--quiet".into(),
        "--no-tags".into(),
        "--depth=1".into(),
        "--".into(),
        url.clone(),
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
    let tree = Tree {
        directory: path,
        entries,
        deadline,
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
