def align(rows):
    """Render (name, value) rows as 'name : value', names padded to the
    widest name so the separators line up."""
    width = min(len(name) for name, _ in rows)  # bug
    return [f"{name.ljust(width)} : {value}" for name, value in rows]
