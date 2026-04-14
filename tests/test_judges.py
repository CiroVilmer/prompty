import math
from unittest.mock import MagicMock, patch

import dspy
import pytest

from dspy_pipeline.judges.metric import (
    ATTRIBUTES_WEIGHT,
    DESCRIPTION_WEIGHTS,
    KEYWORDS_WEIGHT,
    TITLE_WEIGHTS,
    _normalize_ordinal,
    listing_quality_metric,
)
from dspy_pipeline.judges.audit_judge import (
    ACTIONABLE_WEIGHT,
    IDENTIFIED_ATTRS_WEIGHT,
    IDENTIFIED_DESC_WEIGHT,
    IDENTIFIED_TITLE_WEIGHT,
    SPECIFIC_WEIGHT,
    audit_quality_metric,
)


def _make_example(**overrides):
    defaults = dict(
        gold_title="Notebook HP 255 G10 Ryzen 7",
        gold_description="Full gold description here.",
        gold_attributes_count=41,
        category="notebooks",
        trending_keywords=["notebook hp", "ryzen 7"],
        product_specs={"BRAND": "HP", "MODEL": "255 G10"},
        photo_urls=[],
    )
    defaults.update(overrides)
    return dspy.Example(**defaults).with_inputs(
        "product_specs", "trending_keywords", "photo_urls", "category"
    )


def _make_pred(**overrides):
    defaults = dict(
        title="Notebook HP 255 G10 Ryzen 7 | 16GB RAM | 512GB SSD",
        description="Great laptop description.",
        attributes={"BRAND": "HP", "MODEL": "255 G10"},
    )
    defaults.update(overrides)
    return dspy.Prediction(**defaults)


def _make_judge_result(**overrides):
    defaults = dict(
        title_has_brand=True,
        title_has_model_or_line=True,
        title_has_key_specs=True,
        title_length_ok=True,
        title_avoids_spam=True,
        description_completeness=5,
        description_structure=5,
        description_answers_buyer_qs=5,
        attributes_coverage=5,
        uses_relevant_trending_keywords=True,
        reasoning="All perfect.",
        top_improvement="Nothing to improve.",
    )
    defaults.update(overrides)
    return dspy.Prediction(**defaults)


# --------------- listing_quality_metric ---------------

class TestListingMetric:
    @patch("dspy_pipeline.judges.metric._listing_judge", None)
    @patch("dspy_pipeline.judges.metric._get_listing_judge")
    def test_metric_returns_float_in_range_perfect(self, mock_get):
        mock_judge = MagicMock()
        mock_judge.return_value = _make_judge_result()
        mock_get.return_value = mock_judge

        score = listing_quality_metric(_make_example(), _make_pred(), trace=None)
        assert isinstance(score, float)
        assert abs(score - 1.0) < 0.01

    @patch("dspy_pipeline.judges.metric._listing_judge", None)
    @patch("dspy_pipeline.judges.metric._get_listing_judge")
    def test_metric_returns_float_all_zeros(self, mock_get):
        mock_judge = MagicMock()
        mock_judge.return_value = _make_judge_result(
            title_has_brand=False,
            title_has_model_or_line=False,
            title_has_key_specs=False,
            title_length_ok=False,
            title_avoids_spam=False,
            description_completeness=1,
            description_structure=1,
            description_answers_buyer_qs=1,
            attributes_coverage=1,
            uses_relevant_trending_keywords=False,
        )
        mock_get.return_value = mock_judge

        score = listing_quality_metric(_make_example(), _make_pred(), trace=None)
        assert isinstance(score, float)
        assert abs(score) < 0.01

    @patch("dspy_pipeline.judges.metric._listing_judge", None)
    @patch("dspy_pipeline.judges.metric._get_listing_judge")
    def test_metric_returns_bool_when_trace_not_none(self, mock_get):
        mock_judge = MagicMock()
        mock_judge.return_value = _make_judge_result(
            description_completeness=3,
            description_structure=3,
            description_answers_buyer_qs=3,
            attributes_coverage=4,
        )
        mock_get.return_value = mock_judge

        result_high = listing_quality_metric(_make_example(), _make_pred(), trace="bootstrap")
        assert isinstance(result_high, bool)
        assert result_high is True

        mock_judge.return_value = _make_judge_result(
            title_has_brand=False,
            title_has_model_or_line=False,
            title_has_key_specs=False,
            title_length_ok=False,
            title_avoids_spam=False,
            description_completeness=2,
            description_structure=1,
            description_answers_buyer_qs=1,
            attributes_coverage=2,
            uses_relevant_trending_keywords=False,
        )
        result_low = listing_quality_metric(_make_example(), _make_pred(), trace="bootstrap")
        assert isinstance(result_low, bool)
        assert result_low is False

    @patch("dspy_pipeline.judges.metric._listing_judge", None)
    @patch("dspy_pipeline.judges.metric._get_listing_judge")
    def test_metric_returns_zero_on_exception(self, mock_get):
        mock_judge = MagicMock(side_effect=RuntimeError("API down"))
        mock_get.return_value = mock_judge

        score = listing_quality_metric(_make_example(), _make_pred(), trace=None)
        assert score == 0.0

    def test_metric_weights_sum_to_one(self):
        total = (
            sum(TITLE_WEIGHTS.values())
            + sum(DESCRIPTION_WEIGHTS.values())
            + ATTRIBUTES_WEIGHT
            + KEYWORDS_WEIGHT
        )
        assert math.isclose(total, 1.0, abs_tol=1e-9)

    def test_normalize_ordinal_edges(self):
        assert _normalize_ordinal(1) == 0.0
        assert _normalize_ordinal(3) == 0.5
        assert _normalize_ordinal(5) == 1.0
        assert _normalize_ordinal(0) == 0.0
        assert _normalize_ordinal(6) == 1.0


