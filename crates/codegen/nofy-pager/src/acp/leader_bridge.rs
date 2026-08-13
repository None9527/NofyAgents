//! Leader-connection status type.
//!
//! The leader IPC bridge itself was removed with the leader/relay
//! infrastructure in the sanitized build; only the status enum survives
//! because `AcpConnection.leader_status_rx` and the event loop still type
//! their (now always-`None`) reconnect-status channel against it.

/// Status of a leader reconnection attempt, observable by callers (e.g. TUI
/// banner). Never produced anymore: leader mode was removed, so
/// `leader_status_rx` is always `None` and these variants are unreachable.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ConnectionStatus {
    /// Connected to the leader.
    ///
    /// `generation` is 0 for the initial connection and increments on every
    /// successful reconnect.
    Connected { generation: u64 },
    /// Attempting to reconnect (includes current attempt number).
    Reconnecting { attempt: u32 },
    /// Reconnection failed permanently.
    Failed { error: String },
}
