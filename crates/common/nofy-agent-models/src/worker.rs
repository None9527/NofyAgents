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
    collections::VecDeque,
    io::{Read, Write},
    sync::Arc,
};
use tokio_util::sync::CancellationToken;

pub const PROTOCOL: &str = "nofy.model-program-evaluate/v1";
pub const MAX_FRAME: usize = 64 * 1024 * 1024;
pub const CACHE_ENTRIES: usize = 8;
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
#[derive(Default)]
pub(crate) struct Cache(VecDeque<(String, Compiled)>);
impl Cache {
    pub(crate) fn prepare(&mut self, id: String, program: Arc<Protocol>) -> Result<(), Error> {
        if !valid_id(&id) || content_digest(&*program)? != id {
            return Err(failure("program_identity"));
        }
        if let Some(index) = self.0.iter().position(|(key, _)| key == &id) {
            if let Some(entry) = self.0.remove(index) {
                self.0.push_back(entry);
            }
            return Ok(());
        }
        // Evict before compiling to bound simultaneously retained definitions.
        if self.0.len() == CACHE_ENTRIES {
            self.0.pop_front();
        }
        self.0.push_back((id, Compiled::new(program)?));
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
        let index = self
            .0
            .iter()
            .position(|(key, _)| key == id)
            .ok_or_else(|| failure("program_missing"))?;
        let entry = self
            .0
            .remove(index)
            .ok_or_else(|| failure("program_missing"))?;
        let result = entry.1.evaluate(input, spent, cap, cancel);
        self.0.push_back(entry);
        result
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
        }
        .map_err(Failure::from);
        let reply = Reply {
            protocol: PROTOCOL.into(),
            sequence: last,
            cache: cache.0.iter().map(|(id, _)| id.clone()).collect(),
            result,
        };
        let bytes = encode(&reply)?;
        output.write_all(&(bytes.len() as u32).to_le_bytes())?;
        output.write_all(&bytes)?;
        output.flush()?;
    }
    Ok(())
}
