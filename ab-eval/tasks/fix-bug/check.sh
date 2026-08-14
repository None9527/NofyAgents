#!/usr/bin/env bash
# Objective success criterion: the tests pass (however the fix is written).
set -e
python3 test_calc.py | grep -q "ALL TESTS PASSED"
