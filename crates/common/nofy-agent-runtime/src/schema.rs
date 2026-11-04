//! Local-only Schema compilation shared by declarations and value validation.
//! Only immutable validators are retained, never input values or decisions.
use crate::Error;
use serde_json::Value;
use std::{
    collections::VecDeque,
    io::Write,
    sync::{Arc, Mutex, OnceLock},
};

const MAX_KEY: usize = 8 * 1024;
const MAX_KEYS: usize = 128 * 1024;
const MAX_ENTRIES: usize = 32;
type Compiled = Result<Arc<jsonschema::Validator>, String>;
type Slot = Arc<OnceLock<Compiled>>;
struct Entry {
    key: Vec<u8>,
    slot: Slot,
}
#[derive(Default)]
struct Cache {
    entries: VecDeque<Entry>,
    bytes: usize,
}
impl Cache {
    fn slot(&mut self, key: Vec<u8>) -> Slot {
        if let Some(index) = self.entries.iter().position(|entry| entry.key == key) {
            let entry = self.entries.remove(index).expect("known cache entry");
            let slot = entry.slot.clone();
            self.entries.push_back(entry);
            return slot;
        }
        while self.entries.len() >= MAX_ENTRIES || self.bytes + key.len() > MAX_KEYS {
            let old = self.entries.pop_front().expect("nonempty bounded cache");
            self.bytes -= old.key.len();
        }
        self.bytes += key.len();
        let slot = Arc::new(OnceLock::new());
        self.entries.push_back(Entry {
            key,
            slot: slot.clone(),
        });
        slot
    }
}
struct Key(Vec<u8>);
impl Write for Key {
    fn write(&mut self, bytes: &[u8]) -> std::io::Result<usize> {
        if self.0.len().saturating_add(bytes.len()) > MAX_KEY {
            return Err(std::io::Error::other("schema cache key limit"));
        }
        self.0
            .try_reserve(bytes.len())
            .map_err(std::io::Error::other)?;
        self.0.extend_from_slice(bytes);
        Ok(bytes.len())
    }
    fn flush(&mut self) -> std::io::Result<()> {
        Ok(())
    }
}
fn key(schema: &Value) -> Option<Vec<u8>> {
    let mut key = Key(Vec::new());
    serde_json::to_writer(&mut key, schema).ok()?;
    Some(key.0)
}
fn local_refs(value: &Value) -> bool {
    match value {
        Value::Object(fields) => fields.iter().all(|(key, value)| {
            if matches!(key.as_str(), "$ref" | "$dynamicRef" | "$recursiveRef") {
                value
                    .as_str()
                    .is_some_and(|reference| reference.starts_with('#'))
            } else {
                local_refs(value)
            }
        }),
        Value::Array(values) => values.iter().all(local_refs),
        _ => true,
    }
}
fn compile(schema: &Value) -> Compiled {
    if !local_refs(schema) {
        return Err(
            "tool schema requires external references; inline it before registration".into(),
        );
    }
    jsonschema::validator_for(schema)
        .map(Arc::new)
        .map_err(|error| format!("invalid tool schema: {error}"))
}
pub(crate) fn compiled(schema: &Value) -> Result<Arc<jsonschema::Validator>, Error> {
    static CACHE: OnceLock<Mutex<Cache>> = OnceLock::new();
    let slot = key(schema).and_then(|key| {
        CACHE
            .get_or_init(Default::default)
            .lock()
            .ok()
            .map(|mut cache| cache.slot(key))
    });
    match slot {
        Some(slot) => slot
            .get_or_init(|| compile(schema))
            .as_ref()
            .map(Arc::clone)
            .map_err(|message| Error::Composition(message.clone())),
        None => compile(schema).map_err(Error::Composition),
    }
}

#[cfg(test)]
mod tests;
