//! TOML loading, layered merging, and `$VAR` expansion.
//!
//! The merged result is the **default** config; requirements layers
//! sit on top via [`crate::validation`].

use std::path::Path;

use crate::paths::{system_config_dir, user_nofy_home};
use crate::validation::{load_requirements, load_system_requirements};
use crate::version_overrides::{self, apply_version_overrides};

/// Read and parse a TOML file WITHOUT `$VAR` expansion (empty table if absent).
/// Shared core of [`load_toml_file`] and the hook-layer read.
fn read_toml_file(path: &Path) -> std::io::Result<toml::Value> {
    match std::fs::read_to_string(path) {
        Ok(s) => parse_toml_str(&s, path),
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => {
            Ok(toml::Value::Table(toml::map::Map::new()))
        }
        Err(e) => {
            tracing::error!(file = %path.display(), "config file unreadable: {e}");
            Err(e)
        }
    }
}

fn parse_toml_str(s: &str, path: &Path) -> std::io::Result<toml::Value> {
    match toml::from_str::<toml::Value>(s) {
        Ok(v) => Ok(v),
        Err(e) => {
            // Built from the span, never from Display — Display echoes the
            // offending source line, which may carry a secret. Safe to log and
            // to return to a client.
            let detail = toml_error_detail(s, &e);
            tracing::error!(file = %path.display(), "config toml has syntax errors: {detail}");
            Err(std::io::Error::other(detail))
        }
    }
}

/// JSON 用户配置文件名：存在时优先于 [`USER_CONFIG_FILENAME`]（JSON 体系）。
pub const USER_CONFIG_FILENAME_JSON: &str = "config.json";

/// `home` 下用户配置的**读取**文件名。
///
/// JSON 优先；仅当还没有 `config.json`、但遗留 `config.toml` 仍在时读 TOML。
/// 两者皆无时返回 `config.json`（新建默认）。写回永远走
/// [`user_config_save_path_at`]，不会再创建 TOML。
pub fn user_config_filename_at(home: &Path) -> &'static str {
    if home.join(USER_CONFIG_FILENAME_JSON).is_file() {
        USER_CONFIG_FILENAME_JSON
    } else if home.join(USER_CONFIG_FILENAME).is_file() {
        USER_CONFIG_FILENAME
    } else {
        USER_CONFIG_FILENAME_JSON
    }
}

/// 用户配置的**写入**路径：永远是 `config.json`。TOML 无法表达供应商嵌套
/// `models` 子表，写回不再生成 `.toml`。
pub fn user_config_save_path_at(home: &Path) -> std::path::PathBuf {
    home.join(USER_CONFIG_FILENAME_JSON)
}

/// `home` 下用户配置文件的完整路径（两者皆无时返回 json 名，作为新建默认）。
pub fn user_config_path_at(home: &Path) -> std::path::PathBuf {
    home.join(user_config_filename_at(home))
}

/// `$NOFY_HOME` 下用户配置文件路径；无可用 home 返回 None。
pub fn user_config_path() -> Option<std::path::PathBuf> {
    user_nofy_home().map(|h| user_config_path_at(&h))
}

/// `$NOFY_HOME/config.json`；无可用 home 返回 None。
pub fn user_config_save_path() -> Option<std::path::PathBuf> {
    user_nofy_home().map(|h| user_config_save_path_at(&h))
}

/// 文件是否为 JSON 配置：扩展名 .json，或内容首非空字符为 `{`
/// （合法 TOML 文档不可能以 `{` 开头）。
fn is_json_config(path: &Path, content: &str) -> bool {
    path.extension().and_then(|e| e.to_str()) == Some("json")
        || content.trim_start().starts_with('{')
}

/// serde_json → toml::Value。JSON null 在 TOML 无对应：表内键丢弃、数组元素丢弃（告警）。
fn json_to_toml(v: &serde_json::Value) -> Option<toml::Value> {
    match v {
        serde_json::Value::Null => None,
        serde_json::Value::Bool(b) => Some(toml::Value::Boolean(*b)),
        serde_json::Value::Number(n) => Some(if let Some(i) = n.as_i64() {
            toml::Value::Integer(i)
        } else if let Some(u) = n.as_u64() {
            toml::Value::Integer(u as i64)
        } else {
            toml::Value::Float(n.as_f64().unwrap_or(0.0))
        }),
        serde_json::Value::String(s) => Some(toml::Value::String(s.clone())),
        serde_json::Value::Array(items) => Some(toml::Value::Array(
            items.iter().filter_map(json_to_toml).collect(),
        )),
        serde_json::Value::Object(map) => {
            let mut table = toml::map::Map::new();
            for (k, item) in map {
                if let Some(converted) = json_to_toml(item) {
                    table.insert(k.clone(), converted);
                }
            }
            Some(toml::Value::Table(table))
        }
    }
}

/// toml::Value → serde_json::Value（写回 JSON 用）。
pub fn toml_to_json(v: &toml::Value) -> serde_json::Value {
    match v {
        toml::Value::String(s) => serde_json::Value::String(s.clone()),
        toml::Value::Integer(i) => serde_json::Value::Number((*i).into()),
        toml::Value::Float(f) => serde_json::Number::from_f64(*f)
            .map(serde_json::Value::Number)
            .unwrap_or(serde_json::Value::Null),
        toml::Value::Boolean(b) => serde_json::Value::Bool(*b),
        toml::Value::Datetime(d) => serde_json::Value::String(d.to_string()),
        toml::Value::Array(items) => {
            serde_json::Value::Array(items.iter().map(toml_to_json).collect())
        }
        toml::Value::Table(table) => serde_json::Value::Object(
            table
                .iter()
                .map(|(k, item)| (k.clone(), toml_to_json(item)))
                .collect(),
        ),
    }
}

/// 按格式嗅探读取配置文件（TOML 或 JSON），不做 `$VAR` 展开；缺文件返回空表。
fn read_config_file_sniffed(path: &Path) -> std::io::Result<toml::Value> {
    match std::fs::read_to_string(path) {
        Ok(s) => {
            if is_json_config(path, &s) {
                match serde_json::from_str::<serde_json::Value>(&s) {
                    Ok(j) => Ok(json_to_toml(&j)
                        .unwrap_or_else(|| toml::Value::Table(toml::map::Map::new()))),
                    Err(e) => {
                        // serde_json 的 Display 只含消息与行列号，不回显源码行（可能带密钥）。
                        let detail = format!("JSON parse error: {e}");
                        tracing::error!(file = %path.display(), "config json has syntax errors: {detail}");
                        Err(std::io::Error::other(detail))
                    }
                }
            } else {
                parse_toml_str(&s, path)
            }
        }
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => {
            Ok(toml::Value::Table(toml::map::Map::new()))
        }
        Err(e) => {
            tracing::error!(file = %path.display(), "config file unreadable: {e}");
            Err(e)
        }
    }
}

