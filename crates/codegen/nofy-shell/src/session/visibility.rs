//! Session-kind visibility policy shared by local list and search surfaces.

use crate::session::persistence::Summary;

pub const SESSION_KIND_HEADLESS: &str = "headless";

/// Listing/search policy for `session_kind=headless` rows. Applied before
/// truncation; headless remains distinct from `Summary::is_hidden()`. The Rust
/// default is the first-party picker policy; omitted wire values are handled
/// separately by [`Self::from_wire`].
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq)]
pub enum HeadlessPolicy {
    #[default]
    Exclude,
    Only,
    Include,
}

impl HeadlessPolicy {
    /// Missing values preserve the pre-policy inclusive wire behavior; unknown
    /// explicit values fail closed to [`Self::Exclude`].
    pub fn from_wire(value: Option<&str>) -> Self {
        match value {
            None | Some("include") => Self::Include,
            Some("exclude") => Self::Exclude,
            Some("only") => Self::Only,
            Some(_) => Self::Exclude,
        }
    }

    pub const fn as_wire_str(self) -> &'static str {
        match self {
            Self::Exclude => "exclude",
            Self::Only => "only",
            Self::Include => "include",
        }
    }

    pub const fn admits(self, is_headless: bool) -> bool {
        match self {
            Self::Exclude => !is_headless,
            Self::Only => is_headless,
            Self::Include => true,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) enum ClassifiedSessionKind {
    Interactive,
    Headless,
    Unknown,
}

pub(crate) fn policy_admits(policy: HeadlessPolicy, kind: ClassifiedSessionKind) -> bool {
    match (policy, kind) {
        (HeadlessPolicy::Include, _)
        | (HeadlessPolicy::Exclude, ClassifiedSessionKind::Interactive)
        | (HeadlessPolicy::Only, ClassifiedSessionKind::Headless) => true,
        (HeadlessPolicy::Exclude | HeadlessPolicy::Only, ClassifiedSessionKind::Unknown)
        | (HeadlessPolicy::Exclude, ClassifiedSessionKind::Headless)
        | (HeadlessPolicy::Only, ClassifiedSessionKind::Interactive) => false,
    }
}

/// Filters the local lane in place; returns whether any row was dropped.
/// Adapted from the upstream two-lane variant: we have no remote registry
/// lane, so only local summaries are filtered.
pub(crate) fn retain_session_lanes(local: &mut Vec<Summary>, policy: HeadlessPolicy) -> bool {
    let local_before = local.len();
    local.retain(|summary| policy.admits(summary.is_headless()));
    local.len() < local_before
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn unknown_kind_is_excluded_from_classified_views_but_included_in_inventory() {
        assert!(!policy_admits(
            HeadlessPolicy::Exclude,
            ClassifiedSessionKind::Unknown,
        ));
        assert!(!policy_admits(
            HeadlessPolicy::Only,
            ClassifiedSessionKind::Unknown,
        ));
        assert!(policy_admits(
            HeadlessPolicy::Include,
            ClassifiedSessionKind::Unknown,
        ));
    }

    #[test]
    fn headless_policy_wire_preserves_omitted_include() {
        assert_eq!(HeadlessPolicy::from_wire(None), HeadlessPolicy::Include);
        assert_eq!(
            HeadlessPolicy::from_wire(Some("exclude")),
            HeadlessPolicy::Exclude,
        );
        assert_eq!(
            HeadlessPolicy::from_wire(Some("only")),
            HeadlessPolicy::Only
        );
        assert_eq!(
            HeadlessPolicy::from_wire(Some("include")),
            HeadlessPolicy::Include,
        );
        assert_eq!(
            HeadlessPolicy::from_wire(Some("bogus")),
            HeadlessPolicy::Exclude,
        );
    }
}
