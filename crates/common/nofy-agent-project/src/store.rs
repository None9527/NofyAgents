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
    nofy_durable_fs::persist_file(temp, path)?;
    sync_directory(parent)?;
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
fn find_case_collision(dir: &Path, id: &str) -> Result<Option<String>> {
    let entries = match std::fs::read_dir(dir) {
        Ok(entries) => entries,
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => return Ok(None),
        Err(e) => return Err(e.into()),
    };
    for entry in entries {
        let path = entry?.path();
        if path.extension().is_some_and(|e| e == "json")
            && let Some(stem) = path.file_stem().and_then(|s| s.to_str())
            && stem != id
            && stem.eq_ignore_ascii_case(id)
        {
            return Ok(Some(stem.to_owned()));
        }
    }
    Ok(None)
}
fn has_exact_entry(dir: &Path, file_name: &str) -> Result<bool> {
    let entries = match std::fs::read_dir(dir) {
        Ok(entries) => entries,
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => return Ok(false),
        Err(e) => return Err(e.into()),
    };
    for entry in entries {
        if entry?.file_name() == std::ffi::OsStr::new(file_name) {
            return Ok(true);
        }
    }
    Ok(false)
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
        let p = self.root.join(format!("{}.lock", id.to_ascii_lowercase()));
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
    fn ensure_no_case_collision(&self, id: &str) -> Result<()> {
        if let Some(existing) = find_case_collision(self.root.as_ref(), id)? {
            return Err(Error::new(
                "conflict",
                format!("project ID `{id}` conflicts with existing project `{existing}`"),
            ));
        }
        if let Some(existing) = find_case_collision(&self.root.join("deleted"), id)? {
            return Err(Error::new(
                "conflict",
                format!("project ID `{id}` conflicts with deleted project `{existing}`"),
            ));
        }
        Ok(())
    }
    fn read(&self, id: &str) -> Result<Option<ProjectView>> {
        safe_id(id)?;
        let exact_file = format!("{id}.json");
        let p = self.root.join(&exact_file);
        plain(&p)?;
        let bytes = match std::fs::read(&p) {
            Ok(b) => b,
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => return Ok(None),
            Err(e) => return Err(e.into()),
        };
        let view: ProjectView = serde_json::from_slice(&bytes)?;
        if view.project_id != id {
            // On a case-insensitive volume, opening `{id}.json` can resolve to a
            // differently cased project file. Treat a missing exact directory entry
            // as absent rather than surfacing a 503 integrity failure.
            if view.project_id.eq_ignore_ascii_case(id)
                && !has_exact_entry(self.root.as_ref(), &exact_file)?
            {
                return Ok(None);
            }
            return Err(Error::new(
                "local_io",
                "project record failed integrity verification",
            ));
        }
        if view.source.digest()? != view.source_digest || view.revision.parse::<u64>().is_err() {
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
        self.ensure_no_case_collision(id)?;
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
        let mut folded = std::collections::BTreeMap::<String, String>::new();
        for entry in std::fs::read_dir(self.root.as_ref())? {
            let path = entry?.path();
            if path.extension().is_some_and(|e| e == "json")
                && let Some(id) = path.file_stem().and_then(|s| s.to_str())
            {
                safe_id(id)?;
                let key = id.to_ascii_lowercase();
                if let Some(existing) = folded.insert(key, id.to_owned()) {
                    return Err(Error::new(
                        "conflict",
                        format!("project ID `{id}` conflicts with existing project `{existing}`"),
                    ));
                }
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn store_rejects_ascii_case_colliding_project_ids_with_conflict_and_preserves_valid_projects() {
        let dir = tempfile::tempdir().unwrap();
        let store = ProjectStore::open(dir.path()).unwrap();
        let source = Source::empty("coder", "demo").unwrap();

        let created = store.put("demo", None, source.clone()).unwrap();
        assert_eq!(created.project_id, "demo");
        assert_eq!(created.revision, "0");

        // Creating a differently cased variant must return 409 conflict, never 503.
        let err = store.put("Demo", None, source.clone()).unwrap_err();
        assert_eq!(err.code, "conflict");
        let err = store.put("DEMO", None, source.clone()).unwrap_err();
        assert_eq!(err.code, "conflict");

        // Getting a differently cased variant returns not_found, not 503.
        assert_eq!(store.get("Demo").unwrap_err().code, "not_found");

        // Existing valid project remains readable, updatable, and listable.
        let mut updated = source.clone();
        updated
            .files
            .insert("note.txt".into(), File::text("updated"));
        updated.refresh_manifest().unwrap();
        let rev1 = store.put("demo", Some("0"), updated).unwrap();
        assert_eq!(rev1.revision, "1");

        // Mixed-case unique project IDs remain fully supported.
        let mixed = store
            .put("MyApp", None, Source::empty("coder", "MyApp").unwrap())
            .unwrap();
        assert_eq!(mixed.project_id, "MyApp");
        let listed: Vec<_> = store
            .list("", 10)
            .unwrap()
            .into_iter()
            .map(|v| v.project_id)
            .collect();
        assert_eq!(listed, vec!["MyApp".to_owned(), "demo".to_owned()]);

        // Deleting `demo` blocks `Demo` (tombstone collision) while allowing exact `demo` recreation.
        store.delete("demo", "1").unwrap();
        assert_eq!(
            store.put("Demo", None, source.clone()).unwrap_err().code,
            "conflict"
        );
        let recreated = store.put("demo", None, source).unwrap();
        assert_eq!(recreated.revision, "2");
    }

    #[test]
    fn store_serializes_concurrent_case_colliding_creates() {
        let dir = tempfile::tempdir().unwrap();
        let store = ProjectStore::open(dir.path()).unwrap();
        let left = store.clone();
        let right = store.clone();
        let src_a = Source::empty("coder", "demo").unwrap();
        let src_b = Source::empty("coder", "Demo").unwrap();
        let t1 = std::thread::spawn(move || left.put("demo", None, src_a));
        let t2 = std::thread::spawn(move || right.put("Demo", None, src_b));
        let results = [t1.join().unwrap(), t2.join().unwrap()];
        assert_eq!(results.iter().filter(|r| r.is_ok()).count(), 1);
        let err = results
            .iter()
            .find_map(|r| r.as_ref().err())
            .expect("second racing case-colliding create must fail");
        assert_eq!(err.code, "conflict");
    }

    #[test]
    fn store_list_detects_preexisting_case_colliding_files_and_read_keeps_corruption_check() {
        let dir = tempfile::tempdir().unwrap();
        let store = ProjectStore::open(dir.path()).unwrap();
        let src_lower = Source::empty("coder", "demo").unwrap();
        let src_upper = Source::empty("coder", "Demo").unwrap();

        let lower_view = ProjectView {
            project_id: "demo".into(),
            revision: "0".into(),
            source_digest: src_lower.digest().unwrap(),
            source: src_lower.clone(),
        };
        let upper_view = ProjectView {
            project_id: "Demo".into(),
            revision: "0".into(),
            source_digest: src_upper.digest().unwrap(),
            source: src_upper,
        };
        std::fs::write(
            dir.path().join("demo.json"),
            serde_json::to_vec(&lower_view).unwrap(),
        )
        .unwrap();
        std::fs::write(
            dir.path().join("Demo.json"),
            serde_json::to_vec(&upper_view).unwrap(),
        )
        .unwrap();

        let case_sensitive = has_exact_entry(dir.path(), "demo.json").unwrap()
            && has_exact_entry(dir.path(), "Demo.json").unwrap();
        if case_sensitive {
            // Both list("", ..) and paginated list("z", ..) surface conflict for colliding entries.
            assert_eq!(store.list("", 10).unwrap_err().code, "conflict");
            assert_eq!(store.list("z", 10).unwrap_err().code, "conflict");
        }

        // Exact-entry tampering (Demo.json storing project_id="demo") still triggers integrity check.
        for name in ["demo.json", "Demo.json"] {
            if let Err(err) = std::fs::remove_file(dir.path().join(name)) {
                assert_eq!(err.kind(), std::io::ErrorKind::NotFound, "{err}");
            }
        }
        let tampered = ProjectView {
            project_id: "demo".into(),
            revision: "0".into(),
            source_digest: src_lower.digest().unwrap(),
            source: src_lower,
        };
        std::fs::write(
            dir.path().join("Demo.json"),
            serde_json::to_vec(&tampered).unwrap(),
        )
        .unwrap();
        assert_eq!(store.get("Demo").unwrap_err().code, "local_io");
        assert!(has_exact_entry(dir.path(), "Demo.json").unwrap());
        assert!(!has_exact_entry(dir.path(), "demo.json").unwrap());
    }
}
