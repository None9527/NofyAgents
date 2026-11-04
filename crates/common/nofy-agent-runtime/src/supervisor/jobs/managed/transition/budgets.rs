use super::*;
use crate::{
    governance::{BudgetLedgerBinding, BudgetLimits, BudgetScope, BudgetSpec, GovernanceProfile},
    registry::{ModuleInstance, ModuleRegistry},
};
use std::collections::{BTreeMap, BTreeSet};
use std::sync::Arc;

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(deny_unknown_fields)]
pub(super) struct Change {
    pub binding: BudgetLedgerBinding,
    pub before: BudgetLimits,
    pub after: BudgetLimits,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(deny_unknown_fields)]
pub(super) struct Plan {
    pub changes: Vec<Change>,
}

impl Plan {
    pub(super) fn bindings(&self) -> Vec<BudgetLedgerBinding> {
        self.changes
            .iter()
            .map(|change| change.binding.clone())
            .collect()
    }
}

fn aliases(bindings: &[BudgetLedgerBinding]) -> Result<(), Error> {
    let mut assigned = BTreeMap::new();
    let mut references = BTreeSet::new();
    for binding in bindings {
        if !references.insert(&binding.reference)
            || !binding.profile_aliases.contains(&binding.profile_identity)
            || !binding.profile_aliases.contains(&binding.ledger_identity)
            || binding
                .profile_aliases
                .iter()
                .any(|id| id.len() != 64 || !id.bytes().all(|byte| byte.is_ascii_hexdigit()))
        {
            return Err(Error::Checkpoint(
                "invalid live budget identity lineage".into(),
            ));
        }
        for alias in &binding.profile_aliases {
            if assigned
                .insert(alias, &binding.ledger_identity)
                .is_some_and(|old| old != &binding.ledger_identity)
            {
                return Err(Error::Composition(
                    "live budget identities would merge distinct ledgers".into(),
                ));
            }
        }
    }
    Ok(())
}

pub(super) fn validate_proposal(proposal: &Proposal) -> Result<(), Error> {
    let selected = selection(&proposal.action.command)
        .and_then(|selection| selection.update)
        .is_some_and(|update| update.budget_limits);
    match (&proposal.budget_plan, selected) {
        (None, false) => Ok(()),
        (Some(plan), true) => {
            let snapshot = compatibility::agent(&proposal.snapshot)?;
            if plan.changes.is_empty()
                || plan
                    .changes
                    .iter()
                    .map(|change| &change.binding.reference)
                    .collect::<Vec<_>>()
                    != snapshot.agent.governance.iter().collect::<Vec<_>>()
            {
                return Err(Error::Checkpoint(
                    "live budget plan does not match its declared profiles".into(),
                ));
            }
            aliases(&plan.bindings())
        }
        _ => Err(Error::Checkpoint(
            "live budget plan selection changed".into(),
        )),
    }
}

/// Resolve only governance instances, outside a transaction or async executor.
/// All snapshot metadata is checked, without evaluating models or tools.
fn source_profiles(
    snapshot: &RunSnapshot,
    host: &ModuleRegistry,
) -> Result<Vec<Arc<GovernanceProfile>>, Error> {
    let source = compatibility::agent(snapshot)?;
    let scope = restore_scope(snapshot, &host.without_definitions())?;
    let scope = crate::compile::restore_modules(
        &scope,
        &source.modules,
        &source.required_policies,
        &source.required_governance,
    )?;
    let resolved = scope.resolve(&source.agent.governance)?;
    for module in &resolved.snapshot {
        let expected = source
            .modules
            .iter()
            .find(|expected| expected.definition.reference == module.definition.reference)
            .ok_or_else(|| Error::Checkpoint("source budget dependency is missing".into()))?;
        if serde_json::to_value(expected).map_err(db_error)?
            != serde_json::to_value(module).map_err(db_error)?
        {
            return Err(Error::Composition(
                "source budget factory/resource changed".into(),
            ));
        }
    }
    source
        .agent
        .governance
        .iter()
        .map(|reference| match resolved.instances.get(reference) {
            Some(ModuleInstance::Governance(profile)) => Ok(profile.clone()),
            _ => Err(Error::Composition(
                "source governance is not a budget profile".into(),
            )),
        })
        .collect()
}

