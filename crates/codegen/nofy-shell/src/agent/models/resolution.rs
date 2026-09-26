use super::*;

/// Map a model id (catalog key or routing slug) to its catalog key.
pub(crate) fn resolve_catalog_key(
    models: &IndexMap<String, ModelEntry>,
    id: &acp::ModelId,
) -> Option<acp::ModelId> {
    let id_str = id.0.as_ref();
    if models.contains_key(id_str) {
        return Some(id.clone());
    }
    models
        .iter()
        .rev()
        // `has_model_id` rather than `info.model ==`: a model that routes to a
        // different wire id per reasoning effort can get persisted under that
        // variant id, and it still has to resolve back to its catalog entry.
        // Identical to the plain slug match while `variants` is empty.
        .find(|(_, entry)| entry.info.has_model_id(id_str))
        .map(|(key, _)| acp::ModelId::new(key.clone()))
}

/// Catalog key for a persisted session model id, restricted to **selectable**
pub(crate) fn selectable_catalog_key_for_persisted(
    models: &IndexMap<String, ModelEntry>,
    available: &IndexMap<acp::ModelId, acp::ModelInfo>,
    id: &acp::ModelId,
) -> Option<acp::ModelId> {
    if available.contains_key(id) {
        return Some(id.clone());
    }
    let id_str = id.0.as_ref();
    if let Some((key, _)) = models.iter().rev().find(|(key, entry)| {
        available.contains_key(&acp::ModelId::new((*key).clone()))
            && entry.info.has_model_id(id_str)
    }) {
        return Some(acp::ModelId::new(key.clone()));
    }
    resolve_catalog_key(models, id).filter(|key| available.contains_key(key))
}

/// A "campaign-only" preferred flip: the default changed and either side's value
pub(crate) fn is_campaign_only_flip(
    old_preferred: &Option<String>,
    new_preferred: &Option<String>,
    campaign_defaults: &std::collections::HashSet<String>,
) -> bool {
    if new_preferred == old_preferred || new_preferred.is_none() {
        return false;
    }
    new_preferred
        .as_ref()
        .is_some_and(|p| campaign_defaults.contains(p))
        || old_preferred
            .as_ref()
            .is_some_and(|p| campaign_defaults.contains(p))
}

/// Pick the default model: CLI > env > config, falling back to the first
/// auth-visible selectable entry.
pub(crate) fn resolve_default_model(
    cfg: &config::Config,
    catalog: &IndexMap<String, ModelEntry>,
    is_session_auth: bool,
) -> (String, ModelEntry, config::ConfigSource) {
    let visible: IndexMap<String, ModelEntry> = catalog
        .iter()
        .filter(|(_, e)| e.info.visible_for_auth(is_session_auth) && e.info.user_selectable)
        .map(|(k, v)| (k.clone(), v.clone()))
        .collect();

    let model_pref = config::resolve_string_flag(
        cfg.default_model_override.as_deref(),
        "NOFY_DEFAULT_MODEL",
        cfg.models.default.as_deref(),
    );

    let first_or_fallback = || -> (String, ModelEntry) {
        if let Some((key, first)) = visible.first() {
            return (key.clone(), first.clone());
        }
        if let Some((key, entry)) = catalog.iter().find(|(_, e)| e.info.user_selectable) {
            tracing::warn!("no auth-visible selectable model; using first selectable entry");
            return (key.clone(), entry.clone());
        }
        tracing::warn!("no selectable models; falling back to bundled default (pre-catalog)");
        let default_id = crate::models::default_model().to_string();
        let mut entry = ModelEntry::fallback(&default_id, &cfg.endpoints);
        entry.info.user_selectable = effective_allowlist(cfg).is_selected(&default_id, &default_id);
        (default_id, entry)
    };

    match &model_pref {
        None => {
            let (key, first) = first_or_fallback();
            (key, first, config::ConfigSource::Default)
        }
        Some(pref) => {
            let found = visible
                .get_key_value(&pref.value)
                .or_else(|| visible.iter().find(|(_, m)| m.model == pref.value));

            if let Some((key, entry)) = found {
                (key.clone(), entry.clone(), pref.source)
            } else {
                tracing::warn!(
                    model_id = %pref.value, source = %pref.source,
                    "preferred model not in available models, falling back"
                );
                let campaign_pref_missing = cfg.models.default_is_campaign_driven
                    && matches!(pref.source, config::ConfigSource::Config);
                if campaign_pref_missing
                    && let Some(prev) = cfg
                        .models
                        .pre_campaign_default
                        .as_deref()
                        .filter(|s| !s.is_empty())
                    && let Some((key, entry)) = visible
                        .get_key_value(prev)
                        .or_else(|| visible.iter().find(|(_, m)| m.model == prev))
                {
                    tracing::info!(
                        unavailable = %pref.value, fallback = %prev,
                        "campaign-driven default unavailable in catalog; recovering the pre-campaign default"
                    );
                    return (key.clone(), entry.clone(), config::ConfigSource::Config);
                }
                let (key, first) = first_or_fallback();
                (key, first, config::ConfigSource::Default)
            }
        }
    }
}

