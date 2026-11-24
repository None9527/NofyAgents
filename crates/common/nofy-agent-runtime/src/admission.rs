//! Optional host admission at durable commit boundaries, not execution policy.
use crate::{Error, registry::ModuleDefinition};

pub trait CommitAdmission: Send + Sync {
    /// Stable logical authority, independent of local paths or credentials.
    fn identity(&self) -> &str;
    /// Must be bounded and non-reentrant. Declaration-bearing transactions
    /// acquire this permit at their commit boundary and hold it through commit
    /// or rollback; ordinary reads, receipts and control-state updates do not.
    fn enter(&self) -> Result<Box<dyn CommitPermit>, Error>;
    /// Pure proof for auxiliary children inheriting an already retained root.
    /// Never execute factories or perform IO here; false requires normal admission.
    fn permits_inherited(
        &self,
        _parent: &[&ModuleDefinition],
        _kind: &str,
        _modules: &[&ModuleDefinition],
    ) -> Result<bool, Error> {
        Ok(false)
    }
}
pub trait CommitPermit: Send {
    /// Validate declared dependencies without executing factories or business IO.
    /// `draft` allows incomplete, non-executable source definitions.
    fn validate(&self, kind: &str, modules: &[&ModuleDefinition]) -> Result<(), Error>;
}
#[cfg(all(test, any(feature = "sqlite", feature = "control-file")))]
pub(crate) mod tests;

#[cfg(any(feature = "sqlite", feature = "control-file"))]
pub(crate) mod marker {
    use super::*;
    use std::{
        collections::HashMap,
        fs::{File, Metadata, OpenOptions, Permissions},
        io::{Read, Write},
        path::{Path, PathBuf},
        sync::{Mutex, OnceLock},
        time::{Duration, Instant, SystemTime},
    };

    const CACHE_TTL: Duration = Duration::from_secs(2);
    const RACY_CLEAN_MARGIN: Duration = Duration::from_millis(50);
    const MAX_CACHE_ENTRIES: usize = 64;

    #[derive(Clone, PartialEq, Eq)]
    struct MarkerFingerprint {
        len: u64,
        modified: SystemTime,
        created: Option<SystemTime>,
        permissions: Permissions,
    }

    struct CachedMarker {
        identity: String,
        fingerprint: MarkerFingerprint,
        verified_at: Instant,
    }

    static CACHE: OnceLock<Mutex<HashMap<PathBuf, CachedMarker>>> = OnceLock::new();

    #[cfg(test)]
    static TEST_DISK_READS: std::sync::atomic::AtomicUsize = std::sync::atomic::AtomicUsize::new(0);

