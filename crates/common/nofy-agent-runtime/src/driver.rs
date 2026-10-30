//! A local-future driver also usable by hosts with `RefCell` state.

use futures::future::LocalBoxFuture;

pub enum Step<T> {
    Continue,
    Complete(T),
}

pub trait RunHost {
    type Output;
    type Error;

    /// One safe iteration. The host owns cancellation and durable admission.
    fn advance(
        &mut self,
    ) -> impl std::future::Future<Output = Result<Step<Self::Output>, Self::Error>>;
}

/// The sole iteration driver. Policies determine when an iteration completes;
/// the driver does not impose coding-specific stop, retry or tool semantics.
pub async fn drive<H: RunHost>(host: &mut H) -> Result<H::Output, H::Error> {
    loop {
        match host.advance().await? {
            Step::Continue => {}
            Step::Complete(output) => return Ok(output),
        }
    }
}

/// Closure adapter for legacy hosts whose iteration state is local to a turn.
/// The same driver advances both these hosts and standalone SDK agents.
pub async fn drive_with<S, O, E, F>(state: &mut S, advance: F) -> Result<O, E>
where
    F: for<'a> FnMut(&'a mut S) -> LocalBoxFuture<'a, Result<Step<O>, E>>,
{
    struct Host<'a, S, F>(&'a mut S, F);
    impl<S, O, E, F> RunHost for Host<'_, S, F>
    where
        F: for<'a> FnMut(&'a mut S) -> LocalBoxFuture<'a, Result<Step<O>, E>>,
    {
        type Output = O;
        type Error = E;
        async fn advance(&mut self) -> Result<Step<O>, E> {
            (self.1)(self.0).await
        }
    }
    drive(&mut Host(state, advance)).await
}