/// Filter hidden and auth-gated entries out of `catalog` and convert to ACP wire format.
pub(crate) fn available_models(
    catalog: &IndexMap<String, ModelEntry>,
    is_session_auth: bool,
) -> IndexMap<acp::ModelId, acp::ModelInfo> {
    let visible: IndexMap<String, ModelEntry> = catalog
        .iter()
        .filter(|(_, e)| e.info.visible_for_auth(is_session_auth))
        .map(|(k, v)| (k.clone(), v.clone()))
        .collect();
    config::to_acp_model_info(&visible)
}

/// Compiled glob matcher shared by `allowed_models`, `disabled_models`, and `hidden_models` (matched against catalog key or model id).
pub(crate) struct ModelGlobSet(GlobSet);

impl ModelGlobSet {
    /// Compile a filter list (`Ok(None)` for `None`/empty). Fails **closed**: an invalid pattern returns `Err` listing every bad one.
    pub(crate) fn compile(patterns: Option<&Vec<String>>) -> Result<Option<Self>, Vec<String>> {
        match patterns {
            Some(p) if !p.is_empty() => Self::compile_slice(p).map(Some),
            _ => Ok(None),
        }
    }

    /// Slice form, for callers that already hold a `&[String]` (the fleet pin
    /// lives in an enum variant, not an `Option<Vec<_>>`).
    fn compile_slice(patterns: &[String]) -> Result<Self, Vec<String>> {
        let mut builder = GlobSetBuilder::new();
        let mut invalid = Vec::new();
        for pat in patterns {
            match Glob::new(pat) {
                Ok(glob) => {
                    builder.add(glob);
                }
                Err(_) => invalid.push(pat.clone()),
            }
        }
        if !invalid.is_empty() {
            return Err(invalid);
        }
        builder.build().map(Self).map_err(|e| vec![e.to_string()])
    }

    fn matches(&self, key: &str, model: &str) -> bool {
        self.0.is_match(key) || self.0.is_match(model)
    }

    /// Match the model id only. Used for a fleet pin: a catalog key is
    /// user-defined, so letting it satisfy a fleet restriction would be an
    /// escape hatch (rename the key, keep the model).
    fn matches_model(&self, model: &str) -> bool {
        self.0.is_match(model)
    }
}

/// The allowlist actually in force, after the requirements layer has had its
/// say. Holds a **compiled** glob set so the per-entry catalog loop does not
/// recompile it.
enum EffectiveAllowlist {
    /// No fleet pin and no user/project list (or an explicitly empty one).
    Unrestricted,
    /// A list was present but could not be used: the fleet pin was unreadable,
    /// or a glob would not compile. Nothing is selectable. `fleet` decides the
    /// wording — a user pattern is fixable by the user, a fleet pin is not.
    Invalid {
        fleet: bool,
        /// `None` only for an unreadable pin, where there is nothing to echo.
        patterns: Option<String>,
    },
    List {
        set: ModelGlobSet,
        /// Came from `requirements.toml` rather than the user/project config.
        fleet: bool,
        /// Pre-joined for error messages.
        patterns: String,
    },
}

