#!/usr/bin/env python3
"""Assemble an offline, allowlisted main-agent distribution; never builds binaries."""
import argparse
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import stat
import sys

BLOCKED = {".git", "node_modules", "target", "build", "dist", "ref", "__pycache__",
           "credentials.json", "state", "runs", ".env"}
MANIFEST = "SHA256SUMS.json"
PRESET = "presets/omni"
OMNI = {"id": "omni", "version": "0.1.0"}


def safe_path(value):
    if not isinstance(value, str) or not value or "\\" in value or ":" in value:
        raise ValueError(f"unsafe relative path: {value!r}")
    parts = PurePosixPath(value).parts
    if value.startswith("/") or any(p in {".", ".."} for p in value.split("/")):
        raise ValueError(f"unsafe relative path: {value!r}")
    if ".nofy-module-packages" in parts:
        index = parts.index(".nofy-module-packages")
        if index != len(parts) - 2 or not re.fullmatch(r"[0-9a-f]{64}[.]json", parts[-1]):
            raise ValueError("invalid frozen module package path")
    if any(p.lower() in BLOCKED or (p.startswith(".") and p != ".nofy-module-packages") for p in parts):
        raise ValueError(f"excluded path: {value!r}")
    if PurePosixPath(value).as_posix() != value:
        raise ValueError(f"noncanonical path: {value!r}")
    return value


def no_links(path):
    path = Path(os.path.abspath(path))
    for item in (path, *path.parents):
        if item.is_symlink() or (hasattr(item, "is_junction") and item.is_junction()):
            raise ValueError(f"symlink/junction forbidden: {item}")
    return path


def regular(path):
    path = no_links(path)
    if not stat.S_ISREG(path.stat().st_mode):
        raise ValueError(f"regular file required: {path}")
    return path


def read_json(path):
    return json.loads(regular(path).read_text(encoding="utf-8"))


def digest(path):
    h = hashlib.sha256()
    with regular(path).open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("x", encoding="utf-8", newline="\n") as stream:
        json.dump(value, stream, indent=2, ensure_ascii=False)
        stream.write("\n")


def collect_sources(root, preset=PRESET):
    selected = {"modules/module-repository.json", "LICENSE", "THIRD-PARTY-NOTICES"}
    repository = read_json(root / "modules/module-repository.json")
    if repository.get("format") != "nofy.module-repository/v1":
        raise ValueError("unsupported module repository format")
    packages = repository.get("packages")
    if not isinstance(packages, list) or not packages or len(packages) != len(set(packages)):
        raise ValueError("repository requires unique package paths")
    inventory = []
    for relative in packages:
        base = "modules/" + safe_path(relative)
        declaration = read_json(root / base / "module.json")
        if declaration.get("format") != "nofy.module-package/v1":
            raise ValueError(f"unsupported module package: {base}")
        inventory.append({"name": declaration["name"], "version": declaration["version"], "path": base})
    for base in ["modules/" + p for p in packages] + [preset]:
        files = read_json(root / base / "source-files.json")
        if not isinstance(files, list) or not files or len(files) != len(set(files)):
            raise ValueError(f"unique source file list required: {base}")
        required = {"source-files.json", "module.json"} if base.startswith("modules/") else {
            "source-files.json", "project.json", "preset.json", "settings.json", "settings.schema.json"}
        if not required.issubset(files):
            raise ValueError(f"missing required declarations in source file list: {base}")
        for relative in files:
            selected.add(base + "/" + safe_path(relative))
    if len({p.casefold() for p in selected}) != len(selected):
        raise ValueError("case-colliding source paths are not portable")
    for relative in selected:
        regular(root / relative)
    return selected, inventory


