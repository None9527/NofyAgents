//! Resident-runtime eviction: LRU order × memory-pressure advisor (HM-F6).
//!
//! The daemon hosts N detached session runtimes; under memory pressure the
//! coldest ones are evicted to disk (DETACHED, resumable — the session state
//! is journal-backed, so eviction never loses work). Two orthogonal pieces:
//!
//! - [`LruRegistry`] — touch/evict order, capacity cap;
//! - [`pressure`] — PSI sampling from `/proc/pressure/memory` (host) or the
//!   cgroup `memory.pressure` file (containerized), parsed defensively so an
//!   absent kernel feature degrades to "no signal", never an error.
//!
//! The advisor combines them: capacity overflow always evicts; pressure above
//! threshold evicts even under capacity.

/// Eviction order over resident runtimes. `touch` on every client attach /
/// prompt; `coldest` is the eviction victim.
#[derive(Debug, Default)]
pub struct LruRegistry<K> {
    order: Vec<K>,
}

impl<K: Eq + Clone> LruRegistry<K> {
    pub fn new() -> Self {
        Self { order: Vec::new() }
    }

    pub fn touch(&mut self, key: K) {
        self.order.retain(|k| k != &key);
        self.order.push(key);
    }

    pub fn remove(&mut self, key: &K) {
        self.order.retain(|k| k != key);
    }

    pub fn len(&self) -> usize {
        self.order.len()
    }

    pub fn is_empty(&self) -> bool {
        self.order.is_empty()
    }

    /// Coldest (least recently touched) entry, if any.
    pub fn coldest(&self) -> Option<&K> {
        self.order.first()
    }
}

pub mod pressure {
    /// PSI "some" line, e.g. `some avg10=3.20 avg60=1.10 avg300=0.50 total=123456`.
    /// Returns the `avg10` percentage, or None when unparseable/absent.
    pub fn parse_some_avg10(line: &str) -> Option<f64> {
        if !line.starts_with("some") {
            return None;
        }
        for field in line.split_whitespace().skip(1) {
            if let Some(v) = field.strip_prefix("avg10=") {
                return v.parse().ok();
            }
        }
        None
    }

    /// Sample the given PSI file (host `/proc/pressure/memory` or a cgroup
    /// `memory.pressure`). None = feature absent (kernel/config) → caller
    /// treats as "no signal".
    pub fn sample_file(path: &std::path::Path) -> Option<f64> {
        let text = std::fs::read_to_string(path).ok()?;
        text.lines().find_map(parse_some_avg10)
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        #[test]
        fn parses_some_line() {
            assert_eq!(
                parse_some_avg10("some avg10=3.20 avg60=1.10 avg300=0.50 total=123456"),
                Some(3.2)
            );
        }

        #[test]
        fn full_line_is_not_some() {
            assert_eq!(parse_some_avg10("full avg10=9.00"), None);
        }

        #[test]
        fn garbage_is_none() {
            assert_eq!(parse_some_avg10("some avg10=xx"), None);
            assert_eq!(parse_some_avg10(""), None);
        }

        #[test]
        fn some_line_without_avg10_is_none() {
            // Fields present but no avg10= among them.
            assert_eq!(parse_some_avg10("some avg60=1.10 total=42"), None);
        }

        #[test]
        fn sample_file_reads_psi_and_absent_is_none() {
            let dir = tempfile::tempdir().unwrap();
            let psi = dir.path().join("memory.pressure");
            std::fs::write(
                &psi,
                "some avg10=3.20 avg60=1.10 avg300=0.50 total=123\nfull avg10=0.00\n",
            )
            .unwrap();
            assert_eq!(sample_file(&psi), Some(3.2));
            assert_eq!(sample_file(&dir.path().join("nope")), None);
        }

        #[test]
        fn real_proc_pressure_when_present() {
            // On hosts with PSI this must parse; on others it is None — the
            // point is "never an error", asserted by the Option type.
            let _ = sample_file(std::path::Path::new("/proc/pressure/memory"));
        }
    }
}

#[derive(Debug, Clone, Copy)]
pub struct EvictionPolicy {
    /// Resident capacity; overflow always evicts.
    pub capacity: usize,
    /// PSI some-avg10 percentage above which pressure evicts under capacity.
    pub pressure_threshold: f64,
}

impl Default for EvictionPolicy {
    fn default() -> Self {
        Self {
            capacity: 16,
            pressure_threshold: 25.0,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum EvictionAdvice {
    Keep,
    EvictColdest,
}

impl EvictionPolicy {
    /// Decide given current residency and a pressure sample (None = no signal).
    pub fn advise(&self, resident: usize, pressure: Option<f64>) -> EvictionAdvice {
        if resident > self.capacity {
            return EvictionAdvice::EvictColdest;
        }
        if let Some(p) = pressure {
            if p > self.pressure_threshold && resident > 0 {
                return EvictionAdvice::EvictColdest;
            }
        }
        EvictionAdvice::Keep
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn lru_order_and_coldest() {
        let mut reg = LruRegistry::new();
        reg.touch("a");
        reg.touch("b");
        reg.touch("a"); // a becomes hot; b coldest
        assert_eq!(reg.coldest(), Some(&"b"));
        reg.remove(&"b");
        assert_eq!(reg.coldest(), Some(&"a"));
    }

    #[test]
    fn lru_len_and_is_empty_track_residency() {
        let mut reg = LruRegistry::new();
        assert!(reg.is_empty());
        assert_eq!(reg.len(), 0);
        reg.touch("a");
        assert!(!reg.is_empty());
        assert_eq!(reg.len(), 1);
        reg.touch("b");
        assert_eq!(reg.len(), 2);
        reg.remove(&"a");
        assert_eq!(reg.len(), 1);
    }

    #[test]
    fn capacity_overflow_evicts() {
        let pol = EvictionPolicy {
            capacity: 1,
            pressure_threshold: 99.0,
        };
        assert_eq!(pol.advise(2, None), EvictionAdvice::EvictColdest);
        assert_eq!(pol.advise(1, None), EvictionAdvice::Keep);
    }

    #[test]
    fn pressure_evicts_under_capacity() {
        let pol = EvictionPolicy {
            capacity: 4,
            pressure_threshold: 25.0,
        };
        assert_eq!(pol.advise(2, Some(30.0)), EvictionAdvice::EvictColdest);
        assert_eq!(pol.advise(2, Some(10.0)), EvictionAdvice::Keep);
        // No signal (PSI absent) never evicts under capacity.
        assert_eq!(pol.advise(2, None), EvictionAdvice::Keep);
    }

    #[test]
    fn pressure_cannot_evict_to_zero() {
        let pol = EvictionPolicy::default();
        assert_eq!(pol.advise(0, Some(99.0)), EvictionAdvice::Keep);
    }
}
