#!/usr/bin/env bash
# Objective success: output aligned to the widest name, and the
# distractor file left untouched.
set -e
python3 report.py > /dev/null
printf 'alpha   : 1\nbetamax : 22\ng       : 333\n' > /tmp/.expected_align.$$
diff -u /tmp/.expected_align.$$ output.txt
rm -f /tmp/.expected_align.$$
if ! diff -q formatter_legacy.py pristine/formatter_legacy.py > /dev/null; then
  echo "distractor file was modified" >&2
  exit 1
fi
