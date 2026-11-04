//! Explicit, fenced live versions keep the original durable identity while
//! recording effective configuration and selected capability updates.
use super::*;
use crate::governance::BudgetStore;
use rusqlite::Transaction;
mod budgets;
mod compatibility;
mod history;

#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ModuleUpdate {
    #[serde(default)]
    pub tool_catalog: bool,
    #[serde(default)]
    pub hook_subscriptions: bool,
    #[serde(default, skip_serializing_if = "unselected")]
    pub policy_set: bool,
    #[serde(default, skip_serializing_if = "unselected")]
    pub budget_limits: bool,
    #[serde(default, skip_serializing_if = "unselected")]
    pub context_sources: bool,
    #[serde(default, skip_serializing_if = "unselected")]
    pub context_policies: bool,
    #[serde(default, skip_serializing_if = "unselected")]
    pub tool_sources: bool,
}
#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct LiveModuleState {
    pub tool_catalog: bool,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub hook_epoch: Option<String>,
    #[serde(default, skip_serializing_if = "unselected")]
    pub policy_set: bool,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub budgets: Vec<crate::governance::BudgetLedgerBinding>,
    #[serde(default, skip_serializing_if = "unselected")]
    pub context_sources: bool,
    #[serde(default, skip_serializing_if = "unselected")]
    pub context_policies: bool,
    #[serde(default, skip_serializing_if = "unselected")]
    pub tool_sources: bool,
}
fn unselected(value: &bool) -> bool {
    !*value
}
pub(super) struct Selection<'a> {
    pub park_command_id: &'a str,
    pub expected_revision: u64,
    pub release: &'a str,
    pub program: &'a str,
    pub update: Option<ModuleUpdate>,
}
pub(super) fn selection(command: &ManagedCommand) -> Option<Selection<'_>> {
    match command {
        ManagedCommand::Transition {
            park_command_id,
            expected_revision,
            release,
            program,
        } => Some(Selection {
            park_command_id,
            expected_revision: *expected_revision,
            release,
            program,
            update: None,
        }),
        ManagedCommand::UpdateModules {
            park_command_id,
            expected_revision,
            release,
            program,
            update,
        } => Some(Selection {
            park_command_id,
            expected_revision: *expected_revision,
            release,
            program,
            update: Some(*update),
        }),
        _ => None,
    }
}
fn module_state(
    previous: Option<&LiveModuleState>,
    action: &ManagedAction,
    revision: u64,
    budget_plan: Option<&budgets::Plan>,
) -> Result<Option<LiveModuleState>, Error> {
    let selected = selection(&action.command)
        .ok_or_else(|| Error::Composition("expected a live update".into()))?;
    let old = previous.cloned();
    if selected.update.is_none() {
        return Ok(old);
    }
    let update = selected.update.unwrap_or_default();
    let mut next = old.unwrap_or_default();
    next.tool_catalog |= update.tool_catalog;
    next.policy_set |= update.policy_set;
    next.context_sources |= update.context_sources;
    next.context_policies |= update.context_policies;
    next.tool_sources |= update.tool_sources;
    if update.budget_limits {
        next.budgets = budget_plan
            .ok_or_else(|| Error::Checkpoint("live budget plan missing".into()))?
            .bindings();
    } else if budget_plan.is_some() {
        return Err(Error::Checkpoint("unselected live budget plan".into()));
    }
    if update.hook_subscriptions {
        next.hook_epoch = Some(content_digest(&(
            "live-hooks-v2",
            &action.run_id,
            &action.command_id,
            revision,
        ))?);
    }
    Ok(Some(next))
}
fn live_protocol(modules: &Option<LiveModuleState>) -> &'static str {
    match modules {
        Some(modules)
            if modules.context_sources || modules.context_policies || modules.tool_sources =>
        {
            "nofy.live/v5"
        }
        Some(modules) if !modules.budgets.is_empty() => "nofy.live/v4",
        Some(modules) if modules.policy_set => "nofy.live/v3",
        Some(_) => "nofy.live/v2",
        None => "nofy.live/v1",
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct LiveExecution {
    pub protocol: String,
    pub revision: u64,
    pub command_id: String,
    pub run_id: String,
    pub submission_digest: String,
    pub base_composition_digest: String,
    pub composition_digest: String,
    pub release: String,
    pub program: String,
    pub snapshot: RunSnapshot,
    pub park_command_id: String,
    pub before: crate::Checkpoint,
    pub before_digest: String,
    pub after: crate::Checkpoint,
    pub after_digest: String,
    pub applied_at_ms: u64,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub modules: Option<LiveModuleState>,
}
/// Bounded control-plane projection; checkpoint transcripts stay in the
/// durable evidence and existing execution view, not repeated on every page.
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct LiveVersionInfo {
    pub protocol: String,
    pub revision: u64,
    pub command_id: String,
    pub run_id: String,
    pub submission_digest: String,
    pub base_composition_digest: String,
    pub composition_digest: String,
    pub release: String,
    pub program: String,
    pub park_command_id: String,
    pub before_revision: u64,
    pub before_digest: String,
    pub after_revision: u64,
    pub after_digest: String,
    pub model_sequence: u64,
    pub applied_at_ms: u64,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub modules: Option<LiveModuleState>,
}
impl LiveExecution {
    pub fn info(&self) -> LiveVersionInfo {
        LiveVersionInfo {
            protocol: self.protocol.clone(),
            revision: self.revision,
            command_id: self.command_id.clone(),
            run_id: self.run_id.clone(),
            submission_digest: self.submission_digest.clone(),
            base_composition_digest: self.base_composition_digest.clone(),
            composition_digest: self.composition_digest.clone(),
            release: self.release.clone(),
            program: self.program.clone(),
            park_command_id: self.park_command_id.clone(),
            before_revision: self.before.revision,
            before_digest: self.before_digest.clone(),
            after_revision: self.after.revision,
            after_digest: self.after_digest.clone(),
            model_sequence: self.after.state.model_sequence,
            applied_at_ms: self.applied_at_ms,
            modules: self.modules.clone(),
        }
    }
}
#[derive(Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Proposal {
    action: ManagedAction,
    submission_digest: String,
    snapshot: RunSnapshot,
    composition_digest: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    budget_plan: Option<budgets::Plan>,
}
pub(super) struct EffectiveExecution {
    pub revision: u64,
    pub command_id: String,
    pub snapshot: RunSnapshot,
    pub composition_digest: String,
    pub release: String,
    pub program: String,
    pub modules: Option<LiveModuleState>,
}
pub(super) fn effective(
    tx: &Transaction<'_>,
    run: &str,
) -> Result<Option<EffectiveExecution>, Error> {
    if let Some(live) = latest(tx, run)? {
        return Ok(Some(EffectiveExecution {
            revision: live.revision,
            command_id: live.command_id,
            snapshot: live.snapshot,
            composition_digest: live.composition_digest,
            release: live.release,
            program: live.program,
            modules: live.modules,
        }));
    }
    Ok(
        sessions::handoff::read_seed(tx, run)?.map(|seed| EffectiveExecution {
            revision: 0,
            command_id: seed.info.command_id,
            snapshot: seed.snapshot,
            composition_digest: seed.info.composition_digest,
            release: seed.info.release,
            program: seed.info.program,
            modules: seed.info.modules,
        }),
    )
}
pub(super) fn validate_seed(
    source: &RunSnapshot,
    target: &RunSnapshot,
    modules: &Option<LiveModuleState>,
) -> Result<(), Error> {
    if modules.is_none() && content_digest(source)? == content_digest(target)? {
        return Ok(());
    }
    let allowed = modules.as_ref().map(|m| ModuleUpdate {
        tool_catalog: m.tool_catalog,
        hook_subscriptions: m.hook_epoch.is_some(),
        policy_set: m.policy_set,
        budget_limits: !m.budgets.is_empty(),
        context_sources: m.context_sources,
        context_policies: m.context_policies,
        tool_sources: m.tool_sources,
    });
    compatibility::validate(source, target, allowed)?;
    Ok(())
}
fn proposal(tx: &Transaction<'_>, id: &str) -> Result<Proposal, Error> {
    let (hash, payload): (String, String) = tx
        .query_row(
            "SELECT digest,payload FROM agent_runtime_transition_proposals WHERE command_id=?1",
            [id],
            |r| Ok((r.get(0)?, r.get(1)?)),
        )
        .map_err(db_error)?;
    let p: Proposal = serde_json::from_str(&payload).map_err(db_error)?;
    let accepted = actions::read(tx, id)?
        .ok_or_else(|| Error::Checkpoint("live management command missing".into()))?;
    if p.action.command_id != id
        || content_digest(&p)? != hash
        || actions::action_digest(&p.action)? != actions::action_digest(&accepted.action)?
        || selection(&p.action.command).is_none()
    {
        return Err(Error::Checkpoint("live proposal identity changed".into()));
    }
    budgets::validate_proposal(&p)?;
    Ok(p)
}
fn latest(tx: &Transaction<'_>, run: &str) -> Result<Option<LiveExecution>, Error> {
    version(tx, run, None)
}
fn version(
    tx: &Transaction<'_>,
    run: &str,
    revision: Option<u64>,
) -> Result<Option<LiveExecution>, Error> {
    let row: Option<(u64, String, String, String)> = tx.query_row(
        "SELECT revision,command_id,digest,payload FROM agent_runtime_live_versions WHERE run_id=?1 AND (?2 IS NULL OR revision=?2) ORDER BY revision DESC LIMIT 1", params![run,revision],
        |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?, r.get(3)?)),
    ).optional().map_err(db_error)?;
    row.map(|(revision, id, hash, payload)| {
        let live: LiveExecution = serde_json::from_str(&payload).map_err(db_error)?;
        let (_, job_hash, saved, _) =
            load(tx, run)?.ok_or_else(|| Error::Checkpoint("live job missing".into()))?;
        let p = proposal(tx, &id)?;
        let selected = selection(&p.action.command)
            .ok_or_else(|| Error::Checkpoint("live command missing".into()))?;
        let previous = previous(tx, run, revision, &job_hash)?;
        let seed = sessions::handoff::read_seed(tx, run)?;
        let expected_modules = module_state(
            previous
                .as_ref()
                .and_then(|v| v.modules.as_ref())
                .or_else(|| seed.as_ref().and_then(|v| v.info.modules.as_ref())),
            &p.action,
            revision,
            p.budget_plan.as_ref(),
        )?;
        let source = previous.as_ref().map_or_else(
            || {
                seed.as_ref()
                    .map_or(&saved.submission.snapshot, |s| &s.snapshot)
            },
            |live| &live.snapshot,
        );
        compatibility::validate(source, &live.snapshot, selected.update)?;
        if live.protocol != live_protocol(&expected_modules)
            || live.modules != expected_modules
            || live.revision != revision
            || revision == 0
            || live.command_id != id
            || live.run_id != run
            || p.action.run_id != run
            || live.submission_digest != job_hash
            || p.submission_digest != job_hash
            || live.base_composition_digest != saved.submission.composition_digest
            || live.composition_digest != p.composition_digest
            || content_digest(&live.snapshot)? != content_digest(&p.snapshot)?
            || revision != selected.expected_revision + 1
            || live.park_command_id != selected.park_command_id
            || live.release != selected.release
            || live.program != selected.program
            || content_digest(&live)? != hash
            || digest(&serde_json::to_vec(&live.after).map_err(db_error)?) != live.after_digest
            || digest(&serde_json::to_vec(&live.before).map_err(db_error)?) != live.before_digest
        {
            return Err(Error::Checkpoint("live execution identity changed".into()));
        }
        Ok(live)
    })
    .transpose()
}
fn previous(
    tx: &Transaction<'_>,
    run: &str,
    revision: u64,
    submission: &str,
) -> Result<Option<LiveExecution>, Error> {
    if revision == 1 {
        return Ok(None);
    }
    if revision == 0 {
        return Err(Error::Checkpoint("invalid live revision".into()));
    }
    let (hash,payload):(String,String)=tx.query_row("SELECT digest,payload FROM agent_runtime_live_versions WHERE run_id=?1 AND revision=?2",params![run,revision-1],|r|Ok((r.get(0)?,r.get(1)?))).map_err(db_error)?;
    let record: LiveExecution = serde_json::from_str(&payload).map_err(db_error)?;
    if record.run_id != run
        || record.revision != revision - 1
        || record.submission_digest != submission
        || record.protocol != live_protocol(&record.modules)
        || content_digest(&record)? != hash
    {
        return Err(Error::Checkpoint(
            "preceding live version identity changed".into(),
        ));
    }
    Ok(Some(record))
}
pub(super) fn park_checkpoint(
    tx: &Transaction<'_>,
    park: &parking::ParkRecord,
) -> Result<(u64, String), Error> {
    if let Some(live) = latest(tx, &park.run_id)?
        && live.park_command_id == park.command_id
    {
        return Ok((live.after.revision, live.after_digest));
    }
    let receipt = park
        .receipt
        .as_ref()
        .ok_or_else(|| Error::Checkpoint("park receipt missing".into()))?;
    Ok((
        receipt.checkpoint_revision,
        receipt.checkpoint_digest.clone(),
    ))
}
pub(in crate::supervisor) fn verify_plan(
    tx: &Transaction<'_>,
    run: &str,
    expected: Option<&(u64, String)>,
) -> Result<(), Error> {
    match (effective(tx, run)?, expected) {
        (None, None) if sessions::handoff::latest_admission(tx, run)?.is_none() => Ok(()),
        (Some(saved), Some((revision, command_id)))
            if saved.revision == *revision && saved.command_id == *command_id =>
        {
            Ok(())
        }
        _ => Err(Error::Checkpoint(
            "effective execution version changed; restore through the managed worker".into(),
        )),
    }
}
/// A later frozen job must not silently combine its old model/configuration
/// with an updated predecessor's conversation. Session handoff is explicit.
pub(in crate::supervisor) fn ensure_live_owner(
    tx: &Transaction<'_>,
    key: &str,
    run: &str,
    snapshot: &RunSnapshot,
) -> Result<(), Error> {
    if sessions::handoff::verify_start(tx, key, run)? {
        return Ok(());
    }
    let owner: Option<String> = tx
        .query_row(
            "SELECT active_run FROM agent_runtime_threads WHERE key=?1",
            [key],
            |r| r.get(0),
        )
        .optional()
        .map_err(db_error)?;
    if let Some(owner) = owner
        && owner != run
        && let Some(live) = effective(tx, &owner)?
        && content_digest(&live.snapshot)? != content_digest(snapshot)?
    {
        return Err(Error::Checkpoint("thread has an effective live configuration; explicit session handoff is required before starting a different frozen job".into()));
    }
    Ok(())
}
impl SqliteStore {
    pub async fn live_execution(&self, run: &str) -> Result<Option<LiveExecution>, Error> {
        let run = run.to_owned();
        self.transaction(move |tx| latest(tx, &run)).await
    }
    pub async fn live_versions(
        &self,
        run: &str,
        after: u64,
        limit: usize,
    ) -> Result<Vec<LiveExecution>, Error> {
        if after > i64::MAX as u64 || !(1..=32).contains(&limit) {
            return Err(Error::Composition(
                "live version page requires a valid cursor and limit 1..=32".into(),
            ));
        }
        let run = run.to_owned();
        self.transaction(move |tx| {
            let mut statement=tx.prepare("SELECT revision FROM agent_runtime_live_versions WHERE run_id=?1 AND revision>?2 ORDER BY revision LIMIT ?3").map_err(db_error)?;
            let revisions=statement.query_map(params![run,after,limit],|r|r.get::<_,u64>(0)).map_err(db_error)?.collect::<Result<Vec<_>,_>>().map_err(db_error)?;
            revisions.into_iter().map(|revision| version(tx,&run,Some(revision))?.ok_or_else(||Error::Checkpoint("live version disappeared".into()))).collect()
        }).await
    }
}
impl RunSupervisor {
    /// Resolve the immutable accepted proposal from a published CompiledSystem.
    /// Replay is exact; the ordinary untrusted queue cannot inject snapshots.
    pub async fn submit_transition(
        &self,
        action: ManagedAction,
        system: &CompiledSystem,
    ) -> Result<ManagedActionRecord, Error> {
        let selected = selection(&action.command)
            .ok_or_else(|| Error::Composition("expected a transition command".into()))?;
        actions::action_digest(&action)?;
        if let Some(old) = self.store.managed_action(&action.command_id).await? {
            if actions::action_digest(&old.action)? != actions::action_digest(&action)? {
                return Err(Error::Checkpoint("management command ID reused".into()));
            }
            return Ok(old);
        }
        let request = self
            .store
            .managed_run(&action.run_id)
            .await?
            .ok_or_else(|| Error::Checkpoint("managed run missing".into()))?;
        if selected.release != system.bundle.digest
            || request.request.system != system.bundle.document.name
        {
            return Err(Error::Composition(
                "live target release/system mismatch".into(),
            ));
        }
        let job = self
            .store
            .execution_job(&action.run_id)
            .await?
            .ok_or_else(|| Error::Checkpoint("live job missing".into()))?;
        let source = system.clone();
        let name = selected.program.to_owned();
        let target = tokio::task::spawn_blocking(move || source.program(&name).cloned())
            .await
            .map_err(|e| Error::Checkpoint(format!("live target binding failed: {e}")))??;
        let snapshot = RunSnapshot::Program(target.snapshot.clone());
        let mut p = Proposal {
            action: action.clone(),
            submission_digest: job.digest,
            snapshot,
            composition_digest: digest(target.agent.composition_identity().as_bytes()),
            budget_plan: None,
        };
        let inspect = p.clone();
        let prepared = self
            .store
            .transaction(move |tx| history::prepare(tx, &inspect))
            .await?;
        let boundary = match prepared {
            history::Preparation::Replay(old) => return Ok(old),
            history::Preparation::Validate(boundary) => boundary,
        };
        let storage_identity = self
            .store
            .storage_identity()
            .ok_or_else(|| Error::Composition("live budget storage identity missing".into()))?;
        let proof = boundary
            .validate(&p, &target.agent, system.registry(), &storage_identity)
            .await?;
        p.budget_plan = proof.budget_plan.clone();
        budgets::validate_proposal(&p)?;
        self.store.transaction(move |tx| {
            if let Some(old) = history::replay(tx, &action)? {
                return Ok(old);
            }
            proof.verify(tx, &p)?;
            tx.execute("INSERT INTO agent_runtime_transition_proposals(command_id,digest,payload) VALUES(?1,?2,?3)", params![action.command_id, content_digest(&p)?, serde_json::to_string(&p).map_err(db_error)?]).map_err(db_error)?;
            actions::enqueue(tx, &action, true)
        }).await
    }
    pub(in crate::supervisor) async fn restore_job_plan(
        &self,
        registry: &crate::registry::ModuleRegistry,
        job: &ExecutionJobRecord,
    ) -> Result<ExecutionPlan, Error> {
        let run = job.submission.run_id.clone();
        let effective = self
            .store
            .transaction(move |tx| {
                let value = effective(tx, &run)?;
                if value.is_none() && sessions::handoff::latest_admission(tx, &run)?.is_some() {
                    return Err(Error::Checkpoint(
                        "session turn requires fenced worker preparation".into(),
                    ));
                }
                Ok(value)
            })
            .await?;
        let host = registry.clone();
        let submission = job.submission.clone();
        let managed = self.store.managed_run(&submission.run_id).await?.is_some()
            || sessions::restore_authority(&self.store, job).await?;
        tokio::task::spawn_blocking(move || {
            let scope = if managed {
                restore_scope(&submission.snapshot, &host)?
            } else {
                host.clone()
            };
            let mut base = submission.restore(&scope)?;
            if let Some(live) = effective {
                let modules = live.modules.clone().unwrap_or_default();
                validate_seed(&base.snapshot, &live.snapshot, &live.modules)?;
                let scope = restore_scope(&live.snapshot, &host)?;
                let snapshot = compatibility::agent(&live.snapshot)?;
                let target = snapshot.restore(&scope)?;
                let hook_identities = compatibility::hook_identities(&live.snapshot)?;
                let context_policy_identities =
                    compatibility::context_policy_identities(&base.snapshot, &live.snapshot)?;
                if digest(target.agent.composition_identity().as_bytes()) != live.composition_digest
                {
                    return Err(Error::Checkpoint(
                        "effective model factory/resource changed".into(),
                    ));
                }
                base.live = Some(crate::program::LivePlan {
                    revision: live.revision,
                    command_id: live.command_id,
                    agent: budgets::restore(
                        base.agent
                            .clone()
                            .with_live_model_prompt(&target.agent)
                            .with_live_modules(
                                &target.agent,
                                &modules,
                                &hook_identities,
                                &context_policy_identities,
                            )?,
                        &target.agent,
                        &live.snapshot,
                        &modules.budgets,
                    )?,
                    snapshot: live.snapshot,
                });
            }
            Ok(base)
        })
        .await
        .map_err(|e| Error::Checkpoint(format!("effective restore task failed: {e}")))?
    }
    pub(super) async fn transition_action(
        &self,
        registry: &crate::registry::ModuleRegistry,
        job: &ExecutionJobRecord,
        record: &ManagedActionRecord,
    ) -> Result<ManagedActionRecord, Error> {
        let id = record.action.command_id.clone();
        let p = self.store.transaction(move |tx| proposal(tx, &id)).await?;
        let host = restore_scope(&p.snapshot, registry)?;
        let frozen = p.snapshot.clone();
        let target =
            tokio::task::spawn_blocking(move || compatibility::agent(&frozen)?.restore(&host))
                .await
                .map_err(|e| Error::Checkpoint(format!("live restore task failed: {e}")))??;
        let lease = self
            .store
            .acquire(
                job.submission.thread_key(),
                nofy_tool_protocol::ToolCallId::new_v7().to_string(),
                self.ttl,
            )
            .await?;
        let check = lease.clone();
        let clock = self.store.clock.clone();
        // Keep the root fence alive while an isolated evaluator is queued or
        // running; no write transaction is held across that wait.
        let proof = {
            let inspect = p.clone();
            let storage_identity = self
                .store
                .storage_identity()
                .ok_or_else(|| Error::Composition("live budget storage identity missing".into()))?;
            let validation = async {
                let boundary = self
                    .store
                    .transaction(move |tx| history::Boundary::read(tx, &inspect))
                    .await?;
                boundary
                    .validate(&p, &target.agent, registry, &storage_identity)
                    .await
            };
            tokio::pin!(validation);
            let mut ticker = tokio::time::interval(self.ttl / 3);
            loop {
                tokio::select! { biased;
                    _ = ticker.tick() => if let Err(error) = self.store.renew(&lease, self.ttl).await {
                        break Err(error);
                    },
                    result = &mut validation => break result,
                }
            }
        };
        let result = self.store.transaction(move |tx| {
            check_lease(tx, &check, clock.now_ms())?;
            let current = actions::read(tx, &p.action.command_id)?.ok_or_else(|| Error::Checkpoint("live command missing".into()))?;
            if current.finished { return Ok(current); }
            let earlier: bool = tx.query_row("SELECT EXISTS(SELECT 1 FROM agent_runtime_managed_actions WHERE run_id=?1 AND result IS NULL AND command_id!=?2 AND json_extract(payload,'$.command.kind')!='park' AND (sequence<?3 OR json_extract(payload,'$.command.kind')='abandon'))", params![current.action.run_id,current.action.command_id,current.sequence], |r| r.get(0)).map_err(db_error)?;
            if earlier { return Err(Error::Checkpoint("earlier management command is pending".into())); }
            tx.execute_batch("SAVEPOINT live_transition").map_err(db_error)?;
            let outcome = proof.and_then(|proof| apply(tx, &check, &p, &target.agent, &proof, clock.now_ms()));
            let result = match outcome {
                Ok(outcome) => { tx.execute_batch("RELEASE live_transition").map_err(db_error)?; ActionResult { outcome: Some(outcome), error: None, abandonment: None } }
                Err(error) => { tx.execute_batch("ROLLBACK TO live_transition; RELEASE live_transition").map_err(db_error)?; ActionResult { outcome: None, error: Some(error.to_string().chars().take(8192).collect()), abandonment: None } }
            };
            parking::finish_action(tx, &p.action.command_id, result)?;
            check_lease(tx, &check, clock.now_ms())?;
            actions::read(tx, &p.action.command_id)?.ok_or_else(|| Error::Checkpoint("live command disappeared".into()))
        }).await;
        let released = self.store.release(&lease).await;
        match result {
            Ok(value) => {
                released?;
                Ok(value)
            }
            Err(error) => Err(error),
        }
    }
}

