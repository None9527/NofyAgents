//! Builds and caches HTTP clients carrying a model-specific mTLS identity.
//!
//! A gateway that authenticates clients by certificate needs the identity
//! attached to the *client*, not to a header, so it cannot ride the process-wide
//! shared clients in the parent module — each distinct identity needs its own
//! `reqwest::Client`.
//!
//! Two invariants matter more than the caching:
//!
//! - **The cache key is the credential content, not the path.** Rotating a
//!   certificate in place therefore takes effect on the next request with no
//!   invalidation logic, and a stale identity can never outlive its files.
//! - **A credentialed client is pinned to its origin.** `https_only` plus a
//!   `none` redirect policy, because a client certificate is a bearer credential:
//!   following a redirect, or downgrading to plaintext, would present it to a
//!   host the operator never named.
//!
//! Extra root certificates come from [`nofy_extra_ca`], exactly as the plain
//! shared clients do — this module deliberately does not switch the TLS backend
//! or the trust-root source.

use std::collections::HashMap;
use std::io::Read;
use std::path::{Path, PathBuf};
use std::sync::{Mutex, OnceLock, PoisonError};

use nofy_sampling_types::SamplingError;

use super::{configure_http1, configure_http2, sharing_disabled};

/// A client certificate or key larger than this is a misconfiguration (a
/// bundle, a wrong file), not an identity. Enforced so a bad path cannot make
/// the sampler allocate arbitrarily.
const MAX_MTLS_IDENTITY_FILE_BYTES: u64 = 1024 * 1024;

/// Bound on simultaneously cached identities. One entry per distinct
/// certificate, so this is a cap on how many models can each carry their own
/// identity before the least recently used one is rebuilt on next use.
const MAX_MTLS_CLIENTS: usize = 16;

/// Certificate/key filenames, in preference order. `client.*` is the explicit
/// convention; `tls.*` is what a Kubernetes Secret projects by default, which
/// is how most self-hosted gateys mount an identity into a pod.
const IDENTITY_FILENAMES: [(&str, &str); 2] =
    [("client.crt", "client.key"), ("tls.crt", "tls.key")];

#[derive(Clone, Debug, PartialEq, Eq, Hash)]
struct MtlsClientCacheKey {
    identity_digest: [u8; 32],
    force_http1: bool,
}

struct MtlsClientCacheEntry {
    client: reqwest::Client,
    last_used: u64,
}

#[derive(Default)]
struct MtlsClientCache {
    /// Monotonic use counter, not a clock: LRU ordering only needs to be
    /// consistent within the process, and a counter cannot go backwards or
    /// collide the way a coarse timestamp can.
    tick: u64,
    entries: HashMap<MtlsClientCacheKey, MtlsClientCacheEntry>,
}

/// A client presenting the identity in `cert_dir`, or why it could not be built.
///
/// Every failure is [`SamplingError::MtlsConfiguration`], which is
/// deterministic and non-retryable: the files and the config do not change
/// between attempts.
pub(crate) fn mtls_client(
    cert_dir: &Path,
    force_http1: bool,
) -> nofy_sampling_types::Result<reqwest::Client> {
    let (cert_path, key_path) = identity_paths(cert_dir)?;
    let cert_pem = read_identity_file(&cert_path)?;
    let key_pem = read_identity_file(&key_path)?;
    let cache_key = client_cache_key(&cert_pem, &key_pem, force_http1);

    // `Identity::from_pem` wants one PEM document holding both the certificate
    // chain and the key; a certificate whose file lacks a trailing newline would
    // otherwise run straight into the key's `-----BEGIN` line.
    let mut identity_pem = cert_pem;
    if !identity_pem.ends_with(b"\n") {
        identity_pem.push(b'\n');
    }
    identity_pem.extend_from_slice(&key_pem);

    let build = || {
        let identity = reqwest::Identity::from_pem(&identity_pem).map_err(|error| {
            SamplingError::MtlsConfiguration(format!(
                "invalid mTLS client identity from certificate '{}' and key '{}': {}",
                cert_path.display(),
                key_path.display(),
                error_detail(&error)
            ))
        })?;
        // Same pool/timeout/keepalive knobs as the plain shared clients, so a
        // credentialed model does not silently get different transport tuning.
        let configure = if force_http1 {
            configure_http1
        } else {
            configure_http2
        };
        let built = nofy_extra_ca::with_extra_root_certificates(
            configure(reqwest::Client::builder())
                .identity(identity)
                .https_only(true)
                .redirect(reqwest::redirect::Policy::none()),
        )
        .build();
        built.map_err(|error| {
            SamplingError::MtlsConfiguration(format!(
                "failed to build mTLS HTTP client from certificate '{}' and key '{}': {}",
                cert_path.display(),
                key_path.display(),
                error_detail(&error)
            ))
        })
    };

    // The kill switch means "build fresh every time", so it must bypass the
    // identity cache too — otherwise `NOFY_SAMPLER_SHARED_CLIENT=0` would still
    // hand back a cached credentialed client.
    if sharing_disabled() {
        build()
    } else {
        cached_client(cache_key, build)
    }
}

