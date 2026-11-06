#!/usr/bin/env python3
"""Bind the numbers that docs state about the contract to the contract itself.

`nofy-agent-client/contracts/operations.json` is the source of truth for the
contract revision and the operation/tool counts. Docs that restate them by hand
go stale silently (one README said 79 operations while the catalog had 97), so
every restatement listed here must be present and equal to the catalog.

A claim that disappears from its file is also an error: either restore it or
remove it from CLAIMS on purpose. Counts that only exist at run time (for
example how many factories a host registers) are not checked here.
"""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
CATALOG = ROOT / "crates/common/nofy-agent-client/contracts/operations.json"

# file -> [(regex, [catalog key for each capture group])]
CLAIMS = {
    "README.md": [
        (r"contract revision `(\d+\.\d+)`", ["revision"]),
        (r"There are (\d+) operations, including (\d+) inbound MCP tools",
         ["operations", "mcp_tools"]),
    ],
    "README.zh-CN.md": [
        (r"契约修订 `(\d+\.\d+)`：(\d+) 项操作，其中 (\d+) 项通过 MCP",
         ["revision", "operations", "mcp_tools"]),
        (r"CLI／MCP 的 (\d+) 项操作", ["operations"]),
        (r"`tools/list` 固定公开 (\d+) 项已实现操作", ["mcp_tools"]),
    ],
    "docs/release-notes.md": [
        (r"契约修订 `(\d+\.\d+)`", ["revision"]),
        (r"(\d+) 项操作、(\d+) 个 MCP 工具、(\d+) 项 Session 操作",
         ["operations", "mcp_tools", "session_operations"]),
    ],
}


def truth():
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    operations = catalog["operations"]
    return {
        "revision": str(catalog["contract_revision"]),
        "operations": str(len(operations)),
        "mcp_tools": str(sum(1 for o in operations if o.get("mcp_tool"))),
        "session_operations": str(
            sum(1 for o in operations if o["operation"].startswith("session."))),
    }


def main():
    expected = truth()
    problems = []
    checked = 0
    for name, claims in CLAIMS.items():
        text = (ROOT / name).read_text(encoding="utf-8")
        for pattern, keys in claims:
            matches = list(re.finditer(pattern, text))
            if not matches:
                problems.append(f"{name}: claim not found: /{pattern}/")
            for match in matches:
                for key, value in zip(keys, match.groups()):
                    checked += 1
                    if value != expected[key]:
                        line = text.count("\n", 0, match.start()) + 1
                        problems.append(
                            f"{name}:{line}: {key} is {value}, catalog says {expected[key]}")
    if problems:
        print("\n".join(problems), file=sys.stderr)
        raise SystemExit("docs disagree with operations.json")
    print(f"doc claims: {checked} figures match the catalog "
          f"(revision {expected['revision']}, {expected['operations']} operations, "
          f"{expected['mcp_tools']} MCP tools)")


if __name__ == "__main__":
    main()
