use crate::{Checkpoint, Checkpointer, Error, RunState};
use serde::{Serialize, de::DeserializeOwned};
use std::sync::Arc;

pub(super) struct Journal<T> {
    pub value: T,
    store: Option<Arc<dyn Checkpointer>>,
    key: String,
    composition: String,
    revision: Option<u64>,
}
impl<T: Default + Serialize + DeserializeOwned> Journal<T> {
    pub async fn open(
        store: Option<Arc<dyn Checkpointer>>,
        key: String,
        composition: String,
    ) -> Result<Self, Error> {
        let checkpoint = if let Some(store) = &store {
            store.load(&key).await?
        } else {
            None
        };
        if checkpoint
            .as_ref()
            .is_some_and(|c| c.version != 1 || c.composition != composition)
        {
            return Err(Error::Checkpoint(
                "collaboration journal composition mismatch".into(),
            ));
        }
        let revision = checkpoint.as_ref().map(|c| c.revision);
        let value = checkpoint
            .map(|c| serde_json::from_value(c.state.data))
            .transpose()
            .map_err(|e| Error::Checkpoint(e.to_string()))?
            .unwrap_or_default();
        Ok(Self {
            value,
            store,
            key,
            composition,
            revision,
        })
    }
    pub async fn commit(&mut self) -> Result<(), Error> {
        let Some(store) = &self.store else {
            return Ok(());
        };
        let next =
            self.revision.unwrap_or(0).checked_add(1).ok_or_else(|| {
                Error::Checkpoint("collaboration journal revision exhausted".into())
            })?;
        store
            .save(
                &self.key,
                self.revision,
                Checkpoint {
                    version: 1,
                    revision: next,
                    composition: self.composition.clone(),
                    state: RunState {
                        data: serde_json::to_value(&self.value)
                            .map_err(|e| Error::Checkpoint(e.to_string()))?,
                        complete: true,
                        ..Default::default()
                    },
                },
            )
            .await?;
        self.revision = Some(next);
        Ok(())
    }
}
