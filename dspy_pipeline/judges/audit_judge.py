import logging
import math

import dspy

from dspy_pipeline.config import JUDGE_LM

logger = logging.getLogger(__name__)


class AuditQualityRubric(dspy.Signature):
    """Evaluate whether an audit of a weak Mercado Libre listing correctly identifies the real problems. You are given the weak listing, the auditor's diagnosis, and the gold reference listing that shows what a complete listing looks like. Judge whether the diagnosis flags the actual gaps and whether its suggestions are specific and actionable — not generic advice like 'add more details'."""

    weak_title: str = dspy.InputField(desc="The weak listing title being audited.")
    weak_description: str = dspy.InputField(desc="The weak listing description being audited.")
    weak_attributes: dict = dspy.InputField(desc="Dict of weak listing attributes (key → value).")
    audit_missing_critical_attributes: list[str] = dspy.InputField(desc="Attributes the auditor flagged as missing.")
    audit_title_issues: list[str] = dspy.InputField(desc="Title problems identified by the auditor.")
    audit_description_issues: list[str] = dspy.InputField(desc="Description problems identified by the auditor.")
    audit_missing_keywords: list[str] = dspy.InputField(desc="Trending keywords the auditor says are missing.")
    audit_priority_fixes: list[str] = dspy.InputField(desc="Ranked list of priority fixes from the auditor.")
    reference_title: str = dspy.InputField(desc="The gold-standard CATALOG_PRODUCT title for comparison.")
    reference_description: str = dspy.InputField(desc="The gold-standard CATALOG_PRODUCT description for comparison.")
    reference_attributes_count: int = dspy.InputField(desc="Number of attributes in the gold reference listing.")
    trending_keywords: list[str] = dspy.InputField(desc="Currently trending search keywords for this category on MELI.")

    did_identify_missing_attributes: bool = dspy.OutputField(
        desc="Did the audit flag that attributes are missing, given the weak listing has way fewer than the reference?")
    did_identify_weak_title: bool = dspy.OutputField(
        desc="Did the audit call out the title as inadequate?")
    did_identify_weak_description: bool = dspy.OutputField(
        desc="Did the audit call out the description as inadequate?")
    diagnosis_is_actionable: int = dspy.OutputField(
        desc="1=only identifies problems without fixes; 5=every issue has a specific, concrete fix.")
    diagnosis_is_specific_not_generic: int = dspy.OutputField(
        desc="1=generic boilerplate ('add more keywords'); 5=names specific missing attributes like 'RAM_MEMORY_TYPE' or specific keyword candidates.")
    reasoning: str = dspy.OutputField(desc="2-3 sentences.")


class AuditJudge(dspy.Module):
    def __init__(self):
        super().__init__()
        self.judge = dspy.ChainOfThought(AuditQualityRubric)

    def forward(self, **kwargs):
        with dspy.context(lm=JUDGE_LM):
            return self.judge(**kwargs)


IDENTIFIED_ATTRS_WEIGHT = 0.20
IDENTIFIED_TITLE_WEIGHT = 0.15
IDENTIFIED_DESC_WEIGHT = 0.15
ACTIONABLE_WEIGHT = 0.25
SPECIFIC_WEIGHT = 0.25

_audit_total = (
    IDENTIFIED_ATTRS_WEIGHT + IDENTIFIED_TITLE_WEIGHT + IDENTIFIED_DESC_WEIGHT
    + ACTIONABLE_WEIGHT + SPECIFIC_WEIGHT
)
assert math.isclose(_audit_total, 1.0, abs_tol=1e-9), f"Audit weights sum to {_audit_total}, expected 1.0"

_audit_judge = None


def _get_audit_judge() -> AuditJudge:
    global _audit_judge
    if _audit_judge is None:
        _audit_judge = AuditJudge()
    return _audit_judge


def _normalize_ordinal(x: int) -> float:
    return max(0.0, min(1.0, (x - 1) / 4))


def audit_quality_metric(example, pred, trace=None) -> float | bool:
    try:
        judge = _get_audit_judge()
        r = judge(
            weak_title=example.weak_title,
            weak_description=example.weak_description,
            weak_attributes=example.weak_attributes,
            audit_missing_critical_attributes=pred.missing_critical_attributes,
            audit_title_issues=pred.title_issues,
            audit_description_issues=pred.description_issues,
            audit_missing_keywords=pred.missing_keywords,
            audit_priority_fixes=pred.priority_fixes,
            reference_title=example.gold_title,
            reference_description=example.gold_description,
            reference_attributes_count=example.gold_attributes_count,
            trending_keywords=example.trending_keywords,
        )

        total = (
            IDENTIFIED_ATTRS_WEIGHT * float(r.did_identify_missing_attributes)
            + IDENTIFIED_TITLE_WEIGHT * float(r.did_identify_weak_title)
            + IDENTIFIED_DESC_WEIGHT * float(r.did_identify_weak_description)
            + ACTIONABLE_WEIGHT * _normalize_ordinal(r.diagnosis_is_actionable)
            + SPECIFIC_WEIGHT * _normalize_ordinal(r.diagnosis_is_specific_not_generic)
        )

        if trace is not None:
            return total >= 0.6
        return total

    except Exception as exc:
        logger.warning("AuditJudge failed for example %s: %s", getattr(example, "id", "?"), type(exc).__name__)
        return 0.0
