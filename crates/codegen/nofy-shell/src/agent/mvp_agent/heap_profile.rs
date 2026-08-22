//! Heap-profile monitor wiring for [`MvpAgent`].
//!
//! Full-reapply sites call [`MvpAgent::reconfigure_heap_profile_monitor`].
//! K12 scoped kill-switch reconfigures only jemalloc fields (no wholesale
//! `remote_settings` rewrite, no `re_resolve_runtime_fields` / telemetry re-init).

use super::*;

impl MvpAgent {
    pub(super) fn reconfigure_heap_profile_monitor(&self) {
        let zdr = self.is_data_collection_disabled();
        let config = self.cfg.borrow().resolve_jemalloc_heap_profile(zdr);
        let handles = self.heap_profile_upload_handles();
        self.heap_profile_monitor
            .borrow_mut()
            .reconfigure(config, handles);
    }

    pub(super) fn heap_profile_set_session_id(&self, session_id: &str) {
        self.heap_profile_monitor
            .borrow_mut()
            .set_session_id(session_id.to_owned());
    }

    fn heap_profile_upload_handles(&self) -> Option<crate::heap_profile::HeapProfileUploadHandles> {
        // Heap-profile dumps were uploaded through the removed trace-upload
        // pipeline; without upload handles the monitor never enables itself
        // (`resolve_jemalloc_heap_profile` also gates on the always-off
        // trace-upload switch).
        None
    }

    /// Background poll (agent entrypoints only). Idempotent; skipped under
    /// `cfg!(test)`.
    pub(super) fn spawn_heap_profile_monitor(&self) {
        if cfg!(test) || self.heap_profile_started.replace(true) {
            return;
        }
        self.reconfigure_heap_profile_monitor();
        let agent_ref = LocalRef::new(self);
        tokio::task::spawn_local(async move {
            loop {
                let poll_interval = {
                    let mon = agent_ref.get().heap_profile_monitor.borrow();
                    if mon.config().enabled {
                        mon.config().poll_interval
                    } else {
                        std::time::Duration::from_secs(30)
                    }
                };
                tokio::time::sleep(poll_interval).await;

                let reported = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
                    agent_ref.get().report_resource_usage_if_due();
                }));
                if reported.is_err() {
                    tracing::error!("resource telemetry: report tick panicked; continuing");
                }

                let enabled = agent_ref
                    .get()
                    .heap_profile_monitor
                    .borrow()
                    .config()
                    .enabled;
                if !enabled {
                    continue;
                }

                let result = futures::FutureExt::catch_unwind(std::panic::AssertUnwindSafe(
                    agent_ref.get().heap_profile_poll_tick_once(),
                ))
                .await;
                if result.is_err() {
                    agent_ref
                        .get()
                        .heap_profile_monitor
                        .borrow_mut()
                        .clear_upload_in_flight();
                    tracing::error!("heap_profile: poll tick panicked; continuing");
                }
            }
        });
    }

    async fn heap_profile_poll_tick_once(&self) {
        let pending = {
            let mut mon = self.heap_profile_monitor.borrow_mut();
            mon.begin_tick()
        };
        let Some(pending) = pending else {
            return;
        };
        let threshold = pending.threshold;
        let outcome = pending.execute().await;
        self.heap_profile_monitor
            .borrow_mut()
            .finish_tick(threshold, outcome);
    }

}

#[cfg(test)]
mod tests {
    use super::*;

    fn cfg_with_remote(rs: crate::util::config::RemoteSettings) -> AgentConfig {
        AgentConfig {
            remote_settings: Some(rs),
            ..Default::default()
        }
    }

    #[test]
    fn full_reapply_reads_stored_remote_jemalloc_fields() {
        let thresholds = vec![100u64, 200];
        let cfg = cfg_with_remote(crate::util::config::RemoteSettings {
            jemalloc_heap_profile_enabled: Some(true),
            jemalloc_heap_profile_thresholds_bytes: Some(thresholds.clone()),
            jemalloc_heap_profile_poll_interval_secs: Some(45),
            trace_upload_enabled: Some(true),
            telemetry_mode: Some("all".into()),
            ..Default::default()
        });

        let full = cfg.resolve_jemalloc_heap_profile(false);
        // Without installed hooks, prof_available is false → disabled.
        assert!(!full.enabled);
        assert_eq!(full.poll_interval, std::time::Duration::from_secs(45));
        assert_eq!(full.thresholds, vec![100, 200]);

        let free = crate::heap_profile::resolve_jemalloc_heap_profile(
            Some(true),
            Some(&thresholds),
            Some(45),
            false,
            true,
            true,
        );
        assert!(free.enabled);
        assert_eq!(free.thresholds, vec![100, 200]);
        assert_eq!(free.poll_interval, std::time::Duration::from_secs(45));
    }
}
