//! Conservative recovery for permission checks when ordinary shell word
//! decomposition encounters quoted filename variables.

use std::collections::HashSet;

use tree_sitter::{Node, Tree};

use crate::permission::auto_mode::{EnvRisk, env_key_risk};
use crate::permission::shell_access::{ArgText, shell_node_arg};

const WITNESS_DENIED_KEYS: &[&str] = &[
    "RIPGREP_CONFIG_PATH",
    "GCONV_PATH",
    "GETCONF_DIR",
    "GLIBC_TUNABLES",
    "HOSTALIASES",
    "LOCALDOMAIN",
    "LOCPATH",
    "MALLOC_TRACE",
    "NIS_PATH",
    "NLSPATH",
    "RESOLV_HOST_CONF",
    "RES_OPTIONS",
    "TZDIR",
];

const WITNESS_DENIED_KEY_PREFIXES: &[&str] = &["LD_"];

#[derive(Debug)]
enum PermissionWord {
    Literal(String),
    /// Source spelling, quotes included. Policy matching never sees a guessed
    /// runtime value.
    UnresolvedArgument(String),
}

#[derive(Debug, Default)]
pub(crate) struct PermissionScript {
    commands: Vec<Vec<PermissionWord>>,
    complete: bool,
    eligible: bool,
    unresolved: bool,
}

impl PermissionScript {
    pub(crate) fn analyze(tree: &Tree, source: &str) -> Self {
        const MAX_NODES: usize = 4096;
        let mut script = Self {
            complete: !tree.root_node().has_error(),
            eligible: true,
            ..Self::default()
        };
        let mut cursor = tree.walk();
        let mut pending = vec![tree.root_node()];
        let mut statements = Vec::new();
        for _ in 0..MAX_NODES {
            let Some(node) = pending.pop() else {
                break;
            };
            match node.kind() {
                "command" | "variable_assignment" => statements.push(node),
                "program" | "pipeline" | "list" | "command_name" | "word" | "number"
                | "raw_string" | "string" | "string_content" | "concatenation"
                | "variable_name" | "simple_expansion" | "expansion" | "comment" => {}
                ";" | "&&" | "||" | "|" | "\"" | "=" | "$" | "${" | "}" => {}
                _ => script.complete = false,
            }
            pending.extend(node.children(&mut cursor));
        }
        script.complete &= pending.is_empty();
        statements.sort_by_key(Node::start_byte);

        let mut assigned = HashSet::new();
        let mut used = HashSet::new();
        for node in statements {
            if node.kind() == "variable_assignment" {
                let name = node
                    .child_by_field_name("name")
                    .and_then(|child| source.get(child.byte_range()));
                let value = node
                    .child_by_field_name("value")
                    .and_then(|child| shell_node_arg(child, source));
                script.eligible &= script.commands.is_empty()
                    && node
                        .parent()
                        .is_some_and(|parent| parent.kind() == "program")
                    && matches!(value.as_ref(), Some(ArgText::Literal(value)) if is_path_prefix(value))
                    && name.is_some_and(|name| {
                        !WITNESS_DENIED_KEYS.contains(&name)
                            && !WITNESS_DENIED_KEY_PREFIXES
                                .iter()
                                .any(|prefix| name.starts_with(prefix))
                            && env_key_risk(name) != EnvRisk::Injection
                            && assigned.insert(name.to_owned())
                    });
                continue;
            }

            let mut words = Vec::new();
            let mut operands_safe = Vec::new();
            for child in node.named_children(&mut cursor) {
                if child.kind() == "variable_assignment" {
                    script.eligible = false;
                    continue;
                }
                let argument = (child.kind() != "command_name").then_some(child);
                let Some(word) = argument.or_else(|| child.named_child(0)) else {
                    script.complete = false;
                    continue;
                };
                match shell_node_arg(word, source) {
                    Some(ArgText::Literal(value)) => {
                        if matches!(word.kind(), "word" | "concatenation")
                            && source
                                .get(word.byte_range())
                                .is_some_and(|spelling| spelling.contains(['*', '?', '[', '~']))
                        {
                            script.eligible = false;
                        }
                        words.push(PermissionWord::Literal(value));
                        operands_safe.push(true);
                    }
                    Some(ArgText::Ambiguous) => {
                        let Some(spelling) = source.get(word.byte_range()) else {
                            script.complete = false;
                            continue;
                        };
                        script.unresolved = true;
                        let expansion = quoted_filename(word, source, &assigned);
                        script.complete &= expansion.is_some();
                        let safe = expansion.is_some_and(|(name, safe)| {
                            if assigned.contains(name) {
                                used.insert(name.to_owned());
                            }
                            safe
                        });
                        operands_safe.push(safe);
                        words.push(PermissionWord::UnresolvedArgument(spelling.to_owned()));
                    }
                    None => script.eligible = false,
                }
            }
            script.eligible &= readers_allow(&words, &operands_safe);
            script.complete &= matches!(words.first(), Some(PermissionWord::Literal(_)));
            script.commands.push(words);
        }

        script.eligible &= script.complete
            && script.unresolved
            && !script.commands.is_empty()
            && assigned.is_subset(&used);
        script
    }

    pub(crate) fn is_eligible(&self) -> bool {
        self.eligible
    }

    pub(crate) fn has_unresolved(&self) -> bool {
        self.complete && self.unresolved
    }

    pub(crate) fn projections(&self) -> Vec<Vec<String>> {
        self.commands
            .iter()
            .filter(|words| matches!(words.first(), Some(PermissionWord::Literal(_))))
            .map(|words| {
                words
                    .iter()
                    .map(|word| match word {
                        PermissionWord::Literal(value)
                        | PermissionWord::UnresolvedArgument(value) => value.clone(),
                    })
                    .collect()
            })
            .collect()
    }

