use clap::Parser;
use nofy_agent_host::loader::deployment::DeploymentFile;
use nofy_agent_host::{
    KernelHost,
    auth::{AccessKeyReference, Authorizer},
    credentials::FileCredentials,
    native,
};
use nofy_agent_runtime::control::ApplyCommand;
use nofy_agent_runtime::credentials::EnvironmentCredentials;
use std::{net::SocketAddr, path::PathBuf, sync::Arc};
use tokio_util::sync::CancellationToken;

#[derive(Parser)]
#[command(about = "Resident declarative Nofy kernel management host")]
struct Args {
    #[arg(long)]
    state_dir: PathBuf,
    /// JSON array of {token_env,scopes}; token values never belong in this file.
    #[arg(long)]
    access_file: PathBuf,
    #[arg(long, default_value = "127.0.0.1:7331")]
    listen: SocketAddr,
    #[arg(long, default_value = "local")]
    credential_authority: String,
    #[arg(long, default_value = "NOFY_SECRET_")]
    credential_prefix: String,
    #[arg(long, default_value_t = 8)]
    concurrency: usize,
    /// Import/apply a source or locked system before listening.
    #[arg(long)]
    system_file: Option<PathBuf>,
    /// Independent trusted source grants; never obtained from a deployment.
    #[arg(long)]
    source_policy_file: Option<PathBuf>,
    /// External versioned source-template registry, containing index.json.
    #[arg(long)]
    preset_dir: Option<PathBuf>,
}
fn main() -> std::result::Result<(), Box<dyn std::error::Error>> {
    #[cfg(target_os = "linux")]
    if let Some(code) = nofy_agent_host::loader::process_tree::worker_entry() {
        std::process::exit(code);
    }
    if let Some(code) = nofy_agent_host::loader::isolation::worker_entry() {
        std::process::exit(code);
    }
    tokio::runtime::Builder::new_multi_thread()
        .thread_stack_size(nofy_agent_host::WORKER_STACK_BYTES)
        .enable_all()
        .build()?
        .block_on(run())
}
async fn run() -> std::result::Result<(), Box<dyn std::error::Error>> {
    let args = Args::parse();
    let access: Vec<AccessKeyReference> =
        serde_json::from_slice(&tokio::fs::read(args.access_file).await?)?;
    let auth = Authorizer::from_environment(access)?;
    let initial = Arc::new(EnvironmentCredentials::new(
        &args.credential_authority,
        &args.credential_prefix,
    )?);
    let credentials = Arc::new(FileCredentials::open(
        args.state_dir.join("credentials.json"),
        &args.credential_authority,
        Some(initial),
    )?);
    let registry = native::registry(credentials.clone())?;
    let host = KernelHost::open(&args.state_dir, registry, auth)
        .await?
        .with_credentials(credentials)
        .with_loader_helper(&std::env::current_exe()?)?;
    let host = match args.preset_dir {
        Some(directory) => host.with_templates(&directory)?,
        None => host,
    };
    if let Some(path) = args.source_policy_file {
        let sources = host.loader().sources.clone();
        tokio::task::spawn_blocking(move || sources.bootstrap_file(&path)).await??;
    }
    if let Some(path) = args.system_file {
        let deployment = tokio::task::spawn_blocking(move || DeploymentFile::read(&path)).await??;
        let file = host.loader().prepare_deployment(deployment, true).await?;
        let publication = host.control().install_file(file).await?;
        let bundle = publication.bundle;
        let current = host
            .control()
            .inspect()
            .await?
            .and_then(|v| v.data.active.get(&bundle.document.name).cloned());
        if current.as_ref().is_none_or(|v| v.release != bundle.digest) {
            let generation = current.as_ref().map(|v| v.generation);
            host.control()
                .apply(ApplyCommand {
                    command_id: format!("bootstrap-{}-{}", generation.unwrap_or(0), bundle.digest),
                    system: bundle.document.name,
                    release: bundle.digest,
                    expected_generation: generation,
                })
                .await?;
        }
    }
    let listener = tokio::net::TcpListener::bind(args.listen).await?;
    eprintln!("Nofy kernel listening on http://{}", listener.local_addr()?);
    let shutdown = CancellationToken::new();
    let server_stop = shutdown.clone();
    let server = axum::serve(listener, host.router())
        .with_graceful_shutdown(async move { server_stop.cancelled().await });
    let worker = host.run_worker(shutdown.clone(), args.concurrency);
    tokio::pin!(worker);
    let server = std::future::IntoFuture::into_future(server);
    tokio::pin!(server);
    tokio::select! {
        result=&mut server=>{host.shutdown();shutdown.cancel();result?;worker.await?;}
        result=&mut worker=>{host.shutdown();shutdown.cancel();result?;server.await?;}
        result=tokio::signal::ctrl_c()=>{result?;host.shutdown();shutdown.cancel();let (s,w)=tokio::join!(server,worker);s?;w?;}
    }
    Ok(())
}
