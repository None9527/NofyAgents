use super::*;
use crate::durable::Lease;
use crate::governance::{BudgetCost, BudgetReceipt, sqlite::PrimitiveState};

fn command_key(root: &str, id: &str) -> String {
    serde_json::to_string(&("hook-resolution-v1", root, id)).expect("string tuple")
}

#[derive(Serialize, Deserialize)]
struct Resolution {
    root: String,
    command: String,
    receipt: HookReconciliation,
}

fn kind(
    tx: &Transaction<'_>,
    frame: &Frame,
    saved: &crate::hooks::journal::Saved,
) -> Result<Option<HookRecoveryKind>, Error> {
    if saved.resolved {
        return Ok(None);
    }
    if saved.error.is_some() || matches!(saved.decision, Some(HookDecision::Pause { .. })) {
        return Ok(frame.result.as_ref().map(|_| HookRecoveryKind::Gate));
    }
    if saved.decision.is_some() {
        return Ok(None);
    }
    if frame.result.is_some() {
        return Ok(Some(HookRecoveryKind::Recorded));
    }
    if frame.intent.scopes.is_empty() {
        return Ok(Some(HookRecoveryKind::Effect));
    }
    match crate::governance::sqlite::inspect_primitive(
        tx,
        &frame.intent.scopes,
        &frame.intent.operation,
        &frame.intent.fingerprint,
    )? {
        PrimitiveState::Recorded(_) => Ok(Some(HookRecoveryKind::Recorded)),
        PrimitiveState::Uncertain => Ok(Some(HookRecoveryKind::Effect)),
        PrimitiveState::Undispatched => Ok(None),
    }
}

fn verify_root(
    tx: &Transaction<'_>,
    root: &str,
    composition: &str,
    key: &str,
) -> Result<(), Error> {
    let owner: Option<String> = tx
        .query_row(
            "SELECT active_run FROM agent_runtime_threads WHERE key=?1",
            [key],
            |r| r.get(0),
        )
        .optional()
        .map_err(db_error)?;
    let matches:bool=tx.query_row("SELECT EXISTS(SELECT 1 FROM agent_runtime_runs WHERE id=?1 AND json_extract(payload,'$.composition')=?2)",params![root,composition],|r|r.get(0)).map_err(db_error)?;
    if owner.as_deref() != Some(root) || !matches {
        return Err(checkpoint("Hook recovery root no longer owns this thread"));
    }
    Ok(())
}

pub(crate) async fn targets(
    store: &SqliteStore,
    root: &str,
    after: Option<&str>,
    limit: usize,
) -> Result<HookRecoveryPage, Error> {
    crate::system::bounded_name(root)?;
    if !(1..=256).contains(&limit) || after.is_some_and(|id| !digest_id(id)) {
        return Err(checkpoint("invalid Hook recovery page"));
    }
    let root = root.to_owned();
    let after = after.map(effect_key).unwrap_or_default();
    store.transaction(move|tx| {
        let mut rows=tx.prepare("SELECT key,revision,payload FROM agent_runtime_checkpoints WHERE key>?1 AND key LIKE 'hook-effect-v1:%' AND json_extract(payload,'$.state.data.intent.root')=?2 ORDER BY key LIMIT ?3").map_err(db_error)?;
        let values=rows.query_map(params![after,root,limit+1],|r|Ok((r.get::<_,String>(0)?,r.get::<_,u64>(1)?,r.get::<_,String>(2)?))).map_err(db_error)?.collect::<Result<Vec<_>,_>>().map_err(db_error)?;
        let mut result=Vec::new();let mut next=None;let mut bytes=32768;
        for (index,(key,revision,payload)) in values.into_iter().enumerate() {
            if index==limit {return Ok(HookRecoveryPage {schema_version:1,targets:result,next});}
            let cp:Checkpoint=serde_json::from_str(&payload).map_err(db_error)?;
            if cp.version!=1||cp.revision!=revision{return Err(checkpoint("Hook recovery checkpoint metadata changed"));}
            let frame=decode(&cp)?;
            if key!=effect_key(&frame.intent.id)||frame.intent.root!=root{return Err(checkpoint("Hook recovery source key changed"));}
            let (outer,saved)=outer(tx,&frame.intent)?;
            let active:bool=tx.query_row("SELECT EXISTS(SELECT 1 FROM agent_runtime_runs r JOIN agent_runtime_threads t ON t.key=r.thread_key AND t.active_run=r.id WHERE r.id=?1 AND json_extract(r.payload,'$.composition')=?2)",params![root,frame.intent.root_composition],|r|r.get(0)).map_err(db_error)?;
            if active&&source_matches(tx,&frame.intent,&saved.event)?
                && let Some(kind)=kind(tx,&frame,&saved)? {
                    let target=HookRecoveryTarget {ticket:HookRecoveryTicket {id:frame.intent.id.clone(),effect_revision:cp.revision,hook_revision:outer.revision,intent_digest:crate::system::content_digest(&frame.intent)?,kind},event:saved.event,tool:frame.intent.tool};
                    let size=serde_json::to_vec(&target).map_err(db_error)?.len();
                    if size>8*1024*1024-32768{return Err(checkpoint("Hook recovery target exceeds response limit"));}
                    if bytes+size>8*1024*1024{return Ok(HookRecoveryPage {schema_version:1,targets:result,next});}
                    bytes+=size;result.push(target);
                }
            next=Some(frame.intent.id);
        }
        Ok(HookRecoveryPage {schema_version:1,targets:result,next:None})
    }).await
}

