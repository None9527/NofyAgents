use crate::*;
use serde_json::Value;

/// Explicit removal; JSON null continues to mean a literal value.
pub(crate) fn pointer_remove(value: &mut Value, pointer: &str) -> Result<()> {
    if pointer.is_empty() || !pointer.starts_with('/') {
        return Err(Error::new(
            "local_input",
            "unset requires a non-root JSON Pointer",
        ));
    }
    let bytes = pointer.as_bytes();
    for (i, byte) in bytes.iter().enumerate() {
        if *byte == b'~' && !matches!(bytes.get(i + 1), Some(b'0' | b'1')) {
            return Err(Error::new("local_input", "invalid JSON Pointer escape"));
        }
    }
    let (parent, key) = pointer.rsplit_once('/').expect("validated pointer");
    let key = key.replace("~1", "/").replace("~0", "~");
    let target = value
        .pointer_mut(parent)
        .ok_or_else(|| Error::new("not_found", "unset parent does not exist"))?;
    match target {
        Value::Object(map) => {
            map.remove(&key)
                .ok_or_else(|| Error::new("not_found", "unset key does not exist"))?;
        }
        Value::Array(items) => {
            let index = key
                .parse::<usize>()
                .ok()
                .filter(|n| n.to_string() == key && *n < items.len())
                .ok_or_else(|| Error::new("not_found", "unset array index does not exist"))?;
            items.remove(index);
        }
        _ => {
            return Err(Error::new(
                "local_input",
                "unset parent must be an object or array",
            ));
        }
    }
    Ok(())
}