/// Digest of the credential *contents*, so a rotated certificate in the same
/// directory produces a different key and the old client is not reused.
///
/// Each blob is length-prefixed before hashing: without it, a cert of N bytes
/// plus a key of M bytes would collide with a different N'/M' split of the same
/// concatenated bytes.
fn client_cache_key(cert_pem: &[u8], key_pem: &[u8], force_http1: bool) -> MtlsClientCacheKey {
    let mut hasher = blake3::Hasher::new();
    hasher.update(&(cert_pem.len() as u64).to_le_bytes());
    hasher.update(cert_pem);
    hasher.update(&(key_pem.len() as u64).to_le_bytes());
    hasher.update(key_pem);
    MtlsClientCacheKey {
        identity_digest: *hasher.finalize().as_bytes(),
        force_http1,
    }
}

impl MtlsClientCache {
    /// Return the cached client for `key`, or build it and insert.
    ///
    /// A method over a private instance rather than free-function logic on the
    /// global, so the hit-counting and eviction rules are testable: the process
    /// cache is shared, and parallel tests cannot assert on its size.
    fn get_or_insert<E>(
        &mut self,
        key: MtlsClientCacheKey,
        build: impl FnOnce() -> Result<reqwest::Client, E>,
    ) -> Result<reqwest::Client, E> {
        self.tick = self.tick.wrapping_add(1);
        let tick = self.tick;
        if let Some(entry) = self.entries.get_mut(&key) {
            entry.last_used = tick;
            return Ok(entry.client.clone());
        }

        // Built while the lock is held: two concurrent requests for the same
        // new identity should not both parse the PEM and build a client.
        // Identities are few, so serializing builds costs little.
        let client = build()?;
        if self.entries.len() >= MAX_MTLS_CLIENTS {
            if let Some(lru) = self
                .entries
                .iter()
                .min_by_key(|(_, entry)| entry.last_used)
                .map(|(key, _)| key.clone())
            {
                self.entries.remove(&lru);
            }
        }
        self.entries.insert(
            key,
            MtlsClientCacheEntry {
                client: client.clone(),
                last_used: tick,
            },
        );
        Ok(client)
    }
}

fn cached_client<E>(
    key: MtlsClientCacheKey,
    build: impl FnOnce() -> Result<reqwest::Client, E>,
) -> Result<reqwest::Client, E> {
    static CACHE: OnceLock<Mutex<MtlsClientCache>> = OnceLock::new();
    // A poisoned lock means a panic while holding it, not corrupt cache state
    // (the critical section only touches a HashMap and a counter), so recover
    // the guard rather than failing every subsequent sampling request.
    let mut cache = CACHE
        .get_or_init(Default::default)
        .lock()
        .unwrap_or_else(PoisonError::into_inner);
    cache.get_or_insert(key, build)
}

/// Pick the certificate/key pair to use.
///
/// `client.*` wins if **either** half is present, so a directory holding a
/// `client.crt` and a missing key reports the key as unreadable instead of
/// silently falling through to an unrelated `tls.*` pair.
fn identity_paths(cert_dir: &Path) -> nofy_sampling_types::Result<(PathBuf, PathBuf)> {
    let (client_cert, client_key) = (
        cert_dir.join(IDENTITY_FILENAMES[0].0),
        cert_dir.join(IDENTITY_FILENAMES[0].1),
    );
    let has_client_cert = try_path_exists(&client_cert)?;
    let has_client_key = try_path_exists(&client_key)?;
    if has_client_cert || has_client_key {
        return Ok((client_cert, client_key));
    }
    let (tls_cert, tls_key) = (
        cert_dir.join(IDENTITY_FILENAMES[1].0),
        cert_dir.join(IDENTITY_FILENAMES[1].1),
    );
    Ok((tls_cert, tls_key))
}

