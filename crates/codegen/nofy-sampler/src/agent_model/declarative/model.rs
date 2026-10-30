use super::*;
pub(super) struct ConnectedModel {
    connection: Arc<Connection>,
    metadata: SamplerModel,
}
impl ConnectedModel {
    pub fn new(connection: Arc<Connection>, name: &str) -> Result<Self, Error> {
        let mut config = connection.config.clone();
        config.model = name.into();
        let mut metadata = SamplerModel::new(config);
        metadata.pinned = true;
        if let Some(limits) = connection.limits.get(name) {
            metadata = metadata.with_request_limits(limits.clone())?;
        }
        Ok(Self {
            connection,
            metadata,
        })
    }
    fn context(&self, context: &RunContext) -> RunContext {
        let mut clean = context.clone();
        clean.capabilities.remove::<SamplerConfig>();
        clean
    }
    async fn configured(&self) -> Result<SamplerModel, Error> {
        let mut config = self.metadata.config.clone();
        async fn credential(connection: &Connection, reference: &str) -> Result<String, Error> {
            connection
                .credentials
                .resolve(reference)
                .await?
                .filter(|value| !value.trim().is_empty())
                .ok_or_else(|| {
                    nofy_agent_runtime::model::ModelFailure {
                        category: "configuration".into(),
                        message: format!("credential reference unavailable: {reference}"),
                        status: None,
                        retryable: false,
                        retry_after_ms: None,
                        code: Some("credential_unavailable".into()),
                        details: Value::Null,
                    }
                    .into()
                })
        }
        if let Some(reference) = &self.connection.credential_ref {
            config.api_key = Some(credential(&self.connection, reference).await?);
        }
        for (header, reference) in &self.connection.header_refs {
            config.extra_headers.insert(
                header.clone(),
                credential(&self.connection, reference).await?,
            );
        }
        let mut model = SamplerModel::new(config);
        model.pinned = true;
        model.limits = self.metadata.limits.clone();
        Ok(model)
    }
}
#[async_trait::async_trait]
impl Model for ConnectedModel {
    fn bind_scope(&self, context: &mut RunContext) -> Result<(), Error> {
        context.capabilities.remove::<SamplerConfig>();
        Ok(())
    }
    fn capabilities(&self) -> ModelCapabilities {
        self.metadata.capabilities()
    }
    fn validate_settings(&self, settings: &Value) -> Result<(), Error> {
        self.metadata.validate_settings(settings)
    }
    fn calls_used(&self, response: &ModelResponse) -> Option<u64> {
        self.metadata.calls_used(response)
    }
    fn request_bound(
        &self,
        request: &ModelRequest,
        context: &RunContext,
    ) -> Result<nofy_agent_runtime::model::ModelRequestBound, Error> {
        self.metadata.request_bound(request, &self.context(context))
    }
    async fn complete(
        &self,
        request: ModelRequest,
        context: &RunContext,
    ) -> Result<ModelResponse, Error> {
        self.configured()
            .await?
            .complete(request, &self.context(context))
            .await
    }
    async fn stream(
        &self,
        request: ModelRequest,
        context: &RunContext,
    ) -> Result<ModelStream, Error> {
        self.configured()
            .await?
            .stream(request, &self.context(context))
            .await
    }
}
