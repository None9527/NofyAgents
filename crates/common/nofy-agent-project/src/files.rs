use crate::*;
use cap_std::{ambient_authority, fs::Dir};
use flate2::{Compression, GzBuilder};
use fs2::FileExt;
use serde_json::{Value, json};
use std::{
    collections::BTreeSet,
    io::{Read, Write},
    path::{Path, PathBuf},
};

fn check_components(dir: &Dir, path: &str) -> Result<()> {
    safe_path(path)?;
    let mut prefix = PathBuf::new();
    for part in path.split('/') {
        prefix.push(part);
        let m = dir.symlink_metadata(&prefix)?;
        if m.file_type().is_symlink() {
            return Err(Error::new(
                "local_input",
                format!("source symlink is not supported: {path}"),
            ));
        }
    }
    Ok(())
}
pub(crate) fn read_file(dir: &Dir, path: &str) -> Result<File> {
    check_components(dir, path)?;
    let file = dir.open(path)?.into_std();
    let metadata = file.metadata()?;
    if !metadata.is_file() {
        return Err(Error::new(
            "local_input",
            format!("source is not a regular file: {path}"),
        ));
    }
    let mut bytes = vec![];
    let mut file = file;
    file.read_to_end(&mut bytes)?;
    let after = file.metadata()?;
    check_components(dir, path)?;
    if metadata.len() != after.len()
        || metadata.modified().ok() != after.modified().ok()
        || bytes.len() as u64 != after.len()
    {
        return Err(Error::new(
            "conflict",
            format!("source changed while reading: {path}"),
        ));
    }
    #[cfg(unix)]
    let executable = {
        use std::os::unix::fs::PermissionsExt;
        metadata.permissions().mode() & 0o111 != 0
    };
    #[cfg(not(unix))]
    let executable = false;
    Ok(File::bytes(&bytes, executable))
}
fn load_unlocked(path: &Path) -> Result<Source> {
    let dir = Dir::open_ambient_dir(path, ambient_authority())?;
    let manifest = read_file(&dir, "source-files.json")?;
    let names: Vec<String> = serde_json::from_str(&manifest.utf8()?)?;
    let mut unique = BTreeSet::new();
    let mut files = std::collections::BTreeMap::new();
    for name in names {
        safe_path(&name)?;
        if !unique.insert(name.clone()) {
            return Err(Error::new("local_input", "duplicate source manifest entry"));
        }
        files.insert(name.clone(), read_file(&dir, &name)?);
    }
    if !files.contains_key("source-files.json") {
        return Err(Error::new(
            "local_input",
            "source manifest must include itself",
        ));
    }
    let declaration = if let Some(project) = files.get("project.json") {
        let project: Value = serde_json::from_str(&project.utf8()?)?;
        if project["format"] != "nofy.project/v1" {
            return Err(Error::new(
                "local_input",
                "unsupported source project format",
            ));
        }
        text(&project, "declaration")?.to_owned()
    } else {
        "preset.json".into()
    };
    let source = Source {
        files,
        declaration,
        settings_json: None,
    };
    source.validate()?;
    complete(&source)?;
    Ok(source)
}
fn lock(path: &Path) -> Result<std::fs::File> {
    let p = path.join(".nofy-source.lock");
    let mut options = std::fs::OpenOptions::new();
    options.read(true).write(true).create(true).truncate(false);
    #[cfg(unix)]
    {
        use std::os::unix::fs::OpenOptionsExt;
        options.mode(0o600).custom_flags(libc::O_NOFOLLOW);
    }
    let file = options.open(p)?;
    file.lock_exclusive()?;
    Ok(file)
}
fn private_write(path: &Path, bytes: &[u8], executable: bool) -> Result<()> {
    let parent = path
        .parent()
        .ok_or_else(|| Error::new("local_io", "file parent missing"))?;
    std::fs::create_dir_all(parent)?;
    let mut file = tempfile::NamedTempFile::new_in(parent)?;
    file.write_all(bytes)?;
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        file.as_file()
            .set_permissions(std::fs::Permissions::from_mode(if executable {
                0o755
            } else {
                0o644
            }))?;
    }
    file.as_file().sync_all()?;
    file.persist(path).map_err(|e| e.error)?;
    Ok(())
}
fn reject_symlink_ancestors(root: &Path, relative: &str) -> Result<()> {
    safe_path(relative)?;
    let mut p = root.to_path_buf();
    for part in relative.split('/') {
        p.push(part);
        match p.symlink_metadata() {
            Ok(m) if m.file_type().is_symlink() => {
                return Err(Error::new("local_input", "source output crosses a symlink"));
            }
            Ok(_) => {}
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => {}
            Err(e) => return Err(e.into()),
        }
    }
    Ok(())
}
fn install(root: &Path, source: &Source) -> Result<()> {
    for (path, file) in &source.files {
        reject_symlink_ancestors(root, path)?;
        private_write(&root.join(path), &file.decode()?, file.executable)?;
    }
    Ok(())
}
fn recover(root: &Path) -> Result<()> {
    let journal = root.join(".nofy-source-transaction");
    if !journal.exists() {
        return Ok(());
    }
    if journal.symlink_metadata()?.file_type().is_symlink() {
        return Err(Error::new("local_input", "source journal is a symlink"));
    }
    if !journal.join("after.json").try_exists()? {
        // Installation starts only after both snapshots are durable. A crash
        // while preparing the journal has not changed any source file.
        std::fs::remove_dir_all(journal)?;
        return Ok(());
    }
    let before: Source = serde_json::from_slice(&std::fs::read(journal.join("before.json"))?)?;
    let after: Source = serde_json::from_slice(&std::fs::read(journal.join("after.json"))?)?;
    if !journal.join("committed").exists() {
        before.validate()?;
        after.validate()?;
        install(root, &before)?;
        for path in after
            .files
            .keys()
            .filter(|p| !before.files.contains_key(*p))
        {
            reject_symlink_ancestors(root, path)?;
            match std::fs::remove_file(root.join(path)) {
                Ok(()) => {}
                Err(e) if e.kind() == std::io::ErrorKind::NotFound => {}
                Err(e) => return Err(e.into()),
            }
        }
    }
    std::fs::remove_dir_all(journal)?;
    Ok(())
}
pub fn load_directory(path: &Path) -> Result<Source> {
    let metadata_exists = || {
        path.join(".nofy-source.lock").symlink_metadata().is_ok()
            || path
                .join(".nofy-source-transaction")
                .symlink_metadata()
                .is_ok()
    };
    if !metadata_exists() {
        // Immutable/read-only templates need no writable sidecar. A concurrent
        // CLI writer creates its lock before changing any source; detect that
        // boundary and re-read under its lock when necessary.
        let source = load_unlocked(path)?;
        if !metadata_exists() {
            return Ok(source);
        }
    }
    let _guard = lock(path)?;
    recover(path)?;
    load_unlocked(path)
}

