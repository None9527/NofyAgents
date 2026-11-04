use async_trait::async_trait;
use nofy_memory::config::MemoryIndexConfig;
use nofy_memory::embedding::EmbeddingProvider;
use nofy_memory::index::MemoryIndex;
use nofy_memory::storage::MemoryStorage;

struct FailingEmbeddingProvider;

#[async_trait]
impl EmbeddingProvider for FailingEmbeddingProvider {
    async fn embed_batch(
        &self,
        _texts: &[&str],
    ) -> Result<Vec<Vec<f32>>, Box<dyn std::error::Error>> {
        Err("injected embedding failure".into())
    }

    fn model_name(&self) -> &str {
        "failing-test-provider"
    }

    fn dimensions(&self) -> usize {
        4
    }
}

#[tokio::test]
async fn embedding_failure_keeps_keyword_search_available() {
    let temp = tempfile::tempdir().unwrap();
    let root = temp.path().join("memory");
    let note = root.join("topic.md");
    std::fs::create_dir_all(&root).unwrap();
    std::fs::write(&note, "# Build\n\nUse cargo nextest for Rust tests.").unwrap();
    let storage = MemoryStorage::new_flat(&root, &root);
    let mut index = MemoryIndex::open_or_create(
        &root.join("index.sqlite"),
        storage,
        MemoryIndexConfig::default(),
        4,
    )
    .unwrap();
    index.reindex_file(&note, "workspace", "agent").unwrap();

    assert_eq!(
        nofy_memory::embed_missing_chunks(&index, &FailingEmbeddingProvider).await,
        0
    );
    assert_eq!(index.search_fts("cargo nextest", 5).unwrap().len(), 1);
}
