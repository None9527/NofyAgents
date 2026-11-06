use crate::positional;
use clap::{Arg, ArgAction, Command};
use nofy_agent_client::{OPERATIONS, Operation, SCHEMAS};
use serde_json::Value;
use std::collections::{BTreeMap, BTreeSet};

#[derive(Default)]
struct Node {
    children: BTreeMap<String, Node>,
    operation: Option<&'static Operation>,
}
pub fn properties(schema: &Value) -> BTreeMap<String, Value> {
    fn walk(schema: &Value, out: &mut BTreeMap<String, Value>, seen: &mut BTreeSet<String>) {
        if let Some(r) = schema
            .get("$ref")
            .and_then(Value::as_str)
            .and_then(|s| s.strip_prefix("#/$defs/"))
            && seen.insert(r.into())
        {
            walk(&SCHEMAS["$defs"][r], out, seen);
        }
        if let Some(p) = schema["properties"].as_object() {
            out.extend(p.iter().map(|(k, v)| (k.clone(), v.clone())));
        }
        for k in ["oneOf", "anyOf", "allOf"] {
            if let Some(a) = schema[k].as_array() {
                for s in a {
                    walk(s, out, seen);
                }
            }
        }
    }
    let mut out = BTreeMap::new();
    walk(schema, &mut out, &mut BTreeSet::new());
    out
}
fn operation_schema(o: &Operation) -> &'static Value {
    &SCHEMAS["$defs"][o.input_schema.rsplit('/').next().unwrap_or("")]
}
/// One line for `--help`: the schema's own description when it has one, else
/// what kind of value the flag takes, and whether it is required.
fn flag_help(key: &str, schema: &Value, required: bool) -> String {
    let target = schema
        .get("$ref")
        .and_then(Value::as_str)
        .and_then(|s| s.strip_prefix("#/$defs/"))
        .map_or(schema, |name| &SCHEMAS["$defs"][name]);
    let note = if let Some(text) = schema["description"]
        .as_str()
        .or_else(|| target["description"].as_str())
    {
        text.to_owned()
    } else if key.ends_with("_json") {
        "JSON text, or @FILE".to_owned()
    } else if let Some(options) = target["enum"].as_array() {
        let names: Vec<_> = options.iter().filter_map(Value::as_str).collect();
        format!("one of: {}", names.join(", "))
    } else {
        match target["type"].as_str() {
            Some("integer") => "integer",
            Some("number") => "number",
            Some("boolean") => "true or false",
            Some("array") => "JSON array",
            Some("object") => "JSON object",
            _ => "",
        }
        .to_owned()
    };
    match (note.is_empty(), required) {
        (true, true) => "required".to_owned(),
        (false, true) => format!("{note} (required)"),
        (_, false) => note,
    }
}
fn positional_arg(index: usize, name: &str, field: Option<(&str, &str)>) -> Arg {
    let arg = Arg::new(name.to_owned()).index(index);
    match field {
        Some((value_name, help)) => arg.value_name(value_name.to_owned()).help(help.to_owned()),
        None => arg.hide(true),
    }
}
fn field_positional(index: usize, name: &str, field: &str) -> Arg {
    positional_arg(
        index,
        name,
        Some((
            &field.to_uppercase(),
            &format!("Sets `{field}`, the same as --{}", field.replace('_', "-")),
        )),
    )
}
fn leaf(mut cmd: Command, o: &Operation) -> Command {
    let scopes = if o.scope_hint.is_empty() {
        "none".to_owned()
    } else {
        o.scope_hint.join(", ")
    };
    cmd = cmd.about(o.summary.clone()).after_help(format!(
        "Operation: {op}\nScopes: {scopes}\nContract and assembly guide: nofy schema --operation {op}\nGive the complete input with --input FILE (or --input - for stdin). Flags named *_json take literal JSON text or @FILE.",
        op = o.operation
    ));
    let required: BTreeSet<String> = operation_schema(o)["required"]
        .as_array()
        .into_iter()
        .flatten()
        .filter_map(|v| v.as_str().map(str::to_owned))
        .collect();
    let properties = properties(operation_schema(o));
    let has_module_field = properties.contains_key("module");
    let skip = [
        "config",
        "target",
        "source",
        "set",
        "sources",
        "source_bindings",
        "expected_revision",
        "project_id",
    ];
    for (key, value) in properties {
        if skip.contains(&key.as_str()) {
            continue;
        }
        let mut arg = Arg::new(key.clone()).long(key.replace('_', "-"));
        if key == "empty" {
            arg = arg.action(ArgAction::SetTrue);
        } else if value["type"] == "boolean" {
            arg = arg
                .num_args(0..=1)
                .default_missing_value("true")
                .require_equals(true);
        } else {
            arg = arg.num_args(1);
        }
        arg = arg.help(flag_help(&key, &value, required.contains(&key)));
        if key == "module_ref" {
            arg = arg.visible_alias("module");
        }
        if key == "session_id" {
            arg = arg.visible_alias("session");
        }
        if key == "root_run_id" {
            arg = arg.visible_alias("root");
        }
        cmd = cmd.arg(arg);
    }
    if o.operation.starts_with("agent.module.") || o.operation == "agent.tool.add" {
        for key in ["set", "set-json", "source", "bind"] {
            cmd = cmd.arg(
                Arg::new(key)
                    .long(key)
                    .action(ArgAction::Append)
                    .num_args(1),
            );
        }
        cmd = cmd.arg(
            Arg::new("from")
                .long("from")
                .value_name("NATIVE_MODULE_FILE"),
        );
    }
    if o.operation == "repository.add" {
        for key in ["host-directory", "git-url", "git-ref", "subdirectory"] {
            cmd = cmd.arg(Arg::new(key).long(key).num_args(1));
        }
    }
    if o.operation == "module.publish" {
        cmd = cmd.arg(Arg::new("directory").long("directory").num_args(1));
    }
    if o.operation == "agent.configure" {
        for key in ["set", "set-json"] {
            cmd = cmd.arg(
                Arg::new(key)
                    .long(key)
                    .action(ArgAction::Append)
                    .num_args(1),
            );
        }
    }
    let first = match positional::first(&o.operation) {
        Some(positional::First::Project) => positional_arg(
            1,
            "arg1",
            Some((
                "PROJECT_DIR",
                "Local project directory, the same as --project",
            )),
        ),
        Some(positional::First::Field(field)) => field_positional(1, "arg1", field),
        None => positional_arg(1, "arg1", None),
    };
    let second = match positional::second(&o.operation, has_module_field) {
        Some(field) => field_positional(2, "arg2", field),
        None => positional_arg(2, "arg2", None),
    };
    cmd.arg(first).arg(second)
}
/// What a command group is for. Leaves are described by their catalog summary.
fn group_about(path: &str) -> Option<&'static str> {
    Some(match path {
        "action" => "Read the recorded outcome of a command",
        "agent" => "Create, inspect and edit Agent declarations",
        "agent module" => "Add, change, wire and remove the modules of an Agent",
        "agent tool" => "Add tools to an Agent",
        "budget" => "Inspect budgets",
        "command" => "Analyze a shell command without running it",
        "credential" => {
            "Manage credential references (secret values go in over stdin or a private file)"
        }
        "draft" => "Native deployment drafts",
        "module" => "Immutable, reusable module packages in a repository",
        "permission" => "Durable approval grants",
        "project" => "Source projects: create, inspect, build and pack",
        "repository" => "Module repositories: managed, host directory or Git",
        "resource" => "Kernel-published resources (artifacts and runtimes)",
        "run" => "Durable runs: start, observe, decide, cancel and recover",
        "session" => "Durable sessions and their turns",
        "system" => "Published deployments: validate, publish, activate and roll back",
        "terminal" => "Interactive process resources",
        _ => return None,
    })
}
fn tree(path: String, name: String, node: Node) -> Command {
    let mut cmd = Command::new(name);
    if let Some(o) = node.operation {
        cmd = leaf(cmd, o);
    } else {
        cmd = cmd.subcommand_required(true).arg_required_else_help(true);
        if let Some(about) = group_about(&path) {
            cmd = cmd.about(about);
        }
    }
    for (child_name, child) in node.children {
        let child_path = if path.is_empty() {
            child_name.clone()
        } else {
            format!("{path} {child_name}")
        };
        cmd = cmd.subcommand(tree(child_path, child_name, child));
    }
    cmd
}
/// Help for the options every command shares.
fn global_help(key: &str) -> &'static str {
    match key {
        "endpoint" => {
            "Kernel base URL [default: profile, then $NOFY_ENDPOINT, then http://127.0.0.1:7331]"
        }
        "token_env" => {
            "Name of the environment variable that holds the access token [default: profile, then $NOFY_TOKEN_ENV, then NOFY_ACCESS_TOKEN]"
        }
        "token_file" => "File that holds the access token; it must be private to you",
        "config" => "Client configuration file [default: $NOFY_CONFIG, then the XDG config path]",
        "profile" => {
            "Named profile in the configuration file [default: $NOFY_PROFILE, then `local`]"
        }
        "format" => "Output format: json or text [default: json]",
        "output" => {
            "Write the result (an exported archive or source set where the command makes one) to this file"
        }
        "timeout" => "Request timeout in seconds, up to 86400 [default: $NOFY_TIMEOUT, then 30]",
        "input" => "Read the complete JSON input from this file, or - for stdin",
        "project" => "Local project directory to read and write, instead of a managed project",
        "project_id" => "Managed project id, as an alternative to --project",
        "preset_dir" => "Directory of local presets [default: profile, then $NOFY_PRESET_DIR]",
        "expected_revision" => "Revision the managed project must still have (compare-and-set)",
        "expected_digest" => "Source digest the local project must still have (compare-and-set)",
        "settings" => "Preset settings as a JSON file",
        "file" => "Native JSON body from this file, or - for stdin, for commands that take one",
        "replace_output" => "Overwrite --output if it already exists",
        "offline" => "Do not contact the kernel for operations that can run on local files",
        "follow" => "Keep streaming events until interrupted (run events only)",
        "wait" => {
            "After starting, wait for the run to finish (run start, session start, session turn)"
        }
        _ => "",
    }
}
pub fn cli() -> Command {
    let mut root = Node::default();
    for o in OPERATIONS.iter() {
        let mut node = &mut root;
        for name in o.cli.split_whitespace().skip(1) {
            node = node.children.entry(name.into()).or_default();
        }
        node.operation = Some(o);
    }
    let mut cmd = tree(String::new(), "nofy".into(), root)
        .version(env!("CARGO_PKG_VERSION"))
        .about("Develop and control declarative Agents through one kernel")
        .after_help(crate::output::root_help());
    for key in [
        "endpoint",
        "token_env",
        "token_file",
        "config",
        "profile",
        "format",
        "output",
        "timeout",
        "input",
        "project",
        "project_id",
        "preset_dir",
        "expected_revision",
        "expected_digest",
        "settings",
        "file",
    ] {
        let mut arg = Arg::new(key)
            .long(key.replace('_', "-"))
            .global(true)
            .num_args(1)
            .help(global_help(key));
        if key == "token_env" {
            arg = arg.conflicts_with("token_file");
        }
        if key == "project" {
            arg = arg.conflicts_with("project_id");
        }
        cmd = cmd.arg(arg);
    }
    for key in ["replace_output", "offline", "follow", "wait"] {
        cmd = cmd.arg(
            Arg::new(key)
                .long(key.replace('_', "-"))
                .global(true)
                .action(ArgAction::SetTrue)
                .help(global_help(key)),
        );
    }
    cmd = cmd.subcommand(
        Command::new("call")
            .about("Call one operation by name, with the complete JSON input from --input")
            .arg(
                Arg::new("operation")
                    .required(true)
                    .value_name("OPERATION")
                    .help("Operation name such as run.start; `nofy describe` lists them"),
            ),
    );
    cmd.subcommand(
        Command::new("mcp")
            .about("Serve the operations as MCP tools")
            .subcommand_required(true)
            .subcommand(
                Command::new("serve")
                    .about("Run the MCP server on stdio (default) or Streamable HTTP")
                    .arg(
                        Arg::new("transport")
                            .long("transport")
                            .value_parser(["stdio", "http"])
                            .default_value("stdio")
                            .help("stdio talks over stdin/stdout; http listens on --listen"),
                    )
                    .arg(
                        Arg::new("listen")
                            .long("listen")
                            .default_value("127.0.0.1:7332")
                            .help("Address for --transport http"),
                    )
                    .arg(
                        Arg::new("allowed_origin")
                            .long("allowed-origin")
                            .action(ArgAction::Append)
                            .help("Browser origin allowed to call the HTTP server (repeatable)"),
                    )
                    .arg(
                        Arg::new("allowed_host")
                            .long("allowed-host")
                            .action(ArgAction::Append)
                            .help("Host header value the HTTP server accepts (repeatable)"),
                    ),
            ),
    )
}
pub fn selected<'a>(matches: &'a clap::ArgMatches) -> (String, &'a clap::ArgMatches) {
    let mut names = vec![];
    let mut leaf = matches;
    while let Some((name, child)) = leaf.subcommand() {
        names.push(name);
        leaf = child;
    }
    let path = format!("nofy {}", names.join(" "));
    if path == "nofy call" {
        return (
            leaf.get_one::<String>("operation")
                .cloned()
                .unwrap_or_default(),
            leaf,
        );
    }
    (
        OPERATIONS
            .iter()
            .find(|o| o.cli == path)
            .map(|o| o.operation.clone())
            .unwrap_or_else(|| names.join(".")),
        leaf,
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn the_generated_command_tree_is_well_formed() {
        cli().debug_assert();
    }

    #[test]
    fn every_command_is_described_and_every_group_has_a_description() {
        fn walk(command: &Command, path: &str, problems: &mut Vec<String>) {
            for child in command.get_subcommands() {
                let name = child.get_name();
                if name == "help" {
                    continue;
                }
                let full = format!("{path} {name}");
                if child.get_about().is_none() {
                    problems.push(full.clone());
                }
                walk(child, &full, problems);
            }
        }
        let mut problems = Vec::new();
        walk(&cli(), "nofy", &mut problems);
        assert!(
            problems.is_empty(),
            "commands without a description: {problems:?}"
        );
    }

    #[test]
    fn positional_arguments_fill_real_input_fields() {
        for operation in OPERATIONS.iter() {
            let props = properties(operation_schema(operation));
            if let Some(positional::First::Field(field)) = positional::first(&operation.operation) {
                assert!(
                    props.contains_key(field),
                    "{}: first positional `{field}` is not an input field",
                    operation.operation
                );
            }
            if let Some(field) =
                positional::second(&operation.operation, props.contains_key("module"))
            {
                assert!(
                    props.contains_key(field),
                    "{}: second positional `{field}` is not an input field",
                    operation.operation
                );
            }
        }
    }

    #[test]
    fn leaf_help_is_the_catalog_summary() {
        let root = cli();
        for operation in OPERATIONS.iter() {
            let mut node = &root;
            for name in operation.cli.split_whitespace().skip(1) {
                node = node
                    .find_subcommand(name)
                    .unwrap_or_else(|| panic!("{} is missing from the CLI", operation.cli));
            }
            assert_eq!(
                node.get_about().map(|s| s.to_string()),
                Some(operation.summary.clone()),
                "{}",
                operation.cli
            );
        }
    }
}
