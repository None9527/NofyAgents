//! Actual signed dependency origin, separate from the portable Agent declaration.
use axum::{
    Router,
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::get,
};
use base64::{Engine, engine::general_purpose::STANDARD};
use ed25519_dalek::SigningKey;
use nofy_agent_host::loader::{
    Loader,
    images::RuntimeImage,
    sources::{AcquireImage, BootstrapSource, ImageAttestation, SourcePolicy},
};
use serde_json::{Value, json};
use std::{
    collections::BTreeMap,
    io::Read,
    sync::{
        Arc, Mutex,
        atomic::{AtomicUsize, Ordering},
    },
};
use zeroize::Zeroize;

type Objects = Arc<Mutex<BTreeMap<String, Vec<u8>>>>;

pub struct Repository {
    id: String,
    policy: SourcePolicy,
    seed: [u8; 32],
    objects: Objects,
    requirements: Mutex<BTreeMap<String, Value>>,
    requests: Arc<AtomicUsize>,
    task: tokio::task::JoinHandle<()>,
}

impl Repository {
    pub async fn new(loader: &Loader) -> Self {
        static NEXT: AtomicUsize = AtomicUsize::new(0);
        let id = format!(
            "preset-dependencies-{}",
            NEXT.fetch_add(1, Ordering::SeqCst)
        );
        let objects: Objects = Default::default();
        let requests = Arc::new(AtomicUsize::new(0));
        async fn reply(
            State((objects, requests)): State<(Objects, Arc<AtomicUsize>)>,
            Path(object): Path<String>,
        ) -> impl IntoResponse {
            requests.fetch_add(1, Ordering::SeqCst);
            objects
                .lock()
                .unwrap()
                .get(&object)
                .cloned()
                .ok_or(StatusCode::NOT_FOUND)
        }
        let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
        let mut seed = [0; 32];
        std::fs::File::open("/dev/urandom")
            .unwrap()
            .read_exact(&mut seed)
            .unwrap();
        let policy = SourcePolicy {
            base_url: format!("http://{}/dependencies/", listener.local_addr().unwrap()),
            keys: [(
                "publisher".into(),
                STANDARD.encode(SigningKey::from_bytes(&seed).verifying_key().to_bytes()),
            )]
            .into(),
            credential_ref: None,
            allow_loopback_http: true,
        };
        let router = Router::new()
            .route("/dependencies/{object}", get(reply))
            .with_state((objects.clone(), requests.clone()));
        let task = tokio::spawn(async move { axum::serve(listener, router).await.unwrap() });
        let repository = Self {
            id,
            policy,
            seed,
            objects,
            requirements: Default::default(),
            requests,
            task,
        };
        repository.authorize(loader);
        repository
    }

    pub fn authorize(&self, loader: &Loader) {
        loader
            .sources
            .bootstrap(vec![BootstrapSource {
                id: self.id.clone(),
                expected_revision: None,
                policy: self.policy.clone(),
            }])
            .unwrap();
    }

    pub fn requirement(&self, image: &RuntimeImage) -> Value {
        let digest = image.manifest.digest().unwrap();
        let mut requirements = self.requirements.lock().unwrap();
        requirements
            .entry(digest.clone())
            .or_insert_with(|| {
                let payload = serde_json::to_vec(image).unwrap();
                let (attestation, key) =
                    ImageAttestation::sign(&payload, "publisher".into(), &self.seed).unwrap();
                assert_eq!(self.policy.keys["publisher"], key);
                let path = format!("{digest}.json");
                assert!(
                    self.objects
                        .lock()
                        .unwrap()
                        .insert(path.clone(), payload)
                        .is_none()
                );
                let source = AcquireImage {
                    command_id: format!("obtain-{digest}"),
                    source: self.id.clone(),
                    policy_digest: self.policy.digest().unwrap(),
                    path,
                    attestation,
                };
                json!({"manifest":image.manifest,"source":source})
            })
            .clone()
    }

    pub fn requests(&self) -> usize {
        self.requests.load(Ordering::SeqCst)
    }
}

impl Drop for Repository {
    fn drop(&mut self) {
        self.seed.zeroize();
        self.task.abort();
    }
}
