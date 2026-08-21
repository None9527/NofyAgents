#!/usr/bin/env python3
"""Aggregate results.tsv into a human-readable markdown report."""
import sys
from collections import OrderedDict

path = sys.argv[1] + "/results.tsv"
rows = []
with open(path) as f:
    header = f.readline().rstrip("\n").split("\t")
    for line in f:
        parts = line.rstrip("\n").split("\t", 5)
        if len(parts) == 6:
            rows.append(dict(zip(header, parts)))

dims = OrderedDict()
for r in rows:
    dims.setdefault(r["id"][:2], []).append(r)

STATUS = {"pass": "✅", "partial": "🔶", "fail": "❌"}
ATTR = {"M": "模型能力", "W": "接线缺口", "H": "harness", "-": ""}

def attr_label(a):
    if a.startswith("W"):
        return f"接线缺口({a})"
    return ATTR.get(a, a)

print("# 用户旅程基准结果(v2)\n")
total = len(rows)
np = sum(1 for r in rows if r["status"] == "pass")
npar = sum(1 for r in rows if r["status"] == "partial")
nf = sum(1 for r in rows if r["status"] == "fail")
print(f"总计 {total} 题:✅ {np} / 🔶 {npar} / ❌ {nf}\n")

for d, rs in dims.items():
    p = sum(1 for r in rs if r["status"] == "pass")
    print(f"## {d}({p}/{len(rs)})\n")
    print("| 题 | 状态 | 归因 | 耗时 | 说明 |")
    print("|---|---|---|---|---|")
    for r in rs:
        print(f"| {r['id']} {r['title']} | {STATUS.get(r['status'], r['status'])} "
              f"| {attr_label(r['attr'])} | {r['secs']}s | {r['note']} |")
    print()

gaps = [r for r in rows if r["attr"].startswith("W")]
if gaps:
    print("## 接线缺口清单(W 归因)\n")
    for r in gaps:
        print(f"- **{r['id']}** {r['title']}:{r['note']}")
