//! External generations remain private, including abandoned and retired copies.
use super::*;
use nofy_agent_runtime::{
    control::CatalogView, durable::retention::inspect_snapshot_modules, registry::ModuleDefinition,
};
use std::collections::BTreeSet;
#[cfg(test)]
mod tests;
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Protected {
    protocol: String,
    authority: String,
    roots: BTreeSet<PathBuf>,
}
fn overlap(a: &Path, b: &Path) -> bool {
    // Conservative lexical denial, not filesystem identity: Windows short
    // names and reparse aliases still need native verification. In particular,
    // a retired or missing protected root cannot simply be canonicalized away.
    nofy_host_path::starts_with(a, b) || nofy_host_path::starts_with(b, a)
}
fn registry(root: &Path) -> Result<Option<Protected>> {
    let file = root.join("protected-roots.json");
    if !root
        .join("authority.json")
        .try_exists()
        .map_err(storage::unavailable)?
    {
        if file.try_exists().map_err(storage::unavailable)? {
            return Err(unavailable());
        }
        return Ok(None);
    }
    let owner: Authority =
        serde_json::from_slice(&storage::read(&root.join("authority.json"), 32768)?)
            .map_err(|_| unavailable())?;
    let data: Protected = serde_json::from_slice(&storage::read(&file, 4 * 1024 * 1024)?)
        .map_err(|_| unavailable())?;
    if owner.protocol != PROTOCOL
        || data.protocol != PROTOCOL
        || data.authority != owner.authority
        || data.roots.iter().any(|p| {
            !absolute(p)
                || p.file_name().and_then(|s| s.to_str())
                    != Some(storage::hash(owner.authority.as_bytes()).as_str())
                || p.parent()
                    .and_then(Path::file_name)
                    .and_then(|s| s.to_str())
                    != Some(".nofy-runtime-history")
        })
    {
        return Err(unavailable());
    }
    Ok(Some(data))
}
/// IO belongs to resource preflight and actual FD/mount acquisition. Factory
/// construction and declaration preview remain pure.
pub(in crate::loader) fn check(private_root: &Path, path: &Path) -> Result<()> {
    if let Some(data) = registry(&private_root.join("loader/runtime-history"))?
        && data.roots.iter().any(|r| overlap(path, r))
    {
        return Err(invalid(
            "path grant exposes external private runtime history",
        ));
    }
    Ok(())
}
impl Control {
    pub(super) fn initialize_protection(&self) -> Result<()> {
        let path = self.root.join("protected-roots.json");
        if !path.try_exists().map_err(storage::unavailable)? {
            if nofy_agent_runtime::durable::placement::managed(&self.authority.origin)? {
                return Err(unavailable());
            }
            storage::atomic(
                &path,
                &encoded(&Protected {
                    protocol: PROTOCOL.into(),
                    authority: self.authority.authority.clone(),
                    roots: Default::default(),
                })?,
                0o600,
                false,
            )?;
        }
        registry(&self.root)?;
        Ok(())
    }
    pub(super) fn bucket(&self, target: &BackendDefinition) -> Result<PathBuf> {
        Ok(self
            .backend_directory(target)?
            .join(".nofy-runtime-history")
            .join(storage::hash(self.authority.authority.as_bytes())))
    }
    pub(super) fn protect_bucket(&self, target: &BackendDefinition) -> Result<()> {
        let mut data = registry(&self.root)?.ok_or_else(unavailable)?;
        if data.roots.insert(self.bucket(target)?) {
            let bytes = encoded(&data)?;
            if bytes.len() > 4 * 1024 * 1024 {
                return Err(invalid(
                    "runtime protected-location metadata exceeds its protocol size",
                ));
            }
            storage::atomic(&self.root.join("protected-roots.json"), &bytes, 0o600, true)?;
        }
        Ok(())
    }
    /// The resource lease excludes native execution/admission while this cut
    /// is inspected. Do not disable an existing grant as a side effect of a
    /// failed preparation: reject overlap before adding protected roots.
    pub(crate) fn preflight_grants(
        &self,
        target: &BackendDefinition,
        catalog: Option<CatalogView>,
        runtimes: &super::super::runtimes::RuntimeStore,
    ) -> Result<()> {
        let bucket = self.bucket(target)?;
        let visit = |definitions: Vec<ModuleDefinition>| -> Result<()> {
            for module in definitions {
                let paths: Vec<PathBuf> = match module.factory.as_str() {
                    "resource.directory" => vec![
                        serde_json::from_value::<super::super::directories::Grant>(module.config)
                            .map_err(|_| unavailable())?
                            .path,
                    ],
                    "resource.process_local" => {
                        let c: super::super::local::Config =
                            serde_json::from_value(module.config).map_err(|_| unavailable())?;
                        c.paths
                            .into_iter()
                            .map(|p| p.path)
                            .chain(std::iter::once(c.executable))
                            .collect()
                    }
                    _ => continue,
                };
                for path in paths {
                    let path = std::fs::canonicalize(&path).unwrap_or(path);
                    if overlap(&bucket, &path) {
                        return Err(invalid(
                            "runtime destination overlaps an existing directory or local dependency grant; choose a separate storage directory",
                        ));
                    }
                }
            }
            Ok(())
        };
        if let Some(catalog) = catalog {
            // Drafts carry no execution authority. Their path checks belong
            // to actual publication admission, not this history transfer.
            for publication in catalog.data.publications.values() {
                visit(super::super::module_walk::collect(
                    &publication.bundle.document,
                )?)?;
            }
        }
        let source = self.pointer()?.active.path;
        let inventory = inspect_snapshot_modules(&source, (), |_, _, modules| {
            visit(super::super::module_walk::collect_definitions(modules).map_err(runtime_error)?)
                .map_err(runtime_error)
        })?;
        if inventory.coverage.opaque_compositions > 0 {
            return Err(invalid(
                "runtime history contains an undecodable retained authority; resolve it before relocating private state",
            ));
        }
        for path in runtimes.granted_roots()? {
            if overlap(&bucket, &path) {
                return Err(invalid(
                    "runtime destination overlaps installed runtime library grants",
                ));
            }
        }
        Ok(())
    }
    pub(crate) fn exclusive_resources(&self) -> Result<HistoryLease> {
        Self::file_lease(&self.host_root.join("loader/lifecycle/lease.lock"), true)
    }
}
