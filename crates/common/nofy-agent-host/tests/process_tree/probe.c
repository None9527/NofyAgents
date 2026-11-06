#define _GNU_SOURCE
#include <errno.h>
#include <fcntl.h>
#include <linux/capability.h>
#include <linux/filter.h>
#include <pthread.h>
#include <sched.h>
#include <signal.h>
#include <stdio.h>
#include <sys/mount.h>
#include <sys/ioctl.h>
#include <sys/ptrace.h>
#include <sys/prctl.h>
#include <sys/resource.h>
#include <sys/socket.h>
#include <sys/syscall.h>
#include <unistd.h>

#ifdef REAL_HELPER
int main(int argc, char **argv) {
    (void)argc;
    struct sock_filter filter[] = {
        BPF_STMT(BPF_LD | BPF_W | BPF_ABS, 0),
        BPF_JUMP(BPF_JMP | BPF_JEQ | BPF_K, SYS_mount, 0, 1),
        BPF_STMT(BPF_RET | BPF_K, 0x00050000 | EPERM),
        BPF_JUMP(BPF_JMP | BPF_JEQ | BPF_K, SYS_mount_setattr, 0, 1),
        BPF_STMT(BPF_RET | BPF_K, 0x00050000 | EPERM),
        BPF_STMT(BPF_RET | BPF_K, 0x7fff0000),
    };
    struct sock_fprog program = {sizeof(filter) / sizeof(filter[0]), filter};
    if (prctl(PR_SET_NO_NEW_PRIVS, 1, 0, 0, 0) || prctl(PR_SET_SECCOMP, 2, &program)) return 125;
    argv[0] = REAL_HELPER;
    execv(REAL_HELPER, argv);
    return 125;
}
#else
static void *thread(void *argument) { return argument; }
int main(void) {
    struct __user_cap_header_struct header = {_LINUX_CAPABILITY_VERSION_3, 0};
    struct __user_cap_data_struct data[2] = {{0}, {0}};
    int empty = syscall(SYS_capget, &header, data) == 0;
    for (int i = 0; i < 2; ++i) empty &= !(data[i].effective | data[i].permitted | data[i].inheritable);
    errno = 0;
    int network = socket(AF_INET, SOCK_STREAM, 0) == -1 && errno == EPERM;
    errno = 0;
    int namespace = unshare(CLONE_NEWUSER) == -1 && errno == EPERM;
    errno = 0;
    int clone_parent = syscall(SYS_clone, CLONE_PARENT | SIGCHLD, 0, 0, 0, 0) == -1 && errno == EPERM;
    errno = 0;
    int clone3 = syscall(SYS_clone3, 0, 0) == -1 && errno == ENOSYS;
    errno = 0;
    int trace = ptrace(PTRACE_TRACEME, 0, 0, 0) == -1 && errno == EPERM;
    errno = 0;
    int mounts = mount(0, "/", 0, MS_REMOUNT, 0) == -1 && errno == EPERM;
    struct rlimit limit;
    int query = prlimit(0, RLIMIT_NOFILE, 0, &limit) == 0;
    errno = 0;
    int mutation = query && prlimit(0, RLIMIT_NOFILE, &limit, 0) == -1 && errno == EPERM;
    pthread_t handle;
    void *result = 0;
    int threads = pthread_create(&handle, 0, thread, &limit) == 0;
    if (threads) threads = pthread_join(handle, &result) == 0 && result == &limit;
    int pipes[2];
    int nonblocking = 0, ioctl_denials = 0;
    if (pipe2(pipes, O_CLOEXEC) == 0) {
        int enabled = 1;
        nonblocking = ioctl(pipes[0], FIONBIO, &enabled) == 0 && (fcntl(pipes[0], F_GETFL) & O_NONBLOCK);
        enabled = 0;
        nonblocking = nonblocking && ioctl(pipes[0], FIONBIO, &enabled) == 0 && !(fcntl(pipes[0], F_GETFL) & O_NONBLOCK);
        errno = 0;
        int pending = 0;
        ioctl_denials = ioctl(pipes[0], FIONREAD, &pending) == -1 && errno == EPERM;
        // The kernel consumes ioctl's fd and request as 32-bit values, and the
        // filter compares that interpretation. So upper register bits must
        // neither grant a denied request nor change the outcome of an allowed one.
        errno = 0;
        ioctl_denials = ioctl_denials && syscall(SYS_ioctl, pipes[0], (1ULL << 32) | FIONREAD, &pending) == -1 && errno == EPERM;
        enabled = 0;
        ioctl_denials = ioctl_denials && syscall(SYS_ioctl, pipes[0], (1ULL << 32) | FIONBIO, &enabled) == 0;
        ioctl_denials = ioctl_denials && syscall(SYS_ioctl, pipes[0], (1ULL << 32) | FIOCLEX, 0) == 0;
        close(pipes[0]);
        close(pipes[1]);
    }
    int ok = empty && network && namespace && clone_parent && clone3 && trace && mounts && query && mutation && threads && nonblocking && ioctl_denials;
    printf("{\"capabilities_empty\":%s,\"denials\":%s,\"threads\":%s,\"pipe_nonblocking\":%s,\"ioctl_denials\":%s}", empty ? "true" : "false", (network && namespace && clone_parent && clone3 && trace && mounts && query && mutation) ? "true" : "false", threads ? "true" : "false", nonblocking ? "true" : "false", ioctl_denials ? "true" : "false");
    return ok ? 0 : 1;
}
#endif