fn is_json_path(path: &Path) -> bool {
    path.extension().and_then(|e| e.to_str()) == Some("json")
}

/// 原子写回任意配置文件：用户 `config.toml` 一律改写为旁路 `config.json`。
pub fn save_config_value_at(path: &Path, value: &toml::Value) -> std::io::Result<()> {
    let (dest, retire_home) = json_save_dest(path);
    let text = if is_json_path(&dest) {
        serde_json::to_string_pretty(&toml_to_json(value))
            .map_err(|e| std::io::Error::other(e.to_string()))?
            + "\n"
    } else {
        toml::to_string_pretty(value).map_err(|e| std::io::Error::other(e.to_string()))?
    };
    atomic_write_text(&dest, &text)?;
    if let Some(home) = retire_home {
        retire_legacy_user_toml(home);
    }
    Ok(())
}

/// 把一段 TOML 文本写到 `path`：用户 `config.toml` / `.json` 都落到 JSON。
pub fn save_config_toml_text_at(path: &Path, text: &str) -> std::io::Result<()> {
    let (dest, retire_home) = json_save_dest(path);
    if is_json_path(&dest) {
        let value: toml::Value =
            toml::from_str(text).map_err(|e| std::io::Error::other(e.to_string()))?;
        save_config_value_at(&dest, &value)?;
    } else {
        atomic_write_text(&dest, text)?;
    }
    if let Some(home) = retire_home {
        retire_legacy_user_toml(home);
    }
    Ok(())
}

/// `config.toml` → sibling `config.json` plus a retire of the toml after write.
fn json_save_dest(path: &Path) -> (std::path::PathBuf, Option<&Path>) {
    if path.file_name().and_then(|n| n.to_str()) == Some(USER_CONFIG_FILENAME) {
        (
            path.with_file_name(USER_CONFIG_FILENAME_JSON),
            path.parent(),
        )
    } else {
        (path.to_path_buf(), None)
    }
}

/// 读出配置的 TOML 文本视图：JSON 目标转成等价 TOML 文本，TOML 目标原样返回
/// （保留注释）。缺文件按 io 错误上抛，由调用方决定语义。供仍按 TOML 文本做
/// 局部改写的调用方复用，改写结果须用 [`save_config_toml_text_at`] 写回以保持
/// 目标格式。
pub fn load_config_text_as_toml(path: &Path) -> std::io::Result<String> {
    let raw = std::fs::read_to_string(path)?;
    if !is_json_config(path, &raw) {
        return Ok(raw);
    }
    // serde_json 的 Display 不回显源码行（可能带密钥）。
    let json: serde_json::Value = serde_json::from_str(&raw)
        .map_err(|e| std::io::Error::other(format!("JSON parse error: {e}")))?;
    let value = json_to_toml(&json).unwrap_or_else(|| toml::Value::Table(toml::map::Map::new()));
    toml::to_string_pretty(&value).map_err(|e| std::io::Error::other(e.to_string()))
}

/// 原子写回用户配置：永远写 `config.json`。成功后把遗留 `config.toml` 改名为
/// `.bak`，避免两份文件并存、下次读取又绕回 TOML。
pub fn save_user_config_value(value: &toml::Value) -> std::io::Result<()> {
    let home = user_nofy_home().ok_or_else(|| std::io::Error::other("no nofy home resolvable"))?;
    save_config_value_at(&user_config_save_path_at(&home), value)?;
    retire_legacy_user_toml(&home);
    Ok(())
}

/// 写回一段 TOML 文本到用户配置：转换成 JSON 落到 `config.json`（注释不保留）。
pub fn save_user_config_toml_text(text: &str) -> std::io::Result<()> {
    let home = user_nofy_home().ok_or_else(|| std::io::Error::other("no nofy home resolvable"))?;
    save_config_toml_text_at(&user_config_save_path_at(&home), text)?;
    retire_legacy_user_toml(&home);
    Ok(())
}

/// 用户配置已落到 JSON 后，把遗留 `config.toml` 挪走。失败只记日志，不回滚 JSON。
pub(crate) fn retire_legacy_user_toml(home: &Path) {
    let toml_path = home.join(USER_CONFIG_FILENAME);
    if !toml_path.is_file() {
        return;
    }
    let stamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0);
    let bak = home.join(format!("config.toml.bak-json-{stamp}"));
    match std::fs::rename(&toml_path, &bak) {
        Ok(()) => tracing::info!(
            from = %toml_path.display(),
            to = %bak.display(),
            "retired legacy config.toml after JSON save"
        ),
        Err(e) => tracing::warn!(
            path = %toml_path.display(),
            error = %e,
            "failed to retire legacy config.toml after JSON save"
        ),
    }
}

fn atomic_write_text(path: &Path, text: &str) -> std::io::Result<()> {
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)?;
    }
    // 保留原文件权限位（config 常含 api_key，用户可能 chmod 600）。
    #[cfg(unix)]
    let prior_mode: Option<u32> = std::fs::metadata(path)
        .ok()
        .map(|m| {
            use std::os::unix::fs::PermissionsExt;
            m.permissions().mode()
        })
        .or(Some(0o600));
    let tmp = path.with_file_name(format!(
        ".{}.tmp-{}-{}",
        path.file_name()
            .and_then(|s| s.to_str())
            .unwrap_or("config"),
        std::process::id(),
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_nanos())
            .unwrap_or(0)
    ));
    std::fs::write(&tmp, text)?;
    #[cfg(unix)]
    if let Some(mode) = prior_mode {
        use std::os::unix::fs::PermissionsExt;
        let _ = std::fs::set_permissions(&tmp, std::fs::Permissions::from_mode(mode));
    }
    std::fs::rename(&tmp, path)
}

/// 嗅探读取（TOML/JSON），不应用 `[[version_overrides]]`——写回侧往返用，
/// 避免往返丢掉 version_overrides 段。
pub fn load_raw_config_file(path: &Path) -> std::io::Result<toml::Value> {
    read_config_file_sniffed(path)
}

/// Load and parse a TOML file, expanding `$VAR` references. Empty table if absent.
pub fn load_toml_file(path: &Path) -> std::io::Result<toml::Value> {
    let mut v = read_toml_file(path)?;
    expand_env_vars_in_toml(&mut v);
    Ok(v)
}

/// A snippet-free description of a TOML parse error: `"TOML parse error at line
/// L, column C: <what>"` (or just the message when there's no span). Never
/// includes the offending source line — `Display` echoes it and it may carry a
/// secret — so this is safe to log or surface to a client. Shared with the trace
/// `config_files` artifact so the redaction rule lives in one place.
pub fn toml_error_detail(src: &str, e: &toml::de::Error) -> String {
    match e.span() {
        Some(span) => {
            let (line, col) = line_col(src, span.start);
            format!(
                "TOML parse error at line {line}, column {col}: {}",
                e.message()
            )
        }
        None => e.message().to_owned(),
    }
}

