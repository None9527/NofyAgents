#!/usr/bin/env python3
"""Verify module repository integrity, frozen preset package digests, AI-friendly schemas, and Omni source-files sync."""
import base64
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import stat
import struct
import sys

ROOT = Path(__file__).resolve().parents[1]
JS_MAX_SAFE_INT = 9007199254740991
REQUIRED_TYPED_OBJECTS = (
    "connection",
    "workspace_environment",
    "command_environment",
    "process_tree",
    "process_namespace",
)
OMNI_MANUAL_COPIES = {
    "presets/omni/prompt.md": "docs/manual/omni-agent-prompt.md",
    "presets/omni/README.md": "docs/manual/omni-agent.md",
    "presets/omni/文件说明.md": "docs/manual/omni-agent-files.md",
}


def safe_rel(value: str) -> str:
    if not isinstance(value, str) or not value or "\\" in value or ":" in value:
        raise ValueError(f"unsafe relative path: {value!r}")
    if value.startswith("/") or any(p in {"", ".", ".."} for p in value.split("/")):
        raise ValueError(f"unsafe relative path: {value!r}")
    if PurePosixPath(value).as_posix() != value:
        raise ValueError(f"noncanonical path: {value!r}")
    return value


def ensure_regular_no_symlink(path: Path, boundary: Path) -> Path:
    rel = path.relative_to(boundary)
    cur = boundary
    if cur.is_symlink():
        raise ValueError(f"symlink forbidden: {cur}")
    for part in rel.parts:
        cur = cur / part
        if cur.is_symlink():
            raise ValueError(f"symlink forbidden: {cur}")
    if not cur.exists() or not stat.S_ISREG(cur.lstat().st_mode):
        raise ValueError(f"regular file required: {cur}")
    return cur


def compute_source_digest(
    files: dict[str, tuple[bytes, bool]],
    declaration: str,
    settings_json: str | None = None,
) -> str:
    """Exact mirror of nofy_agent_project::Source::digest()."""
    h = hashlib.sha256()
    for name in sorted(files):
        data, executable = files[name]
        name_bytes = name.encode("utf-8")
        h.update(struct.pack(">Q", len(name_bytes)))
        h.update(name_bytes)
        h.update(struct.pack(">Q", len(data)))
        h.update(data)
        h.update(b"\x01" if executable else b"\x00")
    h.update(declaration.encode("utf-8"))
    h.update(b"\x00")
    if settings_json is not None:
        h.update(settings_json.encode("utf-8"))
    return h.hexdigest()


def decode_frozen_source(record: dict) -> tuple[dict[str, tuple[bytes, bool]], str, str | None]:
    if not isinstance(record, dict) or not isinstance(record.get("files"), dict):
        raise ValueError("frozen package must be an object with files map")
    declaration = record.get("declaration")
    if not isinstance(declaration, str) or not declaration:
        raise ValueError("frozen package missing declaration")
    settings_json = record.get("settings_json")
    if settings_json is not None and not isinstance(settings_json, str):
        raise ValueError("frozen package settings_json must be a string or null")
    files: dict[str, tuple[bytes, bool]] = {}
    for name, entry in record["files"].items():
        safe_rel(name)
        enc = entry.get("encoding")
        content = entry.get("content")
        executable = bool(entry.get("executable", False))
        if enc == "utf8" and isinstance(content, str):
            raw = content.encode("utf-8")
        elif enc == "base64" and isinstance(content, str):
            raw = base64.b64decode(content, validate=True)
        else:
            raise ValueError(f"invalid file encoding in frozen package for {name}")
        files[name] = (raw, executable)
    return files, declaration, settings_json


def module_factories(manifest: dict) -> dict[str, str]:
    factories: dict[str, str] = {}
    modules = manifest.get("modules")
    if not isinstance(modules, list) or not modules:
        raise ValueError("module.json requires non-empty modules array")
    for item in modules:
        body = item["$when"]["value"] if isinstance(item, dict) and "$when" in item else item
        if not isinstance(body, dict):
            raise ValueError("module definition must be an object")
        ref = body.get("reference")
        mod_id = ref.get("$module") if isinstance(ref, dict) else None
        factory = body.get("factory")
        if not isinstance(mod_id, str) or not mod_id:
            raise ValueError("module definition missing reference.$module")
        if not isinstance(factory, str) or not factory:
            raise ValueError(f"module {mod_id} missing static factory")
        if mod_id in factories:
            raise ValueError(f"duplicate module id {mod_id}")
        factories[mod_id] = factory
    return factories


