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

if rg -n \
    --glob '*.rs' \
    'enum MemoryScope[[:space:]]*\{[^}]*External|MemoryScope::External|MemoryScope::Knowledge' \
    crates/codegen/nofy-memory; then
    echo "unified-memory guard: knowledge providers must not become memory scopes" >&2
    exit 1
fi

echo "unified-memory guard: ok"
