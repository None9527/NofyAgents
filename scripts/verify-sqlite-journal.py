#!/usr/bin/env python3
"""Static gate ensuring production SQLite opens route through `nofy-sqlite-journal`.

Direct `rusqlite::Connection::open*` calls and hardcoded `JournalMode::Wal.open`
/ `JournalMode::Wal.apply` bypass network-filesystem detection (risking WAL
`-shm` mmap SIGBUS on NFS/FUSE/SMB) and/or skip `busy_timeout` initialization.

Scans production Rust sources under `crates/common/*/src/**/*.rs`, skipping:
- `crates/common/nofy-sqlite-journal/` itself (the sanctioned abstraction)
- test-only modules (`tests.rs`, `*_tests.rs`, `.../tests/...`)
- comments, string/char literals, and `#[cfg(test)]` items

Policy:
- Zero tolerance for any file not listed in the explicit ratchet allowlist below.
- Allowlisted files may only decrease (never increase); new files fail immediately.
- Exact-path wrappers (`nofy-agent-runtime/src/durable.rs`) are additionally
  verified to invoke `JournalMode::for_db_path` and `apply_with_retry`.

Usage: python3 scripts/verify-sqlite-journal.py
"""
from __future__ import annotations

import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
CRATES_COMMON = ROOT / "crates" / "common"

# Per-file ratchet ceilings for legacy/wrapper sites. Counts may only decrease;
# adding a new file or exceeding a ceiling fails the gate.
ALLOWLIST: dict[str, dict[str, tuple[int, str]]] = {
    "raw_open": {
        "crates/common/nofy-agent-runtime/src/durable.rs": (
            2,
            "central exact-path connect/open_readonly_exact wrappers enforcing "
            "JournalMode::for_db_path + apply_with_retry/busy_timeout without "
            "passing SQLITE_OPEN_CREATE or rewriting pinned snapshot paths",
        ),
        "crates/common/nofy-memory/src/transport/database.rs": (
            2,
            "legacy snapshot transport inspect/copy (ratchet ceiling; do not increase)",
        ),
        "crates/common/nofy-agent-host/src/evolution/journal.rs": (
            1,
            "legacy host evolution journal open (ratchet ceiling; do not increase)",
        ),
        "crates/common/nofy-agent-host/src/loader/memory/transfer/store.rs": (
            1,
            "legacy host memory transfer catalog open (ratchet ceiling; do not increase)",
        ),
        "crates/common/nofy-agent-host/src/loader/runtime_history/transfer.rs": (
            1,
            "legacy host runtime history transfer open (ratchet ceiling; do not increase)",
        ),
    },
    "hardcoded_wal": {
        "crates/common/nofy-agent-host/src/loader/memory/transfer/store.rs": (
            1,
            "legacy host memory transfer JournalMode::Wal.open "
            "(ratchet ceiling; zero tolerance in nofy-agent-runtime and nofy-memory)",
        ),
    },
}

# Exact-path wrapper files permitted to call `Connection::open_with_flags` MUST
# still route through `JournalMode::for_db_path` and `apply_with_retry`.
EXACT_PATH_WRAPPERS = {
    "crates/common/nofy-agent-runtime/src/durable.rs",
}

PATTERNS: dict[str, tuple[re.Pattern[str], str]] = {
    "raw_open": (
        re.compile(r"\b(?:rusqlite\s*::\s*)?Connection\s*::\s*open\w*\s*\("),
        "use `nofy_sqlite_journal::JournalMode::for_db_path(path).open(...)` or `.open_readonly(...)`",
    ),
    "hardcoded_wal": (
        re.compile(
            r"\bJournalMode\s*::\s*Wal\s*\.\s*"
            r"(?:open|open_readonly|open_readonly_until|apply|apply_with_retry|apply_with_retry_until)\s*\("
        ),
        "use `JournalMode::for_db_path(path)` instead of hardcoding `JournalMode::Wal`",
    ),
}

CHAR_LITERAL_RE = re.compile(
    r"'(?:\\(?:x[0-9a-fA-F]{2}|u\{[0-9a-fA-F_]+\}|.)|[^'\\\n])'"
)
CFG_TEST_RE = re.compile(r"#\s*\[\s*cfg\s*\(\s*test\s*\)\s*\]")


def is_ident_char(ch: str) -> bool:
    return ch.isalnum() or ch == "_"