def load_module_repository(root: Path, problems: list[str]) -> tuple[dict[tuple[str, str], dict], dict[str, set[str]]]:
    repo_index_path = root / "modules/module-repository.json"
    try:
        ensure_regular_no_symlink(repo_index_path, root)
        index = json.loads(repo_index_path.read_text(encoding="utf-8"))
    except (OSError, ValueError) as exc:
        problems.append(f"modules/module-repository.json: {exc}")
        return {}, {}

    if index.get("format") != "nofy.module-repository/v1":
        problems.append("modules/module-repository.json: unsupported format")
        return {}, {}
    packages = index.get("packages")
    if not isinstance(packages, list) or not packages or len(packages) != len(set(packages)):
        problems.append("modules/module-repository.json: packages must be a non-empty unique list")
        return {}, {}

    catalog: dict[tuple[str, str], dict] = {}
    by_name: dict[str, set[str]] = {}

    for rel in packages:
        try:
            safe_rel(rel)
        except ValueError as exc:
            problems.append(f"modules/module-repository.json: {exc}")
            continue
        pkg_dir = root / "modules" / rel
        if not pkg_dir.is_dir() or pkg_dir.is_symlink():
            problems.append(f"modules/{rel}: package directory missing or symlink")
            continue

        manifest_list_path = pkg_dir / "source-files.json"
        try:
            ensure_regular_no_symlink(manifest_list_path, root)
            file_list = json.loads(manifest_list_path.read_text(encoding="utf-8"))
        except (OSError, ValueError) as exc:
            problems.append(f"modules/{rel}/source-files.json: {exc}")
            continue

        if not isinstance(file_list, list) or not file_list or len(file_list) != len(set(file_list)):
            problems.append(f"modules/{rel}/source-files.json: must be a unique non-empty list")
            continue
        if not {"module.json", "source-files.json"}.issubset(file_list):
            problems.append(f"modules/{rel}/source-files.json: must list module.json and source-files.json")
            continue

        files: dict[str, tuple[bytes, bool]] = {}
        ok = True
        for name in file_list:
            try:
                safe_rel(name)
                target = ensure_regular_no_symlink(pkg_dir / name, root)
                raw = target.read_bytes()
                if name.endswith(".json"):
                    json.loads(raw.decode("utf-8"))
                files[name] = (raw, False)
            except (OSError, ValueError, UnicodeDecodeError) as exc:
                problems.append(f"modules/{rel}/{name}: {exc}")
                ok = False
        if not ok:
            continue

        # Validate module.json structure.
        try:
            manifest = json.loads(files["module.json"][0].decode("utf-8"))
            if manifest.get("format") != "nofy.module-package/v1":
                raise ValueError("format must be nofy.module-package/v1")
            name = manifest.get("name")
            version = manifest.get("version")
            if not isinstance(name, str) or not name or not isinstance(version, str) or not version:
                raise ValueError("name and version must be non-empty strings")
            factories = module_factories(manifest)
            exports = manifest.get("exports")
            if not isinstance(exports, dict) or not exports:
                raise ValueError("exports must be a non-empty object")
            for export_name, mod_id in exports.items():
                if mod_id not in factories:
                    raise ValueError(f"export {export_name!r} targets unknown module {mod_id!r}")
        except ValueError as exc:
            problems.append(f"modules/{rel}/module.json: {exc}")
            continue

        # Mirror package_from_reader(): refresh source-files.json before digesting.
        refreshed = (json.dumps(sorted(files), indent=2, ensure_ascii=False) + "\n").encode("utf-8")
        digest_files = dict(files)
        digest_files["source-files.json"] = (refreshed, False)
        pkg_digest = compute_source_digest(digest_files, "module.json")

        coord = (name, version)
        if coord in catalog:
            problems.append(f"modules/{rel}: duplicate package coordinate {name}@{version}")
            continue
        catalog[coord] = {
            "path": f"modules/{rel}",
            "name": name,
            "version": version,
            "digest": pkg_digest,
            "exports": exports,
            "factories": factories,
        }
        by_name.setdefault(name, set()).add(version)

    return catalog, by_name


