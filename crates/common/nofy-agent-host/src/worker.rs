use crate::*;
use std::{
    collections::{BTreeMap, BTreeSet},
    time::{Duration, Instant},
};
use tokio::task::JoinSet;
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
    let mut tick = tokio::time::interval(Duration::from_millis(250));
    loop {
        tokio::select! {
            biased;
            _=shutdown.cancelled()=>break,
            _=host.stop.cancelled()=>break,
            Some(result)=tasks.join_next(),if !tasks.is_empty()=>{
                let (run,result)=result.map_err(|e|HostError::Unavailable(format!("worker task failed: {e}")))?;
                active.remove(&run);
                if let Err(error)=result {
                    // Unknown intents and missing resources remain recorded by
                    // the original runtime. Back off; never create a new run.
                    eprintln!("managed run {run}: {error}");
                    retry.insert(run,Instant::now()+Duration::from_secs(30));
                }
            }
            _=host.wake.notified()=>{},
            _=tick.tick()=>{},
        }
        retry.retain(|_, at| *at > Instant::now());
        let Some(history) = host.runtime_history.execution()? else {
            continue;
        };
        // Refresh trusted metadata outside all module factories. A broken
        // optional runtime catalog must not terminate unrelated HTTP/SDK work.
        let _ = host.loader.refresh_async().await;
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
                            .execute_submitted(&host.registry, &id)
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
    // effects finish normally; forced process termination uses durable recovery.
    host.shutdown();
    while let Some(result) = tasks.join_next().await {
        let (run, result) = result.map_err(|e| HostError::Unavailable(e.to_string()))?;
        if let Err(error) = result {
            eprintln!("managed run {run} during shutdown: {error}");
        }
    }
    Ok(())
}
