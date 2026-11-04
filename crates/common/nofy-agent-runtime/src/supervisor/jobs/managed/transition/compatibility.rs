use super::*;
use crate::{compile::CompilationSnapshot, registry::ModuleRef};
use std::collections::BTreeSet;

pub(super) fn agent(snapshot: &RunSnapshot) -> Result<&CompilationSnapshot, Error> {
    match snapshot {
        RunSnapshot::Agent(s) => Ok(s),
        RunSnapshot::Program(s) => match &s.program {
            crate::program::ProgramSnapshot::Agent { snapshot } => Ok(snapshot),
            _ => Err(Error::Composition(
                "live transition requires a root Agent".into(),
            )),
        },
    }
}
fn module<'a>(
    snapshot: &'a CompilationSnapshot,
    reference: &ModuleRef,
) -> Result<&'a crate::registry::ResolvedModule, Error> {
    snapshot
        .modules
        .iter()
        .find(|m| &m.definition.reference == reference)
        .ok_or_else(|| Error::Composition("live module dependency missing".into()))
}
fn closure(
    snapshot: &CompilationSnapshot,
    roots: impl IntoIterator<Item = ModuleRef>,
) -> Result<BTreeSet<ModuleRef>, Error> {
    let mut pending = roots.into_iter().collect::<Vec<_>>();
    let mut visited = BTreeSet::new();
    while let Some(reference) = pending.pop() {
        if !visited.insert(reference.clone()) {
            continue;
        }
        pending.extend(
            module(snapshot, &reference)?
                .definition
                .dependencies
                .values()
                .cloned(),
        );
    }
    Ok(visited)
}
fn equal_closure(
    source: &CompilationSnapshot,
    target: &CompilationSnapshot,
    before: &ModuleRef,
    after: &ModuleRef,
) -> Result<bool, Error> {
    if before != after {
        return Ok(false);
    }
    let a = closure(source, [before.clone()])?;
    let b = closure(target, [after.clone()])?;
    if a != b {
        return Ok(false);
    }
    for reference in a {
        if serde_json::to_value(module(source, &reference)?).map_err(db_error)?
            != serde_json::to_value(module(target, &reference)?).map_err(db_error)?
        {
            return Ok(false);
        }
    }
    Ok(true)
}
pub(super) fn hook_identities(
    snapshot: &RunSnapshot,
) -> Result<std::collections::BTreeMap<String, String>, Error> {
    let snapshot = agent(snapshot)?;
    snapshot
        .agent
        .hooks
        .iter()
        .map(|reference| {
            // Existing compiler identities remain untouched for v1 snapshots.
            let original =
                serde_json::to_string(&(reference, &snapshot.modules)).map_err(db_error)?;
            let reachable = closure(snapshot, [reference.clone()])?
                .iter()
                .map(|r| module(snapshot, r))
                .collect::<Result<Vec<_>, _>>()?;
            Ok((original, content_digest(&(reference, reachable))?))
        })
        .collect()
}
pub(super) fn context_policy_identities(
    base: &RunSnapshot,
    target: &RunSnapshot,
) -> Result<std::collections::BTreeMap<String, String>, Error> {
    let base = agent(base)?;
    let target = agent(target)?;
    target
        .agent
        .context_policies
        .iter()
        .map(|reference| {
            let original = serde_json::to_string(module(target, reference)?).map_err(db_error)?;
            let identity = if base.agent.context_policies.contains(reference)
                && equal_closure(base, target, reference, reference)?
            {
                serde_json::to_string(module(base, reference)?).map_err(db_error)?
            } else {
                let reachable = closure(target, [reference.clone()])?
                    .iter()
                    .map(|reference| module(target, reference))
                    .collect::<Result<Vec<_>, _>>()?;
                format!(
                    "live-context-policy/v1:{}",
                    content_digest(&(reference, reachable))?
                )
            };
            Ok((original, identity))
        })
        .collect()
}
pub(super) fn validate(
    source: &RunSnapshot,
    target: &RunSnapshot,
    update: Option<ModuleUpdate>,
) -> Result<Option<String>, Error> {
    let source = agent(source)?;
    let target = agent(target)?;
    let mut normalized = target.agent.clone();
    normalized.model = source.agent.model.clone();
    normalized.prompt = source.agent.prompt.clone();
    normalized.settings.model = source.agent.settings.model.clone();
    if update.is_some_and(|u| u.tool_catalog) {
        normalized.tool_packs = source.agent.tool_packs.clone();
    }
    if update.is_some_and(|u| u.hook_subscriptions) {
        normalized.hooks = source.agent.hooks.clone();
    }
    if update.is_some_and(|u| u.policy_set) {
        normalized.policies = source.agent.policies.clone();
    }
    if update.is_some_and(|u| u.context_sources) {
        normalized.context_sources = source.agent.context_sources.clone();
    }
    if update.is_some_and(|u| u.context_policies) {
        normalized.context_policies = source.agent.context_policies.clone();
    }
    if update.is_some_and(|u| u.tool_sources) {
        normalized.tool_sources = source.agent.tool_sources.clone();
    }
    if serde_json::to_value(normalized).map_err(db_error)?
        != serde_json::to_value(&source.agent).map_err(db_error)?
        || source.required_policies != target.required_policies
        || source.required_governance != target.required_governance
    {
        return Err(Error::Composition("live update changes an unselected capability, protected stateful module or permission/budget floor".into()));
    }
    let a = &source.agent;
    let mut pending: Vec<ModuleRef> = a
        .middleware
        .iter()
        .chain(&a.bindings)
        .chain(a.checkpointer.iter())
        .chain(a.recipe.iter())
        .chain(a.session_policy.iter())
        .chain(&source.required_policies)
        .cloned()
        .collect();
    if update.is_some_and(|update| update.budget_limits) {
        for reference in &a.governance {
            let before = module(source, reference)?;
            let after = module(target, reference)?;
            let mut identity = after.clone();
            identity.definition.config = before.definition.config.clone();
            if before.factory.kind != crate::registry::ModuleKind::Governance
                || serde_json::to_value(&identity).map_err(db_error)?
                    != serde_json::to_value(before).map_err(db_error)?
            {
                return Err(Error::Composition(
                    "live budget factory/reference/dependencies changed".into(),
                ));
            }
            pending.extend(before.definition.dependencies.values().cloned());
        }
    } else {
        pending.extend(a.governance.clone());
        pending.extend(source.required_governance.clone());
    }
    if !update.is_some_and(|u| u.policy_set) {
        pending.extend(a.policies.clone());
    }
    if !update.is_some_and(|u| u.context_sources) {
        pending.extend(a.context_sources.clone());
    }
    if !update.is_some_and(|u| u.context_policies) {
        pending.extend(a.context_policies.clone());
    }
    if !update.is_some_and(|u| u.tool_sources) {
        pending.extend(a.tool_sources.clone());
    }
    if !update.is_some_and(|u| u.tool_catalog) {
        pending.extend(a.tool_packs.clone());
    }
    if !update.is_some_and(|u| u.hook_subscriptions) {
        pending.extend(a.hooks.clone());
    }
    let mut visited = BTreeSet::new();
    while let Some(reference) = pending.pop() {
        if !visited.insert(reference.clone()) {
            continue;
        }
        let before = module(source, &reference)?;
        let after = module(target, &reference)?;
        if serde_json::to_value(before).map_err(db_error)?
            != serde_json::to_value(after).map_err(db_error)?
        {
            return Err(Error::Composition(format!(
                "live transition changes preserved dependency: {}",
                reference.id
            )));
        }
        pending.extend(before.definition.dependencies.values().cloned());
    }
    let preserved = visited;
    let mut pending = vec![target.agent.model.clone(), target.agent.prompt.clone()];
    let mut visited = BTreeSet::new();
    while let Some(reference) = pending.pop() {
        if !visited.insert(reference.clone()) {
            continue;
        }
        let resolved = module(target, &reference)?;
        if !preserved.contains(&reference)
            && !matches!(
                resolved.factory.kind,
                crate::registry::ModuleKind::Model
                    | crate::registry::ModuleKind::Prompt
                    | crate::registry::ModuleKind::Resource
            )
        {
            return Err(Error::Composition(
                "live model/prompt dependencies may not add mutable stateful modules".into(),
            ));
        }
        pending.extend(resolved.definition.dependencies.values().cloned());
    }
    let prompt = module(target, &target.agent.prompt)?;
    if update.is_some()
        && equal_closure(source, target, &source.agent.prompt, &target.agent.prompt)?
    {
        return Ok(None);
    }
    if prompt.factory.factory != "prompt.static"
        || prompt.factory.revision != "1"
        || !prompt.definition.dependencies.is_empty()
    {
        return Err(Error::Composition(
            "nofy.live/v1 requires prompt.static revision 1".into(),
        ));
    }
    prompt.definition.config["text"]
        .as_str()
        .map(|text| Some(text.to_owned()))
        .ok_or_else(|| Error::Composition("live static prompt text missing".into()))
}

