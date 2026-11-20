use crate::{Error, ToolCall};

/// Guarded mode's single-use command rules, corresponding to ZCode's
/// guarded/command.ts and guarded/git.ts. Execution authority is checked separately.
pub(super) fn guarded_command(call: &ToolCall) -> Result<bool, Error> {
    let Some(command) = call.arguments.get("command") else {
        return Ok(false);
    };
    if !command.is_string() && !command.is_array() {
        return Ok(false);
    }
    let analysis = crate::policy::command::analyze_command(command)?;
    Ok(analysis.commands.iter().any(|words| {
        let Some(program) = words.first() else {
            return false;
        };
        let program = program.rsplit(['/', '\\']).next().unwrap_or(program);
        let args = &words[1..];
        let has = |flag: &str| args.iter().any(|arg| arg == flag);
        match program {
            "rm" => {
                let recursive = args.iter().any(|arg| {
                    arg == "--recursive"
                        || arg.starts_with('-')
                            && !arg.starts_with("--")
                            && (arg.contains('r') || arg.contains('R'))
                });
                let targets: Vec<_> = args.iter().filter(|arg| !arg.starts_with('-')).collect();
                recursive
                    || targets.len() >= 2
                    || targets.iter().any(|arg| arg.contains(['*', '?', '[']))
            }
            "dd" | "mount" | "umount" | "mkfs" => {
                !(args.len() == 1 && (has("--help") || has("--version")))
                    && !(program == "mount" && args.is_empty())
            }
            name if name.starts_with("mkfs.") => {
                !(args.len() == 1 && (has("--help") || has("--version")))
            }
            "rsync" => {
                !has("-n")
                    && !has("--dry-run")
                    && !has("--help")
                    && !has("--version")
                    && args.iter().any(|arg| {
                        matches!(
                            arg.as_str(),
                            "--delete"
                                | "--del"
                                | "--delete-before"
                                | "--delete-during"
                                | "--delete-delay"
                                | "--delete-after"
                                | "--delete-excluded"
                        )
                    })
            }
            "find" => has("-delete"),
            "git" => git_command(args),
            _ => false,
        }
    }))
}

fn git_command(args: &[String]) -> bool {
    let mut position = 0;
    while let Some(arg) = args.get(position) {
        match arg.as_str() {
            "-C" | "-c" | "--git-dir" | "--work-tree" | "--namespace" | "--config-env" => {
                position += 2
            }
            "--no-pager" | "-P" | "--paginate" | "-p" | "--bare" | "--no-optional-locks" => {
                position += 1
            }
            _ => break,
        }
    }
    let Some(command) = args.get(position) else {
        return false;
    };
    let args = &args[position + 1..];
    let has = |flag: &str| args.iter().any(|arg| arg == flag);
    if has("--help") || has("-h") {
        return false;
    }
    let force = args
        .iter()
        .filter(|arg| matches!(arg.as_str(), "--force" | "--no-force") || short_flag(arg, 'f'))
        .next_back()
        .is_some_and(|arg| arg != "--no-force");
    let dry = args
        .iter()
        .filter(|arg| matches!(arg.as_str(), "--dry-run" | "--no-dry-run") || short_flag(arg, 'n'))
        .next_back()
        .is_some_and(|arg| arg != "--no-dry-run");
    let tree = args
        .iter()
        .any(|arg| matches!(arg.as_str(), "." | "./" | ":/"));
    match command.as_str() {
        "reset" => args
            .iter()
            .filter(|arg| {
                matches!(
                    arg.as_str(),
                    "--hard" | "--soft" | "--mixed" | "--merge" | "--keep" | "-p" | "--patch"
                )
            })
            .next_back()
            .is_some_and(|arg| arg == "--hard"),
        "clean" => !dry && force,
        "push" => {
            !dry && (force
                || has("--force-with-lease")
                || has("--mirror")
                || args
                    .iter()
                    .any(|arg| arg.starts_with("--force-with-lease=") || arg.starts_with('+')))
        }
        "checkout" => force || tree,
        "restore" => tree && (!has("--staged") && !has("-S") || has("--worktree") || has("-W")),
        "stash" => args.first().is_some_and(|arg| arg == "clear"),
        "worktree" => args.first().is_some_and(|arg| arg == "remove") && force,
        _ => false,
    }
}

fn short_flag(argument: &str, flag: char) -> bool {
    argument.starts_with('-') && !argument.starts_with("--") && argument[1..].contains(flag)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn guarded_matches_reference_command_cases() {
        for (command, expected) in [
            ("git status && echo done", false),
            ("git reset --hard HEAD", true),
            ("git reset --hard --soft HEAD", false),
            ("git push --force origin main", true),
            ("git push --force --no-force origin main", false),
            ("git clean -f -n", false),
            ("git clean -fd", true),
            ("git clean -fdn", false),
            ("git push -vf origin main", true),
            ("rm one.txt", false),
            ("rm -rf build", true),
            ("rm one.txt two.txt", true),
            ("rsync --delete src/ dst/", true),
            ("rsync --delete --dry-run src/ dst/", false),
            ("find . -delete", true),
            ("mount", false),
            ("dd if=input of=output", true),
        ] {
            let call = ToolCall {
                id: "command".into(),
                name: "shell".into(),
                arguments: serde_json::json!({"command":command}),
            };
            assert_eq!(guarded_command(&call).unwrap(), expected, "{command}");
        }
    }
}
