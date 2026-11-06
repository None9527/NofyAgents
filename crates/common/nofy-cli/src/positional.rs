//! Which input field a command's positional arguments fill.
//!
//! One table, used both to build `--help` and to parse the command line, so the
//! help can never describe something the parser does not do.

/// What the first positional argument means for an operation.
pub enum First {
    /// A local project directory, the same as `--project` (the `project.*` group).
    Project,
    /// The input field of this name.
    Field(&'static str),
}

pub fn first(op: &str) -> Option<First> {
    if op.starts_with("project.") {
        return Some(First::Project);
    }
    if op.starts_with("agent.") && op != "agent.list" {
        return Some(First::Field("agent"));
    }
    let field = match op {
        "draft.get" | "draft.put" | "draft.delete" => "name",
        "repository.add" | "repository.inspect" | "repository.sync" | "repository.remove"
        | "module.publish" | "module.list" => "repository",
        "module.inspect" | "module.export" => "name",
        "system.plan" | "system.apply" | "system.active" | "system.history" | "system.rollback" => {
            "system"
        }
        "system.export" | "system.programs" => "release",
        "action.inspect" => "command_id",
        "run.inspect" | "run.events" | "run.approvals" | "run.decide" | "run.cancel"
        | "run.input" | "run.recovery" => "run_id",
        op if op.starts_with("session.") && !matches!(op, "session.list" | "session.route") => {
            "session_id"
        }
        op if op.starts_with("credential.") && op != "credential.list" => "reference",
        _ => return None,
    };
    Some(First::Field(field))
}

/// The input field the second positional argument fills, if the operation
/// takes one. `has_module_field` is whether its input schema has a `module`.
pub fn second(op: &str, has_module_field: bool) -> Option<&'static str> {
    match op {
        "session.binding" => Some("run_id"),
        "session.command" => Some("command_id"),
        _ if has_module_field => Some("module"),
        _ => None,
    }
}
