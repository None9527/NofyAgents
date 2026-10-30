use clap::Parser;
use nofy_agent_host::{
    KernelHost,
    auth::{AccessKeyReference, Authorizer},
    credentials::FileCredentials,
    native,
};
use nofy_agent_runtime::{control::ApplyCommand, system::SystemFile};
use nofy_sampler::agent_model::declarative::EnvironmentCredentials;
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
}
#[tokio::main]
async fn main() -> std::result::Result<(), Box<dyn std::error::Error>> {
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
        .with_credentials(credentials);
    if let Some(path) = args.system_file {
        let file = SystemFile::from_json(&tokio::fs::read(path).await?)?;
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