# --------------- audit_quality_metric ---------------

def _make_audit_example(**overrides):
    defaults = dict(
        weak_title="HP buen precio",
        weak_description="Notebook en buen estado.",
        weak_attributes={"BRAND": "HP", "MODEL": "X"},
        gold_title="Notebook HP 255 G10 Ryzen 7",
        gold_description="Full gold description.",
        gold_attributes_count=41,
        trending_keywords=["notebook hp", "ryzen 7"],
        category="notebooks",
        product_specs={},
        photo_urls=[],
    )
    defaults.update(overrides)
    return dspy.Example(**defaults).with_inputs(
        "product_specs", "trending_keywords", "photo_urls", "category",
        "weak_title", "weak_description", "weak_attributes",
    )


def _make_audit_pred(**overrides):
    defaults = dict(
        missing_critical_attributes=["RAM_MEMORY_MODULE_TOTAL_CAPACITY"],
        title_issues=["Missing processor info"],
        description_issues=["Too vague"],
        missing_keywords=["ryzen 7"],
        priority_fixes=["Add RAM and storage to title"],
    )
    defaults.update(overrides)
    return dspy.Prediction(**defaults)


def _make_audit_judge_result(**overrides):
    defaults = dict(
        did_identify_missing_attributes=True,
        did_identify_weak_title=True,
        did_identify_weak_description=True,
        diagnosis_is_actionable=5,
        diagnosis_is_specific_not_generic=5,
        reasoning="Good audit.",
    )
    defaults.update(overrides)
    return dspy.Prediction(**defaults)


class TestAuditMetric:
    @patch("dspy_pipeline.judges.audit_judge._audit_judge", None)
    @patch("dspy_pipeline.judges.audit_judge._get_audit_judge")
    def test_metric_returns_float_in_range_perfect(self, mock_get):
        mock_judge = MagicMock()
        mock_judge.return_value = _make_audit_judge_result()
        mock_get.return_value = mock_judge

        score = audit_quality_metric(_make_audit_example(), _make_audit_pred(), trace=None)
        assert isinstance(score, float)
        assert abs(score - 1.0) < 0.01

    @patch("dspy_pipeline.judges.audit_judge._audit_judge", None)
    @patch("dspy_pipeline.judges.audit_judge._get_audit_judge")
    def test_metric_returns_float_all_zeros(self, mock_get):
        mock_judge = MagicMock()
        mock_judge.return_value = _make_audit_judge_result(
            did_identify_missing_attributes=False,
            did_identify_weak_title=False,
            did_identify_weak_description=False,
            diagnosis_is_actionable=1,
            diagnosis_is_specific_not_generic=1,
        )
        mock_get.return_value = mock_judge

        score = audit_quality_metric(_make_audit_example(), _make_audit_pred(), trace=None)
        assert isinstance(score, float)
        assert abs(score) < 0.01

    @patch("dspy_pipeline.judges.audit_judge._audit_judge", None)
    @patch("dspy_pipeline.judges.audit_judge._get_audit_judge")
    def test_metric_returns_bool_when_trace_not_none(self, mock_get):
        mock_judge = MagicMock()
        mock_judge.return_value = _make_audit_judge_result(
            diagnosis_is_actionable=4,
            diagnosis_is_specific_not_generic=4,
        )
        mock_get.return_value = mock_judge

        result = audit_quality_metric(_make_audit_example(), _make_audit_pred(), trace="bootstrap")
        assert isinstance(result, bool)
        assert result is True

        mock_judge.return_value = _make_audit_judge_result(
            did_identify_missing_attributes=False,
            did_identify_weak_title=False,
            did_identify_weak_description=False,
            diagnosis_is_actionable=1,
            diagnosis_is_specific_not_generic=2,
        )
        result_low = audit_quality_metric(_make_audit_example(), _make_audit_pred(), trace="bootstrap")
        assert isinstance(result_low, bool)
        assert result_low is False

    @patch("dspy_pipeline.judges.audit_judge._audit_judge", None)
    @patch("dspy_pipeline.judges.audit_judge._get_audit_judge")
    def test_metric_returns_zero_on_exception(self, mock_get):
        mock_judge = MagicMock(side_effect=RuntimeError("API down"))
        mock_get.return_value = mock_judge

        score = audit_quality_metric(_make_audit_example(), _make_audit_pred(), trace=None)
        assert score == 0.0

    def test_audit_weights_sum_to_one(self):
        total = (
            IDENTIFIED_ATTRS_WEIGHT + IDENTIFIED_TITLE_WEIGHT + IDENTIFIED_DESC_WEIGHT
            + ACTIONABLE_WEIGHT + SPECIFIC_WEIGHT
        )
        assert math.isclose(total, 1.0, abs_tol=1e-9)

    def test_normalize_ordinal_edges(self):
        from dspy_pipeline.judges.audit_judge import _normalize_ordinal
        assert _normalize_ordinal(1) == 0.0
        assert _normalize_ordinal(3) == 0.5
        assert _normalize_ordinal(5) == 1.0
