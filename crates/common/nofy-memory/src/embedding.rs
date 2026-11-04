//! Explicit embeddings protocol. The caller supplies endpoint, model and client;
//! Authentication, deadlines and retry policy belong to the controller.
use async_trait::async_trait;

type EmbeddingResult<T> = Result<T, Box<dyn std::error::Error>>;
const MAX_RESPONSE: usize = 8 * 1024 * 1024;

#[async_trait]
pub trait EmbeddingProvider: Send + Sync {
    async fn embed_batch(&self, texts: &[&str]) -> EmbeddingResult<Vec<Vec<f32>>>;
    fn model_name(&self) -> &str;
    fn dimensions(&self) -> usize;
}

pub struct ApiEmbeddingProvider {
    endpoint: reqwest::Url,
    model: String,
    dimensions: usize,
    client: reqwest_middleware::ClientWithMiddleware,
}
impl ApiEmbeddingProvider {
    pub fn new(
        api_base: String,
        model: String,
        dimensions: usize,
        client: reqwest_middleware::ClientWithMiddleware,
    ) -> EmbeddingResult<Self> {
        let mut endpoint =
            reqwest::Url::parse(&api_base).map_err(|_| "invalid embedding endpoint")?;
        if !matches!(endpoint.scheme(), "http" | "https")
            || endpoint.host_str().is_none()
            || !endpoint.username().is_empty()
            || endpoint.password().is_some()
            || endpoint.query().is_some()
            || endpoint.fragment().is_some()
            || model.trim().is_empty()
            || model.len() > 256
            || !(1..=4096).contains(&dimensions)
        {
            return Err("invalid embedding connection".into());
        }
        endpoint.set_path(&format!(
            "{}/embeddings",
            endpoint.path().trim_end_matches('/')
        ));
        Ok(Self {
            endpoint,
            model,
            dimensions,
            client,
        })
    }
    async fn request(&self, texts: &[&str]) -> EmbeddingResult<Vec<Vec<f32>>> {
        let body = serde_json::to_vec(&serde_json::json!({
            "model":self.model,"input":texts,"dimensions":self.dimensions,
        }))?;
        if body.len() > MAX_RESPONSE {
            return Err("embedding input exceeds 8 MiB".into());
        }
        let mut response = self
            .client
            .post(self.endpoint.clone())
            .header(reqwest::header::CONTENT_TYPE, "application/json")
            .body(body)
            .send()
            .await
            .map_err(|_| "embedding transport failed")?;
        if !response.status().is_success() {
            // Provider bodies may contain inputs or credentials; never echo them.
            return Err(format!(
                "embedding endpoint returned HTTP {}",
                response.status().as_u16()
            )
            .into());
        }
        if response
            .content_length()
            .is_some_and(|n| n > MAX_RESPONSE as u64)
        {
            return Err("embedding response exceeds 8 MiB".into());
        }
        let mut bytes = Vec::new();
        while let Some(chunk) = response
            .chunk()
            .await
            .map_err(|_| "embedding response failed")?
        {
            if bytes.len().saturating_add(chunk.len()) > MAX_RESPONSE {
                return Err("embedding response exceeds 8 MiB".into());
            }
            bytes.extend_from_slice(&chunk);
        }
        decode(&bytes, texts.len(), self.dimensions)
    }
}
#[async_trait]
impl EmbeddingProvider for ApiEmbeddingProvider {
    async fn embed_batch(&self, texts: &[&str]) -> EmbeddingResult<Vec<Vec<f32>>> {
        let mut result = Vec::with_capacity(texts.len());
        for batch in texts.chunks(32) {
            result.extend(self.request(batch).await?);
        }
        Ok(result)
    }
    fn model_name(&self) -> &str {
        &self.model
    }
    fn dimensions(&self) -> usize {
        self.dimensions
    }
}

