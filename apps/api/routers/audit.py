import asyncio
import logging

from fastapi import APIRouter, Depends

from apps.api.schemas import AuditRequest, AuditResponse
from apps.api.dependencies import get_auditor

router = APIRouter()
logger = logging.getLogger(__name__)

MOCK_AUDIT = AuditResponse(
    missing_critical_attributes=[
        "PROCESSOR_BRAND", "PROCESSOR_LINE", "RAM_MEMORY_MODULE_TOTAL_CAPACITY",
        "SSD_DATA_STORAGE_CAPACITY", "DISPLAY_SIZE",
    ],
    title_issues=[
        "Does not specify brand context beyond the model number",
        "Lacks key specs (processor, RAM, storage)",
        "Ends with generic 'buen precio' which adds no information",
    ],
    description_issues=[
        "Too vague — one sentence provides no product detail",
        "No technical specifications section",
        "No reasons-to-buy section",
    ],
    missing_keywords=["notebook hp", "ryzen 7", "16gb ssd"],
    priority_fixes=[
        "Add processor brand, line, and model to the title",
        "Include RAM and SSD capacity in the title",
        "Write a structured description with tech specs and key features",
        "Fill missing MELI attributes based on the product model",
    ],
)


@router.post("/audit", response_model=AuditResponse)
async def audit(req: AuditRequest, auditor=Depends(get_auditor)):
    if auditor is None:
        return MOCK_AUDIT
    try:
        result = await asyncio.to_thread(
            auditor,
            weak_title=req.weak_title,
            weak_description=req.weak_description,
            weak_attributes=req.weak_attributes,
            category=req.category,
            known_trending_keywords=req.trending_keywords,
        )
        return AuditResponse(
            missing_critical_attributes=list(result.missing_critical_attributes),
            title_issues=list(result.title_issues),
            description_issues=list(result.description_issues),
            missing_keywords=list(result.missing_keywords),
            priority_fixes=list(result.priority_fixes),
        )
    except Exception:
        logger.exception("Auditor failed; returning mock fallback")
        return MOCK_AUDIT
