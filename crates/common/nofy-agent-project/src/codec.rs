use base64::{Engine, engine::general_purpose::STANDARD};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use sha2::{Digest, Sha256};
use std::collections::BTreeMap;

#[derive(Debug, thiserror::Error)]
#[error("{message}")]
pub struct Error {
    pub code: String,
    pub message: String,
    pub details: Value,
}
pub type Result<T> = std::result::Result<T, Error>;
impl Error {
    pub fn new(code: &str, message: impl Into<String>) -> Self {
        Self {
            code: code.into(),
            message: message.into(),
            details: Value::Null,
        }
    }
    pub fn incomplete(message: impl Into<String>) -> Self {
        Self::new("incomplete", message)
    }
}
impl From<std::io::Error> for Error {
    fn from(e: std::io::Error) -> Self {
        Self::new("local_io", e.to_string())
    }
}
impl From<serde_json::Error> for Error {
    fn from(e: serde_json::Error) -> Self {
        Self::new("local_input", e.to_string())
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Encoding {
    Utf8,
    Base64,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct File {
    pub encoding: Encoding,
    pub content: String,
    #[serde(default)]
    pub executable: bool,
}
impl File {
    pub fn text(text: impl Into<String>) -> Self {
        Self {
            encoding: Encoding::Utf8,
            content: text.into(),
            executable: false,
        }
    }
    pub fn bytes(data: &[u8], executable: bool) -> Self {
        match std::str::from_utf8(data) {
            Ok(s) => Self {
                encoding: Encoding::Utf8,
                content: s.into(),
                executable,
            },
            Err(_) => Self {
                encoding: Encoding::Base64,
                content: STANDARD.encode(data),
                executable,
            },
        }
    }
    pub fn decode(&self) -> Result<Vec<u8>> {
        match self.encoding {
            Encoding::Utf8 => Ok(self.content.as_bytes().to_vec()),
            Encoding::Base64 => STANDARD
                .decode(&self.content)
                .map_err(|_| Error::new("local_input", "invalid source base64")),
        }
    }
    pub fn utf8(&self) -> Result<String> {
        String::from_utf8(self.decode()?)
            .map_err(|_| Error::new("local_input", "source text must be UTF-8"))
    }
}
const WINDOWS_FORBIDDEN_CHARS: &[char] = &['<', '>', ':', '"', '|', '?', '*'];
pub(crate) const MAX_SOURCE_FILES: usize = 4096;
pub(crate) const MAX_SOURCE_TOTAL_BYTES: usize = 64 * 1024 * 1024;

pub fn safe_path(path: &str) -> Result<()> {
    if path.is_empty()
        || path.contains('\\')
        || path.contains(WINDOWS_FORBIDDEN_CHARS)
        || path.chars().any(char::is_control)
        || path.split('/').next().is_some_and(|first| {
            first.eq_ignore_ascii_case(".nofy-source.lock")
                || first.eq_ignore_ascii_case(".nofy-source-transaction")
        })
        || path.split('/').any(|p| {
            p.is_empty() || p == "." || p == ".." || nofy_host_path::windows_cannot_hold(p)
        })
    {
        return Err(Error::new(
            "local_input",
            format!("unsafe source path: {path}"),
        ));
    }
    Ok(())
}
/// An ID becomes a file name, and state must move between platforms, so an ID
/// that Windows cannot hold is refused everywhere: its reserved device names
/// (with or without an extension) and a trailing dot, which Windows drops. The
/// rule itself lives in `nofy-host-path`, the one place that knows host names.
pub fn safe_id(id: &str) -> Result<()> {
    if id.is_empty()
        || id.len() > 128
        || !id
            .bytes()
            .all(|b| b.is_ascii_alphanumeric() || b"._-".contains(&b))
        || id == "."
        || id == ".."
        || nofy_host_path::windows_cannot_hold(id)
    {
        return Err(Error::new(
            "local_input",
            "project ID must use 1..128 ASCII letters, digits, dot, underscore or hyphen, and must not be a Windows device name (con, nul, com1...) or end with a dot",
        ));
    }
    Ok(())
}
pub fn digest(data: &[u8]) -> String {
    format!("{:x}", Sha256::digest(data))
}
pub fn json_digest(value: &impl Serialize) -> Result<String> {
    Ok(digest(&serde_json::to_vec(value)?))
}
pub fn text<'a>(value: &'a Value, key: &str) -> Result<&'a str> {
    value
        .get(key)
        .and_then(Value::as_str)
        .filter(|s| !s.is_empty())
        .ok_or_else(|| Error::new("local_input", format!("{key} must be a nonempty string")))
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Source {
    pub files: BTreeMap<String, File>,
    pub declaration: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub settings_json: Option<String>,
}
impl Source {
    pub fn validate(&self) -> Result<()> {
        safe_path(&self.declaration)?;
        if self.files.len() > MAX_SOURCE_FILES {
            return Err(Error::new(
                "local_input",
                format!("source exceeds maximum file count ({MAX_SOURCE_FILES})"),
            ));
        }
        let mut total_bytes = self.settings_json.as_ref().map_or(0, String::len);
        if total_bytes > MAX_SOURCE_TOTAL_BYTES {
            return Err(Error::new(
                "local_input",
                format!("source exceeds maximum total size ({MAX_SOURCE_TOTAL_BYTES} bytes)"),
            ));
        }
        let mut folded_paths = std::collections::BTreeSet::new();
        for (path, file) in &self.files {
            safe_path(path)?;
            let folded = nofy_host_path::fold(path);
            if !folded_paths.insert(folded) {
                return Err(Error::new(
                    "local_input",
                    format!("source file paths collide ignoring case: {path}"),
                ));
            }
            let file_bytes = match file.encoding {
                Encoding::Utf8 => file.content.len(),
                Encoding::Base64 => {
                    let max_encoded = (MAX_SOURCE_TOTAL_BYTES / 3 + 1) * 4;
                    if file.content.len() > max_encoded {
                        return Err(Error::new(
                            "local_input",
                            format!(
                                "source exceeds maximum total size ({MAX_SOURCE_TOTAL_BYTES} bytes)"
                            ),
                        ));
                    }
                    file.decode()?.len()
                }
            };
            total_bytes = total_bytes.saturating_add(file_bytes);
            if total_bytes > MAX_SOURCE_TOTAL_BYTES {
                return Err(Error::new(
                    "local_input",
                    format!("source exceeds maximum total size ({MAX_SOURCE_TOTAL_BYTES} bytes)"),
                ));
            }
        }
        for folded in &folded_paths {
            let mut prefix = folded.as_str();
            while let Some((parent, _)) = prefix.rsplit_once('/') {
                if folded_paths.contains(parent) {
                    return Err(Error::new(
                        "local_input",
                        "source file path is also a directory prefix",
                    ));
                }
                prefix = parent;
            }
        }
        if !self.files.contains_key(&self.declaration) {
            return Err(Error::new("not_found", "declaration file missing"));
        }
        Ok(())
    }
    pub fn json(&self, path: &str) -> Result<Value> {
        safe_path(path)?;
        Ok(serde_json::from_str(
            &self
                .files
                .get(path)
                .ok_or_else(|| Error::new("not_found", format!("source file missing: {path}")))?
                .utf8()?,
        )?)
    }
    pub fn raw(&self, path: &str) -> Result<String> {
        safe_path(path)?;
        self.files
            .get(path)
            .ok_or_else(|| Error::new("not_found", format!("source file missing: {path}")))?
            .utf8()
    }
    pub fn put_json(&mut self, path: &str, value: &Value) -> Result<()> {
        safe_path(path)?;
        self.files.insert(
            path.into(),
            File::text(serde_json::to_string_pretty(value)? + "\n"),
        );
        Ok(())
    }
    pub fn digest(&self) -> Result<String> {
        self.validate()?;
        let mut hash = Sha256::new();
        for (name, file) in &self.files {
            let bytes = file.decode()?;
            hash.update((name.len() as u64).to_be_bytes());
            hash.update(name.as_bytes());
            hash.update((bytes.len() as u64).to_be_bytes());
            hash.update(bytes);
            hash.update([u8::from(file.executable)]);
        }
        hash.update(self.declaration.as_bytes());
        hash.update([0]);
        if let Some(s) = &self.settings_json {
            hash.update(s.as_bytes());
        }
        Ok(format!("{:x}", hash.finalize()))
    }
    pub fn refresh_manifest(&mut self) -> Result<()> {
        // A source that declares its executables keeps the declaration equal to
        // the flags; one that does not is untouched.
        self.sync_executable_declaration()?;
        self.files
            .entry("source-files.json".into())
            .or_insert_with(|| File::text("[]"));
        let names: Vec<_> = self.files.keys().cloned().collect();
        self.put_json("source-files.json", &json!(names))
    }
    pub fn empty(agent: &str, system: &str) -> Result<Self> {
        if agent.trim().is_empty() || agent.len() > 128 {
            return Err(Error::new("local_input", "invalid Agent name"));
        }
        let mut s = Self {
            files: Default::default(),
            declaration: "preset.json".into(),
            settings_json: None,
        };
        s.put_json("project.json",&json!({"format":"nofy.project/v1","declaration":"preset.json","settings":"settings.json"}))?;
        let mut programs = serde_json::Map::new();
        programs.insert(
            agent.into(),
            json!({"kind":"agent","definition":{"schema_version":1,"name":agent}}),
        );
        s.put_json("preset.json",&json!({"format":"nofy.preset/v1","system":{"schema_version":1,"name":system,"modules":[],"programs":programs}}))?;
        s.put_json("settings.json", &json!({}))?;
        s.files.insert("requirements.txt".into(), File::text(""));
        s.files.insert("文件说明.md".into(),File::text("# 声明式 Agent 源码工程\n\npreset.json 定义系统与 Agent；settings.json 保存非凭据参数；modules/ 保存外部源码。外部依赖由用户安装，访问令牌及业务凭据独立注入。\n"));
        s.refresh_manifest()?;
        Ok(s)
    }
}
const MAX_POINTER_DEPTH: usize = 64;
const MAX_POINTER_BYTES: usize = 4096;

pub fn pointer_set(value: &mut Value, pointer: &str, replacement: Value) -> Result<()> {
    if pointer.len() > MAX_POINTER_BYTES {
        return Err(Error::new(
            "local_input",
            "JSON Pointer exceeds maximum length",
        ));
    }
    if pointer.is_empty() {
        *value = replacement;
        return Ok(());
    }
    if !pointer.starts_with('/') {
        return Err(Error::new("local_input", "setting requires a JSON Pointer"));
    }
    let mut tokens = Vec::new();
    for part in pointer[1..].split('/') {
        if tokens.len() >= MAX_POINTER_DEPTH {
            return Err(Error::new(
                "local_input",
                "JSON Pointer exceeds maximum depth",
            ));
        }
        let mut token = String::new();
        let mut chars = part.chars();
        while let Some(c) = chars.next() {
            if c == '~' {
                token.push(match chars.next() {
                    Some('0') => '~',
                    Some('1') => '/',
                    _ => return Err(Error::new("local_input", "invalid JSON Pointer escape")),
                });
            } else {
                token.push(c);
            }
        }
        tokens.push(token);
    }
    let mut current = value;
    for token in &tokens {
        if current.is_null() {
            *current = if token.parse::<usize>().is_ok() {
                json!([])
            } else {
                json!({})
            };
        }
        current = match current {
            Value::Object(map) => map.entry(token.clone()).or_insert(Value::Null),
            Value::Array(items) => {
                let index = if token == "-" {
                    items.len()
                } else {
                    token
                        .parse::<usize>()
                        .map_err(|_| Error::new("local_input", "invalid array pointer index"))?
                };
                if index > items.len() {
                    return Err(Error::new("local_input", "array pointer skips elements"));
                }
                if index == items.len() {
                    items.push(Value::Null);
                }
                items
                    .get_mut(index)
                    .ok_or_else(|| Error::new("local_input", "invalid array pointer index"))?
            }
            _ => return Err(Error::new("local_input", "JSON Pointer crosses a scalar")),
        };
    }
    *current = replacement;
    Ok(())
}

#[cfg(test)]
mod id_tests {
    use super::*;

    #[test]
    fn ids_that_windows_cannot_hold_are_refused_on_every_platform() {
        for id in [
            "con", "CON", "nul", "Prn", "aux", "com1", "COM9", "lpt3", "con.json", "nul.txt",
            "demo.",
        ] {
            assert!(safe_id(id).is_err(), "{id}");
        }
    }

    #[test]
    fn ordinary_ids_and_near_misses_still_pass() {
        for id in [
            "demo", "Demo", "my-agent", "a.b", "com", "com0", "com10", "lpt", "console", "conx",
            ".hidden", "_x",
        ] {
            assert!(safe_id(id).is_ok(), "{id}");
        }
    }

    #[test]
    fn deeply_nested_and_oversized_pointers_return_invalid_without_stack_overflow() {
        let mut target = json!({});
        let huge = "/a".repeat(100_000);
        let err = pointer_set(&mut target, &huge, json!(1)).unwrap_err();
        assert_eq!(err.code, "local_input");
        assert_eq!(target, json!({}));

        let too_deep = "/a".repeat(MAX_POINTER_DEPTH + 1);
        assert!(too_deep.len() <= MAX_POINTER_BYTES);
        let err = pointer_set(&mut target, &too_deep, json!(1)).unwrap_err();
        assert_eq!(err.code, "local_input");

        let too_long = format!("/{}", "a".repeat(MAX_POINTER_BYTES));
        let err = pointer_set(&mut target, &too_long, json!(1)).unwrap_err();
        assert_eq!(err.code, "local_input");

        let at_limit = "/a".repeat(MAX_POINTER_DEPTH);
        pointer_set(&mut target, &at_limit, json!(42)).unwrap();
        assert_eq!(target.pointer(&at_limit), Some(&json!(42)));
    }

    #[test]
    fn pointer_set_handles_arrays_escapes_and_scalars() {
        let mut target = json!({});
        pointer_set(&mut target, "/a~1b/c~0d/0", json!("x")).unwrap();
        assert_eq!(target, json!({"a/b": {"c~d": ["x"]}}));

        pointer_set(&mut target, "/a~1b/c~0d/-", json!("y")).unwrap();
        assert_eq!(target, json!({"a/b": {"c~d": ["x", "y"]}}));

        assert_eq!(
            pointer_set(&mut target, "/a~1b/c~0d/5", json!("z"))
                .unwrap_err()
                .code,
            "local_input"
        );
        assert_eq!(
            pointer_set(&mut target, "/a~1b/c~0d/0/sub", json!("z"))
                .unwrap_err()
                .code,
            "local_input"
        );
    }

    #[test]
    fn safe_path_refuses_windows_reserved_names_forbidden_chars_and_trailing_dots_or_spaces() {
        for bad in [
            "CON",
            "con",
            "PRN",
            "AUX",
            "NUL",
            "COM1",
            "com9",
            "LPT1",
            "lpt9",
            "con.json",
            "dir/NUL.txt",
            "dir/COM3/script.py",
            "a<b.txt",
            "a>b.txt",
            "a:b.txt",
            "a\"b.txt",
            "a|b.txt",
            "a?b.txt",
            "a*b.txt",
            "a\0b.txt",
            "a\nb.txt",
            "a\tb.txt",
            "trailing.",
            "trailing ",
            "dir./file.py",
            "dir /file.py",
            ".NOFY-SOURCE.LOCK",
            ".Nofy-Source-Transaction/before.json",
        ] {
            let err = safe_path(bad).unwrap_err();
            assert_eq!(err.code, "local_input", "expected rejection for {bad:?}");
        }
        for good in [
            "preset.json",
            "modules/policy.rhai",
            ".hidden",
            "a.b",
            "com0",
            "com10",
            "console.py",
            "dir with space/file.txt",
            "文件说明.md",
        ] {
            assert!(safe_path(good).is_ok(), "expected acceptance for {good:?}");
        }
    }

    #[test]
    fn source_validate_rejects_case_collisions_and_resource_limits() {
        let mut collided = Source::empty("coder", "coder").unwrap();
        collided.files.insert("Foo.py".into(), File::text("a"));
        collided.files.insert("foo.py".into(), File::text("b"));
        let err = collided.validate().unwrap_err();
        assert_eq!(err.code, "local_input");

        let mut nested_collided = Source::empty("coder", "coder").unwrap();
        nested_collided
            .files
            .insert("Modules/Helper.py".into(), File::text("a"));
        nested_collided
            .files
            .insert("modules/helper.py".into(), File::text("b"));
        assert_eq!(nested_collided.validate().unwrap_err().code, "local_input");

        let mut dir_prefix_collided = Source::empty("coder", "coder").unwrap();
        dir_prefix_collided
            .files
            .insert("Parent".into(), File::text("file"));
        dir_prefix_collided
            .files
            .insert("parent/child.py".into(), File::text("child"));
        assert_eq!(
            dir_prefix_collided.validate().unwrap_err().code,
            "local_input"
        );

        let mut at_file_limit = Source {
            files: BTreeMap::new(),
            declaration: "preset.json".into(),
            settings_json: None,
        };
        at_file_limit
            .files
            .insert("preset.json".into(), File::text("{}"));
        for index in 1..MAX_SOURCE_FILES {
            at_file_limit
                .files
                .insert(format!("f/{index}.txt"), File::text("x"));
        }
        assert!(at_file_limit.validate().is_ok());

        at_file_limit
            .files
            .insert("f/overflow.txt".into(), File::text("x"));
        assert_eq!(at_file_limit.validate().unwrap_err().code, "local_input");

        let mut oversized_utf8 = Source {
            files: BTreeMap::new(),
            declaration: "preset.json".into(),
            settings_json: None,
        };
        oversized_utf8
            .files
            .insert("preset.json".into(), File::text("{}"));
        oversized_utf8.files.insert(
            "huge.txt".into(),
            File::text("a".repeat(MAX_SOURCE_TOTAL_BYTES)),
        );
        assert_eq!(oversized_utf8.validate().unwrap_err().code, "local_input");

        let mut oversized_base64 = Source {
            files: BTreeMap::new(),
            declaration: "preset.json".into(),
            settings_json: None,
        };
        oversized_base64
            .files
            .insert("preset.json".into(), File::text("{}"));
        oversized_base64.files.insert(
            "huge.bin".into(),
            File {
                encoding: Encoding::Base64,
                content: "A".repeat((MAX_SOURCE_TOTAL_BYTES / 3 + 2) * 4),
                executable: false,
            },
        );
        assert_eq!(oversized_base64.validate().unwrap_err().code, "local_input");
    }
}
