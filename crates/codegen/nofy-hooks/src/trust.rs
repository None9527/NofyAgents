use std::path::{Path, PathBuf};

// Project-hook trust is no longer stored here: the shell's folder-trust store
// (`~/.nofy/trusted_folders.toml`) is the single authority for whether a repo's
// project hooks run (the same gate as repo-local MCP/LSP). The helpers below
// exist only to migrate prior grants out of the legacy file.

/// Path to the legacy project-hook trust file
/// (`<user_nofy_home>/trusted-hook-projects`), or `None` when no user nofy home
/// resolves. Retained only for the one-time migration into folder-trust.
pub fn legacy_trust_file_path() -> Option<PathBuf> {
    Some(nofy_config::user_nofy_home()?.join("trusted-hook-projects"))
}

/// Parse the legacy trusted-projects file into a list of project paths.
///
/// The legacy format is one canonical absolute path per line; blank and
/// `#`-comment lines are skipped. A missing file yields `Ok(empty)` (nothing to
/// migrate); any OTHER read error is returned as `Err` so the caller does not
/// mistake an unreadable file for an empty one and consume it. Consumed by the
/// one-time migration that seeds folder-trust from prior grants.
pub fn list_trusted_projects_with_file(trust_file: &Path) -> std::io::Result<Vec<PathBuf>> {
    let content = match std::fs::read_to_string(trust_file) {
        Ok(c) => c,
        // A missing file is "nothing to migrate", not an error.
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => return Ok(Vec::new()),
        Err(e) => return Err(e),
    };
    Ok(content
        .lines()
        .map(str::trim)
        .filter(|l| !l.is_empty() && !l.starts_with('#'))
        .map(PathBuf::from)
        .collect())
}

// ── Hook enable/disable ─────────────────────────────────────────────────

/// Why a hook is skipped at dispatch and shown disabled in the modal.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum HookSkipReason {
    UserDisabled,
    ManagedOnly,
}

/// Point-in-time snapshot of every input to the hook skip decision. Dispatch,
/// stop-gate discovery and UI display share this rule so managed-only policy
/// cannot become a presentation-only restriction.
#[derive(Debug, Default)]
pub struct DisabledHooks {
    names: std::collections::HashSet<String>,
    managed_only: bool,
}

impl DisabledHooks {
    pub fn new<I: IntoIterator<Item = String>>(names: I, managed_only: bool) -> Self {
        Self {
            names: names.into_iter().collect(),
            managed_only,
        }
    }

    pub fn load(managed_only: bool) -> Self {
        let names = disabled_hooks_file_path()
            .and_then(|file| std::fs::read_to_string(file).ok())
            .map(|content| {
                content
                    .lines()
                    .map(str::trim)
                    .filter(|line| !line.is_empty() && !line.starts_with('#'))
                    .map(str::to_string)
                    .collect::<Vec<_>>()
            })
            .unwrap_or_default();
        Self::new(names, managed_only)
    }

    pub fn managed_only(&self) -> bool {
        self.managed_only
    }

    /// Managed-policy hooks always run. Otherwise the organization lockdown
    /// outranks the user's per-name disabled file.
    pub fn skip_reason(&self, spec: &crate::config::HookSpec) -> Option<HookSkipReason> {
        if spec.is_managed_policy() {
            return None;
        }
        if self.managed_only {
            return Some(HookSkipReason::ManagedOnly);
        }
        (!spec.enabled || self.names.contains(&spec.name)).then_some(HookSkipReason::UserDisabled)
    }

    pub fn blocks(&self, spec: &crate::config::HookSpec) -> bool {
        self.skip_reason(spec).is_some()
    }
}

fn is_hook_disabled_with_file(hook_name: &str, file: &Path) -> bool {
    let content = match std::fs::read_to_string(file) {
        Ok(c) => c,
        Err(_) => return false,
    };
    content
        .lines()
        .any(|l| !l.trim().is_empty() && !l.trim().starts_with('#') && l.trim() == hook_name)
}

/// Disable a hook by name. Adds to .
pub fn disable_hook(hook_name: &str) -> Result<(), String> {
    let file = disabled_hooks_file_path()
        .ok_or_else(|| "no user nofy home (set $NOFY_HOME or $HOME)".to_string())?;
    disable_hook_with_file(hook_name, &file)
}

fn disable_hook_with_file(hook_name: &str, file: &Path) -> Result<(), String> {
    if is_hook_disabled_with_file(hook_name, file) {
        return Ok(()); // Already disabled.
    }
    if let Some(parent) = file.parent() {
        let _ = std::fs::create_dir_all(parent);
    }
    use std::io::Write;
    let mut f = std::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(file)
        .map_err(|e| format!("failed to open disabled-hooks file: {e}"))?;
    writeln!(f, "{hook_name}").map_err(|e| format!("failed to write disabled-hooks file: {e}"))?;
    Ok(())
}

