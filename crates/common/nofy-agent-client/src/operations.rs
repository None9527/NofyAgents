use crate::*;
use nofy_agent_project::{FactoryKinds, TemplateRegistry};
use serde_json::{Value, json};
use std::{collections::BTreeMap, time::Duration};

#[derive(Clone)]
pub struct Engine {
    pub client: KernelClient,
    pub templates: Option<TemplateRegistry>,
    pub offline: bool,
}
impl Engine {
    pub fn new(client: KernelClient) -> Self {
        Self {
            client,
            templates: None,
            offline: false,
        }
    }
    pub fn with_templates(mut self, templates: TemplateRegistry) -> Self {
        self.templates = Some(templates);
        self
    }
    pub fn for_token(&self, token: String) -> Self {
        let mut engine = self.clone();
        engine.client = self.client.with_token(token);
        engine
    }
    pub async fn execute(&self, operation_name: &str, input: Value) -> Envelope {
        let initial = refs_from_input(&input);
        let result = match validate(operation_name, &input) {
            Ok(()) => self.dispatch(operation_name, &input).await,
            Err(e) => Err(e),
        };
        match result {
            Ok(mut output) => {
                for (k, v) in initial {
                    output.refs.entry(k).or_insert(v);
                }
                output
            }
            Err(mut e) => {
                for (k, v) in initial {
                    e.refs.entry(k).or_insert(v);
                }
                // The kernel answers a missing object with a bare "not found".
                // Say which identifiers were looked up, from the caller's own input.
                if e.code == "not_found" && e.message.eq_ignore_ascii_case("not found") {
                    let looked_up: Vec<String> = e
                        .refs
                        .iter()
                        .filter_map(|(k, v)| v.as_ref().map(|v| format!("{k}={v}")))
                        .take(3)
                        .collect();
                    if !looked_up.is_empty() {
                        e.message = format!("not found: {}", looked_up.join(", "));
                    }
                }
                if !e.details.is_object() {
                    e.details = json!({"cause":e.details});
                }
                e.details["recovery"] = crate::guides::with_cli(crate::guides::recovery(
                    &e.code,
                    operation_name,
                    &input,
                    e.unconfirmed,
                ));
                Envelope::failed(operation_name, e)
            }
        }
    }
    pub(crate) async fn kinds(&self) -> Result<FactoryKinds> {
        let factories = self.client.factories().await?;
        Ok(factories["factories"]
            .as_array()
            .into_iter()
            .flatten()
            .filter_map(|d| {
                Some((
                    d["factory"].as_str()?.to_owned(),
                    d["kind"].as_str()?.to_owned(),
                ))
            })
            .collect())
    }
    async fn dispatch(&self, op: &str, input: &Value) -> Result<Envelope> {
        if op.starts_with("project.") || op.starts_with("agent.") {
            return self.project_operation(op, input).await;
        }
        if op.starts_with("session.") {
            return self.session_operation(op, input).await;
        }
        if op.starts_with("repository.") || op.starts_with("module.") {
            return self.repository_operation(op, input).await;
        }
        match op {
            "run.steer" | "run.follow_up" => {
                let kind = if op == "run.steer" { "interject" } else { "follow_up" };
                let envelope = json!({"address":{"root_run_id":input["root_run_id"],"run_id":input["run_id"],"thread_id":input["thread_id"],"agent":input["agent"]},"input_id":input["input_id"],"input":{"kind":kind,"message":{"text":input["text"],"attachments":input.get("attachments").cloned().unwrap_or(json!([]))}}});
                native(op,self.client.send("POST", &["api","v1","runs",text(input,"root_run_id")?,"inputs"], &envelope).await?)
            }
            "permission.grants"=>{
                let mut query=page(input);if let Some(value)=input.get("include_revoked"){query.push(("include_revoked".into(),value.to_string()));}
                let response=self.client.request("GET",&["api","v1","approval-grants"],&query,None).await?;let value=response.value()?;let mut output=native(op,response)?;output.next_cursor=value.as_array().and_then(|items|items.last()).and_then(|item|identity(&item["grant_id"]));Ok(output)
            }
            "permission.revoke"=>native(op,self.client.send("POST",&["api","v1","approval-grants",text(input,"grant_id")?,"revoke"],&json!({"command_id":text(input,"command_id")?,"expected_revision":text(input,"expected_revision")?})).await?),
            "command.analyze"=>native(op,self.client.send("POST",&["api","v1","command-analysis"],input).await?),
            "terminal.start" | "terminal.poll" | "terminal.write" | "terminal.resize"
            | "terminal.close" => {
                let mut action = input.clone();
                let object = action.as_object_mut().expect("validated terminal input");
                for key in ["release", "module_ref", "owner"] {
                    object.remove(key);
                }
                object.insert("op".into(), json!(op.trim_start_matches("terminal.")));
                native(op,self.client.send("POST",&["api","v1","terminal"],&json!({"release":text(input,"release")?,"module_ref":input["module_ref"],"owner":text(input,"owner")?,"action":action})).await?)
            }
            "describe" => {
                let access = self.client.authorize().await?;
                let factories = self.client.factories().await?;
                let server_revision = factories
                    .pointer("/development/contract_revision")
                    .and_then(Value::as_str);
                if server_revision != CATALOG["contract_revision"].as_str() {
                    let mut error = Error::new(
                        "unsupported_protocol",
                        "client and kernel development contracts differ; start a matching kernel before composing agents",
                    );
                    error.details = json!({"client_contract_revision":CATALOG["contract_revision"],"kernel_contract_revision":server_revision,"remedy":"Use the kernel built with this operation catalog, then reconnect MCP and call describe again."});
                    return Err(error);
                }
                let templates = match &self.templates {
                    Some(t) => t.list()?,
                    None => self.client.get(&["api", "v1", "presets"]).await?.value()?,
                };
                let sessions = self
                    .client
                    .get(&["api", "v1", "sessions", "capabilities"])
                    .await?
                    .value()?;
                let repositories = self
                    .client
                    .get(&["api", "v1", "module-repositories"])
                    .await?
                    .value()?;
                let mut operations: Vec<_> = CATALOG["operations"]
                    .as_array()
                    .into_iter()
                    .flatten()
                    .filter(|o| {
                        input
                            .get("group")
                            .and_then(Value::as_str)
                            .is_none_or(|group| {
                                o["operation"].as_str().is_some_and(|name| {
                                    name == group || name.starts_with(&format!("{group}."))
                                })
                            })
                    })
                    .cloned()
                    .collect();
                let mut inventory = factories["factories"].clone();
                if input["include_details"] != true {
                    for operation in &mut operations {
                        if let Some(fields) = operation.as_object_mut() {
                            fields.retain(|name, _| matches!(name.as_str(), "operation"|"cli"|"mcp_tool"|"summary"|"scope_hint"|"input_schema"|"output_schema"));
                        }
                    }
                    for factory in inventory.as_array_mut().into_iter().flatten() {
                        if let Some(fields) = factory.as_object_mut() {
                            fields.retain(|name, _| matches!(name.as_str(), "factory"|"revision"|"kind"|"dependencies"|"required_capabilities"));
                        }
                    }
                }
                Ok(Envelope::ok(
                    op,
                    json!({"protocol":PROTOCOL,"contract_revision":CATALOG["contract_revision"],"inventory_view":if input["include_details"]==true {"full"}else{"summary"},"operations":operations,"access":access,"factories":inventory,"presets":templates["presets"],"session_control":sessions,"module_repositories":repositories["repositories"],"kernel_capabilities":factories["development"],"guide":crate::guides::with_cli(crate::guides::bootstrap()),"native_json":"Native DTO JSON is returned as data.native_json for the explicitly selected endpoint/view; refs contain exact public identities. Query schema(factory/operation) for precise contracts or describe(include_details=true) for full inventories."}),
                ))
            }
            "schema" => self.schema_result(input).await,
            "draft.get" => {
                let catalog = self.client.get(&["api", "v1", "catalog"]).await?.value()?;
                let draft = catalog
                    .pointer("/data/drafts")
                    .and_then(|d| d.get(text(input, "name").ok()?))
                    .cloned()
                    .ok_or_else(|| Error::new("not_found", "draft not found"))?;
                native(
                    op,
                    Native {
                        status: 200,
                        text: serde_json::to_string(&draft)?,
                    },
                )
            }
            "draft.put" => {
                let body = json!({"expected_revision":exact(&input["expected_revision"] )?,"document":raw(input,"document_json")?});
                native(
                    op,
                    self.client
                        .send("PUT", &["api", "v1", "drafts", text(input, "name")?], &body)
                        .await?,
                )
            }
            "draft.delete" => native(
                op,
                self.client
                    .send(
                        "DELETE",
                        &["api", "v1", "drafts", text(input, "name")?],
                        &json!({"revision":exact(&input["revision"])?}),
                    )
                    .await?,
            ),
            "system.validate" => native(
                op,
                self.client
                    .request(
                        "POST",
                        &["api", "v1", "validate"],
                        &[],
                        Some(raw_text(input, "document_json")?),
                    )
                    .await?,
            ),
            "system.publish" => {
                let response = if input.get("document_json").is_some() {
                    self.client
                        .request(
                            "POST",
                            &["api", "v1", "import"],
                            &[],
                            Some(raw_text(input, "document_json")?),
                        )
                        .await?
                } else {
                    self.client.send("POST",&["api","v1","publish"],&json!({"draft":text(input,"draft")?,"revision":exact(&input["revision"])?})).await?
                };
                native(op, response)
            }
            "system.plan" => native(
                op,
                self.client
                    .send("POST", &["api", "v1", "plan"], input)
                    .await?,
            ),
            "system.apply" | "system.rollback" => {
                let mut body = input.clone();
                exact_field(&mut body, "expected_generation")?;
                native(
                    op,
                    self.client
                        .send("POST", &["api", "v1", "apply"], &body)
                        .await?,
                )
            }
            "system.active" | "system.history" => native(
                op,
                self.client
                    .get(&[
                        "api",
                        "v1",
                        "systems",
                        text(input, "system")?,
                        if op == "system.active" {
                            "active"
                        } else {
                            "history"
                        },
                    ])
                    .await?,
            ),
            "system.export" => native(
                op,
                self.client
                    .get(&["api", "v1", "releases", text(input, "release")?])
                    .await?,
            ),
            "system.programs" => native(
                op,
                self.client
                    .get(&["api", "v1", "releases", text(input, "release")?, "programs"])
                    .await?,
            ),
            "run.start" => native(
                op,
                self.client
                    .request(
                        "POST",
                        &["api", "v1", "runs"],
                        &[],
                        Some(raw_text(input, "request_json")?),
                    )
                    .await?,
            ),
            "run.list" => {
                let r = self
                    .client
                    .request("GET", &["api", "v1", "runs"], &page(input), None)
                    .await?;
                let value = r.value()?;
                let mut out = native(op, r)?;
                out.next_cursor = value
                    .as_array()
                    .and_then(|a| a.last())
                    .and_then(|v| identity(&v["sequence"]));
                Ok(out)
            }
            "run.inspect" | "run.approvals" => {
                let id = text(input, "run_id")?;
                let path = if op == "run.inspect" {
                    vec!["api", "v1", "runs", id]
                } else {
                    vec!["api", "v1", "runs", id, "approvals"]
                };
                let query = if op == "run.inspect" { vec![("view".into(),input.get("view").and_then(Value::as_str).unwrap_or("status").into())] } else { vec![] };
                native(op, self.client.request("GET", &path, &query, None).await?)
            }
            "run.events" => self.events(op, input).await,
            "run.decide" => native(
                op,
                self.client
                    .request(
                        "POST",
                        &["api", "v1", "runs", text(input, "run_id")?, "approvals"],
                        &[],
                        Some(raw_text(input, "decision_json")?),
                    )
                    .await?,
            ),
            "run.cancel" => native(
                op,
                self.client
                    .send(
                        "POST",
                        &["api", "v1", "runs", text(input, "run_id")?, "cancel"],
                        &json!({"command_id":text(input,"command_id")?}),
                    )
                    .await?,
            ),
            "run.input" => native(
                op,
                self.client
                    .request(
                        "POST",
                        &["api", "v1", "runs", text(input, "run_id")?, "inputs"],
                        &[],
                        Some(raw_text(input, "envelope_json")?),
                    )
                    .await?,
            ),
            "run.control" => native(
                op,
                self.client
                    .request(
                        "POST",
                        &["api", "v1", "actions"],
                        &[],
                        Some(raw_text(input, "action_json")?),
                    )
                    .await?,
            ),
            "run.recovery" => {
                let id = text(input, "run_id")?;
                let kind = text(input, "kind")?;
                let mut path = vec!["api", "v1", "runs", id, "recovery"];
                let mut query = vec![];
                match kind {
                    "child" => {}
                    "root" => path.push("root"),
                    "model" => {
                        path.push("models");
                        if let Some(id) = input.get("target_run_id").and_then(Value::as_str) {
                            query.push(("target_run_id".into(), id.into()));
                        }
                    }
                    "hook" => path.push("hooks"),
                    "human" => path.push("humans"),
                    "retry" => path.push("model-retry"),
                    _ => return Err(Error::new("local_input", "invalid recovery kind")),
                }
                native(op, self.client.request("GET", &path, &query, None).await?)
            }
            "action.inspect" => native(
                op,
                self.client
                    .get(&["api", "v1", "actions", text(input, "command_id")?])
                    .await?,
            ),
            "resource.list" => {
                let path = resource_collection(text(input, "kind")?)?;
                if path == "runtimes"
                    && (input.get("after").is_some() || input.get("limit").is_some())
                {
                    return Err(Error::new(
                        "local_input",
                        "runtimes is a complete native inventory; it does not accept pagination options",
                    ));
                }
                let r = self
                    .client
                    .request("GET", &["api", "v1", path], &page(input), None)
                    .await?;
                let value = r.value()?;
                let mut out = native(op, r)?;
                out.next_cursor = if path == "runtime-sources" {
                    value.get("next").and_then(identity)
                } else if path != "runtimes" {
                    value
                        .as_array()
                        .and_then(|items| items.last())
                        .and_then(|v| identity(&v["digest"]))
                } else {
                    None
                };
                Ok(out)
            }
            "resource.inspect" | "resource.apply" => self.resource(op, input).await,
            "budget.list" => {
                let r = self
                    .client
                    .request("GET", &["api", "v1", "budgets"], &page(input), None)
                    .await?;
                let v = r.value()?;
                let mut out = native(op, r)?;
                out.next_cursor = v.get("next").and_then(identity);
                Ok(out)
            }
            "credential.list" => native(op, self.client.get(&["api", "v1", "credentials"]).await?),
            "credential.delete" => native(
                op,
                self.client
                    .send(
                        "DELETE",
                        &["api", "v1", "credentials", text(input, "reference")?],
                        &json!({"expected_revision":exact(&input["expected_revision"])?}),
                    )
                    .await?,
            ),
            "credential.put" => Err(Error::new(
                "local_input",
                "credential.put requires the private CLI credential input channel",
            )),
            _ => Err(Error::new(
                "unsupported_operation",
                "operation is not registered",
            )),
        }
    }
    pub async fn put_credential(
        &self,
        input: Value,
        secret: zeroize::Zeroizing<String>,
    ) -> Envelope {
        let result=async{validate("credential.put",&input)?;
            native("credential.put",self.client.send("PUT",&["api","v1","credentials",text(&input,"reference")?],&json!({"expected_revision":exact(&input["expected_revision"] )?,"value":secret.as_str()})).await?)}.await;
        match result {
            Ok(mut v) => {
                v.refs.extend(refs_from_input(&input));
                v
            }
            Err(mut e) => {
                e.refs.extend(refs_from_input(&input));
                Envelope::failed("credential.put", e)
            }
        }
    }
    async fn events(&self, op: &str, input: &Value) -> Result<Envelope> {
        let wait = input
            .get("wait_seconds")
            .and_then(Value::as_f64)
            .unwrap_or(0.0);
        let deadline = tokio::time::Instant::now() + Duration::from_secs_f64(wait);
        loop {
            let r = self
                .client
                .request(
                    "GET",
                    &["api", "v1", "runs", text(input, "run_id")?, "events"],
                    &page(input),
                    None,
                )
                .await?;
            let v = r.value()?;
            let events = v["events"].as_array().ok_or_else(|| {
                Error::new(
                    "unsupported_protocol",
                    "kernel events response is malformed",
                )
            })?;
            if !events.is_empty() || tokio::time::Instant::now() >= deadline {
                let mut out = native(op, r)?;
                out.next_cursor = events
                    .last()
                    .and_then(|v| identity(&v["cursor"]))
                    .or_else(|| input.get("after").and_then(identity));
                return Ok(out);
            }
            tokio::time::sleep(
                Duration::from_millis(150)
                    .min(deadline.saturating_duration_since(tokio::time::Instant::now())),
            )
            .await;
        }
    }
    async fn session_operation(&self, op: &str, input: &Value) -> Result<Envelope> {
        let capabilities = self
            .client
            .get(&["api", "v1", "sessions", "capabilities"])
            .await?
            .value()?;
        if capabilities["protocol"] != "nofy.session-control/v1" {
            return Err(Error::new(
                "unsupported_protocol",
                "kernel does not advertise modular Session control",
            ));
        }
        let kind = op.strip_prefix("session.").unwrap_or("");
        let body = if matches!(kind, "fork" | "rewind") {
            let mut start = input.clone();
            let start = start.as_object_mut().expect("validated session fork input");
            let mut source = serde_json::Map::new();
            for key in [
                "source_session_id",
                "expected_source_session_revision",
                "source_run_id",
                "expected_source_revision",
                "through_message",
            ] {
                if let Some(value) = start.remove(key) {
                    source.insert(key.into(), value);
                }
            }
            source.insert(
                "expected_source_revision".into(),
                exact(&source["expected_source_revision"])?,
            );
            json!({"start":start,"source":source})
        } else {
            input.clone()
        };
        let mut query = vec![];
        let (method, path) = match kind {
            "list" => {
                query = page(input);
                if let Some(v) = input.get("include_archived") {
                    query.push(("include_archived".into(), v.to_string()));
                }
                ("GET", vec!["api", "v1", "sessions"])
            }
            "create" => ("POST", vec!["api", "v1", "sessions"]),
            "start" | "route" => ("POST", vec!["api", "v1", "sessions", kind]),
            "fork" | "rewind" => ("POST", vec!["api", "v1", "sessions", "fork"]),
            _ => {
                let id = text(input, "session_id")?;
                match kind {
                    "inspect" => ("GET", vec!["api", "v1", "sessions", id]),
                    "tree" => ("GET", vec!["api", "v1", "sessions", id, "tree"]),
                    "turns" => {
                        query = page(input);
                        ("GET", vec!["api", "v1", "sessions", id, "turns"])
                    }
                    "turn" => ("POST", vec!["api", "v1", "sessions", id, "turns"]),
                    "binding" => (
                        "GET",
                        vec!["api", "v1", "sessions", id, "turns", text(input, "run_id")?],
                    ),
                    "command" => (
                        "GET",
                        vec![
                            "api",
                            "v1",
                            "sessions",
                            id,
                            "commands",
                            text(input, "command_id")?,
                        ],
                    ),
                    "policy" => ("GET", vec!["api", "v1", "sessions", id, "policy"]),
                    "metadata" => ("PATCH", vec!["api", "v1", "sessions", id, "metadata"]),
                    "plan" | "close" | "reopen" | "archive" | "unarchive" | "reconfigure" => {
                        ("POST", vec!["api", "v1", "sessions", id, kind])
                    }
                    _ => {
                        return Err(Error::new(
                            "unsupported_operation",
                            "unknown Session operation",
                        ));
                    }
                }
            }
        };
        let response = self
            .client
            .request(
                method,
                &path,
                &query,
                if method == "GET" {
                    None
                } else {
                    Some(serde_json::to_string(&body)?)
                },
            )
            .await?;
        let mut value = response.value()?;
        let mut out = Envelope::ok(op, Value::Null);
        if kind == "list" {
            let items = value.as_array().ok_or_else(|| {
                Error::new("unsupported_protocol", "kernel Session list is malformed")
            })?;
            out.next_cursor = items.last().and_then(|v| identity(&v["session_id"]));
            value = json!({"sessions":value});
        }
        if kind == "turns" {
            out.next_cursor = value["turns_json"]
                .as_array()
                .and_then(|a| a.last())
                .and_then(Value::as_str)
                .and_then(|s| serde_json::from_str::<Value>(s).ok())
                .and_then(|v| identity(&v["sequence"]));
        }
        for key in [
            "session_id",
            "run_id",
            "command_id",
            "session_revision",
            "policy_revision",
        ] {
            if let Some(v) = value.get(key).and_then(identity) {
                out.refs.insert(key.into(), Some(v));
            }
        }
        if value.get("phase").and_then(Value::as_str) == Some("prepared") {
            out.status = "accepted".into();
        }
        if value.get("phase").and_then(Value::as_str) == Some("rejected") {
            let mut e = Error::new("policy_rejected", "Session command was rejected");
            e.details = json!({"receipt":value});
            e.refs = out.refs;
            return Err(e);
        }
        out.data = value;
        Ok(out)
    }
    async fn resource(&self, op: &str, input: &Value) -> Result<Envelope> {
        let kind = text(input, "kind")?;
        let apply = op == "resource.apply";
        let id = input.get("id").and_then(Value::as_str);
        let (method, path, body) = match (kind, apply) {
            ("artifact" | "runtime_image" | "runtime_source", false) => (
                "GET",
                vec![
                    "api",
                    "v1",
                    resource_collection(kind)?,
                    id.ok_or_else(|| Error::new("local_input", "id required for this resource"))?,
                ],
                None,
            ),
            ("loader_cache", false) => ("GET", vec!["api", "v1", "loader", "cache"], None),
            ("loader_references", false) => (
                "POST",
                vec!["api", "v1", "loader", "references"],
                Some(raw_text(input, "request_json")?),
            ),
            ("memory", _) => (
                "POST",
                vec![
                    "api",
                    "v1",
                    "memory",
                    "resources",
                    if apply { "apply" } else { "inspect" },
                ],
                Some(raw_text(input, "request_json")?),
            ),
            ("runtime_source", true) => (
                "PUT",
                vec![
                    "api",
                    "v1",
                    "runtime-sources",
                    id.ok_or_else(|| Error::new("local_input", "id required for runtime_source"))?,
                ],
                Some(raw_text(input, "request_json")?),
            ),
            ("artifact" | "runtime" | "runtime_image", true) => (
                "POST",
                vec!["api", "v1", resource_collection(kind)?],
                Some(raw_text(input, "request_json")?),
            ),
            _ => return Err(Error::new("local_input", "unsupported resource operation")),
        };
        native(op, self.client.request(method, &path, &[], body).await?)
    }
}
pub(crate) fn raw_text(input: &Value, key: &str) -> Result<String> {
    let text = text(input, key)?;
    let _: Box<serde_json::value::RawValue> = serde_json::from_str(text)?;
    Ok(text.into())
}
pub(crate) fn raw(input: &Value, key: &str) -> Result<Value> {
    Ok(serde_json::from_str(&raw_text(input, key)?)?)
}
pub(crate) fn page(input: &Value) -> Vec<(String, String)> {
    ["after", "limit"]
        .into_iter()
        .filter_map(|k| {
            input.get(k).map(|v| {
                (
                    k.to_owned(),
                    v.as_str()
                        .map(str::to_owned)
                        .unwrap_or_else(|| v.to_string()),
                )
            })
        })
        .collect()
}
fn resource_collection(kind: &str) -> Result<&'static str> {
    Ok(match kind {
        "artifact" | "artifacts" => "artifacts",
        "runtime" | "runtimes" => "runtimes",
        "runtime_image" | "runtime_images" => "runtime-images",
        "runtime_source" | "runtime_sources" => "runtime-sources",
        _ => return Err(Error::new("local_input", "unknown resource collection")),
    })
}
pub(crate) fn native(op: &str, response: Native) -> Result<Envelope> {
    let parsed = response.value()?;
    let mut out = Envelope::ok(op, json!({"native_json":response.text}));
    if response.status == 202 {
        out.status = "accepted".into();
    }
    let paths: &[(&str, &str)] = match op {
        "system.publish" => &[
            ("release", "/bundle/digest"),
            ("catalog_revision", "/created_revision"),
            ("system", "/bundle/document/name"),
        ],
        "system.validate" | "system.export" => {
            &[("release", "/digest"), ("system", "/document/name")]
        }
        "system.apply" | "system.rollback" => &[
            ("generation", "/active/generation"),
            ("release", "/active/release"),
            ("command_id", "/command/command_id"),
        ],
        "system.active" => &[("generation", "/generation"), ("release", "/release")],
        "draft.get" | "draft.put" => &[("draft_revision", "/revision")],
        "run.start" => &[
            ("run_id", "/request/run_id"),
            ("thread_id", "/request/thread_id"),
            ("sequence", "/sequence"),
        ],
        "run.inspect" => &[
            ("run_id", "/run/request/run_id"),
            ("thread_id", "/run/request/thread_id"),
            ("live_revision", "/live/revision"),
            ("sequence", "/run/sequence"),
        ],
        "run.control" | "action.inspect" => &[
            ("command_id", "/action/command_id"),
            ("run_id", "/action/run_id"),
            ("sequence", "/sequence"),
        ],
        "credential.put" | "credential.delete" => &[("credential_revision", "/revision")],
        "permission.revoke" => &[("grant_id", "/grant_id"), ("grant_revision", "/revision")],
        _ => &[],
    };
    for (k, p) in paths {
        if let Some(v) = parsed.pointer(p).and_then(identity) {
            out.refs.insert((*k).into(), Some(v));
        }
    }
    // The native transition contract starts at revision zero before the first
    // live-version record exists. Expose that identity explicitly to clients.
    if op == "run.inspect" && parsed.get("live").is_some_and(Value::is_null) {
        out.refs.insert("live_revision".into(), Some("0".into()));
    }
    Ok(out)
}
pub fn refs_from_input(input: &Value) -> BTreeMap<String, Option<String>> {
    let mut refs = BTreeMap::new();
    for key in [
        "agent",
        "project_id",
        "system",
        "release",
        "command_id",
        "run_id",
        "session_id",
        "expected_generation",
        "expected_session_revision",
        "reference",
        "repository",
        "alias",
        "expected_revision",
    ] {
        if let Some(v) = input.get(key) {
            refs.insert(key.into(), identity(v));
        }
    }
    if let Some(target) = input.get("target") {
        for key in ["project_id", "expected_revision", "expected_digest"] {
            if let Some(v) = target.get(key) {
                refs.insert(key.into(), identity(v));
            }
        }
    }
    for key in ["request_json", "action_json"] {
        if let Some(v) = input
            .get(key)
            .and_then(Value::as_str)
            .and_then(|s| serde_json::from_str::<Value>(s).ok())
        {
            for key in ["run_id", "thread_id", "command_id", "system", "release"] {
                if let Some(value) = v.get(key).and_then(identity) {
                    refs.entry(key.into()).or_insert(Some(value));
                }
            }
        }
    }
    refs
}