def is_skipped_path(path: pathlib.Path) -> bool:
    rel = path.relative_to(ROOT)
    parts = rel.parts
    if len(parts) < 4 or parts[0] != "crates" or parts[1] != "common":
        return True
    if parts[2] == "nofy-sqlite-journal":
        return True
    if "target" in parts or "tests" in parts:
        return True
    if path.name == "tests.rs" or path.name.endswith("_tests.rs"):
        return True
    return False


def blank_preserving_newlines(text: str) -> str:
    return "".join("\n" if ch == "\n" else " " for ch in text)


def strip_comments_and_literals(source: str) -> str:
    """Replace comments and string/char literals with spaces, preserving line numbers."""
    out: list[str] = []
    i = 0
    n = len(source)

    while i < n:
        ch = source[i]

        # Line comment: //...
        if ch == "/" and i + 1 < n and source[i + 1] == "/":
            start = i
            i += 2
            while i < n and source[i] != "\n":
                i += 1
            out.append(" " * (i - start))
            continue

        # Nested block comment: /* ... */
        if ch == "/" and i + 1 < n and source[i + 1] == "*":
            depth = 1
            out.append("  ")
            i += 2
            while i < n and depth > 0:
                if source[i] == "/" and i + 1 < n and source[i + 1] == "*":
                    depth += 1
                    out.append("  ")
                    i += 2
                elif source[i] == "*" and i + 1 < n and source[i + 1] == "/":
                    depth -= 1
                    out.append("  ")
                    i += 2
                else:
                    out.append("\n" if source[i] == "\n" else " ")
                    i += 1
            continue

        # Raw strings: r"...", r#"..."#, br#"..."#, cr#"..."#
        prev = source[i - 1] if i > 0 else ""
        if not is_ident_char(prev):
            raw_prefix = None
            if ch == "r":
                raw_prefix = 1
            elif ch in ("b", "c") and i + 1 < n and source[i + 1] == "r":
                raw_prefix = 2
            if raw_prefix is not None:
                j = i + raw_prefix
                hashes = 0
                while j < n and source[j] == "#":
                    hashes += 1
                    j += 1
                if j < n and source[j] == '"':
                    end_delim = '"' + ("#" * hashes)
                    j += 1
                    close = source.find(end_delim, j)
                    if close == -1:
                        out.append(blank_preserving_newlines(source[i:]))
                        break
                    end = close + len(end_delim)
                    out.append(blank_preserving_newlines(source[i:end]))
                    i = end
                    continue

        # Byte/C normal string prefix: b"...", c"..."
        if ch in ("b", "c") and not is_ident_char(prev) and i + 1 < n and source[i + 1] == '"':
            out.append("  ")
            i += 2
            while i < n:
                if source[i] == "\\" and i + 1 < n:
                    out.append(" ")
                    out.append("\n" if source[i + 1] == "\n" else " ")
                    i += 2
                elif source[i] == '"':
                    out.append(" ")
                    i += 1
                    break
                else:
                    out.append("\n" if source[i] == "\n" else " ")
                    i += 1
            continue

        # Normal string literal: "..."
        if ch == '"':
            out.append(" ")
            i += 1
            while i < n:
                if source[i] == "\\" and i + 1 < n:
                    out.append(" ")
                    out.append("\n" if source[i + 1] == "\n" else " ")
                    i += 2
                elif source[i] == '"':
                    out.append(" ")
                    i += 1
                    break
                else:
                    out.append("\n" if source[i] == "\n" else " ")
                    i += 1
            continue

        # Byte char literal b'x' or char literal 'x' (does not match lifetimes like 'a).
        if ch == "b" and not is_ident_char(prev) and i + 1 < n and source[i + 1] == "'":
            match = CHAR_LITERAL_RE.match(source, i + 1)
            if match:
                out.append(" " * (match.end() - i))
                i = match.end()
                continue
        if ch == "'":
            match = CHAR_LITERAL_RE.match(source, i)
            if match:
                out.append(" " * (match.end() - i))
                i = match.end()
                continue

        out.append(ch)
        i += 1

    return "".join(out)


