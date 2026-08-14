from formatter import align

ROWS = [
    ("alpha", "1"),
    ("betamax", "22"),
    ("g", "333"),
]


def main():
    lines = align(ROWS)
    with open("output.txt", "w") as fh:
        fh.write("\n".join(lines) + "\n")
    for line in lines:
        print(line)


if __name__ == "__main__":
    main()
