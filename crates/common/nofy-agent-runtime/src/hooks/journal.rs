use super::*;
use crate::{Checkpoint, Checkpointer, RunState};

#[derive(Clone)]
pub struct HookJournal {
    store: Arc<dyn Checkpointer>,
}
#[derive(Clone)]
pub struct HookJournalBinding(pub HookJournal);
pub(crate) struct Record {
    pub(super) key: String,
    resume: Option<String>,
    pub revision: u64,
    pub cached: Option<HookDecision>,
    pub uncertain: bool,
}
#[derive(Serialize, Deserialize)]
pub(super) struct Saved {
    pub(super) event: HookEvent,
    pub(super) hook: String,
    pub(super) decision: Option<HookDecision>,
    pub(super) error: Option<String>,
    pub(super) resolved: bool,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub(super) controller: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub(super) resume: Option<String>,
}
impl HookJournal {
    pub fn new(store: Arc<dyn Checkpointer>) -> Self {
        Self { store }
    }
    #[cfg(feature = "workflow")]
    pub(crate) fn checkpoint_store(&self) -> Arc<dyn Checkpointer> {
        self.store.clone()
    }
    fn key(registration: &HookRegistration, event: &HookEvent) -> String {
        serde_json::to_string(&("hook-v1", &event.id, &registration.identity))
            .expect("string tuple")
    }
    pub(crate) async fn begin(
        &self,
        identity: &str,
        registration: &HookRegistration,
        event: &HookEvent,
        context: &RunContext,
    ) -> Result<Record, Error> {
        let key = Self::key(registration, event);
        let resume = registration.handler.resume_identity(context);
        #[cfg(feature = "workflow")]
        let key = if let Some(controller) = context
            .capabilities
            .get::<crate::controllers::ControllerBinding>()
        {
            let selected = controller.hook_key(&key).await?;
            self.active_key(identity, &key, Some(&selected)).await?
        } else {
            self.active_key(identity, &key, None).await?
        };
        if let Some(checkpoint) = self.store.load(&key).await? {
            let saved: Saved = serde_json::from_value(checkpoint.state.data)
                .map_err(|e| Error::Checkpoint(e.to_string()))?;
            if checkpoint.version != 1
                || checkpoint.composition != identity
                || saved.hook != registration.identity
                || saved.controller != registration.handler.recovery_identity()
                || serde_json::to_value(&saved.event).ok() != serde_json::to_value(event).ok()
            {
                return Err(Error::Checkpoint(
                    "hook intent/version/payload changed".into(),
                ));
            }
            if let Some(error) = saved.error {
                match registration.rule.failure {
                    FailurePolicy::Closed => return Err(Error::Composition(error)),
                    FailurePolicy::Open => {
                        return Ok(Record {
                            key,
                            resume: saved.resume,
                            revision: checkpoint.revision,
                            cached: Some(HookDecision::Continue),
                            uncertain: false,
                        });
                    }
                }
            }
            if !saved.resolved
                && (saved.decision.is_none()
                    || matches!(saved.decision, Some(HookDecision::Pause { .. })))
            {
                // Existing installed controllers already recorded their frozen
                // contract. Other handlers need an original authority proof.
                if let Some(expected) = saved.resume.as_ref().or(saved.controller.as_ref()) {
                    if resume.as_ref() != Some(expected) {
                        return Err(Error::Checkpoint("hook recovery authority changed".into()));
                    }
                    if registration.handler.can_resume(context) {
                        return Ok(Record {
                            key,
                            resume: saved.resume,
                            revision: checkpoint.revision,
                            cached: None,
                            uncertain: false,
                        });
                    }
                }
            }
            let uncertain = saved.decision.is_none();
            let cached=saved.decision.unwrap_or_else(||HookDecision::Pause{reason:json!({"kind":"uncertain_hook","event_id":event.id,"hook":registration.identity})});
            return Ok(Record {
                key,
                resume: saved.resume,
                revision: checkpoint.revision,
                cached: Some(cached),
                uncertain,
            });
        }
        self.write(
            &key,
            None,
            identity,
            Saved {
                event: event.clone(),
                hook: registration.identity.clone(),
                decision: None,
                error: None,
                resolved: false,
                controller: registration.handler.recovery_identity(),
                resume: resume.clone(),
            },
        )
        .await?;
        Ok(Record {
            key,
            resume,
            revision: 1,
            cached: None,
            uncertain: false,
        })
    }
    pub(crate) async fn finish(
        &self,
        identity: &str,
        registration: &HookRegistration,
        event: &HookEvent,
        record: &Record,
        decision: &HookDecision,
        error: Option<String>,
    ) -> Result<(), Error> {
        self.write(
            &record.key,
            Some(record.revision),
            identity,
            Saved {
                event: event.clone(),
                hook: registration.identity.clone(),
                decision: Some(decision.clone()),
                error,
                resolved: false,
                controller: registration.handler.recovery_identity(),
                resume: record.resume.clone(),
            },
        )
        .await
    }
    /// Explicit operator reconciliation, never an automatic handler retry. The
    /// caller supplies the exact original event and installed subscription.
    pub async fn reconcile(
        &self,
        bus: &HookBus,
        registration: &HookRegistration,
        event: &HookEvent,
        decision: HookDecision,
    ) -> Result<(), Error> {
        let actual = bus
            .registrations
            .iter()
            .find(|actual| actual.identity == registration.identity)
            .ok_or_else(|| {
                Error::Checkpoint("hook subscription is not installed in this bus".into())
            })?;
        actual.declaration.check(&decision)?;
        if matches!(decision, HookDecision::Pause { .. }) {
            return Err(Error::Checkpoint(
                "hook reconciliation must settle the gate".into(),
            ));
        }
        let key = Self::key(registration, event);
        #[cfg(feature = "workflow")]
        let key = self.active_key(&bus.identity, &key, None).await?;
        let checkpoint = self
            .store
            .load(&key)
            .await?
            .ok_or_else(|| Error::Checkpoint("hook intent does not exist".into()))?;
        let mut saved: Saved = serde_json::from_value(checkpoint.state.data)
            .map_err(|e| Error::Checkpoint(e.to_string()))?;
        if checkpoint.composition != bus.identity
            || saved.hook != registration.identity
            || serde_json::to_value(&saved.event).ok() != serde_json::to_value(event).ok()
        {
            return Err(Error::Checkpoint(
                "hook reconciliation identity mismatch".into(),
            ));
        }
        if saved.resolved {
            return if saved.decision.as_ref() == Some(&decision) {
                Ok(())
            } else {
                Err(Error::Checkpoint(
                    "hook reconciliation cannot be changed".into(),
                ))
            };
        }
        if saved.error.is_none()
            && saved
                .decision
                .as_ref()
                .is_some_and(|decision| !matches!(decision, HookDecision::Pause { .. }))
        {
            return Err(Error::Checkpoint(
                "completed hook cannot be reconciled".into(),
            ));
        }
        saved.decision = Some(decision);
        saved.error = None;
        saved.resolved = true;
        self.write(&key, Some(checkpoint.revision), &bus.identity, saved)
            .await
    }
    async fn write(
        &self,
        key: &str,
        expected: Option<u64>,
        identity: &str,
        saved: Saved,
    ) -> Result<(), Error> {
        let revision = expected
            .unwrap_or(0)
            .checked_add(1)
            .ok_or_else(|| Error::Checkpoint("hook revision exhausted".into()))?;
        self.store
            .save(
                key,
                expected,
                Checkpoint {
                    version: 1,
                    revision,
                    composition: identity.into(),
                    state: RunState {
                        data: serde_json::to_value(saved)
                            .map_err(|e| Error::Checkpoint(e.to_string()))?,
                        ..Default::default()
                    },
                },
            )
            .await
    }
    #[cfg(feature = "workflow")]
    async fn active_key(
        &self,
        identity: &str,
        base: &str,
        selected: Option<&str>,
    ) -> Result<String, Error> {
        let locator_key =
            serde_json::to_string(&("hook-authority-v1", base)).expect("Hook authority key");
        let active = if let Some(cp) = self.store.load(&locator_key).await? {
            if cp.version != 1 || cp.composition != identity {
                return Err(Error::Checkpoint(
                    "Hook recovery authority identity changed".into(),
                ));
            }
            let location = serde_json::from_value(cp.state.data)
                .map_err(|e| Error::Checkpoint(e.to_string()))?;
            crate::controllers::ControllerBinding::at(self.store.clone(), location)
                .hook_key(base)
                .await?
        } else {
            base.into()
        };
        if selected.is_some_and(|key| key != active) {
            return Err(Error::Checkpoint(
                "Hook recovery command does not match its source authority".into(),
            ));
        }
        Ok(active)
    }
    #[cfg(feature = "workflow")]
    pub(crate) async fn bind_controller(
        &self,
        identity: &str,
        event: &HookEvent,
        hook: &str,
        location: crate::controllers::ControllerLocation,
    ) -> Result<(), Error> {
        let base = serde_json::to_string(&("hook-v1", &event.id, hook)).expect("Hook source key");
        let key = serde_json::to_string(&("hook-authority-v1", base)).expect("Hook authority key");
        let data = serde_json::to_value(location).map_err(|e| Error::Checkpoint(e.to_string()))?;
        if let Some(cp) = self.store.load(&key).await? {
            return if cp.version == 1 && cp.composition == identity && cp.state.data == data {
                Ok(())
            } else {
                Err(Error::Checkpoint(
                    "Hook source recovery authority cannot change".into(),
                ))
            };
        }
        self.store
            .save(
                &key,
                None,
                Checkpoint {
                    version: 1,
                    revision: 1,
                    composition: identity.into(),
                    state: RunState {
                        data,
                        ..Default::default()
                    },
                },
            )
            .await
    }
    #[cfg(all(feature = "workflow", feature = "sqlite"))]
    pub(crate) async fn validate_controller_route(
        &self,
        route: &crate::controllers::HookRoute,
        key: &str,
    ) -> Result<(), Error> {
        let cp = self
            .store
            .load(key)
            .await?
            .ok_or_else(|| Error::Checkpoint("workflow Hook source intent missing".into()))?;
        let saved: Saved =
            serde_json::from_value(cp.state.data).map_err(|e| Error::Checkpoint(e.to_string()))?;
        if cp.version != 1
            || cp.composition != route.bus_identity
            || saved.hook != route.hook_identity
            || saved.controller.as_deref() != Some(&route.controller_identity)
            || saved.resolved
            || serde_json::to_value(saved.event).ok() != serde_json::to_value(&route.event).ok()
            || (saved.error.is_none()
                && saved
                    .decision
                    .as_ref()
                    .is_some_and(|decision| !matches!(decision, HookDecision::Pause { .. })))
        {
            return Err(Error::Checkpoint(
                "workflow Hook source is complete, reconciled, or changed".into(),
            ));
        }
        Ok(())
    }
}
