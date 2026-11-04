use crate::operations::{native, page, raw};
use crate::*;
use nofy_agent_project::{FactoryKinds, Source};
use serde_json::{Value, json};
use std::collections::BTreeSet;

impl Engine {
    async fn template_source(&self, input: &Value) -> Result<Source> {
        let agent = input.get("agent").and_then(Value::as_str);
        if input.get("empty").and_then(Value::as_bool) == Some(true)
            || input.get("preset").is_none()
        {
            let agent = agent
                .ok_or_else(|| Error::new("local_input", "agent required for an empty project"))?;
            return Ok(Source::empty(agent, agent)?);
        }
        let id = text(input, "preset")?;
        let version = input
            .get("version")
            .or_else(|| input.get("preset_version"))
            .and_then(Value::as_str);
        if let Some(registry) = &self.templates {
            return Ok(registry.get(id, version, agent)?);
        }
        let mut query = vec![];
        if let Some(version) = version {
            query.push(("version".into(), version.into()));
        }
        if let Some(agent) = agent {
            query.push(("agent".into(), agent.into()));
        }
        Ok(serde_json::from_value(
            self.client
                .request("GET", &["api", "v1", "presets", id], &query, None)
                .await?
                .value()?,
        )?)
    }
    async fn source(&self, input: &Value) -> Result<(Source, Option<Value>)> {
        if let Some(source) = input.get("source") {
            return Ok((serde_json::from_value(source.clone())?, None));
        }
        let target = input
            .get("target")
            .ok_or_else(|| Error::new("local_input", "source target is required"))?;
        match text(target, "kind")? {
            "source" => Ok((serde_json::from_value(target["source"].clone())?, None)),
            "project" => {
                let view = self
                    .client
                    .get(&["api", "v1", "projects", text(target, "project_id")?])
                    .await?
                    .value()?;
                let source = serde_json::from_value(view["source"].clone())?;
                Ok((source, Some(view)))
            }
            _ => Err(Error::new("local_input", "invalid source target")),
        }
    }
    async fn source_kinds(&self, source: &Source) -> Result<FactoryKinds> {
        // Canonical slots can be rendered offline. Only the editing alias
        // `tools` needs live factory metadata to choose its typed Agent slot.
        let doc = source.json(&source.declaration)?;
        let needs_kinds = doc.get("system").unwrap_or(&doc)["programs"]
            .as_object()
            .is_some_and(|p| p.values().any(|p| p["definition"].get("tools").is_some()));
        if !needs_kinds || self.offline {
            return Ok(FactoryKinds::new());
        }
        self.kinds().await
    }
    pub(crate) async fn project_operation(&self, op: &str, input: &Value) -> Result<Envelope> {
        if op == "project.template" {
            let source = self.template_source(input).await?;
            let inspection = nofy_agent_project::inspect(&source, &FactoryKinds::new())?;
            let mut out = Envelope::ok(op, json!({"source":source,"inspection":inspection}));
            out.refs.insert(
                "source_digest".into(),
                identity(&inspection["source_digest"]),
            );
            return Ok(out);
        }
        if op == "agent.list" {
            let response = self
                .client
                .request("GET", &["api", "v1", "projects"], &page(input), None)
                .await?
                .value()?;
            let mut agents = vec![];
            for project in response["projects"].as_array().into_iter().flatten() {
                let source: Source = serde_json::from_value(project["source"].clone())?;
                for agent in nofy_agent_project::agent_names(&source)? {
                    agents.push(json!({"agent":agent,"project_id":project["project_id"],"source_revision":project["revision"],"source_digest":project["source_digest"],"inspection":project["inspection"]}));
                }
            }
            let mut out = Envelope::ok(op, json!({"agents":agents}));
            out.next_cursor = response["next_cursor"].as_str().map(str::to_owned);
            return Ok(out);
        }
        if op == "agent.create" && input.get("target").is_none() {
            let source = if let Some(s) = input.get("source") {
                let source: Source = serde_json::from_value(s.clone())?;
                if !nofy_agent_project::agent_names(&source)?
                    .iter()
                    .any(|id| Some(id.as_str()) == input["agent"].as_str())
                {
                    return Err(Error::new(
                        "local_input",
                        "source does not contain the requested Agent",
                    ));
                }
                source
            } else {
                self.template_source(input).await?
            };
            let body = json!({"project_id":input.get("project_id").unwrap_or(&input["agent"]),"agent":input["agent"],"source":source,"expected_revision":input.get("expected_revision").cloned().unwrap_or(Value::Null)});
            let view = self
                .client
                .send("POST", &["api", "v1", "projects"], &body)
                .await?
                .value()?;
            return Ok(project_envelope(op, view));
        }
        let (mut source, project) = self.source(input).await?;
        let kinds = if op == "project.pack" {
            FactoryKinds::new()
        } else {
            self.source_kinds(&source).await?
        };
        let mut captured = std::collections::BTreeMap::new();
        captured.insert("source_digest".to_owned(), Some(source.digest()?));
        if let Some(project) = &project {
            captured.insert("project_id".to_owned(), identity(&project["project_id"]));
            captured.insert("source_revision".to_owned(), identity(&project["revision"]));
        }
        let result = match op {
            "project.inspect" => Ok(Envelope::ok(
                op,
                nofy_agent_project::inspect(&source, &kinds)?,
            )),
            "project.build" | "agent.build" => {
                if op == "agent.build" {
                    check_agent(&source, text(input, "agent")?)?;
                }
                Ok(Envelope::ok(
                    op,
                    nofy_agent_project::build(&source, &kinds)?,
                ))
            }
            "project.pack" => {
                let archive = self
                    .client
                    .send(
                        "POST",
                        &["api", "v1", "source-archives"],
                        &json!({"source":source}),
                    )
                    .await?
                    .value()?;
                Ok(Envelope::ok(op, archive))
            }
            "agent.inspect" | "agent.module.list" | "agent.module.inspect" => {
                let data = nofy_agent_project::edit(&mut source, op, input, &kinds)?;
                let mut out = Envelope::ok(op, data);
                if let Some(project) = project {
                    out.refs
                        .insert("project_id".into(), identity(&project["project_id"]));
                    out.refs
                        .insert("source_revision".into(), identity(&project["revision"]));
                }
                out.refs
                    .insert("source_digest".into(), Some(source.digest()?));
                Ok(out)
            }
            "agent.export" => {
                check_agent(&source, text(input, "agent")?)?;
                let mut out = Envelope::ok(op, json!({"source":source}));
                out.refs
                    .insert("source_digest".into(), Some(source.digest()?));
                Ok(out)
            }
            "agent.plan" | "agent.apply" => {
                check_agent(&source, text(input, "agent")?)?;
                let built = nofy_agent_project::build(&source, &kinds)?;
                let document = raw(&built, "deployment_json")?;
                if op == "agent.plan" {
                    let validated = self
                        .client
                        .send("POST", &["api", "v1", "validate"], &document)
                        .await?
                        .value()?;
                    let name = validated["document"]["name"].as_str().ok_or_else(|| {
                        Error::new("unsupported_protocol", "validated system name missing")
                    })?;
                    let active = match self
                        .client
                        .get(&["api", "v1", "systems", name, "active"])
                        .await
                    {
                        Ok(v) => v.value()?,
                        Err(e) if e.code == "not_found" => Value::Null,
                        Err(e) => return Err(e),
                    };
                    let previous = if let Some(release) = active["release"].as_str() {
                        self.client
                            .get(&["api", "v1", "releases", release])
                            .await?
                            .value()?
                    } else {
                        Value::Null
                    };
                    let mut out = Envelope::ok(
                        op,
                        json!({"system":name,"candidate_release":validated["digest"],"expected_generation":identity(&active["generation"]),"published":false,"changes":structural_diff(&previous["document"],&validated["document"])}),
                    );
                    out.refs.extend(captured);
                    return Ok(out);
                }
                if document.pointer("/system/name").and_then(Value::as_str)
                    != input["system"].as_str()
                {
                    return Err(Error::new(
                        "local_input",
                        "apply system differs from the source system name",
                    ));
                }
                let publication = self
                    .client
                    .send("POST", &["api", "v1", "import"], &document)
                    .await?;
                let published = publication.value()?;
                let release = published
                    .pointer("/bundle/digest")
                    .and_then(Value::as_str)
                    .ok_or_else(|| {
                        Error::new("unsupported_protocol", "publication release missing")
                    })?;
                let apply = json!({"command_id":input["command_id"],"system":input["system"],"release":release,"expected_generation":exact(&input["expected_generation"])?});
                match self
                    .client
                    .send("POST", &["api", "v1", "apply"], &apply)
                    .await
                {
                    Ok(receipt) => {
                        let mut out = native("system.apply", receipt)?;
                        out.operation = op.into();
                        out.data["publication_json"] = json!(publication.text);
                        Ok(out)
                    }
                    Err(mut e) => {
                        e.refs.insert("release".into(), Some(release.into()));
                        e.refs
                            .insert("command_id".into(), identity(&input["command_id"]));
                        e.details["completed_stages"] = json!(["build", "publish"]);
                        e.details["publication_json"] = json!(publication.text);
                        e.details["pending_stage"] = json!("apply");
                        Err(e)
                    }
                }
            }
            "agent.create"
            | "agent.module.add"
            | "agent.tool.add"
            | "agent.module.set"
            | "agent.module.bind"
            | "agent.module.detach"
            | "agent.module.remove" => {
                let target = &input["target"];
                match text(target, "kind")? {
                    "source" => {
                        if source.digest()?.as_str() != text(target, "expected_digest")? {
                            return Err(Error::new("conflict", "source digest changed"));
                        }
                    }
                    "project" => {
                        let expected = target.get("expected_revision").ok_or_else(|| {
                            Error::new("local_input", "expected_revision required")
                        })?;
                        if project.as_ref().and_then(|p| p.get("revision")) != Some(expected) {
                            return Err(Error::new("conflict", "project revision changed"));
                        }
                    }
                    _ => return Err(Error::new("local_input", "invalid edit target")),
                }
                let mut input = input.clone();
                let imported = self.import_reference(&mut input).await?;
                let live_kinds =
                    if (op == "agent.module.add" || op == "agent.tool.add") && !self.offline {
                        self.kinds().await?
                    } else {
                        kinds
                    };
                if let Some(project) = project {
                    if !imported.is_empty() {
                        input["imported_modules"] = json!(imported);
                    }
                    let body = json!({"expected_revision":target["expected_revision"],"operation":op,"input":input});
                    let view = self
                        .client
                        .send(
                            "POST",
                            &[
                                "api",
                                "v1",
                                "projects",
                                text(&project, "project_id")?,
                                "edits",
                            ],
                            &body,
                        )
                        .await?
                        .value()?;
                    Ok(project_envelope(op, view))
                } else {
                    nofy_agent_project::import_modules(&mut source, &imported)?;
                    let inspection =
                        nofy_agent_project::edit(&mut source, op, &input, &live_kinds)?;
                    let digest = source.digest()?;
                    let mut out =
                        Envelope::ok(op, json!({"source":source,"inspection":inspection}));
                    out.refs.insert("source_digest".into(), Some(digest));
                    Ok(out)
                }
            }
            _ => Err(Error::new(
                "unsupported_operation",
                "unknown source operation",
            )),
        };
        match result {
            Ok(mut out) => {
                for (k, v) in captured {
                    out.refs.entry(k).or_insert(v);
                }
                Ok(out)
            }
            Err(mut error) => {
                for (k, v) in captured {
                    error.refs.entry(k).or_insert(v);
                }
                Err(error)
            }
        }
    }
    async fn import_reference(&self, input: &mut Value) -> Result<Vec<Value>> {
        let Some(uri) = input
            .get("module_ref")
            .and_then(Value::as_str)
            .filter(|s| s.starts_with("nofy://"))
        else {
            return Ok(vec![]);
        };
        let url =
            url::Url::parse(uri).map_err(|_| Error::new("local_input", "invalid module URI"))?;
        if url.host_str() != Some("releases") || url.query().is_some() || url.fragment().is_some() {
            return Err(Error::new(
                "local_input",
                "module URI must use nofy://releases/<digest>/modules/<id>/<version>",
            ));
        }
        let parts: Vec<_> = url.path_segments().into_iter().flatten().collect();
        if parts.len() != 4 || parts[1] != "modules" {
            return Err(Error::new("local_input", "invalid release module URI"));
        }
        let decode = |s: &str| -> Result<String> { percent_decode(s) };
        let release = parts[0];
        let reference = json!({"id":decode(parts[2])?,"version":decode(parts[3])?});
        let bundle = self
            .client
            .get(&["api", "v1", "releases", release])
            .await?
            .value()?;
        let definitions = bundle
            .pointer("/document/modules")
            .and_then(Value::as_array)
            .ok_or_else(|| {
                Error::new("unsupported_protocol", "release module definitions missing")
            })?;
        let mut todo = vec![reference.clone()];
        let mut seen = BTreeSet::new();
        let mut out = vec![];
        while let Some(r) = todo.pop() {
            let key = serde_json::to_string(&r)?;
            if !seen.insert(key) {
                continue;
            }
            let m = definitions
                .iter()
                .find(|m| m["reference"] == r)
                .ok_or_else(|| Error::new("not_found", "release module dependency is absent"))?;
            if let Some(deps) = m["dependencies"].as_object() {
                todo.extend(deps.values().cloned());
            }
            out.push(m.clone());
        }
        input["module_ref"] = json!(format!(
            "{}@{}",
            text(&reference, "id")?,
            text(&reference, "version")?
        ));
        Ok(out)
    }
}
fn check_agent(source: &Source, id: &str) -> Result<()> {
    if nofy_agent_project::agent_names(source)?
        .iter()
        .any(|n| n == id)
    {
        Ok(())
    } else {
        Err(Error::new("not_found", "Agent not found in source"))
    }
}
fn project_envelope(op: &str, view: Value) -> Envelope {
    let mut out = Envelope::ok(op, view);
    for (key, field) in [
        ("project_id", "project_id"),
        ("source_revision", "revision"),
        ("source_digest", "source_digest"),
    ] {
        out.refs.insert(key.into(), identity(&out.data[field]));
    }
    out
}
fn structural_diff(before: &Value, after: &Value) -> Value {
    fn diff(before: &Value, after: &Value, path: &str, out: &mut Vec<Value>) {
        if before == after {
            return;
        }
        if let (Some(a), Some(b)) = (before.as_object(), after.as_object()) {
            let keys: BTreeSet<_> = a.keys().chain(b.keys()).collect();
            for key in keys {
                let p = format!("{path}/{}", key.replace('~', "~0").replace('/', "~1"));
                match (a.get(key), b.get(key)) {
                    (Some(a), Some(b)) => diff(a, b, &p, out),
                    (None, Some(_)) => out.push(json!({"op":"add","path":p})),
                    (Some(_), None) => out.push(json!({"op":"remove","path":p})),
                    _ => {}
                }
            }
        } else {
            out.push(json!({"op":"replace","path":path}));
        }
    }
    let mut out = vec![];
    diff(before, after, "", &mut out);
    json!(out)
}
fn percent_decode(s: &str) -> Result<String> {
    let b = s.as_bytes();
    let mut out = vec![];
    let mut i = 0;
    while i < b.len() {
        if b[i] == b'%' {
            if i + 2 >= b.len() {
                return Err(Error::new("local_input", "invalid URI escaping"));
            }
            let byte = u8::from_str_radix(&s[i + 1..i + 3], 16)
                .map_err(|_| Error::new("local_input", "invalid URI escaping"))?;
            out.push(byte);
            i += 3;
        } else {
            out.push(b[i]);
            i += 1;
        }
    }
    String::from_utf8(out).map_err(|_| Error::new("local_input", "URI component must be UTF-8"))
}
