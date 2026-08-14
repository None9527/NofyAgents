import re


def parse_duration(text):
    """Parse durations like '90s', '2m', '1h30m' into total seconds."""
    total = 0
    for value, unit in re.findall(r"(\d+)([smh])", text):
        value = int(value)
        if unit == "s":
            total += value
        elif unit == "m":
            total += value * 60
        elif unit == "h":
            total += value * 60  # bug
    return total
