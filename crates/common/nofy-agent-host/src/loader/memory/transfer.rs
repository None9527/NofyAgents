//! Namespace ownership and explicit physical canonical-history generations.
use super::*;
use nofy_agent_runtime::control::ControlError;
use nofy_memory::transport::{SnapshotInventory, copy_snapshot, inspect_snapshot};
use serde::{Deserialize, Serialize};

mod execution;
mod store;
#[cfg(test)]
mod tests;
const PROTOCOL: &str = "nofy.memory-transfer/v1";
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
enum Status {
    Vacant,
    Active,
    Retired,
    Preparing,
}
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(deny_unknown_fields)]
struct Location {
    namespace: String,
    dataset: String,
    generation: String,
    revision: u64,
    status: Status,
    command: Option<String>,
}
impl Location {
    fn origin(namespace: &str) -> Self {
        Self {
            namespace: namespace.into(),
            dataset: storage::hash(namespace.as_bytes()),
            generation: "origin".into(),
            revision: 0,
            status: Status::Active,
            command: None,
        }
    }
    fn vacant(namespace: &str) -> Self {
        let mut value = Self::origin(namespace);
        value.status = Status::Vacant;
        value
    }
    fn root(&self, base: &Path) -> Result<PathBuf> {
        if !valid_namespace(&self.namespace)
            || !digest(&self.dataset)
            || self.command.as_ref().is_some_and(|s| !command_id(s))
        {
            return Err(unavailable());
        }
        if self.generation == "origin" {
            Ok(base.join(storage::hash(self.namespace.as_bytes())))
        } else if digest(&self.generation) {
            Ok(base.join(".transfers").join(&self.generation).join("store"))
        } else {
            Err(unavailable())
        }
    }
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub(crate) struct NamespaceView {
    pub namespace: String,
    pub dataset: String,
    pub generation: String,
    pub revision: u64,
    pub active: bool,
    pub preparing: Option<String>,
}
impl From<&Location> for NamespaceView {
    fn from(v: &Location) -> Self {
        Self {
            namespace: v.namespace.clone(),
            dataset: v.dataset.clone(),
            generation: v.generation.clone(),
            revision: v.revision,
            active: matches!(v.status, Status::Active | Status::Vacant),
            preparing: if v.status == Status::Preparing {
                v.command.clone()
            } else {
                None
            },
        }
    }
}
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(deny_unknown_fields)]
pub(crate) struct TransferPlan {
    pub protocol: String,
    pub source: String,
    pub target: String,
    pub source_revision: u64,
    pub target_revision: u64,
    pub source_backend: String,
    pub target_backend: String,
    pub inventory: SnapshotInventory,
    pub target_format: Value,
    pub fingerprint: String,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Intent {
    plan: TransferPlan,
    input: String,
    source: Location,
    target: Location,
    generation: String,
    staged: Option<SnapshotInventory>,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub(crate) struct TransferReceipt {
    pub protocol: String,
    pub command_id: String,
    pub fingerprint: String,
    pub phase: String,
    pub plan: TransferPlan,
    pub source: NamespaceView,
    pub target: NamespaceView,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Record {
    command: String,
    intent: Intent,
    phase: String,
    result: Option<TransferReceipt>,
}
pub(crate) struct PreparedTransfer {
    record: Record,
    _leases: Vec<control::MemoryLease>,
}
fn unavailable() -> HostError {
    HostError::Unavailable("invalid memory transfer metadata; explicit recovery required".into())
}
fn invalid(message: &str) -> HostError {
    HostError::Invalid(message.into())
}
fn db_error(_: rusqlite::Error) -> HostError {
    HostError::Unavailable("memory transfer metadata unavailable".into())
}
fn encode<T: Serialize>(v: &T) -> Result<String> {
    serde_json::to_string(v).map_err(storage::unavailable)
}
fn hash<T: Serialize>(v: &T) -> Result<String> {
    Ok(storage::hash(encode(v)?.as_bytes()))
}
fn digest(s: &str) -> bool {
    s.len() == 64
        && s.bytes()
            .all(|b| b.is_ascii_digit() || (b'a'..=b'f').contains(&b))
}
fn command_id(s: &str) -> bool {
    !s.is_empty()
        && s.len() <= 128
        && s.bytes()
            .all(|b| b.is_ascii_alphanumeric() || b"._-".contains(&b))
}
fn valid_namespace(s: &str) -> bool {
    !s.is_empty()
        && s.len() <= 128
        && s.bytes()
            .all(|b| b.is_ascii_alphanumeric() || b"_-".contains(&b))
}
fn copy_error(_: nofy_memory::transport::TransportError) -> HostError {
    HostError::Unavailable(
        "canonical memory snapshot rejected; original operations or data require recovery".into(),
    )
}
fn point(_name: &str) {
    #[cfg(test)]
    tests::point(_name);
}
impl Provider {
    fn catalog(&self, create: bool) -> Result<Option<rusqlite::Connection>> {
        store::open(&self.control.migration_database(), create)
    }
    fn location(&self, namespace: &str) -> Result<Option<Location>> {
        let value = match self.catalog(false)? {
            None => None,
            Some(db) => store::location(&db, namespace)?,
        };
        let sealed = self.control.namespace_sealed(namespace)?;
        if value.is_none() && sealed
            || value
                .as_ref()
                .is_some_and(|v| v.status != Status::Preparing)
                && !sealed
        {
            return Err(unavailable());
        }
        Ok(value)
    }
    pub(crate) fn namespace_view(&self, namespace: &str) -> Result<Option<NamespaceView>> {
        Ok(self.location(namespace)?.as_ref().map(Into::into))
    }
    pub(super) fn resolved(&self, namespace: &str) -> Result<(PathBuf, Option<String>)> {
        match self.location(namespace)? {
            None => Ok((self.root.join(storage::hash(namespace.as_bytes())), None)),
            Some(location) if matches!(location.status, Status::Active | Status::Vacant) => Ok((
                location.root(&self.root)?,
                Some(format!("{}:{}", location.generation, location.revision)),
            )),
            Some(_) => Err(HostError::Control(ControlError::Busy)),
        }
    }
    fn leases(&self, source: &str, target: &str) -> Result<Vec<control::MemoryLease>> {
        let mut names = vec![source, target];
        names.sort();
        names.dedup();
        names
            .into_iter()
            .map(|name| self.control.namespace_lease(name, true))
            .collect()
    }
    fn input(source: &Value, target: &Value) -> Result<(Backend, Backend, String)> {
        let a = Backend::parse(source)?;
        let b = Backend::parse(target)?;
        if a.namespace == b.namespace || a.project_id != b.project_id {
            return Err(invalid(
                "memory transfer needs distinct namespaces and the same selected project ID",
            ));
        }
        Ok((a, b, hash(&(source, target))?))
    }
    fn plan_locked(
        &self,
        a: &Backend,
        b: &Backend,
        source: &Value,
        target: &Value,
    ) -> Result<(TransferPlan, Location, Location)> {
        let mut before = self
            .location(&a.namespace)?
            .unwrap_or_else(|| Location::origin(&a.namespace));
        if before.status == Status::Vacant {
            before.status = Status::Active;
        }
        if before.status != Status::Active {
            return Err(HostError::Control(ControlError::Busy));
        }
        let after = self
            .location(&b.namespace)?
            .unwrap_or_else(|| Location::vacant(&b.namespace));
        if after.status == Status::Preparing
            || after.status == Status::Active
            || after.status == Status::Retired && after.dataset != before.dataset
        {
            return Err(invalid(
                "target namespace is active or belongs to another dataset",
            ));
        }
        if after.status == Status::Vacant
            && after
                .root(&self.root)?
                .try_exists()
                .map_err(storage::unavailable)?
        {
            return Err(invalid(
                "target namespace already contains unmanaged canonical data",
            ));
        }
        let root = before.root(&self.root)?;
        let actual: Value =
            serde_json::from_slice(&storage::read(&root.join("schema.json"), 8192)?)
                .map_err(storage::unavailable)?;
        if actual != self.format(a) {
            return Err(invalid("source memory format changed"));
        }
        let inventory = inspect_snapshot(&root).map_err(copy_error)?;
        let mut plan = TransferPlan {
            protocol: PROTOCOL.into(),
            source: a.namespace.clone(),
            target: b.namespace.clone(),
            source_revision: before.revision,
            target_revision: after.revision,
            source_backend: hash(source)?,
            target_backend: hash(target)?,
            inventory,
            target_format: self.format(b),
            fingerprint: String::new(),
        };
        plan.fingerprint = hash(&plan)?;
        Ok((plan, before, after))
    }
    pub(crate) fn plan_transfer(&self, source: &Value, target: &Value) -> Result<TransferPlan> {
        let (a, b, _) = Self::input(source, target)?;
        let _leases = self.leases(&a.namespace, &b.namespace)?;
        Ok(self.plan_locked(&a, &b, source, target)?.0)
    }
    pub(crate) fn transfer(&self, command: &str) -> Result<Option<TransferReceipt>> {
        if !command_id(command) {
            return Err(invalid("invalid memory transfer command ID"));
        }
        let Some(db) = self.catalog(false)? else {
            return Ok(None);
        };
        let Some(record) = store::record(&db, command)? else {
            return Ok(None);
        };
        if let Some(result) = record.result {
            return Ok(Some(result));
        }
        let source = store::location(&db, &record.intent.plan.source)?.ok_or_else(unavailable)?;
        let target = store::location(&db, &record.intent.plan.target)?.ok_or_else(unavailable)?;
        Ok(Some(TransferReceipt {
            protocol: PROTOCOL.into(),
            command_id: command.into(),
            fingerprint: record.intent.plan.fingerprint.clone(),
            phase: record.phase,
            plan: record.intent.plan,
            source: (&source).into(),
            target: (&target).into(),
        }))
    }
    pub(crate) fn prepare_transfer(
        &self,
        command: &str,
        source: &Value,
        target: &Value,
        fingerprint: &str,
    ) -> Result<PreparedTransfer> {
        if !command_id(command) || !digest(fingerprint) {
            return Err(invalid("invalid memory transfer command or fingerprint"));
        }
        let (a, b, input) = Self::input(source, target)?;
        // Completed commands are immutable readbacks, even after a later move.
        if let Some(db) = self.catalog(false)?
            && let Some(record) = store::record(&db, command)?
        {
            if record.intent.input != input || record.intent.plan.fingerprint != fingerprint {
                return Err(HostError::Control(ControlError::CommandConflict));
            }
            if record.result.is_some() {
                return Ok(PreparedTransfer {
                    record,
                    _leases: vec![],
                });
            }
        }
        let leases = self.leases(&a.namespace, &b.namespace)?;
        let mut db = self.catalog(true)?.ok_or_else(unavailable)?;
        let record = if let Some(record) = store::record(&db, command)? {
            if record.intent.input != input || record.intent.plan.fingerprint != fingerprint {
                return Err(HostError::Control(ControlError::CommandConflict));
            }
            record
        } else {
            let (plan, source, target) = self.plan_locked(&a, &b, source, target)?;
            if plan.fingerprint != fingerprint {
                return Err(HostError::Control(ControlError::Conflict {
                    expected: Some(plan.source_revision),
                    actual: Some(source.revision),
                }));
            }
            let generation = storage::hash(
                nofy_tool_protocol::ToolCallId::new_v7()
                    .to_string()
                    .as_bytes(),
            );
            let record = Record {
                command: command.into(),
                intent: Intent {
                    plan,
                    input,
                    source,
                    target,
                    generation,
                    staged: None,
                },
                phase: "preparing".into(),
                result: None,
            };
            store::reserve(&mut db, &record)?;
            record
        };
        if record.result.is_some() {
            return Ok(PreparedTransfer {
                record,
                _leases: leases,
            });
        }
        self.build_prepared(record, leases)
    }
    pub(crate) fn resume_transfer(
        &self,
        command: &str,
        fingerprint: &str,
    ) -> Result<PreparedTransfer> {
        if !command_id(command) {
            return Err(invalid("invalid memory transfer command"));
        }
        let db = self.catalog(false)?.ok_or(HostError::NotFound)?;
        let record = store::record(&db, command)?.ok_or(HostError::NotFound)?;
        if record.intent.plan.fingerprint != fingerprint {
            return Err(HostError::Control(ControlError::CommandConflict));
        }
        if record.result.is_some() {
            return Ok(PreparedTransfer {
                record,
                _leases: vec![],
            });
        }
        let leases = self.leases(&record.intent.plan.source, &record.intent.plan.target)?;
        let record = store::record(&db, command)?.ok_or(HostError::NotFound)?;
        if record.result.is_some() {
            return Ok(PreparedTransfer {
                record,
                _leases: leases,
            });
        }
        self.build_prepared(record, leases)
    }
    fn build_prepared(
        &self,
        mut record: Record,
        leases: Vec<control::MemoryLease>,
    ) -> Result<PreparedTransfer> {
        let mut db = self.catalog(true)?.ok_or_else(unavailable)?;
        store::verify_pending(&db, &record)?;
        self.control.seal_namespace(&record.intent.plan.source)?;
        self.control.seal_namespace(&record.intent.plan.target)?;
        point("intent");
        let root = record.intent.source.root(&self.root)?;
        if inspect_snapshot(&root).map_err(copy_error)? != record.intent.plan.inventory {
            return Err(invalid("original memory snapshot changed during transfer"));
        }
        let mut stage = self.root.join(".transfers").join(&record.intent.generation);
        if record.intent.staged.is_none() && stage.try_exists().map_err(storage::unavailable)? {
            // Never overwrite or erase an incomplete previous generation.
            record.intent.generation = storage::hash(
                nofy_tool_protocol::ToolCallId::new_v7()
                    .to_string()
                    .as_bytes(),
            );
            stage = self.root.join(".transfers").join(&record.intent.generation);
            store::restage(&mut db, &record)?;
        }
        if record.intent.staged.is_none() {
            let stage = directory(&stage)?;
            storage::atomic(
                &stage.join("owner.json"),
                encode(&(
                    PROTOCOL,
                    &record.command,
                    &record.intent.plan.fingerprint,
                    &record.intent.generation,
                ))?
                .as_bytes(),
                0o600,
                false,
            )?;
            let copied = copy_snapshot(&root, &stage.join("store"), &record.intent.plan.inventory)
                .map_err(copy_error)?;
            storage::atomic(
                &stage.join("store/schema.json"),
                encode(&record.intent.plan.target_format)?.as_bytes(),
                0o600,
                false,
            )?;
            record.intent.staged = Some(copied);
            record.phase = "prepared".into();
            store::prepared(&mut db, &record)?;
        }
        self.verify_stage(&record)?;
        point("prepared");
        Ok(PreparedTransfer {
            record,
            _leases: leases,
        })
    }
    fn verify_stage(&self, record: &Record) -> Result<()> {
        let stage = self.root.join(".transfers").join(&record.intent.generation);
        let owner: Value =
            serde_json::from_slice(&storage::read(&stage.join("owner.json"), 16384)?)
                .map_err(storage::unavailable)?;
        if owner
            != json!([
                PROTOCOL,
                record.command,
                record.intent.plan.fingerprint,
                record.intent.generation
            ])
        {
            return Err(unavailable());
        }
        let actual = inspect_snapshot(&stage.join("store")).map_err(copy_error)?;
        if Some(&actual) != record.intent.staged.as_ref()
            || actual.content_digest != record.intent.plan.inventory.content_digest
        {
            return Err(unavailable());
        }
        let format: Value =
            serde_json::from_slice(&storage::read(&stage.join("store/schema.json"), 8192)?)
                .map_err(storage::unavailable)?;
        if format != record.intent.plan.target_format {
            return Err(unavailable());
        }
        Ok(())
    }
    pub(crate) fn publish_transfer(&self, prepared: PreparedTransfer) -> Result<TransferReceipt> {
        let record = &prepared.record;
        if let Some(result) = &record.result {
            return Ok(result.clone());
        }
        self.verify_stage(record)?;
        if inspect_snapshot(&record.intent.source.root(&self.root)?).map_err(copy_error)?
            != record.intent.plan.inventory
        {
            return Err(unavailable());
        }
        let mut db = self.catalog(true)?.ok_or_else(unavailable)?;
        let result = store::publish(&mut db, record)?;
        point("published");
        self.retire_namespaces(&[&record.intent.plan.source, &record.intent.plan.target])?;
        Ok(result)
    }
    pub(crate) fn abort_transfer(
        &self,
        command: &str,
        fingerprint: &str,
    ) -> Result<TransferReceipt> {
        let db = self.catalog(false)?.ok_or(HostError::NotFound)?;
        let record = store::record(&db, command)?.ok_or(HostError::NotFound)?;
        if record.intent.plan.fingerprint != fingerprint {
            return Err(HostError::Control(ControlError::CommandConflict));
        }
        if let Some(result) = record.result {
            return if result.phase == "aborted" {
                Ok(result)
            } else {
                Err(invalid("published memory requires a reverse transfer"))
            };
        }
        let _leases = self.leases(&record.intent.plan.source, &record.intent.plan.target)?;
        store::verify_pending(&db, &record)?;
        self.control.seal_namespace(&record.intent.plan.source)?;
        self.control.seal_namespace(&record.intent.plan.target)?;
        let mut db = self.catalog(true)?.ok_or_else(unavailable)?;
        let result = store::abort(&mut db, &record)?;
        self.retire_namespaces(&[&record.intent.plan.source, &record.intent.plan.target])?;
        Ok(result)
    }
    fn retire_namespaces(&self, namespaces: &[&str]) -> Result<()> {
        let mut clients = self.clients.lock().map_err(|_| unavailable())?;
        clients.retain(|key, _| {
            !namespaces
                .iter()
                .any(|name| key.starts_with(&format!("{name}:")))
        });
        Ok(())
    }
}
