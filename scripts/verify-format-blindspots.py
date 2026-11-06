#!/usr/bin/env python3
"""Ratchet against code that `cargo fmt --check` silently skips.

rustfmt cannot format a statement when it contains something it cannot lay out:
a string literal wider than the line (long SQL), or a `select!`-style macro whose
arguments are not Rust expressions. It then leaves the *whole enclosing
statement* as written and still reports success, so dense, unreviewable code
passes the format check. Formatted code never contains `let x=...`, `){` or
`x=>y`, so those spellings mark regions rustfmt skipped.

The baseline records today's count per file. A file may not get denser and a
file without a baseline entry must have none. When you clean a region up, lower
the baseline with `--update`.

Usage: verify-format-blindspots.py [--update]
"""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
BASELINE = ROOT / "scripts" / "format-blindspots.baseline.json"
STRING = re.compile(r'"(?:\\.|[^"\\])*"')
CHAR = re.compile(r"'(?:\\.|[^'\\])'")
MARKERS = [
    re.compile(r"\blet (?:mut )?[A-Za-z_]\w*=[^=>]"),
    re.compile(r"\)\{"),
    re.compile(r"\w=>"),
]


def is_test_path(path):
    parts = path.relative_to(ROOT).parts
    return "target" in parts or "tests" in parts or path.name == "tests.rs"


def count(path):
    total = 0
    for line in path.read_text(encoding="utf-8").splitlines():
        code = CHAR.sub("''", STRING.sub('""', line)).split("//", 1)[0]
        if any(marker.search(code) for marker in MARKERS):
            total += 1
    return total


def scan():
    counts = {}
    for path in sorted((ROOT / "crates").rglob("*.rs")):
        if is_test_path(path):
            continue
        found = count(path)
        if found:
            counts[str(path.relative_to(ROOT))] = found
    return counts


def main():
    current = scan()
    if "--update" in sys.argv[1:]:
        BASELINE.write_text(json.dumps(current, indent=2, sort_keys=True) + "\n")
        print(f"baseline written: {len(current)} files, {sum(current.values())} lines")
        return
    baseline = json.loads(BASELINE.read_text()) if BASELINE.exists() else {}
    worse = {
        name: (baseline.get(name, 0), found)
        for name, found in current.items()
        if found > baseline.get(name, 0)
    }
    if worse:
        for name, (old, new) in sorted(worse.items()):
            print(f"{name}: {old} -> {new} lines rustfmt would never emit", file=sys.stderr)
        raise SystemExit(
            "rustfmt skipped these regions (long literal or select!-style macro). "
            "Move long SQL/text into a const or split the statement so it is formatted."
        )
    better = sum(baseline.get(name, 0) - found for name, found in current.items() if found < baseline.get(name, 0))
    better += sum(v for name, v in baseline.items() if name not in current)
    note = f"; {better} lines cleaned up, lower the baseline with --update" if better else ""
    print(f"format blind spots: {sum(current.values())} lines in {len(current)} files, none added{note}")


if __name__ == "__main__":
    main()
