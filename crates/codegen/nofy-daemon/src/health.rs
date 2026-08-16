//! Event-loop liveness: in-loop beats + out-of-loop lag-sampling watchdog.
//!
//! The daemon's control-plane loop calls [`EventLoopHealth::beat`] each
//! iteration; a separate std thread samples the lag. `misses` consecutive
//! samples over the threshold mean the loop is wedged (blocked syscall,
//! deadlock) — the watchdog then invokes the configured wedge action
//! (forensics entry + supervisor-visible exit code), matching the hermes
//! "ring-inside self-report × ring-outside watchdog" pattern (HM-F1).

use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use std::time::{Duration, SystemTime, UNIX_EPOCH};

fn now_nanos() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_nanos() as u64)
        .unwrap_or(0)
}

/// Shared liveness counter. Cheap enough for the hot loop (one atomic store).
#[derive(Debug, Default)]
pub struct EventLoopHealth {
    last_beat_nanos: AtomicU64,
}

impl EventLoopHealth {
    pub fn new() -> Arc<Self> {
        let arc = Arc::new(Self::default());
        arc.beat();
        arc
    }

    /// In-loop: record one iteration.
    pub fn beat(&self) {
        self.last_beat_nanos.store(now_nanos(), Ordering::Relaxed);
    }

    /// Out-of-loop: how long since the last beat.
    pub fn lag(&self) -> Duration {
        let last = self.last_beat_nanos.load(Ordering::Relaxed);
        Duration::from_nanos(now_nanos().saturating_sub(last))
    }
}

#[derive(Debug, Clone)]
pub struct WatchdogConfig {
    /// Sampling period of the out-of-loop thread.
    pub sample_interval: Duration,
    /// A sample over this counts as a miss.
    pub lag_threshold: Duration,
    /// Consecutive misses before the wedge action fires.
    pub misses_before_wedge: u32,
}

impl Default for WatchdogConfig {
    fn default() -> Self {
        Self {
            sample_interval: Duration::from_secs(5),
            lag_threshold: Duration::from_secs(30),
            misses_before_wedge: 3,
        }
    }
}

/// Spawn the ring-outside watchdog. The action runs on the watchdog thread;
/// returning `true` from it stops the watchdog (the process is expected to be
/// exiting), `false` continues sampling.
pub fn spawn_watchdog<F>(health: Arc<EventLoopHealth>, cfg: WatchdogConfig, mut on_wedge: F) -> std::thread::JoinHandle<()>
where
    F: FnMut(Duration) -> bool + Send + 'static,
{
    std::thread::Builder::new()
        .name("nofy-daemon-watchdog".into())
        .spawn(move || {
            let mut misses = 0u32;
            loop {
                std::thread::sleep(cfg.sample_interval);
                let lag = health.lag();
                if lag > cfg.lag_threshold {
                    misses += 1;
                    tracing::warn!(?lag, misses, "event loop lag above threshold");
                    if misses >= cfg.misses_before_wedge && on_wedge(lag) {
                        return;
                    }
                } else {
                    misses = 0;
                }
            }
        })
        .expect("spawn watchdog thread")
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::{Arc as StdArc, Mutex};

    #[test]
    fn fresh_health_has_small_lag() {
        let h = EventLoopHealth::new();
        assert!(h.lag() < Duration::from_secs(1));
        std::thread::sleep(Duration::from_millis(20));
        assert!(h.lag() >= Duration::from_millis(20));
        h.beat();
        assert!(h.lag() < Duration::from_millis(20));
    }

    #[test]
    fn watchdog_trips_on_stalled_loop() {
        let h = EventLoopHealth::new();
        // Let the beat go stale, then run a tight watchdog.
        std::thread::sleep(Duration::from_millis(60));
        let trips = StdArc::new(Mutex::new(0u32));
        let trips2 = trips.clone();
        let handle = spawn_watchdog(
            h,
            WatchdogConfig {
                sample_interval: Duration::from_millis(10),
                lag_threshold: Duration::from_millis(30),
                misses_before_wedge: 2,
            },
            move |_lag| {
                *trips2.lock().unwrap() += 1;
                true // stop after first wedge
            },
        );
        handle.join().unwrap();
        assert_eq!(*trips.lock().unwrap(), 1, "wedge action fired exactly once");
    }

    #[test]
    fn beating_loop_never_trips() {
        let h = EventLoopHealth::new();
        let trips = StdArc::new(Mutex::new(0u32));
        let trips2 = trips.clone();
        let handle = spawn_watchdog(
            h.clone(),
            WatchdogConfig {
                sample_interval: Duration::from_millis(5),
                lag_threshold: Duration::from_millis(50),
                misses_before_wedge: 2,
            },
            move |_| {
                *trips2.lock().unwrap() += 1;
                false
            },
        );
        let stop = std::time::Instant::now();
        while stop.elapsed() < Duration::from_millis(100) {
            h.beat();
            std::thread::sleep(Duration::from_millis(5));
        }
        drop(h); // watchdog keeps sampling a stale counter afterwards; stop it
        // The watchdog may trip AFTER we stop beating; assert it never tripped
        // while the loop was healthy by checking quickly before staleness
        // accumulates: join is not possible (loop runs until wedge), so leak it.
        std::mem::forget(handle);
        assert_eq!(*trips.lock().unwrap(), 0, "healthy loop must not wedge");
    }
}
