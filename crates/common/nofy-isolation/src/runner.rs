//! Telling a runner that broke from a command that was refused.
//!
//! A backend usually starts a small runner (a helper executable or a launcher)
//! that applies the confinement and only then starts the real command. When the
//! runner cannot apply the confinement it must not start the command, and the
//! caller needs to know that this is the runner's failure, not the command's own
//! exit: a command that failed is a result, a confinement that could not be
//! applied is an environment problem to fix.
//!
//! The marker and exit code are fixed so that every backend, and every consumer
//! of one, recognises the same signature.

/// The exit status a runner ends with when it could not apply the confinement.
pub const RUNNER_FAILURE_EXIT_CODE: i32 = 125;

/// The text a runner writes to its standard error, on one line, before it ends
/// with [`RUNNER_FAILURE_EXIT_CODE`]. What follows it on that line says why.
pub const RUNNER_FAILURE_MARKER: &str = "required module isolation or runtime launch failed";

/// The longest explanation returned, so a runner cannot make a caller carry an
/// arbitrary amount of text.
const LIMIT: usize = 300;

/// If the runner reports that it could not apply the confinement, the line that
/// says why, bounded. `None` for any other outcome, including a command that
/// simply exited with the same number: both the exit status and the marker must
/// match.
pub fn runner_failure(exit_code: Option<i32>, stderr: &[u8]) -> Option<String> {
    if exit_code != Some(RUNNER_FAILURE_EXIT_CODE) {
        return None;
    }
    let text = String::from_utf8_lossy(stderr);
    let line = text
        .lines()
        .find(|line| line.contains(RUNNER_FAILURE_MARKER))?;
    Some(line.chars().take(LIMIT).collect())
}
