//! Scope offers are issued by compiled rules and anchored by the root fence.
use super::*;
use crate::policy::rules::RuleApprovalHint;
use serde_json::{Value, json};
use std::collections::BTreeMap;
#[derive(Clone, Copy, Debug, Default, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum ApprovalScope {
    #[default]
    Once,
    Root,
    Thread,
    Session,
}
impl ApprovalScope {
    fn name(self) -> &'static str {
        match self {
            Self::Once => "once",
            Self::Root => "root",
            Self::Thread => "thread",
            Self::Session => "session",
        }
    }
}
#[derive(Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Offer {
    hint: RuleApprovalHint,
    anchors: BTreeMap<String, String>,
    request_digest: String,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ApprovalGrant {
    pub protocol: String,
    pub grant_id: String,
    pub scope: String,
    pub anchor: String,
    pub policy_id: String,
    pub rule_key: String,
    pub summary: Value,
    pub source_approval: String,
    pub allow: bool,
    pub revision: u64,
    pub active: bool,
    pub created_at_ms: u64,
    pub revoke_command_id: Option<String>,
}
fn invalid(message: &str) -> Error {
    Error::Checkpoint(format!("approval scope: {message}"))
}
fn digest(value: &impl Serialize) -> Result<String, Error> {
    crate::system::content_digest(value)
}
fn grant(tx: &rusqlite::Transaction<'_>, id: &str) -> Result<Option<ApprovalGrant>, Error> {
    let row:Option<(String,String,String,String,bool,String)>=tx.query_row("SELECT anchor,policy_id,rule_key,digest,active,payload FROM agent_runtime_approval_grants WHERE grant_id=?1",[id],|r|Ok((r.get(0)?,r.get(1)?,r.get(2)?,r.get(3)?,r.get(4)?,r.get(5)?))).optional().map_err(db_error)?;
    row.map(|(anchor, policy, rule, hash, active, payload)| {
        let record: ApprovalGrant = serde_json::from_str(&payload).map_err(db_error)?;
        if record.protocol != "nofy.approval-grant/v1"
            || record.grant_id != id
            || record.anchor != anchor
            || record.policy_id != policy
            || record.rule_key != rule
            || record.active != active
            || digest(&record)? != hash
        {
            return Err(invalid("grant identity changed"));
        }
        Ok(record)
    })
    .transpose()
}
fn save(tx: &rusqlite::Transaction<'_>, record: &ApprovalGrant) -> Result<(), Error> {
    tx.execute("INSERT INTO agent_runtime_approval_grants(grant_id,anchor,policy_id,rule_key,active,digest,payload) VALUES(?1,?2,?3,?4,?5,?6,?7) ON CONFLICT(grant_id) DO UPDATE SET active=excluded.active,digest=excluded.digest,payload=excluded.payload",params![record.grant_id,record.anchor,record.policy_id,record.rule_key,record.active,digest(record)?,serde_json::to_string(record).map_err(db_error)?]).map_err(db_error)?;
    Ok(())
}
impl SqliteStore {
    pub(super) async fn rule_approval(
        &self,
        request: ApprovalRequest,
        identity: SupervisedIdentity,
        hint: RuleApprovalHint,
    ) -> Result<(Option<bool>, Value), Error> {
        let clock = self.clock.clone();
        self.transaction(move |tx| {
            check_lease(tx,&identity.lease,clock.now_ms())?;
            if request.policy_id.as_deref()!=Some(&hint.policy_id){return Err(invalid("hint belongs to another compiled policy"));}
            let mut anchors=BTreeMap::from([("root".to_owned(),format!("root:{}",identity.run_id)),("thread".to_owned(),format!("thread:{}",identity.lease.key))]);
            let session:Option<String>=tx.query_row("SELECT id FROM agent_runtime_sessions WHERE thread_key=?1",[&identity.lease.key],|r|r.get(0)).optional().map_err(db_error)?;
            if let Some(session)=session{anchors.insert("session".into(),format!("session:{session}"));}
            let offer=Offer{hint,anchors,request_digest:digest(&request)?};let key=request.key()?;
            let call=serde_json::to_string(&request.call).map_err(db_error)?;
            let mut payload=serde_json::to_value(&request).map_err(db_error)?;payload["_rule_offer"]=serde_json::to_value(&offer).map_err(db_error)?;
            if serde_json::to_vec(&payload).map_err(db_error)?.len()>512*1024{return Err(invalid("approval offer exceeds 512 KiB"));}
            let mut remembered=None;
            for anchor in offer.anchors.values(){
                let id:Option<String>=tx.query_row("SELECT grant_id FROM agent_runtime_approval_grants WHERE anchor=?1 AND policy_id=?2 AND rule_key=?3 AND active=1 ORDER BY json_extract(payload,'$.allow'),grant_id LIMIT 1",params![anchor,offer.hint.policy_id,offer.hint.rule_key],|r|r.get(0)).optional().map_err(db_error)?;
                if let Some(id)=id {let record=grant(tx,&id)?.ok_or_else(||invalid("matching grant disappeared"))?;remembered=Some((record.allow,id));if !record.allow{break;}}
            }
            if let Some((_,id))=&remembered{payload["_decision_scope"]=json!("once");payload["_grant_id"]=json!(id);}
            tx.execute("INSERT INTO agent_runtime_approvals(key,run_id,call_json,payload,decision) VALUES(?1,?2,?3,?4,?5) ON CONFLICT(key) DO NOTHING",params![key,request.run_id,call,serde_json::to_string(&payload).map_err(db_error)?,remembered.as_ref().map(|(allow,_)|allow)]).map_err(db_error)?;
            let (original,old_payload,mut decision):(String,String,Option<bool>)=tx.query_row("SELECT call_json,payload,decision FROM agent_runtime_approvals WHERE key=?1",[&key],|r|Ok((r.get(0)?,r.get(1)?,r.get(2)?))).map_err(db_error)?;
            if original!=call{return Err(invalid("call identity changed"));}
            let mut old:Value=serde_json::from_str(&old_payload).map_err(db_error)?;
            if decision.is_none()&& let Some((allow,id))=&remembered{old["_decision_scope"]=json!("once");old["_grant_id"]=json!(id);decision=Some(*allow);tx.execute("UPDATE agent_runtime_approvals SET decision=?1,payload=?2 WHERE key=?3",params![allow,serde_json::to_string(&old).map_err(db_error)?,key]).map_err(db_error)?;}
            if old.get("_rule_offer").is_none()&&decision.is_none(){old["_rule_offer"]=payload["_rule_offer"].clone();tx.execute("UPDATE agent_runtime_approvals SET payload=?1 WHERE key=?2",params![serde_json::to_string(&old).map_err(db_error)?,key]).map_err(db_error)?;}
            let original_offer=old.get("_rule_offer").cloned().unwrap_or(Value::Null);
            let mut public=json!({"scopes":["once"],"memory":"not_offered"});
            if !original_offer.is_null(){let offer:Offer=serde_json::from_value(original_offer).map_err(db_error)?;if offer.request_digest!=digest(&request)?{return Err(invalid("stored offer request changed"));}public=json!({"policy_id":offer.hint.policy_id,"match":offer.hint.summary,"scopes":std::iter::once("once".to_string()).chain(offer.anchors.keys().cloned()).collect::<Vec<_>>(),"memory":"only this compiled rule and the selected original scope"});}
            Ok((decision,public))
        }).await
    }
    pub async fn decide_scoped(
        &self,
        request: &ApprovalRequest,
        allow: bool,
        scope: ApprovalScope,
    ) -> Result<(), Error> {
        let request = request.clone();
        let clock = self.clock.clone();
        self.transaction(move |tx| {
            let key = request.key()?;
            let call = serde_json::to_string(&request.call).map_err(db_error)?;
            let row: Option<(String, String, Option<bool>)> = tx
                .query_row(
                    "SELECT call_json,payload,decision FROM agent_runtime_approvals WHERE key=?1",
                    [&key],
                    |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?)),
                )
                .optional()
                .map_err(db_error)?;
            let (original, payload, decision) =
                row.ok_or_else(|| invalid("no matching pending approval"))?;
            if original != call || decision.is_some_and(|old| old != allow) {
                return Err(invalid("decision conflicts with original call"));
            }
            let mut payload: Value = serde_json::from_str(&payload).map_err(db_error)?;
            if decision.is_some()
                && payload
                    .get("_decision_scope")
                    .and_then(Value::as_str)
                    .unwrap_or("once")
                    != scope.name()
            {
                return Err(invalid("recorded decision scope cannot be changed"));
            }
            if scope != ApprovalScope::Once {
                let offer: Offer = serde_json::from_value(
                    payload
                        .get("_rule_offer")
                        .cloned()
                        .ok_or_else(|| invalid("this policy did not offer remembered approval"))?,
                )
                .map_err(db_error)?;
                if offer.request_digest != digest(&request)? {
                    return Err(invalid("offer differs from original request"));
                }
                let anchor = offer
                    .anchors
                    .get(scope.name())
                    .ok_or_else(|| invalid("scope is not available for this original root"))?
                    .clone();
                let id = digest(&(
                    "approval-grant-v1",
                    scope.name(),
                    &anchor,
                    &offer.hint.policy_id,
                    &offer.hint.rule_key,
                    &key,
                ))?;
                if let Some(old) = grant(tx, &id)? {
                    if old.allow != allow {
                        return Err(invalid("grant decision changed"));
                    }
                } else {
                    save(
                        tx,
                        &ApprovalGrant {
                            protocol: "nofy.approval-grant/v1".into(),
                            grant_id: id,
                            scope: scope.name().into(),
                            anchor,
                            policy_id: offer.hint.policy_id,
                            rule_key: offer.hint.rule_key,
                            summary: offer.hint.summary,
                            source_approval: key.clone(),
                            allow,
                            revision: 0,
                            active: true,
                            created_at_ms: clock.now_ms(),
                            revoke_command_id: None,
                        },
                    )?;
                }
            }
            payload["_decision_scope"] = json!(scope.name());
            tx.execute(
                "UPDATE agent_runtime_approvals SET decision=?1,payload=?2 WHERE key=?3",
                params![
                    allow,
                    serde_json::to_string(&payload).map_err(db_error)?,
                    key
                ],
            )
            .map_err(db_error)?;
            Ok(())
        })
        .await
    }
    pub async fn approval_grants(
        &self,
        after: &str,
        limit: usize,
        include_revoked: bool,
    ) -> Result<Vec<ApprovalGrant>, Error> {
        if !(1..=256).contains(&limit) || after.len() > 64 {
            return Err(invalid("invalid grants cursor or limit"));
        }
        let after = after.to_owned();
        self.transaction(move |tx| {
            let mut query=tx.prepare("SELECT grant_id FROM agent_runtime_approval_grants WHERE grant_id>?1 AND (?3 OR active=1) ORDER BY grant_id LIMIT ?2").map_err(db_error)?;
            let ids=query.query_map(params![after,limit,include_revoked],|r|r.get::<_,String>(0)).map_err(db_error)?.collect::<Result<Vec<_>,_>>().map_err(db_error)?;
            ids.into_iter().map(|id|grant(tx,&id)?.ok_or_else(||invalid("grant disappeared"))).collect()
        }).await
    }
    pub async fn revoke_approval_grant(
        &self,
        id: &str,
        revision: u64,
        command: &str,
    ) -> Result<ApprovalGrant, Error> {
        if id.len() != 64 || !id.bytes().all(|b| b.is_ascii_hexdigit()) {
            return Err(invalid("expected exact grant ID"));
        }
        crate::system::bounded_name(command)?;
        let id = id.to_owned();
        let command = command.to_owned();
        self.transaction(move |tx| {
            let mut record = grant(tx, &id)?.ok_or_else(|| invalid("grant not found"))?;
            if !record.active
                && record.revoke_command_id.as_deref() == Some(&command)
                && record.revision == revision.saturating_add(1)
            {
                return Ok(record);
            }
            if record.revision != revision || !record.active {
                return Err(invalid("grant revision changed or already revoked"));
            }
            record.active = false;
            record.revision = record
                .revision
                .checked_add(1)
                .ok_or_else(|| invalid("grant revision exhausted"))?;
            record.revoke_command_id = Some(command);
            save(tx, &record)?;
            Ok(record)
        })
        .await
    }
}