fn decode(bytes: &[u8], count: usize, dimensions: usize) -> EmbeddingResult<Vec<Vec<f32>>> {
    #[derive(serde::Deserialize)]
    struct Response {
        data: Vec<Item>,
    }
    #[derive(serde::Deserialize)]
    struct Item {
        index: usize,
        embedding: Vec<f32>,
    }
    let response: Response =
        serde_json::from_slice(bytes).map_err(|_| "invalid embedding response")?;
    if response.data.len() != count {
        return Err("embedding response count mismatch".into());
    }
    let mut ordered = vec![None; count];
    for item in response.data {
        if item.index >= count
            || ordered[item.index].is_some()
            || item.embedding.len() != dimensions
            || item.embedding.iter().any(|value| !value.is_finite())
        {
            return Err("invalid embedding response vectors or indices".into());
        }
        ordered[item.index] = Some(item.embedding);
    }
    ordered
        .into_iter()
        .map(|item| item.ok_or_else(|| "embedding response missing index".into()))
        .collect()
}

#[cfg(test)]
mod protocol_tests {
    use super::*;
    #[test]
    fn vectors_follow_explicit_indices_not_response_order() {
        assert_eq!(
            decode(
                br#"{"data":[{"index":1,"embedding":[0,1]},{"index":0,"embedding":[1,0]}]}"#,
                2,
                2
            )
            .unwrap(),
            vec![vec![1.0, 0.0], vec![0.0, 1.0]]
        );
    }
    #[test]
    fn malformed_vectors_are_not_silently_filtered() {
        for body in [
            r#"{"data":[]}"#,
            r#"{"data":[{"index":0,"embedding":[1]}]}"#,
            r#"{"data":[{"index":1,"embedding":[1,0]}]}"#,
            r#"{"data":[{"index":0,"embedding":["bad",0]}]}"#,
            r#"{"data":[{"index":0,"embedding":[1e100,0]}]}"#,
        ] {
            assert!(decode(body.as_bytes(), 1, 2).is_err(), "{body}");
        }
        assert!(
            decode(
                br#"{"data":[{"index":0,"embedding":[1,0]},{"index":0,"embedding":[0,1]}]}"#,
                2,
                2
            )
            .is_err()
        );
    }
}

/// A mock embedding provider for testing that returns deterministic vectors.
/// Uses blake3 hash of text → float values for reproducible results.
#[cfg(any(test, feature = "test-support"))]
pub struct MockEmbeddingProvider {
    pub dimensions: usize,
}

#[cfg(any(test, feature = "test-support"))]
#[async_trait]
impl EmbeddingProvider for MockEmbeddingProvider {
    async fn embed_batch(
        &self,
        texts: &[&str],
    ) -> Result<Vec<Vec<f32>>, Box<dyn std::error::Error>> {
        Ok(texts
            .iter()
            .map(|text| {
                let hash = blake3::hash(text.as_bytes());
                let bytes = hash.as_bytes();
                (0..self.dimensions)
                    .map(|i| bytes[i % 32] as f32 / 255.0)
                    .collect()
            })
            .collect())
    }

    fn model_name(&self) -> &str {
        "mock-embedding"
    }

    fn dimensions(&self) -> usize {
        self.dimensions
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_mock_embedding_deterministic() {
        let provider = MockEmbeddingProvider { dimensions: 4 };
        let r1 = provider.embed_batch(&["hello"]).await.unwrap();
        let r2 = provider.embed_batch(&["hello"]).await.unwrap();
        assert_eq!(r1, r2);
    }

    #[tokio::test]
    async fn test_mock_embedding_different_texts() {
        let provider = MockEmbeddingProvider { dimensions: 4 };
        let results = provider.embed_batch(&["hello", "world"]).await.unwrap();
        assert_eq!(results.len(), 2);
        assert_ne!(results[0], results[1]);
    }

    #[tokio::test]
    async fn test_mock_embedding_empty_input() {
        let provider = MockEmbeddingProvider { dimensions: 4 };
        let results = provider.embed_batch(&[]).await.unwrap();
        assert!(results.is_empty());
    }

    #[tokio::test]
    async fn test_mock_embedding_correct_dimensions() {
        let provider = MockEmbeddingProvider { dimensions: 128 };
        let results = provider.embed_batch(&["test"]).await.unwrap();
        assert_eq!(results[0].len(), 128);
    }
}
