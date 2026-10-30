use super::*;
use crate::hooks::HookEvent;

#[cfg(feature = "sqlite")]
pub(crate) fn parent_pending(state: &RunState, route: &HookRoute) -> bool {
    if route.checkpoint_run_id.is_some() {
        state.has_pending_work()
    } else {
        state.data.get("run_id").and_then(serde_json::Value::as_str)
            == Some(route.parent_run_id.as_str())
            && state
                .data
                .get("facts")
                .and_then(serde_json::Value::as_array)
                .is_some_and(|facts| !facts.is_empty())
    }
}

pub(crate) fn parent_fingerprint(state: &RunState, event: &HookEvent) -> Result<String, Error> {
    let operation = event_operation(event)?;
    let mut state = state.clone();
    state.control_sequence = 0;
    state.hook_progress.facts.retain(|fact| {
        !matches!(fact.name.as_str(), "turn_error" | "turn_cancelled")
            || fact.operation == operation
    });
    Ok(format!(
        "{:x}",
        Sha256::digest(serde_json::to_vec(&state).map_err(|e| Error::Checkpoint(e.to_string()))?)
    ))
}
fn event_operation(event: &HookEvent) -> Result<String, Error> {
    let (_, _, _, _, operation): (String, String, crate::registry::ModuleRef, String, String) =
        serde_json::from_str(&event.id).map_err(|e| Error::Checkpoint(e.to_string()))?;
    Ok(operation)
}
fn without_control(operation: &str) -> String {
    let parts = operation.split(':').collect::<Vec<_>>();
    let mut out = Vec::new();
    let mut i = 0;
    while i < parts.len() {
        if parts[i] == "control" && parts.get(i + 1).is_some_and(|p| p.parse::<u64>().is_ok()) {
            i += 2;
        } else {
            out.push(parts[i]);
            i += 1;
        }
    }
    out.join(":")
}
impl ControllerBinding {
    pub async fn record_hook_route(&self, route: HookRoute) -> Result<(), Error> {
        let (revision, mut saved) = self.load().await?;
        if let Some(old) = saved.hook_routes.get(&route.run_id) {
            return if serde_json::to_value(old).ok() == serde_json::to_value(&route).ok() {
                Ok(())
            } else {
                Err(Error::Checkpoint(
                    "workflow Hook source identity changed".into(),
                ))
            };
        }
        if saved.hook_routes.len() >= 8192 {
            return Err(Error::Checkpoint("Hook source capacity exceeded".into()));
        }
        saved.hook_routes.insert(route.run_id.clone(), route);
        self.write(revision, saved).await
    }
    #[cfg(feature = "sqlite")]
    pub async fn hook_route(&self, run: &str) -> Result<Option<HookRoute>, Error> {
        Ok(self.load().await?.1.hook_routes.get(run).cloned())
    }
    pub async fn hook_key(&self, key: &str) -> Result<String, Error> {
        Ok(match self.load().await?.1.hook_retries.get(key) {
            Some(retry) => serde_json::to_string(&("hook-control-v1", key, retry.epoch))
                .expect("Hook control key"),
            None => key.into(),
        })
    }
    pub async fn alias_hook(&self, event: &mut HookEvent, operation: &str) -> Result<(), Error> {
        let saved = self.load().await?.1;
        let mut selected = None;
        for retry in saved.hook_retries.values() {
            let route = &retry.route;
            if route.parent_run_id != event.scope.run_id
                || route.parent_thread_id != event.scope.thread_id
                || route.source.name != event.name
                || route.source.owner != event.owner
                || route.source.payload != event.payload
                || without_control(&event_operation(&route.source)?) != without_control(operation)
            {
                continue;
            }
            let Some(cp) = self.store.load(&route.checkpoint_key).await? else {
                continue;
            };
            if cp.version != 1
                || cp.composition != route.parent_composition
                || cp.state.execution_run_id != route.checkpoint_run_id
                || parent_fingerprint(&cp.state, &route.source)? != route.parent_fingerprint
            {
                continue;
            }
            if selected.as_ref().is_some_and(|id| id != &route.source.id) {
                return Err(Error::Checkpoint(
                    "ambiguous workflow Hook source recovery".into(),
                ));
            }
            selected = Some(route.source.id.clone());
        }
        if let Some(id) = selected {
            event.id = id;
        }
        Ok(())
    }
}
