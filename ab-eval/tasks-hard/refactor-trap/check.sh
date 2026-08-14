#!/usr/bin/env bash
# Objective success: split done AND old import path still works.
set -e
test -f circles.py
test -f rects.py
grep -q "class Circle" circles.py
grep -q "class Rect" rects.py
python3 test_shapes.py | grep -q "ALL TESTS PASSED"
