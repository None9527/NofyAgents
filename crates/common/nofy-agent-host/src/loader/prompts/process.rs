use super::*;

#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Input {
    protocol: String,
    request: PromptRequest,
}
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Output {
    protocol: String,
    result: std::result::Result<PromptPreview, String>,
}
fn failed() -> HostError {
    HostError::Unavailable("isolated prompt worker failed or exceeded its limits".into())
}
pub(super) async fn render(
    loader: &Loader,
    request: PromptRequest,
    cancel: CancellationToken,
) -> Result<PromptPreview> {
    let job = super::super::evaluation::Job {
        mode: "--render-prompt",
        max_output: MAX_OUTPUT,
        started: loader.prompt_started.clone(),
        unavailable: "isolated prompt worker failed or exceeded its limits",
        cancelled: "prompt rendering cancelled or host is shutting down",
        cpu_seconds: 2,
        deadline: None,
    };
    let bytes = super::super::evaluation::run(loader, job, cancel, move || {
        request.validate()?;
        let bytes = serde_json::to_vec(&Input {
            protocol: PROTOCOL.into(),
            request,
        })
        .map_err(|_| failed())?;
        if bytes.len() > MAX_INPUT {
            return Err(HostError::Invalid("prompt request exceeds 4 MiB".into()));
        }
        Ok(bytes)
    })
    .await?;
    let output: Output = serde_json::from_slice(&bytes).map_err(|_| failed())?;
    if output.protocol != PROTOCOL {
        return Err(failed());
    }
    output
        .result
        .map_err(|message| HostError::Runtime(Error::Composition(message)))
}
/// Called only after the existing single-thread helper applied confinement.
pub(in crate::loader) fn worker_render() -> std::result::Result<(), Box<dyn std::error::Error>> {
    use std::io::Read;
    let mut bytes = Vec::new();
    std::io::stdin()
        .take(MAX_INPUT as u64 + 1)
        .read_to_end(&mut bytes)?;
    if bytes.len() > MAX_INPUT {
        return Err("prompt worker input limit".into());
    }
    let input: Input = serde_json::from_slice(&bytes)?;
    if input.protocol != PROTOCOL {
        return Err("unsupported prompt worker protocol".into());
    }
    let result = (|| -> std::result::Result<_, Error> {
        input.request.validate()?;
        DocumentPrompt::new(input.request.document)?.preview(
            &PromptVariables(input.request.variables),
            &input.request.tools,
        )
    })()
    .map_err(|error| error.to_string());
    let output = Output {
        protocol: PROTOCOL.into(),
        result,
    };
    bounded(&output, MAX_OUTPUT)?;
    let mut stdout = std::io::stdout().lock();
    serde_json::to_writer(&mut stdout, &output)?;
    stdout.flush()?;
    Ok(())
}
