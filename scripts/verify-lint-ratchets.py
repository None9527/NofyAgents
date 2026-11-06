#!/usr/bin/env python3
"""Per-crate ratchets on lints that mark a proof obligation in production code.

Only library and binary targets are linted, so `#[cfg(test)]` code is excluded by
construction. For each class the baseline records today's count per crate: a
crate may not gain a site, and fixing one lets you lower the baseline. When a
site really must be added, rerun with `--update` in the same change so the
increase is visible in review.

  panic   `unwrap`, `expect`, `unreachable!`, `panic!`, `todo!`, `unimplemented!`.
          The release profile is `panic = "abort"`, so a panic reachable from
          external input restarts the whole kernel. Return an error, or make the
          `expect` message state the check that makes it unreachable.
  unsafe  an `unsafe` block without a `// SAFETY:` comment. The comment is the
          audit trail for why the block is sound; write it from the code, never
          to satisfy the lint.

Slice/array indexing is deliberately not counted: it is far noisier, and the
parsers that read untrusted bytes use checked arithmetic.

Usage: verify-lint-ratchets.py [--update]
"""
import collections
import json
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
BASELINE = ROOT / "scripts" / "lint-ratchets.baseline.json"
CLASSES = {
    "panic": {
        "lints": [
            "clippy::unwrap_used", "clippy::expect_used", "clippy::unreachable",
            "clippy::panic", "clippy::todo", "clippy::unimplemented",
        ],
        "advice": (
            "with panic=abort a panic restarts the kernel. Return an error, or state "
            "the invariant in the expect message, then rerun with --update."
        ),
    },
    "unsafe": {
        "lints": ["clippy::undocumented_unsafe_blocks"],
        "advice": (
            "add a `// SAFETY:` comment directly above the block saying which "
            "condition makes it sound, then rerun with --update only if it cannot be added."
        ),
    },
}
LINT_TO_CLASS = {lint: name for name, c in CLASSES.items() for lint in c["lints"]}


def scan():
    command = [
        "cargo", "clippy", "--locked", "--offline", "--keep-going",
        "--workspace", "--lib", "--bins", "--message-format=json", "--",
        "-A", "clippy::all",
    ]
    for lint in LINT_TO_CLASS:
        command += ["-W", lint]
    result = subprocess.run(command, cwd=ROOT, text=True, capture_output=True)
    if result.returncode:
        sys.stderr.write(result.stderr)
        raise SystemExit(result.returncode)
    sites = set()
    for line in result.stdout.splitlines():
        try:
            message = json.loads(line)
        except ValueError:
            continue
        if message.get("reason") != "compiler-message":
            continue
        body = message["message"]
        code = (body.get("code") or {}).get("code")
        spans = [s for s in body.get("spans", []) if s.get("is_primary")]
        if code in LINT_TO_CLASS and spans:
            sites.add((spans[0]["file_name"], spans[0]["line_start"], code))
    counts = {name: collections.Counter() for name in CLASSES}
    where = {name: collections.defaultdict(list) for name in CLASSES}
    for file_name, line, code in sorted(sites):
        parts = pathlib.PurePosixPath(file_name).parts
        crate = parts[2] if len(parts) > 2 and parts[0] == "crates" else parts[0]
        name = LINT_TO_CLASS[code]
        counts[name][crate] += 1
        where[name][crate].append(f"{file_name}:{line} {code.split('::')[1]}")
    return {name: dict(sorted(c.items())) for name, c in counts.items()}, where


def main():
    current, where = scan()
    if "--update" in sys.argv[1:]:
        BASELINE.write_text(json.dumps(current, indent=2) + "\n")
        summary = ", ".join(f"{n}: {sum(c.values())}" for n, c in current.items())
        print(f"baseline written ({summary})")
        return
    baseline = json.loads(BASELINE.read_text()) if BASELINE.exists() else {}
    failed = []
    notes = []
    for name in CLASSES:
        old = baseline.get(name, {})
        now = current[name]
        for crate, count in now.items():
            if count > old.get(crate, 0):
                failed.append(name)
                print(f"[{name}] {crate}: {old.get(crate, 0)} -> {count}", file=sys.stderr)
                for site in where[name][crate]:
                    print(f"  {site}", file=sys.stderr)
        fewer = sum(max(0, n - now.get(c, 0)) for c, n in old.items())
        total = f"{name}: {sum(now.values())} in {len(now)} crates"
        notes.append(total + (f" ({fewer} fewer, lower the baseline with --update)" if fewer else ""))
    if failed:
        raise SystemExit("; ".join(f"[{n}] {CLASSES[n]['advice']}" for n in sorted(set(failed))))
    print("lint ratchets, none added -- " + "; ".join(notes))


if __name__ == "__main__":
    main()