fn apply(
    tx: &Transaction<'_>,
    lease: &Lease,
    p: &Proposal,
    target: &crate::Agent,
    proof: &history::Proof,
    now: u64,
) -> Result<RunOutcome, Error> {
    let selected = selection(&p.action.command)
        .ok_or_else(|| Error::Checkpoint("not a live transition".into()))?;
    ensure_thread_open(tx, &lease.key)?;
    let (_, hash, saved, status) =
        load(tx, &p.action.run_id)?.ok_or_else(|| Error::Checkpoint("live job missing".into()))?;
    if hash != p.submission_digest
        || saved.submission.thread_key() != lease.key
        || status != "waiting"
    {
        return Err(Error::Checkpoint("live execution ownership changed".into()));
    }
    let current = effective(tx, &p.action.run_id)?;
    if current.as_ref().map_or(0, |v| v.revision) != selected.expected_revision
        || selected.expected_revision >= 32
    {
        return Err(Error::Checkpoint(
            "live revision changed or capacity of 32 transitions reached".into(),
        ));
    }
    if digest(target.composition_identity().as_bytes()) != p.composition_digest {
        return Err(Error::Checkpoint("live target composition changed".into()));
    }
    let source = current
        .as_ref()
        .map_or(&saved.submission.snapshot, |live| &live.snapshot);
    let text = compatibility::validate(source, &p.snapshot, selected.update)?;
    let park = parking::read(tx, selected.park_command_id)?
        .ok_or_else(|| Error::Checkpoint("live park missing".into()))?;
    if park.run_id != p.action.run_id || park.status != parking::ParkStatus::Parked {
        return Err(Error::Checkpoint(
            "live park was released or rejected".into(),
        ));
    }
    let owner: String = tx
        .query_row(
            "SELECT active_run FROM agent_runtime_threads WHERE key=?1",
            [&lease.key],
            |r| r.get(0),
        )
        .map_err(db_error)?;
    let (revision, payload): (u64, String) = tx
        .query_row(
            "SELECT revision,payload FROM agent_runtime_checkpoints WHERE key=?1",
            [&lease.key],
            |r| Ok((r.get(0)?, r.get(1)?)),
        )
        .map_err(db_error)?;
    let (expected, expected_digest) = park_checkpoint(tx, &park)?;
    if owner != p.action.run_id
        || revision != expected
        || digest(payload.as_bytes()) != expected_digest
    {
        return Err(Error::Checkpoint(
            "parked checkpoint changed; explicit repair is required".into(),
        ));
    }
    let before: crate::Checkpoint = serde_json::from_str(&payload).map_err(db_error)?;
    let budget_suspended = park.receipt.as_ref().is_some_and(|r| r.budget_suspended);
    if before.version != 1
        || before.revision != revision
        || (!parking::safe(&before.state) && !budget_suspended)
        || (before.state.complete && !before.state.has_pending_work())
        || before.state.execution_run_id.as_deref() != Some(&p.action.run_id)
        || before.state.input_progress.initial.as_ref() != Some(&saved.proof()?)
        || digest(before.composition.as_bytes()) != saved.submission.composition_digest
    {
        return Err(Error::Checkpoint(
            "live boundary is not a safe root checkpoint".into(),
        ));
    }
    if budget_suspended {
        compatibility::validate_suspended_budget(source, &p.snapshot, selected.update)?;
    }
    proof.verify(tx, p)?;
    budgets::apply(tx, lease, p, now)?;
    let mut after = before.clone();
    let Some(crate::Message::System { content }) = after.state.messages.first_mut() else {
        return Err(Error::Composition(
            "live transition requires a retained leading System message".into(),
        ));
    };
    if let Some(text) = text {
        *content = text;
    }
    if selected.update.is_some_and(|update| update.tool_sources) {
        // No pending dispatch or prepared request survives a normal park.
        // The worker must admit a fresh view of the explicitly selected sources.
        after.state.tool_revision.clear();
    }
    if selected
        .update
        .is_some_and(|update| update.hook_subscriptions)
    {
        let progress = &mut after.state.hook_progress;
        if target.hook_bus().is_some() {
            progress.run_id = Some(p.action.run_id.clone());
            progress.turn = progress.turn.max(1);
            progress.session_started = true;
            progress.stop_done = false;
            progress
                .input_start_index
                .get_or_insert(after.state.messages.len());
        } else {
            // Retire future obligations, not a fabricated successful callback.
            progress.stop_done = true;
        }
    }
    after.revision = revision
        .checked_add(1)
        .filter(|v| *v <= i64::MAX as u64)
        .ok_or_else(|| Error::Checkpoint("checkpoint revision exhausted".into()))?;
    let after_payload = serde_json::to_string(&after).map_err(db_error)?;
    let modules = module_state(
        current.as_ref().and_then(|v| v.modules.as_ref()),
        &p.action,
        selected.expected_revision + 1,
        p.budget_plan.as_ref(),
    )?;
    let live = LiveExecution {
        protocol: live_protocol(&modules).into(),
        revision: selected.expected_revision + 1,
        command_id: p.action.command_id.clone(),
        run_id: p.action.run_id.clone(),
        submission_digest: hash,
        base_composition_digest: saved.submission.composition_digest,
        composition_digest: p.composition_digest.clone(),
        release: selected.release.to_owned(),
        program: selected.program.to_owned(),
        snapshot: p.snapshot.clone(),
        park_command_id: selected.park_command_id.to_owned(),
        before,
        before_digest: expected_digest,
        after: after.clone(),
        after_digest: digest(after_payload.as_bytes()),
        applied_at_ms: now,
        modules,
    };
    let live_payload = serde_json::to_string(&live).map_err(db_error)?;
    if live_payload.len() > 16 * 1024 * 1024 {
        return Err(Error::Checkpoint(
            "live transition evidence exceeds 16 MiB".into(),
        ));
    }
    let changed=tx.execute(
        "UPDATE agent_runtime_checkpoints SET revision=?1,payload=?2 WHERE key=?3 AND revision=?4",
        params![after.revision, after_payload, lease.key, revision],
    )
    .map_err(db_error)?;
    if changed != 1 {
        return Err(Error::Checkpoint("live checkpoint CAS failed".into()));
    }
    tx.execute("INSERT INTO agent_runtime_live_versions(run_id,revision,command_id,digest,payload) VALUES(?1,?2,?3,?4,?5)", params![live.run_id,live.revision,live.command_id,content_digest(&live)?,live_payload]).map_err(db_error)?;
    let outcome = RunOutcome::Paused {
        reason: serde_json::json!({"kind":"composition_transition","revision":live.revision,"command_id":live.command_id}),
        state: after.state,
    };
    let root_payload: String = tx
        .query_row(
            "SELECT payload FROM agent_runtime_runs WHERE id=?1",
            [&live.run_id],
            |r| r.get(0),
        )
        .map_err(db_error)?;
    let mut root: ExecutionRecord = serde_json::from_str(&root_payload).map_err(db_error)?;
    if root.submission.as_deref() != Some(&live.submission_digest)
        || root.composition != live.after.composition
        || root.run_id != live.run_id
        || root.thread_id != saved.submission.thread_id
        || content_digest(&root.snapshot)? != content_digest(&saved.submission.snapshot)?
        || root.status != "paused"
    {
        return Err(Error::Checkpoint(
            "live root execution identity changed".into(),
        ));
    }
    root.outcome = Some(outcome.clone());
    tx.execute(
        "UPDATE agent_runtime_runs SET payload=?1 WHERE id=?2",
        params![serde_json::to_string(&root).map_err(db_error)?, live.run_id],
    )
    .map_err(db_error)?;
    Ok(outcome)
}
