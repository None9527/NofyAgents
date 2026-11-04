use super::*;
use crate::{program::CompiledProgram, registry::ModuleRegistry};
#[derive(Clone)]
pub struct ControlPlane {
    store: Arc<dyn CatalogStore>,
    host: Arc<ModuleRegistry>,
}
impl ControlPlane {
    pub fn new(store: Arc<dyn CatalogStore>, host: ModuleRegistry) -> Self {
        Self {
            store,
            host: Arc::new(host),
        }
    }
    pub fn prepare(&self, document: SystemDocument) -> Result<CompiledSystem> {
        Ok(compile_system(document, &self.host)?)
    }
    pub async fn prepare_async(&self, document: SystemDocument) -> Result<CompiledSystem> {
        let host = self.host.clone();
        tokio::task::spawn_blocking(move || compile_system(document, &host))
            .await
            .map_err(|e| ControlError::CompileTask(e.to_string()))?
            .map_err(Into::into)
    }
    async fn rebind(&self, bundle: SystemBundle) -> Result<CompiledSystem> {
        let host = self.host.clone();
        tokio::task::spawn_blocking(move || bundle.restore(&host))
            .await
            .map_err(|e| ControlError::CompileTask(e.to_string()))?
            .map_err(Into::into)
    }
    pub async fn inspect(&self) -> Result<Option<CatalogView>> {
        self.store.load().await
    }
    async fn transact<T>(&self, mutate: impl Fn(&mut CatalogData, u64) -> Result<T>) -> Result<T> {
        for _ in 0..8 {
            let current = self.store.load().await?;
            let expected = current.as_ref().map(|v| v.revision);
            let next = expected
                .unwrap_or(0)
                .checked_add(1)
                .ok_or_else(|| ControlError::Invalid("catalog revision exhausted".into()))?;
            let mut data = current.map_or_else(CatalogData::default, |v| v.data);
            let before = digest(&data)?;
            let result = mutate(&mut data, next)?;
            if digest(&data)? == before {
                return Ok(result);
            }
            match self.store.compare_exchange(expected, data).await {
                Ok(_) => return Ok(result),
                Err(ControlError::Conflict { .. }) => continue,
                Err(error) => return Err(error),
            }
        }
        Err(ControlError::Busy)
    }
    /// Revision is a global monotonic catalog revision, preventing ABA after
    /// deletion and recreation of a draft with the same name.
    pub async fn save_draft(
        &self,
        name: &str,
        expected: Option<u64>,
        document: SystemDocument,
    ) -> Result<Draft> {
        bounded_name(name)?;
        if serde_json::to_vec(&document).map_or(true, |v| v.len() > 8 * 1024 * 1024) {
            return Err(ControlError::Invalid("draft exceeds 8 MiB".into()));
        }
        self.transact(|data, revision| {
            let actual = data.drafts.get(name).map(|d| d.revision);
            if actual != expected {
                return Err(ControlError::Conflict { expected, actual });
            }
            let draft = Draft {
                revision,
                document: document.clone(),
            };
            data.drafts.insert(name.into(), draft.clone());
            Ok(draft)
        })
        .await
    }
    pub async fn delete_draft(&self, name: &str, expected: u64) -> Result<()> {
        self.transact(|data, _| {
            let actual = data.drafts.get(name).map(|d| d.revision);
            if actual != Some(expected) {
                return Err(ControlError::Conflict {
                    expected: Some(expected),
                    actual,
                });
            }
            data.drafts.remove(name);
            Ok(())
        })
        .await
    }
    pub async fn publish(&self, name: &str, expected: u64) -> Result<Publication> {
        let draft = self
            .store
            .load()
            .await?
            .and_then(|v| v.data.drafts.get(name).cloned())
            .ok_or_else(|| ControlError::NotFound(name.into()))?;
        if draft.revision != expected {
            return Err(ControlError::Conflict {
                expected: Some(expected),
                actual: Some(draft.revision),
            });
        }
        let compiled = self.prepare_async(draft.document).await?;
        self.install_publication(compiled.bundle, Some((name, expected)))
            .await
    }
    /// Imports exactly the same locked single-file representation that export
    /// returns. Verification finishes before changing persistent configuration.
    pub async fn import(&self, bundle: SystemBundle) -> Result<Publication> {
        self.install_file(SystemFile::Locked(bundle)).await
    }
    pub async fn install_file(&self, file: SystemFile) -> Result<Publication> {
        let host = self.host.clone();
        let compiled = tokio::task::spawn_blocking(move || file.prepare(&host))
            .await
            .map_err(|e| ControlError::CompileTask(e.to_string()))??;
        self.install_publication(compiled.bundle, None).await
    }
    async fn install_publication(
        &self,
        bundle: SystemBundle,
        draft: Option<(&str, u64)>,
    ) -> Result<Publication> {
        self.transact(|data, revision| {
            if let Some((name, expected)) = draft {
                let actual = data.drafts.get(name).map(|d| d.revision);
                if actual != Some(expected) {
                    return Err(ControlError::Conflict {
                        expected: Some(expected),
                        actual,
                    });
                }
            }
            if let Some(old) = data.publications.get(&bundle.digest) {
                return Ok(old.clone());
            }
            let publication = Publication {
                created_revision: revision,
                bundle: bundle.clone(),
            };
            data.publications
                .insert(bundle.digest.clone(), publication.clone());
            Ok(publication)
        })
        .await
    }
    pub async fn export(&self, release: &str) -> Result<SystemBundle> {
        self.store
            .load()
            .await?
            .and_then(|v| v.data.publications.get(release).map(|p| p.bundle.clone()))
            .ok_or_else(|| ControlError::NotFound(release.into()))
    }
    pub async fn plan(&self, system: &str, release: &str) -> Result<SystemDiff> {
        let data = self.store.load().await?.map(|v| v.data).unwrap_or_default();
        let target = data
            .publications
            .get(release)
            .ok_or_else(|| ControlError::NotFound(release.into()))?;
        if target.bundle.document.name != system {
            return Err(ControlError::Invalid(
                "publication belongs to another system".into(),
            ));
        }
        let previous = data
            .active
            .get(system)
            .and_then(|a| data.publications.get(&a.release));
        Ok(target.bundle.diff(previous.map(|p| &p.bundle))?)
    }
    pub async fn apply(&self, command: ApplyCommand) -> Result<ApplyReceipt> {
        bounded_name(&command.command_id)?;
        bounded_name(&command.system)?;
        if let Some(old) = self
            .store
            .load()
            .await?
            .and_then(|v| v.data.commands.get(&command.command_id).cloned())
        {
            return if old.command == command {
                Ok(old)
            } else {
                Err(ControlError::CommandConflict)
            };
        }
        let bundle = self.export(&command.release).await?;
        self.rebind(bundle).await?;
        self.transact(|data, _| {
            if let Some(old) = data.commands.get(&command.command_id) {
                return if old.command == command {
                    Ok(old.clone())
                } else {
                    Err(ControlError::CommandConflict)
                };
            }
            let publication = data
                .publications
                .get(&command.release)
                .ok_or_else(|| ControlError::NotFound(command.release.clone()))?;
            if publication.bundle.document.name != command.system {
                return Err(ControlError::Invalid(
                    "publication belongs to another system".into(),
                ));
            }
            let previous = data.active.get(&command.system).cloned();
            let actual = previous.as_ref().map(|a| a.generation);
            if actual != command.expected_generation {
                return Err(ControlError::Conflict {
                    expected: command.expected_generation,
                    actual,
                });
            }
            let old = previous
                .as_ref()
                .and_then(|a| data.publications.get(&a.release));
            let changed = publication.bundle.diff(old.map(|p| &p.bundle))?;
            let noop = previous
                .as_ref()
                .is_some_and(|a| a.release == command.release);
            let generation = if noop {
                actual.expect("active release")
            } else {
                actual.unwrap_or(0).checked_add(1).ok_or_else(|| {
                    ControlError::Invalid("activation generation exhausted".into())
                })?
            };
            let active = Activation {
                generation,
                release: command.release.clone(),
            };
            let receipt = ApplyReceipt {
                command: command.clone(),
                previous,
                active: active.clone(),
                changed,
                noop,
            };
            data.active.insert(command.system.clone(), active);
            data.commands
                .insert(command.command_id.clone(), receipt.clone());
            Ok(receipt)
        })
        .await
    }
    pub async fn history(&self, system: &str) -> Result<Vec<ApplyReceipt>> {
        let mut history = self.store.load().await?.map_or_else(Vec::new, |v| {
            v.data
                .commands
                .into_values()
                .filter(|r| r.command.system == system)
                .collect::<Vec<_>>()
        });
        history.sort_by(|a, b| {
            a.active
                .generation
                .cmp(&b.active.generation)
                .then(a.command.command_id.cmp(&b.command.command_id))
        });
        Ok(history)
    }
    /// Loads the current activation for a new invocation in the same host
    /// process. Existing compiled invocations keep their previous release.
    pub async fn load_active(&self, system: &str) -> Result<(Activation, CompiledSystem)> {
        let data = self.store.load().await?.map(|v| v.data).unwrap_or_default();
        let active = data
            .active
            .get(system)
            .cloned()
            .ok_or_else(|| ControlError::NotFound(system.into()))?;
        let publication = data
            .publications
            .get(&active.release)
            .ok_or_else(|| ControlError::Invalid("active publication missing".into()))?;
        Ok((active, self.rebind(publication.bundle.clone()).await?))
    }
    pub async fn active_program(
        &self,
        system: &str,
        program: &str,
    ) -> Result<(Activation, CompiledProgram)> {
        let (activation, compiled) = self.load_active(system).await?;
        Ok((activation, compiled.program(program)?.clone()))
    }
}
