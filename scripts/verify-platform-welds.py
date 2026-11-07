#!/usr/bin/env python3
"""Ratchet on the places where the kernel's own code is welded to one platform.

The kernel is meant to behave the same on Linux, macOS and Windows: the protocol,
the state it commits, the digests it computes and the answers it gives must not
depend on which operating system it runs on. Where a platform really differs
(files, processes, terminals, confinement) that difference belongs in a small
platform layer that reports what it can do. This script counts the places that
do not follow that rule, per crate, outside the platform layer:

  linux_gate         `target_os = "linux"`: support decided by the operating
                     system's name at compile time, not by a capability probe.
  libc_call          `libc::` outside the platform layer.
  unix_fork          `cfg(unix)` / `cfg(not(unix))`: every `not(unix)` branch is
                     a place Windows silently gets something different.
  proc_sys           `/proc` and `/sys` paths.
  unix_path_literal  `/tmp`, `/dev/null`, `/bin/sh`, `/usr/...` and the like.
  slash_absolute     `starts_with('/')`: a Unix idea of an absolute path (JSON
                     Pointer checks share the syntax and are skipped by name).
  inode_identity     file identity from inode and device numbers.
  unix_ipc           descriptor passing, Unix sockets, pseudo-terminals.
  process_signal     process groups, sessions, parent-death signals, waitpid.
  linux_only_tests   tests that only exist on Linux, including the ones gated
                     one by one: they vanish from the other platforms' results.
  linux_only_factories
                     factories registered only on Linux: the catalogue a project
                     is checked against must not depend on the platform.

A crate may not gain a site; fixing one lets you lower the baseline. When a site
really must be added, rerun with `--update` in the same change so the increase
is visible in review. The counts are a heuristic over source text (comments and
`#[cfg(test)]` modules are removed first); they measure direction, not truth.

The platform layer is where platform code belongs, so it is not counted here:
the crates and files in PLATFORM_LAYER. The sandbox files listed there move out
of it only when the isolation work (docs/architecture/sandbox-module.md) is done.

Usage: verify-platform-welds.py [--update] [--detail CLASS]
"""
import collections
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
BASELINE = ROOT / "scripts" / "platform-welds.baseline.json"

# Platform code is allowed to be platform code. Crates are matched by prefix of
# the crate directory name; files by a substring of their path.
PLATFORM_LAYER_CRATES = (
    "nofy-tty-utils",
    "nofy-durable-fs",
    "nofy-private-fs",
    "nofy-isolation",
    "nofy-host-path",
)
PLATFORM_LAYER_FILES = (
    "nofy-agent-host/src/loader/process_tree",
    "nofy-agent-host/src/loader/process_sessions",
    "nofy-agent-host/src/loader/isolation.rs",
    "nofy-agent-host/src/loader/confine.rs",
)

CLASSES = collections.OrderedDict(
    [
        ("linux_gate", r'target_os\s*=\s*"linux"'),
        ("libc_call", r"\blibc::"),
        ("unix_fork", r'\bcfg!?\s*\(\s*(?:not\s*\(\s*)?unix\b|target_family\s*=\s*"unix"'),
        ("proc_sys", r'"/(?:proc|sys)(?:/|")'),
        (
            "unix_path_literal",
            r'"/(?:tmp|dev/null|bin/(?:sh|bash)|usr/|etc/|var/|run/|opt/|home/)[^"]*"|"/tmp"',
        ),
        ("slash_absolute", r"""starts_with\(\s*(?:'/'|"/")\s*\)"""),
        ("inode_identity", r"\bMetadataExt\b|\.ino\(\)|\.dev\(\)|\.rdev\(\)"),
        ("unix_ipc", r"SCM_RIGHTS|\bUnixStream\b|\bUnixListener\b|\bUnixDatagram\b|\bopenpty\b|\bforkpty\b"),
        ("process_signal", r"\bsetsid\b|\bsetpgid\b|\bkillpg\b|PDEATHSIG|\bwaitpid\b"),
    ]
)
ADVICE = {
    "linux_gate": "decide by a capability probe (nofy-isolation) or by cfg(unix), not by the operating system's name",
    "libc_call": "put the call behind the platform layer (nofy-host-path, nofy-durable-fs, nofy-tty-utils, ...)",
    "unix_fork": "give the non-Unix branch the same observable behaviour, or make it refuse and say why",
    "proc_sys": "read the fact through the platform layer, not a Linux path",
    "unix_path_literal": "build the path from the platform (temp dir, shell lookup), not a literal",
    "slash_absolute": "ask the platform layer whether a path is absolute",
    "inode_identity": "use FileIdentity from nofy-host-path",
    "unix_ipc": "belongs in the platform layer",
    "process_signal": "belongs in the platform layer (nofy-tty-utils)",
    "linux_only_tests": "gate on a capability with require_capability so the skip is visible, or make it run everywhere",
    "linux_only_factories": "register the factory everywhere and refuse at activation with the reason",
}
ALL_CLASSES = list(CLASSES) + ["linux_only_tests", "linux_only_factories"]


