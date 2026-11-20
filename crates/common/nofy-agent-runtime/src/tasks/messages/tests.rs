use super::*;
use crate::{Checkpoint, InMemoryCheckpointer};

struct FailedSave {
    store: Arc<dyn Checkpointer>,
    commit_first: bool,
}
#[async_trait::async_trait]
impl Checkpointer for FailedSave {
    async fn load(&self, key: &str) -> Result<Option<Checkpoint>, Error> {
        self.store.load(key).await
    }
    async fn save(&self, key: &str, expected: Option<u64>, value: Checkpoint) -> Result<(), Error> {
        if self.commit_first {
            self.store.save(key, expected, value).await?;
        }
        Err(Error::Checkpoint("injected save uncertainty".into()))
    }
}
#[tokio::test]
async fn failed_or_uncertain_board_save_is_not_deliverable_until_reopen() {
    for commit_first in [false, true] {
        let store = Arc::new(InMemoryCheckpointer::default());
        let root = RunContext::new("parent-thread", "root");
        let child = RunContext::new("child-thread", "child");
        let failed = Arc::new(FailedSave {
            store: store.clone(),
            commit_first,
        });
        let board = Board::open(&root, Some(failed), "fixture").await.unwrap();
        assert!(
            board
                .send(&child, "report", "root", json!({"fact":1}))
                .await
                .is_err()
        );
        assert!(board.incoming(&root, 0, 0).await.is_err());
        assert!(board.read(&root, 0, 0).await.is_err());
        assert!(
            board
                .send(&child, "report", "root", json!({"fact":1}))
                .await
                .is_err()
        );
        drop(board);
        let reopened = Board::open(&root, Some(store), "fixture").await.unwrap();
        let message = reopened.incoming(&root, 0, 0).await.unwrap();
        assert_eq!(message.is_some(), commit_first);
        if let Some((cursor, report)) = message {
            assert_eq!(cursor, 1);
            assert_eq!(report["message_id"], "report");
            assert!(reopened.incoming(&root, cursor, 0).await.unwrap().is_none());
        }
    }
}

#[cfg(feature = "sqlite")]
struct CutAfterCommit {
    store: crate::durable::SqliteStore,
    committed: Arc<Notify>,
}
#[cfg(feature = "sqlite")]
#[async_trait::async_trait]
impl Checkpointer for CutAfterCommit {
    fn is_durable(&self) -> bool {
        true
    }
    async fn load(&self, key: &str) -> Result<Option<Checkpoint>, Error> {
        self.store.load(key).await
    }
    async fn save(&self, key: &str, expected: Option<u64>, value: Checkpoint) -> Result<(), Error> {
        self.store.save(key, expected, value).await?;
        self.committed.notify_one();
        // The sender is destroyed here, before Journal::commit returns and
        // before Board::send can publish its wake notification.
        std::future::pending().await
    }
}
#[cfg(feature = "sqlite")]
#[tokio::test]
async fn sqlite_reopen_discovers_report_committed_before_sender_notification() {
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("board.sqlite");
    let root = RunContext::new("parent-thread", "root");
    let child = RunContext::new("child-thread", "child");
    let committed = Arc::new(Notify::new());
    let board = Arc::new(
        Board::open(
            &root,
            Some(Arc::new(CutAfterCommit {
                store: crate::durable::SqliteStore::open(&path).unwrap(),
                committed: committed.clone(),
            })),
            "fixture",
        )
        .await
        .unwrap(),
    );
    let sender = tokio::spawn(async move {
        board
            .send(&child, "report", "root", json!({"verified":true}))
            .await
    });
    tokio::time::timeout(std::time::Duration::from_secs(5), committed.notified())
        .await
        .unwrap();
    sender.abort();
    assert!(sender.await.unwrap_err().is_cancelled());
    let reopened = Board::open(
        &root,
        Some(Arc::new(crate::durable::SqliteStore::open(&path).unwrap())),
        "fixture",
    )
    .await
    .unwrap();
    let (cursor, report) = reopened.incoming(&root, 0, 0).await.unwrap().unwrap();
    assert_eq!(cursor, 1);
    assert_eq!(report["body"]["verified"], true);
    // A receiver retry before committing its cursor sees the same identity.
    let retry = reopened.incoming(&root, 0, 0).await.unwrap().unwrap();
    assert_eq!((cursor, report), retry);
    assert!(reopened.incoming(&root, cursor, 0).await.unwrap().is_none());
}

struct InterruptedSave {
    store: Arc<InMemoryCheckpointer>,
    entered: Arc<Notify>,
}
#[async_trait::async_trait]
impl Checkpointer for InterruptedSave {
    async fn load(&self, key: &str) -> Result<Option<Checkpoint>, Error> {
        self.store.load(key).await
    }
    async fn save(&self, _: &str, _: Option<u64>, _: Checkpoint) -> Result<(), Error> {
        self.entered.notify_one();
        std::future::pending().await
    }
}
#[tokio::test]
async fn cancelled_sender_cannot_expose_speculative_report_on_live_board() {
    let store = Arc::new(InMemoryCheckpointer::default());
    let entered = Arc::new(Notify::new());
    let root = RunContext::new("parent-thread", "root");
    let child = RunContext::new("child-thread", "child");
    let board = Arc::new(
        Board::open(
            &root,
            Some(Arc::new(InterruptedSave {
                store: store.clone(),
                entered: entered.clone(),
            })),
            "fixture",
        )
        .await
        .unwrap(),
    );
    let sending_board = board.clone();
    let sender = tokio::spawn(async move {
        sending_board
            .send(&child, "speculative", "root", json!({"fact":1}))
            .await
    });
    tokio::time::timeout(std::time::Duration::from_secs(5), entered.notified())
        .await
        .unwrap();
    sender.abort();
    assert!(sender.await.unwrap_err().is_cancelled());
    assert!(board.incoming(&root, 0, 0).await.is_err());
    assert!(board.read(&root, 0, 0).await.is_err());
    let reopened = Board::open(&root, Some(store), "fixture").await.unwrap();
    assert!(reopened.incoming(&root, 0, 0).await.unwrap().is_none());
}
