use super::*;
use crate::{
    Checkpoint,
    durable::{GuardedCheckpointer, SqliteStore, check_lease, db_error},
    governance::{BudgetControl, BudgetScope},
};
use rusqlite::{OptionalExtension, Transaction, params};
use serde_json::{Value, json};
use std::sync::Arc;

mod recovery;
pub(crate) use recovery::{accept, accepted, target, targets};

#[derive(Clone)]
pub(crate) struct NativeControl {
    pub guard: GuardedCheckpointer,
    root: String,
    composition: String,
    storage: String,
}
impl NativeControl {
    pub(crate) fn new(guard: GuardedCheckpointer, root: &str, composition: &str) -> Self {
        Self {
            storage: guard.store.logical_identity().to_owned(),
            guard,
            root: root.into(),
            composition: composition.into(),
        }
    }
}

#[derive(Clone)]
pub(crate) struct Scope {
    control: Arc<NativeControl>,
    event: Arc<HookEvent>,
    bus: String,
    hook: String,
    declaration: EventDeclaration,
    pub(super) journal_key: Option<String>,
    #[cfg(feature = "workflow")]
    location: Option<crate::controllers::ExecutionCheckpoint>,
}

#[derive(Clone, Serialize, Deserialize)]
struct Source {
    key: String,
    composition: String,
    graph: bool,
    fingerprint: String,
}

#[derive(Clone, Serialize, Deserialize)]
struct Intent {
    id: String,
    root: String,
    root_composition: String,
    event_id: String,
    event_digest: String,
    bus: String,
    hook: String,
    journal_key: String,
    declaration: EventDeclaration,
    source: Source,
    tool: String,
    operation: String,
    fingerprint: String,
    scopes: Vec<BudgetScope>,
    authority: String,
}

#[derive(Serialize, Deserialize)]
struct Frame {
    version: u32,
    intent: Intent,
    result: Option<Value>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    reconciliation: Option<String>,
}

