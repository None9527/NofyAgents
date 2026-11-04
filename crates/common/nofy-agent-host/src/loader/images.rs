//! Portable immutable dependency closures. Payloads stay out of run snapshots.
use super::*;
use base64::{Engine, engine::general_purpose::STANDARD};
use flate2::{Compression, write::GzEncoder};
use nofy_agent_runtime::artifact::entry_path;
use nofy_agent_runtime::system::content_digest;
use serde::{Deserialize, Serialize};
use std::{
    collections::{BTreeMap, BTreeSet},
    io::{Read, Write},
};
mod binary;
mod capture;
mod store;
#[cfg(test)]
mod tests;
pub use capture::{CaptureDefinition, CaptureTree};
pub use store::{ImageInfo, ImageStore};
pub const MAX_WIRE: u64 = 24 * 1024 * 1024;
pub(super) fn manifest_schema() -> serde_json::Value {
    serde_json::json!({"type":"object","additionalProperties":false,"required":["schema_version","id","platform","executable","files"],"properties":{
        "schema_version":{"const":1},"id":{"type":"string","pattern":"^[A-Za-z0-9_-]{1,128}$"},"platform":{"type":"string"},
        "executable":{"type":"string","minLength":1,"maxLength":256},"loader":{"type":"string","minLength":1,"maxLength":256},
        "library_dirs":{"type":"array","maxItems":16,"items":{"type":"string","maxLength":256}},
        "prefix_args":{"type":"array","maxItems":32,"items":{"type":"string","maxLength":4096}},
        "env":{"type":"object","maxProperties":32,"additionalProperties":{"oneOf":[
            {"type":"object","additionalProperties":false,"required":["kind","value"],"properties":{"kind":{"const":"literal"},"value":{"type":"string","maxLength":4096}}},
            {"type":"object","additionalProperties":false,"required":["kind","path"],"properties":{"kind":{"const":"path"},"path":{"type":"string","maxLength":256}}}
        ]}},
        "files":{"type":"object","minProperties":1,"maxProperties":4096,"additionalProperties":{"type":"object","additionalProperties":false,"required":["digest","size","executable"],"properties":{"digest":{"type":"string","pattern":"^[0-9a-f]{64}$"},"size":{"type":"integer","minimum":0,"maximum":134217728},"executable":{"type":"boolean"}}}}
    }})
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ImageFile {
    pub digest: String,
    pub size: u64,
    pub executable: bool,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case", deny_unknown_fields)]
pub enum EnvironmentValue {
    Literal { value: String },
    Path { path: String },
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ImageManifest {
    pub schema_version: u32,
    pub id: String,
    pub platform: String,
    pub executable: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub loader: Option<String>,
    #[serde(default)]
    pub library_dirs: Vec<String>,
    #[serde(default)]
    pub prefix_args: Vec<String>,
    #[serde(default)]
    pub env: BTreeMap<String, EnvironmentValue>,
    pub files: BTreeMap<String, ImageFile>,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RuntimeImage {
    pub manifest: ImageManifest,
    pub blobs: BTreeMap<String, String>,
}
fn invalid(message: impl Into<String>) -> HostError {
    HostError::Invalid(message.into())
}
fn relative(path: &str, root: bool) -> Result<()> {
    if root && path == "." {
        return Ok(());
    }
    entry_path(path)?;
    Ok(())
}
pub(super) fn directories(files: &BTreeMap<String, ImageFile>) -> BTreeSet<PathBuf> {
    let mut result = BTreeSet::new();
    for name in files.keys() {
        let mut parent = Path::new(name).parent();
        while let Some(path) = parent.filter(|p| !p.as_os_str().is_empty()) {
            result.insert(path.into());
            parent = path.parent();
        }
    }
    result
}
impl ImageManifest {
    pub fn validate(&self) -> Result<()> {
        if self.schema_version != 1
            || self.id.is_empty()
            || self.id.len() > 128
            || !self
                .id
                .bytes()
                .all(|c| c.is_ascii_alphanumeric() || b"-_".contains(&c))
            || self.platform != format!("linux-{}", std::env::consts::ARCH)
            || !cfg!(target_os = "linux")
            || self.files.is_empty()
            || self.files.len() > 4096
            || self.library_dirs.len() > 16
            || self.prefix_args.len() > 32
            || self.env.len() > 32
        {
            return Err(invalid(
                "invalid runtime image manifest or unsupported platform",
            ));
        }
        let mut total = 0u64;
        for (path, file) in &self.files {
            relative(path, false)?;
            storage::digest(&file.digest)?;
            total = total.saturating_add(file.size);
            if file.size > 128 * 1024 * 1024 || total > 256 * 1024 * 1024 {
                return Err(invalid("runtime image exceeds decoded limits"));
            }
        }
        let dirs = directories(&self.files);
        if dirs.len() > 8192
            || dirs
                .iter()
                .any(|d| self.files.contains_key(d.to_str().unwrap_or_default()))
        {
            return Err(invalid("runtime image directory conflict or limit"));
        }
        for path in std::iter::once(&self.executable).chain(self.loader.iter()) {
            relative(path, false)?;
            if !self.files.get(path).is_some_and(|f| f.executable) {
                return Err(invalid("runtime executable/loader missing executable file"));
            }
        }
        for dir in &self.library_dirs {
            relative(dir, true)?;
            if dir != "." && !dirs.contains(Path::new(dir)) {
                return Err(invalid("runtime library directory missing"));
            }
        }
        if self.loader.is_none() && !self.library_dirs.is_empty() {
            return Err(invalid(
                "library directories require an explicit glibc loader",
            ));
        }
        if self
            .prefix_args
            .iter()
            .any(|s| s.len() > 4096 || s.contains('\0'))
        {
            return Err(invalid("runtime arguments invalid"));
        }
        for (key, value) in &self.env {
            if key.is_empty()
                || key.len() > 128
                || !key
                    .bytes()
                    .all(|c| c.is_ascii_uppercase() || c.is_ascii_digit() || c == b'_')
            {
                return Err(invalid("runtime environment key invalid"));
            }
            match value {
                EnvironmentValue::Literal { value }
                    if value.len() > 4096 || value.contains('\0') =>
                {
                    return Err(invalid("runtime environment value invalid"));
                }
                EnvironmentValue::Path { path } => {
                    relative(path, true)?;
                    if path != "."
                        && !dirs.contains(Path::new(path))
                        && !self.files.contains_key(path)
                    {
                        return Err(invalid("runtime environment path missing"));
                    }
                }
                _ => {}
            }
        }
        if serde_json::to_vec(self)
            .map_err(storage::unavailable)?
            .len()
            > 2 * 1024 * 1024
        {
            return Err(invalid("runtime manifest exceeds 2 MiB"));
        }
        Ok(())
    }
    pub fn digest(&self) -> Result<String> {
        self.validate()?;
        Ok(content_digest(self)?)
    }
    pub(super) fn environment(&self, root: &Path) -> Result<BTreeMap<String, String>> {
        self.env
            .iter()
            .map(|(key, value)| {
                Ok((
                    key.clone(),
                    match value {
                        EnvironmentValue::Literal { value } => value.clone(),
                        EnvironmentValue::Path { path } => root
                            .join(path)
                            .to_str()
                            .ok_or_else(|| invalid("non-UTF8 runtime root"))?
                            .into(),
                    },
                ))
            })
            .collect()
    }
}
fn encode(bytes: &[u8]) -> Result<String> {
    let mut encoder = GzEncoder::new(Vec::new(), Compression::default());
    encoder.write_all(bytes).map_err(storage::unavailable)?;
    let compressed = encoder.finish().map_err(storage::unavailable)?;
    if compressed.len() as u64 > MAX_WIRE * 3 / 4 {
        return Err(invalid("compressed runtime file exceeds wire limit"));
    }
    Ok(STANDARD.encode(compressed))
}
pub(super) fn decode(value: &str, file: &ImageFile) -> Result<Vec<u8>> {
    if value.len() as u64 > MAX_WIRE {
        return Err(invalid("runtime blob exceeds wire limit"));
    }
    let compressed = STANDARD
        .decode(value)
        .map_err(|_| invalid("invalid runtime blob base64"))?;
    if STANDARD.encode(&compressed) != value {
        return Err(invalid("noncanonical runtime blob base64"));
    }
    let mut decoder = flate2::bufread::GzDecoder::new(compressed.as_slice());
    let mut bytes = Vec::new();
    (&mut decoder)
        .take(file.size + 1)
        .read_to_end(&mut bytes)
        .map_err(|_| invalid("invalid runtime gzip stream"))?;
    if bytes.len() as u64 != file.size
        || !decoder.into_inner().is_empty()
        || storage::hash(&bytes) != file.digest
    {
        return Err(invalid("runtime blob length/digest/trailing data mismatch"));
    }
    Ok(bytes)
}
fn elf(bytes: &[u8], static_required: bool) -> Result<()> {
    let machine = if cfg!(target_arch = "x86_64") {
        62
    } else if cfg!(target_arch = "aarch64") {
        183
    } else {
        0
    };
    if bytes.len() < 64
        || &bytes[..4] != b"\x7fELF"
        || bytes[4] != 2
        || bytes[5] != 1
        || machine == 0
        || u16::from_le_bytes([bytes[18], bytes[19]]) != machine
        || !matches!(u16::from_le_bytes([bytes[16], bytes[17]]), 2 | 3)
    {
        return Err(invalid("runtime requires a compatible executable ELF64"));
    }
    let offset = u64::from_le_bytes(bytes[32..40].try_into().unwrap());
    let stride = u16::from_le_bytes(bytes[54..56].try_into().unwrap()) as u64;
    let count = u16::from_le_bytes(bytes[56..58].try_into().unwrap()) as u64;
    if stride < 56
        || count == 0
        || count > 4096
        || offset
            .checked_add(stride * count)
            .is_none_or(|n| n > bytes.len() as u64)
    {
        return Err(invalid("invalid ELF program headers"));
    }
    if static_required
        && (0..count).any(|i| {
            let start = (offset + i * stride) as usize;
            u32::from_le_bytes(bytes[start..start + 4].try_into().unwrap()) == 3
        })
    {
        return Err(invalid(
            "ELF interpreter must be provided inside the runtime image",
        ));
    }
    Ok(())
}
impl RuntimeImage {
    pub fn validate(&self) -> Result<()> {
        self.manifest.validate()?;
        let wire_size = serde_json::to_vec(self)
            .map_err(storage::unavailable)?
            .len() as u64;
        if wire_size > MAX_WIRE {
            return Err(invalid(format!(
                "runtime image exceeds 24 MiB encoded: {wire_size} bytes"
            )));
        }
        let expected = self
            .manifest
            .files
            .values()
            .map(|f| f.digest.as_str())
            .collect::<BTreeSet<_>>();
        if self
            .blobs
            .keys()
            .map(String::as_str)
            .collect::<BTreeSet<_>>()
            != expected
        {
            return Err(invalid("runtime image blob closure mismatch"));
        }
        for file in self.manifest.files.values() {
            let bytes = decode(&self.blobs[&file.digest], file)?;
            for dependency in binary::needed(&bytes)? {
                if dependency.contains('/')
                    || !self.manifest.library_dirs.iter().any(|directory| {
                        let name = if directory == "." {
                            dependency.clone()
                        } else {
                            format!("{directory}/{dependency}")
                        };
                        self.manifest.files.contains_key(&name)
                    })
                {
                    return Err(invalid(format!(
                        "ELF dependency not locked in library directories: {dependency}"
                    )));
                }
            }
        }
        let executable = &self.manifest.files[&self.manifest.executable];
        elf(
            &decode(&self.blobs[&executable.digest], executable)?,
            self.manifest.loader.is_none(),
        )?;
        if let Some(loader) = &self.manifest.loader {
            let file = &self.manifest.files[loader];
            elf(&decode(&self.blobs[&file.digest], file)?, true)?;
        }
        Ok(())
    }
}
