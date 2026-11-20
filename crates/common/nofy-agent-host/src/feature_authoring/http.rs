use super::*;

#[derive(Clone, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct FeatureHttpAuthorization {
    pub base_url: String,
    pub direct_path: String,
    pub catalog_path: String,
    pub invoke_path: String,
    pub discovered_tool: String,
}

impl FeatureHttpAuthorization {
    pub(super) fn valid(&self) -> bool {
        url::Url::parse(&self.base_url).is_ok_and(|url| {
            url.scheme() == "http"
                && url.host_str() == Some("127.0.0.1")
                && url.port().is_some()
                && url.path() == "/"
                && url.query().is_none()
                && url.fragment().is_none()
                && url.username().is_empty()
                && url.password().is_none()
        }) && valid_name(&self.discovered_tool)
            && [&self.direct_path, &self.catalog_path, &self.invoke_path]
                .into_iter()
                .all(|path| valid_name(path))
    }
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub(super) struct Design {
    pub tool_name: String,
    description: String,
    input_schema: Value,
    direct_path: String,
    catalog_path: String,
    invoke_path: String,
}

impl Design {
    pub(super) fn modules(
        &self,
        grant: &FeatureHttpAuthorization,
        r: &impl Fn(&str) -> ModuleRef,
    ) -> Result<[Value; 3]> {
        if !valid_name(&self.tool_name)
            || self.description.trim().is_empty()
            || self.description.len() > 1024
            || !self.input_schema.is_object()
            || serde_json::to_vec(&self.input_schema).map_or(true, |value| value.len() > 4096)
            || self.direct_path != grant.direct_path
            || self.catalog_path != grant.catalog_path
            || self.invoke_path != grant.invoke_path
        {
            return Err(HostError::Invalid(
                "invalid design or HTTP path outside grant".into(),
            ));
        }
        Ok([
            json!({"reference":r("http"),"factory":"resource.http","config":{"base_url":grant.base_url,"methods":["GET","POST"]}}),
            json!({"reference":r("http-tool"),"factory":"tool.http_connected","config":{"contract":{"name":self.tool_name,
                "description":self.description,"effect":"read_only","input_schema":self.input_schema},"method":"POST","path":self.direct_path},
                "dependencies":{"connection":r("http")}}),
            json!({"reference":r("http-source"),"factory":"tool_source.http","config":{"catalog_path":self.catalog_path,
                "invoke_path":self.invoke_path},"dependencies":{"connection":r("http")}}),
        ])
    }
}
