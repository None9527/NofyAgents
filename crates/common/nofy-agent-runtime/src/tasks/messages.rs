use super::{journal::Journal, valid_id};
#[cfg(test)]
mod tests;
use crate::{Checkpointer, Error, RunContext};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use std::sync::Arc;
use tokio::sync::{Mutex, Notify};

#[derive(Clone, Default, Serialize, Deserialize)]
struct Messages {
    entries: Vec<Entry>,
    // A failed/uncertain save poisons this live board until it is reopened.
    // Neither readers nor automatic delivery may observe speculative entries.
    #[serde(skip)]
    failure: Option<String>,
}
#[derive(Clone, Serialize, Deserialize)]
struct Entry {
    cursor: u64,
    message_id: String,
    sender: String,
    to: String,
    body: Value,
}
pub(crate) struct Board {
    root: String,
    journal: Mutex<Journal<Messages>>,
    notify: Notify,
}
impl Board {
    pub async fn open(
        context: &RunContext,
        store: Option<Arc<dyn Checkpointer>>,
        composition: &str,
    ) -> Result<Self, Error> {
        let root = context
            .capabilities
            .get::<crate::events::RunLineage>()
            .map_or_else(|| context.run_id.clone(), |r| r.root_run_id.clone());
        let journal = Journal::open(
            store,
            serde_json::to_string(&("agent-messages/v1", &root)).expect("message key"),
            composition.into(),
        )
        .await?;
        Ok(Self {
            root,
            journal: Mutex::new(journal),
            notify: Notify::new(),
        })
    }
    pub async fn send(
        &self,
        context: &RunContext,
        id: &str,
        to: &str,
        body: Value,
    ) -> Result<Value, Error> {
        valid_id(id)?;
        valid_id(to)?;
        if serde_json::to_vec(&body)
            .map_err(|e| Error::Tool(e.to_string()))?
            .len()
            > 65536
        {
            return Err(Error::Tool("message body exceeds 64 KiB".into()));
        }
        let mut journal = self.journal.lock().await;
        journal.value.check()?;
        if let Some(entry) = journal
            .value
            .entries
            .iter()
            .find(|e| e.message_id == id && e.sender == context.run_id)
        {
            if entry.to != to || entry.body != body {
                return Err(Error::Tool(
                    "message_id already names different content".into(),
                ));
            }
            return Ok(json!(entry));
        }
        if journal.value.entries.len() >= 1024 {
            return Err(Error::Tool(
                "message limit (1024 per run tree) reached".into(),
            ));
        }
        let entry = Entry {
            cursor: journal.value.entries.len() as u64 + 1,
            message_id: id.into(),
            sender: context.run_id.clone(),
            to: to.into(),
            body,
        };
        journal.value.entries.push(entry.clone());
        // Poison before the await, not only on Err: cancelling a child can
        // drop this future while the parent still owns the shared board.
        journal.value.failure =
            Some("message persistence interrupted before acknowledgement".into());
        if let Err(error) = journal.commit().await {
            journal.value.failure = Some(error.to_string());
            self.notify.notify_waiters();
            return Err(error);
        }
        journal.value.failure = None;
        self.notify.notify_waiters();
        Ok(json!(entry))
    }
    pub async fn read(
        &self,
        context: &RunContext,
        after: u64,
        wait_ms: u64,
    ) -> Result<Value, Error> {
        let notified = self.notify.notified();
        tokio::pin!(notified);
        notified.as_mut().enable();
        let result = self.peek(context, after).await?;
        if wait_ms > 0 && result["messages"].as_array().is_some_and(Vec::is_empty) {
            tokio::select! { _ = notified => {}, _ = tokio::time::sleep(std::time::Duration::from_millis(wait_ms.min(60000))) => {}, _ = context.cancel.cancelled() => return Err(Error::Cancelled) }
            return self.peek(context, after).await;
        }
        Ok(result)
    }
    /// Delivery cursor is owned by the receiving agent checkpoint, not by the
    /// board. Manual reads and sends never acknowledge automatic delivery.
    pub async fn incoming(
        &self,
        context: &RunContext,
        after: u64,
        wait_ms: u64,
    ) -> Result<Option<(u64, Value)>, Error> {
        let notified = self.notify.notified();
        tokio::pin!(notified);
        notified.as_mut().enable();
        let result = self.next_incoming(context, after).await?;
        if result.is_some() || wait_ms == 0 {
            return Ok(result);
        }
        tokio::select! {
            _ = notified => {},
            _ = tokio::time::sleep(std::time::Duration::from_millis(wait_ms.min(100))) => {},
            _ = context.cancel.cancelled() => return Err(crate::governance::cancellation_error(context)),
        }
        self.next_incoming(context, after).await
    }
    async fn next_incoming(
        &self,
        context: &RunContext,
        after: u64,
    ) -> Result<Option<(u64, Value)>, Error> {
        let journal = self.journal.lock().await;
        journal.value.check()?;
        Ok(journal
            .value
            .entries
            .iter()
            .find(|entry| {
                entry.cursor > after
                    && entry.sender != context.run_id
                    && (entry.to == "*" || entry.to == context.run_id)
            })
            .map(|entry| (entry.cursor, json!(entry))))
    }
    async fn peek(&self, context: &RunContext, after: u64) -> Result<Value, Error> {
        let journal = self.journal.lock().await;
        journal.value.check()?;
        let entries = journal
            .value
            .entries
            .iter()
            .filter(|e| {
                e.cursor > after
                    && (e.to == "*" || e.to == context.run_id || e.sender == context.run_id)
            })
            .collect::<Vec<_>>();
        Ok(
            json!({"root_run_id":self.root,"run_id":context.run_id,"messages":entries,"next_cursor":journal.value.entries.last().map_or(0, |e| e.cursor)}),
        )
    }
}

impl Messages {
    fn check(&self) -> Result<(), Error> {
        match &self.failure {
            Some(error) => Err(Error::Checkpoint(format!(
                "message board requires recovery after failed save: {error}"
            ))),
            None => Ok(()),
        }
    }
}
