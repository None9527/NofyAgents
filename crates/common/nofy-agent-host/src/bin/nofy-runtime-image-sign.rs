use base64::Engine;
use clap::Parser;
use nofy_agent_host::loader::sources::ImageAttestation;
use std::{
    io::{Read, Write},
    path::{Path, PathBuf},
};
use zeroize::Zeroizing;
#[derive(Parser)]
#[command(about = "Sign exact runtime image transport bytes with a local protected Ed25519 seed")]
struct Args {
    #[arg(long)]
    image: PathBuf,
    /// Base64-encoded 32-byte seed in a private Unix file, never an argv value.
    #[arg(long)]
    key_file: PathBuf,
    #[arg(long)]
    key_id: String,
    #[arg(long)]
    output: PathBuf,
}
fn read(path: &Path, max: u64) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
    let meta = std::fs::metadata(path)?;
    if !meta.is_file() || meta.len() > max {
        return Err("invalid signing input file type/size".into());
    }
    let mut bytes = Vec::new();
    std::fs::File::open(path)?
        .take(max + 1)
        .read_to_end(&mut bytes)?;
    if bytes.len() as u64 > max {
        return Err("signing input grew beyond limit".into());
    }
    Ok(bytes)
}
fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args = Args::parse();
    let output = std::path::absolute(args.output)?;
    if output.try_exists()? {
        return Err("signature output already exists".into());
    }
    let key_file = std::fs::File::open(&args.key_file)?;
    let metadata = key_file.metadata()?;
    if !metadata.is_file() || metadata.len() > 1024 {
        return Err("invalid signing seed file".into());
    }
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        if metadata.permissions().mode() & 0o077 != 0 {
            return Err("signing seed file permissions must exclude group/other".into());
        }
    }
    #[cfg(not(unix))]
    return Err("protected Unix seed file required".into());
    let mut seed_wire = Zeroizing::new(Vec::new());
    key_file.take(1025).read_to_end(&mut seed_wire)?;
    if seed_wire.len() > 1024 {
        return Err("signing seed grew beyond limit".into());
    }
    let text = std::str::from_utf8(&seed_wire)
        .map_err(|_| "invalid signing seed encoding")?
        .trim();
    let decoded = Zeroizing::new(
        base64::engine::general_purpose::STANDARD
            .decode(text)
            .map_err(|_| "invalid signing seed encoding")?,
    );
    let canonical = Zeroizing::new(base64::engine::general_purpose::STANDARD.encode(&*decoded));
    if decoded.len() != 32 || canonical.as_str() != text {
        return Err("invalid signing seed length/encoding".into());
    }
    let mut seed = Zeroizing::new([0u8; 32]);
    seed.copy_from_slice(&decoded);
    let bytes = read(&args.image, 24 * 1024 * 1024)?;
    let (attestation, public_key) = ImageAttestation::sign(&bytes, args.key_id.clone(), &seed)?;
    let parent = output.parent().ok_or("missing output parent")?;
    let mut temp = tempfile::NamedTempFile::new_in(parent)?;
    serde_json::to_writer(temp.as_file_mut(), &attestation)?;
    temp.flush()?;
    temp.as_file().sync_all()?;
    temp.persist_noclobber(&output)?;
    nofy_agent_runtime::sync_directory(parent)?;
    println!(
        "{}",
        serde_json::json!({"key_id":args.key_id,"public_key":public_key})
    );
    Ok(())
}