fn effect_id(event: &str, hook: &str, journal: &str) -> String {
    crate::system::content_digest(&(event, hook, journal)).expect("string tuple")
}
fn effect_key(id: &str) -> String {
    format!("hook-effect-v1:{id}")
}
fn frame_composition(intent: &Intent) -> Result<String, Error> {
    Ok(format!(
        "hook-effect/v1:{}",
        crate::system::content_digest(intent)?
    ))
}
fn load(tx: &Transaction<'_>, key: &str) -> Result<Option<Checkpoint>, Error> {
    let row: Option<(u64, String)> = tx
        .query_row(
            "SELECT revision,payload FROM agent_runtime_checkpoints WHERE key=?1",
            [key],
            |r| Ok((r.get(0)?, r.get(1)?)),
        )
        .optional()
        .map_err(db_error)?;
    row.map(|(revision, payload)| {
        let cp: Checkpoint = serde_json::from_str(&payload).map_err(db_error)?;
        if cp.version != 1 || cp.revision != revision {
            return Err(checkpoint(
                "Hook effect checkpoint version/revision changed",
            ));
        }
        Ok(cp)
    })
    .transpose()
}
fn save(
    tx: &Transaction<'_>,
    key: &str,
    old: Option<u64>,
    mut cp: Checkpoint,
) -> Result<u64, Error> {
    cp.revision = old
        .unwrap_or(0)
        .checked_add(1)
        .ok_or_else(|| checkpoint("Hook effect revision exhausted"))?;
    let payload = serde_json::to_string(&cp).map_err(db_error)?;
    let changed = if let Some(old) = old {
        tx.execute("UPDATE agent_runtime_checkpoints SET revision=?1,payload=?2 WHERE key=?3 AND revision=?4",params![cp.revision,payload,key,old]).map_err(db_error)?
    } else {
        tx.execute("INSERT INTO agent_runtime_checkpoints(key,revision,payload) VALUES(?1,?2,?3) ON CONFLICT(key) DO NOTHING",params![key,cp.revision,payload]).map_err(db_error)?
    };
    if changed != 1 {
        return Err(checkpoint("Hook effect checkpoint changed"));
    }
    Ok(cp.revision)
}
fn decode(cp: &Checkpoint) -> Result<Frame, Error> {
    let frame: Frame = serde_json::from_value(cp.state.data.clone()).map_err(db_error)?;
    if frame.version != 1
        || cp.composition != frame_composition(&frame.intent)?
        || !digest_id(&frame.intent.id)
        || frame.intent.id
            != effect_id(
                &frame.intent.event_id,
                &frame.intent.hook,
                &frame.intent.journal_key,
            )
    {
        return Err(checkpoint("Hook effect intent identity changed"));
    }
    Ok(frame)
}
fn frame_checkpoint(frame: &Frame) -> Result<Checkpoint, Error> {
    Ok(Checkpoint {
        version: 1,
        revision: 0,
        composition: frame_composition(&frame.intent)?,
        state: RunState {
            data: serde_json::to_value(frame).map_err(db_error)?,
            ..Default::default()
        },
    })
}
fn outer(
    tx: &Transaction<'_>,
    intent: &Intent,
) -> Result<(Checkpoint, crate::hooks::journal::Saved), Error> {
    let cp =
        load(tx, &intent.journal_key)?.ok_or_else(|| checkpoint("original Hook intent missing"))?;
    let saved: crate::hooks::journal::Saved =
        serde_json::from_value(cp.state.data.clone()).map_err(db_error)?;
    if cp.composition != intent.bus
        || saved.hook != intent.hook
        || saved.event.id != intent.event_id
        || crate::system::content_digest(&saved.event)? != intent.event_digest
        || saved.event.scope.root_run_id != intent.root
        || saved.controller.is_some()
        || saved.resume.as_deref() != Some(intent.authority.as_str())
    {
        return Err(checkpoint("original Hook effect authority changed"));
    }
    Ok((cp, saved))
}
fn source_matches(tx: &Transaction<'_>, intent: &Intent, event: &HookEvent) -> Result<bool, Error> {
    let Some(cp) = load(tx, &intent.source.key)? else {
        return Ok(false);
    };
    let owner = if intent.source.graph {
        cp.state.data.get("run_id").and_then(Value::as_str) == Some(event.scope.run_id.as_str())
    } else {
        cp.state
            .execution_run_id
            .as_deref()
            .or(cp.state.hook_progress.run_id.as_deref())
            == Some(event.scope.run_id.as_str())
    };
    Ok(cp.composition == intent.source.composition
        && owner
        && parent_fingerprint(&cp.state, event)? == intent.source.fingerprint)
}

