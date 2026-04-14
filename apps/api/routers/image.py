import asyncio
import logging

from fastapi import APIRouter, Depends

from apps.api.schemas import ImagePromptRequest, ImagePromptResponse
from apps.api.dependencies import get_image_prompter

router = APIRouter()
logger = logging.getLogger(__name__)

MOCK_IMAGE = ImagePromptResponse(
    image_generation_prompt=(
        "Professional product photograph of an HP notebook laptop in "
        "dark gray, shown at a 3/4 front angle on a clean white "
        "background. The lid is open, screen displays a subtle Windows "
        "desktop. Soft studio lighting from the upper left, gentle "
        "shadow underneath. High resolution, crisp edges, color-accurate, "
        "e-commerce catalog style. No text overlays, no watermarks."
    ),
    aspect_ratio="1:1",
    style_notes=(
        "- Pure white background\n"
        "- 3/4 front angle, open lid\n"
        "- Soft studio lighting\n"
        "- Color-accurate e-commerce style"
    ),
    generated_image_url=None,
)


@router.post("/image-prompt", response_model=ImagePromptResponse)
async def image_prompt(req: ImagePromptRequest, prompter=Depends(get_image_prompter)):
    if prompter is None:
        return MOCK_IMAGE
    try:
        result = await asyncio.to_thread(
            prompter,
            product_specs=req.product_specs,
            category=req.category,
            reference_image_urls=req.reference_image_urls,
        )
        return ImagePromptResponse(
            image_generation_prompt=str(result.image_generation_prompt),
            aspect_ratio=str(result.aspect_ratio),
            style_notes=str(result.style_notes),
            generated_image_url=getattr(result, "generated_image_url", None),
        )
    except Exception:
        logger.exception("Image prompter failed; returning mock fallback")
        return MOCK_IMAGE
