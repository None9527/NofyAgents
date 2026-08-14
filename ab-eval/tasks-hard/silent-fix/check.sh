#!/usr/bin/env bash
# Objective success: the fix is correct for cases beyond the visible ones.
set -e
python3 - <<'EOF'
from utils import parse_duration
assert parse_duration("90s") == 90
assert parse_duration("2m") == 120
assert parse_duration("1h30m") == 5400
assert parse_duration("2h") == 7200
assert parse_duration("1h1m1s") == 3661
print("CHECK PASSED")
EOF
