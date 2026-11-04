use super::*;

pub(super) async fn evaluate(
    loader: &Loader,
    input: Input,
    cancel: CancellationToken,
) -> Result<Reply> {
    let job = super::super::evaluation::Job {
        mode: "--evaluate-scope",
        max_output: MAX_OUTPUT,
        started: loader.scope_started.clone(),
        unavailable: "isolated scope worker failed or exceeded its limits",
        cancelled: "scope evaluation cancelled or host is shutting down",
        cpu_seconds: 2,
        deadline: None,
    };
    let bytes = super::super::evaluation::run(loader, job, cancel, move || {
        input.validate()?;
        serde_json::to_vec(&input).map_err(|_| failed())
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
fn evaluate_input(input: Input) -> std::result::Result<Reply, Error> {
    input.validate()?;
    input.program.evaluate(
        &input.rules,
        input.operation,
        &RunContext::new("scope-worker", "scope-worker"),
    )
}
/// Entered only after applying the shared Linux confinement profile.
pub(in crate::loader) fn worker_evaluate() -> std::result::Result<(), Box<dyn std::error::Error>> {
    use std::io::Read;
    let mut bytes = Vec::new();
    std::io::stdin()
        .take(MAX_INPUT as u64 + 1)
        .read_to_end(&mut bytes)?;
    if bytes.len() > MAX_INPUT {
        return Err("scope worker input limit".into());
    }
    let input: Input = serde_json::from_slice(&bytes)?;
    let output = Output {
        protocol: PROTOCOL.into(),
        result: evaluate_input(input).map_err(|error| error.to_string()),
    };
    bounded(&output, MAX_OUTPUT)?;
    let mut stdout = std::io::stdout().lock();
    serde_json::to_writer(&mut stdout, &output)?;
    stdout.flush()?;
    Ok(())
}
