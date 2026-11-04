//! Rhai's serde serializer promotes out-of-range unsigned integers to FLOAT.
//! Keep those as its native u64 variant instead: serde's deserializer already
//! understands that variant, so no string sentinel or ambiguous JSON tag leaks.
use rhai::{Dynamic, EvalAltResult};
use serde_json::Value;
type Result<T> = std::result::Result<T, Box<EvalAltResult>>;
pub(crate) fn dynamic(value: &Value) -> Result<Dynamic> {
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
pub(crate) fn value(dynamic: &Dynamic) -> Result<Value> {
    fn check(value: &Dynamic, depth: usize) -> Result<()> {
        if depth > 128 {
            return Err("JSON nesting limit".into());
        }
        if let Some(array) = value.read_lock::<rhai::Array>() {
            for item in array.iter() {
                check(item, depth + 1)?;
            }
        } else if let Some(map) = value.read_lock::<rhai::Map>() {
            for item in map.values() {
                check(item, depth + 1)?;
            }
        }
        Ok(())
    }
    check(dynamic, 0)?;
    rhai::serde::from_dynamic(dynamic)
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn nested_json_is_lossless_but_unserializable_values_and_excessive_depth_fail() {
        let expected = serde_json::json!([u64::MAX,i64::MIN,9007199254740993u64,1.0,1.25,null,{"id":u64::MAX}]);
        assert_eq!(value(&dynamic(&expected).unwrap()).unwrap(), expected);
        assert!(value(&Dynamic::from(rhai::FnPtr::new("work").unwrap())).is_err());
        let mut nested = Dynamic::UNIT;
        for _ in 0..130 {
            nested = Dynamic::from_array(vec![nested]);
        }
        assert!(value(&nested).is_err());
    }
}
