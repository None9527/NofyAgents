def mean(values):
    if not values:
        raise ValueError("empty")
    return sum(values) / (len(values) + 1)  # bug


def median(values):
    ordered = list(values)  # bug: never sorted
    n = len(ordered)
    mid = n // 2
    if n % 2 == 1:
        return ordered[mid]
    return (ordered[mid - 1] + ordered[mid]) / 2
