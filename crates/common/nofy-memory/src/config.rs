//! Memory-domain values; no application settings discovery or compatibility.
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(default, deny_unknown_fields)]
pub struct MemoryIndexConfig {
    pub max_chunk_chars: usize,
    pub chunk_overlap_chars: usize,
}
impl Default for MemoryIndexConfig {
    fn default() -> Self {
        Self {
            max_chunk_chars: 1600,
            chunk_overlap_chars: 320,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(default, deny_unknown_fields)]
pub struct MemorySearchConfig {
    pub max_results: usize,
    pub min_score: f32,
    pub vector_weight: f32,
    pub text_weight: f32,
    pub temporal_decay: TemporalDecayConfig,
    pub mmr: MmrConfig,
    pub source_weights: HashMap<String, f32>,
}
impl Default for MemorySearchConfig {
    fn default() -> Self {
        Self {
            max_results: 6,
            min_score: 0.35,
            vector_weight: 0.7,
            text_weight: 0.3,
            temporal_decay: TemporalDecayConfig::default(),
            mmr: MmrConfig::default(),
            source_weights: ["workspace", "session", "global", "user"]
                .into_iter()
                .map(|name| (name.into(), 1.0))
                .collect(),
        }
    }
}
impl MemorySearchConfig {
    pub fn effective_half_life_days(&self) -> Option<f64> {
        let half_life = self.temporal_decay.half_life_days;
        (self.temporal_decay.enabled && half_life.is_finite() && half_life > 0.0)
            .then_some(half_life)
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(default, deny_unknown_fields)]
pub struct TemporalDecayConfig {
    pub enabled: bool,
    pub half_life_days: f64,
}
impl Default for TemporalDecayConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            half_life_days: 7.0,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(default, deny_unknown_fields)]
pub struct MmrConfig {
    pub enabled: bool,
    pub lambda: f64,
}
impl Default for MmrConfig {
    fn default() -> Self {
        Self {
            enabled: false,
            lambda: 0.7,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum MemorySensitiveCategory {
    Credentials,
    Financial,
    Health,
    Identity,
    Location,
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn search_values_roundtrip_without_product_configuration() {
        let config = MemorySearchConfig::default();
        assert_eq!(
            serde_json::from_value::<MemorySearchConfig>(serde_json::to_value(&config).unwrap())
                .unwrap(),
            config
        );
        assert_eq!(config.effective_half_life_days(), Some(7.0));
    }
    #[test]
    fn only_explicit_temporal_decay_is_supported() {
        assert!(
            serde_json::from_value::<MemorySearchConfig>(serde_json::json!({"recency_decay":0.95}))
                .is_err()
        );
        for half_life_days in [0.0, -1.0, f64::NAN, f64::INFINITY] {
            let config = MemorySearchConfig {
                temporal_decay: TemporalDecayConfig {
                    enabled: true,
                    half_life_days,
                },
                ..Default::default()
            };
            assert_eq!(config.effective_half_life_days(), None);
        }
        let config = MemorySearchConfig {
            temporal_decay: TemporalDecayConfig {
                enabled: false,
                half_life_days: 7.0,
            },
            ..Default::default()
        };
        assert_eq!(config.effective_half_life_days(), None);
    }
}