fn effective_allowlist(cfg: &config::Config) -> EffectiveAllowlist {
    use crate::agent::config::AllowlistPin;
    let (patterns, fleet) = match cfg.requirements.allowed_models.pin_ref() {
        Some(AllowlistPin::FailClosed) => {
            tracing::error!(
                "requirements allowed_models is present but unreadable; marking nothing selectable"
            );
            return EffectiveAllowlist::Invalid {
                fleet: true,
                patterns: None,
            };
        }
        // An explicitly empty fleet array means "no restriction", not "nothing
        // allowed" — otherwise a policy that clears its list would brick the CLI.
        Some(AllowlistPin::List(p)) if p.is_empty() => return EffectiveAllowlist::Unrestricted,
        Some(AllowlistPin::List(p)) => (p.as_slice(), true),
        None => match cfg.models.allowed_models.as_deref() {
            Some(p) if !p.is_empty() => (p, false),
            _ => return EffectiveAllowlist::Unrestricted,
        },
    };
    match ModelGlobSet::compile_slice(patterns) {
        Ok(set) => EffectiveAllowlist::List {
            set,
            fleet,
            patterns: patterns.join(", "),
        },
        Err(bad) => {
            tracing::error!(
                patterns = ?bad,
                fleet,
                "allowed_models: invalid glob(s); marking nothing selectable"
            );
            EffectiveAllowlist::Invalid {
                fleet,
                patterns: Some(patterns.join(", ")),
            }
        }
    }
}

impl EffectiveAllowlist {
    /// True when a list is in force, so "nothing matched" is a real condition
    /// worth reporting rather than the unrestricted default.
    fn is_active(&self) -> bool {
        !matches!(self, Self::Unrestricted)
    }

    /// True when the list came from the requirements layer. Drives the error
    /// wording: a fleet pin is not something the user can edit away, so the
    /// message must not tell them to.
    fn is_fleet(&self) -> bool {
        match self {
            Self::Unrestricted => false,
            Self::Invalid { fleet, .. } | Self::List { fleet, .. } => *fleet,
        }
    }

    fn is_selected(&self, key: &str, model: &str) -> bool {
        match self {
            Self::Unrestricted => true,
            Self::Invalid { .. } => false,
            Self::List { set, fleet, .. } => {
                if *fleet {
                    set.matches_model(model)
                } else {
                    set.matches(key, model)
                }
            }
        }
    }

    /// The patterns to quote in a message, or `None` when there is nothing to
    /// echo (unrestricted, or a pin too malformed to read back).
    fn patterns_for_message(&self) -> Option<&str> {
        match self {
            Self::Unrestricted => None,
            Self::Invalid { patterns, .. } => patterns.as_deref(),
            Self::List { patterns, .. } => Some(patterns),
        }
    }
}

/// The user-facing reason one specific model was refused. Wording splits on
/// provenance: a fleet pin is re-applied from `requirements.toml` on every load,
/// so pointing the user at their own config sends them somewhere that cannot work.
pub(crate) fn allowlist_denied_message(cfg: &config::Config) -> &'static str {
    if effective_allowlist(cfg).is_fleet() {
        "This model isn't allowed by your organization's model policy. Contact your administrator."
    } else {
        "This model isn't allowed by your allowed_models setting."
    }
}

/// The user-facing reason no model at all is selectable.
pub(crate) fn allowlist_excludes_all_message(cfg: &config::Config) -> String {
    let allowlist = effective_allowlist(cfg);
    let patterns = allowlist.patterns_for_message();
    match (allowlist.is_fleet(), patterns) {
        (true, _) => "None of your models are permitted by your organization's model policy. \
             Contact your administrator."
            .to_owned(),
        (false, Some(p)) => format!(
            "None of your models are allowed by allowed_models ({p}). \
             Broaden the patterns or remove allowed_models, then restart."
        ),
        (false, None) => "None of your models are allowed by allowed_models. \
             Broaden it or remove it from your config, then restart."
            .to_owned(),
    }
}

