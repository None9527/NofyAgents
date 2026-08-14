#!/usr/bin/env bash
# Objective success criterion: pipeline runs and report.txt is exact.
set -e
out=$(bash run_pipeline.sh)
echo "$out" | grep -q "PIPELINE DONE"
printf 'beta=1\ngamma=2\nalpha=3\n' > /tmp/.expected_report.$$
diff -u /tmp/.expected_report.$$ report.txt
rm -f /tmp/.expected_report.$$
