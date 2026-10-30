//! Versioned queue DTOs. Default generic arguments preserve the original Rust
//! API and wire format; optional input is transparent when reading v1 payloads.
use super::*;
use crate::program::{ExecutionSnapshot, ProgramSnapshot};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct JobSubmission<S = CompilationSnapshot, I = PendingInterjection<crate::InputPart>> {
    pub schema_version: u32,
    pub run_id: String,
    pub thread_id: String,
    pub snapshot: S,
    pub composition_digest: String,
    pub input: I,
}
pub type ProgramSubmission =
    JobSubmission<ExecutionSnapshot, Option<PendingInterjection<crate::InputPart>>>;
pub type ExecutionSubmission =
    JobSubmission<RunSnapshot, Option<PendingInterjection<crate::InputPart>>>;

fn identity(
    version: u32,
    expected: u32,
    run: &str,
    thread: &str,
    name: &str,
    hash: &str,
) -> Result<(), Error> {
    if version != expected
        || run.trim().is_empty()
        || run.len() > 4096
        || thread.trim().is_empty()
        || thread.len() > 4096
        || name.trim().is_empty()
        || hash.len() != 64
        || !hash.bytes().all(|c| c.is_ascii_hexdigit())
    {
        return Err(Error::Composition(
            "invalid queued job identity/version".into(),
        ));
    }
    Ok(())
}
impl JobSubmission {
    pub fn for_agent(
        compiled: &CompiledAgent,
        thread_id: impl Into<String>,
        run_id: impl Into<String>,
        input: PendingInterjection<crate::InputPart>,
    ) -> Self {
        Self {
            schema_version: 1,
            run_id: run_id.into(),
            thread_id: thread_id.into(),
            snapshot: compiled.snapshot.clone(),
            composition_digest: digest(compiled.agent.composition_identity().as_bytes()),
            input,
        }
    }
    pub(super) fn validate(&self) -> Result<(), Error> {
        crate::mailbox::validate_message(&self.input)?;
        identity(
            self.schema_version,
            1,
            &self.run_id,
            &self.thread_id,
            &self.snapshot.agent.name,
            &self.composition_digest,
        )?;
        if self.snapshot.version != 1
            || serde_json::to_vec(self).map_err(db_error)?.len() > 2 * 1024 * 1024
        {
            return Err(Error::Composition(
                "invalid Agent snapshot or job exceeds 2 MiB".into(),
            ));
        }
        Ok(())
    }
    pub(super) fn stored(self) -> ExecutionSubmission {
        ExecutionSubmission {
            schema_version: self.schema_version,
            run_id: self.run_id,
            thread_id: self.thread_id,
            snapshot: RunSnapshot::Agent(self.snapshot),
            composition_digest: self.composition_digest,
            input: Some(self.input),
        }
    }
}
impl ProgramSubmission {
    pub fn for_program(
        compiled: &CompiledProgram,
        thread_id: impl Into<String>,
        run_id: impl Into<String>,
        input: Option<PendingInterjection<crate::InputPart>>,
    ) -> Result<Self, Error> {
        let submission = Self {
            schema_version: 2,
            run_id: run_id.into(),
            thread_id: thread_id.into(),
            snapshot: compiled.snapshot.clone(),
            composition_digest: digest(compiled.composition_identity().as_bytes()),
            input,
        };
        submission.validate()?;
        Ok(submission)
    }
    pub(super) fn validate(&self) -> Result<(), Error> {
        identity(
            self.schema_version,
            2,
            &self.run_id,
            &self.thread_id,
            self.snapshot.name(),
            &self.composition_digest,
        )?;
        if let Some(input) = &self.input {
            crate::mailbox::validate_message(input)?;
        }
        if self.snapshot.version != 2
            || self.snapshot.is_agent() != self.input.is_some()
            || serde_json::to_vec(&self.snapshot).map_err(db_error)?.len() > 16 * 1024 * 1024
            || serde_json::to_vec(self).map_err(db_error)?.len() > 18 * 1024 * 1024
        {
            return Err(Error::Composition(
                "Program job requires v2 snapshot, input only for Agent, and at most 18 MiB".into(),
            ));
        }
        Ok(())
    }
    pub(super) fn stored(self) -> ExecutionSubmission {
        ExecutionSubmission {
            schema_version: self.schema_version,
            run_id: self.run_id,
            thread_id: self.thread_id,
            snapshot: RunSnapshot::Program(self.snapshot),
            composition_digest: self.composition_digest,
            input: self.input,
        }
    }
}
impl ExecutionSubmission {
    pub(super) fn validate(&self) -> Result<(), Error> {
        match &self.snapshot {
            RunSnapshot::Agent(_) => self.clone().legacy()?.validate(),
            RunSnapshot::Program(_) => self.clone().program()?.validate(),
        }
    }
    pub(super) fn thread_key(&self) -> String {
        crate::state::checkpoint_key(self.snapshot.name(), &self.thread_id)
    }
    pub(super) fn legacy(self) -> Result<JobSubmission, Error> {
        let RunSnapshot::Agent(snapshot) = self.snapshot else {
            return Err(Error::Checkpoint(
                "program job requires program_job/execution_job".into(),
            ));
        };
        if self.schema_version != 1 {
            return Err(Error::Checkpoint("legacy job version changed".into()));
        }
        Ok(JobSubmission {
            schema_version: 1,
            run_id: self.run_id,
            thread_id: self.thread_id,
            snapshot,
            composition_digest: self.composition_digest,
            input: self
                .input
                .ok_or_else(|| Error::Checkpoint("Agent job input missing".into()))?,
        })
    }
    pub(super) fn program(self) -> Result<ProgramSubmission, Error> {
        let RunSnapshot::Program(snapshot) = self.snapshot else {
            return Err(Error::Checkpoint(
                "legacy job requires job/execution_job".into(),
            ));
        };
        if self.schema_version != 2 {
            return Err(Error::Checkpoint("Program job version changed".into()));
        }
        Ok(ProgramSubmission {
            schema_version: 2,
            run_id: self.run_id,
            thread_id: self.thread_id,
            snapshot,
            composition_digest: self.composition_digest,
            input: self.input,
        })
    }
    pub(super) fn restore(
        &self,
        registry: &crate::registry::ModuleRegistry,
    ) -> Result<ExecutionPlan, Error> {
        self.validate()?;
        match &self.snapshot {
            RunSnapshot::Agent(snapshot) => Ok(ExecutionPlan::legacy(&snapshot.restore(registry)?)),
            RunSnapshot::Program(snapshot) => {
                Ok(ExecutionPlan::program(&snapshot.restore(registry)?))
            }
        }
    }
    pub(super) fn initial_input(&self) -> RunInput {
        match &self.input {
            None => RunInput::default(),
            Some(input) if input.attachments.is_empty() => RunInput::new(&input.text),
            Some(input) => RunInput::multimodal(
                std::iter::once(crate::InputPart::Text {
                    text: input.text.clone(),
                })
                .chain(input.attachments.iter().cloned())
                .collect(),
            ),
        }
    }
    pub(super) fn next_turn(
        root: RunSnapshot,
        run_id: String,
        thread_id: String,
        snapshot: CompilationSnapshot,
        hash: String,
        message: PendingInterjection<crate::InputPart>,
    ) -> Result<Self, Error> {
        let expected = match &root {
            RunSnapshot::Agent(snapshot) => snapshot,
            RunSnapshot::Program(ExecutionSnapshot {
                program: ProgramSnapshot::Agent { snapshot },
                ..
            }) => snapshot,
            _ => {
                return Err(Error::Composition(
                    "model-free root cannot enqueue an Agent turn".into(),
                ));
            }
        };
        if serde_json::to_value(expected).map_err(db_error)?
            != serde_json::to_value(snapshot).map_err(db_error)?
        {
            return Err(Error::Composition("queued next turn must retain its runtime thread composition; start a new thread for a different published configuration".into()));
        }
        let schema_version = if matches!(root, RunSnapshot::Agent(_)) {
            1
        } else {
            2
        };
        Ok(Self {
            schema_version,
            run_id,
            thread_id,
            snapshot: root,
            composition_digest: hash,
            input: Some(message),
        })
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum JobStatus {
    Queued,
    Initializing,
    Running,
    Waiting,
    Closed,
    Cancelled,
    Abandoned,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct JobRecord<J = JobSubmission> {
    pub sequence: u64,
    pub digest: String,
    pub submission: J,
    pub status: JobStatus,
}
pub type ProgramJobRecord = JobRecord<ProgramSubmission>;
pub type ExecutionJobRecord = JobRecord<ExecutionSubmission>;
impl ExecutionJobRecord {
    pub(super) fn legacy(self) -> Result<JobRecord, Error> {
        Ok(JobRecord {
            sequence: self.sequence,
            digest: self.digest,
            submission: self.submission.legacy()?,
            status: self.status,
        })
    }
    pub(super) fn program(self) -> Result<ProgramJobRecord, Error> {
        Ok(JobRecord {
            sequence: self.sequence,
            digest: self.digest,
            submission: self.submission.program()?,
            status: self.status,
        })
    }
}
