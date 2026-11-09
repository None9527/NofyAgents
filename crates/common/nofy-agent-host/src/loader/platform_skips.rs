//! The test units of this crate that exist on one kind of machine only, and why.
//!
//! A unit that is excluded with `#[cfg(...)]` is absent from the results of every
//! other platform, so a green run there says nothing about it and the platforms
//! cannot be compared. Each stand-in below has the unit's name, always exists, and
//! on a platform where the real unit is compiled out it prints one skip line
//! (`nofy-skip: ...`, see `nofy_test_support::capability`) with the reason. Where
//! the real unit runs, the stand-in does nothing and the real tests are in the
//! results.
//!
//! When the product learns to do what a unit tests on another platform, move the
//! gate on that unit's `mod tests;` and delete its entry here. The reasons name the
//! product code that refuses or lacks the feature, so each one can be checked.
use nofy_test_support::skip_unless;

/// The cache is maintained by a lease only Linux can take
/// (`lifecycle.rs`, `maintenance_lease`: "cache maintenance requires Linux").
#[test]
fn unit_cache_lifecycle() {
    skip_unless(
        cfg!(target_os = "linux"),
        "cache maintenance",
        "CacheLifecycle::maintenance_lease refuses off Linux, so move/purge/eviction cannot run",
    );
}

/// Directory grants and local mounts are pinned by an opened descriptor handed to
/// Landlock (`directories.rs` `Grant::open`, `local.rs` `Mount::open`).
#[test]
fn unit_directory_and_local_mount_descriptors() {
    skip_unless(
        cfg!(target_os = "linux"),
        "an opened path descriptor for confinement (Grant::open, Mount::open)",
        "both exist only on Linux (Landlock PathFd); other platforms get them with the isolation backends",
    );
}

/// Runtime images are ELF files for the same architecture, and the fixture is the
/// system's x86-64 dynamic loader.
#[test]
fn unit_runtime_images_sources_and_unload() {
    skip_unless(
        cfg!(all(target_os = "linux", target_arch = "x86_64")),
        "a Linux x86-64 runtime image",
        "ImageManifest::validate accepts only linux images, and the sources, unload and queue tests capture /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2",
    );
}

/// The process-tree manager is built on cgroup v2 and namespaces.
#[test]
fn unit_process_tree_manager() {
    skip_unless(
        cfg!(target_os = "linux"),
        "cgroup v2 and namespaces (tree_kill, private_mounts, process_count_limit)",
        "loader::process_tree::Manager is compiled for Linux only; macOS and Windows get a backend with the isolation work",
    );
}

/// The fork-based ownership tests need `fork(2)`.
#[test]
fn unit_fork_ownership_of_leases() {
    skip_unless(
        cfg!(unix),
        "fork(2)",
        "the commit fence, memory control and catalog lock tests fork real children; Windows has no fork",
    );
}
