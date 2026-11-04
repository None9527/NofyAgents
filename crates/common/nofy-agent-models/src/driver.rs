use crate::{
    connection::Connection,
    encoded,
    execution::{Binding, Session},
    failure,
    program::Protocol,
    sse::{Decoder, Frame},
};
use futures::{Stream, StreamExt};
use nofy_agent_runtime::{
    Error, Message, Model, ModelCapabilities, ModelChunk, ModelDelta, ModelRequest, ModelResponse,
    ModelStream, RunContext, model::ModelRequestBound,
};
use serde::Deserialize;
use serde_json::{Value, json};
use std::{
    pin::Pin,
    sync::Arc,
    task::{Context, Poll},
    time::Duration,
};
use tokio::sync::{Semaphore, mpsc};
use tokio_util::sync::CancellationToken;

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Exchange {
    path: String,
    body: Value,
    mode: Mode,
    state: Value,
}
#[derive(Deserialize)]
#[serde(rename_all = "snake_case")]
enum Mode {
    Json,
    Sse,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Reduction {
    state: Value,
    deltas: Vec<ModelDelta>,
    finished: bool,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Finished {
    response: Option<ModelResponse>,
    next: Option<Exchange>,
    #[serde(default)]
    input_tokens: u64,
    #[serde(default)]
    output_tokens: u64,
}
pub(crate) struct ProgrammedModel {
    pub program: Arc<Binding>,
    pub connection: Arc<Connection>,
    pub model: String,
    pub workers: Arc<Semaphore>,
}
struct OutputStream {
    rx: mpsc::Receiver<Result<ModelChunk, Error>>,
    cancel: CancellationToken,
}
impl Stream for OutputStream {
    type Item = Result<ModelChunk, Error>;
    fn poll_next(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Option<Self::Item>> {
        self.rx.poll_recv(cx)
    }
}
impl Drop for OutputStream {
    fn drop(&mut self) {
        self.cancel.cancel();
    }
}

#[async_trait::async_trait]
impl Model for ProgrammedModel {
    async fn validate_live_history(&self, messages: &[Message]) -> Result<(), Error> {
        self.program.history(messages).await
    }
    fn capabilities(&self) -> ModelCapabilities {
        self.program.capabilities.clone()
    }
    fn calls_used(&self, response: &ModelResponse) -> Option<u64> {
        response
            .info
            .provider
            .get("_model_runtime")?
            .get("calls")?
            .as_u64()
    }
    async fn request_bound(
        &self,
        request: &ModelRequest,
        context: &RunContext,
    ) -> Result<ModelRequestBound, Error> {
        let limits = self.connection.config.endpoint_limits.get(&self.model);
        let admission = self
            .program
            .admit(request, &self.model, limits, context.cancel.clone())
            .await?;
        let calls = admission.max_requests;
        Ok(ModelRequestBound {
            max_calls: calls,
            max_input_tokens: limits.map(|v| v.max_input_tokens * calls),
            max_output_tokens: admission
                .max_output_tokens
                .or_else(|| limits.map(|v| v.max_output_tokens))
                .map(|n| n * calls),
        })
    }
    async fn complete(
        &self,
        request: ModelRequest,
        context: &RunContext,
    ) -> Result<ModelResponse, Error> {
        let mut stream = self.stream(request, context).await?;
        while let Some(chunk) = stream.next().await {
            if let ModelChunk::Completed(response) = chunk? {
                return Ok(response);
            }
        }
        Err(failure("missing_completion"))
    }
    async fn stream(
        &self,
        request: ModelRequest,
        context: &RunContext,
    ) -> Result<ModelStream, Error> {
        if context.cancel.is_cancelled() {
            return Err(Error::Cancelled);
        }
        self.validate_settings(&request.settings)?;
        encoded(&request, self.program.limits.max_input_bytes)?;
        let admission = self
            .program
            .admit(
                &request,
                &self.model,
                self.connection.config.endpoint_limits.get(&self.model),
                context.cancel.clone(),
            )
            .await?;
        let program = self.program.clone();
        let connection = self.connection.clone();
        let model = self.model.clone();
        let workers = self.workers.clone();
        let cancel = context.cancel.child_token();
        let task_cancel = cancel.clone();
        let (tx, rx) = mpsc::channel(16);
        tokio::spawn(async move {
            let acquire = async {
                let local = connection
                    .slots
                    .clone()
                    .acquire_owned()
                    .await
                    .map_err(|_| failure("closed"))?;
                let global = workers
                    .acquire_owned()
                    .await
                    .map_err(|_| failure("closed"))?;
                Ok::<_, Error>((local, global))
            };
            let permits = tokio::select! {biased; _=task_cancel.cancelled()=>{let _=tx.send(Err(Error::Cancelled)).await;return;},result=acquire=>match result {
                Ok(permits)=>permits,Err(error)=>{let _=tx.send(Err(error)).await;return;}
            }};
            let session = Session::start(
                program.program.clone(),
                program.executor.clone(),
                task_cancel.clone(),
            );
            let operation = execute(
                &session,
                &program,
                &connection,
                &model,
                request,
                admission,
                &tx,
            );
            let result = tokio::select! {biased;
                _=task_cancel.cancelled()=>Err(Error::Cancelled),
                result=tokio::time::timeout(Duration::from_millis(connection.config.timeout_ms),operation)=>
                    result.unwrap_or_else(|_|Err(failure("deadline"))),
            };
            // An abandoned receiver or expired outer operation cannot release
            // admission while its blocking protocol step is still executing.
            session.close().await;
            drop(permits);
            if let Err(error) = result {
                let _ = tx.send(Err(error)).await;
            }
        });
        Ok(Box::pin(OutputStream { rx, cancel }))
    }
}
async fn reduce(
    session: &Session,
    program: &Protocol,
    state: Value,
    frame: Frame,
    tx: &mpsc::Sender<Result<ModelChunk, Error>>,
) -> Result<Reduction, Error> {
    let value = session
        .step(json!({"phase":"event","state":state,"frame":frame}))
        .await?;
    let reduction: Reduction =
        serde_json::from_value(value).map_err(|_| failure("event_contract"))?;
    encoded(&reduction.state, program.limits.max_state_bytes)?;
    encoded(&reduction.deltas, program.limits.max_frame_bytes)?;
    for delta in &reduction.deltas {
        tx.send(Ok(ModelChunk::Delta(delta.clone())))
            .await
            .map_err(|_| Error::Cancelled)?;
    }
    Ok(reduction)
}
fn tokens(total: &mut u64, value: u64) -> Result<(), Error> {
    *total = total
        .checked_add(value)
        .ok_or_else(|| failure("token_overflow"))?;
    Ok(())
}
async fn execute(
    session: &Session,
    program: &Protocol,
    connection: &Connection,
    model: &str,
    request: ModelRequest,
    admission: crate::program::Admission,
    tx: &mpsc::Sender<Result<ModelChunk, Error>>,
) -> Result<(), Error> {
    let mut exchange: Exchange = serde_json::from_value(
        session
            .step(json!({"phase":"request","model":model,"request":request,"admission":admission}))
            .await?,
    )
    .map_err(|_| failure("request_contract"))?;
    let (mut input_tokens, mut output_tokens, mut frames, mut total_bytes) = (0, 0, 0u64, 0usize);
    for calls in 1..=admission.max_requests {
        encoded(&exchange.state, program.limits.max_state_bytes)?;
        let endpoint = connection.endpoint(&exchange.path)?;
        let body = encoded(&exchange.body, program.limits.max_input_bytes)?;
        let (client, headers) = connection.client().await?;
        let response = client
            .post(endpoint)
            .headers(headers)
            .header("content-type", "application/json")
            .header(
                "accept",
                match exchange.mode {
                    Mode::Sse => "text/event-stream",
                    Mode::Json => "application/json",
                },
            )
            .body(body)
            .send()
            .await
            .map_err(|_| failure("transport"))?;
        let status = response.status();
        if !status.is_success() {
            return Err(crate::errors::http_failure(
                response,
                session,
                program.limits.max_frame_bytes.min(
                    program
                        .limits
                        .max_response_bytes
                        .saturating_sub(total_bytes),
                ),
                connection.config.idle_timeout_ms,
            )
            .await);
        }
        let mut bytes = response.bytes_stream();
        let mut decoder = Decoder::new(program.limits.max_frame_bytes);
        let mut json_body = Vec::new();
        let mut finished = false;
        while let Some(chunk) = tokio::time::timeout(
            Duration::from_millis(connection.config.idle_timeout_ms),
            bytes.next(),
        )
        .await
        .map_err(|_| failure("idle_deadline"))?
        {
            let chunk = chunk.map_err(|_| failure("response_transport"))?;
            total_bytes = total_bytes
                .checked_add(chunk.len())
                .ok_or_else(|| failure("response_limit"))?;
            if total_bytes > program.limits.max_response_bytes {
                return Err(failure("response_limit"));
            }
            match exchange.mode {
                Mode::Json => {
                    if chunk.len()
                        > program
                            .limits
                            .max_frame_bytes
                            .saturating_sub(json_body.len())
                    {
                        return Err(failure("frame_limit"));
                    }
                    json_body.extend_from_slice(&chunk);
                }
                Mode::Sse => {
                    for byte in chunk {
                        if let Some(frame) = decoder.byte(byte)? {
                            frames += 1;
                            if frames > program.limits.max_frames {
                                return Err(failure("frame_count"));
                            }
                            let reduction =
                                reduce(session, program, exchange.state, frame, tx).await?;
                            exchange.state = reduction.state;
                            finished = reduction.finished;
                            if finished {
                                break;
                            }
                        }
                    }
                    if finished {
                        break;
                    }
                }
            }
        }
        if matches!(exchange.mode, Mode::Json) {
            frames += 1;
            if frames > program.limits.max_frames {
                return Err(failure("frame_count"));
            }
            let frame = Frame {
                event: "json".into(),
                data: String::from_utf8(json_body).map_err(|_| failure("invalid_utf8"))?,
            };
            let reduction = reduce(session, program, exchange.state, frame, tx).await?;
            exchange.state = reduction.state;
            finished = reduction.finished;
        }
        if !finished {
            return Err(failure("truncated_stream"));
        }
        drop(bytes);
        let value = session
            .step(json!({"phase":"finish","state":exchange.state}))
            .await?;
        let result: Finished =
            serde_json::from_value(value).map_err(|_| failure("finish_contract"))?;
        match (result.response, result.next) {
            (Some(mut response), None) => {
                if result.input_tokens != 0 || result.output_tokens != 0 {
                    return Err(failure("ambiguous_usage"));
                }
                tokens(&mut input_tokens, response.input_tokens)?;
                tokens(&mut output_tokens, response.output_tokens)?;
                response.input_tokens = input_tokens;
                response.output_tokens = output_tokens;
                if !response.info.provider.is_object() {
                    response.info.provider = json!({"native":response.info.provider});
                }
                response.info.provider["_model_runtime"] = json!({"calls":calls});
                encoded(&response, program.limits.max_state_bytes)?;
                tx.send(Ok(ModelChunk::Completed(response)))
                    .await
                    .map_err(|_| Error::Cancelled)?;
                return Ok(());
            }
            (None, Some(next)) => {
                tokens(&mut input_tokens, result.input_tokens)?;
                tokens(&mut output_tokens, result.output_tokens)?;
                exchange = next;
            }
            _ => return Err(failure("finish_contract")),
        }
    }
    Err(failure("request_count"))
}
