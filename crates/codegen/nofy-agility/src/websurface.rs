//! Web surface (FR13.2): serve, gated by the trust fence, projecting ONE
//! session truth.
//!
//! The Web surface is a control-plane CLIENT — it renders the same session
//! state every surface sees (「四表面同一会话真相」); it adds no second
//! truth. And it never renders before the trust fence (FR5.4) allows the
//! request.

use crate::trustfence::{FenceVerdict, RequestHeaders, check};

/// The surfaces that share one session truth.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SurfaceKind {
    Tui,
    Web,
    Headless,
    Webhook,
}

/// One session's truth, as the control plane knows it.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SessionTruth {
    pub session_id: String,
    pub state_version: u64,
    pub status: String,
}

/// A surface projection of the truth.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SurfaceProjection {
    pub surface: SurfaceKind,
    pub session_id: String,
    pub state_version: u64,
    pub status: String,
}

/// Project the truth for a surface (pure rendering — same input truth,
/// same projection, for every surface).
pub fn project(truth: &SessionTruth, surface: SurfaceKind) -> SurfaceProjection {
    SurfaceProjection {
        surface,
        session_id: truth.session_id.clone(),
        state_version: truth.state_version,
        status: truth.status.clone(),
    }
}

/// The Web gate: fence first, then project. A refused fence means no
/// projection at all.
pub fn web_gate(
    headers: &RequestHeaders,
    truth: &SessionTruth,
    allowed_hosts: &[String],
) -> Result<SurfaceProjection, FenceVerdict> {
    match check(headers, allowed_hosts) {
        FenceVerdict::Allowed => Ok(project(truth, SurfaceKind::Web)),
        refusal => Err(refusal),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn truth() -> SessionTruth {
        SessionTruth {
            session_id: "sess-1".into(),
            state_version: 42,
            status: "running".into(),
        }
    }

    fn allowed() -> Vec<String> {
        vec!["localhost".into()]
    }

    #[test]
    fn web_surface_renders_the_same_truth() {
        let headers = RequestHeaders {
            host: Some("localhost".into()),
            sec_fetch_site: Some("same-origin".into()),
            origin: Some("http://localhost".into()),
            forwarded_host: None,
        };
        let projection = web_gate(&headers, &truth(), &allowed()).unwrap();
        assert_eq!(projection.surface, SurfaceKind::Web);
        assert_eq!(projection.session_id, "sess-1");
        assert_eq!(projection.state_version, 42);
    }

    #[test]
    fn refused_fence_means_no_projection() {
        let headers = RequestHeaders {
            host: Some("attacker.example".into()),
            sec_fetch_site: None,
            origin: None,
            forwarded_host: None,
        };
        assert!(web_gate(&headers, &truth(), &allowed()).is_err());
    }

    #[test]
    fn all_surfaces_project_identically() {
        let truth = truth();
        let tui = project(&truth, SurfaceKind::Tui);
        let web = project(&truth, SurfaceKind::Web);
        let headless = project(&truth, SurfaceKind::Headless);
        // One truth: identical session identity and version everywhere.
        assert_eq!(tui.session_id, web.session_id);
        assert_eq!(web.session_id, headless.session_id);
        assert_eq!(tui.state_version, web.state_version);
        assert_eq!(web.state_version, headless.state_version);
    }
}
