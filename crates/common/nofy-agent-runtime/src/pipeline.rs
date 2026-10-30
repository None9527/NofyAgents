//! Explicitly ordered, replaceable stages for application-owned run hosts.
//! Both the standard Agent and custom pipelines use the same iteration driver.
use crate::{
    Error,
    driver::{RunHost, Step, drive},
};
use futures::future::LocalBoxFuture;

/// A stage must distinguish passing to its successor from restarting a cycle.
pub enum Flow<O> {
    Next,
    Restart,
    Finish(O),
}

type Handler<S, O, E> = dyn for<'a> FnMut(&'a mut S) -> LocalBoxFuture<'a, Result<Flow<O>, E>>;

pub struct Stage<S, O, E> {
    name: String,
    handler: Box<Handler<S, O, E>>,
}
impl<S, O, E> Stage<S, O, E> {
    pub fn new(
        name: impl Into<String>,
        handler: impl for<'a> FnMut(&'a mut S) -> LocalBoxFuture<'a, Result<Flow<O>, E>> + 'static,
    ) -> Self {
        Self {
            name: name.into(),
            handler: Box::new(handler),
        }
    }
}

/// The application owns state and stage admission. A complete cycle restarts
/// from its first stage; a Finish returns immediately. Errors never advance.
/// This local-future host supports existing LocalSet actors without making the
/// standalone Agent's Send run future depend on a local trait object.
pub struct Pipeline<S, O, E> {
    stages: Vec<Stage<S, O, E>>,
}
impl<S, O, E> Pipeline<S, O, E> {
    pub fn new(stages: Vec<Stage<S, O, E>>) -> Result<Self, Error> {
        let mut names = std::collections::HashSet::new();
        if stages.is_empty()
            || stages
                .iter()
                .any(|s| s.name.is_empty() || !names.insert(&s.name))
        {
            return Err(Error::Composition(
                "pipeline requires nonempty, unique stage names".into(),
            ));
        }
        Ok(Self { stages })
    }
    pub fn stage_names(&self) -> impl Iterator<Item = &str> {
        self.stages.iter().map(|s| s.name.as_str())
    }
    /// Replacement retains the stage identity and position in the recipe.
    pub fn replace(&mut self, replacement: Stage<S, O, E>) -> Result<(), Error> {
        let stage = self
            .stages
            .iter_mut()
            .find(|s| s.name == replacement.name)
            .ok_or_else(|| {
                Error::Composition(format!("unknown pipeline stage: {}", replacement.name))
            })?;
        *stage = replacement;
        Ok(())
    }
    pub async fn run(&mut self, state: &mut S) -> Result<O, E> {
        struct Host<'a, S, O, E> {
            state: &'a mut S,
            stages: &'a mut [Stage<S, O, E>],
            index: usize,
        }
        impl<S, O, E> RunHost for Host<'_, S, O, E> {
            type Output = O;
            type Error = E;
            async fn advance(&mut self) -> Result<Step<O>, E> {
                match (self.stages[self.index].handler)(self.state).await? {
                    Flow::Next => self.index = (self.index + 1) % self.stages.len(),
                    Flow::Restart => self.index = 0,
                    Flow::Finish(output) => return Ok(Step::Complete(output)),
                }
                Ok(Step::Continue)
            }
        }
        drive(&mut Host {
            state,
            stages: &mut self.stages,
            index: 0,
        })
        .await
    }
}
