#!/usr/bin/env bash
# 上游对照工具:把上游 xai-org/grok-build 的文件做命名归一后与我们的树对比。
#
# 用法:
#   scripts/upstream_diff.sh <上游仓库内相对路径>            归一后逐行 diff 单个文件
#   scripts/upstream_diff.sh --dir <上游目录>                  汇总目录下每个文件的差异行数
#   scripts/upstream_diff.sh --changed <base>..<head>          列出上游某区间改动的文件,
#                                                              按 crate 汇总存在/缺失,全量清单落盘
#     例(本仓库已 fetch upstream):--changed 77cd7eb6..upstream/main
#     尾随 .. 会自动补全为 upstream/main(仅当本仓库能解析该 ref),
#     避免 UPSTREAM_REPO=本仓库时误解析到我们自己的 HEAD。
#
# 上游克隆默认在 /tmp/grok-upstream,可用 UPSTREAM_REPO 覆盖(可指向本仓库)。
# 上游基线/已同步批次见 docs/upstream-sync.md。

set -euo pipefail

UPSTREAM_REPO="${UPSTREAM_REPO:-/tmp/grok-upstream}"
OUR_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [ ! -d "$UPSTREAM_REPO" ]; then
    echo "上游克隆不存在: $UPSTREAM_REPO" >&2
    echo "先执行: git clone --depth 50 https://github.com/xai-org/grok-build $UPSTREAM_REPO" >&2
    exit 1
fi

# 命名归一:上游标识符/路径 → 我们的命名。
# crate 名遵循统一规则:xai-grok-X → nofy-X、xai-X → nofy-X(snake_case 同理)。
# 该规则经全量 crate 清单核对,与旧枚举表结果一致且覆盖旧表遗漏的 ~50 个 crate
# (tool-runtime/tool-protocol/grok-compaction/computer-hub-*/interjection-core/
#  grok-agent/mcp/models/auth/config/paths/sampler/sandbox/secrets/version/... )。
# 我们没有的 crate 也按同规则映射,--changed 中显示「缺失」即真实缺失,不再是假阴性。
# 顺序敏感:grok 专属规则在通用规则之前;非 crate 字面量规则在最后。
normalize() {
    sed \
        -e 's/xai-grok-/nofy-/g' \
        -e 's/xai_grok_/nofy_/g' \
        -e 's/xai-/nofy-/g' \
        -e 's/xai_/nofy_/g' \
        -e 's/implementations::grok_build/implementations::nofy_build/g' \
        -e 's/implementations\/grok_build/implementations\/nofy_build/g' \
        -e 's/_x\.ai\//_nofy\//g' \
        -e 's/GROK_/NOFY_/g' \
        -e 's/\.grok\//\.nofy\//g'
}

# 上游相对路径 → 我们的相对路径(不存在则空)。
map_path() {
    echo "$1" | normalize
}

case "${1:-}" in
    "")
        grep '^# 用法' -A 6 "$0" | sed 's/^# \{0,1\}//'
        exit 1
        ;;
    --changed)
        shift
        range="${1:?用法: upstream_diff.sh --changed <base>..<head>(例:77cd7eb6..upstream/main)}"
        # 尾随 .. 在 UPSTREAM_REPO=本仓库时会解析到我们的 HEAD(含桌面提交),
        # 能解析 upstream/main 时自动补全;独立上游克隆的 HEAD 本就是上游,保持原样。
        if [ "${range%..}" != "$range" ] && [ "${range##*..}" = "" ]; then
            if git -C "$UPSTREAM_REPO" rev-parse --verify -q upstream/main >/dev/null 2>&1; then
                range="${range}upstream/main"
            fi
        fi
        out="/tmp/upstream_changed_$(date +%Y%m%d_%H%M%S).txt"
        up_list="/tmp/upstream_files_$$.txt"
        our_list="/tmp/our_files_$$.txt"
        git -C "$UPSTREAM_REPO" diff --name-only "$range" -- crates/ > "$up_list"
        normalize < "$up_list" > "$our_list"
        paste "$our_list" "$up_list" | while IFS="$(printf '\t')" read -r ours f; do
            if [ -f "$OUR_ROOT/$ours" ]; then
                printf '存在\t%s\t%s\n' "$ours" "$f"
            else
                printf '缺失\t%s\t%s\n' "$ours" "$f"
            fi
        done > "$out"
        rm -f "$up_list" "$our_list"
        total=$(wc -l < "$out" | tr -d ' ')
        rs_total=$(grep -c '\.rs$' "$out" || true)
        echo "范围: $range   (上游: $UPSTREAM_REPO)"
        echo "改动文件: $total   (其中 .rs: $rs_total)"
        echo
        echo "=== 按 crate 汇总(存在/缺失)==="
        printf '%6s %6s  %s\n' 存在 缺失 crate
        awk -F'\t' '{
            split($2, p, "/");
            crate = p[1] "/" p[2] "/" p[3];
            cnt[crate "\t" $1]++;
            crates[crate] = 1;
        } END {
            for (c in crates)
                printf "%6d %6d  %s\n", cnt[c "\t存在"] + 0, cnt[c "\t缺失"] + 0, c;
        }' "$out" | sort -t/ -k3
        echo
        exist_n=$(grep -c '^存在' "$out" || true)
        miss_n=$(grep -c '^缺失' "$out" || true)
        echo "=== 总计 ===   存在 $exist_n   缺失 $miss_n"
        echo "完整清单(状态\t我们的路径\t上游路径): $out"
        ;;
    --dir)
        shift
        dir="${1:?用法: upstream_diff.sh --dir <上游目录>}"
        find "$UPSTREAM_REPO/$dir" -name '*.rs' -type f | sort | while read -r f; do
            rel="${f#"$UPSTREAM_REPO"/}"
            ours="$(map_path "$rel")"
            if [ ! -f "$OUR_ROOT/$ours" ]; then
                printf '%6s  %s  (我们没有)\n' "-" "$ours"
                continue
            fi
            n="$(diff <(normalize < "$f") "$OUR_ROOT/$ours" | grep -c '^[<>]' || true)"
            printf '%6d  %s\n' "$n" "$ours"
        done
        ;;
    *)
        f="$UPSTREAM_REPO/$1"
        ours="$(map_path "$1")"
        if [ ! -f "$f" ]; then
            echo "上游文件不存在: $f" >&2
            exit 1
        fi
        if [ ! -f "$OUR_ROOT/$ours" ]; then
            echo "我们没有对应文件: $ours" >&2
            exit 1
        fi
        diff -u <(normalize < "$f") "$OUR_ROOT/$ours" || true
        ;;
esac
