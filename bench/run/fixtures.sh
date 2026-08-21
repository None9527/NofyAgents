#!/usr/bin/env bash
# Seed benchmark fixtures: alpha (python, hidden bug), beta (shell), gamma (docs).
# Usage: fixtures.sh $BENCH_ROOT
set -euo pipefail
ROOT="${1:?BENCH_ROOT required}"
P="$ROOT/projects"
rm -rf "$P"
mkdir -p "$P"

# ---------- alpha: python project with a hidden bug ----------
mkdir -p "$P/alpha/src" "$P/alpha/tests"
cat > "$P/alpha/src/calc.py" <<'EOF'
"""Small calculator library."""


def add(a, b):
    return a + b


def mean(values):
    if not values:
        raise ValueError("mean of empty list")
    return sum(values) / len(values)


def sum_squares(values):
    total = 0
    for v in values:
        total += v * v
    return total


def sqrt_safe(x):
    # BUG: does not guard negative input; math domain error leaks raw.
    import math
    return math.sqrt(x)
EOF
cat > "$P/alpha/tests/test_calc.py" <<'EOF'
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

import calc


def test_add():
    assert calc.add(2, 3) == 5


def test_mean():
    assert calc.mean([1, 2, 3]) == 2


def test_sum_squares():
    assert calc.sum_squares([1, 2, 3]) == 14


def test_sqrt_safe_negative():
    # The library promises None for invalid input, not an exception.
    assert calc.sqrt_safe(-1) is None
EOF
cat > "$P/alpha/README.md" <<'EOF'
# alpha 计算库

一个小型 Python 计算器库,用于基准测试。

约定:
- 缩进一律使用 4 个空格。
- 提交信息必须使用中文。
EOF
cat > "$P/alpha/AGENTS.md" <<'EOF'
# 项目规则

- 修改任何代码后,必须运行 `pytest -q` 验证。
- 不要删除已有测试。
EOF
(cd "$P/alpha" && git init -q && git add -A && git -c user.email=bench@local -c user.name=bench commit -qm "初始提交")

# ---------- beta: shell tool project ----------
mkdir -p "$P/beta/scripts" "$P/beta/docs"
cat > "$P/beta/scripts/backup.sh" <<'EOF'
#!/usr/bin/env bash
# backs up a directory to a destination
SRC=/home/none/data
DST=/mnt/backup
tar czf "$DST/backup-$(date +%F).tar.gz" -C "$SRC" .
echo "backup done"
EOF
cat > "$P/beta/config.toml" <<'EOF'
[backup]
keep_days = 7
EOF
cat > "$P/beta/docs/usage.md" <<'EOF'
# 备份工具使用说明

运行 `scripts/backup.sh` 即可备份数据。备份目标当前写死在脚本里。
EOF
(cd "$P/beta" && git init -q && git add -A && git -c user.email=bench@local -c user.name=bench commit -qm "初始提交")

# ---------- gamma: document pile for steward ----------
mkdir -p "$P/gamma"
for i in $(seq 1 10); do
  echo "note $i: the quick brown fox" > "$P/gamma/note-$i.md"
done
for i in $(seq 1 8); do
  echo "纪要 $i:明天讨论预算" > "$P/gamma/纪要-$i.txt"
done
cp "$P/gamma/note-1.md" "$P/gamma/note-1-copy.md"
cp "$P/gamma/note-2.md" "$P/gamma/note-2-copy.md"
cp "$P/gamma/纪要-1.txt" "$P/gamma/纪要-1-副本.txt"
truncate -s 50M "$P/gamma/big-archive.bin"
echo "fixtures seeded at $P"
