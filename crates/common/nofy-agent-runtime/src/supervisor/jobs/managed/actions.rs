use super::*;

// A pending park is observed by the live driver. On recovery it must yield to
// evidence and other ordinary controls; it cannot strand their original FIFO.
const READY_ACTION: &str = "a.result IS NULL
    AND (json_extract(a.payload,'$.command.kind')!='park' OR EXISTS(
        SELECT 1 FROM agent_runtime_jobs j WHERE j.run_id=a.run_id
        AND j.status NOT IN ('running','initializing')))
    AND NOT EXISTS(
        SELECT 1 FROM agent_runtime_managed_actions p
        WHERE p.run_id=a.run_id AND p.result IS NULL AND p.command_id!=a.command_id
        AND json_extract(p.payload,'$.command.kind')!='park'
        AND ((json_extract(a.payload,'$.command.kind')='abandon'
              AND json_extract(p.payload,'$.command.kind')='abandon' AND p.sequence<a.sequence)
            OR json_extract(a.payload,'$.command.kind')='park'
            OR (json_extract(a.payload,'$.command.kind') NOT IN ('abandon','park')
                AND (p.sequence<a.sequence OR json_extract(p.payload,'$.command.kind')='abandon'))))";
pub(super) fn action_digest(action: &ManagedAction) -> Result<String, Error> {
    bounded_name(&action.command_id)?;
    bounded_name(&action.run_id)?;
    match &action.command {
        ManagedCommand::Unpark { park_command_id } => bounded_name(park_command_id)?,
        ManagedCommand::Transition {
            park_command_id,
            expected_revision,
            release,
            program,
        }
        | ManagedCommand::UpdateModules {
            park_command_id,
            expected_revision,
            release,
            program,
            ..
        } => {
            bounded_name(park_command_id)?;
            bounded_name(program)?;
            if *expected_revision >= 32
                || release.len() != 64
                || !release.bytes().all(|b| b.is_ascii_hexdigit())
            {
                return Err(Error::Composition(
                    "transition requires an exact release digest and revision below 32".into(),
                ));
            }
            if let ManagedCommand::UpdateModules { update, .. } = &action.command
                && !update.tool_catalog
                && !update.hook_subscriptions
                && !update.policy_set
                && !update.budget_limits
                && !update.context_sources
                && !update.context_policies
                && !update.tool_sources
            {
                return Err(Error::Composition(
                    "module update requires an explicit capability selection".into(),
                ));
            }
        }
        ManagedCommand::Abandon {
            reason,
            acknowledge_unresolved,
        } => {
            if !acknowledge_unresolved || reason.trim().is_empty() || reason.len() > 4096 {
                return Err(Error::Composition("abandon requires a reason of 1..=4096 bytes and acknowledgement of unresolved effects".into()));
            }
        }
        ManagedCommand::ReconcileModel { receipt } => receipt.validate()?,
        ManagedCommand::ReconcileHook { receipt } => receipt.validate()?,
        ManagedCommand::ReconcileRootTool { receipt } => {
            crate::tool_program::validate_call(&receipt.call)?;
        }
        ManagedCommand::ReconcileChild { receipt } => {
            bounded_name(&receipt.child_run_id)?;
            if receipt.model_sequence.is_none() {
                return Err(Error::Composition(
                    "managed child reconciliation requires model_sequence".into(),
                ));
            }
            crate::tool_program::validate_call(&receipt.call)?;
        }
        #[cfg(feature = "workflow")]
        ManagedCommand::Human {
            target_run_id,
            workflow_path,
            ..
        } => {
            bounded_name(target_run_id)?;
            if workflow_path.len() > 16 {
                return Err(Error::Composition(
                    "human workflow path exceeds 16 modules".into(),
                ));
            }
        }
        ManagedCommand::ResumeAfterCancel { through }
            if *through == 0 || *through > i64::MAX as u64 =>
        {
            return Err(Error::Composition("invalid cancel resume cursor".into()));
        }
        ManagedCommand::Control { control } => {
            let id = match control {
                crate::supervisor::RunControlCommand::RetryModel(c) => &c.command_id,
                crate::supervisor::RunControlCommand::ResumeChildCancel(c) => &c.command_id,
            };
            if id != &action.command_id {
                return Err(Error::Composition("control command IDs disagree".into()));
            }
        }
        _ => {}
    }
    if serde_json::to_vec(action).map_err(db_error)?.len() > 1024 * 1024 {
        return Err(Error::Composition("management action exceeds 1 MiB".into()));
    }
    content_digest(action)
}
pub(super) fn read(
    tx: &rusqlite::Transaction<'_>,
    id: &str,
) -> Result<Option<ManagedActionRecord>, Error> {
    let row:Option<(u64,String,String,Option<String>)>=tx.query_row(
        "SELECT sequence,digest,payload,result FROM agent_runtime_managed_actions WHERE command_id=?1",[id],
        |r|Ok((r.get(0)?,r.get(1)?,r.get(2)?,r.get(3)?))).optional().map_err(db_error)?;
    row.map(|(sequence, hash, payload, result)| {
        let action: ManagedAction = serde_json::from_str(&payload).map_err(db_error)?;
        if action.command_id != id || action_digest(&action)? != hash {
            return Err(Error::Checkpoint(
                "management action identity changed".into(),
            ));
        }
        let finished = result.is_some();
        let result = result
            .map(|v| serde_json::from_str::<ActionResult>(&v).map_err(db_error))
            .transpose()?;
        Ok(ManagedActionRecord {
            sequence,
            action,
            finished,
            outcome: result.as_ref().and_then(|r| r.outcome.clone()),
            error: result.as_ref().and_then(|r| r.error.clone()),
            abandonment: result.and_then(|r| r.abandonment),
        })
    })
    .transpose()
}
impl SqliteStore {
    pub async fn managed_action_heads(
        &self,
        after: u64,
        limit: usize,
    ) -> Result<Vec<(u64, String, String)>, Error> {
        if !(1..=256).contains(&limit) {
            return Err(Error::Composition(
                "action page limit must be 1..=256".into(),
            ));
        }
        let after = i64::try_from(after).map_err(db_error)?;
        self.transaction(move|tx| {
            let sql=format!("SELECT a.sequence,a.run_id,a.command_id FROM agent_runtime_managed_actions a WHERE a.sequence>?1 AND {READY_ACTION} ORDER BY a.sequence LIMIT ?2");
            let mut s=tx.prepare(&sql).map_err(db_error)?;
            s.query_map(params![after,limit],|r|Ok((r.get(0)?,r.get(1)?,r.get(2)?))).map_err(db_error)?.collect::<Result<Vec<_>,_>>().map_err(db_error)
        }).await
    }
    pub async fn enqueue_managed_action(
        &self,
        action: ManagedAction,
    ) -> Result<ManagedActionRecord, Error> {
        self.transaction(move |tx| enqueue(tx, &action, false))
            .await
    }
    pub async fn managed_action(&self, id: &str) -> Result<Option<ManagedActionRecord>, Error> {
        let id = id.to_owned();
        self.transaction(move |tx| read(tx, &id)).await
    }
    pub async fn pending_managed_actions(
        &self,
        limit: usize,
    ) -> Result<Vec<ManagedActionRecord>, Error> {
        if !(1..=256).contains(&limit) {
            return Err(Error::Composition(
                "action page limit must be 1..=256".into(),
            ));
        }
        self.transaction(move|tx|{
            let sql=format!("SELECT a.command_id FROM agent_runtime_managed_actions a WHERE {READY_ACTION} ORDER BY a.sequence LIMIT ?1");
            let mut s=tx.prepare(&sql).map_err(db_error)?;
            let ids=s.query_map([limit],|r|r.get::<_,String>(0)).map_err(db_error)?.collect::<Result<Vec<_>,_>>().map_err(db_error)?;
            ids.into_iter().map(|id|read(tx,&id)?.ok_or_else(||Error::Checkpoint("management command disappeared".into()))).collect()
        }).await
    }
}
pub(super) fn enqueue(
    tx: &rusqlite::Transaction<'_>,
    action: &ManagedAction,
    trusted_transition: bool,
) -> Result<ManagedActionRecord, Error> {
    let hash = action_digest(action)?;
    if let Some(old) = read(tx, &action.command_id)? {
        if action_digest(&old.action)? != hash {
            return Err(Error::Checkpoint("management command ID reused".into()));
        }
        return Ok(old);
    }
    if transition::selection(&action.command).is_some() && !trusted_transition {
        return Err(Error::Composition(
            "transition requires submit_transition with a published system".into(),
        ));
    }
    if read_request(tx, &action.run_id)?.is_none() {
        return Err(Error::Checkpoint("managed run not found".into()));
    }
    let job_state: String = tx
        .query_row(
            "SELECT status FROM agent_runtime_jobs WHERE run_id=?1",
            [&action.run_id],
            |r| r.get(0),
        )
        .map_err(db_error)?;
    if job_state == "abandoned" && !matches!(action.command, ManagedCommand::Abandon { .. }) {
        return Err(Error::Checkpoint(
            "run was abandoned; its thread is sealed".into(),
        ));
    }
    let exists: bool = tx
        .query_row(
            "SELECT EXISTS(SELECT 1 FROM agent_runtime_runs WHERE id=?1)",
            [&action.run_id],
            |r| r.get(0),
        )
        .map_err(db_error)?;
    if !exists {
        return Err(Error::Checkpoint("managed run has not initialized".into()));
    }
    let count: u64 = tx
        .query_row(
            "SELECT COUNT(*) FROM agent_runtime_managed_actions",
            [],
            |r| r.get(0),
        )
        .map_err(db_error)?;
    if count >= 32768 {
        return Err(Error::Checkpoint(
            "management command capacity exceeded".into(),
        ));
    }
    parking::admit(tx, action)?;
    tx.execute("INSERT INTO agent_runtime_managed_actions(command_id,run_id,digest,payload) VALUES(?1,?2,?3,?4)",
                params![action.command_id,action.run_id,hash,serde_json::to_string(&action).map_err(db_error)?]).map_err(db_error)?;
    read(tx, &action.command_id)?
        .ok_or_else(|| Error::Checkpoint("management command disappeared".into()))
}
impl RunSupervisor {
    /// Claim the original root lease before dispatch and persist the command
    /// receipt under that same fence. A crash leaves an unacknowledged command
    /// for explicit replay through the original controller/checkpoint proofs.
    pub async fn execute_managed_action(
        &self,
        registry: &crate::registry::ModuleRegistry,
        id: &str,
    ) -> Result<ManagedActionRecord, Error> {
        let record = self
            .store
            .managed_action(id)
            .await?
            .ok_or_else(|| Error::Checkpoint("management command missing".into()))?;
        if record.finished {
            return Ok(record);
        }
        let job = self
            .store
            .execution_job(&record.action.run_id)
            .await?
            .ok_or_else(|| Error::Checkpoint("management job missing".into()))?;
        if self
            .store
            .managed_run(&record.action.run_id)
            .await?
            .is_none()
        {
            return Err(Error::Checkpoint("management request missing".into()));
        }
        if matches!(record.action.command, ManagedCommand::Abandon { .. })
            || matches!(job.status, JobStatus::Abandoned)
        {
            return self.administrative_action(&job, &record).await;
        }
        if matches!(
            record.action.command,
            ManagedCommand::Park | ManagedCommand::Unpark { .. }
        ) {
            return self.parking_action(&job, &record).await;
        }
        if transition::selection(&record.action.command).is_some() {
            return self.transition_action(registry, &job, &record).await;
        }
        let registry = restore_scope(&job.submission.snapshot, registry)?;
        let compiled = self.restore_job_plan(&registry, &job).await?;
        let prepared = PreparedAction {
            #[cfg(feature = "workflow")]
            human: human::prepare(
                compiled.effective_snapshot(),
                &record.action.command,
                &registry,
            )
            .await,
        };
        let lease = self
            .store
            .acquire(
                job.submission.thread_key(),
                nofy_tool_protocol::ToolCallId::new_v7().to_string(),
                self.ttl,
            )
            .await?;
        let result = self
            .managed_action_leased(&compiled, &job, &record, &lease, prepared)
            .await;
        let released = self.store.release(&lease).await;
        match result {
            Ok(record) => {
                released?;
                Ok(record)
            }
            Err(error) => Err(error),
        }
    }
    async fn managed_action_leased(
        &self,
        compiled: &ExecutionPlan,
        job: &ExecutionJobRecord,
        record: &ManagedActionRecord,
        lease: &Lease,
        _prepared: PreparedAction,
    ) -> Result<ManagedActionRecord, Error> {
        let id = record.action.command_id.clone();
        let check = lease.clone();
        let clock = self.store.clock.clone();
        let expected = compiled.live_identity();
        let current=self.store.transaction(move|tx|{
            check_lease(tx,&check,clock.now_ms())?;
            let current=read(tx,&id)?.ok_or_else(||Error::Checkpoint("management command disappeared".into()))?;
            if current.finished { return Ok(current); }
            verify_plan(tx,&current.action.run_id,expected.as_ref())?;
            let earlier:bool=tx.query_row("SELECT EXISTS(SELECT 1 FROM agent_runtime_managed_actions WHERE run_id=?1 AND (sequence<?2 OR json_extract(payload,'$.command.kind')='abandon') AND result IS NULL AND json_extract(payload,'$.command.kind')!='park')",params![current.action.run_id,current.sequence],|r|r.get(0)).map_err(db_error)?;
            if earlier {return Err(Error::Checkpoint("earlier management command is pending".into()));}
            Ok(current)
        }).await?;
        if current.finished {
            return Ok(current);
        }
        let result = async {
            if matches!(job.status, JobStatus::Closed)
                && (self.model_command_accepted(&current.action).await?
                    || self.hook_command_accepted(&current.action).await?)
            {
                let root = self
                    .store
                    .execution_record(&current.action.run_id)
                    .await?
                    .ok_or_else(|| Error::Checkpoint("closed management run missing".into()))?;
                return super::super::replay::cached_outcome(root, &job.submission, &job.digest);
            }
            let check = lease.clone();
            let clock = self.store.clock.clone();
            self.store
                .transaction(move |tx| {
                    check_lease(tx, &check, clock.now_ms())?;
                    ensure_thread_open(tx, &check.key)
                        .and_then(|()| ensure_not_parked(tx, &check.key))
                })
                .await?;
            let mut context = RunContext::new(&job.submission.thread_id, &job.submission.run_id);
            let input = match &current.action.command {
                ManagedCommand::Park
                | ManagedCommand::Unpark { .. }
                | ManagedCommand::Transition { .. }
                | ManagedCommand::UpdateModules { .. } => {
                    return Err(Error::Checkpoint(
                        "park must use its fenced control path".into(),
                    ));
                }
                ManagedCommand::Abandon { .. } => {
                    return Err(Error::Checkpoint(
                        "abandon must use the administrative path".into(),
                    ));
                }
                ManagedCommand::ReconcileModel { receipt } => {
                    self.accept_model_reconciliation_leased(
                        compiled,
                        &context,
                        receipt.clone(),
                        &current.action.command_id,
                        lease,
                    )
                    .await?;
                    RunInput::resume()
                }
                ManagedCommand::ReconcileRootTool { receipt } => {
                    self.accept_root_tool_reconciliation_leased(
                        compiled,
                        &context,
                        receipt.clone(),
                        lease,
                    )
                    .await?;
                    RunInput::resume()
                }
                ManagedCommand::ReconcileHook { receipt } => {
                    self.accept_hook_reconciliation_leased(
                        compiled,
                        &context,
                        receipt.clone(),
                        &current.action.command_id,
                        lease,
                    )
                    .await?;
                    RunInput::resume()
                }
                ManagedCommand::ReconcileChild { receipt } => {
                    self.accept_child_reconciliation_leased(
                        compiled,
                        &context,
                        receipt.clone(),
                        lease,
                    )
                    .await?;
                    RunInput::resume()
                }
                ManagedCommand::Resume => RunInput::resume(),
                ManagedCommand::ResumeAfterCancel { through } => {
                    RunInput::resume_after_cancel(*through)
                }
                #[cfg(feature = "workflow")]
                ManagedCommand::Human { .. } => {
                    let workflow = _prepared.human.ok_or_else(|| {
                        Error::Checkpoint("human response binding missing".into())
                    })??;
                    human::respond(self, compiled, job, lease, &current.action, workflow).await?;
                    RunInput::resume()
                }
                ManagedCommand::Control {
                    control: crate::supervisor::RunControlCommand::RetryModel(c),
                } => RunInput::retry_model(c.clone()),
                ManagedCommand::Control {
                    control: crate::supervisor::RunControlCommand::ResumeChildCancel(c),
                } => {
                    context
                        .capabilities
                        .insert(crate::supervisor::control::PendingChildCancel(c.clone()));
                    RunInput::resume()
                }
            };
            self.invoke_plan_leased(compiled, input, context, lease)
                .await
        }
        .await;
        let result = match result {
            Ok(outcome) => ActionResult {
                outcome: Some(outcome),
                error: None,
                abandonment: None,
            },
            Err(error) => ActionResult {
                outcome: None,
                error: Some(error.to_string().chars().take(8192).collect()),
                abandonment: None,
            },
        };
        let id = current.action.command_id.clone();
        let hash = action_digest(&current.action)?;
        let check = lease.clone();
        let clock = self.store.clock.clone();
        self.store.transaction(move|tx|{
            check_lease(tx,&check,clock.now_ms())?;
            let changed=tx.execute("UPDATE agent_runtime_managed_actions SET result=?1 WHERE command_id=?2 AND digest=?3 AND result IS NULL",params![serde_json::to_string(&result).map_err(db_error)?,id,hash]).map_err(db_error)?;
            if changed!=1 {return Err(Error::Checkpoint("management command receipt changed".into()));}
            read(tx,&id)?.ok_or_else(||Error::Checkpoint("management command disappeared".into()))
        }).await
    }
}
