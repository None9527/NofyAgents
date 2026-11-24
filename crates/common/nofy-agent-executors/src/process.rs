use crate::{
    config::{self, JsonBinding, ToolContract},
    resources::ProcessEnvironment,
};
use nofy_agent_runtime::{
    Error,
    registry::{ModuleDescriptor, ModuleFactory, ModuleInstance},
};
use nofy_tool_runtime::{ToolCallContext, ToolDispatch, ToolError, ToolStream, TypedToolOutput};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use std::{collections::BTreeMap, path::PathBuf, process::Stdio, sync::Arc, time::Duration};
use tokio::io::{AsyncRead, AsyncReadExt, AsyncWriteExt};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ProcessToolConfig {
    pub contract: ToolContract,
    pub program: String,
    #[serde(default)]
    pub args: Vec<String>,
    /// Only an explicitly installed interpreter may receive script code. Code
    /// belongs to the immutable module config; tool input is always JSON stdin.
    #[serde(default)]
    pub script: Option<String>,
    #[serde(default)]
    pub cwd: PathBuf,
    #[serde(default)]
    pub input: JsonBinding,
}
pub struct ProcessToolFactory {
    environment: ProcessEnvironment,
    revision: String,
}
impl ProcessToolFactory {
    pub fn new(revision: &str, environment: ProcessEnvironment) -> Result<Self, Error> {
        if revision.trim().is_empty() {
            return Err(crate::composition("process factory revision required"));
        }
        Ok(Self {
            revision: format!("{revision}:{}", environment.identity),
            environment,
        })
    }
}
impl ModuleFactory for ProcessToolFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        config::descriptor(
            "tool.process",
            &self.revision,
            json!({"type":"object","additionalProperties":false,"required":["contract","program"],"properties":{
            "contract":config::contract_schema(),"program":{"type":"string","enum":self.environment.programs.keys().collect::<Vec<_>>()},
            "args":{"type":"array","items":{"type":"string"},"maxItems":256},"script":{"type":["string","null"],"maxLength":1048576},
            "cwd":{"type":"string"},"input":{"$ref":"#/$defs/binding"}
        },"$defs":{"binding":config::binding_schema()}}),
        )
    }
    fn build(
        &self,
        config: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        let config: ProcessToolConfig = serde_json::from_value(config.clone())
            .map_err(|e| crate::composition(format!("tool.process: {e}")))?;
        config.contract.validate()?;
        config.input.validate()?;
        let program = self
            .environment
            .programs
            .get(&config.program)
            .ok_or_else(|| crate::composition("process program not installed"))?;
        if config.script.is_some() && program.script_flag.is_none() {
            return Err(crate::composition(
                "program was not installed as a script interpreter",
            ));
        }
        if config.cwd.is_absolute()
            || config
                .cwd
                .components()
                .any(|c| matches!(c, std::path::Component::ParentDir))
        {
            return Err(crate::composition(
                "process cwd must be relative inside the workspace",
            ));
        }
        if config.args.len() > 256
            || config.args.iter().any(|s| s.contains('\0'))
            || config
                .script
                .as_ref()
                .is_some_and(|s| s.len() > 1_048_576 || s.contains('\0'))
        {
            return Err(crate::composition(
                "process arguments/script exceed supported limits",
            ));
        }
        let contract = config.contract.clone();
        Ok(ModuleInstance::ToolPack(crate::catalog(
            &contract,
            Arc::new(ProcessDispatch {
                environment: self.environment.clone(),
                config,
            }),
        )?))
    }
}

struct ProcessDispatch {
    environment: ProcessEnvironment,
    config: ProcessToolConfig,
}
async fn read_bounded(
    mut reader: impl AsyncRead + Unpin,
    limit: usize,
) -> Result<Vec<u8>, ToolError> {
    let mut bytes = Vec::new();
    let mut buffer = [0u8; 8192];
    loop {
        let count = reader
            .read(&mut buffer)
            .await
            .map_err(|_| crate::tool_error("process_io", "failed to read process output"))?;
        if count == 0 {
            return Ok(bytes);
        }
        if count > limit.saturating_sub(bytes.len()) {
            return Err(crate::tool_error(
                "output_limit",
                "process output exceeds configured byte limit",
            ));
        }
        bytes.extend_from_slice(&buffer[..count]);
    }
}

const DIAGNOSTIC_KEEP_BYTES: usize = 8192;
const DIAGNOSTIC_DRAIN_LIMIT_BYTES: usize = 1024 * 1024;

