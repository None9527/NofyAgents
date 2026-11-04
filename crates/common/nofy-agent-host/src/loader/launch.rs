use super::*;
use nofy_agent_executors::resources::InstalledProgram;
use std::collections::BTreeMap;
#[derive(Clone)]
pub(super) enum RuntimeSource {
    Legacy(runtimes::InstalledRuntime),
    Locked(Arc<images::ImageManifest>),
    Local(Arc<local::Config>),
}
pub(super) struct Launch {
    pub program: InstalledProgram,
    pub args: Vec<String>,
    pub env: BTreeMap<String, String>,
    pub read_only: Vec<PathBuf>,
    pub local_paths: Vec<local::Mount>,
}
fn utf8(path: &Path) -> Result<String> {
    path.to_str()
        .map(str::to_owned)
        .ok_or_else(|| HostError::Invalid("runtime path must be UTF-8".into()))
}
impl RuntimeSource {
    pub fn prepare(&self, loader: &Loader) -> Result<Launch> {
        match self {
            Self::Legacy(runtime) => {
                let mut read_only = runtime.read_roots.clone();
                read_only.push(loader.runtimes.executable(runtime));
                Ok(Launch {
                    program: runtime.program.clone(),
                    args: runtime.manifest.prefix_args.clone(),
                    env: Default::default(),
                    read_only,
                    local_paths: vec![],
                })
            }
            Self::Locked(manifest) => {
                let root = loader.images.materialize(
                    manifest,
                    loader
                        .cache
                        .quarantined_bytes(lifecycle::CacheKind::Image)?,
                )?;
                let executable = root.join(&manifest.executable);
                let mut args = Vec::new();
                let program = if let Some(linker) = &manifest.loader {
                    let mut paths = Vec::new();
                    for directory in &manifest.library_dirs {
                        let path = utf8(&root.join(directory))?;
                        if path.contains(':') {
                            return Err(HostError::Invalid(
                                "glibc library paths cannot contain colon".into(),
                            ));
                        }
                        paths.push(path);
                    }
                    args.extend([
                        "--inhibit-cache".into(),
                        "--library-path".into(),
                        paths.join(":"),
                        utf8(&executable)?,
                    ]);
                    root.join(linker)
                } else {
                    executable
                };
                args.extend(manifest.prefix_args.clone());
                Ok(Launch {
                    program: InstalledProgram::load(&program, None)
                        .map_err(|e| HostError::Unavailable(e.to_string()))?,
                    args,
                    env: manifest.environment(&root)?,
                    read_only: vec![root],
                    local_paths: vec![],
                })
            }
            Self::Local(config) => {
                config.preflight(&loader.private_root)?;
                Ok(Launch {
                    program: InstalledProgram::load_preserving_path(&config.executable, None)
                        .map_err(|e| HostError::Unavailable(e.to_string()))?,
                    args: config.prefix_args.clone(),
                    env: config.env.clone(),
                    read_only: vec![],
                    local_paths: config.paths.clone(),
                })
            }
        }
    }
}
