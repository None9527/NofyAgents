use super::*;
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(deny_unknown_fields)]
pub(crate) struct Plan {
    pub protocol: String,
    pub source_revision: u64,
    pub source: StorageView,
    pub target: BackendDefinition,
    pub inventory: RuntimeSnapshot,
    pub fingerprint: String,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Record {
    command: String,
    plan: Plan,
    before: Pointer,
    target: Binding,
    phase: String,
    staged: Option<RuntimeSnapshot>,
    result: Option<Receipt>,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub(crate) struct Receipt {
    pub protocol: String,
    pub command_id: String,
    pub fingerprint: String,
    pub phase: String,
    pub plan: Plan,
    pub target_generation: String,
    pub storage: StorageView,
}
fn point(_name: &str) {
    #[cfg(test)]
    super::tests::point(_name);
}
fn conflict() -> HostError {
    HostError::Control(nofy_agent_runtime::control::ControlError::CommandConflict)
}
impl Control {
    fn command_path(&self, id: &str) -> Result<PathBuf> {
        if !valid_id(id) {
            return Err(invalid("invalid runtime transfer command ID"));
        }
        Ok(self.root.join("transfers").join(format!("{id}.json")))
    }
    fn record(&self, id: &str) -> Result<Option<Record>> {
        let path = self.command_path(id)?;
        let record: Record = match path.symlink_metadata() {
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => {
                let pointer = self.pointer()?;
                if pointer.pending.as_deref() != Some(id) {
                    return Ok(None);
                }
                serde_json::from_value(pointer.intent.ok_or_else(unavailable)?)
                    .map_err(|_| unavailable())?
            }
            Err(e) => return Err(storage::unavailable(e)),
            Ok(meta) if !meta.is_file() || meta.file_type().is_symlink() => {
                return Err(unavailable());
            }
            _ => serde_json::from_slice(&storage::read(&path, 512 * 1024)?)
                .map_err(|_| unavailable())?,
        };
        let mut plan = record.plan.clone();
        let claimed = std::mem::take(&mut plan.fingerprint);
        if record.command != id
            || plan.protocol != PROTOCOL
            || hash(&plan)? != claimed
            || record.before.protocol != PROTOCOL
            || record.before.revision != plan.source_revision
            || record.before.pending.is_some()
            || record.before.intent.is_some()
            || !record.before.initialized
            || plan.source != self.view_of(&record.before)
            || record.target.backend != plan.target
            || !matches!(
                record.phase.as_str(),
                "preparing" | "prepared" | "completed" | "aborted"
            )
            || matches!(record.phase.as_str(), "completed" | "aborted") != record.result.is_some()
        {
            return Err(unavailable());
        }
        self.validate_binding(&record.target)?;
        if record.before.active.generation == "origin" {
            if record.before.active.path != self.authority.origin {
                return Err(unavailable());
            }
        } else {
            self.validate_binding(&record.before.active)?;
        }
        if record
            .staged
            .as_ref()
            .is_some_and(|v| v != &record.plan.inventory)
            || record.phase == "prepared" && record.staged.is_none()
        {
            return Err(unavailable());
        }
        if let Some(result) = &record.result {
            let expected = self.receipt(
                &record,
                &self.finished_pointer(&record, &record.phase)?,
                &record.phase,
            );
            if encoded(result)? != encoded(&expected)? {
                return Err(unavailable());
            }
        }
        Ok(Some(record))
    }
    fn write_record(&self, record: &Record, replace: bool) -> Result<()> {
        storage::directory(&self.root.join("transfers"))?;
        storage::atomic(
            &self.command_path(&record.command)?,
            &encoded(record)?,
            0o600,
            replace,
        )
    }
    fn finished_pointer(&self, record: &Record, phase: &str) -> Result<Pointer> {
        if !matches!(phase, "completed" | "aborted") {
            return Err(unavailable());
        }
        let mut pointer = record.before.clone();
        pointer.revision = pointer.revision.checked_add(1).ok_or_else(unavailable)?;
        pointer.active = if phase == "completed" {
            record.target.clone()
        } else {
            record.before.active.clone()
        };
        pointer.pending = None;
        pointer.intent = None;
        pointer.last_commit = Some(record.command.clone());
        Ok(pointer)
    }
    fn receipt(&self, record: &Record, pointer: &Pointer, phase: &str) -> Receipt {
        Receipt {
            protocol: PROTOCOL.into(),
            command_id: record.command.clone(),
            fingerprint: record.plan.fingerprint.clone(),
            phase: phase.into(),
            plan: record.plan.clone(),
            target_generation: record.target.generation.clone(),
            storage: self.view_of(pointer),
        }
    }
    fn derived_phase(&self, record: &Record, pointer: &Pointer) -> Result<Option<&'static str>> {
        if pointer.last_commit.as_deref() == Some(&record.command) && pointer.pending.is_none() {
            if *pointer == self.finished_pointer(record, "completed")? {
                return Ok(Some("completed"));
            }
            if *pointer == self.finished_pointer(record, "aborted")? {
                return Ok(Some("aborted"));
            }
            return Err(unavailable());
        }
        Ok(None)
    }
    /// Before any new ownership change, seal the previous pointer's exact
    /// receipt. A crash between pointer publication and receipt is recoverable.
    fn finish_tail(&self, pointer: &Pointer) -> Result<()> {
        if let Some(id) = &pointer.last_commit {
            let mut record = self.record(id)?.ok_or_else(unavailable)?;
            if record.result.is_none() {
                let phase = self
                    .derived_phase(&record, pointer)?
                    .ok_or_else(unavailable)?;
                record.phase = phase.into();
                record.result = Some(self.receipt(&record, pointer, phase));
                self.write_record(&record, true)?;
            }
        }
        Ok(())
    }
    fn ensure_idle(&self, pointer: &Pointer, now: u64) -> Result<()> {
        let db = rusqlite::Connection::open_with_flags(
            &pointer.active.path,
            rusqlite::OpenFlags::SQLITE_OPEN_READ_ONLY,
        )
        .map_err(storage::unavailable)?;
        let live: bool = db
            .query_row(
                "SELECT EXISTS(SELECT 1 FROM agent_runtime_leases WHERE expires_ms>?1)",
                [now],
                |r| r.get(0),
            )
            .map_err(storage::unavailable)?;
        if live {
            return Err(invalid(
                "runtime history still has a live execution lease; park or settle its owner before transfer",
            ));
        }
        Ok(())
    }
    fn preflight_directory(&self, directory: &Path) -> Result<()> {
        preflight_directory_with(directory, |path| path.symlink_metadata())
    }

    fn plan_locked(&self, target: &BackendDefinition, now: u64) -> Result<(Plan, Pointer)> {
        let before = self.pointer()?;
        self.finish_tail(&before)?;
        if !before.initialized || before.pending.is_some() {
            return Err(HostError::Control(
                nofy_agent_runtime::control::ControlError::Busy,
            ));
        }
        if before.active.backend == *target {
            return Err(invalid("target runtime backend is already active"));
        }
        self.preflight_directory(&self.backend_directory(target)?)?;
        self.ensure_idle(&before, now)?;
        let inventory = inspect_snapshot(&before.active.path)?;
        let mut plan = Plan {
            protocol: PROTOCOL.into(),
            source_revision: before.revision,
            source: self.view_of(&before),
            target: target.clone(),
            inventory,
            fingerprint: String::new(),
        };
        plan.fingerprint = hash(&plan)?;
        Ok((plan, before))
    }
    pub(crate) fn plan(&self, target: &BackendDefinition, now: u64) -> Result<Plan> {
        let _data = self.data_lease(true)?;
        Ok(self.plan_locked(target, now)?.0)
    }
    pub(crate) fn status(&self, id: &str) -> Result<Option<Receipt>> {
        let Some(record) = self.record(id)? else {
            return Ok(None);
        };
        if let Some(result) = &record.result {
            return Ok(Some(result.clone()));
        }
        let pointer = self.pointer()?;
        if let Some(phase) = self.derived_phase(&record, &pointer)? {
            return Ok(Some(self.receipt(&record, &pointer, phase)));
        }
        if pointer.pending.as_deref() == Some(id)
            && pointer.active == record.before.active
            && pointer.revision == record.before.revision
        {
            return Ok(Some(self.receipt(&record, &pointer, &record.phase)));
        }
        // The intent can be durable immediately before its preparing pointer.
        if pointer == record.before && record.phase == "preparing" {
            return Ok(Some(self.receipt(&record, &pointer, "intent")));
        }
        Err(unavailable())
    }
    fn reserve(&self, record: &Record) -> Result<Pointer> {
        let mut pointer = record.before.clone();
        pointer.pending = Some(record.command.clone());
        pointer.intent = Some(serde_json::to_value(record).map_err(storage::unavailable)?);
        self.write_pointer(&pointer, true)?;
        Ok(pointer)
    }
    fn pending(&self, record: &Record) -> Result<Pointer> {
        let pointer = self.pointer()?;
        if pointer.pending.as_deref() != Some(&record.command)
            || pointer.revision != record.before.revision
            || pointer.active != record.before.active
        {
            return Err(unavailable());
        }
        Ok(pointer)
    }
    fn owner(&self, record: &Record) -> Value {
        json!({"protocol":PROTOCOL,"authority":self.authority.authority,"identity":storage::hash(self.authority.identity.as_bytes()),"command_id":record.command,"fingerprint":record.plan.fingerprint,"generation":record.target.generation})
    }
    fn stage(&self, record: &Record) -> Result<PathBuf> {
        record
            .target
            .path
            .parent()
            .map(Path::to_path_buf)
            .ok_or_else(unavailable)
    }
    fn verify(&self, record: &Record) -> Result<()> {
        let stage = self.stage(record)?;
        let owner: Value =
            serde_json::from_slice(&storage::read(&stage.join("owner.json"), 32768)?)
                .map_err(|_| unavailable())?;
        if owner != self.owner(record)
            || record.staged.as_ref() != Some(&inspect_snapshot(&record.target.path)?)
        {
            return Err(unavailable());
        }
        Ok(())
    }
    fn build_prepared(&self, mut record: Record, store: &SqliteStore) -> Result<Record> {
        self.pending(&record)?;
        if inspect_snapshot(&record.before.active.path)? != record.plan.inventory {
            return Err(invalid("runtime source changed after the transfer plan"));
        }
        if record.staged.is_none() {
            let mut stage = self.stage(&record)?;
            if stage.try_exists().map_err(storage::unavailable)? {
                record.target = self.binding(
                    &record.plan.target,
                    &storage::hash(
                        nofy_tool_protocol::ToolCallId::new_v7()
                            .to_string()
                            .as_bytes(),
                    ),
                )?;
                stage = self.stage(&record)?;
                self.write_record(&record, true)?;
            }
            self.preflight_directory(&stage)?;
            let stage = storage::directory(&stage)?;
            storage::atomic(
                &stage.join("owner.json"),
                &encoded(&self.owner(&record))?,
                0o600,
                false,
            )?;
            let copied = copy_snapshot(
                &record.before.active.path,
                &record.target.path,
                &record.plan.inventory,
            )?;
            store.protect_snapshot(&record.target.path)?;
            // Persist every new generation directory entry before publishing
            // a pointer. The destination may be on a different filesystem.
            let mut directory = Some(stage.as_path());
            while let Some(path) = directory {
                nofy_durable_fs::sync_directory(path).map_err(storage::unavailable)?;
                if path == self.backend_directory(&record.target.backend)? {
                    break;
                }
                directory = path.parent();
            }
            record.staged = Some(copied);
            record.phase = "prepared".into();
            self.write_record(&record, true)?;
        }
        self.verify(&record)?;
        store.protect_snapshot(&record.target.path)?;
        point("prepared");
        Ok(record)
    }
    pub(crate) fn prepare(
        &self,
        id: &str,
        target: &BackendDefinition,
        fingerprint: &str,
        store: &SqliteStore,
    ) -> Result<Receipt> {
        if !valid_id(id) || !digest(fingerprint) {
            return Err(invalid("invalid runtime transfer command or fingerprint"));
        }
        let _data = self.data_lease(true)?;
        if let Some(record) = self.record(id)? {
            if record.plan.target != *target || record.plan.fingerprint != fingerprint {
                return Err(conflict());
            }
            return self.resume_locked(record, store, false);
        }
        let (plan, before) = self.plan_locked(target, store.now_ms())?;
        if plan.fingerprint != fingerprint {
            return Err(conflict());
        }
        let binding = self.binding(
            target,
            &storage::hash(
                nofy_tool_protocol::ToolCallId::new_v7()
                    .to_string()
                    .as_bytes(),
            ),
        )?;
        let record = Record {
            command: id.into(),
            plan,
            before,
            target: binding,
            phase: "preparing".into(),
            staged: None,
            result: None,
        };
        self.protect_bucket(target)?;
        self.reserve(&record)?;
        point("intent");
        self.write_record(&record, false)?;
        point("fenced");
        self.resume_locked(record, store, false)
    }
    fn resume_locked(&self, record: Record, store: &SqliteStore, publish: bool) -> Result<Receipt> {
        if let Some(result) = &record.result {
            return Ok(result.clone());
        }
        let pointer = self.pointer()?;
        self.finish_tail(&pointer)?;
        if let Some(phase) = self.derived_phase(&record, &pointer)? {
            return Ok(self.receipt(&record, &pointer, phase));
        }
        if pointer == record.before {
            self.ensure_idle(&pointer, store.now_ms())?;
            self.reserve(&record)?;
        }
        self.pending(&record)?;
        let record = self.build_prepared(record, store)?;
        if !publish {
            return Ok(self.receipt(&record, &self.pointer()?, "prepared"));
        }
        self.ensure_idle(&self.pointer()?, store.now_ms())?;
        if inspect_snapshot(&record.before.active.path)? != record.plan.inventory {
            return Err(invalid("runtime source changed before publication"));
        }
        nofy_agent_runtime::durable::transport::retire_snapshot(
            &record.before.active.path,
            &record.plan.inventory,
            &self.authority.authority,
            &record.command,
            store.now_ms(),
        )?;
        point("retired");
        let after = self.finished_pointer(&record, "completed")?;
        self.write_pointer(&after, true)?;
        point("published");
        let result = self.receipt(&record, &after, "completed");
        let mut saved = record;
        saved.phase = "completed".into();
        saved.result = Some(result.clone());
        self.write_record(&saved, true)?;
        Ok(result)
    }
    pub(crate) fn apply(
        &self,
        id: &str,
        fingerprint: &str,
        store: &SqliteStore,
    ) -> Result<Receipt> {
        let _data = self.data_lease(true)?;
        let record = self.record(id)?.ok_or(HostError::NotFound)?;
        if record.plan.fingerprint != fingerprint {
            return Err(conflict());
        }
        self.resume_locked(record, store, true)
    }
    pub(crate) fn abort(&self, id: &str, fingerprint: &str) -> Result<Receipt> {
        let _data = self.data_lease(true)?;
        let mut record = self.record(id)?.ok_or(HostError::NotFound)?;
        if record.plan.fingerprint != fingerprint {
            return Err(conflict());
        }
        if let Some(result) = &record.result {
            return if result.phase == "aborted" {
                Ok(result.clone())
            } else {
                Err(invalid(
                    "published runtime history requires a reverse transfer",
                ))
            };
        }
        let pointer = self.pointer()?;
        self.finish_tail(&pointer)?;
        if let Some(phase) = self.derived_phase(&record, &pointer)? {
            return if phase == "aborted" {
                Ok(self.receipt(&record, &pointer, phase))
            } else {
                Err(invalid(
                    "published runtime history requires a reverse transfer",
                ))
            };
        }
        if pointer != record.before {
            self.pending(&record)?;
        }
        nofy_agent_runtime::durable::transport::release_retirement(
            &record.before.active.path,
            &self.authority.authority,
            &record.command,
        )?;
        let after = self.finished_pointer(&record, "aborted")?;
        self.write_pointer(&after, true)?;
        let result = self.receipt(&record, &after, "aborted");
        record.phase = "aborted".into();
        record.result = Some(result.clone());
        self.write_record(&record, true)?;
        Ok(result)
    }
}

#[cfg(test)]
mod preflight_tests;

/// Query only complete disk/share roots, then every ancestor without following
/// links. Keep other namespaces and drive-relative paths on their original path.
fn preflight_directory_with(
    directory: &Path,
    mut metadata: impl FnMut(&Path) -> std::io::Result<std::fs::Metadata>,
) -> Result<()> {
    let mut current = PathBuf::new();
    let mut components = directory.components().peekable();
    while let Some(component) = components.next() {
        current.push(component.as_os_str());
        if let Component::Prefix(prefix) = component {
            use std::path::Prefix;
            if matches!(
                prefix.kind(),
                Prefix::Disk(_)
                    | Prefix::VerbatimDisk(_)
                    | Prefix::UNC(_, _)
                    | Prefix::VerbatimUNC(_, _)
            ) && matches!(components.peek(), Some(Component::RootDir))
            {
                // A bare verbatim disk prefix is a volume, not its root directory.
                // The following RootDir is still queried, including for root-only paths.
                continue;
            }
        }
        match metadata(&current) {
            Ok(meta) if !meta.is_dir() || meta.file_type().is_symlink() => {
                return Err(invalid(
                    "runtime history destination must use real directory components",
                ));
            }
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => {}
            Err(e) => return Err(storage::unavailable(e)),
            _ => {}
        }
    }
    Ok(())
}
