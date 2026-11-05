use crate::*;
use reqwest::{Client, Method};
use serde_json::{Value, json};
use std::{sync::Arc, time::Duration};
use url::Url;
use zeroize::Zeroizing;

#[derive(Clone)]
pub struct KernelClient {
    endpoint: Url,
    token: Option<Arc<Zeroizing<String>>>,
    http: Client,
}
pub struct Native {
    pub status: u16,
    pub text: String,
}
impl Native {
    pub fn value(&self) -> Result<Value> {
        if self.text.trim().is_empty() {
            Ok(Value::Null)
        } else {
            serde_json::from_str(&self.text)
                .map_err(|_| Error::new("unsupported_protocol", "kernel returned invalid JSON"))
        }
    }
}
impl KernelClient {
    pub fn new(endpoint: &str, token: Option<String>, timeout: Duration) -> Result<Self> {
        let endpoint = Url::parse(endpoint)
            .map_err(|_| Error::new("local_input", "invalid kernel endpoint"))?;
        if !matches!(endpoint.scheme(), "http" | "https")
            || endpoint.host_str().is_none()
            || !endpoint.username().is_empty()
            || endpoint.password().is_some()
            || endpoint.query().is_some()
            || endpoint.fragment().is_some()
            || !matches!(endpoint.path(), "" | "/")
        {
            return Err(Error::new(
                "local_input",
                "kernel endpoint must be an HTTP(S) origin without credentials, path or query",
            ));
        }
        if timeout.is_zero() {
            return Err(Error::new(
                "local_input",
                "request timeout must be positive",
            ));
        }
        if token
            .as_ref()
            .is_some_and(|t| t.is_empty() || t.chars().any(char::is_whitespace))
        {
            return Err(Error::new("local_input", "invalid kernel access token"));
        }
        let http = Client::builder()
            .redirect(reqwest::redirect::Policy::none())
            .timeout(timeout)
            .build()
            .map_err(|_| Error::new("local_io", "HTTP client initialization failed"))?;
        Ok(Self {
            endpoint,
            token: token.map(|s| Arc::new(Zeroizing::new(s))),
            http,
        })
    }
    /// HTTP MCP supplies a different identity for each request. There is no
    /// fallback from a missing caller token to the process' stdio identity.
    pub fn with_token(&self, token: String) -> Self {
        let mut client = self.clone();
        client.token = Some(Arc::new(Zeroizing::new(token)));
        client
    }
    pub fn without_token(&self) -> Self {
        let mut client = self.clone();
        client.token = None;
        client
    }
    pub fn endpoint(&self) -> &str {
        self.endpoint.as_str()
    }
    fn url(&self, segments: &[&str], query: &[(String, String)]) -> Result<Url> {
        let mut url = self.endpoint.clone();
        {
            let mut path = url
                .path_segments_mut()
                .map_err(|_| Error::new("local_input", "invalid kernel URL"))?;
            path.clear();
            for s in segments {
                path.push(s);
            }
        }
        if !query.is_empty() {
            url.query_pairs_mut()
                .extend_pairs(query.iter().map(|(a, b)| (a.as_str(), b.as_str())));
        }
        Ok(url)
    }
    pub async fn request(
        &self,
        method: &str,
        path: &[&str],
        query: &[(String, String)],
        body: Option<String>,
    ) -> Result<Native> {
        let write = method != "GET";
        let method = Method::from_bytes(method.as_bytes())
            .map_err(|_| Error::new("local_input", "invalid internal HTTP method"))?;
        let mut request = self
            .http
            .request(method, self.url(path, query)?)
            .header("accept", "application/json");
        if let Some(token) = &self.token {
            request = request.bearer_auth(token.as_str());
        }
        if let Some(body) = body {
            request = request
                .header("content-type", "application/json")
                .body(body);
        }
        let response = request.send().await.map_err(|e| {
            let mut error = Error::new(
                if write {
                    "result_unconfirmed"
                } else {
                    "unavailable"
                },
                if e.is_timeout() {
                    "kernel request timed out"
                } else {
                    "kernel request transport failed"
                },
            );
            error.unconfirmed = write;
            error.details =
                json!({"origin":"transport","delivery":if write{"unconfirmed"}else{"read_failed"}});
            error
        })?;
        let status = response.status();
        let body = response.text().await.map_err(|_| {
            let mut e = Error::new(
                if write {
                    "result_unconfirmed"
                } else {
                    "unavailable"
                },
                "kernel response was interrupted",
            );
            e.unconfirmed = write;
            e
        })?;
        if !status.is_success() {
            let value: Value = serde_json::from_str(&body).unwrap_or(Value::Null);
            let missing = (status.as_u16() == 422)
                .then(|| missing_native_field(&body))
                .flatten();
            let mut details = json!({"origin":"kernel","http_status":status.as_u16()});
            if let Some(field) = missing {
                details["missing_field"] = json!(field);
            }
            return Err(Error {
                code: value
                    .pointer("/error/code")
                    .and_then(Value::as_str)
                    .unwrap_or(if missing.is_some() {
                        "invalid"
                    } else {
                        "http_error"
                    })
                    .into(),
                message: value
                    .pointer("/error/message")
                    .and_then(Value::as_str)
                    .map(str::to_owned)
                    .unwrap_or_else(|| match missing {
                        Some(field) => {
                            format!("kernel JSON request is missing required field: {field}")
                        }
                        None => "kernel rejected request".into(),
                    }),
                details,
                unconfirmed: false,
                refs: Default::default(),
            });
        }
        Ok(Native {
            status: status.as_u16(),
            text: body,
        })
    }
    pub async fn get(&self, path: &[&str]) -> Result<Native> {
        self.request("GET", path, &[], None).await
    }
    pub async fn send(&self, method: &str, path: &[&str], value: &Value) -> Result<Native> {
        self.request(method, path, &[], Some(serde_json::to_string(value)?))
            .await
    }
    pub async fn authorize(&self) -> Result<Value> {
        self.get(&["api", "v1", "access"]).await?.value()
    }
    pub async fn factories(&self) -> Result<Value> {
        self.get(&["api", "v1", "modules"]).await?.value()
    }
}

// Axum's non-JSON extractor rejection may include user values. Expose only a
// recognized DTO field, never the response body or arbitrary parser text.
fn missing_native_field(body: &str) -> Option<&str> {
    let rest = body.strip_prefix(
        "Failed to deserialize the JSON body into the target type: missing field `",
    )?;
    let (field, _) = rest.split_once('`')?;
    [
        "command",
        "request",
        "run_id",
        "thread_id",
        "command_id",
        "kind",
        "system",
        "release",
        "program",
        "target_run_id",
        "expected_request",
        "workflow_path",
        "value",
        "scope",
        "allow",
    ]
    .contains(&field)
    .then_some(field)
}
