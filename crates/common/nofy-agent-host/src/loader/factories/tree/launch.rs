//! Pure guest command construction and a complete bootstrap size bound.
use super::*;
use crate::loader::{
    directories::{Directory, ENV_PREFIX},
    images::ImageManifest,
    process_tree::sandbox::{Runtime as GuestRuntime, image_layout},
};

const SCRATCH_PREFIX: &str = ".tree-";
const SCRATCH_RANDOM: usize = 16;

#[derive(Clone)]
pub(in crate::loader) struct GuestLaunch {
    pub program: PathBuf,
    pub arguments: Vec<String>,
    pub environment: BTreeMap<String, String>,
}
impl GuestLaunch {
    pub(in crate::loader::factories) fn from_runtime(
        runtime: &RuntimeSource,
        config: &ToolConfig,
    ) -> Result<Self> {
        Self::from_entry(
            runtime,
            &config.entrypoint,
            &config.args,
            &config.directories,
        )
    }
    pub(in crate::loader) fn from_entry(
        runtime: &RuntimeSource,
        entrypoint: &str,
        args: &[String],
        directories: &BTreeMap<String, String>,
    ) -> Result<Self> {
        match runtime {
            RuntimeSource::Locked(manifest) => {
                Self::build_entry(manifest, entrypoint, args, directories)
            }
            RuntimeSource::Local(local) => {
                let mut environment = local.env.clone();
                for alias in directories.keys() {
                    environment.insert(
                        format!("{ENV_PREFIX}{alias}"),
                        format!("/nofy/directories/{alias}"),
                    );
                }
                let mut arguments = local.prefix_args.clone();
                arguments.push(format!("/nofy/artifact/{entrypoint}"));
                arguments.extend_from_slice(args);
                Ok(Self {
                    program: local.executable.clone(),
                    arguments,
                    environment,
                })
            }
            RuntimeSource::Legacy(_) => Err(HostError::Invalid(
                "tree execution requires an image or explicit local environment".into(),
            )),
        }
    }
    #[cfg(test)]
    pub(in crate::loader::factories) fn build(
        manifest: &ImageManifest,
        config: &ToolConfig,
    ) -> Result<Self> {
        Self::build_entry(
            manifest,
            &config.entrypoint,
            &config.args,
            &config.directories,
        )
    }
    fn build_entry(
        manifest: &ImageManifest,
        entrypoint: &str,
        args: &[String],
        directories: &BTreeMap<String, String>,
    ) -> Result<Self> {
        image_layout(manifest)?;
        if manifest.env.keys().any(|k| k.starts_with(ENV_PREFIX)) {
            return Err(HostError::Invalid(
                "reserved directory environment prefix".into(),
            ));
        }
        let mut environment = manifest.environment(Path::new("/"))?;
        for alias in directories.keys() {
            environment.insert(
                format!("{ENV_PREFIX}{alias}"),
                format!("/nofy/directories/{alias}"),
            );
        }
        let guest = |path: &str| format!("/{path}");
        let mut arguments = Vec::new();
        let program = if let Some(linker) = &manifest.loader {
            arguments.extend([
                "--inhibit-cache".into(),
                "--library-path".into(),
                manifest
                    .library_dirs
                    .iter()
                    .map(|p| guest(p))
                    .collect::<Vec<_>>()
                    .join(":"),
                guest(&manifest.executable),
            ]);
            PathBuf::from(guest(linker))
        } else {
            PathBuf::from(guest(&manifest.executable))
        };
        arguments.extend(manifest.prefix_args.clone());
        arguments.push(format!("/nofy/artifact/{entrypoint}"));
        arguments.extend_from_slice(args);
        Ok(Self {
            program,
            arguments,
            environment,
        })
    }
    pub fn preflight(
        &self,
        private_root: &Path,
        runtime: &RuntimeSource,
        artifact: &ArtifactBundle,
        directories: &BTreeMap<String, Arc<Directory>>,
    ) -> Result<Sandbox> {
        // This is a representation-size bound, not a fictitious process or
        // directory to execute. Only PID digits and the ASCII random basename
        // vary at invocation; actual preparation enforces this exact shape.
        let root = private_root
            .join("loader/scratch")
            .join(format!("{SCRATCH_PREFIX}{}", "0".repeat(SCRATCH_RANDOM)))
            .join("root");
        let sandbox = Sandbox {
            root,
            runtime: match runtime {
                RuntimeSource::Locked(manifest) => GuestRuntime::Image {
                    path: private_root
                        .join("loader/images/trees")
                        .join(manifest.digest()?),
                    executable_files: manifest
                        .files
                        .iter()
                        .filter(|(_, f)| f.executable)
                        .map(|(p, _)| p.clone())
                        .collect(),
                },
                RuntimeSource::Local(local) => GuestRuntime::Local {
                    paths: local.paths.clone(),
                },
                RuntimeSource::Legacy(_) => {
                    return Err(HostError::Invalid(
                        "local or image environment required".into(),
                    ));
                }
            },
            artifact: private_root
                .join("loader/artifacts/trees")
                .join(artifact.digest()?),
            private_root: private_root.into(),
            directories: directories
                .iter()
                .map(|(alias, directory)| (alias.clone(), directory.declaration().clone()))
                .collect(),
        };
        process_tree::Bootstrap {
            parent_pid: u32::MAX,
            program: self.program.clone(),
            arguments: self.arguments.clone(),
            environment: self.environment.clone(),
            cwd: "/nofy/scratch".into(),
            sandbox: Some(sandbox.clone()),
            session: None,
        }
        .encode()?;
        Ok(sandbox)
    }
}
pub(in crate::loader) fn scratch(parent: &Path) -> Result<tempfile::TempDir> {
    let directory = tempfile::Builder::new()
        .prefix(SCRATCH_PREFIX)
        .rand_bytes(SCRATCH_RANDOM)
        .tempdir_in(parent)
        .map_err(storage::unavailable)?;
    let valid = directory
        .path()
        .file_name()
        .and_then(|n| n.to_str())
        .and_then(|n| n.strip_prefix(SCRATCH_PREFIX))
        .is_some_and(|n| n.len() == SCRATCH_RANDOM && n.bytes().all(|b| b.is_ascii_alphanumeric()));
    if !valid {
        return Err(HostError::Invalid(
            "tree scratch naming contract changed".into(),
        ));
    }
    Ok(directory)
}
