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


def mask_structure(source):
    """Blank comments and string/char literals while preserving offsets and newlines."""
    n = len(source)
    out = list(source)

    def blank(start, end):
        for k in range(start, end):
            if out[k] != "\n":
                out[k] = " "

    i = 0
    while i < n:
        c = source[i]
        nxt = source[i + 1] if i + 1 < n else ""
        if c == "/" and nxt == "/":
            j = source.find("\n", i)
            j = n if j < 0 else j
            blank(i, j)
            i = j
        elif c == "/" and nxt == "*":
            depth, j = 1, i + 2
            while j < n and depth:
                if source.startswith("/*", j):
                    depth, j = depth + 1, j + 2
                elif source.startswith("*/", j):
                    depth, j = depth - 1, j + 2
                else:
                    j += 1
            blank(i, j)
            i = j
        elif (
            c == "r"
            and re.match(r'r#*"', source[i : i + 12])
            and (i == 0 or not (source[i - 1].isalnum() or source[i - 1] == "_"))
        ):
            hashes = len(re.match(r"r(#*)", source[i : i + 12]).group(1))
            close = '"' + "#" * hashes
            j = source.find(close, i + 2 + hashes)
            j = n if j < 0 else j + len(close)
            blank(i, j)
            i = j
        elif c == '"':
            j = i + 1
            while j < n and source[j] != '"':
                j += 2 if source[j] == "\\" else 1
            j = min(j + 1, n)
            blank(i, j)
            i = j
        elif c == "'":
            m = re.match(r"'(?:\\u\{[0-9a-fA-F_]+\}|\\.|[^'\\\n])'", source[i : i + 14])
            if m:
                blank(i, i + m.end())
                i += m.end()
            else:
                i += 1
        else:
            i += 1
    return "".join(out)


def is_test_cfg(expr):
    s = expr.strip()
    if s == "test":
        return True
    m = re.fullmatch(r"all\s*\((.*)\)", s, re.S)
    if not m:
        return False
    body = m.group(1)
    depth, parts, cur = 0, [], []
    for ch in body:
        if ch == "(":
            depth += 1
            cur.append(ch)
        elif ch == ")":
            depth -= 1
            if depth < 0:
                return False
            cur.append(ch)
        elif ch == "," and depth == 0:
            parts.append("".join(cur).strip())
            cur = []
        else:
            cur.append(ch)
    if depth != 0:
        return False
    if cur:
        parts.append("".join(cur).strip())
    return any(is_test_cfg(part) for part in parts)


def strip_test_modules(source):
    """Blank inline `#[cfg(test)]` / `#[cfg(all(test, ...))]` `mod name { ... }` blocks."""
    structure = mask_structure(source)
    out = list(source)
    pos = 0
    for m in re.finditer(r"#\[\s*cfg\s*\(", structure):
        if m.start() < pos:
            continue
        depth, k = 1, m.end()
        while k < len(structure) and depth:
            if structure[k] == "(":
                depth += 1
            elif structure[k] == ")":
                depth -= 1
            k += 1
        if depth != 0:
            continue
        close_bracket = re.match(r"\s*\]", structure[k:])
        if not close_bracket:
            continue
        attr_end = k + close_bracket.end()
        if not is_test_cfg(structure[m.end() : k - 1]):
            continue
        rest = re.compile(r"\s*(?:#\[[^\]]*\]\s*)*(?:pub(?:\([^)]*\))?\s+)?mod\s+\w+\s*([{;])").match(
            structure, attr_end
        )
        if not rest or rest.group(1) != "{":
            continue
        brace_depth, end = 0, -1
        for j in range(rest.end() - 1, len(structure)):
            if structure[j] == "{":
                brace_depth += 1
            elif structure[j] == "}":
                brace_depth -= 1
                if brace_depth == 0:
                    end = j
                    break
        if end < 0:
            continue
        for j in range(m.start(), end + 1):
            if out[j] != "\n":
                out[j] = " "
        pos = end + 1
    return "".join(out)


def count(path):
    total = 0
    for line in strip_test_modules(path.read_text(encoding="utf-8")).splitlines():
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