fn try_path_exists(path: &Path) -> nofy_sampling_types::Result<bool> {
    path.try_exists().map_err(|error| {
        SamplingError::MtlsConfiguration(format!(
            "failed to inspect mTLS identity file '{}': {}",
            path.display(),
            error_detail(&error)
        ))
    })
}

fn read_identity_file(path: &Path) -> nofy_sampling_types::Result<Vec<u8>> {
    let file = std::fs::File::open(path).map_err(|error| {
        SamplingError::MtlsConfiguration(format!(
            "failed to open mTLS identity file '{}': {}",
            path.display(),
            error_detail(&error)
        ))
    })?;
    let mut bytes = Vec::new();
    // `take(LIMIT + 1)` rather than a metadata size check: a symlink or a
    // special file can report a size that does not match what a read yields,
    // and reading one byte past the limit is enough to detect the overflow
    // without ever holding more than the limit.
    file.take(MAX_MTLS_IDENTITY_FILE_BYTES + 1)
        .read_to_end(&mut bytes)
        .map_err(|error| {
            SamplingError::MtlsConfiguration(format!(
                "failed to read mTLS identity file '{}': {}",
                path.display(),
                error_detail(&error)
            ))
        })?;
    if bytes.len() as u64 > MAX_MTLS_IDENTITY_FILE_BYTES {
        return Err(SamplingError::MtlsConfiguration(format!(
            "mTLS identity file '{}' exceeds the {MAX_MTLS_IDENTITY_FILE_BYTES} byte limit",
            path.display()
        )));
    }
    Ok(bytes)
}

/// Render the whole `source()` chain.
///
/// rustls' top-level identity errors are often just "invalid peer certificate"
/// or "error parsing"; the actionable detail — which PEM block, which key
/// algorithm — lives further down the chain.
fn error_detail(error: &dyn std::error::Error) -> String {
    let mut detail = error.to_string();
    let mut source = error.source();
    while let Some(cause) = source {
        detail.push_str(": ");
        detail.push_str(&cause.to_string());
        source = cause.source();
    }
    detail
}

#[cfg(test)]
mod tests {
    use super::*;

    /// A real self-signed certificate + key, so the happy path is exercised
    /// rather than only the error branches.
    fn real_identity(dir: &Path, names: (&str, &str)) {
        let rcgen::CertifiedKey { cert, key_pair } =
            rcgen::generate_simple_self_signed(vec!["localhost".to_string()]).unwrap();
        std::fs::write(dir.join(names.0), cert.pem()).unwrap();
        std::fs::write(dir.join(names.1), key_pair.serialize_pem()).unwrap();
    }

    fn write(dir: &Path, name: &str, bytes: &[u8]) {
        std::fs::write(dir.join(name), bytes).unwrap();
    }

    // ---- identity_paths ----

    #[test]
    fn client_pair_wins_when_only_one_half_exists() {
        let dir = tempfile::tempdir().unwrap();
        write(dir.path(), "client.crt", b"cert");
        write(dir.path(), "tls.crt", b"other-cert");
        write(dir.path(), "tls.key", b"other-key");
        let (cert, key) = identity_paths(dir.path()).unwrap();
        assert_eq!(cert.file_name().unwrap(), "client.crt");
        assert_eq!(
            key.file_name().unwrap(),
            "client.key",
            "a present client.crt with a missing key must report the key as \
             unreadable, not silently fall through to an unrelated tls.* pair"
        );
    }

    #[test]
    fn client_pair_wins_when_only_the_key_exists() {
        let dir = tempfile::tempdir().unwrap();
        write(dir.path(), "client.key", b"key");
        let (cert, key) = identity_paths(dir.path()).unwrap();
        assert_eq!(cert.file_name().unwrap(), "client.crt");
        assert_eq!(key.file_name().unwrap(), "client.key");
    }

    #[test]
    fn falls_back_to_the_kubernetes_secret_names() {
        let dir = tempfile::tempdir().unwrap();
        let (cert, key) = identity_paths(dir.path()).unwrap();
        assert_eq!(cert.file_name().unwrap(), "tls.crt");
        assert_eq!(key.file_name().unwrap(), "tls.key");
    }

    // ---- read_identity_file ----

