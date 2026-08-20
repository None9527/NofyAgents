#!/usr/bin/env bash
# Per-file coverage gate (FR9 工程可信 P0 遗留①, DS 纪律移植):
# 每个新组件 crate 的每个源文件行覆盖必须 100%,除非该文件在下方豁免表
# 中列名并附理由(豁免=死代码探测器的显式出口,静默缺口即红)。
#
# 用法:
#   scripts/coverage_gate.sh            # 全部门内 crate
#   scripts/coverage_gate.sh nofy-scheduler nofy-orchestra   # 指定子集
#
# 依赖: cargo-llvm-cov + rustup component llvm-tools-preview。
set -uo pipefail
cd "$(dirname "$0")/.."

# 门内 crate = 全部新组件(P0–P3 所建;AC-9「所有新组件」)。
GATED_CRATES=(
  nofy-packcore
  nofy-scheduler
  nofy-orchestra
  nofy-governance
  nofy-memorycore
  nofy-stewardcore
  nofy-agility
  nofy-surfaces
  nofy-marketplace
  nofy-runtimecore
  nofy-channel
  nofy-control-schema
  nofy-session-registry
  nofy-daemon
)

# 豁免表:文件(相对 crate 根)→ 理由(列名带理由,DS 纪律)。
# 空表起步:每个缺口要么补测试,要么在此显式豁免,二选一,无第三条路。
EXEMPTIONS=""
# 列名带理由(DS 纪律):
EXEMPTIONS="$EXEMPTIONS
nofy-marketplace/src/exemplars.rs:map_err 闭包仅在内建 exemplar 自身过不了第三方门时执行——该函数存在的意义即证明这不可能,无输入无注入缝,单测不可达
nofy-scheduler/src/lock.rs:flock(LOCK_EX|LOCK_NB) 在有效 fd 上除 EWOULDBLOCK(已处理)外仅在 OS 故障(ENOLCK/EINVAL/EBADF)时失败,需磁盘/OS 故障注入,单测不可达
nofy-orchestra/src/batchapproval.rs:BatchOutcome::Partial 分支构造级死码——fold 遇 Pending 即返 Incomplete,之后全为 Approved/Denied,denied==false 蕴含全 Approved;AnyDenied 已涵盖部分拒绝(fail-closed 设计),保留该臂为防御
nofy-orchestra/src/replay.rs:Settled 臂顶部已对 spec_retry(...).is_none() continue,spec_retry 对同一 manifest+task 纯函数,第二次调用恒 Some,隐式 None 路不可达
nofy-scheduler/src/grammar.rs:两处防御臂构造级不可达——parse 以 split_whitespace 切分,字段恒非空(空字段检查无输入);cron 各域 u8 小范围(分 0-59/时 0-23/日 1-31/月 1-12/周 0-7),value+step 恒 ≤118(checked_add 溢出臂无输入),保留为防御
nofy-daemon/src/daemon.rs:run() 启动装配+accept 循环需活 UDS 监听+看门狗线程+监督,built-binary e2e lane 覆盖(provider_loop_e2e 等)
nofy-daemon/src/wire.rs:余线为三类不可达——DEFAULT_APPROVAL_TIMEOUT 300s 墙钟臂(单测无缩短缝)、对永不失败 Serialize 类型的 to_value/to_vec 错误臂、/proc/self/stat 解析与 SO_PEERCRED 防御臂(Linux 恒不触发)
nofy-daemon/src/control_client.rs:余线为对永不失败 Serialize 类型的 to_vec 错误臂(握手/call 写帧)
nofy-daemon/src/provider.rs:余线为 poll_once/report/search_poll_once/answer_search 中 to_value/to_vec 错误臂(Serialize 永不失败)
nofy-daemon/src/forensics.rs:第二次 append 失败臂需首次成功后同路径中途失败,无故障注入缝
nofy-daemon/src/lib.rs:inode unlink/recreate 竞态重试与 LockError::Contended 需两 syscall 窗口内敌意 relink 连续 16 次,无确定性缝
nofy-daemon/src/recovery.rs:saw_predecessor 无 saw_predecessor_and_died 臂构造级死码——反向行走抵达末次启动当且仅当其后无 clean_shutdown,恰使后者先成立
nofy-daemon/src/runlife.rs:Dag::build 错误臂不可达——ProjectManifest::from_toml 的 Kahn 环门先于 DAG 构造拒绝一切环(nofy-orchestra 已验证)
nofy-daemon/src/sd_notify.rs:UnixDatagram::unbound() 失败臂无缝可触发"

if ! command -v cargo-llvm-cov >/dev/null 2>&1; then
  echo "coverage gate: cargo-llvm-cov not installed (cargo install cargo-llvm-cov)" >&2
  exit 2
fi

crates=("$@")
if [ ${#crates[@]} -eq 0 ]; then
  crates=("${GATED_CRATES[@]}")
fi

report_dir="target/coverage-gate"
mkdir -p "$report_dir"
fail=0

for crate in "${crates[@]}"; do
  echo "== $crate"
  if ! cargo llvm-cov --no-clean --lcov \
      --output-path "$report_dir/$crate.lcov" -p "$crate" >/dev/null 2>&1; then
    echo "FAIL: $crate — coverage run failed" >&2
    fail=1
    continue
  fi
  # 逐文件判定:lcov SF: 段,LF/LH 汇总行覆盖;缺口=补测试或豁免列名。
  if ! COVERAGE_EXEMPTIONS="$EXEMPTIONS" CRATE="$crate" python3 - "$report_dir/$crate.lcov" <<'PY'
import os, sys

crate = os.environ["CRATE"]
exemptions = {}
for entry in os.environ.get("COVERAGE_EXEMPTIONS", "").splitlines():
    if ":" in entry:
        k, v = entry.split(":", 1)
        exemptions[k.strip()] = v.strip()

current, lf, lh = None, 0, 0
bad = []
for line in open(sys.argv[1]):
    line = line.strip()
    if line.startswith("SF:"):
        current, lf, lh = line[3:], 0, 0
    elif line.startswith("LF:"):
        lf = int(line[3:])
    elif line.startswith("LH:"):
        lh = int(line[3:])
    elif line == "end_of_record" and current is not None:
        if lf != lh:
            short = current.split(f"{crate}/")[-1]
            reason = exemptions.get(short) or exemptions.get(f"{crate}/{short}")
            if reason:
                print(f"  EXEMPT {short}: {lh}/{lf} — {reason}")
            else:
                bad.append((short, lh, lf))
        current = None
for short, lh, lf in bad:
    print(f"  GAP {short}: {lh}/{lf} lines covered — 补测试或列名豁免")
sys.exit(1 if bad else 0)
PY
  then
    fail=1
  fi
done

if [ $fail -ne 0 ]; then
  echo "coverage gate: FAILED — 缺口见上(补测试或豁免表列名带理由)" >&2
  exit 1
fi
echo "coverage gate: PASS — 门内 crate 逐文件 100%(豁免列名在案)"
