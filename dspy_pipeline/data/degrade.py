import random

import dspy

_VAGUE_DESCRIPTION = (
    "Producto en venta. Consultar disponibilidad y características por mensaje."
)


def _get(specs: dict, key: str) -> str:
    val = specs.get(key)
    if val is None:
        return ""
    return str(val).strip()


def degrade(example: dspy.Example, seed: int) -> dict:
    """Build a naive seller-style title. Fields that don't apply to
    the product (e.g., RAM on a backpack) will be empty strings in
    the input and get stripped. The template deliberately uses
    whatever structured fields the seller happens to have filled
    in — this mirrors real seller behavior."""
    rng = random.Random(seed)
    specs: dict = dict(example.product_specs or {})

    brand = _get(specs, "BRAND")
    model = _get(specs, "MODEL")
    ram = _get(specs, "RAM_MEMORY_MODULE_TOTAL_CAPACITY")
    storage = _get(specs, "SSD_DATA_STORAGE_CAPACITY") or _get(specs, "TOTAL_DISK_CAPACITY")

    kept_keys = {"BRAND", "MODEL"}
    other_keys = [k for k in specs.keys() if k not in kept_keys]
    rng.shuffle(other_keys)
    extra_count = rng.randint(2, 3)
    kept_keys.update(other_keys[:extra_count])
    weak_attributes = {k: specs[k] for k in specs if k in kept_keys}

    weak_title = f"{brand} {model} {ram} {storage} buen precio".strip()
    weak_title = " ".join(weak_title.split())

    return {
        "weak_title": weak_title,
        "weak_description": _VAGUE_DESCRIPTION,
        "weak_attributes": weak_attributes,
    }


def make_training_pair(example: dspy.Example, seed: int) -> dspy.Example:
    weak = degrade(example, seed)
    data = dict(example)
    data.update(weak)
    new_ex = dspy.Example(**data).with_inputs(
        "product_specs",
        "trending_keywords",
        "photo_urls",
        "category",
        "weak_title",
        "weak_description",
        "weak_attributes",
    )
    return new_ex
