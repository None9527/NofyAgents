//! ProjectionValueStore: higher-seq-wins (FR4.10, DS-#23/DS-#24).
//!
//! Projections are rebuilt by applying value events in ANY order: each key
//! keeps the value with the HIGHEST sequence number, so out-of-order or
//! replayed application converges to the same view (DS-#23). The API is
//! the DS-#24 triple: `init` / `apply` / `view`.

use std::collections::BTreeMap;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ProjectionValueStore<V> {
    values: BTreeMap<String, (u64, V)>, // key -> (seq, value)
}

impl<V> Default for ProjectionValueStore<V> {
    fn default() -> Self {
        Self {
            values: BTreeMap::new(),
        }
    }
}

impl<V: Clone> ProjectionValueStore<V> {
    /// DS-#24: create an empty store.
    pub fn init() -> Self {
        Self::default()
    }

    /// DS-#24: apply a value at a sequence number. Higher seq wins;
    /// equal or lower seq is ignored (idempotent replay, out-of-order
    /// safety).
    pub fn apply(&mut self, key: &str, seq: u64, value: V) {
        match self.values.get(key) {
            Some((current_seq, _)) if *current_seq >= seq => {}
            _ => {
                self.values.insert(key.to_string(), (seq, value));
            }
        }
    }

    /// DS-#24: read the current value.
    pub fn view(&self, key: &str) -> Option<V> {
        self.values.get(key).map(|(_, v)| v.clone())
    }

    /// The winning sequence number for a key (observability).
    pub fn seq_of(&self, key: &str) -> Option<u64> {
        self.values.get(key).map(|(seq, _)| *seq)
    }

    pub fn len(&self) -> usize {
        self.values.len()
    }

    pub fn is_empty(&self) -> bool {
        self.values.is_empty()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn higher_seq_wins() {
        let mut store = ProjectionValueStore::init();
        store.apply("k", 1, "first");
        store.apply("k", 2, "second");
        assert_eq!(store.view("k"), Some("second"));
        assert_eq!(store.seq_of("k"), Some(2));
    }

    #[test]
    fn out_of_order_application_converges() {
        // Apply seq 3 first, then 1, then 2 — the view must still be seq 3.
        let mut store = ProjectionValueStore::init();
        store.apply("k", 3, "third");
        store.apply("k", 1, "first");
        store.apply("k", 2, "second");
        assert_eq!(store.view("k"), Some("third"));
        assert_eq!(store.seq_of("k"), Some(3));
    }

    #[test]
    fn equal_seq_is_idempotent() {
        let mut store = ProjectionValueStore::init();
        store.apply("k", 5, "a");
        store.apply("k", 5, "b"); // same seq: first writer wins
        assert_eq!(store.view("k"), Some("a"));
    }

    #[test]
    fn replayed_application_is_a_noop() {
        let mut store = ProjectionValueStore::init();
        store.apply("k", 1, "v1");
        store.apply("k", 2, "v2");
        // Replay the whole history again — convergent, no regression.
        store.apply("k", 1, "v1");
        store.apply("k", 2, "v2");
        assert_eq!(store.view("k"), Some("v2"));
        assert_eq!(store.len(), 1);
    }

    #[test]
    fn keys_are_independent() {
        let mut store = ProjectionValueStore::init();
        store.apply("a", 10, "x");
        store.apply("b", 1, "y");
        assert_eq!(store.view("a"), Some("x"));
        assert_eq!(store.view("b"), Some("y"));
        assert_eq!(store.view("missing"), None);
        assert_eq!(store.len(), 2);
    }

    #[test]
    fn is_empty_tracks_application() {
        let mut store = ProjectionValueStore::init();
        assert!(store.is_empty());
        store.apply("k", 1, "v");
        assert!(!store.is_empty());
    }
}
