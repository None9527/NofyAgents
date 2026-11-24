//! Private framed evaluator ABI. Call `run` only after applying confinement.
use crate::{
    encoded,
    execution::Evaluation,
    failure,
    program::{Compiled, Protocol},
};
use nofy_agent_runtime::{Error, model::ModelFailure, system::content_digest};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::{
    collections::{BTreeMap, VecDeque},
    io::{Read, Write},
    sync::Arc,
};
use tokio_util::sync::CancellationToken;

pub const PROTOCOL: &str = "nofy.model-program-evaluate/v1";
pub const MAX_FRAME: usize = 64 * 1024 * 1024;
pub const CACHE_ENTRIES: usize = 8;
pub const MAX_STREAMS: usize = 32;

#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Request {
    pub protocol: String,
    pub sequence: u64,
    pub operation: Operation,
}

#[derive(Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case", deny_unknown_fields)]
pub enum Operation {
    Prepare {
        id: String,
        definition: Protocol,
    },
    Evaluate {
        id: String,
        input: Value,
        spent: u64,
        cap: usize,
    },
    BeginStream {
        id: String,
        stream_id: u64,
        state: Value,
        cap: usize,
    },
    PushEvent {
        id: String,
        stream_id: u64,
        frame: Value,
        spent: u64,
        cap: usize,
    },
    FinishStream {
        id: String,
        stream_id: u64,
        spent: u64,
        cap: usize,
    },
    AbortStream {
        stream_id: u64,
    },
}

#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Reply {
    pub protocol: String,
    pub sequence: u64,
    pub cache: Vec<String>,
    pub result: Result<Option<Evaluation>, Failure>,
}

#[derive(Serialize, Deserialize)]
#[serde(
    tag = "kind",
    content = "value",
    rename_all = "snake_case",
    deny_unknown_fields
)]
pub enum Failure {
    Model(ModelFailure),
    Cancelled,
    Rejected,
}

impl From<Error> for Failure {
    fn from(error: Error) -> Self {
        match error {
            Error::ModelFailure(value) => Self::Model(value),
            Error::Cancelled => Self::Cancelled,
            _ => Self::Rejected,
        }
    }
}

impl Failure {
    pub fn into_runtime(self) -> Error {
        match self {
            Self::Model(value) => value.into(),
            Self::Cancelled => Error::Cancelled,
            Self::Rejected => failure("worker_rejected"),
        }
    }
}

pub fn encode(value: &impl Serialize) -> Result<Vec<u8>, Error> {
    encoded(value, MAX_FRAME)
}

pub fn valid_id(id: &str) -> bool {
    id.len() == 64
        && id
            .bytes()
            .all(|b| b.is_ascii_digit() || (b'a'..=b'f').contains(&b))
}

struct StreamEntry {
    program_id: String,
    state: rhai::Dynamic,
}

#[derive(Default)]
pub(crate) struct Cache {
    programs: VecDeque<(String, Compiled)>,
    streams: BTreeMap<u64, StreamEntry>,
}

impl Cache {
    fn take_program(&mut self, id: &str) -> Result<(String, Compiled), Error> {
        let index = self
            .programs
            .iter()
            .position(|(key, _)| key == id)
            .ok_or_else(|| failure("program_missing"))?;
        self.programs
            .remove(index)
            .ok_or_else(|| failure("program_missing"))
    }

    pub(crate) fn prepare(&mut self, id: String, program: Arc<Protocol>) -> Result<(), Error> {
        if !valid_id(&id) || content_digest(&*program)? != id {
            return Err(failure("program_identity"));
        }
        if let Some(index) = self.programs.iter().position(|(key, _)| key == &id) {
            if let Some(entry) = self.programs.remove(index) {
                self.programs.push_back(entry);
            }
            return Ok(());
        }
        // Evict before compiling to bound simultaneously retained definitions.
        if self.programs.len() == CACHE_ENTRIES {
            self.programs.pop_front();
        }
        self.programs.push_back((id, Compiled::new(program)?));
        Ok(())
    }

    pub(crate) fn evaluate(
        &mut self,
        id: &str,
        input: Value,
        spent: u64,
        cap: usize,
        cancel: CancellationToken,
    ) -> Result<Evaluation, Error> {
        let entry = self.take_program(id)?;
        let result = entry.1.evaluate(input, spent, cap, cancel);
        self.programs.push_back(entry);
        result
    }

