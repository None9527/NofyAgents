#!/usr/bin/env python3
"""Verify target dependency cuts against Cargo's actual normal-edge closure."""
import pathlib
import subprocess
import sys


ROOT = pathlib.Path(__file__).resolve().parents[1]
FORBIDDEN_MEMORY = {
    "nofy-agent", "nofy-auth", "nofy-config", "nofy-config-types", "nofy-env",
    "nofy-http", "nofy-mcp", "nofy-pager", "nofy-shell", "nofy-telemetry",
    "nofy-tools", "nofy-version", "nofy-workspace",
    "nofy-tools-api", "nofy-proto-build", "nofy-acp-lib", "nofy-sandbox",
    "nofy-workflow", "nofy-orchestra",
}
MODULE_INTERNALS = {
    "nofy-agent-modules", "nofy-agent-runtime", "nofy-interjection-core",
    "nofy-tool-protocol", "nofy-tool-runtime", "nofy-tool-types",
    # A leaf the runtime itself needs to make a commit durable (tempfile, and the
    # Windows API on Windows). It knows nothing of products, hosts or modules.
    "nofy-durable-fs",
}


def memory_closure(features):
    command = ["cargo", "tree", "--locked", "--offline", "--no-default-features",
               "-p", "nofy-memory", "-e", "normal", "--prefix", "none", "--format", "{p}"]
    if features:
        command += ["--features", features]
    result = subprocess.run(command, cwd=ROOT, text=True, capture_output=True)
    if result.returncode:
        sys.stderr.write(result.stderr)
        raise SystemExit(result.returncode)
    names = {line.split()[0] for line in result.stdout.splitlines() if line.strip()}
    internal = sorted(name for name in names if name.startswith("nofy-"))
    unexpected = sorted(names & FORBIDDEN_MEMORY)
    label = features or "default"
    print(f"memory/{label}: {', '.join(internal)}")
    if unexpected:
        raise SystemExit("old product dependency entered memory: " + ", ".join(unexpected))


