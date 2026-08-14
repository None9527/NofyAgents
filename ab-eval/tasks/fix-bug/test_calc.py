import sys

from calc import clamp, scale


def main():
    assert clamp(5, 0, 3) == 3, f"upper clamp wrong: {clamp(5, 0, 3)}"
    assert clamp(-2, 0, 3) == 0, f"lower clamp wrong: {clamp(-2, 0, 3)}"
    assert clamp(2, 0, 3) == 2, f"passthrough wrong: {clamp(2, 0, 3)}"
    assert scale([1, 2], 2) == [2, 4]
    print("ALL TESTS PASSED")
    return 0


if __name__ == "__main__":
    sys.exit(main())
