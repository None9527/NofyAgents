//! Reusable coding recipe and pure policies. Host effects are explicit ports;
//! no SessionActor, filesystem, terminal or product settings enter this module.
use crate::pipeline::{Flow, Pipeline, Stage};
use std::future::Future;
pub mod length;
pub mod stationarity;
pub mod todo;

/// Host-owned state and effects. Implementations may use a local actor, a
/// database worker, or a standalone model client. Optional policies default to
/// pass-through; model/dispatch are the two required execution capabilities.
pub trait CodingHost {
    type Output;
    type Error;
    fn stationarity(&mut self) -> impl Future<Output = Result<Flow<Self::Output>, Self::Error>> {
        async { Ok(Flow::Next) }
    }
    fn context(&mut self) -> impl Future<Output = Result<Flow<Self::Output>, Self::Error>> {
        async { Ok(Flow::Next) }
    }
    fn maintenance(&mut self) -> impl Future<Output = Result<Flow<Self::Output>, Self::Error>> {
        async { Ok(Flow::Next) }
    }
    fn model(&mut self) -> impl Future<Output = Result<Flow<Self::Output>, Self::Error>>;
    fn completion(&mut self) -> impl Future<Output = Result<Flow<Self::Output>, Self::Error>> {
        async { Ok(Flow::Next) }
    }
    fn dispatch(&mut self) -> impl Future<Output = Result<Flow<Self::Output>, Self::Error>>;
    fn convergence(&mut self) -> impl Future<Output = Result<Flow<Self::Output>, Self::Error>> {
        async { Ok(Flow::Next) }
    }
}

/// Original phase order, independent of its shell adapter. A consumer may
/// replace any named stage before running, without changing the engine.
pub fn pipeline<H: CodingHost + 'static>() -> Pipeline<H, H::Output, H::Error> {
    Pipeline::new(vec![
        Stage::new("stationarity", |host: &mut H| Box::pin(host.stationarity())),
        Stage::new("context", |host: &mut H| Box::pin(host.context())),
        Stage::new("maintenance", |host: &mut H| Box::pin(host.maintenance())),
        Stage::new("model", |host: &mut H| Box::pin(host.model())),
        Stage::new("completion", |host: &mut H| Box::pin(host.completion())),
        Stage::new("dispatch", |host: &mut H| Box::pin(host.dispatch())),
        Stage::new("convergence", |host: &mut H| Box::pin(host.convergence())),
    ])
    .expect("the built-in coding recipe has unique stages")
}
