import logging
import math

from dspy_pipeline.judges.listing_judge import ListingJudge

logger = logging.getLogger(__name__)

TITLE_WEIGHTS = {
    "brand": 0.05,
    "model": 0.05,
    "specs": 0.04,
    "length": 0.02,
    "no_spam": 0.02,
}

DESCRIPTION_WEIGHTS = {
    "completeness": 0.12,
    "structure": 0.08,
    "buyer_qs": 0.10,
}

ATTRIBUTES_WEIGHT = 0.35
KEYWORDS_WEIGHT = 0.17

_total = sum(TITLE_WEIGHTS.values()) + sum(DESCRIPTION_WEIGHTS.values()) + ATTRIBUTES_WEIGHT + KEYWORDS_WEIGHT
assert math.isclose(_total, 1.0, abs_tol=1e-9), f"Weights sum to {_total}, expected 1.0"

_listing_judge = None


def _get_listing_judge() -> ListingJudge:
    global _listing_judge
    if _listing_judge is None:
        _listing_judge = ListingJudge()
    return _listing_judge


def _normalize_ordinal(x: int) -> float:
    return max(0.0, min(1.0, (x - 1) / 4))


def listing_quality_metric(example, pred, trace=None) -> float | bool:
    try:
        judge = _get_listing_judge()
        r = judge(
            generated_title=pred.title,
            generated_description=pred.description,
            generated_attributes=pred.attributes,
            reference_title=example.gold_title,
            reference_description=example.gold_description,
            reference_attributes_count=example.gold_attributes_count,
            category=example.category,
            trending_keywords=example.trending_keywords,
        )

        title_score = (
            TITLE_WEIGHTS["brand"] * float(r.title_has_brand)
            + TITLE_WEIGHTS["model"] * float(r.title_has_model_or_line)
            + TITLE_WEIGHTS["specs"] * float(r.title_has_key_specs)
            + TITLE_WEIGHTS["length"] * float(r.title_length_ok)
            + TITLE_WEIGHTS["no_spam"] * float(r.title_avoids_spam)
        )
        desc_score = (
            DESCRIPTION_WEIGHTS["completeness"] * _normalize_ordinal(r.description_completeness)
            + DESCRIPTION_WEIGHTS["structure"] * _normalize_ordinal(r.description_structure)
            + DESCRIPTION_WEIGHTS["buyer_qs"] * _normalize_ordinal(r.description_answers_buyer_qs)
        )
        attr_score = ATTRIBUTES_WEIGHT * _normalize_ordinal(r.attributes_coverage)
        kw_score = KEYWORDS_WEIGHT * float(r.uses_relevant_trending_keywords)

        total = title_score + desc_score + attr_score + kw_score

        if trace is not None:
            return total >= 0.6
        return total

    except Exception as exc:
        logger.warning("ListingJudge failed for example %s: %s", getattr(example, "id", "?"), type(exc).__name__)
        return 0.0