pub(super) fn prepare(
    source: &RunSnapshot,
    target: &RunSnapshot,
    target_profiles: &[Arc<GovernanceProfile>],
    modules: Option<&LiveModuleState>,
    host: &ModuleRegistry,
    storage_identity: &str,
) -> Result<Plan, Error> {
    let references = &compatibility::agent(source)?.agent.governance;
    if references.is_empty()
        || references != &compatibility::agent(target)?.agent.governance
        || references.len() != target_profiles.len()
    {
        return Err(Error::Composition(
            "budget updates require the same nonempty declared governance references".into(),
        ));
    }
    let old = source_profiles(source, host)?;
    let previous = modules.map_or(&[][..], |state| state.budgets.as_slice());
    if !previous.is_empty() && previous.len() != references.len() {
        return Err(Error::Checkpoint(
            "prior live budget binding is incomplete".into(),
        ));
    }
    aliases(previous)?;
    let mut changes = Vec::new();
    let mut specifications = BTreeMap::new();
    for ((reference, source), target) in references.iter().zip(old).zip(target_profiles) {
        if source.resource_identity() != target.resource_identity()
            || source.storage_identity().as_deref() != Some(storage_identity)
            || target.storage_identity().as_deref() != Some(storage_identity)
            || !source.is_durable()
            || !target.is_durable()
        {
            return Err(Error::Composition(
                "live budgets must preserve the installed resource and root checkpoint storage"
                    .into(),
            ));
        }
        let mut binding = match previous
            .iter()
            .find(|binding| &binding.reference == reference)
        {
            Some(binding)
                if binding.profile_identity == source.identity()
                    && binding.resource_identity == source.resource_identity() =>
            {
                binding.clone()
            }
            Some(_) => {
                return Err(Error::Checkpoint(
                    "prior live budget profile changed".into(),
                ));
            }
            None if previous.is_empty() => BudgetLedgerBinding {
                reference: reference.clone(),
                profile_identity: source.identity().into(),
                ledger_identity: source.identity().into(),
                resource_identity: source.resource_identity().into(),
                profile_aliases: [source.identity().to_owned()].into(),
            },
            None => {
                return Err(Error::Checkpoint(
                    "prior live budget profile is missing".into(),
                ));
            }
        };
        binding.profile_identity = target.identity().into();
        binding.profile_aliases.insert(target.identity().into());
        let specification = (
            source.limits().clone(),
            target.limits().clone(),
            target.identity().to_owned(),
        );
        if specifications
            .insert(binding.ledger_identity.clone(), specification.clone())
            .is_some_and(|old| old != specification)
        {
            return Err(Error::Composition(
                "live budgets cannot split a shared ledger into different specifications".into(),
            ));
        }
        changes.push(Change {
            binding,
            before: specification.0,
            after: specification.1,
        });
    }
    let plan = Plan { changes };
    aliases(&plan.bindings())?;
    Ok(plan)
}

pub(super) fn restore(
    base: crate::Agent,
    target: &crate::Agent,
    snapshot: &RunSnapshot,
    bindings: &[BudgetLedgerBinding],
) -> Result<crate::Agent, Error> {
    if bindings.is_empty() {
        return Ok(base);
    }
    aliases(bindings)?;
    let references = &compatibility::agent(snapshot)?.agent.governance;
    if bindings.len() != references.len()
        || base.governance_profiles().len() != references.len()
        || target.governance_profiles().len() != references.len()
    {
        return Err(Error::Checkpoint(
            "restored live budget profile count changed".into(),
        ));
    }
    for (((binding, reference), original), target) in bindings
        .iter()
        .zip(references)
        .zip(base.governance_profiles())
        .zip(target.governance_profiles())
    {
        if &binding.reference != reference
            || binding.ledger_identity != original.identity()
            || binding.resource_identity != original.resource_identity()
            || binding.profile_identity != target.identity()
            || binding.resource_identity != target.resource_identity()
        {
            return Err(Error::Checkpoint(
                "restored live budget provenance changed".into(),
            ));
        }
    }
    base.with_live_budgets(target, bindings)
}

pub(super) fn apply(
    tx: &Transaction<'_>,
    lease: &Lease,
    proposal: &Proposal,
    now: u64,
) -> Result<(), Error> {
    validate_proposal(proposal)?;
    let Some(plan) = &proposal.budget_plan else {
        return Ok(());
    };
    let root = sessions::budget_root(tx, &proposal.action.run_id, &lease.key)?;
    let mut applied = BTreeSet::new();
    for change in &plan.changes {
        if applied.insert(&change.binding.ledger_identity) {
            crate::governance::amend_in_transaction(
                tx,
                &BudgetSpec {
                    scope: BudgetScope {
                        root_run_id: root.clone(),
                        identity: change.binding.ledger_identity.clone(),
                    },
                    limits: change.before.clone(),
                },
                &change.after,
                &proposal.action.command_id,
                now,
            )?;
        }
    }
    Ok(())
}
