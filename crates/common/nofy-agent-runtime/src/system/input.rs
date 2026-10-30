//! One JSON file entry accepts editable source or a fully locked export.
//! A malformed locked envelope must never fall back to unlocked source.
use super::*;
#[derive(Clone, Debug, Serialize)]
#[serde(untagged)]
pub enum SystemFile {
    Source(SystemDocument),
    Locked(SystemBundle),
}
impl<'de> Deserialize<'de> for SystemFile {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        let value = serde_json::Value::deserialize(deserializer)?;
        if value.get("document").is_some()
            || value.get("lock").is_some()
            || value.get("digest").is_some()
        {
            serde_json::from_value(value)
                .map(Self::Locked)
                .map_err(serde::de::Error::custom)
        } else {
            serde_json::from_value(value)
                .map(Self::Source)
                .map_err(serde::de::Error::custom)
        }
    }
}
impl SystemFile {
    pub fn from_json(bytes: &[u8]) -> Result<Self, Error> {
        if bytes.len() > 32 * 1024 * 1024 {
            return Err(Error::Composition("system file exceeds 32 MiB".into()));
        }
        serde_json::from_slice(bytes).map_err(|e| Error::Composition(format!("system file: {e}")))
    }
    pub fn prepare(self, host: &ModuleRegistry) -> Result<CompiledSystem, Error> {
        match self {
            Self::Source(document) => compile_system(document, host),
            Self::Locked(bundle) => bundle.restore(host),
        }
    }
}