def skip_attr(code: str, pos: int) -> int:
    """Given `pos` at `#` of an attribute `#[...]`, return index right after `]`."""
    n = len(code)
    j = pos + 1
    while j < n and code[j].isspace():
        j += 1
    if j >= n or code[j] != "[":
        return pos + 1
    depth = 1
    j += 1
    while j < n and depth > 0:
        if code[j] == "[":
            depth += 1
        elif code[j] == "]":
            depth -= 1
        j += 1
    return j


def strip_cfg_test_items(code: str) -> str:
    """Blank out items annotated with `#[cfg(test)]`, preserving line numbers."""
    chars = list(code)
    n = len(code)
    search_from = 0

    while True:
        match = CFG_TEST_RE.search(code, search_from)
        if not match:
            break
        start = match.start()
        i = match.end()

        # Skip any stacked outer attributes attached to the same item.
        while True:
            while i < n and code[i].isspace():
                i += 1
            if i < n and code[i] == "#":
                i = skip_attr(code, i)
                continue
            break

        # Advance through the attached item until its terminating `;` or matching `}`.
        brace_depth = 0
        paren_depth = 0
        seen_brace = False
        while i < n:
            ch = code[i]
            if ch == "(":
                paren_depth += 1
            elif ch == ")":
                paren_depth = max(0, paren_depth - 1)
            elif ch == "{":
                brace_depth += 1
                seen_brace = True
            elif ch == "}":
                if brace_depth > 0:
                    brace_depth -= 1
                    if seen_brace and brace_depth == 0:
                        i += 1
                        break
            elif ch == ";" and brace_depth == 0 and paren_depth == 0:
                i += 1
                break
            i += 1

        for k in range(start, i):
            if chars[k] != "\n":
                chars[k] = " "
        search_from = i

    return "".join(chars)


def line_number(text: str, offset: int) -> int:
    return text.count("\n", 0, offset) + 1


def scan() -> tuple[dict[str, dict[str, list[tuple[int, str]]]], list[str]]:
    hits: dict[str, dict[str, list[tuple[int, str]]]] = {
        name: {} for name in PATTERNS
    }
    wrapper_errors: list[str] = []

    for path in sorted(CRATES_COMMON.glob("*/src/**/*.rs")):
        if is_skipped_path(path):
            continue
        rel = str(path.relative_to(ROOT))
        raw = path.read_text(encoding="utf-8")
        lines = raw.splitlines()
        cleaned = strip_cfg_test_items(strip_comments_and_literals(raw))

        if rel in EXACT_PATH_WRAPPERS:
            if "JournalMode::for_db_path" not in cleaned or "apply_with_retry" not in cleaned:
                wrapper_errors.append(
                    f"{rel}: exact-path wrapper must delegate to "
                    "`JournalMode::for_db_path` and `apply_with_retry`"
                )

        for kind, (pattern, _) in PATTERNS.items():
            matches = list(pattern.finditer(cleaned))
            if matches:
                file_hits = []
                for m in matches:
                    ln = line_number(cleaned, m.start())
                    snippet = lines[ln - 1].strip() if ln <= len(lines) else ""
                    file_hits.append((ln, snippet))
                hits[kind][rel] = file_hits

    return hits, wrapper_errors


def main() -> None:
    hits, wrapper_errors = scan()
    failures: list[str] = list(wrapper_errors)
    notes: list[str] = []

    for kind, (_, advice) in PATTERNS.items():
        allowed = ALLOWLIST.get(kind, {})
        found_map = hits[kind]
        total_found = sum(len(v) for v in found_map.values())
        fewer = 0

        for rel, locations in sorted(found_map.items()):
            cap = allowed[rel][0] if rel in allowed else 0
            if len(locations) > cap:
                failures.append(
                    f"[{kind}] {rel}: {cap} allowed -> {len(locations)} found ({advice})"
                )
                for ln, snippet in locations:
                    print(f"  [{kind}] {rel}:{ln}: {snippet}", file=sys.stderr)
            elif len(locations) < cap:
                fewer += cap - len(locations)

        for rel, (cap, _) in allowed.items():
            if rel not in found_map:
                fewer += cap

        note = f"{kind}: {total_found} in {len(found_map)} files"
        if fewer:
            note += f" ({fewer} fewer than ceiling; tighten ALLOWLIST)"
        notes.append(note)

    if failures:
        for msg in failures:
            print(f"ERROR: {msg}", file=sys.stderr)
        raise SystemExit(1)

    print("sqlite journal gate passed -- " + "; ".join(notes))


if __name__ == "__main__":
    main()