def verify_preset_frozen_packages(
    root: Path,
    preset_rel: str,
    catalog: dict[tuple[str, str], dict],
    by_name: dict[str, set[str]],
    problems: list[str],
) -> int:
    preset_dir = root / preset_rel
    preset_path = preset_dir / "preset.json"
    try:
        ensure_regular_no_symlink(preset_path, root)
        preset = json.loads(preset_path.read_text(encoding="utf-8"))
    except (OSError, ValueError) as exc:
        problems.append(f"{preset_rel}/preset.json: {exc}")
        return 0

    imports = preset.get("system", {}).get("module_imports", {})
    if not isinstance(imports, dict):
        problems.append(f"{preset_rel}/preset.json: system.module_imports must be an object")
        return 0

    frozen_dir = preset_dir / ".nofy-module-packages"
    if not frozen_dir.is_dir() or frozen_dir.is_symlink():
        problems.append(f"{preset_rel}/.nofy-module-packages: directory missing or symlink")
        return 0

    on_disk = {p.name for p in frozen_dir.iterdir() if p.is_file()}
    expected_files: set[str] = set()
    checked = 0

    for alias, imp in imports.items():
        digest = imp.get("digest")
        name = imp.get("name")
        version = imp.get("version")
        repo = imp.get("repository")
        if not isinstance(digest, str) or not re.fullmatch(r"[0-9a-f]{64}", digest):
            problems.append(f"{preset_rel}: import {alias!r} has invalid digest {digest!r}")
            continue
        filename = f"{digest}.json"
        expected_files.add(filename)
        frozen_path = frozen_dir / filename
        try:
            ensure_regular_no_symlink(frozen_path, root)
            frozen_record = json.loads(frozen_path.read_text(encoding="utf-8"))
            files, declaration, settings_json = decode_frozen_source(frozen_record)
            actual_digest = compute_source_digest(files, declaration, settings_json)
            if actual_digest != digest:
                problems.append(
                    f"{preset_rel}/.nofy-module-packages/{filename}: self-digest mismatch ({actual_digest})"
                )
                continue
            manifest = json.loads(files[declaration][0].decode("utf-8"))
            if manifest.get("name") != name or manifest.get("version") != version:
                problems.append(
                    f"{preset_rel}: import {alias!r} metadata ({name}@{version}) disagrees with frozen manifest "
                    f"({manifest.get('name')}@{manifest.get('version')})"
                )
            if manifest.get("exports") != imp.get("exports"):
                problems.append(f"{preset_rel}: import {alias!r} exports disagree with frozen manifest")
            if module_factories(manifest) != imp.get("factories"):
                problems.append(f"{preset_rel}: import {alias!r} factories disagree with frozen manifest")
        except (OSError, ValueError) as exc:
            problems.append(f"{preset_rel}/.nofy-module-packages/{filename}: {exc}")
            continue

        checked += 1
        if repo != "nofy":
            continue
        coord = (name, version)
        if coord in catalog:
            repo_digest = catalog[coord]["digest"]
            if repo_digest != digest:
                problems.append(
                    f"{preset_rel}: frozen import {alias!r} ({name}@{version}) drifted from {catalog[coord]['path']} "
                    f"(frozen={digest[:12]} repo={repo_digest[:12]})"
                )
        elif name in by_name:
            # Historical immutable version pinned in a preset while repository carries a newer version:
            # self-digest integrity was already verified above.
            pass
        else:
            problems.append(f"{preset_rel}: import {alias!r} references unknown nofy package {name}@{version}")

    orphans = sorted(on_disk - expected_files)
    for orphan in orphans:
        problems.append(f"{preset_rel}/.nofy-module-packages/{orphan}: unreferenced frozen package blob")

    return checked


def verify_source_files_sync(root: Path, preset_rel: str, problems: list[str]) -> int:
    preset_dir = root / preset_rel
    manifest_path = preset_dir / "source-files.json"
    try:
        ensure_regular_no_symlink(manifest_path, root)
        listed = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (OSError, ValueError) as exc:
        problems.append(f"{preset_rel}/source-files.json: {exc}")
        return 0

    if not isinstance(listed, list) or not listed or len(listed) != len(set(listed)):
        problems.append(f"{preset_rel}/source-files.json: must be a unique non-empty list")
        return 0
    if listed != sorted(listed):
        problems.append(f"{preset_rel}/source-files.json: entries must be sorted")

    disk_files: set[str] = set()
    for dirpath, dirnames, filenames in os.walk(preset_dir, followlinks=False):
        current = Path(dirpath)
        for d in list(dirnames):
            if (current / d).is_symlink():
                problems.append(f"{preset_rel}: symlink directory forbidden: {(current / d).relative_to(preset_dir)}")
                dirnames.remove(d)
        for name in filenames:
            full = current / name
            rel = full.relative_to(preset_dir).as_posix()
            if full.is_symlink():
                problems.append(f"{preset_rel}/{rel}: symlink forbidden")
                continue
            disk_files.add(rel)

    listed_set = set(listed)
    for missing in sorted(listed_set - disk_files):
        problems.append(f"{preset_rel}: listed in source-files.json but missing on disk: {missing}")
    for extra in sorted(disk_files - listed_set):
        problems.append(f"{preset_rel}: present on disk but unlisted in source-files.json: {extra}")
    return len(listed)


