#!/usr/bin/env python3
"""Uniform behavior analysis for both A/B arms.

Reads each run's chat_history.jsonl transcript (same format in both
arms) and computes:
  - tool sequence
  - mutations: edit/write tool calls
  - verified_after_last_mutation: was an Execute-kind tool called after
    the LAST mutation (the agent checked its own work) — the key
    behavioral metric the verification gate is meant to move
  - distractor_modified: for tasks shipping a pristine/ reference dir,
    whether any pristine-tracked file changed in the run's repo
"""
import json
import os
import sys
from pathlib import Path

MUTATION_TOOLS = {"search_replace", "write", "edit", "hashline_edit"}
EXECUTE_TOOLS = {"run_terminal_command", "run_terminal_cmd", "bash"}


def transcript_tools(chat_history: Path):
    seq = []
    for line in chat_history.read_text().splitlines():
        try:
            item = json.loads(line)
        except json.JSONDecodeError:
            continue
        if item.get("type") == "assistant":
            for tc in item.get("tool_calls", []) or []:
                name = tc.get("name") or ""
                if name:
                    seq.append(name)
    return seq


def pick_transcript(run_dir: Path):
    """The parent session's transcript; subagent sessions also live under
    the run's HOME, so take the largest transcript (the parent owns the
    full turn)."""
    candidates = list(run_dir.glob("home/**/chat_history.jsonl"))
    if not candidates:
        return None
    return max(candidates, key=lambda p: p.stat().st_size)


def analyze_run(run_dir: Path, task_src: Path):
    chat = pick_transcript(run_dir)
    tools = transcript_tools(chat) if chat else []
    last_mutation = max(
        (i for i, t in enumerate(tools) if t in MUTATION_TOOLS), default=None
    )
    if last_mutation is None:
        verified = "no_mutation"
    else:
        verified = "yes" if any(
            t in EXECUTE_TOOLS for t in tools[last_mutation + 1:]
        ) else "no"
    distractor = "n/a"
    pristine = task_src / "pristine"
    if pristine.is_dir():
        changed = []
        for ref in pristine.iterdir():
            run_copy = run_dir / "repo" / ref.name
            if run_copy.exists() and run_copy.read_bytes() != ref.read_bytes():
                changed.append(ref.name)
            elif not run_copy.exists():
                changed.append(f"{ref.name}(deleted)")
        distractor = "MODIFIED:" + ",".join(changed) if changed else "untouched"
    return {
        "tools": len(tools),
        "mutations": sum(1 for t in tools if t in MUTATION_TOOLS),
        "executions": sum(1 for t in tools if t in EXECUTE_TOOLS),
        "verified_after_last_mutation": verified,
        "distractor": distractor,
    }


def main(results_dir: str, tasks_dir: str):
    results = Path(results_dir)
    tasks = Path(tasks_dir)
    rows = []
    for run in sorted(results.iterdir()):
        if not run.is_dir():
            continue
        name = run.name
        task = name.rsplit("-", 1)[0]
        arm = name.rsplit("-", 1)[1]
        verdict_f = run / "verdict.txt"
        verdict = verdict_f.read_text().strip() if verdict_f.exists() else "?"
        m = analyze_run(run, tasks / task)
        rows.append((name, arm, verdict, m))
    print(f"{'run':34} {'arm':10} {'verdict':8} {'tools':>5} "
          f"{'mut':>4} {'exec':>5} {'verified-after-mutation':24} distractor")
    for name, arm, verdict, m in rows:
        print(f"{name:34} {arm:10} {verdict:8} {m['tools']:>5} "
              f"{m['mutations']:>4} {m['executions']:>5} "
              f"{m['verified_after_last_mutation']:24} {m['distractor']}")
    # Arm-level rollup.
    for arm in ("control", "treatment"):
        arm_rows = [r for r in rows if r[1] == arm]
        if not arm_rows:
            continue
        passed = sum(1 for r in arm_rows if r[2] == "PASS")
        verified = sum(
            1 for r in arm_rows if r[3]["verified_after_last_mutation"] == "yes"
        )
        mutated = sum(1 for r in arm_rows if r[3]["mutations"] > 0)
        print(f"\n[{arm}] pass {passed}/{len(arm_rows)}; "
              f"verified-after-mutation {verified}/{mutated} mutating runs")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