def verify(output):
    output = no_links(output)
    manifest = read_json(output / MANIFEST)
    if manifest.get("format") != "nofy.sha256-manifest/v1":
        raise ValueError("invalid checksum manifest format")
    records = manifest.get("files")
    if not isinstance(records, dict) or "inventory.json" not in records:
        raise ValueError("missing inventory checksum")
    actual = set()
    for directory, dirs, files in os.walk(output, followlinks=False):
        for name in dirs + files:
            no_links(Path(directory) / name)
        for name in files:
            relative = (Path(directory) / name).relative_to(output).as_posix()
            safe_path(relative)
            regular(output / relative)
            actual.add(relative)
    if actual != set(records) | {MANIFEST}:
        raise ValueError("missing or unexpected bundle files")
    for relative, record in records.items():
        safe_path(relative)
        if not isinstance(record, dict) or digest(output / relative) != record.get("sha256"):
            raise ValueError(f"checksum mismatch: {relative}")
        if (output / relative).stat().st_size != record.get("size"):
            raise ValueError(f"size mismatch: {relative}")
        if os.name != "nt" and bool((output / relative).stat().st_mode & 0o111) != record.get("executable"):
            raise ValueError(f"executable mode mismatch: {relative}")
    inventory = read_json(output / "inventory.json")
    if inventory.get("format") != "nofy.main-agent-distribution/v1":
        raise ValueError("invalid inventory format")
    suffix = ".exe" if inventory.get("platform", "").startswith("windows-") else ""
    mandatory = {"bin/nofy" + suffix, "bin/nofy-agent-host" + suffix,
                 "modules/module-repository.json", "presets/index.json"}
    if not mandatory.issubset(records):
        raise ValueError("missing required binaries or registries")
    registry = read_json(output / "presets/index.json")
    if registry == {"format": "nofy.preset-registry/v1", "presets": [{
            "id": "main-agent", "version": "0.2.0", "path": "main-agent-composable",
            "status": "source-template"}]}:
        selected, packages = collect_sources(output, "presets/main-agent-composable")
    elif registry == {"format": "nofy.preset-registry/v1", "default": OMNI,
                      "presets": [{**OMNI, "path": "omni", "status": "source-template"}]}:
        selected, packages = collect_sources(output)
    else:
        raise ValueError("invalid preset registry")
    if not selected.issubset(records) or packages != inventory.get("packages"):
        raise ValueError("source package inventory mismatch")
    if sorted(records.keys() - {"inventory.json"}) != inventory.get("files"):
        raise ValueError("file inventory mismatch")
    return inventory


def assemble(root, output, cli, host, kernel_version, platform):
    root, output = no_links(root), no_links(output)
    if output.exists():
        raise ValueError("output already exists; refusing overwrite")
    if not output.parent.is_dir():
        raise ValueError("output parent must already exist")
    for label, value in (("kernel version", kernel_version), ("platform", platform)):
        if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._+-]*", value):
            raise ValueError(f"invalid {label}")
    if not platform.startswith(("linux-", "windows-", "macos-")):
        raise ValueError("platform must begin linux-, windows-, or macos-")
    files, packages = collect_sources(root)
    inputs = {relative: regular(root / relative) for relative in files}
    suffix = ".exe" if platform.startswith("windows-") else ""
    inputs.update({"bin/nofy" + suffix: regular(cli), "bin/nofy-agent-host" + suffix: regular(host)})
    if any(p.stat().st_size == 0 for p in inputs.values()):
        raise ValueError("empty package input")
    if any(output == p or output in p.parents for p in inputs.values()):
        raise ValueError("output contains an input")
    # Exclusive creation reserves the destination; failed bundles are deliberately
    # retained for inspection, never recursively deleted by this tool.
    output.mkdir()
    for relative, source in sorted(inputs.items()):
        destination = output / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        with source.open("rb") as src, destination.open("xb") as dst:
            shutil.copyfileobj(src, dst)
        destination.chmod(0o755 if relative.startswith("bin/") and not suffix else 0o644)
    write_json(output / "presets/index.json", {
        "format": "nofy.preset-registry/v1", "default": OMNI,
        "presets": [{**OMNI, "path": "omni", "status": "source-template"}]})
    inventory = {"format": "nofy.main-agent-distribution/v1", "version": "0.2.0",
                 "kernel_version": kernel_version, "platform": platform,
                 "binary_metadata": "operator-supplied; compatibility not automatically proven",
                 "packages": packages, "files": sorted([*inputs, "presets/index.json"])}
    write_json(output / "inventory.json", inventory)
    write_json(output / MANIFEST, {"format": "nofy.sha256-manifest/v1", "files": {
        relative: {"sha256": digest(output / relative), "size": (output / relative).stat().st_size,
                   "executable": bool((output / relative).stat().st_mode & 0o111)}
        for relative in sorted([*inputs, "presets/index.json", "inventory.json"])}})
    return verify(output)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", type=Path, help="verify an existing bundle, without executing binaries")
    parser.add_argument("--repo", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--output", type=Path)
    parser.add_argument("--cli", type=Path)
    parser.add_argument("--host", type=Path)
    parser.add_argument("--kernel-version")
    parser.add_argument("--platform", help="explicit target, e.g. linux-x86_64-gnu")
    args = parser.parse_args(argv)
    try:
        if args.check:
            result = verify(args.check)
        else:
            for name in ("output", "cli", "host", "kernel_version", "platform"):
                if getattr(args, name) is None:
                    parser.error("--" + name.replace("_", "-") + " is required")
            result = assemble(args.repo, args.output, args.cli, args.host, args.kernel_version, args.platform)
        print(json.dumps({"verified": True, "version": result["version"], "platform": result["platform"]}))
        return 0
    except (OSError, ValueError, KeyError, TypeError) as error:
        print(f"package-main-agent: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