/// Enable a hook by name (remove from ).
pub fn enable_hook(hook_name: &str) -> Result<bool, String> {
    match disabled_hooks_file_path() {
        Some(file) => enable_hook_with_file(hook_name, &file),
        None => Ok(false),
    }
}

fn enable_hook_with_file(hook_name: &str, file: &Path) -> Result<bool, String> {
    let content = match std::fs::read_to_string(file) {
        Ok(c) => c,
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => return Ok(false),
        Err(e) => return Err(format!("failed to read disabled-hooks file: {e}")),
    };
    let mut found = false;
    let new_lines: Vec<&str> = content
        .lines()
        .filter(|line| {
            let trimmed = line.trim();
            if !trimmed.is_empty() && !trimmed.starts_with('#') && trimmed == hook_name {
                found = true;
                false
            } else {
                true
            }
        })
        .collect();
    if !found {
        return Ok(false);
    }
    if let Some(parent) = file.parent() {
        let _ = std::fs::create_dir_all(parent);
    }
    use std::io::Write;
    let mut f = std::fs::File::create(file)
        .map_err(|e| format!("failed to open disabled-hooks file: {e}"))?;
    for line in new_lines {
        writeln!(f, "{line}").map_err(|e| format!("failed to write disabled-hooks file: {e}"))?;
    }
    Ok(true)
}

/// Returns the path to `$NOFY_HOME/disabled-hooks`, or `None` when no user nofy
/// home resolves.
fn disabled_hooks_file_path() -> Option<PathBuf> {
    Some(nofy_config::user_nofy_home()?.join("disabled-hooks"))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn hook(
        name: &str,
        layer: crate::config::HookProvenance,
        enabled: bool,
    ) -> crate::config::HookSpec {
        crate::config::HookSpec {
            name: name.to_owned(),
            event: crate::event::HookEventName::Stop,
            handler_type: crate::config::HandlerType::Command,
            configured_matcher: None,
            matcher: None,
            enabled,
            command: Some("stop.sh".into()),
            command_raw: Some("stop.sh".into()),
            url: None,
            url_raw: None,
            timeout_ms: 5_000,
            source_dir: "/tmp".into(),
            extra_env: Default::default(),
            layer,
        }
    }

    /// Each test creates its own legacy file in its own temp dir -- no shared state.
    fn trust_file_in(dir: &Path) -> PathBuf {
        let nofy_dir = dir.join(".nofy");
        std::fs::create_dir_all(&nofy_dir).unwrap();
        nofy_dir.join("trusted-hook-projects")
    }

    #[test]
    fn list_trusted_projects_parses_paths_skipping_comments_and_blanks() {
        let home = tempfile::tempdir().unwrap();
        let trust_file = trust_file_in(home.path());
        std::fs::write(
            &trust_file,
            "# comment\n\n/abs/project/one\n  /abs/project/two  \n# trailing\n",
        )
        .unwrap();

        let projects = list_trusted_projects_with_file(&trust_file).unwrap();
        assert_eq!(
            projects,
            vec![
                PathBuf::from("/abs/project/one"),
                PathBuf::from("/abs/project/two"),
            ]
        );
    }

    #[test]
    fn list_trusted_projects_missing_file_is_empty() {
        // A missing file is Ok(empty), NOT an error — so the migration treats it
        // as "nothing to migrate" rather than as an unreadable file.
        let projects =
            list_trusted_projects_with_file(Path::new("/nonexistent/trusted-hook-projects"))
                .expect("missing file resolves to Ok(empty)");
        assert!(projects.is_empty());
    }

    #[test]
    fn managed_only_blocks_non_managed_but_never_managed_policy() {
        use crate::config::HookProvenance::{File, Requirements, SystemManaged, UserRequirements};

        let lockdown = DisabledHooks::new(["managed".to_owned()], true);
        assert_eq!(
            lockdown.skip_reason(&hook("file", File, true)),
            Some(HookSkipReason::ManagedOnly)
        );
        assert_eq!(
            lockdown.skip_reason(&hook("requirements/user", UserRequirements, true)),
            Some(HookSkipReason::ManagedOnly)
        );
        assert_eq!(
            lockdown.skip_reason(&hook("managed", SystemManaged, false)),
            None
        );
        assert_eq!(
            lockdown.skip_reason(&hook("requirements/system", Requirements, false)),
            None
        );

        let ordinary = DisabledHooks::new(["file".to_owned()], false);
        assert_eq!(
            ordinary.skip_reason(&hook("file", File, true)),
            Some(HookSkipReason::UserDisabled)
        );
    }
}
