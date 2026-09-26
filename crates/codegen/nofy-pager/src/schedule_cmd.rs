//! `nofy schedule` — manage the daemon's schedules over the control
//! socket (batch Z). The client transport lives in `nofy-daemon`
//! (`control_client`); this module is the CLI surface: parse, call,
//! render. Scheduling is DEFAULT-OFF end to end — `enable` is a
//! deliberate act.

use anyhow::{Result, bail};
use clap::Subcommand;
use nofy_control_schema::methods::ControlMethod;

#[derive(Debug, clap::Args, Clone)]
pub struct ScheduleArgs {
    #[command(subcommand)]
    pub command: ScheduleCommand,
}

#[derive(Debug, Subcommand, Clone)]
pub enum ScheduleCommand {
    /// Enable the daemon scheduler (deliberate opt-in; it is off by default).
    Enable,
    /// Add (or re-enable) a schedule; the cron spec is grammar-checked fail-loud.
    Add {
        /// Schedule identifier.
        id: String,
        /// Cron expression (five fields).
        cron_spec: String,
        /// What each fired run executes (required: a schedule without a
        /// goal has nothing to run).
        #[arg(long)]
        goal: String,
        /// Working directory the fired runs are bound to.
        #[arg(long)]
        cwd: Option<String>,
        /// One-shot: self-disable after the first successful run.
        #[arg(long)]
        once: bool,
    },
    /// Remove a schedule and every pending obligation for it.
    Remove {
        /// Schedule identifier.
        id: String,
    },
    /// List the schedule table.
    List {
        /// Emit machine-readable JSON output.
        #[arg(long)]
        json: bool,
    },
}

/// Execute one schedule subcommand against the daemon under `state_dir`.
pub fn run(args: &ScheduleArgs, state_dir: &std::path::Path) -> Result<()> {
    let mut client = nofy_daemon::control_client::ControlClient::connect(state_dir)
        .map_err(|e| anyhow::anyhow!("daemon control socket: {e}"))?;
    let method = match &args.command {
        ScheduleCommand::Enable => ControlMethod::ScheduleEnable,
        ScheduleCommand::Add {
            id,
            cron_spec,
            goal,
            cwd,
            once,
        } => ControlMethod::ScheduleAdd {
            id: id.clone(),
            cron_spec: cron_spec.clone(),
            goal: Some(goal.clone()),
            cwd: cwd.clone(),
            once: *once,
        },
        ScheduleCommand::Remove { id } => ControlMethod::ScheduleRemove { id: id.clone() },
        ScheduleCommand::List { .. } => ControlMethod::ScheduleList,
    };
    let response = client
        .call(&method)
        .map_err(|e| anyhow::anyhow!("control call failed: {e}"))?;
    if nofy_daemon::control_client::is_error(&response) {
        bail!(
            "daemon refused: {} ({})",
            response["detail"].as_str().unwrap_or("?"),
            response["code"].as_str().unwrap_or("?")
        );
    }
    if let ScheduleCommand::List { json } = &args.command {
        render_list(&response, *json);
    } else {
        println!("ok");
    }
    Ok(())
}

/// Render a `schedule_listed` response as a table or JSON.
fn render_list(response: &serde_json::Value, json: bool) {
    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(response).unwrap_or_default()
        );
        return;
    }
    let entries = response["entries"].as_array();
    let Some(entries) = entries else {
        println!("(no schedule table in response)");
        return;
    };
    if entries.is_empty() {
        println!("(no schedules)");
        return;
    }
    println!(
        "{:<24} {:<16} {:>8}  {:<24}  {}",
        "ID", "SPEC", "PENDING", "GOAL", "STATE"
    );
    for entry in entries {
        let state = match entry["disabled_reason"].as_str() {
            Some(reason) => format!("disabled ({reason})"),
            None if entry["once"].as_bool().unwrap_or(false) => "live (once)".to_string(),
            None => "live".to_string(),
        };
        let goal = entry["goal"].as_str().unwrap_or("-").to_string();
        let goal = if goal.chars().count() > 24 {
            goal.chars().take(23).chain(['…']).collect()
        } else {
            goal
        };
        println!(
            "{:<24} {:<16} {:>8}  {:<24}  {}",
            entry["id"].as_str().unwrap_or("?"),
            entry["spec"].as_str().unwrap_or("?"),
            entry["pending"].as_u64().unwrap_or(0),
            goal,
            state
        );
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn list_renders_table_rows_and_empty_state() {
        let listed = serde_json::json!({
            "kind": "schedule_listed",
            "entries": [
                {"id": "nightly", "spec": "0 3 * * *", "pending": 2, "disabled_reason": null},
                {"id": "flaky", "spec": "* * * * *", "pending": 0, "disabled_reason": "3 failures"}
            ]
        });
        // Rendering must not panic on full/empty tables; the shape is the
        // contract (id/spec/pending/disabled_reason).
        render_list(&listed, false);
        let empty = serde_json::json!({"kind": "schedule_listed", "entries": []});
        render_list(&empty, false);
        render_list(&listed, true);
    }
}
