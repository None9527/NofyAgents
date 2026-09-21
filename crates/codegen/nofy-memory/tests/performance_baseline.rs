use std::time::{Duration, Instant};

use nofy_config_types::MemoryIndexConfig;
use nofy_memory::consolidation::{
    ConsolidationAction, ConsolidationEngine, ConsolidationMode, ConsolidationPlan,
};
use nofy_memory::index::MemoryIndex;
use nofy_memory::layout::UnifiedMemoryLayout;
use nofy_memory::model::{MemoryScope, ObservationId, OperationId, ProjectId};
use nofy_memory::state::UnifiedState;
use nofy_memory::storage::MemoryStorage;
use rusqlite::{Connection, params};

const STARTUP_LIMIT: Duration = Duration::from_secs(2);
const TOP_K_LIMIT: Duration = Duration::from_secs(1);
const CAPTURE_ENQUEUE_LIMIT: Duration = Duration::from_millis(250);
const CONSOLIDATION_BATCH_LIMIT: Duration = Duration::from_secs(5);

fn seed_observation_index(database: &std::path::Path, count: usize) {
    let mut connection = Connection::open(database).unwrap();
    connection
        .execute_batch("PRAGMA synchronous = OFF;")
        .unwrap();
    let transaction = connection.transaction().unwrap();
    {
        let mut chunks = transaction
            .prepare(
                "INSERT INTO chunks
                 (id, path, start_line, end_line, text, hash, source, origin,
                  object_id, object_kind, scope_kind, validity_kind, object_hash,
                  observation_kind, observation_status, created_at, updated_at)
                 VALUES (?1, ?2, 1, 1, ?3, ?4, 'observation', 'agent', ?1,
                         'observation', 'personal', 'project_wide', ?4,
                         'explicit', 'active', 1, 1)",
            )
            .unwrap();
        let mut fts = transaction
            .prepare("INSERT INTO chunks_fts(rowid, text) VALUES (?1, ?2)")
            .unwrap();
        for index in 0..count {
            let id = format!("observation-{index}");
            let path = format!("observations/{index}.md");
            let text = format!(
                "Rust project observation {index}: use cargo nextest and stable toolchains"
            );
            let hash = blake3::hash(text.as_bytes()).to_hex().to_string();
            chunks.execute(params![id, path, text, hash]).unwrap();
            let rowid = transaction.last_insert_rowid();
            fts.execute(params![rowid, text]).unwrap();
        }
    }
    transaction.commit().unwrap();
}

fn run_baseline(count: usize) {
    let temp = tempfile::tempdir().unwrap();
    let root = temp.path().join("memory");
    let personal = root.join("personal");
    let database = personal.join("index.sqlite");
    let storage = MemoryStorage::new_flat(&personal, &personal);
    drop(
        MemoryIndex::open_or_create(&database, storage.clone(), MemoryIndexConfig::default(), 4)
            .unwrap(),
    );
    seed_observation_index(&database, count);

    let started = Instant::now();
    let index =
        MemoryIndex::open_or_create(&database, storage, MemoryIndexConfig::default(), 4).unwrap();
    let startup = started.elapsed();

    let started = Instant::now();
    let results = index.search_fts("rust cargo nextest", 10).unwrap();
    let top_k = started.elapsed();
    assert_eq!(results.len(), 10);

    let layout = UnifiedMemoryLayout::new(&root);
    let scope = layout.personal_scope();
    let state = UnifiedState::open(layout.meta_database(), scope.state_database()).unwrap();
    let started = Instant::now();
    state
        .enqueue_capture_job(&format!("capture-{count}"), "{}", 1)
        .unwrap();
    let capture_enqueue = started.elapsed();

    let project_id = ProjectId::new();
    let engine = ConsolidationEngine::new(root, project_id, MemoryIndexConfig::default(), 4);
    let started = Instant::now();
    for batch_index in 0..64 {
        let plan = ConsolidationPlan {
            operation_id: OperationId::new(),
            scope: MemoryScope::Personal,
            evidence: vec![ObservationId::new()],
            actions: vec![ConsolidationAction::Create {
                path: format!("batch-{batch_index}.md").into(),
                content: format!("# Batch {batch_index}\n"),
            }],
        };
        engine
            .execute(
                &plan,
                ConsolidationMode::Shadow,
                "benchmark-worker",
                batch_index,
                None,
            )
            .unwrap();
    }
    let consolidation_batch = started.elapsed();

    println!(
        "observations={count} startup_ms={} top_k_ms={} capture_enqueue_us={} consolidation_64_ms={}",
        startup.as_millis(),
        top_k.as_millis(),
        capture_enqueue.as_micros(),
        consolidation_batch.as_millis(),
    );
    assert!(startup < STARTUP_LIMIT, "startup took {startup:?}");
    assert!(top_k < TOP_K_LIMIT, "top-K search took {top_k:?}");
    assert!(
        capture_enqueue < CAPTURE_ENQUEUE_LIMIT,
        "capture enqueue took {capture_enqueue:?}"
    );
    assert!(
        consolidation_batch < CONSOLIDATION_BATCH_LIMIT,
        "consolidation batch took {consolidation_batch:?}"
    );
}

#[test]
#[ignore = "release baseline; run explicitly with --ignored --nocapture"]
fn observation_scale_baseline_10k_and_100k() {
    for count in [10_000, 100_000] {
        run_baseline(count);
    }
}