    /// Render each recovered command as a shell-safe script for the existing
    /// policy parser. Every word is single-quoted so embedded operators stay
    /// argv data; unresolved filename operands carry their reviewed source
    /// spelling (for example the literal policy word `"$LOG"`) rather than a
    /// guessed runtime value.
    pub(crate) fn policy_projections(&self) -> Vec<String> {
        self.commands
            .iter()
            .filter(|words| matches!(words.first(), Some(PermissionWord::Literal(_))))
            .map(|words| {
                words
                    .iter()
                    .enumerate()
                    .map(|(index, word)| match word {
                        PermissionWord::Literal(value) if index == 0 => value.clone(),
                        PermissionWord::Literal(value)
                        | PermissionWord::UnresolvedArgument(value) => shell_quote_literal(value),
                    })
                    .collect::<Vec<_>>()
                    .join(" ")
            })
            .collect()
    }
}

fn shell_quote_literal(value: &str) -> String {
    format!("'{}'", value.replace('\'', "'\\''"))
}

fn is_path_prefix(value: &str) -> bool {
    value.starts_with('/') || value.starts_with("./")
}

/// Recognize only a double-quoted string containing one plain variable. The
/// operand is filename-safe when it has a literal path prefix or refers to a
/// path assignment witnessed earlier in this script.
fn quoted_filename<'a>(
    node: Node<'_>,
    source: &'a str,
    assigned: &HashSet<String>,
) -> Option<(&'a str, bool)> {
    if node.kind() != "string" {
        return None;
    }
    let mut name = None;
    for child in node.named_children(&mut node.walk()) {
        if child.kind() == "string_content" {
            continue;
        }
        if !matches!(child.kind(), "simple_expansion" | "expansion") || name.is_some() {
            return None;
        }
        let text = source.get(child.byte_range())?;
        let variable = text
            .strip_prefix("${")
            .and_then(|value| value.strip_suffix('}'))
            .or_else(|| text.strip_prefix('$'))?;
        if variable.is_empty()
            || !variable.bytes().enumerate().all(|(index, byte)| {
                byte == b'_' || byte.is_ascii_alphabetic() || (index > 0 && byte.is_ascii_digit())
            })
        {
            return None;
        }
        name = Some(variable);
    }
    let name = name?;
    let content = source.get(node.byte_range())?.strip_prefix('"')?;
    let safe = is_path_prefix(content) || (content.starts_with('$') && assigned.contains(name));
    Some((name, safe))
}

fn readers_allow(words: &[PermissionWord], safe: &[bool]) -> bool {
    let Some(PermissionWord::Literal(head)) = words.first() else {
        return false;
    };
    if !matches!(head.as_str(), "ls" | "rg" | "echo" | "head" | "tail") {
        return false;
    }
    let mut boundary = false;
    let mut pattern = head != "rg";
    let mut value = false;
    for (word, &safe) in words.iter().zip(safe).skip(1) {
        match word {
            PermissionWord::UnresolvedArgument(_) => {
                if value
                    || !pattern
                    || !matches!(head.as_str(), "ls" | "rg")
                    || (!boundary && !safe)
                {
                    return false;
                }
            }
            PermissionWord::Literal(argument) => {
                if value {
                    if argument.is_empty() || !argument.bytes().all(|byte| byte.is_ascii_digit()) {
                        return false;
                    }
                    value = false;
                    continue;
                }
                if !boundary && argument == "--" {
                    boundary = true;
                    continue;
                }
                if !boundary && argument.starts_with('-') && argument != "-" {
                    let allowed = match head.as_str() {
                        "ls" => argument.strip_prefix('-').is_some_and(|flags| {
                            !flags.is_empty()
                                && flags.chars().all(|flag| "alhdFRtSr1".contains(flag))
                        }),
                        "rg" => matches!(argument.as_str(), "-n" | "-v"),
                        "head" | "tail" => {
                            value = matches!(argument.as_str(), "-n" | "-c");
                            value
                                || argument.strip_prefix('-').is_some_and(|digits| {
                                    !digits.is_empty()
                                        && digits.bytes().all(|byte| byte.is_ascii_digit())
                                })
                        }
                        "echo" => matches!(argument.as_str(), "-n" | "-e" | "-E"),
                        _ => false,
                    };
                    if !allowed {
                        return false;
                    }
                } else if !pattern {
                    pattern = true;
                }
            }
        }
    }
    pattern && !value
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::permission::bash_command_splitting::try_parse_shell;

    #[test]
    fn accepts_safe_quoted_filename_variables() {
        let source = r#"LOG="/tmp/nofy-permission-fixture/sim.log"
OTHER="/tmp/nofy permission fixture/other.log"
echo "===== exists ====="
ls -lh "$LOG"
ls "$OTHER"
rg -n "ERROR|FATAL" "$LOG" | rg -v "summary|counts" | head -40"#;
        let tree = try_parse_shell(source).unwrap();
        let script = PermissionScript::analyze(&tree, source);
        assert!(
            script.is_eligible(),
            "{script:#?}\n{}",
            tree.root_node().to_sexp()
        );
    }

    #[test]
    fn rejects_unwitnessed_dangerous_and_loader_variable_shapes() {
        for source in [
            r#"ls "$LOG""#,
            "LOG=/tmp/log\nrm \"$LOG\"",
            "LD_PRELOAD=/tmp/evil.so\nls \"$LD_PRELOAD\"",
            "LOG=/tmp/log\nrg --pre cat ERROR \"$LOG\"",
        ] {
            let tree = try_parse_shell(source).unwrap();
            let script = PermissionScript::analyze(&tree, source);
            assert!(!script.is_eligible(), "unexpectedly accepted: {source}");
        }
    }
}
