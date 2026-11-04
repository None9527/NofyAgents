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
        {
            if seen.insert(r.into()) {
                walk(&SCHEMAS["$defs"][r], out, seen);
            }
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
fn leaf(mut cmd: Command, o: &Operation) -> Command {
    cmd=cmd.about(format!("{} · scopes: {}",o.operation,o.scope_hint.join(","))).after_help(format!("Operation: {}\nFull contract: nofy schema --operation {}\nUse --input FILE or --input - for the complete JSON input. NativeJson flags accept literal JSON or @FILE.",o.operation,o.operation));
    let properties = properties(operation_schema(o));
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
    cmd.arg(Arg::new("arg1").index(1))
        .arg(Arg::new("arg2").index(2))
}
fn tree(name: String, node: Node) -> Command {
    let mut cmd = Command::new(name);
    if let Some(o) = node.operation {
        cmd = leaf(cmd, o);
    } else {
        cmd = cmd.subcommand_required(true).arg_required_else_help(true);
    }
    for (name, child) in node.children {
        cmd = cmd.subcommand(tree(name, child));
    }
    cmd
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
    let mut cmd = tree("nofy".into(), root)
        .version(env!("CARGO_PKG_VERSION"))
        .about("Develop and control declarative Agents through one kernel");
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
            .num_args(1);
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
                .action(ArgAction::SetTrue),
        );
    }
    cmd = cmd.subcommand(
        Command::new("call")
            .about("Call one operation from the registered catalog")
            .arg(Arg::new("operation").required(true)),
    );
    cmd.subcommand(
        Command::new("mcp").subcommand_required(true).subcommand(
            Command::new("serve")
                .arg(
                    Arg::new("transport")
                        .long("transport")
                        .value_parser(["stdio", "http"])
                        .default_value("stdio"),
                )
                .arg(
                    Arg::new("listen")
                        .long("listen")
                        .default_value("127.0.0.1:7332"),
                )
                .arg(
                    Arg::new("allowed_origin")
                        .long("allowed-origin")
                        .action(ArgAction::Append),
                )
                .arg(
                    Arg::new("allowed_host")
                        .long("allowed-host")
                        .action(ArgAction::Append),
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