/// 1-based (line, column) of a byte offset within `src`.
fn line_col(src: &str, byte: usize) -> (usize, usize) {
    let mut line = 1;
    let mut col = 1;
    for (i, ch) in src.char_indices() {
        if i >= byte {
            break;
        }
        if ch == '\n' {
            line += 1;
            col = 1;
        } else {
            col += 1;
        }
    }
    (line, col)
}

/// [`load_config_file_sniffed`] plus that layer's `[[version_overrides]]`. Use for
/// nofy config files (TOML or JSON); use [`load_toml_file`] for unrelated TOML.
pub fn load_config_file(path: &Path) -> std::io::Result<toml::Value> {
    let mut v = read_config_file_sniffed(path)?;
    apply_version_overrides_with_registered(&mut v)?;
    Ok(v)
}

pub fn load_from_disk() -> std::io::Result<toml::Value> {
    let filename = user_nofy_home()
        .as_deref()
        .map(user_config_filename_at)
        .unwrap_or(USER_CONFIG_FILENAME_JSON);
    load_user_config_layer(user_nofy_home().as_deref(), filename)
}

/// User config filename (`$NOFY_HOME/config.toml`), shared by the loaders here.
pub const USER_CONFIG_FILENAME: &str = "config.toml";

/// Managed config filename, shared by the loaders in this module.
pub const MANAGED_CONFIG_FILENAME: &str = "managed_config.toml";

/// Requirements (cloud-cache) filename — the sibling server-synced artifact.
pub const REQUIREMENTS_FILENAME: &str = "requirements.toml";

pub fn load_managed_config() -> std::io::Result<toml::Value> {
    load_user_config_layer(user_nofy_home().as_deref(), MANAGED_CONFIG_FILENAME)
}

/// Load a user-tier config layer from `<home>/<filename>`. With no resolvable
/// user home, returns an empty table rather than reading a cwd-relative
/// `.nofy/<filename>` (the cwd-fallback would silently promote an untrusted
/// project `.nofy` to the user tier).
fn load_user_config_layer(home: Option<&Path>, filename: &str) -> std::io::Result<toml::Value> {
    match home {
        Some(g) => load_config_file(&g.join(filename)),
        None => Ok(toml::Value::Table(toml::map::Map::new())),
    }
}

pub fn load_system_managed_config() -> std::io::Result<toml::Value> {
    let mut v = match system_config_dir() {
        Some(dir) => load_toml_file(&dir.join(MANAGED_CONFIG_FILENAME))?,
        None => toml::Value::Table(toml::map::Map::new()),
    };
    apply_version_overrides_with_registered(&mut v)?;
    Ok(v)
}

/// One managed-config layer: the parsed TOML and the file it came from.
#[derive(Debug, Clone)]
pub struct ManagedConfigLayer {
    pub value: toml::Value,
    pub path: std::path::PathBuf,
    /// `true` for the root-owned system layer (`/etc/nofy`), derived from the
    /// load directory.
    pub is_system: bool,
}

/// All `managed_config.toml` layers in apply order (system first, user last).
/// Absent layers are skipped; unparsable layers are skipped with a warning.
/// One bad layer never drops the others.
pub fn managed_config_layers() -> Vec<ManagedConfigLayer> {
    managed_config_layers_at(system_config_dir().as_deref(), user_nofy_home().as_deref())
}

/// [`managed_config_layers`] with explicit directories.
pub fn managed_config_layers_at(
    system_dir: Option<&Path>,
    user_home: Option<&Path>,
) -> Vec<ManagedConfigLayer> {
    let mut layers = Vec::new();
    for (dir, is_system) in [(system_dir, true), (user_home, false)] {
        let Some(path) = dir.map(|d| d.join(MANAGED_CONFIG_FILENAME)) else {
            continue;
        };
        if !path.is_file() {
            continue;
        }
        match load_config_file(&path) {
            Ok(value) => layers.push(ManagedConfigLayer {
                value,
                path,
                is_system,
            }),
            Err(e) => {
                tracing::warn!(path = %path.display(), error = %e, "skipping managed_config.toml layer that failed to load or parse")
            }
        }
    }
    layers
}

/// A hook's origin (held by `nofy_hooks::HookSpec::layer`). Defined here, not
/// in `nofy-hooks`, since the dep direction is `nofy-hooks -> nofy-config`;
/// this crate sets the config tiers, `File`/`Plugin` are set downstream.
#[derive(Debug, Clone, Copy, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum HookProvenance {
    /// `/etc/nofy/managed_config.toml`.
    SystemManaged,
    /// `$NOFY_HOME/managed_config.toml` (server-synced).
    Managed,
    /// `requirements.toml` (user or system tier).
    Requirements,
    /// `$NOFY_HOME/requirements.toml` (user-writable). Kept distinct from the
    /// root-owned requirements tier so hook enforcement never trusts a path
    /// merely because its filename is `requirements.toml`.
    UserRequirements,
    /// `$NOFY_HOME/config.toml`.
    User,
    /// A JSON hook file (the hooks directory, a vendor settings file, or a
    /// configured hooks path).
    File,
    /// A plugin-contributed hook.
    Plugin,
    /// A tier this build doesn't recognize (e.g. a newer peer's provenance over
    /// the wire). Forward-tolerant so an unknown value degrades to a
    /// conservative origin instead of failing the whole `HookRegistry` decode.
    #[serde(other)]
    Unknown,
}

/// Defaults to `File` so pre-provenance wire records decode as the most
/// conservative origin.
impl Default for HookProvenance {
    fn default() -> Self {
        Self::File
    }
}

impl HookProvenance {
    /// Root-owned policy tiers whose hooks cannot be disabled by the user.
    pub fn is_managed_policy(self) -> bool {
        matches!(self, Self::SystemManaged | Self::Requirements)
    }

    /// The snake_case wire string (matches the derived serde representation).
    pub fn as_str(self) -> &'static str {
        match self {
            Self::SystemManaged => "system_managed",
            Self::Managed => "managed",
            Self::Requirements => "requirements",
            Self::UserRequirements => "user_requirements",
            Self::User => "user",
            Self::File => "file",
            Self::Plugin => "plugin",
            Self::Unknown => "unknown",
        }
    }
}

impl std::str::FromStr for HookProvenance {
    type Err = std::convert::Infallible;

    /// Inverse of [`HookProvenance::as_str`]. Unrecognized strings map to
    /// [`HookProvenance::Unknown`] (forward-tolerant), so this never fails.
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Ok(match s {
            "system_managed" => Self::SystemManaged,
            "managed" => Self::Managed,
            "requirements" => Self::Requirements,
            "user_requirements" => Self::UserRequirements,
            "user" => Self::User,
            "file" => Self::File,
            "plugin" => Self::Plugin,
            _ => Self::Unknown,
        })
    }
}

