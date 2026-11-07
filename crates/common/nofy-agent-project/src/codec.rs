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
pub fn safe_path(path: &str) -> Result<()> {
    if path.is_empty()
        || path.contains('\\')
        || path.chars().any(char::is_control)
        || matches!(
            path.split('/').next(),
            Some(".nofy-source.lock" | ".nofy-source-transaction")
        )
        || path
            .split('/')
            .any(|p| p.is_empty() || p == "." || p == ".." || p.contains(':'))
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
        for (path, file) in &self.files {
            safe_path(path)?;
            file.decode()?;
            let mut parent = std::path::Path::new(path).parent();
            while let Some(p) = parent {
                if let Some(p) = p.to_str().filter(|p| !p.is_empty())
                    && self.files.contains_key(p)
                {
                    return Err(Error::new(
                        "local_input",
                        "source file path is also a directory prefix",
                    ));
                }
                parent = p.parent();
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
pub fn pointer_set(value: &mut Value, pointer: &str, replacement: Value) -> Result<()> {
    if pointer.is_empty() {
        *value = replacement;
        return Ok(());
    }
    if !pointer.starts_with('/') {
        return Err(Error::new("local_input", "setting requires a JSON Pointer"));
    }
    let mut tokens = vec![];
    for part in pointer[1..].split('/') {
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
    fn set(v: &mut Value, tokens: &[String], replacement: Value) -> Result<()> {
        if tokens.is_empty() {
            *v = replacement;
            return Ok(());
        }
        if v.is_null() {
            *v = if tokens[0].parse::<usize>().is_ok() {
                json!([])
            } else {
                json!({})
            };
        }
        match v {
            Value::Object(map) => {
                let child = map.entry(tokens[0].clone()).or_insert(Value::Null);
                set(child, &tokens[1..], replacement)
            }
            Value::Array(items) => {
                let index = if tokens[0] == "-" {
                    items.len()
                } else {
                    tokens[0]
                        .parse::<usize>()
                        .map_err(|_| Error::new("local_input", "invalid array pointer index"))?
                };
                if index > items.len() {
                    return Err(Error::new("local_input", "array pointer skips elements"));
                }
                if index == items.len() {
                    items.push(Value::Null);
                }
                set(&mut items[index], &tokens[1..], replacement)
            }
            _ => Err(Error::new("local_input", "JSON Pointer crosses a scalar")),
        }
    }
    set(value, &tokens, replacement)
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
}