    pub(crate) fn begin_stream(
        &mut self,
        id: &str,
        stream_id: u64,
        state: Value,
        cap: usize,
    ) -> Result<(), Error> {
        if stream_id == 0 || self.streams.contains_key(&stream_id) {
            return Err(failure("stream_contract"));
        }
        if self.streams.len() >= MAX_STREAMS {
            return Err(failure("stream_limit"));
        }
        let entry = self.take_program(id)?;
        let dynamic = entry.1.begin_stream(state, cap);
        self.programs.push_back(entry);
        let dynamic = dynamic?;
        self.streams.insert(
            stream_id,
            StreamEntry {
                program_id: id.to_owned(),
                state: dynamic,
            },
        );
        Ok(())
    }

    pub(crate) fn push_event(
        &mut self,
        id: &str,
        stream_id: u64,
        frame: Value,
        spent: u64,
        cap: usize,
        cancel: CancellationToken,
    ) -> Result<Evaluation, Error> {
        let stream = self
            .streams
            .remove(&stream_id)
            .ok_or_else(|| failure("stream_missing"))?;
        if stream.program_id != id {
            return Err(failure("stream_contract"));
        }
        let entry = self.take_program(id)?;
        let result = entry.1.push_event(stream.state, frame, spent, cap, cancel);
        self.programs.push_back(entry);
        let (new_state, evaluation) = result?;
        self.streams.insert(
            stream_id,
            StreamEntry {
                program_id: stream.program_id,
                state: new_state,
            },
        );
        Ok(evaluation)
    }

    pub(crate) fn finish_stream(
        &mut self,
        id: &str,
        stream_id: u64,
        spent: u64,
        cap: usize,
        cancel: CancellationToken,
    ) -> Result<Evaluation, Error> {
        let stream = self
            .streams
            .remove(&stream_id)
            .ok_or_else(|| failure("stream_missing"))?;
        if stream.program_id != id {
            return Err(failure("stream_contract"));
        }
        let entry = self.take_program(id)?;
        let result = entry.1.finish_stream(stream.state, spent, cap, cancel);
        self.programs.push_back(entry);
        result
    }

    pub(crate) fn abort_stream(&mut self, stream_id: u64) {
        self.streams.remove(&stream_id);
    }
}

fn read(input: &mut impl Read) -> std::io::Result<Option<Vec<u8>>> {
    let mut prefix = [0; 4];
    if input.read(&mut prefix[..1])? == 0 {
        return Ok(None);
    }
    input.read_exact(&mut prefix[1..])?;
    let size = u32::from_le_bytes(prefix) as usize;
    if size == 0 || size > MAX_FRAME {
        return Err(std::io::Error::other("invalid model frame size"));
    }
    let mut bytes = Vec::new();
    bytes
        .try_reserve_exact(size)
        .map_err(std::io::Error::other)?;
    bytes.resize(size, 0);
    input.read_exact(&mut bytes)?;
    Ok(Some(bytes))
}

/// Synchronous, single-threaded entry for an already confined fresh process.
/// No connection, credentials, host context or filesystem resolver is present.
pub fn run() -> Result<(), Box<dyn std::error::Error>> {
    let mut input = std::io::stdin().lock();
    let mut output = std::io::stdout().lock();
    let mut cache = Cache::default();
    let mut last = 0u64;
    while let Some(bytes) = read(&mut input)? {
        let request: Request = serde_json::from_slice(&bytes)?;
        if request.protocol != PROTOCOL || last.checked_add(1) != Some(request.sequence) {
            return Err("model worker protocol/sequence changed".into());
        }
        last = request.sequence;
        let result = match request.operation {
            Operation::Prepare { id, definition } => {
                cache.prepare(id, Arc::new(definition)).map(|_| None)
            }
            Operation::Evaluate {
                id,
                input,
                spent,
                cap,
            } => cache
                .evaluate(&id, input, spent, cap, CancellationToken::new())
                .map(Some),
            Operation::BeginStream {
                id,
                stream_id,
                state,
                cap,
            } => cache.begin_stream(&id, stream_id, state, cap).map(|_| None),
            Operation::PushEvent {
                id,
                stream_id,
                frame,
                spent,
                cap,
            } => cache
                .push_event(&id, stream_id, frame, spent, cap, CancellationToken::new())
                .map(Some),
            Operation::FinishStream {
                id,
                stream_id,
                spent,
                cap,
            } => cache
                .finish_stream(&id, stream_id, spent, cap, CancellationToken::new())
                .map(Some),
            Operation::AbortStream { stream_id } => {
                cache.abort_stream(stream_id);
                Ok(None)
            }
        }
        .map_err(Failure::from);
        let reply = Reply {
            protocol: PROTOCOL.into(),
            sequence: last,
            cache: cache.programs.iter().map(|(id, _)| id.clone()).collect(),
            result,
        };
        let bytes = encode(&reply)?;
        output.write_all(&(bytes.len() as u32).to_le_bytes())?;
        output.write_all(&bytes)?;
        output.flush()?;
    }
    Ok(())
}
