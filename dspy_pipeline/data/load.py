import json
import random
from pathlib import Path

import dspy


def _clean(value):
    if isinstance(value, str) and value.strip() == "":
        return None
    return value


def load_dataset(
    path: str = "hackaton/laptops/dataset_laptops_v2/06_dataset_final.json",
    category: str = "notebooks",
) -> list[dspy.Example]:
    raw = json.loads(Path(path).read_text(encoding="utf-8"))
    examples: list[dspy.Example] = []
    for item in raw:
        inp = item["input"]
        out = item["output"]
        short_desc = out.get("short_description") or {}
        gold_description = short_desc.get("content", "") if isinstance(short_desc, dict) else ""
        ex = dspy.Example(
            product_specs=inp.get("all_attributes", {}) or {},
            trending_keywords=inp.get("trending_keywords", []) or [],
            photo_urls=inp.get("photo_urls", []) or [],
            category=category,
            gold_title=out.get("title", "") or "",
            gold_description=gold_description,
            gold_attributes_count=int(out.get("attributes_filled", 0) or 0),
        ).with_inputs("product_specs", "trending_keywords", "photo_urls", "category")
        examples.append(ex)
    return examples


def split_dataset(
    examples: list[dspy.Example],
    seed: int = 42,
) -> tuple[list[dspy.Example], list[dspy.Example], list[dspy.Example]]:
    shuffled = list(examples)
    random.Random(seed).shuffle(shuffled)
    train = shuffled[:15]
    val = shuffled[15:20]
    holdout = shuffled[20:25]
    return train, val, holdout
