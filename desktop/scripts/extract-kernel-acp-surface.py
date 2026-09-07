#!/usr/bin/env python3
"""Extract the kernel ACP communication surface (read-only reference artifact).

Sources of truth:
  A. stdlib points  : crates/codegen/nofy-acp-lib/src/message.rs enums
                      (AcpAgentMessageGeneric = client->agent, AcpClientMessageGeneric = agent->client)
  B. extension names: every "_nofy/..." string literal under crates/**/*.rs
                      classified by presence in the agent dispatch table
                      (crates/codegen/nofy-shell/src/agent/mvp_agent/acp_agent.rs)
  C. cross-check    : names cited by desktop/src/docs/PORTING-PLAN.md section 2.2

Output: desktop/src/docs/KERNEL-ACP-SURFACE.md (generated; regenerate after kernel changes)
"""
import os
import re
import subprocess
import sys

ROOT = subprocess.run(["git", "rev-parse", "--show-toplevel"], capture_output=True, text=True).stdout.strip()
LIB = os.path.join(ROOT, "crates", "codegen", "nofy-acp-lib", "src", "message.rs")
DISPATCH = os.path.join(ROOT, "crates", "codegen", "nofy-shell", "src", "agent", "mvp_agent", "acp_agent.rs")
PLAN = os.path.join(ROOT, "desktop", "src", "docs", "PORTING-PLAN.md")
OUT = os.path.join(ROOT, "desktop", "src", "docs", "KERNEL-ACP-SURFACE.md")

# 内核源码里的扩展线路名是**无下划线**字面量（"nofy/session/list"）；线上 wire 名带
# `_nofy/` 前缀（PORTING-PLAN §2.2：双向带前缀，seam 侧幂等补/去）。故提取裸名，
# 产出时统一加 `_` 前缀表示 wire 形。
EXT_RE = re.compile(r'"((?:_?nofy)/[A-Za-z0-9_/\-]+)"')


def read(p):
    with open(p, encoding="utf-8") as f:
        return f.read()


def enum_variants(text, enum_name):
    m = re.search(r"pub enum %s[^{]*\{(.*?)\n    \}" % re.escape(enum_name), text, re.S)
    if not m:
        return []
    out = []
    for line in m.group(1).splitlines():
        mm = re.match(r"\s*([A-Za-z]+)\(AcpArgsGeneric<([^,>]+)", line)
        if mm:
            out.append((mm.group(1), mm.group(2)))
    return out


def main():
    lib = read(LIB)
    agent_side = enum_variants(lib, "AcpAgentMessageGeneric")   # client -> agent
    client_side = enum_variants(lib, "AcpClientMessageGeneric")  # agent -> client

    # extension literals across the kernel
    hits = {}
    for dirpath, dirnames, filenames in os.walk(os.path.join(ROOT, "crates")):
        dirnames[:] = [d for d in dirnames if d not in (".git", "target")]
        for fn in filenames:
            if not fn.endswith(".rs"):
                continue
            p = os.path.join(dirpath, fn)
            rel = os.path.relpath(p, ROOT)
            for i, line in enumerate(read(p).splitlines(), 1):
                for raw in EXT_RE.findall(line):
                    name = raw if raw.startswith("_") else "_" + raw
                    e = hits.setdefault(name, {"count": 0, "files": set(), "dispatch": False})
                    e["count"] += 1
                    e["files"].add(rel)
    disp = read(DISPATCH)
    for name in hits:
        bare = name[1:]
        if ('"%s"' % bare) in disp or ('"%s"' % name) in disp:
            hits[name]["dispatch"] = True

    plan = read(PLAN)
    sec = plan.split("### 2.2", 1)[1].split("### 2.3", 1)[0] if "### 2.2" in plan else ""
    plan_names = set(EXT_RE.findall(sec))
    # plan also cites bare names like nofy/session/info inside prose; capture `nofy/...` too
    plan_names |= set(re.findall(r'"?(nofy/[A-Za-z0-9_/\-]+)"?', sec))
    plan_names = {n if n.startswith("_nofy/") else "_" + n for n in plan_names}

    code_names = set(hits)
    only_plan = sorted(plan_names - code_names)
    only_code = sorted(code_names - plan_names)

    lines = []
    lines.append("# 内核 ACP 通信面（机器提取参考件）\n")
    lines.append("> 由 `desktop/scripts/extract-kernel-acp-surface.py` 生成；内核改动后重跑。")
    lines.append("> 用途：P1b 的 ACP→v4 映射与后续能力点亮的**权威名字表**；不作阶段门槛。\n")
    lines.append("## A. stdlib 点（nofy-acp-lib message.rs 枚举，全量）\n")
    lines.append("### client → agent（%d）\n" % len(agent_side))
    for v, t in agent_side:
        lines.append("- `%s` — `%s`" % (v, t))
    lines.append("\n### agent → client（%d）\n" % len(client_side))
    for v, t in client_side:
        lines.append("- `%s` — `%s`" % (v, t))
    lines.append("\n## B. `_nofy/*` 扩展名（crates 全树字面量，%d 个）\n" % len(hits))
    lines.append("| 线路名 | 字面量次数 | 在 agent 分派表 | 出现文件数 |")
    lines.append("|---|---|---|---|")
    for name in sorted(hits):
        e = hits[name]
        lines.append("| `%s` | %d | %s | %d |" % (name, e["count"], "是" if e["dispatch"] else "否", len(e["files"])))
    lines.append("\n## C. 与 PORTING-PLAN §2.2 的对账\n")
    lines.append("- §2.2 提及而 crates 字面量未见（%d）：%s" % (len(only_plan), ", ".join("`%s`" % n for n in only_plan) or "无"))
    lines.append("- crates 字面量有而 §2.2 未提及（%d）：%s" % (len(only_code), ", ".join("`%s`" % n for n in only_code) or "无"))
    lines.append("\n注：分派表判定用整名字符串包含，format! 拼接或常量间接的线路会被低估；")
    lines.append("「在 agent 分派表=否」仅表示未在 acp_agent.rs 以整名出现（可能是纯通知发射方）。")

    with open(OUT, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    print("wrote", os.path.relpath(OUT, ROOT))
    print("stdlib client->agent=%d agent->client=%d extensions=%d dispatch=%d" % (
        len(agent_side), len(client_side), len(hits), sum(1 for e in hits.values() if e["dispatch"])))
    print("only_plan=%d only_code=%d" % (len(only_plan), len(only_code)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
