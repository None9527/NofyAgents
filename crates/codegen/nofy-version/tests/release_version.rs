use std::cmp::Ordering;

#[test]
fn nofy_revisions_sort_numerically() {
    assert_eq!(
        nofy_version::release::compare_versions("1.0.45+nofy.2", "1.0.45+nofy.10").unwrap(),
        Ordering::Less
    );
}

#[test]
fn release_ordering_handles_baselines_legacy_and_prereleases() {
    for (old, new, expected) in [
        ("1.0.45+nofy.999", "1.0.46+nofy.1", Ordering::Less),
        ("1.0.45+nofy.1", "1.0.45+nofy.1", Ordering::Equal),
        ("0.2.121", "1.0.45+nofy.1", Ordering::Less),
        ("1.0.45", "1.0.45+nofy.1", Ordering::Less),
        ("1.0.45-rc.1+nofy.9", "1.0.45+nofy.1", Ordering::Less),
        ("1.0.45+nofy.10", "1.0.45+nofy.2", Ordering::Greater),
    ] {
        assert_eq!(
            nofy_version::release::compare_versions(old, new).unwrap(),
            expected
        );
    }
    for bad in [
        "bad",
        "1.0.45+vendor.1",
        "1.0.45+nofy.01",
        "1.0.45+nofy.18446744073709551616",
    ] {
        assert!(nofy_version::release::compare_versions("1.0.45+nofy.1", bad).is_err());
    }
}
