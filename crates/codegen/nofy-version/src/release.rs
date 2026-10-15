//! Nofy release ordering, distinct from standard SemVer range matching.
use std::cmp::Ordering;

pub fn revision(version: &semver::Version) -> Result<u64, String> {
    if version.build.is_empty() {
        return Ok(0);
    }
    let suffix = version
        .build
        .as_str()
        .strip_prefix("nofy.")
        .ok_or_else(|| "unsupported build metadata; expected nofy.N".to_owned())?;
    let number = suffix
        .parse::<u64>()
        .map_err(|e| format!("invalid Nofy revision: {e}"))?;
    if suffix != number.to_string() {
        return Err("Nofy revision must be a canonical unsigned integer".into());
    }
    Ok(number)
}

/// Return current's ordering relative to candidate (Less means candidate is newer).
pub fn compare_versions(current: &str, candidate: &str) -> Result<Ordering, String> {
    let mut current = semver::Version::parse(current).map_err(|e| e.to_string())?;
    let mut candidate = semver::Version::parse(candidate).map_err(|e| e.to_string())?;
    let revisions = (revision(&current)?, revision(&candidate)?);
    current.build = semver::BuildMetadata::EMPTY;
    candidate.build = semver::BuildMetadata::EMPTY;
    Ok(current
        .cmp(&candidate)
        .then_with(|| revisions.0.cmp(&revisions.1)))
}
