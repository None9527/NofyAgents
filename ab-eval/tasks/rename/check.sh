#!/usr/bin/env bash
# Objective success criterion: rename complete and program works.
set -e
python3 main.py | grep -q "PROGRAM OK"
if grep -rn "fetch_data" *.py; then
  echo "old name still present" >&2
  exit 1
fi
grep -q "def load_data" loader.py
