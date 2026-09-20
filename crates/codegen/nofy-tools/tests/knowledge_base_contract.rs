use std::collections::HashMap;

use nofy_tools::types::knowledge_base::{
    KnowledgeBaseError, KnowledgeBaseProvider, KnowledgeBaseResult, KnowledgeContentHash,
    KnowledgeDocument, KnowledgeDocumentId, KnowledgeHit, KnowledgeQuery,
};

struct FakeKnowledgeBase {
    documents: HashMap<String, KnowledgeDocument>,
}

#[async_trait::async_trait]
impl KnowledgeBaseProvider for FakeKnowledgeBase {
    async fn search(&self, request: KnowledgeQuery) -> KnowledgeBaseResult<Vec<KnowledgeHit>> {
        Ok(self
            .documents
            .values()
            .filter(|document| document.body.contains(&request.query))
            .take(request.limit)
            .map(|document| KnowledgeHit {
                id: document.id.clone(),
                title: document.title.clone(),
                snippet: document.body.clone(),
                source_uri: document.source_uri.clone(),
                score: 1.0,
                content_hash: document.content_hash.clone(),
            })
            .collect())
    }

    async fn get(&self, id: KnowledgeDocumentId) -> KnowledgeBaseResult<KnowledgeDocument> {
        self.documents
            .get(&id.0)
            .cloned()
            .ok_or(KnowledgeBaseError::NotFound)
    }
}

#[tokio::test]
async fn provider_contract_supports_search_and_get_without_memory_integration() {
    let document = KnowledgeDocument {
        id: KnowledgeDocumentId("doc-1".to_owned()),
        title: "Build Guide".to_owned(),
        body: "Use cargo nextest in CI.".to_owned(),
        source_uri: "kb://build-guide".to_owned(),
        content_hash: KnowledgeContentHash([7; 32]),
    };
    let provider: Box<dyn KnowledgeBaseProvider> = Box::new(FakeKnowledgeBase {
        documents: HashMap::from([(document.id.0.clone(), document.clone())]),
    });

    let hits = provider
        .search(KnowledgeQuery {
            query: "nextest".to_owned(),
            limit: 5,
        })
        .await
        .unwrap();
    assert_eq!(hits.len(), 1);
    assert_eq!(provider.get(hits[0].id.clone()).await.unwrap(), document);
}
