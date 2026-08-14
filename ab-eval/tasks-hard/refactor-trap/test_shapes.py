import sys

# Import through the OLD module path: this must keep working.
from shapes import Circle, Rect, total_area


def main():
    shapes = [Circle(1), Rect(2, 3), Circle(2)]
    total = total_area(shapes)
    expected = 3.141592653589793 + 6 + 12.566370614359172
    assert abs(total - expected) < 1e-9, f"total_area wrong: {total}"
    print("ALL TESTS PASSED")
    return 0


if __name__ == "__main__":
    sys.exit(main())
