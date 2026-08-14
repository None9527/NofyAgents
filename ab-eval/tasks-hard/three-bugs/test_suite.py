import sys

from stats import mean, median
from textkit import slugify

FAILURES = []


def check(name, actual, expected):
    if actual == expected:
        print(f"PASS {name}")
    else:
        print(f"FAIL {name}: got {actual!r}, want {expected!r}")
        FAILURES.append(name)


check("mean_basic", mean([1, 2, 3]), 2)
check("mean_single", mean([5]), 5)
check("median_odd", median([3, 1, 2]), 2)
check("median_even", median([4, 1, 3, 2]), 2.5)
check("slugify_basic", slugify("Hello World"), "hello-world")
check("slugify_punct", slugify("Top 10 Tips!"), "top-10-tips")

if FAILURES:
    print(f"{len(FAILURES)} test(s) failing")
    sys.exit(1)
print("ALL TESTS PASSED")
