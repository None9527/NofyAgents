#!/usr/bin/env bash
set -euo pipefail

repo_root=$(git rev-parse --show-toplevel)
cd "$repo_root"

forbidden_runtime_pattern='MemoryMode::(Legacy|V2)|LegacyMemory|V2Memory|dual_write|memory-v2'

if rg -n \
    --glob '*.rs' \
    --glob '!target/**' \
    "$forbidden_runtime_pattern" \
    crates; then
    echo "unified-memory guard: forbidden parallel memory runtime symbol found" >&2
    exit 1
fi

runtime_snapshot=$(mktemp)
trap 'rm -f "$runtime_snapshot"' EXIT

# Scan production code only: skip dedicated test files and cut inline test
# modules at their first cfg(test) marker.
while IFS= read -r source; do
    case "$source" in
        */tests/*|*_tests.rs|*/acp_session_tests/*) continue ;;
    esac
    awk '/^#\[cfg\(test\)\]/{exit} {print}' "$source" >> "$runtime_snapshot"
done < <(find \
    crates/codegen/nofy-shell/src \
    crates/codegen/nofy-tools/src \
    crates/codegen/nofy-agent/src \
    crates/codegen/nofy-pager/src \
    -type f -name '*.rs' -print)

legacy_runtime_pattern='MemoryBackendImpl|MemoryBackendParams|MemoryWriter|memory_writer|dream_lock|write_daily_log|append_to_memory|replace_in_memory|remove_from_memory'
if rg -n "$legacy_runtime_pattern" "$runtime_snapshot"; then
    echo "unified-memory guard: legacy runtime reader/writer/backend found" >&2
    exit 1
fi

direct_memory_write_pattern='(std::fs::write|OpenOptions[^;]*append)[^;]*(MEMORY\.md|USER\.md|memory[/_ -]root)|(MEMORY\.md|USER\.md|memory[/_ -]root)[^;]*(std::fs::write|OpenOptions[^;]*append)'
if rg -n "$direct_memory_write_pattern" "$runtime_snapshot"; then
    echo "unified-memory guard: direct filesystem write to a memory root found" >&2
    exit 1
fi

if rg -n \
    --glob '*.rs' \
    'enum MemoryScope[[:space:]]*\{[^}]*External|MemoryScope::External|MemoryScope::Knowledge' \
    crates/codegen/nofy-memory; then
    echo "unified-memory guard: knowledge providers must not become memory scopes" >&2
    exit 1
fi

echo "unified-memory guard: ok"
