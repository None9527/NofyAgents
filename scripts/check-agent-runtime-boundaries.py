#!/usr/bin/env python3
"""Check the default public runtime's production dependency boundary."""
import subprocess

forbidden = {"nofy-tools", "nofy-shell", "nofy-agent", "nofy-daemon", "nofy-pager",
             "nofy-workspace", "nofy-acp", "nofy-sandbox", "nofy-workflow"}
result = subprocess.run(["cargo", "tree", "--locked", "--offline", "-p", "nofy-agent-runtime",
                         "--edges", "normal", "--prefix", "none", "--no-dedupe"],
                        check=True, text=True, capture_output=True)
names = {line.split()[0] for line in result.stdout.splitlines() if line.strip()}
violations = names & forbidden
if violations:
    raise SystemExit("host dependencies leaked into runtime: " + ", ".join(sorted(violations)))
print(f"PASS: {len(names)} normal dependencies; no product host or concrete tool implementation")
