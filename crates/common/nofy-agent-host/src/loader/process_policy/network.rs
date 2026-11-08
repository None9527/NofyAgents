//! Portable outbound-network policy; this module opens no sockets.
use super::{HostError, Result};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use std::{collections::BTreeSet, net::IpAddr};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Destination {
    pub host: String,
    pub ports: BTreeSet<u16>,
    #[serde(default)]
    pub allow_private: bool,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(default, deny_unknown_fields)]
pub struct Config {
    pub allowed: Vec<Destination>,
    pub max_connections: u16,
    pub max_bytes_per_connection: u64,
    pub idle_timeout_ms: u64,
}
impl Default for Config {
    fn default() -> Self {
        Self {
            allowed: vec![],
            max_connections: 16,
            max_bytes_per_connection: 16 * 1024 * 1024,
            idle_timeout_ms: 30000,
        }
    }
}
fn invalid() -> HostError {
    HostError::Invalid("invalid network proxy policy".into())
}
impl Config {
    pub fn validate(&self) -> Result<()> {
        if self.allowed.is_empty()
            || self.allowed.len() > 64
            || !(1..=32).contains(&self.max_connections)
            || !(1024..=1024 * 1024 * 1024).contains(&self.max_bytes_per_connection)
            || !(100..=120000).contains(&self.idle_timeout_ms)
        {
            return Err(invalid());
        }
        let mut seen = BTreeSet::new();
        for rule in &self.allowed {
            let host = rule.host.strip_prefix("*.").unwrap_or(&rule.host);
            if host.is_empty()
                || host.len() > 253
                || host != host.to_ascii_lowercase()
                || host.ends_with('.')
                || host.chars().any(|c| c.is_whitespace() || c.is_control())
                || rule.ports.is_empty()
                || rule.ports.len() > 64
                || rule.ports.contains(&0)
                || !seen.insert(&rule.host)
                || (host
                    .trim_start_matches('[')
                    .trim_end_matches(']')
                    .parse::<IpAddr>()
                    .is_err()
                    && url::Host::parse(host).is_err())
                || (rule.host.starts_with("*.")
                    && (host.parse::<IpAddr>().is_ok() || !host.contains('.')))
            {
                return Err(invalid());
            }
        }
        Ok(())
    }
}
pub(in crate::loader) fn schema() -> Value {
    json!({"type":"object","additionalProperties":false,"required":["allowed"],"properties":{
        "allowed":{"type":"array","minItems":1,"maxItems":64,"items":{"type":"object","additionalProperties":false,"required":["host","ports"],"properties":{
            "host":{"type":"string","minLength":1,"maxLength":253},"ports":{"type":"array","uniqueItems":true,"minItems":1,"maxItems":64,"items":{"type":"integer","minimum":1,"maximum":65535}},"allow_private":{"type":"boolean"}}}},
        "max_connections":{"type":"integer","minimum":1,"maximum":32},"max_bytes_per_connection":{"type":"integer","minimum":1024,"maximum":1073741824},"idle_timeout_ms":{"type":"integer","minimum":100,"maximum":120000}}})
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn portable_network_defaults_require_explicit_destinations() {
        let config = Config::default();
        assert_eq!(
            serde_json::to_value(&config).unwrap(),
            json!({
                "allowed": [], "max_connections": 16,
                "max_bytes_per_connection": 16777216, "idle_timeout_ms": 30000
            })
        );
        assert!(config.validate().is_err());
        assert!(nofy_agent_runtime::settings::validate_json_value(&schema(), &json!({})).is_err());
        let config: Config = serde_json::from_value(json!({
            "allowed": [{"host": "example.com", "ports": [443]}]
        }))
        .unwrap();
        config.validate().unwrap();
        assert!(!config.allowed[0].allow_private);
    }

    #[test]
    fn portable_network_rejects_invalid_destinations_and_limits() {
        for host in [
            "",
            "EXAMPLE.com",
            "example.com.",
            "*.localhost",
            "*.127.0.0.1",
            "bad host",
        ] {
            let config: Config = serde_json::from_value(json!({
                "allowed": [{"host": host, "ports": [443]}]
            }))
            .unwrap();
            assert!(config.validate().is_err(), "{host}");
        }
        for value in [
            json!({"allowed": [{"host": "example.com", "ports": [0]}]}),
            json!({"allowed": [{"host": "example.com", "ports": []}]}),
            json!({"allowed": [{"host": "example.com", "ports": [80]}, {"host": "example.com", "ports": [443]}]}),
            json!({"allowed": [{"host": "example.com", "ports": [443]}], "max_connections": 0}),
            json!({"allowed": [{"host": "example.com", "ports": [443]}], "max_connections": 33}),
            json!({"allowed": [{"host": "example.com", "ports": [443]}], "max_bytes_per_connection": 1023}),
            json!({"allowed": [{"host": "example.com", "ports": [443]}], "idle_timeout_ms": 120001}),
        ] {
            assert!(
                serde_json::from_value::<Config>(value.clone())
                    .unwrap()
                    .validate()
                    .is_err(),
                "{value}"
            );
        }
        for host in ["example.com", "*.example.com", "127.0.0.1", "[::1]"] {
            let value = json!({"allowed": [{"host": host, "ports": [443]}]});
            nofy_agent_runtime::settings::validate_json_value(&schema(), &value).unwrap();
            serde_json::from_value::<Config>(value)
                .unwrap()
                .validate()
                .unwrap();
        }
    }
}
