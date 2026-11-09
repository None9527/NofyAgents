#!/usr/bin/env python3
"""Build/run a public-API consumer physically outside the Nofy workspace."""
import argparse
import json
import os
from pathlib import Path, PurePath
import re
import shutil
import subprocess
import tempfile


def relocate_dependency_paths(text: str, root: PurePath) -> str:
    """Relocate the fixture's crate dependencies without changing path contents."""
    def replace_path(match: re.Match) -> str:
        path = str(root / "crates" / match[2])
        # JSON escapes are valid in TOML basic strings. Keep Unicode scalar
        # values intact (ASCII encoding would produce invalid surrogate pairs),
        # and escape DEL, which JSON allows literally but TOML forbids.
        encoded = json.dumps(path, ensure_ascii=False).replace("\x7f", "\\u007f")
        return match[1] + encoded

    return re.sub(r'(\bpath\s*=\s*)"\.\./\.\./crates/([^"\\\r\n]+)"',
                  replace_path, text)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    args.output.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="nofy-independent-consumer-") as directory:
        consumer = Path(directory) / "consumer"
        shutil.copytree(root / "fixtures/agent-runtime-consumer", consumer,
                        ignore=shutil.ignore_patterns("target", "Cargo.lock"))
        shutil.copy2(root / "rust-toolchain.toml", consumer / "rust-toolchain.toml")
        manifest = consumer / "Cargo.toml"
        text = manifest.read_text(encoding="utf-8")
        manifest.write_text(relocate_dependency_paths(text, root), encoding="utf-8")
        env = os.environ.copy()
        env["CARGO_TARGET_DIR"] = str(root / "target")
        command = ["cargo", "run", "--offline", "--manifest-path", str(manifest)]
        result = subprocess.run(command, cwd=consumer, env=env, text=True,
                                encoding="utf-8", capture_output=True)
        (args.output / "stdout.log").write_text(result.stdout, encoding="utf-8")
        (args.output / "stderr.log").write_text(result.stderr, encoding="utf-8")
        if result.returncode:
            raise SystemExit(f"consumer failed; inspect {args.output / 'stderr.log'}")
        report = json.loads(result.stdout.strip().splitlines()[-1])
        assert report["status"] == "passed", report
        assert report["configuration"] is True, report
        assert report["recipe"] is True, report
        assert report["workflow"] is True, report
        assert report["workflow_module"] is True, report
        assert report["workflow_hook"] is True, report
        assert report["program"] is True, report
        assert report["event_program"] is True, report
        assert report["declarative_system"] is True, report
        assert report["file_catalog"] is True, report
        tree = subprocess.run(["cargo", "tree", "--offline", "--manifest-path", str(manifest),
                               "--edges", "normal", "--prefix", "none"],
                              cwd=consumer, env=env, check=True, text=True,
                              encoding="utf-8", capture_output=True)
        (args.output / "dependencies.txt").write_text(tree.stdout, encoding="utf-8")
        names = {line.split()[0] for line in tree.stdout.splitlines() if line.strip()}
        forbidden = {"nofy-shell", "nofy-tools", "nofy-agent", "nofy-daemon", "nofy-pager",
                     "nofy-workspace", "nofy-acp", "nofy-sandbox", "nofy-workflow", "nofy-orchestra"}
        assert not names & forbidden, names & forbidden
        report.update({"outside_workspace": True, "dependency_boundary": "passed"})
        (args.output / "result.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
        print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
