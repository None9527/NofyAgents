//! Hub gate (FR2.11, MAP-§3.2): the Hub is demoted to TOOL TRANSPORT;
//! every `workspace.*` call must carry a daemon-issued authorization
//! grant before forwarding.
//!
//! Construction-level guarantees: the forwarder has NO lane for a
//! workspace call without a valid grant — demotion is structural, not
//! configurational. Grants are single-use: replaying a spent grant is
//! refused.

/// One hub message.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum HubMessage {
    /// Ordinary tool transport: forwards freely.
    ToolCall { tool: String },
    /// A workspace.* call: needs a daemon grant.
    WorkspaceCall { method: String, grant: Option<GrantToken> },
}

/// A daemon-issued authorization grant (single-use).
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct GrantToken {
    pub grant_id: String,
    /// The workspace method this grant authorizes.
    pub method: String,
}

/// The gate's forwarding decision.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ForwardDecision {
    Forwarded,
    /// Workspace call without a grant.
    RefusedNoGrant { method: String },
    /// Grant does not cover the called method.
    RefusedMismatch { method: String, grant_method: String },
    /// Grant already spent.
    RefusedReplay { grant_id: String },
}

/// The forwarding gate with the spent-grant ledger.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct HubGate {
    spent: Vec<String>,
    /// Audit: forwarded workspace methods.
    pub forwarded: Vec<String>,
}

impl HubGate {
    /// Decide and (when allowed) forward one message.
    pub fn forward(&mut self, message: &HubMessage) -> ForwardDecision {
        match message {
            HubMessage::ToolCall { .. } => ForwardDecision::Forwarded,
            HubMessage::WorkspaceCall { method, grant } => {
                let Some(grant) = grant else {
                    return ForwardDecision::RefusedNoGrant { method: method.clone() };
                };
                if grant.method != *method {
                    return ForwardDecision::RefusedMismatch {
                        method: method.clone(),
                        grant_method: grant.method.clone(),
                    };
                }
                if self.spent.iter().any(|id| *id == grant.grant_id) {
                    return ForwardDecision::RefusedReplay { grant_id: grant.grant_id.clone() };
                }
                self.spent.push(grant.grant_id.clone());
                self.forwarded.push(method.clone());
                ForwardDecision::Forwarded
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn grant(id: &str, method: &str) -> GrantToken {
        GrantToken { grant_id: id.into(), method: method.into() }
    }

    #[test]
    fn tool_transport_forwards_freely() {
        let mut gate = HubGate::default();
        let msg = HubMessage::ToolCall { tool: "read_file".into() };
        assert_eq!(gate.forward(&msg), ForwardDecision::Forwarded);
        assert!(gate.forwarded.is_empty(), "tool calls leave no workspace audit trail");
    }

    #[test]
    fn workspace_call_without_grant_is_refused() {
        let mut gate = HubGate::default();
        let msg = HubMessage::WorkspaceCall { method: "workspace.write".into(), grant: None };
        assert_eq!(
            gate.forward(&msg),
            ForwardDecision::RefusedNoGrant { method: "workspace.write".into() }
        );
        assert!(gate.forwarded.is_empty());
    }

    #[test]
    fn granted_workspace_call_forwards_and_records() {
        let mut gate = HubGate::default();
        let msg = HubMessage::WorkspaceCall {
            method: "workspace.write".into(),
            grant: Some(grant("g1", "workspace.write")),
        };
        assert_eq!(gate.forward(&msg), ForwardDecision::Forwarded);
        assert_eq!(gate.forwarded, vec!["workspace.write".to_string()]);
    }

    #[test]
    fn grants_are_single_use() {
        let mut gate = HubGate::default();
        let msg = HubMessage::WorkspaceCall {
            method: "workspace.write".into(),
            grant: Some(grant("g1", "workspace.write")),
        };
        gate.forward(&msg);
        assert_eq!(
            gate.forward(&msg),
            ForwardDecision::RefusedReplay { grant_id: "g1".into() },
            "a spent grant never forwards twice"
        );
    }

    #[test]
    fn grant_must_cover_the_called_method() {
        let mut gate = HubGate::default();
        let msg = HubMessage::WorkspaceCall {
            method: "workspace.delete".into(),
            grant: Some(grant("g2", "workspace.write")),
        };
        assert_eq!(
            gate.forward(&msg),
            ForwardDecision::RefusedMismatch {
                method: "workspace.delete".into(),
                grant_method: "workspace.write".into()
            }
        );
    }
}
