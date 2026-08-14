import re


def slugify(text):
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text)  # bug: never lowercased
    return text.strip("-")
