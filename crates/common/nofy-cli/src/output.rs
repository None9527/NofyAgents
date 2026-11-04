use crate::input::{Input, Local};
use nofy_agent_client::{Engine, Envelope, Error, Result};
use nofy_agent_project::Source;
use serde_json::{Value, json};
use std::{io::Write, path::Path, time::Duration};

pub fn emit(envelope: &Envelope, format: &str) -> Result<()> {
    let stdout = std::io::stdout();
    let mut out = stdout.lock();
    if format == "text" {
        writeln!(out, "{}: {}", envelope.operation, envelope.status)?;
        if let Some(error) = &envelope.error {
            writeln!(
                out,
                "{}: {}",
                error["code"].as_str().unwrap_or("error"),
                error["message"].as_str().unwrap_or("")
            )?;
        } else {
            writeln!(out, "{}", serde_json::to_string_pretty(&envelope.data)?)?;
        }
        if !envelope.refs.is_empty() {
            writeln!(out, "refs: {}", serde_json::to_string(&envelope.refs)?)?;
        }
    } else {
        serde_json::to_writer(&mut out, envelope)?;
        writeln!(out)?;
    }
    out.flush()?;
    Ok(())
}
fn save(
    path: &Path,
    replace: bool,
    write: impl FnOnce(&mut std::fs::File) -> Result<()>,
) -> Result<()> {
    let parent = path
        .parent()
        .filter(|p| !p.as_os_str().is_empty())
        .unwrap_or_else(|| Path::new("."));
    let mut file = tempfile::NamedTempFile::new_in(parent)?;
    write(file.as_file_mut())?;
    file.as_file().sync_all()?;
    if replace {
        file.persist(path).map_err(|e| e.error)?;
    } else {
        file.persist_noclobber(path).map_err(|e| e.error)?;
    }
    Ok(())
}
pub fn persist_local(input: &Input, output: &mut Envelope) -> Result<()> {
    if output.is_error() {
        return Ok(());
    }
    if let Some(Local {
        path,
        expected_digest,
    }) = &input.local
    {
        let source: Source = serde_json::from_value(output.data["source"].clone())?;
        nofy_agent_project::write_directory(path, &source, expected_digest.as_deref())?;
        output.refs.insert(
            "local_project".into(),
            Some(path.to_string_lossy().into_owned()),
        );
    }
    Ok(())
}
pub async fn persist_output(
    engine: &Engine,
    op: &str,
    input: &Input,
    output: &Envelope,
    path: &Path,
    replace: bool,
) -> Result<()> {
    if output.is_error() {
        return save(path, replace, |f| {
            serde_json::to_writer(f, output)?;
            Ok(())
        });
    }
    if op == "project.pack" {
        if let Some(source) = input
            .value
            .get("source")
            .or_else(|| input.value.pointer("/target/source"))
        {
            let source: Source = serde_json::from_value(source.clone())?;
            return save(path, replace, |f| {
                nofy_agent_project::pack_to(&source, f)?;
                Ok(())
            });
        }
        let digest = output.data["sha256"]
            .as_str()
            .ok_or_else(|| Error::new("unsupported_protocol", "archive digest missing"))?;
        return download(engine, digest, path, replace).await;
    }
    if op == "agent.export" {
        let source: Source = serde_json::from_value(output.data["source"].clone())?;
        return save(path, replace, |f| {
            nofy_agent_project::pack_to(&source, f)?;
            Ok(())
        });
    }
    if let Some(text) = output
        .data
        .get("deployment_json")
        .or_else(|| output.data.get("native_json"))
        .and_then(Value::as_str)
    {
        save(path, replace, |f| {
            f.write_all(text.as_bytes())?;
            f.write_all(b"\n")?;
            Ok(())
        })
    } else {
        save(path, replace, |f| {
            serde_json::to_writer_pretty(f, output)?;
            Ok(())
        })
    }
}
async fn download(engine: &Engine, digest: &str, path: &Path, replace: bool) -> Result<()> {
    use base64::Engine as _;
    use sha2::{Digest, Sha256};
    let parent = path
        .parent()
        .filter(|p| !p.as_os_str().is_empty())
        .unwrap_or_else(|| Path::new("."));
    let mut file = tempfile::NamedTempFile::new_in(parent)?;
    let mut offset = 0u64;
    let mut expected_total = None;
    let mut hash = Sha256::new();
    loop {
        let chunk = engine
            .client
            .request(
                "GET",
                &["api", "v1", "source-archives", digest, "chunks"],
                &[
                    ("offset".into(), offset.to_string()),
                    ("limit".into(), "1048576".into()),
                ],
                None,
            )
            .await?
            .value()?;
        let total = number(&chunk, "total")?;
        let start = number(&chunk, "offset")?;
        let next = number(&chunk, "next_offset")?;
        let bytes =
            base64::engine::general_purpose::STANDARD
                .decode(chunk["content"].as_str().ok_or_else(|| {
                    Error::new("unsupported_protocol", "archive chunk bytes missing")
                })?)
                .map_err(|_| Error::new("unsupported_protocol", "archive base64 is invalid"))?;
        if start != offset
            || start.checked_add(bytes.len() as u64) != Some(next)
            || next > total
            || expected_total.is_some_and(|old| old != total)
            || chunk["sha256"] != digest
        {
            return Err(Error::new(
                "unsupported_protocol",
                "archive chunk continuity failed",
            ));
        }
        expected_total = Some(total);
        file.write_all(&bytes)?;
        hash.update(&bytes);
        offset = next;
        if chunk["eof"] == true {
            if offset != total {
                return Err(Error::new(
                    "unsupported_protocol",
                    "archive ended before its declared total",
                ));
            }
            break;
        }
        if bytes.is_empty() {
            return Err(Error::new(
                "unsupported_protocol",
                "archive chunk made no progress",
            ));
        }
    }
    if format!("{:x}", hash.finalize()) != digest {
        return Err(Error::new(
            "unsupported_protocol",
            "archive checksum mismatch",
        ));
    }
    file.as_file().sync_all()?;
    if replace {
        file.persist(path).map_err(|e| e.error)?;
    } else {
        file.persist_noclobber(path).map_err(|e| e.error)?;
    }
    Ok(())
}
fn number(v: &Value, key: &str) -> Result<u64> {
    v[key]
        .as_str()
        .and_then(|v| v.parse().ok())
        .ok_or_else(|| Error::new("unsupported_protocol", "archive offset/total is malformed"))
}
pub async fn wait(engine: &Engine, id: &str, timeout: Duration) -> Result<(Envelope, i32)> {
    let deadline = tokio::time::Instant::now() + timeout;
    loop {
        let envelope = engine.execute("run.inspect", json!({"run_id":id})).await;
        if envelope.is_error() {
            let code = exit_code(&envelope);
            return Ok((envelope, code));
        }
        let record: Value =
            serde_json::from_str(envelope.data["native_json"].as_str().ok_or_else(|| {
                Error::new("unsupported_protocol", "run inspection payload missing")
            })?)?;
        let status = record
            .pointer("/execution/status")
            .and_then(Value::as_str)
            .unwrap_or("");
        let job = record
            .pointer("/run/status")
            .and_then(Value::as_str)
            .unwrap_or("");
        let code = match status {
            "completed" => Some(0),
            "paused" | "parked" => Some(8),
            "failed" | "cancelled" | "abandoned" | "budget_exceeded" | "refused" | "truncated" => {
                Some(7)
            }
            _ if matches!(job, "cancelled" | "abandoned") => Some(7),
            _ if job == "waiting" => Some(8),
            _ => None,
        };
        if let Some(code) = code {
            return Ok((envelope, code));
        }
        if tokio::time::Instant::now() >= deadline {
            let mut e = Error::new(
                "result_unconfirmed",
                "wait deadline reached; kernel run continues under the original run ID",
            );
            e.unconfirmed = true;
            e.refs.insert("run_id".into(), Some(id.into()));
            return Ok((Envelope::failed("run.inspect", e), 6));
        }
        tokio::time::sleep(Duration::from_millis(150)).await;
    }
}
pub async fn follow(engine: &Engine, input: Value, format: &str) -> Result<i32> {
    let mut input = input;
    input["wait_seconds"] = json!(30);
    loop {
        let output = engine.execute("run.events", input.clone()).await;
        if output.is_error() {
            let code = exit_code(&output);
            emit(&output, format)?;
            return Ok(code);
        }
        let events: Value = serde_json::from_str(
            output.data["native_json"]
                .as_str()
                .ok_or_else(|| Error::new("unsupported_protocol", "event payload missing"))?,
        )?;
        if events["events"].as_array().is_some_and(|a| !a.is_empty()) {
            emit(&output, format)?;
        }
        if let Some(cursor) = output.next_cursor {
            input["after"] = json!(cursor);
        }
    }
}
pub fn exit_code(output: &Envelope) -> i32 {
    if !output.is_error() {
        return 0;
    }
    match output
        .error
        .as_ref()
        .and_then(|v| v["code"].as_str())
        .unwrap_or("invalid")
    {
        "local_input" => 2,
        "unauthorized" | "forbidden" => 3,
        "conflict" | "runtime_conflict" | "session_closed" | "session_archived" => 4,
        "not_found" => 5,
        "unavailable" | "result_unconfirmed" | "http_error" | "busy" => 6,
        "local_io" => 9,
        "unsupported_protocol" | "unsupported_operation" => 10,
        "cancelled" => 130,
        _ => 7,
    }
}
pub fn offline_archive(op: &str, input: &Input) -> Result<Envelope> {
    let source: Source = serde_json::from_value(
        input
            .value
            .get("source")
            .or_else(|| input.value.pointer("/target/source"))
            .cloned()
            .ok_or_else(|| Error::new("local_input", "source collection missing"))?,
    )?;
    nofy_agent_project::complete(&source)?;
    Ok(Envelope::ok(
        op,
        json!({"format":"nofy.source-archive/v1","source_digest":source.digest()?,"files":source.files.len(),"output_required":true}),
    ))
}