def mask(source):
    """Two same-length copies of `source`: comments blanked, and comments plus
    string and character literals blanked. Newlines are kept so lines line up."""
    n = len(source)
    keep_strings = list(source)
    blank_all = list(source)

    def blank(arrays, start, end):
        for array in arrays:
            for k in range(start, end):
                if array[k] != "\n":
                    array[k] = " "

    i = 0
    while i < n:
        c = source[i]
        nxt = source[i + 1] if i + 1 < n else ""
        if c == "/" and nxt == "/":
            j = source.find("\n", i)
            j = n if j < 0 else j
            blank((keep_strings, blank_all), i, j)
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
            blank((keep_strings, blank_all), i, j)
            i = j
        elif c == "r" and re.match(r'r#*"', source[i : i + 12]) and (i == 0 or not (source[i - 1].isalnum() or source[i - 1] == "_")):
            hashes = len(re.match(r"r(#*)", source[i : i + 12]).group(1))
            close = '"' + "#" * hashes
            j = source.find(close, i + 2 + hashes)
            j = n if j < 0 else j + len(close)
            blank((blank_all,), i, j)
            i = j
        elif c == '"':
            j = i + 1
            while j < n and source[j] != '"':
                j += 2 if source[j] == "\\" else 1
            j = min(j + 1, n)
            blank((blank_all,), i, j)
            i = j
        elif c == "'":
            m = re.match(r"'(?:\\u\{[0-9a-fA-F_]+\}|\\.|[^'\\\n])'", source[i : i + 14])
            if m:
                blank((blank_all,), i, i + m.end())
                i += m.end()
            else:
                i += 1
        else:
            i += 1
    return "".join(keep_strings), "".join(blank_all)


def matching_brace(text, open_index):
    depth = 0
    for k in range(open_index, len(text)):
        if text[k] == "{":
            depth += 1
        elif text[k] == "}":
            depth -= 1
            if depth == 0:
                return k
    return -1


def strip_test_modules(code, structure):
    """Blank every `#[cfg(test)] mod name { ... }` in both masks."""
    code, structure = list(code), list(structure)
    text = "".join(structure)
    for m in re.finditer(r"#\[cfg\(\s*test\s*\)\]", text):
        rest = re.compile(r"\s*(?:#\[[^\]]*\]\s*)*(?:pub(?:\([^)]*\))?\s+)?mod\s+\w+\s*([{;])").match(text, m.end())
        if not rest or rest.group(1) != "{":
            continue
        end = matching_brace(text, rest.end() - 1)
        if end < 0:
            continue
        for k in range(m.start(), end + 1):
            if code[k] != "\n":
                code[k] = " "
                structure[k] = " "
    return "".join(code), "".join(structure)


def gated_regions(code, structure, attribute):
    """Spans (start, end) of the statement or block each `attribute` applies to.
    The attribute is found in `code` (string literals kept); the statement's end
    is found in `structure` (literals blanked), which has the same offsets."""
    spans = []
    for m in re.finditer(re.escape(attribute), code):
        k = m.end()
        while k < len(structure) and structure[k].isspace():
            k += 1
        if k >= len(structure):
            continue
        # The item ends at its `;` or `,`, at the `}` that closes a block item,
        # or where the enclosing scope closes.
        depth, end = 0, k
        while end < len(structure):
            ch = structure[end]
            if ch in "({[":
                depth += 1
            elif ch in ")}]":
                if depth == 0:
                    end -= 1
                    break
                depth -= 1
                if ch == "}" and depth == 0:
                    break
            elif ch in ";," and depth == 0:
                break
            end += 1
        if end >= 0:
            spans.append((k, end))
    return spans


def crate_of(path):
    parts = path.relative_to(ROOT).parts
    return parts[2] if len(parts) > 2 and parts[0] == "crates" else parts[0]


def in_platform_layer(path):
    crate = crate_of(path)
    rel = path.relative_to(ROOT).as_posix()
    return crate.startswith(PLATFORM_LAYER_CRATES) or any(part in rel for part in PLATFORM_LAYER_FILES)