/// One config layer's `hooks` subtree (read without `$VAR` expansion) plus its
/// provenance.
#[derive(Debug, Clone)]
pub struct HookConfigLayer {
    provenance: HookProvenance,
    source_name: String,
    path: std::path::PathBuf,
    hooks: toml::Value,
}

impl HookConfigLayer {
    /// Construct a layer directly (in-memory config and tests); the synthesized
    /// `path` mirrors `source_name`. The normal path is [`hook_config_layers`].
    pub fn new(
        provenance: HookProvenance,
        source_name: impl Into<String>,
        hooks: toml::Value,
    ) -> Self {
        let source_name = source_name.into();
        let path = std::path::PathBuf::from(&source_name);
        Self {
            provenance,
            source_name,
            path,
            hooks,
        }
    }

    pub fn provenance(&self) -> HookProvenance {
        self.provenance
    }

    /// A stable label for this layer (e.g. `"managed"`, `"requirements/user"`),
    /// used to prefix hook names for display and dedup.
    pub fn source_name(&self) -> &str {
        &self.source_name
    }

    /// The layer's backing file, so parse errors can cite a real path.
    pub fn path(&self) -> &std::path::Path {
        &self.path
    }

    /// The raw `hooks` table, unexpanded so a literal `${VAR}` reaches the runner.
    pub fn hooks(&self) -> &toml::Value {
        &self.hooks
    }
}

/// All config-layer `hooks` blocks, highest authority first (matching
/// [`effective_config_base`]). Read WITHOUT env-expansion and never merged (hooks
/// combine additively downstream); absent/unparsable layers are skipped with a
/// warning so one bad layer can't drop the others. macOS MDM is excluded (not a
/// TOML file; MDM hooks belong to the enforcement work).
pub fn hook_config_layers() -> Vec<HookConfigLayer> {
    hook_config_layers_at(system_config_dir().as_deref(), user_nofy_home().as_deref())
}

/// [`hook_config_layers`] with explicit directories, for tests.
pub fn hook_config_layers_at(
    system_dir: Option<&Path>,
    user_home: Option<&Path>,
) -> Vec<HookConfigLayer> {
    /// One candidate config-hook layer: which directory + filename to read, and
    /// the provenance/label to stamp on hooks found there.
    struct LayerSpec<'a> {
        dir: Option<&'a Path>,
        filename: &'a str,
        provenance: HookProvenance,
        source_name: &'a str,
    }

    // Highest config authority first, matching `effective_config_base` precedence
    // (requirements > user > managed > system_managed; user overrides managed in
    // this model). Order only affects which label a byte-identical duplicate keeps
    // under first-wins dedup; every distinct hook runs regardless.
    let user_filename = user_home
        .map(user_config_filename_at)
        .unwrap_or(USER_CONFIG_FILENAME_JSON);
    let specs = [
        LayerSpec {
            dir: system_dir,
            filename: REQUIREMENTS_FILENAME,
            provenance: HookProvenance::Requirements,
            source_name: "requirements/system",
        },
        LayerSpec {
            dir: user_home,
            filename: REQUIREMENTS_FILENAME,
            provenance: HookProvenance::UserRequirements,
            source_name: "requirements/user",
        },
        LayerSpec {
            dir: user_home,
            filename: user_filename,
            provenance: HookProvenance::User,
            source_name: "user",
        },
        LayerSpec {
            dir: user_home,
            filename: MANAGED_CONFIG_FILENAME,
            provenance: HookProvenance::Managed,
            source_name: "managed",
        },
        LayerSpec {
            dir: system_dir,
            filename: MANAGED_CONFIG_FILENAME,
            provenance: HookProvenance::SystemManaged,
            source_name: "system_managed",
        },
    ];

    let mut layers = Vec::new();
    for LayerSpec {
        dir,
        filename,
        provenance,
        source_name,
    } in specs
    {
        let Some(path) = dir.map(|d| d.join(filename)) else {
            continue;
        };
        if !path.is_file() {
            continue;
        }
        // No `$VAR` expansion: a literal `${VAR}` must reach the hook runner, which
        // does the single expansion (expanding here would double-expand).
        let mut value = match read_config_file_sniffed(&path) {
            Ok(v) => v,
            Err(e) => {
                tracing::warn!(path = %path.display(), error = %e, "skipping config layer whose hooks could not be read");
                continue;
            }
        };
        // Apply `[[version_overrides]]` (parity with `load_config_file`); deep-merge
        // only, no `$VAR` expansion, so the raw-read invariant holds.
        if let Err(e) = apply_version_overrides_with_registered(&mut value) {
            tracing::warn!(path = %path.display(), error = %e, "skipping config layer whose version_overrides failed to apply");
            continue;
        }
        let Some(hooks) = value.get("hooks") else {
            continue;
        };
        if !hooks.is_table() {
            tracing::warn!(path = %path.display(), "ignoring non-table `hooks` value in config layer");
            continue;
        }
        layers.push(HookConfigLayer {
            provenance,
            source_name: source_name.to_string(),
            path: path.clone(),
            hooks: hooks.clone(),
        });
    }
    layers
}

/// Layers lowest→highest priority. `[[campaigns]]` taken off each layer at load.
#[derive(Clone)]
pub struct ConfigLayers {
    pub system_managed: toml::Value,
    pub managed: toml::Value,
    pub user: toml::Value,
    pub user_requirements: Option<toml::Value>,
    pub system_requirements: Option<toml::Value>,
    /// macOS MDM requirements; highest requirements tier when present.
    pub mdm_requirements: Option<toml::Value>,
    pub campaigns: crate::campaigns::CampaignOverrides,
}

impl Default for ConfigLayers {
    fn default() -> Self {
        Self {
            system_managed: toml::Value::Table(Default::default()),
            managed: toml::Value::Table(Default::default()),
            user: toml::Value::Table(Default::default()),
            user_requirements: None,
            system_requirements: None,
            mdm_requirements: None,
            campaigns: crate::campaigns::CampaignOverrides::default(),
        }
    }
}

