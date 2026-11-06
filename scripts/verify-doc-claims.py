#!/usr/bin/env python3
"""Bind the numbers that docs state about the contract to the contract itself.

`nofy-agent-client/contracts/operations.json` is the source of truth for the
contract revision and the operation/tool counts. Docs that restate them by hand
go stale silently (one README said 79 operations while the catalog had 97), so
every restatement listed here must be present and equal to the catalog.

A claim that disappears from its file is also an error: either restore it or
remove it from CLAIMS on purpose. Counts that only exist at run time (for
example how many factories a host registers) are not checked here.

The docs also ship byte copies of the contract files; they must equal the
originals, or readers follow a link to a stale contract.
"""
import json
import pathlib
import re
import sys
import tomllib

ROOT = pathlib.Path(__file__).resolve().parents[1]
CATALOG = ROOT / "crates/common/nofy-agent-client/contracts/operations.json"

# docs copy -> original
COPIES = {
    "docs/manual/operations.json": "crates/common/nofy-agent-client/contracts/operations.json",
    "docs/manual/contracts.schema.json": "crates/common/nofy-agent-client/contracts/contracts.schema.json",
}

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
    "docs/manual/README.md": [
        (r"(\d+) 项操作，其中 (\d+) 项开放为 MCP 工具", ["operations", "mcp_tools"]),
        (r"规则/源码策略、(\d+) 项操作", ["session_operations"]),
    ],
    "docs/manual/mcp.md": [
        (r"固定公开 (\d+) 项已实现适配操作", ["mcp_tools"]),
        (r"(\d+) 项操作的完整输入", ["session_operations"]),
    ],
    "docs/manual/protocol.md": [
        (r"声明版本、(\d+) 项操作和输入/输出 Schema", ["session_operations"]),
    ],
    "docs/release-notes.md": [
        (r"干净的 (\d+) 包 Rust 框架工作区", ["workspace_crates"]),
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
        "workspace_crates": str(
            len(tomllib.loads((ROOT / "Cargo.toml").read_text())["workspace"]["members"])),
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
    for copy, original in COPIES.items():
        if (ROOT / copy).read_bytes() != (ROOT / original).read_bytes():
            problems.append(f"{copy} differs from {original}; copy the original over it")
    if problems:
        print("\n".join(problems), file=sys.stderr)
        raise SystemExit("docs disagree with the contract")
    print(f"doc claims: {checked} figures match the catalog, {len(COPIES)} copies identical "
          f"(revision {expected['revision']}, {expected['operations']} operations, "
          f"{expected['mcp_tools']} MCP tools)")


if __name__ == "__main__":
    main()
