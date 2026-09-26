//! `nofy task` — delegation verbs over the daemon control socket (W-7).
//! Before this surface existed, submitting/inspecting delegated tasks
//! required raw control-socket scripting; results were readable only off
//! the raw journal file. `submit` wraps `TaskSubmit`, `list`/`status`
//! project the task journal.

use anyhow::{Result, bail};
use clap::Subcommand;
use nofy_control_schema::methods::ControlMethod;

#[derive(Debug, clap::Args, Clone)]
pub struct TaskArgs {
    #[command(subcommand)]
    pub command: TaskCommand,
}

#[derive(Debug, Subcommand, Clone)]
pub enum TaskCommand {
    /// Submit a delegation manifest (TOML) to the daemon.
    Submit {
        /// Path to the manifest TOML file.
        manifest: std::path::PathBuf,
        /// Project routing (W-2): working directory every task of the run
        /// is bound to. Defaults to the directory you submit from.
        #[arg(long)]
        cwd: Option<std::path::PathBuf>,
    },
    /// List every journaled task with its lifecycle state.
    List {
        /// Emit machine-readable JSON output.
        #[arg(long)]
        json: bool,
    },
    /// Show one task's state by id.
    Status {
        /// Task identifier (as given in the manifest).
        id: String,
        /// Emit machine-readable JSON output.
        #[arg(long)]
        json: bool,
    },
    /// Cancel a pending/running task (terminal; dependents skip).
    Cancel {
        /// Task identifier (as given in the manifest).
        id: String,
    },
}

/// Execute one task subcommand against the daemon under `state_dir`.
pub fn run(args: &TaskArgs, state_dir: &std::path::Path) -> Result<()> {
    let mut client = nofy_daemon::control_client::ControlClient::connect(state_dir)
        .map_err(|e| anyhow::anyhow!("daemon control socket: {e}"))?;
    let method = match &args.command {
        TaskCommand::Submit { manifest, cwd } => {
            let text = std::fs::read_to_string(manifest)
                .map_err(|e| anyhow::anyhow!("read manifest {}: {e}", manifest.display()))?;
            // Default binding: the directory the submit happens in — a
            // delegated task belongs to the project it was asked from.
            let cwd = match cwd {
                Some(dir) => Some(dir.clone()),
                None => std::env::current_dir().ok(),
            };
            ControlMethod::TaskSubmit {
                manifest: text,
                packs: Vec::new(),
                cwd: cwd.map(|p| p.to_string_lossy().into_owned()),
            }
        }
        TaskCommand::List { .. } | TaskCommand::Status { .. } => ControlMethod::TaskList,
        TaskCommand::Cancel { id } => ControlMethod::TaskCancel {
            task_id: id.clone(),
        },
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
    match &args.command {
        TaskCommand::Submit { .. } => {
            let total = response["total"].as_u64().unwrap_or(0);
            println!("accepted: {total} task(s) in the plan");
        }
        TaskCommand::List { json } => render_list(&response, *json),
        TaskCommand::Status { id, json } => render_status(&response, id, *json),
        TaskCommand::Cancel { id } => {
            println!("cancelled: {id}");
        }
    }
    Ok(())
}

/// Render a `task_listed` response as a table or JSON.
fn render_list(response: &serde_json::Value, json: bool) {
    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(response).unwrap_or_default()
        );
        return;
    }
    let tasks = response["tasks"].as_array();
    let Some(tasks) = tasks else {
        println!("(no task table in response)");
        return;
    };
    if tasks.is_empty() {
        println!("(no tasks)");
        return;
    }
    println!("{:<24} {:<16} {}", "TASK", "STATE", "RUN");
    for task in tasks {
        println!(
            "{:<24} {:<16} {}",
            task["id"].as_str().unwrap_or("?"),
            task["state"].as_str().unwrap_or("?"),
            task["run"].as_str().unwrap_or("-"),
        );
    }
}

/// Render one task's row from a `task_listed` response.
fn render_status(response: &serde_json::Value, id: &str, json: bool) {
    let tasks = response["tasks"].as_array();
    let hit = tasks
        .and_then(|tasks| tasks.iter().find(|t| t["id"].as_str() == Some(id)))
        .cloned();
    match hit {
        Some(task) if json => {
            println!(
                "{}",
                serde_json::to_string_pretty(&task).unwrap_or_default()
            );
        }
        Some(task) => {
            println!(
                "{}  state={}  run={}",
                task["id"].as_str().unwrap_or("?"),
                task["state"].as_str().unwrap_or("?"),
                task["run"].as_str().unwrap_or("-"),
            );
        }
        None => {
            println!("no task with id '{id}' in the journal");
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn list_renders_rows_and_empty_state() {
        let listed = serde_json::json!({
            "kind": "task_listed",
            "tasks": [
                {"id": "t1", "state": "settled_ok", "run": "r1"},
                {"id": "t2", "state": "armed", "run": null}
            ]
        });
        render_list(&listed, false);
        render_list(
            &serde_json::json!({"kind": "task_listed", "tasks": []}),
            false,
        );
        render_list(&listed, true);
    }

    #[test]
    fn status_hits_and_misses() {
        let listed = serde_json::json!({
            "kind": "task_listed",
            "tasks": [{"id": "t1", "state": "claimed", "run": "r1"}]
        });
        render_status(&listed, "t1", false);
        render_status(&listed, "t1", true);
        render_status(&listed, "nope", false);
    }
}
