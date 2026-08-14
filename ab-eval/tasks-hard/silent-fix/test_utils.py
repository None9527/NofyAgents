from utils import parse_duration


def test_seconds():
    assert parse_duration("90s") == 90


def test_minutes():
    assert parse_duration("2m") == 120


def test_compound():
    assert parse_duration("1h30m") == 5400


if __name__ == "__main__":
    test_seconds()
    test_minutes()
    test_compound()
    print("ALL TESTS PASSED")