pub(crate) async fn accepted(
    store: &SqliteStore,
    root: &str,
    command: &str,
    receipt: &HookReconciliation,
) -> Result<bool, Error> {
    let key = command_key(root, command);
    let root = root.to_owned();
    let command = command.to_owned();
    let receipt = receipt.clone();
    store
        .transaction(move |tx| {
            let Some(cp) = load(tx, &key)? else {
                return Ok(false);
            };
            let composition: String = tx.query_row(
                "SELECT json_extract(payload,'$.composition') FROM agent_runtime_runs WHERE id=?1",
                [&root], |row| row.get(0),
            ).map_err(db_error)?;
            if cp.composition != composition {
                return Err(checkpoint("Hook recovery command composition changed"));
            }
            let saved: Resolution = serde_json::from_value(cp.state.data).map_err(db_error)?;
            if saved.root != root || saved.command != command || saved.receipt != receipt {
                return Err(checkpoint("Hook recovery command receipt cannot change"));
            }
            Ok(true)
        })
        .await
}

pub(crate) async fn target(
    store: &SqliteStore,
    root: &str,
    ticket: &HookRecoveryTicket,
) -> Result<HookRecoveryTarget, Error> {
    let root = root.to_owned();
    let ticket = ticket.clone();
    store
        .transaction(move |tx| {
            let cp = load(tx, &effect_key(&ticket.id))?
                .ok_or_else(|| checkpoint("Hook effect intent missing"))?;
            let frame = decode(&cp)?;
            let (outer, saved) = outer(tx, &frame.intent)?;
            if frame.intent.root != root
                || ticket.effect_revision != cp.revision
                || ticket.hook_revision != outer.revision
                || ticket.intent_digest != crate::system::content_digest(&frame.intent)?
                || kind(tx, &frame, &saved)?.as_ref() != Some(&ticket.kind)
                || !source_matches(tx, &frame.intent, &saved.event)?
            {
                return Err(checkpoint(
                    "Hook recovery ticket is stale or belongs to another source",
                ));
            }
            Ok(HookRecoveryTarget {
                ticket,
                event: saved.event,
                tool: frame.intent.tool,
            })
        })
        .await
}

fn result_value(intent: &Intent, resolution: &HookResolution) -> Result<Value, Error> {
    let result: Result<TypedToolOutput, ToolError> = match resolution {
        HookResolution::Decision { decision } => {
            check_decision(&intent.declaration, decision)?;
            Ok(TypedToolOutput::from_value(
                nofy_tool_protocol::ToolId::new(&intent.tool).map_err(checkpoint)?,
                serde_json::to_value(decision).map_err(db_error)?,
            ))
        }
        HookResolution::Error { message } => {
            Err(ToolError::custom("reconciled_hook", message.clone()))
        }
        HookResolution::Recorded => {
            return Err(checkpoint("Hook receipt requires a recorded result"));
        }
    };
    serde_json::to_value(result).map_err(db_error)
}

fn finish_outer(
    cp: &mut Checkpoint,
    saved: &mut crate::hooks::journal::Saved,
    intent: &Intent,
    result: &Value,
) -> Result<(), Error> {
    let result: Result<TypedToolOutput, ToolError> =
        serde_json::from_value(result.clone()).map_err(db_error)?;
    let decision = match result {
        Ok(output) => serde_json::from_value::<HookDecision>(output.value)
            .map_err(|error| Error::Composition(format!("invalid hook decision: {error}")))
            .and_then(|decision| {
                check_decision(&intent.declaration, &decision)?;
                Ok(decision)
            }),
        Err(error) => Err(Error::Tool(error.to_string())),
    };
    match decision {
        Ok(decision) => {
            saved.decision = Some(decision);
            saved.error = None;
        }
        Err(error) => {
            saved.decision = Some(HookDecision::Continue);
            saved.error = Some(error.to_string());
        }
    }
    saved.resolved = false;
    cp.state.data = serde_json::to_value(saved).map_err(db_error)?;
    Ok(())
}

