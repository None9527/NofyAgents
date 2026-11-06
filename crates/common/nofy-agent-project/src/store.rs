use crate::*;
mod cleanup;
use fs2::FileExt;
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use std::{
    io::Write,
    path::{Path, PathBuf},
    sync::Arc,
};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ProjectView {
    pub project_id: String,
    pub revision: String,
    pub source_digest: String,
    pub source: Source,
}
#[derive(Clone)]
pub struct ProjectStore {
    root: Arc<PathBuf>,
}
fn atomic(path: &Path, bytes: &[u8]) -> Result<()> {
    let parent = path
        .parent()
        .ok_or_else(|| Error::new("local_io", "store parent missing"))?;
    let mut temp = tempfile::NamedTempFile::new_in(parent)?;
    temp.write_all(bytes)?;
    temp.as_file().sync_all()?;
    temp.persist(path).map_err(|e| e.error)?;
    std::fs::File::open(parent)?.sync_all()?;
    Ok(())
}
fn plain(path: &Path) -> Result<()> {
    if let Ok(m) = path.symlink_metadata()
        && (!m.is_file() || m.file_type().is_symlink())
    {
        return Err(Error::new("local_io", "store path is not a regular file"));
    }
    Ok(())
}
impl ProjectStore {
    pub fn open(path: &Path) -> Result<Self> {
        if !path.is_absolute() {
            return Err(Error::new(
                "local_input",
                "project store path must be absolute",
            ));
        }
        std::fs::create_dir_all(path)?;
        if path.symlink_metadata()?.file_type().is_symlink() {
            return Err(Error::new("local_io", "project store is a symlink"));
        }
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            std::fs::set_permissions(path, std::fs::Permissions::from_mode(0o700))?;
        }
        std::fs::create_dir_all(path.join("archives"))?;
        Ok(Self {
            root: Arc::new(path.to_path_buf()),
        })
    }
    fn lock(&self, id: &str) -> Result<std::fs::File> {
        safe_id(id)?;
        let p = self.root.join(format!("{id}.lock"));
        plain(&p)?;
        let f = std::fs::OpenOptions::new()
            .read(true)
            .write(true)
            .create(true)
            .truncate(false)
            .open(p)?;
        f.lock_exclusive()?;
        Ok(f)
    }
    fn read(&self, id: &str) -> Result<Option<ProjectView>> {
        safe_id(id)?;
        let p = self.root.join(format!("{id}.json"));
        plain(&p)?;
        let bytes = match std::fs::read(p) {
            Ok(b) => b,
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => return Ok(None),
            Err(e) => return Err(e.into()),
        };
        let view: ProjectView = serde_json::from_slice(&bytes)?;
        if view.project_id != id
            || view.source.digest()? != view.source_digest
            || view.revision.parse::<u64>().is_err()
        {
            return Err(Error::new(
                "local_io",
                "project record failed integrity verification",
            ));
        }
        if self
            .deleted(id)?
            .is_some_and(|d| d.revision.parse::<u64>().ok() >= view.revision.parse::<u64>().ok())
        {
            return Ok(None);
        }
        Ok(Some(view))
    }
    pub fn get(&self, id: &str) -> Result<ProjectView> {
        let _lock = self.lock(id)?;
        self.read(id)?
            .ok_or_else(|| Error::new("not_found", "project not found"))
    }
    pub fn put(&self, id: &str, expected: Option<&str>, source: Source) -> Result<ProjectView> {
        self.update(id, expected, move |_| Ok(source))
    }
    pub fn update(
        &self,
        id: &str,
        expected: Option<&str>,
        change: impl FnOnce(Option<&Source>) -> Result<Source>,
    ) -> Result<ProjectView> {
        let _lock = self.lock(id)?;
        let before = self.read(id)?;
        if before.as_ref().map(|v| v.revision.as_str()) != expected {
            return Err(Error::new("conflict", "project revision changed"));
        }
        let source = change(before.as_ref().map(|v| &v.source))?;
        source.validate()?;
        complete(&source)?;
        if let Some(before) = &before
            && before.source.digest()? == source.digest()?
        {
            return Ok(before.clone());
        }
        let revision = match before {
            Some(v) => v
                .revision
                .parse::<u64>()
                .ok()
                .and_then(|v| v.checked_add(1))
                .ok_or_else(|| Error::new("conflict", "project revision exhausted"))?,
            None => match self.deleted(id)? {
                Some(view) => view
                    .revision
                    .parse::<u64>()
                    .ok()
                    .and_then(|r| r.checked_add(1))
                    .ok_or_else(|| Error::new("conflict", "project revision exhausted"))?,
                None => 0,
            },
        };
        let view = ProjectView {
            project_id: id.into(),
            revision: revision.to_string(),
            source_digest: source.digest()?,
            source,
        };
        atomic(
            &self.root.join(format!("{id}.json")),
            &serde_json::to_vec(&view)?,
        )?;
        Ok(view)
    }
    pub fn list(&self, after: &str, limit: usize) -> Result<Vec<ProjectView>> {
        if !(1..=256).contains(&limit) {
            return Err(Error::new(
                "local_input",
                "project page limit must be 1..256",
            ));
        }
        let mut ids = vec![];
        for entry in std::fs::read_dir(self.root.as_ref())? {
            let path = entry?.path();
            if path.extension().is_some_and(|e| e == "json")
                && let Some(id) = path.file_stem().and_then(|s| s.to_str())
            {
                safe_id(id)?;
                if id > after {
                    ids.push(id.to_owned());
                }
            }
        }
        ids.sort();
        let mut views = vec![];
        for id in ids {
            match self.get(&id) {
                Ok(view) => views.push(view),
                Err(e) if e.code == "not_found" => continue,
                Err(e) => return Err(e),
            }
            if views.len() == limit {
                break;
            }
        }
        Ok(views)
    }
    pub fn archive(&self, source: &Source) -> Result<Value> {
        let bytes = pack(source)?;
        let digest = digest(&bytes);
        let p = self.root.join("archives").join(format!("{digest}.tar.gz"));
        plain(&p)?;
        if p.exists() {
            if crate::digest(&std::fs::read(&p)?) != digest {
                return Err(Error::new(
                    "local_io",
                    "stored source archive digest mismatch",
                ));
            }
        } else {
            atomic(&p, &bytes)?;
        }
        let mut info = archive_info(source, &bytes)?;
        info["uri"] = json!(format!("nofy://source-archives/{digest}"));
        info["download_path"] = json!(format!("/api/v1/source-archives/{digest}"));
        Ok(info)
    }
    pub fn archive_path(&self, id: &str) -> Result<PathBuf> {
        if id.len() != 64
            || !id
                .bytes()
                .all(|b| b.is_ascii_digit() || (b'a'..=b'f').contains(&b))
        {
            return Err(Error::new("local_input", "invalid archive digest"));
        }
        let p = self.root.join("archives").join(format!("{id}.tar.gz"));
        plain(&p)?;
        if !p.exists() {
            return Err(Error::new("not_found", "source archive not found"));
        }
        Ok(p)
    }
}