def main():
    retired_scope = ROOT / "crates/common/nofy-agent-modules/src/permission"
    if retired_scope.exists() and any(retired_scope.rglob("*.rs")):
        raise SystemExit("static product permission source re-entered target modules")
    # Dependency cuts are developer checks, independent of source packaging.
    for features in ["", "agent-runtime"]:
        memory_closure(features)
    for package, forbidden in [
        ("nofy-test-support", FORBIDDEN_MEMORY),
        ("nofy-tool-protocol", FORBIDDEN_MEMORY),
        ("nofy-tool-runtime", FORBIDDEN_MEMORY),
        ("nofy-agent-executors", FORBIDDEN_MEMORY),
        ("nofy-agent-modules", FORBIDDEN_MEMORY),
        ("nofy-agent-models", FORBIDDEN_MEMORY | {"nofy-sampler", "nofy-sampling-types"}),
        ("nofy-agent-host", FORBIDDEN_MEMORY | {"nofy-sampler", "nofy-sampling-types", "nofy-circuitbreaker", "nofy-compaction"}),
    ]:
        result = subprocess.run(
            ["cargo", "tree", "--locked", "--offline", "-p", package,
             "-e", "normal", "--prefix", "none", "--format", "{p}"],
            cwd=ROOT, text=True, capture_output=True, check=True,
        )
        names = {line.split()[0] for line in result.stdout.splitlines() if line.strip()}
        unexpected = sorted(names & forbidden)
        if package == "nofy-agent-modules":
            unexpected += sorted(names & {"tree-sitter-bash"})
        if package in {"nofy-test-support", "nofy-tool-protocol", "nofy-tool-runtime"}:
            # nofy-isolation is a platform-neutral leaf (serde and thiserror only): the
            # vocabulary a test uses to skip itself, out loud, when the machine's
            # probe says it cannot provide a capability.
            allowed = ({package, "nofy-isolation"} if package == "nofy-test-support"
                       else {package} if package == "nofy-tool-protocol"
                       else {"nofy-tool-runtime", "nofy-tool-protocol", "nofy-tool-types"})
            unexpected += sorted(name for name in names
                                 if name.startswith("nofy-") and name not in allowed)
        if package in {"nofy-agent-modules", "nofy-agent-models"}:
            allowed = (MODULE_INTERNALS if package == "nofy-agent-modules"
                       else (MODULE_INTERNALS - {"nofy-agent-modules"}) | {"nofy-agent-models"})
            unexpected += sorted(name for name in names
                                 if name.startswith("nofy-") and name not in allowed)
        if unexpected:
            raise SystemExit(f"{package} forbidden dependency: {', '.join(unexpected)}")
        # Build scripts must not reintroduce the retired workspace wire API.
        built = subprocess.run(
            ["cargo", "tree", "--locked", "--offline", "-p", package,
             "-e", "normal,build", "--prefix", "none", "--format", "{p}"],
            cwd=ROOT, text=True, capture_output=True, check=True,
        )
        built_names = {line.split()[0] for line in built.stdout.splitlines() if line.strip()}
        if package in {"nofy-test-support", "nofy-tool-protocol", "nofy-tool-runtime"}:
            unexpected_build = sorted(name for name in built_names
                                      if name.startswith("nofy-") and name not in allowed)
            if unexpected_build:
                raise SystemExit(f"{package} unexpected build dependency: {', '.join(unexpected_build)}")
        retired_wire = sorted(built_names & {"nofy-tools-api", "nofy-proto-build"})
        if retired_wire:
            raise SystemExit(f"{package} retired workspace wire dependency: {', '.join(retired_wire)}")
        print(f"{package}: {len([name for name in names if name.startswith('nofy-')])} internal crates; declared boundary passed")
    tested = subprocess.run(
        ["cargo", "tree", "--locked", "--offline", "-p", "nofy-agent-host",
         "-e", "normal,build,dev", "--prefix", "none", "--format", "{p}"],
        cwd=ROOT, text=True, capture_output=True, check=True,
    )
    tested_names = {line.split()[0] for line in tested.stdout.splitlines() if line.strip()}
    old_test_hosts = tested_names & (FORBIDDEN_MEMORY | {"agent-client-protocol", "portable-pty"})
    if old_test_hosts:
        raise SystemExit("retired product test host entered target: " + ", ".join(sorted(old_test_hosts)))
    print(f"Host including build/dev: {len([name for name in tested_names if name.startswith('nofy-')])} internal crates; no retired ACP/PTY harness")
    # Optional SDK features must not hide a second product host/configuration.
    optional = subprocess.run(
        ["cargo", "tree", "--locked", "--offline", "-p", "nofy-agent-executors",
         "--all-features", "-e", "normal,build,dev", "--prefix", "none", "--format", "{p}"],
        cwd=ROOT, text=True, capture_output=True, check=True,
    )
    optional_names = {line.split()[0] for line in optional.stdout.splitlines() if line.strip()}
    old_optional_hosts = optional_names & (FORBIDDEN_MEMORY | {"agent-client-protocol", "portable-pty"})
    if old_optional_hosts:
        raise SystemExit("retired product entered optional executors: " + ", ".join(sorted(old_optional_hosts)))
    print(f"Executors including every feature/build/dev: {len([name for name in optional_names if name.startswith('nofy-')])} internal crates; no retired host/guard")
    # Include every member and optional SDK dependency, not only Host defaults.
    workspace = subprocess.run(
        ["cargo", "tree", "--locked", "--offline", "--workspace", "--all-features",
         "-e", "normal,build,dev", "--prefix", "none", "--format", "{p}"],
        cwd=ROOT, text=True, capture_output=True, check=True,
    )
    workspace_names = {line.split()[0] for line in workspace.stdout.splitlines() if line.strip()}
    old_workspace = workspace_names & (FORBIDDEN_MEMORY | {"agent-client-protocol", "portable-pty"})
    if old_workspace:
        raise SystemExit("retired product entered workspace: " + ", ".join(sorted(old_workspace)))
    if (ROOT / "crates/codegen").exists():
        raise SystemExit("retired codegen source tree re-entered framework")
    print(f"Workspace including every feature/build/dev: {len([name for name in workspace_names if name.startswith('nofy-')])} internal crates; no retired workflow/orchestra/host")
    print("Declared dependency boundaries passed; resident updates and preset behavior require separate acceptance")


if __name__ == "__main__":
    main()
