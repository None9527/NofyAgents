#![allow(
    unused_imports,
    unused_variables,
    unused_mut,
    unreachable_code,
    dead_code
)]
mod flags;
pub use flags::*;
mod memory;
pub use memory::*;
mod mcp;
pub use mcp::*;
mod permission;
pub use permission::*;
mod pool;
pub use pool::*;
use serde::{Deserialize, Serialize};
/// A `campaigns[]` entry: an `id` gate plus a full-power
/// flattened config patch (the JSON sibling of a `[[campaigns]]` TOML override).
#[derive(Debug, Clone, Default, Deserialize, Serialize, PartialEq, Eq)]
pub struct CampaignOverride {
    #[serde(default, alias = "campaign_id")]
    pub id: Option<String>,
    #[serde(flatten, default)]
    pub patch: serde_json::Map<String, serde_json::Value>,
}
/// Doom-loop recovery settings for the `[doom_loop_recovery]` TOML table.
/// All fields are `Option` with per-field defaults (a partial object never
/// fails the parse, and unknown future keys are ignored); unset fields fall
/// through per-field in `resolve_doom_loop_recovery` (env > TOML > default).
/// Distinct namespace from the removed legacy `doom_loop_*` keys.
#[derive(Debug, Clone, Default, Deserialize, Serialize, PartialEq, Eq)]
#[serde(default)]
pub struct DoomLoopRecoverySettings {
    /// Send the `x-nofy-doom-loop-check` header, parse the reported
    /// triggers, and resample confident loops. `Some(false)` is a
    /// kill-switch; absent ⇒ client default (ON).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub enabled: Option<bool>,
    /// Highest `tail_repetition` threshold considered confident (clamped to
    /// 2..=64). Absent ⇒ client default (8). CLIENT-side filter over the
    /// trigger labels the server returns — the server emits every fired
    /// threshold; this is never sent as a request parameter.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_threshold: Option<u32>,
    /// Resample budget per turn (clamped to 0..=5). Absent ⇒ client
    /// default (2).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_retries: Option<u32>,
}
/// Per-kind age policy for auto-GC: seconds or never.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum WorktreeKindMaxAge {
    Secs(u64),
    Never,
}
impl Serialize for WorktreeKindMaxAge {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        match self {
            Self::Secs(n) => serializer.serialize_u64(*n),
            Self::Never => serializer.serialize_str("never"),
        }
    }
}
impl<'de> Deserialize<'de> for WorktreeKindMaxAge {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        struct V;
        impl<'de> serde::de::Visitor<'de> for V {
            type Value = WorktreeKindMaxAge;
            fn expecting(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
                f.write_str("u64 seconds or \"never\"")
            }
            fn visit_u64<E: serde::de::Error>(self, v: u64) -> Result<Self::Value, E> {
                Ok(WorktreeKindMaxAge::Secs(v))
            }
            fn visit_i64<E: serde::de::Error>(self, v: i64) -> Result<Self::Value, E> {
                u64::try_from(v)
                    .map(WorktreeKindMaxAge::Secs)
                    .map_err(E::custom)
            }
            fn visit_str<E: serde::de::Error>(self, v: &str) -> Result<Self::Value, E> {
                if v.eq_ignore_ascii_case("never") {
                    Ok(WorktreeKindMaxAge::Never)
                } else if let Ok(n) = v.parse::<u64>() {
                    Ok(WorktreeKindMaxAge::Secs(n))
                } else {
                    Err(E::custom("expected \"never\" or integer seconds"))
                }
            }
            fn visit_unit<E: serde::de::Error>(self) -> Result<Self::Value, E> {
                Ok(WorktreeKindMaxAge::Never)
            }
            fn visit_none<E: serde::de::Error>(self) -> Result<Self::Value, E> {
                Ok(WorktreeKindMaxAge::Never)
            }
        }
        deserializer.deserialize_any(V)
    }
}
/// Local `[worktree.auto_gc]` policy.
/// Field-wise tolerant deserialize so one bad key cannot drop a sibling kill-switch.
#[derive(Debug, Clone, Default, Deserialize, Serialize, PartialEq, Eq)]
#[serde(default)]
pub struct WorktreeAutoGcSettings {
    /// `Some(false)` kill-switch; absent ⇒ default on (env kill still applies).
    #[serde(
        default,
        deserialize_with = "de_opt_bool_tolerant",
        skip_serializing_if = "Option::is_none"
    )]
    pub enabled: Option<bool>,
    /// Age cutoff seconds when platform age-expiry is allowed; clamped by resolver.
    #[serde(
        default,
        deserialize_with = "de_opt_u64_tolerant",
        skip_serializing_if = "Option::is_none"
    )]
    pub max_age_secs: Option<u64>,
    /// Min seconds between successful auto-GC stamps; clamped by resolver.
    #[serde(
        default,
        deserialize_with = "de_opt_u64_tolerant",
        skip_serializing_if = "Option::is_none"
    )]
    pub min_interval_secs: Option<u64>,
    /// Count age candidates without deleting.
    #[serde(
        default,
        deserialize_with = "de_opt_bool_tolerant",
        skip_serializing_if = "Option::is_none"
    )]
    pub dry_run: Option<bool>,
    /// Linux only.
    #[serde(
        default,
        deserialize_with = "de_opt_bool_tolerant",
        skip_serializing_if = "Option::is_none"
    )]
    pub include_orphan_snapshots: Option<bool>,
    /// Per-kind max ages (`session`/`ab`/`pool`/`fork`/`manual`/`subagent`).
    /// Seconds or `"never"`. Absent keys use defaults (client default: `manual`=never).
    /// Unknown kind keys ignored at resolve.
    #[serde(
        default,
        deserialize_with = "de_opt_max_age_by_kind_tolerant",
        skip_serializing_if = "Option::is_none"
    )]
    pub max_age_by_kind: Option<std::collections::BTreeMap<String, WorktreeKindMaxAge>>,
    /// Optional discovery rebuild + nofy-scoped stale `.git/worktrees/` scrub (default off).
    #[serde(
        default,
        deserialize_with = "de_opt_bool_tolerant",
        skip_serializing_if = "Option::is_none"
    )]
    pub include_rebuild: Option<bool>,
    /// Independent rebuild throttle seconds; absent ⇒ 24h. Clamped like `min_interval_secs`.
    #[serde(
        default,
        deserialize_with = "de_opt_u64_tolerant",
        skip_serializing_if = "Option::is_none"
    )]
    pub rebuild_min_interval_secs: Option<u64>,
}
/// Display-refresh probe + auto-cadence settings: ONE struct for local
/// `[ui.display_refresh]` and `UiConfig`.
/// Field-wise tolerant deserialize (wrong types → `None`); unknown keys kept in
/// [`Self::extra`] so settings save cannot drop future knobs. Resolved by
/// `resolve_display_refresh`. Client defaults: probe on, auto off, floor 8 ms,
/// ceiling 16 ms, Hz band 55–165.
#[derive(Debug, Clone, Default, Serialize, Deserialize, PartialEq)]
#[serde(default)]
pub struct DisplayRefreshSettings {
    /// Once-per-process primary-display Hz probe. `Some(false)` is a kill-switch.
    #[serde(
        default,
        deserialize_with = "de_opt_bool_tolerant",
        skip_serializing_if = "Option::is_none"
    )]
    pub probe_enabled: Option<bool>,
    /// Derive paint/scroll cadence from a successful in-band probe (default off).
    #[serde(
        default,
        deserialize_with = "de_opt_bool_tolerant",
        skip_serializing_if = "Option::is_none"
    )]
    pub auto_cadence_enabled: Option<bool>,
    /// Lower clamp for auto-derived ms (default 8).
    #[serde(
        default,
        deserialize_with = "de_opt_u32_tolerant",
        skip_serializing_if = "Option::is_none"
    )]
    pub floor_ms: Option<u32>,
    /// Upper clamp for auto-derived ms (default 16).
    #[serde(
        default,
        deserialize_with = "de_opt_u32_tolerant",
        skip_serializing_if = "Option::is_none"
    )]
    pub ceiling_ms: Option<u32>,
    /// Minimum accepted probe Hz for auto-cadence (default 55).
    #[serde(
        default,
        deserialize_with = "de_opt_u32_tolerant",
        skip_serializing_if = "Option::is_none"
    )]
    pub min_hz: Option<u32>,
    /// Maximum accepted probe Hz for auto-cadence (default 165).
    #[serde(
        default,
        deserialize_with = "de_opt_u32_tolerant",
        skip_serializing_if = "Option::is_none"
    )]
    pub max_hz: Option<u32>,
    /// Unknown / future object members (preserved across config rewrite).
    #[serde(flatten, default, skip_serializing_if = "serde_json::Map::is_empty")]
    pub extra: serde_json::Map<String, serde_json::Value>,
}
impl DisplayRefreshSettings {
    /// True when no field is set (all inherit defaults).
    pub fn is_default(&self) -> bool {
        self.probe_enabled.is_none()
            && self.auto_cadence_enabled.is_none()
            && self.floor_ms.is_none()
            && self.ceiling_ms.is_none()
            && self.min_hz.is_none()
            && self.max_hz.is_none()
            && self.extra.is_empty()
    }
}
fn de_opt_bool_tolerant<'de, D: serde::Deserializer<'de>>(
    deserializer: D,
) -> Result<Option<bool>, D::Error> {
    struct V;
    impl<'de> serde::de::Visitor<'de> for V {
        type Value = Option<bool>;
        fn expecting(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
            f.write_str("bool (wrong types ignored)")
        }
        fn visit_bool<E: serde::de::Error>(self, v: bool) -> Result<Self::Value, E> {
            Ok(Some(v))
        }
        fn visit_unit<E: serde::de::Error>(self) -> Result<Self::Value, E> {
            Ok(None)
        }
        fn visit_none<E: serde::de::Error>(self) -> Result<Self::Value, E> {
            Ok(None)
        }
        fn visit_some<A: serde::de::Deserializer<'de>>(
            self,
            d: A,
        ) -> Result<Self::Value, A::Error> {
            d.deserialize_any(V)
        }
        fn visit_str<E: serde::de::Error>(self, _: &str) -> Result<Self::Value, E> {
            Ok(None)
        }
        fn visit_string<E: serde::de::Error>(self, _: String) -> Result<Self::Value, E> {
            Ok(None)
        }
        fn visit_i64<E: serde::de::Error>(self, _: i64) -> Result<Self::Value, E> {
            Ok(None)
        }
        fn visit_u64<E: serde::de::Error>(self, _: u64) -> Result<Self::Value, E> {
            Ok(None)
        }
        fn visit_f64<E: serde::de::Error>(self, _: f64) -> Result<Self::Value, E> {
            Ok(None)
        }
    }
    deserializer.deserialize_any(V)
}
fn de_opt_u32_tolerant<'de, D: serde::Deserializer<'de>>(
    deserializer: D,
) -> Result<Option<u32>, D::Error> {
    struct V;
    impl<'de> serde::de::Visitor<'de> for V {
        type Value = Option<u32>;
        fn expecting(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
            f.write_str("u32 (wrong types ignored)")
        }
        fn visit_u64<E: serde::de::Error>(self, v: u64) -> Result<Self::Value, E> {
            Ok(u32::try_from(v).ok())
        }
        fn visit_i64<E: serde::de::Error>(self, v: i64) -> Result<Self::Value, E> {
            Ok(u32::try_from(v).ok())
        }
        fn visit_u32<E: serde::de::Error>(self, v: u32) -> Result<Self::Value, E> {
            Ok(Some(v))
        }
        fn visit_i32<E: serde::de::Error>(self, v: i32) -> Result<Self::Value, E> {
            Ok(u32::try_from(v).ok())
        }
        fn visit_unit<E: serde::de::Error>(self) -> Result<Self::Value, E> {
            Ok(None)
        }
        fn visit_none<E: serde::de::Error>(self) -> Result<Self::Value, E> {
            Ok(None)
        }
        fn visit_some<A: serde::de::Deserializer<'de>>(
            self,
            d: A,
        ) -> Result<Self::Value, A::Error> {
            d.deserialize_any(V)
        }
        fn visit_str<E: serde::de::Error>(self, _: &str) -> Result<Self::Value, E> {
            Ok(None)
        }
        fn visit_string<E: serde::de::Error>(self, _: String) -> Result<Self::Value, E> {
            Ok(None)
        }
        fn visit_bool<E: serde::de::Error>(self, _: bool) -> Result<Self::Value, E> {
            Ok(None)
        }
        fn visit_f64<E: serde::de::Error>(self, _: f64) -> Result<Self::Value, E> {
            Ok(None)
        }
    }
    deserializer.deserialize_any(V)
}
fn de_opt_u64_tolerant<'de, D: serde::Deserializer<'de>>(
    deserializer: D,
) -> Result<Option<u64>, D::Error> {
    struct V;
    impl<'de> serde::de::Visitor<'de> for V {
        type Value = Option<u64>;
        fn expecting(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
            f.write_str("u64 (wrong types ignored)")
        }
        fn visit_u64<E: serde::de::Error>(self, v: u64) -> Result<Self::Value, E> {
            Ok(Some(v))
        }
        fn visit_i64<E: serde::de::Error>(self, v: i64) -> Result<Self::Value, E> {
            Ok(u64::try_from(v).ok())
        }
        fn visit_u32<E: serde::de::Error>(self, v: u32) -> Result<Self::Value, E> {
            Ok(Some(u64::from(v)))
        }
        fn visit_i32<E: serde::de::Error>(self, v: i32) -> Result<Self::Value, E> {
            Ok(u64::try_from(v).ok())
        }
        fn visit_unit<E: serde::de::Error>(self) -> Result<Self::Value, E> {
            Ok(None)
        }
        fn visit_none<E: serde::de::Error>(self) -> Result<Self::Value, E> {
            Ok(None)
        }
        fn visit_some<A: serde::de::Deserializer<'de>>(
            self,
            d: A,
        ) -> Result<Self::Value, A::Error> {
            d.deserialize_any(V)
        }
        fn visit_str<E: serde::de::Error>(self, _: &str) -> Result<Self::Value, E> {
            Ok(None)
        }
        fn visit_string<E: serde::de::Error>(self, _: String) -> Result<Self::Value, E> {
            Ok(None)
        }
        fn visit_bool<E: serde::de::Error>(self, _: bool) -> Result<Self::Value, E> {
            Ok(None)
        }
        fn visit_f64<E: serde::de::Error>(self, _: f64) -> Result<Self::Value, E> {
            Ok(None)
        }
    }
    deserializer.deserialize_any(V)
}
/// Tolerant map: bad whole value → None; per-entry bad values skipped.
fn de_opt_max_age_by_kind_tolerant<'de, D: serde::Deserializer<'de>>(
    deserializer: D,
) -> Result<Option<std::collections::BTreeMap<String, WorktreeKindMaxAge>>, D::Error> {
    let value = serde_json::Value::deserialize(deserializer)?;
    match value {
        serde_json::Value::Null => Ok(None),
        serde_json::Value::Object(map) => {
            let mut out = std::collections::BTreeMap::new();
            for (k, v) in map {
                if let Ok(age) = serde_json::from_value::<WorktreeKindMaxAge>(v) {
                    out.insert(k, age);
                }
            }
            Ok(Some(out))
        }
        _ => Ok(None),
    }
}
/// The canonical Goal model/harness pair; its original config path is retained.
pub use nofy_goal::GoalRoleModel;