impl Scope {
    pub(super) fn new(
        control: Arc<NativeControl>,
        bus: &HookBus,
        registration: &HookRegistration,
        event: &HookEvent,
        context: &RunContext,
    ) -> Self {
        #[cfg(not(feature = "workflow"))]
        let _ = context;
        Self {
            control,
            event: Arc::new(event.clone()),
            bus: bus.identity.clone(),
            hook: registration.identity.clone(),
            declaration: registration.declaration.clone(),
            journal_key: None,
            #[cfg(feature = "workflow")]
            location: context
                .capabilities
                .get::<crate::controllers::ExecutionCheckpoint>()
                .map(|p| p.as_ref().clone()),
        }
    }
    pub(super) fn identity(&self) -> String {
        format!(
            "hook.effects/v1:{}",
            crate::system::content_digest(&(
                &self.control.storage,
                &self.control.root,
                &self.event.id,
                &self.bus,
                &self.hook
            ))
            .expect("native Hook identity")
        )
    }
    async fn intent(
        &self,
        context: &RunContext,
        call: &ToolCall,
        revision: &str,
        dispatch: &dyn ToolDispatch,
    ) -> Result<Intent, Error> {
        if dispatch.is_resumable() {
            return Err(checkpoint(
                "primitive Hook evidence cannot settle an owned controller",
            ));
        }
        let journal_key = self
            .journal_key
            .clone()
            .ok_or_else(|| checkpoint("native Hook requires its original journal"))?;
        let mut scopes = Vec::new();
        if let Some(control) = context.capabilities.get::<BudgetControl>() {
            for entry in &control.entries {
                if entry.store.storage_identity().as_deref() != Some(self.control.storage.as_str())
                {
                    return Err(checkpoint("Hook budget storage changed"));
                }
                scopes.push(entry.spec.scope.clone());
            }
        }
        let control = self.control.clone();
        let event = self.event.clone();
        #[cfg(feature = "workflow")]
        let location = self.location.clone();
        let source=control.guard.store.clone().transaction(move|tx| {
            check_lease(tx,&control.guard.lease,control.guard.store.clock.now_ms())?;
            #[cfg(feature="workflow")]
            let found=location.map(|p|(p.key,p.composition,p.run_id.is_none()));
            #[cfg(not(feature="workflow"))]
            let found:Option<(String,String,bool)>=None;
            let (key,composition,graph)=if let Some(found)=found {found}
            else if event.scope.run_id==control.root {(control.guard.lease.key.clone(),control.composition.clone(),false)}
            else {
                let child_key=serde_json::to_string(&(&control.root,&event.scope.run_id)).map_err(db_error)?;
                let payload:Option<String>=tx.query_row("SELECT payload FROM agent_runtime_children WHERE root_id=?1 AND key=?2",params![control.root,child_key],|r|r.get(0)).optional().map_err(db_error)?;
                let child:crate::supervisor::ChildRunRecord=serde_json::from_str(&payload.ok_or_else(||checkpoint("Hook source is not a recorded descendant"))?).map_err(db_error)?;
                (child.checkpoint_key.unwrap_or_else(||crate::state::checkpoint_key(&child.agent_name,&child.thread_id)),child.composition,false)
            };
            let cp=load(tx,&key)?.ok_or_else(||checkpoint("Hook source checkpoint missing"))?;
            if cp.composition!=composition {return Err(checkpoint("Hook source composition changed"));}
            Ok(Source {key,composition,graph,fingerprint:parent_fingerprint(&cp.state,&event)?})
        }).await?;
        Ok(Intent {
            id: effect_id(&self.event.id, &self.hook, &journal_key),
            root: self.control.root.clone(),
            root_composition: self.control.composition.clone(),
            event_id: self.event.id.clone(),
            event_digest: crate::system::content_digest(self.event.as_ref())?,
            bus: self.bus.clone(),
            hook: self.hook.clone(),
            journal_key,
            declaration: self.declaration.clone(),
            source,
            tool: call.name.clone(),
            operation: call.id.clone(),
            fingerprint: crate::governance::primitive_fingerprint(dispatch, call, revision)?,
            scopes,
            authority: crate::governance::receipt_identity(context)
                .unwrap_or_else(|| self.identity()),
        })
    }
    async fn access<T: Send + 'static>(
        &self,
        intent: Intent,
        operation: impl FnOnce(&Transaction<'_>, &Intent) -> Result<T, Error> + Send + 'static,
    ) -> Result<T, Error> {
        let control = self.control.clone();
        control
            .guard
            .store
            .clone()
            .transaction_owned(control.guard.lease.clone(), move |tx| {
                check_lease(tx, &control.guard.lease, control.guard.store.clock.now_ms())?;
                let (_, saved) = outer(tx, &intent)?;
                if !source_matches(tx, &intent, &saved.event)? {
                    return Err(checkpoint("Hook source advanced"));
                }
                operation(tx, &intent)
            })
            .await
    }
    pub(super) async fn replay(
        &self,
        context: &RunContext,
        call: &ToolCall,
        revision: &str,
        dispatch: &dyn ToolDispatch,
    ) -> Result<Option<Result<TypedToolOutput, ToolError>>, Error> {
        let intent = self.intent(context, call, revision, dispatch).await?;
        let clock = self.control.guard.store.clock.clone();
        enum Replay {
            Result(Value),
            Empty,
            Pause(Value),
        }
        let replay=self.access(intent,move|tx,intent| {
            let key=effect_key(&intent.id);
            let old=load(tx,&key)?;
            let mut frame=match &old {
                Some(cp)=>{let frame=decode(cp)?;if crate::system::content_digest(&frame.intent)?!=crate::system::content_digest(intent)? {return Err(checkpoint("Hook primitive contract changed"));} frame},
                None=>Frame {version:1,intent:intent.clone(),result:None,reconciliation:None},
            };
            if let Some(result)=frame.result {return Ok(Replay::Result(result));}
            let state=crate::governance::sqlite::inspect_primitive(tx,&intent.scopes,&intent.operation,&intent.fingerprint)?;
            match state {
                crate::governance::sqlite::PrimitiveState::Recorded(receipt)=>{
                    crate::governance::sqlite::settle_primitive(tx,&intent.scopes,&intent.operation,&intent.fingerprint,&receipt,false,clock.now_ms())?;
                    frame.result=Some(receipt.value.clone());save(tx,&key,old.as_ref().map(|p|p.revision),frame_checkpoint(&frame)?)?;
                    Ok(Replay::Result(receipt.value))
                }
                crate::governance::sqlite::PrimitiveState::Uncertain if !intent.scopes.is_empty()=>{
                    if old.is_none(){save(tx,&key,None,frame_checkpoint(&frame)?)?;}
                    Ok(Replay::Pause(json!({"kind":"budget_uncertain","operation_id":intent.operation,"scope":intent.scopes[0]})))
                }
                _ if old.is_some() && intent.scopes.is_empty()=>Ok(Replay::Pause(json!({"kind":"uncertain_hook","event_id":intent.event_id,"hook":intent.hook}))),
                _=>Ok(Replay::Empty),
            }
        }).await?;
        match replay {
            Replay::Result(value) => serde_json::from_value(value).map(Some).map_err(db_error),
            Replay::Empty => Ok(None),
            Replay::Pause(reason) => Err(Error::GovernancePaused(reason)),
        }
    }
    pub(super) async fn start(
        &self,
        context: &RunContext,
        call: &ToolCall,
        revision: &str,
        dispatch: &dyn ToolDispatch,
    ) -> Result<(), Error> {
        let intent = self.intent(context, call, revision, dispatch).await?;
        self.access(intent, |tx, intent| {
            let key = effect_key(&intent.id);
            if let Some(cp) = load(tx, &key)? {
                let old = decode(&cp)?;
                if crate::system::content_digest(&old.intent)?
                    != crate::system::content_digest(intent)?
                {
                    return Err(checkpoint("Hook primitive contract changed"));
                }
            } else {
                save(
                    tx,
                    &key,
                    None,
                    frame_checkpoint(&Frame {
                        version: 1,
                        intent: intent.clone(),
                        result: None,
                        reconciliation: None,
                    })?,
                )?;
            }
            Ok(())
        })
        .await
    }
    pub(super) async fn complete(
        &self,
        context: &RunContext,
        call: &ToolCall,
        revision: &str,
        dispatch: &dyn ToolDispatch,
        result: &Result<TypedToolOutput, ToolError>,
    ) -> Result<(), Error> {
        let intent = self.intent(context, call, revision, dispatch).await?;
        let result = serde_json::to_value(result).map_err(db_error)?;
        self.access(intent, move |tx, intent| {
            let key = effect_key(&intent.id);
            let cp = load(tx, &key)?.ok_or_else(|| checkpoint("Hook primitive intent missing"))?;
            let mut frame = decode(&cp)?;
            if crate::system::content_digest(&frame.intent)?
                != crate::system::content_digest(intent)?
                || frame.result.as_ref().is_some_and(|old| old != &result)
            {
                return Err(checkpoint("Hook primitive receipt changed"));
            }
            if frame.result.is_some() {
                return Ok(());
            }
            if !intent.scopes.is_empty() {
                match crate::governance::sqlite::inspect_primitive(
                    tx,
                    &intent.scopes,
                    &intent.operation,
                    &intent.fingerprint,
                )? {
                    crate::governance::sqlite::PrimitiveState::Recorded(receipt)
                        if receipt.value == result => {}
                    _ => {
                        return Err(checkpoint(
                            "Hook primitive result lacks its original budget receipts",
                        ));
                    }
                }
            }
            frame.result = Some(result);
            save(tx, &key, Some(cp.revision), frame_checkpoint(&frame)?)?;
            Ok(())
        })
        .await
    }
    pub(super) async fn reconciled(&self) -> Result<Option<String>, Error> {
        let Some(journal) = self.journal_key.as_ref() else {
            return Ok(None);
        };
        let key = effect_key(&effect_id(&self.event.id, &self.hook, journal));
        self.control
            .guard
            .store
            .transaction(move |tx| {
                load(tx, &key)?
                    .map(|cp| decode(&cp).map(|frame| frame.reconciliation))
                    .transpose()
                    .map(Option::flatten)
            })
            .await
    }
}

#[cfg(test)]
mod tests;
