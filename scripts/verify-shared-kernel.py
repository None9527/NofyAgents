#!/usr/bin/env python3
"""Collect and compare fail-closed evidence for the five portable runtime targets."""

import argparse
import json
import os
from pathlib import Path
import platform
import re
import subprocess
import sys

TARGETS = ("program", "governance_runtime", "policy_floor", "nested_control", "pack")
HELPERS = {
    "graphs::program_process_worker",
    "queue::process::program_job_process_worker",
}
SYSTEMS = {"Linux", "Darwin", "Windows"}
RUNNERS = {
    "ubuntu-24.04": ("Linux", "linux"),
    "macos-latest": ("Darwin", "darwin"),
    "windows-latest": ("Windows", "win32"),
}
COMMAND = [
    "cargo", "test", "--locked", "-p", "nofy-agent-runtime", "--all-features",
    *[part for target in TARGETS for part in ("--test", target)],
]
RUNNING = re.compile(r"Running tests[/\\]([a-z_]+)\.rs \(.+\)")
TEST_NAME = r"[A-Za-z_][A-Za-z_0-9:]*(?<!:)"
LIST_ITEM = re.compile(rf"({TEST_NAME}): test")
LIST_SUMMARY = re.compile(r"(\d+) tests?, (\d+) benchmarks?")
RUN_COUNT = re.compile(r"running (\d+) tests?")
RUN_ITEM = re.compile(rf"test ({TEST_NAME}) \.\.\. (ok|FAILED|ignored(?:, .*)?)")
RUN_SUMMARY = re.compile(
    r"test result: (ok|FAILED)\. (\d+) passed; (\d+) failed; (\d+) ignored; "
    r"(\d+) measured; (\d+) filtered out; finished in [0-9.]+s"
)
ANSI = re.compile(r"\x1b\[[0-9;]*m")


def evidence_lines(text):
    """Build diagnostics are not test evidence; unknown harness output is fatal."""
    for raw in text.splitlines():
        line = ANSI.sub("", raw).strip()
        if re.search(r"(?i)\bSKIPPED\b|^SKIP(?:\s|:)|^::warning.*\bskip", line):
            raise ValueError(f"reported skip: {line}")
        if line:
            yield line


def parse_inventory(text):
    groups, names, target, started = [], [], None, False
    for line in evidence_lines(text):
        header = RUNNING.fullmatch(line)
        item = LIST_ITEM.fullmatch(line)
        summary = LIST_SUMMARY.fullmatch(line)
        if header:
            if names or target is not None:
                raise ValueError("unfinished inventory target")
            target = header[1]
            if target not in TARGETS:
                raise ValueError(f"unknown inventory target: {target}")
            started = True
        elif item:
            started = True
            if item[1] in names:
                raise ValueError(f"duplicate inventory entry: {item[1]}")
            names.append(item[1])
        elif summary:
            if not names or int(summary[1]) != len(names) or int(summary[2]) != 0:
                raise ValueError("empty or inconsistent inventory summary")
            groups.append((target, frozenset(names)))
            names, target = [], None
        elif started or not line.startswith(
            ("Compiling ", "Finished ", "Blocking ", "Updating ", "Downloading ", "Downloaded ")
        ):
            raise ValueError(f"unknown inventory output: {line}")
    if names or target is not None or len(groups) != len(TARGETS):
        raise ValueError("missing or incomplete inventory targets")
    return groups


def parse_execution(text):
    targets, current, names, count, complete = {}, None, {}, None, False
    for line in evidence_lines(text):
        header = RUNNING.fullmatch(line)
        running = RUN_COUNT.fullmatch(line)
        item = RUN_ITEM.fullmatch(line)
        summary = RUN_SUMMARY.fullmatch(line)
        if header:
            if current is not None and not complete:
                raise ValueError(f"incomplete execution: {current}")
            current = header[1]
            if current not in TARGETS or current in targets:
                raise ValueError(f"unknown or duplicate execution target: {current}")
            targets[current] = None
            names, count, complete = {}, None, False
        elif current is None:
            if not line.startswith(
                ("Compiling ", "Finished ", "Blocking ", "Updating ", "Downloading ", "Downloaded ")
            ):
                raise ValueError(f"unknown execution preamble: {line}")
        elif complete:
            raise ValueError(f"unexpected output after summary: {line}")
        elif running:
            if count is not None or int(running[1]) == 0:
                raise ValueError(f"empty or repeated run: {current}")
            count = int(running[1])
        elif item:
            if count is None or item[1] in names:
                raise ValueError(f"unexpected or duplicate execution entry: {item[1]}")
            names[item[1]] = item[2]
        elif summary:
            passed, failed, ignored, measured, filtered = map(int, summary.groups()[1:])
            if (summary[1] != "ok" or failed or ignored or measured or filtered
                    or count != len(names) or passed != count
                    or any(status != "ok" for status in names.values())):
                raise ValueError(f"failed, ignored, filtered, or incomplete execution: {current}")
            targets[current] = {
                "tests": sorted(names), "executed": count, "passed": passed,
                "failed": failed, "ignored": ignored, "measured": measured,
                "filtered": filtered,
            }
            complete = True
        else:
            raise ValueError(f"unknown execution output: {line}")
    if set(targets) != set(TARGETS) or not complete:
        raise ValueError("missing or incomplete execution targets")
    return targets


