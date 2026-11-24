//! Rhai's serde serializer promotes out-of-range unsigned integers to FLOAT.
//! Keep those as its native u64 variant instead and perform single-pass bounded
//! conversion so callers neither re-walk trees nor allocate unbounded structures.
use rhai::{Dynamic, EvalAltResult};
use serde_json::{Map, Number, Value};

type Result<T> = std::result::Result<T, Box<EvalAltResult>>;

const MAX_DEPTH: usize = 128;
const MAX_NODES: usize = 131_072;

struct Budget {
    nodes: usize,
    max_nodes: usize,
    bytes: usize,
    max_bytes: usize,
}

impl Budget {
    fn new(max_bytes: usize) -> Self {
        Self {
            nodes: 0,
            max_nodes: MAX_NODES,
            bytes: 0,
            max_bytes,
        }
    }

    fn node(&mut self) -> Result<()> {
        self.nodes = self
            .nodes
            .checked_add(1)
            .filter(|n| *n <= self.max_nodes)
            .ok_or("JSON node limit")?;
        Ok(())
    }

    fn charge(&mut self, bytes: usize) -> Result<()> {
        self.bytes = self
            .bytes
            .checked_add(bytes)
            .filter(|n| *n <= self.max_bytes)
            .ok_or("JSON byte limit")?;
        Ok(())
    }
}

fn json_string_bytes(text: &str) -> usize {
    let mut len = 2usize;
    for byte in text.bytes() {
        len = len.saturating_add(match byte {
            b'"' | b'\\' | 0x08 | 0x0c | b'\n' | b'\r' | b'\t' => 2,
            0x00..=0x1f => 6,
            _ => 1,
        });
    }
    len
}

fn signed_digits(value: i64) -> usize {
    let negative = usize::from(value < 0);
    unsigned_digits(value.unsigned_abs()) + negative
}

fn unsigned_digits(mut value: u64) -> usize {
    let mut digits = 1usize;
    while value >= 10 {
        value /= 10;
        digits += 1;
    }
    digits
}

pub(crate) fn dynamic(value: &Value, max_bytes: usize) -> Result<Dynamic> {
    fn convert(value: &Value, depth: usize, budget: &mut Budget) -> Result<Dynamic> {
        if depth > MAX_DEPTH {
            return Err("JSON nesting limit".into());
        }
        budget.node()?;
        Ok(match value {
            Value::Null => {
                budget.charge(4)?;
                Dynamic::UNIT
            }
            Value::Bool(v) => {
                budget.charge(if *v { 4 } else { 5 })?;
                Dynamic::from_bool(*v)
            }
            Value::String(v) => {
                budget.charge(json_string_bytes(v))?;
                Dynamic::from(v.clone())
            }
            Value::Number(number) => {
                if let Some(value) = number.as_i64() {
                    budget.charge(signed_digits(value))?;
                    Dynamic::from_int(value)
                } else if let Some(value) = number.as_u64() {
                    budget.charge(unsigned_digits(value))?;
                    Dynamic::from(value)
                } else {
                    let float = number
                        .as_f64()
                        .filter(|v| v.is_finite())
                        .ok_or("unsupported JSON number")?;
                    if Number::from_f64(float).as_ref() != Some(number) {
                        return Err("JSON number cannot be represented losslessly".into());
                    }
                    budget.charge(number.to_string().len())?;
                    Dynamic::from_float(float)
                }
            }
            Value::Array(values) => {
                budget.charge(2 + values.len().saturating_sub(1))?;
                let mut array = rhai::Array::with_capacity(values.len());
                for item in values {
                    array.push(convert(item, depth + 1, budget)?);
                }
                Dynamic::from_array(array)
            }
            Value::Object(values) => {
                budget.charge(2 + values.len().saturating_sub(1) + values.len())?;
                let mut map = rhai::Map::new();
                for (key, item) in values {
                    budget.charge(json_string_bytes(key))?;
                    map.insert(key.clone().into(), convert(item, depth + 1, budget)?);
                }
                Dynamic::from_map(map)
            }
        })
    }
    let mut budget = Budget::new(max_bytes);
    convert(value, 0, &mut budget)
}

