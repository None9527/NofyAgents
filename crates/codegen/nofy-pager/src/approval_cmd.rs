//! `nofy approval` — the batch-approval control-plane entry (W-4).
//! Before this surface existed, pending approvals could be ANSWERED over
//! the control socket (`ApprovalRespond`) but never DISCOVERED: a surface
//! had no way to learn what awaited a decision. `list` projects every
//! pending intent with its enveloped summary; `decide` answers one;
//! `decide-all` answers every pending intent — the batch half.

use anyhow::{bail, Result};
use clap::Subcommand;
use nofy_control_schema::methods::{ApprovalDecision, ControlMethod};

#[derive(Debug, clap::Args, Clone)]
pub struct ApprovalArgs {
    #[command(subcommand)]
    pub command: ApprovalCommand,
}

#[derive(Debug, Subcommand, Clone)]
pub enum ApprovalCommand {
    /// List every pending approval intent with its summary.
    List {
        /// Emit machine-readable JSON output.
        #[arg(long)]
        json: bool,
    },
    /// Answer one pending approval.
    Decide {
        /// Intent identifier (as shown by `approval list`).
        intent_id: String,
        /// The decision: allow (once), session, or deny.
        #[arg(value_parser = parse_decision)]
        decision: ApprovalDecision,
    },
    /// Answer EVERY pending approval with the same decision (batch).
    DecideAll {
        /// The decision: allow (once), session, or deny.
        #[arg(value_parser = parse_decision)]
        decision: ApprovalDecision,
    },
}

/// Parse a user decision token, fail-loud on anything else.
fn parse_decision(raw: &str) -> Result<ApprovalDecision, String> {
    match raw.to_ascii_lowercase().as_str() {
        "allow" | "allow-once" | "allow_once" | "yes" => Ok(ApprovalDecision::AllowOnce),
        "session" | "allow-session" | "allow_session" => Ok(ApprovalDecision::AllowSession),
        "deny" | "no" => Ok(ApprovalDecision::Deny),
        other => Err(format!(
            "unknown decision '{other}' (expected allow, session, or deny)"
        )),
    }
}

/// Execute one approval subcommand against the daemon under `state_dir`.
pub fn run(args: &ApprovalArgs, state_dir: &std::path::Path) -> Result<()> {
    let mut client = nofy_daemon::control_client::ControlClient::connect(state_dir)
        .map_err(|e| anyhow::anyhow!("daemon control socket: {e}"))?;
    match &args.command {
        ApprovalCommand::List { json } => {
            let response = call(&mut client, &ControlMethod::ApprovalList)?;
            render_list(&response, *json);
        }
        ApprovalCommand::Decide { intent_id, decision } => {
            let response = call(
                &mut client,
                &ControlMethod::ApprovalRespond {
                    intent_id: intent_id.clone(),
                    decision: *decision,
                },
            )?;
            let _ = response;
            println!("decided: {intent_id}");
        }
        ApprovalCommand::DecideAll { decision } => {
            // Batch: project the pending set, then answer every intent.
            // Each answer is individual and fail-loud — a stale intent
            // (settled elsewhere mid-batch) is reported, not fatal.
            let listed = call(&mut client, &ControlMethod::ApprovalList)?;
            let pending = listed["pending"].as_array().cloned().unwrap_or_default();
            if pending.is_empty() {
                println!("no pending approvals");
                return Ok(());
            }
            let mut decided = 0usize;
            for item in &pending {
                let Some(intent_id) = item["intent_id"].as_str() else {
                    continue;
                };
                match call(
                    &mut client,
                    &ControlMethod::ApprovalRespond {
                        intent_id: intent_id.to_string(),
                        decision: *decision,
                    },
                ) {
                    Ok(_) => {
                        decided += 1;
                        println!("decided: {intent_id}");
                    }
                    Err(e) => {
                        println!("skipped: {intent_id} ({e})");
                    }
                }
            }
            println!("batch complete: {decided}/{} decided", pending.len());
        }
    }
    Ok(())
}

/// One control call, fail-loud on transport errors and structured errors.
fn call(
    client: &mut nofy_daemon::control_client::ControlClient,
    method: &ControlMethod,
) -> Result<serde_json::Value> {
    let response = client
        .call(method)
        .map_err(|e| anyhow::anyhow!("control call failed: {e}"))?;
    if nofy_daemon::control_client::is_error(&response) {
        bail!(
            "daemon refused: {} ({})",
            response["detail"].as_str().unwrap_or("?"),
            response["code"].as_str().unwrap_or("?")
        );
    }
    Ok(response)
}

/// Render an `approvals_listed` response as a table or JSON.
fn render_list(response: &serde_json::Value, json: bool) {
    if json {
        println!("{}", serde_json::to_string_pretty(response).unwrap_or_default());
        return;
    }
    let pending = response["pending"].as_array();
    let Some(pending) = pending else {
        println!("(no approval table in response)");
        return;
    };
    if pending.is_empty() {
        println!("(no pending approvals)");
        return;
    }
    println!("{:<32}  {}", "INTENT", "SUMMARY");
    for item in pending {
        let summary = item["summary"].as_str().unwrap_or("-");
        let summary: String = summary.chars().take(60).collect();
        println!(
            "{:<32}  {}",
            item["intent_id"].as_str().unwrap_or("?"),
            summary
        );
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn decision_parse_is_strict_and_friendly() {
        assert_eq!(parse_decision("allow").unwrap(), ApprovalDecision::AllowOnce);
        assert_eq!(parse_decision("ALLOW").unwrap(), ApprovalDecision::AllowOnce);
        assert_eq!(parse_decision("session").unwrap(), ApprovalDecision::AllowSession);
        assert_eq!(parse_decision("deny").unwrap(), ApprovalDecision::Deny);
        assert_eq!(parse_decision("no").unwrap(), ApprovalDecision::Deny);
        let err = parse_decision("maybe").unwrap_err();
        assert!(err.contains("unknown decision 'maybe'"), "{err}");
    }

    #[test]
    fn list_renders_rows_and_empty_state() {
        let listed = serde_json::json!({
            "kind": "approvals_listed",
            "pending": [
                {"intent_id": "esc-t1", "summary": "task t1 failed; allow skip-and-continue?"},
                {"intent_id": "esc-t2", "summary": "task t2 failed; allow skip-and-continue?"}
            ]
        });
        render_list(&listed, false);
        render_list(&listed, true);
        let empty = serde_json::json!({"kind": "approvals_listed", "pending": []});
        render_list(&empty, false);
    }
}