pub(crate) async fn accept(
    store: &SqliteStore,
    lease: &Lease,
    root: &str,
    composition: &str,
    command: &str,
    receipt: HookReconciliation,
) -> Result<(), Error> {
    receipt.validate()?;
    crate::system::bounded_name(command)?;
    let root = root.to_owned();
    let composition = composition.to_owned();
    let command = command.to_owned();
    let lease = lease.clone();
    let clock = store.clock.clone();
    store
        .transaction_owned(lease.clone(), move |tx| {
            let now = clock.now_ms();
            check_lease(tx, &lease, now)?;
            let cmdkey = command_key(&root, &command);
            if let Some(cp) = load(tx, &cmdkey)? {
                let old: Resolution = serde_json::from_value(cp.state.data).map_err(db_error)?;
                return if cp.composition == composition
                    && old.root == root
                    && old.command == command
                    && old.receipt == receipt
                {
                    Ok(())
                } else {
                    Err(checkpoint("Hook recovery command cannot change"))
                };
            }
            verify_root(tx, &root, &composition, &lease.key)?;
            let key = effect_key(&receipt.ticket.id);
            let cp = load(tx, &key)?.ok_or_else(|| checkpoint("Hook effect intent missing"))?;
            let mut frame = decode(&cp)?;
            let intent = &frame.intent;
            let (mut outer_cp, mut saved) = outer(tx, intent)?;
            if intent.root != root
                || intent.root_composition != composition
                || cp.revision != receipt.ticket.effect_revision
                || outer_cp.revision != receipt.ticket.hook_revision
                || crate::system::content_digest(intent)? != receipt.ticket.intent_digest
                || kind(tx, &frame, &saved)?.as_ref() != Some(&receipt.ticket.kind)
                || !source_matches(tx, intent, &saved.event)?
            {
                return Err(checkpoint(
                    "Hook recovery ticket is stale or belongs to another source",
                ));
            }
            match receipt.ticket.kind {
                HookRecoveryKind::Gate => {
                    let HookResolution::Decision { decision } = &receipt.resolution else {
                        return Err(checkpoint("Hook gate resolution requires a final decision"));
                    };
                    if matches!(decision, HookDecision::Pause { .. }) {
                        return Err(checkpoint("Hook gate resolution must settle the gate"));
                    }
                    check_decision(&intent.declaration, decision)?;
                    saved.decision = Some(decision.clone());
                    saved.error = None;
                    saved.resolved = true;
                    outer_cp.state.data = serde_json::to_value(&saved).map_err(db_error)?;
                }
                HookRecoveryKind::Recorded => {
                    if !matches!(&receipt.resolution, HookResolution::Recorded) {
                        return Err(checkpoint("recorded Hook result cannot be replaced"));
                    }
                    let result = if let Some(result) = frame.result.clone() {
                        result
                    } else {
                        let PrimitiveState::Recorded(recorded) =
                            crate::governance::sqlite::inspect_primitive(
                                tx,
                                &intent.scopes,
                                &intent.operation,
                                &intent.fingerprint,
                            )?
                        else {
                            return Err(checkpoint("original Hook receipt disappeared"));
                        };
                        crate::governance::sqlite::settle_primitive(
                            tx,
                            &intent.scopes,
                            &intent.operation,
                            &intent.fingerprint,
                            &recorded,
                            false,
                            now,
                        )?;
                        recorded.value
                    };
                    finish_outer(&mut outer_cp, &mut saved, intent, &result)?;
                    frame.result = Some(result);
                }
                HookRecoveryKind::Effect => {
                    let result = result_value(intent, &receipt.resolution)?;
                    if !intent.scopes.is_empty() {
                        let recorded = BudgetReceipt {
                            used: BudgetCost {
                                tool_calls: 1,
                                ..Default::default()
                            },
                            value: result.clone(),
                        };
                        crate::governance::sqlite::settle_primitive(
                            tx,
                            &intent.scopes,
                            &intent.operation,
                            &intent.fingerprint,
                            &recorded,
                            true,
                            now,
                        )?;
                    }
                    finish_outer(&mut outer_cp, &mut saved, intent, &result)?;
                    frame.result = Some(result);
                }
            }
            let hook_key = frame.intent.journal_key.clone();
            save(tx, &hook_key, Some(outer_cp.revision), outer_cp)?;
            frame.reconciliation = Some(command.clone());
            save(tx, &key, Some(cp.revision), frame_checkpoint(&frame)?)?;
            let value = Resolution {
                root,
                command,
                receipt,
            };
            save(
                tx,
                &cmdkey,
                None,
                Checkpoint {
                    version: 1,
                    revision: 0,
                    composition,
                    state: RunState {
                        data: serde_json::to_value(value).map_err(db_error)?,
                        ..Default::default()
                    },
                },
            )?;
            Ok(())
        })
        .await
}