impl ConfigLayers {
    pub fn load() -> std::io::Result<Self> {
        use crate::campaigns::{CampaignOverrides, take_campaign_entries};

        let mut system_managed = load_system_managed_config()?;
        let system_managed_campaigns = take_campaign_entries(&mut system_managed, "system_managed");

        let mut managed = load_managed_config()?;
        let managed_campaigns = take_campaign_entries(&mut managed, "managed");

        let mut user = load_from_disk()?;
        let user_campaigns = take_campaign_entries(&mut user, "user");

        let mut user_requirements = load_requirements();
        let mut system_requirements = load_system_requirements();
        let mut mdm_requirements = crate::validation::mdm_requirements_value();

        // Highest-authority requirements tier first: `merge_campaign_entries` is
        // first-id-wins, so a duplicate campaign id must resolve mdm > system >
        // user — matching the layer precedence in `effective_config_base` (where
        // mdm is merged last/highest).
        let mut requirements_campaigns = Vec::new();
        if let Some(ref mut req) = mdm_requirements {
            requirements_campaigns.extend(take_campaign_entries(req, "requirements"));
        }
        if let Some(ref mut req) = system_requirements {
            requirements_campaigns.extend(take_campaign_entries(req, "requirements"));
        }
        if let Some(ref mut req) = user_requirements {
            requirements_campaigns.extend(take_campaign_entries(req, "requirements"));
        }

        Ok(Self {
            system_managed,
            managed,
            user,
            user_requirements,
            system_requirements,
            mdm_requirements,
            campaigns: CampaignOverrides {
                requirements: requirements_campaigns,
                user: user_campaigns,
                managed: managed_campaigns,
                system_managed: system_managed_campaigns,
            },
        })
    }

    /// Layer merge only (no campaign overlay).
    pub fn effective_config_base(&self) -> toml::Value {
        let mut merged = self.system_managed.clone();
        deep_merge_toml(&mut merged, &self.managed);
        deep_merge_toml(&mut merged, &self.user);
        if let Some(req) = &self.user_requirements {
            deep_merge_toml(&mut merged, req);
        }
        if let Some(sys_req) = &self.system_requirements {
            deep_merge_toml(&mut merged, sys_req);
        }
        if let Some(mdm_req) = &self.mdm_requirements {
            deep_merge_toml(&mut merged, mdm_req);
        }
        merged
    }

    /// Campaign source slices in priority order (first id wins):
    /// requirements > user > managed > system_managed. Single source of
    /// truth for the precedence; both this crate and the shell resolver consume it.
    pub fn campaign_source_slices(&self) -> [&[crate::campaigns::CampaignEntry]; 4] {
        [
            &self.campaigns.requirements,
            &self.campaigns.user,
            &self.campaigns.managed,
            &self.campaigns.system_managed,
        ]
    }

    /// Active campaigns against `base`: kill switch → priority merge (first-id-wins)
    /// → drop dismissed. The single place disk campaign resolution lives; the shell
    /// wraps this with the `NOFY_CAMPAIGNS_OVERRIDE` env layer.
    pub fn resolve_campaigns(
        &self,
        base: &toml::Value,
        dismissed_ids: &std::collections::HashSet<String>,
    ) -> Vec<crate::campaigns::CampaignEntry> {
        if campaigns_application_disabled(base) {
            return Vec::new();
        }
        let merged = crate::campaigns::merge_campaign_entries(&self.campaign_source_slices());
        crate::campaigns::filter_active_campaigns(merged, dismissed_ids)
    }

    /// Re-merge the requirements layers so an admin's `requirements.toml` always
    /// wins over a campaign overlay, regardless of the campaign's source layer.
    /// Campaigns are full-power (any field), so this is the structural guarantee
    /// that a lower-trust layer's campaign can't override an admin-set field.
    fn reapply_requirements(&self, merged: &mut toml::Value) {
        for req in [
            &self.user_requirements,
            &self.system_requirements,
            &self.mdm_requirements,
        ]
        .into_iter()
        .flatten()
        {
            deep_merge_toml(merged, req);
        }
    }

    /// Apply active campaign patches onto `merged`, then restore requirements
    /// precedence. The single overlay step shared by this crate and the shell.
    pub fn apply_campaign_overrides(
        &self,
        merged: &mut toml::Value,
        active: &[crate::campaigns::CampaignEntry],
    ) {
        crate::campaigns::apply_active_campaign_patches(merged, active);
        self.reapply_requirements(merged);
    }

    /// Layer merge + disk campaign overlay, honoring the kill switch. The
    /// shell's `load_effective_config` is the override-aware path; this is
    /// used by `effective_config_disk_only` and tests.
    pub fn effective_config_with_campaigns(
        &self,
        dismissed_ids: &std::collections::HashSet<String>,
    ) -> toml::Value {
        let mut merged = self.effective_config_base();
        let active = self.resolve_campaigns(&merged, dismissed_ids);
        self.apply_campaign_overrides(&mut merged, &active);
        merged
    }

    /// Disk campaigns + on-disk dismiss (`campaigns_state.json`); **no env
    /// override**. Named to make the divergence from the shell's
    /// `load_effective_config` explicit at every call site.
    pub fn effective_config_disk_only(&self) -> toml::Value {
        self.effective_config_with_campaigns(&load_dismissed_ids_from_home())
    }

    pub fn has_managed(&self) -> bool {
        self.managed.as_table().is_some_and(|t| !t.is_empty())
            || self
                .system_managed
                .as_table()
                .is_some_and(|t| !t.is_empty())
    }

    pub fn has_system_managed(&self) -> bool {
        self.system_managed
            .as_table()
            .is_some_and(|t| !t.is_empty())
    }
}

/// `NOFY_CAMPAIGNS=0` or `[features] campaigns = false` on pre-campaign base.
pub fn campaigns_application_disabled(base_effective: &toml::Value) -> bool {
    if crate::env_bool("NOFY_CAMPAIGNS") == Some(false) {
        return true;
    }
    base_effective
        .get("features")
        .and_then(|f| f.get("campaigns"))
        .and_then(|c| c.as_bool())
        == Some(false)
}

/// Disk layers only (no env override). Prefer the shell loader
/// (`nofy_shell::util::config::load_effective_config`) when
/// `NOFY_CAMPAIGNS_OVERRIDE` must be honored. The name mirrors the
/// [`ConfigLayers::effective_config_disk_only`] method so the divergence from
/// the override-aware loader is un-ignorable at every call site.
pub fn load_effective_config_disk_only() -> std::io::Result<toml::Value> {
    Ok(ConfigLayers::load()?.effective_config_disk_only())
}

/// On-disk campaign dismiss state. Single source of truth for the file's name,
/// location, and JSON shape — the shell's writer reuses these so the read and
/// write sides can't drift.
pub const CAMPAIGNS_STATE_FILE: &str = "campaigns_state.json";

#[derive(Debug, Clone, Default, serde::Serialize, serde::Deserialize)]
pub struct CampaignsState {
    #[serde(default)]
    pub dismissed_ids: Vec<String>,
}

/// Path to `$NOFY_HOME/campaigns_state.json` under `home`.
pub fn campaigns_state_path(home: &std::path::Path) -> std::path::PathBuf {
    home.join(CAMPAIGNS_STATE_FILE)
}