/// New directories never overwrite existing work. Existing work uses a digest
/// CAS and an on-disk rollback journal; unlisted user files remain untouched.
pub fn write_directory(path: &Path, source: &Source, expected_digest: Option<&str>) -> Result<()> {
    let source = effective(source)?;
    source.validate()?;
    complete(&source)?;
    if let Some(expected) = expected_digest {
        let _guard = lock(path)?;
        recover(path)?;
        let before = load_unlocked(path)?;
        if before.digest()? != expected {
            return Err(Error::new("conflict", "local source digest changed"));
        }
        for file in source.files.keys() {
            reject_symlink_ancestors(path, file)?;
            if !before.files.contains_key(file) && path.join(file).exists() {
                return Err(Error::new(
                    "conflict",
                    format!("source output would replace an unlisted file: {file}"),
                ));
            }
        }
        let journal = path.join(".nofy-source-transaction");
        std::fs::create_dir(&journal)?;
        private_write(
            &journal.join("before.json"),
            &serde_json::to_vec(&before)?,
            false,
        )?;
        private_write(
            &journal.join("after.json"),
            &serde_json::to_vec(&source)?,
            false,
        )?;
        let result = (|| {
            install(path, &source)?;
            for file in before
                .files
                .keys()
                .filter(|p| !source.files.contains_key(*p))
            {
                reject_symlink_ancestors(path, file)?;
                std::fs::remove_file(path.join(file))?;
            }
            private_write(&journal.join("committed"), b"committed\n", false)?;
            Ok(())
        })();
        match result {
            Ok(()) => recover(path),
            Err(e) => {
                recover(path)?;
                Err(e)
            }
        }
    } else {
        if path.try_exists()? {
            return Err(Error::new("conflict", "output directory already exists"));
        }
        let parent = path
            .parent()
            .filter(|p| !p.as_os_str().is_empty())
            .unwrap_or_else(|| Path::new("."));
        std::fs::create_dir_all(parent)?;
        let temp = tempfile::tempdir_in(parent)?;
        install(temp.path(), &source)?;
        #[cfg(target_os = "linux")]
        {
            rustix::fs::renameat_with(
                rustix::fs::CWD,
                temp.path(),
                rustix::fs::CWD,
                path,
                rustix::fs::RenameFlags::NOREPLACE,
            )
            .map_err(|e| Error::from(std::io::Error::from(e)))?;
            sync_directory(parent)?;
        }
        #[cfg(not(target_os = "linux"))]
        {
            // create_dir claims the destination exclusively, then only our files are
            // moved into it. A racing pre-existing directory is never replaced.
            std::fs::create_dir(path)?;
            for entry in std::fs::read_dir(temp.path())? {
                let entry = entry?;
                std::fs::rename(entry.path(), path.join(entry.file_name()))?;
            }
        }
        Ok(())
    }
}
fn effective(source: &Source) -> Result<Source> {
    let mut source = source.clone();
    if let Some(settings) = source.settings_json.take() {
        let p = if source.files.contains_key("project.json") {
            source.json("project.json")?["settings"]
                .as_str()
                .unwrap_or("settings.json")
                .to_owned()
        } else {
            "settings.json".into()
        };
        let settings: Value = serde_json::from_str(&settings)?;
        source.put_json(&p, &settings)?;
        source.refresh_manifest()?;
    }
    Ok(source)
}
pub fn complete(source: &Source) -> Result<()> {
    source.validate()?;
    fn present(source: &Source, path: &str) -> Result<()> {
        safe_path(path)?;
        source
            .files
            .get(path)
            .ok_or_else(|| Error::new("not_found", format!("source file missing: {path}")))?
            .decode()?;
        Ok(())
    }
    fn includes(source: &Source, v: &Value) -> Result<()> {
        if let Some(m) = v.as_object() {
            if m.len() == 1 && m.contains_key("$literal") {
                return Ok(());
            }
            if let Some(path) = m.get("$file").and_then(Value::as_str) {
                present(source, path)?;
            }
            if let Some(path) = m
                .get("$json")
                .and_then(|v| v.get("path"))
                .and_then(Value::as_str)
            {
                present(source, path)?;
            }
            if let Some(bindings) = m
                .get("$configure")
                .and_then(|v| v.get("source_bindings"))
                .and_then(Value::as_object)
            {
                for path in bindings.values() {
                    present(
                        source,
                        path.as_str().ok_or_else(|| {
                            Error::new("local_input", "source binding path required")
                        })?,
                    )?;
                }
            }
            for child in m.values() {
                includes(source, child)?;
            }
        } else if let Some(items) = v.as_array() {
            for child in items {
                includes(source, child)?;
            }
        }
        Ok(())
    }
    includes(source, &source.json(&source.declaration)?)?;
    if source.files.contains_key("project.json") {
        let project = source.json("project.json")?;
        for key in ["settings", "settings_schema", "prepare"] {
            if let Some(path) = project.get(key).and_then(Value::as_str) {
                present(source, path)?;
                if key == "prepare" {
                    includes(source, &source.json(path)?)?;
                }
            }
        }
    }
    if source.files.contains_key("source-files.json") {
        let names: Vec<String> = serde_json::from_value(source.json("source-files.json")?)?;
        let unique: BTreeSet<_> = names.iter().cloned().collect();
        let actual: BTreeSet<_> = source.files.keys().cloned().collect();
        if names.len() != unique.len() || unique != actual {
            return Err(Error::new(
                "local_input",
                "source-files.json does not match the source collection",
            ));
        }
    }
    Ok(())
}
pub fn pack_to(source: &Source, output: impl Write) -> Result<()> {
    let source = effective(source)?;
    complete(&source)?;
    crate::repository::verify_package_sources(&source)?;
    let gzip = GzBuilder::new()
        .mtime(0)
        .write(output, Compression::default());
    let mut archive = tar::Builder::new(gzip);
    for (path, file) in &source.files {
        let bytes = file.decode()?;
        let mut header = tar::Header::new_gnu();
        header.set_entry_type(tar::EntryType::Regular);
        header.set_size(bytes.len() as u64);
        header.set_mode(if file.executable { 0o755 } else { 0o644 });
        header.set_uid(0);
        header.set_gid(0);
        header.set_mtime(0);
        header.set_cksum();
        archive.append_data(&mut header, path, bytes.as_slice())?;
    }
    archive.into_inner()?.finish()?;
    Ok(())
}
pub fn pack(source: &Source) -> Result<Vec<u8>> {
    let mut bytes = vec![];
    pack_to(source, &mut bytes)?;
    Ok(bytes)
}
pub fn archive_info(source: &Source, bytes: &[u8]) -> Result<Value> {
    Ok(
        json!({"format":"nofy.source-archive/v1","sha256":digest(bytes),"bytes":bytes.len().to_string(),"source_digest":source.digest()?,"files":source.files.len()}),
    )
}