/// Single source of truth for the catalog. Applies, in order: `disabled_models`
pub(crate) fn resolve_model_catalog(
    cfg: &config::Config,
    prefetched: Option<IndexMap<String, ModelEntry>>,
) -> IndexMap<String, ModelEntry> {
    let mut catalog: IndexMap<String, ModelEntry> = config::resolve_model_list(cfg, prefetched);

    if let Ok(Some(disabled)) = ModelGlobSet::compile(cfg.models.disabled_models.as_ref()) {
        let before = catalog.len();
        catalog.retain(|key, entry| !disabled.matches(key, &entry.model));
        let removed = before - catalog.len();
        if removed > 0 {
            tracing::info!(count = removed, "disabled_models: removed from catalog");
        }
    }

    let allowlist = effective_allowlist(cfg);
    for (key, entry) in catalog.iter_mut() {
        entry.info.user_selectable = allowlist.is_selected(key, &entry.model);
    }

    if let Ok(Some(hidden)) = ModelGlobSet::compile(cfg.models.hidden_models.as_ref()) {
        for (key, entry) in catalog.iter_mut() {
            if hidden.matches(key, &entry.model) {
                entry.info.hidden = true;
            }
        }
    }

    if let Some(effort) = cfg.models.default_reasoning_effort
        && let Some(default_id) = cfg.models.default.as_deref()
        && let Some(entry) = catalog.get_mut(default_id)
        && entry.info.supports_reasoning_effort
    {
        entry.info.reasoning_effort = Some(effort);
    }

    if let Some(effort) = cfg.reasoning_effort_override {
        for entry in catalog.values_mut() {
            if model_offers_reasoning_effort(&entry.info, effort) {
                entry.info.reasoning_effort = Some(effort);
            }
        }
    }

    catalog
}

/// Whether `effort` is a value this model will accept on the wire.
fn model_offers_reasoning_effort(info: &config::ModelInfo, effort: ReasoningEffort) -> bool {
    if !info.supports_reasoning_effort {
        return false;
    }
    if info.reasoning_efforts.is_empty() {
        matches!(
            effort,
            ReasoningEffort::Low
                | ReasoningEffort::Medium
                | ReasoningEffort::High
                | ReasoningEffort::Xhigh
        )
    } else {
        info.reasoning_efforts.iter().any(|opt| opt.value == effort)
    }
}

/// True when an active allowlist (user/project or fleet) leaves no selectable model.
pub(crate) fn allowlist_matches_nothing(
    cfg: &config::Config,
    catalog: &IndexMap<String, ModelEntry>,
) -> bool {
    effective_allowlist(cfg).is_active() && !catalog.values().any(|e| e.info.user_selectable)
}

/// Reject an allowlist that leaves no selectable model, or excludes an explicitly
/// configured default; run only against a real catalog.
///
/// The wording splits on provenance. A user/project `allowed_models` is something
/// the reader can edit, so the message says how. A fleet pin from
/// `requirements.toml` is not: telling them to "broaden the patterns or remove
/// allowed_models" would send them editing a value that is re-pinned on every
/// load, and naming the key invites them to try.
pub(crate) fn validate_selectable(
    cfg: &config::Config,
    catalog: &IndexMap<String, ModelEntry>,
) -> Result<(), String> {
    let allowlist = effective_allowlist(cfg);
    if !allowlist.is_active() {
        return Ok(());
    }
    let fleet = allowlist.is_fleet();
    // A malformed pin has no patterns to echo, so fall back to naming the policy
    // rather than printing an empty list.
    let scope = match allowlist.patterns_for_message() {
        Some(p) if fleet => format!("your organization's model policy ({p})"),
        Some(p) => format!("allowed_models ({p})"),
        None => "your organization's model policy".to_owned(),
    };
    if !catalog.values().any(|e| e.info.user_selectable) {
        return Err(if fleet {
            format!(
                "None of your available models are permitted by {scope}. \
                 Contact your administrator."
            )
        } else {
            format!(
                "None of your available models match {scope}. \
                 Broaden the patterns or remove allowed_models, then try again."
            )
        });
    }
    for (src, id) in [
        ("default", cfg.models.default.as_deref()),
        ("-m flag", cfg.default_model_override.as_deref()),
    ] {
        if let Some(id) = id
            && let Some(entry) = catalog
                .get(id)
                .or_else(|| catalog.values().find(|e| e.model == id))
            && !entry.info.user_selectable
        {
            return Err(if fleet {
                format!(
                    "\"{id}\" (your {src}) isn't permitted by {scope}. \
                     Set a different model, or contact your administrator."
                )
            } else {
                format!(
                    "\"{id}\" (your {src}) isn't allowed by {scope}. \
                     Add it to allowed_models, or set a different model."
                )
            });
        }
    }
    Ok(())
}
