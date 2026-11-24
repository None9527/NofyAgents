use crate::*;
use std::{
    collections::{BTreeMap, BTreeSet},
    time::{Duration, Instant},
};
use tokio::task::JoinSet;

const FALLBACK_POLL_INTERVAL: Duration = Duration::from_secs(2);
const RUNTIME_REFRESH_INTERVAL: Duration = Duration::from_secs(5);
const SHUTDOWN_DRAIN_TIMEOUT: Duration = Duration::from_secs(15);

pub(crate) async fn run(
    host: KernelHost,
    shutdown: CancellationToken,
    concurrency: usize,
) -> Result<()> {
    if !(1..=64).contains(&concurrency) {
        return Err(HostError::Invalid(
            "worker concurrency must be 1..=64".into(),
        ));
    }
    let mut tasks = JoinSet::new();
    let mut active = BTreeSet::new();
    let mut retry = BTreeMap::new();
    let mut changes = host.store.observe();
    let mut seen_runs = changes.borrow_and_update().runs;
    let mut tick = tokio::time::interval(FALLBACK_POLL_INTERVAL);
    tick.set_missed_tick_behavior(tokio::time::MissedTickBehavior::Delay);
    let mut last_refresh: Option<Instant> = None;
    loop {
        let wait_runs = async {
            if changes
                .wait_for(|next| next.runs != seen_runs)
                .await
                .is_err()
            {
                std::future::pending::<()>().await;
            }
        };
        tokio::select! {
            biased;
            _ = shutdown.cancelled() => break,
            _ = host.stop.cancelled() => break,
            Some(result) = tasks.join_next(), if !tasks.is_empty() => {
                let (run, result) =
                    result.map_err(|e| HostError::Unavailable(format!("worker task failed: {e}")))?;
                active.remove(&run);
                if let Err(error) = result {
                    // Unknown intents and missing resources remain recorded by
                    // the original runtime. Back off; never create a new run.
                    eprintln!("managed run {run}: {error}");
                    retry.insert(run, Instant::now() + Duration::from_secs(30));
                }
            }
            _ = host.wake.notified() => {}
            _ = wait_runs => {}
            _ = tick.tick() => {}
        }
        seen_runs = changes.borrow_and_update().runs;
        retry.retain(|_, at| *at > Instant::now());
        let Some(history) = host.runtime_history.execution()? else {
            continue;
        };
        if let Err(error) = host.evolution.advance(&host).await {
            eprintln!("Omni evolution: {error}");
        }
        // Refresh trusted metadata outside all module factories on a bounded
        // cadence instead of every wakeup/250ms. A broken optional runtime
        // catalog must not terminate unrelated HTTP/SDK work.
        if last_refresh.is_none_or(|at| at.elapsed() >= RUNTIME_REFRESH_INTERVAL) {
            let _ = host.loader.refresh_async().await;
            last_refresh = Some(Instant::now());
        }
        let mut cursor = 0;
        while tasks.len() < concurrency {
            let actions = host.store.managed_action_heads(cursor, 256).await?;
            if actions.is_empty() {
                break;
            }
            for (sequence, run, command) in actions {
                cursor = sequence;
                if tasks.len() >= concurrency {
                    break;
                }
                if active.contains(&run) || retry.contains_key(&run) {
                    continue;
                }
                active.insert(run.clone());
                let host = host.clone();
                let history = history.clone();
                tasks.spawn(async move {
                    let _history = history;
                    let result = async {
                        let _memory = host
                            .loader
                            .memory_provider
                            .admit_execution(&host.store, &run, Some(&command))
                            .await?;
                        host.supervisor
                            .execute_managed_action(&host.registry, &command)
                            .await
                            .map(|_| ())
                            .map_err(HostError::from)
                    }
                    .await;
                    (run, result)
                });
            }
        }
        let mut cursor = 0;
        while tasks.len() < concurrency {
            let runs = host.store.managed_queue_heads(cursor, 256).await?;
            if runs.is_empty() {
                break;
            }
            for (sequence, id) in runs {
                cursor = sequence;
                if tasks.len() >= concurrency {
                    break;
                }
                if active.contains(&id) || retry.contains_key(&id) {
                    continue;
                }
                active.insert(id.clone());
                let host = host.clone();
                let history = history.clone();
                tasks.spawn(async move {
                    let _history = history;
                    let result = async {
                        let _memory = host
                            .loader
                            .memory_provider
                            .admit_execution(&host.store, &id, None)
                            .await?;
                        host.supervisor
                            .execute_queue_head(&host.registry, &id)
                            .await
                            .map(|_| ())
                            .map_err(HostError::from)
                    }
                    .await;
                    (id, result)
                });
            }
        }
    }
    // Quiesce admissions in the server before requesting shutdown. In-flight
    // effects finish normally within a bounded drain window; forced termination
    // relies on durable recovery.
    host.shutdown();
    drain_tasks(&mut tasks, SHUTDOWN_DRAIN_TIMEOUT).await
}

async fn drain_tasks(tasks: &mut JoinSet<(String, Result<()>)>, timeout: Duration) -> Result<()> {
    let deadline = tokio::time::Instant::now() + timeout;
    loop {
        let remaining = deadline.saturating_duration_since(tokio::time::Instant::now());
        if remaining.is_zero() {
            let abandoned = tasks.len();
            if abandoned == 0 {
                return Ok(());
            }
            tasks.abort_all();
            let _ = tokio::time::timeout(Duration::from_secs(2), async {
                while tasks.join_next().await.is_some() {}
            })
            .await;
            return Err(HostError::Unavailable(format!(
                "worker shutdown drain timed out after {}s with {abandoned} active task(s)",
                timeout.as_secs()
            )));
        }
        match tokio::time::timeout(remaining, tasks.join_next()).await {
            Ok(Some(result)) => {
                let (run, result) = result.map_err(|e| HostError::Unavailable(e.to_string()))?;
                if let Err(error) = result {
                    eprintln!("managed run {run} during shutdown: {error}");
                }
            }
            Ok(None) => return Ok(()),
            Err(_) => {
                let abandoned = tasks.len();
                tasks.abort_all();
                let _ = tokio::time::timeout(Duration::from_secs(2), async {
                    while tasks.join_next().await.is_some() {}
                })
                .await;
                return Err(HostError::Unavailable(format!(
                    "worker shutdown drain timed out after {}s with {abandoned} active task(s)",
                    timeout.as_secs()
                )));
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn drain_tasks_bounds_wedged_workers() {
        let mut tasks = JoinSet::new();
        tasks.spawn(async {
            std::future::pending::<()>().await;
            ("stuck-run".to_string(), Ok(()))
        });
        let error = drain_tasks(&mut tasks, Duration::from_millis(50))
            .await
            .unwrap_err();
        assert!(error.to_string().contains("timed out"), "{error}");
    }
}
