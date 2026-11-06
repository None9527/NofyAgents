use clap::Parser;
use nofy_agent_host::loader::images::{CaptureDefinition, RuntimeImage};
use std::{
    io::{Read, Write},
    path::PathBuf,
};
#[derive(Parser)]
#[command(about = "Capture an explicit local runtime dependency closure without executing it")]
struct Args {
    #[arg(long)]
    definition: PathBuf,
    /// Output must not already exist. No source paths are written into it.
    #[arg(long)]
    output: PathBuf,
}
fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args = Args::parse();
    let output = std::path::absolute(args.output)?;
    if output.try_exists()? {
        return Err("output already exists".into());
    }
    let metadata = std::fs::metadata(&args.definition)?;
    if !metadata.is_file() || metadata.len() > 2 * 1024 * 1024 {
        return Err("invalid capture definition".into());
    }
    let mut bytes = Vec::new();
    std::fs::File::open(args.definition)?
        .take(2 * 1024 * 1024 + 1)
        .read_to_end(&mut bytes)?;
    if bytes.len() > 2 * 1024 * 1024 {
        return Err("capture definition exceeds 2 MiB".into());
    }
    let definition: CaptureDefinition = serde_json::from_slice(&bytes)?;
    let image = RuntimeImage::capture(definition)?;
    let parent = output.parent().ok_or("missing output parent")?;
    let mut temporary = tempfile::NamedTempFile::new_in(parent)?;
    serde_json::to_writer(temporary.as_file_mut(), &image)?;
    temporary.flush()?;
    temporary.as_file().sync_all()?;
    temporary.persist_noclobber(&output)?;
    nofy_agent_runtime::sync_directory(parent)?;
    println!("{}", image.manifest.digest()?);
    Ok(())
}
