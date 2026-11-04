//! Rhai's serde serializer promotes out-of-range unsigned integers to FLOAT.
//! Keep those as its native u64 variant instead: serde's deserializer already
//! understands that variant, so no string sentinel or ambiguous JSON tag leaks.
use rhai::{Dynamic, EvalAltResult};
use serde_json::Value;
type Result<T> = std::result::Result<T, Box<EvalAltResult>>;
pub(super) fn dynamic(value: &Value) -> Result<Dynamic> {
    fn convert(value: &Value, depth: usize) -> Result<Dynamic> {
        if depth > 128 {
            return Err("JSON nesting limit".into());
        }
        Ok(match value {
            Value::Null => Dynamic::UNIT,
            Value::Bool(v) => Dynamic::from_bool(*v),
            Value::String(v) => Dynamic::from(v.clone()),
            Value::Number(number) => {
                if let Some(value) = number.as_i64() {
                    Dynamic::from_int(value)
                } else if let Some(value) = number.as_u64() {
                    Dynamic::from(value)
                } else {
                    Dynamic::from_float(number.as_f64().ok_or("unsupported JSON number")?)
                }
            }
            Value::Array(values) => Dynamic::from_array(
                values
                    .iter()
                    .map(|v| convert(v, depth + 1))
                    .collect::<Result<rhai::Array>>()?,
            ),
            Value::Object(values) => Dynamic::from_map(
                values
                    .iter()
                    .map(|(k, v)| Ok((k.clone().into(), convert(v, depth + 1)?)))
                    .collect::<Result<rhai::Map>>()?,
            ),
        })
    }
    convert(value, 0)
}
pub(super) fn value(dynamic: &Dynamic, max: usize) -> Result<Value> {
    struct Count {
        bytes: usize,
        max: usize,
    }
    impl std::io::Write for Count {
        fn write(&mut self, bytes: &[u8]) -> std::io::Result<usize> {
            self.bytes = self
                .bytes
                .checked_add(bytes.len())
                .filter(|n| *n <= self.max)
                .ok_or_else(|| std::io::Error::other("scope JSON byte limit"))?;
            Ok(bytes.len())
        }
        fn flush(&mut self) -> std::io::Result<()> {
            Ok(())
        }
    }
    fn charge(count: &mut Count, bytes: usize) -> Result<()> {
        count.bytes = count
            .bytes
            .checked_add(bytes)
            .filter(|n| *n <= count.max)
            .ok_or("scope JSON byte limit")?;
        Ok(())
    }
    fn check(value: &Dynamic, depth: usize, count: &mut Count) -> Result<()> {
        if depth > 128 {
            return Err("JSON nesting limit".into());
        }
        if let Some(array) = value.read_lock::<rhai::Array>() {
            charge(count, 2 + array.len().saturating_sub(1))?;
            for item in array.iter() {
                check(item, depth + 1, count)?;
            }
        } else if let Some(map) = value.read_lock::<rhai::Map>() {
            charge(count, 2 + map.len().saturating_sub(1) + map.len())?;
            for (key, item) in map.iter() {
                serde_json::to_writer(&mut *count, key.as_str())
                    .map_err(|_| "scope JSON byte limit")?;
                check(item, depth + 1, count)?;
            }
        } else {
            let scalar: Value = rhai::serde::from_dynamic(value)?;
            serde_json::to_writer(&mut *count, &scalar).map_err(|_| "scope JSON byte limit")?;
        }
        Ok(())
    }
    check(dynamic, 0, &mut Count { bytes: 0, max })?;
    rhai::serde::from_dynamic(dynamic)
}
