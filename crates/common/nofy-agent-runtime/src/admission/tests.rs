use super::*;
use std::sync::{
    Arc, Mutex,
    atomic::{AtomicBool, AtomicUsize, Ordering},
};

#[derive(Default)]
pub(crate) struct State {
    pub deny: AtomicBool,
    pub deny_entry: AtomicBool,
    pub active: AtomicUsize,
    pub validations: Mutex<Vec<String>>,
    pub blocker: Mutex<Option<(Arc<tokio::sync::Notify>, std::sync::mpsc::Receiver<()>)>>,
}
pub(crate) struct Policy(pub Arc<State>, pub &'static str);
impl Default for Policy {
    fn default() -> Self {
        Self(Arc::new(State::default()), "test.commit/v1")
    }
}
struct Permit(Arc<State>);
impl Drop for Permit {
    fn drop(&mut self) {
        self.0.active.fetch_sub(1, Ordering::SeqCst);
    }
}
impl CommitAdmission for Policy {
    fn identity(&self) -> &str {
        self.1
    }
    fn enter(&self) -> Result<Box<dyn CommitPermit>, Error> {
        if self.0.deny_entry.load(Ordering::SeqCst) {
            return Err(Error::Checkpoint("test maintenance in progress".into()));
        }
        self.0.active.fetch_add(1, Ordering::SeqCst);
        Ok(Box::new(Permit(self.0.clone())))
    }
    fn permits_inherited(
        &self,
        parent: &[&ModuleDefinition],
        _: &str,
        modules: &[&ModuleDefinition],
    ) -> Result<bool, Error> {
        let known = parent
            .iter()
            .map(|d| crate::system::content_digest(*d))
            .collect::<Result<std::collections::BTreeSet<_>, _>>()?;
        for module in modules {
            if !known.contains(&crate::system::content_digest(*module)?) {
                return Ok(false);
            }
        }
        Ok(true)
    }
}
impl CommitPermit for Permit {
    fn validate(&self, kind: &str, _: &[&ModuleDefinition]) -> Result<(), Error> {
        self.0.validations.lock().unwrap().push(kind.into());
        if let Some((entered, wait)) = self.0.blocker.lock().unwrap().take() {
            entered.notify_one();
            wait.recv_timeout(std::time::Duration::from_secs(5))
                .map_err(|_| Error::Checkpoint("test permit release timed out".into()))?;
        }
        if self.0.deny.load(Ordering::SeqCst) {
            return Err(Error::Checkpoint("test admission denied".into()));
        }
        Ok(())
    }
}

#[cfg(feature = "control-file")]
#[tokio::test]
async fn file_catalog_marks_authority_blocks_old_handles_and_revalidates_same_revision_content() {
    use crate::control::{CatalogData, CatalogStore, Draft, FileCatalogStore};
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("catalog.json");
    let old = FileCatalogStore::open(&path).unwrap();
    let policy = Arc::new(Policy::default());
    let managed = FileCatalogStore::open_with_admission(&path, policy.clone()).unwrap();
    assert!(FileCatalogStore::open(&path).is_err());
    assert!(
        FileCatalogStore::open_with_admission(
            &path,
            Arc::new(Policy(policy.0.clone(), "another.authority/v1"))
        )
        .is_err()
    );
    assert!(
        old.compare_exchange(None, CatalogData::default())
            .await
            .is_err()
    );
    let mut data = CatalogData::default();
    data.drafts.insert(
        "draft".into(),
        Draft {
            revision: 1,
            document: serde_json::from_value(
                serde_json::json!({"schema_version":1,"name":"draft","modules":[],"programs":{}}),
            )
            .unwrap(),
        },
    );
    let first = managed.compare_exchange(None, data.clone()).await.unwrap();
    assert_eq!(*policy.0.validations.lock().unwrap(), vec!["draft"]);
    data.drafts.get_mut("draft").unwrap().document.name = "changed".into();
    policy.0.deny.store(true, Ordering::SeqCst);
    assert!(
        managed
            .compare_exchange(Some(first.revision), data)
            .await
            .is_err()
    );
    assert_eq!(
        managed.load().await.unwrap().unwrap().revision,
        first.revision
    );
    assert_eq!(policy.0.active.load(Ordering::SeqCst), 0);
    let reopened = FileCatalogStore::open_with_admission(&path, policy).unwrap();
    assert_eq!(
        reopened.load().await.unwrap().unwrap().data.drafts["draft"]
            .document
            .name,
        "draft"
    );
}
