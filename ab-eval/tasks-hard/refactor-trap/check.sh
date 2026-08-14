#!/usr/bin/env bash
# Objective success: split done AND old import path still works.
# Accept either flat modules (circles.py/rects.py) or a shapes/ package
# containing them — both satisfy the prompt as long as the old import
# path keeps working (asserted by test_shapes.py).
set -e
if [ -f circles.py ] && [ -f rects.py ]; then
  grep -q "class Circle" circles.py
  grep -q "class Rect" rects.py
elif [ -f shapes/circles.py ] && [ -f shapes/rects.py ]; then
  grep -q "class Circle" shapes/circles.py
  grep -q "class Rect" shapes/rects.py
else
  echo "neither flat modules nor shapes/ package found" >&2
  exit 1
fi
python3 test_shapes.py | grep -q "ALL TESTS PASSED"
