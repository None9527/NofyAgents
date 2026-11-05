//! Conservative lexical analysis. Unknown shell semantics never prove a grant.
use crate::Error;
use serde::{Deserialize, Serialize};
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CommandAnalysis {
    pub commands: Vec<Vec<String>>,
    pub operators: Vec<String>,
    pub dynamic: bool,
    pub redirects: bool,
    pub diagnostics: Vec<String>,
}
fn issue(result: &mut CommandAnalysis, message: &str) {
    result.dynamic = true;
    if !result.diagnostics.iter().any(|v| v == message) {
        result.diagnostics.push(message.into());
    }
}
fn flush(word: &mut String, started: &mut bool, words: &mut Vec<String>) {
    if *started {
        words.push(std::mem::take(word));
        *started = false;
    }
}
pub fn analyze_command(value: &serde_json::Value) -> Result<CommandAnalysis, Error> {
    analyze(value, 0)
}
fn analyze(value: &serde_json::Value, depth: u8) -> Result<CommandAnalysis, Error> {
    if depth > 4 {
        return Err(Error::Composition(
            "shell wrapper nesting exceeds four".into(),
        ));
    }
    let mut result = CommandAnalysis::default();
    match value {
        serde_json::Value::String(command) => {
            if command.len() > 65536 || command.contains('\0') {
                return Err(Error::Composition(
                    "command exceeds 64 KiB or contains NUL".into(),
                ));
            }
            let mut chars = command.chars().peekable();
            let mut quote = None;
            let mut word = String::new();
            let mut started = false;
            let mut words = Vec::new();
            while let Some(c) = chars.next() {
                match (quote, c) {
                    (Some('\''), '\'') => quote = None,
                    (Some('\''), _) => {
                        word.push(c);
                        started = true;
                    }
                    (Some('"'), '"') => quote = None,
                    (Some('"'), '$' | '`') => {
                        issue(&mut result, "substitution inside double quotes");
                        word.push(c);
                        started = true;
                    }
                    (_, '\\') => {
                        if let Some(next) = chars.next() {
                            started = true;
                            if quote == Some('"') && !matches!(next, '$' | '`' | '"' | '\\' | '\n')
                            {
                                word.push('\\');
                            }
                            if next != '\n' {
                                word.push(next);
                            }
                        } else {
                            issue(&mut result, "unterminated escape");
                        }
                    }
                    (Some('"'), _) => {
                        word.push(c);
                        started = true;
                    }
                    (None, '\'' | '"') => {
                        quote = Some(c);
                        started = true;
                    }
                    (None, ';' | '|' | '&' | '\n') => {
                        flush(&mut word, &mut started, &mut words);
                        if !words.is_empty() {
                            result.commands.push(std::mem::take(&mut words));
                        }
                        let mut op = c.to_string();
                        if matches!(c, '|' | '&') && chars.peek() == Some(&c) {
                            op.push(chars.next().expect("peeked operator"));
                        }
                        result.operators.push(op);
                    }
                    (None, '>' | '<') => {
                        flush(&mut word, &mut started, &mut words);
                        result.redirects = true;
                        issue(
                            &mut result,
                            "redirection requires an explicit parameter or approval rule",
                        );
                        word.push(c);
                        started = true;
                    }
                    (None, '#') if !started => {
                        while chars.peek().is_some_and(|c| *c != '\n') {
                            chars.next();
                        }
                    }
                    (None, c) if c.is_whitespace() => flush(&mut word, &mut started, &mut words),
                    (None, '$' | '`' | '(' | ')' | '{' | '}' | '*' | '?' | '[') => {
                        issue(&mut result, "dynamic expansion or compound shell construct");
                        word.push(c);
                        started = true;
                    }
                    _ => {
                        word.push(c);
                        started = true;
                    }
                }
                if result.commands.len() > 256 || words.len() > 1024 {
                    return Err(Error::Composition(
                        "command analysis capacity exceeded".into(),
                    ));
                }
            }
            if quote.is_some() {
                issue(&mut result, "unterminated shell quote");
            }
            flush(&mut word, &mut started, &mut words);
            if !words.is_empty() {
                result.commands.push(words);
            }
        }
        serde_json::Value::Array(argv) => {
            if argv.is_empty() || argv.len() > 1024 {
                return Err(Error::Composition("argv requires 1..1024 arguments".into()));
            }
            let mut words = Vec::new();
            let mut bytes = 0;
            for value in argv {
                let word = value
                    .as_str()
                    .ok_or_else(|| Error::Composition("argv contains a non-string".into()))?;
                bytes += word.len();
                if bytes > 65536 || word.contains('\0') {
                    return Err(Error::Composition(
                        "argv exceeds 64 KiB or contains NUL".into(),
                    ));
                }
                words.push(word.to_owned());
            }
            result.commands.push(words);
        }
        _ => {
            return Err(Error::Composition(
                "command requires a string or argv array".into(),
            ));
        }
    }
    if result.commands.is_empty() {
        issue(&mut result, "empty command");
    }
    let mut commands = Vec::new();
    for words in std::mem::take(&mut result.commands) {
        let executable = words
            .first()
            .map(|v| v.rsplit('/').next().unwrap_or(v))
            .unwrap_or("");
        if words.first().is_some_and(|v| v.contains('=')) {
            issue(
                &mut result,
                "environment assignment changes command interpretation",
            );
        }
        if matches!(
            executable,
            "eval"
                | "source"
                | "."
                | "exec"
                | "env"
                | "sudo"
                | "doas"
                | "su"
                | "xargs"
                | "command"
                | "builtin"
                | "nohup"
        ) {
            issue(&mut result, "command wrapper needs an explicit rule");
        }
        if matches!(executable, "sh" | "bash" | "dash" | "zsh" | "ksh") {
            let position = words
                .iter()
                .position(|v| matches!(v.as_str(), "-c" | "-lc" | "-cl"));
            if let Some(index) = position.filter(|i| {
                *i + 2 == words.len()
                    && words[1..*i]
                        .iter()
                        .all(|v| matches!(v.as_str(), "--noprofile" | "--norc"))
            }) {
                let nested = analyze(
                    &serde_json::Value::String(words[index + 1].clone()),
                    depth + 1,
                )?;
                result.dynamic |= nested.dynamic;
                result.redirects |= nested.redirects;
                result.operators.extend(nested.operators);
                result.diagnostics.extend(nested.diagnostics);
                commands.extend(nested.commands);
                continue;
            }
            issue(
                &mut result,
                "shell wrapper arguments are not a fixed command string",
            );
        }
        commands.push(words);
    }
    result.commands = commands;
    if result.commands.len() > 256 {
        return Err(Error::Composition(
            "expanded command analysis exceeds 256 segments".into(),
        ));
    }
    Ok(result)
}