def parse_shared_kernel_evidence(inventory, execution, skip_report, list_status=0, run_status=0):
    if list_status != 0 or run_status != 0:
        raise ValueError(f"Cargo failed: list={list_status}, run={run_status}")
    if skip_report.strip():
        raise ValueError("nonempty capability skip report")
    groups = parse_inventory(inventory)
    targets = parse_execution(execution)
    matched = set()
    for declared, names in groups:
        candidates = [target for target, result in targets.items()
                      if names == frozenset(result["tests"])]
        if len(candidates) != 1 or candidates[0] in matched:
            raise ValueError("inventory and executed test sets differ or are ambiguous")
        target = candidates[0]
        if declared is not None and declared != target:
            raise ValueError("inventory target label disagrees with execution")
        matched.add(target)
    if matched != set(TARGETS) or not HELPERS <= set(targets["program"]["tests"]):
        raise ValueError("missing target or known process helper")
    for target, result in targets.items():
        helpers = sorted(HELPERS & set(result["tests"])) if target == "program" else []
        result.update(helpers=helpers, acceptance_checks=result["executed"] - len(helpers))
    return {
        "targets": targets,
        "totals": {
            key: sum(result[key] for result in targets.values())
            for key in ("executed", "passed", "failed", "ignored", "measured", "filtered",
                        "acceptance_checks")
        } | {"helpers": len(HELPERS), "reported_skips": 0},
    }


def load_evidence(directory):
    status = json.loads((directory / "exit-codes.json").read_text(encoding="utf-8"))
    if set(status) != {"runner", "system", "sys_platform", "list", "run", "command"}:
        raise ValueError(f"unknown evidence metadata: {directory}")
    if (status["runner"] not in RUNNERS
            or (status["system"], status["sys_platform"]) != RUNNERS[status["runner"]]):
        raise ValueError(f"runner label does not match the native platform: {directory}")
    if status["command"] != COMMAND or any(type(status[k]) is not int for k in ("list", "run")):
        raise ValueError(f"wrong command or invalid exit status: {directory}")
    result = parse_shared_kernel_evidence(
        (directory / "test-list.txt").read_text(encoding="utf-8"),
        (directory / "test-run.log").read_text(encoding="utf-8"),
        (directory / "skips.log").read_text(encoding="utf-8"),
        status["list"], status["run"],
    )
    return status["system"], result


def compare_evidence(root):
    reports = {}
    for metadata in sorted(root.glob("*/exit-codes.json")):
        system, result = load_evidence(metadata.parent)
        if system in reports:
            raise ValueError(f"duplicate platform evidence: {system}")
        reports[system] = result
    if set(reports) != SYSTEMS:
        raise ValueError(f"need Linux, Darwin, and Windows evidence; found {sorted(reports)}")
    baseline = reports["Linux"]
    for system, result in reports.items():
        if result != baseline:
            raise ValueError(f"actual inventory or execution totals differ on {system}")
    print("PASS: identical executed inventories on Linux, Darwin, and Windows")
    print(json.dumps(baseline["totals"], sort_keys=True))


def collect_evidence(directory, runner):
    if runner not in RUNNERS or (platform.system(), sys.platform) != RUNNERS[runner]:
        raise ValueError("runner label does not match the native platform")
    directory.mkdir(parents=True, exist_ok=False)
    skips = directory / "skips.log"
    skips.write_text("", encoding="utf-8")
    env = os.environ | {"CARGO_TERM_COLOR": "never", "NOFY_SKIP_REPORT": str(skips.resolve())}
    statuses = {"runner": runner, "system": platform.system(),
                "sys_platform": sys.platform, "command": COMMAND}
    for kind, filename, args in (
        ("list", "test-list.txt", ["--list", "--color", "never"]),
        ("run", "test-run.log", ["--color", "never", "--test-threads=2"]),
    ):
        with (directory / filename).open("w", encoding="utf-8") as log:
            process = subprocess.run(COMMAND + ["--", *args], env=env, stdout=log,
                                     stderr=subprocess.STDOUT, check=False)
        statuses[kind] = process.returncode
        print(f"{kind}: exit {process.returncode}; evidence: {directory / filename}", flush=True)
    (directory / "exit-codes.json").write_text(json.dumps(statuses, indent=2) + "\n",
                                              encoding="utf-8")
    _, result = load_evidence(directory)
    (directory / "evidence.json").write_text(json.dumps(result, indent=2) + "\n",
                                           encoding="utf-8")
    print(json.dumps(result["totals"], sort_keys=True))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=("collect", "compare"))
    parser.add_argument("directory", type=Path)
    parser.add_argument("--runner", choices=RUNNERS)
    args = parser.parse_args()
    try:
        if args.action == "collect":
            collect_evidence(args.directory, args.runner)
        else:
            compare_evidence(args.directory)
    except (ValueError, OSError, KeyError, TypeError) as error:
        print(f"FAIL: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
