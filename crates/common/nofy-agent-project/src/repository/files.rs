use crate::*;
use cap_std::{ambient_authority, fs::Dir};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::{
    collections::{BTreeMap, BTreeSet},
    path::Path,
};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RepositoryIndex {
    pub format: String,
    pub packages: Vec<String>,
}
impl RepositoryIndex {
    pub fn parse(bytes: &[u8]) -> Result<Self> {
        let index: Self = serde_json::from_slice(bytes)?;
        if index.format != "nofy.module-repository/v1" {
            return Err(Error::new(
                "local_input",
                "unsupported module repository index",
            ));
        }
        let mut unique = BTreeSet::new();
        for path in &index.packages {
            if !path.is_empty() {
                safe_path(path)?;
            }
            if !unique.insert(path) {
                return Err(Error::new(
                    "local_input",
                    "duplicate repository package path",
                ));
            }
        }
        Ok(index)
    }
}
pub fn package_from_reader(mut read: impl FnMut(&str) -> Result<File>) -> Result<Source> {
    let (manifest_path, manifest) = match read("module-files.json") {
        Ok(f) => ("module-files.json", f),
        Err(e) if e.code == "not_found" => (
            "source-files.json",
            read("source-files.json").map_err(|e| {
                if e.code == "not_found" {
                    Error::new(
                        "not_found",
                        "a module package lists the files to publish in source-files.json (or module-files.json) and found neither; `module.template` (`nofy module init`) writes a package with one",
                    )
                } else {
                    e
                }
            })?,
        ),
        Err(e) => return Err(e),
    };
    let names: Vec<String> = serde_json::from_str(&manifest.utf8()?)?;
    let mut files = BTreeMap::new();
    for path in names {
        safe_path(&path)?;
        if files.contains_key(&path) {
            return Err(Error::new(
                "local_input",
                "duplicate module source manifest entry",
            ));
        }
        files.insert(
            path.clone(),
            if path == manifest_path {
                manifest.clone()
            } else {
                read(&path)?
            },
        );
    }
    if !files.contains_key(manifest_path) {
        return Err(Error::new(
            "local_input",
            "module source manifest must include itself",
        ));
    }
    let after = read(manifest_path)?;
    if after.decode()? != manifest.decode()? || after.executable != manifest.executable {
        return Err(Error::new(
            "conflict",
            "module source manifest changed while reading",
        ));
    }
    // A declared source is decided by its declaration alone; whatever the reader
    // reported for the files (host modes, Git modes) is replaced.
    crate::executables::apply_declaration(&mut files)?;
    let mut source = Source {
        files,
        declaration: "module.json".into(),
        settings_json: None,
    };
    source.validate()?;
    source.refresh_manifest()?;
    if manifest_path == "module-files.json" {
        let names: Vec<_> = source.files.keys().cloned().collect();
        source.put_json("module-files.json", &json!(names))?;
    }
    complete(&source)?;
    Ok(source)
}
fn read(dir: &Dir, path: &str) -> Result<File> {
    safe_path(path)?;
    if !dir.try_exists(path)? {
        return Err(Error::new(
            "not_found",
            format!("module source file missing: {path}"),
        ));
    }
    crate::files::read_file(dir, path)
}
fn load_package(dir: &Dir) -> Result<Source> {
    if dir.try_exists(".nofy-source-transaction")? {
        return Err(Error::new(
            "conflict",
            "finish the source edit transaction before publishing a package",
        ));
    }
    let guard = if dir.try_exists(".nofy-source.lock")? {
        let metadata = dir.symlink_metadata(".nofy-source.lock")?;
        if !metadata.is_file() || metadata.file_type().is_symlink() {
            return Err(Error::new(
                "local_input",
                "source lock is not a regular file",
            ));
        }
        let file = dir.open(".nofy-source.lock")?.into_std();
        file.try_lock_shared()
            .map_err(|_| Error::new("conflict", "source is being edited"))?;
        Some(file)
    } else {
        None
    };
    let source = package_from_reader(|path| read(dir, path))?;
    if !source.files.contains_key(EXECUTABLE_DECLARATION) {
        crate::executables::reject_unlisted_declaration(dir)?;
    }
    let after = package_from_reader(|path| read(dir, path))?;
    if source.digest()? != after.digest()?
        || (guard.is_none() && dir.try_exists(".nofy-source.lock")?)
    {
        return Err(Error::new(
            "conflict",
            "module source changed while being collected",
        ));
    }
    Ok(source)
}
pub fn load_package_directory(path: &Path) -> Result<Source> {
    let dir = Dir::open_ambient_dir(path, ambient_authority())?;
    load_package(&dir)
}
pub fn load_repository_directory(path: &Path) -> Result<(Vec<Source>, String)> {
    let dir = Dir::open_ambient_dir(path, ambient_authority())?;
    let index_bytes = read(&dir, "module-repository.json")?.decode()?;
    let index = RepositoryIndex::parse(&index_bytes)?;
    let mut packages = Vec::new();
    for relative in index.packages {
        let package = if relative.is_empty() {
            dir.try_clone()?
        } else {
            // cap-std retains the repository capability across directory races.
            let mut prefix = std::path::PathBuf::new();
            for component in relative.split('/') {
                prefix.push(component);
                if dir.symlink_metadata(&prefix)?.file_type().is_symlink() {
                    return Err(Error::new("local_input", "package path crosses a symlink"));
                }
            }
            dir.open_dir(relative)?
        };
        packages.push(load_package(&package)?);
    }
    if read(&dir, "module-repository.json")?.decode()? != index_bytes {
        return Err(Error::new(
            "conflict",
            "module repository index changed while synchronizing",
        ));
    }
    let mut identity = vec![digest(&index_bytes)];
    identity.extend(
        packages
            .iter()
            .map(Source::digest)
            .collect::<Result<Vec<_>>>()?,
    );
    Ok((packages, json_digest(&identity)?))
}
