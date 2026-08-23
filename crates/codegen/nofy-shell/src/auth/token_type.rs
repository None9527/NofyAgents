use crate::auth::model::{AuthMode, NofyAuth};

/// What kind of bearer is loaded right now. Dispatch key for
/// `auth()`, `unauthorized_recovery()`, and proactive refresh.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) enum TokenType {
    /// External auth binary provides tokens.
    ExternalBinary,
    /// Plain API key (no refresh possible).
    ApiKey,
    /// No credentials loaded.
    None,
}

impl TokenType {
    /// Classify the loaded credential (pure; no manager state).
    pub(crate) fn from_auth(auth: Option<&NofyAuth>) -> Self {
        match auth {
            None => Self::None,
            Some(a) => match a.auth_mode {
                AuthMode::External => Self::ExternalBinary,
                AuthMode::ApiKey => Self::ApiKey,
            },
        }
    }

    /// `true` for types that can be silently refreshed (external binary).
    pub(crate) fn is_refreshable(self) -> bool {
        matches!(self, Self::ExternalBinary)
    }

    /// Stable telemetry mirror for the `manual_auth` KPI.
    pub(crate) fn telemetry_kind(self) -> nofy_telemetry::events::AuthTokenKind {
        use nofy_telemetry::events::AuthTokenKind as K;
        match self {
            Self::ExternalBinary => K::ExternalBinary,
            Self::ApiKey => K::ApiKey,
            Self::None => K::None,
        }
    }
}

#[cfg(test)]
mod tests {
    //! Per-variant matrix for `is_refreshable`.
    use super::*;

    #[test]
    fn is_refreshable_matrix() {
        assert!(TokenType::ExternalBinary.is_refreshable());
        assert!(!TokenType::ApiKey.is_refreshable());
        assert!(!TokenType::None.is_refreshable());
    }
}
