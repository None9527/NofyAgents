//! Login-shell env snapshot (FR6.2, HM-F13): atomic publish +
//! injection-safe dump.
//!
//! The snapshot is captured from the login shell, STAGED, and then
//! published in one step — readers never observe a half-built
//! snapshot. The dump format is `KEY=VALUE` lines; a value carrying a
//! newline or control byte is an injection vector (it forges extra
//! lines), so dumping refuses it instead of escaping silently.

use std::collections::BTreeMap;

/// A staged snapshot under construction (invisible to readers).
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct StagedSnapshot {
    vars: BTreeMap<String, String>,
}

/// A published snapshot (readable).
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct EnvSnapshot {
    pub vars: BTreeMap<String, String>,
}

impl StagedSnapshot {
    pub fn set(&mut self, key: &str, value: &str) {
        self.vars.insert(key.to_string(), value.to_string());
    }

    /// Publish atomically: the whole map lands at once.
    pub fn publish(self) -> EnvSnapshot {
        EnvSnapshot { vars: self.vars }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum DumpError {
    /// Keys must be plain identifiers.
    BadKey(String),
    /// Values must not carry newlines or control bytes.
    UnsafeValue { key: String },
}

fn key_ok(key: &str) -> bool {
    !key.is_empty() && key.chars().all(|c| c.is_ascii_alphanumeric() || c == '_')
}

fn value_safe(value: &str) -> bool {
    !value
        .chars()
        .any(|c| c == '\n' || c == '\r' || c.is_control())
}

/// Dump to `KEY=VALUE` lines (deterministic key order). Injection-safe:
/// unsafe keys/values are REFUSED, never escaped silently.
pub fn dump(snapshot: &EnvSnapshot) -> Result<String, DumpError> {
    let mut lines = Vec::new();
    for (key, value) in &snapshot.vars {
        if !key_ok(key) {
            return Err(DumpError::BadKey(key.clone()));
        }
        if !value_safe(value) {
            return Err(DumpError::UnsafeValue { key: key.clone() });
        }
        lines.push(format!("{key}={value}"));
    }
    Ok(lines.join("\n"))
}

/// Parse a dump back (the inverse of [`dump`] on safe inputs).
pub fn parse_dump(text: &str) -> Result<EnvSnapshot, DumpError> {
    let mut vars = BTreeMap::new();
    for line in text.lines() {
        if line.is_empty() {
            continue;
        }
        let (key, value) = line
            .split_once('=')
            .ok_or_else(|| DumpError::BadKey(line.to_string()))?;
        if !key_ok(key) {
            return Err(DumpError::BadKey(key.to_string()));
        }
        vars.insert(key.to_string(), value.to_string());
    }
    Ok(EnvSnapshot { vars })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn publish_is_atomic_and_ordered() {
        let mut staged = StagedSnapshot::default();
        staged.set("PATH", "/bin");
        staged.set("HOME", "/home/u");
        let snap = staged.publish();
        let dumped = dump(&snap).unwrap();
        assert_eq!(
            dumped, "HOME=/home/u\nPATH=/bin",
            "keys sort deterministically"
        );
    }

    #[test]
    fn newline_values_are_refused_not_escaped() {
        let mut staged = StagedSnapshot::default();
        staged.set("EVIL", "line1\nFAKE_KEY=injected");
        let snap = staged.publish();
        assert_eq!(
            dump(&snap),
            Err(DumpError::UnsafeValue { key: "EVIL".into() })
        );
    }

    #[test]
    fn control_bytes_are_refused() {
        let mut staged = StagedSnapshot::default();
        staged.set("WEIRD", "a\u{0000}b");
        assert_eq!(
            dump(&staged.publish()),
            Err(DumpError::UnsafeValue {
                key: "WEIRD".into()
            })
        );
    }

    #[test]
    fn bad_keys_are_refused() {
        let mut staged = StagedSnapshot::default();
        staged.set("NOT A KEY", "x");
        assert!(matches!(dump(&staged.publish()), Err(DumpError::BadKey(_))));
    }

    #[test]
    fn dump_parse_roundtrip() {
        let mut staged = StagedSnapshot::default();
        staged.set("A", "1");
        staged.set("B_2", "two words");
        let snap = staged.publish();
        let parsed = parse_dump(&dump(&snap).unwrap()).unwrap();
        assert_eq!(parsed, snap);
    }

    #[test]
    fn parse_dump_skips_blank_lines() {
        let parsed = parse_dump("A=1\n\nB=2").unwrap();
        assert_eq!(parsed.vars.len(), 2);
    }

    #[test]
    fn parse_dump_refuses_bad_lines() {
        // A line without '=' fails loud at the split point.
        assert!(matches!(parse_dump("NOEQUALS"), Err(DumpError::BadKey(_))));
        // A key with spaces is no identifier.
        assert_eq!(
            parse_dump("NOT A KEY=1"),
            Err(DumpError::BadKey("NOT A KEY".into()))
        );
    }
}
