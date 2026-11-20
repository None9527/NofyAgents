use crate::{KernelHost, Result};
use std::time::Duration;
use tokio_util::sync::CancellationToken;

impl KernelHost {
    pub async fn prepare_session_titles(&self) -> Result<()> {
        let Some(_history) = self.runtime_history.execution()? else {
            return Ok(());
        };
        let mut after = String::new();
        while let Some(next) = self.store.backfill_session_title_page(after).await? {
            after = next;
        }
        Ok(())
    }

    pub async fn run_session_titles(&self, shutdown: CancellationToken) {
        let mut changes = self.store.observe();
        loop {
            if shutdown.is_cancelled() || self.stop.is_cancelled() {
                return;
            }
            let baseline = *changes.borrow_and_update();
            let work = async {
                let Some(_history) = self.runtime_history.execution()? else {
                    return Ok(Some(false));
                };
                let (claimed, waiting_for_model) = self.store.claim_session_title().await?;
                let Some((session, run)) = claimed else {
                    return Ok(Some(waiting_for_model));
                };
                self.generate_title(session, run, &mut changes).await?;
                Ok::<_, crate::HostError>(None)
            };
            let (wait, waiting_for_model) = match tokio::select! {
                biased;
                _ = shutdown.cancelled() => return,
                _ = self.stop.cancelled() => return,
                result = work => result,
            } {
                Ok(None) => continue,
                Ok(Some(waiting)) => (Duration::from_secs(30), waiting),
                Err(_) => (Duration::from_secs(5), false),
            };
            tokio::select! {
                biased;
                _ = shutdown.cancelled() => return,
                _ = self.stop.cancelled() => return,
                _ = changes.wait_for(|next| {
                    next.sessions != baseline.sessions || (waiting_for_model && next.events != baseline.events)
                }) => {},
                _ = tokio::time::sleep(wait) => {},
            }
        }
    }

    async fn generate_title(
        &self,
        session: String,
        run: String,
        changes: &mut tokio::sync::watch::Receiver<nofy_agent_runtime::durable::RuntimeChanges>,
    ) -> Result<()> {
        let mut observed = changes.borrow_and_update().sessions;
        if !self.store.session_title_is_current(&session).await? {
            return Ok(());
        }
        let cancel = self.stop.child_token();
        let _cancel_on_drop = cancel.clone().drop_guard();
        let sample = self
            .supervisor
            .generate_session_title(&self.registry, &run, cancel);
        let sample = tokio::time::timeout(Duration::from_secs(60), sample);
        tokio::pin!(sample);
        loop {
            tokio::select! {
                biased;
                change = changes.changed() => {
                    if change.is_err() {
                        return Ok(());
                    }
                    let latest = changes.borrow_and_update().sessions;
                    if latest != observed && !self.store.session_title_is_current(&session).await? {
                        return Ok(());
                    }
                    observed = latest;
                }
                result = &mut sample => {
                    if let Ok(Ok(Some(title))) = result {
                        self.store.finish_session_title(session, run.clone(), title).await?;
                    }
                    return Ok(());
                }
            }
        }
    }
}
