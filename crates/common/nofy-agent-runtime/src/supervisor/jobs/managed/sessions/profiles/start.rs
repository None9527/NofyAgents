//! The prepare record survives a lost connection; dispatch waits for one commit.
use super::commands::{Operation, SessionError, operation, previous, save_operation};
use super::*;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SessionStart {
    pub session_id: String,
    pub command_id: String,
    pub expected_session_revision: (),
    pub request_json: String,
    #[serde(default)]
    pub labels: Labels,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub(super) struct Prepared {
    request: ManagedRunRequest,
    submission: ExecutionSubmission,
    policy: Option<policy::Frozen>,
    input: policy::Input,
    proposal: Option<policy::Proposal>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    branch: Option<super::super::branches::BranchSeed>,
}
fn start_hash(command: &SessionStart) -> Result<(serde_json::Value, String), Error> {
    bounded_name(&command.session_id)?;
    bounded_name(&command.command_id)?;
    labels(&command.labels)?;
    let value = serde_json::to_value(command).map_err(db_error)?;
    let hash = content_digest(&("session.start", &value))?;
    Ok((value, hash))
}
fn branch_identity(
    command: &SessionStart,
    branch: Option<&super::super::branches::ForkSource>,
) -> Result<(serde_json::Value, String), Error> {
    let (body, hash) = start_hash(command)?;
    if let Some(branch) = branch {
        let operation = if branch.through_message.is_some() {
            "session.rewind"
        } else {
            "session.fork"
        };
        let body = serde_json::json!({"start":body,"source":branch});
        let hash = content_digest(&(operation, &body))?;
        Ok((body, hash))
    } else {
        Ok((body, hash))
    }
}
impl RunSupervisor {
    pub async fn replay_session_fork(
        &self,
        command: &super::super::branches::SessionFork,
    ) -> Result<Option<SessionReceipt>, Error> {
        let (_, hash) = branch_identity(&command.start, Some(&command.source))?;
        let id = command.start.command_id.clone();
        self.store
            .transaction(move |tx| Ok(previous(tx, &id, &hash)?.filter(|r| r.phase != "prepared")))
            .await
    }
    pub async fn replay_session_start(
        &self,
        command: &SessionStart,
    ) -> Result<Option<SessionReceipt>, Error> {
        let (_, hash) = start_hash(command)?;
        let id = command.command_id.clone();
        self.store
            .transaction(move |tx| Ok(previous(tx, &id, &hash)?.filter(|r| r.phase != "prepared")))
            .await
    }
    pub async fn start_session(
        &self,
        command: SessionStart,
        system: &CompiledSystem,
    ) -> Result<SessionReceipt, Error> {
        self.start_session_branch(command, system, None).await
    }
    pub(in crate::supervisor::jobs::managed::sessions) async fn start_session_branch(
        &self,
        command: SessionStart,
        system: &CompiledSystem,
        branch: Option<super::super::branches::ForkSource>,
    ) -> Result<SessionReceipt, Error> {
        let (body, hash) = branch_identity(&command, branch.as_ref())?;
        let id = command.command_id.clone();
        let original_hash = hash.clone();
        let old = self
            .store
            .transaction(move |tx| {
                Ok(previous(tx, &id, &original_hash)?.filter(|r| r.phase != "prepared"))
            })
            .await?;
        if let Some(old) = old {
            return Ok(old);
        }
        let request: ManagedRunRequest = serde_json::from_str(&command.request_json)
            .map_err(|e| Error::Composition(e.to_string()))?;
        request_digest(&request)?;
        if request.system != system.bundle.document.name || request.release != system.bundle.digest
        {
            return Err(Error::Composition(
                "session start release/system mismatch".into(),
            ));
        }
        let source = system.clone();
        let name = request.program.clone();
        let parameters = request.parameters.clone();
        let program =
            tokio::task::spawn_blocking(move || source.program_with_parameters(&name, parameters))
                .await
                .map_err(|e| Error::Checkpoint(e.to_string()))??;
        let submission = ProgramSubmission::for_program(
            &program,
            &request.thread_id,
            &request.run_id,
            request.input.clone(),
        )?
        .stored();
        let snapshot = policy::agent_snapshot(&submission.snapshot)
            .ok_or_else(|| Error::Composition("session start requires an Agent program".into()))?;
        let branch = if let Some(branch) = branch {
            Some(super::super::branches::prepare(&self.store, branch, &submission, &request).await?)
        } else {
            None
        };
        if let Some(seed) = &branch {
            // Protocol validation is pure and runs outside the SQLite transaction.
            program.agent.validate_live_history(&seed.messages).await?;
        }
        let frozen = if let Some(branch) = &branch {
            branch.policy.clone()
        } else {
            policy::Frozen::from_snapshot(snapshot, &request.release)?
        };
        let input = make_input(
            policy::Phase::Create,
            None,
            None,
            Some(command.session_id.clone()),
            hash.clone(),
            command.labels.clone(),
            self.store.clock.now_ms(),
        );
        let candidate = Operation {
            receipt: SessionReceipt {
                session_id: command.session_id.clone(),
                command_id: command.command_id.clone(),
                operation: if branch
                    .as_ref()
                    .is_some_and(|b| b.source.through_message.is_some())
                {
                    "session.rewind"
                } else if branch.is_some() {
                    "session.fork"
                } else {
                    "session.start"
                }
                .into(),
                request_digest: hash.clone(),
                phase: "prepared".into(),
                session_revision: None,
                policy_revision: None,
                session: None,
                run_id: Some(request.run_id.clone()),
                error: None,
            },
            request: body,
            prepared: Some(Prepared {
                request,
                submission,
                policy: frozen,
                input,
                proposal: None,
                branch,
            }),
        };
        let id = command.command_id.clone();
        let proposed = candidate.clone();
        let mut op = self
            .store
            .transaction(move |tx| {
                if let Some(old) = previous(tx, &id, &proposed.receipt.request_digest)? {
                    let stored = operation(tx, &id)?
                        .ok_or_else(|| Error::Checkpoint("start intent missing".into()))?;
                    if old.phase == "prepared" && stored.prepared.is_none() {
                        return Err(Error::Checkpoint("start preparation missing".into()));
                    }
                    return Ok(stored);
                }
                save_operation(tx, &proposed)?;
                Ok(proposed)
            })
            .await?;
        if op.receipt.phase != "prepared" {
            return Ok(op.receipt);
        }
        let prepared = op
            .prepared
            .as_mut()
            .ok_or_else(|| Error::Checkpoint("start preparation missing".into()))?;
        if prepared.proposal.is_none() {
            match self
                .evaluate_policy(prepared.policy.as_ref(), prepared.input.clone(), None)
                .await
            {
                Ok(p) => prepared.proposal = Some(p),
                Err(e) => {
                    prepared.proposal = Some(policy::Proposal {
                        decision: policy::Decision::Deny,
                        reason: policy::diagnostic(e),
                        session_id: prepared.input.request.session_id.clone(),
                        display_name: None,
                        archive: false,
                    })
                }
            }
            let evaluated = op.clone();
            let id = command.command_id.clone();
            op = self
                .store
                .transaction(move |tx| {
                    let mut current = operation(tx, &id)?
                        .ok_or_else(|| Error::Checkpoint("start intent missing".into()))?;
                    if current.receipt.phase == "prepared"
                        && current
                            .prepared
                            .as_ref()
                            .is_some_and(|p| p.proposal.is_none())
                    {
                        current.prepared = evaluated.prepared;
                        save_operation(tx, &current)?;
                    }
                    Ok(current)
                })
                .await?;
        }
        if op.receipt.phase != "prepared" {
            return Ok(op.receipt);
        }
        let p = op
            .prepared
            .as_ref()
            .ok_or_else(|| Error::Checkpoint("start preparation missing".into()))?;
        if p.proposal
            .as_ref()
            .is_none_or(|p| p.decision != policy::Decision::Allow)
        {
            return self
                .reject_start(
                    &command.command_id,
                    "policy_rejected",
                    p.proposal
                        .as_ref()
                        .map_or("missing decision", |p| p.reason.as_str()),
                )
                .await;
        }
        let lease = self
            .store
            .acquire(
                p.submission.thread_key(),
                nofy_tool_protocol::ToolCallId::new_v7().to_string(),
                self.ttl,
            )
            .await?;
        let check = lease.clone();
        let id = command.command_id.clone();
        let clock = self.store.clock.clone();
        let result=self.store.transaction(move|tx|{
            let mut op=operation(tx,&id)?.ok_or_else(||Error::Checkpoint("start intent missing".into()))?;
            if op.receipt.phase!="prepared"{return Ok(op.receipt);}
            let p=op.prepared.clone().ok_or_else(||Error::Checkpoint("start preparation missing".into()))?;
            let now=clock.now_ms();check_lease(tx,&check,now)?;
            if read(tx,&op.receipt.session_id)?.is_some()||load(tx,&p.request.run_id)?.is_some(){return Err(Error::Checkpoint("session or first root already exists; use explicit enrollment".into()));}
            let count:u64=tx.query_row("SELECT COUNT(*) FROM agent_runtime_managed_runs",[],|r|r.get(0)).map_err(db_error)?;
            if count>=10000{return Err(Error::Checkpoint("managed run capacity exceeded".into()));}
            if let Some(branch)=&p.branch {super::super::branches::install(tx,branch,&op.receipt.session_id,&id,&p.request,now)?;}
            insert(tx,Saved{submission:p.submission,source:None},now)?;
            tx.execute("INSERT INTO agent_runtime_managed_runs(run_id,digest,payload) VALUES(?1,?2,?3)",params![p.request.run_id,request_digest(&p.request)?,serde_json::to_string(&p.request).map_err(db_error)?]).map_err(db_error)?;
            let b=enroll(tx,SessionRequest{id:op.receipt.session_id.clone(),root_run_id:p.request.run_id},&check,now)?;
            install(tx,&b,p.policy,command.labels,p.input,p.proposal.ok_or_else(||policy::invalid("missing create decision"))?,now)?;
            let profile=profile(tx,&b)?;
            op.receipt.phase="applied".into();op.receipt.session_revision=Some(profile.revision.to_string());
            op.receipt.policy_revision=Some(profile.policy_revision.to_string());op.receipt.session=Some(state(tx,&b,&profile)?);
            save_operation(tx,&op)?;check_lease(tx,&check,clock.now_ms())?;Ok(op.receipt)
        }).await;
        let released = self.store.release(&lease).await;
        match result {
            Ok(receipt) => {
                released?;
                Ok(receipt)
            }
            Err(e) => {
                self.reject_start(&command.command_id, "conflict", &e.to_string())
                    .await
            }
        }
    }
    async fn reject_start(
        &self,
        id: &str,
        code: &str,
        message: &str,
    ) -> Result<SessionReceipt, Error> {
        let id = id.to_owned();
        let code = code.to_owned();
        let message = message.to_owned();
        self.store
            .transaction(move |tx| {
                let mut op = operation(tx, &id)?
                    .ok_or_else(|| Error::Checkpoint("start intent missing".into()))?;
                if op.receipt.phase == "prepared" {
                    op.receipt.phase = "rejected".into();
                    op.receipt.error = Some(SessionError { code, message });
                    save_operation(tx, &op)?;
                }
                Ok(op.receipt)
            })
            .await
    }
}
