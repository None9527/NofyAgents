#!/usr/bin/env python3
"""probe9 汇总器：把 renderer→host 通道调用录像（JSONL）压成合同事实。

用法：
    python3 desktop/scripts/analyze-agent-calls.py [logfile]
默认 logfile = /tmp/nofy-obs/agent-calls.jsonl（由 NOFY_OBS_AGENT=1 的真应用写出）。

输出四段：通道方法清单、调用序列（首次出现的 通道.方法 + 参数摘要 + 结果/错误）、
错误聚类、emitter 推送形状。只读，不改仓库。
"""
import collections
import json
import os
import sys

DEFAULT_LOG = "/tmp/nofy-obs/agent-calls.jsonl"
ARG_WIDTH = 220


def load(path):
    rows = []
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                rows.append(json.loads(line))
            except json.JSONDecodeError as err:
                print(f"[warn] 跳过无法解析的行: {err}", file=sys.stderr)
    return rows


def clip(text, width=ARG_WIDTH):
    text = " ".join(str(text).split())
    return text if len(text) <= width else text[:width] + "…"


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("NOFY_OBS_AGENT_FILE", DEFAULT_LOG)
    if not os.path.exists(path):
        print(f"没有录像文件：{path}\n先用 NOFY_OBS_AGENT=1 启动应用（见 FRONTEND-FIRST-PRINCIPLES.md §8）。")
        return 2
    rows = load(path)
    print(f"== 录像 {path}：{len(rows)} 条 ==\n")

    print("== 通道方法清单 ==")
    for row in rows:
        if row.get("kind") == "observer-attached":
            methods = row.get("methods") or []
            print(f"  {row.get('channel')}: {len(methods)} 方法")
            for name in methods:
                print(f"    - {name}")
    print()

    print("== 调用序列（每个 通道.方法 的首次出现）==")
    calls = {row["callId"]: row for row in rows if row.get("kind") == "call" and "callId" in row}
    outcome = {}
    for row in rows:
        if row.get("kind") in ("result", "error") and "callId" in row:
            outcome.setdefault(row["callId"], row)
    seen = set()
    order = 0
    for row in rows:
        if row.get("kind") != "call":
            continue
        key = (row.get("channel"), row.get("method"))
        if key in seen:
            continue
        seen.add(key)
        order += 1
        end = outcome.get(row.get("callId"))
        verdict = "（未见返回）"
        if end:
            if end["kind"] == "result":
                verdict = f"→ {end.get('shape')}"
            else:
                verdict = f"✗ {end.get('name') or 'Error'}: {clip(end.get('message'), 160)}"
        repeats = sum(1 for r in rows if r.get("kind") == "call" and (r.get("channel"), r.get("method")) == key)
        print(f"  {order:2d}. {row.get('channel')}.{row.get('method')}  ×{repeats}")
        print(f"      args: {clip(row.get('args'))}")
        print(f"      {verdict}")
    print()

    print("== 错误聚类 ==")
    errors = collections.Counter(
        (row.get("channel"), row.get("method"), clip(row.get("message"), 120))
        for row in rows
        if row.get("kind") == "error"
    )
    if not errors:
        print("  （无）")
    for (channel, method, message), count in errors.most_common():
        print(f"  ×{count} {channel}.{method}: {message}")
    print()

    print("== emitter 订阅与推送 ==")
    access = collections.Counter(
        (row.get("channel"), row.get("method"), clip(row.get("args"), 120))
        for row in rows
        if row.get("kind") == "emitter-access"
    )
    for (channel, method, args), count in access.most_common():
        print(f"  订阅 ×{count} {channel}.{method} {args}")
    pushes = [row for row in rows if row.get("kind") == "emitter-push"]
    if not pushes:
        print("  推送：（无——host 未向 renderer 推过任何帧）")
    shapes = collections.Counter((row.get("method"), row.get("shape")) for row in pushes)
    for (method, shape), count in shapes.most_common(20):
        print(f"  推送 ×{count} {method}: {clip(shape, 200)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