    fn cache() -> &'static Mutex<HashMap<PathBuf, CachedMarker>> {
        CACHE.get_or_init(|| Mutex::new(HashMap::new()))
    }

    fn evict(marker_path: &Path) {
        if let Ok(mut entries) = cache().lock() {
            entries.remove(marker_path);
        }
    }

    fn fingerprint(meta: &Metadata) -> Option<MarkerFingerprint> {
        let modified = meta.modified().ok()?;
        Some(MarkerFingerprint {
            len: meta.len(),
            modified,
            created: meta.created().ok(),
            permissions: meta.permissions(),
        })
    }

    fn is_racy_clean(modified: SystemTime) -> bool {
        match SystemTime::now().duration_since(modified) {
            Ok(age) => age >= RACY_CLEAN_MARGIN,
            Err(_) => false,
        }
    }

    fn cache_matches(marker_path: &Path, identity: &str, current: &MarkerFingerprint) -> bool {
        if !is_racy_clean(current.modified) {
            return false;
        }
        let Ok(mut entries) = cache().lock() else {
            return false;
        };
        let now = Instant::now();
        if let Some(entry) = entries.get(marker_path) {
            if entry.identity == identity
                && entry.fingerprint == *current
                && now.saturating_duration_since(entry.verified_at) < CACHE_TTL
            {
                return true;
            }
            entries.remove(marker_path);
        }
        false
    }

    fn cache_store(marker_path: PathBuf, identity: String, current: MarkerFingerprint) {
        let Ok(mut entries) = cache().lock() else {
            return;
        };
        let now = Instant::now();
        if entries.len() >= MAX_CACHE_ENTRIES && !entries.contains_key(&marker_path) {
            entries.retain(|_, entry| now.saturating_duration_since(entry.verified_at) < CACHE_TTL);
            if entries.len() >= MAX_CACHE_ENTRIES {
                entries.clear();
            }
        }
        entries.insert(
            marker_path,
            CachedMarker {
                identity,
                fingerprint: current,
                verified_at: now,
            },
        );
    }

    fn failure() -> Error {
        Error::Checkpoint("managed storage requires its matching commit admission authority".into())
    }
    fn path(storage: &Path) -> PathBuf {
        let mut name = storage.as_os_str().to_owned();
        name.push(".admission");
        PathBuf::from(name)
    }
    fn expected(policy: &dyn CommitAdmission) -> Result<Vec<u8>, Error> {
        let id = policy.identity();
        if id.is_empty()
            || id.len() > 128
            || !id
                .bytes()
                .all(|b| b.is_ascii_alphanumeric() || b"._-/@:".contains(&b))
        {
            return Err(failure());
        }
        Ok(format!("nofy.commit-admission/v1\n{id}\n").into_bytes())
    }

    pub(crate) fn present(storage: &Path) -> Result<bool, Error> {
        let marker_path = path(storage);
        match std::fs::symlink_metadata(&marker_path) {
            Ok(meta) if meta.is_file() && meta.len() <= 512 => Ok(true),
            Ok(_) => Err(failure()),
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(false),
            Err(_) => Err(failure()),
        }
    }

    fn check_inner(
        storage: &Path,
        policy: Option<&dyn CommitAdmission>,
        require_present: bool,
        use_cache: bool,
    ) -> Result<(), Error> {
        let marker_path = path(storage);
        let meta = match std::fs::symlink_metadata(&marker_path) {
            Ok(meta) => meta,
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => {
                evict(&marker_path);
                if require_present && policy.is_some() {
                    return Err(failure());
                }
                return Ok(());
            }
            Err(_) => {
                evict(&marker_path);
                return Err(failure());
            }
        };
        if !meta.is_file() || meta.len() > 512 {
            evict(&marker_path);
            return Err(failure());
        }
        let policy = match policy {
            Some(policy) => policy,
            None => {
                evict(&marker_path);
                return Err(failure());
            }
        };
        let current = fingerprint(&meta);
        if use_cache
            && let Some(ref fp) = current
            && cache_matches(&marker_path, policy.identity(), fp)
        {
            return Ok(());
        }
        let expected = expected(policy)?;
        #[cfg(test)]
        TEST_DISK_READS.fetch_add(1, std::sync::atomic::Ordering::SeqCst);
        let mut bytes = Vec::new();
        File::open(&marker_path)
            .map_err(|_| {
                evict(&marker_path);
                failure()
            })?
            .take(513)
            .read_to_end(&mut bytes)
            .map_err(|_| {
                evict(&marker_path);
                failure()
            })?;
        if bytes != expected {
            evict(&marker_path);
            return Err(failure());
        }
        if let Some(fp) = current {
            cache_store(marker_path, policy.identity().to_owned(), fp);
        }
        Ok(())
    }

    /// Startup full verification: always reads the marker from disk and refreshes cache.
    pub(crate) fn check_full(
        storage: &Path,
        policy: Option<&dyn CommitAdmission>,
    ) -> Result<(), Error> {
        check_inner(storage, policy, false, false)
    }

    /// Fast per-transaction verification backed by short-TTL metadata fingerprint cache.
    pub(crate) fn check(storage: &Path, policy: Option<&dyn CommitAdmission>) -> Result<(), Error> {
        check_inner(storage, policy, false, true)
    }

    /// Fast per-transaction verification that also fails closed if an installed marker disappears.
    pub(crate) fn check_required(
        storage: &Path,
        policy: Option<&dyn CommitAdmission>,
    ) -> Result<(), Error> {
        check_inner(storage, policy, true, true)
    }

    /// Caller holds the storage's original writer lock/transaction.
    pub(crate) fn install(storage: &Path, policy: &dyn CommitAdmission) -> Result<(), Error> {
        check_full(storage, Some(policy))?;
        let destination = path(storage);
        if destination.exists() {
            return Ok(());
        }
        let parent = storage.parent().ok_or_else(failure)?;
        let temporary = parent.join(format!(
            ".nofy-admission-{}.tmp",
            nofy_tool_protocol::ToolCallId::new_v7()
        ));
        let result = (|| {
            let mut options = OpenOptions::new();
            options.write(true).create_new(true);
            #[cfg(unix)]
            {
                use std::os::unix::fs::OpenOptionsExt;
                options.mode(0o600);
            }
            let mut file = options.open(&temporary).map_err(|_| failure())?;
            file.write_all(&expected(policy)?).map_err(|_| failure())?;
            file.sync_all().map_err(|_| failure())?;
            match std::fs::hard_link(&temporary, &destination) {
                Ok(()) => {}
                Err(e) if e.kind() == std::io::ErrorKind::AlreadyExists => {
                    check_full(storage, Some(policy))?
                }
                Err(_) => return Err(failure()),
            }
            nofy_durable_fs::sync_directory(parent).map_err(|_| failure())?;
            check_full(storage, Some(policy))?;
            Ok(())
        })();
        // Only this operation's create_new temporary is removed.
        let _ = std::fs::remove_file(temporary);
        result
    }

    #[cfg(test)]
    mod cache_tests {
        use super::*;
        use crate::admission::tests::Policy;
        use std::sync::atomic::Ordering;

        #[test]
        fn marker_cache_skips_disk_reads_and_fails_closed_on_tamper_or_removal() {
            let dir = tempfile::tempdir().unwrap();
            let storage = dir.path().join("runtime.sqlite");
            let marker_path = path(&storage);
            let policy = Policy::default();

            install(&storage, &policy).unwrap();
            assert!(present(&storage).unwrap());

            // Wait past the racy-clean quantization margin so metadata caching activates.
            std::thread::sleep(RACY_CLEAN_MARGIN + Duration::from_millis(20));

            let reads_before_hit = TEST_DISK_READS.load(Ordering::SeqCst);
            for _ in 0..8 {
                check_required(&storage, Some(&policy)).unwrap();
            }
            let reads_after_hit = TEST_DISK_READS.load(Ordering::SeqCst);
            assert_eq!(
                reads_after_hit, reads_before_hit,
                "cached marker checks must avoid reopening the file"
            );

            // Startup full check always forces a disk read.
            check_full(&storage, Some(&policy)).unwrap();
            assert_eq!(TEST_DISK_READS.load(Ordering::SeqCst), reads_after_hit + 1);

            // Wrong or missing policy always fails closed immediately.
            assert!(check_required(&storage, None).is_err());
            let other = Policy(policy.0.clone(), "other.authority/v1");
            assert!(check_required(&storage, Some(&other)).is_err());

            // Re-prime cache, then tamper with content -> must fail closed immediately.
            check_full(&storage, Some(&policy)).unwrap();
            std::thread::sleep(Duration::from_millis(10));
            std::fs::write(&marker_path, b"nofy.commit-admission/v1\ntamp.commit/v1\n").unwrap();
            assert!(check_required(&storage, Some(&policy)).is_err());

            // Restore valid marker and test permission change + deletion.
            std::fs::write(&marker_path, expected(&policy).unwrap()).unwrap();
            std::thread::sleep(RACY_CLEAN_MARGIN + Duration::from_millis(20));
            check_full(&storage, Some(&policy)).unwrap();
            check_required(&storage, Some(&policy)).unwrap();

            let mut perms = std::fs::metadata(&marker_path).unwrap().permissions();
            perms.set_readonly(true);
            std::fs::set_permissions(&marker_path, perms).unwrap();
            let reads_before_perm = TEST_DISK_READS.load(Ordering::SeqCst);
            // Permission change invalidates the cached fingerprint and triggers a fresh disk read.
            check_required(&storage, Some(&policy)).unwrap();
            assert_eq!(
                TEST_DISK_READS.load(Ordering::SeqCst),
                reads_before_perm + 1
            );

            // Restore writable permissions so removal works on all platforms, then delete marker.
            let mut writable = std::fs::metadata(&marker_path).unwrap().permissions();
            #[allow(clippy::permissions_set_readonly_false)]
            writable.set_readonly(false);
            std::fs::set_permissions(&marker_path, writable).unwrap();
            std::fs::remove_file(&marker_path).unwrap();
            assert!(
                check_required(&storage, Some(&policy)).is_err(),
                "deleted marker must fail closed immediately"
            );
        }

        #[test]
        fn marker_racy_clean_catches_immediate_same_length_in_place_tamper() {
            let dir = tempfile::tempdir().unwrap();
            let storage = dir.path().join("racy.sqlite");
            let marker_path = path(&storage);
            let policy = Policy::default();

            install(&storage, &policy).unwrap();
            let original = expected(&policy).unwrap();
            let mut tampered = original.clone();
            let pos = tampered.len() - 2;
            tampered[pos] = if tampered[pos] == b'1' { b'2' } else { b'1' };
            assert_eq!(tampered.len(), original.len());

            // Overwrite immediately within the same filesystem timestamp tick.
            std::fs::write(&marker_path, &tampered).unwrap();
            assert!(
                check_required(&storage, Some(&policy)).is_err(),
                "racy-clean window must catch immediate same-length tampering"
            );
        }
    }
}
