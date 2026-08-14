#!/usr/bin/env bash
set -e
python3 test_suite.py | grep -q "ALL TESTS PASSED"
