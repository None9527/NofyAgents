use crate::*;
use nofy_agent_project::{
    Source,
    repository::{PackageView, imports, package_file},
};
use serde_json::{Value, json};

impl Engine {
    pub(crate) async fn inspect_source(
        &self,
        source: &Source,
        kinds: &nofy_agent_project::FactoryKinds,
    ) -> Result<Value> {
        let mut inspection = match self.resolve_source(source).await {
            Ok(resolved) => nofy_agent_project::inspect(&resolved, kinds)?,
            Err(error) => {
                let mut inspection = nofy_agent_project::inspect(source, kinds)?;
                inspection["status"] = json!("incomplete");
                inspection["issue"] =
                    json!({"code":error.code,"message":error.message,"details":error.details});
                inspection
            }
        };
        inspection["source_digest"] = json!(source.digest()?);
        Ok(inspection)
    }
    /// Include pinned package bytes from the kernel cache; never acquire Git sources.
    /// Offline callers must already carry all pinned source packages.
    pub async fn resolve_source(&self, source: &Source) -> Result<Source> {
        let all = imports(source)?;
        let mut resolved = source.clone();
        if all.is_empty() {
            return Ok(resolved);
        }
        for imported in all.values() {
            let path = package_file(&imported.digest)?;
            if !resolved.files.contains_key(&path) {
                if self.offline {
                    return Err(Error::new(
                        "incomplete",
                        "module sources are not bundled; export from the connected repository before building offline",
                    ));
                }
                let value = self
                    .client
                    .get(&["api", "v1", "module-packages", &imported.digest])
                    .await?
                    .value()?;
                let package: Source = serde_json::from_value(value)?;
                if package.digest()? != imported.digest {
                    return Err(Error::new(
                        "unsupported_protocol",
                        "module repository returned a different source digest",
                    ));
                }
                resolved.put_json(&path, &serde_json::to_value(package)?)?;
            }
        }
        resolved.refresh_manifest()?;
        nofy_agent_project::repository::verify_package_sources(&resolved)?;
        Ok(resolved)
    }
    pub(crate) async fn package_view(&self, input: &Value) -> Result<PackageView> {
        if self.offline {
            return Err(Error::new(
                "local_input",
                "selecting a package version requires a connected module repository",
            ));
        }
        Ok(serde_json::from_value(
            self.client
                .get(&[
                    "api",
                    "v1",
                    "module-repositories",
                    text(input, "repository")?,
                    "packages",
                    text(input, "name")?,
                    text(input, "version")?,
                ])
                .await?
                .value()?,
        )?)
    }
    pub(crate) async fn repository_operation(&self, op: &str, input: &Value) -> Result<Envelope> {
        let value = match op {
            "module.yank" => self.client.send("POST", &["api","v1","module-repositories",text(input,"repository")?,"packages",text(input,"name")?,text(input,"version")?,"yank"], &json!({"expected_revision":text(input,"expected_revision")?,"yanked":input.get("yanked").cloned().unwrap_or(json!(true))})).await?.value()?,
            "module.gc" => self.client.send("POST", &["api","v1","module-packages","gc"], &json!({"dry_run":input.get("dry_run").cloned().unwrap_or(json!(true))})).await?.value()?,
            "repository.list" => self.client.get(&["api","v1","module-repositories"]).await?.value()?,
            "repository.add" => self.client.send("PUT",&["api","v1","module-repositories",text(input,"repository")?],&json!({"origin":input["origin"],"expected_revision":input["expected_revision"]})).await?.value()?,
            "repository.inspect" => self.client.get(&["api","v1","module-repositories",text(input,"repository")?]).await?.value()?,
            "repository.remove" => self.client.send("DELETE",&["api","v1","module-repositories",text(input,"repository")?],&json!({"expected_revision":input["expected_revision"]})).await?.value()?,
            "repository.sync" => self.client.send("POST",&["api","v1","module-repositories",text(input,"repository")?,"sync"],&json!({"expected_revision":input["expected_revision"]})).await?.value()?,
            "module.publish" => self.client.send("POST",&["api","v1","module-repositories",text(input,"repository")?,"packages"],&json!({"expected_revision":input["expected_revision"],"source":input["source"]})).await?.value()?,
            "module.list" => {
                let mut query = vec![];
                for key in ["repository","after","limit"] {
                    if let Some(value) = input.get(key) { query.push((key.into(),value.as_str().map(str::to_owned).unwrap_or_else(||value.to_string()))); }
                }
                let result = self.client.request("GET",&["api","v1","module-packages"],&query,None).await?.value()?;
                let mut out = Envelope::ok(op,result.clone());
                out.next_cursor = result["next_cursor"].as_str().map(str::to_owned);
                return Ok(out);
            }
            "module.inspect" => serde_json::to_value(self.package_view(input).await?)?,
            "module.export" => {
                let package = self.package_view(input).await?;
                let source: Source = serde_json::from_value(self.client.get(&["api","v1","module-packages",&package.digest]).await?.value()?)?;
                if source.digest()? != package.digest { return Err(Error::new("unsupported_protocol","module package source digest mismatch")); }
                json!({"package":package,"source":source})
            }
            _ => return Err(Error::new("unsupported_operation","unknown module repository operation")),
        };
        let mut out = Envelope::ok(op, value.clone());
        if let Some(repository) = input["repository"].as_str() {
            out.refs
                .insert("repository".into(), Some(repository.into()));
        }
        let revision = value.get("revision").and_then(Value::as_str).or_else(|| {
            value
                .pointer("/repository/revision")
                .and_then(Value::as_str)
        });
        if let Some(revision) = revision {
            out.refs
                .insert("repository_revision".into(), Some(revision.into()));
        }
        let package = value.get("package").unwrap_or(&value);
        if let Some(digest) = package["digest"].as_str() {
            out.refs
                .insert("package_digest".into(), Some(digest.into()));
        }
        if let Some(version) = package["version"].as_str() {
            out.refs
                .insert("package_version".into(), Some(version.into()));
        }
        if op == "module.export" {
            out.refs.insert(
                "source_digest".into(),
                Some(
                    package["digest"]
                        .as_str()
                        .ok_or_else(|| {
                            Error::new("unsupported_protocol", "package digest missing")
                        })?
                        .into(),
                ),
            );
        }
        Ok(out)
    }
}
