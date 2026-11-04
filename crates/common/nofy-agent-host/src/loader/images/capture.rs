use super::*;
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CaptureTree {
    pub path: PathBuf,
    #[serde(default)]
    pub exclude: Vec<String>,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CaptureDefinition {
    pub id: String,
    pub executable: String,
    #[serde(default)]
    pub loader: Option<String>,
    #[serde(default)]
    pub library_dirs: Vec<String>,
    #[serde(default)]
    pub prefix_args: Vec<String>,
    #[serde(default)]
    pub env: BTreeMap<String, EnvironmentValue>,
    #[serde(default)]
    pub files: BTreeMap<String, PathBuf>,
    #[serde(default)]
    pub trees: BTreeMap<String, CaptureTree>,
    #[serde(default)]
    pub executable_files: BTreeSet<String>,
}
impl RuntimeImage {
    /// Local packaging only: never invoked by configuration validation or HTTP.
    pub fn capture(definition: CaptureDefinition) -> Result<Self> {
        if definition.files.len() > 4096
            || definition.trees.len() > 32
            || definition.executable_files.len() > 4096
        {
            return Err(invalid("capture definition exceeds limits"));
        }
        let mut sources = definition.files;
        for (destination, tree) in definition.trees {
            if tree.exclude.len() > 4096 {
                return Err(invalid("capture exclusion limit exceeded"));
            }
            relative(&destination, true)?;
            for path in &tree.exclude {
                relative(path, false)?;
            }
            if !tree.path.is_absolute() {
                return Err(invalid("capture tree path must be absolute"));
            }
            let root = std::fs::canonicalize(&tree.path).map_err(storage::unavailable)?;
            let mut pending = vec![(root.clone(), PathBuf::new())];
            let mut visited = 0;
            while let Some((dir, relative_dir)) = pending.pop() {
                for entry in std::fs::read_dir(dir).map_err(storage::unavailable)? {
                    let entry = entry.map_err(storage::unavailable)?;
                    let path = entry.path();
                    let suffix = relative_dir.join(entry.file_name());
                    if tree.exclude.iter().any(|p| suffix.starts_with(p)) {
                        continue;
                    }
                    visited += 1;
                    if visited > 12288 {
                        return Err(invalid("capture tree traversal limit"));
                    }
                    let meta = std::fs::symlink_metadata(&path).map_err(storage::unavailable)?;
                    if meta.is_dir() {
                        pending.push((path, suffix));
                        continue;
                    }
                    if !meta.is_file() {
                        return Err(invalid(format!(
                            "capture refuses links/special files: {}",
                            path.display()
                        )));
                    }
                    let name = if destination == "." {
                        suffix
                    } else {
                        Path::new(&destination).join(suffix)
                    };
                    let name = name
                        .to_str()
                        .ok_or_else(|| invalid("non-UTF8 capture path"))?
                        .to_owned();
                    if sources.insert(name, path).is_some() {
                        return Err(invalid("duplicate capture destination"));
                    }
                    if sources.len() > 4096 {
                        return Err(invalid("capture exceeds file limit"));
                    }
                }
            }
        }
        let mut files = BTreeMap::new();
        let mut blobs = BTreeMap::new();
        let mut total = 0u64;
        let mut encoded = 0usize;
        for (name, source) in sources {
            relative(&name, false)?;
            if !source.is_absolute() {
                return Err(invalid("capture source must be absolute"));
            }
            // Explicit file mappings may resolve a known symlink; trees never follow one.
            let source = std::fs::canonicalize(source).map_err(storage::unavailable)?;
            let bytes = storage::read(&source, 128 * 1024 * 1024)?;
            total = total.saturating_add(bytes.len() as u64);
            if total > 256 * 1024 * 1024 {
                return Err(invalid("capture exceeds decoded size limit"));
            }
            let digest = storage::hash(&bytes);
            if !blobs.contains_key(&digest) {
                let payload = encode(&bytes)?;
                encoded += payload.len();
                if encoded as u64 > MAX_WIRE {
                    return Err(invalid("captured runtime blobs exceed wire limit"));
                }
                blobs.insert(digest.clone(), payload);
            }
            let executable = name == definition.executable
                || definition.loader.as_ref() == Some(&name)
                || definition.executable_files.contains(&name);
            files.insert(
                name,
                ImageFile {
                    digest,
                    size: bytes.len() as u64,
                    executable,
                },
            );
        }
        let image = Self {
            manifest: ImageManifest {
                schema_version: 1,
                id: definition.id,
                platform: format!("linux-{}", std::env::consts::ARCH),
                executable: definition.executable,
                loader: definition.loader,
                library_dirs: definition.library_dirs,
                prefix_args: definition.prefix_args,
                env: definition.env,
                files,
            },
            blobs,
        };
        image.validate()?;
        Ok(image)
    }
}
