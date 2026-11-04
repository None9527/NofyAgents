use super::*;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SessionRoute {
    pub system: String,
    pub release: String,
    pub program: String,
    #[serde(default)]
    pub session_id: Option<String>,
    #[serde(default)]
    pub labels: Labels,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SessionRouteView {
    pub status: String,
    pub selected_session_id: Option<String>,
    pub candidates: Vec<policy::Summary>,
    pub policy: Option<policy::Identity>,
}
impl RunSupervisor {
    pub async fn route_session(
        &self,
        request: SessionRoute,
        system: &CompiledSystem,
    ) -> Result<SessionRouteView, Error> {
        labels(&request.labels)?;
        if request.system != system.bundle.document.name || request.release != system.bundle.digest
        {
            return Err(Error::Composition(
                "session route release/system mismatch".into(),
            ));
        }
        let program = system.program(&request.program)?;
        let snapshot = match &program.snapshot.program {
            crate::program::ProgramSnapshot::Agent { snapshot } => snapshot,
            _ => {
                return Err(Error::Composition(
                    "session route requires an Agent program".into(),
                ));
            }
        };
        let frozen = policy::Frozen::from_snapshot(snapshot, &request.release)?;
        let mut after = String::new();
        let mut candidates = vec![];
        let mut bytes = 0usize;
        loop {
            let page = self.store.session_states(&after, 256, false).await?;
            if page.is_empty() {
                break;
            }
            after = page
                .last()
                .ok_or_else(|| Error::Checkpoint("empty session page".into()))?
                .session_id
                .clone();
            for s in page {
                if s.system == request.system
                    && s.program == request.program
                    && s.lifecycle == "open"
                    && !s.archived
                {
                    let summary = s.summary();
                    bytes =
                        bytes.saturating_add(serde_json::to_vec(&summary).map_err(db_error)?.len());
                    if bytes > 16 * 1024 * 1024 {
                        return Err(Error::Composition("session route candidates exceed execution input boundary; select an explicit session".into()));
                    }
                    candidates.push(summary);
                }
            }
        }
        let mut input = make_input(
            policy::Phase::Route,
            None,
            None,
            request.session_id.clone(),
            content_digest(&request)?,
            request.labels,
            self.store.clock.now_ms(),
        );
        input.candidates = candidates.clone();
        let proposal = if frozen.is_some() {
            self.evaluate_policy(frozen.as_ref(), input, None).await?
        } else {
            policy::Proposal {
                decision: policy::Decision::Allow,
                reason: "explicit session routing".into(),
                session_id: request
                    .session_id
                    .filter(|id| candidates.iter().any(|s| &s.session_id == id)),
                display_name: None,
                archive: false,
            }
        };
        let status = match proposal.decision {
            policy::Decision::Deny => "rejected",
            policy::Decision::Ambiguous => "ambiguous",
            policy::Decision::Allow if proposal.session_id.is_some() => "unique",
            _ => "none",
        };
        Ok(SessionRouteView {
            status: status.into(),
            selected_session_id: proposal.session_id,
            candidates,
            policy: frozen.map(|f| f.identity),
        })
    }
}
impl SqliteStore {
    pub async fn session_policy_view(&self, id: &str) -> Result<Option<serde_json::Value>, Error> {
        let Some(s) = self.session_state(id).await? else {
            return Ok(None);
        };
        Ok(Some(
            serde_json::json!({"session_id":s.session_id,"session_revision":s.session_revision,
            "policy_revision":s.policy_revision,"policy":s.policy,
            "runtime_store_json":serde_json::to_string(&serde_json::json!({"logical_identity":self.logical_identity(),"path":self.path()?})).map_err(db_error)?}),
        ))
    }
}