/// Fail-open dismissed ids from `$NOFY_HOME/campaigns_state.json`.
pub fn load_dismissed_ids_from_home() -> std::collections::HashSet<String> {
    let Some(home) = crate::user_nofy_home() else {
        return std::collections::HashSet::new();
    };
    let Ok(contents) = std::fs::read_to_string(campaigns_state_path(&home)) else {
        return std::collections::HashSet::new();
    };
    serde_json::from_str::<CampaignsState>(&contents)
        .map(|s| s.dismissed_ids.into_iter().collect())
        .unwrap_or_default()
}

/// Applies matching `[[version_overrides]]` patches against the running
/// CLI version; strips the section either way. If the installed version
/// can't be parsed (broken `NOFY_TEST_VERSION` in dev), silently strips
/// without applying — keeps the CLI usable on a bad dev override.
pub fn apply_version_overrides_with_registered(value: &mut toml::Value) -> std::io::Result<()> {
    match nofy_version::installed_semver() {
        Ok(version) => apply_version_overrides(value, &version)
            .map_err(|e| std::io::Error::other(e.to_string())),
        Err(_) => {
            if let Some(table) = value.as_table_mut() {
                table.remove(version_overrides::VERSION_OVERRIDES_KEY);
            }
            Ok(())
        }
    }
}

/// Recursively merge `overrides` into `base`. Values in `overrides` win.
pub fn deep_merge_toml(base: &mut toml::Value, overrides: &toml::Value) {
    if let toml::Value::Table(overrides_table) = overrides
        && let toml::Value::Table(base_table) = base
    {
        for (key, value) in overrides_table {
            if let Some(existing) = base_table.get_mut(key) {
                deep_merge_toml(existing, value);
            } else {
                base_table.insert(key.clone(), value.clone());
            }
        }
    } else {
        *base = overrides.clone();
    }
}

/// Expand `$VAR` / `${VAR}` in all string values.
pub fn expand_env_vars_in_toml(value: &mut toml::Value) {
    match value {
        toml::Value::String(s) => {
            let expanded = expand_env_vars_in_string(s);
            if expanded != *s {
                *s = expanded;
            }
        }
        toml::Value::Array(items) => {
            for item in items {
                expand_env_vars_in_toml(item);
            }
        }
        toml::Value::Table(table) => {
            for (_, item) in table.iter_mut() {
                expand_env_vars_in_toml(item);
            }
        }
        _ => {}
    }
}

