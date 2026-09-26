//! Installed nofy CLI version, lockstepped with shipping binaries.

use semver::Version;

pub const TEST_VERSION_ENV: &str = "NOFY_TEST_VERSION";

pub const VERSION: &str = match option_env!("NOFY_VERSION") {
    Some(v) => v,
    None => env!("CARGO_PKG_VERSION"),
};

/// [`TEST_VERSION_ENV`] override first, then [`VERSION`]. Trimmed so
/// non-semver-aware callers can pass the result straight into parsing.
pub fn installed() -> String {
    std::env::var(TEST_VERSION_ENV)
        .map(|v| v.trim().to_string())
        .unwrap_or_else(|_| VERSION.to_string())
}

pub fn installed_semver() -> Result<Version, semver::Error> {
    Version::parse(&installed())
}

/// Format the compiled version for user-facing display.
pub fn display_version() -> String {
    VERSION.to_string()
}

/// Pass-through formatting for a version-with-commit string
/// (e.g. `"0.2.5 (abc1234)"`).
pub fn display_version_with_commit(version_with_commit: &str) -> String {
    version_with_commit.to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_display_version_formatting() {
        assert_eq!(
            display_version_with_commit("0.2.5 (abc1234)"),
            "0.2.5 (abc1234)"
        );
        assert_eq!(display_version(), VERSION);
    }
}
