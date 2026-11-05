use super::*;
use std::{process::Stdio, time::Duration};
use tokio::{
    io::{AsyncReadExt, AsyncWriteExt},
    sync::{mpsc, oneshot},
};

pub(in crate::loader) struct Launch {
    pub helper: PathBuf,
    pub profile: process_tree::Bootstrap,
    pub timeout: Duration,
    pub output_limit: usize,
    pub terminal: bool,
    pub rows: u16,
    pub columns: u16,
}
pub(super) enum Command {
    Input {
        id: String,
        bytes: Vec<u8>,
        eof: bool,
        reply: oneshot::Sender<Result<()>>,
    },
    Resize {
        rows: u16,
        columns: u16,
        reply: oneshot::Sender<Result<()>>,
    },
}
impl Manager {
    pub(in crate::loader) async fn start<H: Send + 'static>(
        &self,
        owner: &str,
        resource: &str,
        start_id: &str,
        mut launch: Launch,
        limits: Limits,
        hold: H,
    ) -> Result<Value> {
        limits.validate()?;
        if owner.is_empty()
            || owner.len() > 512
            || resource.is_empty()
            || resource.len() > 1024
            || start_id.is_empty()
            || start_id.len() > 128
            || start_id.chars().any(char::is_control)
            || !(Duration::from_millis(1)..=Duration::from_secs(86400)).contains(&launch.timeout)
            || !(1..=8 * 1024 * 1024).contains(&launch.output_limit)
            || launch.rows == 0
            || launch.columns == 0
            || launch.rows > 1000
            || launch.columns > 1000
        {
            return Err(HostError::Invalid("invalid process session start".into()));
        }
        launch.profile.session = Some(Setup {
            gate_fd: 198,
            terminal: launch.terminal,
            network_fd: limits.network_proxy.as_ref().map(|_| network::FD),
            limits: limits.clone(),
        });
        if let Some(sandbox) = &mut launch.profile.sandbox {
            for (alias, grant) in &mut sandbox.directories {
                let readonly = limits.filesystem_mode == FilesystemMode::ReadOnly
                    || (limits.filesystem_mode == FilesystemMode::WorkspaceWrite
                        && !limits.writable_directories.contains(alias));
                if readonly {
                    grant.access = super::super::directories::Access::ReadOnly;
                }
            }
        }
        if launch
            .profile
            .session
            .as_ref()
            .is_some_and(|s| s.network_fd.is_some())
        {
            for key in [
                "HTTP_PROXY",
                "HTTPS_PROXY",
                "ALL_PROXY",
                "http_proxy",
                "https_proxy",
                "all_proxy",
            ] {
                launch
                    .profile
                    .environment
                    .insert(key.into(), format!("http://127.0.0.1:{}", network::PORT));
            }
            for key in ["NO_PROXY", "no_proxy"] {
                launch.profile.environment.insert(key.into(), String::new());
            }
        }
        let wire = launch.profile.encode()?;
        // Scratch roots and the current parent PID vary on every preparation;
        // immutable resource identity carries their declared authority instead.
        let digest = storage::hash(
            &serde_json::to_vec(&(
                resource,
                &launch.profile.program,
                &launch.profile.arguments,
                &launch.profile.environment,
                &launch.profile.cwd,
                &launch.profile.session,
                launch.timeout.as_millis(),
                launch.output_limit,
                launch.rows,
                launch.columns,
            ))
            .map_err(unavailable)?,
        );
        let session_id =
            storage::hash(&serde_json::to_vec(&(owner, resource, start_id)).map_err(unavailable)?);
        let (ready, result) = oneshot::channel();
        {
            let _gate = self.0.gate.lock().map_err(unavailable)?;
            if self.0.stop.is_cancelled() {
                return Err(unavailable("manager is stopping"));
            }
            if let Some(existing) = self
                .0
                .entries
                .lock()
                .map_err(unavailable)?
                .get(&session_id)
                .cloned()
            {
                let record = existing.record.lock().map_err(unavailable)?;
                if record.launch_digest != digest {
                    return Err(conflict());
                }
                return Ok(record.view(0, 0, 65536));
            }
            let permit = self
                .0
                .slots
                .clone()
                .try_acquire_owned()
                .map_err(|_| unavailable("eight execution owners are active"))?;
            let (commands, inbox) = mpsc::channel(16);
            let live = Arc::new(Live {
                record: Mutex::new(Record {
                    session_id: session_id.clone(),
                    owner: owner.into(),
                    resource: resource.into(),
                    start_id: start_id.into(),
                    revision: 0,
                    state: "starting".into(),
                    terminal: launch.terminal,
                    exit_code: None,
                    error: None,
                    stdout: Bytes {
                        offset: 0,
                        data: vec![],
                    },
                    stderr: Bytes {
                        offset: 0,
                        data: vec![],
                    },
                    inputs: BTreeMap::new(),
                    launch_digest: digest,
                }),
                commands,
                changed: Default::default(),
                stop: CancellationToken::new(),
            });
            self.persist(&live)?;
            self.0
                .entries
                .lock()
                .map_err(unavailable)?
                .insert(session_id.clone(), live.clone());
            let manager = self.clone();
            self.0.tasks.spawn(async move {
                let _permit = permit;
                let _hold = hold;
                run(manager, live, launch, wire, inbox, ready).await;
            });
        }
        result.await.map_err(unavailable)??;
        self.poll(&session_id, owner, resource, 0, 0, 65536)
    }
    pub(in crate::loader) async fn supervise_namespace<H: Send + 'static>(
        &self,
        helper: PathBuf,
        invocation: process_tree::Invocation,
        cancel: CancellationToken,
        hold: H,
        sandbox: process_tree::sandbox::Sandbox,
        limits: Limits,
    ) -> Result<process_tree::Output> {
        let id = nofy_tool_protocol::ToolCallId::new_v7().to_string();
        let owner = format!("one-shot:{id}");
        let launch = Launch {
            helper,
            profile: process_tree::Bootstrap {
                parent_pid: std::process::id(),
                program: invocation.program,
                arguments: invocation.arguments,
                environment: invocation.environment,
                cwd: invocation.cwd,
                sandbox: Some(sandbox),
                session: None,
            },
            timeout: invocation.timeout,
            output_limit: invocation.output_limit,
            terminal: false,
            rows: 24,
            columns: 80,
        };
        let started = self
            .start(&owner, "namespace-one-shot", &id, launch, limits, hold)
            .await?;
        let session = started["session_id"]
            .as_str()
            .ok_or_else(|| unavailable("missing session receipt"))?;
        let live = self.entry(session, &owner, "namespace-one-shot")?;
        let dropped = CancellationToken::new();
        let _drop = dropped.clone().drop_guard();
        let stop = live.stop.clone();
        let observed = live.clone();
        self.0.tasks.spawn(async move {
            let finished=async {loop {let changed=observed.changed.notified();tokio::pin!(changed);changed.as_mut().enable();if observed.record.lock().unwrap_or_else(|e|e.into_inner()).terminal(){break;}changed.await;}};
            tokio::select!{biased;_=cancel.cancelled()=>stop.cancel(),_=dropped.cancelled()=>stop.cancel(),_=finished=>{}}
        });
        let operation = async {
            self.write(
                session,
                &owner,
                "namespace-one-shot",
                "stdin",
                invocation.input,
                true,
            )
            .await?;
            loop {
                let notification = live.changed.notified();
                tokio::pin!(notification);
                notification.as_mut().enable();
                if live.record.lock().map_err(unavailable)?.terminal() {
                    break;
                }
                notification.await;
            }
            Ok::<(), HostError>(())
        };
        let result = operation.await;
        if result.is_err() {
            self.close(session, &owner, "namespace-one-shot").await?;
        }
        result?;
        let r = live.record.lock().map_err(unavailable)?;
        if r.state != "exited" || r.stdout.offset > 0 || r.stderr.offset > 0 {
            return Err(unavailable(
                r.error
                    .as_deref()
                    .unwrap_or("command timed out or output exceeded its limit"),
            ));
        }
        use std::os::unix::process::ExitStatusExt;
        Ok(process_tree::Output {
            status: std::process::ExitStatus::from_raw(r.exit_code.unwrap_or(125) << 8),
            stdout: r.stdout.data.clone(),
            stderr: r.stderr.data.clone(),
        })
    }
}
pub(super) async fn write(
    manager: &Manager,
    id: &str,
    owner: &str,
    resource: &str,
    command_id: &str,
    bytes: Vec<u8>,
    eof: bool,
) -> Result<Value> {
    if command_id.is_empty()
        || command_id.len() > 128
        || command_id.chars().any(char::is_control)
        || bytes.len() > 1024 * 1024
    {
        return Err(HostError::Invalid("invalid process input command".into()));
    }
    let live = manager.entry(id, owner, resource)?;
    let digest = storage::hash(&serde_json::to_vec(&(&bytes, eof)).map_err(unavailable)?);
    {
        let mut record = live.record.lock().map_err(unavailable)?;
        if let Some(existing) = record.inputs.get(command_id) {
            if existing.digest != digest {
                return Err(conflict());
            }
            return Ok(
                json!({"session_id":id,"command_id":command_id,"receipt":existing,"revision":record.revision}),
            );
        }
        if record.terminal() {
            return Err(unavailable("process has ended; input was not sent"));
        }
        if record.inputs.len() >= 4096 {
            return Err(unavailable(
                "input receipt capacity reached; start a new session",
            ));
        }
        record.inputs.insert(
            command_id.into(),
            Receipt {
                digest,
                state: "prepared".into(),
                bytes: bytes.len(),
            },
        );
        record.revision += 1;
    }
    // Durable before delivery; ambiguous outcomes must never cause a second write.
    manager.persist(&live)?;
    let (reply, result) = oneshot::channel();
    live.commands
        .send(Command::Input {
            id: command_id.into(),
            bytes,
            eof,
            reply,
        })
        .await
        .map_err(unavailable)?;
    result.await.map_err(unavailable)??;
    let record = live.record.lock().map_err(unavailable)?;
    Ok(
        json!({"session_id":id,"command_id":command_id,"receipt":record.inputs[command_id],"revision":record.revision}),
    )
}
async fn pump(
    mut reader: io::Reader,
    live: Arc<Live>,
    stderr: bool,
    limit: usize,
) -> std::io::Result<()> {
    let mut buffer = [0; 8192];
    loop {
        let count = reader.read(&mut buffer).await?;
        if count == 0 {
            return Ok(());
        }
        {
            let mut r = live
                .record
                .lock()
                .map_err(|_| std::io::Error::other("session record poisoned"))?;
            if stderr {
                r.stderr.append(&buffer[..count], limit);
            } else {
                r.stdout.append(&buffer[..count], limit);
            }
            r.revision += 1;
        }
        live.changed.notify_waiters();
    }
}
async fn run(
    manager: Manager,
    live: Arc<Live>,
    launch: Launch,
    wire: String,
    mut inbox: mpsc::Receiver<Command>,
    ready: oneshot::Sender<Result<()>>,
) {
    let mut ready = Some(ready);
    let mut network_owner = None;
    let result=async {
        let mut command=tokio::process::Command::new(&launch.helper);
        command.arg(super::super::process_tree::bootstrap::ARG).arg(wire).env_clear().current_dir("/").kill_on_drop(true);
        let mut terminal=if launch.terminal {Some(io::Terminal::open(launch.rows,launch.columns).map_err(unavailable)?)} else {None};
        if let Some(terminal)=&terminal {terminal.configure(&mut command).map_err(unavailable)?;}
        else {command.stdin(Stdio::piped()).stdout(Stdio::piped()).stderr(Stdio::piped());}
        let gate=io::gate(&mut command).map_err(unavailable)?;
        let broker=launch.profile.session.as_ref().and_then(|s|s.limits.network_proxy.clone()).map(|config|network::Broker::prepare(&mut command,config)).transpose()?;
        let mut child=command.spawn().map_err(unavailable)?;
        drop(command);
        if let Some(broker)=broker {
            let stop=CancellationToken::new();let signal=stop.clone();let process=live.stop.clone();
            let task=tokio::spawn(async move {let result=broker.run(signal).await;if result.is_err(){process.cancel();}result});
            network_owner=Some((stop,task));
        }
        let streams=(||->Result<(io::Reader,Option<io::Reader>,io::Writer)>{
            if let Some(terminal)=&mut terminal {
                terminal.release_slave().map_err(unavailable)?;let (read,write)=terminal.streams().map_err(unavailable)?;Ok((read,None,write))
            } else {Ok((Box::new(child.stdout.take().ok_or_else(||unavailable("missing stdout"))?),Some(Box::new(child.stderr.take().ok_or_else(||unavailable("missing stderr"))?)),Box::new(child.stdin.take().ok_or_else(||unavailable("missing stdin"))?)))}
        })();
        let (stdout,stderr,writer)=match streams {Ok(v)=>v,Err(e)=>{let _=child.start_kill();let _=child.wait().await;return Err(e);}};
        {let mut r=live.record.lock().map_err(unavailable)?;r.state="running".into();r.revision+=1;}
        let handoff=manager.persist(&live).and_then(|()|io::commit(&gate).map_err(unavailable));drop(gate);
        if let Err(error)=handoff {let _=child.start_kill();let _=child.wait().await;return Err(error);}
        let _=ready.take().expect("one start receipt").send(Ok(()));
        let out=tokio::spawn(pump(stdout,live.clone(),false,launch.output_limit));
        let err=stderr.map(|r|tokio::spawn(pump(r,live.clone(),true,launch.output_limit)));
        let deadline=tokio::time::sleep(launch.timeout);tokio::pin!(deadline);
        let mut writer=Some(writer);
        let (state,status,error)=loop {
            tokio::select! {biased;
                _=manager.0.stop.cancelled()=>break ("closed",None,None),
                _=live.stop.cancelled()=>break ("closed",None,None),
                _=&mut deadline=>break ("timed_out",None,Some("declared process timeout reached".to_string())),
                status=child.wait()=>{match status{Ok(status)=>break("exited",status.code(),None),Err(error)=>break("failed",None,Some(error.to_string()))}},
                command=inbox.recv()=>match command {
                    None=>break ("closed",None,None),
                    Some(Command::Resize{rows,columns,reply})=>{let result=terminal.as_ref().ok_or_else(||HostError::Invalid("session is not a PTY".into())).and_then(|t|t.resize(rows,columns).map_err(unavailable));let _=reply.send(result);},
                    Some(Command::Input{id,mut bytes,eof,reply})=>{
                        if eof && launch.terminal {bytes.push(4);}
                        let delivery=async {let Some(stream)=&mut writer else{return Err(std::io::Error::new(std::io::ErrorKind::BrokenPipe,"stdin already closed"));};stream.write_all(&bytes).await?;stream.flush().await?;Ok(())};
                        let delivered=tokio::select!{biased;_=manager.0.stop.cancelled()=>Err(unavailable("host stopped during input; delivery uncertain")),_=live.stop.cancelled()=>Err(unavailable("session stopped during input; delivery uncertain")),_=&mut deadline=>Err(unavailable("input timed out; delivery uncertain")),r=delivery=>r.map_err(unavailable)};
                        if eof {writer.take();}
                        {let mut r=live.record.lock().unwrap_or_else(|e|e.into_inner());if let Some(receipt)=r.inputs.get_mut(&id){receipt.state=if delivered.is_ok(){"committed"}else{"uncertain"}.into();}r.revision+=1;}
                        let persistence=manager.persist(&live);let failed=delivered.is_err()||persistence.is_err();let _=reply.send(delivered.and(persistence));
                        if failed {break("failed",None,Some("input delivery failed or receipt is uncertain".into()));}
                    }
                }
            }
        };
        // Killing the owned outer helper kills its PID 1, then every descendant.
        if state!="exited" {let _=child.start_kill();}
        let _=child.wait().await;drop(writer);drop(terminal);
        let output=out.await.map_err(unavailable).and_then(|r|r.map_err(unavailable));
        let errors=if let Some(err)=err{err.await.map_err(unavailable).and_then(|r|r.map_err(unavailable))}else{Ok(())};
        {let mut r=live.record.lock().map_err(unavailable)?;r.state=state.into();r.exit_code=status;r.error=error.or_else(||output.err().or_else(||errors.err()).map(|e|e.to_string()));for input in r.inputs.values_mut().filter(|v|v.state=="prepared"){input.state="uncertain".into();}r.revision+=1;}
        Ok::<(),HostError>(())
    }.await;
    if let Some((stop, task)) = network_owner {
        stop.cancel();
        let _ = task.await;
    }
    if let Err(error) = result {
        {
            let mut r = live.record.lock().unwrap_or_else(|e| e.into_inner());
            r.state = "failed".into();
            r.error = Some(error.to_string());
            r.revision += 1;
        }
        if let Some(ready) = ready.take() {
            let _ = ready.send(Err(error));
        }
    }
    if let Err(error) = manager.persist(&live) {
        let mut r = live.record.lock().unwrap_or_else(|e| e.into_inner());
        r.error = Some(format!("completion persistence is uncertain: {error}"));
    }
    live.changed.notify_waiters();
}