/// Drain diagnostics up to a hard total byte cap so an erroring worker does not
/// deadlock on stderr, while a log flood or lingering grandchild cannot stall
/// the call until `timeout_ms`.
async fn read_diagnostic(mut reader: impl AsyncRead + Unpin) -> Result<(Vec<u8>, bool), ToolError> {
    let mut kept = Vec::new();
    let mut truncated = false;
    let mut drained = 0usize;
    let mut buffer = [0u8; 4096];
    loop {
        let count = reader
            .read(&mut buffer)
            .await
            .map_err(|_| crate::tool_error("process_io", "failed to read process diagnostics"))?;
        if count == 0 {
            return Ok((kept, truncated));
        }
        let remaining = DIAGNOSTIC_KEEP_BYTES.saturating_sub(kept.len());
        kept.extend_from_slice(&buffer[..count.min(remaining)]);
        truncated |= count > remaining;
        drained = drained.saturating_add(count);
        if drained >= DIAGNOSTIC_DRAIN_LIMIT_BYTES {
            truncated = true;
            return Ok((kept, truncated));
        }
    }
}
fn exit_error(
    status: std::process::ExitStatus,
    stderr: (Vec<u8>, bool),
    env: &BTreeMap<String, String>,
) -> ToolError {
    // Environment secrets are deliberately not diagnostic output. Replace
    // longer values first so overlapping values cannot expose a secret suffix.
    let mut secrets: Vec<_> = env
        .iter()
        .filter(|(key, value)| {
            !value.is_empty() && {
                let key = key.to_ascii_uppercase();
                [
                    "API",
                    "AUTH",
                    "BEARER",
                    "COOKIE",
                    "CREDENTIAL",
                    "KEY",
                    "PASSWORD",
                    "PRIVATE",
                    "SECRET",
                    "TOKEN",
                ]
                .iter()
                .any(|word| key.contains(word))
            }
        })
        .map(|(_, value)| value)
        .collect();
    secrets.sort_by_key(|s| std::cmp::Reverse(s.len()));
    let mut redacted = Vec::new();
    let mut cursor = 0;
    while cursor < stderr.0.len() {
        let remaining = &stderr.0[cursor..];
        if let Some(secret) = secrets.iter().find(|secret| {
            remaining.starts_with(secret.as_bytes())
                || (stderr.1 && secret.as_bytes().starts_with(remaining))
        }) {
            redacted.extend_from_slice(b"[redacted]");
            cursor += secret.len().min(remaining.len());
        } else {
            redacted.push(stderr.0[cursor]);
            cursor += 1;
        }
    }
    let text = String::from_utf8_lossy(&redacted).into_owned();
    #[cfg(unix)]
    let signal = {
        use std::os::unix::process::ExitStatusExt;
        status.signal()
    };
    #[cfg(not(unix))]
    let signal: Option<i32> = None;
    crate::tool_error("process_exit", format!("process exited unsuccessfully (code {:?})",status.code()))
        .with_details(json!({"code":"process_exit","exit_code":status.code(),"signal":signal,"stderr":text,"stderr_truncated":stderr.1}))
}
#[async_trait::async_trait]
impl ToolDispatch for ProcessDispatch {
    async fn call(
        &self,
        id: nofy_tool_protocol::ToolId,
        args: Value,
        ctx: ToolCallContext,
    ) -> ToolStream<TypedToolOutput> {
        let operation = async {
            crate::validate_input(&self.config.contract, &args)?;
            let input = self.config.input.render(&args)?;
            let bytes = serde_json::to_vec(&input)
                .map_err(|_| crate::tool_error("input_mapping", "process input is not JSON"))?;
            if bytes.len() > self.config.contract.max_input_bytes {
                return Err(crate::tool_error(
                    "input_limit",
                    "mapped process input exceeds byte limit",
                ));
            }
            let program = &self.environment.programs[&self.config.program];
            program.verify().await?;
            let cwd = self.environment.cwd(&self.config.cwd).await?;
            let mut command = tokio::process::Command::new(&program.path);
            command
                .args(&self.config.args)
                .current_dir(cwd)
                .env_clear()
                .envs(&self.environment.env)
                .stdin(Stdio::piped())
                .stdout(Stdio::piped())
                .stderr(Stdio::piped())
                .kill_on_drop(true);
            if let Some(script) = &self.config.script {
                command
                    .arg(program.script_flag.as_ref().expect("validated interpreter"))
                    .arg(script);
            }
            nofy_tty_utils::detach_command(&mut command);
            self.environment.guard.prepare(&mut command)?;
            let mut owner = nofy_tty_utils::OwnedChild::spawn(&mut command).map_err(|e| {
                use nofy_tty_utils::OwnedChildError as E;
                match e {
                    E::Spawn(_) => {
                        crate::tool_error("process_spawn", "installed process could not start")
                    }
                    E::Group(_) => {
                        crate::tool_error("process_group", "cannot create process group")
                    }
                    E::Attach(_) => {
                        crate::tool_error("process_group", "cannot attach process group")
                    }
                }
            })?;
            let mut stdin = owner.child.stdin.take().expect("piped stdin");
            let stdout = owner.child.stdout.take().expect("piped stdout");
            let stderr = owner.child.stderr.take().expect("piped stderr");
            let write = async {
                stdin.write_all(&bytes).await.map_err(|_| {
                    crate::tool_error("process_io", "failed to write process input")
                })?;
                drop(stdin);
                Ok::<_, ToolError>(())
            };
            let wait = async {
                owner
                    .child
                    .wait()
                    .await
                    .map_err(|_| crate::tool_error("process_wait", "process wait failed"))
            };
            // Output is a hard budget: stop the operation as soon as its read
            // fails. OwnedChild then terminates the process group on drop.
            // Keep other results together so a closed stdin does not hide a
            // nonzero exit and its diagnostics.
            let (stdout, (written, stderr, status)) = tokio::try_join!(
                read_bounded(stdout, self.config.contract.max_output_bytes),
                async { Ok::<_, ToolError>(tokio::join!(write, read_diagnostic(stderr), wait)) },
            )?;
            let status = status?;
            if !status.success() {
                return Err(exit_error(status, stderr?, &self.environment.env));
            }
            written?;
            stderr?;
            let value = serde_json::from_slice(&stdout)
                .map_err(|_| crate::tool_error("invalid_output", "process stdout is not JSON"))?;
            crate::output(&self.config.contract, value)
                .map(|value| TypedToolOutput::from_value(id, value))
        };
        let cancel = ctx
            .get::<nofy_tool_runtime::Cancellation>()
            .map(|cancel| cancel.0.clone())
            .unwrap_or_default();
        let result = tokio::select! {biased;
            _=cancel.cancelled()=>Err(crate::tool_error("cancelled","process tool cancelled")),
            result=tokio::time::timeout(Duration::from_millis(self.config.contract.timeout_ms),operation)=>result.unwrap_or_else(|_|Err(crate::tool_error("timeout","process tool timed out"))),
        };
        nofy_tool_runtime::terminal_only(result)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn read_diagnostic_stops_at_hard_drain_cap_on_unbounded_stream() {
        let mut reader = tokio::io::repeat(b'x');
        let (kept, truncated) =
            tokio::time::timeout(Duration::from_secs(2), read_diagnostic(&mut reader))
                .await
                .unwrap()
                .unwrap();
        assert_eq!(kept.len(), DIAGNOSTIC_KEEP_BYTES);
        assert!(truncated);
    }

    #[test]
    fn exit_error_redacts_all_sensitive_environment_keyword_classes() {
        let env = BTreeMap::from([
            ("MY_API_CRED".into(), "secret-api-1".into()),
            ("SERVICE_AUTH".into(), "secret-auth-2".into()),
            ("HTTP_BEARER".into(), "secret-bearer-3".into()),
            ("SESSION_COOKIE".into(), "secret-cookie-4".into()),
            ("SSH_PRIVATE_DATA".into(), "secret-private-5".into()),
            ("APP_SECRET".into(), "secret-sec-6".into()),
            ("ACCESS_TOKEN".into(), "secret-tok-7".into()),
            ("SIGNING_KEY".into(), "secret-key-8".into()),
            ("DB_PASSWORD".into(), "secret-pwd-9".into()),
            ("VISIBLE_NAME".into(), "keep-visible-0".into()),
        ]);
        let stderr = b"leak secret-api-1 secret-auth-2 secret-bearer-3 secret-cookie-4 \
            secret-private-5 secret-sec-6 secret-tok-7 secret-key-8 secret-pwd-9 keep-visible-0"
            .to_vec();
        #[cfg(unix)]
        let status = {
            use std::os::unix::process::ExitStatusExt;
            std::process::ExitStatus::from_raw(1 << 8)
        };
        #[cfg(not(unix))]
        let status = std::process::Command::new("cmd")
            .args(["/C", "exit 1"])
            .status()
            .unwrap();
        let error = exit_error(status, (stderr, false), &env);
        let text = error.details.unwrap()["stderr"]
            .as_str()
            .unwrap()
            .to_owned();
        for secret in [
            "secret-api-1",
            "secret-auth-2",
            "secret-bearer-3",
            "secret-cookie-4",
            "secret-private-5",
            "secret-sec-6",
            "secret-tok-7",
            "secret-key-8",
            "secret-pwd-9",
        ] {
            assert!(!text.contains(secret), "leaked {secret}: {text}");
        }
        assert!(text.contains("keep-visible-0"), "{text}");
        assert!(text.contains("[redacted]"), "{text}");
    }
}