pub(super) fn validate_suspended_budget(
    source: &RunSnapshot,
    target: &RunSnapshot,
    update: Option<ModuleUpdate>,
) -> Result<(), Error> {
    if update
        != Some(ModuleUpdate {
            budget_limits: true,
            ..Default::default()
        })
    {
        return Err(Error::Composition(
            "budget-suspended work requires an exclusive budget update".into(),
        ));
    }
    let source = agent(source)?;
    let mut normalized = agent(target)?.clone();
    for resolved in &mut normalized.modules {
        if source
            .agent
            .governance
            .contains(&resolved.definition.reference)
        {
            resolved.definition.config = module(source, &resolved.definition.reference)?
                .definition
                .config
                .clone();
        }
    }
    if content_digest(source)? != content_digest(&normalized)? {
        return Err(Error::Composition(
            "budget-suspended work preserves every non-budget definition".into(),
        ));
    }
    Ok(())
}
pub(super) struct HistoryProof(String);
impl HistoryProof {
    pub(super) fn verify(
        &self,
        source: &RunSnapshot,
        target: &RunSnapshot,
        state: &RunState,
        update: Option<ModuleUpdate>,
    ) -> Result<(), Error> {
        if self.0 != content_digest(&(source, target, state, update))? {
            return Err(Error::Checkpoint("validated live history changed".into()));
        }
        Ok(())
    }
}

pub(super) async fn history(
    source: &RunSnapshot,
    target: &RunSnapshot,
    state: &RunState,
    target_agent: &crate::Agent,
    update: Option<ModuleUpdate>,
) -> Result<HistoryProof, Error> {
    validate(source, target, update)?;
    if update.is_some_and(|update| update.tool_catalog && !update.tool_sources)
        && !state.tool_revision.is_empty()
    {
        target_agent.validate_live_tool_view(&state.tool_revision)?;
    }
    let a = agent(source)?;
    let b = agent(target)?;
    if update.is_none()
        || a.agent.settings.model != b.agent.settings.model
        || !equal_closure(a, b, &a.agent.model, &b.agent.model)?
        || !equal_closure(a, b, &a.agent.prompt, &b.agent.prompt)?
    {
        target_agent.validate_live_history(&state.messages).await?;
    }
    if !target_agent.model_capabilities().image_input && state.messages.iter().any(|m| matches!(m,
        crate::Message::UserParts { content } if content.iter().any(|p| matches!(p, crate::InputPart::Image { .. })))) {
        return Err(Error::Composition("target model cannot consume retained image history".into()));
    }
    Ok(HistoryProof(content_digest(&(
        source, target, state, update,
    ))?))
}
