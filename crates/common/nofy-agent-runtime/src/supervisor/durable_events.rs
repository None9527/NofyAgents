use super::*;
use sha2::{Digest, Sha256};
impl DurableEventSink {
    pub(super) async fn record_unique(
        &self,
        mut scope: crate::events::EventScope,
        event: crate::agent::RunEvent,
        key: &str,
    ) -> Result<(), Error> {
        if key.is_empty() || key.len() > 16384 {
            return Err(Error::Checkpoint("stable event key must fit 16 KiB".into()));
        }
        let key = key.to_string();
        let identity = self.identity.clone();
        let clock = self.store.clock.clone();
        scope.root_run_id = identity.run_id.clone();
        let bytes = serde_json::to_vec(&(&scope, &event)).map_err(db_error)?;
        let digest = format!("{:x}", Sha256::digest(bytes));
        self.store.transaction(move|tx|{
            check_lease(tx,&identity.lease,clock.now_ms())?;
            let previous:Option<String>=tx.query_row("SELECT digest FROM agent_runtime_event_receipts WHERE root_id=?1 AND event_key=?2",params![identity.run_id,key],|row|row.get(0)).optional().map_err(db_error)?;
            if let Some(previous)=previous {
                return if previous==digest {Ok(())}else{Err(Error::Checkpoint("stable event key reused with changed scope/payload".into()))};
            }
            tx.execute("INSERT INTO agent_runtime_events(root_id,payload) VALUES(?1,'')",[&identity.run_id]).map_err(db_error)?;
            let cursor=u64::try_from(tx.last_insert_rowid()).map_err(db_error)?;
            let envelope=crate::events::EventEnvelope{version:1,cursor,timestamp_ms:clock.now_ms(),scope,event};
            tx.execute("UPDATE agent_runtime_events SET payload=?1 WHERE id=?2",params![serde_json::to_string(&envelope).map_err(db_error)?,cursor]).map_err(db_error)?;
            tx.execute("INSERT INTO agent_runtime_event_receipts(root_id,event_key,digest,cursor) VALUES(?1,?2,?3,?4)",params![identity.run_id,key,digest,cursor]).map_err(db_error)?;Ok(())
        }).await
    }
}
#[cfg(test)]
mod tests {
    use super::*;
    use crate::events::{EventScope, EventSink, RunEvent};
    #[tokio::test]
    async fn stable_events_are_atomic_immutable_replayable_and_fenced_after_reopen() {
        let temp = tempfile::tempdir().unwrap();
        let path = temp.path().join("runtime.db");
        let store = SqliteStore::open(&path).unwrap();
        let lease = store
            .acquire("thread", "worker", Duration::from_secs(20))
            .await
            .unwrap();
        let sink = DurableEventSink {
            store: store.clone(),
            identity: SupervisedIdentity {
                run_id: "root".into(),
                lease: lease.clone(),
            },
        };
        let scope = EventScope::new("workflow", &RunContext::new("thread", "run"));
        let sql = rusqlite::Connection::open(&path).unwrap();
        sql.execute_batch("CREATE TRIGGER reject_event_receipt BEFORE INSERT ON agent_runtime_event_receipts BEGIN SELECT RAISE(ABORT,'receipt failed'); END;").unwrap();
        assert!(
            sink.record_once(scope.clone(), RunEvent::Finished, "lost-receipt")
                .await
                .is_err()
        );
        assert!(store.events("root", 0, 100).await.unwrap().is_empty());
        sql.execute_batch("DROP TRIGGER reject_event_receipt")
            .unwrap();
        drop(sql);
        sink.record_once(
            scope.clone(),
            RunEvent::RunStarted { resume: false },
            "start",
        )
        .await
        .unwrap();
        sink.record_once(
            scope.clone(),
            RunEvent::RunStarted { resume: false },
            "start",
        )
        .await
        .unwrap();
        assert!(
            sink.record_once(
                scope.clone(),
                RunEvent::RunStarted { resume: true },
                "start"
            )
            .await
            .is_err()
        );
        let events = store.events("root", 0, 100).await.unwrap();
        assert_eq!(events.len(), 1);
        assert_eq!(events[0].scope.root_run_id, "root");
        let cursor = events[0].cursor;
        store.release(&lease).await.unwrap();
        assert!(
            sink.record_once(scope.clone(), RunEvent::Finished, "finish")
                .await
                .is_err()
        );
        let reopened = SqliteStore::open(&path).unwrap();
        let lease = reopened
            .acquire("thread", "next-worker", Duration::from_secs(20))
            .await
            .unwrap();
        let sink = DurableEventSink {
            store: reopened.clone(),
            identity: SupervisedIdentity {
                run_id: "root".into(),
                lease: lease.clone(),
            },
        };
        sink.record_once(
            scope.clone(),
            RunEvent::RunStarted { resume: false },
            "start",
        )
        .await
        .unwrap();
        sink.record_once(scope, RunEvent::Finished, "finish")
            .await
            .unwrap();
        assert_eq!(reopened.events("root", cursor, 100).await.unwrap().len(), 1);
        assert_eq!(reopened.events("root", 0, 100).await.unwrap().len(), 2);
        reopened.release(&lease).await.unwrap();
    }
}
