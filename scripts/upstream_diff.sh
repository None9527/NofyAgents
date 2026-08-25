#!/usr/bin/env bash
# 上游对照工具:把上游 xai-org/grok-build 的文件做命名归一后与我们的树对比。
#
# 用法:
#   scripts/upstream_diff.sh <上游仓库内相对路径>          归一后逐行 diff 单个文件
#   scripts/upstream_diff.sh --dir <上游目录>                汇总目录下每个文件的差异行数
#   scripts/upstream_diff.sh --changed <tag 或 commit>..     列出上游自某版本以来改动的文件
#                                                            (映射到我们的路径,标注是否存在)
#
# 上游克隆默认在 /tmp/grok-upstream,可用 UPSTREAM_REPO 覆盖。
# 上游基线/已同步批次见 docs/upstream-sync.md。

set -euo pipefail

UPSTREAM_REPO="${UPSTREAM_REPO:-/tmp/grok-upstream}"
OUR_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [ ! -d "$UPSTREAM_REPO" ]; then
    echo "上游克隆不存在: $UPSTREAM_REPO" >&2
    echo "先执行: git clone --depth 50 https://github.com/xai-org/grok-build $UPSTREAM_REPO" >&2
    exit 1
fi

# 命名归一:上游标识符/路径 → 我们的命名。顺序敏感(长名在前)。
normalize() {
    sed \
        -e 's/xai_grok_pager_render/nofy_pager_render/g' \
        -e 's/xai_grok_sampling_types/nofy_sampling_types/g' \
        -e 's/xai_grok_chat_state/nofy_chat_state/g' \
        -e 's/xai_grok_workspace_types/nofy_workspace_types/g' \
        -e 's/xai_grok_workspace/nofy_workspace/g' \
        -e 's/xai_hooks_plugins_types/nofy_hooks_plugins_types/g' \
        -e 's/xai_grok_hooks/nofy_hooks/g' \
        -e 's/xai_grok_shell/nofy_shell/g' \
        -e 's/xai_grok_pager/nofy_pager/g' \
        -e 's/xai_grok_telemetry/nofy_telemetry/g' \
        -e 's/xai_grok_memorycore/nofy_memorycore/g' \
        -e 's/xai_grok_memory/nofy_memory/g' \
        -e 's/xai_grok_shared/nofy_shared/g' \
        -e 's/xai_grok_tools/nofy_tools/g' \
        -e 's/xai_agent_lifecycle/nofy_agent_lifecycle/g' \
        -e 's/xai_ratatui_inline/nofy_ratatui_inline/g' \
        -e 's/xai_crash_handler/nofy_crash_handler/g' \
        -e 's/xai_tty_utils/nofy_tty_utils/g' \
        -e 's/xai_acp_lib/nofy_acp_lib/g' \
        -e 's/xai_tool_types/nofy_tool_types/g' \
        -e 's/xai_workflow/nofy_workflow/g' \
        -e 's/xai-grok-pager-render/nofy-pager-render/g' \
        -e 's/xai-grok-sampling-types/nofy-sampling-types/g' \
        -e 's/xai-grok-chat-state/nofy-chat-state/g' \
        -e 's/xai-grok-workspace-types/nofy-workspace-types/g' \
        -e 's/xai-grok-workspace-client/nofy-workspace-client/g' \
        -e 's/xai-grok-workspace/nofy-workspace/g' \
        -e 's/xai-hooks-plugins-types/nofy-hooks-plugins-types/g' \
        -e 's/xai-grok-hooks/nofy-hooks/g' \
        -e 's/xai-grok-shell/nofy-shell/g' \
        -e 's/xai-grok-pager/nofy-pager/g' \
        -e 's/xai-grok-telemetry/nofy-telemetry/g' \
        -e 's/xai-grok-memorycore/nofy-memorycore/g' \
        -e 's/xai-grok-memory/nofy-memory/g' \
        -e 's/xai-grok-shared/nofy-shared/g' \
        -e 's/xai-grok-tools/nofy-tools/g' \
        -e 's/xai-agent-lifecycle/nofy-agent-lifecycle/g' \
        -e 's/xai-ratatui-inline/nofy-ratatui-inline/g' \
        -e 's/xai-crash-handler/nofy-crash-handler/g' \
        -e 's/xai-tty-utils/nofy-tty-utils/g' \
        -e 's/xai-acp-lib/nofy-acp-lib/g' \
        -e 's/xai-tool-types/nofy-tool-types/g' \
        -e 's/xai-workflow/nofy-workflow/g' \
        -e 's/implementations::grok_build/implementations::nofy_build/g' \
        -e 's/implementations\/grok_build/implementations\/nofy_build/g' \
        -e 's/_x\.ai\//_nofy\//g' \
        -e 's/GROK_/NOFY_/g' \
        -e 's/xai-title-/nofy-title-/g' \
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
        range="${1:?用法: upstream_diff.sh --changed <tag>..}"
        git -C "$UPSTREAM_REPO" diff --name-only "$range" -- 'crates/*.rs' | while read -r f; do
            ours="$(map_path "$f")"
            if [ -f "$OUR_ROOT/$ours" ]; then
                echo "存在  $ours"
            else
                echo "缺失  $ours  (上游: $f)"
            fi
        done | sort | uniq -c | sort -rn | head -80
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
