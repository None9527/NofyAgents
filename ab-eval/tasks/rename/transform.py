from loader import fetch_data


def transform(items):
    return [x.upper() for x in fetch_data("t")]
