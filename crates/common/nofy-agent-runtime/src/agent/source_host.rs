//! Optional source plans use the existing checkpoint and model receipt rails.
//! Incomplete plans remain pending across a pause, a lost worker, and recovery.
use super::*;
use crate::{
    hooks::progress::{PreparedSource, PreparedSources},
    system::content_digest,
};

impl AgentHost<'_> {
    pub(super) async fn context_source_messages(
        &mut self,
        revisions: &[Option<String>],
    ) -> Result<Option<Vec<Message>>, Error> {
        let count = self.agent.context_sources.len();
        let input_digest = content_digest(&self.state.messages)?;
        let mut progress = self.state.hook_progress.prepared_sources.clone();
        if let Some(saved) = &progress {
            if saved.protocol != "nofy.context-source-preparation/v1"
                || saved.next > count
                || saved.revisions.len() != count
                || saved
                    .pending
                    .as_ref()
                    .is_some_and(|pending| pending.index != saved.next || pending.index >= count)
            {
                return Err(Error::Checkpoint(
                    "invalid prepared context source position".into(),
                ));
            }
            // An admitted effect must consume its original plan before a new
            // input/revision can replace it. Completed contributions are local.
            if saved.pending.is_none()
                && (saved.revisions != revisions || saved.input_digest != input_digest)
            {
                self.state.hook_progress.prepared_sources = None;
                self.commit().await?;
                return Ok(None);
            }
        }
        let mut messages = progress
            .as_ref()
            .map(|p| p.messages.clone())
            .unwrap_or_default();
        let mut next = progress.as_ref().map_or(0, |p| p.next);
        while next < count {
            let source = self.agent.context_sources[next].clone();
            let pending = if let Some(pending) = progress.as_ref().and_then(|p| p.pending.clone()) {
                Some(pending)
            } else {
                let plan = crate::governance::await_resource(
                    &self.context,
                    source.prepare(&self.state, &self.context),
                )
                .await?;
                if let Some(plan) = plan {
                    if !self
                        .agent
                        .checkpoint
                        .as_ref()
                        .is_some_and(|store| store.is_durable())
                    {
                        return Err(Error::Checkpoint(
                            "prepared context requires a durable checkpointer".into(),
                        ));
                    }
                    if serde_json::to_vec(&plan)
                        .map_err(|e| Error::Composition(e.to_string()))?
                        .len()
                        > 16 * 1024 * 1024
                    {
                        return Err(Error::Composition(
                            "prepared context plan exceeds 16 MiB".into(),
                        ));
                    }
                    self.state.hook_progress.source_sequence = self
                        .state
                        .hook_progress
                        .source_sequence
                        .checked_add(1)
                        .ok_or_else(|| {
                            Error::Checkpoint("context source sequence exhausted".into())
                        })?;
                    let scope = format!(
                        "context-source:{}",
                        content_digest(&(
                            &self.context.thread_id,
                            &self.context.run_id,
                            self.state.model_sequence,
                            self.state.hook_progress.turn,
                            self.state.hook_progress.source_sequence,
                            next,
                        ))?
                    );
                    let pending = PreparedSource {
                        index: next,
                        plan,
                        scope,
                    };
                    let saved = progress.get_or_insert_with(|| PreparedSources {
                        protocol: "nofy.context-source-preparation/v1".into(),
                        revisions: revisions.to_vec(),
                        input_digest: input_digest.clone(),
                        next,
                        messages: messages.clone(),
                        pending: None,
                    });
                    saved.pending = Some(pending.clone());
                    self.state.hook_progress.prepared_sources = progress.clone();
                    self.commit().await?;
                    Some(pending)
                } else {
                    None
                }
            };
            let result = if let Some(pending) = pending {
                let scoped = crate::governance::operation_context(&self.context, pending.scope);
                crate::governance::await_resource(
                    &scoped,
                    source.contribute_prepared(&self.state, &pending.plan, &scoped),
                )
                .await
            } else {
                crate::governance::await_resource(
                    &self.context,
                    source.contribute(&self.state, &self.context),
                )
                .await
            };
            let contribution = match result {
                Ok(messages) => messages,
                Err(Error::Cancelled) => {
                    self.state.hook_progress.prepared_sources = None;
                    self.commit().await?;
                    return Err(Error::Cancelled);
                }
                Err(error) => return Err(error),
            };
            messages.extend(contribution);
            next += 1;
            if let Some(saved) = progress.as_mut() {
                saved.next = next;
                saved.messages = messages.clone();
                saved.pending = None;
                let original_revisions = saved.revisions.clone();
                let original_input = saved.input_digest.clone();
                self.state.hook_progress.prepared_sources = progress.clone();
                self.commit().await?;
                if self.context_revisions().await? != original_revisions
                    || content_digest(&self.state.messages)? != original_input
                {
                    self.state.hook_progress.prepared_sources = None;
                    self.commit().await?;
                    return Ok(None);
                }
            }
        }
        Ok(Some(messages))
    }
}