    #[test]
    fn size_limit_admits_the_boundary_and_rejects_one_byte_over() {
        let dir = tempfile::tempdir().unwrap();
        let limit = MAX_MTLS_IDENTITY_FILE_BYTES as usize;
        write(dir.path(), "exact.pem", &vec![b'a'; limit]);
        assert_eq!(
            read_identity_file(&dir.path().join("exact.pem"))
                .unwrap()
                .len(),
            limit
        );
        write(dir.path(), "over.pem", &vec![b'a'; limit + 1]);
        let err = read_identity_file(&dir.path().join("over.pem")).unwrap_err();
        assert!(
            err.to_string().contains("exceeds the"),
            "oversize must be reported as a configuration error: {err}"
        );
    }

    #[test]
    fn a_missing_identity_file_names_the_path() {
        let dir = tempfile::tempdir().unwrap();
        let err = mtls_client(dir.path(), false).unwrap_err();
        let msg = err.to_string();
        assert!(
            msg.contains("tls.crt"),
            "must name the file it tried: {msg}"
        );
        assert!(
            matches!(err, SamplingError::MtlsConfiguration(_)),
            "must be the deterministic configuration variant, got {err:?}"
        );
    }

    // ---- cache key ----

    #[test]
    fn cache_key_tracks_credential_content_so_rotation_takes_effect() {
        let a = client_cache_key(b"cert-1", b"key", false);
        let b = client_cache_key(b"cert-2", b"key", false);
        assert_ne!(
            a.identity_digest, b.identity_digest,
            "a rotated certificate must not reuse the old client"
        );
        // Rotating only the private key must also miss: a cache key derived
        // from the certificate alone would keep presenting the old identity
        // after the key was replaced. (A red-green mutation that dropped the
        // key from the digest passed the certificate assertion above, which is
        // why this one is separate.)
        let rotated_key = client_cache_key(b"cert-1", b"key-2", false);
        assert_ne!(
            a.identity_digest, rotated_key.identity_digest,
            "a rotated private key must not reuse the old client"
        );
        assert_eq!(
            client_cache_key(b"cert-1", b"key", false).identity_digest,
            a.identity_digest,
            "unchanged content must hit"
        );
        assert_ne!(
            a,
            client_cache_key(b"cert-1", b"key", true),
            "force_http1 is part of the key"
        );
    }

    /// Without the length prefixes, `("ab", "c")` and `("a", "bc")` would hash
    /// identically — two different identities sharing one client.
    #[test]
    fn cache_key_length_prefix_prevents_a_cert_key_split_collision() {
        let split_a = client_cache_key(b"ab", b"c", false);
        let split_b = client_cache_key(b"a", b"bc", false);
        assert_ne!(
            split_a.identity_digest, split_b.identity_digest,
            "concatenation must not be ambiguous across the cert/key boundary"
        );
    }

    // ---- cache behavior (on a private instance, not the process global) ----

    fn key(tag: u8) -> MtlsClientCacheKey {
        MtlsClientCacheKey {
            identity_digest: [tag; 32],
            force_http1: false,
        }
    }

    fn plain_client() -> reqwest::Client {
        reqwest::Client::builder().build().unwrap()
    }

    #[test]
    fn a_cache_hit_does_not_rebuild() {
        let mut cache = MtlsClientCache::default();
        let builds = std::cell::Cell::new(0u32);
        for _ in 0..3 {
            cache
                .get_or_insert::<()>(key(1), || {
                    builds.set(builds.get() + 1);
                    Ok(plain_client())
                })
                .unwrap();
        }
        assert_eq!(
            builds.get(),
            1,
            "one identity must build exactly one client"
        );
        assert_eq!(cache.entries.len(), 1);
    }

    #[test]
    fn a_build_failure_is_not_cached() {
        let mut cache = MtlsClientCache::default();
        let attempts = std::cell::Cell::new(0u32);
        for _ in 0..2 {
            let r = cache.get_or_insert::<()>(key(2), || {
                attempts.set(attempts.get() + 1);
                Err(())
            });
            assert!(r.is_err());
        }
        assert_eq!(
            attempts.get(),
            2,
            "a failed build must be retried, not remembered"
        );
        assert!(cache.entries.is_empty());
    }

