//! Message transport is separate from the shared JSON-RPC session validator.
use super::*;
use nofy_tool_runtime::ToolCallContext;
use std::sync::Arc;

#[async_trait::async_trait]
pub trait StdioProvider: Send + Sync {
    async fn open(&self, context: &ToolCallContext) -> Result<Arc<dyn StdioChannel>, ToolError>;
}
#[async_trait::async_trait]
pub trait StdioChannel: Send + Sync {
    async fn send(&self, message: &Value) -> Result<(), ToolError>;
    async fn receive(&self, limit: usize) -> Result<Value, ToolError>;
    fn close(&self);
}
pub struct Connection {
    http: Option<Arc<http::Connection>>,
    provider: Option<Arc<dyn StdioProvider>>,
    channel: Option<Arc<dyn StdioChannel>>,
}
impl Connection {
    pub(super) fn http(connection: Arc<http::Connection>) -> Self {
        Self {
            http: Some(connection),
            provider: None,
            channel: None,
        }
    }
    pub fn stdio(provider: Arc<dyn StdioProvider>) -> Self {
        Self {
            http: None,
            provider: Some(provider),
            channel: None,
        }
    }
    pub(super) async fn open(
        self: &Arc<Self>,
        context: &ToolCallContext,
    ) -> Result<Arc<Self>, ToolError> {
        if let Some(provider) = &self.provider {
            return Ok(Arc::new(Self {
                http: None,
                provider: None,
                channel: Some(provider.open(context).await?),
            }));
        }
        Ok(self.clone())
    }
    pub(super) fn channel(&self) -> Option<&Arc<dyn StdioChannel>> {
        self.channel.as_ref()
    }
    pub(super) async fn post(
        &self,
        message: &Value,
        session: Option<&str>,
        context: &ToolCallContext,
    ) -> Result<reqwest::Response, ToolError> {
        self.http
            .as_ref()
            .ok_or_else(|| protocol("HTTP response requested on stdio transport"))?
            .post(message, session, context)
            .await
    }
    pub(super) async fn notify(
        &self,
        message: &Value,
        session: Option<&str>,
        context: &ToolCallContext,
    ) -> Result<(), ToolError> {
        if let Some(channel) = &self.channel {
            return channel.send(message).await;
        }
        self.http
            .as_ref()
            .ok_or_else(|| protocol("MCP transport is not open"))?
            .notify(message, session, context)
            .await
    }
    pub(super) fn cancel(
        self: &Arc<Self>,
        id: u64,
        session: Option<String>,
        context: ToolCallContext,
    ) {
        if let Some(http) = &self.http {
            http.cancel(id, session, context);
            return;
        }
        if let Some(channel) = &self.channel {
            let channel = channel.clone();
            if let Ok(runtime) = tokio::runtime::Handle::try_current() {
                runtime.spawn(async move {let _=tokio::time::timeout(std::time::Duration::from_millis(500),channel.send(&json!({"jsonrpc":"2.0","method":"notifications/cancelled","params":{"requestId":id,"reason":"caller stopped waiting"}}))).await;});
            }
        }
    }
    pub(super) fn close(self: &Arc<Self>, session: Option<String>) {
        if let Some(channel) = &self.channel {
            channel.close();
        }
        if let (Some(http), Some(session)) = (&self.http, session) {
            http.close(session);
        }
    }
}