/// Expand `$VAR` / `${VAR}` in a single string.
pub fn expand_env_vars_in_string(input: &str) -> String {
    let context = |name: &str| std::env::var(name).ok();
    shellexpand::env_with_context_no_errors(input, context).into_owned()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn write(dir: &Path, name: &str, contents: &str) {
        std::fs::write(dir.join(name), contents).unwrap();
    }

    #[test]
    fn hook_config_layers_reads_each_layer_unmerged_with_provenance() {
        let sys = tempfile::tempdir().unwrap();
        let home = tempfile::tempdir().unwrap();
        write(
            home.path(),
            "config.toml",
            "[[hooks.PreToolUse]]\nmatcher = \"Bash\"\n[[hooks.PreToolUse.hooks]]\ntype = \"command\"\ncommand = \"${HOME}/u.sh\"\n",
        );
        write(
            home.path(),
            MANAGED_CONFIG_FILENAME,
            "[[hooks.PreToolUse]]\n[[hooks.PreToolUse.hooks]]\ntype = \"command\"\ncommand = \"/m.sh\"\n",
        );
        write(
            sys.path(),
            REQUIREMENTS_FILENAME,
            "[[hooks.PostToolUse]]\n[[hooks.PostToolUse.hooks]]\ntype = \"command\"\ncommand = \"/r.sh\"\n",
        );

        let layers = hook_config_layers_at(Some(sys.path()), Some(home.path()));

        // Highest authority first, each layer keeping its own provenance.
        let names: Vec<_> = layers.iter().map(|l| l.source_name().to_string()).collect();
        assert_eq!(names, vec!["requirements/system", "user", "managed"]);
        assert_eq!(layers[1].provenance(), HookProvenance::User);
        // Unmerged, and `${HOME}` stays literal (the runner expands, not the loader).
        let cmd = layers[1].hooks()["PreToolUse"][0]["hooks"][0]["command"]
            .as_str()
            .unwrap();
        assert_eq!(cmd, "${HOME}/u.sh");
    }

    #[test]
    fn hook_config_layers_bad_user_layer_does_not_drop_managed() {
        // A broken user config.toml must not drop the admin managed layer.
        let home = tempfile::tempdir().unwrap();
        write(home.path(), "config.toml", "this is = = not valid toml");
        write(
            home.path(),
            MANAGED_CONFIG_FILENAME,
            "[[hooks.PreToolUse]]\n[[hooks.PreToolUse.hooks]]\ntype = \"command\"\ncommand = \"/m.sh\"\n",
        );
        let layers = hook_config_layers_at(None, Some(home.path()));
        let names: Vec<_> = layers.iter().map(|l| l.source_name().to_string()).collect();
        assert_eq!(names, vec!["managed"]);
    }

    #[test]
    fn full_layer_precedence_requirements_over_config_over_managed() {
        let system_managed: toml::Value =
            toml::from_str("[telemetry]\nmode = \"system_managed_value\"\n").unwrap();
        let managed: toml::Value =
            toml::from_str("[telemetry]\nmode = \"managed_value\"\n").unwrap();
        let user: toml::Value = toml::from_str("[telemetry]\nmode = \"user_value\"\n").unwrap();
        let user_requirements: toml::Value =
            toml::from_str("[telemetry]\nmode = \"user_requirements_value\"\n").unwrap();
        let system_requirements: toml::Value =
            toml::from_str("[telemetry]\nmode = \"system_requirements_value\"\n").unwrap();

        let mut merged = system_managed;
        deep_merge_toml(&mut merged, &managed);
        deep_merge_toml(&mut merged, &user);
        deep_merge_toml(&mut merged, &user_requirements);
        deep_merge_toml(&mut merged, &system_requirements);

        assert_eq!(
            merged["telemetry"]["mode"].as_str(),
            Some("system_requirements_value")
        );
    }

    #[test]
    fn effective_config_mdm_requirements_win_over_system_and_user() {
        // MDM is merged last, so an admin-forced value clamps the effective
        // config over both the user config and the system requirements layer.
        let layers = ConfigLayers {
            user: toml::from_str("[features]\nweb_fetch = true\n").unwrap(),
            system_requirements: Some(toml::from_str("[features]\nweb_fetch = true\n").unwrap()),
            mdm_requirements: Some(toml::from_str("[features]\nweb_fetch = false\n").unwrap()),
            ..Default::default()
        };
        assert_eq!(
            layers.effective_config_disk_only()["features"]["web_fetch"].as_bool(),
            Some(false),
        );
    }

    #[test]
    fn full_precedence_holds_when_values_come_from_version_overrides() {
        let cli_version = semver::Version::parse("1.8.0").unwrap();

        let mut managed: toml::Value = toml::from_str(
            r#"
            [[version_overrides]]
            minimum_version = "1.0.0"
            [version_overrides.telemetry]
            mode = "managed_versioned"
            "#,
        )
        .unwrap();
        let mut user: toml::Value = toml::from_str(
            r#"
            [[version_overrides]]
            minimum_version = "1.0.0"
            [version_overrides.telemetry]
            mode = "user_versioned"
            "#,
        )
        .unwrap();
        let mut requirements: toml::Value = toml::from_str(
            r#"
            [[version_overrides]]
            minimum_version = "1.0.0"
            [version_overrides.telemetry]
            mode = "requirements_versioned"
            "#,
        )
        .unwrap();

        apply_version_overrides(&mut managed, &cli_version).unwrap();
        apply_version_overrides(&mut user, &cli_version).unwrap();
        apply_version_overrides(&mut requirements, &cli_version).unwrap();

        let mut merged = managed;
        deep_merge_toml(&mut merged, &user);
        deep_merge_toml(&mut merged, &requirements);

        assert_eq!(
            merged["telemetry"]["mode"].as_str(),
            Some("requirements_versioned")
        );
    }

    /// Direct contract for `deep_merge_toml`: nested tables merge (siblings
    /// preserved), arrays replace (not concatenate), missing keys insert.
    #[test]
    fn deep_merge_toml_table_merge_array_replace_and_insert() {
        let mut base: toml::Value = toml::from_str(
            r#"
            [features.telemetry]
            enabled = false
            sample_rate = 0.0

            [server]
            allowed = ["a", "b"]
            "#,
        )
        .unwrap();
        let overrides: toml::Value = toml::from_str(
            r#"
            [features.telemetry]
            enabled = true

            [server]
            allowed = ["c"]

            [brand_new]
            x = 1
            "#,
        )
        .unwrap();

        deep_merge_toml(&mut base, &overrides);

        assert_eq!(
            base["features"]["telemetry"]["enabled"].as_bool(),
            Some(true)
        );
        assert_eq!(
            base["features"]["telemetry"]["sample_rate"].as_float(),
            Some(0.0)
        );
        let arr: Vec<_> = base["server"]["allowed"]
            .as_array()
            .unwrap()
            .iter()
            .filter_map(|v| v.as_str())
            .collect();
        assert_eq!(arr, vec!["c"]);
        assert_eq!(base["brand_new"]["x"].as_integer(), Some(1));
    }

    #[test]
    fn user_version_overrides_dont_escape_their_layer() {
        let cli_version = semver::Version::parse("1.8.0").unwrap();
        let mut user: toml::Value = toml::from_str(
            r#"
            [[version_overrides]]
            minimum_version = "1.0.0"
            [version_overrides.telemetry]
            mode = "enabled"
            "#,
        )
        .unwrap();
        apply_version_overrides(&mut user, &cli_version).unwrap();
        assert_eq!(user["telemetry"]["mode"].as_str(), Some("enabled"));

        let requirements: toml::Value = toml::from_str(
            r#"
            [telemetry]
            mode = "disabled"
            "#,
        )
        .unwrap();

        let mut merged = user;
        deep_merge_toml(&mut merged, &requirements);
        assert_eq!(merged["telemetry"]["mode"].as_str(), Some("disabled"));
    }

    #[test]
    fn load_user_config_layer_is_empty_without_user_home() {
        // No resolvable user home: no user layer, and crucially no
        // cwd-relative .nofy read.
        let v = load_user_config_layer(None, "config.toml").unwrap();
        assert_eq!(v.as_table().map(|t| t.is_empty()), Some(true));
    }

    #[test]
    fn load_user_config_layer_reads_file_when_home_present() {
        use std::io::Write;

        let dir = std::env::temp_dir().join(format!("nofy-load-layer-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        let mut f = std::fs::File::create(dir.join("config.toml")).unwrap();
        writeln!(f, "[telemetry]\nmode = \"from_file\"\n").unwrap();

        let v = load_user_config_layer(Some(&dir), "config.toml").unwrap();
        assert_eq!(v["telemetry"]["mode"].as_str(), Some("from_file"));
        let _ = std::fs::remove_dir_all(&dir);
    }

    /// The returned error keeps the parser's kind + location but never the source
    /// snippet, which can carry a secret and would reach a client caller.
    #[test]
    fn parse_error_keeps_kind_but_not_snippet() {
        let dir = std::env::temp_dir().join(format!("nofy-toml-leak-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        let path = dir.join("bad.toml");
        // Duplicate key: the message names the key; the secret-bearing source line is only in Display.
        std::fs::write(
            &path,
            "api_key = \"nofy-secretmustnotleak\"\napi_key = \"nofy-secretmustnotleak2\"\n",
        )
        .unwrap();

        let msg = load_toml_file(&path).unwrap_err().to_string();
        assert!(
            msg.contains("TOML parse error at line 2"),
            "want location: {msg}"
        );
        assert!(msg.contains("duplicate key"), "want parser kind: {msg}");
        assert!(
            !msg.contains("nofy-secretmustnotleak"),
            "leaked the secret value: {msg}"
        );
        assert!(
            !msg.contains('|') && !msg.contains('^'),
            "leaked the source snippet/caret: {msg}"
        );
        let _ = std::fs::remove_dir_all(&dir);
    }

    /// `NOFY_CAMPAIGNS=0` disables campaign application regardless of config.
    /// `NOFY_CAMPAIGNS` is process-global, so this test serializes itself with a
    /// module-local mutex and save/restores the prior value. (This crate has no
    /// `serial_test` dev-dep and no other test reads this var, so a local guard
    /// is sufficient.)
    #[test]
    fn kill_switch_env_var_disables() {
        static ENV_GUARD: std::sync::Mutex<()> = std::sync::Mutex::new(());
        let _g = ENV_GUARD.lock().unwrap_or_else(|p| p.into_inner());
        let prior = std::env::var_os("NOFY_CAMPAIGNS");
        let empty = toml::Value::Table(Default::default());

        // SAFETY: ENV_GUARD serializes this against itself; no other test in the
        // crate mutates or reads NOFY_CAMPAIGNS concurrently.
        unsafe { std::env::set_var("NOFY_CAMPAIGNS", "0") };
        assert!(campaigns_application_disabled(&empty));

        unsafe { std::env::remove_var("NOFY_CAMPAIGNS") };
        assert!(!campaigns_application_disabled(&empty));

        match prior {
            Some(v) => unsafe { std::env::set_var("NOFY_CAMPAIGNS", v) },
            None => unsafe { std::env::remove_var("NOFY_CAMPAIGNS") },
        }
    }

    #[test]
    fn user_config_filename_prefers_json_when_present() {
        let home = tempfile::tempdir().unwrap();
        // 两者皆无：新建默认是 config.json（TOML 无法结构化嵌套 models）。
        assert_eq!(
            user_config_filename_at(home.path()),
            USER_CONFIG_FILENAME_JSON
        );
        write(
            home.path(),
            USER_CONFIG_FILENAME,
            "[ui]\ntheme = \"dark\"\n",
        );
        assert_eq!(user_config_filename_at(home.path()), USER_CONFIG_FILENAME);
        write(
            home.path(),
            USER_CONFIG_FILENAME_JSON,
            "{\"ui\":{\"theme\":\"dark\"}}",
        );
        assert_eq!(
            user_config_filename_at(home.path()),
            USER_CONFIG_FILENAME_JSON
        );
        assert_eq!(
            user_config_path_at(home.path()),
            home.path().join(USER_CONFIG_FILENAME_JSON)
        );
        assert_eq!(
            user_config_save_path_at(home.path()),
            home.path().join(USER_CONFIG_FILENAME_JSON)
        );
    }

    #[test]
    fn save_user_config_writes_json_and_retires_legacy_toml() {
        let home = tempfile::tempdir().unwrap();
        write(
            home.path(),
            USER_CONFIG_FILENAME,
            "[ui]\ntheme = \"dark\"\n",
        );
        let value: toml::Value = toml::from_str("[ui]\ntheme = \"light\"\n").unwrap();
        save_config_value_at(&user_config_save_path_at(home.path()), &value).unwrap();
        retire_legacy_user_toml(home.path());
        assert!(home.path().join(USER_CONFIG_FILENAME_JSON).is_file());
        assert!(!home.path().join(USER_CONFIG_FILENAME).is_file());
        let json: serde_json::Value = serde_json::from_str(
            &std::fs::read_to_string(home.path().join(USER_CONFIG_FILENAME_JSON)).unwrap(),
        )
        .unwrap();
        assert_eq!(json["ui"]["theme"], "light");
        let baks: Vec<_> = std::fs::read_dir(home.path())
            .unwrap()
            .filter_map(|e| e.ok())
            .map(|e| e.file_name().to_string_lossy().into_owned())
            .filter(|n| n.starts_with("config.toml.bak-json-"))
            .collect();
        assert_eq!(baks.len(), 1, "{baks:?}");
    }

    #[test]
    fn json_config_reads_as_toml_value_including_nested_provider_models() {
        let home = tempfile::tempdir().unwrap();
        write(
            home.path(),
            USER_CONFIG_FILENAME_JSON,
            r#"{
              "models": { "default": "qwen3.8-max" },
              "model_providers": {
                "dashscope": {
                  "api_key": "sk-secret",
                  "models": {
                    "qwen3.8-max": { "name": "Qwen3.8 Max", "context_window": 262144 }
                  }
                }
              }
            }"#,
        );
        let path = user_config_path_at(home.path());
        let root = load_raw_config_file(&path).unwrap();
        assert_eq!(root["models"]["default"].as_str(), Some("qwen3.8-max"));
        let provider = &root["model_providers"]["dashscope"];
        assert_eq!(provider["api_key"].as_str(), Some("sk-secret"));
        assert_eq!(
            provider["models"]["qwen3.8-max"]["context_window"].as_integer(),
            Some(262144)
        );
    }

    #[test]
    fn save_config_value_at_writes_json_for_json_target_and_preserves_mode() {
        let home = tempfile::tempdir().unwrap();
        let path = home.path().join(USER_CONFIG_FILENAME_JSON);
        write(
            home.path(),
            USER_CONFIG_FILENAME_JSON,
            "{\"ui\":{\"theme\":\"dark\"}}",
        );
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            std::fs::set_permissions(&path, std::fs::Permissions::from_mode(0o600)).unwrap();
        }

        let mut root = load_raw_config_file(&path).unwrap();
        let mut srv = toml::map::Map::new();
        srv.insert(
            "command".to_string(),
            toml::Value::String("/bin/echo".to_string()),
        );
        let mut servers = toml::map::Map::new();
        servers.insert("srv".to_string(), toml::Value::Table(srv));
        root.as_table_mut()
            .unwrap()
            .insert("mcp_servers".to_string(), toml::Value::Table(servers));
        save_config_value_at(&path, &root).unwrap();

        // 仍是合法 JSON，且原有内容没被 TOML 覆盖丢掉。
        let text = std::fs::read_to_string(&path).unwrap();
        let json: serde_json::Value = serde_json::from_str(&text).unwrap();
        assert_eq!(json["ui"]["theme"], "dark");
        assert_eq!(json["mcp_servers"]["srv"]["command"], "/bin/echo");
        assert_eq!(load_raw_config_file(&path).unwrap(), root);
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            assert_eq!(
                std::fs::metadata(&path).unwrap().permissions().mode() & 0o777,
                0o600
            );
        }
    }

    #[test]
    fn save_config_toml_text_at_converts_for_json_and_stays_verbatim_for_toml() {
        let home = tempfile::tempdir().unwrap();
        let toml_text = "# 用户注释\n[ui]\ntheme = \"dark\"\n";

        let toml_path = home.path().join(USER_CONFIG_FILENAME);
        save_config_toml_text_at(&toml_path, toml_text).unwrap();
        // TOML 目标原样写回：注释与键序保留。
        assert_eq!(std::fs::read_to_string(&toml_path).unwrap(), toml_text);

        let json_path = home.path().join(USER_CONFIG_FILENAME_JSON);
        save_config_toml_text_at(&json_path, toml_text).unwrap();
        let json: serde_json::Value =
            serde_json::from_str(&std::fs::read_to_string(&json_path).unwrap()).unwrap();
        assert_eq!(json["ui"]["theme"], "dark");
    }

    #[test]
    fn load_config_text_as_toml_renders_json_as_parseable_toml() {
        let home = tempfile::tempdir().unwrap();
        let path = home.path().join(USER_CONFIG_FILENAME_JSON);
        write(
            home.path(),
            USER_CONFIG_FILENAME_JSON,
            r#"{"ui":{"theme":"dark"},"marketplace":{"sources":[{"name":"official","git":"https://example.com/x.git"}]}}"#,
        );
        let text = load_config_text_as_toml(&path).unwrap();
        let parsed: toml::Value = toml::from_str(&text).unwrap();
        assert_eq!(parsed["ui"]["theme"].as_str(), Some("dark"));
        assert_eq!(
            parsed["marketplace"]["sources"][0]["name"].as_str(),
            Some("official")
        );
        // 缺文件按 io 错误上抛，由调用方决定语义。
        assert!(load_config_text_as_toml(&home.path().join("missing.json")).is_err());
    }
}
