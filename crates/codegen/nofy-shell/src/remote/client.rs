//! Model catalog fetching from a custom OpenAI-compatible `/v1/models`
//! endpoint.
use crate::auth::NofyAuth;
use indexmap::IndexMap;
use serde::Deserialize;
#[derive(Debug, thiserror::Error)]
pub enum BackendError {
    #[error("Network error: {0}")]
    Network(#[from] reqwest::Error),
    #[error("Request failed: {status} - {body}")]
    RequestFailed { status: u16, body: String },
    #[error("Auth error: {0}")]
    Auth(String),
}
/// Default context window (256k) when the remote endpoint doesn't provide one.
pub(crate) const DEFAULT_CONTEXT_WINDOW: u64 = 256_000;
#[derive(Debug, Deserialize)]
struct ModelsResponse {
    data: Vec<serde_json::Value>,
}
/// The `/v1/models` URL [`fetch_models_blocking`] hits. Doubles as the models
/// disk-cache origin key: cached entries embed absolute `base_url`s from the
/// backend that served them, so a catalog fetched from one backend (env
/// override, another deployment, a test's mock server) must be a cache miss
/// for any other backend. Fetching itself is gated on a custom endpoint
/// being configured (see `catalog_fetch_allowed`).
pub(crate) fn models_list_url(
    endpoints: &crate::agent::config::EndpointsConfig,
    _fetch_auth: crate::agent::models::ModelFetchAuth,
) -> String {
    endpoints.resolve_models_list_url()
}
/// Fetch models from an OpenAI-compatible `/v1/models` endpoint.
/// Fetch result: model entries + optional etag from response.
pub struct FetchModelsResult {
    pub models: Vec<crate::agent::config::ModelEntryConfig>,
    pub etag: Option<String>,
}
pub(crate) fn fetch_models_blocking(
    endpoints: &crate::agent::config::EndpointsConfig,
    auth: Option<&NofyAuth>,
    _fetch_auth: crate::agent::models::ModelFetchAuth,
) -> Result<FetchModelsResult, BackendError> {
    let client = crate::http::shared_startup_blocking_client();
    let url = endpoints.resolve_models_list_url();
    let inference_base_url = endpoints.resolve_inference_base_url();
    tracing::info!("Fetching models from {}", url);
    let api_key = crate::agent::auth_method::read_xai_api_key_env()
        .or_else(|_| {
            auth.map(|a| a.key.clone())
                .ok_or(std::env::VarError::NotPresent)
        })
        .map_err(|_| {
            BackendError::Auth("No API key for custom models endpoint. Set NOFY_API_KEY.".into())
        })?;
    let request = client
        .get(&url)
        .header("Authorization", format!("Bearer {}", api_key));
    let response = request.send()?;
    if !response.status().is_success() {
        let status = response.status().as_u16();
        let body = response.text().unwrap_or_default();
        tracing::warn!("Failed to fetch models: {} - {}", status, body);
        return Err(BackendError::RequestFailed { status, body });
    }
    let etag = response
        .headers()
        .get("etag")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string());
    let models_response: ModelsResponse = response.json()?;
    tracing::info!(
        "Fetched {} models from {}",
        models_response.data.len(),
        url
    );
    let mut models = Vec::with_capacity(models_response.data.len());
    for (idx, value) in models_response.data.into_iter().enumerate() {
        match parse_remote_model_value(&value, &inference_base_url) {
            Some(model) => models.push(model),
            None => {
                tracing::warn!(
                    "Skipping model at index {}: missing required field ('model' or 'context_window') or invalid types",
                    idx
                )
            }
        }
    }
    Ok(FetchModelsResult { models, etag })
}
/// Parse a single model entry from the /models-v2 response.
/// Used by both initial model fetch and session-resume metadata refresh.
pub(crate) fn parse_remote_model_value(
    value: &serde_json::Value,
    default_base_url: &str,
) -> Option<crate::agent::config::ModelEntryConfig> {
    let obj = value.as_object()?;
    let meta = obj.get("_meta").and_then(|v| v.as_object());
    let id = get_string(obj, "id");
    let model = get_string(obj, "model")
        .or_else(|| get_string(obj, "modelId"))
        .or_else(|| id.clone())
        .or_else(|| meta.and_then(|m| get_string(m, "model")))
        .or_else(|| meta.and_then(|m| get_string(m, "modelId")))?;
    let base_url = get_string(obj, "baseUrl")
        .or_else(|| get_string(obj, "base_url"))
        .unwrap_or_else(|| default_base_url.to_owned());
    let name = get_string(obj, "name").or_else(|| Some(model.clone()));
    let context_window = get_u64(obj, "contextWindow")
        .or_else(|| get_u64(obj, "context_window"))
        .or_else(|| meta.and_then(|m| get_u64(m, "contextWindow")))
        .or_else(|| meta.and_then(|m| get_u64(m, "totalContextTokens")))
        .unwrap_or(DEFAULT_CONTEXT_WINDOW);
    let context_window = std::num::NonZeroU64::new(context_window)?;
    let agent_type = get_string(obj, "systemPromptType")
        .or_else(|| get_string(obj, "system_prompt_type"))
        .or_else(|| get_string(obj, "agent_type"))
        .or_else(|| get_string(obj, "agentType"))
        .or_else(|| meta.and_then(|m| get_string(m, "agentType")))
        .or_else(|| meta.and_then(|m| get_string(m, "agent_type")))
        .unwrap_or_else(crate::agent::config::default_agent_type);
    let api_backend = get_string(obj, "apiBackend")
        .or_else(|| get_string(obj, "api_backend"))
        .and_then(|s| match s.as_str() {
            "responses" => Some(crate::sampling::ApiBackend::Responses),
            "chat_completions" => Some(crate::sampling::ApiBackend::ChatCompletions),
            "messages" => Some(crate::sampling::ApiBackend::Messages),
            _ => None,
        })
        .unwrap_or_default();
    Some(crate::agent::config::ModelEntryConfig {
        id,
        model,
        base_url,
        name,
        description: get_string(obj, "description"),
        max_completion_tokens: get_u64(obj, "maxCompletionTokens")
            .or_else(|| get_u64(obj, "max_completion_tokens"))
            .and_then(|v| u32::try_from(v).ok()),
        temperature: get_f64(obj, "temperature").map(|v| v as f32),
        top_p: get_f64(obj, "topP").or_else(|| get_f64(obj, "top_p")).map(|v| v as f32),
        api_key: get_string(obj, "apiKey").or_else(|| get_string(obj, "api_key")),
        env_key: get_env_keys(obj, "envKey").or_else(|| get_env_keys(obj, "env_key")),
        api_backend,
        context_window,
        auto_compact_threshold_percent: get_u64(obj, "autoCompactThresholdPercent")
            .or_else(|| get_u64(obj, "auto_compact_threshold_percent"))
            .and_then(|v| u8::try_from(v).ok()),
        system_prompt_label: get_string(obj, "systemPromptLabel")
            .or_else(|| get_string(obj, "system_prompt_label"))
            .filter(|s| !s.trim().is_empty()),
        extra_headers: get_string_map(obj, "extraHeaders"),
        api_base_url: get_string(obj, "apiBaseUrl")
            .or_else(|| get_string(obj, "api_base_url")),
        use_concise: obj
            .get("useConcise")
            .or_else(|| obj.get("use_concise"))
            .and_then(|v| v.as_bool())
            .unwrap_or(false),
        agent_type,
        inference_idle_timeout_secs: get_u64(obj, "inferenceIdleTimeoutSecs")
            .or_else(|| get_u64(obj, "inference_idle_timeout_secs")),
        max_retries: get_u64(obj, "maxRetries")
            .or_else(|| get_u64(obj, "max_retries"))
            .and_then(|v| u32::try_from(v).ok()),
        hidden: obj
            .get("hidden")
            .or_else(|| meta.and_then(|m| m.get("hidden")))
            .and_then(|v| v.as_bool())
            .unwrap_or(false),
        supported_in_api: obj
            .get("supportedInApi")
            .or_else(|| obj.get("supported_in_api"))
            .or_else(|| meta.and_then(|m| m.get("supportedInApi")))
            .and_then(|v| v.as_bool())
            .unwrap_or(true),
        auth_scheme: None,
        reasoning_effort: get_string(obj, "reasoningEffort")
            .or_else(|| get_string(obj, "reasoning_effort"))
            .or_else(|| meta.and_then(|m| get_string(m, "reasoningEffort")))
            .and_then(|s| s.parse().ok()),
        supports_reasoning_effort: obj
            .get("supportsReasoningEffort")
            .or_else(|| obj.get("supports_reasoning_effort"))
            .or_else(|| meta.and_then(|m| m.get("supportsReasoningEffort")))
            .and_then(|v| v.as_bool())
            .unwrap_or(false),
        reasoning_efforts: obj
            .get("reasoningEfforts")
            .or_else(|| obj.get("reasoning_efforts"))
            .or_else(|| meta.and_then(|m| m.get("reasoningEfforts")))
            .and_then(|v| v.as_array())
            .map(|arr| nofy_sampling_types::parse_reasoning_effort_options(arr))
            .unwrap_or_default(),
        // The remote catalog carries no per-effort id contract; variants are a
        // local declaration (`[[model.<id>.variants]]` in config.toml, or the
        // JSON config's `variants` array) and merge over this in `apply`.
        variants: Vec::new(),
        compactions_remaining: obj
            .get("compactionsRemaining")
            .or_else(|| obj.get("compactions_remaining"))
            .or_else(|| meta.and_then(|m| m.get("compactionsRemaining")))
            .and_then(parse_compactions_remaining)
            .or_else(|| {
                obj
                    .get("sendCompactionsRemaining")
                    .or_else(|| obj.get("send_compactions_remaining"))
                    .or_else(|| meta.and_then(|m| m.get("sendCompactionsRemaining")))
                    .and_then(|v| v.as_bool())
                    .map(nofy_sampling_types::CompactionsRemaining::Dynamic)
            }),
        compaction_at_tokens: obj
            .get("compactionAtTokens")
            .or_else(|| obj.get("compaction_at_tokens"))
            .or_else(|| meta.and_then(|m| m.get("compactionAtTokens")))
            .and_then(parse_compaction_at_tokens),
        show_model_fingerprint: obj
            .get("showModelFingerprint")
            .or_else(|| obj.get("show_model_fingerprint"))
            .or_else(|| meta.and_then(|m| m.get("showModelFingerprint")))
            .and_then(|v| v.as_bool())
            .unwrap_or(false),
        stream_tool_calls: obj
            .get("streamToolCalls")
            .or_else(|| obj.get("stream_tool_calls"))
            .and_then(|v| v.as_bool()),
        laziness_detector: get_object(obj, "lazinessDetector")
            .or_else(|| get_object(obj, "laziness_detector"))
            .or_else(|| meta.and_then(|m| get_object(m, "lazinessDetector")))
            .and_then(|v| match serde_json::from_value::<
                crate::agent::config::LazinessDetectorPerModelConfig,
            >(v.clone()) {
                Ok(cfg) => Some(cfg),
                Err(e) => {
                    tracing::warn!(
                            error = %e,
                            "Failed to deserialize laziness_detector block from remote model; falling back to default"
                        );
                    None
                }
            })
            .unwrap_or_default(),
    })
}
fn get_string(obj: &serde_json::Map<String, serde_json::Value>, key: &str) -> Option<String> {
    obj.get(key).and_then(|v| v.as_str()).map(|s| s.to_string())
}
/// Parse `env_key` / `envKey` as a single string or a string array.
fn get_env_keys(
    obj: &serde_json::Map<String, serde_json::Value>,
    key: &str,
) -> Option<crate::agent::config::EnvKeys> {
    let v = obj.get(key)?;
    if let Some(s) = v.as_str() {
        return Some(crate::agent::config::EnvKeys::single(s));
    }
    if let Some(arr) = v.as_array() {
        let mut names = Vec::with_capacity(arr.len());
        for item in arr {
            let Some(s) = item.as_str() else {
                tracing::warn!(
                    key,
                    "env_key array has a non-string element; ignoring env_key"
                );
                return None;
            };
            if !s.is_empty() {
                names.push(s.to_owned());
            }
        }
        if names.is_empty() {
            return None;
        }
        return Some(crate::agent::config::EnvKeys::new(names));
    }
    None
}
fn parse_compaction_at_tokens(
    v: &serde_json::Value,
) -> Option<nofy_sampling_types::CompactionAtTokens> {
    use nofy_sampling_types::CompactionAtTokens;
    v.as_bool()
        .map(CompactionAtTokens::Enabled)
        .or_else(|| v.as_u64().map(CompactionAtTokens::Fixed))
}
fn parse_compactions_remaining(
    v: &serde_json::Value,
) -> Option<nofy_sampling_types::CompactionsRemaining> {
    use nofy_sampling_types::CompactionsRemaining;
    v.as_bool().map(CompactionsRemaining::Dynamic).or_else(|| {
        v.as_u64()
            .and_then(|n| u8::try_from(n).ok())
            .map(CompactionsRemaining::Fixed)
    })
}
fn get_u64(obj: &serde_json::Map<String, serde_json::Value>, key: &str) -> Option<u64> {
    obj.get(key).and_then(|v| v.as_u64())
}
fn get_f64(obj: &serde_json::Map<String, serde_json::Value>, key: &str) -> Option<f64> {
    obj.get(key).and_then(|v| v.as_f64())
}
fn get_object<'a>(
    obj: &'a serde_json::Map<String, serde_json::Value>,
    key: &str,
) -> Option<&'a serde_json::Value> {
    obj.get(key).filter(|v| v.is_object())
}
fn get_string_map(
    obj: &serde_json::Map<String, serde_json::Value>,
    key: &str,
) -> IndexMap<String, String> {
    obj.get(key)
        .and_then(|v| v.as_object())
        .map(|map| {
            map.iter()
                .filter_map(|(k, v)| v.as_str().map(|s| (k.clone(), s.to_string())))
                .collect()
        })
        .unwrap_or_default()
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn get_env_keys_parses_strings_and_rejects_non_strings() {
        use crate::agent::config::EnvKeys;
        let parse = |v: serde_json::Value| {
            let obj = serde_json::json!({ "env_key": v });
            get_env_keys(obj.as_object().unwrap(), "env_key")
        };
        assert_eq!(parse(serde_json::json!("A")), Some(EnvKeys::single("A")));
        assert_eq!(
            parse(serde_json::json!(["A", "B"])),
            Some(EnvKeys::new(["A", "B"]))
        );
        assert_eq!(parse(serde_json::json!(["A", 123])), None);
        assert_eq!(parse(serde_json::json!([])), None);
    }
    #[test]
    fn parse_openai_format_uses_id_field() {
        let value = serde_json::json!({
            "id": "grok-3",
            "object": "model",
            "owned_by": "nofy",
            "context_window": 131072
        });
        let result = parse_remote_model_value(&value, nofy_env::PROD_XAI_API_BASE_URL).unwrap();
        assert_eq!(result.model, "grok-3");
        assert_eq!(result.base_url, nofy_env::PROD_XAI_API_BASE_URL);
        assert_eq!(result.name.as_deref(), Some("grok-3"));
    }
    #[test]
    fn parse_model_field_takes_priority_over_id() {
        let value = serde_json::json!({
            "id": "display-key",
            "model": "actual-model-id",
            "name": "Display Name",
            "context_window": 131072
        });
        let result = parse_remote_model_value(&value, "https://default.url").unwrap();
        assert_eq!(result.model, "actual-model-id");
        assert_eq!(result.name.as_deref(), Some("Display Name"));
    }
    #[test]
    fn parse_reads_reasoning_effort_fields() {
        use nofy_sampling_types::ReasoningEffort;
        let value = serde_json::json!({
            "model": "grok-4.5",
            "context_window": 1_000_000,
            "supports_reasoning_effort": true,
            "reasoning_effort": "high"
        });
        let result = parse_remote_model_value(&value, "https://default.url").unwrap();
        assert!(result.supports_reasoning_effort);
        assert_eq!(result.reasoning_effort, Some(ReasoningEffort::High));
        let value = serde_json::json!({
            "model": "grok-4.5",
            "contextWindow": 1_000_000,
            "supportsReasoningEffort": true,
            "reasoningEffort": "xhigh"
        });
        let result = parse_remote_model_value(&value, "https://default.url").unwrap();
        assert!(result.supports_reasoning_effort);
        assert_eq!(result.reasoning_effort, Some(ReasoningEffort::Xhigh));
        let value = serde_json::json!({"model": "x", "context_window": 256_000});
        let result = parse_remote_model_value(&value, "https://default.url").unwrap();
        assert!(!result.supports_reasoning_effort);
        assert!(result.reasoning_effort.is_none());
    }
    #[test]
    fn parse_reads_reasoning_efforts_list() {
        use nofy_sampling_types::ReasoningEffort;
        let value = serde_json::json!({
            "model": "grok-4.5",
            "context_window": 1_000_000,
            "reasoning_efforts": [
                { "id": "deep", "value": "xhigh", "label": "Deep" },
                { "value": "quantum" },
                "low",
            ]
        });
        let result = parse_remote_model_value(&value, "https://default.url").unwrap();
        assert_eq!(result.reasoning_efforts.len(), 2);
        assert_eq!(result.reasoning_efforts[0].id, "deep");
        assert_eq!(result.reasoning_efforts[0].value, ReasoningEffort::Xhigh);
        assert_eq!(result.reasoning_efforts[1].value, ReasoningEffort::Low);
        for value in [
            serde_json::json!({
                "model": "m", "context_window": 256_000,
                "reasoningEfforts": [{ "value": "high" }]
            }),
            serde_json::json!({
                "model": "m", "context_window": 256_000,
                "_meta": { "reasoningEfforts": [{ "value": "high" }] }
            }),
        ] {
            let result = parse_remote_model_value(&value, "https://default.url").unwrap();
            assert_eq!(result.reasoning_efforts.len(), 1);
            assert_eq!(result.reasoning_efforts[0].value, ReasoningEffort::High);
        }
        let value = serde_json::json!({"model": "x", "context_window": 256_000});
        let result = parse_remote_model_value(&value, "https://default.url").unwrap();
        assert!(result.reasoning_efforts.is_empty());
    }
    #[test]
    fn parse_reads_meta_fallback_fields() {
        let value = serde_json::json!({
            "_meta": {
                "model": "meta-model-id",
                "contextWindow": 131072,
                "agentType": "concise"
            }
        });
        let result = parse_remote_model_value(&value, "https://default.url").unwrap();
        assert_eq!(result.model, "meta-model-id");
        assert_eq!(
            result.context_window,
            std::num::NonZeroU64::new(131072).unwrap()
        );
        assert_eq!(result.agent_type, "concise");
    }
    #[test]
    fn parse_remote_model_value_no_laziness_detector_block_yields_default() {
        let value = serde_json::json!({
            "model": "grok-4",
            "context_window": 256_000,
        });
        let result = parse_remote_model_value(&value, "https://default.url").unwrap();
        assert_eq!(
            result.laziness_detector,
            crate::agent::config::LazinessDetectorPerModelConfig::default()
        );
    }
    #[test]
    fn parse_remote_model_value_parses_camelcase_key() {
        let value = serde_json::json!({
            "model": "grok-4",
            "context_window": 256_000,
            "lazinessDetector": {
                "enabled": true,
                "max_nudges_per_session": 2,
                "idle_threshold_ms": 12_000,
                "min_confidence": 0.75,
            },
        });
        let result = parse_remote_model_value(&value, "https://default.url").unwrap();
        let expected = crate::agent::config::LazinessDetectorPerModelConfig {
            enabled: true,
            max_nudges_per_session: 2,
            idle_threshold_ms: Some(12_000),
            min_confidence: Some(0.75),
            include_reasoning: None,
        };
        assert_eq!(result.laziness_detector, expected);
    }
    #[test]
    fn parse_remote_model_value_parses_snake_case_laziness_detector() {
        let value = serde_json::json!({
            "model": "grok-4",
            "context_window": 256_000,
            "laziness_detector": {
                "enabled": true,
                "max_nudges_per_session": 3,
                "idle_threshold_ms": 8_000,
                "min_confidence": 0.6,
            },
        });
        let result = parse_remote_model_value(&value, "https://default.url").unwrap();
        let expected = crate::agent::config::LazinessDetectorPerModelConfig {
            enabled: true,
            max_nudges_per_session: 3,
            idle_threshold_ms: Some(8_000),
            min_confidence: Some(0.6),
            include_reasoning: None,
        };
        assert_eq!(result.laziness_detector, expected);
    }
    #[test]
    fn parse_remote_model_value_parses_meta_laziness_detector() {
        let value = serde_json::json!({
            "model": "grok-4",
            "context_window": 256_000,
            "_meta": {
                "lazinessDetector": {
                    "enabled": true,
                    "max_nudges_per_session": 1,
                    "idle_threshold_ms": 15_000,
                    "min_confidence": 0.9,
                },
            },
        });
        let result = parse_remote_model_value(&value, "https://default.url").unwrap();
        let expected = crate::agent::config::LazinessDetectorPerModelConfig {
            enabled: true,
            max_nudges_per_session: 1,
            idle_threshold_ms: Some(15_000),
            min_confidence: Some(0.9),
            include_reasoning: None,
        };
        assert_eq!(result.laziness_detector, expected);
    }
    #[test]
    fn parse_remote_model_value_partial_block_uses_field_defaults() {
        let value = serde_json::json!({
            "model": "grok-4",
            "context_window": 256_000,
            "lazinessDetector": {
                "enabled": true,
            },
        });
        let result = parse_remote_model_value(&value, "https://default.url").unwrap();
        let expected = crate::agent::config::LazinessDetectorPerModelConfig {
            enabled: true,
            max_nudges_per_session: 0,
            idle_threshold_ms: None,
            min_confidence: None,
            include_reasoning: None,
        };
        assert_eq!(result.laziness_detector, expected);
    }
    #[test]
    fn parse_remote_model_value_malformed_block_falls_back_to_default() {
        let value = serde_json::json!({
            "model": "grok-4",
            "context_window": 256_000,
            "lazinessDetector": {
                "enabled": true,
                "max_nudges_per_session": "abc",
            },
        });
        let result = parse_remote_model_value(&value, "https://default.url").unwrap();
        assert_eq!(
            result.laziness_detector,
            crate::agent::config::LazinessDetectorPerModelConfig::default()
        );
    }
    #[test]
    fn parse_remote_model_value_non_object_value_falls_back_to_default() {
        let value = serde_json::json!({
            "model": "grok-4",
            "context_window": 256_000,
            "lazinessDetector": "not-an-object",
        });
        let result = parse_remote_model_value(&value, "https://default.url").unwrap();
        assert_eq!(
            result.laziness_detector,
            crate::agent::config::LazinessDetectorPerModelConfig::default()
        );
    }
    #[test]
    fn parse_remote_model_value_top_level_camelcase_wins_over_snake_case() {
        let value = serde_json::json!({
            "model": "grok-4",
            "context_window": 256_000,
            "lazinessDetector": {
                "enabled": true,
                "max_nudges_per_session": 7,
            },
            "laziness_detector": {
                "enabled": false,
                "max_nudges_per_session": 99,
            },
        });
        let result = parse_remote_model_value(&value, "https://default.url").unwrap();
        let expected = crate::agent::config::LazinessDetectorPerModelConfig {
            enabled: true,
            max_nudges_per_session: 7,
            idle_threshold_ms: None,
            min_confidence: None,
            include_reasoning: None,
        };
        assert_eq!(result.laziness_detector, expected);
    }
    /// `include_reasoning: false` parses cleanly under the per-model
    /// `lazinessDetector` block (camelCase wrapper, snake_case inner —
    /// matching the existing field-naming convention used for the
    /// sibling `min_confidence`, `idle_threshold_ms`, etc.).
    #[test]
    fn parse_remote_model_value_parses_include_reasoning_under_camelcase_wrapper() {
        let value = serde_json::json!({
            "model": "grok-4",
            "context_window": 256_000,
            "lazinessDetector": {
                "enabled": true,
                "include_reasoning": false,
            },
        });
        let result = parse_remote_model_value(&value, "https://default.url").unwrap();
        assert_eq!(result.laziness_detector.include_reasoning, Some(false));
    }
    #[test]
    fn parse_remote_model_value_parses_include_reasoning_under_snake_case_wrapper() {
        let value = serde_json::json!({
            "model": "grok-4",
            "context_window": 256_000,
            "laziness_detector": {
                "enabled": true,
                "include_reasoning": true,
            },
        });
        let result = parse_remote_model_value(&value, "https://default.url").unwrap();
        assert_eq!(result.laziness_detector.include_reasoning, Some(true));
    }
    #[test]
    fn parse_remote_model_value_omitted_include_reasoning_defaults_to_none() {
        let value = serde_json::json!({
            "model": "grok-4",
            "context_window": 256_000,
            "lazinessDetector": {
                "enabled": true,
                "max_nudges_per_session": 2,
            },
        });
        let result = parse_remote_model_value(&value, "https://default.url").unwrap();
        assert_eq!(
            result.laziness_detector.include_reasoning, None,
            "absent include_reasoning defers to harness default via None",
        );
    }
    #[test]
    fn parse_remote_model_value_top_level_wins_over_meta() {
        let value = serde_json::json!({
            "model": "grok-4",
            "context_window": 256_000,
            "lazinessDetector": {
                "enabled": true,
                "max_nudges_per_session": 5,
            },
            "_meta": {
                "lazinessDetector": {
                    "enabled": false,
                    "max_nudges_per_session": 99,
                },
            },
        });
        let result = parse_remote_model_value(&value, "https://default.url").unwrap();
        let expected = crate::agent::config::LazinessDetectorPerModelConfig {
            enabled: true,
            max_nudges_per_session: 5,
            idle_threshold_ms: None,
            min_confidence: None,
            include_reasoning: None,
        };
        assert_eq!(result.laziness_detector, expected);
    }
    #[test]
    fn parse_reads_show_model_fingerprint_field() {
        let value = serde_json::json!({
            "model": "nofy-build",
            "context_window": 256_000,
            "show_model_fingerprint": true
        });
        let result = parse_remote_model_value(&value, "https://default.url").unwrap();
        assert!(result.show_model_fingerprint);
        let value = serde_json::json!({
            "model": "nofy-build",
            "contextWindow": 256_000,
            "showModelFingerprint": true
        });
        let result = parse_remote_model_value(&value, "https://default.url").unwrap();
        assert!(result.show_model_fingerprint);
        let value = serde_json::json!({
            "model": "nofy-build",
            "context_window": 256_000,
            "_meta": { "showModelFingerprint": true }
        });
        let result = parse_remote_model_value(&value, "https://default.url").unwrap();
        assert!(result.show_model_fingerprint);
        let value = serde_json::json!({"model": "x", "context_window": 256_000});
        let result = parse_remote_model_value(&value, "https://default.url").unwrap();
        assert!(!result.show_model_fingerprint);
    }
    #[test]
    fn get_object_returns_none_for_non_object_values() {
        let value = serde_json::json!({
            "string": "hello",
            "number": 42,
            "bool": true,
            "array": [1, 2, 3],
            "null": null,
        });
        let obj = value.as_object().unwrap();
        assert!(get_object(obj, "string").is_none());
        assert!(get_object(obj, "number").is_none());
        assert!(get_object(obj, "bool").is_none());
        assert!(get_object(obj, "array").is_none());
        assert!(get_object(obj, "null").is_none());
        assert!(get_object(obj, "missing").is_none());
    }
    #[test]
    fn get_object_returns_some_for_actual_object() {
        let value = serde_json::json!({
            "nested": { "a": 1, "b": "two" },
        });
        let obj = value.as_object().unwrap();
        let nested = get_object(obj, "nested").expect("nested key should resolve to object");
        assert!(nested.is_object());
        assert_eq!(nested["a"], serde_json::json!(1));
        assert_eq!(nested["b"], serde_json::json!("two"));
    }
    fn endpoints(
        proxy: &str,
        models_base_url: Option<&str>,
        models_list_url: Option<&str>,
    ) -> crate::agent::config::EndpointsConfig {
        crate::agent::config::EndpointsConfig {
            cli_chat_proxy_base_url: Some(proxy.to_owned()),
            models_base_url: models_base_url.map(|s| s.to_owned()),
            models_list_url: models_list_url.map(|s| s.to_owned()),
            ..Default::default()
        }
    }
    #[test]
    fn inference_url_defaults_to_proxy() {
        let ep = endpoints("https://proxy.grok.com/v1", None, None);
        assert_eq!(ep.resolve_inference_base_url(), "https://proxy.grok.com/v1");
    }
    #[test]
    fn inference_url_uses_models_base_url() {
        let ep = endpoints(
            "https://proxy.grok.com/v1",
            Some("https://enterprise.acme.com/v1"),
            None,
        );
        assert_eq!(
            ep.resolve_inference_base_url(),
            "https://enterprise.acme.com/v1"
        );
    }
    #[test]
    fn inference_url_base_url_wins_over_proxy() {
        let ep = endpoints(
            "https://proxy.grok.com/v1",
            Some("https://inference.acme.com/v1"),
            Some("https://registry.acme.com/api/models"),
        );
        assert_eq!(
            ep.resolve_inference_base_url(),
            "https://inference.acme.com/v1"
        );
    }
    #[test]
    fn list_url_defaults_to_proxy_models() {
        let ep = endpoints("https://proxy.grok.com/v1", None, None);
        assert_eq!(
            ep.resolve_models_list_url(),
            "https://proxy.grok.com/v1/models"
        );
    }
    #[test]
    fn list_url_derived_from_base_url() {
        let ep = endpoints(
            "https://proxy.grok.com/v1",
            Some(nofy_env::PROD_XAI_API_BASE_URL),
            None,
        );
        assert_eq!(ep.resolve_models_list_url(), "https://api.x.ai/v1/models");
    }
    #[test]
    fn list_url_explicit_overrides_derivation() {
        let ep = endpoints(
            "https://proxy.grok.com/v1",
            Some("https://inference.acme.com/v1"),
            Some("https://registry.acme.com/api/list-models"),
        );
        assert_eq!(
            ep.resolve_models_list_url(),
            "https://registry.acme.com/api/list-models"
        );
    }
    /// INVARIANT: the `/models` fetch URL + auth scheme match the auth mode —
    /// The models list URL is always the user-configured (custom) endpoint's
    /// URL; vendor catalog endpoints were removed with the xAI backend.
    #[test]
    #[serial_test::serial]
    fn models_fetch_endpoint_is_the_custom_endpoint() {
        use crate::agent::config::EndpointsConfig;
        use crate::agent::models::ModelFetchAuth;
        for k in [
            "NOFY_CLI_CHAT_PROXY_BASE_URL",
            "NOFY_API_BASE_URL",
            "NOFY_MODELS_LIST_URL",
        ] {
            unsafe { std::env::remove_var(k) };
        }
        let custom = EndpointsConfig::from_config_value(
            &toml::from_str(
                r#"[endpoints]
                models_base_url = "https://models.acme.com/v1""#,
            )
            .unwrap(),
        );
        assert_eq!(
            super::models_list_url(&custom, ModelFetchAuth::CustomEndpoint),
            "https://models.acme.com/v1/models"
        );
    }
    /// REGRESSION: `nofy setup` must send the deployment key to
    /// the proxy, never the inference endpoint.
    #[test]
    #[serial_test::serial]
    fn deployment_config_url_uses_cli_chat_proxy_when_not_overridden() {
        use crate::agent::config::EndpointsConfig;
        for k in [
            "NOFY_CLI_CHAT_PROXY_BASE_URL",
            "NOFY_MANAGED_CONFIG_URL",
            "NOFY_API_BASE_URL",
        ] {
            unsafe { std::env::remove_var(k) };
        }
        unsafe { std::env::set_var("NOFY_DEPLOYMENT_KEY", "nofy-token-ENTERPRISE") };
        let managed: toml::Value = toml::from_str(
            r#"[endpoints]
            deployment_key = "nofy-token-ENTERPRISE"
            xai_api_base_url = "https://inference.acme-corp.example/nofy/v1""#,
        )
        .unwrap();
        let url = EndpointsConfig::from_config_value(&managed).resolve_managed_config_url();
        assert_eq!(url, "https://cli-chat-proxy.grok.com/v1/deployment/config");
        assert!(
            !url.contains("acme-corp"),
            "deployment key would be sent to the inference host: {url}"
        );
        let pinned: toml::Value = toml::from_str(
            r#"[endpoints]
            xai_api_base_url = "https://inference.acme-corp.example/nofy/v1"
            cli_chat_proxy_base_url = "https://proxy.acme-corp.example/v1""#,
        )
        .unwrap();
        assert_eq!(
            EndpointsConfig::from_config_value(&pinned).resolve_managed_config_url(),
            "https://proxy.acme-corp.example/v1/deployment/config"
        );
        unsafe { std::env::remove_var("NOFY_DEPLOYMENT_KEY") };
    }
}