pub(crate) fn value(dynamic: &Dynamic, max_bytes: usize) -> Result<Value> {
    fn convert(value: &Dynamic, depth: usize, budget: &mut Budget) -> Result<Value> {
        if depth > MAX_DEPTH {
            return Err("JSON nesting limit".into());
        }
        budget.node()?;
        if value.is_unit() {
            budget.charge(4)?;
            return Ok(Value::Null);
        }
        if let Ok(flag) = value.as_bool() {
            budget.charge(if flag { 4 } else { 5 })?;
            return Ok(Value::Bool(flag));
        }
        if let Ok(integer) = value.as_int() {
            budget.charge(signed_digits(integer))?;
            return Ok(Value::Number(Number::from(integer)));
        }
        if let Some(unsigned) = value.read_lock::<u64>() {
            let integer = *unsigned;
            budget.charge(unsigned_digits(integer))?;
            return Ok(Value::Number(Number::from(integer)));
        }
        if let Ok(float) = value.as_float() {
            let number = Number::from_f64(float).ok_or("non-finite JSON number")?;
            budget.charge(number.to_string().len())?;
            return Ok(Value::Number(number));
        }
        if let Some(text) = value.read_lock::<rhai::ImmutableString>() {
            budget.charge(json_string_bytes(text.as_str()))?;
            return Ok(Value::String(text.as_str().to_owned()));
        }
        if let Ok(ch) = value.as_char() {
            let mut encoded = [0u8; 4];
            let text = ch.encode_utf8(&mut encoded);
            budget.charge(json_string_bytes(text))?;
            return Ok(Value::String(text.to_owned()));
        }
        if let Some(array) = value.read_lock::<rhai::Array>() {
            budget.charge(2 + array.len().saturating_sub(1))?;
            let mut result = Vec::with_capacity(array.len());
            for item in array.iter() {
                result.push(convert(item, depth + 1, budget)?);
            }
            return Ok(Value::Array(result));
        }
        if let Some(map) = value.read_lock::<rhai::Map>() {
            budget.charge(2 + map.len().saturating_sub(1) + map.len())?;
            let mut result = Map::with_capacity(map.len());
            for (key, item) in map.iter() {
                budget.charge(json_string_bytes(key.as_str()))?;
                result.insert(key.as_str().to_owned(), convert(item, depth + 1, budget)?);
            }
            return Ok(Value::Object(result));
        }
        if let Some(v) = value.read_lock::<u32>() {
            budget.charge(unsigned_digits(u64::from(*v)))?;
            return Ok(Value::Number(Number::from(*v)));
        }
        if let Some(v) = value.read_lock::<i32>() {
            budget.charge(signed_digits(i64::from(*v)))?;
            return Ok(Value::Number(Number::from(*v)));
        }
        if let Some(v) = value.read_lock::<f32>() {
            let number = Number::from_f64(f64::from(*v)).ok_or("non-finite JSON number")?;
            budget.charge(number.to_string().len())?;
            return Ok(Value::Number(number));
        }
        Err("unserializable JSON value".into())
    }
    let mut budget = Budget::new(max_bytes);
    convert(dynamic, 0, &mut budget)
}

/// Fast O(1)-per-string budget validator for worker-resident SSE state.
/// Rejects unserializable values, excessive nesting, node explosions and
/// estimated byte growth above `max_bytes` without serializing the state.
pub(crate) fn check_dynamic_budget(dynamic: &Dynamic, max_bytes: usize) -> Result<()> {
    fn visit(value: &Dynamic, depth: usize, budget: &mut Budget) -> Result<()> {
        if depth > MAX_DEPTH {
            return Err("JSON nesting limit".into());
        }
        budget.node()?;
        if value.is_unit() {
            return budget.charge(4);
        }
        if let Ok(flag) = value.as_bool() {
            return budget.charge(if flag { 4 } else { 5 });
        }
        if let Ok(integer) = value.as_int() {
            return budget.charge(signed_digits(integer));
        }
        if let Some(unsigned) = value.read_lock::<u64>() {
            return budget.charge(unsigned_digits(*unsigned));
        }
        if let Ok(float) = value.as_float() {
            if !float.is_finite() {
                return Err("non-finite JSON number".into());
            }
            return budget.charge(16);
        }
        if let Some(text) = value.read_lock::<rhai::ImmutableString>() {
            return budget.charge(text.len().saturating_add(2));
        }
        if value.as_char().is_ok() {
            return budget.charge(6);
        }
        if let Some(array) = value.read_lock::<rhai::Array>() {
            budget.charge(2 + array.len().saturating_sub(1))?;
            for item in array.iter() {
                visit(item, depth + 1, budget)?;
            }
            return Ok(());
        }
        if let Some(map) = value.read_lock::<rhai::Map>() {
            budget.charge(2 + map.len().saturating_sub(1) + map.len())?;
            for (key, item) in map.iter() {
                budget.charge(key.len().saturating_add(2))?;
                visit(item, depth + 1, budget)?;
            }
            return Ok(());
        }
        if value.read_lock::<u32>().is_some()
            || value.read_lock::<i32>().is_some()
            || value
                .read_lock::<f32>()
                .is_some_and(|float| float.is_finite())
        {
            return budget.charge(16);
        }
        Err("unserializable JSON value".into())
    }
    let mut budget = Budget::new(max_bytes);
    visit(dynamic, 0, &mut budget)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn nested_json_is_lossless_but_unserializable_values_and_excessive_depth_fail() {
        let expected = serde_json::json!([
            u64::MAX,
            i64::MIN,
            9007199254740993u64,
            1.0,
            1.25,
            null,
            {"id": u64::MAX}
        ]);
        let dyn_val = dynamic(&expected, 1024 * 1024).unwrap();
        assert_eq!(value(&dyn_val, 1024 * 1024).unwrap(), expected);
        check_dynamic_budget(&dyn_val, 1024 * 1024).unwrap();
        assert!(value(&Dynamic::from(rhai::FnPtr::new("work").unwrap()), 1024).is_err());
        assert!(
            check_dynamic_budget(&Dynamic::from(rhai::FnPtr::new("work").unwrap()), 1024).is_err()
        );
        let mut nested = Dynamic::UNIT;
        for _ in 0..130 {
            nested = Dynamic::from_array(vec![nested]);
        }
        assert!(value(&nested, 1024 * 1024).is_err());
        assert!(check_dynamic_budget(&nested, 1024 * 1024).is_err());
    }

    #[test]
    fn node_and_byte_budgets_reject_amplified_nested_containers() {
        let mut node = Dynamic::from_array(vec![Dynamic::from_int(1); 8]);
        for _ in 0..16 {
            node = Dynamic::from_array(vec![node.clone(), node]);
        }
        assert!(value(&node, 16 * 1024 * 1024).is_err());
        assert!(check_dynamic_budget(&node, 16 * 1024 * 1024).is_err());
    }
}
