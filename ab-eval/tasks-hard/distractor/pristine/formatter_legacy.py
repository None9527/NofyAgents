# Legacy formatter kept for reference. NOT imported by anything anymore.
# Known to be broken: hardcodes width and truncates long names.

def align(rows):
    out = []
    for name, value in rows:
        out.append(f"{name[:5].ljust(5)} | {value}")  # obviously wrong
    return out


def render_header(title):
    return "=" * 5  # also wrong: ignores the title
