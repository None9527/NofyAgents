//! Cumulative CPU time for an owned child process.
//!
//! This is observation, not a resource limit or an isolation capability. Unlike
//! best-effort resource gauges, failure is an error: budget callers must not
//! mistake missing accounting for zero CPU usage.
use std::{io, time::Duration};
use tokio::process::Child;

/// Read the child's total user + kernel CPU time since it started.
///
/// The caller must retain the child and must not reap it while sampling. Taking
/// a child reference rather than a bare PID ties the read to that ownership;
/// Windows borrows its existing process handle instead of reopening a PID.
/// An already reaped child is rejected. An exited but not yet reaped child may
/// still be readable on some platforms; this is not a liveness check.
///
/// No wall-clock fallback, zero sample, descendant accounting, or enforcement
/// is supplied when the platform cannot read the requested process.
pub fn child_cpu_time(child: &Child) -> io::Result<Duration> {
    let pid = child.id().ok_or_else(|| {
        io::Error::new(io::ErrorKind::InvalidInput, "child has already been reaped")
    })?;
    imp::sample(child, pid)
}

#[cfg(any(target_os = "macos", windows, test))]
fn combined_ticks(user: u64, kernel: u64, ticks_per_second: u64) -> io::Result<Duration> {
    let total = user
        .checked_add(kernel)
        .ok_or_else(|| io::Error::new(io::ErrorKind::InvalidData, "process CPU time overflow"))?;
    // Both native formats divide a nanosecond exactly: macOS uses nanoseconds,
    // Windows FILETIME uses 100ns ticks. Sum before splitting whole seconds.
    Ok(Duration::new(
        total / ticks_per_second,
        ((total % ticks_per_second) * (1_000_000_000 / ticks_per_second)) as u32,
    ))
}

#[cfg(target_os = "linux")]
mod imp {
    use super::*;

    pub(super) fn sample(_: &Child, pid: u32) -> io::Result<Duration> {
        let pid = libc::pid_t::try_from(pid)
            .map_err(|_| io::Error::new(io::ErrorKind::InvalidInput, "invalid child PID"))?;
        let mut clock = 0;
        let mut time = libc::timespec {
            tv_sec: 0,
            tv_nsec: 0,
        };
        // SAFETY: initialized output structures; the borrowed Child remains
        // owned and cannot be reaped by the caller during this read.
        unsafe {
            let result = libc::clock_getcpuclockid(pid, &mut clock);
            if result != 0 {
                return Err(io::Error::from_raw_os_error(result));
            }
            if libc::clock_gettime(clock, &mut time) != 0 {
                return Err(io::Error::last_os_error());
            }
        }
        let seconds = u64::try_from(time.tv_sec)
            .map_err(|_| io::Error::new(io::ErrorKind::InvalidData, "negative CPU time"))?;
        if !(0..1_000_000_000).contains(&time.tv_nsec) {
            return Err(io::Error::new(
                io::ErrorKind::InvalidData,
                "invalid CPU nanoseconds",
            ));
        }
        Ok(Duration::new(seconds, time.tv_nsec as u32))
    }
}

#[cfg(target_os = "macos")]
mod imp {
    use super::*;

    pub(super) fn sample(_: &Child, pid: u32) -> io::Result<Duration> {
        let pid = libc::pid_t::try_from(pid)
            .map_err(|_| io::Error::new(io::ErrorKind::InvalidInput, "invalid child PID"))?;
        let mut info = std::mem::MaybeUninit::<libc::proc_taskinfo>::uninit();
        let size = std::mem::size_of::<libc::proc_taskinfo>() as libc::c_int;
        // SAFETY: proc_pidinfo receives an aligned buffer of the exact ABI
        // size; we read it only after the API reports a complete write.
        let read = unsafe {
            libc::proc_pidinfo(
                pid,
                libc::PROC_PIDTASKINFO,
                0,
                info.as_mut_ptr().cast(),
                size,
            )
        };
        if read <= 0 {
            return Err(io::Error::last_os_error());
        }
        if read != size {
            return Err(io::Error::new(
                io::ErrorKind::InvalidData,
                "incomplete process CPU sample",
            ));
        }
        // SAFETY: the complete proc_taskinfo was initialized by the kernel.
        let info = unsafe { info.assume_init() };
        combined_ticks(info.pti_total_user, info.pti_total_system, 1_000_000_000)
    }
}

#[cfg(windows)]
mod imp {
    use super::*;
    use windows::Win32::{
        Foundation::{FILETIME, HANDLE},
        System::Threading::GetProcessTimes,
    };

    pub(super) fn sample(child: &Child, _: u32) -> io::Result<Duration> {
        let handle = child.raw_handle().ok_or_else(|| {
            io::Error::new(
                io::ErrorKind::InvalidInput,
                "child process handle unavailable",
            )
        })?;
        let mut created = FILETIME::default();
        let mut exited = FILETIME::default();
        let mut kernel = FILETIME::default();
        let mut user = FILETIME::default();
        // SAFETY: the borrowed Child owns the process handle for this call;
        // all FILETIME outputs are valid. Do not close this borrowed handle.
        unsafe {
            GetProcessTimes(
                HANDLE(handle),
                &mut created,
                &mut exited,
                &mut kernel,
                &mut user,
            )
        }
        .map_err(io::Error::other)?;
        let ticks =
            |time: FILETIME| (u64::from(time.dwHighDateTime) << 32) | u64::from(time.dwLowDateTime);
        combined_ticks(ticks(user), ticks(kernel), 10_000_000)
    }
}

#[cfg(not(any(target_os = "linux", target_os = "macos", windows)))]
mod imp {
    use super::*;

    pub(super) fn sample(_: &Child, _: u32) -> io::Result<Duration> {
        Err(io::Error::new(
            io::ErrorKind::Unsupported,
            "owned-child CPU accounting is unavailable on this platform",
        ))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn subsecond_user_and_kernel_time_are_added_before_rounding() {
        for ticks_per_second in [1_000_000_000, 10_000_000] {
            let half = ticks_per_second / 2;
            assert_eq!(
                combined_ticks(half, half, ticks_per_second).unwrap(),
                Duration::from_secs(1)
            );
            assert_eq!(
                combined_ticks(half, half - 1, ticks_per_second).unwrap(),
                Duration::from_secs(1) - Duration::from_nanos(1_000_000_000 / ticks_per_second),
            );
            assert_eq!(
                combined_ticks(0, 0, ticks_per_second).unwrap(),
                Duration::ZERO
            );
        }
    }

    #[test]
    fn native_tick_units_keep_the_retirement_boundary_exact() {
        for ticks_per_second in [1_000_000_000, 10_000_000] {
            assert_eq!(
                combined_ticks(539 * ticks_per_second, ticks_per_second, ticks_per_second).unwrap(),
                Duration::from_secs(540),
            );
        }
    }

    #[test]
    fn an_overflow_is_an_error_not_a_zero_sample() {
        for ticks_per_second in [1_000_000_000, 10_000_000] {
            assert_eq!(
                combined_ticks(u64::MAX, 1, ticks_per_second)
                    .unwrap_err()
                    .kind(),
                io::ErrorKind::InvalidData,
            );
        }
    }
}
