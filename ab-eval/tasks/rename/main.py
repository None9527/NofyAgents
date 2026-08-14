from loader import fetch_data
from transform import transform


def main():
    raw = fetch_data("main")
    out = transform(raw)
    assert len(raw) == 3 and len(out) == 3
    print("PROGRAM OK")


if __name__ == "__main__":
    main()