#[derive(Clone)]
pub struct TemplateRegistry {
    root: Arc<PathBuf>,
}
impl TemplateRegistry {
    pub fn open(root: &Path) -> Result<Self> {
        if !root.is_absolute() {
            return Err(Error::new(
                "local_input",
                "template registry path must be absolute",
            ));
        }
        if !root.is_dir() {
            return Err(Error::new("not_found", "template directory not found"));
        }
        Ok(Self {
            root: Arc::new(root.to_path_buf()),
        })
    }
    pub fn list(&self) -> Result<Value> {
        let dir =
            cap_std::fs::Dir::open_ambient_dir(self.root.as_ref(), cap_std::ambient_authority())?;
        let mut text = String::new();
        use std::io::Read;
        dir.open("index.json")?.read_to_string(&mut text)?;
        let index: Value = serde_json::from_str(&text)?;
        if index["format"] != "nofy.preset-registry/v1" || !index["presets"].is_array() {
            return Err(Error::new("local_input", "invalid template registry"));
        }
        let mut seen = std::collections::BTreeSet::new();
        for p in index["presets"].as_array().into_iter().flatten() {
            safe_path(crate::text(p, "path")?)?;
            if !seen.insert((crate::text(p, "id")?, crate::text(p, "version")?)) {
                return Err(Error::new("local_input", "duplicate preset version"));
            }
        }
        Ok(index)
    }
    pub fn get(&self, id: &str, version: Option<&str>, agent: Option<&str>) -> Result<Source> {
        let index = self.list()?;
        let entries: Vec<_> = index["presets"]
            .as_array()
            .into_iter()
            .flatten()
            .filter(|p| p["id"] == id && version.is_none_or(|v| p["version"] == v))
            .collect();
        let p = match entries.as_slice() {
            [p] => *p,
            [] => return Err(Error::new("not_found", "preset version is not registered")),
            _ => {
                return Err(Error::new(
                    "conflict",
                    "preset has multiple versions; specify a version",
                ));
            }
        };
        let relative = crate::text(p, "path")?;
        let dir =
            cap_std::fs::Dir::open_ambient_dir(self.root.as_ref(), cap_std::ambient_authority())?;
        for component in Path::new(relative)
            .ancestors()
            .filter(|p| !p.as_os_str().is_empty())
        {
            if dir.symlink_metadata(component)?.file_type().is_symlink() {
                return Err(Error::new("local_input", "preset path crosses a symlink"));
            }
        }
        let mut source = load_directory(&self.root.join(relative))?;
        if let Some(agent) = agent {
            let mut doc = source.json(&source.declaration)?;
            let s = if doc.get("system").is_some() {
                &mut doc["system"]
            } else {
                &mut doc
            };
            let programs = s["programs"]
                .as_object_mut()
                .ok_or_else(|| Error::new("local_input", "template programs missing"))?;
            if programs.len() != 1 {
                return Err(Error::new(
                    "local_input",
                    "agent renaming requires a single-program template",
                ));
            }
            let key = programs
                .keys()
                .next()
                .cloned()
                .ok_or_else(|| Error::new("local_input", "template Agent missing"))?;
            let mut program = programs
                .remove(&key)
                .ok_or_else(|| Error::new("local_input", "template Agent missing"))?;
            program["definition"]["name"] = json!(agent);
            programs.insert(agent.into(), program);
            source.put_json(&source.declaration.clone(), &doc)?;
            source.refresh_manifest()?;
        }
        Ok(source)
    }
}
