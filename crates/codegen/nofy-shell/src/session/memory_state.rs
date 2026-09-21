//! `SessionMemory` — memory subsystem state for the session actor.
//!
//! Groups storage, flush config, injection state, and telemetry counters
//! that were previously scattered across 15 fields on `SessionActor`.

use std::cell::RefCell;
use std::sync::Arc;
use std::sync::atomic::{AtomicBool, AtomicU64};

/// Memory subsystem state for a session.
pub(crate) struct SessionMemory {
    /// Durable automatic-capture queue/worker for the top-level session.
    /// Canonical memory facts are never cached here.
    pub capture: Option<crate::session::memory_capture::SessionCapture>,
    /// Most recent completed transcript/capture barrier, for diagnostics and
    /// duplicate-hook verification only.
    pub last_capture_barrier: RefCell<Option<crate::session::memory_capture::CaptureBarrier>>,
    /// Runtime gate for the single unified memory service. The service itself
    /// is owned by the tool bridge resources.
    pub enabled: AtomicBool,
    /// Whether to write a session summary to memory on session end.
    pub save_on_end: bool,
    /// First-turn memory injection behavior resolved from local + remote config.
    pub initial_injection_config: crate::config::MemoryInitialInjectionConfig,
    /// Per-process latch: the first-turn injection decision already ran in
    /// this session segment. Cross-segment idempotency comes from
    /// `conversation_has_memory_context`, not this flag.
    pub context_injected: AtomicBool,
    /// Memory flush configuration (from MemoryConfig).
    pub flush_config: crate::config::MemoryFlushConfig,
    /// When `true`, auto-compact checks are suppressed during memory flush.
    pub is_flushing: AtomicBool,
    /// The compaction count at which the last flush ran (once-per-cycle guard).
    pub last_flush_compaction: AtomicU64,
    /// Number of flushes executed in this session.
    pub flush_count: AtomicU64,
    /// Content from the most recent successful flush, used for delta prompts.
    /// Wrapped in `RefCell` because `SessionActor` is single-threaded (LocalSet).
    pub last_flush_content: RefCell<Option<String>>,
    /// Number of successful flushes.
    pub flush_success_count: AtomicU64,
    /// Number of failed flushes.
    pub flush_error_count: AtomicU64,
    /// Counts model-initiated `memory_search` tool calls.
    /// Wrapped in `RefCell` to allow `/memory on|off` toggle from `&Arc<SessionActor>`.
    pub search_counter: RefCell<Option<Arc<AtomicU64>>>,
    /// Counts first-turn memory context injections.
    pub injection_count: AtomicU64,
    /// Counts post-compaction memory re-injection searches.
    pub compaction_recovery_count: AtomicU64,
    /// Total memory chunks added across all sources.
    pub chunks_added: Arc<AtomicU64>,
    /// autoDream consolidation config.
    pub dream_config: crate::config::MemoryDreamConfig,
    /// Number of dream consolidations attempted.
    pub dream_count: AtomicU64,
    /// Number of successful dream consolidations.
    pub dream_success_count: AtomicU64,
    /// Number of failed dream consolidations.
    pub dream_error_count: AtomicU64,
}

impl SessionMemory {
    pub(crate) fn record_capture_barrier(
        &self,
        barrier: crate::session::memory_capture::CaptureBarrier,
    ) {
        *self.last_capture_barrier.borrow_mut() = Some(barrier);
    }

    pub(crate) fn shutdown_capture(&self) {
        let Some(capture) = &self.capture else {
            return;
        };
        if let Err(error) = capture.shutdown(nofy_memory::capture::CaptureShutdown::Cancel) {
            tracing::warn!(%error, "memory capture worker shutdown failed");
        }
    }

    /// Whether memory is enabled for this session.
    pub(crate) fn is_enabled(&self) -> bool {
        self.enabled.load(std::sync::atomic::Ordering::Relaxed)
    }

    pub(crate) fn set_enabled(&self, enabled: bool) {
        self.enabled
            .store(enabled, std::sync::atomic::Ordering::Relaxed);
    }

    /// Attempt to acquire the flush lock. Returns `true` if acquired,
    /// `false` if another flush is already in progress.
    pub(crate) fn try_acquire_flush_lock(&self) -> bool {
        self.is_flushing
            .compare_exchange(
                false,
                true,
                std::sync::atomic::Ordering::Relaxed,
                std::sync::atomic::Ordering::Relaxed,
            )
            .is_ok()
    }

    /// Release the flush lock.
    pub(crate) fn release_flush_lock(&self) {
        self.is_flushing
            .store(false, std::sync::atomic::Ordering::Relaxed);
    }

    /// Record a flush result and increment the appropriate counter.
    ///
    /// Matches the original three-way logic: "written" increments success,
    /// "error" increments error, anything else ("nothing_to_store", "rejected")
    /// increments only the total flush count.
    pub(crate) fn record_flush_result(&self, outcome: &str) {
        self.flush_count
            .fetch_add(1, std::sync::atomic::Ordering::Relaxed);
        match outcome {
            "written" => {
                self.flush_success_count
                    .fetch_add(1, std::sync::atomic::Ordering::Relaxed);
            }
            "error" => {
                self.flush_error_count
                    .fetch_add(1, std::sync::atomic::Ordering::Relaxed);
            }
            _ => {}
        }
    }

    /// Record a dream consolidation result.
    pub(crate) fn record_dream_result(&self, success: bool) {
        use std::sync::atomic::Ordering::Relaxed;
        self.dream_count.fetch_add(1, Relaxed);
        if success {
            self.dream_success_count.fetch_add(1, Relaxed);
        } else {
            self.dream_error_count.fetch_add(1, Relaxed);
        }
    }

    /// Record a neutral dream outcome (nothing to consolidate / skipped).
    pub(crate) fn record_dream_neutral(&self) {
        self.dream_count
            .fetch_add(1, std::sync::atomic::Ordering::Relaxed);
    }

    /// Collect telemetry counters for session-end summary.
    pub(crate) fn telemetry_snapshot(&self) -> MemoryTelemetry {
        use std::sync::atomic::Ordering::Relaxed;
        MemoryTelemetry {
            flush_count: self.flush_count.load(Relaxed),
            flush_success_count: self.flush_success_count.load(Relaxed),
            flush_error_count: self.flush_error_count.load(Relaxed),
            tool_search_count: self
                .search_counter
                .borrow()
                .as_ref()
                .map_or(0, |c| c.load(Relaxed)),
            injection_count: self.injection_count.load(Relaxed),
            compaction_recovery_count: self.compaction_recovery_count.load(Relaxed),
            chunks_added: self.chunks_added.load(Relaxed),
            dream_count: self.dream_count.load(Relaxed),
            dream_success_count: self.dream_success_count.load(Relaxed),
            dream_error_count: self.dream_error_count.load(Relaxed),
        }
    }
}

/// Snapshot of memory telemetry counters for session-end logging.
pub(crate) struct MemoryTelemetry {
    pub flush_count: u64,
    pub flush_success_count: u64,
    pub flush_error_count: u64,
    pub tool_search_count: u64,
    pub injection_count: u64,
    pub compaction_recovery_count: u64,
    pub chunks_added: u64,
    pub dream_count: u64,
    pub dream_success_count: u64,
    pub dream_error_count: u64,
}
