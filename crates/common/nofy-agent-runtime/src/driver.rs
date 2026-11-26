//! A local-future driver also usable by hosts with `RefCell` state.

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
