mod command;
mod config;
mod input;
mod output;
mod positional;
use nofy_agent_client::{Envelope, Error, Result, refs_from_input};
use serde_json::{Value, json};
use std::{io::Read, path::Path};

#[tokio::main]
async fn main() {
    let matches = command::cli().get_matches();
    let (op, leaf) = command::selected(&matches);
    let mcp = op == "mcp.serve";
    let result = run(&op, leaf).await;
    let code = match result {
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
    };
    std::process::exit(code);
}
async fn run(op: &str, m: &clap::ArgMatches) -> Result<i32> {
    let http_mcp = op == "mcp.serve"
        && m.get_one::<String>("transport")
            .is_some_and(|s| s == "http");
    let settings = config::load(m, http_mcp)?;
    let engine = &settings.engine;
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
            nofy_agent_mcp::serve_http(engine.clone(), address, origins, hosts).await
        } else {
            nofy_agent_mcp::serve_stdio(engine.clone()).await
        };
        result.map_err(|e| Error::new("unavailable", e.to_string()))?;
        return Ok(0);
    }
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
        return tokio::select! {result=output::follow(engine,prepared.value.clone(),&settings.format)=>result,_=tokio::signal::ctrl_c()=>Ok(130)};
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
    let mut result = tokio::select! {output=execute=>output?,_=tokio::signal::ctrl_c()=>{
        let mut e=Error::new("result_unconfirmed","CLI wait interrupted; inspect the original business IDs before retrying");e.unconfirmed=true;e.refs=refs_from_input(&prepared.value);let envelope=Envelope::failed(op,e);output::emit(&envelope,&settings.format)?;return Ok(130);
    }};
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
        let waited = tokio::select! {result=output::wait(engine,id,settings.timeout)=>result?,_=tokio::signal::ctrl_c()=>return Ok(130)};
        result.data["wait_result"] = serde_json::to_value(waited.0)?;
        code = waited.1;
    }
    output::emit(&result, &settings.format)?;
    Ok(code)
}
