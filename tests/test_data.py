from pathlib import Path

import pytest

from dspy_pipeline.data.degrade import degrade, make_training_pair
from dspy_pipeline.data.load import load_dataset, split_dataset

REPO_ROOT = Path(__file__).resolve().parent.parent
DATASET_PATH = str(
    REPO_ROOT / "hackaton" / "laptops" / "dataset_laptops_v2" / "06_dataset_final.json"
)


@pytest.fixture(scope="module")
def examples():
    assert Path(DATASET_PATH).exists(), f"Dataset not found at {DATASET_PATH}"
    return load_dataset(DATASET_PATH)


def test_load_returns_25_examples(examples):
    assert len(examples) == 25
    first = examples[0]
    assert first.category == "notebooks"
    assert isinstance(first.product_specs, dict)
    assert isinstance(first.trending_keywords, list)
    assert isinstance(first.photo_urls, list)
    assert isinstance(first.gold_title, str) and first.gold_title
    assert isinstance(first.gold_description, str)
    assert isinstance(first.gold_attributes_count, int)


def test_split_sizes_are_15_5_5(examples):
    train, val, holdout = split_dataset(examples, seed=42)
    assert len(train) == 15
    assert len(val) == 5
    assert len(holdout) == 5
    ids = {id(e) for e in train} | {id(e) for e in val} | {id(e) for e in holdout}
    assert len(ids) == 25

    train2, val2, holdout2 = split_dataset(examples, seed=42)
    assert [e.gold_title for e in train] == [e.gold_title for e in train2]
    assert [e.gold_title for e in val] == [e.gold_title for e in val2]
    assert [e.gold_title for e in holdout] == [e.gold_title for e in holdout2]


def test_degrade_keeps_brand_and_model(examples):
    for i, ex in enumerate(examples):
        weak = degrade(ex, seed=i)
        assert "BRAND" in weak["weak_attributes"]
        assert "MODEL" in weak["weak_attributes"]
        full_count = len(ex.product_specs)
        assert len(weak["weak_attributes"]) <= max(5, full_count)
        assert len(weak["weak_attributes"]) < full_count
        assert weak["weak_description"].startswith("Producto en venta")
        assert "buen precio" in weak["weak_title"]


def test_training_pair_has_both_weak_and_gold_fields(examples):
    pair = make_training_pair(examples[0], seed=0)
    assert pair.weak_title
    assert pair.weak_description
    assert isinstance(pair.weak_attributes, dict)
    assert pair.gold_title
    assert pair.gold_description
    inputs = pair.inputs()
    assert "weak_title" in inputs
    assert "weak_description" in inputs
    assert "weak_attributes" in inputs
    assert "product_specs" in inputs
    assert "gold_title" not in inputs


def test_degrade_weak_description_is_category_neutral(examples):
    """Regression guard: weak description must not leak product
    type. This contaminated the generator baseline on non-laptop
    items (backpacks, stands) in an earlier iteration."""
    for example in examples:
        weak = degrade(example, seed=0)
        assert "notebook" not in weak["weak_description"].lower()
        assert "laptop" not in weak["weak_description"].lower()
        assert "portatil" not in weak["weak_description"].lower()
