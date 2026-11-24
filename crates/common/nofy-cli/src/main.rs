mod command;
mod config;
mod input;
mod output;
mod positional;
use nofy_agent_client::{Envelope, Error, Result, Toolset, refs_from_input};
use serde_json::{Value, json};
use std::{io::Read, path::Path};

fn main() {
    let runtime = match tokio::runtime::Builder::new_multi_thread()
        .worker_threads(nofy_tty_utils::runtime::capped_worker_threads().get())
        .enable_all()
        .build()
    {
        Ok(runtime) => runtime,
        Err(error) => {
            eprintln!("unavailable: failed to initialize async runtime: {error}");
            std::process::exit(1);
        }
    };
    let code = runtime.block_on(async_main());
    drop(runtime);
    std::process::exit(code);
}

async fn async_main() -> i32 {
    let args: Vec<_> = std::env::args_os().collect();
    let mut flags = args.iter().skip(1);
    let mut toolset = Toolset::default();
    while let Some(arg) = flags.next() {
        if arg == "--" {
            break;
        }
        let name = if arg == "--toolset" {
            flags.next().and_then(|value| value.to_str())
        } else {
            arg.to_str()
                .and_then(|value| value.strip_prefix("--toolset="))
        };
        if let Some(name) = name {
            match name.parse() {
                Ok(value) => toolset = value,
                Err(error) => command::cli(toolset)
                    .error(clap::error::ErrorKind::InvalidValue, format!("{error}"))
                    .exit(),
            }
        }
    }
    let matches = command::cli(toolset).get_matches_from(args);
    let (op, leaf) = command::selected(&matches);
    let mcp = op == "mcp.serve";
    let result = run(&op, leaf, toolset).await;
    match result {
        Ok(code) => code,
        Err(e) => {
            if mcp {
                eprintln!("{}: {}", e.code, e.message);
                output::exit_code(&Envelope::failed(&op, e))
            } else {
                let envelope = Envelope::failed(&op, e);
                let code = output::exit_code(&envelope);
                let _ = output::emit(&envelope, "json");
                code
            }
        }
    }
}
async fn run(op: &str, m: &clap::ArgMatches, toolset: Toolset) -> Result<i32> {
    let http_mcp = op == "mcp.serve"
        && m.get_one::<String>("transport")
            .is_some_and(|s| s == "http");
    let settings = config::load(m, http_mcp)?;
    let engine = &settings.engine.clone().with_operation_view(toolset.sdk());
    if op == "mcp.serve" {
        let result = if http_mcp {
            let address = m
                .get_one::<String>("listen")
                .and_then(|s| s.parse().ok())
                .ok_or_else(|| Error::new("local_input", "invalid MCP listen address"))?;
            let origins = m
                .get_many::<String>("allowed_origin")
                .map(|v| v.cloned().collect())
                .unwrap_or_default();
            let hosts = m
                .get_many::<String>("allowed_host")
                .map(|v| v.cloned().collect())
                .unwrap_or_default();
            let allow_non_loopback = m.get_flag("allow_non_loopback");
            nofy_agent_mcp::serve_http(engine.clone(), address, allow_non_loopback, origins, hosts)
                .await
        } else {
            if let Err(error) = nofy_tty_utils::kill_current_process_on_parent_death() {
                eprintln!("warning: could not bind MCP stdio process to parent lifetime: {error}");
            }
            nofy_agent_mcp::serve_stdio(engine.clone()).await
        };
        result.map_err(|e| Error::new("unavailable", e.to_string()))?;
        return Ok(0);
    }
    engine.require_operation(op)?;
    if m.get_flag("wait") && !matches!(op, "run.start" | "session.start" | "session.turn") {
        return Err(Error::new(
            "local_input",
            "--wait requires run start, session start or session turn",
        ));
    }
    let mut prepared = input::prepare(op, m, engine).await?;
    for note in &prepared.notes {
        eprintln!("{note}");
    }
    if op == "project.pack" && prepared.value.get("source").is_some() {
        if m.get_one::<String>("output").is_none() {
            return Err(Error::new(
                "local_input",
                "local project pack requires --output",
            ));
        }
        let source = serde_json::from_value(prepared.value["source"].clone())?;
        prepared.value["source"] = serde_json::to_value(engine.resolve_source(&source).await?)?;
    }
    if m.get_flag("follow") {
        if op != "run.events" {
            return Err(Error::new(
                "local_input",
                "--follow is supported only for run events",
            ));
        }
        return tokio::select! {
            result = output::follow(engine, prepared.value.clone(), &settings.format) => result,
            _ = tokio::signal::ctrl_c() => Ok(130),
        };
    }
    let execute = async {
        if prepared.local_create && op == "agent.create" {
            let mut template = json!({"agent":prepared.value["agent"]});
            if let Some(preset) = prepared.value.get("preset") {
                template["preset"] = preset.clone();
                if let Some(version) = prepared.value.get("preset_version") {
                    template["version"] = version.clone();
                }
            } else {
                template["empty"] = json!(true);
            }
            let mut output = engine.execute("project.template", template).await;
            output.operation = op.into();
            return Ok(output);
        }
        if op == "project.pack" && prepared.value.get("source").is_some() {
            if m.get_one::<String>("output").is_none() {
                return Err(Error::new(
                    "local_input",
                    "local project pack requires --output",
                ));
            }
            return output::offline_archive(op, &prepared);
        }
        if op == "credential.put" {
            nofy_agent_client::validate(op, &prepared.value)?;
            let secret = match prepared
                .value
                .pointer("/value_from/kind")
                .and_then(Value::as_str)
            {
                Some("stdin") => {
                    if prepared.stdin {
                        return Err(Error::new(
                            "local_input",
                            "operation JSON and credential value cannot both read stdin",
                        ));
                    }
                    let mut text = zeroize::Zeroizing::new(String::new());
                    std::io::stdin().read_to_string(&mut text)?;
                    if text.ends_with('\n') {
                        text.pop();
                        if text.ends_with('\r') {
                            text.pop();
                        }
                    }
                    text
                }
                Some("file") => config::private_text(Path::new(
                    prepared
                        .value
                        .pointer("/value_from/path")
                        .and_then(Value::as_str)
                        .ok_or_else(|| Error::new("local_input", "credential file path missing"))?,
                ))?,
                _ => {
                    return Err(Error::new(
                        "local_input",
                        "choose private credential stdin or file input",
                    ));
                }
            };
            return Ok(engine.put_credential(prepared.value.clone(), secret).await);
        }
        Ok(engine.execute(op, prepared.value.clone()).await)
    };
    let mut result = tokio::select! {
        output = execute => output?,
        _ = tokio::signal::ctrl_c() => {
            let mut e = Error::new(
                "result_unconfirmed",
                "CLI wait interrupted; inspect the original business IDs before retrying",
            );
            e.unconfirmed = true;
            e.refs = refs_from_input(&prepared.value);
            let envelope = Envelope::failed(op, e);
            output::emit(&envelope, &settings.format)?;
            return Ok(130);
        }
    };
    let finish = async {
        output::persist_local(&prepared, &mut result)?;
        // Only some commands have a --directory; asking another for it would panic.
        let directory = m.try_get_one::<String>("directory").ok().flatten();
        output::persist_template(op, directory, &mut result)?;
        if let Some(path) = m.get_one::<String>("output") {
            output::persist_output(
                engine,
                op,
                &prepared,
                &result,
                Path::new(path),
                m.get_flag("replace_output"),
            )
            .await?;
            result.refs.insert("output".into(), Some(path.clone()));
        }
        Ok::<(), Error>(())
    }
    .await;
    if let Err(mut e) = finish {
        e.refs.extend(result.refs.clone());
        e.details = json!({"completed_operation":result,"pending_stage":"local_output"});
        return Err(e);
    }
    let mut code = output::exit_code(&result);
    if m.get_flag("wait") && !result.is_error() {
        let id = result
            .refs
            .get("run_id")
            .and_then(|v| v.as_deref())
            .or_else(|| result.data.get("run_id").and_then(Value::as_str))
            .ok_or_else(|| {
                Error::new(
                    "local_input",
                    "--wait requires an operation that returns run_id",
                )
            })?;
        let waited = tokio::select! {
            result = output::wait(engine, id, settings.timeout) => result?,
            _ = tokio::signal::ctrl_c() => return Ok(130),
        };
        result.data["wait_result"] = serde_json::to_value(waited.0)?;
        code = waited.1;
    }
    output::emit(&result, &settings.format)?;
    Ok(code)
}
