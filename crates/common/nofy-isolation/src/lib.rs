//! Platform-neutral process isolation.
//!
//! A *confinement* says what a command must be held to (which files, whether it
//! may use the network or start processes, its limits). A *backend* turns a
//! command and its confinement into the command that actually runs, using what
//! the platform offers: Landlock and seccomp on Linux, Seatbelt on macOS,
//! restricted tokens and job objects on Windows. Backends differ in what they
//! can enforce, so each reports it honestly through [`Backend::probe`].
//!
//! The rule that holds across every platform: **isolation fails closed**. A
//! command whose confinement needs something its backend cannot enforce is
//! refused ([`ERROR_CODE`]); it is never run with the requirement quietly dropped.
//! Accepting weaker enforcement is possible, but only by naming the capability in
//! [`Confinement::accept_partial`]. [`launch_plan`] is the one way to ask a
//! backend for a command, and it runs the gate first, so callers cannot skip it.
//!
//! This crate holds no platform code. Backends live elsewhere and are registered
//! in a [`Registry`], so a platform's implementation can be replaced or adapted
//! without touching the code that asks for isolation.
mod backend;
mod capability;
mod gate;
mod policy;
mod registry;
mod runner;

pub use backend::{Backend, Command, ConfinedCommand, Error, Unsupported, launch_plan};
pub use capability::{Capabilities, Capability, Level, Probe};
pub use gate::{ERROR_CODE, Refusal, Shortfall, admit};
pub use policy::{
    Confinement, Filesystem, Limits, MANDATORY_PROTECTED, Network, Processes, Requirement,
};
pub use registry::{Registry, SelectError, current_platform};
pub use runner::{RUNNER_FAILURE_EXIT_CODE, RUNNER_FAILURE_MARKER, runner_failure};
