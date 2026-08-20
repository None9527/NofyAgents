//! Background review: fork isolation + cache-aware replay (FR4.8, HM-F19).
//!
//! Background review runs on a FORK of the memory view: its writes land in
//! an overlay and never leak back into the base store unless explicitly
//! merged (isolation). Re-running a review is CACHE-AWARE: inputs whose
//! content hash is unchanged reuse the cached outcome instead of
//! recomputing (replay).

use std::collections::BTreeMap;

/// Copy-on-write view over a base store: reads fall through, writes land
/// in the overlay. The base is never mutated by the fork.
#[derive(Debug, Clone)]
pub struct ForkView {
    base: BTreeMap<String, String>,
    overlay: BTreeMap<String, String>,
}

impl ForkView {
    pub fn fork(base: &BTreeMap<String, String>) -> Self {
        Self {
            base: base.clone(),
            overlay: BTreeMap::new(),
        }
    }

    pub fn get(&self, key: &str) -> Option<&str> {
        self.overlay
            .get(key)
            .or_else(|| self.base.get(key))
            .map(String::as_str)
    }

    pub fn write(&mut self, key: &str, value: &str) {
        self.overlay.insert(key.to_string(), value.to_string());
    }

    /// Number of overlay writes (the fork's footprint).
    pub fn overlay_len(&self) -> usize {
        self.overlay.len()
    }

    /// Explicit merge: the only path by which fork writes reach the base.
    pub fn merge_into(self, base: &mut BTreeMap<String, String>) {
        base.extend(self.overlay);
    }
}

/// One review input, identified by content hash.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ReviewInput {
    pub doc_id: String,
    pub content_hash: String,
}

/// Cache-aware replay: unchanged inputs reuse cached outcomes; changed
/// inputs are recomputed. Returns (outcomes, cache hits).
pub fn replay<F>(
    inputs: &[ReviewInput],
    cache: &mut BTreeMap<String, String>,
    mut compute: F,
) -> (Vec<(String, String)>, usize)
where
    F: FnMut(&ReviewInput) -> String,
{
    let mut outcomes = Vec::new();
    let mut hits = 0;
    for input in inputs {
        if let Some(cached) = cache.get(&input.content_hash) {
            outcomes.push((input.doc_id.clone(), cached.clone()));
            hits += 1;
        } else {
            let outcome = compute(input);
            cache.insert(input.content_hash.clone(), outcome.clone());
            outcomes.push((input.doc_id.clone(), outcome));
        }
    }
    (outcomes, hits)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn base() -> BTreeMap<String, String> {
        let mut map = BTreeMap::new();
        map.insert("doc1".into(), "original".into());
        map
    }

    #[test]
    fn fork_writes_never_leak_to_base() {
        let mut base = base();
        let mut fork = ForkView::fork(&base);
        fork.write("doc1", "reviewed");
        fork.write("doc2", "new note");

        // The fork sees its own writes.
        assert_eq!(fork.get("doc1"), Some("reviewed"));
        assert_eq!(fork.get("doc2"), Some("new note"));
        // The base is untouched.
        assert_eq!(base.get("doc1"), Some(&"original".to_string()));
        assert!(!base.contains_key("doc2"));
        assert_eq!(fork.overlay_len(), 2);
    }

    #[test]
    fn reads_fall_through_to_base_when_overlay_misses() {
        let base = base();
        let fork = ForkView::fork(&base);
        // overlay 未命中 → 回落 base;base 也没有 → None。
        assert_eq!(fork.get("doc1"), Some("original"));
        assert_eq!(fork.get("ghost"), None);
    }

    #[test]
    fn merge_is_the_only_path_back() {
        let mut base = base();
        let mut fork = ForkView::fork(&base);
        fork.write("doc1", "reviewed");
        fork.merge_into(&mut base);
        assert_eq!(base.get("doc1"), Some(&"reviewed".to_string()));
    }

    #[test]
    fn replay_is_cache_aware() {
        let mut cache = BTreeMap::new();
        let inputs = vec![
            ReviewInput { doc_id: "a".into(), content_hash: "h1".into() },
            ReviewInput { doc_id: "b".into(), content_hash: "h2".into() },
        ];
        let calls = std::cell::Cell::new(0);
        let compute = |input: &ReviewInput| {
            calls.set(calls.get() + 1);
            format!("review-of-{}", input.doc_id)
        };
        let (outcomes, hits) = replay(&inputs, &mut cache, &compute);
        assert_eq!(outcomes.len(), 2);
        assert_eq!(hits, 0, "cold cache computes everything");
        assert_eq!(calls.get(), 2);

        // Same hashes: full cache reuse, zero recomputation (the counter
        // must stay where the cold pass left it).
        let (outcomes2, hits2) = replay(&inputs, &mut cache, &compute);
        assert_eq!(outcomes2, outcomes);
        assert_eq!(hits2, 2);
        assert_eq!(calls.get(), 2, "warm replay adds zero recomputation");
    }

    #[test]
    fn changed_content_recomputes() {
        let mut cache = BTreeMap::new();
        let first = vec![ReviewInput { doc_id: "a".into(), content_hash: "h1".into() }];
        replay(&first, &mut cache, |_| "v1".into());
        // Content changed → new hash → recompute.
        let second = vec![ReviewInput { doc_id: "a".into(), content_hash: "h2".into() }];
        let (outcomes, hits) = replay(&second, &mut cache, |_| "v2".into());
        assert_eq!(hits, 0);
        assert_eq!(outcomes[0].1, "v2");
    }
}
