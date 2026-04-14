import asyncio
import logging
import time

from fastapi import APIRouter, Depends

from apps.api.schemas import CompareRequest, CompareResponse, GeneratorOutput
from apps.api.dependencies import (
    get_auditor, get_generator_baseline, get_generator_optimized,
    get_listing_judge,
)
from apps.api.raw_llm import raw_llm_generate

router = APIRouter()
logger = logging.getLogger(__name__)


async def _run_dspy_generator(generator, req: CompareRequest, audit_dict: dict) -> GeneratorOutput:
    """Runs a DSPy TextGeneratorModule in a thread (DSPy is sync)."""
    start = time.perf_counter()
    try:
        result = await asyncio.to_thread(
            generator,
            weak_title=req.weak_title,
            weak_description=req.weak_description,
            weak_attributes=req.weak_attributes,
            trending_keywords=req.trending_keywords,
            category=req.category,
            audit_diagnosis=audit_dict,
        )
        latency_ms = int((time.perf_counter() - start) * 1000)
        attrs = {str(k): str(v) for k, v in (result.attributes or {}).items()}
        return GeneratorOutput(
            title=str(result.title),
            description=str(result.description),
            attributes=attrs,
            latency_ms=latency_ms,
        )
    except Exception as e:
        logger.exception("DSPy generator failed")
        return GeneratorOutput(
            title="", description="", attributes={},
            latency_ms=int((time.perf_counter() - start) * 1000),
            error=f"{type(e).__name__}: {e}",
        )


async def _run_raw(req: CompareRequest) -> GeneratorOutput:
    start = time.perf_counter()
    try:
        result = await raw_llm_generate(
            weak_title=req.weak_title,
            weak_description=req.weak_description,
            weak_attributes=req.weak_attributes,
            category=req.category,
        )
        return GeneratorOutput(
            title=result["title"],
            description=result["description"],
            attributes=result["attributes"],
            latency_ms=int((time.perf_counter() - start) * 1000),
            error=result.get("_parse_error"),
        )
    except Exception as e:
        logger.exception("Raw LLM failed")
        return GeneratorOutput(
            title="", description="", attributes={},
            latency_ms=int((time.perf_counter() - start) * 1000),
            error=f"{type(e).__name__}: {e}",
        )


def _compute_score(judge_result) -> float:
    """Compute the aggregated score using the same weights as the
    optimization metric."""
    from dspy_pipeline.judges.metric import (
        TITLE_WEIGHTS, DESCRIPTION_WEIGHTS,
        ATTRIBUTES_WEIGHT, KEYWORDS_WEIGHT, _normalize_ordinal,
    )
    title_s = (
        TITLE_WEIGHTS["brand"]   * float(judge_result.title_has_brand)
        + TITLE_WEIGHTS["model"] * float(judge_result.title_has_model_or_line)
        + TITLE_WEIGHTS["specs"] * float(judge_result.title_has_key_specs)
        + TITLE_WEIGHTS["length"] * float(judge_result.title_length_ok)
        + TITLE_WEIGHTS["no_spam"] * float(judge_result.title_avoids_spam)
    )
    desc_s = (
        DESCRIPTION_WEIGHTS["completeness"] * _normalize_ordinal(judge_result.description_completeness)
        + DESCRIPTION_WEIGHTS["structure"] * _normalize_ordinal(judge_result.description_structure)
        + DESCRIPTION_WEIGHTS["buyer_qs"] * _normalize_ordinal(judge_result.description_answers_buyer_qs)
    )
    attr_s = ATTRIBUTES_WEIGHT * _normalize_ordinal(judge_result.attributes_coverage)
    kw_s = KEYWORDS_WEIGHT * float(judge_result.uses_relevant_trending_keywords)
    return round(title_s + desc_s + attr_s + kw_s, 3)


async def _score_one(judge, output: GeneratorOutput, req: CompareRequest) -> str | None:
    """Score a single generator output. Returns the judge reasoning string
    (or None). Mutates output.score in place.

    For the live demo we don't have gold references, so we pass empty
    strings and let the judge rate absolute quality. This degrades signal
    vs. reference-based but is the honest constraint when serving user input."""
    if output.error:
        return None
    try:
        result = await asyncio.to_thread(
            judge,
            generated_title=output.title,
            generated_description=output.description,
            generated_attributes=output.attributes,
            reference_title="",
            reference_description="",
            reference_attributes_count=0,
            category=req.category,
            trending_keywords=req.trending_keywords,
        )
        output.score = _compute_score(result)
        return getattr(result, "reasoning", None)
    except Exception:
        logger.exception("Judge failed")
        output.score = None
        return None


@router.post("/compare", response_model=CompareResponse)
async def compare(
    req: CompareRequest,
    auditor=Depends(get_auditor),
    gen_baseline=Depends(get_generator_baseline),
    gen_optimized=Depends(get_generator_optimized),
    judge=Depends(get_listing_judge),
):
    # 1. Compute audit diagnosis if not provided
    audit_dict = req.audit_diagnosis
    if audit_dict is None and auditor is not None:
        try:
            audit_result = await asyncio.to_thread(
                auditor,
                weak_title=req.weak_title,
                weak_description=req.weak_description,
                weak_attributes=req.weak_attributes,
                category=req.category,
                known_trending_keywords=req.trending_keywords,
            )
            audit_dict = {
                "missing_critical_attributes": list(audit_result.missing_critical_attributes),
                "title_issues": list(audit_result.title_issues),
                "description_issues": list(audit_result.description_issues),
                "missing_keywords": list(audit_result.missing_keywords),
                "priority_fixes": list(audit_result.priority_fixes),
            }
        except Exception:
            logger.exception("Auditor failed in /compare; using empty diagnosis")
            audit_dict = {}
    elif audit_dict is None:
        audit_dict = {}

    # 2. Run all three generators concurrently
    _unavailable = GeneratorOutput(
        title="", description="", attributes={},
        latency_ms=0, error="DSPy modules unavailable",
    )

    raw, baseline, optimized = await asyncio.gather(
        _run_raw(req),
        _run_dspy_generator(gen_baseline, req, audit_dict) if gen_baseline else asyncio.sleep(0),
        _run_dspy_generator(gen_optimized, req, audit_dict) if gen_optimized else asyncio.sleep(0),
    )
    if not isinstance(baseline, GeneratorOutput):
        baseline = _unavailable
    if not isinstance(optimized, GeneratorOutput):
        optimized = _unavailable

    # 3. Score all three if requested and judge is available
    judge_reasoning = None
    if req.include_scores and judge is not None:
        reasoning_results = await asyncio.gather(
            _score_one(judge, raw, req),
            _score_one(judge, baseline, req),
            _score_one(judge, optimized, req),
        )
        # reasoning_results[2] is the optimized output's reasoning
        judge_reasoning = reasoning_results[2]

    return CompareResponse(
        raw_llm=raw,
        prompty_baseline=baseline,
        prompty_optimized=optimized,
        judge_reasoning_optimized=judge_reasoning,
    )
