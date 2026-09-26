use anyhow::Result;
use clap::Subcommand;
use nofy_shell::session::merge::MergedSession;
use nofy_shell::util::nofy_home::nofy_home;
#[derive(Debug, clap::Args, Clone)]
pub struct SessionsArgs {
    #[command(subcommand)]
    command: SessionsCommand,
}

#[derive(Debug, Subcommand, Clone)]
enum SessionsCommand {
    /// List recent sessions (same as search with no query)
    List {
        /// Maximum number of sessions to show
        #[arg(short = 'n', long, default_value = "20")]
        limit: usize,
        /// Show sessions from all projects, not just the current directory
        #[arg(long)]
        all: bool,
    },
    /// Search sessions by keyword
    Search {
        /// Search query (searches summaries and first prompts).
        query: String,
        /// Maximum number of sessions to show
        #[arg(short = 'n', long, default_value = "20")]
        limit: usize,
        /// Search sessions from all projects, not just the current directory
        #[arg(long)]
        all: bool,
    },
    /// Permanently delete a session from history
    Delete {
        /// Session id to delete.
        id: String,
    },
}

pub async fn run(args: SessionsArgs) -> Result<()> {
    let cwd = std::env::current_dir().unwrap_or_else(|_| ".".into());

    match args.command {
        SessionsCommand::List { limit, all } => {
            // W-8: sessions live per-project; `--all` drops the cwd filter so
            // the global assistant can see every project's sessions at once.
            let cwd_filter = if all { None } else { cwd.to_str() };
            let sessions = nofy_shell::session::merge::fetch_merged(
                cwd_filter,
                nofy_shell::session::merge::CwdScope::WithSiblings,
                None,
                limit,
                // The CLI listing is an inventory, not the resume picker.
                nofy_shell::session::visibility::HeadlessPolicy::Include,
            )
            .await;
            print_sessions_grouped(&sessions);
        }
        SessionsCommand::Search { query, limit, all } => {
            use nofy_shell::session::storage::search::{SessionSearchRequest, execute_search};

            let req = SessionSearchRequest {
                query,
                cwd: if all {
                    None
                } else {
                    Some(cwd.to_string_lossy().to_string())
                },
                limit,
                offset: 0,
                include_content: true,
            };
            let root = nofy_home();

            let resp = execute_search(&root, &req).await?;

            for hit in &resp.results {
                let title = if hit.title.is_empty() {
                    "(untitled)"
                } else {
                    &hit.title
                };
                let time = chrono::DateTime::from_timestamp(hit.updated_at_unix, 0)
                    .map(|dt| {
                        dt.with_timezone(&chrono::Local)
                            .format("%b %d, %l:%M%P")
                            .to_string()
                    })
                    .unwrap_or_default();
                println!(
                    "{} (score: {:.2})  {}\n  {}\n  {}",
                    hit.session_id,
                    hit.score,
                    time,
                    title,
                    hit.snippet.as_deref().unwrap_or("")
                );
            }

            println!("\nTotal: {}", resp.results.len());
        }
        SessionsCommand::Delete { id } => {
            // Pass `cwd = None` so the session is found by id regardless of
            // which workspace it was created in; the local delete still uses
            // the resolved per-session cwd.
            let deletion =
                nofy_shell::session::persistence::delete_session_history(&id, None).await?;

            if deletion.any_removed() {
                println!("Deleted session {id}");
            } else {
                println!("No session found with id {id}.");
            }
        }
    }

    Ok(())
}

/// Print sessions grouped by worktree label, preserving the original table
/// format with a `Label: <label>` header before each group.
fn print_sessions_grouped(sessions: &[MergedSession]) {
    if sessions.is_empty() {
        println!("No sessions found.");
        return;
    }

    // Group by worktree_label, sort alphabetically, None last. A session
    // without a worktree label falls back to its project directory name
    // (cwd tail) so `--all` shows which project each session belongs to
    // (U5-02/U3-08: global list must carry attribution).
    let label_of = |s: &MergedSession| -> Option<String> {
        s.worktree_label.clone().or_else(|| {
            std::path::Path::new(&s.cwd)
                .file_name()
                .and_then(|n| n.to_str())
                .map(str::to_string)
        })
    };
    let mut groups: std::collections::BTreeMap<Option<String>, Vec<&MergedSession>> =
        std::collections::BTreeMap::new();
    for s in sessions {
        groups.entry(label_of(s)).or_default().push(s);
    }

    let header = format!(
        "{:<36}  {:<10}  {:<10}  {:<10}  {}",
        "SESSION ID", "CREATED", "UPDATED", "STATUS", "SUMMARY"
    );

    // Labeled groups first (alphabetical), then unlabeled last.
    let none_group = groups.remove(&None);
    let print_group = |label_line: &str, members: &[&MergedSession]| {
        println!("\n{label_line}");
        println!("{header}");
        for s in members {
            let first_line;
            let summary: &str = if !s.summary.is_empty() {
                &s.summary
            } else if let Some(ref fp) = s.first_prompt
                && let Some(line) = fp.lines().find(|l| !l.trim().is_empty())
            {
                first_line = line.trim().to_string();
                &first_line
            } else {
                "(no summary)"
            };
            let truncated: String = summary.chars().take(50).collect();
            let created = &s.created_at[..s.created_at.len().min(10)];
            let updated = &s.updated_at[..s.updated_at.len().min(10)];
            println!(
                "{}  {}  {}  {}  {}",
                s.session_id, created, updated, s.source, truncated
            );
        }
    };

    for (label, members) in &groups {
        let line = format!("Label: {}", label.as_deref().unwrap_or(""));
        print_group(&line, members);
    }
    if let Some(members) = &none_group {
        print_group("(no label)", members);
    }
}
