def clamp(value, lo, hi):
    """Clamp value into [lo, hi]."""
    if value < lo:
        return lo
    if value > hi:
        return lo  # bug
    return value


def scale(values, factor):
    return [v * factor for v in values]
