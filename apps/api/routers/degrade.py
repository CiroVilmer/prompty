from fastapi import APIRouter

from apps.api.schemas import DegradeRequest, DegradeResponse
from apps.api.raw_llm import degrade_listing

router = APIRouter()


@router.post("/degrade", response_model=DegradeResponse)
async def degrade(req: DegradeRequest):
    result = await degrade_listing(
        product_specs=req.product_specs,
        category=req.category,
    )
    return DegradeResponse(
        weak_title=result["title"],
        weak_description=result["description"],
    )