def is_test_file(path):
    rel = path.relative_to(ROOT).as_posix()
    name = path.name
    return (
        "/tests/" in rel
        or "/examples/" in rel
        or "/benches/" in rel
        or name == "tests.rs"
        or name.endswith("_tests.rs")
        or name.startswith("test_")
    )


def sources():
    for path in sorted((ROOT / "crates").rglob("*.rs")):
        if "/target/" in path.as_posix():
            continue
        yield path


def scan():
    counts = {name: collections.Counter() for name in ALL_CLASSES}
    where = {name: collections.defaultdict(list) for name in ALL_CLASSES}
    layer = {name: 0 for name in ALL_CLASSES}
    gate_attributes = re.compile(
        r'#!?\[cfg\([^\]]*target_os\s*=\s*"linux"[^\]]*\]\s*(?:#\[[^\]]*\]\s*)*#\[(?:tokio::)?test'
        r'|#!\[cfg\([^\]]*target_os\s*=\s*"linux"'
        r'|#\[cfg\(\s*all\(\s*test\s*,[^\]]*target_os\s*=\s*"linux"'
        r'|#\[cfg\(\s*all\([^\]]*target_os\s*=\s*"linux"[^\]]*,\s*test\s*\)'
    )
    for path in sources():
        try:
            source = path.read_text(errors="replace")
        except OSError:
            continue
        crate = crate_of(path)
        rel = path.relative_to(ROOT).as_posix()
        counted = not in_platform_layer(path)
        code, structure = mask(source)

        # Tests that only exist on Linux: look at every file, tests included.
        found = len(gate_attributes.findall(code))
        if found:
            if counted:
                counts["linux_only_tests"][crate] += found
                where["linux_only_tests"][crate].append(f"{rel} x{found}")
            else:
                layer["linux_only_tests"] += found

        if is_test_file(path):
            continue
        code, structure = strip_test_modules(code, structure)

        for name, pattern in CLASSES.items():
            n = 0
            for m in re.finditer(pattern, code):
                if name == "slash_absolute":
                    line_start = code.rfind("\n", 0, m.start()) + 1
                    line_end = code.find("\n", m.end())
                    if "pointer" in code[line_start : line_end if line_end >= 0 else None].lower():
                        continue
                n += 1
                if counted:
                    line = code.count("\n", 0, m.start()) + 1
                    where[name][crate].append(f"{rel}:{line}")
            if n:
                if counted:
                    counts[name][crate] += n
                else:
                    layer[name] += n

        factories = 0
        for start, end in gated_regions(code, structure, '#[cfg(target_os = "linux")]'):
            factories += len(re.findall(r"\bregister_factory\b", code[start : end + 1]))
        if factories:
            if counted:
                counts["linux_only_factories"][crate] += factories
                where["linux_only_factories"][crate].append(f"{rel} x{factories}")
            else:
                layer["linux_only_factories"] += factories
    return (
        {name: dict(sorted(c.items())) for name, c in counts.items()},
        where,
        layer,
    )


def main():
    args = sys.argv[1:]
    current, where, layer = scan()
    if "--detail" in args:
        name = args[args.index("--detail") + 1]
        for crate, sites in sorted(where[name].items()):
            print(f"{crate} ({len(sites)})")
            for site in sites:
                print(f"  {site}")
        return
    if "--update" in args:
        BASELINE.write_text(json.dumps(current, indent=2) + "\n")
        print("baseline written (" + ", ".join(f"{n}: {sum(c.values())}" for n, c in current.items()) + ")")
        return
    baseline = json.loads(BASELINE.read_text()) if BASELINE.exists() else {}
    failed, notes = [], []
    for name in ALL_CLASSES:
        old, now = baseline.get(name, {}), current[name]
        for crate, count in now.items():
            if count > old.get(crate, 0):
                failed.append(name)
                print(f"[{name}] {crate}: {old.get(crate, 0)} -> {count}", file=sys.stderr)
                for site in where[name][crate]:
                    print(f"  {site}", file=sys.stderr)
        fewer = sum(max(0, n - now.get(c, 0)) for c, n in old.items())
        text = f"{name}: {sum(now.values())}"
        if layer[name]:
            text += f" (+{layer[name]} in the platform layer)"
        if fewer:
            text += f" ({fewer} fewer, lower the baseline with --update)"
        notes.append(text)
    if failed:
        raise SystemExit("; ".join(f"[{n}] {ADVICE[n]}" for n in sorted(set(failed))))
    print("platform welds, none added -- " + "; ".join(notes))


if __name__ == "__main__":
    main()