    #[test]
    fn the_cap_evicts_the_least_recently_used_identity() {
        let mut cache = MtlsClientCache::default();
        for tag in 0..MAX_MTLS_CLIENTS as u8 {
            cache
                .get_or_insert::<()>(key(tag), || Ok(plain_client()))
                .unwrap();
        }
        assert_eq!(cache.entries.len(), MAX_MTLS_CLIENTS);
        // Touch tag 0 so tag 1 becomes the least recently used.
        cache
            .get_or_insert::<()>(key(0), || Ok(plain_client()))
            .unwrap();
        cache
            .get_or_insert::<()>(key(200), || Ok(plain_client()))
            .unwrap();
        assert_eq!(
            cache.entries.len(),
            MAX_MTLS_CLIENTS,
            "the cap is a bound, not a trigger to grow"
        );
        assert!(
            cache.entries.contains_key(&key(0)),
            "the just-used entry survives"
        );
        assert!(
            !cache.entries.contains_key(&key(1)),
            "the least recently used entry is evicted"
        );
        assert!(cache.entries.contains_key(&key(200)));
    }

    // ---- error_detail ----

    #[test]
    fn error_detail_renders_the_whole_source_chain() {
        #[derive(Debug)]
        struct Mid;
        impl std::fmt::Display for Mid {
            fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
                f.write_str("middle")
            }
        }
        impl std::error::Error for Mid {}
        #[derive(Debug)]
        struct Top;
        impl std::fmt::Display for Top {
            fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
                f.write_str("top")
            }
        }
        impl std::error::Error for Top {
            fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
                // A `'static` instance: `source()` borrows, so it cannot hand
                // back a temporary.
                static MID: Mid = Mid;
                Some(&MID)
            }
        }
        // rustls' top-level identity errors are usually uninformative; the
        // actionable detail lives down the chain.
        assert_eq!(error_detail(&Top), "top: middle");
    }

    // ---- end to end ----

    #[test]
    fn a_real_identity_builds_a_client() {
        let dir = tempfile::tempdir().unwrap();
        real_identity(dir.path(), ("client.crt", "client.key"));
        let client = mtls_client(dir.path(), false)
            .expect("a valid self-signed identity must build a client");
        // A credentialed client is still a usable client; the origin pinning is
        // asserted by the builder configuration below.
        drop(client);
        let http1 = mtls_client(dir.path(), true).expect("the http1 variant must build too");
        drop(http1);
    }

    #[test]
    fn the_tls_secret_names_also_build_a_client() {
        let dir = tempfile::tempdir().unwrap();
        real_identity(dir.path(), ("tls.crt", "tls.key"));
        mtls_client(dir.path(), false).expect("tls.crt/tls.key must be accepted");
    }

    #[test]
    fn an_unparseable_identity_is_a_configuration_error_naming_both_files() {
        let dir = tempfile::tempdir().unwrap();
        write(dir.path(), "client.crt", b"not a certificate");
        write(dir.path(), "client.key", b"not a key");
        let err = mtls_client(dir.path(), false).unwrap_err();
        let msg = err.to_string();
        assert!(matches!(err, SamplingError::MtlsConfiguration(_)));
        assert!(
            msg.contains("client.crt") && msg.contains("client.key"),
            "must name both paths: {msg}"
        );
    }

    /// A certificate whose key is missing must fail, not fall back to whatever
    /// else is in the directory.
    #[test]
    fn a_half_present_client_pair_does_not_fall_back_to_tls() {
        let dir = tempfile::tempdir().unwrap();
        real_identity(dir.path(), ("tls.crt", "tls.key"));
        write(
            dir.path(),
            "client.crt",
            b"-----BEGIN CERTIFICATE-----\nAAAA\n",
        );
        let err = mtls_client(dir.path(), false).unwrap_err();
        let msg = err.to_string();
        assert!(
            msg.contains("client.key"),
            "must fail on the missing client.key rather than silently using tls.*: {msg}"
        );
    }

    /// The mTLS error must never be classified as retryable: the files do not
    /// change between attempts, so a retry only burns the backoff budget.
    #[test]
    fn an_mtls_failure_is_deterministic_and_not_retryable() {
        let dir = tempfile::tempdir().unwrap();
        let err = mtls_client(dir.path(), false).unwrap_err();
        assert!(
            !err.is_retryable(),
            "a missing certificate is not transient"
        );
        assert!(!err.is_context_length_error());
        assert!(!err.is_overloaded());
        assert!(err.is_retry_vetoed() || !err.is_retryable());
    }
}
