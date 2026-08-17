//! Seven-dimension compaction + density partition + depth guard
//! (FR4.12, NG-F9).
//!
//! Compaction decides what stays verbatim, what gets summarized, and what
//! is guarded, from SEVEN scored dimensions:
//!
//! 1. recency — newer is worth more;
//! 2. frequency — often-used is worth more;
//! 3. size — larger items cost more context;
//! 4. relevance — task-relevance score;
//! 5. redundancy — duplicated content is worth less;
//! 6. density — information density (signal per byte);
//! 7. depth — nesting depth of derived summaries.
//!
//! Low-density items partition into compaction candidates; nested summary
//! depth is guarded so compaction cannot recurse forever.

/// The seven dimensions, each normalized to [0, 1].
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct CompactDims {
    pub recency: f64,
    pub frequency: f64,
    pub size: f64,
    pub relevance: f64,
    pub redundancy: f64,
    pub density: f64,
    pub depth: f64,
}

/// Weights for the compact score.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct CompactWeights {
    pub recency: f64,
    pub frequency: f64,
    pub size: f64,
    pub relevance: f64,
    pub redundancy: f64,
    pub density: f64,
    pub depth: f64,
}

impl Default for CompactWeights {
    fn default() -> Self {
        Self {
            recency: 1.0,
            frequency: 1.0,
            size: -1.0,     // larger = lower score
            relevance: 2.0, // relevance weighs most
            redundancy: -2.0, // redundancy penalizes most
            density: 1.5,
            depth: -1.0,    // deeper = lower score
        }
    }
}

/// Weighted score: higher = more worth keeping verbatim.
pub fn compact_score(dims: &CompactDims, weights: &CompactWeights) -> f64 {
    weights.recency * dims.recency
        + weights.frequency * dims.frequency
        + weights.size * dims.size
        + weights.relevance * dims.relevance
        + weights.redundancy * dims.redundancy
        + weights.density * dims.density
        + weights.depth * dims.depth
}

/// One item considered for compaction.
#[derive(Debug, Clone, PartialEq)]
pub struct CompactItem {
    pub id: String,
    pub dims: CompactDims,
    /// Summary nesting depth of this item (0 = raw content).
    pub summary_depth: u32,
}

/// The compaction plan.
#[derive(Debug, Clone, PartialEq)]
pub struct CompactionPlan {
    /// Kept verbatim.
    pub keep: Vec<String>,
    /// Summarized (low score / low density).
    pub summarize: Vec<String>,
    /// Refused by the depth guard (summaries too deep to compact further).
    pub depth_guarded: Vec<String>,
}

/// Depth guard: summaries nested beyond `max_depth` are never compacted
/// again — compaction must terminate.
pub fn depth_guard(item: &CompactItem, max_depth: u32) -> bool {
    item.summary_depth > max_depth
}

/// Partition + plan: depth-guard first, then score against the threshold.
pub fn compact(items: &[CompactItem], weights: &CompactWeights, threshold: f64, max_depth: u32) -> CompactionPlan {
    let mut plan = CompactionPlan {
        keep: Vec::new(),
        summarize: Vec::new(),
        depth_guarded: Vec::new(),
    };
    for item in items {
        if depth_guard(item, max_depth) {
            plan.depth_guarded.push(item.id.clone());
            continue;
        }
        let score = compact_score(&item.dims, weights);
        if score >= threshold {
            plan.keep.push(item.id.clone());
        } else {
            plan.summarize.push(item.id.clone());
        }
    }
    plan
}

#[cfg(test)]
mod tests {
    use super::*;

    fn dims(recency: f64, redundancy: f64, density: f64) -> CompactDims {
        CompactDims {
            recency,
            frequency: 0.5,
            size: 0.5,
            relevance: 0.5,
            redundancy,
            density,
            depth: 0.0,
        }
    }

    fn item(id: &str, dims: CompactDims, depth: u32) -> CompactItem {
        CompactItem {
            id: id.into(),
            dims,
            summary_depth: depth,
        }
    }

    #[test]
    fn score_orders_by_dimensions() {
        let weights = CompactWeights::default();
        let fresh = compact_score(&dims(1.0, 0.0, 1.0), &weights);
        let stale_redundant = compact_score(&dims(0.0, 1.0, 0.0), &weights);
        assert!(fresh > stale_redundant, "fresh dense content outranks stale redundant");
    }

    #[test]
    fn density_partition_drives_the_plan() {
        let weights = CompactWeights::default();
        let items = vec![
            item("rich", dims(1.0, 0.0, 1.0), 0),
            item("fluff", dims(0.0, 1.0, 0.0), 0),
        ];
        let plan = compact(&items, &weights, 0.0, 3);
        assert_eq!(plan.keep, vec!["rich".to_string()]);
        assert_eq!(plan.summarize, vec!["fluff".to_string()]);
        assert!(plan.depth_guarded.is_empty());
    }

    #[test]
    fn depth_guard_stops_recursion() {
        let weights = CompactWeights::default();
        let deep = item("deep-summary", dims(0.0, 1.0, 0.0), 4);
        let plan = compact(&[deep], &weights, -1000.0, 3);
        assert_eq!(plan.depth_guarded, vec!["deep-summary".to_string()]);
        assert!(plan.summarize.is_empty(), "guarded items are never re-summarized");
    }

    #[test]
    fn threshold_moves_items_between_partitions() {
        let weights = CompactWeights::default();
        let items = vec![item("mid", dims(0.5, 0.5, 0.5), 0)];
        let score = compact_score(&items[0].dims, &weights);
        let keep_plan = compact(&items, &weights, score - 0.1, 3);
        let summarize_plan = compact(&items, &weights, score + 0.1, 3);
        assert_eq!(keep_plan.keep.len(), 1);
        assert_eq!(summarize_plan.summarize.len(), 1);
    }

    #[test]
    fn plan_is_deterministic() {
        let weights = CompactWeights::default();
        let items = vec![
            item("a", dims(0.9, 0.1, 0.9), 0),
            item("b", dims(0.1, 0.9, 0.1), 0),
            item("c", dims(0.5, 0.5, 0.5), 5),
        ];
        assert_eq!(
            compact(&items, &weights, 0.0, 3),
            compact(&items, &weights, 0.0, 3)
        );
    }
}
