use super::*;
use serde_json::json;
use std::sync::{
    Barrier,
    atomic::{AtomicUsize, Ordering},
};

#[test]
fn simultaneous_identical_schemas_compile_once_without_holding_the_cache_lock() {
    let cache = Arc::new(Mutex::new(Cache::default()));
    let calls = Arc::new(AtomicUsize::new(0));
    let gate = Arc::new(Barrier::new(8));
    let threads = (0..8)
        .map(|_| {
            let (cache, calls, gate) = (cache.clone(), calls.clone(), gate.clone());
            std::thread::spawn(move || {
                let schema = json!({"type":"object","required":["ok"]});
                gate.wait();
                let slot = cache.lock().unwrap().slot(key(&schema).unwrap());
                let validator = slot
                    .get_or_init(|| {
                        drop(cache.lock().unwrap());
                        calls.fetch_add(1, Ordering::SeqCst);
                        compile(&schema)
                    })
                    .as_ref()
                    .unwrap()
                    .clone();
                assert!(validator.validate(&json!({"ok":true})).is_ok());
                assert!(validator.validate(&json!({})).is_err());
                validator
            })
        })
        .collect::<Vec<_>>();
    let values = threads
        .into_iter()
        .map(|thread| thread.join().unwrap())
        .collect::<Vec<_>>();
    assert_eq!(calls.load(Ordering::SeqCst), 1);
    assert!(values.iter().all(|value| Arc::ptr_eq(value, &values[0])));
}
#[test]
fn lru_eviction_obeys_entry_and_byte_limits_and_keeps_held_validators_alive() {
    let mut cache = Cache::default();
    let schema = json!({"type":"boolean"});
    let original_key = key(&schema).unwrap();
    let held = cache.slot(original_key.clone());
    held.get_or_init(|| compile(&schema)).as_ref().unwrap();
    for index in 0..MAX_ENTRIES * 2 {
        cache.slot(format!("{index}").into_bytes());
        assert!(cache.entries.len() <= MAX_ENTRIES);
        assert!(cache.bytes <= MAX_KEYS);
        assert_eq!(
            cache.bytes,
            cache
                .entries
                .iter()
                .map(|entry| entry.key.len())
                .sum::<usize>()
        );
    }
    assert!(!Arc::ptr_eq(&held, &cache.slot(original_key)));
    assert!(
        held.get()
            .unwrap()
            .as_ref()
            .unwrap()
            .validate(&json!(true))
            .is_ok()
    );
    for index in 0..MAX_ENTRIES {
        let mut key = vec![b'x'; MAX_KEY];
        key[0] = index as u8;
        cache.slot(key);
    }
    assert_eq!(cache.bytes, MAX_KEYS);
    assert_eq!(cache.entries.len(), MAX_KEYS / MAX_KEY);
    let recent = cache.entries.back().unwrap().key.clone();
    let slot = cache.slot(recent.clone());
    assert!(Arc::ptr_eq(&slot, &cache.entries.back().unwrap().slot));
    assert_eq!(cache.entries.back().unwrap().key, recent);
}
#[test]
fn oversized_keys_bypass_retention_without_rejecting_valid_schemas() {
    let text = "界".repeat(MAX_KEY);
    let schema = json!({"const":text});
    assert!(key(&schema).is_none());
    let validator = compiled(&schema).unwrap();
    assert!(validator.validate(&json!(text)).is_ok());
    assert!(validator.validate(&json!("other")).is_err());
    let small = json!({"const":"界"});
    assert_eq!(
        key(&small).unwrap().len(),
        serde_json::to_vec(&small).unwrap().len()
    );
}
#[test]
fn changed_and_invalid_schemas_never_borrow_a_previously_successful_validator() {
    let one = json!({"type":"integer","minimum":1});
    let zero = json!({"type":"integer","minimum":0});
    let a = compiled(&one).unwrap();
    let b = compiled(&one).unwrap();
    assert!(Arc::ptr_eq(&a, &b));
    assert!(a.validate(&json!(0)).is_err());
    assert!(compiled(&zero).unwrap().validate(&json!(0)).is_ok());
    for _ in 0..2 {
        assert!(compiled(&json!({"type":"unknown"})).is_err());
        for reference in [
            "file:///private/schema.json",
            "https://invalid.example/schema.json",
        ] {
            for keyword in ["$ref", "$dynamicRef", "$recursiveRef"] {
                assert!(
                    compiled(&json!({(keyword):reference}))
                        .unwrap_err()
                        .to_string()
                        .contains("external references")
                );
            }
        }
    }
    let local =
        json!({"$defs":{"positive":{"type":"integer","minimum":1}},"$ref":"#/$defs/positive"});
    assert!(compiled(&local).unwrap().validate(&json!(0)).is_err());
    assert!(compiled(&local).unwrap().validate(&json!(1)).is_ok());
}
