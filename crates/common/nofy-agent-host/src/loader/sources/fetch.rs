use super::*;
use futures::StreamExt;
use nofy_agent_runtime::credentials::CredentialProvider;
use std::time::Duration;
use tokio_util::sync::CancellationToken;
type Failure = (&'static str, HostError);
type WorkPermit = Arc<tokio::sync::OwnedSemaphorePermit>;
fn rejected(code: &'static str, message: &'static str) -> Failure {
    (code, invalid(message))
}
async fn download(
    attempt: &Acquisition,
    credentials: Option<Arc<dyn CredentialProvider>>,
    permit: WorkPermit,
) -> std::result::Result<(images::RuntimeImage, WorkPermit), Failure> {
    let base = attempt.policy.validate().map_err(|e| ("policy", e))?;
    let target = base
        .join(&attempt.request.path)
        .map_err(|_| rejected("policy", "invalid source relative path"))?;
    if target.origin() != base.origin() || !target.path().starts_with(base.path()) {
        return Err(rejected(
            "policy",
            "source request escaped authorized origin",
        ));
    }
    let client = reqwest::Client::builder()
        .no_proxy()
        .redirect(reqwest::redirect::Policy::none())
        .referer(false)
        .no_gzip()
        .no_brotli()
        .no_deflate()
        .no_zstd()
        .connect_timeout(Duration::from_secs(5))
        .read_timeout(Duration::from_secs(5))
        .timeout(Duration::from_secs(30))
        .build()
        .map_err(|_| rejected("transport", "source client unavailable"))?;
    let mut request = client
        .get(target)
        .header(reqwest::header::ACCEPT_ENCODING, "identity");
    if let Some(reference) = &attempt.policy.credential_ref {
        let provider = credentials
            .ok_or_else(|| rejected("credential", "source credentials are unavailable"))?;
        let secret = provider
            .resolve(reference)
            .await
            .map_err(|_| rejected("credential", "source credentials are unavailable"))?
            .filter(|s| !s.trim().is_empty() && s.len() <= 16384)
            .ok_or_else(|| rejected("credential", "source credential is missing"))?;
        let mut value = reqwest::header::HeaderValue::from_str(&format!("Bearer {secret}"))
            .map_err(|_| {
                rejected(
                    "credential",
                    "source credential is not a valid bearer token",
                )
            })?;
        value.set_sensitive(true);
        request = request.header(reqwest::header::AUTHORIZATION, value);
    }
    let response = request
        .send()
        .await
        .map_err(|_| rejected("transport", "source transport failed"))?;
    if response.status() != reqwest::StatusCode::OK {
        return Err(rejected(
            "transport",
            "source did not return status 200; redirects are forbidden",
        ));
    }
    if response
        .headers()
        .get(reqwest::header::CONTENT_ENCODING)
        .is_some_and(|v| v.as_bytes() != b"identity")
    {
        return Err(rejected("payload", "encoded source transport is forbidden"));
    }
    let expected = &attempt.request.attestation;
    if response
        .content_length()
        .is_some_and(|length| length != expected.payload_size)
    {
        return Err(rejected(
            "payload",
            "source content length differs from signed claim",
        ));
    }
    let mut stream = response.bytes_stream();
    let mut bytes = Vec::new();
    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|_| rejected("transport", "source body read failed"))?;
        if (bytes.len() as u64).saturating_add(chunk.len() as u64) > expected.payload_size {
            return Err(rejected("payload", "source body exceeds signed size"));
        }
        bytes.extend_from_slice(&chunk);
    }
    if bytes.len() as u64 != expected.payload_size
        || storage::hash(&bytes) != expected.payload_digest
    {
        return Err(rejected("payload", "source payload digest/size mismatch"));
    }
    let digest = expected.manifest_digest.clone();
    tokio::task::spawn_blocking(move || {
        let image: images::RuntimeImage = serde_json::from_slice(&bytes)
            .map_err(|_| rejected("image", "source image JSON is invalid"))?;
        image
            .validate()
            .map_err(|_| rejected("image", "source image closure is invalid"))?;
        if image.manifest.digest().map_err(|e| ("image", e))? != digest {
            return Err(rejected(
                "image",
                "source manifest identity differs from signed claim",
            ));
        }
        Ok((image, permit))
    })
    .await
    .map_err(|_| rejected("image", "source image verification task failed"))?
}
impl Loader {
    pub async fn acquire_image(
        &self,
        command: AcquireImage,
        cancel: CancellationToken,
    ) -> Result<Acquisition> {
        let operation = async {
            let permit = self
                .sources
                .work
                .clone()
                .acquire_owned()
                .await
                .map_err(storage::unavailable)?;
            let permit = Arc::new(permit);
            let sources = self.sources.clone();
            let (started, permit) =
                tokio::task::spawn_blocking(move || (sources.begin(command), permit))
                    .await
                    .map_err(storage::unavailable)?;
            let attempt = match started? {
                store::Begin::Complete(record) => return Ok(record),
                store::Begin::Attempt(record) => record,
            };
            let credentials = self.source_credentials.borrow().clone();
            let result = tokio::time::timeout(
                Duration::from_secs(30),
                download(&attempt, credentials, permit.clone()),
            )
            .await
            .unwrap_or_else(|_| {
                Err(rejected(
                    "transport",
                    "source acquisition exceeded its deadline",
                ))
            });
            let result = match result {
                Ok((image, permit)) => {
                    let sources = self.sources.clone();
                    let images = self.images.clone();
                    let receipt = attempt.clone();
                    tokio::task::spawn_blocking(move || {
                        let _permit = permit;
                        sources.finish(&receipt, image, &images)
                    })
                    .await
                    .map_err(storage::unavailable)?
                    .map_err(|e| ("admission", e))
                }
                Err(error) => Err(error),
            };
            match result {
                Ok(receipt) => Ok(receipt),
                Err((code, error)) => {
                    let store = self.sources.clone();
                    // A failed status write may leave Pending, never a false
                    // success. Exact retry reuses the same durable intent.
                    let _ = tokio::task::spawn_blocking(move || {
                        // Retain admission across the failure fsync too. A
                        // cancelled caller must not release a slot while this
                        // blocking task is still waiting for the catalog lock.
                        let _permit = permit;
                        store.fail(&attempt, code)
                    })
                    .await;
                    Err(error)
                }
            }
        };
        tokio::select! {biased;
            _=self.acquisition_stop.cancelled()=>Err(HostError::Unavailable("source acquisition stopped with host; inspect its durable intent".into())),
            _=cancel.cancelled()=>Err(HostError::Unavailable("source acquisition interrupted; inspect its durable intent".into())),
            result=operation=>result,
        }
    }
}
