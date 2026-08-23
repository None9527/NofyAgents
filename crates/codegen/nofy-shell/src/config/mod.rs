pub mod reloader;
pub mod watcher;
use crate::bundle;
use serde::Deserialize;
pub use nofy_config_types::{
    DEFAULT_RECENCY_DECAY, MemoryDreamConfig, MemoryEmbeddingConfig, MemoryFlushConfig,
    MemoryGcConfig, MemoryIndexConfig, MemoryInitialInjectionConfig, MemorySearchConfig,
    MemorySessionConfig, MemoryWatcherConfig, MmrConfig, PruningConfig, TemporalDecayConfig,
};
/// Full configuration for the memory system.
///
/// Parsed from the `[memory]` section of `~/.nofy/config.toml` or
/// `.nofy/config.toml`. Disabled by default; enabled via
/// `--experimental-memory` CLI flag or `NOFY_MEMORY=1` env var.
/// Force-disabled via `NOFY_MEMORY=0` (overrides TOML).
///
/// All sub-configs are pre-populated with production-ready defaults so that
/// later PRs (indexing, search, flush, pruning) can read them without any
/// config migration.
#[derive(Debug, Clone, Default, PartialEq, Deserialize)]
#[serde(default)]
pub struct MemoryConfig {
    /// Whether memory is enabled for this session.
    pub enabled: bool,
    /// Index / chunking settings.
    pub index: MemoryIndexConfig,
    /// Embedding provider settings.
    pub embedding: MemoryEmbeddingConfig,
    /// Hybrid search scoring settings.
    pub search: MemorySearchConfig,
    /// First-turn memory injection behavior.
    pub initial_injection: MemoryInitialInjectionConfig,
    /// Session lifecycle settings.
    pub session: MemorySessionConfig,
    /// File watcher settings for detecting external memory edits.
    pub watcher: MemoryWatcherConfig,
    /// Garbage collection settings for orphaned workspace directories.
    pub gc: MemoryGcConfig,
    /// autoDream consolidation settings.
    pub dream: MemoryDreamConfig,
    /// Pre-compaction memory flush settings.
    ///
    /// **Note:** Configured under `[compaction.memory_flush]` in config.toml,
    /// not under `[memory]`. Flush is a compaction behavior.
    #[serde(skip)]
    pub flush: MemoryFlushConfig,
    /// Tool-result pruning settings.
    ///
    /// **Note:** Configured under `[compaction.pruning]` in config.toml,
    /// not under `[memory]`. Pruning is a compaction behavior.
    #[serde(skip)]
    pub pruning: PruningConfig,
    /// Per-agent memory root override (e.g. `~/.nofy/agent-memory/<name>/`).
    #[serde(skip)]
    pub root_dir_override: Option<std::path::PathBuf>,
    /// When true, the root is already project-scoped so MemoryStorage should
    /// skip the workspace hash subdirectory (use `new_flat` instead of `new`).
    #[serde(skip)]
    pub flat_memory_root: bool,
}
impl MemoryConfig {
    /// Resolve the final memory config from all sources (in priority order):
    /// 1. CLI flag `--no-memory` (absolute highest — always disables, overrides all)
    /// 2. CLI flag `--experimental-memory` (enables, but overridden by --no-memory)
    /// 3. `NOFY_MEMORY` env var: `1`/`true` enables, `0`/`false` force-disables
    /// 4. Config file `[memory]` / `[compaction]` sections
    pub fn resolve(experimental_memory: bool, no_memory: bool, config: &toml::Value) -> Self {
        let mut result: Self = config
            .get("memory")
            .and_then(|v| v.clone().try_into().ok())
            .unwrap_or_default();
        if let Some(compaction) = config.get("compaction") {
            if let Some(flush) = compaction.get("memory_flush")
                && let Ok(f) = flush.clone().try_into()
            {
                result.flush = f;
            }
            if let Some(pruning) = compaction.get("pruning")
                && let Ok(p) = pruning.clone().try_into()
            {
                result.pruning = p;
            }
        }
        let resolved = crate::agent::config::resolve_enabled(
            if experimental_memory {
                Some(true)
            } else {
                None
            },
            "NOFY_MEMORY",
            result.enabled,
            config.get("memory").is_some(),
            false,
        );
        result.enabled = resolved.value;
        if no_memory {
            result.enabled = false;
        }
        result
    }
}
/// Configuration for subagent (task tool) support.
///
/// Parsed from the `[subagents]` section of `~/.nofy/config.toml` or
/// `.nofy/config.toml`. Enabled by default; can be disabled via
/// `NOFY_SUBAGENTS=0` env var or `[subagents] enabled = false`
/// in config.toml.
#[derive(Debug, Clone, Default, PartialEq, Eq, Deserialize)]
#[serde(default)]
pub struct SubagentsConfig {
    /// Whether subagent support is enabled.
    pub enabled: bool,
    /// Raw `[subagents] max_depth` (i64 so out-of-range parses; clamped ≥1 at resolve).
    #[serde(default)]
    pub max_depth: Option<i64>,
    #[serde(default)]
    pub max_concurrent: Option<i64>,
    /// `"queue"` or `"fail"`.
    #[serde(default)]
    pub limit_behavior: Option<String>,
    #[serde(default)]
    pub workflow_max_concurrent: Option<i64>,
    /// Per-subagent model ID overrides.
    /// Keys are agent names, values are model IDs that must exist in the
    /// available models registry. Parsed from `[subagents.models]` in config.toml.
    ///
    /// ```toml
    /// [subagents.models]
    /// explore = "grok-3-fast"
    /// plan = "grok-3"
    /// ```
    #[serde(default)]
    pub models: std::collections::HashMap<String, String>,
    /// Per-subagent enable/disable toggles.
    /// Keys are agent names, values are booleans.
    /// Omitted agents default to enabled (`true`).
    ///
    /// ```toml
    /// [subagents.toggle]
    /// explore = true
    /// plan = false
    /// ```
    #[serde(default)]
    pub toggle: std::collections::HashMap<String, bool>,
    /// Declarative subagent role definitions.
    ///
    /// ```toml
    /// [subagents.roles.researcher]
    /// description = "Deep research agent"
    /// default_capability_mode = "read-only"
    /// model = "grok-3"
    ///
    /// [subagents.roles.implementer]
    /// description = "Implementation agent with full access"
    /// default_capability_mode = "all"
    /// prompt_file = ".nofy/prompts/implementer.md"
    /// ```
    #[serde(default)]
    pub roles: std::collections::HashMap<String, SubagentRole>,
    /// Named persona/SOUL definitions.
    ///
    /// ```toml
    /// [subagents.personas.researcher]
    /// instructions = "You are a thorough researcher. Always cite sources."
    ///
    /// [subagents.personas.concise]
    /// instructions = "Be extremely concise. No filler words."
    /// instructions_file = ".nofy/personas/concise.md"
    /// ```
    #[serde(default)]
    pub personas: std::collections::HashMap<String, SubagentPersona>,
}
use nofy_subagent_resolution::config::{SubagentPersona, SubagentRole};
impl SubagentsConfig {
    fn discover_personas_in_dir(&mut self, dir: &std::path::Path) {
        if !dir.is_dir() {
            return;
        }
        let entries = match std::fs::read_dir(dir) {
            Ok(e) => e,
            Err(e) => {
                tracing::debug!(error = %e, "Failed to read personas directory");
                return;
            }
        };
        for entry in entries.flatten() {
            let path = entry.path();
            if path.extension().and_then(|e| e.to_str()) != Some("toml") {
                continue;
            }
            let Some(name) = path.file_stem().and_then(|s| s.to_str()).map(String::from) else {
                continue;
            };
            if self.personas.contains_key(&name) {
                continue;
            }
            match std::fs::read_to_string(&path) {
                Ok(content) => match toml::from_str::<SubagentPersona>(&content) {
                    Ok(mut persona) => {
                        persona.source_dir = path.parent().map(|p| p.to_path_buf());
                        persona.source_path = Some(path.display().to_string());
                        tracing::debug!(persona = %name, "Loaded persona from file");
                        self.personas.insert(name, persona);
                    }
                    Err(e) => {
                        tracing::warn!(persona = %name, error = %e, "Failed to parse persona file");
                    }
                },
                Err(e) => {
                    tracing::warn!(error = %e, "Failed to read persona file");
                }
            }
        }
    }
    fn discover_roles_in_dir(&mut self, dir: &std::path::Path) {
        if !dir.is_dir() {
            return;
        }
        let entries = match std::fs::read_dir(dir) {
            Ok(e) => e,
            Err(e) => {
                tracing::debug!(error = %e, "Failed to read roles directory");
                return;
            }
        };
        for entry in entries.flatten() {
            let path = entry.path();
            if path.extension().and_then(|e| e.to_str()) != Some("toml") {
                continue;
            }
            let Some(name) = path.file_stem().and_then(|s| s.to_str()).map(String::from) else {
                continue;
            };
            if self.roles.contains_key(&name) {
                tracing::debug!(role = %name, "Skipping file-based role, higher-priority config takes precedence");
                continue;
            }
            match std::fs::read_to_string(&path) {
                Ok(content) => match toml::from_str::<SubagentRole>(&content) {
                    Ok(mut role) => {
                        role.source_dir = path.parent().map(|p| p.to_path_buf());
                        tracing::debug!(role = %name, "Loaded role from file");
                        self.roles.insert(name, role);
                    }
                    Err(e) => {
                        tracing::warn!(
                            role = %name,
                            path = %path.display(),
                            error = %e,
                            "Failed to parse role file"
                        );
                    }
                },
                Err(e) => {
                    tracing::warn!(
                        path = %path.display(),
                        error = %e,
                        "Failed to read role file"
                    );
                }
            }
        }
    }
    /// Check if a subagent is enabled.
    /// Returns `true` if the agent is not in the toggle map (default enabled).
    pub fn is_subagent_enabled(&self, name: &str) -> bool {
        self.toggle.get(name).copied().unwrap_or(true)
    }
    /// Look up a role by name.
    pub fn get_role(&self, name: &str) -> Option<&SubagentRole> {
        self.roles.get(name)
    }
    /// Look up a persona by name.
    pub fn get_persona(&self, name: &str) -> Option<&SubagentPersona> {
        self.personas.get(name)
    }
    /// Discover personas from `.nofy/personas/` directory.
    ///
    /// File-based personas are loaded from `{cwd}/.nofy/personas/*.toml`.
    /// Each file defines a single `SubagentPersona`. The file stem becomes
    /// the persona name. Inline config takes precedence.
    pub(crate) fn discover_personas(&mut self, cwd: &std::path::Path) {
        let dir = cwd.join(".nofy").join("personas");
        self.discover_personas_in_dir(&dir);
    }
    /// Validate all role definitions. Returns a list of (role_name, error_message)
    /// for invalid entries.
    pub fn validate_roles(&self) -> Vec<(String, String)> {
        let valid_modes = ["read-only", "read-write", "execute", "all"];
        let mut errors = Vec::new();
        for (name, role) in &self.roles {
            if role.description.is_empty() {
                errors.push((name.clone(), "description is required".to_string()));
            }
            if let Some(ref mode) = role.default_capability_mode
                && !valid_modes.contains(&mode.as_str())
            {
                errors.push((
                    name.clone(),
                    format!(
                        "invalid default_capability_mode \"{mode}\", \
                         must be one of: {}",
                        valid_modes.join(", ")
                    ),
                ));
            }
            if let Some(ref pf) = role.prompt_file
                && pf.trim().is_empty()
            {
                errors.push((
                    name.clone(),
                    "prompt_file must not be empty or whitespace".to_string(),
                ));
            }
        }
        errors
    }
    /// Discover roles from `.nofy/roles/` directory and merge with inline config.
    ///
    /// File-based roles are loaded from `{cwd}/.nofy/roles/*.toml`. Each file
    /// defines a single `SubagentRole` (same schema as inline `[subagents.roles.*]`).
    /// The file stem becomes the role name.
    ///
    /// Precedence: inline config roles override file-based roles with the same name.
    pub(crate) fn discover_roles(&mut self, cwd: &std::path::Path) {
        let roles_dir = cwd.join(".nofy").join("roles");
        self.discover_roles_in_dir(&roles_dir);
    }
    pub const ENV_MAX_DEPTH: &'static str = "NOFY_SUBAGENTS_MAX_DEPTH";
    pub const DEFAULT_MAX_DEPTH: u32 = 1;
    /// Clamp to `1..=u32::MAX`. Values below 1 (including 0 / negatives) warn
    /// and become 1 so nesting is never accidentally disabled.
    pub(crate) fn clamp_max_depth(raw: i64, source: &str) -> u32 {
        if raw < i64::from(Self::DEFAULT_MAX_DEPTH) {
            tracing::warn!(
                source,
                value = raw,
                "subagents max_depth < 1; clamping to 1"
            );
            Self::DEFAULT_MAX_DEPTH
        } else if raw > i64::from(u32::MAX) {
            tracing::warn!(
                source,
                value = raw,
                "subagents max_depth exceeds u32::MAX; clamping"
            );
            u32::MAX
        } else {
            raw as u32
        }
    }
    /// Precedence: env > TOML > [`Self::DEFAULT_MAX_DEPTH`].
    ///
    /// Depth 0 is the top-level session; a child is parent+1. Spawn is rejected
    /// when `depth >= max`. So `max = 1` allows only top-level spawns; nested
    /// spawns from a first-level subagent need `max >= 2`.
    pub(crate) fn resolve_max_depth(env: Option<&str>, config: Option<i64>) -> u32 {
        if let Some(raw) = env {
            match raw.trim().parse::<i64>() {
                Ok(v) => return Self::clamp_max_depth(v, "env"),
                Err(_) => {
                    tracing::warn!(
                        value = %raw,
                        "invalid NOFY_SUBAGENTS_MAX_DEPTH (expected integer); ignoring"
                    );
                }
            }
        }
        if let Some(v) = config {
            return Self::clamp_max_depth(v, "config");
        }
        Self::DEFAULT_MAX_DEPTH
    }
    pub const ENV_MAX_CONCURRENT: &'static str = "NOFY_MAX_CONCURRENT_SUBAGENTS";
    pub const ENV_LIMIT_BEHAVIOR: &'static str = "NOFY_SUBAGENT_LIMIT_BEHAVIOR";
    pub const ENV_WORKFLOW_MAX_CONCURRENT: &'static str = "NOFY_WORKFLOW_MAX_CONCURRENT_AGENTS";
    /// Clamp to `1..`; a limit can be adjusted but never disabled.
    fn clamp_count(value: i64, source: &str, name: &str) -> usize {
        if value < 1 {
            tracing::warn!(source, name, value, "subagent limit < 1; clamping to 1");
            1
        } else {
            usize::try_from(value).unwrap_or(usize::MAX)
        }
    }
    /// Precedence: env > TOML > default; invalid layers warn and fall through.
    fn resolve_count(
        env_name: &str,
        env: Option<&str>,
        config: Option<i64>,
        default: usize,
    ) -> usize {
        if let Some(value) = env {
            match nofy_tools::util::env::parse_positive(value.trim()) {
                Some(parsed) => return usize::try_from(parsed).unwrap_or(usize::MAX),
                None => {
                    tracing::warn!(
                        name = env_name,
                        %value,
                        "invalid env value (expected a positive whole number); ignoring"
                    );
                }
            }
        }
        if let Some(v) = config {
            return Self::clamp_count(v, "config", env_name);
        }
        default
    }
    pub(crate) fn resolve_max_concurrent(env: Option<&str>, config: Option<i64>) -> usize {
        Self::resolve_count(
            Self::ENV_MAX_CONCURRENT,
            env,
            config,
            nofy_tools::implementations::nofy_build::task::admission::DEFAULT_MAX_CONCURRENT,
        )
    }
    pub(crate) fn resolve_workflow_max_concurrent(
        env: Option<&str>,
        config: Option<i64>,
    ) -> usize {
        Self::resolve_count(
            Self::ENV_WORKFLOW_MAX_CONCURRENT,
            env,
            config,
            crate::session::workflow::host_service::DEFAULT_WORKFLOW_MAX_CONCURRENT_AGENTS,
        )
    }
    pub(crate) fn resolve_limit_behavior(
        env: Option<&str>,
        config: Option<&str>,
    ) -> nofy_tools::implementations::nofy_build::task::admission::LimitBehavior {
        use nofy_tools::implementations::nofy_build::task::admission::LimitBehavior;
        for (source, value) in [("env", env), ("config", config)] {
            let Some(value) = value else { continue };
            if value.eq_ignore_ascii_case("fail") {
                return LimitBehavior::Fail;
            }
            if value.eq_ignore_ascii_case("queue") {
                return LimitBehavior::Queue;
            }
            tracing::warn!(
                source,
                %value,
                "subagent limit_behavior is neither `queue` nor `fail`; ignoring"
            );
        }
        LimitBehavior::Queue
    }
    /// Resolve the final subagents config from all sources (in priority order):
    /// 1. CLI flag `--subagents` (absolute highest — always enables)
    /// 2. `NOFY_SUBAGENTS` env var: `1`/`true` enables, `0`/`false` force-disables
    /// 3. Config file `[subagents]` section
    /// 4. Default (enabled)
    ///
    /// `enabled` changes only via explicit local intent (CLI flag,
    /// `NOFY_SUBAGENTS`, `[subagents] enabled`).
    ///
    /// Project files are excluded from this trust-independent base; Task
    /// boundaries overlay them using the parent cwd's authoritative trust verdict.
    pub fn resolve(cli_flag: bool, config: &toml::Value) -> Self {
        let user_nofy_root = nofy_config::user_nofy_home();
        Self::resolve_base_with_sources(
            cli_flag,
            config,
            user_nofy_root.as_deref(),
            &bundle::bundled_root(),
        )
    }
    pub(crate) fn resolve_base_with_sources(
        cli_flag: bool,
        config: &toml::Value,
        user_nofy_root: Option<&std::path::Path>,
        bundled_root: &std::path::Path,
    ) -> Self {
        let mut result: Self = config
            .get("subagents")
            .and_then(|v| v.clone().try_into().ok())
            .unwrap_or_default();
        let resolved = crate::agent::config::resolve_enabled(
            if cli_flag { Some(true) } else { None },
            "NOFY_SUBAGENTS",
            result.enabled,
            config.get("subagents").is_some(),
            true,
        );
        result.enabled = resolved.value;
        if let Some(root) = user_nofy_root {
            result.discover_roles_in_dir(&root.join("roles"));
            result.discover_personas_in_dir(&root.join("personas"));
        }
        result.discover_roles_in_dir(&bundled_root.join("roles"));
        result.discover_personas_in_dir(&bundled_root.join("personas"));
        result
    }
    pub(crate) fn effective_definition_maps(
        roles: &std::collections::HashMap<String, SubagentRole>,
        personas: &std::collections::HashMap<String, SubagentPersona>,
        cwd: &std::path::Path,
        project_trusted: bool,
    ) -> (
        std::collections::HashMap<String, SubagentRole>,
        std::collections::HashMap<String, SubagentPersona>,
    ) {
        let mut project = Self::default();
        if project_trusted {
            project.discover_roles(cwd);
            project.discover_personas(cwd);
        }
        for (name, role) in roles {
            if role.source_dir.is_none() || !project.roles.contains_key(name) {
                project.roles.insert(name.clone(), role.clone());
            }
        }
        for (name, persona) in personas {
            if persona.source_path.is_none() || !project.personas.contains_key(name) {
                project.personas.insert(name.clone(), persona.clone());
            }
        }
        (project.roles, project.personas)
    }
}
/// Managed MCP connector fetching config (`[managed_mcps]` in config.toml).
///
/// See [`Self::resolve`] for full priority chain.
#[derive(Debug, Clone, PartialEq, Eq, Deserialize)]
#[serde(default)]
pub struct ManagedMcpsConfig {
    pub enabled: bool,
    pub gateway_tools_enabled: bool,
}
impl Default for ManagedMcpsConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            gateway_tools_enabled: false,
        }
    }
}
impl ManagedMcpsConfig {
    /// Priority: env var > TOML > default (enabled interactive, disabled headless).
    pub fn resolve(config: &toml::Value, is_headless: bool) -> Self {
        let mut result: Self = config
            .get("managed_mcps")
            .and_then(|v| v.clone().try_into().ok())
            .unwrap_or(Self {
                enabled: !is_headless,
                gateway_tools_enabled: false,
            });
        let managed_mcps_table = config.get("managed_mcps").and_then(|v| v.as_table());
        let has_local_enabled = managed_mcps_table.is_some_and(|t| t.contains_key("enabled"));
        let resolved = crate::agent::config::resolve_enabled(
            None,
            "NOFY_MANAGED_MCPS_ENABLED",
            result.enabled,
            has_local_enabled,
            !is_headless,
        );
        result.enabled = resolved.value;
        let has_local_gateway_tools =
            managed_mcps_table.is_some_and(|t| t.contains_key("gateway_tools_enabled"));
        let gateway_resolved = crate::agent::config::resolve_enabled(
            None,
            "NOFY_MANAGED_MCP_GATEWAY_TOOLS_ENABLED",
            result.gateway_tools_enabled,
            has_local_gateway_tools,
            false,
        );
        result.gateway_tools_enabled = result.enabled && gateway_resolved.value;
        result
    }
}
/// Auxiliary model overrides under `[models]`.
#[derive(Debug, Clone, PartialEq, Eq, Deserialize)]
#[serde(default)]
pub(crate) struct ModelOverrideConfig {
    /// `None` = current model.
    pub session_summary: Option<String>,
    /// Compiled default (`nofy-build`) when unset locally and via env.
    pub image_description: Option<String>,
    /// Next-prompt suggestion model pin. Unlike the other overrides this does
    /// NOT fill a compiled default — see [`PromptSuggestModelPin`].
    #[serde(skip)]
    pub prompt_suggestion: PromptSuggestModelPin,
}
impl Default for ModelOverrideConfig {
    fn default() -> Self {
        Self {
            session_summary: None,
            image_description: None,
            prompt_suggestion: PromptSuggestModelPin::Unpinned,
        }
    }
}
/// Resolved model pin for the next-prompt suggestion call (tab-autocomplete
/// ghost text), `env > config.toml` — see [`ModelOverrideConfig::resolve`].
///
/// Unlike the other auxiliary overrides this does not collapse to a plain
/// model string: the consumer (`handle_suggest_prompt`) must distinguish
/// an explicit pin from "unpinned" (where the client hint and the built-in
/// `nofy-build-0.1` default apply), and whether the pin came from the env
/// escape hatch. Every effective model except an env pin is catalog-guarded —
/// when the model is not in the shell's catalog (e.g. `nofy-build-0.1` for
/// OAuth users, whose catalogs exclude it) the per-turn suggestion request is
/// skipped entirely rather than fired doomed. The env pin is deliberately
/// exempt so `NOFY_PROMPT_SUGGESTIONS_MODEL` keeps working for models a
/// catalog does not list (mirrors the pager, which forwards the env value
/// without checking its catalog).
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub enum PromptSuggestModelPin {
    /// `NOFY_PROMPT_SUGGESTIONS_MODEL` — used verbatim, bypasses the
    /// catalog guard.
    Env(String),
    /// `[models] prompt_suggestion` in config.toml — catalog-guarded.
    Pinned(String),
    /// No explicit pin: the client hint, then the built-in default apply
    /// (both catalog-guarded).
    #[default]
    Unpinned,
}
/// Drop whitespace-only auxiliary model overrides (treat like unset).
fn non_empty_model_override(value: Option<&str>) -> Option<String> {
    value.and_then(|v| {
        let trimmed = v.trim();
        if trimmed.is_empty() {
            None
        } else {
            Some(trimmed.to_owned())
        }
    })
}
impl ModelOverrideConfig {
    /// CLI flag > env var > config.toml > compiled default.
    /// `image_description` and `session_summary` always resolve to `Some(_)`
    /// (default `nofy-build`), never the session model.
    /// `prompt_suggestion` resolves to a [`PromptSuggestModelPin`] instead of
    /// a model string (no CLI flag; the default and the catalog guard live at
    /// the consumer, `handle_suggest_prompt`).
    pub(crate) fn resolve(
        cli_session_summary_model: Option<&str>,
        config: &toml::Value,
    ) -> Self {
        let models_table = config.get("models");
        let parsed_models: crate::agent::config::ModelsConfig = models_table
            .and_then(|v| v.clone().try_into().ok())
            .unwrap_or_default();
        let mut result = Self {
            session_summary: non_empty_model_override(parsed_models.session_summary.as_deref()),
            image_description: non_empty_model_override(parsed_models.image_description.as_deref()),
            prompt_suggestion: non_empty_model_override(parsed_models.prompt_suggestion.as_deref())
                .map(PromptSuggestModelPin::Pinned)
                .unwrap_or_default(),
        };
        if let Ok(v) = std::env::var("NOFY_SESSION_SUMMARY_MODEL") {
            result.session_summary = non_empty_model_override(Some(v.as_str()));
        }
        if let Ok(v) = std::env::var("NOFY_IMAGE_DESCRIPTION_MODEL") {
            result.image_description = non_empty_model_override(Some(v.as_str()));
        }
        if let Ok(v) = std::env::var("NOFY_PROMPT_SUGGESTIONS_MODEL")
            && let Some(v) = non_empty_model_override(Some(v.as_str()))
        {
            result.prompt_suggestion = PromptSuggestModelPin::Env(v);
        }
        if let Some(v) = cli_session_summary_model {
            result.session_summary = non_empty_model_override(Some(v));
        }
        if result.session_summary.is_none() {
            result.session_summary =
                Some(crate::models::default_session_summary_model().to_owned());
        }
        if result.image_description.is_none() {
            result.image_description =
                Some(crate::models::default_image_description_model().to_owned());
        }
        result
    }
}
/// Tool behavior configuration (`[tools]` in config.toml).
///
/// Controls cross-cutting tool behavior such as `.gitignore` filtering.
///
/// ```toml
/// [tools]
/// disable_zdr_incompatible_tools = true
/// # [tools.zdr_video_output_s3] — see ZdrVideoOutputS3Config
/// ```
#[derive(Debug, Clone, Default, PartialEq, Eq, Deserialize)]
#[serde(default)]
pub struct ToolsConfig {
    /// When `true`, all tools (including `read_file`) filter gitignored
    /// files. When `false` (default), each tool picks its own default.
    pub respect_gitignore: bool,
}
impl ToolsConfig {
    /// Resolve the final tools config, in priority order:
    /// 1. Env var `NOFY_RESPECT_GITIGNORE` (`0`/`false` off, `1`/`true` on).
    /// 2. `[tools]` block from the merged effective config.
    /// 3. Default (`false`).
    pub fn resolve(config: &toml::Value) -> Self {
        let tools = config.get("tools");
        let mut result = Self {
            respect_gitignore: tools
                .and_then(|t| t.get("respect_gitignore"))
                .and_then(|v| v.as_bool())
                .unwrap_or(false),
        };
        match std::env::var("NOFY_RESPECT_GITIGNORE").as_deref() {
            Ok("0") | Ok("false") => {
                result.respect_gitignore = false;
            }
            Ok("1") | Ok("true") => {
                result.respect_gitignore = true;
            }
            _ => {}
        }
        result
    }
}
/// Storage mode for session persistence.
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq)]
pub enum StorageMode {
    /// Local JSONL only (default)
    #[default]
    Local,
    /// Local + HTTP flush at end of turn
    Writeback,
}
impl StorageMode {
    /// Resolve from all sources: CLI > env var > default (Local).
    pub fn resolve(cli_override: Option<&str>) -> Self {
        if let Some(mode) = cli_override {
            match mode {
                "writeback" => return Self::Writeback,
                "local" => return Self::Local,
                other => {
                    tracing::warn!(mode = other, "unknown --storage-mode value, ignoring");
                }
            }
        }
        match std::env::var("NOFY_STORAGE_MODE").as_deref() {
            Ok("writeback") => return Self::Writeback,
            Ok("local") => return Self::Local,
            _ => {}
        }
        Self::Local
    }
    /// Env-only resolve enforcing the rule that `Writeback` requires nofy.com
    /// auth (it syncs to nofy-code-backend). This is the single home for that
    /// gate, used at boot ([`crate::agent::init`]).
    pub(crate) fn resolve_env_gated(has_xai_auth: bool) -> Self {
        match Self::resolve(None) {
            Self::Writeback if !has_xai_auth => Self::Local,
            mode => mode,
        }
    }
}
pub use nofy_config::ConfigLayers;
pub use nofy_config::{
    MDM_REQUIREMENTS_SOURCE, RequirementsLayer, RequirementsSource, ServingIdentity, SyncMarker,
    claude_managed_settings_probe_path, confirmed_team_switch, confirmed_team_switch_at,
    is_managed_config_hard_stale_for, is_managed_config_stale_for, load_config_file,
    load_from_disk, load_managed_config, load_merged_requirements, load_system_managed_config,
    load_toml_file, managed_config_identity_changed_at, managed_deployment_id,
    managed_policy_compromised_for, mark_managed_config_synced, mark_managed_config_synced_at,
    normalize_identity, requirements_layers, system_config_dir, user_nofy_home,
};
/// Map of "dotted.path" to which config file the value came from.
pub(crate) fn config_origins(
    layers: &ConfigLayers,
) -> std::collections::HashMap<String, crate::agent::config::ConfigSource> {
    use crate::agent::config::ConfigSource;
    let mut origins = std::collections::HashMap::new();
    if layers.has_system_managed() {
        walk_toml(
            &layers.system_managed,
            &mut vec![],
            ConfigSource::SystemManagedConfig,
            &mut origins,
        );
    }
    if layers.has_managed() {
        walk_toml(
            &layers.managed,
            &mut vec![],
            ConfigSource::ManagedConfig,
            &mut origins,
        );
    }
    walk_toml(
        &layers.user,
        &mut vec![],
        ConfigSource::UserConfig,
        &mut origins,
    );
    origins
}
fn walk_toml(
    value: &toml::Value,
    path: &mut Vec<String>,
    source: crate::agent::config::ConfigSource,
    origins: &mut std::collections::HashMap<String, crate::agent::config::ConfigSource>,
) {
    match value {
        toml::Value::Table(table) => {
            for (k, v) in table {
                path.push(k.clone());
                walk_toml(v, path, source, origins);
                path.pop();
            }
        }
        _ => {
            origins.insert(path.join("."), source);
        }
    }
}
/// The `[skills]` table from an effective config, shared by the reload
/// dispatch and `nofy inspect`.
pub(crate) use crate::config::reloader::parse_skills_config;
/// Effective config: layers + campaign overlay (`NOFY_CAMPAIGNS_OVERRIDE`).
pub use crate::util::config::load_effective_config;
/// Effective config with disk campaigns only — for one-shot entrypoints where
/// `NOFY_CAMPAIGNS_OVERRIDE` must not apply.
pub use crate::util::config::load_effective_config_disk_only;
/// Where a requirement or permission rule was loaded from.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum RequirementSource {
    Unknown,
    Requirements { path: std::path::PathBuf },
    ManagedSettings { path: std::path::PathBuf },
    Config { path: std::path::PathBuf },
    Settings { path: std::path::PathBuf },
}
impl RequirementSource {
    pub fn path(&self) -> Option<&std::path::Path> {
        match self {
            Self::Unknown => None,
            Self::Requirements { path }
            | Self::ManagedSettings { path }
            | Self::Config { path }
            | Self::Settings { path } => Some(path),
        }
    }
}
impl std::fmt::Display for RequirementSource {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Unknown => f.write_str("<unknown>"),
            Self::Requirements { path } => write!(f, "{} (requirements)", path.display()),
            Self::ManagedSettings { path } => {
                write!(f, "{} (managed-settings)", path.display())
            }
            Self::Config { path } => write!(f, "{} (config)", path.display()),
            Self::Settings { path } => write!(f, "{} (settings)", path.display()),
        }
    }
}
/// A value paired with the source it came from.
#[derive(Debug, Clone)]
pub struct Sourced<T> {
    pub value: T,
    pub source: RequirementSource,
}
/// A config field clamped by requirements.
#[derive(Debug, Clone)]
pub(crate) struct EnforcedField {
    pub path: &'static str,
    pub value: String,
    pub source: RequirementSource,
}
impl std::fmt::Display for EnforcedField {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{} = {} ({})", self.path, self.value, self.source)
    }
}
/// Apply overrides from external `managed-settings.json`.
/// Called before `apply_requirements()` so requirements.toml can override.
pub(crate) fn apply_managed_settings_features(
    config: &mut crate::agent::config::Config,
) -> Vec<EnforcedField> {
    let ms = nofy_workspace::permission::resolution::managed_settings();
    apply_managed_settings_features_inner(config, &ms.features)
}
fn apply_managed_settings_features_inner(
    config: &mut crate::agent::config::Config,
    features: &nofy_workspace::permission::resolution::ManagedSettingsFeatures,
) -> Vec<EnforcedField> {
    let Some(ref path) = features.source_path else {
        return Vec::new();
    };
    let source = RequirementSource::ManagedSettings { path: path.clone() };
    let mut enforced: Vec<EnforcedField> = Vec::new();
    if features.disable_telemetry == Some(true) {
        config.features.telemetry = Some(crate::agent::config::TelemetryMode::Disabled);
        enforced.push(EnforcedField {
            path: "features.telemetry",
            value: "false (DISABLE_TELEMETRY)".to_string(),
            source: source.clone(),
        });
    }
    enforced
}
/// Clamp `AgentConfig` fields per `requirements.toml`. No-op if absent.
/// System pins win over user pins on conflict.
pub(crate) fn apply_requirements(config: &mut crate::agent::config::Config) -> Vec<EnforcedField> {
    requirements_layers()
        .into_iter()
        .flat_map(|layer| {
            apply_requirements_inner(
                config,
                &layer.value,
                &RequirementSource::Requirements {
                    path: std::path::PathBuf::from(layer.source.label().as_ref()),
                },
            )
        })
        .collect()
}
fn apply_requirements_inner(
    config: &mut crate::agent::config::Config,
    req: &toml::Value,
    source: &RequirementSource,
) -> Vec<EnforcedField> {
    fn req_bool(req: &toml::Value, section: &str, key: &str) -> Option<bool> {
        req.get(section)?.get(key)?.as_bool()
    }
    fn req_str<'a>(req: &'a toml::Value, section: &str, key: &str) -> Option<&'a str> {
        req.get(section)?.get(key)?.as_str()
    }
    let mut enforced: Vec<EnforcedField> = Vec::new();
    let mut push = |path: &'static str, value: String| {
        enforced.push(EnforcedField {
            path,
            value,
            source: source.clone(),
        });
    };
    macro_rules! pin_feature {
        ($name:ident) => {
            if let Some(val) = req_bool(req, "features", stringify!($name)) {
                config.requirements.$name.pin(val, source.clone());
                if config.features.$name != Some(val) {
                    config.features.$name = Some(val);
                    push(concat!("features.", stringify!($name)), format!("{val}"));
                }
            }
        };
    }
    macro_rules! enforce_opt {
        ($section:expr, $key:expr, $field:expr) => {
            if let Some(val) = req_bool(req, $section, $key)
                && $field != Some(val)
            {
                $field = Some(val);
                push(concat!($section, ".", $key), format!("{val}"));
            }
        };
    }
    macro_rules! enforce_val {
        ($section:expr, $key:expr, $field:expr) => {
            if let Some(val) = req_bool(req, $section, $key)
                && $field != val
            {
                $field = val;
                push(concat!($section, ".", $key), format!("{val}"));
            }
        };
    }
    use crate::agent::config::TelemetryMode;
    let req_telemetry_mode = req_str(req, "features", "telemetry")
        .and_then(TelemetryMode::parse)
        .or_else(|| req_bool(req, "features", "telemetry").map(TelemetryMode::from));
    if let Some(mode) = req_telemetry_mode {
        config.requirements.telemetry.pin(mode, source.clone());
        if config.features.telemetry != Some(mode) {
            config.features.telemetry = Some(mode);
            push("features.telemetry", format!("{mode}"));
        }
    }
    pin_feature!(lsp_tools);
    pin_feature!(web_fetch);
    pin_feature!(ask_user_question);
    pin_feature!(write_file);
    enforce_opt!("cli", "use_leader", config.cli.use_leader);
    enforce_opt!("cli", "show_tips", config.cli.show_tips);
    enforce_val!("memory", "enabled", config.memory.enabled);
    enforce_val!("subagents", "enabled", config.subagents.enabled);
    enforce_val!("managed_mcps", "enabled", config.managed_mcps.enabled);
    if let Some(val) = req_bool(req, "tools", "respect_gitignore") {
        config
            .requirements
            .respect_gitignore
            .pin(val, source.clone());
        push("tools.respect_gitignore", format!("{val}"));
    }
    if let Some(val) = req_bool(req, "ui", "yolo") {
        if config.ui.yolo != val {
            config.ui.yolo = val;
            push("ui.yolo", format!("{val}"));
        }
        if !val && config.default_yolo_mode {
            config.default_yolo_mode = false;
            push("ui.yolo", "--yolo blocked".to_string());
        }
    }
    macro_rules! enforce_str {
        ($section:expr, $key:expr, $field:expr) => {
            if let Some(val) = req_str(req, $section, $key)
                && $field.as_deref() != Some(val)
            {
                $field = Some(val.to_owned());
                push(concat!($section, ".", $key), val.to_owned());
            }
        };
        ($section:expr, $key:expr, $field:expr, redacted) => {
            if let Some(val) = req_str(req, $section, $key)
                && $field.as_deref() != Some(val)
            {
                $field = Some(val.to_owned());
                push(concat!($section, ".", $key), "[redacted]".to_owned());
            }
        };
    }
    enforce_str!("models", "default", config.models.default);
    if let Some(val) = req_str(req, "endpoints", "xai_api_base_url")
        && config.endpoints.xai_api_base_url != val
    {
        config.endpoints.xai_api_base_url = val.to_owned();
        push("endpoints.xai_api_base_url", val.to_owned());
    }
    if let Some(val) = req_str(req, "endpoints", "cli_chat_proxy_base_url")
        && config.endpoints.cli_chat_proxy_base_url.as_deref() != Some(val)
    {
        config.endpoints.cli_chat_proxy_base_url = Some(val.to_owned());
        push("endpoints.cli_chat_proxy_base_url", val.to_owned());
    }
    enforce_str!(
        "endpoints",
        "models_base_url",
        config.endpoints.models_base_url
    );
    enforce_str!(
        "endpoints",
        "models_list_url",
        config.endpoints.models_list_url
    );
    if let Some(val) = req_str(req, "sandbox", "profile") {
        config
            .requirements
            .sandbox_profile
            .pin(val.to_owned(), source.clone());
        if config.sandbox.profile.as_deref() != Some(val) {
            config.sandbox.profile = Some(val.to_owned());
            push("sandbox.profile", val.to_owned());
        }
    }
    if let Some(val) = req_bool(req, "sandbox", "auto_allow_bash") {
        config
            .requirements
            .sandbox_auto_allow_bash
            .pin(val, source.clone());
        if config.sandbox.auto_allow_bash != Some(val) {
            config.sandbox.auto_allow_bash = Some(val);
            push("sandbox.auto_allow_bash", format!("{val}"));
        }
    }
    enforce_str!(
        "endpoints",
        "deployment_key",
        config.endpoints.deployment_key,
        redacted
    );
    enforce_str!("telemetry", "events_url", config.telemetry.events_url);
    enforce_str!(
        "telemetry",
        "events_api_key",
        config.telemetry.events_api_key,
        redacted
    );

    if let Some(val) = req.get("features").and_then(|f| f.get("codebase_indexing")) {
        use crate::agent::config::CodebaseIndexingSetting;
        match val {
            toml::Value::Boolean(b) => {
                config.features.codebase_indexing = CodebaseIndexingSetting::Enabled(*b);
                push("features.codebase_indexing", format!("{b}"));
            }
            toml::Value::Array(_) => {
                if let Ok(patterns) = val.clone().try_into::<Vec<String>>() {
                    push("features.codebase_indexing", format!("{patterns:?}"));
                    config.features.codebase_indexing = CodebaseIndexingSetting::Patterns(patterns);
                }
            }
            _ => {}
        }
    }
    if !enforced.is_empty() {
        tracing::info!(
            enforced = ?enforced.iter().map(|e| e.to_string()).collect::<Vec<_>>(),
            "deployment requirements enforced"
        );
    }
    enforced
}
/// Resolve sandbox profile and apply OS-level enforcement. Called once at startup.
///
/// `cli_profile` is the resumed/forced base profile (a resumed session's saved
/// profile, or an explicit `--sandbox`); it wins over a fresh env/config read.
pub fn apply_sandbox(
    sandbox_config: Option<&crate::agent::config::SandboxSettingsConfig>,
    cli_profile: Option<&str>,
    cwd: Option<&std::path::Path>,
) {
    let owned;
    let config = match sandbox_config {
        Some(c) => c,
        None => {
            owned = crate::agent::config::SandboxSettingsConfig::from_effective_config();
            &owned
        }
    };
    let req = load_merged_requirements();
    let profile_req = req
        .as_ref()
        .and_then(|v| v.get("sandbox")?.get("profile")?.as_str());
    let auto_allow_req = req
        .as_ref()
        .and_then(|v| v.get("sandbox")?.get("auto_allow_bash")?.as_bool());
    let resolved = config.resolve_profile(cli_profile, profile_req);
    nofy_sandbox::set_auto_allow_bash(config.resolve_auto_allow_bash(auto_allow_req).value);
    let sandbox_profile: nofy_sandbox::ProfileName =
        resolved.value.parse().unwrap_or_else(|e| {
            eprintln!("warning: {e}, defaulting to no sandbox");
            nofy_sandbox::ProfileName::Off
        });
    nofy_sandbox::set_configured_profile(&resolved.value);
    let workspace = cwd
        .and_then(|p| dunce::canonicalize(p).ok())
        .or_else(|| std::env::current_dir().ok())
        .unwrap_or_else(|| std::path::PathBuf::from("."));
    #[cfg(target_os = "linux")]
    let requires_read_deny = nofy_sandbox::requires_read_deny(&sandbox_profile, &workspace);
    #[cfg(target_os = "linux")]
    let requires_hook_write_deny =
        nofy_sandbox::requires_hook_write_deny(&sandbox_profile, &workspace);
    #[cfg(target_os = "linux")]
    let requires_bwrap = requires_read_deny || requires_hook_write_deny;
    #[cfg(target_os = "linux")]
    {
        let refuse_unprotected = |cause: &str| {
            eprintln!(
                "error: this sandbox could not enforce its deny list on Linux: \
                 {cause} Refusing to start with denied paths unprotected."
            );
        };
        match nofy_sandbox::bwrap_reexec_for_profile(&sandbox_profile, &workspace) {
            Some(mut cmd) => {
                use std::os::unix::process::CommandExt;
                let err = cmd.exec();
                if requires_bwrap {
                    refuse_unprotected(&format!(
                        "bwrap exec failed: {err}. Install bubblewrap with \
                         `apt install -y bubblewrap`."
                    ));
                    std::process::exit(1);
                }
                eprintln!(
                    "WARNING: bwrap exec failed: {err}. \
                     Falling back to Landlock sandbox. \
                     Install bubblewrap: apt install -y bubblewrap"
                );
            }
            None if requires_bwrap && nofy_sandbox::is_inside_bwrap() => {
                if requires_hook_write_deny
                    && let Err(e) = nofy_sandbox::verify_hook_write_deny_enforced()
                {
                    eprintln!(
                        "error: sandbox reports bwrap but required hook write-deny \
                         mounts are missing or writable ({e}); refusing to start \
                         (possible __NOFY_INSIDE_BWRAP spoof)"
                    );
                    std::process::exit(1);
                }
            }
            None if requires_bwrap => {
                refuse_unprotected(
                    "the deny list could not be prepared; see the error above \
                     for the specific cause.",
                );
                std::process::exit(1);
            }
            None => {}
        }
    }
    if sandbox_profile != nofy_sandbox::ProfileName::Off {
        #[cfg(any(target_os = "linux", target_os = "macos"))]
        let requires_protection = {
            let is_custom = matches!(sandbox_profile, nofy_sandbox::ProfileName::Custom(_));
            let needs_hooks =
                nofy_sandbox::requires_hook_write_deny(&sandbox_profile, &workspace);
            is_custom || needs_hooks
        };
        let mut sandbox = nofy_sandbox::SandboxManager::new(sandbox_profile, &workspace);
        if let Err(e) = sandbox.apply(&workspace) {
            eprintln!("warning: sandbox could not be applied: {e}");
        }
        #[cfg(any(target_os = "linux", target_os = "macos"))]
        {
            #[cfg(target_os = "macos")]
            let unappliable = requires_protection && !sandbox.is_applied();
            #[cfg(target_os = "linux")]
            let unappliable = requires_protection
                && !sandbox.is_applied()
                && !nofy_sandbox::is_inside_bwrap();
            if unappliable {
                eprintln!(
                    "error: could not apply the '{}' sandbox profile; see the \
                     warning above for the cause. Refusing to start with its \
                     protections missing.",
                    sandbox.profile()
                );
                std::process::exit(1);
            }
            #[cfg(target_os = "linux")]
            if requires_hook_write_deny
                && nofy_sandbox::is_inside_bwrap()
                && let Err(e) = nofy_sandbox::verify_hook_write_deny_enforced()
            {
                eprintln!(
                    "error: required hook write-deny mounts not verified after apply ({e}); \
                     refusing to start"
                );
                std::process::exit(1);
            }
        }
        sandbox.install();
    }
}
pub use nofy_workspace::project_config::find_project_configs;
/// Resolve the effective `[plugins]` config for a working directory the same
/// way a session does at reload time: global/user config
/// ([`load_effective_config`]) plus every ancestor project `.nofy/config.toml`
/// ([`find_project_configs`], extending `paths` and `disabled`) plus the
/// imported `enabledPlugins` merge.
///
/// Shared by `reload_plugins_impl`, `nofy/commands/list`, and the agent's
/// eager plugin-registry fan-out so all three discover the same plugins for a
/// given cwd. Centralizing it prevents the paths/disabled/discovered-command
/// drift those callers would otherwise accumulate.
pub(crate) fn resolve_effective_plugins_config(
    cwd: &std::path::Path,
) -> crate::agent::config::PluginsConfig {
    let extract = |toml_val: &toml::Value| -> Option<crate::agent::config::PluginsConfig> {
        toml_val
            .get("plugins")
            .and_then(|v| v.clone().try_into().ok())
    };
    let mut plugins_cfg = load_effective_config()
        .ok()
        .and_then(|t| extract(&t))
        .unwrap_or_default();
    let project_trusted = crate::agent::folder_trust::project_scope_allowed(cwd);
    for config_path in find_project_configs(cwd) {
        if let Ok(toml_val) = load_config_file(&config_path)
            && let Some(proj) = extract(&toml_val)
        {
            if project_trusted {
                plugins_cfg.paths.extend(proj.paths);
            }
            plugins_cfg.disabled.extend(proj.disabled);
        }
    }
    plugins_cfg.merge_claude_enabled_plugins(Some(cwd));
    plugins_cfg
}
pub use nofy_config::{deep_merge_toml, expand_env_vars_in_string, expand_env_vars_in_toml};
/// Add a plugin path to `[plugins].paths` in `~/.nofy/config.toml`.
///
/// Creates the `[plugins]` section and `paths` array if they don't exist.
/// Deduplicates: if the path is already present, this is a no-op.
pub(crate) fn add_plugin_path(path: &str) -> Result<(), Box<dyn std::error::Error>> {
    let config_path = crate::util::nofy_home::nofy_home().join("config.toml");
    let content = std::fs::read_to_string(&config_path).unwrap_or_default();
    let mut config: toml::Value = if content.is_empty() {
        toml::Value::Table(toml::map::Map::new())
    } else {
        toml::from_str(&content).map_err(|e| format!("failed to parse config.toml: {e}"))?
    };
    let table = config
        .as_table_mut()
        .ok_or("config.toml root is not a table")?;
    if !table.contains_key("plugins") {
        table.insert(
            "plugins".to_string(),
            toml::Value::Table(toml::map::Map::new()),
        );
    }
    let plugins = table
        .get_mut("plugins")
        .and_then(|v| v.as_table_mut())
        .ok_or("[plugins] is not a table")?;
    if !plugins.contains_key("paths") {
        plugins.insert("paths".to_string(), toml::Value::Array(vec![]));
    }
    let paths = plugins
        .get_mut("paths")
        .and_then(|v| v.as_array_mut())
        .ok_or("[plugins].paths is not an array")?;
    let already_present = paths.iter().any(|v| v.as_str().is_some_and(|s| s == path));
    if !already_present {
        paths.push(toml::Value::String(path.to_string()));
    }
    if let Some(parent) = config_path.parent() {
        std::fs::create_dir_all(parent)?;
    }
    std::fs::write(&config_path, toml::to_string_pretty(&config)?)?;
    Ok(())
}
/// Remove a plugin path from `[plugins].paths` in `~/.nofy/config.toml`.
///
/// If the path is not found, this is a no-op (returns Ok).
pub(crate) fn remove_plugin_path(path: &str) -> Result<(), Box<dyn std::error::Error>> {
    let config_path = crate::util::nofy_home::nofy_home().join("config.toml");
    let content = match std::fs::read_to_string(&config_path) {
        Ok(c) => c,
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => return Ok(()),
        Err(e) => return Err(e.into()),
    };
    let mut config: toml::Value =
        toml::from_str(&content).map_err(|e| format!("failed to parse config.toml: {e}"))?;
    if let Some(plugins) = config
        .as_table_mut()
        .and_then(|t| t.get_mut("plugins"))
        .and_then(|v| v.as_table_mut())
        && let Some(paths) = plugins.get_mut("paths").and_then(|v| v.as_array_mut())
    {
        paths.retain(|v| v.as_str().is_none_or(|s| s != path));
    }
    std::fs::write(&config_path, toml::to_string_pretty(&config)?)?;
    Ok(())
}
/// Add a plugin to `[plugins].disabled` in `~/.nofy/config.toml`.
///
/// Creates the `[plugins]` section and `disabled` array if they don't exist.
/// Deduplicates: if already present, this is a no-op.
pub fn add_disabled_plugin(plugin_id: &str) -> Result<(), Box<dyn std::error::Error>> {
    let config_path = crate::util::nofy_home::nofy_home().join("config.toml");
    let content = std::fs::read_to_string(&config_path).unwrap_or_default();
    let mut config: toml::Value = if content.is_empty() {
        toml::Value::Table(toml::map::Map::new())
    } else {
        toml::from_str(&content).map_err(|e| format!("failed to parse config.toml: {e}"))?
    };
    let table = config
        .as_table_mut()
        .ok_or("config.toml root is not a table")?;
    if !table.contains_key("plugins") {
        table.insert(
            "plugins".to_string(),
            toml::Value::Table(toml::map::Map::new()),
        );
    }
    let plugins = table
        .get_mut("plugins")
        .and_then(|v| v.as_table_mut())
        .ok_or("[plugins] is not a table")?;
    if !plugins.contains_key("disabled") {
        plugins.insert("disabled".to_string(), toml::Value::Array(vec![]));
    }
    let disabled = plugins
        .get_mut("disabled")
        .and_then(|v| v.as_array_mut())
        .ok_or("[plugins].disabled is not an array")?;
    let already = disabled
        .iter()
        .any(|v| v.as_str().is_some_and(|s| s == plugin_id));
    if !already {
        disabled.push(toml::Value::String(plugin_id.to_string()));
    }
    if let Some(parent) = config_path.parent() {
        std::fs::create_dir_all(parent)?;
    }
    std::fs::write(&config_path, toml::to_string_pretty(&config)?)?;
    Ok(())
}
/// Remove a plugin from `[plugins].disabled` in `~/.nofy/config.toml`.
///
/// If the plugin is not in the disabled list, this is a no-op.
pub fn remove_disabled_plugin(plugin_id: &str) -> Result<(), Box<dyn std::error::Error>> {
    let config_path = crate::util::nofy_home::nofy_home().join("config.toml");
    let content = match std::fs::read_to_string(&config_path) {
        Ok(c) => c,
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => return Ok(()),
        Err(e) => return Err(e.into()),
    };
    let mut config: toml::Value =
        toml::from_str(&content).map_err(|e| format!("failed to parse config.toml: {e}"))?;
    if let Some(plugins) = config
        .as_table_mut()
        .and_then(|t| t.get_mut("plugins"))
        .and_then(|v| v.as_table_mut())
        && let Some(disabled) = plugins.get_mut("disabled").and_then(|v| v.as_array_mut())
    {
        disabled.retain(|v| v.as_str().is_none_or(|s| s != plugin_id));
    }
    std::fs::write(&config_path, toml::to_string_pretty(&config)?)?;
    Ok(())
}
/// Add a plugin to `[plugin_cta].dismissed` in `~/.nofy/config.toml`.
///
/// Creates the `[plugin_cta]` section and `dismissed` array if they don't exist.
/// Deduplicates: if already present, this is a no-op.
pub fn add_dismissed_plugin_cta(plugin_id: &str) -> Result<(), Box<dyn std::error::Error>> {
    let config_path = crate::util::nofy_home::nofy_home().join("config.toml");
    add_dismissed_plugin_cta_to_file(plugin_id, &config_path)
}
/// Add a dismissed plugin CTA to a specific config file (path-parameterized for tests).
#[doc(hidden)]
pub fn add_dismissed_plugin_cta_to_file(
    plugin_id: &str,
    config_path: &std::path::Path,
) -> Result<(), Box<dyn std::error::Error>> {
    let content = std::fs::read_to_string(config_path).unwrap_or_default();
    let mut config: toml::Value = if content.is_empty() {
        toml::Value::Table(toml::map::Map::new())
    } else {
        toml::from_str(&content).map_err(|e| format!("failed to parse config.toml: {e}"))?
    };
    let table = config
        .as_table_mut()
        .ok_or("config.toml root is not a table")?;
    if !table.contains_key("plugin_cta") {
        table.insert(
            "plugin_cta".to_string(),
            toml::Value::Table(toml::map::Map::new()),
        );
    }
    let plugin_cta = table
        .get_mut("plugin_cta")
        .and_then(|v| v.as_table_mut())
        .ok_or("[plugin_cta] is not a table")?;
    if !plugin_cta.contains_key("dismissed") {
        plugin_cta.insert("dismissed".to_string(), toml::Value::Array(vec![]));
    }
    let dismissed = plugin_cta
        .get_mut("dismissed")
        .and_then(|v| v.as_array_mut())
        .ok_or("[plugin_cta].dismissed is not an array")?;
    let already = dismissed
        .iter()
        .any(|v| v.as_str().is_some_and(|s| s == plugin_id));
    if !already {
        dismissed.push(toml::Value::String(plugin_id.to_string()));
    }
    if let Some(parent) = config_path.parent() {
        std::fs::create_dir_all(parent)?;
    }
    std::fs::write(config_path, toml::to_string_pretty(&config)?)?;
    Ok(())
}
/// All plugin ids listed in `[plugin_cta].dismissed` in `~/.nofy/config.toml`.
///
/// Read once (e.g. on catalog load) and cached so the matched-debounce recompute
/// doesn't parse the config from disk on the UI thread.
pub fn dismissed_plugin_ctas() -> std::collections::HashSet<String> {
    let config_path = crate::util::nofy_home::nofy_home().join("config.toml");
    dismissed_plugin_ctas_in_file(&config_path)
}
/// Read the dismissed plugin CTA set from a specific config file (for tests).
#[doc(hidden)]
pub fn dismissed_plugin_ctas_in_file(
    config_path: &std::path::Path,
) -> std::collections::HashSet<String> {
    let Ok(content) = std::fs::read_to_string(config_path) else {
        return std::collections::HashSet::new();
    };
    let Ok(config) = toml::from_str::<toml::Value>(&content) else {
        return std::collections::HashSet::new();
    };
    config
        .as_table()
        .and_then(|t| t.get("plugin_cta"))
        .and_then(|v| v.as_table())
        .and_then(|t| t.get("dismissed"))
        .and_then(|v| v.as_array())
        .map(|arr| {
            arr.iter()
                .filter_map(|v| v.as_str().map(str::to_string))
                .collect()
        })
        .unwrap_or_default()
}
/// Validate that a hook path is safe to add to `~/.nofy/hooks-paths`.
///
/// CWE-427: Only paths under `~/.nofy/` are allowed to prevent
/// arbitrary hook path injection that bypasses the project trust gate.
/// Paths are canonicalized (resolving symlinks and `..`) before checking.
pub(crate) fn validate_hooks_path(path: &str) -> Result<(), Box<dyn std::error::Error>> {
    let candidate = std::path::Path::new(path);
    if !candidate.is_absolute() {
        return Err("Hook path must be absolute.".into());
    }
    let nofy_home = crate::util::nofy_home::nofy_home();
    let canonical = dunce::canonicalize(candidate)
        .or_else(|_| {
            let mut base = candidate.to_path_buf();
            let mut tail = Vec::new();
            while !base.exists() {
                if let Some(file_name) = base.file_name() {
                    tail.push(file_name.to_os_string());
                    base.pop();
                } else {
                    break;
                }
            }
            let mut resolved = dunce::canonicalize(&base)?;
            for component in tail.into_iter().rev() {
                resolved.push(component);
            }
            Ok(resolved)
        })
        .map_err(|e: std::io::Error| format!("Cannot resolve hook path: {e}"))?;
    let canonical_home = dunce::canonicalize(&nofy_home).unwrap_or_else(|_| nofy_home.clone());
    if !canonical.starts_with(&canonical_home) {
        return Err(format!(
            "Hook path must be under ~/.nofy/ ({}). Got: {}",
            canonical_home.display(),
            canonical.display()
        )
        .into());
    }
    Ok(())
}
/// Post-install steps for a newly installed plugin repo.
///
/// Auto-enables all plugins in the repo so they are active after the next reload.
/// Returns `(plugin_names, warnings)` for status messaging.
pub(crate) fn post_install_plugin(repo_key: &str) -> (Vec<String>, Vec<String>) {
    let registry = nofy_agent::plugins::InstallRegistry::load();
    let Some(repo) = registry.get_repo(repo_key) else {
        return (
            vec![],
            vec![format!("repo not found in registry: {repo_key}")],
        );
    };
    let names: Vec<String> = repo.plugins.keys().cloned().collect();
    let mut warnings = Vec::new();
    for name in &names {
        if let Err(e) = add_enabled_plugin(name) {
            warnings.push(format!("auto-enable {name}: {e}"));
        }
    }
    (names, warnings)
}
/// Add a plugin to `[plugins].enabled` in `~/.nofy/config.toml`.
///
/// Used for project-scope plugins that are disabled by default.
/// Deduplicates: if already present, this is a no-op.
pub fn add_enabled_plugin(plugin_id: &str) -> Result<(), Box<dyn std::error::Error>> {
    let config_path = crate::util::nofy_home::nofy_home().join("config.toml");
    let content = std::fs::read_to_string(&config_path).unwrap_or_default();
    let mut config: toml::Value = if content.is_empty() {
        toml::Value::Table(toml::map::Map::new())
    } else {
        toml::from_str(&content).map_err(|e| format!("failed to parse config.toml: {e}"))?
    };
    let table = config
        .as_table_mut()
        .ok_or("config.toml root is not a table")?;
    if !table.contains_key("plugins") {
        table.insert(
            "plugins".to_string(),
            toml::Value::Table(toml::map::Map::new()),
        );
    }
    let plugins = table
        .get_mut("plugins")
        .and_then(|v| v.as_table_mut())
        .ok_or("[plugins] is not a table")?;
    if !plugins.contains_key("enabled") {
        plugins.insert("enabled".to_string(), toml::Value::Array(Vec::new()));
    }
    let enabled = plugins
        .get_mut("enabled")
        .and_then(|v| v.as_array_mut())
        .ok_or("[plugins].enabled is not an array")?;
    let already = enabled
        .iter()
        .any(|v| v.as_str().is_some_and(|s| s == plugin_id));
    if !already {
        enabled.push(toml::Value::String(plugin_id.to_string()));
    }
    if let Some(parent) = config_path.parent() {
        std::fs::create_dir_all(parent)?;
    }
    std::fs::write(&config_path, toml::to_string_pretty(&config)?)?;
    Ok(())
}
/// Remove a plugin from `[plugins].enabled` in `~/.nofy/config.toml`.
pub fn remove_enabled_plugin(plugin_id: &str) -> Result<(), Box<dyn std::error::Error>> {
    let config_path = crate::util::nofy_home::nofy_home().join("config.toml");
    let content = match std::fs::read_to_string(&config_path) {
        Ok(c) => c,
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => return Ok(()),
        Err(e) => return Err(e.into()),
    };
    let mut config: toml::Value =
        toml::from_str(&content).map_err(|e| format!("failed to parse config.toml: {e}"))?;
    if let Some(plugins) = config
        .as_table_mut()
        .and_then(|t| t.get_mut("plugins"))
        .and_then(|v| v.as_table_mut())
        && let Some(enabled) = plugins.get_mut("enabled").and_then(|v| v.as_array_mut())
    {
        enabled.retain(|v| v.as_str().is_none_or(|s| s != plugin_id));
    }
    std::fs::write(&config_path, toml::to_string_pretty(&config)?)?;
    Ok(())
}
/// Add a hook path to `~/.nofy/hooks-paths` (one path per line).
///
/// If the path is already present (exact string match), this is a no-op.
/// CWE-427: The path is validated to be under `~/.nofy/` before writing.
pub(crate) fn add_hooks_path(path: &str) -> Result<(), Box<dyn std::error::Error>> {
    validate_hooks_path(path)?;
    add_hooks_path_to_file(
        path,
        &crate::util::nofy_home::nofy_home().join("hooks-paths"),
    )
}
/// Add a hook path to a specific file (for tests).
pub(crate) fn add_hooks_path_to_file(
    path: &str,
    paths_file: &std::path::Path,
) -> Result<(), Box<dyn std::error::Error>> {
    if let Some(parent) = paths_file.parent() {
        std::fs::create_dir_all(parent)?;
    }
    let existing = std::fs::read_to_string(paths_file).unwrap_or_default();
    if existing.lines().any(|l| l.trim() == path) {
        return Ok(());
    }
    use std::io::Write;
    let mut file = std::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(paths_file)?;
    writeln!(file, "{}", path)?;
    Ok(())
}
/// Remove a hook path from `~/.nofy/hooks-paths`.
///
/// If the path is not found (exact string match), this is a no-op.
/// Matches the same exact-string behavior as `add_hooks_path`.
pub(crate) fn remove_hooks_path(path: &str) -> Result<(), Box<dyn std::error::Error>> {
    remove_hooks_path_from_file(
        path,
        &crate::util::nofy_home::nofy_home().join("hooks-paths"),
    )
}
/// Remove a hook path from a specific file (for tests).
pub(crate) fn remove_hooks_path_from_file(
    path: &str,
    paths_file: &std::path::Path,
) -> Result<(), Box<dyn std::error::Error>> {
    let content = match std::fs::read_to_string(paths_file) {
        Ok(c) => c,
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => return Ok(()),
        Err(e) => return Err(e.into()),
    };
    let mut found = false;
    let new_lines: Vec<&str> = content
        .lines()
        .filter(|l| {
            if l.trim() == path {
                found = true;
                false
            } else {
                true
            }
        })
        .collect();
    if !found {
        return Ok(());
    }
    if let Some(parent) = paths_file.parent() {
        std::fs::create_dir_all(parent)?;
    }
    std::fs::write(
        paths_file,
        new_lines.join("\n") + (if new_lines.is_empty() { "" } else { "\n" }),
    )?;
    Ok(())
}
#[cfg(test)]
mod tests;