def check_max_safe_integers(node, path: str, problems: list[str]) -> None:
    if isinstance(node, dict):
        maximum = node.get("maximum")
        if isinstance(maximum, int) and maximum > JS_MAX_SAFE_INT:
            problems.append(f"{path}.maximum ({maximum}) exceeds JS safe integer ({JS_MAX_SAFE_INT})")
        for key, value in node.items():
            check_max_safe_integers(value, f"{path}.{key}", problems)
    elif isinstance(node, list):
        for idx, item in enumerate(node):
            check_max_safe_integers(item, f"{path}[{idx}]", problems)


def verify_schemas_and_wiring(root: Path, problems: list[str]) -> None:
    omni_schema_path = root / "presets/omni/settings.schema.json"
    try:
        ensure_regular_no_symlink(omni_schema_path, root)
        omni_schema = json.loads(omni_schema_path.read_text(encoding="utf-8"))
    except (OSError, ValueError) as exc:
        problems.append(f"presets/omni/settings.schema.json: {exc}")
        return

    props = omni_schema.get("properties", {})
    for key in REQUIRED_TYPED_OBJECTS:
        prop = props.get(key)
        if not isinstance(prop, dict):
            problems.append(f"presets/omni/settings.schema.json: missing property {key!r}")
            continue
        if prop.get("type") != "object":
            problems.append(f"presets/omni/settings.schema.json: property {key!r} must have type 'object'")
        nested = prop.get("properties")
        if not isinstance(nested, dict) or not nested:
            problems.append(
                f"presets/omni/settings.schema.json: property {key!r} must define nested 'properties' (not bare object)"
            )

    check_max_safe_integers(omni_schema, "presets/omni/settings.schema.json", problems)

    # Check dead coordination.tools wire stays removed from Omni main-tools.
    omni_preset_path = root / "presets/omni/preset.json"
    try:
        omni_preset = json.loads(omni_preset_path.read_text(encoding="utf-8"))
        for mod in omni_preset.get("system", {}).get("modules", []):
            body = mod["$when"]["value"] if "$when" in mod else mod
            if body.get("reference", {}).get("$module") == "main-tools":
                if "tasks" in body.get("dependencies", {}) or "tasks" in body.get("config", {}).get("packs", []):
                    problems.append(
                        "presets/omni/preset.json: main-tools still wires dead coordination.tools ('tasks')"
                    )
    except (OSError, ValueError) as exc:
        problems.append(f"presets/omni/preset.json: {exc}")

    # Check manual docs embedded into presets/omni remain byte-identical.
    for dst_rel, src_rel in OMNI_MANUAL_COPIES.items():
        dst, src = root / dst_rel, root / src_rel
        if not dst.exists() or not src.exists():
            problems.append(f"missing manual sync file: {dst_rel} <-> {src_rel}")
        elif dst.read_bytes() != src.read_bytes():
            problems.append(f"{dst_rel} differs from {src_rel}; regenerate presets/omni via omni_preset")

    # Check presets/main-agent-composable/settings.schema.json.
    comp_schema_path = root / "presets/main-agent-composable/settings.schema.json"
    if comp_schema_path.exists():
        try:
            comp_schema = json.loads(comp_schema_path.read_text(encoding="utf-8"))
            allowed_default = comp_schema.get("properties", {}).get("allowed_tools", {}).get("default", [])
            if "workflow_agent" not in allowed_default:
                problems.append(
                    "presets/main-agent-composable/settings.schema.json: allowed_tools.default missing 'workflow_agent'"
                )
            check_max_safe_integers(comp_schema, "presets/main-agent-composable/settings.schema.json", problems)
        except (OSError, ValueError) as exc:
            problems.append(f"presets/main-agent-composable/settings.schema.json: {exc}")


def verify_all(root: Path = ROOT) -> tuple[list[str], dict]:
    problems: list[str] = []
    catalog, by_name = load_module_repository(root, problems)
    omni_frozen = verify_preset_frozen_packages(root, "presets/omni", catalog, by_name, problems)
    comp_frozen = 0
    if (root / "presets/main-agent-composable/preset.json").exists():
        comp_frozen = verify_preset_frozen_packages(
            root, "presets/main-agent-composable", catalog, by_name, problems
        )
    omni_files = verify_source_files_sync(root, "presets/omni", problems)
    verify_schemas_and_wiring(root, problems)
    summary = {
        "repository_packages": len(catalog),
        "omni_frozen_packages": omni_frozen,
        "main_agent_frozen_packages": comp_frozen,
        "omni_source_files": omni_files,
    }
    return problems, summary


def main() -> int:
    problems, summary = verify_all(ROOT)
    if problems:
        for problem in problems:
            print(f"verify-module-sync: {problem}", file=sys.stderr)
        return 1
    print(
        f"module sync: {summary['repository_packages']} repository packages, "
        f"{summary['omni_frozen_packages']} omni frozen packages, "
        f"{summary['main_agent_frozen_packages']} main-agent frozen packages, "
        f"{summary['omni_source_files']} omni source files verified"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
